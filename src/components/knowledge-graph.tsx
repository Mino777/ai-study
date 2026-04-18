"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGraphSearch } from "@/contexts/graph-search-context";
import { CATEGORY_COLORS } from "@/lib/schema";
import { trackEvent } from "@/lib/analytics";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});


interface GraphNode {
  id: string;
  label: string;
  category: string;
  confidence: number;
  description: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function KnowledgeGraph({ nodes, edges }: KnowledgeGraphProps) {
  const router = useRouter();
  const { highlightedNodes, selectNode } = useGraphSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  const highlightedRef = useRef<Set<string>>(new Set());
  const [tooltipNode, setTooltipNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<{ d3ReheatSimulation?: () => void }>(null);

  // Sync highlights to ref (avoid re-renders in canvas paint)
  useEffect(() => {
    highlightedRef.current = highlightedNodes;
  }, [highlightedNodes]);

  // Register collision force (d3-force is bundled by react-force-graph-2d)
  // Run once after the graph instance mounts.
  useEffect(() => {
    let cancelled = false;
    // Wait for ForceGraph2D ref to be ready
    const timer = setTimeout(() => {
      if (cancelled) return;
      const graph = graphRef.current as
        | { d3Force?: (name: string, force?: unknown) => unknown; d3ReheatSimulation?: () => void }
        | null;
      if (!graph || typeof graph.d3Force !== "function") return;

      import("d3-force")
        .then(({ forceCollide, forceX, forceY, forceRadial }) => {
          if (cancelled) return;
          // Collision: prevent node overlap
          graph.d3Force?.("collide", forceCollide(16).strength(0.8));
          // Centering: pull toward center for compact round shape
          graph.d3Force?.("x", forceX(0).strength(0.05));
          graph.d3Force?.("y", forceY(0).strength(0.05));
          // Radial: pull toward a circle — Obsidian-style organic roundness
          graph.d3Force?.("radial", forceRadial(220, 0, 0).strength(0.06));
          // Limit charge range to prevent long-distance repulsion distortion
          const charge = graph.d3Force?.("charge") as { distanceMax?: (d: number) => unknown } | undefined;
          if (charge && typeof charge.distanceMax === "function") {
            charge.distanceMax(220);
          }
          graph.d3ReheatSimulation?.();
        })
        .catch(() => {
          // d3-force not available — fall back to default forces only
        });
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Memoize graph data so ForceGraph doesn't reset on re-renders
  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ ...n })),
      links: edges.map((e) => ({ ...e })),
    }),
    [nodes, edges]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.confidence === 0) return;
      trackEvent("graph_node_click", { nodeId: node.id, category: node.category });
      selectNode(node.id);
      router.push(`/wiki/${node.id}`);
    },
    [router, selectNode]
  );

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    hoveredNodeRef.current = node;
    setTooltipNode(node);
    // Force canvas repaint without recreating graph data
    if (graphRef.current) {
      // Trigger a visual refresh by nudging the render
    }
  }, []);

  const nodeCanvasObject = useCallback(
    (node: GraphNode & { x: number; y: number }, ctx: CanvasRenderingContext2D, globalScale: number) => {
      // Guard: force simulation의 초기 tick에서 x/y가 NaN일 수 있음.
      // createRadialGradient는 non-finite 값에 명시적으로 throw하므로 early return 필수.
      // (단순 ctx.arc는 NaN을 조용히 무시하지만 gradient는 아님)
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

      const color = CATEGORY_COLORS[node.category] || "#6b6b80";
      const hovered = hoveredNodeRef.current;
      const isHovered = hovered?.id === node.id;
      const isHighlighted = highlightedRef.current.size > 0 && highlightedRef.current.has(node.id);
      const isDimmed = highlightedRef.current.size > 0 && !isHighlighted && !isHovered;
      const isDangling = node.confidence === 0;
      const rawBase = isDangling ? 3 : 4 + (node.confidence || 0) * 1.2;
      const baseSize = Number.isFinite(rawBase) && rawBase > 0 ? rawBase : 4;
      const size = isHovered || isHighlighted ? baseSize * 1.5 : baseSize;

      const opacity = isDimmed ? 0.15 : 1;

      ctx.globalAlpha = opacity;

      // Glow effect
      if (!isDangling) {
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size + 6);
        grad.addColorStop(0, `${color}${isHovered || isHighlighted ? "80" : "30"}`);
        grad.addColorStop(1, `${color}00`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Highlight ring
      if (isHighlighted && !isDangling) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      if (isDangling) {
        ctx.strokeStyle = "#6b6b80";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Label — 줌 레벨 + 호버/하이라이트 기반으로만 표시
      // - 줌 인 (globalScale ≥ 1.8): 모든 라벨 표시
      // - 줌 아웃 (< 1.8): 호버 / 하이라이트 / 큰 노드(confidence ≥ 4) 만 표시
      // - dangling은 호버 시만
      const isImportant = !isDangling && node.confidence >= 4;
      const showLabel =
        isHovered ||
        isHighlighted ||
        (globalScale >= 1.8 && !isDangling) ||
        (globalScale >= 1.2 && isImportant);

      if (showLabel) {
        const fontSize = (isHovered || isHighlighted ? 13 : 11) / Math.max(globalScale, 1);
        ctx.font = `${isHovered || isHighlighted ? "bold " : ""}${fontSize * globalScale}px Pretendard Variable, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Truncate long labels (한국어 24자 기준)
        const maxLen = isHovered || isHighlighted ? 60 : 24;
        const labelText =
          node.label.length > maxLen ? node.label.slice(0, maxLen - 1) + "…" : node.label;

        // Subtle background for legibility (호버/하이라이트 시만)
        if (isHovered || isHighlighted) {
          const metrics = ctx.measureText(labelText);
          const padX = 6;
          const padY = 3;
          ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
          ctx.fillRect(
            node.x - metrics.width / 2 - padX,
            node.y + size + 4,
            metrics.width + padX * 2,
            fontSize * globalScale + padY * 2
          );
        }

        ctx.fillStyle = isDimmed
          ? "rgba(232,232,237,0.25)"
          : isHovered || isHighlighted
          ? "#ffffff"
          : "rgba(232,232,237,0.75)";
        ctx.fillText(labelText, node.x, node.y + size + 6);
      }

      ctx.globalAlpha = 1;
    },
    [] // No dependencies — reads from ref, not state
  );

  const nodePointerAreaPaint = useCallback(
    (node: { x: number; y: number; confidence?: number }, color: string, ctx: CanvasRenderingContext2D) => {
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
      const confidence = (node as GraphNode).confidence ?? 0;
      const size = confidence === 0 ? 3 : 4 + confidence * 1.2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    []
  );

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-muted mb-2">아직 엔트리가 없습니다</p>
          <p className="text-sm text-muted">첫 번째 위키 엔트리를 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full" role="region" aria-label="지식 그래프 — 학습 엔트리 간 연결 관계 시각화">
      <ForceGraph2D
        ref={graphRef as never}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0a0a0f"
        nodeCanvasObject={nodeCanvasObject as never}
        nodePointerAreaPaint={nodePointerAreaPaint as never}
        linkColor={() => "rgba(107, 107, 128, 0.25)"}
        linkWidth={0.8}
        // @ts-expect-error -- linkDistance not in types but works at runtime
        linkDistance={110}
        d3Force="charge"
        d3ForceStrength={-280}
        onNodeClick={handleNodeClick as never}
        onNodeHover={handleNodeHover as never}
        cooldownTicks={150}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.35}
        warmupTicks={50}
        minZoom={0.3}
        maxZoom={6}
      />

      {/* Hover tooltip */}
      {tooltipNode && tooltipNode.confidence > 0 && (
        <div className="pointer-events-none absolute bottom-6 left-6 max-w-xs rounded-[var(--radius-md)] border border-border bg-surface/95 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: CATEGORY_COLORS[tooltipNode.category] || "#6b6b80",
              }}
            />
            <span className="text-xs text-muted font-code">
              {tooltipNode.category}
            </span>
          </div>
          <p className="font-display text-sm font-bold">{tooltipNode.label}</p>
          <p className="text-xs text-muted mt-1">{tooltipNode.description}</p>
        </div>
      )}
    </div>
  );
}
