/**
 * 회귀 테스트: scripts/lib/graph-signals.mjs — computeGraphSignals
 *
 * Session 15에서 graph-lesson 연동 시 테스트 미작성 → Session 16에서 보강.
 * weakHubCategories 검출 + categoryConnectivity 계산 검증.
 */

import { describe, it, expect } from "vitest";
import { computeGraphSignals } from "../lib/graph-signals.mjs";

// ─── Fixtures ────────────────────────────────────────────────────

function makeNode(id, category, confidence) {
  return { id, category, confidence };
}

function makeEdge(source, target) {
  return { source, target };
}

/** 15개 edge를 한 노드에 연결하는 헬퍼 */
function connectNode(nodeId, count) {
  return Array.from({ length: count }, (_, i) => makeEdge(nodeId, `peer-${i}`));
}

// ─── Tests ───────────────────────────────────────────────────────

describe("computeGraphSignals", () => {
  it("빈 그래프 → 빈 결과", () => {
    const result = computeGraphSignals({ graph: { nodes: [], edges: [] } });
    expect(result.weakHubCategories.size).toBe(0);
    expect(result.categoryConnectivity).toEqual({});
  });

  it("graph 필드 없음 → 빈 결과", () => {
    const result = computeGraphSignals({});
    expect(result.weakHubCategories.size).toBe(0);
    expect(result.categoryConnectivity).toEqual({});
  });

  describe("weakHubCategories", () => {
    it("conf<=2 + connections>=15 → 해당 카테고리 포함", () => {
      const weakNode = makeNode("weak-hub", "harness-engineering", 2);
      const peers = Array.from({ length: 15 }, (_, i) => makeNode(`peer-${i}`, "other", 4));
      const edges = connectNode("weak-hub", 15);

      const result = computeGraphSignals({
        graph: { nodes: [weakNode, ...peers], edges },
      });

      expect(result.weakHubCategories.has("harness-engineering")).toBe(true);
    });

    it("conf<=2 + connections<15 → 포함 안 됨", () => {
      const node = makeNode("low-conn", "rag", 2);
      const peers = Array.from({ length: 10 }, (_, i) => makeNode(`peer-${i}`, "other", 4));
      const edges = connectNode("low-conn", 10);

      const result = computeGraphSignals({
        graph: { nodes: [node, ...peers], edges },
      });

      expect(result.weakHubCategories.has("rag")).toBe(false);
    });

    it("conf>2 + connections>=15 → 포함 안 됨 (높은 confidence)", () => {
      const node = makeNode("strong-hub", "agents", 3);
      const peers = Array.from({ length: 20 }, (_, i) => makeNode(`peer-${i}`, "other", 4));
      const edges = connectNode("strong-hub", 20);

      const result = computeGraphSignals({
        graph: { nodes: [node, ...peers], edges },
      });

      expect(result.weakHubCategories.has("agents")).toBe(false);
    });

    it("conf=1도 포함 (<=2 경계)", () => {
      const node = makeNode("very-weak", "fine-tuning", 1);
      const peers = Array.from({ length: 15 }, (_, i) => makeNode(`peer-${i}`, "other", 4));
      const edges = connectNode("very-weak", 15);

      const result = computeGraphSignals({
        graph: { nodes: [node, ...peers], edges },
      });

      expect(result.weakHubCategories.has("fine-tuning")).toBe(true);
    });

    it("같은 카테고리의 여러 weak hub → Set이므로 중복 없음", () => {
      const node1 = makeNode("weak-1", "rag", 2);
      const node2 = makeNode("weak-2", "rag", 1);
      const peers = Array.from({ length: 30 }, (_, i) => makeNode(`peer-${i}`, "other", 4));
      const edges = [...connectNode("weak-1", 15), ...connectNode("weak-2", 15)];

      const result = computeGraphSignals({
        graph: { nodes: [node1, node2, ...peers], edges },
      });

      expect(result.weakHubCategories.has("rag")).toBe(true);
      expect(result.weakHubCategories.size).toBe(1);
    });
  });

  describe("categoryConnectivity", () => {
    it("단일 카테고리 평균 계산", () => {
      const nodes = [
        makeNode("a", "rag", 3),
        makeNode("b", "rag", 3),
      ];
      // a는 2개 연결, b는 0개
      const edges = [makeEdge("a", "b"), makeEdge("a", "x")];
      const allNodes = [...nodes, makeNode("x", "other", 4)];

      const result = computeGraphSignals({
        graph: { nodes: allNodes, edges },
      });

      // a: source 2번 = 2, b: target 1번 = 1, avg = (2+1)/2 = 1.5
      expect(result.categoryConnectivity["rag"]).toBe(1.5);
    });

    it("연결 없는 노드 → connectivity 0", () => {
      const nodes = [makeNode("isolated", "agents", 4)];
      const result = computeGraphSignals({
        graph: { nodes, edges: [] },
      });

      expect(result.categoryConnectivity["agents"]).toBe(0);
    });

    it("양방향 edge 카운트 (source + target 각각)", () => {
      const nodes = [
        makeNode("a", "cat-a", 3),
        makeNode("b", "cat-b", 3),
      ];
      const edges = [makeEdge("a", "b")];

      const result = computeGraphSignals({
        graph: { nodes, edges },
      });

      // a: source 1회 = 1, b: target 1회 = 1
      expect(result.categoryConnectivity["cat-a"]).toBe(1);
      expect(result.categoryConnectivity["cat-b"]).toBe(1);
    });
  });
});
