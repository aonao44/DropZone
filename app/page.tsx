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
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl text-center flex flex-col items-center px-4 sm:px-6 lg:px-8">
            <h1 className="mb-6 md:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              ファイル提出、もう迷わない。
            </h1>
            <p className="mb-8 md:mb-10 lg:mb-12 text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-3xl">
              デザイナーとクライアント間での素材提出をスムーズに。
              <br />
              Slackやメールで「流れちゃった」を、今日で終わりにしましょう。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gradient-primary text-base md:text-lg lg:text-xl font-semibold glow-blue-sm hover:glow-blue px-8 py-6 md:px-10 md:py-7 rounded-xl"
                asChild
              >
                <Link href="/dashboard">無料ではじめる</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 md:mb-12 lg:mb-16 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-center">こんな経験、ありませんか？</h2>
            <div className="space-y-4 md:space-y-6 mx-auto max-w-4xl">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="mt-1.5 md:mt-2 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary shrink-0"></div>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Slackやクライアントから送られてきた素材が、メッセージに流されて見つからない
                </p>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="mt-1.5 md:mt-2 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary shrink-0"></div>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  メールの添付ファイルが複数のスレッドに分散して、どれが最新かがわからない
                </p>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="mt-1.5 md:mt-2 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary shrink-0"></div>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  クライアントに「どこに素材を送ればいいですか？」と聞かれる都度応答
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight">DropZoneの特徴</h2>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="mb-4 md:mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                    <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold">シンプルな提出フォーム</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    専用URLを送るだけ。クライアントは迷わずファイルを提出できます。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="mb-4 md:mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-accent/10 mx-auto">
                    <Clock className="h-7 w-7 md:h-8 md:w-8 text-accent" />
                  </div>
                  <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold">一元管理</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    全ての素材が一箇所に。もう探し回る必要はありません。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="mb-4 md:mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-success/10 mx-auto">
                    <TrendingDown className="h-7 w-7 md:h-8 md:w-8 text-success" />
                  </div>
                  <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold">提出履歴を記録</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    いつ、誰が、何を提出したか。全て記録されます。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight">たった3ステップで開始</h2>
            </div>

            <div className="space-y-12 md:space-y-16 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-2xl md:text-3xl">
                  1
                </div>
                <div className="max-w-2xl">
                  <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold">プロジェクトを作成</h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    プロジェクト名と必須項目を入力するだけ。数秒で専用URLが発行されます。
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-2xl md:text-3xl">
                  2
                </div>
                <div className="max-w-2xl">
                  <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold">URLをクライアントに共有</h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    発行されたURLをクライアントに送信。あとはクライアントが素材をアップロードするのを待つだけ。
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-2xl md:text-3xl">
                  3
                </div>
                <div className="max-w-2xl">
                  <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold">素材を受け取る</h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    ダッシュボードで提出された素材を確認。一括ダウンロードも可能です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 glow-blue-sm">
                <CardContent className="p-8 md:p-12 lg:p-16 text-center">
                  <h2 className="mb-6 md:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight">今すぐDropZoneを始めましょう</h2>
                  <p className="mb-8 md:mb-10 text-base sm:text-lg md:text-xl text-muted-foreground">
                    無料で、すぐに使えます。クレジットカード不要。
                  </p>
                  <Button
                    size="lg"
                    className="gradient-primary text-base md:text-lg lg:text-xl font-semibold glow-blue-sm hover:glow-blue px-8 py-6 md:px-10 md:py-7 rounded-xl"
                    asChild
                  >
                    <Link href="/dashboard">無料ではじめる</Link>
                  </Button>
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
