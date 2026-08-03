#!/usr/bin/env bash
# measure-harness-stats.sh — 면접용 하네스 지표 재측정 (SSOT 생성기)
#
# 왜 이 스크립트가 존재하나:
#   면접 답변에 하드코딩한 숫자는 몇 주 안에 늙는다. 실제로 2026-08-03 감사에서
#   docs/job-prep/interview-stories/07 부록의 숫자가 최대 +320(커밋) 만큼 틀어져 있었다.
#   면접에서 "스킬 59개"라고 말했는데 실제가 65개면 신뢰를 잃는다.
#   → 숫자를 외우지 말고 "면접 전날 재측정"한다. 셈법도 여기 명시해서 방어 가능하게.
#
# 사용법:
#   HARNESS_DIR=/path/to/harness APP_DIR=/path/to/app bash scripts/measure-harness-stats.sh
#   (경로를 하드코딩하지 않는다 — 이 저장소는 공개 배포되고 회사 식별자 가드가 있다)
#
# 셈법 원칙 (면접에서 물으면 이대로 답한다):
#   · 아카이브/백업/node_modules/vendor 는 제외한다 (실제 운영 자산만)
#   · 스킬 = 스킬 디렉토리 1개 = 1  (SKILL.md 유무 무관하게 디렉토리 기준)
#   · 훅 = hooks 디렉토리 안의 실행 가능한 .sh 만 (아카이브 제외)
#   · 메모리 = memory/*.md 파일 수, 접두사로 타입 분류
set -uo pipefail

EXCL='_archive-backups|/node_modules/|/vendor/|/\.git/|/tmp/'

count() { printf '%d' "$(grep -cvE '^$' <<<"${1:-}" 2>/dev/null || echo 0)"; }
n_files() { find "$1" -type f -name "$2" 2>/dev/null | grep -vE "$EXCL" | wc -l | tr -d ' '; }
n_dirs()  { find "$1" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | grep -vE "$EXCL" | wc -l | tr -d ' '; }

section() { printf '\n\033[1m%s\033[0m\n' "$1"; }
row() { printf '  %-38s %s\n' "$1" "$2"; }

echo "════════════════════════════════════════════════════════"
echo " 하네스 지표 실측 — $(date +%Y-%m-%d) "
echo "════════════════════════════════════════════════════════"

# ---------- 하네스 저장소 ----------
if [ -n "${HARNESS_DIR:-}" ] && [ -d "$HARNESS_DIR" ]; then
  H="$HARNESS_DIR"
  section "🔧 하네스 자산"
  SK=0; for d in "$H"/plugins/*/skills; do [ -d "$d" ] && SK=$((SK + $(n_dirs "$d"))); done
  AG=0; for d in "$H"/plugins/*/agents; do [ -d "$d" ] && AG=$((AG + $(n_files "$d" '*.md'))); done
  CM=0; for d in "$H"/plugins/*/commands; do [ -d "$d" ] && CM=$((CM + $(n_files "$d" '*.md'))); done
  HK=$(find "$H" -type f -name '*.sh' -path '*hook*' 2>/dev/null | grep -vE "$EXCL" | wc -l | tr -d ' ')
  row "스킬 (skills)"            "$SK"
  row "에이전트 (agents)"        "$AG"
  row "커맨드 (commands)"        "$CM"
  row "라이프사이클 훅 (hooks)"   "$HK"

  section "🧠 팀 지식 (박제)"
  MEM=$(n_files "$H/memory" '*.md')
  row "메모리 총계"              "$MEM"
  for t in feedback reference project; do
    c=$(find "$H/memory" -maxdepth 1 -type f -name "${t}_*.md" 2>/dev/null | wc -l | tr -d ' ')
    row "  └ $t"                 "$c"
  done
  row "솔루션 (docs/solutions)"  "$(n_files "$H/docs/solutions" '*.md')"
  row "회고 (docs/retros)"       "$(n_files "$H/docs/retros" '*.md')"
  row "ADR (docs/adr)"           "$(n_files "$H/docs/adr" '*.md')"
  row "리서치 (docs/research)"   "$(n_files "$H/docs/research" '*.md')"

  section "📈 규모 · 운영"
  row "추적 파일 수"             "$(git -C "$H" ls-files 2>/dev/null | wc -l | tr -d ' ')"
  row "커밋 수"                  "$(git -C "$H" rev-list --count HEAD 2>/dev/null || echo '?')"
  row "셸 스크립트 (.sh, 운영)"  "$(find "$H" -type f -name '*.sh' 2>/dev/null | grep -vE "$EXCL" | wc -l | tr -d ' ')"
  FIRST_H=$(git -C "$H" log --reverse --format=%cs 2>/dev/null | head -1)
  row "하네스 저장소 분리일"      "${FIRST_H:-?}"
else
  section "🔧 하네스 자산"
  echo "  ⚠️  HARNESS_DIR 미설정 또는 경로 없음 — 건너뜀"
  echo "     예: HARNESS_DIR=~/path/to/harness bash scripts/measure-harness-stats.sh"
fi

# ---------- 앱 저장소 (하네스 도입 시점) ----------
if [ -n "${APP_DIR:-}" ] && [ -d "$APP_DIR" ]; then
  section "📱 앱 저장소 (하네스 도입 시점)"
  FIRST_A=$(git -C "$APP_DIR" log --reverse --format=%cs -- .claude 2>/dev/null | head -1)
  row "하네스 도입 첫 커밋"      "${FIRST_A:-?}"
  if [ -n "${FIRST_A:-}" ]; then
    S=$(date -j -f %Y-%m-%d "$FIRST_A" +%s 2>/dev/null || date -d "$FIRST_A" +%s 2>/dev/null)
    if [ -n "${S:-}" ]; then
      DAYS=$(( ( $(date +%s) - S ) / 86400 ))
      row "운영 기간 (일 / 개월)" "${DAYS}일  (약 $(awk -v d="$DAYS" 'BEGIN{printf "%.1f", d/30.44}')개월)"
    fi
  fi
fi

# ---------- 이 저장소 (공개 위키) ----------
section "📚 학습 위키 (이 저장소)"
row "MDX 엔트리"                "$(ls content/*/*.mdx 2>/dev/null | wc -l | tr -d ' ')"
row "job-prep lessons"          "$(ls docs/job-prep/lessons/*.md 2>/dev/null | wc -l | tr -d ' ')"
row "SRS 카드"                  "$(grep -cE '^\| .+ \| .+ \| *[0-9]+ *\|' docs/job-prep/REVIEW.md 2>/dev/null || echo '?')"
row "커밋 수"                    "$(git rev-list --count HEAD 2>/dev/null || echo '?')"

cat <<'EOF'

────────────────────────────────────────────────────────
⚠️  면접 전날 이걸 다시 돌려라. 숫자는 매주 늙는다.
    답변에 숫자를 쓸 때는 "제가 마지막에 측정했을 때 기준으로"를 붙인다.
    셈법을 물으면 이 스크립트 상단의 "셈법 원칙"을 그대로 말한다.
────────────────────────────────────────────────────────
EOF
