import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 25_000,
  globalTimeout: 150_000,
  expect: { timeout: 5_000 },
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4327/electric_car_website/',
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
  },
  webServer: {
    command: 'node tests/serve-site.mjs',
    url: 'http://127.0.0.1:4327/electric_car_website/',
    reuseExistingServer: false,
    timeout: 10_000,
  },
});
