---
description: 
---


run

npm init playwright@latest

Configure `playwright.config.js` with a global timeout of 5000 ms, explicit `actionTimeout` 1000 ms, viewport 800 × 600

Turn the server off in playwright.config.js, open should be set to never

```
reporter: [
    ['html', { open: 'never' }],   // write the report, but don’t start the server
    ['list']                       // (optional) your preferred console reporter
  ],
```