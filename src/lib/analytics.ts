/**
 * Vercel Analytics 커스텀 이벤트 wrapper.
 * Pro plan에서 커스텀 이벤트가 250K/월까지 추적됨.
 *
 * 사용법: 각 컴포넌트에서 import { trackEvent } from '@/lib/analytics'; trackEvent('xxx', { key: value });
 *
 * 이벤트 목록 (추가 시 이 주석 + CLAUDE.md 동기화):
 * - search_select: 검색 결과 클릭 (query, slug, category)
 * - quiz_answer: 퀴즈 답변 제출 (slug, questionIndex, correct)
 * - graph_node_click: 지식 그래프 노드 클릭 (nodeId, category)
 * - category_expand: 사이드바 카테고리 펼침 (category, group)
 * - entry_view: 위키 엔트리 페이지뷰 (slug, category, confidence)
 * - theme_toggle: 다크/라이트 테마 전환 (theme)
 */

import { track } from "@vercel/analytics";

export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
) {
  track(name, properties);
}
