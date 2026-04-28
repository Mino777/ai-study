# 중첩 코드 펜스에서 JSX 중괄호 파싱 에러

## 문제
AI 생성 MDX에서 파이썬 코드 블록 안에 ```` ```swift ```` 내부 코드 블록이 포함되면, MDX 파서가 내부 ` ``` `를 외부 코드 블록 종료로 해석. 이후 `{file_content}` 같은 변수가 JSX expression으로 파싱되어 빌드 실패.

## 증상
```
❌ content/agents/mini-swe-agent.mdx (MDX 컴파일 에러)
   Could not parse expression with acorn
```

## 해결

### Before — 단순 토글 (중첩 미지원)
```javascript
if (line.trim().startsWith("```")) { inCodeBlock = !inCodeBlock; }
```

### After — 백틱 개수 추적
```javascript
const fenceMatch = line.trim().match(/^(`{3,})/);
if (fenceMatch) {
  const fenceLen = fenceMatch[1].length;
  if (codeBlockFenceLen === 0) { codeBlockFenceLen = fenceLen; }
  else if (fenceLen >= codeBlockFenceLen && line.trim() === fenceMatch[0]) { codeBlockFenceLen = 0; }
}
```

### MDX 콘텐츠 수정
외부 코드 블록을 4개 백틱(``````)으로 감싸서 내부 3개 백틱과 구분.

## 근본 원인
`validate-content.mjs`의 `detectJsxTraps()`, `detectPlaceholders()`와 `generate-lesson.mjs`의 `escapeJsxCurlyBraces()` 모두 코드 블록 파싱이 단순 토글이라 중첩 코드 펜스를 처리 못함.

## 체크리스트
- [ ] MDX 콘텐츠에서 코드 블록 안팎 판별 시 백틱 개수 추적 사용
- [ ] AI 생성 콘텐츠에 중첩 코드 블록 포함 가능성 고려
- [ ] 외부 코드 펜스는 4+ 백틱 사용
