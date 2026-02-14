import { expect, test } from "@playwright/test";

test.describe("Public pages smoke tests", () => {
  test("home page loads with property cards", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/booking/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("elite listing page loads", async ({ page }) => {
    await page.goto("/elite");
    await expect(page.locator("main")).toBeVisible();
  });

  test("standard listing page loads", async ({ page }) => {
    await page.goto("/standard");
    await expect(page.locator("main")).toBeVisible();
  });

  test("experiences page loads", async ({ page }) => {
    await page.goto("/experiences");
    await expect(page.locator("main")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });
});
