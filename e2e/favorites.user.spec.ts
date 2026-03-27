import { test, expect } from '@playwright/test';
import { getHikeId } from './fixtures/helpers';

test.describe('Favorites – authenticated user', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the hike is NOT favorited before each test by removing via API
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    // Wait for the page to settle and FavoriteButton to load its state
    await page.waitForLoadState('networkidle');

    // If currently favorited, unfavorite it so tests start from a clean state
    const btn = page.getByRole('button', { name: 'Remove from favorites' });
    if (await btn.isVisible()) {
      await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/favorites') && r.status() < 300),
        btn.click(),
      ]);
      await page.waitForLoadState('networkidle');
    }
  });

  test('toggles a hike as favorite from the detail page', async ({ page }) => {
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('networkidle');

    // Should start unfavorited
    const addBtn = page.getByRole('button', { name: 'Add to favorites' });
    await expect(addBtn).toBeVisible();

    // Click to favorite
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/favorites') && r.status() < 300),
      addBtn.click(),
    ]);

    // Button label should now indicate it is a favorite
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();
  });

  test('favorited hike appears on the /favorites page', async ({ page }) => {
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('networkidle');

    // Add to favorites
    const addBtn = page.getByRole('button', { name: 'Add to favorites' });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/favorites') && r.status() < 300),
      addBtn.click(),
    ]);

    // Navigate to the favorites page
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // The "Favorite Hikes" section should contain at least one hike card linking to our hike
    await expect(page.locator(`a[href="/hikes/${hikeId}"]`).first()).toBeVisible();
  });

  test('removes the hike from favorites from the detail page', async ({ page }) => {
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState('networkidle');

    // First, add to favorites
    const addBtn = page.getByRole('button', { name: 'Add to favorites' });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/favorites') && r.status() < 300),
      addBtn.click(),
    ]);
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Now remove from favorites
    const removeBtn = page.getByRole('button', { name: 'Remove from favorites' });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/favorites') && r.status() < 300),
      removeBtn.click(),
    ]);

    // Button label should revert to "Add to favorites"
    await expect(page.getByRole('button', { name: 'Add to favorites' })).toBeVisible();
  });
});
