"use client";

import { useState } from "react";

export type ProjectCategory = "all" | "methodology" | "infrastructure" | "learning";

interface ProjectTabsProps {
  categories: ProjectCategory[];
  onCategoryChange: (category: ProjectCategory) => void;
  currentCategory: ProjectCategory;
}

export function ProjectTabs({
  categories,
  onCategoryChange,
  currentCategory,
}: ProjectTabsProps) {
  const categoryLabels: Record<ProjectCategory, string> = {
    all: "모든 프로젝트",
    methodology: "🛠️ AI 엔지니어링 방법론",
    infrastructure: "⚙️ 인프라 & 도구",
    learning: "📚 학습 플랫폼",
  };

  return (
    <div className="flex gap-2 mb-8 flex-wrap">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
            currentCategory === category
              ? "bg-accent text-bg font-semibold"
              : "bg-surface border border-border text-text hover:border-accent hover:text-accent"
          }`}
        >
          {categoryLabels[category]}
        </button>
      ))}
    </div>
  );
}
