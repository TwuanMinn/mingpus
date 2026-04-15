import { test, expect } from '@playwright/test';

test.describe('Home Page Flow', () => {
  test('should load the homepage and display the main title', async ({ page }) => {
    // Navigate to the app root (uses baseURL from config)
    await page.goto('/');

    // Ensure the page has fully loaded
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // We expect the page to have some content. Modify this text match 
    // to whatever exactly renders on the index screen, or use a data-testid.
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Take a screenshot of the successful page load (optional baseline)
    await page.screenshot({ path: 'tests/e2e/screenshots/homepage.png', fullPage: true });
  });
});
