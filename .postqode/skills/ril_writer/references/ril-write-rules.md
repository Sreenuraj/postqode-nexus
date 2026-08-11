# RIL Write Rules Reference

- Read-merge-write on every shared file — never overwrite wholesale.
- One entry per locator/pattern/flow; update in place if it already exists rather than appending a duplicate.
- Every entry must cite its source (which batch/Test ID first verified it) and a date, for auditability, but the *batch ID itself* must be sanitized out of the final catalog text per `sanitization-rules.md` — cite the functional area and date instead.
- Confidence levels: `Verified` (confirmed live via Playwright in this project), `Hypothesis` (from Appendix A/docs, not yet verified).
