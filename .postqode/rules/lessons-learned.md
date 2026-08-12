# Lessons Learned & Anti-Regression Rules

Durable process lessons from workflow corrections. Generic — applies to every batch and functional area in PostQode Nexus automation.

## 1. Ask the Broad Solving Question Before Narrow Searches
Before declaring a blocker or writing a new verification script, ask internally: *"What is the complete flow I'm automating, and what existing feature/page-object already covers most of it?"* Search `features/**` and `pages/**` semantically (not just exact words) before writing anything new.

## 2. Framework Pattern Search Before Live Verification
Before running a new Playwright verification script, check:
1. `.repository-intelligence/component-catalog/<area>.md` and `pattern-catalog.md` for already-verified locators/flows.
2. Existing `features/<area>/*.feature` for a similar setup/flow.
3. Existing `pages/*.py` for a method that already does what's needed.
Only write a new verification script for the genuinely missing piece.

## 3. Documentation Can Drift — Live Verification Is Still Mandatory
Appendix A of `docs/e2e-test-cases.md` is a strong hypothesis, not proof. Always confirm a locator/flow live via Playwright before marking it resolved in `plan.md` (see `02-plan-and-automate.md` Phase 3). Treat a mismatch between the doc and the live DOM as a normal, expected occurrence to document and resolve — not an error to panic over.

## 4. Missing Locator vs Missing Data vs Business Rule — Classify Precisely
- **Existing step/page-object method exists:** reuse it.
- **Locator genuinely missing/changed:** run a focused Playwright check for just that control.
- **Control renders but has no data/options:** this is a fixture/data problem — check `api_clients/` to seed the right precondition, not a locator problem.
- **Business rule unclear even after reading `docs/*.md`:** only then raise it as a genuine Open Question to the user.

## 5. Prove Data State, Not Just UI Actions
A successful click/toast does not prove the underlying state changed. After a setup action (e.g. approving an order), verify the resulting state via the UI (row/badge) or a read-only DB/API check — not just "no error was thrown."

## 6. Anti-Tunnel-Vision Checkpoint
At every phase boundary and before any blocker/escalation, briefly answer in `plan.md` or your reasoning:
- What existing feature/page-object did I check first?
- Is this a locator problem, a data problem, or a business-rule problem?
- Am I about to write a new script when reusing an existing one would work?

## 7. User Correction Handling
When corrected, acknowledge directly, re-read the suggested pattern immediately, update `plan.md` and this file if the lesson is durable/generalizable, and resume with the corrected approach — don't just patch the one instance and continue the same narrow method elsewhere.

## 8. Confidence-Based Reuse for Fragile UI Controls
Reuse an existing page-object method only if you're confident it matches the current component. If a control (dropdown, dialog, stepper) has failed 2+ times with slightly different locator variants, stop patching narrowly — write a more robust helper in `BasePage` (dialog-scoped lookup, retry with a different Playwright strategy) instead of a fourth narrow patch.

## 9. Dialog/Overlay Container-First Interaction
Always resolve the visible dialog (`page.get_by_role("dialog")`) before resolving any control inside it. Never use page-level locators for controls that might also exist behind an open modal (e.g. two "Save" buttons — one in a background form, one in the active dialog).

## 10. Assertion Scope Must Match Story Intent
Don't assert on incidental setup values that aren't part of the manual test's Expected Result column. If a dropdown selection is only needed to reach the next step, select any valid value and move on — the real assertion is the documented Expected Result, not the intermediate setup control's exact label.

## 11. Repeated UI Failures Need a Different Strategy, Not Repeated One-Shot Patches
If the same control fails 2–3 times with small variations of the same fix, stop. Re-resolve the whole flow fresh (re-navigate, re-open the dialog) rather than patching the same stale locator reference repeatedly.

## 12. Examples of Mistakes to Avoid
- Writing a brand-new Playwright verification script when an existing one for the same functional area already covers the check needed — extend, don't duplicate.
- Treating a documented Appendix A selector as verified without actually running a live check against `localhost:3000`.
- Asserting on a toast message text as the primary oracle when the real Expected Result is a persistent state change (row/badge/count).
- Hardcoding a demo credential string in a step file instead of loading it via `utils/config.py`.
- Writing direct SQL `INSERT`/`UPDATE` in a verification script "just this once" instead of using the REST API.
- Marking a batch `all_implemented` in `index.json` without a real `behave` run confirming `run_verified.status === "success"`.

## 13. Terminal Commands Must Be Self-Terminating (No Interactive/Paged Commands)
**Read this section before issuing the first `execute_command` call of any session/task** — this is the one exception to the JIT rule-loading protocol (`general-conventions.md §0`); terminal safety is cross-cutting, not phase-specific, and must not wait for a workflow phase to cite it.

The integrated terminal runs inside the chat tool loop — there is no way to send follow-up keystrokes (`q`, `Ctrl+C`, arrow keys, interactive prompts) to a command after it starts. Every `execute_command` call MUST run to completion and exit on its own without any human/agent interaction. Concretely:
- **Never invoke a pager.** Any command that can page (`git log`, `git diff`, `git show`, `less`, `man`, etc.) must be piped through `cat` or passed a flag that disables paging: `git --no-pager log`, `git -c core.pager=cat diff`, `| cat`, or add `--no-pager` globally for that invocation.
- **Never rely on sending `q`, `Ctrl+C`, or any key to a running process.** If a command might drop into an interactive/pager/REPL mode, prevent it up front (flags, env vars, redirecting stdin from `/dev/null` if needed) rather than trying to exit it after the fact.
- **Avoid long-running/blocking commands without a bound.** Dev servers, watchers, or `tail -f` must be started with `requires_approval:false` only when appropriate, and should be checked against "Actively Running Terminals" first — don't start a second blocking process you'll then be stuck unable to stop interactively. Prefer checking logs with a bounded read (`tail -n 50 file.log`) over an unbounded follow.
- **If a previous command left a terminal apparently hung (e.g. a pager waiting for input), do not try to "fix" it by sending more keystrokes as a new `execute_command` call** — those are new, independent invocations, not input to the stuck process. Instead, use a fresh, corrected, self-terminating command (or a non-terminal tool like `read_file`/`list_files`) to get the same information.
