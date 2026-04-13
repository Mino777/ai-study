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

interface SidebarCategory {
  entries: SidebarEntry[];
  subGroups?: Record<string, SidebarEntry[]>;
}

interface SidebarProps {
  data: Record<string, SidebarCategory>;
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

function EntryLink({ entry, pathname }: { entry: SidebarEntry; pathname: string }) {
  const href = `/wiki/${entry.slug}`;
  const isActive = pathname === href;
  return (
    <li>
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
}

function EntryList({
  entries,
  subGroups,
  category,
  pathname,
}: {
  entries: SidebarEntry[];
  subGroups?: Record<string, SidebarEntry[]>;
  category: string;
  pathname: string;
}) {
  // harness-engineering과 ios-ai: journal 엔트리를 탭으로 분리
  if (
    category === "harness-engineering" || category === "ios-ai"
  ) {
    if (subGroups && Object.keys(subGroups).length > 0) {
      return (
        <div className="ml-3.5 mt-0.5 mb-1">
          {/* series가 없는 일반 엔트리 */}
          {entries.length > 0 && (
            <ul className="space-y-0.5 mb-1">
              {entries.map((entry) => (
                <EntryLink key={entry.slug} entry={entry} pathname={pathname} />
              ))}
            </ul>
          )}
          {/* series별 탭 그룹 */}
          <JournalTabGroup
            subGroups={subGroups}
            pathname={pathname}
            category={category}
          />
        </div>
      );
    }
  }

  // 기본: 모든 엔트리를 평탄하게 표시
  return (
    <ul className="ml-3.5 mt-0.5 mb-1 space-y-0.5">
      {entries.map((entry) => (
        <EntryLink key={entry.slug} entry={entry} pathname={pathname} />
      ))}
    </ul>
  );
}

interface JournalTabGroupProps {
  subGroups: Record<string, SidebarEntry[]>;
  pathname: string;
  category: string;
}

function JournalTabGroup({ subGroups, pathname, category }: JournalTabGroupProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // 탭 라벨 맵핑
  const tabLabels: Record<string, string> = {
    "harness-journal": "🌐 Web",
    "ios-ai-journal": "📱 iOS",
  };

  // 현재 활성 엔트리가 어느 탭에 있는지 자동 감지
  const activeTabAuto = Object.entries(subGroups).find(([_, entries]) =>
    entries.some((e) => pathname === `/wiki/${e.slug}`)
  )?.[0];

  const currentTab = activeTab || activeTabAuto;
  const currentEntries = currentTab ? subGroups[currentTab] : [];
  const totalCount = Object.values(subGroups).reduce((sum, e) => sum + e.length, 0);
  const hasActive = currentTab ? currentEntries.some((e) => pathname === `/wiki/${e.slug}`) : activeTabAuto;
  const isOpen = open || !!hasActive;

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 py-1 text-xs font-medium text-muted hover:text-text transition-colors"
      >
        <span className="text-[10px]">📓</span>
        <span className="flex-1 text-left">
          {category === "harness-engineering" ? "Harness Journal" : "iOS AI Journal"}
        </span>
        <span className="text-[10px] text-muted/70">{totalCount}</span>
        <svg
          className={`h-2.5 w-2.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
        </svg>
      </button>

      {isOpen && (
        <div className="ml-3 mt-1 border-l border-border/40 pl-2">
          {/* 탭 버튼 */}
          <div className="flex gap-1 mb-1">
            {Object.keys(subGroups).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                  currentTab === tab
                    ? "bg-surface text-text font-medium"
                    : "text-muted hover:text-text hover:bg-surface-hover"
                }`}
              >
                {tabLabels[tab] || tab}
              </button>
            ))}
          </div>

          {/* 탭 내용 */}
          {currentTab && currentEntries.length > 0 && (
            <ul className="space-y-0.5">
              {currentEntries.map((entry) => (
                <EntryLink key={entry.slug} entry={entry} pathname={pathname} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// 레거시: 기존 JournalSubGroup (호환성용, 사용하지 않음)
function JournalSubGroup({
  journals,
  pathname,
}: {
  journals: SidebarEntry[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const hasActive = journals.some((e) => pathname === `/wiki/${e.slug}`);
  const isOpen = open || hasActive;

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 py-1 text-xs font-medium text-muted hover:text-text transition-colors"
      >
        <span className="text-[10px]">📓</span>
        <span className="flex-1 text-left">Harness Journal</span>
        <span className="text-[10px] text-muted/70">{journals.length}</span>
        <svg
          className={`h-2.5 w-2.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
        </svg>
      </button>
      {isOpen && (
        <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border/40 pl-2">
          {journals.map((entry) => (
            <EntryLink key={entry.slug} entry={entry} pathname={pathname} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({ data }: SidebarProps) {
  const pathname = usePathname();

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
          const groupCategories = group.categories;
          const isGroupOpen = openGroups.has(group.key);
          const groupEntryCount = groupCategories.reduce(
            (sum, cat) => {
              const catData = data[cat];
              const count =
                (catData?.entries?.length ?? 0) +
                (catData?.subGroups
                  ? Object.values(catData.subGroups).reduce((s, e) => s + e.length, 0)
                  : 0);
              return sum + count;
            },
            0
          );

          return (
            <div key={group.key} className="mb-4">
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

              {isGroupOpen && (
                <div className="mt-1 ml-2 border-l border-border/60 pl-2 space-y-1">
                  {groupCategories.map((category) => {
                    const catData = data[category] ?? { entries: [] };
                    const entries = catData.entries || [];
                    const subGroups = catData.subGroups || {};
                    const isCatOpen = openCategories.has(category);
                    const catLabel = CATEGORY_LABELS[category] || category;
                    const totalCount =
                      entries.length +
                      Object.values(subGroups).reduce((s, e) => s + e.length, 0);

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
                          {totalCount > 0 && (
                            <span className="text-[10px] text-muted/70">{totalCount}</span>
                          )}
                          <svg
                            className={`h-2.5 w-2.5 transition-transform ${isCatOpen ? "rotate-90" : ""}`}
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
                          </svg>
                        </button>

                        {isCatOpen && totalCount > 0 && (
                          <EntryList
                            entries={entries}
                            subGroups={subGroups}
                            category={category}
                            pathname={pathname}
                          />
                        )}

                        {isCatOpen && totalCount === 0 && (
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
