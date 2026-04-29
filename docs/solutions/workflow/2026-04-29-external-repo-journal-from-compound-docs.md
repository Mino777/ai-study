# 외부 레포 작업을 위키 엔트리로 박제하기 — compound 3-source 패턴

## 문제

워커 레포(예: 사내 iOS 앱)에서 2일 스프린트 18커밋을 작업했다. 이 내용을 ai-study 위키에 저널 엔트리로 남기고 싶은데, git log만 읽으면 커밋 메시지는 간결해서 맥락·측정값·교훈이 빠진다.

## 해결 — 3-source 저널화

**입력 3가지를 순서대로 읽는다:**

1. `git log --all --oneline --since="N days ago"` — 커밋 목록 + 타임라인
2. `git show <hash>` — 핵심 커밋의 diff + 커밋 메시지 body
3. `docs/retros/YYYY-MM-DD.md` — 스프린트 회고 (잘된 것/아쉬운 것/측정값)
4. `docs/solutions/architecture/YYYY-MM-DD-slug.md` — 문제→해결 솔루션 문서

(3, 4는 compound가 만들어둔 문서. compound를 잘 써둔 레포일수록 저널 품질이 높아진다.)

```bash
# 1. 커밋 목록
git -C ~/Develop/target-repo log --all --oneline --since="3 days ago" --format="%H %ai %s"

# 2. 핵심 커밋 상세
git -C ~/Develop/target-repo show <hash> 2>/dev/null | head -80

# 3. 회고 + 솔루션 읽기
ls ~/Develop/target-repo/docs/retros/ | sort | tail -5
cat ~/Develop/target-repo/docs/retros/YYYY-MM-DD.md
cat ~/Develop/target-repo/docs/solutions/architecture/YYYY-MM-DD-*.md
```

## Before / After

```
Before (git log만):
- 측정값 없음 ("22s → 7s" 같은 수치 누락)
- 교훈 없음 ("worktree 폴백 사고" 같은 함정 누락)
- 맥락 없음 (왜 이 병목을 골랐는지)
- 품질: ★★

After (3-source):
- 측정값 표 포함
- 교훈/사고 섹션 포함
- 5병목 진단 + 해결책 맥락 포함
- 품질: ★★★★
```

## 주의사항

- **회사 프로젝트명 sanitize 필수**: 공개 위키에는 사내 브랜드명 노출 금지. "iOS 앱", "사내 iOS 프로젝트"로 치환.
- **compound 없는 레포**: retro/solutions 없으면 git show로 커밋 body를 깊게 읽어야 한다. 커밋 메시지가 상세할수록 저널 품질이 올라간다.
- **경로 확인 먼저**: `~/Develop/target-repo`가 실제 경로인지 먼저 확인. find로 탐색하면 시간 낭비.

## 체크리스트

- [ ] 레포 경로 확인 (`find ~/Develop -maxdepth 2 -name "*.xcworkspace"` 등)
- [ ] `git log --since="3 days ago"` 로 대상 커밋 범위 파악
- [ ] compound 문서 존재 여부 확인 (`docs/retros/`, `docs/solutions/`)
- [ ] 공개 금지 키워드 포함 여부 확인 (`gma-ios`, `GreenCar` 등)
- [ ] 빌드 통과 후 push

## 근본 원인

compound를 두 레포(워커 + 허브)에 모두 적용하면 지식 이동 비용이 거의 0이 된다. 워커 레포의 compound 문서 = 허브 위키의 저널 원재료.
