# Mermaid 후처리 sanitizer를 AI 파이프라인에 연결

## 문제

AI 자동 생성 엔트리(Gemini 2.5 Flash)에서 Mermaid/MDX 문법 에러가 프롬프트 가드가 있음에도 6건+ 반복 재발.

## 증상

- "Mermaid 에러" 빨간 텍스트로 렌더링 실패
- 노드 라벨의 괄호/콜론/따옴표가 Mermaid 파서를 깨뜨림
- `<br>` 태그가 self-closing 안 되어 MDX 컴파일 실패

## 해결

`scripts/generate-lesson.mjs`에서 파일 쓰기 직전에 2단계 후처리 추가:

```javascript
// 1) HTML void 태그 self-closing
mdxContent = mdxContent
  .replace(/<br\s*(?!\/)>/gi, "<br />")
  .replace(/<hr\s*(?!\/)>/gi, "<hr />");

// 2) Mermaid 블록 자동 수정
const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
while ((match = mermaidRegex.exec(mdxContent)) !== null) {
  const { fixed, autoFixed } = fixAndValidateMermaid(match[1]);
  if (autoFixed) mdxContent = mdxContent.replace(match[1], fixed);
}
```

## 근본 원인

LLM은 확률적이므로 프롬프트 제약만으로 100% 준수 불가능. 프롬프트 = 1차 방어, 후처리 sanitizer = 2차 방어로 이중 안전망 필수.

## 체크리스트

- [ ] `generate-lesson.mjs` 수정 시 `fixAndValidateMermaid` import 확인
- [ ] 새로운 Mermaid 에러 패턴 발견 시 `scripts/lib/mermaid-fix.mjs`에 규칙 추가
- [ ] `npm test`로 mermaid-fix 회귀 테스트 통과 확인
