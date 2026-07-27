# 🍎 iOS 레슨 02 — property wrapper 4형제 (@State/@Binding/@StateObject/@ObservedObject)

> **왜:** SwiftUI 단골 레드플래그. `@StateObject vs @ObservedObject` 수명 버그는 실무·면접 양쪽 단골.
> **최초 학습:** 2026-07-27 (세션5) · **상태:** 방어 완성 · **선행:** `lessons/ios-01`(@Observable) · **복습:** `REVIEW.md`

---

## 🗝️ 4개를 한 번에 푸는 축 2개

```
질문1: 값 타입(struct/Int/Bool)  vs  참조 타입(class/ObservableObject)?
질문2: 내가 소유(생성·수명관리)     vs  남의 것 빌림(참조)?

                  소유(내가 생성)     빌림(남의 것 참조)
   값 타입    │   @State          │   @Binding        │
   참조 타입  │   @StateObject    │   @ObservedObject │
```

---

## 1. 값 타입 — @State / @Binding
- `@State` = 이 뷰가 소유한 **진실의 원천**(`private` 관례).
- `@Binding` = 남의 @State로 가는 **양방향 파이프**(자기 저장공간 없음). `$`로 프로젝션해 넘김.
- 원칙: 진실은 한 곳(부모 @State), 자식은 Binding으로 **같은 진실 공유** (single source of truth).

```swift
struct Parent: View {
    @State private var isOn = false
    var body: some View { Child(isOn: $isOn) }   // $ = Binding 프로젝션
}
struct Child: View {
    @Binding var isOn: Bool                       // 부모 진실 빌림
    var body: some View { Button("끄기"){ isOn = false } }
}
```

## 2. 참조 타입 — @StateObject / @ObservedObject (차이 = 수명 소유권 하나)

```
@StateObject    → SwiftUI가 붙잡음. 이니셜라이저는 첫 등장 때 1번만 평가(lazy).
                  re-init 여러 번 와도 같은 인스턴스 유지 → 상태 생존.
@ObservedObject → 수명 책임 없음. 재초기화를 막지 않음.
```

### 💥 클래식 버그 (면접 결정타)
```swift
struct Bad: View { @ObservedObject var vm = FormVM()   // 🚨 인라인 생성이 죄
    // View는 struct → 부모 갱신마다 re-init → "= FormVM()" 재실행 → 매번 새 객체 → 상태 0으로 리셋
}
struct Good: View { @StateObject var vm = FormVM() }    // ✅ 붙잡음 → 1번 생성 → 유지
```

**정밀 포인트:** "참조가 바뀌어서"가 아니라 **"뷰 struct 재초기화 시 이니셜라이저가 재실행"**되기 때문. @ObservedObject는 그걸 안 막음.

**@ObservedObject 올바른 용법 = 주입:**
```swift
Parent:  @StateObject var vm = FormVM()      // 부모가 소유
   └→ Child(vm: vm)
Child:   @ObservedObject var vm: FormVM      // 주입받음 (= 없음!) ✅
```
규칙: **뷰 안에서 `= `로 생성 → @StateObject / 파라미터 주입 → @ObservedObject.**

## 3. @Observable(iOS17+) 세계는 단순해짐
```
@StateObject var vm    →  @State var vm       (소유)
@ObservedObject var vm →  let vm              (주입, 그냥 프로퍼티)
@Published + $바인딩    →  @Bindable var vm    (양방향 필요 시만)
```
→ @State가 참조 타입 소유까지 흡수, 양방향은 @Bindable로 통일. (애플: "이제 @StateObject 불필요")

---

## 🌳 결정 트리 (암송)
```
값 타입?  ├ 소유 → @State   └ 부모것 양방향 → @Binding($)
참조 타입? ├ ObservableObject ├ 생성 → @StateObject  └ 주입 → @ObservedObject
          └ @Observable(iOS17) ├ 생성 → @State  ├ 주입 → let  └ 양방향 → @Bindable
```

**박제 한 줄:** *축은 값/참조 × 소유/빌림. @StateObject vs @ObservedObject 차이는 오직 수명 소유권 — 뷰에서 직접 생성하면 반드시 @StateObject(아니면 리셋 버그).*

## 🔗 연결
- 선행 `lessons/ios-01`(@Observable vs ObservableObject) · `REVIEW.md` SRS
- 다음 SwiftUI 후보: NavigationStack / SwiftUI↔UIKit interop / @Environment
