# Mermaid <br/> 렌더링 에러

## 문제
Gemini가 자동 생성한 MDX 엔트리의 Mermaid 다이어그램이 프로덕션에서 "Mermaid 에러"로 렌더링 실패.

## 증상
- Mermaid 코드 블록이 렌더링되지 않고 raw 코드로 표시
- 특히 rhombus `{}` 라벨 안에 `<br/>` 포함 시 파싱 에러
- `<font>`, `<b>` 등 HTML 태그도 동일 에러

## 해결

Before:
```
F -- "✅ OK" --> H{Load Secret Key <br/> (Secret Manager)};
C[<font color=red><b>?</b></font> 최종 컨텍스트];
```

After:
```
F -- "✅ OK" --> H{"Load Secret Key (Secret Manager)"};
C["❓ 최종 컨텍스트"];
```

## 근본 원인
Mermaid 파서는 rhombus `{}` 라벨 안의 `<br/>`를 HTML이 아닌 Mermaid 구문으로 해석하여 파싱 에러 발생. 대괄호 `[]` 안에서는 일부 HTML이 동작하지만, `{}` 안에서는 따옴표로 감싸지 않으면 실패.

Gemini가 Mermaid 다이어그램 생성 시 줄바꿈 목적으로 `<br/>`를 자주 삽입하는 패턴이 있음.

## 체크리스트
- [ ] Mermaid 라벨에서 `<br/>` 사용하지 않기 — 괄호 `()` 로 보충 정보 표기
- [ ] `<font>`, `<b>` 등 HTML 태그 대신 이모지 사용
- [ ] rhombus `{}` 라벨에 특수문자 포함 시 반드시 따옴표로 감싸기
- [ ] Gemini 프롬프트에 규칙 5 추가 완료 (generate-lesson.mjs)
