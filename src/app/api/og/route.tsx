import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "#f59e0b",
  "context-engineering": "#eab308",
  "harness-engineering": "#84cc16",
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
  "ios-ai": "#3b82f6",
  "frontend-ai": "#a855f7",
};

const CATEGORY_LABELS: Record<string, string> = {
  "prompt-engineering": "Prompt Engineering",
  "context-engineering": "Context Engineering",
  "harness-engineering": "Harness Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
  "ios-ai": "iOS + AI",
  "frontend-ai": "Frontend + AI",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "AI Study Wiki";
  const category = searchParams.get("category") || "";
  const accentColor = CATEGORY_COLORS[category] || "#3b82f6";
  const categoryLabel = CATEGORY_LABELS[category] || "";

  let font: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap"
    );
    const css = await fontRes.text();
    const fontUrlMatch = css.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontDataRes = await fetch(fontUrlMatch[1]);
      font = await fontDataRes.arrayBuffer();
    }
  } catch {
    // fallback to system font if fetch fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "#0a0a0f",
          fontFamily: font ? "Noto Sans KR" : "sans-serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "8px",
            height: "100%",
            background: accentColor,
          }}
        />

        {/* Top: Category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {categoryLabel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "20px",
                background: `${accentColor}20`,
                color: accentColor,
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accentColor,
                }}
              />
              {categoryLabel}
            </div>
          )}
        </div>

        {/* Center: Title */}
        <div
          style={{
            fontSize: title.length > 30 ? "42px" : "52px",
            fontWeight: 700,
            color: "#e8e8ed",
            lineHeight: 1.3,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Bottom: Site name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "#6b6b80", fontSize: "22px", fontWeight: 700 }}>
            AI Study Wiki
          </div>
          <div style={{ color: "#6b6b80", fontSize: "18px" }}>
            ai-study-wheat.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(font
        ? {
            fonts: [
              {
                name: "Noto Sans KR",
                data: font,
                weight: 700 as const,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    }
  );
}
