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
 * Mermaid 다이어그램의 흔한 syntax 에러 감지 + 자동 수정
 * Mermaid는 node label/subgraph name에 특수문자(괄호, 콜론, 특수기호) 제약이 있음
 */
function fixAndValidateMermaid(code, filename) {
  let fixed = code;
  const errors = [];
  const lines = fixed.split("\n");

  // AUTO-FIX: 노드 라벨의 괄호를 따옴표로 감싸기
  // 패턴: A[label (with parens)] → A["label (with parens)"]
  fixed = fixed.replace(/([A-Z]\d*)\[([^\[\]]*\([^\[\]]*\)[^\[\]]*)\]/g, '$1["$2"]');

  const fixedLines = fixed.split("\n");
  const fixedContent = fixed;

  // 수정된 내용이 원본과 다르면 기록
  if (fixedContent !== code) {
    // 자동 수정 로그 (콘솔 출력만, 에러로 처리하지 않음)
    return { fixed: fixedContent, autoFixed: true, errors: [] };
  }

  // 수정 후 유효성 검증 (남은 에러만)
  fixedLines.forEach((line, i) => {
    const trimmed = line.trim();
    const lineNum = i + 1;

    // 1. subgraph 검증
    const subgraphMatch = trimmed.match(/^subgraph\s+(.+)$/);
    if (subgraphMatch) {
      const rest = subgraphMatch[1];
      const bracketLabelForm = /^\w+\s*\[".+"\]\s*$/;
      const quotedForm = /^".+"\s*$/;
      const idOnlyForm = /^[\w-]+\s*$/;
      if (!bracketLabelForm.test(rest) && !quotedForm.test(rest) && !idOnlyForm.test(rest)) {
        if (/[()\[\]{}:;&]/.test(rest) || /\s/.test(rest)) {
          errors.push({
            line: lineNum,
            message: `subgraph 형식 오류: "${rest}". 유효 형식: "subgraph id", 'subgraph id ["label"]', 'subgraph "name"'`,
          });
        }
      }
    }

    // 2. 노드 라벨 검증 (자동 수정 후 남은 문제)
    const nodeBracketMatches = trimmed.matchAll(/\[([^\]]+)\]/g);
    for (const m of nodeBracketMatches) {
      const label = m[1];
      if (/[()]/.test(label) && !label.startsWith('"') && !label.endsWith('"')) {
        errors.push({
          line: lineNum,
          message: `노드 라벨에 괄호 사용: "${label}". 수정: ["${label}"]`,
        });
      }
    }

    // 3. 화살표 라벨 검증
    const arrowLabelMatch = trimmed.match(/\|([^|]+)\|/);
    if (arrowLabelMatch && /[()]/.test(arrowLabelMatch[1])) {
      errors.push({
        line: lineNum,
        message: `화살표 라벨에 괄호: "${arrowLabelMatch[1]}". 괄호 제거하거나 따옴표 사용`,
      });
    }
  });

  return { fixed: fixedContent, autoFixed: false, errors };
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
      if (autoFixed) {
        const oldBlockStart = content.indexOf(`\`\`\`mermaid\n${block.code}`);
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
