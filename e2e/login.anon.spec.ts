import { test, expect } from '@playwright/test';

test.describe('Login form – anonymous', () => {
  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword123');
    await page.click('button[type="submit"]');

    // Error message is rendered inside the form card when form.error is set
    await expect(page.locator('form p').first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs in with valid credentials and redirects to homepage', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    if (!email || !password) {
      test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set in environment');
    }

    await page.goto('/login');
    await page.fill('#email', email!);
    await page.fill('#password', password!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });
});
