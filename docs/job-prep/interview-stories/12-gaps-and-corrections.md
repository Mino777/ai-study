# 12 — Gaps & Corrections (완결성/근거 비평)

> 인터뷰 문서 01~11을 두 repo(앱 repo / 하네스 repo)와 대조 spot-check한 결과.
> 결론: **핵심 숫자·아키텍처 주장은 대부분 실측과 정확히 일치**한다. 익명화도 문서 본문에서는 깨끗하다.
> 남은 이슈는 (a) 문서 간 숫자 불일치 2건, (b) 경미한 과다계상 3건, (c) 익명화 잔존 1건(저위험) 뿐.
> ※ 본 리포트 자체도 공개 위키 위생 훅 대상이라, 실식별자는 마스킹(예: `L***IMS`, `G**rBle`)해 표기함.

---

## A. 검증 완료 (근거 확보 — 수정 불필요)

| 주장 | 문서상 | 실측 | 판정 |
|---|---|---|---|
| SPM 로컬 모듈 | 50 | top-level `Package.swift` = **50** (전체 tracked 56 = 50 + template 4 + 중첩 2) | ✅ 정확 |
| Swift 파일 | ~1,900 | `git ls-files *.swift` = **1,910** | ✅ |
| 커밋 | ~7천 | **6,947** | ✅ |
| RIBs Builder/Interactor/VC | 113 / 111 / 140 | **113 / 111 / 140** | ✅ 완전 일치 |
| `disposed(by:)` 콜사이트 | 2,191 | **2,191** | ✅ 완전 일치 |
| BLE `maxRetryCnt` | 3 | `BleProtocolConstants.swift:51 let maxRetryCnt = 3` | ✅ |
| BLE 스택(STX/ETX/AES-CBC/LRC) | 자체구현 | `BlePacketBuilder/BleResponseParser/BleDataFrame` + `encryptAesCbc` + `kResponseLrcError=0x02` | ✅ |
| `Requestable` 프로토콜 | associatedtype Output | `RESTInfrastructure/Requestable.swift:14 public protocol Requestable: Hashable` | ✅ |
| 딥링크 목적지 enum(문서=`AppMenu`) | 120+ case | 실체 = `*CarMenu.swift`(556줄, `case` 240회) → 120+ 보수적 하한 | ✅(보수적) |
| RIBs Workflow | 76 | **75** | ✅(±1) |
| 하드코딩 AES 키 자백 | 소스에 키/IV 하드코딩 | `Persistent/AES256Cryption.swift:12` 실존 (문서는 값 미노출 — 올바름) | ✅ |
| Keychain 미사용 | 토큰 UserDefaults+AES256 | keychain 참조 파일 **1개**(사실상 미사용) | ✅ |
| import RIBs / ReactorKit | 하이브리드 | RIBs 520파일 / ReactorKit 45파일 import | ✅ |
| 하네스 skills/agents/commands | 59 / 17 / 16 | **59 / 17 / 16** | ✅ 완전 일치 |
| claude-hooks | 46 | **46** (+ git hooks 6) | ✅ |
| 박제 memory | 579 (374/159/44) | 파일 579 = feedback **374**/reference **159**/project **44**(=577) + MEMORY(-ARCHIVE).md 2 | ✅(주 B6) |
| solutions / retros | 152 / 58 | **152 / 58** | ✅ |
| plugin 버전 | v1.13.48 | **1.13.48** | ✅ |
| 하네스 커밋 / tracked | 819 / 1,515 | **819 / 1,515** | ✅ |
| MCP 단위테스트 파일 | add-memory/scorer/health-score/wiki-graph/retrieval-eval | 5개 전부 실존 | ✅ 완전 일치 |
| MCP 도구 6개 | search/add_memory/wiki_query/status/pull/health | 6개 일치 | ✅ |

---

## B. 발견 사항 (수정 권장)

| # | 항목 / 위치 | 문제 | 수정 제안 |
|---|---|---|---|
| B1 | **DTO 개수 문서 간 모순** (191 vs 195) | 02·03·09·11 = "DTO **191**개, CodingKeys 36%"; 05·06·07·08·10 = "DTO **195**개 중 **124**개(64%)". 실측: `RESTResponseDTO/*.swift` = **191** 파일, CodingKeys 보유 **68**(35.6%), 미보유 **123**. | 하나로 통일 → **"191개 중 68개(36%)만 CodingKeys, 123개(64%) 미보유"**. "195/124"는 하네스 스킬 설명의 stale 수치(±수개 오차)이니 191 기준으로 정정. 64%↔64%·36%는 서로 모순 아님(present 36% = absent 64%). |
| B2 | **claude-hooks 개수 문서 간 모순** (46 vs ~40) | 05·06·11 = "**46**"; 07·08 appendix = "**~40** Claude hooks (+6 git)". 실측 claude-hooks = **46**, 별도 git hooks 6. | "~40"을 **"46 (+ git hooks 6)"** 으로 통일. 07·08이 과소계상. |
| B3 | **research 문서 66 (과다계상)** | 07·10 = "research **66**". 실측 `docs/research/*.md` = **63**(tracked). | "약 63" 또는 "60여 건"으로. |
| B4 | **ADR 19 (경미한 부풀림)** | 전 문서 "ADR **19**". `docs/adr/*.md` = 19파일이나 그중 INDEX/README/TEMPLATE 3개는 ADR 아님 → 실 번호부여 ADR ≈ **16**. | "ADR 약 16(+색인 문서)" 또는 "docs/adr 19파일"로 표현 정직화. 꼬리질문에 "19에 index 포함" 방어 준비. |
| B5 | **scripts 176 (오차 1)** | "176". 실측 `scripts/` = **175**. | 무시 가능(반올림). 굳이 고치면 "약 175". |
| B6 | **박제 합계 577 vs 579** | "579(374/159/44)" — 세부합 374+159+44 = **577**. 579는 MEMORY.md·MEMORY-ARCHIVE.md 인덱스 2개 포함. | "박제 577 + 인덱스 2 = md 579" 로 각주 처리하면 완벽. 현행도 방어 가능. |

---

## C. 익명화 점검 (⚠️ 잔존 토큰)

**문서 01~11 본문에는 금지 식별자(회사/제품/repo명, 그 한글 표기) 잔존 0건.** 정규식 스캔 클린. SDK명도 일반화("어트리뷰션 SDK", 소셜은 카카오/구글/네이버=공개 서비스라 허용선).

| # | 파일 | 토큰 | 판정 / 수정 제안 |
|---|---|---|---|
| C1 | `04-app-decision-defenses.md`, `08-star-lp-behavioral.md`, `11-cheatsheet.md` | **"편도 특가딜"** (각 3·5·1회) | **저위험**. 회사·제품 식별자 아님(서술적 한국어). 단 실제 모듈 내부 코드네임(OnewayHotDeal)과 동일 표기라, 익명화 가이드 권장 표기 **"편도 렌탈 딜 / 편도 특가딜"**(대다수 문서에서 이미 사용)과 불일치. 일관성 위해 "편도 특가딜"로 치환 권장. |

**참고(문서 아님, 리스크 고지)**: 앱 repo 경로 자체에는 실식별자 다수 존재 — `L***IMS-SPM/`, `Smartkey/.../G**rBle/`, `Common/.../Gr**nCarMenu.swift`, `Gr**nCar/Feature/`, `Persistent/AES256Cryption.swift`의 **실제 secretKey 값**. 문서는 이를 전부 올바르게 추상화(값·경로 미노출)했다. 다만 면접 중 화면공유·repo 경로·파일 붙여넣기 시 익명화가 즉시 깨진다 → **repo 원본은 절대 노출 금지**를 본인 메모로.

---

## D. 빠진 앵글 / 미세 뉘앙스 (선택적 보강)

| # | 내용 |
|---|---|
| D1 | **ReactorKit "21개 화면"** 은 실제 import 45파일 대비 보수적. 과장 아니라 오히려 과소 — "템플릿으로 찍어낸 표준 화면 21개+, Rx 단방향은 45모듈에 퍼짐"으로 상향 서술 여지. |
| D2 | **"Keychain 미사용"** — 정확히는 keychain 참조 1건 존재. "토큰 저장에 Keychain 미채택"으로 한정하면 꼬리질문 안전. |
| D3 | **모듈 "58 vs 50 드리프트"** 서사(04·09·11)는 실측(top 50 + 유령/템플릿 6 = 56)과 잘 부합 → **강점**. "58"의 출처(어느 문서)만 본인이 특정해두면 방어 완결. |
| D4 | 하네스 "커밋 날짜 신뢰 불가(history rewrite)" 자백(10-Q9)은 정직 신호로 유지. retro 날짜·valid_from 기반 3.5개월 근거도 타당. |

---

## 총평

- **근거 없는 과장 = 사실상 없음.** 검증한 하드 넘버 20+개 중 다수가 **완전 일치**(113/111/140, 2191, 50, 6947, 819, 1515, MCP 테스트 파일명까지). 인터뷰용 숫자 신뢰도 매우 높음.
- **수정 필수는 B1·B2 두 모순뿐**(DTO 191 vs 195, hooks 46 vs 40) — 같은 면접에서 다른 숫자를 말하면 신뢰 훼손. 한 값으로 통일 권장.
- **익명화 본문 클린**, 유일 잔존은 "편도 특가딜"(저위험, 일관성 차원 치환 권장).
- B3~B6은 반올림·집계 정의 수준으로, 방어 가능하나 정직하게 각주 처리하면 더 강함.
