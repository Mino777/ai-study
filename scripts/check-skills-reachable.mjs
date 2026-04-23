#!/usr/bin/env node
// Skillify Step 8: check-resolvable + DRY audit
// ──────────────────────────────────────────────────────────────────────
// 각 프로젝트에 대해 다음 세 부류가 정합적인지 대조한다:
//   1) 로컬 .claude/commands/<slug>.md        — 프로젝트 전용 skill
//   2) 글로벌 ~/.claude/commands/<slug>.md    — 사용자 전용 skill
//   3) CLAUDE.md "## Skill routing" 섹션      — intent → invoke <slug> 매핑
//
// 감지하는 것:
//   • unreachable  : 로컬 skill 파일은 있는데 라우팅 섹션에 언급 없음 (dark)
//   • orphan       : 라우팅에는 있는데 로컬/글로벌 어디에도 파일 없음 (깨진 링크)
//   • missing-section : CLAUDE.md에 Skill routing 섹션 자체가 없음 (100% dark)
//
// 기본값은 현재 프로젝트 대상. --project <path> 로 타 프로젝트 감사 가능.
// --json 출력 → CI 연동용.
//
// exit code:
//   0 : 정합 (unreachable + orphan 0건)
//   1 : 최소 1건 mismatch
//   2 : missing Skill routing section
//   3 : 사용자 인자 오류

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

const args = process.argv.slice(2);
const flags = {
  project: process.cwd(),
  json: false,
  globalCommands: join(homedir(), ".claude", "commands"),
  globalSkills: join(homedir(), ".claude", "skills"),
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--project") flags.project = args[++i];
  else if (args[i] === "--json") flags.json = true;
  else if (args[i] === "--global-commands") flags.globalCommands = args[++i];
  else if (args[i] === "--global-skills") flags.globalSkills = args[++i];
  else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
사용법: check-skills-reachable [--project <path>] [--json]

옵션:
  --project <path>          감사 대상 프로젝트 루트 (기본: cwd)
  --global-commands <path>  글로벌 commands dir (기본: ~/.claude/commands)
  --global-skills   <path>  글로벌 skills dir   (기본: ~/.claude/skills)
  --json                    machine-readable 출력 (CI 연동)

exit: 0=정합 | 1=mismatch | 2=missing-section | 3=args-error
`);
    process.exit(0);
  } else {
    console.error(`알 수 없는 인자: ${args[i]}`);
    process.exit(3);
  }
}

// ── 1) 로컬 skill 파일 수집 ────────────────────────────────────────────
const localDir = join(flags.project, ".claude", "commands");
const localSkills = existsSync(localDir)
  ? readdirSync(localDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => basename(f, ".md"))
      .sort()
  : [];

// ── 2) 글로벌 skill 수집 ───────────────────────────────────────────────
// 두 소스:
//  a) ~/.claude/commands/*.md              — user-scope 슬래시 커맨드
//  b) ~/.claude/skills/<slug>/SKILL.md     — gstack/플러그인 번들 skill (dir)
const globalSkills = new Set();
const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
if (isDir(flags.globalCommands)) {
  for (const f of readdirSync(flags.globalCommands)) {
    if (f.endsWith(".md")) globalSkills.add(basename(f, ".md"));
  }
}
if (isDir(flags.globalSkills)) {
  for (const f of readdirSync(flags.globalSkills)) {
    const p = join(flags.globalSkills, f);
    if (isDir(p) && existsSync(join(p, "SKILL.md"))) {
      globalSkills.add(f);
    }
  }
}

// ── 3) CLAUDE.md에서 "## Skill routing" 섹션의 invoke 대상 추출 ───────
const claudeMdPath = join(flags.project, "CLAUDE.md");
const claudeMd = existsSync(claudeMdPath) ? readFileSync(claudeMdPath, "utf8") : "";

// 라인 단위로 걷는다: `## Skill routing` 이 시작하는 *행*을 기준으로
// 그 뒤에 나오는 첫 `## ` 이전까지를 섹션으로 삼는다. 정규식 단일 패스보다
// 단순/안정 — 본문에 인라인 코드로 `## Skill routing` 같은 문자열이 있어도
// BOL(`^`)이 아니면 무시된다.
const lines = claudeMd.split("\n");
let sectionStart = -1;
let sectionEnd = lines.length;
for (let i = 0; i < lines.length; i++) {
  if (/^##\s+Skill\s+routing\b/i.test(lines[i])) {
    sectionStart = i;
    break;
  }
}
if (sectionStart >= 0) {
  for (let j = sectionStart + 1; j < lines.length; j++) {
    if (/^##\s+/.test(lines[j])) {
      sectionEnd = j;
      break;
    }
  }
}
const sectionText = sectionStart >= 0 ? lines.slice(sectionStart, sectionEnd).join("\n") : "";
const hasSection = sectionStart >= 0;

// `→ invoke <slug>` 또는 `-> invoke <slug>` 패턴에서 slug만 뽑는다.
// slug는 소문자 + 영숫자 + 하이픈만.
const invokeRegex = /(?:→|->)\s*invoke\s+([a-z][a-z0-9-]*)/gi;
const routed = new Set();
if (hasSection) {
  let m;
  while ((m = invokeRegex.exec(sectionText)) !== null) {
    routed.add(m[1]);
  }
}

// ── 4) 진단: unreachable / orphan ──────────────────────────────────────
const unreachable = localSkills.filter((s) => !routed.has(s));
const orphan = [...routed].filter(
  (s) => !localSkills.includes(s) && !globalSkills.has(s),
);

const report = {
  project: flags.project,
  hasSection,
  counts: {
    local: localSkills.length,
    global: globalSkills.size,
    routed: routed.size,
    unreachable: unreachable.length,
    orphan: orphan.length,
  },
  unreachable,
  orphan,
  localSkills,
  routedSkills: [...routed].sort(),
};

// ── 5) 출력 ───────────────────────────────────────────────────────────
if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const name = basename(flags.project);
  console.log(`\n📋 Skills reachability — ${name}`);
  console.log(`   로컬 ${localSkills.length} / 글로벌 ${globalSkills.size} / 라우팅 ${routed.size}`);

  if (!hasSection) {
    console.log(`\n❌ CLAUDE.md에 "## Skill routing" 섹션 없음`);
    console.log(`   로컬 skill ${localSkills.length}개가 모두 dark 상태 (Claude가 언제 invoke할지 모름)`);
    if (localSkills.length > 0) {
      console.log(`   로컬 skill 목록:`);
      for (const s of localSkills) console.log(`     - ${s}`);
    }
  }

  if (unreachable.length > 0) {
    console.log(`\n🔴 UNREACHABLE (${unreachable.length}) — 파일 있으나 라우팅 없음:`);
    for (const s of unreachable) console.log(`   - ${s}`);
  }

  if (orphan.length > 0) {
    console.log(`\n🟡 ORPHAN (${orphan.length}) — 라우팅에는 있으나 파일 없음:`);
    for (const s of orphan) console.log(`   - ${s}`);
  }

  if (hasSection && unreachable.length === 0 && orphan.length === 0) {
    console.log(`\n✅ 정합 — unreachable 0, orphan 0`);
  }
}

// ── 6) exit code ──────────────────────────────────────────────────────
if (!hasSection) process.exit(2);
if (unreachable.length > 0 || orphan.length > 0) process.exit(1);
process.exit(0);
