# 트레이딩 도구 & 오픈소스 (GitHub 흡수)

> 2026-08-05 GitHub 트레이딩 부문 상위 레포 조사 → 우리 세션에 이식한 것 정리.

---

## 1. 조사 결과 — GitHub 트레이딩 상위 레포

| ★ | 레포 | 내용 | 우리에게 유용? |
|---|------|------|---------------|
| **95.7k** | **TauricResearch/TradingAgents** | **다중 에이전트 LLM 트레이딩 프레임워크** | ⭐ **이식함 → `/토론`** |
| 71.4k | OpenBB-finance/OpenBB | 오픈 금융 데이터 플랫폼 (analysts/quants/AI) | 데이터 소스 후보 |
| 60.1k | ZhuLinsen/daily_stock_analysis | LLM 다중시장 주식 분석 + 자동 푸시 | 컨셉 참고 |
| 52.9k | freqtrade/freqtrade | 크립토 트레이딩 봇 | ❌ 크립토 전용 |
| 47.1k | microsoft/qlib | AI 퀀트 투자 플랫폼 | 백테스트용 (무거움) |
| 44.2k | vnpy/vnpy | 중국 퀀트 트레이딩 프레임워크 | ❌ 중국 시장 |
| 25.3k | nautechsystems/nautilus_trader | Rust 기반 프로덕션 트레이딩 엔진 | ❌ 오버킬 |
| 22.7k | mementum/backtrader | 파이썬 백테스팅 라이브러리 | 전략 검증용 |
| 21.1k | QuantConnect/Lean | 알고 트레이딩 엔진 | ❌ 오버킬 |
| 28.5k | wilsonfreitas/awesome-quant | 퀀트 리소스 큐레이션 | 레퍼런스 |
| **1.07k** | **sharebook-kr/pykrx** | **KRX 데이터 스크래핑 (한국)** | ⭐ **이식함 → `scripts/screener.py`** |

> 📌 별 수가 많다고 우리에게 좋은 게 아니다. 대부분 **크립토·중국시장·프로덕션 엔진**이라 무관.
> 실제로 쓸 만한 건 **TradingAgents(구조)** 와 **pykrx(한국 데이터)** 둘뿐이었다.

---

## 2. ⭐ TradingAgents — 이식한 것

### 원본 아키텍처
LangGraph 기반. 실제 트레이딩 회사 조직을 에이전트로 모사.

```
[애널리스트 4인]  펀더멘털 · 센티먼트 · 뉴스 · 테크니컬
        ↓
[리서처 2인]     🐂 강세  ⟷  🐻 약세   ← 구조화된 적대적 토론 (max_debate_rounds)
        ↓
[트레이더]        토론 종합 → 매매 판단
        ↓
[리스크팀]        변동성·유동성·포트폴리오 리스크 평가
        ↓
[포트폴리오 매니저] 최종 승인/거부
```

### 핵심 인사이트 — 왜 이게 좋은가
**단일 LLM 분석의 근본 문제는 확증편향**이다.
사용자가 이미 관심 있는 종목을 물으면 LLM은 무의식적으로 긍정 근거를 더 찾는다.

TradingAgents의 해법: **강세/약세를 별도 에이전트로 분리하고 서로 반박시킨다.**
- 약세 애널리스트 프롬프트가 명시적으로 요구하는 것:
  *"단순 사실 나열이 아니라 **대화체로 강세 측 주장에 직접 반박**하라"*
- 이게 핵심이다. 병렬로 의견을 내는 게 아니라 **서로를 공격**해야 사각지대가 드러난다.

### 우리 세션 이식 → `/토론`
1세션 환경이라 실제 멀티에이전트는 과하다 → **역할 분리 + 2라운드 상호반박**으로 압축.
`.claude/commands/토론.md` 참조.

> **미너비니 연결**: 미너비니도 "진입 전에 무효화 조건을 정하라"고 한다.
> 약세 애널리스트가 바로 그 **무효화 조건 생성기** 역할을 한다.

---

## 3. ⭐ pykrx — 이식한 것

한국거래소(KRX) 데이터 스크래핑 라이브러리.

### 주요 API
```python
from pykrx import stock

stock.get_market_ohlcv("20260101", "20260805", "005930")      # 종목 OHLCV
stock.get_market_ohlcv("20260805", market="KOSPI")            # 전종목 스냅샷
stock.get_market_fundamental("20260805")                       # PER/PBR/EPS/BPS
stock.get_market_trading_value_by_investor(s, e, "005930")     # 투자자별 순매수
stock.get_market_net_purchases_of_equities(s, e, "KOSPI", "외국인")
stock.get_index_ohlcv(s, e, "1001")                            # 코스피 지수
stock.get_shorting_volume_by_ticker("20260805")                # 공매도
stock.get_market_cap("20260805")                               # 시가총액
```
투자자 구분: `금융투자 · 보험 · 투신 · 사모 · 은행 · 기관합계 · 개인 · 외국인 · 전체`

### 우리 스크립트 → `scripts/screener.py`
거래대금 상위 → **미너비니 Trend Template 8조건 자동 판정**.

```bash
/usr/bin/python3 scripts/screener.py                 # 스크리닝
/usr/bin/python3 scripts/screener.py --market KOSDAQ
/usr/bin/python3 scripts/screener.py --ticker 005930 # 단일 종목 상세
```

---

## 4. ⚠️ 실행 환경 함정 (2026-08-05 실측)

### 함정 1 — 사내망에서 KRX 차단 🚫
```
사내 프록시가 data.krx.co.kr 을 "투자정보" 카테고리로 전면 차단.
→ warning.html 리다이렉트 반환. 코드 문제가 아니다.
```
**확인법**
```bash
curl -s https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd | head -c 200
# warning.html / 차단카테고리 문구 → 차단됨
```
**해결**: 개인 핫스팟·집 네트워크. **사내에서는 스크립트 대신 세션에 물어봐라** (WebSearch로 대신 판정).

### 함정 2 — Homebrew 파이썬은 사내 SSL 프록시를 거부
```
사내 TLS 인터셉션: ePrism SSL (SOOSAN INT) 이 인증서를 재서명
→ Homebrew python 3.13: SSLCertVerificationError
   ("Missing Authority Key Identifier" — 3.13의 엄격한 X.509 검증)
→ 시스템 python 3.9 (/usr/bin/python3): macOS 키체인 신뢰 → 통과 ✅
```
**해결**: 항상 `/usr/bin/python3` 로 실행. venv 만들지 마라.
```bash
/usr/bin/python3 -m pip install --user pykrx pandas
```

### 함정 3 — 타입힌트 문법
시스템 파이썬이 **3.9** 라서 `float | None` (PEP 604, 3.10+) 문법이 **TypeError**.
→ 스크립트는 3.9 호환 문법으로 작성할 것.

---

## 5. 검토했으나 안 쓴 것

| 레포 | 왜 안 썼나 |
|------|-----------|
| freqtrade / hummingbot | 크립토 전용 |
| vnpy / abu | 중국 시장 |
| QuantConnect/Lean, nautilus_trader | 프로덕션 엔진 — 개인 재량매매엔 오버킬 |
| microsoft/qlib | ML 퀀트 플랫폼. 미노는 재량 트레이더라 성격이 다름 |
| FinRL | 강화학습 — 연구용, 실전 괴리 큼 |

> 🚫 **없으면 없다고 한다**: 한국 시장 + 미너비니 스타일 재량매매에 바로 쓸 만한 레포는
> **pykrx 하나뿐**이었다. 나머지는 크립토/중국/퀀트자동매매라 우리 용도와 다르다.
> 억지로 끼워맞추지 않았다.

---

## 6. 📡 데이터 소스 우선순위 (최신성 기준)

> 2026-08-06 실측: "코스피 8/6 종가" 웹검색 → **8/3 데이터만 나옴.**
> 한국 시황은 **웹 인덱싱이 며칠 늦는 게 정상**이다. 이걸 전제로 소스를 골라야 한다.

### 🚨 사내망 실측 결과 (2026-08-06) — 대부분 막혀 있다

프록시가 **카테고리 단위**로 차단한다. 개별 사이트 문제가 아니다.

| 소스 | 사내망 | 실측 결과 |
|------|--------|-----------|
| `finance.naver.com` | 🚫 | Claude Code fetch 불가 |
| `data.krx.co.kr` | 🚫 | 차단 카테고리 **"투자정보"** |
| `stooq.com` (CSV 포함) | 🚫 | 차단 카테고리 **"주식사이트"** |
| `investing.com` | 🚫 | Parse Error |
| `finance.yahoo.com` | 🚫 | Parse Error |
| **WebSearch** | ✅ | **유일하게 동작. 단 며칠 지연** |

> **결론: 사내에서 쓸 수 있는 건 WebSearch 하나뿐이다.**
> 그런데 WebSearch 는 한국 시황이 **며칠 늦는다** (8/6 검색 → 8/3 데이터).
> 이 둘을 합치면 → **사내에서는 "당일 시세"를 신뢰성 있게 못 가져온다.**

### 그래서 어떻게 하나

| 상황 | 방법 |
|------|------|
| **사내 · 당일 시세 필요** | ⭐ **미노가 HTS/MTS 보고 숫자를 불러줘라.** 그게 제일 빠르고 정확하다. 내가 그 숫자로 Trend Template·손익비·사이징을 계산해준다 |
| 사내 · 며칠 전 흐름 | WebSearch (날짜 명시 필수) |
| 사내 · 개념/기법/계산 | 조회 불필요 — 바로 답변 |
| 개인망 | `scripts/screener.py` (pykrx) + WebFetch 전부 동작 |

> 💡 **이게 오히려 낫다**: 미노가 화면 보면서 숫자를 주면 **실시간 정확도 100%** 이고,
> 나는 판정·계산·반증에 집중할 수 있다. 역할 분담이 명확해진다.

**미국장·환율·금리**는 영문 소스라 WebSearch 커버리지가 한국보다 낫다.

---

## 7. 향후 검토 후보
- **OpenBB** — 데이터 플랫폼. 매크로 지표 자동 수집에 쓸 만한지 검토 가치
- **backtrader** — 눌림목 전략 백테스트로 손익비·기대값 실측 (risk.md의 표본 100건 확보용)
