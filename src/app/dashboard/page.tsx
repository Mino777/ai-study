import Link from "next/link";
import type { Metadata } from "next";
import { getManifest } from "@/lib/content";
import type { Category } from "@/lib/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/schema";
import { Header } from "@/components/header";
import { LearningHeatmap } from "@/components/learning-heatmap";
import { QuizWidget } from "@/components/quiz-widget";

export const metadata: Metadata = {
  title: "학습 대시보드",
  description: "AI 하네스 엔지니어링 학습 진도, 스트릭, 카테고리별 통계",
  alternates: { canonical: "/dashboard" },
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

  // Quizable entries (have quiz frontmatter with at least one question)
  const quizableEntries = entries
    .filter((e) => Array.isArray(e.frontmatter.quiz) && e.frontmatter.quiz.length > 0)
    .map((e) => ({
      slug: e.slug,
      title: e.frontmatter.title,
      category: e.frontmatter.category,
      questionCount: e.frontmatter.quiz?.length ?? 0,
    }));

  // Overall stats
  const totalEntries = entries.length;
  const avgConfidence =
    totalEntries > 0
      ? (entries.reduce((sum, e) => sum + e.frontmatter.confidence, 0) / totalEntries).toFixed(1)
      : "0";
  const completeCount = entries.filter((e) => e.frontmatter.status === "complete").length;

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-3xl font-black tracking-tight mb-8">
          학습 대시보드
        </h1>

        {/* Learning Streak */}
        {manifest.streak.current > 0 && (
          <div className="rounded-[var(--radius-lg)] border border-accent/30 bg-accent/5 p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <div className="font-display text-2xl font-black text-text">
                  연속 {manifest.streak.current}일째 학습 중!
                </div>
                <div className="text-sm text-muted mt-1">
                  최장 기록: {manifest.streak.longest}일
                  {manifest.streak.lastActiveDate && (
                    <span className="ml-2">· 마지막 학습: {manifest.streak.lastActiveDate}</span>
                  )}
                </div>
              </div>
            </div>
            {manifest.streak.current >= 7 && (
              <div className="flex gap-2 mt-4">
                {manifest.streak.current >= 7 && (
                  <span className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                    🏅 7일 연속
                  </span>
                )}
                {manifest.streak.current >= 14 && (
                  <span className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                    🏆 14일 연속
                  </span>
                )}
                {manifest.streak.current >= 30 && (
                  <span className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                    👑 30일 연속
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Learning Heatmap */}
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5 mb-8">
          <LearningHeatmap dailyEntries={manifest.dailyEntries || {}} />
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
            <div className="font-data text-2xl font-semibold text-text">{manifest.streak.current}</div>
            <div className="text-xs text-muted mt-1">연속 학습</div>
          </div>
        </div>

        {/* JIT Search Stats */}
        {manifest.searchHits && manifest.searchHits.totalQueries > 0 && (() => {
          const { totalQueries, hits } = manifest.searchHits;
          const hitEntries = Object.entries(hits).sort(([, a], [, b]) => b - a);
          const totalHitSlugs = hitEntries.length;
          const neverHit = entries.filter((e) => !hits[e.slug]).length;
          return (
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5 mb-8">
              <h2 className="font-display text-lg font-bold mb-4">JIT 검색 통계</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-data text-xl font-semibold text-text">{totalQueries}</div>
                  <div className="text-xs text-muted">총 쿼리</div>
                </div>
                <div className="text-center">
                  <div className="font-data text-xl font-semibold text-text">{totalHitSlugs}</div>
                  <div className="text-xs text-muted">조회된 엔트리</div>
                </div>
                <div className="text-center">
                  <div className="font-data text-xl font-semibold text-text">{neverHit}</div>
                  <div className="text-xs text-muted">미조회 엔트리</div>
                </div>
              </div>
              {hitEntries.length > 0 && (
                <div>
                  <h3 className="text-xs text-muted font-semibold mb-2">Top 조회 엔트리</h3>
                  <div className="space-y-1">
                    {hitEntries.slice(0, 5).map(([slug, count]) => {
                      const entry = entries.find((e) => e.slug === slug);
                      const title = entry?.frontmatter.title || slug.split("/").pop()?.replace(/-/g, " ") || slug;
                      const barWidth = Math.round((count / hitEntries[0][1]) * 100);
                      return (
                        <div key={slug} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-text truncate">{title}</div>
                            <div className="h-1 rounded-full bg-border mt-0.5">
                              <div
                                className="h-1 rounded-full"
                                style={{ width: `${barWidth}%`, background: "var(--accent)" }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted font-code shrink-0">{count}회</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Quiz widget */}
        <QuizWidget quizableEntries={quizableEntries} />

        {/* Category progress */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4">최근 업데이트</h2>
          <div className="space-y-2 mb-10">
            {manifest.stats.recentEntries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/wiki/${entry.slug}`}
                className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 transition-colors hover:bg-surface"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[entry.category] || "var(--accent)" }}
                />
                <span className="text-sm text-text truncate flex-1">{entry.title}</span>
                <span className="text-xs text-muted font-code shrink-0">{entry.date}</span>
              </Link>
            ))}
          </div>

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
    </div>
  );
}
