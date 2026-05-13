/**
 * AI 운영 풀 셋업 가이드 + 피쳐 작업 로그
 * ----------------------------------------------------------
 * moneyflow (iOS 앱, RIBs + SwiftUI 혼합) 프로젝트에 적용된 AI 하네스 전체.
 * 회사명·도메인 용어는 무조건 익명화:
 *   - "Promo Series" = 익명화된 피쳐 시리즈 (FR-01~07, 7개 화면 자율 사이클)
 *   - "Secure Entry" = 인증 기반 진입 분기
 *   - 회사명 절대 노출 금지 (메모리 룰 + PreToolUse 훅 가드)
 *
 * 새 셋업 요소를 추가할 때는 SETUP_BLOCKS에, 피쳐 작업 경험은 FEATURE_LOGS에.
 */

export interface SetupBlock {
  id: string;
  phase: number;            // 1~7 단계
  phaseTitle: string;
  title: string;
  what: string;             // 1줄 요약
  why: string;              // 왜 필요했나
  how: string[];            // 구체 셋업 step
  files?: string[];         // 실제 파일 경로 (익명화된)
  measurement?: string;     // 정량 효과
  interviewAngle: string;   // 면접에서 어떤 식으로 말할지
  pitfalls?: string[];      // 함정 / 폐기 경험
}

export interface FeatureLog {
  id: string;
  ticketId: string;
  title: string;
  category: "refactor" | "bug" | "qa-process" | "mock" | "concurrency" | "ui-decompose" | "routing" | "harness";
  scope: string;
  trap: string;
  fix: string;
  insight: string;
}

/* ═══════════════════════════════════════════════════════════ */
/*  SETUP BLOCKS — 7 Phases                                    */
/* ═══════════════════════════════════════════════════════════ */

export const SETUP_BLOCKS: SetupBlock[] = [
  // ───── Phase 1: Foundation ─────
  {
    id: "gstack-bootstrap",
    phase: 1,
    phaseTitle: "Foundation — 0에서 셋업까지",
    title: "gstack 글로벌 + 팀 모드 (--team)",
    what: "Claude Code 위에 올라가는 gstack 스킬 번들을 글로벌 1회 설치, 팀원 모두 동일 토대.",
    why: "AI 워크플로 기본기(/browse, /ship, /qa, /codex, /compound 등)를 표준화. 각자 다른 스킬 쓰면 회고·디버깅 못 함.",
    how: [
      "git clone --depth 1 gstack 레포 → ~/.claude/skills/gstack",
      "./setup --team 으로 세션 시작 시 자동 업데이트",
      "팀원 개인 CLAUDE.md (~/.claude/CLAUDE.md)에 사용 가능 스킬 목록 박제",
      "레포 루트 AI_SETUP.md 1장으로 신규 팀원 5분 셋업",
    ],
    files: ["~/.claude/skills/gstack/", "~/.claude/CLAUDE.md", "AI_SETUP.md"],
    measurement: "신규 팀원 셋업 시간: 1일 → 5분 (AI_SETUP.md + setup-onboarding.sh)",
    interviewAngle:
      "팀 AI 워크플로의 진입 장벽이 가장 큰 비용입니다. gstack 글로벌 + setup-onboarding.sh 9항목 자동 검증으로 'clone → 작업 가능'까지 5분 컷. 표준화 안 하면 각자 다른 스킬 쓰면서 회고가 불가능해져요.",
  },
  {
    id: "session-start-hook",
    phase: 1,
    phaseTitle: "Foundation — 0에서 셋업까지",
    title: "SessionStart 훅 — 컨텍스트 자동 주입",
    what: "세션 시작 시 detect-context.sh + drift 체크 + GC drift 자동 실행.",
    why: "AI에게 '지금 어디서 작업 중인지' 매번 사람이 알려주면 토큰 낭비. 자동화하면 매 세션 초기 6~10분 절약.",
    how: [
      ".claude/settings.json의 hooks.SessionStart에 session-start.sh 등록 (timeout 5000ms)",
      "스크립트 내부: 현재 브랜치, in-progress WO, 빌드 환경, 캐시 상태 요약 stdout",
      "GC(Garbage Collection) drift 체크 — 하네스 자체가 드리프트하면 즉시 알림",
      "출력은 첫 메시지에 system reminder로 주입 → 사람 손 안 거침",
    ],
    files: [".claude/hooks/session-start.sh", ".claude/scripts/detect-context.sh", ".claude/scripts/check-claude-drift.sh"],
    interviewAngle:
      "AI 세션을 사람처럼 'good morning'으로 시작하면 매번 6분 컨텍스트 로딩이 듭니다. SessionStart 훅으로 브랜치·진행 중 WO·환경 변수·드리프트 상태를 자동 dump해서 첫 응답부터 정확하게.",
  },

  // ───── Phase 2: Permission & Guard ─────
  {
    id: "permission-deny-list",
    phase: 2,
    phaseTitle: "Permission & Guard — 절대 못 하게 만들 것",
    title: "settings.json deny 리스트 — 19종 차단",
    what: "AI가 도구는 자유롭게 쓰되 위험 동작은 OS 레벨에서 차단.",
    why: "프롬프트로 '하지 마세요'는 한 번이라도 뚫린다. 메모리 룰 #3 (메모리 위반 시 행동 가드로 escalate).",
    how: [
      "secrets: .env, Secrets.swift, GoogleService-Info.plist, .mobileprovision, .p12 → Read 차단",
      "Xcode 메타파일: *.pbxproj, *.xcworkspace/** → Edit/Write 차단",
      "위험 명령: rm -rf *, git push --force, git reset --hard, sudo, DROP TABLE → Bash 차단",
      "supply chain: curl | sh, wget | sh → Bash 차단",
      "git hook 우회: git commit --no-verify / -n → Bash 차단",
    ],
    files: [".claude/settings.json"],
    pitfalls: [
      "deny는 추가만 가능 (메모리 룰: 기존 deny 제거 금지 — 보안 후퇴)",
      "deny 패턴은 정확한 매칭이 어려워서 PreToolUse 훅으로 보강 필수",
    ],
    interviewAngle:
      "프롬프트 신뢰 0 가정. settings.json deny 19종으로 시크릿 파일·pbxproj·force push·supply chain·sudo를 OS 레벨 차단. 그리고 정규식 매칭이 약한 부분은 PreToolUse 훅으로 이중 가드.",
  },
  {
    id: "pretooluse-hooks",
    phase: 2,
    phaseTitle: "Permission & Guard — 절대 못 하게 만들 것",
    title: "PreToolUse 훅 7종 — 행동 게이트 체인",
    what: "Edit/Write/Bash 매 호출 직전에 도메인 가드 7개가 동시 검증.",
    why: "메모리에 적은 룰은 한 번이라도 뚫린다. 행동 게이트는 0% 뚫림.",
    how: [
      "file-protection.sh — 보호 파일 화이트리스트 외 Edit 차단",
      "secret-guard.sh — 시크릿 패턴(api key, password) Write 차단",
      "external-ref-guard.sh — 외부 호스트·식별자 노출 차단 (회사명 grep)",
      "branch-commit-guard.sh — protected branch(main/develop) 직접 commit 차단",
      "check-gstack.sh — Skill 호출 직전 gstack 설치 검증",
      "post-swift-edit.sh (PostToolUse) — Swift 파일 수정 후 swiftformat + swiftlint",
      "swift-build-gate.sh (Stop) — 세션 종료 직전 빌드 검증",
    ],
    files: [".claude/hooks/file-protection.sh", ".claude/hooks/secret-guard.sh", ".claude/hooks/external-ref-guard.sh", ".claude/hooks/branch-commit-guard.sh"],
    pitfalls: [
      "Exit code 0=silent pass, 1=비차단 실패(❌ AI는 계속), 2=차단(✅ stderr가 AI에 주입) — exit 1로 두면 silent skip 발생 (Journal 007의 시조 함정)",
      "훅은 5초 이내 종료. 길면 세션 블로킹",
      "공개 위키 같은 환경에선 external-ref-guard로 회사명 grep 차단 필수 — 메모리 룰만으론 안 됨",
    ],
    interviewAngle:
      "PreToolUse 7개 훅이 도메인 가드 체인을 형성합니다. 핵심은 exit code 규약 — exit 2여야 Claude가 차단되고 stderr가 AI 컨텍스트에 주입돼서 다음 시도가 정정됩니다. exit 1은 silent skip 함정(Journal 007).",
  },

  // ───── Phase 3: Orchestration ─────
  {
    id: "tmux-4pane",
    phase: 3,
    phaseTitle: "Orchestration — 멀티 에이전트 구조",
    title: "tmux 4-pane CTO→Leader→Workers 계층",
    what: "Orchestrator (메인) / Worker-1 leader / Worker-2 구현 / Worker-3 QA로 역할 분리.",
    why: "단일 세션이 100KLOC 코드베이스를 다루면 컨텍스트 폭주. 분리하면 각자 자기 컨텍스트에서 sub-agent spawn 가능.",
    how: [
      "tmux 세션명 = 프로젝트:1.X 패턴 (X=1/2/3/4)",
      "Orchestrator = 사용자와 직접 대화 + Worker-1에 prompt 전달만",
      "Worker-1 = Advisor (계획·분배·검증·종합), full-cycle agent spawn 금지",
      "Worker-2 = 피쳐 구현 / 버그픽스 / sub-agent spawn 주체",
      "Worker-3 = QA / 광역 탐색 / sub-agent 병렬 spawn",
      "dispatch.sh로 brief 파일 전달, notify-main.sh로 round-trip 검증",
    ],
    files: [".claude/scripts/setup-tmux.sh", ".claude/scripts/dispatch.sh", ".claude/scripts/notify-main.sh", ".claude/commands/leader.md"],
    measurement: "단일 세션 대비 토큰 사용: 동일 작업 60-70% 절감 (광역 grep을 worker에게 위임)",
    pitfalls: [
      "Worker-1이 실행까지 들고 있으면 worker-2와 동일 파일 동시 편집 사고 (주 2-3건)",
      "2026-05-12 룰 갱신: Worker-1 = Advisor only로 명확 분리 후 동시 편집 0건",
      "dispatch는 비동기 → notify-main은 fgrep + 2초 대기 + Enter landing 검증 v2 필요",
    ],
    interviewAngle:
      "단일 Claude 세션으론 RIBs 아키텍처 100KLOC가 한 번에 안 들어옵니다. tmux 4-pane으로 CTO/Leader/Worker-2(구현)/Worker-3(QA)로 역할 분리. Worker-1을 Advisor only로 박은 게 핵심 — 권한 분리는 컨벤션이 아니라 실행 게이트로 박제해야 합니다.",
  },
  {
    id: "agent-workflow-triggers",
    phase: 3,
    phaseTitle: "Orchestration — 멀티 에이전트 구조",
    title: "Workflow Agent 트리거 매트릭스",
    what: "트리거 키워드 → 풀 사이클 agent spawn (격리 컨텍스트에서 자체 워크플로 실행).",
    why: "Agent는 메인과 격리된 컨텍스트에서 결과만 반환 → 메인 컨텍스트 보호.",
    how: [
      "ios-pr-shipper: PR/작업완료 → review + UI 검증 → /gate-1 → 커밋 + PR",
      "ios-feature-builder: 신규 피쳐 → 인터뷰 → 탐색 → 레이어별 구현 → 테스트",
      "ios-bug-fixer: 버그/크래시 → /ios-triage → /ios-bugfix 5단계 → 회귀",
      "ios-ui-tester: UI 테스트 → 3-tier (smoke/interaction/forensic) + diff",
      "spec-extractor: 기획서 PPT → SPEC 마크다운 (이미지 → mermaid + AC)",
      "spec-qa: SPEC AC-X.Y → 테스트 시나리오 변환 + 결과 매트릭스",
    ],
    interviewAngle:
      "Agent를 격리 컨텍스트로 spawn하면 메인은 한국어 리포트만 받습니다. 100KLOC 프로젝트에서 메인 컨텍스트 보호의 핵심.",
  },

  // ───── Phase 4: Build & Hot Reload ─────
  {
    id: "xcodebuildmcp-only",
    phase: 4,
    phaseTitle: "Build System — 30초 빌드를 1초로",
    title: "XcodeBuildMCP only — mcpbridge 외부 노출 폐기",
    what: "워커는 XcodeBuildMCP만, xcrun mcpbridge로 xcode-tools 외부 노출은 폐기.",
    why: "Xcode 26.3의 mcpbridge가 flakiness 심함 → AI 워커 안정성 0. Apple 측 결함이라 외부 해결 불가.",
    how: [
      "워커 settings.json에서 mcp__xcode-tools__* 권한 제거",
      "Hot Reload용 XcodeRefreshCodeIssuesInFile은 Xcode 내장 Claude 패널에서만 호출",
      "직접 xcodebuild CLI 호출도 금지 — XcodeBuildMCP wrapper만",
    ],
    files: [".claude/settings.json", ".claude/skills/xcodebuildmcp-ops"],
    measurement: "1시간 시도 후 폐기 결정 (id-stripping wrapper / FIFO stdin / warmup polling 모두 실패)",
    pitfalls: [
      "Apple 측 결함은 외부에서 해결 불가 — 1시간 시도하고 손절하는 결단 필요",
      "단일 파일 빠른 타입체크가 필요하면 사용자에게 Xcode 내장 Claude 패널 요청으로 위임",
    ],
    interviewAngle:
      "mcpbridge 외부 노출에 1시간 투자한 후 Apple 결함으로 결론 내고 폐기했습니다. AI 운영에서 '외부 해결 불가' 판단 + 손절 결단이 운영자의 핵심 능력. 그 결과는 메모리에 박제해서 두 번 안 빠지게 합니다.",
  },
  {
    id: "build-acceleration-3tier",
    phase: 4,
    phaseTitle: "Build System — 30초 빌드를 1초로",
    title: "3단계 빌드 전략 — Hot Reload / 풀빌드 / 구조 변경",
    what: "UI-only는 Hot Reload(1초), Swift 변경은 풀빌드, 구조 변경은 풀빌드 + 캐시 무효화.",
    why: "AI가 매번 풀빌드 돌리면 30초 × N회 = 세션 사망. 변경 타입별 차등화.",
    how: [
      "UI-only (SwiftUI body/modifier/색상/패딩) → Cmd+S 저장만 → Inject로 hot reload, 빌드 스킵",
      "Swift 코드 변경 (로직/타입/import) → XcodeBuildMCP build_sim 풀빌드",
      "구조적 변경 (새 파일/Builder/Router) → 풀빌드 + 캐시 검증",
      "CAS (Compilation Cache) Xcode 26+ 활성화 → Debug.xcconfig에 COMPILATION_CACHE_ENABLE_CACHING=YES",
      "xcbeautify 파이프 → 5000줄 출력 → 수십 줄 (토큰 절약)",
      "DerivedData 공유 → Xcode IDE ↔ 워커 CLI cache 공유 (worktree cold build 회피)",
    ],
    files: ["Debug.xcconfig", ".claude/scripts/xcb.sh", ".claude/scripts/detect-xcode-derived-data.sh", ".claude/skills/inject-hotreload"],
    measurement: "CAS 활성화로 빌드 시간 24~77% 단축 (Xcode 26+, 실측). UI iteration 30초 → 1초 (Inject).",
    interviewAngle:
      "AI가 풀빌드를 매번 돌리면 30초 × 자율 사이클 N회 = 토큰 + 시간 폭사. 변경 타입을 자동 감지해서 3단계로 라우팅: Cmd+S Hot Reload (1초) / 풀빌드 / 구조 변경. CAS로 24~77% 추가 단축.",
  },

  // ───── Phase 5: QA Automation ─────
  {
    id: "qa-3tier-split",
    phase: 5,
    phaseTitle: "QA Automation — 28분 사이클 → 5-10분",
    title: "smoke / interaction / forensic 3-tier 분리",
    what: "UI 회귀를 빠른 smoke + 깊은 forensic으로 분리, smoke만 dev loop에 돌림.",
    why: "단일 28분 사이클은 AI 워커가 'PASS' 거짓 보고하는 silent skip 비율을 끌어올림.",
    how: [
      "smoke (5-10분): 진입 경로 + 화면 도달 + AX tree hash 검증만",
      "interaction (10-15분): 탭/스와이프/입력 등 핵심 인터랙션 시나리오",
      "forensic (28분): 전체 회귀 — nightly only, dev loop 부담 0",
      "Sequence DSL — 화면 진입 경로를 bash로 선언형 박제 (tap → wait_for → tap)",
      "Deeplink 강제 진입 — 시작 화면 → 타깃 화면 1 hop",
      "AX tree fingerprint (ui-screen-fingerprint.sh) — accessibility tree 정규화 후 SHA1 해시",
      "fingerprint 미스매치 시 exit 2 — silent skip 자동 차단",
    ],
    files: [".claude/scripts/ui-screen-fingerprint.sh", ".claude/scripts/wait-for-ui.sh", ".claude/skills/ios-ui-tester"],
    measurement: "QA 사이클 28분 → 5-10분 smoke (≥64% 단축). 거짓 PASS 보고 fingerprint 게이트로 자동 차단.",
    interviewAngle:
      "QA 사이클이 길어질수록 AI는 'PASS'로 마무리하는 silent skip이 늘어납니다. 검증 신호를 'AI 보고문'에서 'AX tree SHA1'로 옮기는 게 핵심 — 워커가 *적지 않은* 구조 신호로 게이트를 잡습니다.",
  },
  {
    id: "spec-driven-qa",
    phase: 5,
    phaseTitle: "QA Automation — 28분 사이클 → 5-10분",
    title: "SPEC-driven QA 파이프라인 — PPT → AC → 매트릭스",
    what: "기획서 PPT를 SPEC.md로 변환 → AC-X.Y 단위 시나리오 → 결과 매트릭스 자동 생성.",
    why: "기획서가 코드 옆에 박제되어야 회귀 검증이 가능. 'AC 단위' 채점은 AI에게 명확한 평가 기준.",
    how: [
      "spec-extractor: PPT 이미지 → auto-crop → mermaid + AC 신뢰도 마커",
      "SPEC frontmatter에 primary_builder(RIBs entry), figma_links, target_layers, common_modules 박제",
      "/spec-qa: AC-X.Y 파싱 → ios-ui-tester 시나리오 변환",
      "결과 매트릭스: PASS / FAIL / BLOCKED (fixture gap) / SKIP (불가)",
      "SPEC PARTIAL→reviewed 인터뷰 사이클 — 1차 검증 후 미해결 항목 사용자 인터뷰",
    ],
    files: ["docs/specs/<FR-ID>/SPEC.md", ".claude/skills/spec-extractor", ".claude/skills/spec-qa"],
    measurement: "7개 화면 시리즈 자율 사이클 2시간: 85 AC 중 검증 가능 50/85 = 59%, 검증 가능 PASS율 45/50 = 90%",
    pitfalls: [
      "BLOCKED 자동 escalate 부재 → fixture gap을 사람이 알아채야 함",
      "SPEC 텍스트 vs 코드 String literal 불일치 (예: SPEC='핫딜' / 코드='편도') → grep diff 자동 검증 필요",
    ],
    interviewAngle:
      "기획서 PPT를 직접 SPEC.md로 변환하고 frontmatter에 RIBs entry point/Figma/레이어를 박으면, AI agent가 brief에서 FR-ID만 받아도 즉시 작업 시작합니다. AC 단위 채점이 평가의 명확성을 만들어요.",
  },

  // ───── Phase 6: Compound Knowledge ─────
  {
    id: "compound-pipeline",
    phase: 6,
    phaseTitle: "Compound Knowledge — 매 스프린트 복리",
    title: "/compound — 3-agent 병렬 자산 생성",
    what: "배포 직후 /compound 실행 → CHANGELOG + 솔루션 + 회고 3종 자동 생성 (3 agent 병렬).",
    why: "Claude는 다음 세션에 이번 사이클 기억 못 함. 디스크에 박제해야 다음 세션 자동 인지.",
    how: [
      "CHANGELOG.md — 버전별 변경 이력",
      "docs/solutions/<category>/ — 비자명 문제 해결 박제 (architecture/build/networking/swiftui/performance)",
      "docs/retros/<date>.md — 스프린트 회고 (잘된 것 / 아쉬운 것 / 다음에 적용)",
      "솔루션 N=3+ 누적 시 코드 게이트로 승격 (scan-promotions.mjs)",
      "INDEX.md 자동 카테고리화 (현재 48건)",
    ],
    files: ["docs/solutions/", "docs/retros/", "docs/solutions/INDEX.md", ".claude/skills/compound"],
    measurement: "복리 증명 매트릭: 이전 compound 액션 6건 중 5건 다음 사이클에 실제 적용 = 83%",
    interviewAngle:
      "AI에게 매번 같은 함정을 새로 발견하게 두면 복리가 안 됩니다. /compound로 솔루션·회고를 디스크에 박제하면 다음 세션이 SessionStart 훅에서 그 자산을 자동 로드합니다. 복리 증명 매트릭(이전 액션 N건 중 M건 적용)을 회고에 박는 게 핵심.",
  },
  {
    id: "memory-to-behavior",
    phase: 6,
    phaseTitle: "Compound Knowledge — 매 스프린트 복리",
    title: "메모리 → 행동 가드 escalation",
    what: "메모리 룰 위반이 1회라도 발생하면 즉시 PreToolUse 훅 / grep 가드로 escalate.",
    why: "메모리는 *상기* 기반이라 한 번이라도 위반 가능. 행동 가드는 0%.",
    how: [
      "메모리에 룰 박제 (~/.claude/projects/<proj>/memory/feedback_*.md)",
      "위반 1회 발생 시 .claude/hooks/<rule>.sh 또는 .claude/rules/<rule>.md로 escalate",
      "예: '회사명 노출 금지' 메모리 → external-ref-guard.sh PreToolUse 훅으로 escalate",
      "예: '부분 fix는 재발 신호' 메모리 → 다음 사이클에 grep family 반사 행동 룰화",
    ],
    files: ["~/.claude/projects/<proj>/memory/", ".claude/hooks/", ".claude/rules/"],
    interviewAngle:
      "메모리 룰은 1회라도 뚫리면 즉시 PreToolUse 훅으로 escalate해야 합니다. '한 번도 안 뚫린 룰만 메모리, 한 번이라도 뚫린 룰은 코드 게이트'가 운영 원칙.",
  },

  // ───── Phase 7: Cross-session Safety ─────
  {
    id: "claude-setup-branch-auto",
    phase: 7,
    phaseTitle: "Cross-session Safety — 사고 0건",
    title: "claude-setup 브랜치 자동 라우팅",
    what: ".claude/, .githooks/, CLAUDE.md 등 보호 파일은 pre-commit이 자동으로 chore/claude-setup worktree에 커밋.",
    why: "하네스 메타 파일이 feature 브랜치 PR에 섞이면 리뷰 불가능. 자동 분리.",
    how: [
      "pre-commit hook이 변경 파일 패턴 매칭",
      "보호 파일 변경 감지 시 chore/claude-setup worktree에 분리 커밋",
      "현재 브랜치에 자동 머지로 일관성 유지",
      "수동 분리 불필요",
    ],
    pitfalls: [
      "silent failure 시 working tree에 stranded — 3회 재발 후 명시적 stderr + exit 1로 강제 알림 추가 예정",
    ],
    interviewAngle:
      "하네스 자체 변경이 feature PR에 섞이면 코드 리뷰가 무의미해집니다. pre-commit이 .claude/* 변경을 별도 worktree로 자동 분리해서 PR은 도메인 코드만 깨끗하게.",
  },
  {
    id: "korean-commit-policy",
    phase: 7,
    phaseTitle: "Cross-session Safety — 사고 0건",
    title: "한글 커밋 메시지 + git push 사람 위임",
    what: "AI는 git commit까지만, push는 사람이 명시적으로. 메시지 본문은 한글 필수.",
    why: "푸시는 되돌리기 어려운 액션 — 사람 게이트 강제. 한글 메시지는 비-AI 팀원 가독성.",
    how: [
      "AI에게 'commit까지 자율, push는 절대 X' 룰을 CLAUDE.md에 박제",
      "타입 prefix (feat:, fix:, chore:) 영어 허용, 본문은 한글",
      "예: feat: 신규 프로모션 시작화면 분기 추가",
    ],
    interviewAngle:
      "AI 운영의 황금률: '되돌릴 수 없는 액션 = 사람 게이트'. push, prod deploy, 비파괴 가능 명령은 무조건 사람이 명시적으로. AI는 'PR을 만들고 사용자에게 알린다'까지만.",
  },
];

/* ═══════════════════════════════════════════════════════════ */
/*  FEATURE LOGS — Promo Series (FR-01~07) 작업 경험            */
/* ═══════════════════════════════════════════════════════════ */

export const FEATURE_LOGS: FeatureLog[] = [
  {
    id: "customer-validator-promotion",
    ticketId: "WO-1624",
    title: "도메인 Interactor → 공통 모듈 승격 (CustomerValidator 통합 리팩)",
    category: "refactor",
    scope:
      "Promo Series 전용 PromoSeriesInteractor에 박혀 있던 고객 검증 로직을 다른 피쳐에서도 재사용할 수 있는 CustomerValidator 공통 모듈로 추출.",
    trap:
      "도메인 Interactor에 박힌 로직은 '한 번 박히면 다른 데서 못 가져온다'. Promo Series 외 다른 피쳐에서 같은 검증이 필요해질 때 복붙 가능성 100%.",
    fix:
      "Interactor에서 검증 로직을 추출 → CustomerValidator 모듈로 격리 → 의존성 주입으로 Promo Series Interactor에 다시 wiring. 검증 시나리오 4종 (면허 미등록 / 결제수단 미등록 / 기기인증 미완료 / 회원 상태 이상) fixture 추가.",
    insight:
      "*도메인이 공통으로 승격되는 순간*을 코드 리뷰에서 알아차리는 게 시니어 시그널. AI는 '복붙해서 돌아가게'까지는 잘 하지만 '승격 타이밍'은 사람이 잡아야 합니다.",
  },
  {
    id: "panmodal-coordinator-hittest",
    ticketId: "FR-03",
    title: "PanModal Bottom Sheet 중복 노출 — Coordinator 누락 + hit-test 가로채기",
    category: "bug",
    scope: "알림 시간 선택 바텀시트가 탭 1회로 두 번 노출되던 회귀 버그.",
    trap:
      "PanModal의 Coordinator wiring 누락 + 부모 뷰 hit-test가 첫 dismiss 이전에 두 번째 present를 호출. 단순 'guard isPresented' 추가로는 race 못 잡음.",
    fix:
      "Coordinator를 명시적으로 wiring하고 hit-test를 dismiss 완료 후로 미룸. solutions/architecture/2026-05-13-panmodal-coordinator-hittest.md 박제 — 다음 세션이 같은 패턴 만나면 즉시 인지.",
    insight:
      "iOS UI 회귀의 80%는 'race + 시스템 컴포넌트의 lifecycle 가정'. AI에게는 'isPresented 가드'로 충분해 보이지만 실제 fix는 Coordinator 레벨. 솔루션 문서로 박제해야 두 번 안 빠집니다.",
  },
  {
    id: "mock-toggle-standard",
    ticketId: "표준 패턴",
    title: "Repository mock 토글 표준화 — nil=실서버, set=mock",
    category: "mock",
    scope: "DEBUG 빌드에서 mock fixture를 켜고 끄는 분기를 4개 Repository에 통일 적용.",
    trap:
      "초기 구현이 'toggle != .off → mock 분기'로 박혀 있어 nil 토글이 mock으로 빠짐. DEBUG 빌드에서 실서버 통합 테스트가 *3주 동안* 항상 mock으로만 돌았다.",
    fix:
      "표준 패턴: mockFileName: String? = nil 시그니처. nil이면 실서버, 명시적 String이면 해당 fixture. 4개 Repository (BridgeRepository + AccountRepository 등)에 동일 패턴 일괄 적용. pre-commit hook으로 enum 코드 vs Swift 상수 매치 자동 검증 후보.",
    insight:
      "*default 시멘틱*은 enum 정의 위치에 주석으로 박아야 한다. 'nil이면 OFF인가 ON인가'는 코드 자체로 명확해야 silent failure 안 남. 부분 fix 1건 발견 시 grep family로 일괄 수색이 반사 행동.",
  },
  {
    id: "history-deeplink-nil-crash",
    ticketId: "da36005c2",
    title: "HistoryWorkflow deeplink nil 크래시 (/renthistory/detail)",
    category: "bug",
    scope: "이용내역 상세 진입 deeplink가 nil 반환 → force unwrap → 크래시.",
    trap:
      "Workflow가 'detail 화면 진입 가능'을 전제로 nil 미고려. Deeplink는 본질적으로 외부 입력 → nil 가능성 항상 있음.",
    fix:
      "Workflow에서 nil 반환 케이스 명시적 처리, 호출자에게 fallback 화면 라우팅. Swift 룰 '룰: force unwrap 금지'를 swift-style 스킬에 강제.",
    insight:
      "deeplink는 *외부 입력*이라는 자각이 약하면 force unwrap이 박힌다. AI에게 'deeplink = 외부 입력 = optional'을 시스템 메시지로 박는 게 비용 효과적.",
  },
  {
    id: "account-retain-cycle",
    ticketId: "d60d8c6bc",
    title: "Account 모듈 retain cycle + FR-06 라우팅 wiring",
    category: "concurrency",
    scope: "Account 모듈에서 closure가 self를 strong capture → retain cycle. FR-06 라우팅과 동시 발견.",
    trap:
      "RIBs Interactor가 Reactor closure에 self 강참조 → 화면 dismiss 후에도 메모리 해제 안 됨. 메모리 프로파일러 없으면 잡기 어려움.",
    fix:
      "closure에 [weak self] guard 추가. swift-style 스킬에 'closure self capture 검출' 룰 강화. swift-reviewer agent 자동 트리거.",
    insight:
      "retain cycle은 '컴파일 통과 + 동작 정상 + 메모리만 새는' 함정. AI는 컴파일/실행만 봐선 못 잡음. swift-reviewer를 PR 머지 게이트로 박는 게 유일한 자동 방어.",
  },
  {
    id: "reducer-side-effect-mainactor",
    ticketId: "7c7cf6e97",
    title: "Reactor reduce() side effect 이동 + @MainActor 누락 fix",
    category: "concurrency",
    scope: "ReactorKit reduce() 안에서 side effect 호출 + @MainActor annotation 누락.",
    trap:
      "reduce()는 순수 함수여야 하는데 side effect가 들어가면 단방향 흐름 깨짐. @MainActor 누락은 background에서 UI 호출 위험.",
    fix:
      "side effect를 transform() / mutate()로 이동. @MainActor 명시 annotation. swift-style 스킬 룰: 'reduce() 안 side effect 금지' / '@MainActor 필수 위치 자동 체크'.",
    insight:
      "단방향 상태 관리(Reactor/Redux/TCA)는 *순수 함수 규약*이 깨지면 디버깅 지옥. AI에게 '컴파일 통과해도 reduce 안에서 호출 금지'를 룰로 박는 게 핵심.",
  },
  {
    id: "component-decomposition-r1-r2",
    ticketId: "689e8ea95 + 359cd0aee",
    title: "PromoSeriesBadgeView / NoticeView 컴포넌트 분리 (R1, R2 리팩)",
    category: "ui-decompose",
    scope: "300줄 SwiftUI body를 BadgeView (R2) + NoticeView (R1)로 분리.",
    trap:
      "거대 SwiftUI body는 컴파일 시간 폭증 + AI가 'body 내부 어느 부분 수정해야 하는지' 못 특정함. 작은 수정도 전체 re-render.",
    fix:
      "공통 패턴을 별도 View 컴포넌트로 추출. SPEC 텍스트 정합성도 동시 정정. R1/R2 두 리팩을 별도 커밋으로 분리해 리뷰 가능성 확보.",
    insight:
      "AI에게 SwiftUI 작업 위임할 때는 *Body 사이즈*가 핵심 변수. 100줄 넘으면 컴포넌트 분리 우선. 그래야 다음 작업도 빠릅니다.",
  },
  {
    id: "fr-04-secure-entry-branch",
    ticketId: "FR-04",
    title: "Secure Entry 분기 + 테스트 PASS (검증 자율 사이클)",
    category: "qa-process",
    scope: "Promo Series 중 인증 기반 진입 분기(FR-04)를 worker-2가 자율 구현 + worker-3 QA 동시 검증.",
    trap:
      "분기 로직이 사용자 인증 상태에 따라 4가지로 분기. AC-2.2~2.5 fixture가 없어 BLOCKED될 위험.",
    fix:
      "CustomerValidator 4종 fixture 동시 작성. spec-qa skill brief에 회귀 fixture 표준셋 자동 포함하는 룰 추가 (다음 사이클부터).",
    insight:
      "*Pipeline parallelism* — worker-2 mock wiring과 worker-3 FR-01 QA를 동시 진행해서 직렬 병목 회피. 이게 멀티에이전트 운영의 핵심 ROI.",
  },
  {
    id: "fixture-mid-cycle-fix",
    ticketId: "FR-06 사이클 중",
    title: "FR-06 fixture 데이터 오류 02005→02003 사이클 중 즉시 fix",
    category: "harness",
    scope: "worker-3가 1차 BLOCKED 보고한 후 사이클 끊지 않고 메인이 직접 fixture 수정 → retry 1회로 PASS.",
    trap:
      "BLOCKED 보고는 보통 '다음 WO로' 처리하는데, 단순 fixture 오류는 시간 1분이면 fix 가능. 사이클 끊으면 worker 컨텍스트 재로딩 비용 발생.",
    fix:
      "메인(Orchestrator)이 worker-3 BLOCKED 패턴 인식 → fixture 1줄 fix → retry. 사이클 정체 안 됨. 회고에 '사이클 중 직접 fixture fix' 항목 박제.",
    insight:
      "AI 운영자는 *어디까지 위임하고 어디부터 직접 개입할지*의 임계점을 알아야 합니다. fixture 같은 1분 작업은 직접, 레이어 작업은 위임. 'XS / S/M / L' 분류표를 CLAUDE.md에 박제했어요.",
  },
  {
    id: "fr-07-24ac-c-branches",
    ticketId: "FR-07 / 0968e68f5",
    title: "FR-07 이용내역 상세 C-1~C-10 분기 24 AC 구현",
    category: "routing",
    scope: "Promo Series 마지막 화면(FR-07)에서 사용자 상태별 10가지 분기를 한 번에 구현.",
    trap:
      "Repository mock wiring 없이 구현하면 BLOCKED 24건이 그대로 carry-over. Worker-3가 자동 escalate 못 함.",
    fix:
      "UsageHistoryDetailRepository에 #if DEBUG 토글 패턴 복제 → 24 AC 영구 unblock. 'BLOCKED → 자동 escalate 룰'을 다음 사이클 액션으로 carry.",
    insight:
      "구현 자체는 worker-2가 잘 합니다. 문제는 *fixture wiring 누락이 BLOCKED 24건을 만든다는 사실*을 worker-3가 사전에 알아채는 룰을 만드는 것. 회고 액션이 다음 사이클에 룰로 박혀야 복리.",
  },
  {
    id: "spec-partial-reviewed-interview",
    ticketId: "5876fb821 + b4094c0e0",
    title: "SPEC PARTIAL → reviewed 인터뷰 사이클 (FR-01 / FR-02 마무리)",
    category: "qa-process",
    scope: "1차 SPEC 검증 후 미해결 7건 (BLOCKED 사유 불명확)을 사용자 인터뷰로 정리 → status reviewed.",
    trap:
      "AI가 'BLOCKED'로 적어두면 실제 원인이 fixture gap인지 기획 불명확인지 코드 미구현인지 구분 안 됨.",
    fix:
      "1차 검증 후 BLOCKED 사유를 카테고리화 (fixture / wiring / SPEC 불명확) → 사용자 인터뷰 단일 라운드로 미해결 7건 해소. SPEC.md frontmatter에 status: reviewed 박제.",
    insight:
      "AI 운영에서 *인간 인터뷰 단계의 ROI*는 굉장히 높습니다. 7건 BLOCKED를 5분 인터뷰로 해소하면 다음 사이클이 깨끗해져요. /spec-qa skill에 인터뷰 단계 명시적으로 박았어요.",
  },
  {
    id: "badge-text-consistency",
    ticketId: "P2 - 회고 액션",
    title: "기획서 vs 코드 텍스트 정합성 (SPEC vs Swift String literal 불일치)",
    category: "qa-process",
    scope: "Promo Series 배지 텍스트가 SPEC과 코드 String literal 사이에 불일치.",
    trap:
      "AI가 SPEC을 'reviewed'로 마킹해도 코드와 텍스트가 정확히 일치하는지는 grep 안 돌리면 모름.",
    fix:
      "회고 액션: 'SPEC 따옴표 안 텍스트 vs 코드 String literal grep diff' 자동화. ios-review skill 또는 CI 단계로 추가 예정.",
    insight:
      "이런 정합성 버그는 *AI가 절대 못 잡는 카테고리* (둘 다 syntactically valid). 자동 grep diff를 CI에 박는 게 유일한 방어.",
  },
  {
    id: "harness-notify-main-v2",
    ticketId: "ffb24c3ef + ad11b7577 + db9bf5fcb",
    title: "notify-main.sh 검증 강화 v2 (fgrep + 2초 대기 + Enter landing)",
    category: "harness",
    scope: "워커↔메인 비동기 dispatch 검증 신뢰도 v2 패치 3건 (같은 날 연속).",
    trap:
      "1차: grep 정규식 false positive / 2차: dispatch 채널 도달 전 검증 race / 3차: bash strict mode unbound CAPTURE 변수.",
    fix:
      "fgrep 전환 + 2초 대기 + fail block 변수 초기화 + tmux input box ❯ 앵커로 Enter landing 검증. 자율 모드 시작 직전에 강화.",
    insight:
      "하네스 자체의 신뢰도 패치는 *자율 모드 직전에 몰린다*. 자율 사이클 들어가기 전에 dispatch 검증 신뢰도를 끌어올려야 워커 escalate 신호를 안 놓침.",
  },
  {
    id: "auto-routing-claude-setup",
    ticketId: ".claude/scripts/notify-main.sh 변경 사례",
    title: "pre-commit auto-routing silent failure 3회 재발",
    category: "harness",
    scope: ".claude/scripts/* 변경 시 자동으로 chore/claude-setup worktree에 분리 커밋되어야 하는데, 3회 silent하게 stranded.",
    trap:
      "auto-routing이 silent하게 실패하면 working tree에 변경만 남고 commit 안 됨. AI는 'commit 완료'로 인지.",
    fix:
      "회고 액션: silent failure 시 hook이 명시적 stderr + exit 1로 사용자 인지 강제 (다음 사이클 적용).",
    insight:
      "자동화 도구는 *idempotent + 명시적 실패 신호*가 없으면 silent 누적 손상을 만듭니다. 메모리룰 #2 '자동 수정 도구는 자기 검증 없이 신뢰 X'와 정확히 같은 패턴.",
  },
];

/* ═══════════════════════════════════════════════════════════ */

export const PHASE_LABELS = [
  { phase: 1, label: "Foundation", emoji: "🏗" },
  { phase: 2, label: "Permission & Guard", emoji: "🛡" },
  { phase: 3, label: "Orchestration", emoji: "🎭" },
  { phase: 4, label: "Build System", emoji: "⚙️" },
  { phase: 5, label: "QA Automation", emoji: "🧪" },
  { phase: 6, label: "Compound", emoji: "♻️" },
  { phase: 7, label: "Safety", emoji: "🔒" },
] as const;

export const FEATURE_CATEGORY_LABELS: Record<FeatureLog["category"], string> = {
  refactor: "리팩토링",
  bug: "버그 픽스",
  "qa-process": "QA 프로세스",
  mock: "Mock/Fixture",
  concurrency: "동시성/메모리",
  "ui-decompose": "UI 분해",
  routing: "라우팅",
  harness: "하네스",
};
