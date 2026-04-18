# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16b — 긱뉴스 자동 큐레이션 + 허브 디스패치)
- **작성 주체**: Claude (Session 16b)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 137
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과, 테스트 33/33 (3 파일)
- **그래프**: 137 노드, Obsidian 스타일 원형 레이아웃

### 도구
| 도구 | 명령 | 용도 |
|------|------|------|
| Graph Query CLI | `node scripts/graph-query.mjs <cmd>` | 지식 그래프 7개 쿼리 |
| 승격 스캐너 | `node scripts/scan-promotions.mjs` | N=3+ 솔루션 자동 감지 |
| 승격 CI | `.github/workflows/promotion-scan.yml` | push+weekly → Issue 자동 생성 |
| generate-lesson | `npm run generate-lesson` | graph 신호 + 다양성 cap |
| 긱뉴스 큐레이션 | `node scripts/curate-geeknews.mjs` | **신규** — 24h 미응답 시 자동 엔트리 |
| 긱뉴스 CI | `.github/workflows/auto-lesson-geeknews.yml` | **신규** — 08:50 KST 자동 실행 |

### 워커 프로젝트 상태 (2026-04-19 기준)
| 프로젝트 | 상태 | hub-dispatch |
|---|---|---|
| **moneyflow** | compound/v0945-docs, PR #130 open | #131 API프록시, #132 AgentCompiler |
| **tarosaju** | main 동기화 | #46 API프록시 |
| **aidy-architect** | main 동기화 | #1 AgentCompiler, #2 SDD |
| **aidy-server** | main 동기화 | #6 API프록시 |

### 허브 디스패치 체계
- 각 워커 CLAUDE.md에 `hub-dispatch` 이슈 확인 규칙 추가 완료
- 세션 시작 시 `gh issue list --label hub-dispatch --state open` 자동 확인

### JIT 검색 현황
| 프로젝트 | totalQueries |
|---|---|
| ai-study | 6 |
| moneyflow | 4 |
| tarosaju | 3 |
| aidy-architect | 13 |
| **합계** | **26** (100 미달, 관찰 계속) |

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - hub-dispatch 이슈: tarosaju#46, moneyflow#131, aidy-server#6
   - Supabase Edge Functions 프록시 + 인증 + Rate Limiting
   - 예상 크기: M (프로젝트당)

2. **[워커] AgentCompiler 동적 전환** (moneyflow + aidy-architect)
   - hub-dispatch 이슈: moneyflow#132, aidy-architect#1
   - AGENT_ROUTING 하드코딩 → 런타임 컴파일
   - 예상 크기: M

3. **promotion-scan.yml 실제 동작 검증**
   - `gh workflow run promotion-scan` 수동 트리거 → Issue 생성 확인
   - `promotion-scan` + `actionable-insight` 라벨 사전 생성 필요
   - 예상 크기: S

### 🟡 Medium

4. **[워커] SDD Acceptance Spec 강화** (moneyflow, tarosaju, aidy 4레포)
   - hub-dispatch 이슈: aidy-architect#2
   - 각 프로젝트 SPEC.md에 Build/Content/Promotion Gate 추가
   - 예상 크기: S

5. **[허브] Hub-Worker 병렬화 다음 단계**
   - Agent tool sub-agent 병렬 spawn, 워커별 CLAUDE.md 경량화 검토
   - 예상 크기: M

6. **JIT 검색 성과 검증** — totalQueries 100 도달 시 적중률 분석

7. **히트 카운트 100+ 도달 시 0회 엔트리 표시**

8. **워커 재료 박제 후보**
   - moneyflow: Content Pipeline 상태 머신, React Hydration + SW 캐시
   - tarosaju: Large Page Decomposition, Supabase Realtime Retry
   - aidy: WO 에이전트 검증 패턴, Architect-Worker 라우팅 사례

### 🟢 Low

9. **인덱싱 자동화 (pre-commit 또는 CI)**
10. **Semantic Caching POC**
11. **멀티 에이전트 모델 라우팅**

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: `compound/v0945-docs` 브랜치 + PR #130 — 만지지 말 것
- aidy: WO-017 gate review 작업 흔적

### Runner 운영
- Runner 디렉토리: `~/actions-runner-{ai-study,moneyflow,tarosaju,ios,server,android}/`

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
- [ ] `rtk git -C ~/Develop/mino-moneyflow fetch origin`
- [ ] `rtk git -C ~/Develop/mino-tarosaju fetch origin`
- [ ] `rtk git -C ~/Develop/aidy-architect fetch origin`
- [ ] 4프로젝트 hub-dispatch 이슈 현황 확인

### Phase 4: 최근 박제 훑기 (3분)
- [ ] Runner 상태 확인: `launchctl list | grep actions.runner`
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] 새 작업은 `/wt-branch <branch-name>` 으로 시작
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📝 부록: 자주 쓰는 명령

```bash
# runner 상태
launchctl list | grep actions.runner

# hub-dispatch 이슈 현황 (4 워커)
for repo in mino-moneyflow mino-tarosaju aidy-architect aidy-server; do
  echo "=== $repo ==="; gh issue list --repo Mino777/$repo --label hub-dispatch --state open --json number,title --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null
done

# JIT 히트 카운트
for p in ~/Develop/ai-study ~/Develop/mino-moneyflow ~/Develop/mino-tarosaju ~/Develop/aidy-architect; do
  echo "$(basename $p): $(cat $p/data/search-hits.json 2>/dev/null | jq -r '.totalQueries // 0')"
done

# 그래프 + 승격
node scripts/graph-query.mjs suggest
node scripts/scan-promotions.mjs
```

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (append 금지)
- **완료된 큐 항목은 즉시 제거**
- **갱신 로그는 최근 1개만**
- **재사용 학습** → memory · solutions · retros 로 승격

---

## 📜 최근 갱신

### 2026-04-19 (Session 16b compound — 긱뉴스 큐레이션 + 허브 디스패치)
- **완료**: 긱뉴스 자동 큐레이션 파이프라인 (curate-geeknews.mjs + CI)
- **완료**: 엔트리 3건 자동 생성 + 이식 평가 + hub-dispatch 6건
- **완료**: bot 오트리거 수정, Mermaid 에러 수정, UTC→KST 통일
- **완료**: 60% 컨텍스트 임계값 규칙, 워커 CLAUDE.md hub-dispatch 규칙
- **신규**: API 프록시 (High), AgentCompiler (High), SDD 강화 (Medium)
