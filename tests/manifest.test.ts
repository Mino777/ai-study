import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const MANIFEST_PATH = path.join(process.cwd(), "src/generated/content-manifest.json");

describe("content-manifest 생성", () => {
  // prebuild를 실행해서 manifest를 생성
  execSync("node scripts/generate-content-manifest.mjs", { stdio: "pipe" });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  it("entries 배열이 존재한다", () => {
    expect(Array.isArray(manifest.entries)).toBe(true);
    expect(manifest.entries.length).toBeGreaterThan(0);
  });

  it("각 entry에 필수 frontmatter 필드가 있다", () => {
    for (const entry of manifest.entries) {
      expect(entry.slug).toBeTruthy();
      expect(entry.frontmatter.title).toBeTruthy();
      expect(entry.frontmatter.category).toBeTruthy();
      expect(entry.frontmatter.date).toBeTruthy();
      expect(entry.frontmatter.description).toBeTruthy();
      expect(entry.frontmatter.confidence).toBeGreaterThanOrEqual(1);
      expect(entry.frontmatter.confidence).toBeLessThanOrEqual(5);
    }
  });

  it("graph의 노드 수 >= entry 수", () => {
    // dangling connections가 추가 노드를 만들 수 있으므로 >=
    expect(manifest.graph.nodes.length).toBeGreaterThanOrEqual(manifest.entries.length);
  });

  it("graph edge의 source/target이 모두 노드에 존재한다", () => {
    const nodeIds = new Set(manifest.graph.nodes.map((n: { id: string }) => n.id));
    for (const edge of manifest.graph.edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it("streak 데이터가 존재한다", () => {
    expect(manifest.streak).toBeDefined();
    expect(typeof manifest.streak.current).toBe("number");
    expect(typeof manifest.streak.longest).toBe("number");
  });

  it("stats 데이터가 존재한다", () => {
    expect(manifest.stats).toBeDefined();
    expect(manifest.stats.totalEntries).toBe(manifest.entries.length);
    expect(manifest.stats.avgConfidence).toBeGreaterThanOrEqual(0);
    expect(manifest.stats.categoryStats).toBeDefined();
    expect(manifest.stats.weeklyStats.length).toBe(4);
    expect(Array.isArray(manifest.stats.recentEntries)).toBe(true);
  });

  it("카테고리 통계의 합이 전체 엔트리 수와 일치한다", () => {
    const catTotal = (Object.values(manifest.stats.categoryStats) as Array<{ count: number }>).reduce(
      (sum, cat) => sum + cat.count,
      0
    );
    expect(catTotal).toBe(manifest.entries.length);
  });
});
