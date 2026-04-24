#!/usr/bin/env node
// Skillify Step 5 씨드 공급원 — "fucking shit" / 한국어 실패 순간 추출기
// ──────────────────────────────────────────────────────────────────────
// Garry Tan 원문 휴리스틱:
//   "The most honest eval heuristic I've found: search your conversation
//    history for when you said 'fucking shit' or 'wtf.' Those are the
//    test cases you're missing."
//
// 동작:
//   1) ~/.claude/projects/*/ 아래 JSONL 세션 transcript 전수 스캔
//   2) 각 user 메시지에 대해 frustration 패턴 매치
//   3) 매치 순간의 [직전 assistant turn 요약 + 직후 사용자 지시]를
//      컨텍스트로 함께 추출
//   4) 패턴 가중치 × 발생 횟수로 정렬
//   5) 상위 N개를 markdown으로 출력 — resolver eval intent 씨드로 그대로 사용 가능
//
// 의도적으로 단순: LLM 없음. 정규식 + 가중치만. 결과물은 사람이 다듬는다.
//
// CLI:
//   node scripts/extract-failure-moments.mjs
//   node scripts/extract-failure-moments.mjs --since 2026-04-01
//   node scripts/extract-failure-moments.mjs --project -Users-jominho-Develop-ai-study
//   node scripts/extract-failure-moments.mjs --limit 30 --json

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

const args = process.argv.slice(2);
const flags = {
  projectsRoot: join(homedir(), ".claude", "projects"),
  projectFilter: null,
  since: null,
  limit: 20,
  json: false,
  contextTurns: 1,
  maxLen: 500, // 긴 메시지(PR review 템플릿, 인용 등)는 false positive로 필터
};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--project") flags.projectFilter = args[++i];
  else if (a === "--since") flags.since = args[++i];
  else if (a === "--limit") flags.limit = parseInt(args[++i], 10);
  else if (a === "--json") flags.json = true;
  else if (a === "--context") flags.contextTurns = parseInt(args[++i], 10);
  else if (a === "--projects-root") flags.projectsRoot = args[++i];
  else if (a === "--max-length") flags.maxLen = parseInt(args[++i], 10);
  else if (a === "--help" || a === "-h") {
    console.log(`
Skillify Step 5 씨드 추출기

사용법: extract-failure-moments [옵션]

옵션:
  --project <slug>       특정 프로젝트 디렉토리만 (예: -Users-jominho-Develop-ai-study)
  --since <YYYY-MM-DD>   이 날짜 이후 매치만
  --limit <N>            출력 상위 N건 (기본 20)
  --context <N>          매치 직전 assistant turn N개 포함 (기본 1)
  --json                 JSON 출력 (사람용 markdown 대신)
  --projects-root <path> 세션 루트 재정의 (기본 ~/.claude/projects)

출력: Resolver eval 케이스 씨드 마크다운. 각 케이스는 (a) 실패 intent,
(b) 그때 에이전트가 어디에 걸렸는지, (c) 골든 skill 제안.
`);
    process.exit(0);
  }
}

// ── 패턴 + 가중치 ─────────────────────────────────────────────────────
// 가중치가 클수록 "신호가 강한" frustration (단순 재질문보다 욕설이 가중).
// 부호 구분: 욕설(high) vs 재시도 요청(mid) vs 어휘 confirmation(low).
const PATTERNS = [
  // high (진짜 짜증)
  { re: /fucking\s+(shit|hell|god)/i, w: 10, tag: "EN:curse-hard" },
  { re: /\bwtf\b|what the fuck/i, w: 9, tag: "EN:wtf" },
  { re: /\b(goddamn|god damn)\b/i, w: 9, tag: "EN:curse" },
  { re: /씨발|ㅅㅂ|시발/, w: 10, tag: "KR:curse-hard" },
  { re: /존나\s*(안|못|이상|짜증)/, w: 9, tag: "KR:curse-emphasis" },
  { re: /(아|아니)\s*진짜\s*(왜|뭐|안)/, w: 7, tag: "KR:진짜-frustration" },

  // mid (실패/혼란)
  { re: /\b(ugh|oof|argh)\b/i, w: 5, tag: "EN:groan" },
  { re: /\b(not working|still broken|again|still fails)\b/i, w: 6, tag: "EN:still-broken" },
  { re: /(이게\s*왜|왜\s*안(\s*돼|\s*되))/, w: 7, tag: "KR:why-broken" },
  { re: /(아니|어)\s*이게\s*(뭐|왜)/, w: 7, tag: "KR:anigeh" },
  { re: /(짜증|빡친|빡쳐|답답)/, w: 6, tag: "KR:frustration" },
  { re: /(다시|또)\s*(해|돌려|실행)/, w: 4, tag: "KR:retry" },
  { re: /안\s*(돼|되)\s*(잖아|네)?/, w: 5, tag: "KR:does-not-work" },

  // low (힌트)
  { re: /\b(no|wait|hold on|stop)\b[,.!]/i, w: 3, tag: "EN:stop" },
  { re: /(잠깐|잠시만|멈춰|그만)/, w: 3, tag: "KR:pause" },
];

// ── 날짜 필터 ─────────────────────────────────────────────────────────
const sinceTs = flags.since ? Date.parse(flags.since + "T00:00:00Z") : null;

// ── JSONL 순회 ────────────────────────────────────────────────────────
const projectDirs = existsSync(flags.projectsRoot)
  ? readdirSync(flags.projectsRoot)
      .filter((d) => !flags.projectFilter || d === flags.projectFilter)
      .map((d) => join(flags.projectsRoot, d))
      .filter((p) => {
        try {
          return statSync(p).isDirectory();
        } catch {
          return false;
        }
      })
  : [];

const extractTextFromMessage = (msg) => {
  if (!msg) return "";
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .map((c) => (typeof c === "string" ? c : c.text || c.content || ""))
      .filter(Boolean)
      .join(" ");
  }
  return "";
};

const matches = [];
let totalSessions = 0;
let totalUserMsgs = 0;

for (const projectDir of projectDirs) {
  const projectSlug = basename(projectDir);
  const files = readdirSync(projectDir).filter((f) => f.endsWith(".jsonl"));
  for (const file of files) {
    totalSessions++;
    const sessionPath = join(projectDir, file);
    const sessionId = basename(file, ".jsonl");

    let content;
    try {
      content = readFileSync(sessionPath, "utf8");
    } catch {
      continue;
    }

    // 스트리밍 대신 한 번에 로드 (세션 파일은 보통 수 MB 이하)
    const lines = content.split("\n").filter(Boolean);
    const turns = [];
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === "user" || obj.type === "assistant") turns.push(obj);
      } catch {
        /* skip malformed */
      }
    }

    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      if (t.type !== "user") continue;
      totalUserMsgs++;

      const text = extractTextFromMessage(t.message);
      if (!text || text.length < 2) continue;
      // 긴 메시지는 PR review 템플릿 / 인용 / 붙여넣은 아티클 — false positive 다수
      if (text.length > flags.maxLen) continue;
      // 하네스가 주입한 시스템 메시지는 유저 발화가 아님 — frustration 신호 아님
      const trimmed = text.trimStart();
      if (trimmed.startsWith("<tool_use_error>")) continue;
      if (trimmed.startsWith("<system-reminder>")) continue;
      if (trimmed.startsWith("<command-")) continue;
      if (trimmed.startsWith("<local-command-")) continue;
      if (trimmed.startsWith("[Request interrupted")) continue;

      // 날짜 필터 (timestamp가 있으면)
      if (sinceTs) {
        const ts = t.timestamp ? Date.parse(t.timestamp) : null;
        if (ts && ts < sinceTs) continue;
      }

      // 패턴 매치
      let hit = null;
      for (const p of PATTERNS) {
        if (p.re.test(text)) {
          hit = p;
          break; // 가중치 높은 것부터라 첫 매치만
        }
      }
      if (!hit) continue;

      // 컨텍스트 수집: 직전 assistant turn
      const priorAssistant = [];
      for (let k = i - 1; k >= 0 && priorAssistant.length < flags.contextTurns; k--) {
        if (turns[k].type === "assistant") {
          const asText = extractTextFromMessage(turns[k].message);
          if (asText) priorAssistant.unshift(asText.slice(0, 200));
        }
      }

      matches.push({
        sessionId,
        project: projectSlug,
        timestamp: t.timestamp || null,
        weight: hit.w,
        tag: hit.tag,
        userSnippet: text.slice(0, 300),
        priorAssistant,
      });
    }
  }
}

// ── 정렬 + 중복 제거 ─────────────────────────────────────────────────
// 같은 user 텍스트 앞 80자로 중복 제거
const seen = new Set();
matches.sort((a, b) => b.weight - a.weight || (b.timestamp || "").localeCompare(a.timestamp || ""));
const unique = [];
for (const m of matches) {
  const key = m.userSnippet.slice(0, 80);
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(m);
  if (unique.length >= flags.limit) break;
}

// ── 출력 ──────────────────────────────────────────────────────────────
if (flags.json) {
  console.log(
    JSON.stringify(
      {
        scanned: { sessions: totalSessions, userMessages: totalUserMsgs, matches: matches.length },
        top: unique,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`# Failure Moments — ${new Date().toISOString().slice(0, 10)} 추출`);
  console.log();
  console.log(
    `스캔: ${totalSessions} 세션 / ${totalUserMsgs} user 메시지 / ${matches.length} 매치 / 상위 ${unique.length}건 출력`,
  );
  if (flags.since) console.log(`기간: ${flags.since} 이후`);
  console.log();
  console.log("각 항목은 **resolver eval intent 씨드 후보**다. 사람이 다음을 결정:");
  console.log("1. 실제 frustration인지 (false positive 걷기)");
  console.log("2. 어떤 skill이 발동됐어야 했는지");
  console.log("3. 이 텍스트를 clean intent로 다듬어 golden set에 투입");
  console.log();

  for (let i = 0; i < unique.length; i++) {
    const m = unique[i];
    console.log(`## ${i + 1}. [${m.tag}] weight=${m.weight}`);
    console.log();
    if (m.timestamp) console.log(`- 시간: ${m.timestamp}`);
    console.log(`- 프로젝트: \`${m.project}\``);
    console.log(`- 세션: \`${m.sessionId}\``);
    console.log();
    console.log("**유저 발화:**");
    console.log("```");
    console.log(m.userSnippet);
    console.log("```");
    if (m.priorAssistant.length > 0) {
      console.log();
      console.log("**직전 assistant (발췌):**");
      console.log("```");
      console.log(m.priorAssistant.join("\n---\n"));
      console.log("```");
    }
    console.log();
    console.log(`**→ 제안할 eval 케이스**:`);
    console.log(`- 예상 skill: (사람 판단)`);
    console.log(`- clean intent: (위 발화를 욕설 제거하고 정리)`);
    console.log();
  }
}
