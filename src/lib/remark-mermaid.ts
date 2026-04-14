/**
 * Rehype plugin: mermaid 코드 블록을 shiki 처리 전에 추출.
 *
 * rehypeShiki보다 먼저 실행되어야 한다 (rehypePlugins 배열에서 shiki 앞에 배치).
 *
 * 변환: <pre><code class="language-mermaid">chart</code></pre>
 *     → <div class="mermaid-block">chart text</div>
 *
 * pre가 아닌 div로 변환하여 CustomPre/CodeBlock 체인을 완전히 우회.
 * mdxComponents의 div 오버라이드가 mermaid-block 클래스를 감지해 MermaidDiagram 렌더.
 */
import { visit } from "unist-util-visit";

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

export function rehypeMermaid() {
  return (tree: HastNode) => {
    visit(
      tree,
      "element",
      (node: HastNode, index: number | undefined, parent: HastNode | undefined) => {
        if (node.tagName !== "pre" || !parent || index === undefined) return;
        const code = node.children?.[0];
        if (!code || code.tagName !== "code") return;

        const classes = code.properties?.className;
        if (!Array.isArray(classes) || !classes.includes("language-mermaid"))
          return;

        // Extract raw text from code children
        const chart = code.children
          ?.map((c: HastNode) => c.value || "")
          .join("") || "";

        // Replace entire <pre> node with <div class="mermaid-block">
        // containing a hidden <script type="application/mermaid"> with chart data
        parent.children![index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["mermaid-block"] },
          children: [
            {
              type: "element",
              tagName: "script",
              properties: { type: "application/mermaid" },
              children: [{ type: "text", value: chart }],
            },
          ],
        };
      }
    );
  };
}
