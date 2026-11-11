/* ============================================================
   Holistic — app shell
   State, storage, routing, events, offline registration.
   ============================================================ */
(function (root) {
  'use strict';

  var C = root.HL_CORE;
  var D = root.HL_DATA;
  var U = root.HL_UI;

  var VERSION = '2.7.0';
  var KEY = 'holistic.profile.v2';
  var KEY_ALL = 'holistic.profiles.v1';
  var KEY_ROUTE = 'holistic.route.v1';
  var FIELDS = ['fullName', 'birthDate', 'birthTime', 'birthLocation', 'gender',
                'tzOffset', 'occupation', 'userQuestion'];
  var SCREENS = ['today', 'numbers', 'sky', 'couple', 'oracle', 'library', 'report', 'profile'];

  var state = { profile: null, profiles: [], active: 0, route: 'today', span: 30,
                couple: null, mode: 'tarot', lib: 'tarot', draw: null, spread: 1 };

  /* ---------- storage ---------- */

  function readStore() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return null;
      if (!p.birthDate || C.powerNumber(p.birthDate) === null) return null;
      return p;
    } catch (e) { return null; }
  }

  function writeStore(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); return true; }
    catch (e) { return false; }
  }

  function clearStore() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  function storageAvailable() {
    try {
      var k = '__hl_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  /* ---------- profile collection ---------- */

  function readAll() {
    try {
      var raw = localStorage.getItem(KEY_ALL);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && Array.isArray(o.items) && o.items.length) {
          var active = Math.min(Math.max(o.active || 0, 0), o.items.length - 1);
          return { items: o.items, active: active };
        }
      }
    } catch (e) { /* fall through to migration */ }

    var single = readStore();
    return single ? { items: [single], active: 0 } : { items: [], active: 0 };
  }

  function writeAll() {
    try {
      localStorage.setItem(KEY_ALL, JSON.stringify({ items: state.profiles, active: state.active }));
      return true;
    } catch (e) { return false; }
  }

  function useProfile(index) {
    state.active = Math.min(Math.max(index, 0), Math.max(state.profiles.length - 1, 0));
    state.profile = state.profiles[state.active] || null;
    fillForm(state.profile);
    renderAll();
    renderChips();
  }

  function renderChips() {
    var host = U.$('profileChips');
    if (!host) return;
    if (!state.profiles.length) {
      host.innerHTML = '<span class="sub">No profiles yet. Fill the form below and save.</span>';
      return;
    }
    host.innerHTML = state.profiles.map(function (p, i) {
      var label = (p.fullName || 'Unnamed').split(' ')[0];
      return '<button class="chip' + (i === state.active ? ' chip--violet' : '') +
        '" data-profile="' + i + '">' + U.esc(label) + '</button>';
    }).join('');
  }

  function newProfile() {
    state.profiles.push({ fullName: '', birthDate: '', birthTime: '', birthLocation: '',
                          gender: '', tzOffset: '330', occupation: '', userQuestion: '' });
    state.active = state.profiles.length - 1;
    state.profile = state.profiles[state.active];
    FIELDS.forEach(function (f) { var el = U.$(f); if (el) el.value = state.profiles[state.active][f] || ''; });
    renderChips();
    var name = U.$('fullName');
    if (name) name.focus();
    toast('New profile — fill it in and save.', 'ok');
  }

  function deleteProfile() {
    if (!state.profiles.length) { toast('No profile to delete.', 'error'); return; }
    if (!window.confirm('Delete this profile from this device?')) return;
    state.profiles.splice(state.active, 1);
    state.active = Math.min(state.active, Math.max(state.profiles.length - 1, 0));
    state.profile = state.profiles[state.active] || null;
    writeAll();
    useProfile(state.active);
    if (!state.profiles.length) {
      FIELDS.forEach(function (f) { var el = U.$(f); if (el) el.value = ''; });
    }
    toast('Profile deleted.', 'ok');
  }

  /* ---------- toast ---------- */

  var toastTimer = null;
  function toast(msg, kind) {
    var el = U.$('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast is-on' + (kind ? ' is-' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 3000);
  }

  /* ---------- routing ---------- */

  function setRoute(name) {
    if (SCREENS.indexOf(name) === -1) name = 'today';
    state.route = name;

    SCREENS.forEach(function (s) {
      var el = U.$('screen-' + s);
      if (el) el.classList.toggle('is-active', s === name);
    });

    document.querySelectorAll('.nav-item, .tab').forEach(function (b) {
      if (b.dataset.go === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    if (window.location.hash !== '#' + name) {
      try { history.replaceState(null, '', '#' + name); } catch (e) { /* file:// */ }
    }
    try { localStorage.setItem(KEY_ROUTE, name); } catch (e) { /* ignore */ }
    window.scrollTo(0, 0);
    render(name);
  }

  function render(name) {
    var p = state.profile;
    var now = new Date();
    try {
      if (name === 'today') U.renderToday(p, now);
      else if (name === 'numbers') U.renderNumbers(p, now);
      else if (name === 'sky') U.renderSky(p, now, state.span);
      else if (name === 'couple') U.renderCouple(state.couple);
      else if (name === 'oracle') U.renderOracle(state.draw);
      else if (name === 'library') U.renderLibrary(state.lib, U.$('libSearch') ? U.$('libSearch').value : '');
      else if (name === 'report') U.renderReport(p, now);
      else if (name === 'profile') fillForm(p);
    } catch (e) {
      /* keep the shell alive if one screen fails */
      console.error('render:' + name, e);
    }
  }

  function renderAll() {
    var now = new Date();
    U.renderToday(state.profile, now);
    U.renderNumbers(state.profile, now);
    U.renderSky(state.profile, now, state.span);
    U.renderReport(state.profile, now);
    U.renderCouple(state.couple);
  }

  /* ---------- profile form ---------- */

  function populateCities() {
    var sel = U.$('birthLocation');
    if (!sel) return;
    var current = sel.value;
    var opts = D.CITIES.map(function (c) {
      return '<option value="' + U.esc(c.name) + '">' + U.esc(c.name) + '</option>';
    }).join('');
    sel.innerHTML = '<option value="">Not specified</option>' + opts;
    if (current) sel.value = current;
  }

  function fillForm(p) {
    FIELDS.forEach(function (f) {
      var el = U.$(f);
      if (el) el.value = (p && p[f]) || '';
    });
    U.setText('appVersion', VERSION);
    U.setText('footVersion', 'v' + VERSION);
    U.setText('storageState', storageAvailable() ? 'Local, this browser' : 'Blocked — session only');
    U.setText('offlineState', ('serviceWorker' in navigator) ? 'Enabled' : 'Single-file mode');

    /* keep an unknown city visible rather than silently dropping it */
    var sel = U.$('birthLocation');
    if (sel && p && p.birthLocation && !D.CITIES.some(function (c) { return c.name === p.birthLocation; })) {
      var opt = document.createElement('option');
      opt.value = p.birthLocation;
      opt.textContent = p.birthLocation + ' (not in list)';
      sel.appendChild(opt);
      sel.value = p.birthLocation;
    }
  }

  function collectForm() {
    var p = {};
    FIELDS.forEach(function (f) {
      var el = U.$(f);
      p[f] = el ? String(el.value || '').trim() : '';
    });
    return p;
  }

  function saveProfile() {
    var p = collectForm();
    if (!p.fullName) { toast('Add your name first.', 'error'); return; }
    if (!p.birthDate) { toast('Add your birth date.', 'error'); return; }
    if (C.powerNumber(p.birthDate) === null) { toast('That birth date is not valid.', 'error'); return; }

    if (!state.profiles.length) {
      state.profiles.push(p);
      state.active = 0;
    } else {
      state.profiles[state.active] = p;
    }
    state.profile = p;
    var ok = writeAll();
    writeStore(p);
    renderAll();
    renderChips();
    toast(ok ? 'Profile saved.' : 'Saved for this session only — storage is blocked.', ok ? 'ok' : 'error');
  }

  function resetAll() {
    if (!window.confirm('Erase your profile and every reading on this device?')) return;
    clearStore();
    try { localStorage.removeItem(KEY_ALL); } catch (e) { /* ignore */ }
    state.profiles = [];
    state.active = 0;
    state.profile = null;
    state.couple = null;
    FIELDS.forEach(function (f) { var el = U.$(f); if (el) el.value = ''; });
    U.$('coupleA').value = '';
    U.$('coupleB').value = '';
    U.renderOracle(null);
    renderAll();
    renderChips();
    setRoute('profile');
    toast('Everything erased.', 'ok');
  }

  /* ---------- backup ---------- */

  function exportBackup() {
    if (!state.profile) { toast('Nothing to export yet.', 'error'); return; }
    var blob = new Blob([JSON.stringify({ app: 'holistic', version: VERSION, profile: state.profile }, null, 2)],
      { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'holistic-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Backup downloaded.', 'ok');
  }

  function importBackup() {
    var input = U.$('importFile');
    if (input) input.click();
  }

  function handleImport(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var p = data.profile || data;
        if (!p || !p.birthDate || C.powerNumber(p.birthDate) === null) {
          toast('That file has no valid profile.', 'error');
          return;
        }
        FIELDS.forEach(function (f) { if (typeof p[f] !== 'string') p[f] = ''; });
        state.profile = p;
        writeStore(p);
        fillForm(p);
        renderAll();
        toast('Profile restored.', 'ok');
      } catch (e) {
        toast('Could not read that file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ---------- couple ---------- */

  function compareCouple() {
    var a = U.$('coupleA').value;
    var b = U.$('coupleB').value;
    if (!a || !b) { toast('Both birth dates are needed.', 'error'); return; }
    if (C.powerNumber(a) === null || C.powerNumber(b) === null) {
      toast('One of those dates is not valid.', 'error');
      return;
    }
    state.couple = C.coupleScore(a, b);
    if (state.couple) { state.couple.dobA = a; state.couple.dobB = b; }
    U.renderCouple(state.couple);
    toast('Compared.', 'ok');
  }

  function clearCouple() {
    U.$('coupleA').value = '';
    U.$('coupleB').value = '';
    state.couple = null;
    U.renderCouple(null);
  }

  /* ---------- oracle ---------- */

  function askQuestion() {
    var q = String(U.$('oracleQ').value || '').trim();
    if (!q) { toast('Write a question first.', 'error'); return null; }
    return q;
  }

  var SPREAD_POSITIONS = {
    1: ['The card'],
    3: ['Past', 'Present', 'Future'],
    5: ['You', 'Them', 'The bond', 'What helps', 'What blocks']
  };

  function currentMode() { return state.mode || 'tarot'; }

  function drawFor(mode, seed) {
    var deck = C.fullDeck();
    if (mode === 'tarot') {
      var n = state.spread || 1;
      var drawn = C.drawCards(deck, n, seed + '|tarot');
      var pos = SPREAD_POSITIONS[n] || [];
      return {
        type: 'Tarot · ' + (n === 1 ? 'single card' : n + '-card spread'),
        cards: drawn.map(function (c, i) {
          return { pos: pos[i] || ('Card ' + (i + 1)), name: c.name, reading: c.reading };
        }),
        footnote: n === 1
          ? 'Drawn once per question — rephrasing gives a different card.'
          : 'Each card is drawn without replacement, so a spread never repeats a card.'
      };
    }
    if (mode === 'iching') {
      var cast = C.castHexagram(C.seededRandom(seed + '|iching'));
      var hex = C.hexagramByBits(cast.bits);
      var out = {
        type: 'I Ching · three coins',
        title: hex.name,
        sub: 'Hexagram ' + hex.n + ' of 64',
        hexBits: cast.bits,
        glyph: '<div class="stack">' + U.hexGlyph(cast.bits, cast.changedBits) +
          '<div class="cap">' + (cast.changing ? cast.changing + ' changing' : 'static') + '</div></div>',
        body: hex.reading,
        footnote: cast.changing
          ? cast.changing + ' changing line' + (cast.changing > 1 ? 's' : '') + ' — the marked lines are where the situation is moving.'
          : 'No changing lines: read the hexagram as a description of the situation, not a forecast.'
      };
      if (cast.changing) {
        var next = C.hexagramByBits(cast.changedBits);
        if (next && next.n !== hex.n) {
          out.second = { label: 'Moving toward · ' + next.n + ' ' + next.name, text: next.reading };
        }
      }
      return out;
    }
    if (mode === 'runes') {
      var r = C.seededPick(D.RUNES, seed + '|runes');
      var reversed = C.seededRandom(seed + '|rev')() < 0.4;
      return {
        type: 'Rune · Elder Futhark',
        title: r.item.name + (reversed ? ' (reversed)' : ''),
        sub: r.item.gloss,
        glyph: '<span class="rune-glyph" style="font-size:40px">' + r.item.glyph + '</span>',
        body: reversed ? r.item.reversed : r.item.upright,
        footnote: reversed
          ? 'Drawn reversed — read it as the same force turned inward or delayed.'
          : 'Drawn upright.'
      };
    }
    var a = C.seededPick(D.ORACLE_8, seed + '|straight');
    return {
      type: 'Straight answer',
      title: 'The short version',
      body: a.item,
      footnote: 'A coin flip with better typography. Use it to break a tie you have already decided.'
    };
  }

  function drawNow() {
    var q = askQuestion();
    if (!q) return;
    state.draw = drawFor(currentMode(), q);
    U.renderOracle(state.draw);
    updateDrawButtons();
  }

  function drawDaily() {
    var mode = currentMode();
    var deck = mode === 'tarot' ? C.fullDeck() : mode === 'runes' ? D.RUNES : D.HEXAGRAMS;
    var today = C.dailyIndex(deck, new Date(), mode);
    var seed = 'daily|' + today.day + '|' + mode;
    var d = drawFor(mode, seed);
    d.footnote = 'Today\u2019s draw — fixed for ' + today.day + ', and it cannot be re-rolled.';
    state.draw = d;
    U.renderOracle(d);
    updateDrawButtons();
    toast('Today\u2019s draw.', 'ok');
  }

  function clarify() {
    var d = state.draw;
    if (!d || !d.cards) { toast('Draw a card first.', 'error'); return; }
    var seed = (U.$('oracleQ').value || '') + '|clarify|' + d.cards.length;
    var extra = C.drawCards(C.fullDeck(), 1, seed)[0];
    d.cards.push({ pos: 'Clarifying', name: extra.name, reading: extra.reading });
    d.footnote = 'A clarifying card answers the first one, not the original question.';
    U.renderOracle(d);
  }

  function setSpread(n) {
    state.spread = n;
    document.querySelectorAll('[data-spread]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(+b.dataset.spread === n));
    });
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    });
    var row = U.$('spreadRow');
    if (row) row.hidden = mode !== 'tarot';
    U.renderOracle(null);
    state.draw = null;
    updateDrawButtons();
  }

  function updateDrawButtons() {
    var d = state.draw;
    var clarify = U.$('clarifyBtn');
    if (clarify) clarify.hidden = !(d && d.cards && d.cards.length === 1 && currentMode() === 'tarot');
    var share = U.$('shareBtn');
    if (share) share.hidden = !d;
  }

  function setLib(kind) {
    state.lib = kind;
    document.querySelectorAll('[data-lib]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lib === kind));
    });
    U.renderLibrary(kind, U.$('libSearch') ? U.$('libSearch').value : '');
  }

  /* ---------- share ---------- */

  function drawSpec(d) {
    var today = new Date();
    var stamp = today.getDate() + ' ' + D.MONTHS[today.getMonth()].slice(0, 3) + ' ' + today.getFullYear();
    var spec = {
      eyebrow: d.type,
      title: d.title || 'Holistic',
      body: d.body || '',
      footer: stamp,
      hexBits: d.hexBits || null
    };

    if (d.cards && d.cards.length) {
      var first = d.cards[0];
      spec.title = first.name;
      spec.body = first.reading;
      if (d.cards.length > 1) {
        spec.body += '\n\nAlso drawn: ' +
          d.cards.slice(1).map(function (c) { return c.name; }).join(' · ') + '.';
      }
      spec.eyebrow = 'TAROT · ' + (d.cards.length === 1 ? 'SINGLE CARD' : d.cards.length + '-CARD SPREAD');
    }
    if (d.second) spec.body += '\n\nMoving toward: ' + d.second.label.replace('Moving toward · ', '');
    return spec;
  }

  function shareDraw() {
    if (!state.draw) { toast('Draw something first.', 'error'); return; }
    var canvas = root.HL_SHARE.renderCard(drawSpec(state.draw));
    root.HL_SHARE.save(canvas, 'holistic-reading.png').then(function (how) {
      toast(how === 'shared' ? 'Shared.' : 'Image saved.', 'ok');
    }).catch(function () {
      toast('Could not create the image.', 'error');
    });
  }

  function shareReport() {
    var p = state.profile;
    if (!p || C.powerNumber(p.birthDate) === null) {
      toast('Complete your profile first.', 'error');
      return;
    }
    var now = new Date();
    var power = C.powerNumber(p.birthDate);
    var info = D.NUMEROLOGY[power];
    var zodiac = C.zodiac(p.birthDate);
    var ms = C.moonSign(p.birthDate, p.birthTime, parseInt(p.tzOffset, 10));
    var mp = C.moonPhase(now);

    var bits = [
      'Power number #' + power + ' · ' + info.name,
      zodiac + ' sun' + (ms ? ' · ' + ms.sign + ' moon' : ''),
      D.MOON_PHASES[mp.index].name + ' · ' + Math.round(mp.illumination * 100) + '% lit'
    ];

    var canvas = root.HL_SHARE.renderCard({
      eyebrow: 'READING',
      title: String(p.fullName || 'Unnamed').split(' ')[0],
      body: bits.join('\n') ,
      footer: now.getDate() + ' ' + D.MONTHS[now.getMonth()].slice(0, 3) + ' ' + now.getFullYear(),
      accent: info.colour
    });

    root.HL_SHARE.save(canvas, 'holistic-profile.png').then(function (how) {
      toast(how === 'shared' ? 'Shared.' : 'Image saved.', 'ok');
    }).catch(function () {
      toast('Could not create the image.', 'error');
    });
  }

  /* ---------- text export ---------- */

  function slug(name) {
    return String(name || 'reading').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reading';
  }

  function exportMd() {
    var text = root.HL_EXPORT.markdown(state.profile, state.draw, new Date());
    if (!text) { toast('Complete your profile first.', 'error'); return; }
    root.HL_EXPORT.download(text, 'holistic-' + slug(state.profile.fullName) + '.md', 'text/markdown;charset=utf-8');
    toast('Markdown saved.', 'ok');
  }

  function exportRtf() {
    var text = root.HL_EXPORT.rtf(state.profile, state.draw, new Date());
    if (!text) { toast('Complete your profile first.', 'error'); return; }
    root.HL_EXPORT.download(text, 'holistic-' + slug(state.profile.fullName) + '.rtf', 'application/rtf');
    toast('RTF saved.', 'ok');
  }

  function exportDrawMd() {
    if (!state.draw) { toast('Draw something first.', 'error'); return; }
    var text = root.HL_EXPORT.markdown(state.profile, state.draw, new Date());
    if (!text) { toast('Complete your profile first.', 'error'); return; }
    root.HL_EXPORT.download(text, 'holistic-draw.md', 'text/markdown;charset=utf-8');
    toast('Markdown saved.', 'ok');
  }

  function exportDrawRtf() {
    if (!state.draw) { toast('Draw something first.', 'error'); return; }
    var text = root.HL_EXPORT.rtf(state.profile, state.draw, new Date());
    if (!text) { toast('Complete your profile first.', 'error'); return; }
    root.HL_EXPORT.download(text, 'holistic-draw.rtf', 'application/rtf');
    toast('RTF saved.', 'ok');
  }

  function exportDays() {
    var p = state.profile;
    if (!p || C.powerNumber(p.birthDate) === null) {
      toast('Complete your profile first.', 'error');
      return;
    }
    var year = new Date().getFullYear();
    var rows = [['date', 'weekday', 'month', 'day', 'personal_day']];
    for (var m = 0; m < 12; m++) {
      C.luckyDates(p.birthDate, year, m).forEach(function (day) {
        var d = new Date(Date.UTC(year, m, day));
        rows.push([
          C.toISO( Date.UTC(year, m, day) ),
          D.WEEKDAYS[d.getUTCDay()],
          D.MONTHS[m],
          String(day),
          String(C.reduceSingle(C.powerNumber(p.birthDate)))
        ]);
      });
    }
    var csv = rows.map(function (r) { return r.join(','); }).join('\n');
    root.HL_EXPORT.download(csv, 'holistic-personal-days-' + year + '.csv', 'text/csv;charset=utf-8');
    toast('CSV saved.', 'ok');
  }

  /* ---------- support ---------- */

  function renderSupport() {
    var host = U.$('otherApps');
    if (!host || !root.HL_SUPPORT) return;
    host.innerHTML = root.HL_SUPPORT.OTHER_APPS.map(function (a) {
      return '<a class="app-link" href="' + U.esc(a.url) + '" target="_blank" rel="noopener">' +
        '<div class="nm">' + U.esc(a.name) + '</div>' +
        '<div class="nt">' + U.esc(a.note) + '</div></a>';
    }).join('');
  }

  function copyUpi() {
    var id = root.HL_SUPPORT ? root.HL_SUPPORT.SUPPORT.upi : '';
    if (!id) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id).then(
        function () { toast('UPI ID copied.', 'ok'); },
        function () { toast('Clipboard blocked — select it manually.', 'error'); }
      );
    } else {
      toast('Clipboard not available.', 'error');
    }
  }

  /* ---------- report ---------- */

  function printReport() {
    U.renderReport(state.profile, new Date());
    setTimeout(function () { window.print(); }, 120);
  }

  function copyReport() {
    var text = U.reportText(state.profile, new Date());
    if (!text) { toast('Nothing to copy yet.', 'error'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast('Copied to clipboard.', 'ok'); },
        function () { toast('Clipboard blocked — select the report manually.', 'error'); }
      );
    } else {
      toast('Clipboard not available in this browser.', 'error');
    }
  }

  /* ---------- events ---------- */

  var ACTIONS = {
    save: saveProfile,
    reset: resetAll,
    'profile-new': newProfile,
    'profile-delete': deleteProfile,
    export: exportBackup,
    import: importBackup,
    couple: compareCouple,
    'couple-clear': clearCouple,
    draw: drawNow,
    clarify: clarify,
    'share-draw': shareDraw,
    'share-report': shareReport,
    'export-md': exportMd,
    'export-rtf': exportRtf,
    'export-draw-md': exportDrawMd,
    'export-draw-rtf': exportDrawRtf,
    'print-a5': printA5,
    'export-days': exportDays,
    'copy-upi': copyUpi,
    'draw-daily': drawDaily,
    print: printReport,
    'copy-report': copyReport
  };

  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      setRoute(go.dataset.go);
      return;
    }

    var act = e.target.closest('[data-action]');
    if (act && ACTIONS[act.dataset.action]) {
      e.preventDefault();
      ACTIONS[act.dataset.action]();
      return;
    }

    var mode = e.target.closest('[data-mode]');
    if (mode) {
      e.preventDefault();
      setMode(mode.dataset.mode);
      return;
    }

    var prof = e.target.closest('[data-profile]');
    if (prof) {
      e.preventDefault();
      useProfile(parseInt(prof.dataset.profile, 10) || 0);
      return;
    }

    var sp = e.target.closest('[data-spread]');
    if (sp) {
      e.preventDefault();
      setSpread(parseInt(sp.dataset.spread, 10) || 1);
      return;
    }

    var suit = e.target.closest('[data-suit]');
    if (suit) {
      e.preventDefault();
      U.setSuitFilter(suit.dataset.suit);
      U.renderLibrary(state.lib, U.$('libSearch') ? U.$('libSearch').value : '');
      return;
    }

    var lib = e.target.closest('[data-lib]');
    if (lib) {
      e.preventDefault();
      setLib(lib.dataset.lib);
      return;
    }

    var span = e.target.closest('[data-span]');
    if (span) {
      e.preventDefault();
      state.span = parseInt(span.dataset.span, 10) || 30;
      document.querySelectorAll('[data-span]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === span));
      });
      U.renderSky(state.profile, new Date(), state.span);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var t = U.$('toast');
      if (t) t.classList.remove('is-on');
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.target && e.target.isContentEditable) return;

    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= SCREENS.length) {
      e.preventDefault();
      setRoute(SCREENS[n - 1]);
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'libSearch') {
      U.renderLibrary(state.lib, e.target.value);
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'importFile') {
      handleImport(e.target.files && e.target.files[0]);
      e.target.value = '';
    }
  });

  window.addEventListener('hashchange', function () {
    var name = (window.location.hash || '').replace('#', '');
    if (name && name !== state.route) setRoute(name);
  });

  /* ---------- offline badge ---------- */

  function updateNetBadge() {
    var el = U.$('netBadge');
    if (!el) return;
    el.hidden = navigator.onLine !== false;
  }

  /* ---------- print ---------- */

  function printA5() {
    U.renderReport(state.profile, new Date());
    document.body.classList.add('a5');
    setTimeout(function () {
      window.print();
      setTimeout(function () { document.body.classList.remove('a5'); }, 400);
    }, 120);
  }

  /* ---------- boot ---------- */

  function init() {
    var all = readAll();
    state.profiles = all.items;
    state.active = all.active;
    state.profile = state.profiles[state.active] || null;
    populateCities();
    if (state.profile) fillForm(state.profile);

    var initial = (window.location.hash || '').replace('#', '');
    if (!initial) {
      try { initial = localStorage.getItem(KEY_ROUTE) || ''; } catch (e) { initial = ''; }
    }
    setRoute(SCREENS.indexOf(initial) > -1 ? initial : 'today');
    renderAll();
    fillForm(state.profile);
    renderChips();
    renderSupport();
    updateNetBadge();
    window.addEventListener('online', updateNetBadge);
    window.addEventListener('offline', updateNetBadge);

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline still works: no network needed */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* exposed for tests */
  root.HL_APP = {
    version: VERSION,
    actions: Object.keys(ACTIONS),
    state: state,
    setRoute: setRoute,
    render: render,
    renderAll: renderAll,
    saveProfile: saveProfile,
    resetAll: resetAll,
    compareCouple: compareCouple,
    drawNow: drawNow, drawDaily: drawDaily, setMode: setMode, setLib: setLib,
    clarify: clarify, setSpread: setSpread, shareDraw: shareDraw, shareReport: shareReport,
    newProfile: newProfile, deleteProfile: deleteProfile, useProfile: useProfile,
    exportMd: exportMd, exportRtf: exportRtf, copyUpi: copyUpi,
    exportDrawMd: exportDrawMd, exportDrawRtf: exportDrawRtf, printA5: printA5, exportDays: exportDays,
    copyReport: copyReport,
    exportBackup: exportBackup,
    handleImport: handleImport
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
