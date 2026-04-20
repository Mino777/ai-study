# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-20 (Session 17 — 위키 AI 에이전트 실용성 강화)
- **작성 주체**: Claude (Session 17)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 146
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과, 테스트 34/34
- **자동화 워크플로우**: 6 (daily-lesson, generate-on-pick, vercel-retry, scout-geeknews, geek-news-auto-lesson, weekly-search-benchmark)
- **AI Agent 신뢰 필드**: last_verified + applicable_to — 146개 전체 백필 완료

### Hermes-First 스택 상태
- **판정**: 현재 불필요 (2026-04-19)
- **재검토 트리거**: 동시 에이전트 5개+ / 24/7 무인 운영 / 기억 손실 3회+ / OS 위임 5회+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **weekly-search-benchmark.yml grep 패턴 검증**
   - `node scripts/shadow-benchmark.mjs` 로컬 실행 → 실제 출력 포맷 확인
   - 워크플로우 grep 패턴과 일치하는지 검증 → 불일치 시 수정
   - 예상 크기: S

2. **Mermaid subgraph/node ID 충돌 63건 일괄 정리**
   - `mermaid-fix.mjs`가 이미 감지. 나머지 파일 수동 수정 필요
   - 예상 크기: M

### 🟡 Medium

3. **applicable_to 2차 정밀화**
   - journal 시리즈(날짜순): 프로젝트 특화 (moneyflow/tarosaju/aidy) 기본값
   - pattern 엔트리: `["any"]` 유지
   - 예상 크기: M (스크립트 + 검증)

4. **SummaryCard UI 배지 브라우저 검증**
   - generated_by / applicable_to / last_verified 배지 실제 렌더 확인
   - 빌드만 통과 확인 → 시각적 검증 미수행
   - 예상 크기: S

5. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - tarosaju에서 `feat/ai-api-3layer-defense` 브랜치 작업 중
   - 예상 크기: M (프로젝트당)

6. **이력서 노션 동기화**
   - 현재 코드(page.tsx)와 노션 md 파일 내용 불일치 — iOS 노션 파일 업데이트 필요
   - 예상 크기: S

### 🟢 Low

7. **JIT 검색 성과 검증** — totalQueries 100 도달 시 적중률 분석
8. **이력서 디자인 최종 폴리싱** — 글자 크기/마진 미세 조정, 모바일 반응형 확인

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: conductor worktree `la-paz` 존재 — 만지지 말 것
- tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중
- aidy-architect: ahead 1 (2026-04-19 기준)
- aidy-server: ahead 2 (2026-04-19 기준)

### 검증 미완료 항목
- weekly-search-benchmark.yml: shadow-benchmark.mjs 출력과 grep 패턴 불일치 가능 (첫 월요일 전 확인 필요)

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 엔트리 수 | 144 | 150 | higher | ? |
| AI Agent Directive 커버리지 | 85% | 100% | higher | ? |
| 자동화 워크플로우 수 | 5 | 7 | higher | ? |
| applicable_to 정밀도(any 외 비율) | 0% | 20% | higher | ? |

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
- [ ] weekly-search-benchmark.yml grep 패턴 검증 최우선
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-20 (Session 17 — 위키 AI 에이전트 실용성 강화)
- **완료**: OpenMythos 엔트리 재작성 (프론트엔드 → 하네스/컴파운드 비교 분석)
- **완료**: bash-watcher zero-token polling 패턴 엔트리 신규 생성
- **완료**: schema.ts last_verified + applicable_to 필드 추가
- **완료**: summary-card.tsx AI생성/검증일/적용범위 배지 추가
- **완료**: backfill-frontmatter.mjs — 144개 파일 일괄 백필
- **완료**: weekly-search-benchmark.yml GitHub Actions 워크플로우 생성
- **주의**: weekly-search-benchmark grep 패턴 로컬 검증 미수행 → 다음 세션 최우선
