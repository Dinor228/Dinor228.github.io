/* My Tutor · AI 聊天（带离线降级）+ 答案判定 + 背诗 */
window.MT = window.MT || {};

(function () {
  /* ---------- 中文数字 → 阿拉伯数字（支持 零~九、十、几十一、几十几、一百） ---------- */
  var CN_NUM = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  function cnToNumber(s) {
    if (typeof s !== 'string') return null;
    s = s.trim();
    if (!s) return null;
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
    if (s === '十') return 10;
    if (s === '一百' || s === '一〇〇') return 100;
    /* 几十 或 几十几，如 三十、三十五、十五 */
    var m = s.match(/^(?:(.)十)?(.?)(?:十)?(.?)$/) && s.match(/^(.?)十(.?)$|^([零一二两三四五六七八九])$/);
    if (!m) return null;
    var tens = 0, ones = 0;
    if (/十/.test(s)) {
      var parts = s.split('十');
      var t = parts[0], o = parts[1] || '';
      tens = (t === '') ? 1 : CN_NUM[t];
      if (tens === undefined) return null;
      if (o === '') ones = 0;
      else {
        ones = CN_NUM[o];
        if (ones === undefined) return null;
      }
      return tens * 10 + ones;
    }
    if (s.length === 1 && CN_NUM[s] !== undefined) return CN_NUM[s];
    return null;
  }

  /* ---------- 文本归一化 ---------- */
  var PUNCT_RE = /[，。！？、；：,.!?;:·…“”‘’"'（）()【】\[\]~～\-—_]/g;
  function normalize(text) {
    if (text === null || text === undefined) return '';
    var s = String(text).toLowerCase().trim();
    s = s.replace(/\s+/g, ' ');          /* 多空格归一 */
    /* 全角比较符号 → 半角（比大小题孩子可能打全角） */
    s = s.replace(/＞/g, '>').replace(/＜/g, '<').replace(/＝/g, '=');
    s = s.replace(PUNCT_RE, '');          /* 忽略中英文标点 */
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }
  /* 英语单词宽松去尾 s（用于单复数） */
  function depluralize(word) {
    var w = word.trim();
    return (w.length > 3 && /s$/.test(w)) ? w.slice(0, -1) : w;
  }

  /* ---------- 判分 ---------- */
  /**
   * gradeAnswer(q, userText) → {ok, normalized}
   * q: 题目对象（用 q.a 作为标准答案；英语题启用单复数宽松匹配）
   */
  function gradeAnswer(q, userText) {
    var std = normalize(q && q.a);
    var user = normalize(userText);
    var result = { ok: false, normalized: String(userText || '').trim() };
    if (!std || !user) return result;

    if (user === std) { result.ok = true; return result; }

    /* 数值相等即对：把中文数字转阿拉伯后比 */
    var nu = cnToNumber(user);
    var ns = cnToNumber(std);
    if (nu !== null && ns !== null && nu === ns) { result.ok = true; return result; }
    /* 答案里含数字而孩子用中文数字回答（或反过来），提取数字比对 */
    var digitU = user.match(/\d+(\.\d+)?/);
    var digitS = std.match(/\d+(\.\d+)?/);
    if (digitU && digitS && digitU[0] === digitS[0] &&
        user.replace(/[\d.\s]/g, '') === std.replace(/[\d.\s]/g, '')) {
      result.ok = true; return result;
    }

    /* 英语题：忽略大小写(已做) + 单复数宽松匹配 */
    var isEn = q && (q.subj === 'english' || /^[a-z0-9 '\-]+$/i.test(std));
    if (isEn) {
      if (depluralize(user) === depluralize(std)) { result.ok = true; return result; }
      /* 逐词比较（容忍标点空格差异后），每词都做单复数宽松 */
      var uw = user.split(' ').filter(Boolean), sw = std.split(' ').filter(Boolean);
      if (uw.length === sw.length && uw.every(function (w, i) { return depluralize(w) === depluralize(sw[i]); })) {
        result.ok = true; return result;
      }
    }
    return result;
  }

  /* ---------- 背诗 ---------- */
  function randomPoemRecitation(lang) {
    var poems = (MT.banks && MT.banks.POEMS) || [];
    if (!poems.length) return lang === 'en' ? 'My bag of poems is empty today — I will read you one tomorrow!' : '老师的小书包忘带啦，明天再给你背一首好听的诗吧！';
    var p = poems[Math.floor(Math.random() * poems.length)];
    var lead = lang === 'en' ? 'Here is a Chinese poem for you: ' : '';
    return lead + '《' + p.title + '》 ' + p.author + '  ' + p.lines.join('');
  }

  /* ---------- 离线规则聊天 ---------- */
  function patHit(pat, lowered) {
    if (typeof pat !== 'string') return false;
    /* '/正则/flags' 形式按正则，其余按子串 */
    var m = pat.match(/^\/(.+)\/([a-z]*)$/);
    if (m) {
      try { return new RegExp(m[1], m[2]).test(lowered); } catch (e) { return false; }
    }
    return lowered.indexOf(pat.toLowerCase()) >= 0;
  }

  function mulPractice(lang) {
    var x = 2 + Math.floor(Math.random() * 8);
    var y = 2 + Math.floor(Math.random() * 8);
    if (lang === 'en') return 'Here is a times-table question: ' + x + ' × ' + y + ' = ? Say it out loud and count by ' + x + 's!';
    var CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var a = Math.min(x, y), b = Math.max(x, y);
    return '来一道乘法口诀：' + x + ' × ' + y + ' = ？ 提示：想「' + CN[a] + CN[b] + '……」的口诀，大声背出来试试！';
  }

  function offlineChat(userText, lang) {
    var isEn = lang === 'en';
    var lowered = String(userText || '').toLowerCase();
    var rules = (MT.cfg && (isEn ? MT.cfg.chatRulesEn : MT.cfg.chatRules)) || (MT.cfg && MT.cfg.chatRules) || [];
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var pats = rule.pats || [];
      var hit = false;
      for (var j = 0; j < pats.length; j++) {
        if (patHit(pats[j], lowered)) { hit = true; break; }
      }
      if (!hit) continue;
      var replies = rule.replies || [];
      if (!replies.length) break;
      var reply = replies[Math.floor(Math.random() * replies.length)];
      if (reply === '@poem') return randomPoemRecitation(isEn ? 'en' : 'zh');
      if (reply === '@mul') return mulPractice(isEn ? 'en' : 'zh');
      return reply;
    }
    var fb = (MT.cfg && (isEn ? MT.cfg.chatFallbackEn : MT.cfg.chatFallback)) || (MT.cfg && MT.cfg.chatFallback) || ['我们再练一道题吧！'];
    return fb[Math.floor(Math.random() * fb.length)];
  }

  /* ---------- 聊天历史（内部维护，供多轮上下文） ---------- */
  var history = []; /* [{role, content}] */
  function pushHistory(role, content) {
    history.push({ role: role, content: content });
    if (history.length > 60) history = history.slice(-60); /* 内部上限，发送时只取最近12条 */
  }

  /* ---------- 主入口 ---------- */
  async function chat(userText, aiAvailable, opts) {
    pushHistory('user', String(userText || ''));
    if (aiAvailable && typeof fetch === 'function' && !window.MT_OFFLINE_MODE) { /* MT-PAGES-01 静态版零 /api/llm 请求 */
      try {
        /* persona 按科目语言双版：非语文科目（lang:'en'）用英文老师，语文保持中文老师 */
        var isEn = !!(opts && opts.lang === 'en');
        var persona = isEn
          ? ((MT.cfg && MT.cfg.aiPersonaEn) || 'You are a kind Grade 2 English teacher. Always reply in English only. Use short, simple sentences.')
          : ((MT.cfg && MT.cfg.aiPersona) || '你是温柔的小学二年级老师。');
        var messages = [{ role: 'system', content: persona }];
        /* fresh: 一次性点评（写作/开放题）不带历史，避免前一轮中文对话把语种带偏 */
        messages = (opts && opts.fresh)
          ? messages.concat([{ role: 'user', content: String(userText || '') }])
          : messages.concat(history.slice(-12));
        /* 本地推理（DGX）可能耗时较长：95s 超时兜底，超时即回落离线规则 */
        var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 95000) : null;
        var resp;
        try {
          var payload = { messages: messages };
          if (opts && opts.max_tokens) payload.max_tokens = opts.max_tokens;   /* 写作/开放题给足输出预算 */
          resp = await fetch('/api/llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: ctrl ? ctrl.signal : undefined
          });
        } finally {
          if (timer) clearTimeout(timer);
        }
        if (resp && resp.ok) {
          var data = await resp.json();
          if (data && data.ok && typeof data.content === 'string' && data.content.trim()) {
            var text = data.content.trim();
            pushHistory('assistant', text);
            return { text: text, src: 'ai' };
          }
        }
      } catch (e) { /* 网络/解析异常 → 离线兜底 */ }
    }
    var offline = offlineChat(userText, opts && opts.lang);
    pushHistory('assistant', offline);
    return { text: offline, src: 'offline' };
  }

  MT.tutor = {
    chat: chat,
    resetHistory: function () { history = []; },
    gradeAnswer: gradeAnswer,
    randomPoemRecitation: randomPoemRecitation,
    /* 背诵匹配率：ref 标准句 / said 识别文本，按字符 LCS 占比返回 [0,1] */
    matchRate: function (ref, said) {
      var a = normalize(ref).replace(/\s+/g, '');
      var b = normalize(said).replace(/\s+/g, '');
      if (!a || !b) return 0;
      var m = a.length, n = b.length, i, j;
      var dp = [];
      for (i = 0; i <= m; i++) { dp[i] = []; for (j = 0; j <= n; j++) dp[i][j] = 0; }
      for (i = 1; i <= m; i++) {
        for (j = 1; j <= n; j++) {
          dp[i][j] = a.charAt(i - 1) === b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      return Math.min(1, dp[m][n] / m);
    },
    /* 暴露给冒烟测试 */
    _cnToNumber: cnToNumber,
    _normalize: normalize
  };
})();
