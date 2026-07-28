# 🍎 iOS 레슨 05 — 로컬 저장소 선택 (Core Data / SQLite / Realm / Keychain / UserDefaults)

> **왜:** `QUESTION-BANK` Top20 단골 2개(Core Data vs SQLite / Keychain vs UserDefaults). B2에서 "로컬DB를 SSOT로" 결정했으니 자연히 따라오는 질문.
> **최초 학습:** 2026-07-28 (세션6) · **선행:** `sd-b2`(이미지 피드) · **상태:** 방어 완성

---

## 🗺️ 저장소 5형제 지도
```
                    용량   구조        용도
UserDefaults        작음   key-value  설정·플래그  ⚠️ 민감정보 금지(평문 plist)
Keychain            작음   key-value  🔐 토큰·비밀번호 (암호화+OS보호)
File(Documents/Caches) 큼  파일        이미지·큰 JSON
SQLite/GRDB         큼     관계형      성능 최우선·SQL 직접 통제
Core Data/SwiftData 큼     객체그래프   관계 많고 iOS 통합 필요
```
🔑 선택 축 = 용량이 아니라 **"무엇을 저장하나 + 얼마나 통제하고 싶나"**.

---

## 1. ⭐ Core Data vs SQLite — 대립이 아니다 (핵심 오해 정정)
```
Core Data는 DB가 아니다 → "객체 그래프 관리 프레임워크"
저장 엔진으로 보통 SQLite를 씀 (Core Data on top of SQLite)

┌──────────────┐
│  Core Data   │ 객체그래프·변경추적·관계·마이그레이션
├──────────────┤
│  SQLite      │ 실제 저장 엔진
└──────────────┘
```
🗣️ **결정타:** *"Core Data와 SQLite를 대립으로 보지 않습니다. Core Data는 객체 그래프 관리 계층이고 저장 엔진으로 SQLite를 씁니다. 그래서 질문은 'DB를 뭘 쓸까'가 아니라 **'객체 그래프 추상화를 쓸까, SQL을 직접 통제할까'** 입니다."*

```
Core Data 강점                     SQLite(GRDB) 강점
관계·역관계 자동 관리                쿼리 완전 통제(복잡 JOIN·최적화)
변경 추적 → UI 자동 갱신             성능 예측 가능(숨은 비용 없음)
NSFetchedResultsController         경량·의존성 적음
iOS 통합(CloudKit) · 정식 마이그레이션 멀티스레드 모델 단순·디버깅 쉬움(SQL 로그)

Core Data 약점                     SQLite 약점
러닝커브(context·thread 규칙)        관계·마이그레이션 직접 구현
스레드 규칙 위반 시 크래시            보일러플레이트 많음
"매직" 많아 성능 디버깅 어려움         UI 자동 갱신 직접 구현
```

## 2. Realm
✅ API 직관적·빠름·변경 옵저빙 내장·**크로스플랫폼(AOS 모델 공유)**
❌ 서드파티 의존(로드맵 리스크)·앱 용량↑·live object가 스레드 넘기 어려움
→ 애플 생태계 우선이면 SwiftData/Core Data. **크로스플랫폼 모델 공유가 크면** Realm 고려.

## 3. SwiftData (iOS 17+) — 최신 트렌드
Core Data의 모던 래퍼(`@Model` 매크로 + Swift 타입 안전). 보일러플레이트↓·SwiftUI/@Observable 궁합 ✅ / 아직 성숙 중(복잡 쿼리·마이그레이션은 Core Data로 내려가야 할 수 있음) ⚠️ 둘은 **같은 저장소 공유 가능**.
🔗 `@Observable`과 같은 흐름 — 애플이 매크로로 보일러플레이트를 걷어내는 방향.

---

## 4. 🚨 Keychain vs UserDefaults (보안 단골 — 감점 많은 곳)
```
UserDefaults                     Keychain
plist에 "평문" 저장 💥             암호화 + Secure Enclave 보호
탈옥·백업 추출로 읽힘              앱 삭제해도 잔존 가능
용도: 다크모드·온보딩 여부·탭 위치   접근성 정책 지정 가능
                                 용도: 🔐 액세스/리프레시 토큰·비밀번호·시크릿
```
⚠️ **절대 문장:** *"UserDefaults는 암호화되지 않은 plist입니다. 토큰을 여기 저장하면 백업이나 탈옥 기기에서 평문으로 노출됩니다."*

**실무 디테일(가점):**
- 접근성: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` (잠금해제 + 이 기기만 → 백업 유출 방지)
- 앱 삭제 후에도 잔존 → **로그아웃 시 명시적 삭제** 필요
- 상대적으로 느림 → 매 요청마다 읽지 말고 메모리 캐싱

> 🔗 **실무 사례(내 경험 — 면접 근거로 강력):** 테스트 fixture가 앱 샌드박스 스냅샷만 복원해서 **Keychain 인증 상태가 빠져** 로그인 검증이 깨진 적 있음. → **"Keychain은 앱 샌드박스 밖(OS 관리 저장소)이라 앱 데이터 스냅샷만으론 복원되지 않는다"** 는 걸 실측으로 배움. (박제: `feedback_fixture_keychain_expiry`)

---

## 🌳 결정 트리 (암송)
```
무엇을 저장?
├─ 🔐 토큰·비밀번호·시크릿        → Keychain (무조건)
├─ ⚙️ 설정·플래그(비민감)         → UserDefaults
├─ 🖼️ 이미지·큰 파일             → File System (캐시는 Caches/)
└─ 📊 구조화 데이터 다량?
      ├─ 관계 많음+iOS통합+UI자동갱신 → Core Data (iOS17+면 SwiftData)
      ├─ 성능 최우선+쿼리 통제        → SQLite/GRDB
      └─ 크로스플랫폼 모델 공유        → Realm 고려
```

## 📁 디렉토리 구분 (가점 + B2 연결)
```
Documents/ → 백업됨. 사용자가 만든 데이터(초안·문서)
Caches/    → 재생성 가능, OS가 지울 수 있음  ← 이미지 캐시는 여기! ✅
tmp/       → 임시
⚠️ 이미지 캐시를 Documents에 두면 iCloud 백업 용량 잡아먹고 심사 지적 가능
```
**원칙: 큰 바이너리는 파일 시스템, DB는 메타데이터 + 경로만**
```
Core Data FeedItem: imageURL(원격) · localImagePath(캐시 경로)  ← 경로만
실제 바이너리는 Caches/ 에 (BLOB로 DB에 넣지 않기)
```

## 💥 잘못 두면 나는 사고 (사고 시나리오)
```
토큰 → UserDefaults      🚨 평문 노출 → 백업·탈옥으로 계정 탈취(보안사고)
이미지 → Core Data BLOB   DB 파일 폭증·쿼리 저하·백업 용량 폭발
이미지 → Documents        백업에 수백MB 포함(Caches여야 함)
메타 200개 → UserDefaults 매번 전체 read/write, 부분 갱신 불가, 시작 느림
UI 상태 → Keychain        느리고 과잉 + 앱 삭제 후 잔존해 재설치 시 이상 복원
```

**박제 한 줄:** *Core Data vs SQLite는 대립 아님(Core Data는 SQLite 위 객체그래프 계층) → 질문은 "추상화냐 SQL 통제냐". 토큰은 무조건 Keychain(UserDefaults=평문 plist). 큰 바이너리는 파일시스템(캐시는 Caches/), DB엔 경로만.*

## 🔗 연결
`sd-b2`(로컬DB SSOT·ImageLoader) · `QUESTION-BANK` 데이터저장·보안 · 다음: Core Data 마이그레이션 / SSL·TLS
