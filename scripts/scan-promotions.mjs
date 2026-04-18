#!/usr/bin/env node
/**
 * Solution Promotion Scanner
 *
 * docs/solutions/ 카테고리별 솔루션 수를 스캔하고,
 * N=3+ 카테고리에 대해 공통 패턴을 분석하여 승격 제안을 출력한다.
 *
 * 사용법:
 *   node scripts/scan-promotions.mjs              — 전체 스캔 + 제안
 *   node scripts/scan-promotions.mjs --json        — JSON 출력 (CI 연동용)
 *   node scripts/scan-promotions.mjs --threshold 5  — 승격 기준 변경 (기본 3)
 */

import fs from "fs";
import path from "path";

const SOLUTIONS_DIR = path.join(process.cwd(), "docs", "solutions");
const HOOKS_DIR = path.join(process.cwd(), ".claude", "hooks");
const COMMANDS_DIR = path.join(process.cwd(), ".claude", "commands");
const SCRIPTS_LIB_DIR = path.join(process.cwd(), "scripts", "lib");

// CLI args
const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const thresholdIdx = args.indexOf("--threshold");
const THRESHOLD = thresholdIdx !== -1 ? parseInt(args[thresholdIdx + 1]) || 3 : 3;

// ─── 1. Scan categories ─────────────────────────────────────

function scanCategories() {
  if (!fs.existsSync(SOLUTIONS_DIR)) {
    console.error("❌ docs/solutions/ not found");
    process.exit(1);
  }

  const categories = fs.readdirSync(SOLUTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dirPath = path.join(SOLUTIONS_DIR, d.name);
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
      return {
        name: d.name,
        count: files.length,
        files: files.map((f) => ({
          name: f,
          path: path.join(dirPath, f),
          date: f.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || "unknown",
        })),
      };
    })
    .sort((a, b) => b.count - a.count);

  return categories;
}

// ─── 2. Check existing gates ─────���──────────────────────────

function checkExistingGates() {
  const gates = {
    hooks: [],
    commands: [],
    validators: [],
  };

  if (fs.existsSync(HOOKS_DIR)) {
    gates.hooks = fs.readdirSync(HOOKS_DIR).filter((f) => f.endsWith(".sh"));
  }

  if (fs.existsSync(COMMANDS_DIR)) {
    gates.commands = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith(".md"));
  }

  if (fs.existsSync(SCRIPTS_LIB_DIR)) {
    gates.validators = fs.readdirSync(SCRIPTS_LIB_DIR).filter((f) => f.endsWith(".mjs") || f.endsWith(".js"));
  }

  return gates;
}

// ─── 3. Extract common patterns ─────────────────────────────

function extractPatterns(category) {
  const patterns = {
    keywords: new Map(),    // word -> count
    fileRefs: new Map(),    // file path -> count
    errorPatterns: [],      // common error strings
  };

  for (const file of category.files) {
    const content = fs.readFileSync(file.path, "utf-8");

    // Extract frequently mentioned technical terms
    const words = content.match(/`[^`]+`/g) || [];
    for (const word of words) {
      const clean = word.replace(/`/g, "").toLowerCase();
      if (clean.length > 2 && clean.length < 60) {
        patterns.keywords.set(clean, (patterns.keywords.get(clean) || 0) + 1);
      }
    }

    // Extract file path references
    const paths = content.match(/(?:src|scripts|content|\.claude)\/[\w./-]+/g) || [];
    for (const p of paths) {
      patterns.fileRefs.set(p, (patterns.fileRefs.get(p) || 0) + 1);
    }

    // Extract error-like patterns
    const errors = content.match(/(?:error|Error|❌|실패|에러|버그).*$/gm) || [];
    patterns.errorPatterns.push(...errors.slice(0, 3));
  }

  // Sort keywords by frequency
  const topKeywords = [...patterns.keywords.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k, v]) => ({ keyword: k, count: v }));

  const topFiles = [...patterns.fileRefs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([f, v]) => ({ file: f, count: v }));

  return { topKeywords, topFiles, errorSample: patterns.errorPatterns.slice(0, 5) };
}

// ─── 4. Suggest promotion type ──────────────────────────────

function suggestPromotionType(category, patterns) {
  const name = category.name;

  // Heuristics based on category name and patterns
  if (name === "mdx" || name === "build-errors") {
    return {
      type: "auto-fix validator",
      location: `scripts/lib/${name}-fix.mjs`,
      reason: "문법/빌드 에러는 자동 수정 가능 + idempotent 보장 용이",
    };
  }

  if (name === "workflow" || name === "ai-pipeline") {
    return {
      type: "slash command",
      location: `.claude/commands/${name}-guard.md`,
      reason: "워크플로우/파이프라인은 multi-step 검증이 필요 — 커맨드가 적합",
    };
  }

  if (name === "github-actions" || name === "next-patterns") {
    return {
      type: "warning-only detector",
      location: `scripts/lib/${name}-check.mjs`,
      reason: "CI/프레임워크 패턴은 false positive 위험 — warning-only로 시작",
    };
  }

  return {
    type: "warning-only detector",
    location: `scripts/lib/${name}-check.mjs`,
    reason: "기본: warning-only로 시작, 충분한 데이터 후 auto-fix 전환",
  };
}

// ─── 5. Output ──────────────────────────────────────────────

function main() {
  const categories = scanCategories();
  const gates = checkExistingGates();
  const promotable = categories.filter((c) => c.count >= THRESHOLD);
  const below = categories.filter((c) => c.count < THRESHOLD && c.count > 0);

  if (jsonMode) {
    const result = {
      scannedAt: new Date().toISOString(),
      threshold: THRESHOLD,
      categories: categories.map((c) => ({
        name: c.name,
        count: c.count,
        promotable: c.count >= THRESHOLD,
      })),
      promotable: promotable.map((c) => ({
        ...suggestPromotionType(c, extractPatterns(c)),
        category: c.name,
        count: c.count,
      })),
      existingGates: gates,
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("\n📊 솔루션 승격 스캔 보고\n");
  console.log(`기준: N ≥ ${THRESHOLD}\n`);

  // Summary table
  console.log("  카테고리        | 솔루션 수 | 승격 대상");
  console.log("  ----------------|-----------|----------");
  for (const cat of categories) {
    const status = cat.count >= THRESHOLD ? "✅ 승격 후보" : cat.count === 0 ? "⬜ 없음" : "⏳ 관찰 중";
    console.log(`  ${cat.name.padEnd(16)} | ${String(cat.count).padStart(9)} | ${status}`);
  }

  console.log(`\n  합계: ${categories.reduce((s, c) => s + c.count, 0)}건 (${categories.length} 카테고리)\n`);

  // Existing gates
  console.log("🔒 기존 코드 게이트:");
  console.log(`  hooks: ${gates.hooks.join(", ") || "(없음)"}`);
  console.log(`  commands: ${gates.commands.length}개`);
  console.log(`  validators: ${gates.validators.join(", ") || "(없음)"}`);
  console.log();

  // Promotion suggestions
  if (promotable.length === 0) {
    console.log("✅ 현재 승격 대상 없음 (모든 카테고리 N < " + THRESHOLD + ")");
    return;
  }

  console.log(`🚀 승격 제안 (${promotable.length} 카테고리):\n`);

  for (const cat of promotable) {
    const patterns = extractPatterns(cat);
    const suggestion = suggestPromotionType(cat, patterns);

    console.log(`  📂 ${cat.name} (${cat.count}건)`);
    console.log(`     승격 형태: ${suggestion.type}`);
    console.log(`     위��: ${suggestion.location}`);
    console.log(`     이유: ${suggestion.reason}`);

    if (patterns.topKeywords.length > 0) {
      console.log(`     주요 키워드: ${patterns.topKeywords.slice(0, 5).map((k) => `${k.keyword}(${k.count})`).join(", ")}`);
    }

    if (patterns.topFiles.length > 0) {
      console.log(`     관련 파일: ${patterns.topFiles.slice(0, 3).map((f) => f.file).join(", ")}`);
    }

    // Check if gate already exists
    const existingHook = gates.hooks.find((h) => h.includes(cat.name));
    const existingValidator = gates.validators.find((v) => v.includes(cat.name));
    if (existingHook || existingValidator) {
      console.log(`     ⚡ 기존 게이트: ${existingHook || existingValidator} (보강 검토)`);
    } else {
      console.log(`     ⚠️ 게이트 없음 — 신규 생성 필요`);
    }

    console.log();
  }

  // Below threshold
  if (below.length > 0) {
    console.log(`⏳ 관찰 중 (N < ${THRESHOLD}):`);
    for (const cat of below) {
      console.log(`  ${cat.name}: ${cat.count}건 (${THRESHOLD - cat.count}건 더 필요)`);
    }
    console.log();
  }

  console.log("💡 다음 액션: 위 제안을 검토 후 `/promote-solution` 으로 구현 시작");
}

main();
