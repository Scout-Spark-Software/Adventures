# Fix Failing E2E Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 13 failing Playwright E2E tests across 8 test files.

**Architecture:** Six definite root-cause fixes (selector bugs, text mismatches, missing DB field, leftover test data) plus one investigation task for the camping submit failure whose cause requires runtime diagnosis.

**Tech Stack:** Playwright, SvelteKit, Drizzle ORM (Neon PostgreSQL), WorkOS auth.

---

## Root Cause Map

| Test(s) | Root Cause | Fix Location |
|---|---|---|
| `login.anon.spec.ts:4` | `form p` selector — error `<p>` lives outside `<form>` tag | Add `data-testid` to login page; update test |
| `notes.user.spec.ts:34,60,100` | `getByRole('button')` won't match `<button role="tab">` | Change to `getByRole('tab')` (4 places) |
| `ratings.user.spec.ts:33,59,89` | Same ARIA role mismatch | Change to `getByRole('tab')` (4 places) |
| `profile.user.spec.ts:25,40` | Expected text doesn't match actual UI strings | Fix 2 expected strings in test |
| `favorites.user.spec.ts:42` | `slug` not selected in favorites DB query → `href="/hikes/undefined"` | Add `slug` + `bannerImageUrl` to server query |
| `types.admin.spec.ts:16` | `name` and `key` are `unique()` on `amenity_types` — leftover record from a previous partial run blocks the INSERT | Add `beforeAll` cleanup to the test |
| `submit.user.spec.ts:25` | Unknown — runtime diagnosis required (hike submit passes; camping form bindings look correct but need verification) | Investigate with debug output |
| `logout.user.spec.ts:4` | Unknown — runtime diagnosis required | Investigate with debug output |

---

## Task 1: Fix login error selector

**Files:**
- `src/routes/login/+page.svelte` (add data-testid)
- `e2e/login.anon.spec.ts:11` (update selector)

The `{#if form?.error}` block in `login/+page.svelte` renders **before and outside** the `<form>` element. `form p` won't match it.

**Step 1: Add `data-testid` to the error `<p>`**

In `src/routes/login/+page.svelte`, find the error paragraph inside `{#if form?.error}` (around line 183):
```svelte
<!-- Before -->
<p class="text-sm" style="color: #fca5a5;">{form.error}</p>

<!-- After -->
<p class="text-sm" style="color: #fca5a5;" data-testid="login-error">{form.error}</p>
```

**Step 2: Update the test selector**

In `e2e/login.anon.spec.ts`, line 11:
```ts
// Before
await expect(page.locator('form p').first()).toBeVisible();

// After
await expect(page.getByTestId('login-error')).toBeVisible();
```

**Step 3: Run the test**
```bash
npx playwright test e2e/login.anon.spec.ts --project=anonymous
```
Expected: PASSES.

**Step 4: Commit**
```bash
git add src/routes/login/+page.svelte e2e/login.anon.spec.ts
git commit -m "fix: update login error selector to use data-testid"
```

---

## Task 2: Fix notes tab ARIA role selectors

**Files:**
- `e2e/notes.user.spec.ts` (4 occurrences)

`Tabs.svelte` renders `<button role="tab">`. `getByRole('button')` resolves to ARIA role "button"; `<button role="tab">` has ARIA role "tab". Change all 4 occurrences.

**Step 1: Replace all 4 occurrences**

Lines 17 (beforeEach), 42 (adds note), 69 (edits note), 108 (deletes note) — each has:
```ts
// Before
await page.getByRole('button', { name: /My Notes/ }).click();

// After
await page.getByRole('tab', { name: /My Notes/ }).click();
```

**Step 2: Run the tests**
```bash
npx playwright test e2e/notes.user.spec.ts --project=authenticated
```
Expected: all 3 tests PASS.

**Step 3: Commit**
```bash
git add e2e/notes.user.spec.ts
git commit -m "fix: use getByRole('tab') for My Notes tab in notes tests"
```

---

## Task 3: Fix ratings tab ARIA role selectors

**Files:**
- `e2e/ratings.user.spec.ts` (4 occurrences)

Same root cause as Task 2.

**Step 1: Replace all 4 occurrences**

Lines 18 (beforeEach), 39, 67, 97 — each has:
```ts
// Before
await page.getByRole('button', { name: 'Reviews' }).click();

// After
await page.getByRole('tab', { name: 'Reviews' }).click();
```

**Step 2: Run the tests**
```bash
npx playwright test e2e/ratings.user.spec.ts --project=authenticated
```
Expected: all 3 tests PASS.

**Step 3: Commit**
```bash
git add e2e/ratings.user.spec.ts
git commit -m "fix: use getByRole('tab') for Reviews tab in ratings tests"
```

---

## Task 4: Fix profile password error text

**Files:**
- `e2e/profile.user.spec.ts` (2 lines)

**Step 1: Fix "mismatched passwords" test (line 37)**

UI shows `"Passwords do not match"` (profile `+page.svelte` line 399), not `"New passwords do not match"`.
```ts
// Before
await expect(page.locator("text=New passwords do not match")).toBeVisible();

// After
await expect(page.locator("text=Passwords do not match")).toBeVisible();
```

**Step 2: Fix "too-short/weak password" test (lines 53–55)**

UI shows `"12+ characters required"` (profile `+page.svelte` line 362), not `"Password must be at least 12 characters long"`.
```ts
// Before
await expect(
  page.locator("text=Password must be at least 12 characters long")
).toBeVisible();

// After
await expect(page.locator("text=12+ characters required")).toBeVisible();
```

Note: both errors are reactive (shown as you type — no form submit needed). The button click is a no-op because `canSubmit` is `false`, but the inline error is visible before the click.

**Step 3: Run the tests**
```bash
npx playwright test e2e/profile.user.spec.ts --project=authenticated
```
Expected: both failing tests PASS; the other two profile tests stay passing.

**Step 4: Commit**
```bash
git add e2e/profile.user.spec.ts
git commit -m "fix: update profile password error text to match actual UI strings"
```

---

## Task 5: Add `slug` and `bannerImageUrl` to favorites DB query

**Files:**
- `src/routes/favorites/+page.server.ts`

`HikeCard` renders `href="/hikes/{hike.slug}"` and optionally shows `hike.bannerImageUrl`. `CampingSiteCard` renders `href="/camping/{campingSite.slug}"`. Neither `slug` nor `bannerImageUrl` is selected in the current query, so every card links to `…/undefined`.

**Step 1: Verify field names exist on the schemas**
```bash
grep -n "slug\|bannerImageUrl" src/lib/db/schemas/hikes.ts
grep -n "slug\|bannerImageUrl" src/lib/db/schemas/camping-sites.ts
```

**Step 2: Add `slug` and `bannerImageUrl` to the hike select**

In the hike `.select({…})` block, add after `id: hikes.id,`:
```ts
slug: hikes.slug,
bannerImageUrl: hikes.bannerImageUrl,
```

**Step 3: Add `slug` to the camping site select**

In the camping site `.select({…})` block, add after `id: campingSites.id,`:
```ts
slug: campingSites.slug,
```
Also add `bannerImageUrl: campingSites.bannerImageUrl` if that field exists on the schema.

**Step 4: Run the favorites test**
```bash
npx playwright test e2e/favorites.user.spec.ts --project=authenticated
```
Expected: all 4 favorites tests PASS.

**Step 5: Commit**
```bash
git add src/routes/favorites/+page.server.ts
git commit -m "fix: add slug and bannerImageUrl to favorites page DB query"
```

---

## Task 6: Fix types admin test — add `beforeAll` cleanup

**Files:**
- `e2e/types.admin.spec.ts`

The `amenity_types` table has `UNIQUE` constraints on both `name` and `key` (schema lines 5–6). The test constant `TEST_AMENITY_NAME = "Test Amenity E2E Playwright"` / `TEST_AMENITY_KEY = "testAmenityE2EPlaywright"` may already exist in the DB from a previous partial run (where the add test succeeded but the delete test didn't clean up). The next add attempt gets a unique-constraint violation → the API returns 500 → `saveItem()` calls `alert("Failed to save item")` → the item never appears in the list → test fails.

Fix: add a `test.beforeAll` that deletes any pre-existing record with the test name or key before the suite runs. Use the admin API to avoid UI dependency.

**Step 1: Add the `beforeAll` block at the top of the describe**

In `e2e/types.admin.spec.ts`, after the constants and before the first test, add:

```ts
import { request as baseRequest } from '@playwright/test';

test.beforeAll(async () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  const adminContext = await baseRequest.newContext({
    baseURL,
    storageState: 'e2e/.auth/admin.json',
  });

  try {
    // Fetch amenity types and delete the test one if it exists
    const res = await adminContext.get('/api/amenity-types');
    if (res.ok()) {
      const types: Array<{ id: string; name: string; key: string }> = await res.json();
      for (const t of types) {
        if (t.name === TEST_AMENITY_NAME || t.key === TEST_AMENITY_KEY) {
          await adminContext.delete(`/api/amenity-types/${t.id}`);
        }
      }
    }
  } finally {
    await adminContext.dispose();
  }
});
```

**Step 2: Run the types tests**
```bash
npx playwright test e2e/types.admin.spec.ts --project=admin
```
Expected: all 3 tests PASS (view, add, delete).

**Step 3: Commit**
```bash
git add e2e/types.admin.spec.ts
git commit -m "fix: add beforeAll cleanup for test amenity type in types admin tests"
```

---

## Task 7: Diagnose and fix camping submit test

**Files:**
- `e2e/submit.user.spec.ts`
- Possibly `src/routes/submit/+page.svelte`
- Possibly `src/routes/submit/+page.server.ts`

The hike submit test (line 4) now passes. The camping submit test (line 25) still fails. Both use the same `makeEnhanceHandler` pattern. The extra steps in the camping test are: `selectOption('#submission-type', 'camping_site')` followed by `selectOption` on three `FormSelect`-wrapped `<select>` elements (`#pet_policy`, `#site_type`, `#fire_policy`). The hike test uses NO `selectOption` calls — only `fill()`. This is the prime suspect.

**Step 1: Run with debug output to find the exact failure point**
```bash
npx playwright test e2e/submit.user.spec.ts:25 --project=authenticated --reporter=list --headed
```
Watch which step fails. If it times out waiting for `h3.success-text`, the form did not submit successfully.

**Step 2: Check if validateForm() is blocking**

After clicking submit, check for any visible client-side error text:
```bash
# Temporarily add to the test after the button click:
await page.waitForTimeout(500);
const errs = await page.locator('[class*="text-red"]').allTextContents();
console.log('Client errors:', errs);
```

If "Pet policy is required", "Site type is required", or "Fire policy is required" appear, the `FormSelect`-bound variables (`petPolicy`, `siteType`, `firePolicy`) are not being updated by `selectOption`.

**Step 3a: If FormSelect binding is the issue**

`FormSelect` uses `bind:value` on its internal `<select>` and exposes `value` as a two-way-bound prop. Playwright's `selectOption()` fires a `change` event, which Svelte's `bind:value` handles. If this isn't propagating back through the component boundary, a workaround is to dispatch a programmatic change using `page.evaluate()`:

```ts
// Replace selectOption with explicit event dispatch for each policy select
await page.locator('#pet_policy').selectOption('allowed');
await page.locator('#pet_policy').dispatchEvent('change');

await page.locator('#site_type').selectOption('public');
await page.locator('#site_type').dispatchEvent('change');

await page.locator('#fire_policy').selectOption('allowed');
await page.locator('#fire_policy').dispatchEvent('change');
```

(Note: `selectOption()` already fires `change`, so this should be equivalent — but if the event is being consumed by `FormSelect`'s `on:change` without propagating to the bound prop, an explicit `input` event dispatch may help.)

**Step 3b: If server is returning an error**

Check the dev server console for errors when the camping form submits. The server action at `submit/+page.server.ts:submitCampingSite` calls `fetch("/api/camping-sites", …)` internally. If that returns non-OK, the action returns `fail(400)`. The enhance handler then sets `submitError` (not `showSuccess`).

Add to the test after the submit click:
```ts
await page.waitForTimeout(1500);
const submitErr = await page.locator('[class*="text-red-600"]').first().textContent().catch(() => null);
console.log('Submit error:', submitErr);
```

**Step 4: Run after the fix**
```bash
npx playwright test e2e/submit.user.spec.ts --project=authenticated
```
Expected: both submit tests PASS. The `afterAll` cleanup uses admin credentials to delete "Test Hike E2E" and "Test Camping Site E2E" pending submissions.

**Step 5: Commit the fix**
```bash
git add e2e/submit.user.spec.ts  # or other changed files
git commit -m "fix: camping site submit test - <describe specific fix>"
```

---

## Task 8: Diagnose and fix logout test

**Files:**
- `e2e/logout.user.spec.ts`

**Step 1: Run with debug output**
```bash
npx playwright test e2e/logout.user.spec.ts --project=authenticated --reporter=list --headed
```
Watch which assertion fails.

**Step 2: If failing at `expect(userMenuButton).toBeVisible()` (first assertion)**

The user session is not being applied. Re-run the setup:
```bash
npx playwright test --project=setup
```
Then retry.

**Step 3: If failing at `expect(page).toHaveURL('/')`**

The form POSTs to `/logout` (`+server.ts` handler that deletes cookies and does `redirect(303, '/')`). Add an explicit navigation wait:
```ts
// Before
await logoutButton.click();
await expect(page).toHaveURL('/');

// After
await Promise.all([
  page.waitForNavigation(),
  logoutButton.click(),
]);
await expect(page).toHaveURL('/');
```

**Step 4: If failing at `expect(page.locator('nav a[href="/login"]')).toBeVisible()`**

After the full-page redirect to `/`, the Header renders with `user = null` (no session cookies). Add a `networkidle` wait:
```ts
await page.waitForLoadState('networkidle');
await expect(page.locator('nav a[href="/login"]')).toBeVisible();
```

**Step 5: Run after changes**
```bash
npx playwright test e2e/logout.user.spec.ts --project=authenticated
```
Expected: PASSES.

**Step 6: Commit**
```bash
git add e2e/logout.user.spec.ts
git commit -m "fix: logout test navigation wait"
```

---

## Task 9: Full suite verification

**Step 1: Run the full suite**
```bash
npx playwright test --project=anonymous --project=authenticated --project=admin
```

**Step 2: Check the report**
```bash
npx playwright show-report
```

**Step 3: Clean up any orphaned test data**

If the submit tests were aborted mid-run, "Test Hike E2E" or "Test Camping Site E2E" may linger as pending submissions. Use the admin moderation UI at `/admin/moderation` to reject and delete them, or via the API:
```bash
curl http://localhost:5173/api/hikes?status=pending&limit=100
curl -X DELETE http://localhost:5173/api/hikes/<id>
curl http://localhost:5173/api/camping-sites?status=pending&limit=100
curl -X DELETE http://localhost:5173/api/camping-sites/<id>
```
