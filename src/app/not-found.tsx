import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-6xl font-black text-text mb-4">404</h1>
      <p className="text-lg text-muted mb-8">
        찾으시는 페이지가 존재하지 않습니다
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-[var(--radius-sm)] bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          홈으로
        </Link>
        <Link
          href="/wiki"
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent"
        >
          위키 목록
        </Link>
      </div>
    </div>
  );
}
