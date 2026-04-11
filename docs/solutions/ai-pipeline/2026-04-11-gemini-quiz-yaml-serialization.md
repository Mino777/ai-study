---
title: "AI 생성 quiz를 YAML frontmatter에 안전하게 직렬화하기"
date: 2026-04-11
category: ai-pipeline
tags: [gemini, yaml, frontmatter, quiz, js-yaml, generate-lesson]
---

# AI 생성 quiz를 YAML frontmatter에 안전하게 직렬화하기

## 증상

AI 과외 선생님 파이프라인이 Gemini로 quiz 3문항을 생성한 뒤 이를 MDX 파일의 YAML frontmatter에 주입해야 한다. 초기에는 손으로 YAML 이스케이프 함수를 작성(`yamlEscape`)했는데, 테스트 시 아래 케이스에서 gray-matter(js-yaml) 파싱이 깨졌다:

```
YAMLException: bad indentation of a sequence entry at line 16, column 28
  - question: "Quote test "hi""
                           ^
```

## 원인

YAML double-quoted 스칼라는 C 스타일 이스케이프(`\"`, `\\`, `\n`)를 쓰지만, **직접 문자열 치환으로 구현하면 다음을 모두 정확히 처리해야 한다**:

1. 역슬래시 먼저 이스케이프 (`\` → `\\`)
2. 그 다음 따옴표 이스케이프 (`"` → `\"`)
3. 개행 문자 처리 (`\n` → literal `\n`)
4. 중간 테스트에서 셸 이스케이프와 JS 템플릿 리터럴 이스케이프가 겹쳐 검증 자체가 혼란스러움

게다가 Gemini가 반환하는 한국어 텍스트에는 따옴표·특수문자·줄바꿈이 자연스럽게 섞여 있어 엣지 케이스가 많다.

## 해결

### Before — 손으로 YAML 이스케이프

```javascript
function yamlEscape(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function quizQuestionToYaml(q) {
  return [
    `  - question: "${yamlEscape(q.question)}"`,
    `    choices:`,
    ...q.choices.map((c) => `      - "${yamlEscape(c)}"`),
    `    answer: ${q.answer}`,
    q.explanation ? `    explanation: "${yamlEscape(q.explanation)}"` : null,
  ].filter(Boolean).join("\n") + "\n";
}
```

→ 실제로 확장 테스트에서 파서 에러 발생.

### After — `js-yaml`로 덤프 후 들여쓰기만 조정

```javascript
import yaml from "js-yaml";

function quizArrayToYaml(quiz) {
  // js-yaml은 top-level sequence를 내뱉으므로,
  // 모든 라인을 2칸 들여써서 "quiz:" 키 아래로 네스팅
  const dumped = yaml.dump(quiz, {
    lineWidth: -1,       // 자동 줄바꿈 금지 (긴 설명 한 줄 유지)
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  return dumped
    .split("\n")
    .map((line) => (line.length > 0 ? "  " + line : line))
    .join("\n");
}
```

사용부:

```javascript
const quiz = await generateQuiz(model, refinedTitle, content);
if (quiz.length > 0) {
  quizYaml = "\nquiz:\n" + quizArrayToYaml(quiz);
}
// frontmatter 문자열 조립 시 `type: entry${quizYaml}` 로 삽입
```

## 검증

로컬에서 엣지 케이스 3개를 roundtrip 테스트:

```javascript
const quiz = [
  { question: "What is 1+1?", choices: ["1","2","3","4"], answer: 1, explanation: "Two." },
  { question: `Quote test "hi" + 줄바꿈\nhere`, choices: ["a","b"], answer: 0, explanation: '한글 "escape".' },
  { question: "Backslash \\ test", choices: ["x","y"], answer: 0 },
];
const fm = "---\n...\nquiz:\n" + quizArrayToYaml(quiz) + "---\n\nbody\n";
const parsed = matter(fm);  // ✅ 모두 파싱 성공, 값 복구됨
```

`js-yaml`은 자동으로 따옴표가 필요 없는 토큰(`"1"` vs `1`)을 구분하고, 줄바꿈이 포함된 문자열은 block scalar(`|-`)로 내보내는 등 복잡한 케이스를 알아서 처리한다.

## 근본 원인

> "프로그래밍 언어의 문자열 이스케이프를 손으로 짜면 반드시 실패한다."

특히 YAML·JSON·셸은 컨텍스트마다 이스케이프 규칙이 다르고, 한국어·유니코드·이모지가 섞이면 경계 조건이 폭발한다. 라이브러리가 이미 있을 때는 라이브러리를 쓰자.

- gray-matter 자체가 js-yaml에 의존하므로 `node_modules/js-yaml`은 **항상 설치되어 있음** (top-level dep로 승격됨).
- 직접 `import yaml from "js-yaml"` 하면 추가 의존성 없이 바로 사용 가능.

## 체크리스트

AI가 생성한 구조화 데이터를 파일에 기록할 때:

- [ ] 기존 라이브러리(`js-yaml`, `JSON.stringify`)로 직렬화되는가?
- [ ] Roundtrip 테스트 (dump → parse → dump)로 정합성 확인
- [ ] `lineWidth: -1`로 자동 줄바꿈 차단 (긴 한국어 문장이 중간에 끊기는 문제 방지)
- [ ] `forceQuotes: false`로 과도한 따옴표 회피 (가독성)
- [ ] Gemini 응답이 JSON일 때는 `JSON.parse` 후 zod/수동 검증 → 라이브러리로 직렬화
- [ ] 로컬에서 엣지 케이스 직접 만들어 테스트 (따옴표, 줄바꿈, 백슬래시, 한국어)

## 관련 파일

- `scripts/generate-lesson.mjs` — `generateQuiz()` + `quizArrayToYaml()`
- `src/lib/schema.ts` — `quizQuestionSchema` (zod)
- `src/components/quiz.tsx` — 소비측 (파싱된 quiz 렌더링)
