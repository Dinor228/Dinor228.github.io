/* My Tutor · 前端外壳：hash 路由 + 十个视图
 * 只调用同事模块（MT.genQ / MT.store / MT.voice / MT.tutor），全部做缺失容错。
 * 教学内容一律来自 MT.cfg 与 MT.banks，本文件不硬编码任何词表/古诗内容。
 */
window.MT = window.MT || {};

(function () {
  'use strict';

  var cfg = (MT.cfg || {});
  var app = null;

  /* ================= 基础工具 ================= */
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function pickOne(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ''; }

  function toast(msg, ms) {
    var t = qs('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._tm);
    toast._tm = setTimeout(function () { t.hidden = true; }, ms || 1800);
  }

  function confirmBox(text, onOk, okLabel, cancelLabel) {
    var mask = qs('#modal-mask'), txt = qs('#modal-text'), okb = qs('#modal-ok'), cb = qs('#modal-cancel');
    if (!mask) { if (confirm(text)) onOk(); return; }
    txt.textContent = text;
    okb.textContent = okLabel || '好的';
    cb.textContent = cancelLabel || '取消';
    mask.hidden = false;
    okb.onclick = function () { mask.hidden = true; onOk(); };
    cb.onclick = function () { mask.hidden = true; };
  }

  /* ================= 同事模块容错包装 ================= */
  var NOOP = function () { };
  var ST = (function () {
    var s = MT.store;
    function wrap(name, fb) {
      return function () {
        try {
          if (s && typeof s[name] === 'function') {
            var r = s[name].apply(s, arguments);
            return (r === undefined || r === null) ? (typeof fb === 'function' ? fb() : fb) : r;
          }
        } catch (e) { console.warn('store.' + name, e); }
        return typeof fb === 'function' ? fb() : fb;
      };
    }
    return {
      RULES: (s && s.RULES) || { CORRECT: 1, ROUND: 5, PERFECT: 5 },
      stars: wrap('stars', 0),
      addStars: wrap('addStars', NOOP),
      touchStreak: wrap('touchStreak', NOOP),
      streak: wrap('streak', 0),
      todayKey: wrap('todayKey', function () { return new Date().toISOString().slice(0, 10); }),
      mastery: wrap('mastery', { seen: 0, correct: 0 }),
      bumpMastery: wrap('bumpMastery', NOOP),
      wrongAdd: wrap('wrongAdd', NOOP),
      wrongList: wrap('wrongList', []),
      wrongRemove: wrap('wrongRemove', NOOP),
      wrongRemoveMastered: wrap('wrongRemoveMastered', NOOP),
      addHistory: wrap('addHistory', NOOP),
      historyList: wrap('historyList', []),
      stickers: wrap('stickers', []),
      addSticker: wrap('addSticker', NOOP),
      reset: wrap('reset', NOOP)
    };
  })();

  var VO = {
    available: function () {
      try { if (MT.voice && MT.voice.available) return MT.voice.available(); } catch (e) { }
      return { tts: false, asr: false };
    },
    say: function (text, opts) {
      try {
        if (MT.voice && MT.voice.say) { MT.voice.say(text, opts); return; }
      } catch (e) { }
      if (opts && opts.onend) setTimeout(opts.onend, 0);
    },
    stop: function () { try { MT.voice && MT.voice.stop && MT.voice.stop(); } catch (e) { } },
    listen: function (opts) {
      try {
        if (MT.voice && MT.voice.listen && VO.available().asr) { MT.voice.listen(opts); return; }
      } catch (e) { }
      if (opts && opts.onerror) opts.onerror('unsupported');
    },
    unlock: function () { try { MT.voice && MT.voice.unlock && MT.voice.unlock(); } catch (e) { } }
  };

  function genQSafe(subj, level, types, pool) {
    /* 20261108 Chief 热修：拦截依赖原卷截图的题（题面<15字或needsFigure）——banks 只读，消费端拦 */
    var q = __genQSafeOrig(subj, level, types, pool);
    if (q && q.img && (((q.q || '').trim().length < 15) || q.needsFigure)) { console.warn('image-dependent item dropped', q.id || q.src); return null; }
    return q;
  }
  function __genQSafeOrig(subj, level, types, pool) {
    /* pool='daily' → 只出自创题；'midterm'/缺省 → 〔原题〕优先（MATH-ET-09） */
    try { if (MT.genQ) return MT.genQ(subj, level, types, pool ? { pool: pool } : undefined); } catch (e) { console.warn('genQ', e); }
    return null;
  }
  function tutorChat(text, aiOn, opts) {
    try {
      if (MT.tutor && MT.tutor.chat) return Promise.resolve(MT.tutor.chat(text, aiOn, opts));
    } catch (e) { console.warn('tutor.chat', e); }
    return Promise.resolve({ text: quizLang === 'zh' ? '老师的小耳朵暂时没听清，再说一次好吗？' : 'Sorry, my ears missed that — say it again?', src: 'offline' });
  }
  function tutorGrade(q, userText) {
    try {
      if (MT.tutor && MT.tutor.gradeAnswer) return MT.tutor.gradeAnswer(q, userText);
    } catch (e) { console.warn('gradeAnswer', e); }
    var ok = String(userText || '').trim() === String(q && q.a).trim();
    return { ok: ok, normalized: String(userText || '').trim() };
  }

  /* 服务器状态（file:// 或 server 挂了都当离线） */
  /* MT-PAGES-01（构建副本注入）：静态部署无后端——/api/status 不通即全端静默离线，
   * 未发起的 404 才不会进控制台；原件 app.js 不动，回灌须另报 Chief 批 */
  window.MT_OFFLINE_MODE = true;
  var aiState = { ai: false, model: '' };
  function refreshStatus(cb) {
    var apply = function (d) {
      d = d || {};
      var changed = (aiState.ai !== !!d.ai);
      aiState = {
        ai: !!d.ai,
        active: d.active || 'dgx',
        backend: d.backend || 'none',
        model: d.model || '',
        dgx: d.dgx || {},
        deepseek: d.deepseek || {}
      };
      cb && cb(aiState);
      /* INFO-1：直链进 setup 时状态回填晚一帧，导致开放题 chip 首帧缺失 → 变了一次就重渲染 */
      if (changed && parseHash().name === 'setup') render();
    };
    if (typeof fetch !== 'function') { apply({ ai: false }); return; }
    try {
      fetch('/api/status').then(function (r) {
          window.MT_OFFLINE_MODE = !r.ok;
          return r.ok ? r.json() : {};
        })
        .then(function (d) { apply(d); })
        .catch(function () { window.MT_OFFLINE_MODE = true; apply({ ai: false }); });
    } catch (e) { apply({ ai: false }); }
  }

  function backendLabel(st) {
    if (!st || !st.ai) return '离线模式';
    if (st.backend === 'dgx') return 'DGX 本地（' + (st.model || 'Qwen') + '）';
    if (st.backend === 'deepseek') return 'DeepSeek 云端';
    return 'AI';
  }

  /* ================= 运行时语言：除语文外全英语（用户 2026-11-01 指令） ================= */
  function subjectLang(sub) { return sub === 'yuwen' ? 'zh' : 'en'; }

  var L = {
    zh: {
      /* 导航与首页（首页默认英文给孩子，这半边留给语文内部/家长区） */
      navHome: '首页', navPractice: '练习', navChat: '语音对话', navMistakes: '错题本', navParent: '家长区',
      back: '首页',
      greetMorning: '早上好！', greetNoon: '中午好！', greetAfternoon: '下午好！', greetEvening: '晚上好！',
      helloLine: '我是{name}', helloSub: '今天也要开心学习呀～',
      statStreak: '连续打卡（天）', statStars: '收集星星', statStickers: '获得贴纸',
      pickSubject: '选一个科目吧', quickStart: '🚀 快速开始练习',
      reciteEntry: '🎤 背诵闯关（11-06 口试专用）',
      bannerIn: '距离 {name} 还有 {n} 天', bannerToday: '{name} 就是今天！',
      bannerGo: '去练', bannerRecite: '🎤 背诵闯关',
      sectionMid: '🎯 期中复习', sectionDaily: '🌱 日常积累',
      setupTitle: '练习设置', poolQ: '练哪一档', poolMid: '🎯 期中复习', poolDaily: '🌱 日常积累',
      subjQ: '选科目', countQ: '题目数量', countChip: '{n} 题', levelQ: '难度',
      lvEasy: '😊 轻松', lvNormal: '🙂 常规', lvHard: '💪 挑战',
      typesQ: '题型（想练哪个点哪个）',
      openNote: '💡 看图写话 / 写作需要 AI 点评，未配置密钥时暂不出现；家长区填密钥后可用。',
      paperBtn: '📝 期中模拟卷（真卷结构：Part I 计算 14 ＋ Part II 概念 33 ＋ Part III 应用 6）',
      paperShortBtn: '⚡ 速刷卷（8 ＋ 15 ＋ 3，三段顺序不变）',
      printPaperBtn: '🖨 打印完整试卷', printAnswerBtn: '🔑 家长答案卷', printFailToast: '组卷失败，请重试',
      pendingBadge: '待作答 · 不计分', pendingFeedback: '先按你的想法做一遍，做完家长/老师会看。', startBtn: '🚀 开始！', pickTypeToast: '先选一个题型吧',
      previewTitle: '预习 · {n}', startPreview: '📖 开始预习', startPractice: '✏️ 开始练习',
      autoRead: '▶️ 自动连读', stopRead: '⏹ 停下', exampleTitle: '🌰 例题',
      drill: '💪 练一练（5 题）', reciteDrill: '🎤 背诵闯关（口试模式）',
      noTopicToast: '这个主题还没有配套练习', sayAria: '朗读',
      chatTitle: '🎤 和小优老师聊天', chipPoem: '🏮 背诗', chipMul: '✖️ 乘法口诀', chipEn: '🔤 英语对话',
      chatPlaceholder: '想说什么就说…', send: '发送', micTitle: '按住说话',
      chatHi: '你好呀！我是{name}，可以问我背诗、乘法口诀，或者用英语和我聊天！',
      chatHint: '点上面的按钮试试', chatThinking: '小优老师在想…',
      aiOnlineDgx: '🤖 DGX 本地 在线', aiOnlineDs: '🤖 DeepSeek 在线', aiOffline: '📖 离线模式', srcOffline: '📖 离线',
      wrongTitle: '📕 我的错题本', emptyWrong: '太厉害啦，一道错题都没有！',
      emptyWrongSub: '去练一组，把难题抓进来消灭吧', goPractice: '✏️ 去练习',
      wrongCount: '共 {n} 道，答对就消灭它！', clearAll: '🗑 清空', wrongTimes: '错 {n} 次',
      answerLabel: '答案：', redo: '▶️ 重做', delete: '删除', clearLabel: '清空',
      delConfirm: '删除这道错题？', clearConfirm: '确定清空整本错题吗？', clearedToast: '错题本清空啦 🧹',
      redoTitle: '消灭错题', redoPlaceholder: '打字输入答案', typeSubmit: '提交',
      redoCleared: '消灭错题 🎉 太棒了！', redoBack: '回错题本', redoRetry: '没关系，再看一遍讲解！',
      oopsTitle: '哎呀，页面出错了 😵', oopsHome: '回首页',
      progress: '第 {i} 题 / 共 {n} 题',
      pause: '要提前结束这一组吗？已经答的题会保存哦。',
      end: '结束', check: '提交', next: '下一题 →', submit: '✅ 写好了', cancel: '取消',
      typePlaceholder: '把答案打字告诉我…', writePlaceholder: '在这里写下来…',
      bucketHint: '先点一个词，再点它该去的桶', bucketPick: '选出缺的词：',
      pairHint: '点左边的词，再点右边正确的意思（全对才算对）',
      orderHint: '按正确顺序依次点，点错可以重来一次',
      secondBlank: '再选一个：{label}（两空全对才算对）',
      openPraise: '写下来就很棒！', checklist: '📋 检查清单：',
      aiReviewing: '小优老师正在看你的作业…',
      score: '得分', perfect: '全部答对！', again: '🔁 再练一组', home: '🏠 回首页',
      wrongbook: '📕 去错题本', stars: '获得',
      praises: ['太棒了！', '答对啦，真厉害！', '完全正确！', '哇，全对！', '真聪明！'],
      cheers: ['差一点点，再想想！', '没关系，看看讲解就会啦！', '加油，下次一定对！'],
      timeUsed: '用时', seconds: '秒', minutes: '分', correctOf: '答对',
      doubtBadge: '⚠️ 待核',
      wrongTip: '答错的题已经放进 📕 错题本，回头消灭它们！'
    },
    en: {
      /* 导航与首页：孩子打开 App 首先看到的就是这一套 */
      navHome: 'Home', navPractice: 'Practice', navChat: 'Chat', navMistakes: 'My Mistakes', navParent: 'Parent Zone',
      back: 'Home',
      greetMorning: 'Good morning!', greetNoon: 'Good afternoon!', greetAfternoon: 'Good afternoon!', greetEvening: 'Good evening!',
      helloLine: "I'm {name}", helloSub: "Let's have fun learning today!",
      statStreak: 'day streak', statStars: 'stars', statStickers: 'stickers',
      pickSubject: 'Pick a subject', quickStart: '🚀 Quick practice',
      reciteEntry: '🎤 Recitation Challenge (for the 11-06 oral exam)',
      bannerIn: '{name} in {n} {d}', bannerToday: '{name} is today!',   /* {d} = day/days，QA D-R9-2：英语线自己出过 "in 1 days" */
      bannerGo: 'Practice', bannerRecite: '🎤 Recitation Challenge',
      sectionMid: '🎯 Midterm review', sectionDaily: '🌱 Daily practice',
      setupTitle: 'Practice setup', poolQ: 'Which set?', poolMid: '🎯 Midterm', poolDaily: '🌱 Daily',
      subjQ: 'Subject', countQ: 'Questions', countChip: '{n} questions', levelQ: 'Level',
      lvEasy: '😊 Easy', lvNormal: '🙂 Normal', lvHard: '💪 Challenge',
      typesQ: 'Question types (tap the ones you want)',
      openNote: '💡 Picture writing and essay writing need AI feedback. They stay hidden until a parent adds a key in Parent Zone.',
      paperBtn: '📝 Midterm mock paper (real structure: Part I 14 + Part II 33 + Part III 6)',
      paperShortBtn: '⚡ Quick paper (8 + 15 + 3, same three parts)',
      printPaperBtn: '🖨 Printable full paper', printAnswerBtn: '🔑 Parent answer key', printFailToast: 'Paper engine failed, try again',
      pendingBadge: 'Not answered yet · not scored', pendingFeedback: 'Give it your best try — your parent will look at it after.',
      startBtn: '🚀 Start!', pickTypeToast: 'Pick at least one type first',
      previewTitle: 'Preview · {n}', startPreview: '📖 Start preview', startPractice: '✏️ Start practice',
      autoRead: '▶️ Read all', stopRead: '⏹ Stop', exampleTitle: '🌰 Example',
      drill: '💪 Try 5 questions', reciteDrill: '🎤 Recitation Challenge',
      noTopicToast: 'No practice for this topic yet', sayAria: 'Read aloud',
      chatTitle: '🎤 Chat with Miss Xiao You', chipPoem: '🏮 A poem', chipMul: '✖️ Times tables', chipEn: '🔤 English talk',
      chatPlaceholder: 'Say something…', send: 'Send', micTitle: 'Hold to talk',
      chatHi: 'Hi! I am {name}. Ask me for a poem or times tables, or talk with me in English!',
      chatHint: 'Try a button above', chatThinking: 'Miss Xiao You is thinking…',
      aiOnlineDgx: '🤖 DGX local · online', aiOnlineDs: '🤖 DeepSeek · online', aiOffline: '📖 Offline mode', srcOffline: '📖 offline',
      wrongTitle: '📕 My mistakes', emptyWrong: 'Amazing — no mistakes yet!',
      emptyWrongSub: 'Do a round and catch the tricky ones!', goPractice: '✏️ Practice',
      wrongCount: '{n} saved — answer right to clear one!', clearAll: '🗑 Clear all', wrongTimes: 'missed {n}×',
      answerLabel: 'Answer: ', redo: '▶️ Redo', delete: 'Delete', clearLabel: 'Clear',
      delConfirm: 'Delete this mistake?', clearConfirm: 'Clear the whole mistake book?', clearedToast: 'Mistake book cleared 🧹',
      redoTitle: 'Clear a mistake', redoPlaceholder: 'Type your answer', typeSubmit: 'Submit',
      redoCleared: 'Mistake cleared! 🎉 Great job!', redoBack: 'Back to mistakes', redoRetry: "That's okay — read the explanation again!",
      oopsTitle: 'Oops, the page hiccuped 😵', oopsHome: 'Back home',
      progress: 'Question {i} of {n}',
      pause: 'End this round early? Your answers so far are saved.',
      end: 'End', check: 'Check', next: 'Next →', submit: '✅ Done', cancel: 'Cancel',
      typePlaceholder: 'Type your answer…', writePlaceholder: 'Write here…',
      bucketHint: 'Tap a word, then tap its group', bucketPick: 'Pick the missing word:',
      pairHint: 'Tap a word on the left, then its meaning on the right (all correct to score)',
      orderHint: 'Tap the steps in the right order — one retry allowed',
      secondBlank: 'Now pick: {label} (both blanks must be right)',
      openPraise: 'Great job writing it down!', checklist: '📋 Checklist: ',
      aiReviewing: 'Teacher is reading your work…',
      score: 'Score', perfect: 'Perfect run!', again: '🔁 Play again', home: '🏠 Home',
      wrongbook: '📕 Mistakes', stars: 'stars',
      praises: ['Great job! 🌟', 'Perfect! Show it to your parents!', 'Nice thinking!', "You've got this!",
                 'So close! Try once more.', 'Check the hint!', 'Almost — look at the units!',
                 "You're getting better every time!", 'One more try — you can do it!'],
      cheers: ['So close! Try once more.', 'Check the hint!', 'Let\'s slow down and read it again.',
               "Almost — look at the units!", 'One more try — you can do it!'],
      timeUsed: 'Time', seconds: 's', minutes: 'm', correctOf: 'correct',
      doubtBadge: '⚠️ Check with parents',
      wrongTip: 'Wrong answers are saved in 📕 Mistakes — clear them later!'
    }
  };
  var quizLang = 'en';   /* 全局默认英文：打开 App 先看到英文，进入语文科目/家长区才切中文 */
  function T(key, vars) {
    var d = L[quizLang] || L.zh;
    var tpl = d[key] !== undefined ? d[key] : (L.zh[key] || key);
    if (vars) Object.keys(vars).forEach(function (k) { tpl = tpl.replace('{' + k + '}', vars[k]); });
    return tpl;
  }
  /* 题目文本：有英文字段优先（Researcher 对照表到达后自动生效） */
  /* D-R10-1③＋E11（BATCH-1107 §2.9，Chief 17:10 实测结构根因）：quizLang==='en' 时三科
   * 渲染路径命中 CJK＝显式报红＋不放行中文（禁静默 || 中文回落）。语文豁免＝语文科目线内
   * 本就是中文口径。报红双通道（QA d1001 close 判据）：console 'EN_ASSERT|subj|slot|串' ＋
   * DOM [data-en-assert="red"]（由渲染侧调用方挂到容器上）。 */
  var EN_CJK = /[\u4e00-\u9fff]/;
  function enHit(q, slot, txt) {
    if (quizLang !== 'en') return false;
    if (!q || q.subj === 'yuwen') return false;            /* 语文豁免（进语文才中文） */
    if (txt == null || !EN_CJK.test(String(txt))) return false;
    console.error('EN_ASSERT|' + (q.subj || '?') + '|' + (q.type || q.id || '?') + '|' + slot + '|' + String(txt).slice(0, 24));
    return true;
  }
  function qText(q) {
    if (quizLang === 'en' && q.q_en) return q.q_en;
    if (quizLang === 'en' && enHit(q, 'q', q.q)) return '…';   /* 报红不放行 */
    return q.q;
  }
  function qExplain(q) {
    if (quizLang === 'en' && q.explain_en) return q.explain_en;
    if (quizLang === 'en' && enHit(q, 'explain', q.explain)) return '';  /* 反馈侧空串→调用方走 Answer 兜底 */
    return q.explain || '';
  }
  function qSpeak(q) {
    if (quizLang === 'en' && q.speak_en) return q.speak_en;
    if (quizLang === 'en' && enHit(q, 'speak', q.speak || q.q)) return ''; /* 不念中文 */
    return q.speak || q.q;
  }
  /* E11：zh-note 渲染闸——三科 en 模式一律不挂 zh-note（语文科目卡豁免）；返回 ''＝DOM 无中文节点 */
  function zhNoteHtml(q) {
    if (quizLang !== 'en' || !q) return '';
    if (q.subj === 'yuwen') return q.explainZh ? '<span class="zh-note">' + esc(q.explainZh) + '</span>' : '';
    if (enHit(q, 'zh-note', q.explainZh)) return '';
    return q.explainZh ? '<span class="zh-note">' + esc(q.explainZh) + '</span>' : '';
  }

  /* ================= 语言判定（朗读用） ================= */
  function speakLangOf(q) {
    if (!q) return 'zh-CN';
    if (q.speak_en) return 'en-US';
    if (subjectLang(q.subj) === 'zh') return 'zh-CN';           /* 语文：中文嗓 */
    var say = q.speak || q.q || '';
    /* 内容尚未英化（数据对照表未到）时，中文文本仍用中文嗓，避免英文音色读中文 */
    if (/[\u4e00-\u9fa5]/.test(say)) return 'zh-CN';
    if (/[a-zA-Z]{2,}/.test(say)) return 'en-US';
    return 'zh-CN';
  }

  /* 题型中文名（纯 UI 文案，不属于教学内容） */
  var TYPE_LABEL = {
    pinyin: '拼音', zuci: '组词', jinyi: '近反义词', liangci: '量词', poem: '古诗',
    calc_add: '加法', calc_sub: '减法', calc100: '加减混合', mul: '乘法口诀', cmp: '比大小',
    len: '长度', money: '人民币', clock: '认识时间', word: '应用题', seq: '找规律', shape: '图形与角',
    listen: '听力', cn2en: '中译英', en2cn: '英译中', spell: '拼写', cloze: '选词填空', phrase: '情景交际',
    /* 2026 期中新题型 */
    py2han: '看拼音写词', addradical: '加偏旁组词', duyin: '选读音', huanzi: '辨形近字',
    /* INGEST-03 新题型补挂（D-R11-3，2026-11-07 签发轮 r1 抓漏：交付时 TYPE_LABEL 冻结在 11-05 23:38 未含三键，chip 裸 id 违"进语文才中文"） */
    duyin_table: '多音字全表', simile: '比喻分析', simile_open: '写比喻句',
    panduan: '判断对错', zhaoyang: '照样子写句', kewen_read: '课内阅读', kewai2: '课外阅读',
    kanshuxiehua: '看图写话', recite: '背诵闯关',
    calc120_add: '口算加法', calc120_sub: '口算减法', vertical_add: '竖式加法', vertical_sub: '竖式减法',
    strategy: '计算策略', len_mixed: '长度单位', perimeter: '周长', shape2d: '平面图形',
    shape3d: '立体图形', area_grid: '面积', word120: '应用题',
    /* 卷面新槽位（MATH-02） */
    open_number_line: '开放数轴', bar_model: '条形模型', place_value: '数位与方块',
    table_read: '读表', pattern: '图形规律', square_count: '数方块',
    vocab_match: '词义匹配', vocab_sent: '选词填空', vocab_def: '看义选词', spell_rule: '拼读规则',
    grammar: '语法', reading_skill: '阅读技能', alpha_order: '字母顺序', writing: '写作',
    sci: '科学',
    en_sort: '分类归桶', en_match: '词义配对', en_order: '事件排序', en_fill: '词形填空'
  };

  /* 题型 chip 英文名（§3，41 键英文化；语文 15 键保持中文） */
  var TYPE_LABEL_EN = {
    calc_add: 'Addition', calc_sub: 'Subtraction', calc100: 'Mixed Add & Subtract', mul: 'Multiplication Facts',
    cmp: 'Compare Numbers', len: 'Length', clock: 'Telling Time', money: 'Money', word: 'Word Problems',
    word120: 'Word Problems', seq: 'Patterns', shape: 'Shapes & Angles', calc120_add: 'Mental Addition',
    calc120_sub: 'Mental Subtraction', vertical_add: 'Column Addition', vertical_sub: 'Column Subtraction',
    strategy: 'Math Strategies', len_mixed: 'Measuring Lengths', perimeter: 'Perimeter',
    shape2d: '2D Shapes', shape3d: '3D Shapes', area_grid: 'Area',
    /* 卷面新槽位（MATH-02） */
    open_number_line: 'Open Number Line', bar_model: 'Bar Model', place_value: 'Place Value',
    table_read: 'Read the Table', pattern: 'Figure Patterns', square_count: 'Count the Squares',
    listen: 'Listening', cn2en: 'Chinese → English', en2cn: 'English → Chinese', spell: 'Spelling',
    cloze: 'Fill in the Blank', phrase: 'Situations & Phrases', vocab_match: 'Word Meanings',
    vocab_sent: 'Fill in the Blank', vocab_def: 'Match the Meaning', spell_rule: 'Phonics',
    grammar: 'Grammar', reading_skill: 'Reading Skills', alpha_order: 'ABC Order', writing: 'Writing',
    en_sort: 'Sort It Out', en_match: 'Word Match', en_order: 'Put It in Order', en_fill: 'Word Form',
    sci: 'Science', sci_observe: 'Work Like a Scientist', sci_animals: 'All About Animals',
    duyin_table: 'All Readings', simile: 'Simile Analysis', simile_open: 'Write a Simile'   /* D-R11-3 */
  };
  function typeLabel(t, lang) {
    var useEn = (lang || quizLang) === 'en';
    return (useEn && TYPE_LABEL_EN[t]) ? TYPE_LABEL_EN[t] : (TYPE_LABEL[t] || t);
  }

  function topicTypesFor(subj) {
    var set = [];
    ((cfg.topics && cfg.topics[subj]) || []).forEach(function (t) {
      if (t.gen && t.gen.types) t.gen.types.forEach(function (x) { if (set.indexOf(x) < 0) set.push(x); });
    });
    return set;
  }

  /* ================= 撒花动画 ================= */
  function celebrate(container) {
    if (!container) return;
    var em = ['🎉', '⭐', '🌸', '✨', '🎊'];
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.className = 'confetti-piece';
      s.textContent = em[i % em.length];
      s.style.left = (6 + Math.random() * 88) + '%';
      s.style.animationDelay = (Math.random() * 0.25) + 's';
      container.appendChild(s);
      setTimeout(function (n) { return function () { n.parentNode && n.parentNode.removeChild(n); }; }(s), 1400);
    }
  }

  /* ================= 路由 ================= */
  var TAB_OF = { home: 'home', subject: 'home', preview: 'home', recite: 'home', setup: 'setup', quiz: 'setup', result: 'setup', chat: 'chat', wrongbook: 'wrongbook', parent: 'parent' };

  function parseHash() {
    var h = (location.hash || '#/home').replace(/^#\/?/, '');
    var segs = h ? h.split('/') : ['home'];
    return { name: segs[0] || 'home', a: segs[1], b: segs[2] };
  }

  function go(hash) { location.hash = hash; }

  /* 路由语言：孩子从打开 App 到点开 Chinese 卡（或家长区）之前，看到的每个字都是英文 */
  function routeLang(r) {
    if (r.name === 'parent' || r.name === 'recite') return 'zh';            /* 家长区内部 / 背诵闯关（语文） */
    if (r.name === 'essay') return 'en';                                      /* ESSAY-MOD-01：英语语境全程英文 */
    if (r.name === 'subject' || r.name === 'preview') return subjectLang(r.a);
    if (r.name === 'setup') return subjectLang((r.a && cfg.subjects && cfg.subjects[r.a]) ? r.a : setupSel.subj);
    return 'en';                                                            /* home / chat / wrongbook / 兜底 */
  }

  /* 底部导航文案（全局英文，属 App 外壳；语文科目内部也不切回中文） */
  function tabLabels() {
    var map = { home: 'navHome', setup: 'navPractice', chat: 'navChat', wrongbook: 'navMistakes', parent: 'navParent' };
    var savedLang = quizLang;
    quizLang = 'en';
    qsa('#tabbar .tab').forEach(function (a) {
      var lab = a.querySelector('.tab-label');
      if (lab) lab.textContent = T(map[a.getAttribute('data-tab')] || 'navHome');
    });
    quizLang = savedLang;
  }

  function render() {
    app = app || qs('#app');
    VO.stop();
    autoRead.on = false;
    if (quizTimer) { clearTimeout(quizTimer); quizTimer = null; }
    /* 切走答题视图则丢弃当前会话，避免自动推进把用户拉回答题页 */
    if (quiz && parseHash().name !== 'quiz') { wStop(); quiz = null; }   /* 限时写作计时器也要收掉 */
    var r = parseHash();
    tabLabels();
    /* quiz / result 由各自流程设定语言，其余按路由上下文 */
    if (r.name !== 'quiz' && r.name !== 'result') quizLang = routeLang(r);
    var fn = VIEWS[r.name] || VIEWS.home;
    try {
      fn(r);
    } catch (e) {
      console.error(e);
      app.innerHTML = '<div class="card"><h2>' + esc(T('oopsTitle')) + '</h2><p class="muted">' + esc(e.message) + '</p>' +
        '<a class="btn btn-primary" href="#/home">' + esc(T('oopsHome')) + '</a></div>';
    }
    var tab = TAB_OF[r.name] || 'home';
    qsa('#tabbar .tab').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-tab') === tab);
    });
    window.scrollTo(0, 0);
  }

  function mount(html, subj) {
    var cls = 'view' + (subj ? ' subj-' + subj : '');
    /* MT-UX-LANDSCAPE-02 定版④：家长区路由统一挂网格类（mount 收口，两态必挂——
       QA-02 V-G6 教训：挂点埋解锁分支里，二次进入/竞态走别的路径就不生效） */
    if (location.hash.indexOf('#/parent') === 0 && window.innerWidth >= 1000) cls += ' parent-grid';
    app.innerHTML = '<div class="' + cls + '">' + html + '</div>';
  }

  function crumbs(items) {
    return '<a class="crumb" href="' + esc(items[0]) + '">← ' + esc(items[1]) + '</a>';
  }

  /* 主题卡按"期中复习 / 日常积累"分组渲染（同一科里两类卡不混排） */
  function topicCards(topics) {
    var html = '<div class="topic-grid">';
    topics.forEach(function (t) {
      html += '<button class="topic-card" data-go="#/preview/' + esc(t._subj) + '/' + esc(t.id) + '">' +
        '<span class="tc-emoji">' + esc(t.emoji || '🌟') + '</span>' +
        '<span class="tc-title">' + esc(t.title) + '</span>' +
        '<span class="tc-brief">' + esc(t.brief || '') + '</span></button>';
    });
    return html + '</div>';
  }
  function groupedTopics(subj) {
    var all = ((cfg.topics && cfg.topics[subj]) || []).map(function (t) {
      var c = {}; for (var k in t) c[k] = t[k]; c._subj = subj; return c;
    });
    var mid = all.filter(function (t) { return (t.pool || 'daily') === 'midterm'; });
    var daily = all.filter(function (t) { return (t.pool || 'daily') !== 'midterm'; });
    var html = '';
    if (mid.length) html += '<h3 class="sec-title">' + esc(T('sectionMid')) + '</h3>' + topicCards(mid);
    if (daily.length) html += '<h3 class="sec-title">' + esc(T('sectionDaily')) + '</h3>' + topicCards(daily);
    return html;
  }

  function subjectHead(subj, title) {
    var s = (cfg.subjects && cfg.subjects[subj]) || { name: subj, emoji: '📚' };
    return crumbs(['#/home', T('back')]) +
      '<h2 class="view-title">' + esc(s.emoji) + ' ' + esc(title || subjName(subj)) + '</h2>';
  }

  var SUBJ_ORDER = ['yuwen', 'math', 'english', 'science', 'essay']; /* Essay＝顶层第六科（家长 11-15 批准①） */

  /* 科目名/副标题按当前界面语言取（英文界面下语文显示 Chinese） */
  function subjName(k) {
    var s = (cfg.subjects && cfg.subjects[k]) || {};
    if (quizLang === 'zh') return s.name || k;
    return s.name_en || s.name || k;
  }
  function subjDesc(k) {
    var s = (cfg.subjects && cfg.subjects[k]) || {};
    if (quizLang === 'zh') return s.desc || '';
    return s.desc_en || s.desc || '';
  }

  /* 期中倒计时横幅：按最近一场考试滚动（11-06 口试 → 11-10 笔试/科学 → 11-11 英语 → 11-12 数学） */
  function examBanner() {
    var exams = (cfg.midterm && cfg.midterm.exams) || [];
    if (!exams.length) return '';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var upcoming = exams.filter(function (e) {
      var d = new Date(e.date + 'T00:00:00');
      return d.getTime() >= today.getTime();
    }).sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    if (!upcoming.length) return '';
    var e = upcoming[0];
    var d = new Date(e.date + 'T00:00:00');
    var days = Math.round((d.getTime() - today.getTime()) / 86400000);
    /* 横幅在首页（英文区），考试名/天数/按钮一律英文；语文考试也走 name_en（Chinese Oral Exam） */
    var examName = e.name_en || e.name;
    var examTip = e.tip_en || e.tip || '';
    var when = days === 0 ? esc(T('bannerToday', { name: examName })) : esc(T('bannerIn', { name: examName, n: days, d: days === 1 ? 'day' : 'days' }));
    var html = '<div class="mt-banner">' +
      '<div class="mt-banner-main">📅 <b>' + when + '</b></div>' +
      '<div class="mt-banner-sub">' + esc(e.date) + ' · ' + esc(examTip) + '</div>' +
      '<div class="row" style="margin-top:10px">' +
      '<button class="btn btn-primary btn-sm" data-go="#/setup/' + esc(e.subj) + '/midterm">' + esc(T('bannerGo')) + ' ' + esc(subjName(e.subj)) + '</button>' +
      (e.subj === 'yuwen' ? '<button class="btn btn-ghost btn-sm" data-go="#/recite">' + esc(T('bannerRecite')) + '</button>' : '') +
      '</div></div>';
    return html;
  }

  /* ================= 视图 1：首页 ================= */
  function vHome() {
    var streak = ST.streak();
    var stars = ST.stars();
    var hour = new Date().getHours();
    var greet = hour < 11 ? T('greetMorning') : (hour < 14 ? T('greetNoon') : (hour < 18 ? T('greetAfternoon') : T('greetEvening')));
    var teacher = quizLang === 'zh' ? (cfg.tutorName || '小优老师') : (cfg.tutorNameEn || 'Miss Xiao You');
    var html = examBanner() + '<div class="hello"><span class="mascot">' + esc(cfg.mascot || '🐼') + '</span><div>' +
      '<div class="hello-text">' + esc(greet) + ' ' + esc(T('helloLine', { name: teacher })) + '</div>' +
      '<div class="hello-sub">' + esc(T('helloSub')) + '</div></div></div>' +
      '<div class="stats">' +
      '<div class="stat"><b>🔥 ' + streak + '</b><span>' + esc(T('statStreak')) + '</span></div>' +
      '<div class="stat"><b>⭐ ' + stars + '</b><span>' + esc(T('statStars')) + '</span></div>' +
      '<div class="stat"><b>🏅 ' + ST.stickers().length + '</b><span>' + esc(T('statStickers')) + '</span></div>' +
      '</div>' +
      '<h3 class="sec-title">' + esc(T('pickSubject')) + '</h3>' +
      '<div class="subj-grid">';
    SUBJ_ORDER.forEach(function (k) {
      if (!cfg.subjects || !cfg.subjects[k]) return;
      var s = cfg.subjects[k];
      html += '<button class="subj-card sc-' + k + '" data-go="#/subject/' + k + '">' +
        '<span class="sc-emoji">' + esc(s.emoji || '📚') + '</span>' +
        '<span class="sc-name">' + esc(subjName(k)) + '</span>' +
        '<span class="sc-desc">' + esc(subjDesc(k)) + '</span></button>';
    });
    html += '</div>' +
      '<div style="margin-top:18px"><button class="btn btn-primary btn-big" data-go="#/setup">' + esc(T('quickStart')) + '</button></div>' +
      (MT.BF_BANK && MT.BF_BANK.sets && MT.BF_BANK.sets.length
        ? '<div style="margin-top:10px"><button class="btn btn-primary btn-big" data-go="#/bf" style="background:#2e75b6">⏱ Basic Facts <span class="muted" style="color:#dbe9f7">· 2 sets · timed</span></button></div>'
        : '') +
      (MT.AMC_BANK && MT.AMC_BANK.qs && MT.AMC_BANK.qs.length
        ? '<div style="margin-top:10px"><button class="btn btn-primary btn-big" data-go="#/amc" style="background:#7a4bbd">🏆 AMC Challenge <span class="muted" style="color:#e6dcf5">· Pre-A · A · B · C</span></button></div>'
        : '') +
      (MT.MAP_BANK && (MT.MAP_BANK.skills || MT.MAP_BANK.words || MT.MAP_BANK.items)
        ? '<div style="margin-top:10px"><button class="btn btn-primary btn-big" data-go="#/map" style="background:#1f8a70">📖 MAP Reading <span class="muted" style="color:#d9f2ea">· Skills · Words · Practice</span></button></div>'
        : '') +
      ((MT.banks && MT.banks.RECITE && MT.banks.RECITE.length) || (typeof window !== 'undefined' && window.RT && window.RT.data)
        ? '<div style="margin-top:10px"><button class="btn btn-ghost btn-big" data-go="#/recite">' + esc(T('reciteEntry')) + '</button></div>'
        : '');
    mount(html);
    bindGo();
  }

  /* ================= 视图 2：科目菜单 ================= */
  function vSubject(r) {
    var subj = r.a;
    if (!cfg.subjects || !cfg.subjects[subj]) { go('#/home'); return; }
    var html = subjectHead(subj) +
      '<div class="row" style="margin:10px 0">' +
      '<button class="btn btn-primary grow" data-go="#/preview/' + subj + '">' + esc(T('startPreview')) + '</button>' +
      '<button class="btn btn-ghost grow" data-go="#/setup/' + subj + '">' + esc(T('startPractice')) + '</button></div>' +
      groupedTopics(subj);
    mount(html, subj);
    bindGo();
  }

  /* ================= 视图 3：预习列表 ================= */
  function vPreviewList(r) {
    var subj = r.a;
    if (!cfg.subjects || !cfg.subjects[subj]) { go('#/home'); return; }
    var html = subjectHead(subj, T('previewTitle', { n: subjName(subj) })) + groupedTopics(subj);
    mount(html, subj);
    bindGo();
  }

  /* ================= 视图 4：预习详情 ================= */
  var autoRead = { on: false };

  function vPreviewDetail(r) {
    var subj = r.a, tid = r.b;
    var topic = null;
    ((cfg.topics && cfg.topics[subj]) || []).forEach(function (t) { if (t.id === tid) topic = t; });
    if (!topic) { go('#/preview/' + subj); return; }
    var tts = VO.available().tts;
    /* D-R10-1③＋E11：预习页渲染闸——en 模式三科命中 CJK＝报红＋逐字遮罩（不放行中文）＋DOM 红标 */
    function enSafe(v, slot) {
      var s = v == null ? '' : String(v);
      if (quizLang === 'en' && subj !== 'yuwen' && EN_CJK.test(s)) {
        console.error('EN_ASSERT|' + subj + '|' + tid + '|' + slot + '|' + s.slice(0, 24));
        return { text: s.replace(/[\u4e00-\u9fff]/g, '…'), red: true };
      }
      return { text: s, red: false };
    }
    var oT = enSafe(topic.title, 'title'), oB = enSafe(topic.brief, 'brief');
    var html = subjectHead(subj, esc(topic.emoji || '') + ' ' + esc(oT.text)) +
      '<p class="muted"' + (oB.red ? ' data-en-assert="red"' : '') + '>' + esc(oB.text) + '</p>';
    (topic.points || []).forEach(function (p, i) {
      var oP = enSafe(p, 'points[' + i + ']');
      html += '<div class="point-item"><span class="pt-no">' + (i + 1) + '</span>' +
        '<span class="pt-text"' + (oP.red ? ' data-en-assert="red"' : '') + '>' + esc(oP.text) + '</span>' +
        (tts ? '<button class="say-btn" data-say="' + i + '" aria-label="' + esc(T('sayAria')) + '">🔊</button>' : '') +
        '</div>';
    });
    if (tts && (topic.points || []).length > 1) {
      html += '<div class="row" style="margin:8px 0"><button class="btn btn-ghost btn-sm" id="auto-read">' + esc(T('autoRead')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" id="read-stop">' + esc(T('stopRead')) + '</button></div>';
    }
    if (topic.example) {
      var oQ = enSafe(topic.example.q, 'example.q'), oA = enSafe(topic.example.a, 'example.a');
      html += '<h3 class="sec-title">' + esc(T('exampleTitle')) + '</h3><div class="example-box"' + ((oQ.red || oA.red) ? ' data-en-assert="red"' : '') + '>' +
        '<div class="ex-q">' + esc(oQ.text) + '</div>' +
        '<div class="ex-a">' + esc(oA.text) + '</div></div>';
    }
    if (topic.gen && topic.gen.types && topic.gen.types.indexOf('recite') >= 0) {
      html += '<div style="margin-top:16px"><button class="btn btn-primary btn-big" id="recite-go">' + esc(T('reciteDrill')) + '</button></div>';
    }
    html += '<div style="margin-top:16px"><button class="btn btn-primary btn-big" id="drill">' + esc(T('drill')) + '</button></div>';
    mount(html, subj);

    qsa('[data-say]').forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute('data-say');
        VO.say(topic.points[i], { lang: quizLang === 'zh' ? 'zh-CN' : 'en-US' });
      };
    });
    var ar = qs('#auto-read');
    if (ar) ar.onclick = function () {
      autoRead.on = true;
      (function readNext(i) {
        if (!autoRead.on) return;
        if (i >= (topic.points || []).length) { autoRead.on = false; return; }
        VO.say(topic.points[i], { lang: quizLang === 'zh' ? 'zh-CN' : 'en-US', onend: function () { readNext(i + 1); } });
      })(0);
    };
    var rs = qs('#read-stop');
    if (rs) rs.onclick = function () { autoRead.on = false; VO.stop(); };

    var rg = qs('#recite-go');
    if (rg) rg.onclick = function () { go('#/recite'); };
    var drill = qs('#drill');
    if (drill) drill.onclick = function () {
      var types = (topic.gen && topic.gen.types && topic.gen.types.length) ? topic.gen.types : topicTypesFor(subj);
      if (!types.length) { toast(T('noTopicToast')); return; }
      /* 主题卡快练：跟随该主题的档位，期中主题才混〔原题〕 */
      startQuiz(subj, 2, types, 5, topic.pool === 'midterm' ? 'midterm' : 'daily');
    };
  }

  /* ================= 视图 5：练习设置 ================= */
  var setupSel = { subj: 'math', count: 10, level: 2, types: null, pool: null, sig: '' };
  var OPEN_TYPES = ['kanshuxiehua', 'writing', 'simile_open']; /* 开放题：仅 AI 可用时出（简报 §6.4）；simile_open＝INGEST-03 写比喻句 */

  function poolTopics(subj, pool) {
    return ((cfg.topics && cfg.topics[subj]) || []).filter(function (t) { return (t.pool || 'daily') === pool; });
  }
  function poolTypesOf(subj, pool) {
    var set = [];
    poolTopics(subj, pool).forEach(function (t) {
      if (t.gen && t.gen.types) t.gen.types.forEach(function (x) { if (set.indexOf(x) < 0) set.push(x); });
    });
    return set;
  }
  function filterOpen(types) {
    var list = types.slice();
    if (aiState.ai) return list;
    return list.filter(function (t) { return OPEN_TYPES.indexOf(t) < 0 || t === 'writing'; }); /* INFO-2：writing 离线不消失（降级态评分区），其余开放题仍 AI-only */
  }

  function vSetup(r) {
    if (r.a && cfg.subjects && cfg.subjects[r.a]) setupSel.subj = r.a;
    if (r.b === 'midterm' || r.b === 'daily') setupSel.pool = r.b;
    var subj = setupSel.subj;
    var hasMid = poolTopics(subj, 'midterm').length > 0;
    if (!setupSel.pool) setupSel.pool = hasMid ? 'midterm' : 'daily';
    if (!poolTopics(subj, setupSel.pool).length) setupSel.pool = hasMid ? 'midterm' : 'daily';

    /* 空数据题型不出 chip（QA D-1：原来只按 config 声明列 chip，数据没到的题型会空转）
     * 按当前档位判断：槽位里只剩「不判分」条目时，日常档不显示该 chip（期中档才显示） */
    var hasData = function (t) {
      try { return !MT.typeHasData || MT.typeHasData(t, setupSel.pool); } catch (e) { return true; }
    };
    var avail = filterOpen(poolTypesOf(subj, setupSel.pool)).filter(hasData);
    if (!avail.length) avail = filterOpen(topicTypesFor(subj));
    var sig = subj + '|' + setupSel.pool + '|' + (aiState.ai ? 'ai' : 'off');
    if (setupSel.sig !== sig || !setupSel.types) {
      setupSel.types = avail.slice();
      setupSel.sig = sig;
    } else {
      setupSel.types = setupSel.types.filter(function (t) { return avail.indexOf(t) >= 0; });
    }
    if (!setupSel.types.length) setupSel.types = avail.slice();

    var html = subjectHead(subj, T('setupTitle'));
    if (hasMid) {
      html += '<label class="opt-label">' + esc(T('poolQ')) + '</label><div class="chip-group">' +
        '<button class="chip' + (setupSel.pool === 'midterm' ? ' on' : '') + '" data-pool="midterm">' + esc(T('poolMid')) + '</button>' +
        '<button class="chip' + (setupSel.pool === 'daily' ? ' on' : '') + '" data-pool="daily">' + esc(T('poolDaily')) + '</button></div>';
    }
    html += '<label class="opt-label">' + esc(T('subjQ')) + '</label><div class="chip-group">';
    SUBJ_ORDER.forEach(function (k) {
      if (!cfg.subjects || !cfg.subjects[k]) return;
      if (k === 'essay') return; /* Essay 走 #/essay 自有流程（ESSAY-MOD-01），不进 Practice 题库面板 */
      var s = cfg.subjects[k];
      html += '<button class="chip' + (k === subj ? ' on' : '') + '" data-subj="' + k + '">' + esc(s.emoji || '') + ' ' + esc(subjName(k)) + '</button>';
    });
    html += '</div>';
    html += '<label class="opt-label">' + esc(T('countQ')) + '</label><div class="chip-group">';
    [5, 10, 15].forEach(function (n) {
      html += '<button class="chip' + (n === setupSel.count ? ' on' : '') + '" data-count="' + n + '">' + esc(T('countChip', { n: n })) + '</button>';
    });
    html += '</div>';
    html += '<label class="opt-label">' + esc(T('levelQ')) + '</label><div class="chip-group">';
    [[1, T('lvEasy')], [2, T('lvNormal')], [3, T('lvHard')]].forEach(function (p) {
      html += '<button class="chip' + (p[0] === setupSel.level ? ' on' : '') + '" data-level="' + p[0] + '">' + esc(p[1]) + '</button>';
    });
    html += '</div>';
    html += '<label class="opt-label">' + esc(T('typesQ')) + '</label><div class="chip-group" id="type-chips">';
    avail.forEach(function (t) {
      html += '<button class="chip' + (setupSel.types.indexOf(t) >= 0 ? ' on' : '') + '" data-type="' + esc(t) + '">' + esc(typeLabel(t, subjectLang(subj))) + '</button>';
    });
    html += '</div>';
    if (OPEN_TYPES.some(function (t) { return (poolTypesOf(subj, setupSel.pool)).indexOf(t) >= 0; }) && !aiState.ai) {
      html += '<p class="muted">' + esc(T('openNote')) + '</p>';
    }
    if (subj === 'math' && setupSel.pool === 'midterm') {
      html += '<div style="margin-top:10px"><button class="btn btn-ghost btn-big" id="paper-btn">' + esc(T('paperBtn')) + '</button>' +
        '<button class="btn btn-ghost" id="paper-short-btn" style="margin-top:8px">' + esc(T('paperShortBtn')) + '</button></div>';
    }
    /* MT-EXAM-01-UI：四科打印完整试卷（exam-gen.js 组卷引擎，A4 可打印；语文学生卷零分值·裁A）
     * data-act=exam 为 QA UI 断言可编程触发点（闸契约②），MT.examUI.open 同义别名 */
    if (setupSel.pool === 'midterm') {
      html += '<div style="margin-top:10px"><button class="btn btn-ghost btn-big" data-act="exam" data-answers="0" id="print-paper-btn">' + esc(T('printPaperBtn')) + '</button>' +
        ' <button class="btn btn-ghost" data-act="exam" data-answers="1" id="print-answer-btn">' + esc(T('printAnswerBtn')) + '</button></div>';
    }
    html += '<div style="margin-top:14px"><button class="btn btn-primary btn-big" id="go-quiz">' + esc(T('startBtn')) + '</button></div>';
    mount(html, subj);

    qsa('[data-pool]').forEach(function (b) {
      b.onclick = function () { setupSel.pool = b.getAttribute('data-pool'); setupSel.sig = ''; vSetup({ a: setupSel.subj, b: setupSel.pool }); };
    });
    qsa('[data-subj]').forEach(function (b) {
      b.onclick = function () { setupSel.subj = b.getAttribute('data-subj'); setupSel.pool = null; setupSel.sig = ''; vSetup({ a: setupSel.subj }); };
    });
    qsa('[data-count]').forEach(function (b) {
      b.onclick = function () { setupSel.count = +b.getAttribute('data-count'); vSetup({}); };
    });
    qsa('[data-level]').forEach(function (b) {
      b.onclick = function () { setupSel.level = +b.getAttribute('data-level'); vSetup({}); };
    });
    qsa('#type-chips .chip').forEach(function (b) {
      b.onclick = function () {
        var t = b.getAttribute('data-type');
        var i = setupSel.types.indexOf(t);
        if (i >= 0) setupSel.types.splice(i, 1); else setupSel.types.push(t);
        b.classList.toggle('on');
      };
    });
    /* 期中模拟卷：按真卷 A（G2 数学模拟卷 review/001–007）三段结构出（MATH-ET-10）
     * Part One Calculation 14（8 basic facts 含填缺数 + 2 竖式 + 2 partial sums + 2 compensation）
     * Part Two Concepts 33（选择 15 + 比大小 6 + 术语词库 2 + ONL 1 + 行列面积 1 + 组数 3 + TF 4 + 作图 1 + 量边求周长 1）
     * Part Three Application 6（两步/多余信息/bar model/hidden question/读表）
     * 卷面 33 段内容稿按小节实数为 34，此处以 33 为限（内容稿 §0 口径），多出的 1 题在池内随机替换 */
    var PAPER_FULL = [
      { label: 'Part I · Calculation', types: ['calc120_add', 'calc120_sub', 'vertical_add', 'vertical_sub', 'strategy'], n: 14 },
      { label: 'Part II · Concepts', types: ['cmp', 'strategy', 'open_number_line', 'area_grid', 'place_value', 'shape2d', 'shape3d', 'len_mixed', 'perimeter', 'square_count'], n: 33 },
      { label: 'Part III · Application', types: ['word120', 'bar_model', 'table_read'], n: 6,
        nos: ['A3-1', 'A3-2', 'A3-3', 'A3-4', 'A3-5', 'A3-6'] }    /* 定向取卷面那 6 道应用题（孩子还没做，pending 不判分） */
    ];
    var PAPER_SHORT = [   /* 速刷版：三段顺序与命名照卷，题量缩为 8/15/3（内容稿 §0 允许的缩短） */
      { label: 'Part I · Calculation', types: ['calc120_add', 'calc120_sub', 'vertical_add', 'vertical_sub', 'strategy'], n: 8 },
      { label: 'Part II · Concepts', types: ['cmp', 'strategy', 'open_number_line', 'area_grid', 'place_value', 'shape2d', 'shape3d', 'len_mixed', 'perimeter', 'square_count'], n: 15 },
      { label: 'Part III · Application', types: ['word120', 'bar_model', 'table_read'], n: 3,
        nos: ['A3-1', 'A3-3', 'A3-6'] }   /* 三色球连减 / bar model 分配 / 读表选运算 */
    ];
    var pb = qs('#paper-btn');
    if (pb) pb.onclick = function () { startQuiz('math', 3, PAPER_FULL, 53, 'midterm'); };
    var pbs = qs('#paper-short-btn');
    if (pbs) pbs.onclick = function () { startQuiz('math', 3, PAPER_SHORT, 26, 'midterm'); };
    /* MT-EXAM-01-UI 接线：懒加载 exam-gen.js → 组卷 → blob 新窗口打印 */
    var examGenLoading = false;
    function ensureExamGen(cb) {
      if (MT.examBuild) return cb();
      if (examGenLoading) { setTimeout(function () { ensureExamGen(cb); }, 200); return; }
      examGenLoading = true;
      var sc = document.createElement('script');
      sc.src = 'js/exam-gen.js';
      sc.onload = function () { examGenLoading = false; if (MT.examBuild) cb(); else toast(T('printFailToast')); };
      sc.onerror = function () { examGenLoading = false; toast(T('printFailToast')); };
      document.head.appendChild(sc);
    }
    function openPaper(sub, withAnswers) {
      ensureExamGen(function () {
        try {
          var seed = (Date.now() % 1e9) | 0;   // 卷首印 Seed：同 seed 可复算（QA B5 锁卷）
          var paper = MT.examBuild(sub, { seed: seed });
          var doc = MT.examRenderHTML(paper, !!withAnswers, { hidePoints: sub === 'yuwen' });
          var url = URL.createObjectURL(new Blob([doc], { type: 'text/html;charset=utf-8' }));
          window.open(url, '_blank');
        } catch (e) { toast(T('printFailToast')); }
      });
    }
    MT.examUI = { open: openPaper };   // QA 闸契约②：可编程触发点 MT.examUI.open(subject, withAnswers)
    qsa('[data-act="exam"]').forEach(function (b) {
      b.onclick = function () { openPaper(setupSel.subj, b.getAttribute('data-answers') === '1'); };
    });
    var goBtn = qs('#go-quiz');
    if (goBtn) goBtn.onclick = function () {
      var types = setupSel.types && setupSel.types.length ? setupSel.types.slice() : avail;
      if (!types.length) { toast(T('pickTypeToast')); return; }
      /* 必须把档位透传下去：缺省档不出〔原题〕，只有期中档才混真题（MATH-ET-09） */
      startQuiz(setupSel.subj, setupSel.level, types, setupSel.count, setupSel.pool);
    };
  }

  /* ================= 视图 6：答题 ================= */
  var quiz = null;      /* {subj,level,types,count,qs,idx,correct,t0,answered} */
  var quizTimer = null; /* 自动下一题/自动推进的定时器：切走视图时必须清掉，否则会把页面拉回答题 */
  var RESULT = null;    /* 结束后给 result 视图用 */

  function startQuiz(subj, level, types, count, pool) {
    /* 20261108 Chief 热修：原卷扫描件含教师批改（答案可见），整题依赖图的题下架不出现 */
    if (Array.isArray(pool)) pool = pool.filter(function (it) {
      return !(it && it.img && ((it.q || '').trim().length < 15 || it.needsFigure));
    });
    /* types 可以是题型数组，也可以是分段计划 [{types:[], n, label}]（期中模拟卷，按真卷三段命名） */
    var specs = (Array.isArray(types) && types.length && typeof types[0] === 'object')
      ? types.slice() : [{ types: types, n: count }];
    var qsArr = [];
    var stamp = Date.now().toString(36);
    specs.forEach(function (sp) {
      var n = Math.max(1, sp.n || 5);
      var guard = 0, got = 0;
      /* 定向题（sp.nos）：按题号先取卷面原题。Part III 的 6 道必须是卷面那 6 道应用题，
       * 按题型随机抽出来的是「像真卷的练习题」，不是真卷结构（Chief 验收第 4 条）。 */
      (sp.nos || []).forEach(function (no) {
        if (got >= n) return;
        var oq = null;
        try { oq = MT.originByNo && MT.originByNo(no); } catch (e) { console.warn('originByNo', no, e); }
        if (!oq) { console.warn('按题号取题失败：' + no); return; }
        if (!aiState.ai && ((OPEN_TYPES.indexOf(oq.type) >= 0 || oq.open) && oq.type !== 'writing')) return; /* INFO-2：writing 降级可练 */
        oq._id = 'q' + qsArr.length + stamp;
        if (sp.label) oq._part = sp.label;
        qsArr.push(oq); got++;
      });
      for (var i = got; i < n && guard < n * 8; i++) {
        guard++;
        var useTypes = filterOpen(sp.types || []);
        var q = genQSafe(subj, level, useTypes.length ? useTypes : undefined, pool);
        if (!q) continue;
        if (!aiState.ai && ((OPEN_TYPES.indexOf(q.type) >= 0 || q.open) && q.type !== 'writing')) { i--; continue; } /* INFO-2：writing 降级可练 */
        wConform(q);   /* 限时写作：题干/清单按 cfg.writing（8 句口径） */
        q._id = 'q' + qsArr.length + stamp;
        if (sp.label) q._part = sp.label;
        qsArr.push(q);
      }
    });
    if (!qsArr.length) { toast(quizLang === 'zh' ? '出题模块还没准备好' : 'The question engine is not ready yet'); go('#/home'); return; }
    quizLang = subjectLang(subj);   /* 非语文科目：界面与 TTS 全英文 */
    quiz = { subj: subj, level: level, types: types, count: qsArr.length, qs: qsArr, idx: 0, correct: 0, t0: Date.now(), answered: false, lang: quizLang, pool: pool };
    RESULT = null;
    /* 已经在 quiz 视图时 hash 不变不会触发 hashchange，需手动重渲染 */
    if (location.hash === '#/quiz') render(); else go('#/quiz');
  }

  /* 读表题（TABLE_READ 槽，MATH-ET-04）：结构化渲染表格，iPad 上比等宽字符表好读 */
  function tableHtml(t) {
    if (!t) return '';
    var cols = t.cols || [], rows = t.rows || [];
    if (!cols.length && !rows.length) return '';
    var cell = 'border:1px solid #cbd5e1;padding:8px;text-align:center';
    var h = '<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:18px">';
    if (cols.length) h += '<thead><tr>' + cols.map(function (c) { return '<th style="' + cell + ';background:#f1f5f9">' + esc(String(c)) + '</th>'; }).join('') + '</tr></thead>';
    h += '<tbody>' + rows.map(function (r) {
      return '<tr>' + (Array.isArray(r) ? r : []).map(function (c) { return '<td style="' + cell + '">' + esc(String(c)) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
    return h;
  }

  /* ===== 英语精准化自定义题型渲染（点选，不做拖拽，iPad 友好） ===== */
  function customBody(q) {
    var html = '';
    if (q.kind === 'bucket') {
      html += '<div class="muted" style="margin-top:6px">' + esc(T('bucketHint')) + '</div>';
      html += '<div class="chip-group" id="bk-words">';
      q.words.forEach(function (w) {
        html += '<button class="chip" data-w="' + esc(w) + '">' + esc(w) + '</button>';
      });
      html += '</div><div class="chip-group" id="bk-buckets">';
      q.buckets.forEach(function (b) {
        html += '<button class="chip" data-b="' + esc(b) + '">' + esc(b) + '</button>';
      });
      html += '</div><div id="bk-state" class="muted"></div>';
    } else if (q.kind === 'pair') {
      html += '<div class="muted" style="margin-top:6px">' + esc(T('pairHint')) + '</div>';
      html += '<div class="row" style="align-items:flex-start;gap:14px">';
      html += '<div class="chip-group" id="pair-left" style="flex:1">';
      q.left.forEach(function (t, i) { html += '<button class="chip" data-li="' + i + '">' + esc(t) + '</button>'; });
      html += '</div><div class="chip-group" id="pair-right" style="flex:1">';
      q.right.forEach(function (t, i) { html += '<button class="chip" data-ri="' + i + '">' + esc(t) + '</button>'; });
      html += '</div></div><div id="pair-state" class="muted"></div>';
    } else if (q.kind === 'order') {
      html += '<div class="muted" style="margin-top:6px">' + esc(T('orderHint')) + '</div>';
      html += '<div class="chip-group" id="ord-items">';
      q.items.forEach(function (t, i) { html += '<button class="chip" data-oi="' + i + '">' + esc(t) + '</button>'; });
      html += '</div><div id="ord-state" class="muted"></div>';
    }
    return html;
  }

  function bindCustom(q) {
    if (q.kind === 'bucket') {
      var sel = null;
      var assigned = {};
      var refresh = function () {
        qsa('#bk-words [data-w]').forEach(function (b) {
          var w = b.getAttribute('data-w');
          b.classList.toggle('on', sel === w);
          if (assigned[w]) b.textContent = w + ' → ' + assigned[w];
        });
        qsa('#bk-buckets [data-b]').forEach(function (b) { b.classList.remove('on'); });
      };
      qsa('#bk-words [data-w]').forEach(function (b) {
        b.onclick = function () { sel = b.getAttribute('data-w'); refresh(); };
      });
      qsa('#bk-buckets [data-b]').forEach(function (b) {
        b.onclick = function () {
          if (!sel) { toast(quizLang === 'zh' ? '先点一个词哦' : 'Tap a word first'); return; }
          assigned[sel] = b.getAttribute('data-b');
          var w = sel; sel = null; refresh();
          qs('#bk-state').textContent = '已归 ' + Object.keys(assigned).length + ' / ' + q.words.length + ' 个';
          if (Object.keys(assigned).length === q.words.length) {
            var wrongs = q.words.filter(function (x) { return assigned[x] !== q.map[x]; });
            if (wrongs.length) {
              resultCustom(q, false, quizLang === 'zh' ? ('有 ' + wrongs.length + ' 个词放错了：' + wrongs.slice(0, 3).join('、')) : ('Wrong group: ' + wrongs.slice(0, 3).join(', ')));
            } else resultCustom(q, true);
          }
        };
      });
      refresh();
      return;
    }
    if (q.kind === 'pair') {
      var pickL = null, locked = 0;
      qsa('#pair-left [data-li]').forEach(function (b) {
        b.onclick = function () {
          if (b.disabled) return;
          qsa('#pair-left [data-li]').forEach(function (x) { if (!x.disabled) x.classList.remove('on'); });
          pickL = +b.getAttribute('data-li');
          b.classList.add('on');
          qs('#pair-state').textContent = quizLang === 'zh' ? ('已选：' + q.left[pickL] + '，点右边配对') : ('Selected: ' + q.left[pickL]);
        };
      });
      qsa('#pair-right [data-ri]').forEach(function (b) {
        b.onclick = function () {
          if (pickL === null) { toast(quizLang === 'zh' ? '先点左边的一个词' : 'Tap a word on the left first'); return; }
          if (b.disabled) return;
          var dispR = +b.getAttribute('data-ri');
          var origR = q.rightIdx[dispR];
          var okPair = q.pairs.some(function (pr) { return pr[0] === pickL && pr[1] === origR; });
          if (okPair) {
            var lb = qs('#pair-left [data-li="' + pickL + '"]');
            if (lb) { lb.disabled = true; lb.classList.remove('on'); lb.classList.add('picked-right'); }
            b.disabled = true; b.classList.add('picked-right');
            locked++;
            qs('#pair-state').textContent = locked + ' / ' + q.pairs.length;
            pickL = null;
            if (locked === q.pairs.length) resultCustom(q, true);
          } else {
            b.classList.add('picked-wrong');
            setTimeout(function () { b.classList.remove('picked-wrong'); }, 500);
            qs('#pair-state').textContent = quizLang === 'zh' ? '不对哦，再看看～' : 'Not right — try again.';
          }
        };
      });
      return;
    }
    if (q.kind === 'order') {
      var seq = [], tried = 0;
      qsa('#ord-items [data-oi]').forEach(function (b) {
        b.onclick = function () {
          if (b.disabled) return;
          var i = +b.getAttribute('data-oi');
          b.disabled = true;
          b.textContent = seq.length + 1 + '. ' + q.items[i];
          seq.push(i);
          qs('#ord-state').textContent = seq.length + ' / ' + q.items.length;
          if (seq.length === q.items.length) {
            var userSeq = seq.map(function (x) { return q.itemIdx[x]; });
            var want = q.seq;
            var okSeq = userSeq.length === want.length && userSeq.every(function (v, k) { return v === want[k]; });
            if (okSeq) resultCustom(q, true);
            else {
              tried++;
              if (tried >= 2) resultCustom(q, false, quizLang === 'zh' ? '顺序还差一点，看看正确顺序吧' : 'Close! Check the right order.');
              else {
                toast(quizLang === 'zh' ? '顺序不对，再试一次' : 'Not in order — try once more');
                seq = [];
                qsa('#ord-items [data-oi]').forEach(function (x, k) {
                  x.disabled = false; x.classList.remove('on'); x.textContent = q.items[k];
                });
                qs('#ord-state').textContent = '';
              }
            }
          }
        };
      });
      return;
    }
  }

  /* 自定义题型判分（逻辑同 gradeAndFeedback，只是不经过 gradeAnswer） */
  function resultCustom(q, ok, detail) {
    if (!quiz || quiz.answered) return;
    quiz.answered = true;
    ST.bumpMastery(q.subj, q.type, ok);
    var card = qs('#qcard'), fb = qs('#feedback');
    if (ok) {
      quiz.correct++;
      ST.addStars(ST.RULES.CORRECT);
      if (card) card.classList.add('right');
      fb.innerHTML = '<div class="feedback ok">' + esc(pickOne(T('praises'))) +
        (quizLang === 'en' && q.explain && q.explainZh ? '<span class="why">💡 ' + esc(qExplain(q)) + zhNoteHtml(q) + '</span>' : '') +
        '</div>';
      celebrate(card);
      if (quizTimer) clearTimeout(quizTimer);
      quizTimer = setTimeout(nextQuestion, 1200);
    } else {
      if (card) card.classList.add('wrong');
      ST.wrongAdd({ id: q._id, subj: q.subj, type: q.type, q: q.q, q_en: q.q_en, a: q.a, opts: q.opts, speak: q.speak, explain: q.explain, topicTag: q.topicTag });
      fb.innerHTML = '<div class="feedback no">' + esc(detail || pickOne(T('cheers'))) +
        '<span class="why">💡 ' + esc(q.explain || '') + '</span></div>' +
        '<div style="margin-top:12px"><button class="btn btn-primary" id="to-next">下一题 →</button></div>';
      var nb = qs('#to-next');
      if (nb) nb.onclick = function () { nextQuestion(); };
      if (quizTimer) clearTimeout(quizTimer);
      quizTimer = setTimeout(function () { if (quiz && !quiz.answeredNext) nextQuestion(); }, 6000);
    }
  }

  function vQuiz() {
    if (!quiz) { go('#/setup'); return; }
    quiz.answeredNext = false;
    var q = quiz.qs[quiz.idx];
    var pct = Math.round((quiz.idx) / quiz.count * 100);
    var s = (cfg.subjects && cfg.subjects[quiz.subj]) || {};
    var html = '<div class="quiz-top">' +
      '<button class="btn btn-ghost" id="pause">⏸</button>' +
      '<div class="grow"><div class="muted">' + esc(T('progress', { i: quiz.idx + 1, n: quiz.count })) + ' · ' + esc(quizLang === 'zh' ? (s.name || '') : (s.name_en || s.name || '')) + '</div>' +
      '<div class="prog"><div class="prog-fill" style="width:' + pct + '%"></div></div></div></div>';
    html += '<div class="card q-card" id="qcard">' +
      (q._part ? '<div class="muted" style="margin-bottom:6px;font-weight:700">' + esc(q._part) + '</div>' : '') +
      '<span class="q-type-tag">' + esc(typeLabel(q.type)) + '</span>' +
      (q.doubt ? ' <span class="q-type-tag" style="background:#d97706" title="' + esc(q.doubtNote || (quizLang === 'en' ? 'Transcription is uncertain \u2014 verify with a grown-up' : '\u5f55\u5165\u5b58\u7591\uff0c\u8bf7\u5bb6\u957f\u6838\u5bf9')) + '">' + esc(T('doubtBadge')) + '</span>' : '') +
      (q.grade === false ? ' <span class="q-type-tag" style="background:#0ea5e9">' + esc(T('pendingBadge')) + '</span>' : '') +
      (q.src ? ' <span class="q-type-tag" style="background:#64748b" title="' + esc(q.src) + '">' + (quizLang === 'en' ? '📄 From your paper' : '📄 真题') + '</span>' : '') +
      '<div class="q-text' + (q.q.indexOf('\n') >= 0 ? ' q-mono' : '') + '">' + esc(q.q) + '</div>' +
      (q.type === 'writing' ? '<div class="w-timer-row"><span class="w-timer" id="w-timer">⏱ 20:00</span>' +
        '<button class="btn btn-ghost btn-sm" id="w-pause">⏸ Pause</button>' +
        '<span class="muted">' + (quizLang === 'zh' ? '目标 20 分钟写完（考试要求）' : 'target: finish in 20 min, like the exam') + '</span></div>' +
        (function () {
          /* 评分维度对孩子可见（自己先对照着写），但只列"要写成什么样"，
           * 不放范文/词表——老师明确说过 cheat sheet 考试不能带，不能把它做成应用内小抄。 */
          var ck = (MT.cfg && MT.cfg.writing && MT.cfg.writing.kidChecklist) || [];
          if (!ck.length) return '';
          return '<details class="w-rubric"><summary>' + (quizLang === 'zh' ? '📋 老师会看这些' : '📋 What the teacher looks for') + '</summary><ul>' +
            ck.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>';
        })() : '');
    if (q.table) html += tableHtml(q.table);
    if (q.rows && q.rows.length) {
      html += '<div class="q-text q-mono" style="margin-top:8px">' + q.rows.map(function (r) { return esc(String(r)); }).join('\n') + '</div>';
    }
    /* 卷面原页（MATH-02 配图）。两种显示时机：
     *   · needsFigure（读尺 / 数方格 / 看立体图）——不看图没法做，答题前直接显示；
     *   · 其余条目——原卷是**已批改**页面、答案就在上面，所以默认折叠，答完才展开（见 gradeAndFeedback）。 */
    /* 20261108 Chief 热修（家长指令：不许给孩子看原卷截图）：原卷扫描件带教师批改、
     * 答案可见，needsFigure 型更是答前直显——整块渲染移除，不再输出任何 <img> 原卷图。 */
    /* 未作答 / 动手题的说明（家长确认、纸上量一量画一画） */
    if (q.grade === false && (q.pendingNote || q.pendingNoteZh)) {
      html += '<div class="muted" style="margin-top:6px;font-size:13px">' +
        esc(quizLang === 'en' ? (q.pendingNote || q.pendingNoteZh) : (q.pendingNoteZh || q.pendingNote)) + '</div>';
    }
    if (q.speak) html += '<div><button class="say-btn" id="q-say" aria-label="朗读">🔊</button></div>';
    if (q.kind === 'bucket' || q.kind === 'pair' || q.kind === 'order') {
      html += customBody(q);
    } else if (q.opts && q.opts.length) {
      html += '<div class="opt-list">';
      q.opts.forEach(function (o, i) {
        html += '<button class="opt-btn" data-opt="' + i + '"><span class="opt-letter">' + 'ABCD'[i] + '</span><span>' + esc(o) + '</span></button>';
      });
      html += '</div>';
      if (q.blank2) {
        html += '<div class="muted" style="margin-top:14px">' + esc(T('secondBlank', { label: quizLang === 'zh' ? (q.blank2.label || '第二空') : (q.blank2.label_en || 'punctuation') })) + '</div>';
        html += '<div class="opt-list">';
        q.blank2.opts.forEach(function (o, i) {
          html += '<button class="opt-btn" data-opt2="' + i + '"><span>' + esc(o) + '</span></button>';
        });
        html += '</div>';
      }
    } else if (q.open) {
      html += '<textarea class="type-input" id="type-in" rows="4" placeholder="' + esc(T('writePlaceholder')) + '"></textarea>' +
        '<div class="row" style="margin-top:8px"><button class="btn btn-primary" id="type-submit">' + esc(T('submit')) + '</button></div>';
    } else {
      html += '<div class="type-row"><input class="type-input" id="type-in" autocomplete="off" autocapitalize="off" placeholder="' + esc(T('typePlaceholder')) + '">' +
        '<button class="btn btn-primary" id="type-submit">' + esc(T('check')) + '</button></div>';
    }
    html += '<div id="feedback"></div></div>';
    mount(html, quiz.subj);

    var sayB = qs('#q-say');
    if (sayB) sayB.onclick = function () { VO.say(qSpeak(q), { lang: speakLangOf(q) }); };
    /* 英语听力题自动朗读一次 */
    if (q.type === 'listen') setTimeout(function () { VO.say(qSpeak(q), { lang: 'en-US' }); }, 350);

    qs('#pause').onclick = function () {
      confirmBox(T('pause'), function () { finishQuiz(); }, T('end'), T('cancel'));
    };

    if (q.kind === 'bucket' || q.kind === 'pair' || q.kind === 'order') {
      bindCustom(q);
    } else if (q.opts && q.opts.length && q.blank2) {
      /* 双空题：先选主答案，再选第二空，两空全对得分 */
      var picked1 = null, picked1Btn = null;
      qsa('[data-opt]').forEach(function (b) {
        b.onclick = function () {
          if (quiz && quiz.answered) return;
          qsa('[data-opt]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          picked1 = q.opts[+b.getAttribute('data-opt')];
          picked1Btn = b;
        };
      });
      qsa('[data-opt2]').forEach(function (b) {
        b.onclick = function () {
          if (quiz && quiz.answered) return;
          if (picked1 === null) { toast(quizLang === 'zh' ? '先选上面的答案哦' : 'Pick the first answer above'); return; }
          var v2 = q.blank2.opts[+b.getAttribute('data-opt2')];
          /* D-R4-1：COMMAND 允许句号或感叹号（blank2.accept），其余题型严格单值 */
          var punctOk = (q.blank2.accept && q.blank2.accept.indexOf(v2) >= 0) || (v2 === q.blank2.a);
          var okAll = (picked1 === q.a) && punctOk;
          if (!okAll) b.classList.add('picked-wrong');
          gradeAndFeedback(q, okAll ? q.a : (picked1 + ' / ' + v2), picked1Btn);
        };
      });
    } else if (q.opts && q.opts.length) {
      qsa('[data-opt]').forEach(function (b) {
        b.onclick = function () {
          var v = q.opts[+b.getAttribute('data-opt')];
          gradeAndFeedback(q, v, b);
        };
      });
    } else {
      var inp = qs('#type-in'), btn = qs('#type-submit');
      inp.focus();
      var submit = function () { gradeAndFeedback(q, inp.value, null); };
      btn.onclick = submit;
      inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
    }
    /* 限时写作：进题即起表；换题/离开时由 wStop 收掉 */
    if (q.type === 'writing') {
      wStart(); wTick(); wStop(); quiz.wTimerId = setInterval(wTick, 1000);
      var pbz = qs('#w-pause');
      if (pbz) pbz.onclick = function () {
        var w = quiz && quiz.wt; if (!w) return;
        if (w.pauseAt) { w.pausedMs += Date.now() - w.pauseAt; w.pauseAt = 0; }
        else { if (w.pauses >= w.allow) return; w.pauses++; w.pauseAt = Date.now(); }
        wTick();
      };
    } else { wStop(); }
  }

  function gradeAndFeedback(q, userText, optBtn) {
    if (quiz && q && q.open) { openAnswer(q, userText); return; }
    if (quiz.answered) return;
    quiz.answered = true;
    /* 答完才放出原卷图（原卷已批改，提前看等于看答案） */
    var pf = qs('#paper-fig'); if (pf) pf.hidden = false;
    /* 卷面未作答的真题（pending）：照常练，但不判分、不进错题本、不动掌握度（MATH-ET-12 / Chief 口径①） */
    if (q && q.grade === false) {
      var pcard = qs('#qcard'), pfb = qs('#feedback');
      if (optBtn) optBtn.classList.add('picked-right');
      qsa('[data-opt]').forEach(function (b) { b.disabled = true; });
      var pex = (q.explain ? '<span class="why">💡 ' + esc(qExplain(q) || ('Answer: ' + q.a)) + zhNoteHtml(q) + '</span>' : '');
      pfb.innerHTML = '<div class="feedback ok">' + esc(T('pendingFeedback')) + pex + '</div>' +
        '<div style="margin-top:12px"><button class="btn btn-primary" id="to-next">' + esc(T('next')) + '</button></div>';
      var pnb = qs('#to-next'); if (pnb) pnb.onclick = function () { nextQuestion(); };
      return;
    }
    var g = tutorGrade(q, userText);
    var card = qs('#qcard'), fb = qs('#feedback');
    ST.bumpMastery(q.subj, q.type, g.ok);

    if (g.ok) {
      quiz.correct++;
      ST.addStars(ST.RULES.CORRECT);
      card.classList.add('right');
      if (optBtn) optBtn.classList.add('picked-right');
      fb.innerHTML = '<div class="feedback ok">' + esc(pickOne(T('praises'))) + '</div>';
      celebrate(card);
      if (q.subj === 'english' && q.speak) VO.say(q.a, { lang: 'en-US' });
      if (quizTimer) clearTimeout(quizTimer);
      quizTimer = setTimeout(nextQuestion, 1200);
    } else {
      card.classList.add('wrong');
      if (optBtn) {
        optBtn.classList.add('picked-wrong');
        qsa('[data-opt]').forEach(function (b) {
          b.disabled = true;
          if (q.opts[+b.getAttribute('data-opt')] === q.a) b.classList.add('reveal-right');
        });
      } else {
        qsa('[data-opt]').forEach(function (b) { b.disabled = true; });
      }
      ST.wrongAdd({
        id: q._id, subj: q.subj, type: q.type, q: q.q, q_en: q.q_en, a: q.a,
        opts: q.opts, speak: q.speak, explain: q.explain, topicTag: q.topicTag
      });
      fb.innerHTML = '<div class="feedback no">' + esc(pickOne(T('cheers'))) +
        '<span class="why">💡 ' + esc(qExplain(q) || ('Answer: ' + q.a)) + zhNoteHtml(q) + '</span></div>' +
        '<div style="margin-top:12px"><button class="btn btn-primary" id="to-next">' + esc(T('next')) + '</button></div>';
      var nb = qs('#to-next');
      if (nb) nb.onclick = function () { nextQuestion(); };
      if (quizTimer) clearTimeout(quizTimer);
      quizTimer = setTimeout(function () { if (quiz && !quiz.answeredNext) nextQuestion(); }, 6000);
    }
  }

  /* ================= ENG-08 限时写作（2026-11-06）=================
   * 老师 2026-11-05 的信：期中要在 20 分钟内从构思到成稿写完一篇 personal narrative。
   * 三条刻意的规则：
   *   · 20 分钟倒计时默认显示；到点**不强制收笔**（考试也是写完为止），只提示「已超时 M:SS」并记进历史；
   *   * 可暂停一次（7 岁孩子的宽容），暂停期间不计时，用过就锁掉按钮；
   *   · 完成时长 / 是否超时 / 超时多少 记进家长区「限时写作」台账，考前能看真实速度。
   * 题干与检查清单一律取自 cfg.writing（唯一事实源）：banks.js 旧 WRITING.checklist 里的
   * 「at least 6 sentences」不再出现在孩子眼前——句子数按老师 cheat sheet 的 8 句。 */
  function wCfg() { return (MT.cfg && MT.cfg.writing) || {}; }
  function fmtSec(x) { x = Math.max(0, Math.round(x)); return Math.floor(x / 60) + ':' + ('0' + (x % 60)).slice(-2); }
  function wStart() {
    if (!quiz) return;
    var c = wCfg();
    quiz.wt = { t0: Date.now(), pausedMs: 0, pauseAt: 0, pauses: 0, allow: (c.pauseAllow == null ? 1 : c.pauseAllow), limit: c.limitSec || 1200, over: false };
  }
  function wElapsed() {
    var w = quiz && quiz.wt; if (!w) return 0;
    var held = w.pauseAt ? (Date.now() - w.pauseAt) : 0;
    return (Date.now() - w.t0 - w.pausedMs - held) / 1000;
  }
  function wTick() {
    var el = qs('#w-timer'); if (!el || !quiz || !quiz.wt) return;
    var w = quiz.wt, e = wElapsed(), left = w.limit - e;
    if (left >= 0) {
      el.textContent = '⏱ ' + fmtSec(left);
      el.className = 'w-timer' + (left <= 120 ? ' warn' : '');
    } else {
      el.textContent = '⏱ Overtime +' + fmtSec(e - w.limit);
      el.className = 'w-timer over'; w.over = true;
    }
    var pb = qs('#w-pause');
    if (pb) {
      if (w.pauses >= w.allow && !w.pauseAt) { pb.textContent = '⏸ no pauses left'; pb.disabled = true; }
      else pb.textContent = w.pauseAt ? '▶ Resume' : '⏸ Pause (' + (w.allow - w.pauses) + ' left)';
    }
  }
  function wStop() { if (quiz && quiz.wTimerId) { clearInterval(quiz.wTimerId); quiz.wTimerId = null; } }
  /* 孩子侧题干/清单/朗读都改成 cfg.writing 的口径（含 8 句），banks 的旧文案不再外显 */
  function wConform(q) {
    var c = wCfg();
    if (!q || q.type !== 'writing' || !c.kidPrompt) return q;
    q.q = c.kidPrompt; q.speak = c.kidPrompt; q.speak_en = c.kidPrompt;
    if (c.kidChecklist && c.kidChecklist.length) {
      q.a = c.kidChecklist.join(' · ');
      /* QA R10 E1（2026-11-05）：explain/explainZh 也一律从 cfg 重建——banks 数据区哪怕漂移，
       * 6/8 句口径都漏不进答后讲解区与中文分支 AI 提示词（openAnswer 的「题目给出的评分要点」）。
       * 老师补充素材（WRITING 卡 teacherCard/answerFrames/figurative 拼成的 "Teacher checks:" 起尾段）保留；
       * 分钟数取 cfg.limitSec 动态生成，不写死（同「提示语写死 20 分钟」那次修正）。 */
      var mins = Math.max(1, Math.round((c.limitSec || 1200) / 60));
      var tailEn = '', tailZh = '';
      var mEn = /Teacher checks:[\s\S]*/.exec(q.explain || '');
      if (mEn) tailEn = ' ' + mEn[0];
      var mZh = /老师会看这七条[\s\S]*/.exec(q.explainZh || '');
      if (mZh) tailZh = ' ' + mZh[0];
      q.explain = 'Before you hand in, check: ' + c.kidChecklist.join('; ') +
        '. Aim to finish in about ' + mins + ' minutes — if you go a little over, keep writing.' + tailEn;
      q.explainZh = '交卷前按清单自查：' + c.kidChecklist.join('；') +
        '。目标 ' + mins + ' 分钟写完整篇，超时不慌——不停笔，写完为止。' + tailZh;
    }
    return q;
  }
  function wRecord(q, text) {
    var w = quiz && quiz.wt; if (!w) return null;
    var secs = wElapsed(), overBy = Math.max(0, secs - w.limit);
    var rec = {
      ts: Date.now(), seconds: Math.round(secs), limit: w.limit,
      overtime: Math.round(overBy), over: overBy > 0, pauses: w.pauses,
      words: String(text || '').split(/\s+/).filter(Boolean).length,
      sentences: (String(text || '').match(/[.!?]+/g) || []).length,
      topic: String(q && q.q || '').slice(0, 64)
    };
    try {
      ST.addHistory({ subject: 'english', count: 1, correct: 1, seconds: secs });   /* 既有历史台账：时长可见 */
      var key = 'mt.writing.timing', log = JSON.parse(localStorage.getItem(key) || '[]');
      log.push(rec); if (log.length > 40) log = log.slice(-40);
      localStorage.setItem(key, JSON.stringify(log));
    } catch (e) { console.warn('writing timing', e); }
    return rec;
  }

  /* 开放题（看图写话 / 写作）：AI 点评或自评清单，不判对错 */
  function openAnswer(q, text) {
    if (!quiz || quiz.answered) return;
    quiz.answered = true;
    if (String(text || '').trim().length >= 2) {
      quiz.correct++;
      ST.addStars(ST.RULES.CORRECT);
      ST.bumpMastery(q.subj, q.type, true);
    }
    var fb = qs('#feedback');
    var checklist = '<span class="why">' + esc(T('checklist')) + esc(quizLang === 'en' ? (q.a_en || q.a || '') : (q.a || '')) + '</span>';
    /* 限时写作：收笔即结算时长（超时不拦笔，只提示 + 记进历史与家长台账） */
    var wline = '';
    if (q.type === 'writing') {
      wStop();
      var rec = wRecord(q, text);
      if (rec) {
        quiz.wRec = rec;   /* AI 回来后要用本地句数标注 Sentences 项（QA R10 建议：别让孩子按模型的错误数被扣） */
        wline = '<div class="w-result' + (rec.over ? ' over' : '') + '">' +
          (quizLang === 'zh'
            ? ('⏱ 用时 ' + fmtSec(rec.seconds) + (rec.over ? '（已超时 ' + fmtSec(rec.overtime) + '）' : ('（目标 ' + fmtSec(rec.limit) + ' 内完成）')) +
               ' · 暂停 ' + rec.pauses + ' 次 · ' + rec.words + ' 个词 · ' + rec.sentences + ' 句')
            : ('⏱ ' + fmtSec(rec.seconds) + (rec.over ? ' — ' + fmtSec(rec.overtime) + ' over the target (' + fmtSec(rec.limit) + ')' : ' — inside the target (' + fmtSec(rec.limit) + ')') +
               ' · pauses ' + rec.pauses + ' · ' + rec.words + ' words · ' + rec.sentences + ' sentences')) +
          '</div>';
      }
    }
    fb.innerHTML = '<div class="feedback ok">' + esc(T('openPraise')) + checklist + wline + '</div>' +
      '<div id="ai-review" class="muted" style="margin-top:8px" data-ai-state="unavailable"></div>' +
      '<div style="margin-top:12px"><button class="btn btn-primary" id="to-next">' + esc(T('next')) + '</button></div>';
    var nb = qs('#to-next');
    if (nb) nb.onclick = function () { nextQuestion(); };
    /* INFO-2（Chief 11-06 定稿）：降级态＝根节点 data-ai-state="unavailable"＋文案，
     * 且 DOM 无任何分数/星级/维度节点（[data-score]＝0，结构上做不到"假装评"）；
     * 正常评分态由点评到达后 renderAiReview 转 "scored" 并按行挂 data-score。未知值＝fail-safe 按 unavailable。 */
    if (!aiState.ai) {
      qs('#ai-review').textContent = quizLang === 'zh'
        ? 'AI 评分暂不可用，先自评 + 纸上人工看'
        : 'AI scoring is unavailable right now — do your self-check first, and a grown-up can look at the paper too.';
    }
    if (aiState.ai) {
      var box = qs('#ai-review');
      box.textContent = T('aiReviewing');
      /* 提示词按学科评分点定制：写作＝Personal Narrative 四要素，看图写话＝四步框架 */
      /* 写作/开放题点评：语文中文，其余科目英文（child-friendly，1~2 句） */
      /* 判据唯一事实源＝cfg.writing.rubric（ENG-08：老师在原七项之外点名
       * Focused / Personal / True / Transitions，并要求 Neatness 单列）。
       * 旧版这里硬编码七项、且写「at least 6 sentences」，与老师 cheat sheet 的 8 句不符。 */
      var WRITE_RUBRIC = ((MT.cfg && MT.cfg.writing && MT.cfg.writing.rubric) || []).map(function (r) { return r.k + ' — ' + r.t; });
      if (!WRITE_RUBRIC.length) {
        WRITE_RUBRIC = ['at least 8 sentences', 'a title', 'a topic sentence', 'a concluding sentence',
          'indented paragraphs', 'at least 4 adjectives/adverbs/figurative phrases', 'grade 1-2 grammar and punctuation'];
      }
      var ask;
      if (quizLang === 'en') {
        if (q.type === 'writing') {
          /* 骨架式提示：给模型①-④与 1-7 的固定格式，避免结构漂移/被中文 persona 带偏（D-R6-4） */
          /* 骨架里把维度名直接写死、判定含义另列一行：DGX 实测（2026-11-05）——
           * 原写法「1. ______ (Focused — ...)」会被模型把括号整段丢掉，家长看不出每条是哪一维，
           * 验收要求的「维度完整 ✓/✗」就成了假绿。名字必须在冒号前原样保留。 */
          var RB = ((MT.cfg && MT.cfg.writing && MT.cfg.writing.rubric) || []);
          var rn = WRITE_RUBRIC.length;
          var rubricEn = RB.length
            ? RB.map(function (r, ix) { return (ix + 1) + '. ' + r.k + ': ______'; }).join('\n')
            : WRITE_RUBRIC.map(function (x, ix) { return (ix + 1) + '. ITEM' + (ix + 1) + ': ______'; }).join('\n');
          var meanings = RB.length ? ('\nJudge using these meanings — ' + RB.map(function (r) { return r.k + ' = ' + r.t; }).join(' | ') + '\n') : '\n';
          ask = 'Student writing: "' + text + '"\n' +
            'You are a kind Grade 2 teacher checking a personal narrative.\n' +
            'Reply in English only, using exactly this format — keep every section marker ① ② ③ ④ and the 1-' + rn + ' numbering, do not merge, skip or reorder items.\n' +
            'In each checklist line you MUST keep the item name before the colon exactly as written (example: "1. Focused: ✓ - one event only").' + meanings +
            '① Checklist (' + rn + ' items)\n' + rubricEn + '\n' +
            '② Hamburger structure: <one suggestion about beginning, middle details or ending, 1-2 sentences>\n' +
            '③ Editing mark: <exactly one of FIX SPELLING / ADD / REMOVE / INDENT>\n' +
            '④ <one short encouraging sentence.>\n' +
            'Replace every ______ with ✓ or ✗, then " - " and a short reason (max 12 words). ' +
            'Never delete an item name, never merge two items into one line, and never answer with reasons only. ' +
            'Judge Personal (the writer\u2019s own feelings) and Focused (one single event) strictly — those two are what the exam rewards. ' +
            'For Neatness judge only what is visible in the text (capitals, spacing, no ALL CAPS); never comment on handwriting. ' +
            'Do not give a total score and do not add other sections.';
        } else {
          ask = 'Student answer: "' + text + '"\n' +
            'You are a kind Grade 2 teacher. Reply in English only with 1-2 short, friendly sentences: ' +
            'one specific thing the child did well, then one easy improvement. No scores.';
        }
      } else {
        var rubricZh = q.type === 'writing'
          ? ('请逐条原样回写下面 ' + WRITE_RUBRIC.length + ' 项，每项一行 ✓ 或 ✗ 并附一句理由：\n' +
             ((MT.cfg && MT.cfg.writing && MT.cfg.writing.rubric) || []).map(function (r, ix) { return (ix + 1) + '. ' + r.k + '：' + r.t; }).join('\n'))
          : (q.type === 'simile_open'
              ? '评分看三样：①本体（被打比方的东西）②喻体（像什么）③比喻词（像/好像/仿佛）。逐条回写 ✓ 或 ✗；三样都有＝达标。一句完整的比喻句即达标，不强求多句。'
              : '评分看四步：①什么时候 ②谁 ③在哪里做了什么 ④心情怎么样'),
        ask = '学生写的作业：“' + text + '”\n' +
          (q.explain ? '（题目给出的评分要点：' + q.explain + '）\n' : '') +
          (q.prompt ? '（作文题：' + q.prompt + '）\n' : '') +
          '你是温柔的二年级老师，家长在旁边看着。' + rubricZh + '。\n' +
          (q.type === 'writing'
            ? '请按这个格式回复：\n①逐项 ✓/✗（每项各一行，用 emoji）；\n②汉堡结构建议（开头/中间细节/结尾各一句）；\n③用老师批改符号的口吻给一条最该改的建议（FIX SPELLING / ADD / REMOVE / ¶ 任选其一）；\n④最后一句鼓励。不要打总分。'
            : (q.type === 'simile_open'
                ? '请用 2~3 句中文点评：第一句逐条说三样（本体/喻体/比喻词）齐不齐，第二句给一条怎么改得更生动的建议（换个更像的喻体），最后一句鼓励。'
                : '请用 2~3 句中文点评：第一句具体夸一个亮点（指出是哪句写得好），第二句给一条最该改的建议（说清楚怎么改），最后一句鼓励。如果学生写得太短（少于 2 句），先鼓励再提醒补充“做了什么”。'));
      }
      tutorChat(ask, true, { max_tokens: 3000, lang: quizLang, fresh: true }).then(function (r) {
        var txt = r.text || '';
        /* QA R10 建议（2026-11-05）：Sentences 项旁标应用自己数的句数——模型句数只作参考
         * （样例曾把 10 句说成 twelve），8 句达标以本地 [.!?]+ 计数为准，别让孩子按 AI 的数被扣。 */
        if (q.type === 'writing' && quiz && quiz.wRec) {
          var need = (MT.cfg && MT.cfg.writing && MT.cfg.writing.sentences) || 8;
          var note = quizLang === 'zh'
            ? ('\n✍️ 应用自数句数：' + quiz.wRec.sentences + ' 句（按 。！？ 数；' + need + ' 句达标以这个本地数为准，AI 数得不一样时以应用为准）')
            : ('\n✍️ App-counted sentences: ' + quiz.wRec.sentences + ' (counted by . ! ? — the ' + need + '-sentence check uses this local count; if the AI counted differently, trust the app)');
          if (txt.indexOf('✍️') < 0) txt += note;
        }
        if (box) {
          box.setAttribute('data-ai-state', 'scored');
          box.textContent = '';
          String(txt).split('\n').forEach(function (ln) {
            if (!ln.trim()) return;
            var d = document.createElement('div');
            d.className = 'ai-line';
            if (ln.indexOf('✓') >= 0) d.setAttribute('data-score', '1');
            else if (ln.indexOf('✗') >= 0) d.setAttribute('data-score', '0');
            d.textContent = ln;
            box.appendChild(d);
          });
          if (box.firstChild) box.firstChild.textContent = '🤖 ' + box.firstChild.textContent; /* 保留原 🤖 前缀观感 */
        }
        if (quizTimer) { clearTimeout(quizTimer); quizTimer = null; }  /* 点评到了，别自动跳走 */
      });
    }
    /* 开放题留更长时间读完点评再自动推进 */
    if (quizTimer) clearTimeout(quizTimer);
    /* 本地推理可能较慢：AI 点评到达后不再自动跳走（让孩子读完），兜底 60s */
    quizTimer = setTimeout(function () { if (quiz && !quiz.answeredNext) nextQuestion(); }, aiState.ai ? 60000 : 8000);
  }

  function nextQuestion() {
    if (!quiz || quiz.finished) return;
    quiz.answeredNext = true;
    quiz.answered = false;
    quiz.idx++;
    if (quiz.idx >= quiz.count) finishQuiz();
    else vQuiz();
  }

  function finishQuiz() {
    if (!quiz) return;
    quiz.finished = true;
    var seconds = Math.max(1, Math.round((Date.now() - quiz.t0) / 1000));
    var count = quiz.count, correct = quiz.correct, subj = quiz.subj;
    var perfect = correct === count;
    ST.addStars(ST.RULES.ROUND);
    var starsGot = ST.RULES.ROUND;
    if (perfect) { ST.addStars(ST.RULES.PERFECT); starsGot += ST.RULES.PERFECT; }
    var newStickers = [];
    var tk = ST.todayKey();
    var sidFirst = 'first-' + subj + '-' + tk;
    if (ST.stickers().indexOf(sidFirst) < 0) { ST.addSticker(sidFirst); newStickers.push('🌟'); }
    if (perfect) {
      var sidP = 'perfect-' + subj + '-' + tk;
      if (ST.stickers().indexOf(sidP) < 0) { ST.addSticker(sidP); newStickers.push('🏅'); }
      if (seconds / count <= 8 && correct >= 5) {
        var sidF = 'fast-' + subj + '-' + tk;
        if (ST.stickers().indexOf(sidF) < 0) { ST.addSticker(sidF); newStickers.push('⚡'); }
      }
    }
    ST.addHistory({ subject: subj, count: count, correct: correct, seconds: seconds });
    RESULT = { subj: subj, count: count, correct: correct, seconds: seconds, perfect: perfect, starsGot: starsGot, newStickers: newStickers, lang: subjectLang(subj), pool: (quiz && quiz.pool) };
    quiz = null;
    go('#/result');
  }

  /* ================= 视图 7：结果 ================= */
  function vResult() {
    if (!RESULT) { go('#/setup'); return; }
    var R = RESULT;
    quizLang = R.lang || subjectLang(R.subj);
    var s = (cfg.subjects && cfg.subjects[R.subj]) || {};
    var nameShown = quizLang === 'zh' ? (s.name || '') : (s.name_en || s.name || '');
    var m = Math.floor(R.seconds / 60), sec = R.seconds % 60;
    var face = R.perfect ? '🏆' : (R.correct / R.count >= 0.6 ? '🎉' : '💪');
    var timeTxt = (m > 0 ? m + ' ' + T('minutes') + ' ' : '') + sec + ' ' + T('seconds');
    var html = '<div class="card result-hero">' +
      '<div style="font-size:56px">' + face + '</div>' +
      '<div class="result-score">' + R.correct + ' / ' + R.count + '</div>' +
      '<div class="result-sub">' + esc(nameShown) + ' · ' + esc(T('timeUsed')) + ' ' + esc(timeTxt) + ' · ' + esc(T('stars')) + ' ⭐+' + R.starsGot + '</div>' +
      (R.newStickers.length ? '<div class="sticker-pop">' + R.newStickers.join(' ') + '</div><div class="result-sub">' + (quizLang === 'zh' ? '新贴纸放进收藏夹啦！' : 'New sticker added to your collection!') + '</div>' : '') +
      '</div>';
    if (!R.perfect && R.correct < R.count) {
      html += '<div class="card center">' + esc(T('wrongTip')) + '</div>';
    }
    html += '<div class="row" style="margin-top:10px">' +
      '<button class="btn btn-primary grow" id="again">' + esc(T('again')) + '</button>' +
      '<a class="btn btn-ghost grow" href="#/home" style="text-decoration:none;text-align:center">' + esc(T('home')) + '</a></div>' +
      '<div style="margin-top:10px"><a class="btn btn-warn btn-big" href="#/wrongbook" style="text-decoration:none">' + esc(T('wrongbook')) + '</a></div>';
    mount(html, R.subj);
    var again = qs('#again');
    if (again) again.onclick = function () {
      startQuiz(R.subj, setupSel.level || 2, R.types || topicTypesFor(R.subj), R.count, R.pool);
    };
  }

  /* ================= 视图 8：语音对话 ================= */
  var chatMsgs = [];   /* {who:'me'|'bot', text, src} */
  var lastLang = 'zh-CN';

  function vChat() {
    var asr = VO.available().asr;
    var isEn = quizLang !== 'zh';
    var chips = isEn
      ? [['Tell me a poem, please.', T('chipPoem')], ['Give me a times-table question.', T('chipMul')], ['Let\'s talk in English!', T('chipEn')]]
      : [['给我背一首诗吧', T('chipPoem')], ['来一道乘法口诀', T('chipMul')], ['Let\'s talk in English!', T('chipEn')]];
    var html = '<div class="row" style="justify-content:space-between">' +
      '<h2 class="view-title">' + esc(T('chatTitle')) + '</h2>' +
      '<span id="ai-badge" class="ai-badge off">…</span></div>' +
      '<div class="chip-group">' +
      chips.map(function (c) { return '<button class="chip" data-ask="' + esc(c[0]) + '">' + esc(c[1]) + '</button>'; }).join('') +
      '</div>' +
      '<div class="card"><div class="chat-list" id="chat-list"></div>' +
      '<div class="chat-input-row">' +
      '<input class="type-input" id="chat-in" placeholder="' + esc(T('chatPlaceholder')) + '" autocomplete="off">' +
      '<button class="btn btn-primary" id="chat-send">' + esc(T('send')) + '</button>' +
      (asr ? '<button class="mic-btn" id="mic-btn" title="' + esc(T('micTitle')) + '">🎤</button>' : '') +
      '</div></div>';
    mount(html);

    refreshStatus(function (stt) {
      var b = qs('#ai-badge');
      if (!b) return;
      if (stt.ai) { b.textContent = stt.backend === 'dgx' ? T('aiOnlineDgx') : T('aiOnlineDs'); b.classList.remove('off'); }
      else { b.textContent = T('aiOffline'); b.classList.add('off'); }
    });

    drawChat();
    qsa('[data-ask]').forEach(function (b) { b.onclick = function () { sendChat(b.getAttribute('data-ask')); }; });
    var sendB = qs('#chat-send'), inp = qs('#chat-in');
    sendB.onclick = function () { sendChat(inp.value); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') sendChat(inp.value); };
    var mic = qs('#mic-btn');
    if (mic) mic.onclick = function () {
      mic.classList.add('listening');
      VO.listen({
        lang: lastLang,
        onresult: function (t) { mic.classList.remove('listening'); if (t) sendChat(t); else toast(quizLang === 'zh' ? '没听清，再说一次？' : 'Didn\'t catch that — say it again?'); },
        onerror: function (m) {
          mic.classList.remove('listening');
          if (quizLang === 'zh') toast(m === 'unsupported' ? '这个浏览器不支持语音，打字也行哦' : '没听清…');
          else toast(m === 'unsupported' ? 'This browser has no voice input — typing is fine!' : 'Didn\'t catch that…');
        },
        onend: function () { mic.classList.remove('listening'); }
      });
    };
  }

  function drawChat() {
    var list = qs('#chat-list');
    if (!list) return;
    if (!chatMsgs.length) {
      var teacher = quizLang === 'zh' ? (cfg.tutorName || '小优老师') : (cfg.tutorNameEn || 'Miss Xiao You');
      list.innerHTML = '<div class="bubble bot">' + esc(cfg.mascot || '🐼') + ' ' + esc(T('chatHi', { name: teacher })) +
        '<span class="src">' + esc(T('chatHint')) + '</span></div>';
      return;
    }
    list.innerHTML = chatMsgs.map(function (m) {
      return '<div class="bubble ' + (m.who === 'me' ? 'me' : 'bot') + '">' + esc(m.text) +
        (m.who === 'bot' && m.src ? '<span class="src">' + (m.src === 'ai' ? '🤖 AI' : esc(T('srcOffline'))) + '</span>' : '') + '</div>';
    }).join('');
    list.scrollTop = list.scrollHeight;
  }

  function sendChat(text) {
    text = String(text || '').trim();
    if (!text) return;
    chatMsgs.push({ who: 'me', text: text });
    var inp = qs('#chat-in'); if (inp) inp.value = '';
    var list = qs('#chat-list');
    if (list) {
      var t = document.createElement('div');
      t.className = 'bubble bot';
      t.id = 'typing';
      t.textContent = T('chatThinking');
      list.appendChild(t);
      list.scrollTop = list.scrollHeight;
    }
    tutorChat(text, aiState.ai, { lang: quizLang }).then(function (r) {
      var ty = qs('#typing'); if (ty && ty.parentNode) ty.parentNode.removeChild(ty);
      chatMsgs.push({ who: 'bot', text: r.text, src: r.src });
      lastLang = /^[a-z0-9 ,.!?'"’\-…]+$/i.test(text) && /[a-zA-Z]{2,}/.test(text) ? 'en-US' : 'zh-CN';
      drawChat();
      if (VO.available().tts && chatMsgs.length) {
        VO.say(r.text.replace(/[《》🐼🏮✖️🔤⭐🌸]/g, ''), { lang: r.src === 'ai' && lastLang === 'en-US' ? 'en-US' : 'zh-CN' });
      }
    });
  }

  /* ================= 视图 9：错题本 ================= */
  function vWrongbook() {
    var list = ST.wrongList();
    var html = '<h2 class="view-title">' + esc(T('wrongTitle')) + '</h2>';
    if (!list.length) {
      html += '<div class="empty-tip"><span class="e-emoji">🌈</span>' + esc(T('emptyWrong')) + '<br><span class="muted">' + esc(T('emptyWrongSub')) + '</span><br><br>' +
        '<a class="btn btn-primary" href="#/setup" style="text-decoration:none">' + esc(T('goPractice')) + '</a></div>';
      mount(html);
      return;
    }
    html += '<div class="row" style="justify-content:space-between"><span class="muted">' + esc(T('wrongCount', { n: list.length })) + '</span>' +
      '<button class="btn btn-warn btn-sm" id="clear-all">' + esc(T('clearAll')) + '</button></div>';
    list.forEach(function (w) {
      var s = (cfg.subjects && cfg.subjects[w.subj]) || {};
      html += '<div class="card wrong-item" data-id="' + esc(w.id) + '">' +
        '<div class="row" style="justify-content:space-between"><span class="muted">' + esc(s.emoji || '') + ' ' + esc(subjName(w.subj)) +
        ' · ' + esc(typeLabel(w.type, quizLang)) + '</span>' +
        '<span class="wc">' + esc(T('wrongTimes', { n: w.wrongCount || 1 })) + '</span></div>' +
        '<div class="wq">' + esc(quizLang === 'zh' ? w.q : (w.q_en || w.q)) + '</div>' + /* MT-EN-ZH-02: 错题本题干英文优先，缺 q_en 才落 q */
        '<div class="wa">' + esc(T('answerLabel')) + esc(w.a) + '</div>' +
        (w.explain ? '<div class="muted">' + esc(w.explain) + '</div>' : '') + /* MT-EN-ZH-01 (Chief 接管改): en 模式错题本讲解只认 explain，禁回落 explainZh 中文 */
        '<div class="row" style="margin-top:10px">' +
        (w.speak ? '<button class="say-btn" data-sayw="' + esc(w.id) + '">🔊</button>' : '') +
        '<button class="btn btn-primary btn-sm" data-redo="' + esc(w.id) + '">' + esc(T('redo')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-del="' + esc(w.id) + '">' + esc(T('delete')) + '</button></div></div>';
    });
    mount(html);

    qsa('[data-sayw]').forEach(function (b) {
      b.onclick = function () {
        var w = findById(b.getAttribute('data-sayw'));
        if (w) VO.say(w.speak || w.q, { lang: w.subj === 'english' ? 'en-US' : 'zh-CN' });
      };
    });
    qsa('[data-redo]').forEach(function (b) {
      b.onclick = function () { redoOne(b.getAttribute('data-redo')); };
    });
    qsa('[data-del]').forEach(function (b) {
      b.onclick = function () {
        confirmBox(T('delConfirm'), function () { ST.wrongRemove(b.getAttribute('data-del')); vWrongbook(); });
      };
    });
    var ca = qs('#clear-all');
    if (ca) ca.onclick = function () {
      confirmBox(T('clearConfirm'), function () {
        ST.wrongList().forEach(function (w) { ST.wrongRemove(w.id); });
        toast(T('clearedToast'));
        vWrongbook();
      }, T('clearLabel'));
    };
  }

  function findById(id) {
    var out = null;
    ST.wrongList().forEach(function (w) { if (w.id === id) out = w; });
    return out;
  }

  function redoOne(id) {
    var w = findById(id);
    if (!w) return;
    var html = '<div class="quiz-top"><button class="btn btn-ghost" id="redo-exit">✕</button>' +
      '<div class="grow"><div class="muted">' + esc(T('redoTitle')) + '</div><div class="prog"><div class="prog-fill" style="width:50%"></div></div></div></div>' +
      '<div class="card q-card" id="qcard"><span class="q-type-tag">' + esc(typeLabel(w.type, quizLang)) + '</span>' +
      '<div class="q-text">' + esc(w.q) + '</div>' +
      (w.speak ? '<div><button class="say-btn" id="w-say">🔊</button></div>' : '');
    if (w.opts && w.opts.length) {
      html += '<div class="opt-list">';
      w.opts.forEach(function (o, i) {
        html += '<button class="opt-btn" data-wopt="' + i + '"><span class="opt-letter">' + 'ABCD'[i] + '</span><span>' + esc(o) + '</span></button>';
      });
      html += '</div>';
    } else {
      html += '<div class="type-row"><input class="type-input" id="w-in" placeholder="' + esc(T('redoPlaceholder')) + '"><button class="btn btn-primary" id="w-submit">' + esc(T('typeSubmit')) + '</button></div>';
    }
    html += '<div id="w-fb"></div></div>';
    mount(html, w.subj);
    var sb = qs('#w-say');
    if (sb) sb.onclick = function () { VO.say(w.speak || w.q, { lang: w.subj === 'english' ? 'en-US' : 'zh-CN' }); };
    qs('#redo-exit').onclick = function () { vWrongbook(); };

    var done = false;
    function judge(val) {
      if (done) return;
      done = true;
      var g = tutorGrade({ subj: w.subj, type: w.type, a: w.a }, val);
      var fb = qs('#w-fb'), card = qs('#qcard');
      if (g.ok) {
        card.classList.add('right');
        ST.wrongRemoveMastered(w.id);
        ST.addStars(ST.RULES.CORRECT);
        fb.innerHTML = '<div class="feedback ok">' + esc(T('redoCleared')) + '</div>' +
          '<div style="margin-top:12px"><button class="btn btn-primary" id="w-back">' + esc(T('redoBack')) + '</button></div>';
        celebrate(card);
        qs('#w-back').onclick = function () { vWrongbook(); };
      } else {
        card.classList.add('wrong');
        ST.wrongAdd(w);
        fb.innerHTML = '<div class="feedback no">' + esc(T('redoRetry')) + '<span class="why">💡 ' + esc(w.explain || (T('answerLabel') + w.a)) + '</span></div>' +
          '<div style="margin-top:12px"><button class="btn btn-ghost" id="w-back">' + esc(T('redoBack')) + '</button></div>';
        qs('#w-back').onclick = function () { vWrongbook(); };
      }
    }
    if (w.opts && w.opts.length) {
      qsa('[data-wopt]').forEach(function (b) {
        b.onclick = function () { judge(w.opts[+b.getAttribute('data-wopt')]); };
      });
    } else {
      var inp = qs('#w-in');
      inp.focus();
      inp.onkeydown = function (e) { if (e.key === 'Enter') judge(inp.value); };
      qs('#w-submit').onclick = function () { judge(inp.value); };
    }
  }

  /* ================= 背诵闯关（口试 11-06，P0） ================= */
  var RC = null;

  /* 背诵内容优先取 Researcher 供的 RT.data（recite-data.js，内容由其维护，这里只读），
     缺失时回落到 MT.banks.RECITE */
  function recitePool() {
    var out = [];
    var rt = (typeof window !== 'undefined' && window.RT && window.RT.data && window.RT.data.pieces) || null;
    if (rt && rt.length) {
      rt.forEach(function (p) {
        if (!p || !p.lines || !p.lines.length) return;
        out.push({ id: p.id, title: p.title, author: p.author || '', kind: p.kind || 'text', lines: p.lines, keys: p.keys || [] });
      });
      if (out.length) return out;
    }
    return ((MT.banks && MT.banks.RECITE) || []).filter(function (p) { return p.lines && p.lines.length; });
  }
  /* 挖空规则统一由 banks 提供（单一真源），这里只在模块缺失时兜底 */
  function makeBlank(line, keys) {
    if (keys && keys.length) {
      var cands = [];
      keys.forEach(function (k) {
        if (k && line.indexOf(k) >= 0 && cands.indexOf(k) < 0) cands.push(k);
      });
      if (cands.length) {
        var pickKey = cands[Math.floor(Math.random() * cands.length)];
        var idx = line.indexOf(pickKey);
        return {
          masked: line.slice(0, idx) + new Array(pickKey.length + 1).join('＿') + line.slice(idx + pickKey.length),
          word: pickKey
        };
      }
    }
    if (MT.banks && typeof MT.banks.blankLine === 'function') return MT.banks.blankLine(line);
    var segs = [], re = /[^，。！？、；：]+[，。！？、；：]?/g, m;
    while ((m = re.exec(line)) !== null) segs.push(m[0]);
    segs = segs.filter(function (x) { return x.replace(/[，。！？、；：]/g, '').length >= 2; });
    if (!segs.length) return null;
    var longest = segs[0];
    segs.forEach(function (x) { if (x.length > longest.length) longest = x; });
    var punct = (longest.match(/[，。！？、；：]$/) || [''])[0];
    var word = longest.replace(/[，。！？、；：]/g, '');
    return { masked: line.replace(longest, '＿＿＿＿' + punct), word: word };
  }
  function buildRecite(item) {
    return {
      item: item, idx: 0, stage: 'fill',
      lines: item.lines.map(function (l, i) { return { i: i, text: l, blank: makeBlank(l, item.keys), ok: null, rate: null }; }),
      counted: false
    };
  }

  function shuffleArr(a) {
    var x = a.slice();
    for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = x[i]; x[i] = x[j]; x[j] = t; }
    return x;
  }
  /* 填空候选：正确答案 + 2~3 个干扰词。**同篇优先**（recite-dev 审计：全库随机会让
     数九歌冒出「北疆/草长」这类跨篇陌生词），同篇 keys 不够再从全库补。 */
  function blankCandidates(item, ln) {
    var word = ln.blank.word;
    var need = (Math.random() < 0.5) ? 2 : 3;
    var ds = [];
    function take(pool) {
      var p = shuffleArr(pool);
      while (ds.length < need && p.length) {
        var k = p.shift();
        if (k && k !== word && ds.indexOf(k) < 0) ds.push(k);
      }
    }
    /* 同篇：本篇 keys 里、不在本句中的词（避免同一句里出现重复字） */
    var same = [];
    (item.keys || []).forEach(function (k) {
      if (k && k !== word && ln.text.indexOf(k) < 0 && same.indexOf(k) < 0) same.push(k);
    });
    take(same);
    if (ds.length < need) {
      var global = [];
      recitePool().forEach(function (p) {
        if (p.id === item.id) return;               /* 全库补时也先排除本篇 */
        (p.keys || []).forEach(function (k) { if (k && k !== word && global.indexOf(k) < 0) global.push(k); });
      });
      take(global);
    }
    /* 字数接近答案的干扰项更"像样" */
    ds.sort(function (a, b) { return Math.abs(a.length - word.length) - Math.abs(b.length - word.length); });
    return shuffleArr([word].concat(ds.slice(0, need)));
  }

  /* 答错/没背熟 → 进错题本（recite-dev 审计：原来 wrongList 永远是 0 条） */
  function addReciteWrong(item, ln, word, qText) {
    ST.wrongAdd({
      id: 'recite-' + item.id + '-' + ln.i + '-' + (ln.stage || 'fill'),
      subj: 'yuwen', type: 'recite',
      q: '《' + item.title + '》' + qText,
      a: word || ln.text,
      explain: ln.text,
      topicTag: item.kind === 'poem' ? 'gushi_bei' : 'kewen_bei'
    });
  }

  function vRecite(r) {
    var list = recitePool();
    if (r.a) {
      var item = null;
      list.forEach(function (p) { if (p.id === r.a) item = p; });
      if (item) { if (!RC || RC.item.id !== item.id) RC = buildRecite(item); return reciteStep(); }
    }
    var html = crumbs(['#/home', '首页']) + '<h2 class="view-title">🎤 背诵闯关（口试 11-06）</h2>' +
      '<p class="muted">第一步：逐句填空；第二步：听范读再自己背。有麦克风会算匹配率，没有也能逐句自评。</p>';
    if (!list.length) {
      html += '<div class="empty-tip"><span class="e-emoji">📭</span>背诵内容还没送到，稍后就到啦</div>';
      mount(html); bindGo(); return;
    }
    list.forEach(function (p) {
      html += '<button class="topic-card" data-go="#/recite/' + esc(p.id) + '" style="width:100%;margin:8px 0;display:block">' +
        '<span class="tc-emoji">' + (p.kind === 'poem' ? '🏮' : '📖') + '</span> ' +
        '<span class="tc-title" style="display:inline">' + esc(p.title) + '</span>' +
        '<div class="tc-brief">' + esc(p.author || '') + (p.doubt ? ' · ⚠️ 存疑待校' : '') + '</div></button>';
    });
    mount(html);
    bindGo();
  }

  function reciteStep() {
    if (!RC) { go('#/recite'); return; }
    var item = RC.item;
    var head = crumbs(['#/recite', '背诵列表']) + '<h2 class="view-title">《' + esc(item.title) + '》' +
      (item.doubt ? ' <span class="muted">⚠️存疑</span>' : '') + '</h2>';
    if (RC.stage === 'fill') {
      var ln = RC.lines[RC.idx];
      if (!ln.blank) { RC.idx++; if (RC.idx >= RC.lines.length) { RC.stage = 'echo'; RC.idx = 0; } return reciteStep(); }
      var pct = Math.round(RC.idx / RC.lines.length * 100);
      var cands = blankCandidates(item, ln);
      var tts0 = VO.available().tts;
      mount(head +
        '<div class="prog"><div class="prog-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="muted">第一步 · 填空：第 ' + (RC.idx + 1) + ' / ' + RC.lines.length + ' 句</div>' +
        '<div class="card"><div class="q-text q-mono">' + esc(ln.blank.masked) + '</div>' +
        (tts0 ? '<div class="row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" id="rc-fill-hear">🔊 听范读</button></div>' : '') +
        '<div class="muted" style="margin-top:10px">选出缺的词：</div>' +
        '<div class="opt-list" id="rc-opts">' +
        cands.map(function (c, ci) {
          return '<button class="opt-btn" data-cand="' + esc(c) + '"><span class="opt-letter">' + 'ABCD'[ci] + '</span><span>' + esc(c) + '</span></button>';
        }).join('') +
        '</div><div id="rc-fb"></div></div>');
      var hb0 = qs('#rc-fill-hear');
      if (hb0) hb0.onclick = function () { VO.say(ln.text, { lang: 'zh-CN' }); };
      var nextLine = function () {
        RC.idx++;
        if (RC.idx >= RC.lines.length) { RC.stage = 'echo'; RC.idx = 0; }
        reciteStep();
      };
      var attempts = 0;
      var neighborHint = function () {
        var w = ln.blank.word, i = ln.text.indexOf(w);
        var before = i > 0 ? ln.text.charAt(i - 1) : '（句首）';
        var after = (i >= 0 && i + w.length < ln.text.length) ? ln.text.charAt(i + w.length) : '（句末）';
        return '空格前面是「' + before + '」，后面是「' + after + '」，再想想～';
      };
      qsa('[data-cand]').forEach(function (b) {
        b.onclick = function () {
          var v = b.getAttribute('data-cand');
          var fb = qs('#rc-fb');
          if (v === ln.blank.word) {
            ln.ok = true;
            b.classList.add('picked-right');
            qsa('[data-cand]').forEach(function (x) { x.disabled = true; });
            if (VO.available().tts) VO.say(ln.text, { lang: 'zh-CN' });
            fb.innerHTML = '<div class="feedback ok">填对啦！完整句子：' + esc(ln.text) + '</div>' +
              '<div style="margin-top:10px"><button class="btn btn-primary" id="rc-next">下一句 →</button></div>';
            qs('#rc-next').onclick = nextLine;
          } else if (attempts < 1) {
            attempts++;
            b.classList.add('picked-wrong');
            b.disabled = true;
            fb.innerHTML = '<div class="feedback no">' + esc(neighborHint()) + '</div>';
          } else {
            ln.ok = false;
            b.classList.add('picked-wrong');
            b.disabled = true;
            qsa('[data-cand]').forEach(function (x) {
              x.disabled = true;
              if (x.getAttribute('data-cand') === ln.blank.word) x.classList.add('reveal-right');
            });
            addReciteWrong(item, ln, ln.blank.word, ln.blank.masked);
            fb.innerHTML = '<div class="feedback no">正确答案是「' + esc(ln.blank.word) + '」' +
              '<span class="why">完整句子：' + esc(ln.text) + '</span></div>' +
              '<div style="margin-top:10px"><button class="btn btn-primary" id="rc-next">下一句 →</button></div>';
            qs('#rc-next').onclick = nextLine;
          }
        };
      });
      return;
    }

    if (RC.stage === 'echo') {
      var ln2 = RC.lines[RC.idx];
      var asr = VO.available().asr, tts = VO.available().tts;
      var pct2 = Math.round(RC.idx / RC.lines.length * 100);
      var body = '<div class="prog"><div class="prog-fill" style="width:' + pct2 + '%"></div></div>' +
        '<div class="muted">第二步 · 跟背：第 ' + (RC.idx + 1) + ' / ' + RC.lines.length + ' 句</div>' +
        '<div class="card"><div class="recite-line">先自己背出第 ' + (RC.idx + 1) + ' 句</div>' +
        '<div class="row" style="margin-top:10px">' +
        (tts ? '<button class="btn btn-ghost btn-sm" id="rc-hear">🔊 听范读</button>' : '') +
        (asr ? '<button class="btn btn-primary btn-sm" id="rc-mic">🎤 我背这句</button>' : '') +
        '</div>' +
        (asr ? '<div id="rc-rate" class="muted" style="margin-top:8px"></div>'
          : '<div class="row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" id="rc-self-ok">✅ 我背对了</button>' +
            '<button class="btn btn-ghost btn-sm" id="rc-self-no">😅 没背熟</button></div>') +
        '<div style="margin-top:10px"><button class="btn btn-ghost btn-sm" id="rc-reveal">👀 看答案</button></div>' +
        '<div id="rc-answer" class="recite-answer" hidden>' + esc(ln2.text) + '</div></div>';
      mount(head + body);
      var next = function () { RC.idx++; if (RC.idx >= RC.lines.length) RC.stage = 'done'; reciteStep(); };
      var hb = qs('#rc-hear');
      if (hb) hb.onclick = function () { VO.say(ln2.text, { lang: 'zh-CN' }); };
      var rv = qs('#rc-reveal');
      if (rv) rv.onclick = function () { qs('#rc-answer').hidden = false; };
      var mb = qs('#rc-mic');
      if (mb) mb.onclick = function () {
        var box = qs('#rc-rate');
        box.textContent = '我在听…请把这句背出来';
        var got = false;
        var fallback = function () {
          if (got || !box) return;
          box.innerHTML = '没听清（或麦克风不可用）——可以点下面自评' +
            '<div class="row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" id="rc-fb-ok">✅ 我背对了</button>' +
            '<button class="btn btn-ghost btn-sm" id="rc-fb-no">😅 没背熟</button></div>';
          var a = qs('#rc-fb-ok'), b2 = qs('#rc-fb-no');
          if (a) a.onclick = function () { ln2.ok = true; next(); };
          if (b2) b2.onclick = function () { ln2.ok = false; addReciteWrong(item, ln2, null, ln2.text); next(); };
        };
        VO.listen({
          lang: 'zh-CN',
          onresult: function (t) {
            got = true;
            var rate = (MT.tutor && MT.tutor.matchRate) ? MT.tutor.matchRate(ln2.text, t) : 0;
            ln2.rate = rate;
            ln2.ok = rate >= 0.6;
            box.innerHTML = '匹配率 <b>' + Math.round(rate * 100) + '%</b>' +
              (ln2.ok ? ' ✅ 背得好！' : ' 😅 再听一遍范读试试') +
              '<div class="muted">听到的是：' + esc(t || '（没听清）') + '</div>';
            if (!ln2.ok) addReciteWrong(item, ln2, null, ln2.text);
            var nb = document.createElement('button');
            nb.className = 'btn btn-primary btn-sm';
            nb.style.marginTop = '10px';
            nb.textContent = '下一句 →';
            nb.onclick = next;
            box.appendChild(nb);
          },
          onerror: function (m) {
            box.textContent = m === 'unsupported' ? '这个浏览器不支持语音，改用自评吧' : '没听清，再说一次？';
            fallback();
          },
          onend: function () { fallback(); }
        });
      };
      var so = qs('#rc-self-ok'), sn = qs('#rc-self-no');
      if (so) so.onclick = function () { ln2.ok = true; next(); };
      if (sn) sn.onclick = function () { ln2.ok = false; addReciteWrong(item, ln2, null, ln2.text); next(); };
      return;
    }

    /* 总结 */
    var okN = RC.lines.filter(function (l) { return l.ok; }).length;
    var total = RC.lines.length;
    if (!RC.counted) {
      RC.counted = true;
      /* 星星整篇一次性结算，避免逐句 +1 刷星（recite-dev 审计 ⑨） */
      var got = (okN === total) ? 5 : Math.max(1, Math.round(okN / total * 3));
      ST.addStars(got);
      RC.starsGot = got;
      if (okN === total) ST.addSticker('recite-' + item.id);
    }
    var miss = RC.lines.map(function (l, i) { return l.ok ? null : ('第 ' + (i + 1) + ' 句'); }).filter(Boolean);
    var html = head + '<div class="card result-hero">' +
      '<div style="font-size:56px">' + (okN === total ? '🏆' : '💪') + '</div>' +
      '<div class="result-score">' + okN + ' / ' + total + '</div>' +
      '<div class="result-sub">背对的句子数 · 获得 ⭐+' + (RC.starsGot || 0) + '</div>' +
      (okN === total ? '<div class="sticker-pop">🏅</div><div class="result-sub">整篇都背下来啦，贴纸已收藏！</div>' : '') +
      '</div>' +
      (miss.length ? '<div class="card"><b>还要再练：</b>' + esc(miss.join('、')) +
        '<div class="muted" style="margin-top:6px">点下面重新来一遍，卡住的句子多听两遍范读。</div></div>' : '') +
      '<div class="row"><button class="btn btn-primary grow" id="rc-again">🔁 再背一遍</button>' +
      '<a class="btn btn-ghost grow" href="#/recite" style="text-decoration:none;text-align:center">📚 换一篇</a></div>';
    mount(html);
    qs('#rc-again').onclick = function () { RC = buildRecite(item); reciteStep(); };
  }

  /* ================= 视图 10：家长区 ================= */
  var parentUnlocked = false;
  var gateAns = 0;

  function vParent() {
    if (!parentUnlocked) {
      var a = 11 + Math.floor(Math.random() * 9), b = 11 + Math.floor(Math.random() * 9);
      gateAns = a * b;
      mount('<h2 class="view-title">👪 家长区</h2>' +
        '<div class="card"><p class="muted">这是爸爸妈妈的区域，先算一道题：</p>' +
        '<div class="q-text center">' + a + ' × ' + b + ' = ？</div>' +
        '<div class="type-row"><input class="type-input" id="gate-in" type="number" inputmode="numeric" placeholder="答案">' +
        '<button class="btn btn-primary" id="gate-ok">进入</button></div></div>');
      var gi = qs('#gate-in');
      gi.focus();
      var tryGo = function () {
        if (parseInt(gi.value, 10) === gateAns) {
          parentUnlocked = true;
          vParent();
        } else {
          toast('算错啦，再试一次 🙂');
          var na = 11 + Math.floor(Math.random() * 9), nb = 11 + Math.floor(Math.random() * 9);
          gateAns = na * nb;
          qs('.q-text').textContent = na + ' × ' + nb + ' = ？';
          gi.value = '';
        }
      };
      qs('#gate-ok').onclick = tryGo;
      gi.onkeydown = function (e) { if (e.key === 'Enter') tryGo(); };
      return;
    }

    /* MT-TTS-02（Chief 批）：家长区嗓音调试行——仅解锁后渲染，孩子界面不露出；
     * 家长在 iPad 上打开本页截图即得该设备嗓音实名 */
    var dbgVoiceLine = '';
    try {
      var dv = MT.voice && MT.voice.debugVoices ? MT.voice.debugVoices() : null;
      if (dv) dbgVoiceLine = '<p class="muted" style="font-size:13px" id="voice-debug">🔊 嗓音自检：中文=' + esc(String(dv.zh || '（未选中）')) +
        ' ／ 英文=' + esc(String(dv.en || '（未选中）')) + ' ／ 清单 ' + (dv.total || 0) + ' 条（iPad 反馈时请连这行截图）</p>';
    } catch (e) { }
    var html = '<h2 class="view-title">👪 家长区</h2>' + dbgVoiceLine +
      '<div class="card"><h3 style="font-size:22px">🤖 AI 老师</h3>' +
      '<p class="muted" id="ai-line">状态检测中…</p>' +
      '<label class="opt-label">用哪个后端</label><div class="chip-group" id="backend-chips">' +
      '<button class="chip" data-backend="dgx">💻 DGX 本地</button>' +
      '<button class="chip" data-backend="deepseek">☁️ DeepSeek 云端</button>' +
      '</div>' +
      '<div class="row"><button class="btn btn-ghost btn-sm" id="test-conn">🔌 测试连接</button>' +
      '<span class="muted" id="test-out"></span></div>' +
      '<p class="muted" style="margin-top:10px">DGX 本地无需密钥，孩子开箱即用；本地不可达会自动改用 DeepSeek（需密钥）。</p>' +
      '<div class="field"><input type="password" id="key-in" placeholder="粘贴 DeepSeek API 密钥（留空则清除）" autocomplete="off"></div>' +
      '<div class="row"><button class="btn btn-primary btn-sm" id="save-key">保存密钥</button>' +
      '<button class="btn btn-ghost btn-sm" id="clear-key">清除密钥</button></div></div>' +
      '<div class="card"><h3 style="font-size:22px">📊 学习记录</h3><div id="hist"></div></div>' +
      '<div class="card"><h3 style="font-size:22px">✍️ 限时写作</h3><div id="wlog"></div>' +
      '<p class="muted" style="font-size:12px">按老师要求：20 分钟内从构思到成稿。卷面整洁（Neatness 的字迹部分）请在纸上人工看，AI 只能看打字规范。</p></div>' +
      '<div class="card"><h3 style="font-size:22px">🧹 数据管理</h3>' +
      '<p class="muted">所有数据只保存在这台设备的浏览器里。</p>' +
      '<button class="btn btn-warn btn-sm" id="reset-all" style="margin-top:8px">重置全部数据</button></div>';
    mount(html);

    var paint = function (stt) {
      var l = qs('#ai-line');
      if (!l) return;
      if (window.MT_OFFLINE_MODE) {
        /* MT-PAGES-01 静态模式：无服务端——AI 后端/密钥控件灰化隐藏，零请求零红错 */
        l.textContent = '静态版（GitHub Pages）· 无 AI 后端 · 题库、判分、讲解、本地语音照常可用';
        qsa('#backend-chips .chip').forEach(function (c) { c.disabled = true; c.style.opacity = '.4'; });
        var _tb = qs('#test-conn'); if (_tb) { _tb.disabled = true; _tb.style.opacity = '.4'; }
        var _ki = qs('#key-in'); if (_ki) _ki.style.display = 'none';
        var _sk = qs('#save-key'); if (_sk) _sk.style.display = 'none';
        var _ck = qs('#clear-key'); if (_ck) _ck.style.display = 'none';
        return;
      }
      var dgxTxt = stt.dgx && stt.dgx.ok ? 'DGX 可达' : 'DGX 不可达';
      var dsTxt = stt.deepseek && stt.deepseek.configured ? 'DeepSeek 已配密钥' : 'DeepSeek 未配密钥';
      l.textContent = (stt.ai ? 'AI 已开启 · 当前后端：' + backendLabel(stt) : '离线模式（题库、判分、讲解、语音都照常可用）') +
        ' ｜ ' + dgxTxt + ' · ' + dsTxt;
      qsa('#backend-chips .chip').forEach(function (c) {
        c.classList.toggle('on', c.getAttribute('data-backend') === (stt.active || 'dgx'));
      });
    };
    refreshStatus(paint);
    qsa('#backend-chips .chip').forEach(function (c) {
      c.onclick = function () {
        var be = c.getAttribute('data-backend');
        if (typeof fetch !== 'function') { toast('需在 http:// 下使用'); return; }
        fetch('/api/set_backend', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: be })
        }).then(function (r) { return r.json(); }).then(function (j) {
          toast(j && j.ok ? ('已切换到 ' + (be === 'dgx' ? 'DGX 本地' : 'DeepSeek 云端')) : '切换失败');
          refreshStatus(paint);
        }).catch(function () { toast('切换失败，确认 server 在运行'); });
      };
    });
    var tb = qs('#test-conn');
    if (tb) tb.onclick = function () {
      if (typeof fetch !== 'function') { toast('需在 http:// 下使用'); return; }
      var out = qs('#test-out');
      out.textContent = '测试中…';
      if (window.MT_OFFLINE_MODE) { var _o = qs('#test-out'); if (_o) _o.textContent = '静态版无 AI 后端，无需测试连接'; return; }
      fetch('/api/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: (aiState.backend === 'none' ? aiState.active : aiState.backend) })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok) {
          out.textContent = '✅ ' + (j.backend === 'dgx' ? 'DGX' : 'DeepSeek') + ' 正常 · ' + j.ms + 'ms · 回：' + (j.reply || '');
        } else {
          out.textContent = '❌ 连接失败：' + ((j && j.error) || '未知错误');
        }
      }).catch(function () { out.textContent = '❌ 请求失败，确认 server 在运行'; });
    };

    function setKey(key) {
      if (typeof fetch !== 'function') { toast('需在 http:// 下使用'); return; }
      if (window.MT_OFFLINE_MODE) { toast('静态版无 AI 后端，无需密钥'); return; }
      fetch('/api/set_key', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key })
      }).then(function (r) { return r.json(); })
        .then(function () { toast(key ? '已保存 ✅' : '已清除'); refreshStatus(function (stt) { qs('#ai-line').textContent = stt.ai ? 'AI 已开启（模型：' + stt.model + '）' : '未配置密钥 · 离线模式（题库、判分、讲解、语音都照常可用）'; }); })
        .catch(function () { toast('保存失败，确认 server 在运行'); });
    }
    qs('#save-key').onclick = function () {
      var k = qs('#key-in').value.trim();
      if (!k) { toast('先粘贴密钥'); return; }
      setKey(k);
      qs('#key-in').value = '';
    };
    qs('#clear-key').onclick = function () { confirmBox('清除密钥后 AI 对话会停用，确定吗？', function () { setKey(''); }); };

    /* 限时写作台账（ENG-08）：考前看真实速度 */
    try {
      var wl = JSON.parse(localStorage.getItem('mt.writing.timing') || '[]').slice(-8).reverse();
      qs('#wlog').innerHTML = wl.length ? wl.map(function (r) {
        var d = new Date(r.ts), t = (d.getMonth() + 1) + '/' + d.getDate();
        return '<div class="hist-row"><span>' + t + '</span>' +
          '<span class="' + (r.over ? 'w-over-txt' : '') + '">⏱ ' + fmtSec(r.seconds) + (r.over ? '（超 ' + fmtSec(r.overtime) + '）' : '（达标）') + '</span>' +
          '<span>' + (r.sentences || 0) + ' 句 / ' + (r.words || 0) + ' 词</span>' +
          '<span>暂停 ' + (r.pauses || 0) + ' 次</span></div>';
      }).join('') : '<p class="muted">还没有练过限时写作。进 Practice → English → Writing 就能计时练。</p>';
    } catch (e) { console.warn('wlog', e); }
    var hist = ST.historyList();
    qs('#hist').innerHTML = hist.length ? hist.map(function (h) {
      var s = (cfg.subjects && cfg.subjects[h.subject]) || {};
      var d = new Date(h.ts);
      var t = (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      return '<div class="hist-row"><span>' + t + '</span><span>' + esc(s.emoji || '') + ' ' + esc(s.name || h.subject) +
        '</span><span>' + h.correct + '/' + h.count + ' 对</span><span>' + Math.round(h.seconds) + ' 秒</span></div>';
    }).join('') : '<p class="muted">还没有记录，去练一组吧！</p>';

    /* Essay 完成记录（ESSAY-MOD-01：家长区可查，口径同学习记录） */
    try {
      var eb = MT.ESSAY_BANK || {}, eDone = (MT.store.essayDoneGet && MT.store.essayDoneGet()) || {};
      var erow = [];
      ['L1', 'L3'].forEach(function (lv) {
        (eb[lv] && eb[lv].units || []).forEach(function (u) {
          if (eDone[u.id]) erow.push('✅ ' + u.id + ' · ' + u.title + '（' + eDone[u.id].at + '）');
        });
      });
      if (erow.length) {
        var ecard = document.createElement('div'); ecard.className = 'card';
        ecard.innerHTML = '<h3 style="font-size:22px">✍️ Essay Progress</h3><div class="muted" style="white-space:pre-wrap">' + esc(erow.join('\n')) + '</div>';
        var histCard = qs('#hist') && qs('#hist').closest('.card');
        if (histCard && histCard.parentNode) histCard.parentNode.insertBefore(ecard, histCard.nextSibling);
      }
    } catch (e) { console.warn('essay-hist', e); }

    /* BF 计时趋势（MATH-BFWB-05 · A1 红线：只有用时与档位，无逐题对错） */
    try {
      if ((MT.store.bfGetLog() || []).length) {
        var bcard = document.createElement('div'); bcard.className = 'card';
        bcard.innerHTML = bfParentCard().replace(/^<div class="card">/, '').replace(/<\/div>$/, '');
        var hCard2 = qs('#hist') && qs('#hist').closest('.card');
        if (hCard2 && hCard2.parentNode) hCard2.parentNode.insertBefore(bcard, hCard2.nextSibling);
      }
    } catch (e) { console.warn('bf-hist', e); }

    /* AMC 进度（MATH-AMC-03 · 同 A1 红线：只有完成档数/题数，无对错） */
    try {
      if (Object.keys(MT.store.amcDoneGet() || {}).length) {
        var acard = document.createElement('div'); acard.className = 'card';
        acard.innerHTML = amcParentCard().replace(/^<div class="card">/, '').replace(/<\/div>$/, '');
        var bfCard = Array.prototype.find.call(document.querySelectorAll('.card h3'), function (h) { return /计算熟练度/.test(h.textContent); });
        var anchor = (bfCard && bfCard.closest('.card')) || (qs('#hist') && qs('#hist').closest('.card'));
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(acard, anchor.nextSibling);
      }
    } catch (e) { console.warn('amc-hist', e); }

    /* MAP Reading 进度（MT-MAP-01 · 同族红线：只有完成度趋势，无逐题对错） */
    try {
      var mD = MT.store.mapDoneGet() || {}, mW = MT.store.mapWordsGet() || {}, mS = MT.store.mapSkillsGet() || {};
      if (Object.keys(mD).length || Object.keys(mW).length || Object.keys(mS).length) {
        var mcard = document.createElement('div'); mcard.className = 'card';
        mcard.innerHTML = mapParentCard().replace(/^<div class="card">/, '').replace(/<\/div>$/, '');
        var amcH = Array.prototype.find.call(document.querySelectorAll('.card h3'), function (h) { return /AMC 挑战进度/.test(h.textContent); });
        var manch = (amcH && amcH.closest('.card')) || (qs('#hist') && qs('#hist').closest('.card'));
        if (manch && manch.parentNode) manch.parentNode.insertBefore(mcard, manch.nextSibling);
      }
    } catch (e) { console.warn('map-hist', e); }

    qs('#reset-all').onclick = function () {
      confirmBox('确定要清空全部学习数据吗？', function () {
        confirmBox('再确认一次：星星、错题、记录都会消失！', function () {
          ST.reset(); toast('已重置 🧹'); chatMsgs = []; parentUnlocked = false; go('#/home');
        }, '确定清空');
      }, '继续');
    };
  }

  /* ================= 汇总 ================= */
  /* ================================================================
   * Essay 模块（ESSAY-MOD-01 · 2026-11-15 家长批准：顶层第六科、L1+L3、四步闭环）
   * 数据 = MT.ESSAY_BANK（banks-essay.js，真数据归 Researcher ESSAY-DATA-01）
   * 流程：读范文（role 分段）→ 词组 ≤5 题（答后显 why）→ 引导仿写（checklist＋minWords＋AI 点评，
   * DGX/tutor 不可达＝checklist 自评＋灰条兜底，不得白屏）→ 过关解锁下一 Unit。
   * 全英文口径（首页/导航/内容均 en）；完成态 MT.store.essayDone*，家长区可查。
   * ================================================================ */
  function essayDoneSet(id) {
    try {
      var first = MT.store.essayDoneSet(id);
      if (first) MT.store.addStars(3);
      return true;
    } catch (e) { console.warn('essayDoneSet', e); return false; }
  }
  function essayLevel(level) {
    var bank = MT.ESSAY_BANK || {};
    var data = bank[level];
    return (data && Array.isArray(data.units)) ? data.units : [];
  }

  function vEssayHome() {
    var done = (MT.store.essayDoneGet && MT.store.essayDoneGet()) || {};
    function lvCard(lv, tagline) {
      var units = essayLevel(lv);
      var n = units.filter(function (u) { return done[u.id]; }).length;
      return '<button class="subj-card sc-essay" data-go="#/essay/' + lv + '" style="display:block;width:100%;margin:8px 0;text-align:left">' +
        '<span class="sc-emoji">✍️</span><span class="sc-name">' + lv + '</span>' +
        '<span class="sc-desc">' + tagline + ' · ' + n + '/' + units.length + ' done</span></button>';
    }
    mount(crumbs('#/home', 'Home') +
      '<div class="card"><h2>✍️ Essay</h2><p class="muted">Read great writing, learn the words, write your own.</p>' +
      lvCard('L1', 'Narrative writing') + lvCard('L3', 'Persuasive writing') +
      '</div>');
    bindGo();
  }

  function vEssayLevel(r) {
    var lv = r.a;
    if (lv !== 'L1' && lv !== 'L3') { go('#/essay'); return; }
    var units = essayLevel(lv);
    if (!units.length) {
      mount(crumbs('#/essay', 'Essay') + '<div class="card"><h2>' + lv + '</h2><p class="muted">Units are on the way — check back soon!</p></div>');
      return;
    }
    var done = (MT.store.essayDoneGet && MT.store.essayDoneGet()) || {};
    var html = crumbs('#/essay', 'Essay') + '<div class="card"><h2>✍️ ' + lv + '</h2>';
    for (var i = 0; i < units.length; i++) {
      var u = units[i], ok = !!done[u.id];
      var locked = i > 0 && !done[units[i - 1].id];
      html += '<div class="row" style="margin:6px 0">' +
        (locked
          ? '<button class="btn btn-ghost grow" disabled>🔒 ' + esc(u.id) + ' · ' + esc(u.title) + '</button>'
          : '<button class="btn ' + (ok ? 'btn-ghost' : 'btn-primary') + ' grow" data-go="#/essay/' + lv + '/' + esc(u.id) + '">' +
            (ok ? '✅ ' : '') + esc(u.id) + ' · ' + esc(u.title) + ' →</button>') +
        '</div>';
    }
    html += '</div>';
    mount(html);
    bindGo();
  }

  function vEssayUnit(r) {
    var lv = r.a, uid = r.b;
    var units = essayLevel(lv);
    var unit = null;
    units.forEach(function (u) { if (u.id === uid) unit = u; });
    if (!unit) { go('#/essay/' + lv); return; }
    var idx = units.indexOf(unit);
    var done = (MT.store.essayDoneGet && MT.store.essayDoneGet()) || {};
    if (idx > 0 && !done[units[idx - 1].id]) { go('#/essay/' + lv); return; } /* 过关解锁闸 */

    var ROLE_ICON = { hook: '🎣', intro: '🚪', body: '📚', support: '💪', evidence: '🔍', conclusion: '🏁' };
    var quizState = { answered: 0, correct: 0 };
    var essayText = '', aiStateLabel = '';

    var html = crumbs('#/essay/' + lv, lv) +
      '<div class="card"><h2>' + esc(unit.id) + ' · ' + esc(unit.title) + '</h2><p class="muted">' + esc(String(unit.genre || '')) + '</p></div>';

    html += '<div class="card"><h3>📖 Step 1 · Read the sample</h3><p class="muted">' + esc(unit.sample && unit.sample.title || '') + '</p>';
    ((unit.sample && unit.sample.paras) || []).forEach(function (p) {
      html += '<p style="margin:10px 0"><span class="chip" style="pointer-events:none">' + (ROLE_ICON[p.role] || '📄') + ' ' + esc(p.role) + '</span> ' + esc(p.text) + '</p>';
    });
    html += '</div>';

    html += '<div class="card"><h3>📝 Step 2 · Word quiz (' + Math.min((unit.quiz || []).length, 5) + ')</h3><div id="ez-body"></div><div id="ez-sum" class="muted"></div></div>';

    var cl = ((unit.guided && unit.guided.checklist) || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
    html += '<div class="card"><h3>✏️ Step 3 · Guided writing</h3>' +
      '<p>' + esc((unit.guided && unit.guided.prompt) || 'Write your own paragraph.') + '</p>' +
      '<ul class="muted" style="font-size:13px">' + cl + '</ul>' +
      '<div class="field"><textarea id="ew-in" rows="6" placeholder="Write your paragraph here…" style="width:100%"></textarea></div>' +
      '<div class="row"><span class="muted" id="ew-count">0 / ' + ((unit.guided && unit.guided.minWords) || 0) + ' words</span>' +
      '<button class="btn btn-primary btn-sm" id="ew-submit" style="margin-left:auto">Submit for review</button></div>' +
      '<div id="ew-ai" class="muted" style="margin-top:10px"></div></div>';

    html += '<div class="card"><h3>🏁 Step 4 · Pass the unit</h3><div id="ez-pass"></div></div>';
    mount(html, 'essay');

    /* Step 2：quiz ≤5 题，答后显 why */
    var qz = (unit.quiz || []).slice(0, 5);
    var ezb = qs('#ez-body');
    function renderQuiz() {
      var h = '';
      qz.forEach(function (q, i) {
        h += '<div class="card" style="box-shadow:none;border:1px solid #eee;margin:8px 0" id="eq-' + i + '">' +
          '<p><b>' + (i + 1) + '.</b> ' + esc(q.q) + '</p>';
        if (q.type === 'choice' && q.options && q.options.length) {
          q.options.forEach(function (o) {
            h += '<button class="btn btn-ghost btn-sm eq-opt" data-q="' + i + '" data-o="' + esc(o) + '" style="margin:2px 4px 2px 0">' + esc(o) + '</button>';
          });
        } else {
          h += '<div class="field"><input id="eq-in-' + i + '" placeholder="Type your answer"></div>' +
            '<button class="btn btn-primary btn-sm eq-fill" data-q="' + i + '">Check</button>';
        }
        h += '<div class="muted eq-why" id="eq-why-' + i + '" style="margin-top:6px"></div></div>';
      });
      ezb.innerHTML = h;
      qsa('.eq-opt').forEach(function (b) {
        b.onclick = function () { answerQuiz(+b.getAttribute('data-q'), b.getAttribute('data-o')); };
      });
      qsa('.eq-fill').forEach(function (b) {
        b.onclick = function () {
          var i = +b.getAttribute('data-q');
          answerQuiz(i, (qs('#eq-in-' + i) || {}).value || '');
        };
      });
    }
    function answerQuiz(i, given) {
      var q = qz[i]; if (!q || q._done) return;
      q._done = true; quizState.answered++;
      var ok = String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
      if (ok) quizState.correct++;
      var why = qs('#eq-why-' + i);
      if (why) { why.textContent = (ok ? '✅ ' : '❌ Correct answer: ' + q.answer + '. ') + (q.why || ''); }
      qsa('#eq-' + i + ' .eq-opt').forEach(function (b) { b.disabled = true; });
      if (quizState.answered === qz.length) {
        var sum = qs('#ez-sum');
        if (sum) sum.textContent = 'Quiz done: ' + quizState.correct + '/' + qz.length + ' correct.';
        renderPass();
      }
    }
    renderQuiz();

    /* Step 3：字数实时＋AI 点评（tutorChat→DGX 链路；不可达＝checklist 自评＋灰条，G3 先例） */
    var ta = qs('#ew-in');
    function wcount() {
      var n = (ta.value.trim().match(/\S+/g) || []).length;
      var el = qs('#ew-count'); if (el) el.textContent = n + ' / ' + ((unit.guided && unit.guided.minWords) || 0) + ' words';
      return n;
    }
    ta.oninput = wcount;
    qs('#ew-submit').onclick = function () {
      var need = (unit.guided && unit.guided.minWords) || 0;
      var n = wcount();
      if (n < need) { toast('Write at least ' + need + ' words — now you have ' + n + '.'); return; }
      essayText = ta.value.trim();
      var out = qs('#ew-ai');
      out.textContent = 'Reviewing your writing…';
      var ask = 'Please review this Grade ' + (lv === 'L1' ? '2' : '4') + ' student essay paragraph. ' +
        'Task: ' + ((unit.guided && unit.guided.prompt) || '') + ' ' +
        'Score each checklist item with ✓ or ✗ plus one short English sentence. End with ONE top improvement tip. English only.\n\nStudent writing:\n' + essayText;
      tutorChat(ask, aiState && aiState.ai, { max_tokens: 1200, lang: 'en', fresh: true }).then(function (res) {
        if (!res || res.src !== 'ai') {
          aiStateLabel = 'offline';
          out.innerHTML = '<div class="card" style="box-shadow:none;background:#f3f3f3">🤖 AI review is unavailable right now — please self-check with the checklist above, tick each item you did, and ask a grown-up to read it too.</div>';
        } else {
          aiStateLabel = 'ai';
          out.innerHTML = '<div class="card" style="box-shadow:none;background:#f7fbff">' + esc(res.text) + '</div>';
        }
        renderPass();
      }).catch(function () {
        aiStateLabel = 'offline';
        out.innerHTML = '<div class="card" style="box-shadow:none;background:#f3f3f3">🤖 AI review is unavailable right now — please self-check with the checklist above.</div>';
        renderPass();
      });
    };

    /* Step 4：过关（须做完 quiz＋提交写作）→ 存完成态＋星星 */
    function renderPass() {
      var box = qs('#ez-pass'); if (!box) return;
      var ready = quizState.answered === qz.length && !!essayText;
      if (done[unit.id]) { box.innerHTML = '<p class="muted">✅ Completed. Keep writing to get better!</p>'; return; }
      box.innerHTML = ready
        ? '<button class="btn btn-primary" id="ez-pass-btn">Mark unit complete ⭐</button>'
        : '<p class="muted">Finish the quiz and submit your writing first.</p>';
      var b = qs('#ez-pass-btn');
      if (b) b.onclick = function () {
        if (essayDoneSet(unit.id)) {
          done[unit.id] = { at: 'now' };
          toast('Great work! Unit ' + unit.id + ' complete ⭐ +3');
          setTimeout(function () { go('#/essay/' + lv); }, 600);
        } else { toast('Could not save progress on this device.'); }
      };
    }
    renderPass();
  }

  /* ================= BF 计时训练（MATH-BFWB-05）=================
   * 学校口径（老师 2026-11-17 通知）：每日 2 套 44 题、≤12min 达标、>20min 加练、11 法草稿自查。
   * 红线（Chief 裁定 + QA checklist-math-bfwb A 区）：
   *   A1 家长区只呈现用时与档位，零逐题对错；A2 答前 DOM 不含答案；
   *   A3 与判分链物理隔离——本模块只调 MT.store.bf* 键面，不碰 addStars/mastery/wrong/touchStreak；
   *   A4 反馈文案零"判分句式"（无 correct/wrong/Right!/Wrong）。揭晓 = 孩子按 "Check myself" 触发，
   *       且只并列"你的答案 / 答案"两值由孩子自己对照，App 永不裁决对错。 */
  var bfQ = null;            /* 作答会话：{setId, qs, idx, inputs:[], t0, timerId, elapsed} */
  var BF_TIER = { green: { c: '#2e9e5b', bg: '#e7f6ec', e: '🟢', label: 'On track (≤ 12 min)' },
                  yellow: { c: '#c98a00', bg: '#fdf3dd', e: '🟡', label: 'Getting there (12–20 min)' },
                  orange: { c: '#d9640b', bg: '#fdeae0', e: '🟠', label: 'Time for more practice (> 20 min)' } };
  function bfTodayStr() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function bfTier(secs) { return secs <= 720 ? 'green' : (secs <= 1200 ? 'yellow' : 'orange'); }
  function bfDayOfYear() { var d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); }
  function bfMethodToday() { var b = MT.BF_BANK; return b && b.methods && b.methods.length ? b.methods[bfDayOfYear() % b.methods.length] : null; }
  function bfDoneToday(setId) { return (MT.store.bfGetLog() || []).some(function (e) { return e.d === bfTodayStr() && e.set === setId; }); }
  function bfStop() { if (bfQ && bfQ.timerId) { clearInterval(bfQ.timerId); bfQ.timerId = null; } }

  function vBfHome() {
    var b = MT.BF_BANK;
    if (!b || !b.sets || !b.sets.length) { mount(crumbs('#/home', 'Home') + '<div class="card"><h2>⏱ Basic Facts</h2><p class="muted">Practice sets are on the way — check back soon!</p></div>'); return; }
    var log = MT.store.bfGetLog() || [], today = bfTodayStr();
    var todays = log.filter(function (e) { return e.d === today; });
    var extra = MT.store.bfExtraGet();
    var method = bfMethodToday();
    var html = crumbs('#/home', 'Home') + '<div class="card"><h2>⏱ Basic Facts</h2>' +
      '<p class="muted">2 sets a day · 22 questions each · 11 minutes is on track.</p>';
    if (extra === bfTomorrowStr()) html += '<p style="color:#d9640b">📅 Extra practice is on for tomorrow — one more set counts!</p>';
    else if (!extra && todays.length >= 2 && todays.every(function (e) { return e.tier === 'orange'; })) html += '<p style="color:#d9640b">📅 Today took a little longer — try one extra set tomorrow too!</p>';
    b.sets.forEach(function (s) {
      var done = bfDoneToday(s.id);
      var last = todays.filter(function (e) { return e.set === s.id; }).pop();
      html += '<div class="row" style="margin:6px 0"><button class="btn ' + (done ? 'btn-ghost' : 'btn-primary') + ' grow" data-go="#/bf/' + s.id + '">' +
        (done ? '✅ ' : '▶ ') + esc(s.name) + ' · 22 questions' + (last ? ' · ⏱ ' + bfFmtSecs(last.secs) + ' ' + BF_TIER[last.tier].e : '') + ' →</button></div>';
    });
    html += '<button class="btn btn-ghost" data-go="#/bf/methods" style="margin-top:8px;width:100%">🧮 11 checking strategies</button>';
    if (method) html += '<p class="muted" style="margin-top:8px">✏️ Today on scratch paper: <b>' + esc(method) + '</b></p>';
    html += '</div>';
    mount(html); bindGo();
  }

  function bfTomorrowStr() { var d = new Date(Date.now() + 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function bfFmtSecs(s) { s = Math.round(s); var m = Math.floor(s / 60); return m > 0 ? m + 'm ' + String(s % 60).padStart(2, '0') + 's' : s + 's'; }

  function vBfMethods() {
    var b = MT.BF_BANK || {};
    var ms = b.methods || [];
    var html = crumbs('#/bf', 'Basic Facts') + '<div class="card"><h2>🧮 11 ways to check your work</h2>' +
      '<p class="muted">2–3 days a week, show your thinking on scratch paper.</p>';
    ms.forEach(function (m, i) { html += '<div class="row" style="margin:7px 0;padding:8px 10px;background:#f4f6fb;border-radius:10px"><b style="margin-right:8px">' + (i + 1) + '.</b><span>' + esc(m) + '</span></div>'; });
    html += '</div>';
    mount(html); bindGo();
  }

  function vBfSet(r) {
    var setId = (r.a || 'A').toUpperCase();
    var b = MT.BF_BANK;
    var set = null;
    if (b) b.sets.forEach(function (s) { if (s.id === setId) set = s; });
    if (!set) { go('#/bf'); return; }
    bfStop();
    bfQ = { setId: setId, qs: set.qs, idx: 0, inputs: [], t0: Date.now(), timerId: null, elapsed: 0 };
    var html = crumbs('#/bf', 'Basic Facts') +
      '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center">' +
      '<h2>⏱ ' + esc(set.name) + '</h2><span class="w-timer" id="bf-timer">⏱ 0:00</span></div>' +
      '<div id="bf-body"></div></div>';
    mount(html);
    bfQ.timerId = setInterval(bfTick, 1000);
    bfRenderQ();
  }

  function bfTick() {
    var el = qs('#bf-timer'); if (!el || !bfQ) { bfStop(); return; }
    bfQ.elapsed = (Date.now() - bfQ.t0) / 1000;
    var s = Math.round(bfQ.elapsed), m = Math.floor(s / 60);
    el.textContent = '⏱ ' + m + ':' + String(s % 60).padStart(2, '0');
    el.className = 'w-timer' + (s > 720 ? ' warn' : '') + (s > 1200 ? ' over' : '');
  }

  function bfRenderQ() {
    var body = qs('#bf-body'); if (!body || !bfQ) return;
    var q = bfQ.qs[bfQ.idx];
    body.innerHTML = '<div class="muted">Question ' + (bfQ.idx + 1) + ' of ' + bfQ.qs.length + '</div>' +
      '<div class="q-text center" style="font-size:34px;margin:14px 0">' + esc(q.text) + '</div>' +
      '<div class="type-row"><input class="type-input" id="bf-in" type="number" inputmode="numeric" placeholder="?" autocomplete="off">' +
      '<button class="btn btn-primary" id="bf-sub">Done thinking ✓</button></div>';
    var inp = qs('#bf-in'); inp.focus();
    var submit = function () { bfQ.inputs[bfQ.idx] = (qs('#bf-in').value || '').trim(); bfRenderCheck(); };
    qs('#bf-sub').addEventListener('click', submit);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }

  function bfRenderCheck() {   /* 验算引导卡：答前/未触发揭晓 → DOM 无答案（A2） */
    var body = qs('#bf-body'); if (!body || !bfQ) return;
    var q = bfQ.qs[bfQ.idx], mine = bfQ.inputs[bfQ.idx] || '—';
    body.innerHTML = '<div class="q-text center" style="font-size:30px;margin:10px 0">' + esc(q.text) + '</div>' +
      '<div class="card" style="background:#f4f6fb;box-shadow:none;margin:8px 0">' +
      '<p style="margin:4px 0"><b>Check your work on scratch paper:</b></p>' +
      '<p style="margin:6px 0;font-size:17px">🧮 ' + esc(q.method) + '</p>' +
      '<p class="muted" style="margin:6px 0">Your answer: <b>' + esc(mine) + '</b></p></div>' +
      '<div class="row"><button class="btn btn-ghost grow" id="bf-again">↩ Fix my answer</button>' +
      '<button class="btn btn-primary grow" id="bf-reveal">Check myself 👀</button></div>';
    body.insertAdjacentHTML('beforeend', '<div id="bf-extra"></div><div class="row" style="margin-top:10px"><button class="btn btn-ghost grow" id="bf-next" disabled>Next →</button></div>');
    qs('#bf-again').addEventListener('click', function () { bfRenderQ(); });
    qs('#bf-next').addEventListener('click', function () { bfNext(); });
    qs('#bf-reveal').addEventListener('click', function () {   /* 孩子触发的揭晓：并列两值，App 不裁决（A4） */
      var extra = qs('#bf-extra'); if (!extra) return;
      extra.innerHTML = '<p style="font-size:20px;margin:6px 0">Your answer: <b>' + esc(bfQ.inputs[bfQ.idx] || '—') + '</b>&nbsp;&nbsp;·&nbsp;&nbsp;Answer: <b>' + esc(String(q.answer)) + '</b></p>' +
        '<p class="muted">Did you get the same? You be the judge — school checks the rest.</p>';
      var rb = qs('#bf-reveal'); rb.disabled = true; rb.textContent = 'Checked 👍';
      var nb = qs('#bf-next'); nb.disabled = false; nb.classList.remove('btn-ghost'); nb.classList.add('btn-primary');
    });
  }

  function bfNext() {
    if (!bfQ) return;
    if (bfQ.idx + 1 < bfQ.qs.length) { bfQ.idx++; bfRenderQ(); }
    else bfFinish();
  }

  function bfFinish() {
    bfStop();
    var secs = Math.round((Date.now() - bfQ.t0) / 1000);
    var tier = bfTier(secs);
    MT.store.bfRecord({ d: bfTodayStr(), set: bfQ.setId, secs: secs, tier: tier });  /* 只此一处落库：{d,set,secs,tier,ts} */
    var t = BF_TIER[tier];
    var body = qs('#bf-body'); if (!body) return;
    body.innerHTML = '<div style="text-align:center;margin:14px 0">' +
      '<div style="font-size:22px;margin:8px 0">Set ' + esc(bfQ.setId) + ' finished 🎉</div>' +
      '<div style="font-size:40px;margin:6px 0">⏱ ' + bfFmtSecs(secs) + '</div>' +
      '<div style="display:inline-block;padding:6px 14px;border-radius:16px;color:#fff;background:' + t.c + '">' + t.e + ' ' + esc(t.label) + '</div>' +
      '<p class="muted" style="margin-top:10px">Time and streak are saved for grown-ups.</p></div>' +
      (tier === 'orange'
        ? '<button class="btn btn-primary grow" id="bf-extra-btn" style="width:100%">📅 Schedule extra practice tomorrow</button>'
        : '') +
      '<button class="btn btn-ghost" id="bf-back" style="width:100%;margin-top:8px">Back to sets</button>';
    var eb = qs('#bf-extra-btn');
    if (eb) eb.addEventListener('click', function () { MT.store.bfScheduleExtra(bfTomorrowStr()); eb.disabled = true; eb.textContent = 'Extra practice for tomorrow ✓'; });
    qs('#bf-back').addEventListener('click', function () { bfQ = null; go('#/bf'); });
  }

  /* 家长区 BF 趋势卡（A1）：只有日期/套号/用时/档位——无逐题对错、无批改提示 */
  function bfParentCard() {
    var log = (MT.store.bfGetLog() || []).slice(-14).reverse();
    var html = '<div class="card"><h3 style="font-size:22px">⏱ 计算熟练度（Basic Facts）</h3>';
    if (!log.length) return html + '<p class="muted">还没有记录——孩子在 ⏱ Basic Facts 完成一套后，这里会出现用时与档位。</p></div>';
    var lastTier = log[0].tier;
    html += '<table class="tbl" style="width:100%"><tr><th style="text-align:left">日期</th><th>套</th><th>用时</th><th>档位</th></tr>';
    log.forEach(function (e) {
      html += '<tr><td>' + esc(e.d) + '</td><td>' + esc(e.set) + '</td><td>' + bfFmtSecs(e.secs) + '</td><td>' + BF_TIER[e.tier].e + ' ' + esc(e.tier) + '</td></tr>';
    });
    html += '</table>';
    var prev = log[1] && log[1].tier;
    if (prev && prev !== lastTier) html += '<p class="muted">最近档位：' + BF_TIER[prev].e + ' → ' + BF_TIER[lastTier].e + '</p>';
    var extra = MT.store.bfExtraGet();
    if (extra) html += '<p class="muted">📅 已约明日加练：' + esc(extra) + '</p>';
    return html + '</div>';
  }

  /* ================= AMC 板块（MATH-AMC-03）=================
   * 家长令（11-19）：2026 AMC 四卷（Pre-A/A/B/C）进 App 作竞赛拓展线，与校内 BF 分开、不占每日任务。
   * 红线同 BF 家族（Chief 定版）：答前 DOM 零答案；"Check myself" 才揭晓（并列 Your answer / Answer，
   * App 永不裁决）；不发星不计分；星星/弱点/错题本零写入；家长区只有完成档数/题数。
   * 题源＝MT.AMC_BANK（banks-amc.js，mock 旗标期）；真题候 MATH-AMC-02 源件换弹夹不改本段。 */
  var amcQ = null;   /* {level, qs, idx, picked, at} */
  var AMC_LEVELS = [['prea', 'Pre-A', 'Grades 1–2'], ['a', 'A', 'Grades 3–4'], ['b', 'B', 'Grades 5–6'], ['c', 'C', 'Grades 7–8']];
  function amcLevelQs(lv) {
    var b = MT.AMC_BANK;
    return (b && Array.isArray(b.qs)) ? b.qs.filter(function (q) { return q.level === lv; }) : [];
  }

  function vAmcHome() {
    var done = MT.store.amcDoneGet() || {};
    var html = crumbs('#/home', 'Home') + '<div class="card"><h2>🏆 AMC Challenge</h2>' +
      '<p class="muted">Australian Mathematics Competition — pick a level, solve, and check your own work.</p>';
    AMC_LEVELS.forEach(function (l) {
      var qs = amcLevelQs(l[0]);
      var n = qs.filter(function (q) { return done[q.id]; }).length;
      html += '<div class="row" style="margin:6px 0"><button class="btn ' + (qs.length && n === qs.length ? 'btn-ghost' : 'btn-primary') + ' grow" data-go="#/amc/' + l[0] + '">' +
        (qs.length && n === qs.length ? '✅ ' : '▶ ') + 'Level ' + l[1] + ' <span class="muted">· ' + l[2] + '</span> · ' + n + '/' + qs.length + ' →</button></div>';
    });
    html += '</div>';
    mount(html); bindGo();
  }

  function vAmcLevel(r) {
    var lv = r.a;
    if (!amcLevelQs(lv).length) { go('#/amc'); return; }
    var done = MT.store.amcDoneGet() || {};
    var qs = amcLevelQs(lv);
    var start = 0;
    for (var i = 0; i < qs.length; i++) { if (!done[qs[i].id]) { start = i; break; } if (i === qs.length - 1) start = 0; } /* 全完成则重玩首题 */
    amcQ = { level: lv, qs: qs, idx: start, picked: null, at: Date.now() };
    var html = crumbs('#/amc', 'AMC') + '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center">' +
      '<h2>🏆 Level ' + esc((AMC_LEVELS.filter(function (l) { return l[0] === lv; })[0] || [])[1] || lv) + '</h2>' +
      '<button class="btn btn-ghost btn-sm" data-go="#/amc">Levels</button></div><div id="amc-body"></div></div>';
    mount(html); bindGo();
    amcRenderQ();
  }

  function amcRenderQ() {
    var body = qs('#amc-body'); if (!body || !amcQ) return;
    var q = amcQ.qs[amcQ.idx];
    amcQ.picked = null;
    var img = (q.img && q.img.length) ? '<div class="amc-fig">' + q.img.map(function (p) { return '<img src="' + esc(p) + '" alt="question figure" style="max-width:100%;border-radius:10px;margin:6px 0">'; }).join('') + '</div>' : '';
    body.innerHTML = '<div class="muted">Question ' + (amcQ.idx + 1) + ' of ' + amcQ.qs.length + '</div>' +
      img +
      '<div class="amc-txt"><div class="q-text" style="font-size:22px;margin:10px 0">' + esc(q.en) + '</div>' +
      '<p class="muted" style="margin:2px 0 8px">' + esc(q.zh) + '</p></div>';
    if (q.options) {                                    /* 五选一 */
      var opts = document.createElement('div');
      'ABCDE'.split('').forEach(function (L) {
        var b = document.createElement('button');
        b.className = 'btn btn-ghost'; b.style.cssText = 'display:block;width:100%;margin:6px 0;text-align:left';
        b.textContent = '(' + L + ')  ' + q.options[L];
        b.setAttribute('data-opt', L);
        opts.appendChild(b);
      });
      body.appendChild(opts);
      body.insertAdjacentHTML('beforeend',
        '<div class="row" style="margin-top:10px"><button class="btn btn-primary grow" id="amc-sub" disabled>Done thinking ✓</button></div><div id="amc-extra"></div>');
      qsa('[data-opt]').forEach(function (b) {
        b.addEventListener('click', function () {
          qsa('[data-opt]').forEach(function (o) { o.classList.remove('btn-primary'); o.classList.add('btn-ghost'); });
          b.classList.remove('btn-ghost'); b.classList.add('btn-primary');
          amcQ.picked = b.getAttribute('data-opt');
          qs('#amc-sub').disabled = false;
        });
      });
      qs('#amc-sub').addEventListener('click', amcRenderCheck);
    } else {                                            /* 数字解/图选项题＝自由作答（Chief 11-19 批准降级态，不硬造钮） */
      body.insertAdjacentHTML('beforeend',
        '<div class="type-row"><input class="type-input" id="amc-in" type="text" inputmode="numeric" placeholder="?" autocomplete="off">' +
        '<button class="btn btn-primary" id="amc-sub">Done thinking ✓</button></div><div id="amc-extra"></div>');
      var inp = qs('#amc-in'); inp.focus();
      var submit = function () { amcQ.picked = (qs('#amc-in').value || '').trim(); if (!amcQ.picked) { toast('Type your answer first 🙂'); return; } amcRenderCheck(); };
      qs('#amc-sub').addEventListener('click', submit);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    }
  }

  function amcRenderCheck() {   /* 自查引导：未触发揭晓 → DOM 无答案（A2 同款） */
    var body = qs('#amc-body'); if (!body || !amcQ || !amcQ.picked) return;
    var q = amcQ.qs[amcQ.idx], mine = q.options ? ('(' + amcQ.picked + ') ' + q.options[amcQ.picked]) : amcQ.picked;
    var card = qs('#amc-extra');
    card.innerHTML = '<div class="card" style="background:#f4f6fb;box-shadow:none;margin:10px 0 4px">' +
      '<p style="margin:4px 0"><b>Check your work first — redraw the figure, count again, or work backwards.</b></p>' +
      '<p class="muted" style="margin:6px 0">Your answer: <b>' + esc(mine) + '</b></p></div>' +
      '<div class="row"><button class="btn btn-ghost grow" id="amc-rethink">↩ Change my answer</button>' +
      '<button class="btn btn-primary grow" id="amc-reveal">Check myself 👀</button></div>' +
      '<div id="amc-reveal-box"></div><div class="row" style="margin-top:10px"><button class="btn btn-ghost grow" id="amc-next" disabled>Next →</button></div>';
    qs('#amc-rethink').addEventListener('click', function () { card.innerHTML = ''; amcQ.picked = null; if (q.options) { qsa('[data-opt]').forEach(function (o) { o.classList.remove('btn-primary'); o.classList.add('btn-ghost'); }); qs('#amc-sub').disabled = true; } else { qs('#amc-in').focus(); } });
    qs('#amc-reveal').addEventListener('click', function () {
      var box = qs('#amc-reveal-box'); if (!box || box.getAttribute('data-on')) return;
      box.setAttribute('data-on', '1');
      /* Chief 11-19 接口约定：ans 未双源核（留空/非法）→ 不并列 Answer、永不硬造；后补即点亮。
       * 形态互锁：五选题答案必须是指派字母；数字解答案只配自由作答形态（数字串），串形＝视同未验证 */
      var shapeOk = q.options ? ('ABCDE'.includes(q.answer) && q.options[q.answer])
                              : (q.answer != null && q.answer !== '' && !'ABCDE'.includes(String(q.answer)));
      var ansSide = q.options ? '(' + esc(q.answer) + ') ' + esc(q.options[q.answer]) : esc(String(q.answer));
      box.innerHTML = shapeOk
        ? '<p style="font-size:19px;margin:8px 0">Your answer: <b>' + esc(mine) + '</b>&nbsp;·&nbsp;Answer: <b>' + ansSide + '</b></p>' +
          '<p class="muted">Did you get the same? You be the judge — school checks the rest.</p>'
        : '<p style="font-size:19px;margin:8px 0">Your answer: <b>' + esc(mine) + '</b></p>' +
          '<p class="muted">Answer not verified yet — ask your teacher.</p>';
      qs('#amc-reveal').disabled = true; qs('#amc-reveal').textContent = 'Checked 👍';
      var nb = qs('#amc-next'); nb.disabled = false; nb.classList.remove('btn-ghost'); nb.classList.add('btn-primary');
    });
    qs('#amc-next').addEventListener('click', amcNext);
  }

  function amcNext() {
    if (!amcQ) return;
    MT.store.amcDoneSet(amcQ.qs[amcQ.idx].id);   /* 揭晓过即记完成（只记足迹，零对错） */
    if (amcQ.idx + 1 < amcQ.qs.length) { amcQ.idx++; amcRenderQ(); }
    else amcFinish();
  }

  function amcFinish() {
    var body = qs('#amc-body'); if (!body) return;
    var n = amcQ.qs.length;
    body.innerHTML = '<div style="text-align:center;margin:16px 0">' +
      '<div style="font-size:22px">Level ' + esc(amcQ.level.toUpperCase()) + ' set done 🎉</div>' +
      '<div style="font-size:38px;margin:6px 0">🏅 ' + n + ' / ' + n + '</div>' +
      '<p class="muted">Progress (how many you finished) is saved for grown-ups.</p>' +
      '<button class="btn btn-primary" id="amc-back" style="margin-top:8px">Back to levels</button></div>';
    qs('#amc-back').addEventListener('click', function () { amcQ = null; go('#/amc'); });
  }

  /* 家长区 AMC 段（A1 同款）：只有各档完成题数/总数与最近足迹时间，零逐题对错 */
  function amcParentCard() {
    var done = MT.store.amcDoneGet() || {};
    var ids = Object.keys(done);
    var html = '<div class="card"><h3 style="font-size:22px">🏆 AMC 挑战进度</h3>';
    if (!ids.length) return html + '<p class="muted">还没有记录——孩子在 🏆 AMC Challenge 揭晓自查后，这里会出现完成题数。</p></div>';
    html += '<table class="tbl" style="width:100%"><tr><th style="text-align:left">档位</th><th>完成</th></tr>';
    AMC_LEVELS.forEach(function (l) {
      var qsL = amcLevelQs(l[0]);
      var n = qsL.filter(function (q) { return done[q.id]; }).length;
      if (qsL.length) html += '<tr><td style="text-align:left">Level ' + esc(l[1]) + '</td><td>' + n + ' / ' + qsL.length + '</td></tr>';
    });
    html += '</table>';
    var lastAt = done[ids[ids.length - 1]] && done[ids[ids.length - 1]].at;
    if (lastAt) html += '<p class="muted">最近一次：' + esc(lastAt) + '（共 ' + ids.length + ' 题）</p>';
    return html + '</div>';
  }

  /* ================= MAP Reading（MT-MAP-01 · 家长 11-22 定版三页签） =================
   * skills＝技巧卡（主件）/ words＝高频词翻卡 / practice＝同技能自编题（组内 ≤5 题）。
   * 红线：不发星不计分——答前 DOM 零答案，"Check myself" 才揭晓；星星/弱点/错题本零写入；
   * 家长区只呈现完成度趋势（技巧卡打开数 / 词卡翻过数 / 练习完成题数），零逐题对错。
   * 内容弹夹口＝MT.MAP_BANK 三数组（skills/words/items），真内容到后 app 零改动。 */
  var MAP_TABS = [['skills', '🧭 Skills'], ['words', '🔤 Words'], ['practice', '✏️ Practice']];
  var mapQ = null;   /* { group, qs, idx, picked, at } */
  /* MT-MAP-04（QA T6b）：自编内容必须对家长可见披露——source==='mock' 即挂样题标签；换真内容 source 变即自动消失 */
  function mapBadge(src) {
    if (src === 'mock') return '<span style="background:#fff3d6;color:#8a6100;border-radius:8px;padding:1px 8px;font-size:12px;margin-left:6px;vertical-align:2px">sample · teacher-made</span>';
    if (src === 'self_authored') return '<span style="background:#e3f4ea;color:#15683c;border-radius:8px;padding:1px 8px;font-size:12px;margin-left:6px;vertical-align:2px">teacher-made</span>';
    return '';
  }
  function mapAnyMock() {
    var b = MT.MAP_BANK || {};
    return b.mock === true || (b.skills || []).some(function (s) { return s.source === 'mock'; }) ||
      (b.items || []).some(function (g) { return g.source === 'mock' || (g.qs || []).some(function (q) { return q.source === 'mock'; }); }) ||
      (b.words || []).some(function (w) { return typeof w.source === 'string' && w.source.indexOf('mock') === 0; });
  }

  function mapTabsHtml(cur) {
    return '<div class="row" style="margin:8px 0">' + MAP_TABS.map(function (t) {
      return '<button class="btn grow ' + (t[0] === cur ? 'btn-primary' : 'btn-ghost') + '" data-go="#/map/' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  }

  function vMapHome() {
    var b = MT.MAP_BANK || {};
    var nS = (b.skills || []).length, nW = (b.words || []).length, nI = (b.items || []).length;
    mount('<div class="card"><h2>📖 MAP Reading</h2>' +
      '<p class="muted">Learn the skills, grow the word bank, then practise a little — one small set at a time.</p>' +
      mapTabsHtml('') +
      '<div class="row" style="margin-top:6px">' +
      '<button class="btn btn-primary grow" data-go="#/map/skills">🧭 Skills <span class="muted">· ' + nS + ' cards</span></button>' +
      '<button class="btn btn-primary grow" data-go="#/map/words">🔤 Words <span class="muted">· ' + nW + ' words</span></button>' +
      '<button class="btn btn-primary grow" data-go="#/map/practice">✏️ Practice <span class="muted">· ' + nI + ' sets</span></button>' +
      '</div>' + (mapAnyMock() ? '<p class="muted" style="margin-top:10px">Sample set · teacher-made — not real MAP/ReadTheory items. Real content loads in soon.</p>' : '') +
      '</div>');
    bindGo();
  }

  /* ---- Skills：每题型一张技巧卡（考什么/四步解法/常见陷阱/口诀/示范题） ---- */
  function vMapSkills() {
    var b = MT.MAP_BANK || {};
    var list = b.skills || [];
    var html = '<div class="card">' + crumbs(['#/map', 'MAP Reading']) + '<h2>🧭 Reading Skills</h2>' + mapTabsHtml('skills');
    if (!list.length) { html += '<p class="muted">No skill cards yet — they grow in with each reading review.</p></div>'; mount(html); bindGo(); return; }
    list.forEach(function (sk) {
      MT.store.mapSkillsOpen(sk.id);   /* 只记"打开过"足迹，零对错 */
      html += '<div class="card" style="border-left:4px solid #1f8a70;margin-top:10px">' +
        '<h3 style="font-size:20px">' + esc(sk.name) + mapBadge(sk.source) + '</h3>' +
        '<p>' + esc(sk.ask) + '</p>' +
        '<b>How to solve (4 steps)</b><ol style="margin:6px 0 6px 20px">' + (sk.steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<b>Watch out</b><ul style="margin:6px 0 6px 20px">' + (sk.traps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<p>🗣 <b>' + esc(sk.chant || '') + '</b></p>';
      if (sk.demo) {   /* 示范题也走"先想后揭"：未点 Check myself 前 DOM 无答案 */
        html += '<div style="background:#f2f8f5;border-radius:10px;padding:10px;margin-top:6px">' +
          '<div class="muted">Try one</div><p>' + esc(sk.demo.stem) + '</p>' +
          '<div class="row" style="flex-wrap:wrap">' + Object.keys(sk.demo.opts || {}).map(function (k) {
            return '<button class="btn btn-ghost skill-opt" data-skill="' + esc(sk.id) + '" data-opt="' + esc(k) + '" style="margin:3px">' + esc(k) + '. ' + esc(sk.demo.opts[k]) + '</button>';
          }).join('') + '</div>' +
          '<div class="row" style="margin-top:8px"><button class="btn btn-primary skill-asked" data-skill="' + esc(sk.id) + '" disabled>Done thinking ✓</button></div>' +
          '<div id="skill-reveal-' + esc(sk.id) + '"></div></div>';
      }
      html += '</div>';
    });
    html += '</div>';
    mount(html); bindGo();
    /* 示范题交互：选一个→Done thinking→Check myself 才出思路（不给"正确答案是X"判分句，规格 B③） */
    qsa('.skill-opt').forEach(function (btn) {
      btn.onclick = function () {
        var sid = btn.getAttribute('data-skill');
        qsa('.skill-opt[data-skill="' + sid + '"]').forEach(function (o) { o.classList.remove('btn-primary'); o.classList.add('btn-ghost'); });
        btn.classList.remove('btn-ghost'); btn.classList.add('btn-primary');
        var pk = qs('.skill-asked[data-skill="' + sid + '"]'); if (pk) pk.disabled = false;
      };
    });
    qsa('.skill-asked').forEach(function (btn) {
      btn.onclick = function () {
        var sid = btn.getAttribute('data-skill');
        var box = qs('#skill-reveal-' + sid); if (!box || box.getAttribute('data-on')) return;
        var sk = (MT.MAP_BANK.skills || []).filter(function (x) { return x.id === sid; })[0]; if (!sk || !sk.demo) return;
        box.setAttribute('data-on', '1');
        box.innerHTML = '<p style="margin:8px 0 4px">💭 ' + esc(sk.demo.explain || '') + '</p>' +
          '<p class="muted">You be the judge — did your pick match the way of thinking?</p>';
        btn.disabled = true; btn.textContent = 'Checked 👍';
      };
    });
  }

  /* ---- Words：翻卡（正面 word＋例句 / 反面 中文＋词性）；翻到反面＝足迹 ---- */
  function vMapWords() {
    var b = MT.MAP_BANK || {};
    var list = b.words || [];
    var html = '<div class="card">' + crumbs(['#/map', 'MAP Reading']) + '<h2>🔤 Word Cards</h2>' +
      '<p class="muted">Tap a card to flip it. Words grow in with every reading review.</p>' + mapTabsHtml('words');
    if (!list.length) { html += '<p class="muted">No words yet — they grow in with each reading review.</p></div>'; mount(html); bindGo(); return; }
    html += '<div class="row map-wordgrid" style="flex-wrap:wrap">';
    list.forEach(function (w) {
      html += '<div class="map-word" data-wid="' + esc(w.id) + '" style="width:calc(50% - 8px);margin:4px;min-height:96px;border:1px solid #d7e8e0;border-radius:12px;padding:10px;cursor:pointer;background:#fff">' +
        '<div style="font-size:19px"><b>' + esc(w.word) + '</b>' + mapBadge(w.source) + ' <span class="muted">' + esc(w.phonetic || '') + '</span></div>' +
        '<div class="muted" style="margin-top:4px">' + esc(w.en || '') + '</div>' +
        '<div class="mw-back" style="display:none;margin-top:6px;color:#1f8a70"><b>' + esc(w.zh || '') + '</b>' +
        (w.pos ? ' <span class="muted">· ' + esc(w.pos) + '</span>' : '') + '</div></div>';
    });
    html += '</div></div>';
    mount(html); bindGo();
    qsa('.map-word').forEach(function (el) {
      el.onclick = function () {
        var back = el.querySelector('.mw-back'); if (!back) return;
        var show = back.style.display === 'none';
        back.style.display = show ? 'block' : 'none';
        if (show) MT.store.mapWordsFlip(el.getAttribute('data-wid'));   /* 只记翻过，零对错 */
      };
    });
  }

  /* ---- Practice：组内 ≤5 题（不题海口径硬闸）；AMC 同款"先想后揭" ---- */
  function mapGroups() {
    var b = MT.MAP_BANK || {};
    return (b.items || []).filter(function (g) { return g.qs && g.qs.length; });
  }
  function vMapPractice() {
    var html = '<div class="card">' + crumbs('#/map', 'MAP Reading') + '<h2>✏️ Practice Sets</h2>' +
      '<p class="muted">Small sets — 5 questions at most. No stars, no scores: think, check yourself, move on.</p>' + mapTabsHtml('practice');
    var gs = mapGroups();
    if (!gs.length) { html += '<p class="muted">No practice sets yet — they grow in with each reading review.</p></div>'; mount(html); bindGo(); return; }
    var done = MT.store.mapDoneGet() || {};
    gs.forEach(function (g) {
      if (g.qs.length > 5) { console.warn('map group over cap', g.id, g.qs.length); }   /* 组内 ≤5 硬闸：违例显式报红，不静默截断 */
      var n = g.qs.filter(function (q) { return done[q.id]; }).length;
      html += '<div class="row" style="margin:6px 0"><button class="btn ' + (n >= g.qs.length ? 'btn-ghost' : 'btn-primary') + ' grow" data-go="#/map/practice/' + esc(g.group || g.id) + '">' +
        esc(g.title) + mapBadge(g.source) + ' <span class="muted">· ' + esc(g.genre || '') + ' · ' + g.qs.length + ' q</span></button>' +
        '<span class="muted">' + n + '/' + g.qs.length + '</span></div>';
    });
    html += '</div>';
    mount(html); bindGo();
  }
  function vMapSet(gid) {
    var g = mapGroups().filter(function (x) { return (x.group || x.id) === gid; })[0];
    if (!g) { go('#/map/practice'); return; }
    mapQ = { group: g, qs: g.qs, idx: 0, picked: null };
    var html = '<div class="card">' + crumbs(['#/map/practice', 'Sets']) +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h2>' + esc(g.title) + mapBadge(g.source) + '</h2>' +
      '<button class="btn btn-ghost btn-sm" data-go="#/map/practice">Sets</button></div>' +
      '<div class="map-cols">' +
      (g.passage ? '<div class="map-passage" style="background:#f6f9f7;border-radius:10px;padding:12px;white-space:pre-wrap">' + esc(g.passage) + '</div>' : '') +
      '<div id="map-body" class="map-qcol" style="margin-top:10px"></div></div>';
    mount(html); bindGo();
    mapRenderQ();
  }
  function mapRenderQ() {
    var body = qs('#map-body'); if (!body || !mapQ) return;
    var q = mapQ.qs[mapQ.idx];
    mapQ.picked = null;
    /* 红线自证点：此 DOM 态零 ans/explain 字样——答案只在 mapAsk 触发的 reveal 里出现 */
    body.innerHTML = '<div class="muted">Question ' + (mapQ.idx + 1) + ' of ' + mapQ.qs.length + ' · ' + esc(q.skill || '') + '</div>' +
      '<p style="font-size:18px">' + esc(q.stem) + '</p>' +
      '<div class="row" style="flex-wrap:wrap">' + Object.keys(q.opts || {}).map(function (k) {
        return '<button class="btn btn-ghost map-opt" data-opt="' + esc(k) + '" style="margin:3px">' + esc(k) + '. ' + esc(q.opts[k]) + '</button>';
      }).join('') + '</div>' +
      '<div class="row" style="margin-top:10px"><button class="btn btn-primary grow" id="map-sub" disabled>Done thinking ✓</button></div><div id="map-extra"></div>';
    qsa('.map-opt').forEach(function (b) {
      b.onclick = function () {
        qsa('.map-opt').forEach(function (o) { o.classList.remove('btn-primary'); o.classList.add('btn-ghost'); });
        b.classList.remove('btn-ghost'); b.classList.add('btn-primary');
        mapQ.picked = b.getAttribute('data-opt');
        qs('#map-sub').disabled = false;
      };
    });
    qs('#map-sub').addEventListener('click', mapAsk);
  }
  function mapAsk() {
    var body = qs('#map-extra'); if (!body || !mapQ || !mapQ.picked) return;
    var q = mapQ.qs[mapQ.idx];
    body.innerHTML = '<div class="row"><button class="btn btn-ghost grow" id="map-rethink">↩ Change my answer</button>' +
      '<button class="btn btn-primary grow" id="map-reveal">Check myself 👀</button></div>' +
      '<div id="map-reveal-box"></div><div class="row" style="margin-top:10px"><button class="btn btn-ghost grow" id="map-next" disabled>Next →</button></div>';
    qs('#map-rethink').addEventListener('click', function () {
      body.innerHTML = ''; mapQ.picked = null;
      qsa('.map-opt').forEach(function (o) { o.classList.remove('btn-primary'); o.classList.add('btn-ghost'); });
      qs('#map-sub').disabled = true;
    });
    qs('#map-reveal').addEventListener('click', function () {
      var box = qs('#map-reveal-box'); if (!box || box.getAttribute('data-on')) return;
      box.setAttribute('data-on', '1');
      /* 同 AMC 形态互锁：答案必须是指派字母且在选项内，否则视同未验证，永不硬造 */
      var ok = ('ABCD'.indexOf(q.ans) >= 0) && q.opts && q.opts[q.ans];
      box.innerHTML = '<p style="font-size:19px;margin:8px 0">Your answer: <b>(' + esc(mapQ.picked) + ') ' + esc((q.opts || {})[mapQ.picked] || '') + '</b>' +
        (ok ? '&nbsp;·&nbsp;Answer: <b>(' + esc(q.ans) + ') ' + esc(q.opts[q.ans]) + '</b>' : '') + '</p>' +
        (q.explain ? '<p style="margin:4px 0">💭 ' + esc(q.explain) + '</p>' : '') +
        (ok ? '<p class="muted">Did you get the same? You be the judge — school checks the rest.</p>'
            : '<p class="muted">Answer not verified yet — ask your teacher.</p>');
      qs('#map-reveal').disabled = true; qs('#map-reveal').textContent = 'Checked 👍';
      var nb = qs('#map-next'); nb.disabled = false; nb.classList.remove('btn-ghost'); nb.classList.add('btn-primary');
    });
    qs('#map-next').addEventListener('click', mapNext);
  }
  function mapNext() {
    if (!mapQ) return;
    MT.store.mapDoneSet(mapQ.qs[mapQ.idx].id);   /* 揭晓过即记完成（只记足迹，零对错） */
    if (mapQ.idx + 1 < mapQ.qs.length) { mapQ.idx++; mapRenderQ(); }
    else mapFinish();
  }
  function mapFinish() {
    var body = qs('#map-body'); if (!body) return;
    var n = mapQ.qs.length;
    body.innerHTML = '<div style="text-align:center;margin:16px 0">' +
      '<div style="font-size:22px">Set done 🎉</div>' +
      '<div style="font-size:38px;margin:6px 0">📗 ' + n + ' / ' + n + '</div>' +
      '<p class="muted">Progress (how many you finished) is saved for grown-ups.</p>' +
      '<button class="btn btn-primary" id="map-back" style="margin-top:8px">Back to sets</button></div>';
    qs('#map-back').addEventListener('click', function () { mapQ = null; go('#/map/practice'); });
  }

  /* ---- 家长区 MAP 段：只有三行完成度趋势，零逐题对错 ---- */
  function mapParentCard() {
    var b = MT.MAP_BANK || {};
    var d = MT.store.mapDoneGet() || {}, w = MT.store.mapWordsGet() || {}, sk = MT.store.mapSkillsGet() || {};
    var ids = Object.keys(d);
    var html = '<div class="card"><h3 style="font-size:22px">📖 MAP Reading 进度</h3>' +
      (mapAnyMock()
        ? '<p class="muted" style="color:#8a6100">当前题库为示例/自编内容（sample · teacher-made），非 MAP/ReadTheory 真题。</p>'
        : '<p class="muted">当前题库为团队自编内容（teacher-made），非 MAP/ReadTheory 真题。</p>');
    if (!ids.length && !Object.keys(w).length && !Object.keys(sk).length)
      return html + '<p class="muted">还没有记录——孩子在 📖 MAP Reading 打开技巧卡、翻词卡、练习自查后，这里会出现完成度。</p></div>';
    var qsAll = []; (b.items || []).forEach(function (g) { (g.qs || []).forEach(function (q) { qsAll.push(q.id); }); });
    var nQ = qsAll.filter(function (id) { return d[id]; }).length;
    html += '<table class="tbl" style="width:100%"><tr><th style="text-align:left">维度</th><th>完成</th></tr>' +
      '<tr><td style="text-align:left">技巧卡</td><td>' + Object.keys(sk).length + ' / ' + (b.skills || []).length + '</td></tr>' +
      '<tr><td style="text-align:left">高频词卡（翻过）</td><td>' + Object.keys(w).length + ' / ' + (b.words || []).length + '</td></tr>' +
      '<tr><td style="text-align:left">练习（自查完成）</td><td>' + nQ + ' / ' + qsAll.length + '</td></tr></table>';
    var lastAt = d[ids[ids.length - 1]] && d[ids[ids.length - 1]].at;
    if (lastAt) html += '<p class="muted">最近一次：' + esc(lastAt) + '</p>';
    return html + '</div>';
  }

  var VIEWS = {
    home: vHome, subject: vSubject, preview: function (r) { r.b ? vPreviewDetail(r) : vPreviewList(r); },
    recite: vRecite, setup: vSetup, quiz: vQuiz, result: vResult, chat: vChat, wrongbook: vWrongbook, parent: vParent,
    essay: function (r) { r.a ? (r.b ? vEssayUnit(r) : vEssayLevel(r)) : vEssayHome(); },
    bf: function (r) { if (!r.a) vBfHome(); else if (r.a === 'methods') vBfMethods(); else vBfSet(r); },
    amc: function (r) { r.a ? vAmcLevel(r) : vAmcHome(); },
    map: function (r) {
      if (r.a === 'practice' && r.b) vMapSet(r.b);
      else if (r.a === 'skills') vMapSkills();
      else if (r.a === 'words') vMapWords();
      else if (r.a === 'practice') vMapPractice();
      else vMapHome();
    }
  };

  function bindGo() {
    qsa('[data-go]').forEach(function (b) { b.onclick = function () { go(b.getAttribute('data-go')); }; });
  }

  /* ================= 启动 ================= */
  function boot() {
    ST.touchStreak();
    refreshStatus(function () { /* 记录 ai 状态，供开放题门控 */ });
    document.addEventListener('pointerdown', function () { VO.unlock(); }, { once: true, passive: true });
    window.addEventListener('hashchange', render);
    if (!location.hash || location.hash === '#' || location.hash === '#/') location.hash = '#/home';
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* 冒烟钩子 */
  MT.app = { render: render, parseHash: parseHash, startQuiz: startQuiz, _blank: makeBlank, _recitePool: recitePool, _candidates: blankCandidates, _i18n: { subjectLang: subjectLang, speakLangOf: speakLangOf, T: T, lang: function () { return quizLang; }, setLang: function (l) { quizLang = l; } }, _state: function () { return { quiz: quiz, RESULT: RESULT, setupSel: setupSel, chatMsgs: chatMsgs, aiState: aiState, parentUnlocked: parentUnlocked }; }, _bf: { tier: bfTier, fmt: bfFmtSecs, today: bfTodayStr, tomorrow: bfTomorrowStr, methodToday: bfMethodToday,
                      dbg: function () { return bfQ ? { setId: bfQ.setId, idx: bfQ.idx, len: bfQ.qs.length, answered: bfQ.inputs.length, elapsed: Math.round(bfQ.elapsed || 0) } : null; } } };
})();
