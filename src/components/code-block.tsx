"use client";

import { useState, useRef } from "react";

export function CodeBlock({ children, ...props }: React.ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  async function handleCopy() {
    const text = preRef.current?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="relative group">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 rounded-[var(--radius-sm)] border border-border bg-bg/80 px-2 py-1 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-text hover:border-accent backdrop-blur-sm"
      >
        {copied ? "복사됨 ✓" : "복사"}
      </button>
    </div>
  );
}
