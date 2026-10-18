# Lineup manager icons

Drop the files in this folder (`relics/assets/lineup/`) with exactly these names. The lineup page
looks for `<name>.svg` first, then `<name>.png`. Until a file exists, that tag just shows as text,
so you can add them one at a time.

**Where they show up:** the goal detail view (tap a goal in the game log). Each shot detail is a
small pill with the icon on the left, drawn at about 22×22 px.

**Specs**
- SVG preferred (square `viewBox="0 0 64 64"`), or PNG at 128×128.
- Transparent background. It sits on a dark grey pill (#2a2a2d), so use light strokes/fills.
- Purple (#7b3fd0 / #b48cff), white, and pixel-style all fit the rest of the app.
- Keep it readable tiny: one idea per icon, thick lines, no text inside the icon.

Combined icons (e.g. a volley into the top bin) can come later. For now, one file per tag.

## How it started

| File name | Tag | What to draw |
|---|---|---|
| `shot-open-play.svg` | Open play | Ball mid-run with motion lines — the default "just playing" goal |
| `shot-counter-attack.svg` | Counter attack | Fast arrow sweeping up the field (lightning-quick break) |
| `shot-penalty.svg` | Penalty | Ball on the penalty spot facing a small goal |
| `shot-free-kick.svg` | Free kick | Ball curling around a small wall of 2–3 figures |
| `shot-from-corner.svg` | From corner | Corner flag with a ball arcing out of it |
| `shot-from-throw-in.svg` | From throw-in | Two hands over a head holding a ball |
| `shot-from-goal-kick.svg` | From goal kick | Ball launched from the six-yard box, long arc |
| `shot-rebound.svg` | Rebound | Ball bouncing back off a keeper's glove / post, with a return arrow |
| `shot-scramble.svg` | Scramble | Several feet/legs and a ball in a crowded cluster |

## The shot

| File name | Tag | What to draw |
|---|---|---|
| `shot-right-foot.svg` | Right foot | A right boot (toe pointing right) striking a ball |
| `shot-left-foot.svg` | Left foot | Mirror of the right foot: left boot, toe pointing left |
| `shot-header.svg` | Header | Head in profile meeting a ball |
| `shot-volley.svg` | Volley | Foot striking a ball in mid-air (no ground line under the ball) |
| `shot-half-volley.svg` | Half-volley | Foot striking a ball just as it touches the ground (small bounce mark) |
| `shot-chip.svg` | Chip | High looping arc over a small keeper figure |
| `shot-one-on-one.svg` | One-on-one | One player and one keeper facing each other |
| `shot-long-shot.svg` | Long shot | Ball with a long straight arrow from far away (outside the box) |
| `shot-dribbled-the-keeper.svg` | Dribbled the keeper | Ball going around a keeper with a curved arrow |
| `shot-deflected.svg` | Deflected | Ball arrow that changes direction off a body / leg |

## Where it went

| File name | Tag | What to draw |
|---|---|---|
| `shot-top-bin.svg` | Top bin | Goal frame with the ball in a top corner |
| `shot-high.svg` | High | Goal frame with the ball high in the middle |
| `shot-mid.svg` | Mid | Goal frame with the ball in the middle |
| `shot-low.svg` | Low | Goal frame with the ball along the ground |
| `shot-near-post.svg` | Near post | Goal frame with the ball tucked inside the left post |
| `shot-far-post.svg` | Far post | Goal frame with the ball inside the right post, arrow crossing the goal |
| `shot-through-the-legs.svg` | Through the legs | Keeper's legs with the ball rolling between them |
| `shot-off-the-post-bar.svg` | Off the post/bar | Ball hitting the post with a small "ping" burst, then in |

## Coming later (not used yet)

| File name | For |
|---|---|
| `icon-goal.svg` | Goal rows in the game log and Follow feed |
| `icon-assist.svg` | Assist line in goal details and stats |
| `icon-sub.svg` | Sub rows under the field |
| `icon-whistle.svg` | Quarter start / end in the Follow feed |
| `react-clap.svg`, `react-fire.svg`, `react-ball.svg` | Goal reactions from followers (backlog) |

If a tag name changes in the app, its file name changes with it: lowercase, spaces and symbols
become dashes (e.g. "Off the post/bar" → `shot-off-the-post-bar`).
