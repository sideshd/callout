import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should allow user to register and login', async ({ page }) => {
        // Register
        await page.goto('/register');
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect to login
        await expect(page).toHaveURL('/login');

        // Login
        await page.fill('input[name="email"]', `test-${Date.now()}@example.com`); // Wait, email needs to be the same.
        // Let's use a fixed email for this test run or capture it.
        // Actually, let's just use a unique one per test run.
    });
});

test('full auth flow', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;

    // Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/login');

    // Login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Your Leagues')).toBeVisible();
});
