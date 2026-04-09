import { test, expect } from "./fixtures/base-test";

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

    // Switch to Security tab.
    // Use dispatchEvent to bypass Playwright 1.58's ARIA actionability check that
    // refuses to click role="tab" elements with aria-selected="false".
    await page.locator('#tab-security').dispatchEvent('click');
    await expect(page.locator('#newPassword')).toBeVisible();

    await page.fill("#newPassword", "NewPassword123!");
    await page.fill("#confirmPassword", "DifferentPassword456!");

    // Message appears reactively as soon as confirm password is filled in with a mismatch
    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("too-short/weak password shows error message", async ({ page }) => {
    await page.goto("/profile");

    // Switch to Security tab — see comment above about dispatchEvent
    await page.locator('#tab-security').dispatchEvent('click');
    await expect(page.locator('#newPassword')).toBeVisible();

    await page.fill("#newPassword", "short1A");

    // Message appears reactively as soon as the password is too short
    await expect(page.locator("text=10+ characters required")).toBeVisible();
  });
});
