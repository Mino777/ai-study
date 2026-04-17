# /validate-ai-output — AI 생성 콘텐츠 출력 검증

AI(Gemini/Claude)가 생성한 MDX, JSON, YAML 등 콘텐츠의 4가지 반복 함정을 검증한다.
AI 과외 파이프라인 결과물, `/ingest` 출력, 또는 임의 AI 생성 콘텐츠에 적용.

> 출처: docs/solutions/ai-pipeline/ 4건 (2026-04-11 ~ 04-14) 누적 패턴

---

## 입력

검증 대상 파일 경로 또는 PR diff. 미지정 시 최근 AI 생성 파일 자동 탐지.

---

## 4 함정 검증 (순서대로)

### 함정 1: 가짜 직접 인용구

AI가 비디오/음성 소스에서 그럴듯한 인용구를 생성할 위험.

**검증 조건** (3개 이상 해당 시 HIGH RISK):
- 원본이 비디오/음성 (텍스트 전문 불가)
- 2차 소스가 풍부
- 직접 인용 (`"..."`) 사용

**탐지 방법**: 파일을 Read로 읽고, **코드블록 밖**에서 다음 패턴을 수동 확인:
- `"20자 이상 텍스트"` 형태의 직접 인용
- `라고 말했다/밝혔다/강조했다/언급했다` 귀속 표현

> grep으로는 코드블록 내 false positive 100% (dry-run 2026-04-17 확인). 반드시 파일을 읽고 수동 확인.

**대응**: 각 인용구에 대해 원본 소스에서 **정확한 문장**을 확인.
확인 불가 시 → 간접 인용으로 변환하고 `[의역]` 태그 부착.

### 함정 2: YAML frontmatter 직렬화 깨짐

한국어 + 따옴표 + 특수문자 조합에서 수동 YAML escape 실패.

```bash
# frontmatter 추출 후 파싱 테스트
node -e "const m = require('gray-matter'); const r = require('fs').readFileSync('$FILE','utf-8'); try { m(r); console.log('OK'); } catch(e) { console.error('YAML PARSE ERROR:', e.message); }"
```

**대응**: YAML 직렬화는 반드시 `js-yaml.dump()` 사용. 수동 escape 금지.

### 함정 3: 런타임 shape 불일치

AI가 생성한 JSON 응답이 예상 스키마와 다를 때.

**검증**:
- 새 필드가 추가됐으면 → 소비자(사용처) grep
- 소비자 0건 = dead code
- 기존 필드 타입 변경 → 모든 소비자에서 타입 호환 확인

```bash
# 새 export/return 필드 탐지
git diff -- $FILE | grep '^+.*\(export\|return\|interface\)'
```

### 함정 4: 한글 slug / 긴 파일명

AI가 한국어 제목을 그대로 slug로 사용 → percent-encoding → 404.

```bash
# 한글 문자가 파일명에 포함됐는지
echo "$FILE" | grep -P '[\x{AC00}-\x{D7AF}]'
# 파일명 길이
basename "$FILE" | wc -c  # 60자 초과 시 경고
```

**대응**: slug는 **영문 only**, 60자 이내. Gemini에게 영문 slug 생성 위임.

---

## 실행 흐름

1. 대상 파일 확정
2. 4 함정 순서 실행
3. 함정 1 (가짜 인용) 발견 시 — 소스 URL과 대조 요청
4. 함정 2 (YAML) 발견 시 — js-yaml로 재직렬화
5. 함정 3 (shape) 발견 시 — 소비자 목록 출력
6. 함정 4 (slug) 발견 시 — 영문 slug 제안
7. `npm run build` 최종 확인

---

## 출력 형식

```markdown
# AI 출력 검증: <파일 목록>

| 함정 | 위험도 | 발견 | 비고 |
|---|---|---|---|
| 1. 가짜 인용구 | HIGH/LOW | N건 | [상세] |
| 2. YAML 깨짐 | - | OK/FAIL | [상세] |
| 3. shape 불일치 | - | N건 dead code | [상세] |
| 4. 한글 slug | - | OK/발견 | [상세] |

다음 액션: [수정 적용 / 소스 확인 대기 / clean]
```
