# Harness Template — 신규 프로젝트 이식용 공통 하네스

> **사용법**: 이 폴더를 새 프로젝트 루트에 복사하고 `setup.sh`를 실행하면 끝.

## 구조

```
harness-template/
├── setup.sh                    ← 이식 스크립트 (프로젝트명 입력 → 자동 세팅)
├── CLAUDE.md                   ← 최소 템플릿 (60줄 이하)
├── .claude/
│   ├── settings.json           ← deny-first + 타입체크 Hook + GC Hook
│   ├── hooks/
│   │   ├── build-gate.sh       ← PreToolUse: git commit 전 빌드 검증
│   │   ├── type-check.sh       ← PostToolUse: Edit 후 타입 체크 (exit 2 자동수정)
│   │   ├── gc-drift.sh         ← SessionStart: 하네스 드리프트 탐지
│   │   └── secret-guard.sh     ← PreToolUse: 시크릿/금지어 패턴 차단
│   ├── rules/
│   │   └── harness-meta.md     ← .claude/ 편집 시 자동 로딩 규칙
│   └── commands/
│       ├── review.md           ← 2-Stage PR 리뷰
│       ├── compound.md         ← 스프린트 회고 + 문서화
│       └── wt-branch.md        ← worktree 안전 브랜치
├── scripts/__tests__/
│   └── harness-fitness.test.mjs ← 하네스 적합성 기계적 검증 (vitest)
└── README.md                   ← 이 파일
```

## 이식 방법

```bash
# 1. 복사
cp -r harness-template/.claude <새 프로젝트>/
cp harness-template/CLAUDE.md <새 프로젝트>/CLAUDE.md
cp -r harness-template/scripts <새 프로젝트>/

# 2. 세팅 (프로젝트 경로 자동 치환)
cd <새 프로젝트>
bash .claude/hooks/setup.sh
```

또는 자동화:
```bash
bash harness-template/setup.sh /path/to/new-project
```

## 포함된 것 (UNIVERSAL)

| 구성 요소 | 출처 | 역할 |
|-----------|------|------|
| deny 규칙 7개 | Claude Code arxiv | .env, secrets, rm -rf, force-push, hard-reset |
| build-gate Hook | Fowler Computational Sensor | commit 전 빌드 자동 검증 |
| type-check Hook | Claude Code (exit 2) | Edit 후 타입체크, 실패 시 자동수정 루프 |
| gc-drift Hook | OpenAI Codex GC 패턴 | 하네스 건강 상태 스캔 |
| secret-guard Hook | Claude Code Deny-First | 시크릿/금지어 차단 |
| harness-meta Rule | Fowler Guide/Sensor | .claude/ 수정 시 규칙 자동 로딩 |
| /review Command | Anthropic 3-Agent | Few-shot calibration 리뷰 |
| /compound Command | Compound Engineering | 회고 + 솔루션 + CHANGELOG |
| /wt-branch Command | Squash Merge 안전 | worktree 격리 브랜치 |
| Fitness Test 6개 | Fowler Computational Sensor | 기계적 하네스 검증 |

## 포함되지 않은 것 (프로젝트별 추가)

- MCP 서버 설정 (프로젝트 도구에 따라 다름)
- 프로젝트 고유 commands (validate-mdx, projects-sync 등)
- 프로젝트 고유 rules (content-mdx.md 등)
- CI/CD 설정
