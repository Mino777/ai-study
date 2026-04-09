"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGraphSearch } from "@/contexts/graph-search-context";
import { CATEGORY_COLORS } from "@/lib/schema";

interface SearchEntry {
  slug: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
}


interface SearchDialogProps {
  entries: SearchEntry[];
}

export function SearchDialog({ entries }: SearchDialogProps) {
  const router = useRouter();
  const { highlightNodes, clearHighlights } = useGraphSearch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build search index on mount
  const searchIndex = useMemo(() => {
    // Simple search: match against title, description, tags, category
    return entries;
  }, [entries]);

  const results = useMemo(() => {
    if (!query.trim()) {
      // Empty query: show recent entries (all, sorted as-is)
      return entries.slice(0, 8);
    }
    const q = query.toLowerCase();
    return searchIndex
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, searchIndex, entries]);

  // Reset selected index and sync graph highlights when results change
  useEffect(() => {
    setSelectedIndex(0);
    if (query.trim() && results.length > 0) {
      highlightNodes(results.map((r) => r.slug));
    } else {
      clearHighlights();
    }
  }, [results, query, highlightNodes, clearHighlights]);

  // Cmd+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
        clearHighlights();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback(
    (slug: string) => {
      setOpen(false);
      clearHighlights();
      router.push(`/wiki/${slug}`);
    },
    [router, clearHighlights]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].slug);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => { setOpen(false); clearHighlights(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-bg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            className="text-muted shrink-0"
          >
            <circle cx="7" cy="7" r="5" strokeWidth="1.5" />
            <path d="M11 11l3 3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색..."
            className="flex-1 bg-transparent text-text outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-xs text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted">
              검색 결과가 없습니다
            </div>
          ) : (
            <>
              {!query.trim() && (
                <div className="px-3 py-1 text-xs text-muted">최근 엔트리</div>
              )}
              {results.map((entry, i) => (
                <button
                  key={entry.slug}
                  onClick={() => navigate(entry.slug)}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors ${
                    i === selectedIndex
                      ? "bg-surface text-text"
                      : "text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      background: CATEGORY_COLORS[entry.category] || "var(--accent)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {entry.title}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {entry.description}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 text-xs text-muted flex gap-4">
          <span>
            <kbd className="rounded border border-border px-1 py-0.5 mr-1">↑↓</kbd>
            이동
          </span>
          <span>
            <kbd className="rounded border border-border px-1 py-0.5 mr-1">↵</kbd>
            열기
          </span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger() {
  return (
    <button
      onClick={() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        );
      }}
      className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-text"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor">
        <circle cx="7" cy="7" r="5" strokeWidth="1.5" />
        <path d="M11 11l3 3" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">검색</span>
      <kbd className="rounded border border-border px-1 py-0.5 text-xs">⌘K</kbd>
    </button>
  );
}
