import { test, expect } from '@playwright/test';

/**
 * Demo Flow 1: Traditional Web Automation (Extended Lifecycle)
 * 1. User logs in and places an order (DOM locators, table query, modal filling).
 * 2. Admin logs in and approves the order (Navbar query, pending row search, alert dialog).
 * 3. User logs back in and validates the order status is APPROVED.
 */
test('Traditional Agent Flow: User Order -> Admin Approval -> User Verification', async ({ page }) => {
  const startTime = Date.now();
  console.log('\n======================================================');
  console.log('🐢 RUNNING DEMO: TRADITIONAL AGENT FLOW (LIFECYCLE)');
  console.log('======================================================');

  // ---------------------------------------------------------------------------
  // PHASE 1: User logs in and places an order
  // ---------------------------------------------------------------------------
  console.log('\n[Phase 1: User Order Placement]');
  console.log('[Traditional] 1. Locating login inputs and logging in as "user"...');
  await page.goto('/login');
  await page.fill('#login-input-username', 'user');
  await page.fill('#login-input-password', 'User@123');
  await page.click('#login-button-submit');
  await page.waitForURL('**/dashboard');

  console.log('[Traditional] 2. Querying navbar DOM to click "Products"...');
  await page.click('nav a[href="/products"] button');
  await page.waitForURL('**/products');
  await page.waitForSelector('#catalog-table-products');

  console.log('[Traditional] 3. Scraping table rows for active "Buy" button...');
  const buyButton = page.locator('#catalog-table-products tbody tr button:has-text("Buy"):not([disabled])').first();
  await buyButton.click();

  console.log('[Traditional] 4. Waiting for modal dialog animation and submitting order...');
  await page.waitForSelector('#catalog-form-buy');
  await page.fill('#quantity', '1');
  await page.click('#catalog-form-buy button[type="submit"]');

  console.log('[Traditional] 5. Awaiting order confirmation toast...');
  await expect(page.locator('text=Order placed successfully')).toBeVisible({ timeout: 5000 });

  console.log('[Traditional] 6. Clicking avatar dropdown and logging out...');
  await page.locator('header button.rounded-full').click();
  await page.click('text=Logout');
  await page.waitForURL('**/login');

  // ---------------------------------------------------------------------------
  // PHASE 2: Admin logs in and approves the order
  // ---------------------------------------------------------------------------
  console.log('\n[Phase 2: Admin Approval]');
  console.log('[Traditional] 7. Logging in as "admin"...');
  await page.fill('#login-input-username', 'admin');
  await page.fill('#login-input-password', 'Admin@123');
  await page.click('#login-button-submit');
  await page.waitForURL('**/dashboard');

  console.log('[Traditional] 8. Querying navbar DOM to click "Order Management"...');
  await page.click('nav a[href="/orders"] button');
  await page.waitForURL('**/orders');
  await page.waitForSelector('table tbody tr');

  console.log('[Traditional] 9. Finding PENDING order row and clicking approve button...');
  const pendingRow = page.locator('table tbody tr').filter({ hasText: 'PENDING' }).first();
  await expect(pendingRow).toBeVisible();
  // Click check button in action cell
  await pendingRow.locator('button').first().click();

  console.log('[Traditional] 10. Confirming approval in AlertDialog modal...');
  await page.locator('button:has-text("Approve")').click();
  await expect(page.locator('text=Order approved successfully')).toBeVisible({ timeout: 5000 });

  console.log('[Traditional] 11. Logging out admin...');
  await page.locator('header button.rounded-full').click();
  await page.click('text=Logout');
  await page.waitForURL('**/login');

  // ---------------------------------------------------------------------------
  // PHASE 3: User logs in and validates the order is approved
  // ---------------------------------------------------------------------------
  console.log('\n[Phase 3: User Verification]');
  console.log('[Traditional] 12. Logging back in as "user"...');
  await page.fill('#login-input-username', 'user');
  await page.fill('#login-input-password', 'User@123');
  await page.click('#login-button-submit');
  await page.waitForURL('**/dashboard');

  console.log('[Traditional] 13. Navigating to "My Orders"...');
  await page.click('nav a[href="/my-orders"] button');
  await page.waitForURL('**/my-orders');
  await page.waitForSelector('table tbody tr');

  console.log('[Traditional] 14. Scrutinizing table for APPROVED order badge...');
  const firstOrderRow = page.locator('table tbody tr').first();
  await expect(firstOrderRow.locator('text=APPROVED')).toBeVisible({ timeout: 5000 });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🐢 Traditional lifecycle flow completed in ${duration}s`);
  console.log('   - Required 14+ DOM locators across 3 login sessions and 2 modal dialogs');
  console.log('   - Highly susceptible to CSS selector drift and modal timing races\n');
});
