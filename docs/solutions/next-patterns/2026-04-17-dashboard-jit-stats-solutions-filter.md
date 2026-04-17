# 대시보드 JIT 통계에서 solutions 경로가 제목 없이 표시

## 문제

JIT 검색 통계 Top 조회 엔트리에 `solutions/mdx/2026-04-16-mermaid-br-in-unquoted-node-labels` 같은 raw slug가 제목 대신 표시됨.

## 증상

- 1~2등 엔트리가 "2026 04 16 mermaid br in unquoted node labels" 형태로 표시
- 나머지 엔트리는 정상 제목 표시

## 근본 원인

`search-hits.json`의 히트 키에 `solutions/mdx/...` 경로가 포함되는데, 대시보드의 `entries` 배열은 `content/` MDX 엔트리만 포함. `entries.find(e => e.slug === slug)`가 `undefined` 반환 → fallback으로 slug를 `-` 제거해서 표시.

```js
// Before
const hitEntries = Object.entries(hits).sort(([, a], [, b]) => b - a);

// After — content 엔트리에 매칭되는 것만 필터링
const hitEntries = Object.entries(hits)
  .filter(([slug]) => entries.some((e) => e.slug === slug))
  .sort(([, a], [, b]) => b - a);
```

## 체크리스트

- [ ] 외부 데이터(search-hits.json)를 UI에 표시할 때, manifest entries와 조인 가능한지 확인
- [ ] fallback 표시(slug → 제목 변환)가 의미 있는 텍스트를 만드는지 확인
