# Holistic 2.6.0

The rising sign, and a bug that was quietly inventing one.

## Added

- **Rising sign.** The ascendant from local sidereal time, your birth time, UTC offset and one of 120 cities. Birth city becomes a select rather than free text, because an ascendant needs coordinates.
- **Personal months.** Twelve cells on the Numbers screen — personal year plus the calendar month, reduced. The current month is highlighted.
- **Library filters.** Narrow the tarot deck by suit; counts update live.
- **CSV export.** Every personal day in the year, as a file you can import into a calendar.

## Fixed

- **A missing UTC offset produced a fabricated ascendant.** `parseInt(undefined)` returns `NaN`, and `typeof NaN === 'number'`, so the sanitiser passed it straight through. The result was not an error — it was a plausible-looking sign and degree computed from `NaN`. Every offset now goes through `saneOffset()`, which rejects anything non-finite or out of range and falls back to +05:30. Three tests pin the behaviour, including one that checks a broken offset cannot change the Moon either.

## Corrected

- The README roadmap claimed a forecast tab needed fixing. **There is no forecast tab** — it was dropped in the v2.0.0 rebuild. The line was stale and is gone.

## Testing

- 79 logic tests (up from 67): the ascendant at the equator against three textbook values, sidereal time advancing ~15°/hour, four minutes of birth time moving the ascendant ~1°, city lookup, personal months, and the offset regressions.
- 169 browser assertions (up from 156): rising sign rendering, honest degradation for an unknown city, twelve personal-month cells, suit filtering with exact counts, and the CSV action.

---

# Holistic 2.5.0

The polish pass: eight small things, no new concepts.

## Added

- **Keyboard shortcuts.** `1`–`8` jump between screens. Ignored while typing in a field.
- **Offline badge.** A quiet chip appears when the browser reports it is offline — which, for this app, changes nothing.
- **Last screen is remembered.** Reopening lands where you left off instead of always on Today.
- **"Why this number?"** A disclosure under the power number showing the arithmetic: day + month + year, then the reduction chain, step by step.
- **Export the current draw.** `.md` and `.rtf` buttons on any reading, not just the full report.
- **A5 print card.** A compact print mode that fits the report on an A5 page.

## Changed

- **Biorhythm chart** now distinguishes its three lines by dash pattern as well as colour, so it reads without colour vision.
- **Dates** use `Intl.DateTimeFormat` where available, falling back to the hand-rolled formatter.

## Testing

- 67 logic tests (up from 63): the power-number breakdown against known dates, master-number handling, and agreement with `powerNumber` across a decade of dates.
- 156 browser assertions (up from 145): the why-disclosure arithmetic, three distinct dash patterns, draw-level export buttons, keyboard navigation, and that shortcuts are ignored while typing.

---

# Holistic 2.4.0

Plain-text exports, and no PDF.

## Added

- **Markdown export.** The full reading — numbers, sky, cycles, focus, and the current draw — as a `.md` file.
- **RTF export.** The same content as Rich Text, which opens in Word, Pages, LibreOffice and Google Docs. RTF is 7-bit: the writer escapes control characters and maps typographic punctuation to ASCII, so it never arrives mangled.

## Not added

- **PDF export.** Asked for, considered, and dropped by request. A PDF would need a layout library or a headless print pipeline, and the browser's own Print → Save as PDF already does it without adding a byte.
- **Cloud anything.** No sync, no backup service, no accounts. The app makes zero network requests and will stay that way.

## Testing

- 145 browser assertions (up from 132): Markdown structure, all sections present, the draw included, the disclaimer present, RTF header and brace balance, ASCII-only output, and brace escaping.

---

# Holistic 2.3.0

The version you can show someone.

## Added

- **Share as image.** Any draw — tarot card, spread, hexagram or rune — and your profile summary render to a 1080×1350 PNG. Everything is drawn with the 2D canvas context: no library, no network, no fonts to fetch. Uses `navigator.share` with a file where the browser supports it, and falls back to a download.
- **Multiple profiles.** Add, switch and delete people on the same device. Storage moves to a `{items, active}` object and migrates the old single-profile key automatically.

## Not added

- **A journal.** Considered and rejected: it turns a reading tool into a diary with a retention obligation, and the data is more sensitive than anything else the app stores.

## Testing

- 132 browser assertions (up from 115): canvas dimensions, non-blank output, PNG generation, the hexagram card path, the share button appearing after a draw, and the full profile lifecycle — add, save, switch, delete.

---

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
