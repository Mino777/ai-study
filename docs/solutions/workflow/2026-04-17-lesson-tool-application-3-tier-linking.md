# 교훈→도구→첫 실행 사례 3단 연결 박제 패턴

**카테고리**: workflow
**날짜**: 2026-04-17
**N**: 1 (observed) — 유사 사례 2건 더 쌓이면 validator/자동화 승격 후보

## 문제

허브 위키(ai-study) 에서 박제한 교훈이 이후 워커 커밋으로 **도구화**되고, 그 도구의 **첫 실행 사례**가 다시 새 Journal 박제 대상이 되는 체인이 발생했을 때, 세 엔트리/커밋이 **서로 연결되지 않고 흩어져** 남으면 다음 에이전트가 체인 전체를 재구성할 수 없다.

## 증상

- Journal 003 (토큰 경제성 교훈) 을 단독으로 읽으면 "이 교훈이 실제 도구가 됐는지" 불명
- `tmux-flush-automation-pattern` (도구 구현) 을 단독으로 읽으면 "왜 존재하는가" 는 알지만 "이 도구 쓰면서 뭘 또 배웠나" 는 미지
- Journal 006 (첫 실행 사례) 을 단독으로 읽으면 "ci-status.sh 가 왜 이 시점에 나왔는가" 배경 손실
- Zettelkasten 원칙(atomicity + deep linking)은 만족하지만 **양방향** 연결이 끊김

## 해결

### Before

세 요소가 각자 존재:

```
Journal 003
  └─ 출처: architect-cli.sh L64~L161, retros 링크

tmux-flush-automation-pattern
  └─ 출처: architect-cli.sh L64~L233

Journal 006
  └─ 출처: HANDOFF + ADR-009 + Gate-2 review
```

### After

양 끝 엔트리의 "출처" 섹션에 **도구화 커밋 + 대각선 링크** 추가:

```
Journal 003 (교훈)
  └─ 출처: ...
     + 도구 박제 커밋: a4f8861 v0.7.1 — send-seq + 429 backoff + ci-status.sh
     + 후속 [Journal 006](/wiki/.../aidy-journal-006-...) 첫 실행 사례

tmux-flush-automation-pattern (도구)
  └─ 출처: ...
     + 자매 도구: aidy-architect/ci-status.sh L1~L156
     + 도구 박제 커밋: a4f8861 v0.7.1
     + [Journal 006](/wiki/.../aidy-journal-006-...) 첫 실행으로 WO-010 자동 발견

Journal 006 (사례)
  └─ 출처: ...
     + 연관 Journal: [003](/wiki/.../aidy-journal-003-...) · [005](...)
     + 연관 도구: [tmux flush 자동화](/wiki/.../tmux-flush-automation-pattern) — v0.7.1 박제됨
```

각 엔트리 **최소 1~2줄 추가** 만으로 체인 양방향 연결 완성.

## 근본 원인

Zettelkasten `connections` 필드는 frontmatter 레벨의 **의미론적** 연결이지만, **시간순 진화 체인** (교훈→도구→사례) 은 별도 개념이다. 이걸 connections 에만 의존하면:

- 그래프 UI 는 edge 로 보임 (OK)
- 하지만 **"이 엔트리를 읽을 때 시간순으로 어디로 가야 하는가"** 는 전달 안 됨
- 사람 + 에이전트가 엔트리 바닥("출처" 섹션)까지 읽을 때 체인 의도를 **명시적 한 줄**로 주지 않으면 재구성 비용 발생

## 체크리스트

새 Journal/엔트리 박제 시:

- [ ] 이 사건의 **원인이 된 교훈 엔트리**가 이미 위키에 있는가? (Journal N-K 등)
- [ ] 그 교훈이 **도구로 박제된 커밋**이 있는가? (`git log --grep="<관련 키워드>"`)
- [ ] 그 도구의 구현 세부를 담은 **별도 엔트리**가 있는가?
- [ ] **3 요소 모두 있으면** 각 엔트리의 "출처" 섹션에 서로를 링크 추가 (최소 1~2줄 edit)
- [ ] 새 엔트리 본문 "출처 / 검증 메모" 에도 원 교훈 + 도구 엔트리 역참조

## 언제 적용하는가

- 허브 위키에 새 Journal 박제 시 **매번** 체크 (체크리스트 문항 4개)
- 기존 엔트리를 수정할 일이 있을 때 (빈번하지 않아야 정상)
- `/ingest` 로 외부 자료 가공 시 **해당 안 됨** (내부 체인이 없으므로)

## 이식 가능성

이 패턴은 ai-study 허브 구조 특유가 아니다. 다른 Zettelkasten 기반 위키에서도:

- **교훈 엔트리** (`concept-X.md`) + **도구/구현 엔트리** (`pattern-X.md`) + **사례 엔트리** (`journal-X.md`) 구조를 쓰면 적용 가능
- frontmatter connections 필드 없이도 본문 "출처" 섹션만으로 체인 완결

## 자동화 후보

N=3 쌓이면:

1. `scripts/validate-content.mjs` 에 체인 감지 validator 추가 — 특정 tags 조합(`harness-journal` + `*-automation-pattern`)에서 출처 섹션에 서로 링크 없으면 warning
2. Git hook — Journal 박제 커밋 시 `docs/retros/` 의 Compound Assets 섹션에 "도구 커밋 링크" 필드 체크

## 최초 적용 사례

- 2026-04-17 세션 6: [Journal 003](../../content/harness-engineering/aidy-journal-003-parallel-dispatch-token-economics.mdx) + [tmux-flush-automation-pattern](../../content/harness-engineering/tmux-flush-automation-pattern.mdx) + [Journal 006](../../content/harness-engineering/aidy-journal-006-ios-ci-self-hosted-runner-migration.mdx) 3단 연결
- 커밋: `50be052 docs: Aidy Journal 006 박제 — WO-010 iOS CI self-hosted runner 전환`

## 관련

- [compound-engineering-philosophy](../../content/harness-engineering/compound-engineering-philosophy.mdx) — Compound Engineering 원칙 (지식 누적)
- [llm-first-wiki-principles](../../content/harness-engineering/llm-first-wiki-principles.mdx) — Zettelkasten + AI Agent Directive
- [memory:feedback_entry_consolidation](../../memory/feedback_entry_consolidation.md) — 중복 코드 금지 + 상위-하위 역할 분리 (상호 보완 규칙)
