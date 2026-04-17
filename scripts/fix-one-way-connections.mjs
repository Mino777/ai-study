#!/usr/bin/env node
/**
 * fix-one-way-connections.mjs — 일방향 연결 자동 역링크 추가
 *
 * A→B는 있지만 B→A가 없는 경우, B의 frontmatter connections에 A를 추가.
 * --dry-run: 변경 없이 결과만 출력 (기본)
 * --apply: 실제 파일 수정
 *
 * Usage:
 *   node scripts/fix-one-way-connections.mjs           # dry-run
 *   node scripts/fix-one-way-connections.mjs --apply   # 실제 적용
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const apply = process.argv.includes("--apply");

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
  const files = findMdxFiles(CONTENT_DIR);

  // 1. 모든 엔트리의 slug → connections 매핑
  const slugToFile = {};
  const slugToConnections = {};

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const { data } = matter(raw);
    const rel = path.relative(CONTENT_DIR, file);
    const slug = rel.replace(/\.mdx$/, "");
    const connections = data.connections || [];

    slugToFile[slug] = file;
    slugToConnections[slug] = connections;
  }

  const allSlugs = new Set(Object.keys(slugToFile));

  // 2. 일방향 연결 감지 → 역링크 추가 대상 수집
  // key: 역링크를 추가할 대상 slug, value: 추가할 slug 배열
  const additions = {};

  for (const [slug, connections] of Object.entries(slugToConnections)) {
    for (const conn of connections) {
      if (!allSlugs.has(conn)) continue; // dangling — skip
      const reverse = slugToConnections[conn] || [];
      if (!reverse.includes(slug)) {
        if (!additions[conn]) additions[conn] = [];
        if (!additions[conn].includes(slug)) {
          additions[conn].push(slug);
        }
      }
    }
  }

  const targetCount = Object.keys(additions).length;
  const totalAdded = Object.values(additions).reduce((sum, arr) => sum + arr.length, 0);

  console.log(`\n🔍 일방향 연결 분석 완료`);
  console.log(`   대상 엔트리: ${targetCount}개`);
  console.log(`   추가할 역링크: ${totalAdded}건`);
  console.log(`   모드: ${apply ? "🔧 APPLY (실제 수정)" : "👀 DRY-RUN (미리보기)"}\n`);

  if (totalAdded === 0) {
    console.log("✅ 일방향 연결 없음 — 모든 연결이 양방향");
    return;
  }

  // 3. 파일 수정 (또는 dry-run 출력)
  let modified = 0;
  for (const [targetSlug, newConnections] of Object.entries(additions)) {
    const file = slugToFile[targetSlug];
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(raw);

    const existing = data.connections || [];
    const merged = [...existing, ...newConnections.filter(c => !existing.includes(c))];

    if (merged.length === existing.length) continue; // 이미 있음

    if (apply) {
      data.connections = merged;
      const updated = matter.stringify(content, data);
      fs.writeFileSync(file, updated);
      modified++;
      console.log(`   ✅ ${targetSlug} (+${merged.length - existing.length}): ${newConnections.join(", ")}`);
    } else {
      console.log(`   📝 ${targetSlug} (+${newConnections.length}): ${newConnections.join(", ")}`);
    }
  }

  if (apply) {
    console.log(`\n✅ ${modified}개 파일 수정 완료. npm run build로 검증하세요.`);
  } else {
    console.log(`\n👀 dry-run 완료. --apply 옵션으로 실제 적용하세요.`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
