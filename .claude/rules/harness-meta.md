---
description: .claude/ 디렉토리 내 하네스 파일 편집 시 적용되는 규칙
globs: .claude/**/*
---

# 하네스 자체 수정 규칙

## Frozen Snapshot 원칙

- 활성 세션 중 CLAUDE.md 수정 금지 (캐시 전체 무효화 + 1.25x 오버헤드)
- 변경이 필요하면 메모리에 기록만 하고, `/compound` Phase 3에서 일괄 반영
- CLAUDE.md는 200줄 이하 유지. 초과 시 Skills/Rules로 분리

## settings.json 수정 시

- deny 규칙은 추가만 가능 (기존 deny 제거 금지 — 보안 후퇴)
- hook timeout은 30초 이하 유지 (세션 블로킹 방지)
- 새 hook 추가 시 exit code 규칙 준수: 0=성공, 1=차단, 2=재시도

## hooks/ 스크립트 수정 시

- 실행 시간 5초 이내 유지
- stderr 출력은 최소화 (컨텍스트 오염 방지)
- 성공은 silent, 실패만 표면화 (OpenAI Codex 원칙)

## commands/ 수정 시

- 새 command 추가 시 CLAUDE.md `## Skill routing`에도 라우팅 규칙 추가
- `npm run check:skills`로 정합성 확인
