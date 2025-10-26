"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropZoneLogo } from "@/components/dropzone-logo";
import { Upload, FolderOpen, ArrowRight, Clock } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <DropZoneLogo isDark={false} />
            <Button
              onClick={handleGetStarted}
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
            >
              はじめる
            </Button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              ファイル提出、<br className="sm:hidden" />もう迷わない。
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              デザイナーとクライアント間での素材提出をスムーズに。
              <br />
              Slackやメールで「流れちゃった」を、今日で終わりにしましょう。
            </p>
            <div className="pt-4">
              <Button
                onClick={handleGetStarted}
                className="bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-lg inline-flex items-center gap-2"
              >
                無料ではじめる
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 問題提起セクション */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8 text-center">
              こんな経験、ありませんか？
            </h2>
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Slackでクライアントから送られてきた素材が、メッセージに流されて見つからない
                </p>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  メールの添付ファイルが複数のスレッドに分散して、どれが最新か分からない
                </p>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  クライアントに「どこに素材を送ればいいですか？」と何度も聞かれる
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center mb-12 sm:mb-16">
            DropZoneの特徴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 特徴1 */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                シンプルな提出フォーム
              </h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                専用URLを送るだけ。クライアントは迷わずファイルを提出できます。
              </p>
            </div>

            {/* 特徴2 */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                一元管理
              </h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                全ての素材が一箇所に。もう探し回る必要はありません。
              </p>
            </div>

            {/* 特徴3 */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                提出履歴を記録
              </h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                いつ、誰が、何を提出したか。全て記録されます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gray-50">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center mb-12 sm:mb-16">
            たった3ステップで開始
          </h2>
          <div className="space-y-8 sm:space-y-10">
            {/* ステップ1 */}
            <div className="flex items-start gap-6 sm:gap-8">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  プロジェクトを作成
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  プロジェクト名と依頼者情報を入力するだけ。数秒で専用URLが発行されます。
                </p>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="flex items-start gap-6 sm:gap-8">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  URLをクライアントに共有
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  発行されたURLをクライアントに送信。あとはクライアントが素材をアップロードするのを待つだけ。
                </p>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="flex items-start gap-6 sm:gap-8">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  素材を受け取る
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  ダッシュボードで提出された素材を確認。一括ダウンロードも可能です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-500 rounded-2xl p-10 sm:p-12 lg:p-16 text-center shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              今すぐDropZoneを始めましょう
            </h2>
            <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed">
              無料で、すぐに使えます。クレジットカード不要。
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200 text-lg inline-flex items-center gap-2"
            >
              無料ではじめる
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-200 py-6 sm:py-8">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            © 2025 DropZone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
