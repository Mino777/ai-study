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
    preview: "/projects/moneyflow-preview.svg",
    color: "#10b981",
    period: "2026.03 ~",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude", "Gemini", "GPT", "Tailwind CSS 4"],
    summary: "AI 멀티 에이전트 투자 분석 SaaS. 13개 에이전트가 적대적 토론을 거쳐 투자 판단을 도출한다.",
    scale: { files: 344, agents: 14, dataSources: 9, tests: 32 },
    work: [
      "13-에이전트 멀티 페이즈 파이프라인 설계 (4 병렬 분석가 → Bull/Bear 토론 → Judge → Trader → Risk → CIO → Devil's Advocate)",
      "Gemini/Claude/GPT 3개 프로바이더 자동 전환 + Circuit Breaker (3회 실패 → 2분 쿨다운)",
      "에이전트별 최적 모델 라우팅 (데이터 분석 → Gemini, 비판적 분석 → Claude, 토론 → GPT)",
      "Yahoo Finance/Naver/SEC 등 9개 데이터 소스 병렬 수집 + 5분 캐시",
      "BM25 알고리즘으로 유사 과거 트레이딩 검색 → 교훈 자동 추출 → 다음 분석에 반영",
      "Upstash Redis 기반 분산 레이트 리미팅 (서버리스 환경)",
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
        detail: "Claude 429 에러가 피크 시간에 10분에 3번 발생. Circuit Breaker 없었으면 서비스 중단. 프로바이더마다 JSON 구조화 출력 방식이 달라서 3단계 파싱 fallback도 필요했다.",
      },
      {
        title: "비용 제어가 곧 제품 설계",
        detail: "무료 사용자는 Gemini Flash 7에이전트, 프로 사용자는 Claude 14에이전트. 모델 선택 자체가 비즈니스 모델이 됐다. 하루 API 비용을 $5 이하로 유지하는 게 아키텍처 결정의 60%를 좌우했다.",
      },
    ],
    retrospective: "처음엔 \"Claude에게 주식 분석을 시키자\"로 시작했다. 단일 프롬프트로는 환각이 심했고, 에이전트를 나누기 시작했다. 4개 → 8개 → 13개. 에이전트가 늘어날수록 오케스트레이션이 핵심 문제가 됐다. 가장 큰 전환점은 \"토론 구조\" 도입. 결론을 내리는 게 아니라 논쟁을 시키니까 품질이 확 올라갔다. 지금 돌아보면, 제일 어려웠던 건 코드가 아니라 \"언제 멈출 것인가\"였다. 에이전트를 더 추가하면 항상 조금 더 나아지는데, 비용과 시간이 선형으로 증가한다. 14개에서 멈춘 건 비용 상한($5/day) 때문이었다.",
  },
  {
    name: "Mino TaroSaju",
    url: "https://mino-tarosaju.vercel.app/",
    preview: "/projects/tarosaju-preview.png",
    color: "#8b5cf6",
    period: "2026.02 ~",
    stack: ["Next.js 16", "TypeScript", "Supabase", "Claude Haiku", "Framer Motion", "Tailwind CSS 4"],
    summary: "AI 타로 & 사주 상담 서비스. 6개 존(세계관)에 47페이지, 314개 테스트, 8,652줄의 도메인 지식.",
    scale: { files: 266, pages: 47, dataLines: 8652, tests: 314 },
    work: [
      "6개 존(Zone) 테마 시스템: Hub/Tarot/Saju/Love/Psych/Dream 각각 다른 색상/폰트/파티클",
      "CSS Custom Properties + data-zone 속성으로 1줄 테마 전환 (47페이지 × 6테마 = 282가지 조합)",
      "오행 상생상극, 삼합/육합/충, 천간합 등 한국 명리학을 알고리즘으로 변환 (8,652줄)",
      "Claude Haiku 실시간 타로 채팅 (별빛 선생님 페르소나, 5턴 제한)",
      "시드 기반 결정론적 결과 생성 → URL 공유 시 동일 결과 재현 (바이럴 루프)",
      "Canvas 파티클 엔진 (별/연기/하트/비누방울) + 모바일 성능 최적화 (30fps 유지)",
    ],
    learned: [
      {
        title: "도메인 지식 인코딩이 제일 어렵다",
        detail: "사주학/명리학을 코드로 옮기는 건 알고리즘이 아니라 번역에 가깝다. 전문가 검수 없이는 \"맞는지\" 확인할 방법이 없다. love 관련 로직만 27번 커밋하며 수정했다.",
      },
      {
        title: "CSS 변수가 JS Context보다 테마에 유리하다",
        detail: "처음엔 React Context로 테마를 관리했는데, 리렌더링 비용이 컸다. data-zone + CSS Custom Properties로 바꾸니 성능도 좋아지고 코드도 깨끗해졌다.",
      },
      {
        title: "결정론적 결과 = 바이럴의 핵심",
        detail: "같은 생년월일이면 항상 같은 결과가 나와야 카카오톡으로 공유했을 때 의미가 있다. Seeded PRNG를 구현했는데, JS 엔진마다 미묘하게 다른 부분이 있어서 고생했다.",
      },
      {
        title: "인증은 환경별로 다르다",
        detail: "PKCE 인증이 데스크톱에서는 되는데 모바일 Safari에서는 쿠키가 날아갔다. 6번 커밋하며 고쳤다. 실기기 테스트 없이는 절대 알 수 없는 버그.",
      },
    ],
    retrospective: "\"타로 앱 하나 만들어볼까\"로 시작해서 사주, 꿈해몽, 궁합, 심리 테스트, 수비학까지 6개 세계관으로 확장됐다. 가장 예상 못한 난이도는 도메인 지식이었다. 오행 상생상극을 코드로 표현하는 건 어렵지 않은데, \"이게 맞는지\"를 확인하는 과정이 끝없었다. Zone 시스템은 자랑할 만하다. 47페이지가 6개 세계관을 오가는데 CSS 변수 하나로 전환된다. 컴포넌트를 6벌 만들지 않아도 되는 구조. 가장 뿌듯한 순간은 카카오 공유가 처음 동작했을 때. 시드 기반 결정론 덕분에 친구에게 공유한 결과를 클릭하면 동일한 결과가 나온다. 이게 바이럴 루프의 핵심이었다.",
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

              <p className="text-lg text-muted mb-6">{project.summary}</p>

              {/* Preview */}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-[var(--radius-lg)] border border-border overflow-hidden mb-6 group relative"
              >
                <div className="aspect-[16/9] bg-surface flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.preview}
                    alt={`${project.name} 미리보기`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-bg/90 text-text px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold backdrop-blur-sm">
                    사이트 방문 →
                  </span>
                </div>
              </a>

              {/* Stats + Stack */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(project.scale).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    files: "파일",
                    agents: "에이전트",
                    dataSources: "데이터 소스",
                    tests: "테스트",
                    pages: "페이지",
                    dataLines: "도메인 데이터",
                  };
                  const display = key === "dataLines" ? `${(val as number).toLocaleString()}줄` : val;
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
