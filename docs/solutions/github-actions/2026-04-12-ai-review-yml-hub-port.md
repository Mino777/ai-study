# ai-review.yml을 허브(ai-study)에 이식 — workflow 이식 사이클의 엄격한 규칙

**날짜**: 2026-04-12
**관련 Journal**: [014](../../../content/harness-engineering/harness-journal-014-hub-auto-merge-inbound-tips.mdx)
**원본 위치**: `mino-moneyflow/.github/workflows/ai-review.yml` (Journal 002에서 도입)

## 문제

moneyflow에서 검증된 `ai-review.yml`(자동 PR + Rebase + Test Gate + Squash Merge + Reset branch)을 새 프로젝트(이번엔 ai-study 허브)에 이식할 때, *어디까지 바꾸고 어디까지 유지할지*의 결정 기준이 불명확.

## 증상

이식을 *재설계*로 접근하면 결과는 하나로 정해진다 — 원본과 다른 동작. 검증된 구조를 잃는다. 더 나쁜 경우, 수백 줄 workflow에서 *어느 부분이 왜 그 형태인지* 재고찰해야 하므로 이식 사이클 자체가 늘어진다.

## 해결 — 이식은 재설계가 아니라 복제

**원본 그대로 유지**할 부분:

- `Find or Create PR` (github-script, 기존 PR 탐색 로직 + 자동 생성)
- `Rebase onto main` (force-with-lease로 feature 브랜치 업데이트)
- `Comment on conflict` (충돌 시 PR에 수동 해결 안내)
- `Squash Merge` (github.rest.pulls.merge로 squash)
- `Reset branch to main` (squash 후 feature 브랜치를 origin/main으로 force-reset)
- 전체 `on:` 트리거 (`push: branches-ignore: [main]`)
- `permissions` 블록 (`contents: write`, `pull-requests: write`)
- `actions/checkout@v4` + `actions/setup-node@v4` + `cache: 'npm'`

**프로젝트 맞춤으로 바꾸는 부분** (딱 3가지):

1. **Test Gate 내용** — 이 프로젝트의 실제 빌드/테스트 명령
   - moneyflow: `npx vitest run` + `npm run build`
   - tarosaju: (동일, 현재 Journal 011에서 이식)
   - ai-study: `npm test` + `npm run build` (prebuild가 자동으로 frontmatter zod + content manifest 검증 포함)

2. **Test Gate env vars** — build 시점에 필요한 최소 placeholder
   - moneyflow: `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co` + `NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key`
   - tarosaju: 동일
   - ai-study: **없음** (build 시점에 Supabase env 불필요)

3. **주석/본문의 Journal 번호 참조** — 이식 사이클을 추적 가능하게
   - moneyflow: `Journal 002`
   - tarosaju: `Journal 011 — 이식`
   - ai-study: `Journal 014 — 첫 허브 이식, 박제 전이성 4회째`

**절대 바꾸지 않는 이유**: 원본이 *이미 검증됐다*. Journal 002/003/005/011에서 누적된 교훈(`--force-with-lease`, Rebase onto main의 bailout 조건, Squash Merge 후 feature 브랜치 reset 등)은 *각각의 하드웨어 버그*에 대응하는 설계다. 구조를 건드리면 이 버그들이 다시 등장할 수 있다.

## Before / After

### Before — 재설계 접근 (안티패턴)

```
새 프로젝트마다 workflow를 처음부터 설계
→ 각자 다른 구조 (이 프로젝트는 Rebase 안 함, 저 프로젝트는 Test Gate가 job-level)
→ 한 프로젝트에서 교훈을 얻으면 다른 프로젝트로 전파 안 됨
→ Journal 003 같은 사고가 각 프로젝트에서 한 번씩 반복
```

### After — 복제 접근

```
검증된 원본(moneyflow ai-review.yml)을 1:1 복사
→ Test Gate 명령만 프로젝트 맞춤으로 교체
→ 모든 프로젝트가 동일 구조 → 한 프로젝트의 버그 수정이 다른 프로젝트로도 이식 가능
→ 사고 재발률 0/13 유지
```

## 박제 전이성 사이클 (이식 방향 기록)

| # | Journal | 전이 | 산출 |
|---|---|---|---|
| 1 | 005 | ai-study → moneyflow/tarosaju | `/wt-branch` 3 프로젝트 통일 |
| 2 | 007+008 | tarosaju → moneyflow | `ai-cost-tracker` |
| 3 | 011 | moneyflow → tarosaju | `ai-review.yml` |
| 4 | 012 → 013 | (내부) market → news/sentiment/fundamentals | validator 패턴 |
| **5** | **014** | **moneyflow → ai-study (첫 허브 이식)** | **`ai-review.yml`** |

전이 방향이 *다양화된다*. 원본은 *가장 먼저 해당 패턴을 증명한 프로젝트*고, 허브든 워커든 무관.

## 근본 원인

이식 = *검증된 결정의 전파*. 원본의 모든 구조에는 *과거 사고*가 박혀있고, 이를 복제하는 것이 박제 전이성의 핵심 규칙. *원본과 달라지는 순간 이식이 아니라 분기*가 된다.

## 체크리스트

이식 PR을 작성할 때:

- [ ] 원본 파일을 *1:1로* 먼저 복사했는가?
- [ ] 바꾸는 부분이 Test Gate 명령 + env vars + 주석 3가지 뿐인가?
- [ ] 바꾸는 각 부분에 대해 *왜 바꾸는지* commit message에 명시했는가?
- [ ] `permissions` 블록을 그대로 유지했는가? (read-only로 바꾸면 작동 안 함)
- [ ] 대상 repo의 workflow permissions 설정이 write인가? (`gh api repos/<owner>/<repo>/actions/permissions/workflow`)
  - [ ] `default_workflow_permissions: "write"`
  - [ ] `can_approve_pull_request_reviews: true`
- [ ] 첫 이식 PR은 수동 머지 가능성 고려 (chicken-and-egg) — 단 권한이 미리 설정돼 있으면 첫 시도에도 자동 가능 (ai-study Journal 014 사례)
- [ ] 이식 후 *첫 완전 자동 PR*을 작은 사이클(예: 문서/설정 변경)로 검증했는가? (Vercel Analytics PR #19 사례)

## 관련 솔루션

- `workflow/2026-04-12-hub-worker-concurrent-session-safety.md` — 허브-워커 안전 구조 (이식 동기)
