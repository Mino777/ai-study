# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-24 (Session 22 — Journal 028 + 6 워커 resolver-eval 이식 6/6 100%)
- **작성 주체**: Claude (Session 22)
- **이유**: High #1 & #2 동시 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 166 (Journal 028 추가)
- **Solutions**: workflow 13, mdx 8, ai-pipeline 5, github-actions 5, next-patterns 3, performance 1
- **Skillify 도구**: `check:skills` · `eval:resolver` · `extract:failures`
- **Resolver eval**: **48/48 = 100%** 유지
- **Weekly CI**: `weekly-resolver-eval.yml` — threshold 80% 회귀 시 Issue

### 워커 Skillify 상태 (직전 스프린트 100% 달성)
| repo | resolver-eval | weekly CI | accuracy |
|---|:---:|:---:|---:|
| mino-moneyflow | ✅ | ✅ | 100% (54.5 → 100) |
| mino-tarosaju | ✅ | ✅ | 100% |
| aidy-architect | ✅ | ✅ | 100% (81.8 → 100) |
| aidy-server | ✅ | ✅ | 100% (36.4 → 100) |
| aidy-ios | ✅ | ✅ | 100% (27.3 → 100) |
| aidy-android | ✅ | ✅ | 100% (27.3 → 100) |

**합계**: 6/6 워커 100% accuracy + 매주 월요일 09:30 KST 회귀 감시 ON.

### Hermes-First 스택: 불필요 유지

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **콘텐츠 생성 재개** — 엔트리 166 → 180. 3 스프린트 deprioritize 후 누적. 크기: L
2. **LLM-기반 resolver eval (Claude Haiku)** — 구조적 eval이 "의도 유사 skill 간 충돌"(qa vs qa-only)을 놓침. Journal 028의 명시적 ⚠️ 항목. 크기: M

### 🟡 Medium

3. **github-actions 솔루션 N=5 promote** — 스킬 자동 생성 + 리뷰. 크기: M
4. **ccusage 설치 + 베이스라인 수집** — 4 스프린트 연속 방치 방지. `brew install ccusage` 여부 먼저 확인. 크기: S
5. **정책 훅 self-test 체크리스트** — fail-closed 훅 자체 검증 스킬(`validate-hooks`) 또는 docs/solutions. 크기: S
6. **Journal 028 외부 공유용 카피** — 영어 요약 섹션 or 별도 엔트리. 크기: S

### 🟢 Low

7. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시
8. **워커 resolver-eval 난이도 상향** — 지금은 '내 말투 편향' 11케이스. 다른 세션 transcript에서 어려운 케이스 유입. 크기: M

---

## ⚠️ 블로커 / 대기 사항

- 없음

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 워커 resolver-eval 이식 | 0/6 | 3/6 | higher | **6/6** 초과달성 |
| 엔트리 수 | 165 | 175 | higher | 166 (+1 Journal 028) |
| resolver-eval accuracy | 100% | 90% | maintain | 100% 유지 |
| ccusage 베이스라인 | 미구축 | 구축 or blocker | achieve | 미구축 (큐 #4) |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` / `SPEC.md` / ai-agent-start-here

### Phase 2: 이 NEXT.md (3분)

### Phase 3: Git 동기화 + 정합 확인 (5분)
- [ ] `rtk git fetch`
- [ ] `/projects-sync` (6 워커 이식 정합)
- [ ] `npm run check:skills`
- [ ] `npm run eval:resolver`

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs` (github-actions N=5)

### Phase 5: 작업 시작 (2분 내)
- [ ] High #1(콘텐츠 재개) 먼저, 또는 #2(LLM eval) 둘 중 택 1
- [ ] `/compound` 후 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-24 (Session 22 — Journal 028 + 6 워커 100%)
- **완료**: Harness Journal 028 — "52→100% 3-lever playbook" 박제 (166 엔트리)
- **완료**: 6 워커 resolver-eval 이식 — 5 commits 전원 push 성공, weekly CI ON
  - moneyflow 54.5→100, tarosaju 100, architect 81.8→100
  - aidy-server 36.4→100, aidy-ios 27.3→100, aidy-android 27.3→100
- **완료**: aidy-architect 라우팅 수정 — compound/autoceo 충돌 해소 + wt-branch 누락 보강
- **다음**: 콘텐츠 재개 / LLM eval (Haiku) / ccusage 베이스라인
