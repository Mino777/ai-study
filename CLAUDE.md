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

## Components
- `Header` — 공통 헤더 (Wiki/Dashboard/Vibe Coding + 현재 탭 하이라이트)
- `KnowledgeGraph` — force-directed 그래프 (useMemo graphData, useRef hover, 빈 카테고리 회색 노드)
- `SearchDialog` — Cmd+K 검색 + GraphSearchContext 연동. 검색 인덱스는 `public/search-index.json`에서 lazy fetch (mount 후 `requestIdleCallback` 프리페치 + 모듈 스코프 캐시). layout.tsx가 글로벌로 한 번만 mount — 페이지별 중복 mount 금지
- `Sidebar` — 카테고리 트리 (접이식, confidence dots, harness-engineering 내 Journal 서브그룹)
- `SummaryCard` — 엔트리 요약 (카테고리 배지, confidence, 읽기 시간, GitHub 편집)
- `CodeBlock` — 코드 블록 + 복사 버튼
- `MermaidRenderer` — 클라이언트 DOM 직접 렌더링. `.mermaid-block` div를 스캔 → mermaid SVG 변환. `rehypeMermaid` 플러그인과 쌍으로 동작 (Shiki 간섭 우회)
- `MermaidDiagram` — 단독 mermaid 렌더 컴포넌트 (MermaidRenderer가 페이지 레벨에서 대체)
- `EntryNav` — 이전/다음 엔트리 (같은 카테고리 내)
- `MobileNav` — 모바일 하단 탭 바
- `LearningHeatmap` — GitHub 스타일 학습 히트맵 (12주, dailyEntries 기반, 일~토 행 정렬)
- `Sidebar` — 카테고리 트리. `SeriesSubGroup`이 frontmatter `series` 필드 기반으로 generic하게 그룹화 (📓 Harness Journal / 📱 iOS Journal / 🤖 Multi-Agent Orchestration Journal). 새 시리즈는 `SERIES_LABELS` (schema.ts) 한 줄 추가
- `Quiz` — frontmatter quiz 배열 기반 객관식 자가 점검 (즉시 채점 + 해설 + localStorage 저장)
- `QuizWidget` — 대시보드용 퀴즈 통계 + Spaced Repetition 큐 ("오늘 복습할 엔트리"). `lib/quiz-storage.ts`의 SM-2 단순화 알고리즘 사용 (간격 1→3→7→14→30→60일)

## API Routes
- `/api/og` — OG 이미지 자동 생성 (Edge Runtime, next/og, Noto Sans KR)
- `/api/auth/login` — 관리자 로그인 (HMAC-SHA256 쿠키)
- `/api/auth/logout` — 로그아웃
- `/api/admin/entries` — 엔트리 목록(GET) + 생성(POST)
- `/api/admin/entries/[...slug]` — 조회(GET) + 수정(PUT) + 삭제(DELETE)

## Admin / Auth & Security
- 쿠키 기반 HMAC-SHA256 인증 (middleware.ts)
- 환경변수: ADMIN_PASSWORD (최소 8자), ADMIN_SECRET (최소 16자), GITHUB_TOKEN, GITHUB_REPO — **default fallback 없음**, 미설정 시 런타임 throw
- Timing-safe 비교: Web Crypto HMAC 기반 constant-time (Edge Runtime 호환)
- Rate Limiting: 로그인 15분/5회 IP 기반 (`src/lib/rate-limit.ts`)
- Security Headers: CSP, HSTS, X-Frame-Options, Permissions-Policy (`next.config.ts`)
- Error 정보 누출 차단: GitHub API 에러 → 서버 로깅 + 클라이언트 generic 메시지
- Body 크기 제한: MDX 콘텐츠 100KB 초과 시 413
- npm audit CI: `--audit-level=high` (ci.yml)
- GitHub Contents API로 MDX 파일 CRUD → Vercel 자동 재배포
- 에디터: @uiw/react-md-editor (다크 테마, 실시간 프리뷰)
- 보안 패턴 참조: `content/harness-engineering/security-hardening-checklist.mdx`

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

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
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

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->