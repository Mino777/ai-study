// AI 전화영어(/english) — 클라이언트·서버 공용 타입

export const LEVELS = [
  "beginner",
  "elementary",
  "intermediate",
  "upper-intermediate",
  "advanced",
] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "입문 (A1)",
  elementary: "초급 (A2)",
  intermediate: "중급 (B1)",
  "upper-intermediate": "중상급 (B2)",
  advanced: "고급 (C1+)",
};

export interface Profile {
  name: string;
  level: Level;
  goal: string;
  interests: string;
  teacherId: string;
  callMinutes: number;
  createdAt: string;
}

export interface Correction {
  original: string;
  better: string;
  /** 한국어 설명 */
  explanation: string;
}

export interface Turn {
  role: "teacher" | "learner";
  text: string;
  at: number;
  corrections?: Correction[];
}

/** 선생님이 학습자에 대해 기억하는 것 — 매 통화 후 LLM이 병합·갱신 */
export interface TeacherMemory {
  /** 학습자에 대한 사실 (직업, 가족, 최근 일 등) — 영어 */
  facts: string[];
  interests: string[];
  goals: string[];
  /** 반복되는 실수 패턴 — 한국어 */
  recurringMistakes: string[];
  /** 다음 통화에서 이어갈 화제 — 영어 */
  nextTopics: string[];
  /** 다음 통화의 선생님에게 남기는 메모 — 영어 */
  teacherNote: string;
  levelEstimate?: Level;
  updatedAt: string;
}

export interface ExpressionCard {
  id: string;
  expression: string;
  meaning: string;
  example: string;
  addedAt: string;
  /** 통화 중 실제로 사용한 횟수 */
  usedCount: number;
  mastered: boolean;
  /** 간격 반복 단계 (SRS_INTERVALS 인덱스) */
  step: number;
  /** 다음 복습 시각 (ISO) */
  dueAt: string;
}

export interface CallReport {
  summary: string;
  strengths: string[];
  corrections: Correction[];
  expressions: { expression: string; meaning: string; example: string }[];
  /** 이번 통화에서 학습자가 실제로 사용한 포커스 표현 */
  usedFocusExpressions: string[];
  levelEstimate: Level;
  /** 0~100 */
  fluency: number;
  nextTimeTip: string;
}

export interface CallRecord {
  id: string;
  startedAt: string;
  durationSec: number;
  teacherId: string;
  topicId: string;
  turns: Turn[];
  report?: CallReport;
}

export type CallPhase = "opening" | "turn" | "closing";

export interface ChatRequest {
  profile: Profile;
  memory: TeacherMemory | null;
  topicId: string;
  turns: Turn[];
  phase: CallPhase;
  elapsedSec: number;
  focusExpressions: string[];
  recentSummaries: string[];
  /** 학습자 현지 시각 (예: "Monday, October 12, 2026, 3:20 PM") */
  clientNow: string;
  daysSinceLastCall: number | null;
}

export interface ChatResponse {
  reply: string;
  corrections: Correction[];
  /** 학습자가 막혔을 때 보여줄 답변 예시 (영어) */
  suggestion: string;
}

export interface SummarizeRequest {
  profile: Profile;
  memory: TeacherMemory | null;
  topicId: string;
  turns: Turn[];
  focusExpressions: string[];
  clientNow: string;
}

export interface SummarizeResponse {
  report: CallReport;
  memory: TeacherMemory;
}

export function emptyMemory(): TeacherMemory {
  return {
    facts: [],
    interests: [],
    goals: [],
    recurringMistakes: [],
    nextTopics: [],
    teacherNote: "",
    updatedAt: new Date().toISOString(),
  };
}
