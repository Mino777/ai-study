import { NextRequest, NextResponse } from "next/server";
import { getTeacher } from "@/lib/english/catalog";
import { guardEnglishRequest } from "@/lib/english/guard";
import { synthesizeSpeech } from "@/lib/english/llm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const blocked = guardEnglishRequest(req, "tts");
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as { text?: unknown; teacherId?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 800) : "";
  if (!text) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  const teacher = getTeacher(String(body?.teacherId ?? ""));

  try {
    const wav = await synthesizeSpeech(text, teacher.ttsVoice, teacher.ttsStyle);
    // 키가 없으면 204 → 클라이언트가 브라우저 음성으로 대체
    if (!wav) return new NextResponse(null, { status: 204 });
    return new NextResponse(new Uint8Array(wav), {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("[english/tts]", e);
    return NextResponse.json({ error: "음성 생성 실패" }, { status: 502 });
  }
}
