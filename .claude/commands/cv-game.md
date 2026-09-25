---
description: Build the CV game for one job post in my-story/job-posts/
argument-hint: [part of a job post's file name, or the job post itself]
---

Build a CV game from the life document in `my-story/` (`life-document.md` or `.txt`) and ONE job post from `my-story/job-posts/`.

1. Pick exactly one job post:
   - If "$ARGUMENTS" is a job post itself (not a file name), save it unchanged as `my-story/job-posts/<company>-<job-title>.md` (lowercase, dashes) and use it.
   - If it's part of a file name, use that file. If it matches more than one, ask.
   - If it's empty and there is one post, say which and use it.
   - If it's empty and there are several, ask which one. List each file with the company and job title inside it, and mark any that already has a run: a folder in `runs/` whose `job-post` file is the same text. Don't guess and don't start until the person answers.
   - If there is no life document or no job post, say where to put them and stop.
2. Once it's picked, use only that post for the whole run. From then on never read, quote or map a line from any other job post, and carry nothing over from an earlier run for another job, even in this conversation.
3. Follow `CLAUDE.md` "Start here": make the run folder, copy in the life document and the chosen post with `cp`, and do the four steps in `rules.md`.
4. When done, say the post's file name, company and job title, PASS or FAIL, the play time, and the paths of `game.html` and `check-sheet.html`.
