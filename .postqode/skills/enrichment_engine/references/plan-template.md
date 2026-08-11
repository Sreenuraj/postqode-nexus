<!-- plan-template-version: 1-nexus -->
# Batch Plan: batch-NNN (<Area>)

**Status:** ⚠️ DRAFT — Live Verification Pending  _(remove this line once Phase 4 finalizes the plan)_

## 1. Test IDs in This Batch
| Test ID | Title | Status |
|---|---|---|
| AUTH-E2E-001 | Admin login success | buildable |

## 2. Gherkin Outline (draft)
```gherkin
@AUTH-E2E-001 @admin
Scenario: Admin login success
  Given ...
  When ...
  Then ...
```

## 3. Locator / Flow Verification Checklist
| Element/Flow | Appendix A Hypothesis | Verification Script | Result | Final Locator/Flow |
|---|---|---|---|---|
| Login username input | `login-input-username` | `brain/scripts/verify_auth.py` | [Pending Verification] | — |

## 4. Live Verification Evidence
_(populated in Phase 4 from Phase 3's script run — one row per checklist item)_
| Element/Flow | Script Path | What Was Checked | Observed Result | Pass/Fail |
|---|---|---|---|---|

## 5. Fixture Classification
| Precondition | Classification | Mechanism |
|---|---|---|
| At least one PENDING order | [API-First] | `api_clients/order_client.py::create_order()` |

## 6. Data-Driven Plan
| Scenario aspect | Approach | Source |
|---|---|---|
| Role/credential variation | Scenario Outline + Examples | inline |
| Product fixtures | data/*.json | `data/products.json` |

## 7. Implementation Build Stages
- [ ] `automation/features/<area>/<file>.feature`
- [ ] `automation/features/steps/<area>_steps.py`
- [ ] `automation/pages/<Class>.py`
- [ ] `automation/data/<file>.json` (if needed)

## 8. Open Questions
_(business-rule ambiguities only — none yet)_

## 9. QA Review Sign-off
Status: [ ] Approved

## 10. QA Code Review Sign-off
Status: [ ] Code Approved
