/* ============================================================
   Holistic — share cards
   Draws a reading to a canvas and exports a PNG. No library,
   no network: everything is drawn with the 2D context.
   ============================================================ */
(function (root) {
  'use strict';

  var W = 1080, H = 1350;

  var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

  function wrap(ctx, text, maxWidth) {
    var words = String(text || '').replace(/\n+/g, ' \u00b7 ').split(/\s+/);
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* Six lines from a bottom-to-top bit string, drawn as bars. */
  function drawHexagram(ctx, bits, cx, top, width, height) {
    var gap = height * 0.13;
    var lineH = (height - gap * 5) / 6;
    for (var i = 5; i >= 0; i--) {
      var idx = 5 - i;
      var y = top + idx * (lineH + gap);
      var yang = bits.charAt(i) === '1';
      ctx.fillStyle = '#e8eefc';
      if (yang) {
        roundRect(ctx, cx - width / 2, y, width, lineH, lineH / 2);
        ctx.fill();
      } else {
        var seg = (width - gap * 2) / 2;
        roundRect(ctx, cx - width / 2, y, seg, lineH, lineH / 2);
        ctx.fill();
        roundRect(ctx, cx + width / 2 - seg, y, seg, lineH, lineH / 2);
        ctx.fill();
      }
    }
  }

  /* Faint four-point mark, bottom right — fills the lower third
     without adding information. */
  function drawMark(ctx, cx, cy, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.06, 0, Math.PI * 2);
    ctx.stroke();

    var g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, '#8b5cf6');
    g.addColorStop(0.6, '#a78bfa');
    g.addColorStop(1, '#2dd4bf');
    ctx.fillStyle = g;
    ctx.beginPath();
    var pts = 4, outer = r, inner = r * 0.19;
    for (var i = 0; i < pts * 2; i++) {
      var rad = (i % 2 === 0) ? outer : inner;
      var a = (Math.PI / pts) * i - Math.PI / 2;
      var x = cx + Math.cos(a) * rad;
      var yy = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * spec = { eyebrow, title, body, footer, hexBits, accent }
   * Returns an offscreen canvas.
   */
  function renderCard(spec) {
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    /* background */
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0b1020');
    bg.addColorStop(1, '#121a2c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * 0.85, -60, 40, W * 0.85, -60, 900);
    glow.addColorStop(0, 'rgba(139,92,246,0.42)');
    glow.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    var glow2 = ctx.createRadialGradient(60, H + 80, 40, 60, H + 80, 760);
    glow2.addColorStop(0, 'rgba(20,184,166,0.26)');
    glow2.addColorStop(1, 'rgba(20,184,166,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    var pad = 84;

    /* --- measure first, so the block can be centred vertically --- */
    var hexH = spec.hexBits ? 190 : 0;
    var titleSize = spec.hexBits ? 84 : 92;
    ctx.font = '700 ' + titleSize + 'px ' + FONT;
    var titleLines = wrap(ctx, spec.title, W - pad * 2);
    if (titleLines.length > 3) {
      titleSize = Math.round(titleSize * 0.72);
      ctx.font = '700 ' + titleSize + 'px ' + FONT;
      titleLines = wrap(ctx, spec.title, W - pad * 2);
    }
    var titleLh = titleSize * 1.12;

    var bodyLines = [];
    if (spec.body) {
      ctx.font = '400 40px ' + FONT;
      bodyLines = wrap(ctx, spec.body, W - pad * 2 - 20).slice(0, 9);
    }
    var bodyLh = 58;

    var totalH = 96 + hexH + titleLines.length * titleLh + (bodyLines.length ? 40 + bodyLines.length * bodyLh : 0);
    var top = Math.max(120, Math.round((H - 300 - totalH) / 2) + 70);

    var y = top;

    /* accent bar */
    ctx.fillStyle = spec.accent || '#8b5cf6';
    roundRect(ctx, pad, y - 54, 64, 6, 3);
    ctx.fill();

    /* eyebrow */
    ctx.font = '600 25px ' + MONO;
    ctx.fillStyle = '#a78bfa';
    ctx.letterSpacing = '3px';
    ctx.fillText(String(spec.eyebrow || 'HOLISTIC').toUpperCase(), pad, y);
    ctx.letterSpacing = '0px';

    y += 96;

    /* hexagram, when present */
    if (spec.hexBits) {
      drawHexagram(ctx, spec.hexBits, pad + 70, y - 40, 140, 150);
      y += hexH;
    }

    /* title */
    ctx.font = '700 ' + titleSize + 'px ' + FONT;
    ctx.fillStyle = '#f4f7fd';
    titleLines.forEach(function (line) {
      ctx.fillText(line, pad, y + titleSize * 0.82);
      y += titleLh;
    });

    /* body */
    if (bodyLines.length) {
      y += 40;
      ctx.font = '400 40px ' + FONT;
      ctx.fillStyle = '#b8c2d9';
      bodyLines.forEach(function (line) {
        ctx.fillText(line, pad, y);
        y += bodyLh;
      });
    }

    drawMark(ctx, W * 0.80, H * 0.70, 118, 0.11);

    /* footer */
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, H - 172);
    ctx.lineTo(W - pad, H - 172);
    ctx.stroke();

    ctx.font = '500 25px ' + MONO;
    ctx.fillStyle = '#71809c';
    ctx.fillText(spec.footer || '', pad, H - 118);

    ctx.fillStyle = '#8b93a8';
    ctx.font = '500 25px ' + MONO;
    var mark = 'HOLISTIC';
    ctx.fillText(mark, W - pad - ctx.measureText(mark).width, H - 118);

    ctx.fillStyle = '#5a6478';
    ctx.font = '400 22px ' + MONO;
    var url = 'drsamonline.github.io/holistic';
    ctx.fillText(url, W - pad - ctx.measureText(url).width, H - 74);

    return canvas;
  }

  function toBlob(canvas) {
    return new Promise(function (resolve, reject) {
      if (canvas.toBlob) {
        canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error('empty blob')); }, 'image/png');
      } else {
        try {
          var data = canvas.toDataURL('image/png').split(',')[1];
          var bin = atob(data);
          var arr = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          resolve(new Blob([arr], { type: 'image/png' }));
        } catch (e) { reject(e); }
      }
    });
  }

  /* Try the native share sheet, fall back to a download. */
  function save(canvas, filename) {
    return toBlob(canvas).then(function (blob) {
      var file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: 'Holistic' })
          .then(function () { return 'shared'; })
          .catch(function () { return download(blob, filename); });
      }
      return download(blob, filename);
    });
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    return 'downloaded';
  }

  root.HL_SHARE = {
    W: W, H: H,
    renderCard: renderCard,
    save: save,
    toBlob: toBlob,
    download: download,
    drawHexagram: drawHexagram
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
