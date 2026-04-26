"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Hidden easter-egg navigation:
 *   R × 5 → /resume
 *   I × 5 → /interview
 *
 * Resets after 1.5s of inactivity.
 * Disabled on /resume and /interview pages (already there).
 * Disabled when focus is in an input/textarea/contenteditable.
 */
export function EasterEggNav() {
  const router = useRouter();
  const pathname = usePathname();
  const bufferRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      // Skip modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key !== "r" && key !== "i") {
        bufferRef.current = [];
        return;
      }

      // Must be same key as buffer
      if (bufferRef.current.length > 0 && bufferRef.current[0] !== key) {
        bufferRef.current = [key];
      } else {
        bufferRef.current.push(key);
      }

      // Reset timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { bufferRef.current = []; }, 1500);

      // Check for 5 consecutive
      if (bufferRef.current.length >= 5) {
        const target = key === "r" ? "/resume" : "/interview";
        bufferRef.current = [];
        if (pathname !== target) {
          router.push(target);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return null;
}
