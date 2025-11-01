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
        <section className="w-full py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-7xl text-center flex flex-col items-center px-4 sm:px-6 lg:px-8">
            <h1 className="mb-8 lg:mb-10 text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight whitespace-nowrap">
              ファイル提出、もう迷わない。
            </h1>
            <p className="mb-12 lg:mb-14 text-xl md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed text-pretty max-w-4xl">
              デザイナーとクライアント間での素材提出をスムーズに。
              <br />
              Slackやメールで「流れちゃった」を、今日で終わりにしましょう。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gradient-primary text-xl lg:text-2xl font-semibold glow-blue-sm hover:glow-blue px-10 py-7 lg:px-12 lg:py-8 rounded-xl"
                asChild
              >
                <Link href="/dashboard">無料ではじめる</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="w-full py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-14 lg:mb-16 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center">こんな経験、ありませんか？</h2>
            <div className="space-y-6 lg:space-y-8 mx-auto max-w-4xl">
              <div className="flex items-start gap-4 lg:gap-5">
                <div className="mt-2 h-3 w-3 lg:h-4 lg:w-4 rounded-full bg-primary shrink-0"></div>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  Slackやクライアントから送られてきた素材が、メッセージに流されて見つからない
                </p>
              </div>
              <div className="flex items-start gap-4 lg:gap-5">
                <div className="mt-2 h-3 w-3 lg:h-4 lg:w-4 rounded-full bg-primary shrink-0"></div>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  メールの添付ファイルが複数のスレッドに分散して、どれが最新かがわからない
                </p>
              </div>
              <div className="flex items-start gap-4 lg:gap-5">
                <div className="mt-2 h-3 w-3 lg:h-4 lg:w-4 rounded-full bg-primary shrink-0"></div>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  クライアントに「どこに素材を送ればいいですか？」と聞かれる都度応答
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 lg:mb-20 text-center">
              <h2 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">DropZoneの特徴</h2>
            </div>

            <div className="grid gap-8 lg:gap-10 lg:grid-cols-3">
              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-10 lg:p-12 text-center">
                  <div className="mb-6 flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                    <CheckCircle2 className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                  </div>
                  <h3 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-semibold">シンプルな提出フォーム</h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                    専用URLを送るだけ。クライアントは迷わずファイルを提出できます。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-10 lg:p-12 text-center">
                  <div className="mb-6 flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-xl bg-accent/10 mx-auto">
                    <Clock className="h-8 w-8 lg:h-10 lg:w-10 text-accent" />
                  </div>
                  <h3 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-semibold">一元管理</h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                    全ての素材が一箇所に。もう探し回る必要はありません。
                  </p>
                </CardContent>
              </Card>

              <Card className="border-glow bg-card transition-all duration-200 hover:glow-blue-sm">
                <CardContent className="p-10 lg:p-12 text-center">
                  <div className="mb-6 flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-xl bg-success/10 mx-auto">
                    <TrendingDown className="h-8 w-8 lg:h-10 lg:w-10 text-success" />
                  </div>
                  <h3 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-semibold">提出履歴を記録</h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                    いつ、誰が、何を提出したか。全て記録されます。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="w-full py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 lg:mb-20 text-center">
              <h2 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">たった3ステップで開始</h2>
            </div>

            <div className="space-y-16 lg:space-y-20 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center gap-6 lg:gap-8">
                <div className="flex h-16 w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-3xl lg:text-4xl">
                  1
                </div>
                <div className="max-w-3xl">
                  <h3 className="mb-4 lg:mb-5 text-2xl md:text-3xl lg:text-4xl font-semibold">プロジェクトを作成</h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                    プロジェクト名と必須項目を入力するだけ。数秒で専用URLが発行されます。
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-6 lg:gap-8">
                <div className="flex h-16 w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-3xl lg:text-4xl">
                  2
                </div>
                <div className="max-w-3xl">
                  <h3 className="mb-4 lg:mb-5 text-2xl md:text-3xl lg:text-4xl font-semibold">URLをクライアントに共有</h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                    発行されたURLをクライアントに送信。あとはクライアントが素材をアップロードするのを待つだけ。
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-6 lg:gap-8">
                <div className="flex h-16 w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-3xl lg:text-4xl">
                  3
                </div>
                <div className="max-w-3xl">
                  <h3 className="mb-4 lg:mb-5 text-2xl md:text-3xl lg:text-4xl font-semibold">素材を受け取る</h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                    ダッシュボードで提出された素材を確認。一括ダウンロードも可能です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 glow-blue-sm">
                <CardContent className="p-10 md:p-14 lg:p-20 text-center">
                  <h2 className="mb-8 lg:mb-10 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">今すぐDropZoneを始めましょう</h2>
                  <p className="mb-12 lg:mb-14 text-xl md:text-2xl lg:text-3xl text-muted-foreground">
                    無料で、すぐに使えます。クレジットカード不要。
                  </p>
                  <Button
                    size="lg"
                    className="gradient-primary text-xl lg:text-2xl font-semibold glow-blue-sm hover:glow-blue px-10 py-7 lg:px-12 lg:py-8 rounded-xl"
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
