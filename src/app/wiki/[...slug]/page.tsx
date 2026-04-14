import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { rehypeMermaid } from "@/lib/remark-mermaid";
import rehypeShiki from "@shikijs/rehype";
import { getEntry, getAllSlugs, getManifest } from "@/lib/content";
import { SummaryCard } from "@/components/summary-card";
import { mdxComponents } from "@/components/mdx-components";
import { EntryNav } from "@/components/entry-nav";
import { TableOfContents } from "@/components/toc";
import { ScrollProgress } from "@/components/scroll-progress";
import { Quiz } from "@/components/quiz";
import { MermaidRenderer } from "@/components/mermaid-renderer";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "var(--cat-prompt)",
  "context-engineering": "var(--cat-context)",
  "harness-engineering": "var(--cat-harness)",
  rag: "var(--cat-rag)",
  agents: "var(--cat-agents)",
  "fine-tuning": "var(--cat-finetune)",
  evaluation: "var(--cat-eval)",
  infrastructure: "var(--cat-infra)",
  "ios-ai": "var(--cat-ios-ai)",
  "frontend-ai": "var(--cat-frontend-ai)",
};

export function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");
  const entry = getEntry(slug);
  if (!entry) return { title: "Not Found" };

  const ogUrl = new URL("/api/og", "https://ai-study-wheat.vercel.app");
  ogUrl.searchParams.set("title", entry.frontmatter.title);
  ogUrl.searchParams.set("category", entry.frontmatter.category);

  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    alternates: { canonical: `/wiki/${slug}` },
    openGraph: {
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
      type: "article",
      tags: entry.frontmatter.tags,
      publishedTime: entry.frontmatter.date,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630, alt: entry.frontmatter.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function WikiEntryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");
  const entry = getEntry(slug);

  if (!entry) notFound();

  // 읽기 시간 계산 (한국어 평균 500자/분)
  const charCount = entry.content.length;
  const readingTime = Math.max(1, Math.round(charCount / 500));

  const manifest = getManifest();

  // 이전/다음 엔트리 (같은 카테고리 내)
  const sameCat = manifest.entries.filter(
    (e) => e.frontmatter.category === entry.frontmatter.category
  );
  const currentIdx = sameCat.findIndex((e) => e.slug === slug);
  const prevEntry = currentIdx > 0 ? { slug: sameCat[currentIdx - 1].slug, title: sameCat[currentIdx - 1].frontmatter.title } : null;
  const nextEntry = currentIdx < sameCat.length - 1 ? { slug: sameCat[currentIdx + 1].slug, title: sameCat[currentIdx + 1].frontmatter.title } : null;

  // Outgoing connections (이 엔트리가 참조하는 것)
  const outgoing = new Set(entry.frontmatter.connections);
  // Incoming connections (이 엔트리를 참조하는 다른 엔트리)
  const incoming = new Set(
    manifest.entries
      .filter((e) => e.frontmatter.connections.includes(slug))
      .map((e) => e.slug)
  );
  // 양방향 병합
  const allConnectedSlugs = new Set([...outgoing, ...incoming]);

  const connections = Array.from(allConnectedSlugs)
    .map((connSlug) => {
      const found = manifest.entries.find((e) => e.slug === connSlug);
      if (!found) return null;
      return {
        slug: found.slug,
        title: found.frontmatter.title,
        category: found.frontmatter.category,
        confidence: found.frontmatter.confidence,
        description: found.frontmatter.description,
        mutual: outgoing.has(connSlug) && incoming.has(connSlug),
        direction: outgoing.has(connSlug) && incoming.has(connSlug)
          ? "mutual" as const
          : outgoing.has(connSlug)
            ? "outgoing" as const
            : "incoming" as const,
      };
    })
    .filter(Boolean) as Array<{
      slug: string; title: string; category: string; confidence: number; description: string;
      mutual: boolean; direction: "mutual" | "outgoing" | "incoming";
    }>;

  // 같은 카테고리 우선, mutual 우선 정렬
  connections.sort((a, b) => {
    const catA = a.category === entry.frontmatter.category ? 0 : 1;
    const catB = b.category === entry.frontmatter.category ? 0 : 1;
    if (catA !== catB) return catA - catB;
    if (a.mutual !== b.mutual) return a.mutual ? -1 : 1;
    return 0;
  });

  let content;
  try {
    const result = await compileMDX({
      source: entry.content,
      components: mdxComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeMermaid as never,
            [rehypeShiki as never, { theme: "github-dark-default" }],
          ],
        },
      },
    });
    content = result.content;
  } catch {
    content = (
      <div className="rounded-[var(--radius-md)] border border-error bg-error/10 p-4">
        <p className="text-error font-semibold">MDX 컴파일 에러</p>
        <pre className="mt-2 text-sm text-muted whitespace-pre-wrap">
          {entry.content}
        </pre>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.frontmatter.title,
    description: entry.frontmatter.description,
    datePublished: entry.frontmatter.date,
    author: { "@type": "Person", name: "Jominho" },
    publisher: { "@type": "Organization", name: "Mino's AI Study Wiki" },
    url: `https://ai-study-wheat.vercel.app/wiki/${slug}`,
    keywords: entry.frontmatter.tags.join(", "),
  };

  return (
    <article>
      <ScrollProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SummaryCard frontmatter={entry.frontmatter} slug={slug} readingTime={readingTime} />

      <div className="prose-custom">{content}</div>
      <MermaidRenderer />
      <TableOfContents />

      {/* Self-check quiz */}
      {entry.frontmatter.quiz && entry.frontmatter.quiz.length > 0 && (
        <Quiz
          slug={slug}
          category={entry.frontmatter.category}
          questions={entry.frontmatter.quiz}
        />
      )}

      {/* Connected entries */}
      {connections.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="font-display text-lg font-bold mb-4">연결된 개념</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {connections.map((conn) => (
              <Link
                key={conn.slug}
                href={`/wiki/${conn.slug}`}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-accent group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold font-code"
                    style={{
                      background: `color-mix(in srgb, ${CATEGORY_COLORS[conn.category] || "var(--accent)"} 15%, transparent)`,
                      color: CATEGORY_COLORS[conn.category] || "var(--accent)",
                    }}
                  >
                    {conn.category.replace(/-/g, " ")}
                  </span>
                  <span
                    className="text-xs text-muted font-code"
                    title={
                      conn.direction === "mutual"
                        ? "양방향 연결"
                        : conn.direction === "outgoing"
                          ? "이 글이 참조함"
                          : "이 글을 참조함"
                    }
                  >
                    {conn.direction === "mutual" ? "↔" : conn.direction === "outgoing" ? "→" : "←"}
                  </span>
                  <span className="inline-flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="h-1 w-1 rounded-full"
                        style={{ background: i <= conn.confidence ? "var(--accent)" : "var(--border)" }}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                  {conn.title}
                </p>
                <p className="text-xs text-muted mt-1 line-clamp-1">
                  {conn.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <EntryNav prev={prevEntry} next={nextEntry} />
    </article>
  );
}
