import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_FILE = path.join(
  process.cwd(),
  "src",
  "generated",
  "content-manifest.json"
);

// 모든 페이지의 SearchDialog가 lazy fetch로 가져가는 정적 인덱스.
// layout.tsx에서 SSR props로 inline 주입하던 ~30KB gzipped 오버헤드를 제거.
const SEARCH_INDEX_FILE = path.join(
  process.cwd(),
  "public",
  "search-index.json"
);

// NOTE: src/lib/schema.ts의 CATEGORIES와 동기화 유지 필요.
// 이 파일은 .mjs라 .ts에서 import 불가 → 수동 동기화.
// 카테고리 추가 시 schema.ts + CATEGORY_LABELS(아래) 3곳 모두 업데이트.
const CATEGORIES = [
  "prompt-engineering",
  "context-engineering",
  "harness-engineering",
  "tokenomics",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "ios-ai",
  "frontend-ai",
  "android-ai",
  "backend-ai",
  "infrastructure",
];

const REQUIRED_FIELDS = ["title", "category", "date", "tags", "description"];

function findMdxFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findMdxFiles(fullPath));
    } else if (item.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }
  return results;
}

function validateFrontmatter(data, filePath) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (data.category && !CATEGORIES.includes(data.category)) {
    errors.push(
      `Invalid category "${data.category}". Must be one of: ${CATEGORIES.join(", ")}`
    );
  }

  if (
    data.confidence !== undefined &&
    (typeof data.confidence !== "number" || data.confidence < 1 || data.confidence > 5)
  ) {
    errors.push(`Confidence must be a number between 1 and 5, got: ${data.confidence}`);
  }

  if (errors.length > 0) {
    console.error(`\n❌ Validation errors in ${filePath}:`);
    errors.forEach((e) => console.error(`   - ${e}`));
    return false;
  }
  return true;
}

function main() {
  console.log("📦 Generating content manifest...");

  const mdxFiles = findMdxFiles(CONTENT_DIR);

  if (mdxFiles.length === 0) {
    console.log("   No MDX files found. Writing empty manifest.");
    const emptyManifest = { entries: [], graph: { nodes: [], edges: [] } };
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(emptyManifest, null, 2));
    return;
  }

  const entries = [];
  let hasErrors = false;

  for (const filePath of mdxFiles) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    const relativePath = path.relative(CONTENT_DIR, filePath);
    const slug = relativePath.replace(/\.mdx$/, "").replace(/\\/g, "/");

    if (!validateFrontmatter(data, relativePath)) {
      hasErrors = true;
      continue;
    }

    // Defaults
    data.confidence = data.confidence || 1;
    data.connections = data.connections || [];
    data.status = data.status || "draft";
    data.type = data.type || "entry";
    data.tags = data.tags || [];

    entries.push({ slug, frontmatter: data });
  }

  if (hasErrors) {
    process.exit(1);
  }

  // Build graph
  const allSlugs = new Set(entries.map((e) => e.slug));
  const nodes = entries
    .filter((e) => e.frontmatter.status !== "draft" || process.env.NODE_ENV !== "production")
    .map((e) => ({
      id: e.slug,
      label: e.frontmatter.title,
      category: e.frontmatter.category,
      confidence: e.frontmatter.confidence,
      description: e.frontmatter.description,
    }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  const danglingConnections = [];

  for (const entry of entries) {
    if (!nodeIds.has(entry.slug)) continue; // draft 등 필터된 엔트리는 edge도 스킵
    for (const target of entry.frontmatter.connections) {
      if (nodeIds.has(target)) {
        edges.push({ source: entry.slug, target });
      } else if (allSlugs.has(target)) {
        // 노드는 있지만 필터됨 (draft) — edge 스킵
      } else {
        danglingConnections.push({ from: entry.slug, to: target });
      }
    }
  }

  if (danglingConnections.length > 0) {
    console.warn("\n⚠️  Dangling connections (referenced but not found):");
    danglingConnections.forEach((d) =>
      console.warn(`   ${d.from} → ${d.to}`)
    );
    // Add gray placeholder nodes for dangling connections
    const danglingTargets = new Set(danglingConnections.map((d) => d.to));
    for (const target of danglingTargets) {
      nodes.push({
        id: target,
        label: target.split("/").pop().replace(/-/g, " "),
        category: "infrastructure",
        confidence: 0,
        description: "아직 작성되지 않은 엔트리",
      });
      // Still add the edge
      for (const d of danglingConnections.filter((x) => x.to === target)) {
        edges.push({ source: d.from, target });
      }
    }
  }

  // Add placeholder nodes for empty categories (shown as grey in graph)
  const categoriesWithEntries = new Set(entries.map((e) => e.frontmatter.category));
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
  for (const cat of CATEGORIES) {
    if (!categoriesWithEntries.has(cat)) {
      const nodeId = `__empty__${cat}`;
      nodes.push({
        id: nodeId,
        label: CATEGORY_LABELS[cat] || cat,
        category: cat,
        confidence: 0,
        description: "Coming Soon",
      });
    }
  }

  // Calculate streak
  const dates = [...new Set(entries.map((e) => e.frontmatter.date))].sort().reverse();
  let currentStreak = 0;
  let longestStreak = 0;

  if (dates.length > 0) {
    // Current streak: count consecutive days backwards from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateSet = new Set(dates);

    // Check from today backwards
    let checkDate = new Date(today);
    // If today has no entry, start from most recent entry date
    const todayStr = checkDate.toISOString().split("T")[0];
    if (!dateSet.has(todayStr)) {
      checkDate = new Date(dates[0]);
      checkDate.setHours(0, 0, 0, 0);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dateSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak: scan all dates
    let streak = 1;
    const sortedDates = [...dates].sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);
  }

  // Build dailyEntries map (date → count) for heatmap
  const dailyEntries = {};
  for (const entry of entries) {
    const d = entry.frontmatter.date;
    dailyEntries[d] = (dailyEntries[d] || 0) + 1;
  }

  // Calculate stats
  const categoryStats = {};
  for (const cat of CATEGORIES) {
    const catEntries = entries.filter((e) => e.frontmatter.category === cat);
    categoryStats[cat] = {
      count: catEntries.length,
      avgConfidence: catEntries.length > 0
        ? +(catEntries.reduce((s, e) => s + e.frontmatter.confidence, 0) / catEntries.length).toFixed(1)
        : 0,
      complete: catEntries.filter((e) => e.frontmatter.status === "complete").length,
    };
  }

  // Weekly stats (last 4 weeks)
  const weeklyStats = [];
  const now = new Date();
  for (let w = 0; w < 4; w++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];
    const weekEntries = entries.filter((e) => e.frontmatter.date >= startStr && e.frontmatter.date <= endStr);
    weeklyStats.push({
      week: w === 0 ? "이번 주" : `${w}주 전`,
      count: weekEntries.length,
      startDate: startStr,
      endDate: endStr,
    });
  }

  // Recent entries (last 5)
  const recentEntries = [...entries]
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
    .slice(0, 5)
    .map((e) => ({ slug: e.slug, title: e.frontmatter.title, date: e.frontmatter.date, category: e.frontmatter.category }));

  const manifest = {
    entries: entries.map((e) => ({ slug: e.slug, frontmatter: e.frontmatter })),
    graph: { nodes, edges },
    streak: {
      current: currentStreak,
      longest: longestStreak,
      lastActiveDate: dates[0] || null,
    },
    dailyEntries,
    stats: {
      totalEntries: entries.length,
      totalComplete: entries.filter((e) => e.frontmatter.status === "complete").length,
      avgConfidence: entries.length > 0
        ? +(entries.reduce((s, e) => s + e.frontmatter.confidence, 0) / entries.length).toFixed(1)
        : 0,
      categoryStats,
      weeklyStats,
      recentEntries,
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  // SearchDialog 전용 슬림 인덱스. 압축 우선이라 minified.
  const searchIndex = entries.map((e) => ({
    slug: e.slug,
    title: e.frontmatter.title,
    category: e.frontmatter.category,
    description: e.frontmatter.description,
    tags: e.frontmatter.tags,
  }));
  fs.mkdirSync(path.dirname(SEARCH_INDEX_FILE), { recursive: true });
  fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex));

  // wiki-index.md — Karpathy LLM Wiki 패턴 적용.
  // 에이전트가 검색 전 카테고리별 한 줄 요약을 먼저 읽고 drill-down.
  const WIKI_INDEX_FILE = path.join(process.cwd(), "wiki-index.md");
  const grouped = {};
  for (const e of entries) {
    const cat = e.frontmatter.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(e);
  }
  let indexMd = `# Wiki Index — ${entries.length} entries\n\n> AI 에이전트가 검색 전 이 파일을 먼저 읽고 관련 엔트리로 drill-down.\n> 자동 생성 (generate-content-manifest.mjs). 직접 수정 금지.\n\n`;
  for (const cat of CATEGORIES) {
    const catEntries = grouped[cat];
    if (!catEntries || catEntries.length === 0) continue;
    indexMd += `## ${cat} (${catEntries.length})\n\n`;
    for (const e of catEntries.sort((a, b) => a.slug.localeCompare(b.slug))) {
      const desc = e.frontmatter.description || "";
      const shortDesc = desc.length > 80 ? desc.slice(0, 80) + "…" : desc;
      indexMd += `- **${e.slug}** — ${shortDesc}\n`;
    }
    indexMd += "\n";
  }
  fs.writeFileSync(WIKI_INDEX_FILE, indexMd);

  console.log(
    `✅ Manifest generated: ${entries.length} entries, ${nodes.length} nodes, ${edges.length} edges`
  );
  console.log(
    `✅ Search index: ${searchIndex.length} entries → public/search-index.json`
  );
  console.log(
    `✅ Wiki index: wiki-index.md (${entries.length} entries, agent drill-down용)`
  );
}

main();
