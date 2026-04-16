# MDX JSX 파싱 함정 — 인라인 {} + <숫자 + <소문자 패턴

**날짜**: 2026-04-12 (원본) / 2026-04-17 (패턴 #3 보강)
**발생 파일**:
- 2026-04-12: `content/harness-engineering/harness-journal-015-trader-runtime-validation.mdx`
- 2026-04-17: `content/backend-ai/pg-trgm-gin-index-for-like-search.mdx`

## 문제

MDX 컴파일러가 본문 텍스트의 `{...}`를 JSX expression으로, `<숫자`를 JSX 태그 시작으로 해석해서 컴파일 실패.

## 증상

```
❌ Unexpected character `3` (U+0033) before name,
   expected a character that can start a name, such as a letter, `$`, or `_`
```

## 원인 3가지

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

### 3) `<소문자>` → JSX/HTML 태그 (void element 이름과 겹치면 더 치명적)

HTML void element 이름(`col`, `row`, `link`, `img`, `br`, `hr`, `area`, `base`, `embed`, `input`, `meta`, `param`, `source`, `track`, `wbr`)이 prose 에 그대로 나타나면 MDX가 이를 self-closing 태그로 해석하려다 `Expected a closing tag for <col>` 같은 에러를 낸다.

```markdown
<!-- ❌ MDX가 <col>을 HTML col element로 해석. 패턴이 "짧은 영단어"일수록 위험 -->
4. **CREATE INDEX USING gin (<col> gin_trgm_ops)** — 오퍼레이터 클래스 필수

<!-- ✅ 인라인 코드 안에 포함시키면 MDX 파서가 파싱 시도 안 함 -->
4. **`CREATE INDEX USING gin (<col> gin_trgm_ops)`** — 오퍼레이터 클래스 필수

<!-- ✅ 또는 꺾쇠 없는 플레이스홀더로 교체 -->
4. **CREATE INDEX USING gin ({컬럼명} gin_trgm_ops)**  ← {}도 위험하니 지양
5. **CREATE INDEX USING gin (<컬럼명> gin_trgm_ops)**  ← 한글은 JSX로 해석 안 됨 (안전)
```

**일반 영문 단어**(`<type>`, `<name>` 같은 placeholder 패턴)도 동일 위험. 꺾쇠를 써야 하면 반드시 인라인 코드로 감싸거나 한글/대괄호 등 비-JSX 문법으로 대체.

## Before / After

Before: `npm run build` → prebuild → validate-content.mjs → MDX compile error → exit 1 → Test Gate 실패 → 자동 머지 차단 → 원인 파악 → 수정 → 재push (불필요한 2 push)

After: 작성 시 사전 grep으로 잡음 → 1 push에 통과

## 사전 탐지 방법

```bash
# MDX 파일 작성 후 commit 전에 실행 (3 패턴 커버)
grep -n '<[0-9]' content/path/to/file.mdx                # 패턴 2 (<숫자)
grep -n '{[a-z0-9_]' content/path/to/file.mdx            # 패턴 1 ({...})
grep -nE '<(col|row|link|img|br|hr|area|base|embed|input|meta|param|source|track|wbr)>' content/path/to/file.mdx  # 패턴 3 (<void-element>)
```

매칭되면 해당 라인을 확인해서 code fence 안인지 본문인지 판별.

## 체크리스트

- [ ] MDX 본문에 `{...}` 사용 시 → 코드 펜스(```) 블록 안에만. 인라인 backtick은 불안전.
- [ ] MDX 본문에 `<숫자` 또는 `<영문자(비-component)` → code backtick으로 감싸거나 자연어 교체
- [ ] MDX 본문에 HTML void element 이름(`<col>`, `<link>`, `<row>` 등) → 반드시 인라인 코드로 감싸기
- [ ] commit 전 위 3개 grep 명령 실행 (빌드 실패 방지)
- [ ] `validate-content.mjs`에 이 패턴 사전 경고 추가 검토 (큐에 있음)

## 관련

- 메모리: `project_ai_generated_mdx_guards.md` — 패턴 3+4로 박제
- 기존 MDX 에러 패턴: `<br>` self-closing (#1), Mermaid subgraph 공백 (#2)
