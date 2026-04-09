import Link from "next/link";
import { getManifest } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiki — AI Study Wiki",
  description: "AI 하네스 엔지니어링 위키 엔트리 전체 목록",
};

const CONFIDENCE_LABELS = ["", "들어봤다", "이해했다", "적용했다", "깊이 안다", "가르칠 수 있다"];

const COMING_SOON_TOPICS: Record<string, string[]> = {
  "fine-tuning": ["LoRA / QLoRA", "RLHF & DPO", "데이터셋 준비"],
  "frontend-ai": ["React + AI 패턴", "On-device Inference", "AI UX 설계"],
};

export default function WikiIndexPage() {
  const manifest = getManifest();

  const grouped: Record<string, typeof manifest.entries> = {};
  for (const entry of manifest.entries) {
    const cat = entry.frontmatter.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  const emptyCategories = CATEGORIES.filter((cat) => !grouped[cat] || grouped[cat].length === 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-black tracking-tight mb-2">
        위키
      </h1>
      <p className="text-muted mb-8">
        {manifest.entries.length}개의 엔트리 · {CATEGORIES.length - emptyCategories.length}/{CATEGORIES.length} 카테고리
      </p>

      {CATEGORIES.filter((cat) => grouped[cat] && grouped[cat].length > 0).map((category) => {
        const entries = grouped[category];
        return (
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
        );
      })}

      {/* Coming Soon categories */}
      {emptyCategories.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-muted">
            Coming Soon
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {emptyCategories.map((category) => {
              const topics = COMING_SOON_TOPICS[category];
              return (
                <div
                  key={category}
                  className="rounded-[var(--radius-md)] border border-border/50 bg-surface/50 p-5 opacity-60"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="h-3 w-3 rounded-full opacity-50"
                      style={{ background: CATEGORY_COLORS[category] }}
                    />
                    <span className="font-display text-lg font-bold text-muted">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                  </div>
                  {topics && (
                    <ul className="text-xs text-muted space-y-1">
                      {topics.map((topic) => (
                        <li key={topic} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-border" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
