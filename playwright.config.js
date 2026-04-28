// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  /* Start both servers before tests */
  webServer: [
    {
      command: 'npm run dev',
      cwd: './backend',
      port: 5001,
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      cwd: './frontend',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
