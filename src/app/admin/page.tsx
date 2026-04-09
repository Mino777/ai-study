"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS } from "@/lib/schema";
import type { Category } from "@/lib/schema";

interface Entry {
  slug: string;
  frontmatter: {
    title: string;
    category: string;
    date: string;
    status: string;
    confidence: number;
    description: string;
  };
}


export default function AdminDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/entries")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter
    ? entries.filter((e) => e.frontmatter.category === filter)
    : entries;

  const categories = [...new Set(entries.map((e) => e.frontmatter.category))];

  async function handleDelete(entry: Entry) {
    if (!confirm(`"${entry.frontmatter.title}" 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/admin/entries/${entry.slug}`, {
      method: "GET",
    });
    const { sha } = await res.json();

    await fetch(`/api/admin/entries/${entry.slug}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha }),
    });

    setEntries((prev) => prev.filter((e) => e.slug !== entry.slug));
  }

  if (loading) {
    return <p className="text-muted">로딩 중...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-text">
            엔트리 관리
          </h1>
          <p className="text-muted mt-1">{entries.length}개의 엔트리</p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-[var(--radius-md)] bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          + 새 엔트리
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
            !filter
              ? "bg-accent/10 border-accent text-accent"
              : "border-border text-muted hover:border-accent/50"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat === filter ? "" : cat)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              cat === filter
                ? "border-accent text-accent"
                : "border-border text-muted hover:border-accent/50"
            }`}
            style={
              cat === filter
                ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] }
                : {}
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Entry list */}
      <div className="space-y-3">
        {filtered.map((entry) => (
          <div
            key={entry.slug}
            className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border bg-surface p-4 group"
          >
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{
                background: CATEGORY_COLORS[entry.frontmatter.category],
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-text truncate">
                {entry.frontmatter.title}
              </h3>
              <p className="text-xs text-muted truncate">
                {entry.frontmatter.date} · {entry.frontmatter.status} ·
                confidence {entry.frontmatter.confidence}
              </p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => router.push(`/admin/edit/${entry.slug}`)}
                className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-xs text-text hover:border-accent transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(entry)}
                className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-xs text-error hover:border-error transition-colors"
              >
                삭제
              </button>
              <Link
                href={`/wiki/${entry.slug}`}
                className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-xs text-muted hover:border-accent transition-colors"
              >
                보기
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
