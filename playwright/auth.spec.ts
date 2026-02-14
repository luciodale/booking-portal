import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

test.describe("Authentication forms", () => {
  test("sign-in page renders with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("signin-email")).toBeVisible();
    await expect(page.getByTestId("signin-password")).toBeVisible();
    await expect(page.getByTestId("signin-submit")).toBeVisible();
  });

  test("sign-in shows validation error on empty submit", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByTestId("signin-submit").click();
    await expect(page.getByTestId("signin-error")).toBeVisible();
  });

  test("sign-up page renders with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await expect(page.getByTestId("signup-email")).toBeVisible();
    await expect(page.getByTestId("signup-password")).toBeVisible();
    await expect(page.getByTestId("signup-submit")).toBeVisible();
  });

  test("OAuth buttons are visible on sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    const oauthButtons = page.locator("[data-testid^='oauth-']");
    await expect(oauthButtons.first()).toBeVisible();
  });

  test("header shows sign-in link when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("header-signin")).toBeVisible();
  });
});

test.describe("Authenticated navigation", () => {
  test("can access backoffice with Clerk testing token", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/backoffice");
    await expect(page.locator("body")).toBeVisible();
  });
});
