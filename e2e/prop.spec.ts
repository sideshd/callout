import { test, expect } from '@playwright/test';

test.describe('Props and Betting', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        const email = `prop-test-${Date.now()}@example.com`;
        await page.goto('/register');
        await page.fill('input[name="name"]', 'Prop Tester');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Create League
        await page.click('text=Create League');
        await page.fill('input[name="name"]', 'Betting League');
        await page.click('button[type="submit"]');
    });

    test('should create a prop and place a bet', async ({ page }) => {
        // Create Prop
        await page.click('text=New Prop');
        await page.fill('textarea[name="question"]', 'Will this test pass?');
        await page.selectOption('select[name="type"]', 'HIT');
        await page.fill('input[name="wagerAmount"]', '50');

        // Set deadline to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const deadlineStr = tomorrow.toISOString().slice(0, 16);
        await page.fill('input[name="bettingDeadline"]', deadlineStr);

        await page.click('button[type="submit"]');

        // Verify Prop Page
        await expect(page.getByText('Will this test pass?')).toBeVisible();

        // Place Bet
        await page.click('button:has-text("Bet YES")');

        // Verify Bet Placed
        await expect(page.getByText('You bet 50 credits on')).toBeVisible();
        await expect(page.getByText('YES')).toBeVisible();
    });
});
