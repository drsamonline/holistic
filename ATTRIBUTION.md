# Sources, traditions and licences

Holistic computes everything it shows from four inputs: a name, a birth date, a birth time and a city. Nothing in the app is copied wholesale from a copyrighted work. Where a system rests on a tradition, the tradition and its status are named here.

## Lunar phase calculation

The phase model uses the mean synodic month (29.530588853 days) anchored to the new moon of **6 January 2000, 18:14 UTC**, which is the standard reference epoch used for simple lunar-phase calculations. The eight-phase thresholds are equal divisions of the synodic month.

This is an approximation: true phase varies by up to roughly seven hours from the mean because of the Moon's elliptical orbit. It is accurate enough for a reflection app and not accurate enough for anything astronomical.

- Status: mathematical, public domain.
- Reference: Meeus, *Astronomical Algorithms*, ch. 49 (phase and illumination).

## Pythagorean numerology

Letter values follow the Pythagorean system: A–I map to 1–9, J–R map to 1–9, S–Z map to 1–8. The "power number" reduces the sum of birth day, month and year, preserving 11 and 22 as master numbers. Personal year, expression number and soul urge are derived the same way.

Numerology is not evidence-based. It is presented here as a vocabulary, not a measurement.

- Status: traditional, public domain.

## Sun-sign astrology

Twelve conventional date ranges, from the tropical zodiac. Sign, element and modality only — no houses, no aspects, no ephemeris.

- Status: traditional, public domain.

## Biorhythm

The 23-day physical, 28-day emotional and 33-day intellectual cycles as proposed by Wilhelm Fliess and popularised in the early twentieth century. Multiple controlled studies since the 1970s have failed to find the claimed effect. It is included as a novelty, and labelled as such in the app.

- Status: discredited; retained deliberately and disclosed.

## Tarot — major arcana

Card names and the sequence of 22 trumps are traditional and in the public domain (Rider–Waite–Smith deck, 1909, artwork by Pamela Colman Smith; the *images* remain under a separate licence and are **not** used here). Every interpretation line in `assets/js/data.js` was written for this project.

- Status: names public domain; text original to this project.

## I Ching

The eight trigrams are traditional Chinese cosmology and in the public domain. The interpretation lines are original to this project. The app uses trigrams only, not the full sixty-four hexagrams, and says so.

- Status: traditional, public domain; text original.

## Magic 8-Ball

The phrase list is the familiar 20-answer set popularised by Alabe Crafts (1950). It is used here as a cultural reference with rewritten, plainer wording in `data.js`. No branding, no logo, no trade dress is reproduced.

- Status: trademark belongs to its owner; no affiliation claimed.

## Typography

The app itself loads **no fonts** — it uses the system font stack, which is one reason it makes zero network requests. The landing page (`landing/index.html`) loads Instrument Serif, Inter and JetBrains Mono from Google Fonts under the SIL Open Font License 1.1. The landing page is the only part of the project that touches the network.

## Code

All code is original, written for this project, and licensed under the **PolyForm Noncommercial 1.0.0** (see [LICENSE](LICENSE)). No third-party JavaScript is bundled or loaded at runtime — no framework, no polyfill, no analytics, no icon font. The app icons in `assets/` were generated from `assets/icon.svg`, which is original.

## If you believe something here is misattributed

Open an issue. Attribution corrections are treated as bugs, not disagreements.
