---
name: webmcp-automation
description: Fast, dynamic discovery and execution of Google Chrome WebMCP tools using playwright-cli run-code and eval.
---

# WebMCP Automation Skill

This skill teaches PostQode agents how to interact with web applications that expose the **Google Chrome WebMCP (Model Context Protocol)** API (`document.modelContext`).

---

## 1. High-Speed Tool Execution via `run-code`

WebMCP tools run directly inside the browser's JavaScript runtime via `document.modelContext`.

Calling them inside `playwright cli --raw run-code` executes the entire multi-step flow natively in sub-seconds:

```bash
playwright cli --raw run-code "async (page) => {
  return await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    const searchTool = tools.find(t => t.name === 'search_products');
    const orderTool = tools.find(t => t.name === 'place_order');
    const products = await document.modelContext.executeTool(searchTool, {});
    const target = products[0];
    return await document.modelContext.executeTool(orderTool, { productId: target.id, quantity: 1 });
  });
}"
```

---

## 2. Dynamic Tool Discovery

When discovering tools on the current page:

```bash
playwright cli --raw eval "document.modelContext ? document.modelContext.getTools().then(tools => JSON.stringify(tools.map(t => ({ name: t.name, description: t.description, schema: t.inputSchema })))) : 'No WebMCP'"
```

---

## 3. Registered Tool Catalog in Nexus

* **`navigate_to_page`**: Client-side router navigation (`path: string`).
* **`get_current_user_profile`**: Auth state and permissions.
* **`search_products`**: Query product catalog with JSON array return.
* **`place_order`**: Direct purchase order placement (`productId: string, quantity: number`).
* **`get_orders`**: List all orders (Admin).
* **`approve_order`**: Approve pending order (`orderId: string`).
* **`get_my_orders`**: List orders placed by current user.
* **`logout_user`**: Clear session and redirect to `/login`.
