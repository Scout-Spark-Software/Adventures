import { test as setup, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userFile = path.join(__dirname, '.auth/user.json');
const adminFile = path.join(__dirname, '.auth/admin.json');

/**
 * Authenticate by POSTing credentials to the test-only /api/auth/test-session
 * endpoint, which calls WorkOS password auth and sets the session cookies.
 * This avoids going through the WorkOS AuthKit hosted UI.
 */
async function authenticate(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  storageFile: string
) {
  // POST credentials — the server sets httpOnly session cookies on this domain
  const response = await page.request.post('/api/auth/test-session', {
    data: { email, password },
  });

  if (!response.ok()) {
    throw new Error(
      `Test-session endpoint returned ${response.status()}: ${await response.text()}`
    );
  }

  // Verify the session was set by checking a protected page
  await page.goto('/profile');
  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: storageFile });
}

setup('authenticate as regular user', async ({ page }) => {
  await authenticate(
    page,
    process.env.TEST_USER_EMAIL!,
    process.env.TEST_USER_PASSWORD!,
    userFile
  );
});

setup('authenticate as admin', async ({ page }) => {
  await authenticate(
    page,
    process.env.TEST_ADMIN_EMAIL!,
    process.env.TEST_ADMIN_PASSWORD!,
    adminFile
  );
});
