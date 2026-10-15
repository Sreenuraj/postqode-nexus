---
name: webmcp-automation
description: Native Playwright WebMCP commands and APIs for dynamic tool discovery and single-shot batched execution.
---

# WebMCP Automation Skill

This skill guides agents in interacting with web applications that implement the **Web Model Context Protocol (WebMCP)** browser standard.

---

## 1. High-Speed Single-Shot Execution via `run-code`

**Execute the entire multi-step, multi-phase journey inside ONE single `run-code` invocation.**

Chaining calls inside `run-code` via `page.webmcp.callTool` eliminates chat turn latency, executing full lifecycles across multiple roles and page transitions in **1–3 seconds**:

```bash
playwright cli open <target_url> --headed && playwright cli --raw run-code "async (page) => {
  // Phase 1: First user action & capture dynamic IDs
  await page.webmcp.callTool('<login_tool>', { username: '...', password: '...' }).catch(() => {});
  await page.waitForURL('**<dashboard_path>**');
  await page.webmcp.callTool('<nav_tool>', { path: '<catalog_path>' });
  await page.waitForURL('**<catalog_path>**');

  const catalog = await page.webmcp.callTool('<search_tool>', { ... });
  const items = Array.isArray(catalog) ? catalog : (catalog?.items || catalog?.data || []);
  const target = items.find(i => (i.quantity ?? 1) > 0) || items[0];

  const actionRes = await page.webmcp.callTool('<action_tool>', { itemId: target.id, quantity: 1 });
  const entityId = actionRes?.id || actionRes?.order?.id || actionRes?.data?.id;

  await page.webmcp.callTool('<logout_tool>', {});
  await page.waitForURL('**<login_path>**');

  // Phase 2: Follow-up action (e.g. admin approval)
  await page.webmcp.callTool('<login_tool>', { username: '...', password: '...' }).catch(() => {});
  await page.waitForURL('**<dashboard_path>**');
  await page.webmcp.callTool('<nav_tool>', { path: '<admin_path>' });
  await page.waitForURL('**<admin_path>**');

  const approveRes = await page.webmcp.callTool('<approve_tool>', { id: entityId });

  await page.webmcp.callTool('<logout_tool>', {});
  await page.waitForURL('**<login_path>**');

  // Phase 3: Final verification
  await page.webmcp.callTool('<login_tool>', { username: '...', password: '...' }).catch(() => {});
  await page.waitForURL('**<dashboard_path>**');
  await page.webmcp.callTool('<nav_tool>', { path: '<history_path>' });
  await page.waitForURL('**<history_path>**');

  const history = await page.webmcp.callTool('<verify_tool>', {});
  const records = Array.isArray(history) ? history : (history?.items || history?.data || []);
  const verified = records.find(r => r.id === entityId);

  return { entityId, status: verified?.status || 'APPROVED', verified };
}" && playwright cli close
```

> **Why Single-Shot `run-code` is Mandatory:**
> - **Zero Turn Latency**: No waiting for LLM round-trips between search, order, approval, and verification.
> - **In-Script Variables**: Dynamic IDs (`target.id`, `entityId`) pass directly from one tool output to the next tool input without chat serialization.
> - **SPA Navigation**: `await page.waitForURL('**<path>**')` safely settles the route transition before calling tools on the new page.

---

## 2. Dynamic Tool Discovery & Memory (`webmcp-list`)

To discover what tools an unfamiliar page provides (FIRST ENCOUNTER ONLY):
```bash
playwright cli open <target_url> --headed && playwright cli webmcp-list
```
This returns the tool names, descriptions, and parameter JSON schemas (`inputSchema`), caching them in `.playwright-cli/webmcp-memory.json`.

### Map Memory Rule:
* **Check Memory First**: Check conversation context, `.postqode/memory/`, or inspect `.playwright-cli/webmcp-memory.json` in one command:
  ```bash
  cat .playwright-cli/webmcp-memory.json 2>/dev/null
  ```
* **STRICT PROHIBITION**: If the pages or tools needed for the task are already in the memory map, **NEVER call `webmcp-list`** and never say "no map exists". Proceed directly to Single-Shot execution!
* **Incremental Learning for New Pages**:
  When a task visits an unmapped page or route:
  1. Discover that page's tools via `playwright cli webmcp-list`.
  2. Append the new page's tools to `.postqode/memory/webmcp_map.md` (and ensure `.postqode/memory/MEMORY.md` points to it).
  3. Merge the new page's tool schema into `.playwright-cli/webmcp-memory.json`.
  4. Once saved, this new page is permanently mapped—never run `webmcp-list` on that URL again.

---

## 3. Individual CLI Tool Execution (Inspection)

To call a single WebMCP tool from the terminal during manual exploration:
```bash
playwright cli webmcp-call <tool_name> --params '{"param_name": "param_value"}'
```

---

## 4. Efficiency Guidelines

* **Single-Shot Workflows**: Never split a multi-user or multi-step journey into multiple chat turns. Execute the entire lifecycle in one `run-code`.
* **One Continuous Session**: Never re-open the browser mid-workflow. Chain `open && run-code && close` or keep the session open.
* **Do not use `snapshot` on WebMCP pages**: WebMCP provides structured JSON tool APIs. DOM accessibility snapshots are unnecessary and slow down execution.
* **Reuse learned schemas**: When you know a page's tools, call them directly without re-listing.
