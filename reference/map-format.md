# map-format.md: how to write map.txt

`map.txt` is the one file Claude writes in a run. It holds line numbers, exact pieces of those lines, and for each chapter two fixed words: its part and its scene. Nothing else. `cv-fill.js` reads it and copies the words out of the numbered lines itself.

## One entry per row

```
<kind>: <line number>
<kind>: <line number> "<exact piece of that line>"
part: <past | present | future>
scene: <a scene name from the list below>
```

- **Line number:** `L` + a number for the life document (`life-lines.txt`), `J` + a number for the job post (`job-lines.txt`).
- **No piece:** the whole line is used.
- **A piece:** a run of whole words from that line, in double quotes, exactly as they stand in it. Fill finds it even if you typed a straight quote or a hyphen where the line has a curly quote or a dash, and then copies the line's own characters. Anything else that differs stops Fill.
- Rows starting with `#` and blank rows are ignored. Use `#` for your own notes; they never reach the game.

## The kinds

| Kind | Takes | Belongs to | At most |
|---|---|---|---|
| `name:` | an L line | | 1 |
| `contact:` | an L line | | 4 |
| `job title:` | a J line | | 1 |
| `company:` | a J line | | 1 |
| `chapter:` | an L line: the one that names the chapter | starts a chapter | 10 |
| `part:` | `past`, `present` or `future` | the chapter above | exactly 1 per chapter |
| `scene:` | a scene name from the list below | the chapter above | exactly 1 per chapter |
| `story:` | an L line | the chapter above | 1 to 4 per chapter |
| `requirement:` | a J line | the chapter above | no limit |
| `evidence:` | an L line | the `requirement:` row just above it | 3 per requirement |
| `role:` | an L line | | 8 |
| `dates:` | an L line | the `role:` row just above it | 1 per role |
| `trait:` | an L line | | 5 |

Fill stops if a field holds more.

**A chapter** is the `chapter:` row and every `part:`, `scene:`, `story:`, `requirement:` and `evidence:` row after it, up to the next `chapter:` row or any other kind of row (`name:`, `role:`, `trait:` and so on).

**A requirement with evidence must sit in a chapter:** that is where the game shows it. A `requirement:` with no `evidence:` under it is a requirement left out, wherever it sits: not in the game, listed on the check sheet.

Chapters play in the order their `chapter:` rows appear in the map, so write them in the order the story should be told. Everything else is sorted by Fill, whatever order you wrote it in: requirements inside a chapter in the job post's line order, all other pieces in the life document's line order. The parts must follow the chapter order: no `past` chapter after a `present` or `future` one, no `present` after a `future`.

## The scenes

Each chapter plays in one scene, the place the guide flies to. The scenes are built into the game; pick the one that fits what the chapter is about. The same scene may serve more than one chapter.

| Scene | What it shows | Fits |
|---|---|---|
| `home` | a house with a garden and a tree | childhood, family, where it began |
| `classroom` | school desks, a chalkboard, tall windows | school, early years, learning |
| `stage` | a theatre stage with curtains and spotlights | performing, presenting, a first audience |
| `film-set` | a camera on rails, lights, a director's chair | film, video, creative work |
| `lecture-hall` | tiered rows of seats facing a big screen | university, studies, research |
| `library` | tall bookshelves, a reading table, a lamp | mentors, reading, deep study |
| `trading-screens` | a desk ringed by screens of price charts | markets, finance, numbers |
| `ai-network` | glowing nodes and links, pulses of light | AI, software, data |
| `crossroads` | a road splitting in two under a wide sky | a decision, leaving the expected path |
| `city-street` | a street of shops and a café | meeting people, city life, shops and service jobs |
| `workshop` | a workbench with tools, gears and a glowing screen | building, making, first projects |
| `wasteland` | rocky cliffs under a storm sky | a struggle, a hard test, setbacks |
| `sky-temple` | a temple on a floating rock, with stone tablets | lessons learned, rewards, principles |
| `sunrise-city` | a city skyline at sunrise, seen from above | the future, what comes next |

The check sheet lists each chapter's scene, so the person can swap one: change its `scene:` row and run Fill again.

## What Fill refuses
- A line number that doesn't exist, or an L line where a J line belongs (and the other way round).
- A piece that isn't in its line word for word, or that starts or ends in the middle of a word.
- A cut that drops a word that can flip the meaning. Use the whole line, or a piece that keeps the word.
  - In any line: not, no, never, none, nor, cannot, without, n't.
  - In L lines only, also: help(ed/ing), assist(ed/ing), supported, supporting, contribute(d/ing), partly, partially, tried, attempted, almost, nearly, hardly, barely. Cutting "helping agents" out of a job post's list of duties is fine; cutting "helped" out of "I helped build the website" is not.
- A chapter without exactly one `part:` and one `scene:`, a part or scene that isn't in the lists above, a chapter with no `story:`, or parts out of order.
- A `part:`, `scene:` or `story:` row with no chapter above it, and a requirement with evidence outside a chapter.
- The same piece twice in one field, the same requirement in two places, the same line as both story and evidence in one chapter, or more pieces than a field may hold.

## The shape of a map (line numbers only, not a real run)

```
name: L1 "<the name as written in L1>"
contact: L2 "<the email as written in L2>"
job title: J1
company: J2
requirement: J6 "<second skill listed in J6>"
requirement: J7

chapter: L13 "<the chapter's title as written in L13>"
part: past
scene: classroom
story: L14

chapter: L40
part: present
scene: ai-network
story: L41
story: L44
requirement: J6 "<first skill listed in J6>"
evidence: L43
evidence: L120
requirement: J4 "<one duty from J4>"
evidence: L45

role: L150 "<the role as written in L150>"
dates: L150 "<the dates as written in L150>"
trait: L170
```

The two requirements at the top have no evidence: they are left out. Write left-out requirements above the first chapter: there, adding evidence to one later gets refused instead of quietly putting it in the chapter above.
