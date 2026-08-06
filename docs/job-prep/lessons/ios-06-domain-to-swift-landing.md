# ios-06 · 도메인 개념 → Swift 착지판 (세션9 개념 9개)

> **왜 이 문서:** 2026-08-06 세션9 능동인출 진단 = **위험 감지 ✅ / 해결 구조 ❌**.
> 도메인 위험은 정확히 짚는데 *"그럼 iOS에서 어떻게 구현?"* 에서 막힌다. 면접 **2차 질문이 정확히 여기**다.
>
> **구성:** 개념 1개 = **3층** ① 도메인 원리(왜 위험) → ② Swift 구현(실제 타입·API) → ③ iOS 함정(스레드·생명주기·메모리·배터리)
>
> ⛔ 회사 코드 식별자 없음. 전부 **표준 Apple API + 일반 패턴**.

---

## 🗺️ 착지 지도 (한눈에)

```
도메인 개념                    Swift/iOS 착지점
─────────────────────────────────────────────────────────────
멱등키 계약          →  actor + 영속화(Keychain/File) + Task 취소 격리
전송성공 ≠ 수행완료   →  CoreBluetooth writeValue ≠ didUpdateValueFor
                        + AsyncStream 상태 구독 + 3단 타임아웃
명령은 상태를 지정    →  enum DoorCommand { case open, close }  (toggle 없음)
                        + 멱등 재시도 안전성
픽셀 상한            →  MKMapView annotation 상한 + clusteringIdentifier
                        + zoom→span 환산
클러스터 = 좌표의 함수 →  좌표 반올림 키 + Dictionary 그룹핑 (뷰포트 무관)
신뢰 경계            →  앱은 raw만 전송. Decodable로 서버 확정값 수신
원본 vs 파생         →  저장 모델(raw) vs 표시 모델(smoothed) 타입 분리
기기 시계 불신       →  Date() 금지 · 서버시각 + ContinuousClock(단조시계)
위치 start/stop 13:1 →  actor + 참조 카운팅 + Cancellable(구독 0 → stop)
```

---

## ① 멱등키 계약 → `actor` + 영속화

### 도메인 원리
같은 키 + 같은 페이로드 → 캐시된 첫 응답 / 같은 키 + **다른** 페이로드 → **409 Conflict**.
최다버그 = **재시도 루프 안에서 키 생성** → 3회 시도 = 결제 3건.

### Swift 구현

```swift
// ❌ 최다버그 — 재시도 루프 안에서 키 생성
func pay(amount: Int) async throws {
    for _ in 0..<3 {
        // 매 시도마다 새 UUID → 서버는 "서로 다른 결제 3건"으로 본다
        try await api.pay(key: UUID().uuidString, amount: amount)
    }
}

// ✅ 키는 "요청 1건"에 1개 — 루프 밖에서 1회 생성
func pay(amount: Int) async throws {
    let key = try await store.key(for: .payment(amount))  // 없으면 생성+영속화
    for attempt in 0..<3 {
        do {
            try await api.pay(key: key, amount: amount)    // 같은 키로 재시도
            await store.complete(key)
            return
        } catch let e as HTTPError where e.status == 409 {
            throw PaymentError.payloadMismatch              // 재시도 금지 — 클라 버그
        } catch is CancellationError {
            throw CancellationError()                       // 키는 남긴다(조회 가능)
        } catch {
            try await Task.sleep(for: .seconds(pow(2, Double(attempt))))
        }
    }
    // 3회 실패 = 「모호」 → 재시도 아니라 조회
    try await reconcile(key: key)
}
```

**왜 `actor` 인가** — 키 저장소는 공유 가변 상태다. 결제 버튼 연타 / 여러 화면 동시 요청에서 레이스가 난다.

```swift
actor IdempotencyStore {
    private var inFlight: [RequestID: String] = [:]
    private let file: URL                      // 영속 — 앱이 죽어도 살아남아야 함

    func key(for id: RequestID) throws -> String {
        if let existing = inFlight[id] { return existing }   // 같은 요청 = 같은 키
        if let persisted = try loadFromDisk(id) {            // 앱 재시작 복구
            inFlight[id] = persisted
            return persisted
        }
        let new = UUID().uuidString
        inFlight[id] = new
        try writeToDisk(id, new)                             // ⭐ 네트워크 호출 전에 저장
        return new
    }
}
```

**`actor` 가 해결하는 것 = single-flight.** `class` + `DispatchQueue` 로도 되지만 `await` 지점마다 재진입 검토가 필요하다. `actor` 는 컴파일러가 격리를 보증한다.

> 💡 **A7 토큰 갱신과 같은 패턴이다.** 세션8에서 발견한 *"1초 시간게이트 + class 비격리 = 상호배제 없음"* 이 여기서 반복된다. **공유 상태 + 재시도 = `actor` + inFlight 맵**이 정답 형태.

### iOS 함정

```
🔴 앱 킬 → Task 소멸 → 키가 메모리에만 있으면 유실 → 조회 수단 상실
   ⇒ 키는 네트워크 호출 "전에" 디스크에 쓴다 (위 순서가 중요)

🔴 Task 취소 ≠ 요청 실패
   화면 dismiss → Task 취소 → 서버는 이미 처리했을 수 있다 = 「모호」
   ⇒ CancellationError 에서 키를 지우면 안 된다

🔴 백그라운드 진입 시 URLSession 기본 세션은 중단됨
   ⇒ 결제는 background URLSession 또는 앱 복귀 시 reconcile

🔴 Keychain vs File — 멱등키는 "비밀"이 아니라 "복구 키"
   ⇒ Keychain 은 과잉. Application Support + .noBackup 이 적합
     (Keychain 은 앱 삭제 후에도 잔존 → 오히려 좀비 키 위험)
```

---

## ② 전송 성공 ≠ 수행 완료 → `CoreBluetooth` 2단 신호

### 도메인 원리
`write ack` = 전송 계층 / `doorStatus == unlocked` = 도메인 상태. **optimistic 금지 기준 = 물리 세계 영향 + 실패 비용 비대칭.**

### Swift 구현

```swift
// CoreBluetooth 에서 이 둘은 완전히 다른 콜백이다
func peripheral(_ p: CBPeripheral,
                didWriteValueFor c: CBCharacteristic, error: Error?) {
    // ← write ack. "패킷 나갔다"는 뜻일 뿐. 문 상태와 무관.
}

func peripheral(_ p: CBPeripheral,
                didUpdateValueFor c: CBCharacteristic, error: Error?) {
    // ← 차량이 보고한 상태. 이것만 "열렸습니다"의 근거.
}
```

> ⚠️ `writeValue(_:for:type:)` 에서 `.withoutResponse` 를 쓰면 **ack 자체도 없다**. `.withResponse` 여야 `didWriteValueFor` 가 온다. 그래도 그건 여전히 ack일 뿐이다.

**3상태 모델링 — 도메인을 타입으로 만든다:**

```swift
enum DoorState: Equatable {
    case idle
    case sending                       // write 진행
    case awaitingConfirmation          // ack 받음, 상태 대기  ← 여기가 "열고 있습니다"
    case unlocked                      // notify 확인          ← 여기가 "열렸습니다"
    case failed(DoorFailure)
}

enum DoorFailure {                     // 유저가 할 행동이 달라서 쪼갠다
    case notReachable                  // ~2s  write 응답 없음 → "가까이 가주세요"
    case noStatusReport                // ~5s  notify 없음     → "차량 무응답"
    case didNotUnlock                  // ~10s 상태 ≠ unlocked → "고객센터"
}
```

**3단 타임아웃을 `async` 로:**

```swift
func openDoor() async -> DoorState {
    state = .sending
    do {
        try await withTimeout(.seconds(2)) { try await ble.write(.open) }
    } catch { return .failed(.notReachable) }        // ① 전송 계층

    state = .awaitingConfirmation
    do {
        // AsyncStream 으로 notify 를 구독 — 첫 unlocked 를 기다린다
        let confirmed = try await withTimeout(.seconds(5)) {
            for await status in ble.doorStatusStream where status == .unlocked {
                return true
            }
            return false
        }
        return confirmed ? .unlocked : .failed(.didNotUnlock)
    } catch { return .failed(.noStatusReport) }      // ② 상태 보고 없음
}
```

**delegate → `AsyncStream` 브릿지** (A5 Rx→async 전환과 같은 형태):

```swift
final class BLEBridge: NSObject, CBPeripheralDelegate {
    private var continuation: AsyncStream<DoorStatus>.Continuation?

    var doorStatusStream: AsyncStream<DoorStatus> {
        AsyncStream { continuation in
            self.continuation = continuation
            continuation.onTermination = { [weak self] _ in
                self?.continuation = nil            // 누수 방지
            }
        }
    }

    func peripheral(_ p: CBPeripheral,
                    didUpdateValueFor c: CBCharacteristic, error: Error?) {
        guard let data = c.value, let status = DoorStatus(data) else { return }
        continuation?.yield(status)
    }
}
```

### iOS 함정

```
🔴 CBPeripheral delegate 콜백은 지정한 큐에서 온다 (기본 main)
   UI 갱신 전에 @MainActor 확인. Reactor/ViewModel 이 actor면 hop 필요

🔴 백그라운드 BLE — Info.plist bluetooth-central 없으면 백그라운드 notify 유실
   ⇒ 앱 복귀 시 상태를 "다시 읽는다"(readValue) — 놓친 notify 를 가정하지 말 것

🔴 연결 끊김과 명령 실패는 다른 사건
   centralManager(_:didDisconnectPeripheral:) → 진행 중 Task 를 취소하고
   상태를 .failed(.notReachable) 로. 스피너가 영원히 돌면 최악의 UX

🔴 재연결 후 characteristic 객체는 무효 — discoverServices 부터 다시
```

---

## ③ 명령은 상태를 지정 → `enum` 으로 toggle을 컴파일 불가로

### 도메인 원리
`toggle` 결과 = f(현재 상태) → 앱은 현재 상태를 확실히 모른다. **재시도가 반대 동작이 된다.**

### Swift 구현

```swift
// ❌ 이 API 는 존재 자체가 위험
func toggleDoor() async throws        // 재시도 = 열림→잠김

// ✅ desired state 를 타입으로 강제
enum DoorCommand {
    case open
    case close
    // toggle 이 "없다" — 만들 수 없게 하는 게 설계다
}
func setDoor(_ command: DoorCommand) async throws   // 재시도 = 멱등, 안전
```

**왜 `enum` 인가** — 주석으로 "toggle 쓰지 마세요"를 쓰면 지켜지지 않는다. **타입에 없으면 컴파일이 안 된다.**

```swift
// 「실패 3분류」와 결합 — 멱등 명령만 자동 재시도 허용
protocol IdempotentCommand {}
extension DoorCommand: IdempotentCommand {}

func retry<C>(_ c: C, times: Int) async throws where C: IdempotentCommand {
    // 멱등 타입만 이 함수에 들어올 수 있다 = 재시도 안전이 타입으로 보증됨
}
```

> 💡 **이게 "해결 구조를 이름 붙인다"의 좋은 예다.** 면접 답변:
> *"토글 대신 desired state 를 지정하는 enum 으로 만듭니다. 그러면 재시도가 멱등이 되고, 멱등 프로토콜로 마킹해서 자동 재시도 대상을 타입 레벨에서 제한할 수 있습니다."*

### iOS 함정

```
🔴 SwiftUI Toggle 바인딩이 유혹한다
   Toggle("문", isOn: $isOpen) → set 에서 toggleDoor() 호출하기 쉬움
   ⇒ isOn 은 "표시용", 실제 명령은 .open/.close 로 분리

🔴 낙관적 바인딩 금지 — @State 를 먼저 바꾸면 그게 곧 optimistic
   ⇒ 서버/차량 확인 후 상태 갱신. 진행 중엔 컨트롤 disabled
```

---

## ④ 픽셀 상한 → `MKMapView` annotation 예산

### 도메인 원리
화면 33만pt² ÷ 마커 900pt² = **상한 ~366개**. 5만은 136배 = 정보량 0.
z16(1px≈2.4m)이 개별 마커 경계선 — 차 1대(4.5m) ≈ 2px.

### Swift 구현

```swift
// zoom 대신 MKMapView 는 span 을 쓴다 — 환산이 필요
extension MKCoordinateRegion {
    /// 화면 1pt 당 미터 (경도 방향, 위도 보정 포함 = Mercator 왜곡)
    func metersPerPoint(viewWidth: CGFloat) -> Double {
        let metersPerDegreeLon = 111_320 * cos(center.latitude * .pi / 180)
        return (span.longitudeDelta * metersPerDegreeLon) / Double(viewWidth)
    }
}

enum MapDisplayMode {
    case heatmap        // 개별 무의미
    case cluster        // 숫자 뱃지
    case individual     // 개별 마커 유효

    init(metersPerPoint m: Double) {
        switch m {
        case ..<3:   self = .individual   // 차 1대가 1pt 이상 = 구분 가능
        case ..<50:  self = .cluster
        default:     self = .heatmap
        }
    }
}
```

**핵심: 표현 모드를 「보이는 미터/포인트」로 결정한다.** zoom 숫자를 하드코딩하면 기기·화면 크기가 바뀔 때 깨진다.

```swift
// MapKit 내장 클러스터링 — iOS 11+
final class VehicleAnnotationView: MKAnnotationView {
    override init(annotation: MKAnnotation?, reuseIdentifier: String?) {
        super.init(annotation: annotation, reuseIdentifier: reuseIdentifier)
        clusteringIdentifier = "vehicle"      // ← 이 한 줄로 MapKit 이 묶어준다
    }
}

func mapView(_ mv: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
    if let cluster = annotation as? MKClusterAnnotation {
        // 숫자 뱃지 — cluster.memberAnnotations.count
    }
    // ...
}
```

> ⚠️ **`clusteringIdentifier` 만으로는 부족하다.** MapKit 클러스터링은 **뷰포트 기준**이라 팬할 때 숫자가 깜빡인다(→ 개념 ⑤). 그리고 애초에 **5만 개 annotation 을 addAnnotations 하면 안 된다** — 뷰포트 쿼리로 내려받는 양 자체를 줄여야 한다.

### iOS 함정

```
🔴 addAnnotations(5만개) = 메모리 + 레이아웃 폭발
   ⇒ regionDidChange 에서 뷰포트 쿼리 → diff 갱신(전체 remove/add 금지)

🔴 regionDidChangeAnimated 는 팬/핀치 중 초당 수십 회 호출
   ⇒ debounce 필요. Combine: .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
     또는 Task 취소 패턴으로 이전 쿼리 cancel

🔴 오래된 응답이 최신 화면을 덮어쓴다 (레이스)
   ⇒ 요청에 세대(generation) 번호 또는 Task 교체로 최신만 반영

🔴 MKAnnotationView 재사용 — dequeueReusableAnnotationView 안 쓰면 스크롤 버벅임
   (UITableViewCell 재사용과 같은 원리 → ios-04 셀 재사용 레이스도 동일하게 적용)
```

---

## ⑤ 클러스터 = 좌표의 함수 → 그리드 스냅 키

### 도메인 원리
**클러스터를 뷰포트의 함수로 만들면** 팬할 때 경계 근처가 들락날락 → 숫자 깜빡임 → 신뢰 붕괴.
같은 지역 = 항상 같은 답이어야 한다.

### Swift 구현

```swift
// ✅ 좌표를 그리드에 스냅 → 뷰포트와 무관한 결정적 키
struct GridKey: Hashable {
    let latIndex: Int
    let lonIndex: Int
    let zoomBucket: Int          // zoom 도 정수로 스냅 (핀치 중 재계산 폭발 방지)

    init(_ c: CLLocationCoordinate2D, zoomBucket: Int) {
        let cellSize = Self.cellSize(for: zoomBucket)     // 도(degree) 단위
        self.latIndex = Int((c.latitude  / cellSize).rounded(.down))
        self.lonIndex = Int((c.longitude / cellSize).rounded(.down))
        self.zoomBucket = zoomBucket
    }
}

func cluster(_ vehicles: [Vehicle], zoomBucket: Int) -> [GridKey: [Vehicle]] {
    Dictionary(grouping: vehicles) { GridKey($0.coordinate, zoomBucket: zoomBucket) }
    // 입력이 같으면 출력이 같다 = 뷰포트가 움직여도 안정
}
```

**핵심 문장:** 서버로 옮기는 게 해법인 게 아니라 **뷰포트 의존을 끊는 게** 해법. 위 코드는 **클라에서도 안정적**이다. 서버 집계의 진짜 이득은 안정성이 아니라 **5만 건을 클라에 안 내려도 된다는 것**(개념 ④와 연결).

```swift
// 뷰포트 패딩 — 경계 들락날락을 화면 밖으로
extension MKCoordinateRegion {
    func padded(by factor: Double = 1.5) -> MKCoordinateRegion {
        MKCoordinateRegion(
            center: center,
            span: MKCoordinateSpan(latitudeDelta:  span.latitudeDelta  * factor,
                                   longitudeDelta: span.longitudeDelta * factor)
        )
    }
}
```

### iOS 함정

```
🔴 Double 을 Hashable 키로 직접 쓰면 부동소수 오차로 같은 셀이 갈린다
   ⇒ Int 인덱스로 변환해서 키를 만든다 (위 GridKey)

🔴 클러스터 계산을 main 에서 하면 5천개부터 프레임 드랍
   ⇒ nonisolated func 또는 detached Task 에서 계산 → 결과만 @MainActor 로
   ⚠️ Vehicle 이 Sendable 이어야 함 (struct + let = 자동 Sendable)

🔴 zoomBucket 없이 그리드만 쓰면 확대해도 클러스터가 안 풀린다
```

---

## ⑥ 신뢰 경계 → 앱은 raw만 보내고 확정값을 받는다

### 도메인 원리
돈 계산 앱 금지의 진짜 이유는 배포주기가 아니라 **앱이 사용자 손에 있다**(탈옥·메모리조작·프록시변조).
앱 3역할: ① raw 전송 ② 서버 확정값 표시 ③ **"예상" 명시**.

### Swift 구현

```swift
// ❌ 앱이 금액을 계산해서 보낸다 — 서버가 믿을 근거 없음
struct FareRequest: Encodable {
    let distanceKm: Double
    let amount: Int              // 🔴 앱이 계산한 값
}

// ✅ 앱은 원천 데이터만 보낸다
struct TripReport: Encodable {
    let events: [LocationEvent]  // raw 좌표 + 타임스탬프
    let tripId: String
}

// ✅ 금액은 서버가 확정한 값을 받는다
struct Fare: Decodable {
    let confirmedAmount: Int     // 서버 확정 — 표시만
    let breakdown: [FareLine]
}

// ✅ 주행 중 표시는 "확정 아님"을 타입으로 구분한다
enum FareDisplay {
    case estimated(Int)          // "약 3,000원" — 추정
    case confirmed(Int)          // "3,000원"   — 서버 확정

    var text: String {
        switch self {
        case .estimated(let v): return "약 \(v.formatted())원"   // ⭐ "약" 을 타입이 강제
        case .confirmed(let v): return "\(v.formatted())원"
        }
    }
}
```

**왜 `enum` 으로 나누나** — `Int` 하나면 개발자가 실수로 추정치를 확정처럼 표시한다. **타입이 다르면 실수할 수 없다.** 반납 후 금액이 달라졌을 때 CS가 터지는 걸 타입으로 막는다.

### iOS 함정

```
🔴 클라 검증은 UX용, 보안용 아님
   앱에서 "잔액 부족" 체크해도 서버가 반드시 다시 본다 (앱은 신뢰 경계 밖)

🔴 Decodable 기본값 함정 — 서버가 필드를 안 보내면 silent-nil
   ⇒ CodingKeys 명시 + Optional 로 받고 명시적 처리
     (A7 에서 실측: CodingKeys 미보유 DTO 가 다수 = silent-nil 위험)

🔴 UserDefaults 에 금액/권한 캐시 = 평문 plist = 조작 가능
   ⇒ 서버 확정값은 캐시해도 "표시용"으로만. 판단 근거로 쓰지 말 것

🔴 Info.plist / 빌드 설정의 요금 상수 = 배포 주기에 묶인다
   ⇒ 원격 설정(서버)으로. 앱에 요금표를 넣는 순간 위 ①번 문제 재발
```

---

## ⑦ 원본 vs 파생 → 저장 모델과 표시 모델을 타입으로 분리

### 도메인 원리
스무딩은 **한다**(raw GPS 그대로 그리면 순간이동 = "앱 고장"). 다만 **저장 안 한다**(추측을 사실로 승격).
**원칙: `store raw, smooth at render`.**

### Swift 구현

```swift
// ① 원본 — 불변, 그대로 저장
struct LocationEvent: Codable, Sendable {
    let coordinate: CLLocationCoordinate2D
    let timestamp: Date              // 기기 시각 (⚠️ 개념 ⑧ — 감사 대상)
    let horizontalAccuracy: CLLocationAccuracy   // ⭐ 정확도도 원본이다
    let speed: CLLocationSpeed
}

// ② 파생 — 표시 시점에 계산, 저장 안 함
struct DisplayTrack {
    let points: [CLLocationCoordinate2D]

    init(smoothing events: [LocationEvent]) {
        self.points = events
            .filter { $0.horizontalAccuracy < 50 }      // 정확도 낮은 건 표시 제외
            .smoothed()                                  // 파생 — 버리고 다시 만들 수 있다
    }
}
```

**핵심: 두 타입을 분리하면 "실수로 파생을 저장"이 불가능해진다.** `LocationEvent` 배열만 `Codable` 이고 `DisplayTrack` 은 아니다 — 저장하려면 컴파일이 안 된다.

```swift
// 일반화 — 이건 GPS만의 얘기가 아니다
원본(fact)          파생(derived)
─────────────────────────────────
LocationEvent   →   DisplayTrack           (스무딩)
[RawEvent]      →   Statistics             (집계)
originalImage   →   downsampledThumbnail   (리사이즈 — sd-b1 디코딩 배율)
```

> 💡 **sd-b1 「이미지 디코딩 배율」과 같은 구조다.** 디스크엔 원본 JPEG, 메모리엔 표시 크기로 다운샘플링한 비트맵. 원본을 리사이즈해서 덮어쓰면 나중에 큰 화면에서 못 쓴다. **파생은 캐시고, 캐시는 버릴 수 있어야 한다.**

### iOS 함정

```
🔴 CLLocationCoordinate2D 는 Codable 아님 (C struct)
   ⇒ 별도 Codable wrapper 또는 lat/lon 을 개별 저장

🔴 Core Data 에 스무딩 결과를 저장하고 원본을 지우면 마이그레이션 불가
   ⇒ 원본 엔티티 유지, 파생은 transient 속성 또는 계산 프로퍼티

🔴 파생을 @Published 로 들고 있으면 메모리 압박
   ⇒ 표시 중인 구간만 계산 (lazy) — 전체 궤적을 미리 스무딩하지 말 것

🔴 Caches/ vs Documents/ — 파생은 Caches (백업 제외, OS가 지워도 됨)
   원본은 Documents + .noBackup 판단  (ios-05 로컬저장소와 연결)
```

---

## ⑧ 기기 시계 불신 → `Date()` 금지, 단조시계 분리

### 도메인 원리
악의(요금 회피) 외에도 **악의 없이 틀린다** — 시간대 변경, NTP 드리프트, 자동시간 OFF.
**분 단위 오차가 일상적**이고 분당 과금이라 바로 돈. 시각은 **서버가 확정**한다.

### Swift 구현

```swift
// ❌ 요금·과금 판단에 Date() 를 쓴다
let duration = Date().timeIntervalSince(startedAt)      // 🔴 유저가 바꿀 수 있다
let fare = Int(duration / 60) * ratePerMinute           // 🔴 게다가 앱이 계산 (개념 ⑥)

// ✅ 앱은 이벤트만 보내고 서버가 시각을 확정
struct ReturnEvent: Encodable {
    let tripId: String
    // 시각을 안 보낸다 — 서버가 수신 시각으로 확정
}

// ✅ 오프라인 반납이 필요해 시각을 보내야 하면 → 감사 가능하게
struct OfflineReturnEvent: Encodable {
    let tripId: String
    let deviceTimestamp: Date        // 신뢰하지 않고 "감사"용으로 보낸다
    let uptimeSeconds: TimeInterval  // ⭐ 단조시계 — 시계를 조작해도 이건 안 변한다
}
```

**경과 시간에는 `Date` 가 아니라 단조시계를 쓴다:**

```swift
// ✅ ContinuousClock — 시스템 시계 변경에 영향받지 않음 (iOS 16+)
let clock = ContinuousClock()
let start = clock.now
// ...
let elapsed = clock.now - start        // Duration — 유저가 시계 바꿔도 정확

// iOS 16 미만: 부팅 후 경과 시간
let uptime = ProcessInfo.processInfo.systemUptime   // 시계 조작에 불변
```

| 용도 | 쓸 것 | 안 쓸 것 |
|---|---|---|
| 과금 기준 시각 | **서버 시각** | `Date()` |
| 경과 시간 측정 | `ContinuousClock` / `systemUptime` | `Date().timeIntervalSince` |
| 화면 표시 | `Date()` + `.formatted()` | — (표시는 기기 시각이 맞다) |
| 캐시 만료 | 서버 시각 or 단조시계 | `Date()` |

**서버 시각 오프셋 패턴:**

```swift
actor ServerClock {
    private var offset: TimeInterval = 0      // 서버 - 기기

    func sync(serverDate: Date, receivedAt: Date) {
        offset = serverDate.timeIntervalSince(receivedAt)
    }
    var now: Date { Date().addingTimeInterval(offset) }
}
// HTTP Date 헤더 또는 응답 바디의 서버 시각으로 주기적 보정
```

### iOS 함정

```
🔴 systemUptime 은 sleep 중 멈추는 기종/상황이 있다
   ⇒ ContinuousClock (iOS16+) 이 "sleep 포함 단조" 를 보장. Suspending 과 구분:
     · ContinuousClock  = sleep 중에도 흐른다  ← 경과시간 측정용
     · SuspendingClock  = sleep 중 멈춘다      ← CPU 작업 측정용

🔴 TimeZone 변경 알림 — 표시 갱신 필요
   NotificationCenter: .NSSystemTimeZoneDidChange / .NSSystemClockDidChange

🔴 백그라운드에서 타이머는 죽는다
   ⇒ Timer 로 주행 시간을 누적하면 백그라운드 구간이 빠진다
     복귀 시 "시작 시각 기준 재계산"(단조시계) 으로 보정

🔴 Date 는 Codable 인코딩 전략에 따라 값이 달라진다
   ⇒ JSONDecoder.dateDecodingStrategy 를 서버와 명시적으로 합의 (.iso8601 권장)
```

---

## ⑨ 위치 start/stop 13:1 → `actor` + 참조 카운팅

### 도메인 원리
내 코드: `startUpdatingLocation` **13곳** : `stopUpdatingLocation` **1곳** + 전역 최고정확도.
구조 진단 = **켠 사람 13명, 끌 책임자 0명**(공유지의 비극). 핵심 = **소유권/참조 카운팅**.

### Swift 구현

```swift
// ❌ 각 화면이 매니저를 직접 켠다 — 끌 책임자가 없다
final class SomeViewController: UIViewController {
    let manager = CLLocationManager()
    override func viewDidLoad() {
        manager.desiredAccuracy = kCLLocationAccuracyBest   // 🔴 전역 최고정확도
        manager.startUpdatingLocation()                      // 🔴 stop 은 아무도 안 부름
    }
}
```

```swift
// ✅ 단일 소유자 + 구독 참조 카운팅
actor LocationService {
    private let manager = CLLocationManager()
    private var subscriptions: [UUID: Accuracy] = [:]

    enum Accuracy: Comparable {          // 화면이 "필요한 만큼"만 요구
        case coarse                      // 목록·검색  (kCLLocationAccuracyKilometer)
        case balanced                    // 지도 표시  (HundredMeters)
        case precise                     // 반납 구역판정 (Best)
    }

    func subscribe(_ accuracy: Accuracy) -> LocationSubscription {
        let id = UUID()
        subscriptions[id] = accuracy
        applyHighestRequested()          // 요구 중 가장 높은 정확도만 적용
        if subscriptions.count == 1 { manager.startUpdatingLocation() }
        return LocationSubscription { [weak self] in
            await self?.unsubscribe(id)
        }
    }

    private func unsubscribe(_ id: UUID) {
        subscriptions[id] = nil
        if subscriptions.isEmpty {
            manager.stopUpdatingLocation()    // ⭐ 구독 0 → 자동 stop
        } else {
            applyHighestRequested()           // ⭐ 정확도도 자동 하향
        }
    }

    private func applyHighestRequested() {
        manager.desiredAccuracy = (subscriptions.values.max() ?? .coarse).clValue
    }
}

// 구독 핸들 — deinit 으로 해제 보장
final class LocationSubscription {
    private let onCancel: () async -> Void
    init(onCancel: @escaping () async -> Void) { self.onCancel = onCancel }
    deinit { Task { [onCancel] in await onCancel() } }   // ⭐ 화면이 죽으면 자동 해제
}
```

**핵심: 화면은 `stop` 을 부를 책임이 없다.** 구독을 **놓기만** 하면 된다. 화면이 13개든 30개든 안전하다.

```swift
// 사용처 — 화면은 "필요한 정확도"만 선언
final class MapViewController: UIViewController {
    private var locationSub: LocationSubscription?

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        Task { locationSub = await LocationService.shared.subscribe(.balanced) }
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        locationSub = nil            // ← 이것만으로 stop/정확도 하향이 자동
    }
}
```

> 💡 **면접 서사로 최상급이다** — *"제 코드에서 위치 start 가 13곳, stop 이 1곳인 걸 발견했습니다. 각 화면이 매니저를 직접 켜니까 끌 책임자가 없는 구조였습니다. 정확도도 전역 최고값이었습니다. 화면별 필요 정확도를 선언하고 구독이 0이 되면 자동으로 끄는 소유권 구조로 바꾸는 게 맞다고 판단했습니다."*
> **"내 코드의 문제를 내가 찾았다"는 남의 코드 비판보다 훨씬 강하다.**

### iOS 함정

```
🔴 CLLocationManager 는 생성 스레드의 run loop 에 delegate 를 붙인다
   ⇒ actor 안에서 만들면 delegate 콜백 스레드 주의. 실무에선
     nonisolated delegate shim → actor 로 넘기는 패턴

🔴 정확도 역설 — 항상 kCLLocationAccuracyBest 를 쓰면 노이즈·튐이 늘고
   배터리를 태운다. "높을수록 좋다"가 아니다

🔴 iOS 14+ reducedAccuracy — 유저가 "대략적 위치"만 허용할 수 있다
   ⇒ manager.accuracyAuthorization 확인. .reducedAccuracy 면 구역판정 불가
     → 서버 판정으로 폴백하거나 정밀 권한 1회 요청(temporaryFullAccuracy)

🔴 백그라운드 위치는 배터리 최대 소모원 + 심사 사유
   ⇒ allowsBackgroundLocationUpdates 는 정말 필요할 때만. 대안:
     · significantLocationChange (저전력)
     · region monitoring (반납 구역 진입 감지에 적합)
     · pausesLocationUpdatesAutomatically = true

🔴 deinit 에서 Task 를 만들면 실행 보장이 약하다
   ⇒ 명시적 해제(viewWillDisappear 에서 nil)를 1차로, deinit 은 안전망
```

---

## 🎯 면접 3층 답변 템플릿

도메인 질문을 받으면 **이 순서로** 답한다:

```
① 도메인 위험 (10초)
   "이건 ~해서 위험합니다"                    ← 나는 이미 강하다 ✅

② Swift 구현 (30초)   ⭐ 여기가 합격선
   "그래서 저는 ~로 구현합니다"
   실제 타입·API 이름을 말한다: actor / AsyncStream / enum / Sendable
   "왜 그 타입인가"를 한 줄 붙인다

③ iOS 함정 (20초)
   "다만 iOS 에서는 ~를 주의해야 합니다"
   스레드 · 앱 생명주기 · 백그라운드 · 메모리 · 배터리 · 심사
```

**예시 — 「멱등키」 질문:**

> ① *"결제 재시도에서 이중결제가 나는 게 핵심 위험입니다. 같은 키에 다른 페이로드가 오면 서버가 409로 거절해야 합니다."*
> ② *"클라 쪽은 키 저장소를 `actor` 로 둡니다. 결제 버튼 연타나 여러 화면 동시 요청에서 레이스가 나는데, `actor` 면 컴파일러가 격리를 보증하니까 single-flight 가 됩니다. 그리고 키는 재시도 루프 밖에서 한 번만 만들고, 네트워크 호출 전에 디스크에 씁니다."*
> ③ *"iOS 함정은 두 가지입니다. 앱이 킬되면 `Task` 가 사라지는데 키가 메모리에만 있으면 조회 수단을 잃습니다. 그리고 `Task` 취소는 요청 실패가 아니라 「모호」 상태라서, `CancellationError` 에서 키를 지우면 안 됩니다."*

---

## 🔗 연결

| 이 문서 | 연결 |
|---|---|
| 멱등키 `actor` | `arch-a7-network-layer-deep` 토큰갱신 single-flight (같은 패턴) |
| BLE `AsyncStream` | `arch-a5-rx-to-concurrency-migration` delegate→async 브릿지 |
| 클러스터 백그라운드 계산 | `ios-04-gcd-and-cell-reuse` Sendable·스레드 |
| 원본 vs 파생 | `sd-b1-napkin-math` 이미지 디코딩 배율 · `ios-05-local-storage` Caches/Documents |
| 신뢰 경계 Decodable | `arch-a7` CodingKeys silent-nil |
| 위치 소유권 | `sd-m1-map-deep` 발견7 (start13:stop1 원본 발견) |
| 도메인 원리 전체 | `REVIEW.md` 정답키 2026-08-06 세션9 섹션 |
