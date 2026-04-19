# [github-actions] Compiled Truth

## 종합 (4건, 최종 갱신 2026-04-19)

- **재발 횟수**: 4건 (독립 문제)
- **핵심 패턴**: CI/CD 파이프라인의 숨은 트리거/조건 함정
- **코드 게이트 승격**: 불필요 (각각 1회성 수정)
- **마지막 발생**: 2026-04-19

### 주요 교훈 요약

| # | 문제 | 핵심 해결 |
|---|------|-----------|
| 1 | 새 레포 cron 24-48시간 지연 | cron expression 변경으로 스케줄러 재등록 강제 |
| 2 | 워크플로 이식 시 재설계 → 버그 | 원본 1:1 복사, Test Gate/env만 변경 |
| 3 | `npm audit` devDep CI 차단 | `--omit=dev` 프로덕션 의존성만 체크 |
| 4 | Bot 댓글이 워크플로 재트리거 | `github.event.comment.user.type != 'Bot'` 조건 추가 |

### 메타 패턴

- **GitHub Actions 암묵적 동작**: 문서에 명시 안 된 동작(cron 지연, bot 트리거)이 주요 원인
- **이식은 복사가 안전**: 워크플로 재설계보다 1:1 복사 후 최소 변경이 버그 적음

## 개별 솔루션 목록

1. [cron-not-firing-new-repo](2026-04-09-cron-not-firing-new-repo.md)
2. [ai-review-yml-hub-port](2026-04-12-ai-review-yml-hub-port.md)
3. [npm-audit-devdep-ci-failure](2026-04-18-npm-audit-devdep-ci-failure.md)
4. [bot-comment-triggers-workflow](2026-04-19-bot-comment-triggers-workflow.md)
