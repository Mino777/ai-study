# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 작성 시점

- **작성 일시**: 2026-05-02 (Session 27 — 하네스 마스터클래스)
- **작성 주체**: Claude (Session 27)
- **이유**: 세션 핸드오프

---

## 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 194+
- **Solutions**: workflow 16, mdx 9, ai-pipeline 6, github-actions 5, next-patterns 3, performance 1
- **테스트**: 71개 (mermaid-fix 34 + check-skills 23 + resolver-eval 7 + harness-fitness 7)
- **하네스 구성**: deny 7, hooks 4+, rules 2, commands 13, harness-fitness 7개 자동검증
- **하네스 템플릿**: harness-template/ (공통) + harness-template/ios/ (iOS)
- **하네스 연구**: Fowler + arxiv + Anthropic + OpenAI 4편 종합 적용
- **Flow Map**: 6편 (architect + ios + android + backend + moneyflow + tarosaju)

### 워커 프로젝트 위키 접근
- aidy-architect: ✅ additionalDirectories + CLAUDE.md 안내 (커밋 완료)
- mino-moneyflow: ✅ 동일 (커밋 완료, 미푸시)
- mino-tarosaju: ✅ 동일 (커밋 완료, 미푸시)
- pre-assignment: ✅ 공통 하네스 + 위키 접근 (git init + 커밋 완료)

### /interview 히든 페이지
- **규모**: constants.ts 3,500+줄 + page.tsx 2,600+줄
- **구성**: 7탭 / 118퀴즈 / 53플래시카드 / 11알고리즘 / 20CS / 6시스템디자인 / 토스 25토픽 상세
- **플래시카드**: 랜덤 셔플 (페이지 진입 시마다 다른 7장)

---

## 다음 작업 큐 (우선순위순)

### P0 — 즉시
1. **워커 프로젝트 위키 접근 검증**: 다음 moneyflow/tarosaju 세션에서 `cd ../ai-study && node scripts/search.mjs` 실제 동작 확인
2. **moneyflow/tarosaju 커밋 push**: 위키 접근 설정 커밋이 아직 미푸시

### P1 — 이번 주
3. **면접 페이지 모바일 반응형**: 현재 데스크탑 위주 — 모바일에서 탭/카드 레이아웃 확인
4. **퀴즈 뱅크 120문제 달성**: 현재 118문제
5. **플래시카드 iOS 55장 목표**: 현재 53장

### P2 — 다음 주
6. **하네스 템플릿을 다른 프로젝트에서 실전 검증**: pre-assignment에서 실제 사전과제 진행하며 하네스 효과 측정
7. **CS 토픽 25개 목표**: 현재 20개 → 분산시스템/캐싱/인증 심화

### Backlog
- SM-2 분산반복 알고리즘을 퀴즈에 적용 (틀린 문제 우선 출제)
- 하네스 템플릿 GitHub 공개 검토
- 워커 프로젝트 위키 검색 히트 카운트 수집 구조 (필요 시)

---

## 다음 세션 시작 체크리스트

1. CLAUDE.md → SPEC.md → ai-agent-start-here → 이 문서 로드
2. `git pull --rebase` (AI 파이프라인 자동 생성 엔트리 확인)
3. 엔트리 수 실측: `cat src/generated/content-manifest.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['entries']))"`
4. P0 큐 착수
