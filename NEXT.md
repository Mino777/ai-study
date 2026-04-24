# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-24 (Session 21 — Skillify Step 5/7 + 100% accuracy + weekly CI)
- **작성 주체**: Claude (Session 21)
- **이유**: compound 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 165
- **Solutions**: workflow 13 (+fail-closed-hook-defense), mdx 8, ai-pipeline 5, github-actions 5, next-patterns 3, performance 1
- **Skillify 도구**: `check:skills` (Step 8) · `eval:resolver` (Step 7) · `extract:failures` (Step 5)
- **Resolver eval**: **48/48 = 100% accuracy** (golden set 25 → 48 확장 후 유지)
- **Weekly CI**: `.github/workflows/weekly-resolver-eval.yml` — threshold 80%, 회귀 시 Issue 자동
- **테스트**: 58 케이스 (vitest)
- **훅**: fail-closed 전환 + 간접 지칭(회사 iOS 등) 차단

### 타 repo Skillify 상태
- **허브(ai-study) + 워커 6 + 사설 iOS repo**: 전원 check:skills 0/0
- 워커들은 resolver-eval 미이식 (다음 스프린트 큐)

### Hermes-First 스택: 불필요 유지

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **워커 6개에 resolver-eval 이식** — 허브 accuracy만 관리하는 건 반쪽. 각 워커(moneyflow/tarosaju/aidy×4)에도 `data/resolver-eval-cases.json` 작게 두고 weekly CI 적용
   - 크기: M

2. **Harness Journal 028 — Skillify 52→100% 박제** — accuracy 끌어올린 방법론(tokenizer + 한국어 키워드 + regex fix + golden set 확장)을 재사용 가능 playbook로
   - 크기: S

### 🟡 Medium

3. **콘텐츠 생성 재개** — 엔트리 165 → 175 (이번 스프린트 의식적 deprioritize, 이제 다시 집중)
4. **github-actions 솔루션 N=5 promote** — 스킬 자동 생성 + 리뷰
5. **ccusage 설치 + 베이스라인 수집** — 3 스프린트 연속 방치 방지. 먼저 `brew install ccusage` 여부 확인
6. **정책 훅 self-test 체크리스트** — fail-closed 훅 자체 검증 스킬(`validate-hooks`) 또는 docs/solutions 가이드

### 🟢 Low

7. **LLM-기반 resolver eval** (Claude Haiku) — 구조적 eval 한계 보완
8. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

---

## ⚠️ 블로커 / 대기 사항

- 없음

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 워커 resolver-eval 이식 | 0개 | 3개 (주요 워커) | higher | ? |
| 엔트리 수 | 165 | 175 | higher | ? |
| resolver-eval accuracy | 100% | 90% (유지) | maintain | ? |
| ccusage 베이스라인 | 미구축 | 구축 or blocker 확정 | achieve | ? |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` / `SPEC.md` / ai-agent-start-here

### Phase 2: 이 NEXT.md (3분)

### Phase 3: Git 동기화 + 정합 확인 (5분)
- [ ] `rtk git fetch`
- [ ] `/projects-sync` (aidy 4 포함)
- [ ] `npm run check:skills` (dark skill 방지)
- [ ] `npm run eval:resolver` (회귀 감시)

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs` (github-actions N=5 후보)

### Phase 5: 작업 시작 (2분 내)
- [ ] High #1 (워커 resolver-eval 이식) 또는 #2 (Journal 028) 먼저
- [ ] `/compound` 후 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-24 (Session 21 — Skillify Step 5/7 + 100%)
- **완료**: `scripts/extract-failure-moments.mjs` (Step 5 씨드) + vitest 6
- **완료**: `scripts/resolver-eval.mjs` (Step 7 structural eval) + vitest 5
- **완료**: Golden set 25 → 48 확장 + 100% 유지
- **완료**: `weekly-resolver-eval.yml` (회귀 자동 감시)
- **완료**: `no-company-names.sh` stdin 버그 + fail-closed 전환
- **완료**: 역사적 사설 식별자 29건 전역 0건
- **다음**: 워커 resolver-eval 이식 / Journal 028 / 콘텐츠 재개
