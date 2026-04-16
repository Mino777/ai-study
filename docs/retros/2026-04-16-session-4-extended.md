# 2026-04-16 세션 4 (확장) 회고 — Layer 3 POC + Phase 2 첫 조각

## 이번에 한 것

세션 4 첫 사이클(Mermaid warning + Journal 024) 직후 사용자 요청으로 Layer 3 POC를 이어서 진행:

1. **Layer 3 (JIT Retrieval) POC Phase 1** — 임베딩 인덱서 + 검색 CLI 구축, 7개 쿼리 실측, Journal 025 박제
2. **Phase 2 첫 조각** — `docs/solutions/` + `docs/retros/` 인덱싱 추가 → 동일 한국어 쿼리 재검증 → 솔루션 문서 Top-1 진입 확인
3. **compound 사이클** — CHANGELOG · 회고 · 메모리 · NEXT.md 교체

## 잘된 것

- **Phase 1 → Phase 2 a 한 사이클 안에 명확한 ROI 데이터** — Phase 1에서 "docs/solutions 미인덱싱" 발견 → Phase 2a에서 즉시 보완 → "Mermaid 따옴표 누락" 쿼리에서 솔루션이 Top-1 진입. 가설→검증→보완 루프가 한 세션에 닫힘
- **POC 결과를 가설 검증 데이터로 박제** — "성공/실패" 이분법 대신 "어느 변수가 다음 사이클을 정의하는가" 로 프레임. Journal 025 메시지가 명확
- **외부 의존성 최소화 결정** — Chroma/Pinecone 대신 JSON + brute force, 외부 API 대신 로컬 임베딩. POC의 "롤백 비용 낮음" 4 조건 보수적 해석. 1141 청크 brute force가 1~3ms로 충분히 빠르다는 실측 데이터까지 확보
- **Phase 2 변수 3개를 명확히 분리** — 모델 / 인덱싱 범위 / 라우터. 다음 세션이 어디서 시작할지 수치로 정의 (영어 vs 한국어 적중률 차이)

## 아쉬운 것

- **한국어 모델 한계가 예상보다 컸음** — Phase 1 결과를 보면 한국어 쿼리 3/3 적중 실패. 모델 변경 없이는 실서비스 불가능 수준. multilingual-e5 비교를 Phase 1에 같이 했으면 한 번에 답이 나왔을 텐데, "단계 분리" 원칙을 너무 엄격히 적용
- **Cross-repo 인덱싱 범위 누락** — aidy-architect의 `docs/solutions/2026-04-16-ios-tests-never-ran.md` 같은 워커 프로젝트 솔루션은 ai-study 인덱스에 없음. iOS 테스트 쿼리가 못 잡힌 이유 중 하나. Phase 3 후보로 정리 필요
- **메모리 룰 "한 세션 2-3 Journal" 살짝 초과** — 이번 세션 Journal 024 + 025 + 솔루션 1건. 메시지가 명확해서 OK였지만 다음에 더 신중

## 다음에 적용할 것

1. **Phase 2b 시작 시 multilingual-e5-small 즉시 비교** — `embed-content.mjs` 의 모델 ID 한 줄만 바꿔서 동일 7 쿼리 재실측. POC 검증 사이클의 ROI가 가장 큼
2. **POC 단계 분리 시 "당겨올 수 있는 변수" 같이 검증** — Phase 1에서 모델 1개만 고집할 게 아니라 베이스라인으로 2~3개 같이 측정 권장
3. **Cross-repo 인덱싱은 Phase 3** — 단순히 `aidy-architect/docs/solutions/` 추가는 단방향(ai-study가 워커 솔루션 읽음). 워커 → 허브 sync 패턴 별도 설계 필요

## Compound Assets

- **`scripts/embed-content.mjs` + `search.mjs`** — 다른 프로덕트(moneyflow/tarosaju/aidy)에 그대로 이식 가능. SOURCES 배열만 프로덕트별 조정
- **POC 검증 프로토콜** — "한국어/영어 각 3 쿼리 + 추상/구체 골고루 7개" 가 모델 한계를 명확히 드러냄. Phase 2 모델 비교 시 동일 7개 재사용
- **"인프라 작동 vs 검색 품질 분리 평가" 원칙** — POC 회고 시 두 차원을 섞지 말 것. 인프라 OK + 품질 부족이면 모델 변수, 둘 다 부족이면 설계 재검토

## 수치

| 항목 | 값 |
|------|-----|
| 변경 파일 | 7 (embed-content.mjs · search.mjs · Journal 025 · package.json · package-lock.json · .gitignore · CHANGELOG) |
| 추가 라인 | +1,506 |
| 신규 의존성 | 1 (@xenova/transformers, 76 packages) |
| 인덱스 청크 | 0 → 1141 (entry 107 + solution 19 + retro 10) |
| 인덱스 크기 | 0 → 10.5 MB |
| 검색 응답 | 1~3ms (brute force, 1141 청크) |
| 모델 다운로드 | 일회성 ~80MB (이후 캐시) |
| 신규 엔트리 | 1 (Journal 025) |
| 신규 솔루션 | 0 (Journal 025 자체가 박제) |
| 검증 쿼리 | 9 (Phase 1: 7 + Phase 2a: 2 재검증) |
| 영어 쿼리 적중 | 2/2 (Top-1) |
| 한국어 쿼리 적중 | 0/3 (Phase 1) → 1/2 부분 개선 (Phase 2a, 솔루션 진입) |
