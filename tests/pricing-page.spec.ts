import { test, expect } from '@playwright/test'

test.describe('Pricing Page', () => {
  test('should display only Free and Pro plans', async ({ page }) => {
    await page.goto('/pricing')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check page title and header
    await expect(page.locator('h1')).toContainText('シンプルで')
    await expect(page.locator('h1')).toContainText('明確な料金プラン')

    // Check that exactly 2 pricing cards are displayed
    const pricingCards = page.locator('div[class*="rounded-3xl"][class*="cursor-pointer"]')
    await expect(pricingCards).toHaveCount(2)

    // Check Free plan exists
    await expect(page.getByRole('heading', { name: '無料プラン', exact: true })).toBeVisible()
    await expect(page.getByText('¥0')).toBeVisible()
    await expect(page.getByRole('button', { name: '無料で始める' })).toBeVisible()

    // Check Pro plan exists
    await expect(page.getByRole('heading', { name: 'プロプラン', exact: true })).toBeVisible()
    await expect(page.getByText('¥1,980')).toBeVisible()
    await expect(page.getByRole('button', { name: '14日間無料トライアル' })).toBeVisible()
    await expect(page.getByText('人気No.1')).toBeVisible()

    // Verify Business plan does NOT exist
    await expect(page.getByRole('heading', { name: 'ビジネスプラン', exact: true })).not.toBeVisible()
    await expect(page.getByText('¥4,980')).not.toBeVisible()

    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/pricing-page.png', fullPage: true })
  })

  test('should have correct grid layout for 2 columns', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')

    // Check that the grid container has md:grid-cols-2 class
    const gridContainer = page.locator('div.grid').first()
    const className = await gridContainer.getAttribute('class')
    expect(className).toContain('md:grid-cols-2')
  })

  test('should allow plan selection interaction', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')

    // Click on Pro plan
    const proPlanCard = page.locator('div[class*="rounded-3xl"][class*="cursor-pointer"]').nth(1)
    await proPlanCard.click()

    // Wait for animation
    await page.waitForTimeout(600)

    // Take screenshot of selected state
    await page.screenshot({ path: 'tests/screenshots/pricing-page-selected.png', fullPage: true })
  })
})
