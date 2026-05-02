---
description: MDX 콘텐츠 파일 편집 시 적용되는 규칙
globs: content/**/*.mdx
---

# MDX 콘텐츠 편집 규칙

## Mermaid 5대 함정 (빌드 실패 원인)

1. **괄호 안 특수문자** — subgraph/node 라벨에 `(`, `)`, `[`, `]` 있으면 `"..."`로 감싸기
2. **`<br/>`** — Mermaid에서 HTML 태그 금지. 줄바꿈은 `\n` 또는 `·` 사용
3. **콜론 `:` 뒤 공백** — node 라벨에 콜론 있으면 반드시 `"..."`로 감싸기
4. **subgraph ID와 node ID 충돌** — 같은 이름 사용 금지
5. **화살표 `→`** — Mermaid는 `-->` 사용. 유니코드 화살표 금지

## Frontmatter 필수 필드

- title, description, category, date, tags, confidence, connections
- quiz 3문항 (question, choices 4개, answer 0-3, explanation)
- description은 1줄 이하

## 콘텐츠 규칙

- 한글 slug 금지 (영문 kebab-case만)
- `generated_by` 필드: AI 생성 시 명시 ("gemini" | "hermes")
- connections는 실제 존재하는 slug만 (dangling 금지)
