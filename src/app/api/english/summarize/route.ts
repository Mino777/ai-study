import { NextRequest, NextResponse } from "next/server";
import { guardEnglishRequest } from "@/lib/english/guard";
import { LlmUnavailableError, SUMMARIZE_SCHEMA, generateJson } from "@/lib/english/llm";
import {
  LIMITS,
  buildSummarizePrompt,
  parseSummarizeResponse,
  sanitizeMemory,
  sanitizeProfile,
  sanitizeTurns,
} from "@/lib/english/prompts";
import type { SummarizeRequest } from "@/lib/english/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const blocked = guardEnglishRequest(req, "summarize");
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as Partial<SummarizeRequest> | null;
  const profile = sanitizeProfile(body?.profile);
  if (!body || !profile) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const sumReq: SummarizeRequest = {
    profile,
    memory: body.memory ? sanitizeMemory(body.memory) : null,
    topicId: String(body.topicId ?? "catch-up"),
    turns: sanitizeTurns(body.turns),
    focusExpressions: (Array.isArray(body.focusExpressions) ? body.focusExpressions : [])
      .map((e) => String(e).slice(0, 120))
      .slice(0, LIMITS.focusExpressions),
  };
  if (!sumReq.turns.some((t) => t.role === "learner")) {
    return NextResponse.json({ error: "대화 내용이 없어요" }, { status: 400 });
  }

  try {
    const raw = await generateJson({
      system: "You are a meticulous, kind English tutor writing post-lesson notes. Output JSON only.",
      contents: [{ role: "user", parts: [{ text: buildSummarizePrompt(sumReq) }] }],
      schema: SUMMARIZE_SCHEMA,
      temperature: 0.3,
      mock: () => ({
        report: {
          summary: "(mock) 오늘은 하루 일과에 대해 이야기했어요. 질문에 적극적으로 대답했어요.",
          strengths: ["질문에 바로 대답했어요", "자기 경험을 구체적으로 말했어요"],
          corrections: [{ original: "I go to work yesterday", better: "I went to work yesterday", explanation: "과거 일은 과거시제" }],
          expressions: [
            { expression: "call it a day", meaning: "오늘은 여기까지 하다", example: "I was so tired that I called it a day early." },
            { expression: "I'm swamped", meaning: "너무 바쁘다", example: "I'm swamped with work this week." },
          ],
          usedFocusExpressions: sumReq.focusExpressions.slice(0, 1),
          levelEstimate: profile.level,
          fluency: 62,
          nextTimeTip: "다음엔 대답에 이유를 하나씩 붙여보세요 (because ...).",
        },
        memory: {
          ...(sumReq.memory ?? {}),
          facts: [...(sumReq.memory?.facts ?? []), `(mock) Talked on ${new Date().toDateString()}`],
          nextTopics: ["Ask how the rest of the week went"],
          teacherNote: "(mock) Encourage longer answers.",
        },
      }),
    });
    return NextResponse.json(parseSummarizeResponse(raw, profile.level, sumReq.focusExpressions));
  } catch (e) {
    if (e instanceof LlmUnavailableError) {
      return NextResponse.json({ error: "AI 선생님 연결 설정이 안 되어 있어요 (GEMINI_API_KEY)" }, { status: 503 });
    }
    console.error("[english/summarize]", e);
    return NextResponse.json({ error: "리포트 생성에 실패했어요. 다시 시도해주세요." }, { status: 502 });
  }
}
