# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 8 — Directive 100% + 프로젝트별 비용 분석)
- **작성 주체**: Claude (Session 8)
- **이유**: Directive 100% 달성 + ccusage 프로젝트별 분석 + 인제스트 역링크 자동화 → 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 123 (+4, 신규 엔트리 2 + 기존 2 카운트 보정)
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **AI Agent Directive**: **100%** (79/79 non-journal) — 세션 8에서 41%→100% 달성
- **주요 시리즈**:
  - **Harness Journal** (000~025)
  - **iOS Journal** (000~009)
  - **Multi-Agent Orchestration Journal (Aidy)** (000 ~ 007)
  - **Flow Map for iOS Devs** (1·2·3·4·6·7편 완료, 5편 deferred)
- **Git 상태**: main clean, origin/main 동기
- **최근 major 변경**:
  - **Directive 100%** — 6개 병렬 에이전트로 55개 파일 일괄 추가
  - **프로젝트별 비용 분석** — moneyflow 45% + tarosaju 26% = 워커 70%
  - **인제스트 역링크** — /ingest Phase 5b 크로스 업데이트 자동화

### Tokenomics 현재 상태
- **일평균 비용**: $194/day (28일 평균, 전 프로젝트 합산)
- **프로젝트별**: moneyflow $552/day (45%), tarosaju $315/day (26%), ai-study $185/day (15%)
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+
- **레버 적용 상태**: A1(CLAUDE.md −45%) + A4(git 지시문 제거) + C2(MCP 5K) + D2(Haiku 서브에이전트) — 실효 측정 대기 (3 사이클 후)

### Layer 3 POC 현재 상태 (변동 없음)
- **인프라**: ✅ 작동 (1~3ms 응답, brute force, JSON 인덱스)
- **영어 쿼리**: ✅ 적중률 우수 (Top-1 정답)
- **한국어 쿼리**: ⚠️ 개선됨 (multilingual-e5-small, 0%→60%)
- **인덱싱 범위**: Phase 2a 완료 (솔루션 Top-1 진입)
- **다음**: Phase 3 섀도우 모드 + 측정

### aidy 4 레포 (관제 + 3 워커)
- **Session 5~8 박제 완료** — Journal 003~007 + 카테고리 엔트리 7건
- **Runner 현황**: MBA에 3대 운영
- **다음 aidy 세션(s9) 시작점**: `aidy-architect/HANDOFF.md`

### moneyflow / tarosaju (워커 프로젝트)
- **비용 집중**: 전체의 70% — `.claudeignore` 최적화 우선 타겟
- **Git 상태**: 세션 시작 시 직접 fetch 확인

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — 레버 실효 측정 + Layer 3 Phase 3

1. **A4+C2+D2 레버 실효 측정**
   - 3 사이클 경과 후 `ccusage session --instances`로 프로젝트별 before/after 비교
   - 특히 D2(Haiku 서브에이전트) 품질 저하 여부 관찰
   - 예상 크기: S

2. **Phase 3 — 섀도우 모드 + 측정**
   - 기존 전체 로드 vs JIT 주입 출력 차이 (LLM-as-Judge)
   - 예상 크기: M

### 🟡 Medium — 일방향 연결 해소 + aidy s9

3. **일방향 연결 332건 해소**
   - 인제스트 역링크 자동화(Phase 5b) 실전 첫 투입
   - 스크립트로 일괄 역링크 추가 검토
   - 예상 크기: M

4. **aidy Session 9 박제 대기**
   - s8 backlog: WO-011(Swift 6) / WO-013(워크플로 통합) / WO-016 정상 시나리오
   - 트리거: aidy-architect에서 s9 완료 + compound

5. **JSX trap detector 정밀도 개선**
   - `api-contract-as-3-client-source-of-truth.mdx Line ~213` `{worker}` warning 1건 잔존

### 🟢 Low — 가치 시점 봐서

6. **Phase 3 — Cross-repo 인덱싱**
7. **인덱싱 자동화 (pre-commit 또는 CI)**
8. **Flow Map Part 5 재개 판단** — deferred (실 배포 미구축)

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **레버 실효 측정 시점** — 최소 3 사이클 (세션 3회) 경과 후
- **일방향 해소 방식** — 스크립트 일괄 vs 인제스트 시 점진적
- **aidy s9 시작 시점** — 토큰 리밋 여유 확인 후

### 다른 세션 주의
- moneyflow · tarosaju 자체 세션 가능 — 세션 시작 시 `rtk git fetch`
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
- [ ] `rtk git -C ~/Develop/mino-moneyflow fetch origin`
- [ ] `rtk git -C ~/Develop/mino-tarosaju fetch origin`
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `docs/retros/2026-04-17-session-8.md` (Directive 100% + 비용 분석)
- [ ] `content/tokenomics/project-level-cost-analysis-pattern.mdx` (프로젝트별 비용 패턴)
- [ ] `content/harness-engineering/parallel-agent-batch-modification-pattern.mdx` (병렬 에이전트 패턴)

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

# 프로젝트별 비용 분석 (신규)
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

### 2026-04-17 (Session 8 — Directive 100% + 프로젝트별 비용)
- **Directive 100%** — 79/79 non-journal, 6 병렬 에이전트 투입
- **프로젝트별 비용** — ccusage --instances 첫 활용, moneyflow 45% + tarosaju 26%
- **인제스트 역링크** — /ingest Phase 5b 크로스 업데이트 자동화
- **ccusage 재측정** — RTK 53M, 일평균 $194, cache 98%+
- **엔트리 2건 신규** — 프로젝트별 비용 패턴 + 병렬 에이전트 패턴
- **다음 순위**: 레버 실효 측정 + Phase 3 섀도우 모드 + 일방향 332건 해소
