"use client";

// 로컬 저장소 — 프로필·선생님 메모리·통화 기록·표현 노트를 브라우저에 보관 (서버 DB 없음)

import { useCallback, useState, useSyncExternalStore } from "react";
import type {
  CallRecord,
  CallReport,
  ExpressionCard,
  Profile,
  TeacherMemory,
} from "@/lib/english/types";

const KEY = "english-call-v1";
const MAX_CALLS = 60;

// 간격 반복 (일). 위키 퀴즈 SRS(quiz-storage.ts)와 같은 사다리.
// 알아요/통화 중 실제 사용 → 한 단계 위로, 애매 → 유지, 몰라요 → 처음부터.
export const SRS_INTERVALS = [1, 3, 7, 14, 30, 60];
/** 이 단계에 오르면 '익힘' (다음 복습이 30일 뒤) */
export const MASTER_STEP = 4;
export type ReviewGrade = "again" | "hard" | "good";

const DAY = 86_400_000;

export function scheduleCard(card: ExpressionCard, grade: ReviewGrade, now = new Date()): ExpressionCard {
  const step =
    grade === "good" ? Math.min(card.step + 1, SRS_INTERVALS.length - 1) : grade === "hard" ? card.step : 0;
  return {
    ...card,
    step,
    mastered: step >= MASTER_STEP,
    dueAt: new Date(now.getTime() + SRS_INTERVALS[step] * DAY).toISOString(),
  };
}

export function dueExpressions(s: EnglishState, now = new Date()): ExpressionCard[] {
  return s.expressions.filter((e) => e.dueAt <= now.toISOString()).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

/** 서버 프롬프트용 학습자 현지 시각 */
export function clientNowString(now = new Date()): string {
  return now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function daysSinceLastCall(calls: CallRecord[], now = new Date()): number | null {
  if (!calls.length) return null;
  const last = new Date(calls[0].startedAt);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(now) - startOf(last)) / DAY);
}

/** 예전 버전 카드(step/dueAt 없음) 보정 */
function migrateCard(e: ExpressionCard): ExpressionCard {
  if (typeof e.step === "number" && e.dueAt) return e;
  const step = e.mastered ? MASTER_STEP : Math.min(e.usedCount ?? 0, MASTER_STEP - 1);
  return { ...e, step, dueAt: new Date(new Date(e.addedAt).getTime() + DAY).toISOString() };
}

export interface EnglishState {
  profile: Profile | null;
  memory: TeacherMemory | null;
  calls: CallRecord[];
  expressions: ExpressionCard[];
  accessCode: string;
  settings: {
    handsFree: boolean;
    captions: boolean;
    speechRate: number;
    silenceMs: number;
    /** ai: Gemini TTS(자연스러운 목소리), browser: 브라우저 기본 음성 */
    voice: "ai" | "browser";
  };
}

export const DEFAULT_STATE: EnglishState = {
  profile: null,
  memory: null,
  calls: [],
  expressions: [],
  accessCode: "",
  settings: { handsFree: true, captions: true, speechRate: 1, silenceMs: 1800, voice: "ai" },
};

function load(): EnglishState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<EnglishState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      expressions: (parsed.expressions ?? []).map(migrateCard),
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const noopSubscribe = () => () => {};

export function useEnglishStore() {
  // 서버·하이드레이션 렌더에서는 false → 클라이언트에서만 localStorage 상태를 그린다
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [state, setState] = useState<EnglishState>(() => (typeof window === "undefined" ? DEFAULT_STATE : load()));

  const update = useCallback((fn: (s: EnglishState) => EnglishState) => {
    setState((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // 용량 초과 시 오래된 통화의 대본부터 비운다
        const slim = { ...next, calls: next.calls.map((c, i) => (i < 10 ? c : { ...c, turns: [] })) };
        localStorage.setItem(KEY, JSON.stringify(slim));
        return slim;
      }
      return next;
    });
  }, []);

  return { state, ready, update };
}

export function saveCall(s: EnglishState, call: CallRecord): EnglishState {
  const calls = [call, ...s.calls.filter((c) => c.id !== call.id)].slice(0, MAX_CALLS);
  return { ...s, calls };
}

/** 리포트 반영: 통화 기록 + 메모리 교체 + 새 표현 추가 + 통화 중 쓴 포커스 표현은 복습 성공 처리 */
export function applyReport(
  s: EnglishState,
  callId: string,
  report: CallReport,
  memory: TeacherMemory,
): EnglishState {
  const used = new Set(report.usedFocusExpressions.map((e) => e.toLowerCase()));
  const existing = new Set(s.expressions.map((e) => e.expression.toLowerCase()));
  const now = new Date().toISOString();

  // 통화 중 실제로 쓴 표현 = 가장 강한 복습 성공
  const updated = s.expressions.map((e) =>
    used.has(e.expression.toLowerCase()) ? { ...scheduleCard(e, "good"), usedCount: e.usedCount + 1 } : e,
  );
  const added: ExpressionCard[] = report.expressions
    .filter((e) => !existing.has(e.expression.toLowerCase()))
    .map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      addedAt: now,
      usedCount: 0,
      mastered: false,
      step: 0,
      dueAt: new Date(Date.now() + DAY).toISOString(),
    }));

  return {
    ...s,
    memory,
    calls: s.calls.map((c) => (c.id === callId ? { ...c, report } : c)),
    expressions: [...added, ...updated],
  };
}

/** 다음 통화에서 써보게 할 표현: 아직 못 익힌 것 중 복습 기한이 가장 급한 것 */
export function pickFocusExpressions(s: EnglishState, n = 3): string[] {
  return s.expressions
    .filter((e) => !e.mastered)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || b.addedAt.localeCompare(a.addedAt))
    .slice(0, n)
    .map((e) => e.expression);
}

export function recentSummaries(s: EnglishState, n = 3): string[] {
  return s.calls
    .filter((c) => c.report?.summary)
    .slice(0, n)
    .reverse()
    .map((c) => `${c.startedAt.slice(0, 10)}: ${c.report!.summary}`);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function callStreak(calls: CallRecord[]): number {
  const days = new Set(calls.map((c) => dayKey(new Date(c.startedAt))));
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
