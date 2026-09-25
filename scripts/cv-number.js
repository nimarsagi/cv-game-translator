/* cv-number.js — step 1, Number.
 *
 * Splits a document into numbered lines without changing a character.
 * A new line starts at every line break in the document and at the end of
 * every sentence. Lines with no letter or digit (like "---") are skipped.
 * A line break followed by a lowercase letter doesn't count: it is a sentence
 * wrapped mid-way, as in text copied from a PDF, and the two parts stay one line.
 *
 *   node cv-number.js <run-folder>
 *     reads   life-document.txt|.md and job-post.txt|.md in the run folder
 *     writes  life-lines.txt (L1, L2 …) and job-lines.txt (J1, J2 …) next to them
 *
 * The same code runs in three places: here, inside cv-check.js, and inside
 * each check-sheet.html (the paste-in check), where cv-fill.js copies it every run.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CVNumber = api;
})(this, function () {
  'use strict';

  // Words that end in a period without ending a sentence (compared lowercase).
  var ABBREVIATIONS = ['e.g', 'i.e', 'etc', 'vs', 'cf', 'ca', 'approx', 'incl', 'dr', 'mr', 'mrs', 'ms',
    'prof', 'sr', 'jr', 'st', 'nr', 'inc', 'ltd', 'co', 'corp', 'dept', 'univ', 'fig', 'jan', 'feb',
    'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];

  // A sentence ends at . ! or ? (and any closing quote or bracket) when spaces
  // follow and the next character is not a lowercase letter.
  var SENTENCE_END = /[.!?]+["'”’)\]*_]*(?=\s+[^\s\p{Ll}])/gu;
  var HAS_WORD = /[\p{L}\p{N}]/u;

  function isAbbreviation(text, dotIndex) {
    var start = dotIndex;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    var token = text.slice(start, dotIndex).replace(/^[("'“‘\[]+/, '');
    if (!token) return false;
    if (token.length === 1 && /\p{L}/u.test(token)) return true;   // an initial: "J. Smith"
    if (token.indexOf('.') !== -1) return true;                     // "Ph.D", "U.S", "B.Sc"
    return ABBREVIATIONS.indexOf(token.toLowerCase()) !== -1;
  }

  function splitSentences(physicalLine) {
    var parts = [];
    var start = 0;
    var m;
    SENTENCE_END.lastIndex = 0;
    while ((m = SENTENCE_END.exec(physicalLine)) !== null) {
      var bare = m[0].replace(/["'”’)\]*_]+$/, '');
      if (bare === '.' && isAbbreviation(physicalLine, m.index)) continue;
      var end = m.index + m[0].length;
      parts.push(physicalLine.slice(start, end));
      start = end;
    }
    parts.push(physicalLine.slice(start));
    return parts.map(function (p) { return p.trim(); }).filter(function (p) { return HAS_WORD.test(p); });
  }

  // The text as read: byte-order mark dropped, line endings made one kind, and a
  // line break before a lowercase letter joined with a space (a wrapped sentence).
  function prepare(text) {
    return String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/[ \t]*\n[ \t]*(?=\p{Ll})/gu, ' ');
  }

  // The document as an array of line texts. Line 1 is index 0.
  function splitIntoLines(text) {
    var out = [];
    prepare(text).split('\n').forEach(function (physical) {
      splitSentences(physical).forEach(function (s) { out.push(s); });
    });
    return out;
  }

  // Proof that splitting changed no character: every line is found, in order,
  // and what lies between lines holds no letter or digit.
  function verifyLines(text, lines) {
    var src = prepare(text);
    var at = 0;
    for (var i = 0; i < lines.length; i++) {
      var found = src.indexOf(lines[i], at);
      if (found === -1) return 'line ' + (i + 1) + ' is not in the document as written';
      if (HAS_WORD.test(src.slice(at, found))) return 'text before line ' + (i + 1) + ' was skipped';
      at = found + lines[i].length;
    }
    if (HAS_WORD.test(src.slice(at))) return 'text after the last line was skipped';
    return null;
  }

  return { splitIntoLines: splitIntoLines, verifyLines: verifyLines };
});

// ---- command line (Node only) ----
if (typeof require === 'function' && typeof module === 'object' && require.main === module) {
  (function main() {
    var fs = require('fs');
    var path = require('path');
    var N = module.exports;
    var dir = process.argv[2];
    if (!dir) {
      console.error('Usage: node cv-number.js <run-folder>');
      process.exit(2);
    }
    function findInput(base) {
      var names = [base + '.txt', base + '.md', base + '.markdown'];
      for (var i = 0; i < names.length; i++) {
        if (fs.existsSync(path.join(dir, names[i]))) return names[i];
      }
      console.error('Missing input: put ' + base + '.txt or ' + base + '.md in ' + dir);
      process.exit(1);
    }
    var jobs = [['life-document', 'L', 'life-lines.txt'], ['job-post', 'J', 'job-lines.txt']];
    var report = [];
    jobs.forEach(function (j) {
      var file = findInput(j[0]);
      var text = fs.readFileSync(path.join(dir, file), 'utf8');
      var lines = N.splitIntoLines(text);
      var problem = N.verifyLines(text, lines);
      if (problem) {
        console.error('Number failed on ' + file + ': ' + problem);
        process.exit(1);
      }
      var body = '# ' + j[2] + ' - made by cv-number.js from ' + file + '. Do not edit: change ' + file +
        ' and run Number again.\n' +
        lines.map(function (l, i) { return j[1] + (i + 1) + '\t' + l; }).join('\n') + '\n';
      fs.writeFileSync(path.join(dir, j[2]), body);
      report.push(file + ' -> ' + j[2] + ' (' + j[1] + '1-' + j[1] + lines.length + ')');
    });
    console.log('Numbered, no character changed:\n  ' + report.join('\n  '));
  })();
}
