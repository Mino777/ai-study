# SPEC — Mino's AI Study Wiki (LLM-First Knowledge Base)

> 이 저장소는 *사람*과 *AI 에이전트*가 함께 읽는 지식 저장소다.
> AI 에이전트가 *읽고 실행할 수 있는* 형태로 AI 엔지니어링 방법론을 박제한다.

---

## Purpose

Jominho가 자기 두 프로젝트(`mino-moneyflow`, `mino-tarosaju`)에서 실제로 운영한 AI 엔지니어링 방법론을 **다음 프로젝트의 AI 에이전트가 즉시 실행할 수 있는 형태**로 박제한다.

**핵심 명제**: 사람의 기억력에 의존하는 지식은 반드시 실패한다. 지식을 AI 에이전트가 읽고 *자동으로 적용*할 수 있는 형태로 만들어야 다음 작업이 더 쉬워진다. (Compound Engineering)

이 위키는 *일반 기술 블로그*와 본질적으로 다르다:

| 차원 | 일반 블로그 | LLM-First Wiki |
|---|---|---|
| 독자 | 사람 | 사람 + **AI 에이전트** |
| 목적 | 소통/설명 | 실행 가능한 지식 |
| 구조 | 자유 | 표준 섹션 (`AI Agent Directive`) |
| 갱신 | 필요 시 | 살아있는 문서 (append-only 갱신 로그) |
| 연결 | 카테고리 | Zettelkasten (atomicity + deep linking) |
| 검증 | 없음 | 빌드 시 dangling connection 감지 |

---

## Primary Users

우선순위 순:

1. **AI 에이전트** (Claude Code, 기타 LLM) — 위키를 *컨텍스트 소스*로 읽고 패턴을 자기 작업에 적용. *위키의 1차 소비자*.
2. **Jominho** (사람) — 작성 + 유지 + 재방문 학습. *위키의 운영자*.
3. **다른 개발자** — 메타 방법론을 자기 환경으로 이식. *위키의 2차 수혜자*.

우선순위 1이 2보다 높은 이유: 사람 작업의 비중이 이미 거의 0에 수렴. 대부분의 실행을 AI 에이전트가 수행. 따라서 AI 에이전트가 *잘 읽을 수 있는 구조*가 가장 임팩트 큼.

---

## Core Entities

### 1. Wiki Entry — `content/<category>/<slug>.mdx`

13 카테고리:
- `prompt-engineering`, `context-engineering`, **`harness-engineering`** ← 가장 활발
- `rag`, `agents`, `fine-tuning`, `evaluation`
- `infrastructure`, `ios-ai`, `frontend-ai`, **`android-ai`**, **`backend-ai`**

Frontmatter (zod 검증, `src/lib/schema.ts`):

```yaml
---
title: "엔트리 제목"
category: harness-engineering
date: "2026-04-12"
tags: [...]
confidence: 1-5
connections: [...slugs]
status: draft | complete
description: "한 줄 요약"
type: entry
quiz: [...]  # 선택 — 자가 점검 3문항
---
```

### 2. Series — 태그 + slug prefix로 묶이는 연속 엔트리

현재 시리즈: **Harness Journal**, **iOS Journal**, **Aidy Journal**
- Slug prefix: `harness-journal-NNN-...`
- Tag: `harness-journal`
- 내용: Jominho의 두 프로젝트 AI 운영 환경 개선 사이클 박제 (006까지 누적)
- 인덱스: `/harness-journal` 페이지가 episode 번호 순으로 자동 노출

### 3. Slash Command — `.claude/commands/*.md`

AI 에이전트가 명시적으로 호출하는 워크플로:

| 커맨드 | 역할 |
|---|---|
| `/compound` | 회고 / 솔루션 / CHANGELOG 박제 + 메모리 동기화 |
| `/autoceo` | N라운드 자동 스프린트 루프 (CEO→Dev→QA→Compound) |
| `/wt-branch` | 새 작업을 worktree로 origin/main에서 안전하게 분기 |
| `/ingest` | 외부 URL을 교차 검증 거쳐 학습 엔트리로 가공 |

### 4. Manifest — `src/generated/content-manifest.json`

빌드 시 생성되는 위키 전체 인덱스:
- `entries` — 모든 MDX의 frontmatter + slug
- `graph` — nodes + edges (connections 기반)
- `streak` — 연속 학습일 계산
- `dailyEntries` — 날짜별 엔트리 수 맵 (히트맵용)
- `stats` — 카테고리 통계, 주간 통계, 최근 엔트리

생성: `scripts/generate-content-manifest.mjs` → Next.js build 전 실행

---

## Data Flow

### 빌드 파이프라인

```
content/**/*.mdx
  │
  ▼  scripts/generate-content-manifest.mjs
src/generated/content-manifest.json
  │
  ▼  src/lib/content.ts → getManifest()
Next.js 페이지:
  ├─ /              (홈 + 지식 그래프)
  ├─ /wiki          (카테고리별 엔트리 목록)
  ├─ /wiki/[...slug](개별 엔트리)
  ├─ /harness-journal (Harness Journal 시리즈 인덱스)
  ├─ /dashboard    (학습 대시보드 + 히트맵)
  ├─ /timeline     (날짜별 타임라인)
  └─ /projects     (Vibe Coding 쇼케이스)
```

### AI 에이전트 관점 데이터 흐름

```
AI Agent (Claude Code 등)
  │
  ▼ reads
CLAUDE.md  (프로젝트 규약)
SPEC.md    (이 파일)
  │
  ▼ navigates
content/harness-engineering/ai-agent-start-here.mdx
  │  (상황별 라우팅)
  ▼ selects
관련 엔트리 (예: ai-ops-environment-diagnosis-checklist.mdx)
  │  ("AI Agent Directive" 섹션의 Actionable Steps)
  ▼ executes
Jominho의 프로젝트 (또는 새 프로젝트)
  │
  ▼ writes back
새 Harness Journal 엔트리 (다음 AI 에이전트가 읽음)
```

이 순환 구조가 LLM-First Wiki의 본질이다.

---

## Entry Structure — LLM-First 표준

모든 엔트리는 다음 섹션을 *가능한 경우* 포함:

1. **갭 / 맥락** — 왜 이 주제가 있는가, 어떤 사고/마찰이 보였는가
2. **핵심 개념 / 패턴** — 무엇인가 (코드 포함)
3. **AI Agent Directive** (LLM-First의 핵심) ← 신규 표준
   - `Trigger`: 언제 이 엔트리를 참조하는가
   - `Prerequisites`: 먼저 읽어야 할 엔트리
   - `Actionable Steps`: 실행 가능한 체크리스트
   - `Anti-patterns`: 피해야 할 것
4. **운영 데이터 / 사례** — 실제 데이터 (있을 때만)
5. **자기 점검 (Quiz)** — 3문항 객관식 (이해도 측정)
6. **출처 / 검증 메모** — 추측 없이 직접 확인한 것만

섹션 3 (`AI Agent Directive`)가 *일반 블로그와 가장 다른 부분*. 에이전트가 엔트리 전체를 읽지 않아도 이 섹션만으로 *언제 어떻게 사용할지* 판단 가능.

---

## Series System — 살아있는 문서

**Harness Journal** 시리즈는 *한 사이클 = 한 에피소드* 원칙:

| 섹션 | 내용 |
|---|---|
| **Before** | 현재 갭, 어떤 사고/마찰이 보였는가 |
| **After** | 정확히 어떤 파일/훅/게이트를 추가했는가 (코드 인용 OK, 직접 만든 것만) |
| **운영 데이터** | 적용 후 지표 (데이터 없으면 *없다고* 명시) |
| **배운 것 / 다음 후보** | 다음 사이클로 이어지는 큐 |
| **자기 점검** | Quiz 3문항 |
| **출처 / 검증 메모** | 직접 확인한 것만 |

**베이스라인 (Journal 000)** 은 *살아있는 문서*. 원본 큐 정의는 보존하고, 갱신 로그 섹션에 append. 덮어쓰기 금지.

**규약**:
- Slug: `harness-journal-NNN-<short-name>.mdx` (3자리 zero-padded)
- Tag: `harness-journal` 필수
- Episode 번호는 `/harness-journal` 인덱스에서 자동 추출

---

## Cross-references — Zettelkasten 원칙

1. **Atomicity** — 하나의 개념 = 하나의 엔트리. 같은 주제가 여러 엔트리에 흩어지면 에이전트가 *어디를 읽어야 하는지* 모름.
2. **Deep linking** — 카테고리 페이지 거치지 말고 *엔트리 직접* 링크 (`/wiki/harness-engineering/...`)
3. **Bidirectional** — `connections` 필드로 양방향 그래프 형성 (edge는 directed지만 UI는 역방향 discovery도 지원)
4. **Dangling detection** — 빌드 시 존재하지 않는 connection은 경고 (회색 placeholder 노드로 표시)

---

## AI Agent Contract

AI 에이전트가 이 저장소에서 작업할 때 *지켜야 할 계약*:

### 세션 시작 시 로드 순서

```
1. CLAUDE.md        — 프로젝트 규약 + LLM-First 방향성
2. SPEC.md          — 이 파일 (엔티티 + 데이터 흐름 + 계약)
3. ai-agent-start-here.mdx — 상황별 라우팅
```

이 3개 파일을 읽지 않고 작업을 시작하면 *계약 위반*.

### 작업 중

- 의사결정이 필요한 순간, *관련 엔트리*를 찾아 읽어야 함
- 엔트리의 `AI Agent Directive` 섹션의 Actionable Steps를 체크리스트로 사용
- `Anti-patterns` 섹션을 반드시 읽고 피하기
- 결과를 *다음 엔트리*로 박제 (시리즈 또는 새 엔트리)

### 박제할 때

- `/ingest` (외부 URL 입력), `/compound` (내부 회고) 자동화 사용
- **추측 없이 직접 확인한 것만** 박제 (메모리 `feedback_external_source_verification` 원칙)
- 사고가 발생하면 *박제할 기회*로 받아들임 (숨기지 X)
- 새 엔트리는 `llm-first-wiki-principles.mdx`의 표준 따름

### 금지

- 같은 개념을 여러 엔트리에 흩뿌리기 (atomicity 위반)
- `AI Agent Directive` 섹션 생략
- 추측으로 본문 채우기
- 덮어쓰기 갱신 (append-only 원칙 위반)
- 직접 확인 못한 인용구를 `"..."` 로 박기 (날조)

---

## Growth Principles

1. **살아있는 문서** — 베이스라인 + 갱신 로그 누적, 덮어쓰기 X
2. **사이클당 한 메시지** — 한 엔트리 = 한 가지 명확한 주제
3. **추측 금지** — 직접 확인한 것만
4. **전이성** — 다른 프로젝트/사람에게 *변경 0*으로 이식 가능해야 진짜 자산
5. **자기 검증 구조** — 도구가 *자기 자신에 적용*될 수 있어야 검증됐다고 할 수 있음

---

## 현재 상태 (2026-04-12)

| 항목 | 값 |
|---|---|
| 총 엔트리 | 36+ |
| 시리즈 | 3개 (Harness Journal 000~023, iOS Journal, Aidy Journal 000~) |
| 슬래시 커맨드 | 4개 (`/compound`, `/autoceo`, `/wt-branch`, `/ingest`) |
| 활성 카테고리 | 13 중 ~9개 (일부 Coming Soon) |
| LLM-First 표준 적용 | 진행 중 — 신규 엔트리부터 표준, 기존 엔트리 점진적 |
| 사람 직접 작업 비중 | 거의 0 (대부분 AI 에이전트 박제) |

이 Spec은 *살아있는 문서*. 위키가 성장하면 이 파일도 갱신된다. 갱신은 *append-only* (원본 섹션 보존, 새 섹션 추가).
