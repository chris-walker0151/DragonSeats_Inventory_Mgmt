# Claude Code Project Instructions

## Workflow Rules (MUST follow every session)

1. **Never commit directly to main.** Always create a feature branch.
2. **All changes go through a PR.** Push the branch, open a PR with `gh pr create`.
3. **CI must pass before merging.** If CI fails, fix and push again.
4. **Squash-merge only.** Use `gh pr merge <number> --squash` (repo enforces this).
5. **Keep PRs small.** Minimal diffs, one logical change per PR.
6. **Verify before pushing.** Run the dev server (`npm run dev`) and check affected pages.

See `docs/CLAUDE_PR_WORKFLOW.md` for the full step-by-step procedure.

## Branch Naming

Format: `<type>/<short-description>`

| Type     | Use for                        |
|----------|--------------------------------|
| feat     | New features                   |
| fix      | Bug fixes                      |
| refactor | Code restructuring             |
| docs     | Documentation changes          |
| chore    | Config, dependencies, CI       |

## PR Format

- **Title**: Under 70 chars, imperative mood (e.g. "Add batch delete for assets")
- **Body**: Summary bullets + test plan + `Generated with Claude Code` footer

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Hosting**: AWS Amplify

## Project Structure

- `src/app/(main)/` — Page routes (serialized-assets, customers, maintenance, quantity-inventory)
- `src/lib/` — Domain logic, queries, types per feature
- `src/components/` — Shared UI components
- `prisma/` — Schema and migrations

## Key Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run lint         # ESLint
npx tsc --noEmit     # Type-check
npm run build        # Production build
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate deploy  # Apply migrations
```

## Conventions

- All pages use `export const dynamic = "force-dynamic"` (no static pre-rendering)
- Server actions live in `actions.ts` alongside their page
- Use the "adjusting state during render" pattern (useState tracking) instead of setState in useEffect
- ESLint ignores `scripts/**` (CJS) and `.claude/**` (worktree artifacts)
