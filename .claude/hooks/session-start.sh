#!/bin/bash
# session-start.sh — Claude Code 세션 시작 시 ai-study 컨텍스트 요약
# .claude/settings.json의 SessionStart 훅에서 호출됨

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-$PWD}")
BRANCH=$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "unknown")
ENTRY_COUNT=$(find "$REPO_ROOT/content" -name "*.mdx" 2>/dev/null | wc -l | tr -d ' ')

echo "📚 ai-study | $BRANCH | 엔트리 $ENTRY_COUNT개" >&2
echo "" >&2

# NEXT.md 최우선 큐 1개 표시
if [ -f "$REPO_ROOT/NEXT.md" ]; then
  FIRST_TASK=$(grep -m1 -E '^1순위' "$REPO_ROOT/NEXT.md" 2>/dev/null | sed -E 's/^1순위[[:space:]]+//')
  if [ -n "$FIRST_TASK" ]; then
    echo "🎯 최우선: $FIRST_TASK" >&2
  fi
fi

# Git 동기화 상태 빠른 확인
AHEAD_BEHIND=$(git -C "$REPO_ROOT" rev-list --left-right --count HEAD...origin/main 2>/dev/null)
if [ -n "$AHEAD_BEHIND" ] && [ "$AHEAD_BEHIND" != "0	0" ]; then
  echo "⚠️  Git: ahead/behind = $AHEAD_BEHIND" >&2
fi

echo "" >&2
echo "💡 워크플로: /projects-sync → 작업 → /compound" >&2

exit 0
