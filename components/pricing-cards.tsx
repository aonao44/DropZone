'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
    price: "$0",
    description: "Always free",
    features: [
      "提出フォーム発行",
      "ファイルアップロード（1 ファイル 8MB）",
      "自動バリデーション",
      "ダッシュボード",
      "個別ファイルダウンロード",
      // 🚨 一時的に変更: お試し期間用に制限を緩和（旧: 3件、5件）
      "プロジェクト: 10 件まで",
      "ファイル数: 20 件まで",
    ],
    cta: "無料で始める",
    ctaLink: "/sign-up",
  },
  {
    id: "premium",
    name: "premium プラン",
    price: "$10",
    description: "Only billed monthly",
    features: [
      "提出フォーム発行",
      "ファイルアップロード（1 ファイル 8MB）",
      "自動バリデーション",
      "ダッシュボード",
      "個別ファイルダウンロード",
      "プロジェクト: 20 件まで",
      "ファイル数: 50 件まで",
    ],
    popular: true,
    cta: "Subscribe",
    ctaLink: "/sign-up?plan=pro",
  },
]

export function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => {
        return (
          <div
            key={plan.name}
            className="relative rounded-2xl p-6 shadow-sm"
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none'
            }}
          >
            <div className="mb-5">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-light text-gray-900">
                  {plan.price}
                </span>
                {plan.price !== "$0" && (
                  <span className="text-sm text-gray-600"> /month</span>
                )}
              </div>

              <p className="text-xs text-gray-600">
                {plan.description}
              </p>
            </div>

            <div className="mb-5 h-px bg-gray-300"></div>

            <ul className="space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="text-xs leading-relaxed text-gray-700">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
