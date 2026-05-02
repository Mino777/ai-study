# /build — XcodeBuildMCP로 iOS 빌드

프로젝트를 시뮬레이터 대상으로 빌드한다.

## 실행

1. XcodeBuildMCP MCP 도구로 빌드 실행
2. MCP 사용 불가 시 fallback:

```bash
# Tuist 프로젝트
tuist build

# xcworkspace
xcodebuild build -workspace *.xcworkspace -scheme <Scheme> -destination 'generic/platform=iOS Simulator' -quiet

# xcodeproj
xcodebuild build -project *.xcodeproj -scheme <Scheme> -destination 'generic/platform=iOS Simulator' -quiet
```

## 빌드 실패 시

1. 에러 메시지의 파일:줄번호 확인
2. 해당 파일로 이동하여 수정
3. 다시 /build 실행
4. 3회 실패 시 사용자에게 보고
