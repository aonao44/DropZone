import Link from "next/link"
import Image from "next/image"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function Header() {
  const { userId } = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="w-full flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/dropzone-logo.png"
              alt="DropZone"
              width={180}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {/* 🚨 一時的に無効化: Vercelデプロイ時に課金機能を無効化 */}
            {/* <Link href="/pricing" className="text-base text-muted-foreground transition-colors hover:text-foreground">
              料金
            </Link> */}
            {userId && (
              <Link href="/dashboard" className="text-base text-muted-foreground transition-colors hover:text-foreground">
                ダッシュボード
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* お試し期間バッジ - 常に表示 */}
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent text-white border-white/20 hover:bg-white/10 text-sm font-medium"
          >
            🎉 お試し期間実施中！
          </Button>

          {userId ? (
            <>
              <Link href="/dashboard/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-base">
                  <Plus className="mr-2 h-4 w-4" />
                  新規プロジェクト
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9"
                  }
                }}
              />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-base">
                  ログイン
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-base">
                  新規登録
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
