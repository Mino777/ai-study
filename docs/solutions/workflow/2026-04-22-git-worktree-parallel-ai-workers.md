---
date: 2026-04-22
category: workflow
tags: [git-worktree, parallel-agents, bash, tmux]
applicable_to: ["any"]
---

# 병렬 AI 워커의 git index 오염 — worktree 격리로 해결

## 문제

병렬 AI 워커(domain-worker + ui-worker)가 동일 git 저장소에서 동시에 작업 시:
- 한 워커의 `git add / commit`이 다른 워커의 staged 파일을 덮어씀
- `git status`가 양쪽 워커의 변경 내용을 섞어서 보여줌
- Layer Split 전략에서 도메인/UI 커밋이 서로 간섭

## 증상

```bash
# domain-worker가 Entity.swift를 stage했는데
# ui-worker의 git status에도 Entity.swift가 staged로 보임
git status  # → 양쪽 워커에서 동일한 staging area 공유
```

## 해결

각 워커를 별도 git worktree에서 실행. worktree는 독립된 working tree + branch를 가지므로 index 공유 없음.

### Before

```bash
# 모든 워커가 PROJECT_DIR에서 작업
cd "$PROJECT_DIR"
tmux send-keys -t domain-worker "cd $PROJECT_DIR && [작업]" Enter
tmux send-keys -t ui-worker "cd $PROJECT_DIR && [작업]" Enter
# → 동일 git index 공유 → 오염
```

### After

```bash
create_worker_worktree() {
  local wo_num=$1 role=$2
  local branch="wo/${wo_num}-${role}"
  local wt_path="/tmp/${REPO_NAME}-wo-${wo_num}-${role}"

  cd "$PROJECT_DIR" || exit 1
  git worktree remove --force "$wt_path" 2>/dev/null || true
  git branch -D "$branch" 2>/dev/null || true
  git worktree add -b "$branch" "$wt_path" 2>&1 | grep -v "^Preparing"

  # WO 파일 복사 + inbox 심볼릭링크
  cp "$WO_FILE" "$wt_path/work-orders/in-progress/"
  ln -sf "$PROJECT_DIR/inbox" "$wt_path/inbox" 2>/dev/null || true

  echo "$wt_path"  # caller가 캡처할 경로만 stdout
}

# 호출
wt_path=$(create_worker_worktree "$wo_num" "domain" | tail -1)
tmux send-keys -t domain-worker "cd $wt_path && [작업]" Enter
```

워크트리 정리 (작업 완료 후):

```bash
wo_merge() {
  local wo_num=$1; local role=$2
  local branch="wo/${wo_num}-${role}"
  local wt_path="/tmp/${REPO_NAME}-wo-${wo_num}-${role}"

  cd "$PROJECT_DIR" || exit 1
  git merge --no-ff "$branch" -m "[WO-${wo_num}] merge ${role} layer"
  git worktree remove --force "$wt_path" 2>/dev/null || true
  git branch -d "$branch" 2>/dev/null || true
}
```

## 근본 원인

git worktree 없이 멀티 에이전트를 한 저장소에서 실행하면 index(`PROJECT_DIR/.git/index`)가 공유됨. `git add`는 프로세스 간 동기화 없이 index 파일을 직접 수정하므로 race condition 발생.

## 핵심 제약

- 워커 프롬프트의 `./architect-cli.sh` → `${ARCH_CLI}` (절대 경로) 로 교체 필수. worktree는 다른 디렉토리이므로 상대 경로 불가.
- 함수의 stdout은 호출부가 캡처할 값(경로)만 출력. 로그/상태 메시지는 `>&2`. 섞이면 `$(cmd)` 캡처 오염.
- `inbox/` 심볼릭링크: 워커가 자문 파일을 쓸 때 아키텍트가 감지할 수 있도록 PROJECT_DIR/inbox로 연결.

## 체크리스트

- [ ] `create_worker_worktree` 호출 시 `| tail -1`로 경로만 추출
- [ ] 워커 프롬프트에 `${ARCH_CLI}` 절대 경로 변수 사용
- [ ] dispatch 함수에서 worktree 생성 → cd → 작업 → merge → cleanup 순서 준수
- [ ] `wo_merge()` 호출을 `wo-done` 커맨드 전에 수행
- [ ] Layer Split: `wo/N-domain` + `wo/N-ui` 두 브랜치 모두 머지 후 워크트리 제거
