#!/bin/bash
# GC Drift Detector — SessionStart에서 실행
# OpenAI Codex "Garbage Collection" 패턴 적용
# 실행 시간 목표: 2초 이내

PROJECT_ROOT="/Users/jominho/Develop/ai-study"
WARNINGS=0

# 1. Dangling connections 감지 (빈 카테고리 참조)
DANGLING=$(node "$PROJECT_ROOT/scripts/fix-one-way-connections.mjs" 2>/dev/null | grep -c "일방향" 2>/dev/null || echo "0")
if [ "$DANGLING" -gt 50 ]; then
  echo "⚠️ GC: 일방향 연결 ${DANGLING}건 — fix-one-way-connections.mjs --apply 검토"
  WARNINGS=$((WARNINGS + 1))
fi

# 2. CLAUDE.md 줄 수 체크
CLAUDE_LINES=$(wc -l < "$PROJECT_ROOT/CLAUDE.md" 2>/dev/null || echo "0")
if [ "$CLAUDE_LINES" -gt 250 ]; then
  echo "⚠️ GC: CLAUDE.md ${CLAUDE_LINES}줄 — 200줄 이하로 Skills 분리 필요"
  WARNINGS=$((WARNINGS + 1))
fi

# 3. Memory 파일 중 빈 파일 감지
EMPTY_MEM=$(find ~/.claude/projects/-Users-jominho-Develop-ai-study/memory/ -name "*.md" -empty 2>/dev/null | wc -l | tr -d ' ')
if [ "$EMPTY_MEM" -gt 0 ]; then
  echo "⚠️ GC: 빈 메모리 파일 ${EMPTY_MEM}개 — 정리 필요"
  WARNINGS=$((WARNINGS + 1))
fi

# 4. settings.json에 deny 규칙 존재 확인
if ! grep -q '"deny"' "$PROJECT_ROOT/.claude/settings.json" 2>/dev/null; then
  echo "⚠️ GC: settings.json에 deny 규칙 없음 — 보안 위험"
  WARNINGS=$((WARNINGS + 1))
fi

if [ "$WARNINGS" -eq 0 ]; then
  echo "✅ GC: 하네스 드리프트 없음"
fi

exit 0
