# Playwright Integration & Full User Action Test Suite

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Install and configure Playwright, then write end-to-end tests covering all user-facing actions across anonymous, authenticated, and admin roles.

**Architecture:** Playwright runs against `npm run dev` (local dev server). Auth state is saved to disk after login and reused across tests, avoiding re-authenticating per test. Tests are organized by role: anonymous, user, admin. Page Object Model (POM) is used for reusable selectors.

**Tech Stack:** Playwright, TypeScript, SvelteKit dev server, WorkOS (real test credentials), `.env.test`

---

## Prerequisites

Before starting, you need **two real WorkOS test accounts** in your dev environment:
- A regular user: `test-user@example.com` / strong password
- An admin user: `test-admin@example.com` / strong password

You also need a real **approved hike and camping site** in the dev database to test detail pages and edit flows. Note the IDs.

These go in `.env.test` (see Task 1).

---

## Task 1: Install Playwright and Configure

**Files:**
- Create: `playwright.config.ts`
- Create: `.env.test`
- Create: `.env.test.example`
- Modify: `package.json`

**Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

**Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // keep false — tests share auth state files
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    // Auth setup runs first and saves session state
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'anonymous',
      testMatch: /.*\.anon\.spec\.ts/,
    },
    {
      name: 'authenticated',
      testMatch: /.*\.user\.spec\.ts/,
      dependencies: ['setup'],
      use: { storageState: 'e2e/.auth/user.json' },
    },
    {
      name: 'admin',
      testMatch: /.*\.admin\.spec\.ts/,
      dependencies: ['setup'],
      use: { storageState: 'e2e/.auth/admin.json' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
```

**Step 3: Create `.env.test`**

```bash
# Test user credentials (WorkOS dev environment)
TEST_USER_EMAIL=test-user@example.com
TEST_USER_PASSWORD=YourPassword123!
TEST_ADMIN_EMAIL=test-admin@example.com
TEST_ADMIN_PASSWORD=AdminPassword123!

# IDs of seeded/existing approved content for read/edit tests
TEST_HIKE_ID=your-hike-uuid-here
TEST_CAMPING_ID=your-camping-uuid-here
```

**Step 4: Create `.env.test.example`** (same as above but with placeholder values — commit this, not `.env.test`)

**Step 5: Add scripts to `package.json`**

```json
"test:e2e": "dotenv -e .env.test -- playwright test",
"test:e2e:ui": "dotenv -e .env.test -- playwright test --ui",
"test:e2e:headed": "dotenv -e .env.test -- playwright test --headed",
"test:e2e:report": "playwright show-report"
```

Install `dotenv-cli` to load `.env.test`:
```bash
npm install --save-dev dotenv-cli
```

**Step 6: Add to `.gitignore`**

Add these lines to `.gitignore`:
```
e2e/.auth/
.env.test
playwright-report/
test-results/
```

**Step 7: Create `e2e/` directory structure**

```
e2e/
  .auth/          # gitignored — saved session states
  fixtures/       # shared test helpers
  auth.setup.ts   # logs in and saves both session states
  *.anon.spec.ts
  *.user.spec.ts
  *.admin.spec.ts
```

Run: `mkdir -p e2e/.auth e2e/fixtures`

**Step 8: Verify Playwright installs correctly**

```bash
npx playwright test --list
```

Expected: empty list (no tests yet)

**Step 9: Commit**

```bash
git add playwright.config.ts .env.test.example package.json package-lock.json .gitignore e2e/
git commit -m "feat: install and configure Playwright for e2e tests"
```

---

## Task 2: Auth Setup Fixture

**Files:**
- Create: `e2e/auth.setup.ts`

This runs once before all authenticated tests and saves session cookies to disk.

**Step 1: Create `e2e/auth.setup.ts`**

```ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const userFile = path.join(__dirname, '.auth/user.json');
const adminFile = path.join(__dirname, '.auth/admin.json');

setup('authenticate as regular user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
  await page.context().storageState({ path: userFile });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await expect(page.getByRole('link', { name: /admin/i })).toBeVisible();
  await page.context().storageState({ path: adminFile });
});
```

**Step 2: Run setup to confirm it works**

```bash
npm run test:e2e -- --project=setup
```

Expected: 2 passing, two `.json` files created in `e2e/.auth/`

**Step 3: Commit**

```bash
git add e2e/auth.setup.ts
git commit -m "feat: add playwright auth setup fixtures for user and admin sessions"
```

---

## Task 3: Page Object Helpers

**Files:**
- Create: `e2e/fixtures/helpers.ts`

Shared utilities for common interactions used across test files.

**Step 1: Create `e2e/fixtures/helpers.ts`**

```ts
import type { Page } from '@playwright/test';

export async function logout(page: Page) {
  // SvelteKit logout is a POST action — submit the form
  await page.goto('/');
  await page.getByRole('button', { name: /log out/i }).click();
  await page.waitForURL('/');
}

export async function submitLoginForm(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export function getHikeId() {
  const id = process.env.TEST_HIKE_ID;
  if (!id) throw new Error('TEST_HIKE_ID not set in .env.test');
  return id;
}

export function getCampingId() {
  const id = process.env.TEST_CAMPING_ID;
  if (!id) throw new Error('TEST_CAMPING_ID not set in .env.test');
  return id;
}
```

**Step 2: Commit**

```bash
git add e2e/fixtures/helpers.ts
git commit -m "feat: add playwright test helper utilities"
```

---

## Task 4: Anonymous User Tests

**Files:**
- Create: `e2e/public.anon.spec.ts`

Tests that any visitor (not logged in) can perform.

**Step 1: Create `e2e/public.anon.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import { getHikeId, getCampingId } from './fixtures/helpers';

test.describe('Homepage', () => {
  test('loads and shows featured content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Adventures/i);
    // Stats section should be visible
    await expect(page.getByText(/trails/i)).toBeVisible();
  });
});

test.describe('Hikes listing', () => {
  test('shows approved hikes', async ({ page }) => {
    await page.goto('/hikes');
    await expect(page.getByRole('heading', { name: /hikes/i })).toBeVisible();
  });

  test('filters hikes by difficulty', async ({ page }) => {
    await page.goto('/hikes');
    // Select a difficulty filter if it exists
    const filterButton = page.getByRole('button', { name: /easy/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Hike detail page', () => {
  test('shows hike details', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('redirects to login when anonymous user tries to favorite', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const favoriteBtn = page.getByRole('button', { name: /favorite/i });
    if (await favoriteBtn.isVisible()) {
      await favoriteBtn.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('redirects to login when anonymous user tries to rate', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const ratingInput = page.getByRole('button', { name: /rate/i }).first();
    if (await ratingInput.isVisible()) {
      await ratingInput.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe('Camping listing', () => {
  test('shows approved camping sites', async ({ page }) => {
    await page.goto('/camping');
    await expect(page.getByRole('heading', { name: /camping/i })).toBeVisible();
  });
});

test.describe('Camping detail page', () => {
  test('shows camping site details', async ({ page }) => {
    await page.goto(`/camping/${getCampingId()}`);
    await expect(page.getByRole('heading')).toBeVisible();
  });
});

test.describe('Static pages', () => {
  test('essentials page loads', async ({ page }) => {
    await page.goto('/essentials');
    await expect(page.getByRole('heading', { name: /essentials/i })).toBeVisible();
  });
});

test.describe('Auth redirects for protected pages', () => {
  test('/submit redirects to login', async ({ page }) => {
    await page.goto('/submit');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/favorites redirects to login', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/profile redirects to login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/admin redirects to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

**Step 2: Run anonymous tests**

```bash
npm run test:e2e -- --project=anonymous
```

Expected: All pass. Fix any selector mismatches by inspecting the actual page markup with `--headed`.

**Step 3: Commit**

```bash
git add e2e/public.anon.spec.ts
git commit -m "feat: add anonymous user playwright tests for public pages and auth redirects"
```

---

## Task 5: Login / Logout Tests

**Files:**
- Create: `e2e/auth.anon.spec.ts`

Tests the login and logout flows (does not use saved auth state — starts fresh).

**Step 1: Create `e2e/auth.anon.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('notauser@example.com');
    await page.getByLabel('Password').fill('wrongpassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs in with valid credentials and redirects home', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Logout', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('logs out and returns to home', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL('/');
    // After logout, profile link should be gone
    await expect(page.getByRole('link', { name: /profile/i })).not.toBeVisible();
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=anonymous --grep "Login|Logout"
```

Wait — this file uses `storageState` inline. Note: the `Logout` describe uses `.use({ storageState })` directly, so it needs the setup to have run first. Move this to a separate file if it's in the anonymous project. Actually, since Logout re-uses auth state, rename this file and project accordingly:

Rename to `e2e/auth-flows.user.spec.ts` and move the Logout tests there. Keep only the Login tests in an `.anon.spec.ts` file.

**Revised file split:**
- `e2e/login.anon.spec.ts` — login form tests (no saved auth)
- `e2e/logout.user.spec.ts` — logout test (uses saved user auth state)

**Step 3: Run**

```bash
npm run test:e2e -- --project=anonymous
npm run test:e2e -- --project=authenticated --grep "logout"
```

Expected: All pass.

**Step 4: Commit**

```bash
git add e2e/login.anon.spec.ts e2e/logout.user.spec.ts
git commit -m "feat: add login and logout e2e tests"
```

---

## Task 6: Authenticated User — Submit Content

**Files:**
- Create: `e2e/submit.user.spec.ts`

Tests submitting a new hike and camping site as a logged-in user.

**Step 1: Create `e2e/submit.user.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Submit hike', () => {
  test('submits a new hike and shows pending confirmation', async ({ page }) => {
    await page.goto('/submit');
    // Select the "Hike" tab
    await page.getByRole('tab', { name: /hike/i }).click();

    // Fill address
    await page.getByLabel(/trail name/i).fill('Test Trail E2E');
    await page.getByLabel(/description/i).fill('A test trail created by Playwright.');
    await page.getByLabel(/address/i).fill('123 Forest Rd');
    await page.getByLabel(/city/i).fill('Portland');
    await page.getByLabel(/state/i).fill('OR');
    await page.getByLabel(/country/i).fill('US');

    // Hike-specific
    await page.getByLabel(/difficulty/i).selectOption('moderate');
    await page.getByLabel(/distance/i).fill('5');
    await page.getByLabel(/duration/i).fill('3');

    await page.getByRole('button', { name: /submit/i }).click();

    // Should show success state or redirect with pending message
    await expect(page.getByText(/pending|submitted|review/i)).toBeVisible();
  });
});

test.describe('Submit camping site', () => {
  test('submits a new camping site and shows pending confirmation', async ({ page }) => {
    await page.goto('/submit');
    await page.getByRole('tab', { name: /camp/i }).click();

    await page.getByLabel(/site name/i).fill('Test Campsite E2E');
    await page.getByLabel(/description/i).fill('A test campsite created by Playwright.');
    await page.getByLabel(/address/i).fill('456 Lake Rd');
    await page.getByLabel(/city/i).fill('Eugene');
    await page.getByLabel(/state/i).fill('OR');
    await page.getByLabel(/country/i).fill('US');

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(/pending|submitted|review/i)).toBeVisible();
  });
});
```

> **Note:** The exact label text depends on the actual form markup. Run with `--headed` and inspect the form if tests fail on selectors. Use `page.getByPlaceholder()` or `page.locator('[name="fieldName"]')` as fallbacks.

**Step 2: Run**

```bash
npm run test:e2e -- --project=authenticated --grep "Submit"
```

Expected: Both pass. Check `--headed` if selectors don't match.

**Step 3: Commit**

```bash
git add e2e/submit.user.spec.ts
git commit -m "feat: add e2e tests for submitting hike and camping site"
```

---

## Task 7: Authenticated User — Favorites

**Files:**
- Create: `e2e/favorites.user.spec.ts`

**Step 1: Create `e2e/favorites.user.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import { getHikeId } from './fixtures/helpers';

test.describe('Favorites', () => {
  test('adds a hike to favorites from detail page', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const favoriteBtn = page.getByRole('button', { name: /add to favorites|favorite/i });
    await expect(favoriteBtn).toBeVisible();
    await favoriteBtn.click();
    // Button state should change or a success indicator appears
    await expect(page.getByText(/saved|favorited|added/i)).toBeVisible();
  });

  test('shows favorites on /favorites page', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { name: /favorites/i })).toBeVisible();
    // At least one item should be present (from previous test)
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('removes a hike from favorites', async ({ page }) => {
    await page.goto('/favorites');
    const removeBtn = page.getByRole('button', { name: /remove|unfavorite/i }).first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForLoadState('networkidle');
    }
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=authenticated --grep "Favorites"
```

**Step 3: Commit**

```bash
git add e2e/favorites.user.spec.ts
git commit -m "feat: add e2e tests for favorites flow"
```

---

## Task 8: Authenticated User — Ratings & Reviews

**Files:**
- Create: `e2e/ratings.user.spec.ts`

**Step 1: Create `e2e/ratings.user.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import { getHikeId } from './fixtures/helpers';

test.describe('Ratings', () => {
  test('submits a rating on a hike', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    // Navigate to reviews tab if tabbed layout
    const reviewsTab = page.getByRole('tab', { name: /review/i });
    if (await reviewsTab.isVisible()) await reviewsTab.click();

    // Click a star (e.g. 4-star rating)
    const stars = page.locator('[aria-label*="star"], [data-rating]');
    if (await stars.count() > 0) {
      await stars.nth(3).click(); // 4th star = 4 stars
    }

    await page.getByRole('button', { name: /submit.*rating|save.*review/i }).click();
    await expect(page.getByText(/thank you|rating.*saved|review.*submitted/i)).toBeVisible();
  });

  test('submits a rating with review text', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const reviewsTab = page.getByRole('tab', { name: /review/i });
    if (await reviewsTab.isVisible()) await reviewsTab.click();

    const stars = page.locator('[aria-label*="star"], [data-rating]');
    if (await stars.count() > 0) await stars.nth(4).click();

    const reviewTextarea = page.getByLabel(/review|comment/i);
    if (await reviewTextarea.isVisible()) {
      await reviewTextarea.fill('Great trail, highly recommend!');
    }

    await page.getByRole('button', { name: /submit.*rating|save.*review/i }).click();
    await expect(page.getByText(/thank you|rating.*saved|submitted/i)).toBeVisible();
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=authenticated --grep "Ratings"
```

**Step 3: Commit**

```bash
git add e2e/ratings.user.spec.ts
git commit -m "feat: add e2e tests for ratings and reviews"
```

---

## Task 9: Authenticated User — Notes

**Files:**
- Create: `e2e/notes.user.spec.ts`

**Step 1: Create `e2e/notes.user.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import { getHikeId } from './fixtures/helpers';

test.describe('Notes', () => {
  test('adds a private note on a hike', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const notesTab = page.getByRole('tab', { name: /note/i });
    if (await notesTab.isVisible()) await notesTab.click();

    const noteInput = page.getByLabel(/note/i).or(page.getByPlaceholder(/note/i));
    await noteInput.fill('Playwright test note — remember to bring water.');
    await page.getByRole('button', { name: /save.*note|add.*note/i }).click();

    await expect(page.getByText(/playwright test note/i)).toBeVisible();
  });

  test('edits an existing note', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const notesTab = page.getByRole('tab', { name: /note/i });
    if (await notesTab.isVisible()) await notesTab.click();

    const editBtn = page.getByRole('button', { name: /edit/i }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      const noteInput = page.getByLabel(/note/i).or(page.getByPlaceholder(/note/i));
      await noteInput.fill('Updated Playwright note.');
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/updated playwright note/i)).toBeVisible();
    }
  });

  test('deletes a note', async ({ page }) => {
    await page.goto(`/hikes/${getHikeId()}`);
    const notesTab = page.getByRole('tab', { name: /note/i });
    if (await notesTab.isVisible()) await notesTab.click();

    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Confirm dialog if present
      const confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmBtn.isVisible()) await confirmBtn.click();
      await page.waitForLoadState('networkidle');
    }
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=authenticated --grep "Notes"
```

**Step 3: Commit**

```bash
git add e2e/notes.user.spec.ts
git commit -m "feat: add e2e tests for private notes on hikes"
```

---

## Task 10: Authenticated User — Profile

**Files:**
- Create: `e2e/profile.user.spec.ts`

**Step 1: Create `e2e/profile.user.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Profile', () => {
  test('loads the profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('saves scout unit info', async ({ page }) => {
    await page.goto('/profile');
    const unitNumberInput = page.getByLabel(/unit number/i);
    if (await unitNumberInput.isVisible()) {
      await unitNumberInput.fill('42');
    }
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved|updated/i)).toBeVisible();
  });

  test('shows error when new passwords do not match', async ({ page }) => {
    await page.goto('/profile');
    await page.getByLabel(/current password/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByLabel(/new password/i).fill('NewPassword123!');
    await page.getByLabel(/confirm.*password/i).fill('DifferentPassword123!');
    await page.getByRole('button', { name: /change password/i }).click();
    await expect(page.getByText(/do not match/i)).toBeVisible();
  });

  test('shows error when new password is too weak', async ({ page }) => {
    await page.goto('/profile');
    await page.getByLabel(/current password/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByLabel(/new password/i).fill('weak');
    await page.getByLabel(/confirm.*password/i).fill('weak');
    await page.getByRole('button', { name: /change password/i }).click();
    await expect(page.getByText(/12 char|uppercase|must contain/i)).toBeVisible();
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=authenticated --grep "Profile"
```

**Step 3: Commit**

```bash
git add e2e/profile.user.spec.ts
git commit -m "feat: add e2e tests for profile management"
```

---

## Task 11: Admin — Moderation Queue

**Files:**
- Create: `e2e/moderation.admin.spec.ts`

Tests the admin moderation workflow. Assumes there are pending submissions (created by the submit tests above, or seed data).

**Step 1: Create `e2e/moderation.admin.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Moderation queue', () => {
  test('admin can view the moderation queue', async ({ page }) => {
    await page.goto('/admin/moderation');
    await expect(page.getByRole('heading', { name: /moderation/i })).toBeVisible();
  });

  test('admin can approve a pending submission', async ({ page }) => {
    await page.goto('/admin/moderation');
    const approveBtn = page.getByRole('button', { name: /approve/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/approved/i)).toBeVisible();
    }
  });

  test('admin can reject a pending submission', async ({ page }) => {
    await page.goto('/admin/moderation');
    const rejectBtn = page.getByRole('button', { name: /reject/i }).first();
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/rejected/i)).toBeVisible();
    }
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=admin --grep "Moderation"
```

**Step 3: Commit**

```bash
git add e2e/moderation.admin.spec.ts
git commit -m "feat: add e2e tests for admin moderation queue"
```

---

## Task 12: Admin — Featured Content

**Files:**
- Create: `e2e/featured.admin.spec.ts`

**Step 1: Create `e2e/featured.admin.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Featured content', () => {
  test('admin can view featured management page', async ({ page }) => {
    await page.goto('/admin/featured');
    await expect(page.getByRole('heading', { name: /featured/i })).toBeVisible();
  });

  test('admin can toggle featured status', async ({ page }) => {
    await page.goto('/admin/featured');
    const toggleBtn = page.getByRole('button', { name: /feature|unfeature/i }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForLoadState('networkidle');
      // Toggle should have changed
      await expect(page.getByRole('button', { name: /feature|unfeature/i }).first()).toBeVisible();
    }
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=admin --grep "Featured"
```

**Step 3: Commit**

```bash
git add e2e/featured.admin.spec.ts
git commit -m "feat: add e2e tests for admin featured content management"
```

---

## Task 13: Admin — Type Management (Amenities / Facilities / Features)

**Files:**
- Create: `e2e/types.admin.spec.ts`

**Step 1: Create `e2e/types.admin.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Type management', () => {
  test('admin can view types management page', async ({ page }) => {
    await page.goto('/admin/types');
    await expect(page.getByRole('heading', { name: /types/i })).toBeVisible();
  });

  test('admin can add an amenity type', async ({ page }) => {
    await page.goto('/admin/types');
    // Find amenity section
    const amenitySection = page.getByText(/amenity/i).first();
    await expect(amenitySection).toBeVisible();

    const nameInput = page.getByPlaceholder(/new.*type|add.*type/i).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Amenity E2E');
      await page.getByRole('button', { name: /add/i }).first().click();
      await expect(page.getByText(/test amenity e2e/i)).toBeVisible();
    }
  });

  test('admin can delete an amenity type', async ({ page }) => {
    await page.goto('/admin/types');
    // Delete the one we just added
    const row = page.getByText(/test amenity e2e/i);
    if (await row.isVisible()) {
      const deleteBtn = row.locator('..').getByRole('button', { name: /delete/i });
      await deleteBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/test amenity e2e/i)).not.toBeVisible();
    }
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=admin --grep "Type management"
```

**Step 3: Commit**

```bash
git add e2e/types.admin.spec.ts
git commit -m "feat: add e2e tests for admin type management (amenity/facility/feature)"
```

---

## Task 14: Admin — User Management

**Files:**
- Create: `e2e/users.admin.spec.ts`

**Step 1: Create `e2e/users.admin.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('User management', () => {
  test('admin can view user management page', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
  });

  test('shows user list with roles', async ({ page }) => {
    await page.goto('/admin/users');
    // Should show at least the test admin user
    await expect(page.getByText(process.env.TEST_ADMIN_EMAIL!)).toBeVisible();
  });
});
```

> **Note:** Do NOT test role promotion/demotion via UI because it would affect the test admin account and break subsequent tests. Role assignment is tested via the API in a future unit test scope.

**Step 2: Run**

```bash
npm run test:e2e -- --project=admin --grep "User management"
```

**Step 3: Commit**

```bash
git add e2e/users.admin.spec.ts
git commit -m "feat: add e2e tests for admin user management page"
```

---

## Task 15: Non-Admin Access Denied

**Files:**
- Create: `e2e/access-control.user.spec.ts`

Verify regular users cannot access admin pages.

**Step 1: Create `e2e/access-control.user.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Access control', () => {
  test('regular user cannot access /admin', async ({ page }) => {
    await page.goto('/admin');
    // Should be redirected or shown forbidden
    await expect(page).not.toHaveURL('/admin');
  });

  test('regular user cannot access /admin/moderation', async ({ page }) => {
    await page.goto('/admin/moderation');
    await expect(page).not.toHaveURL('/admin/moderation');
  });

  test('regular user cannot access /admin/users', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).not.toHaveURL('/admin/users');
  });
});
```

**Step 2: Run**

```bash
npm run test:e2e -- --project=authenticated --grep "Access control"
```

**Step 3: Commit**

```bash
git add e2e/access-control.user.spec.ts
git commit -m "feat: add e2e access control tests for non-admin users"
```

---

## Task 16: Run Full Suite and Add CI Script

**Step 1: Run the full suite**

```bash
npm run test:e2e
```

Review the HTML report:
```bash
npm run test:e2e:report
```

Fix any remaining selector mismatches. Use `--headed` to watch tests run:
```bash
npm run test:e2e:headed
```

**Step 2: Add a CI-ready test script to `package.json`**

```json
"test:e2e:ci": "playwright test"
```

In CI, set env vars directly from secrets (do not commit `.env.test` — use `.env.test.example` as reference).

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete playwright e2e test suite covering all user actions"
```

---

## Final File Structure

```
e2e/
  .auth/                         # gitignored
    user.json
    admin.json
  fixtures/
    helpers.ts
  auth.setup.ts
  public.anon.spec.ts            # homepage, listing pages, detail pages
  login.anon.spec.ts             # login form validation
  logout.user.spec.ts            # logout flow
  submit.user.spec.ts            # submit hike + camping site
  favorites.user.spec.ts         # add/remove favorites
  ratings.user.spec.ts           # submit ratings and reviews
  notes.user.spec.ts             # add/edit/delete notes
  profile.user.spec.ts           # profile + password change
  access-control.user.spec.ts    # admin pages blocked for regular users
  moderation.admin.spec.ts       # approve/reject queue
  featured.admin.spec.ts         # toggle featured
  types.admin.spec.ts            # amenity/facility/feature type CRUD
  users.admin.spec.ts            # view users
playwright.config.ts
.env.test                        # gitignored
.env.test.example                # committed
```
