#!/bin/bash
# JIT Search First Guard (전역 적용)
# Trigger: PreToolUse(Read)
# Purpose: ai-study content/*.mdx 직접 읽기 전 JIT 검색 권장
# 행동 가드 > 메모리 가드 원칙 적용
# 어느 레포에서든 ai-study 위키 MDX를 읽으려 하면 발동

FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('file_path', ''))
except Exception:
    pass
" 2>/dev/null)

AI_STUDY_CONTENT="/Users/jominho/Develop/ai-study/content"

# ai-study/content/ 하위 .mdx 파일만 대상
case "$FILE_PATH" in
  ${AI_STUDY_CONTENT}/*.mdx|${AI_STUDY_CONTENT}/**/*.mdx)
    ;;
  *)
    exit 0
    ;;
esac

# 화이트리스트: 특정 파일은 직접 읽기 허용
BASENAME=$(basename "$FILE_PATH")
case "$BASENAME" in
  ai-agent-start-here.mdx)
    exit 0
    ;;
esac

echo "💡 JIT_SEARCH: ai-study 위키 MDX를 직접 읽기 전에 검색을 먼저 실행하세요." >&2
echo "   cd /Users/jominho/Develop/ai-study && npm run search -- \"<질문>\" 3 --inject" >&2
echo "   검색으로 충분하면 파일을 직접 열 필요 없습니다. (331K → ~800 tokens 절감)" >&2
echo "   이미 검색했거나 특정 파일을 의도적으로 읽는 경우라면 무시하세요." >&2

# warning only — 차단하지 않음
exit 0
