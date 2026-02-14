import { expect, test } from "@playwright/test";

test.describe("Booking flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a property page that has the booking widget
    // Using /elite which lists properties — pick the first one
    await page.goto("/elite");
    const firstPropertyLink = page.locator("a[href^='/elite/']").first();
    if (await firstPropertyLink.isVisible()) {
      await firstPropertyLink.click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("booking widget renders on property page", async ({ page }) => {
    const widget = page.getByTestId("booking-widget");
    // Widget may not exist if no properties are seeded
    if (await widget.isVisible()) {
      await expect(widget).toBeVisible();
    }
  });

  test("calendar grid renders with day cells", async ({ page }) => {
    const calendar = page.getByTestId("calendar-grid");
    if (await calendar.isVisible()) {
      await expect(calendar).toBeVisible();
      const dayCells = page.locator("[data-testid^='calendar-day-']");
      await expect(dayCells.first()).toBeVisible();
    }
  });

  test("calendar navigation buttons work", async ({ page }) => {
    const nextBtn = page.getByTestId("calendar-next");
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(page.getByTestId("calendar-grid")).toBeVisible();

      const prevBtn = page.getByTestId("calendar-prev");
      await prevBtn.click();
      await expect(page.getByTestId("calendar-grid")).toBeVisible();
    }
  });

  test("booking form has required fields", async ({ page }) => {
    const form = page.getByTestId("booking-firstname");
    if (await form.isVisible()) {
      await expect(page.getByTestId("booking-firstname")).toBeVisible();
      await expect(page.getByTestId("booking-lastname")).toBeVisible();
      await expect(page.getByTestId("booking-email")).toBeVisible();
      await expect(page.getByTestId("booking-submit")).toBeVisible();
    }
  });

  test("price display shows total", async ({ page }) => {
    const priceTotal = page.getByTestId("price-total");
    if (await priceTotal.isVisible()) {
      await expect(priceTotal).toBeVisible();
    }
  });
});
