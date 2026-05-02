# /run — 시뮬레이터에서 앱 실행

빌드 후 iOS 시뮬레이터에서 앱을 실행한다.

## 실행

1. XcodeBuildMCP MCP 도구로 시뮬레이터 빌드+실행
2. MCP 사용 불가 시 fallback:

```bash
# 사용 가능한 시뮬레이터 확인
xcrun simctl list devices available | grep -E "iPhone|iPad"

# 시뮬레이터 부팅
xcrun simctl boot "iPhone 16"

# 빌드 + 설치 + 실행
xcodebuild build -workspace *.xcworkspace -scheme <Scheme> \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -derivedDataPath .build
xcrun simctl install booted .build/Build/Products/Debug-iphonesimulator/<App>.app
xcrun simctl launch booted <BundleID>
```

## 시뮬레이터 관리

```bash
# 스크린샷
xcrun simctl io booted screenshot screenshot.png

# 로그
xcrun simctl spawn booted log stream --predicate 'subsystem == "<BundleID>"'

# 앱 종료
xcrun simctl terminate booted <BundleID>

# 시뮬레이터 종료
xcrun simctl shutdown booted
```
