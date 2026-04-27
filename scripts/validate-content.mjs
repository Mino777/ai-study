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

/**
 * MDX JSX 함정 사전 탐지 — 컴파일 에러 원인이 되는 패턴을 미리 경고.
 * AI 생성 콘텐츠에서 반복되는 패턴:
 * - 본문 텍스트의 {중괄호} → JSX expression으로 파싱
 * - 본문 텍스트의 <숫자 또는 <영문자 → JSX 태그 시작으로 파싱
 * - HTML void 태그 self-closing 누락 (<br>, <hr>, <img>)
 */
function detectJsxTraps(content, filePath) {
  const warnings = [];
  const lines = content.split("\n");
  let codeBlockFenceLen = 0; // 0 = 코드 블록 밖, >0 = 현재 코드 블록의 백틱 개수
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // frontmatter 영역 스킵
    if (i === 0 && line.trim() === "---") { inFrontmatter = true; continue; }
    if (inFrontmatter && line.trim() === "---") { inFrontmatter = false; continue; }
    if (inFrontmatter) continue;

    // 코드 블록 영역 스킵 — 백틱 개수 추적으로 중첩 코드 펜스 지원
    const fenceMatch = line.trim().match(/^(`{3,})/);
    if (fenceMatch) {
      const fenceLen = fenceMatch[1].length;
      if (codeBlockFenceLen === 0) {
        // 코드 블록 시작
        codeBlockFenceLen = fenceLen;
      } else if (fenceLen >= codeBlockFenceLen && line.trim() === fenceMatch[0]) {
        // 동일 이상 길이의 백틱만으로 구성된 줄 = 코드 블록 종료
        codeBlockFenceLen = 0;
      }
      continue;
    }
    if (codeBlockFenceLen > 0) continue;

    // 패턴 1: 본문 텍스트의 {중괄호} (인라인 코드 밖)
    // 인라인 코드(backtick) 안은 안전하므로 제거 후 체크
    const withoutInlineCode = line.replace(/`[^`]+`/g, "");
    const curlyMatch = withoutInlineCode.match(/\{[^}]*[a-zA-Z가-힣][^}]*\}/);
    if (curlyMatch) {
      warnings.push({
        line: lineNum,
        message: `{중괄호} JSX 파싱 위험: "${curlyMatch[0]}" → 인라인 코드(\`)로 감싸거나 괄호()로 교체`,
      });
    }

    // 패턴 2: 본문 텍스트의 <숫자 (예: <3, <10)
    const angleBracketNum = withoutInlineCode.match(/<(\d)/);
    if (angleBracketNum) {
      warnings.push({
        line: lineNum,
        message: `<${angleBracketNum[1]} JSX 태그 파싱 위험 → "< ${angleBracketNum[1]}" (공백) 또는 인라인 코드로 감싸기`,
      });
    }

    // 패턴 3: HTML void 태그 self-closing 누락
    const voidTag = withoutInlineCode.match(/<(br|hr|img)(?:\s[^>]*)?(?<!\/)>/i);
    if (voidTag) {
      warnings.push({
        line: lineNum,
        message: `<${voidTag[1]}> self-closing 누락 → <${voidTag[1]} /> 로 변경`,
      });
    }
  }
  return warnings;
}

/**
 * No-Placeholder Scan — Superpowers 패턴 이식.
 * 미완성 콘텐츠 마커를 탐지하여 경고. AI 생성 콘텐츠에서 빈번한 패턴.
 * 코드 블록/인라인 코드/frontmatter 안은 스킵 (정상 사용).
 */
function detectPlaceholders(content, filePath) {
  const warnings = [];
  const lines = content.split("\n");
  let codeBlockFenceLen = 0;
  let inFrontmatter = false;

  // 정밀도 우선: "TODO 개념을 설명하는" 콘텐츠와 "실제 미완성 마커"를 구분
  // TODO:/FIXME: 같은 actionable 마커만 탐지, 산문 속 개념 언급은 스킵
  const PLACEHOLDER_PATTERNS = [
    { regex: /\bTODO\s*[:(\-]/, label: "TODO" },
    { regex: /\bFIXME\s*[:(\-]/, label: "FIXME" },
    { regex: /\bLorem ipsum\b/i, label: "Lorem ipsum" },
    { regex: /구현\s*예정/, label: "구현 예정" },
    { regex: /추후\s*작성/, label: "추후 작성" },
    { regex: /작성\s*필요/, label: "작성 필요" },
    { regex: /\uFFFD/, label: "깨진 문자 (Unicode replacement character)" },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (i === 0 && line.trim() === "---") { inFrontmatter = true; continue; }
    if (inFrontmatter && line.trim() === "---") { inFrontmatter = false; continue; }
    if (inFrontmatter) continue;

    const fenceMatch = line.trim().match(/^(`{3,})/);
    if (fenceMatch) {
      const fenceLen = fenceMatch[1].length;
      if (codeBlockFenceLen === 0) { codeBlockFenceLen = fenceLen; }
      else if (fenceLen >= codeBlockFenceLen && line.trim() === fenceMatch[0]) { codeBlockFenceLen = 0; }
      continue;
    }
    if (codeBlockFenceLen > 0) continue;

    const withoutInlineCode = line.replace(/`[^`]+`/g, "");

    for (const { regex, label } of PLACEHOLDER_PATTERNS) {
      if (regex.test(withoutInlineCode)) {
        warnings.push({
          line: lineNum,
          message: `미완성 마커 "${label}" 탐지 → 콘텐츠 완성 후 제거 필요`,
        });
        break; // 한 줄에 여러 마커는 1건으로
      }
    }
  }
  return warnings;
}

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

    // 1a. MDX JSX 함정 사전 탐지 → 에러로 승격 (빌드 차단)
    // AI 생성 콘텐츠에서 {중괄호} JSX 파싱 에러 반복 발생 — warning만으로는 방어 불가
    const jsxWarnings = detectJsxTraps(content, rel);
    if (jsxWarnings.length > 0) {
      console.error(`❌ ${rel} (JSX 함정 ${jsxWarnings.length}건 — 빌드 차단)`);
      for (const w of jsxWarnings) {
        console.error(`   Line ~${w.line}: ${w.message}`);
      }
      mdxErrors++;
      totalErrors++;
    }

    // 1b. No-Placeholder Scan (Superpowers 패턴 이식)
    const placeholderWarnings = detectPlaceholders(content, rel);
    if (placeholderWarnings.length > 0) {
      for (const w of placeholderWarnings) {
        console.warn(`⚠️  ${rel} Line ~${w.line}: ${w.message}`);
      }
    }

    // 2. MDX 컴파일 검증 (모든 파일)
    try {
      await compile(content, { remarkPlugins: [remarkGfm] });
    } catch (err) {
      console.error(`❌ ${rel} (MDX 컴파일 에러)`);
      console.error(`   ${err.message}`);
      if (jsxWarnings.length > 0) {
        console.error(`   💡 위 JSX 함정 경고가 원인일 수 있음`);
      }
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
      const { fixed, autoFixed, errors, warnings } = fixAndValidateMermaid(block.code, rel);

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

      // warnings — 빌드 실패 안 시키고 console.warn 으로만 출력
      // 솔루션 문서: docs/solutions/mdx/2026-04-16-mermaid-br-in-unquoted-node-labels.md
      for (const w of warnings || []) {
        console.warn(
          `⚠️  ${rel} Line ~${block.startLine + w.line}: ${w.message}`,
        );
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

  // ── Wiki Lint (warning-only, 빌드 차단 안 함) ──
  // Karpathy LLM Wiki 패턴 적용: 고아 엔트리 / AI Agent Directive 누락 / 일방향 연결
  wikiLint(files);
}

/**
 * Wiki Lint — Karpathy LLM Wiki 패턴 적용
 * warning-only: 빌드 차단 안 함. N=3 승격 원칙 (compound-engineering-philosophy 원칙 9).
 *
 * 검사 항목:
 * 1. 고아 엔트리 (connections 0개) — Journal 제외
 * 2. AI Agent Directive 누락 — Journal 제외
 * 3. 일방향 연결 (A→B 있지만 B→A 없음)
 */
function wikiLint(files) {
  const entries = [];
  const slugToConnections = {};

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(raw);
    const rel = path.relative(path.join(process.cwd(), "content"), file);
    const slug = rel.replace(/\.mdx$/, "");
    const connections = data.connections || [];
    const isJournal = /journal-\d{3}/.test(slug);
    const hasDirective = content.includes("AI Agent Directive") || content.includes("For AI Agents");

    entries.push({ slug, connections, isJournal, hasDirective, title: data.title });
    slugToConnections[slug] = connections;
  }

  const allSlugs = new Set(entries.map(e => e.slug));
  let orphans = 0;
  let noDirective = 0;
  let oneWay = 0;

  // 1. 고아 엔트리 (connections 0, non-journal)
  const orphanList = entries.filter(e => !e.isJournal && e.connections.length === 0);
  if (orphanList.length > 0) {
    orphans = orphanList.length;
  }

  // 2. AI Agent Directive 누락 (non-journal)
  const noDirectiveList = entries.filter(e => !e.isJournal && !e.hasDirective);
  if (noDirectiveList.length > 0) {
    noDirective = noDirectiveList.length;
  }

  // 3. 일방향 연결
  const oneWayPairs = [];
  for (const entry of entries) {
    for (const conn of entry.connections) {
      if (allSlugs.has(conn)) {
        const reverse = slugToConnections[conn] || [];
        if (!reverse.includes(entry.slug)) {
          oneWayPairs.push({ from: entry.slug, to: conn });
        }
      }
    }
  }
  oneWay = oneWayPairs.length;

  // 출력
  const total = entries.length;
  const nonJournal = entries.filter(e => !e.isJournal).length;
  const withDirective = entries.filter(e => !e.isJournal && e.hasDirective).length;
  const directivePct = nonJournal > 0 ? ((withDirective / nonJournal) * 100).toFixed(0) : 0;

  console.log(`\n📋 Wiki Lint (${total} entries):`);
  console.log(`   AI Agent Directive: ${withDirective}/${nonJournal} non-journal (${directivePct}%)`);

  if (orphans > 0) {
    console.warn(`   ⚠️  고아 엔트리 ${orphans}건 (connections 0): ${orphanList.slice(0, 3).map(e => e.slug).join(", ")}${orphans > 3 ? ` 외 ${orphans - 3}건` : ""}`);
  }
  if (noDirective > 0) {
    console.warn(`   ⚠️  AI Agent Directive 누락 ${noDirective}건`);
  }
  if (oneWay > 0) {
    console.warn(`   ⚠️  일방향 연결 ${oneWay}건 (역링크 없음)`);
  }
  if (orphans === 0 && noDirective === 0 && oneWay === 0) {
    console.log("   ✅ 위키 품질 이상 없음");
  }
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
