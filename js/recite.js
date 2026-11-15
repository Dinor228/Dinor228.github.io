/* 备用参考页，刻意未在 index.html 引用（recite-dev 独立版，归口集成版 #/recite，Chief 2026-10-31 裁定留档） */
/* My Tutor · 背诵口试训练主逻辑（独立页面，普通 script，不使用 ES module）
 *
 * 依赖（都做特性检测，缺失也能用 / 不报错）：
 *   MT.cfg.praises / MT.cfg.cheers   鼓励语
 *   MT.store.stars() / addStars(n) / touchStreak() / streak()
 *   MT.voice.say(text,{lang,rate,onend}) / stop() / available() → {tts,asr} / listen({lang,onresult,onerror,onend})
 *
 * 三种模式：
 *   跟读 read  —— 一小句一小句（大字）跟读，🔊 用 TTS 读，孩子点「我会了」推进；可整篇连读
 *   挖空 cloze —— 每句随机挖 1~2 个实词，从 3~4 个候选里点选补齐，答错只提示、不惩罚
 *   抽背 chal  —— 随机抽一篇/一段，显示题目作者，计时逐句推进，🎤 用 ASR 做字符级匹配率判定
 *
 * 纯函数（可单测）都挂在 RT.core 上；本文件在 node 里 require 时只导出纯函数、不碰 DOM。
 */
window.RT = window.RT || {};

(function () {
  'use strict';

  var RT = window.RT;
  var MT = window.MT || {};
  var DATA = RT.data || { pieces: [] };
  var PIECES = (DATA.pieces || []).slice();
  var STORE_KEY = 'myTutor.recite.v1';   /* 本页自己的记录，绝不写 MT.store 的键 */
  var PASS = 0.8;    /* 抽背：匹配率 ≥80% 判过 */
  var NEAR = 0.6;    /* 60%~80% 提示「再想想」，<60% 直接显示原句 */

  /* ================= 一、纯函数核心 ================= */

  /* 中文/英文标点 + 空白，做匹配前统一去掉 */
  var PUNCT = (function () {
    var list = '，。？！、；：\u201c\u201d\u2018\u2019\u300a\u300b\u3008\u3009\u3010\u3011' +
      '\u2026\u2014\u00b7,.?!;:"' + "'" + '()[]{}<>~`/\\|\u3000 \t\n\r-_*+=#@%^&$';
    var o = {};
    for (var i = 0; i < list.length; i++) o[list.charAt(i)] = 1;
    return o;
  })();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      if (c === '&') return '&amp;';
      if (c === '<') return '&lt;';
      if (c === '>') return '&gt;';
      if (c === '"') return '&quot;';
      return '&#39;';
    });
  }

  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return (arr && arr.length) ? arr[rand(arr.length)] : null; }
  function shuffle(arr) {
    var a = (arr || []).slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = rand(i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function stripPunct(s) {
    s = (s == null ? '' : String(s));
    var out = '', i, ch;
    for (i = 0; i < s.length; i++) {
      ch = s.charAt(i);
      if (!PUNCT[ch]) out += ch;
    }
    return out;
  }

  /* 最长公共子序列长度（O(n*m) 动态规划，句子长度很短，够快） */
  function lcsLen(a, b) {
    var n = a.length, m = b.length, i, j;
    if (!n || !m) return 0;
    var prev = [], cur = [], t;
    for (j = 0; j <= m; j++) { prev[j] = 0; cur[j] = 0; }
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        cur[j] = (a.charAt(i - 1) === b.charAt(j - 1)) ? prev[j - 1] + 1
          : Math.max(prev[j], cur[j - 1]);
      }
      t = prev; prev = cur; cur = t;
      for (j = 0; j <= m; j++) cur[j] = 0;
    }
    return prev[m];
  }

  /* 编辑距离（Levenshtein） */
  function levDist(a, b) {
    var n = a.length, m = b.length, i, j;
    if (!n) return m;
    if (!m) return n;
    var prev = [], cur = [], t;
    for (j = 0; j <= m; j++) { prev[j] = j; cur[j] = 0; }
    for (i = 1; i <= n; i++) {
      cur[0] = i;
      for (j = 1; j <= m; j++) {
        var cost = (a.charAt(i - 1) === b.charAt(j - 1)) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      t = prev; prev = cur; cur = t;
    }
    return prev[m];
  }

  /**
   * 字符级匹配率（去掉标点空白后）：
   *   LCS 口径 = 最长公共子序列 / 原句字数   （原句为分母，背出整句即满分）
   *   编辑距离口径 = 1 - 距离 / 两边较长者
   * 语音识别常常漏字/多字，取两者较高值，对小朋友更宽容。
   */
  function matchRate(expected, heard) {
    var e = stripPunct(expected), h = stripPunct(heard);
    if (!e.length) return 1;
    if (!h.length) return 0;
    var byLcs = lcsLen(e, h) / e.length;
    var byLev = 1 - levDist(e, h) / Math.max(e.length, h.length);
    var r = Math.max(byLcs, byLev);
    if (r < 0) r = 0;
    if (r > 1) r = 1;
    return r;
  }

  /* 按逗号/分号把一句切成「小句」，标点跟着前一小句走（跟读、抽背用它推进） */
  var CLAUSE_END = { '\uff0c': 1, '\uff1b': 1, ',': 1, ';': 1 };
  function clauseSplit(line) {
    line = String(line == null ? '' : line);
    var out = [], cur = '', i, ch;
    for (i = 0; i < line.length; i++) {
      ch = line.charAt(i);
      cur += ch;
      if (CLAUSE_END[ch]) { out.push(cur); cur = ''; }
    }
    if (stripPunct(cur).length) out.push(cur);
    return out.length ? out : (line ? [line] : []);
  }

  /* 某篇（可限定自然段）的句子列表：[{text, idx}]，idx 是它在原文 lines 里的下标 */
  function linesOf(piece, para) {
    var out = [];
    if (!piece) return out;
    (piece.lines || []).forEach(function (t, i) {
      if (para !== null && para !== undefined && piece.paras && piece.paras[i] !== para) return;
      out.push({ text: t, idx: i });
    });
    return out;
  }

  /* 某篇（可限定自然段）的小句列表：[{text, lineIdx}] */
  function unitsOf(piece, para) {
    var out = [];
    linesOf(piece, para).forEach(function (L) {
      clauseSplit(L.text).forEach(function (t) {
        out.push({ text: t, lineIdx: L.idx });
      });
    });
    return out;
  }

  /**
   * 给一句挑 1~2 个要挖空的实词（用题库里的 keys，保证是名词/动词这类实词；
   * keys 里没有可用词时退化成一个两字块，避开标点）。
   */
  function chooseBlanks(piece, line) {
    var hits = [];
    line = String(line == null ? '' : line);
    (piece && piece.keys ? piece.keys : []).forEach(function (k) {
      if (!k) return;
      var from = 0, idx;
      while ((idx = line.indexOf(k, from)) >= 0) {
        hits.push({ start: idx, len: k.length, ans: k });
        from = idx + 1;
      }
    });
    hits.sort(function (a, b) { return a.start - b.start || b.len - a.len; });
    var uniq = [], end = -1;
    hits.forEach(function (h) {
      if (h.start < end) return;      /* 重叠的只留靠前/更长的 */
      uniq.push(h);
      end = h.start + h.len;
    });
    if (!uniq.length) {
      var cand = [], i, two;
      for (i = 0; i + 1 < line.length; i++) {
        two = line.substr(i, 2);
        if (!PUNCT[two.charAt(0)] && !PUNCT[two.charAt(1)] && /^[\u4e00-\u9fa5]{2}$/.test(two)) {
          cand.push({ start: i, len: 2, ans: two });
        }
      }
      if (cand.length) uniq = [pick(cand)];
    }
    if (!uniq.length) return [];
    var plain = stripPunct(line).length;
    var want = (plain >= 10 && uniq.length >= 2) ? 2 : 1;
    var chosen = shuffle(uniq).slice(0, want);
    chosen.sort(function (a, b) { return a.start - b.start; });
    return chosen;
  }

  var _pool = null;
  function keyPool() {
    if (_pool) return _pool;
    var out = [];
    PIECES.forEach(function (p) {
      (p.keys || []).forEach(function (k) { if (k) out.push(k); });
    });
    _pool = out;
    return out;
  }

  /**
   * 生成某空的候选（3~4 个）：同篇同长度的词优先，其次全题库同长度的词；
   * 候选不能是答案本身、也不能在本句里已经出现过（否则一眼看穿或小朋友混淆）。
   */
  function buildOptions(piece, line, ans) {
    line = String(line == null ? '' : line);
    var L = ans.length, seen = {}, outs = [];
    function add(k) {
      if (!k || k === ans || seen[k]) return;
      if (k.length !== L) return;
      if (line.indexOf(k) >= 0) return;
      seen[k] = 1;
      outs.push(k);
    }
    shuffle(piece && piece.keys ? piece.keys : []).forEach(add);
    shuffle(keyPool()).forEach(add);
    var distract = outs.slice(0, 3);
    if (distract.length < 2) {      /* 同长度词太少：允许不同长度兜底 */
      shuffle(keyPool()).forEach(function (k) {
        if (distract.length >= 3) return;
        if (!k || k === ans || seen[k]) return;
        if (line.indexOf(k) >= 0) return;
        seen[k] = 1;
        distract.push(k);
      });
    }
    return shuffle([ans].concat(distract));
  }

  function hintText(line, blank) {
    var before = line.slice(Math.max(0, blank.start - 2), blank.start);
    var after = line.slice(blank.start + blank.len, blank.start + blank.len + 2);
    var h = '';
    if (before) h += '前面是「' + before + '」';
    if (after) h += (h ? '，' : '') + '后面是「' + after + '」';
    return h ? '（' + h + '）' : '';
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function fmtUsed(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    if (sec < 60) return sec + ' 秒';
    return Math.floor(sec / 60) + ' 分 ' + (sec % 60) + ' 秒';
  }

  RT.core = {
    stripPunct: stripPunct,
    lcsLen: lcsLen,
    levDist: levDist,
    matchRate: matchRate,
    clauseSplit: clauseSplit,
    linesOf: linesOf,
    unitsOf: unitsOf,
    chooseBlanks: chooseBlanks,
    buildOptions: buildOptions,
    hintText: hintText,
    fmtClock: fmtClock,
    PASS: PASS,
    NEAR: NEAR
  };

  /* 非浏览器环境（node 自测）：只导出上面的纯函数就结束 */
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  /* ================= 二、外部能力的安全封装 ================= */

  function pieceById(id) {
    for (var i = 0; i < PIECES.length; i++) if (PIECES[i].id === id) return PIECES[i];
    return null;
  }
  function praiseList() {
    var c = MT.cfg || {};
    return (c.praises && c.praises.length) ? c.praises : ['太棒了！', '真厉害！', '完全正确！'];
  }
  function cheerList() {
    var c = MT.cfg || {};
    return (c.cheers && c.cheers.length) ? c.cheers : ['差一点点，再想想！', '没关系，再来一次！'];
  }

  function stars() {
    try { return (MT.store && typeof MT.store.stars === 'function') ? (MT.store.stars() || 0) : 0; }
    catch (e) { return 0; }
  }
  function addStars(n) {
    n = Math.max(0, Math.floor(n || 0));
    try {
      if (MT.store && typeof MT.store.addStars === 'function' && n > 0) return MT.store.addStars(n);
    } catch (e) { }
    return stars();
  }
  function streak() {
    try { return (MT.store && typeof MT.store.streak === 'function') ? (MT.store.streak() || 0) : 0; }
    catch (e) { return 0; }
  }

  function caps() {
    try {
      if (MT.voice && typeof MT.voice.available === 'function') {
        var a = MT.voice.available() || {};
        return { tts: !!a.tts, asr: !!a.asr };
      }
    } catch (e) { }
    return { tts: false, asr: false };
  }
  function ttsOk() { return caps().tts; }
  function asrOk() { return caps().asr; }

  function sayText(text, onend) {
    if (!MT.voice || typeof MT.voice.say !== 'function') {
      if (onend) setTimeout(onend, 60);
      return false;
    }
    try {
      MT.voice.say(text, { lang: 'zh-CN', rate: S.slow ? 0.78 : 1, onend: onend || function () { } });
      return true;
    } catch (e) {
      if (onend) setTimeout(onend, 60);
      return false;
    }
  }
  function stopVoice() {
    try { if (MT.voice && typeof MT.voice.stop === 'function') MT.voice.stop(); } catch (e) { }
  }

  /* ================= 三、本页自己的进度记录（独立 localStorage 键） ================= */

  function dbLoad() {
    var d = null;
    try {
      var raw = window.localStorage ? window.localStorage.getItem(STORE_KEY) : null;
      d = raw ? JSON.parse(raw) : null;
    } catch (e) { d = null; }
    if (!d || typeof d !== 'object') d = {};
    if (!Array.isArray(d.needs)) d.needs = [];
    if (!d.done || typeof d.done !== 'object') d.done = {};
    return d;
  }
  function dbSave(d) {
    try {
      if (window.localStorage) window.localStorage.setItem(STORE_KEY, JSON.stringify(d));
    } catch (e) { }
  }
  function needAdd(piece, text) {
    if (!piece || !text) return;
    var d = dbLoad(), now = Date.now(), hit = null, i;
    for (i = 0; i < d.needs.length; i++) {
      if (d.needs[i].piece === piece.id && d.needs[i].text === text) { hit = d.needs[i]; break; }
    }
    if (hit) {
      hit.count = (hit.count || 1) + 1;
      hit.ts = now;
    } else {
      d.needs.unshift({ piece: piece.id, title: piece.title, text: text, count: 1, ts: now });
    }
    if (d.needs.length > 60) d.needs = d.needs.slice(0, 60);
    dbSave(d);
  }
  function needRemove(piece, text) {
    if (!piece) return;
    var d = dbLoad();
    var before = d.needs.length;
    d.needs = d.needs.filter(function (n) {
      return !(n.piece === piece.id && (text === undefined || n.text === text));
    });
    if (d.needs.length !== before) dbSave(d);
  }
  function markDone(piece, info) {
    if (!piece) return;
    var d = dbLoad();
    var cur = d.done[piece.id] || { times: 0, best: 0 };
    cur.times = (cur.times || 0) + 1;
    cur.ts = Date.now();
    if (info && typeof info.match === 'number' && info.match > 0) {
      cur.best = Math.max(cur.best || 0, info.match);
    }
    if (info && info.mode) cur.mode = info.mode;
    d.done[piece.id] = cur;
    dbSave(d);
  }
  function doneOf(pieceId) {
    var d = dbLoad();
    return d.done[pieceId] || null;
  }
  function daysToExam() {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(DATA.exam || ''));
    if (!m) return 0;
    var target = new Date(+m[1], +m[2] - 1, +m[3]);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  /* ================= 四、状态与渲染 ================= */

  var S = {
    screen: 'home',
    pid: null,
    mode: '',
    para: null,
    slow: false,
    showAll: false,
    /* 跟读 */
    units: [],
    ri: 0,
    readAll: false,
    /* 挖空 */
    lines: [],
    li: 0,
    blanks: [],
    opts: [],
    filled: [],
    bi: 0,
    tried: 0,
    firstTry: 0,
    single: false,
    fb: '',
    /* 抽背 */
    chal: null,
    /* 小结 */
    done: null
  };

  var tick = null;
  function clearTick() { if (tick) { clearInterval(tick); tick = null; } }
  /* 防重复计星：同一次流程只加一次 */
  var rewarded = {};

  var toastTimer = null;
  function toast(msg, ms) {
    var el = document.getElementById('rt-toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, ms || 2000);
  }

  function go(screen, patch) {
    clearTick();
    stopVoice();
    S.readAll = false;
    S.screen = screen;
    if (patch) {
      for (var k in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, k)) S[k] = patch[k];
      }
    }
    render();
    try { window.scrollTo(0, 0); } catch (e) { }
  }

  function chipHtml() {
    return '<span class="rt-chip">⭐ ' + stars() + '</span>' +
      '<span class="rt-chip">🔥 ' + streak() + '</span>';
  }

  function render() {
    var main = document.getElementById('rt-main');
    if (!main) return;
    var back = document.getElementById('rt-back');
    if (back) back.hidden = (S.screen === 'home');
    var stats = document.getElementById('rt-stats');
    if (stats) stats.innerHTML = chipHtml();

    var html;
    switch (S.screen) {
      case 'home': html = viewHome(); break;
      case 'piece': html = viewPiece(); break;
      case 'read': html = viewRead(); break;
      case 'cloze': html = viewCloze(); break;
      case 'chal': html = viewChal(); break;
      case 'needs': html = viewNeeds(); break;
      case 'done': html = viewDone(); break;
      default: html = viewHome();
    }
    main.innerHTML = html;
    afterRender();
  }

  function afterRender() {
    clearTick();
    if (S.screen === 'chal' && S.chal && S.chal.phase === 'run' && S.chal.t0) {
      var t0 = S.chal.t0;
      var upd = function () {
        var el = document.querySelector('.rt-timer');
        if (el) el.textContent = fmtClock((Date.now() - t0) / 1000);
      };
      upd();
      tick = setInterval(upd, 500);
    }
  }

  /* ---------- 首页 ---------- */
  function viewHome() {
    var d = dbLoad();
    var days = daysToExam();
    var h = '';
    h += '<section class="rt-hero">';
    h += '<div class="rt-hero-emoji">📖</div>';
    h += '<h1 class="rt-h1">背诵口试训练</h1>';
    h += '<p class="rt-hero-sub">' +
      (days > 0 ? '距离 <b>' + esc(DATA.examName || '语文口试') + '</b>（' + esc(DATA.exam || '') + '）还有 <b class="rt-days">' + days + '</b> 天' :
        (days === 0 ? '今天就是口试日，加油！💪' : '口试已经过去啦，继续保持～')) +
      '</p>';
    h += '<div class="rt-chips">' + chipHtml() +
      '<span class="rt-chip">✍️ 待复习 ' + d.needs.length + '</span></div>';
    h += '<div class="rt-hero-actions">';
    h += '<button type="button" class="rt-btn rt-btn-primary rt-btn-xl" data-act="random">🎲 随机抽背挑战</button>';
    if (d.needs.length) {
      h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="needs">✍️ 再练这 ' + d.needs.length + ' 句</button>';
    }
    h += '</div></section>';

    h += '<h2 class="rt-h2">选一篇来练 <span class="rt-h2-sub">共 ' + PIECES.length + ' 篇</span></h2>';
    h += '<div class="rt-list">';
    PIECES.forEach(function (p) {
      var done = doneOf(p.id);
      var meta = unitsOf(p, null).length + ' 小句';
      if (done && done.times) {
        meta += ' · 练过 ' + done.times + ' 次';
        if (done.best) meta += ' · 最好 ' + Math.round(done.best * 100) + '%';
      } else {
        meta += ' · 还没练过';
      }
      h += '<button type="button" class="rt-card rt-card-btn" data-act="open" data-id="' + esc(p.id) + '">' +
        '<span class="rt-card-top">' +
        '<span class="rt-badge ' + (p.kind === 'poem' ? 'is-poem' : 'is-text') + '">' +
        (p.kind === 'poem' ? '古诗' : '课文') + '</span>' +
        '<span class="rt-card-title">' + esc(p.title) + '</span>' +
        '</span>' +
        '<span class="rt-card-author">' + esc(p.author || '') + (p.sub ? ' · ' + esc(p.sub) : '') + '</span>' +
        '<span class="rt-card-meta">' + esc(meta) + '</span>' +
        '</button>';
    });
    h += '</div>';
    h += '<p class="rt-tip">小提示：先「跟读」读熟 → 再「挖空」考字词 → 最后「抽背」计时模拟口试。</p>';
    return h;
  }

  /* ---------- 选模式 ---------- */
  function viewPiece() {
    var p = pieceById(S.pid);
    if (!p) return viewHome();
    var h = '';
    h += '<section class="rt-card rt-piece">';
    h += '<span class="rt-badge ' + (p.kind === 'poem' ? 'is-poem' : 'is-text') + '">' +
      (p.kind === 'poem' ? '古诗' : '课文') + '</span>';
    h += '<h2 class="rt-piece-title">' + esc(p.title) + '</h2>';
    h += '<p class="rt-piece-author">' + esc(p.author || '') + (p.sub ? ' · ' + esc(p.sub) : '') + '</p>';

    if (p.paras && p.paraTitles) {
      h += '<div class="rt-scope"><span class="rt-scope-label">练哪一段：</span>';
      h += '<button type="button" class="rt-scope-btn' + (S.para === null ? ' is-on' : '') +
        '" data-act="para" data-val="all">整篇</button>';
      p.paraTitles.forEach(function (t, i) {
        h += '<button type="button" class="rt-scope-btn' + (S.para === i ? ' is-on' : '') +
          '" data-act="para" data-val="' + i + '">' + esc(t) + '</button>';
      });
      h += '</div>';
    }

    h += '<div class="rt-modes">';
    h += '<button type="button" class="rt-mode" data-act="mode" data-mode="read">' +
      '<span class="rt-mode-emoji">🔊</span><span class="rt-mode-name">跟读模式</span>' +
      '<span class="rt-mode-desc">一句一句听、跟着读</span></button>';
    h += '<button type="button" class="rt-mode" data-act="mode" data-mode="cloze">' +
      '<span class="rt-mode-emoji">✏️</span><span class="rt-mode-name">挖空填空</span>' +
      '<span class="rt-mode-desc">点选补上缺的字词</span></button>';
    h += '<button type="button" class="rt-mode" data-act="mode" data-mode="chal">' +
      '<span class="rt-mode-emoji">🎤</span><span class="rt-mode-name">抽背挑战</span>' +
      '<span class="rt-mode-desc">计时背，打分拿星星</span></button>';
    h += '</div>';
    h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="say-piece">🔊 听全篇</button>';
    h += '</section>';

    h += '<section class="rt-card rt-preview">';
    h += '<h3 class="rt-h3">原文</h3>';
    (p.lines || []).forEach(function (line, i) {
      if (S.para !== null && p.paras && p.paras[i] !== S.para) return;
      h += '<p class="rt-preview-line">' + esc(line) + '</p>';
    });
    if (p.sub) h += '<p class="rt-tip">只练 ' + esc(p.sub) + '。</p>';
    h += '</section>';
    return h;
  }

  /* ---------- 跟读 ---------- */
  function viewRead() {
    var p = pieceById(S.pid);
    if (!p || !S.units.length) return viewHome();
    var u = S.units[S.ri] || S.units[0];
    var pct = Math.round((S.ri + 1) / S.units.length * 100);
    var h = '';
    h += '<section class="rt-card rt-read">';
    h += '<p class="rt-kicker">🔊 跟读模式 · ' + esc(p.title) + '</p>';
    h += '<div class="rt-bar"><div class="rt-prog"><i style="width:' + pct + '%"></i></div>' +
      '<span class="rt-count">' + (S.ri + 1) + ' / ' + S.units.length + '</span></div>';
    h += '<div class="rt-line rt-line-big">' + esc(u.text) + '</div>';
    if (!ttsOk()) {
      h += '<p class="rt-tip rt-tip-warn">这台设备不支持语音朗读，请跟着老师或家长读，一样能练好～</p>';
    }
    h += '<div class="rt-actions">';
    h += '<button type="button" class="rt-btn rt-btn-primary rt-btn-xl" data-act="read-ok">😊 我会了</button>';
    h += '<button type="button" class="rt-btn rt-btn-xl" data-act="read-again">🔁 再来一次</button>';
    h += '</div>';
    h += '<div class="rt-actions rt-actions-sm">';
    h += '<button type="button" class="rt-btn rt-btn-ghost' + (ttsOk() ? '' : ' is-off') + '" data-act="say">🔊 听一遍</button>';
    h += '<button type="button" class="rt-btn rt-btn-ghost' + (S.slow ? ' is-on' : '') + '" data-act="slow">🐢 慢速' + (S.slow ? '（开）' : '') + '</button>';
    if (S.readAll) {
      h += '<button type="button" class="rt-btn rt-btn-ghost is-on" data-act="read-stop">⏹ 停止连读</button>';
    } else {
      h += '<button type="button" class="rt-btn rt-btn-ghost' + (ttsOk() ? '' : ' is-off') + '" data-act="read-all">▶️ 整篇连读</button>';
    }
    h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="read-toggleall">' + (S.showAll ? '🙈 收起全篇' : '👀 看全篇') + '</button>';
    h += '</div>';
    if (S.showAll) {
      h += '<div class="rt-all">';
      S.units.forEach(function (x, i) {
        h += '<div class="rt-all-line' + (i === S.ri ? ' is-cur' : '') + (i < S.ri ? ' is-done' : '') + '">' +
          esc(x.text) + '</div>';
      });
      h += '</div>';
    }
    h += '</section>';
    return h;
  }

  function sayCurrent() {
    if (!ttsOk()) return;
    var u = S.units[S.ri];
    if (u) sayText(u.text);
  }

  function readOk() {
    if (S.ri + 1 >= S.units.length) { readFinish(); return; }
    S.ri++;
    render();
    sayCurrent();
  }

  function readFinish() {
    var p = pieceById(S.pid);
    var got = 1;
    rewarded.read = true;
    addStars(got);
    markDone(p, { mode: 'read' });
    go('done', {
      done: {
        emoji: '🎉',
        title: '全篇跟读完成！',
        stars: got,
        msg: '你跟着读完了《' + p.title + '》全部 ' + S.units.length + ' 小句，真棒！' +
          '下一步试试「挖空填空」，看看字词记牢了没有。',
        againAct: 'restart-read'
      }
    });
  }

  function chainSay() {
    if (!S.readAll) return;
    var u = S.units[S.ri];
    if (!u) { S.readAll = false; render(); return; }
    var mine = S.ri;
    sayText(u.text, function () {
      if (!S.readAll || S.ri !== mine) return;
      if (S.ri + 1 >= S.units.length) {
        S.readAll = false;
        toast('全篇读完啦～ 🎉');
        render();
        return;
      }
      S.ri++;
      render();
      setTimeout(chainSay, 320);
    });
  }

  /* ---------- 挖空 ---------- */
  function viewCloze() {
    var p = pieceById(S.pid);
    if (!p || !S.lines.length) return viewHome();
    var L = S.lines[S.li];
    if (!L) return viewHome();
    var pct = Math.round((S.li + 1) / S.lines.length * 100);
    var h = '';
    h += '<section class="rt-card rt-cloze">';
    h += '<p class="rt-kicker">✏️ 挖空填空 · ' + esc(p.title) + '</p>';
    h += '<div class="rt-bar"><div class="rt-prog"><i style="width:' + pct + '%"></i></div>' +
      '<span class="rt-count">' + (S.li + 1) + ' / ' + S.lines.length + '</span></div>';
    h += '<div class="rt-line rt-line-cloze">' + clozeLineHtml(L.text, S.blanks, S.filled, S.bi) + '</div>';
    h += '<p class="rt-fb-line">' + (S.fb || '<span class="rt-dim">点下面的字词，把空格补上 👇</span>') + '</p>';
    var opts = S.opts[S.bi] || [];
    h += '<div class="rt-opts">';
    opts.forEach(function (o, i) {
      h += '<button type="button" class="rt-opt" data-act="pick" data-i="' + i + '">' + esc(o) + '</button>';
    });
    h += '</div>';
    h += '<div class="rt-actions rt-actions-sm">';
    h += '<button type="button" class="rt-btn rt-btn-ghost' + (ttsOk() ? '' : ' is-off') + '" data-act="say-line">🔊 听这一句</button>';
    h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="show-ans">👀 看答案</button>';
    h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="skip-line">➡️ 跳过这句</button>';
    h += '</div>';
    h += '</section>';
    return h;
  }

  function clozeLineHtml(line, blanks, filled, cur) {
    var out = '', pos = 0;
    (blanks || []).forEach(function (b, i) {
      out += esc(line.slice(pos, b.start));
      if (filled[i]) {
        out += '<span class="rt-blank is-ok">' + esc(b.ans) + '</span>';
      } else {
        out += '<span class="rt-blank' + (i === cur ? ' is-cur' : '') + '">？</span>';
      }
      pos = b.start + b.len;
    });
    out += esc(line.slice(pos));
    return out;
  }

  function startClozeLine() {
    var p = pieceById(S.pid);
    var L = S.lines[S.li];
    if (!p || !L) { clozeFinish(); return; }
    var blanks = chooseBlanks(p, L.text);
    if (!blanks.length) {          /* 极端情况：这一句没有可挖的词，直接算过 */
      S.blanks = [];
      S.opts = [];
      S.filled = [];
      S.bi = 0;
      S.fb = '<span class="ok">这一句没有要填的空，读一遍就好～</span>';
      render();
      setTimeout(clozeNext, 900);
      return;
    }
    var opts = [];
    for (var i = 0; i < blanks.length; i++) opts.push(buildOptions(p, L.text, blanks[i].ans));
    S.blanks = blanks;
    S.opts = opts;
    S.filled = blanks.map(function () { return false; });
    S.bi = 0;
    S.tried = 0;
    S.fb = '';
    render();
  }

  function clozePick(i) {
    var p = pieceById(S.pid);
    var L = S.lines[S.li];
    var b = S.blanks[S.bi];
    if (!p || !L || !b) return;
    var choice = (S.opts[S.bi] || [])[i];
    if (choice == null) return;
    if (S.filled[S.bi]) return;      /* 这一空已经填好（正在自动跳下一句），连点不重复推进 */
    if (choice === b.ans) {
      S.filled[S.bi] = true;
      var next = S.filled.indexOf(false);
      if (next >= 0) {
        S.bi = next;
        S.fb = '<span class="ok">✅ 对啦！' + esc(pick(praiseList())) + '</span>';
        render();
        return;
      }
      if (S.tried === 0) S.firstTry++;
      /* 答错过的句子留在「待复习」里 —— 只有从待复习里「只练这一句」练好才消掉；
         抽背全对时会整篇清空。这样"错过一次"的记录不会被一次补对抹掉。 */
      if (S.single) needRemove(p, L.text);
      S.fb = '<span class="ok">✅ 这一句补齐啦！</span>';
      render();
      setTimeout(clozeNext, 850);
      return;
    }
    S.tried++;
    needAdd(p, L.text);
    S.fb = '<span class="no">🤔 再想想～ ' + esc(hintText(L.text, b)) + '</span>';
    render();
    var btn = document.querySelector('.rt-opt[data-i="' + i + '"]');
    if (btn) {
      btn.classList.add('is-bad');
      setTimeout(function () { if (btn && btn.classList) btn.classList.remove('is-bad'); }, 600);
    }
  }

  function clozeNext() {
    S.li++;
    if (S.li >= S.lines.length) { clozeFinish(); return; }
    startClozeLine();
  }

  function clozeShowAnswer() {
    var p = pieceById(S.pid);
    var L = S.lines[S.li];
    if (!L) return;
    S.filled = S.blanks.map(function () { return true; });
    if (p) needAdd(p, L.text);
    S.fb = '<span class="no">📖 原句是：' + esc(L.text) + '（读两遍再点下一句）</span>';
    render();
    setTimeout(clozeNext, 1600);
  }

  function clozeSkip() {
    var p = pieceById(S.pid);
    var L = S.lines[S.li];
    if (p && L) needAdd(p, L.text);
    clozeNext();
  }

  function clozeFinish() {
    var p = pieceById(S.pid);
    var total = S.lines.length;
    var perfect = (S.firstTry >= total);
    var got = perfect ? 2 : 1;
    addStars(got);
    if (p) markDone(p, { mode: 'cloze' });
    var msg = perfect
      ? '太厉害了！' + total + ' 句全部一次就填对，字词记得很牢！'
      : '你补完了 ' + total + ' 句，其中 ' + S.firstTry + ' 句一次就对。' +
      '填错过的句子已经放进「待复习」，之后再练一次就记牢啦。';
    go('done', {
      done: {
        emoji: perfect ? '🏆' : '👍',
        title: S.single ? '这一句练好啦！' : '填空完成！',
        stars: got,
        msg: msg,
        againAct: 'restart-cloze'
      }
    });
  }

  /* ---------- 抽背 ---------- */
  function newChal(piece) {
    return {
      piece: piece,
      units: unitsOf(piece, S.para),
      i: 0,
      passed: 0,
      best: {},        /* 小句下标 → 该句最好匹配率（重试不会拉低总成绩） */
      asr: 0,          /* 用过几次 🎤 */
      fails: [],
      hint: 0,
      t0: 0,
      secs: 0,
      phase: 'ready',
      fb: '',
      reveal: null,
      allOk: false,
      stars: 0
    };
  }

  function startChal(piece) {
    var c = newChal(piece);
    go('chal', { pid: piece.id, mode: 'chal', chal: c });
  }

  function randomChal() {
    var cands = PIECES.filter(function (p) { return unitsOf(p, null).length > 0; });
    if (!cands.length) { toast('题库是空的'); return; }
    var last = S.chal && S.chal.piece ? S.chal.piece.id : null;
    var pool = cands.filter(function (p) { return p.id !== last; });
    if (!pool.length) pool = cands;
    var p = pick(pool);
    S.para = null;
    startChal(p);
  }

  function chalAdvance() {
    var c = S.chal;
    if (!c) return;
    c.i++;
    c.fb = '';
    c.reveal = null;
    c.hint = 0;
    if (c.i >= c.units.length) { chalFinish(); return; }
    render();
  }

  function chalPass() {
    var c = S.chal;
    if (!c || c.phase !== 'run') return;
    c.passed++;
    chalAdvance();
  }

  function unitText(u) { return u ? String(u.text || '') : ''; }

  /* 平均匹配率：只统计"用 🎤 测过"的小句，每句取最好成绩；一次都没测就是 null */
  function chalAvg(c) {
    if (!c || !c.best) return null;
    var keys = [];
    for (var k in c.best) if (Object.prototype.hasOwnProperty.call(c.best, k)) keys.push(k);
    if (!keys.length) return null;
    var sum = 0;
    keys.forEach(function (k) { sum += c.best[k]; });
    return sum / keys.length;
  }

  function chalJudge(text) {
    var c = S.chal;
    if (!c || c.phase !== 'run') return;
    var u = c.units[c.i];
    if (!u) return;
    var r = matchRate(u.text, text);
    c.asr++;
    c.best[c.i] = Math.max(c.best[c.i] || 0, r);   /* 只记最好的一次 */
    var pct = Math.round(r * 100);
    var heard = '（听到：' + (text || '（空）') + '）';
    if (r >= PASS) {
      c.passed++;
      c.fb = '<span class="ok">✅ 背对了！匹配 ' + pct + '% ' + esc(heard) + '</span>';
      c.reveal = null;
      render();
      var at = c.i;
      setTimeout(function () {
        if (S.screen === 'chal' && S.chal === c && c.phase === 'run' && c.i === at) chalAdvance();
      }, 950);
    } else if (r >= NEAR) {
      c.fb = '<span class="no">🤔 再想想～ 匹配 ' + pct + '% ' + esc(heard) + '</span>';
      render();
    } else {
      if (c.fails.indexOf(unitText(u)) < 0) c.fails.push(unitText(u));
      needAdd(c.piece, u.text);
      c.fb = '<span class="no">📖 这次匹配 ' + pct + '% ' + esc(heard) + '</span>';
      c.reveal = u.text;
      render();
    }
  }

  function chalListen() {
    var c = S.chal;
    if (!c || c.phase !== 'run') return;
    if (!asrOk() || !MT.voice || typeof MT.voice.listen !== 'function') {
      toast('这台设备不能语音识别，点「我背出来了」就好');
      return;
    }
    c.fb = '<span class="rt-dim">🎤 我在听… 请大声背出这一句</span>';
    render();
    try {
      MT.voice.listen({
        lang: 'zh-CN',
        onresult: function (text) { chalJudge(text); },
        onerror: function (err) {
          if (S.screen !== 'chal' || S.chal !== c) return;
          var m = '🎤 没听清，再试一次？也可以点「我背出来了」';
          if (err === 'not-allowed' || err === 'service-not-allowed') m = '🎤 麦克风没打开（浏览器挡住了），可以点「我背出来了」继续';
          else if (err === 'no-speech') m = '🎤 没听到声音，靠近一点再说一次～';
          else if (err === 'unsupported') m = '🎤 这台设备不支持语音识别，点「我背出来了」继续';
          c.fb = '<span class="no">' + esc(m) + '</span>';
          render();
        },
        onend: function () { }
      });
    } catch (e) {
      c.fb = '<span class="no">🎤 语音用不了，点「我背出来了」继续</span>';
      render();
    }
  }

  function chalHint() {
    var c = S.chal;
    if (!c) return;
    c.hint = 1;
    render();
  }

  function chalFinish() {
    var c = S.chal;
    if (!c) return;
    c.phase = 'done';
    c.secs = Math.round((Date.now() - c.t0) / 1000);
    var n = c.units.length;
    var all = c.passed >= n;
    var got = all ? 3 : (c.passed >= Math.ceil(n * 0.6) ? 1 : 0);
    c.allOk = all;
    c.stars = got;
    if (got) addStars(got);
    markDone(c.piece, { mode: 'chal', match: chalAvg(c) || 0 });
    if (all) needRemove(c.piece);
    else c.fails.forEach(function (t) { needAdd(c.piece, t); });
    render();
  }

  function viewChal() {
    var c = S.chal;
    if (!c) return viewHome();
    var p = c.piece, n = c.units.length;
    if (c.phase === 'ready') {
      var h0 = '';
      h0 += '<section class="rt-card rt-chal-ready">';
      h0 += '<p class="rt-kicker">🎤 抽背挑战</p>';
      h0 += '<h2 class="rt-piece-title">' + esc(p.title) + '</h2>';
      h0 += '<p class="rt-piece-author">' + esc(p.author || '') + (p.sub && S.para === null ? ' · ' + esc(p.sub) : '') + '</p>';
      h0 += '<p class="rt-ready-hint">共 <b>' + n + '</b> 小句。点开始就计时，' +
        '一句一句背出来：背完点「✅ 我背出来了」' + (asrOk() ? '，或者点「🎤 语音检查」让它帮你打匹配率' : '') + '。</p>';
      h0 += '<button type="button" class="rt-btn rt-btn-primary rt-btn-xl" data-act="chal-start">▶️ 开始抽背</button>';
      h0 += '</section>';
      return h0;
    }
    if (c.phase === 'done') return viewChalResult();

    var u = c.units[c.i] || { text: '' };
    var pct = Math.round(c.i / n * 100);
    var h = '';
    h += '<section class="rt-card rt-chal">';
    h += '<div class="rt-chal-head">';
    h += '<div><h2 class="rt-piece-title">' + esc(p.title) + '</h2>' +
      '<p class="rt-piece-author">' + esc(p.author || '') + '</p></div>';
    h += '<div class="rt-timer">' + fmtClock(c.t0 ? (Date.now() - c.t0) / 1000 : 0) + '</div>';
    h += '</div>';
    h += '<div class="rt-bar"><div class="rt-prog"><i style="width:' + pct + '%"></i></div>' +
      '<span class="rt-count">' + (c.i + 1) + ' / ' + n + '</span></div>';
    h += '<p class="rt-chal-ask">请背出第 <b>' + (c.i + 1) + '</b> 小句</p>';
    if (c.hint) {
      h += '<p class="rt-hint-line">💡 提示：这句是「' + esc(stripPunct(u.text).slice(0, 3)) + '……」</p>';
    }
    if (c.reveal) {
      h += '<div class="rt-reveal"><span class="rt-reveal-label">📖 原句</span>' + esc(c.reveal) + '</div>';
    }
    h += '<p class="rt-fb-line" id="rt-fb">' + (c.fb || '<span class="rt-dim">想一想，大声背出来～</span>') + '</p>';
    h += '<div class="rt-actions">';
    h += '<button type="button" class="rt-btn rt-btn-primary rt-btn-xl" data-act="chal-pass">✅ 我背出来了</button>';
    if (asrOk()) {
      h += '<button type="button" class="rt-btn rt-btn-mic rt-btn-xl" data-act="chal-listen">🎤 语音检查</button>';
    }
    h += '</div>';
    h += '<div class="rt-actions rt-actions-sm">';
    h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="chal-hint">💡 提示</button>';
    if (c.reveal) {
      h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="chal-skip">➡️ 读一遍，下一句</button>';
    }
    h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="chal-quit">🏳️ 结束这次</button>';
    h += '</div>';
    h += '</section>';
    return h;
  }

  function viewChalResult() {
    var c = S.chal;
    if (!c) return viewHome();
    var p = c.piece, n = c.units.length;
    var avgR = chalAvg(c);
    var avg = (avgR === null) ? null : Math.round(avgR * 100);
    var all = c.passed >= n;
    var praise = all ? pick(praiseList()) : pick(cheerList());
    var h = '';
    h += '<section class="rt-card rt-result">';
    h += '<div class="rt-result-emoji">' + (all ? '🏆' : '💪') + '</div>';
    h += '<h2 class="rt-result-title">' + esc(all ? '全对！太厉害了' : '这次练习结束') + '</h2>';
    h += '<p class="rt-result-sub">《' + esc(p.title) + '》· ' + esc(p.author || '') + '</p>';
    h += '<div class="rt-result-rows">';
    h += '<div class="rt-result-row"><span>背出</span><b>' + c.passed + ' / ' + n + ' 小句</b></div>';
    h += '<div class="rt-result-row"><span>匹配率</span><b>' + (avg === null ? '—（没用🎤）' : avg + '%') + '</b></div>';
    h += '<div class="rt-result-row"><span>用时</span><b>' + fmtUsed(c.secs) + '</b></div>';
    h += '<div class="rt-result-row"><span>星星</span><b>+' + c.stars + ' ⭐</b></div>';
    h += '</div>';
    if (c.stars) h += '<p class="rt-big-stars">+' + c.stars + ' ⭐</p>';
    h += '<p class="rt-praise">' + esc(praise) + '</p>';
    if (c.fails.length) {
      h += '<p class="rt-tip">要再练的句子已经记到「待复习」：</p><ul class="rt-fail-list">';
      c.fails.forEach(function (t) { h += '<li>' + esc(t) + '</li>'; });
      h += '</ul>';
    } else if (avg === null) {
      h += '<p class="rt-tip">下次试试点「🎤 语音检查」，让应用帮你算匹配率。</p>';
    }
    h += '<div class="rt-actions">';
    h += '<button type="button" class="rt-btn rt-btn-primary rt-btn-xl" data-act="chal-again">🔁 再练一遍</button>';
    h += '<button type="button" class="rt-btn rt-btn-xl" data-act="home">🏠 换一篇</button>';
    h += '</div>';
    h += '</section>';
    return h;
  }

  /* ---------- 待复习 ---------- */
  function viewNeeds() {
    var d = dbLoad();
    var h = '';
    h += '<section class="rt-card">';
    h += '<p class="rt-kicker">✍️ 待复习</p>';
    h += '<h2 class="rt-piece-title">需要再练的句子</h2>';
    if (!d.needs.length) {
      h += '<p class="rt-ready-hint">现在没有要复习的句子，太棒了！🎉</p>';
    } else {
      h += '<p class="rt-tip">点句子下面的按钮，就能只练这一句。</p>';
      h += '<div class="rt-need-list">';
      d.needs.forEach(function (item, i) {
        h += '<div class="rt-need">';
        h += '<div class="rt-need-text">' + esc(item.text) + '</div>';
        h += '<div class="rt-need-meta">《' + esc(item.title || '') + '》· 错过 ' + (item.count || 1) + ' 次</div>';
        h += '<button type="button" class="rt-btn rt-btn-ghost rt-btn-sm" data-act="prac" data-id="' +
          esc(item.piece) + '" data-i="' + i + '">✏️ 只练这一句</button>';
        h += '</div>';
      });
      h += '</div>';
      h += '<button type="button" class="rt-btn rt-btn-ghost" data-act="clear-needs">🧹 全部清空</button>';
    }
    h += '</section>';
    return h;
  }

  /* ---------- 通用小结 ---------- */
  function viewDone() {
    var d = S.done || {};
    var h = '';
    h += '<section class="rt-card rt-result">';
    h += '<div class="rt-result-emoji">' + esc(d.emoji || '🎉') + '</div>';
    h += '<h2 class="rt-result-title">' + esc(d.title || '完成啦') + '</h2>';
    if (d.stars) h += '<p class="rt-big-stars">+' + d.stars + ' ⭐</p>';
    h += '<p class="rt-praise">' + esc(d.msg || '') + '</p>';
    h += '<div class="rt-actions">';
    h += '<button type="button" class="rt-btn rt-btn-primary rt-btn-xl" data-act="' + esc(d.againAct || 'home') + '">🔁 再来一遍</button>';
    h += '<button type="button" class="rt-btn rt-btn-xl" data-act="home">🏠 换一篇</button>';
    h += '</div>';
    h += '</section>';
    return h;
  }

  /* ================= 五、交互 ================= */

  function openPiece(id) {
    var p = pieceById(id);
    if (!p) { go('home'); return; }
    go('piece', { pid: id, mode: '', para: null });
  }

  function startMode(mode) {
    var p = pieceById(S.pid);
    if (!p) { go('home'); return; }
    if (mode === 'read') {
      var units = unitsOf(p, S.para);
      if (!units.length) { toast('这一段还没有内容'); return; }
      go('read', { mode: 'read', units: units, ri: 0, readAll: false, showAll: false });
      sayCurrent();
    } else if (mode === 'cloze') {
      var lines = linesOf(p, S.para);
      if (!lines.length) { toast('这一段还没有内容'); return; }
      go('cloze', { mode: 'cloze', lines: lines, li: 0, firstTry: 0, single: false, fb: '' });
      startClozeLine();
    } else if (mode === 'chal') {
      startChal(p);
    }
  }

  function practiceLine(pid, index) {
    var p = pieceById(pid);
    var d = dbLoad();
    var item = d.needs[index];
    if (!p || !item) { toast('这一句已经不在待复习里了'); return; }
    go('cloze', {
      pid: pid, mode: 'cloze', para: null,
      lines: [{ text: item.text, idx: -1 }], li: 0, firstTry: 0, single: true, fb: ''
    });
    startClozeLine();
  }

  function sayWholePiece() {
    var p = pieceById(S.pid);
    if (!p) return;
    if (!ttsOk()) { toast('这台设备不能朗读，跟着读吧～'); return; }
    var text = linesOf(p, S.para).map(function (l) { return l.text; }).join('');
    sayText(text);
  }

  function handle(act, d) {
    var p = pieceById(S.pid);
    switch (act) {
      case 'home': go('home'); break;
      case 'back': goBack(); break;
      case 'open': openPiece(d.id); break;
      case 'needs': go('needs'); break;
      case 'para':
        S.para = (d.val === 'all') ? null : parseInt(d.val, 10);
        render();
        break;
      case 'mode': startMode(d.mode); break;
      case 'random': randomChal(); break;

      /* 跟读 */
      case 'read-ok': readOk(); break;
      case 'read-again': sayCurrent(); break;
      case 'say':
        if (!ttsOk()) { toast('这台设备不能朗读，跟着老师读吧～'); break; }
        sayCurrent();
        break;
      case 'slow': S.slow = !S.slow; render(); break;
      case 'read-all':
        if (!ttsOk()) { toast('这台设备不能朗读，跟着老师读吧～'); break; }
        S.readAll = true; S.ri = 0; render(); chainSay();
        break;
      case 'read-stop': S.readAll = false; stopVoice(); render(); break;
      case 'read-toggleall': S.showAll = !S.showAll; render(); break;
      case 'restart-read': startMode('read'); break;
      case 'say-piece': sayWholePiece(); break;

      /* 挖空 */
      case 'pick': clozePick(d.i); break;
      case 'skip-line': clozeSkip(); break;
      case 'show-ans': clozeShowAnswer(); break;
      case 'say-line': {
        var L = S.lines[S.li];
        if (!L) break;
        if (!ttsOk()) { toast('这台设备不能朗读，跟着读吧～'); break; }
        sayText(L.text);
        break;
      }
      case 'restart-cloze': startMode('cloze'); break;

      /* 抽背 */
      case 'chal-start':
        if (!S.chal) break;
        if (!S.chal.units.length) { toast('这一段还没有内容'); break; }
        S.chal.phase = 'run';
        S.chal.t0 = Date.now();
        S.chal.fb = '';
        render();
        break;
      case 'chal-pass': chalPass(); break;
      case 'chal-listen': chalListen(); break;
      case 'chal-hint': chalHint(); break;
      case 'chal-skip':
        if (S.chal) {
          var u = S.chal.units[S.chal.i];
          if (u && S.chal.fails.indexOf(unitText(u)) < 0) S.chal.fails.push(unitText(u));
          if (u && S.chal.piece) needAdd(S.chal.piece, u.text);
          chalAdvance();
        }
        break;
      case 'chal-quit':
        if (S.chal) {
          if (S.chal.phase === 'run') {
            if (S.chal.passed >= S.chal.units.length) { chalFinish(); }
            else { S.chal.phase = 'done'; S.chal.secs = Math.round((Date.now() - (S.chal.t0 || Date.now())) / 1000); S.chal.allOk = false; S.chal.stars = 0; markDone(S.chal.piece, { mode: 'chal' }); render(); }
          } else { go('piece'); }
        }
        break;
      case 'chal-again':
        if (S.chal) { var pc = S.chal.piece; startChal(pc); }
        break;

      /* 待复习 */
      case 'prac': practiceLine(d.id, d.i); break;
      case 'clear-needs':
        var db = dbLoad(); db.needs = []; dbSave(db);
        render();
        toast('清空啦');
        break;
      default: break;
    }
    void p;
  }

  function goBack() {
    stopVoice();
    if (S.screen === 'read' || S.screen === 'cloze' || S.screen === 'chal' || S.screen === 'done') {
      if (S.chal && S.screen === 'chal') S.chal = null;
      go(S.pid ? 'piece' : 'home');
      return;
    }
    go('home');
  }

  function onDocClick(ev) {
    var t = ev.target;
    while (t && t !== document && !(t.getAttribute && t.getAttribute('data-act'))) t = t.parentNode;
    if (!t || t === document || !t.getAttribute) return;
    var act = t.getAttribute('data-act');
    if (!act) return;
    ev.preventDefault();
    handle(act, {
      el: t,
      id: t.getAttribute('data-id'),
      mode: t.getAttribute('data-mode'),
      val: t.getAttribute('data-val'),
      i: t.getAttribute('data-i') === null ? null : parseInt(t.getAttribute('data-i'), 10)
    });
  }

  /* ================= 六、启动 ================= */

  function boot() {
    try {
      if (MT.store && typeof MT.store.touchStreak === 'function') MT.store.touchStreak();
    } catch (e) { }
    document.addEventListener('click', onDocClick);
    var main = document.getElementById('rt-main');
    if (!PIECES.length) {
      if (main) main.innerHTML = '<section class="rt-card"><h2 class="rt-piece-title">题库没加载成功</h2>' +
        '<p class="rt-ready-hint">请刷新页面；如果还不行，检查 js/recite-data.js 是否在。</p></section>';
      return;
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
