# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-18 (Session 12 — self-hosted runner hybrid fallback 3프로젝트 이식)
- **작성 주체**: Claude (Session 12)
- **이유**: 세션 마무리 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 129
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기

### Self-hosted Runner 현황 (6개 전체 가동)
| 레포 | Runner 이름 | 라벨 | 상태 |
|---|---|---|---|
| **ai-study** | `jominhoui-mba-ai-study` | `self-hosted, macOS, ARM64, ai-study` | launchd 등록, 가동 중 |
| **moneyflow** | `jominhoui-mba-moneyflow` | `self-hosted, macOS, ARM64, moneyflow` | launchd 등록, 가동 중 |
| **tarosaju** | `jominhoui-mba-tarosaju` | `self-hosted, macOS, ARM64, tarosaju` | launchd 등록, 가동 중 |
| aidy-ios | `jominhoui-mba-ios` | `self-hosted, macOS, ARM64, aidy-ios` | launchd 등록, idle |
| aidy-server | `jominhoui-mba-server` | `self-hosted, macOS, ARM64, aidy-server` | launchd 등록, idle |
| aidy-android | `jominhoui-mba-android` | `self-hosted, macOS, ARM64, aidy-android` | launchd 등록, idle |

### Hybrid Fallback 적용 현황
| 레포 | ai-review.yml | CI/Test Gate | 검증 상태 |
|---|---|---|---|
| **ai-study** | Mark-step hybrid | ci.yml hybrid | fallback 트리거 확인 (npm audit 실패로 양쪽 다 실패 — 인프라는 정상) |
| **moneyflow** | Mark-step hybrid | test-gate.yml hybrid | push 완료, 워크플로우 실행됨 |
| **tarosaju** | Mark-step hybrid | test.yml hybrid (e2e는 GitHub-hosted 유지) | push 완료, 워크플로우 queued |

### 알려진 이슈
- **ai-study CI**: `npm audit --audit-level=high` 실패 중 — 취약점 해결 또는 warning 전환 필요
- **moneyflow/tarosaju**: 어제 빌링 한도로 failure 연발했던 것 → hybrid fallback으로 해결 예정

### Tokenomics 현재 상태
- **RTK 절감**: 53.0M tokens (97.4%)
- **Cache read**: 98%+

### aidy 4 레포
- **최신 상태**: s14 종료, WO 32건 done, 637 tests, api-contract v0.4
- **다음 시작점**: `aidy-architect/HANDOFF.md`

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **ai-study npm audit 실패 해결**
   - `npm audit --audit-level=high`에서 취약점 감지 → CI 실패
   - 취약점 패치 또는 audit를 warning 모드로 전환
   - 예상 크기: S

2. **JIT 검색 성과 검증 — 4프로젝트 관찰**
   - 각 프로젝트 `data/search-hits.json`의 totalQueries 추적
   - ai-study shadow-benchmark 93%+ 유지 확인 (3/3 세션)
   - 3세션 연속 유지 시 Layer 3 검증 완료 선언
   - 예상 크기: S (관찰)

### 🟡 Medium

3. **validate-mdx Trap 3 stress test**
   - JSX `{}` 패턴이 코드 블록 밀집 파일에서 FP 발생 가능
   - 코드 블록 밀집 엔트리 5개 선정 → dry-run → FP 비율 측정
   - 예상 크기: S

4. **히트 카운트 100+ 도달 시 0회 엔트리 표시**
   - totalQueries > 100 이후 판단
   - 예상 크기: S

5. **미완성 마커 정리**
   - harness-journal-003 "구현 예정" / tokenomics-catalog "작성 필요"
   - 빌드 경고 2건 해소
   - 예상 크기: S

### 🟢 Low

6. **인덱싱 자동화 (pre-commit 또는 CI)**
7. **Flow Map Part 5 재개 판단** — deferred

---

## ⚠️ 블로커 / 대기 사항

### 코드 결정 대기
- **0회 엔트리 하이라이트 방식** — 데이터 충분히 쌓인 후 사용자와 논의

### 다른 세션 주의
- moneyflow `docs/v0944-handoff` / tarosaju `docs/next-plan` — 브랜치 주의
- aidy 4 레포 — `~/Develop/aidy-architect/HANDOFF.md` 확인

### Runner 운영
- Runner 디렉토리: `~/actions-runner-{ai-study,moneyflow,tarosaju,ios,server,android}/`
- 월간: `~/actions-runner-*/_ work` 정리, npm cache 확인
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

### 2026-04-18 (Session 12 — self-hosted runner hybrid fallback 이식)
- **Self-hosted runner 3개 신규 등록** — ai-study, moneyflow, tarosaju (macOS ARM64, launchd)
- **ADR-010 Mark-step hybrid fallback** — ai-review.yml + ci.yml/test-gate.yml/test.yml 전부 적용
- **GitHub 빌링 한도 자동 우회** — primary(GitHub-hosted) 실패 시 self-hosted fallback 자동 트리거
- **알려진 이슈** — ai-study `npm audit --audit-level=high` 실패 (인프라 아닌 취약점 문제)
