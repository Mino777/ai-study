# 자동 수정 도구의 silent 파일 손상 — slicing offset + regex 누적

**카테고리**: workflow
**날짜**: 2026-04-13
**프로젝트**: ai-study
**관련 파일**: `scripts/validate-content.mjs`, `scripts/lib/mermaid-fix.mjs`, `scripts/__tests__/validate-content.test.mjs`

---

## 문제

`scripts/validate-content.mjs`는 MDX 파일을 검증하면서 mermaid 블록의 노드 라벨 괄호를 **자동으로 따옴표로 감싸는** 로직(`fixAndValidateMermaid`)을 포함한다. 두 가지 silent 손상 버그가 동시에 존재했다:

### 증상

1. **`apple-intelligence-api.mdx` §3 Writing Tools 섹션이 알 수 없는 이유로 손상됨**
   - mermaid 블록이 Swift 코드 블록 시작부에 잘못 끼어들어가 있음
   - acorn 파서 에러: `Could not parse expression with acorn` (line 168 col 15)
   - MDX 컴파일 에러로 production 페이지가 fallback raw text로 렌더

2. **다른 mermaid 블록에서 5-quote 누적 흔적 발견**
   - `D[""""perform() 실행""""]` 같은 패턴
   - 매 빌드 실행마다 따옴표가 1쌍씩 늘어남

## 근본 원인

### 버그 1 — slicing offset 어긋남

`fixAndValidateMermaid`가 mermaid 블록을 자동 수정한 후 파일에 write-back하는 로직:

```javascript
// ❌ Before (buggy)
const { content } = matter(raw);  // content = frontmatter 제거 후
const blocks = extractMermaidBlocks(content);

for (const block of blocks) {
  const { fixed, autoFixed } = fixAndValidateMermaid(block.code);
  if (autoFixed) {
    // ⚠️ content에서 indexOf 찾고
    const oldBlockStart = content.indexOf(`\`\`\`mermaid\n${block.code}`);
    const oldBlockEnd = oldBlockStart + `\`\`\`mermaid\n${block.code}\`\`\``.length;
    // ⚠️ raw에 슬라이싱 적용
    raw = raw.substring(0, oldBlockStart)
        + `\`\`\`mermaid\n${fixed}\`\`\``
        + raw.substring(oldBlockEnd);
  }
}
fs.writeFileSync(file, raw);
```

`oldBlockStart`는 `content`(frontmatter 제거 후) 기준 offset인데, slicing은 `raw`(frontmatter 포함) 기준으로 적용. **frontmatter 길이만큼 offset이 어긋남** (~500 chars). 결과: 슬라이싱이 frontmatter 끝 + 본문 시작 영역을 잘라내고 mermaid 블록을 잘못된 위치에 삽입 → 파일 다른 부분이 손상됨.

### 버그 2 — 정규식 누적 매치

```javascript
// ❌ Before (buggy)
fixed = fixed.replace(
  /([A-Z]\d*)\[([^\[\]]*\([^\[\]]*\)[^\[\]]*)\]/g,
  '$1["$2"]'
);
```

이 regex는 *이미 따옴표로 감싸진 라벨*도 매치한다 (괄호가 여전히 있으니까):

- 1회 실행: `D[perform() 실행]` → `D["perform() 실행"]` ✓
- 2회 실행: `D["perform() 실행"]` → `D[""perform() 실행""]` ✗
- 3회 실행: `D[""x""]` → `D["""""x"""""]` ✗
- ... 매 실행마다 따옴표 5쌍씩 누적

여러 빌드를 거치면서 누적 손상이 쌓임.

## 해결

### Before / After

#### 버그 1 fix — `raw.indexOf(...)`

```javascript
// ✅ After
if (autoFixed) {
  // ⚠️ raw(frontmatter 포함) 기준으로 검색해야 슬라이싱 오프셋이 정확함.
  //    content(frontmatter 제거 후) 기준으로 검색하면 오프셋이 frontmatter 길이만큼
  //    어긋나서 파일이 손상됨 (apple-intelligence-api.mdx 손상 사례).
  const oldBlockStart = raw.indexOf(`\`\`\`mermaid\n${block.code}`);
  if (oldBlockStart !== -1) {
    const oldBlockEnd = oldBlockStart + `\`\`\`mermaid\n${block.code}\`\`\``.length;
    raw = raw.substring(0, oldBlockStart)
        + `\`\`\`mermaid\n${fixed}\`\`\``
        + raw.substring(oldBlockEnd);
  }
}
```

#### 버그 2 fix — negative lookahead `(?!")`

```javascript
// ✅ After
// AUTO-FIX: 노드 라벨의 괄호를 따옴표로 감싸기
// ⚠️ 이미 따옴표가 있는 라벨은 건너뛰어야 함 (negative lookahead `(?!")`).
//    안 그러면 매 실행마다 따옴표가 누적: D["x"] → D[""x""] → D["""x"""] ...
fixed = fixed.replace(
  /([A-Z]\d*)\[(?!")([^\[\]"]*\([^\[\]"]*\)[^\[\]"]*)\]/g,
  '$1["$2"]'
);
```

추가로 라벨 내부에서 `"` 자체를 매치 대상에서 제외 (`[^\[\]"]*`).

### 회귀 방지 시스템

함수를 별도 파일로 추출하고 6 vitest 케이스로 박제:

```
scripts/
├── validate-content.mjs       (CLI entry, lib에서 import)
├── lib/
│   └── mermaid-fix.mjs        (fixAndValidateMermaid 함수)
└── __tests__/
    └── validate-content.test.mjs   (6 회귀 테스트)
```

**6 케이스**:
1. **슬라이싱 검증** — frontmatter 있는 MDX, Section B 본문 보존 + 라인 수 동일 + idempotent
2. **정규식 idempotent** — `E["already (quoted)"]` 5회 실행 후 변화 없음
3. **정상 라벨** — 괄호 없는 `A[Sender]` 변경 없음
4. **다중 mermaid 블록** — 2개 중 첫 번째만 수정, 구조 보존
5. **5-quote 누적 잔재** — negative lookahead 덕분에 추가 손상 방지
6. **edge cases**

**테스트 결과**: 13 passed (기존 7 + 신규 6).

## 체크리스트 — 자동 수정 도구 작성 시

- [ ] **자기 검증**: 자동 수정 후 동일 파일에 대해 한 번 더 실행해서 *변화 없음(idempotent)* 확인
- [ ] **offset 일관성**: 검색 대상과 슬라이싱 대상이 *같은 string*이어야 함. `content`에서 찾고 `raw`에 적용 X
- [ ] **regex idempotent**: 정규식이 자기가 만든 출력에도 다시 매치하면 누적 손상 → negative lookahead 또는 character class 제외
- [ ] **함수 추출 + import**: 인라인 함수가 아니라 별도 lib로 → 단위 테스트 가능
- [ ] **회귀 테스트 박제**: 발견한 버그마다 케이스 1개씩. 함수 시그니처 외에도 *write-back 동작*을 black-box로 검증
- [ ] **누적 손상 grep**: `\["{2,}` 같은 패턴으로 다른 파일에 자국이 남았는지 주기적으로 검증

## 일반화 — *Self-modifying tool must self-validate*

자동 수정 도구는 **자기 출력에 대해 idempotent**여야 한다. 그렇지 않으면:
- 매 실행마다 손상이 누적
- 손상이 silent (사용자가 모름)
- 여러 세션에 걸쳐 누적되면 복구 불가능

**처방**: 자동 수정 도구를 작성하면 *마지막 단계*로 다음을 추가:
1. 수정 후 결과를 다시 함수에 입력
2. 두 번째 결과가 첫 번째와 같은지 검증
3. 다르면 throw / log

이게 없으면 신뢰 X.

## 관련

- `scripts/validate-content.mjs` (CLI entry)
- `scripts/lib/mermaid-fix.mjs` (추출된 함수 + docstring 경고)
- `scripts/__tests__/validate-content.test.mjs` (6 회귀 테스트)
- `vitest.config.ts` (`scripts/__tests__/` include)
- Harness Journal 019 §6 (자동 수정 도구 silent 손상 함정)
