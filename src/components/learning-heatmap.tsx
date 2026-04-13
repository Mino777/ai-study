"use client";

interface LearningHeatmapProps {
  dailyEntries: Record<string, number>;
}

export function LearningHeatmap({ dailyEntries }: LearningHeatmapProps) {
  const weeks = 12;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 요일 정렬: 일요일(0) ~ 토요일(6) 기반 GitHub 스타일 그리드
  // 1. 오늘이 속한 주의 토요일을 끝점(endDate)으로 잡는다.
  // 2. 거기서 12주 × 7일 = 84일 전의 일요일이 시작점(startDate).
  const todayDow = today.getDay(); // 0 = 일요일
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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-bold text-muted">학습 히트맵</h3>
        <span className="text-xs text-muted">
          {totalDays}일 · {totalEntries}개 엔트리
        </span>
      </div>
      <div className="flex gap-[3px]">
        {/* 요일 라벨 */}
        <div className="flex flex-col gap-[3px] mr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="h-[13px] text-[9px] text-muted font-code leading-[13px]"
            >
              {label}
            </div>
          ))}
        </div>
        {/* 히트맵 그리드 */}
        <div className="flex gap-[3px] overflow-x-auto">
          {columns.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {col.map((cell) => (
                <div
                  key={cell.date}
                  className="h-[13px] w-[13px] rounded-[2px]"
                  style={{
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
