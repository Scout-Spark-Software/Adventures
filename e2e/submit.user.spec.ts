import { test, expect, request } from '@playwright/test';

test.describe('Submit adventure – authenticated user', () => {
  test('submits a new hike and shows success state', async ({ page }) => {
    await page.goto('/submit');

    // Ensure the hike form type is selected (it is the default)
    await page.selectOption('#submission-type', 'hike');

    // Fill in the only server-required field: name
    await page.fill('#hike-name', 'Test Hike E2E');

    // Fill in city and state, which are required by client-side validation
    await page.fill('#city', 'Portland');
    await page.fill('#state', 'OR');

    // Submit the hike form
    await page.click('form[action="?/submitHike"] button[type="submit"]');

    // The SuccessAnimation overlay appears with "Success!" heading
    await expect(page.locator('h3.success-text')).toContainText('Success!', { timeout: 10000 });
    await expect(page.locator('text=Your hike has been submitted for review!')).toBeVisible();
  });

  test('submits a new camping site and shows success state', async ({ page }) => {
    await page.goto('/submit');

    // Switch to camping site form
    await page.selectOption('#submission-type', 'camping_site');

    // Fill in the only server-required field: name
    await page.fill('#camping-name', 'Test Camping Site E2E');

    // Fill in city and state, which are required by client-side validation
    await page.fill('#city', 'Bend');
    await page.fill('#state', 'OR');

    // Fill in the three required enum fields (pet_policy, site_type, fire_policy)
    await page.selectOption('#pet_policy', 'allowed');
    await page.selectOption('#site_type', 'public');
    await page.selectOption('#fire_policy', 'allowed');

    // Submit the camping site form
    await page.click('form[action="?/submitCampingSite"] button[type="submit"]');

    // The SuccessAnimation overlay appears with "Success!" heading
    await expect(page.locator('h3.success-text')).toContainText('Success!', { timeout: 10000 });
    await expect(page.locator('text=Your camping site has been submitted for review!')).toBeVisible();
  });
});

test.afterAll(async () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  const adminContext = await request.newContext({
    baseURL,
    storageState: 'e2e/.auth/admin.json',
  });

  try {
    const hikesRes = await adminContext.get('/api/hikes?status=pending&limit=100');
    if (hikesRes.ok()) {
      const { data } = await hikesRes.json();
      for (const hike of (data ?? []).filter((h: { name: string }) => h.name === 'Test Hike E2E')) {
        await adminContext.delete(`/api/hikes/${hike.id}`);
      }
    }

    const campingRes = await adminContext.get('/api/camping-sites?status=pending&limit=100');
    if (campingRes.ok()) {
      const { data } = await campingRes.json();
      for (const site of (data ?? []).filter((s: { name: string }) => s.name === 'Test Camping Site E2E')) {
        await adminContext.delete(`/api/camping-sites/${site.id}`);
      }
    }
  } finally {
    await adminContext.dispose();
  }
});
