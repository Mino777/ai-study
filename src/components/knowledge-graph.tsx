"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGraphSearch } from "@/contexts/graph-search-context";
import { CATEGORY_COLORS } from "@/lib/schema";

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
    (node: GraphNode & { x: number; y: number }, ctx: CanvasRenderingContext2D) => {
      const color = CATEGORY_COLORS[node.category] || "#6b6b80";
      const hovered = hoveredNodeRef.current;
      const isHovered = hovered?.id === node.id;
      const isHighlighted = highlightedRef.current.size > 0 && highlightedRef.current.has(node.id);
      const isDimmed = highlightedRef.current.size > 0 && !isHighlighted && !isHovered;
      const isDangling = node.confidence === 0;
      const baseSize = isDangling ? 4 : 6 + node.confidence * 1.5;
      const size = isHovered || isHighlighted ? baseSize * 1.4 : baseSize;

      const opacity = isDimmed ? 0.2 : 1;

      ctx.globalAlpha = opacity;

      // Glow effect
      if (!isDangling) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${isHovered || isHighlighted ? "50" : "20"}`;
        ctx.fill();
      }

      // Highlight ring
      if (isHighlighted && !isDangling) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 6, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      if (isDangling) {
        ctx.strokeStyle = "#6b6b80";
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Label — 항상 표시 (dangling은 작게)
      if (!isDangling || isHovered) {
        const fontSize = isHovered || isHighlighted ? 12 : isDangling ? 9 : 11;
        ctx.font = `${isHovered || isHighlighted ? "bold " : ""}${fontSize}px Pretendard Variable, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDimmed ? "rgba(232,232,237,0.3)" : isDangling ? "rgba(232,232,237,0.5)" : "#e8e8ed";
        ctx.fillText(node.label, node.x, node.y + size + 6);
      }

      ctx.globalAlpha = 1;
    },
    [] // No dependencies — reads from ref, not state
  );

  const nodePointerAreaPaint = useCallback(
    (node: { x: number; y: number; confidence?: number }, color: string, ctx: CanvasRenderingContext2D) => {
      const confidence = (node as GraphNode).confidence ?? 0;
      const size = confidence === 0 ? 4 : 6 + confidence * 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
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
        linkColor={() => "rgba(107, 107, 128, 0.3)"}
        linkWidth={1}
        // @ts-expect-error -- linkDistance not in types but works at runtime
        linkDistance={180}
        d3Force="charge"
        d3ForceStrength={-500}
        onNodeClick={handleNodeClick as never}
        onNodeHover={handleNodeHover as never}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
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
