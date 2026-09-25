# CV Game Translator

Turns one life document and one job post into two files: `game.html`, a short CV game an employer can play, and `check-sheet.html`, which traces every word in the game to a numbered line of either input. The AI picks line numbers. Scripts copy the words.

## Who runs it
- **The author**, for their own job applications: one run per job.
- **Competition judges** ("The Translator") and **anyone who drops this folder into a claude.ai Project or uploads it as a Skill**, with their own life document and any job post. So nothing here may assume a particular person or job. In a Project the folders are flattened: every file name is unique, and files refer to each other by name only.

One exception, decided by the author on 2026-09-25 and not to be reopened: the guide in the game is always the author's avatar (Nika), whoever's life document is run. Every word it says is still a line of that life document.

## Start here
Someone hands you a life document and a job post, says "run it", or types `/cv-game`: read `identity.md`, then `rules.md`, and follow the four steps in `rules.md`. Anything else, such as a question about the folder, can usually be answered from this file and `README.md`.

## Where things live

| File | What it holds | Read it when |
|---|---|---|
| `identity.md` | what it converts, the two outputs, what it never does | every run, first |
| `rules.md` | the four steps, and how to map a job post to a life document | every run, second |
| `map-format.md` (in `reference/`) | how to write `map.txt`, the one file you write, and the list of scenes | step 2 |
| `output-contract.md` (in `reference/`) | the fixed fields, their order, the data format, the check | when a field or the check is in question |
| `game-template.html`, `check-sheet-template.html` (in `reference/`) | the fixed templates Fill completes; the game's 3D world, guide and scenes are built in. Never edit them during a run | never during a run |
| `cv-number.js`, `cv-fill.js`, `cv-check.js` (in `scripts/`) | steps 1, 3 and 4 | run them, don't read them |
| `examples/` | real runs: each one's game and check sheet, made from the life document with its contact lines removed | when you want to see the contract hold |
| `cv-game.md` (in `.claude/commands/`) | the `/cv-game` command: picks one job post from `my-story/job-posts/`, asking when there are several | when someone types `/cv-game` |
| `SKILL.md` | the entry point when this folder is uploaded as a claude.ai Skill | not needed in Claude Code |
| `README.md` | for people: how to use it, what comes back | not needed for a run |

Run files go in `runs/<company>-<job-title>/`, which git ignores: they hold a person's life document and are never shared.
