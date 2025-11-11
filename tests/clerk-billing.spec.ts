import { test, expect } from '@playwright/test'

test.describe('Clerk Billing Integration', () => {
  test('pricing page should require authentication', async ({ page }) => {
    // 未認証でpricingページにアクセス
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')

    // サインインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/sign-in/)
  })

  test('pricing page should display PricingTable when authenticated', async ({ page }) => {
    // この部分は実際の認証フローが必要
    // テスト環境でClerkの認証をバイパスする設定が必要
    test.skip(true, 'Requires Clerk authentication setup')
  })

  test('project view page should show premium feature section', async ({ page }) => {
    // プロジェクト詳細ページへのアクセス（認証が必要）
    // この部分は実際のプロジェクトslugが必要
    test.skip(true, 'Requires authenticated session and project data')
  })
})

test.describe('Premium Feature Visibility', () => {
  test('should show premium feature section in project view', async ({ page }) => {
    // スクリーンショットのみ取得（手動確認用）
    test.skip(true, 'Manual verification required - see screenshot in docs')

    // 実装されたコンポーネントの構造を検証するためのマークアップ確認
    // - プレミアム機能セクションが存在すること
    // - プレミアムユーザー: ZIPダウンロードボタン
    // - 無料ユーザー: ロック表示 + プレミアムプランへのリンク
  })
})
