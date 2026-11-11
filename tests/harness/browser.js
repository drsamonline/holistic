/* Browser test harness. Injected into a generated copy of index.html.
   Prints TEST PASS / TEST FAIL lines into #test-out. */
(function () {
  'use strict';

  var results = [];
  var errors = [];

  function ok(name, cond, detail) {
    results.push({ name: name, pass: !!cond, detail: detail || '' });
  }

  function eq(name, actual, expected) {
    ok(name, actual === expected, 'got ' + JSON.stringify(actual) + ' expected ' + JSON.stringify(expected));
  }

  window.addEventListener('error', function (e) {
    errors.push('window.error: ' + (e.message || 'unknown'));
  });

  var origError = console.error;
  console.error = function () {
    errors.push('console.error: ' + Array.prototype.slice.call(arguments).join(' '));
    origError.apply(console, arguments);
  };

  function run() {
    var A = window.HL_APP, U = window.HL_UI, C = window.HL_CORE, D = window.HL_DATA;

    if (!A || !U || !C || !D) {
      finish();
      return;
    }

    /* --- 1. every element id referenced by ui.js must exist --- */
    var missing = {};
    var origGet = document.getElementById.bind(document);
    document.getElementById = function (id) {
      var el = origGet(id);
      if (!el) missing[id] = (missing[id] || 0) + 1;
      return el;
    };

    /* --- 2. screens and navigation --- */
    var screens = ['today', 'numbers', 'sky', 'couple', 'oracle', 'library', 'report', 'profile'];
    screens.forEach(function (s) {
      ok('screen exists: ' + s, !!origGet('screen-' + s));
    });

    var navCount = document.querySelectorAll('.nav-item').length;
    var tabCount = document.querySelectorAll('.tab').length;
    eq('rail has 8 items', navCount, 8);
    eq('tab bar has 5 items', tabCount, 5);

    document.querySelectorAll('[data-go]').forEach(function (b) {
      ok('nav target valid: ' + b.dataset.go, screens.indexOf(b.dataset.go) > -1, b.dataset.go);
    });

    /* --- 3. every data-action has a handler --- */
    var actions = Array.prototype.slice.call(document.querySelectorAll('[data-action]'))
      .map(function (b) { return b.dataset.action; });
    ok('action buttons present', actions.length >= 8, actions.join(','));
    actions.forEach(function (a) {
      ok('action handled: ' + a, A.actions.indexOf(a) > -1, 'not in ACTIONS: ' + a);
    });

    /* --- 4. profile + render everything --- */
    A.state.profile = {
      fullName: 'Sohil Momin', birthDate: '1990-01-15', birthTime: '06:45',
      birthLocation: 'Pune', gender: 'male', occupation: 'Doctor',
      userQuestion: 'Career and health'
    };
    A.renderAll();

    /* today */
    A.setRoute('today');
    ok('today: greeting has name', origGet('h-today').textContent.indexOf('Sohil') > -1, origGet('h-today').textContent);
    ok('today: moon named', origGet('todayMoonName').textContent.length > 4, origGet('todayMoonName').textContent);
    ok('today: moon svg drawn', origGet('todayMoonDisc').querySelector('svg path') !== null);
    ok('today: bio physical numeric', /^\d+%$/.test(origGet('bioPhysicalVal').textContent), origGet('bioPhysicalVal').textContent);
    ok('today: bio bar width set', origGet('bioPhysicalBar').style.width !== '');
    ok('today: phases filled', origGet('todayPhases').querySelectorAll('.kv-row').length === 2);
    ok('today: power chip', origGet('todayPowerChip').textContent.indexOf('#') === 0, origGet('todayPowerChip').textContent);

    /* numbers */
    A.setRoute('numbers');
    eq('numbers: power number', origGet('powerNum').textContent, '8');
    ok('numbers: gauge offset set', origGet('powerArc').style.strokeDashoffset !== '');
    ok('numbers: name number computed', origGet('nameNumber').textContent === '1', origGet('nameNumber').textContent);
    ok('numbers: soul urge computed', origGet('soulNumber').textContent === '3', origGet('soulNumber').textContent);
    ok('numbers: personal year shown', /^\d+$/.test(origGet('personalYear').textContent), origGet('personalYear').textContent);
    ok('numbers: lucky chips', origGet('luckyDates').querySelectorAll('.chip').length > 0);
    ok('numbers: strengths text', origGet('powerStrengths').textContent.length > 10);

    /* sky */
    A.setRoute('sky');
    eq('sky: zodiac', origGet('zodiacName').textContent, 'Capricorn');
    eq('sky: element', origGet('zodiacElement').textContent, 'Earth');
    ok('sky: chart drawn', origGet('bioChart').querySelectorAll('polyline').length === 3,
      'polylines=' + origGet('bioChart').querySelectorAll('polyline').length);
    ok('sky: phase rows', origGet('skyPhases').querySelectorAll('.kv-row').length === 4);

    /* span switch */
    var btn = document.querySelector('[data-span="90"]');
    btn.click();
    ok('sky: 90-day span rerenders', origGet('bioChart').querySelectorAll('polyline').length === 3);
    ok('sky: span pressed state', btn.getAttribute('aria-pressed') === 'true');

    /* moon sign */
    A.setRoute('sky');
    ok('sky: moon sign resolved', /^[A-Z][a-z]+$/.test(origGet('moonSignName').textContent),
      origGet('moonSignName').textContent);
    ok('sky: moon sign note mentions the model', origGet('moonSignNote').textContent.length > 20);

    /* couple */
    A.setRoute('couple');
    origGet('coupleA').value = '1990-01-15';
    origGet('coupleB').value = '1988-07-04';
    A.compareCouple();
    ok('couple: output shown', origGet('coupleOut').hidden === false);
    ok('couple: score rendered', /^\d+%$/.test(origGet('coupleScore').textContent), origGet('coupleScore').textContent);
    ok('couple: breakdown rows', origGet('coupleBreakdown').querySelectorAll('.kv-row').length === 6);
    ok('couple: verdict text', origGet('coupleVerdict').textContent.length > 2);
    ok('couple: biorhythm sync shown', origGet('coupleSync').querySelectorAll('.kv-row').length === 4,
      'rows=' + origGet('coupleSync').querySelectorAll('.kv-row').length);
    ok('couple: sync has a percentage', /\d+%/.test(origGet('coupleSync').textContent));

    /* couple clear */
    document.querySelector('[data-action="couple-clear"]').click();
    ok('couple: clear hides output', origGet('coupleOut').hidden === true);

    /* oracle — four modes */
    A.setRoute('oracle');
    origGet('oracleQ').value = 'Should I take the offer?';
    A.setMode('tarot');
    A.drawNow();
    ok('oracle: tarot draws', origGet('oracleOut').hidden === false);
    var first = origGet('oracleOut').textContent;
    A.drawNow();
    eq('oracle: same question same card', origGet('oracleOut').textContent, first);

    A.setMode('iching');
    ok('oracle: mode clears output', origGet('oracleOut').hidden === true);
    A.drawNow();
    var ich = origGet('oracleOut').textContent;
    ok('oracle: iching names a hexagram', /Hexagram \d+ of 64/.test(ich), ich.slice(0, 80));
    ok('oracle: iching draws six lines', origGet('oracleOut').querySelectorAll('.hex i').length === 6,
      'lines=' + origGet('oracleOut').querySelectorAll('.hex i').length);
    A.drawNow();
    eq('oracle: iching is reproducible', origGet('oracleOut').textContent, ich);

    A.setMode('runes');
    A.drawNow();
    ok('oracle: rune draws', origGet('oracleOut').textContent.indexOf('Rune') > -1);
    ok('oracle: rune has a glyph', origGet('oracleOut').querySelector('.rune-glyph') !== null);

    A.setMode('straight');
    A.drawNow();
    ok('oracle: straight answer', origGet('oracleOut').textContent.indexOf('Straight answer') > -1);

    /* spreads */
    A.setMode('tarot');
    A.setSpread(3);
    A.drawNow();
    eq('oracle: three-card spread', origGet('oracleOut').querySelectorAll('.spread-card').length, 3);
    var names3 = Array.prototype.map.call(
      origGet('oracleOut').querySelectorAll('.sc-name'), function (n) { return n.textContent; });
    eq('oracle: spread cards are distinct', new Set(names3).size, 3);

    A.setSpread(5);
    A.drawNow();
    eq('oracle: five-card spread', origGet('oracleOut').querySelectorAll('.spread-card').length, 5);

    A.setSpread(1);
    A.drawNow();
    eq('oracle: single spread', origGet('oracleOut').querySelectorAll('.spread-card').length, 1);
    ok('oracle: clarify button visible for a single card', origGet('clarifyBtn').hidden === false);
    A.clarify();
    eq('oracle: clarify adds a card', origGet('oracleOut').querySelectorAll('.spread-card').length, 2);
    ok('oracle: clarify is labelled', origGet('oracleOut').textContent.indexOf('Clarifying') > -1);

    A.setSpread(3);
    A.drawNow();
    ok('oracle: clarify hidden on a spread', origGet('clarifyBtn').hidden === true);
    A.setSpread(1);

    /* daily draw is stable within a day */
    A.setMode('tarot');
    A.drawDaily();
    var day1 = origGet('oracleOut').textContent;
    A.drawDaily();
    eq('oracle: daily draw is stable', origGet('oracleOut').textContent, day1);
    ok('oracle: daily says it cannot re-roll', /cannot be re-rolled/.test(day1));

    /* library */
    A.setRoute('library');
    A.setLib('tarot');
    eq('library: tarot has 78 rows', origGet('libList').querySelectorAll('.lib-row').length, 78);
    A.setLib('iching');
    eq('library: iching has 64 rows', origGet('libList').querySelectorAll('.lib-row').length, 64);
    ok('library: hexagram glyphs render', origGet('libList').querySelectorAll('.hex').length === 64);
    A.setLib('runes');
    eq('library: runes has 24 rows', origGet('libList').querySelectorAll('.lib-row').length, 24);

    origGet('libSearch').value = 'Fehu';
    origGet('libSearch').dispatchEvent(new Event('input', { bubbles: true }));
    eq('library: search filters', origGet('libList').querySelectorAll('.lib-row').length, 1);
    origGet('libSearch').value = 'zzzzz';
    origGet('libSearch').dispatchEvent(new Event('input', { bubbles: true }));
    ok('library: empty search shows empty state', origGet('libList').textContent.indexOf('Nothing matches') > -1);
    origGet('libSearch').value = '';
    A.setLib('tarot');

    /* report */
    A.setRoute('report');
    ok('report: contains name', origGet('reportBody').textContent.indexOf('Sohil Momin') > -1);
    ok('report: contains power number', origGet('reportBody').textContent.indexOf('#8') > -1);
    ok('report: text export', U.reportText(A.state.profile, new Date()).indexOf('HOLISTIC READING') === 0);

    /* profile */
    A.setRoute('profile');
    eq('profile: form filled', origGet('fullName').value, 'Sohil Momin');
    ok('profile: version shown', origGet('appVersion').textContent === A.version, origGet('appVersion').textContent);

    /* empty state */
    A.state.profile = null;
    A.renderAll();
    A.setRoute('today');
    ok('empty: today shows empty state', origGet('todayEmpty').hidden === false);
    ok('empty: today body hidden', origGet('todayBody').hidden === true);
    A.setRoute('numbers');
    ok('empty: numbers empty state', origGet('numbersEmpty').hidden === false);
    A.setRoute('sky');
    ok('empty: sky empty state', origGet('skyEmpty').hidden === false);
    A.setRoute('report');
    ok('empty: report placeholder', origGet('reportBody').textContent.indexOf('Complete your profile') > -1);

    /* invalid input */
    A.state.profile = { fullName: 'X', birthDate: '2023-02-30' };
    A.renderAll();
    A.setRoute('today');
    ok('invalid date falls back to empty state', origGet('todayEmpty').hidden === false);

    /* share cards */
    var S = window.HL_SHARE;
    ok('share: module present', !!S);
    var cv = S.renderCard({ eyebrow: 'TEST', title: 'The Tower', body: 'Sudden change. What falls was load-bearing.', footer: '11 Nov 2026' });
    ok('share: card is 1080x1350', cv.width === 1080 && cv.height === 1350, cv.width + 'x' + cv.height);
    var cctx = cv.getContext('2d');
    var px = cctx.getImageData(0, 0, 1080, 1350).data;
    var bright = 0;
    for (var bi = 0; bi < px.length; bi += 4000) {
      if (px[bi] > 60 || px[bi + 1] > 60 || px[bi + 2] > 60) bright++;
    }
    ok('share: card has drawn content', bright > 100, 'bright samples=' + bright);
    ok('share: png is produced', cv.toDataURL('image/png').length > 5000);
    var cvh = S.renderCard({ eyebrow: 'I CHING', title: 'Return', body: 'A small turn is enough.', hexBits: '100010' });
    ok('share: hexagram card renders', cvh.width === 1080 && cvh.toDataURL('image/png').length > 5000);

    /* share actions are wired */
    A.setMode('iching');
    A.setRoute('oracle');
    origGet('oracleQ').value = 'What am I not seeing?';
    A.drawNow();
    ok('share: button appears after a draw', origGet('shareBtn').hidden === false);

    /* text exports */
    A.state.profile = {
      fullName: 'Sohil Momin', birthDate: '1990-01-15', birthTime: '06:45',
      tzOffset: '330', birthLocation: 'Pune', userQuestion: 'Career and health'
    };
    A.state.draw = { type: 'I Ching · three coins', title: 'Return', body: 'A small turn is enough.' };
    var X = window.HL_EXPORT;
    ok('export: module present', !!X);
    var mdOut = X.markdown(A.state.profile, A.state.draw, new Date());
    ok('export: markdown has a title', mdOut.indexOf('# Holistic reading') === 0, mdOut.slice(0, 40));
    ok('export: markdown names the person', mdOut.indexOf('Sohil Momin') > -1);
    ok('export: markdown has all sections',
      ['## Numbers', '## Sky', '## Cycles today'].every(function (h) { return mdOut.indexOf(h) > -1; }));
    ok('export: markdown includes the draw', mdOut.indexOf('## Draw') > -1);
    ok('export: markdown ends with the disclaimer', /not a prediction/i.test(mdOut));

    var rtfOut = X.rtf(A.state.profile, A.state.draw, new Date());
    ok('export: rtf header', rtfOut.indexOf('{\\rtf1') === 0, rtfOut.slice(0, 12));
    var bal = 0;
    for (var ci = 0; ci < rtfOut.length; ci++) {
      if (rtfOut[ci] === '{') bal++;
      if (rtfOut[ci] === '}') bal--;
    }
    eq('export: rtf braces balance', bal, 0);
    ok('export: rtf is plain ascii', /^[\x00-\x7F]*$/.test(rtfOut), 'non-ascii present');
    eq('export: rtf escapes braces', X.rtfEscape('a{b}c'), 'a\\{b\\}c');

    ok('export: empty profile yields nothing', X.markdown({}, null, new Date()) === '');

    /* multiple profiles */
    window.confirm = function () { return true; };
    A.state.profiles = [];
    A.state.active = 0;
    A.newProfile();
    eq('profiles: first added', A.state.profiles.length, 1);
    origGet('fullName').value = 'First Person';
    origGet('birthDate').value = '1990-01-15';
    A.saveProfile();
    A.newProfile();
    origGet('fullName').value = 'Second Person';
    origGet('birthDate').value = '1985-06-10';
    A.saveProfile();
    eq('profiles: two stored', A.state.profiles.length, 2);
    eq('profiles: two chips', origGet('profileChips').querySelectorAll('[data-profile]').length, 2);
    A.useProfile(0);
    eq('profiles: switching loads the right one', A.state.profile.fullName, 'First Person');
    eq('profiles: form follows the switch', origGet('fullName').value, 'First Person');
    A.useProfile(1);
    eq('profiles: second profile loads', A.state.profile.birthDate, '1985-06-10');
    A.deleteProfile();
    eq('profiles: delete removes one', A.state.profiles.length, 1);

    /* polish wave */
    A.setRoute('numbers');
    var why = origGet('powerWhy').querySelector('details.why');
    ok('why: disclosure rendered', why !== null);
    ok('why: shows the arithmetic', why && /\d+ \+ \d+ \+ \d+ = \d+/.test(why.textContent), why && why.textContent.slice(0, 60));
    ok('why: names the result', why && why.textContent.indexOf('#8') > -1);

    A.setRoute('sky');
    var polys = origGet('bioChart').querySelectorAll('polyline');
    var dashes = Array.prototype.map.call(polys, function (p) { return p.getAttribute('stroke-dasharray') || 'solid'; });
    ok('chart: lines differ without colour', new Set(dashes).size === 3, dashes.join(' / '));

    A.setRoute('oracle');
    A.setMode('tarot');
    A.setSpread(1);
    origGet('oracleQ').value = 'What now?';
    A.drawNow();
    ok('oracle: draw offers md export', origGet('oracleOut').querySelector('[data-action="export-draw-md"]') !== null);
    ok('oracle: draw offers rtf export', origGet('oracleOut').querySelector('[data-action="export-draw-rtf"]') !== null);

    /* keyboard shortcuts */
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
    eq('keys: 3 opens the third screen', A.state.route, 'sky');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    eq('keys: 1 returns to today', A.state.route, 'today');
    origGet('oracleQ').dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
    eq('keys: ignored while typing', A.state.route, 'today');

    ok('offline badge element exists', origGet('netBadge') !== null);

    /* medium wave: rising sign, personal months, filters, csv */
    A.state.profile = {
      fullName: 'Sohil Momin', birthDate: '1990-01-15', birthTime: '06:45',
      tzOffset: '330', birthLocation: 'Pune', userQuestion: 'Career and health'
    };
    A.renderAll();
    A.setRoute('sky');
    ok('sky: rising sign resolved', /^[A-Z][a-z]+$/.test(origGet('risingSignName').textContent),
      origGet('risingSignName').textContent);
    ok('sky: rising note names the city', origGet('risingSignNote').textContent.indexOf('Pune') > -1,
      origGet('risingSignNote').textContent);

    A.state.profile.birthLocation = 'Atlantis';
    A.renderAll();
    ok('sky: unknown city degrades honestly', /not in the list/.test(origGet('risingSignNote').textContent),
      origGet('risingSignNote').textContent);
    A.state.profile.birthLocation = 'Pune';
    A.renderAll();

    A.setRoute('numbers');
    eq('numbers: twelve personal months', origGet('personalMonths').querySelectorAll('.month-cell').length, 12);
    ok('numbers: current month highlighted', origGet('personalMonths').querySelectorAll('.month-cell.now').length === 1);
    ok('numbers: months show numbers', /\d/.test(origGet('personalMonths').textContent));

    A.setRoute('library');
    A.setLib('tarot');
    eq('library: suit filters for tarot', origGet('libFilters').querySelectorAll('[data-suit]').length, 6);
    origGet('libFilters').querySelector('[data-suit="Cups"]').click();
    eq('library: cups filter narrows to 14', origGet('libList').querySelectorAll('.lib-row').length, 14);
    origGet('libFilters').querySelector('[data-suit="Major"]').click();
    eq('library: major filter narrows to 22', origGet('libList').querySelectorAll('.lib-row').length, 22);
    origGet('libFilters').querySelector('[data-suit="all"]').click();
    eq('library: filter reset restores 78', origGet('libList').querySelectorAll('.lib-row').length, 78);
    A.setLib('runes');
    eq('library: no suit filters for runes', origGet('libFilters').querySelectorAll('[data-suit]').length, 0);

    /* csv export is wired */
    ok('csv: action registered', A.actions.indexOf('export-days') > -1);

    /* no homeopathy anywhere in the rendered document */
    var docText = document.body.textContent.toLowerCase();
    ['homeopath', 'remedy', 'potency', 'lycopodium', 'aurum'].forEach(function (t) {
      ok('no homeopathy term: ' + t, docText.indexOf(t) === -1);
    });

    /* missing ids */
    var missKeys = Object.keys(missing);
    ok('no missing element ids', missKeys.length === 0, missKeys.join(','));

    /* restore profile so screenshots are populated */
    A.state.profile = {
      fullName: 'Sohil Momin', birthDate: '1990-01-15', birthTime: '06:45',
      birthLocation: 'Pune', gender: 'male', occupation: 'Doctor',
      userQuestion: 'Career and health'
    };
    A.renderAll();
    A.setRoute('today');

    finish();
  }

  function finish() {
    var pass = results.filter(function (r) { return r.pass; }).length;
    var fail = results.length - pass;
    var out = document.createElement('pre');
    out.id = 'test-out';
    out.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;color:#0f0;font:12px monospace;padding:16px;overflow:auto;white-space:pre-wrap';
    var lines = results.map(function (r) {
      return (r.pass ? 'TEST PASS  ' : 'TEST FAIL  ') + r.name + (r.pass ? '' : '   [' + r.detail + ']');
    });
    errors.forEach(function (e) { lines.push('TEST ERROR ' + e); });
    lines.push('');
    lines.push('TEST SUMMARY pass=' + pass + ' fail=' + fail + ' errors=' + errors.length);
    out.textContent = lines.join('\n');
    document.body.appendChild(out);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
