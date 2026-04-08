import Link from "next/link";
import { getManifest } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiki — AI Study Wiki",
  description: "AI 하네스 엔지니어링 위키 엔트리 전체 목록",
};

const CATEGORY_LABELS: Record<string, string> = {
  "prompt-engineering": "Prompt Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
};

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "#f59e0b",
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
  "ios-ai": "#3b82f6",
  "frontend-ai": "#a855f7",
};

const CONFIDENCE_LABELS = ["", "들어봤다", "이해했다", "적용했다", "깊이 안다", "가르칠 수 있다"];

export default function WikiIndexPage() {
  const manifest = getManifest();

  const grouped: Record<string, typeof manifest.entries> = {};
  for (const entry of manifest.entries) {
    const cat = entry.frontmatter.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-black tracking-tight mb-2">
        위키
      </h1>
      <p className="text-muted mb-8">
        {manifest.entries.length}개의 엔트리가 있습니다
      </p>

      {Object.entries(grouped).map(([category, entries]) => (
        <section key={category} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: CATEGORY_COLORS[category] }}
            />
            <h2 className="font-display text-xl font-bold">
              {CATEGORY_LABELS[category] || category}
            </h2>
            <span className="text-sm text-muted">({entries.length})</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/wiki/${entry.slug}`}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-5 transition-colors hover:border-accent group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold font-code"
                    style={{
                      background: `color-mix(in srgb, ${CATEGORY_COLORS[category]} 15%, transparent)`,
                      color: CATEGORY_COLORS[category],
                    }}
                  >
                    {CATEGORY_LABELS[category]}
                  </span>
                  {entry.frontmatter.status !== "complete" && (
                    <span className="text-xs text-warning font-code">
                      {entry.frontmatter.status}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-lg font-bold mb-1 group-hover:text-accent transition-colors">
                  {entry.frontmatter.title}
                </h3>

                <p className="text-sm text-muted line-clamp-2 mb-3">
                  {entry.frontmatter.description}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted">Confidence</span>
                    <span className="inline-flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background:
                              i <= entry.frontmatter.confidence
                                ? "var(--accent)"
                                : "var(--border)",
                          }}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted">
                      {CONFIDENCE_LABELS[entry.frontmatter.confidence]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
