import { test, expect } from '@playwright/test';

test.describe('Login page – anonymous', () => {
  test('redirects to WorkOS AuthKit hosted UI', async ({ request }) => {
    // Check the redirect without following it to avoid CI network dependency on WorkOS
    const response = await request.get('/login', { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    const location = response.headers()['location'] ?? '';
    expect(location).not.toMatch(/localhost/);
    expect(location.length).toBeGreaterThan(0);
  });

  test('shows error banner when ?error param is present', async ({ page }) => {
    // When WorkOS returns an error, the callback redirects to /login?error=...
    // which causes the load function to render the page instead of redirecting
    await page.goto('/login?error=access_denied');
    await expect(page).toHaveURL(/\/login/);
    // The error banner should be visible
    await expect(page.getByText('Sign in failed. Please try again.')).toBeVisible();
  });

  test('shows password reset banner when ?passwordReset=true', async ({ page }) => {
    await page.goto('/login?passwordReset=true');
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText('Password reset! You can now sign in with your new password.')
    ).toBeVisible();
  });

  test('"Continue to Sign In" button is present on flash pages', async ({ page }) => {
    await page.goto('/login?error=access_denied');
    const button = page.getByRole('link', { name: 'Continue to Sign In' });
    await expect(button).toBeVisible();
    // Clicking it navigates away from localhost (to WorkOS hosted UI)
    await Promise.all([
      page.waitForURL((url) => !url.hostname.includes('localhost')),
      button.click(),
    ]);
    await expect(page).not.toHaveURL(/localhost/);
  });
});
