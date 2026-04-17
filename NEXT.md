# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-17 (Session 11b — JIT 검색 4프로젝트 이식)
- **작성 주체**: Claude (Session 11b)
- **이유**: 세션 마무리 compound

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 129
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **슬래시 커맨드**: **11개**
- **Git 상태**: main clean, origin/main 동기

### JIT 검색 — 4프로젝트 배포 완료
- **ai-study**: 1,426 청크 / Top-5 93% / totalQueries 6
- **moneyflow**: 354 청크 / 측정 중 / docs/v0944-handoff 브랜치
- **tarosaju**: 227 청크 / 측정 중 / docs/next-plan 브랜치
- **aidy-architect**: 308 청크 / 측정 중 / main 브랜치
- **aidy 워커(server/ios/android)**: 미이식 (자체 docs 없음, architect 참조)

### Tokenomics 현재 상태
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

### aidy 4 레포
- **최신 상태**: s14 종료, WO 32건 done, 637 tests, api-contract v0.4
- **다음 시작점**: `aidy-architect/HANDOFF.md`

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **JIT 검색 성과 검증 — 4프로젝트 관찰**
   - 각 프로젝트 `data/search-hits.json`의 totalQueries 추적
   - ai-study shadow-benchmark 93%+ 유지 확인 (3/3 세션)
   - 3세션 연속 유지 시 Layer 3 검증 완료 선언
   - 예상 크기: S (관찰)

2. **validate-mdx Trap 3 stress test**
   - JSX `{}` 패턴이 코드 블록 밀집 파일에서 FP 발생 가능
   - 코드 블록 밀집 엔트리 5개 선정 → dry-run → FP 비율 측정
   - 예상 크기: S

### 🟡 Medium

3. **히트 카운트 100+ 도달 시 0회 엔트리 표시**
   - totalQueries > 100 이후 판단
   - 예상 크기: S

4. **미완성 마커 정리**
   - harness-journal-003 "구현 예정" / tokenomics-catalog "작성 필요"
   - 빌드 경고 2건 해소
   - 예상 크기: S

### 🟢 Low

5. **인덱싱 자동화 (pre-commit 또는 CI)**
6. **Flow Map Part 5 재개 판단** — deferred

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기
- **0회 엔트리 하이라이트 방식** — 데이터 충분히 쌓인 후 사용자와 논의

### 다른 세션 주의
- moneyflow `docs/v0944-handoff` / tarosaju `docs/next-plan` — 브랜치 주의
- aidy 4 레포 — `~/Develop/aidy-architect/HANDOFF.md` 확인

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
- [ ] `docs/retros/2026-04-17-session-11b.md`
- [ ] `docs/solutions/next-patterns/2026-04-17-dashboard-jit-stats-solutions-filter.md`

### Phase 5: 작업 시작 (2분 내)
- [ ] 새 작업은 `/wt-branch <branch-name>` 으로 시작
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📝 부록: 자주 쓰는 명령

```bash
# 4프로젝트 JIT 히트 카운트 확인
for p in ~/Develop/ai-study ~/Develop/mino-moneyflow ~/Develop/mino-tarosaju ~/Develop/aidy-architect; do
  echo "$(basename $p): $(cat $p/data/search-hits.json 2>/dev/null | jq -r '.totalQueries // 0')"
done

# ai-study 빌드
cd ~/Develop/ai-study && rtk npm run build

# Layer 3 검색 (각 프로젝트에서)
rtk npm run search -- "query text"

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

### 2026-04-17 (Session 11b — JIT 검색 4프로젝트 이식)
- **JIT 검색 이식 완료** — moneyflow(354) + tarosaju(227) + aidy-architect(308)
- **대시보드 버그 수정** — solutions 경로 필터링
- **큐 정리** — JIT 이식 완료, 관찰 모드로 전환
