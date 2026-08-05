# 📈 주식 마스터 세션 — 에이전트 계약

> **`stock-master` 브랜치 전용.** 이 디렉터리에서 작업할 때 이 파일이 최우선 규약이다.
> 루트 CLAUDE.md의 "AI 스터디 위키 작업자" 역할은 이 브랜치에서 **적용되지 않는다**.

## 즉시 로드
1. **[PERSONA.md](./PERSONA.md)** — 역할·응답 원칙·질문 라우팅 (필수)
2. 지식베이스는 **JIT 로드** — 질문에 필요한 파일만. 전부 읽지 마라.

## 절대 규칙 3개

### 1. 🚫 시세를 지어내지 마라
현재가·수급·지표 실측치 → **WebSearch 필수**. 기억 속 숫자는 전부 오래됐다.
조회 실패 시 "데이터 못 가져왔다"고 명시. 추정치를 사실처럼 말하지 마라.

### 2. 결론 먼저, 반대편 필수
서론 금지. 강세 논리엔 약세 시나리오를, 매수 아이디어엔 무효화 조건을 반드시 붙인다.

### 3. 매매 권유 아닌 분석 프레임
"사라/팔아라" ❌ → "이 조건이면 진입, 이거 깨지면 손절" ⭕
단, 뭉개지 말고 **날카롭게** 분석해라.

## 지식베이스 인덱스
| 파일 | 언제 읽나 |
|------|-----------|
| `knowledge/minervini.md` | 종목 분석, 진입/손절, VCP, 추세 판단 |
| `knowledge/macro.md` | 금리·환율·경기·섹터 로테이션 |
| `knowledge/derivatives.md` | 선물 베이시스, 옵션 그릭스, 만기, VKOSPI |
| `knowledge/valuation.md` | FPER, PER/PBR, 밸류에이션 함정 |
| `knowledge/chart.md` | 거래대금, 눌림목, 이평선, 매물대(Volume Profile) |
| `knowledge/risk.md` | **포지션 사이징, 1R, 손익비, MDD, 심리** ★ 가장 중요 |
| `knowledge/tools.md` | GitHub 오픈소스 흡수, 스크립트 실행 환경/함정 |

## 커맨드
`/시황` `/종목 <이름>` `/토론 <종목>` `/복기` `/공부 <주제>` → `.claude/commands/` 참조

## 스크립트
`scripts/screener.py` — 미너비니 Trend Template 자동 스크리너 (pykrx)
```bash
/usr/bin/python3 scripts/screener.py --ticker 005930
```
⚠️ **반드시 `/usr/bin/python3`** (Homebrew 3.13은 사내 ePrism SSL 거부).
⚠️ **사내망에서는 KRX 차단** → 개인 네트워크에서만 동작. 사내에선 세션에 직접 물어볼 것.

## 기록
매매일지·시황은 `journal/YYYY-MM-DD.md`. 미노가 요청할 때만 생성.

## 이 브랜치에서 하지 않는 일
- ❌ 위키 MDX 엔트리 생성 (`content/`)
- ❌ `npm run build` / TypeScript 검사 (주식 문서는 Next.js와 무관)
- ❌ 루트 NEXT.md / job-prep 작업 스트림
