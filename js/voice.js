/* My Tutor · 语音封装：TTS（SpeechSynthesis）+ 语音识别（SpeechRecognition）
 * 全部做特性检测：不支持时 available() 返回 false，由 UI 降级；绝不让页面报错。 */
window.MT = window.MT || {};

(function () {
  var SAY_TIMEOUT_MS = 10000;  /* 朗读兜底超时，防卡死 */
  var LISTEN_TIMEOUT_MS = 9000;
  var SERVER_TTS_TIMEOUT_MS = 25000; /* MT-TTS-03 服务端合成＋下载的整体超时（慢网/长句） */
  var currentAudio = null;           /* MT-TTS-03 正在播的服务端音频 */

  function hasTTS() {
    return typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function';
  }
  function ASRCtor() {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  /* 按语言挑一个合适的人声：优先中文/英文原生音色 */
  var voiceCache = [];
  function refreshVoices() {
    if (!hasTTS()) { voiceCache = []; return; }
    try { voiceCache = window.speechSynthesis.getVoices() || []; } catch (e) { voiceCache = []; }
  }
  if (hasTTS()) {
    refreshVoices();
    try {
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = refreshVoices;
      }
    } catch (e) { }
  }
  /* MT-TTS-01（家长 11-08 令）：嗓音优先级表——常量可配，逐级回落。
   * T-E1（QA 红单）：Chrome speechSynthesis 会按系统语言本地化嗓音名——
   * `say -v` 英文名（Tingting (Enhanced)/Ava (Premium)）与 Chrome 实名
   * （婷婷（优化音质）/Ava（高音质））是同一支的两个名字，双名并列成别名数组兼容；
   * 第三组留 iPad Safari 实测名位（到实测再补，未命中的名字自然跳过不报错）。
   * 归因如实：首版只填 say 名导致优先级表在 Chrome 恒 miss，红单成立。 */
  var VOICE_PRIORITY = {
    zh: [
      ['婷婷（优化音质）', 'Tingting (Enhanced)'],
      ['婷婷', 'Tingting']
    ],
    en: [
      ['Ava（高音质）', 'Ava (Premium)'],
      ['Samantha']
    ]
  };
  function pickVoice(lang) {
    if (!voiceCache.length) refreshVoices();
    var prefix = (lang || 'zh-CN').slice(0, 2).toLowerCase();
    var want = VOICE_PRIORITY[prefix === 'zh' ? 'zh' : 'en'] || [];
    var v, i;
    /* 1) 优先级表命中（别名组内任一名字算中；lang 前缀校验防串语言）
     * T-E2：此层在 nameHit 正则之前，正则只作表未命中时的兜底，不再抢位 */
    for (var w = 0; w < want.length; w++) {
      var aliases = want[w];
      for (i = 0; i < voiceCache.length; i++) {
        v = voiceCache[i];
        if ((v.lang || '').toLowerCase().indexOf(prefix) !== 0) continue;
        for (var a = 0; a < aliases.length; a++) {
          if (v.name === aliases[a]) return v;
        }
      }
    }
    /* 2) 兜底：第一个语言前缀匹配＋名惯用词（真到不了婷婷/Samantha 时才启用） */
    var best = null;
    for (i = 0; i < voiceCache.length; i++) {
      v = voiceCache[i];
      var vl = (v.lang || '').toLowerCase();
      if (vl.indexOf(prefix) === 0) {
        best = v;
        /* 中文挑中文名音色，英文挑英文名音色，命中就停 */
        var nameHit = prefix === 'zh' ? /中文|Chinese|Ting|Mei|Xia|婷婷/i.test(v.name) : /English|Google|Samantha|Aaron|Karen|Daniel|Zira|Alex/i.test(v.name);
        if (nameHit) break;
      }
    }
    return best;
  }

  MT.voice = {
    /* MT-TTS-02（Chief 批）：家长区调试用——返回各语言当前会选中的嗓音名。
     * 仅家长区渲染调用，孩子界面不露出；iPad 现场实名即由家长截图获得。 */
    debugVoices: function () {
      var zhV = pickVoice('zh-CN'), enV = pickVoice('en-US');
      return { zh: zhV && zhV.name, en: enV && enV.name, total: voiceCache.length };
    },

    /* 能力检测 */
    available: function () {
      return { tts: hasTTS(), asr: !!ASRCtor() };
    },

    /**
     * 朗读。opts = {lang:'zh-CN'|'en-US', rate, onend, onerror}
     * 同一时刻只读一句：先 cancel 再 speak；10s 超时兜底触发 onend。
     */
    say: function (text, opts) {
      opts = opts || {};
      var done = false;
      function finish(err) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (err && opts.onerror) { try { opts.onerror(err); } catch (e) { } }
        if (opts.onend) { try { opts.onend(); } catch (e) { } }
      }
      if (typeof text !== 'string' || !text.trim()) { finish(); return; }
      var lang = opts.lang || 'zh-CN';
      var timer = setTimeout(function () { finish(); }, SERVER_TTS_TIMEOUT_MS);
      /* 先停上一句：服务端音频＋本地合成双通道 */
      if (currentAudio) { try { currentAudio.pause(); } catch (e) { } currentAudio = null; }
      if (hasTTS()) { try { window.speechSynthesis.cancel(); } catch (e) { } }
      /* MT-TTS-03（家长 11-08 令）：服务端 say 合成优先——Chrome/Safari/iPad 全端一致
       * 英文＝Ava 高音质、中文＝婷婷加强版（服务器 /tts 端点）；失败落回本地 speechSynthesis */
      function localSpeak() {
        if (!hasTTS()) { finish('unsupported'); return; }
        try {
          var u = new window.SpeechSynthesisUtterance(text);
          u.lang = lang;
          var v = pickVoice(lang);
          if (v) u.voice = v;
          u.rate = opts.rate || (lang.indexOf('zh') === 0 ? 1 : 0.85); /* 英语读慢一点 */
          u.pitch = 1.05;
          u.onend = function () { finish(); };
          u.onerror = function (e) { finish(e && e.error ? String(e.error) : 'error'); };
          window.speechSynthesis.speak(u);
        } catch (e) {
          finish('error');
        }
      }
      if (window.MT_OFFLINE_MODE) { localSpeak(); return; } /* MT-PAGES-01 静态版：零 /tts 请求，落回本地合成 */
      try {
        var url = '/tts?text=' + encodeURIComponent(text.slice(0, 600)) + '&lang=' + encodeURIComponent(lang);
        var a = new Audio(url);
        currentAudio = a;
        a.onended = function () { if (currentAudio === a) currentAudio = null; finish(); };
        a.onerror = function () { if (currentAudio === a) { currentAudio = null; localSpeak(); } };
        var pr = a.play();
        if (pr && pr.catch) pr.catch(function () { if (currentAudio === a) { currentAudio = null; localSpeak(); } });
      } catch (e) {
        localSpeak();
      }
    },

    /* 停止朗读（若有正在识别也一并停） */
    stop: function () {
      if (currentAudio) { try { currentAudio.pause(); } catch (e) { } currentAudio = null; }
      if (hasTTS()) { try { window.speechSynthesis.cancel(); } catch (e) { } }
      if (currentRec) { try { currentRec.stop(); } catch (e) { } currentRec = null; }
    },

    /**
     * 听写一句话。opts = {lang, onresult(finalText), onerror(msg), onend}
     * 不可用时回调 onerror('unsupported')。
     */
    listen: function (opts) {
      opts = opts || {};
      var Ctor = ASRCtor();
      if (!Ctor) { if (opts.onerror) opts.onerror('unsupported'); if (opts.onend) opts.onend(); return; }
      var finished = false;
      var rec = null;
      var timer = null;
      function finish(err, text) {
        if (finished) return;
        finished = true;
        if (timer) clearTimeout(timer);
        currentRec = null;
        if (err) { if (opts.onerror) { try { opts.onerror(err); } catch (e) { } } }
        if (opts.onend) { try { opts.onend(); } catch (e) { } }
        void text;
      }
      try {
        rec = new Ctor();
        currentRec = rec;
        rec.lang = opts.lang || 'zh-CN';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        var timer2 = setTimeout(function () { try { rec.stop(); } catch (e) { } }, LISTEN_TIMEOUT_MS);
        rec.onresult = function (ev) {
          var t = '';
          try {
            var res = ev.results && ev.results[0];
            if (res && res[0]) t = String(res[0].transcript || '');
          } catch (e) { }
          clearTimeout(timer2);
          if (opts.onresult) { try { opts.onresult(t.trim()); } catch (e) { } }
          finish();
        };
        rec.onerror = function (ev) {
          clearTimeout(timer2);
          finish((ev && ev.error) ? String(ev.error) : 'error');
        };
        rec.onend = function () {
          clearTimeout(timer2);
          finish();
        };
        timer = setTimeout(function () { finish('timeout'); }, LISTEN_TIMEOUT_MS + 2000);
        rec.start();
      } catch (e) {
        finish('error');
      }
    },

    /* 浏览器首次手势后可调用：预热 TTS 引擎、加载人声列表 */
    unlock: function () {
      if (!hasTTS()) return;
      try {
        refreshVoices();
        var u = new window.SpeechSynthesisUtterance(' ');
        u.volume = 0;
        u.rate = 2;
        window.speechSynthesis.speak(u);
      } catch (e) { }
    }
  };

  var currentRec = null; /* 同一时刻只允许一个识别会话 */
})();
