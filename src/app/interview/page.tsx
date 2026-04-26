"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { IOS_QUESTIONS, FDE_QUESTIONS, CULTURE_QUESTIONS, PHASE_PROBLEMS, COMPANY_STRATEGIES, HIRING_INSIGHTS, PROCESS_STAGES, ASSIGNMENT_CHECKLIST, ALGO_GUIDES, BIG_O_GUIDE, BIG_O_COMPARISON, SYSTEM_DESIGN_CASES, FDE_DESIGN_CASES, SD_FRAMEWORK_STEPS, SD_CLARIFYING_QUESTIONS, SD_API_COMPARISON, ASSIGNMENT_DAILY_TIPS, FDE_ASSIGNMENT_DAILY_TIPS, CULTURE_DAILY_TIPS, TECH_DAILY_TOPICS, FDE_TECH_DAILY_TOPICS, CS_TOPICS, CS_DAILY_TOPICS, FDE_CS_DAILY_TOPICS, FDE_ALGO_TEMPLATES, CAREER_PAGES, TIMER_PRESETS, QUIZ_BANK, INTERVIEW_DAY_PLAYBOOK, SALARY_TIPS, RED_FLAGS, ONBOARDING_PLAYBOOK, MOCK_FEEDBACK_CRITERIA, type InterviewQuestion } from "./constants";

/* ═══════════════════════════════════════════════════════════ */
/*  TYPES                                                      */
/* ═══════════════════════════════════════════════════════════ */

interface DailyTask {
  id: string;
  track: "shared" | "ios" | "fde";
  label: string;
  category: "algo" | "ios-tech" | "fde-tech" | "system-design" | "portfolio" | "behavioral" | "review";
}

interface WeekMilestone {
  week: number;
  dayRange: [number, number];
  title: string;
  description: string;
  color: string;
}

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  dayRange: [number, number];
  color: string;
  icon: string;
  milestones: WeekMilestone[];
}

/* ═══════════════════════════════════════════════════════════ */
/*  CONSTANTS                                                  */
/* ═══════════════════════════════════════════════════════════ */

const START_DATE = new Date("2026-04-27");
const END_DATE = new Date("2026-08-05");
const TOTAL_DAYS = 100;

const STORAGE_KEY = "interview-prep-progress";

type TrackKey = "ios" | "fde";

const TRACKS = [
  { key: "ios" as const, label: "iOS Engineer", emoji: "" },
  { key: "fde" as const, label: "FDE", emoji: "" },
] as const;

/* ═══════════════════════════════════════════════════════════ */
/*  TARGET COMPANIES                                           */
/* ═══════════════════════════════════════════════════════════ */

const TARGET_COMPANIES = {
  ios: [
    { name: "토스", note: "서류→과제→직무면접→컬쳐핏", color: "#3b82f6" },
    { name: "당근", note: "면접→5일 과제→최종", color: "#ff6f00" },
    { name: "카카오", note: "코딩테스트(프로그래머스)→기술면접", color: "#fee500" },
    { name: "네이버", note: "코테→기술면접→인성→컬쳐핏", color: "#03c75a" },
    { name: "쿠팡", note: "코테→시스템디자인→기술면접 3R", color: "#e4002b" },
    { name: "라인", note: "코테→기술면접→인성", color: "#06c755" },
  ],
  fde: [
    { name: "채널톡", note: "FDE — 고객 현장 솔루션 배포", color: "#3b82f6" },
    { name: "마키나락스", note: "제조/국방 AI FDE 확대 채용", color: "#10b981" },
    { name: "크래프톤", note: "AI FDE 집중 채용 중", color: "#f59e0b" },
    { name: "팔란티어 코리아", note: "Forward Deployed 팀", color: "#1a1a2e" },
    { name: "토스", note: "기술 컨설턴트 유사 역할", color: "#3b82f6" },
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  100-DAY PHASES & MILESTONES                                */
/* ═══════════════════════════════════════════════════════════ */

const PHASES: Phase[] = [
  {
    id: 1,
    title: "기초 다지기",
    subtitle: "알고리즘 기초 + Swift/iOS 복습 + FDE 기초",
    dayRange: [1, 30],
    color: "#3b82f6",
    icon: "01",
    milestones: [
      { week: 1, dayRange: [1, 7], title: "자료구조 기초", description: "배열, 연결리스트, 스택, 큐, 해시 — 백준 Bronze/Silver 매일 2-3문제", color: "#3b82f6" },
      { week: 2, dayRange: [8, 14], title: "정렬 & 탐색", description: "버블/선택/삽입/퀵/병합 정렬 + 이분탐색 — 프로그래머스 Lv.1-2", color: "#3b82f6" },
      { week: 3, dayRange: [15, 21], title: "BFS/DFS & 그래프 기초", description: "그래프 순회 + 최단경로 — 백준 Silver/Gold 진입", color: "#60a5fa" },
      { week: 4, dayRange: [22, 30], title: "Swift 핵심 복습", description: "메모리 관리, 프로토콜, 클로저, 제네릭 — iOS 면접 질문 50개 정리", color: "#60a5fa" },
    ],
  },
  {
    id: 2,
    title: "심화 학습",
    subtitle: "알고리즘 심화 + iOS/FDE 기술 심화",
    dayRange: [31, 60],
    color: "#8b5cf6",
    icon: "02",
    milestones: [
      { week: 5, dayRange: [31, 37], title: "DP & 탐욕법", description: "동적계획법 패턴 정리 + 탐욕법 증명 — 프로그래머스 Lv.2-3", color: "#8b5cf6" },
      { week: 6, dayRange: [38, 44], title: "고급 알고리즘", description: "투포인터, 슬라이딩 윈도우, 유니온파인드 — 카카오/네이버 기출", color: "#8b5cf6" },
      { week: 7, dayRange: [45, 51], title: "iOS 아키텍처 심화", description: "MVVM/Clean/RIBs 비교 + Combine/Concurrency 실습 프로젝트", color: "#a78bfa" },
      { week: 8, dayRange: [52, 60], title: "iOS 기출 집중 + FDE 케이스", description: "카카오/토스 기출 20문제 + FDE 비즈니스 케이스 준비", color: "#a78bfa" },
    ],
  },
  {
    id: 3,
    title: "실전 대비",
    subtitle: "System Design + 포트폴리오 + 모의면접",
    dayRange: [61, 85],
    color: "#10b981",
    icon: "03",
    milestones: [
      { week: 9, dayRange: [61, 67], title: "모바일 시스템 디자인", description: "소셜 피드, 메시징, 스트리밍 앱 설계 — 아키텍처 다이어그램 3개", color: "#10b981" },
      { week: 10, dayRange: [68, 74], title: "포트폴리오 완성", description: "GitHub README 정비 + 기술블로그 3-5편 + 프로젝트 정리", color: "#10b981" },
      { week: 11, dayRange: [75, 81], title: "모의 면접 집중", description: "기술면접 모의 3회 (녹음→피드백) + iOS 심화 질문 100개 완성", color: "#34d399" },
      { week: 12, dayRange: [82, 85], title: "약점 보강", description: "틀린 문제 재풀이 + 자주 막히는 주제 집중 공략", color: "#34d399" },
    ],
  },
  {
    id: 4,
    title: "최종 점검",
    subtitle: "기업별 맞춤 + 실전 시뮬레이션",
    dayRange: [86, 100],
    color: "#f59e0b",
    icon: "04",
    milestones: [
      { week: 13, dayRange: [86, 92], title: "기업별 맞춤 준비", description: "지원 기업 3-5개 기출 분석 + 기업 문화 리서치 + 자소서 작성", color: "#f59e0b" },
      { week: 14, dayRange: [93, 100], title: "D-Day 카운트다운", description: "모의고사 2-3회 + 최종 모의면접 + 컨디션 관리", color: "#fbbf24" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  DAILY TRAINING ITEMS                                       */
/* ═══════════════════════════════════════════════════════════ */

function getDailyTasks(day: number): DailyTask[] {
  const tasks: DailyTask[] = [];

  // Phase 1: Day 1-30
  if (day <= 30) {
    tasks.push({ id: `d${day}-algo`, track: "shared", label: day <= 14 ? "백준 2-3문제 (자료구조/정렬)" : "프로그래머스 Lv.1-2 2문제", category: "algo" });
    if (day <= 14) {
      tasks.push({ id: `d${day}-ds`, track: "shared", label: "자료구조 개념 정리 (노트 1장)", category: "algo" });
    }
    if (day >= 15) {
      tasks.push({ id: `d${day}-graph`, track: "shared", label: "BFS/DFS 문제 1개 + 풀이 정리", category: "algo" });
    }
    if (day >= 22) {
      tasks.push({ id: `d${day}-swift`, track: "ios", label: "Swift 핵심 개념 복습 + 면접 질문 5개 답변 작성", category: "ios-tech" });
      tasks.push({ id: `d${day}-fde-basic`, track: "fde", label: "Python/SQL 기초 문제 풀이 + 데이터 모델링 개념", category: "fde-tech" });
    }
  }

  // Phase 2: Day 31-60
  if (day >= 31 && day <= 60) {
    tasks.push({ id: `d${day}-algo`, track: "shared", label: day <= 44 ? "프로그래머스 Lv.2-3 (DP/탐욕) 1-2문제" : "카카오/네이버 기출 문제 1개", category: "algo" });
    if (day >= 45 && day <= 51) {
      tasks.push({ id: `d${day}-arch`, track: "ios", label: "iOS 아키텍처 패턴 비교 실습 (MVVM/Clean/RIBs)", category: "ios-tech" });
      tasks.push({ id: `d${day}-fde-case`, track: "fde", label: "FDE 비즈니스 케이스 분석 1건 (문제→해결→임팩트)", category: "fde-tech" });
    }
    if (day >= 52) {
      tasks.push({ id: `d${day}-combine`, track: "ios", label: "Combine/Swift Concurrency 실습 코드 작성", category: "ios-tech" });
      tasks.push({ id: `d${day}-fde-proto`, track: "fde", label: "고객 시나리오 기반 프로토타입 설계 연습", category: "fde-tech" });
    }
    if (day % 7 === 0) {
      tasks.push({ id: `d${day}-review`, track: "shared", label: "주간 복습: 이번 주 풀었던 문제 재풀이 + 오답 분석", category: "review" });
    }
  }

  // Phase 3: Day 61-85
  if (day >= 61 && day <= 85) {
    if (day <= 67) {
      tasks.push({ id: `d${day}-sd`, track: "shared", label: "모바일 시스템 디자인 케이스 스터디 (다이어그램 포함)", category: "system-design" });
    }
    if (day >= 68 && day <= 74) {
      tasks.push({ id: `d${day}-port`, track: "shared", label: "포트폴리오/기술블로그 작성 (1일 1편 또는 README 정비)", category: "portfolio" });
    }
    if (day >= 75) {
      tasks.push({ id: `d${day}-mock`, track: "shared", label: "모의 면접 질문 답변 연습 (녹음 + 셀프 피드백)", category: "behavioral" });
      tasks.push({ id: `d${day}-ios-deep`, track: "ios", label: "iOS 심화 질문 10개 답변 작성 + 코드 예제", category: "ios-tech" });
      tasks.push({ id: `d${day}-fde-pitch`, track: "fde", label: "FDE 프로젝트 피치 연습 (3분 프레젠테이션)", category: "fde-tech" });
    }
    tasks.push({ id: `d${day}-algo-review`, track: "shared", label: "알고리즘 유지: 프로그래머스 1문제 (감 유지)", category: "algo" });
  }

  // Phase 4: Day 86-100
  if (day >= 86) {
    tasks.push({ id: `d${day}-company`, track: "shared", label: "지원 기업 기출 분석 + 기업 문화 리서치", category: "behavioral" });
    if (day >= 93) {
      tasks.push({ id: `d${day}-final`, track: "shared", label: "풀 모의고사 (3시간 타이머, 실전처럼)", category: "algo" });
      tasks.push({ id: `d${day}-mental`, track: "shared", label: "컨디션 관리: 수면/운동/식단 체크", category: "review" });
    } else {
      tasks.push({ id: `d${day}-resume`, track: "shared", label: "자소서/이력서 최종 점검 + 프로젝트 설명 1분 요약", category: "portfolio" });
    }
    tasks.push({ id: `d${day}-ios-final`, track: "ios", label: "iOS 면접 질문 랜덤 10개 답변 (타이머 30분)", category: "ios-tech" });
    tasks.push({ id: `d${day}-fde-final`, track: "fde", label: "FDE 케이스 스터디 발표 연습 (피드백 반영)", category: "fde-tech" });
  }

  return tasks;
}

/* ═══════════════════════════════════════════════════════════ */
/*  CATEGORY LABELS & COLORS                                   */
/* ═══════════════════════════════════════════════════════════ */

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  algo: { label: "Algorithm", color: "#3b82f6" },
  "ios-tech": { label: "iOS", color: "#06b6d4" },
  "fde-tech": { label: "FDE", color: "#8b5cf6" },
  "system-design": { label: "System Design", color: "#10b981" },
  portfolio: { label: "Portfolio", color: "#f59e0b" },
  behavioral: { label: "Behavioral", color: "#ef4444" },
  review: { label: "Review", color: "#6b7280" },
};

/* ═══════════════════════════════════════════════════════════ */
/*  ALGORITHM PATTERNS (Grokking 14 Patterns)                  */
/* ═══════════════════════════════════════════════════════════ */

interface AlgoPattern {
  id: string;
  name: string;
  nameKo: string;
  phase: number; // 1-4: which phase to focus on
  problems: number; // recommended problems to master
}

const ALGO_PATTERNS: AlgoPattern[] = [
  { id: "sliding-window", name: "Sliding Window", nameKo: "슬라이딩 윈도우", phase: 2, problems: 8 },
  { id: "two-pointers", name: "Two Pointers", nameKo: "투 포인터", phase: 2, problems: 8 },
  { id: "fast-slow", name: "Fast & Slow Pointers", nameKo: "빠른/느린 포인터", phase: 1, problems: 5 },
  { id: "merge-intervals", name: "Merge Intervals", nameKo: "구간 병합", phase: 2, problems: 5 },
  { id: "cyclic-sort", name: "Cyclic Sort", nameKo: "순환 정렬", phase: 1, problems: 4 },
  { id: "linked-list", name: "In-place Linked List", nameKo: "연결리스트 조작", phase: 1, problems: 5 },
  { id: "bfs", name: "BFS", nameKo: "너비 우선 탐색", phase: 1, problems: 8 },
  { id: "dfs", name: "DFS", nameKo: "깊이 우선 탐색", phase: 1, problems: 8 },
  { id: "two-heaps", name: "Two Heaps", nameKo: "투 힙", phase: 2, problems: 4 },
  { id: "binary-search", name: "Binary Search", nameKo: "이분 탐색", phase: 1, problems: 8 },
  { id: "top-k", name: "Top K Elements", nameKo: "상위 K개", phase: 2, problems: 5 },
  { id: "dp", name: "Dynamic Programming", nameKo: "동적 계획법", phase: 2, problems: 12 },
  { id: "backtracking", name: "Backtracking", nameKo: "백트래킹", phase: 2, problems: 6 },
  { id: "graph", name: "Graph (Topological)", nameKo: "위상 정렬/그래프", phase: 2, problems: 6 },
];

const PATTERN_STORAGE_KEY = "interview-pattern-progress";

/* ═══════════════════════════════════════════════════════════ */
/*  TIMEBOX RULES (Research-backed)                            */
/* ═══════════════════════════════════════════════════════════ */

const TIMEBOX_RULES = [
  { level: "Easy", time: "15분", give_up: "20분 초과 시 풀이 확인", color: "#10b981" },
  { level: "Medium", time: "30-45분", give_up: "50분 초과 시 풀이 확인 → 다음 날 재풀이", color: "#f59e0b" },
  { level: "Hard", time: "60-70분", give_up: "75분 초과 시 풀이 확인 → 3일 후 재풀이", color: "#ef4444" },
];

/* ═══════════════════════════════════════════════════════════ */
/*  LEVEL-UP CRITERIA (ZPD-based)                              */
/* ═══════════════════════════════════════════════════════════ */

const LEVEL_CRITERIA = [
  { from: "Lv.1", to: "Lv.2", criteria: "정답률 85% + 패턴 2개 마스터", dayTarget: "Day 15" },
  { from: "Lv.2", to: "Lv.3", criteria: "정답률 80% + 30분 내 풀이 + 패턴 6개", dayTarget: "Day 45" },
  { from: "Lv.3", to: "기출", criteria: "정답률 70% + 45분 내 풀이 + 패턴 10개", dayTarget: "Day 65" },
];

/* ═══════════════════════════════════════════════════════════ */
/*  SCIENCE-BACKED MENTOR TIPS (by Phase)                      */
/* ═══════════════════════════════════════════════════════════ */

const PHASE_MENTOR_TIPS: Record<number, { principle: string; tip: string; source: string }[]> = {
  1: [
    { principle: "Tiny Habits", tip: "커피 한 잔 마신 후 → 문제 1개. 이것만 지키면 습관이 된다.", source: "BJ Fogg, Stanford" },
    { principle: "분산 학습", tip: "한 번에 3시간 몰아치기보다 **아침 1h + 저녁 2h** 분산이 기억 정착률 2배.", source: "Ebbinghaus" },
    { principle: "Active Recall", tip: "노트를 다시 읽지 마라. **빈 종이에 직접 써봐라**. 인출 연습이 재독보다 50% 효과적.", source: "Karpicke, 2008" },
  ],
  2: [
    { principle: "의도적 연습", tip: "이미 풀 수 있는 문제를 반복하지 마라. **약간 어려운 수준**에서 고통스럽게 풀어야 실력이 는다.", source: "Anders Ericsson" },
    { principle: "70/20/10 법칙", tip: "매일 시간 배분: **새 문제 70%** + 틀린 문제 복습 20% + 쉬운 워밍업 10%.", source: "Deliberate Practice" },
    { principle: "Interleaving", tip: "같은 유형 10개 연속 대신 **다른 유형 섞어서** 풀어라. 단기 점수는 떨어져도 장기 기억은 올라간다.", source: "Rohrer & Taylor, 2007" },
  ],
  3: [
    { principle: "Think-Aloud", tip: "모의 면접 시 **침묵 10초 이상 금지**. 막히면 '지금 X 접근을 시도하고 있는데...'라고 말해라.", source: "Ericsson Protocol" },
    { principle: "Testing Effect", tip: "면접 질문을 다시 읽지 말고 **자기 자신에게 질문 후 답변**해라. 시험이 학습이다.", source: "Roediger, 2006" },
    { principle: "Elaborative Interrogation", tip: "답변 후 반드시 '**왜?**'를 한 번 더 물어라. 깊이가 면접관을 설득한다.", source: "Dunlosky, 2013" },
  ],
  4: [
    { principle: "Sleep & Memory", tip: "면접 전날은 **7시간 이상 수면 필수**. 수면 중 기억이 장기 저장소로 이동한다.", source: "Walker, 2017" },
    { principle: "Desirable Difficulty", tip: "최종 모의고사는 실제보다 **20% 더 어렵게** 설정해라. 실전이 쉽게 느껴진다.", source: "Bjork, 1994" },
    { principle: "Pre-performance Routine", tip: "면접 당일 아침: 쉬운 문제 1개 → 스트레칭 → 프로젝트 핵심 3줄 복습. **루틴이 긴장을 이긴다**.", source: "Sport Psychology" },
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  WEEKLY FOCUS TOPICS                                        */
/* ═══════════════════════════════════════════════════════════ */

const IOS_WEEKLY_TOPICS: Record<number, string[]> = {
  1: ["Array vs ContiguousArray", "LinkedList 직접 구현", "Stack/Queue 프로토콜"],
  2: ["시간복잡도 O(n log n) 증명", "Binary Search 변형 3가지"],
  3: ["BFS 최단경로", "DFS 백트래킹", "인접리스트 vs 인접행렬"],
  4: ["ARC & Retain Cycle", "[weak self] vs [unowned self]", "Closure Capture List"],
  5: ["DP: Top-down vs Bottom-up", "Memoization 패턴"],
  6: ["투포인터 패턴", "슬라이딩 윈도우", "카카오 2023 기출"],
  7: ["MVVM vs Clean Architecture", "RIBs Router/Interactor/Builder", "Combine Publisher Chain"],
  8: ["Swift Concurrency (async/await)", "Actor isolation", "Sendable 프로토콜"],
  9: ["소셜 피드 시스템 설계", "이미지 캐싱 전략", "오프라인 대응"],
  10: ["GitHub 프로젝트 README", "기술블로그 SEO", "트러블슈팅 문서화"],
  11: ["메모리 관리 심화 Q&A", "동시성 심화 Q&A", "아키텍처 트레이드오프"],
  12: ["약점 주제 집중 공략", "시간 단축 전략"],
  13: ["기업별 기출 패턴", "자소서 STAR 기법"],
  14: ["최종 모의고사", "면접 에티켓", "질문 리스트 준비"],
};

const FDE_WEEKLY_TOPICS: Record<number, string[]> = {
  1: ["Python 자료구조 실습", "SQL JOIN/서브쿼리", "데이터 모델링 기초"],
  2: ["ETL 파이프라인 이해", "데이터 정제 패턴"],
  3: ["API 설계 원칙", "REST vs GraphQL"],
  4: ["Palantir Ontology 개념", "고객 요구사항 수집 프레임워크"],
  5: ["DP/탐욕법 + 실제 데이터 적용", "비용 최적화 문제"],
  6: ["대시보드 설계 (React/TS)", "데이터 시각화 원칙"],
  7: ["고객 미팅 시뮬레이션", "문제 정의→솔루션 매핑"],
  8: ["AI/LLM 통합 아키텍처", "Harness 패턴 FDE 적용"],
  9: ["E2E 솔루션 설계 (문제→배포)", "ROI 산정 방법"],
  10: ["포트폴리오: 비즈니스 임팩트 중심", "케이스 스터디 3건"],
  11: ["FDE 피치 연습", "이해관계자 커뮤니케이션"],
  12: ["약점 보강 + 영어 인터뷰 준비"],
  13: ["기업별 FDE 역할 차이 분석", "채널톡/마키나락스 리서치"],
  14: ["최종 케이스 스터디 발표", "Q&A 대비"],
};

/* ═══════════════════════════════════════════════════════════ */
/*  HELPERS                                                    */
/* ═══════════════════════════════════════════════════════════ */

function B({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") ? (
          <span key={i} className="text-text font-semibold">{p.slice(2, -2)}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function getToday(): number {
  const now = new Date();
  const diff = Math.floor((now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(diff, TOTAL_DAYS));
}

function getDaysRemaining(): number {
  const now = new Date();
  const diff = Math.ceil((END_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(day: number): string {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + day - 1);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ═══════════════════════════════════════════════════════════ */
/*  PAGE                                                       */
/* ═══════════════════════════════════════════════════════════ */

export default function InterviewPage() {
  const [track, setTrack] = useState<TrackKey>("ios");
  const [activeTab, setActiveTab] = useState<"overview" | "coding" | "assignment" | "cs" | "tech" | "quiz" | "culture">("overview");
  const [quizIndex, setQuizIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<number>(getToday());
  const [mounted, setMounted] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [solvedProblems, setSolvedProblems] = useState<Record<string, boolean>>({});
  const [hardCards, setHardCards] = useState<Record<string, boolean>>({});
  const [companyDdays, setCompanyDdays] = useState<Record<string, string>>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLabel, setTimerLabel] = useState("");
  const [quizHistory, setQuizHistory] = useState<Record<string, { answer: number; correct: boolean; date: string }>>({});
  const [quizSelection, setQuizSelection] = useState<Record<string, number | null>>({});

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCheckedTasks(JSON.parse(saved));
      const cards = localStorage.getItem("interview-flashcards");
      if (cards) setRevealedCards(JSON.parse(cards));
      const probs = localStorage.getItem("interview-problems");
      if (probs) setSolvedProblems(JSON.parse(probs));
      const hard = localStorage.getItem("interview-hard-cards");
      if (hard) setHardCards(JSON.parse(hard));
      const ddays = localStorage.getItem("interview-company-ddays");
      if (ddays) setCompanyDdays(JSON.parse(ddays));
      const quiz = localStorage.getItem("interview-quiz-history");
      if (quiz) setQuizHistory(JSON.parse(quiz));
    } catch { /* noop */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedTasks));
      localStorage.setItem("interview-flashcards", JSON.stringify(revealedCards));
      localStorage.setItem("interview-problems", JSON.stringify(solvedProblems));
      localStorage.setItem("interview-hard-cards", JSON.stringify(hardCards));
      localStorage.setItem("interview-company-ddays", JSON.stringify(companyDdays));
      localStorage.setItem("interview-quiz-history", JSON.stringify(quizHistory));
    } catch { /* noop */ }
  }, [checkedTasks, revealedCards, solvedProblems, hardCards, companyDdays, quizHistory, mounted]);

  // Clamp quizIndex when track changes (shuffledQuiz length may differ)
  useEffect(() => {
    if (quizIndex >= shuffledQuiz.length && shuffledQuiz.length > 0) {
      setQuizIndex(0);
    }
  }, [quizIndex, shuffledQuiz.length]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) { setTimerActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = (seconds: number, label: string) => {
    setTimerSeconds(seconds);
    setTimerLabel(label);
    setTimerActive(true);
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const today = getToday();
  const daysRemaining = getDaysRemaining();
  const currentPhase = PHASES.find((p) => selectedDay >= p.dayRange[0] && selectedDay <= p.dayRange[1]) ?? PHASES[0];

  // Daily tasks filtered by track
  const dailyTasks = useMemo(() => {
    const all = getDailyTasks(selectedDay);
    return all.filter((t) => t.track === "shared" || t.track === track);
  }, [selectedDay, track]);

  // Pattern mastery progress
  const [patternProgress, setPatternProgress] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PATTERN_STORAGE_KEY);
      if (saved) setPatternProgress(JSON.parse(saved));
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(PATTERN_STORAGE_KEY, JSON.stringify(patternProgress)); } catch { /* noop */ }
  }, [patternProgress, mounted]);

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    for (let d = today; d >= 1; d--) {
      const dayTasks = getDailyTasks(d).filter((t) => t.track === "shared" || t.track === track);
      const allDone = dayTasks.length > 0 && dayTasks.every((t) => checkedTasks[t.id]);
      if (d === today && !allDone) continue; // today incomplete is ok
      if (allDone) count++;
      else break;
    }
    return count;
  }, [checkedTasks, today, track]);

  // Progress stats
  const totalChecked = useMemo(() => Object.values(checkedTasks).filter(Boolean).length, [checkedTasks]);
  const todayTasks = useMemo(() => getDailyTasks(today).filter((t) => t.track === "shared" || t.track === track), [today, track]);
  const todayChecked = useMemo(() => todayTasks.filter((t) => checkedTasks[t.id]).length, [todayTasks, checkedTasks]);

  const weeklyTopics = track === "ios" ? IOS_WEEKLY_TOPICS : FDE_WEEKLY_TOPICS;
  const currentWeek = Math.ceil(selectedDay / 7);
  const isDeloadWeek = currentWeek % 4 === 0;
  const isRestDay = selectedDay % 7 === 0;

  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Flash card data for current track & phase (tech + culture)
  const flashCards = useMemo(() => {
    const techQs = track === "ios" ? IOS_QUESTIONS : FDE_QUESTIONS;
    const allQs = [...techQs, ...CULTURE_QUESTIONS];
    return allQs.filter((q) => q.phase <= currentPhase.id);
  }, [track, currentPhase.id]);

  const todayCards = useMemo(() => {
    const techQs = track === "ios" ? IOS_QUESTIONS : FDE_QUESTIONS;
    const allQs = [...techQs, ...CULTURE_QUESTIONS];
    const phaseQs = allQs.filter((q) => q.phase === currentPhase.id);
    if (phaseQs.length === 0) return [];
    // 5 unique cards per day, cycling through phase questions
    const result: typeof phaseQs = [];
    for (let i = 0; i < 5 && i < phaseQs.length; i++) {
      const idx = ((selectedDay - 1) * 5 + i) % phaseQs.length;
      result.push(phaseQs[idx]);
    }
    return result;
  }, [track, currentPhase.id, selectedDay]);

  const todayProblems = useMemo(() => {
    const problems = PHASE_PROBLEMS[currentPhase.id] ?? [];
    const startIdx = ((selectedDay - 1) * 2) % Math.max(1, problems.length);
    return problems.slice(startIdx, startIdx + 2).concat(
      startIdx + 2 > problems.length ? problems.slice(0, Math.max(0, (startIdx + 2) - problems.length)) : [],
    ).slice(0, 2);
  }, [currentPhase.id, selectedDay]);

  // Flash card stats
  const totalReviewed = useMemo(() => flashCards.filter((q) => revealedCards[q.id]).length, [flashCards, revealedCards]);
  const todayReviewed = todayCards.filter((q) => revealedCards[q.id]).length;

  const toggleReveal = (id: string) => {
    setRevealedCards((prev) => ({ ...prev, [id]: true }));
  };

  const toggleProblem = (title: string) => {
    setSolvedProblems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleHard = (id: string) => {
    setHardCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hard cards (review queue)
  const hardCardsList = useMemo(() => {
    const allQs = [...(track === "ios" ? IOS_QUESTIONS : FDE_QUESTIONS), ...CULTURE_QUESTIONS];
    return allQs.filter((q) => hardCards[q.id]);
  }, [track, hardCards]);

  // Weakness analysis: patterns with lowest progress
  // Shuffled quiz (deterministic per day, all questions)
  const shuffledQuiz = useMemo(() => {
    const trackQs = QUIZ_BANK.filter((q) =>
      track === "fde" ? q.category !== "ios" && q.category !== "swift" : q.category !== "fde",
    );
    // Fisher-Yates shuffle with day-based seed
    const seed = today * 2654435761;
    const arr = [...trackQs];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.abs((seed * (i + 1) * 16807) % 2147483647) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [track, today]);

  const quizTotal = shuffledQuiz.length;
  const quizCorrectTotal = useMemo(() => Object.values(quizHistory).filter((h) => h.correct).length, [quizHistory]);
  const quizAnsweredTotal = Object.keys(quizHistory).length;

  const weakPatterns = useMemo(() => {
    return ALGO_PATTERNS
      .map((p) => ({ ...p, solved: patternProgress[p.id] ?? 0, pct: Math.round(((patternProgress[p.id] ?? 0) / p.problems) * 100) }))
      .filter((p) => p.pct < 100)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);
  }, [patternProgress]);

  // Overall progress percentage
  const progressPercent = Math.round(((today - 1) / TOTAL_DAYS) * 100);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* Mouse gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${currentPhase.color}0a, transparent 40%)`,
        }}
      />

      <main className="relative z-10 mx-auto max-w-[900px] px-6 pt-16 pb-32">
        {/* ═══════════ HEADER ═══════════ */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-code tracking-widest text-text/30 uppercase">Hidden Menu</span>
            <span className="h-px flex-1 bg-border/30" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-3">
            100-Day <span style={{ color: currentPhase.color }}>Boot Camp</span>
          </h1>
          <p className="text-lg text-text/60 leading-relaxed">
            <B text={`**${formatDate(1)}** ~ **${formatDate(100)}** · 한국 빅테크 iOS / FDE 듀얼트랙 면접 준비`} />
          </p>
        </header>

        {/* ═══════════ D-DAY COUNTER ═══════════ */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          <div className="rounded-2xl border border-border/40 bg-surface/40 p-5 text-center">
            <p className="text-3xl font-display font-black" style={{ color: currentPhase.color }}>
              D-{daysRemaining}
            </p>
            <p className="text-xs text-text/40 mt-1">남은 일수</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-surface/40 p-5 text-center">
            <p className="text-3xl font-display font-black text-text/80">
              {today}<span className="text-base text-text/30">/{TOTAL_DAYS}</span>
            </p>
            <p className="text-xs text-text/40 mt-1">현재 Day</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-surface/40 p-5 text-center">
            <p className="text-3xl font-display font-black text-accent">
              {todayChecked}<span className="text-base text-text/30">/{todayTasks.length}</span>
            </p>
            <p className="text-xs text-text/40 mt-1">오늘 완료</p>
          </div>
          <div className={`rounded-2xl border p-5 text-center ${streak >= 7 ? "border-orange-500/40 bg-orange-500/5" : "border-border/40 bg-surface/40"}`}>
            <p className={`text-3xl font-display font-black ${streak >= 7 ? "text-orange-400" : "text-text/50"}`}>
              {streak}
            </p>
            <p className="text-xs text-text/40 mt-1">연속 일수</p>
          </div>
        </div>

        {/* Deload / Rest day alert */}
        {isDeloadWeek && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-3 flex items-center gap-3">
            <span className="text-amber-400 text-lg">&#9888;</span>
            <div>
              <p className="text-sm font-semibold text-amber-300/90">Deload Week (Week {currentWeek})</p>
              <p className="text-xs text-text/40">4주마다 강도 50% 감소. 번아웃 방지를 위한 능동적 회복 주간. 쉬운 문제 위주 + 복습 중심.</p>
            </div>
          </div>
        )}
        {isRestDay && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/5 px-5 py-3 flex items-center gap-3">
            <span className="text-green-400 text-lg">&#9775;</span>
            <div>
              <p className="text-sm font-semibold text-green-300/90">Rest Day (Day {selectedDay})</p>
              <p className="text-xs text-text/40">7일마다 쉬는 날. 가벼운 복습만 하거나 완전히 쉬어라. 뇌가 정리할 시간이 필요하다.</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs text-text/40 mb-2">
            <span>전체 진행률</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: `linear-gradient(90deg, ${PHASES[0].color}, ${currentPhase.color})` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {PHASES.map((p) => (
              <span
                key={p.id}
                className="text-[10px] font-code"
                style={{
                  color: today >= p.dayRange[0] ? p.color : `${p.color}40`,
                  width: `${((p.dayRange[1] - p.dayRange[0] + 1) / TOTAL_DAYS) * 100}%`,
                }}
              >
                Phase {p.id}
              </span>
            ))}
          </div>
        </div>

        {/* ═══════════ TRACK SWITCHER ═══════════ */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex rounded-full border border-border/50 bg-surface/30 p-1">
            {TRACKS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTrack(t.key); setQuizIndex(0); }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer ${
                  track === t.key
                    ? "bg-accent text-white shadow-sm"
                    : "text-text/50 hover:text-text/80"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-text/30 font-code">
            Phase {currentPhase.id} · Week {currentWeek}
          </span>
        </div>

        {/* ═══════════ TAB NAVIGATION ═══════════ */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
          {([
            { key: "overview" as const, label: "Overview" },
            { key: "coding" as const, label: "코딩테스트" },
            { key: "assignment" as const, label: "사전과제" },
            { key: "cs" as const, label: "CS 기초" },
            { key: "tech" as const, label: "기술면접" },
            { key: "quiz" as const, label: "퀴즈" },
            { key: "culture" as const, label: "인성면접" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface/30 text-text/40 hover:text-text/70 hover:bg-surface/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        {activeTab === "overview" && (<>

        {/* ═══════════ TODAY'S SUMMARY ═══════════ */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-3">
            Today&apos;s Mission — Day {today}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/30 bg-surface/20 px-4 py-3 flex items-center gap-3">
              <span className="text-accent text-xs">&#9654;</span>
              <p className="text-xs text-text/60">코딩테스트: 오늘의 문제 {todayProblems.length}개 + 패턴 연습</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-surface/20 px-4 py-3 flex items-center gap-3">
              <span className="text-purple-400 text-xs">&#9654;</span>
              <p className="text-xs text-text/60">기술면접: 플래시카드 {todayCards.length}장 리뷰 ({todayReviewed}/{todayCards.length})</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-surface/20 px-4 py-3 flex items-center gap-3">
              <span className="text-cyan-400 text-xs">&#9654;</span>
              <p className="text-xs text-text/60">CS: {(track === "fde" ? FDE_CS_DAILY_TOPICS : CS_DAILY_TOPICS)[(today - 1) % (track === "fde" ? FDE_CS_DAILY_TOPICS.length : CS_DAILY_TOPICS.length)].title}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-surface/20 px-4 py-3 flex items-center gap-3">
              <span className="text-red-400 text-xs">&#9654;</span>
              <p className="text-xs text-text/60">인성면접: {CULTURE_DAILY_TIPS[(today - 1) % CULTURE_DAILY_TIPS.length].title}</p>
            </div>
          </div>
        </section>

        {/* ═══════════ WEAKNESS ANALYSIS ═══════════ */}
        {weakPatterns.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-3">
            Weakness — 집중 공략 패턴
          </h2>
          <div className="flex gap-2">
            {weakPatterns.map((p) => (
              <div key={p.id} className="flex-1 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-xs font-bold text-amber-400/80">{p.nameKo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-surface/60 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400/60" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="text-[10px] font-code text-text/30">{p.solved}/{p.problems}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* ═══════════ REVIEW QUEUE (오답노트) ═══════════ */}
        {hardCardsList.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-3">
            Review Queue — 어려운 카드 {hardCardsList.length}장
          </h2>
          <div className="space-y-2">
            {hardCardsList.slice(0, 3).map((q) => (
              <div key={q.id} className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-3">
                <span className="text-[10px] font-code px-2 py-0.5 rounded-full bg-red-500/10 text-red-400/60">{q.topic}</span>
                <p className="text-xs text-text/60 flex-1 truncate">{q.question}</p>
                <button onClick={() => toggleHard(q.id)} className="text-[10px] text-red-400/40 hover:text-red-400 cursor-pointer">제거</button>
              </div>
            ))}
            {hardCardsList.length > 3 && <p className="text-[10px] text-text/25 text-center">+{hardCardsList.length - 3}장 더</p>}
          </div>
        </section>
        )}

        {/* ═══════════ COMPANY D-DAY ═══════════ */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-3">
            Company D-Day
          </h2>
          <div className="flex flex-wrap gap-2">
            {CAREER_PAGES.filter((c) => c.track === track || c.track === "both").slice(0, 6).map((c) => {
              const dday = companyDdays[c.company];
              const remaining = dday ? Math.ceil((new Date(dday).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={c.company} className="rounded-lg border border-border/30 bg-surface/20 px-3 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-xs font-semibold">{c.company}</span>
                  {remaining !== null ? (
                    <span className={`text-xs font-code ${remaining <= 7 ? "text-red-400" : "text-accent/60"}`}>D-{remaining}</span>
                  ) : (
                    <input
                      type="date"
                      className="text-[10px] bg-transparent border-b border-border/30 text-text/40 w-24 cursor-pointer"
                      onChange={(e) => setCompanyDdays((prev) => ({ ...prev, [c.company]: e.target.value }))}
                      title="지원 마감일 설정"
                    />
                  )}
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent/40 hover:text-accent">채용</a>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════ MOCK TIMER ═══════════ */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-3">
            Mock Timer
          </h2>
          {timerActive ? (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
              <p className="text-xs text-text/40 mb-1">{timerLabel}</p>
              <p className="text-5xl font-display font-black text-accent tabular-nums">{formatTimer(timerSeconds)}</p>
              {timerSeconds === 0 && <p className="text-sm text-green-400 mt-2 animate-pulse">Time&apos;s up!</p>}
              <button onClick={() => setTimerActive(false)} className="mt-3 text-xs text-text/30 hover:text-text/60 cursor-pointer">
                {timerSeconds === 0 ? "닫기" : "중지"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => startTimer(t.seconds, t.label)}
                  className="rounded-lg border border-border/30 bg-surface/20 px-3 py-2 text-xs text-text/50 hover:text-text hover:border-accent/30 transition-colors cursor-pointer"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════ WEEKLY REPORT ═══════════ */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-3">
            Weekly Report — Week {currentWeek}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/30 bg-surface/20 p-3 text-center">
              <p className="text-2xl font-display font-black text-accent">{totalChecked}</p>
              <p className="text-[10px] text-text/30 mt-0.5">총 체크</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-surface/20 p-3 text-center">
              <p className="text-2xl font-display font-black text-text/60">{totalReviewed}</p>
              <p className="text-[10px] text-text/30 mt-0.5">카드 리뷰</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-surface/20 p-3 text-center">
              <p className="text-2xl font-display font-black text-green-400">{Object.values(solvedProblems).filter(Boolean).length}</p>
              <p className="text-[10px] text-text/30 mt-0.5">문제 풀이</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-surface/20 p-3 text-center">
              <p className="text-2xl font-display font-black" style={{ color: streak >= 7 ? "#f97316" : undefined }}>{streak}</p>
              <p className="text-[10px] text-text/30 mt-0.5">연속 일수</p>
            </div>
          </div>
        </section>

        {/* ═══════════ PHASE ROADMAP ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-6">
            4-Phase Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PHASES.map((phase) => {
              const isActive = today >= phase.dayRange[0] && today <= phase.dayRange[1];
              const isDone = today > phase.dayRange[1];
              return (
                <div
                  key={phase.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isActive
                      ? "border-accent/40 bg-surface/60 shadow-lg shadow-accent/5"
                      : isDone
                        ? "border-border/30 bg-surface/20 opacity-70"
                        : "border-border/20 bg-surface/10 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-code"
                      style={{ background: `${phase.color}20`, color: phase.color }}
                    >
                      {phase.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold">{phase.title}</h3>
                      <p className="text-xs text-text/40">
                        Day {phase.dayRange[0]}-{phase.dayRange[1]} · {formatDate(phase.dayRange[0])} ~ {formatDate(phase.dayRange[1])}
                      </p>
                    </div>
                    {isDone && <span className="ml-auto text-xs text-green-400/80 font-code">DONE</span>}
                    {isActive && (
                      <span className="ml-auto text-xs font-code animate-pulse" style={{ color: phase.color }}>
                        NOW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text/50 mb-3">{phase.subtitle}</p>
                  <div className="space-y-1.5">
                    {phase.milestones.map((m) => {
                      const mDone = today > m.dayRange[1];
                      const mActive = today >= m.dayRange[0] && today <= m.dayRange[1];
                      return (
                        <div
                          key={m.week}
                          className={`flex items-center gap-2 text-xs ${mDone ? "text-text/30" : mActive ? "text-text/80" : "text-text/40"}`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: mDone ? `${m.color}40` : mActive ? m.color : `${m.color}25` }}
                          />
                          <span className={mActive ? "font-semibold" : ""}>
                            W{m.week}: {m.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════ DAY SELECTOR ═══════════ */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45">
              Daily Training — Day {selectedDay}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                className="w-8 h-8 rounded-lg border border-border/40 bg-surface/30 text-text/50 hover:text-text hover:border-accent/40 transition-colors flex items-center justify-center cursor-pointer"
              >
                &larr;
              </button>
              <button
                onClick={() => setSelectedDay(today)}
                className="px-3 h-8 rounded-lg border border-border/40 bg-surface/30 text-xs text-text/50 hover:text-text hover:border-accent/40 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDay(Math.min(TOTAL_DAYS, selectedDay + 1))}
                className="w-8 h-8 rounded-lg border border-border/40 bg-surface/30 text-text/50 hover:text-text hover:border-accent/40 transition-colors flex items-center justify-center cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Day grid */}
          <div className="flex flex-wrap gap-1 mb-6">
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
              const phase = PHASES.find((p) => day >= p.dayRange[0] && day <= p.dayRange[1]);
              const isToday = day === today;
              const isSelected = day === selectedDay;
              const isPast = day < today;
              const dayTasks = getDailyTasks(day).filter((t) => t.track === "shared" || t.track === track);
              const dayCompleted = dayTasks.every((t) => checkedTasks[t.id]);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{ width: "calc(10% - 3.6px)", height: 32, ...(isToday ? { color: phase?.color } : {}) }}
                  className={`rounded-md text-[10px] font-code flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-accent ring-offset-1 ring-offset-bg"
                      : ""
                  } ${
                    isToday
                      ? "font-bold border border-accent/50"
                      : isPast && dayCompleted
                        ? "bg-green-500/15 text-green-400/70"
                        : isPast
                          ? "bg-surface/30 text-text/30"
                          : "bg-surface/10 text-text/20 hover:bg-surface/30"
                  }`}
                  title={`Day ${day} (${formatDate(day)})`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </section>

        {/* ═══════════ DAILY TASKS ═══════════ */}
        <section className="mb-12">
          <div className="rounded-2xl border border-border/40 bg-surface/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Day {selectedDay} <span className="text-text/40 font-normal">({formatDate(selectedDay)})</span>
                </h3>
                <p className="text-xs text-text/40 mt-0.5">
                  {currentPhase.title} · Week {currentWeek}
                </p>
              </div>
              <span
                className="text-xs font-code px-2.5 py-1 rounded-full"
                style={{ color: currentPhase.color, background: `${currentPhase.color}15` }}
              >
                {dailyTasks.filter((t) => checkedTasks[t.id]).length}/{dailyTasks.length}
              </span>
            </div>
            <div className="divide-y divide-border/20">
              {dailyTasks.map((task) => {
                const cat = CATEGORY_META[task.category];
                return (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface/30 transition-colors cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedTasks[task.id]}
                      onChange={() => toggleTask(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border-border/50 accent-accent cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${checkedTasks[task.id] ? "line-through text-text/30" : "text-text/70"}`}>
                        {task.label}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-code px-2 py-0.5 rounded-full mt-0.5"
                      style={{ color: cat.color, background: `${cat.color}12` }}
                    >
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* Flash Cards + Coding Problems → 코딩테스트/기술면접 탭에서 확인 */}

        {/* ═══════════ WEEKLY FOCUS ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Week {currentWeek} Focus — {track === "ios" ? "iOS" : "FDE"} Track
          </h2>
          <div className="rounded-2xl border border-border/40 bg-surface/30 p-5">
            <div className="space-y-2">
              {(weeklyTopics[currentWeek] ?? []).map((topic, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: currentPhase.color }} />
                  <span className="text-sm text-text/60">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ PHASE DETAIL ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Current Phase Detail
          </h2>
          <div className="space-y-3">
            {currentPhase.milestones.map((m) => {
              const mActive = today >= m.dayRange[0] && today <= m.dayRange[1];
              return (
                <div
                  key={m.week}
                  className={`rounded-xl border p-4 transition-all ${
                    mActive
                      ? "border-accent/30 bg-surface/50"
                      : "border-border/20 bg-surface/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                      Week {m.week}: {m.title}
                    </h4>
                    <span className="text-xs text-text/30 font-code">
                      Day {m.dayRange[0]}-{m.dayRange[1]}
                    </span>
                  </div>
                  <p className="text-xs text-text/50 leading-relaxed">{m.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        </>)}

        {/* ═══════════ TAB: CODING TEST ═══════════ */}
        {activeTab === "coding" && (<>

        {/* ═══════════ KEY RESOURCES ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Key Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: "Programmers", desc: "한국 코딩테스트 표준 플랫폼", url: "https://programmers.co.kr/", color: "#3b82f6" },
              { title: "코드트리", desc: "커리큘럼 기반 + 삼성/현대 기출", url: "https://www.codetree.ai/", color: "#0d6efd" },
              { title: "LeetCode", desc: "글로벌 표준 + 시스템 디자인", url: "https://leetcode.com/", color: "#f59e0b" },
              { title: "iOS 면접 질문 100+", desc: "GitHub — JeaSungLEE", url: "https://github.com/JeaSungLEE/iOSInterviewquestions", color: "#06b6d4" },
              { title: "Mobile System Design", desc: "모바일 시스템 설계 프레임워크", url: "https://github.com/weeeBox/mobile-system-design", color: "#10b981" },
              { title: "Tech Interview for Dev", desc: "CS 기초 면접 정리", url: "https://github.com/gyoogle/tech-interview-for-developer", color: "#8b5cf6" },
            ].map((r) => (
              <a
                key={r.title}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border/30 bg-surface/20 p-4 hover:bg-surface/40 hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-sm font-semibold group-hover:text-accent transition-colors">{r.title}</span>
                </div>
                <p className="text-xs text-text/40">{r.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════ ALGORITHM PATTERNS ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            14 Algorithm Patterns
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— Grokking 기반 패턴 마스터리</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {ALGO_PATTERNS.map((p) => {
              const solved = patternProgress[p.id] ?? 0;
              const pct = Math.min(100, Math.round((solved / p.problems) * 100));
              const mastered = solved >= p.problems;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    const next = ((patternProgress[p.id] ?? 0) + 1) % (p.problems + 1);
                    setPatternProgress((prev) => ({ ...prev, [p.id]: next }));
                  }}
                  className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                    mastered
                      ? "border-green-500/40 bg-green-500/10"
                      : solved > 0
                        ? "border-accent/30 bg-surface/40"
                        : "border-border/30 bg-surface/20"
                  }`}
                  title={`${p.name}: ${solved}/${p.problems} (클릭하여 +1)`}
                >
                  <p className={`text-xs font-bold mb-1 ${mastered ? "text-green-400" : solved > 0 ? "text-accent/80" : "text-text/40"}`}>
                    {p.nameKo}
                  </p>
                  <div className="h-1 rounded-full bg-surface/60 overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: mastered ? "#10b981" : "#3b82f6" }}
                    />
                  </div>
                  <p className="text-[10px] font-code text-text/30">{solved}/{p.problems}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-text/25 mt-2">* 클릭하면 풀이 수 +1. 각 패턴별 목표 문제 수 달성 시 마스터.</p>
        </section>

        {/* ═══════════ ALGORITHM GUIDES ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Algorithm Playbook
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 유형별 완전 정복 가이드</span>
          </h2>
          <div className="space-y-2">
            {ALGO_GUIDES.map((guide) => (
              <details key={guide.id} className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden group">
                <summary className="px-5 py-3.5 cursor-pointer hover:bg-surface/40 transition-colors flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: guide.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold">{guide.nameKo}</span>
                    <span className="text-xs text-text/30 ml-2 font-code">{guide.name}</span>
                  </div>
                  <span className="text-xs text-text/25 shrink-0 hidden md:block max-w-[300px] truncate">{guide.oneLiner}</span>
                </summary>
                <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-4">
                  {/* 한줄 설명 */}
                  <p className="text-sm font-medium" style={{ color: guide.color }}>{guide.oneLiner}</p>

                  {/* 이 패턴을 쓸 때 */}
                  <div>
                    <p className="text-[10px] font-code font-bold text-text/40 mb-1.5 uppercase tracking-wider">이런 문제가 나오면 이 패턴!</p>
                    <div className="flex flex-wrap gap-1.5">
                      {guide.whenToUse.map((signal, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-surface/60 text-text/60 border border-border/30">{signal}</span>
                      ))}
                    </div>
                  </div>

                  {/* 시각적 설명 */}
                  <div className="rounded-lg bg-bg/80 border border-border/30 p-4 overflow-x-auto">
                    <p className="text-[10px] font-code font-bold text-text/30 mb-2 uppercase tracking-wider">Visual</p>
                    <pre className="text-xs font-code text-text/60 leading-relaxed whitespace-pre">{guide.visual}</pre>
                  </div>

                  {/* 풀이 순서 */}
                  <div>
                    <p className="text-[10px] font-code font-bold text-text/40 mb-1.5 uppercase tracking-wider">풀이 순서</p>
                    <div className="space-y-1">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {!step.startsWith("  ") ? (
                            <span className="shrink-0 w-4 h-4 rounded bg-accent/10 text-accent/60 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                          ) : (
                            <span className="shrink-0 w-4" />
                          )}
                          <p className="text-xs text-text/60 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 템플릿 코드 */}
                  <div className="rounded-lg bg-bg/80 border border-border/30 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20">
                      <span className="text-[10px] font-code text-text/30">{guide.templateLang} · 바로 쓸 수 있는 템플릿</span>
                      <span className="text-[10px] font-code text-text/20">{guide.complexity}</span>
                    </div>
                    <pre className="p-4 text-xs font-code text-text/60 leading-relaxed overflow-x-auto whitespace-pre">{guide.template}</pre>
                  </div>

                  {/* 대표 문제 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-code text-text/30">대표 문제:</span>
                    <span className="text-xs text-text/50">{guide.representative}</span>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ═══════════ TIMEBOX RULES ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Timebox Rules
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 난이도별 시간 제한</span>
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {TIMEBOX_RULES.map((r) => (
              <div key={r.level} className="rounded-xl border border-border/30 bg-surface/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                  <span className="text-sm font-bold">{r.level}</span>
                </div>
                <p className="text-2xl font-display font-black mb-1" style={{ color: r.color }}>{r.time}</p>
                <p className="text-[11px] text-text/40 leading-snug">{r.give_up}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ LEVEL-UP CRITERIA ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Level-Up Criteria
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— ZPD 기반 자동 레벨업</span>
          </h2>
          <div className="flex gap-3">
            {LEVEL_CRITERIA.map((lc, i) => (
              <div key={i} className="flex-1 rounded-xl border border-border/30 bg-surface/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-code px-2 py-0.5 rounded-full bg-accent/10 text-accent/70">{lc.from}</span>
                  <span className="text-text/20">&rarr;</span>
                  <span className="text-xs font-code px-2 py-0.5 rounded-full bg-green-500/10 text-green-400/70">{lc.to}</span>
                </div>
                <p className="text-xs text-text/60 leading-relaxed mb-1">{lc.criteria}</p>
                <p className="text-[10px] text-text/30 font-code">목표: {lc.dayTarget}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 70/20/10 RULE ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Daily Time Split
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 70/20/10 법칙</span>
          </h2>
          <div className="rounded-xl border border-border/30 bg-surface/20 p-5">
            <div className="flex h-4 rounded-full overflow-hidden mb-4">
              <div className="bg-accent/70" style={{ width: "70%" }} />
              <div className="bg-amber-400/70" style={{ width: "20%" }} />
              <div className="bg-green-400/70" style={{ width: "10%" }} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-display font-black text-accent/70">70%</p>
                <p className="text-xs text-text/50 mt-0.5">신규 문제</p>
                <p className="text-[10px] text-text/30">못 푸는 영역에 도전</p>
              </div>
              <div>
                <p className="text-2xl font-display font-black text-amber-400/70">20%</p>
                <p className="text-xs text-text/50 mt-0.5">틀린 문제 복습</p>
                <p className="text-[10px] text-text/30">1일/3일/7일 간격 재풀이</p>
              </div>
              <div>
                <p className="text-2xl font-display font-black text-green-400/70">10%</p>
                <p className="text-xs text-text/50 mt-0.5">워밍업</p>
                <p className="text-[10px] text-text/30">자신감 유지용 쉬운 문제</p>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Problems */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Today&apos;s Problems
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— Phase {currentPhase.id} 추천 문제</span>
          </h2>
          <div className="space-y-2">
            {todayProblems.map((p) => (
              <div key={p.title} className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${solvedProblems[p.title] ? "border-green-500/30 bg-green-500/5" : "border-border/40 bg-surface/30"}`}>
                <input type="checkbox" checked={!!solvedProblems[p.title]} onChange={() => toggleProblem(p.title)} className="w-4 h-4 rounded accent-green-500 cursor-pointer shrink-0" />
                <div className="flex-1 min-w-0">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium hover:text-accent transition-colors ${solvedProblems[p.title] ? "line-through text-text/30" : "text-text/80"}`}>{p.title}</a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-code text-text/30">{p.platform}</span>
                    <span className="text-[10px] font-code text-accent/50">{p.difficulty}</span>
                    <span className="text-[10px] font-code text-text/20">{p.topic}</span>
                  </div>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-accent/50 hover:text-accent transition-colors">풀러가기 &rarr;</a>
              </div>
            ))}
          </div>
        </section>

        {/* Big-O Notation Guide */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Big-O Notation
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 시간복잡도 한눈에 이해하기</span>
          </h2>
          {/* 비교 바 */}
          <div className="rounded-xl border border-border/40 bg-surface/30 p-5 mb-4">
            <p className="text-[10px] font-code text-text/30 mb-3">n=100 기준 연산 횟수 비교</p>
            <div className="space-y-2">
              {BIG_O_COMPARISON.map((item) => {
                const entry = BIG_O_GUIDE.find((e) => e.notation === item.notation);
                return (
                  <div key={item.notation} className="flex items-center gap-3">
                    <span className="text-xs font-code w-20 shrink-0" style={{ color: entry?.color }}>{item.notation}</span>
                    <div className="flex-1 h-3 rounded-full bg-surface/60 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.bar}%`, background: entry?.color }} />
                    </div>
                    <span className="text-[10px] font-code text-text/25 w-16 text-right shrink-0">
                      {item.ops > 1e9 ? "∞" : item.ops.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 상세 카드 */}
          <div className="space-y-2">
            {BIG_O_GUIDE.map((entry) => (
              <details key={entry.notation} className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden">
                <summary className="px-5 py-3.5 cursor-pointer hover:bg-surface/40 transition-colors flex items-center gap-3">
                  <span className="text-lg font-display font-black shrink-0 w-20" style={{ color: entry.color }}>{entry.notation}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-text/70">{entry.nameKo}</span>
                    <span className="text-xs text-text/30 ml-2">{entry.name}</span>
                  </div>
                  <span className="text-[10px] font-code px-2 py-0.5 rounded-full shrink-0" style={{ color: entry.color, background: `${entry.color}15` }}>{entry.speed}</span>
                </summary>
                <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-4">
                  {/* 비유 */}
                  <p className="text-sm text-text/60 leading-relaxed">{entry.analogy}</p>

                  {/* 성장 시각화 */}
                  <div className="rounded-lg bg-bg/80 border border-border/30 p-4">
                    <p className="text-[10px] font-code font-bold text-text/30 mb-2 uppercase tracking-wider">n이 커지면?</p>
                    <pre className="text-xs font-code text-text/50 leading-relaxed whitespace-pre">{entry.visual}</pre>
                  </div>

                  {/* 예시 + 한계 */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-code text-text/30 mb-1">대표 예시</p>
                      <p className="text-xs text-text/50">{entry.example}</p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] font-code text-text/30 mb-1">실전 한계</p>
                      <p className="text-xs font-semibold" style={{ color: entry.color }}>{entry.limit}</p>
                    </div>
                  </div>

                  {/* Swift 코드 */}
                  <div className="rounded-lg bg-bg/80 border border-border/30 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border/20">
                      <span className="text-[10px] font-code text-text/30">swift · 실전 코드 예시</span>
                    </div>
                    <pre className="p-4 text-xs font-code text-text/55 leading-relaxed overflow-x-auto whitespace-pre">{entry.code}</pre>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        </>)}

        {/* ═══════════ TAB: ASSIGNMENT ═══════════ */}
        {activeTab === "assignment" && (<>
        {/* Full Process Guide의 01-02 단계만 표시 */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            사전과제 완전 가이드
          </h2>
          <div className="space-y-2">
            {PROCESS_STAGES.filter((s) => s.step <= 2).map((stage) => (
              <details key={stage.id} open={stage.step === 2} className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden">
                <summary className="px-5 py-4 cursor-pointer hover:bg-surface/50 transition-colors flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-code shrink-0" style={{ background: `${stage.color}20`, color: stage.color }}>{stage.icon}</span>
                  <span className="text-sm font-bold flex-1">{stage.title}</span>
                </summary>
                <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-3">
                  <p className="text-xs text-text/50 leading-relaxed">{stage.overview}</p>
                  <div className="space-y-1.5">
                    {stage.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-green-400/50 text-xs mt-0.5">&#10003;</span>
                        <p className="text-xs text-text/60 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-accent/5 border border-accent/15 px-3 py-2.5">
                    <p className="text-[10px] font-code font-bold text-accent/50 mb-1 uppercase">Tips</p>
                    {stage.tips.map((tip, i) => <p key={i} className="text-xs text-text/55 leading-relaxed">&#8226; {tip}</p>)}
                  </div>
                  <div className="rounded-lg bg-red-500/5 border border-red-500/15 px-3 py-2.5">
                    <p className="text-[10px] font-code font-bold text-red-400/50 mb-1 uppercase">Pitfalls</p>
                    {stage.pitfalls.map((p, i) => <p key={i} className="text-xs text-text/45 leading-relaxed">&#10005; {p}</p>)}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        {/* README + AI + Timeline */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">README / AI 활용 / 타임라인</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border/30 bg-surface/20 p-5">
              <h3 className="text-xs font-bold text-text/40 mb-2 uppercase tracking-wider">README 필수 항목</h3>
              {ASSIGNMENT_CHECKLIST.readme.map((item, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">{i+1}. {item}</p>)}
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
              <h3 className="text-xs font-bold text-purple-400/70 mb-2 uppercase tracking-wider">AI 도구 활용 가이드</h3>
              {ASSIGNMENT_CHECKLIST.aiUsage.map((item, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">&#8226; {item}</p>)}
            </div>
            <div className="rounded-xl border border-border/30 bg-surface/20 p-5">
              <h3 className="text-xs font-bold text-text/40 mb-2 uppercase tracking-wider">5일 과제 타임라인</h3>
              {ASSIGNMENT_CHECKLIST.timeline5day.map((item, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">{item}</p>)}
            </div>
          </div>
        </section>
        {/* Today's Assignment Tip */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Today&apos;s Tip — Day {selectedDay}
          </h2>
          {(() => {
            const tips = track === "fde" ? FDE_ASSIGNMENT_DAILY_TIPS : ASSIGNMENT_DAILY_TIPS;
            const tip = tips[(selectedDay - 1) % tips.length];
            return (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                <h3 className="text-sm font-bold text-purple-400/80 mb-2">{tip.title}</h3>
                <p className="text-sm text-text/60 leading-relaxed">{tip.content}</p>
              </div>
            );
          })()}
        </section>
        </>)}

        {/* ═══════════ TAB: CS FUNDAMENTALS ═══════════ */}
        {activeTab === "cs" && (<>
        {/* Today's CS Topic */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Today&apos;s CS — Day {selectedDay}
          </h2>
          {(() => {
            const tips = track === "fde" ? FDE_CS_DAILY_TOPICS : CS_DAILY_TOPICS;
            const tip = tips[(selectedDay - 1) % tips.length];
            return (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <h3 className="text-sm font-bold text-cyan-400/80 mb-2">{tip.title}</h3>
                <p className="text-sm text-text/60 leading-relaxed">{tip.content}</p>
              </div>
            );
          })()}
        </section>

        {/* CS Topics */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            CS Fundamentals
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 면접 단골 CS + 실무 연결</span>
          </h2>
          <div className="space-y-2">
            {CS_TOPICS.map((topic) => (
              <details key={topic.id} className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden">
                <summary className="px-5 py-3.5 cursor-pointer hover:bg-surface/40 transition-colors flex items-center gap-3">
                  <span className="text-[10px] font-code px-2 py-0.5 rounded-full shrink-0" style={{ color: topic.categoryColor, background: `${topic.categoryColor}15` }}>{topic.category}</span>
                  <span className="text-sm font-bold flex-1">{topic.title}</span>
                </summary>
                <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-4">
                  {/* 면접 질문 */}
                  <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
                    <p className="text-[10px] font-code text-accent/50 mb-1 uppercase">Interview Question</p>
                    <p className="text-sm font-medium text-text/70">{topic.question}</p>
                  </div>

                  {/* 시각적 설명 */}
                  <div className="rounded-lg bg-bg/80 border border-border/30 p-4 overflow-x-auto">
                    <p className="text-[10px] font-code font-bold text-text/30 mb-2 uppercase tracking-wider">Visual</p>
                    <pre className="text-xs font-code text-text/55 leading-relaxed whitespace-pre">{topic.visual}</pre>
                  </div>

                  {/* 답변 */}
                  <div>
                    <p className="text-[10px] font-code text-text/30 mb-1 uppercase">Answer</p>
                    <p className="text-sm text-text/60 leading-[1.8]">{topic.answer}</p>
                  </div>

                  {/* 실무 연결 */}
                  <div className="rounded-lg bg-green-500/5 border border-green-500/15 px-4 py-3">
                    <p className="text-[10px] font-code text-green-400/50 mb-1 uppercase">iOS 실무에서는?</p>
                    <p className="text-xs text-text/55 leading-relaxed">{topic.realWorld}</p>
                  </div>

                  {/* 코드 (있는 경우) */}
                  {topic.code && (
                    <div className="rounded-lg bg-bg/80 border border-border/30 overflow-hidden">
                      <div className="px-3 py-1.5 border-b border-border/20">
                        <span className="text-[10px] font-code text-text/30">swift · 실전 코드</span>
                      </div>
                      <pre className="p-4 text-xs font-code text-text/55 leading-relaxed overflow-x-auto whitespace-pre">{topic.code}</pre>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
        </>)}

        {/* ═══════════ TAB: TECH INTERVIEW ═══════════ */}
        {activeTab === "tech" && (<>
        {/* Flash Cards */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45">
              기술면접 Flash Cards — {track === "ios" ? "iOS" : "FDE"}
              <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">{todayReviewed}/{todayCards.length} reviewed</span>
            </h2>
            <span className="text-xs font-code text-text/30">전체 {totalReviewed}/{flashCards.length}</span>
          </div>
          <div className="space-y-3">
            {todayCards.map((q, qi) => {
              const isRevealed = !!revealedCards[q.id];
              return (
                <div key={`${q.id}-${qi}`} className="rounded-xl border border-border/40 bg-surface/30 overflow-hidden">
                  <button onClick={() => toggleReveal(q.id)} className="w-full px-5 py-4 text-left cursor-pointer hover:bg-surface/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] font-code px-2 py-0.5 rounded-full bg-accent/10 text-accent/60 mr-2">{q.topic}</span>
                        <p className="text-sm text-text/80 mt-2 leading-relaxed font-medium">{q.question}</p>
                      </div>
                      <span className={`shrink-0 text-xs mt-1 ${isRevealed ? "text-green-400" : "text-text/25"}`}>{isRevealed ? "reviewed" : "tap to reveal"}</span>
                    </div>
                  </button>
                  {isRevealed && (
                    <div className="px-5 py-4 border-t border-border/20 bg-accent/3">
                      <p className="text-sm text-text/60 leading-[1.8]">{q.answer}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleHard(q.id); }}
                        className={`mt-3 text-[10px] font-code px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          hardCards[q.id]
                            ? "bg-red-500/15 text-red-400/70 hover:bg-red-500/25"
                            : "bg-surface/40 text-text/30 hover:text-red-400/60"
                        }`}
                      >
                        {hardCards[q.id] ? "어려움 ✓ (복습 큐)" : "어려움 마크"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {todayReviewed === todayCards.length && todayCards.length > 0 && (
            <p className="text-xs text-green-400/70 mt-3 font-code text-center">All cards reviewed for today!</p>
          )}
        </section>
        {/* Company Strategy */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Company Strategy — {track === "ios" ? "iOS" : "FDE"}
          </h2>
          <div className="space-y-3">
            {(COMPANY_STRATEGIES[track] ?? []).map((c) => (
              <details key={c.name} className="rounded-xl border border-border/40 bg-surface/30 overflow-hidden">
                <summary className="px-5 py-4 cursor-pointer hover:bg-surface/50 transition-colors flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-sm font-bold flex-1">{c.name}</span>
                </summary>
                <div className="px-5 pb-4 border-t border-border/20 pt-3 space-y-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.process.map((step, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface/60 text-text/50">{step}</span>
                        {i < c.process.length - 1 && <span className="text-text/20 text-xs">&rarr;</span>}
                      </span>
                    ))}
                  </div>
                  <div><p className="text-[10px] font-code text-text/30 mb-0.5">CODING TEST</p><p className="text-xs text-text/60">{c.codingTest}</p></div>
                  <div className="rounded-lg bg-accent/5 border border-accent/15 px-3 py-2"><p className="text-[10px] font-code text-accent/50 mb-0.5">KEY TIP</p><p className="text-xs text-text/60">{c.keyTip}</p></div>
                  <div className="rounded-lg bg-red-500/5 border border-red-500/15 px-3 py-2"><p className="text-[10px] font-code text-red-400/50 mb-0.5">FAIL REASON</p><p className="text-xs text-text/50">{c.failReason}</p></div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Today's Deep Dive */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Today&apos;s Deep Dive
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— Day {selectedDay}</span>
          </h2>
          {(() => {
            const tips = track === "fde" ? FDE_TECH_DAILY_TOPICS : TECH_DAILY_TOPICS;
            const tip = tips[(selectedDay - 1) % tips.length];
            return (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                <h3 className="text-sm font-bold text-accent/80 mb-2">{tip.title}</h3>
                <p className="text-sm text-text/60 leading-relaxed">{tip.content}</p>
              </div>
            );
          })()}
        </section>

        {/* System Design Cases */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            {track === "ios" ? "Mobile System Design" : "Solution Architecture"}
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">
              {track === "ios" ? "— weeeBox 프레임워크 기반" : "— 고객 솔루션 설계"}
            </span>
          </h2>
          {/* Framework Steps */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {SD_FRAMEWORK_STEPS.map((s) => (
              <div key={s.step} className="shrink-0 rounded-lg border border-border/30 bg-surface/20 px-3 py-2 min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black" style={{ background: `${s.color}20`, color: s.color }}>{s.step}</span>
                  <span className="text-xs font-bold">{s.title}</span>
                  <span className="text-[10px] text-text/25 font-code ml-auto">{s.time}</span>
                </div>
                <p className="text-[10px] text-text/40 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
          {/* Clarifying Questions */}
          <details className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden mb-3">
            <summary className="px-5 py-3 cursor-pointer hover:bg-surface/40 transition-colors text-sm font-bold text-text/60">
              면접 시작 시 물어볼 질문 {SD_CLARIFYING_QUESTIONS.length}가지
            </summary>
            <div className="px-5 pb-4 border-t border-border/20 pt-3 space-y-1.5">
              {SD_CLARIFYING_QUESTIONS.map((q, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">&#8226; {q}</p>)}
            </div>
          </details>
          {/* API Comparison */}
          <details className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden mb-4">
            <summary className="px-5 py-3 cursor-pointer hover:bg-surface/40 transition-colors text-sm font-bold text-text/60">
              API 프로토콜 비교 (REST vs GraphQL vs gRPC vs WebSocket)
            </summary>
            <div className="px-5 pb-4 border-t border-border/20 pt-3">
              <div className="grid grid-cols-4 gap-2">
                {SD_API_COMPARISON.map((api) => (
                  <div key={api.name} className="rounded-lg bg-surface/40 p-3">
                    <p className="text-xs font-bold mb-1">{api.name}</p>
                    <p className="text-[10px] text-green-400/60 mb-0.5">+ {api.pros}</p>
                    <p className="text-[10px] text-red-400/50 mb-0.5">- {api.cons}</p>
                    <p className="text-[10px] text-accent/50">Best: {api.bestFor}</p>
                  </div>
                ))}
              </div>
            </div>
          </details>
          {/* Design Cases */}
          <div className="space-y-2">
            {(track === "fde" ? FDE_DESIGN_CASES : SYSTEM_DESIGN_CASES).map((c) => (
              <details key={c.id} className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden">
                <summary className="px-5 py-3.5 cursor-pointer hover:bg-surface/40 transition-colors flex items-center gap-3">
                  <span className="text-sm font-bold flex-1">{c.title}</span>
                  <span className={`text-[10px] font-code px-2 py-0.5 rounded-full ${c.difficulty === "hard" ? "bg-red-500/10 text-red-400/70" : "bg-amber-500/10 text-amber-400/70"}`}>{c.difficulty}</span>
                  <span className="text-[10px] font-code text-text/25">{c.timeLimit}</span>
                </summary>
                <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-code text-green-400/50 mb-1 uppercase">Functional</p>
                      {c.functional.map((f, i) => <p key={i} className="text-xs text-text/50">&#10003; {f}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] font-code text-blue-400/50 mb-1 uppercase">Non-Functional</p>
                      {c.nonFunctional.map((f, i) => <p key={i} className="text-xs text-text/50">&#10003; {f}</p>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-code text-text/30 mb-1 uppercase">Architecture</p>
                    {c.architecture.map((a, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">&#8226; {a}</p>)}
                  </div>
                  <div>
                    <p className="text-[10px] font-code text-text/30 mb-1 uppercase">Deep Dive Points</p>
                    {c.deepDive.map((d, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">&#8226; {d}</p>)}
                  </div>
                  <div>
                    <p className="text-[10px] font-code text-amber-400/50 mb-1 uppercase">Tradeoffs (면접관이 여기서 물어본다)</p>
                    {c.tradeoffs.map((t, i) => <p key={i} className="text-xs text-text/50 leading-relaxed">&#8226; {t}</p>)}
                  </div>
                  <div className="rounded-lg bg-bg/80 border border-border/30 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border/20"><span className="text-[10px] font-code text-text/30">45분 답변 템플릿</span></div>
                    <pre className="p-4 text-xs font-code text-text/50 leading-relaxed overflow-x-auto whitespace-pre">{c.template}</pre>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        </>)}

        {/* ═══════════ TAB: QUIZ ═══════════ */}
        {activeTab === "quiz" && (<>
        <section>
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45">
              Quiz
              <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">
                {quizIndex + 1} / {quizTotal}
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-xs font-code text-green-400/70">{quizCorrectTotal} correct</span>
              <span className="text-xs font-code text-text/30">{quizAnsweredTotal} answered</span>
              <span className="text-xs font-code text-text/20">{quizTotal} total</span>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-0.5 mb-6 overflow-hidden">
            {shuffledQuiz.map((q, i) => {
              const h = quizHistory[q.id];
              return (
                <div
                  key={`${q.id}-${i}`}
                  className={`h-1 flex-1 rounded-full cursor-pointer transition-all ${
                    i === quizIndex ? "bg-accent" : h ? (h.correct ? "bg-green-500/60" : "bg-red-500/60") : "bg-surface/40"
                  }`}
                  onClick={() => setQuizIndex(i)}
                  title={`#${i + 1} ${q.category}`}
                />
              );
            })}
          </div>

          {/* Card */}
          {(() => {
            const q = shuffledQuiz[quizIndex];
            if (!q) return null;
            const history = quizHistory[q.id];
            const selection = quizSelection[q.id];
            const submitted = !!history;
            return (
              <div className={`rounded-2xl border-2 overflow-hidden transition-all ${submitted ? (history.correct ? "border-green-500/40" : "border-red-500/40") : "border-border/40"}`}>
                <div className="p-6 md:p-8">
                  {/* Category + number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-code px-3 py-1 rounded-full bg-accent/10 text-accent/70">{q.category}</span>
                    <span className="text-xs font-code text-text/20">#{quizIndex + 1}</span>
                  </div>

                  {/* Question */}
                  <p className="text-lg font-bold text-text/90 leading-relaxed mb-6">{q.question}</p>

                  {/* Choices */}
                  <div className="space-y-2">
                    {q.choices.map((choice, ci) => {
                      const isSelected = selection === ci || (submitted && history.answer === ci);
                      const isCorrect = ci === q.answer;
                      let style = "border-border/30 bg-surface/20 text-text/60 hover:border-accent/30";
                      if (submitted) {
                        if (isCorrect) style = "border-green-500/50 bg-green-500/10 text-green-300";
                        else if (isSelected && !isCorrect) style = "border-red-500/50 bg-red-500/10 text-red-300 line-through";
                        else style = "border-border/20 bg-surface/10 text-text/30";
                      } else if (isSelected) {
                        style = "border-accent/50 bg-accent/10 text-accent ring-1 ring-accent/30";
                      }
                      return (
                        <button
                          key={ci}
                          onClick={() => { if (!submitted) setQuizSelection((prev) => ({ ...prev, [q.id]: ci })); }}
                          className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all ${style} ${!submitted ? "cursor-pointer" : ""}`}
                          disabled={submitted}
                        >
                          <span className="font-code text-text/25 mr-3">{["A", "B", "C", "D"][ci]}.</span>
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit button */}
                  {!submitted && selection !== undefined && selection !== null && (
                    <button
                      onClick={() => {
                        const correct = selection === q.answer;
                        setQuizHistory((prev) => ({
                          ...prev,
                          [q.id]: { answer: selection, correct, date: new Date().toISOString().slice(0, 10) },
                        }));
                      }}
                      className="mt-6 w-full py-3 rounded-xl bg-accent text-white text-sm font-bold cursor-pointer hover:bg-accent/80 transition-colors"
                    >
                      제출
                    </button>
                  )}

                  {/* Explanation */}
                  {submitted && (
                    <div className={`mt-6 rounded-xl px-5 py-4 ${history.correct ? "bg-green-500/5 border border-green-500/20" : "bg-red-500/5 border border-red-500/20"}`}>
                      <p className={`text-xs font-bold mb-1 ${history.correct ? "text-green-400" : "text-red-400"}`}>
                        {history.correct ? "Correct!" : "Wrong — 정답: " + ["A", "B", "C", "D"][q.answer]}
                      </p>
                      <p className="text-sm text-text/60 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="border-t border-border/20 px-6 py-4 flex items-center justify-between bg-surface/20">
                  <button
                    onClick={() => setQuizIndex(Math.max(0, quizIndex - 1))}
                    disabled={quizIndex === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${quizIndex === 0 ? "text-text/20" : "text-text/50 hover:text-text hover:bg-surface/40 cursor-pointer"}`}
                  >
                    &larr; 이전
                  </button>
                  <button
                    onClick={() => {
                      if (submitted || (selection !== undefined && selection !== null)) {
                        // Auto-submit if not yet submitted
                        if (!submitted && selection !== undefined && selection !== null) {
                          const correct = selection === q.answer;
                          setQuizHistory((prev) => ({ ...prev, [q.id]: { answer: selection, correct, date: new Date().toISOString().slice(0, 10) } }));
                        }
                        setQuizIndex(Math.min(quizTotal - 1, quizIndex + 1));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      quizIndex === quizTotal - 1 ? "text-text/20" : "text-text/50 hover:text-text hover:bg-surface/40 cursor-pointer"
                    }`}
                  >
                    다음 &rarr;
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Reset button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => { setQuizHistory({}); setQuizSelection({}); setQuizIndex(0); }}
              className="text-xs text-text/20 hover:text-red-400/60 cursor-pointer transition-colors"
            >
              전체 기록 초기화
            </button>
          </div>
        </section>
        </>)}

        {/* ═══════════ TAB: CULTURE FIT ═══════════ */}
        {activeTab === "culture" && (<>

        {/* Today's Culture Tip */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Today&apos;s Practice — Day {selectedDay}
          </h2>
          {(() => {
            const tip = CULTURE_DAILY_TIPS[(selectedDay - 1) % CULTURE_DAILY_TIPS.length];
            return (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 className="text-sm font-bold text-red-400/80 mb-2">{tip.title}</h3>
                <p className="text-sm text-text/60 leading-relaxed">{tip.content}</p>
              </div>
            );
          })()}
        </section>

        {/* ═══════════ HIRING STRATEGY ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Hiring Strategy
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 실제 합격자 데이터 기반</span>
          </h2>
          <div className="space-y-4">
            {/* 포트폴리오 */}
            <div className="rounded-xl border border-border/40 bg-surface/30 p-5">
              <h3 className="text-xs font-bold text-accent/70 mb-3 uppercase tracking-wider">Portfolio Rules</h3>
              <div className="space-y-2">
                {HIRING_INSIGHTS.portfolio.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded bg-accent/10 text-accent/60 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-text/70">{r.rule}</p>
                      <p className="text-xs text-text/40 leading-relaxed mt-0.5">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 경력직 */}
            <div className="rounded-xl border border-border/40 bg-surface/30 p-5">
              <h3 className="text-xs font-bold text-green-400/70 mb-3 uppercase tracking-wider">3-4년차 경력직 차별화</h3>
              <div className="space-y-2">
                {HIRING_INSIGHTS.experienced.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded bg-green-500/10 text-green-400/60 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-text/70">{r.rule}</p>
                      <p className="text-xs text-text/40 leading-relaxed mt-0.5">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 탈락 사유 */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/3 p-5">
              <h3 className="text-xs font-bold text-red-400/70 mb-3 uppercase tracking-wider">Common Fail Reasons</h3>
              <div className="space-y-1.5">
                {HIRING_INSIGHTS.commonFails.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400/40 text-xs mt-0.5">&#10005;</span>
                    <p className="text-xs text-text/50 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ MENTOR NOTE (Science-backed) ═══════════ */}
        <section>
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
            <h3 className="font-display text-sm font-bold mb-4 text-accent/80">
              Mentor&apos;s Note — Phase {currentPhase.id}: {currentPhase.title}
            </h3>
            <div className="space-y-4">
              {(PHASE_MENTOR_TIPS[currentPhase.id] ?? []).map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-accent/10 text-accent/60 flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-accent/60 mb-0.5">{tip.principle}</p>
                    <p className="text-sm text-text/60 leading-relaxed"><B text={tip.tip} /></p>
                    <p className="text-[10px] text-text/25 mt-1 font-code">{tip.source}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-accent/10 space-y-1.5 text-xs text-text/40">
              <p><B text="**비협상 3조**: 하루 3시간 · 수면 7시간 · 운동 30분" /></p>
              <p><B text="포트폴리오는 **ai-study + Aidy + MoneyFlow** 3개면 충분. 새로 만들지 말고 기존 프로젝트를 깊게." /></p>
            </div>
          </div>
        </section>

        {/* ═══════════ INTERVIEW DAY PLAYBOOK ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Interview Day Playbook
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[INTERVIEW_DAY_PLAYBOOK.dMinus1, INTERVIEW_DAY_PLAYBOOK.dDay, INTERVIEW_DAY_PLAYBOOK.before].map((phase) => (
              <div key={phase.title} className="rounded-xl border border-border/30 bg-surface/20 p-4">
                <h3 className="text-xs font-bold text-accent/70 mb-3 uppercase">{phase.title}</h3>
                <div className="space-y-1.5">
                  {phase.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-400/50 text-xs mt-0.5 shrink-0">&#10003;</span>
                      <p className="text-xs text-text/55 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ SALARY + RED FLAGS ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            연봉 협상 + Red Flags
          </h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border/30 bg-surface/20 p-5">
              <h3 className="text-xs font-bold text-green-400/70 mb-3 uppercase tracking-wider">Salary Negotiation</h3>
              <div className="space-y-2">
                {SALARY_TIPS.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded bg-green-500/10 text-green-400/60 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-text/70">{t.rule}</p>
                      <p className="text-xs text-text/40 leading-relaxed mt-0.5">{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/3 p-5">
              <h3 className="text-xs font-bold text-red-400/70 mb-3 uppercase tracking-wider">Company Red Flags</h3>
              <div className="space-y-1.5">
                {RED_FLAGS.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400/40 text-xs mt-0.5">&#9888;</span>
                    <p className="text-xs text-text/50 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ ONBOARDING 30-60-90 ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Onboarding 30-60-90
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 입사 후 첫 90일 생존 가이드</span>
          </h2>
          <div className="space-y-3">
            {ONBOARDING_PLAYBOOK.map((phase) => (
              <details key={phase.phase} className="rounded-xl border border-border/30 bg-surface/20 overflow-hidden">
                <summary className="px-5 py-3.5 cursor-pointer hover:bg-surface/40 transition-colors flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: phase.color }} />
                  <span className="text-sm font-bold">{phase.phase}</span>
                </summary>
                <div className="px-5 pb-4 border-t border-border/20 pt-3 space-y-3">
                  <div>
                    <p className="text-[10px] font-code text-text/30 mb-1.5 uppercase">Goals</p>
                    {phase.goals.map((g, i) => <p key={i} className="text-xs text-text/60 leading-relaxed">&#10003; {g}</p>)}
                  </div>
                  <div className="rounded-lg bg-accent/5 border border-accent/15 px-3 py-2">
                    <p className="text-[10px] font-code text-accent/50 mb-1 uppercase">Tips</p>
                    {phase.tips.map((t, i) => <p key={i} className="text-xs text-text/55 leading-relaxed">&#8226; {t}</p>)}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ═══════════ MOCK FEEDBACK ═══════════ */}
        <section className="mb-12">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-4">
            Mock Interview Feedback
            <span className="ml-2 text-text/25 normal-case tracking-normal font-normal">— 모의면접 후 셀프 체크</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MOCK_FEEDBACK_CRITERIA.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/30 bg-surface/20 p-4">
                <p className="text-xs font-bold text-text/60 mb-1">{c.label}</p>
                <p className="text-[10px] text-text/35 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text/20 mt-2">* 모의면접 녹음 후 각 항목 1-10점 셀프 채점. 주간 추이를 관찰하면 성장이 보인다.</p>
        </section>
        </>)}

      </main>
    </div>
  );
}
