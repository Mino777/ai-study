import { NextRequest, NextResponse } from "next/server";
import { guardEnglishRequest } from "@/lib/english/guard";
import { CHAT_SCHEMA, LlmUnavailableError, generateJson } from "@/lib/english/llm";
import {
  LIMITS,
  buildChatContents,
  buildChatSystemPrompt,
  parseChatResponse,
  sanitizeMemory,
  sanitizeClientNow,
  sanitizeProfile,
  sanitizeTurns,
} from "@/lib/english/prompts";
import type { ChatRequest } from "@/lib/english/types";

export const runtime = "nodejs";

const MOCK_REPLIES = [
  "Oh, that's interesting! Can you tell me a bit more about that?",
  "Wait, really? How did that make you feel?",
  "Nice! So what are you planning to do this weekend?",
  "Haha, I totally get that. What's the best part of it for you?",
];

export async function POST(req: NextRequest) {
  const blocked = guardEnglishRequest(req, "chat");
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as Partial<ChatRequest> | null;
  const profile = sanitizeProfile(body?.profile);
  if (!body || !profile) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const phase = body.phase === "opening" || body.phase === "closing" ? body.phase : "turn";
  const chatReq: ChatRequest = {
    profile,
    memory: body.memory ? sanitizeMemory(body.memory) : null,
    topicId: String(body.topicId ?? "catch-up"),
    turns: sanitizeTurns(body.turns),
    phase,
    elapsedSec: Math.max(0, Number(body.elapsedSec) || 0),
    focusExpressions: (Array.isArray(body.focusExpressions) ? body.focusExpressions : [])
      .map((e) => String(e).slice(0, 120))
      .slice(0, LIMITS.focusExpressions),
    recentSummaries: (Array.isArray(body.recentSummaries) ? body.recentSummaries : [])
      .map((s) => String(s).slice(0, 400))
      .slice(-LIMITS.recentSummaries),
    clientNow: sanitizeClientNow(body.clientNow),
    daysSinceLastCall:
      typeof body.daysSinceLastCall === "number" && body.daysSinceLastCall >= 0
        ? Math.floor(body.daysSinceLastCall)
        : null,
  };

  try {
    const raw = await generateJson({
      system: buildChatSystemPrompt(chatReq),
      contents: buildChatContents(chatReq.turns, phase),
      schema: CHAT_SCHEMA,
      temperature: 0.8,
      mock: () => {
        const lastLearner = [...chatReq.turns].reverse().find((t) => t.role === "learner");
        if (phase === "opening")
          return {
            reply: `Hi ${profile.name}! It's so good to hear from you. How's your day going so far?`,
            corrections: [],
            suggestion: "It's going pretty well, thanks! I just finished work.",
          };
        if (phase === "closing")
          return { reply: `Great job today, ${profile.name}! Talk to you next time. Bye!`, corrections: [], suggestion: "" };
        return {
          reply: MOCK_REPLIES[chatReq.turns.length % MOCK_REPLIES.length],
          corrections: lastLearner && /\bi go\b/i.test(lastLearner.text)
            ? [{ original: "I go", better: "I went", explanation: "(mock) 과거 일은 과거시제로 말해요" }]
            : [],
          suggestion: "Well, I think it was really fun.",
        };
      },
    });
    return NextResponse.json(parseChatResponse(raw));
  } catch (e) {
    if (e instanceof LlmUnavailableError) {
      return NextResponse.json({ error: "AI 선생님 연결 설정이 안 되어 있어요 (GEMINI_API_KEY)" }, { status: 503 });
    }
    console.error("[english/chat]", e);
    return NextResponse.json({ error: "선생님 연결이 잠시 끊겼어요. 다시 시도해주세요." }, { status: 502 });
  }
}
