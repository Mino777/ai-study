#!/usr/bin/env node
/**
 * backfill-frontmatter.mjs
 * MDX 파일에 last_verified + applicable_to 필드가 없으면 추가한다.
 *
 * last_verified: frontmatter의 date 값 사용 (작성 시점이 검증 시점)
 * applicable_to: 파일명/내용에서 추론
 *   - aidy 언급 → ["aidy", "any"]
 *   - moneyflow 언급 → ["moneyflow", "any"]
 *   - tarosaju 언급 → ["tarosaju", "any"]
 *   - 복수 프로젝트 → 해당 프로젝트 + "any"
 *   - 나머지 → ["any"]
 *
 * 사용:
 *   node scripts/backfill-frontmatter.mjs           # dry-run (미설정 필드만)
 *   node scripts/backfill-frontmatter.mjs --apply   # 실제 적용
 *   node scripts/backfill-frontmatter.mjs --refine  # ["any"]인 항목도 재추론 (dry-run)
 *   node scripts/backfill-frontmatter.mjs --refine --apply  # 재추론 실제 적용
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "../content");
const DRY_RUN = !process.argv.includes("--apply");
const REFINE = process.argv.includes("--refine");

if (DRY_RUN) {
  console.log(`🔍 Dry-run 모드 (--apply 로 실제 적용)${REFINE ? " [--refine: 기존 [\"any\"] 재추론]" : ""}\n`);
}

function inferApplicableTo(filename, content) {
  const lower = content.toLowerCase();
  const projects = [];

  const aidyTerms = ["aidy", "architect-cli", "watch-workers", "tmux-setup", "autoceo", "aidy-architect", "aidy-server", "aidy-ios", "aidy-android"];
  if (aidyTerms.some((t) => filename.includes(t) || lower.includes(t))) {
    projects.push("aidy");
  }

  const moneyflowTerms = ["moneyflow", "mino-moneyflow"];
  if (moneyflowTerms.some((t) => filename.includes(t) || lower.includes(t))) {
    projects.push("moneyflow");
  }

  const tarosajuTerms = ["tarosaju", "mino-tarosaju"];
  if (tarosajuTerms.some((t) => filename.includes(t) || lower.includes(t))) {
    projects.push("tarosaju");
  }

  if (projects.length > 0) {
    return JSON.stringify([...projects, "any"]);
  }
  return '["any"]';
}

function extractDate(content) {
  const match = content.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/m);
  return match ? match[1] : null;
}

function addFieldAfter(content, afterField, newField, newValue) {
  // afterField 패턴 다음 줄에 삽입
  const regex = new RegExp(`^(${afterField}:.*)$`, "m");
  return content.replace(regex, `$1\n${newField}: ${newValue}`);
}

let totalFiles = 0;
let patchedFiles = 0;
let skippedFiles = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith(".mdx")) {
      processFile(fullPath, entry.name);
    }
  }
}

function processFile(filePath, filename) {
  totalFiles++;
  let content = fs.readFileSync(filePath, "utf8");

  const hasLastVerified = /^last_verified:/m.test(content);
  const hasApplicableTo = /^applicable_to:/m.test(content);

  // --refine: applicable_to가 ["any"]인 경우 재추론
  const currentApplicable = content.match(/^applicable_to:\s*(.+)$/m)?.[1]?.trim();
  const isGenericAny = currentApplicable === '["any"]';

  if (hasLastVerified && hasApplicableTo && !(REFINE && isGenericAny)) {
    skippedFiles++;
    return;
  }

  const relPath = path.relative(path.join(__dirname, ".."), filePath);
  const date = extractDate(content);
  const applicable = inferApplicableTo(filename, content);
  const changes = [];

  if (!hasLastVerified && date) {
    changes.push(`last_verified: "${date}"`);
    content = addFieldAfter(content, "confidence", "last_verified", `"${date}"`);
  }

  if (!hasApplicableTo) {
    changes.push(`applicable_to: ${applicable}`);
    if (!hasLastVerified && date) {
      content = addFieldAfter(content, "last_verified", "applicable_to", applicable);
    } else {
      content = addFieldAfter(content, "confidence", "applicable_to", applicable);
    }
  } else if (REFINE && isGenericAny && applicable !== '["any"]') {
    // ["any"] → 더 구체적인 값으로 업데이트
    changes.push(`applicable_to: ["any"] → ${applicable}`);
    content = content.replace(/^(applicable_to:\s*).*$/m, `$1${applicable}`);
  }

  patchedFiles++;
  console.log(`${DRY_RUN ? "[dry]" : "[add]"} ${relPath}`);
  for (const c of changes) console.log(`        + ${c}`);

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

processDir(CONTENT_DIR);

console.log(`\n결과: ${totalFiles}개 파일 / ${patchedFiles}개 패치 대상 / ${skippedFiles}개 스킵`);
if (DRY_RUN && patchedFiles > 0) {
  console.log("\n실제 적용하려면: node scripts/backfill-frontmatter.mjs --apply");
}
