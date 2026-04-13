/**
 * Mermaid 다이어그램 자동 수정 + 검증 로직.
 *
 * CLI 엔트리인 scripts/validate-content.mjs에서 import한다.
 * 테스트 가능하도록 별도 모듈로 분리됨 (scripts/__tests__/mermaid-fix.test.mjs).
 *
 * ⚠️ 이 모듈을 수정할 때는 반드시 회귀 테스트를 먼저 돌려야 함:
 *     npx vitest run scripts/__tests__/
 *
 * 과거에 두 가지 버그가 있었음:
 *
 * 1) 슬라이싱 오프셋 어긋남 — 호출 측에서 `content`(frontmatter 제거본) 기준으로
 *    mermaid 블록 위치를 찾아 `raw`(frontmatter 포함)에 적용했던 버그. 이제 호출 측은
 *    반드시 `raw` 기준으로 indexOf 해야 함.
 *
 * 2) 정규식 누적 매치 — `[A-Z]\d*\[([^\[\]]*\(...)\]` 가 이미 따옴표가 붙은 라벨에도
 *    매치해서 매 실행마다 따옴표가 중첩되던 버그. negative lookahead `(?!")` +
 *    라벨 문자 클래스에서 `"` 제외로 수정됨.
 */

/**
 * Mermaid 코드 블록을 받아 자동 수정 + 유효성 검증.
 *
 * @param {string} code - mermaid 코드 블록 본문 (``` 제외)
 * @param {string} [filename] - (로깅용, 현재 미사용)
 * @returns {{ fixed: string, autoFixed: boolean, errors: Array<{line:number,message:string}> }}
 */
export function fixAndValidateMermaid(code, filename) {
  let fixed = code;
  const errors = [];

  // AUTO-FIX: 노드 라벨의 괄호를 따옴표로 감싸기
  // 패턴: A[label (with parens)] → A["label (with parens)"]
  // ⚠️ 이미 따옴표가 있는 라벨은 건너뛰어야 함 (negative lookahead `(?!")`).
  //    안 그러면 매 실행마다 따옴표가 누적: D["x"] → D[""x""] → D["""x"""] ...
  fixed = fixed.replace(
    /([A-Z]\d*)\[(?!")([^\[\]"]*\([^\[\]"]*\)[^\[\]"]*)\]/g,
    '$1["$2"]',
  );

  const fixedLines = fixed.split("\n");
  const fixedContent = fixed;

  // 수정된 내용이 원본과 다르면 기록
  if (fixedContent !== code) {
    return { fixed: fixedContent, autoFixed: true, errors: [] };
  }

  // 수정 후 유효성 검증 (남은 에러만)
  fixedLines.forEach((line, i) => {
    const trimmed = line.trim();
    const lineNum = i + 1;

    // 1. subgraph 검증
    const subgraphMatch = trimmed.match(/^subgraph\s+(.+)$/);
    if (subgraphMatch) {
      const rest = subgraphMatch[1];
      const bracketLabelForm = /^\w+\s*\[".+"\]\s*$/;
      const quotedForm = /^".+"\s*$/;
      const idOnlyForm = /^[\w-]+\s*$/;
      if (
        !bracketLabelForm.test(rest) &&
        !quotedForm.test(rest) &&
        !idOnlyForm.test(rest)
      ) {
        if (/[()\[\]{}:;&]/.test(rest) || /\s/.test(rest)) {
          errors.push({
            line: lineNum,
            message: `subgraph 형식 오류: "${rest}". 유효 형식: "subgraph id", 'subgraph id ["label"]', 'subgraph "name"'`,
          });
        }
      }
    }

    // 2. 노드 라벨 검증 (자동 수정 후 남은 문제)
    const nodeBracketMatches = trimmed.matchAll(/\[([^\]]+)\]/g);
    for (const m of nodeBracketMatches) {
      const label = m[1];
      if (/[()]/.test(label) && !label.startsWith('"') && !label.endsWith('"')) {
        errors.push({
          line: lineNum,
          message: `노드 라벨에 괄호 사용: "${label}". 수정: ["${label}"]`,
        });
      }
    }

    // 3. 화살표 라벨 검증
    const arrowLabelMatch = trimmed.match(/\|([^|]+)\|/);
    if (arrowLabelMatch && /[()]/.test(arrowLabelMatch[1])) {
      errors.push({
        line: lineNum,
        message: `화살표 라벨에 괄호: "${arrowLabelMatch[1]}". 괄호 제거하거나 따옴표 사용`,
      });
    }
  });

  return { fixed: fixedContent, autoFixed: false, errors };
}
