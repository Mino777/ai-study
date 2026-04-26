# iOS AI 면접: 실제 코드 예시 (Swift)
## 한국 빅테크 2026년 상반기 면접 준비

**사용법**: 각 예시를 Xcode에서 직접 실행해보고, 수정/확장하는 연습을 하기.

---

## 1️⃣ 하네스 엔지니어링 실제 구현

### 1.1 AI 생성 코드의 입력 검증 (Input Guard)

```swift
// BEFORE: 검증 없음 (위험)
func updateUserProfile(data: String) {
    let user = try! JSONDecoder().decode(User.self, from: data.data(using: .utf8)!)
    self.user = user // ← 크래시 가능
}

// AFTER: 입력 검증 (안전)
enum ValidationError: Error {
    case invalidInput(reason: String)
    case decodingFailed
}

func updateUserProfile(jsonString: String) async throws {
    // Step 1: 입력 검증 (Computational Guard - 빠름)
    guard !jsonString.isEmpty else {
        throw ValidationError.invalidInput(reason: "빈 문자열")
    }
    
    guard jsonString.count < 10_000 else {
        throw ValidationError.invalidInput(reason: "데이터 크기 초과")
    }
    
    guard let data = jsonString.data(using: .utf8) else {
        throw ValidationError.invalidInput(reason: "인코딩 실패")
    }
    
    // Step 2: 디코딩
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    
    do {
        let user = try decoder.decode(User.self, from: data)
        
        // Step 3: 의미적 검증 (Inferential Sensor - 느리지만 정확)
        let isValidUser = try await validateUserWithAI(user)
        guard isValidUser else {
            throw ValidationError.invalidInput(reason: "사용자 데이터 유효성 실패")
        }
        
        // Step 4: 업데이트
        DispatchQueue.main.async {
            self.user = user
        }
    } catch DecodingError.dataCorrupted {
        throw ValidationError.decodingFailed
    } catch {
        throw error
    }
}

// 의미적 검증: LLM-as-a-Judge
private func validateUserWithAI(_ user: User) async throws -> Bool {
    let prompt = """
    사용자 데이터를 검증하세요:
    
    {
        "id": "\(user.id)",
        "email": "\(user.email)",
        "age": \(user.age)
    }
    
    평가 기준:
    1. 이메일 형식 올바른가?
    2. 나이가 합리적인가? (18-120)
    3. 필수 필드가 있는가?
    
    JSON 응답: {"valid": boolean}
    """
    
    let response = try await claudeAPI.evaluate(prompt)
    return response.valid
}
```

### 1.2 출력 검증 (Output Validator)

```swift
// AI가 생성한 SwiftUI 뷰 코드를 검증

struct CodeValidationResult {
    let isValid: Bool
    let issues: [ValidationIssue]
    let warnings: [String]
}

struct ValidationIssue {
    enum Severity { case error, warning }
    let severity: Severity
    let message: String
    let line: Int?
}

class CodeHarness {
    // Step 1: 정적 검증 (SwiftLint)
    func validateStatically(_ swiftCode: String) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []
        
        // 검증 규칙 1: weak self 누락
        if swiftCode.contains("Task {") && !swiftCode.contains("[weak self]") {
            issues.append(ValidationIssue(
                severity: .error,
                message: "Task 클로저에서 weak self 누락",
                line: nil
            ))
        }
        
        // 검증 규칙 2: @MainActor 누락
        if swiftCode.contains("DispatchQueue.main.async") && 
           !swiftCode.contains("@MainActor") {
            issues.append(ValidationIssue(
                severity: .warning,
                message: "@MainActor 사용 고려",
                line: nil
            ))
        }
        
        // 검증 규칙 3: 타임아웃 없음
        if swiftCode.contains("URLSession.shared.data") &&
           !swiftCode.contains("timeoutInterval") {
            issues.append(ValidationIssue(
                severity: .error,
                message: "네트워크 타임아웃 설정 필수",
                line: nil
            ))
        }
        
        return issues
    }
    
    // Step 2: 의미적 검증 (LLM Judge)
    func validateSemanticly(_ swiftCode: String) async throws -> [ValidationIssue] {
        let prompt = """
        Swift 코드를 검토하세요:
        
        \(swiftCode)
        
        체크리스트:
        1. 메모리 누수 위험? (weak self, circular reference)
        2. 동시성 올바름? (@MainActor, Actor isolation)
        3. 에러 처리 완전? (try-catch, guard)
        4. 성능 문제? (불필요한 리렌더링, N+1 쿼리)
        
        JSON 응답:
        {
            "issues": [
                {"severity": "error|warning", "message": "...", "line": null}
            ]
        }
        """
        
        let result = try await claudeAPI.evaluate(prompt)
        return result.issues.map { issue in
            ValidationIssue(
                severity: issue.severity == "error" ? .error : .warning,
                message: issue.message,
                line: issue.line
            )
        }
    }
    
    // Step 3: 통합 검증 (모든 검증 실행)
    func validate(_ swiftCode: String) async throws -> CodeValidationResult {
        // 병렬 실행
        async let staticIssues = Task {
            validateStatically(swiftCode)
        }
        
        async let semanticIssues = Task {
            try await validateSemanticly(swiftCode)
        }
        
        let allIssues = try await (staticIssues.value + semanticIssues.value)
        let hasErrors = allIssues.contains { $0.severity == .error }
        
        return CodeValidationResult(
            isValid: !hasErrors,
            issues: allIssues,
            warnings: allIssues.filter { $0.severity == .warning }.map { $0.message }
        )
    }
}
```

### 1.3 폴백 전략 (Fallback)

```swift
class ResilientNetworkViewModel: ObservableObject {
    @Published var data: String = ""
    @Published var source: DataSource = .none
    
    enum DataSource {
        case none, cache, onDevice, cloud, offline
    }
    
    // Fallback Chain: 성공할 때까지 다음 단계로
    func fetchDataWithFallback(query: String) async {
        // Step 1: 캐시 시도 (가장 빠름, 비용 없음)
        if let cached = getCachedResponse(for: query) {
            DispatchQueue.main.async {
                self.data = cached
                self.source = .cache
            }
            return
        }
        
        // Step 2: 온디바이스 AI (빠름, 정확도 중간)
        if let onDeviceResult = try? await tryOnDeviceAI(query: query) {
            DispatchQueue.main.async {
                self.data = onDeviceResult
                self.source = .onDevice
            }
            return
        }
        
        // Step 3: 클라우드 AI (느림, 정확도 높음, 비용 발생)
        if let cloudResult = try? await tryCloudAI(query: query) {
            DispatchQueue.main.async {
                self.data = cloudResult
                self.source = .cloud
            }
            return
        }
        
        // Step 4: 오프라인 폴백 (항상 성공, 품질 낮음)
        DispatchQueue.main.async {
            self.data = getOfflineResponse(for: query)
            self.source = .offline
        }
    }
    
    // 각 폴백 구현
    private func getCachedResponse(for query: String) -> String? {
        return UserDefaults.standard.string(forKey: "cache_\(query)")
    }
    
    private func tryOnDeviceAI(query: String) async throws -> String {
        let session = LanguageModelSession()
        let result = try await session.respond(to: query)
        return result.content
    }
    
    private func tryCloudAI(query: String) async throws -> String {
        return try await claudeAPI.generateText(query: query)
    }
    
    private func getOfflineResponse(for query: String) -> String {
        let offlineResponses: [String: String] = [
            "hello": "안녕하세요! (오프라인 답변)",
            "help": "도움말: 인터넷 연결이 필요합니다."
        ]
        return offlineResponses[query] ?? "오프라인 모드입니다."
    }
}
```

---

## 2️⃣ 콤파운드 엔지니어링: Phase 4 (솔루션 문서화)

### 2.1 docs/solutions/ 예시 파일

```markdown
# 파일: docs/solutions/swiftui-form-validation-pattern.md

## 문제
SwiftUI TextField에서 실시간 입력값 검증 + 에러 메시지 표시

## 솔루션 (패턴)

```swift
@MainActor
final class FormViewModel: ObservableObject {
    @Published var email: String = ""
    @Published var emailError: String?
    @Published var isFormValid: Bool = false
    
    // 검증 규칙
    private let emailPattern = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$"
    
    init() {
        // 입력값 변화 감지 (Combine으로 가능하지만 Observable로도 가능)
        setupValidation()
    }
    
    private func setupValidation() {
        // 매번 호출되므로 여기서 검증
    }
    
    // 검증 메서드
    func validateEmail() {
        let isValidEmail = email.range(
            of: emailPattern,
            options: .regularExpression
        ) != nil
        
        if email.isEmpty {
            emailError = "이메일을 입력하세요"
            isFormValid = false
        } else if !isValidEmail {
            emailError = "유효한 이메일 형식이 아닙니다"
            isFormValid = false
        } else {
            emailError = nil
            isFormValid = true
        }
    }
}

struct FormView: View {
    @StateObject var viewModel = FormViewModel()
    
    var body: some View {
        VStack(spacing: 12) {
            TextField("이메일", text: $viewModel.email)
                .onChange(of: viewModel.email) {
                    viewModel.validateEmail()
                }
                .padding()
                .border(
                    Color(viewModel.emailError != nil ? .red : .gray),
                    width: 1
                )
            
            if let error = viewModel.emailError {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Button(action: {}) {
                Text("제출")
            }
            .disabled(!viewModel.isFormValid)
        }
    }
}
```

## 핵심 패턴
1. `@MainActor`로 스레드 안전성 보장
2. `onChange` 수정자로 실시간 검증
3. 에러 메시지는 Optional (표시 여부 제어)

## 엣지 케이스
- 빈 문자열 (사용자가 아직 입력하지 않음)
- 이메일 최대 길이 (254자 RFC 표준)
- 국제화 도메인명 (IDN)

## 적용 가능 프로젝트
- moneyflow (회원가입 폼)
- tarosaju (이메일 변경)
- ai-study (관리자 로그인)

## 최초 작성 일자
2026년 2월 15일

## 변경 이력
- v1.0: 기본 검증 패턴
- v1.1: 비동기 검증 지원 (서버 중복 확인)
```

### 2.2 CLAUDE.md 업데이트 (Phase 4의 산출물)

```markdown
# iOS Project CLAUDE.md

## Updated: 2026-04-25 (매 PR 후 업데이트)

### SwiftUI 폼 검증 (최신 솔루션)
패턴: docs/solutions/swiftui-form-validation-pattern.md 참조
- `@MainActor` 필수
- `.onChange` 수정자 사용
- 에러 메시지는 Optional로 처리
- 정규식 대신 가능하면 Regex 사용 (Swift 5.7+)

### 네트워킹 타임아웃 (반복된 버그)
⚠️ 필수 요구사항:
```swift
var request = URLRequest(url: url)
request.timeoutInterval = 15 // ← 절대 빼먹지 말 것
```
- 기본값 60초는 너무 길다 (사용자 이탈)
- 금융 거래는 예외: 30초

### weak self 규칙 (심각한 메모리 누수)
Task { [weak self] in  // ← 항상
    guard let self else { return }
    // 코드
}

클로저라면:
api.fetch { [weak self] data in
    guard let self else { return }
    self.update(data)
}

이유: Circular Reference → 메모리 누수 → RAM 부족 → 크래시

### @MainActor 필수 규칙
- UI 업데이트하는 메서드
- @Published var 갱신하는 메서드
- DispatchQueue.main.async 대신 사용

❌ 나쁜 예:
```swift
class ViewModel {
    func update() {
        DispatchQueue.main.async {
            self.value = newValue
        }
    }
}
```

✓ 좋은 예:
```swift
@MainActor
final class ViewModel {
    func update() {
        value = newValue  // 자동으로 메인 스레드
    }
}
```
```

---

## 3️⃣ 프롬프트 엔지니어링: Few-Shot 실제 예시

### 3.1 API 클라이언트 Few-Shot 프롬프팅

```swift
let fewShotPrompt = """
당신은 iOS 개발자입니다. 다음 2개 예시 API 클라이언트를 분석하고, 
같은 패턴으로 CommentAPIClient를 구현하세요.

[예시 1: UserAPIClient]

protocol APIClient {
    func fetch<T: Decodable>(_ endpoint: String, as type: T.Type) async throws -> T
}

final class UserAPIClient: APIClient {
    private let baseURL = "https://api.example.com"
    private let session: URLSession
    
    init(session: URLSession = .shared) {
        self.session = session
    }
    
    func fetchUser(id: String) async throws -> User {
        let url = URL(string: "\\(baseURL)/users/\\(id)")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 15  // ← 타임아웃 필수
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        return try JSONDecoder().decode(User.self, from: data)
    }
    
    enum APIError: Error {
        case invalidResponse
        case httpError(statusCode: Int)
    }
}

[예시 2: PostAPIClient]

final class PostAPIClient: APIClient {
    private let baseURL = "https://api.example.com"
    private let session: URLSession
    
    init(session: URLSession = .shared) {
        self.session = session
    }
    
    func fetchPosts(userId: String, limit: Int = 10) async throws -> [Post] {
        var components = URLComponents(string: "\\(baseURL)/users/\\(userId)/posts")!
        components.queryItems = [
            URLQueryItem(name: "limit", value: "\\(limit)")
        ]
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 15  // ← 타임아웃 필수
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: (response as? HTTPURLResponse)?.statusCode ?? -1)
        }
        
        return try JSONDecoder().decode([Post].self, from: data)
    }
    
    enum APIError: Error {
        case invalidURL
        case httpError(statusCode: Int)
    }
}

[이제 구현하세요]

위 패턴을 따라 CommentAPIClient를 구현하세요:
- 패턴: 같은 구조 (baseURL, session, timeoutInterval 15)
- 메서드: fetchComments(postId:) async throws -> [Comment]
- 에러: APIError enum 포함
- 특이점: POST 요청 지원 (createComment)

CommentAPIClient 전체 코드를 작성하세요:
"""

// 사용법:
let response = try await claudeAPI.generateCode(prompt: fewShotPrompt)
print(response)
// AI가 생성한 코드는 패턴이 90%+ 일관성 있음
```

### 3.2 Chain-of-Thought 프롬프팅

```swift
let chainOfThoughtPrompt = """
당신은 iOS 개발자입니다. 다음 요구사항을 **단계별로 생각하면서** 코드를 작성하세요.

[요구사항]
사용자가 이미지를 선택하면:
1. 이미지 압축 (JPG 70% 품질, 최대 2MB)
2. CloudKit에 업로드 (비동기, 진행률 표시)
3. 업로드 성공 시 URL 저장 (UserDefaults)
4. 실패 시 재시도 로직 (최대 3회)

[단계별 사고 과정]

Step 1: 어떤 타입이 필요한가?
- 이미지 압축: UIImage → Data
- 업로드 진행률: Progress 타입
- 재시도: for 루프 또는 recursive 함수

Step 2: 동시성 처리는?
- async/await 사용
- @MainActor (UI 업데이트 시)
- Task { } (백그라운드)

Step 3: 에러 케이스는?
- 이미지 압축 실패
- 네트워크 타임아웃
- CloudKit 권한 부족
- 저장소 부족

Step 4: 테스트하기 쉬운 구조는?
- Protocol 기반 (CloudKitService)
- Mock 클래스 (테스트용)
- 의존성 주입

[이제 구현하세요]

위 사고 과정을 반영한 complete Swift code를 작성하세요.
"""
```

---

## 4️⃣ Foundation Models 실제 사용 예시

### 4.1 기본 텍스트 생성

```swift
import Foundation

@MainActor
class SummaryViewModel: ObservableObject {
    @Published var summary: String = ""
    @Published var isLoading: Bool = false
    @Published var error: Error?
    
    // Step 1: 세션 생성 (한 번만)
    private let session = LanguageModelSession()
    
    // Step 2: 모델 사용 가능 여부 확인
    func checkAvailability() -> Bool {
        let availability = SystemLanguageModel.default.availability
        switch availability {
        case .available:
            return true
        case .unavailable(.deviceNotEligible):
            self.error = AIError.deviceNotSupported
            return false
        @unknown default:
            return false
        }
    }
    
    // Step 3: 텍스트 요약
    func summarizeText(_ text: String) async {
        guard !text.isEmpty else { return }
        
        isLoading = true
        do {
            let prompt = """
            다음 텍스트를 3문장으로 요약해줄래?
            
            [\(text)]
            """
            
            let result = try await session.respond(to: prompt)
            self.summary = result.content
            self.error = nil
        } catch {
            self.error = error
            self.summary = ""
        }
        isLoading = false
    }
    
    // Step 4: 스트리밍 (글자 하나씩 표시)
    func streamSummary(_ text: String) async {
        isLoading = true
        summary = ""
        
        do {
            let prompt = "다음을 요약: \(text)"
            let stream = session.streamResponse(to: prompt)
            
            for try await partial in stream {
                self.summary += partial.content
            }
            isLoading = false
        } catch {
            self.error = error
        }
    }
}

// UI
struct SummaryView: View {
    @StateObject var viewModel = SummaryViewModel()
    @State var inputText: String = ""
    
    var body: some View {
        VStack {
            TextEditor(text: $inputText)
                .border(Color.gray, width: 1)
                .frame(height: 150)
            
            Button("요약하기") {
                Task {
                    await viewModel.summarizeText(inputText)
                }
            }
            .disabled(!viewModel.checkAvailability() || viewModel.isLoading)
            
            if viewModel.isLoading {
                ProgressView()
            } else if !viewModel.summary.isEmpty {
                VStack(alignment: .leading) {
                    Text("요약 결과:")
                        .font(.headline)
                    Text(viewModel.summary)
                        .padding()
                        .background(Color(.systemGray6))
                }
            }
            
            if let error = viewModel.error {
                Text("에러: \(error.localizedDescription)")
                    .foregroundColor(.red)
            }
            
            Spacer()
        }
        .padding()
    }
}
```

### 4.2 구조화된 출력 (@Generable)

```swift
// Foundation Models의 강력한 기능: Generable
// AI가 타입-안전하게 출력

@Generable
struct QuizQuestion {
    let question: String
    
    @Guide(.anyOf([
        "객관식 (4개 선택지)",
        "O/X 문제",
        "단답형"
    ]))
    let type: String
    
    let correctAnswer: String
}

@MainActor
class QuizGeneratorViewModel: ObservableObject {
    @Published var question: QuizQuestion?
    @Published var isLoading: Bool = false
    
    private let session = LanguageModelSession()
    
    func generateQuestion(topic: String) async {
        isLoading = true
        
        do {
            let prompt = "주제 '\(topic)'에 관한 학습 문제를 만들어줄래?"
            
            // QuizQuestion 타입으로 직접 생성 (JSON 파싱 불필요!)
            let result: QuizQuestion = try await session.respond(
                to: prompt,
                generating: QuizQuestion.self
            ).content
            
            self.question = result
        } catch {
            print("에러: \(error)")
        }
        
        isLoading = false
    }
}

// UI
struct QuizView: View {
    @StateObject var viewModel = QuizGeneratorViewModel()
    
    var body: some View {
        VStack {
            if let q = viewModel.question {
                VStack(alignment: .leading, spacing: 12) {
                    Text("질문: \(q.question)")
                        .font(.headline)
                    
                    Text("타입: \(q.type)")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Text("정답: \(q.correctAnswer)")
                        .font(.body)
                        .padding()
                        .background(Color(.systemGray6))
                }
            }
            
            if viewModel.isLoading {
                ProgressView()
            }
        }
    }
}
```

---

## 5️⃣ 면접 실전: 코드 리뷰 시뮬레이션

### 면접관이 보여주는 AI 생성 코드

```swift
// ❌ 이 코드는 어떤 문제가 있나?

class UserListViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        Task {  // ← 문제 1
            let users = try await fetchUsers()  // ← 문제 2
            DispatchQueue.main.async {
                self.updateUI(users)  // ← 문제 3
            }
        }
    }
    
    func fetchUsers() async throws -> [User] {
        var request = URLRequest(url: userURL)
        request.setValue(apiKey, forHTTPHeaderField: "Authorization")  // ← 문제 4
        
        let (data, response) = try await URLSession.shared.data(for: request)  // ← 문제 5
        
        return try JSONDecoder().decode([User].self, from: data)
    }
}
```

### 면접관의 질문

```
Q. "이 코드를 읽어보니 5가지 문제가 있는데, 몇 개나 찾을 수 있나?"
```

### 모범 답변 (시간: 3분)

```
찾은 문제들:

❌ 문제 1: @MainActor 누락
"Task { } 내에서 UI 업데이트를 할 수 있지만, 
현재 코드는 명시적으로 메인 스레드임을 보장하지 않습니다.
더 나은 방법:
@MainActor
func updateUI(_ users: [User]) { ... }"

❌ 문제 2: 에러 처리 부재
"try await fetchUsers()가 실패하면? 
사용자에게 에러를 보여줘야 합니다.
do-catch 블록 추가 필요."

❌ 문제 3: weak self 누락
"self가 deallocate되는 동안 Task가 실행되면 크래시입니다.
Task { [weak self] in ... } 로 수정."

❌ 문제 4: API 키 평문 저장
"이건 정말 심각한 보안 문제입니다.
API 키는 Keychain에 저장해야 합니다:
let keychain = KeychainManager()
let apiKey = try keychain.retrieve(key: 'api-key')"

❌ 문제 5: 타임아웃 없음
"네트워크 요청이 무한 대기할 수 있습니다.
request.timeoutInterval = 15  추가 필수."

수정된 코드:

@MainActor
class UserListViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        Task { [weak self] in
            guard let self else { return }
            
            do {
                let users = try await self.fetchUsers()
                self.updateUI(users)
            } catch {
                self.showError(error)
            }
        }
    }
    
    func fetchUsers() async throws -> [User] {
        var request = URLRequest(url: userURL)
        request.timeoutInterval = 15
        
        let apiKey = try KeychainManager().retrieve(key: "api-key")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.invalidResponse
        }
        
        return try JSONDecoder().decode([User].self, from: data)
    }
}

결론:
이건 AI가 자주 만드는 패턴입니다.
그래서 저는 코드 리뷰 체크리스트를 만들었고,
이 5가지를 항상 검사합니다."
```

---

## 🎯 최종 팁

### 면접 준비 순서
```
1단계: 이 문서의 각 코드 예시를 Xcode에 복사해서 실행해보기
2단계: 에러가 나면 수정해보기
3단계: 각 패턴을 확장해보기 (예: 새로운 검증 규칙 추가)
4단계: 면접 시뮬레이션 (친구에게 설명하기)
5단계: GitHub에 예시 코드를 올려서 포트폴리오 구성
```

### 면접관이 "코드를 짜보세요"라고 하면
```
1. 요구사항 재확인 (5초)
2. 데이터 타입부터 정의 (30초)
3. 에러 타입 정의 (20초)
4. 핵심 로직 구현 (2분)
5. 에러 처리 추가 (1분)
6. 테스트 케이스 이야기 (1분)

→ 총 5분 내에 "생각하면서 코딩"하는 모습 보여주기
→ "이거 왜 썼나요?"라는 질문에 답할 수 있게
```

**화이팅! 🚀**
