# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-23 (Session 20 — Skillify 인프라 8 repo 동시 롤아웃)
- **작성 주체**: Claude (Session 20)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 163 (+7 from 156)
- **카테고리**: 13 (변동 없음)
- **Git 상태**: main clean (compound 커밋 후)
- **Solutions 현황**: workflow **12**건 (+2), mdx 8, ai-pipeline 5, github-actions 5, next-patterns 3, performance 1
- **새 npm script**: `npm run check:skills` (Skillify Step 8 정합 감사)
- **테스트 커버리지**: 47 케이스 (vitest), +6 신규

### Skillify 인프라 상태 (전 9 repo)
- **정합 완료**: ai-study · mino-moneyflow · mino-tarosaju · aidy-architect · aidy-server · aidy-ios · aidy-android (7 GitHub)
- **로컬 완료, push 대기**: 사설 iOS repo (Bitbucket 인증)
- **check-skills-reachable 전원 exit 0**: unreachable=0 orphan=0

### moneyflow / tarosaju / aidy Harness
- **Git 상태**: 각 main clean, 로컬 working tree 정리됨
- **resolver 정합**: CLAUDE.md `## Skill routing` 전원 존재
- **다음 기회**: Skillify Step 5 (LLM eval) + Step 7 (resolver routing eval) 착수

### Hermes-First 스택 상태
- **판정**: 현재 불필요 (2026-04-19)
- **재검토 트리거**: 동시 에이전트 5개+ / 24/7 무인 운영 / 기억 손실 3회+

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. **사설 iOS repo push 해결** — Bitbucket 인증 갱신 후 로컬 worktree에서 `git push origin chore/claude-setup` (경로는 로컬에서 확인). 이 한 줄로 Skillify 전 9 repo 동기화 완료
   - 예상 크기: XS

2. **Skillify Step 5 — LLM Eval 씨드 도구** — `scripts/extract-failure-moments.mjs`
   - `~/.claude/projects/*/` 세션 transcript grep ("fucking", "wtf", "짜증", "아 이게 왜")
   - 실패 순간 추출 → resolver eval 케이스 씨드
   - Garry Tan 휴리스틱 직접 차용
   - 예상 크기: M

3. **Skillify Step 7 — Resolver Routing Eval** — intent golden set 20~30개
   - `benchmark-models.mjs` 인프라 재활용
   - weekly GitHub Action으로 Claude 라우팅 정확도 측정
   - 통과율 하락 시 이슈 생성
   - 예상 크기: M

### 🟡 Medium

4. **콘텐츠 생성 재개** — 엔트리 163 → target 170
   - `npm run generate-lesson` 주제 추천
   - 특히 harness-engineering 심화 (Skillify 후속)
   - 예상 크기: M

5. **github-actions 솔루션 N=5 promote 검토** — 이미 workflow 패턴으로 성공 이식한 패턴. `.claude/commands/` 자동 생성 후 리뷰
   - 예상 크기: S

6. **ccusage 베이스라인 자동 수집** — dispatch 토큰 절감 KPI 미측정 방치를 끝낼 도구
   - 스프린트 전후 자동 측정 + diff 리포트
   - 예상 크기: S

### 🟢 Low

7. **Skillify entry Step-by-Step 워크스루** — 실습 과제 "check-skills-reachable.mjs MVP" 완료했으므로 엔트리 끝에 "제작 노트" 섹션 추가 (실제 구현 경험 → 엔트리 신뢰도 강화)
8. **JIT 검색 성과 검증** (#69) — totalQueries 100 도달 시

---

## ⚠️ 블로커 / 대기 사항

- **사설 iOS repo Bitbucket 인증** — 세션 종료 시 Keychain 갱신 후 push 1줄
- **aidy-architect local 정합** — 이번 세션에 정리됨 (29a7669 → 99674b3 cherry-pick PR #15)
- 이전 세션 "moneyflow conductor worktree la-paz" — 여전히 존재할 수 있음 (확인 필요)

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 엔트리 수 | 163 | 170 | higher | ? |
| Skillify Step 5 구현 | 미착수 | 착수 | achieve | ? |
| Skillify Step 7 intent 케이스 | 0 | 20 | higher | ? |
| ccusage 베이스라인 | 미구축 | 구축 | achieve | ? |

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기
- [ ] `SPEC.md` 읽기
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택

### Phase 3: Git 동기화 + 정합 확인 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `/projects-sync` 실행 (aidy 4 포함, 메시지 큐 확인)
- [ ] `npm run check:skills` (이 세션부터 관례 — 전 repo dark skill 방지)

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs` (github-actions N=5 후보 확인)

### Phase 5: 작업 시작 (2분 내)
- [ ] High 큐 1번부터 (사설 iOS repo push) 10초 안에 처리 후 나머지
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📜 최근 갱신

### 2026-04-23 (Session 20 — Skillify 8 repo 동시 롤아웃)
- **완료**: /ingest Skillify (Garry Tan X 포스트) → harness-engineering 엔트리 박제
- **완료**: scripts/check-skills-reachable.mjs MVP + vitest 6 케이스
- **완료**: 7 워커(+사설 iOS repo 로컬) CLAUDE.md Skill routing 백필 — 전원 unreachable=0 orphan=0
- **완료**: aidy-architect 로컬 29a7669 복구 (cherry-pick → PR #15)
- **완료**: mermaid auto-fix 2 MDX 박제 (#78)
- **완료**: workflow solutions +2 (multi-repo-resolver-rollout, write-tool-hook-bash-bypass)
- **완료**: 메모리 +1 (feedback_worktree_merge_back)
- **다음**: 사설 iOS repo push + Skillify Step 5/7 도구 구축 (resolver LLM eval)
