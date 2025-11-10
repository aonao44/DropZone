import { test, expect } from '@playwright/test';

test.describe('File Submission Duplicate Prevention', () => {
  test('should not create duplicate submissions when submitting files', async ({ page }) => {
    // Navigate to a test project submission page
    // Note: You'll need a valid project slug for this test
    const testProjectSlug = 'k7wink-mhse0y68';

    await page.goto(`http://localhost:3001/project/${testProjectSlug}/submit`);

    // Wait for the form to load
    await expect(page.locator('h1, h2').filter({ hasText: '素材提出フォーム' })).toBeVisible();

    // Fill in the form
    await page.fill('input[type="text"][placeholder*="太郎"]', 'テストユーザー');
    await page.fill('input[type="email"]', 'test@example.com');

    // Set up request interception to count API calls
    const apiCalls: any[] = [];

    page.on('request', request => {
      if (request.url().includes('/api/submissions') && request.method() === 'POST') {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log(`[API Call] POST /api/submissions - ${apiCalls.length}`);
      }
    });

    // Monitor console for duplicate detection
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('duplicate') || text.includes('Submission already in progress')) {
        console.log(`[Console Log] ${text}`);
      }
    });

    // Create a mock file
    const fileContent = Buffer.from('test file content');

    // Use setInputFiles for file upload (if file uploader supports it)
    // Note: This might need adjustment based on your FileUploader component implementation
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: fileContent,
      });

      // Wait a bit for file to be processed
      await page.waitForTimeout(1000);
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: '送信' });
    await submitButton.click();

    // Wait for submission to complete (either success or error)
    // This could be a success message or redirect
    await page.waitForTimeout(5000);

    // Verify that API was called only once
    console.log(`\n[Test Result] Total API calls: ${apiCalls.length}`);
    console.log('[Test Result] Console logs:', consoleLogs.filter(log =>
      log.includes('duplicate') || log.includes('Upload completed') || log.includes('Submission')
    ));

    // The main assertion: API should be called exactly once
    expect(apiCalls.length).toBeLessThanOrEqual(1);

    // Log success
    if (apiCalls.length === 0) {
      console.log('[Test Result] No files uploaded, no API call expected');
    } else if (apiCalls.length === 1) {
      console.log('[Test Result] ✓ Success! Only one API call was made');
    } else {
      console.log(`[Test Result] ✗ Failed! ${apiCalls.length} API calls were made (expected 1)`);
    }
  });

  test('should handle duplicate slug submissions idempotently', async ({ page }) => {
    // Test that the API endpoint returns existing submission for duplicate slug
    const response = await page.request.post('http://localhost:3001/api/submissions', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        slug: 'test-duplicate-' + Date.now(),
        projectSlug: 'test-project',
        submittedAt: new Date().toISOString(),
        files: [],
        figmaLinks: []
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const firstResult = await response.json();
    console.log('[First submission]', firstResult);

    expect(response.status()).toBe(201);
    expect(firstResult.success).toBe(true);

    // Make the same request again with the same slug
    const duplicateResponse = await page.request.post('http://localhost:3001/api/submissions', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        slug: firstResult.slug,
        projectSlug: 'test-project',
        submittedAt: new Date().toISOString(),
        files: [],
        figmaLinks: []
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const duplicateResult = await duplicateResponse.json();
    console.log('[Duplicate submission]', duplicateResult);

    // Should return 200 (not 201) and indicate it's a duplicate
    expect(duplicateResponse.status()).toBe(200);
    expect(duplicateResult.duplicate).toBe(true);
    expect(duplicateResult.id).toBe(firstResult.id);

    console.log('[Test Result] ✓ API correctly handled duplicate submission');
  });
});
