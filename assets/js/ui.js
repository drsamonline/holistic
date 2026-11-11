/* ============================================================
   Holistic — rendering
   Builds every screen from state. No event handling here.
   ============================================================ */
(function (root) {
  'use strict';

  var C = root.HL_CORE;
  var D = root.HL_DATA;

  /* ---------- dom helpers ---------- */

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return v == null ? '' : String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setText(id, v) { var el = $(id); if (el) el.textContent = v == null ? '' : v; }
  function setHTML(id, v) { var el = $(id); if (el) el.innerHTML = v == null ? '' : v; }
  function show(id, on) { var el = $(id); if (el) el.hidden = !on; }

  function fmtDate(ms) {
    var d = new Date(ms);
    return D.WEEKDAYS[d.getUTCDay()].slice(0, 3) + ' ' + d.getUTCDate() + ' ' +
      D.MONTHS[d.getUTCMonth()].slice(0, 3);
  }

  function relDays(days) {
    var n = Math.round(days);
    if (n <= 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n < 7) return 'in ' + n + ' days';
    return 'in ' + n + ' days';
  }

  /* ---------- visual: moon disc ---------- */

  function moonDiscSVG(phase) {
    var f = phase.fraction;               /* 0..1 through the cycle */
    var lit = phase.illumination;         /* 0..1 lit area */
    var r = 44, cx = 50, cy = 50;
    var rx = Math.max(0.6, r * Math.abs(1 - 2 * lit));
    var waxing = f < 0.5;
    var innerSweep = lit < 0.5 ? 0 : 1;
    var d = 'M' + cx + ',' + (cy - r) +
            ' A' + r + ',' + r + ' 0 0,1 ' + cx + ',' + (cy + r) +
            ' A' + rx + ',' + r + ' 0 0,' + innerSweep + ' ' + cx + ',' + (cy - r) + ' Z';

    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="moonGlow"><stop offset="0%" stop-color="#a78bfa" stop-opacity=".42"/>' +
        '<stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="48" fill="url(#moonGlow)"/>' +
      '<circle cx="50" cy="50" r="' + r + '" fill="#243149" stroke="rgba(255,255,255,.16)" stroke-width="1"/>' +
      '<g' + (waxing ? '' : ' transform="translate(100,0) scale(-1,1)"') + '>' +
        '<path d="' + d + '" fill="#eef2fb"/>' +
      '</g>' +
      '</svg>';
  }

  /* ---------- visual: gauge ---------- */

  function setGauge(id, value, max, colour) {
    var el = $(id);
    if (!el) return;
    var C2 = 2 * Math.PI * 50;
    var pct = Math.max(0, Math.min(1, value / max));
    el.style.strokeDasharray = C2;
    el.style.strokeDashoffset = C2 * (1 - pct);
    if (colour) el.setAttribute('stroke', colour);
  }

  /* ---------- visual: biorhythm chart ---------- */

  function drawChart(svg, series, span) {
    if (!svg) return;
    var W = 600, H = 210, padT = 10, padB = 50;
    var keys = ['physical', 'emotional', 'intellectual'];
    var n = series.series.physical.length;
    var inner = H - padT - padB;

    var out = '';
    /* grid lines at 0 / 50 / 100 */
    [0, 50, 100].forEach(function (v) {
      var y = padT + inner * (1 - v / 100);
      out += '<line x1="0" y1="' + y.toFixed(1) + '" x2="' + W + '" y2="' + y.toFixed(1) +
        '" stroke="rgba(255,255,255,' + (v === 50 ? '.13' : '.06') + ')" stroke-width="1"' +
        (v === 50 ? ' stroke-dasharray="4 5"' : '') + '/>';
    });

    keys.forEach(function (k) {
      var pts = series.series[k].map(function (v, i) {
        var x = n === 1 ? 0 : (i / (n - 1)) * W;
        var y = padT + inner * (1 - v / 100);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      out += '<polyline points="' + pts + '" fill="none" stroke="' + D.BIORHYTHM[k].colour +
        '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity=".92"/>';
    });

    /* today marker, clipped to the plot area */
    out += '<line x1="1.5" y1="' + padT + '" x2="1.5" y2="' + (padT + inner) +
      '" stroke="rgba(255,255,255,.28)" stroke-width="1.5" stroke-dasharray="3 4"/>';
    /* month labels */
    var labelEvery = span > 30 ? 30 : span > 7 ? 7 : 1;
    for (var i = 0; i < n; i += labelEvery) {
      var x = n === 1 ? 0 : (i / (n - 1)) * W;
      var txt = fmtDate(series.labels[i]);
      out += '<text x="' + Math.min(W - 30, Math.max(4, x)).toFixed(1) + '" y="' + (H - 22) +
        '" fill="rgba(255,255,255,.38)" font-size="10" font-family="monospace">' + esc(txt) + '</text>';
    }

    svg.innerHTML = out;
  }

  /* ---------- screen: today ---------- */

  function renderToday(profile, now) {
    var has = !!(profile && profile.birthDate && C.powerNumber(profile.birthDate) !== null);
    show('todayEmpty', !has);
    show('todayBody', has);

    var d = now || new Date();
    setText('todayDate', D.WEEKDAYS[d.getDay()] + ' · ' + d.getDate() + ' ' +
      D.MONTHS[d.getMonth()] + ' ' + d.getFullYear());

    if (!has) {
      setText('h-today', 'Today');
      setText('todayLede', 'Set your birth date once and this screen fills in every day.');
      return;
    }

    var firstName = String(profile.fullName || '').trim().split(/\s+/)[0];
    var hour = d.getHours();
    var greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    setText('h-today', firstName ? greet + ', ' + firstName : greet);
    setText('todayLede', 'Your cycles for today, in one screen.');

    var mp = C.moonPhase(d);
    var phase = D.MOON_PHASES[mp.index];
    setHTML('todayMoonDisc', moonDiscSVG(mp));
    setText('todayMoonName', phase.name + ' · ' + Math.round(mp.illumination * 100) + '% lit');
    setText('todayMoonNote', phase.note);

    var dn = C.dayNumber(d);
    setText('todayDayNum', dn);
    setText('todayDayNote', 'Universal day ' + dn + ' — ' + (D.NUMEROLOGY[dn] ? D.NUMEROLOGY[dn].trait.split(',')[0].toLowerCase() : 'steady pace'));

    ['physical', 'emotional', 'intellectual'].forEach(function (k) {
      var v = C.biorhythm(profile.birthDate, D.BIORHYTHM[k].cycle, d);
      var val = v === null ? 0 : v;
      var bar = $('bio' + k.charAt(0).toUpperCase() + k.slice(1) + 'Bar');
      var num = $('bio' + k.charAt(0).toUpperCase() + k.slice(1) + 'Val');
      if (bar) bar.style.width = val + '%';
      if (num) num.textContent = v === null ? '—' : v + '%';
    });

    var phy = C.biorhythm(profile.birthDate, 23, d) || 0;
    var emo = C.biorhythm(profile.birthDate, 28, d) || 0;
    var int = C.biorhythm(profile.birthDate, 33, d) || 0;
    var lowKey = phy < 50 ? 'physical' : emo < 50 ? 'emotional' : int < 50 ? 'intellectual' : null;
    setText('bioAdvice', lowKey
      ? D.BIORHYTHM[lowKey].low + '.'
      : D.BIORHYTHM.physical.high + '.');

    /* coming up */
    var rows = [
      { i: 4, label: 'Full moon' },
      { i: 0, label: 'New moon' }
    ].map(function (x) {
      var days = C.daysToPhase(d, x.i);
      var when = C.nextPhaseDate(d, x.i);
      return '<div class="kv-row"><span class="kv-key">' + x.label + '</span>' +
        '<span class="kv-val">' + esc(fmtDate(when)) + ' <span class="sub">· ' + relDays(days) + '</span></span></div>';
    }).join('');
    setHTML('todayPhases', rows);

    var p = C.powerNumber(profile.birthDate);
    var info = D.NUMEROLOGY[p];
    setText('todayPowerChip', '#' + p + ' · ' + info.name);
    setText('todayPowerNote', 'Power number ' + p + ' — ' + info.trait.toLowerCase() +
      '. Personal year ' + C.personalYear(profile.birthDate, d.getFullYear()) + '.');
  }

  /* ---------- screen: numbers ---------- */

  function renderNumbers(profile, now) {
    var has = !!(profile && profile.birthDate && C.powerNumber(profile.birthDate) !== null);
    show('numbersEmpty', !has);
    show('numbersBody', has);
    if (!has) return;

    var p = C.powerNumber(profile.birthDate);
    var info = D.NUMEROLOGY[p];
    setText('powerNum', p);
    setGauge('powerArc', p, 22, info.colour);
    setText('powerName', info.name);
    setText('powerElement', info.element);
    setText('powerTrait', info.trait + '.');
    setText('powerStrengths', info.strengths + '.');
    setText('powerWatch', info.watch + '.');

    var d = now || new Date();
    var py = C.personalYear(profile.birthDate, d.getFullYear());
    setText('personalYear', py);
    setText('personalYearNote', D.NUMEROLOGY[py] ? 'A ' + D.NUMEROLOGY[py].name.toLowerCase() + ' year — ' + D.NUMEROLOGY[py].trait.split(',')[0].toLowerCase() : '');

    var nn = C.nameNumber(profile.fullName);
    setText('nameNumber', nn === null ? '—' : nn);
    setText('nameNumberNote', nn === null ? 'Add your full name' :
      (D.NUMEROLOGY[nn] ? D.NUMEROLOGY[nn].name + ' — how you come across' : ''));

    var sn = C.vowelsOf(profile.fullName);
    setText('soulNumber', sn === null ? '—' : sn);
    setText('soulNumberNote', sn === null ? 'Add your full name' : 'The vowel sum — what you actually want');

    var dates = C.luckyDates(profile.birthDate, d.getFullYear(), d.getMonth());
    setText('luckyMonth', D.MONTHS[d.getMonth()] + ' ' + d.getFullYear());
    setHTML('luckyDates', dates.length
      ? dates.map(function (x) { return '<span class="chip chip--violet">' + x + '</span>'; }).join('')
      : '<span class="sub">None this month.</span>');
  }

  /* ---------- screen: sky ---------- */

  var lastSpan = 30;

  function renderSky(profile, now, span) {
    var has = !!(profile && profile.birthDate && C.powerNumber(profile.birthDate) !== null);
    show('skyEmpty', !has);
    show('skyBody', has);
    if (!has) return;

    var z = C.zodiac(profile.birthDate);
    var zi = D.ZODIAC[z];
    setText('zodiacGlyph', zi.symbol);
    setText('zodiacName', z);
    setText('zodiacElement', zi.element);
    setText('zodiacModality', zi.modality);
    setText('zodiacTrait', zi.trait + '.');
    setText('zodiacDates', zi.dates);
    setText('zodiacElementNote', 'Leans on ' + (D.ELEMENT_NOTE[zi.element] || zi.element) + '.');

    var d = now || new Date();
    var useSpan = span || lastSpan;
    lastSpan = useSpan;
    var series = C.biorhythmSeries(profile.birthDate, useSpan, d);
    if (series) drawChart($('bioChart'), series, useSpan);

    var rows = [
      { i: 0, label: 'New moon' },
      { i: 2, label: 'First quarter' },
      { i: 4, label: 'Full moon' },
      { i: 6, label: 'Last quarter' }
    ].map(function (x) {
      var days = C.daysToPhase(d, x.i);
      var when = C.nextPhaseDate(d, x.i);
      return '<div class="kv-row"><span class="kv-key">' + x.label + '</span>' +
        '<span class="kv-val">' + esc(fmtDate(when)) + ' <span class="sub">· ' + relDays(days) + '</span></span></div>';
    }).join('');
    setHTML('skyPhases', rows);
  }

  /* ---------- screen: couple ---------- */

  function renderCouple(result) {
    var out = $('coupleOut');
    if (!out) return;
    if (!result) { out.hidden = true; return; }
    out.hidden = false;

    setText('coupleScore', result.score + '%');
    setGauge('coupleArc', result.score, 100, result.score >= 72 ? '#14b8a6' : result.score >= 58 ? '#f59e0b' : '#f43f5e');

    var v = C.coupleVerdict(result.score);
    setText('coupleVerdict', v.label);
    setText('coupleVerdictNote', v.note);

    setHTML('coupleBreakdown',
      row('Your number', '#' + result.n1 + ' · ' + D.NUMEROLOGY[result.n1].name) +
      row('Their number', '#' + result.n2 + ' · ' + D.NUMEROLOGY[result.n2].name) +
      row('Your sign', result.z1 + ' · ' + result.e1) +
      row('Their sign', result.z2 + ' · ' + result.e2) +
      row('Number match', result.numCompat + '%') +
      row('Element match', result.zCompat + '%'));

    setText('coupleRelation', 'Your elements ' + result.relation + '.');

    var gap = Math.abs(C.baseDigit(result.n1) - C.baseDigit(result.n2));
    setHTML('coupleChips',
      '<span class="chip chip--violet">' + (gap <= 1 ? 'Similar pacing' : gap <= 3 ? 'Complementary pacing' : 'Different pacing') + '</span>' +
      '<span class="chip chip--teal">' + (result.e1 === result.e2 ? 'Same element' : 'Mixed elements') + '</span>' +
      '<span class="chip">' + D.MONTHS[new Date().getMonth()] + ' reading</span>');

    function row(k, val) {
      return '<div class="kv-row"><span class="kv-key">' + esc(k) + '</span><span class="kv-val">' + esc(val) + '</span></div>';
    }
  }

  /* ---------- screen: oracle ---------- */

  /* Six lines, top to bottom, drawn from a bottom-to-top bit string. */
  function hexGlyph(bits, changedBits) {
    var rows = '';
    for (var i = 5; i >= 0; i--) {
      var yang = bits.charAt(i) === '1';
      var ch = changedBits && changedBits.charAt(i) !== bits.charAt(i);
      rows += '<i class="' + (yang ? 'yang' : 'yin') + (ch ? ' ch' : '') + '"></i>';
    }
    return '<span class="hex" aria-hidden="true">' + rows + '</span>';
  }

  function renderOracle(o) {
    var out = $('oracleOut');
    if (!out) return;
    if (!o) { out.hidden = true; out.innerHTML = ''; return; }
    out.hidden = false;
    out.innerHTML =
      '<div class="oracle-out">' +
        '<div class="oracle-type">' + esc(o.type) + '</div>' +
        (o.glyph ? '<div class="draw-visual">' + o.glyph + '</div>' : '') +
        '<div class="oracle-card">' + esc(o.title) + '</div>' +
        (o.sub ? '<div class="sub" style="margin:-4px 0 10px">' + esc(o.sub) + '</div>' : '') +
        '<div class="oracle-body">' + esc(o.body) + '</div>' +
        (o.second ? '<div class="oracle-second"><span class="lbl">' + esc(o.second.label) +
          '</span><p>' + esc(o.second.text) + '</p></div>' : '') +
        (o.footnote ? '<div class="sub" style="margin-top:14px">' + esc(o.footnote) + '</div>' : '') +
      '</div>';
  }

  /* ---------- screen: library ---------- */

  function renderLibrary(kind, query) {
    var host = $('libList');
    if (!host) return;
    var q = String(query || '').trim().toLowerCase();
    var rows = [];

    if (kind === 'iching') {
      rows = D.HEXAGRAMS.filter(function (h) {
        return !q || (h.name + ' ' + h.cn + ' ' + h.reading + ' ' + h.n).toLowerCase().indexOf(q) > -1;
      }).map(function (h) {
        return '<div class="lib-row">' + hexGlyph(h.bits) +
          '<div><div class="lib-name"><span class="lib-n">' + h.n + '</span>' + esc(h.name) +
          '</div>' +
          '<div class="lib-body">' + esc(h.reading) + '</div></div></div>';
      });
    } else if (kind === 'runes') {
      rows = D.RUNES.filter(function (r) {
        return !q || (r.name + ' ' + r.gloss + ' ' + r.upright + ' ' + r.reversed).toLowerCase().indexOf(q) > -1;
      }).map(function (r) {
        return '<div class="lib-row"><span class="rune-glyph" aria-hidden="true">' + r.glyph + '</span>' +
          '<div><div class="lib-name">' + esc(r.name) + ' <span class="lib-cn">' + esc(r.gloss) + '</span></div>' +
          '<div class="lib-body">' + esc(r.upright) + '</div>' +
          '<div class="lib-body" style="color:var(--ink-4)">Reversed — ' + esc(r.reversed) + '</div></div></div>';
      });
    } else {
      rows = C.fullDeck().filter(function (c) {
        return !q || (c.name + ' ' + c.suit + ' ' + c.reading).toLowerCase().indexOf(q) > -1;
      }).map(function (c) {
        return '<div class="lib-row"><span class="suit-dot" data-suit="' + esc(c.suit) + '"></span>' +
          '<div><div class="lib-name">' + esc(c.name) + '</div>' +
          '<div class="lib-body">' + esc(c.reading) + '</div></div></div>';
      });
    }

    setText('libCount', rows.length + ' entries');
    host.innerHTML = rows.length ? rows.join('') : '<div class="empty">Nothing matches that.</div>';
  }

  /* ---------- screen: report ---------- */

  function renderReport(profile, now) {
    var host = $('reportBody');
    if (!host) return;
    var has = !!(profile && profile.birthDate && C.powerNumber(profile.birthDate) !== null);
    if (!has) {
      host.innerHTML = '<div class="empty"><span class="ico">▤</span>Complete your profile to generate a report.</div>';
      return;
    }

    var d = now || new Date();
    var p = C.powerNumber(profile.birthDate);
    var info = D.NUMEROLOGY[p];
    var z = C.zodiac(profile.birthDate);
    var zi = D.ZODIAC[z];
    var mp = C.moonPhase(d);
    var ph = D.MOON_PHASES[mp.index];
    var py = C.personalYear(profile.birthDate, d.getFullYear());
    var nn = C.nameNumber(profile.fullName);

    host.innerHTML =
      '<div class="card" style="margin-bottom:14px">' +
        '<h1 style="font-size:22px">Holistic reading</h1>' +
        '<p class="sub">' + esc(profile.fullName || 'Unnamed') + ' · born ' + esc(profile.birthDate) +
        (profile.birthTime ? ' at ' + esc(profile.birthTime) : '') +
        (profile.birthLocation ? ', ' + esc(profile.birthLocation) : '') + '</p>' +
        '<p class="sub" style="color:var(--ink-4);margin-top:4px">Generated ' +
        esc(d.getDate() + ' ' + D.MONTHS[d.getMonth()] + ' ' + d.getFullYear()) + '</p>' +
      '</div>' +

      '<div class="grid g-2" style="margin-bottom:14px">' +
        '<div class="card"><h3>Numerology</h3><div class="kv">' +
          kv('Power number', '#' + p + ' · ' + info.name) +
          kv('Trait', info.trait) +
          kv('Personal year', py + ' · ' + (D.NUMEROLOGY[py] ? D.NUMEROLOGY[py].name : '')) +
          kv('Name number', nn === null ? '—' : '#' + nn) +
        '</div></div>' +
        '<div class="card"><h3>Astrology</h3><div class="kv">' +
          kv('Sun sign', z + ' ' + zi.symbol) +
          kv('Element', zi.element) +
          kv('Modality', zi.modality) +
          kv('Trait', zi.trait) +
        '</div></div>' +
      '</div>' +

      '<div class="grid g-2" style="margin-bottom:14px">' +
        '<div class="card"><h3>Cycles today</h3><div class="kv">' +
          kv('Moon', ph.name + ' · ' + Math.round(mp.illumination * 100) + '% lit') +
          kv('Physical', C.biorhythm(profile.birthDate, 23, d) + '%') +
          kv('Emotional', C.biorhythm(profile.birthDate, 28, d) + '%') +
          kv('Intellectual', C.biorhythm(profile.birthDate, 33, d) + '%') +
        '</div></div>' +
        '<div class="card"><h3>Focus</h3><p class="sub" style="font-size:13px;color:var(--ink-2)">' +
          esc(profile.userQuestion || 'Not stated.') + '</p>' +
          '<h3 style="margin-top:16px">Next full moon</h3><p class="sub">' +
          esc(fmtDate(C.nextPhaseDate(d, 4))) + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="card"><p class="sub" style="font-size:12px;color:var(--ink-4)">' +
        'A reflective reading built from numerology, sun-sign astrology, lunar phase and biorhythm. ' +
        'Not a diagnosis, not a prescription, not a prediction. Generated locally — nothing was sent anywhere.' +
      '</p></div>';

    function kv(k, v) {
      return '<div class="kv-row"><span class="kv-key">' + esc(k) + '</span><span class="kv-val">' + esc(v) + '</span></div>';
    }
  }

  /* ---------- report as plain text ---------- */

  function reportText(profile, now) {
    if (!profile || C.powerNumber(profile.birthDate) === null) return '';
    var d = now || new Date();
    var p = C.powerNumber(profile.birthDate);
    var z = C.zodiac(profile.birthDate);
    var mp = C.moonPhase(d);
    return [
      'HOLISTIC READING',
      (profile.fullName || 'Unnamed') + ' · born ' + profile.birthDate,
      'Generated ' + d.getDate() + ' ' + D.MONTHS[d.getMonth()] + ' ' + d.getFullYear(),
      '',
      'Numerology',
      '  Power number  #' + p + ' · ' + D.NUMEROLOGY[p].name,
      '  Trait         ' + D.NUMEROLOGY[p].trait,
      '  Personal year ' + C.personalYear(profile.birthDate, d.getFullYear()),
      '  Name number   ' + (C.nameNumber(profile.fullName) || '—'),
      '',
      'Astrology',
      '  Sun sign      ' + z + ' · ' + D.ZODIAC[z].element,
      '',
      'Cycles today',
      '  Moon          ' + D.MOON_PHASES[mp.index].name + ' · ' + Math.round(mp.illumination * 100) + '% lit',
      '  Physical      ' + C.biorhythm(profile.birthDate, 23, d) + '%',
      '  Emotional     ' + C.biorhythm(profile.birthDate, 28, d) + '%',
      '  Intellectual  ' + C.biorhythm(profile.birthDate, 33, d) + '%',
      '',
      'Reflective reading only — not a diagnosis, prescription or prediction.'
    ].join('\n');
  }

  root.HL_UI = {
    $: $, esc: esc, setText: setText, setHTML: setHTML, show: show,
    moonDiscSVG: moonDiscSVG, setGauge: setGauge, drawChart: drawChart,
    renderToday: renderToday, renderNumbers: renderNumbers, renderSky: renderSky,
    renderCouple: renderCouple, renderOracle: renderOracle, renderReport: renderReport,
    renderLibrary: renderLibrary, hexGlyph: hexGlyph,
    reportText: reportText, fmtDate: fmtDate
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
