# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 9 — Superpowers+Hermes+aidy 패턴 이식 + 6프로젝트 배포)
- **작성 주체**: Claude (Session 9)
- **이유**: 8개 패턴 평가 / 7개 이식 / 6프로젝트 배포 완료 → 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 127 (+2)
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **AI Agent Directive**: **100%** (85/85 non-journal)
- **compound Phase**: 7 Phase (3b/4/4b/6 신규)
- **주요 시리즈**:
  - **Harness Journal** (000~025)
  - **iOS Journal** (000~009)
  - **Multi-Agent Orchestration Journal (Aidy)** (000~007)
  - **Flow Map for iOS Devs** (1·2·3·4·6·7편 완료, 5편 deferred)
- **Git 상태**: main clean, origin/main 동기
- **최근 major 변경**:
  - **Superpowers+Hermes+aidy 패턴 7개 이식** — compound 5→7 Phase
  - **review 2-Stage** — 6프로젝트 배포
  - **자기 평가 바이어스 3층 방어** — 16건 회고 분석 기반

### Tokenomics 현재 상태
- **7일 비용**: $5,111 (04/10~17, 세션 8 집중 작업 포함)
- **프로젝트별**: moneyflow 43%, tarosaju 25%, ai-study 15%, aidy 14%
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

### Layer 3 POC 현재 상태 (변동 없음)
- **적중률**: Top-5 93%, Top-1 73%, 토큰 절감 99.8%
- **Phase 3 통과**: ✅
- **다음**: 실전 관찰 계속 (3+ 세션 검증 중 1/3)

### aidy 4 레포 (관제 + 3 워커)
- **이식 완료**: review 2-Stage + Frozen Snapshot (전체), Anti-Rationalization (architect)
- **다음 aidy 세션(s9) 시작점**: `aidy-architect/HANDOFF.md`

### moneyflow / tarosaju (워커 프로젝트)
- **이식 완료**: compound 업그레이드 + review 2-Stage + Frozen Snapshot
- **현재 브랜치**: moneyflow=`docs/v0944-handoff`, tarosaju=`docs/next-plan`
- **주의**: main이 아닌 브랜치에 커밋됨. 머지 시점은 각 프로젝트 세션에서 결정

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — 스킬 자동 생성 첫 실행 + JIT 검증

1. **경험→스킬 자동 생성 첫 실행**
   - workflow(7건), mdx(5건), ai-pipeline(4건) — 3개 카테고리 N≥3
   - 각 카테고리 솔루션 읽고 공통 패턴 추출 → 스킬 초안 생성
   - 사람 리뷰 후 `.claude/commands/`에 커밋
   - 예상 크기: M

2. **JIT 검색 성과 검증 (2/3 세션)**
   - 실전 세션에서 JIT 검색 실제 사용 관찰
   - shadow-benchmark 재실행 → 적중률 80%+ 유지 확인
   - 예상 크기: S (관찰)

### 🟡 Medium — aidy s9 + 위키 유지보수

3. **aidy Session 9 박제 대기**
   - 트리거: aidy-architect에서 s9 완료 + compound

4. **이식 전 브랜치 확인 체크리스트 구현**
   - 크로스 프로젝트 이식 시 각 프로젝트 현재 브랜치 확인 자동화
   - 예상 크기: S

### 🟢 Low — 가치 시점 봐서

5. **Phase 3 — Cross-repo 인덱싱**
6. **인덱싱 자동화 (pre-commit 또는 CI)**
7. **Flow Map Part 5 재개 판단** — deferred (실 배포 미구축)

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **스킬 자동 생성 초안** — 사람 리뷰 게이트 필수
- **aidy s9 시작 시점** — 토큰 리밋 여유 확인 후

### 다른 세션 주의
- moneyflow · tarosaju 자체 세션 가능 — 세션 시작 시 `rtk git fetch`
- moneyflow는 `docs/v0944-handoff` 브랜치, tarosaju는 `docs/next-plan` 브랜치
- aidy 4 레포 동시 작업 가능 — `~/Develop/aidy-architect/HANDOFF.md` 확인

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
- [ ] `rtk git -C ~/Develop/mino-moneyflow fetch origin` + **브랜치 확인**
- [ ] `rtk git -C ~/Develop/mino-tarosaju fetch origin` + **브랜치 확인**
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `docs/retros/2026-04-17-session-9.md` (패턴 이식 + 바이어스 대응)
- [ ] `content/evaluation/agent-self-evaluation-bias-countermeasures.mdx`
- [ ] `content/harness-engineering/cross-project-pattern-porting-methodology.mdx`

### Phase 5: 작업 시작 (2분 내)
- [ ] 새 작업은 `/wt-branch <branch-name>` 으로 시작
- [ ] 작업 완료 후 `/compound` 로 retro · solution · ADR 박제
- [ ] 세션 종료 직전 이 NEXT.md 교체 (append 금지)

---

## 📝 부록: 자주 쓰는 명령

```bash
# 프로젝트 상태 확인
rtk git -C ~/Develop/mino-moneyflow fetch origin
rtk git -C ~/Develop/mino-tarosaju fetch origin
rtk git -C ~/Develop/aidy-architect fetch origin

# 프로젝트별 비용 분석
ccusage session --since YYYYMMDD --until YYYYMMDD --instances

# 새 작업 시작 (반드시)
/wt-branch ai-ops/<new-branch-name>

# ai-study 빌드 + validation
cd ~/Develop/ai-study && rtk npm run build

# vitest 회귀 테스트
rtk npm test -- scripts/__tests__/

# Layer 3 검색
rtk npm run search -- "query text"

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

### 2026-04-17 (Session 9 — 패턴 이식 + 6프로젝트 배포)
- **8개 패턴 평가** — Superpowers(3) + Hermes(3) + aidy(2)
- **7개 이식** — No-Placeholder, Anti-Rationalization, 2-Stage Review, Frozen Snapshot, 프로세스 개선, 스킬 자동 생성, NEXT.md Phase
- **6프로젝트 배포** — ai-study + moneyflow + tarosaju + aidy 3워커
- **compound 5→7 Phase** — 3b/4/4b/6 추가
- **엔트리 2건** — 바이어스 대응 + 패턴 이식 방법론
- **다음 순위**: 스킬 자동 생성 첫 실행 (workflow 7, mdx 5, ai-pipeline 4)
