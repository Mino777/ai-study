# AI 생성 파이프라인 JSX 중괄호 3중 방어

## 문제
Gemini가 생성한 MDX 본문에 `{variable}` 패턴이 그대로 포함되어 JSX expression으로 파싱, 빌드 실패. 프롬프트 가드만으로 재발 방지 불가 (7건+ 반복).

## 증상
```
❌ content/agents/mini-swe-agent.mdx (JSX 함정 — 빌드 차단)
   Line ~64: {중괄호} JSX 파싱 위험: "{file_content}"
```

## 해결 — 3중 방어 체계

### Layer 1: generate-lesson.mjs — 자동 이스케이프
`writeMDX()` 내부에 `escapeJsxCurlyBraces()` 추가. 본문의 `{var}` → `` `{var}` `` 자동 변환. 코드 블록/인라인 코드/frontmatter/import 제외.

### Layer 2: validate-content.mjs — 빌드 차단
JSX 함정 감지를 warning → error로 승격. `mdxErrors++`로 카운트하여 `process.exit(1)` 빌드 차단.

### Layer 3: generate-on-pick.yml — 커밋 전 게이트
`node scripts/validate-content.mjs` 실행 step 추가. 실패 시 PR 생성 자체를 중단.

## 근본 원인
파이프라인 설계에서 Mermaid는 `mermaid-fix.mjs` 후처리가 있었지만, JSX 중괄호는 프롬프트 가드에만 의존. LLM 출력은 확률적이므로 프롬프트 제약 100% 준수 불가.

## 체크리스트
- [ ] 새 MDX 에러 패턴 발견 시 자동 수정 규칙 추가
- [ ] 프롬프트 가드는 1차 방어로 유지하되 절대 의존 금지
- [ ] GHA 워크플로에서 생성→검증→커밋 순서 유지
