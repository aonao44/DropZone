import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

export default async function Header() {
  const { userId } = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">DropZone</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-base text-muted-foreground transition-colors hover:text-foreground">
              料金
            </Link>
            {userId && (
              <Link href="/dashboard" className="text-base text-muted-foreground transition-colors hover:text-foreground">
                ダッシュボード
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {userId ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
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
