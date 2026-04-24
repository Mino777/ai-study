# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-24 (Session 21 후반 — resolver accuracy 100% 도달 + weekly CI)
- **작성 주체**: Claude (Session 21)
- **이유**: 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 164
- **Solutions**: workflow 12, mdx 8, ai-pipeline 5, github-actions 5 (promote 후보), next-patterns 3, performance 1
- **npm scripts**: `check:skills` / `eval:resolver` / `extract:failures`
- **테스트**: 58 케이스 (vitest)
- **Workflows**: 10 (weekly-resolver-eval 신규)

### Skillify 인프라 — 전원 green
- **Step 8** (check-resolvable): 9 repo 정합 완료
- **Step 7** (resolver eval): ai-study **100%** (25/25). weekly CI로 회귀 감시
- **Step 5** (failure extractor): 도구 완료, 씨드 추출 성공

### Hermes-First 스택: 불필요 유지

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **Skillify Step 5 golden set 확장** — `extract:failures --since 2026-03-01` 출력에서 실제 frustration intent 큐레이션 → cases.json (25 → 40+). 현재 100%는 "25개 좁은 샘플" 기준, 다양성 확보 필요
   - 예상 크기: S

2. **다른 repo (워커 6개) resolver-eval 통합** — 워커 각 CLAUDE.md에도 수동으로 `data/resolver-eval-cases.json` 두고 동일 회귀 감시. 또는 허브에서 일괄 감사 스크립트
   - 예상 크기: M

### 🟡 Medium

3. **콘텐츠 생성 재개** — 엔트리 164 → 170
4. **github-actions 솔루션 N=5 promote** — 스킬 자동 생성 + 리뷰
5. **ccusage 설치 + 베이스라인 수집** — KPI 측정 인프라. ccusage 미설치 상태
6. **Harness Journal 028** — Skillify Phase B/C 실측 기록 (52→68→96→100% 개선 과정)

### 🟢 Low

7. **LLM-기반 resolver eval** (Claude Haiku) — 구조적 eval의 한계 보완
8. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

---

## ⚠️ 블로커 / 대기 사항

- 없음

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| resolver-eval cases | 25 | 40 | higher | ? |
| resolver-eval accuracy | 100% | 90% (유지) | maintain | ? |
| 엔트리 수 | 164 | 170 | higher | ? |
| ccusage 베이스라인 | 미구축 | 구축 | achieve | ? |

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
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] High #1 또는 #2 먼저
- [ ] `/compound` 후 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-24 후반 (Session 21 — resolver 100% + weekly CI)
- **완료**: tokenizer 한국어 조사 제거 + slash split (+16%p)
- **완료**: CLAUDE.md routing 10개 엔트리 한국어 키워드 보강 (+32%p)
- **완료**: review rule "(2-Stage…)" 꼬리 regex 버그 수정
- **완료**: `.github/workflows/weekly-resolver-eval.yml` — 매주 월 09:30 KST + CLAUDE.md/cases.json 변경 시 자동 실행. 80% 미만이면 Issue 생성, 복구되면 close
- **측정**: resolver-eval accuracy **52% → 100%** (25/25 전원 통과)
- **다음**: golden set 다양성 확장 (25 → 40+)
