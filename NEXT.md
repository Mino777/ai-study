# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 7 — Aidy Journal 007 박제 직후)
- **작성 주체**: Claude (Session 7)
- **이유**: Aidy Session 8 박제(Journal 007) + Journal 006 역링크 보강 → 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 119 (+1, Aidy Journal 007)
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **주요 시리즈**:
  - **Harness Journal** (000~025)
  - **iOS Journal** (000~009)
  - **Multi-Agent Orchestration Journal (Aidy)** (000 ~ **007**)
  - **Flow Map for iOS Devs** (1·2·3·4·6·7편 완료, 5편 deferred)
- **Git 상태**: main clean, origin/main 동기 (세션 시작 시 반드시 `rtk git fetch`)
- **최근 major 변경**:
  - **Aidy Journal 007** — CI 인프라 독립화 4 WO + Hybrid Fallback + Mark-step 패턴 + QA 에이전트 배치
  - **Journal 006 역링크 보강** — "후속 WO 3건 (Session 8 대기)" → "후속 WO 3건 → Session 8 완료" + Journal 007 링크

### Layer 3 POC 현재 상태 (변동 없음)
- **인프라**: ✅ 작동 (1~3ms 응답, brute force, JSON 인덱스)
- **영어 쿼리**: ✅ 적중률 우수 (Top-1 정답)
- **한국어 쿼리**: ⚠️ 부족 (모델 한계 — `Xenova/all-MiniLM-L6-v2` 영어 위주)
- **인덱싱 범위**: Phase 2a 완료 (솔루션 Top-1 진입)
- **다음 변수**: 모델 교체 > 라우터 > 섀도우 모드

### aidy 4 레포 (관제 + 3 워커)
- **Session 5~8 박제 완료** — Journal 003~007 + 카테고리 엔트리 7건
- **Session 8 종료 상태** (aidy-architect commit `e3a08ea`): WO-012/014/015/016 done + QA 에이전트 배치
- **Runner 현황**: MBA에 3대 운영 (iOS self-hosted only / server·android Hybrid)
- **배포 상태**: 3-client 모두 프로덕션 미구축
- **다음 aidy 세션(s9) 시작점**: `aidy-architect/HANDOFF.md` — WO-011(Swift 6) / WO-013(워크플로 통합) / billing 복구 시 WO-016 정상 시나리오 검증

### moneyflow / tarosaju (워커 프로젝트)
- **moneyflow**: 캘리브레이션 카드 fix + Content Pipeline 테스트 (최신 `3bc894d`)
- **tarosaju**: NEXT.md 리뉴얼 + 결과 컴포넌트 dynamic import (최신 `c51be1c`)
- **Git 상태**: 세션 시작 시 직접 fetch 확인

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — Layer 3 Phase 2 완료 + 다음 변수

1. ~~**Phase 2b 다국어 모델 비교**~~ ✅ `multilingual-e5-small` 채택 (한국어 0%→60%)
2. ~~**Phase 2c 쿼리 라우터 v0**~~ ✅ 규칙 기반 라우터 통합 (��러/기술/트리거)
3. ~~**N=3 룰 박제**~~ ✅ compound-engineering-philosophy 원칙 9

4. **Phase 3 — 섀도우 모드 + 측정**
   - 기존 전체 로드 vs JIT 주입 출력 차이 (LLM-as-Judge)
   - 예상 크기: M

### 🟡 Medium — Aidy 후속 (s9) + 꾸준한 박제

4. **aidy Session 9 박제 대기**
   - s8 종료 후 backlog:
     - **WO-011** (Swift 6 Sendable) — iOS 의존성 마이그레이션
     - **WO-013** (워크플로 통합) — test.yml + ai-review.yml 중복 제거
     - **WO-016 정상 시나리오 검증** — billing 복구 시 primary green + fallback skipped 실증
   - 기타 P1:
     - Password reset SMTP Phase 2 / SSE Phase 3 / Multi-Provider Fallback P-004 Phase 2
   - 트리거: aidy-architect에서 s9 완료 + compound

5. **JSX trap detector 정밀도 개선**
   - `api-contract-as-3-client-source-of-truth.mdx Line ~213` `{worker}` warning 1건 잔존

6. **Flow Map 시리즈 Part 5 재개 판단** — deferred (실 배포 미구축)

### 🟢 Low — 가치 시점 봐서

7. **Phase 3 — Cross-repo 인덱싱**
8. **인덱싱 자동화 (pre-commit 또는 CI)**
9. **CLAUDE.md "세션 시작 4 파일 로드" 규약 재검토**

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **Part 5 실제 도입 시점** — 사용자 · 예산 · 일정 결정
- **다국어 모델 다운로드 크기** — multilingual-e5-small 은 ~100MB. 디스크 여유 확인 후 진행
- **aidy s9 시작 시점** — 토큰 리밋 여유 확인 후

### 다른 세션 주의
- moneyflow · tarosaju 자체 세션 가능 — 세션 시작 시 `rtk git fetch`
- Squash merge 함정: 다른 세션이 squash merge 한 branch
- aidy 4 레포 동시 작업 가능 — `~/Develop/aidy-architect/HANDOFF.md` 확인

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기 (프로젝트 규약)
- [ ] `SPEC.md` 읽기 (엔티티 + AI Agent Contract)
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기 (상황별 라우팅)

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택 (🔴 #1 Phase 2b 다국어 임베딩 모델 비교가 ROI 가장 큼)

### Phase 3: Git 동기화 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `rtk git -C ~/Develop/mino-moneyflow fetch origin`
- [ ] `rtk git -C ~/Develop/mino-tarosaju fetch origin`
- [ ] aidy 작업 검토 시 `~/Develop/aidy-architect/HANDOFF.md` 읽기
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `content/harness-engineering/aidy-journal-007-ci-infra-independence-hybrid-fallback.mdx` (Hybrid Fallback + Mark-step)
- [ ] `content/harness-engineering/aidy-journal-006-ios-ci-self-hosted-runner-migration.mdx` (진단 3회 정정)
- [ ] `content/harness-engineering/harness-journal-025-jit-retrieval-poc-phase1.mdx` (POC 결과 + 다음 변수)

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
rtk git -C ~/Develop/aidy-architect fetch origin

# 새 작업 시작 (반드시)
/wt-branch ai-ops/<new-branch-name>

# ai-study 빌드 + validation (Mermaid warning 포함)
cd ~/Develop/ai-study && rtk npm run build

# vitest 회귀 테스트
rtk npm test -- scripts/__tests__/

# Layer 3 검색 (1141 청크 인덱스)
rtk npm run search -- "query text"

# 인덱스 재생성 (콘텐츠 추가 후)
rtk npm run embed-content

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

### 2026-04-17 (Session 7 — Aidy Journal 007 + Layer 3 Phase 2b/2c)
- **Aidy Journal 007 박제** — CI 인프라 독립화 4 WO + ADR-010 Hybrid Fallback + Mark-step 패턴
- **Layer 3 Phase 2b** — 3 모델 벤치마크 → `multilingual-e5-small` 채택 (한국어 Top-1 0%→60%)
- **Layer 3 Phase 2c** — 규칙 기반 쿼리 라우터 v0 (에러/기술/트리거 매칭, 일반 대화 skip)
- **N=3 룰** — compound-engineering-philosophy 원칙 9에 승격 트리거 명시
- CLAUDE.md에 Layer 3 인프라 정보 추가
- 엔트리 수 118 → 119
- Karpathy LLM Wiki 패턴 /ingest + SWOT 비교 분석 박제
- 위키 린트 + wiki-index.md 자동 생성
- 토큰 레버 4종 적용 (A1 CLAUDE.md −45% + A4 + C2 + D2)
- **다음 순위**: ccusage 재측정 + 인제스트 크로스 업데이트 + Directive 70%+
