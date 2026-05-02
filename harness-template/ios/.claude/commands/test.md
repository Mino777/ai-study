# /test — XcodeBuildMCP로 iOS 테스트

유닛 테스트를 실행한다.

## 실행

1. XcodeBuildMCP MCP 도구로 테스트 실행
2. MCP 사용 불가 시 fallback:

```bash
# Tuist 프로젝트 — tuist test 우선 (xcodebuild test는 느림)
tuist test

# xcworkspace
xcodebuild test -workspace *.xcworkspace -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16' -quiet

# 특정 테스트만
xcodebuild test -workspace *.xcworkspace -scheme <Scheme> -only-testing:<TestTarget>/<TestClass>/<TestMethod>
```

## 주의사항

- **xcodebuild test는 느릴 수 있음** (TMA 90타겟 구조에서 1시간+)
- Tuist 프로젝트는 `tuist build`만으로 충분한 경우가 많음
- 전체 테스트는 CI에서, 로컬은 변경된 모듈만 테스트

## 테스트 실패 시

1. 실패한 테스트 이름과 assertion 메시지 확인
2. 해당 코드 수정
3. 실패한 테스트만 재실행 (-only-testing)
4. 전체 테스트 재실행으로 회귀 확인
