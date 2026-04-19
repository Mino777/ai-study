# [ai-pipeline] Compiled Truth

## 종합 (4건, 최종 갱신 2026-04-19)

- **재발 횟수**: 4건 (AI 생성물 품질 관련 2건 반복 패턴)
- **핵심 패턴**: AI가 생성한 콘텐츠의 메타데이터/형식 오류 + 도구 선택의 실시간 제약
- **코드 게이트 승격**: 완료 1건 (slug 영문 강제), 슬래시 커맨드 2건 (/validate-ai-output, /ingest)
- **마지막 발생**: 2026-04-14

### 주요 교훈 요약

| # | 문제 | 핵심 해결 | 승격 여부 |
|---|------|-----------|-----------|
| 1 | AI가 가짜 인용구 생성 | 3-layer 방어 (메모리 + /ingest + 출처 고지) | 슬래시 커맨드 |
| 2 | Gemini quiz YAML 직렬화 실패 | `js-yaml.dump()` 사용 (수동 이스케이프 금지) | 코드 적용 |
| 3 | Zod vs type guard 교과서 답 함정 | `/projects-sync` 실시간 제약 기반 도구 선택 | 프로세스 |
| 4 | 한글 slug → 404 | Gemini 영문 slug 자동 생성 + 충돌 감지 | 코드 적용 |

### 메타 패턴

- **AI 출력 불신 원칙**: AI 생성물은 항상 검증 필요 (인용구, YAML, slug 모두)
- **교과서 답 ≠ 최선**: 도구 선택은 이론이 아니라 현재 프로젝트 상태(활성 worktree 수 등)에 기반

## 개별 솔루션 목록

1. [fake-quotes-from-ai-summary](2026-04-11-fake-quotes-from-ai-summary.md)
2. [gemini-quiz-yaml-serialization](2026-04-11-gemini-quiz-yaml-serialization.md)
3. [runtime-shape-validation-type-guard-vs-zod](2026-04-12-runtime-shape-validation-type-guard-vs-zod.md)
4. [custom-topic-korean-slug-404](2026-04-14-custom-topic-korean-slug-404.md)
