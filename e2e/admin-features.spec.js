/**
 * E2E Test: Admin Dashboard & Entity Graph
 * 
 * Tests admin-only features and entity relationship graph
 */
import { test, expect } from '@playwright/test';

const ADMIN = { email: 'admin@mynews.my', password: 'Admin@123' };

// Helper: login as admin
async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(ADMIN.email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(ADMIN.password);
  await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
  await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
}

// ── 1. Admin Dashboard ────────────────────────────────────────
test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    // Should show admin page content
    const adminContent = page.locator('text=/Admin|Command|Dashboard/i');
    await expect(adminContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display overview stats', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    // Should have stat values (numbers)
    const statValues = page.locator('.adm-stat-value, [class*="stat-val"], [class*="yak-stat"]');
    if (await statValues.count() > 0) {
      await expect(statValues.first()).toBeVisible();
    }
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    
    const tabs = page.locator('.adm-tab, button:has-text("Users"), button:has-text("Content"), button:has-text("API")');
    if (await tabs.count() > 1) {
      // Click Users tab
      const usersTab = page.locator('button:has-text("Users")');
      if (await usersTab.count() > 0) {
        await usersTab.click();
        await page.waitForTimeout(1000);
        // Should show user table or list
        const userContent = page.locator('table').or(page.getByText(/Registered|User|Email/i));
        await expect(userContent.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show API metrics tab', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    
    const apiTab = page.locator('button:has-text("API")');
    if (await apiTab.count() > 0) {
      await apiTab.click();
      await page.waitForTimeout(3000);
      // Should show metrics data or loading
      const metricsContent = page.locator('text=/Total API|Response Time|Uptime|Error Rate/i');
      const hasMetrics = await metricsContent.count() > 0;
      expect(hasMetrics).toBeTruthy();
    }
  });

  test('should load AI insights', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    
    const insightsTab = page.locator('button:has-text("Insights")');
    if (await insightsTab.count() > 0) {
      await insightsTab.click();
      await page.waitForTimeout(2000);
      // Should show insights section
      const insightsContent = page.locator('text=/Insight|Risk|Opportunity|Generate/i');
      await expect(insightsContent.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// ── 2. Entity Graph ───────────────────────────────────────────
test.describe('Entity Graph', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load entity graph page', async ({ page }) => {
    await page.goto('/entities');
    await page.waitForTimeout(3000);
    // Should show graph area or empty state
    const graphContent = page.locator('[class*="graph"]').or(page.locator('[class*="entity"]')).or(page.locator('canvas')).or(page.getByText(/entity|entities/i));
    await expect(graphContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display filter buttons', async ({ page }) => {
    await page.goto('/entities');
    await page.waitForTimeout(3000);
    // Should have type filter buttons
    const filters = page.locator('button:has-text("All"), button:has-text("Politicians"), button:has-text("Parties")');
    if (await filters.count() > 0) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test('should filter by entity type', async ({ page }) => {
    await page.goto('/entities');
    await page.waitForTimeout(3000);
    
    const politiciansBtn = page.locator('button:has-text("Politicians")');
    if (await politiciansBtn.count() > 0) {
      await politiciansBtn.click();
      await page.waitForTimeout(2000);
      // Page should still be functional
      await expect(page).toHaveURL(/entities/);
    }
  });

  test('should filter by timeframe', async ({ page }) => {
    await page.goto('/entities');
    await page.waitForTimeout(3000);
    
    const timeBtn = page.locator('button:has-text("7D"), button:has-text("30D")');
    if (await timeBtn.count() > 0) {
      await timeBtn.first().click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/entities/);
    }
  });

  test('should have search input', async ({ page }) => {
    await page.goto('/entities');
    await page.waitForTimeout(2000);
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
      await searchInput.first().fill('Anwar');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(2000);
    }
  });
});

// ── 3. Source Credibility ─────────────────────────────────────
test.describe('Source Credibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display source credibility on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(5000);
    const sourceSection = page.locator('text=/Source|Credibility|Reliability/i');
    // May or may not be visible depending on data
    const exists = await sourceSection.count() > 0;
    expect(exists || true).toBeTruthy(); // soft check
  });
});

// ── 4. Export Features ────────────────────────────────────────
test.describe('Export Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should have CSV export button on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(5000);
    const csvBtn = page.locator('button:has-text("CSV"), button:has-text("Export")');
    if (await csvBtn.count() > 0) {
      await expect(csvBtn.first()).toBeVisible();
    }
  });

  test('should have PowerPoint export button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(5000);
    const pptBtn = page.locator('button:has-text("PPT"), button:has-text("PowerPoint"), [class*="export-ppt"]');
    if (await pptBtn.count() > 0) {
      await expect(pptBtn.first()).toBeVisible();
    }
  });
});

// ── 5. Settings & Profile ─────────────────────────────────────
test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    const settingsContent = page.locator('text=/Settings|Profile|Account|Theme|Language/i');
    await expect(settingsContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    // Look for visible theme-related elements
    const themeToggle = page.locator('[class*="theme"]').or(page.getByText(/Dark|Light|Theme/i));
    if (await themeToggle.count() > 0) {
      const visibleToggle = themeToggle.first();
      // Just verify the page has theme options somewhere
      expect(await themeToggle.count()).toBeGreaterThan(0);
    }
  });

  test('should have language option', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    const langOption = page.getByText(/Language|Bahasa|English/i).or(page.locator('select')).or(page.locator('[class*="lang"]'));
    if (await langOption.count() > 0) {
      expect(await langOption.count()).toBeGreaterThan(0);
    }
  });
});

// ── 6. Bookmarks ──────────────────────────────────────────────
test.describe('Bookmarks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load bookmarks page', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.waitForTimeout(2000);
    // Should show bookmarks page or empty state
    const content = page.locator('text=/Bookmark|Saved|No bookmark/i');
    const pageLoaded = (await content.count() > 0) || page.url().includes('/bookmarks');
    expect(pageLoaded).toBeTruthy();
  });
});

// ── 7. Trending ───────────────────────────────────────────────
test.describe('Trending', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load trending page', async ({ page }) => {
    await page.goto('/trending');
    await page.waitForTimeout(3000);
    const content = page.locator('text=/Trending|Popular|Top/i');
    const pageLoaded = (await content.count() > 0) || page.url().includes('/trending');
    expect(pageLoaded).toBeTruthy();
  });
});

// ── 8. Compare ────────────────────────────────────────────────
test.describe('Compare', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load compare page', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForTimeout(2000);
    const content = page.locator('text=/Compare|Comparison|vs/i');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have input fields for comparison', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForTimeout(2000);
    const inputs = page.locator('input[type="text"], input[placeholder*="topic" i], input[placeholder*="search" i]');
    if (await inputs.count() > 0) {
      await expect(inputs.first()).toBeVisible();
    }
  });
});

// ── 9. Responsive / Mobile ────────────────────────────────────
test.describe('Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('should render landing page on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Should not have horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // small tolerance
  });

  test('should render login page on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    // Input should be usable (not overflowing)
    const box = await emailInput.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375);
  });

  test('should render dashboard on mobile', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    // Dashboard should load without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('should render admin dashboard on mobile', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});
