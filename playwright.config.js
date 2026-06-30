import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node src/server.js',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '3001',
      SESSION_SECRET: 'e2e_test_secret',
    },
  },
});
