# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 5 종료 직전)
- **작성 주체**: Claude (Session 5)
- **이유**: Aidy 생태계 스프린트(aidy-architect Session 5/6) 박제 10 엔트리 + 기존 문서 연결 보강 사이클 종료 → 다음 세션 부트스트랩

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 117 (+10, Journal 003/004/005 + SSE 3-플랫폼 + 백엔드 2 + 하네스 2)
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **주요 시리즈**:
  - **Harness Journal** (000~025)
  - **iOS Journal** (000~009)
  - **Multi-Agent Orchestration Journal (Aidy)** (000 · 001 · 002 · **003 · 004 · 005**)
  - **Flow Map for iOS Devs** (1·2·3·4·6·7편 완료, 5편 deferred)
- **Git 상태**: main clean, origin/main 동기 (세션 시작 시 반드시 `rtk git fetch`)
- **최근 major 변경**:
  - **Aidy Journal 003** — autoceo 병렬 dispatch 토큰 경제성 (Session 6 R9 429 순차 재개)
  - **Aidy Journal 004** — Test Evidence 정책 실효성 관찰 (s4 → s5 QA 라운드 불필요)
  - **Aidy Journal 005** — ADR-008 SSE Phase 1→2 점진 도입
  - **SSE 3-플랫폼 0-dep** — backend/iOS/Android (외부 라이브러리 0)
  - **backend-ai**: Password Reset 보안 + pg_trgm GIN 박제
  - **harness-engineering**: Worker Prompts Logging + tmux flush 자동화 박제

### Layer 3 POC 현재 상태 (변동 없음)
- **인프라**: ✅ 작동 (1~3ms 응답, brute force, JSON 인덱스)
- **영어 쿼리**: ✅ 적중률 우수 (Top-1 정답)
- **한국어 쿼리**: ⚠️ 부족 (모델 한계 — `Xenova/all-MiniLM-L6-v2` 영어 위주)
- **인덱싱 범위**: Phase 2a 완료 (솔루션 Top-1 진입)
- **다음 변수**: 모델 교체 > 라우터 > 섀도우 모드

### aidy 4 레포 (관제 + 3 워커)
- **Session 5/6 박제 완료** — Journal 003/004/005 + 카테고리 엔트리 7건
- **Session 6 종료 상태** (aidy-architect commit `5a75faf`): R1~R9 완주 / 466 tests / API v0.2.5 / V12
- **배포 상태**: 3-client 모두 프로덕션 미구축 — [배포 설계 로드맵](/wiki/infrastructure/aidy-3-client-deployment-design-roadmap) 참조
- **다음 aidy 세션(s7) 시작점**: `aidy-architect/HANDOFF.md` P1 — Password reset SMTP 통합 / SSE Phase 3 / P-004 Phase 2

### moneyflow / tarosaju (워커 프로젝트)
- **Git 상태**: 세션 시작 시 직접 fetch 확인 ([Journal 003 squash merge 함정](/wiki/harness-engineering/harness-journal-003-squash-merge-trap-pattern))
- **이식 가능 패턴** (이번 세션 신규 포함):
  - Circuit Breaker · 3-provider 폴백 · 프롬프트 캐싱 · 5-Layer Defense
  - React Compiler + startTransition · Numeric Execution Evidence · Mermaid warning
  - **Worker Prompts Logging** (multi-agent 하네스가 있다면)
  - **tmux flush 자동화** (architect-cli 패턴)
  - **SSE 0-dep 패턴** (3 플랫폼 각자의 표준 API)
  - **Password Reset 보안 5원칙** (enumeration 방지 + 쿨다운 기존 토큰 유지)

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — Aidy 세션 7 박제 대기

0. **Aidy Journal 006 — WO-010 + ADR-009 iOS CI self-hosted runner 전환**
   - aidy-architect 세션 7 이 2026-04-17 자로 이미 종료됨 (s6 종료 후 P3 인프라 + WO-010 복구)
   - 새 커밋 2건: `a4f8861 v0.7.1 (P3 인프라)` + `0e23007 v0.7.2 (WO-010 iOS CI)`
   - **핵심 박제 재료**:
     - **진단 3회 정정 프로세스** — 1차 tuist↔macos-14 미스매치(exit 134) → 2차 결제 차단(payments have failed) → 3차 ai-review.yml 알림 폭탄 → 최종 self-hosted 전환
     - **self-hosted runner trade-off** — 사용자 Mac(`jominhoui-mba-ios`), macOS 26.3.1 + Xcode 26.3 + tuist 4.180.0 사전 설치, launchd user agent 상시 실행
     - **실측 수치** — 1m 56s / 124 tests / 10 suites, 4월 macOS 분 180min → **0min**
     - **후속 WO 3건** — WO-011 Swift 6 Sendable / WO-012 Node.js 24 (시급, 2026-06-02 마이그레이션) / WO-013 워크플로 통합
   - **묶어 박제할 것** — P3-9 `ci-status.sh` (gh CLI + jq, `--watch`/`--json`/`--since`), `/monitor` Phase 6, `/gate-2` Phase 0 통합
   - **출처**:
     - `aidy-architect/HANDOFF.md` L1~L28 (세션 7 요약)
     - `aidy-architect/specs/decisions/ADR-009.md`
     - aidy-ios 커밋 `9c3e715` (main push 경로 green 확인) + `3e77334` (macos-15 runner + path filter)
   - 예상 크기: M (Journal 003~005 수준, ~200 라인)

1. **기존 엔트리 출처 보강** (Journal 006 박제 세션에 같이 처리)
   - `aidy-journal-003-parallel-dispatch-token-economics.mdx` "출처" 섹션 — `a4f8861 v0.7.1` 커밋 SHA 추가 (s6 교훈이 실제 도구로 박제된 시점)
   - `tmux-flush-automation-pattern.mdx` "출처" 섹션 — 동일 커밋 + `ci-status.sh` 파일 경로 추가
   - 변경 최소 (각 1~2줄 edit)

### 🔴 High — Layer 3 Phase 2 핵심 변수

2. **다국어 임베딩 모델 비교 (POC Phase 2b)** — **여전히 핵심 큐**
   - `Xenova/all-MiniLM-L6-v2` vs `Xenova/multilingual-e5-small` vs (옵션) `Xenova/paraphrase-multilingual-MiniLM-L12-v2`
   - 동일 7개 쿼리 (Phase 1과 동일) 재측정 → 한국어 적중률 비교표
   - `embed-content.mjs` 의 모델 ID 한 줄 교체 + 인덱스 별도 파일로 (`public/embeddings.{model}.json`)
   - 메모리 룰: [POC 베이스라인 변수 동시 측정](memory:feedback_poc_baseline_variables) 적용 — 모델 2~3개 동시 베이스라인
   - 예상 크기: M

3. **Phase 2c — 쿼리 라우터 v0 (규칙 기반)**
   - 에러 키워드 / 명시 트리거 (`/search`) 만 검색 실행 — 일반 대화는 skip
   - 안 그러면 [엔트리 §10 안티패턴](/wiki/context-engineering/context-scaling-3-layer-architecture) "모든 쿼리에 RAG → Layer 3 가 선형 비용 회귀"
   - 예상 크기: S (정규식/키워드 매칭)

4. **N=3 룰을 `compound-engineering-philosophy` 엔트리에 명시 추가**
   - [Journal 024](/wiki/harness-engineering/harness-journal-024-solution-to-validator-promotion) 후속 — solution → validator 승격 트리거를 *철학 엔트리* 에 박제
   - 예상 크기: S

### 🟡 Medium — Aidy 후속 (s8) + 꾸준한 박제

5. **aidy Session 8 박제 대기 (아직 미실행)**
   - s7 종료 후 등록된 WO-011/012/013 완료 시점에 Journal 007 박제 후보:
     - **WO-011 Swift 6 Sendable** — iOS 의존성 마이그레이션
     - **WO-012 Node.js 24** — 3 워커 모두. 2026-06-02 강제 마이그레이션이라 **시급**
     - **WO-013 워크플로 통합** — test.yml + ai-review.yml + 새 워크플로
   - 기타 HANDOFF P1 잔여:
     - **Password reset SMTP Phase 2** — 이메일 템플릿 + bounce 처리
     - **SSE Phase 3** — Anthropic official event 전수 (error/ping/usage)
     - **P-004 Phase 2 Multi-Provider Fallback** — 2nd API key 확보 후
   - 트리거: aidy-architect 에서 s8 완료 + compound

6. **JSX trap detector 정밀도 개선**
   - `api-contract-as-3-client-source-of-truth.mdx Line ~213` `{worker}` warning 1건 잔존
   - 본문 인라인 코드(`)로 감싸 해결 또는 detectJsxTraps 룰 보강
   - 세션 5에서 추가된 `<col>` 같은 HTML void element 패턴은 별도로 `validate-content.mjs` 사전 경고 추가 검토 (솔루션 #3 참조)

7. **Flow Map 시리즈 Part 5 재개 판단**
   - 현재 deferred (실 배포 미구축)
   - 트리거: 실제 Neon + Fly 연결 완료 시점

### 🟢 Low — 가치 시점 봐서

8. **Phase 3 — Cross-repo 인덱싱**
   - `aidy-architect/docs/solutions/`, `mino-moneyflow/docs/solutions/`, `mino-tarosaju/docs/solutions/` 도 ai-study 인덱스에 포함
   - sync 전략 설계 필요 (단방향 vs 양방향)

9. **인덱싱 자동화 (pre-commit 또는 CI)**
   - 새 .mdx/.md 커밋 시 재임베딩 자동
   - 단, 모델 다운로드 환경(CI)이라 시간/캐시 전략 필요

10. **CLAUDE.md "세션 시작 4 파일 로드" 규약 재검토**
   - 선택적 로드로 격하 검토 (handoff 함정 섹션 제안)

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기 (자율 처리 X)
- **Part 5 실제 도입 시점** — 사용자 · 예산 · 일정 결정
- **다국어 모델 다운로드 크기** — multilingual-e5-small 은 ~100MB. 디스크 여유 확인 후 진행
- **aidy s8 시작 시점** — 토큰 리밋 여유 확인 후 ([Journal 003](/wiki/harness-engineering/aidy-journal-003-parallel-dispatch-token-economics)). s7 은 이미 종료(2026-04-17) — Journal 006 박제만 대기 중

### 다른 세션 주의
- moneyflow · tarosaju 자체 세션 가능 — 세션 시작 시 `rtk git fetch` ([Journal 019](/wiki/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup))
- Squash merge 함정: 다른 세션이 squash merge 한 branch ([Journal 003](/wiki/harness-engineering/harness-journal-003-squash-merge-trap-pattern))
- aidy 4 레포 동시 작업 가능 — `~/Develop/aidy-architect/HANDOFF.md` 확인

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기 (프로젝트 규약)
- [ ] `SPEC.md` 읽기 (엔티티 + AI Agent Contract)
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기 (상황별 라우팅)

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택 (🔴 #1 Phase 2b 모델 비교가 ROI 가장 큼)

### Phase 3: Git 동기화 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `rtk git -C ~/Develop/mino-moneyflow fetch origin`
- [ ] `rtk git -C ~/Develop/mino-tarosaju fetch origin`
- [ ] aidy 작업 검토 시 `~/Develop/aidy-architect/HANDOFF.md` 읽기
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교 → 다른 세션 작업 감지 시 갱신

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `content/harness-engineering/aidy-journal-003-parallel-dispatch-token-economics.mdx` (토큰 경제성)
- [ ] `content/harness-engineering/aidy-journal-005-sse-phase1-to-phase2-progressive-rollout.mdx` (ADR-008 운영)
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

### 2026-04-17 (Session 5 종료 직후 — aidy s7 체크 반영)
- Aidy 생태계 스프린트 박제 완료 — Session 5/6 결과물을 10 엔트리로 박제
  - Journal 003 (토큰 경제성) · 004 (Test Evidence 정책 실효성) · 005 (SSE 점진 도입)
  - SSE 3-플랫폼 0-dep (backend/iOS/Android)
  - backend-ai: Password Reset 보안 + pg_trgm GIN
  - harness-engineering: Worker Prompts Logging + tmux flush 자동화
- 기존 문서 연결 보강 — Journal 000/001/002, Flow Maps 3개, CB 엔트리, test 엔트리 2개
- 이식 가능 패턴 카드 확장 (moneyflow/tarosaju용) — SSE/Password Reset/Worker Prompts Logging 추가
- 엔트리 수 107 → 117
- **Aidy Session 7 이미 2026-04-17 종료 감지** (push 이후 사용자 제보). 새 재료 2건:
  - `a4f8861 v0.7.1` P3 인프라 (send-seq + 429 backoff + ci-status.sh)
  - `0e23007 v0.7.2` WO-010 iOS CI self-hosted runner 전환 + ADR-009
  - **다음 세션 0순위**: Aidy Journal 006 박제 (진단 3회 정정 + self-hosted trade-off + 실측 수치 180min → 0min)
- Layer 3 Phase 2b(모델 비교) 는 2순위로 이동
