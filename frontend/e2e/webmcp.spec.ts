import { test, expect } from '@playwright/test';

/**
 * WebMCP E2E Test Suite for PostQode Nexus
 * Validates both Imperative and Declarative WebMCP APIs using Playwright 1.64.
 * Specification: https://developer.chrome.com/docs/ai/webmcp
 */

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

test.describe('WebMCP (Web Model Context Protocol) Integration', () => {
  test('1. ModelContext API is available and spec-compliant in browser', async ({ page }) => {
    await page.goto('/login');

    const hasModelContext = await page.evaluate(() => {
      const mc = document.modelContext;
      return {
        exists: !!mc,
        hasGetTools: typeof mc?.getTools === 'function',
        hasExecuteTool: typeof mc?.executeTool === 'function',
        hasRegisterTool: typeof mc?.registerTool === 'function',
      };
    });

    expect(hasModelContext.exists).toBe(true);
    expect(hasModelContext.hasGetTools).toBe(true);
    expect(hasModelContext.hasExecuteTool).toBe(true);
    expect(hasModelContext.hasRegisterTool).toBe(true);
  });

  test('2. Declarative WebMCP annotations are present on Login Form', async ({ page }) => {
    await page.goto('/login');

    const form = page.locator('#login-form');
    await expect(form).toHaveAttribute('toolname', 'user_login');
    await expect(form).toHaveAttribute('tooldescription', /Authenticate into PostQode Nexus/i);

    const usernameInput = page.locator('#login-input-username');
    await expect(usernameInput).toHaveAttribute('toolparamdescription', /Username/i);
  });

  test('3. Authenticates and discovers Global WebMCP Tools on Layout', async ({ page }) => {
    await page.goto('/login');

    // Perform login
    await page.fill('#login-input-username', 'admin');
    await page.fill('#login-input-password', 'Admin@123');
    await page.click('#login-button-submit');

    await page.waitForURL('**/dashboard');

    // Query discovered WebMCP tools
    const tools = await page.evaluate(async () => {
      return await document.modelContext!.getTools();
    });

    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain('navigate_to_page');
    expect(toolNames).toContain('get_current_user_profile');

    const profileTool = tools.find((t) => t.name === 'get_current_user_profile');
    expect(profileTool?.annotations?.readOnlyHint).toBe(true);

    // Execute get_current_user_profile tool by passing RegisteredTool object
    const rawProfile = await page.evaluate(async () => {
      const allTools = await document.modelContext!.getTools();
      const tool = allTools.find((t) => t.name === 'get_current_user_profile');
      if (!tool) throw new Error('Tool get_current_user_profile not found');
      return await document.modelContext!.executeTool(tool, {});
    });

    const profile = parseToolResult(rawProfile);
    expect(profile.username).toBe('admin');
    expect(profile.isAdmin).toBe(true);
    expect(profile.authenticated).toBe(true);
  });

  test('4. Agent autonomously navigates to Product Catalog via navigate_to_page tool', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-input-username', 'admin');
    await page.fill('#login-input-password', 'Admin@123');
    await page.click('#login-button-submit');
    await page.waitForURL('**/dashboard');

    // Agent finds navigate_to_page and executes it
    const rawNavResult = await page.evaluate(async () => {
      const allTools = await document.modelContext!.getTools();
      const navTool = allTools.find((t) => t.name === 'navigate_to_page');
      if (!navTool) throw new Error('Tool navigate_to_page not found');
      return await document.modelContext!.executeTool(navTool, { path: '/products' });
    });

    const navResult = parseToolResult(rawNavResult);
    expect(navResult.status).toBe('success');
    await page.waitForURL('**/products');
    await expect(page.locator('h1')).toHaveText(/Product Catalog/i);
  });

  test('5. Discovers Product Catalog tools and validates schemas & annotations', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-input-username', 'admin');
    await page.fill('#login-input-password', 'Admin@123');
    await page.click('#login-button-submit');
    await page.waitForURL('**/dashboard');

    // Navigate to products
    await page.goto('/products');
    await page.waitForSelector('#catalog-table-products');

    const tools = await page.evaluate(async () => {
      return await document.modelContext!.getTools();
    });

    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain('search_products');
    expect(toolNames).toContain('get_product_details');
    expect(toolNames).toContain('place_order');

    const searchTool = tools.find((t) => t.name === 'search_products');
    expect(searchTool?.annotations?.readOnlyHint).toBe(true);

    const orderTool = tools.find((t) => t.name === 'place_order');
    expect(orderTool?.annotations?.consequentialHint).toBe(true);
    expect(orderTool?.inputSchema.required).toContain('productId');
    expect(orderTool?.inputSchema.required).toContain('quantity');
  });

  test('6. Executes search_products tool programmatically and verifies results', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-input-username', 'admin');
    await page.fill('#login-input-password', 'Admin@123');
    await page.click('#login-button-submit');
    await page.waitForURL('**/dashboard');
    await page.goto('/products');
    await page.waitForSelector('#catalog-table-products');

    // Agent executes search_products tool
    const rawProducts = await page.evaluate(async () => {
      const allTools = await document.modelContext!.getTools();
      const tool = allTools.find((t) => t.name === 'search_products');
      if (!tool) throw new Error('Tool search_products not found');
      return await document.modelContext!.executeTool(tool, { search: '' });
    });

    const products = parseToolResult(rawProducts);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('price');
  });

  test('7. Declarative form attributes and CSS actuation styling exist', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-input-username', 'admin');
    await page.fill('#login-input-password', 'Admin@123');
    await page.click('#login-button-submit');
    await page.waitForURL('**/dashboard');
    await page.goto('/products');

    // Verify declarative search form
    const searchForm = page.locator('form[toolname="search_catalog"]');
    await expect(searchForm).toBeVisible();
    await expect(searchForm).toHaveAttribute('tooldescription', /Search and filter product catalog/i);

    // Verify search input annotation
    const searchInput = page.locator('#catalog-input-search');
    await expect(searchInput).toHaveAttribute('toolparamdescription', /Search query keyword/i);

    // Verify WebMCP visual actuation CSS classes are loaded
    const hasWebMcpStyles = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule.cssText.includes(':tool-form-active') || rule.cssText.includes('webmcp-pulse')) {
              return true;
            }
          }
        } catch {
          // Cross-origin stylesheet access restriction ignored
        }
      }
      return false;
    });

    expect(hasWebMcpStyles).toBe(true);
  });

  test('8. End-to-end simulated web agent flow (Search + Place Order)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-input-username', 'user');
    await page.fill('#login-input-password', 'User@123');
    await page.click('#login-button-submit');
    await page.waitForURL('**/dashboard');
    await page.goto('/products');
    await page.waitForSelector('#catalog-table-products');

    // Step A: Agent searches for an available product
    const rawSearchResults = await page.evaluate(async () => {
      const allTools = await document.modelContext!.getTools();
      const tool = allTools.find((t) => t.name === 'search_products');
      if (!tool) throw new Error('Tool search_products not found');
      return await document.modelContext!.executeTool(tool, {});
    });

    const searchResults = parseToolResult(rawSearchResults);
    const targetProduct = searchResults.find((p: any) => p.quantity > 0);
    expect(targetProduct).toBeDefined();

    // Step B: Agent places order via place_order tool
    const rawOrderResult = await page.evaluate(
      async ({ productId }) => {
        const allTools = await document.modelContext!.getTools();
        const tool = allTools.find((t) => t.name === 'place_order');
        if (!tool) throw new Error('Tool place_order not found');
        return await document.modelContext!.executeTool(tool, {
          productId,
          quantity: 1,
        });
      },
      { productId: targetProduct.id }
    );

    const orderResult = parseToolResult(rawOrderResult);
    expect(orderResult.status).toBe('success');
    expect(orderResult.message).toContain('Order successfully placed');

    // Verify UI toast notification appeared
    await expect(page.locator('text=Agent placed order')).toBeVisible({ timeout: 5000 });
  });
});
