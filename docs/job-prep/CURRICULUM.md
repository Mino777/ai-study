# 📚 13주 커리큘럼 (리서치 기반)

> 2025-2026 한국 iOS 이직 시장 웹 리서치 기반. 학습자 프로필: 5년차, 강점=UIKit/Rx/아키텍처, 약점=동시성/SwiftUI, **DSA 제로**. 하루 1시간 + 주말 일부.

---

## 🎯 전략 요약 (리스크 순)

1. **🚨 DSA 제로가 1순위 리스크.** 대기업/토스는 경력직도 코딩테스트 필수(1차 게이트). 스타트업은 과제전형. → 하루 1문제 daily rep, 13주 누적 **~110~120문제**.
2. **시니어 감별점 = 동시성 + 상태관리 + 아키텍처** (2025 시니어 배점 Swift/SwiftUI 40%, 아키텍처 25%). 정확히 학습자 약점. → iOS 심화는 **동시성 > SwiftUI > 시스템디자인** 순.
3. **강점(UIKit/Rx/실무 아키텍처)은 무기로 전환** — 면접에서 "왜 이 결정을 했나" 방어 스크립트 + SwiftUI↔UIKit interop 스토리.

**통과 바(목표):** 프로그래머스 Lv.2를 편하게 + Lv.3 절반. (Lv.4는 인터뷰에 거의 안 나옴 — 버림.)

> ⚠️ **쿠팡 타겟 델타(`COUPANG.md`):** 쿠팡은 아마존식 루프라 바가 더 높다 — **LeetCode medium 중심 100~150문제 + 일부 hard**, HackerRank/CoderPad에서 **영어 think-aloud**, **모바일 시스템 디자인** 1라운드, **15 LP 행동면접**(원칙당 2~3 SBI 스토리+지표), Bar Raiser. 프로젝트 딥다이브 방어가 iOS 깊이의 실체. base 커리큘럼을 깔되 W7+부터 LP 스토리·모바일 SD·영어 연습을 병행 주입.

## 🧠 학습 방법 (운영 규칙 — 증거 기반)

- **능동 회상(active recall):** 읽지 말고 **문제를 풀고, 개념은 빈 종이에 재현**. (재독보다 파지 50%↑)
- **간격 반복(SM-2):** 개념/패턴 카드 Anki 또는 위키 퀴즈 SRS. 간격 1일→6일→점증, 실패 시 리셋. 목표 유지율 ~90%.
- **인터리빙:** 패턴은 블록으로 배우되, **주 1회 복습 세션은 여러 패턴을 섞어** 출제(문제 보고 전략 고르기 = 실전).
- **의도적 연습:** 약점(동시성/SwiftUI/DSA)에 시간 집중.
- **시각적 우선:** VisuAlgo 애니메이션 + box-and-pointer/콜스택 다이어그램으로 먼저 그리고 코드.

## 🖥️ 플랫폼

| 용도 | 플랫폼 |
|------|--------|
| 한국 CT 실전 환경 (1순위) | **프로그래머스** (코딩테스트 연습 키트, Lv.1→2→3) |
| 기초 유형별 단계 훈련 | 백준 (단계별 풀이) |
| 패턴 학습 커리큘럼 | LeetCode + **NeetCode 250**(완전초보 friendly) |

---

## 🧮 DSA 패턴 로드맵 (~118문제, 통과 바 기준)

| # | 패턴 | 문제 | ROI | 메모 |
|---|------|------|-----|------|
| 1 | Arrays & Hashing | 12 | ★★★★★ | 해시 = 한국 CT 단골. Two Sum부터 |
| 2 | 구현/시뮬레이션 + 문자열 | 10 | ★★★★★ | **한국 CT 1위 유형** |
| 3 | Two Pointers | 8 | ★★★★ | |
| 4 | Sliding Window | 6 | ★★★★ | |
| 5 | Stack | 7 | ★★★★ | 괄호/모노토닉 |
| 6 | Binary Search | 8 | ★★★★ | 정렬+파라메트릭 서치 |
| 7 | Linked List | 6 | ★★★ | 포인터 감각(box-and-pointer) |
| 8 | Trees (BFS/DFS) | 15 | ★★★★★ | 콜스택 그림 필수 |
| 9 | Heap / PQ | 5 | ★★★ | Top-K |
| 10 | Backtracking | 6 | ★★★ | 순열/조합/완전탐색 |
| 11 | Graphs (BFS/DFS·Union-Find·Topo) | 12 | ★★★★ | BFS/DFS 필수, 나머지 후순위 |
| 12 | DP (1D→2D, 기초만) | 12 | ★★★ | 피보/배낭/LCS/coin만. 고급 DP 버림 |
| 13 | Greedy | 5 | ★★★ | |
| 14 | Intervals / Math | 6 | ★★★ | 정렬 후 병합 |

**버리는 것(저 ROI, 3개월엔 skip):** Trie, Segment Tree, 고급 DP(구간/비트마스크), 심화 Union-Find/위상정렬, 기하.

## 🌀 Rx → Swift Concurrency 브릿지 (학습자 맞춤 핵심 자산)

> 이미 아는 Rx 멘탈모델에 새 개념을 붙인다. 면접에서 "Rx로는 이렇게, 구조적 동시성으로는 왜 더 안전한가"를 말할 수 있으면 시니어 감별에서 유리.

| RxSwift | Swift Concurrency |
|---------|-------------------|
| `Single<T>` / one-shot | `async func -> T` |
| `Observable<T>` 스트림 | `AsyncSequence` / `AsyncStream` |
| `subscribe(onNext:)` | `for await x in stream` |
| `disposeBag` / dispose | Task 취소 + 구조적 동시성 자동 취소 전파 |
| `observeOn(MainScheduler)` | `@MainActor` / `await MainActor.run` |
| `flatMapLatest` | 이전 Task cancel 후 새 Task |
| 직렬 스케줄러(스레드 안전) | **actor** |

**동시성 면접 단골:** async/await의 suspend/resume, `@MainActor` vs `DispatchQueue.main.async`, actor isolation이 data race 막는 원리, `Sendable`이 왜 필요한가, structured concurrency(`async let`/`TaskGroup`/취소), Swift 6 strict concurrency.

## 🍎 iOS 심화 우선순위

1. **동시성(최우선):** Rx 브릿지 → async/await → actor/Sendable/data race → structured concurrency → @MainActor/Swift6. **AI 없이 손으로 재현**.
2. **SwiftUI(감 되살리기):** property wrapper 정확 구분(@State/@Binding/@StateObject vs @ObservedObject), **@Observable 매크로(iOS17+)**와 리렌더 추적/성능, NavigationStack, **SwiftUI↔UIKit interop(강점 활용)**.
3. **시스템 디자인:** 모바일 시나리오형(오프라인/동기화 충돌/모듈러 delivery). 백엔드 사이드 퀘스트(`BACKEND.md`)와 수렴.

---

## 🗓️ 13주 스켈레톤

**일일(평일 60분):** 🧮 DSA 1문제(~35) + 🍎 iOS 개념 능동인출·손코딩(~15) + 🗺️ 백엔드 1노드(~7).
**주말:** iOS 심화 빌드(동시성/SwiftUI 손코딩) 또는 라이브코딩/모의면접.
**복습:** 주 1회 인터리브 복습 세션(지난 패턴 혼합 재출제).

| 주 | DSA (패턴·누적) | iOS 심화 | 주말 산출물 |
|----|------|------|------|
| W1 | 셋업 + Arrays&Hashing(4) — Two Sum 진짜 이해 | Swift 값/참조·ARC 워밍업 + Anki 시작 | 환경/Anki 세팅, 배열/해시 box-and-pointer |
| W2 | A&H(8) + 구현/문자열 시작(3) | **Rx↔Concurrency 대응표 작성** | async/await 기초 손코딩(AI 없이) |
| W3 | 구현/시뮬 + 문자열(10) | async/await + Task/취소 | 네트워킹 함수 Rx→async 재작성 |
| W4 | Two Pointers(8) | **actor + Sendable + data race** | actor로 스레드세이프 캐시 |
| W5 | Sliding Window(6) + Stack(4) | structured concurrency(async let/TaskGroup) | 병렬 이미지 로드 TaskGroup |
| W6 | Stack(7) + Binary Search(5) | @MainActor vs DispatchQueue.main, Swift6 | 🔁 인터리브 복습 #1 (W1–5) |
| W7 | Binary Search(8) + Linked List(6) | SwiftUI 부활: @State/@Binding, @Observable | @Observable+async 작은 화면 |
| W8 | Trees BFS/DFS(8) — 콜스택 그림 | @StateObject vs @ObservedObject, 리렌더/성능 | SwiftUI 리스트 성능 실험 |
| W9 | Trees(15) + Heap(5) | MVVM-C, NavigationStack, UIKit interop | Representable 데모(강점 활용) |
| W10 | Backtracking(6) + Graphs BFS/DFS(6) | 기술면접 CS Q&A 능동인출(메모리/동시성/네트워크) | 🔁 인터리브 복습 #2 |
| W11 | Graphs(12) + DP 1D(5) | 시니어 아키텍처 방어 스크립트("왜 이 결정") | 🐉 모의 라이브코딩 #1 (45분 타이머) |
| W12 | DP 2D(12) + Greedy(5) | 모바일 시스템 디자인(오프라인/동기화) | 🐉 모의 기술면접 #1 (녹화·리뷰) |
| W13 | Intervals/Math(6) + 약한 패턴 집중 | 회사별 맞춤 복습 + Anki 총정리 | 🐉 모의 라이브코딩 #2 + 프로그래머스 Lv.2 실전셋 |

## 🚩 체크포인트

- **W6말:** 프로그래머스 Lv.1 자유롭게 + async/await 손으로 설명 가능
- **W9말:** Lv.2 대부분 + SwiftUI @Observable 화면 AI 없이 제작
- **W13말:** **Lv.2 편하게 + Lv.3 절반 = 대기업 CT/라이브코딩 통과 바** + 모의면접 3회 완료

## ⚖️ 시간 부족 시 트리아지

DSA daily rep는 **절대 거르지 않는다**(근육). iOS 심화는 **동시성 > SwiftUI > 시스템디자인**. 저 ROI 패턴(Trie/고급DP/기하)은 과감히 버린다.

---

## 📎 지원 타겟별 배분

- **대기업/토스(네카라쿠배당토):** CT 비중 최대. DSA + 라이브코딩 집중.
- **스타트업:** 과제전형(take-home)이 관건. 포트폴리오 프로젝트 + 아키텍처 방어.
- **외국계:** LeetCode 스타일 CT(영어) + 모바일 시스템 디자인 + behavioral.

> 리서치 출처(23건, URL 포함)는 세션 로그/커밋 히스토리에 보존. 필요 시 요청.
