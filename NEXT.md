# NEXT — 다음 세션 계획 문서

> **다음 세션의 AI 에이전트가 가장 먼저 읽을 계획 문서.**
> 세션 시작 시 3 파일 로드 순서(CLAUDE.md → SPEC.md → ai-agent-start-here) *다음*에 이 문서를 읽고 작업 재개.
>
> **운영 원칙 (2026-04-16~)**: 이 문서는 *append-only* 가 아니라 **세션 경계에서 교체** 한다. 완료된 큐 즉시 제거 · 갱신 로그 최근 1개만 유지 · 재사용 학습은 `docs/retros/` · `docs/solutions/` · memory 로 승격.

---

## 🕒 작성 시점

- **작성 일시**: 2026-04-19 (Session 16f — Hermes-First 스택 CEO/Eng Review + 인프라 준비)
- **작성 주체**: Claude (Session 16f)
- **이유**: compound 완료 후 세션 핸드오프

---

## 📸 현재 상태 스냅샷

### ai-study Wiki
- **엔트리 수**: 144
- **카테고리**: 13 (방법론 4 + 시스템 3 + 평가&인프라 2 + 응용 4)
- **슬래시 커맨드**: 13개 (/message에 poll 서브커맨드 추가)
- **Git 상태**: main clean, origin/main 동기
- **CI 상태**: 빌드 통과, 테스트 37/37

### Hermes-First 스택 진행 상태
| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1-4 | 로컬 Hermes 설치 + Telegram GW + delegate_task 테스트 | **완료** (로컬, Gemini 2.5 Flash) |
| Phase 5 | ai-study 코드 인프라 (generated_by, /message poll, SOUL.md, Compiled Truth) | **완료** |
| Phase 6 | 2주 운영 + Go/No-Go (5/3 판단) | **진행 중** |

### 신규 인프라 (이번 세션)
| 인프라 | 파일 | 상태 |
|--------|------|------|
| generated_by 출처 추적 | `src/lib/schema.ts` | 완료 (optional field) |
| /message poll | `.claude/commands/message.md` | 정의됨, Hermes 연동 후 실전 |
| SOUL.md | `docs/hermes/SOUL.md` + `~/.hermes/SOUL.md` | 완료 (로컬 복사됨) |
| Compiled Truth | `docs/solutions/` | 포맷 도입, 예시 1건 적용 |
| CEO Plan | `docs/designs/hermes-first-stack.md` | 승격 완료 |

---

## 이번 스프린트 KPI

| 지표 | baseline | target | direction | actual |
|------|----------|--------|-----------|--------|
| 총 엔트리 수 | 143 | 148 | higher | 144 |
| Hermes 로컬 설치 | 0 | 1 | higher | 1 |
| /message poll 실전 사용 | 0 | 1 | higher | ? |

---

## 🎯 다음 작업 큐 (우선순위 순)

### 🔴 High

1. ~~**Hermes 설치 (Phase 1-4)**~~ **완료** (로컬 + Gemini 2.5 Flash + Telegram)

2. **Hermes 2주 운영** (Phase 6, ~5/3까지)
   - 매일 Telegram으로 1+ 리서치 작업 위임
   - 최소 10개 작업, 다양한 유형 (research + markdown + backlink)
   - Go/No-Go Decision Tree: `docs/designs/hermes-first-stack.md` 참조
   - 예상 크기: S (일일 운영)

3. **긱뉴스 스카우트 결과 확인**
   - 22:00 KST 자동 실행 → Actions 탭에서 결과 확인
   - 예상 크기: S

3. **[워커] AI API 프록시 3단계 방어선** (tarosaju → moneyflow → aidy-server)
   - 예상 크기: M (프로젝트당)

### 🟡 Medium

4. **기존 Gemini 엔트리에 generated_by: gemini 소급 적용**
   - 일괄 스크립트 작성 → 기존 엔트리 점진 적용
   - 예상 크기: S

5. **docs/solutions/ Compiled Truth 일괄 적용**
   - N>=3 카테고리(workflow 7, mdx 6, github-actions 4, ai-pipeline 4) 대상
   - 예상 크기: S

6. **JIT 검색 성과 검증** — totalQueries 100 도달 시 적중률 분석

### 🟢 Low

7. **Hermes 2주 운영 후 GBrain CEO Plan** (TODOS P2)
8. **OpenClaw 검토** (TODOS P3)
9. **인덱싱 자동화 (pre-commit 또는 CI)**

---

## ⚠️ 블로커 / 대기 사항

### VPS 필요
- Hermes Phase 1-4는 VPS 없이 진행 불가
- Hetzner CX22 (~$4/mo) 권장

### 다른 세션 주의
- moneyflow: conductor worktree `la-paz` 존재 — 만지지 말 것
- tarosaju: `feat/ai-api-3layer-defense` 브랜치 작업 중

---

## 📋 다음 세션 시작 체크리스트 (18분)

### Phase 1: 필수 파일 로드 (5분)
- [ ] `CLAUDE.md` 읽기
- [ ] `SPEC.md` 읽기
- [ ] `content/harness-engineering/ai-agent-start-here.mdx` 읽기

### Phase 2: 이 NEXT.md 읽기 (3분)
- [ ] 현재 상태 스냅샷 · 큐 · 블로커 확인
- [ ] 가장 임팩트 큰 작업 1개 선택

### Phase 3: Git 동기화 (5분)
- [ ] `rtk git fetch` (ai-study)
- [ ] `/projects-sync` 실행 (메시지 큐 확인 포함)

### Phase 4: 최근 박제 훑기 (3분)
- [ ] `node scripts/graph-query.mjs suggest`
- [ ] `node scripts/scan-promotions.mjs`

### Phase 5: 작업 시작 (2분 내)
- [ ] VPS 세팅은 이 세션에서 진행 (Phase 1-4)
- [ ] 작업 완료 후 `/compound`
- [ ] 세션 종료 직전 이 NEXT.md 교체

---

## 📝 부록: Hermes VPS 세팅 가이드

```bash
# 1. Hetzner CX22 VPS 생성 후 SSH 접속
ssh root@<VPS_IP>

# 2. 초기 세팅
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs ufw
ufw allow OpenSSH && ufw enable

# 3. Hermes 설치 (스크립트 확인 후 실행)
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh -o install.sh
less install.sh  # 내용 확인
bash install.sh

# 4. 모델 + 도구 설정
hermes model        # Claude Sonnet 선택
hermes tools        # 도구 구성
hermes doctor       # MUST PASS

# 5. Telegram Gateway
hermes gateway setup  # Telegram 선택 + BotFather 토큰 입력

# 6. 보안
echo "ANTHROPIC_API_KEY=sk-..." > ~/.env && chmod 600 ~/.env
```

---

## 💾 이 NEXT.md 의 운영 규칙

- **세션 경계에서 교체** (append 금지)
- **완료된 큐 항목은 즉시 제거**
- **갱신 로그는 최근 1개만**
- **재사용 학습** → memory · solutions · retros 로 승격

---

## 📜 최근 갱신

### 2026-04-19 (Session 16f+g — Hermes-First 스택 풀 세팅)
- **완료**: CEO Review + Eng Review + 코드 인프라 (generated_by, /message poll, SOUL.md, Compiled Truth)
- **완료**: Hermes 로컬 설치 (Gemini 2.5 Flash) + Telegram Gateway pairing
- **완료**: 첫 delegate_task 테스트 (android-ai 빈 주제 탐색, 10초)
- **진행 중**: Phase 6 2주 운영 (~5/3 Go/No-Go)
