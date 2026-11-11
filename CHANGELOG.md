# Holistic 2.2.0

The version where the readings got a shape.

## Added

- **Tarot spreads** — single card, three-card past/present/future, and a five-card relationship spread (You / Them / The bond / What helps / What blocks). Cards are drawn without replacement, so a spread never repeats one.
- **Clarifying card** — one more card against a single draw, seeded from the same question.
- **Moon sign** — ecliptic longitude of the Moon at your birth time, computed from the principal periodic terms. Validated against the new and full moons of January 2000; accurate to about 0.3°, which is ample for a 30° sign.
- **Biorhythm sync** in the Couple screen — how far apart two people's three cycles sit today, plus a single sync percentage.
- **UTC offset** field in the profile, used only to place the Moon. Without it a birth time is uninterpretable.

## Changed

- The Sky screen leads with sun sign and moon sign side by side, instead of a sun-sign card with an element tile.
- Moon sign falls back to noon when no birth time is given, and says so rather than pretending.

## Testing

- 63 logic tests (up from 54): conjunction at a known new moon, opposition at a known full moon, longitude range, sign boundaries, UTC-offset sensitivity, and sync scoring.
- 115 browser assertions (up from 102): spread sizes, card distinctness, the clarifying card, moon sign rendering, and the sync rows.

---

# Holistic 2.1.0

The version where the decks got real.

## Added

- **All 64 I Ching hexagrams**, with three-coin casting. Each cast draws six lines, marks the changing ones, and reads the movement toward the transformed hexagram. Casts are seeded from the question, so the same question gives the same hexagram.
- **All 78 tarot cards** — the 22 majors plus 56 minors across Wands, Cups, Swords and Coins, each with its own one-line reading.
- **All 24 Elder Futhark runes**, upright and reversed, with a 40% chance of drawing reversed.
- **Library screen** — 166 entries, searchable, offline. Cards by suit, hexagrams by number and line pattern, runes by name.
- **Daily draw** — one card, hexagram or rune per day, fixed by the calendar date so it cannot be re-rolled.
- **Question coaching** on the oracle screen: open questions read better than yes/no ones.

## Changed

- The Oracle screen is now a four-way segmented control (Tarot / I Ching / Runes / Straight) instead of three separate buttons.
- The I Ching trigram stub is superseded by the full hexagram set. The eight trigrams remain in the data as a reference table.
- Single-file build grows from 92 KB to 127 KB — 35 KB of that is reference text and its JavaScript syntax.
- Rail gains an eighth item, Library.

## Testing

- 54 logic tests (up from 38): the 64 hexagrams are checked for unique line patterns, the deck for 78 unique cards, casting for valid lines and correct transformation, and the daily draw for day-to-day stability.
- 102 browser assertions (up from 87): all four oracle modes, hexagram line rendering, library row counts per collection, and search filtering.

---

# Holistic 2.0.0

The version where the app stopped prescribing things.

## Removed

- **The entire homeopathy module.** The tab, the eleven-entry remedy table, the potency/frequency/duration fields, the "healing crisis" copy and the report section are gone. A birth date cannot select a constitutional remedy, and a tool that names suicidal ideation in its output must route people to a human rather than to a protocol. `tests/core.test.mjs` now fails the build if any of those terms reappear in the data tables.

## Added

- **Personal year, expression number and soul urge** — the name field finally does arithmetic instead of being decorative.
- **Personal days** derived for the current month, replacing a fixed list that once produced "32 December".
- **Lunar calendar** with the next four phase dates, and a real illuminated moon disc.
- **Biorhythm chart** with 7 / 30 / 90-day views.
- **Backup and restore** as a JSON file.
- **Printable report** plus a plain-text copy button.
- **Deep links** — `#numbers`, `#sky`, `#couple`, `#oracle`, `#report`, `#profile`.
- **PWA**: manifest, service worker, maskable icons, installable.
- **Single-file build** at `dist/holistic.html`, 92 KB with everything inlined.

## Changed

- **Layout rebuilt as an app shell**: fixed rail on desktop, top bar plus bottom tab bar on mobile, 48 px minimum touch targets, safe-area insets for notched phones.
- **Couple scoring** no longer penalises master numbers. The old formula capped a #22 user at 65% against everyone; the gap is now measured on reduced digits.
- **Oracle** is seeded from the question, so the same question gives the same card and rephrasing is part of the exercise. Previously the dashboard and the oracle disagreed about whether tarot was deterministic or random.
- **Prediction year** defaults to the current year instead of a hard-coded 2025.
- **Date input** rejects dates outside 1900–2200 and impossible dates like 2023-02-30.
- **Reduced motion** is respected; the animated aurora is now a single static gradient paint.

## Testing

- 38 logic tests (`npm test`) covering reduction, date parsing, zodiac cusps, lunar epochs, biorhythm bounds, couple symmetry and data integrity.
- 87 browser assertions (`npm run test:browser`) covering every screen, action, navigation target, empty state, invalid input and a check that no `getElementById` call misses.
