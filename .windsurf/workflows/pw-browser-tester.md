---
description: Playwright browsers tester that uses MCP to test a browser writes tests, and then tests the output of the tests to ensure they pass. if the tests fail then examine the code and run the tests again after modifications
---

Start my flask application app.py

if the application says that something else is on port 5000 kill it, then try again 

Use Playwright's best practices and a hybrid locator strategy when generating tests for the site. Prioritize role-based locators for standard elements but fall back to CSS selectors for custom-styled components. Ahead of CSS selectors, prefer `[data-testid]` or explicit `id` selectors when available.

Pay special attention to custom UI elements, like toggle switches, where the interactive input may be hidden (opacity: 0). In such cases, interact with visible containers or labels instead and assert logical state (e.g., `toBeChecked()`) rather than visibility of the hidden input.

Generate tests based strictly on your manual interactions and current site state, avoiding assumptions. Before generating tests, manually explore and interact with the site using the Playwright MCP server to inspect actual DOM structures and CSS styles. 

Ensure interactions with dynamic panels (e.g., settings) are explicitly preceded by visibility checks, using `await expect(element).toBeVisible()`. Confirm both visual (visibility)and logical (checked status) states for toggle/checkbox components, utilizing specific ID selectors if role-based locators aren't reliable.

Employ Playwright’s auto-waiting assertions (`expect(locator).toHaveText()`, `toHaveCount()`, etc.) and leverage the `.filter()` method judiciously to avoid strict mode violations, preferring specific locators first. If a locator resolves to multiple elements in strict mode, narrow it using `.filter()` or `.nth()` rather than disabling strictness. Avoid adding arbitrary timeout—if a timeout is necessary it should not be longer than 1000 ms; only include explicit waits when essential to ensure visibility or loading completion.

Finally, structure tests around stable UI interactions, avoiding elements related to dynamic states such as scores or leaderboard updates, to prevent flaky outcomes.

Do not use `--ui` flag or `--headed` generally when producing a test/report