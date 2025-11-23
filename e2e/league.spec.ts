import { test, expect } from '@playwright/test';

test.describe('League Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        const email = `league-test-${Date.now()}@example.com`;
        await page.goto('/register');
        await page.fill('input[name="name"]', 'League Tester');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should create and delete a league', async ({ page }) => {
        // Create League
        await page.click('text=Create League');
        await page.fill('input[name="name"]', 'Test League');
        await page.fill('input[name="description"]', 'A test league');
        await page.click('button[type="submit"]');

        // Verify League Page
        await expect(page.getByText('Test League')).toBeVisible();
        await expect(page.getByText('1000 credits')).toBeVisible();

        // Delete League
        page.on('dialog', dialog => dialog.accept());
        await page.click('button[title="Delete League"]');

        // Verify Redirect to Dashboard
        await expect(page).toHaveURL('/dashboard');
        await expect(page.getByText('Test League')).not.toBeVisible();
    });
});
