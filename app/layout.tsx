import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JBB",
  description: "50종 공 파이터를 직접 편성하고 같은 시드로 같은 전투를 재현하는 결정론적 배틀 게임.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
