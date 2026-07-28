# 🏛️ 아키텍처 카드 A2 — "async/동시성을 어느 계층에 둘 것인가"

> **왜:** `QUESTION-BANK` C카테고리(Clean 구현) 필수 꼬리질문. **"@MainActor 남발 = 명시적 레드플래그"**(ARCH-SD 박제)의 방어 카드.
> **최초 학습:** 2026-07-28 (세션6) · **선행:** `lessons/ios-03`(Rx→async) `lessons/ios-04`(GCD) · **상태:** 방어 완성

---

## 🎯 질문 형태
"Clean 어떻게 구현?" → 꼬리: **"비동기는 어느 계층 책임? @MainActor는 어디에?"**
→ 답의 핵심 = **계층별 격리(isolation) 정책**을 말하는 것.

## 📐 계층별 동시성 정책
```
Presentation (View/ViewModel)
  → @MainActor (UI는 메인 계약) + Task 생성·취소 수명 관리(.task{} / onDisappear)
Domain (UseCase/Entity)
  → nonisolated + async 시그니처만  ⭐ 스레드 중립
  → ⛔ @MainActor 절대 금지 (UI 오염)
Data (Repository/DataSource)
  → async throws + actor(공유 캐시·상태 격리)
  → CPU 바운드(디코딩·이미지)는 @concurrent 로 명시 탈출
```

## 🗝️ 3대 원칙
1. **@MainActor는 경계에만** — Presentation만. 남발하면 전부 메인에서 돌아 렉 + "동시성 이해 없음" 레드플래그.
2. **Domain은 스레드 중립** — `func execute() async throws -> [Post]` 처럼 async만 노출. "어디서 불릴지 모른다"가 올바른 가정 (순수성·테스트성).
3. **Task 수명은 Presentation이 소유** — SwiftUI `.task{}`(뷰 사라지면 자동 취소) / UIKit은 프로퍼티 보유 후 cancel. ⛔ Domain·Data가 fire-and-forget Task 만들면 취소 불가 → 누수.

## 💥 안티패턴 — "경고 없애려고 @MainActor 도배"
```
증상: UseCase·Repository까지 @MainActor → 컴파일 경고 사라짐
문제 2축:
  ① 성능    API·디코딩·비즈니스 로직이 메인 점유 → 프레임 드랍·스크롤 끊김
            (await는 양보하지만 CPU 바운드는 계속 메인 점유 → 진짜 드랍)
  ② 순수성  Domain이 UIKit 런타임(메인액터)에 결합
            → 테스트마다 메인액터 컨텍스트 필요 / 서버사이드·타 UI 재사용 불가
            → 의존성 방향 위반(안쪽이 바깥 규칙을 앎) = Clean 정면 위배
```
> 🎯 **결정타:** *"경고가 사라진 건 해결이 아니라 **은폐**. 전부 한 액터에 몰면 동시성이 없으니 경고도 없다 — 병렬성을 포기한 대가로 컴파일러를 침묵시킨 것이고, 문제는 런타임 성능으로 옮겨갔을 뿐."*

**면접 지적 멘트:** "컴파일 경고를 없애려고 @MainActor를 내리는 건 동시성을 이해했다는 신호가 아니라 **회피**했다는 신호입니다. 저는 격리를 경계에만 두고 Domain은 nonisolated로 남겨 스레드 중립·테스트 가능하게 유지합니다. 경고가 나면 그 지점이 바로 데이터 흐름을 다시 봐야 할 곳입니다."

## 🌀 Rx → Concurrency 이행 (실무 경로)
```
Repository가 Observable 반환   → async throws 반환
observeOn(Main) in ViewModel   → @MainActor on Presentation
disposeBag을 VC/VM이 보유       → Task 수명을 View가 소유(.task)
스케줄러 전환이 스트림에 흩어짐   → 격리가 "타입 선언"에 명시 ← 개선
```
🗣️ **talking point:** *"Rx는 스레드 전환이 스트림 연산 중간에 흩어져 '지금 어느 스레드?'를 추적해야 했는데, Concurrency는 격리를 타입 선언에 박아 컴파일러가 검증합니다. 스레드 정책이 **코드 리뷰 가능한** 형태가 된 거죠."*

## 🚀 Swift 6.2 (가점)
```
MainActor-by-default (approachable concurrency)
사고 역전: "모든 라인 안전 증명" → "메인을 의도적으로 떠나는 지점이 어디?"
  앱 타겟        = MainActor 기본 ON
  라이브러리/파서 = 기본 OFF + 명시 격리
  CPU 바운드     = @concurrent 로 명시 탈출
```

## 🎤 모범답안 (암송)
> "비동기는 계층별 격리 정책으로 나눕니다. **Presentation은 @MainActor** — UI는 메인 계약이고 Task 수명도 화면이 소유해 사라질 때 취소됩니다. **Domain은 nonisolated + async 시그니처만** — 어느 스레드에서 불릴지 모른다고 가정해야 순수하게 유지되고 테스트가 쉽습니다. @MainActor를 UseCase까지 내리면 UI에 오염되고 전부 메인에서 돌아 성능이 죽습니다. **Data는 async throws + 공유 상태는 actor**, CPU 바운드는 @concurrent로 명시적으로 메인을 떠납니다. 즉 @MainActor는 **경계에만**, 안쪽은 스레드 중립으로."

**박제 한 줄:** *@MainActor는 경계(Presentation)에만. Domain은 nonisolated async(스레드 중립). Data는 async+actor. Task 수명은 화면 소유. 남발이 곧 레드플래그.*

## 🔗 연결
- `ARCH-SD.md` A2 카드(체크박스) · A5(Rx→Concurrency 전환) · `lessons/ios-03`, `ios-04`
