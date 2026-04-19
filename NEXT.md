# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16d — 워커 재료 박제 + Claude Design + 엔트리 정비)
- **작성 주체**: Claude (Session 16d)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 142
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과
- **그래프**: 142 노드, Obsidian 스타일 원형 레이아웃

### 도구
| 도구 | 명령 | 용도 |
|------|------|------|
| Graph Query CLI | `node scripts/graph-query.mjs <cmd>` | 지식 그래프 7개 쿼리 |
| 승격 스캐너 | `node scripts/scan-promotions.mjs` | N=3+ 솔루션 자동 감지 |
| 승격 CI | `.github/workflows/promotion-scan.yml` | push+weekly → Issue 자동 생성 |
| generate-lesson | `npm run generate-lesson` | graph 신호 + 다양성 cap |
| 긱뉴스 큐레이션 | `node scripts/curate-geeknews.mjs` | 24h 미응답 시 자동 엔트리 |
| 긱뉴스 스카우트 | `node scripts/scout-geeknews.mjs` | 22:00 KST 전체 스캔 → 프로젝트별 이식 계획 |

### 워커 프로젝트 상태 (2026-04-19 기준)
| 프로젝트 | 상태 | hub-dispatch |
|---|---|---|
| **moneyflow** | main behind 1, conductor worktree 존재 | #136 Claude Design 프로토타이핑 |
| **tarosaju** | feat/ai-api-3layer-defense 브랜치 | — |
| **aidy-architect** | main 동기화 (s23 완료) | #3 Claude Design 핸드오프 |

### 긱뉴스 파이프라인 상태
- **큐레이션** (`auto-lesson-geeknews.yml`): 정상 작동 확인 (수동 트리거 성공, `actionable-insight` 라벨 생성 완료)
- **스카우트** (`daily-scout-geeknews.yml`): 오늘 밤 22:00 KST 첫 실행 예정

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **긱뉴스 스카우트 첫 실행 결과 확인**
   - 오늘 밤 22:00 KST 첫 실행 → Actions 탭에서 결과 확인
   - Gemini 매칭 품질 검증 → 프롬프트 튜닝 필요 여부 판단
   - 예상 크기: S

2. **promotion-scan.yml 실제 동작 검증**
   - `gh workflow run promotion-scan` 수동 트리거 → Issue 생성 확인
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
- [ ] `/projects-sync` 실행

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
```

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (append 금지)
- **완료된 큐 항목은 즉시 제거**
- **갱신 로그는 최근 1개만**
- **재사용 학습** → memory · solutions · retros 로 승격

---

## 📜 최근 갱신

### 2026-04-19 (Session 16d compound — 워커 재료 박제 + Claude Design)
- **완료**: 워커 재료 박제 4건 (agent-compiler, cost-cap, sprint-optimization, claude-design)
- **완료**: 긱뉴스 auto-lesson 디버깅 (actionable-insight 라벨)
- **완료**: ai-agent-start-here 404 링크 수정 3곳
- **완료**: hub-dispatch 2건 (aidy#3, moneyflow#136)
- **신규 메모리**: tokenomics 카테고리 범위, 중복 확인 필수
