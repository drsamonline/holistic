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
    var screens = ['today', 'numbers', 'sky', 'couple', 'oracle', 'report', 'profile'];
    screens.forEach(function (s) {
      ok('screen exists: ' + s, !!origGet('screen-' + s));
    });

    var navCount = document.querySelectorAll('.nav-item').length;
    var tabCount = document.querySelectorAll('.tab').length;
    eq('rail has 7 items', navCount, 7);
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

    /* couple */
    A.setRoute('couple');
    origGet('coupleA').value = '1990-01-15';
    origGet('coupleB').value = '1988-07-04';
    A.compareCouple();
    ok('couple: output shown', origGet('coupleOut').hidden === false);
    ok('couple: score rendered', /^\d+%$/.test(origGet('coupleScore').textContent), origGet('coupleScore').textContent);
    ok('couple: breakdown rows', origGet('coupleBreakdown').querySelectorAll('.kv-row').length === 6);
    ok('couple: verdict text', origGet('coupleVerdict').textContent.length > 2);

    /* couple clear */
    document.querySelector('[data-action="couple-clear"]').click();
    ok('couple: clear hides output', origGet('coupleOut').hidden === true);

    /* oracle */
    A.setRoute('oracle');
    origGet('oracleQ').value = 'Should I take the offer?';
    A.drawTarot();
    ok('oracle: tarot output', origGet('oracleOut').hidden === false);
    var first = origGet('oracleOut').textContent;
    A.drawTarot();
    eq('oracle: same question same card', origGet('oracleOut').textContent, first);
    A.drawIChing();
    ok('oracle: iching renders', origGet('oracleOut').textContent.indexOf('I Ching') > -1);
    A.draw8Ball();
    ok('oracle: 8ball renders', origGet('oracleOut').textContent.indexOf('Straight answer') > -1);

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
