# npm audit devDependency 취약점이 CI를 차단하는 문제

## 문제

`npm audit --audit-level=high`가 devDependency 체인의 취약점을 잡아 CI가 실패.
프로덕션에 포함되지 않는 개발 도구의 취약점이 배포를 차단.

## 증상

- CI `npm audit --audit-level=high` exit code 1
- 취약점이 전부 devDependency 트리 내 (예: `@xenova/transformers` → `protobufjs`)
- `npm audit fix --force`는 breaking change 요구

## 해결

### Before

```yaml
- run: npm audit --audit-level=high
```

### After

```yaml
- run: npm audit --audit-level=high --omit=dev
```

## 근본 원인

`npm audit`는 기본적으로 모든 의존성(prod + dev)을 검사한다. devDependency의 transitive dependency에 취약점이 있으면 프로덕션과 무관해도 CI가 실패한다. `--omit=dev`로 프로덕션 의존성만 검사하면 해결.

## 체크리스트

- [ ] 취약점이 devDependency 체인인지 확인 (`npm audit` 출력에서 경로 추적)
- [ ] `npm audit fix`로 non-breaking fix 먼저 시도
- [ ] devDep 전용이면 CI에 `--omit=dev` 추가
- [ ] prod dependency 취약점이면 반드시 패치 (omit 금지)
