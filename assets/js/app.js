/* ============================================================
   Holistic — app shell
   State, storage, routing, events, offline registration.
   ============================================================ */
(function (root) {
  'use strict';

  var C = root.HL_CORE;
  var D = root.HL_DATA;
  var U = root.HL_UI;

  var VERSION = '2.1.0';
  var KEY = 'holistic.profile.v2';
  var FIELDS = ['fullName', 'birthDate', 'birthTime', 'birthLocation', 'gender',
                'occupation', 'userQuestion'];
  var SCREENS = ['today', 'numbers', 'sky', 'couple', 'oracle', 'library', 'report', 'profile'];

  var state = { profile: null, route: 'today', span: 30, couple: null,
                mode: 'tarot', lib: 'tarot', draw: null };

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

  function fillForm(p) {
    FIELDS.forEach(function (f) {
      var el = U.$(f);
      if (el) el.value = (p && p[f]) || '';
    });
    U.setText('appVersion', VERSION);
    U.setText('footVersion', 'v' + VERSION);
    U.setText('storageState', storageAvailable() ? 'Local, this browser' : 'Blocked — session only');
    U.setText('offlineState', ('serviceWorker' in navigator) ? 'Enabled' : 'Single-file mode');
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

    state.profile = p;
    var ok = writeStore(p);
    renderAll();
    render('profile');
    toast(ok ? 'Profile saved.' : 'Saved for this session only — storage is blocked.', ok ? 'ok' : 'error');
  }

  function resetAll() {
    if (!window.confirm('Erase your profile and every reading on this device?')) return;
    clearStore();
    state.profile = null;
    state.couple = null;
    FIELDS.forEach(function (f) { var el = U.$(f); if (el) el.value = ''; });
    U.$('coupleA').value = '';
    U.$('coupleB').value = '';
    U.renderOracle(null);
    renderAll();
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

  function currentMode() { return state.mode || 'tarot'; }

  function drawFor(mode, seed) {
    var deck = C.fullDeck();
    if (mode === 'tarot') {
      var card = C.seededPick(deck, seed + '|tarot').item;
      return {
        type: 'Tarot · ' + card.suit,
        title: card.name,
        body: card.reading,
        footnote: 'Drawn once per question — rephrasing gives a different card.'
      };
    }
    if (mode === 'iching') {
      var cast = C.castHexagram(C.seededRandom(seed + '|iching'));
      var hex = C.hexagramByBits(cast.bits);
      var out = {
        type: 'I Ching · three coins',
        title: hex.name,
        sub: 'Hexagram ' + hex.n + ' of 64',
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
    toast('Today\u2019s draw.', 'ok');
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    });
    U.renderOracle(null);
    state.draw = null;
  }

  function setLib(kind) {
    state.lib = kind;
    document.querySelectorAll('[data-lib]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lib === kind));
    });
    U.renderLibrary(kind, U.$('libSearch') ? U.$('libSearch').value : '');
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
    export: exportBackup,
    import: importBackup,
    couple: compareCouple,
    'couple-clear': clearCouple,
    draw: drawNow,
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

  /* ---------- boot ---------- */

  function init() {
    state.profile = readStore();
    if (state.profile) fillForm(state.profile);

    var initial = (window.location.hash || '').replace('#', '');
    setRoute(SCREENS.indexOf(initial) > -1 ? initial : 'today');
    renderAll();
    fillForm(state.profile);

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
    copyReport: copyReport,
    exportBackup: exportBackup,
    handleImport: handleImport
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
