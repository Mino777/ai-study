# /curate-inbound — 워커 프로젝트 inbound PR 분류 + 하네스 박제 파이프라인

워커 프로젝트(moneyflow / tarosaju / 외부)가 ai-study에 `patterns:` prefix로 PR을 쏘면, 이 커맨드가 그 raw 콘텐츠를 **분류 + 커레이트 + 재포맷**해서 ai-study wiki의 적절한 위치에 박제한다.

[Journal 014의 tips/ 흐름](/wiki/harness-engineering/harness-journal-014-hub-auto-merge-inbound-tips)을 *하네스 박제 수준까지 확장*한 파이프라인.

---

## 입력

사용자가 다음 중 하나 명시:
- PR 번호 (예: `/curate-inbound #42`)
- 브랜치 이름 (예: `/curate-inbound patterns/promise-timeout-wrapper`)
- 자유 설명 (예: *"moneyflow의 Promise 타임아웃 래퍼 패턴을 하네스로 올려줘"*)

입력 없으면 첫 질문: *"어떤 inbound PR/브랜치/패턴을 커레이트할까요?"*

---

## 브랜치 컨벤션 (워커 측)

| Prefix | 용도 | 처리 |
|---|---|---|
| `tips/` | 소형 환경 QoL 팁 (30줄 이하, 1 사이클 미만) | `ai-review.yml`이 자동 PR + Test Gate + Squash Merge. 허브는 사후 검토만 |
| **`patterns/`** | **하네스 박제 후보** (Journal / solution / pattern entry 수준) | **`ai-review.yml`이 자동 PR 생성 + `patterns` 라벨 부착. 자동 머지 X. 이 커맨드가 처리** |

**구분 기준**: *"3 프로젝트 중 2개 이상에 이식할 가치가 있는가?"* → YES면 `patterns/`, NO면 `tips/`.

---

## Phase 1: 원본 수집

```bash
# PR 번호인 경우
rtk gh pr view <num> --json title,body,labels,files,baseRefName,headRefName,author,url -R Mino777/ai-study
rtk gh pr diff <num> -R Mino777/ai-study

# 브랜치 이름인 경우
rtk gh pr list --head <branch> -R Mino777/ai-study --json number
# 그 다음 view/diff
```

**수집할 데이터**:
- 원본 PR title, body (작성자의 의도)
- 파일 목록 + diff (실제 변경)
- 작성자 (워커 프로젝트 식별)
- 관련 commit 히스토리 (`gh pr view --json commits`)

**금지**: PR title/body를 *근거*로 쓰지 말 것. raw 재료일 뿐. 실제 diff를 line-by-line 봐야 정확한 분류 가능. (Journal 019 §1 "메타데이터 거짓말" 원칙)

---

## Phase 2: 분류 (6 카테고리)

### 분류 결정 트리

```
원본 검토
  ↓
회사 프로젝트 내부 코드 / 특정 파일 / 사용자 UX?
  → reject (이유 comment 후 PR 닫기)
  ↓
30줄 이하 + 환경 QoL + 1 사이클 미만?
  → tips (dev-setup-tips-log append)
  ↓
구체적 문제→해결 + 재발 가능 + 20~100줄?
  → solution (docs/solutions/<cat>/YYYY-MM-DD-<slug>.md)
  ↓
1 사이클 서사 + 철학적 교훈 + 200~500줄 + 메타-패턴?
  → journal (새 harness-journal-NNN.mdx, user review)
  ↓
재사용 가능한 추상 패턴 (cost tracking, Zod validation 같은)?
  → pattern-entry (새 <category>/<slug>.mdx, user review)
  ↓
분류 자신 없음?
  → needs-review (허브 세션 사용자에게 결정 요청)
```

### 6 카테고리 상세

| 카테고리 | 크기 | 대상 | 자동 머지 |
|---|---|---|---|
| **reject** | — | PR 닫기 + 이유 comment | — |
| **tips** | ≤ 30줄 | `dev-setup-tips-log.mdx` append | ⭕ |
| **solution** | 20~100줄 | `docs/solutions/<cat>/YYYY-MM-DD-<slug>.md` | ⭕ |
| **journal** | 200~500줄 | 새 `harness-journal-NNN.mdx` | ❌ (user review) |
| **pattern-entry** | 100~400줄 | 새 `content/<category>/<slug>.mdx` | ❌ (user review) |
| **needs-review** | — | 허브 세션 사용자에게 결정 요청 | — |

---

## Phase 3: Curation

### 필수 변환 (카테고리 무관)

1. **회사 프로젝트명 익명화** — `gma-ios` / `GreenCar` / `LOTTIMS` 등. `.claude/hooks/no-company-names.sh`가 이중 차단하지만 우선 grep으로 선제 치환:
   ```
   gma-ios → moneyflow-ios
   GreenCar → MoneyFlow
   LOTTIMS-SPM → external-spm
   ```
2. **프로젝트 특정 파일 경로 추상화** — `src/lib/trading/market-analyst.ts` → `src/lib/<domain>/<agent>.ts`
3. **사용자 식별자 제거** — 실제 사용자명/이메일 제거
4. **외부 의존성 구체화** — `@supabase/supabase-js` 같은 실제 패키지는 유지, 프로젝트 내부 util은 추상화

### 카테고리별 처리

#### tips (→ dev-setup-tips-log append)

```markdown
## YYYY-MM-DD — <한 줄 증상>

**환경**: <OS / 에디터 / 툴 버전>
**증상**: <관찰 가능한 현상>
**근본 원인**: <진단>
**수정**: <복붙 가능한 명령/설정>
**검증**: <확인 방법>
**Related**: <연관 엔트리 링크>
```

dev-setup-tips-log.mdx의 `# 로그` 섹션 *하단*에 append. **기존 섹션 절대 수정 금지**.

#### solution (→ docs/solutions/)

```markdown
# <문제 제목>

**카테고리**: <ai-pipeline | workflow | mdx | github-actions | ...>
**날짜**: YYYY-MM-DD
**프로젝트**: 익명 (또는 moneyflow / tarosaju / ai-study)
**관련 파일**: <추상화된 경로>

## 문제
[언제, 어떤 조건에서 발생]

## 근본 원인
[왜 발생했는지]

## 해결 (before/after)
[코드 포함]

## 체크리스트
- [ ] ...

## 일반화 (해당 시)
[이 패턴이 어떤 상황에 재사용 가능한지]

## 관련
- [링크]
```

#### journal (→ harness-journal-NNN.mdx)

1. 다음 번호 결정: `ls content/harness-engineering/harness-journal-*.mdx | sort | tail -1` + 1
2. Frontmatter 생성 (schema.ts 준수):
   ```yaml
   ---
   title: "Harness Journal NNN — <한 줄 제목>"
   category: harness-engineering
   series: harness-journal
   date: "YYYY-MM-DD"
   tags: [harness-journal, ...]
   confidence: 4 or 5
   connections:
     - harness-engineering/<related-1>
     - harness-engineering/<related-2>
   status: complete
   description: "..."
   type: entry
   quiz:  # 선택, 3문항 권장
     - question: "..."
       choices: [...]
       answer: N
       explanation: "..."
   ---
   ```
3. 본문 구조: 한 줄 요약 → 문제 → 진단 → 해결 → 패턴 일반화 → 다음 큐 → 핵심 메시지

#### pattern-entry (→ content/<category>/<slug>.mdx)

적절한 카테고리 선택 (ai-output-zod-validation-pattern 같은 추상 패턴이면 `harness-engineering`, AI 호출 레이어면 `agents` 또는 `harness-engineering`).

### Connections 자동 링크

기존 관련 엔트리를 grep으로 찾아 connections에 추가:

```bash
# 키워드 추출 후 관련 엔트리 검색
rtk grep -l "<keyword>" content/ | head -5
```

예: Promise 타임아웃 패턴이라면:
- `harness-engineering/ai-call-patterns-circuit-breaker-fallback` (AI client wrapper)
- `harness-engineering/ai-output-zod-validation-pattern` (5 Layer)
- `harness-engineering/fixture-silent-failure-trap` (silent failure)

---

## Phase 4: 출력 + 검증

### 새 커밋 + PR

```bash
# 새 브랜치 생성 (원본 브랜치 기반이 아니라 main에서 분기)
git checkout main
git pull origin main
git checkout -b curate/<slug>

# 변경 작성 (Write/Edit 툴로 생성)
# ...

# 빌드 + 테스트 검증
rtk npm run build   # zod frontmatter + manifest 검증
rtk npm test         # vitest 회귀 테스트

# 둘 다 통과하면 commit
rtk git add <files>
rtk git commit -m "curate: <category> — <요약> (from #<원본-PR>)"
rtk git push -u origin curate/<slug>

# PR 생성
rtk gh pr create --title "curate: <category> — <요약>" --body "<curation-metadata>"
```

### PR description 템플릿

```markdown
# Curation Result

**원본 PR**: #<num> (<원본 title>)
**카테고리**: <tips | solution | journal | pattern-entry>
**파일**: <생성/수정된 경로>

## 분류 근거
- [...]

## 적용된 변환
- [ ] 회사 프로젝트명 익명화
- [ ] 프로젝트 특정 파일 경로 추상화
- [ ] Frontmatter 생성 (zod 통과)
- [ ] Connections 자동 링크 (N개)
- [ ] 빌드 통과
- [ ] 테스트 통과

## 허브 세션 리뷰 체크리스트
- [ ] 카테고리 분류가 적절한가?
- [ ] 익명화가 완전한가? (gma/GreenCar/LOTTIMS grep 0건)
- [ ] Frontmatter schema 준수?
- [ ] 기존 엔트리와의 관계가 명확한가?
- [ ] tips/solution이면 자동 머지, journal/pattern-entry면 user review

## 원본 PR 처리
- [ ] reject → 원본 PR 닫기
- [ ] 수락 → 원본 PR 닫기 (curate: PR로 대체됨 comment)
```

### 원본 PR 처리

```bash
# 원본 PR에 comment + close
rtk gh pr comment <원본-num> --body "✅ 이 PR은 /curate-inbound로 처리되어 #<new-num>로 박제됐습니다. 원본 PR은 닫습니다. 감사합니다!"
rtk gh pr close <원본-num>
```

---

## Phase 5: 사용자 결정 + 머지

| 카테고리 | 머지 방식 |
|---|---|
| tips / solution | ✅ 자동 머지 OK (`ai-review.yml`이 처리) |
| journal / pattern-entry | ❌ 사용자 리뷰 필수. `needs-review` 라벨 부착 |
| reject | 원본 PR 닫기만. 새 PR 생성 없음 |
| needs-review | 사용자에게 *"이 패턴을 [A/B/C 중 어느 카테고리]로 박제할까요?"* 질문 |

---

## 안티패턴

- ❌ **원본 PR title/body를 *근거*로 인용** — raw 재료일 뿐. diff line-by-line 봐야 함 (Journal 019 원칙)
- ❌ **회사 프로젝트명 grep 생략** — 훅이 차단하지만 선제 치환 필수. `gma|GreenCar|LOTTIMS` 전부 0건 확인
- ❌ **분류를 너무 크게 잡기** — 애매하면 `needs-review` 또는 한 단계 작은 카테고리로 (journal → pattern-entry, pattern-entry → solution)
- ❌ **connections를 비워두기** — grep으로 최소 2개 이상 관련 엔트리 링크
- ❌ **Frontmatter 없이 push** — zod 통과 안 하면 prebuild에서 실패 → CI fail
- ❌ **원본 PR 처리 누락** — 커레이트 완료 후 원본 PR 닫기 잊지 않기

---

## 트리거 예시

사용자: *"moneyflow에서 Promise 타임아웃 래퍼 패턴을 하네스로 올려줘"*
→ `/curate-inbound moneyflow Promise 타임아웃 래퍼`
→ 분류: journal 후보 (자가 fix 사이클 서사, 200줄+)
→ `content/harness-engineering/harness-journal-020-promise-timeout-wrapper.mdx` 생성

사용자: *"#42 PR 커레이트해줘"*
→ `/curate-inbound #42`
→ PR 내용 분석 → 분류 → 커레이트 → 새 PR

사용자: *"patterns/foo 브랜치 봐줘"*
→ `/curate-inbound patterns/foo`
→ 브랜치 기반 PR 찾기 → 처리

---

## 참고

- [Harness Journal 014 — 허브에 자동 머지 이식 + 워커 → 허브 꿀팁 PR 흐름](/wiki/harness-engineering/harness-journal-014-hub-auto-merge-inbound-tips) — `tips/` 흐름의 출처
- [Harness Journal 019 — 맥앱 Claude 세션 부산물 크로스 검증](/wiki/harness-engineering/harness-journal-019-mcapp-cross-session-cleanup) — 메타데이터 신뢰 금지 원칙
- `dev-setup-tips-log.mdx` — `tips/` 카탈로그
- `docs/solutions/` — 재발 가능 문제 해결 박제
- `.claude/hooks/no-company-names.sh` — 회사명 익명화 자동 차단
- `/cross-session-review` — 다른 세션 결과물 검증 (분류 전 단계로도 사용)
