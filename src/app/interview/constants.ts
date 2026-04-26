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
