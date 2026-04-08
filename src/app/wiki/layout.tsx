import Link from "next/link";
import { getSidebarData } from "@/lib/content";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = getSidebarData();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-bg/80 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-text hover:text-accent transition-colors"
          >
            AI Study Wiki
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-muted hover:text-text transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        <Sidebar data={sidebarData} />
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
