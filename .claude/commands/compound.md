# /compound — 복리형 지식 축적

매 스프린트/배포 후 실행. 이번 작업을 문서화하여 다음 작업이 더 쉬워지게 한다.

## Phase 0: 컨텍스트 압축 (토큰 절감)

**compound 시작 전 반드시 `/compact` 실행.** 작업 중 누적된 컨텍스트를 압축하여 compound 실행 자체의 토큰 소비를 줄인다. 압축 지시문:

```
/compact Keep decision log, key changes, and file paths. Discard exploration and intermediate outputs.
```

이 Phase를 건너뛰지 않는다. compound는 긴 워크플로이므로 압축 없이 실행하면 토큰 낭비가 크다.

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
**Frozen Snapshot 원칙**: 세션 중간이 아닌 이 Phase에서만 CLAUDE.md를 수정한다.

## Phase 3b: Anti-Rationalization Guard

**구조적 바이어스 인지**: 작업한 에이전트가 회고를 쓰면 자기 평가가 관대해진다 (Hermes 공식 인정).
16건 회고 분석에서 발견된 3가지 바이어스 패턴을 역으로 점검한다.

### 바이어스 패턴 1: "특이사항 없음"
- 정말 판단 실수가 0건이었나? "찾지 않은 것"과 "없는 것"은 다르다.
- **최소 1건** 아쉬운 점을 써라. 못 찾겠으면 "왜 못 찾는지"를 써라.

### 바이어스 패턴 2: 외부 귀인 리프레이밍
아쉬운 점을 쓸 때 아래 표현이 나오면 **내 판단 실수로 리프레이밍**:

| 외부 귀인 (금지) | 자기 귀인 (권장) |
|---|---|
| "시간 제약으로 미착수" | "우선순위 판단을 잘못해서 시간 부족" |
| "예상보다 범위가 커서" | "범위 추정을 실패" |
| "사용자 제보로 뒤늦게 감지" | "내가 확인 안 함" |
| "세션이 길어짐" | "끊을 타이밍 판단 실패" |

### 바이어스 패턴 3: 자기 점검 4항목
- "이 정도면 충분하다"고 판단했지만, 실제로는 어려운 부분을 건너뛴 것 아닌가?
- 에러/경고를 무시하고 넘어간 곳이 있는가?
- 테스트 없이 "동작할 것"이라고 추정한 코드가 있는가?
- 사용자 피드백 없이 자체 판단으로 스코프를 줄인 곳이 있는가?

### 2차 방어선
이 세션의 주요 커밋이 2건 이상이면 `/cross-session-review` 실행을 유저에게 제안.
자기 검증의 한계를 다른 세션의 독립 검증으로 보완.

## Phase 4: 프로세스 개선 (aidy-architect 이식)

스프린트에서 발생한 **인시던트, 병목, 비효율**을 재료로 프로세스를 개선한다.
유저가 시키지 않아도 compound 시 자동으로 수행.

### 수집할 재료
1. **인시던트**: 빌드 실패, validate 에러, 배포 롤백, 데이터 손실 등
2. **병목**: 빌드 시간, 테스트 루프, rate limit, 컨텍스트 압축 등
3. **비효율**: 수동으로 한 작업 중 자동화 가능한 것
4. **에이전트/스킬 갭**: 있었으면 좋았을 스킬이나 커맨드

### 개선 액션 (해당 시에만)
- 슬래시 커맨드 추가/수정 → `.claude/commands/`에 커밋
- `validate-content.mjs` 규칙 보강 → 커밋
- `docs/solutions/` 에 프로토콜/가이드 작성
- CLAUDE.md 규칙 보강 → 커밋
- 피드백 메모리 저장 (다음 세션에서 반복 방지)

### 보고 형식 (retro에 포함)
```markdown
## 프로세스 개선 (이번 스프린트)
| 재료 | 개선 | 파일 |
|------|------|------|
| JSX false positive 25건 | 정규식 정밀도 조정 | validate-content.mjs |
| 세션 중 CLAUDE.md 수정 | Frozen Snapshot 원칙 추가 | CLAUDE.md |
```

## Phase 4b: 경험→스킬 자동 생성 (Hermes 이식)

`docs/solutions/` 카테고리별 누적 건수를 체크한다.

```bash
for d in docs/solutions/*/; do
  count=$(find "$d" -name "*.md" | wc -l)
  echo "$count $(basename $d)"
done | sort -rn
```

**N≥3인 카테고리 발견 시**:
1. 해당 카테고리의 솔루션들을 읽고 공통 패턴을 추출
2. `.claude/commands/{category}-check.md` 스킬 초안을 생성 (또는 기존 스킬 보강)
3. 스킬 초안에는 반드시 포함:
   - 트리거 조건 (언제 이 스킬을 호출하는가)
   - 체크리스트 (솔루션들에서 추출한 검증 항목)
   - 안티패턴 (솔루션들의 "근본 원인"에서 추출)
4. CLAUDE.md skill routing에 1줄 추가
5. **사람 리뷰 필수** — 자동 생성 스킬을 커밋 전 유저에게 확인

**N<3이면 스킵** — 아직 패턴이 충분하지 않음.

## Phase 5: 메모리 업데이트
핵심 교훈을 Claude Code 메모리에 저장.

## Phase 6: NEXT.md 교체
현재 상태 스냅샷 + 다음 작업 큐 + 체크리스트를 갱신.
완료된 큐 항목 즉시 제거. append 금지, 교체.

## Phase 7: 단일 커밋
compound: [날짜] 스프린트 문서화

---

## 안티패턴 (aidy-architect 이식)

- ❌ "특이사항 없음"으로 회고 스킵 — 항상 최소 "다음에 적용할 것" 1개
- ❌ 솔루션을 회고에 섞기 — 솔루션은 독립 파일 (검색 가능해야)
- ❌ 사람용 서술 — LLM-First로 써라. For AI Agents 관점
- ❌ Phase 4 생략 — 인시던트/병목이 없었더라도 비효율/갭은 있다
