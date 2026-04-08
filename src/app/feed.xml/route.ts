import { getManifest } from "@/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-study-wheat.vercel.app";

export async function GET() {
  const manifest = getManifest();

  const entries = [...manifest.entries]
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
    .slice(0, 20);

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(entry.frontmatter.title)}</title>
      <link>${BASE_URL}/wiki/${entry.slug}</link>
      <description>${escapeXml(entry.frontmatter.description)}</description>
      <pubDate>${new Date(entry.frontmatter.date).toUTCString()}</pubDate>
      <guid>${BASE_URL}/wiki/${entry.slug}</guid>
      <category>${entry.frontmatter.category}</category>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Study Wiki</title>
    <link>${BASE_URL}</link>
    <description>AI 하네스 엔지니어링 학습 위키</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
