/**
 * Rehype plugin: mermaid 코드 블록을 shiki 처리 전에 추출.
 *
 * rehypeShiki보다 먼저 실행되어야 한다.
 * <pre><code class="language-mermaid">chart</code></pre> 에서
 * language-mermaid 클래스를 제거하고 <pre data-mermaid-chart="chart"> 로 변환.
 * 이렇게 하면 shiki가 이 블록을 건드리지 않고,
 * CustomPre가 data-mermaid-chart 속성으로 mermaid를 감지할 수 있다.
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
    visit(tree, "element", (node: HastNode) => {
      if (node.tagName !== "pre") return;
      const code = node.children?.[0];
      if (!code || code.tagName !== "code") return;

      const classes = code.properties?.className;
      if (
        !Array.isArray(classes) ||
        !classes.includes("language-mermaid")
      )
        return;

      // Extract raw text from code children
      const chart =
        code.children
          ?.map((c: HastNode) => c.value || "")
          .join("") || "";

      // Store chart text as data attribute on <pre>
      node.properties = node.properties || {};
      node.properties["data-mermaid-chart"] = chart;

      // Remove language class so shiki skips this block
      code.properties!.className = [];
    });
  };
}
