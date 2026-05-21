---
id: sol_2026_05_21_direct_main_push_collision
type: solution
category: workflow
title: "main 직접 푸시가 봇 동시 푸시와 충돌 — non-fast-forward, push 전 fetch 반사"
date: 2026-05-21
tags: [git, push, non-fast-forward, rebase, collaborative-repo, bot, vercel, fetch-before-push]
status: done
---

# main 직접 푸시가 봇 동시 푸시와 충돌

## 문제

콘텐츠/페이지 작업을 main에 직접 commit 후 `git push origin main` 했더니 거부됨. 작업 중 CI 봇(긱뉴스 큐레이션·스카우트)이 main에 PR 2건을 머지해 remote가 앞서 나가 있었다.

## 증상

- `git push origin main` 후 remote main이 내 커밋이 아닌 다른 해시(봇 커밋)를 가리킴 → non-fast-forward로 push 미반영.
- 로컬은 `0deb044`(이전 base) 위에 내 커밋, remote는 같은 base 위에 봇 커밋 2개 → diverge.

## 해결 (before → after)

**Before**: 작업 시작 시점의 base만 믿고 바로 push → 거부.

**After**:
```bash
git fetch origin main          # remote 최신 확인
git rebase origin/main         # 내 커밋을 봇 커밋 위로 (선형 유지, 충돌 0)
npm run build                  # 통합 상태 재검증 (base 바뀜)
git push origin main           # fast-forward 성공
```

검증: `git ls-remote origin -h refs/heads/main`으로 remote 해시 == 로컬 HEAD 확인 (로컬 추적 ref는 fetch 전까지 stale).

## 근본 원인

이 레포는 봇이 main에 *수시로* 자동 푸시한다(긱뉴스 22:00 KST + Blake 스카우트 + 데일리 레슨). collaborative repo인데 push 전 `git fetch`로 remote freshness를 확인하는 반사가 없었다. 작업이 길수록(이번엔 멀티 기능 세션) 봇이 끼어들 확률 ↑.

## 체크리스트 (For AI Agents)

- [ ] **봇이 main에 자동 푸시하는 레포**(ai-study)에서는 push 전 `git fetch origin main` 반사
- [ ] non-fast-forward 거부 시 `merge`보다 `rebase origin/main` (선형 히스토리 유지)
- [ ] rebase로 base가 바뀌면 **빌드 재검증** (다른 세션이 넣은 콘텐츠가 빌드를 깰 수 있음)
- [ ] push 성공 검증은 `git ls-remote`(authoritative) — 로컬 `origin/main` 추적 ref는 fetch 전까지 stale
- [ ] 멀티 기능·장시간 세션은 worktree 분기 고려 (봇 충돌·squash-merge 함정 회피) — `/wt-branch`
