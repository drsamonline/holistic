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
