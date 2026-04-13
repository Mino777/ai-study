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

export interface SidebarEntry {
  slug: string;
  title: string;
  confidence: number;
}

export interface SidebarCategory {
  // series가 없는 일반 엔트리
  entries: SidebarEntry[];
  // frontmatter `series` 값으로 그룹화된 엔트리들 (예: "harness-journal", "ios-ai-journal")
  // sidebar.tsx가 SERIES_LABELS와 매칭해서 sub-group으로 렌더
  subGroups: Record<string, SidebarEntry[]>;
}

export function getSidebarData(): Record<string, SidebarCategory> {
  const manifest = getManifest();
  const grouped: Record<string, SidebarCategory> = {};

  for (const entry of manifest.entries) {
    const cat = entry.frontmatter.category;
    if (!grouped[cat]) {
      grouped[cat] = { entries: [], subGroups: {} };
    }

    const sidebarEntry: SidebarEntry = {
      slug: entry.slug,
      title: entry.frontmatter.title,
      confidence: entry.frontmatter.confidence,
    };

    const series = entry.frontmatter.series;
    if (series) {
      if (!grouped[cat].subGroups[series]) {
        grouped[cat].subGroups[series] = [];
      }
      grouped[cat].subGroups[series].push(sidebarEntry);
    } else {
      grouped[cat].entries.push(sidebarEntry);
    }
  }

  return grouped;
}
