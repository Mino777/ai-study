# 📕 CHEATSHEET — 1분 복습용 압축 요약

> **용도:** 매 세션 시작 시(또는 면접 직전) **이 파일만 펼쳐서 1분 스캔**. 막히는 항목 = 약한 곳 → 해당 `lessons/` 파일로 딥다이브.
> **갱신 규약(Claude용):** 새 딥다이브 레슨을 만들 때마다 이 파일에 **압축 한 블록 추가**. 상세 설명 금지(그건 lessons), 여기는 **인출 트리거**만.
> **마지막 갱신:** 2026-07-28 (세션 6 · 🥈 Lv.6 · lessons 9개)

---

## 🌀 축 1 — 동시성 (4층) → `ios-03` `ios-04` `arch-a2` `arch-a5`

```
① 미시  await = 블로킹 ❌ → 스레드 양보(suspend) → 결과 오면 재개(resume)
             ⚠️ 블로킹처럼 "보이지만" 실제론 반납 = 동기처럼 쓰는 논블로킹

② 중간  GCD = 스레드 직접 X, "큐"에 제출
             Serial(한놈씩·안전=actor의 GCD판) / Concurrent(동시·경쟁위험)
             Main = UI 전용 serial 큐
             ⚠️ sync/async는 별개 축(기다리냐) → main.sync = 데드락
             셀 재사용 레이스: 취소 + URL/indexPath 검증

③ 거시  계층별 격리 정책
             Presentation = @MainActor + Task 수명 소유
             Domain       = nonisolated + async만 (스레드 중립)
             Data         = async throws + actor (CPU바운드 = @concurrent)
             ⛔ @MainActor 남발 = 레드플래그(성능↓ + Domain 오염 + 의존성 역전 위반)

④ 서사  Rx→async = Strangler Fig (빅뱅 X)
             1순위 일회성요청 → 2순위 신규피처 → 3순위 Data(actor)
             남겨둠: 복잡 스트림 조합(debounce·merge)
             심장: disposeBag(수동) → 구조적 취소(자동, 누수 불가)
             근거는 의견 ❌ → 플랫폼 방향성(Swift6 strict concurrency) ✅
```

## 🎨 축 2 — SwiftUI → `ios-01` `ios-02`

```
@Observable vs ObservableObject
  옛날: objectWillChange = 객체당 1개·인자 없는 신호 → 어느 프로퍼티인지 모름
        → 구독한 모든 뷰 무효화 (과잉 렌더)
  신형: 매크로가 get/set을 registrar로 감쌈 → 뷰가 접근한 keyPath만 추적
        → 그 값 바뀔 때만 무효화 (정밀)
  📢 방송국 vs 🕸️ 의존성 그래프 (signal 기반 fine-grained reactivity)
  ⚠️ @Published 깜빡 → 신호 안 나감 → UI 갱신 X, 나중에 값이 "갑자기" 튀는 유령버그

4형제 = 축 2개 (값/참조 × 소유/빌림)
              소유            빌림
  값 타입   @State          @Binding ($)
  참조 타입 @StateObject    @ObservedObject
  ⚠️ 뷰에서 `= VM()` 생성 → 반드시 @StateObject
     (View는 struct → 부모 갱신마다 re-init → 이니셜라이저 재실행 → 상태 리셋)
  iOS17+: @State / let / @Bindable 로 단순화
```

## 🏛️ 축 3 — 시스템 디자인 → `sd-b1` `sd-b2`

```
규모추정 = 서버 QPS ❌ → per-user 자원예산 ✅
  기준값: 메모리 200~500MB · 디스크캐시 200~400MB · 페이지 20~50
          요청 <1MB · 네트워크 = 로컬 100배 전력 ⚡
냅킨 4스텝: 아이템 무게 → ×페이지 → ×세션누적 → 설계 결정으로 번역

⭐ 이미지 디코딩 배율
  비트맵 = 해상도 × 4bytes(RGBA)  ← 파일 용량과 무관!
  1080×1080 = 4.5MB (JPEG 300KB든 2MB든 동일)
  → 디스크=압축(1000장) / 메모리=디코딩(20장) = 200배 차이
  → 상한은 장수 ❌ 총 바이트(cost) ✅ + 다운샘플링(~100배 절감)

이미지 피드 (최빈출 1위)
  cursor 페이지네이션 (offset = page drift 중복/누락)
  로컬DB SSOT → View는 DB만 관찰 → 온/오프라인 분기 소멸 + 부분 실패 내성
  optimistic + SyncQueue + Idempotency-Key
  충돌: 좋아요=LWW 충분 (CRDT는 오프라인 멀티디바이스 편집용)
  one-way(구조 결정=SSOT) vs two-way(캐시 수치) door
```

## 💾 축 4 — 저장소 → `ios-05`

```
🔐 토큰·비밀번호   → Keychain     (UserDefaults는 암호화 안 된 평문 plist!)
⚙️ 설정·플래그     → UserDefaults
🖼️ 이미지·큰 파일  → File System  (캐시는 Caches/ ! Documents는 백업됨)
📊 구조화 데이터   → Core Data/SwiftData(관계·UI자동갱신) or SQLite/GRDB(쿼리통제)

⭐ Core Data vs SQLite = 대립 아님!
   Core Data = 객체그래프 관리 계층, 아래 저장 엔진이 SQLite
   → 진짜 질문: "추상화를 쓸까, SQL을 직접 통제할까"
원칙: 큰 바이너리는 파일시스템, DB엔 경로만 (BLOB 금지)
```

## 🧮 축 5 — DSA 쪽집게 (트리거 반사) → `w1-01` `w1-02`

```
"짝 찾기"·"본 적 있나"·빈도  → 해시 (메모리 대가로 시간 사기)     ✅졸업
"정렬됨"·"양끝/회문"         → 투포인터 (공간 O(1) 절약!)        🔶
"연속 부분배열/윈도우"        → 슬라이딩 윈도우                  ⬜다음
"괄호/짝맞춤"·"다음 큰 수"    → 스택                            ⬜
"격자/섬/연결"               → BFS/DFS                        ⬜

3Sum = 정렬 + 바깥루프 i 고정 + 안쪽 투포인터 = O(n²) (중복스킵 3군데)
⚠️ 자주 헷갈림: 해시=공간 주고 시간 산다 / 투포인터=공간 아낀다 (반대!)
Big-O 4단계: ①중첩 몇겹 ②정렬/반씩→log ③숨은 O(n)(contains/sort) ④큰 항만
```

## 🤖 축 6 — AI 활용 면접 → `AI-TEST.md`

```
Meta 4대 평가기준: 문제해결 · 코드품질 · ⭐검증 · 커뮤니케이션
3단계: ① 문제분해(AI 안 씀!) → ② AI로 구현 → ③ 리뷰·정제·방어
황금률: AI는 조수 not 운전자 · 오버커뮤니케이션 · 믿기 전 의심
❌ 5대 실수: 이해 전 프롬프트 · 읽지 않고 붙여넣기 · 프롬프트 죽음의 소용돌이
            · 검증 부실 · 툴 실패 시 패닉
⚠️ iOS는 전용 라운드 아직 표준 X → 행동/딥다이브에서 "AI 어떻게 쓰나" STAR가 주력
🗡️ 내 무기: 하네스(검증 게이트·falsification-first·서브에이전트) = 시스템화한 경험
```

---

## 🗡️ 면접 킬러 문장 5개 (암송)

```
1. "경고가 사라진 건 해결이 아니라 은폐입니다."              (@MainActor 남발)
2. "Core Data와 SQLite는 대립이 아닙니다."                  (저장소)
3. "Rx는 취소·스레드안전을 개발자 규율에 의존하고,
    구조적 동시성은 컴파일러 보장으로 끌어올립니다."          (전환)
4. "View가 오히려 더 단순해집니다."                         (로컬DB SSOT)
5. "다만 읽기전용+오프라인 불필요면 과잉이라 안 씁니다."       (종교적 옹호 회피)
```

## 🏛️ 아키텍처 서사 4틀 (모든 아키텍처 질문 공통)
```
① 상황 → ② 결정 → ③ 트레이드오프 → ④ 방어(mitigation) ⭐
결정타: 비용만 말하고 끝내지 말고 "그 비용을 어떻게 줄였나"까지
```

## 🩹 교정된 오해 (다시 안 틀리기)
```
❌ await는 블로킹              → ✅ 양보(suspend)
❌ UI는 메인에서 "동기적으로"   → ✅ main.async (sync는 데드락)
❌ 투포인터는 시간 최적화       → ✅ 공간 절약 (해시가 시간)
❌ @Published를 "채택"         → ✅ 프로퍼티 래퍼를 "마킹" (프로토콜은 채택)
```

## 🗣️ 표현 코칭
```
"~해서?" "~겠고?"  →  "~합니다. 왜냐하면 ~입니다."
면접은 확신의 게임. 틀려도 확신 있게 말한 뒤 "다만 확인이 필요합니다".
```

---

## 📊 진행 현황 (세션 6 기준)

| 스탯 | 시작 → 현재 |
|------|------------|
| 🌀 동시성 | 25 → **55** |
| 🏛️ 시스템디자인 | 18 → **50** |
| 🎨 SwiftUI | 30 → **50** |
| 🎤 면접력 | 48 → **58** |
| 🤖 AI활용 | **72** (우위) |

- **Top20 커버:** 8/20 · **lessons:** 9개 · **SRS 카드:** 20장 · 🥈 **Lv.6**
- **카드:** 🅰️ A1·A2·A5 ✅ / 🅱️ B1·B2 ✅
- **다음:** SSL/TLS+cert pinning · A3(DI) · Codable · QoS · B4(오프라인·CRDT)

## 🔗 문서 지도
```
CHEATSHEET.md   ← 지금 이 파일 (1분 복습)
PROGRESS.md     진도·세션로그·약점노트     GAME.md      캐릭터시트·XP
REVIEW.md       SRS 카드(능동인출)        CURRICULUM.md 12주 계획 v2
QUESTION-BANK.md 면접 질문 커버맵         ARCH-SD.md   아키텍처·SD 트랙
AI-TEST.md      AI 활용 면접 트랙         lessons/     딥다이브 원문
interview-stories/ 내 프로젝트 답변 뱅크(12문서)
```
