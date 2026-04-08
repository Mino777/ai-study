import { z } from "zod";

export const CATEGORIES = [
  "prompt-engineering",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "infrastructure",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  "prompt-engineering": "Prompt Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  "prompt-engineering": "#f59e0b",
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
};

export const frontmatterSchema = z.object({
  title: z.string(),
  category: z.enum(CATEGORIES),
  date: z.string(),
  tags: z.array(z.string()),
  confidence: z.number().min(1).max(5),
  connections: z.array(z.string()).default([]),
  status: z.enum(["draft", "in-progress", "complete"]).default("draft"),
  description: z.string(),
  type: z.enum(["entry", "til"]).default("entry"),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface WikiEntry {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
}

export interface ContentManifest {
  entries: Array<{
    slug: string;
    frontmatter: Frontmatter;
  }>;
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      category: Category;
      confidence: number;
      description: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
    }>;
  };
}
