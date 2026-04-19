---
title: "Mermaid subgraph/node ID 충돌 — 런타임 에러의 진짜 근본 원인"
date: 2026-04-19
category: mdx
tags: [mermaid, subgraph, node-id, collision, runtime-error]
---

# Mermaid subgraph/node ID 충돌 — 런타임 에러의 진짜 근본 원인

## 문제

Mermaid 다이어그램에서 `<br/>` 제거 + 콜론 따옴표 처리 후에도 "Mermaid 에러" 표시 지속.

## 증상

- 빌드 통과, 브라우저에서만 "Mermaid 에러" 빨간 텍스트
- `<br/>`도 콜론도 없는데 여전히 에러

## 해결

**Before (에러):**
```mermaid
subgraph VM ["ViewModel Layer"]
  VM_call --> VM[ChatViewModel]
end
```

**After (정상):**
```mermaid
subgraph VMLayer ["ViewModel Layer"]
  VM_call --> ChatVM[ChatViewModel]
end
```

subgraph ID `VM`과 노드 ID `VM`이 충돌. subgraph ID를 `VMLayer`로, 노드 ID를 `ChatVM`으로 변경.

## 근본 원인

Mermaid 파서가 같은 이름을 subgraph과 노드 양쪽에서 발견하면 어느 쪽인지 결정 못함 → 런타임 파싱 실패.
빌드(rehypeMermaid)에서는 문법 에러로 잡히지 않아 배포까지 통과.

## 체크리스트

- [ ] subgraph ID와 동일한 노드 ID가 없는지 확인
- [ ] subgraph ID는 `XxxLayer`, `XxxGroup` 등 접미사로 구분
- [ ] `mermaid-fix.mjs`가 빌드 시 자동 감지 (error 출력)
