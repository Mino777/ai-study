# 인터뷰 1페이지 치트시트 — 카셰어링 앱 + AI 개발 하네스

> 스캔용. 두 시스템을 30초 안에 소환하는 게 목적. 숫자는 외우고, 결정은 한 줄로 말한다.

---

## (a) 엘리베이터 1줄

- **카셰어링 앱**: 전국 카셰어링 iOS 앱. RIBs + ReactorKit + RxSwift 하이브리드 위에 50개 SPM 모듈을 Domain/Repository/UseCase/Presentation 4계층으로 쪼갠 대규모 모듈러 모노레포. BLE 디지털키로 실제 차량을 암호화 제어하고, 어트리뷰션·푸시·소셜·웹·유니버설링크 5채널이 100+ 화면으로 수렴하는 딥링크 상태머신을 가진 물리세계 결합형 앱.
- **AI 개발 하네스**: 실패에서 역산한 가드로 LLM 코딩 에이전트를 "PR 리뷰 게이트조차 없는 프로덕션 앱"에 안전하게 태우는 자기개선형 iOS 개발 운영체제. 팀 지식을 MCP로 자동 PR/auto-merge해서 복리로 축적한다.

---

## (b) 꼭 외울 숫자 / 규모

| 카셰어링 앱 | 값 | | AI 하네스 | 값 |
|---|---|---|---|---|
| SPM 로컬 모듈 | **50** (문서 58, 실측 갭) | | Skills | **59** |
| Swift 파일 | **1,910** | | Agents | **17** |
| Swift LOC | **~320K** | | Commands | **16** |
| 커밋 | **6,947** | | Claude 훅 | **~46** |
| RIBs Builder/Interactor/VC | **113 / 111 / 140** | | 메모리 박제 | **579** (feedback 374/ref 159/proj 44) |
| 딥링크 목적지 enum | **~120+ case** | | Solutions / Retros / ADR | **152 / 58 / 19** |
| `disposed(by:)` 호출 | **2,191** | | Scripts | **176** |
| DTO 파일 | **191** (CodingKeys 36%만 보유) | | Plugin 버전 | **v1.13.48** |
| RIBs Workflow(딥링크) | **76** | | MCP 도구 | **6** (search/add_memory 등) |

**한 방 숫자**: 카셰어링=50모듈/320K LOC/화면100+, 하네스=579박제/59스킬/17에이전트. DTO **64% CodingKeys 미보유** = silent-nil 근거.

---

## (c) 결정 one-liner ("왜 X? → …")

**카셰어링 앱**
- 왜 50모듈 수직 슬라이스? → 피처별 Domain/Repo/UseCase/Presentation 물리 분리로 컴파일 유닛=모듈 경계, 병렬 빌드·팀 소유권 명확화.
- 왜 RIBs + ReactorKit 하이브리드? → RIBs는 트리/DI/네비 담당, ReactorKit은 화면 내 단방향 상태(Action→Mutation→State). Interactor 한 클래스가 둘을 겸하게 **Xcode 템플릿으로 강제** → 21개 화면 일관.
- 왜 Rx→async 전면 전환 안 함? → async는 "구현 디테일", Rx는 "아키텍처 계약". async는 네트워크·검증 경계에만 국소 도입 후 `Observable.create`로 즉시 Rx 재브릿지 → 단방향 파이프라인 일관성 유지.
- 왜 에러를 onError 아닌 Result enum? → 스트림이 dispose 안 되고 살아있게. `.fail(msg)`를 reduce에서 흡수.
- 왜 Network를 4 product로 분리? → DTO만 쓰는 Domain은 RESTAPIs만, 실 HTTP는 RESTInfrastructure만 가져가 표면 최소화 + 순환 회피.

**AI 하네스**
- 왜 plugin + MCP로 외부화? → 하네스 자산(도구·박제)과 앱 코드(Swift·SPEC)의 커밋 히스토리 오염 분리. "검증 자산은 앱과, 하네스 메커니즘은 하네스와" 경계 매트릭스.
- 왜 메모리를 PR로? → 개인 로컬 메모리가 아니라 git-네이티브 팀 공유 자산. add_memory→auto-PR→squash-merge→전 팀원 세션 즉시 surface(사람 개입 0).
- 왜 훅 가드(코드 레벨)? → 문서 룰은 LLM이 깜빡함. 행동 레벨로 강제 — 광역 grep exit 2 차단, AI 주석 없으면 되돌림.
- 왜 4-pane 워커풀 폐기(ADR-008)? → send-keys IPC·pane-grep 상태판정이 실패 클래스. SOLO+온디맨드 격리 fan-out으로 후퇴, 52개 파일 삭제.
- 왜 ship-radar? → 대상 앱은 PR 리뷰 없이 integration 직머지 → 과거 사고 시그니처를 diff 추가 라인에만 스캔하는 게 **유일한 prod 회귀 게이트**.

---

## (d) 트레이드오프 한 줄

**카셰어링 앱**
- Clean Architecture 지향하나 실코드는 단방향 아님 — Domain이 Network/DTO에 의존(dependency-free 깨짐), Presentation이 Repository 직접 import(UseCase 우회).
- 캐시/SSOT 사실상 없음 — Repository는 얇은 remote 프록시, 인메모리 캐시는 Transport 필터 1건뿐. 오프라인 미지원.
- 토큰을 Keychain 아닌 **UserDefaults+AES256(키/IV 소스 하드코딩)** — Keychain 대비 보안 약함, "난독화" 수준.
- 하이브리드의 대가: 단방향+낙관적 로컬 갱신 섞으면 State 재방출 회귀 → QA 티켓번호 박힌 1회성 가드 플래그로 방어.

**AI 하네스**
- Plugin self-contained 미완결 — 534 hardcode refs, MCP dev-symlink vs 버전핀 source-of-truth 분기(스스로 ADR로 추적 = 건강 신호).
- 자동 병렬 오케스트레이션 포기 대신 단순·관측가능성 확보.
- 훅 강제는 유지보수 부담·세션 블로킹 리스크 → "5초 이내·timeout 30초, 성공 silent 실패만 표면화"로 억제.

---

## (e) LP ↔ 스토리 매핑

| Amazon LP | 카셰어링 앱 스토리 | AI 하네스 스토리 |
|---|---|---|
| **Ownership** | 편도 특가딜·이동 딥링크·프로모션 배너 풀사이클 소유(Jira QA/MOB/ITSM 구동) | 하네스 자체를 제품처럼 — ADR 19, 단위 테스트 붙은 MCP 서버, semver 배포 |
| **Invent & Simplify** | Network 4-product 분리로 의존 표면 최소화; async를 Rx로 재흡수 | 메모리를 PR로 커밋 = 개인 컨텍스트→팀 지식그래프 승격 |
| **Dive Deep** | BLE 커스텀 패킷 프로토콜·AES-CBC 채널 직접 구현; 딥링크 5채널 정규화 | DTO 64% CodingKeys 미보유 실측 → silent-nil 3-오라클 감사로 구조적 차단 |
| **Insist on Highest Standards** | force-unwrap error 게이트, mock Release 유출 #if DEBUG 가드 17곳 | AI 주석 enforce 훅, ship-radar 회귀 게이트, done-lie 검증 |
| **Learn & Be Curious** | Rx↔Concurrency 경계 하이브리드 설계 판단 | 환각 격상 사다리(1회 박제→3회 CLAUDE.md→4회 hook→5회 ADR) |
| **Bias for Action** | PR 리뷰 게이트 없는 환경에서 회귀 방지 자동화 | qa-batch SOP, incident war-room 5분 계약 |
| **Are Right, A Lot** | Result-enum 에러 규약, State/ViewState 경계 분리 | Wilson 95% 신뢰구간 회귀셋으로 하네스 변경 계량, 반증우선 검증 |
| **Frugality** | 모델 라우팅: 탐색/리뷰=haiku(15x↓), 구현=sonnet, 아키텍처만 opus | code-locate 0.1~0.5s·환각0 탐색, 컨텍스트 격리 9K vs 15K |

---

## (f) 자주 나올 꼬리질문 Top 10 미니답

1. **"모듈 50개면 빌드 느리지 않나?"** → 컴파일 유닛=모듈이라 증분 빌드 국소화됨. Inject 핫리로드로 UI iteration 30~60s→1s. 다만 Inject `-interposable`가 Archive에 누출되면 90714 거부 → Debug.xcconfig에만 두고 Fastfile clean:true로 방어(실제 겪은 함정).
2. **"Clean Architecture라며 Domain이 Network에 의존?"** → 맞다, 정석에서 이탈했다. feature Domain이 RESTAPIs/DTO에 의존해 dependency-free가 아니다. 폴더 이름은 Clean이지만 의존성 그래프는 엄격 단방향이 아님을 실측으로 안다 — 그래서 code-analyzer/coupling-analysis 스킬로 상시 감시.
3. **"왜 Rx 계속 쓰나, async 안 좋아?"** → 전면 전환은 의도적으로 안 한다. 2,191개 disposed 콜사이트를 async로 갈아엎는 비용 대비 이득이 없고, async를 경계에만 두고 Rx로 재브릿지하면 ReactorKit 단방향 계약이 유지된다. async=구현, Rx=계약.
4. **"BLE 디지털키 왜 어렵나?"** → 물리 차량과 실시간 암호화 양방향 통신. 커스텀 프레이밍(STX/ETX/LRC)+AES-CBC 세션+핸드셰이크를 앱이 직접 책임. 버그=현장에서 "문 안 열림" = 오류 허용치 최저.
5. **"silent-nil이 뭐고 왜 위험?"** → DTO 프로퍼티가 전량 Optional+CodingKeys 64% 미보유라, 서버 키가 한 글자만 바뀌어도 에러 0으로 조용히 nil→기본값 fallback. 컴파일·mock QA·diff 다 통과하고 실서버에서만 터진다. 3-오라클(swagger+AOS+실응답) 대조로 배포 전 차단.
6. **"메모리를 PR로 하는 게 오버엔지니어링 아닌가?"** → 개인 로컬 메모리는 팀에 전파 안 된다. git-native로 하면 버전관리·리뷰·즉시 surface가 공짜. 한 명의 세션이 겪은 함정을 다른 팀원 세션이 자동으로 상속 → 팀 규모·세션 수 커질수록 복리.
7. **"왜 멀티에이전트 병렬을 버렸나?"** → 4-pane tmux 워커풀은 send-keys 전송실패·pane-grep 오판·기동hang·컨텍스트 도미노가 실패 클래스였다(도미노 8회 실측). SOLO+온디맨드 격리 fan-out(2~3개 보수적)이 단순하고 관측가능. "인지 대역폭은 병렬화 안 됨."
8. **"토큰을 UserDefaults에? 보안 문제 아닌가?"** → 맞다, 개선 여지 큰 지점. AES256 암호화는 하지만 키/IV가 소스 하드코딩이라 Keychain 대비 약하다. 이건 레거시 부채로 인식하고 있고, 크로스플랫폼 enc 필드 복호화 호환 때문에 얽혀있다.
9. **"딥링크가 왜 그렇게 복잡?"** → 외부URL·유니버설링크·FCM·어트리뷰션SDK·소셜로그인 콜백 5채널이 같은 open url 창구로 들어와 하나의 내부 스킴으로 정규화되고, 120+ 목적지 enum으로 분기한다. 게다가 앱 상태(스플래시/게스트)와 충돌 안 나게 방어 게이팅이 두껍다.
10. **"하네스가 실제로 효과 있다는 증거는?"** → 정량은 저장소 내 측정치+추정임을 먼저 밝힌다. code-locate 0.1~0.5s 탐색, 컨텍스트 40% 절감(9K vs 15K), silent-nil을 배포 전 차단 = hotfix 수시간~수일 선제 제거. 하네스 변경 자체는 Wilson 신뢰구간 회귀셋으로 계량 — 신뢰구간 겹치면 채택 안 함.

---

### 마지막 방어선 (숫자 하나만 기억한다면)
- 카셰어링: **DTO 191개 중 CodingKeys 36%만** → silent-nil이 앱의 구조적 리스크.
- 하네스: **579 박제 + 환각 격상 사다리** → 같은 실수를 구조적으로 두 번 못 하게.
