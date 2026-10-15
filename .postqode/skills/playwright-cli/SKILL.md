---
name: playwright-cli
description: Control persistent browser sessions, open headed Chromium, interact with web pages, and evaluate code using the Playwright CLI.
---

# Playwright CLI Skill

This skill guides the agent in using the **Playwright CLI** (`npx playwright cli` or `playwright-cli`) to run an interactive, stateful browser session across terminal commands.

---

## 1. Browser Lifecycle

* **Open Headed Browser:**
  ```bash
  npx playwright cli open <url> --headed
  ```
  This launches a visible Chromium browser on the desktop and navigates to the URL. The session remains open and persistent across subsequent commands.

* **Close Browser:**
  ```bash
  npx playwright cli close
  ```

* **Force Kill Stale Sessions:**
  ```bash
  npx playwright cli close-all
  ```

---

## 2. Page Interaction Commands

* **Fill Input:**
  ```bash
  npx playwright cli fill '#login-input-username' 'user'
  ```
* **Click Element:**
  ```bash
  npx playwright cli click '#login-button-submit'
  ```
* **Evaluate JavaScript:**
  ```bash
  npx playwright cli eval "document.title"
  ```
* **Page Snapshot:**
  ```bash
  npx playwright cli snapshot
  ```
* **Navigate to New URL:**
  ```bash
  npx playwright cli goto '<url>'
  ```

---

## 3. WebMCP Testing Configuration

The browser must run with the `--enable-features=WebMCPTesting` Chrome flag. This is automatically configured globally in `~/.playwright/cli.config.json`:

```json
{
  "browser": {
    "launchOptions": {
      "headless": false,
      "args": [
        "--enable-features=WebMCPTesting",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    }
  }
}
```
Whenever `npx playwright cli open` is invoked in any directory, it loads these Chromium flags and launches visibly.
