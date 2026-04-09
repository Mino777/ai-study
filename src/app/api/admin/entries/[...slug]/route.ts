import { NextRequest, NextResponse } from "next/server";
import { frontmatterSchema } from "@/lib/schema";
import { getFileFromGitHub, updateFile, deleteFile } from "@/lib/github";
import matter from "gray-matter";

// GET: 단일 엔트리 (GitHub에서 최신 + SHA)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const filePath = `content/${slug.join("/")}.mdx`;

  try {
    const { content, sha } = await getFileFromGitHub(filePath);
    const { data: frontmatter, content: body } = matter(content);
    return NextResponse.json({ frontmatter, content: body.trim(), sha });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 }
    );
  }
}

// PUT: 엔트리 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const { frontmatter, content, sha } = body;

  const result = frontmatterSchema.safeParse(frontmatter);
  if (!result.success) {
    return NextResponse.json(
      { error: "프론트매터 검증 실패", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const filePath = `content/${slug.join("/")}.mdx`;
  const mdxContent = matter.stringify(content || "", result.data);

  try {
    const updated = await updateFile(
      filePath,
      mdxContent,
      sha,
      `글 수정: ${result.data.title}`
    );
    return NextResponse.json({ ok: true, sha: updated.sha });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: 엔트리 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const { sha } = await req.json();
  const filePath = `content/${slug.join("/")}.mdx`;

  try {
    await deleteFile(filePath, sha, `글 삭제: ${slug.join("/")}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
