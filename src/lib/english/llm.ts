// AI 전화영어 — Gemini 호출 (서버 전용). 키가 없으면 개발 환경에서만 mock 응답.

import { GoogleGenerativeAI, SchemaType, type Content, type Schema } from "@google/generative-ai";

// 모델 ID 가 자주 바뀌고(2.5 Flash 단종 수순) 계정별 접근도 달라서, 후보를 순서대로 시도하고
// 404(모델 없음)면 다음으로 넘어간다. 성공한 모델은 인스턴스 수명 동안 기억한다.
export const TEXT_MODELS = [
  process.env.ENGLISH_MODEL,
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
].filter((m): m is string => !!m);

export const TTS_MODELS = [
  process.env.ENGLISH_TTS_MODEL,
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
].filter((m): m is string => !!m);

const workingModel: { text?: string; tts?: string } = {};

function orderedCandidates(list: string[], preferred?: string): string[] {
  return preferred ? [preferred, ...list.filter((m) => m !== preferred)] : list;
}

function errorStatus(e: unknown): number | undefined {
  const s = (e as { status?: unknown })?.status;
  return typeof s === "number" ? s : undefined;
}

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
  const client = new GoogleGenerativeAI(key);
  const call = (model: string, noThinking: boolean) =>
    client
      .getGenerativeModel({
        model,
        systemInstruction: opts.system,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: opts.schema,
          temperature: opts.temperature,
          // 대화는 빠른 응답이 중요 — thinking 비활성 (SDK 타입 미지원 필드)
          ...(noThinking ? ({ thinkingConfig: { thinkingBudget: 0 } } as object) : {}),
        },
      })
      .generateContent({ contents: opts.contents });

  let res: Awaited<ReturnType<typeof call>> | null = null;
  let lastError: unknown;
  for (const model of orderedCandidates(TEXT_MODELS, workingModel.text)) {
    try {
      try {
        res = await call(model, true);
      } catch (e) {
        // thinkingBudget 을 받지 않는 모델(일부 3.x)이면 기본 설정으로 한 번 더
        if (errorStatus(e) !== 400) throw e;
        res = await call(model, false);
      }
      workingModel.text = model;
      break;
    } catch (e) {
      lastError = e;
      if (errorStatus(e) !== 404) throw e;
    }
  }
  if (!res) throw lastError;
  const text = res.response.text();
  try {
    return JSON.parse(text);
  } catch {
    // 스키마 강제에도 코드펜스가 섞이는 경우 대비
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : {};
  }
}

/** PCM16 mono → WAV 컨테이너 (브라우저 <audio> 로 바로 재생) */
export function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * Gemini TTS — 신 SDK 가 필요한 기능이라 REST 로 직접 호출. 키가 없으면 null(클라이언트가 브라우저 음성으로 대체).
 */
export async function synthesizeSpeech(text: string, voiceName: string, style: string): Promise<Buffer | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  let lastError: unknown;
  for (const model of orderedCandidates(TTS_MODELS, workingModel.tts)) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${style}: ${text}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    });
    if (res.status === 404) {
      lastError = new Error(`TTS 모델 없음: ${model}`);
      continue;
    }
    if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
    };
    const inline = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
    if (!inline?.data) throw new Error("TTS 응답에 오디오 없음");
    workingModel.tts = model;
    const rate = Number(inline.mimeType?.match(/rate=(\d+)/)?.[1]) || 24000;
    return pcmToWav(Buffer.from(inline.data, "base64"), rate);
  }
  throw lastError;
}
