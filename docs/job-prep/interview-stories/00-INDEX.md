# 🎤 인터뷰 답변 뱅크 — "네가 만든 걸 설명하라" (Reverse System Design)

> 두 실제 시스템(**카셰어링 앱** + **AI 개발 하네스**)을 심층 분석해 만든 인터뷰 답변 풀세트.
> ultracode 다중 에이전트(21개) 분석 → 합성 → 적대적 probe 방어까지. 총 **2,550+줄 / 12문서**.
> 생성 2026-07-23.

## 🔒 익명화 & 사용 원칙 (반드시 준수)
- **회사·제품·repo 실명은 전량 익명화됨** (가드 훅 + 정규식 스캔 검증, 잔존 0건). 앱="카셰어링/모빌리티 앱", 하네스="AI 개발 하네스". 실명 매핑은 **너만 안다**.
- 이 문서는 이식 가능한 **아키텍처/결정 레벨** — 시크릿·토큰·독점 비즈니스룰 없음.
- ⚠️ **면접 화면공유 시 원본 repo(실명 포함)는 절대 노출 금지.** 이 익명화 버전으로만 말하기.
- 숫자는 실측 검증됨(크리틱 spot-check). "[추정]" 표시된 지표는 그대로 "대략/추정"으로 말할 것.

## 📚 문서 지도

| # | 문서 | 용도 |
|---|------|------|
| 01 | **app-pitches** | 카셰어링 앱 "무엇을 만들었나" — 15초 3변형·1분·2분(아키/임팩트)·영어 |
| 02 | **app-full-system-design** | 앱 풀 SD 워크스루 (9프레임 + ASCII 모듈그래프/RIBs트리/데이터흐름) |
| 03 | **app-deep-dives** | 컴포넌트 3종 딥다이브 (디지털 카키 BLE · 특가딜 · 네트워킹/DTO) |
| 04 | **app-decision-defenses** | 아키텍처 결정 6종 방어 (모듈화/Clean/RIBs/ReactorKit/Rx→async/인터페이스분리) |
| 05 | **harness-what-i-built** | AI 하네스 "무엇을 만들었나" — 엘리베이터~7분 풀 워크스루·영어 |
| 06 | **harness-architecture-decisions** | 하네스 결정 6종 방어 (plugin+MCP/메모리-PR/멀티에이전트/훅가드/JIT/경계) |
| 07 | **harness-fde-ai-story** | AI/FDE 롤용 차별화 서사 (영어 2분+5분) |
| 08 | **star-lp-behavioral** | STAR/Leadership Principles 스토리 15개 + 영어 2개 |
| 09 | **probe-bank-app** | 앱 적대적 꼬리질문 20+ & 강한 방어 |
| 10 | **probe-bank-harness** | 하네스 적대적 꼬리질문 20+ & 강한 방어 |
| 11 | **cheatsheet** | 1페이지 치트시트 (엘리베이터·숫자·결정 one-liner·LP맵·top10) |
| 12 | **gaps-and-corrections** | 크리틱 근거 감사 기록 (숫자 실측 대조) |

## 🔢 꼭 외울 핵심 숫자 (실측 검증)
```
카셰어링 앱:  SPM 모듈 50 · RIBs Builder/Interactor/VC 113/111/140 ·
             disposed(by:) 2,191 · 총 커밋 6,947 · Clean+RIBs+ReactorKit
             · 응답 DTO 191개(CodingKeys 36%만 보유=silent-nil 표면)
AI 하네스:    skills 59 · agents 17 · commands 16 · claude-hooks 46(+git 6)
             · scripts 176 · 팀 박제 579 · solutions 152 · retros 58 · ADR ~16
             · 커밋 819 · tracked 1,515 · ~3.5개월 운영 · repo owner
```

## ✅ 적용된 수정 (크리틱 B1·B2)
- DTO 숫자: 전 문서 **191/CodingKeys 36%(123개 미보유 64%)** 로 통일 (195/124 오기 수정).
- claude-hooks: 전 문서 **46(+git 6)** 로 통일 (~40 과소계상 수정).

## 🧭 연습 순서 추천
1. **11 치트시트**로 전체 뼈대 스캔 → 2. **01·05 피칭** 소리내어 암송 → 3. **02·06 풀 워크스루** 화이트보드 그려보기 → 4. **04·09·10 방어/probe**로 꼬리질문 대비 → 5. **08 STAR**로 행동면접. 실전 리허설은 금요일 모의면접 슬롯.

> 다음 🏛️ 블록에서 이 뱅크를 실제로 소리내어 리허설 → 약한 답변만 골라 보강.
