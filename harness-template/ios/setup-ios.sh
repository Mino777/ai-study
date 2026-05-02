#!/bin/bash
# iOS Harness Setup — 공통 하네스 위에 iOS 레이어 추가
# 사용법: bash setup-ios.sh /path/to/ios-project

set -e

TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$(pwd)}"

echo "🍎 iOS Harness Setup"
echo "   Template: $TEMPLATE_DIR"
echo "   Target:   $TARGET"
echo ""

# 0. 공통 하네스 존재 확인
if [ ! -f "$TARGET/.claude/settings.json" ]; then
  echo "❌ 공통 하네스가 먼저 이식되어야 합니다."
  echo "   bash harness-template/setup.sh $TARGET"
  exit 1
fi

# 1. .mcp.json 복사
if [ ! -f "$TARGET/.mcp.json" ]; then
  cp "$TEMPLATE_DIR/.mcp.json" "$TARGET/.mcp.json"
  echo "✅ .mcp.json 생성 (XcodeBuildMCP)"
else
  echo "ℹ️  .mcp.json 이미 존재. XcodeBuildMCP 설정 확인 필요."
fi

# 2. iOS 전용 hooks 복사
cp -n "$TEMPLATE_DIR/.claude/hooks/swift-build-gate.sh" "$TARGET/.claude/hooks/" 2>/dev/null && echo "✅ swift-build-gate.sh 복사" || echo "ℹ️  swift-build-gate.sh 이미 존재"
cp -n "$TEMPLATE_DIR/.claude/hooks/swiftlint-check.sh" "$TARGET/.claude/hooks/" 2>/dev/null && echo "✅ swiftlint-check.sh 복사" || echo "ℹ️  swiftlint-check.sh 이미 존재"

# 3. iOS 전용 rules 복사
cp -n "$TEMPLATE_DIR/.claude/rules/ios-swift.md" "$TARGET/.claude/rules/" 2>/dev/null && echo "✅ ios-swift.md 규칙 복사" || echo "ℹ️  ios-swift.md 이미 존재"

# 4. iOS 전용 commands 복사
for cmd in build.md test.md run.md; do
  cp -n "$TEMPLATE_DIR/.claude/commands/$cmd" "$TARGET/.claude/commands/" 2>/dev/null && echo "✅ $cmd 복사" || echo "ℹ️  $cmd 이미 존재"
done

# 5. 실행 권한 설정
chmod +x "$TARGET/.claude/hooks/"*.sh 2>/dev/null || true

# 6. CLAUDE.md에 iOS 섹션 추가 안내
echo ""
if ! grep -q "XcodeBuildMCP" "$TARGET/CLAUDE.md" 2>/dev/null; then
  echo "📋 CLAUDE.md에 iOS 섹션을 추가하세요:"
  echo "   cat $TEMPLATE_DIR/CLAUDE.md.ios-append >> $TARGET/CLAUDE.md"
  echo ""
fi

# 7. settings.json에 iOS hooks 추가 안내
echo "📋 settings.json에 iOS hooks를 추가하세요:"
echo ""
echo '   PreToolUse에 추가:'
echo '   {"matcher":"Bash","hooks":[{"type":"command","command":"bash .claude/hooks/swift-build-gate.sh","timeout":300000}]}'
echo ""
echo '   PostToolUse에 추가:'
echo '   {"matcher":"Edit|Write","hooks":[{"type":"command","command":"bash .claude/hooks/swiftlint-check.sh","timeout":10000}]}'
echo ""

# 8. XcodeBuildMCP 설치 확인
if command -v xcodebuildmcp &>/dev/null; then
  echo "✅ XcodeBuildMCP: $(xcodebuildmcp --version 2>/dev/null || echo 'installed')"
elif command -v npx &>/dev/null; then
  echo "ℹ️  XcodeBuildMCP: npx로 on-demand 실행 (.mcp.json 설정 완료)"
else
  echo "⚠️  XcodeBuildMCP 미설치. 설치:"
  echo "   brew tap getsentry/xcodebuildmcp && brew install xcodebuildmcp"
  echo "   또는: npm install -g xcodebuildmcp@latest"
fi

echo ""
echo "✅ iOS 하네스 설치 완료!"
echo ""
echo "📖 자세한 사용법: $TEMPLATE_DIR/README.md"
