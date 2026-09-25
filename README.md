# cv-game-translator

CVs are boring to read and slow to make. Every one looks the same, and every new application means rewriting and reshuffling the same CV for another job. This project fixes both: you write your life down once, in your own words, and for each job post you get a short game the employer plays through in a few minutes, showing the parts of your life that job asks for.

It turns one life document and one job post into a **CV game**: `game.html`, a short 3D game in which a guide flies the player through the person's life, chapter by chapter, and each job requirement the life document has evidence for shows up in the chapter where it happened. Alongside it comes `check-sheet.html`, the fixed-shape output: the same seven fields in the same order every run, each empty one marked "not in source", and every line of both inputs accounted for.

Nothing in the game was written by the AI. Claude only picks line numbers; a script copies the words out of the numbered lines, and another script checks every piece of text in the game against the line it cites, character for character. One miss and the run fails. It never rewords you into "stronger" CV language, adds the job's keywords, scores your fit, says a requirement is met, or guesses a missing date; the full list is in `identity.md`.

An entry for "The Translator" competition. Built to run as a claude.ai Skill or Project, in Claude Code, or anywhere Node.js runs.

A deliberate decision was made to not add information to the examples, because that would ruin the translator purpose. However, for every new case, the AI will ask me to fill in what it was not able to answer using the information in my-story. For the purpose of the current assignment, I chose not to add information that is not sitting in my-story. 

## What goes in, what comes back
**In:** a life document (plain text or Markdown: your life, skills, experience and personality in your own words, spelled the way you want it shown) and the text of one job ad, as is. Give both as files, not pasted text. Claude copies a file unchanged; pasted text it has to type back out, which costs more than the rest of the run and is the one step the check can't cover.

**Out:** `game.html` is for the employer. One key or tap per step, nothing to solve, no way to lose, under 5 minutes; "Show the full CV" opens everything on one page. It is one file with nothing loaded from outside, so it plays in any browser (as plain pages where 3D can't be drawn) and as a claude.ai artifact. The guide is the same character in every run, the avatar of this folder's author. `check-sheet.html` is for you and the judges: the seven fields with the line each piece came from, what was left out, and a paste-in check. `check-result.txt` is the script check, PASS or FAIL per piece.

## Run it
Both claude.ai ways need code execution, which is on by default; check Settings > Capabilities ([Claude help: create and edit files](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)).

**claude.ai Skill** (lighter: the scripts and templates stay out of the chat)
1. Zip this folder so `SKILL.md` sits inside a folder named `cv-game-translator`. From a git copy: `git archive --format=zip --prefix=cv-game-translator/ -o cv-game-translator.zip HEAD`, which leaves out `runs/` and anything else git ignores.
2. Upload it at Customize > Skills: "+", then "Create skill", then "Upload a skill" ([Claude help: using skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude)).
3. In any chat, attach your life document and a job post and say "run the CV game translator".

**claude.ai Project** (every file stays loaded in every chat, about 100 KB): add every file in this folder to the Project's files (the folders get flattened; every file name is unique), then attach both documents in a chat and say "run it".

**Claude Code:** put your life document at `my-story/life-document.md` and each job post in `my-story/job-posts/`, then type `/cv-game`. With several job posts, Claude asks which one; `/cv-game <part of a file name>` picks one straight away, and `/cv-game` followed by a pasted job post saves it there first. Each run lands in `runs/<company>-<job-title>/`, which git ignores.

**By hand, with Node.js:**
```
node scripts/cv-number.js runs/my-job      # needs life-document.txt and job-post.txt in runs/my-job
# write runs/my-job/map.txt (see reference/map-format.md)
node scripts/cv-fill.js runs/my-job        # also runs the check (scripts/cv-check.js)
```

## Before you send the game
Before building, Claude asks about every requirement your life document has no evidence for and every unclear job line. Your answer goes into your life document word for word; a question you skip stays left out. In the author's own runs, these questions were left unanswered on purpose, so that every game says only what is already in `my-story/`.

Then open the check sheet and read sections 2 and 3, the requirements and life lines left out: they decide what the employer sees. To change the result, edit your life document or ask Claude for a different map, then run again. Never edit the game itself. To swap a chapter's scene, change its `scene:` row in `map.txt` and run Fill again.

**See the test work once:** change one word in `game.html` in a text editor, then load it into the check sheet's section 5 along with the two originals (or run `cv-check.js`). It turns red.

## Layout
```
cv-game-translator/
├─ CLAUDE.md                  where Claude starts in Claude Code: who runs it, where things live
├─ SKILL.md                   where Claude starts when this folder is a claude.ai Skill
├─ identity.md                what it converts, from what, to what; what it never does
├─ rules.md                   the four steps, and how a job post is mapped to a life document
├─ .claude/commands/
│  └─ cv-game.md              the /cv-game command in Claude Code
├─ reference/                 the contract
│  ├─ output-contract.md      the seven fields, their order, the data format, the check
│  ├─ map-format.md           the one file Claude writes: line numbers and exact pieces; the scene list
│  ├─ game-template.html      the fixed 3D game; each run fills only its data block
│  └─ check-sheet-template.html   the fixed check sheet; Fill adds the checker each run
├─ scripts/
│  ├─ cv-number.js            step 1: split both inputs into numbered lines, no character changed
│  ├─ cv-fill.js              step 3: copy each piece from its line into the two templates, then run step 4
│  └─ cv-check.js             step 4: every piece in its line, character for character
├─ my-story/                  the author's life document, master profile and three job posts
├─ examples/                  the author's three real runs: each one's game and check sheet, contact lines removed
└─ runs/                      where each run's working files land (not in git)
```
