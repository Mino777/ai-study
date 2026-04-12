"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { SearchTrigger } from "./search-dialog";

const NAV_ITEMS = [
  { href: "/wiki", label: "Wiki" },
  { href: "/harness-journal", label: "Journal" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/timeline", label: "Timeline" },
  { href: "/projects", label: "Vibe Coding" },
];

export function Header({ fixed = false }: { fixed?: boolean }) {
  const pathname = usePathname();

  return (
    <header
      className={`${
        fixed ? "fixed left-0 right-0" : "sticky"
      } top-0 z-50 h-14 border-b border-border/50 bg-bg/80 backdrop-blur-sm`}
    >
      <div className="flex h-full items-center gap-3 px-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-text hover:text-accent transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Mino&apos;s AI Study Wiki</span>
          <span className="sm:hidden">AI Study</span>
        </Link>

        {/* Center: Search (flex-1 to absorb remaining space, bounded width) */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className="w-full max-w-sm">
            <SearchTrigger />
          </div>
        </div>

        {/* Right: Nav + theme toggle */}
        <nav
          aria-label="메인 네비게이션"
          className="flex items-center gap-1 sm:gap-3 shrink-0"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`hidden md:inline-block rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-surface text-text font-medium"
                    : "text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
