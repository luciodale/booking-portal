import { expect, test } from "@e2e/fixtures/base";
import type { Locator, Page } from "@playwright/test";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function buildRates(smoobuId: string, startDate: string, endDate: string) {
  const rates: Record<
    string,
    { price: number; min_length_of_stay: number; available: number }
  > = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    rates[d.toISOString().slice(0, 10)] = {
      price: 150,
      min_length_of_stay: 1,
      available: 1,
    };
  }
  return { data: { data: { [smoobuId]: rates } }, currency: "EUR" };
}

function buildAvailable(smoobuId: number) {
  return {
    data: {
      availableApartments: [smoobuId],
      prices: {},
      errorMessages: {},
    },
  };
}

async function setupMocks(page: Page, smoobuId: string) {
  const numId = Number(smoobuId);

  await page.route("**/api/properties/*/rates*", (route) => {
    const url = new URL(route.request().url());
    const startDate = url.searchParams.get("startDate") ?? futureDate(0);
    const endDate = url.searchParams.get("endDate") ?? futureDate(60);
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildRates(smoobuId, startDate, endDate)),
    });
  });

  await page.route("**/api/properties/*/availability", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildAvailable(numId)),
    });
  });
}

async function discoverPropertyHref(page: Page): Promise<string> {
  await page.goto("/elite");
  await page.waitForLoadState("networkidle");

  const cityLink = page.locator("a[href*='/elite?city=']").first();
  if (!(await cityLink.isVisible({ timeout: 10000 }).catch(() => false))) {
    return "";
  }
  await cityLink.click();
  await page.waitForLoadState("networkidle");

  const propertyLink = page.locator("a[href*='/elite/']").first();
  if (!(await propertyLink.isVisible({ timeout: 10000 }).catch(() => false))) {
    return "";
  }
  return (await propertyLink.getAttribute("href")) ?? "";
}

async function getSmoobuId(page: Page): Promise<string> {
  const html = await page.content();
  const match = html.match(
    /smoobuPropertyId(?:&quot;|["':=\s])*(?:\[0,\s*)?(\d+)/
  );
  return match?.[1] ?? "0";
}

function getWidget(page: Page): Locator {
  return page.getByTestId("booking-widget-desktop");
}

test.describe("Booking flow", () => {
  test("property page loads with booking widget", async ({ page }) => {
    const href = await discoverPropertyHref(page);
    test.skip(!href, "No properties in local DB");

    await page.goto(href);
    const smoobuId = await getSmoobuId(page);
    await setupMocks(page, smoobuId);

    await expect(getWidget(page)).toBeVisible({ timeout: 15000 });
  });

  test("calendar opens and allows date selection", async ({ page }) => {
    const href = await discoverPropertyHref(page);
    test.skip(!href, "No properties in local DB");

    await page.goto(href);
    const smoobuId = await getSmoobuId(page);
    await setupMocks(page, smoobuId);

    const widget = getWidget(page);
    await expect(widget).toBeVisible({ timeout: 15000 });

    const calendarTrigger = widget.locator("button").first();
    await calendarTrigger.click();

    // Calendar renders in a FloatingPortal, so it's outside the widget DOM
    const grid = page.getByTestId("calendar-grid").last();
    await expect(grid).toBeVisible({ timeout: 5000 });

    await page.getByTestId("calendar-next").last().click();
    await expect(grid).toBeVisible();
  });

  test("selecting check-in and check-out triggers availability check", async ({
    page,
  }) => {
    let availabilityHit = false;

    const href = await discoverPropertyHref(page);
    test.skip(!href, "No properties in local DB");

    await page.goto(href);
    const smoobuId = await getSmoobuId(page);
    const numId = Number(smoobuId);

    await page.route("**/api/properties/*/rates*", (route) => {
      const url = new URL(route.request().url());
      const startDate = url.searchParams.get("startDate") ?? futureDate(0);
      const endDate = url.searchParams.get("endDate") ?? futureDate(60);
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildRates(smoobuId, startDate, endDate)),
      });
    });

    await page.route("**/api/properties/*/availability", (route) => {
      availabilityHit = true;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAvailable(numId)),
      });
    });

    const widget = getWidget(page);
    await expect(widget).toBeVisible({ timeout: 15000 });

    const calendarTrigger = widget.locator("button").first();
    await calendarTrigger.click();
    await expect(page.getByTestId("calendar-grid").last()).toBeVisible({
      timeout: 5000,
    });

    await page.getByTestId("calendar-next").last().click();
    await page.getByTestId("calendar-next").last().click();

    const dayCells = page.locator("[data-testid^='calendar-day-']");
    const availableDays = await dayCells.all();
    if (availableDays.length >= 5) {
      await availableDays[2].click();
      await availableDays[4].click();
      await page.waitForTimeout(1000);
      expect(availabilityHit).toBe(true);
    }
  });

  test("guest form appears after date selection via URL params", async ({
    page,
  }) => {
    const checkIn = futureDate(60);
    const checkOut = futureDate(63);

    const href = await discoverPropertyHref(page);
    test.skip(!href, "No properties in local DB");

    await page.goto(href);
    const smoobuId = await getSmoobuId(page);
    await setupMocks(page, smoobuId);
    await page.goto(`${href}?checkIn=${checkIn}&checkOut=${checkOut}`);

    const widget = getWidget(page);
    await expect(widget).toBeVisible({ timeout: 15000 });

    await expect(widget.getByTestId("booking-firstname")).toBeVisible({
      timeout: 15000,
    });
    await expect(widget.getByTestId("booking-lastname")).toBeVisible();
    await expect(widget.getByTestId("booking-email")).toBeVisible();
    await expect(widget.getByTestId("booking-submit")).toBeVisible();

    await widget.getByTestId("booking-submit").click();

    const validationErrors = widget.locator(".text-red-400");
    await expect(validationErrors.first()).toBeVisible({ timeout: 3000 });
  });

  test("successful checkout posts correct payload", async ({
    authenticatedPage,
  }) => {
    const checkIn = futureDate(60);
    const checkOut = futureDate(63);

    const href = await discoverPropertyHref(authenticatedPage);
    test.skip(!href, "No properties in local DB");

    await authenticatedPage.goto(href);
    const smoobuId = await getSmoobuId(authenticatedPage);
    await setupMocks(authenticatedPage, smoobuId);

    await authenticatedPage.route("**/api/checkout", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://checkout.stripe.com/test_session_123",
        }),
      });
    });

    await authenticatedPage.goto(
      `${href}?checkIn=${checkIn}&checkOut=${checkOut}`
    );

    const widget = getWidget(authenticatedPage);
    await expect(widget).toBeVisible({ timeout: 15000 });
    await expect(widget.getByTestId("booking-firstname")).toBeVisible({
      timeout: 15000,
    });

    await widget.getByTestId("booking-firstname").fill("John");
    await widget.getByTestId("booking-lastname").fill("Doe");
    await widget.getByTestId("booking-email").fill("john@test.com");

    const [request] = await Promise.all([
      authenticatedPage.waitForRequest("**/api/checkout"),
      widget.getByTestId("booking-submit").click(),
    ]);

    const body = JSON.parse(request.postData() ?? "{}");
    expect(body.checkIn).toBe(checkIn);
    expect(body.checkOut).toBe(checkOut);
    expect(body.guestInfo.firstName).toBe("John");
  });

  test("checkout API error shows toast", async ({ authenticatedPage }) => {
    const checkIn = futureDate(60);
    const checkOut = futureDate(63);

    const href = await discoverPropertyHref(authenticatedPage);
    test.skip(!href, "No properties in local DB");

    await authenticatedPage.goto(href);
    const smoobuId = await getSmoobuId(authenticatedPage);
    await setupMocks(authenticatedPage, smoobuId);

    await authenticatedPage.route("**/api/checkout", (route) => {
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: "Dates no longer available" }),
      });
    });

    await authenticatedPage.goto(
      `${href}?checkIn=${checkIn}&checkOut=${checkOut}`
    );

    const widget = getWidget(authenticatedPage);
    await expect(widget).toBeVisible({ timeout: 15000 });
    await expect(widget.getByTestId("booking-firstname")).toBeVisible({
      timeout: 15000,
    });

    await widget.getByTestId("booking-firstname").fill("John");
    await widget.getByTestId("booking-lastname").fill("Doe");
    await widget.getByTestId("booking-email").fill("john@test.com");
    await widget.getByTestId("booking-submit").click();

    const toast = authenticatedPage.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).toContainText("Dates no longer available");
  });

  test("price display shows total when dates are selected via URL", async ({
    page,
  }) => {
    const checkIn = futureDate(60);
    const checkOut = futureDate(63);

    const href = await discoverPropertyHref(page);
    test.skip(!href, "No properties in local DB");

    await page.goto(href);
    const smoobuId = await getSmoobuId(page);
    await setupMocks(page, smoobuId);
    await page.goto(`${href}?checkIn=${checkIn}&checkOut=${checkOut}`);

    const widget = getWidget(page);
    await expect(widget).toBeVisible({ timeout: 15000 });

    const priceTotal = widget.getByTestId("price-total");
    await expect(priceTotal).toBeVisible({ timeout: 15000 });
    await expect(priceTotal).not.toBeEmpty();
  });
});
