import Link from "next/link";
import type { Metadata } from "next";
import { getManifest } from "@/lib/content";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/schema";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "학습 타임라인",
  description: "날짜별 학습 기록 — 시간순으로 정리된 Mino's AI Study Wiki 엔트리",
  alternates: { canonical: "/timeline" },
};

export default function TimelinePage() {
  const manifest = getManifest();

  // Group entries by date (desc)
  const byDate = new Map<string, typeof manifest.entries>();
  for (const entry of manifest.entries) {
    const date = entry.frontmatter.date;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(entry);
  }

  const sortedDates = Array.from(byDate.keys()).sort((a, b) =>
    b.localeCompare(a)
  );

  // Month grouping for headers
  const monthGroups = new Map<string, string[]>();
  for (const date of sortedDates) {
    const month = date.substring(0, 7); // YYYY-MM
    if (!monthGroups.has(month)) monthGroups.set(month, []);
    monthGroups.get(month)!.push(date);
  }

  const totalDays = sortedDates.length;
  const totalEntries = manifest.entries.length;

  return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-10">
            <h1 className="font-display text-3xl font-black tracking-tight text-text mb-2">
              학습 타임라인
            </h1>
            <p className="text-muted">
              {totalDays}일 동안 {totalEntries}개의 엔트리 · 시간순 학습 기록
            </p>
          </div>

          {Array.from(monthGroups.entries()).map(([month, dates]) => {
            const monthEntries = dates.flatMap((d) => byDate.get(d) || []);
            const monthLabel = new Date(month + "-01").toLocaleDateString(
              "ko-KR",
              { year: "numeric", month: "long" }
            );
            return (
              <section key={month} className="mb-12">
                <div className="flex items-baseline justify-between mb-6 border-b border-border pb-3">
                  <h2 className="font-display text-xl font-bold text-text">
                    {monthLabel}
                  </h2>
                  <span className="text-xs text-muted font-code">
                    {monthEntries.length}개 엔트리 · {dates.length}일
                  </span>
                </div>

                <div className="space-y-8">
                  {dates.map((date) => {
                    const dayEntries = byDate.get(date) || [];
                    const d = new Date(date);
                    const weekday = ["일", "월", "화", "수", "목", "금", "토"][
                      d.getDay()
                    ];
                    return (
                      <div key={date} className="flex gap-6">
                        {/* Date column */}
                        <div className="w-16 shrink-0 text-right">
                          <div className="font-data text-2xl font-bold text-text leading-none">
                            {d.getDate()}
                          </div>
                          <div className="text-xs text-muted mt-1">
                            {weekday}요일
                          </div>
                        </div>

                        {/* Timeline dot + line */}
                        <div className="relative flex flex-col items-center shrink-0">
                          <div className="h-3 w-3 rounded-full bg-accent shrink-0 mt-2" />
                          <div className="w-px flex-1 bg-border mt-1" />
                        </div>

                        {/* Entries column */}
                        <div className="flex-1 space-y-3 pb-4">
                          {dayEntries.map((entry) => {
                            const cat = entry.frontmatter.category;
                            return (
                              <Link
                                key={entry.slug}
                                href={`/wiki/${entry.slug}`}
                                className="block rounded-[var(--radius-md)] border border-border bg-surface p-4 hover:border-accent transition-colors group"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold font-code"
                                    style={{
                                      background: `color-mix(in srgb, ${CATEGORY_COLORS[cat]} 15%, transparent)`,
                                      color: CATEGORY_COLORS[cat],
                                    }}
                                  >
                                    {CATEGORY_LABELS[cat] || cat}
                                  </span>
                                  {entry.frontmatter.status !== "complete" && (
                                    <span className="text-xs text-warning font-code">
                                      {entry.frontmatter.status}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-display text-base font-bold text-text group-hover:text-accent transition-colors mb-1">
                                  {entry.frontmatter.title}
                                </h3>
                                <p className="text-sm text-muted line-clamp-2">
                                  {entry.frontmatter.description}
                                </p>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {sortedDates.length === 0 && (
            <p className="text-center text-muted py-12">
              아직 학습 기록이 없습니다
            </p>
          )}
        </main>
      </div>
  );
}
