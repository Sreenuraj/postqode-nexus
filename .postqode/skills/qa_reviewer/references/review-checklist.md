# Review Checklist Reference

## Plan Review (Phase 5) — quick checklist
- [ ] Every Test ID has a Scenario/Scenario Outline
- [ ] Gherkin matches manual steps word-for-word on Expected Result
- [ ] Every locator/flow checklist row has Live Verification Evidence
- [ ] Every precondition classified API-First or UI-Setup with reason
- [ ] Data-driven plan correctly separates Examples: vs data/*.json
- [ ] Open Questions are business-rule only, not technical gaps
- [ ] No credential strings in plan.md

## Code Review (Phase 8) — quick checklist
- [ ] `git diff` on shared files shows additive-only changes
- [ ] No assertions inside `pages/*.py`
- [ ] No raw `page.locator`/`get_by_*` in step files (except `common_steps.py` generic waits)
- [ ] No large hardcoded data blocks that should be in `data/*.json`
- [ ] Every Expected Result has a corresponding assertion
- [ ] No hardcoded credentials
- [ ] No duplicate locator methods
