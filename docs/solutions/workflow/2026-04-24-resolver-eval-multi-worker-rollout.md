# Resolver Eval을 다수 워커에 rollout하는 체계적 패턴

- **날짜**: 2026-04-24
- **카테고리**: workflow
- **관련 저널**: Journal 028, Journal 029
- **재발 가능성**: HIGH — 새 워커 추가 시마다 반복

## 문제

AI 하네스 허브에서 resolver-eval(Skill routing 품질 측정)을 구축하고 나면, 동일한 도구를 워커 N개에 이식해야 한다. 각 워커마다 수동으로 파일을 복사하고 CLAUDE.md를 수정하면 실수·누락·비일관성이 발생한다.

## 증상

- 워커마다 routing 섹션 품질이 달라 AI가 다른 말투에 다르게 반응
- 일부 워커는 eval 도구 자체가 없어 회귀를 감지 못함
- 新 워커 추가 시 "어떻게 이식하지?" 를 매번 처음부터 고민

## 해결 (before/after)

**Before**: 워커마다 CLAUDE.md를 수동으로 살펴보고 즉흥적으로 routing 보강. eval 없음.

**After**: 아래 8단계 체크리스트로 ~7분/워커 소요. baseline → Lever 적용 → 재측정 순서 고정.

### 8단계 체크리스트

```bash
# 0. 허브 상태 확인
npm run check:skills && npm run eval:resolver   # 허브 100% 기준점 확인

# 1. worktree 생성 (Journal 003 squash-merge 트랩 회피)
cd /path/to/worker
git fetch origin
git worktree add -b skillify-resolver-eval /tmp/<worker>-skillify-resolver-eval origin/main

# 2. 파일 3개 복사
cp <허브>/scripts/resolver-eval.mjs <wt>/scripts/          # tokenizer 포함
cp <허브 or 직전 워커>/data/resolver-eval-cases.json <wt>/data/  # 템플릿 재사용
cp <허브>/.github/workflows/weekly-resolver-eval.yml <wt>/.github/workflows/
# 비-Node 프로젝트: .github/workflows/ 없으면 mkdir -p 선행
# 비-Node 프로젝트: scripts/ 없으면 mkdir -p 선행

# 3. package.json script 추가 (Node 프로젝트만)
#   "eval:resolver": "node scripts/resolver-eval.mjs"
# 비-Node(Swift/Kotlin/Python): 생략 OK — resolver-eval.mjs는 zero-deps

# 4. cases.json description 수정 (repo명 변경)
# "description": "Skillify Step 7 — <WORKER> resolver routing eval golden set."

# 5. baseline 측정 (Lever 적용 전 반드시)
cd <wt> && node scripts/resolver-eval.mjs

# 6. routing 누락 항목 확인
grep -E "invoke (autoceo|compound|wt-branch)" <wt>/CLAUDE.md
# 없으면 추가 (3줄)

# 7. Lever 2 적용 — 6개 공통 rule에 한국어 꼬리 덧붙이기
# office-hours: + "아이디어 브레인스토밍 빌드 가치 고민"
# investigate:  + "버그 에러 문제 원인 크래시 디버깅"
# ship:         + "배포 푸시 릴리스 진행"
# qa:           + "QA 테스트"
# review:       + "코드 리뷰 PR 리뷰 diff 리뷰 검토"
# document-release: + "릴리스 후 문서 업데이트 문서화 머지 후 README 반영"
# autoceo:      + "멀티에이전트 풀 자동 개발 루프 자동화"
# compound:     + "스프린트 정리 컴파운드 회고"

# 8. 재측정 → 90%+ 확인 후 commit/merge/push
node scripts/resolver-eval.mjs
git add -A && git commit -m "skillify: resolver-eval 이식 (X% → 100%)"
cd <parent> && git merge --ff-only skillify-resolver-eval
git worktree remove /tmp/<worker>-skillify-resolver-eval
git branch -D skillify-resolver-eval
git push origin main
```

## 근본 원인

1. **영문 trigger만 있을 때 한국어 intent 전혀 매칭 안 됨** — tokenizer가 조사/어미 제거를 안 하면 "배포로" = "배포" 불일치.
2. **autoceo/compound/wt-branch routing 누락** — 허브에서 나중에 추가된 스킬들이 워커 CLAUDE.md에 전파 안 됨.
3. **compound↔autoceo 토큰 충돌** — "스프린트" 단어가 두 rule 설명에 모두 있으면 score 순서가 뒤집힘. autoceo 설명에서 "스프린트" 제거로 해소.

## 예상 발생 이슈 (Journal 029 실측)

| 워커 유형 | 이슈 | 대처 |
|---|---|---|
| 비-Node(Swift/Kotlin) | package.json 없음 | 3번 스텝 생략, `node scripts/` 직접 |
| 비-Node | `.github/workflows/` 없음 | `mkdir -p` 선행 |
| 워커 허브(architect급) | compound↔autoceo 충돌 가능 | autoceo에서 "스프린트" 제거 |
| 모든 워커 | wt-branch routing 누락 가능 | grep 후 없으면 추가 |
| pre-push hook | false-positive 1회 | 재시도 1회, 반복 시 훅 로그 조사 |

## 체크리스트 (다음에 새 워커 추가 시)

- [ ] 허브 baseline(100%) 확인 후 이식 시작
- [ ] baseline 측정은 Lever 적용 전 (추정 금지)
- [ ] weekly-resolver-eval.yml threshold 80% (초기), 90%+(안정화 후)
- [ ] push 후 GitHub Actions 탭에서 workflow 트리거 확인
