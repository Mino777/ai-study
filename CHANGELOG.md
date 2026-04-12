# Changelog

모든 주목할 만한 변경사항을 이 파일에 기록합니다.

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
