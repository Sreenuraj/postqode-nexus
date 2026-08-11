# PostQode General Conventions (PostQode-Nexus)

This file defines the universal conventions every `.postqode` workflow and skill must follow in this repository. It is a from-scratch rewrite for a Playwright + Python + behave stack — there is no Java, Maven, Jira, Xray, Confluence, or Oracle anywhere in this system.

## 0. Just-In-Time (JIT) Rule Loading Protocol (Mandatory)
- **No rule is ever pre-loaded or "always on."** Nothing in `.postqode/rules/` should be treated as ambient context loaded at session/conversation start. Every rule file is read **only** at the exact point a workflow phase or skill capability names it as needed — not before, not "just in case."
- **Workflows and skills must cite the exact file path at the point of need.** Every workflow phase and every skill capability that depends on a rule must name that rule's relative path inline (e.g. "per `.postqode/rules/fixture-api-rules.md`") right next to the instruction that needs it — never as a blanket "these rules apply to this whole file" list disconnected from where they're actually used.
- **Read before acting, not before starting.** When a workflow phase or skill step is reached and it cites a rule file, read that specific file at that moment (if not already read this session), apply it, then proceed. Do not read rule files for phases/capabilities you haven't reached yet.
- **This file itself is no exception.** `general-conventions.md` is loaded only when a workflow/skill step explicitly cites it (e.g. "per `general-conventions.md §4`") — never assumed to be in context by default.
- **Violation:** A workflow or skill file that lists rule files in a header/preamble as "loaded" for the entire file, without tying each one to the specific phase/capability that needs it, must be corrected to cite them inline at point of use instead.

## 1. RIL Operating Contract & Context Boundaries

- **Lessons-Learned Guardrail:** Obey `.postqode/rules/lessons-learned.md` before declaring blockers, writing verification scripts, or starting live browser checks. The anti-tunnel-vision checkpoint (§6 of that file) is mandatory at every phase boundary and blocker/escalation point.
- **Strict Boundary:** Load only the specific functional area's `functional-map/<area>.md` and `component-catalog/<area>.md` pointed to by `task-resolver.md`. Never scan the entire `.repository-intelligence/` directory for a single-area task.
- **Write-back is mandatory:** Persist newly discovered/verified locators, flows, and rules to the RIL before concluding a batch.
- **Context Budget:** Prefer minimal sufficient reads; check `task-resolver.md` first.
- **Universal Index Merging Rule:** Read the current state of `index.json` / `index-archive.json` from disk first, merge in-memory, then save back (never overwrite blindly — see §5).
- **Universal Schema Contract:** Any skill that reads/updates `index.json`, `index-archive.json`, or `batch-meta.json` MUST strictly follow `.postqode/rules/batch-schema.md`.

## 2. User-Input Contract
- Structured questions to the user must use the `ask_followup_question` tool with 2–5 concrete options — never ask a question as plain chat text with no options when a decision is required.
- Do not ask multiple unrelated questions in a single call.

## 3. RIL-First Search Policy (Mandatory)
- Before grepping `automation/` source files to find an existing step, page object method, or locator, check the RIL first: `component-catalog/<area>.md`, `pattern-catalog.md`, `functional-map/<area>.md`, and `exploration-ledger.json`.
- If the RIL has no answer, then (and only then) search `automation/pages/`, `automation/features/steps/`, and `automation/features/` directly.
- If a raw-codebase search finds something the RIL missed, update the RIL before finishing the batch.

## 4. Terminal-Execution Policy
- **Autonomous execution is allowed.** The agent may run `pip install`, `playwright install`, `behave`, Python verification/utility scripts, `psql` read-only queries, and standard git commands (`git add`, `git status`, `git diff`) autonomously via the terminal — no per-run user approval gate for these specific commands (this repository is a local demo app, not a shared enterprise environment).
- **Destructive/impactful commands** (e.g. `./scripts/reset-demo.sh`, which truncates tables) still go through the tool's normal approval flow since they mutate shared demo data — call these out explicitly to the user before running them the first time in a session.
- **No interactive/paging commands.** Never run a command that can open a pager, editor, or prompt and block waiting for a keystroke. Use `git --no-pager diff`, `git --no-pager log`, etc. This project runs on macOS/zsh — do not assume Windows/PowerShell syntax.
- **No shell echo-only commands.** Status updates, summaries, and questions to the user must be written directly in the chat response, never executed as a terminal command purely to print text.

## 5. Universal Index Merging Rule
- Never overwrite `index.json` or `archive/index-archive.json`. Every skill that touches these files MUST:
  1. Read current state from disk.
  2. Merge changes in-memory.
  3. Write back the merged result.
- Applies to `test_case_parser`, `enrichment_engine`, `code_generator`, `batch_cleanup`, `archiver`, `ril_writer`.

## 6. Universal RIL Sanitization Rule
- Before writing to any shared RIL file (`test-catalog.md`, `metadata.json`, `component-catalog/*.md`, `functional-map/*.md`, `pattern-catalog.md`, `glossary.md`), strip batch-specific identifiers (`batch-\d+`, absolute local paths, ad-hoc temp project/order IDs created purely for a single test run) before writing.
- Exception: `.repository-intelligence/reusable-fixtures.json` MAY contain concrete fixture IDs (product SKUs, order IDs, usernames) — it is the fixture cache and is explicitly whitelisted.

## 7. Workflow-Run State
- Batch progress lives in `.repository-intelligence/test-outputs/index.json` and each batch's `batch-meta.json` (see `batch-schema.md`). There is no separate JVM-style "workflow-run-state.json" process in this system — the batch metadata itself is the source of truth for "where a batch is" across sessions.
- On resuming a batch in a new session, read `batch-meta.json.status` and the phase checkboxes in that batch's `plan.md` to determine where to continue.

## 8. Adhoc Interruption Handling
- If the user interrupts a running batch with an unrelated request, acknowledge briefly ("pausing batch-NNN at Phase N, will resume after"), do the request, then offer to resume the batch. Do not silently abandon a batch mid-phase.

## 9. Persona Activation Logging
- Print `[Persona Activation] Activating <Persona> Persona` when switching persona context within the merged workflow (`02-plan-and-automate.md`). Personas:
  - **Ingestion Specialist** — Phase 1 (parsing `docs/e2e-test-cases.md`).
  - **Architect** — Phases 2–5 (static enrichment, mandatory live verification, plan finalization, plan QA review). **Live verification (Phase 3) is always the Architect's responsibility, never skipped, never delegated to the Developer persona.**
  - **Developer** — Phases 6–8 (code generation, autonomous run/debug, code QA review).
  - **RIL Archivist** — Phase 9 (write-back).
- Bypassing persona activation logging to skip a review gate is a workflow violation.

## 10. Completion Summaries
- Every batch run (whether it finishes fully or pauses for user input) ends with a short `## Completion Summary` block (max ~10 lines): **Current Status**, **Action Taken**, **Next Action / Question for User** (bolded). Do not dump full checklists or logs into this summary.
- Do not call `attempt_completion` while a question is pending or a gate hasn't been satisfied.

## 11. Shared Code Integrity (Additive-Only)
- Never edit or delete the body/signature of an existing method in a shared module (`pages/base_page.py`, `api_clients/*.py`, `utils/*.py`, `steps/common_steps.py`) to fix a single test. Add a new method with a distinct name instead, unless the fix is a genuine, narrowly-scoped bug fix that all consumers need (verify via `git diff` review in `qa_reviewer` before merging such a change).
- New page objects, step defs, and feature files are always additive.

## 12. Credentials Handling
- Demo credentials (`admin/Admin@123`, `user/User@123`) are low-sensitivity but still must be loaded from `automation/.env` (via `utils/config.py`), never hardcoded inline across multiple step/page files. `.env` is gitignored; `.env.example` documents the required keys.
- Never write real credential values into `plan.md`, RIL files, or committed feature files.

## 13. DB Safety
- All Postgres access from `utils/db_helper.py` and any verification script must be strictly read-only (`SELECT` statements). Never `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` from automation or verification code — schema mutation and demo-data reset only happens via `./scripts/reset-demo.sh` or the app's own REST API.
