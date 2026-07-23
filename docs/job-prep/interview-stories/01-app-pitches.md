# 면접 답변 — "무엇을 만들었나" (카셰어링 앱 피칭)

> 5년차 iOS 엔지니어. 전국 단위 카셰어링/모빌리티 iOS 앱을 만들었다.
> 아래는 실제로 소리내어 말할 스크립트. 상황(길이·청중)별로 골라 쓴다.
> 숫자는 실측 기반: SPM 로컬 모듈 50개(문서상 규모는 더 큼), Swift 파일 약 1,900개, 코드 약 32만 줄, 화면 100개 이상(RIBs Builder 113 / ViewController 140), 누적 커밋 약 7천, 상시 기여자 두 자릿수. 아키텍처는 Clean Architecture 4계층 + Uber RIBs + ReactorKit + RxSwift.

---

## (a) 15초 엘리베이터 — 3개 변형

### 변형 A1 — 규모/역할 중심
"저는 전국에서 쓰는 카셰어링 앱을 iOS로 만들었습니다. 예약부터 차량 이용, 반납, 정산까지 한 앱에 다 들어있고, 화면만 100개가 넘습니다. 코드베이스는 SPM 멀티모듈 50개짜리 대형 모노레포고요. 저는 편도 렌탈, 이동 배차, 딥링크·서버 연동 쪽을 주로 맡았습니다."

### 변형 A2 — 기술 난도 중심
"제가 만든 건 차량을 BLE로 직접 여닫는 카셰어링 앱입니다. 앱이 스마트폰을 디지털 키로 써서 차 문을 열고 잠그는데, 그 통신을 AES 암호화 채널로 직접 구현한 게 핵심입니다. 소프트웨어 버그 하나가 '차 문이 안 열린다'는 현장 장애로 직결되는, 오류 허용치가 낮은 앱이었습니다."

### 변형 A3 — 아키텍처 중심
"저는 Clean Architecture 4계층에 Uber RIBs랑 ReactorKit을 얹은 대규모 iOS 앱을 만들었습니다. 모듈 50개를 도메인·유즈케이스·리포지토리·프레젠테이션으로 수직 분리해서, 화면 100개짜리 앱을 단방향 데이터 흐름으로 관리하는 구조입니다. 규모가 커도 복잡도가 통제되도록 설계된 앱입니다."

---

## (b) 1분 버전

"저는 전국 단위 카셰어링 앱을 iOS 네이티브로 개발했습니다. 사용자가 차를 예약하고, 스마트폰으로 차 문을 열고, 운행하고, 반납·정산까지 하는 전 과정을 담은 앱입니다.

규모부터 말씀드리면, SPM 로컬 모듈이 50개, Swift 파일 약 1,900개, 코드 32만 줄, 화면은 100개가 넘는 대형 모노레포입니다. 수년간 두 자릿수 인원이 붙어온 장수 프로덕트고, 누적 커밋이 7천 건 정도 됩니다.

아키텍처는 Clean Architecture 4계층 — 도메인, 유즈케이스, 리포지토리, 프레젠테이션 — 위에 Uber의 RIBs로 화면 트리와 DI를 잡고, 화면 안 상태는 ReactorKit으로 단방향으로 흐르게 했습니다. RxSwift가 반응형 백본이고요.

기술적으로 제일 어려운 부분은 디지털 카키였습니다. 앱이 BLE로 차량 하드웨어와 직접 암호화 통신을 해서 문을 여닫는 건데, 자체 패킷 프로토콜에 AES 암호화 채널까지 직접 구현했습니다. 저는 그 외에 편도 렌탈 특가 기능, 이동 배차 흐름, 그리고 5개 채널이 100개 넘는 화면으로 수렴하는 딥링크 라우팅을 주로 담당했습니다."

---

## (c) 2분 표준 "What I built" — 2개 변형

### 변형 C1 — 아키텍처 강조

"저는 전국에서 서비스되는 카셰어링 앱을 iOS로 만들었습니다. 차량 예약, 스마트폰 디지털 키, 운행, 반납, 정산까지 한 앱에서 다 되는 서비스입니다.

이게 왜 재미있는 프로젝트였냐면, 규모와 복잡도가 상당하기 때문입니다. SPM 로컬 모듈 50개, 화면 100개 이상, 코드 32만 줄. 이 정도 규모에서 복잡도가 우발적으로 터지지 않게 하려면 아키텍처가 방어선이어야 합니다.

그래서 저희는 Clean Architecture 4계층을 씁니다. 피처마다 도메인·유즈케이스·리포지토리·프레젠테이션을 수직 슬라이스로 물리 분리해서, 각 레이어를 별도 SPM 패키지로 뺐습니다. 모듈 경계가 곧 컴파일 유닛이라 레이어를 위반하면 빌드가 깨집니다. 그 위에 Uber RIBs로 화면 트리와 의존성 주입을 잡았어요. RIBs는 별도 DI 컨테이너 없이 Builder 생성자 주입으로 의존성 그래프를 컴파일 타임에 강제하는 방식이라, 누락되면 역시 빌드가 실패합니다.

화면 내부 상태는 ReactorKit으로 단방향으로 흐르게 했습니다. 재미있는 게, RIBs의 Interactor가 곧 ReactorKit의 Reactor 역할을 겸하도록 파일 템플릿에 박제해서, 20개가 넘는 화면이 Action → Mutation → State 단방향 파이프라인으로 완전히 일관됩니다. 상태 변경 지점이 순수 함수 한 곳으로 강제되니까, 화면이 아무리 복잡해도 데이터 흐름을 추적할 수 있습니다.

네트워크는 async/await로 현대화하되, 앱 전체가 Rx 계약 위에 서 있어서 async를 다시 Rx로 브릿지하는 의도적 하이브리드를 택했습니다. async는 구현 디테일, Rx는 아키텍처 계약으로 역할을 나눈 거죠.

저는 이 구조 안에서 편도 렌탈·이동 배차 피처를 만들고, 딥링크 라우팅과 애널리틱스 배선을 담당했습니다. 규모가 커도 규칙으로 복잡도를 억제하는 코드베이스에서 일한 경험이 저한테는 가장 큰 자산입니다."

### 변형 C2 — 임팩트 강조

"제가 만든 건 전국 단위 카셰어링 앱의 iOS 클라이언트입니다. 사용자 입장에서 보면, 앱으로 차를 예약하고, 차 앞에 가서 스마트폰으로 문을 열고, 타고 다니다가, 반납하고 정산까지 끝내는 — 실물 자동차와 돈이 실시간으로 걸린 서비스입니다.

이 앱이 특별한 이유는, 소프트웨어가 물리 세계와 직접 결합돼 있다는 점입니다. 대표적인 게 디지털 카키예요. 앱이 BLE로 차량과 직접 암호화 통신을 해서 문을 여닫습니다. 여기서 버그가 나면 그냥 화면이 깨지는 게 아니라, 사용자가 차 앞에서 문을 못 여는 현장 장애가 됩니다. 그래서 재시도·재연결·타임아웃 처리, 그리고 서버 원격제어라는 2차 경로까지 두껍게 방어해야 했습니다. 오류 허용치가 극도로 낮은 도메인이죠.

두 번째는 비즈니스 라인이 한 앱에 다 들어있다는 겁니다. 단기 렌탈, 편도 렌탈, 편도 특가, 이동 배차, 구독 패스, 기업 고객, 비로그인 게스트까지 — 각기 예약부터 정산까지 흐름이 다른 라인들이 한 앱에 공존합니다. 그러다 보니 도메인이 폭증하는데, 이걸 모듈 50개로 쪼개서 관리했습니다.

세 번째는 진입 경로 폭발입니다. 어트리뷰션 SDK, 푸시, 유니버설 링크, 소셜 로그인, 웹뷰 — 5개 채널이 100개가 넘는 화면으로 수렴하는 딥링크 상태머신을 다뤘습니다. 목적지 enum만 120개가 넘어요.

저는 이 안에서 편도 특가 기능과 이동 배차, 비로그인 프로모션, 딥링크 라우팅, 애널리틱스 정합성을 담당하면서 QA 티켓 기반으로 실사용자 회귀를 잡았습니다. 규모 있는 프로덕트에서 실제 사용자 임팩트에 직결되는 부분을 책임졌다는 게 제 경험의 핵심입니다."

---

## (d) 영어 1분 — 외국계/글로벌 테크용

"I built the iOS app for a nationwide car-sharing service. Users reserve a car, unlock it with their phone as a digital key, drive, return it, and settle payment — all in one app.

In terms of scale, it's a large SPM multi-module monorepo: around 50 local modules, roughly 1,900 Swift files, about 320,000 lines of code, and over 100 screens. It's a long-lived product with a double-digit team and around 7,000 commits.

Architecturally, it's Clean Architecture with four layers — Domain, UseCase, Repository, and Presentation — each split into its own SPM package, so a layer violation breaks the build. On top of that we use Uber's RIBs for the screen tree and dependency injection, with no separate DI container — dependencies are constructor-injected and enforced at compile time. Screen-level state runs on ReactorKit with a strict unidirectional Action-to-State flow, and RxSwift is the reactive backbone across the whole app.

The hardest part technically was the digital car key — the app talks to the vehicle hardware directly over BLE with a custom, AES-encrypted packet protocol. A bug there isn't a UI glitch; it means a user standing in front of a car that won't unlock, so the fault tolerance had to be very low.

My own work focused on the one-way rental and dispatch features, the deep-link routing where five different entry channels converge onto over a hundred screens, and analytics correctness. What I value most from this project is shipping inside a large, strictly-architected codebase where the structure itself keeps complexity under control."

---

## 톤/전달 팁 (본인용 메모)

- 15초 3개는 청중에 맞춰 선택: 규모(A1) / 기술난도(A2) / 아키텍처(A3).
- 숫자는 "50개 모듈, 화면 100개+, 32만 줄" 세트만 확실히 외우면 됨. 나머지는 근사치.
- "차 문이 안 열리는 현장 장애" — 이 한 문장이 도메인 난도를 각인시키는 킬러라인. 어디서든 활용.
- 아키텍처 버전에서 "레이어 위반하면 빌드가 깨진다" = 규칙을 코드로 강제했다는 성숙도 신호.
- 임팩트 버전에서 "물리 세계와 결합" 3박자(디지털키 / 비즈라인 / 딥링크)를 순서대로.
- 영어 버전은 천천히, 숫자에서 한 박자 쉬기.
