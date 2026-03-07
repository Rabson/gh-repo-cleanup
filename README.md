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

## Setup

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Add your GitHub token:

```bash
GITHUB_TOKEN=your_token_here
```

Required token scope:

- `delete_repo`
- You must have **admin rights** on each target repository

## Run

After `npm link`, use:

```bash
gh-delete-repo
```

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

## Install globally (optional)

```bash
npm link
```

Then run:

```bash
gh-delete-repo
```

Without global install, you can still run:

```bash
node src/index.js
```
