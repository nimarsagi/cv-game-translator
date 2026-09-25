# Rules: how a run goes and how the mapping works

A run has four steps. Only step 2 is yours; the other three are scripts, so code execution must be on. The person is asked at two points: before Fill, about gaps and doubtful evidence, and at the end.

## Before step 1: the run folder
Ask for the two inputs as files (plain text or Markdown) and copy them into the run folder with a command such as `cp`, as `life-document.txt` (or `.md`) and `job-post.txt` (or `.md`). Never type an input out: it costs more than the rest of the run, and a character changed on the way (a typo fixed, a name spelled the usual way) can't be caught, because the check compares against your copy. If the person can only paste, type it out exactly and tell them that this one step is unchecked.

One run uses one job post. Given more than one and no word on which, ask which one before starting, and never mix lines from two.
- **Claude Code:** the run folder is `runs/<company>-<job-title>/` (lowercase, dashes).
- **claude.ai Project:** in your sandbox, make one working folder. Copy into it `cv-number.js`, `cv-fill.js`, `cv-check.js`, `game-template.html` and `check-sheet-template.html` from the Project files, plus the two inputs. The scripts find each other in the same folder. Run each command below from that folder, as `node cv-number.js .` and so on.
- **claude.ai Skill:** make a working folder in your sandbox and copy the two inputs into it. Run the scripts from the skill's own folder, as `node <skill folder>/scripts/cv-number.js <working folder>` and so on; they find the templates themselves.

## Where a run stands
Look in the run folder: `life-lines.txt` means step 1 is done, `map.txt` step 2, `game.html` step 3, and `check-result.txt` ending in `RESULT: PASS` step 4.

## Step 1: Number (script)
`node scripts/cv-number.js runs/<run>`
Writes `life-lines.txt` (L1, L2 …) and `job-lines.txt` (J1, J2 …). A new line starts at every line break and every sentence end, except a line break followed by a lowercase letter: that is one sentence wrapped mid-way (as in text copied from a PDF) and stays one line. Lines with no letter or digit are skipped. It fails if a single character would change. Never edit these files: if an input is wrong, fix the input and run Number again.

## Step 2: Map (you)
Read `life-lines.txt` and `job-lines.txt`, then write `map.txt` in the run folder, in the format in `map-format.md`. The map holds only line numbers, exact pieces of those lines, and each chapter's part and scene from the fixed lists. Never a word of your own.

**Job title and company.** The line or piece that names each. If the post doesn't name one, leave it out. Don't infer a company from an email address.

**Chapters.** A chapter is one island in the game: a scene the guide flies to. The guide tells the person's story for this job, one chapter at a time.
- A chapter is a setting, not a heading. Walk through the life document's story in order: its story sections (the headings of its story part), or with none, its roles oldest first, or with neither, its section headings. Start a new chapter only when the setting changes or a different set of the job's requirements comes up. Story sections that share a setting (school; university) become one chapter, with the requirements proven there. Title it with the heading line that fits best, or a piece of it, leaving out a number such as "Chapter 3:" so the game shows no gaps. Write the chapters in the map in story order: the game plays them in the order they are written. At most 10.
- Keep the story on the job. Story sections the job doesn't touch get one chapter between them at most, and only if the story needs it to make sense. Tell the person which story sections were left out.
- Part: `past` for what is finished, `present` for what the person is doing now, `future` for what they say they aim for or will bring next.
- Scene: the one from the list in `map-format.md` that fits what the chapter is about. The same scene may repeat.
- Story: the lines that matter most for what the job asks, connecting the person's life to this job. A chapter holding a requirement gets up to 3 story lines, rarely 4; a chapter the job doesn't touch gets 1, the line that carries its turn (what changed). Use whole sentences; cut only a line over 25 words. Story lines come from the chapter's own text; a line from elsewhere in the document is allowed when it tells that chapter better (a project's result from the Experience section, say).
- Flow: read one after another, a chapter's story lines must make sense to someone who never saw the life document. A line may not lean on one left out: if it says "the inherited role", "we" or "the same kind of test", the line it points back to is in too, or it goes. The first chapter opens on a line that stands alone.

**Requirements.** Go through the job post line by line. A requirement is anything the job asks the person to have or do: must-haves, nice-to-haves and duties. The company intro, benefits, salary and how to apply are not requirements. Nor is what the job offers the person: training, workshops or "opportunities" to take on extra tasks. For a traineeship or internship, what the placement trains you to do or gives you the chance to do (coaching clients, supervision, workshops, role-plays) is an offer, even when it reads as a duty. Only what they ask you to bring when you apply is a requirement: usually the "you must have" list. Leave offers out of the map; the check sheet lists them as not a requirement.
- Read each requirement as the job means it: in its section and in the job's field. "Self-study" in a clinical psychology training is self-study of clinical material, not of any subject. Evidence must answer that meaning.
- Write every requirement in the map, with or without evidence. One with no evidence under it is listed on the check sheet as left out; one you skip is listed as "not a requirement", which is wrong.
- A line that asks for several things ("Python, SQL and Tableau") becomes one requirement per thing, each piece quoting only its own words, so the game never shows a skill with nothing under it. Split it only when at least one of those things has evidence. If none does, write the line once, whole: it is listed as left out either way.
- One with evidence goes in the chapter where its proof happened: the chapter whose text holds the evidence, or where that work happens in the story (a Skills line about R goes in the university chapter, if that is where the story has the person using it). With evidence in several chapters, the one with the strongest line.

**Evidence.** For each requirement, up to 3, life-document lines only.
- It counts when the line shows the person doing the same kind of task or using the same skill, even in a different setting ("led a team of five volunteers" for "people management"). A line that only shares a word does not count.
- Lean toward finding a fit. Never invent one.
- When you are unsure whether a line counts, ask the person before running Fill, in the same message as the gaps (below): list each doubtful pair (the requirement, the life line, and what makes it doubtful) and let them keep or drop it. A line that shares a word with the requirement but not the task is not doubtful: leave it out.
- Use whole sentences. Cut a line only when it runs over 25 words, and then to a piece that still makes sense alone.
- The same life line may serve more than one requirement.
- A line may not be both story and evidence in one chapter: keep it as evidence and pick another story line.

**Before Fill: ask about gaps.** With the map drafted, ask the person, in one message, about every requirement with no evidence and every job line whose meaning is unclear (whether it is required at all, or what it asks). They answer in their own words. Add each answer to the life document word for word, under a heading that fits (in Claude Code, the one in `my-story/`, then copy it into the run folder again), run Number again and redo the map. Nothing goes into the life document that they didn't say. A gap they leave unanswered stays left out.

**Fixed fields from the life document.** How many each field holds is in `map-format.md`.
- Name: the one line or piece that gives it, spelled as written.
- Contact: email, phone, city, link, only as written.
- Roles: jobs, studies or positions, each followed by its dates piece if the document gives dates. Dates are copied as written ("2021–2023", "since spring"). Never work out or tidy a date.
- Traits: only traits the document states about the person. When a sentence says who holds the view ("Friends say I am patient"), use the whole sentence, so the game doesn't turn someone else's view into the person's own claim.

A field the document doesn't give stays out of the map. Fill marks it "not in source" on the check sheet and hides it in the game.

## Step 3: Fill (script)
`node scripts/cv-fill.js runs/<run>`
Copies every text from its numbered line into `game.html` and `check-sheet.html`, keeps the chapters in the map's order, puts the requirements in each chapter in the job post's order and evidence in line order, prints each chapter's part and scene, what was left out and an estimated play time, then runs step 4 itself. If it stops, it says which map line is wrong: fix `map.txt` and run it again. Nothing is written until the whole map is right.

**Play time: at most 5 minutes**, reading included. If the estimate is over, cut story lines in chapters without requirements first (down to 1 each), then evidence down to 1 per requirement, then ask the person. Every cut keeps the flow rule: cut a line only if nothing left leans on it.

## Step 4: Check (script, run by Fill)
On its own: `node scripts/cv-check.js runs/<run>`.
Confirms every piece in the game is in the line it cites, character for character, that the game is the template with only its data filled in, and that the check sheet matches. Writes `check-result.txt`. **One FAIL and the game is not handed over:** fix `map.txt` and run Fill again.

## Hand over
Give the person both files and say, in plain words:
1. The game is for the employer. The check sheet is for them only, because it lists what was left out.
2. Before sending, look at sections 2 and 3 of the check sheet: requirements left out, and life lines left out. A strong experience left out, or a requirement dropped that their story does cover, decides what the employer sees. To change it, edit the life document or ask for a different map, then run Fill again. Never edit the game itself.
3. Section 1 lists each chapter's scene. To swap one, change its `scene:` row in `map.txt` and run Fill again.
4. On the first run: change one word in `game.html` by hand, then load it into section 5 of the check sheet (or run Check) and watch it turn red. That proves the test works.

## Never
- Type text into the game, the check sheet or the numbered files. Only the scripts write them.
- Reword a line, fix its spelling, or spell a name "the usual way".
- Add a date, number, score, skill, company or next step the input doesn't hold.
- Edit the templates or scripts during a run.
- Hand over a game that failed the check.
