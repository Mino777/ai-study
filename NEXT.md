# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 10 — JIT 히트 카운트 + 스킬 자동 생성 첫 실행)
- **작성 주체**: Claude (Session 10)
- **이유**: NEXT.md 큐 🔴 High 1번 실행 완료 → 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 127
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **AI Agent Directive**: **100%** (85/85 non-journal)
- **슬래시 커맨드**: **11개** (+validate-mdx, validate-ai-output, promote-solution)
- **compound Phase**: 7 Phase (3b/4/4b/6 포함)
- **Git 상태**: main clean, origin/main 동기
- **최근 major 변경**:
  - **JIT 검색 히트 카운트** — search.mjs → data/search-hits.json → manifest → UI
  - **스킬 3개 자동 생성** — solutions 16건에서 메타 패턴 추출

### JIT 히트 카운트 현황
- **totalQueries**: 1 (방금 첫 실행)
- **저장소**: `data/search-hits.json` (git 추적)
- **UI**: 위키 목록/상세 페이지에 "JIT N회" 배지
- **다음 마일스톤**: 100+ 쿼리 축적 후 0회 엔트리 하이라이트 판단

### Tokenomics 현재 상태
- **7일 비용**: $5,111 (04/10~17)
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

### Layer 3 POC 현재 상태 (변동 없음)
- **적중률**: Top-5 93%, Top-1 73%, 토큰 절감 99.8%
- **Phase 3 통과**: ✅
- **다음**: 실전 관찰 계속 (3+ 세션 검증 중 — 히트 카운트로 관찰성 확보)

### aidy 4 레포 (관제 + 3 워커)
- **다음 aidy 세션(s9) 시작점**: `aidy-architect/HANDOFF.md`

### moneyflow / tarosaju (워커 프로젝트)
- **현재 브랜치**: moneyflow=`docs/v0944-handoff`, tarosaju=`docs/next-plan`
- **JIT 검색**: ai-study에만 적용. 워커 프로젝트는 미적용

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — 스킬 검증 + JIT 관찰

1. **스킬 dry-run 검증**
   - `/validate-mdx`를 실제 MDX 파일에 실행 → false positive 비율 측정
   - `/validate-ai-output`를 최근 AI 생성 엔트리에 실행 → 함정 탐지 테스트
   - false positive > 5% 시 grep 패턴 정밀도 조정
   - 예상 크기: S

2. **JIT 검색 성과 검증 (2/3 세션)**
   - 실전 세션에서 JIT 검색 실제 사용 관찰
   - 히트 카운트 축적 확인 (totalQueries 추적)
   - shadow-benchmark 재실행 → 적중률 80%+ 유지 확인
   - 예상 크기: S (관찰)

### 🟡 Medium — aidy s9 + 유지보수

3. **aidy Session 9 박제 대기**
   - 트리거: aidy-architect에서 s9 완료 + compound

4. **히트 카운트 100+ 도달 시 0회 엔트리 표시**
   - totalQueries > 100 이후 판단
   - 0회 엔트리를 위키 목록에서 시각적으로 구분 (opacity 낮추기 등)
   - 예상 크기: S

### 🟢 Low — 가치 시점 봐서

5. **Phase 3 — Cross-repo 인덱싱**
6. **인덱싱 자동화 (pre-commit 또는 CI)**
7. **Flow Map Part 5 재개 판단** — deferred (실 배포 미구축)

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **0회 엔트리 하이라이트 방식** — 데이터 충분히 쌓인 후 사용자와 논의
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
- [ ] `docs/retros/2026-04-17-session-10.md` (히트 카운트 + 스킬 자동 생성)
- [ ] `.claude/commands/validate-mdx.md` (새 스킬 확인)
- [ ] `.claude/commands/promote-solution.md` (새 스킬 확인)

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

### 2026-04-17 (Session 10 — JIT 히트 카운트 + 스킬 자동 생성)
- **JIT 히트 카운트 구현** — search.mjs → data/search-hits.json → manifest → UI
- **스킬 3개 자동 생성** — /validate-mdx, /validate-ai-output, /promote-solution
- **NEXT.md 큐 🔴 High 1번 완료** → 큐 재정렬 (스킬 검증 + JIT 관찰로 교체)
- **슬래시 커맨드**: 8 → 11
