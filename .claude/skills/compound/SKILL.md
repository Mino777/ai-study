---
name: compound
description: |
  스프린트/작업 완료 후 복리화 단계. CHANGELOG 업데이트 + 스프린트 회고 + 문제 해결 문서화.
  QA 후 자동으로 실행되어 지식을 축적한다. "코드가 아니라 코드를 만드는 시스템을 쌓는다."
  Use when: 작업 완료 후, QA 후, 버그 수정 후, 기능 구현 후.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

# /compound — 복리화 워크플로우

매 작업 사이클의 마지막 단계. Plan → Work → Review → **Compound**.
해결한 문제, 배운 것, 변경 사항을 문서화하여 미래의 나(와 AI)를 더 빠르게 만든다.

> "Each unit of engineering work should make subsequent units easier, not harder."

## 실행 조건

이 스킬은 다음 상황에서 실행된다:
- `/qa` 또는 `/qa-only` 완료 후 (훅으로 자동 트리거)
- 기능 구현 완료 후 수동 호출
- 버그 수정 후 수동 호출
- 사용자가 `/compound` 입력 시

## Phase 1: 변경 사항 수집

### 1.1 Git diff 분석

```bash
# 마지막 compound 이후 변경 사항 (또는 최근 커밋들)
LAST_COMPOUND=$(git log --oneline --all --grep="compound:" --format="%H" -1 2>/dev/null)
if [ -n "$LAST_COMPOUND" ]; then
  echo "SINCE: $LAST_COMPOUND"
  git log --oneline "$LAST_COMPOUND"..HEAD
  git diff --stat "$LAST_COMPOUND"..HEAD
else
  echo "NO_PRIOR_COMPOUND"
  git log --oneline -10
  git diff --stat HEAD~10..HEAD 2>/dev/null || git diff --stat
fi
```

### 1.2 컨텍스트 수집

1. **변경된 파일** 목록과 각 파일의 변경 요약
2. **새로 추가된 파일** (기능, 컴포넌트, 라우트 등)
3. **수정된 기존 파일** (버그 수정, 개선 등)
4. **해결된 문제** — 대화 히스토리에서 디버깅/수정 내역 추출
5. **TODOS.md** 변경 사항 확인

## Phase 2: 산출물 생성 (3개 병렬)

3개 서브에이전트를 병렬로 실행한다:

### 2.1 CHANGELOG 업데이트

Agent: CHANGELOG 업데이터

1. `CHANGELOG.md` 읽기 (없으면 생성)
2. Git diff에서 변경 사항 분류:
   - **추가(Added)**: 새 기능, 새 컴포넌트, 새 페이지
   - **변경(Changed)**: 기존 기능 개선, UI 변경
   - **수정(Fixed)**: 버그 수정
   - **기타(Chore)**: 문서, 설정, 의존성 변경
3. 오늘 날짜 섹션에 항목 추가 (한국어, 간결하게)
4. 형식: [Keep a Changelog](https://keepachangelog.com/) 준수

### 2.2 스프린트 회고

Agent: 스프린트 회고 작성자

1. `docs/retrospectives/` 디렉토리에 `YYYY-MM-DD.md` 파일 생성
2. 대화 히스토리와 git diff를 분석하여 작성:

```markdown
---
date: YYYY-MM-DD
scope: [이번 작업의 범위 한 줄 요약]
---

# 스프린트 회고 — YYYY-MM-DD

## 완료한 작업
- [구체적 항목들]

## 잘된 점
- [복리 효과가 발생한 부분, 재사용한 패턴 등]

## 개선할 점
- [다음에 다르게 할 것]

## 복리 자산 (다음 작업을 빠르게 만드는 것)
- [새로 만든 패턴, 컴포넌트, 유틸리티 등]
- [CLAUDE.md에 추가할 규칙이나 패턴]

## 수치
- 파일 변경: N개
- 새 파일: N개
- 커밋: N개
```

### 2.3 문제 해결 문서화

Agent: 솔루션 문서화

대화 히스토리에서 **디버깅/문제 해결** 내역이 있으면 문서화한다.
(없으면 이 단계는 스킵)

1. `docs/solutions/` 하위에 카테고리별 파일 생성:
   - `build-errors/` — 빌드 에러
   - `runtime-errors/` — 런타임 에러
   - `integration-issues/` — 외부 서비스 연동 문제
   - `best-practices/` — 패턴, 모범 사례
   - `workflow-issues/` — CI/CD, 배포 문제

2. 문서 형식:

```markdown
---
title: [문제 제목]
date: YYYY-MM-DD
category: [카테고리]
tags: [관련 기술, 키워드]
---

# [문제 제목]

## 증상
[에러 메시지, 관찰된 동작]

## 원인
[근본 원인]

## 해결
[수정 내용 + 코드 예시]

## 예방
[재발 방지 방법]
```

## Phase 3: CLAUDE.md 업데이트 체크

변경 사항 중 CLAUDE.md에 반영해야 할 것이 있는지 확인:

1. 새 컴포넌트 추가됨 → Components 섹션 업데이트
2. 새 API 라우트 추가됨 → API Routes 섹션 업데이트
3. 새 패턴/규칙 발견됨 → 해당 섹션에 추가
4. 프로젝트 구조 변경됨 → Project Structure 업데이트

변경이 필요하면 사용자에게 확인 후 적용.

## Phase 4: 커밋

모든 산출물을 하나의 커밋으로:

```bash
git add CHANGELOG.md docs/retrospectives/ docs/solutions/ CLAUDE.md
git commit -m "compound: [날짜] 스프린트 회고 + 변경 기록

- CHANGELOG 업데이트
- 스프린트 회고 작성
- [문제 해결 문서 N개 작성 (있으면)]
- CLAUDE.md 동기화 (변경 있으면)"
```

## 출력 형식

```
✓ Compound 완료

CHANGELOG:
  - Added: N항목
  - Changed: N항목
  - Fixed: N항목

회고: docs/retrospectives/YYYY-MM-DD.md
솔루션: [작성된 문서 목록 또는 "이번 세션에서 문제 해결 없음"]
CLAUDE.md: [업데이트됨 / 변경 없음]

복리 자산:
  - [이번 작업에서 미래를 위해 축적된 것들]
```

## Auto-trigger 문구

다음 문구가 감지되면 자동 제안:
- "다 됐다", "완료", "끝", "배포했다", "push 했다"
- "QA 통과", "테스트 통과"
- "커밋하자", "정리하자"
