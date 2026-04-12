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
