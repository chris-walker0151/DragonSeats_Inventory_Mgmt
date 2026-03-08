# Claude Code PR Workflow

Detailed reference for the branch → PR → CI → merge workflow.

## Step-by-Step Procedure

### 1. Start from latest main
```bash
git checkout main && git pull origin main
```

### 2. Create a feature branch
```bash
git checkout -b feat/my-feature
```

### 3. Make changes
- Edit code, run dev server, verify affected pages work
- Keep changes focused — one logical unit per PR

### 4. Commit and push
```bash
git add <specific-files>
git commit -m "Add feature description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push -u origin feat/my-feature
```

### 5. Open a PR
```bash
gh pr create --title "Add feature description" --body "$(cat <<'EOF'
## Summary
- What changed and why

## Test plan
- [ ] Dev server verified
- [ ] Affected pages checked
- [ ] No console errors

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 6. Wait for CI
```bash
gh pr checks <number> --watch
```

### 7. Fix CI failures (if any)

| Failure     | Fix                                                    |
|-------------|--------------------------------------------------------|
| Lint errors | Run `npm run lint`, fix issues, commit, push           |
| Type errors | Run `npx tsc --noEmit`, fix issues, commit, push       |
| Build fails | Run `npm run build` locally with placeholder DB URL    |

After fixing, push again — CI re-runs automatically.

### 8. Squash-merge
```bash
gh pr merge <number> --squash
```
The branch is auto-deleted after merge.

### 9. Return to main
```bash
git checkout main && git pull origin main
```

## Rules Summary

| Rule                          | Enforced by          |
|-------------------------------|----------------------|
| No direct commits to main     | CLAUDE.md (self)     |
| All changes via PR            | CLAUDE.md (self)     |
| CI must pass before merge     | CLAUDE.md (self)     |
| Squash merge only             | GitHub repo settings |
| Auto-delete merged branches   | GitHub repo settings |
| Small, focused PRs            | CLAUDE.md (self)     |
