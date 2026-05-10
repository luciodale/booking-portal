import { expect, test } from "@e2e/fixtures/base";
import type { Page } from "@playwright/test";

const MOCK_PROPERTIES = {
  success: true,
  data: {
    properties: [
      {
        id: "prop-test-1",
        smoobuPropertyId: 11111,
        title: "Test Villa Rome",
        shortDescription: "A beautiful villa in Rome",
        city: "Rome",
        country: "Italy",
        tier: "elite",
        status: "published",
        maxOccupancy: 6,
        bedrooms: 3,
        bathrooms: 2,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        primaryImageUrl: undefined,
      },
      {
        id: "prop-test-2",
        smoobuPropertyId: 22222,
        title: "Test Apartment Milan",
        shortDescription: "Modern apartment in Milan",
        city: "Milan",
        country: "Italy",
        tier: "premium",
        status: "draft",
        maxOccupancy: 4,
        bedrooms: 2,
        bathrooms: 1,
        createdAt: "2025-02-01T00:00:00.000Z",
        updatedAt: "2025-02-01T00:00:00.000Z",
        primaryImageUrl: undefined,
      },
    ],
    total: 2,
  },
};

async function mockBackofficeApis(page: Page) {
  await page.route("**/api/backoffice/properties*", (route) => {
    if (route.request().method() === "GET") {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search");

      if (search) {
        const filtered = MOCK_PROPERTIES.data.properties.filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.city.toLowerCase().includes(search.toLowerCase())
        );
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { properties: filtered, total: filtered.length },
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_PROPERTIES),
        });
      }
    } else {
      route.continue();
    }
  });

  await page.route("**/api/backoffice/connect/status", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        hasAccount: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      }),
    });
  });

  await page.route("**/api/backoffice/integrations", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            integration: {
              provider: "smoobu",
              apiKey: "test-key",
              pmsUserId: 99999,
            },
          },
        }),
      });
    } else {
      route.continue();
    }
  });
}

test.describe("Backoffice property management", () => {
  test("properties list renders with mocked data", async ({
    authenticatedPage,
  }) => {
    await mockBackofficeApis(authenticatedPage);
    await authenticatedPage.goto("/backoffice/properties");

    await expect(
      authenticatedPage.getByTestId("property-row-prop-test-1")
    ).toBeVisible({ timeout: 10000 });
    await expect(
      authenticatedPage.getByTestId("property-row-prop-test-2")
    ).toBeVisible();

    await expect(
      authenticatedPage.getByTestId("property-row-prop-test-1")
    ).toContainText("Test Villa Rome");
    await expect(
      authenticatedPage.getByTestId("property-row-prop-test-2")
    ).toContainText("Test Apartment Milan");
  });

  test("search filters properties", async ({ authenticatedPage }) => {
    await mockBackofficeApis(authenticatedPage);
    await authenticatedPage.goto("/backoffice/properties");

    await expect(
      authenticatedPage.getByTestId("property-row-prop-test-1")
    ).toBeVisible({ timeout: 10000 });

    const searchInput = authenticatedPage.getByTestId("property-search");
    await searchInput.fill("Rome");

    await authenticatedPage.waitForTimeout(500);

    await expect(
      authenticatedPage.getByTestId("property-row-prop-test-1")
    ).toBeVisible({ timeout: 5000 });
  });

  test("create property button navigates to create page", async ({
    authenticatedPage,
  }) => {
    await mockBackofficeApis(authenticatedPage);
    await authenticatedPage.goto("/backoffice/properties");

    const createBtn = authenticatedPage.getByTestId("property-create");
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.click();

    await authenticatedPage.waitForURL("**/create/properties/new", {
      timeout: 5000,
    });
    expect(authenticatedPage.url()).toContain("/create/properties/new");
  });

  test("property row shows correct tier badge", async ({
    authenticatedPage,
  }) => {
    await mockBackofficeApis(authenticatedPage);
    await authenticatedPage.goto("/backoffice/properties");

    const eliteRow = authenticatedPage.getByTestId("property-row-prop-test-1");
    await expect(eliteRow).toBeVisible({ timeout: 10000 });
    await expect(eliteRow).toContainText("elite");

    const premiumRow = authenticatedPage.getByTestId(
      "property-row-prop-test-2"
    );
    await expect(premiumRow).toContainText("premium");
  });

  test("property row shows correct status", async ({
    authenticatedPage,
  }) => {
    await mockBackofficeApis(authenticatedPage);
    await authenticatedPage.goto("/backoffice/properties");

    const publishedRow = authenticatedPage.getByTestId(
      "property-row-prop-test-1"
    );
    await expect(publishedRow).toBeVisible({ timeout: 10000 });
    await expect(publishedRow).toContainText("published");

    const draftRow = authenticatedPage.getByTestId("property-row-prop-test-2");
    await expect(draftRow).toContainText("draft");
  });

  test("empty state shows when no properties", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.route("**/api/backoffice/properties*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { properties: [], total: 0 },
          }),
        });
      } else {
        route.continue();
      }
    });
    await authenticatedPage.route("**/api/backoffice/connect/status", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hasAccount: true,
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
        }),
      });
    });
    await authenticatedPage.route("**/api/backoffice/integrations", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { integration: null },
          }),
        });
      } else {
        route.continue();
      }
    });

    await authenticatedPage.goto("/backoffice/properties");

    await expect(
      authenticatedPage.getByText("No properties found")
    ).toBeVisible({ timeout: 10000 });
  });

  test("navigation sidebar has properties link", async ({
    authenticatedPage,
  }) => {
    await mockBackofficeApis(authenticatedPage);
    await authenticatedPage.goto("/backoffice");
    await authenticatedPage.waitForLoadState("networkidle");

    const propertiesNav = authenticatedPage.getByTestId("nav-properties");
    await expect(propertiesNav).toBeAttached({ timeout: 10000 });
  });
});
