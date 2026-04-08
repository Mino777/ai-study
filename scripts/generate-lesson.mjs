import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MANIFEST_PATH = path.join(process.cwd(), "src", "generated", "content-manifest.json");
const TOPIC_POOL_PATH = path.join(process.cwd(), "scripts", "topic-pool.json");

const CATEGORIES = [
  "prompt-engineering",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "infrastructure",
  "ios-ai",
  "frontend-ai",
];

// 우선순위: AI 활용 방법론 > iOS/Frontend AI > 나머지
const CATEGORY_PRIORITY = {
  "prompt-engineering": 2.0,  // AI를 잘 쓰는 방법론이 최우선
  agents: 1.8,                // 에이전트 활용도 방법론
  rag: 1.8,                   // RAG도 핵심 방법론
  "ios-ai": 1.5,              // iOS + AI 실무
  "frontend-ai": 1.5,         // Frontend + AI 실무
  evaluation: 1.2,            // 평가도 중요
  "fine-tuning": 1.0,
  infrastructure: 0.7,        // 곁다리
};

const CATEGORY_LABELS = {
  "prompt-engineering": "Prompt Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
  "ios-ai": "iOS + AI",
  "frontend-ai": "Frontend + AI",
};

// ─── 1. Load manifest & topic pool ───────────────────────────────

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return { entries: [], graph: { nodes: [], edges: [] } };
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
}

function loadTopicPool() {
  return JSON.parse(fs.readFileSync(TOPIC_POOL_PATH, "utf-8"));
}

// ─── 2. Topic recommendation engine ─────────────────────────────

function recommendTopic(manifest, topicPool) {
  const existingSlugs = new Set(manifest.entries.map((e) => e.slug));
  const categoryEntries = {};
  const categoryConfidence = {};

  for (const cat of CATEGORIES) {
    categoryEntries[cat] = manifest.entries.filter((e) => e.frontmatter.category === cat);
    const entries = categoryEntries[cat];
    categoryConfidence[cat] =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.frontmatter.confidence, 0) / entries.length
        : 0;
  }

  // Collect dangling connections
  const danglingConnections = [];
  for (const entry of manifest.entries) {
    for (const conn of entry.frontmatter.connections || []) {
      if (!existingSlugs.has(conn)) {
        danglingConnections.push(conn);
      }
    }
  }

  // Build candidate list with scores
  const candidates = [];

  // Source A: dangling connections
  for (const slug of [...new Set(danglingConnections)]) {
    const parts = slug.split("/");
    const category = parts[0];
    const topicSlug = parts.slice(1).join("/");
    if (!CATEGORIES.includes(category)) continue;

    candidates.push({
      slug,
      category,
      topicSlug,
      title: topicSlug.replace(/-/g, " "),
      score: (2 + (categoryEntries[category].length === 0 ? 3 : 0)) * (CATEGORY_PRIORITY[category] || 1),
      source: "dangling",
    });
  }

  // Source B: topic pool
  for (const [category, topics] of Object.entries(topicPool)) {
    for (const topic of topics) {
      const slug = `${category}/${topic}`;
      if (existingSlugs.has(slug)) continue;
      if (candidates.some((c) => c.slug === slug)) continue;

      let score = 0;
      if (categoryEntries[category]?.length === 0) score += 3;
      if (categoryConfidence[category] < 3) score += 1.5;

      // Staleness: days since last entry in this category
      const catDates = (categoryEntries[category] || []).map((e) =>
        new Date(e.frontmatter.date).getTime()
      );
      if (catDates.length > 0) {
        const lastDate = Math.max(...catDates);
        const daysSince = (Date.now() - lastDate) / (1000 * 60 * 60 * 24);
        if (daysSince > 7) score += 0.5;
      } else {
        score += 0.5;
      }

      // Apply category priority multiplier
      score *= (CATEGORY_PRIORITY[category] || 1);

      candidates.push({
        slug,
        category,
        topicSlug: topic,
        title: topic.replace(/-/g, " "),
        score,
        source: "pool",
      });
    }
  }

  if (candidates.length === 0) {
    console.log("❌ No candidate topics found. All topics exhausted.");
    process.exit(0);
  }

  // Sort by score descending, random tiebreak
  candidates.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const selected = candidates[0];
  console.log(`📚 Selected topic: ${selected.slug} (score: ${selected.score}, source: ${selected.source})`);

  // Find related existing entries for connections
  const relatedSlugs = manifest.entries
    .filter((e) => e.frontmatter.category === selected.category)
    .map((e) => e.slug)
    .slice(0, 3);

  return { ...selected, connections: relatedSlugs };
}

// ─── 3. Generate MDX with Gemini ────────────────────────────────

async function generateMDX(topic, manifest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const existingTitles = manifest.entries.map((e) => `- ${e.frontmatter.title}`).join("\n");

  const today = new Date().toISOString().split("T")[0];

  const contextNote = topic.category === "ios-ai"
    ? "\n대상 독자: iOS 개발자. Swift/SwiftUI 코드 예제 중심. 실무에서 바로 쓸 수 있는 패턴 위주."
    : topic.category === "frontend-ai"
    ? "\n대상 독자: 프론트엔드 개발자 (웹/모바일). React/Next.js/React Native 코드 예제 중심. 실무 적용 패턴 위주."
    : "\n대상 독자: iOS/프론트엔드 개발자가 AI를 실무에 적용하려는 맥락. 최신 트렌드와 실무 사용 사례 중심.";

  const prompt = `다음 주제에 대한 기술 블로그 글을 작성하세요.
인사말이나 자기소개 없이 바로 본문부터 시작하세요.

주제: ${topic.title} (카테고리: ${CATEGORY_LABELS[topic.category]})
${contextNote}

이미 존재하는 엔트리들 (중복 내용 피하세요):
${existingTitles || "(없음)"}

요구사항:
- 핵심 개념 설명 (왜 중요한지부터 시작)
- 실제 동작하는 코드 예제 포함 (카테고리에 맞는 언어: Swift, TypeScript, Python 등)
- Mermaid 다이어그램 1개 이상 포함 (\`\`\`mermaid 코드 블록)
- 실무에서 바로 사용할 수 있는 구체적 사례와 패턴
- 2026년 최신 트렌드 반영
- 마지막에 "## 자기 점검" 섹션:
  - 이해도 확인 질문 3-5개 (번호 리스트)
  - "이 개념을 동료에게 설명한다면?" 형식의 열린 질문 1개
  - 실습 과제 1개 (구체적, 실행 가능한 것)
- 한국어로 작성, 영어 기술 용어는 원문 유지
- 2000-3000자 분량
- h2(##)와 h3(###) 헤딩을 적절히 사용
- 마크다운 테이블이 있으면 좋음

본문만 작성하세요 (frontmatter는 제가 추가합니다).`;

  console.log("🤖 Calling Gemini 2.5 Flash...");

  let content;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      content = result.response.text();
      break;
    } catch (err) {
      console.warn(`⚠️  Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === 2) {
        console.error("❌ All retries failed");
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 2000));
    }
  }

  // Quality validation
  const hasH2 = content.includes("## ");
  const hasCodeBlock = content.includes("```");
  const hasSelfCheck = content.includes("자기 점검") || content.includes("자기점검");
  const minLength = content.length >= 500;

  if (!hasH2 || !hasCodeBlock || !minLength) {
    console.warn("⚠️  Quality check failed. Regenerating...");
    const retryResult = await model.generateContent(
      prompt + "\n\n중요: 반드시 ## 헤딩, 코드 블록(```), 자기 점검 섹션을 포함하세요."
    );
    content = retryResult.response.text();
  }

  // Build frontmatter
  const tags = topic.topicSlug.split("-").filter((t) => t.length > 2);
  tags.push(topic.category);

  const frontmatter = [
    "---",
    `title: "${topic.title.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}"`,
    `category: ${topic.category}`,
    `date: "${today}"`,
    `tags: [${tags.map((t) => `${t}`).join(", ")}]`,
    `confidence: 1`,
    `connections: [${topic.connections.map((c) => `${c}`).join(", ")}]`,
    `status: draft`,
    `description: "${topic.title.replace(/-/g, " ")} 개념 정리 및 실전 적용"`,
    `type: entry`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${content}`;
}

// ─── 4. Write file ──────────────────────────────────────────────

function writeMDX(topic, mdxContent) {
  const dir = path.join(CONTENT_DIR, topic.category);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${topic.topicSlug}.mdx`);

  if (fs.existsSync(filePath)) {
    console.log(`⚠️  File already exists: ${filePath}. Skipping.`);
    process.exit(0);
  }

  fs.writeFileSync(filePath, mdxContent);
  console.log(`✅ Written: ${path.relative(process.cwd(), filePath)}`);
  return filePath;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log("\n🎓 AI 과외 선생님 — 오늘의 학습 생성\n");

  // Regenerate manifest first
  const { execSync } = await import("child_process");
  try {
    execSync("node scripts/generate-content-manifest.mjs", { stdio: "inherit" });
  } catch {
    console.warn("⚠️  Manifest generation had warnings, continuing...");
  }

  const manifest = loadManifest();
  const topicPool = loadTopicPool();

  console.log(`📊 현재: ${manifest.entries.length}개 엔트리\n`);

  const topic = recommendTopic(manifest, topicPool);
  const mdxContent = await generateMDX(topic, manifest);
  const filePath = writeMDX(topic, mdxContent);

  // Output for GitHub Actions
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`\n📁 Generated: ${relativePath}`);
  console.log(`📌 Topic: ${topic.title}`);
  console.log(`📂 Category: ${CATEGORY_LABELS[topic.category]}`);

  // Set output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `file_path=${relativePath}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `topic_title=${topic.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `category=${topic.category}\n`);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
