"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/schema";
import type { Category } from "@/lib/schema";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function Tip({ text }: { text: string }) {
  return (
    <span className="relative group ml-1 cursor-help">
      <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-border text-[9px] font-bold text-muted">?</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-52 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-xs text-text shadow-lg z-50 leading-relaxed">
        {text}
      </span>
    </span>
  );
}

interface Frontmatter {
  title: string;
  category: Category;
  date: string;
  tags: string[];
  confidence: number;
  connections: string[];
  status: "draft" | "in-progress" | "complete";
  description: string;
  type: "entry" | "til";
}

interface EntryEditorProps {
  mode: "new" | "edit";
  slug?: string;
  initialFrontmatter?: Frontmatter;
  initialContent?: string;
  initialSha?: string;
  allSlugs?: string[];
}

const DEFAULT_FRONTMATTER: Frontmatter = {
  title: "",
  category: "prompt-engineering",
  date: new Date().toISOString().split("T")[0],
  tags: [],
  confidence: 1,
  connections: [],
  status: "draft",
  description: "",
  type: "entry",
};

export function EntryEditor({
  mode,
  slug,
  initialFrontmatter,
  initialContent,
  initialSha,
  allSlugs = [],
}: EntryEditorProps) {
  const router = useRouter();
  const [fm, setFm] = useState<Frontmatter>(
    initialFrontmatter || DEFAULT_FRONTMATTER
  );
  const [content, setContent] = useState(initialContent || "");
  const [sha, setSha] = useState(initialSha || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const updateFm = useCallback(
    <K extends keyof Frontmatter>(key: K, value: Frontmatter[K]) => {
      setFm((prev) => ({ ...prev, [key]: value }));
      setDirty(true);
    },
    []
  );

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !fm.tags.includes(tag)) {
      updateFm("tags", [...fm.tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    updateFm(
      "tags",
      fm.tags.filter((t) => t !== tag)
    );
  }

  function toggleConnection(s: string) {
    if (fm.connections.includes(s)) {
      updateFm(
        "connections",
        fm.connections.filter((c) => c !== s)
      );
    } else {
      updateFm("connections", [...fm.connections, s]);
    }
  }

  async function handleSave() {
    if (!fm.title.trim()) {
      setError("제목을 입력하세요");
      return;
    }
    if (!fm.description.trim()) {
      setError("설명을 입력하세요");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (mode === "new") {
        const res = await fetch("/api/admin/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frontmatter: fm, content }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "생성 실패");
        setDirty(false);
        router.push("/admin");
      } else {
        const res = await fetch(`/api/admin/entries/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frontmatter: fm, content, sha }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "수정 실패");
        setSha(data.sha);
        setDirty(false);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-black text-text">
          {mode === "new" ? "새 엔트리" : "엔트리 수정"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm text-muted hover:border-accent transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-[var(--radius-md)] bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving
              ? "저장 중..."
              : mode === "new"
                ? "발행"
                : "저장"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-error bg-error/10 px-4 py-3 text-sm text-error mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left: Frontmatter form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              제목<Tip text="위키 목록과 검색에 표시됩니다. 핵심 키워드를 포함하세요." />
            </label>
            <input
              type="text"
              value={fm.title}
              onChange={(e) => updateFm("title", e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="엔트리 제목"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              설명<Tip text="카드 미리보기와 OG 이미지에 표시되는 한 줄 요약입니다." />
            </label>
            <textarea
              value={fm.description}
              onChange={(e) => updateFm("description", e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none resize-none"
              rows={2}
              placeholder="한 줄 요약"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              카테고리<Tip text="10개 학습 영역 중 하나를 선택. 파일 경로와 그래프 노드 색상이 결정됩니다." />
            </label>
            <select
              value={fm.category}
              onChange={(e) => updateFm("category", e.target.value as Category)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1.5 font-semibold">
                날짜<Tip text="학습 날짜. 스트릭과 히트맵에 반영됩니다." />
              </label>
              <input
                type="date"
                value={fm.date}
                onChange={(e) => updateFm("date", e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5 font-semibold">
                상태<Tip text="초안: 비공개, 작성 중: 표시되지만 미완성 표시, 완료: 정식 공개" />
              </label>
              <select
                value={fm.status}
                onChange={(e) =>
                  updateFm(
                    "status",
                    e.target.value as "draft" | "in-progress" | "complete"
                  )
                }
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              >
                <option value="draft">초안</option>
                <option value="in-progress">작성 중</option>
                <option value="complete">완료</option>
              </select>
            </div>
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              Confidence: {fm.confidence}<Tip text="이 주제에 대한 이해도. 1=들어봤다, 3=적용했다, 5=가르칠 수 있다. 그래프 노드 크기에 반영." />
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => updateFm("confidence", n)}
                  className={`flex-1 rounded-[var(--radius-sm)] border py-1.5 text-xs font-semibold transition-colors ${
                    n <= fm.confidence
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">
              {
                ["", "들어봤다", "이해했다", "적용했다", "깊이 안다", "가르칠 수 있다"][
                  fm.confidence
                ]
              }
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              타입<Tip text="엔트리: 정식 학습 글. TIL: Today I Learned, 짧은 메모." />
            </label>
            <div className="flex gap-2">
              {(["entry", "til"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateFm("type", t)}
                  className={`flex-1 rounded-[var(--radius-sm)] border py-1.5 text-xs font-semibold transition-colors ${
                    fm.type === t
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {t === "entry" ? "엔트리" : "TIL"}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              태그<Tip text="검색과 분류에 사용됩니다. 소문자 영어로 입력, Enter로 추가." />
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {fm.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs text-text"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-muted hover:text-error"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-accent focus:outline-none"
                placeholder="태그 입력 후 Enter"
              />
            </div>
          </div>

          {/* Connections */}
          <div>
            <label className="block text-xs text-muted mb-1.5 font-semibold">
              연결 ({fm.connections.length})<Tip text="관련 엔트리를 선택하면 지식 그래프에서 선으로 연결되고, 글 하단에 '관련 엔트리'로 표시됩니다." />
            </label>
            <div className="max-h-40 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-bg p-2 space-y-1">
              {allSlugs
                .filter((s) => s !== slug)
                .map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 text-xs text-text cursor-pointer hover:bg-surface rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={fm.connections.includes(s)}
                      onChange={() => toggleConnection(s)}
                      className="accent-[var(--accent)]"
                    />
                    <span className="truncate">{s}</span>
                  </label>
                ))}
              {allSlugs.length === 0 && (
                <p className="text-xs text-muted">엔트리 없음</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: MDX editor */}
        <div
          className="min-h-[600px]"
          data-color-mode="dark"
        >
          <label className="block text-xs text-muted mb-1.5 font-semibold">
            본문 (MDX)<Tip text="마크다운 + JSX. ## 제목, **굵게**, ```코드블록```, > 인용, - 목록 등. 좌측 편집, 우측 미리보기." />
          </label>
          <MDEditor
            value={content}
            onChange={(val) => {
              setContent(val || "");
              setDirty(true);
            }}
            height={600}
            preview="live"
            visibleDragbar={false}
          />
        </div>
      </div>
    </div>
  );
}
