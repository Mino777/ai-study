import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AI 전화영어 — Hidden",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
