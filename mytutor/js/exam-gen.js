/* My Tutor · MT-EXAM-01 组卷引擎（一键出完整试卷）
 *
 * 定位：只读取 banks.js（MT.genQ）与 config.js（MT.cfg），不改写任何题库内容。
 * 蓝图（blueprint）逐节对齐 docs/content-brief-2026-midterm.md §1–§4 与
 * 《2026 G2 Semester1 Midterm Test Scope.pdf》原文题型段。
 *
 * 用法（浏览器）：script 标签挂在 banks.js 之后 → MT.exam.buildPaper('math', {seed})
 * 用法（node/QA）：vm 加载 banks.js+config.js+exam-gen.js 后取 MT.exam。
 *
 * 确定性：注入 mulberry32 PRNG，同 seed 出同卷（验收复算用）。
 * ⚠️ 不修改 Math.random 的全局持久状态：仅在 buildPaper 同步窗口内替换、结束即还原。
 */
(function (root) {
  var MT = (root.MT = root.MT || {});

  /* ---------------- 蓝图：每科每 Part 的 题型×题数×分值 ----------------
   * 数学：brief §1「试卷结构进 UI」Part I 计算(6)/Part II 概念选择(6)/Part III 应用题(3)
   *       ＋ Scope PDF「Part I Calculations / Part II Concepts (multiple choice) /
   *          Part III Problem Solving (word problems)」。分值 PDF 未列 → 自定推荐值，Chief 可改。
   * slots: [type, count]；每种题型的分值单列 points。
   */
  var BLUEPRINTS = {
    math: {
      title: 'Grade 2 · Semester 1 Midterm · Mathematics',
      durationMin: 60,
      parts: [
        { name: 'Part I. Calculations', note: 'Basic facts and vertical sentences.', points: 6, slots: [
          ['vertical_add', 2], ['vertical_sub', 2], ['calc120_add', 1], ['calc120_sub', 1]
        ]},
        { name: 'Part II. Concepts', note: 'Multiple choice.', points: 6, slots: [
          ['shape2d', 1], ['shape3d', 1], ['perimeter', 1], ['len_mixed', 1], ['strategy_comp', 1], ['cmp', 1]
        ]},
        { name: 'Part III. Problem Solving', note: 'Word problems. Show your work.', slots: [
          ['word120', 2, 9], ['word120', 1, 10]
        ]}
      ]
    },
    yuwen: {
      title: '二年级 · 第一学期期中 · 语文',
      durationMin: 60,
      /* Y-E1（QA r2 三子项）：slots 按 BRIEF §2 九大题型原序重建，每型 ≥1；
       * jinyi/liangci 按 BRIEF §2.9「近义词/量词留日常池」入黑名单不出期中卷 */
      parts: [
        { name: '一、字词基础', note: '看拼音写词 · 加偏旁 · 多音字 · 形近字', points: 4, slots: [
          ['py2han', 3], ['addradical', 2], ['duyin', 1], ['huanzi', 2]
        ]},
        { name: '二、句式与判断', note: '课文判断 · 照样子写句子 · 比喻', points: 5, slots: [
          ['panduan', 3], ['zhaoyang', 1], ['simile', 1], ['simile_open', 1, 10]
        ]},
        { name: '三、阅读', note: '课内 + 课外', points: 5, slots: [
          ['kewen_read', 2], ['kewai2', 2]
        ]},
        { name: '四、写话', note: '四步写出好句子', slots: [
          ['kanshuxiehua', 1, 13]
        ]}
      ]
    },
    english: {
      title: 'Grade 2 · Semester 1 Midterm · English',
      durationMin: 60,
      parts: [
        { name: 'Part I. Phonics & Spelling', note: '', points: 4, slots: [
          ['spell_rule', 4], ['vocab_match', 2]
        ]},
        { name: 'Part II. Vocabulary & Grammar', note: 'Multiple choice.', points: 5, slots: [
          ['vocab_def', 2], ['vocab_sent', 2], ['grammar', 4]
        ]},
        { name: 'Part III. Reading', note: 'Read and choose.', points: 5, slots: [
          ['reading_skill', 4]
        ]},
        { name: 'Part IV. Writing', note: 'Personal Narrative.', slots: [
          ['writing', 1, 16]
        ]}
      ]
    },
    science: {
      title: 'Grade 2 · Semester 1 Midterm · Science',
      durationMin: 40,
      parts: [
        { name: 'Part I. Scientific Skills', note: 'U1 Five Senses · Tools · Scientific Method.', points: 6, slots: [
          ['sci_observe', 4]
        ]},
        { name: 'Part II. Life Science', note: 'U3 Animals · U4 Plants (per Scope PDF Unit 3 listing).', points: 6, slots: [
          ['sci_animals', 4], ['sci_plants', 4]
        ]},
        { name: 'Part III. Applied Questions', note: 'Explain your thinking.', slots: [
          ['sci', 2, 9], ['sci', 1, 10]
        ]}
      ]
    }
  };
  MT.examBlueprints = BLUEPRINTS;

  /* 题干自带 "N." 小题号时剥离（修 "**13.** 2. How much…" 双编号）；
   * 同素材成组子题（isSubOfPrev，M-E2 成组闸放行）保留编号表达小题层级 */
  function stemText(q, keepNum) {
    var s = String(q);
    return keepNum ? s : s.replace(/^\s*\d+\.\s+/, '');
  }

  /* M-E3（QA R2）：vertical 型一律竖式排版（BRIEF §1.2 等宽换行＋横线）。
   * 题干已是竖式（含横线/换行）照排；单行算式（"59 + 52 ="）解析后重排为竖式——数字取自题干，不改内容 */
  var VERT_TYPES = { vertical_add: 1, vertical_sub: 1, vertical_orig: 1 };
  function verticalLayout(it) {
    var q = String(it.q);
    if (/─|＿{3,}|\n/.test(q)) return stemText(q, it.isSubOfPrev);   // 原题层已带竖式排版，忠实照排
    var m = q.match(/(\d+)\s*([+\u2212-])\s*(\d+)/);
    if (!m) return stemText(q, it.isSubOfPrev);
    var a = m[1], b = m[2], op = (b === '+' || b === '＋') ? '+' : '−';
    b = m[3];
    var w = Math.max(a.length, b.length) + 2;
    var pad = function (s) { return ('   ' + s).slice(-w); };
    return '  ' + pad(a) + '\n' + (op === '+' ? '+ ' : '− ') + pad(b) + '\n' + '─'.repeat(w + 1) + '\n= ?';
  }

  /* ---------------- 确定性 PRNG（mulberry32） ---------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* B4 语言闸（QA 清单 §0）：数/英/科卷面题干+选项命中 CJK 即弃题重抽——
   * banks 只读，脏题面在组卷侧绕行；语文卷不设闸。重抽超限 → 硬错报缺料，不静默出脏卷。 */
  var LANGGATE = { math: 1, english: 1, science: 1 };
  /* B4 补充（QA 清单 §1 预警2：国际部数学卷未考货币）：数学卷面禁货币情境，命中弃题重抽 */
  var CURRENCY_RE = /(yuan|dollar|money|cent|price|costs?\b|change|buy|shop|pay)/i;
  /* 白名单（app.js quizLang=en 同口径，QA 记忆 11-01 轮）：listen/en2cn/vocab_match
   * 题干选项合规地含中文，语言闸放行 */
  var WHITELIST = { english: { listen: 1, en2cn: 1, vocab_match: 1 } };
  function cjkHit(q) {
    if (!q) return false;
    var s = String(q.q || '');
    if (q.opts) q.opts.forEach(function (o) { s += ' ' + o; });
    return /[\u4e00-\u9fff]/.test(s);
  }

  /* 主观书写题（家长批改）：banks 原题层 grade:true 带参考答案，纸卷必须印批改提示（Chief 质询2，11-08） */
  var MANUAL_TYPES = { kanshuxiehua: 1, writing: 1, simile_open: 1 };
  function needManual(it) { return it.grade === false || !!MANUAL_TYPES[it.type]; }

  /* ---------------- 组卷 ---------------- */
  MT.examBuild = function (subj, opts) {
    opts = opts || {};
    var bp = BLUEPRINTS[subj];
    if (!bp) throw new Error('exam: no blueprint for ' + subj);
    if (!MT.genQ) throw new Error('exam: banks.js (MT.genQ) not loaded');
    var seed = (opts.seed == null) ? ((Date.now() % 1e9) | 0) : (opts.seed | 0);
    var level = opts.level || 2;
    var oldRandom = Math.random;
    Math.random = mulberry32(seed);
    var paper = { subj: subj, seed: seed, title: bp.title, durationMin: bp.durationMin, parts: [], total: 0, no: 0 };
    var seen = {}, usedMaterial = {};   // 卷级去重（题面 + 素材键）
    try {
      bp.parts.forEach(function (p, pi) {
        var part = { idx: pi + 1, name: p.name, note: p.note || '', items: [], score: 0 };
        p.slots.forEach(function (slot) {
          var type = slot[0], count = slot[1], pts = slot[2] != null ? slot[2] : p.points;
          if (pts == null) throw new Error('exam: points undefined for ' + subj + ' part ' + (pi + 1) + ' slot ' + type);
          // 去重集升级：seen/usedMaterial 提到卷级——原槽位级 seen 致同题跨槽重出（11-08 DEV 自查第 4 红）
          var guard = 0, rejected = 0;
          for (var i = 0; i < count; i++) {
            var q = null;
            while (guard++ < count * 30) {
              var cand = MT.genQ(subj, level, [type], { pool: 'midterm' });
              if (cand && cand.q && !seen[cand.q]) {
                if (cand.img && (cand.needsFigure || cand.q.trim().length < 15)) { rejected++; continue; }   // 20261108 Chief 热修：原卷扫描图含批改答案，图依赖题不入卷
                if (LANGGATE[subj] && !(WHITELIST[subj] && WHITELIST[subj][type]) && cjkHit(cand)) { rejected++; continue; }   // B4：脏题面弃之重抽
                if (subj === 'math' && CURRENCY_RE.test(cand.q)) { rejected++; continue; }   // 预警2：数学卷禁货币
                var matKey = cand.img || (cand.src ? String(cand.src).replace(/\s+\S*$/, '') : null);
                if (matKey && usedMaterial[matKey]) { rejected++; continue; }   // 同素材卷级防重/防散
                // M-E2（QA R2）：跨页孤题闸——"N." 编号子题依赖同素材前题（如 011.jpg B-E-2），
                // 上一条目非同素材则弃之重抽，杜绝 Q13 对着 Q14 数据作答
                if (/^\s*\d+\.\s/.test(cand.q)) {
                  var prev = part.items[part.items.length - 1];
                  var prevMat = prev && (prev.img || (prev.src ? String(prev.src).replace(/\s+\S*$/, '') : null));
                  if (!(matKey && matKey === prevMat)) { rejected++; continue; }
                  cand.__subOfPrev = 1;   // 同素材成组子题：渲染保留 "N." 编号表达小题层级
                }
                seen[cand.q] = 1; if (matKey) usedMaterial[matKey] = 1;
                q = cand; break;
              }
            }
            if (!q) {
              if (rejected && LANGGATE[subj] && !q) throw new Error('exam: B4 language gate starved for ' + subj + '/' + type + '（该型题池全含中文，需 Researcher 补英文槽位或换型）');
              q = MT.genQ(subj, level, [type], { pool: 'midterm' });   // 非语言闸枯竭兜底
              if (q && q.img && (q.needsFigure || (q.q || '').trim().length < 15)) q = MT.genQ(subj, level, [type], { pool: 'midterm' });   // 兜底同样拦图依赖题
              if (q && q.img && (q.needsFigure || (q.q || '').trim().length < 15)) q = null;
              if (q) q.poolExhausted = true;
            }
            if (!q) throw new Error('exam: genQ returned nothing for ' + subj + '/' + type);
            paper.no += 1;
            part.items.push({
              no: paper.no, type: type, points: pts,
              q: q.q, opts: q.opts || null, a: q.a == null ? null : String(q.a),
              explain: q.explain || '', grade: q.grade === false ? false : true,
              img: q.img || null, src: q.src || null, isSubOfPrev: !!q.__subOfPrev,
              poolExhausted: !!q.poolExhausted
            });
            part.score += pts;
          }
        });
        paper.total += part.score;
        paper.parts.push(part);
      });
    } finally {
      Math.random = oldRandom;   // 同步窗口内替换，异常路径也必须还原
    }
    return paper;
  };

  /* 选项已有 A./A) 前缀时不再叠加（修 shape 类题 "A) A." 双编号渲染缺陷） */
  function optLabel(o, i) {
    var s = String(o);
    if (/^[A-E][.)]/.test(s.trim())) return s.trim();
    return String.fromCharCode(65 + i) + ') ' + s;
  }

  /* ---------------- 渲染：学生卷 / 答案卷（Markdown） ----------------
   * opts.hidePoints=true → 学生卷不显示任何分值/总分（语文卷口径：家长 11-08 定"不要带分值"；
   * 答案卷始终带分值供家长批改）。
   */
  MT.examRender = function (paper, withAnswers, opts) {
    opts = opts || {};
    var hide = !!opts.hidePoints;
    var L = [];
    L.push('# ' + paper.title);
    L.push('');
    L.push((withAnswers ? 'Answer Key · ' : '') + 'Seed `' + paper.seed + '`' +
      (hide ? '' : ' · Total **' + paper.total + ' pts**') + ' · ' + paper.durationMin + ' min');
    L.push('');
    paper.parts.forEach(function (p) {
      L.push('## ' + p.name + ' *(' + p.note + (hide ? '' : ' — ' + p.score + ' pts') + ')*');
      L.push('');
      p.items.forEach(function (it) {
        var manual = needManual(it);
        var zh = paper.subj === 'yuwen';   // M-E1（QA R2）：家长批改类提示词分科——数/英/科禁中文（Chief Q2 全英裁定）
        var vert = VERT_TYPES[it.type] || /vertical sentence|Column (addition|subtraction)/i.test(it.q);
        var qtext = (vert ? verticalLayout(it) : stemText(it.q, it.isSubOfPrev)).replace(/\n/g, '  \n');
        L.push('**' + it.no + '.** ' + qtext + (hide ? '' : '  `' + it.points + 'pt`') + (manual ? (zh ? ' *(开放作答 · 家长批改)*' : ' *(open response · graded by parent)*') : ''));
        if (it.opts && it.opts.length) L.push(it.opts.map(function (o, i) { return optLabel(o, i); }).join('　'));
        if (manual) L.push(zh ? '_（开放作答，家长按卷面批改）_' : '_(Write your answer here. A parent will grade this one.)_');
        if (withAnswers) L.push('> ✍ Answer: **' + (it.a == null ? '—' : it.a) + '**' + (it.explain ? ' · ' + String(it.explain).replace(/\n/g, ' ') : ''));
        L.push('');
      });
    });
    return L.join('\n');
  };

  /* ---------------- 渲染：A4 打印 HTML（MT-EXAM-01-A 物理卷） ----------------
   * 单文件、内嵌样式、@page A4；竖式题 <pre> 保排版；学生版可 hidePoints。
   */
  MT.examRenderHTML = function (paper, withAnswers, opts) {
    opts = opts || {};
    var hide = !!opts.hidePoints;
    var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var isVertical = /vertical sentence|Column (addition|subtraction)/i;
    var H = ['<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(paper.title) + '</title><style>',
      '@page{size:A4;margin:18mm 16mm}',
      'body{font-family:"Helvetica Neue",Arial,"PingFang SC","Songti SC",sans-serif;font-size:12pt;line-height:1.55;color:#111;max-width:180mm;margin:0 auto}',
      'h1{font-size:17pt;text-align:center;margin:0 0 2mm}',
      '.meta{text-align:center;color:#444;font-size:10pt;margin-bottom:5mm;border-bottom:1px solid #999;padding-bottom:2mm}',
      '.name{margin:4mm 0 6mm;font-size:11pt}',
      'h2{font-size:12.5pt;margin:6mm 0 2mm;border-left:4px solid #333;padding-left:3mm}',
      '.q{margin:3.5mm 0;padding:2mm 0;border-bottom:1px dotted #ccc;page-break-inside:avoid}',
      '.q .stem{white-space:pre-wrap}',
      '.q pre{font-family:ui-monospace,Menlo,monospace;font-size:12pt;margin:1mm 0;line-height:1.3}',
      '.opts{margin:1mm 0 0 6mm;display:flex;flex-wrap:wrap;gap:1mm 8mm}',
      '.pts{color:#666;font-size:9.5pt;margin-left:2mm}',
      '.ans{color:#0a5608;font-size:10.5pt;margin-top:1mm}',
      '.answersonly{}@media print{.answersonly{}}@media screen{}',
      '.fill{display:inline-block;min-width:22mm;border-bottom:1px solid #333;margin:0 1mm}',
      '</style></head><body>',
      '<h1>' + esc(paper.title) + '</h1>',
      '<div class="meta">' + (withAnswers ? 'Answer Key · ' : '') + 'Seed ' + paper.seed +
        (hide ? '' : ' · Total ' + paper.total + ' pts') + ' · ' + paper.durationMin + ' min' +
        (withAnswers ? '' : '<div class="name">Name ______________　Date ______________　Score ________</div>') + '</div>'];
    paper.parts.forEach(function (p) {
      H.push('<h2>' + esc(p.name) + (p.note ? ' <span style="font-weight:normal;font-size:10pt;color:#555">（' + esc(p.note) + (hide ? '' : ' · ' + p.score + ' pts') + '）</span>' : (hide ? '' : ' — ' + p.score + ' pts')) + '</h2>');
      p.items.forEach(function (it) {
        var manual = needManual(it);
        var zh = paper.subj === 'yuwen';
        var vert = isVertical.test(it.q) || VERT_TYPES[it.type];
        var stem = vert ? verticalLayout(it) : stemText(it.q, it.isSubOfPrev);
        H.push('<div class="q"><div><b>' + it.no + '.</b> ' +
          (vert ? '<pre>' + esc(stem) + '</pre>' : '<span class="stem">' + esc(stemText(it.q, it.isSubOfPrev)) + '</span>') +
          (hide || manual ? '' : '<span class="pts">' + it.points + ' pt</span>') +
          (manual ? '<span class="pts">' + (zh ? '（开放作答·家长批改）' : '(Open response · graded by parent)') + '</span>' : '') + '</div>');
        if (it.opts && it.opts.length) H.push('<div class="opts">' + it.opts.map(function (o, i) { return '<span>' + esc(optLabel(o, i)) + '</span>'; }).join('') + '</div>');
        else if (!manual && !vert && !/Choose|Which|What does/i.test(it.q)) H.push('<div style="margin:2mm 0 0 6mm">' + (zh ? 'Answer：' : 'Answer: ') + '<span class="fill"></span></div>');
        if (manual) H.push('<div style="margin:1.5mm 0 0 6mm">' + (zh ? '我的回答：' : 'My answer: ') + '<span class="fill" style="min-width:120mm">&nbsp;</span><span class="fill" style="min-width:120mm">&nbsp;</span></div>');
        if (withAnswers) H.push('<div class="ans">✍ ' + esc(it.a == null ? '—' : it.a) + (it.explain ? '　<span style="color:#666">' + esc(String(it.explain).replace(/\n/g, ' ')) + '</span>' : '') + '</div>');
        H.push('</div>');
      });
    });
    H.push('</body></html>');
    return H.join('');
  };
})(typeof window !== 'undefined' ? window : global);
