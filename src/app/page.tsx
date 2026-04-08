import { Suspense } from "react";
import Link from "next/link";
import { getManifest } from "@/lib/content";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { MobileCategories } from "@/components/mobile-categories";
import { ThemeToggle } from "@/components/theme-toggle";

function GraphSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-surface/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full bg-border animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted">그래프 로딩 중...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const manifest = getManifest();
  const entryCount = manifest.entries.length;
  const avgConfidence =
    entryCount > 0
      ? (
          manifest.entries.reduce(
            (sum, e) => sum + e.frontmatter.confidence,
            0
          ) / entryCount
        ).toFixed(1)
      : "0";
  const categories = new Set(manifest.entries.map((e) => e.frontmatter.category));

  return (
    <div className="min-h-screen bg-bg">
      {/* Header overlay */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 bg-bg/50 backdrop-blur-sm border-b border-border/50">
        <h1 className="font-display text-lg font-bold tracking-tight text-text">
          AI Study Wiki
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/wiki/prompt-engineering/few-shot-prompting"
            className="text-sm text-muted hover:text-text transition-colors hidden sm:block"
          >
            Wiki
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Graph hero — desktop */}
      <div
        className="hidden lg:block"
        style={{ height: "calc(100vh - 56px)", marginTop: 56 }}
      >
        <Suspense fallback={<GraphSkeleton />}>
          <KnowledgeGraph
            nodes={manifest.graph.nodes}
            edges={manifest.graph.edges}
          />
        </Suspense>
      </div>

      {/* Mobile categories — mobile/tablet */}
      <div className="lg:hidden pt-14">
        <div className="px-4 py-6">
          <h2 className="font-display text-3xl font-black tracking-tight mb-2">
            AI Harness Engineering
          </h2>
          <p className="text-muted mb-6">
            프롬프트 엔지니어링, RAG, 에이전트, 파인튜닝을 체계적으로 학습
          </p>
        </div>
        <MobileCategories manifest={manifest} />
      </div>

      {/* Stats bar */}
      <div className="border-t border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-8 px-4 py-3">
          <div className="text-center">
            <div className="font-data text-lg font-semibold text-text">
              {entryCount}
            </div>
            <div className="text-xs text-muted">엔트리</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-semibold text-text">
              {categories.size}
            </div>
            <div className="text-xs text-muted">카테고리</div>
          </div>
          <div className="text-center">
            <div className="font-data text-lg font-semibold text-text">
              {avgConfidence}
            </div>
            <div className="text-xs text-muted">평균 Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
