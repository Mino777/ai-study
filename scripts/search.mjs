#!/usr/bin/env node
/**
 * Layer 3 (JIT Retrieval) POC Phase 1 — 검색 CLI
 *
 * 쿼리 → 임베딩 → 코사인 유사도 → Top-K
 *
 * 사용:
 *   node scripts/search.mjs "<query>" [topK=5]
 *
 * 예시:
 *   node scripts/search.mjs "Mermaid 노드 라벨 따옴표 누락"
 *   node scripts/search.mjs "프롬프트 캐싱 적용 방법" 3
 *
 * 전제:
 *   public/embeddings.json 이 존재해야 함 (먼저 npm run embed-content 실행)
 *
 * 설계:
 *  - 코사인 유사도 = dot product (벡터가 이미 정규화됨)
 *  - 100% in-memory brute force — 106 엔트리 × ~500 청크 수준은 ANN 불필요
 *    (vector-search-basics §6: 1000 미만 문서는 brute force 가 더 빠르고 단순)
 *  - 출력: rank · score · slug · h2_title · chunk_text 처음 200자
 */

import fs from "fs";
import path from "path";

const INDEX_FILE = path.join(process.cwd(), "public", "embeddings.json");

function cosineSimilarity(a, b) {
  // 둘 다 정규화된 벡터 → dot product 가 코사인
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

async function main() {
  const query = process.argv[2];
  const topK = parseInt(process.argv[3] || "5", 10);

  if (!query) {
    console.error("Usage: node scripts/search.mjs \"<query>\" [topK=5]");
    process.exit(1);
  }

  if (!fs.existsSync(INDEX_FILE)) {
    console.error(`❌ Index not found: ${INDEX_FILE}`);
    console.error("   먼저 npm run embed-content 실행");
    process.exit(1);
  }

  console.log(`🔍 Query: "${query}"`);
  console.log("📦 Loading index + model...");

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
  console.log(`   Index: ${index.chunks.length} chunks, ${index.dim}d, model=${index.model}`);

  const { pipeline } = await import("@xenova/transformers");
  const extractor = await pipeline("feature-extraction", index.model);

  // 쿼리 임베딩
  const queryOutput = await extractor(query, { pooling: "mean", normalize: true });
  const queryVec = Array.from(queryOutput.data);

  // 모든 청크와 코사인 유사도 계산
  const start = Date.now();
  const scored = index.chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryVec, chunk.vector),
  }));
  scored.sort((a, b) => b.score - a.score);
  const elapsed = Date.now() - start;

  const top = scored.slice(0, topK);

  console.log(`\n⚡ Top ${topK} (검색 ${elapsed}ms)\n`);
  for (let i = 0; i < top.length; i++) {
    const r = top[i];
    const preview = r.chunk_text.replace(/\n+/g, " ").slice(0, 200);
    const sourceTag = r.source ? `[${r.source}]` : "";
    const pathPrefix = r.source === "entry" || !r.source ? "/wiki/" : "/";
    console.log(`#${i + 1}  score=${r.score.toFixed(4)}  ${sourceTag}`);
    console.log(`     ${r.title}`);
    console.log(`     ${pathPrefix}${r.slug} § ${r.h2_title}`);
    console.log(`     ${preview}${r.chunk_text.length > 200 ? "…" : ""}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error("❌ Search failed:", err);
  process.exit(1);
});
