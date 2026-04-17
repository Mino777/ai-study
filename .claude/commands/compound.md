# /compound — 복리형 지식 축적

매 스프린트/배포 후 실행. 이번 작업을 문서화하여 다음 작업이 더 쉬워지게 한다.

## Phase 1: 변경사항 수집

git log + git diff로 최근 변경사항 파악.
대화 히스토리에서 디버깅/문제해결 과정 추출.

## Phase 2: 3가지 문서 생성 (병렬)

### CHANGELOG.md
Keep a Changelog 포맷. Added/Changed/Fixed + Metrics.

### docs/solutions/[category]/YYYY-MM-DD-slug.md
"다음에 또 만날 수 있는가?" YES일 때만 작성.
카테고리: build-errors, runtime-errors, next-patterns, mdx,
          ai-pipeline, performance, workflow, github-actions
포맷: 문제 → 증상 → 해결(before/after) → 근본 원인 → 체크리스트

### docs/retros/YYYY-MM-DD.md
이번에 한 것, 잘된 것, 아쉬운 것, 다음에 적용할 것, Compound Assets, 수치.

## Phase 3: CLAUDE.md 동기화
새 API/컴포넌트/구조 변경 있으면 CLAUDE.md 업데이트.

## Phase 3b: Anti-Rationalization Guard (Superpowers 이식)
회고 작성 전 자기 점검 — 다음 중 해당하는 것이 있으면 회고에 솔직히 기록:
- "이 정도면 충분하다"고 판단했지만, 실제로는 어려운 부분을 건너뛴 것 아닌가?
- 에러/경고를 무시하고 넘어간 곳이 있는가?
- 테스트 없이 "동작할 것"이라고 추정한 코드가 있는가?
- 사용자 피드백 없이 자체 판단으로 스코프를 줄인 곳이 있는가?

## Phase 4: 메모리 업데이트
핵심 교훈을 Claude Code 메모리에 저장.

## Phase 5: 단일 커밋
compound: [날짜] 스프린트 문서화
