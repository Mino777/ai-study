# 다른 프로젝트 .claude/ 인프라 이식 프로토콜

## 문제

다른 레포(gma-ios 등)에서 Claude Code 인프라가 더 성숙해 있어도, 이 레포에 반영이 안 된 채 방치됨.
세션마다 맥락 없이 시작 → 반복 실수, 토큰 낭비.

## 증상

- 세션 시작 시 현재 상태(엔트리 수, 최우선 큐)를 매번 수동으로 파악
- `.env*` 같은 민감 파일이 Read 가능한 상태
- git commit/push 훅에서 CLAUDE_TOOL_INPUT을 grep으로 파싱 → JSON 특수문자에 취약

## 해결

### Before (취약한 Bash 훅 파싱)
```bash
if echo "$CLAUDE_TOOL_INPUT" | grep -qE 'git commit'; then
```

### After (python3 json 파싱)
```bash
if echo "$CLAUDE_TOOL_INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null | grep -qE 'git commit'; then
```

### 추가할 settings.json 항목
```json
{
  "includeGitInstructions": false,
  "permissions": {
    "deny": ["Read(**/.env*)", "Read(**/secrets*)", "Write(**/.env*)"]
  },
  "hooks": {
    "SessionStart": [{"hooks": [{"type": "command", "command": "bash .claude/hooks/session-start.sh"}]}]
  }
}
```

### session-start.sh 핵심 패턴
```bash
ENTRY_COUNT=$(find "$REPO_ROOT/content" -name "*.mdx" | wc -l | tr -d ' ')
FIRST_TASK=$(grep -A1 '### 🔴 High' "$REPO_ROOT/NEXT.md" | grep -E '^\d+\.' | head -1 | sed 's/^[0-9]*\. \*\*//' | sed 's/\*\*.*//')
echo "📚 ai-study | $BRANCH | 엔트리 $ENTRY_COUNT개" >&2
echo "🎯 최우선: $FIRST_TASK" >&2
```

### aidy-architect 모델별 에이전트 frontmatter 패턴
```yaml
---
name: architect-advisor
model: claude-opus-4-7
tools: Read, Grep, Glob
---
```

## 근본 원인

레포 간 인프라 격차 — gma-ios는 팀 단위로 지속 개선됐고 ai-study는 단독 운영. 주기적 교차 점검이 없으면 격차 방치됨.

## 체크리스트

다른 레포 인프라 점검 시:
- [ ] `includeGitInstructions: false` 설정됐는가?
- [ ] `permissions.deny`로 민감 파일 보호됐는가?
- [ ] SessionStart hook으로 컨텍스트 자동 표시되는가?
- [ ] Bash 훅이 python3 json으로 안전하게 파싱하는가?
- [ ] `.claude/agents/`에 모델별 에이전트가 있는가?
- [ ] `session-start.sh`가 NEXT.md 최우선 큐를 표시하는가?
