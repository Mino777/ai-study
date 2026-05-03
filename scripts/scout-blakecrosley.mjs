#!/usr/bin/env node
/**
 * Blake Crosley 블로그 스카우트
 *
 * 매일 22:30 KST — Blake Crosley의 /writing + /guides 페이지를 스캔하여
 * ai-study 위키에 엔트리화할 만한 새 글을 찾고, Gemini로 요약 분석 후
 * hub-dispatch Issue 생성.
 *
 * Blake Crosley: iOS + AI + Harness Engineering 전문.
 * 기존 harness-engineering/delightroom-alarmy-claude-code-workflow 등
 * 이미 이 블로그 기반 엔트리가 있으므로 중복 방지 필수.
 *
 * 사용법:
 *   node scripts/scout-blakecrosley.mjs              — 스카우트 + Issue 생성
 *   node scripts/scout-blakecrosley.mjs --dry-run    — 스카우트만 (Issue 미생성)
 *
 * 환경변수:
 *   GEMINI_API_KEY  — Gemini API 키
 *   GITHUB_TOKEN    — GitHub Issue 생성용
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";

const WRITING_URL = "https://blakecrosley.com/writing";
const GUIDES_URL = "https://blakecrosley.com/guides";
const SEEN_FILE = path.resolve("data/scout-blakecrosley-seen.json");
const REPO = "Mino777/ai-study";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

// ─── ai-study 위키 방향성 (스카우트 매칭 기준) ──────────────────

const PROJECT_DIRECTION = `AI 엔지니어링 학습 위키 + 포트폴리오.
핵심 관심사 (HIGH PRIORITY):
- 하네스 엔지니어링: AI 에이전트 오케스트레이션, 툴 체인, 컨텍스트 관리, CLAUDE.md, hooks, skills
- 방법론/패턴: Compound Engineering, Spec-Driven Dev, 코드 게이트, 솔루션 박제
- LLM 실용 기법: 프롬프트 엔지니어링, 토큰 최적화, 비용 절감, RAG, 임베딩
- 에이전트 시스템: 멀티 에이전트 오케스트레이션, 자율 에이전트, tool use, MCP
- iOS + AI: Apple Intelligence, on-device ML, CoreML, XcodeBuildMCP, Swift AI 패턴
- 개발자 생산성: AI 코딩 도구, JIT 검색, 컨텍스트 압축, CI/CD 자동화

비관심사 (LOW PRIORITY — 매칭 제외):
- 순수 인프라/하드웨어 (GPU, 서버 스펙)
- 비 AI 관련 프론트엔드/CSS
- 일반 블로그 글 (기술적 깊이 없는 에세이)`;

// ─── 1. HTML 스크래핑 ────────────────────────────────────────────

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "ai-study-scout-bot/1.0" },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${url} → ${res.status}`);
  return res.text();
}

function extractPosts(html, baseUrl) {
  const posts = [];
  // <a href="/blog/..." or <a href="/guides/..."
  const linkRegex = /<a[^>]*href="(\/(?:blog|guides)\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const seen = new Set();

  while ((match = linkRegex.exec(html)) !== null) {
    const path = match[1];
    if (seen.has(path)) continue;
    seen.add(path);

    // Extract text content from anchor
    const text = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text || text.length < 5) continue;

    posts.push({
      url: `https://blakecrosley.com${path}`,
      title: text.split("\n")[0].trim().slice(0, 120),
      path,
    });
  }

  return posts;
}

// ─── 2. 이미 처리한 글 관리 ──────────────────────────────────────

function loadSeen() {
  try {
    return JSON.parse(fs.readFileSync(SEEN_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveSeen(seen) {
  fs.mkdirSync(path.dirname(SEEN_FILE), { recursive: true });
  fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
}

// ─── 3. Gemini로 새 글 분석 + 엔트리 후보 추출 ──────────────────

async function analyzeNewPosts(posts, model) {
  if (posts.length === 0) return [];

  const postList = posts
    .map((p, i) => `${i + 1}. [${p.title}](${p.url})`)
    .join("\n");

  const prompt = `당신은 AI 엔지니어링 위키 큐레이터입니다.
Blake Crosley 블로그의 새 글 목록을 보고, ai-study 위키에 엔트리화할 가치가 있는 글을 선별해주세요.

## 위키 방향성
${PROJECT_DIRECTION}

## 새 글 목록
${postList}

## 선별 기준
- 기술적 깊이가 있는가 (코드, 아키텍처, 패턴 설명)
- ai-study 위키의 카테고리에 매칭되는가 (harness-engineering, ios-ai, agents, context-engineering, prompt-engineering 등)
- 이미 위키에 있을 법한 일반론이 아닌 새로운 관점/패턴인가

## 품질 가드 (중요)
1. **실측 기반**: 원문이 실제 코드/사례를 기반으로 하는가. 추측만 있으면 제외.
2. **프로젝트 적용 가능성**: ai-study/moneyflow/tarosaju/aidy 중 하나에 실제로 적용할 수 있는 내용인가.
3. **중복 방지**: 기존 위키에 이미 있는 주제를 반복하지 않는가.
4. **Slug 규칙**: suggested_slug는 영문 kebab-case, 40자 이내, SEO용 키워드 나열 금지.

## 응답 형식 (JSON만, 마크다운 없이)
[
  {
    "post_index": 글번호,
    "post_title": "글 제목",
    "post_url": "URL",
    "relevance": "high | medium",
    "suggested_category": "harness-engineering | ios-ai | agents | context-engineering | prompt-engineering | infrastructure | evaluation",
    "suggested_slug": "english-kebab-case-slug",
    "entry_title": "위키 엔트리 제목 (한국어)",
    "summary": "이 글의 핵심 내용 3줄 요약",
    "reason": "왜 위키 엔트리로 만들 가치가 있는지"
  }
]

- 매칭 없으면 빈 배열 []
- 최대 5개까지
- 에세이/비기술 글은 제외
- 실측 기반이 아니거나 이미 위키에 있는 주제는 제외`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      return parsed.filter(
        (m) =>
          typeof m.post_index === "number" &&
          m.suggested_slug &&
          m.entry_title &&
          m.summary
      );
    } catch (err) {
      console.warn(`   ⚠️ Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// ─── 4. 개별 글 정독 + 엔트리 초안 생성 ──────────────────────────

async function fetchAndDraft(match, model) {
  console.log(`   📖 정독 중: ${match.post_title}`);

  let pageText;
  try {
    const html = await fetchPage(match.post_url);
    // Extract main content text
    const bodyMatch = html.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i);
    const content = bodyMatch ? bodyMatch[1] : html;
    pageText = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch (err) {
    console.warn(`   ⚠️ 페이지 fetch 실패: ${err.message}`);
    return null;
  }

  const prompt = `아래는 Blake Crosley의 블로그 글입니다. 이 글을 ai-study 위키 엔트리로 요약 분석해주세요.

## 원문 (일부)
${pageText}

## 요청
이 글의 핵심 내용을 아래 형식의 **MDX 엔트리 본문**으로 작성해주세요.

작성 규칙:
- 한국어로 작성
- 원문의 핵심 패턴/인사이트를 추출하여 구조화
- "왜 중요한가" → "핵심 패턴" → "실전 적용" 순서
- 코드 예시가 있으면 포함 (TypeScript 또는 Swift)
- 출처 명시: "이 엔트리는 Blake Crosley의 [원제목](URL)을 정독하고 핵심을 추출한 것이다."
- Mermaid 다이어그램 1개 포함
- 분량: 본문 80~150줄

**품질 가드 (필수):**
1. **실측 기반**: 원문의 실제 코드/사례만 포함. 추측("~할 수 있다", "기대된다")이면 "이론적으로" 명시.
2. **프로젝트 연결**: ai-study/moneyflow/tarosaju/aidy 중 하나에 실제 적용 가능한 시나리오 포함. 일반론 금지.
3. **Mermaid 5대 함정 준수**:
   - 괄호/특수문자: F{"Check Rate (Firestore)"} (따옴표로 감싸기)
   - <br/> 금지: 대신 줄바꿈 문자 또는 · 사용
   - 콜론: D["Deploy: Production"] (따옴표로 감싸기)
   - subgraph/node ID 충돌 금지
   - 유니코드 화살표(→) 금지: Mermaid는 --> 사용
   - 라벨 내 특수 문자 직접 사용 금지

## 응답 형식
MDX 본문만 반환 (frontmatter 제외, 코드 펜스 없이 그냥 MDX 텍스트)`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn(`   ⚠️ 초안 생성 실패: ${err.message}`);
    return null;
  }
}

// ─── 5. GitHub Issue 생성 ────────────────────────────────────────

function createIssue(match, draft) {
  const today = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const title = `📚 [Blake Crosley] ${match.entry_title}`;
  const body = `## Blake Crosley 블로그 스카우트 — ${today}

### 원본
- **제목**: ${match.post_title}
- **링크**: ${match.post_url}
- **관련도**: ${match.relevance}

### 위키 엔트리 계획
- **카테고리**: ${match.suggested_category}
- **Slug**: ${match.suggested_slug}
- **제목**: ${match.entry_title}

### 요약
${match.summary}

### 선정 사유
${match.reason}

${draft ? `### 초안 (Gemini 생성)\n\n<details>\n<summary>초안 펼치기</summary>\n\n${draft}\n\n</details>` : ""}

---
> 🤖 자동 생성 by \`scout-blakecrosley.mjs\``;

  if (dryRun) {
    console.log(`   [DRY-RUN] Would create issue: ${title}`);
    console.log(`   Category: ${match.suggested_category}, Slug: ${match.suggested_slug}`);
    console.log(`   Summary: ${match.summary.slice(0, 100)}...\n`);
    return;
  }

  try {
    const result = execSync(
      `gh issue create --repo "${REPO}" --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}" --label "hub-dispatch,blake-crosley"`,
      { encoding: "utf-8", timeout: 30000 }
    );
    console.log(`   ✅ Issue created: ${result.trim()}`);
  } catch (err) {
    console.error(`   ❌ Issue creation failed: ${err.message}`);
  }
}

// ─── 6. Gemini 초기화 ───────────────────────────────────────────

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

// ─── 7. Main ────────────────────────────────────────────────────

async function main() {
  console.log("📚 Blake Crosley 블로그 스카우트 시작...\n");

  // 1. /writing + /guides 스크래핑
  console.log("1️⃣ 블로그 페이지 스크래핑...");
  const [writingHtml, guidesHtml] = await Promise.all([
    fetchPage(WRITING_URL),
    fetchPage(GUIDES_URL),
  ]);

  const writingPosts = extractPosts(writingHtml, WRITING_URL);
  const guidePosts = extractPosts(guidesHtml, GUIDES_URL);
  const allPosts = [...writingPosts, ...guidePosts];
  console.log(`   /writing: ${writingPosts.length}개, /guides: ${guidePosts.length}개\n`);

  // 2. 이미 처리한 글 필터링
  const seen = loadSeen();
  const seenUrls = new Set(seen);
  const newPosts = allPosts.filter((p) => !seenUrls.has(p.url));
  console.log(`   새 글: ${newPosts.length}개 (이미 처리: ${allPosts.length - newPosts.length}개)\n`);

  if (newPosts.length === 0) {
    console.log("ℹ️ 새 글이 없습니다. 종료.");
    writeOutputs(0);
    return;
  }

  // 3. Gemini로 분석
  const { fast: fastModel, pro: proModel } = initGemini();

  console.log("2️⃣ Gemini로 새 글 분석 중...");
  let matches;
  try {
    matches = await analyzeNewPosts(newPosts, fastModel);
  } catch {
    console.log("   Flash 실패 → Pro로 재시도...");
    matches = await analyzeNewPosts(newPosts, proModel);
  }
  console.log(`   📋 위키 후보: ${matches.length}개\n`);

  if (matches.length === 0) {
    console.log("ℹ️ 위키 엔트리 후보가 없습니다.");
    // 모든 새 글을 seen 처리
    saveSeen([...seen, ...newPosts.map((p) => p.url)]);
    writeOutputs(0);
    return;
  }

  // 4. 각 후보 정독 + 초안 생성
  console.log("3️⃣ 후보 글 정독 + 초안 생성...\n");
  for (const match of matches) {
    const draft = await fetchAndDraft(match, proModel);
    createIssue(match, draft);
  }

  // 5. seen 업데이트 (모든 새 글)
  saveSeen([...seen, ...newPosts.map((p) => p.url)]);

  writeOutputs(matches.length);
  console.log(`\n✅ 스카우트 완료! ${matches.length}개 Issue 생성`);
}

function writeOutputs(count) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `match_count=${count}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      count > 0
        ? `## 📚 Blake Crosley Scout\n\n${count}개 엔트리 후보 발견`
        : "## 📚 Blake Crosley Scout\n\n새 글 없음"
    );
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
