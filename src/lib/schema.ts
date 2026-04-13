import { z } from "zod";

export const CATEGORIES = [
  "prompt-engineering",
  "context-engineering",
  "harness-engineering",
  "tokenomics",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "infrastructure",
  "ios-ai",
  "frontend-ai",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  "prompt-engineering": "Prompt Engineering",
  "context-engineering": "Context Engineering",
  "harness-engineering": "Harness Engineering",
  tokenomics: "Tokenomics",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
  "ios-ai": "iOS + AI",
  "frontend-ai": "Frontend + AI",
};

// 시리즈(frontmatter `series` 필드) 라벨/아이콘. 사이드바 sub-group 헤더에 사용.
// 새 시리즈 추가 시 여기에 한 줄 추가하면 사이드바가 자동으로 그룹화한다.
export const SERIES_LABELS: Record<string, { label: string; icon: string }> = {
  "harness-journal": { label: "Harness Journal", icon: "📓" },
  "ios-ai-journal": { label: "iOS Journal", icon: "📱" },
};

export const CATEGORY_COLORS: Record<string, string> = {
  "prompt-engineering": "#f59e0b",
  "context-engineering": "#eab308",
  "harness-engineering": "#84cc16",
  tokenomics: "#14b8a6", // teal — 토큰 경제학, 지속 연구/디벨롭 영역
  rag: "#10b981",
  agents: "#8b5cf6",
  "fine-tuning": "#ec4899",
  evaluation: "#06b6d4",
  infrastructure: "#f97316",
  "ios-ai": "#3b82f6",
  "frontend-ai": "#a855f7",
};

// 사이드바용 카테고리 그룹. 엔트리 수가 늘어나면서 10 카테고리가 한꺼번에 펼쳐지면
// 시각적으로 힘들어서 상위 그룹(서브메뉴)으로 묶는다. 그룹 자체도 접이식.
export const CATEGORY_GROUPS: Array<{
  key: string;
  label: string;
  categories: Category[];
}> = [
  {
    key: "methodology",
    label: "AI 엔지니어링 방법론",
    categories: ["prompt-engineering", "context-engineering", "harness-engineering", "tokenomics"],
  },
  {
    key: "system",
    label: "시스템 설계",
    categories: ["rag", "agents", "fine-tuning"],
  },
  {
    key: "ops",
    label: "평가 & 인프라",
    categories: ["evaluation", "infrastructure"],
  },
  {
    key: "applications",
    label: "응용",
    categories: ["ios-ai", "frontend-ai"],
  },
];

export const quizQuestionSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explanation: z.string().optional(),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

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
  series: z.string().optional(),
  quiz: z.array(quizQuestionSchema).optional(),
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
  dailyEntries: Record<string, number>;
  stats: {
    totalEntries: number;
    totalComplete: number;
    avgConfidence: number;
    categoryStats: Record<string, { count: number; avgConfidence: number; complete: number }>;
    weeklyStats: Array<{ week: string; count: number; startDate: string; endDate: string }>;
    recentEntries: Array<{ slug: string; title: string; date: string; category: string }>;
  };
}
