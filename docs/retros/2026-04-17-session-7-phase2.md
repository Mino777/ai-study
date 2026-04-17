# 2026-04-17 세션 7 후반 회고 — Layer 3 Phase 2b/2c + N=3 룰

**소요**: ~45분 (벤치마크 실행 ~5분×2회 + 라우터 구현 + 박제)

## 이번에 한 것

1. **Layer 3 Phase 2b** — 3 모델 동시 벤치마크 (`benchmark-models.mjs`)
   - all-MiniLM-L6-v2 (baseline): 전체 2/7, 한국어 0/5
   - **multilingual-e5-small: 전체 5/7, 한국어 3/5** ← 채택
   - paraphrase-multilingual-MiniLM-L12-v2: 전체 1/7, 한국어 0/5
   - `embed-content.mjs` 기본 모델 교체 + 인덱스 재생성
2. **Layer 3 Phase 2c** — 쿼리 라우터 v0 (`query-router.mjs`)
   - 에러 키워드 / 명시 트리거 / 기술 용어 매칭
   - 일반 대화 skip → "모든 쿼리에 RAG" 안티패턴 회피
   - `search.mjs`에 통합, `--force` 옵션
3. **N=3 룰 명시** — `compound-engineering-philosophy.mdx` 원칙 9에 승격 트리거 박제
4. **Journal 025 갱신** — Phase 2b 결과표 추가

## 잘된 것

- **첫 실행에서 expected_slugs 카테고리 오류 발견** → 수정 후 재실행으로 정확한 측정 확보. POC 베이스라인 변수 동시 측정 메모리 룰 적용 성공
- **multilingual-e5-small 압도적 승리** — 한국어 0% → 60%이면서 영어 유지. 인덱스 크기 동일, 임베딩 시간 +30%만 증가
- **쿼리 라우터가 바로 동작** — "안녕" skip, "프롬프트 캐싱 비용 절감" 검색 실행 확인

## 아쉬운 것

- **benchmark-models.mjs에 embed-content.mjs 청킹 로직 복사** — DRY 위반이지만 벤치마크 독립성 우선. 향후 추출 검토
- **한국어 2/5 실패** — "iOS 테스트가 실행 안 되는 문제" → tuist-spm이 아닌 test-strategy 엔트리 반환. 쿼리 자체가 모호한 면도 있지만 개선 여지 있음

## 다음에 적용할 것

1. 라우터 규칙 N=3 누적 시 정밀도 개선 (현재는 v0)
2. Phase 3 — Cross-repo 인덱싱 (aidy/moneyflow/tarosaju solutions)
3. 섀도우 모드 + LLM-as-Judge 측정 (기존 전체 로드 vs JIT 주입 차이)

## Compound Assets

| 자산 | 경로 | 재사용 시점 |
|---|---|---|
| 벤치마크 스크립트 | `scripts/benchmark-models.mjs` | 새 임베딩 모델 후보 추가 시 |
| 쿼리 라우터 | `scripts/lib/query-router.mjs` | JIT retrieval 통합 시 import |
| N=3 승격 원칙 | compound-engineering-philosophy.mdx 원칙 9 | solution 3건 이상 누적 시 |

## 수치

| 항목 | 값 |
|---|---|
| 신규 스크립트 | 2 (benchmark-models, query-router) |
| 수정 스크립트 | 2 (embed-content, search) |
| 수정 엔트리 | 2 (compound-philosophy, journal-025) |
| 벤치마크 실행 | 2회 (expected_slugs 수정 전후) |
| 모델 비교 | 3개 × 7 쿼리 × 1287 청크 |
| 빌드 검증 | 4회 통과 |
