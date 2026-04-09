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
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
