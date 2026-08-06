#!/usr/bin/env python3
"""
미너비니 Trend Template 스크리너 (한국 시장)
GitHub 참고: sharebook-kr/pykrx (KRX 데이터 스크래핑)

⚠️ 실행 환경 (2026-08-05 실측)
   - **반드시 시스템 파이썬으로 실행**: /usr/bin/python3 screener.py
     (Homebrew python 3.13은 사내 ePrism SSL 프록시 인증서를 거부 —
      "Missing Authority Key Identifier". 시스템 파이썬은 macOS 키체인을 신뢰해 통과)
   - 설치: /usr/bin/python3 -m pip install --user pykrx pandas
   - 🚫 **사내망에서는 KRX가 차단된다** (프록시 카테고리 "투자정보" 필터).
     → 사내 Wi-Fi에서는 데이터가 안 나온다. 집/개인 핫스팟에서 실행할 것.

사용법:
    /usr/bin/python3 screener.py                 # 거래대금 상위 → Trend Template
    /usr/bin/python3 screener.py --top 150
    /usr/bin/python3 screener.py --market KOSDAQ
    /usr/bin/python3 screener.py --ticker 005930 # 단일 종목 상세 판정

⚠️ 이 스크립트는 '후보 목록'을 만들 뿐이다. 매매 신호가 아니다.
   VCP 수축·매물대·촉매는 차트로 직접 확인해야 한다.
"""
import argparse
import sys
from datetime import datetime, timedelta

try:
    import pandas as pd
    from pykrx import stock
except ImportError:
    sys.exit("의존성 없음 →  pip install pykrx pandas")


def _fmt(d):
    return d.strftime("%Y%m%d")


BLOCKED_MSG = """
🚫 KRX 데이터에 접근할 수 없다.

가장 흔한 원인 두 가지:

 1) 사내망 차단  ← 2026-08-05 실측 확인됨
    사내 프록시가 data.krx.co.kr 을 "투자정보" 카테고리로 전면 차단한다.
    확인:  curl -s https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd | head -c 200
           → warning.html / 차단카테고리 문구가 보이면 차단된 것.
    해결:  개인 핫스팟·집 네트워크에서 실행.

 2) 잘못된 파이썬
    Homebrew python 3.13 은 사내 ePrism SSL 인증서를 거부한다.
    해결:  /usr/bin/python3 screener.py  (시스템 파이썬으로 실행)

사내에서 종목을 보고 싶으면 스크립트 대신 세션에서 그냥 물어봐라 —
WebSearch 로 시세를 조회해서 Trend Template 을 대신 판정해준다.
"""


def _preflight():
    """네트워크/차단 여부를 먼저 확인해서 스택트레이스 대신 안내를 낸다."""
    try:
        import requests
        r = requests.get("https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",
                         headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        if "warning.html" in r.text or "차단" in r.text:
            sys.exit(BLOCKED_MSG)
    except SystemExit:
        raise
    except Exception as e:
        sys.exit(f"{BLOCKED_MSG}\n(원인: {type(e).__name__}: {str(e)[:120]})")


def recent_business_day():
    """최근 영업일 (데이터가 실제로 있는 날)."""
    d = datetime.now()
    for _ in range(10):
        s = _fmt(d)
        try:
            df = stock.get_market_ohlcv(s, market="KOSPI")
            if df is not None and not df.empty and "종가" in df.columns \
                    and df["종가"].sum() > 0:
                return s
        except Exception:
            pass
        d -= timedelta(days=1)
    sys.exit(BLOCKED_MSG)


def trend_template(px, bench_ret=None):
    """
    미너비니 Trend Template 8조건 판정.
    px: 종가 시계열 (오름차순, 최소 200영업일 권장)
    bench_ret: 코스피 6개월 수익률(%) — 상대강도 비교용
    """
    if len(px) < 200:
        return {"error": f"데이터 부족 ({len(px)}일 < 200일)"}

    cur = px.iloc[-1]
    ma50, ma150, ma200 = (px.rolling(w).mean().iloc[-1] for w in (50, 150, 200))
    ma200_1m_ago = px.rolling(200).mean().iloc[-21]

    lo52, hi52 = px.tail(252).min(), px.tail(252).max()

    # 상대강도: 6개월(126영업일) 수익률의 벤치마크 대비 초과분
    rs = None
    if len(px) >= 126:
        stock_ret = (cur / px.iloc[-126] - 1) * 100
        rs = stock_ret if bench_ret is None else stock_ret - bench_ret

    c = {
        "1. 주가 > 150일선, 200일선": cur > ma150 and cur > ma200,
        "2. 150일선 > 200일선": ma150 > ma200,
        "3. 200일선 상승 중(1개월)": ma200 > ma200_1m_ago,
        "4. 50일선 > 150·200일선": ma50 > ma150 and ma50 > ma200,
        "5. 주가 > 50일선": cur > ma50,
        "6. 52주 저점 대비 +30%↑": cur >= lo52 * 1.30,
        "7. 52주 고점 대비 -25% 이내": cur >= hi52 * 0.75,
        "8. 상대강도 우위(vs 코스피)": (rs is not None and rs > 0),
    }
    return {
        "conditions": c,
        "passed": sum(c.values()),
        "price": cur,
        "ma50": ma50, "ma150": ma150, "ma200": ma200,
        "low52": lo52, "high52": hi52,
        "from_low": (cur / lo52 - 1) * 100,
        "from_high": (cur / hi52 - 1) * 100,
        "rs": rs,
    }


def benchmark_return(start, end):
    """코스피(1001) 6개월 수익률(%)."""
    try:
        idx = stock.get_index_ohlcv(start, end, "1001")
        if len(idx) >= 126:
            return (idx["종가"].iloc[-1] / idx["종가"].iloc[-126] - 1) * 100
    except Exception:
        pass
    return None


def screen(top_n, market, min_value_eok):
    today = recent_business_day()
    start = _fmt(datetime.strptime(today, "%Y%m%d") - timedelta(days=420))
    print(f"기준일: {today} | 시장: {market}\n")

    # 1) 거래대금 상위 추출 — 유동성/주도주 필터
    snap = stock.get_market_ohlcv(today, market=market)
    snap = snap[snap["거래대금"] >= min_value_eok * 100_000_000]
    snap = snap.sort_values("거래대금", ascending=False).head(top_n)
    print(f"거래대금 {min_value_eok}억↑ 상위 {len(snap)}종목 스캔 중...\n")

    bench = benchmark_return(start, today)
    rows = []
    for i, tk in enumerate(snap.index, 1):
        try:
            df = stock.get_market_ohlcv(start, today, tk)
            if df is None or df.empty:
                continue
            r = trend_template(df["종가"], bench)
            if "error" in r:
                continue
            rows.append({
                "티커": tk,
                "종목명": stock.get_market_ticker_name(tk),
                "통과": r["passed"],
                "종가": int(r["price"]),
                "저점대비%": round(r["from_low"], 1),
                "고점대비%": round(r["from_high"], 1),
                "RS": round(r["rs"], 1) if r["rs"] is not None else None,
                "거래대금(억)": int(snap.loc[tk, "거래대금"] / 1e8),
            })
        except Exception:
            continue
        if i % 25 == 0:
            print(f"  ...{i}/{len(snap)}")

    if not rows:
        print("조건을 만족하는 종목 없음.")
        return

    out = pd.DataFrame(rows).sort_values(
        ["통과", "RS"], ascending=[False, False]
    )
    full = out[out["통과"] == 8]

    print(f"\n{'='*78}\n✅ 8/8 완전 통과: {len(full)}종목\n{'='*78}")
    print(full.to_string(index=False) if not full.empty
          else "없음 — 시장 국면이 안 좋거나 스캔 범위가 좁다.")

    near = out[out["통과"] == 7]
    if not near.empty:
        print(f"\n{'─'*78}\n🟡 7/8 (관찰): {len(near)}종목\n{'─'*78}")
        print(near.head(15).to_string(index=False))

    print("\n⚠️ 이건 후보 목록일 뿐이다. VCP 수축·거래량 마름·매물대·손절폭 8% 이내를")
    print("   차트로 직접 확인한 뒤에만 진입 검토할 것.")


def detail(ticker):
    today = recent_business_day()
    start = _fmt(datetime.strptime(today, "%Y%m%d") - timedelta(days=420))
    name = stock.get_market_ticker_name(ticker)
    df = stock.get_market_ohlcv(start, today, ticker)
    r = trend_template(df["종가"], benchmark_return(start, today))
    if "error" in r:
        sys.exit(r["error"])

    print(f"\n{'='*60}\n  {name} ({ticker})  —  기준일 {today}\n{'='*60}")
    print(f"  종가 {int(r['price']):,}원")
    print(f"  50일 {int(r['ma50']):,} / 150일 {int(r['ma150']):,} / 200일 {int(r['ma200']):,}")
    print(f"  52주 {int(r['low52']):,} ~ {int(r['high52']):,}")
    print(f"  저점대비 {r['from_low']:+.1f}%  고점대비 {r['from_high']:+.1f}%")
    if r["rs"] is not None:
        print(f"  상대강도(6M, vs코스피) {r['rs']:+.1f}%p")
    print(f"\n  Trend Template  {r['passed']}/8\n{'-'*60}")
    for k, v in r["conditions"].items():
        print(f"  {'⭕' if v else '❌'}  {k}")

    if r["passed"] < 8:
        fails = [k for k, v in r["conditions"].items() if not v]
        print(f"\n  🔴 미충족 {len(fails)}개 → 미너비니 기준 매수 후보 아님")
        for f in fails:
            print(f"     · {f}")
    else:
        print("\n  🟢 8/8 통과 — 단, VCP·매물대·손절폭은 차트로 직접 확인")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="미너비니 Trend Template 스크리너")
    p.add_argument("--top", type=int, default=100, help="스캔할 거래대금 상위 종목 수")
    p.add_argument("--market", default="KOSPI", choices=["KOSPI", "KOSDAQ", "ALL"])
    p.add_argument("--min-value", type=int, default=300, help="최소 거래대금(억)")
    p.add_argument("--ticker", help="단일 종목 상세 판정")
    a = p.parse_args()

    try:
        _preflight()
        detail(a.ticker) if a.ticker else screen(a.top, a.market, a.min_value)
    except KeyboardInterrupt:
        print("\n중단됨")
