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
  entries: SidebarEntry[];
  subGroups?: Record<string, SidebarEntry[]>;
}

export function getSidebarData(): Record<string, SidebarCategory> {
  const manifest = getManifest();
  const grouped: Record<string, SidebarCategory> = {};

  for (const entry of manifest.entries) {
    const cat = entry.frontmatter.category;
    if (!grouped[cat]) {
      grouped[cat] = { entries: [], subGroups: {} };
    }

    const sidebarEntry = {
      slug: entry.slug,
      title: entry.frontmatter.title,
      confidence: entry.frontmatter.confidence,
    };

    // If entry has a series field, add to subGroups; otherwise add to entries
    if (entry.frontmatter.series) {
      if (!grouped[cat].subGroups) grouped[cat].subGroups = {};
      if (!grouped[cat].subGroups![entry.frontmatter.series]) {
        grouped[cat].subGroups![entry.frontmatter.series] = [];
      }
      grouped[cat].subGroups![entry.frontmatter.series].push(sidebarEntry);
    } else {
      grouped[cat].entries.push(sidebarEntry);
    }
  }

  return grouped;
}
