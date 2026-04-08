import Link from "next/link";
import { getManifest } from "@/lib/content";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — AI Study Wiki",
  description: "AI 하네스 엔지니어링을 공부하는 개발자의 학습 기록과 포트폴리오",
};

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "#f59e0b",
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
};

const SKILLS = [
  { name: "TypeScript", level: 4 },
  { name: "React / Next.js", level: 4 },
  { name: "Prompt Engineering", level: 3 },
  { name: "RAG", level: 2 },
  { name: "LLM Agents", level: 2 },
  { name: "Fine-tuning", level: 1 },
];

export default function AboutPage() {
  const manifest = getManifest();
  const entryCount = manifest.entries.length;
  const categories = new Set(manifest.entries.map((e) => e.frontmatter.category));

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
            <Link href="/dashboard" className="text-sm text-muted hover:text-text transition-colors">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        {/* Profile */}
        <div className="mb-12">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface border border-border">
            <span className="font-display text-2xl font-black text-accent">JM</span>
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight mb-3">
            Jominho
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            AI 하네스 엔지니어링을 딥다이브하는 개발자입니다.
            프롬프트 엔지니어링, RAG, 에이전트, 파인튜닝 등
            AI 시대의 핵심 기술을 체계적으로 학습하고 기록합니다.
          </p>
        </div>

        {/* Learning stats */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold mb-4">학습 현황</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
              <div className="font-data text-3xl font-semibold text-text">{entryCount}</div>
              <div className="text-sm text-muted mt-1">위키 엔트리</div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
              <div className="font-data text-3xl font-semibold text-text">{categories.size}</div>
              <div className="text-sm text-muted mt-1">학습 카테고리</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(categories).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: `color-mix(in srgb, ${CATEGORY_COLORS[cat]} 15%, transparent)`,
                  color: CATEGORY_COLORS[cat],
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: CATEGORY_COLORS[cat] }}
                />
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold mb-4">기술 스택</h2>
          <div className="space-y-3">
            {SKILLS.map((skill) => (
              <div key={skill.name} className="flex items-center gap-4">
                <span className="w-40 text-sm text-text">{skill.name}</span>
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-2 flex-1 rounded-full"
                      style={{
                        background: i <= skill.level ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Motivation */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold mb-4">이 위키를 만든 이유</h2>
          <div className="space-y-4 text-muted leading-relaxed">
            <p>
              AI 하네스 엔지니어링은 빠르게 발전하는 분야입니다.
              단순히 블로그에 적는 것으로는 지식의 연결 관계를 파악하기 어렵습니다.
            </p>
            <p>
              이 위키는 학습한 개념들 사이의 연결을 시각화하고,
              자신의 이해도를 추적하며, 다음에 무엇을 공부할지 추천합니다.
              공부한 것 자체가 포트폴리오가 됩니다.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="rounded-[var(--radius-sm)] bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            지식 그래프 탐색
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent"
          >
            학습 대시보드
          </Link>
        </div>
      </main>
    </div>
  );
}
