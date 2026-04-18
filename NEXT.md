# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-18 (Session 13 final — CI 안정화 + 워커 재료 박제)
- **작성 주체**: Claude (Session 13)
- **이유**: 세션 마무리 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 131
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: npm audit 통과, 빌드 경고 0건, 테스트 23/23

### Self-hosted Runner 현황 (6개 전체 가동)
| 레포 | Runner 이름 | 상태 |
|---|---|---|
| **ai-study** | `jominhoui-mba-ai-study` | 가동 중 |
| **moneyflow** | `jominhoui-mba-moneyflow` | 가동 중 |
| **tarosaju** | `jominhoui-mba-tarosaju` | 가동 중 |
| aidy-ios / aidy-server / aidy-android | 각각 등록 | idle |

### 워커 프로젝트 상태 (2026-04-18 projects-sync)
| 프로젝트 | 상태 | 주의 |
|---|---|---|
| **moneyflow** | compound/v0945-docs 브랜치, PR #130 open | 다른 세션 작업 중 |
| **tarosaju** | main 동기화, PR #45 open | compound 문서화 PR |
| **aidy-architect** | main 동기화, untracked 파일 있음 | WO-017 gate review 작업 흔적 |

### JIT 검색 현황
| 프로젝트 | totalQueries |
|---|---|
| ai-study | 6 |
| moneyflow | 4 |
| tarosaju | 3 |
| aidy-architect | 11 |
| **합계** | **24** (100 미달, 관찰 계속) |

### Tokenomics
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🟡 Medium

1. **JIT 검색 성과 검증 — 4프로젝트 관찰**
   - totalQueries 100 도달 시 적중률 분석
   - 3세션 연속 유지 시 Layer 3 검증 완료 선언
   - 예상 크기: S (관찰)

2. **히트 카운트 100+ 도달 시 0회 엔트리 표시**
   - totalQueries > 100 이후 판단
   - 예상 크기: S

3. **validate-mdx Trap 3 AST 파싱 개선 검토**
   - stress test에서 FP 90%+ 확인됨
   - FP가 실제 사고 유발 시 착수
   - 예상 크기: M

4. **워커 재료 추가 박제 후보** (이번 세션에서 발견, 미착수)
   - moneyflow: Content Pipeline 상태 머신, React Hydration + SW 캐시
   - tarosaju: Large Page Decomposition, Supabase Realtime Retry
   - 예상 크기: S each

### 🟢 Low

5. **인덱싱 자동화 (pre-commit 또는 CI)**
6. **Flow Map Part 5 재개 판단** — deferred

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: `compound/v0945-docs` 브랜치 + PR #130 — 만지지 말 것
- tarosaju: PR #45 open — compound 문서화
- aidy: WO-017 gate review 작업 흔적 — `~/Develop/aidy-architect/HANDOFF.md` 확인

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

### 2026-04-18 (Session 13 final — CI 안정화 + 워커 재료 박제)
- **CI 안정화**: npm audit 해결 + 미완성 마커 해소 + validate-mdx stress test
- **워커 재료 박제**: empathetic-ai-prompt-techniques (tarosaju) + parallel-worktree-git-lock-trap (moneyflow)
- **기존 엔트리 보강**: Zod 5-Layer에 실전 적용 데이터 추가
- **메모리**: /projects-sync 시 aidy-architect 포함 룰 저장
- **2차 compound**: 워커 재료 박제분까지 포함하여 문서화 완료
