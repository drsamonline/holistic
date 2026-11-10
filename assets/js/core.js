/* ============================================================
   Holistic — core logic
   Pure functions only. No DOM. Importable in Node for tests.
   ============================================================ */
(function (root) {
  'use strict';

  var DAY_MS = 86400000;
  var SYNODIC = 29.530588853;
  /* Real new moon: 2000-01-06 18:14 UTC */
  var EPOCH_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

  /* ---------- numbers ---------- */

  function sumDigits(n) {
    return String(n).split('').reduce(function (a, b) { return a + Number(b); }, 0);
  }

  /* Keeps 11 and 22 as master numbers. 33 is treated as 6 by design. */
  function reducePower(n) {
    n = Math.abs(Math.round(n));
    while (n > 9 && n !== 11 && n !== 22) n = sumDigits(n);
    return n;
  }

  function reduceSingle(n) {
    n = Math.abs(Math.round(n));
    while (n > 9) n = sumDigits(n);
    return n;
  }

  /* Collapses master numbers for comparison purposes. */
  function baseDigit(n) {
    return n === 11 ? 2 : n === 22 ? 4 : n;
  }

  /* ---------- dates ---------- */

  /* Strict YYYY-MM-DD -> UTC ms, or null. Rejects 2023-02-30. */
  function parseDate(str) {
    if (!str) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str).trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    if (y < 1900 || y > 2200) return null;
    var ms = Date.UTC(y, mo - 1, d);
    var dt = new Date(ms);
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return ms;
  }

  /* Local midnight of a Date, as ms. Used so "today" means the user's today. */
  function localMidnight(date) {
    var d = date || new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  function toISO(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + '-' +
      String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
      String(d.getUTCDate()).padStart(2, '0');
  }

  function daysBetween(fromMs, toMs) {
    return Math.floor((toMs - fromMs) / DAY_MS);
  }

  /* ---------- numerology ---------- */

  function powerNumber(dob) {
    var ms = parseDate(dob);
    if (ms === null) return null;
    var d = new Date(ms);
    return reducePower(d.getUTCDate() + (d.getUTCMonth() + 1) + d.getUTCFullYear());
  }

  /* Personal year = birth day + birth month + target year, reduced. */
  function personalYear(dob, year) {
    var ms = parseDate(dob);
    if (ms === null) return null;
    var d = new Date(ms);
    var y = year || new Date().getFullYear();
    return reducePower(d.getUTCDate() + (d.getUTCMonth() + 1) + y);
  }

  /* Pythagorean letter values: A=1..I=9, J=1..R=9, S=1..Z=8. */
  var LETTER = (function () {
    var t = {}, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 26; i++) t[alphabet[i]] = (i % 9) + 1;
    return t;
  })();

  function nameNumber(name) {
    if (!name) return null;
    var letters = String(name).toUpperCase().replace(/[^A-Z]/g, '');
    if (!letters) return null;
    var total = 0;
    for (var i = 0; i < letters.length; i++) total += LETTER[letters[i]];
    return reducePower(total);
  }

  function vowelsOf(name) {
    var letters = String(name || '').toUpperCase().replace(/[^A-Z]/g, '');
    var total = 0;
    for (var i = 0; i < letters.length; i++) {
      if ('AEIOU'.indexOf(letters[i]) > -1) total += LETTER[letters[i]];
    }
    return total ? reducePower(total) : null;
  }

  /* Universal day number for a given date. */
  function dayNumber(date) {
    var d = date || new Date();
    return reducePower(d.getDate() + (d.getMonth() + 1) + d.getFullYear());
  }

  /* Days in a month whose digit sum lands on the same digit as the power number. */
  function luckyDates(dob, year, month) {
    var p = powerNumber(dob);
    if (p === null) return [];
    var y = year || new Date().getFullYear();
    var m = (month === undefined) ? new Date().getMonth() : month; /* 0-based */
    var last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    var target = reduceSingle(p);
    var out = [];
    for (var d = 1; d <= last; d++) {
      if (reduceSingle(d) === target) out.push(d);
    }
    return out;
  }

  /* ---------- astrology ---------- */

  function zodiac(dob) {
    var ms = parseDate(dob);
    if (ms === null) return null;
    var d = new Date(ms);
    var month = d.getUTCMonth() + 1, day = d.getUTCDate();
    var signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
                 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
    var cutoffs = [20, 19, 21, 20, 21, 21, 21, 23, 23, 23, 22, 22];
    return day < cutoffs[month - 1] ? signs[month - 1] : signs[month % 12];
  }

  /* ---------- moon ---------- */

  function phasePosition(date) {
    var t = (date || new Date()).getTime();
    var days = (t - EPOCH_NEW_MOON) / DAY_MS;
    return ((days % SYNODIC) + SYNODIC) % SYNODIC;
  }

  function moonPhase(date) {
    var p = phasePosition(date);
    var step = SYNODIC / 8;
    var index = Math.floor(p / step) % 8;
    var illumination = (1 - Math.cos(2 * Math.PI * p / SYNODIC)) / 2;
    return {
      index: index,
      position: p,
      fraction: p / SYNODIC,
      illumination: illumination,
      age: p
    };
  }

  /* Days until the next occurrence of a phase index (0 = new, 4 = full). */
  function daysToPhase(date, targetIndex) {
    var p = phasePosition(date);
    var step = SYNODIC / 8;
    var target = (targetIndex * step) % SYNODIC;
    var delta = (target - p + SYNODIC) % SYNODIC;
    return delta;
  }

  function nextPhaseDate(date, targetIndex) {
    var base = localMidnight(date);
    return base + Math.round(daysToPhase(date, targetIndex) * DAY_MS);
  }

  /* ---------- biorhythm ---------- */

  function biorhythm(dob, cycle, date) {
    var birth = parseDate(dob);
    if (birth === null) return null;
    var today = localMidnight(date);
    var days = daysBetween(birth, today);
    if (days < 0) return null;
    return Math.round(50 + 50 * Math.sin((days % cycle) / cycle * 2 * Math.PI));
  }

  /* Returns {labels:[ms], series:{physical:[],emotional:[],intellectual:[]}} */
  function biorhythmSeries(dob, span, date) {
    var birth = parseDate(dob);
    if (birth === null) return null;
    var spanDays = span || 30;
    var today = localMidnight(date);
    var out = { labels: [], series: { physical: [], emotional: [], intellectual: [] } };
    var cycles = { physical: 23, emotional: 28, intellectual: 33 };
    for (var i = 0; i < spanDays; i++) {
      var dayMs = today + i * DAY_MS;
      var days = daysBetween(birth, dayMs);
      out.labels.push(dayMs);
      ['physical', 'emotional', 'intellectual'].forEach(function (k) {
        out.series[k].push(days < 0 ? 50 : Math.round(50 + 50 * Math.sin((days % cycles[k]) / cycles[k] * 2 * Math.PI)));
      });
    }
    return out;
  }

  function biorhythmLabel(kind, value) {
    if (value === null) return '—';
    if (value >= 75) return 'High';
    if (value >= 55) return 'Good';
    if (value >= 45) return 'Neutral';
    if (value >= 25) return 'Low';
    return 'Critical';
  }

  /* ---------- couple ---------- */

  function coupleScore(dobA, dobB) {
    var n1 = powerNumber(dobA), n2 = powerNumber(dobB);
    if (n1 === null || n2 === null) return null;
    var z1 = zodiac(dobA), z2 = zodiac(dobB);
    var D = root.HL_DATA;
    var e1 = D.ZODIAC[z1].element, e2 = D.ZODIAC[z2].element;

    var gap = Math.abs(baseDigit(n1) - baseDigit(n2));
    var numCompat = Math.max(30, 100 - gap * 7);

    var zCompat = 62;
    var relation;
    if (e1 === e2) { zCompat = 94; relation = 'same element — immediate recognition, same blind spots'; }
    else if ((e1 === 'Fire' && e2 === 'Air') || (e1 === 'Air' && e2 === 'Fire')) {
      zCompat = 88; relation = 'fire and air — air feeds fire, neither smothers';
    } else if ((e1 === 'Earth' && e2 === 'Water') || (e1 === 'Water' && e2 === 'Earth')) {
      zCompat = 86; relation = 'earth and water — water softens, earth holds';
    } else if ((e1 === 'Fire' && e2 === 'Water') || (e1 === 'Water' && e2 === 'Fire')) {
      zCompat = 55; relation = 'fire and water — high heat, needs deliberate pacing';
    } else if ((e1 === 'Earth' && e2 === 'Air') || (e1 === 'Air' && e2 === 'Earth')) {
      zCompat = 58; relation = 'earth and air — different speeds, translate often';
    } else if ((e1 === 'Fire' && e2 === 'Earth') || (e1 === 'Earth' && e2 === 'Fire')) {
      zCompat = 60; relation = 'fire and earth — one builds, one burns; agree the pace';
    } else {
      zCompat = 62; relation = 'air and water — talk and feel arrive by different routes';
    }

    var score = Math.round(numCompat * 0.4 + zCompat * 0.6);
    return {
      n1: n1, n2: n2, z1: z1, z2: z2, e1: e1, e2: e2,
      numCompat: numCompat, zCompat: zCompat, score: score, relation: relation
    };
  }

  function coupleVerdict(score) {
    if (score >= 85) return { label: 'Easy fit', note: 'Little translation needed. The risk is complacency, not friction.' };
    if (score >= 72) return { label: 'Strong', note: 'Works with normal effort. Differences are complementary, not corrosive.' };
    if (score >= 58) return { label: 'Workable', note: 'Needs explicit agreements. Most of the friction is speed, not values.' };
    if (score >= 45) return { label: 'Effortful', note: 'Different defaults. Name the difference early or it becomes resentment.' };
    return { label: 'Hard', note: 'High translation cost. Only worth it if both people want it equally.' };
  }

  /* ---------- oracle ---------- */

  function pick(list, rand) {
    var r = rand === undefined ? Math.random() : rand;
    return list[Math.floor(r * list.length) % list.length];
  }

  /* Deterministic pick from a seed string, so a given question is stable. */
  function seededPick(list, seed) {
    var h = 2166136261;
    var s = String(seed || '');
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    var idx = Math.abs(h) % list.length;
    return { item: list[idx], index: idx };
  }

  root.HL_CORE = {
    DAY_MS: DAY_MS, SYNODIC: SYNODIC,
    sumDigits: sumDigits, reducePower: reducePower, reduceSingle: reduceSingle, baseDigit: baseDigit,
    parseDate: parseDate, localMidnight: localMidnight, toISO: toISO, daysBetween: daysBetween,
    powerNumber: powerNumber, personalYear: personalYear, nameNumber: nameNumber,
    vowelsOf: vowelsOf, dayNumber: dayNumber, luckyDates: luckyDates,
    zodiac: zodiac,
    phasePosition: phasePosition, moonPhase: moonPhase, daysToPhase: daysToPhase, nextPhaseDate: nextPhaseDate,
    biorhythm: biorhythm, biorhythmSeries: biorhythmSeries, biorhythmLabel: biorhythmLabel,
    coupleScore: coupleScore, coupleVerdict: coupleVerdict,
    pick: pick, seededPick: seededPick
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
