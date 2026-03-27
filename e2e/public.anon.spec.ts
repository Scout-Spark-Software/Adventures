import { test, expect } from '@playwright/test';

test.describe('Anonymous user – public pages', () => {
  test('homepage loads and shows content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Adventure Spark/);
    // The nav logo link is always present
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
  });

  test('hikes listing page loads', async ({ page }) => {
    await page.goto('/hikes');
    await expect(page.locator('h1')).toHaveText('Hiking Trails');
  });

  test('camping listing page loads', async ({ page }) => {
    await page.goto('/camping');
    await expect(page.locator('h1')).toHaveText('Camping Sites');
  });

  test('essentials page loads', async ({ page }) => {
    await page.goto('/essentials');
    await expect(page).toHaveTitle(/Scout Essentials/);
    await expect(page.locator('h2').filter({ hasText: 'The Scout Motto: Be Prepared' })).toBeVisible();
  });

  test('/submit redirects anonymous users to /login', async ({ page }) => {
    await page.goto('/submit');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/favorites redirects anonymous users to /login', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/profile redirects anonymous users to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/admin redirects anonymous users to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
