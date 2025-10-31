// tests/e2e/auth/register.spec.js
const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../fixtures/auth');
const testData = require('../fixtures/testData');

test.describe('Registration Flow', () => {
  let authHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper('http://localhost:5001');
    await page.goto('http://localhost:3002/register');
  });

  test('should display registration form correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Register to FitFlow');
    await expect(page.locator('input[placeholder="Enter your full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Register');
  });

  test('should register a new user successfully', async ({ page }) => {
    const user = {
      name: 'Test User 1',
      email: `test1-${Date.now()}@example.com`,
      password: 'Test@123456'
    };

    await page.fill('input[placeholder="Enter your full name"]', user.name);
    await page.fill('input[placeholder="Enter your email"]', user.email);
    await page.fill('input[placeholder="Enter password"]', user.password);

    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert-message')).toContainText('Registration successful!');

    await expect(page.locator('input[placeholder="Enter your full name"]')).toHaveValue('');
    await expect(page.locator('input[placeholder="Enter your email"]')).toHaveValue('');
    await expect(page.locator('input[placeholder="Enter password"]')).toHaveValue('');
  });

  test('should show error for empty name field', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com');
    await page.fill('input[placeholder="Enter password"]', 'Test@123456');

    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert-message')).toContainText('Name is required');
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[placeholder="Enter your full name"]', 'Test User');
    await page.fill('input[placeholder="Enter your email"]', 'invalid-email');
    await page.fill('input[placeholder="Enter password"]', 'Test@123456');

    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert-message')).toContainText('Please enter a valid email');
  });

  test('should show error for weak password', async ({ page }) => {
    await page.fill('input[placeholder="Enter your full name"]', 'Test User');
    await page.fill('input[placeholder="Enter your email"]', 'test@example.com');
    await page.fill('input[placeholder="Enter password"]', 'password');

    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert-message')).toContainText('Password must contain');
  });

  test('should show error for duplicate email', async ({ page }) => {
    const user = {
      name: 'Existing User',
      email: `existing-${Date.now()}@example.com`,
      password: 'Test@123456'
    };
    
    try {
      await authHelper.registerUser(user);
      await page.waitForTimeout(500);
    } catch (error) {
      console.error('Error registering user via API:', error);
    }

    await page.fill('input[placeholder="Enter your full name"]', user.name);
    await page.fill('input[placeholder="Enter your email"]', user.email);
    await page.fill('input[placeholder="Enter password"]', user.password);

    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.alert-message')).toContainText('Email already exists');
  });

  test('should navigate to login page when clicking login link', async ({ page }) => {
    await page.click('text=Login here');
    
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('should close alert when clicking X button', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--error')).toBeVisible({ timeout: 10000 });

    await page.click('.alert-close');

    await expect(page.locator('.custom-alert--error')).not.toBeVisible();
  });

  test('should auto-hide alert after 4 seconds', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator('.custom-alert--error')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(4500);

    await expect(page.locator('.custom-alert--error')).not.toBeVisible();
  });
});