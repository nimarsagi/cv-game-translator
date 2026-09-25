/* cv-fill.js — step 3, Fill.
 *
 * Completes the fixed game template and check-sheet template from map.txt,
 * copying every text from its numbered line. No text in the game passes
 * through the AI: the map holds line numbers and exact pieces, and this
 * script copies the words from the line itself.
 *
 *   node cv-fill.js <run-folder>
 *     reads   life-lines.txt, job-lines.txt, map.txt in the run folder,
 *             and game-template.html, check-sheet-template.html
 *     writes  game.html and check-sheet.html in the run folder, and prints each
 *             chapter's part and scene, what was left out, every line not used
 *             and the estimated play time
 *     Any problem in the map stops it before a file is written.
 *     Then runs cv-check.js on the run folder and exits with its result.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var C = require('./cv-check.js');

function factoryFile(name) {
  var dirs = [__dirname, path.join(__dirname, '..', 'reference'), path.join(__dirname, '..'), process.cwd(), path.join(process.cwd(), 'reference')];
  for (var i = 0; i < dirs.length; i++) {
    var p = path.join(dirs[i], name);
    if (fs.existsSync(p)) return p;
  }
  fail(['Cannot find ' + name + '. Put it next to cv-fill.js or in a reference/ folder beside it.']);
}
function read(p) { return fs.readFileSync(p, 'utf8'); }
function fail(errors) {
  console.error('Fill stopped. Nothing was written.\n  ' + errors.join('\n  '));
  process.exit(1);
}

function inlineCode(sheetHtml, gameTemplate) {
  var numberSrc = read(path.join(__dirname, 'cv-number.js')).trim();
  var checkSrc = read(path.join(__dirname, 'cv-check.js')).trim();
  var out = C.writeBlock(sheetHtml, 'cv-number-code', '\n' + numberSrc + '\n');
  out = C.writeBlock(out, 'cv-check-code', '\n' + checkSrc + '\n');
  return C.writeBlock(out, 'cv-template-fingerprint', JSON.stringify(C.templateFingerprint(gameTemplate)));
}

var dir = process.argv[2];
if (!dir) {
  console.error('Usage: node cv-fill.js <run-folder>');
  process.exit(2);
}
function inRun(name) {
  var p = path.join(dir, name);
  if (!fs.existsSync(p)) fail(['Missing ' + name + ' in ' + dir + (/lines/.test(name) ? ': run Number first.' : '.')]);
  return p;
}
function inputName(base) {
  var names = [base + '.txt', base + '.md', base + '.markdown'];
  for (var i = 0; i < names.length; i++) if (fs.existsSync(path.join(dir, names[i]))) return names[i];
  return base;
}

// ---- numbered lines ----
function readLines(file, letter) {
  var lines = [];
  read(file).split(/\r?\n/).forEach(function (l) {
    var m = /^([LJ])(\d+)\t(.*)$/.exec(l);
    if (!m) return;
    if (m[1] !== letter || Number(m[2]) !== lines.length + 1) {
      fail([path.basename(file) + ': expected ' + letter + (lines.length + 1) + ' but found ' + m[1] + m[2] + '. Run Number again.']);
    }
    lines.push(m[3]);
  });
  return lines;
}
var docs = { L: readLines(inRun('life-lines.txt'), 'L'), J: readLines(inRun('job-lines.txt'), 'J') };

// ---- the map ----
var errors = [];
var entries = [];
var ROW = /^(name|contact|job title|company|chapter|part|scene|story|requirement|evidence|role|dates|trait)\s*:\s*(.*)$/i;
read(inRun('map.txt')).split(/\r?\n/).forEach(function (raw, i) {
  var l = raw.trim();
  if (!l || l[0] === '#') return;
  var m = ROW.exec(l);
  if (!m) { errors.push('map.txt line ' + (i + 1) + ': cannot read "' + l + '"'); return; }
  var kind = m[1].toLowerCase();
  var rest = m[2].trim();
  // part: and scene: take a word, not a line number.
  if (kind === 'part' || kind === 'scene') { entries.push({ key: kind, word: rest.toLowerCase(), typed: rest, at: i + 1 }); return; }
  var r = /^([LJ]\d+)\s*(.*)$/i.exec(rest);
  if (!r) { errors.push('map.txt line ' + (i + 1) + ': cannot read "' + l + '". After "' + kind + ':" comes a line number, like L12 or J3'); return; }
  rest = r[2].trim();
  var piece = null;
  if (rest) {
    var q = /^"([\s\S]*)"$/.exec(rest) || /^“([\s\S]*)”$/.exec(rest);
    if (!q) { errors.push('map.txt line ' + (i + 1) + ': put the piece in double quotes, or leave it off to use the whole line'); return; }
    piece = q[1];
  }
  entries.push({ key: kind, ref: r[1].toUpperCase(), piece: piece, at: i + 1 });
});

// Rows that stay in the chapter above them. Any other row ends it.
var IN_CHAPTER = { part: true, scene: true, story: true, requirement: true, evidence: true };
var f = { name: [], contact: [], jobTitle: [], company: [], roles: [], traits: [] };
var chapters = [];
var requirements = [];   // every requirement row, in a chapter or not
var chapter = null;
var lastReq = null;
var lastRole = null;
function make(e, source) {
  try {
    var x = C.makeItem(docs, e.ref, e.piece, source);
    x.at = e.at;
    return x;
  } catch (err) {
    errors.push('map.txt line ' + e.at + ': ' + err.message);
    return null;
  }
}
function notInChapter(e) {
  errors.push('map.txt line ' + e.at + ': this ' + e.key + ': row has no chapter: row above it. Put it under its chapter; ' +
    'a chapter ends at the first row that is not part:, scene:, story:, requirement: or evidence:');
}
entries.forEach(function (e) {
  var x;
  if (!IN_CHAPTER[e.key]) chapter = null;
  if (e.key !== 'evidence' && e.key !== 'requirement') lastReq = null;
  if (e.key !== 'dates' && e.key !== 'role') lastRole = null;
  switch (e.key) {
    case 'name': if ((x = make(e, 'L'))) f.name.push(x); break;
    case 'contact': if ((x = make(e, 'L'))) f.contact.push(x); break;
    case 'job title': if ((x = make(e, 'J'))) f.jobTitle.push(x); break;
    case 'company': if ((x = make(e, 'J'))) f.company.push(x); break;
    case 'trait': if ((x = make(e, 'L'))) f.traits.push(x); break;
    case 'chapter':
      chapter = { title: make(e, 'L'), parts: [], scenes: [], story: [], storyRows: 0, reqs: [], at: e.at };
      chapters.push(chapter);
      break;
    case 'part':
      if (!chapter) { notInChapter(e); break; }
      if (C.PARTS.indexOf(e.word) === -1) errors.push('map.txt line ' + e.at + ': "' + e.typed + '" is not a part. Use past, present or future');
      chapter.parts.push(e);
      break;
    case 'scene':
      if (!chapter) { notInChapter(e); break; }
      if (C.SCENES.indexOf(e.word) === -1) errors.push('map.txt line ' + e.at + ': "' + e.typed + '" is not a scene. Use one of: ' + C.SCENES.join(', '));
      chapter.scenes.push(e);
      break;
    case 'story':
      if (!chapter) { notInChapter(e); break; }
      chapter.storyRows++;
      if ((x = make(e, 'L'))) chapter.story.push(x);
      break;
    case 'requirement':
      x = make(e, 'J');
      lastReq = { asks: x, evidence: [], at: e.at, chapter: chapter };
      if (x) {
        requirements.push(lastReq);
        if (chapter) chapter.reqs.push(lastReq);
      }
      break;
    case 'evidence':
      if (!lastReq) { errors.push('map.txt line ' + e.at + ': evidence must follow its requirement line'); break; }
      if ((x = make(e, 'L'))) lastReq.evidence.push(x);
      break;
    case 'role':
      x = make(e, 'L');
      lastRole = { role: x, dates: [], at: e.at };
      if (x) f.roles.push(lastRole);
      break;
    case 'dates':
      if (!lastRole) { errors.push('map.txt line ' + e.at + ': dates must follow its role line'); break; }
      if ((x = make(e, 'L'))) lastRole.dates.push(x);
      break;
  }
});

function limit(list, fieldKey, what) {
  var field = C.FIELDS.filter(function (fl) { return fl.key === fieldKey; })[0];
  if (list.length > field.max) errors.push('map.txt line ' + list[field.max].at + ': ' + what + ': ' + list.length + ' given, at most ' + field.max);
}
limit(f.name, 'name', 'name');
limit(f.contact, 'contact', 'contact');
limit(f.jobTitle, 'jobTitle', 'job title');
limit(f.company, 'company', 'company');
limit(chapters, 'chapters', 'chapter');
limit(f.roles, 'roles', 'role');
limit(f.traits, 'traits', 'trait');

function key(x) { return x.item.ref + '|' + x.item.text; }
function noRepeats(list, what) {
  var seen = {};
  list.forEach(function (x) {
    if (seen[key(x)]) errors.push('map.txt line ' + x.at + ': ' + what + ': ' + x.item.ref + ' "' + x.item.text + '" is listed twice');
    seen[key(x)] = true;
  });
}

// Each chapter: one part, one scene, 1 to 4 story lines, and no line both told and shown as evidence.
var chapterAt = {};
chapters.forEach(function (c) {
  if (!c.title) return;
  var at = 'map.txt line ' + c.at + ': ';
  var name = 'chapter ' + c.title.item.ref;
  if (chapterAt[c.title.item.ref]) errors.push(at + name + ' is already a chapter at map.txt line ' + chapterAt[c.title.item.ref] + '. Each line starts one chapter at most');
  else chapterAt[c.title.item.ref] = c.at;
  function lines(rows) { return rows.map(function (r) { return r.at; }).join(', '); }
  if (!c.parts.length) errors.push(at + name + ' has no part: row. Add one under it: part: past, present or future');
  if (c.parts.length > 1) errors.push(at + name + ' has ' + c.parts.length + ' part: rows (map.txt lines ' + lines(c.parts) + '). Keep one');
  if (!c.scenes.length) errors.push(at + name + ' has no scene: row. Add one under it, with a scene from map-format.md');
  if (c.scenes.length > 1) errors.push(at + name + ' has ' + c.scenes.length + ' scene: rows (map.txt lines ' + lines(c.scenes) + '). Keep one');
  if (!c.storyRows) errors.push(at + name + ' has no story: row. Add 1 to ' + C.MAX_STORY + ' lines for the guide to say');
  if (c.storyRows > C.MAX_STORY) errors.push(at + name + ' has ' + c.storyRows + ' story: rows, at most ' + C.MAX_STORY + '. Keep the ones this job cares about most');
  noRepeats(c.story, name + ', story');
  var told = {};
  c.story.forEach(function (s) { told[s.item.ref] = s.at; });
  c.reqs.forEach(function (r) {
    r.evidence.forEach(function (ev) {
      if (told[ev.item.ref]) {
        errors.push('map.txt line ' + ev.at + ': ' + ev.item.ref + ' is evidence in ' + name + ', and already one of its story lines (map.txt line ' +
          told[ev.item.ref] + '). Use it once: as story or as evidence');
      }
    });
  });
});

// A requirement is shown once, in the chapter where its proof happened, or left out once.
var reqAt = {};
requirements.forEach(function (r) {
  var k = key(r.asks);
  if (reqAt[k]) {
    errors.push('map.txt line ' + r.at + ': requirement ' + r.asks.item.ref + ' "' + r.asks.item.text + '" is also at map.txt line ' + reqAt[k] +
      '. Each requirement goes in one place: in one chapter, or left out');
  } else reqAt[k] = r.at;
  if (r.evidence.length && !r.chapter) {
    errors.push('map.txt line ' + r.at + ': requirement ' + r.asks.item.ref + ' has evidence but no chapter above it. ' +
      'Move it, with its evidence, under the chapter where the proof happened');
  }
  if (r.evidence.length > C.MAX_EVIDENCE) {
    errors.push('map.txt line ' + r.at + ': requirement ' + r.asks.item.ref + ' has ' + r.evidence.length + ' pieces of evidence, at most ' + C.MAX_EVIDENCE + '. Keep the strongest');
  }
  noRepeats(r.evidence, 'evidence for ' + r.asks.item.ref);
});
f.roles.forEach(function (r) { if (r.dates.length > 1) errors.push('map.txt line ' + r.at + ': a role takes one dates line'); });
noRepeats(f.contact, 'contact');
noRepeats(f.traits, 'trait');
noRepeats(f.roles.map(function (r) { return r.role; }), 'role');

// The parts, in the map's chapter order, never go back.
if (chapters.every(function (c) { return c.title && c.parts.length === 1 && C.PARTS.indexOf(c.parts[0].word) !== -1; })) {
  var top = null;
  chapters.forEach(function (c) {
    var p = C.PARTS.indexOf(c.parts[0].word);
    var q = top ? C.PARTS.indexOf(top.parts[0].word) : -1;
    if (p < q) {
      errors.push('map.txt line ' + c.parts[0].at + ': parts out of order. Chapter ' + c.title.item.ref + ' is "' + c.parts[0].word +
        '", but it comes after chapter ' + top.title.item.ref + ' (map.txt line ' + top.at + '), which is "' + top.parts[0].word +
        '". Chapters play in the map\'s order, so the parts must go past, then present, then future');
    } else if (p > q) top = c;
  });
}
if (errors.length) fail(errors);

// ---- the fields, in the fixed order. Chapters keep the map's order; everything else is sorted by line,
// so no other order depends on the AI ----
function byOrder(a, b) { return a.order - b.order; }
function items(list) { return list.slice().sort(byOrder).map(function (x) { return x.item; }); }
function byAsks(a, b) { return a.asks.order - b.asks.order; }
var leftOut = requirements.filter(function (r) { return !r.evidence.length; }).sort(byAsks);
var fields = {
  name: items(f.name),
  contact: items(f.contact),
  jobTitle: items(f.jobTitle),
  company: items(f.company),
  chapters: chapters.map(function (c) {
    return {
      title: c.title.item,
      part: c.parts[0].word,
      scene: c.scenes[0].word,
      story: items(c.story),
      requirements: c.reqs.filter(function (r) { return r.evidence.length; }).sort(byAsks)
        .map(function (r) { return { asks: r.asks.item, evidence: items(r.evidence) }; })
    };
  }),
  roles: f.roles.slice().sort(function (a, b) { return a.role.order - b.role.order; })
    .map(function (r) { return { role: r.role.item, dates: items(r.dates) }; }),
  traits: items(f.traits)
};
var shape = C.walk(fields).problems;
if (shape.length) fail(shape);

// ---- write the two files ----
var gameTemplate = read(factoryFile('game-template.html'));
var sheetTemplate = read(factoryFile('check-sheet-template.html'));
var dataJSON = C.toBlockJSON({ format: C.DATA_FORMAT, fields: fields });
var sheetData = {
  format: C.SHEET_FORMAT,
  lifeFile: inputName('life-document'),
  jobFile: inputName('job-post'),
  lifeLines: docs.L,
  jobLines: docs.J,
  leftOut: leftOut.map(function (r) { return { asks: r.asks.item }; })
};
var game = C.writeBlock(gameTemplate, 'cv-data', dataJSON);
var sheet = C.writeBlock(sheetTemplate, 'cv-data', dataJSON);
sheet = C.writeBlock(sheet, 'cv-sheet', C.toBlockJSON(sheetData));
sheet = inlineCode(sheet, gameTemplate);
fs.writeFileSync(path.join(dir, 'game.html'), game);
fs.writeFileSync(path.join(dir, 'check-sheet.html'), sheet);

// ---- what was used, and what was not ----
var acc = C.accountLines(fields, sheetData.leftOut, docs.L, docs.J);
function unused(list) { return list.filter(function (x) { return !x.uses.length; }).map(function (x) { return x.ref; }); }
function shown(item) { return item.ref + (item.cutStart || item.cutEnd ? ' "' + item.text + '"' : ''); }
function count(n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); }
var empty = C.FIELDS.filter(function (fl) { return fields[fl.key].length === 0; }).map(function (fl) { return fl.label; });
var lifeUnused = unused(acc.life);
var jobUnused = unused(acc.job);
var shownReqs = 0;
var storyLines = 0;
var chapterRows = fields.chapters.map(function (c) {
  shownReqs += c.requirements.length;
  storyLines += c.story.length;
  return '    ' + c.title.ref + ' (' + c.part + '): ' + c.scene + '. ' + count(c.story.length, 'story line') + ', ' +
    (c.requirements.length ? 'requirements ' + c.requirements.map(function (r) { return shown(r.asks); }).join(', ') : 'no requirements');
});

// Play time: reading at 200 words a minute, 4 seconds of flying per chapter, 2 seconds per step.
// Steps: start, each story line, each requirement, roles and traits when there are any, end.
var words = 0;
C.walk(fields).items.forEach(function (x) { words += x.item.text.split(/\s+/).length; });
var steps = 2 + storyLines + shownReqs + (fields.roles.length ? 1 : 0) + (fields.traits.length ? 1 : 0);
var minutes = (words / 200 * 60 + fields.chapters.length * 4 + steps * 2) / 60;
var timeRows = ['  Play time, estimated: about ' + minutes.toFixed(1) + ' minutes (' + words + ' words at 200 a minute, ' +
  count(fields.chapters.length, 'flight') + ' of 4 seconds, ' + count(steps, 'step') + ' of 2 seconds). Limit: 5.'];
if (minutes > 5) {
  var cut = [];
  var brief = fields.chapters.filter(function (c) { return !c.requirements.length && c.story.length > 1; })
    .map(function (c) { return c.title.ref; });
  if (brief.length) cut.push('story lines in chapters without requirements (' + brief.join(', ') + ')');
  if (fields.chapters.some(function (c) { return c.requirements.some(function (r) { return r.evidence.length > 1; }); })) {
    cut.push('evidence, down to 1 per requirement');
  }
  timeRows.push(cut.length ? '  Over 5 minutes. Cut first: ' + cut.join('; then ') + '. Then run Fill again.'
    : '  Over 5 minutes, with story and evidence already cut down: ask the person what to cut.');
}

console.log([
  'Filled: ' + path.join(dir, 'game.html') + ' and ' + path.join(dir, 'check-sheet.html'),
  '  Chapters, in the map\'s order: ' + fields.chapters.length
].concat(chapterRows, [
  '  Requirements shown, each in its chapter: ' + shownReqs,
  '  Requirements left out, no evidence found: ' + (leftOut.length ? leftOut.map(function (r) { return shown(r.asks.item); }).join(', ') : 'none'),
  '  Fields not in source (hidden in the game, marked on the check sheet): ' + (empty.length ? empty.join(', ') : 'none'),
  '  Life-document lines not used: ' + lifeUnused.length + ' of ' + docs.L.length + (lifeUnused.length ? ' (' + lifeUnused.join(', ') + ')' : ''),
  '  Job-post lines not used (not a requirement): ' + jobUnused.length + ' of ' + docs.J.length + (jobUnused.length ? ' (' + jobUnused.join(', ') + ')' : '')
], timeRows, ['']).join('\n'));

// ---- step 4, Check ----
var check = childProcess.spawnSync(process.execPath, [path.join(__dirname, 'cv-check.js'), dir], { stdio: 'inherit' });
process.exit(check.status === null ? 1 : check.status);
