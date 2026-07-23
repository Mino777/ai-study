# 카셰어링 앱 컴포넌트 End-to-End 딥다이브 (면접 답변)

> 면접관이 "그 컴포넌트 자세히 설명해보세요"라고 지목할 때용 답변 스크립트.
> 전국 단위 카셰어링/모빌리티 iOS 앱(RIBs + ReactorKit + RxSwift, 50개 SPM 멀티모듈, ~320K LOC)에서
> 제가 실제로 만지고 파악한 3개 컴포넌트를 아키텍처 그림 + 데이터 흐름 + 어려웠던 점 + 해결로 정리했습니다.

---

## 딥다이브 1 — 디지털 카키 (BLE 차량 제어)

### 한 줄 요약
"예약한 차량의 문을 앱으로 여닫는 디지털 키입니다. 앱이 차량 하드웨어와 **BLE로 직접 암호화 양방향 통신**을 하는데, 소프트웨어 버그가 곧 '현장에서 문이 안 열리는' 장애가 되는, 오류 허용치가 가장 낮은 컴포넌트였습니다."

### 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation (RIBs + ReactorKit)                            │
│   ViewController ── viewState ──> SwiftUI/UIKit               │
│        │ sendAction(.unlock / .lock / .trunk / .horn)        │
│        ▼                                                      │
│   Interactor(=Reactor)  ─ mutate ─> Mutation ─ reduce ─> State│
└───────────────────────────────┬─────────────────────────────┘
                                 │ 제어 명령
         ┌───────────────────────┴───────────────────────┐
         ▼ (경로 1: 근거리 BLE)          ▼ (경로 2: 서버 원격제어)
┌──────────────────────────┐    ┌──────────────────────────┐
│  BLE 스택 (자체구현)      │    │  텔레매틱스 SDK           │
│  ┌────────────────────┐  │    │  (원격 잠금/해제 폴백)     │
│  │ PacketBuilder       │  │    └──────────────────────────┘
│  │  STX/ETX 프레이밍   │  │
│  │  AES-CBC 암호화     │  │
│  │  LRC 오류검출        │  │
│  ├────────────────────┤  │
│  │ ResponseParser      │  │
│  │  목적지/메시지타입/  │  │
│  │  응답코드 인덱스     │  │
│  └────────────────────┘  │
│  CoreBluetooth 상태머신   │
│   scan→connect→handshake  │
│   →write→notify→retry(≤3) │
└─────────────┬────────────┘
              ▼ GATT (Service/Write/Notify UUID 3종)
      ┌───────────────┐
      │  차량 BLE 모듈 │  ← 물리 하드웨어
      └───────────────┘
```

두 경로가 병존하는 게 핵심입니다. **근거리에선 BLE로 직접 제어**(빠름, 오프라인 가능), 실패하거나 원거리면 **서버 원격제어로 폴백**합니다. 문 여닫기는 즉시성이 생명이라 BLE가 1차, 통신이 안 되는 지하주차장 같은 상황을 서버 경로가 못 메우니 BLE 안정성이 결국 승부처였습니다.

### 데이터 흐름 (잠금해제 1회)

```
사용자 "차 문 열기" 탭
  │ sendAction(.unlock)
Interactor: mutate(.unlock)
  │ 세션 없으면 handshake부터
  ▼
[핸드셰이크]  앱 ──(공개키 교환 기반)──> 차량, 세션키 수립
  ▼
[명령 빌드]  PacketBuilder
   payload = AES-CBC.encrypt(key: 세션키, iv, data: 잠금해제비트마스크 0x02)
   frame  = STX(0x00) + 길이 + 목적지 + 메시지타입 + ID + payload + LRC + ETX(0xFF)
  ▼
[전송]  CoreBluetooth write (Write UUID)
  ▼
[응답]  Notify UUID 로 ACK 수신
   ResponseParser: LRC 검증 → 응답코드 파싱
   ├─ 성공 → Mutation(.controlSucceeded) → State 갱신 → "열림" UI
   └─ LRC 에러 / 타임아웃 → retry (maxRetryCnt=3, 디바운스)
        └─ 3회 실패 → 서버 원격제어 폴백 or 실패 안내
```

방향 구분 바이트(앱→차량 / 차량→앱 각각 암/평문 구분)까지 프로토콜에 박혀 있어서, 패킷 하나 파싱하려면 프레이밍·암호화·방향·응답코드를 다 맞춰야 했습니다.

### 어려웠던 점

1. **실시간 암호화 양방향 통신을 앱이 직접 책임** — 서버 API 호출처럼 요청/응답이 깔끔한 게 아니라, 커스텀 프레이밍(STX/ETX/길이/LRC) + AES-CBC 세션 암호화 + GATT write/notify 비동기 콜백을 상태머신으로 직접 엮어야 했습니다.
2. **실패 모드가 물리 세계와 결합** — 네트워크 에러는 재시도하면 되지만, "문이 안 열림"은 사용자가 차 앞에 서 있는 즉각적 현장 장애입니다. 연결 실패/타임아웃/LRC 에러/백그라운드 BLE 끊김을 각각 다르게 처리해야 했습니다.
3. **보안** — 세션키가 노출되면 남의 차를 열 수 있으니 채널 암호화가 필수인데, 임베디드 제약상 핸드셰이크에 하드코딩된 로컬 프라이빗 키를 쓰는 구조라 키 관리가 예민했습니다.

### 해결

- **상태머신 명시화** — scan→connect→handshake→write→notify를 명확한 상태로 두고, 각 전이 실패를 개별 처리. 재연결은 디바운스로 폭주 방지, 명령 재시도는 `maxRetryCnt=3`으로 상한.
- **LRC 오류검출을 앱단에서** — 물리 채널 노이즈로 깨진 패킷을 응답코드(`kResponseLrcError`)로 잡아 무한 대기 대신 즉시 재시도.
- **2경로 폴백** — BLE 3회 실패 시 서버 원격제어로 자동 폴백해 "문 안 열림" 단일 장애점을 제거.
- **오프라인 내성** — BLE는 서버 없이 근거리에서 동작하므로, 통신 음영지역에서도 제어 가능하게 BLE를 1차 경로로 배치.

> 면접 마무리 멘트: "이 컴포넌트에서 배운 건, 물리 세계와 붙는 기능은 '해피패스 구현'이 아니라 '실패 모드 설계'가 90%라는 점이었습니다. 재시도·타임아웃·폴백·오프라인을 상태로 명시하지 않으면 현장에서 그대로 터집니다."

---

## 딥다이브 2 — 편도 렌탈 딜 (실시간 특가 매물)

### 한 줄 요약
"출발지와 반납지가 다른 편도 렌탈의 **위치·기간 기반 특가 매물** 기능입니다. 실시간 매물 리스트/상세/경로확인/알림/필터를 다루는데, 낙관적 UI 갱신과 단방향 상태흐름을 섞으면서 생기는 회귀를 플래그로 방어한 게 핵심 경험이었습니다."

### 아키텍처 (신형 하이브리드 — SwiftUI + Reactor)

```
┌──────────────────────────────────────────────────────────┐
│  SwiftUI View (UIHostingController로 RIBs에 얹음)          │
│    filteredVehicleList (computed: 카테고리필터+정렬, 앱단) │
│    isSkeleton / isLoading                                  │
│        ▲ @Published                    │ 사용자 인텐트      │
│        │                               ▼                   │
│  ┌─────┴───────────────────────────────────────────┐      │
│  │ @MainActor ObservableObject ViewModel             │      │
│  │   sendAction(_:) ─ 이중역할:                       │      │
│  │     ① 로컬 UI 즉시 갱신 (낙관적)                    │      │
│  │     ② listener.sendAction() 상향 전파              │      │
│  └─────┬───────────────────────────────────▲────────┘      │
└────────│───────────────────────────────────│──────────────┘
         │ (VC가 브릿지)                       │
   viewState:Observable<ViewState>   viewPulse:Observable (1회성)
         │                                    │
┌────────▼────────────────────────────────────┴───────────┐
│  Interactor (= RIBs Interactor + ReactorKit Reactor)     │
│    Action → mutate → Observable<Mutation> → reduce → State│
│      mutate: useCase.fetchDealList / saveCarPushAlarm     │
│      reduce: 순수함수, State 복제·갱신                     │
└───────────────────────┬──────────────────────────────────┘
                        ▼
              UseCase → Repository → Network(REST)
```

이 코드베이스 표준은 **RIBs Interactor가 곧 ReactorKit Reactor**입니다(별도 Reactor 클래스 없이 한 클래스가 겸함). 여기에 신규 화면은 SwiftUI + `@MainActor ObservableObject` ViewModel을 말단에 얹은 하이브리드로, 편도 딜이 그 대표 화면입니다.

### 데이터 흐름 (알림 등록 + 낙관적 UI)

```
[View] 알림 벨 탭
  │ viewModel.sendAction(.didTapAlarmBell(vehicle))
  ▼
[ViewModel] ① 로컬 즉시: 벨 아이콘 ON + 토스트 표시 (낙관적)
            ② listener.sendAction 상향
  ▼
[Interactor] mutate(.didTapAlarmBell)
   Observable.concat([
     .just(.setLoading(true)),
     useCase.saveCarPushAlarm(...)      // 네트워크 (async→Rx 브릿지)
        .observe(on: MainScheduler)
        .flatMap { .just(.saveAlarmResult($0)) },
     .just(.setLoading(false))
   ])
  ▼
[reduce] 순수함수: newState.alarmRegistered = result... 반환
  ▼
[viewState] ──> VC 구독 ──> viewModel.@Published 갱신 ──> SwiftUI 리렌더
[viewPulse] ──> 에러 메시지 1회성 ──> showAlert (State 재방출로 중복 안 뜸)
  ▼
[ViewModel 타이머] Task{ @MainActor; sleep 2.5s; 토스트 자동 해제 }
```

### 게이팅 / 실시간성

- **필터·정렬은 앱단 computed로** — 서버 재호출 없이 `filteredVehicleList`를 ViewModel computed로 계산해 Reactor를 가볍게 유지. 실시간 반응성 확보.
- **상태 게이팅** — 비로그인 유저가 알림 등록을 누르면 로그인 서브플로우(RIBs 자식 RIB attach)로 게이팅. 딥링크로 상세/리스트/경로/알림/필터 각각 직접 진입 가능해, 진입 시점의 앱 상태(로그인/게스트/스플래시)를 검사해 화면을 정리.
- **1회성 이벤트 분리** — 에러 토스트/알럿은 지속 State가 아니라 `@Pulse` + `viewPulse`로 분리 방출. State 재방출 시 알럿이 중복으로 뜨는 고전 MVI 버그를 구조적으로 차단.

### 어려웠던 점

**단방향 흐름 + 낙관적 로컬 갱신을 섞으면 상태가 되살아나는 회귀가 납니다.** 예를 들어 사용자가 경로를 초기화했는데, 서버 State가 재방출되면서 리액티브하게 서버값이 다시 복원되는 버그. 초기 지역값이 재방출로 되살아나거나, 딥링크 필터가 두 번 적용되는 문제들이 QA에서 반복적으로 잡혔습니다.

### AOS Parity

편도 딜은 iOS/AOS 동시개발 피처였습니다. 같은 서버 payload를 두 플랫폼이 다르게 렌더하는 지점(예: 서버 `errMsg`의 `<br>` 개행을 AOS는 그대로, iOS는 `\n`으로 변환)이 있어서, **서버 payload 포맷·정렬키·상태코드 게이팅·`*Yn` enum·노출조건을 구현 전에 AOS 동작을 기준(SoT)으로 맞추는** 자가검증을 거쳤습니다. 코드 레벨 parity 자동화보다 프로세스로 담보한 케이스입니다.

### 해결

- **1회성 가드 플래그** — `didApplyInitialRegions`, `hasUserResetRoute`, `didApplyDeepLinkFilter` 같은 플래그로 "이미 적용했으면 재적용 안 함"을 명시. 리액티브 재발화로 서버값이 재복원되는 회귀를 QA 티켓 단위로 방어(주석에 티켓 번호까지 박제).
- **State / ViewState 경계 분리** — 내부 도메인 State와 외부 노출용 ViewState를 매핑 레이어로 분리해 내부 필드가 View로 새지 않게 함.
- **낙관적 갱신 + 상향 전파 이중역할** — ViewModel `sendAction`이 로컬 즉시 반영 + Interactor 상향을 동시에 해, SwiftUI 반응성과 ReactorKit 단방향을 둘 다 만족.

> 면접 마무리 멘트: "낙관적 UI는 체감 속도를 올리지만, 단방향 상태흐름과 섞으면 '누가 진실의 원천인가'가 애매해집니다. 저희는 1회성 이벤트(@Pulse)와 지속 상태(State)를 분리하고, 재적용 금지 플래그로 이 경계를 지켰습니다."

---

## 딥다이브 3 — 네트워킹 / DTO 계약 (silent-nil 방어)

### 한 줄 요약
"타입세이프한 REST 추상화와 토큰 자동갱신을 갖췄지만, DTO의 **silent-nil**(에러 없이 조용히 nil로 흡수되는 안티패턴)이 구조적 리스크였습니다. 이걸 Entity 매핑 경계 + 계약 감사로 방어한 경험입니다."

### 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  Network 패키지 (4개 product로 분리)                      │
│                                                          │
│   RESTAPIs          Requestable 프로토콜                 │
│   ┌──────────────────────────────────────┐              │
│   │ protocol Requestable: Hashable {       │              │
│   │   associatedtype Output: Decodable     │  ← 요청↔응답 │
│   │   var endpoint / method / query / header│    컴파일    │
│   │ }                                       │    타임 바인딩│
│   └──────────────────────────────────────┘              │
│                    │                                      │
│   RESTInfrastructure (전송 엔진)                          │
│   ┌──────────────────────────────────────┐              │
│   │ async send<T>(_:) throws -> T.Output   │  Alamofire   │
│   │   ├ 토큰 주입 (guest 우선 → 회원)       │  Session 래핑│
│   │   ├ BaseResponse<T>.validate()          │              │
│   │   └ RESTInfraError 매핑 (errCode→enum)  │              │
│   └──────────────────────────────────────┘              │
│                    │ (+Rx 브릿지 = 사실상 401 인터셉터)    │
│   RESTResponseDTO   서버 Decodable 191개                 │
│   RESTMockSupport   JSON fixture                         │
└─────────────────────────┬───────────────────────────────┘
                          ▼ DTO
              [Entity 매핑 경계]  init(dto:) 에서 ?? 기본값
                          ▼ Entity
              Repository (remote 프록시) → UseCase → Presentation
```

### 데이터 흐름 (요청 + 토큰 만료 재시도)

```
[Repository] network.send(request).map { Entity(dto: $0) }
  │
  ▼ (+Rx 브릿지)
Observable.create { Task {
   do {
     response = try await send(request, .member)     // async 코어
     observer.onNext(response)
   } catch RESTInfraError.featureError(.invalidToken / .tokenExpired) {
     try await reloadAccessToken()                    // 토큰 갱신
     response = try await send(request, .member)      // ← 정확히 1회 재시도
     observer.onNext(response)
   } catch { observer.onError(error) }
}}
  │
  ▼
[BaseResponse<T>.validate()]
   errCode != 0  → RESTInfraError.error(errMsg) throw
   data == nil    → .dataIsNil throw
   성공           → T 반환
  │
  ▼
[DTO → Entity]  nil 흡수
   self.parentRentSeq      = dto.parentRentSeq ?? ""
   self.dealInsuranceFee   = dto.dealInsuranceFee ?? 0
   self.isAlarmRegistered  = dto.isAlarmRegistered ?? "N"
```

### 에러 전파 규약

- **도메인 Result enum으로 값-레벨 처리** — 네트워크 실패를 Rx `onError`로 스트림을 죽이지 않고, `.success(entity)` / `.fail(message)` enum으로 표현. reduce에서 `.fail(msg)` → `newState.errorMessage = msg`로 흡수해 스트림이 살아있음.
- **errCode → 타입 매핑** — 서버 `errCode`(401=invalidToken, 410=tokenExpired 등)를 enum으로 매핑, 실패 코드는 `.unknown` 폴백. 메시지는 `error.localizedDescription`으로 취득(캐스팅 금지 규약).

### 어려웠던 점 — silent-nil

**DTO 191개 중 CodingKeys를 명시한 건 36%뿐이고, 거의 모든 프로퍼티가 Optional입니다.** 이게 조합되면 위험합니다.

```
서버가 필드명을 rename (예: dealFee → dealAmount)
   │
   ▼
CodingKeys 없음 → 프로퍼티명 자동 매핑 실패
   │
   ▼
Optional 이라 throw 안 하고 조용히 nil
   │
   ▼
Entity 매핑에서 ?? 0 으로 흡수
   │
   ▼
화면에 "0원" 표시 — 에러 로그 0, 크래시 0, 아무도 모름
```

즉 **"필드가 실제로 안 온 것"과 "의도적 기본값"이 구분되지 않습니다.** 서버 계약 변경이 컴파일·런타임 어디서도 안 잡히고 빈 문자열/0으로 흘러갑니다. AOS 동시개발이라 서버 계약 변경 빈도가 높은 만큼 재발 위험이 컸습니다.

### 해결

- **Entity 매핑 경계로 격리** — DTO를 Presentation에 직접 노출하지 않고, `init(dto:)`에서 nil을 명시적 기본값으로 흡수. 최소한 nil-크래시는 원천 차단.
- **계약 감사(contract-audit) 프로세스화** — swagger + AOS + 실제 서버 응답 3-oracle로 대조하고, DTO 추가/수정 시 CodingKeys 명시 + decode-roundtrip 테스트로 silent-nil을 코드 짜기 전에 게이팅. (하네스 스킬로 상시 감시)
- **Protocol Witness 테스트** — DTO를 직접 mock 못 하는 경우, 동일 계산 로직을 테스트에 미러링해 "컴파일되면 계약 일치"로 검증. JSON 디코딩 → Entity 분기 프로퍼티 assert로 회귀 추적(테스트명에 티켓 번호 결합).

### 추가로 발견한 리스크 (정직하게 언급)

면접에서 "이 시스템의 약점은?"이라 물으면 이렇게 답합니다:

- **토큰 갱신이 시간창 기반** — 마지막 갱신 시각이 1초 이내면 실제 갱신 대신 0.35초 대기 후 성공 알림만 쏘는 간이 뮤텍스라, 락이 아니라 경합 구간에 레이스 가능성이 있습니다.
- **네트워크 클라이언트가 화면마다 N개** — RIB Builder마다 개별 생성되어 NotificationCenter 옵서버가 N중 등록됩니다. 공유 싱글톤이었다면 더 안전했을 지점.
- **PUT dead code** — 요청 팩토리에서 PUT이 POST(body) 경로로 라우팅되고 별도 `makePutRequest()`는 미사용. 우연히 동작하지만 계약상 버그성.
- **영속성이 UserDefaults + 하드코딩 AES 키** — Keychain 미사용에 암호화 키/IV가 소스에 박혀 있어, 토큰 보관 보안이 Keychain 대비 약합니다. 개선 1순위로 꼽습니다.

> 면접 마무리 멘트: "타입세이프한 추상화(Requestable)와 자동 토큰갱신은 잘 됐지만, DTO 계약은 Optional + CodingKeys 미비로 silent-nil에 노출돼 있었습니다. 저는 이걸 '테스트로 잡는 버그'가 아니라 '프로세스로 막는 계약 문제'로 재정의해서, 매핑 경계 격리 + 3-oracle 감사로 구조적으로 방어했습니다."

---

## 3개 딥다이브 관통 메시지 (총평)

세 컴포넌트 모두 **"해피패스가 아니라 경계와 실패 모드가 진짜 일"** 이라는 걸 보여줍니다.

| 컴포넌트 | 진짜 어려움 | 해결 원리 |
|---|---|---|
| 디지털 카키 (BLE) | 물리 세계와 실시간 결합, 실패=현장장애 | 상태머신 명시 + 재시도상한 + 2경로 폴백 |
| 편도 렌탈 딜 | 낙관적 UI × 단방향 흐름의 상태 회귀 | @Pulse 이벤트 분리 + 재적용 금지 플래그 |
| 네트워킹/DTO | silent-nil (에러 0 조용한 데이터 손상) | 매핑 경계 격리 + 3-oracle 계약 감사 |

공통적으로 저는 **"어디까지가 진실의 원천이고, 실패하면 무엇으로 폴백하는가"** 를 경계로 명시하는 방식으로 복잡도를 다뤘습니다.
