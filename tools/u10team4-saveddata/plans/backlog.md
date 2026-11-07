# Backlog

Items explicitly deferred during the finalize-match overhaul planning pass (2026-11-07). Not
scheduled, not assigned to any of the numbered plans — revisit later.

- **Retire/remove `finalize-match`** once its replacement (Plans 3-5) is built and proven out.
  `finalize-match` (`.claude/skills/finalize-match/SKILL.md`) is intentionally left alone and
  untouched by this round of work — out of scope for now.

- **Tag chips with vote counts on the goal review page** (`review/template.html`'s per-goal
  "Tags" field, Plan 3): today each clustered goal's tags are flattened into one comma-separated
  textarea seeded from the most-common value, which hides how many submissions actually picked
  each tag. Nick wants this to look like the live app's shot-tag picker — tag chips, with the
  selected one(s) highlighted, and when more than one submission picked the same tag, show that
  with a darker background or a count bubble (like a notification badge) rather than just
  silently merging them. Surfaced while reviewing Plan 3's award-section work; deferred to avoid
  scope creep on that plan since it's a separate part of the template.
