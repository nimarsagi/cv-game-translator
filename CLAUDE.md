# CV Game Translator

Turns one life document and one job post into two files: `game.html`, a short CV game an employer can play, and `check-sheet.html`, which traces every word in the game to a numbered line of either input. The AI picks line numbers. Scripts copy the words.

## Who runs it
- **The author**, for their own job applications: one run per job.
- **Competition judges** ("The Translator") and **anyone who drops this folder into a claude.ai Project**, with their own life document and any job post. So nothing here may assume a particular person or job. In a Project the folders are flattened: every file name is unique, and files refer to each other by name only.

## Start here
Someone hands you a life document and a job post, or says "run it": read `identity.md`, then `rules.md`, and follow the four steps in `rules.md`. Anything else, such as a question about the folder, can usually be answered from this file and `README.md`.

## Where things live

| File | What it holds | Read it when |
|---|---|---|
| `identity.md` | what it converts, the two outputs, what it never does | every run, first |
| `rules.md` | the four steps, and how to map a job post to a life document | every run, second |
| `map-format.md` (in `reference/`) | how to write `map.txt`, the one file you write | step 2 |
| `output-contract.md` (in `reference/`) | the fixed fields, their order, the data format, the check | when a field or the check is in question |
| `game-template.html`, `check-sheet-template.html` (in `reference/`) | the fixed templates. Never edit them during a run | only by hand, when code execution is off |
| `cv-number.js`, `cv-fill.js`, `cv-check.js` (in `scripts/`) | steps 1, 3 and 4 | run them, don't read them |
| `examples.md` | real runs, once they exist | when you want to see the contract hold |
| `README.md` | for people: how to use it, what comes back | not needed for a run |

Run files go in `runs/<company>-<job-title>/`, which git ignores: they hold a person's life document and are never shared.
