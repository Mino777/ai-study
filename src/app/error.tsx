"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <p className="font-data text-6xl font-bold text-error mb-4">오류</p>
      <h1 className="font-display text-2xl font-black text-text mb-3">
        문제가 발생했습니다
      </h1>
      <p className="text-muted mb-8 text-center max-w-md">
        페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="rounded-[var(--radius-md)] bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
