#!/usr/bin/env node
/**
 * Layer 3 POC Phase 2b — 다국어 임베딩 모델 비교 벤치마크
 *
 * Phase 1과 동일한 7개 쿼리로 모델별 적중률 비교.
 * 메모리 룰: feedback_poc_baseline_variables — 모델 2~3개 동시 베이스라인 측정.
 *
 * 사용:
 *   node scripts/benchmark-models.mjs
 *
 * 산출물:
 *   - 터미널: 모델별 쿼리 적중률 비교표
 *   - public/embeddings.{modelSlug}.json — 모델별 인덱스 (gitignore)
 *   - public/benchmark-results.json — 비교 결과 (gitignore)
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ── 벤치마크 대상 모델 ──
const MODELS = [
  {
    id: "Xenova/all-MiniLM-L6-v2",
    slug: "all-MiniLM-L6-v2",
    desc: "Phase 1 baseline (영어 위주)",
  },
  {
    id: "Xenova/multilingual-e5-small",
    slug: "multilingual-e5-small",
    desc: "94 언어 지원, 384-dim",
  },
  {
    id: "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
    slug: "paraphrase-multilingual-MiniLM-L12-v2",
    desc: "50+ 언어, 384-dim, paraphrase 특화",
  },
];

// ── Phase 1 동일 7개 테스트 쿼리 ──
const TEST_QUERIES = [
  // 한국어 3개 (Phase 1에서 모두 실패)
  {
    query: "Mermaid 노드 라벨 따옴표 누락",
    expected_slugs: [
      "harness-engineering/harness-journal-024-solution-to-validator-promotion",
      "solutions/mdx/2026-04-16-mermaid-br-in-unquoted-node-labels",
    ],
    lang: "ko",
  },
  {
    query: "프롬프트 캐싱 비용 절감",
    expected_slugs: ["tokenomics/prompt-caching-cost-reduction"],
    lang: "ko",
  },
  {
    query: "iOS 테스트가 실행 안 되는 문제",
    expected_slugs: ["ios-ai/tuist-spm-testing-trap"],
    lang: "ko",
  },
  // 영어 2개 (Phase 1에서 모두 성공)
  {
    query: "prompt caching cost reduction",
    expected_slugs: ["tokenomics/prompt-caching-cost-reduction"],
    lang: "en",
  },
  {
    query: "Tuist SPM productTypes",
    expected_slugs: ["ios-ai/tuist-spm-testing-trap"],
    lang: "en",
  },
  // 추가 한국어 2개 (Phase 2b 신규 — 다양한 패턴)
  {
    query: "self-hosted runner 전환 방법",
    expected_slugs: [
      "harness-engineering/aidy-journal-006-ios-ci-self-hosted-runner-migration",
      "harness-engineering/aidy-journal-007-ci-infra-independence-hybrid-fallback",
    ],
    lang: "ko",
  },
  {
    query: "continue-on-error 마스킹 버그",
    expected_slugs: [
      "harness-engineering/aidy-journal-007-ci-infra-independence-hybrid-fallback",
    ],
    lang: "ko",
  },
];

// ── embed-content.mjs와 동일한 청킹 로직 (DRY 위반이지만 벤치마크 독립성 우선) ──

const SOURCES = [
  { dir: "content", source_type: "entry", slug_prefix: "", ext: ".mdx" },
  { dir: "docs/solutions", source_type: "solution", slug_prefix: "solutions", ext: ".md" },
  { dir: "docs/retros", source_type: "retro", slug_prefix: "retros", ext: ".md" },
];

const MIN_CHUNK_LEN = 200;
const MAX_CHUNK_LEN = 2000;

function findFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) results.push(...findFiles(fullPath, ext));
    else if (item.name.endsWith(ext)) results.push(fullPath);
  }
  return results;
}

function chunkByH2(content) {
  const lines = content.split("\n");
  const chunks = [];
  let current = { h2: null, body: [] };
  for (const line of lines) {
    if (/^## /.test(line)) {
      if (current.body.length > 0 || current.h2) {
        chunks.push({ h2: current.h2, text: current.body.join("\n").trim() });
      }
      current = { h2: line.replace(/^##\s+/, "").trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.body.length > 0 || current.h2) {
    chunks.push({ h2: current.h2, text: current.body.join("\n").trim() });
  }
  const merged = [];
  let buffer = null;
  for (const chunk of chunks) {
    if (!buffer) { buffer = chunk; continue; }
    if (buffer.text.length < MIN_CHUNK_LEN) {
      buffer = { h2: buffer.h2 || chunk.h2, text: buffer.text + "\n\n" + (chunk.h2 ? `## ${chunk.h2}\n` : "") + chunk.text };
    } else { merged.push(buffer); buffer = chunk; }
  }
  if (buffer) merged.push(buffer);
  const final = [];
  for (const chunk of merged) {
    if (chunk.text.length <= MAX_CHUNK_LEN) { final.push(chunk); }
    else {
      let remaining = chunk.text;
      let part = 0;
      while (remaining.length > 0) {
        final.push({ h2: chunk.h2 + (part > 0 ? ` (cont. ${part})` : ""), text: remaining.slice(0, MAX_CHUNK_LEN) });
        remaining = remaining.slice(MAX_CHUNK_LEN);
        part++;
      }
    }
  }
  return final.filter((c) => c.text.length >= 50);
}

function buildEmbeddingText(entryTitle, h2, text) {
  const parts = [];
  if (entryTitle) parts.push(`# ${entryTitle}`);
  if (h2) parts.push(`## ${h2}`);
  parts.push(text);
  return parts.join("\n\n");
}

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

// ── 콘텐츠 수집 (1회) ──
function collectChunks() {
  const allChunks = [];
  for (const source of SOURCES) {
    const sourceDir = path.join(process.cwd(), source.dir);
    const files = findFiles(sourceDir, source.ext);
    for (const file of files) {
      const rel = path.relative(process.cwd(), file);
      const raw = fs.readFileSync(file, "utf-8");
      const { data, content } = matter(raw);
      const parts = rel.split(path.sep);
      let category, filename, slug;
      if (source.source_type === "entry") {
        category = parts[1];
        filename = parts[parts.length - 1].replace(new RegExp(`\\${source.ext}$`), "");
        slug = `${category}/${filename}`;
      } else if (source.source_type === "solution") {
        category = parts[2] || "uncategorized";
        filename = parts[parts.length - 1].replace(/\.md$/, "");
        slug = `${source.slug_prefix}/${category}/${filename}`;
      } else {
        category = "retro";
        filename = parts[parts.length - 1].replace(/\.md$/, "");
        slug = `${source.slug_prefix}/${filename}`;
      }
      const chunks = chunkByH2(content);
      for (let i = 0; i < chunks.length; i++) {
        allChunks.push({
          source: source.source_type,
          slug, category,
          title: data.title || filename,
          tags: data.tags || [],
          date: data.date || null,
          confidence: data.confidence ?? null,
          h2_title: chunks[i].h2 || "(intro)",
          chunk_index: i,
          chunk_text: chunks[i].text,
        });
      }
    }
  }
  return allChunks;
}

// ── 단일 모델 벤치마크 ──
async function benchmarkModel(model, allChunks, pipelineFn) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`📦 Model: ${model.id} (${model.desc})`);
  console.log(`${"═".repeat(60)}`);

  const extractor = await pipelineFn("feature-extraction", model.id);

  // 1. 전체 인덱스 임베딩
  console.log(`   Embedding ${allChunks.length} chunks...`);
  const embedStart = Date.now();
  const vectors = [];
  for (let i = 0; i < allChunks.length; i++) {
    const meta = allChunks[i];
    const text = buildEmbeddingText(meta.title, meta.h2_title, meta.chunk_text);
    const output = await extractor(text, { pooling: "mean", normalize: true });
    vectors.push(Array.from(output.data));
    if ((i + 1) % 100 === 0 || i === allChunks.length - 1) {
      process.stdout.write(`\r   [${(((i + 1) / allChunks.length) * 100).toFixed(0)}%] ${i + 1}/${allChunks.length}`);
    }
  }
  const embedTime = ((Date.now() - embedStart) / 1000).toFixed(1);
  console.log(`\n   임베딩 완료 (${embedTime}s, ${vectors[0]?.length || 0}d)`);

  // 2. 인덱스 저장
  const indexPath = path.join(process.cwd(), "public", `embeddings.${model.slug}.json`);
  const index = {
    model: model.id,
    dim: vectors[0]?.length || 0,
    created_at: new Date().toISOString(),
    chunks: allChunks.map((meta, i) => ({ ...meta, vector: vectors[i] })),
  };
  fs.writeFileSync(indexPath, JSON.stringify(index));
  const sizeKB = (fs.statSync(indexPath).size / 1024).toFixed(0);
  console.log(`   인덱스 저장: ${indexPath} (${sizeKB} KB)`);

  // 3. 쿼리 테스트
  const results = [];
  for (const tq of TEST_QUERIES) {
    const queryOutput = await extractor(tq.query, { pooling: "mean", normalize: true });
    const queryVec = Array.from(queryOutput.data);

    const searchStart = Date.now();
    const scored = index.chunks.map((chunk) => ({
      slug: chunk.slug,
      h2_title: chunk.h2_title,
      score: cosineSimilarity(queryVec, chunk.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    const searchMs = Date.now() - searchStart;

    // Top-1 적중 판단: expected_slugs 중 하나라도 Top-1 slug에 포함
    const top1 = scored[0];
    const top3Slugs = scored.slice(0, 3).map((s) => s.slug);
    const hit1 = tq.expected_slugs.some((es) => top1.slug === es);
    const hit3 = tq.expected_slugs.some((es) => top3Slugs.includes(es));

    results.push({
      query: tq.query,
      lang: tq.lang,
      expected: tq.expected_slugs,
      top1_slug: top1.slug,
      top1_h2: top1.h2_title,
      top1_score: parseFloat(top1.score.toFixed(4)),
      top3_slugs: top3Slugs,
      hit_at_1: hit1,
      hit_at_3: hit3,
      search_ms: searchMs,
    });
  }

  // 4. 결과 출력
  const koResults = results.filter((r) => r.lang === "ko");
  const enResults = results.filter((r) => r.lang === "en");
  const koHit1 = koResults.filter((r) => r.hit_at_1).length;
  const koHit3 = koResults.filter((r) => r.hit_at_3).length;
  const enHit1 = enResults.filter((r) => r.hit_at_1).length;
  const enHit3 = enResults.filter((r) => r.hit_at_3).length;

  console.log(`\n   🇰🇷 한국어 (${koResults.length}건): Top-1 ${koHit1}/${koResults.length} | Top-3 ${koHit3}/${koResults.length}`);
  console.log(`   🇺🇸 영어   (${enResults.length}건): Top-1 ${enHit1}/${enResults.length} | Top-3 ${enHit3}/${enResults.length}`);
  console.log(`   📊 전체   (${results.length}건): Top-1 ${koHit1 + enHit1}/${results.length} | Top-3 ${koHit3 + enHit3}/${results.length}`);

  console.log("\n   상세:");
  for (const r of results) {
    const flag = r.lang === "ko" ? "🇰🇷" : "🇺🇸";
    const hitIcon = r.hit_at_1 ? "✅" : r.hit_at_3 ? "🟡" : "❌";
    console.log(`   ${hitIcon} ${flag} "${r.query}"`);
    console.log(`      → Top-1: ${r.top1_slug} § ${r.top1_h2} (${r.top1_score}) [${r.search_ms}ms]`);
    if (!r.hit_at_1 && r.hit_at_3) {
      console.log(`      → Top-3 hit`);
    }
  }

  return {
    model: model.id,
    slug: model.slug,
    desc: model.desc,
    dim: vectors[0]?.length || 0,
    embed_time_s: parseFloat(embedTime),
    index_size_kb: parseInt(sizeKB),
    chunks: allChunks.length,
    ko_hit1: koHit1,
    ko_total: koResults.length,
    ko_hit3: koHit3,
    en_hit1: enHit1,
    en_total: enResults.length,
    en_hit3: enHit3,
    total_hit1: koHit1 + enHit1,
    total_hit3: koHit3 + enHit3,
    total: results.length,
    queries: results,
  };
}

// ── Main ──
async function main() {
  console.log("🏁 Layer 3 POC Phase 2b — 다국어 임베딩 모델 비교 벤치마크");
  console.log(`   모델 ${MODELS.length}개 × 쿼리 ${TEST_QUERIES.length}개\n`);

  // 콘텐츠 1회 수집
  const allChunks = collectChunks();
  console.log(`📄 콘텐츠 수집: ${allChunks.length} chunks`);

  const { pipeline } = await import("@xenova/transformers");

  const allResults = [];
  for (const model of MODELS) {
    const result = await benchmarkModel(model, allChunks, pipeline);
    allResults.push(result);
  }

  // ── 최종 비교표 ──
  console.log(`\n\n${"═".repeat(70)}`);
  console.log("📊 최종 비교표");
  console.log(`${"═".repeat(70)}\n`);

  const header = "| 모델 | 차원 | 임베딩(s) | 인덱스(KB) | 🇰🇷 Top-1 | 🇰🇷 Top-3 | 🇺🇸 Top-1 | 🇺🇸 Top-3 | 전체 Top-1 |";
  const sep =    "|------|------|-----------|-----------|---------|---------|---------|---------|-----------|";
  console.log(header);
  console.log(sep);
  for (const r of allResults) {
    console.log(
      `| ${r.slug} | ${r.dim} | ${r.embed_time_s} | ${r.index_size_kb} | ${r.ko_hit1}/${r.ko_total} | ${r.ko_hit3}/${r.ko_total} | ${r.en_hit1}/${r.en_total} | ${r.en_hit3}/${r.en_total} | ${r.total_hit1}/${r.total} |`
    );
  }

  // ── 결과 저장 ──
  const resultPath = path.join(process.cwd(), "public", "benchmark-results.json");
  fs.writeFileSync(resultPath, JSON.stringify({ timestamp: new Date().toISOString(), models: allResults }, null, 2));
  console.log(`\n✅ 결과 저장: ${resultPath}`);

  // ── 승자 판정 ──
  const best = allResults.reduce((a, b) => {
    // 한국어 Top-1 우선 → 전체 Top-1 → 임베딩 시간
    if (a.ko_hit1 !== b.ko_hit1) return a.ko_hit1 > b.ko_hit1 ? a : b;
    if (a.total_hit1 !== b.total_hit1) return a.total_hit1 > b.total_hit1 ? a : b;
    return a.embed_time_s < b.embed_time_s ? a : b;
  });
  console.log(`\n🏆 추천: ${best.slug} (🇰🇷 Top-1: ${best.ko_hit1}/${best.ko_total}, 전체: ${best.total_hit1}/${best.total})`);
}

main().catch((err) => {
  console.error("❌ Benchmark failed:", err);
  process.exit(1);
});
