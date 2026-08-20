import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jbb-ruby.vercel.app"),
  title: "JBB",
  description: "50종 픽셀 공 파이터와 회전 아이템이 같은 시드로 같은 난투를 만드는 결정론적 물리 배틀 게임.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "JBB",
    description: "50종 픽셀 공 파이터가 회전 아이템으로 맞붙는 시드 고정 물리 난투.",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1536,
        height: 1024,
        alt: "JBB Pixel Physics Brawler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JBB",
    description: "50종 픽셀 공 파이터가 회전 아이템으로 맞붙는 시드 고정 물리 난투.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
