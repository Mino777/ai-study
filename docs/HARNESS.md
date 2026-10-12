# HARNESS — ai-study 하네스 인프라 레퍼런스

> `CLAUDE.md` 200줄 상한(Frozen Snapshot 원칙)을 지키려고 분리한 상세 문서. 마지막 전수 점검: **2026-10-12**.
> 수정 규칙은 `.claude/rules/harness-meta.md` 를 따른다.

## 자동화 현황 (2026-10-12)

- **GitHub Actions: 없음.** 데일리 레슨·스카우트·주간 리포트/벤치마크·auto-merge(`ai-review.yml`)·CI 를 포함한 워크플로 13개를 전부 삭제했다 (PR #365). aidy 4개 저장소도 같은 날 전부 삭제.
- 남은 자동 검증은 **로컬 Claude Code 훅뿐**이다 (아래 표). 레슨 생성·스카우트·벤치마크 스크립트는 `scripts/` 에 그대로 있고 필요할 때 수동 실행한다.
- 배포는 Vercel GitHub 연동(push = 배포) 그대로.

## 훅 (`.claude/hooks/` + `.claude/settings.json`)

모든 훅은 `"$CLAUDE_PROJECT_DIR"` 기준으로 등록돼 있어 클론 위치와 무관하다 (2026-10-12 이전엔 옛 클론 `~/Develop/ai-study` 로 하드코딩돼 있어서 빌드 게이트가 엉뚱한 트리를 검사했다).

| 시점 | 훅 | 하는 일 |
|---|---|---|
| SessionStart | `session-start.sh` | 브랜치·엔트리 수·NEXT.md 1순위·origin/main 대비 ahead/behind 표시 |
| SessionStart | `gc-drift-detector.sh` | 일방향 연결 50건 초과 · CLAUDE.md 200줄 초과 · 빈 메모리 파일 · deny 규칙 누락 경고 |
| PreToolUse(Bash: `git commit`) | settings.json 인라인 | `npm run build` 실행, 실패 시 커밋 차단 (QA_GATE) |
| PreToolUse(Edit/Write) | `no-company-names.sh` | 회사 식별자 패턴이 들어간 쓰기 차단. 화이트리스트: 메모리 디렉터리, 훅 자체 |
| PostToolUse(Edit/Write) | settings.json 인라인 | `npx tsc --noEmit` 타입 에러 감지 |
| PostToolUse(Bash: `git push`) | settings.json 인라인 | `/compound` 실행 리마인더 |
| PreToolUse(Read) | `jit-search-first.sh` | `content/**/*.mdx` 직접 Read 전 JIT 검색 권장 (경고만, 차단 X). 2026-10-12 프로젝트 settings 에 등록 — 전역 아님 |

## 슬래시 커맨드 (`.claude/commands/`, 13개)

라우팅 규칙은 `CLAUDE.md` `## Skill routing`. 정합성은 `npm run check:skills` 로 확인한다 (2026-10-12: 로컬 13 / unreachable 0 / orphan 0).

| 커맨드 | 용도 |
|---|---|
| `/compound` | 작업 마무리 — CHANGELOG + 회고 + 솔루션 문서 축적 |
| `/autoceo` | 풀 자동 스프린트 루프 (안전 모드, 체크포인트·롤백) |
| `/ingest` | 외부 URL(유튜브/블로그/논문) → 학습 엔트리 가공 |
| `/wt-branch` | worktree 기반 안전한 새 작업 분기 (squash merge 함정 회피) |
| `/review` | 2-Stage pre-landing 리뷰 (Spec compliance + Code quality) |
| `/cross-session-review` | 다른 Claude 세션 결과물 검증 (Journal 019 5단 프로토콜) |
| `/projects-sync` | 워커 프로젝트(moneyflow/tarosaju/aidy) read-only 진단 |
| `/curate-inbound` | 워커가 쏜 `patterns/`·`tips/` PR 분류 + 하네스 박제 |
| `/message` | 허브↔워커 파일 기반 비동기 메시지 (`messages/` JSON) |
| `/consult` | 온디맨드 에페메럴 전문가 소환 + 진실성 가드 |
| `/validate-mdx` | MDX/Mermaid 5대 함정 사전 grep |
| `/validate-ai-output` | AI 생성물 4대 함정 검증 (가짜 인용·YAML·slug) |
| `/promote-solution` | N=3+ 반복 솔루션을 코드 게이트로 승격 |

## 룰 (`.claude/rules/`)

- `harness-meta.md` — 하네스 자체 수정 규칙 (Frozen Snapshot, deny 추가만, hook timeout, exit code)
- `content-mdx.md` — MDX 편집 규칙 (Mermaid 5대 함정, frontmatter 필수 필드, slug)

## 스크립트 게이트

- `scripts/lib/mermaid-fix.mjs` — Mermaid 자동 수정 3규칙(괄호 quoting / `<br/>` → `·` / 콜론 quoting) + subgraph/node ID 충돌 error 감지 + `→` warning
- `scripts/__tests__/validate-content.test.mjs` 등 — `npm test` (vitest, 2026-10-12 기준 71/71 통과)
- 정본 클론은 `~/Personal/ai-study`. 옛 클론 `~/Develop/ai-study` 는 2026-10-12 정리됨 (백업: `.git/old-develop-clone-2026-10-12.bundle`, 로컬 전용)
- `.claude/scripts/` — 런타임에 생성되는 플러그인 스크립트 심링크. 머신별 절대경로라 커밋 금지 (`.gitignore`)

## Compound Engineering 흐름

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

## 코드 레퍼런스

### 주요 컴포넌트
- `KnowledgeGraph` — force-directed 그래프 (react-force-graph-2d, ssr:false)
- `SearchDialog` — Cmd+K 검색 + GraphSearchContext. `public/search-index.json` lazy fetch. layout.tsx 글로벌 1회 mount
- `Sidebar` — 카테고리 트리 + `SeriesSubGroup` (frontmatter `series` 기반). 새 시리즈는 `SERIES_LABELS` (schema.ts) 한 줄 추가
- `MermaidRenderer` — 클라이언트 DOM 직접 렌더. `rehypeMermaid` 플러그인과 쌍 (Shiki 간섭 우회)
- `Quiz` / `QuizWidget` — frontmatter quiz 배열 기반 자가 점검 + SM-2 SRS 스케줄

### API Routes
- `/api/og` — OG 이미지 자동 생성 (Edge Runtime, next/og, Noto Sans KR)
- `/api/auth/login` — 관리자 로그인 (HMAC-SHA256 쿠키)
- `/api/auth/logout` — 로그아웃
- `/api/admin/entries` — 엔트리 목록(GET) + 생성(POST)
- `/api/admin/entries/[...slug]` — 조회(GET) + 수정(PUT) + 삭제(DELETE)
