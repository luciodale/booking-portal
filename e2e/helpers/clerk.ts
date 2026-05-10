import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";

const TEST_USER_EMAIL = process.env.E2E_CLERK_USER_EMAIL ?? "lucio.dalessa@gmail.com";

export async function authenticateWithClerk(page: Page) {
  await setupClerkTestingToken({ page });
  await page.goto("/");
  await clerk.signIn({
    page,
    emailAddress: TEST_USER_EMAIL,
  });
}
