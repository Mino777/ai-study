# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 11 — 스킬 검증 + Aidy Journal 박제)
- **작성 주체**: Claude (Session 11)
- **이유**: NEXT.md 큐 High + Medium 완료 → 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 129
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **AI Agent Directive**: **100%** (85/85 non-journal)
- **슬래시 커맨드**: **11개** (validate-mdx, validate-ai-output, promote-solution 포함)
- **compound Phase**: 7 Phase (3b/4/4b/6 포함)
- **Git 상태**: main clean, origin/main 동기 예정
- **최근 major 변경**:
  - **스킬 dry-run 검증** — validate-mdx FP 0%로 보강, validate-ai-output clean 확인
  - **Aidy Journal 008-009** — s9-s14 박제 (UI Test + Stall Detection + 3-way Dispatch)

### JIT 히트 카운트 현황
- **totalQueries**: 6 (아직 축적 초기)
- **저장소**: `data/search-hits.json` (git 추적)
- **UI**: 위키 목록/상세 페이지에 "JIT N회" 배지
- **다음 마일스톤**: 100+ 쿼리 축적 후 0회 엔트리 하이라이트 판단

### Tokenomics 현재 상태
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

### Layer 3 POC 현재 상태 (변동 없음)
- **적중률**: Top-5 93%, Top-1 73%, 토큰 절감 99.8%
- **Phase 3 통과**: ✅
- **다음**: 실전 관찰 계속 (3+ 세션 검증 중 — 히트 카운트로 관찰성 확보)

### aidy 4 레포 (관제 + 3 워커)
- **최신 상태**: s14 종료, WO 32건 done, 637 tests, api-contract v0.4
- **다음 aidy 세션 시작점**: `aidy-architect/HANDOFF.md`

### moneyflow / tarosaju (워커 프로젝트)
- **현재 브랜치**: moneyflow=`docs/v0944-handoff`, tarosaju=`docs/next-plan`
- **JIT 검색**: ai-study에만 적용. 워커 프로젝트는 미적용

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — 새 콘텐츠 + 검증

1. **validate-mdx Trap 3 stress test**
   - JSX `{}` 패턴이 코드 블록 밀집 파일에서 FP 발생 가능
   - 코드 블록 밀집 엔트리 5개 선정 → dry-run → FP 비율 측정
   - 예상 크기: S

2. **JIT 검색 성과 검증 (3/3 세션)**
   - totalQueries 추적 + shadow-benchmark 안정성 확인
   - 3세션 연속 93%+ 유지 시 Layer 3 검증 완료 선언
   - 예상 크기: S (관찰)

### 🟡 Medium — 유지보수 + 품질

3. **히트 카운트 100+ 도달 시 0회 엔트리 표시**
   - totalQueries > 100 이후 판단
   - 0회 엔트리를 위키 목록에서 시각적으로 구분 (opacity 낮추기 등)
   - 예상 크기: S

4. **미완성 마커 정리**
   - harness-journal-003 "구현 예정" / tokenomics-catalog "작성 필요"
   - 빌드 경고 2건 해소
   - 예상 크기: S

### 🟢 Low — 가치 시점 봐서

5. **Phase 3 — Cross-repo 인덱싱**
6. **인덱싱 자동화 (pre-commit 또는 CI)**
7. **Flow Map Part 5 재개 판단** — deferred (실 배포 미구축)

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **0회 엔트리 하이라이트 방식** — 데이터 충분히 쌓인 후 사용자와 논의

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
- [ ] `rtk git -C ~/Develop/aidy-architect fetch origin` + **HANDOFF.md 세션 번호 확인**
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `docs/retros/2026-04-17-session-11.md` (스킬 검증 + Aidy 박제)
- [ ] `content/harness-engineering/aidy-journal-008-*` (UI Test)
- [ ] `content/harness-engineering/aidy-journal-009-*` (Stall Detection + 3-way)

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

# JIT 히트 카운트 확인
cat data/search-hits.json | jq '.totalQueries, (.hits | to_entries | sort_by(-.value) | .[:10])'

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

### 2026-04-17 (Session 11 — 스킬 검증 + Aidy Journal 박제)
- **스킬 dry-run 검증 완료** — validate-mdx FP 보강, validate-ai-output clean
- **Aidy Journal 008-009** — s9-s14 박제 (6세션 → 2 Journal 통합)
- **JIT 검색** — shadow-benchmark 93% 유지, 히트 카운트 6회
- **큐 재정렬** — High 2개 완료 → Trap 3 stress test + JIT 3/3 검증으로 교체
