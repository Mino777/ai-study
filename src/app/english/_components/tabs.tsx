"use client";

import { useRef, useState } from "react";
import { TOPICS, getTeacher, getTopic } from "@/lib/english/catalog";
import { LEVEL_LABELS, type TeacherMemory } from "@/lib/english/types";
import { MASTERED_AFTER_USES, callStreak, pickFocusExpressions, type EnglishState } from "../_lib/store";
import { isRecognitionSupported } from "../_lib/speech";
import { ProfileForm } from "./onboarding";
import { Card } from "./report-view";

/* ---------------- 홈 ---------------- */

export function HomeTab(props: { state: EnglishState; onCall: (topicId: string) => void; onOpenCall: (id: string) => void }) {
  const { state } = props;
  const profile = state.profile!;
  const teacher = getTeacher(profile.teacherId);
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const totalMin = Math.round(state.calls.reduce((s, c) => s + c.durationSec, 0) / 60);
  const streak = callStreak(state.calls);
  const focus = pickFocusExpressions(state);
  const lastCall = state.calls[0];
  const next = state.memory?.nextTopics ?? [];

  return (
    <div className="space-y-5 py-4">
      <div>
        <p className="text-sm text-[var(--muted)]">Hi, {profile.name} 👋</p>
        <h1 className="text-2xl font-bold">오늘도 {teacher.name}랑 통화해볼까요?</h1>
      </div>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Mini label="연속" value={`${streak}일`} />
        <Mini label="총 통화" value={`${state.calls.length}회`} />
        <Mini label="누적" value={`${totalMin}분`} />
      </section>

      {(next.length > 0 || lastCall?.report) && (
        <Card title={`🧠 ${teacher.name}가 기억하고 있어요`}>
          {lastCall?.report && <p className="mb-2 text-sm text-[var(--muted)]">지난 통화: {lastCall.report.summary}</p>}
          {next.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {next.slice(0, 3).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">오늘의 주제</h2>
        <div className="grid grid-cols-2 gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopicId(t.id)}
              className={`rounded-xl border p-3 text-left ${
                topicId === t.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <p className="text-sm font-semibold">
                {t.emoji} {t.title}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-[var(--muted)]">{t.description}</p>
            </button>
          ))}
        </div>
      </section>

      {focus.length > 0 && (
        <p className="text-xs text-[var(--muted)]">
          🎯 이번 통화에서 {teacher.name}가 써보게 유도할 표현: <span className="text-[var(--text)]">{focus.join(" · ")}</span>
        </p>
      )}

      {!isRecognitionSupported() && (
        <p className="rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3 text-xs">
          이 브라우저는 음성 인식을 지원하지 않아 키보드로 대화해요. 음성으로 하려면 Chrome·Edge·Safari를 써주세요.
        </p>
      )}

      <button
        onClick={() => props.onCall(topicId)}
        className="sticky bottom-20 w-full rounded-2xl bg-[var(--success)] py-4 text-lg font-bold text-white shadow-lg shadow-black/40"
      >
        📞 {teacher.name}에게 전화 받기 · {profile.callMinutes}분
      </button>

      {lastCall && (
        <button onClick={() => props.onOpenCall(lastCall.id)} className="w-full text-center text-xs text-[var(--muted)] underline">
          지난 통화 리포트 보기
        </button>
      )}
    </div>
  );
}

function Mini(p: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3">
      <p className="text-lg font-bold tabular-nums">{p.value}</p>
      <p className="text-xs text-[var(--muted)]">{p.label}</p>
    </div>
  );
}

/* ---------------- 기록 ---------------- */

export function HistoryTab(props: { state: EnglishState; onOpenCall: (id: string) => void }) {
  const { calls } = props.state;
  if (!calls.length) return <Empty text="아직 통화 기록이 없어요. 첫 통화를 걸어보세요!" />;
  return (
    <div className="space-y-2 py-4">
      <h1 className="mb-3 text-xl font-bold">통화 기록</h1>
      {calls.map((c) => {
        const t = getTeacher(c.teacherId);
        const topic = getTopic(c.topicId);
        return (
          <button
            key={c.id}
            onClick={() => props.onOpenCall(c.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left hover:bg-[var(--surface-hover)]"
          >
            <span className="text-2xl">{topic.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {topic.title} · {t.name} · {Math.max(1, Math.round(c.durationSec / 60))}분
              </span>
              <span className="block truncate text-xs text-[var(--muted)]">
                {c.report?.summary ?? "리포트 없음 — 눌러서 생성"}
              </span>
            </span>
            <span className="shrink-0 text-xs text-[var(--muted)]">
              {new Date(c.startedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              {c.report && <span className="block text-right font-semibold text-[var(--text)]">{c.report.fluency}점</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- 표현 노트 ---------------- */

export function NotesTab(props: { state: EnglishState; update: (fn: (s: EnglishState) => EnglishState) => void }) {
  const { expressions } = props.state;
  const [filter, setFilter] = useState<"learning" | "mastered">("learning");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const list = expressions.filter((e) => (filter === "mastered" ? e.mastered : !e.mastered));

  const toggleMastered = (id: string) =>
    props.update((s) => ({ ...s, expressions: s.expressions.map((e) => (e.id === id ? { ...e, mastered: !e.mastered } : e)) }));
  const remove = (id: string) => props.update((s) => ({ ...s, expressions: s.expressions.filter((e) => e.id !== id) }));

  return (
    <div className="space-y-3 py-4">
      <h1 className="text-xl font-bold">표현 노트</h1>
      <p className="text-xs text-[var(--muted)]">
        통화에서 배운 표현이 쌓여요. 아직 못 익힌 표현은 선생님이 다음 통화에서 자연스럽게 써보게 유도하고, 실제로{" "}
        {MASTERED_AFTER_USES}번 쓰면 자동으로 &lsquo;익힘&rsquo;이 돼요. 카드를 누르면 뜻이 보여요.
      </p>
      <div className="flex gap-2">
        {(["learning", "mastered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs ${filter === f ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-hover)]"}`}
          >
            {f === "learning" ? "익히는 중" : "익힘"} ({expressions.filter((e) => (f === "mastered" ? e.mastered : !e.mastered)).length})
          </button>
        ))}
      </div>
      {!list.length && <Empty text={filter === "learning" ? "통화를 하면 표현이 여기 쌓여요." : "아직 익힌 표현이 없어요."} />}
      {list.map((e) => {
        const open = revealed.has(e.id);
        return (
          <div key={e.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <button
              className="w-full text-left"
              onClick={() =>
                setRevealed((prev) => {
                  const n = new Set(prev);
                  if (n.has(e.id)) n.delete(e.id);
                  else n.add(e.id);
                  return n;
                })
              }
            >
              <p className="font-semibold">{e.expression}</p>
              {open ? (
                <>
                  <p className="text-sm text-[var(--muted)]">{e.meaning}</p>
                  <p className="text-sm italic">“{e.example}”</p>
                </>
              ) : (
                <p className="text-xs text-[var(--muted)]">뜻 보기</p>
              )}
            </button>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>통화에서 {e.usedCount}번 사용</span>
              <span className="flex gap-3">
                <button onClick={() => toggleMastered(e.id)} className="underline">
                  {e.mastered ? "다시 익히기" : "익힘 처리"}
                </button>
                <button onClick={() => remove(e.id)} className="underline">
                  삭제
                </button>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- 나 (선생님 메모리 + 설정) ---------------- */

const MEMORY_SECTIONS: { key: keyof Pick<TeacherMemory, "facts" | "interests" | "goals" | "recurringMistakes" | "nextTopics">; label: string }[] = [
  { key: "facts", label: "나에 대해 아는 것" },
  { key: "interests", label: "관심사" },
  { key: "goals", label: "목표" },
  { key: "recurringMistakes", label: "자주 하는 실수" },
  { key: "nextTopics", label: "다음에 물어볼 것" },
];

export function MeTab(props: { state: EnglishState; update: (fn: (s: EnglishState) => EnglishState) => void }) {
  const { state, update } = props;
  const teacher = getTeacher(state.profile!.teacherId);
  const mem = state.memory;
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const removeItem = (key: (typeof MEMORY_SECTIONS)[number]["key"], idx: number) =>
    update((s) => (s.memory ? { ...s, memory: { ...s.memory, [key]: s.memory[key].filter((_, i) => i !== idx) } } : s));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `english-call-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Partial<EnglishState>;
      if (!data.profile) throw new Error();
      update((s) => ({ ...s, ...data, settings: { ...s.settings, ...data.settings } }));
    } catch {
      alert("백업 파일을 읽지 못했어요.");
    }
  };

  return (
    <div className="space-y-5 py-4">
      <h1 className="text-xl font-bold">{teacher.name}가 기억하는 나</h1>

      {!mem ? (
        <Empty text="첫 통화가 끝나면 선생님이 나에 대해 기억하기 시작해요." />
      ) : (
        <>
          {mem.levelEstimate && (
            <p className="text-sm">
              선생님이 보는 내 레벨: <b>{LEVEL_LABELS[mem.levelEstimate]}</b>
            </p>
          )}
          {MEMORY_SECTIONS.map(({ key, label }) =>
            mem[key].length ? (
              <Card key={key} title={label}>
                <ul className="space-y-1 text-sm">
                  {mem[key].map((item, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span>• {item}</span>
                      <button onClick={() => removeItem(key, i)} className="shrink-0 text-xs text-[var(--muted)]" aria-label="잊게 하기">
                        잊기
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null,
          )}
          {mem.teacherNote && (
            <Card title="선생님 메모 (다음 통화용)">
              <p className="text-sm italic">{mem.teacherNote}</p>
            </Card>
          )}
          <p className="text-xs text-[var(--muted)]">
            마지막 갱신: {new Date(mem.updatedAt).toLocaleString("ko-KR")} · 틀린 내용은 &lsquo;잊기&rsquo;로 지우면 다음 통화부터 반영돼요.
          </p>
        </>
      )}

      <Card
        title="내 프로필 · 선생님"
        action={
          <button onClick={() => setEditing((v) => !v)} className="text-xs underline">
            {editing ? "닫기" : "수정"}
          </button>
        }
      >
        {editing ? (
          <ProfileForm
            initial={state.profile}
            submitLabel="저장"
            onSave={(p) => {
              update((s) => ({ ...s, profile: p }));
              setEditing(false);
            }}
          />
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {state.profile!.name} · {LEVEL_LABELS[state.profile!.level]} · {teacher.name} {teacher.flag} · {state.profile!.callMinutes}분
          </p>
        )}
      </Card>

      <Card title="통화 설정">
        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between">
            선생님 말 끝나면 자동으로 듣기
            <input
              type="checkbox"
              checked={state.settings.handsFree}
              onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, handsFree: e.target.checked } }))}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>
              말 끝 판단 대기 <span className="text-xs text-[var(--muted)]">(길수록 천천히 말해도 안 끊김)</span>
            </span>
            <select
              value={state.settings.silenceMs}
              onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, silenceMs: Number(e.target.value) } }))}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1"
            >
              {[1200, 1800, 2500, 3500].map((ms) => (
                <option key={ms} value={ms}>
                  {ms / 1000}초
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-3">
            접근 코드 <span className="text-xs text-[var(--muted)]">(서버에 설정된 경우만)</span>
            <input
              type="password"
              value={state.accessCode}
              onChange={(e) => update((s) => ({ ...s, accessCode: e.target.value }))}
              className="w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1"
            />
          </label>
        </div>
      </Card>

      <Card title="데이터">
        <p className="mb-3 text-xs text-[var(--muted)]">기록은 이 브라우저에만 있어요. 기기를 옮길 땐 백업 파일로 옮기세요.</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={exportData} className="rounded-lg bg-[var(--surface-hover)] px-3 py-1.5">
            백업 내보내기
          </button>
          <button onClick={() => fileRef.current?.click()} className="rounded-lg bg-[var(--surface-hover)] px-3 py-1.5">
            백업 불러오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
          <button
            onClick={() => {
              if (confirm("모든 기록과 선생님 기억을 지울까요? 되돌릴 수 없어요.")) {
                update((s) => ({ ...s, profile: null, memory: null, calls: [], expressions: [] }));
              }
            }}
            className="rounded-lg bg-[var(--error)]/20 px-3 py-1.5 text-[var(--error)]"
          >
            전체 초기화
          </button>
        </div>
      </Card>
    </div>
  );
}

function Empty(p: { text: string }) {
  return <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">{p.text}</p>;
}
