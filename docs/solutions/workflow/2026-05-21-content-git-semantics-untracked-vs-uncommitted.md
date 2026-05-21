---
id: sol_2026_05_21_git_semantics_untracked_uncommitted
type: solution
category: workflow
title: "git 콘텐츠 작성 시 untracked ≠ unstaged 혼동 — reset --hard vs clean 사정권"
date: 2026-05-21
tags: [git, content-accuracy, reset-hard, clean, untracked, unstaged, uncommitted, self-verification]
status: done
---

# git 콘텐츠 작성 시 untracked ≠ unstaged 혼동

## 문제

위키 엔트리(iOS Harness Journal 025)에서 `git reset --hard`가 폐기하는 대상을 "untracked(git 미추적) 파일"이라고 서술했다. 실제로는 부정확.

## 증상

- 푸시 후 pre-push 리뷰어가 기술 오류 포착: "untracked라면 reset --hard로 안 날아간다. 날아갔다면 tracked 파일의 unstaged 변경이다."
- 엔트리의 핵심 thesis("git이 추적하지 않는 가변 상태")와 incident 서술이 충돌.
- 슬러그까지 `untracked-state`로 잘못 명명 → rename 필요 (역링크 4건 연쇄 수정).

## 해결 (before → after)

**Before** (부정확):
> commit을 안 하니 git이 추적하지 않는다(untracked) → reset/clean에 무방비.

**After** (정정):
> 파일은 git이 *추적(tracked)*한다. 그 한 줄 수정만 commit 안 함 = *영구 unstaged 변경*. reset --hard는 tracked 파일의 커밋 안 된 변경을 폐기하므로 사정권. (untracked였다면 reset엔 살아남고 clean이 죽인다.)

추가로 정밀 구분 표를 본문에 박아 캐치를 교육 자산으로 전환:

| 명령 | 폐기/제거 대상 | 사정권 밖 |
|------|---|---|
| `git reset --hard <ref>` | tracked 파일의 커밋 안 된 변경(staged+unstaged) | untracked 파일 |
| `git clean -fd` | untracked 파일/디렉토리 | tracked 변경 |
| `git stash push -u` | (백업) tracked 커밋 안 된 변경 + untracked 파일 | — |

## 근본 원인

세 용어를 혼용했다:
- **untracked** — git이 한 번도 add 안 한 파일 (`clean`의 사정권)
- **unstaged** — tracked 파일의 수정인데 stage 안 함 (`reset --hard`의 사정권)
- **uncommitted** — 위 둘을 포함하는 상위 개념

콘텐츠 작성 시 git 동작을 *정밀 확인 없이* 직관으로 서술 → "commit 안 함"을 반사적으로 "untracked"로 매핑.

## 체크리스트 (For AI Agents)

- [ ] git 명령의 *사정권*을 서술할 때 `reset --hard`(tracked uncommitted)와 `clean`(untracked)을 구분했는가?
- [ ] "commit 안 함"을 "untracked"로 잘못 매핑하지 않았는가? (tracked 파일의 unstaged 변경일 수 있음)
- [ ] 슬러그/제목의 핵심 용어가 본문 thesis와 일치하는가?
- [ ] git 동작 주장은 직관이 아니라 *실제 동작*으로 검증했는가? (의심되면 `git help reset` 사정권 확인)
- [ ] 처방(`stash push -u`)이 두 영역을 다 덮는지 확인 → 처방은 옳아도 *서술*이 틀리면 KB 신뢰도 하락
