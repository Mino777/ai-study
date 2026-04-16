#!/usr/bin/env node
/**
 * Layer 3 (JIT Retrieval) POC Phase 1 — 임베딩 인덱서
 *
 * content/**\/*.mdx → 섹션(H2) 단위 청킹 → 로컬 임베딩 → JSON 인덱스
 *
 * 사용:
 *   node scripts/embed-content.mjs
 *
 * 산출물:
 *   public/embeddings.json (gitignore)
 *
 * 설계 결정:
 *  - 모델: @xenova/transformers + Xenova/all-MiniLM-L6-v2
 *    · 100% 로컬, 외부 API 0, 한·영 모두 지원, 384차원
 *    · 첫 실행 시 ~80MB 모델 다운로드 후 ./node_modules/.cache 에 캐시
 *  - 청킹: H2 (`## `) 단위. 한 .mdx → N 청크
 *    · POC 엔트리 §10 안티패턴 "단일 전체 .mdx 임베딩" 회피
 *    · 청크가 너무 작으면 (< 100자) 다음 H2 와 합침
 *  - 메타: slug · title · category · tags · date · confidence · h2_title · chunk_text
 *  - 벡터 저장: 단순 JSON. 106 문서 × ~5 청크/문서 ≈ 500 벡터 × 384 float = ~750KB
 *  - 거리 함수: 코사인 유사도 (모델 출력이 이미 정규화됐지만 검색 시 명시적 계산)
 *
 * 향후 확장 (Phase 2+):
 *  - 인덱싱 자동화 (pre-commit hook 또는 CI)
 *  - 쿼리 라우터 + 섀도우 모드
 *  - 임베딩 모델 비교 (Voyage · OpenAI text-embedding-3-small)
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const OUTPUT_FILE = path.join(process.cwd(), "public", "embeddings.json");

// Phase 2 (Journal 025의 발견): docs/solutions, docs/retros 도 인덱싱.
// "에러 메시지 → 과거 솔루션" JIT 검색의 핵심 high-value 자산.
// Phase 1 v0는 content/ 만 보고 가장 가치 있는 자산을 누락했었음.
const SOURCES = [
  { dir: "content", source_type: "entry", slug_prefix: "", ext: ".mdx" },
  { dir: "docs/solutions", source_type: "solution", slug_prefix: "solutions", ext: ".md" },
  { dir: "docs/retros", source_type: "retro", slug_prefix: "retros", ext: ".md" },
];

// 청크 최소 크기 (이보다 작으면 다음 H2 와 합침)
const MIN_CHUNK_LEN = 200;
// 청크 최대 크기 (너무 길면 모델 윈도우 초과 + 신호 희석)
const MAX_CHUNK_LEN = 2000;

function findFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (item.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * MDX 본문을 H2 단위로 청킹.
 * - 첫 H2 이전 텍스트(서두) 는 별도 청크
 * - 짧은 청크는 다음 청크와 합침
 * - 너무 긴 청크는 자른 후 잔여를 새 청크로
 */
function chunkByH2(content) {
  const lines = content.split("\n");
  const chunks = [];
  let current = { h2: null, body: [] };

  for (const line of lines) {
    if (/^## /.test(line)) {
      // 이전 청크 확정
      if (current.body.length > 0 || current.h2) {
        chunks.push({
          h2: current.h2,
          text: current.body.join("\n").trim(),
        });
      }
      current = { h2: line.replace(/^##\s+/, "").trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.body.length > 0 || current.h2) {
    chunks.push({
      h2: current.h2,
      text: current.body.join("\n").trim(),
    });
  }

  // 짧은 청크는 다음 청크와 합치기
  const merged = [];
  let buffer = null;
  for (const chunk of chunks) {
    if (!buffer) {
      buffer = chunk;
      continue;
    }
    if (buffer.text.length < MIN_CHUNK_LEN) {
      buffer = {
        h2: buffer.h2 || chunk.h2,
        text: buffer.text + "\n\n" + (chunk.h2 ? `## ${chunk.h2}\n` : "") + chunk.text,
      };
    } else {
      merged.push(buffer);
      buffer = chunk;
    }
  }
  if (buffer) merged.push(buffer);

  // 너무 긴 청크는 잘라내기 (단순 cut, 향후 재청킹 검토)
  const final = [];
  for (const chunk of merged) {
    if (chunk.text.length <= MAX_CHUNK_LEN) {
      final.push(chunk);
    } else {
      // 단순 분할 — 향후 토큰 기반으로 개선
      let remaining = chunk.text;
      let part = 0;
      while (remaining.length > 0) {
        final.push({
          h2: chunk.h2 + (part > 0 ? ` (cont. ${part})` : ""),
          text: remaining.slice(0, MAX_CHUNK_LEN),
        });
        remaining = remaining.slice(MAX_CHUNK_LEN);
        part++;
      }
    }
  }

  return final.filter((c) => c.text.length >= 50); // 너무 짧은 잔여물 제거
}

/**
 * 임베딩 텍스트 구성:
 *  - h2 제목 + 본문 (제목이 핵심 시그널이라 포함)
 *  - frontmatter title 도 포함 (엔트리 주제 컨텍스트)
 */
function buildEmbeddingText(entryTitle, h2, text) {
  const parts = [];
  if (entryTitle) parts.push(`# ${entryTitle}`);
  if (h2) parts.push(`## ${h2}`);
  parts.push(text);
  return parts.join("\n\n");
}

async function main() {
  console.log("📦 Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
  console.log("   첫 실행 시 ~80MB 다운로드 (이후 캐시)");

  // dynamic import — top-level await 회피
  const { pipeline } = await import("@xenova/transformers");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
  );

  // Multi-source: content/ + docs/solutions/ + docs/retros/
  const allChunks = [];
  let totalChunks = 0;
  const sourceCounts = {};

  for (const source of SOURCES) {
    const sourceDir = path.join(process.cwd(), source.dir);
    const files = findFiles(sourceDir, source.ext);
    sourceCounts[source.source_type] = files.length;
    console.log(`\n🔍 [${source.source_type}] ${files.length} ${source.ext} files in ${source.dir}/`);

    for (const file of files) {
      const rel = path.relative(process.cwd(), file);
      const raw = fs.readFileSync(file, "utf-8");
      const { data, content } = matter(raw);

      // slug 도출
      // entry: content/<category>/<filename>.mdx → "<category>/<filename>"
      // solution: docs/solutions/<category>/<filename>.md → "solutions/<category>/<filename>"
      // retro: docs/retros/<filename>.md → "retros/<filename>"
      const parts = rel.split(path.sep);
      let category, filename, slug;
      if (source.source_type === "entry") {
        category = parts[1];
        filename = parts[parts.length - 1].replace(new RegExp(`\\${source.ext}$`), "");
        slug = `${category}/${filename}`;
      } else if (source.source_type === "solution") {
        // docs/solutions/<category>/<filename>.md
        category = parts[2] || "uncategorized";
        filename = parts[parts.length - 1].replace(/\.md$/, "");
        slug = `${source.slug_prefix}/${category}/${filename}`;
      } else {
        // retro: docs/retros/<filename>.md
        category = "retro";
        filename = parts[parts.length - 1].replace(/\.md$/, "");
        slug = `${source.slug_prefix}/${filename}`;
      }

      const chunks = chunkByH2(content);
      totalChunks += chunks.length;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        allChunks.push({
          source: source.source_type,  // "entry" | "solution" | "retro"
          slug,
          category,
          title: data.title || filename,
          tags: data.tags || [],
          date: data.date || null,
          confidence: data.confidence ?? null,
          h2_title: chunk.h2 || "(intro)",
          chunk_index: i,
          chunk_text: chunk.text,
        });
      }
    }
  }

  const totalFiles = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
  console.log(`\n🧮 ${totalChunks} chunks total from ${totalFiles} files (entry: ${sourceCounts.entry}, solution: ${sourceCounts.solution}, retro: ${sourceCounts.retro}). Embedding...`);

  const start = Date.now();
  const vectors = [];
  for (let i = 0; i < allChunks.length; i++) {
    const meta = allChunks[i];
    const text = buildEmbeddingText(meta.title, meta.h2_title, meta.chunk_text);
    const output = await extractor(text, { pooling: "mean", normalize: true });
    // tensor → 일반 배열 (정규화된 384 float)
    vectors.push(Array.from(output.data));

    if ((i + 1) % 50 === 0 || i === allChunks.length - 1) {
      const pct = (((i + 1) / allChunks.length) * 100).toFixed(0);
      process.stdout.write(`\r   [${pct}%] ${i + 1}/${allChunks.length}`);
    }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n   완료 (${elapsed}s)`);

  // 인덱스 저장
  const index = {
    model: "Xenova/all-MiniLM-L6-v2",
    dim: vectors[0]?.length || 0,
    created_at: new Date().toISOString(),
    chunks: allChunks.map((meta, i) => ({ ...meta, vector: vectors[i] })),
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index));

  const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(0);
  console.log(`\n✅ Index saved: public/embeddings.json (${sizeKB} KB, ${totalChunks} chunks, ${index.dim}d)`);
}

main().catch((err) => {
  console.error("❌ Embedding failed:", err);
  process.exit(1);
});
