import { test, expect } from "./fixtures/base-test";
import { getHikeId, getCampingId } from "./fixtures/helpers";

function countFromLabel(label: string | null): number {
  const match = label?.match(/logged (\d+) time/);
  return match ? Number(match[1]) : 0;
}

test.describe("Trip completion log – authenticated user", () => {
  test("logs a hike as completed via the modal and increments the visible count", async ({
    page,
  }) => {
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState("load");

    const logBtn = page.getByRole("button", { name: /Log as completed/ });
    await expect(logBtn).toBeVisible();

    const initialCount = countFromLabel(await logBtn.getAttribute("aria-label"));

    await logBtn.click();
    await expect(page.getByRole("button", { name: "Log completion" })).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/completions") &&
          r.request().method() === "POST" &&
          r.status() < 300
      ),
      page.getByRole("button", { name: "Log completion" }).click(),
    ]);

    await expect(logBtn).toHaveAttribute(
      "aria-label",
      new RegExp(`logged ${initialCount + 1} time`)
    );
  });

  test("clicking the log button repeatedly creates independent entries, not a toggle", async ({
    page,
  }) => {
    const hikeId = getHikeId();
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState("load");

    const logBtn = page.getByRole("button", { name: /Log as completed/ });
    const initialCount = countFromLabel(await logBtn.getAttribute("aria-label"));

    for (let i = 1; i <= 2; i++) {
      await logBtn.click();
      await expect(page.getByRole("button", { name: "Log completion" })).toBeVisible();
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes("/api/completions") &&
            r.request().method() === "POST" &&
            r.status() < 300
        ),
        page.getByRole("button", { name: "Log completion" }).click(),
      ]);
      await expect(logBtn).toHaveAttribute(
        "aria-label",
        new RegExp(`logged ${initialCount + i} time`)
      );
    }
  });

  test("camping detail page requires nights before logging, and rejects out-of-range input", async ({
    page,
  }) => {
    const campingId = getCampingId();
    await page.goto(`/camping/${campingId}`);
    await page.waitForLoadState("load");

    const logBtn = page.getByRole("button", { name: /Log as completed/ });
    await logBtn.click();

    const nightsInput = page.locator("#nights-stayed");
    await expect(nightsInput).toBeVisible();

    // Out-of-range input is rejected client-side, no request fires
    await nightsInput.fill("0");
    await page.getByRole("button", { name: "Log completion" }).click();
    await expect(page.getByText("Enter a whole number of nights between 1 and 90")).toBeVisible();

    // Valid input succeeds and closes the modal
    await nightsInput.fill("3");
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/completions") &&
          r.request().method() === "POST" &&
          r.status() < 300
      ),
      page.getByRole("button", { name: "Log completion" }).click(),
    ]);
    await expect(nightsInput).not.toBeVisible();
  });

  test("logged completions appear in the My Adventures tab and can be deleted with confirmation", async ({
    page,
  }) => {
    const hikeId = getHikeId();

    // Log a completion to guarantee at least one history entry exists
    await page.goto(`/hikes/${hikeId}`);
    await page.waitForLoadState("load");
    const logBtn = page.getByRole("button", { name: /Log as completed/ });
    await logBtn.click();
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/completions") &&
          r.request().method() === "POST" &&
          r.status() < 300
      ),
      page.getByRole("button", { name: "Log completion" }).click(),
    ]);

    // Switch to the My Adventures tab on the profile page
    await page.goto("/profile");
    await page.waitForLoadState("load");
    await page.locator("#tab-adventures").dispatchEvent("click");

    await expect(page.getByText("Trips Logged")).toBeVisible();
    const deleteButtons = page.getByRole("button", { name: "Delete this completion" });
    await expect(deleteButtons.first()).toBeVisible();

    const historyCountBefore = await deleteButtons.count();

    // First click asks for confirmation, doesn't delete yet
    await deleteButtons.first().click();
    await expect(page.getByText("Remove and update totals?")).toBeVisible();

    // Confirm deletes it
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/completions/") && r.request().method() === "DELETE"
      ),
      page.getByRole("button", { name: "Confirm" }).click(),
    ]);

    await expect(page.getByRole("button", { name: "Delete this completion" })).toHaveCount(
      historyCountBefore - 1
    );
  });
});
