#!/usr/bin/env bash
# Open the Allure report for the UI E2E suite.
# Usage: ./scripts/open-allure-report.sh
# NOTE: never invoked automatically by test runs — run manually after a batch.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS="$ROOT/automation/allure-results"
REPORT="$ROOT/automation/allure-report"

if [ ! -d "$RESULTS" ] || [ -z "$(ls -A "$RESULTS" 2>/dev/null)" ]; then
  echo "No Allure results found at $RESULTS."
  echo "Run a batch first: cd automation && npx playwright test"
  exit 1
fi

echo "Generating Allure report..."
cd "$ROOT/automation"
npx allure generate "$RESULTS" --clean -o "$REPORT"

echo "Opening Allure report..."
npx allure open "$REPORT"
