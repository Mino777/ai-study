# /projects-sync — 허브 세션의 워커 프로젝트 read-only 진단

이 ai-study 세션은 *허브*로서 mino-moneyflow, mino-tarosaju 두 *워커* 프로젝트를 분석/연구한다.
두 프로젝트는 각자 별도 Claude 세션이 동시에 작업할 수 있다.

이 커맨드는 **쓰기 0, 읽기만** 수행하는 안전한 진단 도구다.
호출하면 양쪽 워커 프로젝트의 현재 상태를 한 번에 리포트한다.

## 호출 방식

```
/projects-sync
/projects-sync moneyflow        # 한 쪽만
/projects-sync tarosaju         # 한 쪽만
```

## 왜 이 커맨드가 필요한가

*Journal 003의 squash merge 함정* + *다른 세션이 동시에 작업 중일 가능성* 두 위험이 겹쳐,
허브 세션이 뭘 만지기 전에 *정확히 지금 origin이 어떤 상태인지*를 봐야 한다.

이전 세션의 NEXT.md는 다음 리듬을 권장한다:
```bash
rtk git -C /Users/jominho/Develop/mino-moneyflow fetch origin
rtk git -C /Users/jominho/Develop/mino-tarosaju fetch origin
rtk git -C /Users/jominho/Develop/mino-moneyflow log origin/main --oneline -5
rtk git -C /Users/jominho/Develop/mino-tarosaju log origin/main --oneline -5
```

이 4개의 명령을 *한 커맨드*로 묶고, 추가로 *내가 모르는 변화*(다른 세션 흔적)를 감지한다.

## 커맨드 범위

### 1. Fetch + 상태 스냅샷

양쪽 프로젝트 각각:

```bash
rtk git -C <project-root> fetch origin
rtk git -C <project-root> status -sb
rtk git -C <project-root> log origin/main --oneline -10
```

* `status -sb`는 branch 상태(ahead/behind) + 간단한 변경 목록을 한 화면에 담는다.
* `log --oneline -10`은 origin/main의 최근 10개 commit을 본다.

### 2. Local main ↔ origin/main 차이

```bash
rtk git -C <project-root> rev-list --left-right --count main...origin/main
```

* `A B` 형태로 출력: A=local에만 있는 commit 수, B=origin에만 있는 commit 수.
* `0 0` → 동기화 완료. `0 N` → local이 N만큼 뒤처짐(behind). `N 0` → local이 N만큼 앞섬(ahead). `N M` → diverge.

### 3. worktree 잔여물 감지

```bash
rtk git -C <project-root> worktree list
```

* `/tmp/<project>-*` 경로가 있으면 이전 세션(또는 다른 세션)이 아직 정리 안 한 worktree.
* 감지되면 *삭제는 하지 않고* 목록만 리포트.

### 4. 최근 PR 상태

```bash
rtk gh pr list -R Mino777/mino-moneyflow --state all --limit 5
rtk gh pr list -R Mino777/mino-tarosaju --state all --limit 5
```

* 양쪽 최근 5개 PR — open/merged/closed 전체. 다른 세션이 PR을 올렸는지 감지.

### 5. 다른 세션 작업 흔적 감지

다음 중 하나라도 해당되면 *"다른 세션 작업 중 가능성 높음"* 경고를 출력:

* `status -sb`에 `[ahead N]` 또는 `[behind N]` 또는 `[ahead N, behind M]`이 있음
* PR list에 **open** 상태 PR이 있고, 그 PR의 branch가 `main` 이외이며 HEAD가 최근(최근 24시간 내) push
* `worktree list`에 `/tmp/<project>-*` 경로가 2개 이상
* status에 modified 파일 또는 untracked 파일이 있음 (*단, .claude/worktrees/ .claude/projects/ 같은 AI session artifact는 경고 대상에서 제외*)

### 6. 메시지 큐 확인

양쪽 프로젝트의 `messages/` 디렉토리에서 미읽은 메시지를 확인한다.

```bash
# 허브 messages/ 에서 워커→허브 미읽은 메시지
for f in messages/*-to-hub-*.json; do
  # read: false 인 것만 필터
done

# 워커 messages/ 에서 허브→워커 미읽은 메시지
for project in mino-moneyflow mino-tarosaju; do
  for f in /Users/jominho/Develop/$project/messages/hub-to-*.json; do
    # read: false 인 것만 필터
  done
done
```

* 미읽은 메시지가 있으면 리포트에 `📨 메시지 큐` 섹션으로 표시
* 메시지 내용은 요약만 보여주고, 전체 내용은 `/message read`로 확인
* messages/ 디렉토리가 없으면 "메시지 큐 미설정" 표시 (에러 아님)

### 7. 구조화된 리포트

최종 출력은 다음 형식:

```
📸 프로젝트 스냅샷 — 2026-MM-DD HH:MM

mino-moneyflow (✅ | ⚠️)
──────────────────────
  origin 최신:       f3ed55c feat(ai): AI API 비용 추적 인프라 — Harness Journal 008 (#95)
  local main:        f3ed55c (동기화 완료)
  ahead/behind:      0 / 0
  worktree 잔여물:   없음
  최근 open PR:      없음
  다른 세션 흔적:    없음

mino-tarosaju (⚠️ 주의)
──────────────────────
  origin 최신:       34d8213 feat(ai): text output guards — Harness Journal 009 (#5)
  local main:        34d8213
  ahead/behind:      0 / 0
  worktree 잔여물:   /tmp/mino-tarosaju-ai-ops/feature-x (다른 세션 작업 중 가능성)
  최근 open PR:      #6 WIP fix: something (2시간 전 push)
  다른 세션 흔적:    ⚠️ open PR + worktree 잔여물 감지

요약: moneyflow는 안전. tarosaju는 다른 세션 작업 가능성 높음 — 만지기 전 확인.
```

## 금지 사항

다음 행위는 **절대** 하지 않는다:

1. **worktree 자동 정리** ❌ — 다른 세션 작업일 수 있음. 삭제는 사용자 명시 요청 시에만.
2. **pull / merge / reset** ❌ — 이 커맨드는 read-only. 상태 동기화는 별도 조치.
3. **push / commit** ❌ — 명시적으로 write 금지.
4. **modified 파일의 내용을 바꾸는 것** ❌ — modified는 리포트만.

## 성공 조건

* 양쪽 프로젝트 상태를 한 화면에 보여줌
* 다른 세션 작업 흔적이 있으면 경고
* 쓰기 0 — 이 커맨드 실행 후 양쪽 프로젝트의 git 상태는 *fetch한 것 외에는* 변화 없음

## 부작용 검토

* `git fetch origin`은 local ref 업데이트 — 이건 의도된 효과. origin/main 업데이트만 있고 working tree는 무관.
* `gh pr list`는 GitHub API 호출 — rate limit 안에서 안전.
* 이 커맨드 자체는 여러 번 빠르게 돌려도 안전.

## 양쪽 워커 프로젝트 관점

이 커맨드는 *ai-study 전용*이다. 워커 프로젝트에는 이식하지 않는다.
워커들은 각자의 `/wt-branch`로 작업을 시작하고, 허브는 `/projects-sync`로 그들의 상태를 관찰한다.
두 역할은 분리되어 있다.
