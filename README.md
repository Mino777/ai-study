# AI Study Wiki

> AI가 매일 학습 콘텐츠를 생성하고, 내가 읽고 수정하면서 배우는 인터랙티브 학습 위키.

**라이브 사이트:** [ai-study-wheat.vercel.app](https://ai-study-wheat.vercel.app)

## 컨셉

기술 블로그의 가장 큰 적은 "귀찮아서 안 적는 것"입니다.

AI Study Wiki는 이 문제를 뒤집습니다. **AI가 매일 학습 콘텐츠를 생성하고, 나는 읽고 수정하는 것만으로 학습과 기록이 동시에 이루어집니다.** 수정한 부분이 곧 학습 증거(git diff)가 되고, 머지하면 위키에 자동 반영됩니다.

```
AI가 초안을 쓴다 → 내가 읽고 배운다 → 틀린 부분을 고친다 → 고친 이력이 학습 기록이 된다
```

**Compound Engineering** 방식으로 운영합니다. 코드가 아니라 "코드를 만드는 시스템"을 쌓습니다. 매 작업 사이클마다 Plan → Work → Review → Compound. CHANGELOG, 스프린트 회고, 문제 해결 문서가 자동으로 축적되어 다음 작업이 더 빨라집니다.

## AI 과외 선생님 파이프라인

매일 아침 AI가 과외 선생님처럼 오늘의 학습 주제를 추천하고, 내가 고르면 기술 블로그급 콘텐츠를 자동 생성합니다.

```
┌─────────────────────────────────────────────────────────────┐
│  1단계: 매일 09:05 KST (GitHub Actions cron)                │
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
              번호(1/2/3) 또는 자유 텍스트 댓글
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2단계: 콘텐츠 생성 (Gemini 2.5 Flash)                      │
│                                                              │
│  선택된 주제로 기술 블로그급 MDX 자동 생성:                   │
│  - 커스텀 텍스트 입력 시 Gemini가 제목/설명 자동 정제        │
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

| 카테고리 | 설명 | 엔트리 수 |
|---------|------|----------|
| Prompt Engineering | 프롬프트 설계. 체이닝, 구조화된 출력, 품질 가드 | 4 |
| Context Engineering | 컨텍스트 윈도우 최적화. 토큰 관리, 압축, 동적 주입 | 1 |
| Harness Engineering | AI 활용 방법론. 워크플로우 설계, 오케스트레이션 | 1 |
| Agents | AI 에이전트 아키텍처, Tool Use, 멀티 에이전트 | 2 |
| RAG | 검색 증강 생성. 벡터 DB, 아키텍처 개요 | 2 |
| iOS + AI | Apple Intelligence API, 온디바이스 LLM | 1 |
| Frontend + AI | 스트리밍 UI, 에러 핸들링, AI UX 패턴 | 1 |
| Evaluation | LLM 평가. LLM-as-Judge, 자동/인간 평가 | 1 |
| Fine-tuning | LoRA, QLoRA, SFT, 데이터셋 준비 | 1 |
| Infrastructure | 멀티 프로바이더, 스트리밍 아키텍처, 비용 최적화 | 2 |

**10/10 카테고리 커버 완료.** 총 96개 주제 풀에서 AI가 매일 추천.

## 주요 기능

### 인터랙티브 지식 그래프
홈페이지 전체를 채우는 force-directed 그래프. 위키 엔트리가 노드, connections가 엣지. 카테고리별 색상. 빈 카테고리도 회색 노드로 표시하여 전체 로드맵 시각화. 노드 클릭 시 해당 엔트리로 이동.

### 그래프-검색 양방향 연동
Cmd+K 검색 다이얼로그에 키워드를 입력하면 그래프에서 매칭되는 노드가 하이라이트.

### 학습 대시보드 + 스트릭 + 히트맵
카테고리별 진도 바, 평균 confidence, 추천. 연속 학습 스트릭 표시 (7일/14일/30일 배지). GitHub 스타일 학습 히트맵으로 12주간 학습 기록 시각화.

### 인터랙티브 자가 점검 퀴즈
각 위키 엔트리 frontmatter에 `quiz` 배열을 정의하면 본문 하단에 객관식 퀴즈가 자동 렌더링됩니다. 즉시 채점, 정답·오답 색상 표시, 해설 토글 지원. 결과는 localStorage에 저장되어 다음 방문 시에도 유지됩니다. AI 과외 선생님 파이프라인이 새 엔트리를 만들 때 quiz 3문항을 자동 생성합니다.

### Spaced Repetition (간격 반복 복습)
SM-2를 단순화한 알고리즘 — 정답률 ≥80%면 다음 복습 주기를 1→3→7→14→30→60일 순으로 늘리고, 50% 미만이면 1일로 리셋합니다. 대시보드에 "오늘 복습할 엔트리" 위젯이 표시되어 장기 기억으로 정착시킵니다.

### 퀴즈 대시보드 위젯
전체 정답률, 약한 카테고리 Top 3, 최근 응시 5개, 아직 안 푼 퀴즈 추천을 한눈에. 모든 데이터는 클라이언트 localStorage에서 집계되어 서버 부담이 없습니다.

### Admin 에디터
웹 브라우저에서 위키 엔트리를 직접 추가/수정/삭제. MDX 에디터(실시간 프리뷰) + 프론트매터 폼. 각 필드에 도움말 툴팁. 에디터 높이 드래그 리사이즈. GitHub API로 커밋 후 Vercel 자동 재배포.

### OG 이미지 자동 생성
각 위키 엔트리의 카테고리 색상 + 제목으로 OG 이미지를 Edge Runtime에서 자동 생성. 소셜 미디어 공유 시 전문적인 카드 표시.

### Compound Engineering 워크플로우
`/compound` 커맨드로 CHANGELOG + 스프린트 회고 + 문제 해결 문서를 자동 생성. `/autoceo`로 분석-개발-QA-문서화를 N라운드 자동 반복. git commit 전 빌드 체크 게이트, push 후 compound 리마인더 훅.

### Vibe Coding 쇼케이스
AI와 함께 바이브코딩으로 만든 프로젝트들의 작업 내용, Context/Harness Engineering 패턴, 배운 점, 회고를 기록. Compound Engineering 관점의 복리 효과 문서화.

### 스크롤 프로그레스 바
위키 엔트리 읽을 때 상단에 accent 색상 프로그레스 바로 읽기 진행률 표시.

### 관련 엔트리 카드
위키 엔트리 하단에 connections 기반 관련 글을 카테고리 배지 + confidence + 설명 카드로 표시.

### Coming Soon 플레이스홀더
위키 목록에서 빈 카테고리를 예정 주제와 함께 표시. 전체 학습 로드맵 시각화.

### 코드 복사 버튼
코드 블록에 마우스를 올리면 "복사" 버튼이 나타남. 클릭 시 클립보드에 복사 + 피드백.

### 이전/다음 엔트리 네비게이션
위키 엔트리 하단에 같은 카테고리 내 이전글/다음글 링크.

### Mermaid 다이어그램
MDX 내 `mermaid` 코드 블록을 자동으로 다이어그램으로 렌더링. 다크 테마 적용.

### TOC 스크롤 스파이
위키 엔트리에서 h2/h3 헤딩을 자동 추출하여 우측에 고정 목차 표시. 스크롤에 따라 현재 위치 하이라이트.

### RSS 피드
`/feed.xml`로 최근 20개 엔트리를 RSS 구독 가능.

### SEO + 접근성
JSON-LD 구조화 데이터 (Article schema), canonical URL, 전 페이지 OG 메타태그. ARIA 라벨 전체 적용 (네비게이션, 그래프, TOC, 모바일 탭).

### 에러 바운더리
글로벌 에러 페이지 + 커스텀 404 페이지.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Content | MDX (next-mdx-remote/rsc) + gray-matter + zod |
| Graph | react-force-graph-2d (linkDistance 180, charge -500) |
| Editor | @uiw/react-md-editor (Admin 에디터) |
| Code | shiki (@shikijs/rehype, github-dark-default) |
| Diagrams | Mermaid (dynamic import, client-side) |
| Theme | next-themes (dark default, light mode 지원) |
| AI | Gemini 2.5 Flash (Google AI Studio) |
| Auth | HMAC-SHA256 쿠키 인증 (Admin) |
| GitHub API | Contents API (Admin 에디터 CRUD) |
| OG Image | next/og ImageResponse (Edge Runtime) |
| Test | Vitest (manifest 단위 테스트) |
| CI/CD | GitHub Actions (CI + daily lesson) |
| Deploy | Vercel (GitHub auto-deploy) |
| Fonts | Satoshi (display) + Pretendard (body) + JetBrains Mono (code) |

## Compound Engineering 체계

```
코드 작업 → git commit → 자동 빌드 체크 (실패시 차단)
                              ↓ 통과
                         git push → /compound 리마인더
                                         ↓
                              CHANGELOG + 회고 + 솔루션 자동 생성
                                         ↓
                              다음 세션에서 자동 참조 → 복리 효과
```

| 저장소 | 용도 |
|--------|------|
| `docs/solutions/` | 구체적 문제 해결 기록 (카테고리별) |
| `docs/retros/` | 스프린트 회고 (날짜별) |
| `CHANGELOG.md` | 변경 이력 (Keep a Changelog) |

## 프로젝트 구조

```
ai-study/
├── content/                   # MDX 위키 엔트리 (10 카테고리)
├── docs/
│   ├── retros/                # 스프린트 회고
│   └── solutions/             # 문제 해결 문서 (카테고리별)
├── scripts/
│   ├── generate-lesson.mjs    # AI 과외 선생님 (suggest / generate / generate-custom)
│   ├── generate-content-manifest.mjs  # prebuild: MDX → manifest + streak + dailyEntries
│   ├── watch-content.mjs      # dev: content/ 변경 감지 → manifest 재생성
│   ├── new-entry.mjs          # CLI: 새 엔트리 템플릿 생성
│   └── topic-pool.json        # 96개 학습 주제 풀
├── src/
│   ├── app/
│   │   ├── page.tsx           # 홈 (지식 그래프 히어로)
│   │   ├── wiki/              # 위키 (목록 + 엔트리 + Coming Soon)
│   │   ├── dashboard/         # 학습 대시보드 + 스트릭 + 히트맵
│   │   ├── projects/          # Vibe Coding 쇼케이스
│   │   ├── admin/             # Admin 에디터 (로그인 + CRUD)
│   │   ├── api/og/            # OG 이미지 생성 (Edge)
│   │   ├── api/auth/          # 인증 API
│   │   └── api/admin/         # Admin CRUD API
│   ├── components/
│   │   ├── admin/             # 에디터 컴포넌트 (entry-editor)
│   │   ├── knowledge-graph    # force-directed 그래프
│   │   ├── learning-heatmap   # GitHub 스타일 히트맵
│   │   ├── scroll-progress    # 스크롤 프로그레스 바
│   │   └── ...                # header, sidebar, search, TOC, etc.
│   ├── lib/
│   │   ├── schema.ts          # zod 스키마 + 카테고리 상수
│   │   ├── content.ts         # manifest/entry 로더
│   │   ├── auth.ts            # HMAC-SHA256 인증
│   │   └── github.ts          # GitHub Contents API
│   └── middleware.ts          # Admin 인증 미들웨어
├── .claude/
│   ├── commands/compound.md   # /compound 커맨드
│   ├── commands/autoceo.md    # /autoceo 커맨드
│   └── settings.json          # 빌드 게이트 + compound 훅
├── .github/workflows/
│   ├── daily-lesson.yml       # 매일 09:05 주제 추천 Issue
│   └── generate-on-pick.yml   # 댓글 선택 → MDX 생성 → PR
├── CHANGELOG.md               # 변경 이력
├── CLAUDE.md                  # 프로젝트 규칙
├── DESIGN.md                  # 디자인 시스템
├── TODOS.md                   # 로드맵
└── README.md
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

# 커스텀 주제로 콘텐츠 생성
GEMINI_API_KEY=xxx npm run generate-lesson generate-custom "원하는 주제"

# 프로덕션 빌드
npm run build
```

## 환경변수

| 변수 | 용도 | 필요 시점 |
|------|------|----------|
| `GEMINI_API_KEY` | AI 콘텐츠 생성 | generate-lesson, GitHub Actions |
| `ADMIN_PASSWORD` | Admin 로그인 비밀번호 | Vercel |
| `ADMIN_SECRET` | 토큰 서명 키 | Vercel |
| `GITHUB_TOKEN` | Admin 에디터 파일 CRUD | Vercel |
| `GITHUB_REPO` | 레포 경로 (Mino777/ai-study) | Vercel |

## Frontmatter 스키마

```yaml
---
title: "RAG Architecture Overview"
category: rag                    # 10개 카테고리 중 하나
date: "2026-04-09"
tags: [rag, retrieval, embedding]
confidence: 2                    # 1-5 (들어봤다 → 가르칠 수 있다)
connections: [rag/vector-databases]  # 관련 엔트리 slug
status: complete                 # draft | in-progress | complete
description: "검색 증강 생성의 핵심 아키텍처"
type: entry                      # entry | til
---
```

## 라이선스

MIT
