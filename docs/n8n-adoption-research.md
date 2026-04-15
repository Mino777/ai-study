# n8n 도입 리서치 — Mino's 3-Project Ecosystem

> **작성일**: 2026-04-15
> **상태**: 리서치 완료, 실행 대기
> **목적**: ai-study(허브) + moneyflow + tarosaju 3개 프로젝트에 n8n 적용 가능성 분석

---

## 1. n8n 핵심 — GitHub Actions와 뭐가 다른가

| 비교 | GitHub Actions | n8n |
|------|---------------|-----|
| **UI** | YAML 편집 | 비주얼 노드 에디터 (드래그&드롭) |
| **트리거** | Git 이벤트 중심 (push, PR, cron) | Webhook, cron, DB 변경, 400+ 앱 이벤트 |
| **디버깅** | 로그 스크롤링 | **노드별 input/output 클릭 즉시 확인** |
| **AI 통합** | 스크립트 직접 작성 | LangChain 네이티브 빌트인 노드 |
| **상태** | Stateless | Wait 노드로 인간 승인 대기, 워크플로 간 데이터 전달 |
| **에러** | `continue-on-error`, 수동 retry | Error Trigger 노드, 노드별 retry, Error Workflow |
| **비용** | 프라이빗 2000분/월 | Self-hosted 무료, 무제한 실행 |

**핵심**: 둘은 경쟁이 아니라 **보완**. CI/CD = GitHub Actions 유지, AI 오케스트레이션/모니터링 = n8n 추가.

---

## 2. n8n AI 노드 — 가장 주목할 부분

### 빌트인 AI Agent 타입 (6종)
1. **Conversational Agent** — 대화형
2. **ReAct Agent** — 추론 + 행동 루프
3. **OpenAI Functions Agent** — Function Calling
4. **Plan and Execute Agent** — 다단계 계획 + 실행
5. **SQL Agent** — 자연어 → SQL
6. **Tools Agent** — 범용 도구 호출

### 지원 LLM Provider
- **Chat Models**: OpenAI, **Anthropic Claude**, **Google Gemini**, Mistral, DeepSeek, Groq, Ollama(로컬)
- **Embeddings**: OpenAI, Google, HuggingFace, Ollama, AWS Bedrock
- **Vector Store**: Pinecone, Qdrant, PGVector, **Supabase**, Redis 등

### Chain 타입
- Basic LLM Chain / Q&A Chain (RAG) / Summarization / Information Extractor / Text Classifier / Sentiment Analysis

### 우리 스택과의 매핑

| 현재 | n8n으로 |
|------|--------|
| `scripts/generate-lesson.mjs` Gemini 직접 호출 | AI Agent 노드 + Gemini Chat Model 연결 |
| 에러 시 Actions 로그 디버깅 | 노드 클릭 → input/output 즉시 확인 |
| 프롬프트 변경 = 코드 수정 + 커밋 | UI에서 수정 → 즉시 테스트 |
| retry = 수동 재실행 | 노드별 retry 설정 + Error Workflow |

---

## 3. 배포 옵션 & 비용

### Self-Hosted (Docker) — 추천

```bash
docker run -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

**최소 사양**: 1 vCPU, 1GB RAM, 10GB Disk (AI 워크플로 시 4GB RAM 권장)

| 옵션 | 월 비용 | 비고 |
|------|---------|------|
| **로컬 Mac Docker** | 무료 | 개발/테스트용 |
| **Oracle Cloud Free** | 무료 | 4 OCPU, 24GB RAM — 충분 |
| **Hetzner CX22** | ~$4.5 | 2 vCPU, 4GB RAM |
| **Fly.io / Railway** | ~$5-10 | 관리 편의성 |

### n8n Cloud

| Plan | 월 가격 | 실행 수 |
|------|---------|---------|
| Starter | ~$20 | ~2,500 |
| Pro | ~$50 | ~10,000 |

**Solo dev 추천**: Self-hosted Docker. 무료 + 무제한 실행.

---

## 4. 구체적 워크플로 아이디어 (7개)

### 4-1. AI 과외 파이프라인 강화 — ROI 최고

**현재**: `daily-lesson.yml` → Gemini → MDX → PR

**n8n 개선**:
```
Schedule (09:00 KST)
  → GitHub: content-manifest.json 읽기
  → Code: 지식 그래프 분석 (빈 카테고리, dangling, low confidence)
  → AI Agent (Gemini): 주제 3개 추천
  → IF: 자동 선택 vs 사용자 입력 대기
    → [자동] AI Agent: MDX 생성
      → Code: frontmatter zod validation
      → IF: 통과?
        → [Yes] GitHub: PR 생성
        → [No] Error Workflow → 알림 + AI 재생성 retry
    → [수동] Wait: GitHub Issue 댓글 대기 (webhook)
      → AI Agent: 선택된 주제로 생성 → (이하 동일)
```

**핵심 가치**: 프롬프트 이터레이션을 UI에서 즉시 테스트. validation 실패 시 자동 재시도.

### 4-2. Hub-Worker Inbound PR 자동 분류

**현재**: 수동 `/curate-inbound`

**n8n**:
```
GitHub Trigger (PR created, label "inbound")
  → GitHub: diff 읽기
  → AI Agent (Claude): 카테고리 분류 + confidence + 박제 가치 판단
  → Switch:
    → [High] GitHub: approve + auto-merge
    → [Needs review] Slack 알림
    → [Low] GitHub: "needs-discussion" label + 사유 코멘트
```

### 4-3. 비용 추적 & 알림

```
Daily (23:00)
  → HTTP: ccusage 데이터 수집
  → Code: 프로젝트별 집계 (ai-study Gemini + moneyflow 13 agents + tarosaju Haiku)
  → IF: 예산 초과?
    → [Yes] Slack: "moneyflow 오늘 $X (예산의 Z%)"
  → Google Sheets: 일별 누적

Weekly (일요일):
  → Sheets → AI Agent: 트렌드 분석 + 절감 제안
  → Slack: 주간 비용 리포트
```

### 4-4. Quality Monitoring (LLM-as-a-Judge)

```
Webhook (각 프로젝트에서 Judge 결과 POST)
  → Supabase: 점수 저장
  → IF: 점수 < 임계값?
    → Slack: "moneyflow agent-X 품질 하락 (3.2 → 2.1)"

Weekly:
  → Supabase: 트렌드 쿼리
  → AI Agent: 분석 + 개선 제안
  → Slack: 주간 품질 리포트
```

### 4-5. Content Freshness Monitoring

```
Weekly:
  → GitHub: content-manifest.json
  → Code: confidence 1-2 오래된 엔트리 + 30일+ 미갱신 + dangling connections
  → AI Agent: 우선순위 정렬 + 업데이트 제안
  → GitHub Issue: "Content Freshness Report" 자동 생성
```

### 4-6. Cross-Project Health Dashboard

```
Daily:
  → [Parallel] GitHub API × 3 (ai-study, moneyflow, tarosaju)
  → Merge: 빌드 상태, CI 실패율, 미해결 이슈, 최근 활동
  → Code: 건강 점수 계산
  → IF: 이상?
    → Slack 알림
  → Google Sheets: 일별 기록
```

### 4-7. 주간 자동 회고 (Compound 확장)

```
Weekly (일요일 21:00):
  → [Parallel]
    → GitHub API: 커밋/PR 통계
    → Sheets: 비용 데이터
    → Supabase: 품질 점수
    → GitHub: manifest (학습 진도)
  → AI Agent (Gemini):
    → 주간 회고 생성
    → 다음 주 추천 작업
    → 스트릭 상태 + 동기부여
  → Slack: 리포트 전송
```

### 추가 아이디어

| 워크플로 | 설명 |
|---------|------|
| **PR Auto-Review** | PR → AI가 코드 리뷰 코멘트 자동 작성 |
| **학습 알림 봇** | 스트릭 끊길 위험 → 저녁 알림 |
| **외부 콘텐츠 모니터** | RSS/Twitter → AI 필터 → 학습 큐 추가 |
| **Quiz 복습 알림** | SM-2 스케줄 기반 복습 푸시 |
| **Compound 자동화** | push → CHANGELOG diff → 회고 초안 자동 생성 |

---

## 5. n8n vs 대안

| | n8n | Temporal/Inngest | Make/Zapier |
|---|---|---|---|
| **접근법** | 비주얼 + 코드 하이브리드 | 코드 퍼스트 (SDK) | 노코드 |
| **AI 통합** | LangChain 네이티브 | 직접 구현 | HTTP 호출만 |
| **비용** | Self-hosted 무료 | 복잡한 가격 | Zapier $20/월 750 tasks |
| **커스터마이징** | JS/Python 자유 실행 | 완전 자유 | 제한적 |
| **학습곡선** | 낮음 | 높음 | 매우 낮음 |
| **Solo dev 적합** | **최적** | 과잉 | 비쌈 + 제한적 |

**n8n이 Sweet Spot인 이유**:
1. 개발자 + 비주얼 디버깅 → "code when you need, visual when you want"
2. AI 워크플로가 핵심 → LangChain 네이티브
3. 비용 민감 (Solo dev) → Self-hosted 무료
4. 3 프로젝트 오케스트레이션 → webhook + 크로스 프로젝트 워크플로

---

## 6. 우리 스택 관련 n8n 통합

| 서비스 | n8n 지원 | 용도 |
|--------|---------|------|
| GitHub | Action + Trigger | PR/Issue/Webhook |
| Vercel | Action | 배포 트리거/모니터링 |
| Supabase | Action + Vector Store | DB + RAG |
| Anthropic Claude | Chat Model | AI Agent/Chain |
| Google Gemini | Chat Model | 콘텐츠 생성 |
| Slack/Discord | Action + Trigger | 알림 |
| Google Sheets | Action | 메트릭 저장 |
| PostgreSQL | Action | 데이터 |

---

## 7. 주의사항 & Gotchas

### 제한사항
- **CI/CD 대체 불가** — 빌드/테스트/배포는 GitHub Actions 유지
- **버전 관리** — 워크플로 JSON은 YAML만큼 diff-friendly하지 않음
- **Fair-code 라이선스** — 상업적 재배포 제한 (Solo dev에겐 무관)

### Solo Dev 유지보수
- Self-hosted: Docker 업데이트, 백업, SSL 관리 필요
- 해결: Watchtower(자동 업데이트) + 크론 백업으로 최소화
- 초기에는 **로컬 Mac Docker**로 시작 → 안정화 후 VPS 이전

### 보안
- Credentials이 n8n DB에 암호화 저장 — DB 접근 시 노출 위험
- Webhook URL은 인증 없이 호출 가능 → Header auth 또는 IP 제한 필요
- Self-hosted 시 방화벽/VPN 뒤 배치 권장

### 스케일링
- SQLite: Solo dev 규모 충분 (~100 워크플로, ~10,000 실행/일)
- PostgreSQL: 나중에 필요하면 이전

---

## 8. 도입 로드맵

### Phase 1 — 로컬 탐색 (0원, 1주)
```bash
docker run -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```
- AI 과외 파이프라인 1개를 n8n으로 재현
- GitHub Actions 버전과 체감 비교

### Phase 2 — 보조 도구 추가 (0원, 2-4주)
- GitHub Actions: CI/CD 유지
- n8n: 비용 모니터링 + 품질 알림 + 주간 리포트 추가
- 로컬 Docker 유지

### Phase 3 — VPS 이전 (월 $5, 필요시)
- 24시간 webhook 수신 필요 시 Hetzner/Oracle Cloud
- PostgreSQL + Watchtower

### Phase 4 — 확장 (필요시)
- Inbound PR 자동 분류
- Cross-project health dashboard
- Compound 자동화

---

## 가장 먼저 해볼 것

> 로컬 Docker로 n8n 띄우고, `generate-lesson` 스크립트를 n8n 워크플로로 재현.
> 이 하나만 해봐도 n8n의 가치를 체감할 수 있다.
