import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: "html",

  use: {
    // Base URL for tests
    baseURL: "http://localhost:4321",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: "bun run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
