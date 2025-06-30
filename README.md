## TL;DR    

A windsurf-demo production that highlights how the Playwright MCP plugin and workflows can automate testing. By iteratively prompting and troubleshooting, you achieve reliable and visually verifiable testing outcomes.
_Demo length ~ 5 - 7 minutes_

# Playwright MCP Demo

This repository demonstrates how to use the Playwright MCP plugin effectively, specifically tailored for showcasing the windsurf-demo.
There are two important workflows:

- pw-mcp-setup, sets up the file
- pw-browser-tester, runs the browser tests
- nuke-pw, takes it down from scratch, use this for errors

## Overview

This project provides a guided way of running the Playwright MCP demo, which includes three key phases:

1. **Setup**: Prepare your environment and install necessary dependencies.
2. **Execution**: Run the defined Playwright MCP workflow.
3. **Analysis**: Evaluate and troubleshoot the results produced by the workflow with a visual demonstration.

## Demo Workflow

Follow these steps to successfully execute and demonstrate the workflow:

### 1. Setup the Project

* Install the **Playwright MCP Plugin** using the json below (avoid using the plugin from Windsurf Store as it's out of date).

Add the following to your Windsurf MCP config (Click Hammer Icon above cascade chat > Configure):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### 2. Execute the Workflow - Use the prompt below

* Initiates the workflow by running `autonomous-qa-agent`. This automatically installs required npm packages and runs tests for this demo with best practices.

* Prompt the workflow to handle the Dark Mode use case explicitly, this works and is repeatable. I would recommend experimenting with other use cases if you wish :) (If you can think of any cool semi-reliable ones let me know!) 

A recommended prompt is (prompt + workflow at once):

  ```
  /autonomous-qa-agent

  Create tests for dark mode. Write four tests for dark mode:
  - Open the settings panel
  - Toggle dark mode ON
  - Toggle dark mode OFF
  - Close the settings panel
  ```

### 3. Analyze and Visualize the Results

* Due to non-deterministic behaviors of LLM-based agents, some tests may initially fail.
* Analyze the failures with follow-up prompts to diagnose and resolve code issues.
* Once issues are fixed, visually confirm success by prompting:

```
Run the tests and use MCP to show browser actions.
```
* Sit back and watch 🍿
  * When it initially runs it the tests usually fail, it also attempts to self-rectify  


---

## Known Issues

* **Using the Playwright MCP plugin from Windsurf Plugin Store is out of date.**
* The MCP fails to find the port when it's not on 5000 exactly, attempts to edit the file. Run nuke-pw before you start. 
* In the rare instance it does something strange with windsurf browsers and your chrome profile (I cannot reproduce this), exit windsurf entirely and re-open it. 
* Much higher chance of glitching out with Claude 3.7, use Claude 4
* I have not tested with other models
* **If the tool calls for the Playwright MCP fail, refresh all MCP servers (hammer icon > refresh) and continue - this one happens frequently**
