# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-24 (Session 22 compound — Journal 028/029 + 6 워커 rollout 완료)
- **작성 주체**: Claude (Session 22)
- **이유**: compound 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 167 (Journal 028 + 029 추가)
- **Solutions**: workflow 14 (+resolver-eval-multi-worker-rollout), mdx 8, ai-pipeline 5, github-actions 5, next-patterns 3, performance 1
- **Skillify 도구**: `check:skills` · `eval:resolver` · `extract:failures`
- **Resolver eval**: **48/48 = 100%** 유지
- **Weekly CI**: 허브 + 워커 6 = **7 repo** ON (매주 월요일 09:30 KST)

### 워커 Skillify 상태 (Skillify 트릴로지 완료)
| repo | accuracy | weekly CI |
|---|:---:|:---:|
| mino-moneyflow | 100% | ✅ |
| mino-tarosaju | 100% | ✅ |
| aidy-architect | 100% | ✅ |
| aidy-server | 100% | ✅ |
| aidy-ios | 100% | ✅ |
| aidy-android | 100% | ✅ |

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **ccusage 설치 + 베이스라인 수집** — 4 스프린트 연속 방치. 다음 세션 첫 5분 안에 처리. `brew install ccusage` 또는 blocker 확정. 크기: S
2. **콘텐츠 생성 재개** — 엔트리 167 → 180. AI 튜터 추천: token budget management / context stuffing patterns / multi agent communication. 크기: L

### 🟡 Medium

3. **LLM-기반 resolver eval (Claude Haiku)** — 구조적 eval이 "qa vs qa-only" 같은 의도 유사 충돌을 놓침. Journal 028 ⚠️ 항목. 크기: M
4. **github-actions 솔루션 N=5 promote** — 스킬 자동 생성 + 리뷰. 크기: M
5. **정책 훅 self-test (validate-hooks)** — aidy-android pre-push false-positive 재발 시 조사. 크기: S
6. **워커 resolver-eval golden set 난이도 상향** — 현재 11케이스 내 말투 편향. 다른 세션 transcript 유입. 크기: M

### 🟢 Low

7. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

---

## ⚠️ 블로커 / 대기 사항

- 없음

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| ccusage 설치 | 미구축 | 구축 or blocker 확정 | achieve | ? |
| 엔트리 수 | 167 | 180 | higher | ? |
| resolver-eval accuracy | 100% | 90% (유지) | maintain | ? |
| 워커 eval golden set 확장 | 11케이스/워커 | 15케이스/워커 | higher | ? |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` / `SPEC.md` / ai-agent-start-here

### Phase 2: 이 NEXT.md (3분)

### Phase 3: Git 동기화 + 정합 확인 (5분)
- [ ] `rtk git fetch`
- [ ] `/projects-sync` (aidy 4 포함)
- [ ] `npm run check:skills`
- [ ] `npm run eval:resolver`

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] **첫 5분 안에 ccusage 확인** (`brew install ccusage` or blocker 기록)
- [ ] High #2(콘텐츠) 집중
- [ ] `/compound` 후 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-24 (Session 22 — Journal 028/029 + 6 워커 rollout)
- **완료**: Journal 028 — 3-lever playbook 박제 (167 엔트리)
- **완료**: 6 워커 resolver-eval 이식 6/6, weekly CI 7 repo ON
- **완료**: Journal 029 — rollout 실측 박제, Skillify 트릴로지 닫힘
- **compound**: retro + solution(workflow #14) + CHANGELOG + NEXT.md 갱신
- **다음**: ccusage(High #1, 첫 5분) + 콘텐츠 재개(High #2)
