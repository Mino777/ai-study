# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16e — perpetual-engine 분석 + 3대 패턴 이식)
- **작성 주체**: Claude (Session 16e)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 143
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **슬래시 커맨드**: 13개 (신규: /consult, /message)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과

### 신규 인프라 (이번 세션)
| 인프라 | 파일 | 상태 |
|--------|------|------|
| MetricsEvaluator (Phase 1b) | `.claude/commands/compound.md` | 정의됨, KPI 미정의 |
| /consult | `.claude/commands/consult.md` | 정의됨, 미실전 |
| /message + messages/ | `.claude/commands/message.md` | 정의됨, 미실전 |

### 워커 프로젝트 상태 (2026-04-19 기준)
| 프로젝트 | 상태 | hub-dispatch |
|---|---|---|
| **moneyflow** | main behind 1, conductor worktree 존재 | #136 Claude Design 프로토타이핑 |
| **tarosaju** | feat/ai-api-3layer-defense 브랜치 | — |
| **aidy-architect** | main 동기화 (s23 완료) | #3 Claude Design 핸드오프 |

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 총 엔트리 수 | 143 | 148 | higher | ? |
| /consult 실전 사용 | 0 | 1 | higher | ? |
| /message 실전 사용 | 0 | 1 | higher | ? |

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **신규 인프라 실전 검증**
   - `/consult` 첫 실전 사용 — 적절한 자문 상황에서 실행
   - `/message send moneyflow "..."` — 워커에 첫 directive 전송 테스트
   - 예상 크기: S

2. **긱뉴스 스카우트 첫 실행 결과 확인**
   - 오늘 밤 22:00 KST 첫 실행 → Actions 탭에서 결과 확인
   - Gemini 매칭 품질 검증 → 프롬프트 튜닝 필요 여부 판단
   - 예상 크기: S

3. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - Supabase Edge Functions 프록시 + 인증 + Rate Limiting
   - 예상 크기: M (프로젝트당)

### 🟡 Medium

4. **[워커] SDD Acceptance Spec 강화** (moneyflow, tarosaju, aidy 4레포)
   - 각 프로젝트 SPEC.md에 Build/Content/Promotion Gate 추가
   - 예상 크기: S

5. **[허브] Hub-Worker 병렬화 다음 단계**
   - Agent tool sub-agent 병렬 spawn, 워커별 CLAUDE.md 경량화 검토
   - 예상 크기: M

6. **JIT 검색 성과 검증** — totalQueries 100 도달 시 적중률 분석

7. **워커 재료 박제 후보** (미처리분)
   - moneyflow: Content Pipeline 상태 머신, React Hydration + SW 캐시
   - tarosaju: Large Page Decomposition, Supabase Realtime Retry
   - aidy: continue-on-error masking (Mark-step 패턴), ingest→WO 풀사이클

### 🟢 Low

8. **인덱싱 자동화 (pre-commit 또는 CI)**
9. **Semantic Caching POC**
10. **멀티 에이전트 모델 라우팅**

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: conductor worktree `la-paz` 존재 — 만지지 말 것
- tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기
- [ ] `SPEC.md` 읽기
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택

### Phase 3: Git 동기화 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `/projects-sync` 실행 (메시지 큐 확인 포함)

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] 새 작업은 `/wt-branch <branch-name>` 으로 시작
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📝 부록: 자주 쓰는 명령

```bash
# hub-dispatch 이슈 현황 (4 워커)
for repo in mino-moneyflow mino-tarosaju aidy-architect aidy-server; do
  echo "=== $repo ==="; gh issue list --repo Mino777/$repo --label hub-dispatch --state open --json number,title --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null
done

# 그래프 + 승격
node scripts/graph-query.mjs suggest
node scripts/scan-promotions.mjs

# 신규 커맨드 테스트
/consult <전문가 서술>
/message send moneyflow "<directive>"
/message read
```

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (append 금지)
- **완료된 큐 항목은 즉시 제거**
- **갱신 로그는 최근 1개만**
- **재사용 학습** → memory · solutions · retros 로 승격

---

## 📜 최근 갱신

### 2026-04-19 (Session 16e compound — perpetual-engine 분석 + 3대 패턴 이식)
- **완료**: perpetual-engine 소스코드 분석 → 이식 가능 패턴 3개 엔트리
- **완료**: MetricsEvaluator → /compound Phase 1b 이식
- **완료**: ConsultantFactory → /consult 슬래시 커맨드 이식
- **완료**: MessageQueue → /message + messages/ 이식 + /projects-sync 연동
- **신규**: NEXT.md에 첫 KPI 테이블 정의 (엔트리 수, /consult 사용, /message 사용)
