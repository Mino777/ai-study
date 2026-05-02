# /wt-branch — worktree 기반 안전한 새 작업 분기

새 작업을 시작할 때 main에서 직접 작업하지 않고 worktree로 격리.
squash merge 함정을 구조적으로 회피.

## 사용법

```
/wt-branch <branch-name>
/wt-branch feat/new-feature
```

## 실행 절차

### 1. origin/main 최신화

```bash
git fetch origin
```

### 2. worktree 생성

```bash
git worktree add -b <branch-name> /tmp/$(basename $(pwd))-<branch-name> origin/main
```

### 3. 작업 디렉토리 안내

```
작업 디렉토리: /tmp/<project>-<branch-name>
이 디렉토리에서 작업하세요.
완료 후 PR 생성 → squash merge → worktree 정리
```

### 4. 정리 (작업 완료 후)

```bash
git worktree remove /tmp/<project>-<branch-name>
git branch -D <branch-name>
```

## 주의사항

- worktree는 항상 `origin/main` 기준으로 생성 (로컬 main이 아님)
- 작업 완료 후 반드시 worktree 정리
- squash merge 후 로컬 브랜치 삭제 필수 (diverge 방지)
