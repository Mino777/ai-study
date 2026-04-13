/**
 * 회귀 테스트: scripts/lib/mermaid-fix.mjs 의 fixAndValidateMermaid + slicing 로직.
 *
 * 과거 두 가지 버그를 박제:
 *   Bug 1 — 슬라이싱 오프셋 어긋남 (content vs raw 기준 혼용 → 파일 손상)
 *   Bug 2 — 정규식 누적 매치 (이미 quoted 된 라벨에 따옴표 중첩)
 *
 * 둘 다 수정됨. 이 테스트는 회귀를 막기 위함.
 *
 * 접근 방식: **함수 직접 import** (white-box). validate-content.mjs 의
 * 슬라이싱 동작도 함수가 반환한 fixed 블록을 raw 기준으로 substring 치환한
 * 것과 동일하게 재현해서 검증한다.
 */

import { describe, it, expect } from "vitest";
import { fixAndValidateMermaid } from "../lib/mermaid-fix.mjs";

/**
 * validate-content.mjs 의 main() 안에 있는 raw 슬라이싱 로직을 격리해서
 * 재현. raw 기준으로 블록을 찾아 치환한다.
 *
 * @param {string} raw - MDX 파일 전체 (frontmatter 포함)
 * @returns {{ raw: string, autoFixedCount: number }}
 */
function applyMermaidFixesToRaw(raw) {
  // frontmatter 제거된 content 는 블록 내용 추출용도로만 사용하고, 치환은 raw 기준.
  const fence = /```mermaid\n([\s\S]*?)```/g;
  let autoFixedCount = 0;

  // 여러 블록을 순차적으로 처리하되, 각 블록을 raw.indexOf 로 다시 찾음
  // (치환 후 offset이 바뀔 수 있으므로).
  const blocks = [];
  let m;
  // 원본 raw 기반으로 우선 모든 블록의 code만 수집
  const snapshot = raw;
  while ((m = fence.exec(snapshot)) !== null) {
    blocks.push(m[1]);
  }

  for (const code of blocks) {
    const { fixed, autoFixed } = fixAndValidateMermaid(code, "test.mdx");
    if (!autoFixed) continue;

    const oldBlockStart = raw.indexOf("```mermaid\n" + code);
    if (oldBlockStart === -1) continue;
    const oldBlockEnd =
      oldBlockStart + ("```mermaid\n" + code + "```").length;
    raw =
      raw.substring(0, oldBlockStart) +
      "```mermaid\n" +
      fixed +
      "```" +
      raw.substring(oldBlockEnd);
    autoFixedCount++;
  }

  return { raw, autoFixedCount };
}

const FRONTMATTER = `---
title: Test Entry
category: harness-engineering
slug: test-entry
date: 2026-04-13
confidence: 3
tags: [test]
summary: 회귀 테스트용 더미 엔트리
---

`;

describe("fixAndValidateMermaid — 정규식 단위 동작", () => {
  it("Case 2: 이미 quoted 라벨은 idempotent — 5회 실행해도 변화 없음", () => {
    const code = `graph LR\n  D --> E["already (quoted)"]\n`;
    let current = code;
    for (let i = 0; i < 5; i++) {
      const { fixed, autoFixed } = fixAndValidateMermaid(current, "x");
      expect(autoFixed).toBe(false);
      expect(fixed).toBe(code);
      current = fixed;
    }
    // 따옴표는 정확히 1쌍만 유지
    expect(current.match(/"/g)?.length).toBe(2);
  });

  it("Case 3: 괄호 없는 정상 라벨은 변경 없음", () => {
    const code = `graph LR\n  A[Sender] --> B[Receiver]\n`;
    const { fixed, autoFixed } = fixAndValidateMermaid(code, "x");
    expect(autoFixed).toBe(false);
    expect(fixed).toBe(code);
  });

  it("Case 1 (unit): 괄호 포함 라벨은 따옴표로 감싸짐", () => {
    const code = `graph LR\n  A --> B[label (with parens)]\n`;
    const { fixed, autoFixed } = fixAndValidateMermaid(code, "x");
    expect(autoFixed).toBe(true);
    expect(fixed).toContain('B["label (with parens)"]');
    // 한 번 더 실행하면 변화 없음 (idempotent)
    const second = fixAndValidateMermaid(fixed, "x");
    expect(second.autoFixed).toBe(false);
    expect(second.fixed).toBe(fixed);
  });
});

describe("applyMermaidFixesToRaw — 슬라이싱 회귀 (Bug 1)", () => {
  it("Case 1: frontmatter 가 있어도 mermaid 블록 뒤 Section B 본문이 손상되지 않음", () => {
    const body =
      "## Section A\n\n" +
      "```mermaid\n" +
      "graph LR\n" +
      "  A --> B[label (with parens)]\n" +
      "```\n\n" +
      "## Section B\n\n" +
      "Body content here.\n";
    const raw = FRONTMATTER + body;
    const originalLineCount = raw.split("\n").length;

    const { raw: fixedRaw, autoFixedCount } = applyMermaidFixesToRaw(raw);

    expect(autoFixedCount).toBe(1);
    // 1) mermaid 라벨이 올바르게 quoted
    expect(fixedRaw).toContain('B["label (with parens)"]');
    // 2) Section B 본문이 그대로 존재
    expect(fixedRaw).toContain("## Section B");
    expect(fixedRaw).toContain("Body content here.");
    // 3) frontmatter 가 손상되지 않음
    expect(fixedRaw.startsWith(FRONTMATTER)).toBe(true);
    // 4) 라인 수 동일 (같은 줄만 치환)
    expect(fixedRaw.split("\n").length).toBe(originalLineCount);
    // 5) idempotent — 한 번 더 적용해도 변화 없음
    const second = applyMermaidFixesToRaw(fixedRaw);
    expect(second.autoFixedCount).toBe(0);
    expect(second.raw).toBe(fixedRaw);
  });

  it("Case 4: 동일 파일에 mermaid 블록이 2개일 때, 필요한 블록만 수정되고 다른 블록/구조 보존", () => {
    const body =
      "## Diagram A\n\n" +
      "```mermaid\n" +
      "graph LR\n" +
      "  A --> B[needs (fix)]\n" +
      "```\n\n" +
      "중간 텍스트.\n\n" +
      "## Diagram B\n\n" +
      "```mermaid\n" +
      "graph TD\n" +
      "  X[Plain] --> Y[Another]\n" +
      "```\n\n" +
      "끝 섹션.\n";
    const raw = FRONTMATTER + body;

    const { raw: fixedRaw, autoFixedCount } = applyMermaidFixesToRaw(raw);

    expect(autoFixedCount).toBe(1);
    // 첫 번째 블록만 수정
    expect(fixedRaw).toContain('B["needs (fix)"]');
    // 두 번째 블록은 그대로
    expect(fixedRaw).toContain("X[Plain] --> Y[Another]");
    // 구조 보존
    expect(fixedRaw).toContain("## Diagram A");
    expect(fixedRaw).toContain("## Diagram B");
    expect(fixedRaw).toContain("중간 텍스트.");
    expect(fixedRaw).toContain("끝 섹션.");
    expect(fixedRaw.startsWith(FRONTMATTER)).toBe(true);
  });
});

describe("이미 손상된 파일 (Case 5 — 이전 세션의 자국)", () => {
  it("5쌍 누적된 따옴표 라벨은 정규식이 매치하지 않음 (추가 손상 X)", () => {
    // negative lookahead `(?!")` + 라벨에서 `"` 제외 덕분에 이미 `"` 로 시작하는
    // 라벨은 건드리지 않음. 손상 잔재를 *정규화* 하진 않지만, 최소한
    // *추가로 손상시키지는 않는다*는 것이 이 테스트의 핵심.
    const damaged = `graph LR\n  D --> E["""""label (parens)"""""]\n`;
    const { fixed, autoFixed } = fixAndValidateMermaid(damaged, "x");
    expect(autoFixed).toBe(false);
    expect(fixed).toBe(damaged);

    // 5회 반복해도 절대 추가 따옴표가 쌓이지 않음
    let current = damaged;
    for (let i = 0; i < 5; i++) {
      current = fixAndValidateMermaid(current, "x").fixed;
    }
    expect(current).toBe(damaged);
  });
});
