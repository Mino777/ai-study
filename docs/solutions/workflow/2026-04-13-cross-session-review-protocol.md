# 다른 Claude 세션 결과물 크로스 검증 5단 프로토콜

**카테고리**: workflow
**날짜**: 2026-04-13
**프로젝트**: ai-study (3 프로젝트 동시 발생: ai-study + mino-moneyflow + mino-tarosaju)
**관련 파일**: `.claude/commands/cross-session-review.md`, `content/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup.mdx`

---

## 문제

맥앱 Claude / 웹 Claude / 다른 터미널 세션이 작업한 PR/커밋을 이어받을 때, **PR 설명과 커밋 메시지가 깨끗해도 실제 diff는 망가져 있는 경우**가 일관되게 발생.

### 증상 (3 프로젝트 동시 발견, 2026-04-13)

#### tarosaju
- PR #17 "P0 안정성 이슈 3개 수정" — 메시지는 깨끗 → 실제로는 5 심각 + 2 정리 발견
  - NOT NULL 마이그레이션이 무조건 ALTER (백필 확인 누락) → 배포 직전
  - Realtime retry 과잉설계 + dead code (소비자 0건)
  - CLAUDE.md "Codex가 작업을 완료하면..." 자기 정체성 오인용
  - stale worktree(`.claude/worktrees/zealous-shamir`)가 vitest pickup → 가짜 16 failed

#### moneyflow
- PR #114 "Promise 타임아웃 래퍼 적용" → 30분 후 PR #115 자가 fix
  - `realestate/analyze` 빌드 실패 (try/catch 추가했는데 기존 if 블록 삭제 누락)
  - tsc 11 errors (제네릭 헬퍼 호출부 명시 annotation에서 타입 붕괴)
  - commit message에 "Codex가 작업을 완료하면..." 박혀 있음 (tarosaju와 같은 패턴)

#### ai-study
- 학습 히트맵 요일 정렬 X / 탭 라벨 / apple-intelligence MDX 손상
- iOS Journal 6편에 가짜 코드 / 가짜 카운트 / 허구 스킬 / 가짜 backdate
- validate-content.mjs slicing offset 버그가 silent 파일 손상 누적

## 근본 원인 — 6 공통 함정 패턴

### 1. PR 메타데이터 거짓말
PR description / commit message는 깔끔한데 실제 diff는 망가져 있음. 메타데이터 작성은 LLM이 전체 의도를 *요약*하지만 실제 diff는 부분적일 수 있음.

### 2. 과잉설계 + 소비자 0건
새로운 `error` state / retry 로직 / fallback을 추가했는데 사용 측 코드에서 destructure조차 안 함 → dead code.

### 3. 빌드/타입 검증 누락 머지
`npm run build` / `tsc --noEmit` 안 돌리고 PR 머지. 30분 안에 자가 fix 사이클 발생.

### 4. Codex / Cursor / Cline 자기 정체성 오인용
같은 날 두 프로젝트에서 모델이 자기를 다른 도구로 칭하는 텍스트가 commit message + CLAUDE.md에 박혀 머지됨. 가설: 맥앱 환경 변수가 시스템 프롬프트에 다른 도구 관련 컨텍스트를 누설.

### 5. Stale worktree 환경 오염
`.claude/worktrees/<name>` 안의 과거 코드 스냅샷이 vitest pickup되어 *가짜 실패*. 사용자가 처음에는 *"AI가 코드 깼다"*고 비난 → 실제로는 환경 오염.

### 6. 자동 수정 도구 silent 파일 손상
linter / formatter / 자동 수정 도구가 자체 버그로 파일을 silent하게 손상. 누적되면 복구 불가능.

## 해결 — 5단 프로토콜

### Phase 1: 메타데이터 무시, 변경 범위만 추출

```bash
# PR 번호인 경우
gh pr view <num> --json files,additions,deletions
gh pr diff <num>

# 커밋 hash인 경우
git show <hash> --stat
git show <hash>

# "오늘 작업 전수"인 경우
git log --since="today 00:00" --pretty=format:"%h %s"
git log --since="today 00:00" --stat
```

**금지**: PR description / commit message를 *근거*로 인용 X. 오직 diff만.

### Phase 2: 환경 오염 먼저 의심

```bash
git worktree list                          # stale 검출
git status                                  # 미커밋 변경
ls -la .claude/worktrees/ 2>/dev/null      # ai-study 패턴
cat vitest.config.ts | grep -A 5 exclude   # exclude 누락
```

테스트 숫자가 이상하면 **AI 비난 전에 환경부터** 점검. tarosaju의 *"691 → 1294, 16 failed"*는 환경 오염이었음 (worktree 제거 후 691/0).

### Phase 3: Line-by-line diff 검증 (6 함정 grep)

각 변경 파일에 대해:

```bash
# 함정 1: try/catch 블록 잔재
git diff <hash> -- <file> | grep -B 2 -A 5 'try\|if.*Result'

# 함정 2: 새 필드/state → 소비자 0건 검출
git diff <hash> -- <file> | grep '^+.*\(error\|state\|loading\)'
grep -rn "<new_field>" src/ --include="*.tsx" --include="*.ts"

# 함정 3: 자기 정체성 오인용
git log --since="today" --pretty=format:"%B" | grep -iE 'codex|cursor|cline|aider'
git diff <hash> -- 'CLAUDE.md' 'docs/**' | grep -iE 'codex|cursor|cline|aider'

# 함정 4: 사설 식별자 노출 (금지 패턴 정확한 목록은 메모리 feedback_company_project_names.md 참조)
git diff <hash> | grep -E '<사설 식별자 정규식>'

# 함정 5: 가짜 코드 / 환각
git diff <hash> | grep '^+.*import' | sort -u
# 각 import에 대해 패키지 존재 검증

# 함정 6: 자동 수정 도구 silent 손상
npm run validate
git diff
```

### Phase 4: 검증 파이프라인 3단 (CI 위임 금지)

CI가 통과했어도 **로컬에서 다시** 돌린다:

```bash
npm test         # 1. 테스트
npm run lint     # 2. 린트
npm run build    # 3. 실제 프로덕션 빌드 (tsc + 빌드)
```

3단 모두 통과 안 하면 머지 금지.

### Phase 5: 분류 → 사용자 합의 → 교정 PR

| 카테고리 | 의미 | 처리 |
|---|---|---|
| 🔴 심각 (block release) | 빌드 실패 / 데이터 손실 / 보안 | 즉시 교정 PR |
| 🟡 dead code / 과잉설계 | 작동은 하지만 소비자 0건 | 사용자 합의 → 부분 패치 vs 전체 롤백 |
| 🟢 정리 (clean-up) | 동작 영향 없음 | 다음 사이클에 묶음 |
| ⚪️ OK (좋은 변경) | 유지 | PR comment에 명시 |

부분 패치 vs 전체 롤백을 한 번에 결정 못 하면 **사용자에게 명시적으로 묻기**:
> *"이 변경은 [패치할까요 / 전체 롤백할까요]? 근거: [...]"*

## 자동화 — `/cross-session-review` 슬래시 커맨드

위 5단을 `.claude/commands/cross-session-review.md`로 박제. 트리거:

- `/cross-session-review #117` — PR 번호
- `/cross-session-review b521b4e` — 커밋 hash
- `/cross-session-review 오늘 작업 전수` — 시간 범위

CLAUDE.md skill routing 등록: *"다른 Claude 세션(맥앱/웹/다른 터미널) PR/커밋 검증, 크로스 세션 리뷰 → invoke cross-session-review"*

## 안티패턴

- ❌ PR description / commit message를 *근거*로 인용
- ❌ "테스트 통과했으니 OK" — 환경 오염 가능
- ❌ "원본 작업자가 분명 의도가 있었을 것" — 의도 추측 금지
- ❌ 부분 패치만 — 함정 5/6 중 하나라도 있으면 전체 롤백 후보
- ❌ CI에 검증 위임 — 로컬 3단 필수
- ❌ 자기 합의 — 사용자 결정 안 묻고 진행

## 체크리스트

- [ ] PR 설명을 *근거*로 쓰지 않았다
- [ ] `git worktree list` 확인했다
- [ ] 6 함정 grep을 모두 돌렸다
- [ ] 로컬 빌드 파이프라인 3단 통과
- [ ] 발견 사항을 4 카테고리로 분류했다
- [ ] 부분 패치 vs 전체 롤백을 사용자에게 명시적으로 물었다
- [ ] 교정 PR description에 6 함정 결과 박제

## 관련

- `.claude/commands/cross-session-review.md` (5단 프로토콜 슬래시 커맨드)
- `content/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup.mdx` (3 프로젝트 동시 발생 사례)
- `tarosaju docs/retros/2026-04-13-mcapp-cleanup.md` (tarosaju 측 회고)
