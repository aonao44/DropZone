'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PricingPlan {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
  ctaLink: string
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "無料プラン",
    price: "¥0",
    description: "個人や小規模プロジェクトに最適",
    features: [
      "プロジェクト数: 3個まで",
      "ストレージ: 1GB",
      "ファイルアップロード: 無制限",
      "基本サポート",
      "セキュアなファイル共有",
    ],
    cta: "無料で始める",
    ctaLink: "/sign-up",
  },
  {
    id: "pro",
    name: "プロプラン",
    price: "¥1,980",
    description: "プロフェッショナル向けの充実機能",
    features: [
      "プロジェクト数: 無制限",
      "ストレージ: 100GB",
      "ファイルアップロード: 無制限",
      "優先サポート",
      "セキュアなファイル共有",
      "カスタムブランディング",
      "高度な分析機能",
      "チームコラボレーション",
    ],
    popular: true,
    cta: "14日間無料トライアル",
    ctaLink: "/sign-up?plan=pro",
  },
]

export function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {plans.map((plan) => {
        const isSelected = selectedPlan === plan.id
        const isOtherSelected = selectedPlan && selectedPlan !== plan.id

        return (
          <div
            key={plan.name}
            onClick={() => setSelectedPlan(isSelected ? null : plan.id)}
            className={`
              relative rounded-3xl p-8 transition-all duration-500 cursor-pointer
              ${
                isSelected
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600 shadow-2xl shadow-slate-700/30 scale-105 md:scale-110 z-20"
                  : isOtherSelected
                  ? "bg-slate-800/30 border border-slate-700/30 scale-95 opacity-60"
                  : "bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 hover:scale-102"
              }
            `}
          >
            {plan.popular && !isOtherSelected && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  人気No.1
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-slate-50 mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-light text-slate-50">
                  {plan.price}
                </span>
                {plan.price !== "¥0" && (
                  <span className="text-slate-400 text-lg">/月</span>
                )}
              </div>
              {plan.price !== "¥0" && (
                <p className="text-xs text-slate-500">年間契約で2ヶ月分お得</p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className={`
                    w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300
                    ${isSelected ? "text-cyan-400" : "text-slate-400"}
                  `} />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={plan.ctaLink} className="block" onClick={(e) => e.stopPropagation()}>
              <Button
                className={`
                  w-full py-6 text-base font-medium rounded-xl transition-all duration-300
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-100"
                  }
                `}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
