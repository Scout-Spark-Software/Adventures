import { test, expect } from './fixtures/base-test';

test.describe('Logout – authenticated user', () => {
  test('logs out and returns to homepage without authenticated nav', async ({ page }) => {
    await page.goto('/');

    // The user dropdown button is visible when authenticated (aria-haspopup="true")
    const userMenuButton = page.locator('button[aria-haspopup="true"]');
    await expect(userMenuButton).toBeVisible();

    // Open the user dropdown menu
    await userMenuButton.click();

    // Click the Log Out button — Playwright will wait up to actionTimeout for it to appear
    // (the dropdown renders asynchronously after the click via Svelte reactivity)
    const logoutButton = page.getByRole('button', { name: 'Log Out' });

    // The form POSTs to /logout which redirects 303 back to /.
    // Wait for the server response (the redirect) to know the logout completed.
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/logout') && r.request().method() === 'POST'),
      logoutButton.click(),
    ]);

    // Wait for the redirected page to finish loading
    await page.waitForLoadState('load');

    // The "Login" link should now be visible — user is no longer authenticated
    await expect(page.locator('nav a[href="/login"]')).toBeVisible();

    // The user dropdown should no longer be present
    await expect(userMenuButton).not.toBeVisible();
  });
});
