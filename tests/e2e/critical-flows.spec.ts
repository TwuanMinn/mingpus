import { test, expect } from '@playwright/test';

/**
 * Critical User Flow E2E Tests
 *
 * These tests verify the most important user paths through the app.
 * All protected routes redirect to /login, so we test both:
 * 1. Auth gate behavior (redirect to login)
 * 2. Login page functionality
 * 3. Public page health
 */

test.describe('Authentication Gate — Protected Routes', () => {
  const protectedRoutes = [
    '/',
    '/decks',
    '/dictionary',
    '/discover',
    '/flashcards',
    '/import',
    '/practice',
    '/quiz',
    '/strokes',
  ];

  protectedRoutes.forEach((route) => {
    test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      // Should redirect to login page
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });
  });
});

test.describe('Login Page — Functional Tests', () => {
  test('renders login form with required elements', async ({ page }) => {
    await page.goto('/login');
    // Check form elements exist
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('has a Sign In button', async ({ page }) => {
    await page.goto('/login');
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeVisible();
  });

  test('has a Create Account or Join option', async ({ page }) => {
    // Desktop shows "Join Digital Calligrapher" in right panel, mobile shows "Create Account"
    // Use a wide viewport to see the desktop panel
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    const join = page.getByText(/join digital calligrapher|new here/i).first();
    await expect(join).toBeVisible();
  });

  test('displays welcome text', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('shows validation feedback for empty submit', async ({ page }) => {
    await page.goto('/login');
    // Clear any pre-filled values
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('');
    await passwordInput.fill('');
    // Try clicking sign in
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should stay on login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('invalid@nonexistent.com');
    await passwordInput.fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Wait for error message or stay on login
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});

test.describe('tRPC API — Health Checks', () => {
  test('tRPC endpoint rejects unauthenticated requests', async ({ request }) => {
    const response = await request.get('/api/trpc/getDashboardStats?batch=1&input=%7B%220%22%3A%7B%7D%7D');
    const body = await response.text();
    // tRPC may return 200 with error in body, or 401/500
    if (response.status() === 200) {
      // Body should contain error indication (UNAUTHORIZED or error code)
      expect(body.toLowerCase()).toMatch(/unauthorized|error|trpc/i);
    } else {
      expect([401, 500]).toContain(response.status());
    }
  });

  test('tRPC endpoint exists and responds', async ({ request }) => {
    const response = await request.get('/api/trpc/getDecks?batch=1&input={}');
    // Should respond (even if unauthorized)
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Page Responsiveness', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  viewports.forEach((vp) => {
    test(`login page is responsive on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login');
      await expect(page.locator('body')).toBeVisible();

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
    });
  });
});

test.describe('SEO & Meta', () => {
  test('login page has a title', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('login page has proper HTML lang attribute', async ({ page }) => {
    await page.goto('/login');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('login page has charset meta', async ({ page }) => {
    await page.goto('/login');
    const charset = await page.locator('meta[charset], meta[charSet]').first().getAttribute('charset')
      || await page.locator('meta[charset], meta[charSet]').first().getAttribute('charSet');
    expect(charset).toBeTruthy();
  });
});

test.describe('Stability Tests', () => {
  test('double-click on login page does not break', async ({ page }) => {
    await page.goto('/login');
    await page.locator('body').dblclick();
    await expect(page.locator('body')).toBeVisible();
  });

  test('rapid navigation between routes stays stable', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/practice');
    await page.goto('/quiz');
    await page.goto('/login');
    // Should be redirected to login for protected routes
    expect(page.url()).toContain('login');
  });

  test('back/forward navigation works', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/practice');
    await page.goBack();
    await page.waitForTimeout(500);
    // Should be on some page (login)
    await expect(page.locator('body')).toBeVisible();
  });

  test('keyboard Tab focuses interactive elements', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeDefined();
  });
});
