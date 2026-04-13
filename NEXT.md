# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> *살아있는 문서*: 원본 섹션 보존, 갱신은 append-only.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-12 (late session)
- **마지막 Journal**: `harness-journal-010-baseline-third-update.mdx`
- **작성 주체**: Claude (이전 세션)
- **이유**: 사용자가 세션 clear 예정 → 다음 세션 bootstrap용

---

## 📸 현재 상태 스냅샷

### ai-study Wiki (작업 저장소)

- **엔트리 수**: 46 (harness-engineering 카테고리가 활발)
- **주 시리즈**: Harness Journal 000~010 (11 에피소드)
- **슬래시 커맨드**: 4개 (`/compound`, `/autoceo`, `/wt-branch`, `/ingest`)
- **LLM-First 표준 적용**: 10 엔트리 (`For AI Agents` 섹션)
- **Git 상태**: main clean, origin/main = local main
- **최근 commit**: `시리즈: Harness Journal 009+010 — text output guards + 6 사이클 메타 회고`

### mino-moneyflow

- **버전**: v0.9.25
- **최근 머지 PR**: #95 (AI 비용 추적, Journal 008)
- **자동 머지 흐름**: `ai-review.yml`이 push to non-main → PR 자동 생성 → inline test gate → squash merge
- **검증된 자산**: Circuit Breaker, 3-provider 폴백, 프롬프트 캐싱, 비용 추적 로깅 (Journal 008), wt-branch 슬래시 커맨드
- **남은 작업**: JSON 출력 Zod 검증 (13 에이전트 각 schema) — 큰 작업
- **Git 상태**: *다음 세션에서 직접 fetch 확인 필수* (Journal 003의 squash merge 함정 주의)

### mino-tarosaju

- **최근 스프린트**: 안전성 7차 (bb95f00 R26 Flow Safety 5 Layer)
- **최근 머지 PR**: #4 (cost tracking, Journal 007), #5 auto-merge 설정 중 (text guards, Journal 009)
- **머지 흐름**: 수동 또는 `gh pr merge --auto --squash --delete-branch`
- **검증된 자산**: `callAnthropic` wrapper (Journal 006), ai-cost-tracker, text output guards (Journal 009), wt-branch 이식 완료, typecheck job (Journal 001)
- **남은 작업**: prompt caching 적용 가능 여부 재검토 (Haiku cache minimum 제약), text guards 발동률 측정
- **Git 상태**: *다음 세션에서 직접 fetch 확인 필수*

---

## 🎯 다음 Journal 큐 (Journal 011+)

[Journal 000 베이스라인의 세 번째 갱신 로그](/wiki/harness-engineering/harness-journal-000-baseline#갱신-로그)에서 정의된 큐. 라이브 사고/발견에 따라 재정렬될 수 있음.

### 🔴 우선순위 높음

#### 1. moneyflow JSON Zod 출력 검증

- **Journal 번호 후보**: 011 또는 012
- **파일 위치**: `/Users/jominho/Develop/mino-moneyflow/src/lib/trading/`
- **대상 에이전트**: 13개 (market_analyst, fundamentals, bull_researcher, bear_researcher, research_judge 등)
- **작업 단계**:
  1. worktree로 새 브랜치 분기 (`/wt-branch ai-ops/zod-output-validation`)
  2. `src/lib/trading/agent-schemas.ts` 신설 — 각 에이전트 output Zod schema
  3. `src/lib/trading/ai-client.ts`의 `callAI()` 또는 `callClaudeWithFallback()` 래퍼에 `schema` 매개변수 추가
  4. 래퍼 내부에서 `safeJsonParse` + `schema.parse` 통합 (5 Layer 중 Layer 1+2)
  5. 실패 시 `maxRetries`로 *instruction에 실패 이유 추가*해서 재시도
  6. 13개 에이전트 호출 사이트 중 *가장 단순한 1개* 먼저 적용 (예: market_analyst)
  7. 동작 확인 후 나머지 12개 점진적 적용
- **예상 크기**: 큼 (한 사이클로 전부가 아니라 *첫 1 에이전트 + 패턴 정의*로 분할)
- **검증**: moneyflow `test-gate.yml` + `ai-review.yml` inline test gate 자동 (UI 변경 아님)
- **참조 엔트리**: [AI 출력 Zod 검증 5 Layer](/wiki/harness-engineering/ai-output-zod-validation-pattern)
- **Anti-pattern**: 13개 동시 적용 시도 → 사이클 분할 원칙 위반 + 한 번에 너무 많은 변경

#### 2. 비용 추적 DB 저장 + `/cost-check` 슬래시 커맨드

- **Journal 번호 후보**: 011 또는 012
- **대상**: 양쪽 프로젝트 공통 (moneyflow 우선, tarosaju 뒤)
- **현재 상태**: Journal 007+008으로 *console 로깅만* 있음 (fire-and-forget)
- **작업 단계**:
  1. Supabase migration: `api_calls_log` 테이블 + RLS (service role만 INSERT)
  2. 일별 집계 view: `api_cost_daily`
  3. `ai-cost-tracker.ts`의 `logApiCall()`을 *async Supabase insert* 버전으로 확장 (fire-and-forget 유지)
  4. `.claude/commands/cost-check.md` 신설 — 이번 달/오늘/지난 7일 조회 쿼리
  5. CLAUDE.md skill routing 한 줄 추가
- **예상 크기**: 중간
- **참조 엔트리**: [AI API 비용 추적 패턴](/wiki/harness-engineering/ai-api-cost-tracking-pattern)
- **블로커**: Supabase 권한, 마이그레이션 승인 필요

### 🟡 우선순위 중간

#### 3. text output guards 발동률 측정 리포트

- **Journal 번호 후보**: 013 이후
- **대상**: tarosaju (Journal 009에서 적용)
- **작업**: `{ guarded: true }` 플래그 집계 → 어느 가드가 얼마나 자주 발동하는지 리포트
- **의존**: 최소 며칠 프로덕션 데이터 필요

#### 4. prompt caching 적용 가능 여부 재검토

- **대상**: tarosaju (Claude Haiku)
- **확인 사항**:
  - Claude Haiku의 prompt caching minimum token 수 (공식 문서 확인)
  - tarosaju fortune/ai + tarot-chat의 현재 system message 토큰 수
  - 만약 minimum 이상이면 적용, 아니면 *정직하게 "효과 없음" 박제*
- **방법**: Anthropic API 응답의 `cache_creation_input_tokens` / `cache_read_input_tokens`로 실측

### 🟢 우선순위 낮음

#### 5. 남은 Journal 000 갭 해소

- **갭 #5**: 메모리 신뢰도 강화 (MEMORY.md 포맷 정의 + 자동 동기화)
- **갭 #6**: `/autoceo` Step 3 Gate 4 Playwright 자동화
- **갭 #7**: `npm audit` CI 통합 (양쪽 프로젝트)
- **갭 #8**: `.claude/skills/` 첫 도입 (`git-status-clean-check` 후보)

#### 6. Phase 3 — frontmatter schema에 agentHints 필드 추가

- **대상**: ai-study `src/lib/schema.ts`
- **작업**:
  1. Zod schema에 `agentHints` 선택 필드 추가 (`{ trigger, prerequisites, actionableSteps, antiPatterns }`)
  2. 기존 `For AI Agents` 섹션을 *frontmatter로 이관* 또는 *본문과 병존*
  3. 매니페스트에서 agentHints 노출 → 에이전트 라우팅 페이지 구축 가능
- **예상 크기**: 중간

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정이 필요한 영역 (자율 처리 X)

- **moneyflow 13 에이전트 schema 정의** — 각 에이전트의 *출력 필드 의미*는 도메인 결정. Journal 011을 시작하기 전 사용자 확인 권장 (*"어느 에이전트부터 적용할지"*).
- **Supabase migration 승인** — DB 변경은 [SPEC.md](./SPEC.md)의 AI Agent Contract에서 *자율 금지 영역*.
- **text guard 금지 용어 리스트 확장** — 도메인 지식 필요.

### 사용자 확인 대기 항목

- *없음*. Journal 010이 깔끔한 정지 지점.

### 동시 세션 주의

- 사용자가 다른 Claude 세션에서 moneyflow 또는 tarosaju 작업 중일 수 있음
- **다음 세션 시작 시 반드시**:
  ```bash
  rtk git -C /Users/jominho/Develop/mino-moneyflow fetch origin
  rtk git -C /Users/jominho/Develop/mino-tarosaju fetch origin
  rtk git -C /Users/jominho/Develop/mino-moneyflow log origin/main --oneline -5
  rtk git -C /Users/jominho/Develop/mino-tarosaju log origin/main --oneline -5
  ```
- 비교해서 *내가 알고 있는 상태*와 다르면 *새 작업 식별* 후 이 NEXT.md 갱신

---

## 📋 다음 세션 시작 체크리스트

새 세션 시작 시 *반드시* 다음 순서:

### Phase 1: 3 파일 로드 (5분)

- [ ] `CLAUDE.md` 읽기 (프로젝트 규약 + LLM-First 방향성)
- [ ] `SPEC.md` 읽기 (엔티티 + 데이터 흐름 + AI Agent Contract)
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기 (상황별 라우팅)

### Phase 2: 이 NEXT.md 읽기 (3분)

- [ ] 현재 상태 스냅샷 확인
- [ ] 다음 Journal 큐에서 *가장 임팩트 큰 1개* 선택
- [ ] 블로커/대기 사항 확인

### Phase 3: 양쪽 프로젝트 git 상태 동기화 (5분)

- [ ] `rtk git -C /Users/jominho/Develop/mino-moneyflow fetch origin`
- [ ] `rtk git -C /Users/jominho/Develop/mino-tarosaju fetch origin`
- [ ] 양쪽 main의 최신 commit 확인
- [ ] 이 NEXT.md의 *스냅샷*과 비교 → 다른 세션 작업 감지 시 갱신

### Phase 4: 최근 Harness Journal 훑어보기 (5분)

- [ ] `content/harness-engineering/harness-journal-010-baseline-third-update.mdx` — 6 사이클 메타 회고
- [ ] `content/harness-engineering/harness-journal-000-baseline.mdx`의 갱신 로그 섹션 — 큐 현재 상태

### Phase 5: 작업 시작

- [ ] 선택한 Journal 큐 항목의 *구체 작업 단계* 이 NEXT.md에서 확인
- [ ] **새 작업은 `/wt-branch <branch-name>`으로 시작** — Journal 003 squash merge 함정 회피
- [ ] 작업 완료 후 Journal 박제 (시리즈 형식)
- [ ] NEXT.md 갱신 로그 append (이 문서도 살아있는 문서)

**총 18분** — 세션 시작 후 18분 안에 새 작업 시작 가능.

---

## 🔁 시리즈 자체 동력 요약 (다음 세션이 알아야 할 것)

현 시리즈(Harness Journal 000~010)가 *6 사이클 자율 진행*에서 입증한 3가지:

1. **박제 전이성** — 다른 세션이 ai-study 박제를 *별도 안내 없이* 발견해 tarosaju에 이식한 사례 있음 (Journal 005)
2. **자기 검증 구조** — 도구가 *자기 자신에 적용*되는 패턴 2회 (Journal 002의 ai-review self-check, Journal 005의 wt-branch self-port)
3. **계획 vs 현실 라이브 교정** — 추측 큐가 라이브 발견으로 4회 재정렬 (원본 큐 정확도 ~60-70%)

**사고 재발률**: wt-branch 도입 이후 **0회 / 7 사이클**. 이 기록을 다음 세션도 유지해야 함.

---

## 💾 이 NEXT.md 자체의 운영 규칙

- **살아있는 문서**: 원본 섹션은 *그대로 보존*, 새 세션이 읽고 이해한 후 *append-only 갱신 로그* 섹션에 변경사항 추가
- **갱신 트리거**:
  - 새 Journal 작성 완료 → "다음 큐" 항목에서 제거 또는 재정렬
  - 다른 세션이 작업한 흔적 발견 → "현재 상태 스냅샷" append
  - 새 블로커 발견 → "블로커" 섹션 append
- **다음 세션 clear 직전**:
  - 이 파일에 "다음 세션 계획" 섹션 최신화 (마지막 작성 일시 갱신)
  - commit + push로 원격 저장소에 반영

---

## 📝 부록: 자주 쓰는 명령

```bash
# 양쪽 프로젝트 상태 확인
rtk git -C /Users/jominho/Develop/mino-moneyflow fetch origin
rtk git -C /Users/jominho/Develop/mino-tarosaju fetch origin

# 새 작업 시작 (다음 세션도 반드시 /wt-branch 사용)
# .claude/commands/wt-branch.md 참조 — 슬래시 커맨드로 호출
/wt-branch ai-ops/<new-branch-name>

# ai-study 빌드 검증
cd /Users/jominho/Develop/ai-study && rtk npm run build

# 매 사이클 끝에 박제
/compound
```

---

## 🔚 종료 메시지 (이전 세션으로부터)

> *"시리즈는 여기서 멈추는 게 아니라 *정지 지점*이다. 당신(다음 세션)이 이 문서를 읽고 Journal 011을 시작할 때, 이 문서의 '다음 Journal 큐' 항목 중 하나를 선택하면 된다. 추측 큐에 너무 많은 시간을 쓰지 말고, 가장 가벼운 첫 단계부터 시작하라. 라이브 사고가 큐를 재정렬할 것이다. 그게 시리즈의 정상적 작동이다."*
>
> — Journal 010 작성자, 2026-04-12

---

## 📜 갱신 로그 (append-only)

### 2026-04-12 (late-later session) — Journal 011 작성

**라이브 발견**: 사용자의 새 요청 *"허브(ai-study)가 양쪽 워커 분석 중에도 워커 세션 작업을 안 깨뜨리게 셋업"*. Journal 011 큐 1번(moneyflow JSON Zod)이 아닌 **큐에 없던 항목**(tarosaju 자동 PR 이식 + 허브-워커 셋업)이 우선순위로 올라옴 — *계획 vs 현실 라이브 교정* 5회째.

**작업 산출**:
- 🔴 Journal 011 — `harness-journal-011-concurrent-session-safety.mdx` 신규
- ai-study `ai-ops/session-isolation-setup` 브랜치 → `/projects-sync` 슬래시 커맨드 + CLAUDE.md skill routing 추가 + Journal 011 + 이 NEXT.md 갱신 로그 (수동 머지 대기)
- moneyflow **PR #96** (`ai-ops/concurrent-session-safety`) → CLAUDE.md "동시 세션 안전 규칙" + CI/CD stale rule 정리 + .gitignore 보강 (자동 PR + Test Gate → 머지 예상)
- tarosaju **PR #6** (`ai-ops/auto-merge-flow-port`) → `.github/workflows/ai-review.yml` 이식 + CLAUDE.md + .gitignore (*수동 머지 필요* — chicken-and-egg)

**⚠️ 사용자 확인 필요 (자율 금지 영역)**:
- **tarosaju repo settings**: `Settings > Actions > General > Workflow permissions`을 **Read and write permissions**로 변경 + **Allow GitHub Actions to create and approve pull requests** 켜기. 현재 default `read`라 PR #6 머지 후 첫 자동 push가 403으로 실패할 수 있음.
- 변경 방법: 웹 UI 또는 `gh api -X PUT repos/Mino777/mino-tarosaju/actions/permissions/workflow -f default_workflow_permissions=write -F can_approve_pull_request_reviews=true`

**다음 큐 재정렬**:
- 🔴 1번(moneyflow JSON Zod) → 여전히 유효, Journal 012 후보
- 🔴 2번(비용 추적 DB 저장) → 여전히 유효 (Supabase 승인 대기)
- 🟡 3번(text guards 발동률) → Journal 013+
- 🟡 4번(prompt caching 재검토) → Journal 013+
- **신규 🟡** — tarosaju PR #6 머지 후 *첫 자동 흐름 dogfooding 검증* (Journal 005 패턴과 유사): 머지 후 첫 push가 자동 PR 생성 → Test Gate 통과 → Squash Merge 까지 확인
- **신규 🟡** — 허브-워커 셋업의 `/projects-sync` *실제 사용 관찰*: 실전에서 다른 세션 작업 흔적 감지 기능이 정말로 작동하는지 데이터 수집

**사고 재발률**: 여전히 **0회 / 8 사이클** (011까지 누적).

---

### 2026-04-12 (late-latest session) — Journal 012 작성

**완료 확인**: tarosaju repo settings(can_approve_pull_request_reviews 포함) 사용자 승인 후 완성 → PR #6 re-run으로 **dogfooding 자동 머지 성공** (1m25s). moneyflow PR #96 자동 머지 + ai-study PR #14 수동 머지. 3 PR 모두 landing.

**Journal 012 — moneyflow market_analyst 런타임 검증 (Layer 1+2)**:
- 🔴 `harness-journal-012-market-analyst-runtime-validation.mdx` 신규
- moneyflow **PR #97** (`ai-ops/zod-market-analyst`) → `validateMarketAnalystReport` type guard + `parseJSON` optional validator 매개변수 + market-analyst.ts 호출 사이트 1줄 + vitest 14 테스트 → **1m36s 자동 머지** ✅

**라이브 발견 + 도구 선택 교정**:
- 큐 1번(Zod 검증)을 시작하자마자 발견: moneyflow에 **zod 의존성이 없음** (package.json 미존재)
- `/projects-sync` 결과: moneyflow에 **다른 세션 7 active worktree + Conductor la-paz** 동시 작업 중
- 두 맥락 결합 → *Zod dep 추가 대신 순수 TypeScript type guard*로 의사결정 교정 (package-lock.json 동시 편집 충돌 회피)
- 이게 `/projects-sync`가 만든 *첫 실시간 제약 기반 의사결정* — Journal 011 셋업의 실전 가치 검증

**허브-워커 모델 첫 자기 사용**:
- Journal 011의 4개 층이 *동시에* 작동한 첫 실전
- `/projects-sync` → `/wt-branch` → ai-review.yml Rebase → inline Test Gate
- 동시 세션과의 충돌 0회

**큐 재정렬**:
- 🔴 1번(moneyflow JSON Zod) → **첫 1 에이전트 완료** (market_analyst). 나머지 12는 큐에 남음.
- 🔴 **Journal 013 후보**: *3 analyst 확장* (news/sentiment/fundamentals) — 동일 파일에 validator 3개 추가 + 각 1줄 변경 + 테스트 3개. 빠른 사이클 예상.
- 🔴 **Journal 014 후보**: *9 debate/judge/trader/PM 에이전트* — 응답 구조가 analyst와 다르므로 별도 설계 필요.
- 🟡 **Zod 범용화 결정**: 9 debate 에이전트 복잡도 확인 후 zod 도입 여부 결정. 결정 시점은 Journal 014 착수 전.
- 🟡 **Layer 3-4 (retry + instruction 추가)**: `callAI`에 maxRetries 옵션 → 실패 시 validator issues를 instruction에 추가해서 재요청. Journal 014+에서.

**사이클 크기**: 1 워커 PR + 1 허브 PR + 14 테스트. 한 사이클 한 박제 준수.

**사고 재발률**: **0회 / 9 사이클** (012까지 누적).

---

### 2026-04-12 (late-latest session) — Journal 013 작성

**Journal 013 — 3 analyst 확장 (Layer 1+2)**:
- 🔴 `harness-journal-013-three-analysts-runtime-validation.mdx` 신규
- moneyflow **PR #98** (`ai-ops/validators-3-analysts`) → validateNewsAnalystReport + validateSentimentAnalystReport + validateFundamentalsAnalystReport 3 validator + 3 호출 사이트 1줄씩 + vitest 24 케이스 → **1m30s급 자동 머지** ✅
- checkAgentReportBase 공유 → 4 validator가 동일 base 체크 공유 (변경 단일 지점 원칙)

**13 에이전트 진행률**: **4 / 13 = 31%** (market + news + sentiment + fundamentals)

**남은 에이전트 9개**:
- Journal 014 스코프: bull_researcher, bear_researcher, research_judge, risk_debate, devils_advocate, trader, portfolio_manager, custom_prompt
- 응답 구조가 analyst와 완전히 다름 (bull/bear report, judge decision, trader proposal, PM decision 등)

**다음 큐 재정렬**:
- 🔴 **Journal 014 (결정 필요)**: *9 debate/judge/trader/PM 에이전트*
  - **Zod 도입 결정 포인트** — analyst 4개는 type guard로 충분했지만 debate 9개 구조 복잡도가 달라 zod가 표현력에서 유리할 수 있음
  - Journal 014 착수 전: `/projects-sync`로 다시 moneyflow 상태 확인 → 다른 세션 worktree 수 변동 있는지 재평가 → zod dep 추가 안전성 판단
- 🔴 **Journal 015**: *Layer 3-4 (retry + instruction augmentation)* — `callAI`에 `maxRetries` 옵션 추가. 13 에이전트 전체 영향.
- 🟡 text guards 발동률 측정 (tarosaju, 여전히 데이터 대기)

**허브-워커 모델**: 두 번째 자기 사용 완료. Journal 012와 거의 동일한 리듬(1m30s 자동 머지) — *반복 가능한 리듬* 확인.

**사고 재발률**: **0회 / 10 사이클** (013까지 누적).

---

### 2026-04-12 (later-latest session) — Journal 014 작성 + 사용자 트리거

**사용자 트리거**: *"각 프로젝트에서 뭔가 개발하면서 생기는 꿀팁들을 너한테 PR로 계속 쏴주면 너가 하나의 엔트리로 관리하면서 계속 글로 히스토리를 남겨줬으면 좋겠어서 해봤어 ... 앞으로 이런 pr 오면 자동 머지 + 글 작성 해주면 돼~!"*

**직전 세션에서 사용자가 PR #15 생성**: `content/harness-engineering/dev-setup-tips-log.mdx` 신규. 살아있는 카탈로그 — Journal(1 사이클 서사)과 분리된 *단발성 QoL 수정 박제*용. append-only.

**Journal 014 — ai-study 허브에 ai-review.yml 이식 + 인바운드 팁 PR 흐름**:
- PR #15 수동 머지 ✅ (CI 이미 통과 상태)
- 🔴 `harness-journal-014-hub-auto-merge-inbound-tips.mdx` 신규
- ai-study `ai-ops/hub-auto-merge` 브랜치 → `.github/workflows/ai-review.yml` 이식(moneyflow → ai-study 첫 허브 이식) + `dev-setup-tips-log.mdx`의 For AI Agents 섹션 보강(워커 → 허브 PR 흐름 5단계 + 허브 처리 규칙) + Journal 014 박제 + 이 NEXT.md 갱신 → **수동 머지** (chicken-and-egg, 다음 PR부터 자동)

**변경점 (moneyflow → ai-study)**:
- Test Gate: `npx vitest + npm run build` → **`npm test + npm run build`** (ai-study는 `npm test`가 vitest alias, prebuild가 npm run build 안에서 자동으로 frontmatter zod + content manifest 검증)
- env: Supabase placeholder 제거 (ai-study는 build 시점에 필요 없음)
- 나머지 1:1 복제 (Find-or-Create PR → Rebase → Test Gate → Squash Merge → Reset branch)

**ci.yml과의 중복**:
- ai-study에는 이미 `ci.yml`(PR 이벤트)과 `ai-review.yml`(push 이벤트)가 중복 Test Gate를 돌림
- 결정: 중복 유지 (moneyflow의 test-gate.yml + ai-review.yml 패턴과 동일, 우발 회귀 커버리지)

**박제 전이성 5회째 / 자기 검증 구조 5회째**:
- 전이 방향: moneyflow(워커) → ai-study(**허브**) — 허브가 *수용자* 역할을 처음 받음
- 자기 검증: 허브-워커 모델의 *반대 방향*(워커 → 허브 쓰기)을 사용하여 허브가 워커 기여 수신 인프라를 만든다

**허브-워커 모델 양방향 확장**:
- Journal 011: 허브가 셋업 설계자 / 워커가 수신자
- Journal 012/013: 허브가 워커 코드 작업 주체 (허브 → 워커 쓰기)
- Journal 014: **워커 → 허브 쓰기**(역방향 기여)
- 3 사이클 만에 양방향 기여가 인프라로 확립

**다음 큐 재정렬**:
- 🟡 **워커 세션 CLAUDE.md에 tips/ PR 패턴 안내** — moneyflow/tarosaju CLAUDE.md에 "환경 팁 발견 시 허브에 tips/ PR 올리는 법" 한 줄 추가. 한 사이클로 묶음.
- 🔴 **Journal 015 (이전 014 스코프)**: 9 debate/judge/trader/PM 에이전트 validator — Zod 도입 vs type guard 결정.
- 🔴 **Journal 016 (이전 015 스코프)**: Layer 3-4 (retry + instruction augmentation) — `callAI`에 `maxRetries`.
- 🟡 **ci.yml + ai-review.yml 중복 관찰**: 실제로 두 실행이 돌아서 리소스 낭비인지 데이터 수집.
- 🟡 **tarosaju text guards 발동률**: 여전히 데이터 대기.

**사고 재발률**: **0회 / 11 사이클** (014까지 누적).

---

### 2026-04-13 — UI 정비 + iOS Harness Journal 재작성

**작업 트리거**: 이전 컨텍스트 소멸 후 재개. 복수의 미완성 작업 동시 처리.

**완료 항목**:

1. **Projects 페이지 탭 UI** — MoneyFlow | TaroSaju | AI Study 3탭. "all" 탭 없음, 기본값 첫 번째 탭.
   - Server Component(`page.tsx`) + Client Component(`projects-page-client.tsx`) 분리 패턴
   - 카테고리 키: `"moneyflow"` | `"tarosaju"` | `"ai-study-wiki"`

2. **`/harness-journal` 페이지 Web/iOS 탭 UI** — `🌐 Web | 📱 iOS Harness Journal` 탭 전환
   - 동일한 Server/Client 분리: `page.tsx`(데이터) + `harness-journal-client.tsx`(탭 상태)
   - slug 패턴: Web = `harness-journal-*`, iOS = `ios-ai-journal-*`

3. **iOS Harness Journal 000~005 전면 재작성**
   - 직전 세션에서 "AI 앱 개발" 내용으로 잘못 작성됐던 것을 실제 moneyflow-ios 프로젝트 기반으로 전면 재작성
   - Ep.000: RIBs+ReactorKit 베이스라인, 커스텀 스킬 5종 목록
   - Ep.001: 실제 `.swiftlint.yml` + `.swiftformat` 기반 PreToolUse/PostToolUse 훅
   - Ep.002: 실제 5종 슬래시 커맨드 (triage/review/investigate/ship/arch) — 기존 3종 오류 수정
   - Ep.003: `.claudeignore` 전체 구성 + SPM 멀티모듈 `.build/` 130GB 함정
   - Ep.004: `/ios-triage` 인터뷰 패턴 + RIBs 자주 나오는 버그 패턴 목록
   - Ep.005: iOS Compound 5단계 + `docs/solutions/` 실제 카테고리(swiftui/networking/storage/xctest/performance/build/ios-compat/appstore)

4. **`apple-intelligence-api.mdx` 전면 재작성**
   - 존재하지 않는 `IntelligenceKit` 가상 프레임워크 코드 완전 제거
   - 실제 iOS 18 API 3가지로 재작성: App Intents (`@AssistantSchemas`), CoreSpotlight (`CSSearchableItem`), Writing Tools (`UITextView.writingToolsBehavior`)

**CI 수정 (이전 세션 누적)**:
- `.claude/worktrees/` embedded git repo 문제 → `.gitignore` 추가 + unstage
- `apple-intelligence-api.mdx` mermaid 블록 파괴 복구
- `dynamic-context-injection.mdx` frontmatter YAML 오류 수정

---

### 2026-04-13 (terminal 복귀 세션) — UI 재정비 + tokenomics 분리 + iOS 시리즈 사실 정정 재작성

**작업 트리거**: 사용자가 클로드 앱 세션 결과물에 불만 → 터미널로 복귀해서 **다 갈아엎고 다시 정리**. 4 에이전트 병렬 투입.

**A안 (1차 push, commit `42dd44b`)** — UI + 인프라 수정:
1. **학습 히트맵** 요일 정렬 GitHub 스타일로 재작성 — 기존 sequential 7-day 블록(요일 정렬 X) → 일/월/.../토 행 기반 그리드 + 미래 셀 투명 + 월/수/금 라벨
2. **`/harness-journal` 탭 라벨** 정정 — `🌐 Web` → `🌐 Web + Backend`, `📱 iOS Harness Journal` → `📱 iOS` (Stats 섹션 동기화)
3. **`apple-intelligence-api.mdx` 손상 복구** — §3 Writing Tools 섹션에서 mermaid 블록이 Swift 코드 블록 시작부에 잘못 끼어들어가 acorn 파서 에러 발생. Swift 코드 fence 복원 + UITextView Writing Tools 설명 정상화
4. **`scripts/validate-content.mjs` 슬라이싱 버그 수정** — mermaid 자동 수정 시 `content`(frontmatter 제거 후) 기준으로 `indexOf` 검색하면서 `raw`(frontmatter 포함)에 슬라이싱 적용 → 오프셋이 frontmatter 길이만큼 어긋나서 파일 손상. **이게 apple-intelligence-api 손상의 진짜 원인** — 기존 세션의 자동 수정이 파일을 망가뜨리고 있었음. `raw.indexOf(...)`로 1줄 수정
5. **`tokenomics/claude-code-token-levers-applied-log.mdx` 신규** — 카탈로그에서 메타 분리. 4 조건 / 적용 로그 5건 / 실측 결과 표 / append-only live document

**B안 (2차 push, commit `7개 파일 824 insertions / 775 deletions`)** — 콘텐츠 재구조화 + 사실 정정:

1. **tokenomics 카탈로그 본체 재구조화** (`claude-code-token-levers-catalog.mdx`)
   - 503 → 443줄 압축 (적용 로그 분리)
   - 본문 순서 정비: 한 줄 요약 → 4 곱셈 모델 → 15 레버 → 안티패턴 → 우선순위 → 신뢰 → 출처
   - For AI Agents 60줄 → 3줄 핵심으로 압축, 위치를 본문 마지막으로
   - frontmatter `connections`에 applied-log entry 추가

2. **iOS Harness Journal 000~005** — moneyflow-ios 실제 AI 하네스 문서 기반 사실 정정 재작성 (이전 세션의 가상 코드/잘못된 카운트/허구 스킬 전부 폐기)

   | Ep | 주요 정정 사항 |
   |---|---|
   | **000** | "스킬 5종" → **7종** (compound + ios-arch + ios-bugfix + ios-investigate + ios-review + ios-ship + ios-triage). RIBs Swift 코드 80줄 삭제 → 한 줄 컨텍스트로 축소. 실제 settings.json 3 hooks 명시 |
   | **001** | 제목: "PreToolUse 훅" → **"git pre-commit 훅으로 코드 규칙 차단"**. 가짜 `swift-pre-write.sh` 전면 삭제. 진짜는 `.githooks/` + `setup.sh`. Claude PreToolUse는 informational 보조 신호일 뿐 |
   | **002** | "5종" → **"7종 (병렬 Agent 패턴 포함)"**. 가짜 .md 통째 인용 80줄 삭제. 병렬 Agent 패턴 명시: `/ios-review`(2 Agent), `/ios-arch`(3 Agent), `/compound`(3 Agent) |
   | **003** | 가상 `.claudeignore` 삭제 → 실제 21줄로 교체. **`**/.build/` 글로브 패턴 필수성** 강조. tokenomics applied-log 양방향 connection |
   | **004** | "가설 3개" 폐기 → **5 Round 인터뷰 + 5 체크리스트** 실제 구조. 인터뷰 4 룰 박제 (탐정식 / 라운드당 최대 3개 / 모호 답변 즉시 파고들기 / 로그 반드시 수령) |
   | **005** | "/ios-compound" → **"/compound"** 정정. 카테고리 8개 정정 (`appstore` 삭제, `architecture` 추가). Phase 1~5 실제 source 그대로 박제. **3 Agent 병렬 강조** |

**4 에이전트 병렬 투입** — 사용자 트리거 *"에이전트좀 더 투입해서 재작성해"*:
- Agent 1: tokenomics 카탈로그 재구조화 (233s)
- Agent 2: iOS 000 + 001 (148s) — 둘 다 in-place rewrite
- Agent 3: iOS 002 + 003 (108s)
- Agent 4: iOS 004 + 005 (149s)
- 모두 source 자료를 prompt에 inline으로 받아서 외부 fetch 0회

**산출**:
- ai-study 커밋 2개 (1차 + 2차)
- 신규 entry 1개 (`tokenomics/claude-code-token-levers-applied-log`)
- 재작성/대규모 수정 9개 파일
- 인프라 버그 1건 박제 (`validate-content.mjs` slicing offset)
- iOS 카테고리 진실값 8개 확정

**다음 큐 (NEW)**:
- 🟡 `validate-content.mjs` 슬라이싱 버그가 다른 파일도 손상시켰는지 grep으로 확인
- 🟡 `harness-engineering/compound-engineering-philosophy` dangling connection 12건 — 실제 엔트리 작성 또는 connections 정리
- 🟡 ios-ai 시리즈 Ep.006+ 큐 (moneyflow-ios 실제 패턴 발견 시 트리거): Persistent 모듈 / async 전환 / Xcode 타겟 멤버십 함정
- 🟡 학습 히트맵 캘린더 모드 전환 (월/년 단위 토글)

**사고 재발률**: 0회 (이번 세션 4 에이전트 + 본인 모두 충돌 없음)

---

### 2026-04-13 (terminal 세션 후반) — Journal 019 + 회사 프로젝트명 위반 정정 + validate regex fix

**작업 트리거**: 사용자 *"오늘 맥앱세션 뻘짓한것도 글로 좀 남기자. ~/mino-moneyflow, ~/mino-tarosaju 두 플젝 참고해서 글로 남겨줘"*.

**작업 산출**:

1. **Harness Journal 019 신규** — `harness-journal-019-mcapp-cross-session-cleanup.mdx`
   - 3 프로젝트(ai-study + moneyflow + tarosaju) 동시 발생 맥앱 Claude 세션 부산물 박제
   - tarosaju: 5 심각(NOT NULL 마이그레이션 위험 / Realtime 과잉설계 + dead code / Codex 오인용 / stale worktree / `.claude/worktrees` exclude)
   - moneyflow: PR #114 → #115 자가 fix(빌드 실패 + tsc 11 errors + Codex 오인용 commit message)
   - ai-study: 학습 히트맵 / 탭 라벨 / apple-intelligence-api 손상 / **validate-content.mjs slicing 버그** / iOS Journal 사실 오류
   - 6 공통 함정 패턴 박제: PR 메타데이터 거짓말 / 과잉설계+소비자0 / 빌드검증 누락 / Codex 오인용 / stale worktree / 자동수정 도구 silent 손상
   - 처방: 크로스 세션 리뷰 5단 프로토콜 (`/cross-session-review` 슬래시 커맨드 후보)

2. **회사 프로젝트명 위반 즉시 정정** ⚠️
   - 사용자가 발견 — 4 에이전트가 iOS Journal 재작성 시 회사 프로젝트 식별자를 그대로 노출
   - 메모리 `feedback_company_project_names.md`에 명시되어 있던 룰을 본인이 위반 (에이전트 prompt에 익명화 지시 누락)
   - 5건 grep + 치환 (자세한 매핑은 메모리 파일 참조)
   - 메모리 강화: 위반 사례 박제 + grep 가드 프로토콜 추가 + 에이전트 위임 시 익명화 지시 명시 룰 추가

3. **validate-content.mjs regex 누적 손상 버그 fix**
   - mermaid 노드 라벨 괄호 자동 수정 regex가 *이미 따옴표가 있는 라벨도 매치* → 매 실행마다 따옴표 누적: `D["x"]` → `D[""x""]` → `D["""""x"""""]`
   - apple-intelligence-api.mdx에서 5-quote(`"""""perform() 실행"""""`)로 누적된 흔적 발견 → 1-quote로 정상화
   - regex에 negative lookahead `(?!")` 추가 + 라벨 내부 `"` 제외 패턴 (`[^\[\]"]*`) 적용
   - 이번 세션에서 발견한 **두 번째 validate-content.mjs 버그** (첫 번째는 slicing offset, 두 번째는 regex 누적). 자동 수정 도구 신뢰 0.

**다음 큐 (NEW)**:
- 🔴 **회사 프로젝트명 grep 가드를 PreToolUse 훅으로** — Edit/Write 시 금지 패턴 감지 → 차단 (메모리 참조)
- 🔴 **`/cross-session-review` 슬래시 커맨드 신설** — Journal 019의 5단 프로토콜 자동화
- 🟡 **validate-content.mjs 자동 수정 도구 자체 검증** — 자동 수정 후 git diff stat 출력 + 누적 손상 검출 (test fixture로)
- 🟡 **다른 mermaid 블록 누적 손상 grep** — 따옴표 5+ 매치 패턴으로 다른 파일 검증

**사고 재발률 (수정)**: 1건 — 본인이 메모리 룰 위반. 즉시 발견 + 정정 + 메모리 강화.

---

## 🎯 다음 큐 (이번 세션 추가)

### iOS Harness Journal 006+ 후보

실제 moneyflow-ios에서 아직 박제 안 된 패턴들:

- **Ep.006**: Persistent 모듈 — AES256 암호화 UserDefaults 패턴 (`UserDefaultsWrapper<T>` 프로토콜 기반)
- **Ep.007**: ReactorKit + async/await 전환 패턴 — Observable에서 async로 점진적 마이그레이션
- **Ep.008**: iOS CI/CD — 자동 빌드 + 앱스토어 배포 플로우 (`ios-ship` 커맨드 심화)
- **Ep.009**: Xcode 타겟 멤버십 함정 — AI가 파일 추가 후 타겟에 포함 안 되는 문제 구조적 해결

우선순위는 **사용자가 실제로 해당 패턴에 부딪힌 시점**에 작성하는 것이 맞음 (라이브 발견 > 추측 큐).

### 기존 큐 유지

- 🔴 **Web Journal 015**: moneyflow 9 debate/judge/trader/PM 에이전트 validator (Zod 도입 결정 후)
- 🔴 **Web Journal 016**: Layer 3-4 (retry + instruction augmentation)
- 🟡 **tarosaju text guards 발동률 측정** (데이터 대기 중)
- 🟡 **비용 추적 DB 저장** (Supabase 승인 대기)

---

### 2026-04-12 (final-latest session) — Journal 011~015 직후 4 사이클 연속

**요약**: 사용자 트리거 "쭉쭉 진행"으로 4 작은 사이클 + Journal 015 + Vercel Pro 작업 연속.

**추가 landing**:
- moneyflow/tarosaju/ai-study **ai-review.yml Node 24 opt-in** 이식 — `env: FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` 한 줄, 3 PR 자동 머지 (Tokenomics "4 조건" 첫 실제 적용 사례, annotation 메시지 "Node 20 ... forced to run on Node.js 24"로 전환 확인)
- ai-study `tips/checkout-fast-forward-trap` PR — dev-setup-tips-log에 체크아웃 함정 박제 (허브가 자기 프로젝트에 tips/ 브랜치 dogfood). 2회 재발 패턴을 명시, 3회 재발 또는 /wt-branch 자동 checkout main 추가 가치 생기면 Journal 승격 후보.
- moneyflow **trader validator** — Harness Journal 015. Zod 도입 재평가 2차 → type guard 유지 결정 (근거: /projects-sync 상태 Journal 012와 동일 + 4 analyst 패턴 일관성 + TraderProposal 평면 구조).

**13 에이전트 Layer 1+2 진행률 업데이트**: **5 / 13 = 38%**
- ✅ market_analyst (J012), news/sentiment/fundamentals (J013), trader (J015)
- ⏳ investment_judge, devils_advocate (J016 평면 에이전트 후보)
- ⏳ research_debate, risk_debate, portfolio_manager (J017 중첩 구조, Zod 3차 재평가 지점)
- custom_prompt: 스코프 제외 (user-defined shape)

**Vercel Pro 사이클 (별도 PR)**:
- 사용자 트리거: *"버셀 프로모드 결제했으니까 analytics 제대로 활용해줘 뭐 커스텀 이벤트나 그런거 다 제대로 써줘. 그리고 버셀 프로모드일때 사용할 수 있는 기능들 우리 프로젝트에 적용할 수 있는거 있으면 다 해줘"*
- 별도 사이클로 진행 (아직 open)

**큐 재정렬**:
- 🔴 Journal 016: investment_judge + devils_advocate (2 평면 에이전트 묶음)
- 🔴 Journal 017: research-debate + risk-debate + portfolio-manager (중첩 구조, Zod 3차 재평가)
- 🔴 Journal 018+: Layer 3-4 (retry + instruction augmentation), 13 에이전트 전체 완료 후
- 🟡 `/wt-branch`에 자동 `checkout main` 단계 추가 검토 (체크아웃 함정 재발 3회 시 승격)

**사고 재발률**: **0회 / 13 사이클** (015까지 누적).

---

### 2026-04-12 (세션 마지막) — Compound wave 2 + Tokenomics 적용 + NEXT.md 최종 정리

**Compound wave 2 (이 섹션)**: 이전 compound(#20) 이후 추가 작업을 2차 문서화.

**Tokenomics 첫 2건 적용**:
- Node 24 opt-in (3 프로젝트): 적용 로그에 기록 완료
- `.claudeignore` 신설 (ai-study): `src/generated/`, `package-lock.json`, `.next/`, `docs/retros/`, `docs/solutions/` 등 불필요 context 배제. `/context` before/after 스냅샷은 다음 세션에서 수집 예정.

**메모리 업데이트**:
- `feedback_session_length.md` 신설: "세션 2-3 Journal 단위로 끊기"
- `project_ai_generated_mdx_guards.md`: JSX 파싱 함정 2 패턴 추가 (인라인 {} + `<숫자`)
- 기존 메모리: `project_hub_worker_model.md`, `feedback_real_time_constraint_over_textbook.md`, `feedback_tokenomics_apply_criteria.md` — 이번 세션에서 생성, 유지

**CHANGELOG.md wave 2 추가** + **docs/retros/2026-04-12.md wave 2 append**

---

## 🎯 다음 세션 큐 (2026-04-12 세션 마지막 기준)

### 🔴 우선순위 높음 — 모두 완료

1. ~~Vercel Pro Analytics~~ ✅
2. ~~Journal 016 (investment_judge)~~ ✅
3. ~~Journal 017 (Layer 1-2 완료)~~ ✅
4. ~~Journal 018 (Layer 3-4 완료)~~ ✅
5. ~~LLM-as-a-Judge 3 프로젝트~~ ✅
6. ~~Vibe Coding 쇼케이스 ai-study 추가~~ ✅

### 🟡 다음 세션 후보 (트리거 대기)

1. **LLM-as-a-Judge 품질 데이터 분석** — 며칠간 quality_score 데이터 축적 후, 평균/분포/시계열 추이 확인. 프롬프트 A/B 테스트 근거 마련
2. **Tokenomics 새 레버 탐색** — ccusage 베이스라인 확보됨. Anthropic/Claude Code 업데이트에서 새 토큰 최적화 기능 발견 시 적용
3. **RAG 파이프라인 (tarosaju)** — 명리학/타로 전문 문서 벡터 DB 구축. LLM-as-a-Judge의 domain_accuracy 점수가 낮으면 트리거
4. **프롬프트 A/B 테스트 인프라** — quality_score 데이터 기반. 프롬프트 버전 관리 + before/after 비교
5. **validate-content.mjs MDX JSX 사전 탐지** — `<숫자` + `{...}` 패턴 경고
6. **`/wt-branch` 자동 checkout main** — 체크아웃 함정 3회째 재발 시 승격

### 🟢 대기

7. **비용 추적 DB (Supabase)** — migration 승인 필요
8. **text guards 발동률** — 프로덕션 데이터 대기
9. **moneyflow worktree cleanup** — 다른 세션 스코프

---

### 2026-04-12 (새 세션) — Journal 017 작성 + 10/10 에이전트 Layer 1+2 완료

**발견**: moneyflow origin/main에 다른 세션이 investment_judge validator PR #106을 이미 머지. NEXT.md 큐 2번(J016) 절반 완료 상태.

**작업 산출**:
- devils_advocate validator — moneyflow `ai-ops/devils-advocate-validator` 브랜치 push (ai-review.yml 자동 PR 예상)
- research-debate + risk-debate + portfolio-manager validators — moneyflow `ai-ops/remaining-validators` 브랜치 push
- `harness-journal-017-final-validators-all-agents.mdx` 신규 + ai-study main push
- vitest 40 신규 케이스 (15 + 25)
- **10/10 에이전트 Layer 1+2 완료** (custom_prompt 제외)
- **Zod 3차 재평가 → type guard 최종 확정**

**큐 재정렬**: 큐 1~3번 모두 완료. 다음 최우선: Journal 018 (Layer 3-4 retry + instruction augmentation).

**사고 재발률**: **0회** (이번 세션).

---

### 2026-04-12 (새 세션 계속) — Journal 018 작성 + Layer 3-4 전체 완료

**작업 산출**:
- `retryWithValidation` + `callAIAndValidate` 인프라 (moneyflow PR #109 자동 머지)
- 나머지 9 에이전트 `callAIAndValidate` 전환 (moneyflow PR #110 자동 머지 대기)
- `harness-journal-018-layer3-retry-augmentation.mdx` 신규 + ai-study main push
- vitest 8 신규 케이스 (retryWithValidation)
- **5 Layer 중 Layer 1~4 실용적 완성**
- 사이드바: Harness Journal 서브그룹 분리 (일반 글 먼저 표시)

**큐 상태**: 큐 1~4번 모두 완료. 남은 큐는 중간/낮음 우선순위.

---

### 2026-04-12 (세션 후반) — LLM-as-a-Judge + Tokenomics 실측 + Vibe Coding 업데이트

**작업 산출**:
- **LLM-as-a-Judge 3 프로젝트 적용**: moneyflow `validateQualityScore` + `quality_score` select 추가 (PR #111, #112). tarosaju `quality-judge.ts` 신설 + fortune/tarot-chat 라우트 연결 (PR #16). ai-study `evaluation/llm-as-judge-pattern.mdx` 첫 실전 엔트리
- **Tokenomics 실측**: `.claudeignore` ~194K tokens 배제 (~50% context 축소). RTK 47.4M tokens 절감 (99.5%). ccusage 베이스라인 기록 (일평균 ~360M/$211, cache read 98%+)
- **Vibe Coding 쇼케이스**: ai-study를 3번째 프로젝트로 추가. 변천사 4단계 (AI 과외 선생님 → 허브-워커 관제 → LLM-First Wiki → 품질 관제 센터). moneyflow/tarosaju 메트릭 최신화
- **README**: 발전 히스토리 타임라인, 기술 스택 업데이트, 11 카테고리 반영
- **validate-content.mjs**: quiz `options`→`choices` 자동 교정 + 다른 세션 엔트리 confidence 범위 수정 4건
- **PR #30 빌드 에러 수정**: `<br>` → `<br />` MDX 자기 닫힘 태그

**이번 세션 전체 누적 (2026-04-12)**:
- Journal: 017, 018
- moneyflow PR: #107~#112 (6개 자동 머지)
- tarosaju PR: #16 자동 머지
- ai-study 커밋: 13+
- vitest 신규: 48
- 에이전트 Layer 1-4: 10/10 완성
- LLM-as-a-Judge: 3 프로젝트 적용
- 메모리 저장: 1 (`feedback_journal_trigger.md`)

---

## 🔁 이번 세션 고유 지표 (최종)

| 항목 | 최종값 |
|---|---|
| Journal 박제 | **5** (011~015) |
| PR 총 머지 | **24+** (ai-study 13 + moneyflow 7 + tarosaju 4) |
| 자동 머지 | **20+** |
| Runtime validator | **5/13 에이전트** (38%) |
| vitest 신규 테스트 | **52** |
| Tokenomics 적용 | **2건** (Node 24 opt-in + .claudeignore) |
| 슬래시 커맨드 | +1 (`/projects-sync`) |
| 카테고리 | 10 → **11** (tokenomics) |
| UI 개선 | 네비 중앙 검색 + 사이드바 4 그룹 아코디언 |
| 사고 재발률 | **0 / 14 사이클** |
| MDX 패턴 박제 | 2 → **4** |
| 메모리 파일 생성 | **4** (hub_worker + realtime_constraint + tokenomics + session_length) |

---
