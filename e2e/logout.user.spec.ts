import { test, expect } from '@playwright/test';

test.describe('Logout – authenticated user', () => {
  test('logs out and returns to homepage without authenticated nav', async ({ page }) => {
    await page.goto('/');

    // The user dropdown button is visible when authenticated (aria-haspopup="true")
    const userMenuButton = page.locator('button[aria-haspopup="true"]');
    await expect(userMenuButton).toBeVisible();

    // Open the user dropdown menu
    await userMenuButton.click();

    // Click the Log Out button inside the form that POSTs to /logout
    const logoutButton = page.locator('form[action="/logout"] button[type="submit"]');
    await expect(logoutButton).toBeVisible();

    // Wait for navigation — the form POSTs to /logout which redirects 303 to /
    // We were already on /, so we must explicitly wait for the reload to complete
    await Promise.all([
      page.waitForNavigation(),
      logoutButton.click(),
    ]);

    // Should be on homepage after logout
    await expect(page).toHaveURL('/');

    // Wait for the page to fully settle before checking nav state
    await page.waitForLoadState('networkidle');

    // The "Login" link should now be visible — user is no longer authenticated
    await expect(page.locator('nav a[href="/login"]')).toBeVisible();

    // The user dropdown should no longer be present
    await expect(userMenuButton).not.toBeVisible();
  });
});
