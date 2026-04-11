# Changelog

모든 주목할 만한 변경사항을 이 파일에 기록합니다.

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
