#!/bin/bash
# Secret Guard — PreToolUse(Edit|Write) 차단 훅
# 시크릿/금지어 패턴이 코드에 들어가는 것을 차단
#
# 사용법: FORBIDDEN 배열에 프로젝트별 금지어를 추가

FORBIDDEN=(
  # === 공통 금지 패턴 ===
  'sk-[a-zA-Z0-9]{20,}'         # OpenAI API Key
  'sk-ant-[a-zA-Z0-9]{20,}'     # Anthropic API Key
  'ghp_[a-zA-Z0-9]{36}'         # GitHub Personal Access Token
  'AKIA[0-9A-Z]{16}'            # AWS Access Key
  'AIza[0-9A-Za-z_-]{35}'       # Google API Key

  # === 프로젝트별 금지어 (아래에 추가) ===
  # 'MyCompanyName'
  # 'internal-project-codename'
)

# 입력 파일 경로 추출
FILE_PATH=""
if [ -n "$CLAUDE_TOOL_INPUT" ]; then
  FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('file_path',''))" 2>/dev/null)
fi

# .claude/ 내부 파일은 화이트리스트 (훅 자체 수정 허용)
if echo "$FILE_PATH" | grep -q '\.claude/'; then
  exit 0
fi

# 새 내용에서 금지 패턴 검색
CONTENT=""
if [ -n "$CLAUDE_TOOL_INPUT" ]; then
  CONTENT=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('content', '') + d.get('new_string', ''))
" 2>/dev/null)
fi

if [ -z "$CONTENT" ]; then
  exit 0
fi

for pattern in "${FORBIDDEN[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern"; then
    echo "❌ SECRET GUARD: 금지 패턴 감지 — '$pattern'" >&2
    echo "   파일: $FILE_PATH" >&2
    echo "   시크릿/금지어를 코드에 포함하지 마세요." >&2
    exit 2  # exit 1은 비차단! 반드시 2로 차단
  fi
done

exit 0
