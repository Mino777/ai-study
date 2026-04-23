// check-skills-reachable.mjs 회귀 테스트
// ──────────────────────────────────────────────────────────────────────
// 합성 fixture 디렉토리를 mkdtemp로 만들고 스크립트를 자식 프로세스로 실행.
// 다음 케이스를 검증:
//  1) 정합: unreachable 0, orphan 0, exit 0
//  2) unreachable: 로컬 파일 있으나 routing에 없음 → exit 1
//  3) orphan: routing에 있으나 파일 없음 → exit 1
//  4) missing section: CLAUDE.md에 Skill routing 섹션 자체 없음 → exit 2
//  5) 글로벌 skill로 orphan 해소 (gstack 시나리오)

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../check-skills-reachable.mjs", import.meta.url));

function runScript(projectDir, globalCommands = "/dev/null", globalSkills = "/dev/null") {
  try {
    const out = execFileSync(
      "node",
      [
        SCRIPT,
        "--project",
        projectDir,
        "--global-commands",
        globalCommands,
        "--global-skills",
        globalSkills,
        "--json",
      ],
      { encoding: "utf8" },
    );
    return { code: 0, report: JSON.parse(out) };
  } catch (err) {
    return {
      code: err.status,
      report: err.stdout ? JSON.parse(err.stdout) : null,
      stderr: err.stderr,
    };
  }
}

function buildProject(base, { commands = [], routing = null }) {
  const projectDir = mkdtempSync(join(base, "proj-"));
  if (commands.length > 0) {
    const cmdDir = join(projectDir, ".claude", "commands");
    mkdirSync(cmdDir, { recursive: true });
    for (const slug of commands) {
      writeFileSync(join(cmdDir, `${slug}.md`), `# /${slug}\n\nstub\n`);
    }
  }
  if (routing !== null) {
    const lines = [
      "# Test Project",
      "",
      "## Skill routing",
      "",
      ...routing.map((s) => `- intent for ${s} → invoke ${s}`),
      "",
    ];
    writeFileSync(join(projectDir, "CLAUDE.md"), lines.join("\n"));
  } else {
    writeFileSync(join(projectDir, "CLAUDE.md"), "# Test Project\n\n(no skill routing section)\n");
  }
  return projectDir;
}

let base;
beforeAll(() => {
  base = mkdtempSync(join(tmpdir(), "check-skills-test-"));
});
afterAll(() => {
  rmSync(base, { recursive: true, force: true });
});

describe("check-skills-reachable", () => {
  it("정합 — unreachable 0, orphan 0이면 exit 0", () => {
    const dir = buildProject(base, {
      commands: ["compound", "wt-branch"],
      routing: ["compound", "wt-branch"],
    });
    const { code, report } = runScript(dir);
    expect(code).toBe(0);
    expect(report.hasSection).toBe(true);
    expect(report.unreachable).toEqual([]);
    expect(report.orphan).toEqual([]);
  });

  it("unreachable 감지 — 로컬 파일 있으나 routing에 없음", () => {
    const dir = buildProject(base, {
      commands: ["compound", "dark-skill"],
      routing: ["compound"],
    });
    const { code, report } = runScript(dir);
    expect(code).toBe(1);
    expect(report.unreachable).toContain("dark-skill");
    expect(report.orphan).toEqual([]);
  });

  it("orphan 감지 — routing에 있으나 파일 없음", () => {
    const dir = buildProject(base, {
      commands: ["compound"],
      routing: ["compound", "ghost-skill"],
    });
    const { code, report } = runScript(dir);
    expect(code).toBe(1);
    expect(report.orphan).toContain("ghost-skill");
    expect(report.unreachable).toEqual([]);
  });

  it("섹션 자체가 없으면 exit 2", () => {
    const dir = buildProject(base, { commands: ["compound"], routing: null });
    const { code, report } = runScript(dir);
    expect(code).toBe(2);
    expect(report.hasSection).toBe(false);
  });

  it("글로벌 skill 디렉토리가 orphan 해소 (gstack 시나리오)", () => {
    const globalSkillsDir = mkdtempSync(join(base, "global-skills-"));
    const gstackDir = join(globalSkillsDir, "office-hours");
    mkdirSync(gstackDir, { recursive: true });
    writeFileSync(join(gstackDir, "SKILL.md"), "# office-hours\n");

    const dir = buildProject(base, {
      commands: ["compound"],
      routing: ["compound", "office-hours"],
    });

    const { code, report } = runScript(dir, "/dev/null", globalSkillsDir);
    expect(code).toBe(0);
    expect(report.orphan).toEqual([]);
    expect(report.counts.global).toBe(1);
  });

  it("글로벌 commands/*.md도 orphan 해소", () => {
    const globalCmdDir = mkdtempSync(join(base, "global-cmd-"));
    writeFileSync(join(globalCmdDir, "user-skill.md"), "# /user-skill\n");

    const dir = buildProject(base, {
      commands: ["compound"],
      routing: ["compound", "user-skill"],
    });

    const { code, report } = runScript(dir, globalCmdDir);
    expect(code).toBe(0);
    expect(report.orphan).toEqual([]);
    expect(report.counts.global).toBe(1);
  });
});
