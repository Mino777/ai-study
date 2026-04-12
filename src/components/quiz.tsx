"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "@/lib/schema";
import {
  loadQuizState,
  saveQuizState,
  recordQuizAttempt,
  type QuizState,
} from "@/lib/quiz-storage";
import { trackEvent } from "@/lib/analytics";

interface QuizProps {
  slug: string;
  category: string;
  questions: QuizQuestion[];
}

type SelectionMap = Record<number, number | null>;

export function Quiz({ slug, category, questions }: QuizProps) {
  const [selections, setSelections] = useState<SelectionMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate previous state from localStorage
  useEffect(() => {
    const state = loadQuizState(slug);
    if (state) {
      setSelections(state.selections);
      setSubmitted(state.submitted);
    }
    setHydrated(true);
  }, [slug]);

  const allAnswered = useMemo(
    () => questions.every((_, i) => selections[i] !== null && selections[i] !== undefined),
    [questions, selections]
  );

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    questions.forEach((q, i) => {
      if (selections[i] === q.answer) correct += 1;
    });
    return correct;
  }, [submitted, questions, selections]);

  function handleSelect(qIdx: number, choiceIdx: number) {
    if (submitted) return;
    setSelections((prev) => ({ ...prev, [qIdx]: choiceIdx }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q, i) => {
      if (selections[i] === q.answer) correct += 1;
    });
    trackEvent("quiz_answer", {
      slug,
      score: correct,
      total: questions.length,
      percent: Math.round((correct / questions.length) * 100),
    });
    const state: QuizState = {
      selections,
      submitted: true,
      lastAttemptAt: new Date().toISOString(),
      score: correct,
      total: questions.length,
    };
    saveQuizState(slug, state);
    recordQuizAttempt({
      slug,
      category,
      score: correct,
      total: questions.length,
      at: state.lastAttemptAt,
    });
  }

  function handleReset() {
    setSelections({});
    setSubmitted(false);
    setShowExplanations({});
    saveQuizState(slug, null);
  }

  function toggleExplanation(qIdx: number) {
    setShowExplanations((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
  }

  if (!hydrated) {
    return (
      <div className="mt-12 rounded-[var(--radius-md)] border border-border bg-surface p-6">
        <p className="text-sm text-muted">퀴즈 로딩 중…</p>
      </div>
    );
  }

  const scorePercent = submitted ? Math.round((score / questions.length) * 100) : 0;
  const scoreColor =
    scorePercent >= 80
      ? "var(--success)"
      : scorePercent >= 50
        ? "var(--warning)"
        : "var(--error)";

  return (
    <section
      aria-labelledby={`quiz-${slug}`}
      className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8"
    >
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3
            id={`quiz-${slug}`}
            className="font-display text-xl font-bold flex items-center gap-2"
          >
            <span aria-hidden>🧠</span> 자가 점검 퀴즈
          </h3>
          <p className="mt-1 text-sm text-muted">
            {questions.length}문항 · 즉시 채점 · 결과는 브라우저에 저장됩니다
          </p>
        </div>
        {submitted && (
          <div
            className="rounded-[var(--radius-md)] px-3 py-2 text-right"
            style={{
              background: `color-mix(in srgb, ${scoreColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${scoreColor} 40%, transparent)`,
            }}
          >
            <div className="font-code text-2xl font-bold" style={{ color: scoreColor }}>
              {score}/{questions.length}
            </div>
            <div className="text-xs text-muted">{scorePercent}%</div>
          </div>
        )}
      </header>

      <ol className="space-y-6">
        {questions.map((q, qIdx) => {
          const selected = selections[qIdx];
          const isCorrect = submitted && selected === q.answer;
          return (
            <li key={qIdx} className="space-y-3">
              <p className="font-medium">
                <span className="font-code text-muted mr-2">Q{qIdx + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.choices.map((choice, cIdx) => {
                  const isSelected = selected === cIdx;
                  const isAnswer = q.answer === cIdx;
                  let stateClass = "border-border hover:border-accent";
                  if (submitted) {
                    if (isAnswer) {
                      stateClass = "border-success/60 bg-success/10";
                    } else if (isSelected) {
                      stateClass = "border-error/60 bg-error/10";
                    } else {
                      stateClass = "border-border opacity-60";
                    }
                  } else if (isSelected) {
                    stateClass = "border-accent bg-accent/10";
                  }
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, cIdx)}
                      className={`w-full rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm transition-colors ${stateClass} ${submitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="font-code text-muted mr-2">
                        {String.fromCharCode(65 + cIdx)}.
                      </span>
                      {choice}
                      {submitted && isAnswer && (
                        <span className="ml-2 text-xs font-semibold text-success">
                          ✓ 정답
                        </span>
                      )}
                      {submitted && isSelected && !isAnswer && (
                        <span className="ml-2 text-xs font-semibold text-error">
                          ✗ 오답
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(qIdx)}
                    className="text-xs font-code text-accent hover:underline"
                  >
                    {showExplanations[qIdx] ? "해설 숨기기" : "해설 보기"}
                  </button>
                  {showExplanations[qIdx] && (
                    <div
                      className="mt-2 rounded-[var(--radius-sm)] border-l-2 px-3 py-2 text-sm text-muted"
                      style={{
                        borderLeftColor: isCorrect ? "var(--success)" : "var(--accent)",
                        background: "color-mix(in srgb, var(--accent) 4%, transparent)",
                      }}
                    >
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <footer className="mt-6 flex items-center justify-between gap-4">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            제출하고 채점
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            다시 풀기
          </button>
        )}
        <p className="text-xs text-muted">
          {submitted
            ? scorePercent >= 80
              ? "훌륭합니다! 다음 엔트리로 넘어가셔도 좋아요."
              : scorePercent >= 50
                ? "절반 이상 맞췄습니다. 해설을 확인해 보세요."
                : "본문을 한 번 더 읽고 다시 풀어보세요."
            : `${Object.values(selections).filter((v) => v !== null && v !== undefined).length}/${questions.length} 응답`}
        </p>
      </footer>
    </section>
  );
}
