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
      "プロジェクト: 3 件まで",
      "ファイル数: 5 件まで",
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
            className="relative rounded-2xl p-8 shadow-sm"
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none'
            }}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-light text-gray-900">
                  {plan.price}
                </span>
                {plan.price !== "$0" && (
                  <span className="text-base text-gray-600"> /month</span>
                )}
              </div>

              <p className="text-sm text-gray-600">
                {plan.description}
              </p>
            </div>

            <div className="mb-6 h-px bg-gray-300"></div>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="text-sm leading-relaxed text-gray-700">
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
