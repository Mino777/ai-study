"use client";

import { getTeacher, getTopic } from "@/lib/english/catalog";
import { LEVEL_LABELS, type CallRecord } from "@/lib/english/types";
import { SayIt } from "./say-it";

export function ReportView(props: {
  call: CallRecord;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onClose: () => void;
  showTranscript?: boolean;
}) {
  const { call } = props;
  const teacher = getTeacher(call.teacherId);
  const topic = getTopic(call.topicId);
  const r = call.report;
  const mins = Math.max(1, Math.round(call.durationSec / 60));
  const learnerTurns = call.turns.filter((t) => t.role === "learner").length;

  return (
    <div className="space-y-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--muted)]">
            {new Date(call.startedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <h2 className="text-xl font-bold">
            {topic.emoji} {teacher.name}와 {mins}분 통화
          </h2>
          <p className="text-xs text-[var(--muted)]">내 발화 {learnerTurns}회</p>
        </div>
        <button onClick={props.onClose} className="rounded-lg bg-[var(--surface-hover)] px-3 py-1.5 text-sm">
          닫기
        </button>
      </div>

      {props.loading && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          {teacher.name} 선생님이 오늘 통화 노트를 쓰고 있어요…
        </div>
      )}

      {!props.loading && !r && (
        <div className="rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-4 text-sm">
          <p>{props.error || "아직 리포트가 없어요."}</p>
          <button onClick={props.onRetry} className="mt-2 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-white">
            리포트 만들기
          </button>
        </div>
      )}

      {r && (
        <>
          <section className="grid grid-cols-2 gap-3">
            <Stat label="스피킹 점수" value={`${r.fluency}`} sub="/100" />
            <Stat label="추정 레벨" value={LEVEL_LABELS[r.levelEstimate]} />
          </section>

          <Card title="📝 오늘의 통화">
            <p className="text-sm leading-relaxed">{r.summary}</p>
          </Card>

          {r.strengths.length > 0 && (
            <Card title="👍 잘한 점">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {r.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Card>
          )}

          {r.corrections.length > 0 && (
            <Card title="✏️ 이렇게 말하면 더 자연스러워요 — 소리 내어 따라 해보세요">
              <ul className="space-y-3">
                {r.corrections.map((c, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-[var(--muted)] line-through">{c.original}</p>
                    <p className="font-medium text-[var(--success)]">→ {c.better}</p>
                    <p className="text-xs text-[var(--muted)]">{c.explanation}</p>
                    <div className="mt-1">
                      <SayIt target={c.better} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {r.expressions.length > 0 && (
            <Card title="💬 새 표현 (노트에 저장됨 — 다음 통화에서 써보게 유도해요)">
              <ul className="space-y-3">
                {r.expressions.map((e, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-semibold">{e.expression}</p>
                    <p className="text-xs text-[var(--muted)]">{e.meaning}</p>
                    <p className="text-xs italic">“{e.example}”</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {r.usedFocusExpressions.length > 0 && (
            <Card title="🎯 지난번 배운 표현을 실제로 썼어요">
              <p className="text-sm">{r.usedFocusExpressions.join(", ")}</p>
            </Card>
          )}

          {r.nextTimeTip && (
            <Card title="➡️ 다음 통화 팁">
              <p className="text-sm">{r.nextTimeTip}</p>
            </Card>
          )}
        </>
      )}

      {props.showTranscript !== false && call.turns.length > 0 && (
        <details className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <summary className="cursor-pointer text-sm font-semibold">대본 전체 보기</summary>
          <div className="mt-3 space-y-2 text-sm">
            {call.turns.map((t, i) => (
              <p key={i}>
                <b className={t.role === "teacher" ? "" : "text-[var(--accent)]"}>{t.role === "teacher" ? teacher.name : "나"}:</b>{" "}
                {t.text}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Stat(p: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--muted)]">{p.label}</p>
      <p className="text-xl font-bold tabular-nums">
        {p.value}
        {p.sub && <span className="text-sm font-normal text-[var(--muted)]">{p.sub}</span>}
      </p>
    </div>
  );
}

export function Card(p: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{p.title}</h3>
        {p.action}
      </div>
      {p.children}
    </section>
  );
}
