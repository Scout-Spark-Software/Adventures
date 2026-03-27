import { test, expect } from "@playwright/test";

// requireAdmin() calls requireAuth() first, then checks user.role === "admin".
// If the authenticated user is not an admin, it throws redirect(302, "/").
// So a regular authenticated user hitting any /admin/* route is redirected to "/".

test.describe("Admin access control for regular users", () => {
  test("non-admin is redirected away from /admin", async ({ page }) => {
    await page.goto("/admin");
    // Should be redirected to homepage, not shown the admin dashboard
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page).toHaveURL("/");
  });

  test("non-admin is redirected away from /admin/moderation", async ({ page }) => {
    await page.goto("/admin/moderation");
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page).toHaveURL("/");
  });

  test("non-admin is redirected away from /admin/users", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page).toHaveURL("/");
  });
});
