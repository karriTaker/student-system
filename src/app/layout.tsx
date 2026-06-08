import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "中文学习 | Chinese Learning",
  description: "中文教学网站 - 为越南学生设计的线上练习平台",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
