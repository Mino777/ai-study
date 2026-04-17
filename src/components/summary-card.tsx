import type { Frontmatter } from "@/lib/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/schema";


const CONFIDENCE_LABELS = ["", "들어봤다", "이해했다", "적용했다", "깊이 안다", "가르칠 수 있다"];

interface SummaryCardProps {
  frontmatter: Frontmatter;
  slug?: string;
  readingTime?: number;
  searchHitCount?: number;
}

export function SummaryCard({ frontmatter, slug, readingTime, searchHitCount }: SummaryCardProps) {
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
        {readingTime && (
          <span className="text-xs text-muted font-code">약 {readingTime}분</span>
        )}
        {searchHitCount !== undefined && searchHitCount > 0 && (
          <span className="text-xs text-muted font-code" title="JIT 검색에서 이 엔트리가 조회된 횟수">
            JIT {searchHitCount}회
          </span>
        )}
        {frontmatter.status !== "complete" && (
          <span className="text-xs text-warning font-code">{frontmatter.status}</span>
        )}
        {slug && (
          <a
            href={`https://github.com/Mino777/ai-study/edit/main/content/${slug}.mdx`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-muted hover:text-accent transition-colors font-code"
          >
            GitHub에서 편집 →
          </a>
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
