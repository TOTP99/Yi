/* 周易六爻 · UI（青灯古卷） */
(function () {
  'use strict';
  var C = window.YijingCore;

  var S = {
    lines: null, result: null,
    expanded: null, // 'trans' | 'app' | null
    casting: false,
    page: 'home' // 'home' | 'cast' | 'result'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  /* ---------- 卦象图 ---------- */
  function hexDiagram(lines) {
    var h = '<div class="yj-diagram">';
    for (var i = 5; i >= 0; i--) {
      var L = lines[i];
      h += '<div class="yj-dline' + (L.moving ? ' moving' : '') + '">' +
        '<span class="yj-yao">' + (L.yang ? '▬▬▬▬▬▬▬' : '▬▬▬&nbsp;&nbsp;&nbsp;▬▬▬') + '</span>' +
        (L.moving ? '<em>动</em>' : '') + '</div>';
    }
    return h + '</div>';
  }

  /* ---------- 页：主页 ---------- */
  function showHome() {
    S.page = 'home'; S.expanded = null;
    $('app').innerHTML =
      '<div class="scroll-wrap"><div class="book">' +
      '<div class="book-title">周易六爻</div>' +
      '<div class="book-sub">三 钱 起 卦</div>' +
      '<div class="seal-big">' + sealChars('乾坤') + '</div>' +
      '<p class="book-desc">诚心正意，默念所问<br>三枚铜钱，六摇成卦</p>' +
      '<button class="btn-bronze" onclick="YijingUI.goCast()">起 卦</button>' +
      '<div class="book-foot">大衍之数五十，其用四十有九</div>' +
      '</div></div>' +
      lampHTML();
  }

  /* ---------- 页：摇卦 ---------- */
  function showCast() {
    S.page = 'cast'; S.casting = false; S.lines = null;
    $('app').innerHTML =
      '<div class="scroll-wrap"><div class="book">' +
      '<button class="back" onclick="YijingUI.goHome()">‹ 返回</button>' +
      '<div class="book-title sm">诚心起卦</div>' +
      '<input id="yjQ" class="qinput" placeholder="默念所问之事（可不填）" maxlength="50">' +
      '<p class="hint">三钱摇六次，自下而上<br>○ 老阳为动 · × 老阴为动</p>' +
      '<div id="castArea" class="cast-area"></div>' +
      '<button id="castBtn" class="btn-bronze" onclick="YijingUI.startCast()">摇 卦</button>' +
      '</div></div>' +
      lampHTML();
  }

  /* ---------- 页：结果 ---------- */
  function showResult() {
    S.page = 'result';
    var r = S.result, hex = r.hex;
    var sn = C.shortName(hex);
    var h = '<div class="scroll-wrap"><div class="book result-book">';
    h += '<button class="back" onclick="YijingUI.goCast()">‹ 再摇</button>';
    // 印章 + 卦名
    h += '<div class="seal-row"><div class="seal">' + sealChars(hex.name) + '</div></div>';
    h += '<div class="hex-title">' + esc(sn) + ' <span class="hex-qian">' + esc(hex.qian) + '</span></div>';
    h += hexDiagram(S.lines);
    h += '<div class="rule">断法 · ' + esc(r.rule) + '</div>';
    // 原文
    r.parts.forEach(function (p) {
      h += '<section class="sec"><h4>' + esc(p.t) + '</h4><p class="classical">' + esc(p.classical) + '</p></section>';
    });
    if (r.moving.length) {
      h += '<section class="sec"><h4>动爻</h4><p class="info">' +
        r.moving.map(function (i) { return C.YAO_NAMES[i] + '（' + S.lines[i].tag + '）'; }).join('、') + '</p></section>';
    }
    if (r.chex) {
      h += '<section class="sec"><h4>变卦</h4><p class="info">' + esc(r.chex.fullName) + '</p></section>';
    }
    // 两按钮
    h += '<div class="tab2">' +
      '<button class="' + (S.expanded === 'trans' ? 'on' : '') + '" onclick="YijingUI.toggle(\'trans\')">现代汉语翻译</button>' +
      '<button class="' + (S.expanded === 'app' ? 'on' : '') + '" onclick="YijingUI.toggle(\'app\')">现代社会应用</button>' +
      '</div><div id="expand"></div>';
    h += '<button class="btn-bronze" onclick="YijingUI.goCast()">再摇一卦</button>';
    h += '</div></div>' + lampHTML();
    $('app').innerHTML = h;
    if (S.expanded) renderExpand();
  }

  function sealChars(name) {
    return String(name || '').split('').map(function (c) {
      return '<span>' + esc(C.toTrad(c)) + '</span>';
    }).join('');
  }

  function renderExpand() {
    var el = $('expand');
    if (!el) return;
    var r = S.result, h = '';
    if (S.expanded === 'trans') {
      h = '<div class="expand">';
      r.parts.forEach(function (p) {
        h += '<section class="sec"><h4>' + esc(p.t) + ' · 译</h4><p class="modern">' + esc(p.modern || '—') + '</p></section>';
      });
      h += '</div>';
    } else if (S.expanded === 'app') {
      h = '<div class="expand"><section class="sec"><h4>现代社会应用</h4><div class="modern">' +
        esc(r.hex.meaning).replace(/\n/g, '<br>') + '</div></section></div>';
    }
    el.innerHTML = h;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- 孤灯 ---------- */
  function lampHTML() {
    return '<div class="lamp" aria-hidden="true">' +
      '<div class="lamp-glow"></div>' +
      '<div class="lamp-flame"><i></i></div>' +
      '<div class="lamp-body"></div>' +
      '<div class="lamp-base"></div>' +
      '</div>';
  }

  /* ---------- 对外 ---------- */
  window.YijingUI = {
    goHome: showHome,
    goCast: function () { S.result = null; S.expanded = null; showCast(); },
    toggle: function (w) { S.expanded = (S.expanded === w) ? null : w; showResult(); },
    startCast: function () {
      if (S.casting) return;
      S.casting = true;
      var btn = $('castBtn'), area = $('castArea');
      if (btn) btn.disabled = true;
      if (area) area.innerHTML = '';
      var lines = [], idx = 0;
      (function next() {
        if (idx >= 6) {
          S.lines = lines;
          S.result = C.judge(lines);
          S.expanded = null;
          if (!S.result) {
            if (area) area.innerHTML = '<p class="err">起卦异常，请重试</p>';
            S.casting = false; if (btn) btn.disabled = false; return;
          }
          setTimeout(showResult, 700);
          return;
        }
        var L = C.castOneLine();
        lines.push(L);
        if (area) {
          var d = document.createElement('div');
          d.className = 'cast-line' + (L.moving ? ' mv' : '');
          d.innerHTML = '<span>' + C.YAO_NAMES[idx] + '</span><span>' + esc(L.coins) + '</span>' +
            '<span>' + esc(L.tag) + '</span><b>' + esc(L.sym) + (L.moving ? ' 动' : '') + '</b>';
          area.appendChild(d);
        }
        idx++;
        setTimeout(next, 520);
      })();
    }
  };

  document.addEventListener('DOMContentLoaded', showHome);
})();
