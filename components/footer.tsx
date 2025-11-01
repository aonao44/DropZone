import Link from "next/link"
import { DropZoneLogo } from "@/components/dropzone-logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background relative z-10">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:space-y-5">
            <DropZoneLogo isDark={true} />
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              素材回収、もう催促しない。
            </p>
          </div>

          <div>
            <h3 className="mb-4 lg:mb-5 text-base lg:text-lg font-semibold">プロダクト</h3>
            <ul className="space-y-3 lg:space-y-4 text-base lg:text-lg">
              <li>
                <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  料金
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                  ダッシュボード
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 lg:mb-5 text-base lg:text-lg font-semibold">サポート</h3>
            <ul className="space-y-3 lg:space-y-4 text-base lg:text-lg">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 lg:mb-5 text-base lg:text-lg font-semibold">法的情報</h3>
            <ul className="space-y-3 lg:space-y-4 text-base lg:text-lg">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 lg:mt-16 border-t border-border pt-8 lg:pt-10 text-center text-base lg:text-lg text-muted-foreground">
          © 2025 DropZone. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
