---
description: Stage, commit with AI-generated message, and push to GitHub
auto_execution_mode: 3
---

# Git Push Workflow

This workflow stages all changes, generates a commit message based on the diff, commits, and pushes to GitHub.

## Steps

1. **Stage all changes**
   ```bash
   git add -A
   ```

2. **Generate commit message from staged changes**
   - Analyze the git diff to understand what changed
   - Create a concise, descriptive commit message following conventional commit format
   - Message should be clear and explain the "what" and "why" of changes

3. **Commit with the generated message**
   ```bash
   git commit -m "[generated message]"
   ```

4. **Push to remote**
   ```bash
   git push
   ```

## Notes

- If there are no changes to commit, the workflow will notify you
- If push fails due to remote changes, you may need to pull first
- The commit message will follow best practices (imperative mood, concise, descriptive)