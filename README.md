# CV Game Translator

**The check sheet is the fixed-shape output; the game is what the employer sees.** Feed it one life document and one job post. Back come `check-sheet.html`, with the same seven fields in the same order every run, each empty one marked "not in source", and every line of both inputs accounted for; and `game.html`, a short pixel-art CV game with one door per job requirement the life document has evidence for.

Nothing in the game was written by the AI. Claude only picks line numbers; a script copies the words out of the numbered lines, and another script checks every piece of text in the game against the line it cites, character for character. One miss and the run fails. The same check sits inside the check sheet: paste in the two originals and watch each item turn green, or red if a word was changed.

An entry for "The Translator" competition. Built to run in a claude.ai Project, in Claude Code, or anywhere Node.js runs.

## What to feed it
- **A life document:** plain text or Markdown. Your life, skills, experience and personality in your own words. Sentences or bullets both work. Everything the game can say about you must be in here, spelled the way you want it shown.
- **A job post:** the text of one job ad, pasted as is.

## What comes back
- **`game.html`:** walk from door to door, one key or tap per door, nothing to solve, no way to lose. Aimed at under 5 minutes, reading included. Each door shows what the job asks and the lines from your life document that answer it. "Show the full CV" opens everything on one page. One file, nothing loaded from outside: it plays in any browser and as a claude.ai artifact.
- **`check-sheet.html`:** for you (and the judges), not the employer. The seven fields with the line each piece came from, the requirements left out for lack of evidence, every input line and where it went, and the paste-in check.
- **`check-result.txt`:** the script check, PASS or FAIL per piece (not made when code execution is off).

## How to use it

**claude.ai Project**
1. Add every file in this folder to the Project's files. The folders get flattened; that's fine, since every file name is unique.
2. Switch on code execution in your Claude settings. On Free, Pro and Max it is off until you turn it on ([Claude help: create and edit files](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)).
3. In a chat in the Project, paste or attach your life document and a job post and say "run it".

Code execution off: Claude does the numbering and filling by hand and you run the check yourself in the check sheet's section 5. This path is unproven. If it drifts, turn code execution on.

**Claude Code:** open this folder and say "run it" with the two documents. Each run lands in `runs/<company>-<job-title>/`, which git ignores.

**By hand, with Node.js:**
```
node scripts/cv-number.js runs/my-job      # needs life-document.txt and job-post.txt in runs/my-job
# write runs/my-job/map.txt (see reference/map-format.md)
node scripts/cv-fill.js runs/my-job
node scripts/cv-check.js runs/my-job
```

## Before you send the game
Open the check sheet and read sections 2 and 3: the requirements left out and the life lines left out. A strong experience left out, or a requirement your story does cover, decides what the employer sees. To change the result, edit your life document or ask Claude for a different map, then run again. Never edit the game itself.

**See the test work once:** change one word in `game.html` in a text editor, then load it into the check sheet's section 5 along with the two originals (or run `cv-check.js`). It turns red.

## What it will not do
Reword you into "stronger" CV language, add the job's keywords, score your fit, show stat bars, write a story, guess a missing date, or send anything. Where the input has nothing, the check sheet says "not in source" and the game leaves it out.

## Files

```
cv-game-translator/
├── CLAUDE.md          ← where Claude starts: who runs it, where things live
├── identity.md        ← what it converts, from what, to what; what it never does
├── rules.md           ← the four steps, and how a job post is mapped to a life document
├── examples.md        ← three real runs (placeholder until they exist)
├── README.md          ← this file
├── reference/         ← the contract
│   ├── output-contract.md         ← the seven fields, their order, the data format, the check
│   ├── map-format.md              ← the one file Claude writes: line numbers and exact pieces
│   ├── game-template.html         ← the fixed game; each run fills only its data block
│   └── check-sheet-template.html  ← the fixed check sheet, with the checker built in
└── scripts/
    ├── cv-number.js   ← step 1: split both inputs into numbered lines, no character changed
    ├── cv-fill.js     ← step 3: copy each piece from its line into the two templates
    └── cv-check.js    ← step 4: every piece in its line, character for character
```

After changing `cv-number.js`, `cv-check.js` or `game-template.html`, run `node scripts/cv-fill.js --refresh-template` so the check sheet carries the new code.
