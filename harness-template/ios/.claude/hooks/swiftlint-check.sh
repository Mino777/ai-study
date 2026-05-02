#!/bin/bash
# SwiftLint Check — PostToolUse(Edit|Write): Swift 파일 편집 후 린트
# 성공은 silent, 실패 시 exit 2 (자동수정 루프)

FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('file_path',''))" 2>/dev/null)

# Swift 파일이 아니면 skip
if ! echo "$FILE_PATH" | grep -qE '\.swift$'; then
  exit 0
fi

# SwiftLint 설치 확인
if ! command -v swiftlint &>/dev/null; then
  exit 0  # SwiftLint 없으면 조용히 skip
fi

# 해당 파일만 린트 (전체 프로젝트 X — 속도 우선)
RESULT=$(swiftlint lint --path "$FILE_PATH" --quiet 2>/dev/null)
ERROR_COUNT=$(echo "$RESULT" | grep -c "error:" 2>/dev/null || echo "0")

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "$RESULT" | grep "error:" | head -5
  echo "❌ SwiftLint: 에러 ${ERROR_COUNT}건 — 수정 필요"
  exit 2  # 자동수정 루프
fi

# warning은 표시하되 차단하지 않음
WARNING_COUNT=$(echo "$RESULT" | grep -c "warning:" 2>/dev/null || echo "0")
if [ "$WARNING_COUNT" -gt 0 ]; then
  echo "⚠️ SwiftLint: warning ${WARNING_COUNT}건 (차단 안 함)"
fi

exit 0
