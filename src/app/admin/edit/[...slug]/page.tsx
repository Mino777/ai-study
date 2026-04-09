"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EntryEditor } from "@/components/admin/entry-editor";

export default function AdminEditPage() {
  const params = useParams();
  const slugParts = params.slug as string[];
  const slug = slugParts.join("/");

  const [data, setData] = useState<{
    frontmatter: Record<string, unknown>;
    content: string;
    sha: string;
  } | null>(null);
  const [allSlugs, setAllSlugs] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/entries/${slug}`).then((r) => {
        if (!r.ok) throw new Error("엔트리를 찾을 수 없습니다");
        return r.json();
      }),
      fetch("/api/admin/entries")
        .then((r) => r.json())
        .then((entries: Array<{ slug: string }>) =>
          entries.map((e) => e.slug)
        ),
    ])
      .then(([entryData, slugs]) => {
        setData(entryData);
        setAllSlugs(slugs);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <div className="rounded-[var(--radius-md)] border border-error bg-error/10 p-4">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted">로딩 중...</p>;
  }

  return (
    <EntryEditor
      mode="edit"
      slug={slug}
      initialFrontmatter={data.frontmatter as never}
      initialContent={data.content}
      initialSha={data.sha}
      allSlugs={allSlugs}
    />
  );
}
