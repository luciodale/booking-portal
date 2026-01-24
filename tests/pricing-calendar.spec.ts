/**
 * Playwright UI Tests - Pricing Calendar
 */

import { expect, test } from "@playwright/test";

test.describe("Pricing Calendar", () => {
  test.skip("should display calendar with view mode toggles", async ({
    page,
  }) => {
    // Skipped because it requires existing property

    await page.goto("/backoffice/properties/test-id/pricing");

    // Check for heading
    await expect(
      page.getByRole("heading", { name: "Pricing Management" })
    ).toBeVisible();

    // Check for view mode buttons
    await expect(page.getByRole("button", { name: "Week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Month" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Year" })).toBeVisible();
  });

  test.skip("should switch between view modes", async ({ page }) => {
    await page.goto("/backoffice/properties/test-id/pricing");

    // Click month view
    await page.click('button:has-text("Month")');
    await expect(page.locator('button:has-text("Month")')).toHaveClass(
      /bg-blue-600/
    );

    // Click year view
    await page.click('button:has-text("Year")');
    await expect(page.locator('button:has-text("Year")')).toHaveClass(
      /bg-blue-600/
    );

    // Click week view
    await page.click('button:has-text("Week")');
    await expect(page.locator('button:has-text("Week")')).toHaveClass(
      /bg-blue-600/
    );
  });

  test.skip("should select date range and set price", async ({ page }) => {
    await page.goto("/backoffice/properties/test-id/pricing");

    // Note: Actual date selection depends on react-day-picker implementation
    // This is a structural example

    // Select start date (would need to find specific date cell)
    // await page.click('[data-day="2024-12-01"]');

    // Select end date
    // await page.click('[data-day="2024-12-07"]');

    // Enter price
    await page.fill('input[placeholder*="250000"]', "300000");

    // Optionally enter label
    await page.fill('input[placeholder*="Summer Season"]', "Holiday Week");

    // Save period
    await page.click('button:has-text("Save Period")');

    // Should show success or new period in list
    await page.waitForTimeout(1000);
  });

  test.skip("should display existing pricing periods", async ({ page }) => {
    await page.goto("/backoffice/properties/test-id/pricing");

    // Should show "Existing Pricing Periods" section
    await expect(page.getByText("Existing Pricing Periods")).toBeVisible();

    // Note: Actual periods depend on database state
  });

  test.skip("should delete pricing period", async ({ page }) => {
    await page.goto("/backoffice/properties/test-id/pricing");

    // Click delete button on first period
    await page.locator('button:has-text("Delete")').first().click();

    // Period should be removed
    await page.waitForTimeout(500);
  });
});

/**
 * NOTE: These pricing calendar tests are skipped by default because they require:
 * 1. An existing property in the database
 * 2. Proper routing to the pricing page
 * 3. Understanding of react-day-picker's DOM structure
 *
 * To make these tests work:
 * 1. Create a test property with a known ID
 * 2. Update the test URLs to use that ID
 * 3. Add proper selectors for date picker elements
 * 4. Remove .skip() from tests
 */
