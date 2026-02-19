import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "你离自由还有多远？| 北京提前退休计算器",
  description:
    "3分钟算清辞职成本，看看你能否提前实现财务自由。基于2024年北京最新社保政策，支持弹性退休、医保测算、4050政策。",
}

export const viewport: Viewport = {
  themeColor: "#3b6ae0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  )
}
