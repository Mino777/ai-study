// resolver-eval.mjs 회귀 테스트
// ──────────────────────────────────────────────────────────────────────
// 합성 CLAUDE.md + cases JSON으로 엔드투엔드 검증.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../resolver-eval.mjs", import.meta.url));

function run(projectDir, casesPath = null) {
  const args = [SCRIPT, "--project", projectDir, "--json"];
  if (casesPath) args.push("--cases", casesPath);
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

function buildProject(base, { routing, cases }) {
  const projectDir = mkdtempSync(join(base, "proj-"));
  const claude = [
    "# Test",
    "",
    "## Skill routing",
    "",
    ...routing.map((r) => `- ${r.desc} → invoke ${r.skill}`),
    "",
  ].join("\n");
  writeFileSync(join(projectDir, "CLAUDE.md"), claude);
  mkdirSync(join(projectDir, "data"), { recursive: true });
  writeFileSync(
    join(projectDir, "data", "resolver-eval-cases.json"),
    JSON.stringify({ cases }),
  );
  return projectDir;
}

let base;
beforeAll(() => {
  base = mkdtempSync(join(tmpdir(), "resolver-eval-test-"));
});
afterAll(() => {
  rmSync(base, { recursive: true, force: true });
});

describe("resolver-eval", () => {
  it("명확한 키워드 매치 — accuracy 100%", () => {
    const dir = buildProject(base, {
      routing: [
        { desc: "코드 리뷰, PR 검증", skill: "review" },
        { desc: "배포 진행, ship", skill: "ship" },
      ],
      cases: [
        { intent: "리뷰 코드", expectedSkill: "review" },
        { intent: "배포 진행", expectedSkill: "ship" },
      ],
    });
    const { code, report } = run(dir);
    expect(code).toBe(0);
    expect(report.accuracy).toBe(100);
    expect(report.passed).toBe(2);
  });

  it("키워드 없는 intent — 실패 플래그", () => {
    const dir = buildProject(base, {
      routing: [{ desc: "코드 리뷰", skill: "review" }],
      cases: [{ intent: "전혀 상관없는 문장입니다", expectedSkill: "review" }],
    });
    const { code, report } = run(dir);
    expect(code).toBe(1);
    expect(report.passed).toBe(0);
    expect(report.results[0].pass).toBe(false);
  });

  it("null expectedSkill — 과잉 라우팅 방지 체크", () => {
    const dir = buildProject(base, {
      routing: [{ desc: "독립된 키워드로만 매칭", skill: "specialized" }],
      cases: [
        // 완전히 무관한 intent — 어떤 skill도 강하게 매치돼선 안 됨
        { intent: "오늘 날씨 어때", expectedSkill: null },
      ],
    });
    const { code, report } = run(dir);
    expect(code).toBe(0);
    expect(report.passed).toBe(1);
  });

  it("runnerUp 필드 출력", () => {
    const dir = buildProject(base, {
      routing: [
        { desc: "코드 리뷰 PR 검증", skill: "review" },
        { desc: "코드 배포 PR 생성", skill: "ship" },
      ],
      cases: [{ intent: "코드 리뷰", expectedSkill: "review" }],
    });
    const { code, report } = run(dir);
    expect(code).toBe(0);
    expect(report.results[0].runnerUp).toMatch(/ship/);
  });

  it("섹션 없으면 exit 2", () => {
    const dir = mkdtempSync(join(base, "proj-"));
    writeFileSync(join(dir, "CLAUDE.md"), "# no routing section\n");
    mkdirSync(join(dir, "data"), { recursive: true });
    writeFileSync(join(dir, "data", "resolver-eval-cases.json"), JSON.stringify({ cases: [] }));
    const { code } = run(dir);
    expect(code).toBe(2);
  });
});
