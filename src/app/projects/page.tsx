import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe Coding",
  description: "AI가 자유롭게 달릴 수 있는 환경을 만든다. 코드가 아니라 코드를 만드는 시스템 — Compound / Context / Harness Engineering으로 운영한 두 프로젝트.",
};

// ─────────────────────────────────────────────────────────────
// FOUNDATION — 두 프로젝트 모두에 깔린 AI 운영 토대
// ─────────────────────────────────────────────────────────────

const FOUNDATION_COMPOUND = [
  {
    code: "C-1",
    title: "Pre-commit QA Gate",
    detail: ".claude/settings.json의 PreToolUse 훅이 git commit 직전 vitest + next build를 자동 실행. 하나라도 실패하면 커밋 자체가 차단된다. AI가 \"통과했다고 생각함\"으로 잘못 판단할 여지를 구조적으로 제거.",
  },
  {
    code: "C-2",
    title: "Post-push /compound 리마인더",
    detail: "git push 직후 PostToolUse 훅이 \"/compound 실행\" 메시지를 자동 출력. 사람의 기억력 대신 훅이 다음 단계를 강제. 회고가 누락되는 것 자체를 시스템이 막는다.",
  },
  {
    code: "C-3",
    title: "/compound 슬래시 커맨드",
    detail: "CHANGELOG.md + docs/retros/ + docs/solutions/ + 메모리 업데이트를 한 번에 처리. 회고 → 솔루션 → 메모리 → 다음 사이클 입력으로 이어지는 루프를 5분 안에 닫는다.",
  },
  {
    code: "C-4",
    title: "Retro \"다음 후보\" → 다음 사이클의 입력",
    detail: "매 회고의 마지막 섹션에 \"다음에 할 만한 것\" 후보를 명시. 다음 세션은 그 후보를 그대로 입력으로 받는다. 사람의 to-do list가 아니라 *문서 기반 큐*. v0.9.10 → v0.9.11에서 ROI 한 사이클 만에 검증됨.",
  },
  {
    code: "C-5",
    title: "5 commit batched push",
    detail: "Vercel 무료 100 deploys/day 제한을 넘기지 않기 위해 커밋은 자유롭게, push는 스프린트 단위로 모아서. 배포 비용 자체가 아키텍처 결정에 들어간다.",
  },
];

const FOUNDATION_CONTEXT = [
  {
    code: "CE-1",
    title: "Layered Context Loading",
    detail: "매 세션 시작 시 CLAUDE.md → MEMORY.md → git log -10 → PLAN.md → git status 순서로 컨텍스트 주입. \"이전 세션이 어디까지 했는지\"를 사람의 기억이 아닌 *파일*에서 복원.",
  },
  {
    code: "CE-2",
    title: "Signal-to-Noise 압축",
    detail: "2000줄 파일 전체를 절대 읽지 않음. offset/limit으로 필요한 줄 범위만, 타입/인터페이스 우선(정보 밀도 3-5배), 마크다운 테이블 > JSON. 컨텍스트 창 유한성을 디자인 제약으로 받아들임.",
  },
  {
    code: "CE-3",
    title: "Search Before Assume",
    detail: "\"비슷한 게 있을 것 같다\"는 추측 금지. Grep/Glob으로 먼저 확인. v0.9.11 retro의 grep 한 줄(\"reflection\" 사용처 0건)이 그 자체로 안티패턴 후보를 즉시 확정한 사례.",
  },
  {
    code: "CE-4",
    title: "Write-back으로 다음 세션에 전달",
    detail: "결정·학습은 즉시 CLAUDE.md / 메모리 / docs/retros 에 기록. 같은 사고를 두 번째 세션에서 다시 발견하지 않도록 *문서가 곧 채널*.",
  },
  {
    code: "CE-5",
    title: "Pattern Following",
    detail: "새 기능 추가 시 grep으로 유사 기능 먼저 찾고 그 패턴을 따라 만든다. \"더 나은 방법\"이 있어도 일관성 우선 — 다음 에이전트가 읽을 수 있어야 함.",
  },
  {
    code: "CE-6",
    title: "에이전트별 컨텍스트 격리",
    detail: "멀티 에이전트에서 각자 자기 전문 영역만 본다. 기술 분석 에이전트는 기술 지표만, 뉴스 에이전트는 뉴스만. 자기 영역 밖의 데이터를 보면 환각이 늘어난다는 걸 운영 데이터로 학습.",
  },
];

const FOUNDATION_HARNESS = [
  {
    code: "HE-1",
    title: "입력 검증 — 쓰레기 in, 쓰레기 out",
    detail: "AI에 데이터를 넘기기 전 타입/범위/null/길이 검증. 잘못된 입력을 받지 않는 게 잘못된 출력을 사후에 잡는 것보다 100배 싸다.",
  },
  {
    code: "HE-2",
    title: "출력 검증 — AI 말 맹신 금지",
    detail: "JSON 스키마 / 숫자 합리적 범위 / 내부 일관성 / 입력 데이터와의 일치 검증. \"STRONG_BUY인데 confidence 30%\" 같은 모순을 자동 차단. AI는 자신감 있게 틀린다.",
  },
  {
    code: "HE-3",
    title: "Bounded Retry + 폴백 계층",
    detail: "재시도 → 대체 모델(Gemini→Claude→GPT) → 경량 처리 → 안전 기본값. 같은 방법 2회 실패 시 다른 접근법으로 강제 전환. \"에러를 삼키고 잘못된 결과 반환\"은 절대 금지.",
  },
  {
    code: "HE-4",
    title: "Conditional Routing",
    detail: "단순 작업 → 저비용 모델, 복잡한 판단 → 고비용 모델, 합의 높으면 토론 축소, 불확실하면 심층 분석. 라우팅 자체가 비용 제어이자 품질 제어.",
  },
  {
    code: "HE-5",
    title: "5단계 Quality Gate",
    detail: "Read → Edit → Build(0 에러) → Browser QA(최소 3페이지) → Commit. 단계 건너뛰기 불가. 게이트 자체가 사람 검토보다 더 꼼꼼한 경우가 많음(타로사주 R21에서 RLS 정적 회귀 테스트가 수동 감사를 능가).",
  },
  {
    code: "HE-6",
    title: "비용 인식 — API 콜 = 돈, 배포 = 한도",
    detail: "maxTokens 적정화(4096 → 800-1500), 프롬프트 캐싱(반복 시스템 메시지 90% 할인), 동일 요청 캐싱, 5 커밋 묶어 1 push. \"무제한\"은 존재하지 않는다.",
  },
  {
    code: "HE-7",
    title: "실패도 영구 자산화",
    detail: "타로사주 R23의 eslint 9→10 업그레이드 실패는 docs/maintenance/deferred-upgrades.md로 박제됨. 다음 시도자가 같은 조사를 반복하지 않는다. *실패도 compound 자산*이라는 것이 핵심 통찰.",
  },
];

// ─────────────────────────────────────────────────────────────
// PROJECTS — 같은 토대 위에서 각 프로젝트가 만든 AI 환경
// ─────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    name: "Mino MoneyFlow",
    url: "https://mino-moneyflow.vercel.app/",
    color: "#10b981",
    period: "2026.04 ~",
    version: "v0.9.11",
    tagline: "13개 AI 에이전트가 적대적 토론으로 투자 판단을 도출하는 SaaS — 그러나 진짜 작업은 에이전트들이 서로 견제하도록 만든 *환경 설계*에 있다.",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude", "Gemini", "GPT", "Upstash Redis"],
    metrics: {
      tests: 678,
      agents: 14,
      providers: 3,
      compoundCycles: "13+ (PM v2 Phase 1~5 + 안전성 R1~R5 × 다회차)",
    },
    environment: [
      {
        title: "Multi-Agent 적대적 토론 파이프라인",
        detail: "4 병렬 분석가(기술/펀더멘털/뉴스/매크로) → Bull/Bear 토론 → Judge → Trader → Risk → CIO → Devil's Advocate. 단일 에이전트가 결론을 내리는 게 아니라 *논쟁하는 구조* 자체가 환각을 줄인다. 토론 에이전트는 반드시 상대방의 가장 강한 논거(Steelman)를 먼저 제시한 후에야 반박 가능 — 허수아비 논증을 구조로 차단.",
      },
      {
        title: "Multi-Provider Circuit Breaker",
        detail: "Claude 429가 피크 시간에 10분 3회 발생. Circuit Breaker 없으면 서비스 중단. 3회 연속 실패 → 2분 쿨다운 → 반개방에서 1회 재시도. 에이전트별로 최적 모델 라우팅(데이터 분석→Gemini, 비판적 분석→Claude, 토론→GPT). 프로바이더별 독립 상태 관리.",
      },
      {
        title: "Memory-Based Learning Loop",
        detail: "BM25로 과거 유사 트레이딩을 검색해서 Bull/Bear 토론에 교훈을 주입. 단, \"현재 데이터를 우선하라\" 앵커링 방지 프롬프트를 항상 같이 넣는다. 에이전트가 자기 과거를 보고 학습하는 루프 — *AI 시스템이 시간을 가로질러 자기 자신과 협업*.",
      },
      {
        title: "Trading Reflection 회고 자동화",
        detail: "trade_memories.reflection + lessons_learned 필드 — 분석 결과의 1주/1달 후 alpha 측정, was_correct 여부와 함께 회고를 자동 생성. 적중/빗나감 색상 분기로 사용자에게도 노출. AI가 자기 트레이딩을 *돌아보고 다음 분석에 반영*하는 두 번째 루프.",
      },
      {
        title: "Confidence Calibration (3 버킷 + 단조성)",
        detail: "lib/portfolio/calibration.ts: confidence를 low(<60)/mid(60-75)/high(≥75) 3 버킷으로 분류해서 실제 alpha와 비교. 단조성 검사로 \"높은 confidence가 정말 더 높은 성과를 내는지\"를 측정. AI 자신감과 실제 적중률의 간극을 데이터로 추적.",
      },
      {
        title: "Layered Quality Guards 프롬프트 조립",
        detail: "공통 가드(베이스레이트, 정량적 근거 필수) → 역할별 가드(PM에게만 프리모템, 펀더멘탈에게만 기대치 갭) → 상황별 가드(모멘텀 다이버전스). 3단 레이어로 시스템 프롬프트를 조립 + Claude cache_control: ephemeral로 90% 할인.",
      },
    ],
    cycles: [
      {
        title: "PM v2 Phase 1~5 — 백엔드와 UI 가시화를 한 사이클 안에",
        detail: "v0.9.7 retro에서 검증한 \"한 사이클은 백엔드만 하지 말고 UI 가시화까지\" 패턴이 v0.9.8/9/10에 모두 적용됨. 매 사이클 끝에 *유저가 보이는 결과물*. 순수 로직은 lib/portfolio/ 모듈로 분리해서 테스트 100%, UI 컴포넌트는 모듈 호출만 — 테스트 부담 분리.",
      },
      {
        title: "안티패턴 발견 → 즉시 솔루션 → 다음 사이클 입력 (Compound Learning 실증)",
        detail: "v0.9.9에서 \"DB 저장 + UI 미사용 필드\" 안티패턴 1건 발견 → docs/solutions/workflow/2026-04-11-db-stored-ui-unused-fields.md 작성 → 메모리에 박제 → v0.9.10에서 두 번째 사례를 *retro가 가이드한 대로* 즉시 발견 → v0.9.11에서 세 번째 케이스 청소(reflection+lessons_learned 가시화). retro→solution→memory→다음 사이클 입력 회로가 의도대로 작동한 첫 사례.",
      },
      {
        title: "안전성 5라운드 × 여러 사이클 (currency, react-patterns, runtime-errors)",
        detail: "R1 → R5(=compound) 5라운드 × 다회차로 환율 fetch 정리, useEffect race condition cancellation token, useQuery r.ok 가드, mutation onError 누락 차단, 외부 fetch timeout 등을 한 묶음씩 처리. 매 사이클의 R5는 compound 단계 — 회고와 솔루션이 다음 사이클의 입력이 됨.",
      },
    ],
    retrospective:
      "이 프로젝트의 진짜 산출물은 \"트레이딩 분석\"이 아니라 \"AI 에이전트들이 서로 견제하도록 만든 환경\"이다. 13개 에이전트를 일렬로 호출하는 건 누구나 할 수 있다. 어려운 건 *어떤 에이전트가 어떤 데이터만 봐야 환각이 줄어드는지*, *어느 시점에 토론을 끊어야 비용이 폭주하지 않는지*, *어느 confidence 구간이 실제로 신뢰할 만한지*를 데이터로 측정하면서 환경을 조정하는 일이다.\n\nCompound Engineering이 가장 강하게 와닿은 순간은 v0.9.10 → v0.9.11이었다. v0.9.10 retro에 \"DB 저장 + UI 미사용 필드 청소\"를 다음 사이클 후보로 명시해뒀더니, 다음 세션이 그 후보를 그대로 입력으로 받아 reflection+lessons_learned 가시화를 만들었다. 사람의 to-do list가 아니라 *문서 기반 큐*. 메모리 시스템의 ROI가 한 사이클 만에 검증된 것.\n\n가장 큰 교훈: 에이전트를 1개 더 추가하는 것보다, 에이전트가 *자기 결과를 회고하고 다음 분석에 반영하는 루프*를 만드는 게 훨씬 큰 변화를 만든다. 14개에서 멈춘 건 비용 상한($5/day) 때문이지만, 사실 그 이후는 \"몇 개를 더 붙이느냐\"가 아니라 \"이미 있는 에이전트들이 시간을 가로질러 어떻게 학습하느냐\"가 본질이었다.",
  },
  {
    name: "Mino TaroSaju",
    url: "https://mino-tarosaju.vercel.app/",
    color: "#8b5cf6",
    period: "2026.04 ~",
    version: "R25 (안전성 5차수)",
    tagline: "6개 존 점술 SaaS — 그러나 진짜 자랑할 만한 건 25라운드 안전성 스프린트로 12축 → 15축까지 확장된 *AI 운영 인프라 baseline*.",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude Haiku", "motion/react", "Sentry", "Playwright"],
    metrics: {
      tests: 565,
      rounds: 25,
      compoundCycles: 5,
      stabilityAxes: "12 → 15",
    },
    environment: [
      {
        title: "RLS 정적 감사 + 회귀 테스트 — AI가 사람보다 꼼꼼하게",
        detail: "Supabase service role key 없이도 supabase/migrations/*.sql을 regex로 parse해서 \"UPDATE WITH CHECK 누락\" 같은 RLS 이슈를 정적 분석으로 발견. R21에서 사람이 수동 감사로 2건(user_profiles, user_consents) 잡은 뒤 회귀 테스트를 작성했더니, 테스트가 *3번째 이슈*(push_subscriptions)를 자동으로 잡아냄. **자동화 게이트가 사람보다 꼼꼼한 경우가 있다**는 것을 운영 데이터로 입증.",
      },
      {
        title: "Sentry + Web Vitals + Lighthouse CI 3중 관측",
        detail: "R11에서 Sentry @sentry/nextjs 정식 도입(DSN optional). R16에서 Web Vitals를 A/B variant 태그와 함께 커스텀 리포터로 수집. R18에서 Lighthouse CI를 GitHub Actions에 회귀 warn gate로 추가. 사람이 매번 보지 않아도 *변화가 발생한 순간*에 알림이 가는 구조.",
      },
      {
        title: "Playwright E2E + GitHub Actions (인증 회귀 차단)",
        detail: "R12-R14에서 인증 5 시나리오(ISSUE-001 회귀 방지) + Critical flow 6개(사주/타로/일일운세 + ErrorState) E2E 인프라 구축. R15에서 GitHub Actions Playwright 통합. 모바일 Safari PKCE 쿠키 사고 같은 *환경 의존 버그*를 다시 만들지 않기 위한 가드.",
      },
      {
        title: "Phase 1/2 점진적 AI 도입 + 자동 폴백",
        detail: "Phase 1은 템플릿 기반(API 키 불필요, 무료). Phase 2에서 Claude Haiku로 업그레이드. API 실패 시 자동으로 Phase 1 템플릿으로 fallback — 사용자는 차이를 모른다. AI를 켜고 끄는 스위치가 아니라 *AI가 부드럽게 degrade*하는 환경.",
      },
      {
        title: "Zod 입력 검증 + env runtime 검증 + Logger Error Boundary",
        detail: "R6-R8에서 API 7 routes에 Zod 입력 검증, email HTML escape, env 변수 runtime 검증(process.env.X! 제거), 프로덕션 에러 리포팅 logger 확장 + error boundary 훅까지 한 묶음으로 박음. AI가 만든 코드라도 *경계 검증은 시스템 차원*에서 강제.",
      },
      {
        title: "Deferred Upgrades 트래킹 — 실패도 자산",
        detail: "R23에서 eslint 9→10 업그레이드 시도 실패(upstream 블로커: eslint-plugin-react 호환 안 됨). 그 실패 자체를 docs/maintenance/deferred-upgrades.md에 박제. 다음 시도자가 같은 조사를 반복하지 않음. **실패도 compound 자산이라는 것**이 R23 한 라운드의 진짜 메시지.",
      },
    ],
    cycles: [
      {
        title: "안전성 1차(R1-5) — Rate limit / DB index / Security headers / ISR",
        detail: "초기 baseline. 미들웨어 rate limiter, Supabase index 감사, security headers, ISR 캐싱, rateLimit 회귀 테스트. 이 baseline이 다음 4 사이클의 출발점이 됨.",
      },
      {
        title: "안전성 2차(R6-10) — Boundary Validation",
        detail: "Zod, env, logger, API tests, dep updates. 모든 *시스템 경계*에 검증 게이트 박기. 새 비즈니스 로직이 아니라 *경계의 일관성*을 통일하는 사이클.",
      },
      {
        title: "안전성 3차(R11-15) — Observability + E2E",
        detail: "Sentry, Playwright, GitHub Actions CI. 사람이 매번 보지 않아도 변화를 감지하는 구조. ISSUE-001 인증 회귀 방지 5 시나리오 E2E.",
      },
      {
        title: "안전성 4차(R16-20) — Performance Monitoring",
        detail: "Web Vitals + variant 태깅, bundle baseline, Lighthouse CI, 이미지 전략 감사, zone font display:swap. \"지금 빠른가\"가 아니라 \"지금부터 느려지면 알 수 있는가\"를 만드는 사이클.",
      },
      {
        title: "안전성 5차(R21-25) — Security + Maintenance",
        detail: "RLS 16 테이블 정적 감사 + WITH CHECK fix 3건 + 회귀 테스트, framer-motion → motion/react migrate(191 files, sed 일괄 + 테스트가 회귀 감지), eslint 10 시도→실패→박제, @anthropic-ai/sdk 0.82→0.87. *수동 감사 + 자동 테스트 둘 다 필요한 이유*를 R21이 한 사례로 입증.",
      },
    ],
    retrospective:
      "이 프로젝트의 자랑은 콘텐츠가 아니라 *Round 번호*다. R1부터 R25까지 25라운드를 돌면서, 매 5라운드마다 compound 단계로 회고와 솔루션을 박았다. 각 라운드의 마지막은 항상 \"다음에 할 만한 후보\" 목록을 남기고, 다음 사이클은 그 목록을 입력으로 받는다. *사람의 to-do list가 아니라 문서 기반 큐*.\n\nMoneyFlow에서 쌓은 인프라 패턴이 그대로 이식돼 첫 라운드부터 baseline 위에서 시작할 수 있었다. Circuit Breaker 패턴, Quality Gate 5단계, env runtime 검증, 5 commit batched push, 회고 포맷, 솔루션 카테고리 디렉터리 — 전부 한 번 만들어두니 두 번째 프로젝트는 \"이식\"으로 끝났다. *이게 Compound Engineering이 말하는 \"다음 작업이 더 쉬워진다\"의 실체*. \"다른 프로젝트도 더 쉬워진다\"까지 확장된다는 게 한 단계 더 큰 발견이었다.\n\n가장 중요한 메타 학습: AI가 만든 결과물의 품질을 사람이 매번 검토하는 건 확장 불가능하다. 그 자리를 *자동화 게이트*가 메워야 한다. R21의 RLS 회귀 테스트가 사람 감사보다 더 꼼꼼하게 누락을 잡은 사례가 결정적이었다 — 사람 검토는 \"있으면 좋은 것\"이지 \"기댈 수 있는 것\"이 아니다. AI가 자유롭게 달리도록 하려면, 사람의 시선이 아니라 *테스트와 훅과 정적 분석*이 울타리 역할을 해야 한다.",
  },
];

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-bg px-3 py-1.5 text-center">
      <div className="font-data text-lg font-semibold text-text">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function PrincipleCard({
  code,
  title,
  detail,
  accentClass,
}: {
  code: string;
  title: string;
  detail: string;
  accentClass: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`rounded px-1.5 py-0.5 text-xs font-bold font-code ${accentClass}`}>
          {code}
        </span>
        <h4 className="font-display text-sm font-bold text-text">{title}</h4>
      </div>
      <p className="text-xs text-muted leading-relaxed">{detail}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Page header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl font-black tracking-tight mb-3">
            Vibe Coding
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-4">
            코드가 아니라 <span className="text-text font-semibold">환경</span>을 만든다.
            AI가 자유롭게 달릴 수 있는 울타리를 치고, 매 사이클이 다음 사이클의 자산이 되도록 시스템을 쌓는다.
          </p>
          <div className="rounded-[var(--radius-md)] border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm text-text leading-relaxed">
              <span className="font-bold text-accent">Compound Engineering</span> · <span className="font-bold text-accent">Context Engineering</span> · <span className="font-bold text-accent">Harness Engineering</span> 세 가지 방법론 위에서 운영.
              두 프로젝트 모두 동일한 토대를 공유하고, MoneyFlow에서 검증된 패턴이 TaroSaju로 그대로 이식되며, 다시 그 자산이 다음 프로젝트로 흘러간다.
              사람이 코드 한 줄을 직접 치는 비중은 거의 0에 수렴하고, 대부분의 시간은 <span className="font-semibold">에이전트가 안전하게 달릴 환경을 조정하는 일</span>에 들어간다.
            </p>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────── */}
        {/* FOUNDATION                                             */}
        {/* ───────────────────────────────────────────────────── */}
        <section className="mb-20">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-4 w-4 rounded-full bg-accent" />
              <h2 className="font-display text-3xl font-black tracking-tight">
                Foundation
              </h2>
              <span className="text-sm text-muted font-code ml-auto">
                두 프로젝트 공유 토대
              </span>
            </div>
            <p className="text-base text-muted leading-relaxed">
              모든 프로젝트가 같은 인프라 위에서 시작한다.
              훅으로 강제되는 QA 게이트, 슬래시 커맨드로 자동화된 회고 루프, 매 세션 자동 로드되는 AI 협업 헌장.
              이 토대 자체가 가장 큰 compound 자산이다.
            </p>
          </div>

          {/* Compound Engineering 워크플로 */}
          <div className="mb-10">
            <h3 className="font-display text-xl font-bold mb-2">
              <span className="text-accent">Compound</span> Engineering — 회고가 다음 사이클의 입력이 되는 루프
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-4">
              <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">.claude/settings.json</code>의 훅이 commit/push 양쪽을 강제하고,
              <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded ml-1">/compound</code> 슬래시 커맨드가 회고·솔루션·메모리 업데이트를 한 번에 처리한다.
              매 회고 끝의 &ldquo;다음 후보&rdquo;가 다음 세션의 입력 큐가 된다.
            </p>
            <div className="space-y-3">
              {FOUNDATION_COMPOUND.map((c) => (
                <PrincipleCard
                  key={c.code}
                  code={c.code}
                  title={c.title}
                  detail={c.detail}
                  accentClass="bg-accent/10 text-accent"
                />
              ))}
            </div>
          </div>

          {/* Context Engineering */}
          <div className="mb-10">
            <h3 className="font-display text-xl font-bold mb-2">
              <span className="text-cat-prompt">Context</span> Engineering — AI에게 무엇을 보여줄 것인가
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-4">
              <span className="italic">&ldquo;AI는 보여준 만큼만 안다. 잘 보여주면 시니어, 못 보여주면 인턴.&rdquo;</span>{" "}
              매 세션 시작 시 정해진 순서로 컨텍스트를 주입하고, 노이즈를 배제하고, 패턴을 따른다.
              이 6원칙이 두 프로젝트의 <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">AI-AGENT-GUIDE.md</code>에 박혀 있어 모든 세션이 동일한 출발점을 갖는다.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {FOUNDATION_CONTEXT.map((c) => (
                <PrincipleCard
                  key={c.code}
                  code={c.code}
                  title={c.title}
                  detail={c.detail}
                  accentClass="bg-cat-prompt/10 text-cat-prompt"
                />
              ))}
            </div>
          </div>

          {/* Harness Engineering */}
          <div className="mb-4">
            <h3 className="font-display text-xl font-bold mb-2">
              <span className="text-cat-rag">Harness</span> Engineering — AI에게 어떤 울타리를 칠 것인가
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-4">
              <span className="italic">&ldquo;말(Horse)에 하네스(Harness)를 씌워서 원하는 방향으로 안전하게 달리게 한다.&rdquo;</span>{" "}
              범위 제한 + 검증 + 폴백 + 라우팅 + 비용 제어. 7원칙이 모든 AI 호출과 모든 커밋에 적용된다.
              단계 건너뛰기 불가, 폴백 없는 호출 금지, 검증 없는 출력 금지.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {FOUNDATION_HARNESS.map((h) => (
                <PrincipleCard
                  key={h.code}
                  code={h.code}
                  title={h.title}
                  detail={h.detail}
                  accentClass="bg-cat-rag/10 text-cat-rag"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────── */}
        {/* PROJECTS                                               */}
        {/* ───────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="font-display text-3xl font-black tracking-tight mb-2">
            Projects
          </h2>
          <p className="text-base text-muted leading-relaxed">
            같은 토대 위에서 각 프로젝트가 만든 AI 운영 환경.
            기능 목록이 아니라 <span className="text-text font-semibold">에이전트가 어떻게 안전하게 달리는가</span>의 기록.
          </p>
        </div>

        <div className="space-y-16">
          {PROJECTS.map((project) => (
            <article key={project.name}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: project.color }}
                />
                <h2 className="font-display text-3xl font-black tracking-tight">
                  {project.name}
                </h2>
                <span className="text-sm text-muted font-code ml-auto">
                  {project.period} · {project.version}
                </span>
              </div>

              <p className="text-base text-text leading-relaxed mb-5">{project.tagline}</p>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-surface border border-border px-4 py-2 text-sm font-medium text-accent hover:border-accent transition-colors mb-6"
              >
                {project.url.replace("https://", "")} →
              </a>

              {/* AI 운영 지표 */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(project.metrics).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    tests: "테스트",
                    agents: "에이전트",
                    providers: "프로바이더",
                    rounds: "라운드",
                    compoundCycles: "Compound 사이클",
                    stabilityAxes: "안정성 축",
                  };
                  return <StatBadge key={key} label={labels[key] || key} value={val} />;
                })}
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-surface px-3 py-1 text-xs text-muted font-code border border-border"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* 환경 조성 */}
              <section className="mb-8">
                <h3 className="font-display text-xl font-bold mb-2">
                  AI가 안전하게 달리는 환경
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Foundation 위에 이 프로젝트만의 특화 환경을 추가로 깔았다.
                </p>
                <div className="space-y-3">
                  {project.environment.map((e, i) => (
                    <div
                      key={i}
                      className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                      style={{ borderLeftColor: project.color, borderLeftWidth: 3 }}
                    >
                      <h4 className="font-display text-sm font-bold text-text mb-2">
                        {e.title}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed">{e.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 사이클 흐름 */}
              <section className="mb-8">
                <h3 className="font-display text-xl font-bold mb-2">사이클 흐름</h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  매 사이클의 마지막 단계는 항상 compound — 회고와 솔루션이 다음 사이클의 입력이 된다.
                </p>
                <div className="space-y-3">
                  {project.cycles.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                    >
                      <div className="flex items-baseline gap-2 mb-2">
                        <span
                          className="font-code text-xs font-bold"
                          style={{ color: project.color }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h4 className="font-display text-sm font-bold text-text">{c.title}</h4>
                      </div>
                      <p className="text-xs text-muted leading-relaxed pl-6">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI 운영 회고 */}
              <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
                <h3 className="font-display text-xl font-bold mb-3">AI 운영 회고</h3>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {project.retrospective}
                </p>
              </section>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
