import { test, expect } from '@playwright/test';

test.describe('Navigation and Routes', () => {
  const routes = [
    { path: '/decks', name: 'Decks' },
    { path: '/dictionary', name: 'Dictionary' },
    { path: '/discover', name: 'Discover' },
    { path: '/flashcards', name: 'Flashcards' },
    { path: '/import', name: 'Import' },
    { path: '/practice', name: 'Practice' },
  ];

  for (const route of routes) {
    test(`should navigate to ${route.path} and load properly`, async ({ page }) => {
      // Goto route
      const response = await page.goto(route.path);
      
      // Ensure it doesn't return a 404 or 500
      expect(response?.ok()).toBeTruthy();

      // Ensure body is visible
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
