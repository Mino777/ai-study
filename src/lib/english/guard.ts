// AI 전화영어 API 가드 — IP별 요청 한도 + (설정 시) 접근 코드. 공개 배포에서 LLM 비용 남용 방지.

import { NextRequest, NextResponse } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, max: number, windowMs: number): number | null {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  b.count++;
  return b.count > max ? Math.ceil((b.resetAt - now) / 1000) : null;
}

// [최대 요청 수, 윈도우(ms)] — 10분 기준
const LIMITS = {
  chat: [120, 10 * 60_000],
  tts: [120, 10 * 60_000],
  summarize: [20, 10 * 60_000],
} as const;

/** 통과하면 null, 막히면 에러 응답 */
export function guardEnglishRequest(
  req: NextRequest,
  scope: keyof typeof LIMITS,
): NextResponse | null {
  const code = process.env.ENGLISH_ACCESS_CODE;
  if (code && req.headers.get("x-english-code") !== code) {
    return NextResponse.json({ error: "접근 코드가 필요합니다", code: "ACCESS_CODE" }, { status: 401 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const [max, windowMs] = LIMITS[scope];
  const retryAfter = hit(`${scope}:${ip}`, max, windowMs);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: "요청이 너무 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  return null;
}
