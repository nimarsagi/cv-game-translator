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
 *     writes  game.html and check-sheet.html in the run folder,
 *             and lists every line that was not used
 *     Any problem in the map stops it before a file is written.
 *
 *   node cv-fill.js --refresh-template
 *     after cv-number.js, cv-check.js or game-template.html changed: copies the
 *     current checker code and the game template's fingerprint into
 *     check-sheet-template.html (the by-hand path uses that template as it is).
 */
'use strict';
var fs = require('fs');
var path = require('path');
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

// ---- maintenance mode ----
if (process.argv[2] === '--refresh-template') {
  var sheetTemplatePath = factoryFile('check-sheet-template.html');
  var gameT = read(factoryFile('game-template.html'));
  fs.writeFileSync(sheetTemplatePath, inlineCode(read(sheetTemplatePath), gameT));
  console.log('Refreshed ' + sheetTemplatePath + ' (checker code and game-template fingerprint ' + C.templateFingerprint(gameT) + ').');
  process.exit(0);
}

var dir = process.argv[2];
if (!dir) {
  console.error('Usage: node cv-fill.js <run-folder>   or   node cv-fill.js --refresh-template');
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
read(inRun('map.txt')).split(/\r?\n/).forEach(function (raw, i) {
  var l = raw.trim();
  if (!l || l[0] === '#') return;
  var m = /^(name|contact|job title|company|requirement|evidence|role|dates|trait)\s*:\s*([LJ]\d+)\s*(.*)$/i.exec(l);
  if (!m) { errors.push('map.txt line ' + (i + 1) + ': cannot read "' + l + '"'); return; }
  var rest = m[3].trim();
  var piece = null;
  if (rest) {
    var q = /^"([\s\S]*)"$/.exec(rest) || /^“([\s\S]*)”$/.exec(rest);
    if (!q) { errors.push('map.txt line ' + (i + 1) + ': put the piece in double quotes, or leave it off to use the whole line'); return; }
    piece = q[1];
  }
  entries.push({ key: m[1].toLowerCase(), ref: m[2].toUpperCase(), piece: piece, at: i + 1 });
});

var f = { name: [], contact: [], jobTitle: [], company: [], requirements: [], roles: [], traits: [] };
var lastReq = null;
var lastRole = null;
function make(e, source) {
  try { return C.makeItem(docs, e.ref, e.piece, source); } catch (err) {
    errors.push('map.txt line ' + e.at + ': ' + err.message);
    return null;
  }
}
entries.forEach(function (e) {
  var x;
  if (e.key !== 'evidence' && e.key !== 'requirement') lastReq = null;
  if (e.key !== 'dates' && e.key !== 'role') lastRole = null;
  switch (e.key) {
    case 'name': if ((x = make(e, 'L'))) f.name.push(x); break;
    case 'contact': if ((x = make(e, 'L'))) f.contact.push(x); break;
    case 'job title': if ((x = make(e, 'J'))) f.jobTitle.push(x); break;
    case 'company': if ((x = make(e, 'J'))) f.company.push(x); break;
    case 'trait': if ((x = make(e, 'L'))) f.traits.push(x); break;
    case 'requirement':
      x = make(e, 'J');
      lastReq = { asks: x, evidence: [], at: e.at };
      if (x) f.requirements.push(lastReq);
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
  if (list.length > field.max) errors.push(what + ': ' + list.length + ' given, at most ' + field.max);
}
limit(f.name, 'name', 'name');
limit(f.contact, 'contact', 'contact');
limit(f.jobTitle, 'jobTitle', 'job title');
limit(f.company, 'company', 'company');
limit(f.roles, 'roles', 'role');
limit(f.traits, 'traits', 'trait');

function key(x) { return x.item.ref + '|' + x.item.text; }
function noRepeats(list, what) {
  var seen = {};
  list.forEach(function (x) {
    if (seen[key(x)]) errors.push(what + ': ' + x.item.ref + ' "' + x.item.text + '" is listed twice');
    seen[key(x)] = true;
  });
}
f.requirements.forEach(function (r) {
  if (r.evidence.length > C.MAX_EVIDENCE) errors.push('map.txt line ' + r.at + ': ' + r.evidence.length + ' pieces of evidence, at most ' + C.MAX_EVIDENCE);
  noRepeats(r.evidence, 'evidence for ' + r.asks.item.ref);
});
f.roles.forEach(function (r) { if (r.dates.length > 1) errors.push('map.txt line ' + r.at + ': a role takes one dates line'); });
noRepeats(f.requirements.map(function (r) { return r.asks; }), 'requirement');
noRepeats(f.contact, 'contact');
noRepeats(f.traits, 'trait');
noRepeats(f.roles.map(function (r) { return r.role; }), 'role');
if (errors.length) fail(errors);

// ---- the fields, in the fixed order; sorted by line so the order never depends on the AI ----
function byOrder(a, b) { return a.order - b.order; }
function items(list) { return list.slice().sort(byOrder).map(function (x) { return x.item; }); }
var reqs = f.requirements.slice().sort(function (a, b) { return a.asks.order - b.asks.order; });
var levels = reqs.filter(function (r) { return r.evidence.length > 0; });
var leftOut = reqs.filter(function (r) { return r.evidence.length === 0; });
var fields = {
  name: items(f.name),
  contact: items(f.contact),
  jobTitle: items(f.jobTitle),
  company: items(f.company),
  levels: levels.map(function (r) { return { asks: r.asks.item, evidence: items(r.evidence) }; }),
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
var empty = C.FIELDS.filter(function (fl) { return fields[fl.key].length === 0; }).map(function (fl) { return fl.label; });
var words = 0;
C.walk(fields).items.forEach(function (x) { words += x.item.text.split(/\s+/).length; });
var stops = 2 + levels.length + (fields.roles.length ? 1 : 0) + (fields.traits.length ? 1 : 0);
var minutes = words / 200 + stops * 3 / 60;
var lifeUnused = unused(acc.life);
var jobUnused = unused(acc.job);

console.log([
  'Filled: ' + path.join(dir, 'game.html') + ' and ' + path.join(dir, 'check-sheet.html'),
  '  Levels (requirements with evidence, in the job post\'s order): ' + levels.length,
  '  Requirements left out, no evidence found: ' + (leftOut.length ? leftOut.map(function (r) { return shown(r.asks.item); }).join(', ') : 'none'),
  '  Fields not in source (hidden in the game, marked on the check sheet): ' + (empty.length ? empty.join(', ') : 'none'),
  '  Life-document lines not used: ' + lifeUnused.length + ' of ' + docs.L.length + (lifeUnused.length ? ' (' + lifeUnused.join(', ') + ')' : ''),
  '  Job-post lines not used (not a requirement): ' + jobUnused.length + ' of ' + docs.J.length + (jobUnused.length ? ' (' + jobUnused.join(', ') + ')' : ''),
  '  Play time, estimated: about ' + minutes.toFixed(1) + ' minutes (' + words + ' words at 200 a minute, ' + stops + ' stops). Limit: 5.',
  'Next: node cv-check.js ' + dir
].join('\n'));
