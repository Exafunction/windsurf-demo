---
description: Playwright browsers tester that uses MCP to test a browser writes tests, and then tests the output of the tests to ensure they pass. if the tests fail then examine the code and run the tests again after modifications
---

Activate the virtual environment and confirm Python version

source venv/bin/activate && python --version

Run the application

python app.py

If port 8080 is in use, free it and retry

lsof -ti:8080 | xargs kill -9   # terminate the blocking process
python app.py                   # restart the server

Explore the site manually

Before generating tests, manually explore and interact with the running site using the Playwright MCP server (or codegen) to inspect the actual DOM structure and CSS styles:

npx playwright codegen http://localhost:5000
# or start the MCP server if enabled

Generate Playwright tests, strictly based on your manual interactions and current site state

Locator strategy

Prioritise role‑based locators for standard elements.

Prefer [data-testid] or explicit id selectors before falling back to CSS for custom‑styled components.

Custom UI elements

Pay special attention to controls like toggle switches whose interactive inputs may be hidden (opacity: 0); interact with the visible container or label instead.

Assert logical state with toBeChecked() (or similar) rather than visibility of hidden inputs.

Dynamic panels & visibility

Precede actions on expandable panels (e.g., settings drawers) with

await expect(locator).toBeVisible();

Confirm both visual visibility and logical checked/selected states for toggle or checkbox components, using specific ID selectors if role‑based locators are not reliable.

Auto‑waiting & strict mode

Use Playwright’s built‑in auto‑waiting assertions such as toHaveText() and toHaveCount().

If a locator matches multiple elements in strict mode, refine it with .filter() or .nth() instead of disabling strictness.

Timing

Avoid arbitrary waits; if an explicit timeout is unavoidable, keep it ≤ 1000 ms and use waits only when essential to ensure loading completion.

Headless runs

Do not pass --ui or --headed when running tests or generating reports.

Stability

Structure tests around stable UI interactions and avoid elements tied to volatile data (e.g., live scores or leaderboards) to prevent flaky outcomes.

Run the test suite