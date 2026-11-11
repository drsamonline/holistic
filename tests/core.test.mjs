/**
 * Core logic tests — run with:  node --test tests/
 * Pure functions only, no DOM.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const load = (rel) => new Function(fs.readFileSync(path.join(here, '..', rel), 'utf8'))();

load('assets/js/data.js');
load('assets/js/core.js');

const C = globalThis.HL_CORE;
const D = globalThis.HL_DATA;

/* ---------------- dates ---------------- */

test('parseDate accepts valid dates', () => {
  assert.equal(C.parseDate('1990-01-15'), Date.UTC(1990, 0, 15));
  assert.equal(C.parseDate('2024-02-29'), Date.UTC(2024, 1, 29));
});

test('parseDate rejects impossible and malformed dates', () => {
  assert.equal(C.parseDate('2023-02-30'), null);
  assert.equal(C.parseDate('2023-13-01'), null);
  assert.equal(C.parseDate('1990-1-5'), null);
  assert.equal(C.parseDate(''), null);
  assert.equal(C.parseDate(null), null);
  assert.equal(C.parseDate('1899-12-31'), null);
});

test('toISO round-trips', () => {
  assert.equal(C.toISO(C.parseDate('2001-09-09')), '2001-09-09');
});

/* ---------------- reduction ---------------- */

test('reducePower keeps 11 and 22', () => {
  assert.equal(C.reducePower(11), 11);
  assert.equal(C.reducePower(22), 22);
  assert.equal(C.reducePower(29), 11);
  assert.equal(C.reducePower(1993), 22);
  assert.equal(C.reducePower(38), 11);
});

test('reducePower collapses 33 to 6 by design', () => {
  assert.equal(C.reducePower(33), 6);
});

test('reduceSingle always lands 1-9', () => {
  for (let i = 1; i < 500; i++) {
    const v = C.reduceSingle(i);
    assert.ok(v >= 1 && v <= 9, `${i} -> ${v}`);
  }
});

test('baseDigit collapses master numbers', () => {
  assert.equal(C.baseDigit(11), 2);
  assert.equal(C.baseDigit(22), 4);
  assert.equal(C.baseDigit(7), 7);
});

/* ---------------- numerology ---------------- */

test('powerNumber matches hand calculation', () => {
  /* 15 + 1 + 1990 = 2006 -> 2+0+0+6 = 8 */
  assert.equal(C.powerNumber('1990-01-15'), 8);
  /* 11 + 11 + 1985 = 2007 -> 9 */
  assert.equal(C.powerNumber('1985-11-11'), 9);
});

test('powerNumber returns null for bad input', () => {
  assert.equal(C.powerNumber('nope'), null);
  assert.equal(C.powerNumber(''), null);
});

test('every powerNumber is a key in the data table', () => {
  const seen = new Set();
  for (let y = 1950; y <= 2010; y++) {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 28; d++) {
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const p = C.powerNumber(iso);
        assert.ok(D.NUMEROLOGY[p], `missing archetype for ${iso} -> ${p}`);
        seen.add(p);
      }
    }
  }
  assert.equal(seen.size, 11, 'expected 1-9, 11 and 22 to all occur');
});

test('personalYear uses the target year', () => {
  const a = C.personalYear('1990-01-15', 2026);
  const b = C.personalYear('1990-01-15', 2027);
  assert.ok(a >= 1 && a <= 22);
  assert.notEqual(a, b);
});

test('nameNumber is a Pythagorean sum', () => {
  /* S1 O6 H8 I9 L3 = 27 ; M4 O6 M4 I9 N5 = 28 ; total 55 -> 10 -> 1 */
  assert.equal(C.nameNumber('Sohil Momin'), 1);
  assert.equal(C.nameNumber(''), null);
  assert.equal(C.nameNumber('!!!'), null);
  assert.equal(C.nameNumber('a'), 1);
});

test('vowelsOf only counts vowels', () => {
  /* O6 I9 O6 I9 = 30 -> 3 */
  assert.equal(C.vowelsOf('Sohil Momin'), 3);
  assert.equal(C.vowelsOf('rhythm'), null);
});

test('dayNumber is stable for a fixed date', () => {
  assert.equal(C.dayNumber(new Date(2026, 10, 11)), C.dayNumber(new Date(2026, 10, 11, 23, 59)));
});

test('luckyDates only returns valid days in the month', () => {
  const dates = C.luckyDates('1990-01-15', 2026, 1); /* February 2026, 28 days */
  assert.ok(dates.length > 0);
  dates.forEach((d) => assert.ok(d >= 1 && d <= 28, `bad day ${d}`));
});

test('luckyDates handles a leap February', () => {
  const dates = C.luckyDates('1990-01-15', 2024, 1);
  dates.forEach((d) => assert.ok(d >= 1 && d <= 29));
});

/* ---------------- zodiac ---------------- */

test('zodiac boundaries are conventional', () => {
  const cases = {
    '1990-01-19': 'Capricorn', '1990-01-20': 'Aquarius',
    '1990-02-18': 'Aquarius', '1990-02-19': 'Pisces',
    '1990-03-20': 'Pisces', '1990-03-21': 'Aries',
    '1990-06-20': 'Gemini', '1990-06-21': 'Cancer',
    '1990-11-21': 'Scorpio', '1990-11-22': 'Sagittarius',
    '1990-12-21': 'Sagittarius', '1990-12-22': 'Capricorn'
  };
  for (const [iso, sign] of Object.entries(cases)) {
    assert.equal(C.zodiac(iso), sign, iso);
  }
});

test('every zodiac sign exists in the data table', () => {
  for (let m = 1; m <= 12; m++) {
    for (const d of [1, 10, 20, 28]) {
      const iso = `1995-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const z = C.zodiac(iso);
      assert.ok(D.ZODIAC[z], `missing sign ${z}`);
    }
  }
});

/* ---------------- moon ---------------- */

test('moon phase is new at the known epoch', () => {
  const mp = C.moonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14)));
  assert.equal(mp.index, 0);
  assert.ok(mp.illumination < 0.01, `illumination ${mp.illumination}`);
});

test('moon phase is full half a cycle later', () => {
  const ms = Date.UTC(2000, 0, 6, 18, 14) + (C.SYNODIC / 2) * C.DAY_MS;
  const mp = C.moonPhase(new Date(ms));
  assert.ok(mp.illumination > 0.99, `illumination ${mp.illumination}`);
});

test('illumination stays within 0..1 across a full cycle', () => {
  const base = Date.UTC(2000, 0, 6, 18, 14);
  for (let i = 0; i < 60; i++) {
    const mp = C.moonPhase(new Date(base + i * C.DAY_MS));
    assert.ok(mp.illumination >= 0 && mp.illumination <= 1);
    assert.ok(mp.index >= 0 && mp.index <= 7);
  }
});

test('daysToPhase is within one synodic month', () => {
  const d = new Date(2026, 10, 11);
  for (const target of [0, 2, 4, 6]) {
    const delta = C.daysToPhase(d, target);
    assert.ok(delta >= 0 && delta < C.SYNODIC, `target ${target} -> ${delta}`);
  }
});

test('nextPhaseDate is always in the future', () => {
  const d = new Date(2026, 10, 11);
  const next = C.nextPhaseDate(d, 4);
  assert.ok(next >= C.localMidnight(d));
});

/* ---------------- biorhythm ---------------- */

test('biorhythm is neutral on the day of birth', () => {
  assert.equal(C.biorhythm('1990-01-15', 23, new Date(1990, 0, 15)), 50);
});

test('biorhythm returns null for a future birth date', () => {
  assert.equal(C.biorhythm('2099-01-01', 23, new Date(2026, 10, 11)), null);
});

test('biorhythm stays in 0..100 over two years', () => {
  for (let i = 0; i < 730; i++) {
    const d = new Date(2026, 0, 1 + i);
    for (const cycle of [23, 28, 33]) {
      const v = C.biorhythm('1990-01-15', cycle, d);
      assert.ok(v >= 0 && v <= 100, `cycle ${cycle} -> ${v}`);
    }
  }
});

test('biorhythmSeries returns the requested span with aligned arrays', () => {
  const s = C.biorhythmSeries('1990-01-15', 30, new Date(2026, 10, 11));
  assert.equal(s.labels.length, 30);
  for (const k of ['physical', 'emotional', 'intellectual']) {
    assert.equal(s.series[k].length, 30);
    s.series[k].forEach((v) => assert.ok(v >= 0 && v <= 100));
  }
});

test('biorhythmLabel covers every band', () => {
  assert.equal(C.biorhythmLabel('physical', 90), 'High');
  assert.equal(C.biorhythmLabel('physical', 60), 'Good');
  assert.equal(C.biorhythmLabel('physical', 50), 'Neutral');
  assert.equal(C.biorhythmLabel('physical', 30), 'Low');
  assert.equal(C.biorhythmLabel('physical', 5), 'Critical');
  assert.equal(C.biorhythmLabel('physical', null), '—');
});

/* ---------------- couple ---------------- */

test('coupleScore rejects invalid dates', () => {
  assert.equal(C.coupleScore('bad', '1990-01-15'), null);
});

test('master numbers are no longer penalised', () => {
  const r = C.coupleScore('1975-01-06', '1990-01-15');
  assert.ok(r.score > 30, `score ${r.score}`);
  /* find a genuine #22 date and check it can beat the old 65% cap */
  let found = null;
  for (let y = 1970; y < 2000 && !found; y++) {
    for (let m = 1; m <= 12 && !found; m++) {
      for (let d = 1; d <= 28 && !found; d++) {
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (C.powerNumber(iso) === 22) found = iso;
      }
    }
  }
  assert.ok(found, 'expected to find a #22 date');
  const r22 = C.coupleScore(found, '1990-01-15');
  assert.ok(r22.numCompat >= 30, `numCompat ${r22.numCompat}`);
});

test('couple score is symmetric', () => {
  const a = C.coupleScore('1990-01-15', '1988-07-04');
  const b = C.coupleScore('1988-07-04', '1990-01-15');
  assert.equal(a.score, b.score);
  assert.equal(a.numCompat, b.numCompat);
});

test('coupleVerdict covers all bands', () => {
  [90, 76, 62, 50, 30].forEach((s) => {
    const v = C.coupleVerdict(s);
    assert.ok(v.label && v.note);
  });
});

/* ---------------- oracle ---------------- */

test('seededPick is deterministic per question', () => {
  const a = C.seededPick(D.TAROT, 'will it work|tarot');
  const b = C.seededPick(D.TAROT, 'will it work|tarot');
  const c = C.seededPick(D.TAROT, 'something else|tarot');
  assert.equal(a.item.name, b.item.name);
  assert.notEqual(a.item.name, c.item.name);
});

test('seededPick always returns an item', () => {
  for (const q of ['', 'a', 'long question about the future', '###']) {
    const r = C.seededPick(D.TAROT, q);
    assert.ok(r.item && r.item.name);
    assert.ok(r.index >= 0 && r.index < D.TAROT.length);
  }
});

test('pick honours an injected random value', () => {
  assert.equal(C.pick(['a', 'b', 'c'], 0).length, 1);
  assert.equal(C.pick(['a', 'b', 'c'], 0), 'a');
  assert.equal(C.pick(['a', 'b', 'c'], 0.99), 'c');
});

/* ---------------- data integrity ---------------- */

test('data tables are complete', () => {
  assert.equal(Object.keys(D.NUMEROLOGY).length, 11);
  assert.equal(Object.keys(D.ZODIAC).length, 12);
  assert.equal(D.MOON_PHASES.length, 8);
  assert.equal(D.TAROT.length, 22);
  assert.equal(D.TRIGRAMS.length, 8);
  assert.equal(D.ORACLE_8.length, 19);
  assert.equal(D.MONTHS.length, 12);
  assert.equal(D.WEEKDAYS.length, 7);
  assert.equal(D.PHASE_ICON.length, 8);
});

test('biorhythm data matches the classic cycle lengths', () => {
  assert.equal(D.BIORHYTHM.physical.cycle, 23);
  assert.equal(D.BIORHYTHM.emotional.cycle, 28);
  assert.equal(D.BIORHYTHM.intellectual.cycle, 33);
});

test('no homeopathy content survives anywhere in the data', () => {
  const blob = JSON.stringify(D).toLowerCase();
  for (const term of ['remedy', 'potency', 'homeopath', 'lycopodium', 'aurum', 'nux vomica', '30c', '6c']) {
    assert.ok(!blob.includes(term), `found "${term}" in data tables`);
  }
});

/* ---------------- I Ching ---------------- */

test('the deck holds all 64 hexagrams with unique line patterns', () => {
  assert.equal(D.HEXAGRAMS.length, 64);
  assert.equal(new Set(D.HEXAGRAMS.map((h) => h.bits)).size, 64);
  D.HEXAGRAMS.forEach((h) => {
    assert.match(h.bits, /^[01]{6}$/, `hexagram ${h.n} has bad bits`);
    assert.ok(h.name && h.name.length > 2, `hexagram ${h.n} has no name`);
    assert.ok(h.reading && h.reading.length > 20, `hexagram ${h.n} has no reading`);
  });
});

test('hexagram numbers are 1..64 with no gaps', () => {
  const nums = D.HEXAGRAMS.map((h) => h.n).sort((a, b) => a - b);
  assert.deepEqual(nums, Array.from({ length: 64 }, (_, i) => i + 1));
});

test('known hexagrams sit on the right line pattern', () => {
  /* 1 Creative is all yang, 2 Receptive all yin, 11 Peace is heaven below earth */
  assert.equal(C.hexagramByBits('111111').n, 1);
  assert.equal(C.hexagramByBits('000000').n, 2);
  assert.equal(C.hexagramByBits('111000').n, 11);
  assert.equal(C.hexagramByBits('000111').n, 12);
  assert.equal(C.hexagramByBits('101010').n, 63);
  assert.equal(C.hexagramByBits('010101').n, 64);
});

test('every hexagram round-trips through its own bits', () => {
  D.HEXAGRAMS.forEach((h) => {
    const found = C.hexagramByBits(h.bits);
    assert.ok(found, `no lookup for ${h.bits}`);
    assert.equal(found.n, h.n);
  });
});

test('hexagramByBits returns null for an unknown pattern', () => {
  assert.equal(C.hexagramByBits(''), null);
  assert.equal(C.hexagramByBits('111'), null);
});

test('casting always yields six valid lines', () => {
  for (let i = 0; i < 300; i++) {
    const cast = C.castHexagram();
    assert.equal(cast.lines.length, 6);
    assert.match(cast.bits, /^[01]{6}$/);
    assert.match(cast.changedBits, /^[01]{6}$/);
    cast.lines.forEach((l) => {
      assert.ok([6, 7, 8, 9].includes(l.value), `bad line value ${l.value}`);
      assert.equal(l.yang, l.value === 7 || l.value === 9);
      assert.equal(l.changing, l.value === 6 || l.value === 9);
      assert.equal(l.coins.length, 3);
    });
    assert.ok(C.hexagramByBits(cast.bits), 'cast bits must map to a hexagram');
  }
});

test('a changing line flips exactly one bit in the transformed hexagram', () => {
  /* force every line to 9 (old yang) — all six change */
  const cast = C.castHexagram(() => 0.9);
  assert.equal(cast.bits, '111111');
  assert.equal(cast.changing, 6);
  assert.equal(cast.changedBits, '000000');
});

test('a cast with no changing lines transforms to itself', () => {
  /* 2,2,3 per line = 7 young yang: static */
  const seq = [0.1, 0.1, 0.9];
  let i = 0;
  const cast = C.castHexagram(() => seq[i++ % 3]);
  assert.equal(cast.changing, 0);
  assert.equal(cast.bits, '111111');
  assert.equal(cast.bits, cast.changedBits);

  /* and in general, no changing lines means no transformation */
  for (let n = 0; n < 200; n++) {
    const c = C.castHexagram();
    if (c.changing === 0) assert.equal(c.bits, c.changedBits);
    else assert.notEqual(c.bits, c.changedBits);
  }
});

/* ---------------- tarot deck ---------------- */

test('the full deck is 78 unique cards', () => {
  const deck = C.fullDeck();
  assert.equal(deck.length, 78);
  assert.equal(new Set(deck.map((c) => c.name)).size, 78);
  deck.forEach((c) => assert.ok(c.reading && c.reading.length > 10, `${c.name} has no reading`));
});

test('the deck keeps 22 majors and 56 minors', () => {
  const deck = C.fullDeck();
  assert.equal(deck.filter((c) => c.suit === 'Major').length, 22);
  assert.equal(deck.filter((c) => c.suit !== 'Major').length, 56);
  ['Wands', 'Cups', 'Swords', 'Coins'].forEach((s) => {
    assert.equal(deck.filter((c) => c.suit === s).length, 14, `${s} should have 14`);
  });
});

test('drawCards returns distinct cards and is deterministic', () => {
  const deck = C.fullDeck();
  const a = C.drawCards(deck, 5, 'seed');
  const b = C.drawCards(deck, 5, 'seed');
  assert.equal(a.length, 5);
  assert.equal(new Set(a.map((c) => c.name)).size, 5);
  assert.deepEqual(a.map((c) => c.name), b.map((c) => c.name));
});

test('drawCards cannot draw more than the deck holds', () => {
  const deck = C.fullDeck();
  assert.equal(C.drawCards(deck, 200, 'x').length, 78);
});

/* ---------------- runes ---------------- */

test('the rune set is the 24 Elder Futhark', () => {
  assert.equal(D.RUNES.length, 24);
  assert.equal(new Set(D.RUNES.map((r) => r.name)).size, 24);
  D.RUNES.forEach((r) => {
    assert.ok(r.glyph, `${r.name} has no glyph`);
    assert.ok(r.upright && r.upright.length > 10, `${r.name} has no upright meaning`);
    assert.ok(r.reversed && r.reversed.length > 10, `${r.name} has no reversed meaning`);
  });
  assert.equal(D.RUNES[0].name, 'Fehu');
  assert.equal(D.RUNES[23].name, 'Othala');
});

/* ---------------- determinism ---------------- */

test('seededRandom is reproducible and stays in range', () => {
  const a = C.seededRandom('abc');
  const b = C.seededRandom('abc');
  const c = C.seededRandom('abd');
  for (let i = 0; i < 50; i++) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
  }
  assert.notEqual(C.seededRandom('abc')(), c());
});

test('dailyIndex is stable per day and changes across days', () => {
  const deck = C.fullDeck();
  const d1 = C.dailyIndex(deck, new Date(2026, 10, 11), 'tarot');
  const d1b = C.dailyIndex(deck, new Date(2026, 10, 11, 23, 30), 'tarot');
  const d2 = C.dailyIndex(deck, new Date(2026, 10, 12), 'tarot');
  assert.equal(d1.item.name, d1b.item.name, 'same day must give the same draw');
  assert.notEqual(d1.item.name, d2.item.name, 'next day must differ');
  assert.equal(d1.day, '2026-11-11');
});

test('dailyIndex works for hexagrams and runes too', () => {
  const h = C.dailyIndex(D.HEXAGRAMS, new Date(2026, 10, 11), 'iching');
  const r = C.dailyIndex(D.RUNES, new Date(2026, 10, 11), 'runes');
  assert.ok(h.item.bits);
  assert.ok(r.item.glyph);
});

/* ---------------- moon sign ---------------- */

/* signed angular difference, in [-180, 180) */
const separation = (a, b) => {
  const d = (((a - b) % 360) + 360) % 360;
  return d > 180 ? d - 360 : d;
};

test('at a known new moon the Moon and Sun share a longitude', () => {
  const jd = C.julianDay(2000, 1, 6, 18 + 14 / 60);
  const moon = C.moonLongitude(jd);
  const sun = C.sunLongitude(jd);
  const sep = Math.abs(separation(moon, sun));
  assert.ok(sep < 1.5, `expected conjunction, got ${moon.toFixed(2)} vs ${sun.toFixed(2)} (${sep.toFixed(2)} deg apart)`);
});

test('at a known full moon the Moon is opposite the Sun', () => {
  const jd = C.julianDay(2000, 1, 21, 4 + 40 / 60);
  const moon = C.moonLongitude(jd);
  const sun = C.sunLongitude(jd);
  const sep = Math.abs(separation(moon, sun));
  assert.ok(Math.abs(sep - 180) < 1.5, `expected opposition, got ${sep.toFixed(2)} deg`);
});

test('moon longitude always lands in 0..360', () => {
  for (let i = 0; i < 400; i++) {
    const lon = C.moonLongitude(2451545 + i * 7.3);
    assert.ok(lon >= 0 && lon < 360, `out of range ${lon}`);
  }
});

test('moonSign maps a longitude to the right sign', () => {
  assert.equal(C.signFromLongitude(0), 'Aries');
  assert.equal(C.signFromLongitude(29.9), 'Aries');
  assert.equal(C.signFromLongitude(30), 'Taurus');
  assert.equal(C.signFromLongitude(359.9), 'Pisces');
});

test('moonSign needs a valid date and handles a missing time', () => {
  assert.equal(C.moonSign('nope', '10:00', 330), null);
  const withTime = C.moonSign('1990-01-15', '06:45', 330);
  const noTime = C.moonSign('1990-01-15', '', 330);
  assert.ok(C.SIGNS.includes(withTime.sign));
  assert.equal(withTime.assumedNoon, false);
  assert.equal(noTime.assumedNoon, true);
});

test('moonSign respects the UTC offset', () => {
  /* twelve hours apart is about six degrees of lunar motion, which can
     cross a sign boundary — the two offsets must not always agree */
  const a = C.moonSign('1990-01-15', '00:30', 330);
  const b = C.moonSign('1990-01-15', '00:30', -480);
  assert.ok(a && b);
  assert.notEqual(a.longitude.toFixed(4), b.longitude.toFixed(4));
});

/* ---------------- biorhythm sync ---------------- */

test('the same person is always fully in sync', () => {
  const s = C.biorhythmSync('1990-01-15', '1990-01-15', new Date(2026, 10, 11));
  assert.equal(s.score, 100);
  assert.equal(Object.keys(s.cycles).length, 3);
});

test('sync scores stay in range and degrade with distance', () => {
  const close = C.biorhythmSync('1990-01-15', '1990-01-16', new Date(2026, 10, 11));
  const far = C.biorhythmSync('1990-01-15', '1990-07-15', new Date(2026, 10, 11));
  assert.ok(close.score >= 0 && close.score <= 100);
  assert.ok(far.score >= 0 && far.score <= 100);
  assert.ok(close.score > far.score, 'adjacent birthdays should sync more closely');
});

test('sync returns null for an invalid date', () => {
  assert.equal(C.biorhythmSync('bad', '1990-01-15', new Date()), null);
});

/* ---------------- power breakdown ---------------- */

test('the breakdown explains the power number step by step', () => {
  const b = C.powerBreakdown('1990-01-15');
  assert.equal(b.day, 15);
  assert.equal(b.month, 1);
  assert.equal(b.year, 1990);
  assert.equal(b.sum, 2006);
  assert.deepEqual(b.steps, [2006, 8]);
  assert.equal(b.result, 8);
});

test('the breakdown keeps master numbers unreduced', () => {
  /* 29 reduces to 11, which must stop there */
  const b = C.powerBreakdown('1985-11-03');
  assert.equal(b.sum, 1999);
  assert.equal(b.result, C.powerNumber('1985-11-03'));
});

test('the breakdown result always equals powerNumber', () => {
  for (let y = 1960; y <= 2000; y += 3) {
    for (let m = 1; m <= 12; m += 2) {
      const iso = `${y}-${String(m).padStart(2, '0')}-11`;
      assert.equal(C.powerBreakdown(iso).result, C.powerNumber(iso), iso);
    }
  }
});

test('the breakdown rejects an invalid date', () => {
  assert.equal(C.powerBreakdown('nope'), null);
});

/* ---------------- ascendant ---------------- */

test('the ascendant is correct at the equator', () => {
  /* at latitude 0 with LST 0h the MC is 0 Aries and the Ascendant is 90 Cancer;
     three hours later it is 180 Libra; six hours later 270 Capricorn */
  assert.ok(Math.abs(C.ascendantLongitude(0, 0) - 90) < 0.01);
  assert.ok(Math.abs(C.ascendantLongitude(90, 0) - 180) < 0.01);
  assert.ok(Math.abs(C.ascendantLongitude(180, 0) - 270) < 0.01);
});

test('the ascendant always lands in 0..360', () => {
  for (let lst = 0; lst < 360; lst += 7) {
    for (const lat of [-60, -23, 0, 19, 51]) {
      const a = C.ascendantLongitude(lst, lat);
      assert.ok(a >= 0 && a < 360, `lst ${lst} lat ${lat} -> ${a}`);
    }
  }
});

test('sidereal time advances by about 15 degrees an hour', () => {
  const jd = C.julianDay(2026, 10, 11, 0);
  const a = C.gmst(jd);
  const b = C.gmst(jd + 1 / 24);
  const delta = ((b - a) + 360) % 360;
  assert.ok(delta > 14.9 && delta < 15.1, `advanced ${delta.toFixed(3)} deg`);
});

test('risingSign needs a time, a date and coordinates', () => {
  assert.equal(C.risingSign('1990-01-15', '', 330, 18.5, 73.8), null, 'no time');
  assert.equal(C.risingSign('nope', '06:45', 330, 18.5, 73.8), null, 'bad date');
  assert.equal(C.risingSign('1990-01-15', '06:45', 330, null, null), null, 'no coords');
  const r = C.risingSign('1990-01-15', '06:45', 330, 18.52, 73.86);
  assert.ok(C.SIGNS.includes(r.sign));
  assert.ok(r.degree >= 0 && r.degree < 30);
});

test('four minutes of birth time moves the ascendant about a degree', () => {
  const a = C.risingSign('1990-01-15', '06:45', 330, 18.52, 73.86);
  const b = C.risingSign('1990-01-15', '06:49', 330, 18.52, 73.86);
  let delta = Math.abs(b.longitude - a.longitude);
  if (delta > 180) delta = 360 - delta;
  assert.ok(delta > 0.5 && delta < 1.6, `moved ${delta.toFixed(2)} deg`);
});

test('city lookup finds exact and prefix matches', () => {
  assert.equal(C.findCity('Pune').lat, 18.520);
  assert.equal(C.findCity('pune').name, 'Pune');
  assert.equal(C.findCity('Mum').name, 'Mumbai');
  assert.equal(C.findCity('zzzz'), null);
  assert.equal(C.findCity(''), null);
});

test('every city has usable coordinates', () => {
  D.CITIES.forEach((c) => {
    assert.ok(c.name && c.name.length > 1, 'unnamed city');
    assert.ok(c.lat >= -90 && c.lat <= 90, `${c.name} bad lat`);
    assert.ok(c.lon >= -180 && c.lon <= 180, `${c.name} bad lon`);
  });
});

/* ---------------- personal month ---------------- */

test('personal month follows personal year', () => {
  const py = C.personalYear('1990-01-15', 2026);
  const jan = C.personalMonth('1990-01-15', 2026, 0);
  assert.equal(jan, C.reducePower(py + 1));
  assert.ok(jan >= 1 && jan <= 22);
});

test('personal months run a full year without gaps', () => {
  const months = [];
  for (let m = 0; m < 12; m++) months.push(C.personalMonth('1990-01-15', 2026, m));
  assert.equal(months.length, 12);
  months.forEach((v) => assert.ok(v >= 1 && v <= 22));
  assert.equal(C.personalMonth('nope', 2026, 0), null);
});

/* ---------------- offset handling ---------------- */

test('a missing or broken UTC offset falls back to IST, never to NaN', () => {
  const base = C.risingSign('1990-01-15', '06:45', 330, 18.52, 73.86);
  [NaN, undefined, null, '', 'abc', Infinity, 99999].forEach((bad) => {
    const r = C.risingSign('1990-01-15', '06:45', bad, 18.52, 73.86);
    assert.ok(r, 'should still return a reading');
    assert.equal(r.longitude.toFixed(6), base.longitude.toFixed(6), 'offset ' + String(bad));
  });
});

test('saneOffset accepts valid values and rejects the rest', () => {
  assert.equal(C.saneOffset(330), 330);
  assert.equal(C.saneOffset(-480), -480);
  assert.equal(C.saneOffset('330'), 330);
  assert.equal(C.saneOffset(NaN), 330);
  assert.equal(C.saneOffset(undefined), 330);
  assert.equal(C.saneOffset(99999), 330);
});

test('a broken offset cannot change the moon sign either', () => {
  const base = C.moonSign('1990-01-15', '06:45', 330);
  const bad = C.moonSign('1990-01-15', '06:45', NaN);
  assert.equal(bad.longitude.toFixed(6), base.longitude.toFixed(6));
});
