---
description: A workflow that nukes the playwright environment
---

- run git reset head hard and git clean fd
- delete the tests-examples, test-results and playwright-report and test-report if it exists
- Ensure there are no activities running on localhost 8080 port if there are free them
- ensure that the chromium used for the mcp is free, but before you do that prompt the user asking if they have closed all previosuly open mcp browser instances.