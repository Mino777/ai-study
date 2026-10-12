"use client";

import { useState } from "react";
import type { CallRecord } from "@/lib/english/types";
import { ApiError, summarizeApi } from "./_lib/api";
import { applyReport, pickFocusExpressions, recentSummaries, saveCall, useEnglishStore } from "./_lib/store";
import { CallScreen } from "./_components/call-screen";
import { Onboarding } from "./_components/onboarding";
import { ReportView } from "./_components/report-view";
import { HistoryTab, HomeTab, MeTab, NotesTab } from "./_components/tabs";

type Tab = "home" | "history" | "notes" | "me";
type View = { kind: "tab"; tab: Tab } | { kind: "call"; topicId: string } | { kind: "report"; callId: string };

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "home", label: "홈", icon: "📞" },
  { key: "history", label: "기록", icon: "🗂" },
  { key: "notes", label: "표현노트", icon: "💬" },
  { key: "me", label: "나", icon: "🧠" },
];

export default function EnglishCallPage() {
  const { state, ready, update } = useEnglishStore();
  const [view, setView] = useState<View>({ kind: "tab", tab: "home" });
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [reportError, setReportError] = useState("");
  const [needCode, setNeedCode] = useState(false);

  if (!ready) return <div className="min-h-screen bg-[var(--bg)]" />;

  if (!state.profile) {
    return (
      <Shell>
        <Onboarding onSave={(profile) => update((s) => ({ ...s, profile }))} />
      </Shell>
    );
  }

  const summarize = async (call: CallRecord) => {
    setSummarizing(call.id);
    setReportError("");
    try {
      const res = await summarizeApi(
        {
          profile: state.profile!,
          memory: state.memory,
          topicId: call.topicId,
          turns: call.turns,
          focusExpressions: pickFocusExpressions(state),
        },
        state.accessCode,
      );
      update((s) => applyReport(s, call.id, res.report, res.memory));
    } catch (e) {
      if (e instanceof ApiError && e.code === "ACCESS_CODE") setNeedCode(true);
      setReportError(e instanceof Error ? e.message : "리포트 생성 실패");
    } finally {
      setSummarizing(null);
    }
  };

  const onCallEnd = (call: CallRecord | null) => {
    if (!call) {
      setView({ kind: "tab", tab: "home" });
      return;
    }
    update((s) => saveCall(s, call));
    setView({ kind: "report", callId: call.id });
    summarize(call);
  };

  if (view.kind === "call") {
    return (
      <>
        <CallScreen
          profile={state.profile}
          memory={state.memory}
          topicId={view.topicId}
          focusExpressions={pickFocusExpressions(state)}
          recentSummaries={recentSummaries(state)}
          accessCode={state.accessCode}
          settings={state.settings}
          onSettings={(patch) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))}
          onNeedAccessCode={() => setNeedCode(true)}
          onEnd={onCallEnd}
        />
        {needCode && <AccessCodeModal value={state.accessCode} onSave={(code) => { update((s) => ({ ...s, accessCode: code })); setNeedCode(false); }} />}
      </>
    );
  }

  const activeTab = view.kind === "tab" ? view.tab : "history";
  const reportCall = view.kind === "report" ? state.calls.find((c) => c.id === view.callId) : undefined;

  return (
    <Shell>
      {view.kind === "report" && reportCall ? (
        <ReportView
          call={reportCall}
          loading={summarizing === reportCall.id}
          error={reportError}
          onRetry={() => summarize(reportCall)}
          onClose={() => setView({ kind: "tab", tab: "home" })}
        />
      ) : activeTab === "home" ? (
        <HomeTab
          state={state}
          onCall={(topicId) => setView({ kind: "call", topicId })}
          onOpenCall={(callId) => setView({ kind: "report", callId })}
        />
      ) : activeTab === "history" ? (
        <HistoryTab state={state} onOpenCall={(callId) => setView({ kind: "report", callId })} />
      ) : activeTab === "notes" ? (
        <NotesTab state={state} update={update} />
      ) : (
        <MeTab state={state} update={update} />
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-md justify-around py-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setView({ kind: "tab", tab: t.key })}
              className={`flex flex-col items-center gap-0.5 px-3 text-xs ${
                view.kind === "tab" && view.tab === t.key ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {needCode && <AccessCodeModal value={state.accessCode} onSave={(code) => { update((s) => ({ ...s, accessCode: code })); setNeedCode(false); }} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-md px-4 pb-24">{children}</div>
    </main>
  );
}

function AccessCodeModal(p: { value: string; onSave: (code: string) => void }) {
  const [code, setCode] = useState(p.value);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          p.onSave(code.trim());
        }}
        className="w-full max-w-sm space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 className="font-semibold">접근 코드</h2>
        <p className="text-sm text-[var(--muted)]">이 서비스는 접근 코드가 있어야 선생님과 통화할 수 있어요.</p>
        <input
          autoFocus
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button className="w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-semibold text-white">저장 후 다시 시도</button>
      </form>
    </div>
  );
}
