/* ============================================================
   Holistic — support links
   One place to change them. Rendered into the Profile screen.
   ============================================================ */
(function (root) {
  'use strict';

  var SUPPORT = {
    upi: 'drsohilboi@ybl',
    upiName: 'Dr. Sohil Momin',
    github: 'https://github.com/sponsors/drsamonline',
    githubLabel: 'github.com/sponsors/drsamonline',
    kofi: 'https://ko-fi.com/matneo',
    kofiLabel: 'ko-fi.com/matneo',
    paypal: 'https://paypal.me/drsohilmomin?locale.x=en_GB&country.x=IN',
    paypalLabel: 'paypal.me/drsohilmomin',
    books: 'https://www.amazon.com/stores/author/B08ZT331LY/allbooks',
    booksLabel: 'Amazon author store',
    more: 'https://drsamonline.github.io/',
    moreLabel: 'drsamonline.github.io',
    email: 'sohilmomin2000@gmail.com',
    note: 'Free, offline, accountless — and staying that way. Nothing here is gated: no accounts, no tracking, no network requests.'
  };

  /* Other apps from the same hand, so the block is not only a payment ask. */
  var OTHER_APPS = [
    { name: 'Panchang', url: 'https://drsamonline.github.io/app-panchang/',
      note: 'A daily Indian almanac — tithi, nakshatra, rahu-kaal, computed offline.' },
    { name: 'Thermals', url: 'https://drsamonline.github.io/app-thermals/',
      note: 'Homoeopathic remedies by thermal reaction, quoted from the sources.' },
    { name: 'Organon Reader', url: 'https://drsamonline.github.io/app-organon-reader/',
      note: 'The Organon, sixth edition, Boericke translation — searchable, offline.' },
    { name: 'Ambient Sound Studio', url: 'https://drsamonline.github.io/ambient-sound-studio/',
      note: 'A private, offline ambient mixer in a single HTML file.' },
    { name: 'Accent Oracle', url: 'https://drsamonline.github.io/accent-oracle/',
      note: 'Four seconds of speech, on-device, with a band on how sure it is.' },
    { name: 'All4ONE', url: 'https://drsamonline.github.io/All4ONE/',
      note: '403 working tools in one portable Windows binary. No telemetry.' }
  ];

  root.HL_SUPPORT = { SUPPORT: SUPPORT, OTHER_APPS: OTHER_APPS };
})(typeof globalThis !== 'undefined' ? globalThis : this);
