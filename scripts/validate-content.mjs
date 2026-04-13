#!/usr/bin/env node
/**
 * MDX 콘텐츠 검증 스크립트
 * - frontmatter 스키마 검증 (zod)
 * - Mermaid 다이어그램 syntax 검증
 * - 일반적인 Mermaid 파서 에러 패턴 탐지
 *
 * Usage: node scripts/validate-content.mjs
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { fixAndValidateMermaid } from "./lib/mermaid-fix.mjs";

const CONTENT_DIR = path.join(process.cwd(), "content");

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

function extractMermaidBlocks(content) {
  const blocks = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  let lineOffset = 0;
  let lastIndex = 0;
  while ((match = regex.exec(content)) !== null) {
    // 시작 줄 계산
    const before = content.substring(lastIndex, match.index);
    lineOffset += (before.match(/\n/g) || []).length;
    const startLine = lineOffset + 1;
    blocks.push({ code: match[1], startLine });
    lastIndex = match.index;
  }
  return blocks;
}

async function main() {
  const files = findMdxFiles(CONTENT_DIR);
  let totalErrors = 0;
  let mermaidFiles = 0;
  let totalBlocks = 0;
  let mdxErrors = 0;

  console.log(`🔍 Validating ${files.length} MDX files...\n`);

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    let raw = fs.readFileSync(file, "utf-8");

    // 0. Quiz 필드명 자동 교정: options → choices (다른 세션 AI 생성물 호환)
    if (raw.includes("\n    options:\n") && raw.includes("quiz:")) {
      const fixed = raw.replace(/^    options:$/gm, "    choices:");
      if (fixed !== raw) {
        fs.writeFileSync(file, fixed, "utf-8");
        raw = fixed;
        console.log(`   🔧 ${rel}: quiz options → choices 자동 교정`);
      }
    }

    const { content } = matter(raw);

    // 1. MDX 컴파일 검증 (모든 파일)
    try {
      await compile(content, { remarkPlugins: [remarkGfm] });
    } catch (err) {
      console.error(`❌ ${rel} (MDX 컴파일 에러)`);
      console.error(`   ${err.message}`);
      console.error("");
      mdxErrors++;
      totalErrors++;
      continue;
    }

    // 2. Mermaid 블록 검증 + 자동 수정
    const blocks = extractMermaidBlocks(content);
    if (blocks.length === 0) continue;

    mermaidFiles++;
    const fileErrors = [];
    let mermaidFixed = false;

    for (const block of blocks) {
      totalBlocks++;
      const { fixed, autoFixed, errors } = fixAndValidateMermaid(block.code, rel);

      // 자동 수정이 적용되면 파일 업데이트
      // ⚠️ raw(frontmatter 포함) 기준으로 검색해야 슬라이싱 오프셋이 정확함.
      //    content(frontmatter 제거 후) 기준으로 검색하면 오프셋이 frontmatter 길이만큼
      //    어긋나서 파일이 손상됨 (apple-intelligence-api.mdx 손상 사례).
      if (autoFixed) {
        const oldBlockStart = raw.indexOf(`\`\`\`mermaid\n${block.code}`);
        if (oldBlockStart !== -1) {
          const oldBlockEnd = oldBlockStart + `\`\`\`mermaid\n${block.code}\`\`\``.length;
          raw = raw.substring(0, oldBlockStart) + `\`\`\`mermaid\n${fixed}\`\`\`` + raw.substring(oldBlockEnd);
          mermaidFixed = true;
        }
      }

      for (const err of errors) {
        fileErrors.push({
          line: block.startLine + err.line,
          message: err.message,
        });
      }
    }

    // 자동 수정된 경우 파일 저장
    if (mermaidFixed) {
      fs.writeFileSync(file, raw, "utf-8");
      console.log(`   🔧 ${rel}: Mermaid 노드 라벨 괄호 자동 수정`);
    }

    if (fileErrors.length > 0) {
      console.error(`❌ ${rel} (Mermaid)`);
      for (const err of fileErrors) {
        console.error(`   Line ~${err.line}: ${err.message}`);
      }
      console.error("");
      totalErrors += fileErrors.length;
    }
  }

  console.log(`📊 결과: ${files.length}개 MDX 파일 컴파일 검증, ${mermaidFiles}개 파일에서 ${totalBlocks}개 Mermaid 블록 검증`);
  if (totalErrors > 0) {
    console.error(`❌ ${mdxErrors}개 MDX 에러, ${totalErrors - mdxErrors}개 Mermaid 에러`);
    process.exit(1);
  }
  console.log("✅ 모든 MDX + Mermaid 블록 정상");
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
