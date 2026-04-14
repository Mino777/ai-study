# AI 과외 파이프라인: 커스텀 주제 한글 slug → 404 에러

## 문제

AI 과외 선생님 파이프라인(`generate-lesson.mjs`)의 `generateCustom()` 모드에서 사용자가 한글 자유 텍스트로 주제를 입력하면, **질문 전체가 파일명(slug)으로** 사용되어 404 에러 발생.

## 증상

- 배포 후 해당 엔트리 페이지 접근 시 404
- URL이 수백 글자의 percent-encoded 한글으로 구성
- 예: `ios에서-ai가-작업한-코드를-어떤식으로-보장할-수-있는지-유닛테스트부터-ui-통합-e2e-테스트-환경을-어떤식으로-구성해줘야-하는지-딥-리써치-해줘.mdx` (114자)
- tags도 slug를 `-`로 분할 → `[ios에서, ai가, 작업한, 코드를, ...]` 무의미한 한글 단어 배열

## 근본 원인

`generateCustom()` (line 487-492):

```js
// Before (broken)
const topicSlug = topicText
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")  // ← 한글 허용
    .replace(/\s+/g, "-")
    .trim();
```

한글을 slug에 허용하는 regex + 길이 제한 없음 = 사용자 질문 전체가 파일명.

`suggest` → `generate` 경로(번호 선택)는 topic-pool.json의 영문 slug를 사용하므로 문제 없음. **`generate-custom` 경로(자유 텍스트)에서만 재현.**

## 해결 (before/after)

### Slug 생성

**Before:**
```js
const topicSlug = topicText.toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-").trim();
```

**After:**
```js
// 1. Gemini에게 TITLE→영문 slug 변환 위임
const finalSlug = await generateSlugFromTitle(model, topic.title);
// 2. Fallback: 한글 제거 + 영문만 추출
function titleToSlugFallback(title) {
  return title.toLowerCase()
    .replace(/[가-힣]+/g, "")  // 한글 제거
    .replace(/[^a-z0-9\s-]/g, "")
    .substring(0, 60);         // 60자 제한
}
// 3. 충돌 검사
if (existingSlugs.has(slug)) slug += `-${timestamp}`;
```

### Tags 생성

**Before:** `topic.topicSlug.split("-").filter(t => t.length > 2)` → 한글 단어 분할

**After:** Gemini 프롬프트에 `TAGS:` 지시 추가 → 영문 키워드 3~6개 자동 생성

## 재발 방지 체크리스트

- [ ] `generate-custom` 경로로 한글 주제 입력 → 영문 slug 생성 확인
- [ ] slug 60자 이내 확인
- [ ] tags에 한글 없음 확인
- [ ] 배포 후 해당 URL 접근 가능 확인
- [ ] `generate` 경로(번호 선택)는 영향 없음 확인

## 영향 범위

- `scripts/generate-lesson.mjs` — generateCustom() + generateSlugFromTitle() + titleToSlugFallback() 추가
- `.github/workflows/generate-on-pick.yml` — 변경 없음 (스크립트 내부 변경)
- 기존 번호 선택 경로 — 영향 없음

## 관련

- [AI 과외 선생님 Pipeline](/wiki/harness-engineering/harness-journal-000-baseline)
- `.github/workflows/generate-on-pick.yml`
- `scripts/generate-lesson.mjs`
