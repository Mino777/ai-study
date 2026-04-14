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

// Mermaid block: rehypeMermaid가 <pre><code class="language-mermaid"> 를
// <div class="mermaid-block"><script type="application/mermaid">chart</script></div>
// 로 변환. 이 컴포넌트가 div를 감지해 MermaidDiagram을 렌더.
function MermaidBlockDiv({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  if (className === "mermaid-block") {
    // children은 <script type="application/mermaid">chart</script>
    // React에서 script의 children을 추출
    const chart = extractText(children).trim();
    if (chart) {
      return <MermaidDiagram chart={chart} />;
    }
  }
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

// Recursively extract text content from React children
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

function CustomPre({ children, ...props }: React.ComponentProps<"pre">) {
  // Fallback: language-mermaid className 감지 (rehypeMermaid 미적용 환경)
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

  return <CodeBlock {...props}>{children}</CodeBlock>;
}

export const mdxComponents = {
  pre: CustomPre,
  div: MermaidBlockDiv,
};
