import Link from "next/link";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe Coding — AI Study Wiki",
  description: "AI와 함께 바이브코딩으로 만든 프로젝트들. 작업 내용, 배운 점, 회고.",
};

const PROJECTS = [
  {
    name: "Mino MoneyFlow",
    url: "https://mino-moneyflow.vercel.app/",
    color: "#10b981",
    period: "2026.04 ~",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude", "Gemini", "GPT", "Tailwind CSS 4"],
    summary: "AI 멀티 에이전트 투자 분석 SaaS. 13개 에이전트가 적대적 토론을 거쳐 투자 판단을 도출한다.",
    scale: { files: 344, lines: 82401, agents: 14, dataSources: 9, tests: 32 },
    work: [
      "13-에이전트 멀티 페이즈 파이프라인 설계 (4 병렬 분석가 → Bull/Bear 토론 → Judge → Trader → Risk → CIO → Devil's Advocate)",
      "Gemini/Claude/GPT 3개 프로바이더 자동 전환 + Circuit Breaker (3회 실패 → 2분 쿨다운)",
      "에이전트별 최적 모델 라우팅 (데이터 분석 → Gemini, 비판적 분석 → Claude, 토론 → GPT)",
      "Yahoo Finance/Naver/SEC 등 9개 데이터 소스 병렬 수집 + 5분 캐시",
      "BM25 알고리즘으로 유사 과거 트레이딩 검색 → 교훈 자동 추출 → 다음 분석에 반영",
      "Upstash Redis 기반 분산 레이트 리미팅 (서버리스 환경)",
    ],
    contextEngineering: [
      {
        code: "CE-1",
        title: "에이전트별 컨텍스트 격리",
        detail: "Market Analyst는 기술 지표만, Fundamentals는 재무 데이터만 본다. 전체 데이터를 한 에이전트에 몰아넣으면 집중도가 떨어진다. 역할별로 필터링된 컨텍스트를 주입해서 전문성을 확보.",
      },
      {
        code: "CE-2",
        title: "품질 가드 레이어드 주입",
        detail: "공통 가드(베이스레이트, 정량적 근거 필수) → 역할별 가드(PM에게만 프리모템, 펀더멘탈에게만 기대치 갭) → 상황별 가드(모멘텀 다이버전스). 3단 레이어로 프롬프트를 조립한다.",
      },
      {
        code: "CE-3",
        title: "실제 데이터 우선, 환각 방지",
        detail: "Yahoo Finance에서 가져온 실제 PER/EPS를 프롬프트에 주입. 데이터 있으면 confidence 85-95 허용, 없으면 35-60으로 강제 제한. '모르는 수치를 만들어내지 마세요' 명시.",
      },
      {
        code: "CE-4",
        title: "메모리 기반 컨텍스트 (BM25)",
        detail: "과거 유사 트레이딩을 BM25 검색으로 찾아서 Bull/Bear 토론에 교훈을 주입. 단, '현재 데이터를 우선하세요' 앵커링 방지 프롬프트를 같이 넣는다.",
      },
    ],
    harnessEngineering: [
      {
        code: "HE-1",
        title: "Circuit Breaker + 지수 백오프",
        detail: "3회 연속 실패 → 2분 쿨다운 → 반개방 상태에서 1회 재시도. Rate limit은 4배, 서버 에러는 2배, 타임아웃은 선형 백오프. 프로바이더별 독립 상태 관리.",
      },
      {
        code: "HE-2",
        title: "Structured Output 3단계 파싱",
        detail: "Gemini/OpenAI는 네이티브 JSON Schema 강제. Claude는 프롬프트 기반. 그래도 실패하면 정규식으로 첫 번째 {...} 추출. 3단계 fallback으로 파싱 실패율 거의 0%.",
      },
      {
        code: "HE-3",
        title: "Steelman 의무 + 교차 인용",
        detail: "토론 에이전트는 반드시 상대방의 가장 강한 논거를 먼저 제시한 후에야 반박 가능. Steelman 없는 주장은 Judge가 50% 가중치로 처리. 허수아비 논증을 구조적으로 방지.",
      },
      {
        code: "HE-4",
        title: "프롬프트 캐싱 (90% 할인)",
        detail: "Claude의 cache_control: ephemeral로 반복되는 시스템 프롬프트(품질 가드)를 5분간 캐싱. 같은 역할의 에이전트가 연속 호출되면 캐시 히트 → API 비용 90% 절감.",
      },
    ],
    learned: [
      {
        title: "LLM은 기본적으로 과신한다",
        detail: "에이전트가 80% confidence라고 해도 실제 정확도는 65%. 100+ 과거 시그널로 캘리브레이션 커브를 만들어 사후 보정했다. 베이스레이트 주입, 프리모템 분석이 핵심.",
      },
      {
        title: "토론 구조가 단일 에이전트보다 낫다",
        detail: "Bull/Bear가 상대방 논거를 직접 인용하고 반박하는 구조. 허수아비 논증 방지 + 과신 20-30% 감소. 단, 토론 시간이 분석 시간의 40%를 차지해서 타임아웃 관리가 어려웠다.",
      },
      {
        title: "멀티 프로바이더는 선택이 아니라 필수",
        detail: "Claude 429 에러가 피크 시간에 10분에 3번 발생. Circuit Breaker 없었으면 서비스 중단.",
      },
      {
        title: "비용 제어가 곧 제품 설계",
        detail: "무료 사용자는 Gemini Flash 7에이전트, 프로 사용자는 Claude 14에이전트. 모델 선택 자체가 비즈니스 모델. 하루 $5 상한이 아키텍처의 60%를 결정했다.",
      },
    ],
    retrospective: "처음엔 \"Claude에게 주식 분석을 시키자\"로 시작했다. 단일 프롬프트로는 환각이 심했고, 에이전트를 나누기 시작했다. 4개 → 8개 → 13개. 에이전트가 늘어날수록 오케스트레이션이 핵심 문제가 됐다. 가장 큰 전환점은 \"토론 구조\" 도입. 결론을 내리는 게 아니라 논쟁을 시키니까 품질이 확 올라갔다. 지금 돌아보면, 제일 어려웠던 건 코드가 아니라 \"언제 멈출 것인가\"였다. 에이전트를 더 추가하면 항상 조금 더 나아지는데, 비용과 시간이 선형으로 증가한다. 14개에서 멈춘 건 비용 상한($5/day) 때문이었다.",
  },
  {
    name: "Mino TaroSaju",
    url: "https://mino-tarosaju.vercel.app/",
    color: "#8b5cf6",
    period: "2026.04 ~",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude Haiku", "Framer Motion", "Tailwind CSS 4"],
    summary: "AI 타로 & 사주 상담 서비스. 6개 존(세계관)에 47페이지, 314개 테스트, 8,652줄의 도메인 지식.",
    scale: { files: 266, lines: 48100, pages: 47, dataLines: 8652, tests: 314 },
    work: [
      "6개 존(Zone) 테마 시스템: Hub/Tarot/Saju/Love/Psych/Dream 각각 다른 색상/폰트/파티클",
      "CSS Custom Properties + data-zone 속성으로 1줄 테마 전환 (47페이지 × 6테마 = 282가지 조합)",
      "오행 상생상극, 삼합/육합/충, 천간합 등 한국 명리학을 알고리즘으로 변환 (8,652줄)",
      "Claude Haiku 실시간 타로 채팅 (별빛 선생님 페르소나, 5턴 제한)",
      "시드 기반 결정론적 결과 생성 → URL 공유 시 동일 결과 재현 (바이럴 루프)",
      "Canvas 파티클 엔진 (별/연기/하트/비누방울) + 모바일 성능 최적화 (30fps 유지)",
    ],
    contextEngineering: [
      {
        code: "CE-1",
        title: "시스템 프롬프트 = 도메인 제약",
        detail: "타로 채팅의 시스템 프롬프트에 뽑힌 카드 목록 + 사용자 이름을 동적 주입. AI의 출력을 사용자 상태에 바인딩한다. '따뜻하고 공감적인 톤', '2-3문단', '~요 체' 등 톤/형식/길이를 명시적으로 제약.",
      },
      {
        code: "CE-2",
        title: "다층 시맨틱 메타데이터",
        detail: "타로 카드 데이터에 기본 의미(upright/reversed) + 상세 해석(detailedReading) + 분야별 조언(love/money/health) + 학술 메타데이터(행성/원소/원형/영웅여정/수비학)까지 7겹. AI가 깊은 해석을 할 수 있는 시맨틱 밀도.",
      },
      {
        code: "CE-3",
        title: "도메인 지식 8,652줄 인코딩",
        detail: "오행 상생상극, 삼합/육합/충, 천간합, 12동물 × 4카테고리 운세 템플릿. 전문가 지식을 코드로 번역. AI가 만들어내는 게 아니라 검증된 데이터를 기반으로 계산.",
      },
      {
        code: "CE-4",
        title: "CE/HE 커밋 태깅 체계",
        detail: "모든 커밋 메시지에 [CE-N], [HE-N] 태그를 붙여서 어떤 엔지니어링 원칙이 적용됐는지 추적. AI 에이전트 협업의 품질을 측정 가능하게 만든다.",
      },
    ],
    harnessEngineering: [
      {
        code: "HE-1",
        title: "Phase 1/2 점진적 AI 도입",
        detail: "Phase 1은 템플릿 기반(API 키 불필요, 무료). Phase 2에서 Claude API로 업그레이드. API 실패 시 자동으로 Phase 1 템플릿으로 fallback. 사용자는 차이를 모른다.",
      },
      {
        code: "HE-2",
        title: "결정론적 시드 = 공유 가능한 결과",
        detail: "dayOfYear % N으로 시드된 랜덤. 같은 생년월일 + 같은 날짜 = 항상 같은 결과. URL로 공유하면 동일 결과 재현. 이게 카카오톡 바이럴 루프의 핵심 메커니즘.",
      },
      {
        code: "HE-3",
        title: "5단계 품질 게이트",
        detail: "Read → Edit → Build(0 에러) → Browser QA(최소 3페이지) → Commit. 단계를 건너뛸 수 없다. 배포는 스프린트 단위로 모아서 push (Vercel 100 deploys/day 제한 대응).",
      },
      {
        code: "HE-4",
        title: "점수 범위 강제 제한",
        detail: "운세 점수를 Math.min(100, Math.max(40, score))로 강제. AI가 0점이나 100점을 내보내지 못하게. 오행 조화(harmony)면 기본 82점, 충돌(clash)면 58점으로 앵커링.",
      },
    ],
    learned: [
      {
        title: "도메인 지식 인코딩이 제일 어렵다",
        detail: "사주학/명리학을 코드로 옮기는 건 알고리즘이 아니라 번역에 가깝다. love 관련 로직만 27번 커밋하며 수정했다.",
      },
      {
        title: "CSS 변수가 JS Context보다 테마에 유리하다",
        detail: "처음엔 React Context로 테마를 관리했는데, 리렌더링 비용이 컸다. data-zone + CSS Custom Properties로 바꾸니 성능도 좋아지고 코드도 깨끗해졌다.",
      },
      {
        title: "결정론적 결과 = 바이럴의 핵심",
        detail: "같은 생년월일이면 항상 같은 결과. Seeded PRNG를 구현했는데, JS 엔진마다 미묘하게 다른 부분이 있어서 고생.",
      },
      {
        title: "인증은 환경별로 다르다",
        detail: "PKCE 인증이 데스크톱에서는 되는데 모바일 Safari에서는 쿠키가 날아갔다. 6번 커밋. 실기기 테스트 필수.",
      },
    ],
    retrospective: "\"타로 앱 하나 만들어볼까\"로 시작해서 사주, 꿈해몽, 궁합, 심리 테스트, 수비학까지 6개 세계관으로 확장됐다. 가장 예상 못한 난이도는 도메인 지식이었다. 오행 상생상극을 코드로 표현하는 건 어렵지 않은데, \"이게 맞는지\"를 확인하는 과정이 끝없었다. Zone 시스템은 자랑할 만하다. 47페이지가 6개 세계관을 오가는데 CSS 변수 하나로 전환된다. 가장 뿌듯한 순간은 카카오 공유가 처음 동작했을 때. 시드 기반 결정론 덕분에 친구에게 공유한 결과를 클릭하면 동일한 결과가 나온다. 이게 바이럴 루프의 핵심이었다.",
  },
];

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-bg px-3 py-1.5 text-center">
      <div className="font-data text-lg font-semibold text-text">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-black tracking-tight mb-3">
            Vibe Coding
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            AI와 함께 바이브코딩으로 만든 프로젝트들.
            아이디어에서 프로덕션까지, 만들면서 배운 것들을 기록합니다.
          </p>
        </div>

        <div className="space-y-16">
          {PROJECTS.map((project) => (
            <article key={project.name}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: project.color }}
                />
                <h2 className="font-display text-3xl font-black tracking-tight">
                  {project.name}
                </h2>
                <span className="text-sm text-muted font-code ml-auto">
                  {project.period}
                </span>
              </div>

              <p className="text-lg text-muted mb-4">{project.summary}</p>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-surface border border-border px-4 py-2 text-sm font-medium text-accent hover:border-accent transition-colors mb-6"
              >
                {project.url.replace("https://", "")} →
              </a>

              {/* Stats + Stack */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(project.scale).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    files: "파일",
                    lines: "코드 라인",
                    agents: "에이전트",
                    dataSources: "데이터 소스",
                    tests: "테스트",
                    pages: "페이지",
                    dataLines: "도메인 데이터",
                  };
                  const display = key === "dataLines" || key === "lines"
                    ? `${(val as number).toLocaleString()}줄`
                    : val;
                  return <StatBadge key={key} label={labels[key] || key} value={display} />;
                })}
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-full bg-surface px-3 py-1 text-xs text-muted font-code border border-border">
                    {s}
                  </span>
                ))}
              </div>

              {/* Work */}
              <section className="mb-8">
                <h3 className="font-display text-xl font-bold mb-4">작업 내용</h3>
                <ul className="space-y-2">
                  {project.work.map((w, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text leading-relaxed">
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: project.color }}
                      />
                      {w}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Context Engineering */}
              {project.contextEngineering && (
                <section className="mb-8">
                  <h3 className="font-display text-xl font-bold mb-4">
                    <span className="text-cat-prompt">Context</span> Engineering
                  </h3>
                  <div className="space-y-3">
                    {project.contextEngineering.map((ce) => (
                      <div
                        key={ce.code}
                        className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded bg-cat-prompt/10 px-1.5 py-0.5 text-xs font-bold font-code text-cat-prompt">
                            {ce.code}
                          </span>
                          <h4 className="font-display text-sm font-bold text-text">{ce.title}</h4>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{ce.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Harness Engineering */}
              {project.harnessEngineering && (
                <section className="mb-8">
                  <h3 className="font-display text-xl font-bold mb-4">
                    <span className="text-cat-rag">Harness</span> Engineering
                  </h3>
                  <div className="space-y-3">
                    {project.harnessEngineering.map((he) => (
                      <div
                        key={he.code}
                        className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded bg-cat-rag/10 px-1.5 py-0.5 text-xs font-bold font-code text-cat-rag">
                            {he.code}
                          </span>
                          <h4 className="font-display text-sm font-bold text-text">{he.title}</h4>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{he.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Learned */}
              <section className="mb-8">
                <h3 className="font-display text-xl font-bold mb-4">배운 점</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.learned.map((l) => (
                    <div
                      key={l.title}
                      className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                    >
                      <h4 className="font-display text-sm font-bold mb-2 text-text">
                        {l.title}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed">
                        {l.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Retrospective */}
              <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
                <h3 className="font-display text-xl font-bold mb-3">회고</h3>
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
