import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { MobileNav } from "@/components/mobile-nav";
import { MagneticMode } from "@/components/magnetic-mode";
import "./globals.css";

const SITE_URL = "https://ai-study-wheat.vercel.app";

export const metadata: Metadata = {
  title: { default: "Mino's AI Study Wiki", template: "%s — Mino's AI Study Wiki" },
  description:
    "AI 하네스 엔지니어링 학습 위키 — 프롬프트 엔지니어링, RAG, 에이전트, 파인튜닝",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Mino's AI Study Wiki",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Font preconnect */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* RSS */}
        <link rel="alternate" type="application/rss+xml" title="Mino's AI Study Wiki" href="/feed.xml" />
        {/* Satoshi — display font */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,900&display=swap"
          rel="stylesheet"
        />
        {/* Pretendard — body font (Korean optimized) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* JetBrains Mono — code font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased pb-14 lg:pb-0">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <MobileNav />
          <MagneticMode />
        </ThemeProvider>
      </body>
    </html>
  );
}
