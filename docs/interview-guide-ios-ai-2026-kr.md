# iOS 개발자 AI 면접 가이드 2026
## 한국 빅테크 회사 (네이버, 카카오, 쿠팡, 삼성) 준비 자료

**작성일**: 2026년 4월 25일
**대상**: iOS 개발자 취업 준비생
**난이도**: 신입~중급 (2-4년 경력)

---

## 📋 목차
1. [AI 코딩 도구](#1-ai-코딩-도구-claude-code--cursor)
2. [하네스 엔지니어링](#2-하네스-엔지니어링-harness-engineering)
3. [컨텍스트 엔지니어링](#3-컨텍스트-엔지니어링)
4. [콤파운드 엔지니어링](#4-콤파운드-엔지니어링-compound-engineering)
5. [프롬프트 엔지니어링](#5-프롬프트-엔지니어링)
6. [멀티-에이전트 오케스트레이션](#6-멀티-에이전트-오케스트레이션)
7. [iOS 온디바이스 AI](#7-ios-온디바이스-ai-foundation-models)
8. [바이브 코딩](#8-바이브-코딩-vibe-coding)

---

## 1. AI 코딩 도구: Claude Code & Cursor

### 1.1 기본 개념

**Q. "2026년 iOS 개발에서 Claude Code와 Cursor의 주요 차이점은?"**

A. 두 도구의 선택 기준:
- **Claude Code**: 깊이 있는 사고(Deep Reasoning), 건축 설계, 복잡한 리팩토링, 대규모 코드베이스 이해
  - 1백만 토큰 컨텍스트 윈도우 (Opus 4.6)
  - 한 번에 수십 개 컴포넌트 파일 처리 가능
  - 토큰 효율성 (Cursor 대비 5.5배 적음)
  
- **Cursor**: 대화형 편집(Interactive Editing), JSX 스타일링, 빠른 탭 자동완성, 프론트엔드 작은 수정
  - VS Code 기반 포크로 깊은 IDE 통합
  - 실시간 상호작용 최적화

**Q. "iOS 프로젝트에서 어떤 상황에 Claude Code를 선택하겠는가?"**

A. 실제 사용 시나리오:
```
상황 1: 복잡한 아키텍처 결정
→ Claude Code (전체 Xcode 프로젝트 구조 분석 가능)

상황 2: SwiftUI 뷰 스타일 조정
→ Cursor (빠른 JSX 같은 반응형 편집)

상황 3: 레이시 컨디션/동시성 버그 추적
→ Claude Code (깊이 있는 코드 추론)
```

### 1.2 인터뷰에서 자주 나오는 질문

**Q. "당신은 AI 코딩 도구를 얼마나 자주 사용하나? 어떤 상황에서 사용하지 않는가?"**

A. (회사 기대값) 신뢰성 있고 균형 잡힌 답변:
```
일주일 사용 빈도: 약 70% 코딩 시간 활용
- 보일러플레이트, 테스트, 문서 생성: AI 주도
- 보안 로직, 암호화, 인증: 100% 직접 작성
- 성능 크리티컬 알고리즘: AI 제안 후 수동 최적화

핵심: "AI는 속도를 올리는 도구지, 책임을 피하는 도구 아님"
```

**Q. "AI 코드 리뷰에 주간 11.4시간을 쏟는다고 했는데, 당신은 어떻게 효율화하는가?"**

A. 검증 전략:
1. **구조적 검증** (1단계, 10분)
   - 프로젝트 패턴 준수 확인
   - 타입 안전성 (Swift 타입 시스템)
   - 과도한 보일러플레이트 감지

2. **의미적 검증** (2단계, 15분)
   - 엣지 케이스 누락 확인
   - Equatable, Codable 프로토콜 누락
   - 메모리 누수 (약한 참조 누락)

3. **테스트 실행** (3단계, 5분)
   - 실제 기기에서 런타임 테스트
   - Xcode 콘솔 에러 확인

---

## 2. 하네스 엔지니어링 (Harness Engineering)

### 2.1 핵심 개념

**Q. "하네스 엔지니어링이란 무엇이며, iOS 개발에서 어떻게 적용하는가?"**

A. 정의:
```
에이전트 = 모델(Claude/Cursor) + 하네스(모든 것)

하네스란:
- 입력 검증 (Input Guards)
- 출력 검증 (Output Validators)
- 폴백 전략 (Fallback)
- 품질 게이트 (Quality Gates)
```

실제 iOS 예시:
```swift
// 하네스 패턴 1: 계산적 제어 (빠르고 결정적)
func validateAIGeneratedCode(_ code: String) -> ValidationResult {
    // SwiftLint 실행
    let lintErrors = runSwiftLint(code)
    
    // 타입 체커 실행
    let typeErrors = runSwiftTypeChecker(code)
    
    if !lintErrors.isEmpty || !typeErrors.isEmpty {
        return .failed(lintErrors + typeErrors)
    }
    return .passed
}

// 하네스 패턴 2: LLM-as-a-Judge (느리지만 의미적)
func judgeCodeQuality(
    aiGeneratedCode: String,
    existingPatterns: [String]
) async throws -> QualityScore {
    let prompt = """
    아래 코드를 검토하세요:
    \(aiGeneratedCode)
    
    프로젝트 패턴:
    \(existingPatterns.joined(separator: "\n"))
    
    평가 기준:
    1. 패턴 일관성 (0-10)
    2. 에러 처리 완전성 (0-10)
    3. 성능 (0-10)
    """
    
    let judgment = try await claudeAPI.evaluate(prompt)
    return parseScore(judgment)
}
```

### 2.2 품질 게이트 (Quality Gates)

**Q. "AI 생성 iOS 코드를 프로덕션에 머지하기 전 어떤 게이트를 설정하는가?"**

A. 4단계 게이트:
```
┌─────────────────────────────────────┐
│ 1. 문법 게이트 (자동, 10초)          │
├─────────────────────────────────────┤
│ swiftc --typecheck                  │
│ SwiftLint (custom rules)            │
│ APISurface 호환성                   │
└────────── PASS → 2번 ─────────────┘

┌─────────────────────────────────────┐
│ 2. 패턴 게이트 (LLM Judge, 30초)    │
├─────────────────────────────────────┤
│ "프로젝트와 일관성 있는가?"         │
│ "WeakSelf 패턴 정확한가?"           │
│ "필요한 try-catch가 있는가?"        │
└────────── PASS → 3번 ─────────────┘

┌─────────────────────────────────────┐
│ 3. 테스트 게이트 (자동, 실제 기기)  │
├─────────────────────────────────────┤
│ XCTest 실행                         │
│ 메모리 누수 프로파일링              │
│ 성능 회귀 감지                      │
└────────── PASS → 4번 ─────────────┘

┌─────────────────────────────────────┐
│ 4. 보안 게이트 (수동, 리뷰어 필수)  │
├─────────────────────────────────────┤
│ Keychain 사용 여부                  │
│ 암호화 강도                         │
│ 데이터 노출 위험도                  │
└────────── PASS → 머지 ──────────┘
```

### 2.3 인터뷰 예상 질문

**Q. "LLM-as-a-Judge에서 신뢰성 문제가 있을 수 있는데, 어떻게 해결하는가?"**

A. LLM 판사의 약점과 대책:
```
약점 1: "코드가 실제로 실행되는지 확인 못함"
→ 대책: 반드시 XCTest 자동 실행으로 검증

약점 2: "포맷 변화에 민감 (같은 코드 다르게 평가)"
→ 대책: 정형화된 체크리스트 사용 (자유형 평가 X)

약점 3: "글의 길이에 영향받음 (긴 코드는 높게 평가)"
→ 대책: 정규화된 점수 시스템 (0-10 고정)

점수 검증:
┌──────────────────────────────────────┐
│ 같은 코드를 5번 다시 평가해서        │
│ 점수 표준편차가 0.5 이하면 신뢰도 높음
│ (표준편차 > 1.0이면 다시 프롬프트 조정)
└──────────────────────────────────────┘
```

---

## 3. 컨텍스트 엔지니어링 (Context Engineering)

### 3.1 핵심 개념

**Q. "RAG vs 직접 컨텍스트 주입, iOS 개발에서 어떤 것을 선택하는가?"**

A. 결정 기준:
```
선택 1: 직접 컨텍스트 주입 (Simple, 권장)
- 코드베이스 작음 (< 100KB)
- 패턴이 안정적이고 자주 안 바뀜
- 레이턴시 critical (의료, 금융앱)

예시: 
"다음 패턴을 따르세요:
[5개의 기존 ViewModels 전체 코드]
위 패턴대로 새로운 UserProfileViewModel 작성"

선택 2: RAG 시스템 (Complex)
- 코드베이스 매우 큼 (1000+ 파일)
- 문서/가이드가 자주 업데이트됨
- 토큰 예산이 제한적

예시:
AI에게 검색 권한 주고:
"최근 iOS 모듈화 문서를 찾아 읽고,
그 패턴으로 새 feature 설계해줘"
```

### 3.2 Context Window 관리

**Q. "Claude Code의 1백만 토큰 컨텍스트를 iOS 프로젝트에서 어떻게 활용하는가?"**

A. 실제 활용:
```
컨텍스트 배분 (1백만 토큰 = 약 250,000 단어):

1. 시스템 프롬프트 & 가이드: 20,000 토큰
   - CLAUDE.md (프로젝트 규약)
   - 스타일 가이드 (SwiftUI 패턴)
   
2. 프로젝트 구조 & 타입 정의: 200,000 토큰
   - Xcode 프로젝트 폴더 구조
   - 주요 Model/ViewModel 정의
   - API Client 타입 정의
   
3. 관련 기존 코드: 500,000 토큰
   - 유사한 기능의 완성된 코드 (복사-붙여넣기 예시)
   - 테스트 케이스
   - 에러 처리 패턴
   
4. 현재 작업: 280,000 토큰
   - 새로 구현할 기능 설명
   - 토론 & 반복 (메시지 왕복)

⚠️ 주의: 60% 이상 소진 시 컨텍스트 윈도우 압축하기
(새 세션 시작 또는 관련 없는 파일 제거)
```

### 3.3 iOS 특화 컨텍스트 팁

**Q. "SwiftUI 앱의 복잡한 화면을 AI에 구현시킬 때, 어떤 컨텍스트를 먼저 줄 것인가?"**

A. 순서:
```
1순위: 데이터 타입 (Model)
      → AI가 UI 구조 유추 가능

2순위: 기존 비슷한 화면 코드
      → 패턴 일관성 보장

3순위: 디자인 스펙 (Figma 링크)
      → 레이아웃 정확도

4순위: 에러 케이스 목록
      → 엣지 케이스 처리

예시 프롬프트:
───────────────────────────────
당신은 iOS 개발자입니다.

데이터 모델:
[User, Post, Comment struct 정의]

기존 화면 (참고):
[HomeView 전체 코드 - SwiftUI 패턴]

새로 구현할 화면:
- UserProfileView
- 프로필 사진, 팔로우 버튼, 게시물 리스트
- 로딩 상태, 에러 상태 처리 필수

[디자인 스펙]
───────────────────────────────
```

---

## 4. 콤파운드 엔지니어링 (Compound Engineering)

### 4.1 핵심 개념

**Q. "콤파운드 엔지니어링이 무엇이고, 왜 한국 빅테크에서 중요한가?"**

A. 정의와 가치:
```
콤파운드 엔지니어링 = 매 세션 개선 루프

기존 개발:
PR1 → 머지 → 복잡도↑ → PR2 → ...
(매번 더 어려워짐)

콤파운드 개발:
PR1 → 머지 → 솔루션 문서화 → CLAUDE.md 업데이트 
  → PR2 (더 쉬움) → 또 다시 문서화 → PR3 (훨씬 더 쉬움)
(지수 함수처럼 가속화)

한국 빅테크 관점:
- 네이버/카카오: 2026년 AI 에이전트 대확대 계획
  → 에이전트가 새로운 기능 구현하기 쉽게 만든 팀이 경쟁 우위
- 쿠팡: 초고속 배포 문화
  → 콤파운드 방식이 토큰 비용 70% 절감
```

### 4.2 4단계 루프

**Q. "콤파운드 엔지니어링의 Plan-Work-Review-Compound 루프를 설명하고, 각 단계의 목표를 말하시오."**

A. 실제 iOS 프로젝트 사례:
```
┌─────────────────────────────────────────┐
│ Phase 1: PLAN (2시간)                   │
├─────────────────────────────────────────┤
│ 요구사항 분석                           │
│ 아키텍처 설계                           │
│ AI 프롬프트 준비                        │
│ 출력: 상세한 구현 계획서                │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Phase 2: WORK (3시간)                   │
├─────────────────────────────────────────┤
│ Claude Code가 90% 구현                  │
│ 개발자 손으로 마무리                    │
│ 테스트 작성                             │
│ 출력: 완성된 PR                         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Phase 3: REVIEW (2시간)                 │
├─────────────────────────────────────────┤
│ 14개 전문 에이전트 병렬 리뷰:           │
│  - 보안 (Keychain 사용, 암호화)        │
│  - 성능 (메모리 누수, 렌더링)          │
│  - SwiftUI (상태 관리, 리렌더링 버그)  │
│  - 네트워킹 (타임아웃, 재시도)         │
│  - 데이터 (Codable, 동시성)            │
│  - 테스트 (커버리지, 엣지 케이스)      │
│  - 아키텍처 (의존성 역전, 계층)        │
│  - 접근성 (VoiceOver, 동적 타입)       │
│ 출력: 리뷰 코멘트 & 개선 제안           │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Phase 4: COMPOUND (1.5시간)            │
├─────────────────────────────────────────┤
│ A. CHANGELOG 작성                       │
│    "이번 PR에서 뭘 배웠는가?"          │
│                                         │
│ B. 솔루션 문서화                       │
│    docs/solutions/ 폴더에 저장          │
│    예: "SwiftUI 폼 검증 패턴"          │
│    코드 + 설명 + 테스트 케이스         │
│                                         │
│ C. CLAUDE.md 업데이트                  │
│    "다음 프로젝트에서 실수 반복 방지"  │
│    - "weak self 무조건 사용"           │
│    - "네트워킹은 항상 타임아웃 처리"   │
│    - "SwiftUI 상태는 @StateObject"     │
│                                         │
│ D. 새 스킬/프롬프트 생성                │
│    다음 번에 AI가 더 잘하도록          │
│                                         │
│ 출력: 제도화된 지식 & 미래 가속도       │
└─────────────────────────────────────────┘

초기 상태:
- Phase 1 (PLAN): 2시간 → Phase 2 (WORK): 3시간 (AI가 할 일 많음)

1개월 후:
- Phase 1 (PLAN): 1시간 (패턴 알아서 따름)
- Phase 2 (WORK): 1시간 (AI가 더 많이 스스로 함)

3개월 후:
- Phase 1 (PLAN): 30분
- Phase 2 (WORK): 30분
(지수 함수적 가속화)
```

### 4.3 측정 가능한 성과

**Q. "콤파운드 엔지니어링으로 얻을 수 있는 구체적인 메트릭은?"**

A. 실제 측정값:
```
✓ 속도 향상
  - 1주일째: PR당 평균 5시간
  - 4주일째: PR당 평균 2.5시간
  - 12주일째: PR당 평균 1시간 (5배 가속)

✓ 품질 향상
  - 버그율: 주당 2-3개 → 0.5개
  - 테스트 커버리지: 70% → 95%
  - 코드 리뷰 코멘트: 10+ → 2-3개

✓ 토큰 효율성
  - Claude API 비용: PR당 $50 → $15 (70% 절감)
  - 이유: 첫 번째 PR은 AI가 많이 했지만, 
          2-10번째 PR은 AI 가이드만 명확해서 토큰 적게 씀

✓ 팀 규모 효율화
  - Every.io: 5개 프로덕트 → 1명 개발자/프로덕트
    (일반적으로 3명 필요)
  - 한국 팀 적용 시: 5명 팀 → 1명 투입으로 5개 프로젝트 관리 가능
```

---

## 5. 프롬프트 엔지니어링 (Prompt Engineering)

### 5.1 iOS 개발자를 위한 프롬프트 기법

**Q. "Zero-shot, Few-shot, Chain-of-Thought 프롬프팅의 차이와 iOS에서의 활용을 설명하시오."**

A. 실전 예시:

#### 5.1.1 Zero-Shot (상황: 간단한 코드)
```
프롬프트:
───────────────────────────────
SwiftUI에서 TextField 입력값 유효성 검사하는 
다음 코드를 작성해줄래?

요구사항:
- 이메일 형식 검증
- 6자 이상 비밀번호
- 실시간 피드백

결과:
✓ 간단한 코드 생성 (정확도 70%)
✗ 에러 처리, 로딩 상태 누락
```

#### 5.1.2 Few-Shot (상황: 일관된 패턴 필요)
```
프롬프트:
───────────────────────────────
다음 2개 예시처럼 네트워킹 관련 ViewModel을 구현하세요:

예시 1:
class UserFetchViewModel: ObservableObject {
    @Published var state: LoadingState = .idle
    
    func fetch() async {
        state = .loading
        do {
            let user = try await api.fetchUser()
            state = .success(user)
        } catch {
            state = .failure(error)
        }
    }
}

예시 2:
class PostFetchViewModel: ObservableObject {
    @Published var state: LoadingState = .idle
    
    func fetch() async {
        state = .loading
        do {
            let posts = try await api.fetchPosts()
            state = .success(posts)
        } catch {
            state = .failure(error)
        }
    }
}

이제 CommentFetchViewModel을 같은 패턴으로 작성해주세요.

결과:
✓ 패턴 일관성 90%+ (같은 구조 반복)
✓ 에러 처리, 로딩 상태 자동 포함
✗ 특수한 비즈니스 로직은 아직 수동 추가
```

#### 5.1.3 Chain-of-Thought (상황: 복잡한 로직)
```
프롬프트:
───────────────────────────────
다음 요구사항을 단계별로 생각하면서 코드를 작성하세요:

요구사항:
"사용자 프로필을 로드하고, 팔로워 목록을 동시에 가져온 후,
팔로워가 사용자를 팔로우하지 않은 경우만 필터링"

단계별 사고:
1. 어떤 데이터를 불러와야 하는가?
2. 어떤 변수가 필요한가?
3. 에러 케이스는 뭔가?
4. 동시성을 어떻게 처리할 것인가?

결과 코드:
───────────────────────────────
class UserDetailViewModel: ObservableObject {
    @Published var user: User?
    @Published var nonFollowers: [User] = []
    @Published var state: LoadingState = .idle
    
    func loadUserAndFollowers(userId: String) async {
        state = .loading
        do {
            // 단계 1: 사용자와 팔로워 동시 로드
            async let userTask = api.fetchUser(id: userId)
            async let followersTask = api.fetchFollowers(userId: userId)
            
            let user = try await userTask
            let followers = try await followersTask
            
            // 단계 2: 사용자를 팔로우하지 않은 사람 필터링
            let nonFollowers = try await filterNonFollowers(
                followers: followers,
                userId: userId
            )
            
            self.user = user
            self.nonFollowers = nonFollowers
            state = .success(nonFollowers)
        } catch {
            state = .failure(error)
        }
    }
    
    private func filterNonFollowers(
        followers: [User],
        userId: String
    ) async throws -> [User] {
        return try await followers.asyncFilter { follower in
            let isFollowing = try await api.checkFollowing(
                from: follower.id,
                to: userId
            )
            return !isFollowing
        }
    }
}

결과:
✓ 동시성 정확성 95% (async let 올바름)
✓ 에러 처리 완벽
✓ 엣지 케이스 고려됨
```

### 5.2 구조화된 출력 (Structured Output)

**Q. "JSON 구조 지정으로 AI의 출력을 검증 가능하게 하는 방법은?"**

A. iOS의 Codable 활용:
```swift
// 1단계: 구조 정의
struct ValidationRequest: Codable {
    let code: String
    let criteria: [String]
}

struct ValidationResponse: Codable {
    let isValid: Bool
    let score: Int // 0-100
    let issues: [Issue]
    
    struct Issue: Codable {
        let severity: String // "error", "warning"
        let message: String
        let line: Int?
    }
}

// 2단계: AI 프롬프트 (JSON 구조 명시)
let prompt = """
다음 Swift 코드를 검증하고, JSON으로 응답하세요:

코드:
\(swiftCode)

평가 기준:
\(criteria.joined(separator: "\n"))

JSON 형식 (반드시 이 구조로):
{
    "isValid": boolean,
    "score": number (0-100),
    "issues": [
        {
            "severity": "error" | "warning",
            "message": "string",
            "line": number or null
        }
    ]
}

JSON만 응답하세요. 설명은 제외.
"""

// 3단계: 응답 파싱 (타입 안전)
let response = try await ai.request(prompt)
let validation = try JSONDecoder().decode(
    ValidationResponse.self,
    from: response.data(using: .utf8)!
)

// 4단계: 자동 검증
if !validation.isValid || validation.score < 80 {
    print("코드 품질 부족: \(validation.issues)")
}
```

### 5.3 시스템 프롬프트 vs 사용자 프롬프트

**Q. "CLAUDE.md에는 어떤 iOS 가이드라인을 써야 하는가?"**

A. 실제 구성:

```markdown
# iOS Project CLAUDE.md

## Architecture
- MVVM + Coordinator 패턴 필수
- 상태 관리는 @StateObject (Observable) 사용
- EnvironmentObject는 deprecated 취급

## SwiftUI Patterns
- wrap할 때 NavigationStack 사용 (deprecated NavigationView 금지)
- .task(id:) 사용으로 의존성 추적 (withAnimation은 신중하게)
- @Query (SwiftData) 또는 @FetchRequest (CoreData) 명시

## Networking
- URLSession + Codable 필수
- 모든 네트워크 요청은 타임아웃 15초
- 재시도 로직: exponential backoff (base 2초, max 3회)
- 에러는 구체적인 enum으로 (String 금지)

## Memory Management
- weak self 무조건 사용 (클로저 내)
- @weak 속성 사용 금지 (Swift 6 호환 불가)
- 순환 참조 의심: retain cycle 검사 필수

## Testing
- 모든 public API는 XCTest 필수
- 커버리지 목표: 80%+
- Mock/Stub은 Protocol 기반

## Code Style
- 함수명: lowerCamelCase
- 클래스명: UpperCamelCase
- private 먼저 선언 (위에서 아래로)

## Guardrails (LLM-as-Judge 이용)
- SwiftUI Preview 누락: FAIL
- 에러 타입 정의 없음: FAIL
- 네트워킹 타임아웃 없음: FAIL
```

---

## 6. 멀티-에이전트 오케스트레이션 (Multi-Agent Orchestration)

### 6.1 아키텍트-워커 패턴

**Q. "멀티-에이전트 오케스트레이션에서 '아키텍트-워커' 패턴을 설명하고, iOS 팀에서 어떻게 적용하는가?"**

A. 개념과 실제:
```
패턴: 아키텍트-워커 (Orchestrator-Worker)

최상위: 아키텍트 에이전트 (Architect)
역할:
- 큰 그림 보기 (전체 iOS 앱 아키텍처)
- 작업 분해 (기능 → 태스크로 분해)
- 조율 (워커 간 의존성 관리)
- 최종 검증

예: "iOS 앱에 지불 기능을 추가해야 한다"
    → 아키텍트가 다음으로 분해:
      1. PaymentModel 정의
      2. PaymentService API 클라이언트
      3. PaymentViewController UI
      4. 결제 상태 머신
      5. 에러 처리 전략

┌─────────────────────┐
│   Architect Agent   │
│  (큰 그림 설계)     │
└──────────┬──────────┘
           │
    ┌──────┼──────┬──────┬─────┐
    ↓      ↓      ↓      ↓     ↓
  워커1   워커2   워커3  워커4  워커5
 (Model) (API) (UI) (State) (Error)

각 워커의 역할:
- 워커1 (Model): "PaymentModel은 뭘 포함해야 하나?"
- 워커2 (API): "Payment API 호출은 어떻게?"
- 워커3 (UI): "결제 화면의 SwiftUI 코드"
- 워커4 (State): "결제 상태는 어떻게 관리?"
- 워커5 (Error): "실패 케이스 처리"

통신: API Contract (단일 진실 공급원)

[PaymentAPI.swift]
───────────────────────
struct PaymentRequest: Codable {
    let amount: Decimal
    let currency: String
    let userId: String
}

struct PaymentResponse: Codable {
    let transactionId: String
    let status: String // "pending", "success", "failed"
    let timestamp: Date
}

← 이 계약서에 모든 에이전트가 따름
← 워커1-5가 각각 독립적으로 작업
← 최후에 아키텍트가 통합
```

### 6.2 한국 빅테크의 적용 사례

**Q. "네이버/카카오의 '에이전트 AI 플랫폼' 출시 소식을 들었는데, 이게 멀티-에이전트와 어떤 관계인가?"**

A. 2026 트렌드:
```
네이버 (2026년 Q1):
- 쇼핑 AI 에이전트 ("Naver Shopping AI")
- 여행 AI 에이전트 ("Travel Agent")
- 금융 AI 에이전트
→ 한 사용자가 여러 에이전트와 상호작용
→ 에이전트들 간 데이터 공유 (주문 정보 → 여행 추천)
→ iOS 개발자는 "에이전트 간 데이터 흐름 설계"를 이해해야 함

카카오 (2026년 Q1):
- "Kanana" 멀티-에이전트 플랫폼 출시
- 전자상거래, 금융, 생활 서비스 통합
→ iOS 개발자: 에이전트 API 통합 능력 필요

기술 요구사항:
1. 에이전트 A의 출력 → 에이전트 B의 입력 (파이프라인)
2. 비동기 에이전트 호출 관리 (async/await 깊이 이해)
3. 에이전트 실패 시 폴백 전략
4. 개인정보 보호 (에이전트 간 데이터 교환 때)
```

### 6.3 인터뷰 예상 질문

**Q. "만약 쿠팡에서 추천 시스템을 개발하는데, '상품 검색 에이전트'와 '가격 비교 에이전트'가 동시에 작동해야 한다면, iOS 앱은 어떻게 설계하겠는가?"**

A. 구현 전략:
```swift
// 1단계: 에이전트 API 컨트랙트 정의
protocol Agent {
    associatedtype Input: Codable
    associatedtype Output: Codable
    
    func call(with input: Input) async throws -> Output
}

// 2단계: 각 에이전트 구현
struct SearchAgent: Agent {
    typealias Input = SearchQuery
    typealias Output = [Product]
    
    func call(with query: SearchQuery) async throws -> [Product] {
        // 상품 검색 로직
    }
}

struct PriceAgent: Agent {
    typealias Input = [Product]
    typealias Output = [(Product, Price)]
    
    func call(with products: [Product]) async throws -> [(Product, Price)] {
        // 각 상품의 가격 비교 로직
    }
}

// 3단계: 오케스트레이터 (iOS ViewModel)
class ProductRecommendationViewModel: ObservableObject {
    @Published var results: [(Product, Price)] = []
    @Published var state: LoadingState = .idle
    
    private let searchAgent = SearchAgent()
    private let priceAgent = PriceAgent()
    
    func fetchRecommendations(query: SearchQuery) async {
        state = .loading
        do {
            // 병렬 실행이 아니라 순차 실행 (가격은 상품 목록 필요)
            let products = try await searchAgent.call(with: query)
            let pricesAndProducts = try await priceAgent.call(with: products)
            
            self.results = pricesAndProducts
            state = .success(pricesAndProducts)
        } catch {
            state = .failure(error)
        }
    }
}

// 4단계: 폴백 전략 (하나 실패해도 앱 동작)
class ResilientOrchestratorViewModel: ObservableObject {
    @Published var results: [(Product, Price)] = []
    
    func fetchWithFallback(query: SearchQuery) async {
        do {
            let products = try await searchAgent.call(with: query)
            
            // 가격 비교는 optional (실패 가능)
            let pricesAndProducts: [(Product, Price)]
            do {
                pricesAndProducts = try await priceAgent.call(with: products)
            } catch {
                // 가격 실패 → 상품만이라도 보여주기
                pricesAndProducts = products.map { ($0, .unavailable) }
            }
            
            self.results = pricesAndProducts
        } catch {
            // 검색 자체 실패 → 캐시된 데이터 또는 에러 표시
            self.results = []
        }
    }
}
```

---

## 7. iOS 온디바이스 AI: Foundation Models

### 7.1 Apple Intelligence 개요

**Q. "2026년 iOS 26에서 도입된 Foundation Models 프레임워크의 주요 특징은?"**

A. 핵심 포인트:
```
Apple Foundation Models Framework (iOS 26+):

1. 온디바이스 실행 (맥 또는 신경처리장치 사용)
   ✓ 개인정보 보호 (데이터가 디바이스에서 나가지 않음)
   ✓ 무료 (API 호출 비용 없음)
   ✓ 오프라인 작동 (인터넷 필요 없음)
   ✗ 모델 크기 제한 (~3B 파라미터, Claude 대비 작음)

2. 지원 디바이스
   ✓ iPhone 15 Pro 이상
   ✓ iPad (M1 칩 이상)
   ✓ Mac (Apple Silicon)
   ✗ iPhone 15 standard (불가)

3. 능력 (3B 모델의 범위)
   ✓ 텍스트 요약
   ✓ 개체 추출 (이름, 위치, 숫자)
   ✓ 감정 분석
   ✓ 짧은 대화
   ✓ 창의적 쓰기
   ✗ 복잡한 추론 (계산, 코딩 생성)
   ✗ 최신 정보 (학습은 2024년까지)
```

### 7.2 Foundation Models 사용 방법

**Q. "Foundation Models 프레임워크로 iOS 앱에 AI 기능을 추가하는 최소 코드는?"**

A. 실전 코드:

#### 7.2.1 기본 텍스트 생성
```swift
import Foundation

// iOS 26+ 필수
class AIAssistantViewModel: ObservableObject {
    @Published var response: String = ""
    @Published var isLoading: Bool = false
    @Published var error: Error?
    
    // STEP 1: 모델 세션 생성 (한 번만)
    lazy var session: LanguageModelSession = {
        let config = LanguageModelConfiguration()
        return try! LanguageModelSession(configuration: config)
    }()
    
    // STEP 2: 모델 사용 가능 여부 확인
    func checkAvailability() -> Bool {
        let availability = SystemLanguageModel.default.availability
        switch availability {
        case .available:
            return true
        case .unavailable(.deviceNotEligible):
            error = AIError.deviceNotSupported
            return false
        case .unavailable(.needsUpdate):
            error = AIError.osUpdateNeeded
            return false
        case .unavailable(.languageNotSupported):
            error = AIError.languageNotSupported
            return false
        @unknown default:
            return false
        }
    }
    
    // STEP 3: 텍스트 생성
    func generateText(prompt: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let result = try await session.respond(to: prompt)
            DispatchQueue.main.async {
                self.response = result.content
            }
        } catch {
            DispatchQueue.main.async {
                self.error = error
            }
        }
    }
    
    // STEP 4: 스트리밍 (실시간으로 글자 하나씩)
    func generateStreamingText(prompt: String) async {
        isLoading = true
        response = ""
        
        do {
            let stream = session.streamResponse(to: prompt)
            for try await partial in stream {
                DispatchQueue.main.async {
                    self.response += partial.content
                }
            }
            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }
}

// STEP 5: SwiftUI 뷰에서 사용
struct AIView: View {
    @StateObject var viewModel = AIAssistantViewModel()
    @State var userInput: String = ""
    
    var body: some View {
        VStack {
            // 응답 표시
            ScrollView {
                Text(viewModel.response)
                    .padding()
            }
            
            // 입력 필드
            HStack {
                TextField("프롬프트 입력", text: $userInput)
                    .disabled(viewModel.isLoading)
                
                Button("전송") {
                    Task {
                        await viewModel.generateText(prompt: userInput)
                    }
                }
                .disabled(!viewModel.checkAvailability())
            }
            .padding()
        }
    }
}
```

#### 7.2.2 구조화된 출력 (Generable 매크로)
```swift
import Foundation

// 구조화된 출력이 필요한 이유:
// - JSON 파싱 에러 없음 (Swift 타입으로 직접 생성)
// - 타입 안전성 (컴파일 타임 검증)
// - 토큰 효율적 (AI가 불필요한 말 못함)

// 예시 1: 영화 추천 (구조화)
@Generable
struct MovieRecommendation {
    let title: String
    
    @Guide(.anyOf(["PG", "PG-13", "R", "G"]))
    let rating: String
    
    @Guide(.minimumCount(1), .maximumCount(5))
    let genres: [String]
    
    let reason: String
}

class MovieRecommenderViewModel: ObservableObject {
    @Published var recommendation: MovieRecommendation?
    
    lazy var session = LanguageModelSession()
    
    func recommendMovie(basedOn movieTitle: String) async {
        do {
            // @Generable 구조체로 직접 생성 (JSON 파싱 불필요)
            let recommendation: MovieRecommendation = try await session.respond(
                to: "영화 '\(movieTitle)'와 비슷한 영화를 추천해줄래?",
                generating: MovieRecommendation.self
            ).content
            
            DispatchQueue.main.async {
                self.recommendation = recommendation
            }
        } catch {
            print("추천 실패: \(error)")
        }
    }
}

// 예시 2: 앱 내 설문조사 동적 생성
@Generable
enum QuizQuestion {
    case multipleChoice(
        question: String,
        options: [String],
        correctIndex: Int
    )
    case trueOrFalse(
        statement: String,
        correct: Bool
    )
    case shortAnswer(
        question: String
    )
}

class QuizGeneratorViewModel: ObservableObject {
    @Published var questions: [QuizQuestion] = []
    
    lazy var session = LanguageModelSession()
    
    func generateQuiz(topic: String, count: Int) async {
        do {
            var generatedQuestions: [QuizQuestion] = []
            
            for i in 0..<count {
                let question: QuizQuestion = try await session.respond(
                    to: "주제 '\(topic)'에 관한 학습 문제 \(i+1)을 만들어줄래?",
                    generating: QuizQuestion.self
                ).content
                
                generatedQuestions.append(question)
            }
            
            DispatchQueue.main.async {
                self.questions = generatedQuestions
            }
        } catch {
            print("문제 생성 실패: \(error)")
        }
    }
}
```

#### 7.2.3 Tool Calling (외부 데이터 접근)
```swift
// 3B 모델의 제한: 최신 데이터나 앱 내 정보를 모름
// 해결책: Tool Calling으로 앱이 외부 데이터 제공

class FitnessCoachViewModel: ObservableObject {
    @Published var advices: [String] = []
    
    lazy var session = LanguageModelSession()
    
    // Tool 1: 사용자의 최근 운동 데이터
    @ToolParameter
    var getUserWorkouts: () async throws -> [Workout] = {
        // 앱의 HealthKit 데이터에서 가져오기
        let healthStore = HKHealthStore()
        return try await healthStore.getRecentWorkouts()
    }
    
    // Tool 2: 사용자의 목표
    @ToolParameter
    var getUserGoal: () async throws -> String = {
        // 앱의 설정에서 가져오기
        return UserDefaults.standard.string(forKey: "fitnessGoal") ?? "건강"
    }
    
    func getPersonalizedAdvice() async {
        do {
            let prompt = """
            나의 최근 운동 기록과 목표를 보고 개인 맞춤 조언을 해줄래?
            
            내 도구들:
            1. getUserWorkouts() - 최근 운동 데이터
            2. getUserGoal() - 내 피트니스 목표
            """
            
            let result = try await session.respond(to: prompt)
            // AI가 필요시 tool을 호출해서 정보 수집한 후
            // 그에 맞는 조언 생성
            
            DispatchQueue.main.async {
                self.advices = [result.content]
            }
        } catch {
            print("조언 생성 실패: \(error)")
        }
    }
}
```

### 7.3 에러 처리와 폴백

**Q. "Foundation Models가 사용 불가능한 경우 (구형 iPhone), iOS 앱은 어떻게 우아하게 대응해야 하는가?"**

A. 폴백 전략:

```swift
class SmartAIViewModel: ObservableObject {
    @Published var response: String = ""
    @Published var isUsingCloud: Bool = false
    
    lazy var onDeviceSession = LanguageModelSession()
    let cloudAPIClient = ClaudeAPIClient()
    
    // 우아한 폴백: 온디바이스 → 클라우드 → 오프라인
    func generateResponse(prompt: String) async {
        // 1단계: 온디바이스 모델 시도
        if let onDeviceResult = try? await tryOnDevice(prompt: prompt) {
            DispatchQueue.main.async {
                self.response = onDeviceResult
                self.isUsingCloud = false
            }
            return
        }
        
        // 2단계: 클라우드 폴백
        if let cloudResult = try? await tryCloud(prompt: prompt) {
            DispatchQueue.main.async {
                self.response = cloudResult
                self.isUsingCloud = true
            }
            return
        }
        
        // 3단계: 오프라인 폴백 (미리 저장된 답변)
        DispatchQueue.main.async {
            self.response = self.getOfflineResponse(for: prompt)
        }
    }
    
    private func tryOnDevice(prompt: String) async throws -> String {
        let result = try await onDeviceSession.respond(to: prompt)
        return result.content
    }
    
    private func tryCloud(prompt: String) async throws -> String {
        // Claude API 호출 (비용 발생)
        return try await cloudAPIClient.generateText(prompt: prompt)
    }
    
    private func getOfflineResponse(for prompt: String) -> String {
        // 미리 저장된 FAQ 또는 템플릿
        let localResponses = [
            "workout": "집에서 할 수 있는 운동: 플랭크, 스쿼트, 팔굽혀펴기",
            "nutrition": "기본 식단: 단백질, 채소, 탄수화물 균형"
        ]
        
        for (key, response) in localResponses {
            if prompt.lowercased().contains(key) {
                return response
            }
        }
        
        return "인터넷 연결이 필요합니다."
    }
}
```

### 7.4 면접 예상 질문

**Q. "Foundation Models와 클라우드 AI (Claude API)를 쓸 때, iOS 개발자가 고려해야 할 비용 차이는?"**

A. 비용 비교:
```
온디바이스 (Foundation Models):
- 초기: $0 (모델은 OS에 포함)
- 지속: $0 (네트워크 비용 없음)
- 제약: 3B 모델 (기본 작업만 가능)

클라우드 (Claude API):
- 초기: $0 (무료 시작)
- 지속: 입력 토큰 $3/M, 출력 토큰 $15/M
- 예: 10,000 사용자 × 월 100회 API 호출
     = 약 $300/월 (수용 가능)

결정 기준:
┌──────────────────────────────┐
│ 기능              온디바이스 vs 클라우드
├──────────────────────────────┤
│ 요약              ✓ (빠름)   vs ✓ (정확)
│ 개체추출          ✓ (빠름)   vs ✓ (정확)
│ 창의 쓰기         ✗ (약함)   vs ✓ (우수)
│ 코딩 생성         ✗ (약함)   vs ✓ (강함)
│ 복잡 추론         ✗ (약함)   vs ✓ (강함)
│ 개인정보 보호     ✓          vs ✗
│ 오프라인          ✓          vs ✗
│ 지연시간 (P95)    <100ms     vs 500-1000ms
└──────────────────────────────┘

추천:
- 요약/분류: 온디바이스
- 창의/코딩: 클라우드
- 혼합: 온디바이스 먼저 → 실패 시 클라우드
```

---

## 8. 바이브 코딩 (Vibe Coding)

### 8.1 정의와 위험성

**Q. "바이브 코딩이란 무엇이고, 프로덕션 iOS 앱에서는 왜 위험한가?"**

A. 정의와 문제점:
```
바이브 코딩 정의:
- "AI에 자연언어로 명령 → 코드 복사-붙여넣기 → 테스트 (이해 없음)"
- "코드가 뭘 하는지 실제로 모르지만 동작하면 됨"

문제점 (iOS 특화):

1. 메모리 누수 위험 ⚠️
   바이브 코딩으로 생성된 클로저:
   weak self 누락 → UIViewController 메모리 못 해제
   → 앱 메모리 사용량 계속 증가 (RAM 부족 크래시)

2. 동시성 버그 ⚠️⚠️
   Swift Concurrency (async/await)의 rule 위반:
   - @MainActor 누락
   - Actor isolation 위반
   - Task 캔슬 미처리
   → 난수처럼 크래시됨 (재현 어려움)

3. 보안 취약점 ⚠️⚠️⚠️
   예: 토큰/API키를 평문으로 저장
   → 프로덕션 배포 후 보안 사고

4. 성능 저하
   AI가 생성한 View:
   - 불필요한 re-rendering
   - 이미지 최적화 누락
   - 리스트 셀 재사용 미구현
   → 스크롤 프레임 드롭

예시 (바이브 코딩의 위험):
───────────────────────────────
프롬프트: "사용자 목록을 fetch하고 보여주는 View 만들어줘"

AI 응답:
───────────────────────────────
class UserListViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        Task { // ← 문제 1: @MainActor 없음
            let users = try await fetchUsers() // ← 문제 2: 실패 처리 없음
            DispatchQueue.main.async {
                self.updateUI(users) // ← 문제 3: weak self 없음
            }
        }
    }
    
    func fetchUsers() async throws -> [User] {
        var request = URLRequest(url: userURL)
        request.setValue(apiKey, forHTTPHeaderField: "Authorization") // ← 문제 4: 평문 키
        
        let (data, response) = try await URLSession.shared.data(for: request)
        // ← 문제 5: 타임아웃 없음
        
        return try JSONDecoder().decode([User].self, from: data)
    }
}

당신이 리뷰했는가? 아마 "동작하니까" 머지했을 가능성.
───────────────────────────────
```

### 8.2 책임감 있는 AI 개발 (Responsible AI Development)

**Q. "바이브 코딩을 피하고 '책임감 있는 AI 개발'을 하려면 어떤 원칙을 지켜야 하는가?"**

A. 5가지 원칙:

```
원칙 1: 코드를 이해한 후 쓰기
───────────────────────────────
✗ 나쁜 예:
  "SwiftUI뷰 만들어줄래?" 
  → 코드 복사 
  → 바로 머지

✓ 좋은 예:
  "SwiftUI뷰 만들어줄래?" 
  → 코드 읽음 
  → 질문: "왜 @StateObject를 썼는가?"
  → 이해하고 머지

원칙 2: 엣지 케이스를 명시적으로 처리
───────────────────────────────
✗ AI 생성 코드:
  func fetchData() async {
      let data = try await api.fetch()
      self.data = data // ← 실패 케이스?
  }

✓ 개선:
  func fetchData() async {
      do {
          let data = try await api.fetch()
          self.data = data
      } catch URLError.timedOut {
          self.error = "네트워크 느림"
      } catch {
          self.error = "알 수 없는 오류"
      }
  }

원칙 3: 보안-민감한 코드는 반드시 리뷰
───────────────────────────────
✗ AI에만 맡기면 안 되는 것:
  - Keychain 접근
  - 암호화 로직
  - 인증/인가
  - 데이터 삭제
  
✓ 다음은 괜찮음:
  - UI 레이아웃
  - 데이터 포맷팅
  - 리스트 렌더링

원칙 4: 70/30 Rule
───────────────────────────────
전체 작업 시간 = 100%

좋은 비율:
- AI 작업 (보일러플레이트): 70%
- 인간 리뷰/수정: 30%

나쁜 비율:
- AI만 믿고: 95% (위험)
- 모든 걸 수동: 5% (비효율)

원칙 5: 테스트를 먼저 작성 (TDD)
───────────────────────────────
✓ 방법:
1. 테스트 케이스 먼저 작성 (당신이)
2. AI에게: "이 테스트를 통과하는 코드 작성"
3. AI 코드가 테스트 PASS? 신뢰도 높음
4. 테스트 FAIL? AI 코드 수정 요청

테스트 예:
┌────────────────────────────────┐
│ func testFetchFailure() {       │
│   let viewModel = ...           │
│   let result = await viewModel  │
│     .fetchWithTimeout()         │
│                                 │
│   XCTAssertNotNil(              │
│     result.error,               │
│     "타임아웃 에러 있어야 함"   │
│   )                             │
│ }                               │
└────────────────────────────────┘
```

### 8.3 인터뷰에서 바이브 코딩 질문

**Q. "면접관이 물어보는 경우: '당신의 GitHub 코드를 봤는데, SwiftUI View 구조가 일관성이 없는데, 이게 AI로 생성한 건가? 어떻게 확인했나?'"**

A. 모범 답변:
```
"좋은 지적입니다. 

저는 2가지로 코드 일관성을 보장합니다:

1. Pattern Library (기준점)
   - 기존 UserProfileView 코드를 AI에게 '참고 예시'로 줌
   - "이 패턴대로 SearchResultView도 만들어줄래?"
   - → 일관성 약 90% 향상

2. Automated Checks (자동 검증)
   - SwiftLint + 커스텀 룰로 구조 검증
   - 예: @StateObject 필수, weak self 검사, 타임아웃 확인
   - CI/CD에서 자동 실행
   - → AI 생성 코드가 기준 안 맞으면 PR 리젝

3. Code Review (수동 검증)
   - 모든 AI 코드는 이 체크리스트로 리뷰:
     ✓ 패턴 일관성
     ✓ 메모리 안전성
     ✓ 동시성 올바름
     ✓ 에러 처리 완전성
     ✓ 테스트 커버리지

결과: 
- 속도 (70% 빠름)
- 품질 (버그율 동일 또는 낮음)
- 신뢰도 (기준 명확)
"
```

---

## 📚 플래시카드 형식 (암기용)

### 세트 1: AI 도구 기본
```
Q1. Claude Code의 1백만 토큰 컨텍스트를 어떻게 활용?
A1. 시스템 프롬프트(20K) → 프로젝트 구조(200K) → 기존 코드(500K) → 현재 작업(280K)

Q2. Cursor vs Claude Code 선택 기준은?
A2. 깊이 있는 리팩: CC, 빠른 스타일링: Cursor

Q3. AI 코드 리뷰에 주간 몇 시간 소요?
A3. 평균 11.4시간 (효율화 필수)
```

### 세트 2: 하네스 엔지니어링
```
Q4. 하네스란 무엇인가?
A4. 에이전트 = 모델 + 하네스. 입력/출력 검증, 폴백, 품질 게이트

Q5. LLM-as-a-Judge의 약점은?
A5. 코드 실행 여부 확인 못함 → XCTest로 검증 필수

Q6. 품질 게이트 4단계는?
A6. 문법(자동) → 패턴(LLM) → 테스트(자동) → 보안(수동)
```

### 세트 3: 콤파운드 엔지니어링
```
Q7. 콤파운드 엔지니어링의 핵심은?
A7. 매 PR마다 솔루션 문서화 → CLAUDE.md 업데이트 → 다음 PR 더 빠름

Q8. 측정 가능한 성과는?
A8. 속도 5배, 버그율 80% 감소, 토큰 비용 70% 절감

Q9. Every.io의 성과는?
A9. 5개 프로덕트를 개발자 1명/프로덕트로 관리 (기존 3명)
```

### 세트 4: 프롬프트 엔지니어링
```
Q10. Few-Shot vs Zero-Shot는?
A10. Few-Shot: 예시 2-5개 제공 (패턴 일관성), Zero-Shot: 예시 없음 (빠름)

Q11. 구조화된 출력 (JSON)의 장점은?
A11. 파싱 에러 없음, 타입 안전, 토큰 효율적

Q12. Chain-of-Thought는 언제 쓰나?
A12. 복잡한 로직: 단계별 사고하면서 코드 생성
```

### 세트 5: Foundation Models
```
Q13. iOS Foundation Models의 제약은?
A13. 3B 파라미터 (작음), 요약/분류만 가능, 복잡 추론 불가

Q14. 온디바이스 vs 클라우드 선택은?
A14. 요약: 온디바이스 (빠름), 코딩: 클라우드 (정확)

Q15. 모델 사용 불가능할 때 폴백은?
A15. 온디바이스 → 클라우드 → 오프라인 FAQ
```

### 세트 6: 바이브 코딩
```
Q16. 바이브 코딩의 위험은?
A16. 메모리 누수, 동시성 버그, 보안 취약점, 성능 저하

Q17. 책임감 있는 AI 개발의 70/30 Rule은?
A17. AI 70% (보일러플레이트), 인간 30% (리뷰/수정)

Q18. 코드 일관성을 보장하는 방법 3가지는?
A18. Pattern Library 제시 → SwiftLint 자동 검사 → Code Review 체크리스트
```

---

## 🎯 한국 빅테크 면접 준비 체크리스트

### 네이버 (Naver)
```
포지션: iOS 개발자 (AI 플랫폼 팀)
기대값:
□ 쇼핑 AI 에이전트 아키텍처 이해
□ 멀티-에이전트 간 데이터 흐름 설계 (데이터 공유)
□ 온디바이스 AI와 클라우드 AI 선택 판단
□ 토큰 효율성 (Tokenomics) 개념

예상 질문:
- "네이버 쇼핑 추천 AI를 iOS 앱에 통합하는데, 
   온디바이스와 클라우드를 어떻게 조합하겠는가?"
- "여행 에이전트의 결과를 쇼핑 에이전트에 전달해야 하는데,
   데이터 보호하면서 어떻게 설계하겠는가?"
```

### 카카오 (Kakao)
```
포지션: iOS 개발자 (Kanana AI 플랫폼)
기대값:
□ 에이전트 간 비동기 통신 (Swift Concurrency 심화)
□ 폴백 및 회복력 전략 (Resilience)
□ 온디바이스 Foundation Models 활용
□ 실시간 AI 응답 스트리밍 (UX)

예상 질문:
- "Kanana의 여러 에이전트가 동시에 작동할 때,
   iOS 앱의 UI는 어떻게 반응하겠는가? (Loading 상태 관리)"
- "에이전트 응답이 느릴 때, 사용자 경험을 좋게 하려면?"
```

### 쿠팡 (Coupang)
```
포지션: iOS 개발자 (추천 시스템/AI 팀)
기대값:
□ 성능 최적화 (토큰, 메모리, 지연시간)
□ A/B 테스팅으로 AI 모델 검증
□ 하네스 엔지니어링으로 AI 신뢰도 보장
□ 초고속 배포 (CI/CD 자동화)

예상 질문:
- "추천 알고리즘을 AI로 생성했는데, 
   기존 알고리즘과 비교해서 검증하는 방법은?"
- "토큰 비용을 70% 줄이려면?"
- "A/B 테스트에서 CI 파이프라인에 어떻게 통합하겠는가?"
```

### 삼성 (Samsung)
```
포지션: iOS 개발자 (Galaxy AI, Apple Intelligence 통합)
기대값:
□ Foundation Models 깊이 있는 이해
□ 개인정보 보호 (Privacy-by-Design)
□ 온디바이스/클라우드 런타임 선택 로직
□ 기기 호환성 (A14 칩 이상, iPhone 15 Pro 등)

예상 질문:
- "Foundation Models가 iPhone 15 standard에서는 불가능한데,
   이 사용자 경험은 어떻게 하겠는가?"
- "민감한 데이터(건강, 금융)를 Foundation Models로 처리할 때,
   보안을 어떻게 보장하겠는가?"
- "Galaxy AI와 Apple Intelligence 모두 지원하려면?"
```

---

## 🔗 주요 참고자료

1. **Claude Code vs Cursor 비교**
   - https://www.builder.io/blog/cursor-vs-claude-code
   - https://dev.to/alexcloudstar/claude-code-vs-cursor-vs-github-copilot-the-2026-ai-coding-tool-showdown-53n4

2. **하네스 엔지니어링**
   - https://martinfowler.com/articles/harness-engineering.html
   - https://www.patronus.ai/llm-testing/llm-as-a-judge

3. **콤파운드 엔지니어링**
   - https://every.to/guides/compound-engineering
   - https://github.com/EveryInc/compound-engineering-plugin

4. **컨텍스트 엔지니어링**
   - https://www.callstack.com/blog/rag-is-dead-long-live-context-engineering-for-llm-systems
   - https://www.pinecone.io/learn/context-engineering/

5. **Foundation Models**
   - https://machinelearning.apple.com/research/introducing-apple-foundation-models
   - https://medium.com/@wesleymatlock/apple-foundation-models-in-practice-building-on-device-ai-features-in-swift-b6243976af4f

6. **바이브 코딩**
   - https://news.harvard.edu/gazette/story/2026/04/vibe-coding-may-offer-insight-into-our-ai-future/
   - https://dev.to/remybuilds/what-is-vibe-coding-a-developers-guide-2026-o0m

7. **멀티-에이전트 오케스트레이션**
   - https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
   - https://addyosmani.com/blog/code-agent-orchestra/

8. **한국 빅테크 AI 트렌드**
   - https://www.koreatimes.co.kr/business/tech-science/20260102/naver-kakao-gear-up-for-agentic-ai-era-in-2026
   - https://koreatechtoday.com/from-llms-to-agents-naver-and-kakao-enter-next-phase-of-ai-competition/

---

## 💡 마지막 팁

### 면접관이 "당신의 장점은?"이라고 물을 때
```
답변:
"저는 AI와 인간의 강점을 결합하는 개발자입니다.

1. AI의 속도 (보일러플레이트 70% → 1시간 → 15분)
2. 인간의 판단 (보안, 에러 처리, 아키텍처)
3. 되먹이 루프 (매 PR마다 배워서 다음은 더 빠름)

결과:
- 한 명이 여러 프로젝트 관리 가능
- 버그 줄어듦 (자동 검증)
- 토큰 비용 70% 절감 (한국 스타트업에 중요)
"
```

### "구체적인 성과를 보여주세요"
```
github.com/your-username 에 다음을 준비:

□ AI를 사용한 iOS 프로젝트 1-2개
□ CLAUDE.md 파일 (프로젝트 규약)
□ 콤파운드 엔지니어링 증거:
   - docs/solutions/ 폴더 (반복된 패턴 기록)
   - git 커밋 메시지 (배운 점 기록)
□ 하네스 구현:
   - XCTest 또는 SwiftLint 커스텀 룰

면접관은 코드 양보다 '문화'를 본다.
"이 개발자는 혼자가 아니라 팀과 미래를 위해 코딩한다"
```

---

**최종 조언:**
2026년 한국 빅테크 iOS 면접은 더 이상 "문법을 얼마나 잘 아는가"를 묻지 않습니다.
대신 **"AI와 함께 일할 수 있는가?"**, **"팀의 생산성을 2배 올릴 수 있는가?"**를 묻습니다.

이 가이드의 8가지 개념을 이해하고, 구체적인 코드 예시로 설명할 수 있으면 충분합니다.

화이팅! 🚀
