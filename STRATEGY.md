# STRATEGY — 포트폴리오 방향성 & 무기화 전략

> **이 문서는 ai-study 위키의 전략적 방향을 정의한다.**
> 외부 평가(Gemini, 2026-04-14)를 기반으로 강점을 식별하고,
> 앞으로의 개발 방향을 "포트폴리오 무기화" 관점에서 정리한다.

---

## 포지셔닝

이 위키는 **개인 공부 노트가 아니다.**

> "나는 AI를 프로덕션 레벨에서 안전하고 통제 가능하게 다룰 줄 아는 엔지니어다"

이것을 증명하는 **실전 AI Ops & 플랫폼 아키텍처 포트폴리오**다.

---

## 4대 무기 (검증된 강점)

### 무기 1: Harness Engineering — AI 제어 시스템 설계

**차별점**: "API 연결해봤다" 수준이 아니라, AI의 고삐(Harness)를 쥐고 환각과 오류를 **구조적으로** 제어하는 시스템 설계 능력.

| 핵심 자산 | 엔트리 | 증명하는 것 |
|---|---|---|
| AI 출력 Zod 검증 5 Layer | `ai-output-zod-validation-pattern` | "AI가 엉뚱한 답을 하면?" → schema.parse로 환각 차단 |
| Circuit Breaker + 폴백 | `ai-call-patterns-circuit-breaker-fallback` | 멀티 프로바이더 장애 대응 |
| Runtime Validator 10/10 | Journal 012~018 | 13개 AI 에이전트 전부에 검증 레이어 적용 완료 |
| Text Output Guards | Journal 009 | AI 출력의 금지어/포맷 위반 자동 차단 |

**방향**: 이 무기를 더 날카롭게.
- [ ] Layer 5 (Human-in-the-loop escalation) 패턴 정의 + 실전 적용
- [ ] 검증 실패 시 자동 재시도 성공률 데이터 수집 → 실측 기반 신뢰도 지표
- [ ] "AI 안전성 대시보드" 개념 — 검증 통과율, 재시도율, 폴백 발동률 시각화

---

### 무기 2: 다중 프로젝트 관제 + Tokenomics (비용 최적화)

**차별점**: 코딩만 하는 게 아니라 **비즈니스 임팩트(비용/효율)를 관리**하는 경영자적 마인드.

| 핵심 자산 | 엔트리 | 증명하는 것 |
|---|---|---|
| AI API 비용 추적 패턴 | `ai-api-cost-tracking-pattern` | 모델별 단가 + 실시간 로깅 |
| Tokenomics 레버 카탈로그 | `claude-code-token-levers-catalog` | 15개 토큰 최적화 레버 체계화 |
| 적용 로그 (실측) | `claude-code-token-levers-applied-log` | .claudeignore ~50% context 축소, RTK 47.4M tokens 절감 |
| 허브-워커 모델 | Journal 011~014 | 3 프로젝트 동시 관제 + 양방향 기여 인프라 |

**방향**: 비용 가시성을 프로덕션 수준으로.
- [ ] 비용 추적 DB 저장 (Supabase) → 일별/주별 트렌드 대시보드
- [ ] LLM-as-a-Judge quality_score 데이터 분석 → 비용 대비 품질 최적점 탐색
- [ ] 프롬프트 A/B 테스트 인프라 → "이 프롬프트가 X원 더 쓰지만 품질이 Y% 높다" 데이터 기반 의사결정

---

### 무기 3: 에이전트 온보딩 & 컨텍스트 제어

**차별점**: AI 에이전트가 새 프로젝트에 투입될 때, **시스템이 알아서 올바른 규칙을 따르도록** 환경을 세팅(Bootstrap)하는 플랫폼 엔지니어링 역량.

| 핵심 자산 | 엔트리 | 증명하는 것 |
|---|---|---|
| AI Agent Start Here | `ai-agent-start-here` | 30초 안에 에이전트 역할 정의 + 상황별 라우팅 |
| CLAUDE.md + SPEC.md 체계 | 루트 문서 | 프로젝트 규약을 에이전트가 자동 로드 |
| 진단 체크리스트 50문항 | `ai-ops-environment-diagnosis-checklist` | 새 프로젝트 AI 환경 진단 표준 |
| LLM-First 설계 원칙 | `llm-first-wiki-principles` | 사람+AI 동시 독자를 위한 문서 설계 |

**방향**: 이식 가능한 표준 킷으로.
- [ ] "AI-Ready Project Starter Kit" — CLAUDE.md + .claudeignore + hooks + 기본 슬래시 커맨드를 새 프로젝트에 5분 안에 이식하는 CLI/스크립트
- [ ] 에이전트 온보딩 시간 측정 → "이 킷 적용 전 vs 후" 정량 비교
- [ ] Context Engineering 심화 — 컨텍스트 윈도우 활용률 최적화 패턴 추가 (현재 3 엔트리 → 확장)

---

### 무기 4: 실전 트러블슈팅 + Compound 복리 시스템

**차별점**: 화려한 성공 스토리가 아니라, **실패를 구조적 자산(Compound)으로 전환**하는 시스템.

| 핵심 자산 | 엔트리 | 증명하는 것 |
|---|---|---|
| Harness Journal 21편 | 000~021 | 실전 사이클 기록 (사고 재발률 0/14) |
| Compound Philosophy | `compound-engineering-philosophy` | 12 원칙 + 4단계 루프 |
| /compound 자동화 | 슬래시 커맨드 | CHANGELOG + 회고 + 솔루션 자동 생성 |
| 크로스 세션 리뷰 | Journal 019 + `/cross-session-review` | 다른 세션 부산물 6 함정 패턴 박제 |

**방향**: 복리 효과를 측정 가능하게.
- [ ] "회고 소환율" 지표 — 박제된 회고가 다음 세션에서 실제 소환된 비율 추적
- [ ] Journal 시리즈 자체의 성장 곡선 시각화 (사이클 크기, 소요 시간, 사고율 추이)
- [ ] iOS Journal 시리즈 확장 (006 이후 라이브 트리거 대기)

---

## 전략적 개발 우선순위

위 4대 무기를 기반으로, **다음 단계 개발 우선순위**:

### Tier 1 — 즉시 (다음 1-2 세션)

| 항목 | 무기 | 이유 |
|---|---|---|
| LLM-as-a-Judge 데이터 분석 | 무기 2 | 데이터 이미 축적 중. 분석만 하면 "비용 대비 품질" 인사이트 즉시 확보 |
| Tokenomics 실측 before/after | 무기 2 | ccusage 베이스라인 확보됨. 비교 데이터만 추가하면 정량적 성과 |

### Tier 2 — 단기 (1-2주)

| 항목 | 무기 | 이유 |
|---|---|---|
| AI-Ready Starter Kit 정의 | 무기 3 | "새 프로젝트에 5분 이식" 스토리 완성 |
| 검증 성공률 대시보드 (위키 내) | 무기 1 | 안전성을 숫자로 보여주는 시각화 |
| Context Engineering 엔트리 확장 | 무기 3 | 현재 3 엔트리로 약함. 실전 패턴 추가 |

### Tier 3 — 중기 (1개월)

| 항목 | 무기 | 이유 |
|---|---|---|
| 비용 추적 DB + 대시보드 | 무기 2 | Supabase 마이그레이션 필요 |
| 프롬프트 A/B 테스트 인프라 | 무기 2+1 | quality_score 데이터 기반 |
| RAG 파이프라인 (tarosaju) | 무기 1 | domain_accuracy 점수 기반 트리거 |

### Backlog — 트리거 대기

| 항목 | 트리거 조건 |
|---|---|
| Layer 5 Human-in-the-loop | 검증 실패율이 재시도로 해결 안 되는 케이스 발견 시 |
| iOS Journal 007+ | moneyflow-ios에서 새 패턴 발견 시 |
| 사이클 성장 곡선 시각화 | Journal 30편 이상 축적 시 |

---

## 포트폴리오 워딩 가이드

이 위키를 외부에 소개할 때 **절대 쓰지 않는 표현**:

- ~~"개인 공부 위키입니다"~~
- ~~"AI 관련 학습 노트"~~
- ~~"기술 블로그"~~

**대신 쓰는 표현**:

> **다중 AI 에이전트 관제 허브 및 생산성 파이프라인**
>
> 3개 프로덕트(금융 대시보드, 운세 서비스, 지식 관제 허브)를 통합 관리하며,
> AI 환각 방지(Zod 5-Layer 검증) + 비용 최적화(Tokenomics) +
> 에이전트 온보딩 자동화(Bootstrap Kit)를 구축한 실전 포트폴리오.

### 정량 성과 (현재 기준)

| 지표 | 값 |
|---|---|
| 박제된 엔지니어링 패턴 | 70 엔트리 |
| 실전 운영 사이클 | 21 Journal (사고 재발률 0/14) |
| Runtime Validator 커버리지 | 10/10 AI 에이전트 (Layer 1-4 완료) |
| 토큰 절감 | 47.4M tokens (RTK), ~50% context 축소 (.claudeignore) |
| 자동화 슬래시 커맨드 | 7개 (개발 워크플로우 표준화) |
| CI/CD 자동 머지 | 3 프로젝트 ai-review.yml 통합 |
| LLM-as-a-Judge | 3 프로젝트 품질 자동 평가 적용 |

---

## 이 문서의 운영

- **갱신 주기**: 새로운 외부 평가 또는 전략 전환 시
- **참조 관계**: NEXT.md(세션 계획)의 큐 우선순위가 이 문서의 Tier와 정렬되어야 함
- **검증**: 각 Tier 항목 완료 시 "정량 성과" 테이블 갱신
