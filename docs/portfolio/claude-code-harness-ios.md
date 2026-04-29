# Claude Code 하네스 엔지니어링 — iOS 모빌리티 앱 적용 사례

> 대규모 iOS 모빌리티 플랫폼 앱(RIBs + RxSwift + SwiftUI 하이브리드, SPM 멀티모듈)에 직접 설계·운영 중인 Claude Code 하네스. AI 코딩 에이전트를 1명의 보조가 아니라 **4-pane 병렬 워커 팀**으로 굴리기 위한 인프라.
>
> 최근 60일 기준 이 셋업 위에서 **377 커밋**이 머지됐다. 본 문서는 이력서·면접 자료용 요약.

---

## 한 줄 요약

> "AI 에이전트를 *조직처럼* 운영하기 위한 하네스를 직접 설계·구축. 오케스트레이터 + 분석 + 구현 + 검증의 4-pane 병렬 워커 구조, 16개 자체 스킬 / 10개 에이전트 / 5개 PreToolUse 훅 / 25개 자동화 스크립트로 단일 개발자 처리량을 N배 확장."

---

## 핵심 설계 원칙

### 1. 메인 pane은 코드를 읽지 않는다 (HARD RULE)
오케스트레이터가 직접 grep/Read를 시작하면 컨텍스트가 5분 안에 폭발한다. 분석은 무조건 worker pane에 디스패치, 메인은 **WO Brief 작성 → 결과 합산 → 사용자 응답**만.

### 2. 4-pane tmux 역할 분리
| pane | 역할 | 권한 |
|------|------|------|
| 1.1 orchestrator | 디스패처 / 어드바이저 / 최종 정리 | 코드 read 금지 (메타·git 예외) |
| 1.2 worker-1 (analysis) | 탐색·분석 전담 | read-only |
| 1.3 worker-2 (impl) | 구현 전담 | Edit/Write |
| 1.4 worker-3 (verify) | 검증 전담 (테스트 + Gate-1) | Edit + 테스트 실행 |

### 3. ADVICE_REQUEST 어드바이저 모드
워커가 막히면 `ADVICE_REQUEST: <상세>` 신호를 송신 → 메인이 **워커가 명시한 파일/라인만** 핀포인트 Read → tmux send-keys로 가설/예시 회신. 광역 탐색은 다시 worker-1로 회귀.

### 4. Work Order(WO) 사이즈별 흐름
- **S** (파일 1-2, 레이어 1) → 직렬 (분석→구현→검증)
- **M** (레이어 2-3) → 구현 ∥ 검증 병렬
- **L** (전체 레이어 신규 피쳐) → 3개 병렬 분석 → 3개 병렬 구현 → 검증

WO Brief는 파일화(`/tmp/wo-<slug>-brief.md`) — tmux 인라인 메시지는 깨진다.

---

## 구축한 자산 (실측)

### 슬래시 커맨드 / 스킬 (16개)
| 카테고리 | 항목 |
|---------|------|
| **iOS 워크플로우** | `/ios-feature`, `/ios-triage`, `/ios-bugfix`, `/ios-review`, `/ios-investigate`, `/ios-ship`, `/ios-arch`, `/ios-ui-test` |
| **품질 게이트** | `/gate-1` (빌드 + SwiftLint + 레이어 + RIBs + 품질 검사) |
| **오케스트레이션** | `/orchestrate`, `/sprint`, `/analysis-worker`, `/ios-worker` |
| **지식 박제** | `/compound` (스프린트 종료 후 복리 지식 축적), `/ingest` (외부 패턴 흡수) |
| **워커 효율** | `layer-locate` (파일 후보 특정), `worker-commit` (diff+포맷+커밋), `test-scaffold` (XCTest 템플릿) |

### 도메인 에이전트 (10개)
`ios-pr-shipper` / `ios-deployer` / `ios-bug-fixer` / `ios-feature-builder` / `ios-ui-tester` / `swift-reviewer` / `ios-architect` / `ios-explorer` / `ios-researcher` / `swiftui-specialist` — 트리거 키워드 감지 시 자동 spawn, 총 915 라인.

### PreToolUse 훅 (5개)
- `external-ref-guard.sh` — 외부 레퍼런스 인용 차단
- `file-protection.sh` — Project.pbxproj / Podfile.lock 등 직접 편집 차단
- `post-swift-edit.sh` — Swift 편집 직후 SwiftFormat + SwiftLint
- `check-gstack.sh` — gstack(공통 스킬셋) 미설치 시 STOP
- `session-start.sh` — 컨텍스트 자동 주입

### 자동화 스크립트 (25개) — 하이라이트
- `pick-default-sim.sh` — 설치된 최신 iOS 런타임의 가장 작은 디바이스 자동 선택 (구버전 OS 스플래시 hang 우회)
- `seed-fixture.sh` — 시뮬 디스크 상태 save/restore (인증/온보딩 점프)
- `screenshot-diff.sh` — 픽셀 단위 디자인 회귀 가드
- `wait-for-ui.sh` — UI 라벨 폴링 (smoke 테스트 동기화)
- `fetch-swagger.sh` — dev 서버 swagger를 mock fixture로
- `check-fixture-staleness.sh` — mock JSON 노후화 자동 감지
- `launch-test-screen.sh` — deeplink 직진 (DebugMode Continue 자동 통과)
- `dispatch.sh` — tmux send-keys Enter 누락 자동 재시도 3회
- `monitor.sh` — 워커 dashboard
- `search-knowledge.sh` — 과거 솔루션 키워드 검색
- `check-claude-drift.sh` — CLAUDE.md drift 검사
- `verify-hooks.sh` — 훅 wiring 검증

---

## 기술적 의사결정 — 자랑할 만한 것들

### "완료의 정의" = UI 테스트 통과
빌드 성공/유닛 테스트 그린 ≠ 완료. 작업 스펙을 사용자 시나리오로 변환 → **XcodeBuildMCP**로 시뮬레이터에서 자동 재현 (`tap` 한국어 라벨 매칭, `swipe`, `screenshot`, `snapshot_ui`) → 스크린샷 시각 확인 통과해야 머지. PR 본문에 검증 스크린샷 첨부.

### 레이어 위반 자동 감사
`Presentation → UseCase → Repository → Network` 단방향. `code-analyzer` 스킬이 SPM 사이클 + 레이어 위반을 read-only로 자동 감사. Presentation→Repository 직접 접근 / UseCase→Network 직접 호출은 빌드 전에 차단.

### RIBs + SwiftUI 하이브리드 패턴
ViewController **내부 UI만** SwiftUI로 점진 전환. ViewModel→Reactor 직접 참조 / UseCase 직접 호출 / NavigationStack 화면 전환 / `@MainActor` 누락 / Preview 실제 Interactor 주입 — 5대 금지를 `swiftui-patterns` 스킬에 박제.

### Compound Engineering — 복리형 지식 축적
스프린트 종료 시 `/compound` 실행 → CHANGELOG + 회고 + 솔루션 자동 생성 → `docs/solutions/`에 카테고리별로 저장 → `search-knowledge.sh`로 다음 스프린트에서 재활용. **버그 픽스 한 번 = 영구 자산.**

### Gate-1 — 멀티-디멘션 품질 게이트
PR 직전 단일 커맨드로:
1. `xcodebuild build_sim` (XcodeBuildMCP, CLI 직접 호출 금지)
2. SwiftFormat + SwiftLint 통과
3. 레이어 위반 0건
4. RIBs 패턴 위반 0건 (Builder 누락, Router 미연결 등)
5. force unwrap / try / cast 0건, RxSwift `disposed(by:)` 누락 0건
6. 회귀 테스트 통과

### 컨텍스트 윈도우 60% 임계값 룰
60% 초과 시 의사결정 품질이 떨어진다는 관측 기반. 임계값 도달 시 `/compact` 자동 권고 + 태스크 분리.

---

## 측정 가능한 효과

- **지난 60일 머지된 커밋**: 377건 (이 하네스 위에서)
- **CLAUDE.md 라인 수**: 324줄 (메모리 캐시 보호를 위한 상한 운영, drift 검사 자동화)
- **자동 워커 dashboard**: tmux 4-pane 실시간 상태 폴링
- **세션 시작 → 첫 디스패치까지**: 5분 시연 + 자율 검증 사이클 정착 (`docs/ONBOARDING.md`)

---

## 이력서 한 줄 후보

- "Claude Code 기반 4-pane 병렬 AI 워커 하네스를 직접 설계·운영. 단일 개발자가 분석·구현·검증을 동시에 굴리는 *조직형* AI 워크플로우 구축."
- "16개 도메인 슬래시 커맨드, 10개 자동 spawn 에이전트, 25개 셸 스크립트로 iOS 앱 개발 워크플로우(피쳐/버그픽스/리뷰/배포/QA) 풀 자동화."
- "RIBs + RxSwift + SwiftUI 하이브리드 코드베이스에 레이어 위반 / SPM 사이클 / RIBs 패턴 위반을 PR 전에 자동 차단하는 Gate-1 품질 게이트 구축."
- "Compound Engineering 패턴으로 모든 스프린트 종료 후 솔루션을 카테고리별로 자동 박제 → 차세대 스프린트에서 키워드 검색으로 재활용. 지식 자산화."
- "AI 에이전트의 컨텍스트 폭발을 막기 위해 *오케스트레이터 코드 직접 read 금지* HARD RULE을 설계, ADVICE_REQUEST 핀포인트 어드바이저 프로토콜 운영."

---

## 면접에서 이야기할 거리

| 질문 | 답변 시드 |
|------|----------|
| "왜 1-pane이 아니라 4-pane?" | 컨텍스트 윈도우 보호. 분석 결과를 한 pane이 다 들고 있으면 구현 단계에서 토큰 예산이 모자람. 분리 → 디스패치 → 결과 합산 패턴이 LLM 코딩의 OS 수준 추상화. |
| "에이전트가 잘못된 코드를 짜면?" | Gate-1이 막는다 + swift-reviewer/ios-architect가 adversarial 리뷰 + 완료 정의가 UI 테스트 통과라서 시뮬레이터 스크린샷이 거짓말 못 함. |
| "다른 개발자가 쓰려면?" | `setup-onboarding.sh` 한 줄. gstack 미설치 자동 감지 + 5분 시연. |
| "유지보수는?" | `check-claude-drift.sh`로 CLAUDE.md drift 검사, `verify-hooks.sh`로 훅 wiring 검증. 메타 인프라 자체가 self-checking. |
| "한계는?" | tmux 의존 + 단일 머신. 다중 머신 분산 워커는 다음 단계 (현재 hub↔worker 메시지 큐 PoC 진행 중). |

---

*마지막 검증: 2026-04-29 / 위 수치는 실측. 회사명은 메모리 룰에 따라 익명화.*
