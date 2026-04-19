"use client";

import { useEffect, useState, useCallback } from "react";

/* ─────────────────────────── data ─────────────────────────── */

const INFO = {
  name: "조민호",
  title: "iOS Engineer",
  birthday: "1996. 06. 07",
  email: "jomino7777@gmail.com",
  phone: "010-5648-9906",
  github: "https://github.com/Mino777",
  blog: "https://ai-study-wheat.vercel.app/",
  summary: [
    "롯데렌터카 G car 외 **총 4개 iOS 앱을 담당**하며 **3년 7개월간 608건의 티켓**(신규 기능 379 · 버그 119 · SDK 5종+)을 처리했습니다. 앱 전면 고도화, 결제/외부 서비스 연동, 보안 취약점 대응, 마케팅/분석 SDK 구축까지 **서비스 전 영역의 문제를 끝까지 닫는 방식으로 리드**해왔습니다.",
    "최근에는 **AI 에이전트 오케스트레이션** 기반으로 개발 사이클(요구사항→설계→구현→검증→회고)을 자동화하는 방법론(**Harness** / **Context** / **Compound** Engineering)에 집중하고 있습니다.",
  ],
};

const SKILLS: Record<string, { items: string[]; color: string }> = {
  "iOS": {
    items: ["Swift", "RxSwift", "SwiftUI", "UIKit", "RIBs", "ReactorKit", "TCA", "Clean Architecture", "SPM", "Tuist"],
    color: "#3b82f6",
  },
  연동: {
    items: ["Braze", "Amplitude", "Airbridge", "Firebase(GA4)", "네이버페이", "카카오T", "OCR", "WebView Bridge"],
    color: "#10b981",
  },
  보안: {
    items: ["ISMS-P 대응", "생체 인증", "앱 변조 탐지", "Deep Link Router", "세션/인증 취약점 대응"],
    color: "#ef4444",
  },
  "DX": {
    items: ["Fastlane", "Jenkins", "GitHub Actions", "SwiftLint", "SwiftFormat", "SwiftGen", "모노레포/멀티모듈"],
    color: "#f59e0b",
  },
  AI: {
    items: ["Harness Engineering", "Context Engineering", "Compound Engineering", "Multi-Agent Orchestration", "LLM-as-a-Judge", "Claude", "Gemini", "GPT"],
    color: "#8b5cf6",
  },
};

interface WorkEntry {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  skills: string[];
}

const WORK: WorkEntry[] = [
  {
    company: "그린카",
    role: "iOS Developer · Mobile 파트",
    period: "2022. 09 — 현재",
    summary:
      "롯데렌터카 G car · 세차클링 · 세차클링 파트너 · 무버스 **총 4개 iOS 앱** 유지보수 및 신규 피쳐 개발 담당. G car 기준 3년 7개월간 **608건** 티켓 처리(신규 기능 379 · 버그 119 · SDK 5종+). 앱 전면 고도화, 보안 대응, 결제/외부 서비스 연동까지 전 과정을 주도했습니다.",
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
    company: "마이다스에이치앤티",
    role: "iOS Developer · 소프트웨어개발팀",
    period: "2021. 03 — 2021. 11",
    summary: "KPNP(태권도 대회 영상 솔루션) 및 베베미테(스마트 홈 IoT) **iOS 1인 개발**.",
    highlights: [
      "Clean Architecture + MVVM-C + DI Container 설계, ReplayKit/AVFoundation 영상 촬영 모듈 개발로 **App Store 출시 2개월** 내 완료",
      "Core Bluetooth + AWS AppSync 기반 IoT 연동, 3개국어 Localization 자동화, API 문서화 도입",
    ],
    skills: ["Swift", "RxSwift", "MVVM-C", "Core Bluetooth", "AVFoundation", "Realm"],
  },
];

interface SideProject {
  name: string;
  tagline: string;
  stack: string[];
  color: string;
  metrics: string;
  bullets: string[];
}

const SIDE_PROJECTS: SideProject[] = [
  {
    name: "AI Study Wiki",
    tagline: "AI Engineering 방법론 허브 · 기술블로그",
    stack: ["Next.js", "MDX", "Gemini"],
    color: "#f59e0b",
    metrics: "90+ Entries · 25+ Journals · 99.5% Token 절감",
    bullets: [
      "직접 정의한 세 가지 AI Engineering 방법론을 체계화한 위키 — **Harness**(AI가 안전하게 달릴 울타리: 입출력 검증·폴백·Quality Gate), **Context**(AI에게 무엇을 보여줄지 설계: 컨텍스트 로딩 순서·불필요 정보 압축·에이전트별 격리), **Compound**(매 작업의 회고가 다음 작업의 입력이 되는 복리 루프)",
      "이 위키(허브)가 아래 3개 프로젝트(워커)를 관찰하고, 워커에서 검증된 패턴이 다시 위키에 기록되는 **양방향 지식 순환 구조** 운영",
      "git commit 전 자동 빌드 게이트, push 후 회고+솔루션 자동 생성 — 회고에 적힌 '다음 후보'가 다음 세션의 시작점이 되는 **Compound** 자동화",
    ],
  },
  {
    name: "Aidy",
    tagline: "1인 4-Agent 동시 관제 · iOS/Android/Server",
    stack: ["Spring Boot", "Tuist + TCA", "Jetpack Compose"],
    color: "#34d399",
    metrics: "4 Repos · 9/9 WO · 20R autoceo",
    bullets: [
      "1인이 **4개 AI 에이전트**(Architect/Server/iOS/Android)를 동시에 운용하여 3개 플랫폼을 병렬 개발 — API 명세 문서(api-contract.md)를 유일한 기준점으로 설정하고, AI가 이를 벗어나지 못하도록 **Harness** 적용",
      "AI 출력물을 2단계로 자동 검증 — 1차: API 명세와 필드명/타입/에러코드 라인별 대조, 2차: 3개 플랫폼 빌드+테스트+필드 동기화 확인. 20라운드 운영 중 검증 실패 초기 2건 → 이후 **0건**",
      "AI 응답의 5단계 품질 보정(JSON 파싱 → 타입 검증 → 재시도 → 오류 피드백 → 자동 채점)을 TypeScript에서 Kotlin으로 그대로 이식 — 언어가 바뀌어도 **Harness** 패턴은 재사용 가능함을 실증",
      "작업 완료마다 회고+솔루션+아키텍처 결정 기록을 자동 생성하고, 다음 작업이 이 문서를 읽고 시작하는 **Compound** 구조로 라운드마다 품질 상승",
    ],
  },
  {
    name: "MoneyFlow",
    tagline: "13개 AI 에이전트 적대적 토론 SaaS",
    stack: ["Next.js", "Supabase", "Claude/Gemini/GPT"],
    color: "#10b981",
    metrics: "13 Agents · 1,177 Tests · 3 Providers",
    bullets: [
      "13개 AI 에이전트가 서로 논쟁하며 투자 판단을 도출하는 파이프라인 — AI에 데이터를 넘기기 전 입력 검증, AI 응답의 모순 자동 차단(예: 강력 매수인데 신뢰도 30%), 실패 시 다른 AI 모델로 자동 전환하는 폴백 계층까지 **Harness**로 설계",
      "각 에이전트가 자기 전문 영역의 데이터만 보도록 격리 — 기술 분석은 차트만, 뉴스 에이전트는 뉴스만. 영역 밖 정보를 주면 환각이 증가한다는 걸 운영 데이터로 학습하여 **Context** 설계에 반영",
      "매 분석 사이클의 회고에 '다음에 할 일'을 명시 → 다음 세션이 그 목록을 그대로 입력으로 받아 실행. 실패한 시도도 솔루션 문서로 기록하여 같은 삽질을 반복하지 않는 **Compound** 복리 구조",
    ],
  },
  {
    name: "TaroSaju",
    tagline: "점술 SaaS · QA 100/100",
    stack: ["Next.js", "Supabase", "Playwright"],
    color: "#8b5cf6",
    metrics: "720 Tests · 65 E2E · 25 Rounds",
    bullets: [
      "25라운드 안전성 스프린트를 5라운드 단위로 끊어 운영 — 매 5라운드마다 회고→솔루션→다음 사이클 입력이 되는 **Compound** 루프. MoneyFlow에서 만든 인프라 패턴을 그대로 이식해 첫 라운드부터 높은 baseline에서 출발",
      "DB 보안 규칙(RLS) 자동 감사 테스트가 사람 수동 검토보다 누락 1건을 더 발견 — AI가 만든 코드를 사람이 아닌 **자동화 게이트가 검증**해야 한다는 **Harness** 원칙의 실효성을 데이터로 입증",
    ],
  },
];

const EDUCATION = [
  { title: "야곰 아카데미 코드 리뷰어", period: "2023 — 2024", note: "iOS 멘토링 및 코드 리뷰" },
  { title: "정보처리기사", period: "2023. 11", note: "" },
  { title: "야곰 아카데미 iOS 캠프 5기", period: "2022", note: "TDD · Clean Code · 멀티스레딩" },
  { title: "경기대학교 졸업", period: "2014 — 2021", note: "" },
];

/* ─────────────────────────── helpers ──────────────────────── */

function B({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? (
          <span key={i} className="text-text font-semibold">{p.slice(2, -2)}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function ResumePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* Mouse gradient follower */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.06), transparent 40%)`,
        }}
      />

      <main className="resume-container relative z-10 mx-auto max-w-[740px] px-6 pt-20 pb-32">

        {/* PDF Download */}
        <div data-hide-print className="flex justify-end mb-10">
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
            {/* Photo with glow */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-accent/20 via-transparent to-cat-agents/20 blur-sm" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile.jpg"
                alt="조민호"
                className="profile-photo relative w-[140px] h-[180px] rounded-xl object-cover border border-border/50"
              />
            </div>

            <div className="pt-2 min-w-0">
              <h1 className="font-display text-5xl font-black tracking-tight leading-[1.1] mb-1.5">
                {INFO.name}
              </h1>
              <p className="text-xl text-accent font-semibold tracking-wide mb-5">
                {INFO.title}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text/60">
                <span className="flex items-center gap-2">
                  <span className="opacity-40">&#9737;</span> {INFO.birthday}
                </span>
                <span className="flex items-center gap-2">
                  <span className="opacity-40">&#9993;</span> {INFO.email}
                </span>
                <span className="flex items-center gap-2">
                  <span className="opacity-40">&#9742;</span> {INFO.phone}
                </span>
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
            {INFO.summary.map((p, i) => (
              <p key={i} className="text-base text-text/80 leading-[1.85]">
                <B text={p} />
              </p>
            ))}
          </div>
        </header>

        {/* ═══════════ SKILLS ═══════════ */}
        <section className="mb-16">
          <SectionHead>Skills</SectionHead>
          <div className="space-y-4">
            {Object.entries(SKILLS).map(([cat, { items, color }]) => (
              <div key={cat} className="flex items-start gap-4">
                <span
                  className="mt-1.5 text-xs font-bold tracking-widest w-16 shrink-0"
                  style={{ color }}
                >
                  {cat}
                </span>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span
                      key={s}
                      className="skill-tag rounded-full px-3 py-1 text-sm text-text/70 border transition-colors hover:text-text/80"
                      style={{
                        borderColor: `${color}25`,
                        background: `${color}08`,
                      }}
                    >
                      {s}
                    </span>
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
            {WORK.map((w) => (
              <div
                key={w.company}
                className="work-card group rounded-xl p-6 -mx-6 transition-all hover:bg-surface/60 hover:shadow-[inset_0_1px_0_0_rgba(59,130,246,0.08)] hover:drop-shadow-lg"
              >
                {/* Period + company row */}
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold group-hover:text-accent transition-colors inline">
                      {w.company}
                    </h3>
                    <span className="text-sm text-text/50 ml-2">{w.role}</span>
                  </div>
                  <span className="text-sm text-text/50 font-code shrink-0">
                    {w.period}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-base text-text/70 leading-relaxed mb-4">
                  <B text={w.summary} />
                </p>

                {/* Highlights */}
                <ul className="space-y-2.5">
                  {w.highlights.map((h, i) => (
                    <li key={i} className="text-base text-text/70 leading-[1.75] relative pl-4 before:content-['▸'] before:absolute before:left-0 before:text-accent/40 before:text-xs before:top-[3px]">
                      <B text={h} />
                    </li>
                  ))}
                </ul>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {w.skills.map((s) => (
                    <span key={s} className="rounded-full bg-accent/10 text-accent/70 px-3 py-1 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ PROJECTS ═══════════ */}
        <section className="mb-16">
          <SectionHead>Projects</SectionHead>
          <div className="space-y-4">
            {SIDE_PROJECTS.map((p) => (
              <div
                key={p.name}
                className="side-project-card group rounded-xl p-6 -mx-6 transition-all hover:bg-surface/60 hover:shadow-[inset_0_1px_0_0_rgba(59,130,246,0.08)] hover:drop-shadow-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-display text-base font-bold group-hover:text-accent transition-colors">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 -translate-y-[1px]" style={{ background: p.color }} />
                    {p.name}
                    <span className="font-normal text-text/50 ml-2 text-base">
                      {p.tagline}
                    </span>
                  </h4>
                  <span className="text-xs font-code shrink-0" style={{ color: `${p.color}90` }}>
                    {p.metrics}
                  </span>
                </div>

                <ul className="space-y-1.5 mb-3">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="text-base text-text/70 leading-[1.75] relative pl-4 before:content-['▸'] before:absolute before:left-0 before:text-xs before:top-[3px]" style={{ "--tw-before-color": p.color } as React.CSSProperties}>
                      <span className="absolute left-0 top-[3px] text-xs opacity-40" style={{ color: p.color }}>▸</span>
                      <span className="pl-0"><B text={b} /></span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full px-2.5 py-0.5 text-xs text-text/50 border"
                      style={{ borderColor: `${p.color}20`, background: `${p.color}06` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ EDUCATION ═══════════ */}
        <section>
          <SectionHead>Education &amp; Activity</SectionHead>
          <div className="space-y-5">
            {EDUCATION.map((e) => (
              <div key={e.title} className="flex items-baseline justify-between gap-4">
                <div>
                  <span className="text-base font-medium">{e.title}</span>
                  {e.note && <span className="text-sm text-text/45 ml-2">{e.note}</span>}
                </div>
                <span className="text-sm text-text/45 font-code shrink-0">
                  {e.period}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

/* ─────────────────────── Section Head ─────────────────────── */

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text/45 mb-8 sticky top-14 bg-bg/80 backdrop-blur-sm py-3 -mx-6 px-6 z-20">
      {children}
    </h2>
  );
}
