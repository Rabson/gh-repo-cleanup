# GitHub Repo Delete CLI

Interactive Node.js CLI to delete GitHub repositories safely from the terminal.

## Features

- Lists repositories from your authenticated account or a specific owner
- Interactive multi-select in terminal
- Arrow keys (`↑`/`↓`) to move, `Space` to select, `Enter` to continue, `Esc` to exit selector
- Explicit confirmation step before deletion
- Optional direct single-repo delete mode
- Dry-run mode to preview what would be deleted
- Live text search while viewing the repo list
- Filter by visibility (`public` / `private`)
- Filter by organization owner login
- After each action, returns to list until you choose to exit
- Delete errors are shown and the app stays open for next actions

## Install

Global install:

```bash
npm install -g @rabson/gh-repo-cleanup
```

Run without installing globally:

```bash
npx @rabson/gh-repo-cleanup --help
```

## Authentication

Set `GITHUB_TOKEN` in your shell:

```bash
export GITHUB_TOKEN=your_token_here
```

Or create a local `.env` file:

```bash
cp .env.example .env
```

Required token scope and permissions:

- `delete_repo`
- You must have **admin rights** on each target repository

## Usage

Interactive mode (all repos accessible by the token):

```bash
gh-delete-repo
```

Interactive mode for specific owner/user/org:

```bash
gh-delete-repo --owner your-owner
```

Filter only private repos:

```bash
gh-delete-repo --visibility private
```

Filter repos for one organization:

```bash
gh-delete-repo --org your-org-name
```

Interactive mode with initial search text:

```bash
gh-delete-repo --owner your-owner --search api
```

In the interactive list view, type to search in real time.

Direct single-repo mode:

```bash
gh-delete-repo --owner your-owner --repo your-repo
```

Skip confirmations:

```bash
gh-delete-repo --owner your-owner --repo your-repo --yes
```

Dry-run (no deletion, preview only):

```bash
gh-delete-repo --owner your-owner --dry-run
```

## Local Development

```bash
npm install
```

Run tests:

```bash
npm test
```

Run locally:

```bash
npm link
gh-delete-repo --help
```

## Release (Maintainers)

Create repository secret:

```bash
NPM_TOKEN=<npm automation token>
```

Release flow:

1. Bump version and push tag:

```bash
npm version patch
git push origin main --follow-tags
```

2. Create a GitHub Release for the pushed tag.
3. GitHub Actions `.github/workflows/release.yml` runs tests and publishes to npm.

Manual fallback:

```bash
npm run release:check
npm publish
```

## License

MIT
