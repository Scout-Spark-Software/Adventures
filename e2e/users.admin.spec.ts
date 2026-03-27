import { test, expect } from "@playwright/test";

test.describe("Users management", () => {
  test("admin can view the users page", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.locator("h1")).toHaveText("Users");
    // The page should list at least one user
    await expect(page.locator("table tbody tr, .sm\\:hidden > div").first()).toBeVisible();
  });

  test("admin email is visible in the user list", async ({ page }) => {
    await page.goto("/admin/users");

    // The admin's own row shows a badge rather than a select, but the email is
    // always rendered in the Email column (desktop table) or mobile card.
    // We just verify that at least one email-looking string is on the page.
    const emailCell = page.locator("td").filter({ hasText: /@/ }).first();
    await expect(emailCell).toBeVisible();
  });
});
