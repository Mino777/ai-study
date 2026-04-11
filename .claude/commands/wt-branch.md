# /wt-branch — worktree 기반 안전한 새 작업 분기

새 작업을 시작할 때 항상 이 커맨드를 사용한다. **로컬 git 상태와 무관하게 origin/main에서 깨끗한 worktree를 만든다.**

이 커맨드는 [Harness Journal 003](/wiki/harness-engineering/harness-journal-003-squash-merge-trap-pattern)에서 박제한 *AI 자동 squash merge 함정*을 시스템 차원에서 회피하기 위한 패턴이다. *행동 자체*를 안전하게 만들어 사람의 기억력 의존을 0으로 만든다.

## 호출 방식

```
/wt-branch <branch-name>
/wt-branch                       # 인자 없으면 사용자에게 브랜치 이름 질문
```

## 왜 이 커맨드가 필요한가

AI 자동 squash merge(예: `ai-review.yml`)는 origin 상태를 변경하지만 **로컬 git 상태는 그것을 모른다**. 새 작업을 옛 브랜치 위에 쌓으면 다음 push에서 100% rebase 충돌이 발생한다.

같은 사고가 [Journal 002](/wiki/harness-engineering/harness-journal-002-inline-test-gate)와 [Journal 003](/wiki/harness-engineering/harness-journal-003-squash-merge-trap-pattern)에서 두 번 라이브 발생했다 — *다른 세션*에서도 동일하게. 이건 우연이 아닌 시스템 결함이다.

회피 메커니즘 4가지 비교:
| 후보 | 임팩트 | 사람 행동 의존 |
|---|---|---|
| ai-review 머지 후 코멘트 | 중간 | 있음 (PR을 봐야 함) |
| AI-AGENT-GUIDE 패턴 박기 | 중간 | 있음 (AI가 패턴 *따라야* 함) |
| **`/wt-branch` 슬래시 커맨드** | **매우 높음** | **없음** (행동 자체가 안전) |
| post-merge git hook | 낮음 | 있음 |

`/wt-branch`는 *행동에 박는 가드*이므로 기억력 의존이 0이다.

---

## Phase 0: 사전 점검

시작 전 다음을 확인한다:

- [ ] 인자(branch-name)가 있는가? 없으면 사용자에게 질문.
- [ ] 브랜치 이름이 valid한가? (lowercase, hyphen, 영문/숫자만 — `^[a-z0-9][a-z0-9-]*$`)
- [ ] 같은 이름의 브랜치가 이미 origin 또는 로컬에 있는가? 있으면 중단하고 알림.
- [ ] `/tmp/<project>-<branch>` 디렉터리가 이미 존재하는가? 있으면 다른 이름 제안 또는 정리 권장.

## Phase 1: 프로젝트 루트 식별

```bash
git rev-parse --show-toplevel
```

이 결과를 `<project-root>`로 사용한다. 호출이 어떤 디렉터리에서 발생했든 무관하게 *진짜 프로젝트 루트*를 잡는다.

`<project-name>`은 `<project-root>`의 마지막 path component (예: `mino-moneyflow`).

## Phase 2: origin 동기화

```bash
git -C <project-root> fetch origin
```

이 단계가 *반드시* 먼저 와야 한다. fetch 없이 origin/main에서 분기하면 *로컬이 본 origin/main*이 *실제 origin/main*과 다를 수 있음.

## Phase 3: worktree 분기

```bash
git -C <project-root> worktree add -b <branch-name> /tmp/<project-name>-<branch-name> origin/main
```

성공하면 `/tmp/<project-name>-<branch-name>`에 깨끗한 origin/main 복사본 + 새 브랜치가 만들어진다.

## Phase 4: 사용자 안내

다음 메시지를 출력:

```
✅ worktree 준비 완료

워크 디렉터리:  /tmp/<project-name>-<branch-name>
브랜치:          <branch-name>
기준점:          origin/main (방금 fetch한 최신)

이 디렉터리에서 작업하세요. 모든 git 명령은 다음 형식으로:
  git -C /tmp/<project-name>-<branch-name> <command>
또는 cd로 이동:
  cd /tmp/<project-name>-<branch-name>

작업 종료 + push 후 정리:
  git -C <project-root> worktree remove /tmp/<project-name>-<branch-name>
```

## Phase 5: 작업 진행 (이후 사용자/AI의 작업)

이후의 모든 변경은 worktree 디렉터리에서 일어난다:

1. 새 worktree에서 변경 + commit
2. `git -C /tmp/<project-name>-<branch-name> push -u origin <branch-name>`
3. `ai-review.yml` 등 자동 머지 흐름이 *깨끗한 origin/main 위에서* 정상 작동
4. 머지 완료 후 worktree 정리

## 금지 사항

다음 행위는 **절대** 하지 않는다:

1. **원본 working tree의 변경(stage, modified, untracked)을 worktree로 옮기기** ❌
   - 그 변경은 *사용자/다른 세션의 작업*일 수 있음. 의도를 모르는 채 옮기면 손상.
2. **worktree 작업 도중 원본 working tree를 만지기** ❌
   - 두 곳을 동시에 만지면 또 다른 함정.
3. **사용자 승인 없이 worktree 자동 remove** ❌
   - 머지 완료 확인 후에만 정리.
4. **Phase 2(fetch)를 생략** ❌
   - 이걸 생략하면 회피 메커니즘 자체가 무력화.
5. **`<project-root>` 추측** ❌
   - 반드시 `git rev-parse --show-toplevel`로 확인.

## 성공 조건

이 커맨드는 다음을 달성해야 한다:

- 새 작업이 *origin/main에서 깨끗하게* 분기됨
- 원본 working tree 영향 0
- 사용자가 작업 완료 후 정상적으로 worktree를 정리할 수 있음
- *Journal 002/003의 squash merge 함정이 구조적으로 발생 불가*

## 양쪽 프로젝트 이식 가이드

이 커맨드는 ai-study 외에 mino-moneyflow, mino-tarosaju에도 동일한 형식으로 이식해야 한다.

이식 시 변경 필요 부분:
- 없음. 이 파일은 *프로젝트 무관*하게 작성됨 (Phase 1에서 자동으로 project root 감지)

이식 방법:
```bash
cp /Users/jominho/Develop/ai-study/.claude/commands/wt-branch.md \
   <other-project>/.claude/commands/wt-branch.md
```

CLAUDE.md skill routing 추가:
```markdown
- 새 작업 시작, 안전한 브랜치 분기 → invoke wt-branch
```

이식 완료 후 dogfooding:
- 첫 새 작업을 `/wt-branch <name>`으로 시작해서 사고 없는 사이클을 만든다
- 결과를 다음 Harness Journal에 박제

## 부작용 검토

- **디스크 공간**: 두 working tree(원본 + worktree)가 동시에 존재. 단, 작업 종료 후 정리.
- **IDE/에디터**: 새 worktree 디렉터리를 별도로 열어야 함. 또는 IDE의 multi-root 기능 활용.
- **작업 흐름 변화**: 모든 새 작업이 이 커맨드를 거치도록 *AI 협업 헌장(CLAUDE.md / AI-AGENT-GUIDE.md)*에 명시 필요.
