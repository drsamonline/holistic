/* ============================================================
   Holistic — text exports
   Markdown and RTF. Both are plain text: no library, no server,
   no binary format to get wrong. RTF opens in Word, Pages,
   LibreOffice and Google Docs; Markdown opens anywhere.
   ============================================================ */
(function (root) {
  'use strict';

  var C = root.HL_CORE;
  var D = root.HL_DATA;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function stamp(date) {
    var d = date || new Date();
    return d.getDate() + ' ' + D.MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* Everything the export needs, computed once. */
  function collect(profile, draw, date) {
    var now = date || new Date();
    var p = profile || {};
    var power = p.birthDate ? C.powerNumber(p.birthDate) : null;
    if (power === null) return null;

    var info = D.NUMEROLOGY[power];
    var zodiac = C.zodiac(p.birthDate);
    var ms = C.moonSign(p.birthDate, p.birthTime, parseInt(p.tzOffset, 10));
    var mp = C.moonPhase(now);
    var py = C.personalYear(p.birthDate, now.getFullYear());
    var nn = C.nameNumber(p.fullName);
    var sn = C.vowelsOf(p.fullName);

    return {
      name: p.fullName || 'Unnamed',
      birthDate: p.birthDate,
      birthTime: p.birthTime || '',
      birthLocation: p.birthLocation || '',
      generated: stamp(now),
      power: power,
      powerName: info.name,
      trait: info.trait,
      strengths: info.strengths,
      watch: info.watch,
      personalYear: py,
      personalYearName: D.NUMEROLOGY[py] ? D.NUMEROLOGY[py].name : '',
      nameNumber: nn,
      soulUrge: sn,
      lucky: C.luckyDates(p.birthDate, now.getFullYear(), now.getMonth()),
      monthName: D.MONTHS[now.getMonth()],
      zodiac: zodiac,
      zodiacInfo: D.ZODIAC[zodiac],
      moonSign: ms ? ms.sign : null,
      moonDegree: ms ? Math.floor(ms.degree) : null,
      moonAssumedNoon: ms ? ms.assumedNoon : false,
      phase: D.MOON_PHASES[mp.index],
      illumination: Math.round(mp.illumination * 100),
      nextFull: C.nextPhaseDate(now, 4),
      physical: C.biorhythm(p.birthDate, 23, now),
      emotional: C.biorhythm(p.birthDate, 28, now),
      intellectual: C.biorhythm(p.birthDate, 33, now),
      question: p.userQuestion || '',
      draw: draw || null
    };
  }

  function drawLines(draw) {
    if (!draw) return [];
    if (draw.cards && draw.cards.length) {
      return draw.cards.map(function (c) { return [c.pos + ': ' + c.name, c.reading]; });
    }
    return [[draw.title || draw.type || 'Draw', draw.body || '']];
  }

  /* ---------- Markdown ---------- */

  function markdown(profile, draw, date) {
    var m = collect(profile, draw, date);
    if (!m) return '';

    var out = [];
    out.push('# Holistic reading — ' + m.name);
    out.push('');
    out.push('Born ' + m.birthDate +
      (m.birthTime ? ' at ' + m.birthTime : '') +
      (m.birthLocation ? ', ' + m.birthLocation : '') +
      '  ');
    out.push('Generated ' + m.generated);
    out.push('');
    out.push('## Numbers');
    out.push('');
    out.push('- **Power number** — #' + m.power + ' · ' + m.powerName);
    out.push('- **Trait** — ' + m.trait);
    out.push('- **Strengths** — ' + m.strengths);
    out.push('- **Watch for** — ' + m.watch);
    out.push('- **Personal year** — ' + m.personalYear + (m.personalYearName ? ' · ' + m.personalYearName : ''));
    if (m.nameNumber !== null) out.push('- **Name number** — #' + m.nameNumber);
    if (m.soulUrge !== null) out.push('- **Soul urge** — #' + m.soulUrge);
    if (m.lucky.length) out.push('- **Personal days in ' + m.monthName + '** — ' + m.lucky.join(', '));
    out.push('');

    out.push('## Sky');
    out.push('');
    out.push('- **Sun sign** — ' + m.zodiac + ' (' + m.zodiacInfo.element + ', ' + m.zodiacInfo.modality + ')');
    if (m.moonSign) {
      out.push('- **Moon sign** — ' + m.moonSign +
        (m.moonDegree !== null ? ' at ' + m.moonDegree + '°' : '') +
        (m.moonAssumedNoon ? ' (assumed noon — no birth time given)' : ''));
    }
    out.push('- **Moon today** — ' + m.phase.name + ' · ' + m.illumination + '% lit');
    out.push('- **Next full moon** — ' + isoDay(m.nextFull));
    out.push('');

    out.push('## Cycles today');
    out.push('');
    out.push('- Physical ' + m.physical + '% · Emotional ' + m.emotional + '% · Intellectual ' + m.intellectual + '%');
    out.push('');

    if (m.question) {
      out.push('## Focus');
      out.push('');
      out.push('> ' + m.question);
      out.push('');
    }

    var dl = drawLines(m.draw);
    if (dl.length) {
      out.push('## Draw');
      out.push('');
      if (m.draw.type) out.push('*' + m.draw.type + '*');
      out.push('');
      dl.forEach(function (pair) {
        out.push('**' + pair[0] + '**  ');
        out.push(pair[1]);
        out.push('');
      });
      if (m.draw.second) {
        out.push('**' + m.draw.second.label + '**  ');
        out.push(m.draw.second.text);
        out.push('');
      }
    }

    out.push('---');
    out.push('');
    out.push('A reflective reading built from numerology, astrology, lunar phase and biorhythm. ' +
      'Not a diagnosis, not a prescription, not a prediction. Generated offline by Holistic.');
    out.push('');
    return out.join('\n');
  }

  function isoDay(ms) {
    var d = new Date(ms);
    return d.getUTCDate() + ' ' + D.MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  /* ---------- RTF ---------- */

  /* RTF is 7-bit safe: escape the control characters, map typographic
     punctuation to ASCII, and turn anything else into a \uN? escape. */
  var ASCII_MAP = {
    '\u2014': '-', '\u2013': '-', '\u2018': "'", '\u2019': "'",
    '\u201c': '"', '\u201d': '"', '\u2026': '...', '\u00b7': '-',
    '\u00b0': ' deg', '\u00a0': ' '
  };

  function rtfEscape(str) {
    var s = String(str == null ? '' : str);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ASCII_MAP[ch] !== undefined) {
        out += ASCII_MAP[ch];
      } else if (ch === '\\' || ch === '{' || ch === '}') {
        out += '\\' + ch;
      } else if (ch.charCodeAt(0) < 128) {
        out += ch;
      } else {
        out += '\\u' + s.charCodeAt(i) + '?';
      }
    }
    return out;
  }

  function rtf(profile, draw, date) {
    var m = collect(profile, draw, date);
    if (!m) return '';

    var b = [];
    function line(text, opts) {
      opts = opts || {};
      var fs = opts.size || 22;
      b.push('\\pard\\sa' + (opts.space === undefined ? 120 : opts.space) +
        '\\sb0\\fs' + fs + (opts.bold ? '\\b' : '\\b0') +
        (opts.italic ? '\\i' : '\\i0') + ' ' + rtfEscape(text) + '\\par');
    }

    line('Holistic reading', { size: 44, bold: true, space: 60 });
    line(m.name + '  |  born ' + m.birthDate +
      (m.birthTime ? ' at ' + m.birthTime : '') +
      (m.birthLocation ? ', ' + m.birthLocation : ''), { size: 20 });
    line('Generated ' + m.generated, { size: 18, space: 260 });

    line('Numbers', { size: 30, bold: true, space: 80 });
    line('Power number: #' + m.power + ' - ' + m.powerName);
    line('Trait: ' + m.trait);
    line('Strengths: ' + m.strengths);
    line('Watch for: ' + m.watch);
    line('Personal year: ' + m.personalYear + (m.personalYearName ? ' - ' + m.personalYearName : ''));
    if (m.nameNumber !== null) line('Name number: #' + m.nameNumber);
    if (m.soulUrge !== null) line('Soul urge: #' + m.soulUrge);
    if (m.lucky.length) line('Personal days in ' + m.monthName + ': ' + m.lucky.join(', '), { space: 260 });

    line('Sky', { size: 30, bold: true, space: 80 });
    line('Sun sign: ' + m.zodiac + ' (' + m.zodiacInfo.element + ', ' + m.zodiacInfo.modality + ')');
    if (m.moonSign) {
      line('Moon sign: ' + m.moonSign +
        (m.moonDegree !== null ? ' at ' + m.moonDegree + ' deg' : '') +
        (m.moonAssumedNoon ? ' (assumed noon - no birth time given)' : ''));
    }
    line('Moon today: ' + m.phase.name + ' - ' + m.illumination + '% lit');
    line('Next full moon: ' + isoDay(m.nextFull), { space: 260 });

    line('Cycles today', { size: 30, bold: true, space: 80 });
    line('Physical ' + m.physical + '%  |  Emotional ' + m.emotional + '%  |  Intellectual ' + m.intellectual + '%',
      { space: 260 });

    if (m.question) {
      line('Focus', { size: 30, bold: true, space: 80 });
      line(m.question, { italic: true, space: 260 });
    }

    var dl = drawLines(m.draw);
    if (dl.length) {
      line('Draw', { size: 30, bold: true, space: 80 });
      if (m.draw.type) line(m.draw.type, { italic: true, size: 20 });
      dl.forEach(function (pair) {
        line(pair[0], { bold: true });
        line(pair[1]);
      });
      if (m.draw.second) {
        line(m.draw.second.label, { bold: true });
        line(m.draw.second.text);
      }
      b.push('\\pard\\sa260\\fs22 \\par');
    }

    line('A reflective reading built from numerology, astrology, lunar phase and biorhythm. ' +
      'Not a diagnosis, not a prescription, not a prediction. Generated offline by Holistic.',
      { size: 17, italic: true });

    return '{\\rtf1\\ansi\\ansicpg1252\\deff0' +
      '{\\fonttbl{\\f0\\froman\\fcharset0 Georgia;}{\\f1\\fswiss\\fcharset0 Helvetica;}}' +
      '\\f1\\fs22 ' + b.join('\n') + '}';
  }

  /* ---------- download ---------- */

  function download(text, filename, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  root.HL_EXPORT = {
    collect: collect,
    markdown: markdown,
    rtf: rtf,
    rtfEscape: rtfEscape,
    download: download,
    pad: pad
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
