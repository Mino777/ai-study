"use client";

import { useEffect, useRef, useState } from "react";
import { PASS_SCORE, speechMatchScore } from "../_lib/match";
import { isRecognitionSupported, listenOnce } from "../_lib/speech";

type Result = { heard: string; score: number } | null;

/** 🎙 버튼을 누르고 target 을 말하면 채점. 통과 시 onPass 호출 */
export function SayIt(props: { target: string; label?: string; onPass?: () => void; onResult?: (passed: boolean) => void }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState("");
  const stopRef = useRef<{ abort: () => void } | null>(null);

  useEffect(() => () => stopRef.current?.abort(), []);

  if (!isRecognitionSupported()) return null;

  const start = () => {
    setResult(null);
    setError("");
    setInterim("");
    setListening(true);
    stopRef.current = listenOnce({
      silenceMs: 1200,
      onInterim: setInterim,
      onDone: (heard) => {
        setListening(false);
        if (!heard) return setError("못 들었어요. 다시 눌러 말해보세요.");
        const score = speechMatchScore(props.target, heard);
        setResult({ heard, score });
        const passed = score >= PASS_SCORE;
        props.onResult?.(passed);
        if (passed) props.onPass?.();
      },
      onError: (e) => {
        setListening(false);
        setError(e === "not-allowed" ? "마이크 권한이 필요해요." : `음성 인식 오류 (${e})`);
      },
    });
  };

  const passed = result && result.score >= PASS_SCORE;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={
          listening
            ? () => {
                stopRef.current?.abort();
                setListening(false);
              }
            : start
        }
        className={`rounded-full px-3 py-1 text-xs ${
          listening ? "animate-pulse bg-[var(--accent)] text-white" : "bg-[var(--surface-hover)]"
        }`}
      >
        🎙 {listening ? "듣는 중… (누르면 취소)" : (props.label ?? "따라 말하기")}
      </button>
      {listening && interim && <p className="text-xs text-[var(--muted)]">{interim}…</p>}
      {result && (
        <p className={`text-xs ${passed ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
          {passed ? "✅ 좋아요!" : `🔁 ${Math.round(result.score * 100)}% — 다시 해볼까요?`}{" "}
          <span className="text-[var(--muted)]">들린 말: “{result.heard}”</span>
        </p>
      )}
      {error && <p className="text-xs text-[var(--warning)]">{error}</p>}
    </div>
  );
}
