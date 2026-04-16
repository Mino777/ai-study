# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 과거 60KB · 1032줄 누적 → Layer 1 프리픽스 오버헤드 + stale 누적. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-16 (Session 4 종료 직전)
- **작성 주체**: Claude (Session 4)
- **이유**: Mermaid `<br/>` warning 시스템 + Journal 024 사이클 종료 후 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 106 (+1, Journal 024)
- **카테고리**: 13 (prompt-engineering · context-engineering · harness-engineering · tokenomics · rag · agents · fine-tuning · evaluation · infrastructure · ios-ai · frontend-ai · android-ai · backend-ai)
- **주요 시리즈**:
  - **Harness Journal** (000~024)
  - **iOS Journal** (000~009)
  - **Multi-Agent Orchestration Journal (Aidy)** (000, 001, 002)
  - **Flow Map for iOS Devs** (1·2·3·4·6·7편 완료, 5편 deferred)
- **Git 상태**: main clean, origin/main 동기 (세션 시작 시 반드시 `rtk git fetch`)
- **최근 major 변경**:
  - Mermaid `<br/>` warning 시스템 도입 (warning-only, idempotent)
  - 잠재 부채 9건 즉시 발견 + 수정 (five-levers 7 + vector-search 1 + Journal 024)
  - vitest 7→16 (idempotency 케이스 별도 박제)
  - `docs/solutions/workflow/2026-04-16-solution-to-validator-promotion.md` — N=3 룰 메타 패턴 박제

### aidy 4 레포 (관제 + 3 워커)
- `aidy-architect` (관제 · markdown specs + tmux 4-pane)
- `aidy-server` (Spring Boot + Kotlin, 로컬 개발만)
- `aidy-ios` (Swift/TCA + Tuist, 시뮬레이터만)
- `aidy-android` (Compose + Kotlin, 에뮬레이터만)
- **Session 4 (10R + QA) 결과 박제 완료**: Journal 002 + 엔트리 3건 (Numeric Execution Evidence · Tuist+SPM Trap · Spring Boot CB)
- **배포 상태**: 3-client 모두 프로덕션 미구축 — [배포 설계 로드맵](/wiki/infrastructure/aidy-3-client-deployment-design-roadmap) 참조

### moneyflow / tarosaju (워커 프로젝트)
- **Git 상태**: 세션 시작 시 직접 fetch 확인 (다른 세션 작업 감지 필수 — Journal 003 squash merge 함정 주의)
- **이식 가능 패턴**: Circuit Breaker · 3-provider 폴백 · 프롬프트 캐싱 · AI 비용 추적 · wt-branch · text output guards · 5-Layer Defense · React Compiler + startTransition · Numeric Execution Evidence

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — 측정 가능한 문제 해결

1. **N=3 룰을 `compound-engineering-philosophy` 엔트리에 명시 추가**
   - Journal 024가 후속 후보로 적시 — solution → validator 승격 트리거를 *철학 엔트리* 에 박제
   - 위치: `content/harness-engineering/compound-engineering-philosophy.mdx`
   - 추가 섹션: "솔루션의 코드 가드 승격 시점" — `docs/solutions/workflow/2026-04-16-solution-to-validator-promotion.md` 인용
   - 예상 크기: S (한 섹션 + connections)

2. **JSX trap detector 확장 검토**
   - 현재 `api-contract-as-3-client-source-of-truth.mdx Line ~213`에 `{worker}` warning 1건 잔존
   - 본문 인라인 코드(`)로 감싸 해결할지 또는 detectJsxTraps 정밀도 개선할지 판단
   - 빌드 warning 0건 만들기

3. **Context Scaling Layer 3 POC (Chroma 로컬)**
   - Journal 024 다음 후보로 적힘
   - ai-study 에서 먼저 실험 (롤백 용이)
   - 섀도우 모드 1주 · JIT 응답 품질 vs 기존 전체 로드 비교
   - 예상 크기: L (별도 세션 권장)

### 🟡 Medium — 꾸준한 박제

4. **Flow Map 시리즈 Part 5 재개 판단**
   - 현재 deferred (실 배포 미구축)
   - [설계 로드맵](/wiki/infrastructure/aidy-3-client-deployment-design-roadmap) 의 Stage 1~2 (DB + 서버 호스팅) 실제 도입 후 Flow Map 전환
   - 트리거: 실제 Neon + Fly 연결 완료 시점

5. **다음 Harness Journal — 후보**
   - SearchDialog lazy fetch 운영 데이터 (Session 2 박제 후 며칠 사용)
   - Mermaid 4번째 재발 대응 + 5번째 막은 패턴 (Journal 024 후속)
   - aidy Session 4 의 안정성 인프라 (RateLimit · RequestId · CB) 운영 후기

### 🟢 Low — 가치 시점 봐서

6. **CLAUDE.md "세션 시작 4 파일 로드" 규약 재검토**
   - NEXT.md 가 필수 로드. Session 3 정리 후에도 정말 필수인지 판단
   - 선택적 로드로 격하 검토 (handoff 함정 섹션 제안)

7. **`/compound` 스킬 확장**
   - NEXT.md 자동 정리 (완료 큐 감지 → 제거)
   - 승격 후보 자동 제안 (재사용 가치 있는 학습 발견 시 solution/retro 이관 제안)

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **Part 5 실제 도입 시점** — 사용자 · 예산 · 일정 결정
- **Layer 3 POC 투입 시간** — Chroma 로컬 셋업 · 섀도우 모드 1주 운영 여유 확보 후

### 다른 세션 주의
- moneyflow · tarosaju 는 자체 세션이 있을 수 있음 — 세션 시작 시 반드시 git fetch + 타 세션 작업 흔적 확인 ([Journal 019](/wiki/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup))
- Squash merge 함정: 다른 세션이 squash merge 한 branch 를 로컬이 모르면 충돌 ([Journal 003](/wiki/harness-engineering/harness-journal-003-squash-merge-trap-pattern))
- aidy 4 레포 동시 작업도 발생 가능 — `~/Develop/aidy-architect/HANDOFF.md` 확인

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기 (프로젝트 규약)
- [ ] `SPEC.md` 읽기 (엔티티 + AI Agent Contract)
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기 (상황별 라우팅)

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택

### Phase 3: Git 동기화 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `rtk git -C ~/Develop/mino-moneyflow fetch origin`
- [ ] `rtk git -C ~/Develop/mino-tarosaju fetch origin`
- [ ] aidy 작업 검토 시 `~/Develop/aidy-architect/HANDOFF.md` 읽기
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교 → 다른 세션 작업 감지 시 갱신

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `docs/retros/2026-04-16-session-4.md` (이전 세션)
- [ ] `docs/solutions/workflow/2026-04-16-solution-to-validator-promotion.md` (메타 패턴)

### Phase 5: 작업 시작 (2분 내)
- [ ] 새 작업은 `/wt-branch <branch-name>` 으로 시작 (Journal 003 함정 회피)
- [ ] 작업 완료 후 `/compound` 로 retro · solution · ADR 박제
- [ ] 세션 종료 직전 이 NEXT.md 교체 (append 금지)

---

## 📝 부록: 자주 쓰는 명령

```bash
# 프로젝트 상태 확인
rtk git -C ~/Develop/mino-moneyflow fetch origin
rtk git -C ~/Develop/mino-tarosaju fetch origin

# 새 작업 시작 (반드시)
/wt-branch ai-ops/<new-branch-name>

# ai-study 빌드 + validation (Mermaid warning 포함)
cd ~/Develop/ai-study && rtk npm run build

# vitest 회귀 테스트
rtk npm test -- scripts/__tests__/

# 사이클 종료
/compound
```

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (과거 append-only 운영 폐기)
- **완료된 큐 항목은 즉시 제거** (docs/retros 또는 docs/solutions 로 승격 후)
- **갱신 로그는 최근 1개만** — 누적 금지
- **재사용 가치 있는 학습** → 이 문서 밖 (CLAUDE.md · memory · solutions · retros)
- **세션 종료 직전** 갱신 후 commit + push

---

## 📜 최근 갱신

### 2026-04-16 (Session 4 종료 직전)
- Mermaid `<br/>` warning 시스템 신규 (`detectUnquotedSpecialCharLabels`)
- vitest 7→16 (idempotency 케이스 별도 박제)
- 즉시 발견된 잠재 부채 9건 수정 (five-levers 7 + vector-search 1)
- Harness Journal 024 — solution → validator 승격 메타 패턴 박제
- `docs/solutions/workflow/2026-04-16-solution-to-validator-promotion.md` — N=3 룰 메타 패턴
- `feedback_solution_validator_promotion` 메모리 신규
- 큐에서 "validate-content.mjs Mermaid warning" 항목 제거 (완료) → 새 후보 추가 (N=3 룰 철학 엔트리에 박제 · JSX trap detector 확장 · Layer 3 POC 유지)
