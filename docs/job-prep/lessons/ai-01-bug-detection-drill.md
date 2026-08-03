# 🔍 AI-01 — 버그 감별 드릴 (검증 근육)

> **작성:** 2026-08-03 (세션8d) · **선행:** `AI-TEST.md`(4대 역량) `MOCK-INTERVIEW.md`(3티어)
> **왜 이게 가장 중요한가:** `AI-TEST.md` 4대 역량 중 **2번 검증·회의**가 "가장 중요"로 표시돼 있다.
> Meta 평가 4기준에서도 ③ Verification 이 *AI 시대 핵심*이다. 그리고 떨어지는 5대 실수 중
> 2번(읽지 않고 붙여넣기)·4번(검증 부실)이 여기 직결된다.
>
> **설계 원칙:** 심는 버그를 **M 트랙에서 배운 것들**로 구성한다. 코드 리뷰처럼 보이지만 실제로는 **인출 훈련**이다.
> **저마찰:** 답변은 **줄 번호만** (예: `5 16 40`). 모르면 `패스`.

---

## 🧠 LLM이 실제로 만드는 버그 유형 (감별 체크리스트)

> 오타나 컴파일 에러는 LLM이 잘 안 낸다. LLM 버그는 **"컴파일되고 대체로 동작하지만 특정 조건에서 틀린"** 것이다.

```
🅐 상태·수명       클로저 self 강한 캡처 · Task 취소 누락 · 인스턴스 상태를 요청 간 공유
🅑 동시성          백그라운드에서 UI 갱신 · main.sync · 순차 await(병렬 의도인데)
🅒 경계 가정        옵셔널 강제 해제 · 빈 배열 인덱스 · CodingKeys 누락(silent nil)
🅓 도메인 규칙 ⭐   금액을 Double · 멱등키 재생성 · 비멱등 연산 재시도 · optimistic 금지 구역
🅔 시간·좌표 ⭐     기기 시계로 순서 판단 · 타임존 · GeoJSON [경도,위도] 뒤집기
🅕 검증 무력화      릴리스에서 무효한 assert 를 검증으로 사용 · 에러 무시(try?)
🅖 성능 함정        루프 안 O(n) 조회 · 매 프레임 렌더 · 디바운스 없는 요청
```

⭐ = 도메인 지식이 있어야만 보이는 것. **여기서 시니어가 갈린다.** LLM은 이걸 특히 자주 틀린다 — 문법은 알지만 도메인 규칙은 모르니까.

## 🎯 미끼(decoy) 규칙
각 세트에는 **"틀려 보이지만 맞는 코드"** 를 1~2개 넣는다.
→ 버그 감별은 "의심 많이 하기"가 아니라 **판별**이다. 정상 코드를 버그로 지목하면 감점(면접에서도 그렇다).

---

# 🅳1 — 결제 서비스 (Swift)

```swift
 1  import Foundation
 2
 3  struct ReservationPayment {
 4      let reservationId: String
 5      var amount: Double
 6      let currency: String
 7  }
 8
 9  final class PaymentService {
10      private let api: PaymentAPI
11      private var retryCount = 0
12
13      init(api: PaymentAPI) { self.api = api }
14
15      func pay(_ payment: ReservationPayment) async throws -> PaymentResult {
16          let key = UUID().uuidString
17          return try await send(payment, idempotencyKey: key)
18      }
19
20      private func send(_ p: ReservationPayment,
21                        idempotencyKey: String) async throws -> PaymentResult {
22          do {
23              return try await api.pay(p, key: idempotencyKey)
24          } catch {
25              if retryCount < 3 {
26                  retryCount += 1
27                  return try await pay(p)
28              }
29              throw error
30          }
31      }
32  }
33
34  @MainActor
35  final class PaymentViewModel: ObservableObject {
36      @Published var status: String = ""
37      private let service: PaymentService
38
39      init(service: PaymentService) { self.service = service }
40
41      func onPayTapped(_ payment: ReservationPayment) {
42          status = "결제가 완료되었습니다"
43          Task {
44              do {
45                  _ = try await service.pay(payment)
46              } catch {
47                  status = "결제에 실패했습니다"
48              }
49          }
50      }
51  }
```

<details>
<summary><b>정답 (5 버그 + 1 미끼)</b></summary>

```
L5   🅓 금액을 Double 로 — 부동소수점 오차. 10원 단위가 어긋나면 정산 분쟁.
        → Decimal 또는 최소 단위 정수(원 단위 Int). 돈에 Double 은 규칙 위반.

L16  🅓⭐ 멱등키를 pay() 안에서 매번 새로 만든다 — 재시도할 때마다 새 키가 된다.
        → 키는 "결제 시도 1건"에 귀속되어 로컬DB에 저장되고, 재시도에는 같은 키를 쓴다.
        (sd-m2-payment-deep L0 — 실무 최다 버그)

L27  🅓⭐ 재시도가 pay() 를 재호출한다 → L16 을 다시 타서 새 키 발급. 멱등성 완전 무효.
        → send(p, idempotencyKey: 같은키) 를 호출해야 한다.

L25  🅓⭐ 에러를 분류하지 않고 전부 재시도 — "모호(ambiguous)"에서 재시도하면 이중결제.
        → retryable / terminal / ambiguous 3분류. 모호는 재시도가 아니라 **조회**.
        (오늘 T1 Q2 에서 틀린 지점)

L11  🅐 retryCount 가 인스턴스 상태 — 여러 결제가 카운터를 공유하고 리셋도 안 된다.
        첫 결제가 3회 실패하면 이후 모든 결제가 재시도 없이 즉시 실패.
        → 시도별 로컬 상태로.

L42  🅓⭐ optimistic on payment — "완료"를 먼저 표시. 실패하면 유저는 이미 차로 걸어감.
        → 결제는 pessimistic. 서버 확정 후에만 완료 표시.
```

**미끼 (버그 아님):**
```
L34 @MainActor + L43 Task { }
  정상이다. ViewModel 이 MainActor 로 격리되고 Task 가 그 컨텍스트를 물려받아
  status 갱신이 메인에서 일어난다. arch-a2 의 "경계에만 MainActor" 원칙에도 부합.
  → "@MainActor 남발"을 과잉 학습하면 이걸 버그로 지목하게 된다. 그건 오답.
```
</details>

---

# 🅳2 — 지도 · 위치 (Swift)

```swift
 1  final class ServiceAreaChecker {
 2      private var polygons: [[[Double]]] = []
 3
 4      func load(_ geoJSON: [[[Double]]]) { polygons = geoJSON }
 5
 6      func isReturnable(_ location: CLLocation) -> Bool {
 7          let point = CGPoint(x: location.coordinate.latitude,
 8                              y: location.coordinate.longitude)
 9          return polygons.contains { ring in
10              contains(ring.map { CGPoint(x: $0[0], y: $0[1]) }, point)
11          }
12      }
13  }
14
15  final class VehicleMapViewModel {
16      private var vehicles: [Vehicle] = []
17      private let repo: VehicleRepository
18      private var searchTask: Task<Void, Never>?
19
20      init(repo: VehicleRepository) { self.repo = repo }
21
22      func mapDidChangeRegion(_ bbox: BBox) {
23          Task {
24              let fetched = try? await repo.vehicles(in: bbox)
25              self.vehicles = fetched ?? []
26              self.render()
27          }
28      }
29
30      func searchDidChange(_ query: String) {
31          searchTask?.cancel()
32          searchTask = Task {
33              try? await Task.sleep(for: .milliseconds(300))
34              guard !Task.isCancelled else { return }
35              let results = try? await repo.search(query)
36              self.show(results ?? [])
37          }
38      }
39  }
```

<details>
<summary><b>정답 (4 버그 + 1 미끼)</b></summary>

```
L7~L8 🅔⭐ 좌표 뒤집힘 — GeoJSON 링은 [경도, 위도] 인데(L10 이 $0[0]=x 로 경도를 x에 넣음),
         point 는 x=위도 로 만들었다. 축이 서로 반대 → 판정이 항상 false.
         에러 0건, 로그 0건. 증상은 "반납 버튼이 아무 데서도 안 눌림".
         → 좌표 변환을 한 함수로 모으고 유효범위 단정을 넣는다.
         (sd-m1-map-deep 발견3 — 오늘 T1 에서 다룬 함정)

L6    🅒 위치 정확도를 검증하지 않는다 — horizontalAccuracy 가 음수(무효)거나 수백 m 여도
         그대로 판정에 쓴다. 구역 경계에서 오판 → 분쟁.
         → accuracy 게이트 + 신선도(timestamp) 게이트.

L22~L28 🅖⭐ 지도 이동 콜백마다 요청 — debounce 없음. 드래그 1회에 수십 번 호출.
         게다가 이전 Task 를 취소하지 않아 **오래된 응답이 최신 화면을 덮어쓴다**(stale write).
         → debounce + 이전 Task 취소 + generation 번호로 최신만 채택.
         (L30 의 search 는 이걸 제대로 하고 있다 — 같은 파일 안에서 일관성이 깨진 형태)

L24   🅕 try? 로 에러를 삼킨다 — 실패와 "빈 결과"가 구별되지 않는다.
         L25 에서 빈 배열로 덮어써서 화면의 기존 차량까지 사라진다(부분 실패 내성 0).
         → 에러를 분기해서 기존 데이터 유지 + 실패만 표면화.
```

**미끼 (버그 아님):**
```
L31~L34  searchTask?.cancel() → sleep → isCancelled 체크
  정상적인 디바운스 + 취소 패턴이다. sleep 후 취소를 재확인하는 것도 맞다.
  → "Task.sleep 은 안티패턴"으로 외우면 이걸 오답 지목한다. 디바운스 목적의 sleep 은 정당.
```
</details>

---

# 🅳3 — BLE 차량 제어 (Swift)

```swift
 1  final class VehicleControlService {
 2      private var ble: BleClient
 3      private var onDone: ((Bool) -> Void)?
 4
 5      func toggleDoor(completion: @escaping (Bool) -> Void) {
 6          onDone = completion
 7          ble.connect { [weak self] in
 8              self!.ble.write(command: .toggleDoor) { success in
 9                  DispatchQueue.global().async {
10                      self!.onDone?(success)
11                  }
12              }
13          }
14      }
15
16      func honkUntilAck(retries: Int = 3) {
17          ble.write(command: .horn) { [weak self] success in
18              guard let self else { return }
19              if !success, retries > 0 {
20                  self.honkUntilAck(retries: retries - 1)
21              }
22          }
23      }
24  }
```

<details>
<summary><b>정답 (5 버그)</b></summary>

```
L5   🅓⭐ 토글 명령 — 재시도가 존재하는 시스템에서 토글은 설계 결함.
        응답 유실 후 재시도하면 문이 다시 잠긴다. → lock / unlock 목표상태형으로 분리.

L8   🅓⭐ write 성공을 "수행 완료"로 취급 — write 성공은 전송 성공일 뿐이다.
        차량이 거부했을 수도 있다. → 차량 응답 메시지를 확인해야 완료.
        (sd-m4-m6 L2 — 오늘 T1 에서 틀린 지점)

L8,L10 🅐 [weak self] 를 쓰고 self! 로 강제 해제 — weak 의 의미가 사라진다.
        서비스가 해제된 뒤 콜백이 오면 크래시. → guard let self else { return }.

L9   🅑 완료 콜백을 백그라운드 큐에서 호출 — 호출부가 UI 를 갱신하면 메인 스레드 위반.
        → 메인에서 호출하거나, 컨트랙트를 문서화하고 @MainActor 로 격리.

L16~L22 🅓⭐ 경적을 자동 재시도 — 경적은 **비멱등** 이벤트다. 재시도하면 또 울린다.
        (심지어 성공 여부와 무관하게 응답이 늦게 오면 중복 발생)
        → 자동 재시도 금지. "다시 울리기" 버튼으로 유저가 결정.
        (sd-m4-m6 L0 — 오늘 T1 에서 맞힌 지점. 코드로도 잡히는지 확인)
```
</details>

---

## 📏 채점

```
버그 지목 정확도:  맞게 지목 +1 / 놓침 0 / 정상 코드를 버그로 지목 −1 (미끼 함정)

D1 (5+1)  4~5 = 실전 통과 · 2~3 = 보완 · 0~1 = 재학습
D2 (4+1)  3~4 = 통과
D3 (5)    4~5 = 통과

⭐ 도메인 버그(🅓🅔 표시)를 놓쳤다면 그게 진짜 갭이다.
   문법 버그는 누구나 본다. 도메인 규칙 위반을 보는 게 시니어 신호다.
```

## 🗣️ 면접에서 이 근육을 쓰는 방식

AI-assisted 라운드에서 AI 코드를 받으면 **소리내어** 이 순서로 훑는다:

```
① "도메인 규칙부터 봅니다"   금액 타입 · 멱등성 · optimistic 금지 구역 · 좌표 순서
② "경계와 실패를 봅니다"      옵셔널 · 빈 컬렉션 · 에러 삼킴 · 부분 실패
③ "수명과 스레드를 봅니다"    캡처 · 취소 · 어느 스레드에서 콜백이 오나
④ "그리고 정상인 부분도 말합니다"  ← ⭐ 이게 판별력 신호
   "이 @MainActor 격리는 맞게 돼 있습니다" 라고 말하면
   "의심 많은 사람"이 아니라 "판단하는 사람"으로 읽힌다
```
> 🗝️ **오버커뮤니케이션 원칙(AI-TEST 황금률 2)** 과 결합: 찾은 것만 말하지 말고 **찾는 순서**를 말한다. 관찰자는 결과보다 프로토콜을 채점한다.

**박제 한 줄:** *LLM 버그는 컴파일 에러가 아니라 **"동작하지만 도메인 규칙을 위반하는"** 코드다. 그래서 감별 순서는 **도메인 규칙 → 경계·실패 → 수명·스레드**이고, 정상인 부분을 정상이라 말하는 것까지가 판별력이다.*

## 🔗 연결
`AI-TEST.md`(4대 역량 2번·연습 프로토콜 ①) · `MOCK-INTERVIEW.md`(3티어·기록) · `sd-m2-payment-deep`(멱등·실패 3분류·optimistic) · `sd-m1-map-deep`(GeoJSON·debounce·stale) · `sd-m4-m6-control-search-deep`(토글·전송≠수행·비멱등) · `arch-a2`(MainActor 경계) · `ios-04`(취소·레이스)
