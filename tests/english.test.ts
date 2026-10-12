import { afterEach, describe, expect, it, vi } from "vitest";
import { pcmToWav, synthesizeSpeech } from "@/lib/english/llm";
import { speechMatchScore } from "@/app/english/_lib/match";
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
  daysSinceLastCall,
  dueExpressions,
  pickFocusExpressions,
  scheduleCard,
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
    clientNow: "Monday, October 12, 2026 at 3:20 PM",
    daysSinceLastCall: null,
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

  it("오늘 날짜와 지난 통화 경과일이 들어간다", () => {
    const p = buildChatSystemPrompt({ ...base, daysSinceLastCall: 5 });
    expect(p).toContain("Monday, October 12, 2026");
    expect(p).toContain("5 day(s) ago");
  });

  it("교정 방식: 초급은 recast 만, 중상급은 스스로 고치게 유도", () => {
    const beginner = buildChatSystemPrompt({ ...base, profile: { ...profile, level: "beginner" } });
    const upper = buildChatSystemPrompt({ ...base, profile: { ...profile, level: "upper-intermediate" } });
    expect(beginner).toContain("RECAST only");
    expect(upper).toContain("Prefer PROMPTS for self-repair");
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
  const card = (expression: string, step = 0, dueAt = "2026-10-01T00:00:00.000Z") => ({
    id: expression,
    expression,
    meaning: "",
    example: "",
    addedAt: "2026-09-01T00:00:00.000Z",
    usedCount: 0,
    mastered: false,
    step,
    dueAt,
  });

  it("리포트 반영: 메모리 교체, 새 표현은 내일 복습으로 추가, 통화 중 쓴 표현은 복습 성공", () => {
    const s: EnglishState = {
      ...DEFAULT_STATE,
      profile,
      calls: [{ id: "c1", startedAt: "2026-10-12", durationSec: 60, teacherId: "james", topicId: "catch-up", turns: [] }],
      expressions: [card("call it a day", 3)],
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
    expect(next.expressions[0]).toMatchObject({ step: 0, mastered: false });
    expect(new Date(next.expressions[0].dueAt).getTime()).toBeGreaterThan(Date.now());
    // step 3 → 4 = 익힘
    expect(next.expressions[1]).toMatchObject({ usedCount: 1, step: 4, mastered: true });
  });

  it("간격 반복: 알았어요 → 한 단계 위, 애매 → 유지, 몰랐어요 → 처음부터", () => {
    const now = new Date("2026-10-12T00:00:00Z");
    const c = card("x", 2);
    const days = (d: string) => Math.round((new Date(d).getTime() - now.getTime()) / 86400000);
    expect(days(scheduleCard(c, "good", now).dueAt)).toBe(14);
    expect(days(scheduleCard(c, "hard", now).dueAt)).toBe(7);
    expect(scheduleCard(c, "again", now)).toMatchObject({ step: 0 });
    expect(scheduleCard(card("y", 5), "good", now).step).toBe(5); // 상한
  });

  it("복습 대상·포커스 표현: 기한 지난 것 우선, 익힌 것은 포커스 제외", () => {
    const s: EnglishState = {
      ...DEFAULT_STATE,
      expressions: [
        card("later", 0, "2999-01-01T00:00:00.000Z"),
        card("overdue", 0, "2026-01-01T00:00:00.000Z"),
        card("due", 0, "2026-10-01T00:00:00.000Z"),
        { ...card("done", 4, "2026-01-01T00:00:00.000Z"), mastered: true },
      ],
    };
    expect(pickFocusExpressions(s, 2)).toEqual(["overdue", "due"]);
    expect(dueExpressions(s).map((e) => e.expression)).toEqual(["overdue", "done", "due"]);
  });

  it("지난 통화 경과일은 달력 날짜 기준", () => {
    const now = new Date(2026, 9, 12, 9, 0);
    const call = (d: Date) => ({ id: "c", startedAt: d.toISOString(), durationSec: 60, teacherId: "emma", topicId: "catch-up", turns: [] });
    expect(daysSinceLastCall([], now)).toBeNull();
    expect(daysSinceLastCall([call(new Date(2026, 9, 11, 23, 0))], now)).toBe(1);
    expect(daysSinceLastCall([call(new Date(2026, 9, 12, 1, 0))], now)).toBe(0);
  });

  it("연속 통화일: 오늘 통화 없으면 어제부터 센다", () => {
    const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();
    const call = (offset: number) => ({ id: String(offset), startedAt: day(offset), durationSec: 60, teacherId: "emma", topicId: "catch-up", turns: [] });
    expect(callStreak([call(1), call(2), call(4)])).toBe(2);
    expect(callStreak([call(0), call(1)])).toBe(2);
    expect(callStreak([call(3)])).toBe(0);
  });
});

describe("말하기 채점", () => {
  it("축약형·대소문자·문장부호는 같게, 앞뒤 군말은 감점 없음", () => {
    expect(speechMatchScore("I'm swamped with work.", "um I am swamped with work")).toBe(1);
    expect(speechMatchScore("call it a day", "Let's call it a day!")).toBe(1);
  });
  it("빠진 단어·순서 바뀜은 감점", () => {
    expect(speechMatchScore("I went to the gym yesterday", "I go to the gym yesterday")).toBeCloseTo(5 / 6);
    expect(speechMatchScore("call it a day", "day a it call")).toBe(0.25);
    expect(speechMatchScore("", "anything")).toBe(0);
  });
});

describe("TTS", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("PCM → WAV 헤더", () => {
    const wav = pcmToWav(Buffer.alloc(100), 24000);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.readUInt32LE(24)).toBe(24000);
    expect(wav.readUInt32LE(40)).toBe(100);
    expect(wav.length).toBe(144);
  });

  it("키가 없으면 null (클라이언트가 브라우저 음성으로 대체)", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(await synthesizeSpeech("hi", "Kore", "Say")).toBeNull();
  });

  it("첫 모델이 404 면 다음 후보로 넘어가고 rate 를 mimeType 에서 읽는다", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test");
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urls.push(url);
        if (urls.length === 1) return new Response("not found", { status: 404 });
        const audio = { inlineData: { mimeType: "audio/L16;codec=pcm;rate=16000", data: Buffer.alloc(4).toString("base64") } };
        return Response.json({ candidates: [{ content: { parts: [audio] } }] });
      }),
    );
    const wav = await synthesizeSpeech("hi", "Kore", "Say");
    expect(urls).toHaveLength(2);
    expect(urls[0]).not.toBe(urls[1]);
    expect(wav?.readUInt32LE(24)).toBe(16000);
  });
});
