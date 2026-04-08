"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border text-muted transition-colors hover:text-text hover:border-accent"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 1zm0 10a3 3 0 100-6 3 3 0 000 6zm5.657-1.343a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zm-9.193 1.06a.75.75 0 01-1.06-1.06l1.06-1.061a.75.75 0 111.06 1.06l-1.06 1.061zM15 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0115 8zM3.25 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 013.25 8zm9.407-4.657a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zM4.464 5.524a.75.75 0 01-1.06-1.06l1.06-1.061a.75.75 0 011.06 1.06L4.464 5.524zM8 12.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 12.5z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.2 1.2a.75.75 0 00-1.013.913 5.5 5.5 0 008.698 8.698.75.75 0 00.913-1.013 7 7 0 11-8.598-8.598z" />
        </svg>
      )}
    </button>
  );
}
