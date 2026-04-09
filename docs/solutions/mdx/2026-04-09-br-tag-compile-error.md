---
title: "MDX 컴파일 에러 — <br> 태그가 JSX 아닌 HTML로 작성됨"
date: 2026-04-09
category: mdx
tags: [mdx, jsx, br, compile-error, validation]
---

# MDX 컴파일 에러 — `<br>` 태그가 JSX 아닌 HTML로 작성됨

## 증상

위키 엔트리 페이지에서 "MDX 컴파일 에러" 문구가 표시되고 본문이 안 나옴. 로컬 dev에서는 괜찮은데 프로덕션 빌드는 통과, 실제 페이지 렌더링 시에만 에러.

에러 메시지:
```
Expected a closing tag for `<br>` (285:110-285:114) before the end of `tableData`
```

## 원인

MDX는 JSX 기반이라 **모든 태그가 self-closing** 또는 명시적 닫힘 태그가 필요함. HTML처럼 `<br>` (void element)를 쓰면 MDX 파서가 "닫히지 않은 태그"로 인식하고 컴파일 실패.

특히 **표(table) 안에 `<br>`**이 들어가면 증상이 치명적:
```markdown
| 헤더 | 설명 |
|------|------|
| 항목 | 내용<br>다음 줄 |  ← MDX 컴파일 에러!
```

## 해결

### Before
```markdown
| 행동 기반 테스트 | 프롬프트 변형<br>페르소나 일관성<br>가드레일 |
```

### After
```markdown
| 행동 기반 테스트 | 프롬프트 변형<br />페르소나 일관성<br />가드레일 |
```

모든 `<br>` → `<br />` (self-closing).

### 일괄 수정 (한 파일)

`<br>` → `<br />` 전체 치환. Claude Code에서는 `Edit` tool의 `replace_all: true`로 처리.

```bash
# 또는 sed로
sed -i '' 's|<br>|<br />|g' content/**/*.mdx
```

## 근본 원인

AI가 생성하는 MDX는 Gemini가 HTML 스타일 `<br>`을 선호함 (학습 데이터가 HTML 위주). MDX 문법 제약을 프롬프트에 명시해도 놓칠 수 있음.

게다가 **Next.js 빌드는 통과**하는데 **런타임 렌더링 시 `compileMDX` (next-mdx-remote/rsc)가 에러**를 내는 구조라, 빌드 단계에서 못 잡힘. 프로덕션 배포 후에야 에러 발견.

## 예방 — 검증 스크립트

`scripts/validate-content.mjs`에 **사전 MDX 컴파일 검증**을 추가함:

```javascript
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

// 모든 MDX 파일을 실제로 컴파일 시도
for (const file of files) {
  const { content } = matter(fs.readFileSync(file, "utf-8"));
  try {
    await compile(content, { remarkPlugins: [remarkGfm] });
  } catch (err) {
    console.error(`❌ ${file}: ${err.message}`);
    process.exit(1);
  }
}
```

`package.json`의 `prebuild`에서 자동 실행:
```json
"prebuild": "node scripts/validate-content.mjs && node scripts/generate-content-manifest.mjs"
```

이제 빌드 자체가 차단되므로 프로덕션에 올라가지 않음.

## 체크리스트

MDX 콘텐츠 작성 시:
- [ ] `<br>` 대신 `<br />` 사용
- [ ] `<img>` 대신 `<img />` 또는 Markdown `![alt](url)` 사용
- [ ] `<hr>` 대신 `<hr />` 또는 Markdown `---` 사용
- [ ] 표 안에 HTML 태그 사용 시 반드시 self-closing 확인
- [ ] `npm run validate` 로컬에서 먼저 검증
- [ ] AI가 생성한 MDX는 특히 주의 (HTML 스타일 선호함)

## 관련 파일

- `scripts/validate-content.mjs` — MDX + Mermaid 사전 검증
- `content/harness-engineering/ai-testing-strategies.mdx` — 이 문제로 수정된 파일
- `package.json` — prebuild에 validate 단계 추가
