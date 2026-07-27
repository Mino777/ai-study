# 🍎 iOS 레슨 03 — Rx → Swift Concurrency 브릿지

> **왜:** 학습자 강점(RxSwift 주력) 위에 갭(동시성·스탯 25)을 얹는 최고효율 경로. "Rx로 이렇게, async로는 왜 더 안전한가"는 시니어 감별 단골.
> **최초 학습:** 2026-07-27 (세션5) · **상태:** 첫 쐐기(방어 답변 완성) · **복습:** `REVIEW.md`

---

## 🌉 한 줄 브릿지
- **Rx** = "구독하면 나중에 콜백으로"(push, 선언형 스트림)
- **async/await** = "위→아래로 읽히고, 기다릴 땐 스레드 양보 후 재개"(suspend/resume)

## 📇 매핑표
| RxSwift | Swift Concurrency | 한 줄 |
|---|---|---|
| `Single<T>` | `func f() async throws -> T` | 일회성 값 |
| `Observable<T>` | `AsyncSequence`/`AsyncStream` | 값의 연속 |
| `.subscribe(onNext:)` | `for await x in stream` | 구독=순회 |
| `disposeBag` | **구조적 동시성 자동 취소** | ⭐ 핵심 |
| `observeOn(Main)` | `@MainActor` | 메인 복귀 |
| 직렬 스케줄러 | `actor` | 순차 접근 |
| `flatMapLatest` | 이전 Task cancel → 새 Task | 최신만 |
| `onError` | `throws`/`try` | 에러=언어 기본 |

## 1. subscribe/콜백 → await (suspend/resume)
`await` = 스레드 **블로킹 아니라 양보(suspend)**. 결과 오면 재개(resume). 콜백 중첩(pyramid) 없이 코드 순서 = 실행 순서.
```swift
let user  = await fetchUser()          // suspend
let posts = await fetchPosts(user.id)  // resume 후 다음 줄
```

## 2. disposeBag → 구조적 취소 ⭐ (제일 큰 차이)
- Rx: 취소 **수동**(disposeBag 안 들면 누수/좀비 구독).
- Concurrency: Task는 **트리**, 부모 취소/스코프 종료 시 **자식 자동 취소**. 수명이 스코프에 묶여 누수가 구조적으로 불가능.
```swift
func load() async throws -> Screen {
    async let user = fetchUser()   // 병렬 자식
    async let feed = fetchFeed()
    return try await Screen(user, feed)  // 하나 실패/취소 → 나머지 자동 취소
}
```
> SwiftUI `.task {}` = 뷰 수명에 묶임(뷰 사라지면 자동 취소) = disposeBag 대행.

## 3. 스케줄러/스레드안전 → @MainActor / actor (컴파일 타임!)
- Rx: `observeOn(Main)`은 **런타임 규율** — 깜빡해도 컴파일 통과, 런타임에 터짐.
- Concurrency: `@MainActor`(메인 강제)·`actor`(직렬+상태 격리)는 **컴파일러가 강제** → data race를 컴파일 단계 차단.
```swift
@MainActor func updateUI() {}   // 메인 아니면 컴파일 에러
actor ImageCache { var cache = [:] }  // 밖에서 직접 접근 불가
```

## 🎯 "왜 더 안전한가" 4줄 (면접 결정타)
```
① 가독성:   콜백 중첩 → 선형(위→아래)
② 취소:     disposeBag 수동 → 구조적 자동 전파(누수 불가)
③ data race: 런타임 규율 → 컴파일러 강제(actor/@MainActor/Sendable)
④ 에러:     onError 스트림 → try/throw 언어 통합
```
> 한 문장: *"Rx는 취소·스레드안전을 개발자 규율에 의존. 구조적 동시성은 그걸 언어·컴파일러 보장으로 끌어올려 실수해도 컴파일 단계에서 막음."*

## ⚖️ 균형(시니어는 Rx 안 깎음)
복잡한 이벤트 조합·debounce·merge 등 **선언형 스트림 연산은 Rx/Combine이 여전히 강력**. async는 명령형 흐름·구조적 취소에 강함. 스트림 조합은 AsyncSequence/Combine으로 보완. **대체 아닌 적재적소.**

## 🔎 보너스: flatMapLatest → cancel+restart (검색어 자동완성)
```swift
searchText.flatMapLatest { api.search($0) }         // Rx
// ↓
searchTask?.cancel(); searchTask = Task { show(try await api.search(text)) }  // 이전 취소 후 새 Task
```

**박제 한 줄:** *심장은 disposeBag→구조적 취소. Rx가 규율로 지키던 걸 언어가 컴파일 타임에 강제하는 게 '더 안전'의 실체.*

## 🔗 연결
- 후속: actor 재진입(reentrancy) 함정 · Sendable · Swift6 strict concurrency · async를 어느 계층에(ARCH-SD A2/A5)
- `CURRICULUM.md` 🌀 대응표 · `REVIEW.md` SRS
