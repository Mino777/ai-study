import { Header } from "@/components/header";
import { ProjectsPageClient } from "@/components/projects-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe Coding",
  description: "AI가 자유롭게 달릴 수 있는 환경을 만든다. 코드가 아니라 코드를 만드는 시스템 — Compound / Context / Harness Engineering으로 운영한 네 프로젝트.",
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
    detail: "타로사주 R23의 eslint 9→10 업그레이드 실패는 docs/maintenance/deferred-upgrades.md로 기록됨. 다음 시도자가 같은 조사를 반복하지 않는다. *실패도 compound 자산*이라는 것이 핵심 통찰.",
  },
  {
    code: "HE-8",
    title: "Spec-First Multi-Agent Orchestration",
    detail: "Aidy에서 검증. api-contract.md가 source of truth → 4개 AI 에이전트가 독립 구현 → Gate 1(스펙 준수) + Gate 2(통합 빌드+크로스 플랫폼 필드 동기화)로 검증. 코드가 아니라 *문서*가 진실의 원천. 20라운드 autoceo에서 Gate 1 FAIL 초기 2건 → 이후 0건.",
  },
];

// ─────────────────────────────────────────────────────────────
// PROJECTS — 같은 토대 위에서 각 프로젝트가 만든 AI 환경
// ─────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    name: "Mino MoneyFlow",
    category: "moneyflow" as const,
    url: "https://mino-moneyflow.vercel.app/",
    color: "#10b981",
    period: "2026.04 ~",
    version: "v0.9.44",
    tagline: "13개 AI 에이전트가 적대적 토론으로 투자 판단을 도출하는 SaaS — 그러나 진짜 작업은 에이전트들이 서로 견제하도록 만든 *환경 설계*에 있다.",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude", "Gemini", "GPT", "Upstash Redis"],
    metrics: {
      tests: 1177,
      agents: 13,
      providers: 3,
      compoundCycles: "20+ (PM v2 + 안전성 + Harness Journal 012-018)",
      smokeTests: 19,
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
      {
        title: "Runtime Validation 5 Layer (Journal 012-018)",
        detail: "10/10 에이전트에 Layer 1-4 적용 완료. JSON 파싱 → type guard 검증 → retry → instruction augmentation. validator 실패 시 구체적 오류를 프롬프트에 추가해서 LLM이 자기 출력을 교정. Zod 대신 순수 TypeScript type guard 선택 — 동시 세션 lock file 충돌 방지 + 기존 패턴 일관성.",
      },
      {
        title: "LLM-as-a-Judge 품질 자동 측정",
        detail: "분석 완료 후 Gemini Flash로 4차원 채점(data_accuracy, logic_consistency, risk_awareness, actionability). fire-and-forget으로 비차단 실행, DB에 quality_score 저장. 프롬프트 A/B 테스트의 정량적 근거.",
      },
    ],
    cycles: [
      {
        title: "PM v2 Phase 1~5 — 백엔드와 UI 가시화를 한 사이클 안에",
        detail: "v0.9.7 retro에서 검증한 \"한 사이클은 백엔드만 하지 말고 UI 가시화까지\" 패턴이 v0.9.8/9/10에 모두 적용됨. 매 사이클 끝에 *유저가 보이는 결과물*. 순수 로직은 lib/portfolio/ 모듈로 분리해서 테스트 100%, UI 컴포넌트는 모듈 호출만 — 테스트 부담 분리.",
      },
      {
        title: "안티패턴 발견 → 즉시 솔루션 → 다음 사이클 입력 (Compound Learning 실증)",
        detail: "v0.9.9에서 \"DB 저장 + UI 미사용 필드\" 안티패턴 1건 발견 → docs/solutions/workflow/2026-04-11-db-stored-ui-unused-fields.md 작성 → 메모리에 기록 → v0.9.10에서 두 번째 사례를 *retro가 가이드한 대로* 즉시 발견 → v0.9.11에서 세 번째 케이스 청소(reflection+lessons_learned 가시화). retro→solution→memory→다음 사이클 입력 회로가 의도대로 작동한 첫 사례.",
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
    category: "tarosaju" as const,
    url: "https://mino-tarosaju.vercel.app/",
    color: "#8b5cf6",
    period: "2026.04 ~",
    version: "QA 100/100 · 수익화 준비 완료",
    tagline: "6개 존 점술 SaaS — 78장 타로 + 11종 심리 테스트 + AI 상담. 25라운드 안전성 스프린트로 인프라 baseline을 확장하고, Phase A~D 단계별 수익화 게이트를 정의한 프로덕트.",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude Haiku", "motion/react", "Sentry", "Playwright"],
    metrics: {
      tests: 720,
      e2eTests: 65,
      rounds: 25,
      qaScore: "100/100",
      tarotCards: 78,
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
        detail: "R23에서 eslint 9→10 업그레이드 시도 실패(upstream 블로커: eslint-plugin-react 호환 안 됨). 그 실패 자체를 docs/maintenance/deferred-upgrades.md에 기록. 다음 시도자가 같은 조사를 반복하지 않음. **실패도 compound 자산이라는 것**이 R23 한 라운드의 진짜 메시지.",
      },
      {
        title: "LLM-as-a-Judge 품질 자동 측정",
        detail: "fortune/tarot-chat 응답 완료 후 Haiku로 4차원 채점(domain_accuracy, empathy, specificity, safety). 명리학적 근거, 공감 어투, 구체적 조언, 위험 발언 배제를 자동 평가. fire-and-forget.",
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
        detail: "RLS 16 테이블 정적 감사 + WITH CHECK fix 3건 + 회귀 테스트, framer-motion → motion/react migrate(191 files, sed 일괄 + 테스트가 회귀 감지), eslint 10 시도→실패→기록, @anthropic-ai/sdk 0.82→0.87. *수동 감사 + 자동 테스트 둘 다 필요한 이유*를 R21이 한 사례로 입증.",
      },
    ],
    retrospective:
      "이 프로젝트의 자랑은 콘텐츠가 아니라 *Round 번호*다. R1부터 R25까지 25라운드를 돌면서, 매 5라운드마다 compound 단계로 회고와 솔루션을 박았다. 각 라운드의 마지막은 항상 \"다음에 할 만한 후보\" 목록을 남기고, 다음 사이클은 그 목록을 입력으로 받는다. *사람의 to-do list가 아니라 문서 기반 큐*.\n\nMoneyFlow에서 쌓은 인프라 패턴이 그대로 이식돼 첫 라운드부터 baseline 위에서 시작할 수 있었다. Circuit Breaker 패턴, Quality Gate 5단계, env runtime 검증, 5 commit batched push, 회고 포맷, 솔루션 카테고리 디렉터리 — 전부 한 번 만들어두니 두 번째 프로젝트는 \"이식\"으로 끝났다. *이게 Compound Engineering이 말하는 \"다음 작업이 더 쉬워진다\"의 실체*. \"다른 프로젝트도 더 쉬워진다\"까지 확장된다는 게 한 단계 더 큰 발견이었다.\n\n가장 중요한 메타 학습: AI가 만든 결과물의 품질을 사람이 매번 검토하는 건 확장 불가능하다. 그 자리를 *자동화 게이트*가 메워야 한다. R21의 RLS 회귀 테스트가 사람 감사보다 더 꼼꼼하게 누락을 잡은 사례가 결정적이었다 — 사람 검토는 \"있으면 좋은 것\"이지 \"기댈 수 있는 것\"이 아니다. AI가 자유롭게 달리도록 하려면, 사람의 시선이 아니라 *테스트와 훅과 정적 분석*이 울타리 역할을 해야 한다.",
  },
  {
    name: "AI Study Wiki",
    category: "ai-study-wiki" as const,
    url: "https://ai-study-wheat.vercel.app/",
    color: "#f59e0b",
    period: "2026.04 ~",
    version: "90+ entries · 13 categories",
    tagline: "AI 과외 선생님 → 허브-워커 관제 모델 → LLM-First Wiki로 진화한 메타 프로젝트. 세 워커(MoneyFlow, TaroSaju, Aidy)에서 검증한 AI 엔지니어링 방법론을 기록하고, 기록된 패턴이 다시 워커로 전이되는 복리 구조.",
    stack: ["Next.js 15", "TypeScript", "MDX", "Tailwind CSS 4", "Gemini 2.5 Flash", "Vercel"],
    metrics: {
      entries: "90+",
      journals: "25+ (Harness 24 + MAO 2 + iOS 9)",
      categories: 13,
      slashCommands: 7,
    },
    environment: [
      {
        title: "허브-워커 모델 (Journal 011)",
        detail: "ai-study(허브)가 moneyflow/tarosaju(워커)를 /projects-sync로 관찰. 워커 세션의 git 상태, worktree 수, 최근 PR을 read-only로 진단. 다른 세션과 충돌 없이 워커 코드를 /wt-branch로 안전하게 수정. 사고 재발률 0/18+ 사이클.",
      },
      {
        title: "AI 과외 선생님 파이프라인",
        detail: "매일 09:00 KST GitHub Actions → 지식 그래프 분석 → 빈 카테고리/dangling connections/낮은 confidence 기반 3개 주제 추천 → 사용자 선택 → Gemini가 MDX 자동 생성 → PR → 사용자 수정 = 학습 기록.",
      },
      {
        title: "패턴 전이성 — 허브에서 워커로, 워커에서 허브로",
        detail: "허브에 작성된 패턴이 별도 안내 없이 다른 세션에 의해 워커에 이식된 사례 5회+. 반대 방향(워커→허브)도 Journal 014에서 확립. 문서가 곧 전파 채널.",
      },
      {
        title: "Compound Engineering 자동화",
        detail: "git commit 전 빌드 게이트 강제, push 후 /compound 리마인더. CHANGELOG + 회고 + 솔루션 문서를 한 커맨드로 생성. 회고의 '다음 후보'가 다음 세션의 입력 큐가 되는 문서 기반 루프.",
      },
      {
        title: "Tokenomics 실측 기반 최적화",
        detail: "RTK(Rust Token Killer)로 CLI 출력 47.4M tokens 절감(99.5%). .claudeignore로 context ~50% 축소. API cache read 98%+. 3 레버가 각각 다른 레이어에서 독립 작동.",
      },
    ],
    cycles: [
      {
        title: "🌱 Phase 1 — AI 과외 선생님 (학습 위키)",
        detail: "시작은 단순한 학습 위키. MDX + force-directed 그래프 + 대시보드 + 퀴즈. Gemini 파이프라인이 매일 학습 주제를 추천하고 콘텐츠를 자동 생성. 이 시점의 역할은 '나의 AI 학습 기록장'.",
      },
      {
        title: "🔗 Phase 2 — 허브-워커 관제 모델 (Journal 011-014)",
        detail: "전환점. 단순 위키에서 두 실무 프로젝트를 관찰·조율하는 허브로 진화. /projects-sync로 워커 상태 진단, /wt-branch로 안전한 코드 기여, ai-review.yml로 3 프로젝트 자동 머지 통일. 워커→허브 역방향 기여(인바운드 tips PR)까지 양방향 흐름 확립.",
      },
      {
        title: "🛡️ Phase 3 — LLM-First Wiki (Journal 012-018)",
        detail: "허브가 직접 워커 코드를 개선하기 시작. moneyflow 10/10 에이전트 Runtime Validation Layer 1-4 완료. 패턴을 기록만 하는 게 아니라, 기록한 패턴을 *직접 적용*하고 그 결과를 다시 기록하는 자기참조 루프.",
      },
      {
        title: "⚖️ Phase 4 — 품질 관제 센터 (현재)",
        detail: "LLM-as-a-Judge로 3 프로젝트 AI 출력 품질 자동 평가. Tokenomics로 비용 실측. 기록 → 관찰 → 평가 → 최적화까지 한 프로젝트 안에서 완결되는 메타 구조.",
      },
    ],
    retrospective:
      "이 프로젝트는 세 번 탈바꿈했다.\n\n처음엔 'AI 과외 선생님'이었다. Gemini가 매일 학습 콘텐츠를 만들어주고 내가 읽고 수정하는 학습 위키. 그런데 MoneyFlow와 TaroSaju를 만들면서 '학습 기록'보다 '실전 패턴 기록'이 더 가치 있다는 걸 깨달았다.\n\n두 번째는 '허브-워커 관제 모델'이다. 두 실무 프로젝트를 관찰하고, 거기서 발견한 패턴을 기록하고, 기록된 패턴이 다시 워커로 전이되는 구조. 놀라운 건 내가 직접 이식하지 않아도 다른 세션이 허브의 문서를 읽고 알아서 적용한다는 것이었다. 문서가 곧 전파 채널.\n\n세 번째(현재)는 'LLM-First Wiki + 품질 관제 센터'다. 패턴을 기록만 하는 게 아니라 직접 워커 코드를 개선하고(Runtime Validation 시리즈), AI 출력 품질을 자동 평가하고(LLM-as-a-Judge), 토큰 비용을 실측한다(Tokenomics). 기록 → 관찰 → 평가 → 최적화의 전체 루프가 한 프로젝트 안에서 돈다.\n\n18개 Journal이 기록한 건 '코드를 어떻게 짰나'가 아니라 '환경을 어떻게 조정했나'다. 이게 Harness Engineering의 실체 — AI가 안전하게 달릴 환경을 만드는 일의 기록.",
  },
  {
    name: "Aidy",
    category: "aidy" as const,
    url: "",
    color: "#34d399",
    period: "2026.04 ~",
    version: "WO-009 완료 · 20라운드 autoceo",
    tagline: "Spec-Driven Multi-Agent Orchestration — 1명이 4개 AI 에이전트(Architect/Server/iOS/Android)를 동시 관제하는 Agentic Coding. api-contract.md가 Agent Fleet을 움직이고, Gate 검증이 3 플랫폼 동기화를 보장한다.",
    stack: ["Spring Boot 3.5", "Kotlin", "Tuist + TCA", "Jetpack Compose", "PostgreSQL", "Claude Code"],
    metrics: {
      repos: 4,
      workOrders: "9/9 완료",
      autoceoRounds: 20,
      adrs: 6,
    },
    environment: [
      {
        title: "Spec-First Architecture — api-contract.md가 계약",
        detail: "일반 프로젝트에서는 코드가 source of truth이고 문서가 뒤따라가지만, Aidy에서는 api-contract.md가 계약이다. 7개 엔드포인트, Request/Response 스키마, Error Codes 테이블이 명시되고, 3개 워커(server/ios/android)는 이를 정확히 구현해야 한다. 계약 변경은 Architect만 할 수 있다.",
      },
      {
        title: "Gate 1 + Gate 2 — 2단 검증 프로토콜",
        detail: "Gate 1은 스펙 준수 — 엔드포인트 URL, HTTP 메서드, 필드명/타입, 에러코드를 api-contract.md와 라인별 대조. Gate 2는 통합 검증 — 각 플랫폼 빌드+테스트 통과, server DTO vs iOS Model vs Android data class 필드명 교차 비교. WO-002, WO-003 모두 1차 Gate 1에서 FAIL → 재작업 → PASS.",
      },
      {
        title: "Cross-Session Review — 메타데이터 불신 원칙",
        detail: "다른 Claude 세션이 작성한 커밋 메시지, PR 설명, 코드 주석을 신뢰하지 않는다. git diff만 추출하여 4 Trap(스펙 외 엔드포인트, 데드코드, 계약 외 에러코드, 하드코딩 시크릿)을 독립 검증. honest하지만 possibly buggy한 AI 출력의 현실을 구조로 대응.",
      },
      {
        title: "JWT 인증 — X-User-Id에서 Bearer Token으로",
        detail: "ADR-006으로 결정. api-contract.md Auth v0.2 활성화 → WO-009 발행 → 3개 워커 동시 마이그레이션. iOS는 Keychain, Android는 EncryptedSharedPreferences, Server는 Spring Security + BCrypt. 401 자동 로그아웃까지 3 플랫폼 일관 구현.",
      },
      {
        title: "AI Output 5-Layer 검증 — 서버 사이드",
        detail: "WO-005로 서버에 5-Layer 런타임 검증 체계 구축. Text Guard → Schema Validation → Retry → Instruction Augmentation → LLM-as-Judge. tarosaju/moneyflow에서 검증된 패턴이 Kotlin 서버로 이식된 첫 사례.",
      },
      {
        title: "Compound Flywheel — 지식 순환 구조",
        detail: "WO 완료 + Gate 2 PASS 후 /compound → 회고(retro) + 솔루션(solution) + ADR 생성. 다음 라운드의 /autoceo Research 단계가 이 문서들을 입력으로 읽어 더 구체적인 Plan을 생성. 라운드마다 품질이 올라가는 복리 구조.",
      },
    ],
    cycles: [
      {
        title: "WO-001~003: 기초 — Chat API + 클라이언트 연동",
        detail: "Server 6 엔드포인트 → iOS/Android 연동. 양쪽 1차 Gate 1 FAIL(categories, health 누락) → 재작업 → 통과. ADR-003 탄생: 'iOS/Android는 같은 라운드에 같은 화면 구현'. 계약 기반 개발 프로세스 첫 검증.",
      },
      {
        title: "Sprint 1 (autoceo 10R): Relationship Memory Phase 1",
        detail: "WO-004(AI Resilience) + WO-005(5-Layer 검증) + WO-006(관계 메모리 DB) + WO-007/008(People 탭). ADR-005로 Phase 1 확정, Phase 2 명시적 보류. 3 플랫폼에 People 목록+상세+피드백 동시 구현. UNIQUE(userId, normalizedName) + ON CONFLICT UPDATE 패턴.",
      },
      {
        title: "Sprint 2 (autoceo 10R): Security + JWT + Quality",
        detail: "DB 기본 패스워드 제거 → WO-009 JWT 인증(api-contract Auth v0.2) → 인물 추출 프롬프트 최적화 → iOS 메모리 검색(debounce 300ms) → 테스트 커버리지 강화(Server 8파일 + iOS 4 + Android 2). 보안과 품질을 기능과 분리하여 Gate 검증 초점 확보.",
      },
      {
        title: "결과: 9/9 WO 완료 · 6 ADR · 10 API 엔드포인트",
        detail: "Auth+Chat+Memory+People+Settings 5화면 전 플랫폼 구현. DB 4 테이블 추가(users, persons, person_memories, memory_feedback). 20라운드에서 Gate 1 FAIL은 초기 2건뿐 — autoceo 대규모 실행에서 품질 유지 검증.",
      },
    ],
    retrospective:
      "20라운드 autoceo로 WO 9개를 전부 끝냈다. 이 숫자가 중요한 게 아니라, *게이트 시스템이 대규모 실행에서도 품질을 유지한다*는 것이 검증됐다는 게 핵심이다.\n\nGate 1 FAIL은 초기 WO-002, WO-003에서 2건 발생했고, 이후 0건이다. 워커(Claude 세션)들이 api-contract.md를 숙지하면서 1차 통과율이 자연스럽게 올라갔다. 이건 시스템이 *학습*하는 구조라는 뜻이다 — 게이트가 잡아낸 패턴이 다음 WO에서 반복되지 않는다.\n\n가장 좋은 아키텍처 결정은 ADR-005의 'Phase 2 명시적 보류'였다. Groups/Briefing/Timeline 같은 고급 기능을 미뤄두고 Phase 1(Person 추출+DB+UI+피드백)에 집중한 결과, 20라운드 안에 기초가 탄탄하게 완성됐다. normalizedName 실전 검증이 Phase 2 착수 조건인데, 이 조건을 ADR에 써두니까 autoceo가 함부로 Phase 2를 시작하지 않는다.\n\n스프린트를 기능(10R)과 보안(10R)으로 나눈 것도 정답이었다. 같은 스프린트에 '동작하는가'와 '안전한가'를 섞으면 Gate 검증의 초점이 흐려진다. JWT 인증은 보안 스프린트에서 집중적으로 처리해서, api-contract Auth v0.2 활성화 → WO-009 발행 → 3개 워커 동시 마이그레이션이 한 흐름으로 끝났다.\n\nmoneyflow/tarosaju에서 검증한 5-Layer 검증 패턴이 Kotlin 서버로 이식된 것도 Compound Engineering의 실체다. JavaScript → Kotlin으로 언어가 바뀌어도 패턴 자체는 그대로 이식 가능했다. 다음 단계는 Phase 2 설계와 WebSocket 스트리밍이다.",
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
            AI가 자유롭게 달릴 수 있는 울타리를 치고, 단일 에이전트부터 4개 동시 관제까지 — 매 사이클이 다음 사이클의 자산이 되도록 시스템을 쌓는다.
          </p>
          <div className="rounded-[var(--radius-md)] border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm text-text leading-relaxed">
              <span className="font-bold text-accent">Compound Engineering</span> · <span className="font-bold text-accent">Context Engineering</span> · <span className="font-bold text-accent">Harness Engineering</span> 세 가지 방법론 위에서 운영.
              네 프로젝트 모두 동일한 토대를 공유하고, MoneyFlow에서 검증된 패턴이 TaroSaju/Aidy로 그대로 이식되며, AI Study Wiki가 허브로서 양방향 복리 구조를 운영한다.
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

        <ProjectsPageClient projects={PROJECTS} />
      </main>
    </div>
  );
}
