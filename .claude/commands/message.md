# /message — 허브↔워커 파일 기반 메시지 큐

perpetual-engine의 MessageQueue 패턴을 이식한 것.
허브(ai-study)에서 워커(moneyflow/tarosaju)로 비동기 메시지를 보내거나, 워커가 남긴 메시지를 읽는다.

## 호출 방식

```
/message send <project> "<내용>"    # 허브 → 워커 directive 전송
/message read                       # 미읽은 메시지 전체 읽기
/message read <project>             # 특정 워커 메시지만 읽기
/message list                       # 전체 메시지 목록
```

## 메시지 저장 구조

```
messages/
├── hub-to-moneyflow-1713500000000.json
├── hub-to-tarosaju-1713500100000.json
├── moneyflow-to-hub-1713500200000.json
└── tarosaju-to-hub-1713500300000.json
```

### 메시지 포맷

```json
{
  "id": "msg-20260419-001",
  "from": "hub",
  "to": "moneyflow",
  "type": "directive",
  "content": "tokenomics 레버 적용 전 ccusage 베이스라인 측정 필수",
  "read": false,
  "created_at": "2026-04-19T15:30:00+09:00"
}
```

### 메시지 타입

| type | 용도 | 발신 |
|------|------|------|
| `directive` | 허브가 워커에 작업 지시/주의사항 전달 | hub → worker |
| `info` | 일반 정보 전달 | 양방향 |
| `request` | 도움 요청/확인 요청 | 양방향 |
| `review_request` | 크로스 세션 리뷰 요청 | 양방향 |

## /message send 실행

1. `messages/` 디렉토리에 JSON 파일 생성
2. 파일명: `{from}-to-{to}-{timestamp}.json`
3. 워커 프로젝트에도 같은 메시지를 `messages/` 디렉토리에 복사 (symlink 아닌 실제 복사)
   - 워커 경로: `/Users/jominho/Develop/mino-{project}/messages/`
   - 워커 디렉토리가 없으면 생성
4. 커밋하지 않음 — 메시지는 로컬 파일로만 존재 (git 추적은 선택)

## /message read 실행

1. `messages/` 디렉토리에서 `read: false`인 메시지를 필터
2. 시간순으로 표시
3. 읽은 메시지의 `read` 필드를 `true`로 업데이트
4. `/projects-sync` 실행 시에도 자동으로 미읽은 메시지를 표시

## /projects-sync 연동

`/projects-sync` 실행 시 Step 5 다음에 추가:

### 6. 메시지 큐 확인

```
양쪽 프로젝트의 messages/ 디렉토리에서 미읽은 메시지 확인.
```

리포트에 포함:

```
📨 메시지 큐
  hub → moneyflow: 미읽은 1건 (directive: "ccusage 베이스라인 측정 필수")
  moneyflow → hub: 미읽은 0건
  hub → tarosaju: 미읽은 0건
  tarosaju → hub: 미읽은 0건
```

## 금지 사항

1. **메시지로 코드 전송** — content는 짧은 텍스트만. 파일 참조가 필요하면 경로를 적는다
2. **자동 실행 명령** — 메시지는 정보 전달용. 워커가 읽고 판단해서 실행한다
3. **git push로 메시지 동기화** — 로컬 파일 복사만. git은 선택적

## 성공 조건

- 허브 세션에서 보낸 directive를 워커 세션이 다음 시작 시 확인 가능
- `/projects-sync` 리포트에 미읽은 메시지가 자동 표시
- 인프라 의존성 제로 (파일시스템만)
