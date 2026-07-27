# 🍎 iOS 레슨 01 — `@Observable` vs `ObservableObject` (딥다이브)

> **왜 최우선:** 2026 리서치 — *"SwiftUI 모르면 2019에 Auto Layout 모르는 격."* `@Observable vs ObservableObject` 설명 못 하면 **명시적 레드플래그.** + 학습자 갭(SwiftUI 스탯 30).
> **최초 학습:** 2026-07-27 (세션 5) · **상태:** 딥다이브 방어 완성 · **복습:** `REVIEW.md` 카드 참조.

---

## 0. 30초 요약

```
ObservableObject (iOS13, Combine)   →   @Observable (iOS17+, Observation)
프로토콜 채택 + @Published 도배           매크로 한 줄
objectWillChange = 객체당 1개 신호        get/set을 registrar로 감싸 keyPath 추적
→ 어느 프로퍼티인지 정보 없음             → 뷰가 실제 접근한 keyPath만 추적
→ 구독한 모든 뷰 보수적 무효화 (과잉)      → 그 프로퍼티 읽은 뷰만 무효화 (정밀 ⚡)
뷰: @StateObject / @ObservedObject       뷰: @State / (주입 시) 그냥 프로퍼티 / @Bindable
```

**한 줄:** *옛날 건 "이 객체 바뀜!" 방송, 신형은 "네가 읽은 값 바뀜!" 만 콕.*

---

## 1. 용어 디코더 (여기서 많이 막힘)

| 애매한 말 | 정확한 표현 | 뜻 |
|---|---|---|
| "@Published 채택?" | @Published는 **프로퍼티 래퍼** — 프로퍼티에 **마킹** | 채택 아님 |
| "채택"은 어디에 | **프로토콜을 채택(conform)** | `ObservableObject`는 프로토콜 |
| 값 바뀔 때 | `objectWillChange`가 **방출(send)** | 퍼블리셔 |
| 뷰가 하는 일 | 퍼블리셔 **구독** → 뷰 **무효화** → body **재평가** | |

3층 구조: `ObservableObject`(프로토콜·채택) / `@Published`(래퍼·마킹) / `objectWillChange`(퍼블리셔·방출·구독).

---

## 2. 왜 옛날 건 "객체 단위"일 수밖에 없나 (근본 원인)

Combine 기반 → **객체당 퍼블리셔 1개**(`objectWillChange`).

```
count.set → ① willSet에서 objectWillChange.send()  (값 바뀌기 "직전")
            ② 그다음 실제 저장

⚠️ send() 는 인자가 없다 → "나 곧 바뀜" 한 발. 어느 프로퍼티인지 못 실음.

   count 바뀜 ─┐
   name 바뀜 ─┼─→ [같은 objectWillChange] ─→ 구독한 모든 뷰 무효화
   age 바뀜  ─┘         (구분 불가)
```

→ 뷰는 "객체가 바뀜"까지만 알고 "내가 읽는 count가 바뀌었나"는 모름 → **일단 다 재평가 후 diff로 거름.** 과잉 렌더링은 SwiftUI가 멍청해서가 아니라 **신호 해상도가 객체 단위**라 보수적일 수밖에 없어서.

---

## 3. `@Observable` 매크로가 생성하는 코드

```swift
@Observable class VM { var count = 0 }

// 매크로 전개 (개념적)
class VM {
    private let _$registrar = ObservationRegistrar()
    private var _count = 0
    var count: Int {
        get { _$registrar.access(self, keyPath: \.count); return _count }        // 읽힘 기록
        set { _$registrar.withMutation(self, keyPath: \.count) { _count = newValue } }  // 바뀜 통지
    }
}
```

저장 프로퍼티 → get/set 계산 프로퍼티. get=`access(keyPath:)`, set=`withMutation(keyPath:)`. 이제 **keyPath 단위** 추적 가능.

---

## 4. 읽는 쪽(SwiftUI)의 정밀 추적

```
withObservationTracking {
    Text("\(vm.count)")   // vm.count.get → registrar.access(\.count) 기록
}                          // name 안 읽음 → \.name 미기록
onChange: { /* 접근된 keyPath(\.count) 중 하나 바뀌면 1번 호출 → 이 뷰만 무효화 */ }

이 뷰 의존성 집합 = { \.count }
  name 바뀜 → \.name ∉ 집합 → 안 건드림 ⚡
  count 바뀜 → \.count ∈ 집합 → 무효화 ✅
```

추적 단위: **객체 → 뷰가 접근한 keyPath 집합**. 이게 개선의 전부.

---

## 5. 멘탈모델 (면접 talking point)

```
ObservableObject = 📢 방송국  — "나 바뀜!" 전원 broadcast → 각자 확인
@Observable      = 🕸️ 의존성 그래프 — "누가 뭘 읽었나" 그래프 → 바뀐 값 독자에게만 push
```

🗣️ **시니어 시그널:** *"MobX·SolidJS의 signal 기반 fine-grained reactivity를 Swift에 들여온 것. Combine의 coarse object-level 무효화를 접근 추적 기반 property-level 무효화로 바꿈."*

---

## 6. 꼬리질문 방어 (디테일)

- **body는 여전히 통째로 재실행.** 바뀐 건 "무효화 대상 뷰를 좁힌 것"이지 부분 렌더 아님.
- **@Published 깜빡한 프로퍼티** → 바꿔도 `objectWillChange` 안 나감 → **UI 갱신 안 됨(옛날 값).** 근데 데이터는 실제 바뀌어 있어서, 나중에 *다른* @Published가 뷰를 재평가시키면 값이 **"갑자기" 튀어나옴** → 재현 힘든 유령 버그. (실무 경험 시그널) @Observable은 전 프로퍼티 자동 추적이라 이 함정 없음.
- **computed property**: @Observable은 계산 프로퍼티가 내부에서 읽은 저장 프로퍼티까지 자동 추적. (옛날엔 수동 `objectWillChange` 발사 필요)
- **비용 이동**: 옛날=런타임 방송+광범위 diff / 신형=약간의 접근-추적 오버헤드로 무효화 범위 최소화. **큰 리스트·복잡 화면일수록 이득.**

---

## 7. 🎤 암송용 모범답안

> "`ObservableObject`는 Combine 기반 프로토콜이고, 프로퍼티에 `@Published`를 마킹하면 값 바뀌기 직전 `objectWillChange` 퍼블리셔가 방출됩니다. 문제는 이 신호가 **객체 단위**라 어느 프로퍼티가 바뀌었는지 정보가 없어서, 구독하는 모든 뷰가 무효화됩니다 — 실제로 안 읽은 프로퍼티가 바뀌어도 재평가되는 과잉 렌더링이죠. iOS 17의 `@Observable` 매크로는 Observation 프레임워크로 **프로퍼티 접근을 런타임 추적**해서, 뷰가 body에서 실제 읽은 프로퍼티가 바뀔 때만 그 뷰를 무효화합니다. `@Published` 보일러플레이트도 사라지고, 뷰는 `@StateObject` 대신 `@State`로 소유합니다."

---

## 🔗 연결
- 뷰 property wrapper 짝: `@State`/`@Bindable`(신형) ↔ `@StateObject`/`@ObservedObject`(구형)
- 다음: `@State vs @Binding vs @StateObject vs @ObservedObject` 4형제 정밀 구분 (별도 레슨 후보)
- `CURRICULUM.md` 🍎 iOS 심화 · `REVIEW.md` SRS 카드
