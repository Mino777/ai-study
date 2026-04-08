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
- **Deploy:** Vercel (GitHub auto-deploy)

## Project Structure
```
content/           → MDX wiki entries (frontmatter + content)
scripts/           → prebuild manifest generator, watch script, new-entry CLI
src/app/           → Next.js App Router pages
src/components/    → React components (graph, sidebar, search, summary-card, mermaid)
src/contexts/      → GraphSearchContext (graph-search bidirectional state)
src/lib/           → schema.ts (zod), content.ts (manifest/entry loaders)
src/generated/     → content-manifest.json (gitignored, auto-generated)
```

## Key Commands
- `npm run dev` — dev server + content watcher (concurrently)
- `npm run build` — prebuild manifest → next build
- `npm run new-entry` — interactive CLI to create new MDX entry

## Content System
- All content in `content/` as MDX files with frontmatter
- `scripts/generate-content-manifest.mjs` reads all MDX → generates single `content-manifest.json`
- Frontmatter schema defined in `src/lib/schema.ts` (zod validation)
- Categories: prompt-engineering, rag, agents, fine-tuning, evaluation, infrastructure
- Confidence: 1-5 scale (들어봤다 → 가르칠 수 있다)

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
