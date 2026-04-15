# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page Flow >> should load the homepage and display the main title
- Location: tests\e2e\home.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/"
Received: "http://localhost:3000/login?callbackUrl=%2F"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/login?callbackUrl=%2F"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: Welcome Back
          - heading "Master your flow." [level=1] [ref=e10]
        - generic [ref=e11]:
          - textbox "Email Address" [ref=e13]
          - textbox "Password" [ref=e15]
          - generic [ref=e16]:
            - generic [ref=e19] [cursor=pointer]: Keep me signed in
            - link "Forgot?" [ref=e20] [cursor=pointer]:
              - /url: "#"
          - button "SIGN IN" [ref=e21]
      - generic [ref=e22]:
        - generic:
          - img "abstract digital waves of silk flowing in purple and deep indigo hues with soft grain texture"
        - generic [ref=e23]:
          - heading "New Here?" [level=2] [ref=e24]
          - paragraph [ref=e25]: Begin your journey into the art of focus and scholarly mastery.
          - button "Join Digital Calligrapher" [ref=e26]
  - button "Open Next.js Dev Tools" [ref=e36] [cursor=pointer]:
    - img [ref=e37]
  - alert [ref=e40]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Home Page Flow', () => {
  4  |   test('should load the homepage and display the main title', async ({ page }) => {
  5  |     // Navigate to the app root (uses baseURL from config)
  6  |     await page.goto('/');
  7  | 
  8  |     // Ensure the page has fully loaded
> 9  |     await expect(page).toHaveURL('http://localhost:3000/');
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  10 |     
  11 |     // We expect the page to have some content. Modify this text match 
  12 |     // to whatever exactly renders on the index screen, or use a data-testid.
  13 |     const body = page.locator('body');
  14 |     await expect(body).toBeVisible();
  15 |     
  16 |     // Take a screenshot of the successful page load (optional baseline)
  17 |     await page.screenshot({ path: 'tests/e2e/screenshots/homepage.png', fullPage: true });
  18 |   });
  19 | });
  20 | 
```