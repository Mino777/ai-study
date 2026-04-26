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

/* ═══════════════════════════════════════════════════════════ */
/*  FDE-SPECIFIC CONTENT (트랙별 차별화)                        */
/* ═══════════════════════════════════════════════════════════ */

/** FDE용 알고리즘 템플릿 (Python) — iOS는 기존 Swift 사용 */
export const FDE_ALGO_TEMPLATES: Record<string, { code: string; lang: string }> = {
  hash: { lang: "python", code: `# 딕셔너리로 빈도수 세기 + 두 수의 합
from collections import Counter

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Counter로 빈도수
freq = Counter([1, 2, 2, 3, 3, 3])
# Counter({3: 3, 2: 2, 1: 1})` },
  "two-pointers": { lang: "python", code: `def two_sum_sorted(arr, target):
    arr.sort()
    left, right = 0, len(arr) - 1

    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return [arr[left], arr[right]]
        elif total < target:
            left += 1
        else:
            right -= 1
    return None` },
  "sliding-window": { lang: "python", code: `def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum` },
  bfs: { lang: "python", code: `from collections import deque

def bfs(graph, start, target):
    queue = deque([(start, 0)])
    visited = {start}

    while queue:
        node, dist = queue.popleft()
        if node == target:
            return dist
        for next_node in graph[node]:
            if next_node not in visited:
                visited.add(next_node)
                queue.append((next_node, dist + 1))
    return -1` },
  dp: { lang: "python", code: `# Bottom-up DP
def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# 2D DP 예시: 격자 경로
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]` },
};

/** FDE용 사전과제 Daily Tips */
export const FDE_ASSIGNMENT_DAILY_TIPS: DailyTip[] = [
  { day: 1, title: "풀스택 과제 셋업", content: "React/Next.js + API 서버 셋업. Docker Compose로 로컬 환경 구성. 면접관이 'docker compose up' 한 번으로 실행 가능해야. README에 환경 변수 설정법 명시." },
  { day: 2, title: "데이터 모델링 먼저", content: "코드 전에 ERD 그리기. 테이블 관계, 인덱스 전략 문서화. '왜 이 스키마를 선택했는지' 면접에서 반드시 물어본다. 정규화 vs 비정규화 트레이드오프." },
  { day: 3, title: "API 설계 문서", content: "Swagger/OpenAPI 또는 README에 API 명세. 엔드포인트, 요청/응답 형식, 에러 코드. FDE는 '문서화 능력'이 iOS보다 더 중요하게 평가됨." },
  { day: 4, title: "데이터 파이프라인 과제", content: "ETL 과제 시: 입력 데이터 검증(스키마 체크) → 변환(정제/집계) → 적재(DB/파일). 에러 핸들링과 로깅이 핵심 평가 항목. 부분 실패 대응 보여주기." },
  { day: 5, title: "대시보드 과제", content: "차트/테이블로 데이터 시각화. 핵심: '데이터가 말하는 것'을 이해하고 표현. 필터/검색 기능 + 반응형 레이아웃. Recharts/Visx 등 라이브러리 활용." },
  { day: 6, title: "AI 통합 과제 대비", content: "LLM API 호출 과제 시: 프롬프트 설계 + 출력 검증 + 에러 폴백. 'AI가 틀린 답을 줄 때 어떻게 하나?'가 FDE의 핵심 차별점. Harness 패턴 적용." },
  { day: 7, title: "제출 전: 고객 관점 체크", content: "FDE 과제 평가 기준: '고객이 이걸 받으면 만족할까?'. 기술 완성도 + 사용자 경험 + 문서 품질 3가지. 데모 시나리오 1개를 README에 포함." },
];

/** FDE용 CS Daily Topics */
export const FDE_CS_DAILY_TOPICS: DailyTip[] = [
  { day: 1, title: "분산 시스템 기초", content: "CAP 정리: Consistency, Availability, Partition Tolerance 중 2개만 선택 가능. FDE가 고객에게 설명할 수 있어야. 'DB가 2대인데 하나가 죽으면?' 시나리오." },
  { day: 2, title: "캐싱 전략 (Redis/CDN)", content: "Cache-Aside vs Write-Through vs Write-Behind. TTL 설정. 캐시 무효화(Invalidation)가 CS에서 가장 어려운 문제인 이유. Redis vs Memcached 선택 기준." },
  { day: 3, title: "로드 밸런싱", content: "Round Robin vs Least Connections vs IP Hash. L4 vs L7 로드밸런서 차이. 고객사에 '왜 서버가 2대 필요한가?' 설명하는 연습." },
  { day: 4, title: "메시지 큐 (Pub/Sub)", content: "동기 vs 비동기 처리. Kafka vs RabbitMQ vs SQS 선택 기준. 'A2A 패턴에서 왜 Pub/Sub을 쓰나?' 실무 연결. 메시지 순서 보장 vs 처리량 트레이드오프." },
  { day: 5, title: "SQL 성능 최적화", content: "EXPLAIN ANALYZE 읽는 법. JOIN vs Subquery 성능 차이. 인덱스 설계 원칙 (선택도 높은 컬럼 우선). N+1 쿼리 문제와 해결법." },
  { day: 6, title: "컨테이너 + CI/CD", content: "Docker 기본 (이미지 vs 컨테이너). Kubernetes 핵심 개념 (Pod, Service, Deployment). CI/CD 파이프라인: Build → Test → Deploy. GitHub Actions 기본." },
  { day: 7, title: "보안 + 인증/인가", content: "Authentication(인증) vs Authorization(인가). JWT 구조(Header.Payload.Signature). OAuth 2.0 흐름. API Key vs Bearer Token. CORS가 뭔지, 왜 필요한지." },
  { day: 8, title: "데이터베이스 설계", content: "정규화 1NF/2NF/3NF 왜 하는지. 비정규화는 언제 하는지 (읽기 성능 vs 쓰기 복잡도). NoSQL(MongoDB/DynamoDB) 선택 기준. FDE는 고객 데이터 구조를 설계할 일이 많다." },
  { day: 9, title: "API Rate Limiting", content: "Token Bucket vs Sliding Window 알고리즘. 429 응답 + Retry-After 헤더. 고객사 API를 보호하는 FDE의 역할. DDoS 방어 기초." },
  { day: 10, title: "모니터링 + 옵저버빌리티", content: "Metrics(수치) vs Logs(이벤트) vs Traces(흐름). Prometheus + Grafana 기본. SLI/SLO/SLA 차이. '고객사에 장애 보고서 쓰기' 연습." },
];

/** FDE용 기술면접 Daily Topics */
export const FDE_TECH_DAILY_TOPICS: DailyTip[] = [
  { day: 1, title: "고객 문제 정의 프레임", content: "'시스템이 느리다' → 어디가? 얼마나? 언제부터? 누구에게? 재현 가능? 5가지 질문으로 문제를 정량화. 고객의 '느리다'를 '응답 시간 3초 → 0.5초 목표'로 바꾸는 연습." },
  { day: 2, title: "솔루션 아키텍처 설계", content: "고객 요구사항 → 기술 요구사항 변환. 다이어그램(Client→API→DB→Cache) 그리기 연습. 'MVP로 2주 내 검증 가능한 범위'를 제안하는 것이 FDE의 핵심." },
  { day: 3, title: "데이터 파이프라인 설계", content: "ETL vs ELT 차이와 선택 기준. 배치 vs 스트리밍. 에러 핸들링(dead letter queue). 데이터 품질 검증. '고객 데이터가 더럽다'는 전제로 설계." },
  { day: 4, title: "비즈니스 임팩트 정량화", content: "기술 개선 → 비즈니스 수치 변환. '캐시 도입 → 응답 시간 80% 단축 → 사용자 이탈률 15% 감소 → 월 매출 X% 증가'. ROI 계산법." },
  { day: 5, title: "AI/LLM 통합 설계", content: "RAG 파이프라인: 문서 → 임베딩 → 벡터 DB → 검색 → LLM 생성. Harness 패턴: 입력 검증 → 출력 검증 → 폴백 → 채점. 'AI가 틀리면?'에 대한 구조적 답변." },
  { day: 6, title: "마이그레이션 전략", content: "레거시 시스템 → 신규 시스템 전환. Strangler Fig 패턴. Blue-Green Deployment. 데이터 마이그레이션 시 다운타임 최소화. 고객에게 리스크 커뮤니케이션." },
  { day: 7, title: "장애 대응 + 포스트모템", content: "장애 발생 시: 감지 → 영향 범위 파악 → 임시 조치 → 근본 원인 → 재발 방지. 포스트모템 문서 작성법. '고객에게 장애 보고하는 법'이 FDE 면접에서 나온다." },
];

/** FDE용 시스템 디자인 케이스 */
export const FDE_DESIGN_CASES: SystemDesignCase[] = [
  {
    id: "fde-sd-dashboard", title: "고객 대시보드 설계", difficulty: "medium", timeLimit: "45분", phase: 3,
    functional: ["실시간 KPI 표시", "필터/검색/날짜 범위", "CSV 다운로드", "알림 설정"],
    nonFunctional: ["1000명 동시 접속", "차트 렌더링 < 2초", "데이터 정합성", "모바일 반응형"],
    architecture: [
      "Frontend: React + Recharts/D3.js",
      "API: REST (페이지네이션 + 필터) 또는 GraphQL",
      "Cache: Redis (집계 데이터 캐싱, TTL 5분)",
      "DB: PostgreSQL (시계열 → TimescaleDB 확장)",
      "실시간: SSE 또는 WebSocket (KPI 업데이트)",
    ],
    deepDive: [
      "집계 쿼리 최적화: Materialized View + CRON 갱신",
      "대용량 CSV 다운로드: 서버 스트리밍 (메모리 절약)",
      "차트 성능: 데이터 포인트 1000개 이상 시 다운샘플링",
      "권한: Row-Level Security로 고객별 데이터 격리",
    ],
    tradeoffs: [
      "실시간 vs 배치: KPI는 5분 배치로 충분 vs 주문 수는 실시간 필요",
      "서버 집계 vs 클라이언트 집계: 데이터 크면 서버, 인터랙티브면 클라이언트",
      "Redis 캐시 TTL: 짧으면 DB 부하 ↑, 길면 데이터 신선도 ↓",
    ],
    template: `1. 요구사항 (5분)
   "고객사 운영팀이 매일 보는 대시보드"
   - 기능: KPI 카드, 시계열 차트, 테이블, 필터, CSV
   - 비기능: 1000명 동시, 2초 내 로딩, 권한 분리

2. 아키텍처 (10분)
   [Browser] → [API Server] → [Redis Cache]
                    ↓               ↓
              [PostgreSQL] ← [Batch Aggregation]
              [TimescaleDB]

3. 핵심 결정 (20분)
   - 집계: Materialized View (5분 갱신)
   - 실시간: SSE로 KPI 카드만 실시간 업데이트
   - 권한: RLS로 고객 ID 기반 데이터 격리

4. 고객 가치 (5분)
   "이전: 수동 SQL → CSV → Excel 1시간"
   "이후: 대시보드 접속 2초 → 바로 의사결정"`,
  },
  {
    id: "fde-sd-etl", title: "데이터 파이프라인 설계", difficulty: "hard", timeLimit: "45분", phase: 3,
    functional: ["다중 소스 데이터 수집", "정제/변환/적재", "스케줄 실행", "에러 알림"],
    nonFunctional: ["일 1억 건 처리", "부분 실패 복구", "데이터 품질 검증", "감사 로그"],
    architecture: [
      "Orchestrator: Airflow 또는 Prefect",
      "Extract: API 호출 + DB 쿼리 + 파일 읽기",
      "Transform: Python (pandas/PySpark)",
      "Load: Data Warehouse (BigQuery/Snowflake)",
      "Quality: Great Expectations (데이터 검증)",
    ],
    deepDive: [
      "Idempotency: 같은 작업 재실행해도 결과 동일 (UPSERT)",
      "Dead Letter Queue: 실패한 레코드 별도 저장 → 수동 재처리",
      "Backfill: 과거 데이터 재처리 시 날짜 파라미터로 범위 지정",
      "Schema Evolution: 소스 스키마 변경 감지 → 자동 알림",
    ],
    tradeoffs: [
      "배치 vs 스트리밍: 일 단위 리포트 = 배치, 실시간 알림 = 스트리밍",
      "pandas vs PySpark: 1GB 이하 = pandas, 이상 = PySpark",
      "Data Lake vs Warehouse: 원본 보존 = Lake, 분석용 = Warehouse",
    ],
    template: `1. 요구사항 (5분)
   "고객사 3개 시스템 데이터를 통합 분석"
   - 소스: REST API + PostgreSQL + CSV 파일
   - 처리: 일 1억 건, 매일 새벽 3시 배치
   - 적재: BigQuery (분석팀 사용)

2. 파이프라인 (15분)
   [Source A: API] ──→ Extract ──→ Stage
   [Source B: DB]  ──→ Extract ──→ Stage
   [Source C: CSV] ──→ Extract ──→ Stage
                          ↓
                    Transform (정제/조인/집계)
                          ↓
                    Quality Check (스키마/NULL/범위)
                          ↓
                    Load (BigQuery UPSERT)

3. 에러 대응 (10분)
   - 부분 실패: Dead Letter Queue + 재시도
   - 소스 장애: 이전 성공 데이터 유지 + 알림
   - 스키마 변경: 자동 감지 → Slack 알림

4. 고객 가치 (5분)
   "수동 Excel 통합 3일 → 자동 파이프라인 30분"`,
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  CAREER PAGES (채용 페이지 직링크)                           */
/* ═══════════════════════════════════════════════════════════ */

export interface CareerPage {
  company: string;
  color: string;
  url: string;
  keyword: string;
  track: "ios" | "fde" | "both";
}

export const CAREER_PAGES: CareerPage[] = [
  { company: "토스", color: "#3b82f6", url: "https://toss.im/career/jobs", keyword: "iOS", track: "both" },
  { company: "당근", color: "#ff6f00", url: "https://about.daangn.com/jobs/", keyword: "iOS Engineer", track: "ios" },
  { company: "카카오", color: "#fee500", url: "https://careers.kakao.com/jobs", keyword: "iOS", track: "ios" },
  { company: "네이버", color: "#03c75a", url: "https://recruit.navercorp.com/rcrt/list.do", keyword: "iOS", track: "ios" },
  { company: "쿠팡", color: "#e4002b", url: "https://www.coupang.jobs/kr/jobs/", keyword: "iOS", track: "ios" },
  { company: "라인", color: "#06c755", url: "https://careers.linecorp.com/jobs", keyword: "iOS", track: "ios" },
  { company: "채널톡", color: "#3b82f6", url: "https://channel.io/ko/jobs", keyword: "FDE", track: "fde" },
  { company: "마키나락스", color: "#10b981", url: "https://www.makinarocks.ai/careers", keyword: "FDE", track: "fde" },
  { company: "크래프톤", color: "#f59e0b", url: "https://careers.krafton.com/", keyword: "AI", track: "fde" },
  { company: "원티드", color: "#3b82f6", url: "https://www.wanted.co.kr/search?query=iOS+개발자&tab=position", keyword: "iOS 전체", track: "both" },
];

/* ═══════════════════════════════════════════════════════════ */
/*  MOCK INTERVIEW TIMER PRESETS                               */
/* ═══════════════════════════════════════════════════════════ */

export const TIMER_PRESETS = [
  { label: "플래시카드 (30초/장)", seconds: 30, color: "#3b82f6", icon: "card" },
  { label: "코딩테스트 Easy (15분)", seconds: 15 * 60, color: "#10b981", icon: "code" },
  { label: "코딩테스트 Medium (45분)", seconds: 45 * 60, color: "#f59e0b", icon: "code" },
  { label: "코딩테스트 Hard (70분)", seconds: 70 * 60, color: "#ef4444", icon: "code" },
  { label: "시스템 디자인 (45분)", seconds: 45 * 60, color: "#8b5cf6", icon: "design" },
  { label: "카카오 코테 (5시간)", seconds: 5 * 60 * 60, color: "#fee500", icon: "marathon" },
  { label: "1분 자기소개", seconds: 60, color: "#ec4899", icon: "mic" },
  { label: "STAR 답변 (2분)", seconds: 120, color: "#06b6d4", icon: "mic" },
];

/* ═══════════════════════════════════════════════════════════ */
/*  DAILY QUIZ BANK                                            */
/* ═══════════════════════════════════════════════════════════ */

export interface QuizItem {
  id: string;
  category: "swift" | "ios" | "cs" | "algo" | "system-design" | "fde";
  question: string;
  choices: string[];
  answer: number; // 0-based index
  explanation: string;
}

export const QUIZ_BANK: QuizItem[] = [
  // ── Swift / iOS ──
  { id: "q1", category: "swift", question: "Swift에서 struct와 class의 가장 핵심적인 차이는?", choices: ["struct는 상속이 가능하다", "class는 값 타입이다", "struct는 값 타입, class는 참조 타입", "둘 다 힙에 할당된다"], answer: 2, explanation: "struct는 값 타입(복사), class는 참조 타입(공유). struct는 스택, class는 힙 할당. Swift 표준 라이브러리(String, Array)는 대부분 struct." },
  { id: "q2", category: "swift", question: "[weak self]를 사용해야 하는 상황은?", choices: ["struct 메서드 내부", "동기 함수 호출 시", "클로저가 self를 캡처하여 순환 참조 가능성이 있을 때", "모든 클로저에서 항상"], answer: 2, explanation: "클로저가 self를 strong 캡처하면 순환 참조(Retain Cycle) 발생. delegate, 네트워크 콜백 등 @escaping 클로저에서 [weak self] 사용. 비탈출 클로저에서는 불필요." },
  { id: "q3", category: "ios", question: "iOS 앱이 Background 상태에서 할 수 없는 것은?", choices: ["파일 다운로드", "위치 업데이트", "UI 업데이트", "네트워크 요청"], answer: 2, explanation: "Background 상태에서는 UI 업데이트 불가. UIKit은 메인 스레드에서만 업데이트 가능. Background Fetch, 위치, 오디오 등은 별도 권한으로 가능." },
  { id: "q4", category: "ios", question: "ARC에서 retain count가 0이 되면?", choices: ["GC가 수집한다", "즉시 메모리에서 해제된다", "다음 런루프에서 해제된다", "개발자가 수동으로 해제해야 한다"], answer: 1, explanation: "ARC는 GC가 아님. retain count가 0이 되는 즉시(동기적으로) deinit 호출 + 메모리 해제. 비결정적 시점에 수집하는 GC와 다름." },
  { id: "q5", category: "swift", question: "Copy-on-Write가 동작하는 시점은?", choices: ["변수 할당 시 즉시 복사", "변수를 읽을 때", "변수를 수정(mutation)할 때", "함수에 인자로 넘길 때"], answer: 2, explanation: "CoW는 실제 수정이 발생하는 시점에만 복사. 읽기만 하면 같은 메모리 공유. isKnownUniquelyReferenced로 유일 소유인지 확인 후 복사 여부 결정." },
  { id: "q6", category: "ios", question: "DispatchQueue.main.sync를 메인 스레드에서 호출하면?", choices: ["정상 실행된다", "비동기로 전환된다", "데드락이 발생한다", "크래시가 발생한다"], answer: 2, explanation: "메인 스레드가 자기 자신의 큐에 sync를 걸면, 블록이 끝나길 기다리는데 자기가 실행해야 하므로 영원히 대기 → 데드락. async를 사용해야 함." },
  { id: "q7", category: "ios", question: "UITableView에서 dequeueReusableCell을 사용하는 이유는?", choices: ["코드가 간결해지므로", "메모리 효율을 위해 셀을 재사용", "자동으로 셀 높이를 계산하기 위해", "셀 애니메이션을 위해"], answer: 1, explanation: "화면에 보이지 않는 셀을 풀에 반환하고 재사용하여 메모리 절약. 1000개 데이터도 화면에 보이는 10개 셀만 생성. prepareForReuse()에서 초기화 필수." },
  { id: "q8", category: "swift", question: "protocol의 extension에서 기본 구현을 제공하면?", choices: ["채택한 타입이 반드시 재정의해야 한다", "채택한 타입이 재정의하지 않으면 기본 구현이 사용된다", "컴파일 에러가 발생한다", "런타임에 선택된다"], answer: 1, explanation: "Protocol Extension의 기본 구현은 채택한 타입이 직접 구현하지 않으면 자동으로 사용됨. POP(Protocol-Oriented Programming)의 핵심. 다중 상속 대안." },

  // ── CS ──
  { id: "q9", category: "cs", question: "TCP와 UDP 중 동영상 스트리밍에 적합한 것은?", choices: ["TCP (신뢰성 필요)", "UDP (속도 중요, 약간의 손실 허용)", "둘 다 동일", "HTTP만 사용"], answer: 1, explanation: "동영상 스트리밍은 약간의 패킷 손실보다 실시간성이 중요. UDP 기반 프로토콜(RTP)로 전송. 단, HLS는 TCP 기반이지만 세그먼트 단위 전송이라 다름." },
  { id: "q10", category: "cs", question: "해시테이블의 평균 조회 시간복잡도는?", choices: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: 2, explanation: "해시 함수로 key를 인덱스로 변환 → 직접 접근. 충돌이 많으면 O(n)까지 나빠질 수 있지만 평균은 O(1). Swift Dictionary/Set이 해시테이블 기반." },
  { id: "q11", category: "cs", question: "데드락 발생의 4가지 필요조건이 아닌 것은?", choices: ["상호 배제 (Mutual Exclusion)", "점유 대기 (Hold and Wait)", "선점 (Preemption)", "순환 대기 (Circular Wait)"], answer: 2, explanation: "4가지 조건: 상호 배제, 점유 대기, 비선점(No Preemption), 순환 대기. '선점'이 아니라 '비선점'이 조건. 리소스를 강제로 뺏을 수 없어야 데드락 가능." },
  { id: "q12", category: "cs", question: "B-Tree 인덱스가 Full Scan보다 빠른 이유는?", choices: ["모든 데이터를 메모리에 올리기 때문", "정렬된 트리 구조로 O(log n) 탐색", "병렬 처리를 사용하기 때문", "압축된 데이터를 사용하기 때문"], answer: 1, explanation: "B-Tree는 정렬된 트리. 루트에서 리프까지 O(log n)으로 도달. Full Scan은 모든 행을 순회(O(n)). 100만 행도 ~20번 비교로 찾음." },
  { id: "q13", category: "cs", question: "HTTPS에서 실제 데이터 암호화에 사용되는 것은?", choices: ["RSA (비대칭키)", "AES (대칭키)", "SHA-256 (해싱)", "MD5 (해싱)"], answer: 1, explanation: "TLS Handshake에서 RSA로 세션키(대칭키) 교환 → 이후 실제 데이터는 AES(대칭키)로 암호화. 비대칭키는 느려서 키 교환에만 사용, 실제 통신은 빠른 대칭키." },
  { id: "q14", category: "cs", question: "정적 디스패치와 동적 디스패치 중 빠른 것은?", choices: ["동적 디스패치 (유연하므로)", "정적 디스패치 (컴파일 타임 결정)", "둘 다 동일", "상황에 따라 다름"], answer: 1, explanation: "정적: 컴파일 타임에 호출 함수 결정 → 직접 점프. 동적: 런타임에 vtable 조회 후 점프 → 간접 참조 비용. struct, final class = 정적. 일반 class = 동적." },

  // ── Algorithm ──
  { id: "q15", category: "algo", question: "이분 탐색의 전제 조건은?", choices: ["배열이 연결리스트여야 함", "배열이 정렬되어 있어야 함", "배열의 크기가 2의 거듭제곱이어야 함", "배열에 중복이 없어야 함"], answer: 1, explanation: "이분 탐색은 정렬된 배열에서만 동작. 중간값과 비교하여 절반을 버리는 원리. 정렬 안 된 배열에서는 먼저 정렬(O(n log n)) 후 탐색." },
  { id: "q16", category: "algo", question: "BFS와 DFS 중 최단 경로를 보장하는 것은?", choices: ["DFS (깊이 우선)", "BFS (너비 우선)", "둘 다 보장", "둘 다 보장하지 않음"], answer: 1, explanation: "BFS는 가까운 노드부터 탐색 → 처음 도달한 경로가 최단. DFS는 한 길로 끝까지 가므로 최단 보장 안 됨. 단, 가중치 있는 그래프에서는 다익스트라 필요." },
  { id: "q17", category: "algo", question: "DP(동적 계획법)의 핵심 조건 2가지는?", choices: ["정렬 + 이분탐색", "최적 부분 구조 + 중복 하위 문제", "분할 정복 + 병합", "탐욕 선택 + 검증"], answer: 1, explanation: "최적 부분 구조: 큰 문제의 최적해가 작은 문제의 최적해로 구성. 중복 하위 문제: 같은 하위 문제가 반복 계산됨 → 저장(메모이제이션)으로 해결." },
  { id: "q18", category: "algo", question: "O(n²) 알고리즘이 O(n log n)보다 빠를 수 있는 경우는?", choices: ["절대 없다", "n이 매우 작을 때 (상수 계수 차이)", "n이 매우 클 때", "메모리가 부족할 때"], answer: 1, explanation: "Big-O는 n이 충분히 클 때의 경향. n이 작으면(~100) 상수 계수가 작은 O(n²)이 오히려 빠를 수 있음. 예: 삽입 정렬이 작은 배열에서 퀵소트보다 빠른 이유." },

  // ── System Design ──
  { id: "q19", category: "system-design", question: "모바일에서 페이지네이션 시 커서 기반이 오프셋보다 나은 이유는?", choices: ["구현이 더 쉬워서", "새 데이터 삽입 시 중복/누락이 없어서", "서버 부하가 적어서", "클라이언트 메모리를 적게 써서"], answer: 1, explanation: "오프셋: 중간에 새 글이 삽입되면 이미 본 글이 다시 나오거나 누락. 커서: 마지막으로 본 항목의 ID 기준이라 삽입/삭제에 영향 없음. 실시간 피드에서 필수." },
  { id: "q20", category: "system-design", question: "이미지 로딩 시 3단계 캐시 순서는?", choices: ["디스크 → 네트워크 → 메모리", "네트워크 → 메모리 → 디스크", "메모리 → 디스크 → 네트워크", "메모리 → 네트워크 → 디스크"], answer: 2, explanation: "가장 빠른 곳부터 확인: 메모리 캐시(NSCache, 즉시) → 디스크 캐시(FileManager, 빠름) → 네트워크(느림). Cache-Aside 패턴. Kingfisher/SDWebImage 모두 이 순서." },

  // ── FDE ──
  { id: "q21", category: "fde", question: "고객이 '시스템이 느리다'고 할 때 FDE가 가장 먼저 해야 할 것은?", choices: ["서버를 증설한다", "'느리다'를 정량화한다 (현재 응답 시간 측정)", "코드를 최적화한다", "캐시를 도입한다"], answer: 1, explanation: "문제 해결의 첫 단계는 측정. '느리다'를 '현재 응답 시간 3초, 목표 0.5초'로 정량화해야 올바른 해결책을 찾을 수 있음. APM(Application Performance Monitoring) 도구 활용." },
  { id: "q22", category: "fde", question: "CAP 정리에서 네트워크 파티션 발생 시 선택해야 하는 것은?", choices: ["Consistency + Availability", "Consistency 또는 Availability 중 하나", "Partition Tolerance를 포기", "세 가지 모두 유지 가능"], answer: 1, explanation: "네트워크 파티션(P)은 분산 시스템에서 불가피 → P는 포기 불가. 따라서 C(일관성) 또는 A(가용성) 중 선택. 은행 = CP(일관성 우선), SNS = AP(가용성 우선)." },
  { id: "q23", category: "fde", question: "ETL에서 Idempotency가 중요한 이유는?", choices: ["처리 속도가 빨라져서", "같은 작업을 재실행해도 결과가 동일해야 하므로", "메모리를 절약하므로", "보안을 강화하므로"], answer: 1, explanation: "파이프라인 실패 시 재실행하면 데이터 중복 삽입 위험. Idempotent하면 재실행해도 결과 동일(UPSERT). Dead Letter Queue + 재시도 전략의 전제 조건." },
  { id: "q24", category: "fde", question: "LLM 환각(Hallucination) 대응으로 가장 효과적인 것은?", choices: ["Temperature를 0으로 설정", "RAG(Retrieval-Augmented Generation) 도입", "더 큰 모델 사용", "프롬프트를 길게 작성"], answer: 1, explanation: "RAG: 외부 데이터 소스에서 관련 정보를 검색 → LLM에 컨텍스트로 제공. 근거 기반 생성으로 환각 대폭 감소. Temperature 조정만으로는 한계. Harness 패턴의 입출력 검증과 병행." },

  // ── 추가 Swift/iOS ──
  { id: "q25", category: "swift", question: "Swift에서 let과 var의 차이는?", choices: ["let은 타입 추론, var는 명시적 타입", "let은 상수(immutable), var는 변수(mutable)", "let은 값 타입, var는 참조 타입", "let은 지역 변수, var는 전역 변수"], answer: 1, explanation: "let은 한 번 할당하면 변경 불가(immutable). var는 변경 가능(mutable). struct를 let으로 선언하면 프로퍼티도 변경 불가. 가능하면 let 사용이 Swift 컨벤션." },
  { id: "q26", category: "swift", question: "guard let과 if let의 핵심 차이는?", choices: ["성능 차이가 있다", "guard는 else에서 반드시 스코프를 탈출해야 한다", "if let이 더 안전하다", "guard는 Optional만 사용 가능하다"], answer: 1, explanation: "guard let은 조건 불만족 시 반드시 return/throw/break 등으로 탈출. 언래핑된 값이 이후 스코프에서 사용 가능. if let은 블록 안에서만 유효. Early Exit 패턴에 guard가 적합." },
  { id: "q27", category: "swift", question: "enum의 associated value란?", choices: ["enum에 메서드를 추가하는 것", "enum case에 관련 데이터를 함께 저장하는 것", "enum을 상속하는 것", "enum에 프로토콜을 채택하는 것"], answer: 1, explanation: "각 case가 다른 타입의 값을 가질 수 있음. 예: case success(Data), case failure(Error). Result, Optional이 대표적. 패턴 매칭(switch)으로 안전하게 추출." },
  { id: "q28", category: "ios", question: "NotificationCenter와 delegate 패턴의 차이는?", choices: ["NotificationCenter가 더 빠르다", "delegate는 1:1, NotificationCenter는 1:N 통신", "delegate는 비동기, NotificationCenter는 동기", "둘은 완전히 동일하다"], answer: 1, explanation: "delegate: 1:1 관계. 프로토콜 기반 명확한 인터페이스. NotificationCenter: 1:N 브로드캐스트. 느슨한 결합. 키보드 이벤트, 앱 라이프사이클 등에 적합. Combine이 둘의 현대적 대안." },
  { id: "q29", category: "ios", question: "@escaping 클로저란?", choices: ["메인 스레드에서 실행되는 클로저", "함수 리턴 후에도 실행될 수 있는 클로저", "에러를 던질 수 있는 클로저", "재귀 호출이 가능한 클로저"], answer: 1, explanation: "함수가 리턴된 이후에도 호출될 수 있는 클로저. 네트워크 콜백, 비동기 작업에서 필수. [weak self] 캡처가 필요한 이유. 비탈출 클로저(기본)는 함수 스코프 내에서만 실행." },
  { id: "q30", category: "ios", question: "Codable 프로토콜의 구성은?", choices: ["Encodable + Hashable", "Decodable + Equatable", "Encodable + Decodable", "Serializable + Deserializable"], answer: 2, explanation: "Codable = Encodable & Decodable. JSON↔Swift 타입 자동 변환. CodingKeys enum으로 키 매핑 커스터마이징. 네스팅, 날짜 포맷, 기본값 처리 가능. URLSession + JSONDecoder 조합이 표준." },
  { id: "q31", category: "ios", question: "SceneDelegate가 도입된 이유는?", choices: ["성능 개선", "멀티 윈도우(iPad)를 지원하기 위해", "보안 강화", "Storyboard를 대체하기 위해"], answer: 1, explanation: "iOS 13+. iPad에서 같은 앱의 여러 인스턴스(Scene)를 동시에 띄울 수 있도록. 각 Scene이 독립적 라이프사이클. AppDelegate는 앱 전체 이벤트, SceneDelegate는 UI 윈도우 이벤트 담당." },

  // ── 추가 CS ──
  { id: "q32", category: "cs", question: "프로세스와 스레드가 공유하지 않는 것은?", choices: ["Code 영역", "Data 영역", "Heap 영역", "Stack 영역"], answer: 3, explanation: "스레드는 Code, Data, Heap을 공유하고 Stack만 독립. 각 스레드가 독립적 함수 호출 스택을 가짐. 공유 메모리(Heap) 접근 시 동기화 필요 → Race Condition 주의." },
  { id: "q33", category: "cs", question: "HTTP 상태코드 304의 의미는?", choices: ["요청 성공 (OK)", "리소스가 이동됨", "수정되지 않음 (캐시 사용)", "권한 없음"], answer: 2, explanation: "304 Not Modified: 서버의 리소스가 마지막 요청 이후 변경되지 않음 → 클라이언트 캐시 사용. ETag/If-None-Match 또는 Last-Modified/If-Modified-Since 헤더로 검증." },
  { id: "q34", category: "cs", question: "ACID 중 Isolation(격리성)이 보장하는 것은?", choices: ["데이터가 영구 저장됨", "전부 성공하거나 전부 실패", "동시 트랜잭션이 서로 간섭하지 않음", "데이터 무결성 유지"], answer: 2, explanation: "Isolation: 동시에 실행되는 트랜잭션들이 서로의 중간 상태를 볼 수 없음. 격리 수준: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE (엄격↑, 성능↓)." },
  { id: "q35", category: "cs", question: "Virtual Memory에서 Page Fault란?", choices: ["메모리 오버플로우", "잘못된 메모리 접근", "물리 메모리에 없는 페이지 접근 시 디스크에서 로드", "메모리 누수"], answer: 2, explanation: "가상 주소의 페이지가 물리 메모리에 없을 때 발생. OS가 디스크에서 해당 페이지를 물리 메모리로 로드. 빈번하면 Thrashing(성능 급락). iOS는 Swap 없어서 메모리 부족 시 앱 종료(Jetsam)." },
  { id: "q36", category: "cs", question: "Semaphore(value: 0)의 용도는?", choices: ["리소스 보호", "스레드 간 신호 전달 (signaling)", "메모리 관리", "네트워크 제한"], answer: 1, explanation: "value=0이면 wait() 호출 시 즉시 블로킹. 다른 스레드가 signal()하면 해제. 비동기 작업 완료 대기, 스레드 간 동기화 신호에 사용. value=N이면 동시 접근 N개 제한." },
  { id: "q37", category: "cs", question: "DNS 쿼리에서 TTL(Time To Live)의 역할은?", choices: ["쿼리 최대 횟수", "캐시 유효 기간", "최대 홉 수", "연결 타임아웃"], answer: 1, explanation: "DNS 레코드의 캐시 유효 기간(초). TTL 만료 전: 캐시된 IP 사용(빠름). TTL 만료 후: DNS 서버에 재쿼리. TTL이 길면: 캐시 히트↑ but IP 변경 반영 느림." },

  // ── 추가 Algorithm ──
  { id: "q38", category: "algo", question: "Sliding Window 패턴을 써야 하는 문제 유형은?", choices: ["최단 경로 찾기", "연속된 부분 배열/문자열의 합/최대/조건 탐색", "트리 순회", "정렬"], answer: 1, explanation: "연속(contiguous) 구간에서 조건을 만족하는 결과를 찾을 때. 매번 전체를 다시 계산(O(n²)) 대신 윈도우를 밀면서 O(n)으로. '최대 K개의 연속 합', '조건 만족하는 가장 짧은 부분 문자열' 등." },
  { id: "q39", category: "algo", question: "Stack으로 풀 수 있는 대표적 문제는?", choices: ["최단 경로", "괄호 유효성 검사", "정렬", "최소 신장 트리"], answer: 1, explanation: "LIFO(Last In First Out) 특성으로 '가장 최근 것과 매칭' 패턴. 괄호 짝 맞추기, 히스토리(뒤로가기), 단조 스택(다음 큰 수), 후위 표기법 계산 등." },
  { id: "q40", category: "algo", question: "Greedy 알고리즘이 최적해를 보장하는 조건은?", choices: ["문제가 정렬 가능할 때", "탐욕적 선택 속성 + 최적 부분 구조", "DP로 풀 수 있을 때", "모든 경우에 보장"], answer: 1, explanation: "탐욕적 선택 속성: 매 순간 최선의 선택이 전체 최적을 보장. 최적 부분 구조: 부분 문제의 최적해가 전체 최적해에 포함. 두 조건이 만족되지 않으면 DP를 고려." },

  // ── 추가 System Design ──
  { id: "q41", category: "system-design", question: "웹소켓과 SSE(Server-Sent Events)의 차이는?", choices: ["웹소켓이 더 느리다", "SSE는 양방향, 웹소켓은 단방향", "웹소켓은 양방향, SSE는 서버→클라이언트 단방향", "둘 다 UDP 기반"], answer: 2, explanation: "웹소켓: 양방향(채팅). SSE: 서버→클라이언트 단방향(알림, 피드 업데이트). SSE가 더 단순하고 HTTP 호환. 양방향이 필요 없으면 SSE가 더 효율적." },
  { id: "q42", category: "system-design", question: "CDN(Content Delivery Network)의 핵심 이점은?", choices: ["서버 보안 강화", "사용자와 가까운 서버에서 콘텐츠 제공 → 로딩 속도 향상", "데이터베이스 최적화", "서버 코드 관리 용이"], answer: 1, explanation: "전 세계 엣지 서버에 콘텐츠 캐시. 사용자는 가장 가까운 서버에서 다운로드. 이미지, JS, CSS 등 정적 리소스에 특히 효과적. CloudFront, Cloudflare 등." },
  { id: "q43", category: "system-design", question: "Rate Limiting의 Token Bucket 알고리즘은?", choices: ["요청마다 토큰 생성", "일정 속도로 토큰 충전, 요청 시 토큰 소비, 토큰 없으면 거부", "모든 요청을 큐에 저장", "IP 기반 차단"], answer: 1, explanation: "버킷에 일정 속도로 토큰 충전(예: 초당 10개). 요청마다 토큰 1개 소비. 토큰 없으면 429 응답. 버스트 허용(버킷에 토큰 쌓아둠) + 장기 평균 제한. API Gateway에서 표준적으로 사용." },

  // ── 추가 FDE ──
  { id: "q44", category: "fde", question: "고객에게 기술적 제약을 설명할 때 가장 효과적인 방법은?", choices: ["전문 용어로 정확하게 설명", "비유와 숫자로 비즈니스 임팩트 중심 설명", "'안 됩니다'로 명확히 거부", "이메일로 문서화하여 전달"], answer: 1, explanation: "비개발자에게는 '레이턴시가 높다'가 아니라 '페이지 로딩이 3초 → 사용자 이탈 40% 증가'. 비유 + 숫자 + 임팩트 프레임. 항상 대안을 함께 제시." },
  { id: "q45", category: "fde", question: "Strangler Fig 패턴이란?", choices: ["기존 시스템을 즉시 교체", "새 시스템을 점진적으로 구축하여 기존 시스템을 서서히 대체", "두 시스템을 영구적으로 병행", "기존 시스템을 복제"], answer: 1, explanation: "레거시 마이그레이션 전략. 새 기능은 새 시스템에, 기존 기능은 하나씩 이전. Reverse Proxy로 트래픽 분기. 빅뱅 교체의 리스크 없이 점진적 전환. FDE가 고객사 마이그레이션에서 자주 사용." },
  { id: "q46", category: "fde", question: "포스트모템(Postmortem) 문서에 반드시 포함해야 할 것은?", choices: ["책임자 처벌 방안", "타임라인 + 근본 원인 + 재발 방지 조치", "코드 전체 리뷰", "고객 사과문"], answer: 1, explanation: "Blameless Postmortem: 개인 탓이 아닌 시스템 개선 관점. 필수 항목: ①사건 타임라인 ②영향 범위 ③근본 원인 분석(5 Whys) ④재발 방지 Action Items + 담당자 + 기한. Google SRE 문화의 핵심." },

  // ── 기술면접 심화 ──
  { id: "q47", category: "ios", question: "Combine에서 .sink와 .assign의 차이는?", choices: [".sink는 UI용, .assign은 로직용", ".sink는 클로저로 처리, .assign은 프로퍼티에 직접 바인딩", "둘 다 동일하다", ".assign이 더 빠르다"], answer: 1, explanation: ".sink: 클로저로 값을 받아 자유롭게 처리. .assign: KeyPath로 프로퍼티에 직접 바인딩 (UI 바인딩에 적합). .assign은 [weak self] 불필요(자동 관리)하지만 메인 스레드 보장 안 됨 → .receive(on:) 필요." },
  { id: "q48", category: "ios", question: "Swift의 Actor와 class의 가장 큰 차이는?", choices: ["Actor는 값 타입이다", "Actor는 데이터 접근을 자동으로 직렬화한다", "Actor는 상속이 가능하다", "Actor는 struct와 동일하다"], answer: 1, explanation: "Actor = 참조 타입이지만, 내부 프로퍼티 접근 시 자동으로 직렬화(serial queue 효과). await 필요. Data Race를 컴파일 타임에 방지. @MainActor = UI 업데이트를 메인 스레드에서 보장." },
  { id: "q49", category: "ios", question: "RIBs 아키텍처에서 Router의 역할은?", choices: ["네트워크 요청 처리", "자식 RIB의 attach/detach를 관리", "UI 렌더링", "데이터 저장"], answer: 1, explanation: "Router: 자식 RIB을 attach(화면 추가)/detach(화면 제거). Interactor가 비즈니스 로직 → Router에 화면 전환 요청. Builder가 DI로 의존성 주입. View는 UI만. 그린카에서 사용한 패턴." },
  { id: "q50", category: "ios", question: "앱 시작 시간을 줄이는 방법이 아닌 것은?", choices: ["동적 라이브러리 수 줄이기", "didFinishLaunchingWithOptions에서 무거운 작업 제거", "모든 화면을 미리 로드", "+initialize 사용 최소화"], answer: 2, explanation: "모든 화면 미리 로드는 오히려 시작 시간 증가. 올바른 방법: 동적 라이브러리 최소화(링킹 시간↓), 무거운 초기화 lazy/async로 변경, +initialize 대신 +load 또는 제거." },
  { id: "q51", category: "ios", question: "URLSession의 ephemeral configuration 특징은?", choices: ["백그라운드 다운로드 지원", "캐시/쿠키/인증 정보를 저장하지 않음", "HTTP/2만 지원", "동기 요청 전용"], answer: 1, explanation: "ephemeral: 인메모리만 사용, 디스크 캐시/쿠키 없음. 프라이빗 브라우징과 유사. default: 디스크 캐시 사용. background: 앱 종료 후에도 다운로드 계속." },

  // ── CS 심화 ──
  { id: "q52", category: "cs", question: "캐시 교체 정책 LRU는 무엇의 약자인가?", choices: ["Last Recently Updated", "Least Recently Used", "Last Read Unit", "Least Required Update"], answer: 1, explanation: "Least Recently Used: 가장 오래 사용되지 않은 항목을 먼저 제거. NSCache가 LRU 변형 사용. 대안: LFU(Least Frequently Used), FIFO. 웹 캐시/DB 버퍼 풀에서 표준." },
  { id: "q53", category: "cs", question: "OAuth 2.0에서 Access Token과 Refresh Token의 차이는?", choices: ["Access Token이 더 오래 유지된다", "Refresh Token으로 새 Access Token을 발급받는다", "둘 다 동일한 역할", "Refresh Token은 API 호출에 사용된다"], answer: 1, explanation: "Access Token: 짧은 수명(15분~1시간), API 호출에 사용. Refresh Token: 긴 수명(2주~), Access Token 만료 시 새로 발급. Refresh Token은 서버에만 전송(탈취 위험 최소화)." },
  { id: "q54", category: "cs", question: "CORS(Cross-Origin Resource Sharing)가 필요한 이유는?", choices: ["서버 성능 향상", "다른 도메인에서의 API 호출을 브라우저가 차단하기 때문", "데이터 압축을 위해", "SSL 인증서 검증을 위해"], answer: 1, explanation: "브라우저의 Same-Origin Policy: 다른 출처의 리소스 접근 차단. CORS 헤더(Access-Control-Allow-Origin)로 허용 도메인 명시. 서버 간 통신에는 불필요(브라우저 보안 정책)." },
  { id: "q55", category: "cs", question: "컨텍스트 스위칭(Context Switching)이 비용이 큰 이유는?", choices: ["새 프로세스를 생성해야 해서", "CPU 레지스터/PC/스택 포인터를 저장·복원해야 해서", "메모리를 새로 할당해야 해서", "네트워크 연결을 재설정해야 해서"], answer: 1, explanation: "현재 프로세스/스레드의 상태(레지스터, PC, 스택)를 PCB에 저장 → 다음 프로세스 상태 복원. 캐시 무효화(Cold Cache)도 성능 저하 원인. 스레드는 프로세스보다 가벼움(공유 메모리)." },
  { id: "q56", category: "cs", question: "N+1 쿼리 문제란?", choices: ["N개의 테이블을 조인하는 문제", "목록 조회 1번 + 각 항목 상세 조회 N번 = N+1번 쿼리 실행", "N번 커넥션을 여는 문제", "인덱스를 N개 만드는 문제"], answer: 1, explanation: "게시글 10개 조회(1번) → 각 게시글의 작성자 조회(10번) = 11번. 해결: JOIN으로 1번에 가져오기, 또는 IN 절로 배치 조회. ORM(CoreData/Realm)에서 자주 발생." },
  { id: "q57", category: "cs", question: "WebSocket이 HTTP와 다른 점은?", choices: ["WebSocket은 UDP 기반", "WebSocket은 연결을 유지하고 양방향 통신", "WebSocket은 상태 코드가 없다", "WebSocket은 암호화를 지원하지 않는다"], answer: 1, explanation: "HTTP: 요청-응답 후 연결 종료(Stateless). WebSocket: HTTP 업그레이드 후 연결 유지(Stateful), 서버→클라이언트 푸시 가능. wss://로 TLS 지원. 채팅, 실시간 피드에 적합." },
  { id: "q58", category: "cs", question: "Eventual Consistency(최종 일관성)란?", choices: ["데이터가 즉시 모든 노드에 반영", "시간이 지나면 모든 노드가 같은 값을 가지게 됨", "데이터 불일치를 허용하지 않음", "트랜잭션이 필요 없음"], answer: 1, explanation: "분산 시스템에서 업데이트가 모든 노드에 즉시 반영되지 않지만, 충분한 시간 후 일관성 달성. SNS 좋아요 수, 장바구니 등에 적합. 은행 잔고 = Strong Consistency 필수." },
  { id: "q59", category: "cs", question: "해싱에서 Salt를 사용하는 이유는?", choices: ["해싱 속도를 높이기 위해", "같은 비밀번호도 다른 해시값을 만들어 Rainbow Table 공격 방지", "해시값을 복호화하기 위해", "데이터를 압축하기 위해"], answer: 1, explanation: "Salt: 비밀번호에 추가하는 랜덤 문자열. 같은 비밀번호 'password123'도 Salt가 다르면 다른 해시값 생성. Rainbow Table(사전 계산된 해시 테이블) 공격 무력화. bcrypt가 자동으로 Salt 생성." },
  { id: "q60", category: "cs", question: "REST API에서 PUT과 PATCH의 차이는?", choices: ["PUT이 더 빠르다", "PUT은 전체 리소스 교체, PATCH는 부분 수정", "PATCH는 생성, PUT은 수정", "둘 다 동일하다"], answer: 1, explanation: "PUT: 리소스 전체를 새 데이터로 교체. 빠진 필드는 null/기본값. PATCH: 변경할 필드만 전송. 예: 이름만 바꿀 때 PUT은 모든 필드 전송, PATCH는 name만. 모바일에서 PATCH가 대역폭 효율적." },

  // ── 알고리즘 심화 ──
  { id: "q61", category: "algo", question: "위상 정렬(Topological Sort)은 어떤 그래프에서 가능한가?", choices: ["무방향 그래프", "DAG(방향 비순환 그래프)", "완전 그래프", "가중치 그래프"], answer: 1, explanation: "DAG(Directed Acyclic Graph): 방향이 있고 사이클이 없는 그래프. 과목 선수 관계, 빌드 의존성 순서 등에 사용. BFS(Kahn) 또는 DFS로 구현. 사이클 있으면 불가능." },
  { id: "q62", category: "algo", question: "다익스트라 알고리즘의 제약 조건은?", choices: ["무방향 그래프만 가능", "가중치가 음수이면 안 됨", "정점이 100개 이하여야 함", "BFS로만 구현 가능"], answer: 1, explanation: "다익스트라: 음이 아닌 가중치 그래프에서 최단 경로. 우선순위 큐(힙)로 O((V+E)log V). 음수 가중치 시 벨만-포드(O(VE)) 사용. 네이버 지도 경로 탐색이 대표적 응용." },
  { id: "q63", category: "algo", question: "Union-Find(Disjoint Set)의 핵심 연산 2가지는?", choices: ["push와 pop", "find와 union", "insert와 delete", "search와 sort"], answer: 1, explanation: "find: 원소가 속한 집합의 대표(루트) 찾기. union: 두 집합 합치기. Path Compression + Union by Rank 최적화 시 거의 O(1). 크루스칼 MST, 네트워크 연결 확인에 사용." },
  { id: "q64", category: "algo", question: "Trie 자료구조의 용도는?", choices: ["정렬", "문자열 검색/자동완성", "그래프 탐색", "캐시 관리"], answer: 1, explanation: "Trie(트라이): 문자열을 문자 단위로 트리에 저장. 접두사(prefix) 검색에 O(m)(m=문자열 길이). 자동완성, 사전, IP 라우팅에 사용. 해시맵보다 접두사 검색에 유리." },

  // ── 시스템 디자인 심화 ──
  { id: "q65", category: "system-design", question: "Consistent Hashing의 장점은?", choices: ["해싱 속도가 빠르다", "노드 추가/제거 시 재배치되는 키가 최소", "충돌이 발생하지 않는다", "정렬이 필요 없다"], answer: 1, explanation: "전통 해싱: 노드 수 변경 시 모든 키 재배치. Consistent Hashing: 영향받는 키가 1/N만. 분산 캐시(Redis Cluster), 로드밸런서에서 사용. 가상 노드로 균등 분배." },
  { id: "q66", category: "system-design", question: "Circuit Breaker 패턴의 역할은?", choices: ["네트워크 암호화", "장애 전파 방지 — 실패 반복 시 요청 차단", "로드 밸런싱", "데이터 캐싱"], answer: 1, explanation: "외부 서비스 장애 시 계속 요청하면 전체 시스템 다운. Circuit Breaker: 실패 N회 → Open(차단) → 일정 시간 후 Half-Open(시도) → 성공 시 Closed(복구). Hystrix, Resilience4j 구현." },
  { id: "q67", category: "system-design", question: "CQRS(Command Query Responsibility Segregation)란?", choices: ["캐시와 DB를 분리", "읽기(Query)와 쓰기(Command) 모델을 분리", "프론트엔드와 백엔드를 분리", "인증과 인가를 분리"], answer: 1, explanation: "쓰기 최적화 모델(정규화)과 읽기 최적화 모델(비정규화)을 분리. 복잡한 도메인에서 각각 독립적으로 스케일링. Event Sourcing과 자주 함께 사용. 피드 시스템에 적합." },

  // ── iOS 실무 심화 ──
  { id: "q68", category: "ios", question: "SwiftUI에서 @State와 @ObservedObject의 차이는?", choices: ["@State는 클래스용, @ObservedObject는 구조체용", "@State는 뷰 내부 소유, @ObservedObject는 외부에서 주입", "둘 다 동일하다", "@ObservedObject가 더 빠르다"], answer: 1, explanation: "@State: 뷰가 소유하는 값 타입 상태. 뷰 재생성 시 유지. @ObservedObject: 외부에서 주입받는 ObservableObject. 뷰가 소유하지 않음. @StateObject: 뷰가 소유하는 ObservableObject(iOS 14+)." },
  { id: "q69", category: "ios", question: "Instruments의 Time Profiler로 알 수 있는 것은?", choices: ["메모리 누수", "CPU를 가장 많이 사용하는 함수", "네트워크 요청 수", "디스크 사용량"], answer: 1, explanation: "Time Profiler: 주기적으로 콜스택을 샘플링하여 CPU 사용량이 높은 함수 식별. Call Tree로 병목 지점 파악. Allocations: 메모리. Leaks: 메모리 누수. Network: 네트워크." },
  { id: "q70", category: "ios", question: "딥링크에서 Universal Link와 URL Scheme의 차이는?", choices: ["Universal Link가 더 느리다", "Universal Link는 HTTPS 기반으로 앱/웹 모두 처리, URL Scheme은 앱만", "URL Scheme이 더 안전하다", "둘 다 동일하다"], answer: 1, explanation: "URL Scheme(greencar://): 앱 전용, 앱 미설치 시 에러. Universal Link(https://greencar.co.kr/...): HTTPS 기반, 앱 설치 시 앱으로, 미설치 시 웹으로. Apple이 Universal Link 권장. AASA 파일 필요." },

  // ── CS 기초 보강 ──
  { id: "q71", category: "cs", question: "TCP 3-way Handshake의 순서는?", choices: ["ACK → SYN → SYN-ACK", "SYN → SYN-ACK → ACK", "SYN → ACK → SYN-ACK", "ACK → ACK → SYN"], answer: 1, explanation: "①클라이언트→서버: SYN(연결 요청) ②서버→클라이언트: SYN-ACK(수락+응답) ③클라이언트→서버: ACK(확인). 이후 데이터 전송 시작. 종료는 4-way Handshake(FIN/ACK)." },
  { id: "q72", category: "cs", question: "스택 오버플로우(Stack Overflow)가 발생하는 원인은?", choices: ["힙 메모리 부족", "재귀 호출이 너무 깊어 스택 공간 초과", "CPU 과열", "디스크 공간 부족"], answer: 1, explanation: "각 함수 호출마다 스택 프레임 할당. 재귀가 너무 깊으면(탈출 조건 없음 등) 스택 크기 초과. iOS 스택 크기: 메인 스레드 1MB, 백그라운드 512KB. 해결: 반복문 전환 또는 꼬리 재귀." },
  { id: "q73", category: "cs", question: "인덱스를 모든 컬럼에 만들면 안 되는 이유는?", choices: ["SELECT가 느려져서", "INSERT/UPDATE/DELETE 시 인덱스도 갱신해야 하므로 쓰기 성능 저하", "디스크가 부족해서", "보안 문제가 생겨서"], answer: 1, explanation: "인덱스는 별도 B-Tree 구조. 데이터 변경 시 인덱스도 함께 갱신 → 쓰기 비용 증가. 저장 공간도 추가. 자주 WHERE/JOIN에 사용되는 컬럼에만 선택적으로 생성." },
  { id: "q74", category: "cs", question: "멀티스레딩에서 Race Condition이란?", choices: ["스레드가 빠르게 실행되는 상태", "여러 스레드가 공유 자원에 동시 접근하여 결과가 예측 불가한 상태", "스레드 간 통신 프로토콜", "단일 스레드 실행 모드"], answer: 1, explanation: "공유 자원(변수, 파일 등)에 여러 스레드가 동시에 읽기/쓰기 → 실행 순서에 따라 결과가 달라짐. 해결: Mutex/Lock, Serial Queue, Actor, Atomic 변수. Thread Sanitizer로 감지." },
  { id: "q75", category: "cs", question: "Big Endian과 Little Endian의 차이는?", choices: ["부동소수점 표현 방식", "바이트 저장 순서 (최상위/최하위 바이트 먼저)", "문자 인코딩 방식", "메모리 할당 전략"], answer: 1, explanation: "Big Endian: 최상위 바이트가 낮은 주소. 네트워크 바이트 순서(Network Byte Order). Little Endian: 최하위 바이트가 낮은 주소. Intel/ARM CPU. 네트워크 프로토콜 개발 시 변환 필요(htons/ntohs)." },
  { id: "q76", category: "cs", question: "메모리 단편화(Fragmentation)의 두 가지 종류는?", choices: ["내부 + 외부 단편화", "수직 + 수평 단편화", "정적 + 동적 단편화", "물리 + 가상 단편화"], answer: 0, explanation: "내부 단편화: 할당된 블록 내부의 사용되지 않는 공간. 외부 단편화: 사용 가능한 메모리가 흩어져서 큰 블록 할당 불가. iOS에서 메모리 풀/슬래브 할당으로 완화." },

  // ── Swift 6 + 2026 트렌드 ──
  { id: "q77", category: "swift", question: "Swift 6의 Strict Concurrency에서 @MainActor의 변화는?", choices: ["@MainActor가 제거됨", "모든 UI 타입에 @MainActor가 기본 적용", "비동기 함수에서만 사용 가능", "@MainActor가 선택적으로 변경됨"], answer: 1, explanation: "Swift 6: Strict Concurrency. UIViewController, UIView 등 UI 타입에 @MainActor 기본 적용. 백그라운드 작업은 명시적으로 Task.detached 또는 nonisolated 필요. 기존 코드 마이그레이션 주의." },
  { id: "q78", category: "swift", question: "Swift의 Sendable 프로토콜 역할은?", choices: ["네트워크 전송 가능 타입 표시", "스레드 간 안전하게 전달 가능한 타입 보장", "직렬화 가능 타입 표시", "UI 업데이트 가능 타입 표시"], answer: 1, explanation: "Sendable: 값이 동시성 경계를 넘어 안전하게 전달 가능함을 컴파일러에 보장. 값 타입은 자동 Sendable. class는 @unchecked Sendable 또는 모든 프로퍼티가 let + Sendable일 때. Swift 6에서 강제." },
  { id: "q79", category: "ios", question: "CoreML로 온디바이스 ML을 사용하는 장점이 아닌 것은?", choices: ["네트워크 불필요", "사용자 프라이버시 보호", "무한한 모델 크기 사용 가능", "빠른 추론 속도"], answer: 2, explanation: "온디바이스 ML: 네트워크 불필요(오프라인 동작), 데이터가 기기에서만 처리(프라이버시), Neural Engine으로 빠른 추론. 단점: 모델 크기 제한(앱 크기 영향), 학습은 불가(추론만)." },
  { id: "q80", category: "ios", question: "Swift Testing 프레임워크(@Test)와 XCTest의 차이는?", choices: ["Swift Testing이 더 느리다", "@Test 매크로로 더 간결한 테스트, 파라미터화 테스트 지원", "XCTest가 Swift 전용이다", "Swift Testing은 UI 테스트만 가능"], answer: 1, explanation: "Swift Testing(Swift 5.9+): @Test 매크로, #expect 대신 XCTAssert, 파라미터화 테스트(@Test(arguments:)), 태그 기반 필터링. XCTest보다 간결하고 표현력 높음. Xcode 16+ 기본 지원." },
  { id: "q81", category: "ios", question: "AI Pair Programming 면접에서 가장 중요한 것은?", choices: ["AI에게 모든 코드를 생성시키기", "AI 제안을 비판적으로 검토하고 수정하는 능력", "AI 없이 모든 것을 직접 구현", "가장 최신 AI 모델 사용"], answer: 1, explanation: "2026년 Meta 등에서 도입한 AI Pair Programming 면접: AI가 코드를 제안하면 개발자가 검토·수정·개선. 핵심 평가: Critical thinking + AI 출력 검증 능력 + 아키텍처 판단. AI에 의존 X, AI와 협력 O." },
  { id: "q82", category: "fde", question: "고객사에 솔루션을 제안할 때 MVP를 강조하는 이유는?", choices: ["비용을 줄이기 위해", "빠른 검증으로 리스크를 줄이고, 피드백 기반 개선이 가능해서", "완성도가 낮아도 되므로", "개발자가 편하므로"], answer: 1, explanation: "MVP(Minimum Viable Product): 핵심 가설을 최소 기능으로 검증. 6개월 전체 개발 → 실패 vs 2주 MVP → 피드백 → 방향 수정. FDE의 핵심 역량: '뭘 만들지'보다 '뭘 먼저 검증할지' 판단." },
];

/* ═══════════════════════════════════════════════════════════ */
/*  INTERVIEW DAY PLAYBOOK                                     */
/* ═══════════════════════════════════════════════════════════ */

export const INTERVIEW_DAY_PLAYBOOK = {
  dMinus1: {
    title: "D-1 저녁",
    items: [
      "이력서 모든 항목 1문장 설명 최종 리허설",
      "역질문 3개 최종 확인 (기술 문화 / 팀 과제 / 성장 경로)",
      "지참물: 신분증, 노트북(과제 시연용), 물, 필기구",
      "면접 장소 교통편 확인 (30분 여유)",
      "10시 이전 취침 — 수면이 기억력의 50%를 결정",
    ],
  },
  dDay: {
    title: "D-Day 아침",
    items: [
      "기상 후 가벼운 스트레칭 5분",
      "쉬운 코딩 문제 1개만 풀기 (워밍업, 자신감)",
      "프로젝트 핵심 3줄 복습: Harness/Context/Compound",
      "식사: 단백질 위주 (혈당 급등 방지)",
      "커피는 평소 양만 (과다 섭취 → 불안 증가)",
    ],
  },
  before: {
    title: "면접 30분 전",
    items: [
      "Box Breathing: 4초 들이쉬고 → 4초 멈추고 → 4초 내쉬고 → 4초 멈추기 × 3회",
      "Power Pose: 2분간 양팔 벌려 자신감 자세 (Amy Cuddy 연구)",
      "Affirmation: '나는 3년 7개월간 608건을 해결한 사람이다'",
      "스마트폰 무음 + 알림 끄기",
      "면접관 이름 확인 (LinkedIn/회사 페이지)",
    ],
  },
};

/* ═══════════════════════════════════════════════════════════ */
/*  SALARY NEGOTIATION + RED FLAGS                             */
/* ═══════════════════════════════════════════════════════════ */

export const SALARY_TIPS = [
  { rule: "첫 제시는 최대치가 아니다", detail: "대부분의 오퍼는 10-20% 협상 여지가 있다. '감사합니다. 며칠 고려하겠습니다'로 시간 벌기." },
  { rule: "먼저 숫자를 말하지 마라", detail: "'현재 연봉이 얼마인가요?' → '포지션의 예산 범위를 먼저 알려주시면 맞춰서 논의하겠습니다.' 먼저 말하면 앵커링 당함." },
  { rule: "시장 데이터로 말해라", detail: "'블라인드/잡플래닛 기준으로 이 포지션은 X~Y 범위입니다. 제 경력(3년 7개월)과 성과를 고려하면 Y에 가깝다고 생각합니다.'" },
  { rule: "연봉 외 요소도 협상", detail: "RSU/스톡옵션, 사이닝 보너스, 재택근무, 교육비, 연차 등. 연봉이 안 되면 다른 항목에서 보상." },
  { rule: "한국 대기업 특수성", detail: "직급/호봉제는 협상 여지 적음. 수시 채용(토스/당근 등)이 협상 유연. 공채는 일괄 연봉인 경우 많음." },
];

export const RED_FLAGS = [
  "면접관마다 팀/역할 설명이 다르다 → 조직 정리 안 됨",
  "'야근은 거의 없어요' 뒤에 '...프로젝트 때는 좀' → 상시 야근 가능성",
  "기술 스택을 물어봤는데 명확한 답이 없다 → 기술 부채 심각 가능성",
  "면접관이 질문에 방어적이거나 불편해한다 → 팀 분위기 문제",
  "연봉 협상을 즉시 차단한다 → 경직된 문화",
  "수습 기간이 6개월 이상이다 → 신중히 판단 (업계 표준: 3개월)",
  "입사 후 업무 범위가 '유동적'이라고만 한다 → 역할 불명확",
];

/* ═══════════════════════════════════════════════════════════ */
/*  ONBOARDING 30-60-90 PLAYBOOK                               */
/* ═══════════════════════════════════════════════════════════ */

export const ONBOARDING_PLAYBOOK = [
  {
    phase: "30일 — 적응기", color: "#3b82f6",
    goals: ["코드베이스 이해: 주요 모듈 5개 파악", "첫 PR 머지 (작은 버그 픽스 OK)", "팀 스탠드업/회고에 적극 참여", "멘토/버디와 주 2회 1:1"],
    tips: ["질문을 많이 해라 — 30일 안에는 '모르겠다'가 당연", "README/Confluence 등 문서를 먼저 읽고 질문하면 더 좋은 인상", "점심 같이 먹기 제안 (비공식 네트워크 구축)"],
  },
  {
    phase: "60일 — 기여기", color: "#8b5cf6",
    goals: ["중간 크기 태스크 독립 수행", "코드 리뷰 참여 (받기 + 주기 시작)", "팀 프로세스 개선 제안 1건", "온콜/장애 대응 프로세스 숙지"],
    tips: ["'저도 리뷰해도 될까요?' → 팀 기여 신호", "작은 개선(린트 규칙, 테스트 추가)도 PR로 → 가시적 기여", "60일 자체 회고: 잘한 것 3개, 개선할 것 3개 정리"],
  },
  {
    phase: "90일 — 자립기", color: "#10b981",
    goals: ["중요 피처 리드 경험 1건", "수습 평가 준비: 성과 정리 문서 작성", "팀 내 기술 공유 1회 (짧은 발표 OK)", "향후 6개월 성장 목표 설정"],
    tips: ["수습 평가 전: 입사 시 받은 기대치와 현재 성과를 대조하여 정리", "'제가 이렇게 기여했고, 다음은 이걸 하고 싶습니다' 프레임", "30%의 신입이 90일 내 퇴사 — 여기까지 왔으면 이미 상위 70%"],
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  MOCK INTERVIEW FEEDBACK TEMPLATE                           */
/* ═══════════════════════════════════════════════════════════ */

export const MOCK_FEEDBACK_CRITERIA = [
  { id: "clarity", label: "Communication Clarity", description: "답변이 명확하고 구조적인가? STAR 프레임 사용했나?" },
  { id: "depth", label: "Technical Depth", description: "표면적 답변이 아닌 '왜'까지 설명했나?" },
  { id: "metrics", label: "Specific Metrics", description: "정량적 수치(608건, 8건 차단 등)를 사용했나?" },
  { id: "pace", label: "Pace & Filler Words", description: "적절한 속도? '음...', '그...' 3회 이하?" },
  { id: "confidence", label: "Confidence Level", description: "목소리 톤, 아이컨택, 자세가 자신감 있었나?" },
  { id: "question", label: "Reverse Questions", description: "면접 마지막 역질문이 구체적이고 인상적이었나?" },
];
