/**
 * AI 운영 — 면접용 STAR 케이스 박제
 * ----------------------------------------------------------
 * 저널을 새로 쓸 때마다 이 파일에 case를 1개 추가한다.
 * 회사명·도메인 용어는 무조건 익명화(project = "moneyflow", "iOS 가계부 앱"으로 일반화).
 *
 * HOW TO ADD:
 *   1) 새 객체를 AI_OPS_CASES 배열 맨 위에 추가 (최신순)
 *   2) id: kebab-case, 고유. 예: "spec-qa-smoke-pack"
 *   3) date: 저널 작성일 (YYYY-MM-DD)
 *   4) oneliner: 면접 첫 문장(20초 안에 끝나는 한 줄)
 *   5) journalSlug: 관련 저널 slug (선택) — 예: "ios-ai/ios-ai-journal-015-..."
 *   6) measurement: 숫자 1개 이상 필수(없으면 작성 보류 — 면접에서 안 먹힘)
 *   7) transferable: "다른 회사/제품에 어떻게 적용되는가?" 한 줄
 */

export interface AIOpsCase {
  id: string;
  date: string;
  project: "moneyflow" | "ai-study" | "tarosaju" | "aidy" | "harness-meta";
  title: string;
  oneliner: string;
  // STAR
  situation: string;
  action: string[];
  result: string[];
  // 면접관 후속질문 방어용
  measurement: string;     // 정량 수치 (필수)
  rootCause?: string;      // "왜 발생했나" — 면접관이 반드시 묻는다
  transferable: string;    // 다른 도메인 적용 가능성
  // 메타
  stack: string[];
  category: "harness" | "qa" | "mock-debug" | "multi-agent" | "tooling" | "process";
  journalSlug?: string;    // content/<category>/<slug> 의 slug 부분
}

export const AI_OPS_CASES: AIOpsCase[] = [
  {
    id: "worker-role-advisor-executor-split",
    date: "2026-05-12",
    project: "moneyflow",
    title: "멀티 워커 환경에서 leader=Advisor / worker-2=Executor 권한 분리 박제",
    oneliner: "leader가 오케스트레이션과 실행을 모두 들고 있어서 두 워커가 같은 파일을 동시에 편집하는 사고가 주 2-3건 났습니다. 역할을 행동 가드로 분리해서 0건으로 떨어뜨렸어요.",
    situation:
      "leader + worker-2 다중 워커 setup에서 leader가 dispatch 후에도 같은 작업을 직접 해버리는 경합이 발생. 메모리룰로 적어놨지만 한 번씩 위반됐다.",
    action: [
      "leader = Advisor 전용 (계획·검증·dispatch만, 실행 편집 금지)",
      "worker-2 = Executor 전용 (코드 편집·빌드·테스트, 계획 권한 없음)",
      "역할을 .claude/rules/worker-roles.md에 행동 가드로 박제 (메모리 아닌 룰 파일)",
    ],
    result: [
      "동일 파일 동시 편집 사고: 주 2-3건 → 0건",
      "leader 응답 길이 단축 (advisory only)",
      "워커는 한 작업에 집중해 컨텍스트 오염 감소",
    ],
    measurement: "동시 편집 충돌 주당 2-3건 → 0건 (100% 제거)",
    rootCause:
      "메모리룰에만 의존하면 AI가 한 번씩 위반한다. 'leader가 알아서 한다'는 컨벤션은 실행 게이트로 박제되지 않은 컨벤션이라 신뢰할 수 없다.",
    transferable:
      "멀티 에이전트 시스템에서 권한 분리는 컨벤션이 아니라 실행 게이트로 박제. Claude Code의 .claude/rules 파일, OpenAI Codex의 system prompt 분리, LangGraph의 노드 권한 모두 동일 원리.",
    stack: [".claude/rules", "multi-agent dispatch", "memory→behavior guard"],
    category: "multi-agent",
    journalSlug: "ios-ai/ios-ai-journal-015-compound-qa-mock-harness-worker",
  },
  {
    id: "notify-main-fgrep-race",
    date: "2026-05-13",
    project: "moneyflow",
    title: "허브↔워커 dispatch 검증의 race condition을 fgrep + 2초 대기로 해소 (v2)",
    oneliner: "dispatch 직후 stdout만 보고 PASS 판정하던 훅이 실제론 채널 도달 전에 끝나서 워커가 받기도 전에 다음 단계로 가는 false PASS가 있었습니다. fgrep + 2초 대기로 잡았어요.",
    situation:
      "notify-main.sh가 dispatch stdout '성공' 메시지로 판정. 비동기 채널 도달 전 검증이 끝나는 race condition으로 hub가 워커 수신 전에 진행하는 사고 발생.",
    action: [
      "grep → fgrep 전환 (메시지 본문 정규식 메타문자 false positive 차단)",
      "검증 직전 2초 sleep으로 dispatch 채널 도달 시간 확보",
      "fail block의 unbound CAPTURE 변수 제거 — strict mode에서 진짜 fail이 unbound 에러로 가려지던 버그 동시 정리",
    ],
    result: [
      "dispatch false PASS 사라짐",
      "fail 메시지가 표면화 (이전엔 unbound 에러로 가려졌음)",
      "round-trip 신뢰도 확보 → 후속 v3에서 2초 대기 제거 + echo 확인으로 진화 예정",
    ],
    measurement: "dispatch race로 인한 false PASS 사라짐 (이전 주당 1-2건)",
    rootCause:
      "검증 도구 자체가 idempotent하지 않으면 silent 누적 손상이 생긴다. notify-main은 'stdout이 성공이라 적었는지'를 보는 도구였지 '실제 채널 상태'를 보는 도구가 아니었다.",
    transferable:
      "비동기 dispatch 검증 패턴 일반: stdout이 아닌 채널 round-trip을 검증해야 한다. 메시지 큐, webhook delivery, pubsub 모두 동일. 임시 sleep은 v1 수단이고 v2 이후엔 echo round-trip으로 대체.",
    stack: ["bash strict mode", "fgrep", "PreToolUse hook", "async dispatch"],
    category: "harness",
    journalSlug: "ios-ai/ios-ai-journal-015-compound-qa-mock-harness-worker",
  },
  {
    id: "spec-qa-smoke-pack",
    date: "2026-05-12",
    project: "moneyflow",
    title: "UI QA 풀 사이클 28분 → smoke 5–10분 (Sequence DSL + Deeplink 강제 + AX fingerprint)",
    oneliner: "회귀 QA가 매번 28분 걸려서 AI 워커가 'PASS' 거짓 보고하는 비율이 늘었습니다. 사이클을 5–10분 smoke로 잘라서 거짓 PASS를 차단했어요.",
    situation:
      "iOS 가계부 앱에서 신규 화면이 늘면서 UI 회귀 QA 1사이클이 28분까지 늘었다. AI 워커가 빌드만 통과해도 'PASS' 보고하는 silent skip이 누적됐다.",
    action: [
      "QA 1사이클을 smoke(5–10분) + forensic(28분) 두 단계로 분리",
      "Sequence DSL을 도입해 화면 진입 경로를 선언형으로 박제 (manual tap 의존 제거)",
      "Deeplink 강제 진입으로 진입 경로 분기 시간 절감",
      "AX tree hash(ui-screen-fingerprint.sh)로 화면 도달 여부를 텍스트 매칭이 아닌 구조 해시로 검증",
    ],
    result: [
      "smoke 사이클 5–10분 달성 (목표 적중)",
      "거짓 PASS 보고는 fingerprint 해시 미스매치 시 exit 2로 자동 차단",
      "forensic 풀 사이클은 nightly로만 돌려 dev loop 부담 제거",
    ],
    measurement: "QA 사이클 28분 → 5–10분 (≥64% 단축, 28→7분 가정 시 75%)",
    rootCause:
      "단일 사이클 안에 진입 경로 탐색 + 화면 검증 + 회귀 검증이 섞여 있어서 길이가 폭주했다. 그리고 검증 신호가 'AI가 PASS라고 적었나'였지 'AX tree가 실제로 그 화면이냐'가 아니었다.",
    transferable:
      "smoke/forensic 분리 + 구조 해시 검증은 Android/웹/백엔드 e2e 모두 적용 가능. 핵심은 'AI 보고문' 대신 '관측 가능한 구조 신호'로 게이트를 옮기는 것.",
    stack: ["XcodeBuildMCP", "AX inspector", "bash DSL", "Claude Code hooks"],
    category: "qa",
    journalSlug: "ios-ai/ios-ai-journal-015-compound-qa-mock-harness-worker",
  },
  {
    id: "mock-toggle-silent-fallback",
    date: "2026-05-13",
    project: "moneyflow",
    title: "DEBUG 빌드 mock 토글이 nil일 때 실서버로 분기 안 되던 silent 버그",
    oneliner: "DEBUG 빌드에서 mock 토글을 끄면 실서버를 쳐야 하는데, nil을 'mock 켬'으로 해석해서 실서버 분기가 막혀 있었습니다. silent failure였어요.",
    situation:
      "mock fixture 4종을 #if DEBUG 토글로 감싸는 작업 중, 토글이 nil인 케이스에서 실서버 fallback이 동작하지 않아 dev 환경에서 통합 테스트가 항상 mock으로만 돌았다.",
    action: [
      "Repository 분기 로직에서 `toggle == .on` 체크를 `toggle != .off`로 잘못 둔 부분을 grep family로 일괄 수색 (예약 list 4종 동일 패턴)",
      "테스트 케이스에 'toggle nil → 실서버' 분기를 명시적으로 추가",
      "부분 fix가 아닌 pattern family 전체를 한 커밋에서 정리",
    ],
    result: [
      "DEBUG 빌드에서도 nil 토글이 실서버로 정상 fallback",
      "동일 패턴이 다른 4개 Repository에서 추가로 발견·일괄 수정",
    ],
    measurement: "동일 패턴 5개 파일 일괄 수정, 회귀 0건 (이전엔 3주 동안 누적 누락)",
    rootCause:
      "토글 enum의 default 시멘틱이 'mock on'으로 잘못 가정돼 있었다. 코드 컨벤션이 'opt-in fallback'이 아니라 'opt-out fallback'으로 박혀 있었던 게 근본 원인.",
    transferable:
      "feature flag · A/B 토글 · env switch 전반의 'default가 무엇이냐' 함정. 'nil = OFF인가 ON인가'를 enum 정의 위치에 주석으로 박제하고, 부분 fix 발견 시 grep family를 반사 행동으로 도는 룰이 메모리에 들어가야 한다.",
    stack: ["Swift", "Repository pattern", "#if DEBUG", "feature toggle"],
    category: "mock-debug",
    journalSlug: "ios-ai/ios-ai-journal-015-compound-qa-mock-harness-worker",
  },
];

export type AIOpsCategory = AIOpsCase["category"];

export const AI_OPS_CATEGORY_LABELS: Record<AIOpsCategory, string> = {
  harness: "하네스",
  qa: "QA 자동화",
  "mock-debug": "Mock/디버깅",
  "multi-agent": "멀티 에이전트",
  tooling: "툴링",
  process: "프로세스",
};
