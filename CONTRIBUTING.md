# Contributing — 3C Core

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/description` | `feat/add-blog-section` |
| Bug fix | `fix/description` | `fix/contact-form-validation` |
| Docs | `docs/description` | `docs/update-deployment-guide` |
| Style | `style/description` | `style/mobile-nav-spacing` |

## Workflow

1. Branch off `dev` — **never** branch off `main`
2. Make your changes
3. Run `npm run lint` and `npm run build` locally — both must pass
4. Open a PR targeting `dev`
5. Request review from a team member
6. Squash merge into `dev` after approval
7. `dev → main` merges are release events — team lead only

## Commit Format

```
feat: add portfolio filter bar
fix: correct mobile nav z-index
docs: update DNS instructions
style: adjust hero section spacing
refactor: extract shared input component
chore: bump next to 14.2.x
```

## Rules

- All PRs go to `dev`, **never directly to `main`**
- `main` auto-deploys to production — handle with care
- Do not commit `.env.local` or any secrets
- Run `npm run build` before raising a PR to catch build errors
