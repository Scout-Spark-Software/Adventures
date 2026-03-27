import { test as setup } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userFile = path.join(__dirname, '.auth/user.json');
const adminFile = path.join(__dirname, '.auth/admin.json');

setup('authenticate as regular user', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(process.env.TEST_USER_EMAIL!);
  await page.locator('#password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.context().storageState({ path: userFile });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(process.env.TEST_ADMIN_EMAIL!);
  await page.locator('#password').fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.context().storageState({ path: adminFile });
});
