# 회고: 2026-04-17 세션 8 최종 — 위키 품질 완성 + Phase 3 통과

## 이번에 한 것

1. **ccusage 재측정** + 프로젝트별 비용 분석 (moneyflow 45%, tarosaju 26%)
2. **인제스트 역링크 자동화** — /ingest Phase 5b
3. **AI Agent Directive 100%** — 6 병렬 에이전트 + 직접 처리
4. **검색 최근 엔트리 버그 수정** — search-index.json 날짜순 정렬
5. **일방향 연결 339건 → 0건** — fix-one-way-connections.mjs 스크립트
6. **Layer 3 Phase 3 섀도우 벤치마크** — 적중률 93%, 토큰 99.8% 절감
7. **신규 엔트리 2건** — 프로젝트별 비용 분석 + 병렬 에이전트 패턴

## 잘된 것

- **병렬 에이전트 패턴 재현**: Directive 추가에 이어 역링크 스크립트도 일괄 처리. 대규모 작업에 대한 패턴 확립
- **위키 품질 린트 ✅ 이상 없음**: 고아 0, Directive 100%, 일방향 0 — 세 지표 모두 green
- **Phase 3 벤치마크 한 번에 통과**: 15개 테스트 쿼리 중 14개 Top-5 적중
- **ccusage --instances 발견**: 프로젝트별 비용 분리가 가능하다는 것을 확인. ROI 타겟 식별

## 아쉬운 것

- **세션이 길어짐**: compound 2회 실행. 세션 길이 원칙(2-3 Journal) 초과
- **gray-matter stringify가 frontmatter YAML 형식을 변경**: 역링크 스크립트 실행 시 gray-matter가 기존 YAML 인라인 배열을 block 형식으로 변환. 기능에는 영향 없지만 diff가 불필요하게 큼 (+4,091/-1,677)
- **Phase 3 벤치마크의 토큰 추정이 rough**: char/3.5 기반. tiktoken 같은 정확한 토크나이저 미사용

## 다음에 적용할 것

- **JIT 검색 실전 통합**: 벤치마크 통과했으니 Claude Code 세션에 실제 주입 가능
- **gray-matter stringify 형식 보존**: 역링크 스크립트에서 원본 YAML 형식 보존 옵션 검토
- **세션 길이 준수**: compound 후 새 세션으로 이어가기

## Compound Assets

| 자산 | 위치 | 재사용 가치 |
|---|---|---|
| fix-one-way-connections.mjs | scripts/ | 일방향 감지 + 일괄 역링크 — 콘텐츠 추가 후 주기적 실행 |
| shadow-benchmark.mjs | scripts/ | JIT 검색 품질 회귀 테스트 — 모델/라우터 변경 시 재실행 |
| 병렬 에이전트 패턴 | content/harness-engineering/ | 대규모 일괄 수정의 재현 가능한 패턴 |
| 프로젝트별 비용 분석 | content/tokenomics/ | ROI 타겟 식별 패턴 |
| Directive 100% | content/**/*.mdx | 에이전트 라우팅 즉시 사용 가능 |
| 양방향 그래프 762 edges | content-manifest.json | 지식 발견 양방향 완성 |

## 수치

- 파일 수정: 116개, +6,497줄, −1,815줄
- Directive: 35/86 → 79/79 (100%)
- 일방향: 339 → 0
- Edges: 416 → 762
- Phase 3: Top-5 93%, Top-1 73%, 절감 99.8%
- 프로젝트별: moneyflow $2,209 (45%), tarosaju $1,259 (26%), ai-study $740 (15%)
