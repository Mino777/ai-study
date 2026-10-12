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
export const MASTERED_AFTER_USES = 2;

export interface EnglishState {
  profile: Profile | null;
  memory: TeacherMemory | null;
  calls: CallRecord[];
  expressions: ExpressionCard[];
  accessCode: string;
  settings: { handsFree: boolean; captions: boolean; speechRate: number; silenceMs: number };
}

export const DEFAULT_STATE: EnglishState = {
  profile: null,
  memory: null,
  calls: [],
  expressions: [],
  accessCode: "",
  settings: { handsFree: true, captions: true, speechRate: 1, silenceMs: 1800 },
};

function load(): EnglishState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<EnglishState>;
    return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } };
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

/** 리포트 반영: 통화 기록 + 메모리 교체 + 새 표현 추가 + 사용한 포커스 표현 카운트 */
export function applyReport(
  s: EnglishState,
  callId: string,
  report: CallReport,
  memory: TeacherMemory,
): EnglishState {
  const used = new Set(report.usedFocusExpressions.map((e) => e.toLowerCase()));
  const existing = new Set(s.expressions.map((e) => e.expression.toLowerCase()));
  const now = new Date().toISOString();

  const updated = s.expressions.map((e) => {
    if (!used.has(e.expression.toLowerCase())) return e;
    const usedCount = e.usedCount + 1;
    return { ...e, usedCount, mastered: e.mastered || usedCount >= MASTERED_AFTER_USES };
  });
  const added: ExpressionCard[] = report.expressions
    .filter((e) => !existing.has(e.expression.toLowerCase()))
    .map((e) => ({ ...e, id: crypto.randomUUID(), addedAt: now, usedCount: 0, mastered: false }));

  return {
    ...s,
    memory,
    calls: s.calls.map((c) => (c.id === callId ? { ...c, report } : c)),
    expressions: [...added, ...updated],
  };
}

/** 다음 통화에서 써보게 할 표현: 아직 못 익힌 것 중 사용 횟수 적고 최근 것 */
export function pickFocusExpressions(s: EnglishState, n = 3): string[] {
  return s.expressions
    .filter((e) => !e.mastered)
    .sort((a, b) => a.usedCount - b.usedCount || b.addedAt.localeCompare(a.addedAt))
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
