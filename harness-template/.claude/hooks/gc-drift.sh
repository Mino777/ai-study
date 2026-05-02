#!/bin/bash
# GC Drift Detector — SessionStart 실행
# OpenAI Codex "Garbage Collection" 패턴
# 목표: 2초 이내 완료

REPO=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
WARNINGS=0

# 1. CLAUDE.md 줄 수 체크
if [ -f "$REPO/CLAUDE.md" ]; then
  LINES=$(wc -l < "$REPO/CLAUDE.md")
  if [ "$LINES" -gt 250 ]; then
    echo "⚠️ GC: CLAUDE.md ${LINES}줄 — 200줄 이하로 Skills 분리 필요"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# 2. settings.json deny 규칙 존재 확인
if [ -f "$REPO/.claude/settings.json" ]; then
  if ! grep -q '"deny"' "$REPO/.claude/settings.json" 2>/dev/null; then
    echo "⚠️ GC: settings.json에 deny 규칙 없음 — 보안 위험"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# 3. hooks 디렉토리에 최소 1개 훅 존재 확인
HOOK_COUNT=$(find "$REPO/.claude/hooks" -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')
if [ "$HOOK_COUNT" -eq 0 ]; then
  echo "⚠️ GC: .claude/hooks/ 에 훅이 없음"
  WARNINGS=$((WARNINGS + 1))
fi

# 4. 빈 파일 감지 (.claude/ 내)
EMPTY=$(find "$REPO/.claude" -name "*.md" -empty 2>/dev/null | wc -l | tr -d ' ')
if [ "$EMPTY" -gt 0 ]; then
  echo "⚠️ GC: .claude/ 에 빈 파일 ${EMPTY}개"
  WARNINGS=$((WARNINGS + 1))
fi

if [ "$WARNINGS" -eq 0 ]; then
  echo "✅ GC: 하네스 드리프트 없음"
fi

exit 0
