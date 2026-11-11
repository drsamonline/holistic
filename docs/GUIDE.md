# Holistic — user guide

**Version 2.7.1 · PolyForm Noncommercial 1.0.0 · one 193 KB file, works with the Wi-Fi off**

A personal reflection app. Enter a name and a birth date once; it derives a numerology profile, your
sun sign, today's lunar phase and biorhythm cycles, then keeps them on one screen you can open every
morning.

Every number is **computed from your input** rather than looked up from a hard-coded list — which is
why the arithmetic can be checked by hand.

## What it is, and what it is not

Honesty is part of the product:

| It is | It is not |
|---|---|
| A reflective exercise with a vocabulary for things you half-know | A diagnosis or a medical device |
| Arithmetic you can check by hand | Evidence — biorhythm in particular has failed validation since the 1970s |
| A reason to notice your own energy | A prediction of your future |
| Free and uncommercial | A prescription of anything, for anyone |

There is **no homeopathy content** in this project. An earlier prototype carried a remedy table
derived from birth-date arithmetic; it was removed in v2.0.0, because a date of birth cannot select a
constitutional remedy — and because a tool that can name suicidal ideation in its output must route
people to a human, not to a protocol.

## The screens

| Screen | What it holds |
|---|---|
| **Today** | moon, biorhythm, your number |
| **Numbers** | power number (11 and 22 preserved), personal year, expression number and soul urge from the letters of your name, personal days for the month |
| **Sky** | sun sign, a 30-day chart, the lunar calendar, moon sign and rising sign from your birth time |
| **Couple** | two dates, element relation, a score, and how far apart the two people's biorhythms are today |
| **Oracle** | a card, not a prophecy — tarot (single, three-card, five-card), I Ching, runes, or a straight answer |
| **Library** | every card, hexagram and rune, searchable and filterable, offline |
| **Report** | one printable page, with a compact A5 mode |
| **Profile** | your details, multiple profiles, backup and restore, and the support block |

## The parts that compute rather than guess

- **Lunar astronomy**: phase, illumination and the next four phase dates from the synodic month,
  anchored to the new moon of 6 January 2000, 18:14 UTC.
- **Moon sign** from its ecliptic longitude (±0.3°); **rising sign** from local sidereal time and a
  table of 120 city coordinates.
- **Biorhythm**: 23 / 28 / 33-day cycles with a 7, 30 or 90-day view.
- **I Ching**: all 64 hexagrams, three-coin casting, changing lines read as a movement toward the
  transformed hexagram.
- **Tarot and runes**: all 78 cards and the 24 Elder Futhark, with reversed readings.

## Drawing, and why it cannot be re-rolled

The **daily draw** is fixed by the date. The **Oracle** is seeded from your question, so the same
question gives the same draw — rephrasing is part of the exercise, not a way to fish for a better
answer. Spreads are drawn **without replacement**.

## Your data

Multiple profiles on one device; nothing leaves it. The app works offline once loaded, and the whole
thing — stylesheet, scripts, icons, logic — is one file.

## Exporting

Share as image (a 1080×1350 card drawn on canvas, no library, using the native share sheet where the
browser has one), export as **Markdown or RTF** — no PDF and no binary format — print the report, or
copy the plain text.

## Support

Free, offline, accountless — and staying that way. Nothing is gated behind it.

| | |
|---|---|
| UPI (India) | `drsohilboi@ybl` — payee Dr. Sohil Momin, open amount, or scan the QR in the app |
| GitHub Sponsors | [github.com/sponsors/drsamonline](https://github.com/sponsors/drsamonline) |
| Ko-fi | [ko-fi.com/matneo](https://ko-fi.com/matneo) |
| PayPal | [paypal.me/drsohilmomin](https://paypal.me/drsohilmomin) |
| My books | [Amazon author store](https://www.amazon.com/stores/author/B08ZT331LY/allbooks) |
| More apps | [drsamonline.github.io](https://drsamonline.github.io/) |

## Licence

PolyForm Noncommercial 1.0.0. See [LICENSE](../LICENSE).
