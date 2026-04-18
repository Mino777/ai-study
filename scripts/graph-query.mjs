#!/usr/bin/env node
/**
 * Graph Query CLI — content-manifest.json 그래프를 쿼리
 *
 * 사용법:
 *   node scripts/graph-query.mjs neighbors <slug>     — 직접 연결된 이웃 노드
 *   node scripts/graph-query.mjs dangling              — dangling connections (역링크 없는 연결)
 *   node scripts/graph-query.mjs islands               — 고립된 노드 (연결 0)
 *   node scripts/graph-query.mjs hubs [N]              — 연결 수 Top N 허브 노드
 *   node scripts/graph-query.mjs path <from> <to>      — 두 노드 간 최단 경로
 *   node scripts/graph-query.mjs weak-links             — 양방향 연결 비율이 낮은 카테고리 쌍
 *   node scripts/graph-query.mjs suggest                — 그래프 분석 기반 주제 추천
 */

import fs from "fs";
import path from "path";

const MANIFEST_PATH = path.join(process.cwd(), "src", "generated", "content-manifest.json");

function loadGraph() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const { nodes, edges } = manifest.graph;
  const entries = manifest.entries;

  // Build adjacency lists (directed)
  const outgoing = new Map(); // slug -> Set<slug>
  const incoming = new Map(); // slug -> Set<slug>
  const allSlugs = new Set(nodes.map((n) => n.id));

  for (const slug of allSlugs) {
    outgoing.set(slug, new Set());
    incoming.set(slug, new Set());
  }

  for (const edge of edges) {
    if (outgoing.has(edge.source)) outgoing.get(edge.source).add(edge.target);
    if (incoming.has(edge.target)) incoming.get(edge.target).add(edge.source);
  }

  return { nodes, edges, entries, allSlugs, outgoing, incoming };
}

// ─── Commands ─────────────────────────────────────────────────

function neighbors(slug) {
  const { outgoing, incoming, nodes } = loadGraph();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  if (!outgoing.has(slug)) {
    console.error(`❌ Node not found: ${slug}`);
    process.exit(1);
  }

  const out = [...outgoing.get(slug)];
  const inc = [...incoming.get(slug)];
  const bidirectional = out.filter((s) => inc.includes(s));
  const outOnly = out.filter((s) => !inc.includes(s));
  const inOnly = inc.filter((s) => !out.includes(s));

  const node = nodeMap.get(slug);
  console.log(`\n📍 ${node?.label || slug} (${node?.category})`);
  console.log(`   confidence: ${node?.confidence || "?"}\n`);

  if (bidirectional.length > 0) {
    console.log(`🔗 양방향 연결 (${bidirectional.length}):`);
    bidirectional.forEach((s) => {
      const n = nodeMap.get(s);
      console.log(`   ↔ ${s} — ${n?.label || "?"}`);
    });
  }

  if (outOnly.length > 0) {
    console.log(`\n➡️  나가는 연결만 (${outOnly.length}):`);
    outOnly.forEach((s) => {
      const n = nodeMap.get(s);
      const exists = nodeMap.has(s);
      console.log(`   → ${s} — ${exists ? n?.label || "?" : "⚠️ DANGLING"}`);
    });
  }

  if (inOnly.length > 0) {
    console.log(`\n⬅️  들어오는 연결만 (${inOnly.length}):`);
    inOnly.forEach((s) => {
      const n = nodeMap.get(s);
      console.log(`   ← ${s} — ${n?.label || "?"}`);
    });
  }

  console.log(`\n총: ${out.length} outgoing, ${inc.length} incoming, ${bidirectional.length} bidirectional`);
}

function dangling() {
  const { entries, allSlugs } = loadGraph();

  const danglingMap = new Map(); // dangling slug -> referring entries
  for (const entry of entries) {
    for (const conn of entry.frontmatter.connections || []) {
      if (!allSlugs.has(conn)) {
        if (!danglingMap.has(conn)) danglingMap.set(conn, []);
        danglingMap.get(conn).push(entry.slug);
      }
    }
  }

  if (danglingMap.size === 0) {
    console.log("✅ dangling connection 없음!");
    return;
  }

  console.log(`\n⚠️  Dangling connections: ${danglingMap.size}건\n`);

  // Group by category
  const byCategory = new Map();
  for (const [slug, refs] of danglingMap) {
    const cat = slug.split("/")[0];
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push({ slug, refs });
  }

  for (const [cat, items] of [...byCategory].sort()) {
    console.log(`📂 ${cat} (${items.length}건):`);
    for (const { slug, refs } of items) {
      console.log(`   🔴 ${slug}`);
      console.log(`      참조: ${refs.join(", ")}`);
    }
    console.log();
  }

  console.log(`💡 이 dangling connections은 새 엔트리 작성 후보입니다.`);
}

function islands() {
  const { nodes, outgoing, incoming } = loadGraph();

  const isolated = nodes.filter((n) => {
    const out = outgoing.get(n.id)?.size || 0;
    const inc = incoming.get(n.id)?.size || 0;
    return out + inc === 0;
  });

  if (isolated.length === 0) {
    console.log("✅ 고립 노드 없음!");
    return;
  }

  console.log(`\n🏝️  고립 노드: ${isolated.length}건\n`);
  for (const node of isolated) {
    console.log(`   • ${node.id} — ${node.label} (conf: ${node.confidence})`);
  }
}

function hubs(n = 10) {
  const { nodes, outgoing, incoming } = loadGraph();

  const scored = nodes.map((node) => ({
    ...node,
    outCount: outgoing.get(node.id)?.size || 0,
    inCount: incoming.get(node.id)?.size || 0,
    total: (outgoing.get(node.id)?.size || 0) + (incoming.get(node.id)?.size || 0),
  }));

  scored.sort((a, b) => b.total - a.total);

  console.log(`\n🏛️  Top ${n} 허브 노드:\n`);
  console.log("  #  | Total | Out | In  | Slug");
  console.log("  ---|-------|-----|-----|" + "-".repeat(60));
  scored.slice(0, n).forEach((s, i) => {
    console.log(
      `  ${String(i + 1).padStart(2)} | ${String(s.total).padStart(5)} | ${String(s.outCount).padStart(3)} | ${String(s.inCount).padStart(3)} | ${s.id}`
    );
  });
}

function shortestPath(from, to) {
  const { allSlugs, outgoing, incoming } = loadGraph();

  if (!allSlugs.has(from)) {
    console.error(`❌ Node not found: ${from}`);
    process.exit(1);
  }
  if (!allSlugs.has(to)) {
    console.error(`❌ Node not found: ${to}`);
    process.exit(1);
  }

  // BFS on undirected graph
  const visited = new Set([from]);
  const parent = new Map();
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === to) break;

    // Both directions (treat as undirected)
    const neighbors = new Set([
      ...(outgoing.get(current) || []),
      ...(incoming.get(current) || []),
    ]);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && allSlugs.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  if (!parent.has(to) && from !== to) {
    console.log(`❌ ${from} → ${to}: 경로 없음 (연결되지 않은 그래프)`);
    return;
  }

  // Reconstruct path
  const path = [to];
  let current = to;
  while (current !== from) {
    current = parent.get(current);
    path.unshift(current);
  }

  console.log(`\n🛤️  최단 경로 (${path.length - 1} hops):\n`);
  path.forEach((slug, i) => {
    const prefix = i === 0 ? "🟢" : i === path.length - 1 ? "🔴" : "  →";
    console.log(`   ${prefix} ${slug}`);
  });
}

function weakLinks() {
  const { entries, outgoing } = loadGraph();

  // Category pair connection counts
  const catPairs = new Map(); // "catA→catB" -> { total, bidirectional }

  for (const entry of entries) {
    const fromCat = entry.frontmatter.category;
    for (const conn of entry.frontmatter.connections || []) {
      const toCat = conn.split("/")[0];
      if (fromCat === toCat) continue;

      const key = [fromCat, toCat].sort().join(" ↔ ");
      if (!catPairs.has(key)) catPairs.set(key, { total: 0, entries: [] });
      const pair = catPairs.get(key);
      pair.total++;
      pair.entries.push(`${entry.slug} → ${conn}`);
    }
  }

  const pairs = [...catPairs.entries()]
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => a.total - b.total);

  console.log("\n🔗 카테고리 간 연결 강도:\n");
  console.log("  연결수 | 카테고리 쌍");
  console.log("  -------|" + "-".repeat(50));
  for (const pair of pairs) {
    const bar = "█".repeat(Math.min(pair.total, 30));
    console.log(`  ${String(pair.total).padStart(5)}  | ${pair.key} ${bar}`);
  }

  console.log(`\n💡 연결이 약한 카테고리 쌍은 cross-linking 후보입니다.`);
}

function suggest() {
  const { nodes, entries, allSlugs, outgoing, incoming } = loadGraph();

  console.log("\n🧠 그래프 분석 기반 주제 추천\n");

  // 1. Dangling connections (가장 높은 우선순위)
  const danglings = new Set();
  for (const entry of entries) {
    for (const conn of entry.frontmatter.connections || []) {
      if (!allSlugs.has(conn)) danglings.add(conn);
    }
  }

  if (danglings.size > 0) {
    console.log(`📌 1. Dangling Connections (${danglings.size}건) — 가장 높은 우선순위:`);
    [...danglings].slice(0, 5).forEach((s) => console.log(`   🔴 ${s}`));
    if (danglings.size > 5) console.log(`   ... 외 ${danglings.size - 5}건`);
    console.log();
  }

  // 2. Low-confidence high-connectivity nodes (보강 후보)
  const boostCandidates = nodes
    .filter((n) => n.confidence <= 2)
    .map((n) => ({
      ...n,
      connectivity: (outgoing.get(n.id)?.size || 0) + (incoming.get(n.id)?.size || 0),
    }))
    .sort((a, b) => b.connectivity - a.connectivity);

  if (boostCandidates.length > 0) {
    console.log(`📌 2. 낮은 confidence + 높은 연결 (보강 후보):`);
    boostCandidates.slice(0, 5).forEach((n) => {
      console.log(`   ⚡ ${n.id} — conf:${n.confidence}, 연결:${n.connectivity}`);
    });
    console.log();
  }

  // 3. Category with lowest avg confidence
  const catConf = new Map();
  for (const entry of entries) {
    const cat = entry.frontmatter.category;
    if (!catConf.has(cat)) catConf.set(cat, []);
    catConf.get(cat).push(entry.frontmatter.confidence);
  }

  const catAvg = [...catConf.entries()]
    .map(([cat, confs]) => ({
      cat,
      avg: confs.reduce((a, b) => a + b, 0) / confs.length,
      count: confs.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  console.log(`📌 3. 카테고리별 평균 confidence (낮은 순):`);
  catAvg.slice(0, 5).forEach((c) => {
    console.log(`   📂 ${c.cat}: avg ${c.avg.toFixed(1)} (${c.count}건)`);
  });
  console.log();

  // 4. Bridge nodes (다른 카테고리를 연결하는 허브)
  const bridges = nodes.map((n) => {
    const neighbors = [
      ...(outgoing.get(n.id) || []),
      ...(incoming.get(n.id) || []),
    ];
    const categories = new Set(neighbors.map((s) => s.split("/")[0]));
    return { ...n, categorySpan: categories.size };
  }).sort((a, b) => b.categorySpan - a.categorySpan);

  console.log(`📌 4. 카테고리 브릿지 노드 (가장 많은 카테고리 연결):`);
  bridges.slice(0, 5).forEach((n) => {
    console.log(`   🌉 ${n.id} — ${n.categorySpan} 카테고리 연결`);
  });

  // Summary
  console.log(`\n📊 그래프 요약: ${nodes.length} 노드, ${entries.length} 엔트리, dangling ${danglings.size}건`);
}

// ─── CLI ──────────────────────────────────────────────────────

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case "neighbors":
    if (!args[0]) { console.error("Usage: graph-query.mjs neighbors <slug>"); process.exit(1); }
    neighbors(args[0]);
    break;
  case "dangling":
    dangling();
    break;
  case "islands":
    islands();
    break;
  case "hubs":
    hubs(parseInt(args[0]) || 10);
    break;
  case "path":
    if (!args[0] || !args[1]) { console.error("Usage: graph-query.mjs path <from> <to>"); process.exit(1); }
    shortestPath(args[0], args[1]);
    break;
  case "weak-links":
    weakLinks();
    break;
  case "suggest":
    suggest();
    break;
  default:
    console.log(`
📊 Graph Query CLI — content-manifest.json 그래프 쿼리

Commands:
  neighbors <slug>      직접 연결된 이웃 노드
  dangling              dangling connections 목록
  islands               고립 노드 (연결 0)
  hubs [N]              연결 수 Top N 허브 노드
  path <from> <to>      두 노드 간 최단 경로
  weak-links            카테고리 간 연결 강도
  suggest               그래프 분석 기반 주제 추천
`);
}
