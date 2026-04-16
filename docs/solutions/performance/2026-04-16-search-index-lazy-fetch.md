---
title: "SearchDialog entries를 root layout SSR props로 넘기면 모든 페이지에 30KB 오버헤드"
date: 2026-04-16
category: performance
tags: [nextjs, rsc, client-component, scaling, search, ssr-props]
---

# SearchDialog entries를 root layout SSR props로 넘기면 모든 페이지에 30KB 오버헤드

## 증상

100 entries 시점에서 RSC payload 측정:

| 페이지 | gzipped |
|---|---|
| 홈 | 56.8KB |
| 위키 리스트 | 45.8KB |
| 타임라인 | 53.1KB |
| 대시보드 | 50KB |

페이지 내용과 무관하게 모든 페이지에 `SearchDialog` 용 entries 배열 99개 × `{slug,title,category,description,tags}` 가 RSC payload에 직렬화 포함. **엔트리 수에 선형 증가**. 300 entries면 페이지당 ~90KB 고정 오버헤드.

## 원인

`src/app/layout.tsx` 가 서버에서 manifest 읽어 client component `<SearchDialog>` 에 props로 전달:

```tsx
// layout.tsx
const manifest = getManifest();
const searchEntries = manifest.entries.map((e) => ({
  slug: e.slug,
  title: e.frontmatter.title,
  category: e.frontmatter.category,
  description: e.frontmatter.description,
  tags: e.frontmatter.tags,
}));

return (
  <GraphSearchProvider>
    {children}
    <SearchDialog entries={searchEntries} />  // ← RSC payload에 직렬화
  </GraphSearchProvider>
);
```

Next.js App Router에서 Server Component가 Client Component에 props로 배열을 넘기면, 그 배열은 **모든 페이지의 RSC payload에 직렬화**되어 클라이언트로 전송된다. 루트 레이아웃이라 전 페이지 공통.

추가 문제: `dashboard/page.tsx`, `timeline/page.tsx` 가 각자 `<SearchDialog>` 와 `<GraphSearchProvider>` 를 **중복 mount**하고 있어 동일 데이터가 두 번 직렬화되기도 했음 (대시보드가 특히 과대).

## 해결

### 1. 빌드 시 정적 JSON으로 뽑기

```js
// scripts/generate-content-manifest.mjs
const SEARCH_INDEX_FILE = path.join(process.cwd(), "public", "search-index.json");

// ...manifest 생성 후
const searchIndex = entries.map((e) => ({
  slug: e.slug,
  title: e.frontmatter.title,
  category: e.frontmatter.category,
  description: e.frontmatter.description,
  tags: e.frontmatter.tags,
}));
fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex));
```

`.gitignore` 에 `public/search-index.json` 추가 (빌드 산출물).

### 2. SearchDialog 를 self-fetching으로

모듈 스코프 캐시 + idle prefetch + open 시점 fallback:

```tsx
// search-dialog.tsx
let searchIndexCache: SearchEntry[] | null = null;
let searchIndexPromise: Promise<SearchEntry[]> | null = null;

function loadSearchIndex(): Promise<SearchEntry[]> {
  if (searchIndexCache) return Promise.resolve(searchIndexCache);
  if (searchIndexPromise) return searchIndexPromise;
  searchIndexPromise = fetch("/search-index.json")
    .then((r) => r.json())
    .then((data: SearchEntry[]) => {
      searchIndexCache = data;
      return data;
    })
    .catch((err) => { searchIndexPromise = null; throw err; });
  return searchIndexPromise;
}

export function SearchDialog() {
  const [entries, setEntries] = useState<SearchEntry[]>(
    () => searchIndexCache ?? []
  );

  // Idle prefetch — Cmd+K 전에 미리 로드해서 체감 지연 0
  useEffect(() => {
    if (searchIndexCache) return;
    const idle = (window as any).requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    idle(() => {
      loadSearchIndex().then(setEntries).catch(() => {});
    });
  }, []);

  // open 시점 fallback (idle prefetch 실패 시)
  useEffect(() => {
    if (open && entries.length === 0) {
      loadSearchIndex().then(setEntries).catch(() => {});
    }
  }, [open, entries.length]);

  // ... 나머지 검색 로직
}
```

### 3. 중복 mount 제거

`dashboard/page.tsx`, `timeline/page.tsx` 에서 `<SearchDialog>` 와 `<GraphSearchProvider>` 를 제거하고 layout.tsx 글로벌 mount만 유지.

## Before / After (gzipped RSC payload)

| 페이지 | Before | After | 절감 |
|--------|--------|-------|------|
| 홈 | 56.8KB | 39.6KB | **-30%** |
| 위키 리스트 | 45.8KB | 29.8KB | **-35%** |
| 타임라인 | 53.1KB | 22.8KB | **-57%** |
| 대시보드 | 50KB | 15.0KB | **-70%** |

추가: `search-index.json` 18KB gzipped — 세션당 1회 idle fetch + HTTP 캐시.

## 근본 원인

App Router에서 흔한 함정:
- Server Component가 "그냥 props로 넘겨도 되는 데이터"를 Client Component에 넘기면, 그 직렬화 비용은 페이지당 고정 오버헤드가 된다
- **layout** 에서 props를 넘기면 *모든 페이지*가 그 오버헤드를 짊어진다
- 엔트리 수가 늘어나면 선형 증가. 빌드 타임 DB/manifest 기반 사이트에서 특히 위험
- Mount 중복 (dashboard/timeline에서 재 mount) 도 같은 데이터 이중 직렬화 유발

### 판별 기준

"이 데이터를 어떤 페이지에서 *언제* 필요로 하는가?" 로 판별:

| 시나리오 | 추천 |
|---------|------|
| 모든 페이지에서 첫 페인트에 즉시 필요 | SSR props OK |
| 특정 페이지에서만 · 첫 페인트에 필요 | 해당 페이지의 server component에서만 pass |
| 대부분 페이지에서 지연 가능 (검색, 모달 등) | **정적 JSON + lazy fetch** |
| 모든 페이지 · 초기 렌더 중요 아님 | idle prefetch + cache |

SearchDialog는 4번째 시나리오 — 첫 Cmd+K 누를 때만 필요.

## 측정 방법

```bash
# RSC payload 측정 (빌드 후)
gzip -c .next/server/app/index.rsc | wc -c
gzip -c .next/server/app/wiki.rsc | wc -c

# 어떤 데이터가 실려있는지 확인
head -c 2000 .next/server/app/index.rsc | grep -o '"slug":"[^"]*"' | head -5
```

## 체크리스트

- [ ] Client Component에 배열 props 넘기기 전에 "이거 모든 페이지에서 즉시 필요한가?" 확인
- [ ] `layout.tsx` 에서 manifest 전체를 꺼내 Client Component props로 넘기는 패턴 금지
- [ ] 검색/자동완성/모달같이 "필요할 때만 쓰는" 데이터는 `public/*.json` + `fetch`
- [ ] 동일 Client Component를 여러 page에서 mount 하고 있는지 grep으로 확인 (중복 mount는 중복 직렬화)
- [ ] 엔트리 기반 사이트에서 주기적으로 RSC payload 측정 (100, 300, 500 entries 임계점)

## 트레이드오프

- **장점**: 페이지당 30KB+ 절감, 엔트리 수 스케일링 해소, HTTP 캐시 재활용
- **단점**: 첫 Cmd+K 에서 fetch 네트워크 왕복 ~50ms (idle prefetch로 체감 지연 0ms)
- **대안**: 인라인 유지하되 `React.lazy()` 로 dialog 자체를 지연 로드 — 효과는 유사하나 검색 인덱스와 UI 번들이 묶여 캐시 효율이 떨어짐

## 관련 파일

- `scripts/generate-content-manifest.mjs` — search-index.json emit 추가
- `src/app/layout.tsx` — searchEntries props 제거
- `src/components/search-dialog.tsx` — 모듈 스코프 캐시 + idle prefetch
- `src/app/dashboard/page.tsx` · `timeline/page.tsx` — 중복 mount 제거
- `.gitignore` — `public/search-index.json` 추가
