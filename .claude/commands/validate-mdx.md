# /validate-mdx — MDX/Mermaid 문법 함정 사전 검증

MDX 콘텐츠 작성 또는 AI 생성 후, 커밋 전에 실행.
5가지 반복 함정 패턴을 grep으로 사전 탐지하여 빌드/런타임 에러를 방지한다.

> 출처: docs/solutions/mdx/ 5건 (2026-04-09 ~ 04-16) 누적 패턴

---

## 입력

대상 파일 경로. 미지정 시 `git diff --name-only --cached` 또는 최근 변경된 `.mdx` 파일.

---

## 5 함정 검증 (순서대로)

### 함정 1: `<br>` self-closing 누락

MDX는 JSX 파서 → `<br>` (HTML void) 컴파일 에러.

```bash
grep -nE '<br\s*>' $FILE
```

**수정**: `<br>` → `<br />`

### 함정 2: Mermaid subgraph 이름 공백

`subgraph Standard RAG` → `Standard`만 인식, `RAG`는 garbage.

```bash
grep -nE '^subgraph [A-Za-z]+ [A-Za-z]' $FILE
```

**수정**: `subgraph id ["Label with spaces"]`

### 함정 3: JSX 파싱 함정 — `{...}` / `<숫자` / `<소문자`

```bash
# 코드블록 밖의 중괄호
grep -nE '\{[^`].*\}' $FILE
# <3 같은 패턴 (JSX 태그로 해석)
grep -nE '<[0-9]' $FILE
# <col> 같은 void element
grep -nE '<(col|br|hr|img|input|area|base|embed|link|meta|param|source|track|wbr)[^/]' $FILE
```

**수정**: 백틱 래핑 또는 자연어 대체

### 함정 4: Mermaid 노드 라벨 — `<br/>` / `→` / 특수문자 따옴표 누락

빌드는 통과하지만 **런타임 Mermaid 렌더 실패** (가장 위험).

```bash
grep -nE '\[[^"][^\]]*(<br/>|→|<|>)' $FILE
grep -nE '\{[^"][^}]*(<br/>|→)' $FILE
```

**수정**: `Node["label<br/>text"]` — 따옴표로 감싸기

### 함정 5: Mermaid cylinder `[("...")]` 중첩 괄호

```bash
grep -nE '\[\(".*\(.*\).*"\)\]' $FILE
```

**수정**: cylinder `[("...")]` 대신 일반 노드 `["..."]` 사용

---

## 실행 흐름

1. 대상 파일 목록 확정
2. 5 함정 grep 순서 실행
3. 발견 시 파일명:줄번호:패턴 출력 + 자동 수정 제안
4. 자동 수정 가능한 건 (함정 1, 4) → 사용자 확인 후 적용
5. `npm run build` 로 최종 확인

---

## 출력 형식

```markdown
# MDX 검증: <파일 목록>

| 함정 | 발견 | 파일:줄 | 자동수정 |
|---|---|---|---|
| 1. br self-closing | ✅/❌ | ... | 가능 |
| 2. subgraph 공백 | ✅/❌ | ... | 수동 |
| 3. JSX 파싱 | ✅/❌ | ... | 수동 |
| 4. 노드 따옴표 | ✅/❌ | ... | 가능 |
| 5. cylinder 중첩 | ✅/❌ | ... | 수동 |

총 N건 발견. [자동 수정 적용 / clean]
```
