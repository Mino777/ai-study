#!/usr/bin/env node
/**
 * 긱뉴스 데일리 스카우트
 *
 * 매일 22:00 KST — 긱뉴스 RSS를 전체 스캔하여
 * 4개 프로젝트(ai-study, moneyflow, tarosaju, aidy) 방향성에
 * 맞는 기사를 찾고, 이식/반영 계획을 수립하여 각 레포에 hub-dispatch Issue 생성.
 *
 * 기존 curate-geeknews.mjs와 완전 별도 — 그쪽은 "1개 골라서 위키 엔트리 생성",
 * 이쪽은 "전체 스캔 → 프로젝트별 이식 계획 수립".
 *
 * 사용법:
 *   node scripts/scout-geeknews.mjs              — 스카우트 + Issue 생성
 *   node scripts/scout-geeknews.mjs --dry-run    — 스카우트만 (Issue 미생성)
 *
 * 환경변수:
 *   GEMINI_API_KEY  — Gemini API 키
 *   GITHUB_TOKEN    — GitHub Issue 생성용 (gh CLI 또는 API)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";

const FEED_URL = "https://news.hada.io/rss/news";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

// ─── 프로젝트 컨텍스트 ────────────────────────────────────────────
// 각 프로젝트 CLAUDE.md/SPEC.md에서 추출한 방향성 요약.
// Gemini 프롬프트에 주입되어 매칭 판단 기준이 된다.

const PROJECTS = [
  {
    id: "ai-study",
    repo: "Mino777/ai-study",
    name: "ai-study",
    direction: `AI 엔지니어링 학습 위키 + 포트폴리오.
- 하네스/컨텍스트/프롬프트 엔지니어링 방법론
- AI 에이전트, RAG, 토큰 최적화, LLM 활용 패턴
- Compound Engineering (자동 회고 + 솔루션 박제)
- JIT 검색 (로컬 임베딩 + 시맨틱 검색)
- Next.js 15 + MDX + Tailwind, Gemini 파이프라인
관심: AI 코딩 도구, 개발자 생산성, 에이전트 오케스트레이션, 토큰 경제학`,
  },
  {
    id: "moneyflow",
    repo: "Mino777/mino-moneyflow",
    name: "moneyflow",
    direction: `AI 트레이딩 분석 + 콘텐츠 자동화 SaaS.
- 13-에이전트 트레이딩 분석 파이프라인 (9-phase)
- ETF 로테이션, 포트폴리오 리밸런싱, 페이퍼 트레이딩
- AI 블로그/유튜브 쇼츠 자동 생성 (DALL-E)
- React + Supabase + Claude/GPT/Gemini API
- Circuit Breaker, 폴백, 캐싱 (ai-client.ts)
관심: 멀티 에이전트 오케스트레이션, 실시간 데이터 파이프라인, LLM 비용 최적화, 금융 AI`,
  },
  {
    id: "tarosaju",
    repo: "Mino777/mino-tarosaju",
    name: "tarosaju",
    direction: `AI 운세/일기 + 소셜 엔터테인먼트 앱 (20-30대 여성 타겟).
- 타로 + 사주 + 심리테스트 + 궁합 매칭
- 6-zone 테마 시스템, 22 메이저 아르카나 + 56 마이너 카드
- Supabase Realtime 실시간 채팅, QR 매칭
- Next.js 16 + Framer Motion + Claude Haiku
- LLM-as-Judge 품질 레이어
관심: UX/인터랙션, Supabase 실시간, LLM 비용 절감, 바이럴/공유 메커니즘, 점술 AI`,
  },
  {
    id: "aidy",
    repo: "Mino777/aidy-architect",
    name: "aidy (architect + server)",
    direction: `개인 AI 비서 — "대화 = 학습" 컨셉.
- Architect: 멀티플랫폼(iOS/Android/Server) 오케스트레이션 컨트롤 센터
- Server: Spring Boot 3.5 + Kotlin, PostgreSQL, Claude Haiku
- 대화에서 자동 메모리 추출 (7 카테고리), 위키식 리콜
- Spec-Driven Development, Work Order 시스템
- Architect-Worker 분리, 게이트 검증
관심: 대화형 AI, 메모리 시스템, Kotlin/Spring 패턴, 모바일 AI, SDD 방법론`,
  },
];

// ─── 1. RSS 피드 가져오기 ──────────────────────────────────────────

async function fetchGeekNews() {
  const res = await fetch(FEED_URL, {
    redirect: "follow",
    headers: { "User-Agent": "ai-study-scout-bot/1.0" },
  });

  if (!res.ok) {
    const fallbackRes = await fetch("http://feeds.feedburner.com/geeknews-feed", {
      headers: { "User-Agent": "ai-study-scout-bot/1.0" },
    });
    if (!fallbackRes.ok) throw new Error(`Feed fetch failed: ${fallbackRes.status}`);
    return fallbackRes.text();
  }
  return res.text();
}

function parseAtomFeed(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title =
      entry
        .match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1")
        .trim() || "";
    const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] || "";
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || "";
    const content =
      entry
        .match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1")
        .trim() || "";
    const description = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);

    if (title) {
      entries.push({ title, link, published, description });
    }
  }

  return entries;
}

// ─── 2. Gemini로 전체 스캔 + 프로젝트 매칭 (1차: 후보 추출) ────────

async function scoutArticles(articles, model) {
  const articleList = articles
    .slice(0, 30)
    .map((a, i) => `${i + 1}. [${a.title}] — ${a.description.slice(0, 300)}`)
    .join("\n");

  const projectDescriptions = PROJECTS.map(
    (p) => `### ${p.name} (${p.repo})\n${p.direction}`
  ).join("\n\n");

  const prompt = `당신은 기술 스카우터입니다. 긱뉴스 기사 목록을 보고, 아래 4개 프로젝트에 관련 있을 수 있는 기사를 찾아주세요.
이 단계는 **후보 추출**입니다. 심층 검증은 다음 단계에서 따로 합니다.

## 프로젝트 정보

${projectDescriptions}

## 긱뉴스 기사 목록

${articleList}

## 응답 형식

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드 펜스 없이).
매칭되는 기사가 없으면 빈 배열 \`[]\` 을 반환.
한 기사가 여러 프로젝트에 매칭될 수 있음.
**최대 8개까지만** 반환.

[
  {
    "article_index": 기사번호,
    "article_title": "기사 제목",
    "project_id": "ai-study | moneyflow | tarosaju | aidy",
    "relevance": "high | medium",
    "action_title": "이식 액션 제목 (한국어, 명령형, 예: 'Circuit Breaker 타임아웃 전략 개선')",
    "action_plan": "구체적 이식 계획 3-5줄. 어떤 파일/모듈에 무엇을 어떻게 변경할지. 기대 효과 포함.",
    "reason": "이 기사가 이 프로젝트에 왜 relevant한지 한 줄"
  }
]

주의:
- 단순 뉴스/발표 기사는 제외 (기술적 깊이가 있는 것만)
- "흥미롭지만 적용할 곳이 없는" 기사는 제외`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) throw new Error("Response is not an array");

      return parsed.filter(
        (m) =>
          typeof m.article_index === "number" &&
          m.project_id &&
          PROJECTS.some((p) => p.id === m.project_id) &&
          m.action_title &&
          m.action_plan
      );
    } catch (err) {
      console.warn(`⚠️  Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// ─── 2b. 2차 검증: 후보를 4문항 게이트로 개별 심층 평가 ──────────

async function validateMatches(candidates, articles, model) {
  if (candidates.length === 0) return [];

  const candidateList = candidates.map((m, i) => {
    const article = articles[m.article_index - 1];
    const project = PROJECTS.find((p) => p.id === m.project_id);
    return `### 후보 ${i + 1}: [${m.project_id}] ${m.action_title}
기사: ${article?.title || m.article_title}
기사 내용: ${article?.description?.slice(0, 400) || ""}
프로젝트 방향: ${project?.direction || ""}
제안 계획: ${m.action_plan}`;
  }).join("\n\n---\n\n");

  const prompt = `아래 ${candidates.length}개 스카우트 후보를 각각 엄격하게 검증하세요.
각 후보가 실제로 이슈를 생성할 가치가 있는지 4개 질문으로 판단합니다.

${candidateList}

## 4가지 검증 질문 (각 후보에 적용)

Q1 구체성: 이 기법을 적용할 **프로젝트 내 구체적인 파일명/모듈명/컴포넌트명**을 하나라도 특정할 수 있는가?
   (단순히 "가능하다"가 아니라 실제로 어떤 파일인지 생각했을 때 떠오르는가)

Q2 신규성: 프로젝트 방향성 설명에 이미 **동일하거나 유사한 기능이 명시**되어 있지 않은가?
   (이미 구현된/계획된 것이면 NO)

Q3 임팩트: 성능/비용/사용자 경험에 **수치나 체감으로 측정 가능한** 효과가 있는가?
   ("좋아질 것 같다"가 아닌 "N% 절감" 또는 "응답속도 Xms 감소" 수준)

Q4 실행성: 이 이슈를 받은 개발자가 **별도 리서치 없이 바로 착수**할 수 있는가?
   (더 조사해야 한다면 NO)

## 응답 형식 (JSON만, 마크다운 없이)

[
  {
    "candidate_index": 0,
    "q1": true/false,
    "q2": true/false,
    "q3": true/false,
    "q4": true/false,
    "score": 1~10,
    "pass": true/false,
    "reject_reason": "불합격 사유 한 줄 (pass=true면 빈 문자열)"
  }
]

score 기준: YES 4개=8~10, YES 3개=5~7, YES 2개 이하=1~4
pass 기준: score >= 6 (YES 3개 이상이더라도 핵심 Q1·Q4가 NO면 pass=false 가능)
엄격하게 평가할 것 — 애매하면 NO.`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const verdicts = JSON.parse(text);

      if (!Array.isArray(verdicts)) throw new Error("Response is not an array");

      const passed = [];
      for (const v of verdicts) {
        const candidate = candidates[v.candidate_index];
        if (!candidate) continue;

        const status = v.pass ? "✅ PASS" : "🚫 FAIL";
        const qs = [v.q1, v.q2, v.q3, v.q4].map((q) => (q ? "Y" : "N")).join("");
        console.log(
          `   ${status} [${candidate.project_id}] ${candidate.action_title}`
        );
        console.log(`      Q1~4: ${qs} | 점수: ${v.score}/10${v.reject_reason ? ` | ${v.reject_reason}` : ""}`);

        if (v.pass) passed.push({ ...candidate, validation_score: v.score });
      }

      return passed;
    } catch (err) {
      console.warn(`⚠️  Validation attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === 2) {
        console.warn("⚠️  검증 실패 — 1차 후보를 그대로 사용합니다.");
        return candidates;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// ─── Gemini 클라이언트 초기화 ──────────────────────────────────────

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return {
    fast: genAI.getGenerativeModel({ model: "gemini-2.5-flash" }),
    pro: genAI.getGenerativeModel({ model: "gemini-2.5-pro" }),
  };
}

// ─── 3. GitHub Issue 생성 ──────────────────────────────────────────

function createIssue(match, article) {
  const project = PROJECTS.find((p) => p.id === match.project_id);
  if (!project) return;

  const today = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const title = `🔭 [Scout] ${match.action_title}`;
  const body = `## 긱뉴스 스카우트 — ${today}

### 원본 기사
- **제목**: ${article.title}
- **링크**: ${article.link}
- **관련도**: ${match.relevance}

### 왜 이 프로젝트에 relevant한가
${match.reason}

### 이식/반영 계획
${match.action_plan}

---
> 🤖 자동 생성 by \`scout-geeknews.mjs\` — 긱뉴스 데일리 스카우트`;

  if (dryRun) {
    console.log(`   [DRY-RUN] Would create issue in ${project.repo}`);
    console.log(`   Title: ${title}`);
    console.log(`   Body preview: ${body.slice(0, 200)}...\n`);
    return;
  }

  try {
    const result = execSync(
      `gh issue create --repo "${project.repo}" --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}" --label "hub-dispatch"`,
      { encoding: "utf-8", timeout: 30000 }
    );
    console.log(`   ✅ Issue created in ${project.repo}: ${result.trim()}`);
  } catch (err) {
    console.error(`   ❌ Issue creation failed for ${project.repo}: ${err.message}`);
  }
}

// ─── 4. 리포트 생성 (GitHub Actions Summary) ──────────────────────

function generateSummary(matches, articles) {
  if (matches.length === 0) {
    return "## 🔭 긱뉴스 데일리 스카우트\n\n오늘은 프로젝트에 이식할 만한 기사가 없습니다.";
  }

  let summary = "## 🔭 긱뉴스 데일리 스카우트\n\n";
  summary += `| 프로젝트 | 기사 | 액션 | 관련도 | 검증점수 |\n|---|---|---|---|---|\n`;

  for (const m of matches) {
    const article = articles[m.article_index - 1];
    const articleTitle = article ? article.title : m.article_title;
    const score = m.validation_score != null ? `${m.validation_score}/10` : "-";
    summary += `| ${m.project_id} | ${articleTitle} | ${m.action_title} | ${m.relevance} | ${score} |\n`;
  }

  return summary;
}

// ─── 5. Main ──────────────────────────────────────────────────────

async function main() {
  console.log("🔭 긱뉴스 데일리 스카우트 시작...\n");

  // 1. RSS 가져오기
  console.log("1️⃣ RSS 피드 가져오는 중...");
  const xml = await fetchGeekNews();
  const articles = parseAtomFeed(xml);
  console.log(`   ${articles.length}개 기사 파싱 완료\n`);

  if (articles.length === 0) {
    console.log("ℹ️ 기사를 찾을 수 없습니다. 종료.");
    process.exit(0);
  }

  const { fast: fastModel, pro: proModel } = initGemini();

  // 2. 1차: 후보 추출 (최대 8개)
  console.log("2️⃣ [1차] Gemini로 후보 추출 중...");
  let candidates;
  try {
    candidates = await scoutArticles(articles, fastModel);
  } catch {
    console.log("   Flash 실패 → Pro로 재시도...");
    candidates = await scoutArticles(articles, proModel);
  }
  console.log(`   📋 후보 ${candidates.length}개 추출\n`);

  if (candidates.length === 0) {
    console.log("ℹ️ 오늘은 후보 기사가 없습니다.");
    writeOutputs([], articles);
    return;
  }

  // 3. 2차: 4문항 게이트 검증
  console.log("3️⃣ [2차] 후보별 심층 검증 중...\n");
  const matches = await validateMatches(candidates, articles, fastModel);
  // 점수 높은 순 정렬, 최대 5개
  matches.sort((a, b) => (b.validation_score ?? 0) - (a.validation_score ?? 0));
  const finalMatches = matches.slice(0, 5);

  console.log(`\n   ✅ 최종 통과: ${finalMatches.length}개 / 후보 ${candidates.length}개\n`);

  if (finalMatches.length === 0) {
    console.log("ℹ️ 오늘은 검증 통과 기사가 없습니다.");
    writeOutputs([], articles);
    return;
  }

  // 4. 결과 출력
  console.log("4️⃣ 최종 결과:\n");
  for (const m of finalMatches) {
    const article = articles[m.article_index - 1];
    console.log(`   📰 [${m.project_id}] ${m.action_title} (점수: ${m.validation_score ?? "-"}/10)`);
    console.log(`      기사: ${article?.title || m.article_title}`);
    console.log(`      이유: ${m.reason}`);
    console.log();
  }

  // 5. Issue 생성
  console.log("5️⃣ GitHub Issue 생성 중...\n");
  for (const m of finalMatches) {
    const article = articles[m.article_index - 1];
    if (article) createIssue(m, article);
  }

  writeOutputs(finalMatches, articles);
  console.log("\n✅ 스카우트 완료!");
}

function writeOutputs(matches, articles) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `match_count=${matches.length}\n`);
    const projectIds = [...new Set(matches.map((m) => m.project_id))].join(",");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `matched_projects=${projectIds}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, generateSummary(matches, articles));
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
