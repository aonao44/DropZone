import Header from "@/components/header"
import { PricingCards } from "@/components/pricing-cards"
import { PricingTable } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "料金プラン | DropZone",
  description: "DropZoneの料金プランをご確認ください。無料プランから始めて、必要に応じてアップグレードできます。",
}

export default async function PricingPage() {
  // 認証チェック - ログインしている必要がある
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in?redirect_url=/pricing")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-dot-pattern pointer-events-none opacity-20 z-[-1]"></div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-20">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm font-mono uppercase tracking-widest text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                Pricing
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-slate-50 mb-6">
              シンプルで
              <span className="block mt-2">明確な料金プラン</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              無料で始めて、ビジネスの成長に合わせてアップグレード。
              <span className="block mt-2">プレミアムプランで全機能をご利用いただけます。</span>
            </p>
          </div>

          {/* Clerk Billing Pricing Table */}
          <div className="max-w-6xl mx-auto">
            <PricingTable
              for="user"
              newSubscriptionRedirectUrl="/pricing"
              fallback={
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-400 border-r-transparent"></div>
                  <p className="mt-4 text-slate-400">料金プランを読み込み中...</p>
                </div>
              }
            />
          </div>

          {/* Detailed Pricing Cards - 詳細な料金プラン */}
          <div className="max-w-6xl mx-auto mt-16">
            <PricingCards />
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-24">
            <h2 className="text-3xl sm:text-4xl font-light text-center mb-12 text-slate-50">
              よくある質問
            </h2>
            <div className="space-y-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-colors">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  無料プランでどこまで使えますか？
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  無料プランでは3つのプロジェクトと1GBのストレージをご利用いただけます。個人の小規模プロジェクトに最適です。
                </p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-colors">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  プランはいつでも変更できますか？
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  はい、いつでもプランのアップグレードやダウングレードが可能です。変更は即座に反映されます。
                </p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-colors">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  支払い方法は何が使えますか？
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  クレジットカード（Visa、Mastercard、American Express）およびデビットカードでのお支払いが可能です。
                </p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-colors">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  解約後のデータはどうなりますか？
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  解約後30日間はデータを保持します。その間に再度サブスクリプションを開始することで、すべてのデータを復元できます。
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-24 text-center">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-3xl p-12">
              <h2 className="text-3xl sm:text-4xl font-light text-slate-50 mb-4">
                まだ迷っていますか？
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                ご不明な点がございましたら、お気軽にお問い合わせください。
                専門スタッフが丁寧にサポートいたします。
              </p>
              <a
                href="mailto:support@dropzone.example.com"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
