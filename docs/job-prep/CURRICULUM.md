# 📚 커리큘럼 v2 — AI 시대 이직 전략 (2026-07-27 피벗)

> **v1 → v2 전환 이유:** 2025~2026 채용이 **"코딩테스트 그라인딩" → "AI 활용 능력 + 실무 깊이"** 로 이동.
> Google·Meta·Canva·Shopify가 기술면접에서 AI 툴 사용을 허용/기대하기 시작.
> DSA는 라이브코딩 게이트용 최소한만 "쪽집게"로, 무게중심은 **아키텍처·시스템디자인·AI 활용**으로.
> 학습자 프로필: 5년차 iOS, 강점=UIKit/Rx/실무 아키텍처, **AI 하네스 직접 구축(최대 무기)**, 약점=동시성/SwiftUI/DSA.

---

## 🎯 전략 요약 (v2 — 무게중심 이동)

```
        v1 (그라인딩 시대)              v2 (AI 시대)
   ┌──────────────────────┐     ┌──────────────────────┐
   │ 🧮 DSA        60% ███ │     │ 🏛️ 아키텍처/SD   35% │
   │ 🍎 iOS 심화   25% █   │  →  │ 🤖 AI 활용        25% │  🆕
   │ 🏛️ 아키텍처   15%     │     │ 🍎 iOS 심화       20% │
   │                       │     │ 🧮 DSA 쪽집게     15% │  ↓ 축소
   └──────────────────────┘     │ 💼 딥다이브/행동  5%  │
                                 └──────────────────────┘
```

**세 기둥 + 두 서포트:**
1. 🏛️ **아키텍처 & 시스템 디자인 (메인 무대·35%)** — 실무 시니어 강점을 면접 방어력으로. `ARCH-SD.md`
2. 🤖 **AI 활용 테스트 대비 (신규·25%)** — 하네스 구축 경험을 무기로. `AI-TEST.md`
3. 🍎 **iOS 심화 (20%)** — 동시성 > SwiftUI (시니어 감별점)
4. 🧮 **DSA 쪽집게 (15%)** — 라이브코딩 게이트용 **최소 시그니처 문제만** SRS 반복 (그라인딩 X)
5. 💼 **프로젝트 딥다이브 방어 + 행동면접 (5%·상시)** — `interview-stories/`

**통과 바(목표):** ① AI-assisted 라운드에서 "AI를 잘 몰고 검증하고 선택을 방어" ② 모바일 SD 1시나리오 완주 ③ 라이브코딩은 medium **패턴 인식**까지 (풀 그라인딩 아님) ④ 프로젝트 딥다이브 방어 완성.

---

## 🧮 DSA — 쪽집게 모드 (그라인딩 → 시그니처 반복)

> **왜 축소:** AI-assisted 라운드가 raw DSA 가치를 떨어뜨림. 단 **라이브코딩(무 AI)은 아직 존재** → 게이트 통과용 최소 기본기는 유지.
> **방법:** 패턴당 **"이게 곧 그 패턴"인 시그니처 문제 1~2개**만. 손코딩 그라인딩 대신 **"문제 보면 패턴 즉시 호명"** 을 SRS로 반복. (회사 환경 = 플랫폼 그라인딩 OFF와도 일치)

### 🥇 S급 (거의 매번 — 이것만은 반사)
| 패턴 | 시그니처 문제 | 트리거(이거 보이면 이 패턴) | 상태 |
|------|--------------|------------------------------|------|
| 해시 O(1) 조회 | Two Sum, Group Anagrams | "짝 찾기"·"본 적 있나"·"빈도" | ✅ 졸업 |
| Two Pointers | Valid Palindrome, 3Sum | "정렬됨"·"양끝/회문"·공간절약 | 🔶 진행중 |
| Sliding Window | Longest Substring, Best Time Buy/Sell | "연속 부분배열/문자열"·"윈도우" | ⬜ 다음 |
| Stack | Valid Parentheses, 모노토닉 | "괄호/짝맞춤"·"다음 큰 수" | ⬜ |
| Binary Search | 고전 + "정답 위에 이분" | "정렬됨 + 찾기"·"최소/최대 만족값" | ⬜ |
| Tree BFS/DFS | Level Order, Max Depth, Invert | "트리"·"레벨"·"경로/깊이" | ⬜ |
| Graph BFS/DFS | Number of Islands, Clone Graph | "격자/연결"·"섬/컴포넌트" | ⬜ |

### 🥈 A급 (자주 — 여유되면)
| 패턴 | 시그니처 | 트리거 |
|------|---------|--------|
| Linked List | Reverse, Cycle(fast/slow) | "연결리스트"·"사이클" |
| Heap / Top-K | K Largest, Merge K Lists | "상위 K개"·"최소/최대 반복추출" |
| Backtracking | Subsets, Permutations | "모든 조합/순열"·"완전탐색" |
| 1D DP | Climbing Stairs, House Robber, Coin Change | "경우의 수"·"최소/최대 누적" |
| Intervals | Merge Intervals | "구간 병합/겹침" |

### 🗑️ 버림 (3개월 ROI 최악)
Trie · Segment Tree · 고급 DP(구간/비트마스크) · 기하 · 심화 Union-Find/위상정렬.

> **쪽집게 운영:** 매 세션 🧮 블록(~15분)은 위 표에서 **due 패턴 1개를 "트리거→접근법" 능동인출**. 손코딩은 주말/집에서 시그니처 1문제만. `REVIEW.md`에 패턴 카드로 관리.

---

## 🤖 AI 활용 테스트 트랙 (신규 — 상세 `AI-TEST.md`)

> **한 줄:** 시험 대상이 "코드를 짤 수 있나"에서 **"AI를 잘 몰고(prompt) · 결과를 의심·검증(verify) · 좋은 선택을 하고(judge) · 그 선택을 설명(defend)하나"** 로 이동.
> **너의 우위:** 이걸 하네스로 이미 시스템화함 (검증 게이트·서브에이전트·falsification-first). 남들은 "AI 써봤어요", 넌 "AI 실패모드를 코드 게이트로 막는 인프라를 설계했어요."

**4대 역량 (AI-TEST.md에서 드릴):**
1. 🎯 **프롬프팅/컨텍스트 설계** — 멀티파일 코드베이스에 맥락 주입, 작업 분해
2. 🔍 **검증·회의(skepticism)** — AI 출력의 버그·환각을 잡아내는 근육 (하네스의 verifier-falsification-first)
3. ⚖️ **툴/접근 선택 방어** — "왜 이 라이브러리·이 구조? AI가 제안한 걸 왜 거절/수용?"
4. 🗣️ **의사결정 서사화** — take-home 후 "왜 그렇게 했나" 방어 (아키텍처 4틀 재활용)

**포맷 대비:** Meta형 CoderPad 3-panel(버그픽스→구현→최적화, 60분) 모의 · take-home AI-allowed 시나리오.

---

## 🏛️ 아키텍처 & 시스템 디자인 (메인 무대 — 상세 `ARCH-SD.md`)

- 🅰️ **iOS 아키텍처 서사화**: 실무 결정(모듈화·Clean·DI·Rx→Concurrency)을 [상황→결정→트레이드오프→**방어(mitigation)**] 4틀로. 강점을 방어 스크립트로.
- 🅱️ **모바일 SD 시나리오**: 10-스텝 프레임. 규모추정=**사용자당 자원예산**(캐시·메모리·배터리). 피드/오프라인동기화/이미지캐시/모듈러delivery.
- 격일 번갈아, 각 ~20분. `ARCH-SD.md`에 카드 10 + 시나리오 10.

## 🍎 iOS 심화 (동시성 우선)

1. **동시성(최우선):** Rx 브릿지 → async/await → actor/Sendable/data race → structured concurrency → @MainActor/Swift6
2. **SwiftUI(감 되살리기):** property wrapper 구분, @Observable(iOS17+), 리렌더/성능, UIKit interop(강점)

**🌀 Rx → Swift Concurrency 대응표** (면접 단골):

| RxSwift | Swift Concurrency |
|---------|-------------------|
| `Single<T>` | `async func -> T` |
| `Observable<T>` | `AsyncSequence`/`AsyncStream` |
| `subscribe(onNext:)` | `for await x in stream` |
| `disposeBag` | Task 취소 + 구조적 동시성 자동 전파 |
| `observeOn(Main)` | `@MainActor` |
| `flatMapLatest` | 이전 Task cancel 후 새 Task |
| 직렬 스케줄러 | **actor** |

---

## 🗓️ 12주 스켈레톤 (v2 — 무게중심 재배치)

**일일(평일 ~75분·5블록):**
🏛️ 아키텍처/SD(~20) + 🤖 AI 활용(~20) + 🍎 iOS 심화(~15) + 🧮 DSA 쪽집게(~10, 트리거 인출) + 🔁 SRS due 카드(~5·상시)
> 시간 부족 시 트리아지: 🏛️/🤖 사수 > 🍎 > 🧮. DSA는 "패턴 인출"만이라도 매일.

| 주 | 🏛️ 아키텍처/SD | 🤖 AI 활용 | 🍎 iOS | 🧮 DSA 쪽집게 |
|----|------|------|------|------|
| W1 (現) | 서사화 A1~A2 + SD 프레임 도입 | 트렌드 파악 + 4대역량 정의 | COW·값타입 복습 | 해시✅ + 투포인터 |
| W2 | Clean 계층경계 + SD 규모추정 | 프롬프팅/컨텍스트 설계 드릴 | Rx→async 대응표 | Sliding Window |
| W3 | 모듈화 방어 + SD 피드설계 | 🔍 검증·회의 근육 (AI 버그잡기) | async/await + Task취소 | Stack |
| W4 | DI 방어 + SD 오프라인동기화 | ⚖️ 툴선택 방어 연습 | actor + Sendable | Binary Search |
| W5 | 상태관리 방어 + SD 이미지캐시 | Meta형 3-panel 모의 #1 | structured concurrency | Tree BFS/DFS |
| W6 | 🔁 아키텍처 인터리브 복습 | take-home AI-allowed 모의 | @MainActor/Swift6 | Graph BFS/DFS |
| W7 | SD 모듈러delivery + 딥다이브 | 🗣️ 의사결정 서사화 통합 | SwiftUI @State/@Binding | Linked List |
| W8 | 하네스 아키텍처 방어(06번) | Meta형 3-panel 모의 #2 | @Observable + 리렌더 | Heap/Top-K |
| W9 | 프로젝트 딥다이브 종합 | AI 협업 스토리 STAR화 | UIKit interop 데모 | Backtracking |
| W10 | 🐉 모의 SD 라운드 #1 | 🐉 AI-assisted 라운드 #1 | 기술 CS Q&A 인출 | 1D DP |
| W11 | 🐉 모의 딥다이브 방어 #1 | AI 활용 약점 보강 | 약점 iOS 집중 | Intervals + 약점 |
| W12 | 🐉 종합 모의면접 (SD+딥다이브+행동) | 🐉 AI-assisted 라운드 #2 | 총정리 | 시그니처 총복습 |

## 🚩 체크포인트

- **W4말:** 아키텍처 4틀 방어 자동화(mitigation까지) + AI 검증 근육 장착 + 투포인터·슬라이딩윈도우 반사
- **W8말:** 모바일 SD 1시나리오 완주 + Meta형 3-panel 2회 경험 + async/await 손 설명 + S급 DSA 7패턴 트리거 반사
- **W12말:** **딥다이브 방어 완성 + AI-assisted 라운드 2회 + SD 라운드 1회 + 종합 모의면접** = 실전 준비 완료

## ⚖️ 시간 부족 트리아지 (v2)

우선순위: **🏛️ 아키텍처/SD > 🤖 AI 활용 > 🍎 iOS 동시성 > 🧮 DSA 트리거인출 > 🍎 SwiftUI.**
75분 못 채우는 날은 🍎/🧮를 압축, 🏛️/🤖는 사수. DSA는 "패턴 호명"만이라도 매일 1개.

---

## 📎 지원 타겟별 배분 (v2)

- **AI 도입 빅테크/외국계(Google·Meta·Canva·Shopify류):** 🤖 AI-assisted 라운드 + 🏛️ SD + 딥다이브. **너의 하네스 스토리가 결정타.**
- **국내 대기업/토스:** 라이브코딩(무 AI) 잔존 → 🧮 쪽집게 사수 + 🏛️ 아키텍처.
- **스타트업:** take-home(AI-allowed) + 포트폴리오 + 아키텍처 방어.

> v1 리서치(23건) + v2 AI 트렌드 근거는 커밋 히스토리·`AI-TEST.md` 출처 참조.
