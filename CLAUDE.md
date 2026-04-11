# AI Study Wiki

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
content/           → MDX wiki entries (10 카테고리별 디렉토리)
scripts/           → prebuild manifest, watch, new-entry CLI, AI 과외 선생님, topic-pool.json
src/app/           → Next.js App Router (홈, wiki, dashboard, projects)
src/components/    → header, graph, sidebar, search, summary-card, mermaid,
                     code-block (복사), entry-nav (이전/다음), mobile-nav (하단 탭)
src/contexts/      → GraphSearchContext (graph-search bidirectional state)
src/lib/           → schema.ts (zod, 10 categories, quizQuestionSchema),
                     content.ts (manifest/entry loaders),
                     quiz-storage.ts (localStorage attempts + SM-2 SRS schedule)
src/generated/     → content-manifest.json (gitignored, entries + graph + streak)
.github/workflows/ → daily-lesson, generate-on-pick, vercel-retry
```

## Key Commands
- `npm run dev` — dev server + content watcher (concurrently)
- `npm run build` — prebuild manifest (+ streak 계산) → next build
- `npm run new-entry` — interactive CLI to create new MDX entry
- `npm run generate-lesson` — AI 과외 선생님: 주제 3개 추천
- `npm run generate-lesson generate <slug>` — 특정 주제로 콘텐츠 생성
- `npm run generate-lesson generate-custom <텍스트>` — 커스텀 주제로 생성

## Content System
- All content in `content/` as MDX files with frontmatter
- `scripts/generate-content-manifest.mjs` reads all MDX → single `content-manifest.json` (entries + graph + streak)
- Frontmatter schema: `src/lib/schema.ts` (zod validation)
- 10 Categories: prompt-engineering, context-engineering, harness-engineering, rag, agents, fine-tuning, evaluation, infrastructure, ios-ai, frontend-ai
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
- `SearchDialog` — Cmd+K 검색 + GraphSearchContext 연동
- `Sidebar` — 카테고리 트리 (접이식, confidence dots)
- `SummaryCard` — 엔트리 요약 (카테고리 배지, confidence, 읽기 시간, GitHub 편집)
- `CodeBlock` — 코드 블록 + 복사 버튼
- `MermaidDiagram` — mermaid 코드 블록 자동 렌더링
- `EntryNav` — 이전/다음 엔트리 (같은 카테고리 내)
- `MobileNav` — 모바일 하단 탭 바
- `LearningHeatmap` — GitHub 스타일 학습 히트맵 (12주, dailyEntries 기반)
- `Quiz` — frontmatter quiz 배열 기반 객관식 자가 점검 (즉시 채점 + 해설 + localStorage 저장)
- `QuizWidget` — 대시보드용 퀴즈 통계 + Spaced Repetition 큐 ("오늘 복습할 엔트리"). `lib/quiz-storage.ts`의 SM-2 단순화 알고리즘 사용 (간격 1→3→7→14→30→60일)

## API Routes
- `/api/og` — OG 이미지 자동 생성 (Edge Runtime, next/og, Noto Sans KR)
- `/api/auth/login` — 관리자 로그인 (HMAC-SHA256 쿠키)
- `/api/auth/logout` — 로그아웃
- `/api/admin/entries` — 엔트리 목록(GET) + 생성(POST)
- `/api/admin/entries/[...slug]` — 조회(GET) + 수정(PUT) + 삭제(DELETE)

## Admin / Auth
- 쿠키 기반 HMAC-SHA256 인증 (middleware.ts)
- 환경변수: ADMIN_PASSWORD, ADMIN_SECRET, GITHUB_TOKEN, GITHUB_REPO
- GitHub Contents API로 MDX 파일 CRUD → Vercel 자동 재배포
- 에디터: @uiw/react-md-editor (다크 테마, 실시간 프리뷰)

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