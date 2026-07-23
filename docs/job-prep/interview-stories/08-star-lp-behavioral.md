# 행동면접 스토리 뱅크 — STAR / Amazon Leadership Principles

> 5년차 iOS 엔지니어. 두 개의 실제 시스템에서 도출한 행동면접 답변 뱅크.
> **시스템 A = 카셰어링 앱** (전국 단위 카셰어링/모빌리티 iOS 앱, RIBs+ReactorKit+RxSwift, 50개 SPM 모듈, 32만 LOC, 화면 100+개, BLE 디지털 카키)
> **시스템 B = AI 개발 하네스** (Claude Code 플러그인 기반 iOS 개발 자동화 하네스, 59 skills / 17 agents / 579 박제 / MCP 서버 / 46 lifecycle hook)
>
> 지표에 **[추정]** 표시가 붙은 것은 근거 기반 합리적 추정치이며, 독립 벤치마크로 재검증되지 않았음. 면접에서 인용 시 "제 측정 기준으로는" 이라는 단서를 붙일 것.
>
> **사용법**: 각 스토리는 제목 → S/T/A/R → 한 줄 교훈 구조. 한 LP당 1~2개. 실제 면접에서는 30초 압축 버전(제목+R)과 3분 풀버전(STAR 전체) 두 개를 준비.

---

## 0. 스토리 인덱스 (LP 매핑)

| # | 스토리 | 주 LP | 보조 LP |
|---|--------|-------|---------|
| 1 | 리뷰 게이트 없는 배포 파이프라인에 유일한 회귀 방어선을 만들다 | Ownership | Bias for Action |
| 2 | 실수를 자산으로 바꾸는 자기개선 루프를 설계하다 | Ownership | Learn & Be Curious |
| 3 | 맨손 grep→read 루프를 전용 탐색 엔진으로 대체하다 | Invent & Simplify | Deliver Results |
| 4 | 4-pane 워커풀을 버리고 SOLO로 후퇴하다 | Invent & Simplify | Are Right A Lot |
| 5 | "필드가 nil로 온다"의 진짜 원인을 64% 통계로 추적하다 | Dive Deep | Insist on Highest Standards |
| 6 | 딥링크 상세 진입이 리스트에 의존하던 구조를 파고들다 | Dive Deep | Deliver Results |
| 7 | 테스트가 0개 실행되던 스킴을 복구해 회귀 추적성을 세우다 | Deliver Results | Ownership |
| 8 | 편도 특가딜 QA 배치를 한 달간 완주하다 | Deliver Results | Bias for Action |
| 9 | silent-nil을 3-오라클 계약 감사로 구조적으로 차단하다 | Insist on Highest Standards | Invent & Simplify |
| 10 | AI가 짠 코드에 "왜" 주석을 강제하는 게이트를 세우다 | Insist on Highest Standards | Ownership |
| 11 | mock이 릴리스에 새는 걸 17곳 가드로 막다 | Bias for Action | Ownership |
| 12 | "빌드 깨진 채 완료 거짓말"을 15줄로 차단하다 | Bias for Action | Invent & Simplify |
| 13 | Rx→async 전면 전환을 하지 않기로 결정하다 | Are Right A Lot | Dive Deep |
| 14 | 하네스 변경을 신뢰구간으로 계량해 채택 여부를 판정하다 | Are Right A Lot | Insist on Highest Standards |
| 15 | LLM 에이전트를 프로덕션에 태우는 법을 스스로 학습하다 | Learn & Be Curious | Invent & Simplify |
| EN-1 | (English) The only prod-regression gate | Ownership | — |
| EN-2 | (English) Retreating from multi-worker to SOLO | Are Right A Lot | — |

---

## 1. Ownership — 리뷰 게이트 없는 배포에 유일한 방어선을 만들다

**제목: "PR 리뷰 없이 바로 머지되는 팀에서, 배포 회귀를 막는 마지막 문을 내가 세웠다"**

- **S (상황):** 카셰어링 앱은 규모가 크지만(32만 LOC, 화면 100+개), PR 리뷰 게이트 없이 통합 브랜치에 바로 머지·push되는 워크플로였습니다. 즉 사람 리뷰어가 회귀를 잡아주는 안전망이 구조적으로 없었습니다. 과거에 하드코딩된 환경 키, mock이 프로덕션에 유출, 서버 암호화 필드 silent-nil 같은 사고가 실제로 배포까지 나갔던 이력이 있었습니다.
- **T (과제):** 리뷰어를 늘리는 건 조직상 불가능했습니다. 사람 병목 없이, push/머지 직전에 "이미 겪은 사고 클래스"만이라도 자동으로 걸러내는 게이트가 필요했습니다.
- **A (행동):** 과거 프로덕션 사고 기록에서 재발 시그니처를 역산해(하드코딩 환경키·mock 유출·simulator 우회·`Thread.sleep`·enc 필드 silent-nil), 이걸 **이번 diff에 추가된 라인에만** 스캔하는 게이트를 만들었습니다(ship-radar). 핵심은 전체 코드가 아니라 "새로 추가된 위험"만 보게 해서 노이즈를 없앤 것입니다. push 직전 lifecycle hook으로 배선해 BLOCK/REVIEW/PASS 판정을 내리게 했습니다.
- **R (결과):** PR 게이트가 없는 이 팀에서 사실상 유일한 프로덕션 회귀 방어선이 됐습니다. silent-nil처럼 컴파일·mock QA·diff 리뷰를 전부 통과하고 실서버에서만 터지는 유형을 배포 전에 잡게 됐고, 사고 한 건당 수 시간~수일의 hotfix 대응 비용을 선제적으로 제거했습니다 **[추정]**.
- **교훈:** 안전망이 없는 환경을 발견하면, 리뷰어가 없다고 탓하는 대신 내가 자동화된 마지막 문을 만든다.

---

## 2. Ownership — 실수를 자산으로 바꾸는 자기개선 루프

**제목: "같은 실수를 두 번 하면 그건 개인 실수가 아니라 시스템 결함이라고 규정했다"**

- **S (상황):** AI 에이전트로 iOS 개발을 하다 보면 같은 함정(silent-nil, mock 유출, SPM 그래프 크래시, 검색 0건을 기능 부재로 오판)에 반복해서 빠졌습니다. 세션마다, 팀원마다 같은 벽에 다시 부딪혔고 지식이 유실됐습니다.
- **T (과제):** 개인 메모가 아니라, 한 사람의 실패가 팀 전체의 영구 자산이 되고, 반복될수록 점점 강한 방어로 승격되는 구조가 필요했습니다.
- **A (행동):** "환각 격상 사다리"를 명문화했습니다 — 1회 발생은 박제(메모리 기록), 2회는 에이전트/스킬에 inline 규칙, 3회는 운영룰(HARD RULE), 4회는 hook 코드로 강제, fix 후에도 재발하면 구조 ADR. 그리고 이 지식을 개인 로컬이 아니라 **git-native 팀 공유 자산**으로 만들었습니다 — 메모리를 추가하면 자동으로 PR 생성 → squash auto-merge → 전 팀원 세션에 즉시 노출(사용자 개입 0). 결과적으로 579개 박제, 152개 솔루션, 58개 회고가 쌓였습니다.
- **R (결과):** 같은 실수를 구조적으로 두 번 못 하게 됐습니다. 신규 인원이 clone하는 순간 수개월치 축적된 함정 회피를 그대로 상속받고, 막혔을 때 관련 과거 해결책이 에러 감지 hook으로 자동 튀어나옵니다. 시스템 자체가 자기 실패 경험을 코드 방어 장치로 folding하며 진화합니다.
- **교훈:** 실수를 1급 시민으로 대우하면, 팀 규모가 커지고 세션이 늘수록 복리로 강해지는 시스템이 된다.

---

## 3. Invent & Simplify — 맨손 grep을 탐색 엔진으로 대체하다

**제목: "탐색 비용이 반복 작업의 숨은 세금이라는 걸 깨닫고 도구로 없앴다"**

- **S (상황):** 대규모 모노레포(50모듈, 1,910 Swift 파일)에서 코드 위치를 찾을 때 매번 grep→read→다시 grep 루프를 돌았습니다. 느리고, `.build` 디렉토리까지 훑어 오탐이 나고, 무엇보다 "검색 0건"을 "기능이 없다"로 오판하는 사고가 반복됐습니다(BLE 관련 기능을 "없음"으로 2회 오답).
- **T (과제):** LLM 에이전트가 환각 없이, 초 단위로 코드 위치를 특정하게 만들어야 했습니다.
- **A (행동):** 캐시 + 시맨틱 기반 전용 탐색 도구(code-locate)와 코드 근거 답변 도구(ask-bot)를 만들고, "맨손 grep→read 루프 금지"를 HARD RULE로 못박았습니다. 광역 grep이나 `.build` 미제외 같은 footgun은 hook에서 아예 차단(exit 2)했습니다. 한글 UI 용어 → 영어 코드 심볼 매핑, 도메인 동의어 확장(단일 키워드 grep 0건 → 환각 방지)까지 넣었습니다.
- **R (결과):** 위치 특정이 0.1~0.5초(반복 시 0.06초)로 떨어졌고, LLM 미사용이라 환각이 0입니다 **[추정: 저장소 내 측정치]**. 광역 탐색은 격리된 서브에이전트로 빼서 메인 컨텍스트에 요약만 반환 — 9K vs 15K 토큰, 약 40% 컨텍스트 절감 **[추정]**.
- **교훈:** 반복되는 수작업은 대개 도구화되지 않은 세금이다. 세금을 찾아 엔진으로 갈아끼운다.

---

## 4. Invent & Simplify — 4-pane 워커풀을 버리고 SOLO로 단순화

**제목: "더 정교한 병렬 오케스트레이션을 만드는 대신, 과감히 걷어냈다"**

- **S (상황):** 초기에 tmux 4-pane 멀티워커풀로 여러 에이전트를 병렬 구동하는 오케스트레이션을 만들었습니다. 하지만 pane 간 send-keys IPC, pane-grep으로 상태 판정, 역할 priming이 실패의 근원이 됐습니다(전송 실패·관측 실패·기동 hang·컨텍스트 도미노 — 8회 실측).
- **T (과제):** 더 복잡한 조율 로직을 덧붙일지, 아니면 근본적으로 다른 모델로 갈지 결정해야 했습니다.
- **A (행동):** 실패 taxonomy 25건+와 외부 문헌(MAST, Cognition) 3-소스 수렴 근거로, 멀티워커풀을 **폐기**하기로 ADR을 썼습니다. 관련 52개 파일을 물리 삭제하고, SOLO 오케스트레이터(메인 세션이 직접 실행) + 무겁거나 병렬인 작업만 온디맨드로 격리 fan-out(보수적 2~3개)하는 단순 모델로 갈아탔습니다. tmux는 IPC가 아니라 레이아웃/persistence 용도로만 남겼습니다.
- **R (결과):** 관측 가능성과 신뢰성이 크게 올라갔고 도미노형 실패가 사라졌습니다. "인지 대역폭은 병렬화되지 않는다"는 원칙을 코드로 옮긴 결정이었습니다.
- **교훈:** 만든 것을 지우는 게 더 어렵다. 복잡도를 더하기보다 걷어내는 게 정답일 때가 많다.

---

## 5. Dive Deep — "필드가 nil로 온다"의 진짜 원인

**제목: "증상은 nil이었지만, 원인은 DTO 64%가 계약을 안 지키는 구조였다"**

- **S (상황):** 서버 응답의 특정 필드가 이유 없이 nil로 들어오는 버그가 산발적으로 발생했습니다. 컴파일도 되고, mock QA도 통과하고, diff 리뷰도 통과하는데 실서버에서만 값이 비었습니다.
- **T (과제):** 개별 필드를 땜빵하는 게 아니라, 이 버그 클래스가 왜 구조적으로 생기는지 근본을 파야 했습니다.
- **A (행동):** DTO 레이어를 전수 조사했습니다. Network 모듈의 응답 DTO 191개 중 123개(64%)가 `CodingKeys`를 미보유하고, 거의 모든 프로퍼티가 Optional이었습니다. 즉 서버 키와 프로퍼티명이 한 글자만 달라도 디코딩이 에러를 던지지 않고 조용히 nil로 흡수되는 **silent-nil 안티패턴**이 구조에 깔려 있었습니다. 게다가 Entity 매핑에서 `?? 기본값`으로 흡수하니 "안 온 것"과 "의도적 기본값"이 구분되지 않았습니다.
- **R (결과):** 증상(nil)이 아니라 원인(계약 부재)을 특정했고, 이를 배포 전에 잡는 계약 감사(3-오라클 대조 + decode-roundtrip)로 발전시켰습니다(스토리 9). 서버 계약 변경이 컴파일·런타임 어디서도 안 잡히던 사각을 드러냈습니다.
- **교훈:** nil을 nil로 고치면 재발한다. 왜 nil이 조용히 통과하는지 구조를 파야 클래스 전체가 닫힌다.

---

## 6. Dive Deep — 딥링크 상세 진입의 숨은 의존성

**제목: "상세 화면이 리스트를 거쳐야만 열리던 구조를 파고들어 끊었다"**

- **S (상황):** 편도 특가(핫딜) 딥링크로 상세 화면에 직접 진입해야 하는데, 실제로는 리스트 화면을 먼저 로드한 뒤에야 상세가 열리는 구조였습니다. 푸시·어트리뷰션·유니버설링크 등 5개 채널이 100+개 화면으로 수렴하는 복잡한 딥링크 상태머신 안에 이 의존성이 숨어 있었습니다.
- **T (과제):** 상세 진입이 리스트 상태에 결합돼 있어서, 재진입 시 필터/정렬이 되살아나거나(QA-3913 류) 대여 위치가 엉뚱하게 fallback되는 회귀가 반복됐습니다.
- **A (행동):** RIBs 풀체인(View→Interactor→UseCase→Repository)을 따라 딥링크 파라미터(rentSeq)가 어디서 리스트 상태에 묶이는지 추적했습니다. 상세를 리스트 의존 없이 rentSeq만으로 직접 열도록 진입 경로를 분리하고, 단방향 흐름 + 낙관적 로컬 갱신이 섞일 때 초기값이 되살아나는 회귀는 1회성 가드 플래그(didApply* 류)로 방어했습니다.
- **R (결과):** 상세 직접 진입이 리스트 로드 없이 동작하게 됐고, 재진입 초기화 회귀가 닫혔습니다. 딥링크 6종을 한 번에 fire해 도착 화면을 검증하는 회귀 sweep으로 상시 방어하게 만들었습니다.
- **교훈:** 화면 간 숨은 상태 결합은 체인을 끝까지 따라가야만 보인다. 표면만 보면 "가끔 되는 버그"로 남는다.

---

## 7. Deliver Results — 0개 실행되던 테스트를 살리다

**제목: "테스트가 있는데 실제로는 한 개도 안 돌던 스킴을 복구했다"**

- **S (상황):** 앱 스킴에 테스트 타깃이 Testables로 등록되지 않아, 테스트 코드는 존재하는데 실행은 0개인 상태였습니다. 회귀 추적성이 사실상 없었습니다.
- **T (과제):** 테스트 인프라 자체를 신뢰할 수 있게 만들어야 했습니다. 존재하는데 안 도는 테스트는 있는 것보다 위험합니다(거짓 안심).
- **A (행동):** 스킴의 Testables 26개를 채워 실제로 실행되게 복구하고, mock이 Release 빌드에 유출되지 않도록 `#if DEBUG` 가드를 17곳에 넣었습니다. 테스트 이름을 Jira 티켓(QA/FR/ITSM)과 결합해 회귀 추적성을 세웠고, 실제 모듈 mock이 어려운 경우엔 동일 시그니처를 미러링해 "컴파일되면 계약 일치"로 검증하는 Protocol Witness 패턴을 도입했습니다.
- **R (결과):** 0개 → 실제 실행되는 테스트 스위트로 전환됐고, 티켓 결합으로 어떤 회귀가 어느 테스트로 커버되는지 추적 가능해졌습니다.
- **교훈:** "테스트가 있다"와 "테스트가 돈다"는 다르다. 결과는 실행되는 것에서만 나온다.

---

## 8. Deliver Results — 편도 특가딜 QA 배치 완주

**제목: "한 달간 편도 특가딜/오다/프로모션 딥링크 QA를 티켓 기반으로 밀어붙여 끝냈다"**

- **S (상황):** 편도 특가 라인은 iOS/AOS 동시 개발 피처로, QA 티켓(QA/MOB/ITSM)이 대량으로 인입됐습니다. 딥링크 필터 깜빡임, 정렬 애니메이션, 재진입 초기화, 대여 위치 fallback, 비로그인 프로모션 배너 API 연동 등 성격이 제각각이었습니다.
- **T (과제):** 산발적으로 대응하면 놓치고 중복됩니다. 배치로 표준화해 완주해야 했습니다.
- **A (행동):** QA 티켓 N건을 grounded 수집 → 1분 triage → 단일 전담 흐름으로 fix → 검증 ladder → 배치 커밋하는 SOP를 따랐습니다(멀티워커는 도미노 실측 근거로 QA 배치에 금지). 최근 약 1개월간 편도 특가딜 딥링크 상세 직접오픈, 필터/정렬, 재진입 초기화, 프로모션 배너 서버 API 전환, 애널리틱스 이벤트 중복발화 차단까지 처리했습니다.
- **R (결과):** 로컬 히스토리 기준 약 1개월간 47커밋으로 편도 특가딜/오다/프로모션/애널리틱스/하네스 인프라를 완주했습니다 **[추정: 로컬 clone 가시 히스토리 기준]**. AOS 택소노미와 정합을 맞춰 크로스플랫폼 지표 신뢰성도 확보했습니다.
- **교훈:** 대량 인입은 개별 대응이 아니라 배치 SOP로 완주한다.

---

## 9. Insist on Highest Standards — silent-nil 구조적 차단

**제목: "에러 0으로 조용히 통과하는 버그를, 코드 짜기 전에 막는 게이트로 만들었다"**

- **S (상황):** DTO 64% 계약 미보유로 silent-nil이 구조적으로 노출돼 있었습니다(스토리 5). 이건 컴파일·mock QA·diff를 전부 통과하고 실서버에서만 터지는, 가장 잡기 어려운 유형입니다.
- **T (과제):** 사후에 잡는 게 아니라, 공유 도메인 필드/DTO를 건드리는 순간 진입 게이트로 막아야 했습니다.
- **A (행동):** DTO 작업 진입 시 **3-오라클 대조**(서버 swagger + AOS 구현 코드 + 실제 응답)로 계약을 검증하고, `CodingKeys`를 명시하고, decode-roundtrip 테스트로 왕복 검증하는 계약 감사(contract-audit)를 만들었습니다. 이걸 전담 에이전트(contract-auditor)로 오케스트레이션하고, ship-radar가 배포 전 enc 필드 silent-nil 시그니처를 diff에서 다시 스캔하게 이중으로 걸었습니다.
- **R (결과):** "필드가 nil로 온다" 클래스를 코드 작성 전 게이트 + 배포 전 게이트 2중으로 차단했습니다. 서버 계약 변경이 어디서도 안 잡히던 사각이 닫혔습니다.
- **교훈:** 최고 기준은 "버그를 잘 고친다"가 아니라 "버그가 조용히 통과할 구조를 없앤다"이다.

---

## 10. Insist on Highest Standards — AI 코드에 "왜" 주석 강제

**제목: "AI가 짠 코드가 리뷰어 없이 머지되니, '왜'를 코드 레벨에서 강제했다"**

- **S (상황):** LLM 에이전트가 실질 코드를 추가하는데 의도 설명이 없으면, 나중에 아무도 왜 이렇게 짰는지 모릅니다. PR 리뷰 게이트도 없는 환경이라 더 위험했습니다.
- **T (과제):** "주석 잘 답시다" 같은 문서 규칙은 LLM이 깜빡합니다. 행동 레벨로 강제해야 했습니다.
- **A (행동):** AI가 실질 코드를 4줄 이상 추가했는데 "왜" 설명 주석이 0개면 PostToolUse hook이 exit 2로 되돌리는 게이트를 만들었습니다. 규칙을 문서가 아니라 코드로 승격시킨 사례입니다. 커밋 직전 force-unwrap/`try!`/`Thread.sleep`/하드코딩 시크릿 self-check도 같은 원리로 넣었습니다.
- **R (결과):** 리뷰어 없이도 코드 안전 하한선과 의도 문서화가 유지됩니다. 규칙이 문서에 머무르지 않고 실제로 어겼을 때 차단되므로 준수율이 100%에 수렴합니다.
- **교훈:** 지킬 거라 믿지 말고, 못 어기게 만든다. 문서 규칙과 코드 게이트는 준수율이 다르다.

---

## 11. Bias for Action — mock 프로덕션 유출을 즉시 가드

**제목: "mock이 릴리스에 새는 사고를 겪고, 그날 17곳을 가드로 닫았다"**

- **S (상황):** 로컬/서버 mock을 쓰는 코드가 Release 빌드에 유출될 위험이 있었습니다. 이건 실제로 겪은 사고 클래스입니다(mock이 프로덕션에 노출).
- **T (과제):** "다음에 조심하자"로 넘기면 반드시 재발합니다. 즉시 구조적으로 막아야 했습니다.
- **A (행동):** `useLocalMock` 류 mock 토글을 `#if DEBUG` 가드로 17곳 감쌌습니다. 그리고 fixture/mock 관련 함정을 lint(mock-fixture-lint, fixture-staleness)로 배선해 빌드/실행 도구 호출 직전에 자동 검사하게 했습니다. Inject 핫리로드 `-interposable` 플래그가 QA/Archive 바이너리에 누출돼 App Store 거부(90714)를 유발하는 유사 함정도 앱 타깃 Debug 설정에만 격리하고 clean 빌드로 stale 재링크를 막았습니다.
- **R (결과):** mock의 Release 유출을 코드 레벨로 차단했고, 유사한 "디버그 도구가 릴리스에 새는" 클래스 전체를 게이트로 닫았습니다.
- **교훈:** 사고를 겪은 날이 가드를 세우기 가장 싼 날이다. 미루면 재발 비용까지 문다.

---

## 12. Bias for Action — 15줄로 "완료 거짓말" 차단

**제목: "에이전트가 빌드 깨진 채 '완료'라고 하는 걸, 15줄 bash로 막았다"**

- **S (상황):** 구현 서브에이전트가 "빌드 성공/DONE"이라고 주장하며 종료하는데, 실제 transcript 마지막 빌드 결과는 실패인 경우가 있었습니다. 이 거짓말을 신뢰하면 깨진 코드가 그대로 흘러갑니다.
- **T (과제):** 무거운 검증 파이프라인을 붙이기 전에, 가장 흔하고 치명적인 이 거짓말을 값싸게 잡아야 했습니다.
- **A (행동):** SubagentStop hook으로, builder 계열 에이전트가 "완료/빌드성공"을 주장하며 끝냈는데 transcript 마지막 빌드 결과가 실패면 exit 2로 stop을 차단하는 15줄 bash를 짰습니다. 신호가 모호하면 통과(fail-open)하도록 보수적으로 설계해 오탐을 줄였습니다.
- **R (결과):** "빌드 깨진 채 done 거짓말"을 결정적으로 차단했습니다. 토큰 0, 15줄로 done-lie를 막는 최고 ROI 가드가 됐습니다.
- **교훈:** 가장 흔한 실패는 가장 값싼 가드로 먼저 막는다. 완벽한 검증보다 즉시 도는 15줄이 낫다.

---

## 13. Are Right A Lot — Rx→async 전면 전환을 안 하기로

**제목: "유행하는 마이그레이션을 따라가지 않기로 한 결정이 옳았다"**

- **S (상황):** 코드베이스는 RxSwift가 전 계층 반응형 백본이었고(`disposed(by:)` 2,191회), Swift Concurrency(async/await)가 부상하면서 "전면 전환하자"는 압력이 자연스러운 상황이었습니다.
- **T (과제):** async/await로 다 갈아엎을지, 아니면 다른 전략을 취할지 판단해야 했습니다. 32만 LOC 전면 전환은 거대한 리스크입니다.
- **A (행동):** 전면 전환 대신 **"경계에만 async 국소 도입 + Rx로 재흡수"** 전략을 택했습니다. 네트워크 전송 계층과 복잡한 검증 로직은 async로 쓰되, 반드시 `Observable.create`+`Task`로 Rx 세계로 다시 브릿지해 ReactorKit 단방향 파이프라인의 일관성을 유지했습니다. async는 "구현 디테일", Rx는 "아키텍처 계약"으로 역할을 분담시켰습니다.
- **R (결과):** 아키텍처 일관성을 깨지 않으면서 async의 이점(토큰 만료→refresh→재요청을 자연스럽게 작성)만 취했습니다. 6개 파일에만 async를 국소 도입하고 전부 Rx로 재흡수 — 전면 전환의 리스크 없이 현대화했습니다.
- **교훈:** 새 기술은 전면 채택이 아니라 "어디까지 들일지"의 판단이다. 유행이 아니라 계약 일관성을 기준으로 결정한다.

---

## 14. Are Right A Lot — 하네스 변경을 신뢰구간으로 계량

**제목: "'좋아진 것 같다'는 느낌 대신, 통계적으로 개선인지 판정했다"**

- **S (상황):** 하네스의 운영룰·검증 프롬프트·스킬·hook을 바꿀 때마다 "이게 정말 개선인지, 노이즈인지" 확신이 없었습니다. LLM 시스템은 변동성이 커서 몇 번 잘 되는 걸 개선으로 착각하기 쉽습니다.
- **T (과제):** 자산 변경의 채택 여부를 감이 아니라 근거로 판정해야 했습니다.
- **A (행동):** 골든셋(GT-1~GT-22)으로 변경 전후를 돌려 **Wilson score 95% 신뢰구간**으로 개선/회귀/노이즈를 판정하는 회귀 하네스를 만들었습니다. 신뢰구간이 겹치면 "채택 금지" 규칙을 세웠습니다. 검증 프롬프트도 agreement bias를 피하려 반증우선(먼저 FAIL 근거를 찾고 없으면 PASS) 2-step으로 표준화했습니다(failure detection +25%p, accuracy +14%p).
- **R (결과):** 하네스 변경이 실제 개선일 때만 채택되고, 우연한 개선은 걸러졌습니다. 도구를 만드는 것 자체를 계량 가능한 실험으로 바꿨습니다.
- **교훈:** "옳은 결정을 자주 한다"는 재능이 아니라 방법이다. 판정을 통계로 뒷받침하면 확률이 올라간다.

---

## 15. Learn & Be Curious — LLM 에이전트를 프로덕션에 태우는 법

**제목: "toy repo 데모가 아니라, 실제 상용 앱에 에이전트를 안전하게 태우는 법을 스스로 배웠다"**

- **S (상황):** 대부분의 AI 코딩 사례는 장난감 저장소에서 끝납니다. 저는 실제 상용 카셰어링 앱(대규모 레거시, PR 리뷰 게이트 없음)에 LLM 에이전트를 태우고 싶었지만, 그 방법론은 어디에도 정립돼 있지 않았습니다.
- **T (과제):** "빠르게 코딩"이 아니라 "에이전트가 프로덕션에서 저지르는 실패를 어떻게 체계적으로 막을까"를 처음부터 학습해야 했습니다.
- **A (행동):** 최신 연구를 iOS 워크플로에 제도화했습니다 — 지식 그래프의 bi-temporal 메타(Graphiti/Zep 차용: 삭제 대신 무효 마킹), contextual retrieval의 경량판(canonical 허브), BM25 랭킹 검색, LLM-as-judge의 반증우선 검증(arxiv 2507.11662), 멀티에이전트 실패 taxonomy(MAST). 동시에 하네스 자체를 제품처럼 다뤘습니다 — ADR 19건, 단위 테스트 붙은 MCP 서버, semver 배포. 실패할 때마다 사고→박제→hook→ADR로 승격시키는 폐루프를 돌렸습니다.
- **R (결과):** "LLM 에이전트가 공유하는 팀 기억(institutional memory)"을 git+MCP+hook으로 구현했습니다. 3.5개월간 실사고에서 역산한 46 가드와 579개 팀 공유 박제가 그 증거입니다 **[추정: 저장소 히스토리/메모리 날짜 기준]**.
- **교훈:** 정립되지 않은 영역은 배우면서 만든다. 최신 연구를 내 실무 제약에 제도화하는 게 진짜 학습이다.

---

## English STAR Stories

### EN-1. Ownership — The only prod-regression gate

- **Title: "In a team that merges to trunk without PR review, I built the last line of defense against production regressions."**
- **S:** Our car-sharing iOS app was large (320K LOC, 100+ screens) but had no PR review gate — code merged and pushed straight to the integration branch. Several incidents (hard-coded environment keys, mock leaking into production, silent-nil on server-encrypted fields) had actually shipped.
- **T:** Adding reviewers wasn't organizationally possible. I needed an automated gate that catches "already-seen incident classes" right before push/merge, without a human bottleneck.
- **A:** I reverse-engineered recurrence signatures from past production incidents (hard-coded env keys, mock leaks, simulator bypass, `Thread.sleep`, encrypted-field silent-nil) and scanned them **only against newly added diff lines** — killing noise by never looking at unchanged code. I wired it as a pre-push lifecycle hook returning BLOCK/REVIEW/PASS.
- **R:** It became effectively the only production-regression gate in a team without PR review. It catches types like silent-nil that pass compile, mock QA, and diff review but only break on the live server — preempting hours-to-days of hotfix cost per incident *[estimate]*.
- **Lesson:** When you find a missing safety net, build the automated door yourself instead of blaming the lack of reviewers.

### EN-2. Are Right A Lot — Retreating from multi-worker to SOLO

- **Title: "Instead of building a fancier parallel orchestration, I had the discipline to delete it."**
- **S:** I first built a tmux 4-pane multi-worker pool to run agents in parallel. But send-keys IPC, pane-grep state detection, and role priming became the root of failures — send failures, observation failures, startup hangs, context dominoes (8 measured occurrences).
- **T:** I had to decide: add more coordination logic, or move to a fundamentally different model.
- **A:** Backed by a 25+ failure taxonomy and three converging external sources (MAST, Cognition), I wrote an ADR to **decommission** the worker pool — physically deleting 52 files — and moved to a simple SOLO orchestrator that executes directly, fanning out to isolated agents (a conservative 2–3) only for heavy or parallel work. tmux stayed as layout/persistence, not IPC.
- **R:** Observability and reliability rose sharply and domino failures disappeared. It encoded the principle "cognitive bandwidth doesn't parallelize" into the system.
- **Lesson:** Deleting what you built is harder than adding to it — and often the right answer is to remove complexity, not stack more.

---

## 부록: 면접 운용 팁

- **지표 방어:** [추정] 붙은 수치는 반드시 "제 로컬 측정 기준으로는" 단서와 함께. 독립 벤치마크 없음을 먼저 밝히면 신뢰도가 오히려 올라감.
- **LP 중복 활용:** 한 스토리를 여러 LP로 각도만 바꿔 재사용 가능(예: 스토리 1은 Ownership이지만 Bias for Action으로도 답변 가능 — "리뷰어 없다고 기다리지 않고 즉시 게이트를 만들었다").
- **Failure 질문 대비:** "가장 큰 실패는?" → 스토리 4(4-pane 워커풀)를 실패→학습 프레임으로. "내가 만든 걸 걷어낸 결정"이 강한 성숙도 신호.
- **Dive Deep 검증:** 면접관이 파고들면 파일 레벨 근거(DTO 191개 중 123개, `disposed(by:)` 2,191회, 50 SPM 모듈)로 구체성 입증.
- **익명화 준수:** 회사/제품명 절대 언급 금지. "카셰어링 앱", "AI 개발 하네스"로만 지칭.
