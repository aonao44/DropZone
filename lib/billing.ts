import { auth } from '@clerk/nextjs/server'
import { getPlanLimits, type PlanLimits } from './plan-limits'

/**
 * ユーザーがプレミアムプランに加入しているかチェック
 * Clerkダッシュボードで作成したプラン名（slug）を使用
 *
 * 🚨 一時的に無効化: Vercelデプロイ時に課金機能を無効化しています
 * すべてのユーザーにプレミアム機能を提供します
 */
export async function checkPremiumAccess(): Promise<boolean> {
  // const { has } = await auth()
  // return has ? has({ plan: 'premium' }) : false

  // 🚨 一時的に全ユーザーにプレミアムアクセスを付与
  return true
}

/**
 * ログイン中ユーザーのプラン上限を取得
 * 課金を再有効化する際は checkPremiumAccess() の1箇所を戻せば全体に反映される
 */
export async function getEffectiveLimits(): Promise<PlanLimits> {
  return getPlanLimits(await checkPremiumAccess())
}

/**
 * プロジェクト所有者のプラン上限を取得（提出APIなど非ログイン経路用）
 * 提出者ではなく「プロジェクトの所有者」のプランで上限が決まる
 *
 * 🚨 課金無効化中は全員にプレミアム上限を適用
 * TODO: 課金再有効化時は ownerUserId から Clerk Backend API で所有者のプランを判定する
 */
export async function getProjectOwnerLimits(_ownerUserId: string | null): Promise<PlanLimits> {
  return getPlanLimits(true)
}

/**
 * 特定の機能へのアクセス権をチェック
 *
 * 🚨 一時的に無効化: Vercelデプロイ時に課金機能を無効化しています
 */
export async function checkFeatureAccess(_featureName: string): Promise<boolean> {
  // const { has } = await auth()
  // return has ? has({ feature: _featureName }) : false

  // 🚨 一時的に全ユーザーに全機能へのアクセスを付与
  return true
}

/**
 * プレミアム機能のゲート（アクセス制御）
 * プレミアムプランでない場合、false を返す
 *
 * 🚨 一時的に無効化: Vercelデプロイ時に課金機能を無効化しています
 */
export async function requirePremium(): Promise<{ hasPremium: boolean; userId: string | null }> {
  const { userId } = await auth()

  if (!userId) {
    return { hasPremium: false, userId: null }
  }

  // const hasPremium = has ? has({ plan: 'premium' }) : false
  // 🚨 一時的に全ユーザーにプレミアムアクセスを付与
  const hasPremium = true

  return { hasPremium, userId }
}
