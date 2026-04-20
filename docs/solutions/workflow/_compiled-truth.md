# [workflow] Compiled Truth

## 종합 (8건, 최종 갱신 2026-04-20)

- **재발 횟수**: 8건 (독립 문제)
- **핵심 패턴**: 멀티 세션/멀티 에이전트 환경에서 워크플로 안전성 확보
- **코드 게이트 승격**: 완료 2건 (validator promotion, cross-session review), 진행 중 0건

### 주요 교훈 요약

| # | 문제 | 핵심 해결 | 승격 여부 |
|---|------|-----------|-----------|
| 1 | 외부 URL 단일 소스 맹신 | `/ingest` 7단계 게이트 + 2소스 교차검증 | 슬래시 커맨드 |
| 2 | 동시 세션 git 충돌 | 3-layer 방어 (`/wt-branch` + rebase + test gate) | 슬래시 커맨드 |
| 3 | 타 세션 PR 6대 함정 | 5단계 크로스 세션 리뷰 프로토콜 | 슬래시 커맨드 |
| 4 | validator 자기수정 버그 | lib 분리 + negative lookahead + 6 regression tests | vitest |
| 5 | Edge Runtime crypto 미지원 | Web Crypto API HMAC+XOR 비교 | 코드 적용 |
| 6 | 솔루션 N=3+ 승격 규칙 | idempotent+<5% false positive → auto-fix, else warning-only | 프로세스 |
| 7 | 교훈→도구→사례 3단 체인 끊김 | 양 끝 엔트리 "출처" 섹션 역링크 보강 | 프로세스 |
| 8 | 레포 간 .claude/ 인프라 격차 | SessionStart hook + permissions.deny + 모델별 에이전트 이식 | 프로세스 |

### 메타 패턴

- **방어는 계층으로**: 단일 가드보다 3-layer 방어가 반복적으로 효과적
- **승격 기준 명확화**: N=3 반복 시 코드 게이트 승격 검토 (warning-only 우선)
- **역링크 보강**: 고립된 지식은 발견이 안 됨 → 연결을 명시적으로

## 개별 솔루션 목록

1. [ingest-command-design](2026-04-11-ingest-command-design.md)
2. [hub-worker-concurrent-session-safety](2026-04-12-hub-worker-concurrent-session-safety.md)
3. [cross-session-review-protocol](2026-04-13-cross-session-review-protocol.md)
4. [self-modifying-validator-bugs](2026-04-13-self-modifying-validator-bugs.md)
5. [edge-runtime-timing-safe-comparison](2026-04-15-edge-runtime-timing-safe-comparison.md)
6. [solution-to-validator-promotion](2026-04-16-solution-to-validator-promotion.md)
7. [lesson-tool-application-3-tier-linking](2026-04-17-lesson-tool-application-3-tier-linking.md)
8. [cross-project-infra-porting](2026-04-20-cross-project-infra-porting.md)
