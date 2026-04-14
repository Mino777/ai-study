"use client";

import { useEffect } from "react";

/**
 * 페이지 내 모든 .mermaid-block div를 찾아서 mermaid SVG로 렌더링.
 * rehypeMermaid 플러그인이 만든 <div class="mermaid-block"><script type="application/mermaid">chart</script></div>
 * 구조를 감지해 클라이언트에서 mermaid.render() 호출.
 */
export function MermaidRenderer() {
  useEffect(() => {
    async function renderAll() {
      const blocks = document.querySelectorAll(".mermaid-block");
      if (blocks.length === 0) return;

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

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i] as HTMLElement;
        const script = block.querySelector('script[type="application/mermaid"]');
        const chart = script?.textContent?.trim();
        if (!chart) continue;

        try {
          const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
          const { svg } = await mermaid.render(id, chart);
          block.innerHTML = svg;
          block.classList.remove("mermaid-block");
          block.classList.add("mermaid-rendered");
          block.style.cssText =
            "border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); padding: 1rem; margin: 1rem 0; overflow-x: auto;";
          // Center the SVG
          const svgEl = block.querySelector("svg");
          if (svgEl) svgEl.style.margin = "0 auto";
        } catch (err) {
          block.innerHTML = `<div style="border:1px solid rgba(255,0,0,0.3); background:rgba(255,0,0,0.05); padding:1rem; border-radius:8px;">
            <p style="font-size:12px; color:#f87171; margin:0 0 8px;">Mermaid 에러</p>
            <pre style="font-size:12px; color:#999; white-space:pre-wrap; margin:0;">${chart}</pre>
          </div>`;
        }
      }
    }

    renderAll();
  }, []);

  return null;
}
