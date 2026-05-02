#!/bin/bash
# .claude/hooks/no-company-names.sh
#
# PreToolUse 가드 — Edit/Write에서 회사 프로젝트 식별자가 ai-study에 노출되는 것을 차단한다.
#
# 발동 시점: Edit / Write 툴 호출 직전
# 차단 동작: 금지 패턴 발견 시 exit 2 → 도구 실행 차단 + stderr가 에이전트에게 전달
# 주의: exit 1은 비차단(도구 실행 계속됨)이므로 반드시 exit 2 사용
#
# 입력: Claude Code 하네스가 JSON을 stdin으로 전달 (이전 스키마는 CLAUDE_TOOL_INPUT envvar였음).
#      하위 호환을 위해 둘 다 처리한다.
#
# 배경: 메모리 `feedback_company_project_names.md` 룰을 본인이 위반했던 사례
# (2026-04-13 iOS Journal 재작성, 2026-04-23 Journal 027에서도 재발 — 훅이 envvar만
# 읽어서 stdin 스키마로 바뀐 하네스에서 silent pass됐음).
# 메모리 의존을 못 믿겠으니 행동 레벨에서 차단한다.
#
# 우회 경로 (의도적 self-reference 허용):
# - 메모리 파일 자체 (~/.claude/projects/.../memory/feedback_company_project_names.md)
# - 이 훅 스크립트 자체
# - .gitignore (회사 모듈명을 ignore 패턴으로 쓸 일 있음)
# - .claude/settings*.json (Bash allowlist에 회사 경로 들어갈 수 있음)
#
# 화이트리스트가 정말 필요하면 케이스 추가.

set -e

# stdin 또는 CLAUDE_TOOL_INPUT envvar에서 JSON 수집 (하네스 스키마 양쪽 지원)
INPUT_JSON=""
if [ -t 0 ]; then
  # stdin이 터미널이면 envvar 사용 (레거시 경로)
  INPUT_JSON="${CLAUDE_TOOL_INPUT:-}"
else
  INPUT_JSON="$(cat)"
  # stdin이 비었으면 envvar fallback
  [ -z "$INPUT_JSON" ] && INPUT_JSON="${CLAUDE_TOOL_INPUT:-}"
fi

# 입력이 완전히 비어있으면 차단 불가 → 보수적으로 block (fail-closed).
# 단, 이 훅은 settings.json matcher에서 Edit|Write로 한정 등록된다고 가정.
# 다른 matcher(예: Bash)로 오등록되면 여기서 false positive 차단이 날 수
# 있음 — 의도된 동작(설정 오류 빨리 드러나도록).
if [ -z "$INPUT_JSON" ]; then
  echo "🚫 NO_COMPANY_NAMES: 훅 입력이 비어있음 (하네스 스키마 불일치 가능성) — 보수적 차단" >&2
  echo "이 메시지가 계속 나오면 훅 스크립트의 stdin 수집 경로 점검 필요." >&2
  echo "settings.json의 matcher가 Edit|Write로 한정돼 있는지 확인." >&2
  exit 2
fi

# file_path 추출 (화이트리스트 판정용)
FILE_PATH=$(printf '%s' "$INPUT_JSON" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    # tool_input은 최신 하네스에서 한 단계 nested
    if 'tool_input' in d:
        d = d['tool_input']
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
  */.claude/settings*.json)
    exit 0
    ;;
  */.gitignore)
    exit 0
    ;;
esac

# 금지 패턴 (단어 경계 + 케이스 정확 매치)
# - gma-ios  : 내부 iOS 프로젝트 식별자
# - GreenCar : 내부 앱 이름
# - LOTTIMS  : 내부 모듈
# - "회사 iOS" / "회사 프로젝트" / "회사 repo" : 간접 지칭도 금지
#   (유저 피드백 2026-04-23: "그냥 iOS 라고 해줘")
FORBIDDEN='gma-ios|GreenCar|LOTTIMS|회사[[:space:]]+(iOS|프로젝트|repo|레포|안드로이드|서버|앱)'

if printf '%s' "$INPUT_JSON" | grep -qE "$FORBIDDEN"; then
  MATCH=$(printf '%s' "$INPUT_JSON" | grep -oE "$FORBIDDEN" | head -3 | sort -u)
  echo "🚫 NO_COMPANY_NAMES: 회사 프로젝트 식별자 / 간접 지칭 차단" >&2
  echo "" >&2
  echo "감지된 패턴(3건까지):" >&2
  while IFS= read -r m; do echo "  - $m" >&2; done <<< "$MATCH"
  echo "" >&2
  echo "ai-study는 공개 위키. 회사 프로젝트명 및 간접 지칭(\"회사 iOS\" 등) 노출 금지." >&2
  echo "익명화 매핑은 메모리 참조:" >&2
  echo "  ~/.claude/projects/-Users-jominho-Develop-ai-study/memory/feedback_company_project_names.md" >&2
  echo "" >&2
  echo "차단 회피가 의도적이라면 훅 스크립트의 화이트리스트에 케이스 추가." >&2
  exit 2
fi

exit 0
