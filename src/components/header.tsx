"use client";

import { useEffect, useState } from "react";
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

const RESUME_ITEM = { href: "/resume", label: "Resume" };
const SECRET_KEY = "r";
const SECRET_COUNT = 5;
const SECRET_TIMEOUT = 2000;

export function Header({ fixed = false }: { fixed?: boolean }) {
  const pathname = usePathname();
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    let count = 0;
    let timer: ReturnType<typeof setTimeout>;

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key.toLowerCase() === SECRET_KEY) {
        count++;
        clearTimeout(timer);
        timer = setTimeout(() => {
          count = 0;
        }, SECRET_TIMEOUT);

        if (count >= SECRET_COUNT) {
          setShowResume(true);
          count = 0;
        }
      } else {
        count = 0;
        clearTimeout(timer);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  return (
    <header
      className={`site-header ${
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
          {showResume && (() => {
            const isActive =
              pathname === RESUME_ITEM.href || pathname.startsWith(RESUME_ITEM.href + "/");
            return (
              <Link
                href={RESUME_ITEM.href}
                className={`hidden md:inline-block rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm transition-colors animate-in fade-in duration-300 ${
                  isActive
                    ? "bg-surface text-text font-medium"
                    : "text-muted hover:text-text"
                }`}
              >
                {RESUME_ITEM.label}
              </Link>
            );
          })()}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
