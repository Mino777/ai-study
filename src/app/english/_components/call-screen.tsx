"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getTeacher, getTopic } from "@/lib/english/catalog";
import type { CallPhase, CallRecord, ChatResponse, Profile, TeacherMemory, Turn } from "@/lib/english/types";
import { ApiError, chatApi } from "../_lib/api";
import type { EnglishState } from "../_lib/store";
import { isRecognitionSupported, listenOnce, pickVoice, speak, startRingtone, useVoices } from "../_lib/speech";

type Status = "ringing" | "connecting" | "speaking" | "listening" | "idle" | "thinking" | "ended";

interface Props {
  profile: Profile;
  memory: TeacherMemory | null;
  topicId: string;
  focusExpressions: string[];
  recentSummaries: string[];
  accessCode: string;
  settings: EnglishState["settings"];
  onSettings: (s: Partial<EnglishState["settings"]>) => void;
  onNeedAccessCode: () => void;
  onEnd: (call: CallRecord | null) => void;
}

function fmt(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

export function CallScreen(props: Props) {
  const { profile, settings } = props;
  const teacher = getTeacher(profile.teacherId);
  const topic = getTopic(props.topicId);
  const voices = useVoices();
  const voice = pickVoice(voices, teacher);
  const sttSupported = isRecognitionSupported();

  const [status, setStatus] = useState<Status>("ringing");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [interim, setInterim] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [typing, setTyping] = useState(!sttSupported);
  const [draft, setDraft] = useState("");

  // 비동기 콜백에서 최신 값을 읽기 위한 ref
  const turnsRef = useRef<Turn[]>([]);
  const startedAtRef = useRef<number>(0);
  const closingRef = useRef(false);
  const endedRef = useRef(false);
  const stopSpeakRef = useRef<() => void>(() => {});
  const listenerRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const openingRef = useRef<Promise<ChatResponse> | null>(null);
  const settingsRef = useRef(settings);
  const propsRef = useRef(props);
  const voiceRef = useRef(voice);

  const timeUp = elapsed >= profile.callMinutes * 60;
  const timeUpRef = useRef(false);

  const setAllTurns = (next: Turn[]) => {
    turnsRef.current = next;
    setTurns(next);
  };

  const requestTeacher = useCallback((phase: CallPhase): Promise<ChatResponse> => {
    const p = propsRef.current;
    return chatApi(
      {
        profile: p.profile,
        memory: p.memory,
        topicId: p.topicId,
        turns: turnsRef.current,
        phase,
        elapsedSec: startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : 0,
        focusExpressions: p.focusExpressions,
        recentSummaries: p.recentSummaries,
      },
      p.accessCode,
    );
  }, []);

  const finishCall = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    stopSpeakRef.current();
    listenerRef.current?.abort();
    setStatus("ended");
    const learnerSpoke = turnsRef.current.some((t) => t.role === "learner");
    propsRef.current.onEnd(
      learnerSpoke
        ? {
            id: crypto.randomUUID(),
            startedAt: new Date(startedAtRef.current || Date.now()).toISOString(),
            durationSec: Math.round((Date.now() - startedAtRef.current) / 1000),
            teacherId: propsRef.current.profile.teacherId,
            topicId: propsRef.current.topicId,
            turns: turnsRef.current,
          }
        : null,
    );
  }, []);

  // listen ↔ teacherSay 가 서로를 부르므로 ref 로 연결
  const listenRef = useRef<() => void>(() => {});

  const speakReply = useCallback(
    (text: string, isClosing: boolean) => {
      // 이전 발화 체인을 먼저 끊어야 cancel 의 onerror 가 옛 체인을 이어가지 않는다
      stopSpeakRef.current();
      setStatus("speaking");
      stopSpeakRef.current = speak(text, {
        voice: voiceRef.current,
        lang: teacher.voiceLang,
        rate: settingsRef.current.speechRate,
        onEnd: () => {
          if (endedRef.current) return;
          if (isClosing) {
            setTimeout(finishCall, 600);
            return;
          }
          if (settingsRef.current.handsFree && sttSupported) listenRef.current();
          else setStatus("idle");
        },
      });
    },
    [finishCall, sttSupported, teacher.voiceLang],
  );

  const teacherSay = useCallback(
    (res: ChatResponse, isClosing: boolean) => {
      if (endedRef.current) return;
      const prev = [...turnsRef.current];
      // 교정은 직전 학습자 발화에 붙인다
      const lastIdx = prev.length - 1;
      if (res.corrections.length && lastIdx >= 0 && prev[lastIdx].role === "learner") {
        prev[lastIdx] = { ...prev[lastIdx], corrections: res.corrections };
      }
      setAllTurns([...prev, { role: "teacher", text: res.reply, at: Date.now() }]);
      setSuggestion(res.suggestion);
      setShowHint(false);
      speakReply(res.reply, isClosing);
    },
    [speakReply],
  );

  const handleError = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.code === "ACCESS_CODE") propsRef.current.onNeedAccessCode();
    setError(e instanceof Error ? e.message : "연결 오류");
    setStatus("idle");
  }, []);

  const sendLearner = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || endedRef.current) return;
      setInterim("");
      setError("");
      setAllTurns([...turnsRef.current, { role: "learner", text: clean, at: Date.now() }]);
      setStatus("thinking");
      const closing = timeUpRef.current && !closingRef.current;
      if (closing) closingRef.current = true;
      try {
        const res = await requestTeacher(closing ? "closing" : "turn");
        teacherSay(res, closing);
      } catch (e) {
        if (closing) closingRef.current = false;
        handleError(e);
      }
    },
    [handleError, requestTeacher, teacherSay],
  );

  const listen = useCallback(() => {
    if (endedRef.current) return;
    listenerRef.current?.abort();
    setInterim("");
    setStatus("listening");
    listenerRef.current = listenOnce({
      silenceMs: settingsRef.current.silenceMs,
      onInterim: setInterim,
      onDone: (text) => {
        listenerRef.current = null;
        if (endedRef.current) return;
        if (text) sendLearner(text);
        else setStatus("idle");
      },
      onError: (err) => {
        listenerRef.current = null;
        if (err === "not-allowed" || err === "service-not-allowed") {
          setError("마이크 권한이 막혀 있어요. 주소창의 권한 설정을 확인하거나 키보드로 답해주세요.");
          setTyping(true);
        } else {
          setError(`음성 인식 오류 (${err}) — 마이크 버튼을 다시 눌러주세요.`);
        }
        setStatus("idle");
      },
    });
  }, [sendLearner]);

  // 비동기 콜백(음성 onend 등)이 항상 최신 값을 보도록 렌더 후 ref 동기화
  useLayoutEffect(() => {
    settingsRef.current = settings;
    propsRef.current = props;
    voiceRef.current = voice;
    timeUpRef.current = timeUp;
    listenRef.current = listen;
  });

  // 수신 화면: 벨소리 + 오프닝 미리 요청 (받는 순간 바로 말하도록)
  useEffect(() => {
    const stopRing = startRingtone();
    openingRef.current = requestTeacher("opening");
    openingRef.current.catch(() => {});
    return () => {
      stopRing();
    };
  }, [requestTeacher]);

  // 통화 중 타이머
  useEffect(() => {
    if (status === "ringing" || status === "ended") return;
    const id = setInterval(() => setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000)), 500);
    return () => clearInterval(id);
  }, [status]);

  // 언마운트 시 음성 정리
  useEffect(() => {
    // StrictMode 의 mount→cleanup→mount 에서 cleanup 이 남긴 종료 표시를 되돌린다
    endedRef.current = false;
    return () => {
      endedRef.current = true;
      stopSpeakRef.current();
      listenerRef.current?.abort();
    };
  }, []);

  const accept = async () => {
    startedAtRef.current = Date.now();
    setStatus("connecting");
    // 일부 브라우저는 사용자 제스처 안에서 한 번 speak 해야 이후 발화가 허용됨
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    try {
      const res = await (openingRef.current ?? requestTeacher("opening"));
      teacherSay(res, false);
    } catch (e) {
      openingRef.current = null;
      handleError(e);
    }
  };

  const retryOpening = async () => {
    setError("");
    setStatus("thinking");
    try {
      const hasTeacher = turnsRef.current.some((t) => t.role === "teacher");
      const last = turnsRef.current[turnsRef.current.length - 1];
      if (!hasTeacher) teacherSay(await requestTeacher("opening"), false);
      else if (last?.role === "learner") {
        const closing = timeUpRef.current;
        if (closing) closingRef.current = true;
        teacherSay(await requestTeacher(closing ? "closing" : "turn"), closing);
      } else setStatus("idle");
    } catch (e) {
      handleError(e);
    }
  };

  const micPress = () => {
    if (status === "listening") listenerRef.current?.stop();
    else if (status === "speaking") {
      stopSpeakRef.current();
      listen();
    } else if (status === "idle") listen();
  };

  const replay = () => {
    const last = [...turnsRef.current].reverse().find((t) => t.role === "teacher");
    if (!last || status === "thinking") return;
    listenerRef.current?.abort();
    speakReply(last.text, closingRef.current);
  };

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "thinking" || status === "ringing" || status === "connecting") return;
    stopSpeakRef.current();
    listenerRef.current?.abort();
    const text = draft;
    setDraft("");
    sendLearner(text);
  };

  /* ---------- 수신 화면 ---------- */
  if (status === "ringing") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-gradient-to-b from-[#0a0a0f] to-[#141428] px-6 py-16 text-[var(--text)]">
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-[var(--muted)]">전화영어 · {topic.emoji} {topic.title}</p>
          <div
            className="relative flex h-32 w-32 items-center justify-center rounded-full text-5xl font-bold"
            style={{ background: `${teacher.color}22`, color: teacher.color }}
          >
            <span className="absolute inset-0 animate-ping rounded-full" style={{ background: `${teacher.color}22` }} />
            {teacher.name[0]}
          </div>
          <h1 className="text-3xl font-bold">{teacher.name} {teacher.flag}</h1>
          <p className="text-[var(--muted)]">수신 전화 · {teacher.origin}</p>
        </div>
        <div className="flex w-full max-w-xs justify-between">
          <button onClick={() => props.onEnd(null)} className="flex flex-col items-center gap-2 text-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)] text-2xl">✕</span>
            거절
          </button>
          <button onClick={accept} className="flex flex-col items-center gap-2 text-sm">
            <span className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-[var(--success)] text-2xl">✆</span>
            받기
          </button>
        </div>
      </div>
    );
  }

  /* ---------- 통화 중 ---------- */
  const statusLabel: Record<Status, string> = {
    ringing: "",
    connecting: "연결 중…",
    speaking: `${teacher.name} 말하는 중`,
    listening: "듣고 있어요 — 말해보세요",
    idle: sttSupported && !typing ? "마이크를 눌러 말하기" : "키보드로 답해보세요",
    thinking: `${teacher.name} 생각 중…`,
    ended: "통화 종료",
  };
  const remaining = profile.callMinutes * 60 - elapsed;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-[#0a0a0f] to-[#141428] text-[var(--text)]">
      {/* 상단: 선생님 + 타이머 */}
      <header className="flex flex-col items-center gap-1 px-4 pt-6 pb-3">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold transition-transform ${
            status === "speaking" ? "scale-110" : ""
          }`}
          style={{
            background: `${teacher.color}22`,
            color: teacher.color,
            boxShadow: status === "speaking" ? `0 0 0 8px ${teacher.color}33, 0 0 40px ${teacher.color}55` : "none",
          }}
        >
          {teacher.name[0]}
        </div>
        <p className="mt-1 text-lg font-semibold">{teacher.name} {teacher.flag}</p>
        <p className="font-mono text-sm tabular-nums text-[var(--muted)]">
          {fmt(elapsed)}
          <span className={remaining <= 60 ? "text-[var(--warning)]" : ""}>
            {" "}
            · {timeUp ? "마무리 중" : `${fmt(Math.max(0, remaining))} 남음`}
          </span>
        </p>
        <p className="text-xs text-[var(--muted)]">{statusLabel[status]}</p>
      </header>

      {/* 자막 / 대본 */}
      <Transcript turns={turns} interim={status === "listening" ? interim : ""} captions={settings.captions} teacherName={teacher.name} />

      {/* 힌트 · 에러 */}
      <div className="px-4">
        {error && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-[var(--error)]/40 bg-[var(--error)]/10 px-3 py-2 text-sm">
            <span>{error}</span>
            <button onClick={retryOpening} className="shrink-0 rounded-md bg-[var(--surface-hover)] px-2 py-1 text-xs">
              다시 시도
            </button>
          </div>
        )}
        {showHint && suggestion && (
          <div className="mb-2 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-sm">
            <span className="mr-1 text-xs text-[var(--muted)]">이렇게 말해볼까요?</span>
            {suggestion}
          </div>
        )}
      </div>

      {typing && (
        <form onSubmit={submitDraft} className="flex gap-2 px-4 pb-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="영어로 입력…"
            className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button className="rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white">보내기</button>
        </form>
      )}

      {/* 컨트롤 */}
      <footer className="grid grid-cols-5 items-end gap-2 px-4 pt-2 pb-8 text-xs text-[var(--muted)]">
        <CtrlButton label="자막" active={settings.captions} onClick={() => props.onSettings({ captions: !settings.captions })} icon="CC" />
        <CtrlButton label="힌트" active={showHint} onClick={() => setShowHint((v) => !v)} icon="💡" disabled={!suggestion} />
        {sttSupported ? (
          <button onClick={micPress} disabled={status === "thinking" || status === "connecting"} className="flex flex-col items-center gap-1 disabled:opacity-40">
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                status === "listening" ? "animate-pulse bg-[var(--accent)] text-white" : "bg-[var(--surface-hover)]"
              }`}
            >
              🎙
            </span>
            {status === "listening" ? "말 끝내기" : status === "speaking" ? "끊고 말하기" : "말하기"}
          </button>
        ) : (
          <span className="text-center">음성 인식 미지원 브라우저</span>
        )}
        <CtrlButton label="다시 듣기" onClick={replay} icon="↻" disabled={status === "thinking" || !turns.length} />
        <CtrlButton label={typing ? "키보드 닫기" : "키보드"} active={typing} onClick={() => setTyping((v) => !v)} icon="⌨" />
      </footer>

      <div className="flex items-center justify-center gap-6 pb-8">
        <button
          onClick={() => props.onSettings({ handsFree: !settings.handsFree })}
          className="text-xs text-[var(--muted)] underline-offset-2 hover:underline"
        >
          자동 듣기 {settings.handsFree ? "ON" : "OFF"}
        </button>
        <button
          onClick={finishCall}
          aria-label="통화 종료"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--error)] text-xl text-white"
        >
          ✕
        </button>
        <button
          onClick={() => props.onSettings({ speechRate: settings.speechRate >= 1 ? 0.8 : 1 })}
          className="text-xs text-[var(--muted)] underline-offset-2 hover:underline"
        >
          말 속도 {settings.speechRate >= 1 ? "보통" : "느리게"}
        </button>
      </div>
    </div>
  );
}

function CtrlButton(p: { label: string; icon: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button onClick={p.onClick} disabled={p.disabled} className="flex flex-col items-center gap-1 disabled:opacity-30">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-base ${
          p.active ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-hover)]"
        }`}
      >
        {p.icon}
      </span>
      {p.label}
    </button>
  );
}

function Transcript(p: { turns: Turn[]; interim: string; captions: boolean; teacherName: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [p.turns, p.interim]);

  if (!p.captions) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-[var(--muted)]">
        자막 꺼짐 — 진짜 전화처럼 귀로만 들어보세요
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
      {p.turns.map((t, i) => (
        <div key={i} className={`flex flex-col ${t.role === "learner" ? "items-end" : "items-start"}`}>
          <div
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-[15px] leading-relaxed ${
              t.role === "learner" ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)]"
            }`}
          >
            {t.text}
          </div>
          {t.corrections?.map((c, j) => (
            <div key={j} className="mt-1 max-w-[85%] rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-2 py-1 text-xs">
              <span className="text-[var(--muted)] line-through">{c.original}</span> →{" "}
              <span className="font-medium text-[var(--warning)]">{c.better}</span>
              <span className="block text-[var(--muted)]">{c.explanation}</span>
            </div>
          ))}
        </div>
      ))}
      {p.interim && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl border border-dashed border-[var(--accent)] px-3 py-2 text-[15px] text-[var(--muted)]">
            {p.interim}…
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
