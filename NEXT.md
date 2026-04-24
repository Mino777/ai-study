# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-24 (Session 21 — Skillify Step 5/7 도구 구축)
- **작성 주체**: Claude (Session 21)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 164 (journal-027 포함)
- **Solutions 현황**: workflow 12, mdx 8, ai-pipeline 5, github-actions 5, next-patterns 3, performance 1
- **새 npm scripts**: `check:skills` (Step 8) · `eval:resolver` (Step 7) · `extract:failures` (Step 5)
- **테스트 커버리지**: 58 케이스 (vitest), +11 신규 (resolver-eval 5 + extract-failure 6)

### Skillify 인프라 상태
- **Step 8 (check-resolvable)**: 전 9 repo 정합 완료
- **Step 7 (resolver eval)**: ai-study baseline 정확도 **52%** — golden set 25케이스 중 12 fail (한국어 intent ↔ 영문 routing bias가 주원인). 다음 스프린트 작업 대상
- **Step 5 (failure extractor)**: `extract:failures` 작동, 실제 5건 실패 순간 추출 성공

### Hermes-First 스택 상태
- 불필요 판정 유지

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **Resolver eval 정확도 52% → 80% 끌어올리기**
   - CLAUDE.md `## Skill routing` 엔트리에 한국어 키워드 보강 (review → "리뷰", ship → "배포/푸시", investigate → "버그/문제/에러")
   - `data/resolver-eval-cases.json`에 실제 intent 표현 추가
   - `npm run eval:resolver`로 회귀 확인
   - 예상 크기: S

2. **Skillify Step 5 씨드 기반 golden set 확장**
   - `npm run extract:failures -- --since 2026-03-01 --limit 30` 출력물을 사람이 큐레이션
   - 실제 frustration → clean intent → cases.json 추가 (25 → 40+)
   - 예상 크기: S

### 🟡 Medium

3. **콘텐츠 생성 재개** — 엔트리 164 → 170
4. **github-actions 솔루션 N=5 promote 검토**
5. **ccusage 베이스라인 자동 수집** — KPI 측정 인프라
6. **weekly resolver eval GitHub Action** — accuracy 회귀 감시

### 🟢 Low

7. Skillify Step 5/7 도구 구현기를 Harness Journal 028로 박제
8. LLM-기반 resolver eval (Claude Haiku) — 구조적 eval 한계 보완

---

## ⚠️ 블로커 / 대기 사항

- 없음 (aidy-architect local 정합 세션 20에 정리)
- moneyflow conductor worktree `la-paz` 확인 필요

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| resolver-eval accuracy | 52% | 80% | higher | ? |
| resolver-eval cases | 25 | 40 | higher | ? |
| 엔트리 수 | 164 | 170 | higher | ? |
| ccusage 베이스라인 | 미구축 | 구축 | achieve | ? |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기
- [ ] `SPEC.md` 읽기
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기

### Phase 2: 이 NEXT.md 읽기 (3분)

### Phase 3: Git 동기화 + 정합 확인 (5분)
- [ ] `rtk git fetch`
- [ ] `/projects-sync` (aidy 4 포함)
- [ ] `npm run check:skills` (dark skill 방지)
- [ ] `npm run eval:resolver` (accuracy baseline 재확인)

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs` (github-actions N=5 후보)

### Phase 5: 작업 시작 (2분 내)
- [ ] High 큐 #1 (resolver 정확도 보강) 먼저
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-24 (Session 21 — Skillify Step 5/7 도구 구축)
- **완료**: `scripts/extract-failure-moments.mjs` + vitest 6 케이스 — 한/영 frustration 패턴 14종, length/system-message 필터
- **완료**: `scripts/resolver-eval.mjs` + vitest 5 케이스 — structural routing 시뮬레이터 (LLM 없이 deterministic)
- **완료**: `data/resolver-eval-cases.json` 25 케이스 golden set
- **완료**: npm scripts +2 (`eval:resolver`, `extract:failures`)
- **측정**: ai-study baseline **accuracy 52%** (13/25)
- **다음**: routing 설명 한국어 키워드 보강 → 80% target
