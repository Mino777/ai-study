# 회고 — 2026-05-02 하네스 마스터클래스 세션

## 이번에 한 것

**면접 부트캠프 보강**:
- 100-day 시작일 5/4 변경 + 이미지로더/캐싱 6문항 + CS 심화 8문항 + Swift/디자인패턴 12문항 + 퀴즈 18문항
- 토스 iOS 단골 토픽 25개 전체에 detail + interviewTip 상세 추가
- 플래시카드 랜덤 셔플 (페이지 진입 시마다 다른 7장)

**AI 엔지니어링 총정리 엔트리**:
- 2026 AI 엔지니어링 현황 — 용어 40+개, 방법론 비교, Claude Code 실무 10개념, 트렌드, 흔한 오해 6가지

**하네스 엔지니어링 리서치 4편**:
- Martin Fowler 프레임워크 (Guide/Sensor × Computational/Inferential 4분면)
- Claude Code 아키텍처 해부 (arxiv + 소스 유출, 5단계 컨텍스트 압축)
- Anthropic 3-Agent 패턴 (Planning→Generation→Evaluation)
- OpenAI Codex 하네스 (5개월 100만줄 0손코딩)

**하네스 정석 업그레이드**:
- ai-study 프로젝트: deny 7개 + PostToolUse tsc hook + .claude/rules/ + GC drift + harness-fitness 7테스트
- 공통 하네스 이식 템플릿: harness-template/ (원커맨드 setup.sh)
- iOS 하네스 이식 템플릿: harness-template/ios/ (XcodeBuildMCP + pbxproj 방어)

**셋업 가이드 엔트리 2편**:
- 공통 하네스 셋업 가이드 (4편 종합 + Blake Crosley 3편 흡수)
- iOS 하네스 셋업 가이드 (8개 출처 정독, 자율 개발 루프, 기존 프로젝트 4케이스)

**Blake Crosley 3편 완전 흡수**:
- Hook 3타입(command/prompt/agent), exit code 진실(1=비차단!), Dispatcher
- Context 열화 곡선(39% 하락), Evidence Gate(35%→4%), Subagent 비용
- Skills 고급필드, async/HTTP Hook, Bash ((VAR++)) 함정, Worktree isolation, Sandbox, xhigh
- Permission matcher 함정, $defaults sentinel, 토큰 오버헤드 수치, Prompt Caching, settings.local

**critical fix**:
- 모든 보안 Hook exit 1 → exit 2 수정 (exit 1은 비차단!)

**Flow Map 시리즈 2편**:
- MoneyFlow 13-Agent 파이프라인
- Tarosaju 3단계 방어선

**Journal 018 보강**: TMA 도입 후 실무 성과 6가지

**워커 프로젝트 위키 접근**: aidy/moneyflow/tarosaju/pre-assignment에 ai-study 위키 읽기 전용 접근 설정

**ai-agent-start-here 대폭 업데이트**: 하네스 템플릿 + 4편 연구 + 최신 상태

**Mermaid 렌더링 에러 수정**: persona-engineering 다이어그램

## 잘된 것
- Blake Crosley 3편을 **정독**하여 exit code 진실(1=비차단)이라는 크리티컬 버그를 발견 — 이전까지 모든 보안 Hook이 실제로는 차단 안 되고 있었을 가능성
- 공통 하네스 템플릿이 setup.sh 한 줄로 이식 가능해짐 — pre-assignment에서 실제 검증
- iOS 하네스가 자율 개발 루프까지 포함하여 에이전트가 읽고 바로 셋업 가능한 수준
- 워커 4개 프로젝트에 위키 접근을 상대경로(`../ai-study`)로 설정하여 이식성 확보

## 아쉬운 것
- exit code 1 vs 2 차이를 **처음 하네스 업그레이드 시 놓침** — Blake Crosley 가이드를 나중에야 정독하면서 발견. 리서치를 먼저 충분히 하고 구현했어야
- 엔트리 양이 너무 많아서 한 세션에서 퀄리티 컨트롤이 어려웠음 — 엔트리 작성과 리서치를 분리했어야

## 다음에 적용할 것
- 하네스 변경 전 **Blake Crosley + Fowler + arxiv를 먼저 정독** 후 구현 (리서치 우선)
- 워커 프로젝트에서 실제로 위키 검색이 잘 동작하는지 다음 세션에서 검증

## Compound Assets
- harness-template/ (공통 + iOS) — 원커맨드 이식
- harness-fitness.test.mjs — 7개 기계적 검증
- .claude/rules/ (content-mdx.md, harness-meta.md) — 스코프드 규칙
- 4개 워커 프로젝트에 위키 접근 설정
- 하네스 연구 4편 + 셋업 가이드 2편 + Flow Map 2편 = 8개 엔트리

## 프로세스 개선 (이번 스프린트)
| 재료 | 개선 | 파일 |
|------|------|------|
| exit 1 비차단 발견 | 모든 보안 Hook exit 2로 수정 | settings.json, hooks/*.sh |
| 워커 프로젝트 위키 미접근 | additionalDirectories + JIT 검색 안내 | 4개 프로젝트 CLAUDE.md + settings.json |
| ai-agent-start-here 구식 정보 | 스냅샷 + 라우팅 + 커맨드 수 업데이트 | ai-agent-start-here.mdx |

## 수치
- 커밋: 30+
- 파일 변경: 44개, +5,194줄 / -85줄
- 새 엔트리: 8개 (연구 4 + 가이드 2 + Flow Map 2)
- 테스트: 34 → 71 (+37)
- 하네스 구성: deny 4→7, hooks 3→4+, rules 0→2, commands 13 유지
