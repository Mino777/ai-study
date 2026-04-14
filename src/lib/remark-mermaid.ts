/**
 * Rehype plugin: mermaid 코드 블록을 shiki 처리 전에 추출.
 *
 * rehypeShiki보다 먼저 실행되어야 한다 (rehypePlugins 배열에서 shiki 앞에 배치).
 *
 * 변환: <pre><code class="language-mermaid">chart</code></pre>
 *     → <pre class="mermaid-raw"><code>chart</code></pre>
 *
 * - language-mermaid 클래스를 제거해 shiki가 이 블록을 무시하게 함
 * - pre에 mermaid-raw 클래스를 추가해 CustomPre가 감지할 수 있게 함
 * - code 자식의 텍스트 내용은 그대로 보존 (CustomPre가 추출)
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

      // Mark pre with mermaid-raw class for CustomPre detection
      node.properties = node.properties || {};
      node.properties.className = ["mermaid-raw"];

      // Remove language-mermaid from code so shiki skips this block
      code.properties!.className = [];
    });
  };
}
