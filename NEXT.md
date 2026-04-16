# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 변경 (2026-04-16)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 과거 append-only 로 60KB · 1032 줄 까지 누적된 결과 Layer 1 프리픽스 오버헤드 · stale 누적 문제 확인 ([핸드오프 문서의 함정](/wiki/context-engineering/context-scaling-3-layer-architecture)). 이번 세션부터는 완료된 큐 제거 · 갱신 로그는 최근 1~2 개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격 후 여기서는 삭제.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-16 (Session 2 종료 직전)
- **작성 주체**: Claude (Session 2)
- **이유**: Flow Map 시리즈 4·6·7편 완료 + context scaling 아키텍처 박제 + Part 5 설계 로드맵 대체 + NEXT.md 정리 (핸드오프 문서 함정 섹션 자체 제안 실행)

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 105
- **카테고리**: 13 (prompt-engineering · context-engineering · harness-engineering · tokenomics · rag · agents · fine-tuning · evaluation · infrastructure · ios-ai · frontend-ai · android-ai · backend-ai)
- **주요 시리즈**:
  - **Harness Journal** (000~014+)
  - **iOS Journal**
  - **Multi-Agent Orchestration Journal (Aidy)** (000, 001, 002)
  - **Flow Map for iOS Devs** (1·2·3·4·6·7편 완료, 5편 deferred)
- **Git 상태**: main clean, origin/main 동기 (세션 시작 시 반드시 `rtk git fetch`)
- **최근 major 변경**:
  - Search index lazy fetch 도입 → RSC payload -30~70% gzipped
  - Mermaid `<br/>` 따옴표 자동화 큐 (validate-content 확장 후보)
  - Flow Map 시리즈 7편 완결 (5편 deferred)
  - Context scaling 3-레이어 아키텍처 박제 (+ 핸드오프 함정 섹션)
  - NEXT.md 자체 정리 (이 문서)

### aidy 4 레포 (관제 + 3 워커)
- `aidy-architect` (관제 · markdown specs + tmux 4-pane)
- `aidy-server` (Spring Boot + Kotlin, 로컬 개발만)
- `aidy-ios` (Swift/TCA + Tuist, 시뮬레이터만)
- `aidy-android` (Compose + Kotlin, 에뮬레이터만)
- **배포 상태**: 3-client 모두 프로덕션 미구축 — [배포 설계 로드맵](/wiki/infrastructure/aidy-3-client-deployment-design-roadmap) 참조

### moneyflow / tarosaju (워커 프로젝트)
- **Git 상태**: 세션 시작 시 직접 fetch 확인 (다른 세션 작업 감지 필수 — Journal 003 squash merge 함정 주의)
- **이식 가능 패턴**: Circuit Breaker · 3-provider 폴백 · 프롬프트 캐싱 · AI 비용 추적 · wt-branch · text output guards · 5-Layer Defense · React Compiler + startTransition

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High — 측정 가능한 문제 해결

1. **validate-content.mjs 에 Mermaid `<br/>` 패턴 warning 추가**
   - 위치: `scripts/lib/mermaid-fix.mjs`
   - 요구: idempotency 유지 (memory rule "자동 수정 도구 신뢰 X")
   - 현재는 3번째 재발 후 수동 수정. 경고만이라도 빌드에 노출
   - 회귀 테스트: `scripts/__tests__/mermaid-fix.test.mjs`

2. **Context scaling Layer 3 POC (Chroma 로컬)**
   - 3-레이어 아키텍처 글의 Stage 3 로드맵
   - ai-study 에서 먼저 실험 (롤백 용이)
   - 섀도우 모드 1주 · JIT 응답 품질 vs 기존 전체 로드 비교

### 🟡 Medium — 꾸준한 박제

3. **Flow Map 시리즈 Part 5 재개 판단**
   - 현재 deferred (실 배포 미구축)
   - [설계 로드맵](/wiki/infrastructure/aidy-3-client-deployment-design-roadmap) 의 Stage 1~2 (DB + 서버 호스팅) 실제 도입 후 Flow Map 전환
   - 트리거: 실제 Neon + Fly 연결 완료 시점

4. **Harness Journal 다음 에피소드**
   - 이번 세션의 SearchDialog lazy fetch · Mermaid 3번째 재발 · Flow Map 시리즈 운영 경험 중 1~2 개 선택해서 Journal 박제

### 🟢 Low — 가치 시점 봐서

5. **CLAUDE.md 의 "세션 시작 4 파일 로드" 규약 재검토**
   - 현재 NEXT.md 가 필수 로드. 이번 정리 후에도 정말 필수인지 판단
   - 선택적 로드로 격하 검토 (handoff 함정 섹션의 제안)

6. **/compound 스킬 확장**
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
- [ ] 양쪽 main 최신 commit 확인 · 이 NEXT.md 의 스냅샷과 비교 → 다른 세션 작업 감지 시 갱신

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `docs/retros/` 최근 1~2 파일
- [ ] `docs/solutions/` 최근 카테고리별 1~2 파일

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

# ai-study 빌드 + validation
cd ~/Develop/ai-study && rtk npm run build

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

### 2026-04-16 (Session 2 종료 직전)
- Flow Map 4·6·7편 박제 · 5편 deferred (실 배포 미구축)
- Context scaling 3-레이어 아키텍처 글 작성 + 핸드오프 함정 섹션
- Part 5 대체: aidy 3-client 배포 설계 로드맵 (infrastructure · 설계 장르)
- Dangling connections 4건 중 3 건 수정 · 1건 제거
- **NEXT.md 자체 정리 (60KB → ~5KB)** — append-only 운영 규칙 폐기 · 이 글 자체가 핸드오프 문서 함정 섹션의 실천
- `/compound` 로 CHANGELOG · 회고 · 솔루션 · 메모리 동시 박제
