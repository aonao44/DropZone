import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { CheckCircle2, Clock, TrendingDown, Zap, Shield, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedBackground />

      <Header />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-4 w-4" />
              素材回収を自動化
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
              素材回収、
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">もう催促しない。</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground leading-relaxed text-pretty md:text-xl">
              デザイン制作案件の素材提出を、スマートに管理。
              <br />
              クライアントへの催促メールは過去のものに。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gradient-primary text-base font-semibold glow-blue-sm hover:glow-blue"
                asChild
              >
                <Link href="/dashboard">はじめる</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
                <Link href="#demo">デモを見る</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">なぜDropZoneなのか</h2>
              <p className="text-lg text-muted-foreground">制作フローを劇的に改善する3つの価値</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">漏れゼロ</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    必須項目の設定とバリデーションで、提出漏れを防止。推奨形式・サイズも事前に指定できます。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">催促ゼロ</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    自動リマインド機能で、期限前に通知。あなたが催促メールを送る必要はありません。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <TrendingDown className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">管理コスト最小</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    提出状況を一目で確認。不足素材の追跡も簡単。プロジェクト管理の時間を大幅削減。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="container py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">セキュアな素材管理</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      アップロードされた素材は暗号化して保存。アクセス権限も細かく設定可能です。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">進捗の可視化</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      プロジェクトごとの提出率をリアルタイムで確認。チーム全体の状況を把握できます。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-border/40 bg-surface/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="mx-auto mb-4 h-16 w-16 text-primary/40" />
                      <p className="text-sm text-muted-foreground">デモプレビュー</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-3xl">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 glow-blue-sm">
              <CardContent className="p-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight">今すぐ始めましょう</h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  無料プランで全機能をお試しいただけます。クレジットカード不要。
                </p>
                <Button
                  size="lg"
                  className="gradient-primary text-base font-semibold glow-blue-sm hover:glow-blue"
                  asChild
                >
                  <Link href="/dashboard">無料で始める</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">よくある質問</h2>
            <div className="space-y-6">
              <Card className="border-glow bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">無料プランでどこまで使えますか？</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    無料プランでは3プロジェクトまで作成でき、1GBのストレージをご利用いただけます。基本的な機能は全て使用可能です。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">クライアントもアカウント登録が必要ですか？</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    いいえ、必要ありません。提出用URLを共有するだけで、クライアントは登録なしで素材をアップロードできます。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">アップロードできるファイル形式は？</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    画像（PNG、JPG、SVG）、動画（MP4、MOV）、ドキュメント（PDF）など、一般的な形式に対応しています。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
