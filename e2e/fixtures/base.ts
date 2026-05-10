import { authenticateWithClerk } from "@e2e/helpers/clerk";
import { type Page, test as base } from "@playwright/test";

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await authenticateWithClerk(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
