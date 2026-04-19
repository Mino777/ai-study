# [mdx] Compiled Truth

## 종합 (6건, 최종 갱신 2026-04-19)

- **재발 횟수**: Mermaid 관련 4회 반복 (핵심 반복 패턴)
- **현재 최선 해결책**: `scripts/lib/mermaid-fix.mjs` 자동 수정 + `detectUnquotedSpecialCharLabels()` warning
- **코드 게이트 승격**: 완료 (mermaid-fix.mjs + 16 regression tests)
- **마지막 발생**: 2026-04-19

### 주요 교훈 요약

| # | 문제 | 핵심 해결 | 반복? |
|---|------|-----------|-------|
| 1 | `<br>` → MDX 컴파일 에러 | `<br />` self-closing 강제 | 단발 |
| 2 | Mermaid subgraph 공백 이름 | `id ["Label"]` 형식 강제 | Mermaid 1/4 |
| 3 | JSX `{}` `<digits` 파싱 함정 | 코드 백틱 또는 문구 변경 | 단발 |
| 4 | Mermaid `<br/>` + 특수문자 | 명시적 따옴표 `["label"]` | Mermaid 2/4 |
| 5 | Mermaid cylinder 중첩 괄호 | `[("label")]` → `["label"]` 치환 | Mermaid 3/4 |
| 6 | Mermaid rhombus `<br/>` 렌더 에러 | `<br/>` 제거 + 괄호/이모지 대체 | Mermaid 4/4 |

### 메타 패턴

- **Mermaid가 6건 중 4건**: Mermaid 라벨의 특수문자(`<br/>`, `→`, 중첩 괄호)가 핵심 재발 원인
- **Shiki 간섭**: rehypeMermaid + MermaidRenderer DOM 직접 렌더만 안정 (MDX override 불가)
- **Gemini 프롬프트 가드**: AI가 생성하는 MDX에서 반복 발생 → 프롬프트에 금지 규칙 추가로 예방

## 개별 솔루션 목록

1. [br-tag-compile-error](2026-04-09-br-tag-compile-error.md)
2. [mermaid-subgraph-space-in-name](2026-04-11-mermaid-subgraph-space-in-name.md)
3. [jsx-parsing-traps-curly-angle](2026-04-12-jsx-parsing-traps-curly-angle.md)
4. [mermaid-br-in-unquoted-node-labels](2026-04-16-mermaid-br-in-unquoted-node-labels.md)
5. [mermaid-cylinder-nested-parens](2026-04-16-mermaid-cylinder-nested-parens.md)
6. [mermaid-br-rendering-error](2026-04-19-mermaid-br-rendering-error.md)
