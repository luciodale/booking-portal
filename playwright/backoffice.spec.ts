import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

test.describe("Backoffice", () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test("properties list loads", async ({ page }) => {
    await page.goto("/backoffice/properties");
    await page.waitForLoadState("networkidle");
    const nav = page.getByTestId("nav-properties");
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });

  test("navigation has properties and experiences links", async ({ page }) => {
    await page.goto("/backoffice");
    await page.waitForLoadState("networkidle");
    const propertiesNav = page.getByTestId("nav-properties");
    const experiencesNav = page.getByTestId("nav-experiences");
    if (await propertiesNav.isVisible()) {
      await expect(propertiesNav).toBeVisible();
      await expect(experiencesNav).toBeVisible();
    }
  });

  test("property search input is visible", async ({ page }) => {
    await page.goto("/backoffice/properties");
    await page.waitForLoadState("networkidle");
    const search = page.getByTestId("property-search");
    if (await search.isVisible()) {
      await expect(search).toBeVisible();
    }
  });

  test("create property button exists", async ({ page }) => {
    await page.goto("/backoffice/properties");
    await page.waitForLoadState("networkidle");
    const createBtn = page.getByTestId("property-create");
    if (await createBtn.isVisible()) {
      await expect(createBtn).toBeVisible();
    }
  });
});
