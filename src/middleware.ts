import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login은 인증 불필요
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("admin-token")?.value;
  if (!token || !(await verifyToken(token))) {
    // API 요청이면 401
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }
    // 페이지 요청이면 로그인으로 리다이렉트
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
