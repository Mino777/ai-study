# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 작성 시점

- **작성 일시**: 2026-05-21 (stock 단타 탭 + iOS Harness Journal 025 세션 직후 compound)
- **작성 주체**: Claude (단타 탭 박제 + 워커 프로젝트 incident 추출 세션)
- **이유**: 세션 핸드오프 + KPI 판정(엔트리 exceeded, scale_up)

---

## 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 262 (2026-05-09 대비 +41 — 봇 스카우트 + iOS 저널 022~025)
- **그래프**: 270 nodes, 1,642 edges
- **Solutions**: workflow 19, mdx 9, ai-pipeline 6, github-actions 5, next-patterns 3, performance 1 (workflow +2 이번 스프린트)
- **테스트**: 71개 (모두 통과)
- **Mermaid 규칙**: 8개 AUTO-FIX (FIX 1-8) · 렌더링 에러 0 유지
- **일방향 연결**: 113건 (소프트 워닝 · 작업 시 양방향 백필 권장)

### 봇 파이프라인 (정상 작동)
- 데일리 레슨(Gemini): 매일 09:00 KST 주제 추천 → 댓글 트리거 → PR 자동 머지
- Blake 스카우트: 영문 블로그 → 한국어 엔트리 → 자동 머지 (이번 스프린트 #154 5건 머지 확인)
- 긱뉴스 스카우트: 22:00 KST → 4 프로젝트 매칭 → hub-dispatch (#155 머지 확인)

### auto-trade
- 레포: Mino777/auto-trade · 하네스 이식 완료 (CLAUDE.md, settings.json, JIT 검색, specs)
- 상태: JIT 검색 실제 테스트 미완 (carry-over)

---

## P0 — 완료 ✅ (이번 세션)

- **iOS Harness Journal 025** — 안전 추론의 사각지대(커밋되지 않은 working-tree 상태). incident 3종 + 양방향 연결 4건. pre-push 리뷰어 캐치 후 git 시맨틱 정정 → 정밀 구분 표를 자산화.
- **stock 단타 루틴 탭** — M-STOCK 흐름 기반 4단계 + 1억 호가 라이브 계산기 + 허매수/허매도 구분.

## P1 — 이번 주 내

- [ ] **`/stock` 페이지 CLAUDE.md 등재 판단** — /resume·/interview는 등재됐는데 /stock만 누락. 의도적 비공개인지 정책 판단 후 등재 OR 명시 누락.
- [ ] **Gemini Search grounding 퀄리티 실측 비교** — grounding 켠 엔트리 vs 끈 엔트리 정성 평가 (carry-over from 2026-05-09)
- [ ] **github-actions(5)·next-patterns(3) 스킬 후보 검토** — 누적 N≥3 도달했으나 전용 check 스킬 부재. `/promote-solution`으로 패턴 추출 검토.
- [ ] **일방향 연결 113건 일괄 백필** — `node scripts/fix-one-way-connections.mjs --apply` 단독 PR. 작업 commit과 섞지 말 것.

## Backlog

- auto-trade JIT 검색 실제 테스트 (자기 코드에 grep + 임베딩)
- /interview 실전 모의면접 모드 (Quiz 170 + Flashcard 풀에서 랜덤 출제)
- iOS Harness Journal 026 후보: 워커 프로젝트의 *JIT recall L1~L7 / 지식시스템 v2 bitemporal* — 별도 `harness-journal-025-jit-retrieval-poc-phase1`이 일부 커버하지만 ios 시각의 L7 ontology + spec-extractor 패턴은 미커버 (조사 필요)
- 직장인 사이드 보유 7개 프로젝트의 솔루션 cross-pollination 점검 (가장 박제 안 된 곳 식별)

---

## 이번 스프린트 KPI

이번 actual을 다음 baseline으로 갱신 (복리 효과).

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 엔트리 수 | 262 | 280 | higher | ? |
| 일방향 연결 | 113 | 80 | lower | ? |
| Mermaid 렌더링 에러 | 0 | 0 | lower | ? |
| 빌드 시간(s) | 5 | 4 | lower | ? |

직전 스프린트 결과: 엔트리 221→262 (+41 entries vs target +4 = **10.25× planned delta** → exceeded · 봇+저널 합산). action: scale_up. 다음 target +18(=280-262)로 현실 보정. 양방향 연결은 미관리 영역이라 이번 스프린트 새 KPI로 도입(graph 무결성). KPI 표기 규칙: 비율과 절댓값·delta 병기.

---

## 다음 세션 시작 체크리스트 (참고)

1. **CLAUDE.md → SPEC.md → ai-agent-start-here 로드** (3분)
2. **NEXT.md 읽기** (이 파일, 5분) — 큐 + KPI 확인
3. **MEMORY.md 확인** (3분) — 신규 메모리 4건 추가됨 (git-semantics, worktree-merge-back, 등)
4. **실측 검증** (5분) — `node -e "..."`로 엔트리 수·연결 실측 (NEXT 수치는 작성 시점 기준)
5. **P1 우선 처리** (위 큐) — 작업 분기는 `/wt-branch` 반사
