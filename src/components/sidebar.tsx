"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_GROUPS } from "@/lib/schema";


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

  // 그룹은 기본적으로 전부 펼침, 카테고리도 기본 펼침.
  // 사용자가 접으면 localStorage로 유지할 수도 있지만 이번 사이클은 세션 단위로만 유지.
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(CATEGORY_GROUPS.map((g) => g.key))
  );
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(CATEGORY_GROUPS.flatMap((g) => g.categories))
  );

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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
        {CATEGORY_GROUPS.map((group) => {
          // 그룹 내 카테고리 중 실제로 엔트리가 있는 것만 표시 (빈 카테고리는 회색으로라도)
          const groupCategories = group.categories;
          const isGroupOpen = openGroups.has(group.key);
          const groupEntryCount = groupCategories.reduce(
            (sum, cat) => sum + (data[cat]?.length ?? 0),
            0,
          );

          return (
            <div key={group.key} className="mb-4">
              {/* Level 1 — 그룹 */}
              <button
                onClick={() => toggleGroup(group.key)}
                className="flex w-full items-center gap-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-text/80 hover:text-text transition-colors"
              >
                <svg
                  className={`h-3 w-3 transition-transform ${isGroupOpen ? "rotate-90" : ""}`}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
                </svg>
                <span className="flex-1 text-left">{group.label}</span>
                <span className="text-muted font-normal text-[10px]">{groupEntryCount}</span>
              </button>

              {/* Level 2 — 카테고리들 */}
              {isGroupOpen && (
                <div className="mt-1 ml-2 border-l border-border/60 pl-2 space-y-1">
                  {groupCategories.map((category) => {
                    const entries = data[category] ?? [];
                    const isCatOpen = openCategories.has(category);
                    const catLabel = CATEGORY_LABELS[category] || category;

                    return (
                      <div key={category}>
                        <button
                          onClick={() => toggleCategory(category)}
                          className="flex w-full items-center gap-2 py-1 text-xs font-medium tracking-wide text-muted hover:text-text transition-colors"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: CATEGORY_COLORS[category] }}
                          />
                          <span className="flex-1 text-left">{catLabel}</span>
                          {entries.length > 0 && (
                            <span className="text-[10px] text-muted/70">{entries.length}</span>
                          )}
                          <svg
                            className={`h-2.5 w-2.5 transition-transform ${isCatOpen ? "rotate-90" : ""}`}
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
                          </svg>
                        </button>

                        {isCatOpen && entries.length > 0 && (
                          <ul className="ml-3.5 mt-0.5 mb-1 space-y-0.5">
                            {entries.map((entry) => {
                              const href = `/wiki/${entry.slug}`;
                              const isActive = pathname === href;

                              return (
                                <li key={entry.slug}>
                                  <Link
                                    href={href}
                                    className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-xs transition-colors ${
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

                        {isCatOpen && entries.length === 0 && (
                          <p className="ml-3.5 py-1 text-[11px] italic text-muted/50">
                            아직 엔트리가 없음
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
