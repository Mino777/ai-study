import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { computeGraphSignals } from "./lib/graph-signals.mjs";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MANIFEST_PATH = path.join(process.cwd(), "src", "generated", "content-manifest.json");
const TOPIC_POOL_PATH = path.join(process.cwd(), "scripts", "topic-pool.json");

const CATEGORIES = [
  "prompt-engineering",
  "context-engineering",
  "harness-engineering",
  "tokenomics",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "infrastructure",
  "ios-ai",
  "frontend-ai",
  "android-ai",
  "backend-ai",
];

// 우선순위: AI 활용 방법론 > iOS/Frontend AI > 나머지
const CATEGORY_PRIORITY = {
  "prompt-engineering": 2.0,
  "context-engineering": 2.0,
  "harness-engineering": 2.0,
  tokenomics: 2.0,
  agents: 1.8,
  rag: 1.8,
  "ios-ai": 1.5,
  "frontend-ai": 1.5,
  "android-ai": 1.5,
  "backend-ai": 1.5,
  evaluation: 1.2,
  "fine-tuning": 1.0,
  infrastructure: 0.7,
};

const CATEGORY_LABELS = {
  "prompt-engineering": "Prompt Engineering",
  "context-engineering": "Context Engineering",
  "harness-engineering": "Harness Engineering",
  tokenomics: "Tokenomics",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
  "ios-ai": "iOS + AI",
  "frontend-ai": "Frontend + AI",
  "android-ai": "Android + AI",
  "backend-ai": "Backend + AI",
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

function recommendTopics(manifest, topicPool, count = 3) {
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

  const { weakHubCategories, categoryConnectivity } = computeGraphSignals(manifest);

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

      // Graph signal: weak hub category boost (conf<=2 + connections>=15)
      if (weakHubCategories.has(category)) score += 1.5;

      // Graph signal: high connectivity + low confidence category
      const avgConn = categoryConnectivity[category] || 0;
      if (avgConn >= 10 && categoryConfidence[category] < 3) score += 1.0;

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

  // Diversity: 같은 카테고리 최대 2건 (3건 연속 방지)
  const selected = [];
  const categoryCounts = {};
  for (const c of candidates) {
    if (selected.length >= count) break;
    const catCount = categoryCounts[c.category] || 0;
    if (catCount >= 2) continue;
    selected.push(c);
    categoryCounts[c.category] = catCount + 1;
  }

  // Return top N with connections
  return selected.map((selected) => {
    const relatedSlugs = manifest.entries
      .filter((e) => e.frontmatter.category === selected.category)
      .map((e) => e.slug)
      .slice(0, 3);
    return { ...selected, connections: relatedSlugs };
  });
}

// ─── 3. Generate MDX with Gemini ────────────────────────────────

async function generateMDX(topic, manifest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Pro 우선, 실패 시 Flash 폴백 (ping 테스트 제거 — 본 호출에서 직접 폴백)
  const MODELS = ["gemini-2.5-pro", "gemini-2.5-flash"];
  let model = genAI.getGenerativeModel({ model: MODELS[0] });
  let currentModelIdx = 0;
  console.log(`🤖 Primary model: ${MODELS[0]} (fallback: ${MODELS[1]})`);

  // 토큰 최적화: 같은 카테고리 엔트리만 컨텍스트로 전송 (전체 134개 → ~10개)
  const sameCategoryEntries = manifest.entries.filter((e) => e.frontmatter.category === topic.category);
  const existingTitles = sameCategoryEntries.map((e) => `- ${e.frontmatter.title}`).join("\n");

  const today = new Date().toISOString().split("T")[0];

  const contextNote = topic.category === "ios-ai"
    ? "\n대상 독자: iOS 개발자. Swift/SwiftUI 코드 예제 중심. 실무에서 바로 쓸 수 있는 패턴 위주."
    : topic.category === "frontend-ai"
    ? "\n대상 독자: 프론트엔드 개발자 (웹/모바일). React/Next.js/React Native 코드 예제 중심. 실무 적용 패턴 위주."
    : "\n대상 독자: iOS/프론트엔드 개발자가 AI를 실무에 적용하려는 맥락. 최신 트렌드와 실무 사용 사례 중심.";

  const prompt = `다음 주제에 대한 기술 블로그 글을 작성하세요.
인사말이나 자기소개 없이 바로 본문부터 시작하세요.

사용자 요청: ${topic.title} (카테고리: ${CATEGORY_LABELS[topic.category]})
${contextNote}

이미 존재하는 엔트리들 (중복 내용 피하세요):
${existingTitles || "(없음)"}

요구사항:
- 첫 번째 줄에 반드시 TITLE: 정제된 제목 을 작성하세요 (예: "TITLE: Compound Engineering 기초 — 복리형 AI 개발 방법론"). 사용자 요청을 기술 블로그에 어울리는 전문적인 제목으로 변환하세요. 구어체/요청문("~하고싶어", "~에 대해" 등)은 제거하고, 핵심 키워드 + 부제 형식으로 작성.
- 그 다음 줄에 DESC: 한 줄 설명 을 작성하세요 (예: "DESC: 모든 작업이 다음 작업을 더 쉽게 만드는 복리형 개발 워크플로우.").
- 그 다음 줄에 TAGS: 쉼표로 구분된 영문 태그 3~6개 를 작성하세요 (예: "TAGS: circuit-breaker, fallback, error-handling, resilience"). 핵심 기술 키워드만, 한국어 금지, 카테고리명은 자동 추가되므로 생략.
- 그 다음부터 본문을 작성하세요.
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

MDX 문법 제약 (반드시 준수 — 위반 시 빌드 실패):
1. HTML void 태그는 반드시 self-closing: <br />, <hr />, <img /> (특히 표 안)
2. 본문 텍스트에서 {중괄호}는 JSX로 파싱됨 — 반드시 인라인 코드(\`)로 감싸거나 괄호()로 교체
3. 본문 텍스트에서 <숫자 (예: <3)는 JSX 태그로 파싱됨 — 공백 추가(< 3) 또는 인라인 코드 사용
4. Mermaid subgraph 이름에 공백은 반드시 id ["Label"] 형식: subgraph rag_std ["Standard RAG"]`;

  console.log("🤖 Calling Gemini 2.5 Flash...");

  let content;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      content = result.response.text();
      break;
    } catch (err) {
      console.warn(`⚠️  Attempt ${attempt + 1} failed: ${err.message}`);
      // 첫 실패 시 폴백 모델로 전환
      if (attempt === 0 && currentModelIdx < MODELS.length - 1) {
        currentModelIdx++;
        model = genAI.getGenerativeModel({ model: MODELS[currentModelIdx] });
        console.log(`🔄 Switching to fallback: ${MODELS[currentModelIdx]}`);
      }
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

  // Extract TITLE, DESC, TAGS from generated content
  const titleMatch = content.match(/^TITLE:\s*(.+)$/m);
  const descMatch = content.match(/^DESC:\s*(.+)$/m);
  const tagsMatch = content.match(/^TAGS:\s*(.+)$/m);
  const refinedTitle = titleMatch ? titleMatch[1].trim() : topic.title.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const refinedDesc = descMatch ? descMatch[1].trim() : `${topic.title} 개념 정리 및 실전 적용`;
  const refinedTags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim().toLowerCase()).filter((t) => t.length > 1)
    : [];

  // Remove TITLE/DESC/TAGS lines from content body
  content = content.replace(/^TITLE:.*\n?/m, "").replace(/^DESC:.*\n?/m, "").replace(/^TAGS:.*\n?/m, "").replace(/^\n+/, "");

  // Update topic title for output
  topic.title = refinedTitle;

  // ── Generate self-check quiz (separate call for reliability) ──
  let quizYaml = "";
  try {
    const quiz = await generateQuiz(model, refinedTitle, content);
    if (quiz.length > 0) {
      quizYaml = "\nquiz:\n" + quizArrayToYaml(quiz);
    }
  } catch (err) {
    console.warn(`⚠️  Quiz generation failed: ${err.message}. Skipping quiz.`);
  }

  // Build frontmatter
  const tags = refinedTags.length > 0
    ? [...refinedTags, topic.category]
    : [...topic.topicSlug.split("-").filter((t) => t.length > 2 && /^[a-z0-9-]+$/.test(t)), topic.category];

  const frontmatter = [
    "---",
    `title: "${refinedTitle}"`,
    `category: ${topic.category}`,
    `date: "${today}"`,
    `tags: [${tags.map((t) => `${t}`).join(", ")}]`,
    `confidence: 1`,
    `connections: [${topic.connections.map((c) => `${c}`).join(", ")}]`,
    `status: draft`,
    `description: "${refinedDesc}"`,
    `type: entry${quizYaml}`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${content}`;
}

// ─── Quiz generation ────────────────────────────────────────────

async function generateQuiz(model, title, body) {
  const prompt = `다음 기술 블로그 본문을 바탕으로 자가 점검용 객관식 퀴즈를 만들어주세요.

제목: ${title}

본문:
${body.slice(0, 6000)}

요구사항:
- 정확히 3문항
- 각 문항은 객관식 4지선다
- 본문에서 직접 추론 가능한 핵심 개념을 묻는 질문
- 단순 암기가 아닌 이해도를 측정
- 오답도 그럴듯하게 (단순히 명백히 틀린 것 X)
- 각 문항에 정답 해설(왜 정답이고 왜 다른 선택지가 틀렸는지)을 포함
- 한국어로 작성

응답은 반드시 아래 JSON 형식으로만 반환 (마크다운 코드 펜스 없이):
[
  {
    "question": "문제 본문",
    "choices": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "answer": 0,
    "explanation": "정답 해설"
  }
]

answer는 0~3 사이의 정수 (정답 선택지의 인덱스).`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // Strip optional markdown fence
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`JSON parse error: ${err.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Quiz response is not an array");
  }

  return parsed
    .filter(
      (q) =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.choices) &&
        q.choices.length >= 2 &&
        q.choices.every((c) => typeof c === "string") &&
        typeof q.answer === "number" &&
        q.answer >= 0 &&
        q.answer < q.choices.length
    )
    .slice(0, 5);
}

// Serialize quiz array to YAML, indented to fit under "quiz:" key
function quizArrayToYaml(quiz) {
  // js-yaml emits a top-level sequence; indent it 2 spaces so it nests under "quiz:"
  const dumped = yaml.dump(quiz, {
    lineWidth: -1, // no automatic line wrapping
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  return dumped
    .split("\n")
    .map((line) => (line.length > 0 ? "  " + line : line))
    .join("\n");
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

async function initManifest() {
  const { execSync } = await import("child_process");
  try {
    execSync("node scripts/generate-content-manifest.mjs", { stdio: "inherit" });
  } catch {
    console.warn("⚠️  Manifest generation had warnings, continuing...");
  }
  return { manifest: loadManifest(), topicPool: loadTopicPool() };
}

// Mode 1: suggest 3 topics (for daily issue)
async function suggest() {
  const { manifest, topicPool } = await initManifest();
  console.log(`📊 현재: ${manifest.entries.length}개 엔트리\n`);

  const topics = recommendTopics(manifest, topicPool, 3);

  if (topics.length === 0) {
    console.log("❌ No topics available.");
    process.exit(0);
  }

  const { weakHubCategories } = computeGraphSignals(manifest);
  console.log("📚 오늘의 추천 주제 3가지:\n");
  topics.forEach((t, i) => {
    const graphTag = weakHubCategories.has(t.category) ? " 🔗graph-boost" : "";
    console.log(`  ${i + 1}. [${CATEGORY_LABELS[t.category]}] ${t.title} (score: ${t.score.toFixed(1)}${graphTag})`);
  });

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    topics.forEach((t, i) => {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `topic_${i + 1}_title=${t.title}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `topic_${i + 1}_slug=${t.slug}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `topic_${i + 1}_category=${t.category}\n`);
    });
  }

  return topics;
}

// Mode 2: generate a specific topic (after user picks one)
async function generate(slug) {
  const { manifest, topicPool } = await initManifest();

  // Find the topic in candidates
  const allTopics = recommendTopics(manifest, topicPool, 100);
  let topic = allTopics.find((t) => t.slug === slug);

  if (!topic) {
    // Parse slug manually
    const parts = slug.split("/");
    const category = parts[0];
    const topicSlug = parts.slice(1).join("/");
    const relatedSlugs = manifest.entries
      .filter((e) => e.frontmatter.category === category)
      .map((e) => e.slug)
      .slice(0, 3);
    topic = { slug, category, topicSlug, title: topicSlug.replace(/-/g, " "), connections: relatedSlugs };
  }

  console.log(`\n🎓 생성 중: ${topic.title} (${CATEGORY_LABELS[topic.category]})\n`);

  const mdxContent = await generateMDX(topic, manifest);
  const filePath = writeMDX(topic, mdxContent);

  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`\n📁 Generated: ${relativePath}`);
  console.log(`📌 Topic: ${topic.title}`);
  console.log(`📂 Category: ${CATEGORY_LABELS[topic.category]}`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `file_path=${relativePath}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `topic_title=${topic.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `category=${topic.category}\n`);
  }
}

// ─── Slug generation helpers ───────────────────────────────────

// 한글 제목 → 영문 slug 생성을 Gemini에게 위임
async function generateSlugFromTitle(model, title) {
  const prompt = `Convert this Korean/mixed title into a short English kebab-case slug for a URL.
Rules:
- Use only lowercase English letters, numbers, and hyphens
- Maximum 60 characters
- Extract the core concept, not a literal translation
- Examples:
  "iOS에서 AI가 작업한 코드를 어떤식으로 보장할 수 있는지" → "ios-ai-code-quality-assurance"
  "프롬프트 엔지니어링 기초 — 시스템 프롬프트 설계" → "prompt-engineering-system-prompt-design"
  "Circuit Breaker 패턴으로 AI 호출 안정화" → "circuit-breaker-ai-call-stabilization"

Title: ${title}

Reply with ONLY the slug, nothing else.`;

  const result = await model.generateContent(prompt);
  let slug = result.response.text().trim();
  // Sanitize: only allow [a-z0-9-]
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  // Enforce max length
  if (slug.length > 60) slug = slug.substring(0, 60).replace(/-$/, "");
  return slug;
}

// Fallback: title → slug without Gemini (영문만 추출)
function titleToSlugFallback(title) {
  return title
    .toLowerCase()
    .replace(/[가-힣]+/g, "") // 한글 제거
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60)
    .replace(/-$/, "") || "untitled";
}

// Mode 3: generate from custom free-text topic
async function generateCustom(topicText) {
  const { manifest } = await initManifest();

  // Determine best-fit category via keyword matching
  const catKeywords = {
    "prompt-engineering": ["프롬프트", "prompt", "프롬프팅", "system prompt"],
    "context-engineering": ["컨텍스트", "context", "window", "토큰"],
    "harness-engineering": ["하네스", "harness", "ai활용", "방법론", "워크플로우"],
    rag: ["rag", "검색", "retrieval", "벡터", "임베딩", "embedding", "chunking"],
    agents: ["에이전트", "agent", "tool", "mcp", "function calling"],
    "fine-tuning": ["파인튜닝", "fine-tuning", "lora", "rlhf", "dpo"],
    evaluation: ["평가", "eval", "벤치마크", "환각", "hallucination"],
    infrastructure: ["인프라", "서빙", "캐싱", "게이트웨이", "배포"],
    "ios-ai": ["ios", "swift", "core ml", "apple", "swiftui", "xcode"],
    "frontend-ai": ["프론트", "react", "next", "웹", "frontend", "react native"],
    "android-ai": ["android", "kotlin", "jetpack", "compose"],
    "backend-ai": ["backend", "서버", "api", "fastapi", "express", "spring"],
    tokenomics: ["토큰", "token", "비용", "cost", "caching", "캐싱", "pricing"],
  };

  const lower = topicText.toLowerCase();
  let bestCat = "harness-engineering";
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(catKeywords)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; bestCat = cat; }
  }

  const relatedSlugs = manifest.entries
    .filter((e) => e.frontmatter.category === bestCat)
    .map((e) => e.slug)
    .slice(0, 3);

  // Temporary topic for MDX generation (slug will be set after TITLE is known)
  const tempSlug = titleToSlugFallback(topicText);
  const topic = { slug: `${bestCat}/${tempSlug}`, category: bestCat, topicSlug: tempSlug, title: topicText, connections: relatedSlugs };

  console.log(`\n🎓 커스텀 주제 생성: ${topic.title} (${CATEGORY_LABELS[topic.category] || topic.category})\n`);

  const mdxContent = await generateMDX(topic, manifest);

  // After generateMDX, topic.title is updated to the refined title from Gemini.
  // Now generate a proper English slug from the refined title.
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  // slug 생성은 가벼운 작업이므로 Flash로 충분
  const slugModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let finalSlug;
  try {
    finalSlug = await generateSlugFromTitle(slugModel, topic.title);
    console.log(`📎 Generated slug: ${finalSlug}`);
  } catch (err) {
    console.warn(`⚠️  Slug generation failed: ${err.message}. Using fallback.`);
    finalSlug = titleToSlugFallback(topic.title);
  }

  // Check for collision
  const existingSlugs = new Set(manifest.entries.map((e) => e.slug));
  if (existingSlugs.has(`${bestCat}/${finalSlug}`)) {
    finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
  }

  topic.topicSlug = finalSlug;
  topic.slug = `${bestCat}/${finalSlug}`;

  const filePath = writeMDX(topic, mdxContent);

  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`\n📁 Generated: ${relativePath}`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `file_path=${relativePath}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `topic_title=${topic.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `category=${topic.category}\n`);
  }
}

// CLI entry point
const args = process.argv.slice(2);
const mode = args[0] || "suggest";

if (mode === "suggest") {
  suggest().catch((err) => { console.error("❌", err.message); process.exit(1); });
} else if (mode === "generate") {
  const slug = args[1];
  if (!slug) { console.error("❌ Usage: generate-lesson.mjs generate <slug>"); process.exit(1); }
  generate(slug).catch((err) => { console.error("❌", err.message); process.exit(1); });
} else if (mode === "generate-custom") {
  const topic = args.slice(1).join(" ");
  if (!topic) { console.error("❌ Usage: generate-lesson.mjs generate-custom <topic text>"); process.exit(1); }
  generateCustom(topic).catch((err) => { console.error("❌", err.message); process.exit(1); });
} else {
  console.error(`❌ Unknown mode: ${mode}. Use "suggest", "generate <slug>", or "generate-custom <topic>"`);
  process.exit(1);
}
