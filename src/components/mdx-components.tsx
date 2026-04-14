"use client";

import dynamic from "next/dynamic";
import { CodeBlock } from "./code-block";

const MermaidDiagram = dynamic(
  () => import("./mermaid-diagram").then((mod) => mod.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[var(--radius-md)] border border-border bg-surface p-8 my-4 flex items-center justify-center">
        <span className="text-sm text-muted">다이어그램 로딩 중...</span>
      </div>
    ),
  }
);

interface CustomPreProps extends React.ComponentProps<"pre"> {
  "data-mermaid-chart"?: string;
}

function CustomPre({ children, ...props }: CustomPreProps) {
  // rehypeMermaid가 주입한 data-mermaid-chart 속성 감지
  const mermaidChart = props["data-mermaid-chart"];
  if (mermaidChart) {
    return <MermaidDiagram chart={mermaidChart} />;
  }

  // Fallback: 기존 language-mermaid className 감지 (shiki 미적용 환경)
  const child = children as React.ReactElement<{
    className?: string;
    children?: string;
  }>;
  if (
    child &&
    typeof child === "object" &&
    "props" in child &&
    child.props?.className === "language-mermaid"
  ) {
    const chart = child.props.children?.trim() || "";
    return <MermaidDiagram chart={chart} />;
  }

  return <CodeBlock {...props}>{children}</CodeBlock>;
}

export const mdxComponents = {
  pre: CustomPre,
};
