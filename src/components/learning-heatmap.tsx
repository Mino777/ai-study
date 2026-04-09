"use client";

interface LearningHeatmapProps {
  dailyEntries: Record<string, number>;
}

export function LearningHeatmap({ dailyEntries }: LearningHeatmapProps) {
  const weeks = 12;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 12 weeks of cells (84 days), ending today
  const cells: { date: string; count: number; dayOfWeek: number }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    cells.push({
      date: dateStr,
      count: dailyEntries[dateStr] || 0,
      dayOfWeek: d.getDay(),
    });
  }

  // Group into weeks (columns)
  const weekColumns: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weekColumns.push(cells.slice(i, i + 7));
  }

  function getColor(count: number): string {
    if (count === 0) return "var(--border)";
    if (count === 1) return "#10b981";
    if (count === 2) return "#059669";
    return "#047857";
  }

  const totalDays = Object.keys(dailyEntries).length;
  const totalEntries = Object.values(dailyEntries).reduce((s, n) => s + n, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-bold text-muted">학습 히트맵</h3>
        <span className="text-xs text-muted">{totalDays}일 · {totalEntries}개 엔트리</span>
      </div>
      <div className="flex gap-[3px] overflow-x-auto">
        {weekColumns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                className="h-[13px] w-[13px] rounded-[2px]"
                style={{ background: getColor(cell.count) }}
                title={`${cell.date}: ${cell.count}개`}
              />
            ))}
          </div>
        ))}
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
