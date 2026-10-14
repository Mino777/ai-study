import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";

// singleTilde: false — 기본값(true)이면 "000~039 + 000~029" 처럼 같은 문단에 물결표가
// 두 번 나올 때 그 사이가 <del> 취소선으로 렌더된다. 정식 취소선 `~~x~~` 은 그대로 동작.
export const remarkPlugins: PluggableList = [[remarkGfm, { singleTilde: false }]];
