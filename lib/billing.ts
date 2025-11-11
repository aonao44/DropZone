import { auth } from '@clerk/nextjs/server'

/**
 * ユーザーがプレミアムプランに加入しているかチェック
 * Clerkダッシュボードで作成したプラン名（slug）を使用
 */
export async function checkPremiumAccess(): Promise<boolean> {
  const { has } = await auth()

  // Clerkダッシュボードで作成したプランのslugが "premium" の場合
  return has ? has({ plan: 'premium' }) : false
}

/**
 * 特定の機能へのアクセス権をチェック
 */
export async function checkFeatureAccess(featureName: string): Promise<boolean> {
  const { has } = await auth()

  return has ? has({ feature: featureName }) : false
}

/**
 * プレミアム機能のゲート（アクセス制御）
 * プレミアムプランでない場合、false を返す
 */
export async function requirePremium(): Promise<{ hasPremium: boolean; userId: string | null }> {
  const { userId, has } = await auth()

  if (!userId) {
    return { hasPremium: false, userId: null }
  }

  const hasPremium = has ? has({ plan: 'premium' }) : false

  return { hasPremium, userId }
}
