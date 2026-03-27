import { test, expect } from "@playwright/test";

test.describe("Featured management", () => {
  test("admin can view the featured management page", async ({ page }) => {
    await page.goto("/admin/featured");
    await expect(page.locator("h1")).toHaveText("Manage Featured Items");
    // Section headings for content types should be present
    await expect(page.locator("h2").filter({ hasText: "Hikes" })).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: "Camping Sites" })).toBeVisible();
  });

  test("admin can toggle a featured status if items exist", async ({ page }) => {
    await page.goto("/admin/featured");

    // Look for any Feature or Remove button in the hikes table
    const toggleButton = page
      .locator('table button:has-text("Feature"), table button:has-text("Remove")')
      .first();

    if (!(await toggleButton.isVisible())) {
      // No approved hikes or camping sites available to toggle
      return;
    }

    // Accept any browser confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    await toggleButton.click();

    // Page should remain functional after toggle
    await expect(page.locator("h1")).toHaveText("Manage Featured Items");
  });
});
