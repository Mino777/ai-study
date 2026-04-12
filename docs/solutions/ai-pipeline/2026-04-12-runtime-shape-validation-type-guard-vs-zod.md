# 런타임 shape 검증 — Type Guard vs Zod 결정의 실시간 제약

**날짜**: 2026-04-12
**관련 Journal**: [012](../../../content/harness-engineering/harness-journal-012-market-analyst-runtime-validation.mdx), [013](../../../content/harness-engineering/harness-journal-013-three-analysts-runtime-validation.mdx)

## 문제

AI 에이전트의 JSON 출력을 런타임에 검증할 때(Layer 1+2 of 5 Layer AI 출력 검증 패턴), 두 도구 중 선택:

1. **Zod**: 표현적, 에러 메시지 풍부, 파싱 + 검증 통합 API, TypeScript 타입 추론 자동
2. **순수 TypeScript type guard**: 외부 dep 0, 명시적, 구조 파악 쉬움, 단 코드 반복

교과서 정답: Zod. 이유는 표현력.

실제 정답: *맥락에 따라 다르다*.

## 증상 — 교과서 정답이 오답인 경우

2026-04-12 Journal 012 착수 시점에 발견:

- 허브 세션이 moneyflow `market-analyst.ts` 작업 시작 전 `/projects-sync` 실행
- 결과: moneyflow에 **다른 세션 7 active worktree** + **Conductor la-paz 워크스페이스** 동시 작업 중
- 동시에 발견: moneyflow `package.json`에 `zod` 없음 (NEXT.md가 "Zod 검증"이라 적었지만 실제 코드는 zod 없이 작동)

교과서 정답대로 가면: `npm install zod` → `package.json` + `package-lock.json` 편집 → commit + push → 다른 세션 7 active worktree 중 하나라도 같은 파일 편집 중이면 `package-lock.json` 머지 충돌. 일반적인 파일 충돌보다 해결이 까다로움 (hand-merge 거의 불가능, 재생성 필요).

## 해결 — `/projects-sync` 결과를 제약으로 사용

도구 선택을 추상적인 기준("어느 게 더 좋은가")이 아니라 **허브가 관찰한 워커의 현재 상태**로 내린다:

| 제약 | 결정 |
|---|---|
| 다른 세션 작업 없음 | Zod 도입 OK |
| 다른 세션 1~2 worktree | Zod 도입 OK, 속도 주의 |
| 다른 세션 3~6 worktree | **Type guard 선호** — lock file 충돌 위험 |
| 다른 세션 7+ worktree | **Type guard 강력 권고** |
| 첫 1 에이전트 스코프 | Type guard로 충분, Zod는 범용화 시점에 재평가 |
| 13 에이전트 전체 적용 | Zod 도입 검토 (범용화 + 표현력 이득) |

**이번 결정**: Type guard. 근거:
1. moneyflow 7 active worktree (4는 prunable이지만 3은 active)
2. 첫 1 에이전트(market_analyst) 스코프 — 패턴 정의 단계
3. 13 에이전트 전체에서 Zod가 *진짜로* 필요한지는 다음 사이클(Journal 015)에서 debate 에이전트 9개 응답 구조 복잡도를 본 후

## Before / After

### Before — 교과서 정답

```typescript
// 1. package.json 편집
// 2. npm install zod
// 3. schemas/analyst-schemas.ts
import { z } from 'zod';
export const MarketAnalystReportSchema = z.object({
  agent_name: z.string(),
  signal: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']),
  confidence: z.number().min(0).max(100),
  // ...
});
// 4. market-analyst.ts
const parsed = MarketAnalystReportSchema.safeParse(rawResponse);
```

**결과**: Lock file 편집 → 다른 세션 7 worktree 중 하나라도 편집 중이면 충돌 → 수동 해결 비용 + 이식 사이클 지연.

### After — 맥락적 정답

```typescript
// schemas/analyst-schemas.ts (zero new deps)
export function validateMarketAnalystReport(value: unknown): ValidationResult<MarketAnalystReport> {
  if (!isRecord(value)) return { ok: false, issues: ['root: object required'] };

  const issues = checkAgentReportBase(value); // shared across 4 validators

  if (!isStringArray(value.indicators_used)) issues.push('indicators_used: string[] required');
  if (typeof value.trend_direction !== 'string' || !['BULLISH', 'BEARISH', 'NEUTRAL'].includes(value.trend_direction)) {
    issues.push('trend_direction: must be BULLISH|BEARISH|NEUTRAL');
  }
  if (!isNumberArray(value.support_levels)) issues.push('support_levels: number[] required');
  if (!isNumberArray(value.resistance_levels)) issues.push('resistance_levels: number[] required');

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: value as unknown as MarketAnalystReport };
}

// ai-client.ts parseJSON에 optional validator 매개변수 추가 (backward compat)
export function parseJSON<T>(text: string, fallback: T, validator?: Validator<T>): T {
  // ... existing parse logic ...
  if (validator) {
    const check = validator(result);
    if (!check.ok) {
      console.warn('[parseJSON] 런타임 검증 실패:', check.issues.slice(0, 5));
      return fallback;
    }
    return check.value;
  }
  return result as T;
}

// market-analyst.ts — 호출 사이트 1줄 추가
return parseJSON<MarketAnalystReport>(text, DEFAULT_REPORT, validateMarketAnalystReport);
```

**결과**: Lock file 편집 없음 → 다른 세션과 충돌 0 → 1m36s 자동 머지 → 패턴이 Journal 013에서 1:1 복제되어 3 validator 추가도 동일 방식으로 자동 머지.

## 근본 원인

"도구 선택"이라는 문제를 *추상적 비교*로 접근하면 *맥락에 따라 달라지는 제약*을 놓친다. 허브 세션이 관찰하는 워커 상태는 *실시간으로 변하는 제약*이므로, `/projects-sync`가 **결정 자체를 정보 입력으로 삼는다**.

이게 `/projects-sync`의 *진짜 가치*다 — 단순 상태 표시가 아니라 **실시간 제약 기반 의사결정의 입력**. Journal 011 셋업의 첫 실전 검증이 Journal 012에서 "zod 도입 안 함" 결정으로 현실화.

## 다음 사이클 재평가 지점

Journal 015 (9 debate 에이전트) 착수 시점에 다시 결정:

1. `/projects-sync`로 moneyflow 상태 재확인 (다른 세션 worktree 수 변동?)
2. debate 9 에이전트 응답 구조 복잡도 조사 (discriminated union 중첩? 배열 내 objects?)
3. 두 입력 결합 → Zod 도입 여부 결정
   - 7+ worktree + 중첩 구조 복잡 → Type guard + 분할 접근 (3 에이전트씩 3 사이클)
   - <3 worktree + 단순 구조 → Zod 도입 (분기점)
   - <3 worktree + 복잡 구조 → Zod 강력 권고 (이 경우만)

**교훈**: 같은 질문을 매 사이클 다시 물어본다. 지난 사이클의 답이 다음 사이클에서도 맞을 거라고 가정하지 않는다.

## 체크리스트 (다음에 런타임 shape 검증 작업할 때)

- [ ] `/projects-sync` 실행 — 다른 세션 active worktree 수 확인
- [ ] 대상 프로젝트 `package.json`에 zod 있는지 확인
- [ ] 이번 사이클의 스코프가 "첫 N개" 인지 "전체" 인지 확인 (전체는 Zod 도입 검토 가치)
- [ ] 대상 타입의 구조 복잡도 확인 (단순 평면 구조 → Type guard OK, 중첩 + union → Zod 이득 큼)
- [ ] Test Gate가 신규 테스트를 포함해서 돌 수 있는지 검증 (워크플로 이미 작동 중이면 OK)

## 관련

- Journal 012: `market_analyst` 첫 적용
- Journal 013: `news/sentiment/fundamentals` 1:1 복제 (4/13 진행)
- Journal 015 (예정): 9 debate 에이전트 + Zod 결정 재평가
- `harness-engineering/ai-output-zod-validation-pattern.mdx` — 5 Layer 전체 패턴 (Layer 3-5는 아직 구현 전)
