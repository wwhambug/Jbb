import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JBB Seed Arena",
  description: "같은 시드는 같은 전투를 만든다. 50종 공 파이터의 결정론적 자동 전투 아레나.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
