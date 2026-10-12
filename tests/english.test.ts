import { describe, expect, it } from "vitest";
import {
  buildChatContents,
  buildChatSystemPrompt,
  parseChatResponse,
  parseSummarizeResponse,
  sanitizeMemory,
  sanitizeProfile,
  sanitizeTurns,
} from "@/lib/english/prompts";
import { emptyMemory, type ChatRequest, type Profile, type Turn } from "@/lib/english/types";
import {
  DEFAULT_STATE,
  applyReport,
  callStreak,
  pickFocusExpressions,
  type EnglishState,
} from "@/app/english/_lib/store";

const profile: Profile = {
  name: "Mino",
  level: "intermediate",
  goal: "job interview",
  interests: "iOS, running",
  teacherId: "james",
  callMinutes: 10,
  createdAt: "2026-10-12",
};

const t = (role: Turn["role"], text: string): Turn => ({ role, text, at: 0 });

describe("buildChatContents", () => {
  it("오프닝은 '전화 받음' user 턴 하나로 시작한다", () => {
    const c = buildChatContents([], "opening");
    expect(c).toHaveLength(1);
    expect(c[0].role).toBe("user");
  });

  it("선생님 오프닝 턴이 잘리지 않고 user/model 이 번갈아 나온다", () => {
    const c = buildChatContents([t("teacher", "Hi Mino!"), t("learner", "Hi"), t("learner", "I'm fine")], "turn");
    expect(c.map((x) => x.role)).toEqual(["user", "model", "user"]);
    expect(c[1].parts[0].text).toBe("Hi Mino!");
    // 연속 학습자 발화는 합쳐진다
    expect(c[2].parts[0].text).toBe("Hi\nI'm fine");
  });

  it("마지막이 선생님이면 이어가기 user 턴을 붙인다", () => {
    const c = buildChatContents([t("teacher", "Hi!")], "turn");
    expect(c[c.length - 1].role).toBe("user");
  });

  it("closing 은 마지막 학습자 턴에 마무리 신호를 합친다", () => {
    const c = buildChatContents([t("teacher", "Hi!"), t("learner", "Bye")], "closing");
    expect(c[c.length - 1].role).toBe("user");
    expect(c[c.length - 1].parts[0].text).toContain("wrap up");
  });
});

describe("buildChatSystemPrompt", () => {
  const base: ChatRequest = {
    profile,
    memory: null,
    topicId: "job-interview",
    turns: [],
    phase: "opening",
    elapsedSec: 0,
    focusExpressions: [],
    recentSummaries: [],
  };

  it("첫 통화는 FIRST call 안내, 페르소나·주제 포함", () => {
    const p = buildChatSystemPrompt(base);
    expect(p).toContain("FIRST call");
    expect(p).toContain("James");
    expect(p).toContain("영어 면접");
  });

  it("메모리·포커스 표현·추정 레벨이 프롬프트에 주입된다", () => {
    const memory = { ...emptyMemory(), facts: ["Works as an iOS developer"], nextTopics: ["Ask about Friday interview"], levelEstimate: "advanced" as const };
    const p = buildChatSystemPrompt({ ...base, memory, focusExpressions: ["call it a day"] });
    expect(p).toContain("Works as an iOS developer");
    expect(p).toContain("Ask about Friday interview");
    expect(p).toContain('"call it a day"');
    expect(p).toContain("Level: advanced");
    expect(p).not.toContain("FIRST call");
  });
});

describe("LLM 출력 정제", () => {
  it("chat: 빈 응답은 재요청 문구, 교정은 최대 2개·동일문 제거", () => {
    const r = parseChatResponse({
      reply: "",
      corrections: [
        { original: "a", better: "a", explanation: "same" },
        { original: "I go", better: "I went", explanation: "과거" },
        { original: "x", better: "y", explanation: "" },
        { original: "p", better: "q", explanation: "" },
      ],
    });
    expect(r.reply).toMatch(/say that again/);
    expect(r.corrections).toHaveLength(2);
    expect(r.corrections[0].better).toBe("I went");
    expect(r.suggestion).toBe("");
  });

  it("summarize: 레벨 fallback, 점수 clamp, 포커스 표현은 목록에 있는 것만", () => {
    const { report, memory } = parseSummarizeResponse(
      {
        report: { summary: "좋았어요", levelEstimate: "genius", fluency: 150, usedFocusExpressions: ["call it a day", "made up"] },
        memory: { facts: ["A", "a", "B"], teacherNote: "note" },
      },
      "elementary",
      ["Call it a day"],
    );
    expect(report.levelEstimate).toBe("elementary");
    expect(report.fluency).toBe(100);
    expect(report.usedFocusExpressions).toEqual(["call it a day"]);
    expect(memory.facts).toEqual(["A", "B"]);
    expect(memory.levelEstimate).toBe("elementary");
  });

  it("memory: 항목 수 상한", () => {
    const m = sanitizeMemory({ facts: Array.from({ length: 30 }, (_, i) => `f${i}`), nextTopics: Array.from({ length: 9 }, (_, i) => `n${i}`) });
    expect(m.facts).toHaveLength(12);
    expect(m.nextTopics).toHaveLength(5);
  });

  it("입력 검증: 이름 없는 프로필 거부, 잘못된 턴 제거, 통화 시간 범위", () => {
    expect(sanitizeProfile({ name: " " })).toBeNull();
    expect(sanitizeProfile({ ...profile, callMinutes: 999, level: "x" })).toMatchObject({ callMinutes: 30, level: "intermediate" });
    expect(sanitizeTurns([{ role: "system", text: "hack" }, t("learner", "hi")])).toHaveLength(1);
  });
});

describe("store — 개인화 루프", () => {
  const card = (expression: string, usedCount = 0, addedAt = "2026-10-01") => ({
    id: expression,
    expression,
    meaning: "",
    example: "",
    addedAt,
    usedCount,
    mastered: false,
  });

  it("리포트 반영: 메모리 교체, 새 표현 추가(중복 제외), 2번 쓰면 익힘", () => {
    const s: EnglishState = {
      ...DEFAULT_STATE,
      profile,
      calls: [{ id: "c1", startedAt: "2026-10-12", durationSec: 60, teacherId: "james", topicId: "catch-up", turns: [] }],
      expressions: [card("call it a day", 1)],
    };
    const memory = { ...emptyMemory(), facts: ["new fact"] };
    const next = applyReport(
      s,
      "c1",
      {
        summary: "s",
        strengths: [],
        corrections: [],
        expressions: [
          { expression: "Call it a day", meaning: "", example: "" },
          { expression: "I'm swamped", meaning: "", example: "" },
        ],
        usedFocusExpressions: ["call it a day"],
        levelEstimate: "intermediate",
        fluency: 70,
        nextTimeTip: "",
      },
      memory,
    );
    expect(next.memory?.facts).toEqual(["new fact"]);
    expect(next.calls[0].report?.fluency).toBe(70);
    expect(next.expressions.map((e) => e.expression)).toEqual(["I'm swamped", "call it a day"]);
    expect(next.expressions[1]).toMatchObject({ usedCount: 2, mastered: true });
  });

  it("포커스 표현: 익힌 것 제외, 덜 쓴 것·최근 것 우선", () => {
    const s: EnglishState = {
      ...DEFAULT_STATE,
      expressions: [card("old", 0, "2026-09-01"), card("used", 1), card("new", 0, "2026-10-10"), { ...card("done"), mastered: true }],
    };
    expect(pickFocusExpressions(s, 2)).toEqual(["new", "old"]);
  });

  it("연속 통화일: 오늘 통화 없으면 어제부터 센다", () => {
    const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();
    const call = (offset: number) => ({ id: String(offset), startedAt: day(offset), durationSec: 60, teacherId: "emma", topicId: "catch-up", turns: [] });
    expect(callStreak([call(1), call(2), call(4)])).toBe(2);
    expect(callStreak([call(0), call(1)])).toBe(2);
    expect(callStreak([call(3)])).toBe(0);
  });
});
