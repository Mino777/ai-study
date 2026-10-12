// AI 전화영어 — 프롬프트 빌더 + LLM 출력 정제 (서버 전용, 순수 함수)

import { getTeacher, getTopic } from "./catalog";
import {
  LEVELS,
  emptyMemory,
  type CallReport,
  type ChatRequest,
  type ChatResponse,
  type Correction,
  type Level,
  type Profile,
  type SummarizeRequest,
  type TeacherMemory,
  type Turn,
} from "./types";

export const LIMITS = {
  turns: 40,
  turnChars: 1000,
  memoryItems: 12,
  itemChars: 200,
  focusExpressions: 3,
  recentSummaries: 3,
} as const;

const LEVEL_GUIDE: Record<Level, string> = {
  beginner:
    "Use very short, simple sentences and common words. Speak slowly in text form (no idioms). If they struggle, offer two simple choices to answer from.",
  elementary:
    "Use simple sentences and everyday vocabulary. Avoid idioms unless you explain them right away.",
  intermediate:
    "Use natural everyday English with some common phrasal verbs and idioms. Encourage longer answers.",
  "upper-intermediate":
    "Speak naturally like with a native friend, with idioms and phrasal verbs. Push for nuance, reasons and examples.",
  advanced:
    "Speak completely naturally at native speed and register. Challenge them with follow-ups, nuance and debate.",
};

function clip(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function strList(v: unknown, maxItems: number = LIMITS.memoryItems): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    const s = clip(item, LIMITS.itemChars);
    const key = s.toLowerCase();
    if (!s || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

function asLevel(v: unknown, fallback: Level): Level {
  return (LEVELS as readonly string[]).includes(v as string) ? (v as Level) : fallback;
}

export function sanitizeProfile(p: unknown): Profile | null {
  const o = (p && typeof p === "object" ? p : null) as Partial<Profile> | null;
  if (!o || typeof o.name !== "string" || !o.name.trim()) return null;
  return {
    name: o.name.trim().slice(0, 40),
    level: (LEVELS as readonly string[]).includes(o.level as string) ? o.level! : "intermediate",
    goal: String(o.goal ?? "").slice(0, 300),
    interests: String(o.interests ?? "").slice(0, 300),
    teacherId: String(o.teacherId ?? "emma").slice(0, 20),
    callMinutes: Math.min(30, Math.max(3, Number(o.callMinutes) || 10)),
    createdAt: String(o.createdAt ?? ""),
  };
}

export function sanitizeTurns(turns: unknown): Turn[] {
  if (!Array.isArray(turns)) return [];
  return turns
    .filter(
      (t): t is Turn =>
        !!t && (t.role === "teacher" || t.role === "learner") && typeof t.text === "string",
    )
    .slice(-LIMITS.turns)
    .map((t) => ({ role: t.role, text: clip(t.text, LIMITS.turnChars), at: Number(t.at) || 0 }));
}

function sanitizeCorrections(v: unknown, max = 3): Correction[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((c) => ({
      original: clip(c?.original, 300),
      better: clip(c?.better, 300),
      explanation: clip(c?.explanation, 300),
    }))
    .filter((c) => c.original && c.better && c.original !== c.better)
    .slice(0, max);
}

export function sanitizeMemory(v: unknown): TeacherMemory {
  const m = (v && typeof v === "object" ? v : {}) as Partial<TeacherMemory>;
  const base = emptyMemory();
  return {
    facts: strList(m.facts),
    interests: strList(m.interests),
    goals: strList(m.goals, 6),
    recurringMistakes: strList(m.recurringMistakes, 8),
    nextTopics: strList(m.nextTopics, 5),
    teacherNote: clip(m.teacherNote, 600),
    levelEstimate: m.levelEstimate ? asLevel(m.levelEstimate, "intermediate") : undefined,
    updatedAt: clip(m.updatedAt, 40) || base.updatedAt,
  };
}

function memoryBlock(memory: TeacherMemory | null): string {
  if (!memory) return "This is your FIRST call with this learner. Get to know them warmly.";
  const sec = (label: string, items: string[]) =>
    items.length ? `${label}:\n${items.map((i) => `- ${i}`).join("\n")}` : "";
  return [
    "What you remember about this learner from previous calls (use it naturally, like a real teacher who remembers — never recite it as a list):",
    sec("Facts", memory.facts),
    sec("Interests", memory.interests),
    sec("Goals", memory.goals),
    sec("Recurring mistakes (gently create chances to practise the correct form)", memory.recurringMistakes),
    sec("Topics to follow up on", memory.nextTopics),
    memory.teacherNote ? `Your note to yourself after last call: ${memory.teacherNote}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildChatSystemPrompt(req: ChatRequest): string {
  const teacher = getTeacher(req.profile.teacherId);
  const topic = getTopic(req.topicId);
  const level = req.memory?.levelEstimate ?? req.profile.level;
  const minutes = Math.floor(req.elapsedSec / 60);
  const total = req.profile.callMinutes;

  const phaseGuide =
    req.phase === "opening"
      ? `The learner just picked up your call. Open the call like a real phone call: greet ${req.profile.name} by name, ${
          req.memory ? "mention something specific you remember from last time and ask about it" : "introduce yourself briefly"
        }, then lead into today's topic. Max 3 short sentences. corrections must be [].`
      : req.phase === "closing"
        ? "Time is up. Wrap up the call warmly in 2-3 sentences: one specific thing they did well today, one thing to remember, and a hint of what you'll talk about next time. Say goodbye. Do not ask a new question."
        : `Continue the conversation. About ${minutes} of ${total} minutes have passed.`;

  return `You are ${teacher.persona}
You are a native English tutor on a 1:1 PHONE CALL (Korean 전화영어 style) with a Korean learner.

# Learner
- Name: ${req.profile.name}
- Level: ${level}. ${LEVEL_GUIDE[level]}
- Goal: ${clip(req.profile.goal, 300) || "(not specified)"}
- Self-described interests: ${clip(req.profile.interests, 300) || "(not specified)"}

# Memory
${memoryBlock(req.memory)}
${req.recentSummaries.length ? `\nRecent call summaries (oldest first):\n${req.recentSummaries.map((s) => `- ${s}`).join("\n")}` : ""}

# Today's topic: ${topic.title}
${topic.scenario}
${
  req.focusExpressions.length
    ? `\n# Expressions to recycle\nThe learner recently learned: ${req.focusExpressions.map((e) => `"${e}"`).join(", ")}. Steer the conversation so they get a natural chance to use them (don't announce it; at most one per few turns).`
    : ""
}

# Phone-call rules
- This is SPOKEN conversation: 1-3 short sentences per turn, contractions, natural reactions ("Oh nice!", "Wait, really?"). No lists, no markdown, no emojis.
- Ask exactly ONE question per turn and let the learner do most of the talking.
- Speech-recognition text may contain mishearings; infer the intended meaning rather than correcting transcription errors or punctuation.
- If the learner writes Korean or says they don't understand, rephrase more simply in English (a few Korean words are OK only for beginners).
- Never break character as a human tutor; don't mention being an AI unless asked directly.
- Keep the conversation flowing — don't lecture mid-call. If a mistake is important, you MAY naturally recast the correct form in your reply ("Oh, you went to Busan? Nice!").

# Phase
${phaseGuide}

# Output (JSON)
- reply: what you say out loud now.
- corrections: up to 2 meaningful corrections of the learner's LAST message only (grammar, word choice, or clearly unnatural phrasing — skip trivial ones and transcription noise). "original" = their words, "better" = natural native version, "explanation" = short reason in KOREAN. Empty array if none.
- suggestion: one natural example answer the learner could give to your reply (in English, at their level). Empty string when phase is closing.`;
}

export function buildChatContents(turns: Turn[], phase: ChatRequest["phase"]) {
  // Gemini는 user 턴으로 시작해야 하므로 "전화 받음"을 항상 첫 턴으로 둔다
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [
    { role: "user", parts: [{ text: "(phone rings — learner picks up) Hello?" }] },
  ];
  // 같은 역할 연속(예: 텍스트로 두 번 보냄)은 한 턴으로 합친다
  const push = (role: "user" | "model", text: string) => {
    const last = contents[contents.length - 1];
    if (last.role === role) last.parts[0].text += `\n${text}`;
    else contents.push({ role, parts: [{ text }] });
  };
  for (const t of turns) push(t.role === "teacher" ? "model" : "user", t.text);
  if (phase === "closing") push("user", "(the call time is up — please wrap up)");
  // 마지막이 model 이면 응답할 user 턴이 없으므로 이어달라는 신호를 넣는다
  if (contents[contents.length - 1].role === "model") {
    push("user", "(silence — please keep the conversation going)");
  }
  return contents;
}

export function parseChatResponse(raw: unknown): ChatResponse {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    reply: clip(r.reply, 800) || "Sorry, the line was a bit choppy — could you say that again?",
    corrections: sanitizeCorrections(r.corrections, 2),
    suggestion: clip(r.suggestion, 300),
  };
}

export function buildSummarizePrompt(req: SummarizeRequest): string {
  const teacher = getTeacher(req.profile.teacherId);
  const topic = getTopic(req.topicId);
  const transcript = req.turns
    .map((t) => `${t.role === "teacher" ? teacher.name : req.profile.name}: ${t.text}`)
    .join("\n");

  return `You are ${teacher.name}, an English tutor, writing notes right after a phone lesson with a Korean learner (${req.profile.name}, self-reported level: ${req.profile.level}). Topic: ${topic.title}.

# Transcript
${transcript}

# Your memory BEFORE this call (JSON)
${JSON.stringify(req.memory ?? emptyMemory())}

# Focus expressions the learner was practising
${req.focusExpressions.length ? req.focusExpressions.join(", ") : "(none)"}

# Task — return JSON with two keys:
1. "report" (shown to the learner; Korean where noted):
   - summary: 2-3 sentence summary of the call in KOREAN.
   - strengths: 1-3 specific things they did well, KOREAN.
   - corrections: up to 6 most valuable corrections from the learner's lines (original/better/explanation in KOREAN). Ignore speech-recognition noise.
   - expressions: 3-5 useful natural expressions for this learner to learn — ideally better ways to say what they tried to say today. meaning in KOREAN, example in English.
   - usedFocusExpressions: which of the focus expressions the learner actually used correctly (exact strings from the list).
   - levelEstimate: one of ${LEVELS.join(", ")} based on this call.
   - fluency: 0-100 holistic speaking score for their level-appropriate performance.
   - nextTimeTip: one concrete tip for next call, KOREAN.
2. "memory": the UPDATED full memory, merging old memory with what you learned today.
   - facts (English): durable personal facts (job, family, pets, city, upcoming events with dates if mentioned). Update outdated facts instead of duplicating. Max 12, most important first.
   - interests (English), goals (English): max 12 / 6.
   - recurringMistakes (KOREAN): error PATTERNS seen repeatedly across calls (e.g. "과거시제 대신 현재시제 사용"). Max 8. Remove ones they've clearly fixed.
   - nextTopics (English): 2-5 concrete follow-ups for next time (e.g. "Ask how the job interview on Friday went").
   - teacherNote (English): 1-3 sentences to your future self about how to teach this learner best.
   - levelEstimate: same as report.levelEstimate.`;
}

export function parseSummarizeResponse(
  raw: unknown,
  fallbackLevel: Level,
  focusExpressions: string[],
): { report: CallReport; memory: TeacherMemory } {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rep = (r.report && typeof r.report === "object" ? r.report : {}) as Record<string, unknown>;
  const levelEstimate = asLevel(rep.levelEstimate, fallbackLevel);
  const focusSet = new Set(focusExpressions.map((e) => e.toLowerCase()));

  const expressions = Array.isArray(rep.expressions)
    ? rep.expressions
        .map((e) => ({
          expression: clip(e?.expression, 120),
          meaning: clip(e?.meaning, 200),
          example: clip(e?.example, 300),
        }))
        .filter((e) => e.expression)
        .slice(0, 5)
    : [];

  const report: CallReport = {
    summary: clip(rep.summary, 800),
    strengths: strList(rep.strengths, 3),
    corrections: sanitizeCorrections(rep.corrections, 6),
    expressions,
    usedFocusExpressions: strList(rep.usedFocusExpressions, LIMITS.focusExpressions).filter((e) =>
      focusSet.has(e.toLowerCase()),
    ),
    levelEstimate,
    fluency: Math.max(0, Math.min(100, Math.round(Number(rep.fluency) || 0))),
    nextTimeTip: clip(rep.nextTimeTip, 300),
  };

  const memory = sanitizeMemory({ ...(r.memory as object), levelEstimate, updatedAt: new Date().toISOString() });
  return { report, memory };
}
