import { expect, test } from "@e2e/fixtures/base";

test.describe("Authentication forms", () => {
  test("sign-in page renders with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("signin-email")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("signin-password")).toBeVisible();
    await expect(page.getByTestId("signin-submit")).toBeVisible();
  });

  test("sign-in shows error for invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByTestId("signin-email")).toBeVisible({
      timeout: 10000,
    });

    await page.getByTestId("signin-email").fill("nonexistent@test.com");
    await page.getByTestId("signin-password").fill("wrongpassword123");
    await page.getByTestId("signin-submit").click();

    await expect(page.getByTestId("signin-error")).toBeVisible({
      timeout: 10000,
    });
  });

  test("sign-up page renders with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await expect(page.getByTestId("signup-email")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("signup-password")).toBeVisible();
    await expect(page.getByTestId("signup-submit")).toBeVisible();
  });

  test("OAuth buttons are visible on sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    const oauthButtons = page.locator("[data-testid^='oauth-']");
    await expect(oauthButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test("header shows sign-in link when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("header-signin")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Authenticated access", () => {
  test("can access backoffice with Clerk testing token", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/backoffice");
    await expect(authenticatedPage.locator("body")).toBeVisible();
    expect(authenticatedPage.url()).toContain("/backoffice");
  });

  test("backoffice loads without redirect to sign-in", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/backoffice/properties");
    await authenticatedPage.waitForLoadState("networkidle");
    expect(authenticatedPage.url()).not.toContain("/sign-in");
  });
});
