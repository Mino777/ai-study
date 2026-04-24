# PreToolUse 훅이 silent pass로 퇴화하는 것을 fail-closed 기본값으로 막기

**카테고리**: workflow
**날짜**: 2026-04-24
**재발 가능성**: HIGH — 하네스 입력 스키마 변경(envvar → stdin)이 실제 일어났고, 모든 커스텀 훅이 잠재적으로 같은 패턴.

## 문제

`.claude/hooks/no-company-names.sh`가 **아무것도 차단하지 않은 채 수 세션 동안 통과**하고 있었다. 훅 코드는 멀쩡했고, settings.json 등록도 정상이었고, 수동 `bash hook.sh`로 테스트하면 차단 로직도 작동했다. 그런데 실제 Claude Code 런타임에선 동작 안 함.

원인: 훅이 `CLAUDE_TOOL_INPUT` 환경변수를 읽었는데, 최신 Claude Code 하네스는 **stdin으로 JSON**을 전달한다. envvar는 비어있음 → grep에 빈 문자열 → 매치 없음 → `exit 0` (allow).

## 증상

- 금지 패턴(`gma-ios` 등) 포함한 콘텐츠를 Edit/Write 시도해도 차단 안 됨
- 훅 stderr에 아무 메시지 없음 (grep이 안 돌았으므로)
- settings.json에 훅 제대로 등록됨 + PreToolUse 이벤트도 정상 발화 (다른 훅들은 작동)
- 수동 실행은 잘 됨 → "훅 자체는 OK"라는 오판 유도

## 해결

### Before — envvar only (silent pass)

```bash
FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "...")
if echo "$CLAUDE_TOOL_INPUT" | grep -qE "$FORBIDDEN"; then
  exit 1
fi
exit 0
```

envvar 비어있으면 전체 로직이 no-op.

### After — stdin 우선 + envvar fallback + **fail-closed**

```bash
INPUT_JSON=""
if [ -t 0 ]; then
  # stdin이 터미널(수동 실행)이면 envvar 사용
  INPUT_JSON="${CLAUDE_TOOL_INPUT:-}"
else
  INPUT_JSON="$(cat)"
  [ -z "$INPUT_JSON" ] && INPUT_JSON="${CLAUDE_TOOL_INPUT:-}"
fi

# ⚠️ 핵심: 입력이 비어있으면 무조건 차단 (fail-closed)
if [ -z "$INPUT_JSON" ]; then
  echo "🚫 훅 입력 비어있음 — 하네스 스키마 불일치 가능성. 보수적 차단" >&2
  exit 1
fi

# 이후 grep 로직...
```

### 핵심 원칙: fail-closed 기본값

보안/정책 훅은 **"입력 없으면 allow"가 아니라 "입력 없으면 deny"여야 한다**. 이유:
- 하네스 스키마 변경, 파이프 깨짐, 권한 이슈 등 어떤 예외가 일어나도
- fail-closed면 사용자가 "왜 막혔지?" → 훅 점검
- fail-open(silent pass)면 사용자가 **위반 사실도 모른 채 진행**

개발 마찰은 단기 비용이지만 정책 회피는 장기 신뢰 비용.

## 근본 원인

- **레거시 입력 인터페이스 의존**: envvar 기반 훅은 2024년 Claude Code 스키마. 현재는 stdin 기반. 마이그레이션 공지 없이 조용히 바뀌면 훅이 silent하게 퇴화.
- **훅 자기 검증 부재**: "이 훅이 실제 런타임에서 fire하고 있는가?"를 검증하는 self-test가 없음.
- **fail-open 기본값의 편향**: 개발자 본능적으로 "차단 못 하면 일단 통과시키자" — 하지만 이는 정책 훅에서 잘못된 기본값.

## 재발 방지 체크리스트

- [ ] 모든 정책/보안 훅은 **입력 없으면 exit 1** (fail-closed)
- [ ] stdin + envvar 둘 다 시도 (하위 호환 + 현재 스키마)
- [ ] 훅 스크립트에 "이 훅이 실제로 fire됐다"는 증거 로그 옵션 (`DEBUG_HOOKS=1`)
- [ ] 새 세션 시작 시 테스트 차단 시도 (금지 패턴 포함 파일 Edit 후 차단 확인)
- [ ] 하네스 업그레이드 후 훅 배치 자기검증 (`bash .claude/hooks/*.sh < empty`으로 모두 exit 1 확인)

## 교훈의 일반화

"도구가 조용히 퇴화한다"는 `feedback_self_modifying_tools.md`(validate-content.mjs 두 번 발견)와 **같은 패턴**이다. 규칙:

> 자기 검증 없는 도구는 idempotent이든 fail-open이든 **조용히 거짓말을 쌓는다**. 체크섬/증거 로그/fail-closed 중 최소 하나.

## 관련

- `.claude/hooks/no-company-names.sh` — 수정된 훅
- 메모리 `feedback_self_modifying_tools.md` — 같은 "조용한 퇴화" 패턴 첫 사례 (validate-content)
- 메모리 `feedback_company_project_names.md` — 이 훅이 보호하려던 룰
- `docs/retros/2026-04-24.md` — 이번 스프린트 발견 경위
