import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe Coding — AI Study Wiki",
  description: "AI와 함께 바이브코딩으로 만든 프로젝트들",
};

const PROJECTS = [
  {
    name: "Mino MoneyFlow",
    url: "https://mino-moneyflow.vercel.app/",
    description:
      "AI 멀티 에이전트 투자 분석 플랫폼. 13개 에이전트가 Bull/Bear 토론 → Judge 판정 → CIO 종합. Gemini + Claude + GPT 멀티 프로바이더 fallback.",
    tags: ["Next.js", "Claude", "Gemini", "GPT", "Multi-Agent", "Supabase"],
    highlights: [
      "13-에이전트 파이프라인 (적대적 토론)",
      "멀티 프로바이더 fallback + circuit breaker",
      "품질 가드: 베이스레이트 주입, 프리모템",
      "BM25 메모리 + 과거 교훈 추출",
    ],
    color: "#10b981",
  },
  {
    name: "Mino TaroSaju",
    url: "https://mino-tarosaju.vercel.app/",
    description:
      "AI 타로 & 사주 상담 서비스. Claude Haiku로 실시간 타로 채팅, 오행 상생상극 기반 운세, 6,289줄의 도메인 지식 인코딩.",
    tags: ["Next.js", "Claude Haiku", "Vercel", "타로", "사주"],
    highlights: [
      "멀티모달 컨텍스트 주입 (카드 + 사용자 정보)",
      "6,289줄 전문가 도메인 데이터",
      "템플릿 fallback → AI 향상 (Phase 1/2)",
      "실시간 타로 채팅 UI",
    ],
    color: "#8b5cf6",
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-bg/80 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-text hover:text-accent transition-colors"
          >
            AI Study Wiki
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/wiki" className="text-sm text-muted hover:text-text transition-colors">
              Wiki
            </Link>
            <Link href="/dashboard" className="text-sm text-muted hover:text-text transition-colors">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight mb-3">
            Vibe Coding
          </h1>
          <p className="text-lg text-muted">
            AI와 함께 바이브코딩으로 만든 프로젝트들. 아이디어에서 프로덕션까지.
          </p>
        </div>

        <div className="space-y-8">
          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden"
            >
              {/* Site preview iframe */}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative group"
              >
                <div className="aspect-[16/9] bg-bg overflow-hidden">
                  <iframe
                    src={project.url}
                    className="w-full h-full pointer-events-none scale-100 origin-top-left"
                    style={{ width: "100%", height: "100%" }}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    title={project.name}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-bg/90 text-text px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold backdrop-blur-sm">
                    사이트 방문 →
                  </span>
                </div>
              </a>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: project.color }}
                  />
                  <h2 className="font-display text-2xl font-bold">
                    {project.name}
                  </h2>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    방문 →
                  </a>
                </div>

                <p className="text-muted mb-4">{project.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-muted font-code"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Highlights */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    AI 엔지니어링 하이라이트
                  </h3>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-text">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: project.color }}
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
