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

// Recursively extract text content from React children (handles shiki spans)
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

function CustomPre({
  children,
  className,
  ...props
}: React.ComponentProps<"pre">) {
  // rehypeMermaid가 주입한 mermaid-raw 클래스 감지
  if (className === "mermaid-raw") {
    const chart = extractText(children).trim();
    return <MermaidDiagram chart={chart} />;
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
    const chart =
      typeof child.props.children === "string"
        ? child.props.children.trim()
        : extractText(child.props.children).trim();
    return <MermaidDiagram chart={chart} />;
  }

  return (
    <CodeBlock className={className} {...props}>
      {children}
    </CodeBlock>
  );
}

export const mdxComponents = {
  pre: CustomPre,
};
