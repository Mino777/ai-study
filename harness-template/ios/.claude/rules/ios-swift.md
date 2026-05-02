---
description: Swift/SwiftUI 파일 편집 시 적용되는 iOS 개발 규칙
globs: "**/*.swift"
---

# iOS / Swift 개발 규칙

## 절대 금지

- **.pbxproj 직접 수정 금지** — Xcode가 관리하는 파일. AI가 수정하면 프로젝트 깨짐. SPM Package.swift는 수정 가능
- **force unwrap (!) 사용 금지** — guard let 또는 if let 사용. 크래시 원인 1위
- **하드코딩 시크릿 금지** — API 키, 비밀번호를 코드에 포함하지 마. xcconfig 또는 Keychain 사용

## 메모리 관리

- 클로저에서 self 캡처 시 **[weak self]** 사용 (특히 @escaping, Combine sink, 네트워크 콜백)
- delegate는 **weak** 선언
- NotificationCenter observer는 deinit에서 제거 (또는 Cancellable 관리)

## 아키텍처 규칙

- **단방향 데이터 흐름** 유지: View → Action → State 변경 → View 업데이트
- ViewModel/Reducer에서 UIKit import 금지 (테스트 가능성 확보)
- Feature 간 직접 참조 금지 — Interface/Protocol 경유만 허용

## Swift Concurrency

- UI 업데이트는 반드시 **@MainActor** 또는 **MainActor.run**
- **Sendable** 프로토콜 준수 확인 (Swift 6 Strict Concurrency)
- async/await 사용 시 Task.detached는 최소화 (구조화된 동시성 선호)

## SwiftUI 규칙

- body는 가능한 짧게 유지 — 복잡한 뷰는 서브뷰로 추출
- @State는 뷰 내부 소유, @ObservedObject/@StateObject는 외부 주입
- Preview는 #Preview 매크로 사용 (iOS 17+)

## XcodeBuildMCP 활용

- 빌드/테스트/시뮬레이터 작업은 **XcodeBuildMCP MCP 도구 사용 우선**
- xcodebuild 직접 호출은 MCP 도구가 불가능한 경우에만 fallback
- 시뮬레이터 목록 확인: MCP의 simulator list 도구 사용
