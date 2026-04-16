import Link from "next/link";
import { Header } from "@/components/header";
import { getManifest } from "@/lib/content";
import { HarnessJournalClient } from "./harness-journal-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harness Journal",
  description:
    "두 프로젝트의 AI 운영 환경을 한 사이클씩 개선하고 박제하는 콘텐츠 시리즈. AI가 안전하게 날뛸 수 있는 환경을 만드는 일지.",
};

function extractEpisodeNumber(slug: string, prefix: string): number | null {
  const escaped = prefix.replace(/-/g, "\\-");
  const match = slug.match(new RegExp(`${escaped}(\\d+)`));
  return match ? parseInt(match[1], 10) : null;
}

export default function HarnessJournalPage() {
  const manifest = getManifest();

  // 🌐 Web: harness-journal-* 에피소드
  const webEpisodes = manifest.entries
    .filter((e) => {
      const tags = e.frontmatter.tags || [];
      return tags.includes("harness-journal") || e.slug.includes("harness-journal-");
    })
    .map((e) => ({
      slug: e.slug,
      frontmatter: e.frontmatter,
      episode: extractEpisodeNumber(e.slug, "harness-journal-"),
    }))
    .filter((e): e is typeof e & { episode: number } => e.episode !== null)
    .sort((a, b) => a.episode - b.episode);

  // 📱 iOS: ios-ai-journal-* 에피소드
  const iosEpisodes = manifest.entries
    .filter((e) => e.slug.includes("ios-ai-journal-"))
    .map((e) => ({
      slug: e.slug,
      frontmatter: e.frontmatter,
      episode: extractEpisodeNumber(e.slug, "ios-ai-journal-"),
    }))
    .filter((e): e is typeof e & { episode: number } => e.episode !== null)
    .sort((a, b) => a.episode - b.episode);

  // 🤖 MAO: aidy-journal-* 에피소드
  const maoEpisodes = manifest.entries
    .filter((e) => e.slug.includes("aidy-journal-"))
    .map((e) => ({
      slug: e.slug,
      frontmatter: e.frontmatter,
      episode: extractEpisodeNumber(e.slug, "aidy-journal-"),
    }))
    .filter((e): e is typeof e & { episode: number } => e.episode !== null)
    .sort((a, b) => a.episode - b.episode);

  const allDates = [...webEpisodes, ...iosEpisodes, ...maoEpisodes].map((e) => e.frontmatter.date).filter(Boolean).sort();
  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black tracking-tight mb-3">
            Harness Journal
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-4">
            두 프로젝트(
            <span className="text-text font-semibold">mino-moneyflow</span>,{" "}
            <span className="text-text font-semibold">mino-tarosaju</span>)의 AI 운영 환경을{" "}
            <span className="text-text font-semibold">한 사이클씩</span> 개선하고, 그 과정을 박제하는 콘텐츠 시리즈.
          </p>
          <p className="text-base text-muted leading-relaxed">
            AI가 자유롭게 달릴 수 있는 환경을 만드는 게 목표. 매 사이클은 한 가지 명확한 변화 + 한 가지 명확한 메시지.
          </p>
        </div>

        {/* Client: 탭 + 에피소드 목록 */}
        <HarnessJournalClient
          webEpisodes={webEpisodes}
          iosEpisodes={iosEpisodes}
          maoEpisodes={maoEpisodes}
          firstDate={firstDate}
          lastDate={lastDate}
        />

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-border text-sm text-muted leading-relaxed">
          <p>
            Web 에피소드는{" "}
            <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">
              content/harness-engineering/harness-journal-NNN-...mdx
            </code>
            , iOS 에피소드는{" "}
            <code className="font-code text-xs bg-surface px-1.5 py-0.5 rounded">
              content/ios-ai/ios-ai-journal-NNN-...mdx
            </code>{" "}
            형식으로 추가됩니다.
          </p>
          {webEpisodes.length > 0 && (
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
