# Rules: how a run goes and how the mapping works

A run has four steps. Only step 2 is yours; the other three are scripts. The one stop for the person is at the end.

## Before step 1: the run folder
- **Claude Code:** make `runs/<company>-<job-title>/` (lowercase, dashes). Save the two inputs there as `life-document.txt` (or `.md`) and `job-post.txt` (or `.md`), exactly as given: don't tidy, fix spelling or reformat.
- **claude.ai Project, code execution on:** in your sandbox, make one working folder. Copy into it `cv-number.js`, `cv-fill.js`, `cv-check.js`, `game-template.html` and `check-sheet-template.html` from the Project files, and save the two inputs there under the names above. The scripts find each other in the same folder. Run each command below from that folder, as `node cv-number.js .` and so on.
- **Code execution off:** see "By hand" at the end.

## Where a run stands
Look in the run folder: `life-lines.txt` means step 1 is done, `map.txt` step 2, `game.html` step 3, and `check-result.txt` ending in `RESULT: PASS` step 4.

## Step 1: Number (script)
`node scripts/cv-number.js runs/<run>`
Writes `life-lines.txt` (L1, L2 …) and `job-lines.txt` (J1, J2 …). A new line starts at every line break and every sentence end; lines with no letter or digit are skipped. It fails if a single character would change. Never edit these files: if an input is wrong, fix the input and run Number again.

## Step 2: Map (you)
Read `life-lines.txt` and `job-lines.txt`, then write `map.txt` in the run folder, in the format in `map-format.md`. The map holds only line numbers and exact pieces of those lines. Never a word of your own.

**Job title and company.** The line or piece that names each. If the post doesn't name one, leave it out. Don't infer a company from an email address.

**Requirements.** Go through the job post line by line. A requirement is anything the job asks the person to have or do: must-haves, nice-to-haves and duties. The company intro, benefits, salary and how to apply are not requirements.
- Write every requirement in the map, with or without evidence. One with no evidence under it is listed on the check sheet as left out; one you skip is listed as "not a requirement", which is wrong.
- A line that asks for several things ("Python, SQL and Tableau") becomes one requirement per thing, each piece quoting only its own words. That way a door never shows a skill with nothing under it.

**Evidence.** For each requirement, up to the limit in `output-contract.md` (3), life-document lines only.
- It counts when the line shows the person doing the same kind of task or using the same skill, even in a different setting ("led a team of five volunteers" for "people management"). A line that only shares a word does not count.
- Lean toward finding a fit. Never invent one.
- Use whole sentences. Cut a line only when it runs over 25 words, and then to a piece that still makes sense alone.
- The same life line may serve more than one requirement.

**Fixed fields from the life document.** How many each field holds is in `output-contract.md`.
- Name: the one line or piece that gives it, spelled as written.
- Contact: email, phone, city, link, only as written.
- Roles: jobs, studies or positions, each followed by its dates piece if the document gives dates. Dates are copied as written ("2021–2023", "since spring"). Never work out or tidy a date.
- Traits: only traits the document states about the person. When a sentence says who holds the view ("Friends say I am patient"), use the whole sentence, so the game doesn't turn someone else's view into the person's own claim.

A field the document doesn't give stays out of the map. Fill marks it "not in source" on the check sheet and hides it in the game.

## Step 3: Fill (script)
`node scripts/cv-fill.js runs/<run>`
Copies every text from its numbered line into `game.html` and `check-sheet.html`, puts levels in the job post's order and evidence in line order, and prints what was left out and an estimated play time. If it stops, it says which map line is wrong: fix `map.txt` and run it again. Nothing is written until the whole map is right.

**Play time: at most 5 minutes**, reading included. If the estimate is over, cut evidence pieces per door first (down to 1), then ask the person.

## Step 4: Check (script)
`node scripts/cv-check.js runs/<run>`
Confirms every piece in the game is in the line it cites, character for character, that the game is the template with only its data filled in, and that the check sheet matches. Writes `check-result.txt`. **One FAIL and the game is not handed over:** fix `map.txt`, run Fill, run Check again.

## Hand over
Give the person both files and say, in plain words:
1. The game is for the employer. The check sheet is for them only, because it lists what was left out.
2. Before sending, look at sections 2 and 3 of the check sheet: requirements left out, and life lines left out. A strong experience left out, or a requirement dropped that their story does cover, decides what the employer sees. To change it, edit the life document or ask for a different map, then run Fill again. Never edit the game itself.
3. On the first run: change one word in `game.html` by hand, then load it into section 5 of the check sheet (or run Check) and watch it turn red. That proves the test works.

## Never
- Type text into the game, the check sheet or the numbered files. Only the scripts write them.
- Reword a line, fix its spelling, or spell a name "the usual way".
- Add a date, number, score, skill, company or next step the input doesn't hold.
- Edit the templates or scripts during a run.
- Hand over a game that failed the check.

## By hand: code execution off
Unproven. If the templates drift when copied by hand, the README makes code execution required.
1. **Number:** write `life-lines.txt` and `job-lines.txt` yourself. Follow step 1's splitting rules exactly, copy every character, one line per row as `L1`, a tab, then the text. If your splitting differs from the script's, the check in step 4 will fail, because the line numbers will point at different lines.
2. **Map:** as above.
3. **Fill:** build the data exactly as `output-contract.md` describes. Copy `game-template.html` whole and change only the text between the tags of the script with `id="cv-data"`. Copy `check-sheet-template.html` whole and change only the `cv-data` and `cv-sheet` blocks. Hand both over as files.
4. **Check:** you can't run it. Tell the person to open `check-sheet.html`, paste the two original documents into section 5, load `game.html`, and press "Run the check". Only a PASS there counts.
