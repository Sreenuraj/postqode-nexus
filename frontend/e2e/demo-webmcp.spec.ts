import { test, expect } from '@playwright/test';

/**
 * Demo Flow 2: WebMCP Agent Automation (Extended Lifecycle)
 * 1. User logs in, discovers ModelContext tools, and places an order via place_order tool.
 * 2. Admin logs in, discovers Order Management tools, and approves the order via approve_order tool.
 * 3. User logs back in, retrieves order history via get_my_orders tool, and validates status is APPROVED.
 */
test('WebMCP Agent Flow: User Order -> Admin Approval -> User Verification', async ({ page }) => {
  const startTime = Date.now();
  console.log('\n======================================================');
  console.log('🚀 RUNNING DEMO: WEBMCP AGENT FLOW (LIFECYCLE)');
  console.log('======================================================');

  // Helper to parse tool responses
  function parseToolResult<T = any>(result: any): T {
    if (typeof result === 'string') {
      try {
        return JSON.parse(result);
      } catch {
        return result as unknown as T;
      }
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // PHASE 1: User logs in and places order via WebMCP tool
  // ---------------------------------------------------------------------------
  console.log('\n[Phase 1: User Order Placement via WebMCP]');
  console.log('[WebMCP] 1. Logging in as "user"...');
  await page.goto('/login');
  await page.fill('#login-input-username', 'user');
  await page.fill('#login-input-password', 'User@123');
  await page.click('#login-button-submit');
  await page.waitForURL('**/dashboard');

  console.log('[WebMCP] 2. Autonomous navigation: navigate_to_page({ path: "/products" })');
  await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const navTool = tools.find((t) => t.name === 'navigate_to_page');
    if (!navTool) throw new Error('navigate_to_page tool not found');
    await document.modelContext!.executeTool(navTool, { path: '/products' });
  });
  await page.waitForURL('**/products');
  await page.waitForSelector('#catalog-table-products');

  console.log('[WebMCP] 3. Fetching product catalog: search_products({ search: "" })');
  const rawProducts = await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const searchTool = tools.find((t) => t.name === 'search_products');
    if (!searchTool) throw new Error('search_products tool not found');
    return await document.modelContext!.executeTool(searchTool, { search: '' });
  });

  const products = parseToolResult<any[]>(rawProducts);
  const targetProduct = products.find((p) => p.quantity > 0) || products[0];
  console.log(`[WebMCP]    -> Selected in-stock product: "${targetProduct.name}" (ID: ${targetProduct.id})`);

  console.log('[WebMCP] 4. Executing purchase: place_order({ productId, quantity: 1 })');
  const rawOrderResult = await page.evaluate(
    async ({ productId }) => {
      const tools = await document.modelContext!.getTools();
      const orderTool = tools.find((t) => t.name === 'place_order');
      if (!orderTool) throw new Error('place_order tool not found');
      return await document.modelContext!.executeTool(orderTool, {
        productId,
        quantity: 1,
      });
    },
    { productId: targetProduct.id }
  );

  const orderResult = parseToolResult<any>(rawOrderResult);
  expect(orderResult.status).toBe('success');
  const placedOrderId = orderResult.order?.id;
  console.log(`[WebMCP]    -> Order successfully placed! Order UUID: ${placedOrderId}`);
  await expect(page.locator('text=Agent placed order')).toBeVisible({ timeout: 5000 });

  console.log('[WebMCP] 5. Autonomous logout: logout_user()');
  await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const logoutTool = tools.find((t) => t.name === 'logout_user');
    if (logoutTool) {
      await document.modelContext!.executeTool(logoutTool, {});
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  });
  await page.waitForURL('**/login');

  // ---------------------------------------------------------------------------
  // PHASE 2: Admin logs in and approves order via WebMCP tool
  // ---------------------------------------------------------------------------
  console.log('\n[Phase 2: Admin Approval via WebMCP]');
  console.log('[WebMCP] 6. Logging in as "admin"...');
  await page.fill('#login-input-username', 'admin');
  await page.fill('#login-input-password', 'Admin@123');
  await page.click('#login-button-submit');
  await page.waitForURL('**/dashboard');

  console.log('[WebMCP] 7. Autonomous navigation: navigate_to_page({ path: "/orders" })');
  await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const navTool = tools.find((t) => t.name === 'navigate_to_page');
    if (!navTool) throw new Error('navigate_to_page tool not found');
    await document.modelContext!.executeTool(navTool, { path: '/orders' });
  });
  await page.waitForURL('**/orders');
  await page.waitForSelector('table tbody tr');

  console.log(`[WebMCP] 8. Approving order: approve_order({ orderId: "${placedOrderId}" })`);
  const rawApprovalResult = await page.evaluate(
    async ({ orderId }) => {
      const tools = await document.modelContext!.getTools();
      const approveTool = tools.find((t) => t.name === 'approve_order');
      if (!approveTool) throw new Error('approve_order tool not found');
      return await document.modelContext!.executeTool(approveTool, { orderId });
    },
    { orderId: placedOrderId }
  );

  const approvalResult = parseToolResult<any>(rawApprovalResult);
  expect(approvalResult.status).toBe('success');
  console.log(`[WebMCP]    -> ${approvalResult.message}`);
  await expect(page.locator('text=Agent approved order')).toBeVisible({ timeout: 5000 });

  console.log('[WebMCP] 9. Autonomous logout: logout_user()');
  await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const logoutTool = tools.find((t) => t.name === 'logout_user');
    if (logoutTool) {
      await document.modelContext!.executeTool(logoutTool, {});
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  });
  await page.waitForURL('**/login');

  // ---------------------------------------------------------------------------
  // PHASE 3: User logs back in and validates order is approved via WebMCP
  // ---------------------------------------------------------------------------
  console.log('\n[Phase 3: User Verification via WebMCP]');
  console.log('[WebMCP] 10. Logging back in as "user"...');
  await page.fill('#login-input-username', 'user');
  await page.fill('#login-input-password', 'User@123');
  await page.click('#login-button-submit');
  await page.waitForURL('**/dashboard');

  console.log('[WebMCP] 11. Autonomous navigation: navigate_to_page({ path: "/my-orders" })');
  await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const navTool = tools.find((t) => t.name === 'navigate_to_page');
    if (!navTool) throw new Error('navigate_to_page tool not found');
    await document.modelContext!.executeTool(navTool, { path: '/my-orders' });
  });
  await page.waitForURL('**/my-orders');
  await page.waitForSelector('table tbody tr');

  console.log('[WebMCP] 12. Querying user orders: get_my_orders()');
  const rawMyOrders = await page.evaluate(async () => {
    const tools = await document.modelContext!.getTools();
    const myOrdersTool = tools.find((t) => t.name === 'get_my_orders');
    if (!myOrdersTool) throw new Error('get_my_orders tool not found');
    return await document.modelContext!.executeTool(myOrdersTool, {});
  });

  const myOrders = parseToolResult<any[]>(rawMyOrders);
  const validatedOrder = myOrders.find((o) => o.id === placedOrderId);
  expect(validatedOrder).toBeDefined();
  expect(validatedOrder.status).toBe('APPROVED');
  console.log(`[WebMCP]    -> Order ${placedOrderId} verified with status: ${validatedOrder.status}!`);

  // Confirm UI status badge also shows APPROVED
  await expect(page.locator('table tbody tr').first().locator('text=APPROVED')).toBeVisible();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🚀 WebMCP lifecycle flow completed in ${duration}s`);
  console.log('   - 0 DOM locators used for navigation, catalog search, order placement, or approval');
  console.log('   - 100% deterministic structured JSON tool execution across all 3 user sessions\n');
});
