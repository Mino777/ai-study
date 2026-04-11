import Link from "next/link";
import { Header } from "@/components/header";
import { getManifest } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harness Journal — Mino's AI Study Wiki",
  description:
    "두 프로젝트의 AI 운영 환경을 한 사이클씩 개선하고 박제하는 콘텐츠 시리즈. AI가 안전하게 날뛸 수 있는 환경을 만드는 일지.",
};

function extractEpisodeNumber(slug: string): number | null {
  const match = slug.match(/harness-journal-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function HarnessJournalPage() {
  const manifest = getManifest();

  const episodes = manifest.entries
    .filter((e) => {
      const tags = e.frontmatter.tags || [];
      return tags.includes("harness-journal") || e.slug.includes("harness-journal-");
    })
    .map((e) => ({
      slug: e.slug,
      frontmatter: e.frontmatter,
      episode: extractEpisodeNumber(e.slug),
    }))
    .filter((e): e is typeof e & { episode: number } => e.episode !== null)
    .sort((a, b) => a.episode - b.episode);

  const totalEpisodes = episodes.length;
  const firstDate = episodes[0]?.frontmatter.date;
  const lastDate = episodes[episodes.length - 1]?.frontmatter.date;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-display text-4xl font-black tracking-tight mb-3">
            Harness Journal
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-4">
            두 프로젝트(<span className="text-text font-semibold">mino-moneyflow</span>,{" "}
            <span className="text-text font-semibold">mino-tarosaju</span>)의 AI 운영 환경을{" "}
            <span className="text-text font-semibold">한 사이클씩</span> 개선하고, 그 과정을 박제하는 콘텐츠 시리즈.
          </p>
          <p className="text-base text-muted leading-relaxed mb-6">
            AI가 자유롭게 달릴 수 있는 환경을 만드는 게 목표. 매 사이클은 한 가지 명확한 변화 + 한 가지 명확한 메시지.
            매 사이클의 사고가 다음 사이클의 정확한 입력이 됨.
          </p>
          <div className="rounded-[var(--radius-md)] border border-accent/20 bg-accent/5 p-5">
            <div className="flex flex-wrap items-start gap-6 text-sm">
              <div>
                <div className="text-xs text-muted">총 에피소드</div>
                <div className="font-data text-2xl font-semibold text-text">{totalEpisodes}</div>
              </div>
              {firstDate && (
                <div>
                  <div className="text-xs text-muted">시작</div>
                  <div className="font-data text-base font-medium text-text">{firstDate}</div>
                </div>
              )}
              {lastDate && (
                <div>
                  <div className="text-xs text-muted">마지막 업데이트</div>
                  <div className="font-data text-base font-medium text-text">{lastDate}</div>
                </div>
              )}
              <div className="flex-1 min-w-[200px] text-xs text-muted leading-relaxed border-l border-border pl-4">
                Compound Engineering 원칙 — <span className="text-text font-semibold">행동에 박는 가드 &gt; 기억에 의존하는 가드</span>
              </div>
            </div>
          </div>
        </div>

        {/* Episode timeline */}
        {episodes.length > 0 && (
          <div className="space-y-6">
            {episodes.map((entry, idx) => {
              const isLast = idx === episodes.length - 1;
              return (
                <div key={entry.slug} className="relative">
                  {/* Connector line between episodes */}
                  {!isLast && (
                    <div
                      className="absolute left-[39px] top-[80px] w-[2px] h-[calc(100%-40px)] bg-border"
                      aria-hidden="true"
                    />
                  )}
                  <Link href={`/wiki/${entry.slug}`} className="flex gap-5 items-start group">
                    {/* Episode number bubble */}
                    <div className="shrink-0 h-20 w-20 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center group-hover:bg-accent/15 group-hover:border-accent transition-colors">
                      <div className="text-center">
                        <div className="text-[10px] text-muted font-code uppercase">Ep</div>
                        <div className="font-data text-2xl font-bold text-accent">
                          {String(entry.episode).padStart(3, "0")}
                        </div>
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 rounded-[var(--radius-md)] border border-border bg-surface p-5 group-hover:border-accent transition-colors">
                      <div className="text-xs text-muted font-code mb-1">{entry.frontmatter.date}</div>
                      <h3 className="font-display text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                        {entry.frontmatter.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">{entry.frontmatter.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(entry.frontmatter.tags || []).slice(0, 6).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-bg px-2 py-0.5 text-[10px] text-muted font-code border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {episodes.length === 0 && (
          <div className="text-center text-muted py-12">
            아직 에피소드가 없습니다. <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">content/harness-engineering/harness-journal-000-baseline.mdx</code>부터 시작하세요.
          </div>
        )}

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-border text-sm text-muted leading-relaxed">
          <p>
            새 에피소드는{" "}
            <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">
              content/harness-engineering/harness-journal-NNN-...mdx
            </code>{" "}
            형식으로 추가됩니다. 슬러그 prefix(또는{" "}
            <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">harness-journal</code> 태그)가 자동으로 인식되어 이 페이지에 episode 번호 순으로 노출됩니다.
          </p>
          {episodes.length > 0 && (
            <p className="mt-2">
              시리즈 정의와 운영 규칙은{" "}
              <Link
                href="/wiki/harness-engineering/harness-journal-000-baseline"
                className="text-accent hover:underline"
              >
                Episode 000 — 베이스라인
              </Link>
              을 참조.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
