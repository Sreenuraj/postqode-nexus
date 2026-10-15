---
name: playwright-cli
description: Run fast, stateful browser sessions, headed Chromium, and dynamic multi-action JavaScript execution using playwright-cli.
---

# Playwright CLI Skill

This skill guides the agent in using the **Playwright CLI** (`playwright cli`) to run high-speed, stateful browser automation across terminal commands.

---

## 1. Speed Best Practices

1. **Use `playwright cli` directly** (do not use `npx`, which adds a 1.5s cold-start penalty per call).
2. **Always pass `--raw`**: Prevents Playwright CLI from printing massive 500-line YAML page snapshots into the output. Output stays clean, fast, and saves thousands of tokens.
3. **Use `run-code` to batch actions**: Rather than running 20 individual CLI commands across 20 chat turns, execute multi-action steps inside a single `run-code` snippet.

---

## 2. Core Commands

* **Open Headed Browser:**
  ```bash
  playwright cli open <url> --headed
  ```
* **Run Dynamic Async Code (Fast & Batched):**
  ```bash
  playwright cli --raw run-code "async (page) => {
    await page.fill('#username', 'user');
    await page.fill('#password', 'User@123');
    await page.click('#submit');
    await page.waitForURL('**/dashboard');
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
