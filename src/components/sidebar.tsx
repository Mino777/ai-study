"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  "prompt-engineering": "Prompt Engineering",
  rag: "RAG",
  agents: "Agents",
  "fine-tuning": "Fine-tuning",
  evaluation: "Evaluation",
  infrastructure: "Infrastructure",
  "ios-ai": "iOS + AI",
  "frontend-ai": "Frontend + AI",
  "context-engineering": "Context Engineering",
  "harness-engineering": "Harness Engineering",
};

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

interface SidebarEntry {
  slug: string;
  title: string;
  confidence: number;
}

interface SidebarProps {
  data: Record<string, SidebarEntry[]>;
}

function ConfidenceDots({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5 ml-auto">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: i <= level ? "var(--accent)" : "var(--border)",
          }}
        />
      ))}
    </span>
  );
}

export function Sidebar({ data }: SidebarProps) {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(Object.keys(data))
  );

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <nav className="w-64 shrink-0 border-r border-border bg-bg overflow-y-auto h-[calc(100vh-56px)] sticky top-14 hidden lg:block">
      <div className="p-4">
        {Object.entries(data).map(([category, entries]) => (
          <div key={category} className="mb-3">
            <button
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center gap-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-text transition-colors"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: CATEGORY_COLORS[category] }}
              />
              {CATEGORY_LABELS[category] || category}
              <svg
                className={`ml-auto h-3 w-3 transition-transform ${
                  openCategories.has(category) ? "rotate-90" : ""
                }`}
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
              </svg>
            </button>

            {openCategories.has(category) && (
              <ul className="ml-4 mt-1 space-y-0.5">
                {entries.map((entry) => {
                  const href = `/wiki/${entry.slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={entry.slug}>
                      <Link
                        href={href}
                        className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-surface text-text"
                            : "text-muted hover:text-text hover:bg-surface-hover"
                        }`}
                      >
                        <span className="truncate flex-1">{entry.title}</span>
                        <ConfidenceDots level={entry.confidence} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
