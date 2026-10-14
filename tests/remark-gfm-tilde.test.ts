import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remarkPlugins } from "@/lib/remark-plugins";

const render = (md: string) =>
  String(
    unified().use(remarkParse).use(remarkPlugins).use(remarkRehype).use(rehypeStringify).processSync(md),
  );

describe("위키 렌더러 GFM 물결표 처리", () => {
  it("같은 줄의 범위 표기 두 개가 취소선이 되지 않는다", () => {
    expect(render("Harness (000~039) + iOS (000~029)")).not.toContain("<del>");
  });

  it("문단 안 줄바꿈을 건너서도 취소선이 되지 않는다", () => {
    expect(render("1~3 단계\n그리고 5~7 단계")).not.toContain("<del>");
  });

  it("정식 취소선 ~~x~~ 은 유지된다", () => {
    expect(render("~~폐기된 안~~")).toContain("<del>폐기된 안</del>");
  });
});
