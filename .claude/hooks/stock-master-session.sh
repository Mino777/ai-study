#!/bin/bash
# stock-master-session.sh — stock-master 브랜치 전용 세션 부트스트랩
# .claude/settings.json SessionStart 훅에서 호출.
# stock-master 브랜치가 아니면 아무것도 안 하고 즉시 종료 (다른 브랜치 영향 0).

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "/Users/jominho/Personal/ai-study")
BRANCH=$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "")

# ── 게이트: stock-master 브랜치에서만 동작 ──
[ "$BRANCH" != "stock-master" ] && exit 0

SM_DIR="$REPO_ROOT/stock-master"
TODAY=$(date +%Y-%m-%d)
WEEKDAY=$(date +%u)   # 1=월 ... 7=일
HOUR=$(date +%H)

echo "" >&2
echo "═══════════════════════════════════════════════════" >&2
echo "  📈 주식 마스터 세션  |  $TODAY" >&2
echo "═══════════════════════════════════════════════════" >&2
echo "" >&2

# ── 장 상태 (한국 시장 09:00~15:30) ──
if [ "$WEEKDAY" -ge 6 ]; then
  MARKET="🔵 주말 (휴장)"
elif [ "$HOUR" -lt 9 ]; then
  MARKET="🌅 장 시작 전"
elif [ "$HOUR" -lt 15 ]; then
  MARKET="🟢 장중"
elif [ "$HOUR" -lt 16 ]; then
  MARKET="🟡 마감 무렵"
else
  MARKET="🔴 장 마감"
fi
echo "  $MARKET" >&2
echo "" >&2

# ── 페르소나 계약 (Claude가 반드시 로드) ──
echo "  🎓 역할: 미노의 전담 주식 트레이딩 코치" >&2
echo "     베이스: 미너비니(SEPA/VCP) · 매크로 · 선물옵션 · FPER · 거래대금/눌림목" >&2
echo "" >&2
echo "  📖 세션 계약 — 반드시 먼저 읽을 것:" >&2
echo "     stock-master/PERSONA.md" >&2
echo "" >&2
echo "  📚 지식베이스 (필요한 것만 JIT 로드):" >&2
for f in minervini macro derivatives valuation chart risk tools; do
  [ -f "$SM_DIR/knowledge/$f.md" ] && echo "     · knowledge/$f.md" >&2
done
echo "" >&2

# ── 최근 저널 + 신선도 경고 ──
LAST_JOURNAL=$(ls -1t "$SM_DIR/journal/"*.md 2>/dev/null | head -1)
if [ -n "$LAST_JOURNAL" ]; then
  JBASE=$(basename "$LAST_JOURNAL")
  # 파일명 앞 YYYY-MM-DD 로 경과일 계산
  JDATE=$(echo "$JBASE" | grep -oE '^[0-9]{4}-[0-9]{2}-[0-9]{2}')
  AGE=""
  if [ -n "$JDATE" ]; then
    JS=$(date -j -f "%Y-%m-%d" "$JDATE" "+%s" 2>/dev/null)
    NS=$(date "+%s")
    [ -n "$JS" ] && AGE=$(( (NS - JS) / 86400 ))
  fi
  if [ -n "$AGE" ] && [ "$AGE" -ge 1 ]; then
    echo "  📝 최근 기록: $JBASE  ⚠️ ${AGE}일 전 — 시황/시세는 STALE, 인용 금지·재조회" >&2
  else
    echo "  📝 최근 기록: $JBASE (오늘)" >&2
  fi
  echo "" >&2
fi

# ── 커맨드 ──
echo "  ⚡ 커맨드:  /시황  /종목  /토론  /복기  /공부" >&2
echo "" >&2
echo "  🚨 최신 데이터 원칙 (사용자 지시)" >&2
echo "     1) 시세·수급·지표 → WebSearch 필수 (기억 속 숫자 금지)" >&2
echo "     2) 검색 결과의 '날짜'를 확인 — 낡은 기사 인용이 최다 실패" >&2
echo "     3) 모든 수치에 기준일 명시:  '$TODAY 기준 X'" >&2
echo "     4) 못 가져오면 '못 가져왔다'고 말할 것 (추정 금지)" >&2
echo "═══════════════════════════════════════════════════" >&2
echo "" >&2

exit 0
