---
name: webmcp-automation
description: Discover, inspect, and invoke WebMCP tools dynamically on web pages using Playwright CLI commands.
---

# WebMCP Automation Skill

This skill teaches PostQode agents how to interact with web applications that expose the **Google Chrome WebMCP (Model Context Protocol)** API (`document.modelContext`).

---

## 1. Discovering Tools Dynamically

When on any page in the browser session, query what WebMCP tools the page has exposed:

```bash
npx playwright cli eval "document.modelContext ? document.modelContext.getTools().then(tools => JSON.stringify(tools.map(t => ({ name: t.name, description: t.description, schema: t.inputSchema, annotations: t.annotations })))) : 'No WebMCP available'"
```

The output will list all registered tools with their descriptions and JSON Schemas (e.g., `navigate_to_page`, `search_products`, `place_order`, `approve_order`, `get_my_orders`, `logout_user`).

---

## 2. Calling a Discovered Tool

Once you have identified the appropriate tool and its required parameters from its `schema`:

```bash
npx playwright cli eval "document.modelContext.getTools().then(async tools => {
  const tool = tools.find(t => t.name === '<TOOL_NAME>');
  if (!tool) throw new Error('Tool not found');
  const result = await document.modelContext.executeTool(tool, <PARAMS_OBJECT>);
  return typeof result === 'string' ? result : JSON.stringify(result);
})"
```

### Examples on PostQode Nexus:

1. **Navigation**:
   ```bash
   npx playwright cli eval "document.modelContext.getTools().then(async t => await document.modelContext.executeTool(t.find(x => x.name === 'navigate_to_page'), { path: '/products' }))"
   ```

2. **Search Products**:
   ```bash
   npx playwright cli eval "document.modelContext.getTools().then(async t => await document.modelContext.executeTool(t.find(x => x.name === 'search_products'), { search: '' }))"
   ```

3. **Place Order**:
   ```bash
   npx playwright cli eval "document.modelContext.getTools().then(async t => await document.modelContext.executeTool(t.find(x => x.name === 'place_order'), { productId: '<PRODUCT_ID>', quantity: 1 }))"
   ```

4. **Approve Order**:
   ```bash
   npx playwright cli eval "document.modelContext.getTools().then(async t => await document.modelContext.executeTool(t.find(x => x.name === 'approve_order'), { orderId: '<ORDER_ID>' }))"
   ```

5. **Get User Orders**:
   ```bash
   npx playwright cli eval "document.modelContext.getTools().then(async t => await document.modelContext.executeTool(t.find(x => x.name === 'get_my_orders'), {}))"
   ```

6. **Logout**:
   ```bash
   npx playwright cli eval "document.modelContext.getTools().then(async t => await document.modelContext.executeTool(t.find(x => x.name === 'logout_user'), {}))"
   ```

---

## 3. UI Fallback (For Pre-Login or Non-Tool Interactions)

If a page or element has no registered WebMCP tool:
* **Fill Input:** `npx playwright cli fill '<SELECTOR_OR_REF>' '<VALUE>'`
* **Click Element:** `npx playwright cli click '<SELECTOR_OR_REF>'`
* **Inspect Elements:** `npx playwright cli snapshot`
