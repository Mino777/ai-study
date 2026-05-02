# /review — 2-Stage Pre-Landing Review (Superpowers SDD 이식)

PR 또는 현재 diff를 머지 전 리뷰한다.
Plan 문서가 존재하면 2-stage, 없으면 1-stage.

## Stage 0: Plan 문서 탐지

```bash
# Plan 문서 존재 여부 확인
ls PLAN.md docs/plans/*.md 2>/dev/null
# 또는 대화 히스토리에서 Plan mode 사용 흔적 확인
```

- Plan 문서 있음 → **Stage 1 + Stage 2** 순차 실행
- Plan 문서 없음 → **Stage 2만** 실행

---

## Stage 1: Spec Compliance (Plan 있을 때만)

Plan 문서의 각 항목을 diff와 line-by-line 대조.

### 체크리스트
- [ ] Plan의 모든 항목이 구현되었는가? (누락 항목 목록화)
- [ ] Plan에 없는 스코프 밖 변경이 있는가? (스코프 크리프 탐지)
- [ ] Plan의 제약 조건이 코드에 반영되었는가?
- [ ] Plan에서 명시한 안티패턴을 위반하는 코드가 있는가?

### 판정
- ✅ PASS: 모든 Plan 항목 구현 + 스코프 밖 변경 없음
- ⚠️ WARNING: 사소한 누락 (1~2건), 의도적 스코프 변경 설명 가능
- ❌ FAIL: 핵심 항목 누락 또는 Plan과 코드가 불일치

Stage 1이 FAIL이면 Stage 2 진행하지 말고 즉시 보고.

---

## Stage 2: Code Quality (항상 실행)

diff 기준으로 코드 품질 리뷰.

### 체크리스트
- [ ] **MDX/콘텐츠**: JSX 함정, Mermaid 문법, frontmatter 유효성
- [ ] **보안**: OWASP Top 10 (XSS, injection, CSRF 등)
- [ ] **타입 안전**: TypeScript strict 위반, any 사용
- [ ] **에러 처리**: 경계(API, 사용자 입력)에서만 검증, 내부는 신뢰
- [ ] **성능**: 불필요한 리렌더, N+1, 번들 크기 증가
- [ ] **테스트**: 변경된 로직에 대한 테스트 커버리지
- [ ] **No-Placeholder**: TODO:, FIXME:, TBD 등 미완성 마커 잔존

### 판정
- ✅ PASS: 머지 가능
- ⚠️ WARNING: 개선 권장 사항 있으나 머지 가능
- ❌ FAIL: 머지 전 수정 필요

---

## Few-shot Calibration (Anthropic 3-Agent 패턴 적용)

리뷰 판정 시 다음 기준표를 참고하여 일관된 점수를 부여한다.

### PASS 예시
- diff가 Plan의 모든 항목을 구현
- 스코프 밖 변경 0건
- TypeScript strict 위반 0건
- 테스트 커버리지 변경된 로직에 존재
- 보안 이슈 0건

### WARNING 예시
- Plan 항목 1-2건 사소한 누락 (주석, 문서 등)
- any 타입 1-2건 (레거시 호환 목적 명시)
- 성능 개선 가능하지만 기능에 영향 없음
- TODO 1건 (다음 PR로 명시적 이관)

### FAIL 예시
- Plan 핵심 항목 누락
- XSS/injection 취약점 발견
- 빌드 실패 또는 기존 테스트 깨짐
- 하드코딩된 시크릿
- 스코프 밖 대규모 리팩토링 (승인 없이)

---

## 출력 형식

```markdown
# Review: [브랜치명 또는 커밋 범위]

## Stage 1: Spec Compliance [PASS/WARN/FAIL/SKIP]
- (항목별 판정)

## Stage 2: Code Quality [PASS/WARN/FAIL]
- (항목별 판정)

## 최종 판정: [PASS/WARN/FAIL]
```
