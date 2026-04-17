# 2026-04-17 세션 7 최종 회고 — Karpathy 패턴 + SWOT + 토큰 레버

**소요**: ~60분 (ingest 교차 검증 + 위키 린트 구현 + SWOT 작성 + 설정 적용)

## 이번에 한 것

1. **Karpathy LLM Wiki 패턴 /ingest** — Gist 원문 + 3개 보강 소스 교차 검증 → context-engineering 엔트리 박제
2. **CLAUDE.md 다이어트** — 324→177줄 (−45%). RTK 이중 로딩이 핵심 발견
3. **위키 린트** — validate-content.mjs에 고아/Directive 누락/일방향 연결 경고 추가
4. **wiki-index.md 자동 생성** — Karpathy의 index.md에 대응. prebuild에서 카테고리별 한 줄 요약
5. **SWOT 비교 분석** — 실측 기반. SO: Compound+Compilation 합류(양방향 컴파일)
6. **토큰 레버 3종** — A4(git 지시문 제거) + C2(MCP 5K 절단) + D2(서브에이전트 Haiku)

## 잘된 것

- **RTK 이중 로딩 발견** — CLAUDE.md에 132줄 RTK 섹션이 전역 @RTK.md와 중복 로딩. 제거만으로 −45%. 매 턴 prefix에서 가장 큰 단일 절감
- **위키 린트가 즉시 가치** — 첫 실행에서 Directive 59%, 일방향 332건 발견. 숫자로 보니 문제 크기가 명확
- **SWOT이 방향성 확립** — "Compound+Compilation 합류 = 어디에도 없는 차별화" 결론. 감이 아니라 실측 기반
- **/ingest 교차 검증 안정적** — oembed + WebSearch + WebFetch 3중 검증. 영상 트랜스크립트 없어도 Gist+블로그 3개로 충분

## 아쉬운 것

- **토큰 레버 before/after 미측정** — 세션 중간에 설정 적용이라 실측 불가. 다음 세션에서 ccusage 측정 필요
- **인제스트 크로스 업데이트 미구현** — SWOT에서 O1으로 식별했지만 시간 제약으로 미착수

## 다음에 적용할 것

1. **ccusage 재측정** — A1+A4+C2+D2 적용 후 before/after 비교
2. **인제스트 크로스 업데이트** — /ingest Phase에 기존 엔트리 connections 자동 역링크
3. **Directive Top 10 추가** — 59% → 70%+ 목표
4. **린트 고도화** — 모순 탐지, stale 클레임

## Compound Assets

| 자산 | 경로 | 재사용 시점 |
|---|---|---|
| Karpathy 패턴 엔트리 | context-engineering/karpathy-llm-wiki-pattern-compilation-over-retrieval.mdx | 위키 방향성 논의 |
| SWOT 분석 | context-engineering/llm-wiki-swot-ai-study-vs-karpathy.mdx | 전략 검토 |
| 위키 린트 | scripts/validate-content.mjs wikiLint() | 매 빌드 자동 실행 |
| wiki-index.md | scripts/generate-content-manifest.mjs | 매 빌드 자동 생성 |
| 토큰 레버 설정 | ~/.claude/settings.json | 전역 적용 완료 |

## 수치

| 항목 | 값 |
|---|---|
| 신규 엔트리 | 2 |
| CLAUDE.md | 324 → 177줄 (−45%) |
| 토큰 레버 | 4건 (A1+A4+C2+D2) |
| 위키 린트 | Directive 59%, 일방향 332건, 고아 0건 |
| 빌드 검증 | 4회 통과 |
| 커밋 | 6 |
