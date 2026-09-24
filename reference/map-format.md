# map-format.md: how to write map.txt

`map.txt` is the one file Claude writes in a run. It holds line numbers and exact pieces of those lines, and nothing else. `cv-fill.js` reads it and copies the words out of the numbered lines itself.

## One entry per row

```
<kind>: <line number>
<kind>: <line number> "<exact piece of that line>"
```

- **Line number:** `L` + a number for the life document (`life-lines.txt`), `J` + a number for the job post (`job-lines.txt`).
- **No piece:** the whole line is used.
- **A piece:** a run of whole words from that line, in double quotes, exactly as they stand in it. Fill finds it even if you typed a straight quote or a hyphen where the line has a curly quote or a dash, and then copies the line's own characters. Anything else that differs stops Fill.
- Rows starting with `#` and blank rows are ignored. Use `#` for your own notes; they never reach the game.

## The kinds

| Kind | Takes | Belongs to |
|---|---|---|
| `name:` | an L line | |
| `contact:` | an L line | |
| `job title:` | a J line | |
| `company:` | a J line | |
| `requirement:` | a J line | |
| `evidence:` | an L line | the `requirement:` row just above it |
| `role:` | an L line | |
| `dates:` | an L line | the `role:` row just above it |
| `trait:` | an L line | |

How many of each a field may hold is in `output-contract.md`; Fill stops if a field holds more.

Order in the file doesn't matter for anything except `evidence:` (under its requirement) and `dates:` (under its role). Fill puts levels in the job post's line order and everything else in the life document's line order, so the result never depends on the order you wrote things in.

A `requirement:` with no `evidence:` under it is a requirement left out: no door in the game, listed on the check sheet.

## What Fill refuses
- A line number that doesn't exist, or an L line where a J line belongs (and the other way round).
- A piece that isn't in its line word for word, or that starts or ends in the middle of a word.
- A cut that drops a word that can flip the meaning: not, no, never, none, nor, cannot, without, n't, help(ed/ing), assist(ed/ing), supported, supporting, contribute(d/ing), partly, partially, tried, attempted, almost, nearly, hardly, barely. Use the whole line, or a piece that keeps the word.
- The same piece twice in one field, or more pieces than a field may hold.

## The shape of a map (line numbers only, not a real run)

```
name: L2 "<the name as written in L2>"
contact: L3 "<the email as written in L3>"
job title: J1
company: J2
requirement: J4 "<one duty from J4>"
evidence: L6
requirement: J6 "<first skill listed in J6>"
evidence: L9
evidence: L12
requirement: J6 "<second skill listed in J6>"
requirement: J7
evidence: L14
role: L5 "<the role as written in L5>"
dates: L5 "<the dates as written in L5>"
trait: L20
```
