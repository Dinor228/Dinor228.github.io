/* My Tutor · 本地存储（localStorage 单键 'myTutor.v1'，数据只存本机浏览器） */
window.MT = window.MT || {};

(function () {
  var KEY = 'myTutor.v1';
  var MASTERY_WINDOW = 100;   /* 掌握度统计窗口：只记最近 100 题 */
  var WRONG_CAP = 100;        /* 错题本最多保留条数 */
  var HISTORY_CAP = 20;       /* 学习记录保留条数 */
  var DAYS_CAP = 400;         /* 打卡日期最多保留 */

  /* 星星规则常量（app.js 也可直接引用 MT.store.RULES） */
  var RULES = { CORRECT: 1, ROUND: 5, PERFECT: 5 };

  function defaults() {
    return {
      stars: 0,
      days: [],        /* 打卡日期集合 ['YYYY-MM-DD', ...] */
      lastDay: null,   /* 最近一次进入的本地日期 */
      mastery: {},     /* { 'subj|type': { seen, correct, log:[1/0 最近100题] } } */
      wrong: [],       /* 错题条目数组 */
      history: [],     /* 学习记录（最近20条） */
      bfLog: [],       /* BF 计时训练记录（MATH-BFWB-05）：{d, set, secs, tier, ts} —— 只记用时与档位，零对错 */
      bfExtraNext: null, /* 一键约明日加练：目标日期字符串 */
      stickers: []     /* 已得贴纸 id */
    };
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function saveState(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 存储满/隐私模式，静默 */ }
  }

  function loadState() {
    var base = defaults();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var d = JSON.parse(raw);
      if (!d || typeof d !== 'object') return base;
      /* 与默认结构合并，缺字段自动补齐 */
      for (var k in base) {
        if (Object.prototype.hasOwnProperty.call(base, k)) {
          if (d[k] === undefined || d[k] === null) d[k] = base[k];
        }
      }
      return d;
    } catch (e) {
      return base;
    }
  }

  /* ---------- 日期工具（本地时区） ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function dayKeyOf(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }
  function yesterdayKey() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return dayKeyOf(d);
  }

  function mKey(subject, type) { return subject + '|' + type; }

  /* ---------- 对外 API ---------- */
  MT.store = {
    RULES: RULES,

    load: loadState,

    save: function () { saveState(loadState()); },

    /* Essay 完成态（ESSAY-MOD-01）：{ unitId: {at} } */
    essayDoneGet: function () { return loadState().essayDone || {}; },
    essayDoneSet: function (id) {
      var s = loadState();
      s.essayDone = s.essayDone || {};
      if (s.essayDone[id]) return false;
      s.essayDone[id] = { at: new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) };
      saveState(s);
      return true;
    },

    /* BF 计时训练（MATH-BFWB-05）：与星星/掌握度/错题链物理隔离——只记 {d,set,secs,tier,ts}，零对错字段 */
    bfGetLog: function () { return loadState().bfLog || []; },
    bfRecord: function (entry) {           /* entry = {d:'YYYY-MM-DD', set:'A'|'B', secs:int, tier:'green'|'yellow'|'orange'} */
      var s = loadState();
      s.bfLog = s.bfLog || [];
      s.bfLog.push({ d: entry.d, set: entry.set, secs: entry.secs, tier: entry.tier,
        ts: new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) });
      if (s.bfLog.length > 120) s.bfLog = s.bfLog.slice(-120);
      saveState(s);
      return s.bfLog.length;
    },
    bfScheduleExtra: function (dayStr) { var s = loadState(); s.bfExtraNext = dayStr; saveState(s); return dayStr; },
    bfExtraGet: function () { return loadState().bfExtraNext || null; },

    /* AMC 板块（MATH-AMC-03）：与判分链物理隔离——只记完成档/题数与时间戳，零对错字段 */
    amcDoneGet: function () { return loadState().amcDone || {}; },   /* { qid: {at} } 孩子点过 Check myself 的题 */
    amcDoneSet: function (qid) {
      var s = loadState();
      s.amcDone = s.amcDone || {};
      if (s.amcDone[qid]) return false;
      s.amcDone[qid] = { at: new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) };
      saveState(s);
      return true;
    },

    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { }
    },

    /* 星星 */
    stars: function () { return loadState().stars || 0; },
    addStars: function (n) {
      n = Math.max(0, Math.floor(n) || 0);
      var st = loadState();
      st.stars = (st.stars || 0) + n;
      saveState(st);
      return st.stars;
    },

    /* 打卡 */
    todayKey: todayKey,
    lastDay: function () { return loadState().lastDay; },
    setToday: function () {
      var st = loadState();
      var t = todayKey();
      if (st.lastDay !== t) {
        st.days.push(t);
        /* 去重 + 限制条数（保留最近 DAYS_CAP 天） */
        var seen = {};
        st.days = st.days.filter(function (d) {
          if (seen[d]) return false; seen[d] = 1; return true;
        });
        if (st.days.length > DAYS_CAP) st.days = st.days.slice(-DAYS_CAP);
        st.lastDay = t;
        saveState(st);
      }
    },
    /* 连续打卡天数：从今天（或昨天，今天还没进来看也算连续）往前数 */
    streak: function () {
      var days = {};
      loadState().days.forEach(function (d) { days[d] = 1; });
      var cur = new Date();
      if (!days[todayKey()]) {
        /* 今天还没打卡：从昨天开始数 */
        if (!days[yesterdayKey()]) return 0;
        cur.setDate(cur.getDate() - 1);
      }
      var n = 0;
      while (days[dayKeyOf(cur)]) {
        n++;
        cur.setDate(cur.getDate() - 1);
      }
      return n;
    },
    /* 今天首次进入时调用：更新连续打卡 */
    touchStreak: function () { MT.store.setToday(); },

    /* 掌握度（最近 100 题窗口） */
    mastery: function (subject, type) {
      var st = loadState();
      var m = st.mastery[mKey(subject, type)];
      if (!m || !Array.isArray(m.log)) return { seen: 0, correct: 0 };
      var seen = m.log.length;
      var correct = m.log.reduce(function (s, x) { return s + (x ? 1 : 0); }, 0);
      return { seen: seen, correct: correct };
    },
    bumpMastery: function (subject, type, ok) {
      var st = loadState();
      var k = mKey(subject, type);
      if (!st.mastery[k] || !Array.isArray(st.mastery[k].log)) st.mastery[k] = { seen: 0, correct: 0, log: [] };
      var m = st.mastery[k];
      m.log.push(ok ? 1 : 0);
      if (m.log.length > MASTERY_WINDOW) m.log = m.log.slice(-MASTERY_WINDOW);
      m.seen = m.log.length;
      m.correct = m.log.reduce(function (s, x) { return s + (x ? 1 : 0); }, 0);
      saveState(st);
    },

    /* 错题本 */
    wrongAdd: function (entry) {
      if (!entry || !entry.subj || !entry.q) return;
      var st = loadState();
      var now = Date.now();
      /* 同一题（科目+题干+答案相同）视为重复错：计数 +1 并提到最前 */
      var exist = null;
      for (var i = 0; i < st.wrong.length; i++) {
        var w = st.wrong[i];
        if (w.subj === entry.subj && w.q === entry.q && w.a === entry.a) { exist = w; break; }
      }
      if (exist) {
        exist.wrongCount = (exist.wrongCount || 1) + 1;
        exist.lastWrong = now;
        exist.explain = entry.explain || exist.explain;
        exist.speak = entry.speak || exist.speak;
        exist.opts = entry.opts || exist.opts;
      } else {
        st.wrong.push({
          id: entry.id || ('w' + now.toString(36) + Math.random().toString(36).slice(2, 7)),
          subj: entry.subj,
          type: entry.type || '',
          q: entry.q,
          a: entry.a,
          opts: entry.opts || undefined,
          speak: entry.speak || undefined,
          explain: entry.explain || '',
          topicTag: entry.topicTag || '',
          wrongCount: entry.wrongCount || 1,
          lastWrong: now
        });
        if (st.wrong.length > WRONG_CAP) {
          /* 丢最旧的（按 lastWrong 排序后砍尾巴） */
          st.wrong.sort(function (a, b) { return (b.lastWrong || 0) - (a.lastWrong || 0); });
          st.wrong = st.wrong.slice(0, WRONG_CAP);
        }
      }
      saveState(st);
    },
    wrongList: function () {
      var list = loadState().wrong.slice();
      list.sort(function (a, b) { return (b.lastWrong || 0) - (a.lastWrong || 0); });
      return list;
    },
    wrongRemove: function (id) {
      var st = loadState();
      st.wrong = st.wrong.filter(function (w) { return w.id !== id; });
      saveState(st);
    },
    /* 重做答对：移除并奖励一颗星由调用方决定，这里只负责移除 */
    wrongRemoveMastered: function (id) { MT.store.wrongRemove(id); },

    /* 学习历史 */
    addHistory: function (rec) {
      if (!rec) return;
      var st = loadState();
      st.history.push({
        ts: Date.now(),
        subject: rec.subject || '',
        count: rec.count || 0,
        correct: rec.correct || 0,
        seconds: rec.seconds || 0
      });
      if (st.history.length > HISTORY_CAP) st.history = st.history.slice(-HISTORY_CAP);
      saveState(st);
    },
    historyList: function () {
      return loadState().history.slice(-HISTORY_CAP).reverse(); /* 最近20条，新的在前 */
    },

    /* 贴纸 */
    stickers: function () { return loadState().stickers.slice(); },
    addSticker: function (id) {
      if (!id) return;
      var st = loadState();
      if (st.stickers.indexOf(id) < 0) {
        st.stickers.push(id);
        saveState(st);
      }
    }
  };
})();
