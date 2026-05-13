"use client";

import { useEffect, useState, useMemo } from "react";
import {
  PRINCIPLES,
  PRINCIPLE_DETAILS,
  BUY_CHECKLIST,
  SELL_CHECKLIST,
  QUIZ_BANK,
  FLASHCARDS,
  SAMPLE_PORTFOLIOS,
  KR_SECTORS,
  WIFE_MESSAGE,
  type QuizItem,
} from "./constants";
import { MASTERS } from "./masters";
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory } from "./glossary";

const STORAGE = {
  buyCheck: "stock-buy-checklist",
  sellCheck: "stock-sell-checklist",
  quizHistory: "stock-quiz-history",
  quizSelection: "stock-quiz-selection",
  flashRevealed: "stock-flash-revealed",
  flashHard: "stock-flash-hard",
};

type TabKey = "overview" | "daily" | "p1" | "p2" | "p3" | "p4" | "p5" | "crash" | "swing" | "timing" | "masters" | "glossary" | "quiz" | "flash";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "overview", label: "시작", emoji: "✨" },
  { key: "daily", label: "매일 체크", emoji: "🔗" },
  { key: "p1", label: "큰 그림", emoji: "🌍" },
  { key: "p2", label: "EPS 추세", emoji: "📈" },
  { key: "p3", label: "거래대금", emoji: "💰" },
  { key: "p4", label: "파생 신호", emoji: "🎯" },
  { key: "p5", label: "분산 룰", emoji: "🧺" },
  { key: "crash", label: "폭락 매뉴얼", emoji: "🚨" },
  { key: "swing", label: "스윙 매매", emoji: "⚡" },
  { key: "timing", label: "타이밍 매트릭스", emoji: "⏱️" },
  { key: "masters", label: "투자 거장", emoji: "👑" },
  { key: "glossary", label: "용어 사전", emoji: "📖" },
  { key: "quiz", label: "퀴즈", emoji: "❓" },
  { key: "flash", label: "플래시카드", emoji: "🃏" },
];

export default function StockPage() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [mounted, setMounted] = useState(false);

  // Checklist state
  const [buyChecked, setBuyChecked] = useState<Record<string, boolean>>({});
  const [sellChecked, setSellChecked] = useState<Record<string, boolean>>({});

  // Quiz state
  const [quizFilter, setQuizFilter] = useState<number | "all">("all");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelection, setQuizSelection] = useState<Record<string, number>>({});
  const [quizHistory, setQuizHistory] = useState<Record<string, { correct: boolean; date: string }>>({});

  // Flashcard state
  const [flashFilter, setFlashFilter] = useState<number | "all">("all");
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState<Record<string, boolean>>({});
  const [flashHard, setFlashHard] = useState<Record<string, boolean>>({});

  // Masters / Glossary state
  const [masterId, setMasterId] = useState<string>(MASTERS[0].id);
  const [glossaryCat, setGlossaryCat] = useState<GlossaryCategory | "all">("all");
  const [glossarySearch, setGlossarySearch] = useState("");

  // Load
  useEffect(() => {
    setMounted(true);
    try {
      const b = localStorage.getItem(STORAGE.buyCheck); if (b) setBuyChecked(JSON.parse(b));
      const s = localStorage.getItem(STORAGE.sellCheck); if (s) setSellChecked(JSON.parse(s));
      const qh = localStorage.getItem(STORAGE.quizHistory); if (qh) setQuizHistory(JSON.parse(qh));
      const qs = localStorage.getItem(STORAGE.quizSelection); if (qs) setQuizSelection(JSON.parse(qs));
      const fr = localStorage.getItem(STORAGE.flashRevealed); if (fr) setFlashRevealed(JSON.parse(fr));
      const fh = localStorage.getItem(STORAGE.flashHard); if (fh) setFlashHard(JSON.parse(fh));
    } catch { /* noop */ }
  }, []);

  // Save
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE.buyCheck, JSON.stringify(buyChecked));
      localStorage.setItem(STORAGE.sellCheck, JSON.stringify(sellChecked));
      localStorage.setItem(STORAGE.quizHistory, JSON.stringify(quizHistory));
      localStorage.setItem(STORAGE.quizSelection, JSON.stringify(quizSelection));
      localStorage.setItem(STORAGE.flashRevealed, JSON.stringify(flashRevealed));
      localStorage.setItem(STORAGE.flashHard, JSON.stringify(flashHard));
    } catch { /* noop */ }
  }, [buyChecked, sellChecked, quizHistory, quizSelection, flashRevealed, flashHard, mounted]);

  // Reset quiz/flash index when filter changes
  useEffect(() => { setQuizIndex(0); }, [quizFilter]);
  useEffect(() => { setFlashIndex(0); }, [flashFilter]);

  const filteredQuiz = useMemo(
    () => quizFilter === "all" ? QUIZ_BANK : QUIZ_BANK.filter(q => q.principle === quizFilter),
    [quizFilter]
  );

  const filteredFlash = useMemo(
    () => flashFilter === "all" ? FLASHCARDS : FLASHCARDS.filter(f => f.principle === flashFilter),
    [flashFilter]
  );

  const quizStats = useMemo(() => {
    const total = QUIZ_BANK.length;
    const answered = Object.keys(quizHistory).length;
    const correct = Object.values(quizHistory).filter(h => h.correct).length;
    return { total, answered, correct };
  }, [quizHistory]);

  const flashStats = useMemo(() => {
    const total = FLASHCARDS.length;
    const revealed = Object.values(flashRevealed).filter(Boolean).length;
    const hard = Object.values(flashHard).filter(Boolean).length;
    return { total, revealed, hard };
  }, [flashRevealed, flashHard]);

  const buyCheckCount = useMemo(() => Object.values(buyChecked).filter(Boolean).length, [buyChecked]);
  const sellCheckCount = useMemo(() => Object.values(sellChecked).filter(Boolean).length, [sellChecked]);

  const currentQuiz: QuizItem | undefined = filteredQuiz[quizIndex];
  const currentFlash = filteredFlash[flashIndex];

  const answerQuiz = (choice: number) => {
    if (!currentQuiz) return;
    if (quizSelection[currentQuiz.id] !== undefined) return; // already answered
    setQuizSelection(prev => ({ ...prev, [currentQuiz.id]: choice }));
    setQuizHistory(prev => ({
      ...prev,
      [currentQuiz.id]: { correct: choice === currentQuiz.answer, date: new Date().toISOString() },
    }));
  };

  const resetCurrentQuiz = () => {
    if (!currentQuiz) return;
    setQuizSelection(prev => { const n = { ...prev }; delete n[currentQuiz.id]; return n; });
    setQuizHistory(prev => { const n = { ...prev }; delete n[currentQuiz.id]; return n; });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💌</span>
            <h1 className="text-2xl sm:text-3xl font-bold">민지니를 위한 주식 5원칙</h1>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            민호가 박은 *내가 옆에 없을 때*를 위한 지식 전수. 5원칙 외우고, 체크리스트 통과시키고, 분기마다 리밸런싱.
          </p>
        </header>

        {/* Tabs */}
        <nav className="mb-6 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors ${
                tab === t.key
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold"
                  : "hover:bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        {tab === "overview" && (
          <section className="space-y-8">
            {/* 5원칙 카드 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">5원칙 — 외워야 할 한 줄</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PRINCIPLES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setTab(`p${p.id}` as TabKey)}
                    className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-left hover:border-[var(--color-accent)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">원칙 {p.id}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{p.short}</h3>
                    <p className="text-sm text-[var(--color-fg-muted)]">{p.oneLine}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 매수 체크리스트 */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-semibold">매수 전 체크리스트</h2>
                <span className="text-sm text-[var(--color-fg-muted)]">{buyCheckCount} / {BUY_CHECKLIST.length}</span>
              </div>
              <p className="text-sm text-[var(--color-fg-muted)] mb-4">
                매수 버튼 누르기 전 *모두* 체크되어야 함. 하나라도 안 되면 매수 보류.
              </p>
              <div className="space-y-2">
                {BUY_CHECKLIST.map(c => (
                  <label
                    key={c.id}
                    className={`flex gap-3 rounded-[var(--radius-sm)] border p-3 cursor-pointer transition-colors ${
                      buyChecked[c.id]
                        ? "border-[var(--color-accent)] bg-[var(--color-bg-subtle)]"
                        : "border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!buyChecked[c.id]}
                      onChange={() => setBuyChecked(p => ({ ...p, [c.id]: !p[c.id] }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">원칙 {c.principle}</span>
                        <span className="font-medium">{c.text}</span>
                      </div>
                      <p className="text-sm text-[var(--color-fg-muted)]">{c.detail}</p>
                    </div>
                  </label>
                ))}
              </div>
              {buyCheckCount === BUY_CHECKLIST.length && (
                <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] border border-[var(--color-accent)] p-4">
                  ✅ 모두 통과. 분할 매수 시작해도 좋아. *전량* 매수는 절대 금지 — 3~5회로 나눠서.
                </div>
              )}
              <button
                onClick={() => setBuyChecked({})}
                className="mt-3 text-xs text-[var(--color-fg-muted)] hover:underline"
              >
                체크 초기화 (다음 종목용)
              </button>
            </div>

            {/* 매도 트리거 */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-semibold">매도 트리거</h2>
                <span className="text-sm text-[var(--color-fg-muted)]">{sellCheckCount} / {SELL_CHECKLIST.length}</span>
              </div>
              <p className="text-sm text-[var(--color-fg-muted)] mb-4">
                보유 종목에 *하나라도* 해당하면 비중 축소 또는 매도 검토.
              </p>
              <div className="space-y-2">
                {SELL_CHECKLIST.map(c => (
                  <label
                    key={c.id}
                    className={`flex gap-3 rounded-[var(--radius-sm)] border p-3 cursor-pointer transition-colors ${
                      sellChecked[c.id]
                        ? "border-red-500 bg-red-500/5"
                        : "border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!sellChecked[c.id]}
                      onChange={() => setSellChecked(p => ({ ...p, [c.id]: !p[c.id] }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">원칙 {c.principle}</span>
                        <span className="font-medium">{c.text}</span>
                      </div>
                      <p className="text-sm text-[var(--color-fg-muted)]">{c.detail}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>


            {/* 민지니에게 */}
            <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
              <h2 className="text-xl font-semibold mb-3">💌 민지니에게</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-fg-muted)]">
                {WIFE_MESSAGE}
              </p>
            </div>
          </section>
        )}

        {(tab === "p1" || tab === "p2" || tab === "p3" || tab === "p4" || tab === "p5") && (() => {
          const id = parseInt(tab.slice(1));
          const p = PRINCIPLE_DETAILS.find(x => x.id === id);
          const meta = PRINCIPLES.find(x => x.id === id);
          if (!p || !meta) return null;
          return (
            <section className="space-y-6">
              <header className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <div className="text-xs text-[var(--color-fg-muted)]">원칙 {p.id}</div>
                    <h2 className="text-xl font-bold">{p.title}</h2>
                  </div>
                </div>
                <p className="text-base font-medium border-l-2 border-[var(--color-accent)] pl-3">
                  {p.oneLine}
                </p>
              </header>

              <div>
                <h3 className="font-semibold mb-3">왜 그런가</h3>
                <ul className="space-y-2">
                  {p.why.map((w, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-2">
                      <span className="text-[var(--color-accent)]">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">역사·실제 사례</h3>
                <div className="space-y-3">
                  {p.cases.map((c, i) => (
                    <div key={i} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                      <h4 className="font-medium mb-1">{c.title}</h4>
                      <p className="text-sm text-[var(--color-fg-muted)]">{c.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">실행 절차</h3>
                <div className="space-y-3">
                  {p.steps.map((s, i) => (
                    <div key={i} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                      <h4 className="font-medium mb-1">{s.title}</h4>
                      <p className="text-sm text-[var(--color-fg-muted)]">{s.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 분산 룰 탭에선 샘플 포트폴리오 & 섹터 표 추가 */}
              {p.id === 5 && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3">샘플 포트폴리오 3개</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {SAMPLE_PORTFOLIOS.map(port => (
                        <div key={port.name} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-xl">{port.emoji}</span>
                            <h4 className="font-semibold">{port.name}</h4>
                          </div>
                          <p className="text-xs text-[var(--color-fg-muted)] mb-3">{port.desc}</p>
                          <div className="space-y-1 mb-3">
                            {port.allocations.map(a => (
                              <div key={a.sector} className="flex items-baseline justify-between text-sm">
                                <span>{a.sector}</span>
                                <span className="font-mono text-xs">{a.weight}%</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs space-y-1 pt-3 border-t border-[var(--color-border)]">
                            <div><span className="text-[var(--color-fg-muted)]">적합:</span> {port.fit}</div>
                            <div><span className="text-[var(--color-fg-muted)]">위험:</span> {port.risk}</div>
                            <div><span className="text-[var(--color-fg-muted)]">기대:</span> {port.expectedReturn}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">한국 11 섹터 대표 종목</h3>
                    <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--color-bg-subtle)]">
                          <tr>
                            <th className="text-left p-2">섹터</th>
                            <th className="text-left p-2">한국</th>
                            <th className="text-left p-2">미국</th>
                          </tr>
                        </thead>
                        <tbody>
                          {KR_SECTORS.map(s => (
                            <tr key={s.name} className="border-t border-[var(--color-border)]">
                              <td className="p-2 font-medium">{s.name}</td>
                              <td className="p-2 text-[var(--color-fg-muted)]">{s.kr}</td>
                              <td className="p-2 text-[var(--color-fg-muted)]">{s.us}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              <div>
                <h3 className="font-semibold mb-3 text-red-500">⚠️ 흔한 함정</h3>
                <ul className="space-y-2">
                  {p.pitfalls.map((f, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-2 rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">
                      <span className="text-red-500">✕</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">추천 도구·링크</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {p.tools.map(t => (
                    <div key={t.name} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-sm">
                      <div className="font-medium mb-0.5">{t.name}</div>
                      <div className="text-xs text-[var(--color-fg-muted)] font-mono mb-0.5">{t.path}</div>
                      <div className="text-xs text-[var(--color-fg-muted)]">{t.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {tab === "crash" && (
          <section className="space-y-6">
            <header className="rounded-[var(--radius)] border-2 border-red-500/40 bg-red-500/5 p-6">
              <h2 className="text-xl font-bold mb-2">🚨 폭락 매뉴얼 — 시장이 흔들릴 때</h2>
              <p className="text-sm text-[var(--color-fg-muted)]">
                코스피 -5% 이상 하루 / V-KOSPI 35 이상 / 보유 종목 평가손 -20% — 이 셋 중 하나라도 발생하면 이 페이지를 연다.
                *심호흡 먼저, 매매는 그 다음.*
              </p>
            </header>

            <div>
              <h3 className="font-semibold mb-3">Step 1 · 절대 하지 말 것 (5분간)</h3>
              <ul className="space-y-2 text-sm">
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ MTS 즉시 열고 매도</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ 카톡 종목방·유튜브 라이브 보기</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ 물타기 (떨어진다고 추가 매수)</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ 손절가 임의로 내리기</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ 민호한테 전화 안 되면 패닉 매도</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Step 2 · 진단 (5분)</h3>
              <ol className="space-y-2 text-sm list-decimal pl-5">
                <li><b>원인 파악</b>: 글로벌 매크로(금리·전쟁·환율)? 한국 단독? 종목 단독? — 인베스팅닷컴 메인 + 네이버 금융 메인 한 번씩 본다.</li>
                <li><b>V-KOSPI 확인</b>: 30 미만 = 일시적 노이즈 / 30~40 = 정상적 조정 / 40 이상 = 패닉 (역사적으로 *분할 매수 구간*).</li>
                <li><b>외국인 선물 누적</b>: 지난 5일 누적 -10,000계약 넘었나? 넘었으면 추가 하락 압력 있음.</li>
                <li><b>보유 종목 EPS 추세 확인</b>: 3개월 연속 하향 종목 = *진짜 매도 대상*. 추세 살아있으면 *버틴다*.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Step 3 · 의사결정 매트릭스</h3>
              <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-bg-subtle)]">
                    <tr>
                      <th className="text-left p-2">상황</th>
                      <th className="text-left p-2">행동</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">EPS 추세 살아있음 + 매수가 대비 -10~14%</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">*보유 유지*. 추세를 믿어라.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">EPS 추세 살아있음 + V-KOSPI 40 이상 패닉</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">*현금 10%로 분할 매수 1차*. 한 번에 전량 X.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">매수가 대비 -15% 도달</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">*기계적 손절*. 감정 개입 금지.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">EPS 추세 3개월 연속 하향</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">*비중 50%로 축소*. 추가 하향 시 전량 매도.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">전체 시장 패닉, 종목 무관</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">관망. *오늘은 매매하지 않는다*. 내일 다시 본다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[var(--radius)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-6">
              <h3 className="font-semibold mb-2">기억할 것</h3>
              <ul className="space-y-1 text-sm text-[var(--color-fg-muted)]">
                <li>• 시장은 *늘* 다시 온다. 자본 보존이 1순위.</li>
                <li>• 좋은 종목은 *항상* 다시 싸진다. 못 사서 죽지 않는다.</li>
                <li>• 손절은 *기계적*으로, 익절은 *추세 꺾일 때*만.</li>
                <li>• 의사결정이 안 잡히면 *오늘은 아무것도 하지 않는다*가 정답.</li>
                <li>• 민호한테 연락 닿으면 의논. 안 닿으면 *현금 비중 늘리고 관망*이 기본값.</li>
              </ul>
            </div>
          </section>
        )}

        {tab === "quiz" && (
          <section className="space-y-6">
            <header className="flex items-baseline justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-semibold">퀴즈</h2>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  답한 {quizStats.answered}/{quizStats.total} · 정답 {quizStats.correct}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuizFilter("all")}
                  className={`text-xs px-2 py-1 rounded ${quizFilter === "all" ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "border border-[var(--color-border)]"}`}
                >전체</button>
                {PRINCIPLES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setQuizFilter(p.id)}
                    className={`text-xs px-2 py-1 rounded ${quizFilter === p.id ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "border border-[var(--color-border)]"}`}
                  >{p.emoji} {p.short}</button>
                ))}
              </div>
            </header>

            {currentQuiz ? (
              <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs text-[var(--color-fg-muted)]">
                    {quizIndex + 1} / {filteredQuiz.length} · 원칙 {currentQuiz.principle}
                  </span>
                  {quizSelection[currentQuiz.id] !== undefined && (
                    <button onClick={resetCurrentQuiz} className="text-xs text-[var(--color-fg-muted)] hover:underline">
                      다시 풀기
                    </button>
                  )}
                </div>
                <h3 className="font-semibold mb-4 text-base">{currentQuiz.question}</h3>
                <div className="space-y-2 mb-4">
                  {currentQuiz.choices.map((c, i) => {
                    const selected = quizSelection[currentQuiz.id];
                    const answered = selected !== undefined;
                    const isCorrect = i === currentQuiz.answer;
                    const isSelected = i === selected;
                    let cls = "border-[var(--color-border)] hover:bg-[var(--color-bg)]";
                    if (answered) {
                      if (isCorrect) cls = "border-green-500 bg-green-500/10";
                      else if (isSelected) cls = "border-red-500 bg-red-500/10";
                      else cls = "border-[var(--color-border)] opacity-60";
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => answerQuiz(i)}
                        disabled={answered}
                        className={`w-full text-left rounded-[var(--radius-sm)] border p-3 text-sm transition-colors ${cls}`}
                      >
                        <span className="mr-2 text-[var(--color-fg-muted)]">{["①", "②", "③", "④"][i]}</span>
                        {c}
                        {answered && isCorrect && <span className="ml-2 text-green-500">✓</span>}
                        {answered && isSelected && !isCorrect && <span className="ml-2 text-red-500">✗</span>}
                      </button>
                    );
                  })}
                </div>
                {quizSelection[currentQuiz.id] !== undefined && (
                  <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] p-3 text-sm">
                    <span className="font-semibold">해설:</span> {currentQuiz.explanation}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setQuizIndex(i => Math.max(0, i - 1))}
                    disabled={quizIndex === 0}
                    className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] py-2 text-sm disabled:opacity-30"
                  >← 이전</button>
                  <button
                    onClick={() => setQuizIndex(i => Math.min(filteredQuiz.length - 1, i + 1))}
                    disabled={quizIndex >= filteredQuiz.length - 1}
                    className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] py-2 text-sm disabled:opacity-30"
                  >다음 →</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-fg-muted)]">선택한 원칙에 퀴즈가 없습니다.</p>
            )}
          </section>
        )}

        {tab === "flash" && (
          <section className="space-y-6">
            <header className="flex items-baseline justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-semibold">플래시카드</h2>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  본 카드 {flashStats.revealed}/{flashStats.total} · 어려움 표시 {flashStats.hard}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFlashFilter("all")}
                  className={`text-xs px-2 py-1 rounded ${flashFilter === "all" ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "border border-[var(--color-border)]"}`}
                >전체</button>
                {PRINCIPLES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFlashFilter(p.id)}
                    className={`text-xs px-2 py-1 rounded ${flashFilter === p.id ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "border border-[var(--color-border)]"}`}
                  >{p.emoji} {p.short}</button>
                ))}
              </div>
            </header>

            {currentFlash ? (
              <div>
                <div
                  onClick={() => setFlashRevealed(p => ({ ...p, [currentFlash.id]: !p[currentFlash.id] }))}
                  className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 cursor-pointer min-h-[200px] flex flex-col items-center text-center gap-3"
                >
                  <span className="text-xs text-[var(--color-fg-muted)]">
                    {flashIndex + 1} / {filteredFlash.length} · 원칙 {currentFlash.principle}
                  </span>
                  <h3 className="text-xl font-bold">{currentFlash.front}</h3>
                  {flashRevealed[currentFlash.id] && (
                    <div className="w-full pt-3 border-t border-[var(--color-border)]">
                      <p className="text-base leading-relaxed">{currentFlash.back}</p>
                    </div>
                  )}
                  {!flashRevealed[currentFlash.id] && (
                    <p className="text-sm text-[var(--color-fg-muted)] mt-auto">탭해서 정답 보기</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3 items-center">
                  <button
                    onClick={() => setFlashIndex(i => Math.max(0, i - 1))}
                    disabled={flashIndex === 0}
                    className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] py-2 text-sm disabled:opacity-30"
                  >← 이전</button>
                  <button
                    onClick={() => setFlashHard(p => ({ ...p, [currentFlash.id]: !p[currentFlash.id] }))}
                    className={`rounded-[var(--radius-sm)] border px-3 py-2 text-sm ${
                      flashHard[currentFlash.id]
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {flashHard[currentFlash.id] ? "🔥 어려움" : "🔥"}
                  </button>
                  <button
                    onClick={() => setFlashIndex(i => Math.min(filteredFlash.length - 1, i + 1))}
                    disabled={flashIndex >= filteredFlash.length - 1}
                    className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] py-2 text-sm disabled:opacity-30"
                  >다음 →</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-fg-muted)]">선택한 원칙에 카드가 없습니다.</p>
            )}
          </section>
        )}

        {tab === "masters" && (() => {
          const m = MASTERS.find(x => x.id === masterId) ?? MASTERS[0];
          return (
            <section className="space-y-6">
              <header>
                <h2 className="text-xl font-semibold mb-2">투자 거장 10인 — 5원칙의 *살아있는 증명*</h2>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  이 사람들이 부를 일군 방식이 우리 5원칙과 어디서 만나는지. 각 인물의 *함정*까지 박제.
                </p>
              </header>

              {/* Master selector */}
              <div className="flex flex-wrap gap-2">
                {MASTERS.map(x => (
                  <button
                    key={x.id}
                    onClick={() => setMasterId(x.id)}
                    className={`text-xs px-3 py-2 rounded-[var(--radius-sm)] border transition-colors ${
                      masterId === x.id
                        ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)] font-semibold"
                        : "border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]"
                    }`}
                  >
                    {x.name}
                  </button>
                ))}
              </div>

              {/* Master detail */}
              <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
                <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                  <h3 className="text-2xl font-bold">{m.name}</h3>
                  <span className="text-sm text-[var(--color-fg-muted)]">{m.nameEn}</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">({m.era})</span>
                </div>
                <p className="text-base font-medium border-l-2 border-[var(--color-accent)] pl-3 mb-4">
                  {m.oneLine}
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{m.who}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {m.matchPrinciples.map(pid => {
                    const p = PRINCIPLES.find(x => x.id === pid);
                    if (!p) return null;
                    return (
                      <button
                        key={pid}
                        onClick={() => setTab(`p${pid}` as TabKey)}
                        className="text-xs px-2 py-1 rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-bg)]"
                      >
                        {p.emoji} 원칙 {pid} {p.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">대표 방법론</h3>
                <div className="space-y-2">
                  {m.methods.map((meth, i) => (
                    <div key={i} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                      <div className="font-medium text-sm mb-0.5">{meth.name}</div>
                      <div className="text-sm text-[var(--color-fg-muted)]">{meth.def}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">5원칙과의 매칭</h3>
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4 text-sm leading-relaxed">
                  {m.matchExplain.split("**").map((chunk, i) =>
                    i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">대표 명언</h3>
                <div className="space-y-3">
                  {m.quotes.map((q, i) => (
                    <blockquote key={i} className="rounded-[var(--radius-sm)] border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-subtle)] p-4">
                      {q.en !== q.ko && <p className="italic text-sm mb-1">"{q.en}"</p>}
                      <p className="text-sm font-medium">"{q.ko}"</p>
                      <p className="text-xs text-[var(--color-fg-muted)] mt-1">— {q.source}</p>
                    </blockquote>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">민지니가 따라할 수 있는 것</h3>
                <ul className="space-y-2">
                  {m.wifeAction.map((a, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
                      <span className="text-[var(--color-accent)]">✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">관련 용어</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {m.flashTerms.map((t, i) => (
                    <div key={i} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-sm">
                      <div className="font-medium mb-1">{t.front}</div>
                      <div className="text-xs text-[var(--color-fg-muted)]">{t.back}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-red-500">⚠️ 자주 인용되는 함정</h3>
                <div className="text-sm leading-relaxed rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-4">
                  {m.pitfall}
                </div>
              </div>
            </section>
          );
        })()}

        {tab === "glossary" && (() => {
          const filtered = GLOSSARY.filter(g => {
            const catOK = glossaryCat === "all" || g.category === glossaryCat;
            const q = glossarySearch.trim().toLowerCase();
            const searchOK = !q ||
              g.term.toLowerCase().includes(q) ||
              (g.alt?.toLowerCase().includes(q) ?? false) ||
              g.short.toLowerCase().includes(q) ||
              g.long.toLowerCase().includes(q);
            return catOK && searchOK;
          });
          return (
            <section className="space-y-6">
              <header>
                <h2 className="text-xl font-semibold mb-2">용어 사전 — {GLOSSARY.length}개</h2>
                <p className="text-sm text-[var(--color-fg-muted)]">
                  처음 본 단어가 나오면 여기서 찾아봐. 모든 용어는 *비전공자 언어*로 풀어 썼고, 예시가 있으면 같이.
                </p>
              </header>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={e => setGlossarySearch(e.target.value)}
                  placeholder="용어 검색 (예: EPS, V-KOSPI, 분산)"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGlossaryCat("all")}
                    className={`text-xs px-2 py-1 rounded ${glossaryCat === "all" ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "border border-[var(--color-border)]"}`}
                  >전체 ({GLOSSARY.length})</button>
                  {GLOSSARY_CATEGORIES.map(c => {
                    const count = GLOSSARY.filter(g => g.category === c).length;
                    return (
                      <button
                        key={c}
                        onClick={() => setGlossaryCat(c)}
                        className={`text-xs px-2 py-1 rounded ${glossaryCat === c ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "border border-[var(--color-border)]"}`}
                      >{c} ({count})</button>
                    );
                  })}
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-muted)] text-center py-8">검색 결과 없음.</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map(g => (
                    <div key={g.term} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base">{g.term}</h3>
                        {g.alt && <span className="text-xs text-[var(--color-fg-muted)]">({g.alt})</span>}
                        <span className="text-xs px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-fg-muted)] ml-auto">{g.category}</span>
                      </div>
                      <p className="text-sm font-medium mb-2">{g.short}</p>
                      <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{g.long}</p>
                      {g.example && (
                        <p className="text-xs text-[var(--color-fg-muted)] mt-2 pt-2 border-t border-[var(--color-border)]">
                          <span className="font-medium">예:</span> {g.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })()}

        {tab === "swing" && (
          <section className="space-y-8">
            <header className="rounded-[var(--radius)] border-2 border-amber-500/40 bg-amber-500/5 p-6">
              <h2 className="text-xl font-bold mb-2">⚡ 단기 스윙 매매 전략</h2>
              <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
                보유 <b>2일 ~ 4주</b>, 한 종목 추세의 한 *스윙*(상승 구간)만 잡고 빠지는 매매.
                이 페이지의 1~5원칙(장기 추세 투자)과는 <b>완전히 다른 게임</b>이다.
                통계적으로 단기 트레이딩의 <b>70~90% 참여자가 손실</b>(NBER 2020, Barber & Odean 2014)
                — 시작 전 *전체 자산의 10% 이하* 별도 계좌로 분리하고, 손실 한도 정해놓고 시작할 것.
              </p>
            </header>

            {/* 검증된 방법론 */}
            <div>
              <h3 className="font-semibold mb-3">📚 검증된 4대 방법론 (실적 검증)</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                  <div className="text-sm font-semibold mb-1">Mark Minervini — SEPA / VCP</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    US Investing Championship 2회 우승(1997 155%, 2021 334%).
                    Trend Template 8조건 + VCP(Volatility Contraction Pattern: 변동성 수축 → 거래량 감소 → 돌파).
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                  <div className="text-sm font-semibold mb-1">William O&apos;Neil — CAN SLIM</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    AAII 1998~2021 누적 수익률 +2,763%(S&amp;P +727%) 검증.
                    Cup &amp; Handle 패턴 + Pivot Point 돌파 + 7~8% 손절 룰.
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                  <div className="text-sm font-semibold mb-1">Stan Weinstein — Stage Analysis</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    Stage 1(베이스) → 2(상승) → 3(천장) → 4(하락) 4단계 사이클.
                    매수는 *오직 Stage 2 초입* — 30주(150일) 이평선 위 + 이평선 상승 전환.
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4">
                  <div className="text-sm font-semibold mb-1">Nicolas Darvas — Darvas Box</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    1958~1960 $36,000 → $2.45M (출장 다니며 전보로만 매매).
                    박스권 상단 돌파 매수 → 새 박스 하단 손절. 신고가 + 거래량 동반.
                  </p>
                </div>
              </div>
            </div>

            {/* Minervini Trend Template */}
            <div>
              <h3 className="font-semibold mb-3">✅ Minervini Trend Template — 매수 후보 8조건</h3>
              <p className="text-sm text-[var(--color-fg-muted)] mb-3">
                <b>8개 모두 충족</b>해야 스윙 매수 후보. 하나라도 빠지면 *건드리지 않는다*. 한국 시장에도 그대로 적용 가능.
              </p>
              <ol className="space-y-2 text-sm list-decimal pl-5">
                <li>주가가 <b>50일·150일·200일 이평선 모두 위</b>에 있다.</li>
                <li><b>150일 이평선 &gt; 200일 이평선</b> (정배열).</li>
                <li>200일 이평선이 <b>최소 1개월 이상 상승 추세</b> (실전은 4~5개월 권장).</li>
                <li><b>50일 이평선 &gt; 150일 &gt; 200일</b> (완전 정배열).</li>
                <li>현재가가 <b>50일 이평선 위</b>에 있다.</li>
                <li>현재가가 <b>52주 최저가 대비 +30% 이상</b> (보통 +100% 이상이 더 강함).</li>
                <li>현재가가 <b>52주 최고가 대비 -25% 이내</b> (가까울수록 강함).</li>
                <li>상대강도(RS) 상위 30% 이상 — 시장 대비 강한 종목.</li>
              </ol>
            </div>

            {/* VCP 패턴 */}
            <div>
              <h3 className="font-semibold mb-3">📐 VCP — 변동성 수축 패턴 (Minervini)</h3>
              <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 mb-3">
                <p className="text-sm leading-relaxed">
                  스윙 매매의 <b>최강 엔트리 패턴</b>. 강한 상승 후 횡보 구간에서 <b>2~4번의 조정</b>이
                  점점 작아지고 거래량도 점점 줄어들다가, *완전히 마른 상태*에서 거래량 폭증 + 돌파.
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                <li><b>조정 1차</b>: -20~35% (가장 깊은 조정)</li>
                <li><b>조정 2차</b>: -10~20% (얕아짐)</li>
                <li><b>조정 3차</b>: -5~10% (더 얕아짐)</li>
                <li><b>마지막</b>: -3~5% 횡보 + 거래량 50일 평균의 50% 미만</li>
                <li><b>돌파</b>: 박스 상단(피벗) 돌파 + 거래량 50일 평균의 <b>140% 이상</b>(이상적: 200%+)</li>
              </ul>
            </div>

            {/* 엔트리 룰 */}
            <div>
              <h3 className="font-semibold mb-3">🎯 엔트리 룰 — 언제 매수하나</h3>
              <div className="space-y-3">
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="font-semibold text-sm mb-1">A. 돌파 매수 (Breakout)</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    피벗 포인트(박스 상단/저항선) 돌파 + 거래량 50일 평균의 1.5~2배 이상.
                    돌파 후 <b>1~3% 이내</b>에서만 매수 — 과도하게 추격하면 손절폭이 커진다.
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="font-semibold text-sm mb-1">B. 눌림목 매수 (Pullback)</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    이미 추세 진행 중인 종목이 <b>10일 또는 20일 이평선</b>까지 눌렸다가 반등할 때.
                    이평선 터치 + 양봉 + 거래량 회복 3박자.
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="font-semibold text-sm mb-1">C. Stage 2 진입 (Weinstein)</div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
                    오랜 횡보(Stage 1) 후 30주 이평선 위로 첫 돌파 + 30주 이평선 자체가 상승 전환.
                    *큰 한 사이클의 시작* — 가장 안정적인 엔트리.
                  </p>
                </div>
              </div>
            </div>

            {/* 손절 / 익절 */}
            <div>
              <h3 className="font-semibold mb-3">🛡️ 손절 · 익절 — 진입보다 중요한 룰</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-sm)] border-2 border-red-500/40 bg-red-500/5 p-4">
                  <div className="font-semibold text-sm mb-2">손절 (Stop Loss)</div>
                  <ul className="space-y-1.5 text-xs text-[var(--color-fg-muted)]">
                    <li>• <b>O&apos;Neil 룰: -7~8% 무조건 손절</b> (예외 없음)</li>
                    <li>• Minervini 룰: -5~7% (더 타이트)</li>
                    <li>• 손절가는 매수 *동시에* 설정 — 사후 결정 금지</li>
                    <li>• 손절 후 같은 종목 다시 매수 가능 (단, 새 셋업 형성 시)</li>
                    <li>• <b>물타기 절대 금지</b> — 하락 중 추가 매수는 손실 확대</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border-2 border-blue-500/40 bg-blue-500/5 p-4">
                  <div className="font-semibold text-sm mb-2">익절 (Take Profit)</div>
                  <ul className="space-y-1.5 text-xs text-[var(--color-fg-muted)]">
                    <li>• <b>+20~25%</b> 도달 시 부분 익절(절반)</li>
                    <li>• 나머지는 <b>10일 이평선 종가 이탈</b>까지 보유 (트레일링)</li>
                    <li>• <b>리스크/리워드 최소 1:2</b>, 이상적 1:3</li>
                    <li>• Climax Run(8~10일 연속 양봉 + 거래량 폭발)은 *천장 신호* — 매도</li>
                    <li>• 손익비 양호하면 +50% 이상도 가능 (Minervini는 평균 +30% 익절)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 포지션 사이징 */}
            <div>
              <h3 className="font-semibold mb-3">📊 포지션 사이징 — 한 번에 얼마 넣나</h3>
              <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                <p className="text-sm mb-3">
                  <b>핵심 공식</b>: 한 매매에서 잃을 수 있는 돈은 <b>전체 자본의 0.5~1%</b>.
                </p>
                <div className="text-xs text-[var(--color-fg-muted)] space-y-2">
                  <p>예시: 스윙 계좌 1,000만원, 한 매매 최대 손실 1% = 10만원.</p>
                  <p>매수가 50,000원, 손절가 47,000원(-6%) → 주당 손실 3,000원.</p>
                  <p>포지션 크기 = 10만원 / 3,000원 = <b>33주 = 약 165만원</b> (계좌의 16.5%).</p>
                  <p className="pt-2 border-t border-[var(--color-border)]"><b>동시 보유 종목: 최대 4~6개</b> (Minervini는 평소 4종목, 강세장만 6~8종목).</p>
                </div>
              </div>
            </div>

            {/* 종목 선정 */}
            <div>
              <h3 className="font-semibold mb-3">🔍 종목 풀(Universe) — 어디서 찾나</h3>
              <ul className="space-y-2 text-sm">
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>52주 신고가 근접 종목</b> — 네이버 금융 → 시세 → 신고가 (52주). 약한 종목은 신고가에 못 간다.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>거래대금 상위 100위</b> — 시가총액 1조 이상 + 일평균 거래대금 100억 이상. *유동성이 곧 안전*.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>실적 서프라이즈(어닝 모멘텀)</b> — 분기 EPS YoY +25% 이상 + 매출 +20% 이상 (O&apos;Neil CAN SLIM C/A).
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>섹터 리더</b> — 강한 섹터(반도체/2차전지/AI/조선 등 순환) 안의 1~3등 종목만.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>기관·외국인 동반 순매수</b> — 5일 이상 동반 순매수 종목 우선.
                </li>
              </ul>
            </div>

            {/* 한국 시장 특화 */}
            <div>
              <h3 className="font-semibold mb-3">🇰🇷 한국 시장 특화 룰</h3>
              <ul className="space-y-2 text-sm">
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>상한가 다음날</b>: 통계적으로 갭상 후 음봉 마감 빈도 높음. <b>상한가 종목 추격 매수 금지</b>.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>신용잔고율 급증</b>: 신용잔고율 5% 이상 + 1개월 내 2배 증가 = 신용 청산 위험. 회피.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>공매도 잔고 상위</b>: KRX 공매도 잔고 비율 5% 이상 종목은 추가 하락 압력 — 매수 보류.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>테마 순환</b>: 한국은 테마 사이클이 2~4주. 새 테마 초기 1주차 매수, 3주차부터 매도 시작.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>옵션 만기일(둘째주 목요일)</b>: 변동성 폭증. *전일·당일 신규 매수 자제*.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>코스닥 라이트</b>: 시가총액 1,000억 미만 종목은 작전·이상거래 빈번. *유동성 풍부한 코스피 중대형주 우선*.
                </li>
              </ul>
            </div>

            {/* 시장 환경 필터 */}
            <div>
              <h3 className="font-semibold mb-3">🌡️ 시장 환경 필터 — 스윙 매매 가능 여부</h3>
              <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-bg-subtle)]">
                    <tr>
                      <th className="text-left p-2">시장 상태</th>
                      <th className="text-left p-2">행동</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">코스피 200일 이평선 위 + 상승 전환</td>
                      <td className="p-2 text-[var(--color-fg-muted)]"><b>정상 매매</b>. 풀 포지션 가능.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">코스피 200일 이평선 위 + 횡보</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">포지션 50%만. 손절 더 타이트하게.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">코스피 200일 이평선 아래</td>
                      <td className="p-2 text-[var(--color-fg-muted)]"><b>스윙 매매 중단</b>. 70%+ 종목이 약세 — 확률 게임에서 진다.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">V-KOSPI 30 이상</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">신규 진입 보류. 보유 종목만 관리.</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)]">
                      <td className="p-2">3일 연속 분산일(Distribution Day: 거래량 늘며 -0.2%↓)</td>
                      <td className="p-2 text-[var(--color-fg-muted)]">기관 매도 신호. 비중 축소.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 주간 루틴 */}
            <div>
              <h3 className="font-semibold mb-3">📅 주간 루틴 — 시간 가성비</h3>
              <ul className="space-y-2 text-sm">
                <li><b>주말 (60분)</b>: 시장 환경 점검(코스피 일봉/주봉) + 관심종목 스크리닝(Trend Template) → 다음주 매매 후보 5~10개 선정.</li>
                <li><b>장중 (10~20분 × 2회)</b>: 09:30·14:30 보유 종목 손절가/익절가 알람 확인. *호가창 들여다보지 않기*.</li>
                <li><b>장 마감 후 (15분)</b>: 보유 종목 일봉 + 거래량 점검. 손절/익절 트리거 위반 종목 처리 계획.</li>
                <li><b>매일</b>: 매매 일지 1줄(왜 샀나/팔았나/감정 상태). 1년 후 자신을 가장 빠르게 성장시키는 자산.</li>
              </ul>
            </div>

            {/* 흔한 실수 */}
            <div>
              <h3 className="font-semibold mb-3">⚠️ 통계적으로 95%가 하는 실수</h3>
              <ul className="space-y-2 text-sm">
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>손절 미루기</b> — &quot;곧 오를 거야&quot; → -20%, -30%까지 늘어남. 손절은 *기계적으로*.</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>물타기</b> — 하락 중 추가 매수. 평단가만 낮춰 *상승 확률은 그대로*.</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>너무 잦은 매매(overtrading)</b> — 셋업 없을 땐 *현금 보유*. Minervini도 1년 중 절반은 현금.</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>약세장 매매</b> — 시장이 하락 추세인데 스윙 매매. 70% 종목이 따라 내린다.</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>리벤지 매매</b> — 손절 직후 다른 종목으로 만회 시도. 감정 매매는 *연쇄 손실*로 이어짐.</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>익절 후 재진입 못 함</b> — 팔고 더 오르면 *원래 매수가 위에서* 못 산다. 새 셋업 형성 시만 재진입.</li>
                <li className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/20 p-3">✕ <b>레버리지/신용</b> — 스윙 매매 초기 *절대 금지*. 손실 시 회복 불가능.</li>
              </ul>
            </div>

            {/* 마인드셋 */}
            <div className="rounded-[var(--radius)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-6">
              <h3 className="font-semibold mb-3">🧠 마인드셋 — 거장들의 공통점</h3>
              <ul className="space-y-2 text-sm text-[var(--color-fg-muted)]">
                <li>• <b>승률이 아니라 손익비</b>: Minervini 승률 50% 미만. 평균 익절 +30%, 평균 손절 -6% → 손익비 5:1.</li>
                <li>• <b>틀렸을 때 빨리 인정</b>: 손절은 *내 분석이 틀렸다*는 사실에 대한 비용. 자존심이 가장 비싸다.</li>
                <li>• <b>예측하지 말고 반응한다</b>: 차트는 *지금* 무엇이 일어나는지 보여줌. 미래 예측은 시장의 영역.</li>
                <li>• <b>현금도 포지션</b>: 셋업 없을 땐 현금 100%가 정답. 매매 안 하는 게 *가장 안전한 매매*인 경우 많음.</li>
                <li>• <b>오늘의 결정이 평생의 시스템을 만든다</b>: 한 번 룰 어기면 다음에도 어김. *한 번도 어기지 않는 것*이 시스템.</li>
              </ul>
            </div>

            {/* 추천 자료 */}
            <div>
              <h3 className="font-semibold mb-3">📖 더 깊이 — 검증된 원전</h3>
              <ul className="space-y-1.5 text-sm text-[var(--color-fg-muted)]">
                <li>• <b>Trade Like a Stock Market Wizard</b> — Mark Minervini (SEPA · VCP 원전)</li>
                <li>• <b>How to Make Money in Stocks</b> — William O&apos;Neil (CAN SLIM 원전)</li>
                <li>• <b>Secrets for Profiting in Bull and Bear Markets</b> — Stan Weinstein (Stage Analysis 원전)</li>
                <li>• <b>How I Made $2,000,000 in the Stock Market</b> — Nicolas Darvas (Darvas Box 원전)</li>
                <li>• <b>Reminiscences of a Stock Operator</b> — Edwin Lefèvre (Jesse Livermore 회고)</li>
                <li>• <b>Market Wizards</b> 시리즈 — Jack Schwager (실전 트레이더 인터뷰집)</li>
              </ul>
            </div>

            {/* 출구 */}
            <div className="rounded-[var(--radius)] border-2 border-amber-500/40 bg-amber-500/5 p-6">
              <h3 className="font-semibold mb-2">⚖️ 마지막 점검</h3>
              <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
                스윙 매매는 <b>풀타임 직업 수준의 시간·감정 비용</b>이 든다.
                같은 시간을 본업·EPS 추세 장기투자(이 페이지 1~5원칙)에 쓰면 *훨씬 안정적*으로 자산이 커진다.
                그래도 하고 싶다면: <b>전체 자산의 10% 별도 계좌, 6개월 룰 100% 준수 후 자본 추가</b>.
                6개월간 룰 한 번이라도 어기면 *스윙 매매에 안 맞는 사람*이다 — 미련 없이 장기투자로 돌아온다.
              </p>
            </div>
          </section>
        )}

        {tab === "timing" && (
          <section className="space-y-8">
            <header className="rounded-[var(--radius)] border-2 border-blue-500/40 bg-blue-500/5 p-6">
              <h2 className="text-xl font-bold mb-2">⏱️ 매수·매도 타이밍 매트릭스 — 모든 전략 한눈에</h2>
              <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
                보유 기간 <b>분 단위 ~ 10년+</b>까지 5개 전략을 한 표에 정리. 어느 전략이 *나에게* 맞는지 결정하는
                자기 진단부터 시작 → 전략별 매수/매도 트리거 → 공통 안전판 → 함정 매트릭스 순.
                <br /><b>핵심 원칙</b>: 한 사람이 동시에 여러 전략을 섞으면 망한다. <b>한 계좌 = 한 전략 = 한 시간프레임</b>.
              </p>
            </header>

            {/* 자기 진단 */}
            <div>
              <h3 className="font-semibold mb-3">🧭 자기 진단 — 어느 전략이 나에게 맞나</h3>
              <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--color-bg-subtle)]">
                    <tr>
                      <th className="text-left p-2">조건</th>
                      <th className="text-left p-2">스캘핑</th>
                      <th className="text-left p-2">데이트레이딩</th>
                      <th className="text-left p-2">스윙</th>
                      <th className="text-left p-2">포지션</th>
                      <th className="text-left p-2">장기 (1~5원칙)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-fg-muted)]">
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">하루 매매 시간</td><td className="p-2">6h+ 풀집중</td><td className="p-2">3~6h</td><td className="p-2">30~60min</td><td className="p-2">주 1~2시간</td><td className="p-2">월 1~2시간</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">최소 자본</td><td className="p-2">5천만+</td><td className="p-2">3천만+</td><td className="p-2">1천만+</td><td className="p-2">5백만+</td><td className="p-2">제한 없음</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">본업 병행</td><td className="p-2 text-red-400">불가</td><td className="p-2 text-red-400">불가</td><td className="p-2">제한적</td><td className="p-2 text-green-400">가능</td><td className="p-2 text-green-400">권장</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">감정 통제</td><td className="p-2">초인 수준</td><td className="p-2">매우 강함</td><td className="p-2">강함</td><td className="p-2">중간</td><td className="p-2">낮아도 OK</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">평균 손익비</td><td className="p-2">1:1.2</td><td className="p-2">1:1.5</td><td className="p-2">1:2~3</td><td className="p-2">1:3~5</td><td className="p-2">1:5+</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">과세/수수료 부담</td><td className="p-2 text-red-400">매우 큼</td><td className="p-2 text-red-400">큼</td><td className="p-2">중간</td><td className="p-2">작음</td><td className="p-2 text-green-400">최소</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">실증 수익자 비율</td><td className="p-2">~1%</td><td className="p-2">~3%</td><td className="p-2">~10%</td><td className="p-2">~25%</td><td className="p-2">~70%(10년+)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-fg-muted)] mt-2">
                * 실증 수익자 비율: NBER 2020(대만), Barber & Odean 2014, Vanguard 장기 패시브 통계 기반 추정.
                직장인 기본값은 <b>장기(1~5원칙) + 보조로 포지션 또는 스윙(별도 계좌 10%)</b>.
              </p>
            </div>

            {/* 전략별 보유 기간 / 핵심 신호 */}
            <div>
              <h3 className="font-semibold mb-3">📊 전략별 보유 기간 + 핵심 신호</h3>
              <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--color-bg-subtle)]">
                    <tr>
                      <th className="text-left p-2">전략</th>
                      <th className="text-left p-2">보유</th>
                      <th className="text-left p-2">차트 단위</th>
                      <th className="text-left p-2">매수 핵심 신호</th>
                      <th className="text-left p-2">매도 핵심 신호</th>
                      <th className="text-left p-2">손절 폭</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-fg-muted)]">
                    <tr className="border-t border-[var(--color-border)] align-top">
                      <td className="p-2 font-semibold">스캘핑</td>
                      <td className="p-2">초~분</td>
                      <td className="p-2">1·5분봉, 호가창</td>
                      <td className="p-2">호가 매수벽 형성 + 1분봉 첫 양봉 + 거래량 폭증</td>
                      <td className="p-2">매수벽 소멸 / 첫 음봉 / +0.3~1% 즉시</td>
                      <td className="p-2">-0.2~0.5%</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)] align-top">
                      <td className="p-2 font-semibold">데이트레이딩</td>
                      <td className="p-2">당일 청산</td>
                      <td className="p-2">5·15분봉</td>
                      <td className="p-2">시초가 갭상 + VWAP 상단 안착 / 15분봉 첫 추세 돌파</td>
                      <td className="p-2">VWAP 이탈 / 15:20 강제 청산</td>
                      <td className="p-2">-1~2%</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)] align-top">
                      <td className="p-2 font-semibold">스윙</td>
                      <td className="p-2">2일~4주</td>
                      <td className="p-2">일봉</td>
                      <td className="p-2">VCP 돌파 + 거래량 50일 평균 1.5배+ / 10·20일 이평 눌림목 반등</td>
                      <td className="p-2">10일 이평 종가 이탈 / +20~25% 부분 익절</td>
                      <td className="p-2">-5~8%</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)] align-top">
                      <td className="p-2 font-semibold">포지션</td>
                      <td className="p-2">2~12개월</td>
                      <td className="p-2">주봉</td>
                      <td className="p-2">Stage 2 진입(30주 이평 돌파+상승전환) + 분기 EPS YoY +25%</td>
                      <td className="p-2">30주 이평 종가 이탈 / EPS 컨센 3개월 연속 하향</td>
                      <td className="p-2">-15%</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border)] align-top">
                      <td className="p-2 font-semibold">장기 (1~5원칙)</td>
                      <td className="p-2">1년~10년+</td>
                      <td className="p-2">월봉, 펀더멘털</td>
                      <td className="p-2">12M Fwd EPS 3개월+ 상향 추세 + 섹터 글로벌 6M 상위 + 동반 순매수</td>
                      <td className="p-2">EPS 추세 3개월 하향 / 비중 룰 위반 / -15% 룰</td>
                      <td className="p-2">-15% (1회 점검)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 매수 트리거 카드 */}
            <div>
              <h3 className="font-semibold mb-3">🟢 매수 트리거 — 전략별 정제 룰</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">스캘핑 — 호가 + 1분봉</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>① 거래대금 1·2위 + 시총 1조+ + 스프레드 1tick</li>
                    <li>② 매수 호가 잔량 매도 호가 잔량의 2배+ 형성</li>
                    <li>③ 1분봉 직전 봉 거래량 평균 3배 + 양봉</li>
                    <li>④ 진입 즉시 -0.3% 손절 + +0.5~1% 익절 동시 예약</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">데이트레이딩 — 갭 + VWAP</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>① 시초 갭상 +2~5% (시장 영향 없는 단독 호재)</li>
                    <li>② 09:00~09:30 첫 5분봉 고점 돌파 + VWAP 위 안착</li>
                    <li>③ 거래대금 누적 100억+ (오전 1시간 내)</li>
                    <li>④ 15:20 강제 청산 ・ 다음날 갭 리스크 회피</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">스윙 — VCP / Pullback</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>① Trend Template 8조건 통과(스윙 탭)</li>
                    <li>② VCP 돌파 + 거래량 50일 평균 1.5~2배</li>
                    <li>③ 또는 10·20일 이평 눌림목 + 양봉 + 거래량 회복</li>
                    <li>④ 손절 -7%, 익절 +20% 부분/10일 이평 트레일링</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">포지션 — Stage 2 + 어닝 모멘텀</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>① 주봉 30주 이평 돌파 + 30주 이평 자체 상승 전환</li>
                    <li>② 직전 분기 EPS YoY +25%, 매출 +20%</li>
                    <li>③ 섹터 6M 상대강도 상위 25%</li>
                    <li>④ 분할 매수 3회 (돌파 / +5% / 첫 눌림목)</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/5 p-4 md:col-span-2">
                  <div className="text-sm font-semibold mb-2">장기 — 5원칙 동시 통과 (이 페이지 1~5원칙 탭)</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>① 세계 돈 흐름 = 한국 돈 흐름 = 6M 수익률 상위 섹터, 셋 일치</li>
                    <li>② 12M Fwd EPS 3개월+ 상향 추세</li>
                    <li>③ 거래대금 20일 평균 2배+ 신규 자금 유입 + 외국인·기관 동반 매수</li>
                    <li>④ V-KOSPI &lt; 30 + 외국인 선물 누적 -10,000계약 미만</li>
                    <li>⑤ 한 섹터 ≤40% / 한 종목 ≤20% 비중 룰 통과</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 매도 트리거 카드 */}
            <div>
              <h3 className="font-semibold mb-3">🔴 매도 트리거 — 전략별 정제 룰</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">즉시 매도 (모든 전략 공통)</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>• 매수 근거(트리거)가 사라졌다 → 결과와 무관하게 청산</li>
                    <li>• 손절가 종가 이탈 → 다음 시초가 시장가</li>
                    <li>• 회사 본질 변화(분식회계, CEO 교체, 사업 구조 변경)</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">스캘핑 / 데이트레이딩</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>• 스캘핑: +0.5~1% 익절 / 매수벽 소멸 즉시</li>
                    <li>• 데이트레이딩: VWAP 종가 이탈 / 15:20 강제 청산</li>
                    <li>• 둘 다: <b>오버나이트 보유 절대 금지</b></li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">스윙</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>• +20~25% 도달 → 절반 익절, 나머지 트레일링</li>
                    <li>• 10일 이평 종가 이탈 → 잔량 청산</li>
                    <li>• Climax Run(8~10일 연속 양봉 + 거래량 폭증) → 천장</li>
                    <li>• 분산일(Distribution Day) 3일 누적 → 비중 축소</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/5 p-4">
                  <div className="text-sm font-semibold mb-2">포지션</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>• 주봉 30주 이평 종가 이탈</li>
                    <li>• 분기 어닝 미스 + 가이던스 하향</li>
                    <li>• 상대강도 상위 25%에서 탈락</li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/5 p-4 md:col-span-2">
                  <div className="text-sm font-semibold mb-2">장기 (1~5원칙)</div>
                  <ul className="text-xs space-y-1 text-[var(--color-fg-muted)]">
                    <li>• 12M Fwd EPS 컨센서스 3개월 연속 하향 (단발 1회는 노이즈)</li>
                    <li>• 섹터가 글로벌 6M 상위 → 중하위로 추락</li>
                    <li>• -15% 도달 → <b>분석 재점검 1회</b>(즉시 손절 아님). 근거 살아있으면 보유, 깨졌으면 청산</li>
                    <li>• 비중 룰 위반(한 종목 &gt;25%) → 비중 조정 매도</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 공통 안전판 */}
            <div>
              <h3 className="font-semibold mb-3">🛡️ 모든 전략 공통 안전판</h3>
              <ul className="space-y-2 text-sm">
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>한 매매 최대 손실 ≤ 자본 1%</b> — 포지션 사이즈는 <i>(자본 × 1%) ÷ (매수가 - 손절가)</i>로 역산.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>손절가는 매수와 동시에</b> — 사후 결정 금지. 예약 주문으로 자동화.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>손익비 최소 1:2</b> — 안 되면 진입 자체 X. 승률 낮아도 손익비로 이긴다.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>시장 환경 필터</b> — 코스피 200일 이평 아래면 *모든 신규 매매 중단*. 70% 종목이 약세.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>매매 일지</b> — 왜 샀나/팔았나/감정 1줄. 시장이 아니라 <i>자기</i>를 통계화하는 도구.
                </li>
                <li className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <b>한 계좌 = 한 전략</b> — 장기/스윙/단기 섞으면 손실난 단기를 장기로 둔갑시키는 자기기만 시작.
                </li>
              </ul>
            </div>

            {/* 함정 매트릭스 */}
            <div>
              <h3 className="font-semibold mb-3">⚠️ 전략별 가장 흔한 함정</h3>
              <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--color-bg-subtle)]">
                    <tr>
                      <th className="text-left p-2">전략</th>
                      <th className="text-left p-2">치명적 함정</th>
                      <th className="text-left p-2">처방</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-fg-muted)]">
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">스캘핑</td><td className="p-2">수수료/세금이 수익을 갉아먹음. 100전 60승해도 적자.</td><td className="p-2">월 수수료 시뮬 먼저. 손익비 1:1 미만이면 즉시 중단.</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">데이트레이딩</td><td className="p-2">손실 종목을 &quot;다음날 갭 반등 기대&quot;로 들고 가서 스윙으로 변질.</td><td className="p-2">15:20 강제 청산 룰. 어기는 순간 데이트레이더 자격 박탈.</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">스윙</td><td className="p-2">손절 미루기 → -7%가 -30% 됨. 그 종목 하나로 1년 망함.</td><td className="p-2">손절 자동 예약. 장중 절대 안 본다.</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">포지션</td><td className="p-2">EPS 하향이 시작됐는데도 &quot;장기니까&quot;라며 보유.</td><td className="p-2">주봉 30주 이평 + 컨센서스 추세는 *반응 신호*. 신념 신호 아님.</td></tr>
                    <tr className="border-t border-[var(--color-border)]"><td className="p-2">장기</td><td className="p-2">단기 변동성에 계속 매매로 변질 → 결국 단기 트레이더 통계로 수렴.</td><td className="p-2">월 1회만 점검. MTS 알림 끄기. 주봉/월봉만 본다.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 의사결정 트리 */}
            <div className="rounded-[var(--radius)] border-2 border-blue-500/40 bg-blue-500/5 p-6">
              <h3 className="font-semibold mb-3">🧩 한 줄 의사결정 트리</h3>
              <ol className="text-sm space-y-2 text-[var(--color-fg-muted)] list-decimal pl-5">
                <li>본업이 있다 → <b>장기(1~5원칙)</b> 풀 자본. 끝.</li>
                <li>본업이 있고 추가 도전 → 자본의 <b>10%만 별도 계좌로 스윙</b>. 6개월 룰 100% 준수 검증.</li>
                <li>본업이 없고 매매 시간 6h+ → <b>데이트레이딩</b>(스캘핑은 권장 X). 단, 6개월 시뮬레이션 후 실전.</li>
                <li>위 어디에도 안 맞는다 → <b>지수 ETF 적립식</b>. KODEX200·TIGER S&amp;P500·QQQ 분산.</li>
              </ol>
            </div>
          </section>
        )}

        {tab === "daily" && (
          <section className="space-y-8">
            <header className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
              <h2 className="text-xl font-bold mb-2">🔗 매일 체크 — 한눈에 보는 데이터 소스</h2>
              <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
                장 시작 전 5분 · 장 마감 후 5분 · 주말 10분, 이 링크들만 순서대로 확인하면 5원칙 점검 끝.
                전부 무료, 대부분 회원가입 없이 열림.
              </p>
            </header>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-accent)]">① 시장 환경 (장 시작 전 필수)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <a href="https://kr.investing.com/indices/kospi-volatility" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">V-KOSPI 변동성지수 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">인베스팅닷컴 · 20↓ 평온 / 30↑ 공포 진입</div>
                </a>
                <a href="https://data.krx.co.kr/contents/MDC/MAIN/main/index.cmd" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">KRX 정보데이터시스템 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">외국인·기관 순매수, 파생 포지션 공식</div>
                </a>
                <a href="https://kr.investing.com/markets/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">인베스팅닷컴 마켓 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">세계 지수·금리·달러·원자재 한 화면</div>
                </a>
                <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">CNN Fear &amp; Greed ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 시장 공포·탐욕 7개 지표 종합</div>
                </a>
                <a href="https://www.cboe.com/tradable_products/vix/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">VIX (미국 변동성) ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">CBOE 공식 · 20↓ 평온 / 30↑ 공포</div>
                </a>
                <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">FRED 경제지표 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">금리·실업률·CPI·장단기금리차 원본</div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-accent)]">② 섹터 · 거래대금 · 수급 (원칙 1·3)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <a href="https://finance.naver.com/sise/sise_group.naver?type=upjong" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">네이버 업종별 수익률 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">한국 섹터 1·6개월 수익률 정렬</div>
                </a>
                <a href="https://finance.naver.com/sise/sise_quant.naver" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">네이버 거래상위 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">거래대금 1~50위 실시간</div>
                </a>
                <a href="https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020203" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">KRX 투자자별 매매동향 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">외국인·기관 순매수 일별 (공식)</div>
                </a>
                <a href="https://www.sectorspdrs.com/sector-tracker" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">S&amp;P Sector Tracker ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 11개 섹터 ETF 수익률 (세계 메인 플로우)</div>
                </a>
                <a href="https://finviz.com/groups.ashx?g=sector&v=210&o=perf6m" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">Finviz 섹터 히트맵 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 섹터·산업 6M 성과 시각화</div>
                </a>
                <a href="https://finance.naver.com/sise/sise_high.naver?type=H_YR" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">네이버 52주 신고가 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">스윙 종목 풀 — 약한 종목은 신고가에 못 옴</div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-accent)]">③ EPS 컨센서스 · 공시 (원칙 2)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <a href="https://comp.fnguide.com/SVO2/ASP/SVD_main.asp" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">FnGuide 컴퍼니가이드 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">12M Fwd EPS 컨센서스 추세, 무료</div>
                </a>
                <a href="https://kind.krx.co.kr/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">KIND (KRX 상장공시) ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">상장사 공시·IR·실적 발표 일정 (DART 보완)</div>
                </a>
                <a href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">DART 전자공시 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">국내 모든 공시 원본 (사업·반기·분기보고서)</div>
                </a>
                <a href="https://www.sec.gov/search-filings" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">SEC EDGAR ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 공시 (10-K, 10-Q, 8-K) 통합 검색</div>
                </a>
                <a href="https://markets.hankyung.com/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">한경 마켓 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">증권사 리포트 무료 모음</div>
                </a>
                <a href="https://finance.yahoo.com/calendar/earnings" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">Yahoo 어닝 캘린더 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 실적 발표 일정 + 컨센서스</div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-accent)]">④ 파생 · 만기 · 매크로 캘린더 (원칙 4)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <a href="https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0301010301" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">KRX 파생 투자자별 거래실적 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">외국인 선물 누적 포지션 (만기 영향 사전 감지)</div>
                </a>
                <a href="https://kr.investing.com/economic-calendar/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">인베스팅 경제 캘린더 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">CPI · FOMC · 고용지표 시간순</div>
                </a>
                <a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">FOMC 일정 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 연준 금리 결정 원본 일정</div>
                </a>
                <a href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">CME FedWatch ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">선물 가격이 가리키는 금리 인하·동결 확률</div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-accent)]">⑤ 차트 · 스크리너 · 글로벌</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <a href="https://www.tradingview.com/chart/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">TradingView ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">차트 분석 표준 · 한국 종목도 지원</div>
                </a>
                <a href="https://finviz.com/screener.ashx" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">Finviz Screener ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 종목 펀더멘털·기술적 동시 필터</div>
                </a>
                <a href="https://stockanalysis.com/" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">Stock Analysis ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">미국 종목 재무 10년치 무료</div>
                </a>
                <a href="https://kr.investing.com/currencies/usd-krw" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 hover:border-[var(--color-accent)] transition-colors">
                  <div className="text-sm font-medium">USD/KRW 환율 차트 ↗</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">인베스팅닷컴 실시간 (수출주 영향 모니터링)</div>
                </a>
              </div>
            </div>

            <div className="rounded-[var(--radius)] border-2 border-amber-500/40 bg-amber-500/5 p-6">
              <h3 className="font-semibold mb-3">💡 추천 루틴 (총 20분/일)</h3>
              <ul className="space-y-2 text-sm text-[var(--color-fg-muted)]">
                <li>• <b>장 시작 전 (08:50, 5분)</b>: ① 시장 환경 4개 (V-KOSPI · CNN F&amp;G · 인베스팅 · 경제 캘린더)</li>
                <li>• <b>장 마감 후 (15:40, 5분)</b>: ② 섹터·거래대금·수급 3개 (업종별 · 거래상위 · KRX 매매동향)</li>
                <li>• <b>주말 (10분)</b>: ③ EPS 컨센서스 추세 점검 + ④ 다음주 캘린더 (FOMC · CPI · 어닝) 확인</li>
              </ul>
            </div>
          </section>
        )}

        <footer className="mt-16 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-fg-muted)] text-center">
          이 페이지는 색인되지 않습니다 (robots disallow). 진입: S키 5회.
        </footer>
      </div>
    </div>
  );
}
