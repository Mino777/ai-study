"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "#f59e0b",
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

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

  const graphData = {
    nodes: nodes.map((n) => ({ ...n })),
    links: edges.map((e) => ({ ...e })),
  };

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.confidence === 0) return; // dangling node
      router.push(`/wiki/${node.id}`);
    },
    [router]
  );

  const nodeCanvasObject = useCallback(
    (node: GraphNode & { x: number; y: number }, ctx: CanvasRenderingContext2D) => {
      const color = CATEGORY_COLORS[node.category] || "#6b6b80";
      const isHovered = hoveredNode?.id === node.id;
      const isDangling = node.confidence === 0;
      const baseSize = isDangling ? 3 : 4 + node.confidence * 1.5;
      const size = isHovered ? baseSize * 1.3 : baseSize;

      // Glow effect
      if (!isDangling) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${isHovered ? "40" : "20"}`;
        ctx.fill();
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

      // Label
      if (isHovered || size > 6) {
        ctx.font = `${isHovered ? "bold " : ""}11px Pretendard Variable, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#e8e8ed";
        ctx.fillText(node.label, node.x, node.y + size + 4);
      }
    },
    [hoveredNode]
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
    <div ref={containerRef} className="relative h-full w-full">
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0a0a0f"
        nodeCanvasObject={nodeCanvasObject as never}
        nodePointerAreaPaint={((node: { x: number; y: number; confidence?: number }, color: string, ctx: CanvasRenderingContext2D) => {
          const confidence = (node as GraphNode).confidence ?? 0;
          const size = confidence === 0 ? 3 : 4 + confidence * 1.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }) as never}
        linkColor={() => "rgba(107, 107, 128, 0.3)"}
        linkWidth={1}
        onNodeClick={handleNodeClick as never}
        onNodeHover={((node: GraphNode | null) => setHoveredNode(node)) as never}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Hover tooltip */}
      {hoveredNode && hoveredNode.confidence > 0 && (
        <div className="pointer-events-none absolute bottom-6 left-6 max-w-xs rounded-[var(--radius-md)] border border-border bg-surface/95 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: CATEGORY_COLORS[hoveredNode.category] || "#6b6b80",
              }}
            />
            <span className="text-xs text-muted font-code">
              {hoveredNode.category}
            </span>
          </div>
          <p className="font-display text-sm font-bold">{hoveredNode.label}</p>
          <p className="text-xs text-muted mt-1">{hoveredNode.description}</p>
        </div>
      )}
    </div>
  );
}
