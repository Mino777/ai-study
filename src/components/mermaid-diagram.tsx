"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#3b82f6",
            primaryTextColor: "#e8e8ed",
            primaryBorderColor: "#1e1e30",
            lineColor: "#6b6b80",
            secondaryColor: "#141420",
            tertiaryColor: "#1c1c2e",
            fontFamily: "Pretendard Variable, sans-serif",
            fontSize: "14px",
          },
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Mermaid 렌더링 실패");
      }
    }
    render();
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-[var(--radius-md)] border border-error/30 bg-error/5 p-4 my-4">
        <p className="text-xs text-error font-code mb-2">Mermaid 다이어그램 에러</p>
        <pre className="text-xs text-muted whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-[var(--radius-md)] border border-border bg-surface p-8 my-4 flex items-center justify-center">
        <span className="text-sm text-muted">다이어그램 렌더링 중...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-[var(--radius-md)] border border-border bg-surface p-4 my-4 overflow-x-auto [&_svg]:mx-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
