---
name: playwright-cli
description: Run stateful browser sessions, headed Chromium, and dynamic JavaScript execution using playwright-cli.
---

# Playwright CLI Skill

This skill guides the agent in using the **Playwright CLI** (`playwright cli`) to run high-speed browser automation.

---

## 1. Speed & Portability Best Practices

1. **Primary Command**: Use `playwright cli` directly. If not installed globally or in PATH, fallback to `npx -y playwright cli`.
2. **Always pass `--raw`**: Prevents printing large default output, keeping responses clean and fast.
3. **Use `run-code` to batch actions**: Execute sequential actions inside a single `run-code` snippet rather than running multiple CLI commands across separate turns.
4. **Avoid `snapshot` when structured tools exist**: DOM snapshots dump large token trees and should only be used when an element locator cannot be determined through other means.

---

## 2. Core Commands

* **Open Headed Browser:**
  ```bash
  playwright cli open <url> --headed
  ```
* **Run Dynamic Async Code:**
  ```bash
  playwright cli --raw run-code "async (page) => {
    // page actions
    return await page.title();
  }"
  ```
* **Evaluate Single Expression:**
  ```bash
  playwright cli --raw eval "<expression>"
  ```
* **Close Browser Session:**
  ```bash
  playwright cli close
  ```
* **Force Kill Stale Sessions:**
  ```bash
  playwright cli close-all
  ```

---

## 3. Environment Prerequisites & Self-Healing

1. **Missing Playwright CLI**:
   - If `playwright: command not found` occurs, switch to `npx -y playwright cli`.
2. **Missing Browser Executable**:
   - If browser launch fails with missing browser error (`Executable doesn't exist`):
     ```bash
     playwright install chromium || npx -y playwright install chromium
     ```
   - Then re-run the open command.
