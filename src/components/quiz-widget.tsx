"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  computeQuizStats,
  getDueReviews,
  getIntervalForStep,
  loadAttempts,
  type DueReview,
  type QuizStats,
} from "@/lib/quiz-storage";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/schema";

interface QuizableEntry {
  slug: string;
  title: string;
  category: string;
  questionCount: number;
}

interface QuizWidgetProps {
  quizableEntries: QuizableEntry[];
}

export function QuizWidget({ quizableEntries }: QuizWidgetProps) {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [dueReviews, setDueReviews] = useState<DueReview[]>([]);

  useEffect(() => {
    setStats(computeQuizStats(loadAttempts()));
    setDueReviews(getDueReviews());
  }, []);

  if (quizableEntries.length === 0) return null;

  const titleMap = new Map(quizableEntries.map((e) => [e.slug, e]));
  const totalQuizable = quizableEntries.length;

  // Stable order
  const empty = stats === null;
  const taken = empty ? 0 : Object.keys(stats.bySlug).length;
  const accuracy = empty ? 0 : stats.accuracy;
  const totalQuestions = empty ? 0 : stats.totalQuestions;
  const totalCorrect = empty ? 0 : stats.totalCorrect;

  const accuracyColor =
    accuracy >= 80
      ? "var(--success)"
      : accuracy >= 50
        ? "var(--warning)"
        : "var(--error)";

  // Weakest categories (lowest accuracy among those attempted)
  const weakCategories = empty
    ? []
    : Object.entries(stats.byCategory)
        .filter(([, c]) => c.total >= 2)
        .sort((a, b) => a[1].accuracy - b[1].accuracy)
        .slice(0, 3);

  // Recommended next quizzes: not yet attempted
  const notAttempted = quizableEntries.filter(
    (e) => empty || !stats.bySlug[e.slug]
  );
  const recommended = notAttempted.slice(0, 3);

  // Recent attempts (sorted by lastAt desc)
  const recentSlugs = empty
    ? []
    : Object.entries(stats.bySlug)
        .sort((a, b) => (a[1].lastAt < b[1].lastAt ? 1 : -1))
        .slice(0, 5);

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-xl font-bold">자가 점검 퀴즈</h2>
        <span className="text-xs text-muted font-code">
          {taken}/{totalQuizable} 응시
        </span>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
          <div
            className="font-data text-2xl font-semibold"
            style={{ color: empty || totalQuestions === 0 ? "var(--text)" : accuracyColor }}
          >
            {empty || totalQuestions === 0 ? "—" : `${accuracy}%`}
          </div>
          <div className="text-xs text-muted mt-1">정답률</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
          <div className="font-data text-2xl font-semibold text-text">{totalCorrect}</div>
          <div className="text-xs text-muted mt-1">맞춘 문항</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
          <div className="font-data text-2xl font-semibold text-text">{totalQuestions}</div>
          <div className="text-xs text-muted mt-1">푼 문항</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4 text-center">
          <div className="font-data text-2xl font-semibold text-text">{taken}</div>
          <div className="text-xs text-muted mt-1">응시 엔트리</div>
        </div>
      </div>

      {/* SRS due reviews */}
      {dueReviews.length > 0 && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-warning/40 bg-warning/5 p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-sm font-bold flex items-center gap-2">
              <span aria-hidden>⏰</span> 오늘 복습할 엔트리
            </h3>
            <span className="font-code text-xs text-muted">{dueReviews.length}개</span>
          </div>
          <ul className="space-y-2">
            {dueReviews.slice(0, 5).map((r) => {
              const meta = titleMap.get(r.slug);
              if (!meta) return null;
              const interval = getIntervalForStep(r.step);
              return (
                <li key={r.slug}>
                  <Link
                    href={`/wiki/${r.slug}`}
                    className="flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-surface-hover transition-colors"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        background: CATEGORY_COLORS[r.category] || "var(--accent)",
                      }}
                    />
                    <span className="text-sm text-text truncate flex-1">{meta.title}</span>
                    <span className="font-code text-xs text-muted shrink-0">
                      {r.daysOverdue === 0 ? "오늘" : `${r.daysOverdue}일 지남`} · {interval}일 주기
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {dueReviews.length > 5 && (
            <p className="mt-2 text-xs text-muted text-right">
              +{dueReviews.length - 5}개 더
            </p>
          )}
        </div>
      )}

      {empty || totalQuestions === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted mb-3">
            아직 푼 퀴즈가 없습니다. 위키 엔트리 하단에서 자가 점검 퀴즈를 시도해 보세요.
          </p>
          {recommended.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {recommended.map((e) => (
                <Link
                  key={e.slug}
                  href={`/wiki/${e.slug}`}
                  className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent hover:bg-accent hover:text-white transition-colors"
                >
                  {e.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Weakest categories */}
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <h3 className="font-display text-sm font-bold mb-3">약한 카테고리</h3>
            {weakCategories.length === 0 ? (
              <p className="text-xs text-muted">
                아직 카테고리별 통계를 내기에 데이터가 부족합니다.
              </p>
            ) : (
              <ul className="space-y-3">
                {weakCategories.map(([cat, info]) => (
                  <li key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: CATEGORY_COLORS[cat] || "var(--accent)",
                          }}
                        />
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                      <span className="font-code text-xs text-muted">
                        {info.correct}/{info.total} · {info.accuracy}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${info.accuracy}%`,
                          background: CATEGORY_COLORS[cat] || "var(--accent)",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent attempts */}
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-5">
            <h3 className="font-display text-sm font-bold mb-3">최근 응시</h3>
            <ul className="space-y-2">
              {recentSlugs.map(([slug, info]) => {
                const meta = titleMap.get(slug);
                if (!meta) return null;
                const pct = Math.round((info.lastScore / info.lastTotal) * 100);
                const color =
                  pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--error)";
                return (
                  <li key={slug}>
                    <Link
                      href={`/wiki/${slug}`}
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-surface-hover transition-colors"
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: CATEGORY_COLORS[meta.category] || "var(--accent)" }}
                      />
                      <span className="text-sm text-text truncate flex-1">{meta.title}</span>
                      <span
                        className="font-code text-xs shrink-0"
                        style={{ color }}
                      >
                        {info.lastScore}/{info.lastTotal}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Recommended next */}
          {recommended.length > 0 && (
            <div className="md:col-span-2 rounded-[var(--radius-md)] border border-border bg-surface p-5">
              <h3 className="font-display text-sm font-bold mb-3">아직 안 푼 퀴즈</h3>
              <div className="flex flex-wrap gap-2">
                {recommended.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/wiki/${e.slug}`}
                    className="rounded-full border border-border bg-surface-hover px-3 py-1 text-xs text-text hover:border-accent hover:text-accent transition-colors"
                  >
                    {e.title}
                    <span className="ml-1 text-muted">· {e.questionCount}문항</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
