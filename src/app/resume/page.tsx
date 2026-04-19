"use client";

import { useEffect, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════ */
/*  SHARED TYPES & DATA                                       */
/* ═══════════════════════════════════════════════════════════ */

interface WorkEntry { company: string; role: string; period: string; summary: string; highlights: string[]; skills: string[]; }
interface SideProject { name: string; tagline: string; stack: string[]; color: string; metrics: string; bullets: string[]; }
interface EduEntry { title: string; period: string; note: string; }
interface ExtraSection { title: string; subtitle: string; paragraphs: string[]; }
interface ResumeData {
  title: string;
  summary: string[];
  skills: Record<string, { items: string[]; color: string }>;
  work: WorkEntry[];
  projects: SideProject[];
  projectsIntro?: string;
  education: EduEntry[];
  extras?: ExtraSection[];
}

const INFO = {
  name: "조민호",
  birthday: "1996. 06. 07",
  email: "jomino7777@gmail.com",
  phone: "010-5648-9906",
  github: "https://github.com/Mino777",
  blog: "https://ai-study-wheat.vercel.app/",
};

const EDUCATION: EduEntry[] = [
  { title: "야곰 아카데미 코드 리뷰어", period: "2023 — 2024", note: "iOS 멘토링 및 코드 리뷰" },
  { title: "정보처리기사", period: "2023. 11", note: "" },
  { title: "야곰 아카데미 iOS 캠프 5기", period: "2022", note: "TDD · Clean Code · 멀티스레딩" },
  { title: "경기대학교 졸업", period: "2014 — 2021", note: "" },
];

/* shared projects */
const PROJECTS_IOS: SideProject[] = [
  {
    name: "AI Study Wiki", tagline: "AI Engineering 방법론 허브 · 기술블로그",
    stack: ["Next.js", "MDX", "Gemini"], color: "#f59e0b",
    metrics: "90+ Entries · 25+ Journals · 99.5% Token 절감",
    bullets: [
      "직접 정의한 세 가지 AI Engineering 방법론을 체계화한 위키 — **Harness**(AI가 안전하게 달릴 울타리: 입출력 검증·폴백·Quality Gate), **Context**(AI에게 무엇을 보여줄지 설계: 컨텍스트 로딩 순서·불필요 정보 압축·에이전트별 격리), **Compound**(매 작업의 회고가 다음 작업의 입력이 되는 복리 루프)",
      "이 위키(허브)가 아래 3개 프로젝트(워커)를 관찰하고, 워커에서 검증된 패턴이 다시 위키에 기록되는 **양방향 지식 순환 구조** 운영",
      "git commit 전 자동 빌드 게이트, push 후 회고+솔루션 자동 생성 — 회고에 적힌 '다음 후보'가 다음 세션의 시작점이 되는 **Compound** 자동화",
    ],
  },
  {
    name: "Aidy", tagline: "1인 4-Agent 동시 관제 · iOS/Android/Server",
    stack: ["Spring Boot", "Tuist + TCA", "Jetpack Compose"], color: "#34d399",
    metrics: "4 Repos · 9/9 WO · 20R autoceo",
    bullets: [
      "1인이 **4개 AI 에이전트**(Architect/Server/iOS/Android)를 동시에 운용하여 3개 플랫폼을 병렬 개발 — API 명세 문서(api-contract.md)를 유일한 기준점으로 설정하고, AI가 이를 벗어나지 못하도록 **Harness** 적용",
      "AI 출력물을 2단계로 자동 검증 — 1차: API 명세와 필드명/타입/에러코드 라인별 대조, 2차: 3개 플랫폼 빌드+테스트+필드 동기화 확인. 20라운드 운영 중 검증 실패 초기 2건 → 이후 **0건**",
      "AI 응답의 5단계 품질 보정(JSON 파싱 → 타입 검증 → 재시도 → 오류 피드백 → 자동 채점)을 TypeScript에서 Kotlin으로 그대로 이식 — 언어가 바뀌어도 **Harness** 패턴은 재사용 가능함을 실증",
      "작업 완료마다 회고+솔루션+아키텍처 결정 기록을 자동 생성하고, 다음 작업이 이 문서를 읽고 시작하는 **Compound** 구조로 라운드마다 품질 상승",
    ],
  },
  {
    name: "MoneyFlow", tagline: "13개 AI 에이전트 적대적 토론 SaaS",
    stack: ["Next.js", "Supabase", "Claude/Gemini/GPT"], color: "#10b981",
    metrics: "13 Agents · 1,177 Tests · 3 Providers",
    bullets: [
      "13개 AI 에이전트가 서로 논쟁하며 투자 판단을 도출하는 파이프라인 — AI에 데이터를 넘기기 전 입력 검증, AI 응답의 모순 자동 차단(예: 강력 매수인데 신뢰도 30%), 실패 시 다른 AI 모델로 자동 전환하는 폴백 계층까지 **Harness**로 설계",
      "각 에이전트가 자기 전문 영역의 데이터만 보도록 격리 — 기술 분석은 차트만, 뉴스 에이전트는 뉴스만. 영역 밖 정보를 주면 환각이 증가한다는 걸 운영 데이터로 학습하여 **Context** 설계에 반영",
      "매 분석 사이클의 회고에 '다음에 할 일'을 명시 → 다음 세션이 그 목록을 그대로 입력으로 받아 실행. 실패한 시도도 솔루션 문서로 기록하여 같은 삽질을 반복하지 않는 **Compound** 복리 구조",
    ],
  },
  {
    name: "TaroSaju", tagline: "점술 SaaS · QA 100/100",
    stack: ["Next.js", "Supabase", "Playwright"], color: "#8b5cf6",
    metrics: "720 Tests · 65 E2E · 25 Rounds",
    bullets: [
      "25라운드 안전성 스프린트를 5라운드 단위로 끊어 운영 — 매 5라운드마다 회고→솔루션→다음 사이클 입력이 되는 **Compound** 루프. MoneyFlow에서 만든 인프라 패턴을 그대로 이식해 첫 라운드부터 높은 baseline에서 출발",
      "DB 보안 규칙(RLS) 자동 감사 테스트가 사람 수동 검토보다 누락 1건을 더 발견 — AI가 만든 코드를 사람이 아닌 **자동화 게이트가 검증**해야 한다는 **Harness** 원칙의 실효성을 데이터로 입증",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  iOS DATA                                                   */
/* ═══════════════════════════════════════════════════════════ */

const IOS_DATA: ResumeData = {
  title: "iOS Engineer",
  summary: [
    "롯데렌터카 G car 외 **총 4개 iOS 앱을 담당**하며 **3년 7개월간 608건의 티켓**(신규 기능 379 · 버그 119 · SDK 5종+)을 처리했습니다. 앱 전면 고도화, 결제/외부 서비스 연동, 보안 취약점 대응, 마케팅/분석 SDK 구축까지 **서비스 전 영역의 문제를 끝까지 닫는 방식으로 리드**해왔습니다.",
    "최근에는 **AI 에이전트 오케스트레이션** 기반으로 개발 사이클(요구사항→설계→구현→검증→회고)을 자동화하는 방법론(**Harness** / **Context** / **Compound** Engineering)에 집중하고 있습니다.",
  ],
  skills: {
    "iOS": { items: ["Swift", "RxSwift", "SwiftUI", "UIKit", "RIBs", "ReactorKit", "TCA", "Clean Architecture", "SPM", "Tuist"], color: "#3b82f6" },
    "연동": { items: ["Braze", "Amplitude", "Airbridge", "Firebase(GA4)", "네이버페이", "카카오T", "OCR", "WebView Bridge"], color: "#10b981" },
    "보안": { items: ["ISMS-P 대응", "생체 인증", "앱 변조 탐지", "Deep Link Router", "세션/인증 취약점 대응"], color: "#ef4444" },
    "DX": { items: ["Fastlane", "Jenkins", "GitHub Actions", "SwiftLint", "SwiftFormat", "SwiftGen", "모노레포/멀티모듈"], color: "#f59e0b" },
    "AI": { items: ["Harness Engineering", "Context Engineering", "Compound Engineering", "Multi-Agent Orchestration", "LLM-as-a-Judge", "Claude", "Gemini", "GPT"], color: "#8b5cf6" },
  },
  work: [
    {
      company: "그린카", role: "iOS Developer · Mobile 파트", period: "2022. 09 — 현재",
      summary: "롯데렌터카 G car · 세차클링 · 세차클링 파트너 · 무버스 **총 4개 iOS 앱** 유지보수 및 신규 피쳐 개발 담당. G car 기준 3년 7개월간 **608건** 티켓 처리(신규 기능 379 · 버그 119 · SDK 5종+). 앱 전면 고도화, 보안 대응, 결제/외부 서비스 연동까지 전 과정을 주도했습니다.",
      highlights: [
        "홈·이동하기·마이·예약·반납 **5개 핵심 탭 전면 리아키텍처** — UI/UX 개편 + 코드 구조 개선. iOS 26 Beta BottomSheet API 변경 선제 대응으로 크래시 **8건 사전 차단**",
        "네이버페이 결제 모듈 연동, 카카오T 비회원 예약 스마트키, Google ODM 광고 측정 등 **외부 서비스 연동 주도** — 간편결제 커버리지 확대",
        "**50+ 딥링크 경로** 설계 및 유지보수 (greencar:// 스키마) — 쿠폰·예약·그린패스·알림톡 등 CRM/전환 경로 전반 커버",
        "Braze Geofence 위치 기반 푸시, Amplitude/Firebase GA4 트래킹, Airbridge 디퍼드 딥링크 등 **마케팅/분석 SDK 5종** 직접 연동",
        "신분증 OCR 프레임워크 교체로 면허증 판독 실패율 개선 + 검출 실패율 데이터 수집/분석 기반 구축",
        "ISMS-P 보안 취약점 대응 — 카드 정보 마스킹, 세션 재사용 차단, SMS 인증 우회 수정, OS 변조 탐지 우회 차단 등 **보안 이슈 다수 처리**",
        "Python + Shell Script로 마케팅 CSV 기반 Tracking API 자동 생성, 이벤트 불일치 **컴파일 타임 100% 차단**",
        "SPM 모노레포 멀티 모듈 + Clean Architecture + RIBs + ReactorKit 구조화, Fastlane + Jenkins CI/CD 구축",
      ],
      skills: ["Swift", "UIKit", "RxSwift", "RIBs", "WebView", "Braze", "Amplitude", "Airbridge", "네이버페이", "ISMS-P"],
    },
    {
      company: "마이다스에이치앤티", role: "iOS Developer · 소프트웨어개발팀", period: "2021. 03 — 2021. 11",
      summary: "KPNP(태권도 대회 영상 솔루션) 및 베베미테(스마트 홈 IoT) **iOS 1인 개발**.",
      highlights: [
        "Clean Architecture + MVVM-C + DI Container 설계, ReplayKit/AVFoundation 영상 촬영 모듈 개발로 **App Store 출시 2개월** 내 완료",
        "Core Bluetooth + AWS AppSync 기반 IoT 연동, 3개국어 Localization 자동화, API 문서화 도입",
      ],
      skills: ["Swift", "RxSwift", "MVVM-C", "Core Bluetooth", "AVFoundation", "Realm"],
    },
  ],
  projects: PROJECTS_IOS,
  education: EDUCATION,
};

/* ═══════════════════════════════════════════════════════════ */
/*  FDE DATA                                                   */
/* ═══════════════════════════════════════════════════════════ */

const FDE_DATA: ResumeData = {
  title: "Forward Deployed Engineer 지원",
  summary: [
    "3년 7개월간 **608건의 실서비스 문제**를 끝까지 닫아온 엔지니어입니다. 결제 연동, 딥링크 설계, 보안 취약점 대응, 마케팅 SDK 구축 등 **비즈니스 전 영역의 문제를 기술로 해결**해왔고, 최근에는 직접 정의한 AI Engineering 방법론(Harness/Context/Compound)으로 **AI 에이전트를 실전에 안전하게 배포하는 시스템**을 설계·운영하고 있습니다.",
    "\"요청받은 기능을 구현하는 사람\"이 아니라, **현장의 문제를 발견하고 → 정의하고 → 풀고 → 스케일하는 전 과정을 소화하는 사람**입니다.",
  ],
  skills: {
    "Engineering": { items: ["Swift", "TypeScript", "Kotlin", "Next.js", "Spring Boot", "Supabase", "PostgreSQL"], color: "#3b82f6" },
    "AI": { items: ["Multi-Agent Orchestration", "LLM-as-a-Judge", "Prompt Engineering", "AI 출력 품질 검증", "폴백 설계", "Claude", "Gemini", "GPT"], color: "#8b5cf6" },
    "AI 배포": { items: ["Harness Engineering", "Context Engineering", "Compound Engineering"], color: "#10b981" },
    "비즈니스": { items: ["결제(네이버페이)", "마케팅 SDK(Braze/Amplitude/Airbridge)", "딥링크(50+ 경로)", "보안(ISMS-P)", "OCR", "WebView"], color: "#f59e0b" },
    "협업": { items: ["Jira", "Confluence", "마케팅/CRM 파트 협업", "크로스펑셔널 커뮤니케이션"], color: "#ef4444" },
  },
  work: [
    {
      company: "그린카", role: "iOS Developer · Mobile 파트", period: "2022. 09 — 현재",
      summary: "롯데렌터카 G car 외 **총 4개 앱** 담당. 3년 7개월간 **608건 티켓** 처리. **단순 구현이 아닌, 비즈니스 문제 발견→정의→해결→스케일 전 과정을 주도**했습니다.",
      highlights: [
        "네이버페이 결제 모듈 연동, 카카오T 비회원 예약 스마트키, Google ODM 광고 측정 등 **외부 서비스 연동 주도** — 간편결제 커버리지 확대로 매출 전환율 개선에 기여",
        "**50+ 딥링크 경로** 설계 — 마케팅/CRM 파트와 직접 소통하며 비즈니스 요구사항을 기술로 해결",
        "Braze Geofence · Amplitude · Firebase GA4 · Airbridge 등 **마케팅/분석 SDK 5종** 직접 연동 — 데이터 기반 의사결정 인프라 구축",
        "마케팅 부서 CSV-앱 코드 불일치를 **현장에서 발견** → Tracking API 자동 생성 모듈로 **구조적 해결**, 컴파일 타임 100% 차단",
        "OCR 프레임워크 교체 시 단순 교체가 아닌 **검출 실패율 데이터 수집 기반**까지 구축 — 정량적 모니터링 구조로 전환",
        "ISMS-P 보안 취약점 대응 — 카드 마스킹, 세션 차단, SMS 우회 수정, OS 변조 탐지 등 **보안 이슈 다수 처리**",
        "5개 핵심 탭 전면 리아키텍처 + iOS 26 Beta 선제 대응으로 크래시 **8건 사전 차단**",
      ],
      skills: ["Swift", "UIKit", "WebView", "Braze", "Amplitude", "Airbridge", "네이버페이", "ISMS-P", "딥링크", "CRM 협업"],
    },
    {
      company: "마이다스에이치앤티", role: "iOS Developer · 소프트웨어개발팀", period: "2021. 03 — 2021. 11",
      summary: "KPNP(태권도 대회 영상 솔루션) 및 베베미테(스마트 홈 IoT) **iOS 1인 개발**.",
      highlights: [
        "프로젝트 생성 → **App Store 출시 2개월** 완료 — 빠른 프로토타이핑과 실행력",
        "서버팀과 협의하여 API 문서화 도입 — 크로스펑셔널 커뮤니케이션으로 협업 효율 개선",
      ],
      skills: ["Swift", "RxSwift", "Core Bluetooth", "IoT 연동", "크로스팀 협업"],
    },
  ],
  projectsIntro: "직접 정의한 세 가지 AI Engineering 방법론 — **Harness**(AI가 안전하게 달릴 울타리), **Context**(AI에게 무엇을 보여줄지 설계), **Compound**(매 작업의 회고가 다음 작업의 입력이 되는 복리 루프) — 위에서 4개 프로젝트를 운영. 고객사에 AI를 배포할 때 바로 적용 가능한 프레임워크입니다.",
  projects: [
    { ...PROJECTS_IOS[0], tagline: "방법론 허브 · 재사용 가능한 프레임워크 정리",
      bullets: [
        "**Harness** · **Context** · **Compound** 세 방법론을 체계화한 90+ 엔트리 위키. **고객사별 일회성 커스텀이 아닌, 재사용 가능한 프레임워크**로 정리",
        "이 위키(허브)가 3개 프로젝트(워커)에 패턴을 전파하고, 워커에서 검증된 결과가 다시 기록되는 **양방향 지식 순환 구조** — FDE가 고객사 간 인사이트를 공유하는 구조와 동일",
      ],
    },
    { ...PROJECTS_IOS[1], tagline: "1인 4-Agent 동시 관제 · AI 배포 품질 보장",
      bullets: [
        "1인이 4개 AI 에이전트를 동시 운용하여 3개 플랫폼 병렬 개발 — **Harness**로 AI가 명세를 벗어나지 못하도록 구조적 제약 설정",
        "AI 출력물 2단계 자동 검증. 20라운드 중 초기 2건 실패 → 이후 **0건** — AI를 실전에 배포할 때 품질을 구조적으로 보장하는 방법의 실증",
        "**Compound** 구조로 매 라운드 회고가 다음 라운드의 입력 — 반복 운영할수록 품질이 자동으로 올라가는 구조",
      ],
    },
    { ...PROJECTS_IOS[2],
      bullets: [
        "13개 AI 에이전트가 논쟁하며 결론 도출 — 입력 검증, 응답 모순 차단, 모델 간 자동 폴백까지 **Harness** 설계",
        "에이전트별 데이터 격리(**Context**) — 환각 증가를 운영 데이터로 확인하고 설계에 반영",
        "실패도 솔루션 문서로 기록하는 **Compound** 복리 구조 — 같은 실수를 반복하지 않는 시스템",
      ],
    },
    { ...PROJECTS_IOS[3],
      bullets: [
        "MoneyFlow 패턴을 그대로 이식해 첫 라운드부터 높은 baseline — **재사용 가능한 프레임워크**의 실증",
        "자동 감사가 수동 검토보다 누락 1건 더 발견 — **Harness 자동 검증 > 수동 검토** 입증",
      ],
    },
  ],
  education: EDUCATION,
  extras: [
    {
      title: "① AI를 활용해 비즈니스 문제를 해결한 경험",
      subtitle: "AI 에이전트가 안전하게 작동하는 구조를 만드는 것 자체가 비즈니스 문제",
      paragraphs: [
        "**문제**: MoneyFlow에서 13개 AI 에이전트를 운영하며, AI가 \"강력 매수\"라고 하면서 신뢰도 30%인 모순된 응답을 내놓거나, 특정 시간대에 API 429 에러로 서비스가 중단되는 문제가 발생했습니다.",
        "**해결**: 5단계 **Harness** 체계를 설계했습니다 — 입력 검증 → 출력 모순 탐지 → 다른 AI 모델로 자동 전환(Claude→Gemini→GPT) → 작업 복잡도에 따라 모델 자동 분배 → 별도 AI가 최종 출력을 4차원 채점.",
        "**결과**: 이 패턴을 TypeScript → Kotlin → 3개 프로젝트에 이식. 언어와 도메인이 바뀌어도 프레임워크 자체는 재사용 가능함을 실증. Aidy 20라운드 운영 중 품질 실패 초기 2건 → 이후 **0건**. 고객사에 ALF를 배포할 때 AI 응답 품질을 구조적으로 보장하는 데 바로 적용 가능한 프레임워크입니다.",
      ],
    },
    {
      title: "② 현장에서 비즈니스 문제를 발견한 경험",
      subtitle: "마케팅팀의 CSV 파일이 앱을 망가뜨리고 있었다",
      paragraphs: [
        "**발견**: 그린카에서 마케팅/CRM 파트와 협업하며, 이벤트 트래킹 데이터를 CSV로 관리하는 과정에서 이벤트명 오타·파라미터 불일치가 런타임에서야 발견되어 마케팅 데이터 신뢰도가 떨어지는 문제를 발견했습니다.",
        "**행동**: \"커뮤니케이션을 더 잘하자\"가 아닌 구조적 해결 — Python + Shell Script로 CSV를 자동 파싱하여 타입 안전 Tracking API를 생성하는 모듈을 개발. 불일치 시 **컴파일이 실패**하도록 설계했습니다.",
        "**결과**: 이벤트 불일치 데이터 오염 **0건**. 마케팅팀은 CSV만 관리, 개발팀은 수동 확인 불필요. 일회성 수정이 아닌 **구조적으로 문제가 재발하지 않는 시스템** — FDE의 핵심인 \"현장 검증 솔루션을 스케일러블하게 만드는 것\"을 실전에서 경험했습니다.",
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  HELPERS                                                    */
/* ═══════════════════════════════════════════════════════════ */

function B({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") ? <span key={i} className="text-text font-semibold">{p.slice(2, -2)}</span> : <span key={i}>{p}</span>
  )}</>;
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-8 sticky top-14 bg-bg/80 backdrop-blur-sm py-3 -mx-6 px-6 z-20">
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  PAGE                                                       */
/* ═══════════════════════════════════════════════════════════ */

const TABS = [
  { key: "ios", label: "iOS Engineer" },
  { key: "fde", label: "FDE (채널톡)" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ResumePage() {
  const [tab, setTab] = useState<TabKey>("ios");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const data = tab === "ios" ? IOS_DATA : FDE_DATA;

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* Mouse gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.06), transparent 40%)` }}
      />

      <main className="resume-container relative z-10 mx-auto max-w-[740px] px-6 pt-20 pb-32">

        {/* Top bar: Tabs + PDF */}
        <div data-hide-print className="flex items-center justify-between mb-10">
          {/* Tabs */}
          <div className="flex rounded-full border border-border/50 bg-surface/30 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer ${
                  tab === t.key
                    ? "bg-accent text-white shadow-sm"
                    : "text-text/50 hover:text-text/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* PDF */}
          <button
            onClick={() => window.print()}
            className="group flex items-center gap-2 rounded-full border border-border/50 bg-surface/50 px-5 py-2.5 text-sm text-muted hover:text-text hover:border-accent/40 hover:bg-surface transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
        </div>

        {/* ═══════════ HEADER ═══════════ */}
        <header className="mb-16">
          <div className="flex items-start gap-8">
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-accent/20 via-transparent to-cat-agents/20 blur-sm" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/profile.jpg" alt="조민호" className="profile-photo relative w-[140px] h-[180px] rounded-xl object-cover border border-border/50" />
            </div>
            <div className="pt-2 min-w-0">
              <h1 className="font-display text-5xl font-black tracking-tight leading-[1.1] mb-1.5">{INFO.name}</h1>
              <p className="text-xl text-accent font-semibold tracking-wide mb-5">{data.title}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text/60">
                <span className="flex items-center gap-2"><span className="opacity-40">&#9737;</span> {INFO.birthday}</span>
                <span className="flex items-center gap-2"><span className="opacity-40">&#9993;</span> {INFO.email}</span>
                <span className="flex items-center gap-2"><span className="opacity-40">&#9742;</span> {INFO.phone}</span>
                <a href={INFO.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <span className="opacity-40">&#9679;</span> github.com/Mino777
                </a>
                <a href={INFO.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors col-span-2">
                  <span className="opacity-40">&#9998;</span> 기술블로그 — ai-study-wheat.vercel.app
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {data.summary.map((p, i) => (
              <p key={i} className="text-base text-text/80 leading-[1.85]"><B text={p} /></p>
            ))}
          </div>
        </header>

        {/* ═══════════ SKILLS ═══════════ */}
        <section className="mb-16">
          <SectionHead>Skills</SectionHead>
          <div className="space-y-4">
            {Object.entries(data.skills).map(([cat, { items, color }]) => (
              <div key={cat} className="flex items-start gap-4">
                <span className="mt-1.5 text-xs font-bold tracking-widest w-20 shrink-0" style={{ color }}>{cat}</span>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span key={s} className="skill-tag rounded-full px-3 py-1 text-sm text-text/70 border transition-colors hover:text-text/80"
                      style={{ borderColor: `${color}25`, background: `${color}08` }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ EXPERIENCE ═══════════ */}
        <section className="mb-16">
          <SectionHead>Experience <span className="text-text/30 font-normal normal-case tracking-normal">— 총 경력 4년 4개월</span></SectionHead>
          <div className="space-y-4">
            {data.work.map((w) => (
              <div key={w.company} className="work-card group rounded-xl p-6 -mx-6 transition-all hover:bg-surface/60 hover:shadow-[inset_0_1px_0_0_rgba(59,130,246,0.08)] hover:drop-shadow-lg">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold group-hover:text-accent transition-colors inline">{w.company}</h3>
                    <span className="text-sm text-text/50 ml-2">{w.role}</span>
                  </div>
                  <span className="text-sm text-text/50 font-code shrink-0">{w.period}</span>
                </div>
                <p className="text-base text-text/70 leading-relaxed mb-4"><B text={w.summary} /></p>
                <ul className="space-y-2.5">
                  {w.highlights.map((h, i) => (
                    <li key={i} className="text-base text-text/70 leading-[1.75] relative pl-4 before:content-['▸'] before:absolute before:left-0 before:text-accent/40 before:text-xs before:top-[3px]">
                      <B text={h} />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mt-4">
                  {w.skills.map((s) => (
                    <span key={s} className="rounded-full bg-accent/10 text-accent/70 px-3 py-1 text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ PROJECTS ═══════════ */}
        <section className="mb-16">
          <SectionHead>Projects</SectionHead>
          {data.projectsIntro && (
            <p className="text-base text-text/60 leading-[1.8] mb-8 -mt-2 rounded-lg border border-accent/15 bg-accent/5 p-4">
              <B text={data.projectsIntro} />
            </p>
          )}
          <div className="space-y-4">
            {data.projects.map((p) => (
              <div key={p.name} className="side-project-card group rounded-xl p-6 -mx-6 transition-all hover:bg-surface/60 hover:shadow-[inset_0_1px_0_0_rgba(59,130,246,0.08)] hover:drop-shadow-lg">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-display text-base font-bold group-hover:text-accent transition-colors">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 -translate-y-[1px]" style={{ background: p.color }} />
                    {p.name}
                    <span className="font-normal text-text/50 ml-2 text-base">{p.tagline}</span>
                  </h4>
                  <span className="text-xs font-code shrink-0" style={{ color: `${p.color}90` }}>{p.metrics}</span>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="text-base text-text/70 leading-[1.75] relative pl-4">
                      <span className="absolute left-0 top-[3px] text-xs opacity-40" style={{ color: p.color }}>▸</span>
                      <B text={b} />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full px-2.5 py-0.5 text-xs text-text/50 border"
                      style={{ borderColor: `${p.color}20`, background: `${p.color}06` }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ EXTRAS (FDE only) ═══════════ */}
        {data.extras?.map((ex) => (
          <section key={ex.title} className="mb-16">
            <SectionHead>{ex.title}</SectionHead>
            <div className="rounded-xl border border-border/50 bg-surface/30 p-6">
              <h3 className="font-display text-base font-bold mb-4">{ex.subtitle}</h3>
              <div className="space-y-3">
                {ex.paragraphs.map((p, i) => (
                  <p key={i} className="text-base text-text/70 leading-[1.8]"><B text={p} /></p>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ═══════════ EDUCATION ═══════════ */}
        <section>
          <SectionHead>Education &amp; Activity</SectionHead>
          <div className="space-y-5">
            {data.education.map((e) => (
              <div key={e.title} className="flex items-baseline justify-between gap-4">
                <div>
                  <span className="text-base font-medium">{e.title}</span>
                  {e.note && <span className="text-sm text-text/45 ml-2">{e.note}</span>}
                </div>
                <span className="text-sm text-text/45 font-code shrink-0">{e.period}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
