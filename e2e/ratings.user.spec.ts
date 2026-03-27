import { test, expect } from '@playwright/test';
import { getHikeId } from './fixtures/helpers';

/**
 * Ratings are upsert — submitting a second rating on the same hike just updates it.
 * Each test navigates to the Reviews tab and interacts with the UserRatingCard component.
 */

test.describe('Ratings – authenticated user', () => {
  test.beforeEach(async ({ page }) => {
    // Delete any existing rating so each test starts from a fresh state
    const hikeId = getHikeId();
    // Use the API directly to clean up
    await page.goto(`/hikes/${hikeId}#reviews`);
    await page.waitForLoadState('networkidle');

    // Click the Reviews tab to ensure the component is mounted
    await page.getByRole('button', { name: 'Reviews' }).click();
    await page.waitForLoadState('networkidle');

    // If there is an existing rating, delete it
    const deleteRatingBtn = page.getByRole('button', { name: 'Delete' }).filter({ hasText: 'Delete' }).first();
    // Look specifically inside the "Your Rating" card
    const yourRatingCard = page.locator('.bg-indigo-50');
    const deleteBtn = yourRatingCard.getByRole('button', { name: 'Delete' });
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();
      // Confirm the delete modal
      const confirmModal = page.locator('.fixed.inset-0').filter({ hasText: 'Delete Rating?' });
      await confirmModal.getByRole('button', { name: 'Delete' }).click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('submits a star-only rating on a hike', async ({ page }) => {
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('networkidle');

    // Click the Reviews tab
    await page.getByRole('button', { name: 'Reviews' }).click();
    await page.waitForLoadState('networkidle');

    // The UserRatingCard should be in edit mode (no existing rating)
    const yourRatingCard = page.locator('.bg-indigo-50');
    await expect(yourRatingCard).toBeVisible();

    // Click the 4th star (full 4 stars) — aria-label="Rate 4 stars"
    await page.getByRole('button', { name: 'Rate 4 stars' }).click();

    // Submit the rating
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/ratings') && r.request().method() === 'POST'),
      yourRatingCard.getByRole('button', { name: 'Submit Rating' }).click(),
    ]);

    // After saving, the card should show view mode (Edit / Delete buttons appear)
    await expect(yourRatingCard.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 5000 });
  });

  test('submits a rating with review text', async ({ page }) => {
    const hikeId = getHikeId();
    const reviewText = 'Great trail, highly recommended for scouts!';

    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('networkidle');

    // Click the Reviews tab
    await page.getByRole('button', { name: 'Reviews' }).click();
    await page.waitForLoadState('networkidle');

    const yourRatingCard = page.locator('.bg-indigo-50');
    await expect(yourRatingCard).toBeVisible();

    // Select 5 stars
    await page.getByRole('button', { name: 'Rate 5 stars' }).click();

    // Fill in review text
    await yourRatingCard.locator('textarea#review-text').fill(reviewText);

    // Submit
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/ratings') && r.request().method() === 'POST'),
      yourRatingCard.getByRole('button', { name: 'Submit Rating' }).click(),
    ]);

    // View mode should be visible
    await expect(yourRatingCard.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 5000 });
  });

  test('submitted review text appears in the reviews list', async ({ page }) => {
    const hikeId = getHikeId();
    const reviewText = 'Wonderful hike, beautiful views all around!';

    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('networkidle');

    // Click the Reviews tab
    await page.getByRole('button', { name: 'Reviews' }).click();
    await page.waitForLoadState('networkidle');

    const yourRatingCard = page.locator('.bg-indigo-50');

    // Select 4 stars and add review
    await page.getByRole('button', { name: 'Rate 4 stars' }).click();
    await yourRatingCard.locator('textarea#review-text').fill(reviewText);

    // Submit and wait for the reviews list to reload
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/ratings') && r.request().method() === 'POST'),
      yourRatingCard.getByRole('button', { name: 'Submit Rating' }).click(),
    ]);

    // Wait for the reviews section to refresh (ReviewsTab re-fetches after saved event)
    await page.waitForLoadState('networkidle');

    // The review text should appear somewhere on the page (in the reviews list)
    await expect(page.getByText(reviewText)).toBeVisible({ timeout: 10000 });
  });
});
