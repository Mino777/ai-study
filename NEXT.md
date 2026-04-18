# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16 — NEXT.md 큐 소화 + 그래프 시각 개선)
- **작성 주체**: Claude (Session 16)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 134
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과, 테스트 33/33 (3 파일)
- **그래프**: 134 노드, Obsidian 스타일 원형 레이아웃 (charge -280, forceRadial r=220)

### 도구
| 도구 | 명령 | 용도 |
|------|------|------|
| Graph Query CLI | `node scripts/graph-query.mjs <cmd>` | 지식 그래프 7개 쿼리 |
| 승격 스캐너 | `node scripts/scan-promotions.mjs` | N=3+ 솔루션 자동 감지 |
| 승격 CI | `.github/workflows/promotion-scan.yml` | **신규** — push+weekly → Issue 자동 생성 |
| generate-lesson | `npm run generate-lesson` | graph 신호 연동 + 다양성 cap (카테고리 max 2) |

### 워커 프로젝트 상태 (2026-04-18 기준)
| 프로젝트 | 상태 | 주의 |
|---|---|---|
| **moneyflow** | compound/v0945-docs 브랜치, PR #130 open | 다른 세션 작업 중 |
| **tarosaju** | main 동기화, PR #45 open | compound 문서화 PR |
| **aidy-architect** | main 동기화, untracked 파일 있음 | WO-017 gate review 흔적 |

### JIT 검색 현황
| 프로젝트 | totalQueries |
|---|---|
| ai-study | 6 |
| moneyflow | 4 |
| tarosaju | 3 |
| aidy-architect | 13 |
| **합계** | **26** (100 미달, 관찰 계속) |

### Tokenomics
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **promotion-scan.yml 실제 동작 검증**
   - `gh workflow run promotion-scan` 수동 트리거 → Issue 생성 확인
   - `promotion-scan` 라벨 사전 생성 필요
   - 예상 크기: S

### 🟡 Medium

2. **JIT 검색 성과 검증 — 4프로젝트 관찰**
   - totalQueries 100 도달 시 적중률 분석
   - 예상 크기: S (관찰)

3. **히트 카운트 100+ 도달 시 0회 엔트리 표시**
   - 예상 크기: S

4. **validate-mdx Trap 3 AST 파싱 개선 검토**
   - FP 90%+ — 실제 사고 유발 시 착수
   - 예상 크기: M

5. **워커 재료 추가 박제 후보**
   - moneyflow: Content Pipeline 상태 머신, React Hydration + SW 캐시
   - tarosaju: Large Page Decomposition, Supabase Realtime Retry
   - 예상 크기: S each

### 🟢 Low

6. **인덱싱 자동화 (pre-commit 또는 CI)**
7. **Flow Map Part 5 재개 판단** — deferred
8. **Semantic Caching POC** — JIT 검색에 벡터 유사도 기반 캐시 추가
9. **멀티 에이전트 모델 라우팅** — Haiku/Sonnet/Opus 사다리 자동 선택

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: `compound/v0945-docs` 브랜치 + PR #130 — 만지지 말 것
- tarosaju: PR #45 open — compound 문서화
- aidy: WO-017 gate review 작업 흔적

### Runner 운영
- Runner 디렉토리: `~/actions-runner-{ai-study,moneyflow,tarosaju,ios,server,android}/`
- launchd 서비스 확인: `launchctl list | grep actions.runner`

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
- [ ] 4프로젝트 `data/search-hits.json`의 totalQueries 확인

### Phase 4: 최근 박제 훑기 (3분)
- [ ] Runner 상태 확인: `launchctl list | grep actions.runner`
- [ ] 3프로젝트 최근 CI 실행 확인: `gh run list --repo Mino777/<repo> --limit 3`
- [ ] `node scripts/graph-query.mjs suggest` — 그래프 기반 추천 확인
- [ ] `node scripts/scan-promotions.mjs` — 승격 대상 확인

### Phase 5: 작업 시작 (2분 내)
- [ ] 새 작업은 `/wt-branch <branch-name>` 으로 시작
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📝 부록: 자주 쓰는 명령

```bash
# 6개 runner 상태 확인
launchctl list | grep actions.runner

# 4프로젝트 JIT 히트 카운트 확인
for p in ~/Develop/ai-study ~/Develop/mino-moneyflow ~/Develop/mino-tarosaju ~/Develop/aidy-architect; do
  echo "$(basename $p): $(cat $p/data/search-hits.json 2>/dev/null | jq -r '.totalQueries // 0')"
done

# 그래프 분석
node scripts/graph-query.mjs suggest
node scripts/graph-query.mjs hubs 10

# 승격 스캔
node scripts/scan-promotions.mjs

# 사이클 종료
/compound
```

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (append 금지)
- **완료된 큐 항목은 즉시 제거**
- **갱신 로그는 최근 1개만**
- **재사용 학습** → memory · solutions · retros 로 승격

---

## 📜 최근 갱신

### 2026-04-19 (Session 16 compound — NEXT.md 큐 소화 + 그래프 시각 개선)
- **완료**: computeGraphSignals vitest (High 2) + 승격 CI (High 1) + 추천 다양성 (Medium 3)
- **완료**: 지식 그래프 Obsidian 스타일 레이아웃 (유저 요청)
- **신규 High**: promotion-scan.yml 실제 동작 검증
- **제거**: 완료된 큐 5건 (High 2 + Medium 1 + 그래프)
