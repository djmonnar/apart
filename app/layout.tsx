import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: {
    default: "진주역 스카이시티프라디움 입주민 복지몰",
    template: "%s | 진주역 스카이시티프라디움 입주민 복지몰",
  },
  description:
    "우리 단지 입주민만 누릴 수 있는 특별한 제휴 혜택. 진주역 스카이시티프라디움 입주민 전용 프리미엄 복지몰 · 단지라운지.",
  keywords: [
    "진주역 스카이시티프라디움",
    "입주민 복지몰",
    "단지라운지",
    "아파트 제휴 혜택",
  ],
};

export const viewport: Viewport = {
  themeColor: "#785A38",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-cream font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
