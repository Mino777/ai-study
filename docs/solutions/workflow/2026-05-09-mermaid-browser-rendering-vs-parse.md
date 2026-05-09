# Mermaid 브라우저 렌더링 에러 vs Node.js Parse 에러

## 문제
Mermaid 다이어그램이 `mermaid.parse()` (Node.js)에서는 통과하지만 브라우저에서 "Mermaid 에러"로 렌더링 실패.

## 증상
- `npm run build` 통과
- `mermaid.parse()` 호출 시 `DOMPurify.addHook is not a function` 에러 (Node.js DOM 미지원)
- 실제 Parse error와 DOM 에러를 구분 불가
- 프로덕션 사이트에서 빨간색 "Mermaid 에러" 표시

## 근본 원인
Mermaid 파서는 문법을 통과시키지만, 렌더러가 특정 패턴에서 실패:
1. subgraph 라벨에 괄호: `subgraph "Input (Channels)"` → 렌더러 파싱 실패
2. 중괄호 노드에 괄호: `{"Policy (정책)"}` → 렌더러 파싱 실패
3. `(e.g., xxx)` 패턴 → 괄호가 노드 구분자로 해석
4. 괄호 노드에 콜론: `B(Text: xxx)` → 콜론이 특수 구문으로 해석

## 해결 (before/after)

### Before
```
subgraph "Input (Channels)"    ← 렌더링 에러
B{"Policy (정책)"}              ← 렌더링 에러
["Run (e.g., npm test)"]       ← 렌더링 에러
B(Text: xxx)                   ← 렌더링 에러
```

### After
```
subgraph Input["Input Channels"]  ← OK
B{"Policy 정책"}                   ← OK
["Run e.g. npm test"]              ← OK
B["Text: xxx"]                     ← OK
```

## 자동 수정
`scripts/lib/mermaid-fix.mjs`에 AUTO-FIX 5/6/7/8 추가:
- FIX 5: subgraph 라벨 괄호 제거
- FIX 6: 중괄호 decision 노드 괄호 제거
- FIX 7: (e.g., ...) 패턴 제거
- FIX 8: 괄호 노드+콜론 → 대괄호 따옴표

## 체크리스트
- [ ] Mermaid 다이어그램 작성 후 **브라우저에서 렌더링 확인** (Node.js parse만으로 불충분)
- [ ] subgraph 라벨에 괄호 사용 금지
- [ ] 중괄호/대괄호 노드 라벨에 괄호 사용 금지
- [ ] `(e.g., ...)` 패턴 사용 금지 — `e.g. ...`로 대체
- [ ] 괄호 노드 `B(...)` 에 콜론 사용 금지 — `B["..."]`로 대체
