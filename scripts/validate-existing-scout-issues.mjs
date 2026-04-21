#!/usr/bin/env node
/**
 * 기존 Scout 이슈 일괄 검증 + 7점 미만 close
 *
 * node scripts/validate-existing-scout-issues.mjs           -- 검증 + close
 * node scripts/validate-existing-scout-issues.mjs --dry-run -- 검증만 (close 없음)
 */

import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const REPOS = [
  { id: "moneyflow",  repo: "Mino777/mino-moneyflow",  direction: `AI 트레이딩 분석 + 콘텐츠 자동화 SaaS. 13-에이전트 트레이딩 분석 파이프라인(9-phase), ETF 로테이션, 포트폴리오 리밸런싱, AI 블로그/유튜브 쇼츠 자동 생성(DALL-E), React + Supabase + Claude/GPT/Gemini API, Circuit Breaker/폴백/캐싱.` },
  { id: "tarosaju",   repo: "Mino777/mino-tarosaju",   direction: `AI 운세/일기 + 소셜 엔터테인먼트 앱(20-30대 여성). 타로 + 사주 + 심리테스트 + 궁합 매칭, Supabase Realtime 채팅, Next.js 16 + Framer Motion + Claude Haiku, LLM-as-Judge 품질 레이어.` },
  { id: "aidy",       repo: "Mino777/aidy-architect",  direction: `개인 AI 비서 — 대화 = 학습. Architect+Worker 오케스트레이션, Spring Boot 3.5 + Kotlin + PostgreSQL, 대화에서 자동 메모리 추출(7 카테고리), Spec-Driven Development, Work Order 시스템.` },
];

function fetchIssues(repo) {
  const raw = execSync(
    `gh issue list --repo "${repo}" --label "hub-dispatch" --search "🔭 [Scout]" --state open --limit 50 --json number,title,body`,
    { encoding: "utf-8" }
  );
  return JSON.parse(raw);
}

async function validateBatch(issues, projectDirection, model) {
  const issueList = issues.map((iss, i) =>
    `### 이슈 ${i} (번호: #${iss.number})
제목: ${iss.title}
본문:
${iss.body.slice(0, 800)}`
  ).join("\n\n---\n\n");

  const prompt = `아래 Scout 이슈들이 실제로 이 프로젝트에 가치 있는 작업인지 엄격하게 검증하세요.

## 프로젝트 방향성
${projectDirection}

## 이슈 목록 (${issues.length}개)

${issueList}

## 4가지 검증 질문 (각 이슈에 적용)

Q1 구체성: 이 기법을 적용할 **프로젝트 내 구체적인 파일명/모듈명/컴포넌트명**을 특정할 수 있는가?
Q2 신규성: 프로젝트에 이미 **동일하거나 유사한 기능이 존재**하지 않는가? (이미 있다면 NO)
Q3 임팩트: 성능/비용/UX에 **수치로 측정 가능한** 효과가 있는가?
Q4 실행성: 개발자가 **별도 리서치 없이 바로 착수** 가능한가?

score 기준: YES 4개=8~10, YES 3개=5~7, YES 2개 이하=1~4
pass 기준: score >= 7

## 응답 형식 (JSON 배열만, 마크다운 없이)

[
  {
    "issue_index": 0,
    "issue_number": 이슈번호,
    "q1": true/false,
    "q2": true/false,
    "q3": true/false,
    "q4": true/false,
    "score": 1~10,
    "pass": true/false,
    "reject_reason": "불합격 사유 한 줄 (pass=true면 빈 문자열)"
  }
]

애매하면 NO. 엄격하게 평가할 것.`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(text);
    } catch (err) {
      console.warn(`  ⚠️  Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

function closeIssue(repo, number, reason) {
  if (dryRun) {
    console.log(`  [DRY-RUN] Would close #${number}`);
    return;
  }
  try {
    execSync(
      `gh issue close ${number} --repo "${repo}" --comment "🤖 자동 검증 결과 기준 미달 (7점 미만) — ${reason}" --reason "not planned"`,
      { encoding: "utf-8", timeout: 15000 }
    );
    console.log(`  🗑️  Closed #${number}`);
  } catch (err) {
    console.error(`  ❌ Close failed for #${number}: ${err.message}`);
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error("❌ GEMINI_API_KEY not set"); process.exit(1); }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log(`🔍 기존 Scout 이슈 일괄 검증${dryRun ? " (DRY-RUN)" : ""}\n`);

  const summary = { total: 0, passed: 0, closed: 0 };

  for (const project of REPOS) {
    console.log(`\n📁 ${project.repo}`);
    console.log("─".repeat(50));

    const issues = fetchIssues(project.repo);
    if (issues.length === 0) { console.log("  이슈 없음"); continue; }

    console.log(`  ${issues.length}개 이슈 검증 중...\n`);
    summary.total += issues.length;

    // 배치 크기 8 (프롬프트 길이 제한)
    const BATCH = 8;
    for (let i = 0; i < issues.length; i += BATCH) {
      const batch = issues.slice(i, i + BATCH);
      let verdicts;
      try {
        verdicts = await validateBatch(batch, project.direction, model);
      } catch (err) {
        console.error(`  ❌ Validation error: ${err.message} — 이 배치 건너뜀`);
        continue;
      }

      for (const v of verdicts) {
        const issue = batch[v.issue_index];
        if (!issue) continue;

        const qs = [v.q1, v.q2, v.q3, v.q4].map((q) => (q ? "Y" : "N")).join("");
        const status = v.pass ? "✅ PASS" : "🚫 FAIL";
        console.log(`  ${status} #${issue.number} | ${qs} | ${v.score}/10 | ${issue.title.replace("🔭 [Scout] ", "")}`);
        if (!v.pass) console.log(`         └ ${v.reject_reason}`);

        if (v.pass) {
          summary.passed++;
        } else {
          closeIssue(project.repo, issue.number, v.reject_reason);
          summary.closed++;
        }
      }
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`📊 결과 요약`);
  console.log(`   전체: ${summary.total}개`);
  console.log(`   통과: ${summary.passed}개`);
  console.log(`   ${dryRun ? "삭제 예정" : "삭제됨"}: ${summary.closed}개`);
}

main().catch((err) => { console.error("❌ Fatal:", err); process.exit(1); });
