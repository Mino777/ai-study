# /promote-solution — 반복 솔루션을 코드 게이트로 승격

`docs/solutions/` 카테고리에 N=3+ 솔루션이 누적되면, 공통 패턴을 코드 게이트(validator/hook/스킬)로 승격한다.
"사람이 절차를 기억하는 건 불가능 — 절차는 코드 게이트여야 한다."

> 출처: docs/solutions/workflow/ 7건의 메타 패턴 (N=3 승격 기준, 3층 방어, 자기수정 도구 idempotency)

---

## 트리거

수동 실행 또는 `/compound` Phase 2 솔루션 작성 후 자동 제안.

---

## Phase 1: 누적 현황 스캔

```bash
# 카테고리별 솔루션 수 집계
for dir in docs/solutions/*/; do
  cat=$(basename "$dir")
  count=$(ls "$dir"*.md 2>/dev/null | wc -l)
  echo "$cat: $count"
done
```

N=3 이상 카테고리 → 승격 후보로 표시.

---

## Phase 2: 공통 패턴 추출

각 N=3+ 카테고리의 솔루션을 읽고 다음을 분석:

1. **반복 증상**: 같은 에러 메시지 / 같은 파일 위치 / 같은 도구
2. **반복 수정**: 같은 fix 패턴 (예: 따옴표 추가, self-closing 변환)
3. **반복 근본 원인**: 같은 upstream 원인 (예: AI가 HTML로 생성, JSX 파서 차이)

---

## Phase 3: 승격 형태 결정

| 판단 기준 | 승격 형태 |
|---|---|
| 자동 수정 가능 + idempotent 보장 | **auto-fix validator** (`scripts/lib/`) |
| 자동 수정 위험 (false positive > 5%) | **warning-only detector** |
| 검증 절차가 복잡 (multi-step) | **slash command** (`.claude/commands/`) |
| pre-commit 게이트 적합 | **hook** (`.claude/hooks/`) |

### Idempotency 체크 (auto-fix 시 필수)

자동 수정 도구는 **2번 연속 실행해도 결과 불변** 이어야 한다.

```bash
# 1회차 실행
node scripts/lib/new-fix.mjs content/test.mdx
cp content/test.mdx /tmp/after-1.mdx

# 2회차 실행
node scripts/lib/new-fix.mjs content/test.mdx
diff /tmp/after-1.mdx content/test.mdx  # 차이 없어야 함
```

**Journal 019 사례**: `mermaid-fix.mjs`가 non-idempotent → 따옴표 누적 (`D["x"]` → `D[""x""]`).

---

## Phase 4: 구현 + 테스트

1. 승격 형태에 맞게 코드 작성
2. **vitest 회귀 테스트 필수** — 기존 솔루션의 before/after 사례를 테스트 케이스로 변환
3. idempotency 테스트 별도 케이스 추가
4. `npm run build` 로 기존 콘텐츠 debt 탐지

---

## Phase 5: 문서 업데이트

1. 승격된 솔루션 파일에 `## 승격` 섹션 추가 (어디로 승격됐는지)
2. CLAUDE.md의 `.claude/ 인프라` 섹션에 새 도구 추가
3. `/compound` Phase 2 카테고리 목록에 반영

---

## 출력 형식

```markdown
# 솔루션 승격 보고

## 스캔 결과
| 카테고리 | 솔루션 수 | 승격 대상 |
|---|---|---|
| workflow | 7 | ✅ |
| mdx | 5 | ✅ |
| ai-pipeline | 4 | ✅ |
| ... | ... | ... |

## 승격 계획
| 카테고리 | 공통 패턴 | 승격 형태 | 비고 |
|---|---|---|---|
| mdx | Mermaid 따옴표 누락 | auto-fix validator | idempotent 확인 필요 |
| ... | ... | ... | ... |

## 다음 액션
- [구현 시작 / 사용자 리뷰 대기]
```

---

## 안티패턴

- ❌ N<3 에서 성급한 승격 — 패턴이 아닌 개별 사건
- ❌ false positive > 5% 인데 auto-fix — warning-only 로 시작
- ❌ idempotency 테스트 없이 auto-fix 배포
- ❌ 기존 콘텐츠에 대한 debt 스캔 없이 validator 추가
