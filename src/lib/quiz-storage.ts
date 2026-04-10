// Quiz state persistence (client-side, localStorage)
// Stores per-entry quiz attempts and a global attempt log used by dashboard.

const STATE_PREFIX = "quiz:state:";
const LOG_KEY = "quiz:attempts";
const REVIEW_KEY = "quiz:reviews";

// Spaced repetition intervals (days). Index = current step.
// Step advances on score >= 80%, holds on >= 50%, resets to 0 below.
const SRS_INTERVALS = [1, 3, 7, 14, 30, 60];

export interface QuizState {
  selections: Record<number, number | null>;
  submitted: boolean;
  lastAttemptAt: string;
  score: number;
  total: number;
}

export interface QuizAttempt {
  slug: string;
  category: string;
  score: number;
  total: number;
  at: string; // ISO timestamp
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadQuizState(slug: string): QuizState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STATE_PREFIX + slug);
    if (!raw) return null;
    return JSON.parse(raw) as QuizState;
  } catch {
    return null;
  }
}

export function saveQuizState(slug: string, state: QuizState | null): void {
  if (!isBrowser()) return;
  try {
    if (state === null) {
      localStorage.removeItem(STATE_PREFIX + slug);
    } else {
      localStorage.setItem(STATE_PREFIX + slug, JSON.stringify(state));
    }
  } catch {
    // ignore quota errors
  }
}

export function loadAttempts(): QuizAttempt[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QuizAttempt[];
  } catch {
    return [];
  }
}

export function recordQuizAttempt(attempt: QuizAttempt): void {
  if (!isBrowser()) return;
  try {
    const log = loadAttempts();
    log.push(attempt);
    // Cap log size to keep localStorage usage bounded
    const trimmed = log.slice(-500);
    localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
  // Update SRS schedule based on this attempt
  updateReviewSchedule(attempt);
}

// ── Spaced Repetition ───────────────────────────────────────────

export interface ReviewItem {
  slug: string;
  category: string;
  step: number; // index into SRS_INTERVALS
  lastReviewedAt: string; // ISO
  nextReviewAt: string; // ISO
  lastScore: number;
  lastTotal: number;
}

export type ReviewMap = Record<string, ReviewItem>;

export function loadReviews(): ReviewMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as ReviewMap;
  } catch {
    return {};
  }
}

function saveReviews(map: ReviewMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function updateReviewSchedule(attempt: QuizAttempt): void {
  if (!isBrowser()) return;
  const reviews = loadReviews();
  const prev = reviews[attempt.slug];
  const accuracy = attempt.total > 0 ? attempt.score / attempt.total : 0;

  let step = prev?.step ?? 0;
  if (accuracy >= 0.8) {
    step = Math.min(step + 1, SRS_INTERVALS.length - 1);
  } else if (accuracy >= 0.5) {
    // hold step (review again at same interval)
  } else {
    step = 0;
  }

  const intervalDays = SRS_INTERVALS[step];
  reviews[attempt.slug] = {
    slug: attempt.slug,
    category: attempt.category,
    step,
    lastReviewedAt: attempt.at,
    nextReviewAt: addDays(attempt.at, intervalDays),
    lastScore: attempt.score,
    lastTotal: attempt.total,
  };
  saveReviews(reviews);
}

export interface DueReview extends ReviewItem {
  daysOverdue: number; // 0 = due today, positive = overdue
}

export function getDueReviews(now: Date = new Date()): DueReview[] {
  const reviews = loadReviews();
  const out: DueReview[] = [];
  for (const item of Object.values(reviews)) {
    const next = new Date(item.nextReviewAt);
    const diffMs = now.getTime() - next.getTime();
    if (diffMs >= 0) {
      out.push({
        ...item,
        daysOverdue: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
      });
    }
  }
  // Most overdue first
  out.sort((a, b) => b.daysOverdue - a.daysOverdue);
  return out;
}

export function getIntervalForStep(step: number): number {
  return SRS_INTERVALS[Math.min(step, SRS_INTERVALS.length - 1)];
}

export interface QuizStats {
  totalAttempts: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number; // 0-100
  byCategory: Record<
    string,
    { attempts: number; correct: number; total: number; accuracy: number }
  >;
  bySlug: Record<
    string,
    { lastScore: number; lastTotal: number; lastAt: string; attempts: number }
  >;
}

export function computeQuizStats(attempts: QuizAttempt[]): QuizStats {
  const stats: QuizStats = {
    totalAttempts: attempts.length,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
    byCategory: {},
    bySlug: {},
  };

  for (const a of attempts) {
    stats.totalQuestions += a.total;
    stats.totalCorrect += a.score;

    const cat = stats.byCategory[a.category] ?? {
      attempts: 0,
      correct: 0,
      total: 0,
      accuracy: 0,
    };
    cat.attempts += 1;
    cat.correct += a.score;
    cat.total += a.total;
    cat.accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
    stats.byCategory[a.category] = cat;

    const slug = stats.bySlug[a.slug];
    if (!slug || slug.lastAt < a.at) {
      stats.bySlug[a.slug] = {
        lastScore: a.score,
        lastTotal: a.total,
        lastAt: a.at,
        attempts: (slug?.attempts ?? 0) + 1,
      };
    } else {
      slug.attempts += 1;
    }
  }

  stats.accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  return stats;
}
