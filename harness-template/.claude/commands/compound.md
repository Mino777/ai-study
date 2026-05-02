# /compound — 스프린트 회고 + 솔루션 문서화

push 후 실행. 이번 스프린트의 산출물을 자산으로 변환한다.

## Phase 1: CHANGELOG 업데이트

```bash
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD
```

위 커밋 목록을 읽고 CHANGELOG.md에 추가:
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- docs: 문서 변경

## Phase 2: 회고 작성

`docs/retros/YYYY-MM-DD-<주제>.md` 파일 생성:

```markdown
# 회고 — <주제>

## 이번에 한 것
## 잘된 것
## 아쉬운 것
## 다음에 적용할 것
```

## Phase 3: 솔루션 박제

이번 스프린트에서 해결한 문제가 있으면 `docs/solutions/<category>/<slug>.md` 로 박제.

카테고리: build-errors, runtime-errors, performance, workflow, infrastructure

## Phase 4: 메모리 업데이트

이번 세션에서 배운 것 중 다음 세션에도 유효한 것이 있으면 메모리에 저장.

## Phase 5: 커밋

```bash
git add -A && git commit -m "compound: $(date +%Y-%m-%d) 스프린트 문서화"
```

push는 사용자 승인 대기.
