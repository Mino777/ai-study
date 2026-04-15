"use client";

import { useState } from "react";

interface LearningHeatmapProps {
  dailyEntries: Record<string, number>;
}

const VIEW_OPTIONS = [
  { label: "12주", weeks: 12 },
  { label: "6개월", weeks: 26 },
  { label: "1년", weeks: 52 },
] as const;

export function LearningHeatmap({ dailyEntries }: LearningHeatmapProps) {
  const [viewIdx, setViewIdx] = useState(0);
  const weeks = VIEW_OPTIONS[viewIdx].weeks;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 요일 정렬: 일요일(0) ~ 토요일(6) 기반 GitHub 스타일 그리드
  const todayDow = today.getDay();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - todayDow));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1));

  // 열(column) = 주, 행(row) = 요일 (일~토)
  const columns: Array<
    Array<{ date: string; count: number; isFuture: boolean }>
  > = [];
  for (let w = 0; w < weeks; w++) {
    const col: Array<{ date: string; count: number; isFuture: boolean }> = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(cellDate.getDate() + w * 7 + d);
      const dateStr = cellDate.toISOString().split("T")[0];
      col.push({
        date: dateStr,
        count: dailyEntries[dateStr] || 0,
        isFuture: cellDate > today,
      });
    }
    columns.push(col);
  }

  function getColor(count: number): string {
    if (count === 0) return "var(--border)";
    if (count === 1) return "#10b981";
    if (count === 2) return "#059669";
    return "#047857";
  }

  const totalDays = Object.keys(dailyEntries).length;
  const totalEntries = Object.values(dailyEntries).reduce((s, n) => s + n, 0);

  const dayLabels = ["", "월", "", "수", "", "금", ""];

  // 셀 크기: 12주는 13px, 6개월/1년은 작게
  const cellSize = weeks <= 12 ? 13 : weeks <= 26 ? 10 : 8;
  const gap = weeks <= 12 ? 3 : 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-bold text-muted">학습 히트맵</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            {VIEW_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setViewIdx(i)}
                className={`px-2 py-0.5 text-xs transition-colors ${
                  viewIdx === i
                    ? "bg-accent text-white"
                    : "text-muted hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted">
            {totalDays}일 · {totalEntries}개
          </span>
        </div>
      </div>
      <div className="flex" style={{ gap: `${gap}px` }}>
        {/* 요일 라벨 */}
        <div className="flex flex-col mr-1" style={{ gap: `${gap}px` }}>
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="text-muted font-code"
              style={{
                height: `${cellSize}px`,
                fontSize: cellSize <= 10 ? "7px" : "9px",
                lineHeight: `${cellSize}px`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
        {/* 히트맵 그리드 */}
        <div className="flex overflow-x-auto" style={{ gap: `${gap}px` }}>
          {columns.map((col, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: `${gap}px` }}>
              {col.map((cell) => (
                <div
                  key={cell.date}
                  className="rounded-[2px]"
                  style={{
                    height: `${cellSize}px`,
                    width: `${cellSize}px`,
                    background: cell.isFuture
                      ? "transparent"
                      : getColor(cell.count),
                    opacity: cell.isFuture ? 0 : 1,
                  }}
                  title={`${cell.date}: ${cell.count}개`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-xs text-muted mr-1">적음</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ background: getColor(level) }}
          />
        ))}
        <span className="text-xs text-muted ml-1">많음</span>
      </div>
    </div>
  );
}
