#!/bin/bash
# Swift Build Gate — PreToolUse(Bash): git commit 전 빌드 검증
# xcodebuild 대신 XcodeBuildMCP의 증분 빌드 활용 권장
# 이 Hook은 MCP 없이도 동작하는 fallback

REPO=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
CMD=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null)

if ! echo "$CMD" | grep -qE 'git commit'; then
  exit 0
fi

# Tuist 프로젝트면 tuist build, 아니면 xcodebuild
if [ -f "$REPO/Tuist/Config.swift" ] || [ -f "$REPO/Project.swift" ]; then
  echo "🔨 QA_GATE: tuist build 실행..."
  cd "$REPO" && tuist build 2>&1 | tail -10
  if [ $? -ne 0 ]; then
    echo "❌ QA_GATE FAILED: Tuist 빌드 실패. 커밋 차단." >&2
    exit 2
  fi
elif ls "$REPO"/*.xcworkspace 1>/dev/null 2>&1; then
  WORKSPACE=$(ls "$REPO"/*.xcworkspace | head -1)
  SCHEME=$(xcodebuild -workspace "$WORKSPACE" -list 2>/dev/null | grep -A1 "Schemes:" | tail -1 | xargs)
  echo "🔨 QA_GATE: xcodebuild (workspace: $(basename $WORKSPACE), scheme: $SCHEME)..."
  cd "$REPO" && xcodebuild build -workspace "$WORKSPACE" -scheme "$SCHEME" -destination 'generic/platform=iOS Simulator' -quiet 2>&1 | tail -5
  if [ $? -ne 0 ]; then
    echo "❌ QA_GATE FAILED: Xcode 빌드 실패. 커밋 차단." >&2
    exit 2
  fi
elif ls "$REPO"/*.xcodeproj 1>/dev/null 2>&1; then
  PROJECT=$(ls "$REPO"/*.xcodeproj | head -1)
  SCHEME=$(xcodebuild -project "$PROJECT" -list 2>/dev/null | grep -A1 "Schemes:" | tail -1 | xargs)
  echo "🔨 QA_GATE: xcodebuild (project: $(basename $PROJECT), scheme: $SCHEME)..."
  cd "$REPO" && xcodebuild build -project "$PROJECT" -scheme "$SCHEME" -destination 'generic/platform=iOS Simulator' -quiet 2>&1 | tail -5
  if [ $? -ne 0 ]; then
    echo "❌ QA_GATE FAILED: Xcode 빌드 실패. 커밋 차단." >&2
    exit 2
  fi
else
  echo "⚠️ QA_GATE: Xcode 프로젝트를 찾을 수 없음. 빌드 체크 건너뜀."
  exit 0
fi

echo "✅ QA_GATE PASSED: iOS 빌드 성공"
exit 0
