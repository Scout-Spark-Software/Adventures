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

  test("Security tab shows Send Password Reset Email button", async ({ page }) => {
    await page.goto("/profile");

    // Switch to Security tab
    await page.click("button:has-text('Security')");

    const resetButton = page.getByRole("button", { name: "Send Password Reset Email" });
    await expect(resetButton).toBeVisible();
  });

  test("clicking Send Password Reset Email shows success message", async ({ page }) => {
    await page.goto("/profile");

    // Switch to Security tab
    await page.click("button:has-text('Security')");

    await page.click('button:has-text("Send Password Reset Email")');

    // Success banner should appear
    await expect(
      page.getByText("Password reset email sent! Check your inbox for a link to set a new password.")
    ).toBeVisible();
  });
});
