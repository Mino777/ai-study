import type { Frontmatter } from "@/lib/schema";

const CATEGORY_LABELS: Record<string, string> = {
  "prompt-engineering": "Prompt Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
};

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "var(--cat-prompt)",
  "context-engineering": "var(--cat-context)",
  "harness-engineering": "var(--cat-harness)",
  rag: "var(--cat-rag)",
  agents: "var(--cat-agents)",
  "fine-tuning": "var(--cat-finetune)",
  evaluation: "var(--cat-eval)",
  infrastructure: "var(--cat-infra)",
  "ios-ai": "var(--cat-ios-ai)",
  "frontend-ai": "var(--cat-frontend-ai)",
};

const CONFIDENCE_LABELS = ["", "들어봤다", "이해했다", "적용했다", "깊이 안다", "가르칠 수 있다"];

interface SummaryCardProps {
  frontmatter: Frontmatter;
}

export function SummaryCard({ frontmatter }: SummaryCardProps) {
  const catColor = CATEGORY_COLORS[frontmatter.category] || "var(--accent)";

  return (
    <div
      className="rounded-[var(--radius-md)] border border-border bg-surface p-6 mb-8"
      style={{ borderLeftWidth: 3, borderLeftColor: catColor }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold font-code"
          style={{
            background: `color-mix(in srgb, ${catColor} 15%, transparent)`,
            color: catColor,
          }}
        >
          {CATEGORY_LABELS[frontmatter.category] || frontmatter.category}
        </span>
        <span className="text-xs text-muted font-code">{frontmatter.date}</span>
        {frontmatter.status !== "complete" && (
          <span className="text-xs text-warning font-code">{frontmatter.status}</span>
        )}
      </div>

      <h1 className="font-display text-3xl font-black tracking-tight mb-2">
        {frontmatter.title}
      </h1>

      <p className="text-muted mb-4">{frontmatter.description}</p>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Confidence</span>
          <span className="inline-flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background:
                    i <= frontmatter.confidence ? "var(--accent)" : "var(--border)",
                }}
              />
            ))}
          </span>
          <span className="text-xs text-muted">
            {CONFIDENCE_LABELS[frontmatter.confidence]}
          </span>
        </div>

        {frontmatter.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
