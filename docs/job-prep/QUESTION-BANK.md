# 🎯 iOS 면접 질문 뱅크 (드릴 큐)

> **출처:** [JeaSungLEE/iOSInterviewquestions](https://github.com/JeaSungLEE/iOSInterviewquestions)(한국 iOS 면접 질문) + [weeeBox/mobile-system-design](https://github.com/weeeBox/mobile-system-design) 를 **우리 5트랙 구조로 재편·커버매핑**한 것.
> **용도:** 매일 🍎/🏛️ 블록에서 **갭(⬜) 질문 1~2개 능동인출** → 방어되면 lessons 박제 + `REVIEW.md` SRS 카드화.
> **범례:** ✅ 방어완성(lessons 있음) · 💪 강점(복습만) · 🔶 진행중 · ⬜ 갭(우선 드릴) · ⭐ Top20 빈출

---

## 🍎 iOS 심화 (최우선 — 동시성 ≒ SwiftUI 갭)

### SwiftUI
- ✅ `@State` / `@Binding` / `@StateObject` / `@ObservedObject` 차이 ⭐ → `lessons/ios-02`
- ✅ `@Observable` 매크로의 이점 / `ObservableObject` 대비 ⭐ → `lessons/ios-01`
- ✅ View의 body가 다시 그려지는 시점 → `lessons/ios-01`(무효화 원리)
- ⬜ SwiftUI vs UIKit 데이터 흐름 차이 (단방향 vs 양방향)
- ⬜ `@Environment` / `@EnvironmentObject` / `@Bindable` 용법
- ⬜ NavigationStack / 프로그래매틱 네비게이션

### 동시성
- 🔶 async/await를 completion handler 대신 쓰는 이유 + 마이그레이션 ⭐ → `lessons/ios-03`(Rx→async)
- ✅ GCD Serial vs Concurrent 큐, Main 스레드의 역할 ⭐ → `lessons/ios-04` (+ main.sync 데드락)
- ⬜ QoS 클래스와 우선순위
- ⬜ actor 재진입(reentrancy) 함정 / Sendable / Swift6 strict concurrency
- ⬜ 프로세스 vs 스레드

### UIKit
- ✅ TableView 셀 재사용 메커니즘 ⭐ → `lessons/ios-04`
- ✅ 이미지 다운로드 중 잘못된 셀에 표시되는 문제(재사용 함정) + 해결 ⭐ → `lessons/ios-04`
- ⬜ Delegate 패턴 메모리 누수 방지 / 동적 셀 높이 / AutoLayout 성능

### 메모리 (💪 강점 — 복습만)
- 💪 ARC 동작 원리 + 순환 참조 해결 ⭐
- 💪 강한/약한/미소유 참조, `[weak self]` vs `[unowned self]` ⭐
- 💪 힙 vs 스택, 값 타입 vs 참조 타입 관계 ⭐ (COW 연결 → `REVIEW.md`)

### 데이터 저장
- ⬜ Core Data vs SQLite vs Realm 비교 ⭐
- ⬜ Keychain 용도 + UserDefaults 대비 (민감정보) ⭐
- ⬜ Core Data 마이그레이션 / SwiftData vs Core Data

---

## 💬 Swift 언어 (💪 대부분 강점 — 인출 확인만)
- 💪 옵셔널 + 안전한 언래핑 / 강제 언래핑이 위험한 이유 ⭐
- 💪 프로토콜 + POP(프로토콜 지향) 장점 ⭐
- 💪 클로저 캡처 + `@escaping` + 누수 방지 ⭐
- 💪 고차 함수(map/filter/reduce/flatMap) 사용 시점 ⭐
- 💪 제네릭 / 에러 처리(throws·try·catch) / Property Wrapper
- ⬜ Codable JSON 디코딩 실전(중첩·키매핑·실패) ⭐ ← 실무 단골, 확인 필요

---

## 🏛️ 아키텍처 & 시스템 디자인 (💪 강점 → 서사화)
> 상세는 `ARCH-SD.md`. 여기선 질문 체크리스트만.
- 💪 MVC / MVVM + 데이터 바인딩 ⭐ → ARCH-SD A4
- 💪 의존성 주입으로 테스트 가능성 향상 ⭐ → ARCH-SD A3
- 💪 싱글톤 문제점 / 아키텍처 선택 기준
- 🔶 SD: 이미지 피드 / 오프라인동기화 / 채팅 → ARCH-SD B트랙
- ⬜ "네 아키텍처 설명해라" 100% 출제 → ARCH-SD A1(모듈화·완성) 리허설

---

## 🌐 CS · 네트워크 · 보안 · 성능 (⬜ 대체로 갭 — CS 약점)
### CS 기초
- ⬜ CPU/RAM/저장장치 역할 / 캐시 지역성 / 가상 메모리
### 네트워크
- ⬜ HTTP vs HTTPS + SSL/TLS 핸드셰이크 과정 ⭐
- ⬜ REST 제약조건 + HTTP 메서드/상태코드 ⭐
- ⬜ TCP vs UDP 선택 기준(화상통화 예시) / HTTP1.1 vs HTTP2 / OSI에서 URLSession 계층
### 보안
- ⬜ 대칭키 vs 비대칭키 / 해싱+솔트 / Certificate Pinning + MITM 방지 (→ ARCH-SD 네트워크계층 연결)
### 성능
- 🔶 메모리 경고 대응 / 스크롤 성능 → `lessons/sd-b1`(디코딩 배율·NSCache cost·다운샘플링) + `ios-04`(GCD). 남은 것: Instruments 사용법

---

## 🚀 고급 (선택 — 여유 시)
- ⬜ Combine Publisher/Subscriber (Rx 지식 전이 쉬움) / Core ML / Vision / WidgetKit / Core Bluetooth(BLE)

---

## 🤖 AI 활용 (이 레포엔 없음 — `AI-TEST.md` 참조)

---

## 📌 드릴 큐 (다음 세션들 · 갭 우선순위)

피벗 전략상 **🍎 iOS 갭 → 🏛️ 서사화** 순. 강점(💪)은 인출 확인만, 갭(⬜)에 시간 투자.

1. ✅ ~~**GCD Serial/Concurrent + Main 스레드**~~ → `lessons/ios-04` (2026-07-28)
2. ✅ ~~**TableView 셀 재사용 + 이미지 잘못된 셀 함정**~~ → `lessons/ios-04` (2026-07-28)
3. ⬜ **Core Data vs SQLite vs Realm + Keychain vs UserDefaults** (데이터 저장) ⭐ ← 다음
4. ⬜ **SSL/TLS 핸드셰이크 + HTTPS** (네트워크·보안, cert pinning 연결) ⭐
5. ⬜ **Codable 실전 디코딩** (실무 단골 확인)
6. ⬜ **QoS 클래스 + 우선순위** (GCD 후속)
7. 💪 **ARC/순환참조 + weak/unowned** 인출 확인 (강점, 빠르게)

> weeeBox **레벨별 기대치**는 `ARCH-SD.md`에 흡수(주니어→스태프 루브릭). SD 프레임은 이미 커버.
