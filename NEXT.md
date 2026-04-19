# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16i — 히든 이력서 페이지)
- **작성 주체**: Claude (Session 16i)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 144
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과, 테스트 34/34
- **신규 페이지**: `/resume` (히든, R키 5회, iOS/FDE 탭, robots disallow)

### Hermes-First 스택 상태
- **판정**: 현재 불필요 (2026-04-19)
- **재검토 트리거**: 동시 에이전트 5개+ / 24/7 무인 운영 / 기억 손실 3회+ / OS 위임 5회+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **Mermaid subgraph/node ID 충돌 63건 일괄 정리**
   - `mermaid-fix.mjs`가 이미 감지. 나머지 파일 수동 수정 필요
   - 예상 크기: M

2. **긱뉴스 스카우트 결과 확인**
   - 22:00 KST 자동 실행 → Actions 탭에서 결과 확인
   - 예상 크기: S

### 🟡 Medium

3. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - tarosaju에서 `feat/ai-api-3layer-defense` 브랜치 작업 중
   - 예상 크기: M (프로젝트당)

4. **이력서 노션 동기화**
   - 현재 코드(page.tsx)와 노션 md 파일 내용 불일치 — iOS 노션 파일 업데이트 필요
   - 예상 크기: S

5. **이력서 디자인 최종 폴리싱**
   - 글자 크기/마진 미세 조정, 모바일 반응형 확인
   - 예상 크기: S

### 🟢 Low

6. **next-patterns Compiled Truth** — N=3 도달, _compiled-truth.md 대상
7. **JIT 검색 성과 검증** — totalQueries 100 도달 시 적중률 분석

---

## ⚠️ 블로커 / 대기 사항

### 다른 세션 주의
- moneyflow: conductor worktree `la-paz` 존재 — 만지지 말 것
- tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중
- aidy-architect: ahead 1
- aidy-server: ahead 2

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
- [ ] Mermaid 충돌 63건 정리 우선
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-19 (Session 16i — 히든 이력서 페이지)
- **완료**: /resume 히든 페이지 (R키 5회 이스터에그)
- **완료**: iOS/FDE 탭 스위처 + FDE 전용 섹션 (JD 필수 항목 ①②)
- **완료**: 그린카 608건 실적 기반 내용 + Harness/Context/Compound 강조
- **완료**: PDF 다운로드, 프로필 사진, 기술블로그 링크
- **다음**: Mermaid 충돌 63건 + 이력서 노션 동기화
