import { test, expect } from "@playwright/test";

test.describe("Profile page", () => {
  test("profile page loads with a heading", async ({ page }) => {
    await page.goto("/profile");
    // The heading is the user's display name rendered in the banner
    // The page title is always set
    await expect(page).toHaveTitle(/Profile — Adventure Spark/);
    // Banner h1 with display name should be visible
    const banner = page.locator(".profile-banner h1");
    await expect(banner).toBeVisible();
  });

  test("saving scout unit number shows success message", async ({ page }) => {
    await page.goto("/profile");

    // Fill in unit number and submit
    await page.fill("#unitNumber", "42");
    await page.click('button[type="submit"]:has-text("Save Unit Info")');

    // Should show success message
    await expect(page.locator("text=Unit info saved!")).toBeVisible();
  });

  test("mismatched passwords shows error message", async ({ page }) => {
    await page.goto("/profile");

    // Switch to Security tab
    await page.click("button:has-text('Security')");

    await page.fill("#currentPassword", "SomeCurrentPassword1");
    await page.fill("#newPassword", "NewPassword123!");
    await page.fill("#confirmPassword", "DifferentPassword456!");

    await page.click('button[type="submit"]:has-text("Update Password")');

    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("too-short/weak password shows error message", async ({ page }) => {
    await page.goto("/profile");

    // Switch to Security tab
    await page.click("button:has-text('Security')");

    await page.fill("#currentPassword", "SomeCurrentPassword1");
    await page.fill("#newPassword", "short1A");
    await page.fill("#confirmPassword", "short1A");

    await page.click('button[type="submit"]:has-text("Update Password")');

    // Should show length or complexity error
    await expect(page.locator("text=12+ characters required")).toBeVisible();
  });
});
