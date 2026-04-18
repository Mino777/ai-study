# Changelog

모든 주목할 만한 변경사항을 이 파일에 기록합니다.

## [2026-04-19] 세션 16c — 긱뉴스 데일리 스카우트 파이프라인

> 매일 22:00 KST — 긱뉴스 전체 스캔 → 4개 프로젝트 방향성 매칭 → 이식 계획 Issue 자동 생성

### Added

- **긱뉴스 데일리 스카우트** — `scripts/scout-geeknews.mjs` (기존 curate-geeknews와 완전 별도)
  - RSS 30개 기사 전체 스캔 → Gemini 2.5 Flash 1회 호출로 4개 프로젝트 동시 매칭
  - 매칭된 프로젝트 레포에 `hub-dispatch` 라벨 Issue 자동 생성
  - 프로젝트별 방향성 컨텍스트 내장 (ai-study/moneyflow/tarosaju/aidy)
  - `--dry-run` 지원, GitHub Step Summary 출력
- **GitHub Actions 워크플로우** — `.github/workflows/daily-scout-geeknews.yml`
  - 매일 22:00 KST (13:00 UTC) 자동 실행 + workflow_dispatch
  - cross-repo Issue 생성을 위한 GH_PAT 지원 (미설정 시 GITHUB_TOKEN 폴백)

### Metrics

| 항목 | Before | After |
|---|---|---|
| 워크플로우 | 7 | **8** (+daily-scout-geeknews) |
| 자동화 스크립트 | curate 1개 | **+scout 1개** (학습용 vs 이식용 분리) |
| 프로젝트 스캔 범위 | 1개 best pick | **4개 프로젝트 × 30 기사 전체** |
| Gemini 호출 | 2회 (선정+평가) | **1회** (전체 매칭 일괄) |

---

## [2026-04-19] 세션 16b — 긱뉴스 자동 큐레이션 + 허브 디스패치 체계

> 미응답 이슈 → 긱뉴스 RSS 큐레이션 → 자동 엔트리 생성 파이프라인 완성 + 이식 가능성 평가 + 4 워커 프로젝트 hub-dispatch 체계

### Added

- **긱뉴스 자동 큐레이션 파이프라인** — `scripts/curate-geeknews.mjs` + `.github/workflows/auto-lesson-geeknews.yml`
  - 24h 미응답 daily lesson 이슈 감지 → 긱뉴스 RSS → Gemini 최적 글 선정 → 엔트리 생성 → PR → 자동 머지
  - 이식 가능성 자동 평가 (assessActionability) → actionable-insight 이슈 자동 생성
- **긱뉴스 큐레이션 엔트리 3건** — agents/멀티 에이전트 컴파일, backend-ai/API 과금 방지, context-engineering/Contexty
- **허브 디스패치 체계** — `hub-dispatch` 라벨로 워커 4프로젝트에 이슈 자동 할당
  - moneyflow (#131, #132), tarosaju (#46), aidy-server (#6), aidy-architect (#1, #2)
  - 각 워커 CLAUDE.md에 세션 시작 시 hub-dispatch 확인 규칙 추가

### Fixed

- **generate-on-pick bot 오트리거** — `user.type != 'Bot'` 조건 추가 (중복 PR #56, #57 방지)
- **Mermaid `<br/>` 렌더링 에러** — 2개 엔트리 수정 + Gemini 프롬프트 규칙 5 추가
- **날짜 UTC→KST** — generate-lesson.mjs + 워크플로우 4개 전부 `Asia/Seoul` 기준으로 통일

### Changed

- **CLAUDE.md** — Context Window 60% 임계값 규칙 추가
- **NEXT.md** — 이식 큐 4건 추가 (API 프록시, AgentCompiler, SDD, Hub-Worker 병렬화)

### Metrics

| 항목 | Before | After |
|---|---|---|
| 엔트리 수 | 134 | **137** (+3 긱뉴스) |
| 워크플로우 | 6 | **7** (+auto-lesson-geeknews) |
| hub-dispatch 이슈 | 0 | **6** (4 프로젝트) |
| 날짜 기준 | UTC | **KST** |
| Gemini 프롬프트 규칙 | 4 | **5** (+Mermaid br 금지) |

---

## [2026-04-19] 세션 16 — NEXT.md 큐 소화 + 그래프 시각 개선

> computeGraphSignals 테스트 보강 + 승격 CI 파이프라인 + 추천 다양성 + Obsidian 스타일 그래프 레이아웃

### Added

- **computeGraphSignals vitest 10케이스** — weakHubCategories 5 + categoryConnectivity 3 + edge case 2. 함수를 `scripts/lib/graph-signals.mjs`로 분리 + export
- **솔루션 승격 자동 스캔 CI** — `.github/workflows/promotion-scan.yml` (docs/solutions 변경 시 + 매주 월 09:00 KST). N≥3 카테고리 감지 → Issue 자동 생성/업데이트
- **추천 다양성 cap** — `generate-lesson.mjs`에서 같은 카테고리 최대 2건 제한 (3건 연속 방지)

### Changed

- **지식 그래프 레이아웃** — charge -1200→-280, forceRadial 추가 (r=220), distanceMax 220, linkDistance 90→110. 세로 찌그러짐 → 컴팩트 원형 레이아웃

### Metrics

| 항목 | Before | After |
|---|---|---|
| vitest 케이스 | 23 | **33** (+10) |
| 그래프 charge | -1200 | **-280** |
| 추천 다양성 | 제한 없음 | **카테고리당 max 2** |
| 승격 CI | 수동 스캔 | **자동 Issue 생성** |
| NEXT.md 큐 소화 | High 2 + Medium 1 | **High 2 + Medium 1 완료** |

---

## [2026-04-18] 세션 15 — 크로스 세션 리뷰 + Graph-Lesson 연동

> 세션 14 크로스 검증 → confidence 교정 3건 + 엔트리 현실 반영 + graph-query 신호를 generate-lesson 추천에 연동

### Changed

- **딥리서치 3건 confidence:3→2 하향** — 리서치 기반 상한 룰 적용 (feedback_research_entry_confidence)
- **멀티에이전트 엔트리 Hub-Worker 섹션** — "진화 방향" → "달성 vs 실제 다음 단계" 3열 테이블로 교체, 이미 병렬 운영 중인 현실 반영
- **generate-lesson.mjs graph 신호 연동** — `computeGraphSignals()` 추가, 약한허브 카테고리 +1.5점 + 고연결저confidence +1.0점 부스트

### Metrics

| 항목 | Before | After |
|---|---|---|
| 추천 신호 | dangling + pool + staleness | **+ graph weakHub + connectivity** |
| 딥리서치 confidence | 3 (과대) | **2** (리서치 상한 적용) |
| 크로스 세션 리뷰 | 6 함정 검증 | URL 10건 중 8 통과 |

---

## [2026-04-18] 세션 14 — 2026 딥리서치 + 도구 2건 + SDD 강화

> 하네스/컴파운드 엔지니어링 2025-2026 최신 동향 3에이전트 병렬 리서치 → 위키 박제 3건 + Gemini 최적화 + Graph Query + 승격 스캐너

### Added

- **context-engineering/context-engineering-2026-paradigm-shift** — Gartner breakout capability, 60% 임계값, 3층 메모리 아키텍처, 5요소 Context 설계
- **harness-engineering/spec-driven-development-for-ai-agents** — SDD 방법론, 코드 ≠ 진실 원칙, 6-Layer 테스트 하네스, Gartner 40% 취소 예측
- **agents/multi-agent-orchestration-patterns-2026** — Planner-Worker-Judge 3역할, 모델 라우팅 40-60% 절감, git worktree 격리
- **scripts/graph-query.mjs** — 지식 그래프 쿼리 CLI 7개 명령 (neighbors/dangling/islands/hubs/path/weak-links/suggest)
- **scripts/scan-promotions.mjs** — 솔루션 승격 자동 스캐너 (N=3+ 감지, 승격 형태 제안, --json CI 연동)
- **SPEC.md Acceptance Spec** — Build/Content/Promotion 3단 Gate 명시 (SDD 강화)

### Changed

- **Gemini 파이프라인 토큰 최적화** — 카테고리 스코프 컨텍스트 (전체 134→같은 카테고리 ~10개), ping 테스트 제거, 본 호출 시 직접 폴백
- **generate-lesson.mjs 누락 카테고리** — tokenomics, android-ai, backend-ai 3개 추가 (CATEGORIES + PRIORITY + LABELS + catKeywords)
- **NEXT.md 큐 재정렬** — High 2건 (Validator 자동 승격, Graph 메모리 쿼리) + Low 2건 (Semantic Caching, 모델 라우팅) 추가

### Metrics

| 항목 | Before | After |
|---|---|---|
| 엔트리 수 | 131 | **134** (+3) |
| 신규 도구 | graph-query 없음 | **graph-query + scan-promotions** |
| Gemini 컨텍스트 | 전체 134개 제목 전송 | **카테고리 ~10개만** (90%+ 절감) |
| SPEC.md | Acceptance Spec 없음 | **3단 Gate 명시** |
| 그래프 | 134 노드, 852 엣지 | Top 허브: compound-engineering-philosophy (67 연결) |

---

## [2026-04-18] 세션 13 — CI 안정화 + 큐 정리 + 워커 재료 박제

> npm audit CI 실패 해결 + 미완성 마커 해소 + 3프로젝트 재료 체크 → 엔트리 2건 신규 + 1건 보강

### Added

- **prompt-engineering/empathetic-ai-prompt-techniques** — Rogerian/MI/NVC 3가지 상담 심리 프롬프트 기법 + 위기 신호 서버 가드레일 (tarosaju 실전)
- **infrastructure/parallel-worktree-git-lock-trap** — 병렬 worktree git config.lock race condition 함정 + 순차 생성 회피 패턴 (moneyflow 실전)
- 일방향 연결 5건 역링크 추가

### Changed

- **Zod 5-Layer 엔트리 갱신** — "미적용" → tarosaju 3 route + moneyflow 10 에이전트 실전 적용 데이터 추가
- CI `npm audit` 명령에 `--omit=dev` 플래그 추가 (ci.yml primary + fallback 양쪽)

### Fixed

- **npm audit CI 실패** — dompurify moderate 취약점 패치 + CI `--omit=dev` 추가
- **미완성 마커 빌드 경고 2건** — Journal 003 + Tokenomics FP 표현 수정

### Metrics

| 항목 | Before | After |
|---|---|---|
| 엔트리 수 | 129 | **131** (+2) |
| CI npm audit | 실패 (5 vulnerabilities) | **통과 (0)** |
| 빌드 경고 | 2건 | **0건** |
| validate-mdx Trap 3 FP율 | 미측정 | **90%+ (의도된 동작)** |

---

## [2026-04-17] 세션 11b — JIT 검색 4프로젝트 이식 + 대시보드 버그 수정

> JIT 검색 파이프라인을 moneyflow/tarosaju/aidy-architect 3프로젝트에 동시 이식

### Added

- **JIT 검색 이식** — 3 프로젝트에 embed-content + search + query-router 배포
  - moneyflow: 61 .md → 354 청크 (3.1MB)
  - tarosaju: 38 .md → 227 청크 (~2MB)
  - aidy-architect: 58 .md → 308 청크 (2.6MB)
- 각 프로젝트 CLAUDE.md에 JIT 검색 사용법 추가

### Fixed

- **대시보드 JIT 통계** — `solutions/` 경로 엔트리를 Top 조회 목록에서 필터링
  - 원인: `entries.find(slug)` 매칭 실패 → slug 그대로 표시되던 버그

### Metrics

| 항목 | Before | After |
|---|---|---|
| JIT 검색 배포 프로젝트 | 1 (ai-study) | **4** (+moneyflow, tarosaju, aidy-architect) |
| 총 인덱싱 문서 | 145 | **~290** (4 프로젝트 합산) |
| 대시보드 FP | solutions 경로 노출 | **content 엔트리만 표시** |

---

## [2026-04-17] 세션 11 — 스킬 검증 + Aidy Journal s9-s14 박제

> 스킬 dry-run 검증으로 false positive 제거 + aidy-architect 6세션분 위키 박제

### Added

- **Aidy Journal 008** (s9-s10) — UI Test Automation Sprint + Backlog Zero
  - XCUITest 42건 + Compose UI Test 35건 전 화면 자동화
  - QA 에이전트 `ui` 모드 추가, Backlog 전량 소진
- **Aidy Journal 009** (s11-s14) — Stall Detection + 3-way Dispatch + Feature Sprint
  - Worker Stall Detection 4단계 프로토콜
  - 3-way 동시 dispatch, CRUD 6기능 3-client 구현, 테스트 562→637건

### Changed

- **validate-mdx** — Trap 2/4 제외 규칙 추가 (이미 따옴표 감싼 valid Mermaid 구문 FP 제거)
- **가짜 인용구 수정** — agent-self-evaluation-bias-countermeasures.mdx 직접 인용 → 간접 인용 [의역]

### Metrics

| 항목 | Before | After |
|---|---|---|
| 엔트리 수 | 127 | **129** (+Aidy Journal 008/009) |
| validate-mdx FP | 100% (2/2) | **0%** (제외 규칙 보강) |
| validate-ai-output FP | 0% | 0% (유지) |
| JIT 적중률 | Top-5 93% | **93% 유지** |
| 역링크 | — | **+10건** 자동 추가 |

---

## [2026-04-17] 세션 10 — JIT 히트 카운트 + 스킬 자동 생성 첫 실행

> NEXT.md 큐 🔴 High 1번 실행: solutions N≥3 카테고리에서 스킬 3개 추출 + JIT 검색 관찰성 확보

### Added

- **JIT 검색 히트 카운트** — `search.mjs` → `data/search-hits.json` 영구 기록 → manifest → UI 표시
  - 엔트리 상세 페이지: SummaryCard에 "JIT N회" 배지
  - 위키 목록 페이지: 각 카드에 히트 카운트 표시
  - 0회 엔트리 자연스럽게 식별 가능 (1000+ 쿼리 축적 후 활용)
- **스킬 3개 자동 생성** (docs/solutions 16건에서 패턴 추출):
  - `/validate-mdx` — MDX/Mermaid 5대 함정 사전 grep (mdx 5건)
  - `/validate-ai-output` — AI 생성물 4대 함정 검증 (ai-pipeline 4건)
  - `/promote-solution` — N=3+ 솔루션 코드 게이트 승격 프로세스 (workflow 7건)

### Metrics

| 항목 | Before | After |
|---|---|---|
| 슬래시 커맨드 | 8 | **11** (+validate-mdx, validate-ai-output, promote-solution) |
| JIT 관찰성 | 검색만 가능 | **검색 + 히트 카운트 추적** |
| manifest 필드 | 6 | **7** (+searchHits) |

---

## [2026-04-17] 세션 9 — Superpowers+Hermes+aidy 패턴 이식 + 6프로젝트 배포

> 외부 프레임워크 3개(Superpowers, Hermes, aidy-architect)에서 8개 패턴 평가, 7개 이식, 6개 프로젝트 배포

### Added

- **No-Placeholder Scan** — validate-content.mjs에 미완성 마커 탐지 (정밀도 조정 포함)
- **Anti-Rationalization Guard** — compound Phase 3b, 16건 회고 분석 기반 3층 방어
- **SDD 2-Stage Review** — review.md 신규 (Plan 있으면 Spec compliance + Code quality)
- **Frozen Snapshot 원칙** — CLAUDE.md, 세션 중 수정 금지 + 200줄 제한
- **프로세스 개선 Phase** — compound Phase 4, 인시던트/병목/비효율 자동 수집
- **경험→스킬 자동 생성** — compound Phase 4b, docs/solutions N≥3 시 스킬 승격
- **NEXT.md 교체 Phase** — compound Phase 6
- **신규 엔트리 2건** — 자기 평가 바이어스 대응 + 크로스 프로젝트 패턴 이식 방법론
- **6프로젝트 이식** — ai-study/moneyflow/tarosaju/aidy-architect/ios/server/android

### Fixed

- **JSX trap false positive** — `{worker}` backtick 감싸기 (1건→0건)
- **Directive 100% 복원** — superpowers/hermes 엔트리 Directive 추가

### Metrics

| 항목 | Before | After |
|---|---|---|
| 엔트리 수 | 125 | **127** |
| Directive | 100% | **100%** (85/85) |
| compound Phase 수 | 5 | **7** (Phase 3b/4/4b/6 추가) |
| 이식 프로젝트 | 1 | **6** |
| validate 검출 패턴 | 3 (JSX) | **4** (+Placeholder) |

---

## [2026-04-17] 세션 8 최종 — Directive 100% + 일방향 0건 + Phase 3 통과 + JIT 실전 통합

> Karpathy 합류 루프 완성: 인제스트→위키 강화 / 작업 시→JIT 검색 / 작업 후→compound 박제

### Added

- **AI Agent Directive 100%** — 79/79 non-journal 엔트리 (41% → 100%, 6개 병렬 에이전트)
- **일방향 연결 0건** — 339건 → 0건, edges 416 → 762 (양방향 완성)
- **Phase 3 섀도우 벤치마크** — 적중률 Top-5 93%, Top-1 73%, 토큰 절감 99.8%
- **프로젝트별 비용 분석** — `ccusage --instances` 첫 활용, moneyflow 45% + tarosaju 26%
- **신규 엔트리 2건** — 프로젝트별 비용 패턴 + 병렬 에이전트 패턴
- **신규 스크립트 2건** — `fix-one-way-connections.mjs` + `shadow-benchmark.mjs`
- **인제스트 역링크 자동화** — `/ingest` Phase 5b 추가
- **JIT 위키 검색 실전 통합** — `--inject` 모드 + CLAUDE.md 에이전트 지시 (331K→800 tokens)

### Fixed

- **검색 '최근 엔트리' 버그** — search-index.json 알파벳순 → 날짜 내림차순 정렬

### Metrics

| 항목 | Before | After |
|---|---|---|
| Directive | 41% (35/86) | **100%** (79/79) |
| 일방향 연결 | 339건 | **0건** |
| 그래프 edges | 416 | **762** |
| Phase 3 적중률 | 미측정 | Top-5 **93%**, Top-1 **73%** |
| 토큰 절감 (JIT) | 미측정 | **99.8%** (331K → 821 tokens) |
| 수정 파일 | - | 116개, +6,497줄 |
| 빌드 | - | ✅ 통과 (123 entries) |
| 위키 린트 | - | ✅ 이상 없음 |

---

## [2026-04-17] 세션 7 최종 — Karpathy LLM Wiki 패턴 적용 + SWOT + 토큰 레버

### Added — 신규 엔트리 2건 + 인프라 3건 (119 → 121)

- `context-engineering/karpathy-llm-wiki-pattern-compilation-over-retrieval.mdx` — Karpathy LLM Wiki 패턴 /ingest (Gist 원문 + 3개 보강 소스 교차 검증). Compilation > Retrieval 철학 + ai-study 비교 + 적용 방향 5건
- `context-engineering/llm-wiki-swot-ai-study-vs-karpathy.mdx` — 실측 기반 SWOT 비교 분석. SO: Compound+Compilation 합류(양방향 컴파일), WO: 크로스 업데이트+Directive 투입, ST: 차별화 3종(Compound/Directive/Quiz)
- `scripts/validate-content.mjs` — 위키 린트 추가 (고아 엔트리 / Directive ���락 / 일방향 연결 warning-only)
- `scripts/generate-content-manifest.mjs` — wiki-index.md 자동 생성 (카테고리별 한 줄 요약, 에이전트 drill-down용)
- `scripts/lib/query-router.mjs` — Layer 3 Phase 2c 쿼리 라우터 v0

### Changed — 토큰 레버 4건 적용

- `CLAUDE.md` **324→177줄** (−45%) — RTK 이중 로딩 제거 + Components/Admin 슬림화 (A1)
- `~/.claude/settings.json` — `includeGitInstructions: false` (A4) + `MAX_MCP_OUTPUT_TOKENS=5000` (C2) + `CLAUDE_CODE_SUBAGENT_MODEL=haiku` (D2)
- `tokenomics/claude-code-token-levers-applied-log.mdx` — 적용 로그 2건 추가

### Metrics

| 항목 | 값 |
|---|---|
| 신규 엔트리 | 2 (Karpathy 패턴 + SWOT) |
| 신규 스크립트 | 3 (benchmark-models, query-router, wiki lint + wiki-index) |
| CLAUDE.md | 324 → **177줄** (−45%) |
| 토큰 레버 | 4건 (A1, A4, C2, D2) |
| 위키 린트 실측 | Directive 59%, 일방향 332건 |
| 빌드 | ✅ 통과 (121 entries, 416 edges) |

---

## [2026-04-17] 세션 7 후반 — Layer 3 Phase 2b/2c + N=3 룰 박제

### Added — 신규 스크립트 2건

- `scripts/benchmark-models.mjs` — 3 모델 동시 비교 벤치마크 (7 쿼리 × 1287 청크). Phase 2b 산출물
- `scripts/lib/query-router.mjs` — 규칙 기반 쿼리 라우터 v0 (에러 키워드 / 명시 트리거 / 기술 용어). Phase 2c 산출물

### Changed — Layer 3 핵심 변경 3건

- `scripts/embed-content.mjs` — 모델 교체: `all-MiniLM-L6-v2` → `multilingual-e5-small` (한국어 Top-1 0% → 60%)
- `scripts/search.mjs` — 쿼리 라우터 통합 (일반 대화 skip, `--force` 옵션)
- `compound-engineering-philosophy.mdx` — 원칙 9에 N=3 승격 트리거 + warning-only / idempotency 원칙 명시 (Journal 024 후속)
- `harness-journal-025-jit-retrieval-poc-phase1.mdx` — Phase 2b 갱신 로그 (3 모델 비교 결과표)

### Metrics

| 항목 | 값 |
|---|---|
| Phase 2b 모델 비교 | 3 모델 × 7 쿼리 × 1287 청크 |
| 한국어 적중률 향상 | Top-1 0/5 → **3/5** (multilingual-e5-small) |
| 영어 적중률 유지 | Top-1 2/2 (변동 없음) |
| 라우터 규칙 | 명시 트리거 5 + 에러 키워드 20 + 기술 용어 30 + 스킵 2 |
| 빌드 | ✅ 통과 (119 entries) |

---

## [2026-04-17] 세션 7 전반 — Aidy Journal 007 박제 (s8 CI 인프라 독립화)

### Added — 신규 엔트리 1건 (118 → 119)

- `harness-engineering/aidy-journal-007-ci-infra-independence-hybrid-fallback.mdx` — Session 8: WO-012(Node.js 24) billing 차단 재발 → ADR-010 방향 전환 → WO-014/015(server/android self-hosted) + WO-016(Hybrid fallback) 동일 세션 완주. continue-on-error masking 미문서화 버그 발견 → Mark-step 우회 패턴 설계 + 실증. 3 워커 QA 에이전트 배치(466 tests all green). send-seq P3-7 첫 실전 + spec-first-verify-first 원칙 도출

### Changed — 기존 엔트리 역링크 보강

- `aidy-journal-006-ios-ci-self-hosted-runner-migration.mdx` — "후속 WO 3건 (Session 8 대기)" → "후속 WO 3건 → Session 8 완료" + Journal 007 링크

### Metrics

| 항목 | 값 |
|---|---|
| 신규 엔트리 | 1 (Journal 007) |
| 수정 엔트리 | 1 (Journal 006 역링크) |
| 총 엔트리 수 | 118 → **119** |
| 박제 대상 (aidy-architect) | `59f8731` + `e3a08ea` v0.8.0 |
| 박제 교훈 | 5건 (선행 투자 복리 / continue-on-error 지뢰 / spec-first-verify-first / 크로스 워커 전파 / Hybrid 쿼터 최적화) |
| 빌드 | ✅ 통과 (Next.js 16.2.3, 119 entries) |
| Mermaid 검증 | ✅ 30 블록, 0 에러 |

---

## [2026-04-17] 세션 6 — Aidy Journal 006 박제 + 교훈→도구→사례 3단 연결

### Added — 신규 엔트리 1건 (117 → 118)

- `harness-engineering/aidy-journal-006-ios-ci-self-hosted-runner-migration.mdx` — WO-010 진단 3회 정정(tuist↔macos-14 → 결제 차단 → ai-review.yml 알림 폭탄) + ADR-009 self-hosted runner 결정 + 실측 180min → 0min + 후속 WO 3건(011 Swift 6 / 012 Node.js 24 P0 / 013 워크플로 통합)

### Changed — 기존 엔트리 출처 보강 (교훈→도구→사례 3단 연결)

- `aidy-journal-003-parallel-dispatch-token-economics.mdx` "출처" 섹션 — `a4f8861 v0.7.1` 커밋 추가(s6 교훈이 실제 도구로 박제된 시점) + Journal 006 역링크
- `tmux-flush-automation-pattern.mdx` "출처" 섹션 — `ci-status.sh` 자매 도구 명시 + `a4f8861` 커밋 + Journal 006 역링크
- 연결 패턴 확립: **교훈 엔트리(Journal 003) → 도구화 커밋(v0.7.1) → 첫 실행 사례(Journal 006)** 3단을 양 끝에서 역링크로 묶음

### Metrics

| 항목 | 값 |
|---|---|
| 신규 엔트리 | 1 (Journal 006) |
| 수정 엔트리 | 2 (출처 보강) |
| 총 엔트리 수 | 117 → **118** |
| 박제 대상 (aidy-architect) | `a4f8861` v0.7.1 + `0e23007` v0.7.2 |
| 실측 수치 박제 | 4월 macOS 분 ~180min → **0min**, 124 tests / 1m 56s |
| 빌드 | ✅ 통과 (Next.js 16.2.3) |
| Mermaid 검증 | ✅ 30 블록, 0 에러 |

---

## [2026-04-17] 세션 5 — Aidy 생태계 스프린트 박제 + 연결 보강 + 중복 압축

### Added — 신규 엔트리 10건 (107 → 117)

**Aidy Journal 시리즈 확장 (3건)**
- `harness-engineering/aidy-journal-003-parallel-dispatch-token-economics.mdx` — Session 6 R9 토큰 경제성 사건. 10R × 3워커 = 라운드당 4 Claude 인스턴스 동시 활동, architect 1 : worker 3 소비 비율. 429 후 순차 재개 성공
- `harness-engineering/aidy-journal-004-test-evidence-policy-effectiveness.mdx` — s4 iOS 테스트 무실행 사건 → s5 자발적 준수 + QA 라운드 불필요 관찰. 정책 3층 박제(gates/CLAUDE.md/build_prompt) → 내재화
- `harness-engineering/aidy-journal-005-sse-phase1-to-phase2-progressive-rollout.mdx` — ADR-008 SSE Phase 1(fake-stream, s5) → Phase 2(Anthropic 실연동, s6). Feature Flag 없이 Phase 경계만으로 점진 도입

**SSE 3-플랫폼 0-dep (3건)**
- `backend-ai/spring-boot-sse-streaming-0-dep.mdx` — SseEmitter + OkHttp BufferedSource.readUtf8Line. Circuit Breaker execute 래핑으로 스트리밍 확장
- `ios-ai/urlsession-bytes-sse-subscription.mdx` — URLSession.bytes + AsyncLineSequence + AsyncThrowingStream. continuation.onTermination으로 cancel 전파
- `android-ai/okhttp-buffered-source-sse.mdx` — OkHttp BufferedSource + sealed SseEvent + Flow retryWhen 1회 재시도. readTimeout 0 핵심

**backend-ai 보안/성능 (2건)**
- `backend-ai/password-reset-security-pattern.mdx` — SecureRandom 24byte URL-safe Base64 32자, 30분 만료, 1회용(used_at), 5분 쿨다운 기존 토큰 유지, 미존재 이메일도 200 응답(enumeration 방지)
- `backend-ai/pg-trgm-gin-index-for-like-search.mdx` — V12 마이그레이션. CREATE EXTENSION IF NOT EXISTS + gin_trgm_ops 오퍼레이터 클래스, H2 프로파일 flyway.enabled=false 자동 우회

**harness-engineering 인프라 (2건)**
- `harness-engineering/worker-prompts-logging-pattern.mdx` — architect-cli.sh `tmux_send` 가 dispatch 프롬프트 원문을 날짜별 파일로 자동 기록. 비대칭 로깅(프롬프트만, 응답 안 함) 원칙
- `harness-engineering/tmux-flush-automation-pattern.mdx` — 4-Layer 방어: paste-buffer 경유 + C-m 3회 재시도 + 429 감지 30s 윈도우 + 5분 backoff + send-seq idle 대기 순차 모드

### Changed — 기존 엔트리 연결 보강 + 중복 압축

**연결 보강 (10 파일)**
- Aidy Journal 000/001/002: 신규 003/004/005 + 하네스 인프라 2 엔트리로 backward 링크
- Journal 002 "다음 Journal 후보" 섹션을 "후속 Journal" 실제 링크 테이블로 교체
- Flow Maps 3개 (backend/iOS/Android): 신규 SSE 엔트리 + Journal 005 연결
- `spring-boot-ai-circuit-breaker.mdx`: "스트리밍 확장" 섹션 신설 — Journal 005의 CB 래핑 재사용 패턴
- `numeric-execution-evidence.mdx` + `test-strategy-3-client-via-aidy.mdx`: Journal 004 연결

**중복 압축 (2 파일)**
- `aidy-journal-003`: §3(429 구현 bash) + §4(send-seq 구현)을 판단 기준 + 링크로 축약. 구현 세부는 tmux-flush-automation-pattern 전담
- `tmux-flush-automation-pattern`: "관측+로깅" 단락 5 bullet → 1문단 + Worker Prompts Logging 엔트리로 세부 전담
- 역할 분리: Journal 003 = "왜/판단 기준/교훈", tmux flush 엔트리 = "어떻게 구현"

### Added — 설계 초안 (deferred)
- `docs/highlights-page-design.md` — Highlights 페이지 설계안. 목적, 선정 기준(정량+정성), 구현 방식 2안 비교(frontmatter tier vs JSON), 현재 시점 Flagship 후보 8건, 구현 체크리스트 4단계, 착수 트리거. 다음 세션으로 연기
- `TODOS.md` P3 백로그 한 줄 연결

### Fixed
- MDX 파싱 에러 1건: `pg-trgm-gin-index-for-like-search.mdx` 의 `<col>` 문자열이 MDX에서 JSX 태그로 파싱됨 → 인라인 코드(`)로 감싸 해결. 솔루션 박제: `docs/solutions/mdx/2026-04-12-jsx-parsing-traps-curly-angle.md` 에 패턴 #3 보강

### Metrics
- 엔트리: 107 → **117** (+10)
- 카테고리 사용: harness-engineering(+5), backend-ai(+3), ios-ai(+1), android-ai(+1)
- Aidy Journal 시리즈: 3편 → **6편**
- 변경 합계: 22 files, **+3,209 / −40 lines**
- 커밋: 8건 (feat 5 + docs 3)
- Build: 117 MDX 컴파일 검증 PASS · 30 Mermaid 블록 검증 PASS · 135 pages 생성

---

## [2026-04-16] 세션 4 (확장) — Layer 3 POC Phase 1+2a (인프라 + 인덱싱 범위 확장)

### Added — Layer 3 (JIT Retrieval) 인프라
- **`scripts/embed-content.mjs`** — 로컬 임베딩 인덱서. `@xenova/transformers` + `Xenova/all-MiniLM-L6-v2`. content/ + docs/solutions/ + docs/retros/ 모두 H2 단위 청킹 → JSON 인덱스
- **`scripts/search.mjs`** — 쿼리 → Top-K 코사인 유사도 CLI. brute force, 1~3ms 응답
- **npm scripts**: `embed-content`, `search`
- **신규 의존성**: `@xenova/transformers` (76 패키지)
- **`.gitignore`**: `public/embeddings.json`

### Added — 신규 엔트리 1건
- **`harness-engineering/harness-journal-025-jit-retrieval-poc-phase1.mdx`** — POC 가설 검증 결과. 영어 쿼리 적중 우수, 한국어 부족 → 모델이 Phase 2 핵심 변수. 인덱싱 범위 확장 가치 실증

### Added — Phase 2 한 조각 (인덱싱 범위 확장)
- `embed-content.mjs` 의 SOURCES 배열로 다중 소스 지원
- `docs/solutions/` 19 파일 + `docs/retros/` 10 파일 인덱싱 추가 (총 1141 청크, +218)
- 검증: "Mermaid 노드 라벨 따옴표 누락" 쿼리에서 솔루션 문서가 **Top-1·Top-3** 진입 (Phase 1에는 솔루션 0건)
- search 출력에 `[entry]` `[solution]` `[retro]` 소스 태그 추가

### Metrics
- 임베딩 인덱스: 923 → **1141 청크** (+218, +24%), 8.7MB → 10.5MB
- 인덱싱 소스: 1 → **3** (entry · solution · retro)
- 검색 응답: 1~3ms (brute force, 변화 없음)
- 엔트리: 106 → **107**
- 변경: 7 files, +1,506 / -3

---

## [2026-04-16] 세션 4 — Mermaid `<br/>` warning 시스템 + Journal 024 (solution → validator 승격)

### Added — 인프라 (validator 확장)
- **`scripts/lib/mermaid-fix.mjs`** — `detectUnquotedSpecialCharLabels()` 추가. `<br/>` · `→` 따옴표 누락 패턴 검출. warning-only 정책 (auto-fix 안 함, idempotency 위험 회피)
- **`scripts/validate-content.mjs`** — `fixAndValidateMermaid` 반환값의 `warnings` 받아 `console.warn`으로 출력. 빌드 실패 안 시킴
- **`scripts/__tests__/validate-content.test.mjs`** — 9 신규 케이스 (총 7→16). idempotency 별도 검증 케이스 포함

### Added — 신규 엔트리 1건
- **`harness-engineering/harness-journal-024-solution-to-validator-promotion.mdx`** — Solution N=3+ 누적 시 validator/훅 승격 패턴 박제. shape 다양성 + idempotency + memory rule 모두 통과 시 warning-only 채택

### Fixed — 즉시 발견된 잠재 함정 9건
- **`content/harness-engineering/five-levers-of-harness-engineering.mdx`** — 7건 (보고/잡고/되살리기 + CLAUDE.md 60줄 그래프 4건)
- **`content/rag/vector-search-basics.mdx`** — 1건 (ANN 인덱스 HNSW)

### Metrics
- 신규 vitest: 9 (총 16, 모두 통과)
- 즉시 발견된 잠재 부채: 9건 (모두 수정)
- 엔트리: 105 → **106**
- Warning 출력: 9건 → 0건 (수정 후)
- 변경: 6 files, +371 / -13

---

## [2026-04-16] 세션 3 — Flow Map 시리즈 완주(6/N) + Context Scaling 방향성 박제 + NEXT.md 87% 감축

### Added — 신규 엔트리 5건
- **`context-engineering/context-scaling-3-layer-architecture.mdx`** (650줄) — 방향성 제시 글. Prompt Caching · Pruning/Compression · JIT Retrieval 3-레이어로 "지식 = 토큰" 선형 트레이드오프 끊기. 4 조건 게이트 기반 도입 순서 + 4 프로덕트 매핑 + **핸드오프 문서 함정 특별 섹션** (ai-study NEXT.md 60KB 실제 사례)
- **`harness-engineering/architect-flow-map-via-aidy-architect.mdx`** (382줄) — Flow Map 4편. iOS 개발자 관점의 Architect-Worker 오케스트레이션
- **`context-engineering/api-contract-as-3-client-source-of-truth.mdx`** (393줄) — Flow Map 6편. 마크다운 한 장이 3-client source of truth
- **`evaluation/test-strategy-3-client-via-aidy.mdx`** (429줄) — Flow Map 7편. "컴파일 성공 ≠ 테스트 통과" 오신 끊기. iOS Session 4 사고 사례 포함
- **`infrastructure/aidy-3-client-deployment-design-roadmap.mdx`** — Part 5 대체 (설계 로드맵 장르). 실 배포 미구축 상태에서 Stage 0~8 도입 순서 + 선택 근거 박제

### Added — 신규 솔루션 1건
- **`docs/solutions/mdx/2026-04-16-mermaid-cylinder-nested-parens.md`** — Mermaid 4번째 재발 패턴. cylinder 노드 `[("...")]` + 내부 괄호 → validator 오탐 · 파서 모호

### Changed — 운영 규칙
- **NEXT.md 60KB → 7.6KB** (-87%, 1032줄 → 163줄). append-only 운영 규칙 폐기 → **세션 경계 교체** 로 전환. 핸드오프 함정 섹션에서 스스로 제안한 액션 동일 세션에서 실행 (dogfood)
- **`docs/series-flow-map-for-ios-devs.md`** — 상태 3/N → 6/N. 출간 완료 표에 4·6·7편 추가. Part 5 deferred 마킹

### Fixed — Dangling connections 4건
- **`evaluation/ai-output-5-layer-defense.mdx`** — `llm-as-judge-overview` → `llm-as-judge-pattern` (실제 파일명)
- **`tokenomics/prompt-caching-cost-reduction.mdx`** — `tokenomics-catalog` → `claude-code-token-levers-catalog`
- **`frontend-ai/react-compiler-starttransition.mdx`** — `nextjs-app-router-patterns` → `frontend-ai-patterns`
- **`infrastructure/content-pipeline-dag.mdx`** — `ci-cd-patterns` 연결 제거 (유사 엔트리 없음)

### Metrics
- 엔트리: 100 → **105** (+5)
- NEXT.md: 60KB → 7.6KB (-87%)
- 변경 라인: 약 +2400 / -1060
- 빌드: 105 static paths (dangling 경고 0건)
- 신규 솔루션: 1건 (Mermaid 4번째 재발 패턴)
- 신규 메모리: 2건 (dogfood 원칙 · mermaid fix 범위)
- Flow Map 시리즈 상태: 3/N → **6/N** (Part 5 deferred)

---

## [2026-04-16] 세션 2 — Flow Map 4편 + Mermaid 런타임 버그 + Search Index Lazy Fetch

### Added — Flow Map 시리즈 4편
- **`content/harness-engineering/architect-flow-map-via-aidy-architect.mdx`** — iOS 주력 개발자 관점의 Architect-Worker 패턴. "WO 한 건의 여정" Mermaid + iOS 매핑표 20개 + Week 1~5 로드맵 + 자주 막히는 지점 12건 (382줄)
- **`docs/series-flow-map-for-ios-devs.md`** — 출간 완료 표에 4편 추가, 상태 3/N → 4/N

### Added — 신규 솔루션 2건
- **`docs/solutions/mdx/2026-04-16-mermaid-br-in-unquoted-node-labels.md`** — Mermaid 3번째 재발 패턴. 노드 label의 `<br/>` + 특수문자 따옴표 누락. `validate-content.mjs` 가 못 잡는 런타임-only 함정
- **`docs/solutions/performance/2026-04-16-search-index-lazy-fetch.md`** — Next.js App Router에서 layout props로 배열 넘기는 안티패턴. `public/search-index.json` + idle prefetch 분리

### Changed — 성능 (RSC payload 대폭 감축)
- **`scripts/generate-content-manifest.mjs`** — `public/search-index.json` 추가 emit (SearchDialog lazy fetch용)
- **`src/app/layout.tsx`** — `searchEntries` SSR props 제거 (페이지당 ~30KB gzipped 오버헤드 제거)
- **`src/components/search-dialog.tsx`** — 모듈 스코프 캐시 + `requestIdleCallback` 프리페치 + open 시점 fallback fetch
- **`src/app/dashboard/page.tsx`** · **`timeline/page.tsx`** — 중복 `<SearchDialog>` + `<GraphSearchProvider>` mount 제거 (layout 글로벌만 유지)
- **`.gitignore`** — `public/search-index.json` 추가
- **`CLAUDE.md`** — Project Structure에 `public/search-index.json` 명시, SearchDialog 컴포넌트 설명에 lazy fetch 전략 추가

### Fixed — Mermaid 노드 label 27건 수정
- **`content/android-ai/android-flow-map-via-aidy-android.mdx`** — 8 노드 따옴표 처리
- **`content/ios-ai/ios-flow-map-via-aidy-ios.mdx`** — 8 노드 따옴표 처리
- **`content/backend-ai/backend-flow-map-via-aidy-server.mdx`** — 11 노드 따옴표 처리
- 원인: `<br/>` + `→`/`/`/`+` 특수문자가 대괄호(`[...]`) · 중괄호(`{...}`) 내 따옴표 없이 있어 Mermaid 파서 fail. 이전 fix `ed34d26` 이 놓친 패턴

### Metrics
- RSC payload 감축 (gzipped):
  - 홈: 56.8KB → 39.6KB (**-30%**)
  - 위키 리스트: 45.8KB → 29.8KB (**-35%**)
  - 타임라인: 53.1KB → 22.8KB (**-57%**)
  - 대시보드: 50KB → 15.0KB (**-70%**, 중복 mount 제거 효과)
- 추가 정적 에셋: `search-index.json` 18KB gzipped (세션당 1회 idle fetch + HTTP 캐시)
- 총 엔트리: 100 → **101**
- 커밋: 3건 (fix / perf / entry)
- 신규 솔루션: 2건 (mdx · performance)

---

## [2026-04-16] — 카테고리 신설 + Multi-Agent Orchestration Journal + 엔트리 6건

### Added — 인프라
- **카테고리 2개 신설**: `android-ai` (Android + AI), `backend-ai` (Backend + AI) — 응용 그룹 확장, 총 13 카테고리
- **Multi-Agent Orchestration Journal 시리즈**: `SERIES_LABELS`에 `aidy-journal` (🤖) 등록
- **Vibe Coding Aidy 프로젝트 탭**: projects-tabs.tsx + page.tsx에 4번째 프로젝트 추가

### Added — 신규 엔트리 7건
- **`harness-engineering/aidy-journal-000-architect-worker-baseline.mdx`** — Spec-Driven Multi-Agent Orchestration 베이스라인. 4레포 구조, Gate 1+2, WO 시스템, Compound Flywheel
- **`agents/multi-provider-circuit-breaker.mdx`** — Gemini/Claude/OpenAI 3사 Circuit Breaker 패턴 (moneyflow)
- **`agents/trading-agent-9phase-pipeline.mdx`** — 13 에이전트 적대적 토론 아키텍처 (moneyflow)
- **`evaluation/ai-output-5-layer-defense.mdx`** — Text Guard → Zod → Range → Cross-field → LLM-as-Judge 5단계 (tarosaju)
- **`tokenomics/prompt-caching-cost-reduction.mdx`** — cache_control ephemeral 90% 비용 절감 실전 (tarosaju/moneyflow)
- **`infrastructure/content-pipeline-dag.mdx`** — 멀티플랫폼 퍼블리싱 DAG 의존성 해소 (moneyflow)
- **`frontend-ai/react-compiler-starttransition.mdx`** — React Compiler useEffect setState 해결 (tarosaju)

### Changed
- **CLAUDE.md** — 카테고리 11→13, content 디렉토리 설명 업데이트
- **SPEC.md** — 카테고리 13개, 시리즈 3개로 업데이트, 현재 상태 갱신
- **NEXT.md** — 2026-04-16 갱신 로그 추가 (스냅샷 + 큐)

### Metrics
- 위키 총 엔트리: 83 → **90** (+7)
- 카테고리: 11 → **13** (+2)
- 시리즈: 2 → **3** (Multi-Agent Orchestration Journal 신설)
- 변경: 13 files, +1,587 / -11 lines

---

## [2026-04-15] — 보안 스프린트 + n8n 리서치 + Context Engineering 확장

### Added — 보안 강화 7건
- **`src/lib/rate-limit.ts`** — 로그인 Rate Limiting 신규 (IP 기반 15분/5회 슬라이딩 윈도우, 429 + Retry-After)
- **`next.config.ts`** — Security Headers 6종 (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- **`ci.yml`** — `npm audit --audit-level=high` CI 통합 (NEXT.md Gap #7 해소)

### Added — 신규 엔트리 + 문서
- **`content/harness-engineering/security-hardening-checklist.mdx`** — 보안 7개 패턴 Wiki 박제. Default Secret 제거, Timing-Safe 비교, CSP, Rate Limiting, Error 누출 차단, Body 제한, npm audit CI
- **`docs/n8n-adoption-research.md`** — n8n 도입 리서치. 7 워크플로 설계 + 대안 비교 + 4 Phase 로드맵

### Fixed — 보안 취약점
- **`src/lib/auth.ts`** — Default Secret `"dev-secret-change-me"` 제거 → `getEnv("ADMIN_SECRET", 16)` 런타임 검증. 빈 패스워드 `|| ""` 제거 → 최소 8자. `===` 비교 → Web Crypto HMAC 기반 constant-time (Edge Runtime 호환)
- **`src/lib/github.ts`** — GitHub API 에러 메시지 클라이언트 노출 차단 (3곳). 서버 `console.error` + generic 한글 메시지
- **`src/app/api/admin/entries/route.ts`** + **`[...slug]/route.ts`** — 에러 정보 누출 차단 (4곳) + MDX 100KB Body 크기 제한 (413)
- **`package.json`** — Next.js 16.2.2→16.2.3 (GHSA-q4gf-8mx6-v5v3 Server Components DoS, CVSS 7.5)

### Metrics
- npm audit: 1 high → **0 vulnerabilities**
- 위키 총 엔트리: 82 → **83**
- 보안 수정: 14 files, +720 / -78 lines

---

## [2026-04-15] — iOS Journal 007/008 교훈 반영 + Context Engineering 확장 + 히트맵 토글

### Added — 신규 엔트리 2
- **`context-engineering/claudeignore-context-hygiene.mdx`** — .claudeignore 실전 가이드. iOS/Web 플랫폼별 템플릿 + 3 프로젝트 실측 + permissions.deny 비교
- **`context-engineering/claude-md-design-patterns.mdx`** — CLAUDE.md 설계 패턴. 500줄 규칙 + 필수 6섹션 + progressive disclosure

### Changed
- **`ai-agent-start-here.mdx`** — iOS 5대 함정→6대 함정 (훅 4중 wiring 추가), Day 1 체크리스트 8단계 (훅 진단), 스냅샷 78→82 entries
- **`learning-heatmap.tsx`** — 12주/6개월/1년 3단계 토글. 셀 크기 반응형 (13px/10px/8px)
- **`dev-setup-tips-log.mdx`** — +3건 (React hydration, Zod transitive dep, 수익화 보안)

### Metrics
- 위키 총 엔트리: 82
- Context Engineering: 3→5 엔트리
- iOS Journal: 6→8 에피소드

## [2026-04-14] — LLM-First 위키 현행화 + AI 과외 파이프라인 slug 근본 수정 + STRATEGY.md

### Added
- **`STRATEGY.md`** — 포트폴리오 4대 무기(Harness/Tokenomics/온보딩/Compound) 정의 + Tier별 개발 우선순위 + 외부 소개 워딩 가이드. Gemini 외부 평가 기반
- **모바일 하단 탭에 저널 추가** — 홈/저널/Wiki/대시보드/Vibe 5탭 (`mobile-nav.tsx`)

### Changed — LLM-First 위키 엔트리 6개 현행화
- **`ai-agent-start-here.mdx`** — 스냅샷 전면 갱신 (36+→70 엔트리, 4→7 슬래시 커맨드, Journal 006→021) + 상황별 라우팅 3섹션 추가 (cross-session/curate-inbound/projects-sync)
- **`llm-first-wiki-principles.mdx`** — 엔트리 수 36→70
- **`compound-automation-slash-commands.mdx`** — 4→7 커맨드 전면 갱신 (mermaid, 세부 섹션, 이식 가이드, 중첩 표)
- **`skill-system-introduction.mdx`** — 슬래시 커맨드 2→7 갱신
- **`harness-journal-000-baseline.mdx`** — 4번째 갱신 로그 추가 (10 갭 중 7개 완료)
- **`compound-engineering-philosophy.mdx`** — 커맨드 4→7 반영

### Fixed — AI 과외 파이프라인 slug 근본 수정
- **`generate-lesson.mjs` generateCustom()** — 한글 질문 텍스트가 그대로 파일명(slug)으로 사용 → URL 인코딩 시 404 발생하는 근본 원인 수정
  - Gemini에게 TITLE→영문 slug 변환 위임 (max 60자, `generateSlugFromTitle()`)
  - TAGS 지시 추가 (영문 키워드 3~6개, 한글 단어 분할 태그 제거)
  - Fallback: 한글 제거 + 영문만 추출하는 `titleToSlugFallback()`
  - Slug 충돌 시 timestamp suffix 자동 추가
- **기존 문제 파일 rename** — `ios에서-ai가-작업한-코드를-...` (114자) → `ios-ai-code-quality-test-strategy.mdx` (37자)

### Fixed — Mermaid 다이어그램 렌더링 근본 수정 (4회 시도)
- **`src/lib/remark-mermaid.ts`** — rehypeMermaid 플러그인 신설. Shiki 전에 실행되어 mermaid 코드 블록을 `<div class="mermaid-block">` 으로 변환. Shiki가 mermaid를 건드리지 못하게 함
- **`src/components/mermaid-renderer.tsx`** — 독립 클라이언트 컴포넌트. 페이지 마운트 시 `.mermaid-block` div를 DOM에서 직접 스캔 → mermaid.render()로 SVG 변환
- **`src/components/mdx-components.tsx`** — MermaidDiagram dynamic import 및 div override 제거. CustomPre 단순화
- 시도 1(pre className 감지) → 시도 2(data-attr prop) → 시도 3(div component override) → 시도 4(DOM 직접 렌더) 최종 성공
- 영향 범위: 18개 파일의 22개 mermaid 블록 전부 정상 렌더링

### Added — 신규 엔트리
- **`frontend-ai/mdx-mermaid-shiki-coexistence.mdx`** (265줄) — Mermaid + Shiki 공존 패턴. 4번의 삽질 과정과 각 실패 이유 + 최종 해법 구조 박제. quiz 3문항

### Fixed — iOS Journal 익명화
- **Journal 004** — `NotificationRouter`→`AlertRouter`, `HomeViewController`→`MainViewController`
- **Journal 006** — `Oneway*`→`ServiceA*`, `AZoneHistoryEntity`→`AHistoryEntity`, `TransportApproachType`→`ServiceApproachType`, `AddressSearch`→`CSearch`, `SharedStateManager`→`AppStateManager` 등 12개 도메인 특정 네이밍 제거

### Metrics
- 커밋: 12 (이 세션 전체)
- 파일 변경: 12+ (6 현행화 + 2 익명화 + 1 파이프라인 fix + 1 rename + 1 UI + 1 전략)
- 재발 방지: AI 과외 파이프라인 slug 생성 구조 근본 변경
- Mermaid 수정 시도: 4회 (최종 v4 성공)
- 영향 받은 mermaid 블록: 18파일 22블록
- 신규 엔트리: 1 (frontend-ai/mdx-mermaid-shiki-coexistence)

### Added — validate-content JSX 사전 탐지 + Gemini 가드 (밤 세션 후반)
- **`scripts/validate-content.mjs`** — `detectJsxTraps()` 함수 추가. 3패턴 사전 경고: `{중괄호}` JSX 파싱, `<숫자` JSX 태그 파싱, HTML void 태그 self-closing 누락. 컴파일 전에 경고하여 에러 원인 즉시 파악
- **`scripts/generate-lesson.mjs`** — Gemini 프롬프트에 MDX 문법 제약 4항목 추가 (void 태그, 중괄호, 꺾쇠 숫자, mermaid subgraph). AI 생성 시점에 빌드 에러 사전 방지

### Changed — Tokenomics 실측 갱신
- **`tokenomics/claude-code-token-levers-applied-log.mdx`** — ccusage 30일 베이스라인 2차: $4,316 / 7.33B tokens / cache read 98.6%. 이전 베이스라인 대비 일평균 $211→$180 (15% 감소)

### Metrics (최종)
- 이 세션 전체 커밋: 15+
- Mermaid 수정 시도: 4회 (v1~v4)
- JSX 함정 탐지 패턴: 3개 추가
- ccusage 30일 총비용: $4,316
- 신규 엔트리: 1 (frontend-ai/mdx-mermaid-shiki-coexistence)
- 신규 인프라: 3 (rehypeMermaid + MermaidRenderer + detectJsxTraps)

### Added — 신규 엔트리 3 + iOS 고급 (심야~새벽 세션)
- **`ios-ai/ios-legacy-to-ai-ready.mdx`** (449줄) — 레거시 iOS→AI-Ready 4단계 스펙트럼 + Day1~Week4 로드맵 + Tuist/SPM 전략 + 토큰 절감 실측
- **`harness-engineering/shell-pipe-exit-code-trap.mdx`** — Shell pipe `$?` 함정. QA gate가 빌드 실패를 통과시킨 실전 사고 + 수정 3패턴
- **`infrastructure/cron-execution-tracking-pattern.mdx`** — withCronTracking 래퍼. 11 cron route 인증+이력+에러 DB 자동 추적
- **`ai-agent-start-here.mdx` iOS 고급 섹션** — 딥리서치 8가지: pbxproj 금지, XcodeBuildMCP 59+ 도구, CLAUDE.md 500줄, permissions.deny, PostToolUse 자동 린트, SwiftUI 궁합, Swift 버전 명시, SPM show-dependencies

### Fixed — AI 과외 파이프라인 3건
- **Gemini 2.5 Pro 503 폴백** — Pro 불가 시 Flash 자동 전환
- **PR 생성 백틱 shell injection** — Gemini 제목에 백틱 포함 시 command substitution 실행 → env 주입 + tr 치환
- **Squash merge Vercel 배포 갭** — GITHUB_TOKEN merge가 Vercel webhook 미발동 → Deploy Hook 트리거 스텝 추가

### Changed
- **Gemini 모델 업그레이드** — 2.5 Flash → 2.5 Pro (Pro 우선, Flash 폴백)
- **iOS 코드 테스트 전략 전면 재작성** — 580줄 Gemini 튜토리얼 → 404줄 에이전트 실행 가이드
- **dev-setup-tips-log +3건** — Zod datetime 함정, select 필드 누락, withCronTracking

### Metrics (이 세션 전체 — 2026-04-14~15 심야)
- 커밋: 25+
- 신규 엔트리: 5 (mermaid-shiki, shell-pipe, cron-tracking, ios-legacy, ios-test-strategy 재작성)
- 위키 총 엔트리: 76
- 파이프라인 버그 수정: 3 (503 폴백, 백틱 injection, 배포 갭)
- 딥리서치 외부 소스: 8+ (XcodeBuildMCP, Tuist, Claude Lab, etc.)

## [2026-04-13] — terminal 복귀 세션: 8 push 사이클 + 4 신규 콘텐츠 + 5 인프라 + 2 자가손상 버그 fix

사용자가 맥앱 Claude 세션 결과물에 불만 표명 → 터미널로 복귀 → 3 프로젝트(`ai-study` + `mino-moneyflow` + `mino-tarosaju`) 동시 발생 부산물을 전수 검증 + 정리. 7회 에이전트 병렬(2 사이클: 4 + 3) 활용.

### Added — 신규 콘텐츠 4
- **`harness-engineering/harness-journal-019-mcapp-cross-session-cleanup.mdx`** — 맥앱 Claude 세션 부산물 6 함정 + 5단 크로스 세션 리뷰 프로토콜 박제
- **`harness-engineering/compound-engineering-philosophy.mdx`** (275줄) — 12 referencing entries에서 추출한 12 원칙 + 4단계 루프(Plan→Work→Review→Compound) + 5단계 ladder + 12 엔트리 × 원칙 매핑 테이블 + 자가 점검 체크리스트 12문항. dangling connection 12건 해소
- **`tokenomics/claude-code-token-levers-applied-log.mdx`** — 카탈로그에서 메타 분리. 4 조건 / 적용 로그 5건 / 실측 결과 표 / append-only live document
- **`rag/vector-search-basics.mdx`** (120줄) — 임베딩 / 코사인 / k-NN / ANN(HNSW/IVF/LSH) / 모델 선택 / Recall@k / 벡터 DB 7 개념. dangling connection 1건 해소

### Added — 신규 인프라 5
- **`.claude/hooks/no-company-names.sh`** — Edit/Write 직전 `gma-ios|GreenCar|LOTTIMS` grep → 발견 시 차단. settings.json `Edit|Write` matcher로 등록. 메모리 의존을 못 믿겠어서 행동 레벨로
- **`.claude/commands/cross-session-review.md`** — Journal 019의 5단 프로토콜 자동화 슬래시 커맨드. CLAUDE.md skill routing 등록
- **`scripts/lib/mermaid-fix.mjs`** — `validate-content.mjs`에서 `fixAndValidateMermaid` 함수 추출. 두 과거 버그(슬라이싱 / regex 누적) docstring 박제
- **`scripts/__tests__/validate-content.test.mjs`** — 6 회귀 테스트 (슬라이싱 idempotent / regex idempotent / 정상 라벨 / 다중 블록 / 5-quote 누적 잔재 / 추가 손상 방지). 13 passed (기존 7 + 신규 6)
- **vitest.config.ts** — `scripts/__tests__/**/*.test.mjs` include

### Changed — 사이드바 series-based 일반화 refactor
- **`src/lib/schema.ts`**: `SERIES_LABELS` 매핑 추가 — 시리즈 키 → label/icon. 새 시리즈 추가 시 한 줄로 자동 그룹화
- **`src/lib/content.ts`**: `SidebarEntry` / `SidebarCategory` 타입 export. `getSidebarData()`가 `entries + subGroups` 반환
- **`src/components/sidebar.tsx`**: 'harness-journal-' 슬러그 hardcoded → 제네릭 `SeriesSubGroup` 컴포넌트. CategoryBody가 entries + 모든 subGroups 렌더
- **17 frontmatter 추가**: `harness-journal-000~018` + `bootstrap-guide` 모두 `series: harness-journal` 추가
- 결과: 사이드바에서 `📓 Harness Journal (18)` + `📱 iOS Journal (6)` 모두 자동 sub-group 처리

### Changed — 콘텐츠 사실 정정 8
- **iOS Harness Journal 000~005 전면 재작성** (4 에이전트 병렬) — 이전 세션의 가짜 코드 / 잘못된 카운트 / 허구 스킬 전부 폐기:
  - Ep.000: "스킬 5종" → 7종 (compound + ios-arch + ios-bugfix + ios-investigate + ios-review + ios-ship + ios-triage). RIBs Swift 코드 80줄 삭제
  - Ep.001: 제목 "PreToolUse 훅" → "git pre-commit 훅으로 코드 규칙 차단". 가짜 `swift-pre-write.sh` 전면 삭제. 진짜는 `.githooks/` + `setup.sh`
  - Ep.002: "5종" → "7종 (병렬 Agent 패턴 포함)". 가짜 .md 통째 인용 삭제
  - Ep.003: 가상 .claudeignore → 실제 21줄 + `**/.build/` 글로브 패턴 필수성 강조
  - Ep.004: "가설 3개" → "5 Round 인터뷰 + 5 체크리스트" (실제 source 반영)
  - Ep.005: "/ios-compound" → "/compound" 정정. 카테고리 8개 정정 (`appstore` 삭제, `architecture` 추가)
- **tokenomics 카탈로그 재구조화** — 503 → 443줄. 적용 로그/메타 → applied-log entry로 분리. 본문 순서 정비
- **`apple-intelligence-api.mdx` §3 손상 복구** — mermaid 블록이 Swift 코드 블록 시작부에 잘못 끼어들어가 acorn 파서 에러

### Changed — 회사 프로젝트명 익명화 (메모리 룰 위반 정정)
- 4 에이전트가 iOS Journal 재작성 시 회사 프로젝트 식별자(`gma-ios` / `GreenCar.xcodeproj` / `LOTTIMS-SPM`)를 노출 — 본인 책임 (에이전트 prompt에 익명화 지시 누락)
- 9건 grep + 치환:
  - `gma-ios` → `moneyflow-ios` (5건)
  - `GreenCar` → `MoneyFlow` (1건)
  - `LOTTIMS-SPM/` → `external-spm/` (3건, 두 번째 발견)
  - 메모리 경로도 익명화
- 메모리 강화: 위반 사례 박제 + grep 가드 프로토콜 + 에이전트 위임 시 익명화 지시 룰 + PreToolUse 훅으로 행동 레벨 차단까지

### Fixed — `validate-content.mjs` 자가 손상 두 버그
- **버그 1 — 슬라이싱 오프셋**: mermaid 자동 수정 시 `content`(frontmatter 제거 후) 기준 검색 + `raw`(frontmatter 포함) 슬라이싱 → frontmatter 길이만큼 어긋나서 파일 다른 부분 손상. **apple-intelligence-api.mdx §3 손상의 진짜 원인**. fix: `raw.indexOf(...)`
- **버그 2 — 정규식 누적 매치**: regex가 이미 따옴표로 감싸진 라벨도 매치 → 매 실행마다 따옴표 1쌍씩 누적 (5-quote 발견 흔적). fix: negative lookahead `(?!")` + 라벨 내부 `"` 제외 (`[^\[\]"]*`)

### Fixed — 학습 히트맵
- **요일 정렬 X 였던 sequential 7-day 블록** → GitHub 스타일 일/월/.../토 행 기반 그리드. 미래 셀 투명. 월/수/금 라벨
- **iOS Journal 000~005 가짜 화요일 backdate** — 이전 세션이 1/20부터 매주 화요일에 분산 → 실제 작성일 2026-04-13으로 정정. 결과: 5개 화요일 사라지고 월(오늘) 8 entries

### Fixed — 기타
- `/harness-journal` 탭 라벨: `🌐 Web` → `🌐 Web + Backend`, `📱 iOS Harness Journal` → `📱 iOS` (Stats 섹션 동기화)

### Removed
- **`.claude/worktrees/sweet-napier`** — sidebar refactor가 fresh로 같은 작업 재현 → 정리. branch `claude/sweet-napier`는 보존 (필요 시 복구 가능)

### Metrics
- **8 push 사이클** (1차 → 8차)
- **에이전트 병렬 7회** (2 사이클: 4 + 3, 외부 fetch 0)
- **dangling connections**: 13 → 0
- **테스트**: 13 passed (기존 7 + 신규 6 mermaid-fix)
- **빌드**: 84 static pages
- **MDX 파일**: 63 → 66 (+3 신규 콘텐츠)
- **사고 재발률**: 1건 (회사명 노출, 즉시 발견 + 행동 레벨 차단까지 도달)

---

## [2026-04-12 wave 5] — LLM-as-a-Judge 3 프로젝트 + Tokenomics 실측

### Added
- **LLM-as-a-Judge 패턴 엔트리** — `evaluation/llm-as-judge-pattern.mdx`. evaluation 카테고리 첫 실전 엔트리. 도메인별 평가 차원 설계 + fire-and-forget 패턴
- **moneyflow QualityScore validator** — `validateQualityScore` 추가 + parseJSON Layer 2 연결 (PR #111). `quality_score`를 portfolio insights select에 추가 (PR #112)
- **tarosaju quality-judge 신설** — `quality-judge.ts` 생성 + fortune/tarot-chat 라우트 fire-and-forget 연결 (PR #16). 4차원: domain_accuracy, empathy, specificity, safety
- **Tokenomics 실측** — `.claudeignore` 효과: ~194K tokens 배제 (~50% context 축소). ccusage 베이스라인: 일평균 ~360M tokens/$211, cache read 98%+

### Fixed
- `inapp-browser-white-screen-defense.mdx` confidence 9→5 (범위 1-5 초과)

### Metrics
- moneyflow PR: #111 + #112 자동 머지
- tarosaju PR: #16 자동 머지
- 3 프로젝트 모두 LLM-as-a-Judge 적용 (moneyflow 기존 + validator 보강, tarosaju 신설, ai-study 패턴 박제)

---

## [2026-04-12 wave 4] — Journal 018 + Layer 1-4 실용적 완성

### Added
- **Journal 018** — Layer 3-4 retry + instruction augmentation. `retryWithValidation` 순수 함수 + `callAIAndValidate` 래퍼. validator 실패 시 issues를 prompt에 추가해서 LLM 재요청. market_analyst 첫 적용 후 나머지 9 에이전트 일괄 전환
- **5 Layer 중 Layer 1-4 실용적 완성** — JSON 파싱 / runtime validation / retry / instruction augmentation. Layer 5(schema evolution)는 구조 변경 시 필요

### Metrics
- moneyflow PR: #109 (인프라 + market_analyst), #110 (9 에이전트 전환) 자동 머지
- vitest: +8 (retryWithValidation), 기존 1096 전체 통과
- 에이전트: 10/10 Layer 3-4 적용 (custom_prompt 제외)

---

## [2026-04-12 wave 3] — Journal 017 + 사이드바 서브그룹 + 10/10 에이전트 완료

### Added
- **Journal 017** — 10/10 에이전트 런타임 검증 완료. devils_advocate(raw output 패턴) + research-debate + risk-debate + portfolio-manager. Zod 3차 재평가 → type guard 최종 확정 (#f568be7)
- **사이드바 Harness Journal 서브그룹** — harness-engineering 카테고리 내 Journal 17개를 접이식 서브그룹으로 분리. 일반 글 14개가 먼저 보이도록. Journal 페이지에서 자동 펼침 (#52e051f)

### Changed
- **Journal 트리거 문구 정리** — J012, J015, J017에서 "쭉쭉 진행해줘" 같은 범용 진행 지시 제거. 구체적 요청만 인용하는 기준 확립
- **NEXT.md 큐 재정렬** — 큐 1~3번(Vercel Pro + J016 + J017) 모두 완료 표시. 다음 최우선: Layer 3-4 retry

### Metrics
- moneyflow PR: #107 자동 머지 (devils_advocate), #108 자동 머지 (remaining 3 validators)
- vitest 신규: 40 케이스 (15 + 25), 시리즈 누적 92
- 에이전트 validator: 5/10 → **10/10** (custom_prompt 제외)
- 메모리 신규: `feedback_journal_trigger.md`
- 사이드바 rebase 충돌 1회 해결 (devils_advocate PR → remaining PR 순서 충돌)

---

## [2026-04-12 wave 2] — UI 개선 + Tokenomics 신설 + Node 24 + Journal 015 + 세션 마무리

### Added
- **네비게이션 중앙 검색** — Header에 SearchTrigger 배치, SearchDialog를 root layout으로 글로벌화. 모든 페이지에서 Cmd+K 또는 클릭으로 검색 가능 (#22)
- **사이드바 4 그룹 아코디언** — `CATEGORY_GROUPS`(AI 엔지니어링 방법론 / 시스템 설계 / 평가&인프라 / 응용) 기반 2층 접이식. 엔트리 수가 늘어나면서 필요해진 시각적 구조화 (#22)
- **Tokenomics 카테고리 (11번째)** — 토큰 절감/경제학을 harness-engineering에서 독립 승격. 지속 연구/디벨롭 영역. "프로덕트 적용 기준 4 조건" 섹션 포함 (안정적 + 확실한 효과만 즉시 적용) (#23)
- **`.claudeignore` 신설** (Tokenomics 첫 적용) — `src/generated/`, `package-lock.json`, `.next/`, `docs/retros/`, `docs/solutions/` 등 불필요 context 배제. 4 조건 만족.
- **Node 24 opt-in** (3 프로젝트) — `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` env 한 줄. Tokenomics 4 조건 첫 실제 적용 사례. annotation이 "forced to run on Node.js 24"로 전환 확인 (#24, moneyflow #103, tarosaju #11)
- **체크아웃 함정 tips** — `dev-setup-tips-log.mdx`에 `git pull --ff-only`가 feature 브랜치에서 실패하는 패턴 append. 2회 재발 기록 (#25)
- **Journal 015** — Trader 런타임 검증 (debate 9 에이전트 중 첫 1개). Zod 재평가 2차 → type guard 유지. 13 에이전트 Layer 1+2 진행 5/13 = 38% (#27, moneyflow #104)
- **MDX JSX 파싱 함정 2개 발견** — (a) 인라인 code의 `{}` → JSX expression 파싱, (b) `<숫자` → JSX 태그 시작. 메모리 `project_ai_generated_mdx_guards.md`에 패턴 3+4 박제

### Fixed
- **Journal 015 MDX 컴파일 에러** — `<3으로`가 JSX 태그 시작으로 파싱. `` `< 3` `` 공백 추가로 해결. 2차 push에서 통과.

### Metrics
- 이번 wave: ai-study PR 6개 (자동 5 + 1실패→재시도), moneyflow 2개 (자동), tarosaju 1개 (자동)
- Tokenomics 적용 2건 (Node 24 opt-in + `.claudeignore`)
- 누적 13 에이전트 validator 진행: 5/13 = 38%
- MDX 컴파일 에러 패턴 2개 신규 박제

---

## [2026-04-12] — 허브-워커 양방향 모델 + 허브 자동 머지 + validator Layer 1+2 (4/13)

### Added

- **`/projects-sync` 슬래시 커맨드** (`.claude/commands/projects-sync.md`) — 허브 세션이 moneyflow/tarosaju 워커 프로젝트의 git/PR/worktree 상태를 read-only로 한 번에 진단. fetch + status -sb + ahead/behind + worktree 잔여물 + 최근 PR + 다른 세션 작업 흔적 감지. Journal 012에서 **실시간 제약 기반 의사결정의 입력**으로 첫 실전 사용 (zod dep 추가 대신 type guard 결정).
- **ai-study 허브에 `ai-review.yml` 이식** (`.github/workflows/ai-review.yml`) — moneyflow에서 1:1 복제, Test Gate만 `npm test` + `npm run build`로 조정 (prebuild가 frontmatter zod + content manifest 검증 자동 포함). Journal 014에서 **첫 시도에 chicken-and-egg 건너뜀** — 권한이 미리 설정돼 있어 PR #18 자기 자신 1m6s 자동 머지. 박제 전이성 5회째 (moneyflow → ai-study, 허브 첫 수용자).
- **Vercel Analytics 연동** — `@vercel/analytics` ^2.0.1 + `src/app/layout.tsx`에 `<Analytics />`. PR #19는 **ai-study 첫 완전 자동 PR** (ai-review.yml 이후 첫 push 이벤트 → 1m5s 자동 머지).
- **4 analyst 런타임 shape validator** (`src/lib/trading/schemas/analyst-schemas.ts`, moneyflow) — `validateMarketAnalystReport`, `validateNewsAnalystReport`, `validateSentimentAnalystReport`, `validateFundamentalsAnalystReport`. `checkAgentReportBase` 함수로 base 필드(signal/confidence/key_points/reasoning) 검증 공유. AI 출력 Zod 검증 5 Layer의 Layer 1+2 구현 (Layer 3-4 retry/instruction augmentation은 Journal 016+ 큐).
- **`parseJSON` optional validator 매개변수** (moneyflow `ai-client.ts`) — backward compat. 기존 12개 호출 사이트 영향 없음, 4 analyst만 validator 사용.
- **vitest 38 테스트 추가** (moneyflow) — market-analyst-schema 14 + analyst-validators 24 (news 6 + sentiment 6 + fundamentals 6 + 공통 base 6).
- **5 신규 엔트리** (ai-study content):
  - `harness-journal-011-concurrent-session-safety.mdx` (허브-워커 안전 셋업, 4 규칙)
  - `harness-journal-012-market-analyst-runtime-validation.mdx` (Layer 1+2 첫 에이전트)
  - `harness-journal-013-three-analysts-runtime-validation.mdx` (패턴 1:1 복제, 4/13 진행)
  - `harness-journal-014-hub-auto-merge-inbound-tips.mdx` (허브 이식 + 양방향 기여)
  - `dev-setup-tips-log.mdx` (사용자 PR #15로 생성, For AI Agents 섹션 Journal 014에서 보강)
- **`dev-setup-tips-log.mdx`의 For AI Agents 섹션 — 워커 → 허브 tips PR 흐름 5단계** — worktree 분기, append, commit(`tips:` prefix), push, worktree 정리. 허브의 ai-review.yml이 자동으로 PR 생성 + Test Gate + Squash Merge 일괄 처리.
- **3 프로젝트 CLAUDE.md 섹션**:
  - moneyflow + tarosaju: "동시 세션 안전 규칙" (Journal 011 4 규칙) + "환경 팁은 허브로 쏜다" (Journal 014 tips/ PR 패턴)
  - moneyflow + tarosaju: `.gitignore`에 `.claude/worktrees/` + `.claude/projects/` 추가

### Changed

- **moneyflow CLAUDE.md `## CI/CD` 섹션 재작성** — 옛 규칙 *"PR 날리지 말고 메인에 직접 머지"*가 `ai-review.yml` 도입 이후 사문화됨을 확인 (PR #91~#95가 전부 봇 PR로 머지된 증거). 새 규칙: 자동 PR + inline Test Gate + Squash Merge + feature 브랜치 reset + 새 작업은 `/wt-branch`로 시작.
- **NEXT.md 갱신 로그 4회 append** — Journal 011, 012, 013, 014 각 사이클마다 스냅샷 + 다음 큐 재정렬 + 사고 재발률 업데이트. 원본 섹션은 보존.
- **ai-study CLAUDE.md skill routing 추가** — `워커 프로젝트(moneyflow/tarosaju) 상태 확인, 다른 세션 작업 흔적 감지, 충돌 사전 탐지 → invoke projects-sync` 한 줄.

### Fixed

- **moneyflow stale rule** — CLAUDE.md의 "PR 날리지 말고" 규칙이 *실제 행동*(PR #91~#95 봇 PR 머지)과 모순 상태로 유지되고 있었음. Journal 011 PR #96에서 정리.
- **ai-study checkout 상태 복구** — Journal 012 작업 중 local이 `docs/dev-setup-tips-log` 브랜치에 걸려 있어 `git pull --ff-only origin main` 실패. `checkout main` 후 fast-forward 성공.

### Compound Assets

- `content/harness-engineering/harness-journal-011-concurrent-session-safety.mdx`
- `content/harness-engineering/harness-journal-012-market-analyst-runtime-validation.mdx`
- `content/harness-engineering/harness-journal-013-three-analysts-runtime-validation.mdx`
- `content/harness-engineering/harness-journal-014-hub-auto-merge-inbound-tips.mdx`
- `content/harness-engineering/dev-setup-tips-log.mdx` + For AI Agents 섹션
- `.claude/commands/projects-sync.md` (신규 슬래시 커맨드)
- `.github/workflows/ai-review.yml` (허브 이식)
- `docs/solutions/workflow/2026-04-12-hub-worker-concurrent-session-safety.md` (3층 방어 체크리스트)
- `docs/solutions/github-actions/2026-04-12-ai-review-yml-hub-port.md` (이식 사이클 규칙)
- `docs/solutions/ai-pipeline/2026-04-12-runtime-shape-validation-type-guard-vs-zod.md` (실시간 제약 기반 의사결정)
- `docs/retros/2026-04-12.md` (이 사이클 회고)

### Metrics

- **Journal 박제**: 4개 (011, 012, 013, 014)
- **머지된 PR**: 13개 (ai-study 6 + moneyflow 4 + tarosaju 3)
- **자동 머지**: 10개 / 수동 머지: 3개 (ai-study PR #14, #16, #17만, 나머지 자동)
- **평균 자동 머지 시간**: ~1m20s
- **신규 테스트**: 38 (vitest, moneyflow)
- **Runtime validator 적용**: 4 / 13 에이전트 (31%)
- **박제 전이성 사이클**: 5회째 달성 (moneyflow → ai-study, 허브 첫 수용자)
- **자기 검증 구조**: 5회째 달성 (허브-워커 모델 반대 방향 사용)
- **사고 재발률**: **0 / 13 사이클** 누적 (wt-branch 도입 이후 연속 유지)

---

## [2026-04-11 wave 2] — 인용구 사고 → /ingest 게이트 → 첫 dogfooding

### Added
- **`/ingest` 슬래시 커맨드** (`.claude/commands/ingest.md`) — 외부 URL을 7단계 게이트(사전점검 / 메타데이터 2회 교차 / 본문 2개 독립 소스 / 카테고리 매핑 + 의미 모순 체크 / 초안 / 빌드 검증 / 커밋 + 보고)를 거쳐 검증된 학습 엔트리로 가공. `feedback_external_source_verification.md` 메모리의 5단계 절차를 *프로젝트 파일* 에 박아 사람의 기억력 의존을 제거.
- **하네스 엔지니어링 5가지 레버 엔트리** — 외부 영상을 계기로 한 한국어 정리 자료들 교차 확인. 본문 상단에 "정보 출처 고지" 박스 포함.
- **Compound Engineering 엔트리** — `/ingest` 첫 dogfooding. every.to 원본 + GeekNews 한국어 정리 + Every 추가 글 교차 검증. 4단계 루프(Plan/Work/Review/Compound) + 5단계 ladder 정리 + 이미 실천 중인 `/compound` 워크플로의 원본 정의서. 같은 종류 사고 0건.

### Fixed
- **하네스 5레버 — 메타데이터 오기재** (`0221d4b`) — oembed 단일 소스만 믿어 영상 제목·채널명을 잘못 적음. 1글자 차이("실밸"↔"실버")가 가장 위험. → 2회 교차 검증 절차로 시스템화.
- **하네스 5레버 — 가짜 인용구 6개** (`d1255d5`) — 영상 미시청 상태에서 `"..."` 직접 인용 6개를 본문에 박음. 실제 출처는 2차 정리글의 paraphrase 또는 작성자 자체 paraphrase. **단순 오기가 아닌 fabrication**. → 인용구 6개 전부 제거 + 본문 상단 "정보 출처 고지" 박스 + 메모리 박제 + `/ingest` 금지 사항에 하드코딩.

### Compound assets
- `feedback_external_source_verification.md` (Claude 메모리) — 5단계 검증 절차 텍스트 원본
- `.claude/commands/ingest.md` — 같은 절차의 게이트 구현
- `docs/solutions/workflow/2026-04-11-ingest-command-design.md` — 설계 의도와 첫 dogfooding 결과
- `docs/solutions/ai-pipeline/2026-04-11-fake-quotes-from-ai-summary.md` — 가짜 인용구 사고의 5가지 발생 조건과 3계층 방어

### Metrics
- 커밋: 5 (학습 1 + 메타데이터 hotfix 1 + 인용구 hotfix 1 + 기능 1 + 학습 1)
- 사고 → 시스템화 → dogfooding 사이클 1회 (당일 클로즈)
- `/ingest` 첫 적용 시 hotfix 0건 (직전 사고 대비 -2)
- 새 엔트리: 2 (five-levers, compound-engineering-philosophy)

---

## [2026-04-11] — 인터랙티브 퀴즈 + Spaced Repetition

### Added
- **인터랙티브 자가 점검 퀴즈** — `frontmatterSchema`에 `quiz` 배열 필드 추가. 위키 엔트리 본문 하단에 Quiz 컴포넌트가 자동 렌더링되어 즉시 채점·해설·재시도 지원. 결과는 localStorage에 저장되어 재방문 시 유지.
- **대시보드 퀴즈 위젯** — 정답률, 약한 카테고리 Top 3, 최근 응시 5개, 아직 안 푼 퀴즈 추천을 한 화면에 표시. 모든 집계가 클라이언트 localStorage 기반.
- **Spaced Repetition (SM-2 단순화)** — 정답률 ≥80%면 다음 복습 주기 1→3→7→14→30→60일 순 증가, 50% 미만이면 1일로 리셋. 대시보드 "오늘 복습할 엔트리" 패널에 만기 항목 자동 노출.
- **AI 과외 선생님 quiz 자동 생성** — Gemini가 새 엔트리 생성 시 본문과 별도로 객관식 3문항을 함께 만들어 `js-yaml`로 frontmatter에 안전 직렬화. 생성 실패 시에도 본문은 정상 진행 (graceful degradation).
- 샘플 엔트리 2건에 quiz 3문항씩 추가 (`chain-of-thought`, `harness-engineering-overview`).

### Fixed
- **context-compression.mdx** — Mermaid subgraph 이름에 공백이 있어 빌드 실패. `subgraph id ["Label"]` 형식으로 수정. (push 직전 rebuild에서 포착)
- **agent-architectures.mdx** — 표 안 `<br>` 태그가 MDX 컴파일 실패를 유발하여 Vercel 배포 차단. `<br />` self-closing으로 교체. (2026-04-09 `br-tag-compile-error` 솔루션과 동일 패턴 재발)

### Metrics
- 파일 변경: 14
- 코드 +/−: +1,221 / −5
- 새 컴포넌트: 2 (Quiz, QuizWidget)
- 새 lib: 1 (quiz-storage.ts — attempts log + SRS schedule)
- P2 백로그 완료: 2건 (인터랙티브 퀴즈, Spaced repetition)

---

## [2026-04-09 autoceo-2 R2] — 양방향 연결된 개념

### Changed
- 위키 엔트리의 "연결된 개념" 섹션이 양방향으로 동작
  - outgoing: 이 글이 참조하는 엔트리 (→)
  - incoming: 이 글을 참조하는 다른 엔트리 (←)
  - mutual: 양쪽 모두 참조 (↔)
- 정렬: 같은 카테고리 우선 → 양방향 mutual 우선
- 각 연결 카드에 방향 아이콘 + 호버 툴팁

### 효과
- 연결성이 실제 그래프에 더 가깝게 표시됨
- 단방향 connection만으로도 역방향에서 발견 가능
- 학습 경로 탐색 개선

---

## [2026-04-09 autoceo-2 R1] — 학습 타임라인 + MDX 솔루션 문서

### Added
- `/timeline` 페이지 — 날짜별 학습 기록 시간순 뷰 (월별 그룹, 요일 표시)
- 헤더 네비에 Timeline 탭 추가
- docs/solutions/mdx/2026-04-09-br-tag-compile-error.md — MDX br 태그 컴파일 에러 솔루션 문서

---

## [2026-04-09 R2] — autoceo Round 2

### Added
- 스크롤 프로그레스 바 (위키 엔트리 읽기 진행률, accent 색상)

### Fixed
- tests/manifest.test.ts 타입 에러 수정 (Object.values 타입 단언)
- TODOS.md Light mode 항목 완료 처리

### Metrics
- tsc --noEmit: 0 에러 달성

---

## [2026-04-09 R1] — autoceo Round 1

### Added
- Fine-tuning 기초 엔트리 — LoRA, QLoRA, SFT 핵심 개념
- Frontend + AI 패턴 엔트리 — 스트리밍 UI, 에러 핸들링, 비용 관리

### Changed
- 빈 카테고리 0개 달성 (10/10 카테고리 커버)
- wiki 목록 ALL_CATEGORIES 하드코딩 → schema.ts CATEGORIES로 통일
- Light mode에 accent/semantic 색상 추가

이 프로젝트는 [Keep a Changelog](https://keepachangelog.com/) 형식을 따르고,
[Semantic Versioning](https://semver.org/)을 준수합니다.

## [Unreleased]

## [0.1.0] - 2026-04-09

### Added

- **스프린트 데이 콘텐츠 확장**
  - context-engineering 엔트리 추가
  - harness-engineering 엔트리 추가
  - evaluation 엔트리 추가

- **Coming Soon 플레이스홀더**
  - 미작성 엔트리를 Coming Soon 상태로 표시
  - 그래프 내 빈 카테고리를 회색 노드로 시각화

- **Admin 에디터**
  - 웹 인터페이스에서 위키 엔트리 추가/수정/삭제 기능
  - 프론트엔드에서 직접 콘텐츠 관리 가능

- **/compound 스킬 + Compound Engineering 워크플로우**
  - Compound Engineering 방법론 기반 자동화 스킬
  - 코드 생성 및 검증 파이프라인

### Changed

- **Vibe Coding 회고 강화**
  - Compound Engineering 관점 반영
  - 회고 프레임워크 재정비

- **관련 엔트리 카드 UI 업그레이드**
  - 향상된 카드 디자인 및 상호작용성
  - 더 명확한 엔트리 네비게이션

- **훅 타이밍 최적화**
  - 커밋 전: QA 게이트 추가
  - push 후: Compound Engineering 프로세스 실행
  - 개발 → 검증 → 배포 파이프라인 강화

- **Compound Engineering 가이드 기준으로 재정비**
  - 프로젝트 구조 정렬
  - 코드 표준 일관성 강화

- **SEO, 접근성, DRY 원칙 개선**
  - SEO 메타데이터 최적화
  - WCAG 접근성 표준 준수
  - 중복 코드 리팩토링

### Fixed

- **에러 바운더리 강화**
  - 컴포넌트 레벨 에러 처리
  - 사용자 경험 개선

---

## 지표

**2026-04-09 스프린트**

- 파일 변경: 42개
- 새 파일: ~25개
- 코드 추가/삭제: +2,812 / -183
