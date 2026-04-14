# MDX에서 Mermaid + Shiki 공존 — rehype 추출 + DOM 직접 렌더링

## 문제

Next.js + MDX + Shiki(@shikijs/rehype) + Mermaid 조합에서 mermaid 다이어그램이 SVG 대신 raw 텍스트로 노출.

## 증상

- mermaid 코드 블록이 코드 하이라이팅된 텍스트로 렌더링
- GitHub 프리뷰에서는 정상 (GitHub 자체 mermaid 렌더러)
- 프로덕션 사이트에서만 문제

## 근본 원인

rehypeShiki가 모든 코드 블록을 처리하면서 `<code class="language-mermaid">`의 클래스를 자기 것으로 교체. 프론트엔드의 mermaid 감지 로직(`className === "language-mermaid"`)이 작동 불가.

## 4번의 시도

| 시도 | 방법 | 실패 이유 |
|---|---|---|
| 1 | pre에 className="mermaid-raw" 부여 | Shiki가 pre의 className 덮어씀 |
| 2 | pre에 data-mermaid-chart 속성 | MDX compileMDX가 data 속성을 component props로 전달 안 함 |
| 3 | div로 변환 + components.div 오버라이드 | MDX가 rehype 생성 div에 component override 미적용 |
| 4 | div로 변환 + 독립 클라이언트 DOM 렌더 | **성공** |

## 해결 (최종 v4)

### rehypeMermaid (src/lib/remark-mermaid.ts)

Shiki 전에 실행. mermaid 코드 블록을 `<div class="mermaid-block"><script type="application/mermaid">chart</script></div>`로 변환.

- Shiki는 `<div>`를 처리하지 않으므로 간섭 없음
- `<script type="application/mermaid">`는 브라우저가 실행하지 않는 안전한 텍스트 컨테이너

### MermaidRenderer (src/components/mermaid-renderer.tsx)

`useEffect`에서 `.mermaid-block` div를 DOM에서 직접 스캔, mermaid.render()로 SVG 변환.

- MDX component override와 완전 독립
- SSR 시점에는 실행 안 됨 (useEffect)
- 렌더링 후 class를 `mermaid-rendered`로 교체

### 배선 (page.tsx)

```ts
rehypePlugins: [
  rehypeMermaid,     // Shiki 전에 실행
  [rehypeShiki, { theme: "github-dark-default" }],
],
// ...
<MermaidRenderer />  // prose-custom 바로 뒤에 배치
```

## 재발 방지 체크리스트

- [ ] 새 rehype 플러그인 추가 시 순서 확인 (rehypeMermaid는 반드시 Shiki 전)
- [ ] mermaid 블록이 있는 새 엔트리 작성 후 프로덕션에서 렌더링 확인
- [ ] MermaidRenderer가 wiki 페이지에 포함되어 있는지 확인
- [ ] `npm run build` 시 mermaid 블록 수 로그 확인 (`22개 Mermaid 블록 검증`)

## 관련

- `src/lib/remark-mermaid.ts` — rehypeMermaid 플러그인
- `src/components/mermaid-renderer.tsx` — 클라이언트 DOM 렌더러
- `src/components/mermaid-diagram.tsx` — 단독 mermaid 컴포넌트 (MermaidRenderer가 대체)
- `content/frontend-ai/mdx-mermaid-shiki-coexistence.mdx` — 엔트리 박제
