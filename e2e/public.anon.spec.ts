import { test, expect, type APIRequestContext } from '@playwright/test';

async function expectRedirectsToLogin(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  expect(response.headers()['location']).toMatch('/login');
}

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

  test('/submit redirects anonymous users to /login', async ({ request }) => {
    await expectRedirectsToLogin(request, '/submit');
  });

  test('/favorites redirects anonymous users to /login', async ({ request }) => {
    await expectRedirectsToLogin(request, '/favorites');
  });

  test('/profile redirects anonymous users to /login', async ({ request }) => {
    await expectRedirectsToLogin(request, '/profile');
  });

  test('/admin redirects anonymous users to /login', async ({ request }) => {
    await expectRedirectsToLogin(request, '/admin');
  });
});
