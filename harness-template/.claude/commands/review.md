# /review — 2-Stage Pre-Landing Review

PR 또는 현재 diff를 머지 전 리뷰한다.
Plan 문서가 존재하면 2-stage, 없으면 1-stage.

## Stage 0: Plan 문서 탐지

```bash
ls PLAN.md docs/plans/*.md 2>/dev/null
```

- Plan 문서 있음 → **Stage 1 + Stage 2** 순차 실행
- Plan 문서 없음 → **Stage 2만** 실행

---

## Stage 1: Spec Compliance (Plan 있을 때만)

Plan 문서의 각 항목을 diff와 line-by-line 대조.

### 체크리스트
- [ ] Plan의 모든 항목이 구현되었는가?
- [ ] Plan에 없는 스코프 밖 변경이 있는가?
- [ ] Plan의 제약 조건이 코드에 반영되었는가?

### 판정
- ✅ PASS: 모든 Plan 항목 구현 + 스코프 밖 변경 없음
- ⚠️ WARNING: 사소한 누락 (1~2건)
- ❌ FAIL: 핵심 항목 누락 또는 Plan과 코드가 불일치

---

## Stage 2: Code Quality (항상 실행)

### 체크리스트
- [ ] **보안**: OWASP Top 10 (XSS, injection, CSRF 등)
- [ ] **타입 안전**: strict 위반, any 사용
- [ ] **에러 처리**: 경계에서만 검증, 내부는 신뢰
- [ ] **성능**: 불필요한 리렌더, N+1, 번들 크기 증가
- [ ] **테스트**: 변경된 로직에 대한 테스트 커버리지
- [ ] **No-Placeholder**: TODO:, FIXME:, TBD 잔존

## Few-shot Calibration (판정 기준)

### PASS 예시
- diff가 Plan의 모든 항목을 구현, 보안 이슈 0건, 테스트 존재

### WARNING 예시
- Plan 항목 1-2건 사소한 누락, any 타입 1-2건

### FAIL 예시
- XSS/injection 취약점, 빌드 실패, 하드코딩 시크릿

---

## 출력 형식

```markdown
# Review: [브랜치명]

## Stage 1: Spec Compliance [PASS/WARN/FAIL/SKIP]
## Stage 2: Code Quality [PASS/WARN/FAIL]
## 최종 판정: [PASS/WARN/FAIL]
```
