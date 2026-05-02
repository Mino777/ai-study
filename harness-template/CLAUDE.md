# {{PROJECT_NAME}}

## Tech Stack
- **Framework**: {{FRAMEWORK}}
- **Language**: {{LANGUAGE}}
- **Deploy**: {{DEPLOY_TARGET}}

## Key Commands
- `{{DEV_CMD}}` — 개발 서버
- `{{BUILD_CMD}}` — 프로덕션 빌드
- `{{TEST_CMD}}` — 테스트 실행

## Conventions
- 커밋 메시지: 한글
- 파일명: kebab-case
- push = 자동 배포. 기본은 커밋까지만

## Rules (절대 금지)
- .env 파일 직접 읽기/수정 금지
- 시크릿/API 키를 코드에 포함 금지
- `rm -rf`, `git push --force`, `git reset --hard` 금지

## Compound Engineering

```
코드 작업 → git commit → 자동 빌드 체크 (실패시 차단)
                              ↓ 통과
                         git push → /compound 리마인더
```

- `git commit` 전 — 빌드 자동 실행, 실패하면 커밋 차단
- `git push` 후 — "/compound 실행하세요" 리마인더
- `/compound` 실행 — CHANGELOG + 회고 + 솔루션 문서화
