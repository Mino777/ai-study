import type { MetadataRoute } from "next";
import { getManifest } from "@/lib/content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-study.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const manifest = getManifest();

  const wikiEntries = manifest.entries.map((entry) => ({
    url: `${BASE_URL}/wiki/${entry.slug}`,
    lastModified: new Date(entry.frontmatter.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...wikiEntries,
  ];
}
