# 무엇을 만들었나 — AI 개발 하네스 (엘리베이터 ~ 풀 워크스루)

> 면접 답변용. 5년차 iOS 엔지니어 본인이 **"AI로 팀 iOS 개발을 자동화하는 하네스를 직접 설계·운영"**한 스토리.
> 대상: 전국 단위 카셰어링/모빌리티 iOS 앱 팀. 하네스는 Claude Code 플러그인 기반 iOS 개발 자동화 하네스.
> repo owner. 실측 규모: 박제 579개 / 솔루션 152개 / 회고 58개 / 스킬 59개 / 에이전트 17개 / 훅 ~46개 / 스크립트 176개 / plugin v1.13.x. 약 3.5개월 지속 운영.

---

## (a) 15초 엘리베이터 — 3변형

**변형 1 (한 줄 정의형)**
"LLM 코딩 에이전트를 실제 프로덕션 iOS 앱에 안전하게 태우기 위한 운영체제를 직접 만들었습니다. Claude Code 위에 스킬·훅·서브에이전트·MCP 메모리를 얹어서, 에이전트가 저지르는 실패를 코드 레벨 가드로 막고, 한 사람의 세션이 배운 걸 팀 전체가 자동으로 공유하게 만든 하네스예요."

**변형 2 (문제 지향형)**
"AI 코딩 데모는 대부분 toy repo에서 끝나잖아요. 저는 RIBs 기반 대규모 상용 앱, 그것도 PR 리뷰 게이트조차 없는 환경에 에이전트를 실제로 태웠습니다. 그래서 회귀를 막는 게이트 훅, 팀 공유 메모리, 자기개선 루프를 갖춘 하네스를 repo owner로 설계·운영했어요."

**변형 3 (임팩트 지향형)**
"실제 사고에서 역산한 40개 넘는 가드 훅과 579개의 팀 공유 '박제'로, AI 에이전트가 같은 실수를 구조적으로 두 번 못 하게 만드는 자기개선형 iOS 개발 하네스를 만들었습니다. 3.5개월간 혼자 운영하면서 도구 자체를 semver 제품처럼 버전 관리했고요."

---

## (b) 1분 버전

"제가 만든 건 'AI로 iOS 개발을 빠르게'가 아니라, **LLM 에이전트가 프로덕션에서 저지르는 실패를 체계적으로 박제·측정·차단하는 자기개선형 운영체제**입니다.

배경은 이래요. 저희 앱은 RIBs + ReactorKit 기반 대규모 레거시고, PR 리뷰 게이트 없이 통합 브랜치에 바로 머지·푸시하는 워크플로예요. 여기에 코딩 에이전트를 태우면 silent-nil 같은 사고 — 서버 필드명이 한 글자 달라도 에러 0으로 조용히 nil이 들어가서 컴파일·mock QA·diff 다 통과하고 실서버에서만 터지는 유형 — 이런 게 그대로 배포됩니다.

그래서 세 층으로 설계했어요. **지식층**은 에이전트가 겪은 실패·버그·해결책을 마크다운 '박제'로 저장하는데, 개인 로컬이 아니라 MCP 서버가 자동으로 PR을 만들고 squash auto-merge까지 해서 팀 전원 세션에 즉시 공유됩니다. 현재 579개 쌓였고요. **실행층**은 스킬 59개·서브에이전트 17개가 얇은 진입점이고, 실제 무게는 176개 스크립트와 시맨틱 코드 검색 엔진에 있어요. **강제층**은 라이프사이클 훅 46개가 위험한 동작을 코드로 차단합니다.

핵심은 자기개선 루프예요. 같은 실패가 반복되면 박제 → CLAUDE.md 룰 → 훅 코드 게이트 → ADR 순으로 점점 강한 가드로 승격됩니다. 실패가 자동으로 시스템의 방어 코드가 되는 구조죠."

---

## (c) 2분 표준 — 2변형

### 변형 A — 시스템 구조 중심

"제가 소유·운영한 건 Claude Code 위에 얹은 iOS 개발 자동화 하네스입니다. 단순 프롬프트 모음이 아니라, 에이전트를 상용 앱에 안전하게 태우기 위한 운영 인프라예요. repo 하나를 통째로 설계했고, plugin 형태로 배포합니다.

**왜 plugin으로 분리했냐면** — 처음엔 하네스 자산이 앱 repo 안에 섞여 있었는데, 도구 커밋과 앱 코드 커밋이 뒤섞여서 히스토리랑 리뷰가 오염됐어요. 그래서 '경계 매트릭스'를 정의했습니다. 검증·명세 자산은 앱과 함께 진화하니 앱 repo에, 하네스 메커니즘·박제·운영룰은 하네스 repo에. 이제 하네스는 별도 repo에서 semver로 버전 관리되고 팀은 marketplace로 업데이트를 받아요.

**구조는 세 층입니다.** 첫째, 지식층 — MCP 서버가 `add_memory` 한 번 호출로 로컬 파일 쓰기부터 브랜치 생성, PR 생성, squash auto-merge, 브랜치 삭제까지 사용자 개입 0으로 처리해서 팀 전원에게 지식을 전파합니다. bi-temporal 메타데이터, 근접중복 가드, BM25 검색까지 붙였어요. 둘째, 실행층 — 서브에이전트를 모델별로 라우팅합니다. 읽기 전용 탐색은 저렴한 모델, 구현은 중급, 아키텍처 판단만 최상위 모델. 셋째, 강제층 — 훅이 라이프사이클마다 가드를 겁니다. 광역 grep 차단, AI 코드에 '왜' 주석 없으면 되돌림, 메모리 직접 편집 차단 같은 것들이요.

**가장 자랑스러운 건** 자기개선 루프예요. 반복 실패가 격상 사다리를 타고 점점 강한 게이트로 승격되는 구조. 시스템이 자기 실수로부터 배워서 방어 코드를 스스로 늘려갑니다."

### 변형 B — 문제·임팩트 중심

"제가 풀려던 실제 문제는 네 가지였어요.

**첫째, 탐색 비용.** 에이전트가 맨손 grep→read 루프를 돌면 느리고 환각도 나요. 그래서 캐시+시맨틱 기반 전용 코드 검색 도구를 만들어서 위치 특정을 0.1~0.5초로 줄이고, '검색 0건은 기능 부재가 아니다'를 하드 룰로 박았습니다. BLE 기능을 '없다'고 두 번 오답한 사고에서 나온 규칙이에요.

**둘째, 팀 지식 유실.** 한 사람의 세션이 배운 걸 다른 팀원이 못 씁니다. 그래서 메모리를 git PR로 자동 커밋하는 시스템을 만들었어요. 지금 579개 박제가 쌓였고, 이게 이 프로젝트의 심장입니다.

**셋째, 프로덕션 회귀.** 리뷰 게이트 없이 바로 머지하는 환경이라 회귀 방어선이 필요했어요. 과거 실제 사고 — 하드코딩 환경키, mock 프로덕션 유출, silent-nil — 에서 역산한 시그니처를, 이번 diff에 추가된 라인에만 스캔하는 배포 게이트를 만들었습니다. silent-nil은 저희 DTO 191개 중 123개, 64%가 CodingKeys가 없어서 실측으로 심각했던 문제였는데, 3-오라클 대조 + 디코드 라운드트립 테스트로 구조적으로 차단했어요.

**넷째, 컨텍스트 관리.** 광역 탐색은 격리된 서브에이전트로 빼서 메인에는 요약만 돌려받게 했습니다.

전부 추상적 best practice가 아니라, 실제 겪은 사고 25건+에서 역산한 방어입니다. 이게 'measurement-driven harness engineering'의 실전 사례라고 생각해요."

---

## (d) 5~7분 풀 시스템 워크스루

### 오프닝 (30초)

"제가 repo owner로 설계·운영한 AI 개발 하네스를 전체 그림부터 보여드릴게요. 한 문장으로 정의하면 — **LLM 에이전트가 프로덕션 iOS 앱에서 저지르는 실패를 박제·측정·차단하는 자기개선형 개발 운영체제**입니다. Claude Code 라는 코딩 에이전트 위에 플러그인으로 얹었고, 스킬·훅·서브에이전트·MCP 메모리 서버 네 축으로 구성됩니다."

### 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     AI 개발 하네스 (Claude Code Plugin)                      │
│                    marketplace 배포 · semver v1.13.x                         │
└──────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────── ① 지식층 (Knowledge) ──────────────────────────┐
  │                                                                            │
  │   memory/*.md (박제 579)          docs/                                     │
  │   ├ feedback 374 (실패경험)        ├ solutions 152 (문제해결)               │
  │   ├ reference 159                  ├ retros 58 (회고)                        │
  │   └ project 44                     └ adr 19 (아키텍처 결정)                  │
  │        │                                                                    │
  │        │  MEMORY.md ≤200줄 인덱스 (canonical 허브 + JIT discovery)          │
  │        ▼                                                                    │
  │   ┌─────────────── MCP Server (Node/TS, esbuild 단일번들) ──────────────┐   │
  │   │  add_memory ─► 파일쓰기 → 브랜치 → PR → squash auto-merge → 삭제    │   │
  │   │              (사용자 개입 0, 팀 전원 세션 즉시 surface)              │   │
  │   │  search_memory (BM25)  wiki_query (그래프 1~2hop)                   │   │
  │   │  harness_status/pull/health                                         │   │
  │   │  · bi-temporal (valid_from/invalidated_by) · 근접중복 가드          │   │
  │   │  · write-lock 직렬화 · fail-fast 인증 · 20/30s timeout              │   │
  │   └─────────────────────────────────────────────────────────────────────┘   │
  └────────────────────────────────────────────────────────────────────────────┘
                              ▲                        │
              recall-on-error │ (자동 JIT surface)     │ add_memory
                              │                        ▼
  ┌──────────────────────── ② 실행층 (Execution) ─────────────────────────────┐
  │                                                                            │
  │   SOLO 오케스트레이터 (메인 세션 = 직접 grep/Read/Edit/build)              │
  │        │  온디맨드 fan-out (worktree 격리, 보수적 2~3개)                    │
  │        ▼                                                                    │
  │   ┌── Agents 17 (모델별 비용 라우팅) ──────────────────────────────────┐   │
  │   │  탐색/리뷰/UI검증 = 저가 모델 (읽기전용)                             │   │
  │   │  구현(feature/bugfix/contract) = 중급 모델 (Edit/Write)             │   │
  │   │  아키텍처 판단 = 최상위 모델 (읽기전용)                              │   │
  │   │  · Generator-Critic 분리 (구현자 ≠ 독립 감사자, 2중 안전)           │   │
  │   │  · 반증우선 검증 (agreement bias 회피)                              │   │
  │   └─────────────────────────────────────────────────────────────────────┘   │
  │   ┌── Skills 59 (얇은 워크플로 진입점) ─► Scripts 176 (실제 엔진) ────────┐  │
  │   │  build-doctor · contract-audit · ship-radar · gate-1 · incident      │  │
  │   │  code-locate.sh (캐시+시맨틱, 환각0) · ask-bot.sh · codegraph        │  │
  │   └───────────────────────────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────────────┘
                              ▲                        │
                    라우팅 유도 │                        │ 게이트/가드
                              │                        ▼
  ┌──────────────────────── ③ 강제층 (Enforcement) ───────────────────────────┐
  │   claude-hooks/ 46개 · exit code 규약: 0=silent, 1=재시도, 2=차단          │
  │                                                                            │
  │   SessionStart ─ 버전체크 · codegraph sync · wiki-index rebuild · 캐시예열  │
  │   PreToolUse   ─ [Write/Edit] file-protection: 시크릿+memory 직접편집 차단  │
  │                  [Bash] grep-hygiene(exit2) · ship-radar-guard             │
  │                  [Read] fullfile-guard · jit-search-first                  │
  │   PostToolUse  ─ ai-comment-enforce(주석없으면 exit2) · SwiftFormat        │
  │                  git push → /compound 리마인더 · recall-on-error 자동surface │
  │   SubagentStop ─ done-lie 검증(빌드깨진채 "완료" 거짓말 exit2 차단)         │
  │                                                                            │
  │   대부분 warn(비차단), 진짜 차단은 소수 안전 footgun만                       │
  └────────────────────────────────────────────────────────────────────────────┘

  ┌──────── 자기개선 루프 (Compound) — 격상 사다리 ───────┐
  │  1회 박제 → 2회 inline 박제 → 3회 CLAUDE.md 룰        │
  │  → 4회 hook 코드 fix → 재발 시 ADR → 5회+ 재설계       │
  │  (실패가 자동으로 방어 코드로 승격)                     │
  └───────────────────────────────────────────────────────┘

  ┌──────── 경계 매트릭스 (2-repo 분리) ─────────────────────────────┐
  │  하네스 repo: 박제 · agents/skills/hooks/scripts · MCP · 운영룰   │
  │              → MCP 자동 PR/auto-merge (사람 개입 0)               │
  │  앱 repo    : Swift 코드 · 검증 yaml · SPEC · 앱 ADR             │
  │              → 일반 PR (코드와 함께 리뷰)                         │
  └──────────────────────────────────────────────────────────────────┘
```

### 층별 워크스루 (4~5분)

**① 지식층 — 메모리를 PR로 커밋한다 (90초)**

"가장 novel한 부분부터요. 보통 AI 메모리는 개인 로컬에 쌓이잖아요. 저는 이걸 **git-네이티브 팀 공유 자산**으로 만들었습니다. 에이전트가 뭔가 배우면 MCP 서버의 `add_memory`를 호출하는데, 이게 파일을 쓰고, 200줄 예산의 인덱스를 갱신하고, `bot/memory/` 브랜치를 파고, Bitbucket REST로 PR을 만들고, squash 전략으로 auto-merge하고, 브랜치까지 삭제합니다. 전부 사용자 개입 0이에요. 머지되는 순간 팀 전원의 세션이 그 교훈을 검색할 수 있게 됩니다.

이 MCP 서버 코드 자체가 자기 실패로부터 배운 흔적이에요. 병렬 호출 시 rebase 충돌 → cross-process 락으로 직렬화, 네트워크 hang으로 stdio 전체가 멈추던 문제 → 20/30초 timeout, 인증 401 사고 → email 형식 검증 fail-fast. 지식 그래프 최신 연구도 도입했어요. 삭제 대신 무효화 마킹하는 bi-temporal 메타데이터, 의미 기반 근접중복 가드, BM25 랭킹 검색. 하네스를 그냥 만든 게 아니라 **단위 테스트가 붙은 소프트웨어 제품처럼** 관리했습니다.

그리고 축적만으로는 부족해요. 핵심은 **활용의 자동화**예요. 에러가 나거나, 같은 명령을 반복하거나, 탐색이 헛돌면 훅이 이걸 감지해서 관련 박제 top-3를 자동으로 컨텍스트에 주입합니다. 사람이 '전에 이런 적 있었나' 기억할 필요가 없어요."

**② 실행층 — 얇은 진입점 + 무거운 엔진 (60초)**

"실행층의 설계 원칙은 '얇은 진입점, 무거운 엔진'입니다. 스킬 59개랑 서브에이전트 17개는 진입점일 뿐이고, 실제 로직은 176개 스크립트에 있어요.

서브에이전트는 **모델별로 비용을 라우팅**합니다. 읽기 전용 룰 기반 작업 — 탐색, 코드 리뷰, UI 검증 — 은 저렴한 모델로. 다단계 추론이 필요한 구현은 중급 모델로. 아키텍처 판단만 최상위 모델로. 비용을 15배까지 줄였어요.

멀티에이전트 패턴에서 중요한 결정을 하나 했는데요. 처음엔 4-pane tmux 워커풀로 병렬화를 시도했다가, send-keys IPC랑 pane-grep 상태 판정이 실패 클래스라는 걸 실측 사고 25건+과 외부 문헌 3소스로 확인하고 **폐기했습니다.** 관련 파일 52개를 물리 삭제하고 ADR로 남겼어요. 지금은 SOLO 오케스트레이터가 직접 실행하되, 무겁거나 병렬인 작업만 격리된 worktree로 보수적으로 2~3개 fan-out합니다. '인지 대역폭은 병렬화가 안 된다'는 원칙이죠. 화려한 병렬 오케스트레이션을 포기하고 **단순함과 관측가능성**을 택한 결정이고, 이걸 근거와 함께 문서화한 게 오히려 시니어 시그널이라고 생각해요."

**③ 강제층 — 규칙을 문서가 아닌 코드로 (60초)**

"규칙을 CLAUDE.md에 적어두는 것만으로는 LLM이 깜빡합니다. 그래서 **행동 레벨로 강제**했어요. 라이프사이클 훅 46개가 배선돼 있고, exit code 규약이 0은 silent, 1은 재시도, 2는 차단입니다.

예를 들면 — 메모리 파일을 직접 편집하려 하면 차단하고 MCP를 강제합니다. 안 그러면 auto-PR 파이프라인을 우회해서 팀 동기화가 깨지거든요. AI가 실질 코드를 4줄 이상 추가했는데 '왜' 주석이 하나도 없으면 되돌립니다. 광역 grep 같은 footgun은 exit 2로 막고요. 서브에이전트가 빌드가 깨진 채로 '완료했다'고 거짓말하며 종료하면, 15줄짜리 bash 훅이 transcript 마지막 빌드 결과를 확인해서 차단합니다. 이게 '0토큰으로 done 거짓말 차단하는 최고 ROI'였어요.

중요한 철학은 — 대부분의 훅은 warn이고 비차단이에요. 진짜 차단은 소수의 안전 footgun에만 겁니다. 'OpenAI Codex 원칙 — 성공은 silent, 실패만 표면화'를 따랐어요."

### 클로징 — 자기개선 루프 (30초)

"전체를 관통하는 건 자기개선 루프입니다. 같은 결함이 반복되면 격상 사다리를 타요. 1회는 박제만, 2회는 에이전트에 인라인 박제, 3회는 운영룰 하드 룰, 4회는 아예 훅 코드로 게이트를 만들고, 그 후에도 재발하면 구조 ADR을 씁니다. 실패가 자동으로 시스템의 방어 코드가 되는 거예요.

정리하면, 이건 toy가 아니라 실제 상용 앱에서, 리뷰 게이트도 없는 환경에 에이전트를 태우면서 회귀를 코드 레벨로 막은 실전 도입 사례입니다. 3.5개월간 혼자 설계·운영했고, 실사고에서 역산한 40개 넘는 가드와 579개 팀 공유 박제가 그 증거예요. 'AI 에이전트를 프로덕션에 어떻게 안전하게 태우나'라는 질문에 그대로 답이 되는 아티팩트라고 생각합니다."

---

## (e) English 1-minute version

"What I built and own is an operating system for safely running LLM coding agents on a production iOS app — not a prompt library, but real infrastructure layered on top of a coding agent as a plugin.

The context: our app is a large RIBs-based codebase, and the team merges straight to the integration branch with no PR review gate. When you put an agent in that environment, failures like silent-nil — where a server field name is off by one character, so it silently decodes to nil with zero errors, passes compilation, passes mock QA, passes the diff, and only breaks in production — those ship straight through.

So I designed it in three layers. The **knowledge layer** stores every failure and fix as a markdown 'memory,' but instead of staying local, an MCP server automatically opens a pull request and squash-merges it, so the whole team's sessions get it instantly — 579 of them so far. The **execution layer** routes 17 subagents by model cost — cheap models for read-only exploration, mid-tier for implementation, top-tier only for architecture calls. The **enforcement layer** wires 46 lifecycle hooks that block dangerous actions in code, not in docs.

The core is a self-improvement loop: when a failure recurs, it gets promoted up a ladder — memory, then a hard rule, then a hook-level code gate, then an ADR. Failures automatically become the system's own defense code. I ran it solo for about three and a half months and versioned the tooling itself like a real semver product. It's a complete, non-toy case study of putting agents into production safely."
