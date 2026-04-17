# Mino's AI Study Wiki — LLM-First Knowledge Base

> **이 위키는 사람 + AI 에이전트가 함께 읽는 지식 저장소**다.
> 단순 기록이 아니라 *AI 에이전트가 즉시 실행 가능한* 형태로 AI 엔지니어링 방법론을 박제한다.
> 자세한 spec과 AI Agent Contract: **[SPEC.md](./SPEC.md)**

AI 에이전트가 이 저장소에서 작업할 때 **반드시** 먼저 로드:
1. **CLAUDE.md** (이 파일) — 프로젝트 규약 + 기술 스택
2. **SPEC.md** — 엔티티 + 데이터 흐름 + AI Agent Contract
3. **[AI Agent Start Here](content/harness-engineering/ai-agent-start-here.mdx)** — 상황별 라우팅
4. **[NEXT.md](./NEXT.md)** — 다음 세션 계획 (현재 상태 + 다음 큐 + 체크리스트)

이 4개를 로드하지 않고 작업 시작하면 *계약 위반*.
새 세션은 NEXT.md의 "다음 세션 시작 체크리스트" 5 Phase(총 18분)를 따른다.

---

AI 하네스 엔지니어링 학습 위키 + 포트폴리오. Next.js 15 App Router + MDX + Tailwind.

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4 + CSS custom properties (DESIGN.md 참조)
- **Content:** MDX (next-mdx-remote/rsc) + gray-matter + zod frontmatter validation + remark-gfm
- **Graph:** react-force-graph-2d (Client Component, ssr:false, linkDistance 180, charge -500)
- **Search:** Client-side text matching (한국어 지원 검증 완료)
- **Code:** shiki (@shikijs/rehype, github-dark-default theme) + 복사 버튼
- **Diagrams:** Mermaid (dynamic import, client-side rendering, dark theme)
- **Theme:** next-themes (dark default, data-theme attribute)
- **AI Generation:** Gemini 2.5 Flash (daily lesson pipeline)
- **CI/CD:** GitHub Actions (daily topic suggestion + comment-triggered generation)
- **Deploy:** Vercel (GitHub auto-deploy, push = 배포)
- **JIT Retrieval (Layer 3):** 로컬 임베딩 (`Xenova/multilingual-e5-small`, 384d) + JSON brute-force 검색 (1~2ms) + 규칙 기반 쿼리 라우터

## JIT 위키 검색 (에이전트 필수)

위키 지식이 필요할 때 **MDX 파일을 직접 읽지 말고** 검색을 먼저 실행:

```bash
npm run search -- "<질문>" 3 --inject
```

이 명령은 관련 청크만 마크다운으로 출력한다 (전체 위키 331K tokens → JIT ~800 tokens, **99.8% 절감**).
MDX 전체를 읽어야 할 때만 파일을 직접 열 것. 검색으로 충분하면 검색 결과만 사용.

**언제 사용하나:**
- 특정 패턴/방법론을 적용해야 할 때 (예: "Circuit Breaker 구현 방법")
- 에러/버그 해결 시 기존 솔루션이 있는지 확인할 때
- 엔트리 작성 시 관련 기존 엔트리를 찾을 때

## Pages
- `/` — 홈 (지식 그래프 풀스크린 히어로)
- `/wiki` — 위키 목록 (카테고리별 카드 그리드 + Coming Soon)
- `/wiki/[category]/[slug]` — 위키 엔트리 (요약 카드 + MDX + 이전/다음 네비)
- `/dashboard` — 학습 대시보드 (스트릭 + 히트맵 + 진도 + 추천)
- `/timeline` — 학습 타임라인 (날짜/월별 시간순 엔트리)
- `/projects` — Vibe Coding 쇼케이스 (CE/HE 패턴 + 회고)
- `/admin` — 엔트리 관리 대시보드 (인증 필요)
- `/admin/new` — 새 엔트리 작성 (MDX 에디터 + 프론트매터 폼)
- `/admin/edit/[...slug]` — 엔트리 수정
- `/admin/login` — 관리자 로그인

## Project Structure
```
content/           → MDX wiki entries (13 카테고리별 디렉토리)
scripts/           → prebuild manifest, watch, new-entry CLI, AI 과외 선생님, topic-pool.json,
                     embed-content (Layer 3 인덱서), search (검색 CLI), benchmark-models (모델 비교)
scripts/lib/       → mermaid-fix (validate 유틸), query-router (JIT 검��� 라우터)
src/app/           → Next.js App Router (홈, wiki, dashboard, projects)
src/components/    → header, graph, sidebar, search, summary-card, mermaid,
                     code-block (복사), entry-nav (이전/다음), mobile-nav (하단 탭)
src/contexts/      → GraphSearchContext (graph-search bidirectional state)
src/lib/           → schema.ts (zod, 10 categories, quizQuestionSchema),
                     content.ts (manifest/entry loaders),
                     quiz-storage.ts (localStorage attempts + SM-2 SRS schedule)
src/generated/     → content-manifest.json (gitignored, entries + graph + streak)
public/            → search-index.json (gitignored, SearchDialog lazy fetch용 슬림 인덱스),
                     embeddings.json (gitignored, Layer 3 벡터 인덱스 ~12MB)
.github/workflows/ → daily-lesson, generate-on-pick, vercel-retry
```

## Key Commands
- `npm run dev` — dev server + content watcher (concurrently)
- `npm run build` — prebuild manifest (+ streak 계산) → next build
- `npm run new-entry` — interactive CLI to create new MDX entry
- `npm run generate-lesson` — AI 과외 선생님: 주제 3개 추천
- `npm run generate-lesson generate <slug>` — 특정 주제로 콘텐츠 생성
- `npm run generate-lesson generate-custom <텍스트>` — 커스텀 주제로 생성 (Gemini가 영문 slug 자동 생성, 한글 slug 금지)
- `npm run embed-content` — Layer 3 벡터 인덱스 재생성 (multilingual-e5-small, ~100s)
- `npm run search -- "<query>"` — Layer 3 JIT 검색 (쿼리 라우터 자동 적용, --force로 강제)
- `node scripts/shadow-benchmark.mjs` — Layer 3 Phase 3 섀도우 벤치마크 (적중률 + 토큰 절감 측정)
- `node scripts/fix-one-way-connections.mjs [--apply]` — 일방향 연결 감지 + 역링크 일괄 추가

## Content System
- All content in `content/` as MDX files with frontmatter
- `scripts/generate-content-manifest.mjs` reads all MDX → single `content-manifest.json` (entries + graph + streak)
- Frontmatter schema: `src/lib/schema.ts` (zod validation)
- 13 Categories: prompt-engineering, context-engineering, harness-engineering, **tokenomics**, rag, agents, fine-tuning, evaluation, infrastructure, ios-ai, frontend-ai, **android-ai**, **backend-ai**
- **Sidebar 그룹** (`CATEGORY_GROUPS` in schema.ts): 방법론(prompt/context/harness/tokenomics) · 시스템 설계(rag/agents/fine-tuning) · 평가&인프라(evaluation/infrastructure) · 응용(ios-ai/frontend-ai/android-ai/backend-ai)
- **Tokenomics**: AI 토큰 경제학 — 지속 연구/디벨롭 필요. 카탈로그 엔트리에 "프로덕트 적용 기준 4 조건"이 박제되어 있어서 *안정적이고 확실히 효과 있는 레버만* 3 프로덕트(ai-study/moneyflow/tarosaju)에 즉시 적용. 적용 전 `ccusage` 베이스라인 측정 필수.
- Confidence: 1-5 (들어봤다 → 가르칠 수 있다)
- Streak: prebuild에서 frontmatter date 기반 연속 학습일 자동 계산
- dailyEntries: prebuild에서 날짜별 엔트리 수 맵 생성 (히트맵용)
- Optional `quiz` 필드: 객관식 자가 점검 문항 배열 (`question` / `choices` / `answer` / `explanation`). 위키 엔트리 본문 하단에 Quiz 컴포넌트로 자동 렌더. Gemini 파이프라인이 새 엔트리 생성 시 3문항 자동 작성.

## AI 과외 선생님 Pipeline
- 매일 09:00 KST: GitHub Actions → 3개 주제 추천 Issue 생성
- 사용자가 번호(1/2/3) 또는 자유 텍스트 댓글 → Gemini가 MDX 생성 → 자동 PR
- 주제 추천: 지식 그래프 분석 (빈 카테고리, dangling connections, 낮은 confidence)
- 카테고리 우선순위: AI 방법론(2.0x) > iOS/Frontend(1.5x) > Infrastructure(0.7x)
- Secrets: GEMINI_API_KEY, VERCEL_TOKEN

## Components (주요)
- `KnowledgeGraph` — force-directed 그래프 (react-force-graph-2d, ssr:false)
- `SearchDialog` — Cmd+K 검색 + GraphSearchContext. `public/search-index.json` lazy fetch. layout.tsx 글로벌 1회 mount
- `Sidebar` — 카테고리 트리 + `SeriesSubGroup` (frontmatter `series` 기반). 새 시리즈는 `SERIES_LABELS` (schema.ts) 한 줄 추가
- `MermaidRenderer` — 클라이언트 DOM 직접 렌더. `rehypeMermaid` 플러그인과 쌍 (Shiki 간섭 우회)
- `Quiz` / `QuizWidget` — frontmatter quiz 배열 기반 자가 점검 + SM-2 SRS 스케줄

## API Routes
- `/api/og` — OG 이미지 자동 생성 (Edge Runtime, next/og, Noto Sans KR)
- `/api/auth/login` — 관리자 로그인 (HMAC-SHA256 쿠키)
- `/api/auth/logout` — 로그아웃
- `/api/admin/entries` — 엔트리 목록(GET) + 생성(POST)
- `/api/admin/entries/[...slug]` — 조회(GET) + 수정(PUT) + 삭제(DELETE)

## Admin / Auth & Security
- HMAC-SHA256 쿠키 인증 (middleware.ts), Rate Limiting 15분/5회
- 환경변수: ADMIN_PASSWORD, ADMIN_SECRET, GITHUB_TOKEN, GITHUB_REPO — **미설정 시 런타임 throw**
- Security Headers: CSP, HSTS, X-Frame-Options (`next.config.ts`)
- GitHub Contents API로 MDX CRUD → Vercel 자동 재배포
- 보안 상세: `content/harness-engineering/security-hardening-checklist.mdx`

## Roadmap
- See TODOS.md for deferred items and backlog

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Compound Engineering

```
코드 작업 → git commit → 🔒 자동 빌드 체크 (실패시 차단)
                              ↓ 통과
                         git push → 📦 /compound 리마인더
                                         ↓
                              CHANGELOG + 회고 + 솔루션 자동 생성
```

- `git commit` 전 — `npm run build` 자동 실행, 실패하면 커밋 차단
- `git push` 후 — "/compound 실행하세요" 리마인더
- `/compound` 실행 — CHANGELOG + 회고 + 솔루션 문서 자동 생성

### 지식 저장소

| 저장소 | 용도 | 접근 |
|--------|------|------|
| `docs/solutions/` | 구체적 문제 해결 기록 | git (카테고리별 정리) |
| `docs/retros/` | 스프린트 회고 | git (날짜별) |
| Claude 메모리 | 유저 선호/패턴 | Claude Code (개인) |

솔루션 카테고리: build-errors, runtime-errors, next-patterns, mdx, ai-pipeline, performance, workflow, github-actions

## Frozen Snapshot 원칙 (Hermes + aidy-architect 이식)

- 활성 세션 중 CLAUDE.md 수정 금지 (캐시 전체 무효화 + 1.25x 오버헤드)
- 변경이 필요하면 메모리에 기록만 하고, `/compound` Phase 3에서 일괄 반영
- CLAUDE.md ≤ 200줄 유지, 상세는 슬래시 커맨드로 분리

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review (2-Stage: Plan 있으면 Spec compliance + Code quality)
- Update docs after shipping → invoke document-release
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- 작업 완료, 스프린트 정리, 회고 → invoke compound
- 자동 스프린트, 풀 자동 개발 루프 → invoke autoceo
- 외부 URL(유튜브/블로그/논문/스레드) 정리, 학습 엔트리로 가공 → invoke ingest
- 새 작업 시작, 안전한 브랜치 분기 (squash merge 함정 회피) → invoke wt-branch
- 워커 프로젝트(moneyflow/tarosaju) 상태 확인, 다른 세션 작업 흔적 감지, 충돌 사전 탐지 → invoke projects-sync
- 다른 Claude 세션(맥앱/웹/다른 터미널) PR/커밋 검증, 크로스 세션 리뷰 → invoke cross-session-review
- 워커 프로젝트(moneyflow/tarosaju 등)가 `patterns:` prefix로 쏜 PR을 하네스로 박제 → invoke curate-inbound

## .claude/ 인프라

- `.claude/hooks/no-company-names.sh` — PreToolUse(Edit/Write) 가드. `gma-ios|GreenCar|LOTTIMS` 패턴 grep → 차단. 메모리 룰 보강용 행동 레벨 가드. 화이트리스트: `.claude/projects/.../memory/`, 훅 자체
- `.claude/commands/cross-session-review.md` — Journal 019 5단 프로토콜 슬래시 커맨드
- `scripts/lib/mermaid-fix.mjs` — `validate-content.mjs`에서 추출한 자동 수정 + warning-only 검출. 두 과거 버그(slicing offset / regex 누적) docstring 박제 + `detectUnquotedSpecialCharLabels()` warning (`<br/>` `→`)
- `scripts/__tests__/validate-content.test.mjs` — mermaid-fix 16 회귀 테스트 (idempotency 케이스 별도 박제, `npm test`로 vitest 실행)

<!-- RTK instructions: 전역 ~/.claude/CLAUDE.md의 @RTK.md로 로드됨. 이중 로딩 방지를 위해 프로젝트 레벨에서 제거 (A1 토큰 레버). -->