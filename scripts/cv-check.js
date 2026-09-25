/* cv-check.js — step 4, Check. Also the shared rules for what counts as a faithful piece.
 *
 * Confirms that every piece of text in the game appears inside the line it
 * cites, character for character, ignoring only spacing (and ** bold marks and
 * a leading bullet mark, which are formatting, not words). One miss fails the run.
 *
 *   node cv-check.js <run-folder>
 *     reads   game.html, check-sheet.html, life-document.*, job-post.* in the run folder,
 *             and game-template.html
 *     writes  check-result.txt; exit code 0 = pass, 1 = fail
 *     cv-fill.js runs it at the end of every Fill.
 *
 * Fill copies this file into each check-sheet.html, where a reader pastes the two
 * original documents and sees each item turn green or red. cv-fill.js uses it
 * too, so a bad piece is caught before anything is written.
 */
(function (root, factory) {
  var api = factory(function () {
    if (typeof require === 'function' && typeof module === 'object') return require('./cv-number.js');
    return root.CVNumber;
  });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CVCheck = api;
})(this, function (loadNumber) {
  'use strict';

  var DATA_FORMAT = 'cv-game-data/1';
  var SHEET_FORMAT = 'cv-sheet-data/1';
  var MAX_EVIDENCE = 3;

  // The fixed fields, in the fixed order. source: L = life document, J = job post.
  var FIELDS = [
    { key: 'name', label: 'Name', source: 'L', max: 1 },
    { key: 'contact', label: 'Contact', source: 'L', max: 4 },
    { key: 'jobTitle', label: 'Job title', source: 'J', max: 1 },
    { key: 'company', label: 'Company', source: 'J', max: 1 },
    { key: 'levels', label: 'Levels', source: null, max: null },
    { key: 'roles', label: 'Roles', source: 'L', max: 8 },
    { key: 'traits', label: 'Traits', source: 'L', max: 5 }
  ];

  var WORD = /[\p{L}\p{N}]/u;
  // A cut may not drop any of these words: each can flip what the rest says.
  // In a life-document line all of them count: "helped build" cut to "build" overstates the person.
  // In a job-post line only the "not" words count: cutting "helping agents" out of a list of
  // duties names fewer duties, but cutting "not" out of "Python is not required" invents one.
  var NEGATIONS = ['not', 'no', 'never', 'none', 'nor', 'cannot', 'without'];
  var SOFTENERS = ['help', 'helped', 'helping', 'assist', 'assisted', 'assisting', 'supported', 'supporting',
    'contribute', 'contributed', 'contributing', 'partly', 'partially', 'tried', 'attempted', 'almost', 'nearly', 'hardly', 'barely'];
  function wordPattern(words) {
    return new RegExp('(?:^|[^\\p{L}\\p{N}])(' + words.join('|') + ')(?=$|[^\\p{L}\\p{N}])|\\p{L}(n[\'’]t)(?=$|[^\\p{L}\\p{N}])', 'iu');
  }
  var FLIP = { L: wordPattern(NEGATIONS.concat(SOFTENERS)), J: wordPattern(NEGATIONS) };

  function stripMarker(s) {
    return String(s).replace(/^\s*(?:[-*+•·–—]|\d{1,2}[.)]|#{1,6})\s+/u, '');
  }
  // Formatting that is not words: spacing, ** or __ bold marks, a leading bullet mark.
  function clean(s) {
    return stripMarker(s).normalize('NFC').replace(/\*\*|__/g, '').replace(/\s+/g, ' ').trim();
  }
  // Used only to find a piece Claude typed: ignores quote and dash style. The text is still copied from the line.
  function loose(s) {
    return s.replace(/[‘’‚‛′]/g, "'")
      .replace(/[“”„‟″]/g, '"')
      .replace(/[‐-―]/g, '-');
  }
  function isWordChar(ch) { return typeof ch === 'string' && ch !== '' && WORD.test(ch); }

  function parseRef(ref) {
    var m = /^([LJ])([1-9]\d*)$/.exec(String(ref || '').trim());
    return m ? { source: m[1], n: Number(m[2]), ref: m[1] + m[2] } : null;
  }

  // Where a piece sits inside a line, starting and ending on word edges. strict = character for character.
  function locate(lineText, piece, strict) {
    var c = clean(lineText);
    var p = clean(piece);
    if (!p || !WORD.test(p)) return null;
    var hay = strict ? c : loose(c);
    var needle = strict ? p : loose(p);
    var from = 0;
    var i;
    while ((i = hay.indexOf(needle, from)) !== -1) {
      var j = i + needle.length;
      var cleanStart = !(isWordChar(c[i - 1]) && isWordChar(c[i]));
      var cleanEnd = !(isWordChar(c[j - 1]) && isWordChar(c[j]));
      if (cleanStart && cleanEnd) {
        var before = c.slice(0, i);
        var after = c.slice(j);
        return { text: c.slice(i, j), start: i, cutStart: WORD.test(before), cutEnd: WORD.test(after),
          dropped: before + ' … ' + after, line: c };
      }
      from = i + 1;
    }
    return null;
  }

  function flipWord(dropped, source) {
    var m = FLIP[source].exec(dropped);
    return m ? (m[1] || m[2]) : null;
  }

  function docName(source) { return source === 'L' ? 'life document' : 'job post'; }

  // Build one item from a line number and an optional piece. Used by cv-fill.js.
  // Returns { item, order } or throws with a reason a person can act on.
  function makeItem(docs, ref, piece, source) {
    var r = parseRef(ref);
    if (!r) throw new Error('"' + ref + '" is not a line number like L12 or J3');
    if (source && r.source !== source) throw new Error(r.ref + ': this field takes a ' + docName(source) + ' line (' + source + '...)');
    var line = docs[r.source][r.n - 1];
    if (line === undefined) throw new Error(r.ref + ' does not exist: the ' + docName(r.source) + ' has ' + docs[r.source].length + ' lines');
    var loc = locate(line, piece == null ? line : piece, false);
    if (!loc) {
      throw new Error(piece == null ? r.ref + ' has no words'
        : r.ref + ': "' + piece + '" is not in this line word for word. The line reads: ' + clean(line));
    }
    var flip = flipWord(loc.dropped, r.source);
    if (flip) throw new Error(r.ref + ': the cut drops "' + flip + '", which can flip the meaning. Use the whole line, or a piece that keeps "' + flip + '".');
    return { item: { ref: r.ref, text: loc.text, cutStart: loc.cutStart, cutEnd: loc.cutEnd }, order: r.n * 100000 + loc.start };
  }

  // Check one item against the lines. Returns null when it holds, or the reason it fails.
  function checkItem(docs, item, source) {
    if (!item || typeof item !== 'object') return 'not an item';
    var keys = Object.keys(item).sort().join(',');
    if (keys !== 'cutEnd,cutStart,ref,text') return 'unexpected parts: ' + keys;
    if (typeof item.text !== 'string') return 'no text';
    var r = parseRef(item.ref);
    if (!r) return '"' + item.ref + '" is not a line number';
    if (source && r.source !== source) return 'cites ' + r.ref + ', but this field comes from the ' + docName(source);
    var line = docs[r.source][r.n - 1];
    if (line === undefined) return r.ref + ' is not in the ' + docName(r.source) + ' (it has ' + docs[r.source].length + ' lines)';
    var loc = locate(line, item.text, true);
    if (!loc) return 'not found in ' + r.ref + ' character for character';
    if (loc.cutStart !== item.cutStart || loc.cutEnd !== item.cutEnd) return 'the … marks do not match where ' + r.ref + ' was cut';
    var flip = flipWord(loc.dropped, r.source);
    if (flip) return 'the cut drops "' + flip + '"';
    return null;
  }

  // Every item in the game data, with where it sits, plus any problem with the shape itself.
  function walk(fields) {
    var items = [];
    var problems = [];
    fields = fields && typeof fields === 'object' ? fields : {};
    function add(where, source, item) { items.push({ where: where, source: source, item: item }); }
    FIELDS.forEach(function (f) {
      var v = fields[f.key];
      if (!Array.isArray(v)) { problems.push(f.label + ' is missing'); return; }
      if (f.max && v.length > f.max) problems.push(f.label + ' holds ' + v.length + ' (at most ' + f.max + ')');
      if (f.key === 'levels') {
        v.forEach(function (lv, i) {
          var w = 'Level ' + (i + 1);
          if (!lv || typeof lv !== 'object' || Object.keys(lv).sort().join(',') !== 'asks,evidence') {
            problems.push(w + ' is not shaped as { asks, evidence }');
            return;
          }
          add(w + ', the job asks', 'J', lv.asks);
          if (!Array.isArray(lv.evidence) || lv.evidence.length < 1 || lv.evidence.length > MAX_EVIDENCE) {
            problems.push(w + ' must hold 1 to ' + MAX_EVIDENCE + ' pieces of evidence');
          }
          (Array.isArray(lv.evidence) ? lv.evidence : []).forEach(function (e, k) { add(w + ', evidence ' + (k + 1), 'L', e); });
        });
      } else if (f.key === 'roles') {
        v.forEach(function (ro, i) {
          var w = 'Role ' + (i + 1);
          if (!ro || typeof ro !== 'object' || Object.keys(ro).sort().join(',') !== 'dates,role') {
            problems.push(w + ' is not shaped as { role, dates }');
            return;
          }
          add(w, 'L', ro.role);
          if (!Array.isArray(ro.dates) || ro.dates.length > 1) problems.push(w + ': dates must be a list of 0 or 1 piece');
          (Array.isArray(ro.dates) ? ro.dates : []).forEach(function (d) { add(w + ', dates', 'L', d); });
        });
      } else {
        v.forEach(function (it, i) { add(f.max > 1 ? f.label + ' ' + (i + 1) : f.label, f.source, it); });
      }
    });
    var extra = Object.keys(fields).filter(function (k) { return !FIELDS.some(function (f) { return f.key === k; }); });
    if (extra.length) problems.push('fields that are not in the contract: ' + extra.join(', '));
    return { items: items, problems: problems };
  }

  // The check: the game's data against the two original documents, as text.
  function checkGame(data, lifeText, jobText) {
    var N = loadNumber();
    var docs = { L: N.splitIntoLines(lifeText), J: N.splitIntoLines(jobText) };
    var problems = [];
    if (!data || typeof data !== 'object' || data.format !== DATA_FORMAT) problems.push('the game data is not in format ' + DATA_FORMAT);
    var keys = data && typeof data === 'object' ? Object.keys(data).sort().join(',') : '';
    if (keys !== 'fields,format') problems.push('the game data holds more than the fixed fields (' + keys + ')');
    var w = walk(data && data.fields);
    problems = problems.concat(w.problems);
    var results = w.items.map(function (x) {
      var reason = checkItem(docs, x.item, x.source);
      var it = x.item && typeof x.item === 'object' ? x.item : {};
      return { where: x.where, ref: it.ref, text: it.text, cutStart: it.cutStart, cutEnd: it.cutEnd, ok: !reason, reason: reason };
    });
    var failed = results.filter(function (r) { return !r.ok; }).length;
    return { ok: problems.length === 0 && failed === 0, problems: problems, results: results, failed: failed,
      lineCounts: { L: docs.L.length, J: docs.J.length } };
  }

  // The check sheet's own data: its stored lines are the originals as numbered,
  // and each requirement it lists as left out is a piece of the job-post line it cites.
  function checkSheet(sheet, lifeText, jobText) {
    var N = loadNumber();
    var docs = { L: N.splitIntoLines(lifeText), J: N.splitIntoLines(jobText) };
    var problems = [];
    if (!sheet || typeof sheet !== 'object' || sheet.format !== SHEET_FORMAT) {
      return { ok: false, problems: ['the check-sheet data is not in format ' + SHEET_FORMAT], results: [] };
    }
    function same(a, b) { return Array.isArray(a) && a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
    if (!same(sheet.lifeLines, docs.L)) problems.push('the life-document lines stored in the check sheet differ from the life document');
    if (!same(sheet.jobLines, docs.J)) problems.push('the job-post lines stored in the check sheet differ from the job post');
    var results = (Array.isArray(sheet.leftOut) ? sheet.leftOut : []).map(function (lo, i) {
      var it = lo && lo.asks && typeof lo.asks === 'object' ? lo.asks : {};
      var reason = lo && typeof lo === 'object' && Object.keys(lo).join(',') === 'asks' ? checkItem(docs, lo.asks, 'J') : 'not shaped as { asks }';
      return { where: 'Requirement left out ' + (i + 1), ref: it.ref, text: it.text, cutStart: it.cutStart, cutEnd: it.cutEnd, ok: !reason, reason: reason };
    });
    var failed = results.filter(function (r) { return !r.ok; }).length;
    return { ok: problems.length === 0 && failed === 0, problems: problems, results: results, failed: failed };
  }

  // Every input line, with where it was used. Nothing drops out silently.
  function accountLines(fields, leftOut, lifeLines, jobLines) {
    var uses = { L: lifeLines.map(function () { return []; }), J: jobLines.map(function () { return []; }) };
    function mark(item, what) {
      var r = item && parseRef(item.ref);
      if (r && uses[r.source][r.n - 1]) uses[r.source][r.n - 1].push(what);
    }
    walk(fields).items.forEach(function (x) { mark(x.item, x.where); });
    (leftOut || []).forEach(function (lo) { mark(lo && lo.asks, 'requirement left out: no evidence found'); });
    function list(lines, source) {
      return lines.map(function (t, i) { return { ref: source + (i + 1), text: t, uses: uses[source][i] }; });
    }
    return { life: list(lifeLines, 'L'), job: list(jobLines, 'J') };
  }

  // Data blocks inside the HTML files: a script tag with an id, such as the one with id cv-data.
  function blockPattern(id) {
    return new RegExp('(<script\\b[^>]*\\bid="' + id + '"[^>]*>)([\\s\\S]*?)(<\\/script>)');
  }
  function readBlock(html, id) {
    var m = blockPattern(id).exec(String(html));
    return m ? m[2] : null;
  }
  function writeBlock(html, id, content) {
    var re = blockPattern(id);
    if (!re.test(html)) throw new Error('no block with id "' + id + '"');
    return String(html).replace(re, function (all, open, old, close) { return open + content + close; });
  }
  function toBlockJSON(obj) {
    return JSON.stringify(obj, null, 1).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }
  function readJSONBlock(html, id) {
    var raw = readBlock(html, id);
    if (raw === null) throw new Error('no block with id "' + id + '"');
    return JSON.parse(raw);
  }

  // A short fingerprint of a game file with its data taken out: the same for every run from one template.
  function templateFingerprint(html) {
    var s = writeBlock(String(html).replace(/\r\n?/g, '\n'), 'cv-data', '').replace(/\s+$/, '');
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  return {
    DATA_FORMAT: DATA_FORMAT, SHEET_FORMAT: SHEET_FORMAT, FIELDS: FIELDS, MAX_EVIDENCE: MAX_EVIDENCE,
    clean: clean, parseRef: parseRef, locate: locate, makeItem: makeItem, checkItem: checkItem, walk: walk,
    checkGame: checkGame, checkSheet: checkSheet, accountLines: accountLines, readBlock: readBlock, writeBlock: writeBlock,
    toBlockJSON: toBlockJSON, readJSONBlock: readJSONBlock, templateFingerprint: templateFingerprint
  };
});

// ---- command line (Node only) ----
if (typeof require === 'function' && typeof module === 'object' && require.main === module) {
  (function main() {
    var fs = require('fs');
    var path = require('path');
    var C = module.exports;
    var dir = process.argv[2];
    if (!dir) {
      console.error('Usage: node cv-check.js <run-folder>');
      process.exit(2);
    }
    function inRun(name, required) {
      var p = path.join(dir, name);
      if (fs.existsSync(p)) return p;
      if (required) { console.error('Missing ' + name + ' in ' + dir); process.exit(1); }
      return null;
    }
    function input(base) {
      return inRun(base + '.txt') || inRun(base + '.md') || inRun(base + '.markdown') || inRun(base + '.txt', true);
    }
    function factoryFile(name) {
      var dirs = [__dirname, path.join(__dirname, '..', 'reference'), path.join(__dirname, '..'), process.cwd(), path.join(process.cwd(), 'reference')];
      for (var i = 0; i < dirs.length; i++) {
        var p = path.join(dirs[i], name);
        if (fs.existsSync(p)) return p;
      }
      console.error('Cannot find ' + name + '. Put it next to cv-check.js or in a reference/ folder beside it.');
      process.exit(1);
    }
    function read(p) { return fs.readFileSync(p, 'utf8'); }
    function short(s) { s = String(s == null ? '' : s); return s.length > 70 ? s.slice(0, 67) + '...' : s; }

    var lifePath = input('life-document');
    var jobPath = input('job-post');
    var gameHtml = read(inRun('game.html', true));
    var sheetHtml = read(inRun('check-sheet.html', true));
    var gameTemplate = read(factoryFile('game-template.html'));
    var numberSrc = read(path.join(__dirname, 'cv-number.js')).trim();
    var checkSrc = read(__filename).trim();

    var out = [];
    var failures = 0;
    function line(ok, text) { out.push((ok ? 'PASS  ' : 'FAIL  ') + text); if (!ok) failures++; }

    out.push('Check of ' + path.join(dir, 'game.html') + ' against ' + path.basename(lifePath) + ' and ' + path.basename(jobPath));
    out.push('');
    var data;
    try { data = C.readJSONBlock(gameHtml, 'cv-data'); } catch (e) { data = null; line(false, 'game.html: cannot read its data (' + e.message + ')'); }
    var result = C.checkGame(data, read(lifePath), read(jobPath));
    result.results.forEach(function (r) {
      var shown = (r.cutStart ? '...' : '') + short(r.text) + (r.cutEnd ? '...' : '');
      line(r.ok, r.where + ' [' + r.ref + '] "' + shown + '"' + (r.ok ? '' : '  <- ' + r.reason));
    });
    result.problems.forEach(function (p) { line(false, 'Shape: ' + p); });
    var sheetInfo;
    try { sheetInfo = C.readJSONBlock(sheetHtml, 'cv-sheet'); } catch (e) { sheetInfo = null; }
    var sheetResult = C.checkSheet(sheetInfo, read(lifePath), read(jobPath));
    sheetResult.results.forEach(function (r) {
      var shown = (r.cutStart ? '...' : '') + short(r.text) + (r.cutEnd ? '...' : '');
      line(r.ok, 'Check sheet, ' + r.where + ' [' + r.ref + '] "' + shown + '"' + (r.ok ? '' : '  <- ' + r.reason));
    });
    sheetResult.problems.forEach(function (p) { line(false, 'Check sheet: ' + p); });
    out.push('');

    // The game is the template with only its data block filled.
    line(C.writeBlock(gameHtml, 'cv-data', '').trim() === C.writeBlock(gameTemplate, 'cv-data', '').trim(),
      'game.html is game-template.html with only its data filled in');
    // The check sheet shows the same data and runs the same checker.
    var sheetData = C.readBlock(sheetHtml, 'cv-data');
    line(sheetData !== null && sheetData.trim() === String(C.readBlock(gameHtml, 'cv-data')).trim(), 'check-sheet.html holds the same data as game.html');
    line(String(C.readBlock(sheetHtml, 'cv-number-code')).trim() === numberSrc && String(C.readBlock(sheetHtml, 'cv-check-code')).trim() === checkSrc,
      'check-sheet.html carries the same checker code as cv-number.js and cv-check.js');
    line(String(C.readBlock(sheetHtml, 'cv-template-fingerprint')).trim() === JSON.stringify(C.templateFingerprint(gameTemplate)),
      'check-sheet.html knows the fingerprint of game-template.html');

    var items = result.results.length;
    var sheetItems = sheetResult.results.length;
    out.push('');
    out.push(failures === 0
      ? 'RESULT: PASS. All ' + items + ' pieces of text in the game (and ' + sheetItems + ' left-out requirements on the check sheet) were found in the lines they cite.'
      : 'RESULT: FAIL. ' + failures + ' problem(s). Do not hand over the game: fix map.txt and run Fill again.');
    var report = out.join('\n') + '\n';
    fs.writeFileSync(path.join(dir, 'check-result.txt'), report);
    process.stdout.write(report);
    process.exit(failures === 0 ? 0 : 1);
  })();
}
