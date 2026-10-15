---
name: playwright-cli
description: Verify and install the latest Playwright CLI (>= 1.64.0) with Chrome WebMCP flag support, and execute headed/headless browser tests.
---

# Playwright CLI & WebMCP Setup Skill

This skill ensures that Playwright CLI (version 1.64.0 or higher) is installed, configured with the Chrome WebMCP testing flag, and ready to execute browser tests.

---

## 1. Verify Installation

Check the installed Playwright CLI version in `frontend/`:

```bash
cd frontend
npx playwright --version
```

### Minimum Version Requirement
* **Playwright $\ge$ 1.64.0** is required for Chromium builds that support Google Chrome's WebMCP (`document.modelContext`) API.

---

## 2. Install or Upgrade (If Missing or Outdated)

If Playwright is not installed or version is below `1.64.0`, run:

```bash
cd frontend
npm install -D @playwright/test@latest
npx playwright install chromium
```

---

## 3. Verify WebMCP Browser Launch Configuration

WebMCP requires Chromium to be launched with the `--enable-features=WebMCPTesting` switch. Ensure `frontend/playwright.config.ts` includes:

```typescript
launchOptions: {
  args: [
    '--enable-features=WebMCPTesting',
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
}
```

---

## 4. Execution Commands

| Mode | Command | Pacing |
| :--- | :--- | :--- |
| **Headed Demo (Smooth)** | `npm run demo:webmcp` | Headed, human-visible (~2s) |
| **Headed Traditional Demo** | `npm run demo:traditional` | Headed, 500ms slowMo (~18s) |
| **Both Side-by-Side** | `npm run demo` | Headed sequential |
| **Headless E2E Suite** | `npm run test:e2e` | Fast, CI-ready (~17s) |
| **Custom SlowMo** | `SLOWMO=600 npm run demo:traditional` | Custom delay per action |

---

## 5. Visual Execution Mandate (Headed Mode)

* When the user requests to **"open browser"**, **"navigate"**, **"run test"**, or **"demo"**, **ALWAYS run in HEADED mode** (`npm run demo:webmcp`, `npm run demo:traditional`, or `npm run demo`).
* Users expect to visually see the Chromium browser launch on their desktop.
* If writing a standalone Playwright script, **ALWAYS configure `headless: false` and `slowMo: 300`**. Never run headless unless the user explicitly types "headless".

