"use client";

// 브라우저 음성 — 인식(Web Speech API) + 합성(speechSynthesis) + 전화 벨소리(WebAudio)

import { useEffect, useState } from "react";
import type { Teacher } from "@/lib/english/catalog";

/* ---------- 음성 합성 (선생님 목소리) ---------- */

export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

export function pickVoice(voices: SpeechSynthesisVoice[], teacher: Teacher): SpeechSynthesisVoice | null {
  const exact = voices.filter((v) => v.lang.replace("_", "-") === teacher.voiceLang);
  for (const hint of teacher.voiceHints) {
    const v = exact.find((x) => x.name.includes(hint)) ?? voices.find((x) => x.name.includes(hint));
    if (v) return v;
  }
  return exact[0] ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

/**
 * 문장 단위로 나눠 순서대로 읽는다 (Chrome 의 긴 발화 끊김 버그 회피).
 * 반환값으로 중단 가능.
 */
export function speak(
  text: string,
  opts: { voice: SpeechSynthesisVoice | null; lang: string; rate: number; onEnd: () => void },
): () => void {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  if (!synth) {
    opts.onEnd();
    return () => {};
  }
  synth.cancel();
  const chunks = text.match(/[^.!?]+[.!?]*\s*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  let cancelled = false;
  let i = 0;
  // 안전장치: onend 가 안 오는 브라우저 대비 (글자 수 기반 타임아웃)
  let watchdog: ReturnType<typeof setTimeout> | null = null;

  const next = () => {
    if (watchdog) clearTimeout(watchdog);
    if (cancelled) return;
    if (i >= chunks.length) {
      opts.onEnd();
      return;
    }
    const u = new SpeechSynthesisUtterance(chunks[i++]);
    if (opts.voice) u.voice = opts.voice;
    u.lang = opts.voice?.lang ?? opts.lang;
    u.rate = opts.rate;
    // onend · onerror · watchdog 중 먼저 온 것 하나만 다음 문장으로 넘긴다
    let advanced = false;
    const go = () => {
      if (advanced) return;
      advanced = true;
      next();
    };
    u.onend = go;
    u.onerror = go;
    watchdog = setTimeout(go, 4000 + (u.text.length * 120) / opts.rate);
    synth.speak(u);
  };
  next();

  return () => {
    cancelled = true;
    if (watchdog) clearTimeout(watchdog);
    synth.cancel();
  };
}

/* ---------- 음성 인식 (학습자 발화) ---------- */

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => RecognitionLike) | null;
}

export function isRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/**
 * 한 번의 발화를 듣는다. 말이 멈추고 silenceMs 가 지나면 확정 텍스트로 onDone 호출.
 * 아무 말도 없으면 onDone("").
 */
export function listenOnce(opts: {
  silenceMs: number;
  onInterim: (text: string) => void;
  onDone: (text: string) => void;
  onError: (error: string) => void;
}): { stop: () => void; abort: () => void } {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError("unsupported");
    return { stop: () => {}, abort: () => {} };
  }
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = true;
  rec.interimResults = true;

  let finalText = "";
  let interimText = "";
  let done = false;
  let silenceTimer: ReturnType<typeof setTimeout> | null = null;
  // 말을 시작하지 않으면 12초 후 종료
  let idleTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => rec.stop(), 12000);

  const finish = () => {
    if (done) return;
    done = true;
    if (silenceTimer) clearTimeout(silenceTimer);
    if (idleTimer) clearTimeout(idleTimer);
    opts.onDone(`${finalText} ${interimText}`.replace(/\s+/g, " ").trim());
  };

  rec.onresult = (e) => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    interimText = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += ` ${r[0].transcript}`;
      else interimText += ` ${r[0].transcript}`;
    }
    opts.onInterim(`${finalText} ${interimText}`.replace(/\s+/g, " ").trim());
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => rec.stop(), opts.silenceMs);
  };
  rec.onerror = (e) => {
    if (e.error === "no-speech" || e.error === "aborted") return;
    done = true;
    opts.onError(e.error);
  };
  rec.onend = finish;

  try {
    rec.start();
  } catch {
    opts.onError("start-failed");
  }

  return {
    stop: () => rec.stop(),
    abort: () => {
      done = true;
      if (silenceTimer) clearTimeout(silenceTimer);
      if (idleTimer) clearTimeout(idleTimer);
      rec.abort();
    },
  };
}

/* ---------- 전화 벨소리 ---------- */

export function startRingtone(): () => void {
  if (typeof window === "undefined") return () => {};
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return () => {};
  const ctx = new Ctx();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);
  // 북미식 2-톤 벨 (440 + 480Hz), 2초 울림 / 4초 쉼
  const oscs = [440, 480].map((f) => {
    const o = ctx.createOscillator();
    o.frequency.value = f;
    o.connect(gain);
    o.start();
    return o;
  });
  const ring = () => {
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.setValueAtTime(0, t + 2);
    if ("vibrate" in navigator) navigator.vibrate?.([400, 200, 400]);
  };
  ring();
  const timer = setInterval(ring, 4000);
  return () => {
    clearInterval(timer);
    oscs.forEach((o) => o.stop());
    ctx.close();
    navigator.vibrate?.(0);
  };
}

/* ---------- 선생님 AI 음성 (Gemini TTS → <audio>) ---------- */

let sharedAudio: HTMLAudioElement | null = null;

function audioEl(): HTMLAudioElement {
  sharedAudio ??= new Audio();
  return sharedAudio;
}

// 아주 짧은 무음 WAV — 사용자 제스처 안에서 한 번 재생해 iOS Safari 자동재생 제한을 푼다
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAAAA";

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const el = audioEl();
  el.src = SILENT_WAV;
  el.play().catch(() => {});
  if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
}

/**
 * fetchAudio 로 받은 음성을 재생하고, 없거나 실패하면 브라우저 음성(fallback)으로 읽는다.
 * 반환값으로 중단 가능.
 */
export function speakWithAudio(
  fetchAudio: (signal: AbortSignal) => Promise<Blob | null>,
  opts: { rate: number; onEnd: () => void; fallback: (onEnd: () => void) => () => void },
): () => void {
  const ctrl = new AbortController();
  let cancelled = false;
  let stopFallback: (() => void) | null = null;
  let url = "";
  const el = audioEl();

  const cleanup = () => {
    el.onended = null;
    el.onerror = null;
    if (url) URL.revokeObjectURL(url);
    url = "";
  };
  const done = () => {
    cleanup();
    if (!cancelled) opts.onEnd();
  };
  const useFallback = () => {
    cleanup();
    if (!cancelled) stopFallback = opts.fallback(opts.onEnd);
  };

  fetchAudio(ctrl.signal)
    .then((blob) => {
      if (cancelled) return;
      if (!blob) return useFallback();
      url = URL.createObjectURL(blob);
      el.src = url;
      el.playbackRate = opts.rate;
      el.onended = done;
      el.onerror = useFallback;
      return el.play().catch(useFallback);
    })
    .catch(() => {
      if (!ctrl.signal.aborted) useFallback();
    });

  return () => {
    cancelled = true;
    ctrl.abort();
    el.pause();
    cleanup();
    stopFallback?.();
  };
}
