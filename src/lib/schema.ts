import { z } from "zod";

export const CATEGORIES = [
  "prompt-engineering",
  "context-engineering",
  "harness-engineering",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "infrastructure",
  "ios-ai",
  "frontend-ai",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  "prompt-engineering": "Prompt Engineering",
  "context-engineering": "Context Engineering",
  "harness-engineering": "Harness Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
  "ios-ai": "iOS + AI",
  "frontend-ai": "Frontend + AI",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  "prompt-engineering": "#f59e0b",
  "context-engineering": "#eab308",
  "harness-engineering": "#84cc16",
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
  "ios-ai": "#3b82f6",
  "frontend-ai": "#a855f7",
};

export const frontmatterSchema = z.object({
  title: z.string(),
  category: z.enum(CATEGORIES),
  date: z.string(),
  tags: z.array(z.string()),
  confidence: z.number().min(1).max(5).default(1),
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
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
  };
  stats: {
    totalEntries: number;
    totalComplete: number;
    avgConfidence: number;
    categoryStats: Record<string, { count: number; avgConfidence: number; complete: number }>;
    weeklyStats: Array<{ week: string; count: number; startDate: string; endDate: string }>;
    recentEntries: Array<{ slug: string; title: string; date: string; category: string }>;
  };
}
