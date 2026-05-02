#!/bin/bash
# Harness Template Setup Script
# 사용법: bash setup.sh /path/to/target-project
# 또는 타겟 프로젝트 내에서: bash /path/to/harness-template/setup.sh

set -e

TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$(pwd)}"

echo "🔧 Harness Template Setup"
echo "   Template: $TEMPLATE_DIR"
echo "   Target:   $TARGET"
echo ""

# 1. .claude/ 복사
if [ -d "$TARGET/.claude" ]; then
  echo "⚠️  .claude/ 디렉토리가 이미 존재합니다. 병합합니다..."
  cp -rn "$TEMPLATE_DIR/.claude/" "$TARGET/.claude/" 2>/dev/null || true
else
  cp -r "$TEMPLATE_DIR/.claude" "$TARGET/.claude"
fi

# 2. CLAUDE.md 복사 (이미 있으면 skip)
if [ -f "$TARGET/CLAUDE.md" ]; then
  echo "ℹ️  CLAUDE.md가 이미 존재합니다. 건너뜁니다. (템플릿: $TEMPLATE_DIR/CLAUDE.md 참고)"
else
  cp "$TEMPLATE_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"
  echo "✅ CLAUDE.md 생성 — {{변수}}를 프로젝트에 맞게 수정하세요."
fi

# 3. 테스트 복사
mkdir -p "$TARGET/scripts/__tests__"
if [ ! -f "$TARGET/scripts/__tests__/harness-fitness.test.mjs" ]; then
  cp "$TEMPLATE_DIR/scripts/__tests__/harness-fitness.test.mjs" "$TARGET/scripts/__tests__/"
  echo "✅ harness-fitness.test.mjs 복사 완료"
else
  echo "ℹ️  harness-fitness.test.mjs가 이미 존재합니다."
fi

# 4. 훅 실행 권한
chmod +x "$TARGET/.claude/hooks/"*.sh 2>/dev/null || true

# 5. docs 디렉토리 생성
mkdir -p "$TARGET/docs/retros" "$TARGET/docs/solutions"

echo ""
echo "✅ 하네스 설치 완료!"
echo ""
echo "📋 다음 단계:"
echo "   1. CLAUDE.md의 {{변수}}를 프로젝트에 맞게 수정"
echo "   2. .claude/hooks/secret-guard.sh의 FORBIDDEN 배열에 프로젝트별 금지어 추가"
echo "   3. vitest 설치: npm i -D vitest (없는 경우)"
echo "   4. 테스트 실행: npx vitest run scripts/__tests__/harness-fitness.test.mjs"
echo ""
echo "📖 자세한 사용법: $TEMPLATE_DIR/README.md"
