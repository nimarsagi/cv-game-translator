# CV Game Translator

**The check sheet is the fixed-shape output; the game is what the employer sees.** Feed it one life document and one job post. Back come `check-sheet.html`, with the same seven fields in the same order every run, each empty one marked "not in source", and every line of both inputs accounted for; and `game.html`, a short 3D CV game: a guide flies the player through the person's life, chapter by chapter, and each job requirement the life document has evidence for shows up in the chapter where it happened.

Nothing in the game was written by the AI. Claude only picks line numbers; a script copies the words out of the numbered lines, and another script checks every piece of text in the game against the line it cites, character for character. One miss and the run fails. The same check sits inside the check sheet: paste in the two originals and watch each item turn green, or red if a word was changed.

An entry for "The Translator" competition. Built to run as a claude.ai Skill or Project, in Claude Code, or anywhere Node.js runs.

## What to feed it
- **A life document:** plain text or Markdown. Your life, skills, experience and personality in your own words. Sentences or bullets both work. Everything the game can say about you must be in here, spelled the way you want it shown.
- **A job post:** the text of one job ad, as is.

Give both as files, not pasted text. Claude copies a file unchanged; pasted text it has to type back out, which costs more than the rest of the run and is the one step the check can't cover.

## What comes back
- **`game.html`:** a guide flies the player through your life in 3D, chapter by chapter, grouped under the past, the present and the future, and ends at the job. Each chapter plays in a scene from a fixed set, and the guide tells it in lines picked from your life document for this job. Each requirement shows up in the chapter where your proof of it happened: what the job asks, and the lines from your life document that answer it. One key or tap per step, nothing to solve, no way to lose. Aimed at under 5 minutes, reading included. "Show the full CV" opens everything on one page. One file, nothing loaded from outside: it plays in any browser (as plain pages where 3D can't be drawn) and as a claude.ai artifact. The guide is the same character in every run, the avatar of this folder's author, whoever's life it tells.
- **`check-sheet.html`:** for you (and the judges), not the employer. The seven fields with the line each piece came from, the requirements left out for lack of evidence, every input line and where it went, and the paste-in check.
- **`check-result.txt`:** the script check, PASS or FAIL per piece.

## How to use it

Both claude.ai ways need code execution, which is on by default; check Settings > Capabilities ([Claude help: create and edit files](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)).

**claude.ai Skill** (lighter: the scripts and templates stay out of the chat, and run without being read)
1. Zip this folder so `SKILL.md` sits inside a folder named `cv-game-translator`. From a git copy: `git archive --format=zip --prefix=cv-game-translator/ -o cv-game-translator.zip HEAD`, which leaves out `runs/` and anything else git ignores.
2. Upload it at Customize > Skills: "+", then "Create skill", then "Upload a skill" ([Claude help: using skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude)).
3. In any chat, attach your life document and a job post and say "run the CV game translator".

**claude.ai Project** (every file stays loaded in every chat of the Project, about 100 KB)
1. Add every file in this folder to the Project's files. The folders get flattened; that's fine, since every file name is unique.
2. In a chat in the Project, attach your life document and a job post and say "run it".

**Claude Code:** put your life document at `my-story/life-document.md` and each job post in `my-story/job-posts/` (git ignores both), then type `/cv-game`. With several job posts, Claude asks which one; `/cv-game <part of a file name>` picks one straight away, and `/cv-game` followed by a pasted job post saves it there first. Saying "run it" with the two documents works too. Each run lands in `runs/<company>-<job-title>/`, which git ignores.

**By hand, with Node.js:**
```
node scripts/cv-number.js runs/my-job      # needs life-document.txt and job-post.txt in runs/my-job
# write runs/my-job/map.txt (see reference/map-format.md)
node scripts/cv-fill.js runs/my-job        # also runs the check (scripts/cv-check.js)
```

## Before the game is built
Claude asks you about every requirement your life document has no evidence for, and every job line that is unclear. You answer in your own words; the answer goes into your life document word for word, and the map is redone. A question you skip stays left out.

In the author's own runs, these questions were left unanswered on purpose, so that every game says only what is already in `my-story/`. The gaps show on each check sheet as requirements left out.

## Before you send the game
Open the check sheet and read sections 2 and 3: the requirements left out and the life lines left out. A strong experience left out, or a requirement your story does cover, decides what the employer sees. To change the result, edit your life document or ask Claude for a different map, then run again. Never edit the game itself. Section 1 lists each chapter's scene; to swap one, change its `scene:` row in `map.txt` (or ask Claude) and run Fill again.

**See the test work once:** change one word in `game.html` in a text editor, then load it into the check sheet's section 5 along with the two originals (or run `cv-check.js`). It turns red.

## What it will not do
Reword you into "stronger" CV language, add the job's keywords, score your fit, show stat bars, say a requirement is met, give the guide words of its own (it says only lines from your life document), draw or write anything per job (the scenes are a fixed set and the guide is always the same character), guess a missing date, make a PDF or cover letter, or send anything. Where the input has nothing, the check sheet says "not in source" and the game leaves it out.

## Files

```
cv-game-translator/
├── CLAUDE.md          ← where Claude starts in Claude Code: who runs it, where things live
├── SKILL.md           ← where Claude starts when this folder is a claude.ai Skill
├── identity.md        ← what it converts, from what, to what; what it never does
├── rules.md           ← the four steps, and how a job post is mapped to a life document
├── examples.md        ← three real runs (placeholder until they exist)
├── README.md          ← this file
├── .claude/commands/cv-game.md  ← the /cv-game command in Claude Code
├── reference/         ← the contract
│   ├── output-contract.md         ← the seven fields, their order, the data format, the check
│   ├── map-format.md              ← the one file Claude writes: line numbers and exact pieces; the scene list
│   ├── game-template.html         ← the fixed 3D game (guide, scenes, flight); each run fills only its data block
│   └── check-sheet-template.html  ← the fixed check sheet; Fill adds the checker each run
└── scripts/
    ├── cv-number.js   ← step 1: split both inputs into numbered lines, no character changed
    ├── cv-fill.js     ← step 3: copy each piece from its line into the two templates, then run step 4
    └── cv-check.js    ← step 4: every piece in its line, character for character
```
