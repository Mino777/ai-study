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

// ─── 2. Gemini로 전체 스캔 + 프로젝트 매칭 ────────────────────────

async function scoutArticles(articles) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"];
  let model = genAI.getGenerativeModel({ model: MODELS[0] });

  const articleList = articles
    .slice(0, 30)
    .map((a, i) => `${i + 1}. [${a.title}] — ${a.description.slice(0, 300)}`)
    .join("\n");

  const projectDescriptions = PROJECTS.map(
    (p) => `### ${p.name} (${p.repo})\n${p.direction}`
  ).join("\n\n");

  const prompt = `당신은 기술 스카우터입니다. 긱뉴스 기사 목록을 보고, 아래 4개 프로젝트에 **실제로 이식/반영할 수 있는** 기사를 찾아주세요.

## 프로젝트 정보

${projectDescriptions}

## 긱뉴스 기사 목록

${articleList}

## 평가 기준 (모두 AND 조건)

1. **구체적 적용 가능**: 해당 프로젝트의 기존 코드/아키텍처에 구체적으로 적용 가능한 변경이 있는가?
2. **즉시 실행 가능**: 추가 리서치 없이 바로 작업에 착수할 수 있는가?
3. **측정 가능한 효과**: 성능, 비용, 안정성, UX 등 효과를 측정할 수 있는가?

## 응답 형식

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드 펜스 없이).
매칭되는 기사가 없으면 빈 배열 \`[]\` 을 반환.
한 기사가 여러 프로젝트에 매칭될 수 있음.
**최대 5개까지만** 반환 (가장 임팩트 큰 순서).

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
- "흥미롭지만 적용할 곳이 없는" 기사는 제외
- 억지로 매칭하지 말 것 — 3 조건 AND를 엄격히 적용
- relevance: high = 즉시 착수 권장, medium = 다음 스프린트에 고려`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        throw new Error("Response is not an array");
      }

      // 유효성 검증
      const valid = parsed.filter(
        (m) =>
          typeof m.article_index === "number" &&
          m.project_id &&
          PROJECTS.some((p) => p.id === m.project_id) &&
          m.action_title &&
          m.action_plan
      );

      return valid;
    } catch (err) {
      console.warn(`⚠️  Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === 0) {
        model = genAI.getGenerativeModel({ model: MODELS[1] });
        console.log(`🔄 Switching to: ${MODELS[1]}`);
      }
      if (attempt === 2) {
        console.error("❌ All retries failed");
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
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
  summary += `| 프로젝트 | 기사 | 액션 | 관련도 |\n|---|---|---|---|\n`;

  for (const m of matches) {
    const article = articles[m.article_index - 1];
    const articleTitle = article ? article.title : m.article_title;
    summary += `| ${m.project_id} | ${articleTitle} | ${m.action_title} | ${m.relevance} |\n`;
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

  // 2. Gemini로 전체 스캔
  console.log("2️⃣ Gemini로 프로젝트 매칭 중...");
  const matches = await scoutArticles(articles);
  console.log(`\n   📊 ${matches.length}개 매칭 발견\n`);

  if (matches.length === 0) {
    console.log("ℹ️ 오늘은 이식할 만한 기사가 없습니다.");
    // GitHub Actions summary
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        generateSummary([], articles)
      );
    }
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, "match_count=0\n");
    }
    return;
  }

  // 3. 결과 출력
  console.log("3️⃣ 매칭 결과:\n");
  for (const m of matches) {
    const article = articles[m.article_index - 1];
    console.log(`   📰 [${m.project_id}] ${m.action_title}`);
    console.log(`      기사: ${article?.title || m.article_title}`);
    console.log(`      관련도: ${m.relevance}`);
    console.log(`      이유: ${m.reason}`);
    console.log(`      계획: ${m.action_plan.split("\n")[0]}...`);
    console.log();
  }

  // 4. Issue 생성
  console.log("4️⃣ GitHub Issue 생성 중...\n");
  for (const m of matches) {
    const article = articles[m.article_index - 1];
    if (article) {
      createIssue(m, article);
    }
  }

  // 5. GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `match_count=${matches.length}\n`);
    const projectIds = [...new Set(matches.map((m) => m.project_id))].join(",");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `matched_projects=${projectIds}\n`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      generateSummary(matches, articles)
    );
  }

  console.log("\n✅ 스카우트 완료!");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
