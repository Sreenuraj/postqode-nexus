# Workflow: Build Knowledge Base
**Location:** `.postqode/workflows/01-build-knowledge-base.md`

## Purpose
Build/update the Repository Intelligence Layer (RIL) at `.repository-intelligence/` from the existing `docs/` corpus, so a future agent given only a Test ID (e.g. `AUTH-E2E-001`) can understand what it does, how to reach it, what locators/patterns already exist, and what automation already covers it — without re-reading every doc from scratch.

This workflow is a **thin orchestrator**. It does not contain parsing/extraction procedures itself — those live in the skills it invokes.

## Input
The existing local Markdown docs — no parsing/conversion step needed, they're already Markdown:
- `docs/e2e-test-cases.md` (master E2E catalogue)
- `docs/functional-tests-dynamic-ui.md` (Insights / Command Center / My Activity deep dive)
- `docs/functional-tests-product-request.md` (Request Wizard deep dive)
- `docs/application-functionality.md`, `docs/requirement document.md` (functional overview)
- `docs/preferences_reference.md`, `docs/insight_CC_myactivity.md`
- `docs/testing-guide.md` (credentials, API reference, seed data)

## Pre-conditions
1. Check `.repository-intelligence/metadata.json`. Missing → **BOOTSTRAP mode** (build everything). Present → **UPDATE mode** (refresh only what's stale/changed).
2. Read `docs/e2e-test-cases.md` §1.2 (Navigation Map) and §1.1 (Credentials) first — these anchor the whole functional map.

## Phase 1 — Foundation
- **[Persona Activation] Activating Ingestion Specialist Persona**
- Invoke `test_case_parser` capability "Doc Corpus Scan" to read the overview docs and extract: system purpose, roles (Admin/User), functional areas (Dashboard, Insights, Products, Categories, Users, Order Management, Command Center, My Orders, My Inventory, My Activity, Request Product, Preferences), and the nav map.
- Write `.repository-intelligence/repository-overview.md` and `.repository-intelligence/framework-summary.md` (this second file documents the **Playwright + Python + behave** stack, `automation/` layout, and exact local run commands — see `rules/automation-framework.md`).
- Write/refresh `.repository-intelligence/metadata.json`.

## Phase 2 — Functional Map
- Invoke `enrichment_engine` capability "Functional Map Extraction" for each area in §2–§6 of `e2e-test-cases.md`, plus the two companion docs for Insights/Command Center/My Activity and the Request Wizard.
- Write one file per area under `.repository-intelligence/functional-map/<area>.md` (Auth, Dashboard, ProductCatalog, Categories, Users, OrderManagement, CommandCenter, Insights, MyOrders, MyInventory, MyActivity, RequestWizard, Preferences), plus `functional-map/index.md`.

## Phase 3 — Domain & Glossary
- Invoke `enrichment_engine` capability "Domain & Glossary Extraction".
- Write `.repository-intelligence/domain-summary.md` (entity relationships: Product↔Category, Order↔Product↔User, UserInventory↔Order, ActivityLog) and `.repository-intelligence/glossary.md` (SKU, PENDING/APPROVED/REJECTED/CANCELLED, ACTIVE/LOW_STOCK/OUT_OF_STOCK, etc.).

## Phase 4 — Component Catalog (seeded from Appendix A)
- Invoke `ril_writer` capability "Seed Component Catalog from Appendix A" to copy every selector from `e2e-test-cases.md` Appendix A into `.repository-intelligence/component-catalog/<area>.md`, each entry marked `status: hypothesis` (not yet `[Verified]` — verification only happens per-batch in Phase 3 of `02-plan-and-automate.md`).
- Invoke `ril_writer` capability "Seed Pattern Catalog from Appendix B" to translate the wait-strategy snippets in Appendix B into Playwright-Python `expect()` patterns in `.repository-intelligence/pattern-catalog.md`.

## Phase 5 — Test Catalog & Task Resolver
- Invoke `test_case_parser` capability "Enumerate All Test IDs" to list every Test ID from §2–§7 of `e2e-test-cases.md` into `.repository-intelligence/test-catalog.md`, initial `Automation Status = Manual`.
- Invoke `ril_writer` capability "Write Task Resolver" to produce `.repository-intelligence/task-resolver.md` mapping each functional area → its functional-map file, component-catalog file, and relevant pattern names.

## Phase 6 — Validate & Finalize
- **[Persona Activation] Activating QA Reviewer Persona**
- Invoke `qa_reviewer` capability "RIL Self-Test": pick one real Test ID (e.g. `USR-E2E-002`) and confirm it can be fully understood using only the RIL (no re-reading `docs/`). If not, fix the gap.
- Update `metadata.json` (`last_updated`, `last_validated`, `phase: "progressive"`).

## Completion Criteria
- [ ] `functional-map/` has an entry for every area in the nav map
- [ ] `component-catalog/` seeded from Appendix A for every documented selector
- [ ] `pattern-catalog.md` has the Appendix B wait strategies in Python form
- [ ] `test-catalog.md` lists every Test ID from the doc
- [ ] `task-resolver.md` has one row per functional area
- [ ] RIL self-test passed
