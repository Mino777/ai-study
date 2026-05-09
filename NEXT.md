# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 작성 시점

- **작성 일시**: 2026-05-09 (auto-trade 이식 + 인프라 정비 세션)
- **작성 주체**: Claude (하네스 이식 + Gemini 퀄리티 + Blake 정비 세션)
- **이유**: 세션 핸드오프

---

## 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 221
- **그래프**: 229 nodes, 1,547 edges
- **Solutions**: workflow 17, mdx 9, ai-pipeline 6, github-actions 5, next-patterns 3, performance 1
- **테스트**: 71개
- **Mermaid 규칙**: 8개 AUTO-FIX (FIX 1-8)

### auto-trade (신규)
- **레포**: Mino777/auto-trade (private)
- **하네스**: CLAUDE.md + settings.json + 5 commands + JIT 검색(Python) + specs/

### Gemini 파이프라인
- Google Search grounding 활성화, AI slop 방지, Swift 우선, 2500-4000자
- 자동 머지: 긱뉴스 + Blake 모두 → 하루 최소 2개 엔트리

---

## P0 — 완료 ✅

### /interview 대폭 디벨롭 (2026-05-09 완료)
- **결과**: iOS 101 + FDE 32 + Culture 15 + Quiz 170 = **318개** (190 → 318, +67%)
- **파일**: `src/app/interview/constants.ts` (3220줄 → 3395줄)
- **추가 영역**: SwiftUI 심화(8), Swift 6 Concurrency(5), Tuist/SPM(4), TCA(3), CI/CD(3), 접근성(2), 딥링크(2), App Store(3), Push(2), Instruments(3), CoreML(3), Crash(2), Swift Testing(2), Swift Macro(2), RxSwift(2), FDE Cloud/인프라(5), Observability(4), Security(3), Customer Success(4), Data(3), Culture 7개

---

## P1 — 이번 주 내
- Gemini Search grounding 적용 후 엔트리 퀄리티 실측 비교
- Blake 스카우트 자동 머지 정상 작동 확인

## Backlog
- auto-trade JIT 검색 실제 테스트
- /interview 실전 모의면접 모드

---

## 이번 스프린트 KPI
| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 엔트리 수 | 221 | 225 | higher | ? |
| 면접 콘텐츠 | 190 | 300 | higher | **318** ✅ |
| Mermaid 렌더링 에러 | 0 | 0 | lower | ? |
