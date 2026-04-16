---
title: "Solution 문서 N=3+ 누적 시 validator/훅으로 승격하는 사이클"
date: 2026-04-16
category: workflow
tags: [validator, solution-promotion, regression-test, idempotency, compound-engineering]
---

# Solution 문서 N=3+ 누적 시 validator/훅으로 승격

## 문제

`docs/solutions/<category>/` 에 동일 패턴이 여러 번 박제되는데, 다음 세션이 같은 함정을 반복하는 *기억 의존 가드* 가 사라지지 않음.

## 증상

- Mermaid 문법 솔루션이 4번째 누적 (`<br>` 누락 → subgraph 공백 → 노드 label `<br/>` 따옴표 → cylinder 괄호 중첩)
- 매 솔루션 문서 끝에 "validator 확장 후보" 섹션이 있지만 *읽기만 하는 메모* 로 남음
- 새 콘텐츠가 같은 패턴을 또 만들어내면 *런타임* 에서야 발견됨 (빌드는 통과)
- "이번에 또 만났다" 라는 한 줄이 솔루션 문서마다 누적되는 신호

## 해결

### 트리거 조건 (N=3 룰)

| 누적 횟수 | 액션 |
|----------|------|
| 1번 | `docs/solutions/<category>/` 박제로 충분 |
| 2번 | 박제 + 패턴 일반화 시도 (사람 검토용) |
| **3+번** | **validator/훅으로 승격** — 사람 기억 대신 코드 가드 |

### 승격 시 결정 트리

```
승격 대상 패턴
  │
  ▼ idempotency 보장 가능?  ─NO─→ warning-only
  │ YES
  ▼ false positive < 5%?  ─NO─→ warning-only
  │ YES
  ▼ shape 다양성 적음?  ─NO─→ warning-only
  │ YES
  ▼ auto-fix
```

대부분의 케이스에서 **warning-only 가 안전한 기본값**. auto-fix 는 3 조건 모두 통과할 때만.

### 구현 패턴 (Mermaid `<br/>` 사례)

```js
// scripts/lib/mermaid-fix.mjs
export function fixAndValidateMermaid(code) {
  // ...기존 errors...
  const warnings = detectUnquotedSpecialCharLabels(code);  // 신규
  return { fixed, autoFixed, errors, warnings };
}

function detectUnquotedSpecialCharLabels(code) {
  const warnings = [];
  const SPECIAL_CHAR = /(<br\s*\/?>)|→/;
  // 일반 노드 [label] · rhombus {label} 둘 다 체크
  // cylinder/circle 은 정규식 매치 안 함 (별도 솔루션)
  // ...
  return warnings;
}
```

```js
// scripts/validate-content.mjs
const { errors, warnings } = fixAndValidateMermaid(code, rel);
for (const w of warnings) {
  console.warn(`⚠️  ${rel} Line ~${w.line}: ${w.message}`);
}
// errors 만 totalErrors 에 가산 — 빌드 실패 X
```

### 승격 시점에 기존 콘텐츠 점검 필수

validator 추가 = *잠재 부채 발견* 기회. 빌드 한 번 돌려서 즉시 검출되는 모든 건을 수정.

이번 사례에서 9건 즉시 발견:
- `five-levers-of-harness-engineering.mdx` — 7건
- `rag/vector-search-basics.mdx` — 1건

수정 후 warnings 0건 확인.

## 근본 원인

**Compound Engineering 의 빈 구멍**: "회고가 다음 사이클의 입력" 원칙은 well-defined 했지만, "솔루션이 어느 시점에 코드 가드로 승격되는가" 는 명시적 룰이 없었음. 그 결과:

- 1~2번 재발 → 박제 (정상)
- 3~4번 재발 → *여전히 박제만* (anti-pattern)
- 5번 재발 → 사용자 사고로 표면화

N=3 룰이 이 구멍을 메움.

## 체크리스트

- [ ] `docs/solutions/<category>/` 카테고리에 동일 패턴 N+1 번째 박제 시도 시: "validator 승격 검토" 가 솔루션 문서 마지막 섹션에 있는지 확인
- [ ] 승격 결정 시: idempotency · false positive · shape 다양성 3 조건으로 warning-only vs auto-fix 결정
- [ ] auto-fix 채택 시: vitest 에 idempotency 케이스 (5회 실행 invariant) 별도 추가
- [ ] 승격 직후: 빌드 한 번 돌려 *기존* 콘텐츠의 잠재 부채 즉시 검출 + 수정
- [ ] Compound Assets 에 "패턴이 validator 로 승격된 사례" 로 박제 (다음 카테고리 적용 시 참조)

## 일반화

이 패턴은 Mermaid 만의 이야기가 아니다:

| 카테고리 | 후보 패턴 | 승격 후보 |
|----------|----------|----------|
| `mdx` | `<br/>` `→` 따옴표 누락 | ✅ 이번 사이클 완료 |
| `mdx` | JSX trap (`{worker}` 본문 중괄호) | ✅ 이미 detectJsxTraps 존재 |
| `react-patterns` | useEffect setState 패턴 | 누적 시 ESLint custom rule |
| `ai-pipeline` | AI 응답 schema 누락 | 누적 시 Zod schema 강제 |
| `workflow` | git squash merge 충돌 | 누적 시 pre-pull 훅 |

## 관련 파일

- `scripts/lib/mermaid-fix.mjs` — warning-only 구현 레퍼런스
- `scripts/__tests__/validate-content.test.mjs` — idempotency 케이스 패턴
- `content/harness-engineering/harness-journal-024-solution-to-validator-promotion.mdx` — 메타 패턴 박제
- 이전 솔루션: `2026-04-09-br-tag-compile-error.md` · `2026-04-11-mermaid-subgraph-space-in-name.md` · `2026-04-16-mermaid-br-in-unquoted-node-labels.md` · `2026-04-16-mermaid-cylinder-nested-parens.md`
