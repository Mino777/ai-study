#!/usr/bin/env node
/**
 * GeekNews 큐레이션 스크립트
 *
 * 긱뉴스(news.hada.io) RSS에서 최신 글을 가져와
 * 위키 방향성(AI 엔지니어링)에 가장 맞는 글 1개를 Gemini로 선정.
 * 선정된 글을 generate-lesson의 generate-custom으로 엔트리화.
 *
 * 사용법:
 *   node scripts/curate-geeknews.mjs              — 큐레이션 + 엔트리 생성
 *   node scripts/curate-geeknews.mjs --dry-run    — 큐레이션만 (엔트리 미생성)
 *
 * 환경변수: GEMINI_API_KEY
 */

import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const FEED_URL = "https://news.hada.io/rss/news";
const MANIFEST_PATH = path.join(process.cwd(), "src", "generated", "content-manifest.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

// ─── 1. RSS 피드 가져오기 ──────────────────────────────────────

async function fetchGeekNews() {
  // Feedburner redirect를 따라감
  const res = await fetch(FEED_URL, {
    redirect: "follow",
    headers: { "User-Agent": "ai-study-wiki-bot/1.0" },
  });

  if (!res.ok) {
    // Feedburner 직접 시도
    const fallbackRes = await fetch("http://feeds.feedburner.com/geeknews-feed", {
      headers: { "User-Agent": "ai-study-wiki-bot/1.0" },
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
    const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() || "";
    const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] || "";
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || "";
    const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() || "";
    // HTML 태그 제거하여 순수 텍스트 추출
    const description = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);

    if (title) {
      entries.push({ title, link, published, description });
    }
  }

  return entries;
}

// ─── 2. Gemini로 최적 글 선정 ──────────────────────────────────

async function selectBestArticle(articles, existingTitles) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"];
  let model = genAI.getGenerativeModel({ model: MODELS[0] });

  const articleList = articles
    .slice(0, 30) // 최근 30개만
    .map((a, i) => `${i + 1}. [${a.title}] — ${a.description.slice(0, 200)}`)
    .join("\n");

  const prompt = `아래는 긱뉴스(GeekNews)의 최신 기술 뉴스 목록입니다.

이 위키의 방향성:
- AI 엔지니어링 방법론 (하네스 엔지니어링, 컨텍스트 엔지니어링, 프롬프트 엔지니어링)
- AI 에이전트, RAG, 토큰 최적화, LLM 활용
- iOS/프론트엔드/백엔드에서 AI 적용
- 개발자 생산성 향상, AI 코딩 도구

이미 존재하는 위키 엔트리 (중복 피하기):
${existingTitles.slice(0, 50).join("\n")}

목록:
${articleList}

위 목록에서 이 위키의 방향성에 **가장 부합하는** 글 1개를 선택하세요.
선택 기준:
1. AI/LLM 관련 실무 적용 가능한 주제 우선
2. 이미 존재하는 엔트리와 중복되지 않는 주제
3. 개발자에게 실질적 인사이트를 제공하는 글
4. 단순 뉴스/발표보다 기술적 깊이가 있는 글

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드 펜스 없이):
{
  "index": 번호,
  "reason": "선택 이유 (한 줄)",
  "topic": "위키 엔트리로 변환할 때의 주제 제목 (한국어, 기술 블로그 스타일)"
}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(text);

      if (typeof parsed.index !== "number" || !parsed.topic) {
        throw new Error("Invalid response structure");
      }

      const selectedIdx = parsed.index - 1; // 1-based → 0-based
      if (selectedIdx < 0 || selectedIdx >= articles.length) {
        throw new Error(`Invalid index: ${parsed.index}`);
      }

      return {
        article: articles[selectedIdx],
        reason: parsed.reason,
        topic: parsed.topic,
      };
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

// ─── 3. Main ───────────────────────────────────────────────────

async function main() {
  console.log("📰 긱뉴스 큐레이션 시작...\n");

  // 1. RSS 가져오기
  console.log("1️⃣ RSS 피드 가져오는 중...");
  const xml = await fetchGeekNews();
  const articles = parseAtomFeed(xml);
  console.log(`   ${articles.length}개 기사 파싱 완료\n`);

  if (articles.length === 0) {
    console.error("❌ 기사를 찾을 수 없습니다");
    process.exit(1);
  }

  // 2. 기존 엔트리 로드
  let existingTitles = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    existingTitles = manifest.entries.map((e) => `- ${e.frontmatter.title}`);
  }

  // 3. Gemini로 최적 글 선정
  console.log("2️⃣ Gemini로 최적 글 선정 중...");
  const { article, reason, topic } = await selectBestArticle(articles, existingTitles);
  console.log(`\n   ✅ 선정: "${article.title}"`);
  console.log(`   📝 이유: ${reason}`);
  console.log(`   🏷️  주제: ${topic}`);
  console.log(`   🔗 원본: ${article.link}\n`);

  if (dryRun) {
    console.log("🔍 --dry-run 모드: 엔트리 생성 생략");
    // GitHub Actions output
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_title=${article.title}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_topic=${topic}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_link=${article.link}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_reason=${reason}\n`);
    }
    return;
  }

  // 4. generate-lesson generate-custom 호출
  console.log("3️⃣ 엔트리 생성 중...");
  const { execSync } = await import("child_process");
  const topicWithSource = `${topic} (출처: 긱뉴스 — ${article.title})`;

  try {
    execSync(
      `node scripts/generate-lesson.mjs generate-custom "${topicWithSource.replace(/"/g, '\\"')}"`,
      { stdio: "inherit", env: { ...process.env } }
    );
  } catch (err) {
    console.error("❌ 엔트리 생성 실패:", err.message);
    process.exit(1);
  }

  // GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_title=${article.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_topic=${topic}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected_link=${article.link}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `generated=true\n`);
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
