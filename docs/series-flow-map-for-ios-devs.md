# Flow Map for iOS Devs — 시리즈 연재 계획

> **작성일**: 2026-04-16
> **상태**: 연재 중 (2/N)
> **목적**: iOS 주력 개발자가 익숙하지 않은 플랫폼(백엔드/안드로이드/아키텍처/운영)을 학습할 때, 코드 디테일이 아닌 **"한 요청/한 액션의 여정"** 관점으로 큰 그림을 잡도록 돕는 시리즈 박제.

---

## 왜 이 시리즈인가

### 갭 인식
iOS 주력 개발자가 새 플랫폼 학습을 시작할 때 반복되는 실패 패턴:
- **파일/폴더 단위 독해** → 각 조각이 "왜 필요한지" 맥락 없이 읽다가 지침
- **튜토리얼 무한 반복** → 실제 레포의 복잡성과 괴리
- **새 용어에 압도** → 이미 아는 iOS 개념에 매핑하지 않으면 처음부터 공부하는 꼴
- **설정 파일(application.yml, build.gradle)부터 시작** → 흐름이 안 보임

### 시리즈의 방법론
1. **"한 요청/액션의 여정"을 관통하는 Mermaid 플로우** 제공
2. **iOS ↔ 대상 플랫폼 매핑표**로 이미 아는 개념에 새 용어 붙이기
3. **관심사별 훑기** — 각 주제를 "왜 필요한가?" 한 문장으로 답할 수 있으면 통과
4. **Week 1~N 실전 로드맵** — 바로 앉아서 시작할 수 있는 단계별 실습
5. **자주 막히는 지점** 미리 공유 (환경 설정, 에뮬레이터, Circuit Breaker OPEN 등)

### 1차 타겟 = 미노 본인
이 시리즈는 **aidy 풀스택 프로젝트(iOS + Android + Server + Architect)** 를 진행 중인 본인의 학습 기록이기도 하다. 작은 실제 레포로 배우는 게 튜토리얼보다 빠르다는 전제.

---

## 시리즈 공통 구조 (템플릿)

모든 엔트리가 아래 뼈대를 공유한다. 새 글을 쓸 때 이 순서를 따른다.

```
1. 한 줄 요약
2. 갭 / 맥락 — iOS 개발자의 흔한 실패 패턴
3. 레포가 학습 재료로 좋은 이유 — 스택 개요
4. 1단계: "한 X의 여정" 따라가기
   - Mermaid 플로우 다이어그램
   - 각 단계 설명 + iOS 대응표
5. 2단계: 관심사별 훑기 (각 주제 한 문장)
6. 3단계: iOS 경험을 레버리지 — 비교 매핑표 15~20개
7. 4단계: 실전 학습 로드맵 (Week 1~5/6)
8. 자주 막히는 지점 — 환경/설정 함정 5~8개
9. AI Agent Directive — Trigger / Prerequisites / Actionable Steps / Anti-patterns
10. 다음 학습 연결
11. 출처 / 검증 메모
12. (frontmatter) 자가 점검 Quiz 3문항
```

### 스타일 규칙
- **Confidence**: 2 (학습 중) — 시리즈 엔트리의 기본값. 깊어지면 3~4로 격상
- **Category**: 해당 플랫폼(`backend-ai`, `android-ai`, `ios-ai`, `harness-engineering` 등)
- **Tags 필수**: `aidy`, `ios-to-{platform}`, `learning-path`, `{stack-keyword}`
- **톤**: 기술적이되 **iOS 개발자의 기존 어휘**로 번역. "이건 SwiftUI의 저거구나"가 바로 와닿게
- **코드 비중**: 낮음. 본 시리즈는 "큰 그림" 목적. 깊은 코드는 별도 엔트리로 분리(예: `spring-boot-ai-circuit-breaker.mdx`)
- **Mermaid 문법 주의**:
  - `subgraph`는 `subgraph id ["label"]` 형식 (라벨에 따옴표 필요)
  - 노드 라벨에 `()` 포함 시 `["label()"]` 로 이스케이프
  - `validate-content.mjs`가 자동 수정하지 못하는 케이스

---

## 연재 로드맵

### ✅ 출간 완료

| # | 글 | 카테고리 | 소스 레포 | 날짜 |
|---|-----|---------|-----------|------|
| 1 | [aidy-server로 그리는 백엔드 흐름 맵](/wiki/backend-ai/backend-flow-map-via-aidy-server) | backend-ai | aidy-server (Spring Boot + Kotlin) | 2026-04-16 |
| 2 | [aidy-android로 그리는 안드로이드 흐름 맵](/wiki/android-ai/android-flow-map-via-aidy-android) | android-ai | aidy-android (Compose + Kotlin) | 2026-04-16 |

### 📝 예정

| # | 가제 | 카테고리 | 소스 레포 | 우선순위 |
|---|------|---------|-----------|---------|
| 3 | aidy-ios로 다시 보는 iOS 흐름 맵 — Clean Architecture + Swinject | ios-ai | aidy-ios | 높음 |
| 4 | aidy-architect로 보는 멀티 세션 오케스트레이션 — 스펙 기반 개발 패턴 | harness-engineering | aidy-architect | 높음 |
| 5 | aidy 풀스택 배포 파이프라인 — 로컬 → Neon/Vercel → 프로덕션 | infrastructure | (통합) | 중간 |
| 6 | API 계약이 코드보다 먼저 — api-contract.md로 보는 3-client 동기화 | context-engineering | aidy-architect | 중간 |
| 7 | aidy 테스트 전략 — 서버 통합 + ViewModel 단위 + iOS snapshot | evaluation | (통합) | 낮음 |

> 3번(iOS 흐름 맵)은 "내가 아는 플랫폼을 새 틀로 다시 보기"라는 역방향 학습 — SwiftUI/RIBs/ReactorKit 같은 실무 프로젝트 아키텍처를 **같은 시리즈 포맷**에 담으면 본인도 체계화되고, 독자도 iOS ↔ 타 플랫폼 대응을 양방향으로 참조할 수 있다.

---

## 시리즈 운영 가이드

### 새 글을 시작할 때 체크리스트
```
[ ] 대상 레포 README.md + CLAUDE.md 읽기
[ ] 실제 코드 최소 3~5개 파일 훑기 (엔트리 포인트 → 핵심 흐름)
[ ] "한 X의 여정"을 종이/텍스트로 먼저 그려보기
[ ] iOS 매핑표 15~20줄 먼저 채우기 (이미 아는 것부터 → 모르는 것)
[ ] Mermaid 초안 → validate-content.mjs 로컬 통과 확인
[ ] Quiz 3문항: 핵심 개념 1 + iOS 매핑 1 + 흔한 함정 1
[ ] connections 필드에 이전 시리즈 엔트리 + 관련 엔트리 연결
```

### 향후 실제 시리즈 등록 (옵션)
현재는 독립 엔트리로 운영 중. 필요 시 schema의 SERIES_LABELS에 추가하여 사이드바 그룹화 가능:

```ts
// src/lib/schema.ts
"flow-map-for-ios-devs": { label: "Flow Map (iOS Devs)", icon: "🗺️" },
```

등록 후 각 엔트리 frontmatter에 `series: "flow-map-for-ios-devs"` 추가하면 사이드바가 자동으로 묶어준다.

> **현재 판단**: 엔트리 2개 수준에서는 독립 운영으로 충분. 4~5개 누적되면 시리즈 등록 검토.

### 품질 게이트
- 각 엔트리가 **독립적으로도 읽히도록** — 이전 글을 안 읽어도 완결된 학습
- 하지만 **크로스 레퍼런스는 적극적으로** — connections + "다음 학습 연결" 섹션
- Confidence 2 → 해당 플랫폼 4주 이상 실습 후 3으로 격상
- 3 이상이 된 엔트리는 별도 "심화" 글로 분화 (예: Circuit Breaker 엔트리)

---

## 메타: 이 시리즈가 ai-study 허브에서 갖는 위치

- **방법론 카테고리**(prompt/context/harness/tokenomics)는 AI 엔지니어링 기술 박제
- **응용 카테고리**(ios-ai/frontend-ai/android-ai/backend-ai)는 플랫폼별 AI 적용 박제
- **Flow Map 시리즈**는 응용 카테고리 내 "플랫폼 학습 온보딩" 레인을 담당
  - aidy 프로젝트의 실제 학습 과정이 곧 AI 하네스의 훈련 데이터
  - 같은 API 계약을 3개 클라이언트가 구현하는 모습 자체가 **Architect 관제 시스템의 실증**

---

## 관련 문서

- `~/Develop/ai-study/CLAUDE.md` — ai-study 프로젝트 규약
- `~/Develop/ai-study/SPEC.md` — 엔티티 / AI Agent Contract
- `~/Develop/aidy-architect/specs/api-contract.md` — 3-client 공통 API 계약
- [harness-engineering/aidy-journal-000-architect-worker-baseline](/wiki/harness-engineering/aidy-journal-000-architect-worker-baseline) — Architect/Worker 관제 구조
