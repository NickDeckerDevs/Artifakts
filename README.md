# Artifakts

A personal artifact hub — HTML tools, dashboards, and utilities deployed from Claude.

Live at: **https://nickdeckerdevs.github.io/Artifakts/**

## How to Connect the Skill

1. Clone this repo locally
2. Create `deployArtifact-skill.config.json` in the root (see setup below)
3. The skill file is stored globally in your Claude environment at `/Users/inbound/.claude/skills/github-pages/SKILL.md`
4. In any Claude conversation with an HTML artifact, ask Claude to "deploy this to Artifakts"

## Config Setup

Create `deployArtifact-skill.config.json` in the repo root:

```json
{
  "pat": "ghp_YOUR_TOKEN_HERE",
  "owner": "NickDeckerDevs",
  "repo": "Artifakts",
  "categories": [
    "Fun",
    "Soccer",
    "Family",
    "Productivity"
  ]
}
```

**Important:** This file is `.gitignore`'d and must never be committed (it contains your GitHub PAT).

To generate a PAT:
1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens (classic)
2. Generate new token with `repo` scope
3. Paste into the config above

## Structure

- `/relics/{category}/` — deployed HTML files organized by category
- `/index.html` — live table of contents at the GitHub Pages URL above

## How the Skill Works

When triggered:

1. Reads `deployArtifact-skill.config.json` for PAT + repo info
2. Asks for:
   - The HTML artifact to deploy
   - Custom display name for the TOC entry
   - Category (suggests existing categories or creates new)
3. Slugifies the display name → filename (e.g. `Soccer Simulator` → `soccer-simulator.html`)
4. Commits the HTML to `/relics/{category}/{slug}.html` via GitHub API
5. Updates `index.html` between `ARTIFAKTS:START` / `ARTIFAKTS:END` markers
6. Commits the updated index back to the repo

## Testing the Skill

The workflow is:
1. Have an HTML artifact in another project/folder
2. Ask Claude: "Deploy this to Artifakts"
3. The skill reads the artifact, asks for category and display name
4. Commits to the repo and updates the index
5. Verify at the live GitHub Pages URL
