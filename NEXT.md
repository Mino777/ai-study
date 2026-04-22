# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-22 (Session 19 — moneyflow tmux 4-Pane 오케스트레이션 인프라)
- **작성 주체**: Claude (Session 19)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 156 (target 152 초과달성)
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean (compound 커밋 후)
- **applicable_to 정밀도**: 74% (108/146 프로젝트 특화, Session 18 기준)
- **자동화 워크플로우**: 10개
- **Solutions 현황**: workflow 10건, mdx 8건, ai-pipeline 5건, github-actions 5건, next-patterns 3건

### moneyflow Claude Harness
- **orchestration**: tmux 4-pane + git worktree 격리 + 양방향 통신 + 토큰 절감 완비
- **Git 상태**: main에 7커밋 추가 (push 예정)
- **다음 기회**: workflow solutions `_compiled-truth.md` 존재 → `/promote-solution` 검토

### Hermes-First 스택 상태
- **판정**: 현재 불필요 (2026-04-19)
- **재검토 트리거**: 동시 에이전트 5개+ / 24/7 무인 운영 / 기억 손실 3회+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **콘텐츠 생성 집중** — 엔트리 KPI 156 달성했으나 AI 방법론 심화 필요
   - `npm run generate-lesson` 으로 주제 추천 후 작성
   - 특히 tokenomics / harness-engineering 심화
   - 예상 크기: M

2. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중
   - 예상 크기: M (프로젝트당)

### 🟡 Medium

3. **workflow solutions `/promote-solution` 검토** (N=10)
   - `_compiled-truth.md` 이미 존재 → 스킬로 공식화 여부 결정
   - 사람 리뷰 필수

4. **이력서 노션 동기화** (#67)
   - page.tsx와 노션 md 파일 내용 불일치 — iOS 노션 파일 업데이트 필요

5. **이력서 디자인 최종 폴리싱** (#68)
   - 글자 크기/마진 미세 조정, 모바일 반응형 확인

### 🟢 Low

6. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

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
| 엔트리 수 | 156 | 165 | higher | ? |
| workflow solutions N | 10 | 10 (promote) | maintain | ? |
| moneyflow dispatch 토큰 절감 | 0 | 50K/워커 | lower_cost | 적용됨 (미측정) |

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
- [ ] 콘텐츠 생성 우선 (심화 엔트리)
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-22 (Session 19 — moneyflow tmux 4-Pane 오케스트레이션)
- **완료**: tmux 4-pane 레이아웃 + 마우스 지원
- **완료**: 워커 양방향 통신 (notify_architect + watch_inbox)
- **완료**: git worktree 병렬 격리 (create_worker_worktree + wo_merge)
- **완료**: 워커 프롬프트 구조화 + 토큰 절감 (가이드 파일 로드 제거)
- **완료**: compound + moneyflow push
- **다음**: 콘텐츠 생성 집중 + workflow promote-solution 검토
