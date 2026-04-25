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
 * @returns {{ fixed: string, autoFixed: boolean, errors: Array<{line:number,message:string}>, warnings: Array<{line:number,message:string}> }}
 */
export function fixAndValidateMermaid(code, filename) {
  let fixed = code;
  const errors = [];

  // AUTO-FIX 1: 노드 라벨의 괄호를 따옴표로 감싸기
  // 패턴: A[label (with parens)] → A["label (with parens)"]
  // ⚠️ 이미 따옴표가 있는 라벨은 건너뛰어야 함 (negative lookahead `(?!")`).
  //    안 그러면 매 실행마다 따옴표가 누적: D["x"] → D[""x""] → D["""x"""] ...
  fixed = fixed.replace(
    /([A-Z]\d*)\[(?!")([^\[\]"]*\([^\[\]"]*\)[^\[\]"]*)\]/g,
    '$1["$2"]',
  );

  // AUTO-FIX 2: Mermaid 라벨의 <br/> → " · " 치환 (5번째 재발로 auto-fix 승격)
  // <br/>는 따옴표 안에 있어도 Mermaid 파서가 HTML로 해석 시도 → 런타임 에러.
  // 빌드는 통과하지만 브라우저에서 "Mermaid 에러" 표시. warning-only로는 부족.
  // &lt;br/&gt; (HTML 엔티티)는 의도적 텍스트 설명이므로 제외.
  fixed = fixed.replace(/<br\s*\/?>/g, ' · ');

  // AUTO-FIX 3: subgraph 공백 포함 ID 자동 수정 (8번째 재발 패턴)
  // AI 생성 콘텐츠에서 `subgraph Some Label` 형태가 반복 발생.
  // Mermaid 파서는 공백 포함 ID를 허용하지 않으므로 `subgraph SomeLabel ["Some Label"]`로 변환.
  // 이미 유효한 형식(id만, id ["label"], "name")은 건너뜀.
  fixed = fixed.replace(
    /^(\s*)subgraph\s+(.+)$/gm,
    (match, indent, rest) => {
      const trimmedRest = rest.trim();
      // 이미 유효: id만 (공백 없음)
      if (/^[\w-]+$/.test(trimmedRest)) return match;
      // 이미 유효: id ["label"] 형식
      if (/^\w+\s*\[".+"\]$/.test(trimmedRest)) return match;
      // 이미 유효: "quoted name" 형식
      if (/^".+"$/.test(trimmedRest)) return match;
      // 공백 포함 → camelCase ID + ["original label"]
      const id = trimmedRest
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
      return `${indent}subgraph ${id || 'sub'} ["${trimmedRest}"]`;
    },
  );

  // AUTO-FIX 4: 콜론 포함 라벨에 따옴표 강제 (6번째 재발 패턴)
  // Mermaid 파서가 콜론을 특수 구문으로 해석 → 런타임 에러.
  // A[Phase 1: 분석] → A["Phase 1: 분석"]
  fixed = fixed.replace(
    /([A-Za-z_][\w]*)\[(?!")([^\[\]"]*:[^\[\]"]*)\]/g,
    '$1["$2"]',
  );

  const fixedLines = fixed.split("\n");
  const fixedContent = fixed;

  // WARNING-ONLY 검사: → 등 특수문자 quoted 누락
  // <br/>는 AUTO-FIX 2에서 자동 치환. 여기서는 → 같은 나머지 특수문자만 감지.
  // 솔루션 문서: docs/solutions/mdx/2026-04-16-mermaid-br-in-unquoted-node-labels.md
  const warnings = detectUnquotedSpecialCharLabels(fixedContent);

  // ERROR 검사: subgraph ID와 노드 ID 충돌 감지 (7번째 재발 패턴)
  // Mermaid 파서가 subgraph과 동일 ID의 노드를 만나면 런타임 에러.
  // 빌드 통과하지만 브라우저에서 "Mermaid 에러" — <br/> 패턴과 동일한 함정.
  const subgraphIds = new Set();
  const nodeIds = new Map(); // id -> line number
  fixedLines.forEach((line, i) => {
    const trimmed = line.trim();
    const sgMatch = trimmed.match(/^subgraph\s+(\w+)/);
    if (sgMatch) {
      subgraphIds.add(sgMatch[1]);
      return; // subgraph 라인은 노드 ID 스캔에서 제외
    }
    if (/^end\s*$/.test(trimmed)) return;
    const nodeMatches = trimmed.matchAll(/(?:^|\s|-->|---)([A-Za-z_]\w*)\s*[\[\({]/g);
    for (const m of nodeMatches) {
      if (!nodeIds.has(m[1])) nodeIds.set(m[1], i + 1);
    }
  });
  for (const sgId of subgraphIds) {
    if (nodeIds.has(sgId)) {
      errors.push({
        line: nodeIds.get(sgId),
        message: `subgraph ID "${sgId}"와 노드 ID가 충돌. 노드 ID를 변경하세요 (예: ${sgId}Node, ${sgId}_item)`,
      });
    }
  }

  // 수정된 내용이 원본과 다르면 기록 (warnings + errors 함께 반환)
  if (fixedContent !== code) {
    return { fixed: fixedContent, autoFixed: true, errors, warnings };
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

  return { fixed: fixedContent, autoFixed: false, errors, warnings };
}

/**
 * 노드 라벨에 <br/> · → 같은 특수문자가 quoted 없이 들어간 케이스 탐지.
 *
 * Mermaid 파서는 라벨에 <br/>, →, /, + 등이 있으면 따옴표 필수다.
 * 따옴표 없으면 빌드 통과하지만 *런타임-only* 에러 (브라우저에서 "Mermaid 에러" 메시지).
 *
 * 보수적 정책 — 현재 잡는 패턴:
 *  - <br/> (가장 흔한 재발 패턴, Flow Map 27 노드 사례)
 *  - → (화살표 유니코드)
 *
 * 잡지 않는 패턴 (false positive 위험):
 *  - / (Path/to/file 같은 정상 경로 텍스트가 너무 흔함)
 *  - + (Plus 부호도 흔함)
 *
 * shape 별 처리:
 *  - 일반 노드 [label] : O
 *  - rhombus {label} : O
 *  - cylinder [(label)] : 일반 정규식이 매치 안 함 (별도 솔루션: cylinder 자체 회피)
 *  - circle ((label)) : 매치 안 함
 *
 * @param {string} code
 * @returns {Array<{line:number,message:string}>}
 */
function detectUnquotedSpecialCharLabels(code) {
  const warnings = [];
  const lines = code.split("\n");
  const SPECIAL_CHAR = /(<br\s*\/?>)|→/;

  lines.forEach((line, i) => {
    const lineNum = i + 1;

    // 일반 노드 [label] — 따옴표 없는 케이스만
    const bracketMatches = line.matchAll(
      /[A-Za-z_][\w]*\[(?!")([^\[\]"]+)\]/g,
    );
    for (const m of bracketMatches) {
      if (SPECIAL_CHAR.test(m[1])) {
        warnings.push({
          line: lineNum,
          message: `노드 라벨에 <br/> 또는 → 사용: "${m[1]}". 따옴표 필요: ["${m[1]}"]`,
        });
      }
    }

    // rhombus {label} — 따옴표 없는 케이스만
    const braceMatches = line.matchAll(
      /[A-Za-z_][\w]*\{(?!")([^{}"]+)\}/g,
    );
    for (const m of braceMatches) {
      if (SPECIAL_CHAR.test(m[1])) {
        warnings.push({
          line: lineNum,
          message: `rhombus 라벨에 <br/> 또는 → 사용: "${m[1]}". 따옴표 필요: {"${m[1]}"}`,
        });
      }
    }
  });

  return warnings;
}
