import { NextRequest, NextResponse } from "next/server";
import { getManifest } from "@/lib/content";
import { frontmatterSchema } from "@/lib/schema";
import { createFile } from "@/lib/github";
import matter from "gray-matter";

// GET: 전체 엔트리 목록
export async function GET() {
  const manifest = getManifest();
  return NextResponse.json(manifest.entries);
}

// POST: 새 엔트리 생성
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { frontmatter, content } = body;

  // 100KB 크기 제한
  if (content && typeof content === "string" && content.length > 100_000) {
    return NextResponse.json(
      { error: "콘텐츠가 너무 큽니다 (최대 100KB)." },
      { status: 413 }
    );
  }

  // Validate frontmatter
  const result = frontmatterSchema.safeParse(frontmatter);
  if (!result.success) {
    return NextResponse.json(
      { error: "프론트매터 검증 실패", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const fm = result.data;
  const slug = fm.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const filePath = `content/${fm.category}/${slug}.mdx`;
  const mdxContent = matter.stringify(content || "", fm);

  try {
    await createFile(filePath, mdxContent, `글 추가: ${fm.title}`);
    return NextResponse.json({ ok: true, slug: `${fm.category}/${slug}` });
  } catch (err) {
    console.error("[Admin] 엔트리 생성 실패:", (err as Error).message);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
