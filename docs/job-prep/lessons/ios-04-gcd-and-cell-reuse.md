# 🍎 iOS 레슨 04 — GCD (Serial/Concurrent/Main) + 셀 재사용 레이스

> **왜:** `QUESTION-BANK` Top20 단골 2개(GCD 큐 개념 · TableView 이미지 잘못된 셀)를 한 번에. async/await의 밑단.
> **최초 학습:** 2026-07-28 (세션6) · **선행:** `lessons/ios-03`(Rx→async) · **복습:** `REVIEW.md`

---

## 0. GCD 정신
**스레드를 직접 만들지 마라. "큐"에 작업을 제출하라. 스레드 배정은 시스템이.**

## 1. 큐 2종류
```
Serial 큐 (직렬)            Concurrent 큐 (동시)
한 번에 1개, FIFO 순서       여러 개 동시 출발
순서·안전 보장               빠름, 순서 보장 X, 공유자원 경쟁 위험
= actor 의 GCD 버전          = global() 기본
```

## 2. Main 큐 = 특별한 Serial 큐
- 메인 스레드에서 도는 serial 큐. **모든 UI 작업 전용**(UIKit/SwiftUI).
- `@MainActor` / Rx `observeOn(Main)` = 결국 "이 큐로 보내라".
- 관용구: **무거운 작업 → 백그라운드 큐 / UI 갱신 → `main.async` 복귀**
```swift
DispatchQueue.global(qos: .userInitiated).async {
    let data = heavyDecode()
    DispatchQueue.main.async { self.label.text = data }   // ✅ async (sync 아님!)
}
```

## 3. sync vs async = **별개의 축** (큐 종류와 혼동 금지)
```
async = 제출하고 바로 다음 줄 (안 기다림)
sync  = 끝날 때까지 호출자 대기 (블로킹)

              async            sync
serial     │ 순서·논블로킹    │ 순서·호출자 대기 │
concurrent │ 동시·논블로킹    │ 동시·호출자 대기 │
```

## 💥 함정 A — 메인에서 sync = 데드락
```swift
DispatchQueue.main.sync { ... }   // 메인 스레드에서 호출 시 🚨 데드락
```
메인 큐(serial)는 현재 코드를 끝내야 다음 실행 → 근데 sync는 그 블록 끝날 때까지 대기 → **상호 대기 = 영구 정지.**
> ⚠️ 표현 주의: "UI는 메인에서 **동기적으로**"는 틀린 관용어. 정확히는 "**메인 스레드에서** 실행"이고 실무 관용구는 `main.async`.

## 💥 함정 B — 셀 재사용 레이스 (이미지가 엉뚱한 셀에)
```
셀 A가 이미지1 다운로드 시작 (느림)
 → 스크롤로 셀 A 재사용 → 이제 "셀 F" 역할
 → 뒤늦게 이미지1 도착 → 그 셀에 그림 💥 (F 자리에 A 이미지)
```
**해결 3종:**
1. `prepareForReuse()`에서 진행 중 요청 **취소** + 이미지 nil
2. 완료 콜백에서 **"이 셀이 아직 그 indexPath/URL 맞나" 검증** 후에만 반영
3. (모던) 셀이 `Task`를 보유 → 재사용 시 `cancel()` ← **구조적 취소 연결**

> 🔗 Rx `disposeBag` / `Task.cancel()`이 곧 "재사용 시 이전 작업 취소" 도구.

## 🎤 모범답안 (렉 + 엉뚱한 이미지)
> "렉은 무거운 디코딩/다운로드를 메인에서 돌려서일 가능성이 큽니다 → 백그라운드 큐(적절한 QoS)로 옮기고 UI 갱신만 `main.async`로 복귀시킵니다. 엉뚱한 이미지는 셀 재사용 레이스입니다 → `prepareForReuse`에서 이전 요청을 취소하고, 완료 시점에 URL/indexPath 일치를 검증한 뒤에만 반영합니다."

## 🔗 GCD → Swift Concurrency 매핑
```
Serial 큐        → actor
Main 큐          → @MainActor
global().async   → Task { } / await
completion 중첩   → async/await 선형
```
GCD=수동 큐 관리 / Concurrency=언어가 구조적 보장. 밑단 개념(스레드·직렬화)은 동일.

**박제 한 줄:** *큐에 제출(스레드 직접X). Serial=한놈씩·안전, Concurrent=동시·경쟁위험, Main=UI 전용 serial. sync/async는 별개 축. 메인에서 sync=데드락. 셀 이미지는 재사용 레이스 → 취소+검증.*

## 🔗 다음
- QoS 클래스 상세 · Core Data vs SQLite · SSL/TLS (→ `QUESTION-BANK.md` 드릴 큐)
