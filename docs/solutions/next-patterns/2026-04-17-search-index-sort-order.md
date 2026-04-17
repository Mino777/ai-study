# 검색 '최근 엔트리'가 알파벳순으로 나오는 버그

## 문제
SearchDialog에서 검색어 미입력 시 "최근 엔트리"라고 표시하지만 실제로는 agents/ 카테고리 엔트리가 먼저 나옴.

## 증상
- Cmd+K로 검색 열면 "자율 에이전트 아키텍처" 등 agents/ 엔트리가 상단 노출
- 오늘 추가한 엔트리가 목록에 없음

## 근본 원인
`scripts/generate-content-manifest.mjs`에서 `search-index.json` 생성 시 정렬 없이 `entries.map(...)` → 파일시스템 glob 순서(알파벳) 그대로 출력. SearchDialog는 `entries.slice(0, 8)` — 앞 8개만 표시.

## 해결
```js
// Before
const searchIndex = entries.map((e) => ({...}));

// After — 날짜 내림차순 정렬
const searchIndex = [...entries]
  .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  .map((e) => ({...}));
```

## 체크리스트
- [ ] search-index.json 생성 시 정렬 로직 확인
- [ ] SearchDialog에서 "최근 엔트리" 표시 시 실제 날짜순인지 검증
- [ ] 새 엔트리 추가 후 빌드 → search-index.json 상위 항목 확인
