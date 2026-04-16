"use client";

import Link from "next/link";
import { useState } from "react";

export interface JournalEntry {
  slug: string;
  episode: number;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
  };
}

interface HarnessJournalClientProps {
  webEpisodes: JournalEntry[];
  iosEpisodes: JournalEntry[];
  maoEpisodes: JournalEntry[];
  firstDate?: string;
  lastDate?: string;
}

export function HarnessJournalClient({
  webEpisodes,
  iosEpisodes,
  maoEpisodes,
  firstDate,
  lastDate,
}: HarnessJournalClientProps) {
  const [activeTab, setActiveTab] = useState<"web" | "ios" | "mao">("web");

  const episodes = activeTab === "web" ? webEpisodes : activeTab === "ios" ? iosEpisodes : maoEpisodes;
  const totalEpisodes = webEpisodes.length + iosEpisodes.length + maoEpisodes.length;

  return (
    <>
      {/* Stats */}
      <div className="rounded-[var(--radius-md)] border border-accent/20 bg-accent/5 p-5 mb-8">
        <div className="flex flex-wrap items-start gap-6 text-sm">
          <div>
            <div className="text-xs text-muted">총 에피소드</div>
            <div className="font-data text-2xl font-semibold text-text">{totalEpisodes}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Web + Backend</div>
            <div className="font-data text-2xl font-semibold text-text">{webEpisodes.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted">iOS</div>
            <div className="font-data text-2xl font-semibold text-text">{iosEpisodes.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted">MAO</div>
            <div className="font-data text-2xl font-semibold text-text">{maoEpisodes.length}</div>
          </div>
          {firstDate && (
            <div>
              <div className="text-xs text-muted">시작</div>
              <div className="font-data text-base font-medium text-text">{firstDate}</div>
            </div>
          )}
          {lastDate && (
            <div>
              <div className="text-xs text-muted">마지막 업데이트</div>
              <div className="font-data text-base font-medium text-text">{lastDate}</div>
            </div>
          )}
          <div className="flex-1 min-w-[200px] text-xs text-muted leading-relaxed border-l border-border pl-4">
            Compound Engineering 원칙 —{" "}
            <span className="text-text font-semibold">
              행동에 박는 가드 &gt; 기억에 의존하는 가드
            </span>
          </div>
        </div>
      </div>

      {/* 🌐 Web | 📱 iOS 탭 */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("web")}
          className={`px-5 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
            activeTab === "web"
              ? "bg-accent text-bg font-semibold"
              : "bg-surface border border-border text-text hover:border-accent hover:text-accent"
          }`}
        >
          🌐 Web + Backend
        </button>
        <button
          onClick={() => setActiveTab("ios")}
          className={`px-5 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
            activeTab === "ios"
              ? "bg-accent text-bg font-semibold"
              : "bg-surface border border-border text-text hover:border-accent hover:text-accent"
          }`}
        >
          📱 iOS
        </button>
        <button
          onClick={() => setActiveTab("mao")}
          className={`px-5 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
            activeTab === "mao"
              ? "bg-accent text-bg font-semibold"
              : "bg-surface border border-border text-text hover:border-accent hover:text-accent"
          }`}
        >
          🤖 Multi-Agent Orchestration
        </button>
      </div>

      {/* Episode timeline */}
      {episodes.length > 0 ? (
        <div className="space-y-6">
          {episodes.map((entry, idx) => {
            const isLast = idx === episodes.length - 1;
            return (
              <div key={entry.slug} className="relative">
                {!isLast && (
                  <div
                    className="absolute left-[39px] top-[80px] w-[2px] h-[calc(100%-40px)] bg-border"
                    aria-hidden="true"
                  />
                )}
                <Link
                  href={`/wiki/${entry.slug}`}
                  className="flex gap-5 items-start group"
                >
                  <div className="shrink-0 h-20 w-20 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center group-hover:bg-accent/15 group-hover:border-accent transition-colors">
                    <div className="text-center">
                      <div className="text-[10px] text-muted font-code uppercase">Ep</div>
                      <div className="font-data text-2xl font-bold text-accent">
                        {String(entry.episode).padStart(3, "0")}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 rounded-[var(--radius-md)] border border-border bg-surface p-5 group-hover:border-accent transition-colors">
                    <div className="text-xs text-muted font-code mb-1">
                      {entry.frontmatter.date}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                      {entry.frontmatter.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {entry.frontmatter.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(entry.frontmatter.tags || []).slice(0, 6).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-bg px-2 py-0.5 text-[10px] text-muted font-code border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted py-12">
          아직 에피소드가 없습니다.
        </div>
      )}
    </>
  );
}
