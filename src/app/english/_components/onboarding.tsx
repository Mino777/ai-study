"use client";

import { useState } from "react";
import { TEACHERS } from "@/lib/english/catalog";
import { LEVELS, LEVEL_LABELS, type Level, type Profile } from "@/lib/english/types";

export function ProfileForm(props: { initial?: Profile | null; onSave: (p: Profile) => void; submitLabel: string }) {
  const i = props.initial;
  const [name, setName] = useState(i?.name ?? "");
  const [level, setLevel] = useState<Level>(i?.level ?? "intermediate");
  const [goal, setGoal] = useState(i?.goal ?? "");
  const [interests, setInterests] = useState(i?.interests ?? "");
  const [teacherId, setTeacherId] = useState(i?.teacherId ?? TEACHERS[0].id);
  const [callMinutes, setCallMinutes] = useState(i?.callMinutes ?? 10);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    props.onSave({
      name: name.trim(),
      level,
      goal: goal.trim(),
      interests: interests.trim(),
      teacherId,
      callMinutes,
      createdAt: i?.createdAt ?? new Date().toISOString(),
    });
  };

  const input =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]";

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm font-medium">선생님이 부를 이름 (영어 이름 OK)</span>
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mino" required />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">지금 내 회화 수준</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-2 py-2 text-xs ${
                level === l ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">통화를 할수록 선생님이 실제 수준을 추정해서 맞춰줘요.</p>
      </fieldset>

      <label className="block space-y-1">
        <span className="text-sm font-medium">영어 공부 목표</span>
        <input className={input} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="예: 외국계 이직 영어 면접, 해외여행에서 자연스럽게" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">관심사 · 나에 대해</span>
        <textarea
          className={`${input} min-h-20`}
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="예: iOS 개발자, 주식, 러닝, 강아지 키움"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">담당 선생님</legend>
        <div className="space-y-2">
          {TEACHERS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTeacherId(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                teacherId === t.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold"
                style={{ background: `${t.color}22`, color: t.color }}
              >
                {t.name[0]}
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {t.name} {t.flag} <span className="font-normal text-[var(--muted)]">· {t.origin}</span>
                </span>
                <span className="block text-xs text-[var(--muted)]">{t.intro}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">1회 통화 시간</legend>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setCallMinutes(m)}
              className={`flex-1 rounded-lg border py-2 text-sm ${
                callMinutes === m ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {m}분
            </button>
          ))}
        </div>
      </fieldset>

      <button className="w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-white hover:bg-[var(--accent-hover)]">
        {props.submitLabel}
      </button>
    </form>
  );
}

export function Onboarding(props: { onSave: (p: Profile) => void }) {
  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <p className="text-4xl">📞</p>
        <h1 className="text-2xl font-bold">나만의 원어민 전화영어</h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          선생님이 전화를 걸어오면 받아서 영어로 수다 떨면 돼요. 통화가 끝나면 교정·표현 리포트가 나오고,
          선생님은 나에 대해 들은 걸 <b className="text-[var(--text)]">계속 기억</b>해서 다음 통화를 이어가요.
        </p>
      </div>
      <ProfileForm onSave={props.onSave} submitLabel="시작하기" />
      <p className="text-xs text-[var(--muted)]">
        모든 기록은 이 브라우저에만 저장돼요. 대화 내용은 답변 생성을 위해 AI(Gemini)로 전송돼요.
      </p>
    </div>
  );
}
