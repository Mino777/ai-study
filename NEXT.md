# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 작성 시점

- **작성 일시**: 2026-05-08 (전체 엔트리 점검 스프린트)
- **작성 주체**: Claude (엔트리 점검 세션)
- **이유**: 세션 핸드오프

---

## 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 204
- **그래프**: 207 nodes, 1,509 edges
- **상태**: draft 0, in-progress 0, complete 204 (전수 정상)
- **Solutions**: workflow 15, mdx 8, ai-pipeline 5, github-actions 4, next-patterns 3, performance 1
- **테스트**: 71개 (mermaid-fix 34 + check-skills 23 + resolver-eval 7 + harness-fitness 7)
- **하네스 구성**: deny 7, hooks 4+, rules 2, commands 13, harness-fitness 7개 자동검증
- **Flow Map**: 6편 (architect + ios + android + backend + moneyflow + tarosaju)

### 이번 세션에서 한 것
- draft 21개 + in-progress 3개 → complete (production 404 전부 수정)
- 역링크 309개 일괄 추가 (지식 그래프 촘촘화)
- 의사코드 3건 → 실전 패턴으로 교체

### 워커 프로젝트 위키 접근
- aidy-architect: ✅ (커밋 완료)
- mino-moneyflow: ✅ (커밋 완료)
- mino-tarosaju: ✅ 커밋 완료, 미푸시

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 엔트리 수 | 204 | 210 | higher | ? |
| 그래프 edges | 1509 | 1600 | higher | ? |
| draft 잔여 | 0 | 0 | lower | ? |

---

## 다음 작업 큐 (우선순위순)

### P0 — 즉시
1. **Vercel 배포 확인**: 이번 120파일 변경이 정상 배포되었는지 확인
2. **tarosaju 커밋 push**: 위키 접근 설정 커밋이 아직 미푸시

### P1 — 이번 주
3. **엔트리 내용 깊이 보강**: 이번 점검은 구조(status/connections) 중심. 다음은 본문 품질 보강 (특히 confidence 1-2 엔트리)
4. **draft 자동 경고**: generate-content-manifest.mjs에서 draft 엔트리 발견 시 경고 출력 추가 검토
5. **역링크 자동화**: 엔트리 생성 시 fix-one-way-connections 자동 실행 통합 검토

### Backlog
- SM-2 분산반복 알고리즘을 퀴즈에 적용 (틀린 문제 우선 출제)
- 하네스 템플릿 GitHub 공개 검토
- next-patterns 솔루션 compiled-truth 생성 (N=3 도달)
- AI 생성 엔트리 코드블록 "의사 코드" 패턴 자동 경고 (validate-content 보강)

---

## 다음 세션 시작 체크리스트

1. CLAUDE.md → SPEC.md → ai-agent-start-here → 이 문서 로드
2. `git pull --rebase` (AI 파이프라인 자동 생성 엔트리 확인)
3. 엔트리 수 실측: `cat src/generated/content-manifest.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['entries']))"`
4. Vercel 배포 상태 확인
5. P0 큐 착수
