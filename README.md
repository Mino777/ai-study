# AI Study Wiki

> AI가 매일 학습 콘텐츠를 생성하고, 내가 읽고 수정하면서 배우는 인터랙티브 학습 위키.

**라이브 사이트:** [ai-study-wheat.vercel.app](https://ai-study-wheat.vercel.app)

## 컨셉

기술 블로그의 가장 큰 적은 "귀찮아서 안 적는 것"입니다.

AI Study Wiki는 이 문제를 뒤집습니다. **AI가 매일 학습 콘텐츠를 생성하고, 나는 읽고 수정하는 것만으로 학습과 기록이 동시에 이루어집니다.** 수정한 부분이 곧 학습 증거(git diff)가 되고, 머지하면 위키에 자동 반영됩니다.

```
AI가 초안을 쓴다 → 내가 읽고 배운다 → 틀린 부분을 고친다 → 고친 이력이 학습 기록이 된다
```

## AI 과외 선생님 파이프라인

매일 아침 AI가 과외 선생님처럼 오늘의 학습 주제를 추천하고, 내가 고르면 기술 블로그급 콘텐츠를 자동 생성합니다.

```
┌─────────────────────────────────────────────────────────────┐
│  1단계: 매일 09:00 KST (GitHub Actions cron)                │
│                                                              │
│  content-manifest.json 분석                                  │
│  → 지식 그래프의 빈 곳 / 약한 곳 파악                        │
│  → 카테고리 우선순위 적용                                    │
│  → 상위 3개 주제 추천                                        │
│  → GitHub Issue 자동 생성                                    │
│                                                              │
│  "오늘의 학습 주제를 골라주세요"                              │
│   1️⃣ [Prompt Engineering] System Prompting                   │
│   2️⃣ [iOS + AI] Core ML Introduction                        │
│   3️⃣ [RAG] Reranking                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                   사용자가 댓글로 "2" 입력
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2단계: 콘텐츠 생성 (Gemini 2.5 Flash)                      │
│                                                              │
│  선택된 주제로 기술 블로그급 MDX 자동 생성:                   │
│  - 핵심 개념 설명 (왜 중요한지부터)                          │
│  - 실제 동작하는 코드 예제 (Swift / TypeScript / Python)     │
│  - Mermaid 아키텍처 다이어그램                               │
│  - 자기 점검 퀴즈 + 실습 과제                                │
│                                                              │
│  → 자동 PR 생성 → Issue 닫힘                                │
└─────────────────────────────────────────────────────────────┘
                          │
                   사용자가 PR을 읽고 수정
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3단계: 학습 완료                                            │
│                                                              │
│  PR 머지 → Vercel 자동 배포                                  │
│  → 위키에 새 엔트리 반영                                     │
│  → 지식 그래프에 새 노드 등장                                │
│  → 대시보드 진도 업데이트                                    │
│                                                              │
│  수정한 git diff = 나의 학습 기록                            │
└─────────────────────────────────────────────────────────────┘
```

### 주제 추천 알고리즘

단순 랜덤이 아닙니다. 지식 그래프를 분석해서 최적의 학습 순서를 결정합니다:

- **빈 카테고리 우선** (+3점) — 아직 하나도 없는 영역부터
- **Dangling connections** (+2점) — 다른 엔트리에서 참조하지만 아직 없는 주제
- **낮은 confidence** (+1.5점) — 이해도가 낮은 카테고리
- **카테고리 우선순위** — AI 방법론(2.0x) > iOS/Frontend AI(1.5x) > Infrastructure(0.7x)

## 학습 카테고리

| 카테고리 | 설명 | 우선순위 |
|---------|------|---------|
| Prompt Engineering | 프롬프트 설계. 체이닝, 구조화된 출력, 품질 가드 | 최상 |
| Context Engineering | 컨텍스트 윈도우 최적화. 토큰 관리, 압축, 동적 주입 | 최상 |
| Harness Engineering | AI 활용 방법론. 워크플로우 설계, AI 페어 프로그래밍, 자동화 | 최상 |
| Agents | AI 에이전트 아키텍처, Tool Use, MCP, 멀티 에이전트 | 높음 |
| RAG | 검색 증강 생성. 임베딩, 벡터 DB, 청킹, 리랭킹 | 높음 |
| iOS + AI | Core ML, Apple Intelligence, 온디바이스 LLM, Swift AI 앱 | 높음 |
| Frontend + AI | AI SDK, 스트리밍 UI, React Native AI, 웹 LLM | 높음 |
| Evaluation | LLM 평가. LLM-as-Judge, RAGAS, 환각 탐지 | 보통 |
| Fine-tuning | LoRA, QLoRA, 데이터셋 준비, RLHF, DPO | 보통 |
| Infrastructure | 모델 서빙, 프롬프트 캐싱, 비용 최적화, 게이트웨이 | 낮음 |

**총 96개 주제 풀** (10 카테고리) — 소진되면 AI가 새 주제를 제안합니다. Issue 댓글에 자유 텍스트를 입력하면 커스텀 주제로도 생성 가능.

## 주요 기능

### 인터랙티브 지식 그래프
홈페이지 전체를 채우는 force-directed 그래프. 위키 엔트리가 노드, connections가 엣지. 카테고리별 색상으로 구분. 노드를 클릭하면 해당 엔트리로 이동. 엔트리가 추가될수록 그래프가 유기적으로 성장.

### 그래프-검색 양방향 연동
Cmd+K 검색 다이얼로그에 키워드를 입력하면 그래프에서 매칭되는 노드가 하이라이트되고, 나머지는 디밍. 검색과 시각적 탐색이 연동.

### 학습 대시보드
카테고리별 진도 바, 평균 confidence, "다음에 공부하면 좋을 것" 추천. GitHub contribution 그래프 스타일의 학습 히트맵.

### Mermaid 다이어그램
MDX 내 `mermaid` 코드 블록을 자동으로 다이어그램으로 렌더링. 다크 테마 적용. 아키텍처 플로우를 시각적으로 표현.

### 자기 점검 퀴즈
AI가 생성하는 모든 콘텐츠에 "자기 점검" 섹션 포함. 이해도 확인 질문 + 실습 과제. 읽기만 하면 confidence 1-2, 퀴즈와 과제를 하면 3-4로 올릴 수 있는 구조.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Content | MDX (next-mdx-remote/rsc) + gray-matter + zod |
| Graph | react-force-graph-2d (Canvas, Client Component) |
| Code | shiki (@shikijs/rehype, github-dark-default) |
| Diagrams | Mermaid (dynamic import, client-side) |
| Theme | next-themes (dark default) |
| AI | Gemini 2.5 Flash (Google AI Studio) |
| CI/CD | GitHub Actions (daily cron + issue comment trigger) |
| Deploy | Vercel (GitHub auto-deploy) |
| Fonts | Satoshi (display) + Pretendard (body) + JetBrains Mono (code) |

## 디자인 시스템

다크 배경(`#0a0a0f`) 위에 카테고리별 네온 컬러가 빛나는 Industrial/Editorial 하이브리드 미학. 지식 그래프의 노드 색상이 사이트 전체의 카테고리 색상 시스템을 정의합니다. 자세한 내용은 [DESIGN.md](./DESIGN.md)를 참조하세요.

## 프로젝트 구조

```
ai-study/
├── content/                   # MDX 위키 엔트리 (카테고리별 디렉토리)
│   ├── prompt-engineering/
│   ├── rag/
│   ├── agents/
│   ├── fine-tuning/
│   ├── evaluation/
│   ├── infrastructure/
│   ├── ios-ai/
│   └── frontend-ai/
├── scripts/
│   ├── generate-lesson.mjs    # AI 과외 선생님 (suggest / generate)
│   ├── generate-content-manifest.mjs  # prebuild: MDX → manifest
│   ├── watch-content.mjs      # dev: content/ 변경 감지 → manifest 재생성
│   ├── new-entry.mjs          # CLI: 새 엔트리 템플릿 생성
│   └── topic-pool.json        # 80개 학습 주제 풀
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 홈 (지식 그래프 히어로)
│   │   ├── wiki/              # 위키 (목록 + 엔트리)
│   │   ├── dashboard/         # 학습 대시보드
│   │   └── about/             # 포트폴리오
│   ├── components/            # React 컴포넌트
│   ├── contexts/              # GraphSearchContext
│   ├── lib/                   # schema, content loader
│   └── generated/             # content-manifest.json (gitignored)
├── .github/workflows/
│   ├── daily-lesson.yml       # 매일 09:00 주제 추천 Issue
│   └── generate-on-pick.yml   # 댓글 선택 → MDX 생성 → PR
├── CLAUDE.md                  # 프로젝트 규칙
└── DESIGN.md                  # 디자인 시스템
```

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 (content/ 변경 감지 포함)
npm run dev

# 새 위키 엔트리 생성
npm run new-entry

# AI 과외 선생님: 주제 3개 추천
GEMINI_API_KEY=xxx npm run generate-lesson

# AI 과외 선생님: 특정 주제로 콘텐츠 생성
GEMINI_API_KEY=xxx npm run generate-lesson generate rag/reranking

# 프로덕션 빌드
npm run build
```

## Frontmatter 스키마

모든 위키 엔트리는 아래 frontmatter를 가집니다:

```yaml
---
title: "RAG Architecture Overview"
category: rag                    # 8개 카테고리 중 하나
date: "2026-04-08"
tags: [rag, retrieval, embedding]
confidence: 2                    # 1-5 (들어봤다 → 가르칠 수 있다)
connections: [rag/vector-databases]  # 관련 엔트리 slug
status: draft                    # draft | in-progress | complete
description: "검색 증강 생성의 핵심 아키텍처"
type: entry                      # entry | til
---
```

## GitHub Actions 설정

레포 Secrets에 `GEMINI_API_KEY`를 추가하세요 ([Google AI Studio](https://aistudio.google.com/apikey)에서 발급).

Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" 체크.

## 라이선스

MIT
