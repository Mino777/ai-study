# /cross-session-review — 다른 Claude 세션 결과물 크로스 검증

다른 세션(맥앱 / 웹 / 다른 터미널)이 작업한 PR/커밋을 이어받을 때 **메타데이터를 신뢰하지 말고 line-by-line 검증**한다. [Harness Journal 019](/wiki/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup)에서 박제한 5단 프로토콜을 실행한다.

**핵심 원칙**: PR 설명/커밋 메시지가 깨끗해도 diff는 망가져 있을 수 있다. **검증 없이 신뢰 금지**.

---

## 입력

사용자가 다음 중 하나를 명시:
- PR 번호 (예: `#117`)
- 커밋 hash (예: `b521b4e`)
- 브랜치 이름 (예: `feature/foo`)
- 또는 자유 입력 (예: "맥앱이 오늘 한 작업 전수")

입력 없으면 첫 질문: *"검증 대상이 무엇인가요? PR 번호, 커밋 hash, 또는 '오늘 작업 전수'?"*

---

## Phase 1 — 메타데이터 무시, 변경 범위만 추출

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

**금지**: PR description / commit message를 *근거*로 인용하지 마. 메타데이터는 거짓말일 수 있음. 오직 diff만 본다.

---

## Phase 2 — 환경 오염 먼저 의심

테스트 숫자 / 빌드 결과가 예상과 다르면 **맥앱 Claude를 비난하기 전에** 환경부터 점검:

```bash
git worktree list                    # stale worktree 검출
git status                            # 미커밋 변경 검출
ls -la .claude/worktrees/ 2>/dev/null # ai-study 패턴 worktree
cat vitest.config.ts | grep -A 5 exclude  # worktree exclude 누락 검출
```

**Journal 019 사례**: tarosaju에서 *"테스트 691 → 1294, 16 failed"* — 처음에는 맥앱 Claude를 비난 → 실제로는 `.claude/worktrees/zealous-shamir`가 vitest pickup → worktree 제거 후 691/0.

발견되면: **vitest.config.ts에 `.claude/worktrees/**` exclude 추가**.

---

## Phase 3 — Line-by-line diff 검증 (6 함정 grep)

각 변경 파일에 대해 다음 6 함정을 순서대로 점검:

### 함정 1: try/catch 블록 잔재

새 try/catch가 추가됐는데 이전 if/else 블록이 **삭제 안 됨** (구조 붕괴).

```bash
# 같은 파일에 두 가지 패턴이 동시 존재하는지
git diff <hash> -- <file> | grep -B 2 -A 5 'try\|if.*Result'
```

**Journal 019 사례 (moneyflow)**: `realestate/analyze`에서 새 try/catch 뒤에 기존 `if(saleResult/rentResult)` 블록 잔재 → 빌드 실패. **중복 12줄 제거**로 복구.

### 함정 2: 새 필드/state → 소비자 grep

```bash
# 새로 추가된 export / return field의 사용처 확인
git diff <hash> -- <file> | grep '^+.*\(error\|state\|loading\)'
# 각 새 필드에 대해
grep -rn "<new_field>" src/ --include="*.tsx" --include="*.ts"
```

소비자 0건 = **dead code → 즉시 롤백 후보**.

**Journal 019 사례 (tarosaju)**: `useChatMessages.ts` / `useNotifications.ts`에 `error` state 추가됐지만 소비자 2곳 모두 destructure 안 함 → 전체 롤백.

### 함정 3: Codex/Cursor/Cline 자기 정체성 오인용

```bash
# CLAUDE.md / commit message / 새 docs에 다른 도구명 grep
git log --since="today" --pretty=format:"%B" | grep -iE 'codex|cursor|cline|aider'
git diff <hash> -- 'CLAUDE.md' 'docs/**' | grep -iE 'codex|cursor|cline|aider'
```

**Journal 019 사례**: tarosaju CLAUDE.md "Output Review" 섹션 + moneyflow #114 commit message **둘 다** "Codex가 작업을 완료하면..." 박혀 있었음. 같은 모델이 자기를 Codex로 오인.

### 함정 4: 회사 프로젝트명 노출

```bash
git diff <hash> | grep -E 'gma|GreenCar|LOTTIMS'
```

발견되면 익명화 매핑 적용 (메모리 `feedback_company_project_names.md` 참조).

### 함정 5: 가짜 코드 / 환각

```bash
# 새 파일/import에서 실재하지 않는 패키지/API
git diff <hash> | grep '^+.*import' | sort -u
# 각 import에 대해 패키지 존재 검증 (package.json grep)
```

**Journal 019 사례 (ai-study iOS Journal)**: 가상 `IntelligenceKit`, 가짜 `swift-pre-write.sh` PreToolUse 훅, 실재하지 않는 `/ios-compound` 등.

### 함정 6: 자동 수정 도구 silent 손상

자동 lint/format 도구가 작업 중간에 돌면서 파일 손상시켰는지 확인:

```bash
# validate-content.mjs / prettier / eslint --fix 등 자동 수정 후 git diff
npm run validate
git diff
```

수정 결과가 *예상한 수정*인지 확인. 누적 손상 패턴 (따옴표 5개, 중복 줄 등) 발견 시 도구 자체 버그 의심.

---

## Phase 4 — 검증 파이프라인 3단 (CI 위임 금지)

CI가 통과했어도 **로컬에서 다시** 돌린다. CI는 캐시/환경 차이로 거짓 양성 가능.

```bash
# 1. 테스트
npm test         # 또는 vitest run, npx vitest run

# 2. 린트
npm run lint     # 또는 eslint . --max-warnings 0

# 3. 실제 프로덕션 빌드
npm run build    # tsc --noEmit + Next.js build (또는 프로젝트별 빌드)
```

**3단 모두 통과 안 하면 머지 금지**. 부분 통과는 통과가 아님.

---

## Phase 5 — 분류 → 사용자 합의 → 교정 PR

발견한 이슈를 다음 4 카테고리로 분류:

| 카테고리 | 의미 | 처리 |
|---|---|---|
| 🔴 **심각 (block release)** | 빌드 실패 / 데이터 손실 위험 / 보안 | 즉시 교정 PR |
| 🟡 **dead code / 과잉설계** | 작동은 하지만 소비자 0건 | 사용자 합의 → 부분 패치 vs 전체 롤백 결정 |
| 🟢 **정리 (clean-up)** | 동작에 영향 없음, 가독성/일관성 | 다음 사이클에 묶음 |
| ⚪️ **OK (좋은 변경)** | 그대로 유지 | 명시적으로 PR comment에 기록 |

**중요**: 부분 패치 vs 전체 롤백을 한 번에 결정 못 하면 **사용자에게 명시적으로 묻기**:
> *"이 변경은 [패치할까요 / 전체 롤백할까요]? 근거: [...]"*

처리 완료 후:
1. `/wt-branch fix/<scope>-cross-review` — 격리된 브랜치에서 작업
2. 교정 변경 commit
3. PR 생성 + Phase 3 발견 사항 description에 박제 (다음 사이클의 입력)
4. 검증 파이프라인 3단 통과 후 squash merge

---

## 출력 형식

작업 완료 후 다음 형식으로 보고:

```markdown
# 크로스 세션 리뷰: <대상>

## 📊 환경 점검 (Phase 2)
- worktree: [stale 0건 / 발견 N건 → 정리 완료]
- 미커밋 변경: [없음 / 있음 — stash 처리]

## 🔍 6 함정 검증 (Phase 3)
| 함정 | 결과 | 비고 |
|---|---|---|
| 1. try/catch 블록 잔재 | ✅ / ❌ | [상세] |
| 2. dead code (소비자 0) | ✅ / ❌ | [상세] |
| 3. Codex 오인용 | ✅ / ❌ | [상세] |
| 4. 회사 프로젝트명 | ✅ / ❌ | [상세] |
| 5. 가짜 코드/환각 | ✅ / ❌ | [상세] |
| 6. 자동수정 손상 | ✅ / ❌ | [상세] |

## ✔️ 검증 파이프라인 (Phase 4)
- 테스트: PASS / FAIL
- 린트: clean / N warnings
- 빌드: PASS / FAIL

## 🎯 분류 (Phase 5)
- 🔴 심각: N건 — [목록]
- 🟡 dead code: N건 — [목록]
- 🟢 정리: N건 — [목록]
- ⚪️ OK: N건

## 다음 액션
- [교정 PR 생성 / 사용자 합의 대기 / 검증만 통과 / 추가 조사]
```

---

## 트리거 예시

사용자: *"맥앱이 오늘 작업한 거 좀 봐줘"*
→ `/cross-session-review 오늘 작업 전수`

사용자: *"PR #117 머지 전에 검증해줘"*
→ `/cross-session-review #117`

사용자: *"이 커밋 ABC1234 좀 봐줘"*
→ `/cross-session-review ABC1234`

---

## 안티패턴 (절대 하지 마)

- ❌ PR description / commit message를 *근거*로 인용 — 거짓말일 수 있음
- ❌ "테스트 통과했으니 OK" — 환경 오염 가능 (Phase 2 누락)
- ❌ "원본 작업자가 분명 의도가 있었을 것" — 의도 추측 금지, 코드만 본다
- ❌ 발견 사항을 *부분 패치*로만 처리 — 함정 5/6 중 하나라도 있으면 전체 롤백 후보
- ❌ CI에 검증 위임 — 로컬 3단 필수
- ❌ 자기 합의 (사용자 패치/롤백 결정 안 묻고 진행)

---

## 참고

- [Harness Journal 019 — 맥앱 Claude 세션 부산물 크로스 검증](/wiki/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup) — 5단 프로토콜의 출처 + 6 함정의 실제 발견 사례
- 메모리: `feedback_company_project_names.md` — 함정 4의 익명화 매핑
