# AI Study Wiki

AI 하네스 엔지니어링 학습 위키 + 포트폴리오. Next.js 15 App Router + MDX + Tailwind.

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4 + CSS custom properties (DESIGN.md 참조)
- **Content:** MDX (next-mdx-remote/rsc) + gray-matter + zod frontmatter validation
- **Graph:** react-force-graph-2d (Client Component, ssr:false)
- **Search:** Client-side text matching (한국어 지원 검증 완료)
- **Code:** shiki (@shikijs/rehype, github-dark-default theme)
- **Diagrams:** Mermaid (dynamic import, client-side rendering)
- **Theme:** next-themes (dark default, data-theme attribute)
- **AI Generation:** Gemini 2.5 Flash (daily lesson pipeline)
- **CI/CD:** GitHub Actions (daily topic suggestion + comment-triggered generation)
- **Deploy:** Vercel (GitHub auto-deploy)

## Project Structure
```
content/           → MDX wiki entries (10 카테고리별 디렉토리)
scripts/           → prebuild manifest, watch, new-entry CLI, AI 과외 선생님
src/app/           → Next.js App Router (홈, wiki, dashboard, projects)
src/components/    → React components (header, graph, sidebar, search, summary-card, mermaid)
src/contexts/      → GraphSearchContext (graph-search bidirectional state)
src/lib/           → schema.ts (zod), content.ts (manifest/entry loaders)
src/generated/     → content-manifest.json (gitignored, auto-generated)
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
- `scripts/generate-content-manifest.mjs` reads all MDX → generates single `content-manifest.json` (entries + graph + streak)
- Frontmatter schema defined in `src/lib/schema.ts` (zod validation)
- 10 Categories: prompt-engineering, context-engineering, harness-engineering, rag, agents, fine-tuning, evaluation, infrastructure, ios-ai, frontend-ai
- Confidence: 1-5 scale (들어봤다 → 가르칠 수 있다)
- Streak: prebuild에서 frontmatter date 기반 연속 학습일 자동 계산

## AI 과외 선생님 Pipeline
- 매일 09:00 KST: GitHub Actions가 3개 주제 추천 Issue 생성
- 사용자가 번호(1/2/3) 또는 자유 텍스트로 댓글 → 해당 주제로 Gemini가 MDX 생성 → 자동 PR
- 주제 추천: 지식 그래프 분석 (빈 카테고리, dangling connections, 낮은 confidence) + 카테고리 우선순위
- Secrets: GEMINI_API_KEY, VERCEL_TOKEN

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

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
