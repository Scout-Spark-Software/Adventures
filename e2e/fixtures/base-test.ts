import { test as base, expect } from '@playwright/test';

/**
 * Extended test fixture that blocks third-party scripts which interfere with tests:
 *
 * - Termly consent manager: mounts an aria-modal alertdialog that blocks interaction
 *   with elements behind it. Pages with slow server loads (DB round-trips) give Termly
 *   enough time to mount before test interactions run.
 *
 * - Google AdSense / Tag Manager: make continuous background network requests that
 *   prevent waitForLoadState('networkidle') from ever resolving.
 *
 * Blocking these at the network level keeps tests fast and interaction-free.
 */
export const test = base.extend<{ page: import('@playwright/test').Page }>({
  page: async ({ page }, use) => {
    await page.route('**termly.io**', (route) => route.abort());
    await page.route('**googlesyndication.com**', (route) => route.abort());
    await page.route('**googletagmanager.com**', (route) => route.abort());
    await use(page);
  },
});

export { expect } from '@playwright/test';
