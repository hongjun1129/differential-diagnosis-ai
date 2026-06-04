import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "흉통 감별진단 체크리스트 보조 AI",
  description: "의료진의 흉통 감별진단 사고 과정을 구조화하는 교육용 MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
