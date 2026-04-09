# Changelog

모든 주목할 만한 변경사항을 이 파일에 기록합니다.

## [2026-04-09 autoceo-2 R2] — 양방향 연결된 개념

### Changed
- 위키 엔트리의 "연결된 개념" 섹션이 양방향으로 동작
  - outgoing: 이 글이 참조하는 엔트리 (→)
  - incoming: 이 글을 참조하는 다른 엔트리 (←)
  - mutual: 양쪽 모두 참조 (↔)
- 정렬: 같은 카테고리 우선 → 양방향 mutual 우선
- 각 연결 카드에 방향 아이콘 + 호버 툴팁

### 효과
- 연결성이 실제 그래프에 더 가깝게 표시됨
- 단방향 connection만으로도 역방향에서 발견 가능
- 학습 경로 탐색 개선

---

## [2026-04-09 autoceo-2 R1] — 학습 타임라인 + MDX 솔루션 문서

### Added
- `/timeline` 페이지 — 날짜별 학습 기록 시간순 뷰 (월별 그룹, 요일 표시)
- 헤더 네비에 Timeline 탭 추가
- docs/solutions/mdx/2026-04-09-br-tag-compile-error.md — MDX br 태그 컴파일 에러 솔루션 문서

---

## [2026-04-09 R2] — autoceo Round 2

### Added
- 스크롤 프로그레스 바 (위키 엔트리 읽기 진행률, accent 색상)

### Fixed
- tests/manifest.test.ts 타입 에러 수정 (Object.values 타입 단언)
- TODOS.md Light mode 항목 완료 처리

### Metrics
- tsc --noEmit: 0 에러 달성

---

## [2026-04-09 R1] — autoceo Round 1

### Added
- Fine-tuning 기초 엔트리 — LoRA, QLoRA, SFT 핵심 개념
- Frontend + AI 패턴 엔트리 — 스트리밍 UI, 에러 핸들링, 비용 관리

### Changed
- 빈 카테고리 0개 달성 (10/10 카테고리 커버)
- wiki 목록 ALL_CATEGORIES 하드코딩 → schema.ts CATEGORIES로 통일
- Light mode에 accent/semantic 색상 추가

이 프로젝트는 [Keep a Changelog](https://keepachangelog.com/) 형식을 따르고,
[Semantic Versioning](https://semver.org/)을 준수합니다.

## [Unreleased]

## [0.1.0] - 2026-04-09

### Added

- **스프린트 데이 콘텐츠 확장**
  - context-engineering 엔트리 추가
  - harness-engineering 엔트리 추가
  - evaluation 엔트리 추가

- **Coming Soon 플레이스홀더**
  - 미작성 엔트리를 Coming Soon 상태로 표시
  - 그래프 내 빈 카테고리를 회색 노드로 시각화

- **Admin 에디터**
  - 웹 인터페이스에서 위키 엔트리 추가/수정/삭제 기능
  - 프론트엔드에서 직접 콘텐츠 관리 가능

- **/compound 스킬 + Compound Engineering 워크플로우**
  - Compound Engineering 방법론 기반 자동화 스킬
  - 코드 생성 및 검증 파이프라인

### Changed

- **Vibe Coding 회고 강화**
  - Compound Engineering 관점 반영
  - 회고 프레임워크 재정비

- **관련 엔트리 카드 UI 업그레이드**
  - 향상된 카드 디자인 및 상호작용성
  - 더 명확한 엔트리 네비게이션

- **훅 타이밍 최적화**
  - 커밋 전: QA 게이트 추가
  - push 후: Compound Engineering 프로세스 실행
  - 개발 → 검증 → 배포 파이프라인 강화

- **Compound Engineering 가이드 기준으로 재정비**
  - 프로젝트 구조 정렬
  - 코드 표준 일관성 강화

- **SEO, 접근성, DRY 원칙 개선**
  - SEO 메타데이터 최적화
  - WCAG 접근성 표준 준수
  - 중복 코드 리팩토링

### Fixed

- **에러 바운더리 강화**
  - 컴포넌트 레벨 에러 처리
  - 사용자 경험 개선

---

## 지표

**2026-04-09 스프린트**

- 파일 변경: 42개
- 새 파일: ~25개
- 코드 추가/삭제: +2,812 / -183
