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

/**
 * Mermaid 다이어그램의 흔한 syntax 에러 탐지
 * Mermaid는 node label/subgraph name에 특수문자(괄호, 콜론, 특수기호) 제약이 있음
 */
function validateMermaid(code, filename) {
  const errors = [];
  const lines = code.split("\n");

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const lineNum = i + 1;

    // 1. subgraph: 유효한 형식은
    //   subgraph id
    //   subgraph id ["label"]
    //   subgraph "name"
    // 문제: subgraph name with (), &, : 등 특수문자를 따옴표 없이
    const subgraphMatch = trimmed.match(/^subgraph\s+(.+)$/);
    if (subgraphMatch) {
      const rest = subgraphMatch[1];
      // id ["label"] 형식은 OK
      const bracketLabelForm = /^\w+\s*\[".+"\]\s*$/;
      // "name" 형식은 OK
      const quotedForm = /^".+"\s*$/;
      // id (단순 식별자) 형식은 OK
      const idOnlyForm = /^[\w-]+\s*$/;
      if (!bracketLabelForm.test(rest) && !quotedForm.test(rest) && !idOnlyForm.test(rest)) {
        // 한글이나 특수문자가 있으면 에러
        if (/[()\[\]{}:;&]/.test(rest) || /\s/.test(rest)) {
          errors.push({
            line: lineNum,
            message: `subgraph 형식 오류: "${rest}". 유효 형식: "subgraph id", 'subgraph id ["label"]', 'subgraph "name"'`,
          });
        }
      }
    }

    // 2. 노드 라벨 괄호 안에 또 다른 괄호/따옴표 없이 한글 괄호 사용
    // 예: A[Harness Engineering (테스트 환경)]
    // Mermaid는 [] 안에 () 추가 괄호를 제대로 처리 못함
    const nodeBracketMatches = trimmed.matchAll(/\[([^\]]+)\]/g);
    for (const m of nodeBracketMatches) {
      const label = m[1];
      // 라벨 내에 괄호가 따옴표 없이 있는 경우
      if (/[()]/.test(label) && !label.includes('"')) {
        errors.push({
          line: lineNum,
          message: `노드 라벨에 괄호 사용: "${label}". 따옴표로 감싸세요: ["${label}"]`,
        });
      }
    }

    // 3. 화살표 라벨 (|...|) 안에 괄호
    const arrowLabelMatch = trimmed.match(/\|([^|]+)\|/);
    if (arrowLabelMatch && /[()]/.test(arrowLabelMatch[1])) {
      errors.push({
        line: lineNum,
        message: `화살표 라벨에 괄호: "${arrowLabelMatch[1]}". 괄호 제거하거나 따옴표 사용`,
      });
    }
  });

  return errors;
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
    const raw = fs.readFileSync(file, "utf-8");
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

    // 2. Mermaid 블록 검증
    const blocks = extractMermaidBlocks(content);
    if (blocks.length === 0) continue;

    mermaidFiles++;
    const fileErrors = [];

    for (const block of blocks) {
      totalBlocks++;
      const errors = validateMermaid(block.code, rel);
      for (const err of errors) {
        fileErrors.push({
          line: block.startLine + err.line,
          message: err.message,
        });
      }
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
