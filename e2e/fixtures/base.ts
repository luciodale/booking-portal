import { test as base, type Page } from "@playwright/test";
import { authenticateWithClerk } from "@e2e/helpers/clerk";

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await authenticateWithClerk(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
