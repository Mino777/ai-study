# TODOS

## P2 — 다음 스프린트
- [x] **인터랙티브 퀴즈 시스템** — ✅ 2026-04-11 frontmatter quiz + Quiz 컴포넌트 + localStorage 저장
- [x] **Spaced repetition** — ✅ 2026-04-11 SM-2 단순화 (1→3→7→14→30→60일), 대시보드 "오늘 복습할 엔트리" 위젯
- [x] **Light mode 완성도** — ✅ 2026-04-09 accent/semantic 색상 추가
- [ ] **Gemini 프롬프트에 MDX/Mermaid 가드 추가** — `<br>` self-closing, Mermaid subgraph `id ["Label"]` 형식 명시. 같은 날 2건 재발 → 최우선. Effort: S → XS
- [ ] **퀴즈 코드 빈칸 유형** — 현재는 MCQ만. 코드 fill-in-the-blank 추가. Effort: M → S
- [ ] **quiz-storage 단위 테스트** — computeQuizStats, updateReviewSchedule, getDueReviews. Effort: S → XS

## P2 — Hermes Stack 후속
- [ ] **GBrain 추가 검토 CEO Plan** — Hermes 2주 운영 데이터 기반. 기억 손실 반복 >3회 시 GBrain 도입. Phase 6 Go/No-Go Decision Tree 참조. Effort: L→M(CC). Depends on: Hermes Phase 6 완료

## P3 — 백로그
- [ ] **OpenClaw 추가 검토** — Hermes 운영 중 로컬 OS 작업 >5회 시 OpenClaw CEO Plan 실행. 격리 VPS 필수. Effort: L→M(CC). Depends on: Hermes Phase 6 완료
- [x] **학습 타임라인** — ✅ 2026-04-09 /timeline 페이지
- [ ] **Highlights 페이지 (Flagship 큐레이션)** — 엄선 5~8 엔트리만 큰 카드로 노출. 설계안: [`docs/highlights-page-design.md`](docs/highlights-page-design.md). Effort: M
- [ ] **Community contribution** — 다른 사람도 콘텐츠 기여 가능. 인증/PR 리뷰 필요. Effort: XL → L
- [ ] **테스트 커버리지 향상** — 컴포넌트 유닛 테스트 + API 라우트 테스트. Effort: M → S
- [ ] **퀴즈 결과 서버 동기화** — 현재 localStorage만. 로그인된 admin은 GitHub gist 동기화. Effort: M → S
