import Link from "next/link";
import type { ContentManifest } from "@/lib/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/schema";


interface MobileCategoriesProps {
  manifest: ContentManifest;
}

export function MobileCategories({ manifest }: MobileCategoriesProps) {
  const grouped: Record<string, typeof manifest.entries> = {};
  for (const entry of manifest.entries) {
    const cat = entry.frontmatter.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  if (manifest.entries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center px-6">
          <p className="text-2xl text-muted mb-2">아직 엔트리가 없습니다</p>
          <p className="text-sm text-muted">첫 번째 위키 엔트리를 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {Object.entries(grouped).map(([category, entries]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: CATEGORY_COLORS[category] }}
            />
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {CATEGORY_LABELS[category] || category}
            </h2>
            <span className="text-xs text-muted">({entries.length})</span>
          </div>
          <div className="space-y-2">
            {entries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/wiki/${entry.slug}`}
                className="block rounded-[var(--radius-md)] border border-border bg-surface p-3 transition-colors hover:border-accent active:bg-surface-hover"
              >
                <p className="text-sm font-medium text-text">
                  {entry.frontmatter.title}
                </p>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                  {entry.frontmatter.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
