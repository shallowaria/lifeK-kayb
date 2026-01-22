import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "人生K线图 - 八字命理可视化分析",
  description: "基于八字命理和AI的人生运势K线图生成工具，用数据可视化展现您的人生起伏与命运走向",
  keywords: "八字, 命理, K线图, AI分析, 运势, 大运, 流年",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
