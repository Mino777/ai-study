# /ingest — 외부 콘텐츠를 학습 엔트리로 가공

사용자가 URL(유튜브 영상, 블로그 포스트, 논문, 트위터/스레드, 공식 문서 등)을 던지면,
그 콘텐츠를 **교차 검증**을 거쳐 정리하고 `content/<category>/<slug>.mdx` 초안을 만든다.

**반드시** 2026-04-11에 적립된 **외부 소스 수집 규칙** (메모리 `feedback_external_source_verification.md` 참조)을 준수한다.

## 호출 방식

```
/ingest <URL>
/ingest <URL> category=<category-slug>   # 카테고리 수동 지정
/ingest <URL> lean                        # 최소 버전 (교차 검증 여전히 수행)
```

인자 없이 호출되면 사용자에게 URL을 물어본다.

---

## Phase 0: 사전 점검

시작 전 다음을 확인한다:

- [ ] 이 URL이 이미 content/ 디렉터리의 어떤 엔트리에 인용되어 있는가? (중복 방지)
- [ ] URL이 유효한가? (HTTPS, 도메인 식별 가능)
- [ ] 접근 가능한 형식인가? (인증 필요한 private 링크면 중단하고 알림)

## Phase 1: 메타데이터 확보 (최소 2회 교차 검증)

URL의 도메인을 보고 적절한 핸들러를 고른다:

| 도메인 패턴 | 1차 소스 | 2차 교차 검증 |
|---|---|---|
| `youtube.com`, `youtu.be` | oembed API (`https://www.youtube.com/oembed?url=<URL>&format=json`) | **WebSearch**로 영상 제목/채널명 재확인 |
| `velog.io`, `brunch.co.kr`, `*.github.io`, `medium.com` | WebFetch 본문 | 페이지 내 `<meta>` 태그 vs 본문 제목 일치 확인 |
| `arxiv.org`, PDF | WebFetch 요약 | arxiv.org/abs/ 페이지와 PDF 제목 교차 |
| `twitter.com`, `threads.com`, `x.com` | WebFetch | WebSearch로 해당 포스트 정리 글 확인 |
| 기타 일반 URL | WebFetch | 페이지 타이틀 + og:title 교차 |

### 필수 확보 항목

- **제목** (영상/글 원문 그대로)
- **저자/채널명**
- **게시일** (모르면 "알 수 없음"으로 표기)
- **한 줄 요약** (본인 해석 아닌, 원문 기반)

### 🚨 의미 모순 체크 (Critical)

메타데이터가 확보되면 **즉시** 다음을 자문한다:

1. 제목과 목표 카테고리가 의미적으로 일치하는가?
   - 예: 제목에 "프론트엔드"가 들어갔는데 카테고리를 `harness-engineering`으로 두려 한다면 일단 멈춰야 한다.
2. 저자/채널명이 원본 URL과 일치하는가?
   - oembed와 WebSearch 결과가 다르면 사용자에게 확인 요청.
3. 두 소스 사이에 **한 글자라도** 차이가 있는가?
   - 예: "실버개발자" vs "실밸개발자" — 이런 1글자 차이가 가장 위험하다.

**의심 시그널이 하나라도 발견되면 즉시 작업 중단하고 사용자에게 구체적으로 보고한다.**
추측으로 진행하지 않는다. 2026-04-11의 실수가 바로 이 지점에서 발생했다.

## Phase 2: 본문 내용 보강 (최소 2개 독립 소스)

원본이 영상·음성·이미지 등 WebFetch로 본문을 직접 읽기 어려운 경우:

1. **WebSearch**로 해당 주제의 텍스트 정리 포스트를 최소 2개 찾는다
   - 같은 저자의 글 X (독립 소스 원칙 위반)
   - 블로그 / 뉴스레터 / 커뮤니티 글 중 2개 이상
2. 각 소스에서 동일하게 언급되는 개념만 "검증된 사실"로 간주
3. 한 소스에만 나오는 주장은 **직접 인용하지 않고** 서술로 풀어 쓰거나 생략

원본이 텍스트(블로그/문서/논문)인 경우:

1. WebFetch로 본문 전체 확보
2. 주요 주장(특히 수치·고유명사·인용구)에 대해 1개 이상 독립 소스로 교차

### 인용구 규칙 (엄격)

- `"..."` 로 직접 인용구 박을 문장은 **원본에서 직접 확인한 것만** 사용
- 영상의 경우 트랜스크립트가 없어서 확신 못 하면 인용 대신 **"영상에서 ~라는 취지의 말을 함"**으로 풀어 쓴다
- 인용구를 엔트리의 첫 훅으로 쓸 거면 **특히 더 엄격하게** 검증

## Phase 3: 카테고리 매핑

10개 카테고리 중 하나를 고른다 (`schema.ts`의 CATEGORIES):

- `prompt-engineering`, `context-engineering`, `harness-engineering`
- `rag`, `agents`, `fine-tuning`, `evaluation`
- `infrastructure`, `ios-ai`, `frontend-ai`

**매핑 규칙**:
1. 사용자가 `category=...` 로 지정했으면 그대로 사용
2. 아니면 키워드 매칭으로 상위 3개 추천
3. Phase 1의 의미 모순 체크를 여기서 한 번 더 수행
4. 애매하면 사용자에게 확인 요청

## Phase 4: 초안 작성

`content/<category>/<slug>.mdx` 파일을 아래 템플릿으로 생성.

### Slug 규칙

- 영문 소문자 + 하이픈
- 원문 제목의 핵심 키워드 2~4개
- 기존 파일과 충돌하면 뒤에 `-2` 붙이거나 더 구체화

### Frontmatter 템플릿

```yaml
---
title: "<한국어로 정리한 제목 — 부제>"
category: <카테고리>
date: "<오늘 날짜 YYYY-MM-DD>"
tags: [<핵심 키워드 5~7개>]
confidence: 2        # 배웠지만 아직 체화 전 — 수동 입력 시 조정
connections: [<관련 기존 엔트리 슬러그 2~4개>]
status: complete     # draft 아님 — 바로 퍼블리시 가능 품질로 작성
description: "<한 줄 설명 — 원문 주제 + 내 해석 관점>"
type: entry
quiz:
  - question: "..."
    choices: [..., ..., ..., ...]
    answer: <0~3>
    explanation: "..."
  - question: "..."
    ...
  - question: "..."
    ...
---
```

### 본문 구조 (고정 섹션 순서)

```markdown
## 왜 지금 이 주제인가

[원본을 본 맥락 + 내 프로젝트와의 연관성 1~2문단]

## 핵심 개념

[교차 검증으로 확인된 주요 개념. 직접 인용구는 엄선해서 사용.]

## 구조 / 프레임워크 / 다이어그램

[Mermaid 다이어그램 최소 1개 — subgraph 이름에 공백 있으면 `id ["Label"]` 형식 필수.
표도 적극 활용.]

## 실전 팁 / 안티패턴

[원본에서 언급된 실전 팁을 실제로 내 프로젝트에 적용 가능한 형태로 번역]

## 내 프로젝트에 적용하기

[구체적 후속 작업 리스트. 불릿 3~5개. 가능하면 위키 내부 링크 포함.]

## 자기 점검

1. ~
2. ~
3. ~
4. ~
5. (열린 질문) ~

### 실습 과제

~

## 출처

- 원본: [제목](URL)
- 보강 자료:
  - [보강 1](URL)
  - [보강 2](URL)
```

### 본문 작성 원칙

- **1인칭 시점** 유지 ("나는 ~" / "내 프로젝트의 ~")
- **내 해석** 섹션 필수 — 단순 번역본이 되지 않도록
- **내부 링크** 적극 사용 — 기존 위키 엔트리로 `/wiki/<category>/<slug>` 형식
- **MDX 문법 준수** — `<br />` / `<hr />` self-closing, Mermaid subgraph 공백 이름 금지
- **quiz 3문항** — 단순 암기 X, 이해도 측정. 해설 필수.

## Phase 5: 검증

1. `npm run build` 실행 → MDX/Mermaid validation + manifest 생성
2. 실패 시 에러 메시지 읽고 수정 후 재시도 (최대 3회)
3. `content-manifest.json`에 새 엔트리가 정상 등록됐는지 확인
4. 새 엔트리의 `connections`가 실제 존재하는 slug를 가리키는지 확인 (dangling 방지)

## Phase 5b: 크로스 업데이트 (역링크 자동화)

새 엔트리가 `connections`로 기존 엔트리를 참조하면, **기존 엔트리도 새 엔트리를 역참조**해야 한다 (Zettelkasten bidirectional 원칙).

### 실행 절차

1. 새 엔트리의 frontmatter `connections` 배열을 읽는다
2. 각 연결된 엔트리 파일(`content/<slug>.mdx`)을 열어 frontmatter를 파싱한다
3. 해당 엔트리의 `connections`에 새 엔트리 slug가 **이미 있으면 skip**, 없으면 추가한다
4. 추가할 때 기존 connections 배열의 **마지막에** append (알파벳 정렬 X — 의미 순서 보존)
5. 변경된 파일 목록을 기록한다

### 예시

새 엔트리: `rag/semantic-chunking.mdx` (connections: `[rag/vector-db-selection, agents/tool-use]`)

→ `content/rag/vector-db-selection.mdx`의 connections에 `rag/semantic-chunking` 추가
→ `content/agents/tool-use.mdx`의 connections에 `rag/semantic-chunking` 추가

### 주의사항

- 기존 엔트리에 이미 역링크가 있으면 **중복 추가 금지**
- connections 배열이 비어있던 엔트리도 정상 업데이트 (`connections: []` → `connections: [rag/semantic-chunking]`)
- 기존 엔트리의 다른 frontmatter 필드는 **절대 건드리지 않는다**
- 존재하지 않는 slug(dangling)는 Phase 5에서 이미 걸러졌으므로 여기서는 존재하는 파일만 처리
- 크로스 업데이트한 파일 수를 Phase 7 보고에 포함한다

## Phase 6: 커밋 제안

커밋 메시지 초안:

```
학습: <엔트리 제목의 짧은 버전>

<저자/채널>의 <매체> "<원본 제목>"을 정리해
<카테고리> 카테고리에 엔트리 추가.

- 핵심 개념 3~5줄 요약
- 원본 + 보강 자료 <N>개 교차 검증
- 자가 점검 퀴즈 3문항 + 실습 과제
```

**커밋만 하고 push는 사용자 명시 승인 대기.** (메모리 `feedback_commit_deploy.md` 준수)

## Phase 7: 보고

작업 완료 시 사용자에게 아래를 명확히 보고:

- 생성된 파일 경로
- 카테고리 선택 근거
- 교차 검증에 사용한 소스 리스트 (도구 포함: "oembed로 받음", "WebSearch로 교차")
- 내가 **확인하지 못한** 부분 (트랜스크립트 없는 영상이면 "본문 내용은 블로그 정리 2개에서 교차 확인")
- 크로스 업데이트: 역링크 추가된 기존 엔트리 목록 (예: "3개 엔트리에 역링크 추가")
- 애매한 부분이 있으면 사용자 확인 요청

---

## 금지 사항

다음 행위는 **절대** 하지 않는다:

1. 단일 소스의 메타데이터만 믿고 본문에 제목·저자 인용 ❌
2. 원본에서 직접 확인 못한 문장을 `"..."` 직접 인용으로 박기 ❌
3. 제목-카테고리 의미 모순을 감지하고도 추측으로 진행 ❌
4. "본문이 맞으면 제목 정도는 괜찮다"는 합리화 ❌
5. 도구 선택을 사용자에게 숨기거나 "OCR" 같이 사용하지 않은 도구로 오해 유도 ❌
6. 사용자 승인 없이 `git push` ❌

---

## 성공 조건

이 커맨드는 다음을 달성해야 한다:

- 외부 URL → `npm run build` 통과하는 MDX 엔트리까지 자동화
- 2026-04-11의 "제목·채널명 오기" 같은 실수가 **구조적으로 불가능**해야 함
- 내 해석과 프로젝트 적용이 빠지지 않은 "단순 번역본 아닌" 글
- 출처 투명성 — 사용자가 어떻게 검증됐는지 확인 가능
