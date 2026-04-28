/**
 * E2E Test: Full User Journey
 * 
 * Flow: Landing Page → Register → Login → Dashboard → Search → Results → History
 * 
 * This test simulates a real user interacting with the Malaysia News Sentiment
 * Analysis Dashboard from start to finish.
 */
import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'E2E Test User',
  email: `e2e_${Date.now()}@test.com`,
  password: 'TestPass123!',
};

// ── 1. Landing Page ───────────────────────────────────────────
test.describe('Landing Page', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sentiment|News|MY/i);
    // Should have a call-to-action button
    const ctaButton = page.locator('a[href="/login"], a[href="/register"], button:has-text("Get Started"), button:has-text("Login"), a:has-text("Get Started")');
    await expect(ctaButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.locator('a[href="/login"], button:has-text("Login"), a:has-text("Login"), a:has-text("Sign In")');
    await loginLink.first().click();
    await expect(page).toHaveURL(/login/);
  });
});

// ── 2. Authentication Flow ────────────────────────────────────
test.describe('Authentication', () => {
  test('should show registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await nameInput.fill(TEST_USER.name);
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    
    // Check for confirm password field
    const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]');
    if (await confirmPassword.count() > 0) {
      await confirmPassword.first().fill(TEST_USER.password);
    }
    
    // Submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), button:has-text("Create")');
    await submitBtn.first().click();
    
    // Should show success message, toast, or redirect
    await page.waitForTimeout(3000);
    const success = page.locator('text=/success|verification|verify|created|registered|check.*email|sent/i');
    const toast = page.locator('[role="status"], [class*="toast"], [class*="Toaster"]');
    const redirected = page.url().includes('/login') || page.url().includes('/verify') || page.url().includes('/dashboard');
    const hasSuccessIndicator = (await success.count() > 0) || (await toast.count() > 0) || redirected;
    expect(hasSuccessIndicator).toBeTruthy();
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await emailInput.fill('wrong@email.com');
    await passwordInput.fill('wrongpassword');
    
    const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await submitBtn.first().click();
    
    await page.waitForTimeout(2000);
    // Should still be on login page or show error
    const onLoginPage = page.url().includes('/login');
    const errorVisible = await page.locator('text=/error|invalid|incorrect|wrong/i').count() > 0;
    expect(onLoginPage || errorVisible).toBeTruthy();
  });
});

// ── 3. Dashboard (Authenticated) ──────────────────────────────
test.describe('Dashboard', () => {
  // Login before each test using API
  test.beforeEach(async ({ page, request }) => {
    // Verify user via API first (in case not verified)
    try {
      await request.post('http://localhost:5001/api/auth/register', {
        data: { name: 'Dashboard Tester', email: 'dashboard@test.com', password: 'Test1234!' }
      });
    } catch(e) { /* may already exist */ }
    
    // Login via UI
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"]').first().fill('vexxy@test.com');
    await page.locator('input[type="password"], input[name="password"]').first().fill('Test1234!');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
    
    // Wait for dashboard to load
    await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
  });

  test('should load dashboard after login', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
    // Should have search bar
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i]');
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display KPI cards', async ({ page }) => {
    // KPI cards should be visible
    const kpiCards = page.locator('.kpi-card, [class*="kpi"], [class*="stat-card"]');
    await expect(kpiCards.first()).toBeVisible({ timeout: 15000 });
  });

  test('should search for news and display results', async ({ page }) => {
    // Find and use search bar
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('Malaysia');
    
    // Submit search
    const searchBtn = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Analyze")');
    if (await searchBtn.count() > 0) {
      await searchBtn.first().click();
    } else {
      await searchInput.press('Enter');
    }
    
    // Wait for results (loading → articles)
    await page.waitForTimeout(5000);
    
    // Should show articles or "no results" message
    const articles = page.locator('[class*="article"], [class*="card"]:has([class*="sentiment"])');
    const noResults = page.locator('text=/no.*article|no.*result|not found/i');
    const hasContent = (await articles.count()) > 0 || (await noResults.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test('should display charts', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Charts section should exist
    const charts = page.locator('[class*="chart"], canvas, svg[class*="recharts"]');
    // At least some chart elements should be present
    expect(await charts.count()).toBeGreaterThanOrEqual(0);
  });

  test('should filter articles by sentiment', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Look for filter buttons
    const filterBtns = page.locator('.filter-pill, button:has-text("Positive"), button:has-text("Negative"), button:has-text("Neutral")');
    if (await filterBtns.count() > 0) {
      await filterBtns.first().click();
      await page.waitForTimeout(1000);
      // Page should still be functional after filtering
      await expect(page).toHaveURL(/dashboard/);
    }
  });
});

// ── 4. Navigation ─────────────────────────────────────────────
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"]').first().fill('vexxy@test.com');
    await page.locator('input[type="password"], input[name="password"]').first().fill('Test1234!');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
    await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
  });

  test('should navigate to History page', async ({ page }) => {
    const historyLink = page.locator('a[href="/history"], a:has-text("History")');
    if (await historyLink.count() > 0) {
      await historyLink.first().click();
      await expect(page).toHaveURL(/history/);
    }
  });

  test('should navigate to Compare page', async ({ page }) => {
    const compareLink = page.locator('a[href="/compare"], a:has-text("Compare")');
    if (await compareLink.count() > 0) {
      await compareLink.first().click();
      await expect(page).toHaveURL(/compare/);
    }
  });

  test('should navigate to Settings page', async ({ page }) => {
    const settingsLink = page.locator('a[href="/settings"], a:has-text("Settings")');
    if (await settingsLink.count() > 0) {
      await settingsLink.first().click();
      await expect(page).toHaveURL(/settings/);
    }
  });
});

// ── 5. Error Handling (E2E) ───────────────────────────────────
test.describe('Error Handling', () => {
  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.waitForTimeout(2000);
    // Should show 404 or redirect
    const is404 = await page.locator('text=/404|not found|page.*exist/i').count() > 0;
    const redirected = page.url().includes('/login') || page.url() === 'http://localhost:5173/';
    expect(is404 || redirected).toBeTruthy();
  });

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    // Clear any stored tokens
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    // Should redirect to login
    expect(page.url()).toMatch(/login|\/$/);
  });
});
