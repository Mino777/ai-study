/* ═══════════════════════════════════════════════════════════ */
/*  INTERVIEW FLASH CARDS                                      */
/* ═══════════════════════════════════════════════════════════ */

export interface InterviewQuestion {
  id: string;
  topic: string;
  question: string;
  answer: string;
  phase: number;
}

/* ── iOS Track ───────────────────────────────────────────── */

export const IOS_QUESTIONS: InterviewQuestion[] = [
  // ── Swift 기초 (Phase 1) ──
  { id: "ios-1", topic: "Swift 기초", phase: 1, question: "struct와 class의 차이는?", answer: "struct는 값 타입(복사), class는 참조 타입(공유). struct는 상속 불가, class는 가능. struct는 스택, class는 힙 할당. Swift 표준 라이브러리의 대부분(String, Array, Dictionary)이 struct." },
  { id: "ios-2", topic: "Swift 기초", phase: 1, question: "Optional이란? 왜 필요한가?", answer: "값이 있을 수도 없을 수도 있는 타입. nil safety를 컴파일 타임에 보장. Optional Binding(if let, guard let), Optional Chaining(?.), Nil Coalescing(??)으로 안전하게 처리. 강제 언래핑(!)은 크래시 위험." },
  { id: "ios-3", topic: "Swift 기초", phase: 1, question: "프로토콜(Protocol)이란?", answer: "메서드/프로퍼티의 청사진(인터페이스). 다중 채택 가능. 프로토콜 확장(extension)으로 기본 구현 제공. POP(Protocol-Oriented Programming)는 Swift의 핵심 패러다임. Equatable, Hashable, Codable 등이 대표적." },
  { id: "ios-4", topic: "Swift 기초", phase: 1, question: "클로저(Closure)란? 캡처 리스트는?", answer: "이름 없는 함수. 주변 컨텍스트의 변수를 캡처(참조)할 수 있음. 캡처 리스트 [weak self], [unowned self]로 순환 참조 방지. @escaping은 함수 스코프 이후 실행되는 클로저. 후행 클로저(trailing closure) 문법 지원." },
  { id: "ios-5", topic: "Swift 기초", phase: 1, question: "제네릭(Generics)이란?", answer: "타입에 독립적인 코드 작성. Array<Element>, Result<Success, Failure> 등. where 절로 제약 조건 추가. associated type으로 프로토콜에서 사용. 코드 재사용성과 타입 안전성을 동시에 달성." },

  // ── 메모리 관리 (Phase 1-2) ──
  { id: "ios-6", topic: "메모리 관리", phase: 1, question: "ARC(Automatic Reference Counting)란?", answer: "컴파일 타임에 retain/release를 자동 삽입하여 메모리 관리. 참조 카운트가 0이 되면 해제. GC(Garbage Collection)와 달리 런타임 오버헤드 없음. 단, 순환 참조(Retain Cycle)는 자동으로 해결 못 함." },
  { id: "ios-7", topic: "메모리 관리", phase: 1, question: "strong, weak, unowned 차이는?", answer: "strong: 참조 카운트 +1 (기본값). weak: 카운트 증가 안 함, nil 가능(Optional). unowned: 카운트 증가 안 함, nil 불가(Non-Optional) — 해제된 후 접근 시 크래시. delegate 패턴에서 weak 사용이 일반적." },
  { id: "ios-8", topic: "메모리 관리", phase: 2, question: "순환 참조(Retain Cycle) 예시와 해결법?", answer: "두 객체가 서로 strong 참조하면 영원히 해제 안 됨. 대표적: 클로저에서 self 캡처, delegate 패턴. 해결: [weak self] 캡처 리스트, delegate를 weak으로 선언. Instruments의 Leaks/Allocations으로 탐지." },
  { id: "ios-9", topic: "메모리 관리", phase: 2, question: "메모리 구조: 스택 vs 힙?", answer: "스택: 값 타입(struct, enum), 빠름, LIFO, 스레드별 독립. 힙: 참조 타입(class), 느림, ARC로 관리, 스레드 간 공유. 값 타입이 참조 타입을 포함하면 힙에 할당될 수 있음(Copy-on-Write)." },

  // ── 동시성 (Phase 2) ──
  { id: "ios-10", topic: "동시성", phase: 2, question: "GCD(Grand Central Dispatch)란?", answer: "C 기반 동시성 라이브러리. DispatchQueue로 작업을 큐에 제출. main(UI), global(백그라운드), custom 큐. sync(동기, 현재 스레드 블로킹), async(비동기, 다른 스레드)로 작업 실행. QoS로 우선순위 지정." },
  { id: "ios-11", topic: "동시성", phase: 2, question: "async/await와 Actor란?", answer: "Swift 5.5+. async: 비동기 함수 선언. await: 비동기 결과 대기. Task로 비동기 컨텍스트 생성. Actor: 데이터 레이스 방지를 위한 참조 타입. @MainActor: UI 업데이트 보장. Sendable: 스레드 간 안전한 전달." },
  { id: "ios-12", topic: "동시성", phase: 2, question: "Race Condition이란? 방지법?", answer: "여러 스레드가 동시에 같은 자원에 접근하여 예측 불가한 결과 발생. 방지: Serial Queue, NSLock, DispatchSemaphore, Actor(Swift Concurrency). @Sendable 프로토콜로 컴파일 타임 검증." },

  // ── 아키텍처 (Phase 2) ──
  { id: "ios-13", topic: "아키텍처", phase: 2, question: "MVC, MVVM, VIPER 비교?", answer: "MVC: Model-View-Controller. 간단하지만 Controller 비대화(Massive VC). MVVM: Model-View-ViewModel. 데이터 바인딩으로 뷰 로직 분리. VIPER: View-Interactor-Presenter-Entity-Router. 가장 세분화, 테스트 용이. 프로젝트 규모에 따라 선택." },
  { id: "ios-14", topic: "아키텍처", phase: 2, question: "Clean Architecture란?", answer: "의존성 규칙: 바깥 → 안쪽으로만 의존. Domain(Entity, UseCase) → Data(Repository 구현) → Presentation(ViewModel, View). 프레임워크 독립적. 테스트 용이. iOS에서는 보통 MVVM + Clean Architecture 조합." },
  { id: "ios-15", topic: "아키텍처", phase: 2, question: "의존성 주입(DI)이란?", answer: "객체가 직접 의존성을 생성하지 않고 외부에서 주입받는 패턴. 생성자 주입, 프로퍼티 주입, 메서드 주입. 테스트 시 Mock 객체 주입 용이. Swinject, Factory 등 DI 프레임워크 활용. 프로토콜 기반 추상화와 함께 사용." },

  // ── UIKit / SwiftUI (Phase 2-3) ──
  { id: "ios-16", topic: "UIKit", phase: 2, question: "UITableView 셀 재사용 메커니즘?", answer: "dequeueReusableCell로 화면 밖 셀 재활용 → 메모리 효율. prepareForReuse()에서 셀 초기화. register로 셀 클래스/nib 등록. estimatedRowHeight + UITableViewAutomaticDimension으로 동적 높이. Prefetching API로 부드러운 스크롤." },
  { id: "ios-17", topic: "UIKit", phase: 2, question: "오토레이아웃(Auto Layout)이란?", answer: "제약 조건(Constraint) 기반 레이아웃 시스템. Intrinsic Content Size: 컨텐츠에 따른 자연 크기. Content Hugging: 늘어남 저항. Compression Resistance: 줄어듦 저항. Ambiguous Layout: 제약 부족, Conflict: 제약 충돌." },
  { id: "ios-18", topic: "SwiftUI", phase: 2, question: "SwiftUI의 View가 struct인 이유?", answer: "값 타입이므로 변경 시 새 인스턴스 생성 → 변경 감지 용이. body 프로퍼티가 재계산되면 diff로 변경된 부분만 업데이트. @State, @Binding, @ObservedObject, @EnvironmentObject로 상태 관리. 선언적 UI." },

  // ── 네트워킹 / 데이터 (Phase 2-3) ──
  { id: "ios-19", topic: "네트워킹", phase: 2, question: "URLSession이란?", answer: "Apple의 HTTP 네트워킹 API. URLSessionConfiguration(default, ephemeral, background). URLSessionTask(data, upload, download). Codable로 JSON 직렬화/역직렬화. Combine/async-await 연동. 인증서 핀닝, 캐시 정책 설정." },
  { id: "ios-20", topic: "네트워킹", phase: 3, question: "이미지 캐싱 전략?", answer: "NSCache(메모리): 자동 퇴거, 스레드 안전. FileManager(디스크): 영구 저장. URL 해시를 키로 사용. 메모리 캐시 → 디스크 캐시 → 네트워크 순 조회. Kingfisher/SDWebImage가 이 패턴 구현. ETag/Last-Modified로 서버 검증." },

  // ── 앱 라이프사이클 (Phase 1-2) ──
  { id: "ios-21", topic: "앱 라이프사이클", phase: 1, question: "iOS 앱 라이프사이클 상태 5가지?", answer: "Not Running → Inactive(포그라운드, 이벤트 미수신) → Active(포그라운드, 이벤트 수신) → Background(백그라운드 실행) → Suspended(메모리에 있지만 실행 안 함). SceneDelegate(iOS 13+)에서 scene 단위 관리." },
  { id: "ios-22", topic: "앱 라이프사이클", phase: 1, question: "didFinishLaunchingWithOptions에서 하면 안 되는 것?", answer: "무거운 동기 작업(네트워크, DB 마이그레이션). 앱 시작 시간이 너무 길면(20초+) 시스템이 강제 종료. 비동기로 처리하거나 lazy 로딩. Launch Screen 동안 최소한의 초기화만." },

  // ── 테스팅 (Phase 3) ──
  { id: "ios-23", topic: "테스팅", phase: 3, question: "Unit Test vs UI Test?", answer: "Unit Test: 개별 함수/클래스 테스트. XCTest 프레임워크. Mock/Stub으로 의존성 격리. 빠르고 자주 실행. UI Test: XCUIApplication으로 앱 전체 동작 테스트. 사용자 시나리오 검증. 느리지만 통합 검증." },
  { id: "ios-24", topic: "테스팅", phase: 3, question: "TDD(Test-Driven Development)란?", answer: "Red-Green-Refactor 사이클. 1) 실패하는 테스트 작성(Red) 2) 테스트 통과하는 최소 코드(Green) 3) 코드 개선(Refactor). 요구사항을 테스트로 명확히. 회귀 방지. iOS에서는 ViewModel 로직에 적합." },

  // ── 보안 (Phase 3) ──
  { id: "ios-25", topic: "보안", phase: 3, question: "Keychain이란?", answer: "iOS 보안 저장소. AES 암호화. 앱 삭제해도 유지(옵션). 비밀번호, 토큰, 인증서 저장에 적합. UserDefaults와 달리 암호화됨. kSecAttrAccessible로 접근 제어. 앱 그룹으로 앱 간 공유 가능." },

  // ── 시스템 디자인 (Phase 3) ──
  { id: "ios-26", topic: "시스템 디자인", phase: 3, question: "소셜 피드 앱 설계?", answer: "아키텍처: MVVM + Repository. 네트워크: 페이지네이션(cursor-based). 캐싱: 메모리(NSCache) + 디스크(CoreData/Realm). 이미지: 썸네일 프리로딩 + 풀사이즈 lazy load. 오프라인: 로컬 DB 우선, 네트워크 동기화. 성능: 셀 높이 캐싱, prefetching." },
  { id: "ios-27", topic: "시스템 디자인", phase: 3, question: "채팅 앱 설계?", answer: "실시간: WebSocket/SSE로 양방향 통신. 메시지 저장: CoreData/Realm 로컬 + 서버 동기화. 읽음 처리: 마지막 읽은 messageId 추적. 미디어: 백그라운드 업로드 + 프로그레스. 푸시: APNs + Silent Push로 백그라운드 동기화. 페이지네이션: 과거 메시지 역순 로딩." },

  // ── RxSwift / Combine (Phase 2) ──
  { id: "ios-28", topic: "반응형", phase: 2, question: "RxSwift vs Combine?", answer: "공통: 반응형 프로그래밍, Publisher/Observer 패턴. RxSwift: 서드파티, iOS 9+, 광범위한 연산자. Combine: Apple 공식, iOS 13+, SwiftUI 통합. 마이그레이션: Observable→Publisher, subscribe→sink, disposeBag→cancellables." },

  // ── 성능 (Phase 3) ──
  { id: "ios-29", topic: "성능", phase: 3, question: "앱 성능 최적화 방법?", answer: "Instruments: Time Profiler(CPU), Allocations(메모리), Leaks(메모리 누수). 이미지: 적절한 크기로 다운샘플링. 레이아웃: 복잡한 뷰 계층 최소화. 스레딩: 무거운 작업 백그라운드. 캐싱: 반복 계산/네트워크 결과. 지연 로딩: 필요할 때만 초기화." },
  { id: "ios-30", topic: "성능", phase: 3, question: "앱 크기 줄이는 방법?", answer: "Asset Catalog: App Thinning(Slicing, Bitcode, On-Demand Resources). 이미지: WebP/HEIC 포맷, 벡터 PDF. 코드: Dead Code Stripping, unused import 제거. 라이브러리: 필요한 모듈만 포함(SPM). Bitcode: Apple이 디바이스별 최적화." },
];

/* ── FDE Track ───────────────────────────────────────────── */

export const FDE_QUESTIONS: InterviewQuestion[] = [
  { id: "fde-1", topic: "문제 해결", phase: 1, question: "고객이 '시스템이 느리다'고 할 때 어떻게 접근?", answer: "1) 정의: '느리다'의 기준 수치화 (현재 응답 시간 vs 기대치). 2) 측정: APM(Application Performance Monitoring) 도구로 병목 식별. 3) 분류: 네트워크 / DB 쿼리 / 연산 / 렌더링 중 어디인지. 4) 해결: 가장 임팩트 큰 병목부터. 5) 검증: 개선 전후 수치 비교. 6) 문서화: 재발 방지." },
  { id: "fde-2", topic: "문제 해결", phase: 1, question: "기술적으로 불가능한 요청을 받았을 때?", answer: "1) 왜 그 기능이 필요한지 비즈니스 맥락 이해. 2) 기술적 제약 비전문가 언어로 설명. 3) 대안 제시 (80% 효과를 20% 비용으로). 4) 트레이드오프 명시. 절대 '안 됩니다'로 끝내지 않음. 항상 '대신 이렇게 하면...'으로." },
  { id: "fde-3", topic: "데이터", phase: 1, question: "SQL: JOIN 종류와 사용 시점?", answer: "INNER JOIN: 양쪽 다 있는 것만. LEFT JOIN: 왼쪽 전체 + 오른쪽 매칭(없으면 NULL). RIGHT JOIN: 반대. FULL OUTER: 양쪽 전체. CROSS: 카르테시안 곱. 실무: LEFT JOIN이 가장 빈번 (고객 목록 + 주문 정보 등)." },
  { id: "fde-4", topic: "데이터", phase: 2, question: "ETL 파이프라인이란?", answer: "Extract(추출): 소스 시스템에서 데이터 수집. Transform(변환): 정제, 표준화, 집계. Load(적재): 데이터 웨어하우스/레이크에 저장. 도구: Apache Airflow, dbt, Google Dataflow. 실시간 vs 배치 처리. 데이터 품질 검증이 핵심." },
  { id: "fde-5", topic: "시스템 설계", phase: 2, question: "마이크로서비스 vs 모놀리식?", answer: "모놀리식: 하나의 코드베이스, 배포 단위. 장점: 단순, 디버깅 용이. 마이크로서비스: 독립 서비스들의 조합. 장점: 독립 배포, 기술 스택 자유, 확장성. 단점: 네트워크 복잡성, 분산 트랜잭션. FDE 관점: 고객사 규모에 따라 제안이 달라야 함." },
  { id: "fde-6", topic: "시스템 설계", phase: 2, question: "REST API 설계 원칙?", answer: "리소스 중심 URL (/users, /orders). HTTP 메서드: GET(조회), POST(생성), PUT(전체 수정), PATCH(부분 수정), DELETE. 상태 코드: 2xx(성공), 4xx(클라이언트 에러), 5xx(서버 에러). 버전닝: /v1/. 페이지네이션. HATEOAS(선택)." },
  { id: "fde-7", topic: "AI/LLM", phase: 2, question: "LLM 환각(Hallucination) 대응법?", answer: "1) RAG(Retrieval-Augmented Generation): 외부 데이터 소스로 근거 제공. 2) 출력 검증: 구조화된 출력(JSON) + 스키마 검증. 3) Temperature 낮추기. 4) 프롬프트에 '모르면 모른다고 답해라' 명시. 5) Human-in-the-loop: 중요 결정은 사람 확인." },
  { id: "fde-8", topic: "AI/LLM", phase: 3, question: "Harness Engineering이란?", answer: "AI가 안전하게 달릴 울타리를 만드는 것. 입력 검증(타입/범위/null), 출력 검증(모순 탐지), 폴백(다른 모델로 전환), 자동 채점(LLM-as-a-Judge). 프롬프트만으로는 품질 보장 불가 → 구조적 안전망 필수. Mino의 MoneyFlow/Aidy에서 실증." },
  { id: "fde-9", topic: "커뮤니케이션", phase: 3, question: "기술 내용을 비개발자에게 설명하는 법?", answer: "1) 비유 활용: 'API는 식당 메뉴판' 2) 숫자로 말하기: '응답 시간 3초 → 0.5초로 개선' 3) 임팩트 중심: 기술이 아닌 비즈니스 결과 강조 4) 시각화: 다이어그램, 데모 5) 용어 줄이기: 전문 용어 대신 일상어. 핵심: 상대방이 아는 것에서 시작." },
  { id: "fde-10", topic: "커뮤니케이션", phase: 3, question: "프로젝트 스코프가 계속 확장될 때?", answer: "1) 현재 스코프 문서화 (합의된 것 vs 추가 요청). 2) 추가 요청의 비용(시간/인력) 정량화. 3) 우선순위 매트릭스: 임팩트 vs 노력. 4) 'Yes, and...' 프레임: '가능합니다. 단, X를 미루면 됩니다.' 5) MVP 제안: 핵심 기능 먼저 → 반복 개선." },
];

/* ═══════════════════════════════════════════════════════════ */
/*  DAILY CODING PROBLEMS                                      */
/* ═══════════════════════════════════════════════════════════ */

export interface DailyProblem {
  title: string;
  platform: "프로그래머스" | "백준" | "LeetCode";
  url: string;
  difficulty: string;
  topic: string;
}

/** Phase별 추천 문제 (각 Phase에서 순환 사용) */
/* ═══════════════════════════════════════════════════════════ */
/*  COMPANY-SPECIFIC STRATEGY                                  */
/* ═══════════════════════════════════════════════════════════ */

export interface CompanyStrategy {
  name: string;
  color: string;
  process: string[];
  codingTest: string;
  keyTip: string;
  failReason: string;
}

export const COMPANY_STRATEGIES: Record<string, CompanyStrategy[]> = {
  ios: [
    {
      name: "토스", color: "#3b82f6",
      process: ["서류", "과제전형", "기술면접 (과제 코드 리뷰)", "문화면접", "최종"],
      codingTest: "코딩테스트 없음. 과제전형으로 대체. GitHub PR 형식 검토.",
      keyTip: "과제 코드의 '왜 이렇게 했는지' 설명 준비가 핵심. 문화면접에서 깊이 있는 자기반성 필수.",
      failReason: "문화면접 탈락이 가장 많음. 얕은 답변 = 자동 탈락.",
    },
    {
      name: "당근", color: "#ff6f00",
      process: ["5일 과제", "기술면접 (2:1)", "컬쳐핏"],
      codingTest: "알고리즘 코딩테스트 없음. 실무 과제 5일 기한.",
      keyTip: "과제 제출 후 '신경 쓴 부분/아쉬운 점' 정리 필수. 면접관이 힌트 주는 협력적 분위기.",
      failReason: "과제 구현 부실 + 기술 선택 설명 못 함.",
    },
    {
      name: "카카오", color: "#fee500",
      process: ["코딩테스트 (5h 7문제)", "기술면접 2회", "인성면접"],
      codingTest: "5시간 7문제. 4솔 이상이 안전. 효율성 테스트 포함. 문제별 배점 다름.",
      keyTip: "5시간 체력 관리가 합격의 절반. 쉬운 문제부터 빠르게 확보 후 어려운 문제 도전.",
      failReason: "3솔 이하 + 서류 부족 = 자동 탈락.",
    },
    {
      name: "네이버", color: "#03c75a",
      process: ["코딩테스트 (2h 3문제)", "기술면접", "인성면접", "컬쳐핏검사"],
      codingTest: "2시간 3문제. 2/3 해결 이상. 난이도 높음 (Silver 상위~Gold).",
      keyTip: "창의적 사고 + 복합 알고리즘 요구. 부분 점수 전략 유효.",
      failReason: "1/3만 풀고 문화면접 진출해도 최종 탈락 확률 높음.",
    },
    {
      name: "쿠팡", color: "#e4002b",
      process: ["코딩테스트 (1h 3문제)", "기술면접 3회 (라이브 코딩)", "시스템디자인"],
      codingTest: "1시간 3문제. 평이한 난이도. HackerRank 플랫폼.",
      keyTip: "라이브 코딩 3회 반복 연습 필수. 면접 피드백 제공 (타사 대비 장점).",
      failReason: "라이브 코딩에서 생각을 말로 설명 못 함.",
    },
  ],
  fde: [
    {
      name: "채널톡", color: "#3b82f6",
      process: ["서류", "과제/포트폴리오", "기술면접", "문화면접"],
      codingTest: "코딩테스트 대신 과제전형. 고객 문제 해결 시나리오 중심.",
      keyTip: "FDE 역할 이해 + 고객 커뮤니케이션 경험 강조. 비즈니스 임팩트 수치화.",
      failReason: "기술만 강조하고 비즈니스 관점 부족.",
    },
    {
      name: "마키나락스", color: "#10b981",
      process: ["서류", "기술면접", "과제전형", "최종면접"],
      codingTest: "Python/SQL 기반. 데이터 파이프라인 + AI 통합 역량 검증.",
      keyTip: "제조/국방 도메인 이해 + AI 실장 경험. Harness Engineering 패턴 어필.",
      failReason: "도메인 이해 없이 순수 기술만으로 접근.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  HIRING INSIGHTS (합격 전략)                                */
/* ═══════════════════════════════════════════════════════════ */

export const HIRING_INSIGHTS = {
  portfolio: [
    { rule: "프로젝트 2-3개만, 깊게", detail: "다수의 얕은 프로젝트 < 2-3개 깊은 프로젝트. ai-study + Aidy + MoneyFlow면 충분." },
    { rule: "정량적 임팩트 필수", detail: "'608건 티켓 처리', '크래시 8건 사전 차단', '컴파일 타임 100% 차단' — 숫자가 면접관의 질문을 만든다." },
    { rule: "트러블슈팅 섹션이 합격을 가른다", detail: "문제 → 시도한 것들 → 최종 해결 → 배운 점. 이 섹션이 있으면 합격률 대폭 상승." },
  ],
  experienced: [
    { rule: "기술 깊이 > 범위", detail: "3-4년차는 '많이 아는 것'이 아니라 '하나를 깊이 아는 것'이 차별화." },
    { rule: "기술 의사결정 설명 능력", detail: "'왜 RIBs를 선택했나?' '왜 Clean Architecture인가?' 트레이드오프 설명 준비." },
    { rule: "팀 영향력 정량화", detail: "코드 리뷰 문화 도입, CI/CD 구축, 온보딩 문서화 등 팀 레벨 기여." },
  ],
  commonFails: [
    "포트폴리오에 '왜/어떻게/성과' 없이 기능 나열만",
    "코딩테스트 커트라인 미달 (카카오 4솔, 네이버 2/3)",
    "문화면접에서 깊이 없는 답변 (특히 토스)",
    "과제전형 후 '기술 선택 이유' 설명 못 함 (당근, 토스)",
    "라이브 코딩에서 침묵 10초+ (Think-Aloud 미연습)",
  ],
};

export const PHASE_PROBLEMS: Record<number, DailyProblem[]> = {
  1: [
    { title: "두 수의 합", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/120803", difficulty: "Lv.0", topic: "기초" },
    { title: "Valid Parentheses", platform: "LeetCode", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", topic: "스택" },
    { title: "스택/큐 — 같은 숫자는 싫어", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/12906", difficulty: "Lv.1", topic: "스택" },
    { title: "해시 — 완주하지 못한 선수", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42576", difficulty: "Lv.1", topic: "해시" },
    { title: "해시 — 전화번호 목록", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42577", difficulty: "Lv.2", topic: "해시" },
    { title: "정렬 — K번째수", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42748", difficulty: "Lv.1", topic: "정렬" },
    { title: "정렬 — 가장 큰 수", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42746", difficulty: "Lv.2", topic: "정렬" },
    { title: "DFS/BFS — 타겟 넘버", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/43165", difficulty: "Lv.2", topic: "DFS" },
    { title: "DFS/BFS — 게임 맵 최단거리", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/1844", difficulty: "Lv.2", topic: "BFS" },
    { title: "이분탐색 — 입국심사", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/43238", difficulty: "Lv.3", topic: "이분탐색" },
  ],
  2: [
    { title: "DP — N으로 표현", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42895", difficulty: "Lv.3", topic: "DP" },
    { title: "DP — 정수 삼각형", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/43105", difficulty: "Lv.3", topic: "DP" },
    { title: "DP — 등굣길", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42898", difficulty: "Lv.3", topic: "DP" },
    { title: "탐욕법 — 구명보트", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42885", difficulty: "Lv.2", topic: "탐욕" },
    { title: "탐욕법 — 섬 연결하기", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42861", difficulty: "Lv.3", topic: "탐욕" },
    { title: "투포인터 — Container With Most Water", platform: "LeetCode", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", topic: "투포인터" },
    { title: "슬라이딩 윈도우 — Minimum Window Substring", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", topic: "슬라이딩윈도우" },
    { title: "그래프 — 가장 먼 노드", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/49189", difficulty: "Lv.3", topic: "그래프" },
    { title: "Two Sum", platform: "LeetCode", url: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", topic: "해시" },
    { title: "LRU Cache", platform: "LeetCode", url: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium", topic: "디자인" },
  ],
  3: [
    { title: "디스크 컨트롤러", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/42627", difficulty: "Lv.3", topic: "힙" },
    { title: "단어 변환", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/43163", difficulty: "Lv.3", topic: "BFS" },
    { title: "여행경로", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/43164", difficulty: "Lv.3", topic: "DFS" },
    { title: "Best Time to Buy and Sell Stock", platform: "LeetCode", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", topic: "DP" },
    { title: "Merge Intervals", platform: "LeetCode", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", topic: "구간" },
  ],
  4: [
    { title: "카카오 2023 — 개인정보 수집 유효기간", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/150370", difficulty: "Lv.1", topic: "기출" },
    { title: "카카오 2023 — 이모티콘 할인행사", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/150368", difficulty: "Lv.2", topic: "기출" },
    { title: "카카오 2023 — 미로 탈출 명령어", platform: "프로그래머스", url: "https://school.programmers.co.kr/learn/courses/30/lessons/150365", difficulty: "Lv.3", topic: "기출" },
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  FULL PROCESS GUIDE (5단계 전형 완전 가이드)                 */
/* ═══════════════════════════════════════════════════════════ */

export interface ProcessStage {
  id: string;
  step: number;
  title: string;
  icon: string;
  color: string;
  timeline: string;
  overview: string;
  checklist: string[];
  tips: string[];
  pitfalls: string[];
}

export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: "resume", step: 1, title: "서류 전형", icon: "01", color: "#3b82f6",
    timeline: "지원 2주 전부터 준비",
    overview: "이력서 + GitHub + 기술블로그가 면접관의 첫인상. 경력직은 '얼마나 많이 아는가'가 아니라 '얼마나 깊이 해결했는가'로 판단.",
    checklist: [
      "이력서: 모든 경력에 정량적 성과 포함 (608건 티켓, 크래시 8건 차단 등)",
      "GitHub: 핀 프로젝트 3개 + README(설치법/스크린샷/아키텍처)",
      "기술블로그: 최근 3개월 내 문제해결 글 2-3편 (ai-study 위키 활용)",
      "포트폴리오: ai-study + Aidy + MoneyFlow — 각 프로젝트별 트러블슈팅 섹션",
      "자기소개서: '왜 이 회사' → 구체적 계기 + 나의 경험 연결 + 입사 후 기여",
    ],
    tips: [
      "프로젝트 설명에 Harness/Context/Compound 3가지 방법론을 자연스럽게 녹여라 — 차별화 무기",
      "이력서 모든 항목을 1문장으로 설명하는 연습. 면접에서 반드시 물어본다",
      "회사 기술블로그 최소 5편 읽고, 공감하는 글 1편을 지원동기에 언급",
    ],
    pitfalls: [
      "기능 나열만 하고 '왜/어떻게/성과' 없음 → 자동 탈락",
      "'안정적이라서' '공부하고 싶어서' 같은 일반적 지원동기",
      "GitHub에 최근 6개월 커밋이 없으면 성장 의지 의심",
    ],
  },
  {
    id: "assignment", step: 2, title: "사전과제", icon: "02", color: "#8b5cf6",
    timeline: "과제 수령 후 3-7일",
    overview: "코딩테스트를 대체하는 추세. 완벽한 구현보다 '의도를 설명할 수 있는 80% 완성'이 합격. AI 도구 활용은 이제 기본이지만, 설명 못 하면 커닝 취급.",
    checklist: [
      "Day 1: 요구사항 분석 + 더미 데이터로 프로토타입 (2-3h)",
      "Day 2-3: 핵심 기능 구현 — 80% 완성 목표 (8h)",
      "Day 4: 엣지 케이스 + 테스트 코드 (4h)",
      "Day 5: 리팩토링 3h + README 작성 3h — README가 합격을 가른다",
      "PR 작성: 변경 요약 + 스크린샷 + 기술 선택 이유 + 구현 못 한 부분과 이유",
      "커밋: 기능 단위 원자적 커밋 (feat/fix/refactor 접두어)",
    ],
    tips: [
      "AI 도구(Cursor, Claude) 활용은 OK. 단, '왜 이렇게 했는지' 설명 준비 필수",
      "'구현 못 한 부분 + 이유'를 README에 명시하면 점수 UP — 자기 한계를 아는 개발자",
      "토스: 시간 내 완성도 > 코드 품질. 당근: 과제 복기 + 신경 쓴 부분 토론 준비",
      "테스트 코드가 있으면 확실한 가산점. 최소 핵심 로직 Unit Test 3-5개",
    ],
    pitfalls: [
      "완벽 추구하다 시간 초과 → 미완성 제출이 최악",
      "AI가 생성한 코드를 그대로 제출 + 면접에서 설명 못 함",
      "README 없이 코드만 제출 — 의도를 읽을 수 없음",
      "커밋 1개에 모든 변경사항 — 프로세스를 보여줄 수 없음",
    ],
  },
  {
    id: "coding-test", step: 3, title: "코딩테스트", icon: "03", color: "#10b981",
    timeline: "Phase 1-2에서 집중 준비 (Day 1-60)",
    overview: "카카오 5시간 7문제, 네이버 2시간 3문제, 쿠팡 1시간 3문제. 토스/당근은 코테 없음. 회사별로 완전히 다르니 타겟 회사에 맞춰 준비.",
    checklist: [
      "프로그래머스 Lv.2 안정적 풀이 (Phase 1 목표, Day 30)",
      "프로그래머스 Lv.3 도전 + 카카오/네이버 기출 (Phase 2, Day 60)",
      "14 알고리즘 패턴 중 10개 이상 마스터",
      "카카오 지원 시: 5시간 체력 관리 + 4솔 이상 목표",
      "네이버 지원 시: 2시간 3문제 중 2/3 이상 목표",
      "쿠팡 지원 시: HackerRank 환경 익숙해지기",
    ],
    tips: [
      "쉬운 문제부터 빠르게 확보 → 어려운 문제 도전 (카카오 전략)",
      "부분 점수가 있다면 brute force라도 제출 (0점보다 나음)",
      "효율성 테스트 실패해도 정확성만 통과하면 부분 점수",
      "시험 전날: 쉬운 문제 1개만 풀고 일찍 자기 (수면 > 벼락치기)",
    ],
    pitfalls: [
      "어려운 문제에 매달려서 쉬운 문제 놓침",
      "IDE 자동완성에 의존하다 실전 환경(프로그래머스)에서 당황",
      "시간 배분 실패 — 5시간 시험에서 1문제에 2시간 소비",
    ],
  },
  {
    id: "tech-interview", step: 4, title: "기술면접", icon: "04", color: "#f59e0b",
    timeline: "Phase 3에서 집중 준비 (Day 61-85)",
    overview: "이력서/과제 기반 질문 + 라이브 코딩 + 시스템 디자인. 핵심은 Think-Aloud — 침묵 10초 이상은 감점. 모르면 모른다고 말하되, 접근법을 보여줘라.",
    checklist: [
      "이력서 모든 항목 1문장 설명 연습 (녹음 + 피드백)",
      "과제 코드 전체 복기 — '왜 이 구조를 선택했는지' 답변 준비",
      "iOS 플래시카드 30장 전체 reviewed",
      "시스템 디자인 3가지: 소셜 피드, 채팅, 이미지 캐싱",
      "라이브 코딩 Think-Aloud 연습 5회 이상 (녹음 필수)",
      "역질문 3개 준비: 기술 문화 / 팀 과제 / 성장 경로",
    ],
    tips: [
      "Think-Aloud 5단계: 문제 이해(2분) → 접근법 제시(2분) → 코딩(설명하며) → 테스트 → 개선",
      "모르는 문제: '일단 brute force부터 시작합니다' → 면접관 힌트 수용 → 개선",
      "시스템 디자인: 요구사항 정리(5분) → 컴포넌트 설계(10분) → 트레이드오프 논의(10분)",
      "역질문은 면접관의 인상을 결정. '이 팀의 현재 가장 큰 기술 과제는?' 같은 구체적 질문",
    ],
    pitfalls: [
      "침묵 10초+ — 면접관이 도울 수 없음. 생각을 말로 해야 힌트가 온다",
      "최적해만 고집 — brute force부터 시작해서 개선하는 프로세스를 보여줘야",
      "역질문 '없습니다' — 회사에 관심 없다는 신호",
      "과제 코드를 기억 못 함 — 내가 짠 코드를 설명 못 하면 신뢰도 0",
    ],
  },
  {
    id: "culture-fit", step: 5, title: "컬쳐핏 면접", icon: "05", color: "#ef4444",
    timeline: "Phase 4에서 집중 준비 (Day 86-100)",
    overview: "기술을 다 통과해도 여기서 30-40% 탈락. '꾸며낸 답변' 감지 능력이 높다. 솔직함 > 멋진 답변. 회사 가치관과 진짜 맞아야 통과.",
    checklist: [
      "회사 핵심 가치 3가지 암기 + 본인 경험과 연결",
      "'왜 이 회사인가' 답변: 구체적 계기 → 직무 매력 → 경험 연결 → 입사 후 기여",
      "갈등 해결 경험 1개 준비 (STAR: 상황→과제→행동→결과)",
      "실패 경험 1개 준비 (뭘 배웠는지가 핵심)",
      "회사 최근 뉴스/기술블로그 5편 읽기",
      "CTO/리더에게 할 질문 3개 준비",
    ],
    tips: [
      "토스: CTO와 1:1 대화식. 이력서 모든 항목 + 과제 기반 질문. 상호 질의응답 형식.",
      "당근: 비즈니스 모델 이해도 + 로컬 커뮤니티 가치 공감 여부. 실제 당근 사용 경험 필수.",
      "카카오: 팀 협업 방식 + 기술 의사결정 과정에 대한 의견.",
      "'왜 퇴사하려 하나?' → 부정적 답변 금지. '더 큰 도전' '성장 기회' 프레임.",
    ],
    pitfalls: [
      "회사가 원하는 답을 억지로 맞추려 함 — 어색함이 감지되면 탈락",
      "'안정적이라서' '연봉이 높아서' — 동기부여 의심",
      "모든 답변이 1-2문장 — 깊이 부족으로 탈락 (토스에서 특히 치명적)",
      "회사에 대해 아무것도 모름 — 관심 없다는 신호",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  CULTURE FIT FLASH CARDS                                    */
/* ═══════════════════════════════════════════════════════════ */

export const CULTURE_QUESTIONS: InterviewQuestion[] = [
  { id: "cul-1", topic: "자기소개", phase: 4, question: "1분 자기소개를 해주세요.", answer: "현재 역할(iOS 개발자 3년 7개월) → 핵심 성과 1개(608건 티켓, 4개 앱 담당) → 최근 관심사(AI 에이전트 오케스트레이션) → 지원 동기(이 역량을 더 큰 규모에서 발휘하고 싶다). 30초~1분. 암기 X, 키워드 기반 자연스럽게." },
  { id: "cul-2", topic: "지원동기", phase: 4, question: "왜 이 회사에 지원했나요?", answer: "4단계: ①회사를 알게 된 구체적 계기(기술블로그 글, 서비스 사용 경험) ②직무의 매력(추상적X, 구체적O) ③나의 경험과 연결(어떤 문제를 비슷하게 풀어봤는지) ④입사 후 기여(첫 3개월 목표). '안정적이라서' '공부하고 싶어서'는 자동 탈락." },
  { id: "cul-3", topic: "퇴사사유", phase: 4, question: "왜 이직하려 하시나요?", answer: "부정적 답변 절대 금지 ('상사가 싫어서' '야근이 많아서'). 프레임: '현재 회사에서 충분히 성장했고(성과 언급), 다음 단계 도전이 필요하다. 이 회사의 XX 환경이 그 도전에 최적이라고 판단.' 핵심: 도망이 아닌 도전." },
  { id: "cul-4", topic: "갈등해결", phase: 4, question: "동료와 의견 충돌이 있었던 경험은?", answer: "STAR 프레임: 상황(어떤 기술 결정) → 과제(서로 다른 접근법) → 행동(데이터 기반으로 각 방법의 장단점 정리 → 팀 회의에서 공유 → 합의점 도출) → 결과(채택된 방안의 성과). 핵심: '내가 이겼다'가 아니라 '팀이 더 나은 결정을 했다'." },
  { id: "cul-5", topic: "실패경험", phase: 4, question: "가장 큰 실패 경험과 배운 점은?", answer: "진짜 실패를 말해라 (가짜 실패='열심히 했는데 시간이 부족했다'는 감지됨). 구조: 실패 상황 → 원인 분석 → 이후 행동 변화 → 그 변화의 결과. 예: 'AI 파이프라인에서 프롬프트 가드만 믿었다가 에러 반복 → 후처리 sanitizer 추가 → 에러 0건'." },
  { id: "cul-6", topic: "성장", phase: 4, question: "최근 1년간 어떻게 성장했나요?", answer: "구체적 사례 기반: '독학으로 AI 에이전트 오케스트레이션을 학습 → 4개 프로젝트에 적용 → 방법론(Harness/Context/Compound)을 체계화하여 90+ 엔트리 위키로 정리 → 워커 프로젝트에서 검증된 패턴이 위키에 환류되는 구조 구축'. 추상적 '열심히 공부했다' X." },
  { id: "cul-7", topic: "협업", phase: 3, question: "코드 리뷰에 대한 생각은?", answer: "리뷰는 '틀린 곳 찾기'가 아니라 '더 나은 코드를 함께 만들기'. 그린카에서: 야곰 아카데미 리뷰어 경험 → 팀 내 리뷰 문화 도입 시도. 좋은 리뷰 = 맥락 제공 + 대안 제시 + 칭찬 병행. 코드 스타일 논쟁은 린터에 맡기고, 로직에 집중." },
  { id: "cul-8", topic: "리더십", phase: 3, question: "팀에 기술적으로 기여한 경험은?", answer: "SPM 모노레포 멀티모듈 구조화, Fastlane+Jenkins CI/CD 구축, Python CSV→API 자동 생성 도구 개발. 핵심: '내가 만든 도구가 팀 전체의 생산성을 올렸다'는 프레임. 정량적: '이벤트 불일치 0건', '빌드 시간 X분 단축'." },
];

/* ═══════════════════════════════════════════════════════════ */
/*  ASSIGNMENT TEMPLATES (사전과제 가이드)                      */
/* ═══════════════════════════════════════════════════════════ */

export const ASSIGNMENT_CHECKLIST = {
  readme: [
    "프로젝트 소개 (1-2문장)",
    "설치 및 실행 방법 (copy-paste 가능하게)",
    "스크린샷 또는 GIF",
    "아키텍처 설명 (폴더 구조 + 선택 이유)",
    "기술 스택 + 각각의 선택 이유",
    "구현한 기능 목록",
    "구현하지 못한 부분 + 이유 + 어떻게 구현할 계획이었는지",
    "테스트 실행 방법",
    "고민한 점 / 배운 점",
  ],
  aiUsage: [
    "AI 도구(Cursor/Claude) 활용 — 설계/검증은 본인이 직접",
    "AI가 생성한 코드는 반드시 리뷰 + 수정 후 커밋",
    "면접에서 '왜 이렇게 했는지' 설명 준비 (AI가 해줬다 ≠ 답변)",
    "커밋 메시지에 AI 사용 여부 굳이 명시하지 않아도 됨",
    "단, 물어보면 솔직하게: 'AI로 초안 생성 → 직접 리뷰/수정/테스트'",
  ],
  timeline5day: [
    "Day 1 (3h): 요구사항 분석 + 기술 스택 결정 + 프로젝트 셋업 + 더미 프로토타입",
    "Day 2 (4h): 핵심 기능 1-2개 구현 (가장 중요한 것부터)",
    "Day 3 (4h): 나머지 기능 구현 (80% 완성 목표)",
    "Day 4 (3h): 엣지 케이스 + 에러 핸들링 + 테스트 코드 3-5개",
    "Day 5 (4h): 리팩토링 2h + README 작성 2h",
  ],
};

/* ═══════════════════════════════════════════════════════════ */
/*  ALGORITHM PATTERN GUIDES (시각적 설명 + 템플릿)             */
/* ═══════════════════════════════════════════════════════════ */

export interface AlgoGuide {
  id: string;
  name: string;
  nameKo: string;
  color: string;
  oneLiner: string;
  whenToUse: string[];
  visual: string;
  steps: string[];
  template: string;
  templateLang: string;
  complexity: string;
  representative: string;
}

export const ALGO_GUIDES: AlgoGuide[] = [
  {
    id: "hash",
    name: "Hash Map",
    nameKo: "해시맵",
    color: "#3b82f6",
    oneLiner: "\"이 값을 본 적 있나?\" → 해시맵에 저장해두고 O(1)로 조회",
    whenToUse: [
      "\"~가 존재하는지 확인\" 또는 \"~의 개수를 세라\"",
      "두 배열의 교집합/차집합",
      "빈도수 세기 (문자, 숫자 등)",
      "중복 확인",
    ],
    visual: `  배열: [1, 2, 3, 2, 1]

  해시맵에 하나씩 저장:
  ┌──────────┐
  │ key → val│
  │ 1   → 2  │  ← 1이 2번 등장
  │ 2   → 2  │  ← 2가 2번 등장
  │ 3   → 1  │  ← 3이 1번 등장
  └──────────┘
  조회: map[2] → O(1)로 즉시 확인!`,
    steps: [
      "빈 해시맵(딕셔너리) 생성",
      "배열을 순회하며 각 요소를 key로 저장",
      "이미 있으면 값 업데이트 (카운트+1 등)",
      "필요한 조건 확인 (존재 여부, 개수 등)",
    ],
    template: `func solution(_ arr: [Int], target: Int) -> Bool {
    var map: [Int: Int] = [:]   // 해시맵 생성

    for num in arr {
        let complement = target - num
        if map[complement] != nil {
            return true  // 찾았다!
        }
        map[num] = num  // 저장해두기
    }
    return false
}`,
    templateLang: "swift",
    complexity: "시간 O(n), 공간 O(n)",
    representative: "완주하지 못한 선수, Two Sum",
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    nameKo: "투 포인터",
    color: "#8b5cf6",
    oneLiner: "양쪽 끝에서 포인터 2개가 서로를 향해 좁혀오며 답을 찾는다",
    whenToUse: [
      "정렬된 배열에서 합/차이 조건 만족하는 쌍 찾기",
      "\"두 수의 합이 X\"",
      "팰린드롬 확인",
      "정렬된 데이터에서 조건 만족하는 구간",
    ],
    visual: `  정렬된 배열: [1, 3, 5, 7, 9]   목표합: 10

  L→              ←R
  [1, 3, 5, 7, 9]
   ↑            ↑
   L=1 + R=9 = 10  ✅ 찾았다!

  만약 합이 작으면 → L을 오른쪽으로 (더 큰 수)
  만약 합이 크면  → R을 왼쪽으로 (더 작은 수)`,
    steps: [
      "배열을 정렬 (이미 정렬되어 있으면 생략)",
      "왼쪽 포인터 L=0, 오른쪽 포인터 R=끝",
      "L < R 인 동안 반복:",
      "  합이 목표보다 작으면 → L += 1",
      "  합이 목표보다 크면 → R -= 1",
      "  합이 목표와 같으면 → 정답!",
    ],
    template: `func twoSum(_ arr: [Int], _ target: Int) -> [Int]? {
    let sorted = arr.sorted()
    var left = 0
    var right = sorted.count - 1

    while left < right {
        let sum = sorted[left] + sorted[right]
        if sum == target {
            return [sorted[left], sorted[right]]
        } else if sum < target {
            left += 1      // 합이 작으니 왼쪽을 키운다
        } else {
            right -= 1     // 합이 크니 오른쪽을 줄인다
        }
    }
    return nil
}`,
    templateLang: "swift",
    complexity: "시간 O(n), 공간 O(1) — 정렬 제외",
    representative: "구명보트, Container With Most Water",
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    nameKo: "슬라이딩 윈도우",
    color: "#10b981",
    oneLiner: "창문(window)을 밀면서 구간의 합/최대/조건을 추적한다",
    whenToUse: [
      "\"연속된 K개의 합/최대/최소\"",
      "\"조건을 만족하는 가장 짧은/긴 부분 배열\"",
      "부분 문자열 관련 문제",
      "고정 크기 또는 가변 크기 구간",
    ],
    visual: `  배열: [2, 1, 5, 1, 3, 2]   K=3 연속 합의 최대?

  윈도우가 오른쪽으로 한 칸씩 밀린다:
  [2, 1, 5] 1, 3, 2  → 합=8
   2 [1, 5, 1] 3, 2  → 합=7  (왼쪽 빼고 오른쪽 추가)
   2, 1 [5, 1, 3] 2  → 합=9  ← 최대!
   2, 1, 5 [1, 3, 2] → 합=6

  핵심: 매번 K개를 다시 더하지 않는다.
        왼쪽 1개 빼고 + 오른쪽 1개 더하면 O(1)!`,
    steps: [
      "첫 K개의 합을 구한다 (초기 윈도우)",
      "윈도우를 한 칸씩 오른쪽으로 이동:",
      "  새로 들어오는 오른쪽 값을 더하고",
      "  빠지는 왼쪽 값을 뺀다",
      "매 이동마다 최대/최소/조건 업데이트",
    ],
    template: `func maxSumSubarray(_ arr: [Int], _ k: Int) -> Int {
    // 1. 첫 윈도우 합
    var windowSum = arr[0..<k].reduce(0, +)
    var maxSum = windowSum

    // 2. 윈도우 슬라이드
    for i in k..<arr.count {
        windowSum += arr[i]       // 오른쪽 추가
        windowSum -= arr[i - k]   // 왼쪽 제거
        maxSum = max(maxSum, windowSum)
    }
    return maxSum
}`,
    templateLang: "swift",
    complexity: "시간 O(n), 공간 O(1)",
    representative: "DNA 비밀번호, Minimum Window Substring",
  },
  {
    id: "bfs",
    name: "BFS",
    nameKo: "너비 우선 탐색",
    color: "#06b6d4",
    oneLiner: "가까운 것부터 먼저! 큐(Queue)로 층별로 탐색한다",
    whenToUse: [
      "\"최단 거리\" \"최소 이동 횟수\"",
      "미로 탈출, 최단 경로",
      "레벨별 탐색 (트리의 각 층)",
      "가중치 없는 그래프의 최단 경로",
    ],
    visual: `  시작 → 1층 → 2층 → 3층 (가까운 것부터!)

      [S]          큐: [S]
     / | \\
    A  B  C        큐: [A, B, C]  ← 1층 전부
   / \\   |
  D   E  [G]       큐: [D, E, G]  ← 2층 전부
                   G 도착! 최단거리 = 2

  핵심: 큐에 넣고 → 꺼내고 → 인접한 거 넣고 반복`,
    steps: [
      "시작점을 큐에 넣고 방문 표시",
      "큐가 빌 때까지 반복:",
      "  큐에서 하나 꺼냄",
      "  목표면 종료 (최단거리 찾음!)",
      "  아니면 인접 노드 중 미방문을 큐에 추가",
    ],
    template: `func bfs(_ graph: [[Int]], _ start: Int, _ target: Int) -> Int {
    var queue: [(node: Int, dist: Int)] = [(start, 0)]
    var visited = Set<Int>([start])
    var index = 0

    while index < queue.count {
        let (node, dist) = queue[index]
        index += 1

        if node == target { return dist }  // 찾았다!

        for next in graph[node] {
            if !visited.contains(next) {
                visited.insert(next)
                queue.append((next, dist + 1))
            }
        }
    }
    return -1  // 도달 불가
}`,
    templateLang: "swift",
    complexity: "시간 O(V+E), 공간 O(V)",
    representative: "게임 맵 최단거리, 미로 탐색",
  },
  {
    id: "dfs",
    name: "DFS",
    nameKo: "깊이 우선 탐색",
    color: "#f59e0b",
    oneLiner: "한 길로 끝까지 가본다 → 막히면 돌아와서 다른 길",
    whenToUse: [
      "\"모든 경우의 수\" \"경로 탐색\"",
      "순열/조합 구하기",
      "연결된 영역 찾기 (섬의 개수)",
      "백트래킹 (조건 만족하는 해 찾기)",
    ],
    visual: `  한 길로 끝까지 간다!

      [S]
     / | \\
    A  B  C      S→A→D (막힘!) 돌아와서
   / \\   |      S→A→E (막힘!) 돌아와서
  D   E  [G]    S→B (막힘!) 돌아와서
                S→C→G 도착!

  핵심: 재귀 또는 스택으로 구현`,
    steps: [
      "시작점에서 출발, 방문 표시",
      "인접 노드 중 미방문 하나를 선택 → 그쪽으로 깊이 들어감",
      "더 이상 갈 곳 없으면 → 돌아옴 (백트래킹)",
      "모든 경로를 탐색할 때까지 반복",
    ],
    template: `func dfs(_ graph: [[Int]], _ node: Int,
         _ visited: inout Set<Int>, _ path: inout [Int]) {
    visited.insert(node)
    path.append(node)

    for next in graph[node] {
        if !visited.contains(next) {
            dfs(graph, next, &visited, &path)
        }
    }
    // 필요시 path.removeLast()  ← 백트래킹
}`,
    templateLang: "swift",
    complexity: "시간 O(V+E), 공간 O(V)",
    representative: "타겟 넘버, 여행경로, 네트워크",
  },
  {
    id: "binary-search",
    name: "Binary Search",
    nameKo: "이분 탐색",
    color: "#ef4444",
    oneLiner: "정렬된 곳에서 절반씩 버리며 찾는다 — 1000개도 10번이면 끝",
    whenToUse: [
      "\"정렬된 배열에서 X 찾기\"",
      "\"조건을 만족하는 최소/최대값\"",
      "\"N이 10억 이상\" (완전 탐색 불가능할 때)",
      "Parametric Search (답을 정해놓고 가능한지 확인)",
    ],
    visual: `  정렬: [1, 3, 5, 7, 9, 11, 13]   찾는 값: 9

  1단계: mid = 7   →  9 > 7  →  오른쪽 절반만!
         [1, 3, 5, 7, | 9, 11, 13]
                        ↑ 이쪽!
  2단계: mid = 11  →  9 < 11 →  왼쪽 절반만!
                       [9, | 11, 13]
                        ↑
  3단계: mid = 9   →  찾았다! ✅

  7개 중 3번 만에 발견 (log₂7 ≈ 3)`,
    steps: [
      "left = 0, right = 배열 끝",
      "left <= right 인 동안:",
      "  mid = (left + right) / 2",
      "  arr[mid] == target → 찾았다!",
      "  arr[mid] < target → left = mid + 1",
      "  arr[mid] > target → right = mid - 1",
    ],
    template: `func binarySearch(_ arr: [Int], _ target: Int) -> Int {
    var left = 0
    var right = arr.count - 1

    while left <= right {
        let mid = (left + right) / 2
        if arr[mid] == target {
            return mid            // 찾았다!
        } else if arr[mid] < target {
            left = mid + 1        // 오른쪽 절반
        } else {
            right = mid - 1       // 왼쪽 절반
        }
    }
    return -1  // 없음
}`,
    templateLang: "swift",
    complexity: "시간 O(log n), 공간 O(1)",
    representative: "입국심사, 징검다리, 나무 자르기",
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    nameKo: "동적 계획법",
    color: "#8b5cf6",
    oneLiner: "큰 문제를 작은 문제로 쪼개고, 한 번 푼 건 저장해서 재사용",
    whenToUse: [
      "\"최소 비용\" \"최대 이익\" \"경우의 수\"",
      "피보나치처럼 반복되는 하위 문제가 보일 때",
      "\"~까지의 최적값\" \"~를 만드는 방법의 수\"",
      "문제를 점화식(dp[i] = dp[i-1] + ...)으로 표현 가능할 때",
    ],
    visual: `  계단 오르기: 1칸 또는 2칸씩, N번째 도달 방법 수?

  dp[1] = 1        (1칸)
  dp[2] = 2        (1+1 또는 2)
  dp[3] = dp[2] + dp[1] = 3
  dp[4] = dp[3] + dp[2] = 5

  ┌───┬───┬───┬───┬───┐
  │ 1 │ 2 │ 3 │ 5 │ 8 │  ← 한 번 구한 건 저장!
  └───┴───┴───┴───┴───┘
   dp1 dp2 dp3 dp4 dp5

  핵심: dp[n] = dp[n-1] + dp[n-2]  ← 점화식`,
    steps: [
      "점화식 찾기: dp[i]를 이전 값들로 어떻게 표현?",
      "기저 조건(base case) 설정: dp[0], dp[1] 등",
      "배열을 만들어 작은 문제부터 채워나감 (Bottom-up)",
      "또는 재귀 + 메모이제이션 (Top-down)",
    ],
    template: `// Bottom-up DP (더 직관적)
func climbStairs(_ n: Int) -> Int {
    if n <= 2 { return n }
    var dp = Array(repeating: 0, count: n + 1)
    dp[1] = 1
    dp[2] = 2

    for i in 3...n {
        dp[i] = dp[i-1] + dp[i-2]  // 점화식!
    }
    return dp[n]
}`,
    templateLang: "swift",
    complexity: "시간 O(n), 공간 O(n) — 보통",
    representative: "정수 삼각형, 등굣길, N으로 표현",
  },
  {
    id: "stack",
    name: "Stack",
    nameKo: "스택",
    color: "#f97316",
    oneLiner: "마지막에 넣은 게 먼저 나온다 (LIFO) — 괄호/되돌리기의 핵심",
    whenToUse: [
      "\"괄호 짝 맞추기\"",
      "\"가장 가까운 이전 값\" (히스토리)",
      "문자열 뒤집기, 실행 취소",
      "단조 스택 (Monotone Stack) — 다음 큰 값 찾기",
    ],
    visual: `  괄호 검증: "( [ { } ] )"

  (  →  스택: [(]
  [  →  스택: [(, []
  {  →  스택: [(, [, {]
  }  →  { 와 매칭! 스택: [(, []
  ]  →  [ 와 매칭! 스택: [(]
  )  →  ( 와 매칭! 스택: []  ← 비었다 = 유효! ✅`,
    steps: [
      "빈 스택 생성",
      "입력을 하나씩 순회",
      "열린 괄호면 → 스택에 push",
      "닫힌 괄호면 → 스택 top과 비교 → 매칭이면 pop",
      "끝나고 스택이 비어있으면 유효",
    ],
    template: `func isValid(_ s: String) -> Bool {
    var stack: [Character] = []
    let pairs: [Character: Character] = [")": "(", "]": "[", "}": "{"]

    for char in s {
        if let match = pairs[char] {
            // 닫힌 괄호 → top과 비교
            if stack.isEmpty || stack.last != match {
                return false
            }
            stack.removeLast()
        } else {
            stack.append(char)  // 열린 괄호 → push
        }
    }
    return stack.isEmpty
}`,
    templateLang: "swift",
    complexity: "시간 O(n), 공간 O(n)",
    representative: "Valid Parentheses, 주식 가격",
  },
  {
    id: "greedy",
    name: "Greedy",
    nameKo: "탐욕법",
    color: "#22c55e",
    oneLiner: "매 순간 가장 좋은 선택을 하면 전체적으로도 최적이 된다",
    whenToUse: [
      "\"최소 횟수\" \"최소 비용\"으로 뭔가를 완성",
      "정렬 후 앞/뒤에서 선택하는 문제",
      "구간 스케줄링 (회의실, 시간표)",
      "DP처럼 보이지만 욕심내면 풀리는 문제",
    ],
    visual: `  구명보트: 무게 제한 100kg, [70, 50, 80, 40]

  정렬: [40, 50, 70, 80]
       L→          ←R

  40 + 80 = 120 > 100 → 80 혼자 탑승. R--
  40 + 70 = 110 > 100 → 70 혼자 탑승. R--
  40 + 50 = 90  ≤ 100 → 둘이 같이! L++, R--

  보트 3대. 매 순간 "가장 무거운 사람"부터 처리!`,
    steps: [
      "정렬 (보통 오름차순 또는 내림차순)",
      "매 단계에서 '지금 가장 좋은 선택' 실행",
      "선택 후 상태 업데이트",
      "끝까지 반복",
    ],
    template: `func lifeboat(_ people: [Int], _ limit: Int) -> Int {
    let sorted = people.sorted()
    var left = 0
    var right = sorted.count - 1
    var boats = 0

    while left <= right {
        if sorted[left] + sorted[right] <= limit {
            left += 1   // 가벼운 사람도 탑승
        }
        right -= 1       // 무거운 사람은 무조건 탑승
        boats += 1
    }
    return boats
}`,
    templateLang: "swift",
    complexity: "시간 O(n log n) — 정렬 포함",
    representative: "구명보트, 섬 연결하기, 체육복",
  },
  {
    id: "heap",
    name: "Heap / Priority Queue",
    nameKo: "힙 / 우선순위 큐",
    color: "#ec4899",
    oneLiner: "항상 가장 작은(또는 큰) 값을 O(log n)으로 꺼낸다",
    whenToUse: [
      "\"상위 K개\" \"K번째로 큰/작은\"",
      "실시간으로 최소/최대를 빠르게 알아야 할 때",
      "작업 스케줄링 (가장 짧은 작업 먼저)",
      "다익스트라 최단경로",
    ],
    visual: `  최소 힙 (항상 제일 작은 게 맨 위):

       [1]          push(5): [1,3,5]
      /   \\         pop():   1 나옴!  [3,5]
    [3]   [5]       push(2): [2,3,5]
                    pop():   2 나옴!  [3,5]

  어떤 순서로 넣든 꺼내면 항상 정렬됨!`,
    steps: [
      "힙(우선순위 큐) 생성",
      "데이터를 넣으면 자동으로 정렬됨",
      "pop하면 항상 최소(또는 최대)값이 나옴",
      "필요한 만큼 pop하면 상위 K개 완성",
    ],
    template: `// Swift에는 내장 힙이 없어서 배열+정렬 또는 직접 구현
// 프로그래머스에서는 보통 배열로 대체
func topK(_ arr: [Int], _ k: Int) -> [Int] {
    // 간단 버전: 정렬 후 앞에서 K개
    return Array(arr.sorted().prefix(k))

    // 실전에서는 Heap 구현 또는
    // Python의 heapq 사용이 더 효율적
}`,
    templateLang: "swift",
    complexity: "push/pop O(log n), 전체 O(n log n)",
    representative: "디스크 컨트롤러, 이중우선순위큐",
  },
  {
    id: "backtracking",
    name: "Backtracking",
    nameKo: "백트래킹",
    color: "#a855f7",
    oneLiner: "DFS + 가지치기 — 안 되는 건 일찍 포기하고 돌아온다",
    whenToUse: [
      "\"모든 조합\" \"모든 순열\"",
      "N-Queen, 스도쿠 같은 배치 문제",
      "조건을 만족하는 모든 경우 탐색",
      "DFS인데 조건 불만족 시 빠른 포기 필요",
    ],
    visual: `  [1,2,3]에서 합이 4인 조합 찾기:

  시작 → 1 선택
         → 1+2=3 → 1+2+3=6 > 4 ✗ 포기! (가지치기)
         → 1+3=4 ✅ 찾았다!
       → 2 선택
         → 2+3=5 > 4 ✗ 포기!
       → 3 선택
         → 3만으론 부족

  핵심: "이 길은 답이 없다" → 즉시 돌아감`,
    steps: [
      "선택지 중 하나를 선택",
      "조건 확인 → 불만족이면 즉시 return (가지치기)",
      "만족이면 다음 단계로 재귀",
      "답을 찾으면 저장",
      "현재 선택 취소 (되돌리기) → 다음 선택지 시도",
    ],
    template: `func combinations(_ nums: [Int], _ target: Int) -> [[Int]] {
    var result: [[Int]] = []
    var path: [Int] = []

    func backtrack(_ start: Int, _ sum: Int) {
        if sum == target {
            result.append(path)  // 찾았다!
            return
        }
        if sum > target { return }  // 가지치기!

        for i in start..<nums.count {
            path.append(nums[i])           // 선택
            backtrack(i + 1, sum + nums[i]) // 재귀
            path.removeLast()              // 되돌리기
        }
    }

    backtrack(0, 0)
    return result
}`,
    templateLang: "swift",
    complexity: "시간 O(2^n) — 가지치기로 실제론 훨씬 빠름",
    representative: "N-Queen, 단어 변환, 소수 찾기",
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  BIG-O NOTATION GUIDE                                       */
/* ═══════════════════════════════════════════════════════════ */

export interface BigOEntry {
  notation: string;
  name: string;
  nameKo: string;
  color: string;
  speed: string;
  analogy: string;
  visual: string;
  example: string;
  limit: string;
  code: string;
}

export const BIG_O_GUIDE: BigOEntry[] = [
  {
    notation: "O(1)", name: "Constant", nameKo: "상수 시간", color: "#10b981",
    speed: "즉시",
    analogy: "책장에서 3번째 책 꺼내기 — 책이 100권이든 100만 권이든 같은 시간",
    visual: `  n=10     → 1번
  n=1000   → 1번
  n=100만  → 1번
  데이터가 아무리 커져도 딱 1번!`,
    example: "배열 인덱스 접근, 해시맵 조회, 스택 push/pop",
    limit: "데이터 무한대도 OK",
    code: `// 배열 인덱스 접근 — 항상 1번
let arr = [10, 20, 30, 40, 50]
let value = arr[3]  // O(1) — 바로 접근!

// 딕셔너리(해시맵) 조회
let map = ["apple": 3, "banana": 5]
let count = map["apple"]  // O(1) — 키로 즉시 조회!

// 스택 push/pop
var stack = [1, 2, 3]
stack.append(4)       // O(1) — 맨 뒤에 추가
stack.removeLast()    // O(1) — 맨 뒤에서 제거`,
  },
  {
    notation: "O(log n)", name: "Logarithmic", nameKo: "로그 시간", color: "#22c55e",
    speed: "매우 빠름",
    analogy: "사전에서 단어 찾기 — 절반씩 넘기면 1000페이지도 10번이면 끝",
    visual: `  n=10     → 약 3번
  n=1000   → 약 10번
  n=100만  → 약 20번
  n=10억   → 약 30번  ← 10억 개도 30번!

  매번 절반을 버리니까 기하급수적으로 빨라진다`,
    example: "이분 탐색, 균형 이진 트리(BST), 힙 삽입/삭제",
    limit: "n=10억도 30번이면 끝",
    code: `// 이분 탐색 — 정렬된 배열에서 값 찾기
func binarySearch(_ arr: [Int], _ target: Int) -> Int? {
    var lo = 0, hi = arr.count - 1

    while lo <= hi {
        let mid = (lo + hi) / 2   // 가운데를 본다
        if arr[mid] == target {
            return mid             // 찾았다!
        } else if arr[mid] < target {
            lo = mid + 1           // 오른쪽 절반만
        } else {
            hi = mid - 1           // 왼쪽 절반만
        }
    }
    return nil  // 없음
}
// [1,3,5,7,9,11,13] 에서 9 찾기 → 3번 만에 발견`,
  },
  {
    notation: "O(n)", name: "Linear", nameKo: "선형 시간", color: "#3b82f6",
    speed: "빠름",
    analogy: "출석부 한 명씩 부르기 — 학생 수만큼 걸린다",
    visual: `  n=10     → 10번
  n=1000   → 1,000번
  n=100만  → 1,000,000번

  데이터가 2배 → 시간도 2배. 정직한 비례!`,
    example: "배열 순회, 선형 탐색, 합계 구하기, 해시맵 생성",
    limit: "n=1000만까지 1초 내 (Swift 기준)",
    code: `// 배열에서 최대값 찾기 — 하나씩 다 봐야 함
func findMax(_ arr: [Int]) -> Int? {
    guard var maxVal = arr.first else { return nil }

    for num in arr {           // n번 반복
        if num > maxVal {
            maxVal = num
        }
    }
    return maxVal
}

// 배열 합계
let sum = arr.reduce(0, +)     // O(n) — 전부 더해야 하니까

// 해시맵 생성
var freq: [Int: Int] = [:]
for num in arr {               // O(n)
    freq[num, default: 0] += 1
}`,
  },
  {
    notation: "O(n log n)", name: "Linearithmic", nameKo: "선형 로그", color: "#8b5cf6",
    speed: "괜찮음",
    analogy: "학생들을 키 순서로 줄 세우기 — 효율적 정렬의 한계",
    visual: `  n=10     → 약 33번
  n=1000   → 약 10,000번
  n=100만  → 약 2000만번

  "비교 기반 정렬은 이보다 빨라질 수 없다"
  → 정렬이 필요하면 이게 최선!`,
    example: "Swift .sorted(), 병합정렬, 퀵소트, 힙정렬",
    limit: "n=100만까지 1초 내",
    code: `// Swift 내장 정렬 — Tim Sort (O(n log n))
let sorted = arr.sorted()

// 병합 정렬 직접 구현
func mergeSort(_ arr: [Int]) -> [Int] {
    guard arr.count > 1 else { return arr }
    let mid = arr.count / 2
    let left = mergeSort(Array(arr[..<mid]))    // 반으로 쪼개고
    let right = mergeSort(Array(arr[mid...]))   // 반으로 쪼개고
    return merge(left, right)                   // 합치면서 정렬
}

func merge(_ a: [Int], _ b: [Int]) -> [Int] {
    var result: [Int] = []
    var i = 0, j = 0
    while i < a.count && j < b.count {
        if a[i] <= b[j] { result.append(a[i]); i += 1 }
        else { result.append(b[j]); j += 1 }
    }
    return result + Array(a[i...]) + Array(b[j...])
}`,
  },
  {
    notation: "O(n²)", name: "Quadratic", nameKo: "이차 시간", color: "#f59e0b",
    speed: "느림",
    analogy: "반 학생 30명이 서로 악수 — 30×29/2 = 435번",
    visual: `  n=10     → 100번
  n=100    → 10,000번
  n=1000   → 1,000,000번 (100만!)
  n=1만    → 1억번 (위험!)
  n=10만   → 100억번 (시간초과! ✗)

  이중 for문이 보이면 O(n²)를 의심해라`,
    example: "이중 for문, 버블정렬, 선택정렬, 2D 배열 순회",
    limit: "n=1만까지 안전. 10만이면 시간초과",
    code: `// 버블 정렬 — 옆에 것과 비교하며 교환
func bubbleSort(_ arr: inout [Int]) {
    for i in 0..<arr.count {               // n번
        for j in 0..<arr.count - 1 - i {   // n번 (이중 루프!)
            if arr[j] > arr[j + 1] {
                arr.swapAt(j, j + 1)
            }
        }
    }
}

// "모든 쌍" 찾기 — 전형적인 O(n²)
func allPairs(_ arr: [Int]) -> [(Int, Int)] {
    var pairs: [(Int, Int)] = []
    for i in 0..<arr.count {
        for j in (i+1)..<arr.count {  // 이중 for문!
            pairs.append((arr[i], arr[j]))
        }
    }
    return pairs
}
// ⚠️ n이 크면 투포인터/해시맵으로 O(n)에 풀 수 있는지 확인!`,
  },
  {
    notation: "O(2ⁿ)", name: "Exponential", nameKo: "지수 시간", color: "#ef4444",
    speed: "매우 느림",
    analogy: "모든 부분집합 구하기 — 20개면 100만, 30개면 10억 가지",
    visual: `  n=10   → 1,024번
  n=20   → 1,048,576번 (100만)
  n=30   → 1,073,741,824번 (10억! ✗)

  1개 추가될 때마다 경우의 수가 2배!
  → DP(메모이제이션)로 줄일 수 있는지 먼저 확인`,
    example: "재귀 피보나치(메모 없음), 부분집합 전체 탐색, 백트래킹",
    limit: "n=20~25가 한계. 그 이상이면 DP 필수",
    code: `// 피보나치 — 메모이제이션 없으면 O(2ⁿ)
func fibSlow(_ n: Int) -> Int {
    if n <= 1 { return n }
    return fibSlow(n - 1) + fibSlow(n - 2)  // 매번 2갈래!
}
// fib(40)만 해도 수 초 걸림...

// DP로 개선하면 O(n)으로 변신!
func fibFast(_ n: Int) -> Int {
    if n <= 1 { return n }
    var dp = [0, 1]
    for i in 2...n {
        dp.append(dp[i-1] + dp[i-2])  // 저장해두고 재사용
    }
    return dp[n]
}
// fib(10000)도 순식간!

// 모든 부분집합 구하기 — O(2ⁿ)
func subsets(_ nums: [Int]) -> [[Int]] {
    var result: [[Int]] = [[]]
    for num in nums {
        result += result.map { $0 + [num] }  // 매번 2배!
    }
    return result
}`,
  },
  {
    notation: "O(n!)", name: "Factorial", nameKo: "팩토리얼", color: "#dc2626",
    speed: "사실상 불가",
    analogy: "모든 순열 구하기 — 10명 줄 세우는 방법 = 362만 가지",
    visual: `  n=5    → 120번
  n=10   → 3,628,800번 (362만)
  n=12   → 479,001,600번 (4.7억)
  n=15   → 1,307,674,368,000번 (1.3조! ✗✗✗)

  "모든 순서를 다 시도" 하면 이렇게 된다
  → 거의 항상 다른 방법이 있다`,
    example: "순열, 외판원 문제(TSP) brute force, N-Queen brute force",
    limit: "n=10~12가 현실적 한계",
    code: `// 모든 순열 구하기 — O(n!)
func permutations(_ arr: [Int]) -> [[Int]] {
    if arr.count <= 1 { return [arr] }
    var result: [[Int]] = []

    for i in 0..<arr.count {
        var rest = arr
        let picked = rest.remove(at: i)  // 1개 꺼내고
        for perm in permutations(rest) {  // 나머지로 재귀
            result.append([picked] + perm)
        }
    }
    return result
}
// [1,2,3] → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
// 3! = 6가지. n=10이면 362만 가지...

// ⚠️ 순열이 필요하면 백트래킹 + 가지치기로 최적화 필수!`,
  },
];

/* 시각적 비교 바 (n=100 기준 상대적 연산 횟수) */
export const BIG_O_COMPARISON = [
  { notation: "O(1)", ops: 1, bar: 1 },
  { notation: "O(log n)", ops: 7, bar: 2 },
  { notation: "O(n)", ops: 100, bar: 10 },
  { notation: "O(n log n)", ops: 664, bar: 20 },
  { notation: "O(n²)", ops: 10000, bar: 50 },
  { notation: "O(2ⁿ)", ops: 1267650600228229401496703205376, bar: 100 },
];

/* ═══════════════════════════════════════════════════════════ */
/*  MOBILE SYSTEM DESIGN GUIDES                                */
/*  (Based on weeeBox/mobile-system-design framework)          */
/* ═══════════════════════════════════════════════════════════ */

export interface SystemDesignCase {
  id: string;
  title: string;
  difficulty: "medium" | "hard";
  timeLimit: string;
  phase: number;
  functional: string[];
  nonFunctional: string[];
  architecture: string[];
  deepDive: string[];
  tradeoffs: string[];
  template: string;
}

export const SYSTEM_DESIGN_CASES: SystemDesignCase[] = [
  {
    id: "sd-feed", title: "소셜 피드 (Twitter/Instagram)", difficulty: "medium", timeLimit: "45분", phase: 3,
    functional: ["무한 스크롤 피드", "좋아요/댓글", "이미지/동영상 표시", "Pull-to-refresh"],
    nonFunctional: ["오프라인 지원 (캐시된 피드 표시)", "이미지 최적화 (저해상도 → 고해상도)", "배터리 효율 (백그라운드 fetch 최소화)", "페이지네이션 (커서 기반)"],
    architecture: [
      "Client: MVVM + Repository Pattern",
      "API Layer → Repository → ViewModel → View",
      "Repository: Remote(API) + Local(CoreData/Realm) 조합",
      "이미지: 메모리 캐시(NSCache) → 디스크 캐시 → CDN",
      "페이지네이션: Cursor-based (offset보다 안정적)",
    ],
    deepDive: [
      "셀 높이 캐싱으로 스크롤 성능 확보",
      "Prefetching: 현재 화면 +2페이지 미리 로드",
      "이미지 다운샘플링 (UIGraphicsImageRenderer로 화면 크기에 맞게)",
      "오프라인 → 온라인 전환 시 diff 기반 업데이트",
    ],
    tradeoffs: [
      "REST vs GraphQL: 피드는 필드가 많아 GraphQL이 유리하나 캐싱이 복잡",
      "커서 vs 오프셋 페이지네이션: 커서가 새 글 삽입에 안전",
      "로컬 DB vs 메모리 캐시: 오프라인 필요하면 DB, 아니면 메모리만으로 충분",
    ],
    template: `// 45분 시스템 디자인 템플릿

1. 요구사항 정리 (5분)
   - 기능적: 피드 표시, 좋아요, 댓글
   - 비기능적: 오프라인, 성능, 배터리
   - 범위 밖: 로그인, 글 작성, 검색

2. 아키텍처 다이어그램 (10분)
   [Server/CDN] → [API Service] → [Repository]
                                    ↓        ↓
                              [Remote DB] [Local DB]
                                    ↓
                              [ViewModel] → [View]

3. 핵심 컴포넌트 (20분)
   - FeedRepository: fetchFeed(cursor) → [Post]
   - ImageLoader: load(url) → UIImage (3단계 캐시)
   - PaginationManager: 다음 페이지 자동 로드

4. 트레이드오프 (5분)
   - REST vs GraphQL 선택 이유
   - 캐싱 전략 선택 이유`,
  },
  {
    id: "sd-chat", title: "채팅 앱 (카카오톡/Slack)", difficulty: "hard", timeLimit: "45분", phase: 3,
    functional: ["1:1 / 그룹 채팅", "텍스트 + 이미지 메시지", "읽음 표시", "실시간 수신"],
    nonFunctional: ["오프라인 메시지 큐잉", "실시간 전송 (< 500ms)", "메시지 순서 보장", "미디어 백그라운드 업로드"],
    architecture: [
      "실시간: WebSocket (양방향, 저지연)",
      "폴백: Long Polling (WebSocket 불가 시)",
      "로컬 저장: CoreData/Realm (채팅 히스토리)",
      "동기화: 마지막 읽은 messageId 기반",
      "미디어: 백그라운드 URLSession + 프로그레스",
    ],
    deepDive: [
      "메시지 상태: pending → sent → delivered → read",
      "충돌 해결: 타임스탬프 + 서버 순서 번호 (server sequence)",
      "푸시: APNs + Silent Push로 앱 꺼져있을 때 동기화",
      "재연결: Exponential Backoff로 네트워크 복구 시 자동 재연결",
    ],
    tradeoffs: [
      "WebSocket vs SSE: 채팅은 양방향이라 WebSocket 필수",
      "CoreData vs Realm: CoreData는 Apple 네이티브, Realm은 쿼리 편함",
      "메시지 암호화: E2E 암호화 시 서버 검색 불가 → 트레이드오프",
    ],
    template: `1. 요구사항 (5분)
   - 기능적: 1:1/그룹, 텍스트/이미지, 읽음 표시
   - 비기능적: 실시간(<500ms), 오프라인, 순서 보장

2. 아키텍처 (10분)
   [WebSocket Server] ←→ [WebSocket Client]
                              ↓
   [REST API] → [ChatRepository] → [Local DB]
                      ↓
                [ViewModel] → [ChatView]

3. 핵심: 메시지 라이프사이클
   작성 → [pending] → 서버 전송 → [sent]
   → 상대방 수신 → [delivered] → 읽음 → [read]

4. 오프라인 큐:
   네트워크 끊김 → 로컬 DB 저장 (pending)
   → 재연결 시 자동 전송 + 서버 동기화`,
  },
  {
    id: "sd-image", title: "이미지 로딩 라이브러리 (Kingfisher/SDWebImage)", difficulty: "medium", timeLimit: "45분", phase: 3,
    functional: ["URL → UIImage 비동기 로딩", "다단계 캐시 (메모리/디스크)", "이미지 다운샘플링", "로딩 중 placeholder"],
    nonFunctional: ["스레드 안전성", "메모리 압박 시 자동 퇴거", "동일 URL 중복 요청 방지", "취소 가능 (셀 재사용 시)"],
    architecture: [
      "ImageLoader (퍼사드): load(url, into: imageView)",
      "MemoryCache: NSCache (자동 퇴거, 스레드 안전)",
      "DiskCache: FileManager + URL 해시 키",
      "Downloader: URLSession + 중복 요청 병합",
      "Processor: 다운샘플링 + 포맷 변환",
    ],
    deepDive: [
      "조회 순서: 메모리 → 디스크 → 네트워크 (cache-aside 패턴)",
      "URL 해싱: SHA256으로 파일명 생성 (충돌 방지)",
      "셀 재사용 대응: 로딩 시작 시 UUID 발급 → 완료 시 비교",
      "디코딩: CGImage로 백그라운드에서 미리 디코딩 (메인 스레드 블로킹 방지)",
    ],
    tradeoffs: [
      "NSCache vs 딕셔너리: NSCache는 자동 퇴거 + 스레드 안전, 딕셔너리는 직접 관리",
      "WebP vs JPEG: WebP가 30% 작지만 iOS 14+ 필요",
      "메모리 캐시 크기: 너무 크면 OOM, 너무 작으면 반복 로딩",
    ],
    template: `1. API 설계 (5분)
   ImageLoader.shared.load(
       url: URL,
       placeholder: UIImage?,
       into: UIImageView,
       completion: ((UIImage?) -> Void)?
   )

2. 캐시 계층 (10분)
   요청 → [MemoryCache] hit? → 반환
               miss ↓
          [DiskCache] hit? → 메모리 저장 → 반환
               miss ↓
          [Downloader] → 디코딩 → 양쪽 캐시 저장 → 반환

3. 스레드 안전 (10분)
   - MemoryCache: NSCache (스레드 안전 내장)
   - DiskCache: DispatchQueue (serial)
   - Downloader: URLSession (스레드 안전 내장)

4. 셀 재사용 대응 (5분)
   prepareForReuse() → 현재 로딩 취소
   → 새 URL로 재로딩 시작`,
  },
  {
    id: "sd-offline", title: "오프라인 우선 앱 (지도/메모)", difficulty: "hard", timeLimit: "45분", phase: 4,
    functional: ["오프라인 데이터 읽기/쓰기", "온라인 복귀 시 자동 동기화", "충돌 해결", "데이터 압축/차등 동기화"],
    nonFunctional: ["일관성 보장 (Eventually Consistent)", "배터리 효율", "저장 공간 관리", "네트워크 상태 감지"],
    architecture: [
      "Offline-First: 로컬 DB가 Single Source of Truth",
      "Sync Engine: 변경사항 큐잉 → 온라인 시 배치 전송",
      "Conflict Resolution: Last-Write-Wins 또는 CRDT",
      "Network Monitor: NWPathMonitor로 상태 감지",
      "Diff Sync: 전체 데이터가 아닌 변경분만 전송",
    ],
    deepDive: [
      "CRDT(Conflict-free Replicated Data Types): 멀티 디바이스 동기화",
      "Operation Log: 변경 작업을 로그로 기록 → 서버에 replay",
      "Tombstone: 삭제 표시 (실제 삭제 대신) → 동기화 시 전파",
      "버전 벡터: 각 디바이스의 마지막 동기화 버전 추적",
    ],
    tradeoffs: [
      "Strong vs Eventual Consistency: 오프라인 앱은 Eventual이 현실적",
      "Last-Write-Wins vs 사용자 선택: LWW가 간단하지만 데이터 손실 가능",
      "전체 동기화 vs 차등 동기화: 차등이 효율적이나 구현 복잡",
    ],
    template: `1. 핵심 원칙 (5분)
   "로컬 DB = 진실의 원천"
   읽기: 항상 로컬 DB에서
   쓰기: 로컬 DB → 변경 큐 → 온라인 시 서버

2. 동기화 흐름 (15분)
   [로컬 쓰기] → [Change Queue]
                     ↓ (온라인 감지)
              [Sync Engine] → [Server]
                     ↓
              [Conflict?] → 해결 전략 적용
                     ↓
              [로컬 DB 업데이트]

3. 충돌 해결 (10분)
   - 텍스트: Last-Write-Wins (타임스탬프)
   - 목록: CRDT (Set 기반)
   - 중요 데이터: 사용자에게 선택 요청

4. 네트워크 감지
   NWPathMonitor → 상태 변경 시 Sync 트리거`,
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  SYSTEM DESIGN FRAMEWORK (면접 접근법)                       */
/* ═══════════════════════════════════════════════════════════ */

export const SD_FRAMEWORK_STEPS = [
  { step: 1, title: "요구사항 정리", time: "5분", description: "기능적(3-5개) / 비기능적 / 범위 밖 분류. 면접관에게 확인 질문.", color: "#3b82f6" },
  { step: 2, title: "아키텍처 다이어그램", time: "10분", description: "Server → API Layer → Repository → ViewModel → View. 각 레이어의 책임 명시.", color: "#8b5cf6" },
  { step: 3, title: "핵심 컴포넌트 상세", time: "20분", description: "가장 중요한 2-3개 컴포넌트를 깊이 있게. API 설계, 데이터 모델, 캐싱 전략.", color: "#10b981" },
  { step: 4, title: "트레이드오프 논의", time: "5분", description: "내가 선택한 것 vs 대안. 장단점을 명확히 비교. 면접관 질문 대응.", color: "#f59e0b" },
];

export const SD_CLARIFYING_QUESTIONS = [
  "신흥 시장 지원? → 앱 크기 최적화, 약한 네트워크 대응",
  "예상 사용자 수? → 백엔드 부하, Rate Limiting",
  "팀 규모? → 모듈화 수준 결정 (소규모: 모놀리식 OK)",
  "타겟 OS 버전? → iOS 15+ 라면 async/await 사용 가능",
  "성능 기준? → 피드 로딩 2초 내, 이미지 로딩 1초 내",
  "데이터 일관성? → 채팅은 Strong, 피드는 Eventual",
  "업데이트 빈도? → 실시간(WebSocket) vs 폴링 결정",
  "미디어 종류? → 이미지만? 동영상? → CDN + 트랜스코딩",
];

export const SD_API_COMPARISON = [
  { name: "REST", pros: "단순, 캐싱 쉬움, 상태 없음", cons: "Over-fetching, 여러 요청 필요", bestFor: "CRUD 앱, 간단한 피드" },
  { name: "GraphQL", pros: "필요한 필드만 조회, 1번 요청", cons: "캐싱 복잡, 서버 부하", bestFor: "복잡한 데이터 관계, 피드" },
  { name: "gRPC", pros: "바이너리(빠름), 스트리밍", cons: "디버깅 어려움, iOS 지원 제한", bestFor: "마이크로서비스 간 통신" },
  { name: "WebSocket", pros: "양방향, 실시간", cons: "상태 유지 필요, 확장 어려움", bestFor: "채팅, 실시간 협업" },
];

/* ═══════════════════════════════════════════════════════════ */
/*  DAILY CONTENT PER TAB (각 탭 일별 업데이트)                 */
/* ═══════════════════════════════════════════════════════════ */

export interface DailyTip {
  day: number;
  title: string;
  content: string;
}

/** 사전과제 탭: Day별 실전 팁 */
export const ASSIGNMENT_DAILY_TIPS: DailyTip[] = [
  { day: 1, title: "프로젝트 셋업 체크리스트", content: "Xcode 프로젝트 생성 → Git init → .gitignore → 폴더 구조(Feature별) → 첫 커밋. SPM으로 의존성 추가 전에 '왜 이 라이브러리인지' 메모." },
  { day: 2, title: "아키텍처 결정 기록", content: "MVVM vs MVC 왜 선택했는지 README에 1줄. 면접에서 100% 물어본다. '간단한 과제라 MVC로 충분하지만 확장성을 위해 MVVM 선택' 같은 판단 근거." },
  { day: 3, title: "커밋 전략", content: "feat/fix/refactor 접두어 + 기능 단위 원자적 커밋. '한 커밋에 한 가지 변경'. 면접관이 커밋 히스토리로 사고 과정을 읽는다." },
  { day: 4, title: "에러 핸들링 패턴", content: "네트워크 에러 → 로딩 상태 → 에러 뷰 → 재시도 버튼. Result<Success, Error> 타입으로 명시적 처리. try-catch보다 패턴 매칭이 Swift답다." },
  { day: 5, title: "테스트 전략", content: "ViewModel 로직 Unit Test 3-5개만으로 충분. Mock 프로토콜 만들어서 의존성 주입. 'UserServiceProtocol'을 만들어 실제/Mock 교체 가능하게." },
  { day: 6, title: "README 작성의 기술", content: "'구현하지 못한 부분'을 쓰는 게 합격의 열쇠. 아쉬운 점 + 시간이 있었다면 어떻게 했을지. 면접관은 '자기 한계를 아는 개발자'를 원한다." },
  { day: 7, title: "제출 전 최종 체크", content: "① git clone → 빌드 확인 ② README 설치법 따라하기 ③ 스크린샷/GIF 최신화 ④ 불필요한 print/TODO 제거 ⑤ 마지막 커밋: 'chore: cleanup for submission'." },
];

/** 인성면접 탭: Day별 연습 포인트 */
export const CULTURE_DAILY_TIPS: DailyTip[] = [
  { day: 1, title: "1분 자기소개 완성", content: "역할(iOS 3년 7개월) → 핵심 성과 1개(608건 티켓) → 최근 관심사(AI 오케스트레이션) → 지원 동기. 30초~1분. 키워드 3개만 기억하고 자연스럽게." },
  { day: 2, title: "STAR 프레임 연습", content: "Situation(상황) → Task(과제) → Action(행동) → Result(결과). 오늘 경험 1개를 STAR로 정리. '마케팅 CSV 자동화' 사례가 가장 강력." },
  { day: 3, title: "왜 이 회사인가?", content: "4단계: 알게 된 계기 → 직무 매력 → 나의 경험 연결 → 입사 후 기여. 회사 기술블로그 1편 읽고 공감 포인트 찾기. '안정적이라서'는 자동 탈락." },
  { day: 4, title: "실패 경험 준비", content: "진짜 실패를 말해라. '프롬프트 가드만 믿었다가 Mermaid 에러 반복 → 후처리 sanitizer 추가 → 에러 0건'. 핵심: 실패 → 원인 분석 → 행동 변화 → 결과." },
  { day: 5, title: "갈등 해결 스토리", content: "기술 결정 갈등이 가장 안전. '내가 이겼다'가 아니라 '팀이 더 나은 결정을 했다' 프레임. 데이터 기반 논의 → 합의점 도출 과정을 보여줘라." },
  { day: 6, title: "역질문 3개 준비", content: "① '이 팀의 현재 가장 큰 기술 과제는?' ② '코드 리뷰 문화는?' ③ '이 포지션의 첫 90일 목표는?'. 연봉/휴가 질문은 면접 중엔 하지 마라." },
  { day: 7, title: "모의 인성면접 (녹음)", content: "6개 질문 셀프 답변 녹음 → 재생 → 피드백. 침묵 10초+ 구간, '음...' 반복, 답변이 1-2문장으로 끝나는 구간 체크. 부자연스러운 부분 재연습." },
];

/** 기술면접 탭: Day별 Deep Dive 주제 */
export const TECH_DAILY_TOPICS: DailyTip[] = [
  { day: 1, title: "ARC 완전 정복", content: "Strong/Weak/Unowned 차이를 화이트보드에 그릴 수 있는가? retain cycle 예시 3개(delegate, closure, timer)를 즉석에서 설명할 수 있는가?" },
  { day: 2, title: "GCD vs async/await", content: "DispatchQueue.main.async vs @MainActor 차이. Task, TaskGroup, AsyncSequence 실전 사용법. Actor로 data race 방지하는 코드를 즉석에서 쓸 수 있는가?" },
  { day: 3, title: "앱 라이프사이클 완벽 이해", content: "Not Running → Inactive → Active → Background → Suspended. SceneDelegate vs AppDelegate. didFinishLaunchingWithOptions에서 하면 안 되는 것." },
  { day: 4, title: "UIKit 성능 최적화", content: "TableView/CollectionView 셀 재사용. Prefetching API. 셀 높이 캐싱. 이미지 다운샘플링. Instruments Time Profiler 사용법." },
  { day: 5, title: "네트워킹 Deep Dive", content: "URLSession 구조. URLSessionConfiguration 3종류. Codable 커스터마이징. 인증서 핀닝. 캐시 정책(304 Not Modified)." },
  { day: 6, title: "아키텍처 트레이드오프", content: "MVVM vs Clean Architecture vs RIBs. 각각의 장단점을 프로젝트 규모별로 설명. 'Aidy에서 RIBs를 선택한 이유'를 30초로." },
  { day: 7, title: "시스템 디자인 실전", content: "소셜 피드 or 채팅 or 이미지 로더 중 1개를 45분 내 설계. 요구사항→아키텍처→핵심 컴포넌트→트레이드오프 4단계로." },
];

/* ═══════════════════════════════════════════════════════════ */
/*  CS FUNDAMENTALS (면접 단골 CS + 실무 연결)                  */
/* ═══════════════════════════════════════════════════════════ */

export interface CSTopicGuide {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  question: string;
  visual: string;
  answer: string;
  realWorld: string;
  code?: string;
}

export const CS_TOPICS: CSTopicGuide[] = [
  // ── 운영체제 ──
  {
    id: "cs-process-thread", category: "OS", categoryColor: "#3b82f6",
    title: "프로세스 vs 스레드",
    question: "프로세스와 스레드의 차이를 설명해주세요.",
    visual: `  프로세스 A              프로세스 B
  ┌──────────────┐      ┌──────────────┐
  │ Code         │      │ Code         │
  │ Data         │      │ Data         │  ← 완전 독립!
  │ Heap         │      │ Heap         │
  │ ┌──────────┐ │      │ ┌──────────┐ │
  │ │ Thread 1 │ │      │ │ Thread 1 │ │
  │ │ (Stack)  │ │      │ │ (Stack)  │ │
  │ ├──────────┤ │      │ └──────────┘ │
  │ │ Thread 2 │ │      └──────────────┘
  │ │ (Stack)  │ │
  │ └──────────┘ │
  └──────────────┘
  스레드는 Code/Data/Heap을 공유, Stack만 독립`,
    answer: "프로세스: 독립된 메모리 공간(Code, Data, Heap, Stack). OS가 자원을 할당하는 단위. 프로세스 간 통신(IPC)이 필요. 스레드: 프로세스 내에서 실행되는 흐름. Code/Data/Heap을 공유하고 Stack만 독립. 같은 메모리 공유 → 빠르지만 동기화 문제(Race Condition) 발생.",
    realWorld: "iOS에서 Main Thread(UI) + Background Thread(네트워크/DB). GCD의 DispatchQueue가 스레드를 관리. 메인 스레드 블로킹 = 앱 프리징.",
  },
  {
    id: "cs-deadlock", category: "OS", categoryColor: "#3b82f6",
    title: "데드락 (Deadlock)",
    question: "데드락이 뭔가요? 어떻게 방지하나요?",
    visual: `  Thread A         Thread B
     │                 │
     ├─ Lock(리소스1) ✓   │
     │                 ├─ Lock(리소스2) ✓
     │                 │
     ├─ Lock(리소스2) 대기... │
     │                 ├─ Lock(리소스1) 대기...
     │                 │
     └─── 영원히 대기 ───┘  ← 데드락!`,
    answer: "두 스레드가 서로가 가진 자원을 기다리며 영원히 멈추는 상태. 4가지 조건이 동시에 만족될 때 발생: ①상호 배제 ②점유 대기 ③비선점 ④순환 대기. 방지: 자원 획득 순서 고정, 타임아웃 설정, Lock 계층 구조.",
    realWorld: "iOS에서 DispatchQueue.main.sync를 메인 스레드에서 호출하면 데드락. Serial Queue에서 자기 자신에게 sync 호출해도 데드락. 실무에서 가장 흔한 케이스.",
    code: `// ❌ 데드락! 메인 스레드에서 메인 큐에 sync
DispatchQueue.main.sync {
    print("이 코드는 영원히 실행되지 않음")
}

// ✅ 해결: async 사용
DispatchQueue.main.async {
    print("안전하게 실행됨")
}

// ❌ 데드락! Serial Queue에서 자기 자신에 sync
let queue = DispatchQueue(label: "my.queue")
queue.async {
    queue.sync { // 여기서 데드락!
        print("실행 안 됨")
    }
}`,
  },
  {
    id: "cs-virtual-memory", category: "OS", categoryColor: "#3b82f6",
    title: "가상 메모리",
    question: "가상 메모리가 뭔가요? iOS에서 어떻게 동작하나요?",
    visual: `  가상 주소 공간          물리 메모리
  ┌────────────┐       ┌────────────┐
  │ Page 0     │ ──→   │ Frame 3    │
  │ Page 1     │ ──→   │ Frame 7    │
  │ Page 2     │ ──→   │ (디스크)    │ ← Page Fault!
  │ Page 3     │ ──→   │ Frame 1    │
  └────────────┘       └────────────┘
  각 앱은 자기만의 가상 주소 공간을 가짐`,
    answer: "물리 메모리보다 큰 주소 공간을 제공하는 기법. 각 프로세스는 독립된 가상 주소 공간을 가짐. 페이지 단위로 물리 메모리에 매핑. 사용하지 않는 페이지는 디스크에 저장(Swap). 접근 시 Page Fault → 디스크에서 로드.",
    realWorld: "iOS는 Swap이 없다 (플래시 메모리 수명 보호). 대신 메모리 압박 시 앱을 강제 종료(Jetsam). 따라서 iOS 개발자는 메모리 관리가 더 중요. didReceiveMemoryWarning에서 캐시 해제 필수.",
  },
  // ── 네트워크 ──
  {
    id: "cs-tcp-udp", category: "Network", categoryColor: "#10b981",
    title: "TCP vs UDP",
    question: "TCP와 UDP의 차이를 설명해주세요.",
    visual: `  TCP (전화 통화)              UDP (편지)
  ┌─────────────────┐      ┌─────────────────┐
  │ 1. 연결 (3-way)  │      │ 그냥 보낸다!      │
  │ 2. 데이터 전송    │      │ 도착 확인 X       │
  │ 3. 확인 응답(ACK) │      │ 순서 보장 X       │
  │ 4. 재전송(손실 시) │      │ 빠름!            │
  │ 5. 연결 해제      │      └─────────────────┘
  └─────────────────┘
  신뢰성 ↑ 속도 ↓          신뢰성 ↓ 속도 ↑`,
    answer: "TCP: 연결 지향, 3-way handshake, 순서 보장, 재전송, 흐름/혼잡 제어. 신뢰성 높지만 느림. HTTP, HTTPS, WebSocket이 TCP 기반. UDP: 비연결, 순서/도착 보장 안 함. 빠르고 가벼움. DNS, 동영상 스트리밍, 게임에 적합.",
    realWorld: "iOS 앱의 URLSession = TCP 기반. 실시간 동영상 = UDP(HLS는 TCP지만). WebSocket = TCP 위에서 양방향. 채팅 앱은 TCP(메시지 손실 불가), 화상 통화는 UDP(약간의 손실 OK).",
  },
  {
    id: "cs-http-https", category: "Network", categoryColor: "#10b981",
    title: "HTTP vs HTTPS + TLS",
    question: "HTTPS는 어떻게 보안을 보장하나요?",
    visual: `  HTTP                    HTTPS
  Client → 평문 → Server   Client → 암호문 → Server
  "password123"             "x8k#2mQ..."

  TLS Handshake:
  Client ──→ "Hello + 지원 암호화 목록"
         ←── "인증서 + 공개키"
  Client ──→ "이 공개키로 암호화한 세션키"
         ←── "세션키로 암호화 통신 시작"`,
    answer: "HTTPS = HTTP + TLS(Transport Layer Security). TLS Handshake로 세션키 교환: ①클라이언트 Hello ②서버 인증서+공개키 ③클라이언트가 세션키를 공개키로 암호화하여 전송 ④이후 세션키로 대칭 암호화 통신. 인증서로 서버 신원 확인.",
    realWorld: "iOS ATS(App Transport Security)가 HTTPS 강제. 인증서 핀닝: 특정 인증서만 신뢰하여 MITM 공격 방지. URLSession의 serverTrust를 검증하는 패턴.",
    code: `// iOS 인증서 핀닝 (URLSessionDelegate)
func urlSession(_ session: URLSession,
    didReceive challenge: URLAuthenticationChallenge,
    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {

    guard let serverTrust = challenge.protectionSpace.serverTrust,
          let certificate = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
        completionHandler(.cancelAuthenticationChallenge, nil)
        return
    }

    // 서버 인증서와 로컬 인증서 비교
    let serverCertData = SecCertificateCopyData(certificate) as Data
    let localCertData = pinnedCertificateData

    if serverCertData == localCertData {
        completionHandler(.useCredential,
            URLCredential(trust: serverTrust))
    } else {
        completionHandler(.cancelAuthenticationChallenge, nil)
    }
}`,
  },
  {
    id: "cs-rest-api", category: "Network", categoryColor: "#10b981",
    title: "REST API 상태 코드",
    question: "자주 쓰는 HTTP 상태 코드를 설명해주세요.",
    visual: `  2xx 성공          3xx 리다이렉션
  200 OK             301 영구 이동
  201 Created        304 Not Modified (캐시 사용)
  204 No Content

  4xx 클라이언트 에러   5xx 서버 에러
  400 Bad Request     500 Internal Server Error
  401 Unauthorized    502 Bad Gateway
  403 Forbidden       503 Service Unavailable
  404 Not Found
  429 Too Many Requests`,
    answer: "2xx: 성공. 200(OK), 201(생성됨), 204(본문 없음). 3xx: 리다이렉션. 301(영구 이동), 304(캐시 유효). 4xx: 클라이언트 잘못. 400(잘못된 요청), 401(인증 필요), 403(권한 없음), 404(없음), 429(요청 과다). 5xx: 서버 잘못. 500(내부 에러), 503(과부하).",
    realWorld: "iOS에서 401 → 토큰 갱신 후 재요청. 429 → Exponential Backoff로 재시도. 304 → URLCache 활용. 500 → 사용자에게 에러 표시 + 재시도 버튼.",
  },
  // ── 자료구조 ──
  {
    id: "cs-array-linkedlist", category: "자료구조", categoryColor: "#8b5cf6",
    title: "배열 vs 연결리스트",
    question: "배열과 연결리스트의 차이를 설명해주세요.",
    visual: `  배열 (Array)                연결리스트 (LinkedList)
  ┌───┬───┬───┬───┬───┐    ┌───┐   ┌───┐   ┌───┐
  │ 1 │ 2 │ 3 │ 4 │ 5 │    │ 1 │→  │ 3 │→  │ 5 │→ nil
  └───┴───┴───┴───┴───┘    └───┘   └───┘   └───┘
  메모리 연속 할당            메모리 분산, 포인터로 연결

  접근: O(1) vs O(n)
  삽입: O(n) vs O(1) (노드 알 때)
  검색: O(n) vs O(n)`,
    answer: "배열: 연속된 메모리, 인덱스로 O(1) 접근, 삽입/삭제 시 O(n)(요소 이동). 크기 고정(동적 배열은 재할당). 연결리스트: 노드+포인터, 접근 O(n), 삽입/삭제 O(1)(노드를 알 때). 메모리 분산 할당.",
    realWorld: "Swift Array는 동적 배열(내부적으로 연속 메모리). 대부분 Array로 충분. LinkedList는 UINavigationController의 뷰 스택, Undo 히스토리 같은 곳에 개념적으로 사용.",
  },
  {
    id: "cs-hashtable", category: "자료구조", categoryColor: "#8b5cf6",
    title: "해시테이블 + 충돌 해결",
    question: "해시테이블의 원리와 충돌 해결법을 설명해주세요.",
    visual: `  key "apple" → hash(apple) = 3
  key "banana" → hash(banana) = 7
  key "cherry" → hash(cherry) = 3  ← 충돌!

  Chaining (체이닝):
  [0] →
  [1] →
  [2] →
  [3] → [apple:3] → [cherry:5]  ← 연결리스트
  [7] → [banana:2]

  Open Addressing (개방 주소법):
  [3] = apple  →  cherry는 [4]에 저장 (다음 빈 칸)`,
    answer: "해시 함수로 key를 인덱스로 변환 → O(1) 접근. 충돌 해결: ①Chaining: 같은 인덱스에 연결리스트로 저장 ②Open Addressing: 다음 빈 칸에 저장 (Linear Probing). Swift Dictionary는 Open Addressing + Robin Hood Hashing 사용.",
    realWorld: "Swift Dictionary/Set = 해시테이블. Hashable 프로토콜 채택 필수. 커스텀 타입을 Dictionary key로 쓰려면 hash(into:) 구현. 좋은 해시 함수 = 균일 분포 = 충돌 최소화.",
    code: `// Swift에서 커스텀 타입을 Dictionary key로
struct User: Hashable {
    let id: Int
    let name: String

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)  // id만으로 해싱 (고유값)
    }

    static func == (lhs: User, rhs: User) -> Bool {
        return lhs.id == rhs.id
    }
}

var userScores: [User: Int] = [:]
userScores[User(id: 1, name: "Mino")] = 100  // O(1)`,
  },
  // ── 데이터베이스 ──
  {
    id: "cs-index", category: "DB", categoryColor: "#f59e0b",
    title: "데이터베이스 인덱스",
    question: "DB 인덱스가 뭔가요? 왜 빨라지나요?",
    visual: `  인덱스 없이:    모든 행을 순서대로 검색 (Full Scan)
  ┌───────────────────────────┐
  │ id=1, name=Kim    ← 확인  │
  │ id=2, name=Lee    ← 확인  │
  │ id=3, name=Park   ← 확인  │  O(n)
  │ ...100만 행...     ← 확인  │
  └───────────────────────────┘

  인덱스 있으면: B-Tree로 바로 찾기
  ┌─────────┐
  │   Park   │  → 3번만에 찾음!  O(log n)
  ├────┬────┤
  │Kim │Lee │
  └────┴────┘`,
    answer: "인덱스 = 데이터의 목차. B-Tree(또는 B+Tree) 구조로 O(log n) 검색. 원리: 정렬된 별도 자료구조가 실제 데이터 위치를 가리킴. 장점: SELECT 빠름. 단점: INSERT/UPDATE 시 인덱스도 갱신 → 쓰기 느려짐. 저장 공간 추가 필요.",
    realWorld: "iOS CoreData의 indexed 속성. SQLite(Realm 내부)의 CREATE INDEX. 자주 검색하는 컬럼에만 인덱스 생성. 모든 컬럼에 인덱스 = 오히려 느려짐 (쓰기 오버헤드).",
  },
  {
    id: "cs-acid", category: "DB", categoryColor: "#f59e0b",
    title: "트랜잭션 ACID",
    question: "ACID가 뭔가요?",
    visual: `  은행 이체: A계좌 → B계좌 100만원

  Atomicity  (원자성)  : 출금+입금 둘 다 성공하거나 둘 다 실패
  Consistency(일관성)  : 이체 전후 총액은 동일
  Isolation  (격리성)  : 다른 이체가 끼어들지 못함
  Durability (지속성)  : 완료된 이체는 서버가 꺼져도 유지`,
    answer: "Atomicity(원자성): 전부 성공 또는 전부 실패 (all or nothing). Consistency(일관성): 트랜잭션 전후 데이터 무결성 유지. Isolation(격리성): 동시 트랜잭션이 서로 간섭 안 함. Durability(지속성): 커밋된 데이터는 영구 저장.",
    realWorld: "CoreData의 performAndWait 블록 = 트랜잭션. Realm의 write 블록 = 원자적. 결제 처리: 재고 감소 + 주문 생성이 하나의 트랜잭션이어야 함.",
  },
  // ── 디자인 패턴 ──
  {
    id: "cs-singleton", category: "패턴", categoryColor: "#ef4444",
    title: "싱글톤 패턴",
    question: "싱글톤 패턴을 설명하고, 장단점을 말해주세요.",
    visual: `  앱 전체에서 단 하나의 인스턴스만 존재

  class APIClient {
      static let shared = APIClient()  // 유일한 인스턴스
      private init() {}                 // 외부 생성 차단
  }

  APIClient.shared  ← 어디서든 같은 인스턴스`,
    answer: "앱 전체에서 인스턴스가 딱 1개. static let + private init으로 구현. 장점: 전역 접근, 자원 공유, 일관된 상태. 단점: 테스트 어려움 (Mock 교체 힘듦), 숨은 의존성, 멀티스레드 주의. 대안: 의존성 주입(DI)으로 교체 가능하게.",
    realWorld: "iOS 표준: URLSession.shared, FileManager.default, UserDefaults.standard, NotificationCenter.default. 실무에서는 프로토콜로 추상화 → 테스트 시 Mock 주입 패턴이 더 좋음.",
    code: `// 싱글톤 + 프로토콜 추상화 (테스트 가능하게)
protocol NetworkServiceProtocol {
    func fetch(url: URL) async throws -> Data
}

class NetworkService: NetworkServiceProtocol {
    static let shared = NetworkService()
    private init() {}

    func fetch(url: URL) async throws -> Data {
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
}

// 테스트에서 Mock 교체
class MockNetworkService: NetworkServiceProtocol {
    func fetch(url: URL) async throws -> Data {
        return testData  // 네트워크 없이 테스트!
    }
}`,
  },
  {
    id: "cs-observer", category: "패턴", categoryColor: "#ef4444",
    title: "옵저버 패턴 + Combine",
    question: "옵저버 패턴을 iOS에서 어떻게 사용하나요?",
    visual: `  Subject (발행자)          Observer (구독자)
  ┌─────────────┐         ┌──────────┐
  │ 상태 변경!    │ ──→     │ 업데이트! │
  │             │ ──→     │ 업데이트! │
  │             │ ──→     │ 업데이트! │
  └─────────────┘         └──────────┘
  1 대 N 관계: 하나가 변하면 여럿이 반응`,
    answer: "한 객체(Subject)의 상태가 변하면 의존 객체들(Observer)에게 자동 통지. iOS 구현 4가지: ①NotificationCenter (1:N 브로드캐스트) ②KVO (프로퍼티 관찰) ③Combine Publisher/Subscriber ④Delegate (1:1). Combine이 가장 현대적.",
    realWorld: "NotificationCenter: 키보드 높이 변화 감지. KVO: WKWebView 로딩 진행률. Combine: ViewModel → View 데이터 바인딩. @Published + sink 패턴이 SwiftUI의 기본.",
    code: `// Combine으로 옵저버 패턴
import Combine

class ViewModel: ObservableObject {
    @Published var items: [String] = []  // 발행자
    @Published var isLoading = false
}

// View에서 구독
class ViewController: UIViewController {
    private var cancellables = Set<AnyCancellable>()

    func bind(viewModel: ViewModel) {
        viewModel.$items
            .receive(on: DispatchQueue.main)
            .sink { [weak self] items in
                self?.tableView.reloadData()  // 자동 업데이트!
            }
            .store(in: &cancellables)
    }
}`,
  },
  // ── 경력직 심화: 메모리 ──
  {
    id: "cs-cow", category: "메모리 심화", categoryColor: "#ec4899",
    title: "Copy-on-Write (CoW)",
    question: "Swift의 Copy-on-Write 메커니즘을 설명해주세요.",
    visual: `  var a = [1, 2, 3]
  var b = a           ← 이 시점에는 복사 안 함! (같은 메모리)

  ┌─────────┐
  │ [1,2,3] │ ← a, b 둘 다 같은 곳을 가리킴
  └─────────┘

  b.append(4)         ← 이 시점에 비로소 복사!

  ┌─────────┐    ┌───────────┐
  │ [1,2,3] │    │ [1,2,3,4] │
  └─────────┘    └───────────┘
      a               b`,
    answer: "값 타입(Array, Dictionary, String 등)을 복사할 때 즉시 메모리를 복제하지 않고, 수정이 발생하는 시점에만 복사. isKnownUniquelyReferenced로 참조 카운트가 1인지 확인 → 1이면 복사 불필요(유일 소유). 커스텀 CoW 구현 시 이 함수 활용.",
    realWorld: "Swift Array/Dictionary/String 모두 CoW. 함수 인자로 큰 배열을 넘겨도 수정 안 하면 복사 비용 0. 성능 면접에서 '값 타입인데 왜 느리지 않나?'에 대한 핵심 답변.",
    code: `// CoW 확인 실험
var a = [1, 2, 3]
var b = a

// 메모리 주소 비교 (같은 버퍼)
print(a.withUnsafeBufferPointer { $0.baseAddress! })
print(b.withUnsafeBufferPointer { $0.baseAddress! })
// → 같은 주소!

b.append(4)  // 이 시점에 복사 발생

print(a.withUnsafeBufferPointer { $0.baseAddress! })
print(b.withUnsafeBufferPointer { $0.baseAddress! })
// → 다른 주소!

// 커스텀 CoW 구현
final class Ref<T> { var value: T; init(_ v: T) { value = v } }

struct CoWWrapper<T> {
    private var ref: Ref<T>
    init(_ value: T) { ref = Ref(value) }

    var value: T {
        get { ref.value }
        set {
            if !isKnownUniquelyReferenced(&ref) {
                ref = Ref(newValue)  // 복사!
            } else {
                ref.value = newValue  // 수정만
            }
        }
    }
}`,
  },
  // ── 경력직 심화: 동시성 ──
  {
    id: "cs-mutex-semaphore", category: "동시성 심화", categoryColor: "#f97316",
    title: "Mutex vs Semaphore",
    question: "Mutex와 Semaphore의 차이를 설명하고 iOS에서 어떻게 사용하나요?",
    visual: `  Mutex (화장실 열쇠 1개)       Semaphore (주차장 N칸)
  ┌──────────────────┐      ┌──────────────────┐
  │ Thread A: Lock ✓  │      │ Thread A: wait ✓ │
  │ Thread B: 대기... │      │ Thread B: wait ✓ │  N=3
  │ Thread C: 대기... │      │ Thread C: wait ✓ │
  │                  │      │ Thread D: 대기... │  ← 꽉 참!
  │ A: Unlock → B 진입│      │ A: signal → D 진입│
  └──────────────────┘      └──────────────────┘
  1개만 진입               N개 동시 진입`,
    answer: "Mutex: 1개 스레드만 임계 영역 진입. 소유권 있음 (Lock한 스레드만 Unlock 가능). Semaphore: N개 스레드 동시 진입. 소유권 없음 (누구나 signal 가능). Binary Semaphore(N=1) ≈ Mutex. iOS: os_unfair_lock(가장 빠른 Mutex), DispatchSemaphore(Semaphore).",
    realWorld: "네트워크 동시 요청 제한: DispatchSemaphore(value: 5) → 최대 5개 동시. DB 접근 직렬화: Serial DispatchQueue (사실상 Mutex). Actor = Swift의 현대적 Mutex.",
    code: `// Mutex 대용: os_unfair_lock (가장 빠름)
import os
var lock = os_unfair_lock()
os_unfair_lock_lock(&lock)
// critical section
os_unfair_lock_unlock(&lock)

// Semaphore: 동시 요청 3개 제한
let semaphore = DispatchSemaphore(value: 3)

for url in urls {
    DispatchQueue.global().async {
        semaphore.wait()    // 카운터 -1 (0이면 대기)
        fetchData(url) {
            semaphore.signal()  // 카운터 +1
        }
    }
}

// Actor: Swift의 현대적 동시성 보호
actor BankAccount {
    private var balance: Int = 0
    func deposit(_ amount: Int) { balance += amount }
    func getBalance() -> Int { balance }
}
// await account.deposit(100)  ← 자동 직렬화`,
  },
  {
    id: "cs-priority-inversion", category: "동시성 심화", categoryColor: "#f97316",
    title: "Priority Inversion (우선순위 역전)",
    question: "Priority Inversion이 뭔가요? iOS에서 어떻게 대응하나요?",
    visual: `  High ────→ [Lock 대기...] ──→ 실행
                  ↑
  Mid  ────→ [실행 중] ──→ 끝  ← 이놈이 끼어듦!
                  ↓
  Low  ────→ [Lock 보유 중...] ──→ 해제

  High가 Low를 기다리는데, Mid가 Low보다 먼저 실행
  → High가 Mid보다 늦게 실행됨 = 우선순위 역전!`,
    answer: "높은 우선순위 작업이 낮은 우선순위 작업의 리소스(Lock)를 기다리는 중, 중간 우선순위 작업이 낮은 우선순위를 선점하여 결과적으로 높은 우선순위 작업이 밀리는 현상. GCD는 자동으로 Lock 보유 스레드의 QoS를 일시 상향(Priority Inheritance)하여 해결.",
    realWorld: "iOS에서 .userInteractive 큐에서 .utility 큐의 자원을 기다리면 발생. 예방: 공유 자원은 같은 QoS 큐에서 접근. Actor 사용 시 자동 해결. 실무에서 스크롤 버벅임의 숨은 원인일 수 있음.",
  },
  // ── 경력직 심화: 네트워크 ──
  {
    id: "cs-http2-http3", category: "네트워크 심화", categoryColor: "#06b6d4",
    title: "HTTP/2 vs HTTP/3 + QUIC",
    question: "HTTP/2와 HTTP/3의 차이, 모바일에서 HTTP/3이 중요한 이유?",
    visual: `  HTTP/1.1          HTTP/2              HTTP/3
  ┌────────┐      ┌────────┐         ┌────────┐
  │ 요청1   │      │ 요청1 ─┐│         │ 요청1   │
  │ 응답1   │      │ 요청2  ││ 멀티    │ 요청2   │ UDP
  │ 요청2   │      │ 요청3  ││ 플렉싱  │ 요청3   │ (QUIC)
  │ 응답2   │      │ 응답들 ─┘│         │ 각각독립│
  └────────┘      └────────┘         └────────┘
  순차적           1연결 N스트림      스트림 독립
  (느림)          (TCP HoL 문제)     (패킷손실 격리)`,
    answer: "HTTP/2: TCP 위에서 멀티플렉싱(1연결 N스트림). 하지만 TCP 수준 Head-of-Line Blocking 여전. HTTP/3: UDP 기반 QUIC 프로토콜. 스트림 독립 처리 → 패킷 손실 시 다른 스트림에 영향 없음. 0-RTT 연결 재개. WiFi→LTE 전환 시 연결 유지(Connection Migration).",
    realWorld: "iOS 15+에서 URLSession이 HTTP/3 자동 지원. 모바일에서 중요한 이유: ①네트워크 전환(WiFi↔셀룰러) 시 연결 끊김 없음 ②약한 네트워크에서 패킷 손실 격리 ③앱 시작 시 0-RTT로 빠른 연결.",
  },
  // ── 경력직 심화: 보안 ──
  {
    id: "cs-encryption", category: "보안", categoryColor: "#dc2626",
    title: "대칭키 vs 비대칭키 + 해싱",
    question: "암호화의 종류와 iOS에서 각각 어떻게 사용하나요?",
    visual: `  대칭키 (AES)              비대칭키 (RSA)
  ┌──────────────────┐    ┌──────────────────┐
  │ 같은 키로           │    │ 공개키로 암호화     │
  │ 암호화 + 복호화     │    │ 개인키로 복호화     │
  │ 빠름! 키 배포 어려움 │    │ 느림! 키 배포 쉬움  │
  └──────────────────┘    └──────────────────┘

  해싱 (SHA-256)           단방향! 복호화 불가
  "password" → "5e884898da..."
  같은 입력 → 항상 같은 출력 (검증용)`,
    answer: "대칭키(AES-256): 암복호화 같은 키. 빠름. 키 배포 어려움 → TLS에서 세션키로 사용. 비대칭키(RSA/ECDSA): 공개키+개인키 쌍. 느림. TLS Handshake에서 세션키 교환에 사용. 해싱(SHA-256, bcrypt): 단방향. 비밀번호 저장, 무결성 검증. bcrypt는 의도적으로 느림(brute force 방지).",
    realWorld: "iOS Keychain = AES-256 암호화. TLS = 비대칭키로 세션키 교환 → 대칭키로 통신. 비밀번호 저장: 서버에서 bcrypt 해싱 (앱에서 평문 전송 → HTTPS가 보호). API 토큰: Keychain 저장 (UserDefaults 절대 금지).",
  },
  // ── 경력직 심화: 컴파일러/런타임 ──
  {
    id: "cs-dispatch", category: "런타임", categoryColor: "#a855f7",
    title: "정적 디스패치 vs 동적 디스패치",
    question: "Swift에서 정적/동적 디스패치의 차이와 성능 영향?",
    visual: `  정적 디스패치 (struct, final class)
  컴파일 타임에 호출할 함수 결정
  → 직접 점프 (빠름!)

  동적 디스패치 (class)
  런타임에 vtable에서 함수 포인터 찾기
  ┌──────────┐
  │ vtable   │
  │ func1 → ──→ 실제 함수 위치
  │ func2 → ──→ 실제 함수 위치
  └──────────┘
  → 간접 점프 (약 2배 느림)`,
    answer: "정적: 컴파일 타임에 호출 함수 결정. struct, enum, final class, private 메서드. 인라이닝 최적화 가능. 동적: 런타임에 vtable/witness table 조회. class의 일반 메서드. 오버라이드 가능하려면 동적이어야. final/private 키워드로 동적→정적 전환 가능 → 성능 개선.",
    realWorld: "성능 민감한 코드(Collection 순회, 이미지 처리)는 struct + protocol 조합으로 정적 디스패치. class에 final 붙이면 동적→정적. Whole Module Optimization(-WMO)이 자동으로 final 추론해줌.",
    code: `// 동적 디스패치 (class)
class Animal {
    func speak() { print("...") }  // vtable 조회
}
class Dog: Animal {
    override func speak() { print("Woof") }
}

// 정적 디스패치로 바꾸기
final class Cat {  // final → 정적!
    func speak() { print("Meow") }
}

// struct = 항상 정적
struct Bird {
    func speak() { print("Tweet") }  // 직접 호출
}

// protocol + generic = 정적 (specialization)
func makeSound<T: Animal>(_ animal: T) {
    animal.speak()  // 컴파일러가 타입 알면 정적 디스패치
}`,
  },
  {
    id: "cs-compile", category: "런타임", categoryColor: "#a855f7",
    title: "Swift 컴파일 과정",
    question: "Swift 소스코드가 실행파일이 되기까지의 과정?",
    visual: `  .swift 파일
      ↓ Parsing
    AST (추상 구문 트리)
      ↓ Semantic Analysis (타입 체크)
    Type-checked AST
      ↓ SIL Generation
    SIL (Swift Intermediate Language)
      ↓ SIL Optimization (ARC 최적화 등)
    Optimized SIL
      ↓ LLVM IR Generation
    LLVM IR
      ↓ LLVM Backend
    Machine Code (.o)
      ↓ Linker
    실행파일 / .app`,
    answer: "1단계: Parsing → AST. 2단계: Type Checking (여기서 대부분 컴파일 에러). 3단계: SIL 생성 (ARC retain/release 삽입, 제네릭 특수화). 4단계: SIL 최적화 (불필요 retain/release 제거). 5단계: LLVM IR → Machine Code. SIL이 핵심 — Swift만의 중간 표현으로 ARC/제네릭 최적화.",
    realWorld: "빌드 속도 개선: Incremental Compilation(변경 파일만), Whole Module Optimization(릴리즈 시). dSYM: 크래시 로그 심볼리케이션에 필수. Bitcode: Apple이 디바이스별 재최적화 (App Thinning).",
  },
  // ── 경력직 심화: 함수형 ──
  {
    id: "cs-pure-function", category: "함수형", categoryColor: "#14b8a6",
    title: "순수함수 + flatMap vs map",
    question: "순수함수란? flatMap과 map의 차이를 Optional과 Array 관점에서?",
    visual: `  map:     [1, 2, 3].map { [$0, $0*10] }
           → [[1,10], [2,20], [3,30]]  ← 중첩!

  flatMap: [1, 2, 3].flatMap { [$0, $0*10] }
           → [1, 10, 2, 20, 3, 30]     ← 평탄화!

  Optional:
  let x: String? = "123"
  x.map { Int($0) }     → Optional(Optional(123))  ← 이중!
  x.flatMap { Int($0) } → Optional(123)             ← 평탄!`,
    answer: "순수함수: 같은 입력 → 항상 같은 출력 + 부작용(Side Effect) 없음. 테스트/추론 용이. map: 변환 함수 적용, 구조 유지. T→U. flatMap: 변환 + 평탄화. T→Container<U>를 Container<U>로. Optional에서 flatMap = 이중 Optional 방지. compactMap = nil 제거.",
    realWorld: "SwiftUI: @State 변경이 순수함수적으로 View body를 재계산. Combine: Publisher 체인이 map/flatMap으로 구성. 실무 규칙: ViewModel 로직은 순수함수로, Side Effect(네트워크/DB)는 Repository에 격리.",
    code: `// 순수함수 vs 비순수함수
// ✅ 순수: 같은 입력 → 같은 출력
func double(_ x: Int) -> Int { x * 2 }

// ❌ 비순수: 외부 상태 변경
var total = 0
func addToTotal(_ x: Int) { total += x }

// map vs flatMap (Array)
let nested = [[1,2], [3,4], [5,6]]
nested.map { $0 }      // [[1,2], [3,4], [5,6]]
nested.flatMap { $0 }   // [1, 2, 3, 4, 5, 6]

// map vs flatMap (Optional)
let str: String? = "42"
str.map { Int($0) }     // Optional(Optional(42)) 🤔
str.flatMap { Int($0) }  // Optional(42) ✅

// compactMap = nil 제거
["1", "two", "3"].compactMap { Int($0) }  // [1, 3]`,
  },
];

/** CS 탭: Day별 학습 주제 */
export const CS_DAILY_TOPICS: DailyTip[] = [
  { day: 1, title: "프로세스 vs 스레드 완벽 정리", content: "프로세스는 독립 메모리 공간, 스레드는 공유. iOS에서 Main Thread 블로킹 = 앱 프리징. GCD로 스레드 관리하는 이유를 설명할 수 있는가?" },
  { day: 2, title: "TCP/UDP + HTTP/HTTPS", content: "TCP는 전화(신뢰), UDP는 편지(빠름). HTTPS의 TLS Handshake 과정을 3줄로 설명할 수 있는가? iOS ATS가 HTTPS를 강제하는 이유." },
  { day: 3, title: "해시테이블 + 충돌 해결", content: "Dictionary가 O(1)인 이유. Chaining vs Open Addressing. Swift Hashable 프로토콜을 직접 구현해본 경험? hash(into:) 왜 필요한가?" },
  { day: 4, title: "데드락 + 동시성 문제", content: "DispatchQueue.main.sync 데드락 즉석 설명. Race Condition 해결 3가지: Serial Queue, Lock, Actor. 실무에서 겪은 동시성 버그 경험 1개 준비." },
  { day: 5, title: "데이터베이스 인덱스 + ACID", content: "B-Tree 인덱스가 왜 빠른지. CoreData에서 indexed 속성 사용 경험. 트랜잭션 ACID 4가지를 은행 이체로 설명." },
  { day: 6, title: "디자인 패턴: 싱글톤 + 옵저버", content: "싱글톤의 장단점. URLSession.shared가 싱글톤인 이유. Combine @Published가 옵저버 패턴인 이유. 테스트 가능한 싱글톤 만드는 법." },
  { day: 7, title: "가상 메모리 + iOS 메모리 관리", content: "iOS에 Swap이 없는 이유(플래시 수명). Jetsam이 앱을 죽이는 기준. didReceiveMemoryWarning 대응. Instruments Allocations 사용법." },
  { day: 8, title: "Copy-on-Write 심화", content: "Swift Array/String이 값 타입인데 느리지 않은 이유. isKnownUniquelyReferenced 동작 원리. 커스텀 CoW 구현 코드를 즉석에서 쓸 수 있는가?" },
  { day: 9, title: "Mutex vs Semaphore 실전", content: "os_unfair_lock vs DispatchSemaphore 차이. 네트워크 동시 요청 5개 제한 코드. Actor가 Mutex를 대체하는 이유." },
  { day: 10, title: "Priority Inversion 이해", content: "High→Low 기다리는 중 Mid가 끼어드는 시나리오. GCD Priority Inheritance 자동 해결 원리. 실무에서 스크롤 버벅임의 숨은 원인." },
  { day: 11, title: "HTTP/2 vs HTTP/3 + QUIC", content: "멀티플렉싱이란? TCP HoL Blocking이 뭔지. QUIC이 UDP 기반인 이유. iOS 15+에서 HTTP/3 자동 지원. WiFi↔LTE 전환 시 연결 유지." },
  { day: 12, title: "암호화 종류 + iOS 보안", content: "대칭키(AES) vs 비대칭키(RSA) 선택 기준. TLS에서 둘 다 쓰는 이유. bcrypt가 의도적으로 느린 이유. Keychain vs UserDefaults 보안 차이." },
  { day: 13, title: "정적 vs 동적 디스패치 + 컴파일", content: "struct=정적(빠름), class=동적(vtable). final/private으로 정적 전환. Swift 컴파일 6단계(AST→SIL→LLVM→Machine Code). WMO 최적화." },
  { day: 14, title: "순수함수 + map/flatMap 완벽 이해", content: "순수함수의 정의와 테스트 이점. map vs flatMap vs compactMap 차이를 Optional/Array 각각에서. SwiftUI가 함수형인 이유." },
];
