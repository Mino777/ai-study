# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16h — Hermes 불필요 판정 + Flow Map s27 + Mermaid 근본 해결)
- **작성 주체**: Claude (Session 16h)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 144
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과, 테스트 34/34
- **Mermaid auto-fix**: 3규칙 (괄호/br/콜론) + ID 충돌 error 감지

### Hermes-First 스택 상태
- **판정**: 현재 불필요 (2026-04-19)
- **이유**: Claude Code Max + Gemini Flash로 충분
- **재검토 트리거**: 동시 에이전트 5개+ / 24/7 무인 운영 / 기억 손실 3회+ / OS 위임 5회+
- **이식 성과**: Compiled Truth 패턴 → docs/solutions/ 적용 완료

### aidy 프로젝트 상태 (4/19 /projects-sync)
- **architect**: s27 autoceo 완료 (v2.3~v2.6), ahead 1, WO-097~102 backlog 변동
- **ios**: v2.6 Gift Suggestions 완료, 동기화 완료, 554 tests
- **android**: v2.6 Gift Suggestions 완료, 동기화 완료, 663 tests
- **server**: v2.6 Gift Suggestions 완료, ahead 2, 796 tests

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 총 엔트리 수 | 144 | 150 | higher | ? |
| Mermaid subgraph/node 충돌 잔여 | 63 | 0 | lower | ? |

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **Mermaid subgraph/node ID 충돌 63건 일괄 정리**
   - `mermaid-fix.mjs`가 이미 감지. 나머지 파일 수동 수정 필요
   - 예상 크기: M

2. **긱뉴스 스카우트 결과 확인**
   - 22:00 KST 자동 실행 → Actions 탭에서 결과 확인
   - 예상 크기: S

### 🟡 Medium

3. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - tarosaju에서 `feat/ai-api-3layer-defense` 브랜치 작업 중
   - 예상 크기: M (프로젝트당)

4. **JIT 검색 성과 검증** — totalQueries 100 도달 시 적중률 분석
   - 현재 12 쿼리. 아직 멀음

5. **기존 Gemini 엔트리에 generated_by: gemini 소급 적용 — 추가분**
   - 이번에 12건 완료. 누락 있으면 추가

### 🟢 Low

6. **Compiled Truth _compiled-truth.md 추가 카테고리**
   - next-patterns (3건) → N=3 도달, Compiled Truth 대상
7. **인덱싱 자동화 (pre-commit 또는 CI)**

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: conductor worktree `la-paz` 존재 — 만지지 말 것
- tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중 (main 복귀 안 한 상태)
- aidy-architect: ahead 1, WO in-progress 디렉토리 변동
- aidy-server: ahead 2

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
- [ ] Mermaid 충돌 63건 정리 우선
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (append 금지)
- **완료된 큐 항목은 즉시 제거**
- **갱신 로그는 최근 1개만**
- **재사용 학습** → memory · solutions · retros 로 승격

---

## 📜 최근 갱신

### 2026-04-19 (Session 16h — Hermes 불필요 판정 + Flow Map s27 + Mermaid 근본 해결)
- **완료**: generated_by 소급 12건 + Compiled Truth 4카테고리
- **완료**: GBrain/OpenClaw/Hermes 불필요 판정
- **완료**: Flow Map 4편 s27 업데이트 (v2.3~v2.6)
- **완료**: Mermaid 3중 근본 해결 (br/콜론/ID충돌) + auto-fix 승격 + 34 테스트
- **다음**: Mermaid 충돌 63건 일괄 정리
