---
description: Perform PR analysis, remediate errors, and push changes using GitHub CLI
---

# PR Analysis and Remediation Workflow

This workflow helps you analyze a pull request, identify and fix issues, and push the remediated changes back to the repository.

## Prerequisites
- GitHub CLI (`gh`) installed and authenticated
- Repository cloned locally
- Appropriate permissions to push to the branch

## Steps

1. **Fetch the latest PR information**
```bash
gh pr list --state open
```

2. **Checkout the PR branch**
```bash
gh pr checkout <PR_NUMBER>
```

3. **Analyze PR changes and get diff**
```bash
gh pr diff <PR_NUMBER>
```

4. **Check PR status and reviews**
```bash
gh pr view <PR_NUMBER> --json reviews,statusCheckRollup
```

5. **Run automated checks locally**
// turbo
```bash
npm test
```

6. **Run linting and formatting**
// turbo
```bash
npm run lint
```

7. **Fix any linting issues automatically**
// turbo
```bash
npm run lint:fix
```

8. **Run type checking (if applicable)**
// turbo
```bash
npm run type-check
```

9. **Stage and commit any fixes**
```bash
git add .
git commit -m "fix: remediate PR analysis findings"
```

10. **Push the remediated changes**
```bash
git push origin HEAD
```

11. **Add a comment to the PR about the remediation**
```bash
gh pr comment <PR_NUMBER> --body "🔧 Automated remediation applied:
- Fixed linting issues
- Resolved test failures
- Applied code formatting
Ready for re-review!"
```

12. **Request re-review if needed**
```bash
gh pr review <PR_NUMBER> --request-changes --body "Please review the automated fixes applied"
```

## Optional: Advanced Analysis

13. **Check for security vulnerabilities**
```bash
npm audit
```

14. **Run performance tests**
```bash
npm run test:performance
```

15. **Generate coverage report**
```bash
npm run test:coverage
```

## Notes
- Replace `<PR_NUMBER>` with the actual PR number
- Ensure you have the necessary permissions before pushing changes
- Review automated fixes before committing to avoid introducing new issues
- Consider running the full test suite after remediation
