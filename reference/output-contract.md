# output-contract.md: what every run produces

Two files per run, both built from the same data. The check sheet is the fixed-shape output. The game is a view of the fields that were filled.

## The seven fields, always in this order

| # | Field | Comes from | Holds | When the source has nothing |
|---|---|---|---|---|
| 1 | Name | life document | at most 1 piece, spelled as written | check sheet: "not in source". Game: hidden |
| 2 | Contact | life document | at most 4 pieces (email, phone, city, link) | same |
| 3 | Job title | job post | at most 1 piece | same |
| 4 | Company | job post | at most 1 piece | same |
| 5 | Levels | both | one level per requirement that has evidence, in the job post's line order. Each: **the job asks** (1 job-post piece) + **from the life document** (1 to 3 life-document pieces, in line order) | same |
| 6 | Roles | life document | at most 8, in line order. Each: the role (1 piece) + its dates (0 or 1 piece, as written) | same. A role with no dates shows "dates: not in source" on the check sheet |
| 7 | Traits | life document | at most 5 pieces, only traits the document states, in line order | same |

**Definitions**
- **Line:** one sentence or one line of an input, as split by `cv-number.js`. L1… for the life document, J1… for the job post.
- **Piece:** the whole line, or a run of whole words cut from it. Stored as `{ "ref": "L12", "text": "...", "cutStart": true|false, "cutEnd": true|false }`. `text` is the line's own characters, with only spacing collapsed, `**`/`__` bold marks removed, and a leading bullet or heading mark (`-`, `*`, `•`, `1.`, `#`) removed. `cutStart`/`cutEnd` say whether words were dropped before or after it; the game and check sheet show those cuts as "…" on requirements and evidence, and the check sheet prints the full line under every cut piece.
- **Requirement:** anything the job post asks the person to have or do (must-haves, nice-to-haves, duties). Not: company intro, benefits, salary, how to apply.
- **Evidence:** a life-document line that shows the person doing the same kind of task or using the same skill.
- **Requirement left out:** a requirement with no evidence. No level, listed in check-sheet section 2.
- **Not in source:** the input has nothing for this field. Never filled with a guess.

## The data block (format `cv-game-data/1`)
Both files carry the same JSON in `<script type="application/json" id="cv-data">`:

```json
{ "format": "cv-game-data/1",
  "fields": {
    "name":     [ piece ],
    "contact":  [ piece, ... ],
    "jobTitle": [ piece ],
    "company":  [ piece ],
    "levels":   [ { "asks": piece, "evidence": [ piece, ... ] }, ... ],
    "roles":    [ { "role": piece, "dates": [ piece ] }, ... ],
    "traits":   [ piece, ... ] } }
```
An empty field is an empty list. No other keys are allowed; the check fails on any.

The check sheet also carries `<script type="application/json" id="cv-sheet">` (format `cv-sheet-data/1`): `lifeFile`, `jobFile` (input file names), `lifeLines`, `jobLines` (every numbered line, as text), and `leftOut` (`[ { "asks": piece } ]`, the requirements left out).

## check-sheet.html: the fixed shape
Same sections, same order, every run:
1. **The CV, field by field.** All seven fields above; each piece with its line number; empty fields say "not in source".
2. **Requirements left out: no evidence found.** Or "none".
3. **Every life-document line.** Line number, text, and where it was used, or "left out".
4. **Every job-post line.** Line number, text, and where it was used (a level, job title, company, requirement left out), or "not a requirement".
5. **Check it yourself.** Paste or load the two original documents (and optionally a `game.html`) and run the check in the browser. Each piece in section 1 and 2 turns green or red.

It holds what was left out, so it is never sent to an employer.

## game.html: what the employer sees
One HTML file, nothing loaded from outside, no saved progress. Plays in any browser and as a claude.ai artifact.
- **Stops, in this order:** start (name, contact, job title, company) → one door per level → roles → traits → end. The roles and traits stops are skipped when empty, and a door exists only for a level; the start and end stops are always there. Never reworded, reordered or added to.
- **Each door:** "The job asks:" above the requirement, then "From the life document:" above the evidence. No "requirement met", no score, no stat bars.
- **Controls:** Next / Back buttons, arrow keys or Space, or tap the scene. Nothing to solve, no way to lose.
- **"Show the full CV"** on every screen: the same content on one plain page, printable.
- **Fixed words:** everything in the file except the data block is the template, the same every run. The template's words say nothing about the person.

## The check (what "faithful" means here)
A run passes only if all of these hold. `cv-check.js` tests them; the check sheet's section 5 runs the same code.
1. Every piece is found in the line it cites, character for character, ignoring only spacing, bold marks and a leading bullet or heading mark, and starting and ending on word edges.
2. Its "…" marks match where the line was actually cut.
3. The cut drops none of the meaning-flipping words listed in `map-format.md` (the "not" words in any line; in life-document lines, also words like "helped" and "partly").
4. Each field holds only lines from its own input (L or J) and no more pieces than its limit.
5. The data holds the seven fields and nothing else.
6. `game.html` is `game-template.html` with only its data block changed.
7. The check sheet holds the same data as the game, its stored lines match the originals, and its left-out requirements pass rules 1–3.

One failure fails the run.
