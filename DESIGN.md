# Design System — AI Study Wiki

## Product Context
- **What this is:** AI 하네스 엔지니어링(프롬프트 엔지니어링, RAG, 에이전트, 파인튜닝) 학습 위키 + 포트폴리오
- **Who it's for:** 본인(학습 기록/두 번째 뇌) + 채용 담당자/동료 개발자(포트폴리오)
- **Space/industry:** 개발자 학습 도구, AI 엔지니어링 커뮤니티
- **Project type:** 하이브리드 — 마케팅 랜딩(홈 그래프 히어로) + 앱 UI(위키/대시보드)

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian + Editorial 하이브리드
- **Decoration level:** Intentional — 그래프 노드 글로우가 장식 역할. 별도 데코 불필요.
- **Mood:** 기술 노트의 진지함과 매거진의 세련됨이 공존. 다크 배경 위에 네온 카테고리 컬러가 빛나는 느낌.
- **Reference sites:** NASA Eyes on Asteroids (몰입형 시각화), Brittany Chiang (미니멀 개발자 포트폴리오)

## Typography
- **Display/Hero:** Satoshi (900, geometric sans) — 날카롭고 현대적. Inter/Geist 대비 차별화.
- **Body:** Pretendard Variable — 한국어 최적화, 깨끗한 본문 가독성.
- **UI/Labels:** Pretendard Variable (same as body)
- **Data/Tables:** Geist (tabular-nums 지원) — 숫자 정렬 정확.
- **Code:** JetBrains Mono — 프로그래머 표준, ligature 지원.
- **Loading:** Satoshi via FontShare API, Pretendard via CDN, JetBrains Mono + Geist via Google Fonts
- **Scale:**
  - xs: 12px / 0.75rem
  - sm: 14px / 0.875rem
  - base: 16px / 1rem
  - lg: 18px / 1.125rem
  - xl: 20px / 1.25rem
  - 2xl: 24px / 1.5rem
  - 3xl: 30px / 1.875rem
  - 4xl: 36px / 2.25rem
  - 5xl: 48px / 3rem
  - hero: 64px / 4rem

## Color
- **Approach:** Restrained + 그래프 노드 카테고리 컬러
- **Background:** #0a0a0f (deep navy-black)
- **Surface:** #141420 (elevated cards, panels)
- **Surface hover:** #1c1c2e
- **Border:** #1e1e30
- **Primary text:** #e8e8ed (cream white)
- **Muted text:** #6b6b80 (cool gray)
- **Accent:** #3b82f6 (electric blue — 링크, CTA, 포커스 링)
- **Accent hover:** #2563eb
- **Category colors (= Graph node colors):**
  - Prompt Engineering: #f59e0b (amber)
  - Context Engineering: #eab308 (yellow)
  - Harness Engineering: #84cc16 (lime)
  - RAG: #10b981 (emerald)
  - Agents: #8b5cf6 (violet)
  - Fine-tuning: #ec4899 (pink)
  - Evaluation: #06b6d4 (cyan)
  - Infrastructure: #f97316 (orange)
  - iOS + AI: #3b82f6 (blue)
  - Frontend + AI: #a855f7 (purple)
- **Semantic:**
  - Success: #10b981
  - Warning: #f59e0b
  - Error: #ef4444
  - Info: #3b82f6
- **Dark mode:** 기본. Light mode는 --bg: #fafafa, --surface: #ffffff, --text: #1a1a2e 로 전환. next-themes로 system preference 감지.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Hybrid — 홈은 포스터 구도(그래프 풀스크린), 위키는 그리드 기반
- **Grid:**
  - Desktop (1024px+): 12-column, 사이드바 280px + 콘텐츠 영역
  - Tablet (768-1023px): 8-column, 접이식 사이드바
  - Mobile (<768px): 1-column, 바텀 네비, 그래프 대체 카테고리 카드 UI
- **Max content width:** 1100px
- **Border radius:** sm: 4px, md: 8px, lg: 12px, full: 9999px (badges)

## Motion
- **Approach:** Intentional — 목적이 있는 움직임만.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Specific animations:**
  - 그래프 노드 호버: 글로우 확대 (medium, ease-out)
  - 페이지 전환: 페이드 (short)
  - 검색 매칭: 그래프 노드 하이라이트 펄스 (medium)
  - 그래프 초기 로딩: 노드 하나씩 등장 (long, stagger)
  - 히트맵 셀: 페이드인 (medium, stagger)

## Component Patterns
- **Category badges:** 배경 rgba(color, 0.15) + 텍스트 color. 9999px radius.
- **Summary card:** surface 배경, border-left 3px 카테고리 색상, confidence 점 표시.
- **Confidence meter:** 5개 dot, active = accent, inactive = border color.
- **Heatmap:** 14px cells, 3px gap, 카테고리 색상 with varying opacity.
- **Code blocks:** surface 배경, border, GitHub Dark 테마 (shiki).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-08 | Initial design system created | /design-consultation based on competitive research + product context |
| 2026-04-08 | Satoshi for display | Geometric sans, sharper than Inter/Geist, memorable for portfolio |
| 2026-04-08 | Graph node colors = site category system | Unified color language: graph IS the design system |
| 2026-04-08 | Dark mode default | Developer audience + data visualization readability |
| 2026-04-08 | Mobile: category cards instead of graph | Force-directed graph unusable on 375px |
| 2026-04-09 | 카테고리 3개 추가 (Context/Harness/iOS/Frontend AI) | AI 방법론 세분화 + iOS/프론트엔드 실무 AI |
| 2026-04-09 | 코드 복사 버튼 | 기술 블로그 UX 표준 |
| 2026-04-09 | 모바일 하단 네비 바 | 모바일에서 주요 페이지 접근성 |
| 2026-04-09 | 공통 Header 컴포넌트 | DRY: 5개 페이지에서 개별 헤더 제거 |
