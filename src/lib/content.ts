import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentManifest, Frontmatter, WikiEntry } from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "generated",
  "content-manifest.json"
);

export function getManifest(): ContentManifest {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(raw);
}

export function getEntry(slug: string): WikiEntry | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    frontmatter: data as Frontmatter,
    content,
  };
}

export function getAllSlugs(): string[] {
  const manifest = getManifest();
  return manifest.entries.map((e) => e.slug);
}

export function getEntriesByCategory(category: string) {
  const manifest = getManifest();
  return manifest.entries.filter((e) => e.frontmatter.category === category);
}

export function getSidebarData() {
  const manifest = getManifest();
  const grouped: Record<string, Array<{ slug: string; title: string; confidence: number }>> = {};

  for (const entry of manifest.entries) {
    const cat = entry.frontmatter.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({
      slug: entry.slug,
      title: entry.frontmatter.title,
      confidence: entry.frontmatter.confidence,
    });
  }

  return grouped;
}
