import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "영양노트", template: "%s · 영양노트" },
  description: "음식 영양성분을 관리하고 하루 식단을 기록하는 영양학 사이트",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-stone-900">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-white">🥗</span>
              영양노트
            </Link>
            <Nav />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
          영양성분은 100g 기준 대략값이며, 의학적 조언을 대신하지 않습니다.
        </footer>
      </body>
    </html>
  );
}
