# MDX JSX 파싱 함정 — 인라인 {} + <숫자 패턴

**날짜**: 2026-04-12
**발생 파일**: `content/harness-engineering/harness-journal-015-trader-runtime-validation.mdx`

## 문제

MDX 컴파일러가 본문 텍스트의 `{...}`를 JSX expression으로, `<숫자`를 JSX 태그 시작으로 해석해서 컴파일 실패.

## 증상

```
❌ Unexpected character `3` (U+0033) before name,
   expected a character that can start a name, such as a letter, `$`, or `_`
```

## 원인 2가지

### 1) 인라인 `{...}` → JSX expression

```markdown
<!-- ❌ 인라인 code backtick 안이어도 실패할 수 있음 -->
`price_targets{bull_case, base_case, bear_case}`

<!-- ✅ 괄호로 교체 -->
`price_targets` (bull_case / base_case / bear_case)
```

### 2) `<숫자` → JSX 태그 시작

```markdown
<!-- ❌ MDX가 <3을 JSX element 시작으로 해석 -->
worktree 수가 <3으로 내려오면

<!-- ✅ code backtick으로 감싸기 -->
worktree 수가 `< 3`으로 내려오면

<!-- ✅ 자연어로 교체 -->
worktree 수가 3 이하로 내려오면
```

## Before / After

Before: `npm run build` → prebuild → validate-content.mjs → MDX compile error → exit 1 → Test Gate 실패 → 자동 머지 차단 → 원인 파악 → 수정 → 재push (불필요한 2 push)

After: 작성 시 사전 grep으로 잡음 → 1 push에 통과

## 사전 탐지 방법

```bash
# MDX 파일 작성 후 commit 전에 실행
grep -n '<[0-9]' content/path/to/file.mdx
grep -n '{[a-z0-9_]' content/path/to/file.mdx
```

매칭되면 해당 라인을 확인해서 code fence 안인지 본문인지 판별.

## 체크리스트

- [ ] MDX 본문에 `{...}` 사용 시 → 코드 펜스(```) 블록 안에만. 인라인 backtick은 불안전.
- [ ] MDX 본문에 `<숫자` 또는 `<영문자(비-component)` → code backtick으로 감싸거나 자연어 교체
- [ ] commit 전 `grep -n '<[0-9]' file.mdx` + `grep -n '{[a-z0-9_]' file.mdx` 실행
- [ ] `validate-content.mjs`에 이 패턴 사전 경고 추가 검토 (큐에 있음)

## 관련

- 메모리: `project_ai_generated_mdx_guards.md` — 패턴 3+4로 박제
- 기존 MDX 에러 패턴: `<br>` self-closing (#1), Mermaid subgraph 공백 (#2)
