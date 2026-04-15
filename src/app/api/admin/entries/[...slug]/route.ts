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
    console.error("[Admin] 엔트리 조회 실패:", (err as Error).message);
    return NextResponse.json(
      { error: "엔트리를 찾을 수 없습니다." },
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

  // 100KB 크기 제한
  if (content && typeof content === "string" && content.length > 100_000) {
    return NextResponse.json(
      { error: "콘텐츠가 너무 큽니다 (최대 100KB)." },
      { status: 413 }
    );
  }

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
    console.error("[Admin] 엔트리 수정 실패:", (err as Error).message);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
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
    console.error("[Admin] 엔트리 삭제 실패:", (err as Error).message);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
