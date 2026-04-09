# /autoceo — 풀 자동 스프린트 루프 (안전 모드)

CEO 리뷰 → 개발 → QA → Compound를 자동으로 반복합니다.
**유저에게 묻지 않고 추천 옵션으로 자동 진행합니다.**

## 파라미터

`$ARGUMENTS`에서 모드와 반복 횟수를 파싱합니다.

- `/autoceo` → 기본 2회
- `/autoceo 3` → 3회
- `/autoceo dry` → 드라이런 (계획만 출력, 실행 안 함)
- `/autoceo dry 3` → 3라운드 계획만 출력
- 최대 5회, 5 초과 시 5로 제한

---

## 🛡️ 안전장치

### 1. Git 체크포인트 + 자동 롤백
라운드 시작 전: `git tag autoceo-round-N-before`
QA 3회 실패 시: `git reset --hard autoceo-round-N-before`

### 2. 보호 파일 — 절대 수정 금지
- `.env*` — 환경변수
- `package.json` dependencies 버전 변경 금지
- `.claude/settings.json` — 훅 설정
- `.github/workflows/*` — CI/CD 워크플로우

### 3. 원자적 커밋
- 커밋당 10파일 이하 목표. 초과 시 논리적 단위로 분할.
- 큰 리팩토링: types 추출 → 컴포넌트 분리 → import 정리 순서로 쪼갠다.
- 롤백 시 cherry-pick 가능하도록.

### 4. 3중 QA 게이트
1. `npm run build` — prebuild manifest + next build
2. `npx tsc --noEmit` — 타입 체크
3. 빌드 출력에서 에러 없음 확인
실패 → 수정 3회 시도 → 3회 실패 시 라운드 롤백.

### 5. 금지 행동
- git push, git reset --hard (롤백 제외), rm -rf
- 새 패키지 설치, 외부 API 키 변경

---

## 매 라운드 실행

### Step 1: 분석 + 계획
AskUserQuestion 사용 금지. 자동 판단.
P0 깨진 빌드 → P1 TODO → P2 기술부채 → P3 신규 기능.
드라이런: 여기서 멈춤.

분석 소스:
- TODOS.md의 미완료 항목
- CLAUDE.md의 로드맵
- content/ 빈 카테고리 현황
- git log 최근 변경사항
- 기존 docs/solutions/ 미해결 이슈

### Step 2: 개발
병렬 에이전트 활용. 보호 파일 감지 시 스킵.
작업 단위 커밋: `[RN] type: 설명`

### Step 3: QA (3중 게이트)
3개 통과 → Step 4. 3회 실패 → 롤백.

### Step 4: Compound
CHANGELOG + 솔루션 + CLAUDE.md 동기화.
(/compound 커맨드의 Phase 1-5를 인라인 실행)

---

## 규칙
- 유저에게 절대 묻지 않는다.
- 판단 어려우면 보수적으로.
- git push는 하지 않는다.
- 프로젝트의 CLAUDE.md 규칙을 따른다.
- DESIGN.md를 준수한다.
