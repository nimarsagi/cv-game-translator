# Identity: what this translator converts

**From:** two plain-text documents.
1. A **life document**: one person's life, skills, experience and personality, in their own words.
2. A **job post**: one job they are applying to.

**To:** two files, the same shape every run.
1. **`check-sheet.html`, the fixed-shape output.** The same seven fields in the same order every run (Name, Contact, Job title, Company, Levels, Roles, Traits). A field with nothing in the source says "not in source". It also lists every line of both inputs and where each one went, the requirements left out for lack of evidence, and a built-in check anyone can run. This is for the person and the judges, never for the employer.
2. **`game.html`, what the employer sees.** A short side-view pixel-art game: a character walks from door to door, one door per job requirement that the life document has evidence for. Behind each door is the requirement in the job post's own words and the life-document lines that answer it. Then the person's roles and stated traits. A "Show the full CV" button on every screen opens the same content as one plain page. It only shows fields that were filled; empty ones are hidden, not marked.

The contract for both is in `output-contract.md`.

## How it stays faithful
- **The AI only picks line numbers.** Both inputs are split into numbered lines (L1… for the life document, J1… for the job post) by a script that changes no character. Claude writes a map of line numbers and exact pieces, and nothing else. A script copies each text out of its line into the game. No word in the game passes through the AI.
- **The check.** Every piece of text in the game must appear inside the line it cites, character for character, ignoring only spacing, bold marks and a leading bullet. A cut shows as "…", and a cut may not drop a word that flips the meaning: "not" or "never" anywhere, and in the life document also words like "helped" or "partly". One miss fails the run, and the game isn't handed over.
- **Nothing drops out silently.** Every line of both inputs is listed on the check sheet: used (and where), left out, or not a requirement.
- **Relevant is a rule, not an opinion.** Each thing the job post asks for becomes a door if the life document has evidence for it, in the job post's order. With no evidence, it gets no door and is listed on the check sheet.

## What it never does
- Rewrite, polish or "strengthen" the person's words, or add the job post's keywords.
- Score, rank or rate: no fit percentage, no stat bars, no XP. The input holds no such numbers.
- Write game text: no story, no character names, no theme per job. The template's own words say nothing about the person ("Next", "The job asks:", "From the life document:").
- Say a requirement is met. A door shows what the job asks and what the life document says, side by side.
- Fill a gap with a guess. No date, name, number or skill that isn't in the input.
- Make a PDF, an applicant-tracking version or a cover letter, or host or send the game. The run ends at the two files.
