# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-25 (Session 23 — iOS Journal 010~011 + Aidy Journal 017)
- **작성 주체**: Claude (Session 23)
- **이유**: 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 170 (iOS Journal 010~011 + Aidy Journal 017 추가)
- **Solutions**: workflow 14, mdx 8, ai-pipeline 5, github-actions 5, next-patterns 3, performance 1
- **Skillify 도구**: `check:skills` · `eval:resolver` · `extract:failures`
- **Resolver eval**: **48/48 = 100%** 유지
- **Weekly CI**: 허브 + 워커 6 = **7 repo** ON

### 워커 프로젝트 상태 (/projects-sync 2026-04-25)
| repo | 상태 | 조치 필요 |
|---|---|---|
| mino-moneyflow | ⚠️ behind 4 + conductor worktree | `git pull` + la-paz worktree 확인 후 정리 |
| mino-tarosaju | ⚠️ feat 브랜치 체크아웃 + behind 3 + modified 2 | `git checkout main && git pull` + modified 확인 |
| aidy-architect | ⚠️ ahead 1 + modified 2 | 미푸시 커밋 확인 후 push 또는 drop 결정 |

### 이번 세션 산출물
- **iOS Journal 010**: AI 오케스트레이션 3연 스프린트 (tmux 4-Pane + Worker Pool + 스킬 시스템)
- **iOS Journal 011**: 토스 SLASH23 전면 이식 (Tuist 46모듈 + scan-imports 자동화 + 3차 세션 멀티타겟 7모듈 패치)
- **Aidy Journal 017**: dispatch 단일 함수 통합 + AGENT_TEAMS=1 + s34 3-Feature 병렬 (v4.7~v4.9)
- **회사명 노출 수정**: gma/GreenCar/greencarModule → 익명화 완료. 메모리에 "ios-study로 통일" 피드백 저장

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **ccusage 설치 + 베이스라인 수집** — 5 스프린트 연속 방치. 다음 세션 첫 5분 안에 처리. `brew install ccusage` 또는 blocker 확정. 크기: S
2. **워커 프로젝트 3개 정리** — moneyflow pull + tarosaju 브랜치 정리 + aidy 미푸시 커밋 처리. 크기: S
3. **콘텐츠 생성 재개** — 엔트리 170 → 180. AI 튜터 추천 또는 수동 주제. 크기: L

### 🟡 Medium

4. **LLM-기반 resolver eval (Claude Haiku)** — 구조적 eval이 "qa vs qa-only" 같은 의도 유사 충돌을 놓침. Journal 028 ⚠️ 항목. 크기: M
5. **github-actions 솔루션 N=5 promote** — 스킬 자동 생성 + 리뷰. 크기: M
6. **워커 resolver-eval golden set 난이도 상향** — 현재 11케이스 내 말투 편향. 크기: M

### 🟢 Low

7. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

---

## ⚠️ 블로커 / 대기 사항

- 없음

---

## ⚠️ 주의사항 (이번 세션에서 발견)

- **회사명 노출 절대 금지**: ios-study 프로젝트 언급 시 gma/GreenCar/LOTTIMS/greencar 등 실명 사용 금지. 반드시 **ios-study**로 표기. 메모리 `feedback_ios_project_naming.md` 참조.
- **iOS Journal 011의 `applicable_to`**: `["ios-study"]`로 설정됨 (gma-ios 아님)

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| ccusage 설치 | 미구축 | 구축 or blocker 확정 | achieve | ? |
| 엔트리 수 | 167 | 180 | higher | 170 (+3) |
| resolver-eval accuracy | 100% | 90% (유지) | maintain | ? |
| 워커 프로젝트 정리 | 3개 미정리 | 0개 | achieve | ? |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` / `SPEC.md` / ai-agent-start-here

### Phase 2: 이 NEXT.md (3분)

### Phase 3: Git 동기화 + 정합 확인 (5분)
- [ ] `rtk git fetch`
- [ ] `/projects-sync` (3 워커 전부)
- [ ] `npm run check:skills`
- [ ] `npm run eval:resolver`

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] **첫 5분 안에 ccusage 확인** (`brew install ccusage` or blocker 기록)
- [ ] High #2(워커 정리) → High #3(콘텐츠) 순서
- [ ] `/compound` 후 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-25 (Session 23 — iOS Journal 010~011 + Aidy Journal 017)
- **완료**: iOS Journal 010 — AI 오케스트레이션 tmux + Worker Pool + 스킬 시스템 (170 엔트리)
- **완료**: iOS Journal 011 — 토스 SLASH23 Tuist 46모듈 전환 + 빌드 체인 자동 복구
- **완료**: Aidy Journal 017 — dispatch 통합 + s34 3-Feature 병렬 (v4.7~v4.9)
- **수정**: 회사명 노출 3건 제거 + 메모리 피드백 저장
- **/projects-sync**: moneyflow behind 4, tarosaju feat 브랜치, aidy ahead 1 — 전부 정리 필요
- **다음**: ccusage(High #1) + 워커 정리(High #2) + 콘텐츠 재개(High #3)
