# Edge Runtime에서 Timing-Safe 문자열 비교

**날짜**: 2026-04-15
**카테고리**: workflow (보안 패턴)
**재발 가능성**: 높음 — Next.js Edge Middleware에서 인증 구현 시 반드시 부딪힘

## 문제

`src/lib/auth.ts`에서 `crypto.timingSafeEqual` (Node.js built-in)을 사용하려 했으나, Edge Middleware가 이 파일을 import하면서 빌드 실패.

## 증상

```
Error: Module "crypto" is not available in Edge Runtime
```

또한 모듈 최상위에서 `const SECRET = requireEnv("ADMIN_SECRET")` 처럼 환경변수를 즉시 평가하면:
```
Error: 환경변수 ADMIN_SECRET이(가) 설정되지 않았거나...
```
빌드 시점에 throw 발생 (Edge Middleware가 import 시 모든 top-level 코드 실행).

## 해결

### Before (실패)
```typescript
import { timingSafeEqual } from "crypto"; // ❌ Edge 불가
const ADMIN_SECRET = requireEnv("ADMIN_SECRET"); // ❌ 빌드 시점 throw
```

### After (성공)
```typescript
// 1. Web Crypto API로 timing-safe 비교 (Edge 호환)
async function safeCompare(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode("compare-key"),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  const viewA = new Uint8Array(sigA);
  const viewB = new Uint8Array(sigB);
  let diff = 0;
  for (let i = 0; i < viewA.length; i++) diff |= viewA[i] ^ viewB[i];
  return diff === 0;
}

// 2. 환경변수는 함수로 감싸서 lazy evaluation
function getAdminSecret(): string {
  return getEnv("ADMIN_SECRET", 16);
}
```

## 근본 원인

- Next.js Edge Middleware는 V8 Isolate 위에서 실행 → Node.js 전용 모듈 (`crypto`, `fs`, `path` 등) 사용 불가
- `crypto.subtle` (Web Crypto API)는 Edge에서 사용 가능
- 모듈 최상위 코드는 빌드 시점에 실행됨 → 환경변수 검증은 **함수 호출 시점**으로 지연 필수

## 체크리스트

- [ ] Edge Middleware가 import하는 파일에서 Node.js built-in 사용하지 않기
- [ ] 환경변수 검증은 lazy function으로 감싸기 (top-level const 금지)
- [ ] `Buffer.from()` 대신 `new Uint8Array()` + `TextEncoder` 사용
- [ ] `timingSafeEqual` 대신 HMAC sign + XOR 비교 패턴
