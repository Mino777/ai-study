# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-20 (Session 18 — gma-ios 인프라 이식 + 이슈 정리)
- **작성 주체**: Claude (Session 18)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 146
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **applicable_to 정밀도**: 74% (108/146 프로젝트 특화)
- **자동화 워크플로우**: 10개
- **Claude 인프라**: SessionStart hook + permissions.deny + python3 훅 파싱

### Hermes-First 스택 상태
- **판정**: 현재 불필요 (2026-04-19)
- **재검토 트리거**: 동시 에이전트 5개+ / 24/7 무인 운영 / 기억 손실 3회+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **콘텐츠 생성 집중** — KPI stagnant. 신규 엔트리 추가 목표
   - `npm run generate-lesson` 으로 주제 추천 후 작성
   - 예상 크기: M

2. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - tarosaju에서 `feat/ai-api-3layer-defense` 브랜치 작업 중
   - 예상 크기: M (프로젝트당)

### 🟡 Medium

3. **이력서 노션 동기화** (#67)
   - page.tsx와 노션 md 파일 내용 불일치 — iOS 노션 파일 업데이트 필요

4. **이력서 디자인 최종 폴리싱** (#68)
   - 글자 크기/마진 미세 조정, 모바일 반응형 확인

### 🟢 Low

5. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: conductor worktree `la-paz` 존재 — 만지지 말 것
- tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중
- aidy-architect: ahead 상태 (2026-04-19 기준, 재확인 필요)

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 엔트리 수 | 146 | 152 | higher | ? |
| AI Agent Directive 절대 수 | 113 | 130 | higher | ? |
| applicable_to 특화 비율 | 74% | 85% | higher | ? |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기
- [ ] `SPEC.md` 읽기
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택

### Phase 3: Git 동기화 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `/projects-sync` 실행 (메시지 큐 확인 포함)

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] 콘텐츠 생성 우선 (엔트리 수 KPI stagnant)
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-20 (Session 18 — gma-ios 인프라 이식)
- **완료**: gma-ios 패턴 4가지 이식 (SessionStart/permissions.deny/python3훅/에이전트)
- **완료**: applicable_to 91개 재추론 (74% 특화 달성)
- **완료**: shadow-benchmark CI grep 패턴 수정
- **완료**: GitHub 이슈 7건 생성, 4건 즉시 클로즈
- **다음**: 콘텐츠 생성 집중 (엔트리 stagnant)
