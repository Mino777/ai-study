import Link from "next/link";
import { getManifest } from "@/lib/content";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger, SearchDialog } from "@/components/search-dialog";
import type { Category } from "@/lib/schema";
import { GraphSearchProvider } from "@/contexts/graph-search-context";

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

function ConfidenceBar({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full"
          style={{
            background: i < level ? "var(--accent)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const manifest = getManifest();
  const entries = manifest.entries;

  // Category stats
  const categoryStats: Record<
    string,
    { count: number; totalConfidence: number; entries: typeof entries }
  > = {};
  for (const entry of entries) {
    const cat = entry.frontmatter.category;
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, totalConfidence: 0, entries: [] };
    categoryStats[cat].count++;
    categoryStats[cat].totalConfidence += entry.frontmatter.confidence;
    categoryStats[cat].entries.push(entry);
  }

  // Learning path recommendation: find lowest confidence entries with connections
  const recommendations = [...entries]
    .filter((e) => e.frontmatter.confidence < 4)
    .sort((a, b) => a.frontmatter.confidence - b.frontmatter.confidence)
    .slice(0, 3);

  // Search entries for dialog
  const searchEntries = entries.map((e) => ({
    slug: e.slug,
    title: e.frontmatter.title,
    category: e.frontmatter.category,
    description: e.frontmatter.description,
    tags: e.frontmatter.tags,
  }));

  // Overall stats
  const totalEntries = entries.length;
  const avgConfidence =
    totalEntries > 0
      ? (entries.reduce((sum, e) => sum + e.frontmatter.confidence, 0) / totalEntries).toFixed(1)
      : "0";
  const completeCount = entries.filter((e) => e.frontmatter.status === "complete").length;

  return (
    <GraphSearchProvider>
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-bg/80 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-text hover:text-accent transition-colors"
          >
            AI Study Wiki
          </Link>
          <div className="flex items-center gap-3">
            <SearchTrigger />
            <Link href="/wiki" className="text-sm text-muted hover:text-text transition-colors">
              Wiki
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-3xl font-black tracking-tight mb-8">
          학습 대시보드
        </h1>

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
            <div className="font-data text-2xl font-semibold text-text">{totalEntries}</div>
            <div className="text-xs text-muted mt-1">총 엔트리</div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
            <div className="font-data text-2xl font-semibold text-text">{completeCount}</div>
            <div className="text-xs text-muted mt-1">완료</div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
            <div className="font-data text-2xl font-semibold text-text">{avgConfidence}</div>
            <div className="text-xs text-muted mt-1">평균 Confidence</div>
          </div>
        </div>

        {/* Category progress */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4">카테고리별 진도</h2>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const avg = stats.totalConfidence / stats.count;
              return (
                <div
                  key={category}
                  className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: CATEGORY_COLORS[category] }}
                      />
                      <span className="font-display text-sm font-bold">
                        {CATEGORY_LABELS[category] || category}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      {stats.count}개 엔트리 / 평균 {avg.toFixed(1)}/5
                    </span>
                  </div>
                  <ConfidenceBar level={Math.round(avg)} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stats.entries.map((e) => (
                      <Link
                        key={e.slug}
                        href={`/wiki/${e.slug}`}
                        className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-muted hover:text-text transition-colors"
                      >
                        {e.frontmatter.title}
                        <span className="ml-1 opacity-60">
                          {CONFIDENCE_LABELS[e.frontmatter.confidence]}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.keys(categoryStats).length === 0 && (
              <div className="text-center py-8 text-muted">
                아직 학습 기록이 없어요. 첫 번째 엔트리를 추가해보세요.
              </div>
            )}
          </div>
        </section>

        {/* Learning path recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold mb-4">
              다음에 공부하면 좋을 것
            </h2>
            <p className="text-sm text-muted mb-4">
              confidence가 낮은 주제 중 다른 개념과 연결된 것들을 추천합니다.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {recommendations.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/wiki/${entry.slug}`}
                  className="rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-accent"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: CATEGORY_COLORS[entry.frontmatter.category] || "var(--accent)",
                      }}
                    />
                    <span className="text-xs text-muted font-code">
                      {entry.frontmatter.category}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold mb-1">
                    {entry.frontmatter.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2">
                    {entry.frontmatter.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted">Confidence</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background:
                              i <= entry.frontmatter.confidence ? "var(--accent)" : "var(--border)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SearchDialog entries={searchEntries} />
    </div>
    </GraphSearchProvider>
  );
}
