# Bot 댓글이 issue_comment 워크플로우를 오트리거

## 문제
auto-lesson-geeknews 워크플로우가 이슈를 클로즈하면서 남긴 bot 댓글이 generate-on-pick 워크플로우를 트리거하여 중복 PR 생성.

## 증상
- 이슈 클로즈 후 예상치 못한 "오늘의 학습" PR 2건 (#56, #57) 자동 생성
- bot(github-actions)이 남긴 댓글을 사람 댓글로 착각

## 해결

Before:
```yaml
if: contains(github.event.issue.title, '오늘의 학습 주제를 골라주세요') && !github.event.issue.pull_request
```

After:
```yaml
if: >-
  contains(github.event.issue.title, '오늘의 학습 주제를 골라주세요')
  && !github.event.issue.pull_request
  && github.event.comment.user.type != 'Bot'
```

## 근본 원인
`issue_comment` 이벤트는 bot 댓글도 트리거한다. GitHub Actions의 `github-actions[bot]`이 남긴 댓글의 `user.type`은 `'Bot'`이므로 이를 필터링해야 한다.

## 체크리스트
- [ ] `issue_comment` 트리거 워크플로우에서 bot 댓글 필터 추가
- [ ] 워크플로우 간 댓글 기반 체인 설계 시 오트리거 가능성 사전 점검
