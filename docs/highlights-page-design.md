# Highlights 페이지 설계안

> **상태**: 설계 초안 (deferred). 여유 생길 때 착수.
> **작성일**: 2026-04-17 (Session 5)
> **작성 주체**: Claude + 사용자 대화

---

## 목적

117개 엔트리 중 "진짜 임팩트 대박" 수준의 엔트리만 엄선해서 한 곳에서 볼 수 있는 영역. 베스트/인기글/Hall of Fame 느낌. 외부인이 이 페이지 하나만 봐도 "와 이 위키 진짜다" 소리 나오게.

---

## 개념

- 새 페이지 **`/highlights`** — 엄선 5~8개 엔트리만 노출
- 일반 `/wiki` 목록과 시각적으로 **차별화된 큰 카드** (작은 그리드 X)
- 헤더 네비에 🔥 **Highlights** 추가 (Wiki / Dashboard / Projects 옆)

---

## 선정 기준

### 정량 (자동 필터 후보)
- Cross-reference ≥ 3 (다른 엔트리가 이걸 prerequisite/source로 링크)
- `confidence: 4` 이상
- **AI Agent Directive 완비** (Trigger / Steps / Anti-patterns 3 섹션 모두)

### 정성 (수동 큐레이션)
- 실측 데이터 / 구체적 수치 보유 (단순 이론 X)
- 재사용/이식 가능한 **보편 원칙** (회사/프로젝트 고유 문맥 아님)
- 외부인이 봐도 "와" 소리 나올 수준 — 단순 해결책이나 회고는 Highlights 아님
- **재사용 증거** — 다른 Journal/엔트리에서 실제 참조된 흔적

---

## 구현 방식

### 2안 비교

| 방식 | 장점 | 단점 |
|------|------|------|
| **A. Frontmatter `tier: flagship`** | 개별 마킹 간단, 엔트리 자체가 권위 소스, 순회 파싱 쉬움 | 117개 중 선정 + 주기적 재심사 필요 |
| **B. `content/highlights.json` 큐레이션 파일** | 순위 + 추천 이유 + 변경 쉬움 | 엔트리와 별도 동기화 필요 |

### 추천: **A + `flagship_reason` 필드**

```yaml
---
title: "..."
tier: flagship
flagship_reason: "Multi-Agent Orchestration 시작점. 4 레포 Spec-Driven 모델의 계약·Gate·WO·Flywheel 4 축을 한 엔트리에 압축."
---
```

이점:
- 엔트리가 자급자족 (별도 동기화 파일 없음)
- 추천 이유 1줄이 엔트리에 박혀있어 Highlights 카드에 바로 표시
- Highlights 페이지는 전 엔트리 스캔 후 `tier === 'flagship'` 필터만

---

## 현재 시점 Flagship 후보 (초안)

> 기준: cross-reference 풍부 + 실측/원칙 강도 + 외부 이식성

| # | 엔트리 | 카테고리 | 추천 이유 |
|---|--------|---------|-----------|
| 1 | **[compound-engineering-philosophy](content/harness-engineering/compound-engineering-philosophy.mdx)** | harness-engineering | 전체 저장소의 철학 — 복리형 지식 축적 사이클 |
| 2 | **[five-levers-of-harness-engineering](content/harness-engineering/five-levers-of-harness-engineering.mdx)** | harness-engineering | Harness 5대 레버 프레임워크 — 다른 엔트리들의 공통 지표 |
| 3 | **[context-scaling-3-layer-architecture](content/context-engineering/context-scaling-3-layer-architecture.mdx)** | context-engineering | 3-Layer Context 아키텍처 설계 + 안티패턴 박제 |
| 4 | **[api-contract-as-3-client-source-of-truth](content/context-engineering/api-contract-as-3-client-source-of-truth.mdx)** | context-engineering | Multi-client 계약 원칙 — 3-플랫폼 동기 구현의 축 |
| 5 | **[ai-output-5-layer-defense](content/evaluation/ai-output-5-layer-defense.mdx)** | evaluation | AI 검증 5단 레이어 — 모든 AI 앱의 방어 표준 |
| 6 | **[claude-code-token-levers-catalog](content/tokenomics/claude-code-token-levers-catalog.mdx)** | tokenomics | 토큰 레버 실측 카탈로그 + 적용 4 조건 |
| 7 | **[aidy-journal-000-architect-worker-baseline](content/harness-engineering/aidy-journal-000-architect-worker-baseline.mdx)** | harness-engineering | Multi-Agent Orchestration 시작점 — 4 축 압축 |
| 8 | **[numeric-execution-evidence](content/evaluation/numeric-execution-evidence.mdx)** | evaluation | "테스트 통과" 주장의 검증 원칙 — Gate 설계의 기반 |

### 제외 (재평가 필요)
- Journal 003/004/005 — 이번 세션 박제. 실전 재사용 증거 2~3 세션 누적 후 재평가.
- Harness Journal 시리즈 대부분 — 특정 상황 솔루션, 보편 원칙까진 아님.
- iOS Journal 시리즈 — 플랫폼 한정 맥락이 많음.
- Flow Map 시리즈 — 학습 가이드 성격, Highlights보다 `/wiki` 적합.

---

## 구현 체크리스트

### 1단계 — 스키마 + 마킹
- [ ] `src/lib/schema.ts` — frontmatter schema에 `tier: z.enum(['flagship']).optional()` + `flagship_reason: z.string().max(200).optional()` 추가
- [ ] 선정된 8개 엔트리 frontmatter에 `tier: flagship` + `flagship_reason` 삽입
- [ ] Manifest generator (`scripts/generate-content-manifest.mjs`) 가 tier 정보 포함하도록 수정
- [ ] 빌드 통과 확인

### 2단계 — 페이지 + 네비
- [ ] `src/app/highlights/page.tsx` 생성 — flagship 필터 + 큰 카드 그리드
- [ ] `src/components/highlight-card.tsx` 신규 — 일반 카드 대비 크기 2배 + flagship_reason 강조 + 카테고리 배지
- [ ] `src/components/header.tsx` 에 `/highlights` 링크 추가 (🔥 아이콘 또는 별 표시)
- [ ] OG 이미지 페이지 버전 추가 (`/api/og?type=highlights`)

### 3단계 — 디자인 디테일
- [ ] `DESIGN.md` 에 Highlights 전용 색상/타이포 규칙 추가
- [ ] Light mode + Dark mode 대응
- [ ] 모바일 스택 레이아웃 (데스크톱 2열 grid → 모바일 1열)
- [ ] 사용자 요청대로 "와 소리 나오는" 시각적 임팩트 — 배경 그라디언트 + 큰 타이포 고려

### 4단계 — 유지보수 규약
- [ ] `CLAUDE.md` 에 "Flagship 선정 기준 + 재심사 주기(세션 5회마다)" 명시
- [ ] Flagship 후보 제안/제외는 별도 파일(예: `docs/highlights-curation.md`)에 변경 로그
- [ ] 신규 엔트리 작성 시 frontmatter에 `tier` 미지정이 기본 (일반 엔트리)

---

## 유지보수 원칙

- **정체 경계**: Flagship 8개 내외 유지. 10개 넘어가면 "특별"이 희석됨.
- **재심사 주기**: 세션 5회 또는 엔트리 +20개 시점마다 재평가.
- **승격/강등 로그**: `docs/highlights-curation.md` 에 날짜 + 사유 기록.
- **정량 필터 실패**: cross-ref 3건 미만 또는 confidence 3 이하로 떨어지면 강등 후보.

---

## 왜 지금 미루나

- 이번 세션(Session 5) 이미 엔트리 10 박제 + 11 파일 연결 보강 + 중복 압축까지 큰 사이클.
- 메모리 룰 `feedback_session_length.md` — "한 세션 2-3 Journal 단위로 끊기" 에 이미 도달.
- Highlights 는 schema 변경 + 새 페이지 + 디자인 시스템 정합까지 포함 → 독립 세션이 안전.
- 세션 분리 시 UX/디자인 더 빡세게 챙길 수 있음 (사용자가 원한 "와 임팩트 대박" 수준).

---

## 착수 트리거

다음 중 하나 발생 시:
- 사용자가 명시적으로 "Highlights 페이지 구축" 요청
- 엔트리 수 120 돌파 → 탐색성 저하 신호
- 외부 공유(포트폴리오/블로그) 니즈 발생 — 한 페이지 요약 필요
- /wiki 목록이 과밀 인상 되면 시작

---

## 참고
- 이번 세션(2026-04-17) 제안/승인 대화 맥락
- TODOS.md P3 백로그 항목으로 연결
