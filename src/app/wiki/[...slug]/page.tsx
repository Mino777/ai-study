import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import { getEntry, getAllSlugs, getManifest } from "@/lib/content";
import { SummaryCard } from "@/components/summary-card";
import { mdxComponents } from "@/components/mdx-components";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "var(--cat-prompt)",
  rag: "var(--cat-rag)",
  agents: "var(--cat-agents)",
  "fine-tuning": "var(--cat-finetune)",
  evaluation: "var(--cat-eval)",
  infrastructure: "var(--cat-infra)",
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

  return {
    title: `${entry.frontmatter.title} — AI Study Wiki`,
    description: entry.frontmatter.description,
    openGraph: {
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
      type: "article",
      tags: entry.frontmatter.tags,
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

  const manifest = getManifest();
  const connections = entry.frontmatter.connections
    .map((connSlug) => {
      const found = manifest.entries.find((e) => e.slug === connSlug);
      return found ? { slug: found.slug, title: found.frontmatter.title, category: found.frontmatter.category } : null;
    })
    .filter(Boolean) as Array<{ slug: string; title: string; category: string }>;

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

  return (
    <article>
      <SummaryCard frontmatter={entry.frontmatter} />

      <div className="prose-custom">{content}</div>

      {/* Connected entries */}
      {connections.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="font-display text-lg font-bold mb-4">연결된 개념</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {connections.map((conn) => (
              <Link
                key={conn.slug}
                href={`/wiki/${conn.slug}`}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-accent"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[conn.category] || "var(--accent)" }}
                />
                <span className="text-sm font-medium text-text">{conn.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
