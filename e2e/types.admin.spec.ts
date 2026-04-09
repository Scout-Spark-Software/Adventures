import { test, expect } from "./fixtures/base-test";
import { request as baseRequest } from "@playwright/test";

const TEST_AMENITY_NAME = "Test Amenity E2E Playwright";
const TEST_AMENITY_KEY = "testAmenityE2EPlaywright";

test.describe("Type management", () => {
  test.beforeAll(async () => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    const adminContext = await baseRequest.newContext({
      baseURL,
      storageState: 'e2e/.auth/admin.json',
    });

    try {
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

  test("admin can view the types management page", async ({ page }) => {
    await page.goto("/admin/types");
    await expect(page.locator("h1")).toHaveText("Manage Types");
    // Tab buttons should be visible
    await expect(page.locator("button:has-text('Hike Features')")).toBeVisible();
    await expect(page.locator("button:has-text('Camping Amenities')")).toBeVisible();
    await expect(page.locator("button:has-text('Camping Facilities')")).toBeVisible();
  });

  test("admin can add a new amenity type", async ({ page }) => {
    await page.goto("/admin/types");

    // Switch to Camping Amenities tab
    await page.click("button:has-text('Camping Amenities')");

    // Click Add New
    await page.click('button:has-text("Add New")');

    // The form panel should appear — fill in name and key (required for amenities)
    await page.fill("#name", TEST_AMENITY_NAME);
    await page.fill("#key", TEST_AMENITY_KEY);

    // Save — wait for the POST to complete before asserting
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/amenity-types') && r.request().method() === 'POST'),
      page.click('button:has-text("Save")'),
    ]);

    // The new item should appear in the list
    await expect(page.locator(`text=${TEST_AMENITY_NAME}`)).toBeVisible();
  });

  test("admin can delete the test amenity type", async ({ page }) => {
    await page.goto("/admin/types");

    // Switch to Camping Amenities tab
    await page.click("button:has-text('Camping Amenities')");

    // Find the row containing the test amenity name
    const itemRow = page.locator(".divide-y > div").filter({ hasText: TEST_AMENITY_NAME });

    // Guard: if the item doesn't exist (e.g. prior test didn't run), skip
    if (!(await itemRow.isVisible())) {
      return;
    }

    // Accept the confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Click the delete (Trash2) button within that row
    await itemRow.locator('button[title="Delete"]').click();

    // The item should no longer be in the list
    await expect(page.locator(`text=${TEST_AMENITY_NAME}`)).not.toBeVisible();
  });
});
