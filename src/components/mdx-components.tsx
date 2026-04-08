"use client";

import dynamic from "next/dynamic";

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

function CustomPre({ children, ...props }: React.ComponentProps<"pre">) {
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

  return <pre {...props}>{children}</pre>;
}

export const mdxComponents = {
  pre: CustomPre,
};
