"use client";

import type {
  ChatRequest,
  ChatResponse,
  SummarizeRequest,
  SummarizeResponse,
} from "@/lib/english/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown, accessCode: string): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(accessCode ? { "x-english-code": accessCode } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `요청 실패 (${res.status})`, res.status, data.code);
  return data as T;
}

export const chatApi = (req: ChatRequest, code: string) => post<ChatResponse>("/api/english/chat", req, code);
export const summarizeApi = (req: SummarizeRequest, code: string) =>
  post<SummarizeResponse>("/api/english/summarize", req, code);

/** 선생님 AI 음성(WAV). 서버에 키가 없으면(204) null → 브라우저 음성으로 대체 */
export async function ttsApi(text: string, teacherId: string, accessCode: string, signal: AbortSignal): Promise<Blob | null> {
  const res = await fetch("/api/english/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(accessCode ? { "x-english-code": accessCode } : {}) },
    body: JSON.stringify({ text, teacherId }),
    signal,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new ApiError(`음성 생성 실패 (${res.status})`, res.status);
  return res.blob();
}
