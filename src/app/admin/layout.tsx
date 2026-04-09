import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — AI Study Wiki",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="font-display text-lg font-bold text-text"
            >
              Admin
            </Link>
            <Link
              href="/"
              className="text-sm text-muted hover:text-text transition-colors"
            >
              사이트로 돌아가기
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieStore.set("admin-token", "", { maxAge: 0, path: "/" });
      }}
    >
      <button
        type="submit"
        className="text-sm text-muted hover:text-error transition-colors"
      >
        로그아웃
      </button>
    </form>
  );
}
