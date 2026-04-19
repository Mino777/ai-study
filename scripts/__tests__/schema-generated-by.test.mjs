/**
 * generated_by 필드 검증 테스트
 *
 * Hermes/Gemini 출처 추적용 optional 필드가 zod 스키마에서 정상 동작하는지 확인.
 */

import { describe, it, expect } from "vitest";
import { frontmatterSchema } from "../../src/lib/schema.ts";

const BASE_FRONTMATTER = {
  title: "테스트 엔트리",
  category: "agents",
  date: "2026-04-19",
  tags: ["test"],
  confidence: 2,
  connections: [],
  status: "complete",
  description: "테스트용 엔트리",
  type: "entry",
};

describe("frontmatterSchema generated_by", () => {
  it("generated_by 없이도 valid (기존 엔트리 호환)", () => {
    const result = frontmatterSchema.safeParse(BASE_FRONTMATTER);
    expect(result.success).toBe(true);
  });

  it("generated_by: 'hermes' → valid", () => {
    const result = frontmatterSchema.safeParse({ ...BASE_FRONTMATTER, generated_by: "hermes" });
    expect(result.success).toBe(true);
    expect(result.data.generated_by).toBe("hermes");
  });

  it("generated_by: 'gemini' → valid", () => {
    const result = frontmatterSchema.safeParse({ ...BASE_FRONTMATTER, generated_by: "gemini" });
    expect(result.success).toBe(true);
    expect(result.data.generated_by).toBe("gemini");
  });

  it("generated_by: 123 (잘못된 타입) → invalid", () => {
    const result = frontmatterSchema.safeParse({ ...BASE_FRONTMATTER, generated_by: 123 });
    expect(result.success).toBe(false);
  });
});
