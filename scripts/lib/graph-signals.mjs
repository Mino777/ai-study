/**
 * 지식 그래프 신호 계산 — generate-lesson 추천 엔진용.
 *
 * weakHubCategories: confidence≤2 이면서 연결 15개 이상인 노드가 속한 카테고리 Set
 * categoryConnectivity: 카테고리별 평균 연결 수
 */

export function computeGraphSignals(manifest) {
  const { nodes, edges } = manifest.graph || { nodes: [], edges: [] };
  if (nodes.length === 0) return { weakHubCategories: new Set(), categoryConnectivity: {} };

  // Build connectivity map
  const connectivity = new Map();
  for (const n of nodes) connectivity.set(n.id, 0);
  for (const e of edges) {
    connectivity.set(e.source, (connectivity.get(e.source) || 0) + 1);
    connectivity.set(e.target, (connectivity.get(e.target) || 0) + 1);
  }

  // Weak hubs: conf<=2 + connections>=15
  const weakHubCategories = new Set();
  for (const n of nodes) {
    if (n.confidence <= 2 && (connectivity.get(n.id) || 0) >= 15) {
      weakHubCategories.add(n.category);
    }
  }

  // Category avg connectivity
  const catConn = {};
  for (const n of nodes) {
    if (!catConn[n.category]) catConn[n.category] = [];
    catConn[n.category].push(connectivity.get(n.id) || 0);
  }
  const categoryConnectivity = {};
  for (const [cat, conns] of Object.entries(catConn)) {
    categoryConnectivity[cat] = conns.reduce((a, b) => a + b, 0) / conns.length;
  }

  return { weakHubCategories, categoryConnectivity };
}
