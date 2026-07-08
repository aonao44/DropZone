import type React from "react"
import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { jaJP } from "@clerk/localizations"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "DropZone - 素材回収、もう催促しない。",
  description:
    "クライアントはログイン不要。1つのURLで素材を集めて、OK/NGで検収まで完結する素材回収SaaS。",
  openGraph: {
    title: "DropZone - 素材回収、もう催促しない。",
    description:
      "クライアントはログイン不要。1つのURLで素材を集めて、OK/NGで検収まで完結する素材回収SaaS。",
    type: "website",
    locale: "ja_JP",
    siteName: "DropZone",
  },
  twitter: {
    card: "summary",
    title: "DropZone - 素材回収、もう催促しない。",
    description:
      "クライアントはログイン不要。1つのURLで素材を集めて、OK/NGで検収まで完結する素材回収SaaS。",
  },
}

// ダークテーマ前提のため、スクロールバー等のネイティブUIもダークに揃える
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0f172a",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="font-sans antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
