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

type TabKey = "overview" | "p1" | "p2" | "p3" | "p4" | "p5" | "crash" | "masters" | "glossary" | "quiz" | "flash";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "overview", label: "시작", emoji: "✨" },
  { key: "p1", label: "큰 그림", emoji: "🌍" },
  { key: "p2", label: "EPS 추세", emoji: "📈" },
  { key: "p3", label: "거래대금", emoji: "💰" },
  { key: "p4", label: "파생 신호", emoji: "🎯" },
  { key: "p5", label: "분산 룰", emoji: "🧺" },
  { key: "crash", label: "폭락 매뉴얼", emoji: "🚨" },
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
                  className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 cursor-pointer min-h-[200px] flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xs text-[var(--color-fg-muted)] mb-3">
                    {flashIndex + 1} / {filteredFlash.length} · 원칙 {currentFlash.principle}
                  </span>
                  <h3 className="text-xl font-bold mb-3">{currentFlash.front}</h3>
                  {flashRevealed[currentFlash.id] ? (
                    <p className="text-base leading-relaxed">{currentFlash.back}</p>
                  ) : (
                    <p className="text-sm text-[var(--color-fg-muted)]">탭해서 정답 보기</p>
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

        <footer className="mt-16 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-fg-muted)] text-center">
          이 페이지는 색인되지 않습니다 (robots disallow). 진입: S키 5회.
        </footer>
      </div>
    </div>
  );
}
