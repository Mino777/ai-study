// AI 전화영어 — Gemini 호출 (서버 전용). 키가 없으면 개발 환경에서만 mock 응답.

import { GoogleGenerativeAI, SchemaType, type Content, type Schema } from "@google/generative-ai";

const MODEL = process.env.ENGLISH_MODEL || "gemini-2.5-flash";

const correctionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    original: { type: SchemaType.STRING },
    better: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ["original", "better", "explanation"],
};

const strArray: Schema = { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } };

export const CHAT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: { type: SchemaType.STRING },
    corrections: { type: SchemaType.ARRAY, items: correctionSchema },
    suggestion: { type: SchemaType.STRING },
  },
  required: ["reply", "corrections", "suggestion"],
};

export const SUMMARIZE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    report: {
      type: SchemaType.OBJECT,
      properties: {
        summary: { type: SchemaType.STRING },
        strengths: strArray,
        corrections: { type: SchemaType.ARRAY, items: correctionSchema },
        expressions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              expression: { type: SchemaType.STRING },
              meaning: { type: SchemaType.STRING },
              example: { type: SchemaType.STRING },
            },
            required: ["expression", "meaning", "example"],
          },
        },
        usedFocusExpressions: strArray,
        levelEstimate: { type: SchemaType.STRING },
        fluency: { type: SchemaType.NUMBER },
        nextTimeTip: { type: SchemaType.STRING },
      },
      required: [
        "summary",
        "strengths",
        "corrections",
        "expressions",
        "usedFocusExpressions",
        "levelEstimate",
        "fluency",
        "nextTimeTip",
      ],
    },
    memory: {
      type: SchemaType.OBJECT,
      properties: {
        facts: strArray,
        interests: strArray,
        goals: strArray,
        recurringMistakes: strArray,
        nextTopics: strArray,
        teacherNote: { type: SchemaType.STRING },
        levelEstimate: { type: SchemaType.STRING },
      },
      required: ["facts", "interests", "goals", "recurringMistakes", "nextTopics", "teacherNote"],
    },
  },
  required: ["report", "memory"],
};

export class LlmUnavailableError extends Error {}

export function isMockMode(): boolean {
  return !process.env.GEMINI_API_KEY && process.env.NODE_ENV !== "production";
}

export async function generateJson(opts: {
  system: string;
  contents: Content[];
  schema: Schema;
  temperature: number;
  mock: () => unknown;
}): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    if (isMockMode()) return opts.mock();
    throw new LlmUnavailableError("GEMINI_API_KEY 미설정");
  }
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: MODEL,
    systemInstruction: opts.system,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: opts.schema,
      temperature: opts.temperature,
      // 대화는 빠른 응답이 중요 — thinking 비활성 (SDK 타입 미지원 필드)
      ...({ thinkingConfig: { thinkingBudget: 0 } } as object),
    },
  });
  const res = await model.generateContent({ contents: opts.contents });
  const text = res.response.text();
  try {
    return JSON.parse(text);
  } catch {
    // 스키마 강제에도 코드펜스가 섞이는 경우 대비
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : {};
  }
}
