# 허브-워커 동시 세션 충돌 방지 — 구조적 해결

**날짜**: 2026-04-12
**관련 Journal**: [011](../../../content/harness-engineering/harness-journal-011-concurrent-session-safety.mdx), [012](../../../content/harness-engineering/harness-journal-012-market-analyst-runtime-validation.mdx), [013](../../../content/harness-engineering/harness-journal-013-three-analysts-runtime-validation.mdx), [014](../../../content/harness-engineering/harness-journal-014-hub-auto-merge-inbound-tips.mdx)

## 문제

같은 사용자가 Claude Code 세션을 여러 개 동시에 운영한다:

- 허브 세션 (ai-study, 분석/오케스트레이션)
- 워커 세션(들) (moneyflow, tarosaju — 각각 직접 코드 작업)
- 추가로 Conductor tool 등 자동화 워크스페이스도 병행

이 상황에서 허브 세션이 *워커 코드를 만지면*(예: Journal 012에서 moneyflow `market-analyst.ts` 수정), 다른 세션이 같은 파일을 동시에 편집 중이면 머지 충돌이 난다. `git pull` 시점에도, `rebase` 시점에도, squash merge 후에도.

## 증상

1. `git pull` 실패 — "Not possible to fast-forward, aborting"
2. 머지 후 origin과 local main이 diverge — 새 작업이 옛 base 위에 쌓여 push 거부
3. worktree 잔여물 누적 — `.claude/worktrees/agent-*`가 7개 이상 쌓임 (각 세션이 정리 안 함)
4. 다른 세션이 내 작업 파일을 이미 수정한 상태 — modified 파일이 local에 있는데 원인 불명

## 해결 (3 층 방어 구조)

### Layer 1 — 시작점 충돌 제거: `/wt-branch`

모든 새 작업은 `/wt-branch <branch-name>`으로 시작. 이 슬래시 커맨드는:

```bash
git -C <project> fetch origin
git -C <project> worktree add -b <branch-name> /tmp/<project>-<branch-name> origin/main
```

**핵심**: `origin/main`에서 분기 (local main 아님). local이 behind든 diverge든 무관.

### Layer 2 — 머지 직전 자동 재정렬: `ai-review.yml` Rebase onto main

각 프로젝트의 `.github/workflows/ai-review.yml`에 `Rebase onto main` step이 있음:

```yaml
- name: Rebase onto main
  run: |
    git fetch origin main
    if git merge-base --is-ancestor origin/main HEAD; then
      echo "✅ Already up to date"
      exit 0
    fi
    if git rebase origin/main; then
      git push origin HEAD --force-with-lease
    else
      git rebase --abort
      # 수동 해결 필요 comment 남김
    fi
```

PR 머지 직전에 origin/main으로 rebase → 다른 세션이 먼저 머지한 변경을 *자동으로* 흡수.

### Layer 3 — 머지 직전 최종 검증: inline Test Gate

```yaml
- name: 🔒 Test Gate (vitest + build)
  run: |
    npm test
    npm run build
```

Rebase 후 실행. 한 세션의 변경이 다른 세션의 작업을 *의미적으로* 깼다면 여기서 걸린다 (문법적 충돌은 rebase에서 걸리고, 의미적 회귀는 Test Gate에서 걸림).

### 관찰 도구: `/projects-sync`

허브 세션 전용 read-only 진단:

```
mino-moneyflow (⚠️ 주의)
  origin 최신:       f522f4e docs(claude): 동시 세션 안전 규칙 섹션 추가 (#96)
  local main:        f782587 [behind 3]
  worktree 잔여물:   /Users/jominho/conductor/workspaces/mino-moneyflow/la-paz  ← 다른 세션
                     .claude/worktrees/agent-a1533eb5 (active)
                     ... 6 more
  다른 세션 흔적:    ⚠️ open PR + worktree 잔여물 감지
```

이 결과를 *도구 선택의 실시간 제약*으로 사용. 예: 다른 세션 7 worktree가 active이면 `package-lock.json` 편집을 피한다 → zod dep 추가 대신 순수 TypeScript type guard로 전환.

## Before / After

### Before

```bash
# Journal 003 시대 — AI가 두 번 같은 함정에 빠짐
git checkout -b feature/x
# ... 작업 ...
git push
# → 다른 세션이 먼저 머지 → rebase 충돌
git pull --rebase
# → 충돌 수동 해결
# → 해결 과정에서 다른 세션 작업 덮어씀 → 사고
```

### After

```bash
# Journal 014 시대
/wt-branch feature/x   # origin/main 최신에서 분기 (시작점 충돌 0)
# ... worktree에서 작업 ...
git push               # feature/x push
# → ai-review.yml이 자동 PR 생성 → Rebase onto main (다른 세션 머지 흡수) → Test Gate → Squash Merge
# → feature 브랜치를 main으로 reset (다음 사용 시 충돌 없음)
```

**사고 재발률**: wt-branch 도입 이후 **0회 / 13 사이클** 누적 (Journal 003 사고 시점으로부터).

## 근본 원인

*세션 간 git 상태가 공유 자원*이라는 본질. 개별 세션은 자기 local만 본다:

- 로컬 `main`이 언제 갱신되는지 세션은 스스로 알 수 없다
- push 후 squash merge된 feature 브랜치가 main과 diverge한다는 것도 세션은 모른다
- 다른 세션의 `/tmp/*` worktree도 감지 불가

해결책은 *세션 간 통신 프로토콜*이 아니라 *공유 자원(main)의 상태를 항상 re-fetch*하는 구조:

1. 분기할 땐 `origin/main`에서 (local 무시)
2. 머지 직전에도 `origin/main`으로 rebase (선행 머지 흡수)
3. 검증은 inline으로 (branch protection의 timing 종속 제거)

세션은 *자신의 local state를 무시*하고 *origin의 현재 state*만 믿는다.

## 체크리스트 (다음에 만날 때)

- [ ] 새 작업 시작 전: `/wt-branch <branch-name>` 사용했는가?
- [ ] 작업 디렉토리가 `/tmp/<project>-<branch>`인가? (원본 working tree 아님)
- [ ] 프로젝트에 `.github/workflows/ai-review.yml` 있는가?
  - [ ] Rebase onto main step 있는가?
  - [ ] inline Test Gate (`npm test` + `npm run build`) 있는가?
  - [ ] Reset branch to main step 있는가? (squash merge 후 feature 브랜치 리셋)
- [ ] repo settings: `default_workflow_permissions: write` + `can_approve_pull_request_reviews: true`?
- [ ] 허브 세션인 경우: 작업 전 `/projects-sync`로 다른 세션 흔적 확인했는가?
- [ ] 다른 세션 7+ active worktree 있으면 `package.json` / `package-lock.json` 편집 피했는가?

## 관련 솔루션

- `github-actions/2026-04-12-ai-review-yml-hub-port.md` — workflow 이식 사이클
- `ai-pipeline/2026-04-12-runtime-shape-validation-type-guard-vs-zod.md` — `/projects-sync` 결과를 도구 선택 제약으로 사용한 사례
