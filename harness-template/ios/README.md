# iOS Harness Template — XcodeBuildMCP + Swift/SwiftUI 특화

> 공통 하네스(`harness-template/`)를 먼저 이식한 후, 이 iOS 레이어를 추가로 덮어씌운다.

## 이식 순서

```bash
# 1. 공통 하네스 이식
bash harness-template/setup.sh /path/to/ios-project

# 2. iOS 레이어 추가
bash harness-template/ios/setup-ios.sh /path/to/ios-project
```

## 공통 하네스 위에 추가되는 것

| 구성 요소 | 파일 | 역할 |
|-----------|------|------|
| XcodeBuildMCP | .mcp.json | Xcode 빌드/테스트/시뮬레이터를 MCP 도구로 연결 |
| Swift 빌드 Hook | hooks/swift-build-gate.sh | commit 전 xcodebuild 빌드 검증 |
| SwiftLint Hook | hooks/swiftlint-check.sh | Edit 후 SwiftLint 자동 실행 |
| iOS Rules | rules/ios-swift.md | Swift/SwiftUI 편집 시 규칙 자동 로딩 |
| /build | commands/build.md | XcodeBuildMCP로 빌드 |
| /test | commands/test.md | XcodeBuildMCP로 테스트 |
| /run | commands/run.md | 시뮬레이터에서 앱 실행 |
| CLAUDE.md 확장 | CLAUDE.md.ios-append | 기존 CLAUDE.md에 iOS 섹션 추가 |
