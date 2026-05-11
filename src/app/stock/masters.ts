/* ═══════════════════════════════════════════════════════════ */
/*  투자 거장 10인 — 5원칙과의 연결                              */
/* ═══════════════════════════════════════════════════════════ */

export interface Master {
  id: string;
  name: string;
  nameEn: string;
  era: string;
  oneLine: string;
  who: string;
  methods: { name: string; def: string }[];
  matchPrinciples: number[];
  matchExplain: string;
  quotes: { en: string; ko: string; source: string }[];
  wifeAction: string[];
  flashTerms: { front: string; back: string }[];
  pitfall: string;
}

export const MASTERS: Master[] = [
  /* ── 워런 버핏 ── */
  {
    id: "buffett",
    name: "워런 버핏",
    nameEn: "Warren Buffett",
    era: "1930~",
    oneLine: "주가는 결국 미래 이익의 그림자다. 좋은 회사를 합리적 가격에.",
    who:
      "Berkshire Hathaway 회장. 1965년 인수 후 2024년까지 연평균 약 19.8%(S&P 500의 약 2배) 수익률을 *60년간* 복리로 쌓은 세계 최장 트랙레코드. 운용 자산 1조 달러 규모의 지주회사. 스승 벤저민 그레이엄의 *안전마진* 위에 \"훌륭한 회사를 적정 가격에 사서 영원히 보유한다\"는 변형을 얹었다. 번역서: 『현명한 투자자』(스승 책), 『워런 버핏의 주주서한』.",
    methods: [
      { name: "Owner Earnings (주주 이익)", def: "회계 순이익이 아닌 \"현금흐름 − 유지보수 자본지출\"로 본 *진짜* 이익. EPS의 정직한 버전." },
      { name: "Margin of Safety (안전마진)", def: "내재가치보다 충분히 낮게 사서 분석 오차를 흡수." },
      { name: "Circle of Competence (능력 범위)", def: "이해 못 하는 사업은 절대 안 산다. 범위의 *크기*보다 *경계를 아는 것*이 중요." },
      { name: "Economic Moat (경제적 해자)", def: "경쟁자가 못 넘는 구조적 우위 — 브랜드/네트워크/원가." },
      { name: "Mr. Market (시장 씨)", def: "시장은 매일 호가를 외치는 조울증 환자. 무시하거나 이용하거나." },
    ],
    matchPrinciples: [2],
    matchExplain:
      "**원칙 2(Forward EPS 추세)와 정확히 일치**. 다만 버핏은 한 분기·1년이 아니라 *10년 후의 Owner Earnings*를 본다. 우리 원칙이 \"다음 분기 EPS가 올라가는 추세냐\"라면, 버핏은 \"10년 뒤에도 이 회사가 더 많이 벌 구조적 이유가 있냐\"를 묻는다. *Forward EPS 추세에 해자라는 질문을 한 줄 더 추가*하면 곧 버핏 버전.",
    quotes: [
      { en: "Price is what you pay, value is what you get.", ko: "가격은 지불하는 것, 가치는 받는 것이다.", source: "버크셔 주주서한 2008" },
      { en: "Risk comes from not knowing what you're doing.", ko: "리스크는 자기가 뭘 하는지 모르는 데서 온다.", source: "1993 버크셔 연차총회" },
    ],
    wifeAction: [
      "종목 사기 전 \"10년 후에도 이 회사가 망하지 않을 이유 3가지\"를 종이에 적어보기. 3개 못 채우면 안 산다.",
      "분기 실적 발표일에 *주가*가 아니라 *영업이익률*을 먼저 본다.",
    ],
    flashTerms: [
      { front: "안전마진 (Margin of Safety)", back: "내재가치보다 충분히 낮게 사서 분석 오차를 흡수하는 버퍼. 그레이엄이 \"투자 비밀을 세 단어로 줄이면 이것\"이라 한 개념" },
      { front: "경제적 해자 (Economic Moat)", back: "경쟁자가 침범 못 하는 구조적 우위. 브랜드·전환비용·네트워크 효과·규모의 경제" },
      { front: "Owner Earnings", back: "순이익 + 감가상각 − 유지보수 capex. 회계 이익보다 *진짜 현금*에 가까운 EPS" },
    ],
    pitfall:
      "\"버핏도 장기 보유했으니 나도 묻어둔다\" — 버핏은 *매일* 펀더멘털을 모니터링하고 해자가 무너지면 즉시 매도(IBM·항공주 사례). \"묻어두기\"는 버핏 사상이 아니라 게으름. Frazzini *Buffett's Alpha* 논문도 그의 수익률을 \"Quality + Low Risk + Leverage\" 팩터로 상당 부분 설명. *왜 그 회사를 골랐는지의 논리*를 따라가야 한다.",
  },

  /* ── 피터 린치 ── */
  {
    id: "lynch",
    name: "피터 린치",
    nameEn: "Peter Lynch",
    era: "1944~",
    oneLine: "이익이 오르면 주가는 따라온다. 일상에서 10루타를 찾아라.",
    who:
      "1977~1990년 Fidelity Magellan Fund 운용 → *13년 연평균 29.2%*. 운용 자산을 1,800만 달러 → 140억 달러로 키운 펀드매니저. 은퇴 시점 Magellan은 세계 최대 뮤추얼펀드. \"월스트리트보다 *동네 쇼핑몰*이 좋은 종목을 더 빨리 알려준다\"는 일반 투자자 친화 철학. 번역서: 『월가의 영웅』, 『이기는 투자』.",
    methods: [
      { name: "PEG Ratio", def: "P/E를 *이익 성장률*로 나눈 값. 1 미만 저평가, 2 초과 비쌈. \"공정 가격 회사의 P/E는 성장률과 같다.\"" },
      { name: "Tenbagger (10루타)", def: "10배 오르는 종목. 포트폴리오 수익의 대부분을 만든다." },
      { name: "6 Stock Categories", def: "Slow grower / Stalwart / Fast grower / Cyclical / Turnaround / Asset play. 카테고리마다 기대 수익률·매도 기준이 다르다." },
      { name: "Invest in What You Know", def: "일·생활에서 접한 *현장 정보*를 출발점으로, *그 다음에 재무제표*를 파라." },
      { name: "Story Investing", def: "회사의 성장 스토리를 2분 안에 설명 못 하면 사지 마라." },
    ],
    matchPrinciples: [2, 1],
    matchExplain:
      "**원칙 2(Forward EPS) + 원칙 1(메가 트렌드)에 정확히 결합**. \"이익이 오르면 주가는 따라온다\"는 원칙 2의 교과서적 정의. 동시에 거시 *예측*은 경멸했지만 *섹터 메가트렌드*(인구 고령화 = 헬스케어, 모바일 침투 = 통신)는 적극 활용. *6 Categories로 종목별 기대치 보정*을 추가하면 린치 버전.",
    quotes: [
      { en: "If you can follow only one bit of data, follow the earnings.", ko: "단 하나의 데이터만 추적해야 한다면 그것은 이익이다.", source: "One Up On Wall Street, 1989" },
      { en: "The real key to making money in stocks is not to get scared out of them.", ko: "주식으로 돈 버는 진짜 비결은 조정장에 겁먹고 빠지지 않는 것이다.", source: "Magellan 1989 서한" },
    ],
    wifeAction: [
      "새로 좋아진 제품·앱이 있으면 *제조사/모회사*를 메모. 단 메모로 끝내지 말고 분기 EPS·부채비율 확인 후에만 매수.",
      "보유 종목마다 \"왜 갖고 있는지 2문장 스토리\"를 노트에. 스토리가 깨지면 매도.",
    ],
    flashTerms: [
      { front: "PEG Ratio", back: "P/E ÷ EPS 성장률. 1 미만 매력적, 2 초과 위험. 성장주 평가의 기본" },
      { front: "Tenbagger (10루타)", back: "매입가 대비 10배 오른 주식. 야구 용어에서 따옴. 포트의 1~2개가 전체 수익을 만든다" },
      { front: "Stalwart (대형 우량주)", back: "연 10~12% 안정 성장하는 대형주. 50% 오르면 일부 차익실현하고 회전" },
    ],
    pitfall:
      "\"매장에서 좋아 보였으니까 산다\" — 린치 본인이 가장 답답해한 오해. \"Buy what you know\"는 *아이디어 시작점*이지 *매수 근거*가 아니다. 매장 발견 후엔 P/E·PEG·부채·동종 비교 다 본다. *\"좋아 보임\" + \"재무제표 확인\"이 한 쌍*.",
  },

  /* ── 레이 달리오 ── */
  {
    id: "dalio",
    name: "레이 달리오",
    nameEn: "Ray Dalio",
    era: "1949~",
    oneLine: "미래는 모른다. 모든 계절에 통하는 우산을 펴라.",
    who:
      "세계 최대 헤지펀드 Bridgewater Associates(약 1,500억 달러 운용) 창업자. 1996년 \"내가 죽어도 가족이 운용 가능한 포트폴리오\"를 만들기 위해 *All Weather Portfolio* 설계. 2008 금융위기를 미리 경고. 번역서: 『원칙』, 『변화하는 세계 질서』, 『금융 위기 템플릿』.",
    methods: [
      { name: "All Weather Portfolio", def: "4계절(성장↑/↓ · 물가↑/↓)에 각각 강한 자산을 같은 *리스크 비중*으로 배분. 예: 미국채 장기 40 / 주식 30 / 중기채 15 / 원자재 7.5 / 금 7.5." },
      { name: "Risk Parity (리스크 패리티)", def: "*자본*이 아닌 *리스크*를 균등 배분. 60/40 포트는 자본은 40% 채권이지만 리스크의 90%가 주식." },
      { name: "Economic Machine (경제 기계)", def: "경제 = 단기 부채 사이클(5~8년) + 장기 부채 사이클(50~75년) + 생산성 추세선. 유튜브 30분 애니메이션이 표준 교재." },
      { name: "Principles (원칙)", def: "모든 결정을 *명시적 원칙*으로 코드화하고 실패에서 원칙을 업데이트." },
    ],
    matchPrinciples: [1, 5],
    matchExplain:
      "**원칙 1(거시) + 원칙 5(분산)와 정확히 일치**. 우리 원칙 1이 \"금리/환율로 자금흐름 읽기\"라면 달리오는 그것을 *4계절 매트릭스*로 추상화. 원칙 5의 \"섹터 분산\"을 *자산군 분산*으로 확장. 다만 *2022년 -18% 손실*에서 보듯 장기채 40% 비중은 금리 급등기에 취약. 한국 개인은 *원리(리스크 패리티 사고)*만 차용 — KOSPI ETF + 미국 ETF + 금 + 단기채/예금으로 단순화.",
    quotes: [
      { en: "He who lives by the crystal ball will eat shattered glass.", ko: "수정구슬로 사는 사람은 깨진 유리를 먹게 된다.", source: "Principles, 2017" },
      { en: "Pain + Reflection = Progress.", ko: "고통 + 성찰 = 성장.", source: "Principles" },
    ],
    wifeAction: [
      "포트폴리오를 *4계절 관점*으로 점검: \"지금 자산이 인플레이션 급등기에 다 깨지지는 않는가?\" 깨진다면 금/원자재/물가연동채로 5~10% 보강.",
      "한 번의 예측에 베팅하지 않는다. *틀려도 살아남는 배분*이 곧 원칙 1·5의 합.",
    ],
    flashTerms: [
      { front: "All Weather Portfolio", back: "4계절(성장·물가 ↑/↓)에 모두 작동하도록 설계된 자산배분. 주식·장기채·중기채·금·원자재" },
      { front: "Risk Parity (리스크 패리티)", back: "*자본*이 아닌 *리스크*를 균등 배분. 한 자산이 포트 위험의 대부분을 차지하지 않게" },
      { front: "단기/장기 부채 사이클", back: "5~8년 경기 사이클 + 50~75년 거대 부채 사이클. 둘이 겹치면 대공황급 위기" },
    ],
    pitfall:
      "\"달리오가 만든 거니까 안전\" — All Weather는 *1980~2020 저금리 시대* 최적화. 2022년 -18%로 60/40보다 더 깨졌다. 인플레 국면에선 채권 40%가 부담. *비중을 그대로 베끼지 말고 원리(리스크 분산·예측 회피)만 흡수*하라.",
  },

  /* ── 하워드 막스 ── */
  {
    id: "marks",
    name: "하워드 막스",
    nameEn: "Howard Marks",
    era: "1946~",
    oneLine: "우리는 어디로 가는지 모른다. 그러나 *어디에 있는지*는 알 수 있다.",
    who:
      "Oaktree Capital Management(약 2,000억 달러 운용, 부실채권 1위) 공동창업자. 1990년부터 비정기적으로 발행하는 *Oaktree Memo*는 워런 버핏이 \"메일함에 오면 가장 먼저 연다\"고 공개 인정. 닷컴버블·금융위기 모두 *고점 부근에서 경고 메모*. 번역서: 『투자에 대한 생각』, 『투자와 마켓 사이클의 법칙』.",
    methods: [
      { name: "Second-Level Thinking (2차 사고)", def: "1차: \"좋은 회사니까 산다.\" 2차: \"*이미 다 알려진* 좋은 회사인데 가격엔 뭐가 반영돼 있나?\" 평균 이상 수익은 2차 사고에서만 나온다." },
      { name: "Pendulum of Sentiment (심리 시계추)", def: "시장은 공포와 탐욕 사이를 진자처럼 오간다. *중간에 머무는 시간이 가장 짧다*." },
      { name: "Taking the Market's Temperature", def: "VIX·정크본드 스프레드·IPO 분위기·신용 조건으로 *지금이 사이클의 어디인가*를 측정." },
      { name: "Risk as Permanent Loss", def: "변동성 ≠ 리스크. 진짜 리스크는 *영구 손실 가능성*." },
    ],
    matchPrinciples: [4, 1],
    matchExplain:
      "**원칙 4(파생 지표) + 원칙 1(거시) 정확히 일치**. 우리 원칙 4가 VIX·PCR이라면 막스는 그것을 *\"시장 온도\"라는 단일 개념*으로 묶고 신용 스프레드까지 포함. 차이점: 우리는 *진입 신호*로 쓰지만, 막스는 *공격성 조절 다이얼*로 쓴다. \"온도가 뜨거우면 *덜 공격적으로* 산다.\" *\"VIX 낮을 때 비중 자동 축소\" 룰 한 줄*만 추가하면 막스 버전.",
    quotes: [
      { en: "You can't predict. You can prepare.", ko: "예측할 수 없다. 그러나 준비할 수는 있다.", source: "Oaktree Memo, 2001" },
      { en: "Being too far ahead of your time is indistinguishable from being wrong.", ko: "너무 일찍 맞춘 것은 틀린 것과 구별되지 않는다.", source: "The Most Important Thing, 2011" },
    ],
    wifeAction: [
      "매수 직전 \"다른 사람들은 이걸 어떻게 보고 있을까? 내 생각이 그것과 어떻게 다른가?\" 1문장 자문 — 답이 안 나오면 보류.",
      "월 1회 시장 온도 체크: VIX 30 이상 = 비중 늘림 신호, VIX 12 이하 = 신중 신호.",
    ],
    flashTerms: [
      { front: "2차 사고 (Second-Level Thinking)", back: "가격에 *이미 무엇이 반영돼 있는가*를 묻는 사고. 1차 사고만 하면 평균밖에 못 번다" },
      { front: "심리 시계추", back: "공포·탐욕 사이의 진자 운동. *균형점에 오래 머물지 않는다*" },
      { front: "영구 손실 (Permanent Loss)", back: "회복 불가능한 손실. 변동성과 다르다. 진짜 리스크는 이것" },
    ],
    pitfall:
      "\"막스도 못 맞췄으니 예측 자체가 무의미\" — 막스는 *예측 부정이 아니라 예측 의존을 부정*했다. 매번 \"사이클의 어디인가\" 추정치를 *수치로* 제시(2007 정크본드 스프레드). \"준비\"란 *추정에 따라 비중을 조절*하는 것이지 *손 놓고 있는 것*이 아니다.",
  },

  /* ── 윌리엄 오닐 ── */
  {
    id: "oneil",
    name: "윌리엄 오닐",
    nameEn: "William O'Neil",
    era: "1933~2023",
    oneLine: "시장의 진짜 강자에 *거래대금*이 따라붙을 때만 산다.",
    who:
      "*Investor's Business Daily(IBD)* 창업자. NYSE 사상 *최연소 회원권 매입자*(30세). 1953년 이후 *모든 폭등 종목*을 역추적해 공통점 7개를 추출 → CAN SLIM 완성. 1962~63년 자기 계좌를 5천 달러 → 20만 달러로 만든 트레이드 유명. 번역서: 『최고의 주식 최적의 타이밍』.",
    methods: [
      { name: "CAN SLIM (7요소)", def: "C(분기 EPS +25%) A(연 EPS 3년 +25%) N(신제품·신경영진·신고가) S(*거래량* 폭증) L(업종 1~2위) I(기관 매수 누적) M(시장 상승 추세)." },
      { name: "Cup-and-Handle (컵 위드 핸들)", def: "7~65주 라운드 바닥 + 짧은 손잡이 형성 후 *거래량 40~50% 증가하며 돌파*할 때 매수." },
      { name: "8% Stop-Loss", def: "매수가 대비 -8% 무조건 손절. *예외 없음*." },
      { name: "Pivot Point Entry", def: "차트 패턴 돌파 시점 *그 순간*에 진입. 늦으면 안 산다." },
    ],
    matchPrinciples: [3, 1],
    matchExplain:
      "**원칙 3(거래대금) + 원칙 1(시장 방향)에 정확히 일치**. 원칙 3의 \"거래대금 추세\"가 오닐 시스템의 **S**(Supply & Demand)와 거의 동일. 차이점: 오닐은 *개별 종목 거래량*에 집중, 우리는 *시장 전체 거래대금*도 본다 — 둘을 결합하면 *이중 필터*. 오닐의 **M**(Market direction)이 우리 원칙 1과 짝.",
    quotes: [
      { en: "What seems too high and risky to the majority generally goes higher.", ko: "대중에게 너무 비싸 보이는 것이 더 오르고, 싸 보이는 것이 더 떨어진다.", source: "How to Make Money in Stocks, 1988" },
      { en: "The whole secret to winning in the stock market is to lose the least amount possible when you're not right.", ko: "주식의 승리 비결 전부는, 틀렸을 때 *최소한*만 잃는 것이다.", source: "1995 인터뷰" },
    ],
    wifeAction: [
      "매수 종목은 *반드시 일평균 거래량의 1.5~2배 이상*이 터지는 날에 진입. 거래량 평범한 날 사면 절반은 가짜 신호.",
      "*-8% 손절 룰*은 우리 원칙 5의 -15%보다 빡빡함. 한국 변동성 고려해 -10~15% 사이로 본인 룰 정하기.",
    ],
    flashTerms: [
      { front: "CAN SLIM", back: "오닐의 7요소 시스템. 펀더멘털(C/A/I) + 기술적(N/S/L) + 시장(M) 결합" },
      { front: "Cup-and-Handle", back: "컵 모양 바닥 + 짧은 손잡이 후 거래량 폭증과 함께 돌파. 가장 유명한 매수 패턴" },
      { front: "Pivot Point", back: "차트 패턴이 돌파되는 순간의 가격. 늦게 사면 손절폭만 커진다" },
    ],
    pitfall:
      "\"CAN SLIM은 옛날 방식\" — 오닐 본인이 \"*전체를 다 쓰지 않으면 작동 안 한다*\"고 못 박았다. 특히 *M(시장 방향)*과 *8% 손절*을 빼고 종목 발굴만 쓰면 *약세장에 다 날린다.* AAII 백테스트의 연 24%는 *전 규칙* 적용 결과. 부분 적용은 함정.",
  },

  /* ── 벤저민 그레이엄 ── */
  {
    id: "graham",
    name: "벤저민 그레이엄",
    nameEn: "Benjamin Graham",
    era: "1894~1976",
    oneLine: "싸게 사라. 그래야 틀려도 안 죽는다.",
    who:
      "가치투자의 아버지, 워런 버핏의 컬럼비아대 스승. 1934년 『증권분석』으로 *주식을 도박이 아닌 분석 대상*으로 끌어올린 인물. 1949년 『현명한 투자자』는 버핏이 \"지금까지 쓰여진 투자서 중 단연 최고\"라 부르는 책. 1929년 대공황에서 본인 펀드가 70% 폭락한 *실패의 산물*로 안전마진을 만들었다는 점이 중요.",
    methods: [
      { name: "Margin of Safety (안전마진)", def: "내재가치보다 충분히 낮은 가격에 사서 분석 오차·악재·시장 변동을 흡수." },
      { name: "Mr. Market", def: "시장을 매일 다른 가격을 부르는 *조울증 동업자*로 의인화. 흥분 시 팔고 우울 시 사라." },
      { name: "Intrinsic Value (내재가치)", def: "가격(price)과 가치(value)는 다르다. 둘의 격차가 곧 기회." },
      { name: "Defensive vs. Enterprising Investor", def: "시간 없으면 인덱스+채권, 시간 있으면 개별 종목 분석." },
    ],
    matchPrinciples: [5],
    matchExplain:
      "**원칙 5(분산·리스크)와 정면 일치**. 그레이엄은 \"최소 10~30종목 분산\"을 명시. 다만 거시 자금흐름이나 거래대금 같은 *시장 심리 지표*는 거의 안 봤다 — 그는 *기업 재무제표 중심*. 우리 5원칙은 그레이엄의 안전마진을 *거시 + 심리 지표*로 확장한 셈.",
    quotes: [
      { en: "In the short run, the market is a voting machine, but in the long run, it is a weighing machine.", ko: "단기적으로 시장은 인기투표기지만, 장기적으로는 저울이다.", source: "Security Analysis, 1934" },
      { en: "The investor's chief problem — and even his worst enemy — is likely to be himself.", ko: "투자자의 가장 큰 적은 자기 자신이다.", source: "The Intelligent Investor" },
    ],
    wifeAction: [
      "사고 싶은 종목이 생기면 *현재가의 70%까지 빠져도 후회 안 할지* 자문. 후회할 것 같으면 그 가격이 곧 안전마진 기준선.",
      "뉴스로 흥분해서 사고 싶을 때 \"지금 Mr. Market이 조증인가?\" 한 번 묻기.",
    ],
    flashTerms: [
      { front: "Mr. Market (미스터 마켓)", back: "매일 다른 가격을 부르는 변덕쟁이 동업자. 그의 *기분*에 휘둘리지 말고 *가격*만 이용" },
      { front: "내재가치 (Intrinsic Value)", back: "가격이 아닌, 기업이 실제 벌어들이는 현금 흐름에 기반한 *진짜 가치*" },
      { front: "Value Trap (가치 함정)", back: "싸 보여서 샀는데 사실 *영구 가치 하락* 중인 종목. 그레이엄도 경계" },
    ],
    pitfall:
      "\"싸면 산다\" — 안전마진은 *가치 대비* 싼 것이지 *과거 가격 대비* 싼 게 아니다. 50% 떨어진 종목도 내재가치가 80% 빠진 회사면 여전히 비싸다. PER만 낮다고 그레이엄식이 아니다.",
  },

  /* ── 존 보글 ── */
  {
    id: "bogle",
    name: "존 보글",
    nameEn: "John Bogle",
    era: "1929~2019",
    oneLine: "건초더미에서 바늘 찾지 말고, 건초더미 통째로 사라.",
    who:
      "1974년 Vanguard 창립, 1976년 세계 최초의 *개인투자자용 S&P 500 인덱스 펀드* 출시. 출시 당시 \"Bogle's Folly(보글의 바보짓)\"라 조롱받았지만 50년 뒤 Vanguard는 운용자산 9조 달러+의 세계 2위 자산운용사. Vanguard를 *고객(펀드 투자자)이 회사를 소유*하는 구조로 만들어 수수료를 업계 평균의 1/4로 낮춘 게 핵심. *비용이 곧 수익률*이라는 한 줄을 평생 증명.",
    methods: [
      { name: "Index Fund", def: "시장을 *이기려* 하지 말고 시장 *그 자체*를 사라." },
      { name: "Cost Matters Hypothesis (비용 가설)", def: "장기 수익률을 결정하는 가장 강력한 변수는 *수수료*. 1.5% vs 0.1% 차이가 30년 후 $15,000+ 차이." },
      { name: "Stay the Course", def: "시장 타이밍·종목 교체는 *대부분 손해*. 들고 버텨라." },
      { name: "Reversion to the Mean (평균회귀)", def: "최근 잘나간 펀드는 곧 평범해진다. 인기 펀드 쫓아가지 마라." },
    ],
    matchPrinciples: [5],
    matchExplain:
      "**원칙 5의 극단적 버전**. 보글은 \"섹터 분산을 넘어 시장 전체 분산\". 5원칙의 ETF/현금 비중 관리는 보글에서 왔다. 다만 보글은 원칙 1~4(거시·EPS·거래대금·파생)를 *전부 거부* — \"그건 다 노이즈\". 그래서 우리는 *코어(인덱스) + 위성(개별주)* 구조로 보글을 부분 채택.",
    quotes: [
      { en: "Don't look for the needle in the haystack. Just buy the haystack!", ko: "건초더미에서 바늘을 찾지 마라. 건초더미를 통째로 사라!", source: "Little Book of Common Sense Investing, 2007" },
      { en: "In investing, you get what you don't pay for.", ko: "투자에서는 *지불하지 않은 만큼* 돌려받는다.", source: "보글 인터뷰" },
    ],
    wifeAction: [
      "개별주에 자신 없는 자금은 *S&P 500 ETF(VOO/SPY) 또는 KODEX 200*에 묶어두기. 5원칙 적용은 종목 선택 시에만.",
      "펀드/ETF 살 때 *총보수(expense ratio)* 무조건 확인. 1% 넘으면 의심, 0.3% 이하 선호.",
    ],
    flashTerms: [
      { front: "인덱스 펀드 (Index Fund)", back: "시장 전체(S&P 500·KOSPI 200 등)를 그대로 따라가는 펀드. 종목 선정 비용 0" },
      { front: "총보수 (Expense Ratio)", back: "ETF·펀드가 매년 떼가는 수수료. 0.1% 차이가 30년이면 원금의 26% 차이" },
      { front: "Stay the Course", back: "시장 폭락에도 *팔지 않고 들고 가는 것*. 인덱스 투자의 전제" },
    ],
    pitfall:
      "\"인덱스만 사면 무조건 이긴다\" — 보글의 전제는 *미국 시장 = 자본주의 엔진 + 우상향*. 한국·일본 *박스권 시장*에선 인덱스 buy & hold가 30년 손실일 수 있다(KOSPI 2007년 2,000pt → 2020년에도 2,000pt). *코어 일부 + 5원칙 종목 선택* 병행이 정답.",
  },

  /* ── 짐 사이먼스 ── */
  {
    id: "simons",
    name: "짐 사이먼스",
    nameEn: "Jim Simons",
    era: "1938~2024",
    oneLine: "시장에는 수학적 패턴이 있다. 우리는 그걸 데이터로 찾았다.",
    who:
      "MIT·하버드 수학교수 출신. *천릉-사이먼스 이론*으로 수학계 거물이 된 뒤 1982년 Renaissance Technologies 창립. 대표 펀드 **Medallion**은 1988~2018년 *수수료 차감 후 연 39.1%*(차감 전 66%)로 *인류 역사상 가장 높은 장기 수익률*. 비교: 버핏 평생 연 20% 수준. 1993년 외부 자금 차단, *직원과 가족만* 투자 가능. 채용은 월스트리트 출신 0명 — *수학자·물리학자·암호학자·천체물리학자*만.",
    methods: [
      { name: "Statistical Pattern Recognition", def: "가격 시계열에서 *수천 번 반복 검증되는* 미세한 비효율 발견." },
      { name: "Data-First, Theory-Last", def: "\"우리는 모델로 시작하지 않는다. 데이터로 시작한다.\"" },
      { name: "Short Holding Period", def: "평균 보유 1~2일. 패턴이 발견되면 빠르게 들어가고 나옴." },
      { name: "Signal Combination", def: "수백 개 약한 신호를 *조합*해서 강한 우위 만들기." },
    ],
    matchPrinciples: [4],
    matchExplain:
      "**원칙 4의 *과학적 정당성*을 제공**. 효율적 시장 가설(EMH)이 맞다면 V-KOSPI·PCR 같은 지표는 무의미해야 한다. 그러나 사이먼스가 30년간 연 66%로 *증명*: **시장은 완전히 효율적이지 않고, 수학적·통계적 패턴이 존재한다.** 즉 V-KOSPI 40 넘을 때 시장 바닥인 *경향*이 있다는 우리 가설은 *공짜 점심이 아니라 사이먼스급 두뇌도 인정한 진짜 신호*. 우리는 사이먼스처럼 1초 수천 번 매매할 수 없지만, *주 단위로 극단값에서 비중 조절*하는 수준의 신호는 비전공자도 활용 가능.",
    quotes: [
      { en: "Patterns of price movement are not random. However, they're close enough to random so that getting some edge out of it is not easy.", ko: "가격 움직임의 패턴은 무작위가 아니다. 다만 *무작위에 충분히 가까워서* 그걸로 우위를 얻기는 쉽지 않다.", source: "인터뷰" },
      { en: "In this business, it's easy to confuse luck with brains.", ko: "이 바닥에서는 *운*과 *실력*을 혼동하기 쉽다.", source: "Numberphile 인터뷰, 2015" },
    ],
    wifeAction: [
      "*지표 1개에 베팅 금지*. 사이먼스는 수백 개 신호를 *조합*해서 우위를 만들었다. 5원칙도 *5개 모두 같은 방향을 가리킬 때*만 강한 시그널.",
      "V-KOSPI·PCR·외국인 선물 누적 — 셋이 *같은 극단값*일 때 기록해두고 1~2년 뒤 결과 확인 (개인 백테스트).",
    ],
    flashTerms: [
      { front: "정량투자 (Quant Investing)", back: "데이터·수학으로 시장의 통계적 비효율을 찾아 매매하는 방식. *직관 X, 통계 O*" },
      { front: "Medallion Fund", back: "30년 평균 연 66% 수익(역사상 최고). *시장에 패턴이 존재한다는 살아있는 증거*" },
      { front: "효율적 시장 가설 (EMH)", back: "시장이 모든 정보를 즉시 반영한다는 이론. 사이먼스가 30년에 걸쳐 *반증*함" },
    ],
    pitfall:
      "\"퀀트는 무조건 이긴다\" — Medallion은 *200명+ PhD, 매년 수억 달러 R&D, 1989년부터 누적 데이터*의 결과. 개인이 RSI·MACD 한두 개로 흉내내면 *오히려 거래비용으로 손실*. *철학(패턴은 있다)*만 차용하고 *주 단위·월 단위 저빈도 신호*에 한정.",
  },

  /* ── 박영옥 ── */
  {
    id: "park",
    name: "박영옥",
    nameEn: "Park Young-Ok",
    era: "1956~",
    oneLine: "주식을 사지 말고, 그 회사의 농지를 사라.",
    who:
      "한국의 대표적 *슈퍼개미*. 1997 IMF로 증권사 지점장 자리를 잃고, 2001 9·11 폭락장에서 전업투자자로 자립. 4,300만 원으로 시작해 *1,000~2,000억 원대 자산*을 일군 입지전적 인물. 자신의 투자법을 \"농심(農心)투자\"라 부르며 *기업과 동행·소통*을 강조. 2006년 투자회사 스마트인컴 설립, *코스닥 중소형주의 5% 이상 지분을 보유한 공시 슈퍼개미*로 자주 등장. 저서: 『주식, 농부처럼 투자하라』, 『주식투자 절대원칙』.",
    methods: [
      { name: "농심(農心)투자", def: "농부가 씨 뿌리고 가꾸듯 기업과 *몇 년에 걸쳐 동행*." },
      { name: "기업 IR 직접 방문", def: "분기마다 투자기업 IR·주총 참석, 경영진과 직접 대화." },
      { name: "3년 이상 공부 후 투자", def: "한 산업·기업을 *최소 3년* 들여다본 뒤에야 매수." },
      { name: "소외주 + 중소형 가치주", def: "시장이 안 보는 알짜 코스닥 기업에 집중 매수." },
    ],
    matchPrinciples: [2, 1],
    matchExplain:
      "**원칙 2(Forward EPS) + 원칙 1(거시)의 한국 토착 버전**. \"Forward EPS\"라는 용어는 안 쓰지만, *기업 IR을 직접 만나 향후 1~2년 매출·이익을 예측*하는 방식이 사실상 Forward EPS 추정. 우리 민지니 버전은 *증권사 컨센서스 수치*를 활용 — 박영옥은 그 수치를 *자기 발로 검증*하는 셈. *남편 없이 민지니가 따라하기는 어려운* 영역이 함정.",
    quotes: [
      { en: "주식을 사지 말고 기업을 사라. 농부가 농작물에 애정을 갖고 땅을 소중히 여기듯, 기업을 소중히 여기고 동행하라.", ko: "동일", source: "『주식, 농부처럼 투자하라』" },
      { en: "어려울 때 돕는다는 생각으로 사고, 이익은 나눈다는 생각으로 팔아라.", ko: "동일", source: "투자 10계명" },
    ],
    wifeAction: [
      "보유 종목의 *분기 IR 자료(DART) + 분기 실적발표 보도자료* 1년에 4번만 챙겨 읽기 — 박영옥의 방문 IR을 *문서 IR*로 대체.",
      "사고 싶은 종목은 *3개월간 관찰 후* 매수 — 박영옥의 \"3년 공부\"를 *3개월 관찰*로 축소한 민지니 버전.",
    ],
    flashTerms: [
      { front: "농심(農心)투자", back: "기업과 *장기간 동행*하며 그 기업의 농지를 가꾸듯 투자하는 박영옥의 철학" },
      { front: "IR (Investor Relations)", back: "기업이 투자자에게 실적·전망을 설명하는 활동. DART 공시·기업설명회 자료로 접근 가능" },
      { front: "슈퍼개미", back: "지분 5% 이상 보유 시 공시 의무가 생기는 *개인 대주주*. 박영옥은 다수 코스닥 기업의 슈퍼개미" },
    ],
    pitfall:
      "\"박영옥처럼 들고 있으면 된다\" — 박영옥은 *그가 직접 만나본 기업, 그의 안목으로 검증한 기업*만 길게 든다. 그가 *지분 정리한 종목*도 많다. \"장기보유 = 무조건 옳다\"가 아니다. *나쁜 회사를 오래 들고 있는 건 그냥 손실 누적*. 박영옥도 사실상 *액티브하게 종목 교체*한다.",
  },

  /* ── 존리 ── */
  {
    id: "johnlee",
    name: "존리",
    nameEn: "John Lee",
    era: "1958~",
    oneLine: "사교육비 끊고 그 돈으로 주식을 사라. 주식은 *안 파는 기술*이다.",
    who:
      "재미교포 출신 펀드매니저. 1991~2005년 미국 Scudder Stevens & Clark에서 **Korea Fund**를 운용해 14년간 *연평균 약 24%*로 월스트리트에 한국 주식을 알린 *코리아펀드 신화*의 주역. 2014년 메리츠자산운용 대표 부임, *\"주식은 사고파는 게 아니다\"·\"사교육비를 주식에 써라\"* 메시지로 2020년 동학개미 운동의 상징적 멘토. 2022년 차명투자 의혹으로 대표직 사임. 한국에 *장기·분산 투자 문화*를 대중에게 보급한 공이 가장 크다.",
    methods: [
      { name: "장기 보유 (Buy & Hold)", def: "주식은 *안 파는 기술*이다." },
      { name: "사교육비→주식 캠페인", def: "매월 *학원비 100만원*을 ETF/펀드로 돌리면 자녀 대학 즈음 수억 자산." },
      { name: "업종 대표주 집중", def: "삼성전자·현대차 등 *글로벌 경쟁력 있는 한국 1등 기업*." },
      { name: "연금·ETF 활용", def: "개인이 직접 종목 못 고르면 *연금저축·IRP + 인덱스 ETF*." },
    ],
    matchPrinciples: [5],
    matchExplain:
      "**원칙 5(분산) + *행동 코칭* 영역에 가까움**. 5원칙 중 *비전공자가 가장 잃기 쉬운 부분 — \"팔지 말고 버티는 것\"*을 끊임없이 강조한 점에서 *심리적 지주* 역할. 다만 존리는 원칙 1~4(거시·EPS·거래대금·파생)를 *거의 무시* — 그래서 박스권 한국 시장에서 메리츠코리아 펀드가 -4.82%(5년) 부진했다는 비판이 있다. 우리 5원칙은 *존리의 장기 마인드 + 5원칙의 시장 환경 인식*을 결합.",
    quotes: [
      { en: "주식은 사고파는 게 아니라, *안 파는 기술*이다.", ko: "동일", source: "다수 인터뷰" },
      { en: "사교육비를 줄여 그 돈으로 자녀에게 *주식을 사주는 것*이 진짜 교육이다.", ko: "동일", source: "KBS 아침마당, 2020" },
    ],
    wifeAction: [
      "매월 일정 금액(예: 50만원)을 *연금저축 + KODEX 200/S&P 500 ETF*에 자동이체 — 5원칙 종목 선택과 *별개의 안전판*.",
      "폭락장에서 *매도 버튼을 누르고 싶을 때* 존리의 \"안 파는 기술\" 한 줄을 떠올리기.",
    ],
    flashTerms: [
      { front: "연금저축 + IRP", back: "세액공제(최대 900만원) + 비과세 복리. *비전공자용 최강 도구*" },
      { front: "코리아펀드", back: "존리가 1991~2005년 운용해 *연 24%*를 기록한 한국 주식 펀드. 월가에 한국을 알린 펀드" },
      { front: "동학개미", back: "2020년 코로나 폭락 후 한국 개인 투자자들의 대규모 주식 매수 운동" },
    ],
    pitfall:
      "\"존리처럼 *장기 보유만* 하면 된다\" — 존리도 2022년 차명투자 의혹으로 사임, 메리츠코리아 펀드는 5년 -4.82%. *장기 보유는 기업의 성장이 전제일 때만 작동*. 추세 꺾이고 EPS가 빠지는 종목까지 묻어두면 *손실 누적*. 존리 본인도 *주기적으로 종목 교체*를 했다. *마인드는 OK, 종목 무관 buy & hold는 NO* — 원칙 2(EPS 추세 꺾이면 비중 축소)가 그래서 필요하다.",
  },
];
