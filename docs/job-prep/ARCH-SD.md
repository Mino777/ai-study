# 🏛️ 아키텍처 & 시스템 디자인 트랙

> **목적:** ① iOS 아키텍처(강점) → 면접 방어 서사로 무기화. ② 모바일 시스템 디자인(갭) → 쿠팡 SD 라운드 대비 빌드업.
> **리듬:** 평일 🏛️ 블록(~15~20분) **격일 번갈아** (A ↔ B). 주말 1회 SD 시나리오 완주.
> **Claude 운영 규약:** 🏛️ 블록마다 A/B 중 지난번 안 한 쪽을 진행. A는 "왜 이 결정?" 질문으로 유저 실무경험 인출 → 면접 답변으로 정제. B는 SD 10-스텝 프레임을 밟으며 그림으로. 진행 후 아래 체크박스 갱신 + GAME.md 🏛️ 스탯 +1~2.

**현재 위치:** 🏛️ 트랙 개시 (2026-07-23) — 다음: B1 SD 프레임 소개

---

## 🧭 모바일 시스템 디자인 프레임 (DSA 5스텝의 SD 버전)

> 모든 SD 문제에 이 순서로. 정답이 아니라 **트레이드오프를 소리내는 과정**이 점수.
> **리서치 보강 2026-07-23** — Bartlett 2026 + weeeBox + systemdesign.one 수렴 프레임 반영.

```
①  요구사항/스코핑   명확화 질문부터 (절대 바로 설계 X). "measure twice, cut once"
②  기능 요구사항     고가치 기능 3~5개만 선정 (예: 무한스크롤·좋아요·댓글). 나머지 명시 배제
③  비기능 요구사항   오프라인·실시간성·대역폭/CPU/배터리·일관성 허용 수준
④  데이터 모델       로컬 스키마 (Core Data/SQLite, cursor 필드 포함)
⑤  API 설계          클라↔서버 계약 (페이지네이션·idempotency·에러 계약)
⑥  하이레벨 그림      클라/서버 major building block + 상호작용 (BFS: 넓게 먼저)
⑦  Deep Dive         면접관이 지목한 컴포넌트 심층 (DFS: 그때 깊게) — 시간의 절반
⑧  트레이드오프       "이 선택의 대가 X, 대안 Y" 소리내기 ← 감별점 (one-way vs two-way door)
⑨  마무리            요약 + "더 판다면 어디"
```

**3대 원칙 (초보/시니어 가르는 지점):**
```
🅰 Measure twice   요구사항 이해에 먼저 투자. 바로 아키텍처로 뛰지 마라
🅱 BFS → DFS       high-level 전체 훑고 → 한 컴포넌트 깊이. 처음부터 구현디테일 = 주니어
🅲 UI 논쟁 회피     "SwiftUI vs UIKit / MVVM vs VIPER" 초반에 꺼내지 마라.
                   모바일 SD는 프레젠테이션이 아니라 데이터 흐름·구조가 핵심
```
> DSA 5스텝처럼 매 문제 프레임을 명시적으로 호명 → 압박 상황에서도 서사 자동화.

### 🔑 백엔드 SD와의 핵심 차이 (모바일 depth 신호)
| 축 | 백엔드 SD | 모바일 SD |
|---|---|---|
| 상태 권위 | 중앙 서버가 유일한 진실 | **분산** — 클라가 부분 상태 보유 후 reconcile |
| 연결성 | 안정 네트워크 가정 | 끊김/불안정 전제 (flaky) |
| 일관성 | 강한 일관성 강제 | 일시적 divergence 허용 (eventual) |
| 자원 | 스케일 가능 인프라 | 제한된 CPU/메모리/**배터리**, OS 백그라운드 제약 |
| 규모추정 | 서버 QPS·저장량 | **per-user 자원예산** (메모리~500MB·요청<1MB·페이지20~50·캐시200~400MB·네트워크전력 ~100x) |
| 배포 | 롤백 가능 | 앱 업데이트 **비가역** → 서버 feature flag 필수 |
| 핵심 난제 | 스케일링·샤딩 | **오프라인·동기화·충돌해소·캐싱** |

> 한 줄: *"모바일 클라는 API 소비자가 아니라, 자체 저장·캐싱·동기화·실패모드를 가진 **분산 시스템의 노드**."*

---

## 🅰️ iOS 아키텍처 서사 뱅크 (강점 → 면접 방어 스크립트)

> 실무 경험을 "왜 이 결정을 했나 + 트레이드오프 + 대안"으로 정제. 각 항목 = 면접 딥다이브 방어 카드.
> **리서치 보강 2026-07-23** — 2024~2026 실제 출제 트렌드 반영.

### 🧭 시니어 답변의 4대 축 (모든 아키텍처 질문에 이걸로 답한다)
```
① Tradeoff 인식     "공짜 아님"을 안다
② 왜 이 결정        버린 대안 + 그 이유까지
③ 마이그레이션/레거시  Massive VC → strangler + 팀 설득 과정
④ 팀 스케일링       모듈 경계 = 팀 경계, 빌드 격리
```
> ⚠️ **Red flag(감점):** 패턴을 종교처럼 옹호 · tradeoff 없이 "무조건 Clean" · 테스트를 나중 문제로 · `@MainActor` 남발을 동시성 이해로 착각.

### 📋 실제 출제 질문 카테고리 (거의 다 나옴)
| 카테고리 | 대표 질문 | 꼬리(여기서 걸림) |
|---|---|---|
| A. 네 아키텍처 설명 | "쓰는 아키텍처 설명해라" (100%) | "왜? ViewModel 고통점은?" |
| B. 확장 설계 from scratch | "확장 가능한 앱 구조를?" | "결합 어떻게 낮춰? 모듈 버전은?" → **오프라인/동기화충돌/피처딜리버리 시나리오화 추세** |
| C. Clean 구현 | "Clean 어떻게 구현?" | "**async를 어느 계층에?** Combine/Concurrency 위치는?" |
| D. 모듈 네비게이션 | "모듈 앱 네비 관리?" | "딥링크? Coordinator 테스트? 네비 상태 저장?" |
| E. 네트워크 계층 | "네트워킹 아키텍처?" | "재시도/서킷브레이커? 환경전환? mocking?" |
| F. 테스트 가능성 | "테스트성 어떻게 보장?" | "async publisher mock? side effect 검증?" |
| G. 안티패턴 경험 | "겪은 안티패턴+수정?" | "레거시 리팩터+**팀 설득 과정**?" ← 리더십 신호 |

### 🚀 2025-2026 모던 트렌드 (시니어 talking point + tradeoff)
- **"MVVM 죽었나?"** → *"클래식 MVVM(ObservableObject+@Published)은 죽었지만 패턴은 @Observable(iOS17+)로 진화. 단순 화면은 MV로 얇게, 복잡 화면만 ViewModel. 논쟁 자체가 단방향 흐름으로 수렴."* **2026 프로덕션 기본값 = MVVM + Coordinator + DI + SPM 모듈화.**
- **TCA** → *"단순 화면엔 오버킬. 상태머신 복잡한 결제/폼 피처에만 국소 적용."* Tradeoff: 보일러플레이트(Observation으로 완화됨)·리듀서 순회 성능·double diffing·러닝커브.
- **Swift 6.2 동시성 (최신 핵심)** → `MainActor-by-default` + approachable concurrency. 사고 역전: *"모든 라인 안전 증명"* → *"메인 스레드를 의도적으로 떠나는 지점이 어디인가"*. CPU바운드(디코딩/이미지)는 `@concurrent`로 명시 탈출. **앱 타겟=MainActor 기본 / 라이브러리·파서 타겟=기본 끄고 명시 격리.**
- **모듈화** → 목적은 재사용 아닌 **팀 확장성+빌드 격리**. Feature→Domain→Core 계층 + **인터페이스/구현 분리**로 순환 끊고 병렬 빌드. (국내 대형앱은 **Tuist 기반 모듈화**가 강한 무기 — 빌드타임/결합도 화두)
- **DI** → *"프레임워크 전에 생성자 주입으로 충분한지 본다."* 작은팀=**Factory**(컴파일타임 안전·경량), 대형=**Needle**(침습적이나 안전), TCA생태계=**swift-dependencies**. Swinject은 런타임(컴파일 안전 X).

### 🃏 방어 카드 (각 항목 = 면접 딥다이브 대비)
- [x] A1. 모듈화(SPM 멀티모듈) — ✅ 서사 완성(2026-07-23). 남은 것: **mitigation 라인**(순환→인터페이스 모듈로 끊음, cold build→incremental 캐싱, 보일러→코드젠, 러닝커브→의존성 다이어그램 문서)
- [ ] A2. Clean 계층 + **async를 어느 계층에** (UI=MainActor / UseCase=nonisolated / CPU=@concurrent) ← C·꼬리 대비
- [ ] A3. DI — 생성자 주입 기본 → 언제 컨테이너(Factory/Needle) 도입? 컴파일타임 안전 우선
- [ ] A4. MVVM vs TCA — "죽었나?" 프레임 + TCA 국소적용 논리
- [ ] A5. 반응형(Rx) → Swift Concurrency 전환 — 무엇을 얻고 잃나 (오늘 세션의 Rx↔async 브릿지 연결)
- [ ] A6. 모듈 네비게이션 — Coordinator + 딥링크 + 네비 상태/테스트
- [ ] A7. 네트워크 계층 — 재시도·서킷브레이커·토큰 갱신·환경전환·mocking
- [ ] A8. 안티패턴+레거시 — Massive VC → strangler + **팀 설득 과정**(리더십)
- [ ] A9. 테스트 전략 — protocol 추상화 + async mock(protocol witness) + side effect를 값으로 반환해 검증
- [ ] A10. Swift 6.2 동시성 아키텍처 — MainActor-by-default 채택 + @concurrent 경계 문서화

### 🇰🇷 한국 시장 특이점
- **토스:** 이력서보다 **실무 시나리오 + 동작 원리**("왜 그 해결이 적절한지 내부 기작") + 남의 코드 분석 경험. 2차=컬처핏 반복 검증.
- **쿠팡:** 2:2 화상, Amazon-loop이면 **STAR + LP(Leadership Principles)** 정렬 — 아키텍처 결정을 "임팩트/오너십/deep dive" 서사로.
- **카카오 계열:** 과제 기반 → 과제 구조 설명 + 합류 후 쓸 기술. **Tuist 모듈화 경험이 강점.**
- **공통:** 국내 대형앱 = 모듈화(SPM/Tuist)+빌드타임+결합도가 핵심 화두. Clean+DI+protocol 지향이 미드~시니어 단골. (RIBs는 특정 조직 국한, 범용 출제 적음)

## 🅱️ 모바일 시스템 디자인 시나리오 사다리 (갭 → 빌드업)

> 쉬운 것부터. 각 시나리오 = 프레임 1회 완주. 주말에 통짜, 평일엔 스텝 나눠서.

- [~] B1. **프레임 소개 + per-user 규모추정** — ✅ 도입(2026-07-23). 남은 것: 냅킨 계산 실습
- [ ] B2. **이미지 피드 (최빈출)** — 아래 상세 참조
- [ ] B3. 무한 스크롤 타임라인 (cursor 페이지네이션·백엔드 노드32 연결)
- [ ] B4. **오프라인 우선 노트앱** — 로컬 DB=진실·**CRDT/OT 충돌해소**(감별점)
- [ ] B5. **실시간 채팅** — WebSocket·순서보장·읽음표시·오프라인큐 (아래 상세)
- [ ] B6. 푸시 알림 시스템 (APNs·토큰·페일오버·백엔드 노드34 연결)
- [ ] B7. 파일/동영상 업로드 (**chunked/resumable**·URLSession background·체크섬)
- [ ] B8. 위치 기반 서비스 (배터리·정확도 트레이드오프)
- [ ] B9. 결제 플로우 (멱등성·재시도 안전성·백엔드 노드44 연결)
- [ ] B10. 🏁 통합: "이커머스 상품 피드를 설계하라" (iOS+백엔드+SD 종합, 보스전 대비)

### 📱 모바일 특화 체크리스트 (자발적으로 짚으면 depth 신호)
```
Offline-First   로컬DB=진실, 액션 로컬큐 적재→복구시 배치sync, optimistic update, Idempotency-Key
Sync/충돌       LWW(저가치 좋아요) < 충돌UI < OT(협업편집) < CRDT(오프라인노트/멀티디바이스, 자동수렴)
Caching         memory(현재화면) / disk(히스토리·이미지 200~400MB+LRU) / CDN(서버정적)
Pagination      offset(page drift 위험) < keyset < **cursor(피드 기본추천)**. 페이지 20~50
Media           lazy load · thumbnail-first · prefetch(배터리와 균형) · WiFi/셀룰러 적응품질
Battery         네트워크=로컬 ~100x 전력 → 요청 배칭 · 폴링대신 push · 지수백오프
Persistence     CoreData(관계형) / SwiftData(신규) / SQLite·GRDB(성능) / Keychain(토큰) / UserDefaults(민감정보 금지)
Security        OAuth/JWT+Keychain · TLS·cert pinning · 서버검증 필수(클라 불신) · rate limit
```

### 🔬 상세 ① 이미지 피드 (최빈출)
```
레이어: FeedAPIService → FeedPersistence(CoreData) → RemoteMediator(다음페이지)
        → FeedRepository(remote+cache 통합=SSOT) → Pager(트리거+observable) → UseCases(Like/Detail) → ImageLoader
로컬스키마: itemId(PK)·authorId·likes/comments·attachments[URL]·createdAt·cursorNext/Prev
결정: cursor 페이지네이션 · 엔트리 상한(500)+LRU · 이미지 2-tier캐시+prefetch · 좋아요=LWW · 속보=push
트레이드오프: prefetch공격성 vs 배터리 · 캐시신선도 vs 대역폭 · 무한스크롤 메모리 vs UX
```

### 🔬 상세 ② 채팅 앱
```
컴포넌트: 로컬 메시지큐(오프라인작성) · sync엔진(배칭+dedup) · 충돌resolver · delivery/read receipt
결정: WebSocket(풀듀플렉스 표준; push=비핵심, long-poll/SSE=폴백) · 오프라인큐+지수백오프
     · message ID로 idempotent · optimistic "sending" · 서버 타임스탬프로 순서보장 · 히스토리 청크+스크롤위치 보존
```

### 🏆 쿠팡/아마존 루프 특이점 (SD 라운드)
- **루프 = 4×55분:** 코딩 2 + SD 1~2 + **Bar Raiser**(보통 마지막). L6 시니어는 HLD 중심.
- **LP는 별도 라운드 아님 — 모든 라운드에 녹아있음.** SD 중에도 behavioral 섹션. 설계 결정을 오너십/임팩트 서사와 연결.
- **평가 4축 (가중치순):** ① **Resiliency&Availability**(최고) — redundancy·failure isolation·**circuit breaker**·graceful degradation ② **Trade-off articulation** — *"트레이드오프를 설명하면 100점 준다"*, **one-way(비가역·신중) vs two-way(가역·속도) door** 프레이밍 ③ **소리내어 추론**(침묵=주니어) ④ **Security-first**.
- **2026 변화:** Cost&Operations가 명시적 평가 기준으로 승격. **Reverse system design** 빈번 — "네가 실제 만든 시스템 설명하라" → 실패모드 probe (실무 방어 준비 필수).
- **쿠팡:** 아마존 스타일 루프 + **이커머스/물류 도메인**(상품리스팅·검색·장바구니·주문·결제). 프레임워크 + 이커머스 도메인 겹쳐 준비.
- **당근:** SD 세션이 상당히 어렵고 많이들 준비 부족 → 별도 대비 필수.

### 🎯 SD 시니어 감별 포인트
```
① 먼저 clarifying question (기다리면 ownership 부족 신호)   ② 명시적 스코핑(기능 3~5개, out-of-scope 배제)
③ per-user 규모추정(서버QPS 아님)                          ④ 트레이드오프 소리내어(LWW vs CRDT, prefetch vs 배터리)
⑤ 충돌해소 성숙도(naive LWW 넘어 CRDT/OT 구분)             ⑥ resilience(flaky·백그라운딩·재시작·observability)
```
> 레드플래그: UI 과몰입 · 오프라인 무시 · 앱 고립 취급 · 트레이드오프 미articulate · 초반부터 구현디테일.

### 📚 추천 학습 리소스
- 📕 **《Mobile System Design Interview》— Manuel Vivo** (모바일 특화 바이블, "Design YouTube"/"chat app" 케이스) · [cheat sheets](https://topmate.io/manuelvivo/799730)
- 🆓 **weeeBox/mobile-system-design** (GitHub, 사실상 정규 프레임 + 솔루션) · **Bartlett "iOS System Design 2026"** ([blog](https://blog.jacobstechtavern.com/p/system-design-interview))
- 🎓 Grokking Mobile SD (Educative) · Exponent(아마존 SD) · systemdesignhandbook.com/guides/ios-system-design-interview

---

## 🔗 백엔드 대륙과의 수렴
`BACKEND.md` 제3~5대륙(캐싱/페이지네이션/실시간/아키텍처)이 여기 B 시나리오의 재료다. 백엔드 노드에서 "부품"을 배우고, 여기서 "조립"한다.

## 🏅 트랙 업적
- [ ] 🅰️ **서사의 대장장이** — 아키텍처 카드 10개 완성 (면접 방어 완비)
- [ ] 🅱️ **모바일 건축가** — SD 시나리오 10개 완주
- [ ] 🏆 **보스 대비 완료** — B10 통합 시나리오 클리어
