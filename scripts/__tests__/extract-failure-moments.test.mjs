// extract-failure-moments.mjs 회귀 테스트
// ──────────────────────────────────────────────────────────────────────
// 합성 JSONL 세션 transcript fixture로 패턴 매칭 + 필터 검증.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../extract-failure-moments.mjs", import.meta.url));

function run(projectsRoot, extraArgs = []) {
  const args = [SCRIPT, "--projects-root", projectsRoot, "--json", ...extraArgs];
  try {
    const out = execFileSync("node", args, { encoding: "utf8" });
    return { code: 0, report: JSON.parse(out) };
  } catch (err) {
    return {
      code: err.status,
      report: err.stdout ? JSON.parse(err.stdout) : null,
      stderr: err.stderr,
    };
  }
}

function buildSession(projectsRoot, projectSlug, sessionId, turns) {
  const projectDir = join(projectsRoot, projectSlug);
  mkdirSync(projectDir, { recursive: true });
  const jsonl = turns
    .map((t) =>
      JSON.stringify({
        type: t.role,
        timestamp: t.timestamp || "2026-04-20T10:00:00.000Z",
        message: { content: t.text },
      }),
    )
    .join("\n");
  writeFileSync(join(projectDir, `${sessionId}.jsonl`), jsonl);
}

let root;
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "efm-test-"));
});
afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("extract-failure-moments", () => {
  it("한국어 frustration 매치 (짜증/안돼)", () => {
    buildSession(root, "-proj1", "sess1", [
      { role: "assistant", text: "스크립트 수정했습니다." },
      { role: "user", text: "아니 이게 왜 안돼" },
    ]);
    const { code, report } = run(root, ["--limit", "5"]);
    expect(code).toBe(0);
    expect(report.top.length).toBeGreaterThan(0);
    expect(report.top[0].tag).toMatch(/KR:/);
  });

  it("영문 curse 매치", () => {
    buildSession(root, "-proj-en", "sess1", [
      { role: "assistant", text: "Should work now." },
      { role: "user", text: "wtf this is still broken" },
    ]);
    const { code, report } = run(root, ["--limit", "5", "--project", "-proj-en"]);
    expect(code).toBe(0);
    const tags = report.top.map((m) => m.tag);
    expect(tags.some((t) => t.startsWith("EN:"))).toBe(true);
  });

  it("tool_use_error 메시지는 필터링", () => {
    buildSession(root, "-proj-sys", "sess1", [
      { role: "assistant", text: "A" },
      { role: "user", text: "<tool_use_error>fucking shit broken</tool_use_error>" },
    ]);
    const { code, report } = run(root, ["--project", "-proj-sys"]);
    expect(code).toBe(0);
    expect(report.top.length).toBe(0);
  });

  it("max-length 초과 메시지는 필터링 (긴 PR 템플릿)", () => {
    const longText = "fucking shit ".padEnd(600, "x");
    buildSession(root, "-proj-long", "sess1", [
      { role: "assistant", text: "A" },
      { role: "user", text: longText },
    ]);
    const { code, report } = run(root, ["--project", "-proj-long", "--max-length", "500"]);
    expect(code).toBe(0);
    expect(report.top.length).toBe(0);
  });

  it("since 날짜 필터", () => {
    buildSession(root, "-proj-date", "sess1", [
      { role: "user", text: "짜증 안 돼", timestamp: "2026-01-01T10:00:00.000Z" },
    ]);
    buildSession(root, "-proj-date", "sess2", [
      { role: "user", text: "또 짜증 안 돼", timestamp: "2026-04-20T10:00:00.000Z" },
    ]);
    const { code, report } = run(root, [
      "--project",
      "-proj-date",
      "--since",
      "2026-04-01",
    ]);
    expect(code).toBe(0);
    expect(report.top.length).toBe(1);
    expect(report.top[0].timestamp).toMatch(/2026-04/);
  });

  it("중복 발화 중복 제거", () => {
    buildSession(root, "-proj-dup", "sess1", [
      { role: "user", text: "짜증 이게 왜 안돼" },
      { role: "user", text: "짜증 이게 왜 안돼" },
    ]);
    const { code, report } = run(root, ["--project", "-proj-dup"]);
    expect(code).toBe(0);
    expect(report.top.length).toBe(1);
  });
});
