# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 작성 시점

- **작성 일시**: 2026-04-29 (Session 26 — iOS Harness Journal 012 엔트리화)
- **작성 주체**: Claude (Session 26)
- **이유**: 세션 핸드오프

---

## 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 180
- **Solutions**: workflow 16, mdx 9, ai-pipeline 6, github-actions 5, next-patterns 3, performance 1
- **Resolver eval**: 48/48 = 100% 유지
- **Weekly CI**: 허브 + 워커 6 = 7 repo ON
- **AI 파이프라인 방어**: 3중 (자동이스케이프 + 빌드차단 + GHA게이트) — 2026-04-27 구축
- **iOS 저널**: 000~012 (13편)

### /interview 히든 페이지
- **규모**: constants.ts 3,039줄 + page.tsx 2,536줄 = 5,575줄
- **구성**: 7탭 / 96퀴즈 / 47플래시카드 / 11알고리즘 / 20CS / 6시스템디자인
- **iOS/FDE**: 듀얼트랙 완전 분리
- **접근**: I키 5회 이스터에그 + URL 직접

---

## 다음 작업 큐 (우선순위순)

### P0 — 즉시
1. **면접 페이지 테스트 추가**: 퀴즈 셔플 균등분포, localStorage 영속성, 트랙 전환 독립성 최소 테스트
2. **Vercel 배포 확인**: 빌드 통과 확인

### P1 — 이번 주
3. **퀴즈 뱅크 100문제 달성**: 현재 96문제 → 100+ (AI 워크플로우 4문제 추가)
4. **플래시카드 iOS 50장 목표**: 현재 35장 → 50장 (UIKit 성능, SwiftUI 실전, Combine 심화)
5. **뉴스레터 엔트리 보강**: 딜라이트룸 사례 원문 재확인 + SwiftUI vs UIKit 벤치마크 엔트리

### P2 — 다음 주
6. **면접 페이지 모바일 반응형**: 현재 데스크탑 위주 — 모바일에서 탭/카드 레이아웃 확인
7. **CS 토픽 30개 목표**: 현재 20개 → 분산시스템/캐싱/인증 심화 추가

### Backlog
- SM-2 분산반복 알고리즘을 퀴즈에 적용 (틀린 문제 우선 출제)
- 자소서 기반 맞춤 질문 생성 (AI 연동)
- AI 역량검사 시뮬레이터

---

## 다음 세션 시작 체크리스트

1. CLAUDE.md → SPEC.md → ai-agent-start-here → 이 문서 로드
2. `git pull --rebase` (AI 파이프라인 자동 생성 엔트리 확인)
3. 엔트리 수 실측: `cat src/generated/content-manifest.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['entries']))"`
4. P0 큐 착수

---

## 참고: 워커 레포 저널화 팁

gma-ios 등 워커 레포 작업을 ai-study 저널로 박제할 때:
1. `git -C ~/Develop/<repo> log --since="3 days ago"` 로 커밋 파악
2. `docs/retros/` + `docs/solutions/` 확인 (compound 문서가 원재료)
3. 공개 금지 키워드 sanitize (`gma-ios`, `GreenCar` → "iOS 앱", "사내 iOS 프로젝트")
4. 솔루션: `docs/solutions/workflow/2026-04-29-external-repo-journal-from-compound-docs.md`
