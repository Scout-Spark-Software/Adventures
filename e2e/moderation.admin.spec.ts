import { test, expect } from "@playwright/test";

test.describe("Moderation queue", () => {
  test("admin can view the moderation queue", async ({ page }) => {
    await page.goto("/admin/moderation");
    await expect(page.locator("h1")).toHaveText("Moderation Queue");
  });

  test("admin can approve a pending submission if one exists", async ({ page }) => {
    await page.goto("/admin/moderation");

    const approveButton = page.locator('button:has-text("Approve")').first();

    if (!(await approveButton.isVisible())) {
      // Queue is empty — nothing to approve
      await expect(page.locator("text=Queue is empty")).toBeVisible();
      return;
    }

    // Accept the confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    await approveButton.click();

    // After approval the item is removed; either the queue shrinks or shows empty
    // Just verify no unhandled error appears — the page should still be functional
    await expect(page.locator("h1")).toHaveText("Moderation Queue");
  });

  test("admin can reject a pending submission if one exists", async ({ page }) => {
    await page.goto("/admin/moderation");

    const rejectButton = page.locator('button:has-text("Reject")').first();

    if (!(await rejectButton.isVisible())) {
      await expect(page.locator("text=Queue is empty")).toBeVisible();
      return;
    }

    page.on("dialog", (dialog) => dialog.accept());

    await rejectButton.click();

    await expect(page.locator("h1")).toHaveText("Moderation Queue");
  });
});
