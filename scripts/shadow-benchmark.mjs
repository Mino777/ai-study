#!/usr/bin/env node
/**
 * shadow-benchmark.mjs — Layer 3 Phase 3 섀도우 모드 벤치마크
 *
 * 전체 컨텍스트 로드 vs JIT top-K 주입의 토큰 절감률 + 적중률 측정.
 *
 * 사용:
 *   node scripts/shadow-benchmark.mjs
 *
 * 전제:
 *   public/embeddings.json 이 존재해야 함 (npm run embed-content)
 *
 * 측정 항목:
 *   1. 토큰 절감률: (전체 토큰 - JIT 토큰) / 전체 토큰
 *   2. 적중률: 기대 slug가 top-K에 포함되는 비율
 *   3. 청크 크기 분포: JIT 주입 시 토큰 수 통계
 */
import fs from "fs";
import path from "path";
import { routeQuery } from "./lib/query-router.mjs";

const INDEX_FILE = path.join(process.cwd(), "public", "embeddings.json");
const CONTENT_DIR = path.join(process.cwd(), "content");

// 토큰 수 추정 (rough: 1 token ≈ 3.5 chars for 한/영 혼합)
function estimateTokens(charCount) {
  return Math.ceil(charCount / 3.5);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

// 테스트 쿼리 세트: query + 기대 slug (적중률 측정용)
const TEST_QUERIES = [
  {
    query: "Mermaid 노드 라벨 따옴표 누락 에러",
    expectedSlug: "harness-engineering/harness-journal-024-solution-to-validator-promotion",
    category: "error",
  },
  {
    query: "프롬프트 캐싱으로 비용 절감하는 방법",
    expectedSlug: "tokenomics/prompt-caching-cost-reduction",
    category: "tech",
  },
  {
    query: "Circuit Breaker 폴백 패턴",
    expectedSlug: "harness-engineering/ai-call-patterns-circuit-breaker-fallback",
    category: "tech",
  },
  {
    query: ".claudeignore SPM 멀티모듈 함정",
    expectedSlug: "ios-ai/ios-ai-journal-003-claudeignore-spm",
    category: "error",
  },
  {
    query: "Few-shot 예시 선택 전략",
    expectedSlug: "prompt-engineering/few-shot-prompting",
    category: "tech",
  },
  {
    query: "squash merge 함정 워크트리",
    expectedSlug: "harness-engineering/wt-branch-structural-safety",
    category: "error",
  },
  {
    query: "RAG 벡터 검색 임베딩 모델 비교",
    expectedSlug: "rag/vector-search-basics",
    category: "tech",
  },
  {
    query: "Zod 스키마로 LLM 출력 검증",
    expectedSlug: "harness-engineering/ai-output-zod-validation-pattern",
    category: "tech",
  },
  {
    query: "Vercel Hobby cron 실패 원인",
    expectedSlug: "infrastructure/vercel-hobby-cron-silent-failure",
    category: "error",
  },
  {
    query: "다중 세션 동시 작업 충돌 방지",
    expectedSlug: "harness-engineering/multi-session-ai-ops-patterns",
    category: "tech",
  },
  {
    query: "SSE 스트리밍 아키텍처 구현",
    expectedSlug: "infrastructure/streaming-architecture",
    category: "tech",
  },
  {
    query: "Compound Engineering 복리 원칙",
    expectedSlug: "harness-engineering/compound-engineering-philosophy",
    category: "tech",
  },
  {
    query: "ccusage 프로젝트별 비용 분석",
    expectedSlug: "tokenomics/project-level-cost-analysis-pattern",
    category: "tech",
  },
  {
    query: "Error Boundary crash React 죽음",
    expectedSlug: "frontend-ai/crash-safe-error-boundary",
    category: "error",
  },
  {
    query: "병렬 에이전트 배치 수정 카테고리 분리",
    expectedSlug: "harness-engineering/parallel-agent-batch-modification-pattern",
    category: "tech",
  },
];

function findMdxFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) results.push(...findMdxFiles(fullPath));
    else if (item.name.endsWith(".mdx")) results.push(fullPath);
  }
  return results;
}

async function main() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.error(`❌ Index not found: ${INDEX_FILE}`);
    console.error("   먼저 npm run embed-content 실행");
    process.exit(1);
  }

  // 1. 전체 콘텐츠 토큰 계산 (Layer 1 시나리오)
  const allFiles = findMdxFiles(CONTENT_DIR);
  let totalContentChars = 0;
  for (const f of allFiles) {
    totalContentChars += fs.readFileSync(f, "utf-8").length;
  }
  const totalContentTokens = estimateTokens(totalContentChars);

  console.log("═══════════════════════════════════════════════════");
  console.log("  Layer 3 Phase 3 — 섀도우 모드 벤치마크");
  console.log("═══════════════════════════════════════════════════\n");
  console.log(`📚 전체 콘텐츠: ${allFiles.length}개 파일, ~${totalContentChars.toLocaleString()} chars, ~${totalContentTokens.toLocaleString()} tokens`);

  // 2. 인덱스 + 모델 로드
  console.log("📦 Loading index + model...\n");
  const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
  console.log(`   Index: ${index.chunks.length} chunks, ${index.dim}d, model=${index.model}`);

  const { pipeline } = await import("@xenova/transformers");
  const extractor = await pipeline("feature-extraction", index.model);

  // 3. 각 쿼리 벤치마크
  const TOP_K = 5;
  let totalHits = 0;
  let totalTop1Hits = 0;
  let totalJitTokens = 0;
  const results = [];

  console.log(`\n🔍 ${TEST_QUERIES.length} 쿼리 벤치마크 (top-${TOP_K}):\n`);

  for (const test of TEST_QUERIES) {
    // 라우터 체크
    const route = routeQuery(test.query);

    // 임베딩
    const output = await extractor(test.query, { pooling: "mean", normalize: true });
    const queryVec = Array.from(output.data);

    // 검색
    const start = Date.now();
    const scored = index.chunks.map((chunk) => ({
      slug: chunk.slug,
      h2_title: chunk.h2_title,
      chunk_text: chunk.chunk_text,
      score: cosineSimilarity(queryVec, chunk.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    const elapsed = Date.now() - start;

    const topResults = scored.slice(0, TOP_K);

    // 적중률: 기대 slug가 top-K에 있는가
    const hitInTopK = topResults.some((r) => r.slug === test.expectedSlug);
    const hitInTop1 = topResults[0]?.slug === test.expectedSlug;
    if (hitInTopK) totalHits++;
    if (hitInTop1) totalTop1Hits++;

    // JIT 토큰: top-K 청크의 토큰 합
    const jitChars = topResults.reduce((sum, r) => sum + r.chunk_text.length, 0);
    const jitTokens = estimateTokens(jitChars);
    totalJitTokens += jitTokens;

    const icon = hitInTop1 ? "✅" : hitInTopK ? "🟡" : "❌";
    console.log(`${icon} "${test.query.slice(0, 40)}..." (${elapsed}ms)`);
    console.log(`   Top-1: ${topResults[0]?.slug} (${topResults[0]?.score.toFixed(4)})`);
    console.log(`   Expected: ${test.expectedSlug} ${hitInTopK ? `(rank ${topResults.findIndex(r => r.slug === test.expectedSlug) + 1})` : "(NOT in top-K)"}`);
    console.log(`   JIT: ~${jitTokens} tokens | Router: ${route.shouldSearch ? "✓" : "✗"} (${route.reason})`);
    console.log("");

    results.push({
      query: test.query,
      hitInTopK,
      hitInTop1,
      jitTokens,
      top1Slug: topResults[0]?.slug,
      top1Score: topResults[0]?.score,
      elapsed,
      routerPass: route.shouldSearch,
    });
  }

  // 4. 종합 결과
  const avgJitTokens = Math.round(totalJitTokens / TEST_QUERIES.length);
  const savingsPercent = ((1 - avgJitTokens / totalContentTokens) * 100).toFixed(1);
  const hitRate = ((totalHits / TEST_QUERIES.length) * 100).toFixed(0);
  const top1Rate = ((totalTop1Hits / TEST_QUERIES.length) * 100).toFixed(0);
  const routerPassRate = ((results.filter(r => r.routerPass).length / TEST_QUERIES.length) * 100).toFixed(0);

  console.log("═══════════════════════════════════════════════════");
  console.log("  섀도우 모드 벤치마크 결과");
  console.log("═══════════════════════════════════════════════════\n");
  console.log(`📊 전체 콘텐츠: ~${totalContentTokens.toLocaleString()} tokens (${allFiles.length} files)`);
  console.log(`📊 JIT 평균:    ~${avgJitTokens.toLocaleString()} tokens (top-${TOP_K} chunks)`);
  console.log(`📊 토큰 절감:   ${savingsPercent}%`);
  console.log(`📊 적중률 (Top-${TOP_K}): ${hitRate}% (${totalHits}/${TEST_QUERIES.length})`);
  console.log(`📊 적중률 (Top-1):  ${top1Rate}% (${totalTop1Hits}/${TEST_QUERIES.length})`);
  console.log(`📊 라우터 통과율:   ${routerPassRate}% (${results.filter(r => r.routerPass).length}/${TEST_QUERIES.length})`);
  console.log("");

  // 성공 기준 판정
  const tokenPass = parseFloat(savingsPercent) >= 20;
  const hitPass = parseInt(hitRate) >= 70;
  console.log("🎯 성공 기준:");
  console.log(`   ${tokenPass ? "✅" : "❌"} 토큰 절감 ≥ 20% → ${savingsPercent}%`);
  console.log(`   ${hitPass ? "✅" : "❌"} 적중률 (Top-K) ≥ 70% → ${hitRate}%`);
  console.log(`   ${tokenPass && hitPass ? "✅ Phase 3 통과!" : "⚠️ 기준 미달 — 개선 필요"}`);

  // CI 파싱용 영문 summary (weekly-search-benchmark.yml grep 패턴 대상)
  console.log("");
  console.log(`Hit Rate: ${hitRate}%`);
  console.log(`Token Savings: ${savingsPercent}%`);
}

main().catch((err) => {
  console.error("❌ Benchmark failed:", err);
  process.exit(1);
});
