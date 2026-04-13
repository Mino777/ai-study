#!/bin/bash
# .claude/hooks/no-company-names.sh
#
# PreToolUse 가드 — Edit/Write에서 회사 프로젝트 식별자가 ai-study에 노출되는 것을 차단한다.
#
# 발동 시점: Edit / Write 툴 호출 직전
# 차단 동작: 금지 패턴 발견 시 exit 1 → Claude가 도구 호출을 다시 시도하도록 강제
#
# 배경: 메모리 `feedback_company_project_names.md` 룰을 본인이 위반했던 사례
# (2026-04-13 iOS Journal 재작성 시 4 에이전트가 회사 프로젝트명을 그대로 노출).
# 메모리 의존을 못 믿겠으니 행동 레벨에서 차단한다.
#
# 우회 경로 (의도적 self-reference 허용):
# - 메모리 파일 자체 (~/.claude/projects/.../memory/feedback_company_project_names.md)
# - 이 훅 스크립트 자체
# - .gitignore (회사 모듈명을 ignore 패턴으로 쓸 일 있음)
#
# 화이트리스트가 정말 필요하면 케이스 추가.

set -e

# CLAUDE_TOOL_INPUT은 JSON. file_path만 추출.
FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('file_path', ''))
except Exception:
    pass
" 2>/dev/null)

# 자기 참조 허용 화이트리스트
case "$FILE_PATH" in
  */.claude/projects/*memory/*)
    exit 0
    ;;
  */.claude/hooks/no-company-names.sh)
    exit 0
    ;;
esac

# 금지 패턴 (단어 경계 + 케이스 정확 매치)
# - gma-ios: 회사 iOS 프로젝트
# - GreenCar: 회사 앱 이름
# - LOTTIMS: 회사 내부 모듈
FORBIDDEN='gma-ios|GreenCar|LOTTIMS'

if echo "$CLAUDE_TOOL_INPUT" | grep -qE "$FORBIDDEN"; then
  echo "🚫 NO_COMPANY_NAMES: 회사 프로젝트 식별자 차단" >&2
  echo "" >&2
  echo "감지된 패턴: $FORBIDDEN" >&2
  echo "" >&2
  echo "ai-study는 공개 위키. 회사 프로젝트명 노출 금지." >&2
  echo "익명화 매핑은 메모리 참조:" >&2
  echo "  ~/.claude/projects/-Users-jominho-Develop-ai-study/memory/feedback_company_project_names.md" >&2
  echo "" >&2
  echo "차단 회피가 의도적이라면 훅 스크립트의 화이트리스트에 케이스 추가." >&2
  exit 1
fi

exit 0
