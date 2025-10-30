// playwright.config.js 
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Test configuration
  fullyParallel: false, 
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, 

  // Reporter
  reporter: [
    ['html'],
    ['list']
  ],

  // Global setup/teardown
  globalSetup: require.resolve('./tests/e2e/setup/globalSetup.js'),
  globalTeardown: require.resolve('./tests/e2e/setup/globalTeardown.js'),

  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3002', 
    
    // Screenshot/video on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    // Browser options
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Wait for navigation
    actionTimeout: 10000,
  },

  // Projects (browsers to test)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Web server for client
  webServer: {
    command: 'npm run client:test',
    url: 'http://localhost:3002',
    timeout: 180000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_API_URL: 'http://localhost:5001'  
    }
  }
});