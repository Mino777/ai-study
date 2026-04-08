import Link from "next/link";

interface EntryNavProps {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export function EntryNav({ prev, next }: EntryNavProps) {
  if (!prev && !next) return null;

  return (
    <div className="mt-12 border-t border-border pt-6 grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/wiki/${prev.slug}`}
          className="rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-accent group"
        >
          <span className="text-xs text-muted">← 이전</span>
          <p className="text-sm font-medium text-text group-hover:text-accent transition-colors mt-1 truncate">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/wiki/${next.slug}`}
          className="rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-accent group text-right"
        >
          <span className="text-xs text-muted">다음 →</span>
          <p className="text-sm font-medium text-text group-hover:text-accent transition-colors mt-1 truncate">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
