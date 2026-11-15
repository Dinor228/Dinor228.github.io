/* My Tutor · 题库与出题引擎
 *
 * ⚠️ 维护约定（数据与逻辑彻底分离）：
 *   - 【数据区】MT.banks.* 全部是纯数据。以后要换教材进度/词表/古诗单，
 *     只替换数据区内容即可，下面的出题逻辑一行都不用动。
 *   - 【逻辑区】MT.genQ(subject, level, types) 只读取数据区与 MT.cfg，
 *     不硬编码任何词表内容。
 *   - 数学题为纯程序随机生成（level 1-3 控制难度），不依赖数据区。
 */
window.MT = window.MT || {};

/* ================================================================
 * ██ 数据区（可整体替换，不影响逻辑） ██
 * ================================================================ */
MT.banks = {

  /* 拼音：word 词语 / py 正确拼音 / right 正确选项文案 / wrong 常见混淆干扰项
   *（平翘舌、前后鼻音、近形拼音等），每条 wrong 数量 ≥3 */
  PY_WORDS: [
    { word: '山',   py: 'shān',   right: 'shān',  wrong: ['sān', 'shāng', 'sāng'] },
    { word: '四',   py: 'sì',     right: 'sì',    wrong: ['shì', 'sī', 'shí'] },
    { word: '三',   py: 'sān',    right: 'sān',   wrong: ['shān', 'sāng', 'shāng'] },
    { word: '十',   py: 'shí',    right: 'shí',   wrong: ['sí', 'shī', 'sì'] },
    { word: '是',   py: 'shì',    right: 'shì',   wrong: ['sì', 'shǐ', 'shī'] },
    { word: '人',   py: 'rén',    right: 'rén',   wrong: ['léng', 'lén', 'rèng'] },
    { word: '奶',   py: 'nǎi',    right: 'nǎi',   wrong: ['lǎi', 'nài', 'lài'] },
    { word: '朋',   py: 'péng',   right: 'péng',  wrong: ['pén', 'bén', 'pěng'] },
    { word: '生',   py: 'shēng',  right: 'shēng', wrong: ['sēn', 'shēn', 'sēng'] },
    { word: '星',   py: 'xīng',   right: 'xīng',  wrong: ['xīn', 'xìn', 'qīng'] },
    { word: '云',   py: 'yún',    right: 'yún',   wrong: ['yüán', 'yūn', 'yíng'] },
    { word: '花',   py: 'huā',    right: 'huā',   wrong: ['fā', 'huà', 'huān'] },
    { word: '风',   py: 'fēng',   right: 'fēng',  wrong: ['fēn', 'wēng', 'fòng'] },
    { word: '龙',   py: 'lóng',   right: 'lóng',  wrong: ['nóng', 'lōng', 'néng'] },
    { word: '李',   py: 'lǐ',     right: 'lǐ',    wrong: ['nǐ', 'lí', 'lì'] },
    { word: '成',   py: 'chéng',  right: 'chéng', wrong: ['cén', 'chén', 'cóng'] }
  ],

  /* 组词：base 原字 / hint 组字方式提示 / new 变出的新字 / word 组词 / wrong 干扰字 */
  ZUCI: [
    { base: '木',  hint: '加一加：木＋木', new: '林', word: '树林', wrong: ['森', '本', '才'] },
    { base: '日',  hint: '加一加：日＋月', new: '明', word: '明天', wrong: ['目', '白', '早'] },
    { base: '口',  hint: '加一加：口＋玉', new: '国', word: '国家', wrong: ['回', '园', '田'] },
    { base: '人',  hint: '加一加：人＋人', new: '从', word: '从来', wrong: ['众', '大', '个'] },
    { base: '火',  hint: '加一加：火＋火', new: '炎', word: '炎热', wrong: ['灭', '灰', '灯'] },
    { base: '王',  hint: '加一加：王＋求', new: '球', word: '足球', wrong: ['玩', '理', '珠'] },
    { base: '讠',  hint: '换偏旁：请 → 日＋青', new: '晴', word: '晴天', wrong: ['清', '情', '睛'] },
    { base: '讠',  hint: '换偏旁：请 → 目＋青', new: '睛', word: '眼睛', wrong: ['清', '晴', '情'] },
    { base: '冫',  hint: '换偏旁：冷 → 门＋令', new: '领', word: '带领', wrong: ['邻', '岭', '铃'] },
    { base: '女',  hint: '加一加：女＋子', new: '好', word: '美好', wrong: ['妈', '奶', '她'] },
    { base: '禾',  hint: '加一加：禾＋火', new: '秋', word: '秋天', wrong: ['和', '种', '科'] },
    { base: '门',  hint: '加一加：门＋人', new: '闪', word: '闪电', wrong: ['问', '间', '闷'] }
  ],

  /* 近反义词：kind 'syn'近义 / 'ant'反义 */
  JINYI: [
    { word: '高兴', kind: 'syn', right: '开心', wrong: ['难过', '生气', '害怕'] },
    { word: '美丽', kind: 'syn', right: '漂亮', wrong: ['丑陋', '笨拙', '安静'] },
    { word: '著名', kind: 'syn', right: '有名', wrong: ['陌生', '无名', '普通'] },
    { word: '许多', kind: 'syn', right: '很多', wrong: ['少量', '个别', '孤单'] },
    { word: '快活', kind: 'syn', right: '快乐', wrong: ['伤心', '急忙', '辛苦'] },
    { word: '大',   kind: 'ant', right: '小',   wrong: ['多', '高', '长'] },
    { word: '多',   kind: 'ant', right: '少',   wrong: ['大', '满', '空'] },
    { word: '高',   kind: 'ant', right: '矮',   wrong: ['低', '长', '胖'] },
    { word: '上升', kind: 'ant', right: '降落', wrong: ['前进', '飘浮', '加快'] },
    { word: '白天', kind: 'ant', right: '黑夜', wrong: ['黄昏', '清晨', '太阳'] },
    { word: '仔细', kind: 'ant', right: '马虎', wrong: ['认真', '小心', '快速'] },
    { word: '勤劳', kind: 'ant', right: '懒惰', wrong: ['辛苦', '能干', '安静'] }
  ],

  /* 量词：m 正确量词 / obj 名词 / wrong 干扰量词 */
  LIANGCI: [
    { m: '只', obj: '小鸟', wrong: ['条', '棵', '朵'] },
    { m: '棵', obj: '大树', wrong: ['株', '朵', '把'] },
    { m: '朵', obj: '鲜花', wrong: ['只', '张', '片'] },
    { m: '条', obj: '小鱼', wrong: ['只', '头', '匹'] },
    { m: '本', obj: '书本', wrong: ['支', '张', '把'] },
    { m: '支', obj: '铅笔', wrong: ['本', '只', '辆'] },
    { m: '把', obj: '雨伞', wrong: ['张', '只', '件'] },
    { m: '辆', obj: '汽车', wrong: ['架', '只', '艘'] },
    { m: '架', obj: '飞机', wrong: ['辆', '艘', '张'] },
    { m: '艘', obj: '轮船', wrong: ['架', '辆', '只'] },
    { m: '头', obj: '黄牛', wrong: ['只', '匹', '条'] },
    { m: '匹', obj: '小马', wrong: ['头', '只', '张'] },
    { m: '张', obj: '白纸', wrong: ['本', '条', '把'] },
    { m: '片', obj: '草地', wrong: ['张', '双', '棵'] }
  ],

  /* 古诗：部编版二年级必背（示例节选，后续按教材进度整体替换） */
  POEMS: [
    { title: '登鹳雀楼', author: '王之涣', lines: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'] },
    { title: '望庐山瀑布', author: '李白', lines: ['日照香炉生紫烟，', '遥看瀑布挂前川。', '飞流直下三千尺，', '疑是银河落九天。'] },
    { title: '静夜思', author: '李白', lines: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'] },
    { title: '悯农（其二）', author: '李绅', lines: ['锄禾日当午，', '汗滴禾下土。', '谁知盘中餐，', '粒粒皆辛苦。'] },
    { title: '咏鹅', author: '骆宾王', lines: ['鹅，鹅，鹅，', '曲项向天歌。', '白毛浮绿水，', '红掌拨清波。'] },
    { title: '春晓', author: '孟浩然', lines: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'] },
    { title: '村居', author: '高鼎', lines: ['草长莺飞二月天，', '拂堤杨柳醉春烟。', '儿童散学归来早，', '忙趁东风放纸鸢。'] },
    { title: '咏柳', author: '贺知章', lines: ['碧玉妆成一树高，', '万条垂下绿丝绦。', '不知细叶谁裁出，', '二月春风似剪刀。'] },
    { title: '赋得古原草送别（节选）', author: '白居易', lines: ['离离原上草，', '一岁一枯荣。', '野火烧不尽，', '春风吹又生。'] },
    { title: '敕勒歌', author: '北朝民歌', lines: ['敕勒川，阴山下。', '天似穹庐，笼盖四野。', '天苍苍，野茫茫，', '风吹草低见牛羊。'] },
    { title: '江雪', author: '柳宗元', lines: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'] },
    { title: '小池', author: '杨万里', lines: ['泉眼无声惜细流，', '树阴照水爱晴柔。', '小荷才露尖尖角，', '早有蜻蜓立上头。'] }
  ],

  /* 英语单词：cat 等主题由数据内容自然归类（动物/食物/颜色/家人/问候） */
  EN_WORDS: [
    { en: 'cat',     zh: '猫',     emoji: '🐱' },
    { en: 'dog',     zh: '狗',     emoji: '🐶' },
    { en: 'bird',    zh: '鸟',     emoji: '🐦' },
    { en: 'fish',    zh: '鱼',     emoji: '🐟' },
    { en: 'monkey',  zh: '猴子',   emoji: '🐒' },
    { en: 'panda',   zh: '熊猫',   emoji: '🐼' },
    { en: 'tiger',   zh: '老虎',   emoji: '🐯' },
    { en: 'rabbit',  zh: '兔子',   emoji: '🐰' },
    { en: 'apple',   zh: '苹果',   emoji: '🍎' },
    { en: 'banana',  zh: '香蕉',   emoji: '🍌' },
    { en: 'rice',    zh: '米饭',   emoji: '🍚' },
    { en: 'noodles', zh: '面条',   emoji: '🍜' },
    { en: 'milk',    zh: '牛奶',   emoji: '🥛' },
    { en: 'egg',     zh: '鸡蛋',   emoji: '🥚' },
    { en: 'cake',    zh: '蛋糕',   emoji: '🎂' },
    { en: 'water',   zh: '水',     emoji: '💧' },
    { en: 'red',     zh: '红色',   emoji: '🔴' },
    { en: 'yellow',  zh: '黄色',   emoji: '🟡' },
    { en: 'blue',    zh: '蓝色',   emoji: '🔵' },
    { en: 'green',   zh: '绿色',   emoji: '🟢' },
    { en: 'father',  zh: '爸爸',   emoji: '👨' },
    { en: 'mother',  zh: '妈妈',   emoji: '👩' },
    { en: 'brother', zh: '兄弟',   emoji: '👦' },
    { en: 'sister',  zh: '姐妹',   emoji: '👧' },
    { en: 'book',    zh: '书',     emoji: '📕' },
    { en: 'pencil',  zh: '铅笔',   emoji: '✏️' },
    { en: 'school',  zh: '学校',   emoji: '🏫' },
    { en: 'hand',    zh: '手',     emoji: '✋' },
    { en: 'one',     zh: '一',     emoji: '1️⃣' },
    { en: 'five',    zh: '五',     emoji: '5️⃣' },
    { en: 'ten',     zh: '十',     emoji: '🔟' }
  ],

  /* 情境选句：zh 情景中文描述 / right 正确英文回应 / wrong 干扰回应 */
  EN_PHRASES: [
    /* MT-EN-ZH-02 (Chief 接管改): 每条加 en 英文场景语，en 模式题干用 en，zh 留作中文模式 */
    { zh: '早上见到老师，你会说：',           en: 'You meet your teacher in the morning. What do you say?', right: 'Good morning!',            wrong: ['Good night!', 'Bye-bye!', 'Sorry!'] },
    { zh: '别人问你 How are you? 你回答：',   en: 'Someone asks you "How are you?" What do you say?',       right: "I'm fine, thank you!",     wrong: ["I'm seven.", 'Goodbye!', "It's red."] },
    { zh: '想知道对方叫什么，你问：',         en: 'You want to know someone\'s name. What do you ask?',     right: "What's your name?",        wrong: ['How old are you?', 'Where are you?', 'How are you?'] },
    { zh: '分别时你说：',                     en: 'It is time to leave. What do you say?',                  right: 'Goodbye! See you!',        wrong: ['Good morning!', 'Thank you!', 'You are welcome!'] },
    { zh: '别人帮助你，你说：',               en: 'Someone helps you. What do you say?',                    right: 'Thank you!',               wrong: ['Sorry!', 'Excuse me!', 'No, thanks.'] },
    { zh: '你不小心碰到别人，说：',           en: 'You bump into someone. What do you say?',                right: 'Sorry!',                   wrong: ['Great!', 'Thank you!', 'Hello!'] },
    { zh: '想介绍自己，你说：',               en: 'You want to introduce yourself. What do you say?',       right: 'My name is Ann.',          wrong: ['Your name is Ann.', 'I am fine.', 'See you!'] },
    { zh: '别人说 Thank you! 你回答：',       en: 'Someone says "Thank you!" What do you say?',             right: "You're welcome!",          wrong: ['Sorry!', 'Good night!', 'Me too!'] },
    { zh: '老师问你 What colour is it?（是蓝色）你答：', en: 'Your teacher asks "What colour is it?" It is blue. What do you say?', right: "It's blue.",   wrong: ["It's a dog.", 'I am blue.', 'Blue you?'] },
    { zh: '想表达喜欢熊猫，你说：',           en: 'You want to say that you like pandas. What do you say?', right: 'I like pandas.',           wrong: ['I hate pandas.', 'You like pandas.', 'Panda is me!'] }
  ],

  /* 句子完形填空：s 句子（__ 为空位）/ right 填空词 / wrong 干扰词 / zh 中文提示 */
  EN_CLOZE: [
    { s: 'I ___ an apple.',            right: 'eat',   wrong: ['sleep', 'jump', 'swim'],   zh: '我吃一个苹果。' },
    { s: 'The cat is ___ the box.',    right: 'in',    wrong: ['eat', 'run', 'red'],       zh: '猫在盒子里。' },
    { s: 'I like ___ and eggs.',       right: 'milk',  wrong: ['blue', 'sister', 'book'],  zh: '我喜欢牛奶和鸡蛋。' },
    { s: '___ morning, teacher!',      right: 'Good',  wrong: ['See', 'Who', 'Where'],     zh: '老师早上好！' },
    { s: 'How ___ you?',               right: 'are',   wrong: ['is', 'am', 'do'],          zh: '你好吗？' },
    { s: 'This is my ___.',            right: 'family',wrong: ['color', 'number', 'school'],zh: '这是我的家人。' },
    { s: 'The apple is ___.',          right: 'red',   wrong: ['jump', 'read', 'play'],    zh: '苹果是红色的。' },
    { s: 'I ___ a big dog.',           right: 'have',  wrong: ['are', 'is', 'am'],         zh: '我有一只大狗。' },
    { s: '___ you like some rice?',    right: 'Would', wrong: ['Who', 'What', 'Where'],    zh: '你想要些米饭吗？' },
    { s: 'She is my ___.',             right: 'sister',wrong: ['banana', 'green', 'desk'], zh: '她是我的姐姐。' }
  ],

  /* ============================================================
   * ↓↓↓ 2026 期中内容包（依据 docs/content-brief-2026-midterm.md）↓↓↓
   * 内容可回溯简报；存疑:true 的条目待 Researcher/QA 复核后才进正式题库。
   * ============================================================ */

  /* 英语 Vocabulary 16（简报 §3 考纲原表）：en/zh/例句 */
  EN_VOCAB:   [
    {
      "en": "munch",
      "pos": "v.",
      "zh": "大口咀嚼",
      "en_def": "to chew loudly",
      "sent": "I munch an apple every day.",
      "sentZh": "我每天大口嚼一个苹果。",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "en": "bellow",
      "pos": "v.",
      "zh": "大声吼叫",
      "en_def": "to shout in a loud, deep voice",
      "sent": "The lion bellowed in the cage.",
      "sentZh": "狮子在笼子里大声吼叫。",
      "src": "〔原题·HWB p.13〕",
      "weak": true
    },
    {
      "en": "bounce",
      "pos": "v.",
      "zh": "弹跳（落地后上下弹动）",
      "en_def": "to move up and down after hitting something",
      "sent": "When the ball hit the floor, it began to bounce up and down.",
      "sentZh": "球砸到地上，开始弹上弹下。",
      "src": "〔原题·HWB p.13 / 复习卷图3〕"
    },
    {
      "en": "cool",
      "pos": "v. / adj.",
      "zh": "冷静下来（v.）／凉爽的（adj.）",
      "en_def": "to calm down",
      "sent": "Take a deep breath and cool down before you speak.",
      "sentZh": "说话前深呼吸，冷静下来。",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "en": "grin",
      "pos": "v.",
      "zh": "咧嘴笑",
      "en_def": "to smile widely",
      "sent": "Tom grinned when he saw his friend walking toward him.",
      "sentZh": "Tom 看见朋友走过来，咧嘴笑了。",
      "src": "〔原题·HWB p.13 / 复习卷图3〕"
    },
    {
      "en": "handle",
      "pos": "v. / n.",
      "zh": "处理、应对（v.）／把手（n.）",
      "en_def": "able to deal with something",
      "sent": "She was upset, but she was able to handle her feelings and calm down.",
      "sentZh": "她很难过，但能处理好自己的情绪，冷静下来。",
      "src": "〔原题·HWB p.13 / 复习卷图3〕",
      "weak": true
    },
    {
      "en": "might",
      "pos": "n. / modal",
      "zh": "力气（n.）／可能（情态动词）",
      "en_def": "power",
      "sent": "He pushed the door with all his might.",
      "sentZh": "他用尽全身力气推门。",
      "src": "〔原题·HWB p.13 / 复习卷图3〕",
      "weak": true
    },
    {
      "en": "rough",
      "pos": "adj.",
      "zh": "粗暴的、不温柔的；粗糙的",
      "en_def": "not gentle",
      "sent": "The road to the farm is rough.",
      "sentZh": "去农场的路坑坑洼洼很粗糙。",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "en": "planned",
      "pos": "v. / adj.",
      "zh": "计划（过去式）；预先安排好的",
      "en_def": "Decided or arranged in advance; organized carefully.",
      "sent": "We planned a trip to the zoo.",
      "sentZh": "我们计划了一次动物园之行。",
      "src": "〔原题·HWB p.21〕"
    },
    {
      "en": "perfect",
      "pos": "adj. / v.",
      "zh": "完美的",
      "en_def": "Without any mistakes; exactly right or complete.",
      "sent": "This drawing looks perfect! You did such a great job!",
      "sentZh": "这幅画看起来棒极了！",
      "src": "〔原题·HWB p.21 / 复习卷图3〕"
    },
    {
      "en": "hamper",
      "pos": "n.",
      "zh": "洗衣篮（本单元只考名词义）",
      "en_def": "A basket for holding items.",
      "sent": "Mum said I could help her carry the clothes to the hamper.",
      "sentZh": "妈妈说我可以帮她把衣服拿去洗衣篮。",
      "src": "〔原题·HWB p.21 / 复习卷图3〕",
      "weak": true
    },
    {
      "en": "disaster",
      "pos": "n.",
      "zh": "灾难",
      "en_def": "A sudden event that causes great damage or problems.",
      "sent": "Losing the game was a disaster.",
      "sentZh": "输了比赛简直是一场灾难。",
      "src": "〔原题·HWB p.21〕"
    },
    {
      "en": "scowl",
      "pos": "v. / n.",
      "zh": "皱眉（动词/名词）",
      "en_def": "To frown in an angry or bad-tempered way; a facial expression showing anger.",
      "sent": "The teacher had a scowl on her face when the class got too noisy.",
      "sentZh": "班级太吵时，老师脸上露出了皱眉的表情。",
      "src": "〔原题·HWB p.21 / 复习卷图3〕",
      "weak": true
    },
    {
      "en": "mood",
      "pos": "n.",
      "zh": "心情",
      "en_def": "A temporary state of mind or feeling.",
      "sent": "I was in a great mood after playing outside in the sunshine.",
      "sentZh": "在外面晒太阳玩过之后，我心情特别好。",
      "src": "〔原题·HWB p.21 / 复习卷图3〕"
    },
    {
      "en": "queasy",
      "pos": "adj.",
      "zh": "恶心想吐、心里发慌",
      "en_def": "Feeling sick, uncomfortable, or uneasy.",
      "sent": "After spinning around too many times, I started to feel queasy.",
      "sentZh": "转太多圈之后，我开始头晕想吐。",
      "src": "〔原题·HWB p.21 / 复习卷图3〕"
    },
    {
      "en": "fiddled",
      "pos": "v.",
      "zh": "摆弄、瞎折腾",
      "en_def": "To touch, move, or play with something in a nervous way.",
      "sent": "While waiting for his turn, Jack fiddled with his pencil.",
      "sentZh": "等轮到他时，Jack 手里摆弄着铅笔。",
      "src": "〔原题·HWB p.21 / 复习卷图3〕"
    }
  ],

  /* 拼读规则（简报 §3 Phonics & Spelling） */
  SPELL_RULES: {
    digraph: {
      sh: ['ship', 'fish', 'she', 'shop', 'shoe'],
      ch: ['chair', 'cheese', 'child', 'chick', 'rich'],
      th: ['three', 'think', 'mouth', 'bath', 'this'],
      ck: ['duck', 'sock', 'clock', 'back', 'neck']
    },
    /* 规则不混入 th 的 broom 等特例之外的词即可 */
    blanks: [
      { w: 'fish',   blank: 'fi_h',   a: 'sh' },
      { w: 'duck',   blank: 'du_k',   a: 'ck' },
      { w: 'ship',   blank: '_ip',    a: 'sh' },
      { w: 'chair',  blank: '_air',   a: 'ch' },
      { w: 'three',  blank: '_ree',   a: 'th' },
      { w: 'clock',  blank: 'clo_k',  a: 'ck' },
      { w: 'shoe',   blank: '_oe',    a: 'sh' },
      { w: 'cheese', blank: '_eese',  a: 'ch' }
    ],
    endings: {
      es: [{ base: 'go', right: 'goes' }, { base: 'do', right: 'does' }, { base: 'watch', right: 'watches' }, { base: 'bus', right: 'buses' }, { base: 'box', right: 'boxes' }],
      ing: [{ base: 'run', right: 'running' }, { base: 'swim', right: 'swimming' }, { base: 'sit', right: 'sitting' }, { base: 'play', right: 'playing' }, { base: 'make', right: 'making' }],
      ed: [{ base: 'play', right: 'played' }, { base: 'walk', right: 'walked' }, { base: 'jump', right: 'jumped' }, { base: 'plan', right: 'planned' }, { base: 'munch', right: 'munched' }]
    },
    rcontrolled: {
      ar: ['car', 'star', 'farm', 'park'],
      or: ['fork', 'horn', 'short', 'sport'],
      er: ['teacher', 'sister', 'brother', 'tiger']
    },
    /* 音节类型（closed 辅音结尾短音 / open 元音结尾读字母名） */
    syllables: [
      { w: 'robot',  parts: ['ro', 'bot'], ask: 0, a: 'open' },
      { w: 'robot',  parts: ['ro', 'bot'], ask: 1, a: 'closed' },
      { w: 'tiger',  parts: ['ti', 'ger'], ask: 0, a: 'open' },
      { w: 'panda',  parts: ['pan', 'da'], ask: 0, a: 'closed' },
      { w: 'kitten', parts: ['kit', 'ten'], ask: 0, a: 'closed' },
      { w: 'open',   parts: ['o', 'pen'],  ask: 0, a: 'open' },
      { w: 'rabbit', parts: ['rab', 'bit'], ask: 1, a: 'closed' },
      { w: 'spider', parts: ['spi', 'der'], ask: 0, a: 'open' }
    ]
  },

  /* 阅读技能 10 项（简报 §3，围绕四本故事书主题自创迷你段落，不抄原文） */
  READING:   [
    {
      "skill": "Author's Purpose",
      "passage": "Owls are birds that are well suited for hunting at night. Many owls have large eyes that help them see in low light. They can also turn their heads to look in different directions. These special features help owls find food when it is dark.",
      "q": "What is the author's purpose?",
      "a": "inform（告诉读者知识）",
      "wrong": [
        "persuade（说服读者）",
        "entertain（逗读者开心）",
        "none of the above（都不是）"
      ],
      "src": "〔原题·复习卷图5 Q1〕"
    },
    {
      "skill": "Main Idea & Details",
      "passage": "Owls are birds that are well suited for hunting at night. Many owls have large eyes that help them see in low light. They can also turn their heads to look in different directions. These special features help owls find food when it is dark.",
      "q": "What is the main idea of the text?",
      "a": "Owls have special features that help them hunt and survive.",
      "wrong": [
        "Owls sleep all day and never hunt.",
        "All birds hunt only at night.",
        "Owls live only in cold places."
      ],
      "src": "〔原题·复习卷图5 Q2〕"
    },
    {
      "skill": "Main Idea & Details",
      "passage": "Owls have excellent hearing. Their ears help them hear small animals moving through grass or leaves. When an owl hears a mouse, it can fly quietly toward its prey. Soft feathers help the owl move through the air without making much noise.",
      "q": "How do soft feathers help owls hunt?",
      "a": "They help owls fly quietly.",
      "wrong": [
        "They help owls swim underwater.",
        "They keep owls from needing food.",
        "They help owls see in the dark."
      ],
      "src": "〔原题·复习卷图5 Q3〕"
    },
    {
      "skill": "开放简答",
      "passage": "Owls are birds that are well suited for hunting at night. Many owls have large eyes that help them see in low light. They can also turn their heads to look in different directions. These special features help owls find food when it is dark. Owls have excellent hearing. Their ears help them hear small animals moving through grass or leaves. When an owl hears a mouse, it can fly quietly toward its prey. Soft feathers help the owl move through the air without making much noise.",
      "q": "Explain two ways an owl's body helps it hunt for food. Use two details from the text.",
      "a": "①大而亮的眼睛在暗处也看得清；②软羽毛让它飞得安静。",
      "wrong": [],
      "open": true,
      "src": "〔原题·复习卷图5 Q4·开放〕"
    },
    {
      "skill": "Author's Purpose",
      "passage": "(From the story 'Clark the Shark')",
      "q": "What is the author's purpose for the story?",
      "a": "Entertain（讲故事让人开心）",
      "wrong": [
        "Persuade（说服）",
        "Inform（告知知识）",
        "Explain a rule（说明规则）"
      ],
      "src": "〔原题·复习卷 p.7〕"
    },
    {
      "skill": "Cause & Effect",
      "passage": "(From the story 'Clark the Shark')Joey Mackerel says, \"Cool your jets, Clark! You're making me crazy!\"",
      "q": "What is the cause?",
      "a": "Clark is too wild.",
      "wrong": [
        "Clark is reading very quietly.",
        "Clark is doing his homework quickly.",
        "Clark is asleep."
      ],
      "src": "〔原题·复习卷 p.7〕"
    },
    {
      "skill": "Figurative Language",
      "passage": "(From the story 'Clark the Shark')",
      "q": "How does Clark remind himself to stay cool?",
      "a": "He uses rhymes.",
      "wrong": [
        "He uses alliteration.",
        "He uses onomatopoeia.",
        "He sings a song."
      ],
      "src": "〔原题·复习卷 p.7〕"
    },
    /* ENG-ET-21（2026-11-05 老师手抄页 §19⑥，证据等级①）：figurative 三件套识别题。
     * 例句为手抄页逐字原句（Chief 读图复核件背书）；题干与讲解措辞为教学自拟——
     * 老师定义的逐字文案尚无转录件，待 Chief 读图件补真定义后替换（不凭印象冒充老师原话）。支撑 W-12。 */
    {
      "skill": "Figurative Language",
      "passage": "The wind whistled and the leaves danced.",
      "q": "The wind whistles and the leaves dance — like people do. Which one is this?",
      "a": "personification",
      "wrong": [
        "onomatopoeia",
        "alliteration",
        "rhyme"
      ],
      "explain": "The wind whistled and the leaves danced — a wind and leaves cannot really whistle or dance. Giving things human actions is personification.",
      "explainZh": "风不会真的吹口哨，叶子不会跳舞——把事物当人来写，就是 personification（拟人）。",
      "src": "〔手抄页·老师材料 §19⑥·例句逐字〕"
    },
    {
      "skill": "Figurative Language",
      "passage": "Bang! Crash! Roar!",
      "q": "These words are sounds you can hear: Bang! Crash! Roar!. Which one is this?",
      "a": "onomatopoeia",
      "wrong": [
        "personification",
        "alliteration",
        "rhyme"
      ],
      "explain": "Bang! Crash! Roar! — the words sound like the noises they name. Words that imitate sounds are onomatopoeia.",
      "explainZh": "Bang! Crash! Roar! 词读出来就像它表示的声音——模仿声音的词是 onomatopoeia（拟声）。",
      "src": "〔手抄页·老师材料 §19⑥·例句逐字〕"
    },
    {
      "skill": "Figurative Language",
      "passage": "She sells seashells by the seashore.",
      "q": "Listen: She sells seashells — many words start with the same sound. Which one is this?",
      "a": "alliteration",
      "wrong": [
        "personification",
        "onomatopoeia",
        "rhyme"
      ],
      "explain": "She sells seashells — the same starting sound repeats in a row. That is alliteration.",
      "explainZh": "She sells seashells——一连串词开头读音相同，是 alliteration（头韵）。",
      "src": "〔手抄页·老师材料 §19⑥·例句逐字〕"
    },
    {
      "skill": "Genre",
      "passage": "(From the story 'Clark the Shark')",
      "q": "What is the genre of the text?",
      "a": "Fantasy",
      "wrong": [
        "Informational Text",
        "Realistic Fiction",
        "Biography"
      ],
      "src": "〔原题·Clark HWB p.5〕"
    },
    {
      "skill": "Main Idea & Details",
      "passage": "(From the story 'Clark the Shark')",
      "q": "What was the lesson from the story?",
      "a": "There is a time and a place for everything.",
      "wrong": [
        "You must be quiet all the time.",
        "Just say sorry.",
        "Make lots of friends."
      ],
      "src": "〔原题·Clark HWB p.5〕"
    },
    {
      "skill": "Genre",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "What is the genre of the story?",
      "a": "Realistic fiction（真实生活故事）",
      "wrong": [
        "Fantasy",
        "Biography",
        "Informational Text"
      ],
      "src": "〔原题·复习卷 p.7 / HWB p.6〕"
    },
    {
      "skill": "Story Elements",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "Who is the main character?",
      "a": "The student who is getting his picture taken.",
      "wrong": [
        "The photographer.",
        "The principal.",
        "The student's little brother."
      ],
      "src": "〔原题·HWB p.6〕"
    },
    {
      "skill": "Story Elements",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "What happened to his hair?",
      "a": "It was messy, and his brother laughed at him.",
      "wrong": [
        "He cut it himself.",
        "It was perfectly combed.",
        "He wore a hat all day."
      ],
      "src": "〔原题·HWB p.6〕"
    },
    {
      "skill": "Story Elements",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "What did his mother think of the picture?",
      "a": "She thought it was his best picture.",
      "wrong": [
        "She was angry about it.",
        "She wanted a new one.",
        "She did not look at it."
      ],
      "src": "〔原题·HWB p.6〕"
    },
    {
      "skill": "Story Elements",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "What happened at breakfast?",
      "a": "He spilled syrup on himself.",
      "wrong": [
        "He dropped his plate on the floor.",
        "He forgot to eat.",
        "He ate his brother's food."
      ],
      "src": "〔原题·HWB p.6〕"
    },
    {
      "skill": "Main Idea & Details",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "What is the lesson of the story?",
      "a": "Things may not go as planned.",
      "wrong": [
        "You should always take pictures.",
        "Breakfast is the most important meal.",
        "Brothers are always funny."
      ],
      "src": "〔原题·HWB p.6〕"
    },
    {
      "skill": "Summarize",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "Which sentence best summarizes the story?",
      "a": "A boy tries to make the worst picture possible but fails at the end.",
      "wrong": [
        "A boy messes up his photo, and his parents are upset.",
        "A boy breaks the camera, so he does not need to take a photo.",
        "A boy takes a perfect picture the first time."
      ],
      "doubt": true,
      "src": "〔原题·复习卷 p.7·存疑：待家长核原书〕"
    },
    {
      "skill": "Character Traits",
      "passage": "(From the story 'Picture Day Perfection')",
      "q": "Which character trait best describes the main character?",
      "a": "naughty（淘气）",
      "wrong": [
        "clean",
        "forgetful",
        "friendly"
      ],
      "doubt": true,
      "src": "〔原题·复习卷 p.7·存疑：待家长核原书〕"
    },
    {
      "skill": "Author's Purpose",
      "passage": "Butterflies are insects with four colorful wings. They begin life as eggs, then become caterpillars. Butterflies drink nectar from flowers and help plants grow new seeds.",
      "q": "What is the author's purpose?",
      "a": "inform（告诉读者知识）",
      "wrong": [
        "persuade（说服读者）",
        "entertain（逗读者开心）",
        "none of the above"
      ],
      "src": "〔原题·HWB p.13·段落据题意简述〕"
    },
    {
      "skill": "Author's Purpose",
      "passage": "Are you hungry? Brandy's Burgers are the biggest and juiciest in town! Come to Brandy's Burgers today and try one — you will love it!",
      "q": "What is the author's purpose?",
      "a": "persuade（说服读者去尝试）",
      "wrong": [
        "inform（告诉读者知识）",
        "entertain（逗读者开心）",
        "explain a rule"
      ],
      "src": "〔原题·HWB p.14·段落据题意简述〕"
    },
    {
      "skill": "Author's Purpose",
      "passage": "One snowy morning, Ben rolled himself into a giant snowball and slid all the way down the hill — right into his teacher's mailbox! Everyone laughed for a whole minute.",
      "q": "What is the author's purpose?",
      "a": "entertain（逗读者开心）",
      "wrong": [
        "inform（告诉读者知识）",
        "persuade（说服读者）",
        "give directions"
      ],
      "src": "〔原题·HWB p.15·段落据题意简述〕"
    },
    {
      "skill": "Cause & Effect",
      "passage": "Why couldn't we get inside?",
      "q": "Choose the correct cause.",
      "a": "Mom locked the car door.",
      "wrong": [
        "The students were too noisy.",
        "There was ice on the step.",
        "She ran a marathon."
      ],
      "src": "〔原题·HWB p.10〕"
    },
    {
      "skill": "Cause & Effect",
      "passage": "The teacher turned the lights off and on.",
      "q": "Choose the correct cause.",
      "a": "The students were too noisy.",
      "wrong": [
        "Mom locked the car door.",
        "There was ice on the step.",
        "Roberto ate too many jellybeans."
      ],
      "src": "〔原题·HWB p.10〕"
    },
    {
      "skill": "Cause & Effect",
      "passage": "Sam slipped.",
      "q": "Choose the correct cause.",
      "a": "There was ice on the step.",
      "wrong": [
        "Mom locked the car door.",
        "She ran a marathon.",
        "The students were too noisy."
      ],
      "src": "〔原题·HWB p.10〕"
    },
    {
      "skill": "Cause & Effect",
      "passage": "Roberto got a belly ache.",
      "q": "Choose the correct cause.",
      "a": "He ate too many jellybeans.",
      "wrong": [
        "There was ice on the step.",
        "She ran a marathon.",
        "The students were too noisy."
      ],
      "src": "〔原题·HWB p.10〕"
    },
    {
      "skill": "Cause & Effect",
      "passage": "She was very tired.",
      "q": "Choose the correct cause.",
      "a": "She ran a marathon.",
      "wrong": [
        "Mom locked the car door.",
        "He ate too many jellybeans.",
        "There was ice on the step."
      ],
      "src": "〔原题·HWB p.10〕"
    },
    {
      "skill": "Context Clues",
      "passage": "The joke was witty, so everyone laughed.",
      "q": "What does witty mean?",
      "a": "funny",
      "wrong": [
        "angry",
        "slow",
        "quiet"
      ],
      "src": "〔原题·HWB p.11〕"
    },
    {
      "skill": "Context Clues",
      "passage": "She was ecstatic when she won the prize.",
      "q": "What does ecstatic mean?",
      "a": "very happy",
      "wrong": [
        "very sad",
        "very tired",
        "very angry"
      ],
      "src": "〔原题·HWB p.11〕"
    },
    {
      "skill": "Context Clues",
      "passage": "Be cautious when you cross the road.",
      "q": "What does cautious mean?",
      "a": "careful",
      "wrong": [
        "careless",
        "fast",
        "loud"
      ],
      "src": "〔原题·HWB p.11〕"
    },
    {
      "skill": "Context Clues",
      "passage": "I got a glimpse of the bird before it flew away.",
      "q": "What does glimpse mean?",
      "a": "a short look",
      "wrong": [
        "a loud sound",
        "a big meal",
        "a long walk"
      ],
      "src": "〔原题·HWB p.11〕"
    },
    {
      "skill": "Context Clues",
      "passage": "The courageous firefighter ran into the burning house.",
      "q": "What does courageous mean?",
      "a": "brave",
      "wrong": [
        "scared",
        "sleepy",
        "hungry"
      ],
      "src": "〔原题·HWB p.11〕"
    },
    {
      "skill": "Character Traits",
      "passage": "Outside traits are what you can see. Inside traits are what a character is like inside.",
      "q": "What is an outside trait?",
      "a": "what you can see (appearance)",
      "wrong": [
        "personality",
        "actions",
        "voice"
      ],
      "src": "〔原题·HWB p.7〕"
    },
    {
      "skill": "Character Traits",
      "passage": "Look at the traits: brave, tall, black hair, green dress.",
      "q": "Which one is an inside trait?",
      "a": "brave",
      "wrong": [
        "tall",
        "black hair",
        "green dress"
      ],
      "src": "〔原题·HWB p.7·锚图词〕"
    }
  ],

  /* 语法（简报 §3 Grammar） */
  GRAMMAR:   {
    "sv": [
      {
        "s": "Mr. Tansey and Mr. Condie ______ at our school.",
        "a": "teach",
        "wrong": [
          "teaches"
        ],
        "src": "〔原题·复习卷图6〕"
      },
      {
        "s": "Mr. Kelly ______ to read stories.",
        "a": "loves",
        "wrong": [
          "love"
        ],
        "src": "〔原题·复习卷图6〕"
      },
      {
        "s": "All our teachers ______ coffee every morning.",
        "a": "drink",
        "wrong": [
          "drinks"
        ],
        "src": "〔原题·复习卷图6〕"
      },
      {
        "s": "Mr. Tansey ______ a kind teacher.",
        "a": "is",
        "wrong": [
          "are"
        ],
        "src": "〔原题·复习卷图6〕"
      },
      {
        "s": "Mr. Kelly and Mr. Condie ______ to help students.",
        "a": "like",
        "wrong": [
          "likes"
        ],
        "src": "〔原题·复习卷图6〕"
      },
      {
        "s": "The dogs ______ in the park.",
        "a": "run",
        "wrong": [
          "runs"
        ],
        "src": "〔原题·Clark HWB p.8·W-01 弱点〕",
        "weak": true
      },
      {
        "s": "The students ______ quietly for Ms. Brenna.",
        "a": "sit",
        "wrong": [
          "sits"
        ],
        "src": "〔原题·Clark HWB p.8〕"
      },
      {
        "s": "Ms. Brenna ______ the cookies from the jar.",
        "a": "steals",
        "wrong": [
          "steal"
        ],
        "src": "〔原题·Clark HWB p.8〕"
      },
      {
        "s": "Mr. Judkins ______ the scissors to Ms. Head.",
        "a": "gives",
        "wrong": [
          "give"
        ],
        "src": "〔原题·Clark HWB p.8〕"
      },
      {
        "s": "Mr. Chris ______ chicken for lunch.",
        "a": "eats",
        "wrong": [
          "eat"
        ],
        "src": "〔原题·Clark HWB p.8〕"
      },
      {
        "s": "Clark ______ his mom to cook dinner.",
        "a": "helps",
        "wrong": [
          "help"
        ],
        "src": "〔原题·Clark HWB p.8〕"
      },
      {
        "s": "They ______ instruments after lunch.",
        "a": "play",
        "wrong": [
          "plays"
        ],
        "src": "〔原题·Clark HWB p.8〕"
      }
    ],
    "plural": [
      {
        "s": "Fix it: I saw three foxs in the forest. What is the plural of 'fox'?",
        "a": "foxes",
        "wrong": [
          "foxs",
          "foxes'",
          "fox"
        ],
        "src": "〔原题·HWB p.17〕",
        "weak": true
      },
      {
        "s": "Fix it: The doges are playing in the park. What is the plural of 'dog'?",
        "a": "dogs",
        "wrong": [
          "doges",
          "dog",
          "dogs'"
        ],
        "src": "〔原题·HWB p.17〕"
      },
      {
        "s": "Fix it: My mom bought two dresss for my sister. What is the plural of 'dress'?",
        "a": "dresses",
        "wrong": [
          "dresss",
          "dress",
          "dresseses"
        ],
        "src": "〔原题·HWB p.17〕"
      },
      {
        "s": "Fix it: There are six apple on the table. What is the plural of 'apple'?",
        "a": "apples",
        "wrong": [
          "apple",
          "apples'",
          "applees"
        ],
        "src": "〔原题·HWB p.17〕"
      },
      {
        "s": "One box, two boxes. What is the plural of 'box'?",
        "a": "boxes",
        "wrong": [
          "boxs",
          "boxies",
          "boxen"
        ],
        "src": "〔拼读规则〕"
      },
      {
        "s": "What is the plural of 'baby'?",
        "a": "babies",
        "wrong": [
          "babys",
          "babis",
          "babyes"
        ],
        "src": "〔拼读规则〕"
      },
      {
        "s": "What is the plural of 'bus'?",
        "a": "buses",
        "wrong": [
          "buss",
          "busies",
          "buses s"
        ],
        "src": "〔拼读规则〕"
      },
      {
        "s": "What is the plural of 'watch'?",
        "a": "watches",
        "wrong": [
          "watchs",
          "watcheses",
          "watchies"
        ],
        "src": "〔拼读规则〕"
      },
      {
        "s": "What is the plural of 'cat'?",
        "a": "cats",
        "wrong": [
          "cates",
          "catses",
          "catsy"
        ],
        "src": "〔拼读规则〕"
      }
    ],
    "stype": [
      {
        "s": "What is your name",
        "a": "Question",
        "punct": "?",
        "wrong": [
          "Statement",
          "Exclamation",
          "Command"
        ],
        "src": "〔原题·复习卷 p.7〕"
      },
      {
        "s": "My name is Julia",
        "a": "Statement",
        "punct": ".",
        "wrong": [
          "Question",
          "Exclamation",
          "Command"
        ],
        "src": "〔原题·复习卷 p.7〕"
      },
      {
        "s": "Sit next to me, Julia",
        "a": "Command",
        "punct": ".",
        "wrong": [
          "Statement",
          "Question",
          "Exclamation"
        ],
        "src": "〔原题·复习卷 p.7〕"
      },
      {
        "s": "Wow, you're so kind",
        "a": "Exclamation",
        "punct": "!",
        "wrong": [
          "Statement",
          "Question",
          "Command"
        ],
        "src": "〔原题·复习卷 p.7〕"
      },
      {
        "s": "Yipee, it's my birthday!",
        "a": "Exclamation",
        "punct": "!",
        "wrong": [
          "Statement",
          "Command",
          "Question"
        ],
        "src": "〔原题·HWB p.8〕"
      },
      {
        "s": "You must finish your homework.",
        "a": "Command",
        "punct": ".",
        "wrong": [
          "Statement",
          "Question",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.8〕"
      },
      {
        "s": "How many sisters do you have?",
        "a": "Question",
        "punct": "?",
        "wrong": [
          "Statement",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.8〕"
      },
      {
        "s": "Hooray, we're going to see the fireworks!",
        "a": "Exclamation",
        "punct": "!",
        "wrong": [
          "Statement",
          "Command",
          "Question"
        ],
        "src": "〔原题·HWB p.8〕"
      },
      {
        "s": "They have a lot of homework tonight.",
        "a": "Statement",
        "punct": ".",
        "wrong": [
          "Question",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.8〕"
      },
      {
        "s": "I'm always on time for school.",
        "a": "Statement",
        "punct": ".",
        "wrong": [
          "Question",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.8〕"
      },
      {
        "s": "Wow, it is hot outside!",
        "a": "Exclamation",
        "punct": "!",
        "wrong": [
          "Statement",
          "Command",
          "Question"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "Open the window.",
        "a": "Command",
        "punct": ".",
        "wrong": [
          "Statement",
          "Question",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "Can I play ball with you?",
        "a": "Question",
        "punct": "?",
        "wrong": [
          "Statement",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "Mr. Alex is my teacher.",
        "a": "Statement",
        "punct": ".",
        "wrong": [
          "Question",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "Put on your hat and coat.",
        "a": "Command",
        "punct": ".",
        "wrong": [
          "Statement",
          "Question",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "Do you have a pencil?",
        "a": "Question",
        "punct": "?",
        "wrong": [
          "Statement",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "I have a new pet.",
        "a": "Statement",
        "punct": ".",
        "wrong": [
          "Question",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "Quick, run outside.",
        "a": "Command",
        "punct": ".",
        "wrong": [
          "Statement",
          "Question",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "I'm so excited!",
        "a": "Exclamation",
        "punct": "!",
        "wrong": [
          "Statement",
          "Command",
          "Question"
        ],
        "src": "〔原题·HWB p.10〕"
      },
      {
        "s": "I love SHSID.",
        "a": "Statement",
        "punct": ".",
        "wrong": [
          "Question",
          "Command",
          "Exclamation"
        ],
        "src": "〔原题·HWB p.10〕"
      }
    ],
    "adj": [
      {
        "s": "The red ball is under the table.",
        "a": "red",
        "wrong": [
          "is",
          "under",
          "table"
        ]
      },
      {
        "s": "My big brother can swim.",
        "a": "big",
        "wrong": [
          "my",
          "can",
          "swim"
        ]
      },
      {
        "s": "The cool wind feels nice.",
        "a": "cool",
        "wrong": [
          "wind",
          "feels",
          "nice is"
        ]
      }
    ]
  },

  /* 背诵闯关（口试 11-06）：古诗五首（简报点名）；课文两篇按部编版填入并标存疑，
   * 《日月潭》2~4 段等长课文待 Researcher 供稿 content-data-yuwen.md 后插入 */
  RECITE: [
    { id: 'meihua',   title: '梅花',       author: '王安石', kind: 'poem', lines: ['墙角数枝梅，', '凌寒独自开。', '遥知不是雪，', '为有暗香来。'] },
    { id: 'shujiuge', title: '数九歌',     author: '传统民谣', kind: 'poem', lines: ['一九二九不出手，', '三九四九冰上走，', '五九六九沿河看柳，', '七九河开，', '八九雁来，', '九九加一九，耕牛遍地走。'] },
    { id: 'exctd',    title: '小儿垂钓',   author: '胡令能', kind: 'poem', lines: ['蓬头稚子学垂纶，', '侧坐莓苔草映身。', '路人借问遥招手，', '怕得鱼惊不应人。'] },
    { id: 'gql',      title: '登鹳雀楼',   author: '王之涣', kind: 'poem', lines: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'] },
    { id: 'lcpb',     title: '望庐山瀑布', author: '李白',   kind: 'poem', lines: ['日照香炉生紫烟，', '遥看瀑布挂前川。', '飞流直下三千尺，', '疑是银河落九天。'] },
    { id: 'shuzhige', title: '树之歌',     author: '部编版二上', kind: 'text', doubt: true, lines: ['杨树高，榕树壮，梧桐树叶像手掌。', '枫树秋天叶儿红，松柏四季披绿装。', '木棉喜暖在南方，桦树耐寒守北疆。', '银杏水杉活化石，金桂开花满院香。'] },
    { id: 'tianjia',  title: '田家四季歌', author: '部编版二上', kind: 'text', doubt: true, lines: ['春季里，春风吹，花开草长蝴蝶飞。麦苗儿多嫩，桑叶儿正肥。', '夏季里，农事忙，采了蚕桑又插秧。早起勤耕作，归来戴月光。', '秋季里，稻上场，谷像黄金粒粒香。身体虽辛苦，心里喜洋洋。', '冬季里，雪初晴，新制棉衣暖又轻。一年农事了，大家笑盈盈。'] }
    /* ↓ Researcher 供稿后在此追加：{ id:'riyuetan2', title:'日月潭（2~4自然段）', author:'部编版二上', kind:'text', lines:[...] } */
  ],

  /* ===== 语文九大题型数据槽 =====
   * 来源：docs/content-data-yuwen.md（Researcher 2026-10-31 全量交付）
   * 条数：PY2HAN 117 / DUYIN 15 / HUANZI 15 / ADDRADICAL 12 / PANDUAN 21 /
   *       ZHAOYANG 6 / KEWEN_READ 6 / KEWAI_READ 6；KANSHU 未交付（空数组→该题型自动隐藏）
   * 〔存疑〕41 条以 doubt:true 原样保留：QA 与家长按课本核对后转正，存疑不阻断使用。
   * 每条可选字段：src（篇目，必填）/ explain 或 why（给孩子的一句讲解）/ doubt（存疑标记）
   */

  /* 看拼音写汉字：{ word, py }（七课文生字，打字输入） */
  PY2HAN:   [
    {
      "word": "塘",
      "py": "táng",
      "src": "小蝌蚪找妈妈",
      "explain": "水边的池塘"
    },
    {
      "word": "脑",
      "py": "nǎo",
      "src": "小蝌蚪找妈妈",
      "explain": "小小的脑袋"
    },
    {
      "word": "袋",
      "py": "dài",
      "src": "小蝌蚪找妈妈",
      "explain": "袋子装东西"
    },
    {
      "word": "灰",
      "py": "huī",
      "src": "小蝌蚪找妈妈",
      "explain": "黑灰色是灰色的一种"
    },
    {
      "word": "哇",
      "py": "wā",
      "src": "小蝌蚪找妈妈",
      "explain": "惊讶时说的\"哇\""
    },
    {
      "word": "教",
      "py": "jiāo",
      "src": "小蝌蚪找妈妈",
      "explain": "教别人本领，读第一声"
    },
    {
      "word": "捕",
      "py": "bǔ",
      "src": "小蝌蚪找妈妈",
      "explain": "捕鱼、捕捉，读 bǔ 不读 pǔ"
    },
    {
      "word": "迎",
      "py": "yíng",
      "src": "小蝌蚪找妈妈",
      "explain": "迎接、迎上去"
    },
    {
      "word": "阿",
      "py": "ā",
      "src": "小蝌蚪找妈妈",
      "explain": "阿姨的阿"
    },
    {
      "word": "姨",
      "py": "yí",
      "src": "小蝌蚪找妈妈",
      "explain": "阿姨的姨"
    },
    {
      "word": "宽",
      "py": "kuān",
      "src": "小蝌蚪找妈妈",
      "explain": "宽宽的嘴巴"
    },
    {
      "word": "龟",
      "py": "guī",
      "src": "小蝌蚪找妈妈",
      "explain": "乌龟的龟"
    },
    {
      "word": "晒",
      "py": "shài",
      "src": "我是什么",
      "explain": "太阳晒一晒"
    },
    {
      "word": "漂",
      "py": "piāo",
      "src": "我是什么",
      "explain": "漂浮，读 piāo"
    },
    {
      "word": "滴",
      "py": "dī",
      "src": "我是什么",
      "explain": "一滴水"
    },
    {
      "word": "溪",
      "py": "xī",
      "src": "我是什么",
      "explain": "小溪的溪"
    },
    {
      "word": "猜",
      "py": "cāi",
      "src": "我是什么",
      "explain": "猜猜看"
    },
    {
      "word": "跳",
      "py": "tiào",
      "src": "我是什么",
      "explain": "跳起来"
    },
    {
      "word": "没",
      "py": "mò",
      "src": "我是什么",
      "explain": "淹没，读 mò"
    },
    {
      "word": "坏",
      "py": "huài",
      "src": "我是什么",
      "explain": "做坏事"
    },
    {
      "word": "淹",
      "py": "yān",
      "src": "我是什么",
      "explain": "水淹了田地"
    },
    {
      "word": "害",
      "py": "hài",
      "src": "我是什么",
      "explain": "伤害、有害"
    },
    {
      "word": "翅",
      "py": "chì",
      "src": "我是什么",
      "explain": "翅膀的翅"
    },
    {
      "word": "膀",
      "py": "bǎng",
      "src": "我是什么",
      "explain": "翅膀的膀"
    },
    {
      "word": "植",
      "py": "zhí",
      "src": "植物妈妈有办法",
      "explain": "植物、种植"
    },
    {
      "word": "如",
      "py": "rú",
      "src": "植物妈妈有办法",
      "explain": "如果、比如"
    },
    {
      "word": "为",
      "py": "wéi",
      "src": "植物妈妈有办法",
      "explain": "四海为家，读 wéi"
    },
    {
      "word": "旅",
      "py": "lǚ",
      "src": "植物妈妈有办法",
      "explain": "旅行、旅途"
    },
    {
      "word": "备",
      "py": "bèi",
      "src": "植物妈妈有办法",
      "explain": "准备、备好"
    },
    {
      "word": "纷",
      "py": "fēn",
      "src": "植物妈妈有办法",
      "explain": "纷纷出发"
    },
    {
      "word": "刺",
      "py": "cì",
      "src": "植物妈妈有办法",
      "explain": "带刺的铠甲"
    },
    {
      "word": "底",
      "py": "dǐ",
      "src": "植物妈妈有办法",
      "explain": "太阳底下"
    },
    {
      "word": "炸",
      "py": "zhà",
      "src": "植物妈妈有办法",
      "explain": "豆荚炸开"
    },
    {
      "word": "离",
      "py": "lí",
      "src": "植物妈妈有办法",
      "explain": "离开妈妈"
    },
    {
      "word": "察",
      "py": "chá",
      "src": "植物妈妈有办法",
      "explain": "仔细观察"
    },
    {
      "word": "识",
      "py": "shí",
      "src": "植物妈妈有办法",
      "explain": "知识"
    },
    {
      "word": "靠",
      "py": "kào",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "靠着椅子"
    },
    {
      "word": "排",
      "py": "pái",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "排队、一排"
    },
    {
      "word": "距",
      "py": "jù",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "距离"
    },
    {
      "word": "汉",
      "py": "hàn",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "汉字的汉"
    },
    {
      "word": "究",
      "py": "jiū",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "研究"
    },
    {
      "word": "项",
      "py": "xiàng",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "一项一项地数"
    },
    {
      "word": "组",
      "py": "zǔ",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "一组星星"
    },
    {
      "word": "斗",
      "py": "dǒu",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "北斗星，读 dǒu"
    },
    {
      "word": "珍",
      "py": "zhēn",
      "src": "数星星的孩子",
      "doubt": true,
      "explain": "珍贵的星星"
    },
    {
      "word": "闻",
      "py": "wén",
      "src": "黄山奇石",
      "explain": "中外闻名"
    },
    {
      "word": "名",
      "py": "míng",
      "src": "黄山奇石",
      "explain": "有名、名字"
    },
    {
      "word": "部",
      "py": "bù",
      "src": "黄山奇石",
      "explain": "一部分"
    },
    {
      "word": "景",
      "py": "jǐng",
      "src": "黄山奇石",
      "explain": "风景"
    },
    {
      "word": "区",
      "py": "qū",
      "src": "黄山奇石",
      "explain": "风景区"
    },
    {
      "word": "省",
      "py": "shěng",
      "src": "黄山奇石",
      "explain": "安徽省"
    },
    {
      "word": "秀",
      "py": "xiù",
      "src": "黄山奇石",
      "explain": "秀丽"
    },
    {
      "word": "神",
      "py": "shén",
      "src": "黄山奇石",
      "explain": "神奇"
    },
    {
      "word": "巨",
      "py": "jù",
      "src": "黄山奇石",
      "explain": "巨石"
    },
    {
      "word": "位",
      "py": "wèi",
      "src": "黄山奇石",
      "explain": "一位游客"
    },
    {
      "word": "著",
      "py": "zhù",
      "src": "黄山奇石",
      "explain": "著名"
    },
    {
      "word": "形",
      "py": "xíng",
      "src": "黄山奇石",
      "explain": "奇形怪状"
    },
    {
      "word": "湖",
      "py": "hú",
      "src": "日月潭",
      "doubt": true,
      "explain": "日月潭是个湖"
    },
    {
      "word": "绕",
      "py": "rào",
      "src": "日月潭",
      "doubt": true,
      "explain": "群山环绕"
    },
    {
      "word": "围",
      "py": "wéi",
      "src": "日月潭",
      "doubt": true,
      "explain": "周围"
    },
    {
      "word": "岛",
      "py": "dǎo",
      "src": "日月潭",
      "doubt": true,
      "explain": "美丽的小岛"
    },
    {
      "word": "隐",
      "py": "yǐn",
      "src": "日月潭",
      "doubt": true,
      "explain": "隐隐约约"
    },
    {
      "word": "约",
      "py": "yuē",
      "src": "日月潭",
      "doubt": true,
      "explain": "约好、隐约"
    },
    {
      "word": "茂",
      "py": "mào",
      "src": "日月潭",
      "doubt": true,
      "explain": "茂盛"
    },
    {
      "word": "盛",
      "py": "shèng",
      "src": "日月潭",
      "doubt": true,
      "explain": "茂盛"
    },
    {
      "word": "胜",
      "py": "shèng",
      "src": "日月潭",
      "doubt": true,
      "explain": "名胜古迹"
    },
    {
      "word": "迹",
      "py": "jì",
      "src": "日月潭",
      "doubt": true,
      "explain": "古迹"
    },
    {
      "word": "沟",
      "py": "gōu",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "葡萄沟"
    },
    {
      "word": "产",
      "py": "chǎn",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "出产"
    },
    {
      "word": "梨",
      "py": "lí",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "香梨"
    },
    {
      "word": "坡",
      "py": "pō",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "山坡"
    },
    {
      "word": "梯",
      "py": "tī",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "梯田"
    },
    {
      "word": "棚",
      "py": "péng",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "凉棚"
    },
    {
      "word": "市",
      "py": "shì",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "城市"
    },
    {
      "word": "客",
      "py": "kè",
      "src": "葡萄沟",
      "doubt": true,
      "explain": "客人、好客"
    },
    {
      "word": "艘",
      "py": "sōu",
      "src": "场景歌",
      "explain": "一艘军舰"
    },
    {
      "word": "军",
      "py": "jūn",
      "src": "场景歌",
      "explain": "军舰"
    },
    {
      "word": "舰",
      "py": "jiàn",
      "src": "场景歌",
      "explain": "军舰的舰"
    },
    {
      "word": "帆",
      "py": "fān",
      "src": "场景歌",
      "explain": "帆船"
    },
    {
      "word": "桥",
      "py": "qiáo",
      "src": "场景歌",
      "explain": "一座石桥"
    },
    {
      "word": "园",
      "py": "yuán",
      "src": "场景歌",
      "explain": "花园、校园"
    },
    {
      "word": "队",
      "py": "duì",
      "src": "场景歌",
      "explain": "一队人"
    },
    {
      "word": "旗",
      "py": "qí",
      "src": "场景歌",
      "explain": "队旗"
    },
    {
      "word": "铜",
      "py": "tóng",
      "src": "场景歌",
      "explain": "铜号"
    },
    {
      "word": "号",
      "py": "hào",
      "src": "场景歌",
      "explain": "号角、号码"
    },
    {
      "word": "领",
      "py": "lǐng",
      "src": "场景歌",
      "explain": "红领巾"
    },
    {
      "word": "梧",
      "py": "wú",
      "src": "树之歌",
      "explain": "梧桐树"
    },
    {
      "word": "桐",
      "py": "tóng",
      "src": "树之歌",
      "explain": "梧桐"
    },
    {
      "word": "掌",
      "py": "zhǎng",
      "src": "树之歌",
      "explain": "手掌"
    },
    {
      "word": "枫",
      "py": "fēng",
      "src": "树之歌",
      "explain": "枫树"
    },
    {
      "word": "松",
      "py": "sōng",
      "src": "树之歌",
      "explain": "松树"
    },
    {
      "word": "柏",
      "py": "bǎi",
      "src": "树之歌",
      "explain": "松柏，读 bǎi"
    },
    {
      "word": "桂",
      "py": "guì",
      "src": "树之歌",
      "explain": "金桂"
    },
    {
      "word": "桦",
      "py": "huà",
      "src": "树之歌",
      "explain": "桦树"
    },
    {
      "word": "耐",
      "py": "nài",
      "src": "树之歌",
      "explain": "耐寒"
    },
    {
      "word": "疆",
      "py": "jiāng",
      "src": "树之歌",
      "explain": "北疆"
    },
    {
      "word": "银",
      "py": "yín",
      "src": "树之歌",
      "explain": "银杏"
    },
    {
      "word": "杉",
      "py": "shān",
      "src": "树之歌",
      "explain": "水杉"
    },
    {
      "word": "雀",
      "py": "què",
      "src": "拍手歌",
      "doubt": true,
      "explain": "孔雀"
    },
    {
      "word": "锦",
      "py": "jǐn",
      "src": "拍手歌",
      "doubt": true,
      "explain": "锦鸡"
    },
    {
      "word": "鹰",
      "py": "yīng",
      "src": "拍手歌",
      "doubt": true,
      "explain": "雄鹰"
    },
    {
      "word": "雁",
      "py": "yàn",
      "src": "拍手歌",
      "doubt": true,
      "explain": "大雁"
    },
    {
      "word": "丛",
      "py": "cóng",
      "src": "拍手歌",
      "doubt": true,
      "explain": "丛林"
    },
    {
      "word": "深",
      "py": "shēn",
      "src": "拍手歌",
      "doubt": true,
      "explain": "深处"
    },
    {
      "word": "猛",
      "py": "měng",
      "src": "拍手歌",
      "doubt": true,
      "explain": "猛虎"
    },
    {
      "word": "虎",
      "py": "hǔ",
      "src": "拍手歌",
      "doubt": true,
      "explain": "老虎"
    },
    {
      "word": "肥",
      "py": "féi",
      "src": "田家四季歌",
      "explain": "桑叶儿正肥"
    },
    {
      "word": "桑",
      "py": "sāng",
      "src": "田家四季歌",
      "explain": "采桑"
    },
    {
      "word": "忙",
      "py": "máng",
      "src": "田家四季歌",
      "explain": "农事忙"
    },
    {
      "word": "秧",
      "py": "yāng",
      "src": "田家四季歌",
      "explain": "插秧"
    },
    {
      "word": "归",
      "py": "guī",
      "src": "田家四季歌",
      "explain": "归来"
    },
    {
      "word": "戴",
      "py": "dài",
      "src": "田家四季歌",
      "explain": "戴月光——像把月光戴在身上"
    },
    {
      "word": "场",
      "py": "cháng",
      "src": "田家四季歌",
      "explain": "稻上场，读 cháng"
    },
    {
      "word": "谷",
      "py": "gǔ",
      "src": "田家四季歌",
      "explain": "谷子"
    },
    {
      "word": "虽",
      "py": "suī",
      "src": "田家四季歌",
      "explain": "身体虽辛苦"
    },
    {
      "word": "轻",
      "py": "qīng",
      "src": "田家四季歌",
      "explain": "暖又轻"
    },
    {
      "word": "盈",
      "py": "yíng",
      "src": "田家四季歌",
      "explain": "笑盈盈"
    },
    { "word": "巨大", "py": "jù dà", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "特别特别大：鲸鱼是巨大的动物。" },
    { "word": "已经", "py": "yǐ jīng", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "事情做完了：我已经写完作业了。" },
    { "word": "领队", "py": "lǐng duì", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "带领队伍的人：领队叔叔走在最前面。" },
    { "word": "松柏", "py": "sōng bǎi", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "松树和柏树，冬天也是绿的。" },
    { "word": "金桂", "py": "jīn guì", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "开金黄色花的桂花树，秋天很香。" },
    { "word": "世界", "py": "shì jiè", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "所有的地方加在一起：我想去看看外面的世界。" },
    { "word": "朋友", "py": "péng you", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "互相喜欢、互相帮助的小伙伴。（卷面 you 读轻声，照录）" },
    { "word": "如果", "py": "rú guǒ", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "假想一种情况：如果明天下雨，我们就在家读书。" },
    { "word": "丛林", "py": "cóng lín", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "茂密的大树林：老虎住在丛林里。⚠️ 本格卷面原印 bǎo hù，老师红笔订正为 cóng lín——双留痕（万一考『保护』题还在）。" },
    { "word": "农事", "py": "nóng shì", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "田里干活的事：插秧、施肥、收割都是农事。" },
    { "word": "辛苦", "py": "xīn kǔ", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "很累很累：农民伯伯种粮食很辛苦。" },
    { "word": "形状", "py": "xíng zhuàng", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "东西的样子：圆的、方的、三角形的都叫形状。" },
    { "word": "城市", "py": "chéng shì", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "房子很多、人很多的地方：上海是一座大城市。" },
    { "word": "钉子", "py": "dīng zi", "src": "〔原题·老师批改版01·卷面拼音〕", "explain": "铁做的小棍，用锤子敲进木头里挂东西。（卷面 zi 读轻声，照录）" }
  ],
  /* 加偏旁组词：{ base, radical, right, word, wrong:[新字] } */
  ADDRADICAL:   [
    {
      "base": "青",
      "radical": "日",
      "right": "晴",
      "word": "晴天",
      "wrong": [
        "清",
        "请",
        "情"
      ],
      "src": "形近字辨析",
      "explain": "日字旁+青＝晴，有太阳才是晴天"
    },
    {
      "base": "青",
      "radical": "氵",
      "right": "清",
      "word": "清水",
      "wrong": [
        "晴",
        "请",
        "情"
      ],
      "src": "形近字辨析",
      "explain": "三点水+青＝清，和水有关"
    },
    {
      "base": "青",
      "radical": "讠",
      "right": "请",
      "word": "请坐",
      "wrong": [
        "晴",
        "清",
        "情"
      ],
      "src": "形近字辨析",
      "explain": "言字旁+青＝请，要说话才请"
    },
    {
      "base": "丁",
      "radical": "页",
      "right": "顶",
      "word": "山顶",
      "wrong": [
        "领",
        "项",
        "顺"
      ],
      "src": "黄山奇石",
      "explain": "页字旁+丁＝顶，头顶、山顶"
    },
    {
      "base": "巴",
      "radical": "扌",
      "right": "把",
      "word": "一把伞",
      "wrong": [
        "爸",
        "爬",
        "笆"
      ],
      "src": "量词搭配",
      "explain": "提手旁+巴＝把，用手拿的东西才用\"把\""
    },
    {
      "base": "羊",
      "radical": "氵",
      "right": "洋",
      "word": "海洋",
      "wrong": [
        "样",
        "痒",
        "详"
      ],
      "src": "日常",
      "explain": "三点水+羊＝洋，和水有关"
    },
    {
      "base": "支",
      "radical": "木",
      "right": "枝",
      "word": "枝叶",
      "wrong": [
        "技",
        "歧",
        "肢"
      ],
      "src": "葡萄沟",
      "explain": "木字旁+支＝枝，和树有关"
    },
    {
      "base": "直",
      "radical": "木",
      "right": "植",
      "word": "植物",
      "wrong": [
        "值",
        "置",
        "殖"
      ],
      "src": "植物妈妈有办法",
      "explain": "木字旁+直＝植，和植物有关"
    },
    {
      "base": "每",
      "radical": "氵",
      "right": "海",
      "word": "大海",
      "wrong": [
        "梅",
        "悔",
        "霉"
      ],
      "src": "日常",
      "explain": "三点水+每＝海，和水有关"
    },
    {
      "base": "马",
      "radical": "女",
      "right": "妈",
      "word": "妈妈",
      "wrong": [
        "吗",
        "码",
        "蚂"
      ],
      "src": "日常",
      "explain": "女字旁+马＝妈，妈妈是女生"
    },
    {
      "base": "白",
      "radical": "木",
      "right": "柏",
      "word": "松柏",
      "wrong": [
        "拍",
        "怕",
        "帕"
      ],
      "src": "树之歌",
      "explain": "木字旁+白＝柏，是一种树"
    },
    {
      "base": "同",
      "radical": "钅",
      "right": "铜",
      "word": "铜号",
      "wrong": [
        "桐",
        "筒",
        "洞"
      ],
      "src": "场景歌",
      "explain": "金字旁+同＝铜，是金属做的"
    },
    /* ---------- 〔原题·老师批改版02〕加偏旁 8 题（docs/content-data-yuwen.md v1.1 §10.2，
     * 红笔答案＝判分基线；干扰项为同字族真字（测试设计，非卷面内容）。
     * 纪律（Chief 2026-11-06 裁定3）：本批不产生弱点条目——全部不挂 weak。
     * 「勺」卷面老师给了两个答案（钓＋约），拆成两条入池。 ---------- */
    {
      "base": "圭",
      "radical": "木",
      "right": "桂",
      "word": "桂花",
      "wrong": ["娃", "挂", "佳"],
      "src": "〔原题·老师批改版02〕",
      "explain": "木字旁＋圭＝桂，桂花的桂"
    },
    {
      "base": "白",
      "radical": "扌",
      "right": "拍",
      "word": "拍手",
      "wrong": ["柏", "泊", "伯"],
      "src": "〔原题·老师批改版02〕",
      "explain": "提手旁＋白＝拍，拍手的拍（白＋木是柏树的柏，两个都学过）"
    },
    {
      "base": "古",
      "radical": "艹",
      "right": "苦",
      "word": "辛苦",
      "wrong": ["湖", "胡", "故"],
      "src": "〔原题·老师批改版02〕",
      "explain": "草字头＋古＝苦，辛苦的苦"
    },
    {
      "base": "勺",
      "radical": "钅",
      "right": "钓",
      "word": "钓鱼",
      "wrong": ["的", "勾", "句"],
      "src": "〔原题·老师批改版02〕",
      "explain": "金字旁＋勺＝钓，钓鱼的钓"
    },
    {
      "base": "勺",
      "radical": "纟",
      "right": "约",
      "word": "大约",
      "wrong": ["的", "勾", "钓"],
      "src": "〔原题·老师批改版02〕",
      "explain": "绞丝旁＋勺＝约，大约的约（卷面上老师给的两个答案之一）"
    },
    {
      "base": "丁",
      "radical": "讠",
      "right": "订",
      "word": "订正",
      "wrong": ["打", "盯", "钉"],
      "src": "〔原题·老师批改版02〕",
      "explain": "言字旁＋丁＝订，订正的订"
    },
    {
      "base": "立",
      "radical": "亻",
      "right": "位",
      "word": "座位",
      "wrong": ["泣", "拉", "站"],
      "src": "〔原题·老师批改版02〕",
      "explain": "单人旁＋立＝位，座位的位"
    },
    {
      "base": "见",
      "radical": "王",
      "right": "现",
      "word": "现在",
      "wrong": ["视", "规", "览"],
      "src": "〔原题·老师批改版02〕",
      "explain": "王字旁＋见＝现，现在的现"
    },
    {
      "base": "分",
      "radical": "纟",
      "right": "纷",
      "word": "纷纷",
      "wrong": ["份", "粉", "芬"],
      "src": "〔原题·老师批改版02〕",
      "explain": "绞丝旁＋分＝纷，纷纷的纷。注意别写成月份的\"份\"（单人旁）——老师红线：月份是亻+分，纷纷是纟+分"
    }
  ],
  /* 圈出加点字正确读音：{ sent, target, right, wrong:[拼音] } */
  DUYIN:   [
    {
      "sent": "洪水淹（没）了田地。",
      "target": "没",
      "right": "mò",
      "wrong": [
        "méi"
      ],
      "src": "我是什么",
      "explain": "淹没的\"没\"读 mò"
    },
    {
      "sent": "妈妈在（教）我认字。",
      "target": "教",
      "right": "jiāo",
      "wrong": [
        "jiào"
      ],
      "src": "小蝌蚪找妈妈",
      "explain": "教别人本领读 jiāo"
    },
    {
      "sent": "（阿）姨给我买了糖。",
      "target": "阿",
      "right": "ā",
      "wrong": [
        "ē"
      ],
      "src": "小蝌蚪找妈妈",
      "explain": "阿姨的\"阿\"读 ā"
    },
    {
      "sent": "四海（为）家，就是到处都可以安家。",
      "target": "为",
      "right": "wéi",
      "wrong": [
        "wèi"
      ],
      "src": "植物妈妈有办法",
      "explain": "四海为家读 wéi"
    },
    {
      "sent": "门锁坏了，我们（得）找人来修。",
      "target": "得",
      "right": "děi",
      "wrong": [
        "dé",
        "de"
      ],
      "src": "植物妈妈有办法",
      "explain": "表示\"必须\"读 děi"
    },
    {
      "sent": "小小的蝌蚪（长）大了。",
      "target": "长",
      "right": "zhǎng",
      "wrong": [
        "cháng"
      ],
      "src": "小蝌蚪找妈妈",
      "explain": "长大读 zhǎng"
    },
    {
      "sent": "妈妈（穿）着围裙在做饭。",
      "target": "着",
      "right": "zhe",
      "wrong": [
        "zháo",
        "zhuó"
      ],
      "src": "我是什么",
      "explain": "表示动作正在做，读轻声 zhe"
    },
    {
      "sent": "小船在水面上（漂）浮着。",
      "target": "漂",
      "right": "piāo",
      "wrong": [
        "piào",
        "piǎo"
      ],
      "src": "我是什么",
      "explain": "漂浮读 piāo"
    },
    {
      "sent": "农民伯伯在山坡上（种）葡萄。",
      "target": "种",
      "right": "zhòng",
      "wrong": [
        "zhǒng"
      ],
      "src": "葡萄沟",
      "explain": "种葡萄是动作，读 zhòng"
    },
    {
      "sent": "阿姨很热（好）客，把葡萄干都端了出来。",
      "target": "好",
      "right": "hào",
      "wrong": [
        "hǎo"
      ],
      "src": "葡萄沟",
      "explain": "好客的\"好\"读 hào"
    },
    {
      "sent": "新疆的葡萄（干）又甜又香。",
      "target": "干",
      "right": "gān",
      "wrong": [
        "gàn"
      ],
      "src": "葡萄沟",
      "explain": "葡萄干读 gān"
    },
    {
      "sent": "张衡（数）星星数得入了迷。",
      "target": "数",
      "right": "shǔ",
      "wrong": [
        "shù"
      ],
      "src": "数星星的孩子",
      "explain": "数星星是动作，读 shǔ"
    },
    {
      "sent": "天上的北（斗）七星像一把勺子。",
      "target": "斗",
      "right": "dǒu",
      "wrong": [
        "dòu"
      ],
      "src": "数星星的孩子",
      "explain": "北斗星读 dǒu"
    },
    {
      "sent": "秋天，稻子晒上了（场）。",
      "target": "场",
      "right": "cháng",
      "wrong": [
        "chǎng"
      ],
      "src": "田家四季歌",
      "explain": "稻上场读 cháng"
    },
    {
      "sent": "农活都干完（了），大家笑盈盈。",
      "target": "了",
      "right": "le",
      "wrong": [
        "liǎo"
      ],
      "src": "田家四季歌",
      "explain": "句末语气\"了\"读轻声"
    }
  ],
  /* ---------- 〔原题·老师批改版03〕多音字全表（docs/content-data-yuwen.md v1.1 §10.3）
   * 考试卷格式＝多音全表注音＋逐音组词（无句子语境），与上面句中单选 DUYIN 分池不混。
   * 格式由 Chief 裁定 2 批准新建；10 题读音全部逐字转录（表格实计 21 读音——文档标题写 23，
   * 差异已如实报 Chief，以逐字表格为准）。纪律：本批不挂 weak（裁定3）。 ---------- */
  DUYIN_TABLE: [
    { "zi": "教", "readings": [ { "py": "jiāo", "word": "教书" }, { "py": "jiào", "word": "教室" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "没", "readings": [ { "py": "méi", "word": "没有" }, { "py": "mò", "word": "淹没" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "种", "readings": [ { "py": "zhǒng", "word": "各种" }, { "py": "zhòng", "word": "种田" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "得", "readings": [ { "py": "dé", "word": "得到" }, { "py": "děi", "word": "得亏" }, { "py": "de", "word": "觉得" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "干", "readings": [ { "py": "gān", "word": "干净" }, { "py": "gàn", "word": "干活" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "转", "readings": [ { "py": "zhuàn", "word": "转盘" }, { "py": "zhuǎn", "word": "转弯" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "好", "readings": [ { "py": "hǎo", "word": "好人" }, { "py": "hào", "word": "好客" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "场", "readings": [ { "py": "chǎng", "word": "场地" }, { "py": "cháng", "word": "场院" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "都", "readings": [ { "py": "dōu", "word": "全都" }, { "py": "dū", "word": "都市" } ], "src": "〔原题·老师批改版03〕" },
    { "zi": "分", "readings": [ { "py": "fēn", "word": "分开" }, { "py": "fèn", "word": "水分" } ], "src": "〔原题·老师批改版03〕" }
  ],
  /* ---------- 〔原题·老师批改版03〕比喻句分析 4 题＋开放写句 2 题（§10.4，新题型 SIMILE，
   * banks 实测原"比作"=0/"simile"=0 确证空白；四题答案唯一＝红笔判分基线；
   * 卷面"五、写两句比喻句"为空白（学生任务）——只建题面＋checklist，不得由空白作任何孩子侧推断。
   * 干扰喻体取自本池其他答案（封闭池自足，不编造）。 ---------- */
  SIMILE: [
    { "tenor": "柿子", "a": "小灯笼", "src": "〔原题·老师批改版03〕", "explain": "柿子圆圆的、红红的，挂在树上像一盏盏小灯笼" },
    { "tenor": "油菜花", "a": "海洋", "src": "〔原题·老师批改版03〕", "explain": "大片金黄的油菜花，风一吹像金色的海洋" },
    { "tenor": "小河", "a": "带子", "src": "〔原题·老师批改版03〕", "explain": "小河长长的、亮亮的，像一条透明的带子" },
    { "tenor": "桃花", "a": "笑脸", "src": "〔原题·老师批改版03〕", "explain": "粉粉的桃花一朵朵开，像小朋友的笑脸" }
  ],
  SIMILE_OPEN: [
    {
      "desc": "写两句比喻句：可以写你看到的东西（天上的、公园里的、家里的都行），用上\"像\"\"好像\"\"仿佛\"这样的比喻词。",
      "checklist": ["本体：你把什么东西拿来打比方？", "喻体：它像什么？", "比喻词：用了\"像/好像/仿佛\"吗？", "三样各有一个就算达标（例：弯弯的月亮像小船）"],
      "src": "〔原题·老师批改版03·五（空白模板＝学生任务，不作诊断）〕",
      "explain": "好例子（课本《日月潭》）：北边像圆圆的太阳，叫日潭；南边像弯弯的月亮，叫月潭。"
    },
    {
      "desc": "再写一句比喻句，写一个和上一句不一样的东西。",
      "checklist": ["本体＋喻体＋比喻词各一", "和第一句不重复"],
      "src": "〔原题·老师批改版03·五（空白模板＝学生任务，不作诊断）〕",
      "explain": "比喻句就是\"把 A 比作 B\"，B 要和 A 有相似的地方（形状、颜色、感觉）。"
    }
  ],
  /* ---------- 老师红笔原话＝全班规范清单（§10.5，进讲解不进弱点） ---------- */
  YICUO: [
    { "ci": "月份", "tip": "注意不能写\"月分\"！月份是单人旁（亻＋分），分数才是分。", "src": "〔老师批改版02·红笔原话〕" },
    { "ci": "云朵", "tip": "若写云朵，注意\"朵\"没有钩！上面是\"几\"，下面是\"木\"，木的竖不带钩。", "src": "〔老师批改版02·红笔原话〕" }
  ],
  /* 圈出正确汉字（形近字）：{ sent 含（ ）, right, wrong[] } */
  HUANZI:   [
    {
      "sent": "我看见了小兔子红红的眼（ ）。",
      "right": "睛",
      "wrong": [
        "晴",
        "清",
        "请"
      ],
      "src": "小蝌蚪找妈妈",
      "why": "眼睛是目字旁，眼睛才用\"睛\""
    },
    {
      "sent": "（ ）个小朋友在唱歌？",
      "right": "哪",
      "wrong": [
        "那",
        "啊"
      ],
      "src": "小蝌蚪找妈妈",
      "why": "问\"哪个\"用口字旁的\"哪\""
    },
    {
      "sent": "黄山仙桃石落在山（ ）的石盘上。",
      "right": "顶",
      "wrong": [
        "领",
        "项"
      ],
      "src": "黄山奇石",
      "why": "山顶的\"顶\"是页字旁"
    },
    {
      "sent": "（ ）是我的妈妈，她很温柔。",
      "right": "她",
      "wrong": [
        "他",
        "它"
      ],
      "src": "我的家人/日常",
      "why": "女生用女字旁的\"她\""
    },
    {
      "sent": "松（ ）四季披绿装。",
      "right": "柏",
      "wrong": [
        "拍",
        "白"
      ],
      "src": "树之歌",
      "why": "松柏是树，用木字旁的\"柏\""
    },
    {
      "sent": "（ ）天晚上，我写完作业就睡觉了。",
      "right": "昨",
      "wrong": [
        "作",
        "做"
      ],
      "src": "日常",
      "why": "昨天用日字旁的\"昨\""
    },
    {
      "sent": "（ ）晚，太阳下山了。",
      "right": "傍",
      "wrong": [
        "旁",
        "榜"
      ],
      "src": "我是什么",
      "why": "傍晚用亻的\"傍\""
    },
    {
      "sent": "我们上二（ ）了。",
      "right": "级",
      "wrong": [
        "极",
        "急"
      ],
      "src": "日常",
      "why": "年级用纟的\"级\""
    },
    {
      "sent": "海（ ）面上漂着小船。",
      "right": "洋",
      "wrong": [
        "样",
        "羊"
      ],
      "src": "日常",
      "why": "海洋用三点水的\"洋\""
    },
    {
      "sent": "小青蛙（ ）得真高。",
      "right": "跳",
      "wrong": [
        "挑",
        "桃"
      ],
      "src": "日常",
      "why": "跳用足字旁的\"跳\""
    },
    {
      "sent": "春天来了，梧（ ）树开花了。",
      "right": "桐",
      "wrong": [
        "铜",
        "同"
      ],
      "src": "树之歌",
      "why": "梧桐是树，用木字旁的\"桐\""
    },
    {
      "sent": "日月潭里有一个美丽的小（ ）。",
      "right": "岛",
      "wrong": [
        "鸟"
      ],
      "src": "日月潭",
      "why": "小岛底下有\"山\""
    },
    {
      "sent": "（ ）鱼要安静，不能吵。",
      "right": "钓",
      "wrong": [
        "约"
      ],
      "src": "小儿垂钓",
      "why": "钓鱼用金字旁的\"钓\""
    },
    {
      "sent": "山坡上，松树像（ ）上了绿装。",
      "right": "披",
      "wrong": [
        "坡",
        "波"
      ],
      "src": "树之歌",
      "why": "披衣服用扌的\"披\""
    },
    {
      "sent": "小树（ ）上开满了花。",
      "right": "枝",
      "wrong": [
        "支",
        "只"
      ],
      "src": "日常",
      "why": "树枝用木字旁的\"枝\""
    }
  ],
  /* 课文内容判断：{ text, ok:true/false, why, src } */
  PANDUAN:   [
    {
      "text": "小蝌蚪先长后腿，再长前腿。",
      "ok": true,
      "why": "课文里小蝌蚪先长出两条后腿，再长出两条前腿，尾巴才慢慢变短。",
      "src": "小蝌蚪找妈妈"
    },
    {
      "text": "小蝌蚪找妈妈时，最先遇到的是乌龟。",
      "ok": false,
      "why": "最先遇到的是鲤鱼（阿姨），后来才遇到乌龟。",
      "src": "小蝌蚪找妈妈"
    },
    {
      "text": "小蝌蚪变成青蛙以后，尾巴变得越来越长。",
      "ok": false,
      "why": "尾巴是越变越短，最后收起来了。",
      "src": "小蝌蚪找妈妈"
    },
    {
      "text": "\"我\"会变成汽、云、雨、雹子和雪。",
      "ok": true,
      "why": "水在不同条件下变成汽、云、雨、雹子、雪。",
      "src": "我是什么"
    },
    {
      "text": "我在小溪里睡觉，在池子里散步。",
      "ok": false,
      "why": "说反了：在池子里睡觉，在小溪里散步。",
      "src": "我是什么"
    },
    {
      "text": "有时候\"我\"很温和，有时候\"我\"很暴躁。",
      "ok": true,
      "why": "温和时做过许多好事，暴躁时做过许多坏事。",
      "src": "我是什么"
    },
    {
      "text": "蒲公英妈妈给孩子准备了降落伞，风一吹孩子们就纷纷出发。",
      "ok": true,
      "why": "只要有风轻轻吹过，孩子们就乘着风纷纷出发。",
      "src": "植物妈妈有办法"
    },
    {
      "text": "苍耳妈妈靠风把种子送到远方。",
      "ok": false,
      "why": "苍耳靠带刺的铠甲挂住动物的皮毛，让动物帮着带走。",
      "src": "植物妈妈有办法"
    },
    {
      "text": "豌豆妈妈让豆荚晒在太阳底下，啪的一声炸开，孩子们蹦着跳着离开妈妈。",
      "ok": true,
      "why": "豆荚晒得炸开，孩子们就跳出去旅行了。",
      "src": "植物妈妈有办法"
    },
    {
      "text": "数星星的孩子是张衡，后来成了著名的天文学家。",
      "ok": true,
      "why": "他从小爱数星星，后来成了天文学家。",
      "src": "数星星的孩子"
    },
    {
      "text": "北斗七星连起来像一把镰刀。",
      "ok": false,
      "why": "北斗七星连起来像一把勺子。",
      "src": "数星星的孩子"
    },
    {
      "text": "北极星绕着北斗七星转。",
      "ok": false,
      "why": "是北斗七星绕着北极星转。",
      "src": "数星星的孩子"
    },
    {
      "text": "\"仙桃石\"好像从天上飞下来的一个大桃子，落在山顶的石盘上。",
      "ok": true,
      "why": "课文就是这样写仙桃石的。",
      "src": "黄山奇石"
    },
    {
      "text": "黄山风景区在我国江西省南部。",
      "ok": false,
      "why": "黄山在安徽省南部。",
      "src": "黄山奇石"
    },
    {
      "text": "太阳升起时，几块巨石像金光闪闪的雄鸡，对着天都峰啼叫，这就是\"金鸡叫天都\"。",
      "ok": true,
      "why": "课文写太阳一升起来，巨石就变成\"雄鸡\"啼叫。",
      "src": "黄山奇石"
    },
    {
      "text": "日月潭是我国台湾省最大的一个湖。",
      "ok": true,
      "why": "课文第一段明说日月潭是台湾最大的湖。",
      "src": "日月潭"
    },
    {
      "text": "中午太阳高照，日月潭周围的景物一片朦胧。",
      "ok": false,
      "why": "中午看得很清晰；下起蒙蒙细雨、披上轻纱时才朦胧。",
      "src": "日月潭"
    },
    {
      "text": "清晨，湖面上飘着薄薄的雾，晨星和灯光隐隐约约地倒映在湖水里。",
      "ok": true,
      "why": "课文写清晨的日月潭像蒙着薄薄的面纱。",
      "src": "日月潭"
    },
    {
      "text": "葡萄种在山坡的梯田上。",
      "ok": true,
      "why": "山坡的梯田最适合种葡萄。",
      "src": "葡萄沟"
    },
    {
      "text": "葡萄有红的、白的、紫的、金的、淡绿的，五光十色。",
      "ok": false,
      "why": "原文是\"暗红的\"，没有\"金的\"。",
      "src": "葡萄沟"
    },
    {
      "text": "新疆的葡萄干是直接在太阳底下晒干的。",
      "ok": false,
      "why": "葡萄干挂在晾房里，用热空气把水分蒸发掉才变成干。",
      "src": "葡萄沟"
    }
  ],
  /* 照样子写句子（选择式）：{ example, right, wrong[] } */
  ZHAOYANG:   [
    {
      "example": "弯弯的月儿小小的船。",
      "right": "红红的太阳圆圆的脸。",
      "wrong": [
        "红红太阳圆圆脸。",
        "太阳红红的圆圆的。",
        "红红的太阳圆的脸。"
      ],
      "src": "语文园地·句式仿写",
      "explain": "像\"弯弯的月儿\"这样，用\"XX的+名词\"叠起来说"
    },
    {
      "example": "公园里的花开了，有红的、有白的。",
      "right": "果园里的葡萄熟了，有紫的、有绿的。",
      "wrong": [
        "果园里的葡萄熟了，有紫色的。",
        "葡萄果园里的熟了，有紫有绿。",
        "果园里葡萄熟，紫色和绿色。"
      ],
      "src": "葡萄沟",
      "explain": "先说哪里、什么怎么样，再\"有…的、有…的\"举两种颜色"
    },
    {
      "example": "小明和小红在操场上跑步。",
      "right": "奶奶和我在阳台上浇花。",
      "wrong": [
        "奶奶和我在阳台浇花在。",
        "我和奶奶阳台上的花浇水。",
        "阳台上奶奶和我花浇了。"
      ],
      "src": "日常",
      "explain": "谁和谁＋在哪里＋做什么，顺序不能乱"
    },
    {
      "example": "天上的云朵像棉花糖。",
      "right": "田里的麦苗像绿色的地毯。",
      "wrong": [
        "田里的麦苗像绿色的。",
        "田里的麦苗像地毯一样绿。",
        "麦苗田里像绿色的地毯铺。"
      ],
      "src": "日常·比喻",
      "explain": "像…要把\"像什么\"说完整"
    },
    {
      "example": "天气冷了，我们就穿上厚棉衣。",
      "right": "下雨了，我们就带上小伞。",
      "wrong": [
        "下雨了，我们就带伞下雨。",
        "天气下雨了，我们带伞就。",
        "下雨我们就带了。"
      ],
      "src": "日常",
      "explain": "\"…了，我们就…\"先原因后结果"
    },
    {
      "example": "孔雀锦鸡是伙伴。",
      "right": "蜜蜂蝴蝶是朋友。",
      "wrong": [
        "蜜蜂和蝴蝶朋友是。",
        "孔雀和锦鸡伙伴是的。",
        "蜜蜂蝴蝶是朋友的们。"
      ],
      "src": "拍手歌",
      "explain": "A 和 B 是…，主谓要顺"
    }
  ],
  /* 课内阅读：{ src, passage, q, a, wrong[] } */
  KEWEN_READ:   [
    {
      "src": "小蝌蚪找妈妈",
      "passage": "池塘里有一群小蝌蚪，大大的脑袋，黑灰色的身子，甩着长长的尾巴，快活地游来游去。",
      "q": "小蝌蚪的身子是什么颜色的？",
      "a": "黑灰色",
      "wrong": [
        "黑蓝色",
        "黑褐色",
        "深绿色"
      ],
      "doubt": true
    },
    {
      "src": "小蝌蚪找妈妈",
      "passage": "池塘里有一群小蝌蚪，大大的脑袋，黑灰色的身子，甩着长长的尾巴，快活地游来游去。",
      "q": "小蝌蚪靠什么在水里游？",
      "a": "甩着长长的尾巴",
      "wrong": [
        "四条腿",
        "一对翅膀",
        "两只前腿"
      ],
      "doubt": true
    },
    {
      "src": "我是什么",
      "passage": "有时候我穿着白衣服，有时候我穿着黑衣服，早晨和傍晚我又把红袍披在身上。人们管我叫\"云\"。",
      "q": "早晨和傍晚，\"我\"把什么颜色的衣服披在身上？",
      "a": "红袍",
      "wrong": [
        "白衣服",
        "黑衣服",
        "绿袍"
      ],
      "doubt": true
    },
    {
      "src": "我是什么",
      "passage": "有时候我穿着白衣服，有时候我穿着黑衣服，早晨和傍晚我又把红袍披在身上。人们管我叫\"云\"。",
      "q": "\"我\"变成云以前，先变成了什么？",
      "a": "汽",
      "wrong": [
        "雨",
        "雪",
        "冰"
      ],
      "doubt": true
    },
    {
      "src": "黄山奇石",
      "passage": "在一座陡峭的山峰上，有一只\"猴子\"。它两只胳膊抱着腿，一动不动地蹲在山头，望着翻滚的云海。",
      "q": "这只\"猴子\"在做什么？",
      "a": "抱腿蹲在山头，望着翻滚的云海",
      "wrong": [
        "在吃桃子",
        "在爬山",
        "在睡觉"
      ],
      "doubt": true
    },
    {
      "src": "黄山奇石",
      "passage": "在一座陡峭的山峰上，有一只\"猴子\"。它两只胳膊抱着腿，一动不动地蹲在山头，望着翻滚的云海。",
      "q": "这段写的是哪块奇石？",
      "a": "猴子观海",
      "wrong": [
        "仙桃石",
        "金鸡叫天都",
        "狮子抢球"
      ],
      "doubt": true
    }
  ],
  /* 课外阅读：{ passage, q, a, wrong[] } */
  KEWAI_READ:   [
    {
      "passage": "天上堆起了乌云，小蚂蚁们排着队，把一粒粒粮食搬进新家。雨点落下来的时候，蚂蚁们已经躲进了洞里，谁也淋不着。",
      "q": "小蚂蚁为什么搬家？",
      "a": "因为要下雨了",
      "wrong": [
        "因为天太热",
        "因为要过年",
        "因为它们怕太阳"
      ],
      "src": "课外阅读（ANL 原创）"
    },
    {
      "passage": "天上堆起了乌云，小蚂蚁们排着队，把一粒粒粮食搬进新家。雨点落下来的时候，蚂蚁们已经躲进了洞里，谁也淋不着。",
      "q": "蚂蚁们搬的是什么？",
      "a": "粮食",
      "wrong": [
        "树叶",
        "石头",
        "水珠"
      ],
      "src": "课外阅读（ANL 原创）"
    },
    {
      "passage": "天上堆起了乌云，小蚂蚁们排着队，把一粒粒粮食搬进新家。雨点落下来的时候，蚂蚁们已经躲进了洞里，谁也淋不着。",
      "q": "这个小故事告诉我们什么？",
      "a": "下雨前蚂蚁会搬家",
      "wrong": [
        "蚂蚁会飞",
        "蚂蚁怕水",
        "蚂蚁会唱歌"
      ],
      "src": "课外阅读（ANL 原创）"
    },
    {
      "passage": "蒲公英的种子像一把小小的降落伞。风一吹，它们就飘起来，飘到很远的地方。第二年春天，那里就长出了新的蒲公英。",
      "q": "蒲公英的种子像什么？",
      "a": "小小的降落伞",
      "wrong": [
        "小飞机",
        "小花朵",
        "小石子"
      ],
      "src": "课外阅读（ANL 原创）"
    },
    {
      "passage": "蒲公英的种子像一把小小的降落伞。风一吹，它们就飘起来，飘到很远的地方。第二年春天，那里就长出了新的蒲公英。",
      "q": "种子靠什么飞到远方？",
      "a": "风",
      "wrong": [
        "雨",
        "水",
        "小鸟"
      ],
      "src": "课外阅读（ANL 原创）"
    },
    {
      "passage": "蒲公英的种子像一把小小的降落伞。风一吹，它们就飘起来，飘到很远的地方。第二年春天，那里就长出了新的蒲公英。",
      "q": "种子落在那里，第二年春天会怎么样？",
      "a": "长出新的蒲公英",
      "wrong": [
        "开出大红花",
        "变成小树",
        "被虫子吃掉"
      ],
      "src": "课外阅读（ANL 原创）"
    }
  ],
  /* 看图写话（开放题，仅 AI 可用）：{ desc, checklist:[时间,地点,人物,心情 提示] } */
  KANSHU:   [
    {
      "desc": "星期天，小明和爸爸在公园里放风筝。草地上开着五颜六色的小花，蓝蓝的天空中飘着一只大蝴蝶风筝。",
      "checklist": [
        "时间：什么时候？星期天、早上还是下午？",
        "地点：在哪里？公园的草地上",
        "人物：谁和谁一起？小明和爸爸",
        "事情：在做什么？放风筝",
        "心情：心里怎么样？开心、高兴"
      ],
      "src": "看图写话·ANL 原创",
      "sample": "星期天，天气很好，我和爸爸去公园放风筝。草地上开着五颜六色的花，天上一只大蝴蝶风筝飞得高高的。风一吹，风筝越飞越高，我高兴得跳了起来。",
      "tips": "①开头交代时间天气（一句话）；②写清\"时间·地点·人物\"；③按顺序写事情经过（先…再…最后…）；④结尾写心情或收获。"
    },
    {
      "desc": "放学时下起了大雨，小红没有带伞，站在校门口发愁。我看见了，走过去和她合用一把伞，两个人一起往家里走。",
      "checklist": [
        "时间：什么时候？放学的时候",
        "地点：在哪里？学校门口",
        "人物：谁和谁？小红和我",
        "事情：发生了什么？下雨、借伞",
        "心情：心里怎么样？急、温暖"
      ],
      "src": "看图写话·ANL 原创",
      "sample": "放学的时候，下起了大雨。小红没有带伞，站在校门口急得直跺脚。我看见后，就和她合用一把伞一起回家。虽然我们的肩膀淋湿了，可是心里暖暖的。",
      "tips": "①开头点出时间天气（下雨）；②写清地点与人物（校门口、小红和我）；③写经过：发现没伞→一起打伞走；④结尾一句感受（暖暖的）。"
    },
    {
      "desc": "晚上吃完饭，我看见妈妈收拾碗筷很累，就主动帮妈妈洗碗。我先用清水冲一冲，再挤上洗洁精，最后用清水冲干净。",
      "checklist": [
        "时间：什么时候？晚上吃完饭",
        "地点：在哪里？家里的厨房",
        "人物：谁和谁？我和妈妈",
        "事情：做了什么？帮忙洗碗",
        "心情：心里怎么样？高兴、自豪"
      ],
      "src": "看图写话·ANL 原创",
      "sample": "晚上吃完饭，我看见妈妈很累，就帮妈妈洗碗。我先用清水把碗冲一冲，再挤上洗洁精，最后用清水冲干净。妈妈夸我长大了，我心里像吃了蜜一样甜。",
      "tips": "①开头写时间（晚上吃完饭）；②写清家里的场景和人物；③事情按\"先…再…最后…\"顺序写；④结尾写妈妈的话和自己的心情。"
    },
    /* ---------- 〔原题·写话模板〕2 条（docs/content-data-yuwen.md v1.2 §8.6，CHN-02。
     * 两页均为空白模板（Chief 像素级核验无笔迹）＝不作任何孩子诊断证据；
     * goodWords＝通用降门槛脚手架（老师固定动作：先挑 2–3 个用上再动笔）；
     * img：P1 已裁图复验通过；P2 裁图未过复验（裁中文字区）——留空等 Chief 复核坐标，宁缺勿错。
     * "踢键子"照录模板原印（非笔误），判分端键/毽双形都算命中。本批不挂 weak（裁定3）。 ---------- */
    {
      "desc": "快乐的周末，院子里暖洋洋的。老奶奶和一位男子坐在桌旁下棋，一个小女孩蹲在地上喂小鸡，一个黄衣男孩坐在小桌旁，一位紫衣女子在粉色盆上抖开一块蓝布。",
      "checklist": [
        "时间：什么时候？周末，早上还是下午？",
        "地点：在哪里？小院子里",
        "人物：图里有谁？老奶奶、男子、小女孩、黄衣男孩、紫衣女子",
        "事情：每个人在做什么？下棋、喂小鸡、坐桌旁、抖布——看图里有的写，也可以用好词里的\"浇花、洗菜\"",
        "感受：这个周末感觉怎么样？暖洋洋、其乐融融"
      ],
      "goodWords": ["小院子", "忙碌", "暖洋洋", "其乐融融", "下棋", "浇花", "洗菜", "喂鸡"],
      "tips": "第一步：先在好词里挑 2–3 个（比如\"暖洋洋＋下棋＋其乐融融\"），再按四步从\"时间地点人物\"开头写。学过的字写汉字；不用强行写汉字，考试时能把拼音写对也很重要。格子 120 个，写满一半就合格。",
      "src": "〔原题·写话模板 P1《快乐周末》〕"
    },
    {
      "desc": "下课铃响了，操场上热闹非凡。有的同学在打乒乓球，有的在跳长绳，有的在踢毽子，有的在跑步，大家玩得满头大汗，到处都是欢声笑语。",
      "checklist": [
        "时间：什么时候？下课/课外活动时间，听到铃声之后",
        "地点：在哪里？操场上",
        "人物：同学们，图里有 12 个孩子",
        "事情：大家在做什么？打乒乓球、跳长绳、踢毽子、跑步——挑 2–3 件写具体",
        "感受：心情怎么样？开心、热闹非凡"
      ],
      "goodWords": ["铃声", "热闹非凡", "欢声笑语", "跳绳", "踢键子", "打乒乓球", "满头大汗"],
      "tips": "第一步：先在好词里挑 2–3 个再动笔。（好词表照录模板原印\"踢键子\"——正确字形是\"踢毽子\"毛字旁，教学时口头纠正即可；判分键/毽都算对。）学过的字写汉字；不用强行写汉字，考试时能把拼音写对也很重要。",
      "src": "〔原题·写话模板 P2《有趣的课外活动》〕"
    }
  ],
  /* ===== 英语精准化：四个新题型数据槽（Chief 2026-10-31 预建单 §2）=====
   * 空数组 => 题型自动隐藏（typeHasData 门控），不会空转。任意条目带 weak:true 时抽题权重 ×2。
   *
   * EN_SORT  分类归桶（点选式：点词→点桶，不做真拖拽）
   *   { title:'Add -s / Add -es', groups:[{name:'Add -s', words:['cats','dogs','books']},
   *                                      {name:'Add -es', words:['boxes','buses','dishes']}],
   *     items:['cats','boxes','dogs','buses','books','dishes'],   // 本轮要归桶的词（缺省时拼 groups 全部词）
   *     src:'HWB p.13' }
   * EN_MATCH 配对（点选式：点左→点右；全对才计分）
   *   { title:'Word ↔ Meaning', left:['munch','bellowed',...], right:['to chew loudly',...],
   *     pairs:[[0,0],[1,1],...], src:'HWB p.13' }
   * EN_ORDER 事件排序（点号排序）
   *   { title:'How to wash your hands', pool:['Turn on the water','Put soap','Rub hands','Dry hands'],
   *     seq:[0,1,2,3], src:'...' }          // pool 顺序即正确顺序；出题时会打乱
   * EN_FILL  词形填空（-ed/-ing/去 e）
   *   { base:'dance', blank:'I like ___ (dance).', answers:['dancing'], rule:'以 e 结尾，去 e 加 -ing',
   *     wrong:['danceing','dances','danced'], src:'...' }
   */
  EN_SORT:   [
    {
      "title": "Plural Nouns: Add -s or -es (review p.7)",
      "src": "〔原题·复习卷 p.7〕",
      "groups": [
        {
          "name": "Add -s",
          "words": [
            "dinosaur",
            "frog",
            "pencil"
          ]
        },
        {
          "name": "Add -es",
          "words": [
            "dish",
            "class",
            "sandwich"
          ]
        }
      ],
      "items": [
        "dinosaur",
        "frog",
        "pencil",
        "dish",
        "class",
        "sandwich"
      ],
      "rule": "词尾是 sh/ss/ch 的加 -es，其余直接加 -s"
    },
    {
      "title": "Plural Nouns: -s or -es (HWB p.17)",
      "src": "〔原题·HWB p.17〕",
      "groups": [
        {
          "name": "Add -s",
          "words": [
            "chair",
            "shoe"
          ]
        },
        {
          "name": "Add -es",
          "words": [
            "glass",
            "box",
            "bus"
          ]
        }
      ],
      "items": [
        "chair",
        "shoe",
        "glass",
        "box",
        "bus"
      ],
      "rule": "以 -ch, -s, -sh, -ss, x, z 结尾加 -es；其余加 -s"
    },
    {
      "title": "Adjectives: Sort by Group (HWB p.12)",
      "src": "〔原题·HWB p.12〕",
      "groups": [
        {
          "name": "People",
          "words": [
            "beautiful",
            "clumsy",
            "helpful"
          ]
        },
        {
          "name": "Objects",
          "words": [
            "filthy",
            "gleaming",
            "strange"
          ]
        },
        {
          "name": "Comfortable Feelings",
          "words": [
            "brave",
            "calm",
            "eager"
          ]
        },
        {
          "name": "Uncomfortable Feelings",
          "words": [
            "angry",
            "anxious",
            "bored"
          ]
        },
        {
          "name": "Size",
          "words": [
            "gigantic",
            "tiny",
            "huge"
          ]
        },
        {
          "name": "Time",
          "words": [
            "ancient",
            "brief",
            "early"
          ]
        }
      ],
      "items": [
        "beautiful",
        "filthy",
        "brave",
        "angry",
        "gigantic",
        "brief"
      ],
      "rule": "形容词按类别分：人 / 物 / 舒服的感受 / 难受的感受 / 大小 / 时间"
    }
  ],
  EN_MATCH:   [
    {
      "title": "Word ↔ Meaning (HWB p.13)",
      "src": "〔原题·HWB p.13〕",
      "left": [
        "munch",
        "bounce",
        "rough",
        "bellow",
        "cool",
        "might",
        "grin",
        "handle"
      ],
      "right": [
        "to chew loudly",
        "to move up and down after hitting something",
        "not gentle",
        "to shout in a loud, deep voice",
        "to calm down",
        "power",
        "to smile widely",
        "able to deal with something"
      ],
      "pairs": [
        [
          0,
          0
        ],
        [
          1,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          3
        ],
        [
          4,
          4
        ],
        [
          5,
          5
        ],
        [
          6,
          6
        ],
        [
          7,
          7
        ]
      ]
    },
    {
      "title": "Adjectives: Basic Word → Better Word (HWB p.13)",
      "src": "〔原题·HWB p.13〕",
      "left": [
        "smart",
        "good",
        "mad",
        "pretty",
        "nice",
        "cold",
        "big",
        "happy"
      ],
      "right": [
        "talented",
        "brilliant",
        "grumpy",
        "beautiful",
        "cheery",
        "frozen",
        "gigantic",
        "excited"
      ],
      "pairs": [
        [
          0,
          0
        ],
        [
          1,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          3
        ],
        [
          4,
          4
        ],
        [
          5,
          5
        ],
        [
          6,
          6
        ],
        [
          7,
          7
        ]
      ]
    }
  ],
  EN_ORDER:   [
    {
      "title": "Mr. Kelly's Day (Clark HWB p.6)",
      "src": "〔原题·Clark HWB p.6·存疑：孩子 bakes 填 1 但老师给 8/8〕",
      "doubt": true,
      "pool": [
        "Mr. Kelly buys ingredients.",
        "Mr. Kelly bakes the cake.",
        "Mr. Kelly eats the whole cake.",
        "Mr. Kelly feels sick."
      ],
      "seq": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "title": "Ms. Brenna's Morning (Clark HWB p.6)",
      "src": "〔原题·Clark HWB p.6〕",
      "pool": [
        "Ms. Brenna wakes up.",
        "Ms. Brenna gets dressed.",
        "Ms. Brenna walks to school.",
        "Ms. Brenna says, \"Good Morning, class!\""
      ],
      "seq": [
        0,
        1,
        2,
        3
      ]
    }
  ],
  EN_FILL:   [
    {
      "base": "dance",
      "blank": "Look! The children are ___ in the classroom!",
      "answers": [
        "dancing"
      ],
      "rule": "去 e 加 -ing",
      "wrong": [
        "danceing",
        "danced",
        "dances"
      ],
      "src": "〔原题·复习卷图6〕"
    },
    {
      "base": "paint",
      "blank": "We ___ a picture last night.",
      "answers": [
        "painted"
      ],
      "rule": "过去时加 -ed",
      "wrong": [
        "painting",
        "paint",
        "paints"
      ],
      "src": "〔原题·复习卷图6〕"
    },
    {
      "base": "jump",
      "blank": "Yesterday, I ___ on the bed with my friends.",
      "answers": [
        "jumped"
      ],
      "rule": "过去时加 -ed",
      "wrong": [
        "jumping",
        "jump",
        "jumps"
      ],
      "src": "〔原题·复习卷图6〕"
    },
    {
      "base": "wash",
      "blank": "Right now, dad is ___ the car.",
      "answers": [
        "washing"
      ],
      "rule": "现在进行时 be + -ing",
      "wrong": [
        "washed",
        "wash",
        "washes"
      ],
      "src": "〔原题·复习卷图6〕"
    },
    {
      "base": "fox",
      "blank": "I saw three ___ in the forest.",
      "answers": [
        "foxes"
      ],
      "rule": "-x 结尾加 -es",
      "wrong": [
        "foxs",
        "foxes'",
        "fox"
      ],
      "src": "〔原题·HWB p.17〕",
      "weak": true
    },
    {
      "base": "dog",
      "blank": "The ___ are playing in the park.",
      "answers": [
        "dogs"
      ],
      "rule": "一般加 -s",
      "wrong": [
        "doges",
        "dog",
        "dogs'"
      ],
      "src": "〔原题·HWB p.17〕"
    },
    {
      "base": "dress",
      "blank": "My mom bought two ___ for my sister.",
      "answers": [
        "dresses"
      ],
      "rule": "-ss 加 -es",
      "wrong": [
        "dresss",
        "dress",
        "dresseses"
      ],
      "src": "〔原题·HWB p.17〕"
    },
    {
      "base": "apple",
      "blank": "There are six ___ on the table.",
      "answers": [
        "apples"
      ],
      "rule": "数词后名词要复数",
      "wrong": [
        "apple",
        "apples'",
        "applees"
      ],
      "src": "〔原题·HWB p.17〕"
    },
    {
      "base": "smart",
      "blank": "The students are all ___ in Mr. Judkin's class.",
      "answers": [
        "talented"
      ],
      "rule": "用更高级的形容词",
      "wrong": [
        "smart",
        "talent",
        "talents"
      ],
      "hint": "smart → ?",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "base": "happy",
      "blank": "Mr. Jaycob was ___ when he won.",
      "answers": [
        "excited"
      ],
      "rule": "-ed 形容词修饰人的感受",
      "wrong": [
        "excitable",
        "exciting",
        "excite"
      ],
      "hint": "happy → ?",
      "src": "〔原题·HWB p.13·W-11 弱点〕",
      "weak": true
    },
    {
      "base": "big",
      "blank": "Mr. Chris has a ___ stack of HWBs.",
      "answers": [
        "gigantic"
      ],
      "rule": "用更高级的形容词",
      "wrong": [
        "gigantics",
        "gigant",
        "gigantical"
      ],
      "hint": "big → ?",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "base": "cold",
      "blank": "Ms. Court's coffee became ___ .",
      "answers": [
        "frozen"
      ],
      "rule": "用更高级的形容词",
      "wrong": [
        "freezed",
        "freezingly",
        "forzen"
      ],
      "hint": "cold → ?",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "base": "pretty",
      "blank": "Ms. Brenna always wears ___ dresses.",
      "answers": [
        "beautiful"
      ],
      "rule": "用更高级的形容词",
      "wrong": [
        "beautifully",
        "beauty",
        "beautys"
      ],
      "hint": "pretty → ?",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "base": "mad",
      "blank": "He was ___ when he lost his pencil.",
      "answers": [
        "grumpy"
      ],
      "rule": "用更高级的形容词",
      "wrong": [
        "grump",
        "grumpily",
        "grumpness"
      ],
      "hint": "mad → ?",
      "src": "〔原题·HWB p.13〕"
    },
    {
      "base": "nice",
      "blank": "It is a ___ day to play football.",
      "answers": [
        "cheery"
      ],
      "rule": "用更高级的形容词",
      "wrong": [
        "cheerfal",
        "cheer",
        "cheering"
      ],
      "hint": "nice → ?",
      "src": "〔原题·HWB p.13〕"
    }
  ],

  /* 英语写作（开放题，仅 AI 可用）：{ prompt, checklist[] } */
  WRITING:   [
    {
      "prompt": "Personal Narrative (choose one): A day I felt proud of myself / A time I worked hard on a project / A time someone helped me / A time I helped my family / A time I made a new friend / A special day I will never forget. Write a true story about you: start with a title, then a topic sentence, at least 8 sentences with details, and a concluding sentence that shows how you felt.",
      "checklist": [
        "at least 8 sentences",
        "a title",
        "a topic sentence",
        "a concluding sentence",
        "indented paragraphs",
        "at least 4 adjectives/adverbs/figurative phrases",
        "grade 1-2 grammar and punctuation"
      ],
      /* ENG-ET-22＋§19①（2026-11-05 老师来信＋手抄页，证据等级①）：老师点名七条评分主轴。
       * 〔数据注释·不进孩子可见文案〕复习卷 midterm-review-packet-part2.md:165/:175 写 "at least 6 / more than six"，
       * 与手抄页 8 冲突 → Chief 2026-11-05 裁定按老师材料 8 执行，孩子侧只说 8，"6 句"字样禁止出现在任何 UI。
       * 渲染事实源＝config.js cfg.writing（题干/清单/AI 判据一律读那里）；本卡是 Researcher 供稿的数据落点，两处不一致时以 cfg 为准。
       * 老师明确：cheat sheet 考试不能带 → 本页数据只作讲解与出题依据，应用中不做"小抄"形态呈现。 */
      "teacherCard": [
        { "key": "focused",      "label": "Focused — tell ONE event and stay on it" },
        { "key": "personal",     "label": "Personal — share how YOU felt" },
        { "key": "true",         "label": "True — a real story with details (when, where, who, what happened)" },
        { "key": "time20",       "label": "Write the whole story in 20 minutes" },
        { "key": "transitions",  "label": "Transition words — first, then, next, finally" },
        { "key": "neatness",     "label": "Neatness — clean writing, capitals, spacing" },
        { "key": "pastTense",    "label": "Past tense — tell a finished story in the past" }
      ],
      "sentencesMin": 8,
      /* ENG-ET-17：Author's Purpose（PIE）答题骨架——老师原版三行（§19③/⑥，逐字 "I chose / Because / For example"） */
      "answerFrames": {
        "authorsPurpose": ["1. I chose ___", "2. Because ___", "3. For example, ___"]
      },
      /* ENG-ET-21：figurative language 判据素材（"some figurative language" 一项的讲解依据）。
       * 例句＝手抄页逐字原句；定义措辞为教学自拟（老师定义逐字文案待 Chief 读图件补，不冒充原话）。 */
      "figurative": [
        { "type": "personification", "example": "The wind whistled and the leaves danced.", "zh": "拟人：把事物当人来写" },
        { "type": "onomatopoeia", "example": "Bang! Crash! Roar!", "zh": "拟声：词读出来就像那个声音" },
        { "type": "alliteration", "example": "She sells seashells by the seashore.", "zh": "头韵：一连串词开头读音相同" }
      ],
      "topics": [
        "A day I felt proud of myself",
        "A time I worked hard on a project",
        "A time someone helped me",
        "A time I helped my family",
        "A time I made a new friend",
        "A special day I will never forget"
      ],
      "organizer": {
        "main": "Main Idea",
        "details": [
          "Detail 1",
          "Detail 2",
          "Detail 3"
        ],
        "concluding": "Concluding Sentence"
      },
      "editingMarks": [
        "FIX SPELLING",
        "ADD",
        "REMOVE",
        "ADD PUNCTUATION",
        "CAPITALIZE",
        "LOWER-CASE",
        "INDENT"
      ],
      "src": "〔原题·复习卷 p.8-10 / HWB p.12 / WWB p.4-13〕"
    }
  ],

  /* ============================================================
   * Science（11-10，第四科 🧪）：U1 Work Like a Scientist / U3 All About Animals
   * 12 条种子题（简报 §4），全选择；题面中英双行，讲解中文+生活例子
   * ============================================================ */
  SCIENCE: [
/* SCI-DB-01 GENERATED (unit1b) — 不要手改本区块，改数据请改 sci01-unit1b-extract.json 后重跑本脚本 */
    {"type":"sci_observe","u":"u1","qEn":"In the Scientific Method, which step comes right after “Ask a Question”?","a":"Research your Topic","wrong":["State your Hypothesis","Test your Hypothesis","Report your Results"],"why_en":"The Scientific Method page lists “2. Research your Topic” right after “1. Ask a Question”.","topicTag":"sci_observe","src":"sss:unit1-08.md#steps-1-2","sssId":"SCI-U1-008","evidence":"2. Research your","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In the Scientific Method, which step comes right after “Research your Topic”?","a":"State your Hypothesis","wrong":["Analyze your Data","Ask a Question","Report your Results"],"why_en":"Step 3 on the Scientific Method page is “State your Hypothesis”, right after step 2 Research.","topicTag":"sci_observe","src":"sss:unit1-08.md#steps-3","sssId":"SCI-U1-009","evidence":"3. State your","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In the Scientific Method, which step comes right after “State your Hypothesis”?","a":"Test your Hypothesis","wrong":["Report your Results","Research your Topic","Analyze your Data"],"why_en":"Step 4 on the page is “Test your Hypothesis” — after you state it, you test it.","topicTag":"sci_observe","src":"sss:unit1-08.md#steps-4","sssId":"SCI-U1-010","evidence":"4. Test your","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In the Scientific Method, which step comes right after “Test your Hypothesis”?","a":"Analyze your Data","wrong":["Ask a Question","State your Hypothesis","Report your Results"],"why_en":"Step 5 on the page is “Analyze your Data”, coming after the test.","topicTag":"sci_observe","src":"sss:unit1-08.md#steps-5","sssId":"SCI-U1-011","evidence":"5. Analyze","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In the Scientific Method, which step comes last, right after “Analyze your Data”?","a":"Report your Results","wrong":["Ask a Question","Research your Topic","Test your Hypothesis"],"why_en":"The sixth and final step on the page is “Report your Results”.","topicTag":"sci_observe","src":"sss:unit1-08.md#steps-6","sssId":"SCI-U1-012","evidence":"6. Report your","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In the Scientific Method, which step do you do FIRST?","a":"Ask a Question","wrong":["Analyze your Data","Report your Results","Test your Hypothesis"],"why_en":"The page numbers the steps: “1. Ask a Question” is the first step.","topicTag":"sci_observe","src":"sss:unit1-08.md#steps-1","sssId":"SCI-U1-013","evidence":"1. Ask a Question","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"On my science worksheet (egg experiment), what was the QUESTION I wrote?","a":"Which food will best prevent eggs breaking","wrong":["How long does an egg need to cook","Which egg is the heaviest","Where do chickens live"],"why_en":"My QUESTION box says: “Which food will best prevent eggs breaking.” — I was testing foods, not cooking or chickens.","topicTag":"sci_observe","src":"sss:unit1-09.md#QUESTION","sssId":"SCI-U1-014","evidence":"Which food will best prevent eggs breaking.","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"How many slices of bread did my HYPOTHESIS say would prevent the egg from breaking?","a":"8 slices","wrong":["3 slices","2 slices","1 slice"],"why_en":"My HYPOTHESIS box starts with “I think 8 slices of bread will prevent the egg from breaking”.","topicTag":"sci_observe","src":"sss:unit1-09.md#HYPOTHESIS","sssId":"SCI-U1-015","evidence":"I think 8 slices","dubious":true,"baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Which thing did I write in my MATERIALS box for the egg experiment?","a":"pencil","wrong":["a spoon","a cup","tape"],"why_en":"My MATERIALS box lists “Eggs, slices of bread, pencil” — the pencil is on the list, the others are not.","topicTag":"sci_observe","src":"sss:unit1-09.md#MATERIALS","sssId":"SCI-U1-016","evidence":"Eggs, slices of bread, pencil","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In my PROCEDURE, what did I drop onto a slice of bread?","a":"an egg","wrong":["a stone","a coin","a marble"],"why_en":"My PROCEDURE starts “Drop an egg onto a slice of bread” to see if it breaks.","topicTag":"sci_observe","src":"sss:unit1-09.md#PROCEDURE","sssId":"SCI-U1-017","evidence":"Drop an egg","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"My CONCLUSION said how many pieces of bread kept the egg safe?","a":"2","wrong":["1","3","8"],"why_en":"My CONCLUSION box says “I found 2 pieces bread kept the egg safe.”","topicTag":"sci_observe","src":"sss:unit1-09.md#CONCLUSION","sssId":"SCI-U1-018","evidence":"I found 2","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"One of my OBSERVATION boxes shows a happy (smiling) egg — how many slices does that box say?","a":"3 slices","wrong":["1 slice","2 slices","8 slices"],"why_en":"The middle OBSERVATION box says “3 slices”, and the drawing next to it shows the egg with a smile.","topicTag":"sci_observe","src":"sss:unit1-09.md#OBSERVATION-2","sssId":"SCI-U1-019","evidence":"3 slices","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"On my baking-soda worksheet, what was the QUESTION I wrote?","a":"Which substance will best react with baking soda","wrong":["Which liquid freezes first","Which food is the sweetest","Which cup is the tallest"],"why_en":"My QUESTION box asks which substance will best react with baking soda — lemon juice, vinegar and water were the substances I tested.","topicTag":"sci_observe","src":"sss:unit1-10.md#QUESTION","sssId":"SCI-U1-020","evidence":"best react  with","dubious":true,"baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"What did my HYPOTHESIS say would react the most with the baking soda?","a":"Vinegar","wrong":["Lemon juice","Water","Milk"],"why_en":"My HYPOTHESIS box says “I think Vinegar will react the most with the baking soda.”","topicTag":"sci_observe","src":"sss:unit1-10.md#HYPOTHESIS","sssId":"SCI-U1-021","evidence":"I think  Vinegar will","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Which liquid did I list in my MATERIALS box for the baking-soda experiment?","a":"lemon juice","wrong":["milk","honey","oil"],"why_en":"My MATERIALS box lists baking soda, lemon juice, Vinegar and water — lemon juice is on the list, milk/honey/oil are not.","topicTag":"sci_observe","src":"sss:unit1-10.md#MATERIALS","sssId":"SCI-U1-022","evidence":"baking soda , lemon juice , Vinegar","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In my PROCEDURE, what did I pour into the cup of baking soda?","a":"the lemon juice","wrong":["the water","the Vinegar","the milk"],"why_en":"My PROCEDURE says to pour the lemon juice into the cup of baking soda first, then observe the reaction.","topicTag":"sci_observe","src":"sss:unit1-10.md#PROCEDURE","sssId":"SCI-U1-023","evidence":"pour the lemon juice into the cup of baking soda.","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"In my OBSERVATION boxes, which liquid made the tall cup overflow with foam?","a":"Lemon juice","wrong":["Water","Vinegar","Soap"],"why_en":"The first OBSERVATION box is labelled Lemon juice, and its drawing shows foam overflowing the cup.","topicTag":"sci_observe","src":"sss:unit1-10.md#OBSERVATION-1","sssId":"SCI-U1-024","evidence":"Lemon juice","dubious":true,"baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"My CONCLUSION said the baking soda “goes” (reacts best) with which liquid?","a":"Lemon juice","wrong":["Water","Vinegar","Milk"],"why_en":"My CONCLUSION box says the Lemon juice lets the baking soda go — so lemon juice was the best match.","topicTag":"sci_observe","src":"sss:unit1-10.md#CONCLUSION","sssId":"SCI-U1-025","evidence":"The Lemon ju","dubious":true,"baseline":true},
/* SCI-DB-01 GENERATED (unit1) — 不要手改本区块，改数据请改 sci01-unit1-extract.json 后重跑本脚本 */
    {"type":"sci_observe","u":"u1","qEn":"Science skill: to sort into groups that are alike.","a":"Classify","wrong":["Compare","Infer","Measure"],"why_en":"The word for “to sort into groups that are alike” is Classify.","topicTag":"sci_observe","src":"sss:unit1-11.md#Classi","sssId":"SCI-U1-001","evidence":"Classify – to sort into groups that are alike.","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Science skill: do see how things are similar or different","a":"Compare","wrong":["Classify","Infer","Measure"],"why_en":"The word for “do see how things are similar or different” is Compare.","topicTag":"sci_observe","src":"sss:unit1-11.md#Compar","sssId":"SCI-U1-002","evidence":"Compare – do see how things are similar or different","dubious":true,"baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Science skill: to use what we already know to figure something out.","a":"Infer","wrong":["Classify","Compare","Measure"],"why_en":"The word for “to use what we already know to figure something out” is Infer.","topicTag":"sci_observe","src":"sss:unit1-11.md#Infer ","sssId":"SCI-U1-003","evidence":"Infer – to use what we already know to figure something","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Science skill: to find out the size, mass, or volume of something","a":"Measure","wrong":["Classify","Compare","Infer"],"why_en":"The word for “to find out the size, mass, or volume of something” is Measure.","topicTag":"sci_observe","src":"sss:unit1-11.md#Measur","sssId":"SCI-U1-004","evidence":"Measure – to find out the size, mass, or volume of","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Science skill: a smaller or simpler version of something","a":"Model","wrong":["Classify","Compare","Infer"],"why_en":"The word for “a smaller or simpler version of something” is Model.","topicTag":"sci_observe","src":"sss:unit1-11.md#Model ","sssId":"SCI-U1-005","evidence":"Model – a smaller or simpler version of something","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Science skill: to use your 5 sense to learn about something","a":"Observe","wrong":["Classify","Compare","Infer"],"why_en":"The word for “to use your 5 sense to learn about something” is Observe.","topicTag":"sci_observe","src":"sss:unit1-11.md#Observ","sssId":"SCI-U1-006","evidence":"Observe – to use your 5 sense to learn about something","baseline":true},
    {"type":"sci_observe","u":"u1","qEn":"Science skill: Make a good guess based on what you know","a":"Predict","wrong":["Classify","Compare","Infer"],"why_en":"The word for “Make a good guess based on what you know” is Predict.","topicTag":"sci_observe","src":"sss:unit1-11.md#Predic","sssId":"SCI-U1-007","evidence":"Predict – Make a good guess based on what you know","baseline":true},
/* SCI-DB-01 GENERATED (unit2) — 不要手改本区块，改数据请改 sci01-unit2-extract.json 后重跑本脚本 */
    {"type":"sci_animals","u":"u3","qEn":"Riddle: I want to feed milk to the baby animals. Where should I go? (Answer with the place name.)","a":"Mammal Land","wrong":["Amphibian Discovery","Reptile World","Aquarium"],"why_en":"Mammals feed milk to their babies, so Mammal Land is the place.","topicTag":"sci_animals","src":"sss:unit2-06.md#block2","sssId":"SCI-U2-001","evidence":"I want to feed milk to the baby animals.","baseline":true},
    {"type":"sci_animals","u":"u3","qEn":"Riddle: Where can I learn the difference between frogs and toads?","a":"Amphibian Discovery","wrong":["Mammal Land","Reptile World","Insect Town"],"why_en":"Frogs and toads are amphibians, so the place is Amphibian Discovery.","topicTag":"sci_animals","src":"sss:unit2-06.md#block3","sssId":"SCI-U2-002","evidence":"Where can I learn the","baseline":true},
    {"type":"sci_animals","u":"u3","qEn":"Riddle: Where can I see animals with scales?","a":"Reptile World","wrong":["Mammal Land","Amphibian Discovery","Aquarium"],"why_en":"Reptiles have scales, so go to Reptile World.","topicTag":"sci_animals","src":"sss:unit2-06.md#block4","sssId":"SCI-U2-003","evidence":"Where can I see animals","baseline":true},
    {"type":"sci_animals","u":"u3","qEn":"Riddle: Yo! Where are my sharks at?","a":"Aquarium","wrong":["Reptile World","Mammal Land","Insect Town"],"why_en":"Sharks live in water — you see them at an Aquarium.","topicTag":"sci_animals","src":"sss:unit2-06.md#block5","sssId":"SCI-U2-004","evidence":"Yo! Where are my sharks at?","baseline":true},
    {"type":"sci_animals","u":"u3","qEn":"Riddle: I want to see animals with six legs. Where should I go?","a":"Insect Town","wrong":["Reptile World","Amphibian Discovery","Aquarium"],"why_en":"Insects have six legs, so the place is Insect Town.","topicTag":"sci_animals","src":"sss:unit2-06.md#block6","sssId":"SCI-U2-005","evidence":"I want to see animals with six legs.","baseline":true},
/* SCI-DB-01 GENERATED (unit4) — 不要手改本区块，改数据请改 sci01-unit4-extract.json 后重跑本脚本 */
    {"type":"sci_plants","u":"u-plants","qEn":"A plant is in a sunny window and uses sunlight to make food. Which plant part is helping? Choose the best answer.","a":"leaf","wrong":["flower","stem","root"],"why_en":"Leaves use sunlight to make food for the plant.","topicTag":"sci_plants","src":"sss:unit4-04.md#3.2","sssId":"SCI-U4-001","evidence":"A plant is in a sunny window and uses sunlight to make food.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"A plant stays upright even when it is windy. Which plant part is helping? Choose the best answer.","a":"stem","wrong":["leaf","flower","root"],"why_en":"The stem holds the plant up and carries water.","topicTag":"sci_plants","src":"sss:unit4-04.md#3.3","sssId":"SCI-U4-002","evidence":"A plant stays upright even when it is windy.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"A plant takes in water from the soil. Which plant part is helping? Choose the best answer.","a":"root","wrong":["leaf","flower","stem"],"why_en":"Roots take in water from the soil.","topicTag":"sci_plants","src":"sss:unit4-04.md#3.4","sssId":"SCI-U4-003","evidence":"A plant takes in water from the soil.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"A plant makes seeds that can grow into new plants. Which plant part is helping? Choose the best answer.","a":"flower","wrong":["leaf","stem","root"],"why_en":"Flowers make seeds, and seeds can grow into new plants.","topicTag":"sci_plants","src":"sss:unit4-04.md#3.5","sssId":"SCI-U4-004","evidence":"A plant makes seeds that can grow into new plants.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"I am usually green and flat. I use sunlight to make food. I am the ______.","a":"leaf","wrong":["flower","stem","root"],"why_en":"Green flat parts that use sunlight to make food are leaves.","topicTag":"sci_plants","src":"sss:unit4-04.md#5.2","sssId":"SCI-U4-005","evidence":"I am usually green and flat. I use sunlight to","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"I am often colorful and can turn into a seed. I am the ______.","a":"flower","wrong":["leaf","stem","root"],"why_en":"Flowers are often colorful, and they turn into seeds.","topicTag":"sci_plants","src":"sss:unit4-04.md#5.3","sssId":"SCI-U4-006","evidence":"I am often colorful and can turn into a seed.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"I hold the plant up and carry water. I am the ______.","a":"stem","wrong":["leaf","flower","root"],"why_en":"The stem holds the plant up and carries water.","topicTag":"sci_plants","src":"sss:unit4-04.md#5.4","sssId":"SCI-U4-007","evidence":"I hold the plant up and carry water. I am the","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"I grow underground and take in water and nutrients. I am the ______.","a":"root","wrong":["leaf","flower","stem"],"why_en":"Roots grow underground and take in water and nutrients.","topicTag":"sci_plants","src":"sss:unit4-04.md#5.5","sssId":"SCI-U4-008","evidence":"I grow underground and take in water and nutrients.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Plant Passport — Cherry: Small stone(seed) surrounded by sweet fruit. Status: Delicious. Check to see how this seed will reach its destination.","a":"Eaten","wrong":["Wind","Water","Fur"],"why_en":"The sweet fruit gets eaten, and the seed travels away inside it.","topicTag":"sci_plants","src":"sss:unit4-05.md#Cherry","sssId":"SCI-U4-009","evidence":"Small stone(seed) surrounded","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Plant Passport — Sycamore: Light seed with 2 small wings. Status: Dizzy from spinning. Check to see how this seed will reach its destination.","a":"Wind","wrong":["Water","Eaten","Fur"],"why_en":"Light seeds with wings spin away on the wind.","topicTag":"sci_plants","src":"sss:unit4-05.md#Sycamore","sssId":"SCI-U4-010","evidence":"Light seed with 2 small wings","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Plant Passport — Coconutty: Big Heavy fruit. Status: Buoyant. Check to see how this seed will reach its destination.","a":"Water","wrong":["Wind","Eaten","Fur"],"why_en":"A buoyant (floating) fruit travels on the ocean.","topicTag":"sci_plants","src":"sss:unit4-05.md#Coconutty","sssId":"SCI-U4-011","evidence":"Name: Coconutty","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Plant Passport — Burdock: Status: Clingy. Check to see how this seed will reach its destination.","a":"Fur","wrong":["Wind","Water","Eaten"],"why_en":"Clingy burrs hook onto animal fur and ride along.","topicTag":"sci_plants","src":"sss:unit4-05.md#Burdock","sssId":"SCI-U4-012","evidence":"Name: Burdock","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Parts of a Seed — The ______ keeps the seed safe.","a":"seed coat","wrong":["root","leaves","food"],"why_en":"The seed coat covers the seed and keeps it safe.","topicTag":"sci_plants","src":"sss:unit4-06.md#sec5","sssId":"SCI-U4-013","evidence":"The ______ keeps the seed safe.","dubious":true,"baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Parts of a Seed — The ______ gives the baby plant energy.","a":"food","wrong":["root","leaves","seed coat"],"why_en":"The food stored in the seed gives the baby plant energy.","topicTag":"sci_plants","src":"sss:unit4-06.md#sec5","sssId":"SCI-U4-014","evidence":"The ______ gives the baby plant energy.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Parts of a Seed — The ______ grows down into the soil.","a":"root","wrong":["food","leaves","seed coat"],"why_en":"The root grows down into the soil first.","topicTag":"sci_plants","src":"sss:unit4-06.md#sec5","sssId":"SCI-U4-015","evidence":"The ______ grows down into the soil.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Parts of a Seed — The ______ grow up to make a new plant.","a":"leaves","wrong":["root","food","seed coat"],"why_en":"The leaves grow up to make a new plant.","topicTag":"sci_plants","src":"sss:unit4-06.md#sec5","sssId":"SCI-U4-016","evidence":"The ______ grow up to make a new plant.","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Who would win?! Location: Desert — A lot of sun, Very hot, Very Little Water. Choose which plant has the best adaptations for this place: Cactus or Maple Tree?","a":"Cactus","wrong":["Maple Tree","Venus Fly Trap","Water Lily"],"why_en":"A cactus has a thick stem to store water, spines instead of leaves to avoid being eaten, and long roots to find water — perfect for the desert.","topicTag":"sci_plants","src":"sss:unit4-07.md#3.3","sssId":"SCI-U4-017","evidence":"Location: Desert","baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Who would win?! Location: Swamp — A lot of sun, Cold Winter, Very little nutrients. Choose which plant has the best adaptations for this place: Venus Fly Trap or Aloe?","a":"Venus Fly Trap","wrong":["Aloe","Cactus","Maple Tree"],"why_en":"In a swamp with very little nutrients, the Venus Fly Trap eats insects for nutrients and sleeps during the winter. Aloe stores water for drought — that fits the desert, not the swamp.","topicTag":"sci_plants","src":"sss:unit4-08.md#3.3","sssId":"SCI-U4-018","evidence":"Location: Swamp","dubious":true,"baseline":true},
    {"type":"sci_plants","u":"u-plants","qEn":"Riddle: I am small and can hide in the ground. With water and sunlight, I start to grow. I can become a brand-new plant! What am I?","a":"seed","wrong":["root","stem","flower"],"why_en":"A small thing hidden in the ground that grows into a brand-new plant is a seed.","topicTag":"sci_plants","src":"sss:unit4-01.md#2","sssId":"SCI-U4-019","evidence":"I am small and can hide in the ground.","baseline":false},
    {"type":"sci_plants","u":"u-plants","qEn":"Riddle: I grow under the ground. I hold the plant in place. I take in water from the soil. What am I?","a":"root","wrong":["stem","leaf","flower"],"why_en":"The part under the ground that holds the plant in place and takes in water is the root.","topicTag":"sci_plants","src":"sss:unit4-01.md#3","sssId":"SCI-U4-020","evidence":"I grow under the ground.","baseline":false},
    { type: 'sci_observe', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u1', qEn: 'Scientists use their five senses to learn about the world. This is called…', 
      a: 'observing', wrong: ['measuring', 'sorting', 'guessing'],
      why_en: 'Observing means using your five senses — looking, listening, touching — to learn about the world. Sniffing an apple to see if it smells fresh is observing, too.', why: '' },
    { type: 'sci_observe', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u1', qEn: 'Which tool do you use to measure the volume of water in a cup?', 
      a: 'measuring cup', wrong: ['ruler', 'balance', 'magnifying glass'],
      why_en: 'Use a measuring cup for the volume of water. A ruler measures length, a balance measures how heavy something is, and a magnifying glass helps you see small details.', why: '' },
    { type: 'sci_observe', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u1', qEn: 'Which is the right order? Ask a question → guess → ___ → check', 
      a: 'test it', wrong: ['eat lunch', 'sleep', 'erase it'],
      why_en: 'The scientific method goes: ask a question → make a hypothesis (a guess) → test it (investigate) → check the results.', why: '' },
    { type: 'sci_observe', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u1', qEn: 'Why do scientists guess an answer (hypothesis) before testing?', 
      a: 'to know what to test', wrong: ['to be the fastest', 'to skip the test', 'to beat a classmate'],
      why_en: 'You make a hypothesis first so your test checks one clear idea. Real life: “The light is off — maybe the battery is dead.” Then you change the battery and see.', why: '' },
    { type: 'sci_observe', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u1', qEn: 'Looking at a small insect with a magnifying glass is which science skill?', 
      a: 'observe with tools', wrong: ['measure', 'compare', 'predict'],
      why_en: 'A magnifying glass is an observing tool. Tools make our observations clearer — just like a telescope helps you see far away.', why: '' },
    { type: 'sci_observe', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u1', qEn: 'What is the best way to record your results?', 
      a: 'draw and write notes', wrong: ['keep it in your head', 'tell your friend', 'do nothing'],
      why_en: 'The best way is to draw and write notes. Days later you can still read them, and someone else can understand them too.', why: '' },
    { type: 'sci_animals', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u3', qEn: 'A stick insect looks like a twig. Which adaptation is this?', 
      a: 'mimicry', wrong: ['camouflage', 'migration', 'hibernation'],
      why_en: 'A stick insect looks like a twig. That is mimicry — looking like something else to hide from enemies. Camouflage means your colour matches the background.', why: '' },
    { type: 'sci_animals', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u3', qEn: 'A flounder changes color to blend into the sand. Which adaptation is this?', 
      a: 'camouflage', wrong: ['mimicry', 'migration', 'hibernation'],
      why_en: 'The flounder\'s colour matches the sand, so enemies can hardly spot it. That is camouflage. Mimicry means looking like another thing.', why: '' },
    { type: 'sci_animals', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u3', qEn: 'What is the correct order of a butterfly life cycle?', 
      a: 'egg → larva → pupa → adult', wrong: ['egg → pupa → larva → adult', 'adult → egg → larva → pupa', 'larva → egg → adult → pupa'],
      why_en: 'A butterfly\'s life cycle is egg → larva → pupa → adult. Watch a caterpillar turn into a butterfly — it goes through all four stages.', why: '' },
    { type: 'sci_animals', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u3', qEn: 'How is a frog different from when it was a tadpole?', 
      a: 'as a tadpole it breathes with gills and swims; as a frog it grows legs, breathes with lungs and hops on land', wrong: ['it has legs when young but not later', 'it keeps breathing only with gills', 'it can fly when young'],
      why_en: 'As a tadpole it breathes with gills and swims; as a frog it grows legs, breathes with lungs, and can hop on land. That change is metamorphosis.', why: '' },
    { type: 'sci_animals', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u3', qEn: 'Which of these is NONLIVING?', 
      a: 'rock', wrong: ['tree', 'dog', 'flower'],
      why_en: 'Living things need air, water and food, and they grow. A rock does none of that — it is nonliving.', why: '' },
    { type: 'sci_animals', src: 'briefing:§4(11-06 seed 题·简报供稿层，非 sss 转录件——evidence 升级挂后续工单，Researcher 对盘 RP/unit1 题面)', u: 'u3', qEn: 'What do animals use adaptations for?', 
      a: 'survive', wrong: ['play games', 'talk to people', 'learn math'],
      why_en: 'Animals use adaptations to survive — to stay safe, find food and raise their babies. Camouflage, mimicry, thick fur... all help them survive.', why: '' }
  ],

  WEAKNESS:   [
    {
      "id": "W-01",
      "name": "复数主语后动词不加 -s（主谓一致）",
      "weight": "highest",
      "types": [
        "grammar"
      ],
      "evidence": "Clark HWB p.8 The dogs run 圈错；老师 2026-11-05 来信点名 SVA 复习重点（§19⑤，真实错题＋老师点名双证据 → 最高档）"
    },
    {
      "id": "W-02",
      "name": "might 名词义（力气）vs 情态动词",
      "weight": "high",
      "types": [
        "vocab_match",
        "vocab_sent",
        "en_match"
      ],
      "evidence": "Clark HWB p.11 Wrong meaning ✗"
    },
    {
      "id": "W-03",
      "name": "词义精确表达（bellow）",
      "weight": "mid",
      "types": [
        "vocab_sent",
        "vocab_def"
      ],
      "evidence": "Clark HWB p.10 Show understanding ✗"
    },
    {
      "id": "W-04",
      "name": "情态动词 can/would/will",
      "weight": "mid",
      "types": [
        "grammar"
      ],
      "evidence": "Clark HWB p.10-11 两处订正"
    },
    {
      "id": "W-05",
      "name": "事件排序",
      "weight": "low",
      "types": [
        "en_order"
      ],
      "evidence": "Clark HWB p.6 存疑"
    },
    {
      "id": "W-06",
      "name": "写作细节具体化",
      "weight": "highest",
      "types": [
        "writing"
      ],
      "evidence": "Summer WWB p.7 老师批 more interesting details!"
    },
    {
      "id": "W-07",
      "name": "全篇时态统一（过去时）",
      "weight": "high",
      "types": [
        "writing"
      ],
      "evidence": "Summer WWB p.5/p.7 时态混用"
    },
    {
      "id": "W-08",
      "name": "短答复述语序/括号堆叠",
      "weight": "high",
      "types": [
        "reading_skill",
        "writing"
      ],
      "evidence": "Author's Week p.6 读书报告 6/16"
    },
    {
      "id": "W-09",
      "name": "句子类型输出（疑问句漏倒装、感叹句漏 !）",
      "weight": "mid",
      "types": [
        "grammar"
      ],
      "evidence": "Picture Day p.8 I sit break time."
    },
    {
      "id": "W-10",
      "name": "-es/-ed/-ing 拼写边界",
      "weight": "mid",
      "types": [
        "en_fill",
        "spell_rule"
      ],
      "evidence": "Picture Day Word Mapping inches/singing"
    },
    {
      "id": "W-11",
      "name": "-able/-ed 情感形容词辨析",
      "weight": "mid",
      "types": [
        "en_fill",
        "grammar"
      ],
      "evidence": "Author's Week p.13 excitable→excited"
    },
    {
      "id": "W-12",
      "name": "figurative language 识别（拟人/拟声/头韵三型）",
      "weight": "highest",
      "types": [
        "reading_skill"
      ],
      "evidence": "手抄页 Figurative 区三型例句（personification: The wind whistled and the leaves danced. / onomatopoeia: Bang! Crash! Roar! / alliteration: She sells seashells by the seashore.）；老师 2026-11-05 来信点名 identifying figurative language（§19⑤/§16，新增 11-05）"
    },

    /* ---------- 数学弱点池 MW-01~10（MATH-02 / 内容稿 §4，133 页真实卷面） ----------
     * weight: highest＝进期中池加权 ×2.0，high＝×1.6，mid＝×1.25（见 MT.weaknessBoost / WEAK_MULT）
     * coach ＝给孩子看的一句话错因（英文，数学科全英口径）；coachZh＝底部中文小字兜底（Chief 判例①）
     * evidence 全部可溯源到 research/math-src/ 转录件「文件 + 图号 + 题号」 */
    {
      "id": "MW-01", "subj": "math",
      "name": "Borrowing works in column form but is forgotten in mental math",
      "nameZh": "竖式会借位，横式口算就忘——两位数减法十位/借位不落地",
      "weight": "high",
      "types": ["calc120_sub", "calc120_add", "vertical_sub"],
      "evidence": "u3-part1.md 图7 第4题 65−38 ✗；u2-part1.md 图5 99−23 ✗；review-part2.md 图5 辣椒 leftover 42 ✗（蓝笔订正 32）",
      "wrongStep": "borrow/carry 未内化：个位不够减没从十位借 1，或借了没在十位扣掉",
      "drill": 5, "drillTotal": 40, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "When the ones digit is too small to subtract, borrow 1 ten first — then cross that ten off the tens column before you subtract it.",
      "coachZh": "个位不够减时，先从十位借 1，并在十位上划掉这 1 个十，再去减。"
    },
    {
      "id": "MW-02", "subj": "math",
      "name": "Two-step problems: the step-1 answer is lost before step 2",
      "nameZh": "两步题算完第一步就忘了它是第二步的原料",
      "weight": "high",
      "types": ["word120", "bar_model"],
      "evidence": "review-part2.md 图5 辣椒两步 42→41 连错；review-part2.md 图4 南瓜地围栏 60−24 后忘 ÷2；u3-part3.md bananas 答 12（应 2，答非所问）",
      "wrongStep": "中间值丢失／没看清问题到底在问什么",
      "drill": 5, "drillTotal": 20, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "In a two-step problem, write the answer of step 1 in a little box, then use that boxed number in step 2. Read the last sentence again and ask: what is it actually asking for?",
      "coachZh": "两步题把第一步的答案写进一个小方框，第二步就用这个框里的数；最后再读一遍问题，看它到底要什么。"
    },
    {
      "id": "MW-03", "subj": "math",
      "name": "Shape definitions are fuzzy: what counts as a polygon",
      "nameZh": "图形的定义边界模糊：什么算多边形、六边形能不能有直角",
      "weight": "high",
      "types": ["shape2d", "shape3d"],
      "evidence": "review-part1.md 图5 B6 True/False (2)「六边形可有 2 直角」判错、(3)「球是多边形」判对；u4-part2.md 图3 Hexagon/6 sides",
      "wrongStep": "概念边界：没按定义逐条核对（是否封闭、是否全是直线边）",
      "drill": 5, "drillTotal": 25, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Test a polygon with two questions: is it closed, and are ALL its sides straight? A ball is not a polygon because it has no straight sides.",
      "coachZh": "判断多边形问两句：封闭吗？边全是直的吗？球没有直边，所以不是多边形。"
    },
    {
      "id": "MW-04", "subj": "math",
      "name": "Hidden squares in a figure get missed",
      "nameZh": "图里藏着的方块数不到（含 hidden squares）",
      "weight": "mid",
      "types": ["area_grid", "square_count"],
      "evidence": "u4-part3.md 图2 6 squares ✗（蓝笔订正 9）、rectangles ✗（订正 11）；u4-part4.md 图3 Enrichment 4-6 How Many Squares?",
      "wrongStep": "计数遗漏：只数看得见的 1×1，没数 2×2 与藏在里面的组合",
      "drill": 5, "drillTotal": 12, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Count in size order: all the 1×1 first, then the 2×2, then the 3×3. Mark each one lightly so you never count it twice — the big ones hide inside the small ones.",
      "coachZh": "按大小顺序数：先数完 1×1，再数 2×2、3×3；每个轻轻做记号，别重复数——大的常藏在小的里面。"
    },
    {
      "id": "MW-05", "subj": "math",
      "name": "Comparing without converting units; direction flips when the subject changes",
      "nameZh": "单位不换算就比、主语一换方向就反",
      "weight": "high",
      "types": ["cmp", "len_mixed"],
      "evidence": "review-part2.md 图2 C-6「2 ft 3 in vs 29 in」方向反 ✗；u3-part4.md 图1 fork/pan 传递比反；40 in vs 12 ft 类",
      "wrongStep": "单位换算缺失／比较方向（A>B、B>C 的传递）写反",
      "drill": 5, "drillTotal": 20, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Change both sides to the SAME unit before you compare. And if A is shorter than B, and B is shorter than C, then A is the shortest of all.",
      "coachZh": "比大小前，先把两边换成同一个单位。A 比 B 短、B 比 C 短，那 A 最短。"
    },
    {
      "id": "MW-06", "subj": "math",
      "name": "Reading a ruler: the last number is mistaken for the length",
      "nameZh": "读尺子把最后那个数字当长度、half 刻度不会用",
      "weight": "mid",
      "types": ["len_mixed"],
      "evidence": "review-part2.md 图3 手机读尺 作答 12 ✗（应为 about 11 in.，老师只打红叉未写订正）；u3-part1.md 图6 蠕虫刻度尺（0 起点对齐）",
      "wrongStep": "测量读数：没从对齐的起点开始数，直接读末端数字",
      "drill": 5, "drillTotal": 12, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Before you read the ruler, find where the object STARTS. If it does not start at 0, count the gaps between the marks — not the last number you see.",
      "coachZh": "读尺前先找物体从哪儿开始。不是从 0 开始，就数刻度之间的格子数，别直接读最后一个数字。"
    },
    {
      "id": "MW-07", "subj": "math",
      "name": "Perimeter: inside lines get counted, and working back from the perimeter skips a step",
      "nameZh": "周长题：内边混进外圈、由周长回推边长缺一步",
      "weight": "high",
      "types": ["perimeter"],
      "evidence": "review-part2.md 图3 组合图形周长 35 ✗（蓝笔订正 34，只算外轮廓）；review-part1.md 图2 5)「distance around the rectangle is 30 feet」缺边类",
      "wrongStep": "外轮廓识别（把内部分割线算进去）／逆推时少一步 ÷2",
      "drill": 5, "drillTotal": 15, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Perimeter is the distance around the OUTSIDE only. Trace the outline with one finger first, then ignore every line inside the shape.",
      "coachZh": "周长只算最外圈。先用手指沿外轮廓描一遍，图形里面的线全部不算。"
    },
    {
      "id": "MW-08", "subj": "math",
      "name": "Math words cannot be written in English: ten, shorter, at first, edges",
      "nameZh": "数学词用英文写不出来：ten、shorter、at first、edges",
      "weight": "mid",
      "types": ["strategy", "word120"],
      "evidence": "u3-part4.md 图2 「at list」（应 at first）；shorter 多处三连拼错（u3-part1/2/3/4）；「1 ten」写成「1 10」",
      "wrongStep": "术语书写：英文数学术语拼写不出来，答意对但失分",
      "drill": 5, "drillTotal": 8, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Say the math words out loud before you write them: ten, shorter, at first, edges. Spelling these right is worth real points.",
      "coachZh": "写之前先把数学词大声说一遍：ten、shorter、at first、edges。这些词拼对就是分数。"
    },
    {
      "id": "MW-09", "subj": "math",
      "name": "Pattern figures cannot be continued",
      "nameZh": "接着往下画的图形规律续不上",
      "weight": "mid",
      "types": ["pattern"],
      "evidence": "u4-part2.md Enrichment 4-2 Figure Patterns 续画 5 题全错（错位/断连/规律丢）；u1-part6.md 图1 What Comes Next?",
      "wrongStep": "规律外推：只模仿了形状样子，没抓住「每步怎么变」的规则",
      "drill": 5, "drillTotal": 12, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Say the rule in words first — “it adds one square and turns right” — then draw the next figure by following the rule, not by copying the picture.",
      "coachZh": "先用一句话说出规律——“每次加一个方块并右转”——再照规律画下一个，而不是照样子抄。"
    },
    {
      "id": "MW-10", "subj": "math",
      "name": "Key words in the question are not circled: NOT, more vs total, only one",
      "nameZh": "读题不圈关键词：NOT/更多还是总数/只写一个算式",
      "weight": "mid",
      "types": ["cmp", "word120"],
      "evidence": "review-part1.md 图2 1)「Which choice does NOT help you find 58 + 25」；u4-part1.md「Write only one equation」未遵守；54＞53 却答总数",
      "wrongStep": "审题：NOT／more 还是 total／只写一个算式 这类关键词没圈就读",
      "drill": 5, "drillTotal": 12, "drillNote": "每组 ≤5 题、同类隔日反复（家长答复：7 岁注意力撑不住，禁止一次堆量）",
      "coach": "Circle the key word first: NOT, more, total, or “only one”. That word decides what the question really asks.",
      "coachZh": "先把关键词圈出来：NOT、more、total、only one。这个词决定题目真正在问什么。"
    }
  ],

  /* ================= 数学·原题池与槽位数据（MATH-02） =================
   * 唯一判准：research/math-src/ 133 页真实卷面（u1 39 / u2 25 / u3 31 / u4 26 / review 12）。
   * MATH_ORIGINS：〔原题〕直插池。每条必须带 src＝「转录件 图N·NNN.jpg 题号」，缺溯源即视为脏数据。
   *   期中出题时优先抽原题（MT.originFirst），未作答的题带 grade:false —— 入库不判分、不进弱点权重。
   * 六个槽位数组为空 → 对应题型在题型 chip 与出题中自动隐藏（见 DATA_GATE / MT.typeHasData）。
   *
   * MATH-ET-06 刻意不建（转录件 133 页中 0 次出现，出现再议，勿删本注释）：
   *   NUMBER_FORM（数字形式）· ROUND（四舍五入）· PARTITION（等分）· TIME_CLOCK（钟点）
   * MONEY_USD 也不单建槽：$ 推理题并入 word120 的 mode:'usd'（MATH-ET-07）。 */
  /* == MATH-02 DATA == */
  /* == MATH-02 DATA（构建净化：内部生成注记与配图路径注释已按 MT-PAGES-01 G1 移除）== */
  "MATH_ORIGINS": [
   {
    "type": "calc120_add",
    "q": "23 + 36 = ______",
    "a": "59",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-1",
    "pool": "midterm",
    "explain": "Add the ones first: 3 + 6 = 9. Then add the tens. 23 + 36 = 59.",
    "explainZh": "先加个位：3 + 6 = 9；再加十位。23 + 36 = 59。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "57 + 18 = ______",
    "a": "75",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-2",
    "pool": "midterm",
    "explain": "Add the ones first: 7 + 8 = 15 — that is more than 9, so write the ones and carry 1 ten. Then add the tens. 57 + 18 = 75.",
    "explainZh": "先加个位：7 + 8 = 15，超过 9，个位写下来、向十位进 1；再加十位。57 + 18 = 75。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_sub",
    "q": "92 − 19 = ______",
    "a": "73",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-3",
    "pool": "midterm",
    "explain": "Start with the ones: 2 − 9 — not enough, so borrow 1 ten first (it becomes 10 more ones). Then do the tens. 92 − 19 = 73.",
    "explainZh": "先算个位：2 − 9，不够减，向十位借 1 个十（个位就多了 10）；再算十位。92 − 19 = 73。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "43 + ______ = 110",
    "a": "67",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-4",
    "pool": "midterm",
    "explain": "Line up ones under ones and tens under tens. Do the ones first, then the tens.",
    "explainZh": "个位对齐个位、十位对齐十位；先算个位，再算十位。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "calc120_sub",
    "q": "39 + 25 = 100 − ______",
    "a": "36",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-5",
    "pool": "midterm",
    "explain": "Both sides must be equal. Work out the side you know: 39 + 25 = 64. So the missing number has to make the other side 64 too — that is 36.",
    "explainZh": "等号两边必须相等。先把会算的那边算出来：39 + 25 = 64；那么另一边的空格也要让它等于 64，也就是 36。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "58 + 24 + 46 = ______",
    "a": "128",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-6",
    "pool": "midterm",
    "explain": "Go one step at a time on the left side: 58 + 24 = 82, then 82 + 46 = 128. So 58 + 24 + 46 = 128.",
    "explainZh": "左边一步一步算：58 + 24 = 82，再算 82 + 46 = 128。所以 58 + 24 + 46 = 128。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "120 − 35 + 45 = ______",
    "a": "130",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-7",
    "pool": "midterm",
    "explain": "Go one step at a time on the left side: 120 - 35 = 85, then 85 + 45 = 130. So 120 - 35 + 45 = 130.",
    "explainZh": "左边一步一步算：120 - 35 = 85，再算 85 + 45 = 130。所以 120 - 35 + 45 = 130。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_sub",
    "q": "200 − ______ + 55 = 60",
    "a": "195",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-8",
    "pool": "midterm",
    "explain": "Line up ones under ones and tens under tens. Do the ones first; if they are not enough, borrow 1 ten.",
    "explainZh": "个位对齐个位、十位对齐十位；先算个位，不够减就向十位借 1。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "vertical_add",
    "q": "65 + 28 = ______",
    "a": "93",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-9",
    "pool": "midterm",
    "explain": "Add the ones first: 5 + 8 = 13 — that is more than 9, so write the ones and carry 1 ten. Then add the tens. 65 + 28 = 93.",
    "explainZh": "先加个位：5 + 8 = 13，超过 9，个位写下来、向十位进 1；再加十位。65 + 28 = 93。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "vertical_sub",
    "q": "87 − 18 = ______",
    "a": "69",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-10",
    "pool": "midterm",
    "explain": "Start with the ones: 7 − 8 — not enough, so borrow 1 ten first (it becomes 10 more ones). Then do the tens. 87 − 18 = 69.",
    "explainZh": "先算个位：7 − 8，不够减，向十位借 1 个十（个位就多了 10）；再算十位。87 − 18 = 69。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "strategy",
    "q": "Use partial sums to find the missing numbers. │ 2 │ 5 │ + │ 4 │ 7 │ Tens: ___ Ones: ___ Sum: ___",
    "a": "72",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-11",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件【存疑】1：Tens 行第二格\"字形为闭合小圈带短尾，介于 0 与 6 之间（边界不清，接近〔无法辨认〕）\"；若读作 60 则完全正确，若读作 66 则与 Sum 行的 72 内部矛盾。答案 72 取自转录件对 Sum 行的判读，需人眼复核。",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "strategy",
    "q": "Use partial sums to find the missing numbers. Tens │ Ones ； │ 6 │ 9 │ + │ 2 │ 8 │ Sum = ___",
    "a": "97",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-12",
    "pool": "midterm",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "strategy",
    "q": "85 − 26 = ______",
    "a": "59",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-13",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件【存疑】2：第 4 题 1) Way 2 末行 \"55 + 4 =\" 后的两字被红笔对勾压盖，无法判读（按推理应为 59）。",
    "explain": "Start with the ones: 5 − 6 — not enough, so borrow 1 ten first (it becomes 10 more ones). Then do the tens. 85 − 26 = 59.",
    "explainZh": "先算个位：5 − 6，不够减，向十位借 1 个十（个位就多了 10）；再算十位。85 − 26 = 59。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "strategy",
    "q": "24 + 58 = ______",
    "a": "82",
    "opts": null,
    "src": "review-part1.md 图1·001.jpg A1-14",
    "pool": "midterm",
    "explain": "Add the ones first: 4 + 8 = 12 — that is more than 9, so write the ones and carry 1 ten. Then add the tens. 24 + 58 = 82.",
    "explainZh": "先加个位：4 + 8 = 12，超过 9，个位写下来、向十位进 1；再加十位。24 + 58 = 82。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "strategy",
    "q": "Which choice does **NOT** help you find 58 + 25 using mental math?",
    "a": "B. Break apart 25 into 24 + 1",
    "opts": [
     "A. Think of 25 as 10+10+2+3",
     "B. Break apart 25 into 24 + 1",
     "C. Add 58 + 2 and subtract 25 − 2",
     "D. Add 25 + 5 and subtract 58 − 5"
    ],
    "src": "review-part1.md 图2·002.jpg A2-1",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件【存疑】3：\"四个选项在数值上其实都能算出 58+25=83，\"哪一个 does NOT help\" 完全取决于答案键；孩子选 B 并得 ✓，不宜作为知识点错误处理。答案 B 采用卷面判对结果，需答案键复核。",
    "aLetter": "B",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "strategy",
    "q": "Start at 43. Move down 2 rows and then move right 3 spaces on a hundred chart. Which expression below matches these moves?",
    "a": "B. 43 + 23",
    "opts": [
     "A. 43 − 23",
     "B. 43 + 23",
     "C. 43 − 32",
     "D. 43 + 32"
    ],
    "src": "review-part1.md 图2·002.jpg A2-2",
    "pool": "midterm",
    "aLetter": "B",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len_mixed",
    "q": "What is the best estimate for the length of a grasshopper?",
    "a": "C. 2 inches",
    "opts": [
     "A. 2 yards",
     "B. 2 feet",
     "C. 2 inches",
     "D. 2 cm"
    ],
    "src": "review-part1.md 图2·002.jpg A2-3",
    "pool": "midterm",
    "aLetter": "C",
    "needsFigure": true,
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len_mixed",
    "q": "About how long is this pencil?",
    "a": "D. 9 cm",
    "opts": [
     "A. 10 in.",
     "B. 10 cm",
     "C. 9 in.",
     "D. 9 cm"
    ],
    "src": "review-part1.md 图2·002.jpg A2-4",
    "pool": "daily",
    "aLetter": "D",
    "needsFigure": true,
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "perimeter",
    "q": "The distance around the rectangle is 30 feet, and the two missing sides are equal in length. What is the length of one of the missing sides?",
    "a": "C. 6 ft",
    "opts": [
     "A. 12 ft",
     "B. 18 ft",
     "C. 6 ft",
     "D. 21 ft"
    ],
    "src": "review-part1.md 图2·002.jpg A2-5",
    "pool": "midterm",
    "aLetter": "C",
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "len_mixed",
    "q": "About how tall is our classroom door?",
    "a": "C. 8 ft",
    "opts": [
     "A. 100 cm",
     "B. 48 in.",
     "C. 8 ft",
     "D. 8 yd"
    ],
    "src": "review-part1.md 图2·002.jpg A2-6",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件【存疑】4：\"A/B/D 三选项上有深色横向划线、C 的\"8 ft\"被红笔圈两道并有深色斜划、圈内还压着蓝色笔迹；究竟是\"划掉错误选项\"还是\"老师作废该题\"无法判定。",
    "aLetter": "C",
    "needsFigure": true,
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "I am a polygon with more than 4 vertices. What shape could I be?",
    "a": "D. Hexagon",
    "opts": [
     "A. Circle",
     "B. Triangle",
     "C. Quadrilateral",
     "D. Hexagon"
    ],
    "src": "review-part1.md 图2·002.jpg A2-7",
    "pool": "midterm",
    "aLetter": "D",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape3d",
    "q": "I have 6 faces, all of which are rectangles. What shape could I be?",
    "a": "B. Rectangular prism",
    "opts": [
     "A. Rectangle",
     "B. Rectangular prism",
     "C. Pyramid",
     "D. Sphere"
    ],
    "src": "review-part1.md 图3·003.jpg A2-8",
    "pool": "midterm",
    "aLetter": "B",
    "explain": "Name the parts first: flat faces, edges, corners (vertices). Count each kind before you choose.",
    "explainZh": "先分清各部分：平平的面、棱、顶点，一类一类数清楚再选。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "strategy",
    "q": "Chloe is solving 63 - 25 by first subtracting 20. What should she do next to get the correct answer?",
    "a": "A. Subtract 5 more",
    "opts": [
     "A. Subtract 5 more",
     "B. Add 5 back",
     "C. Subtract 3 more",
     "D. Add 3 back"
    ],
    "src": "review-part1.md 图3·003.jpg A2-9",
    "pool": "midterm",
    "aLetter": "A",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape3d",
    "q": "Which two 3D shapes have a total of 13 vertices?",
    "a": "B. a rectangular prism and a pyramid",
    "opts": [
     "A. a cylinder and a cube",
     "B. a rectangular prism and a pyramid",
     "C. a sphere and a cone",
     "D. a rectangular prism and a cube"
    ],
    "src": "review-part1.md 图3·003.jpg A2-11",
    "pool": "midterm",
    "aLetter": "B",
    "needsFigure": true,
    "explain": "Name the parts first: flat faces, edges, corners (vertices). Count each kind before you choose.",
    "explainZh": "先分清各部分：平平的面、棱、顶点，一类一类数清楚再选。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "word120",
    "q": "Alex's class is getting ready for the Thanksgiving feast. Alex has one roll of ribbon that is 5 yards long. He cuts the ribbon into pieces, and each piece is 2 feet long. Each piece is used to tie one bow for a table. How many bows can he tie?",
    "a": "B. 7",
    "opts": [
     "A. 8",
     "B. 7",
     "C. 6",
     "D. 5"
    ],
    "src": "review-part1.md 图3·003.jpg A2-12",
    "pool": "midterm",
    "aLetter": "B",
    "explain": "Underline the question sentence, write what you know, choose the operation, then check if the answer makes sense.",
    "explainZh": "先把问句画线，写出已知条件，再决定用加减，最后检查得数合不合理。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "Which of the following shapes does **NOT** have 4 angles?",
    "a": "D. Hexagon",
    "opts": [
     "A. Square",
     "B. Trapezoid",
     "C. Rhombus",
     "D. Hexagon"
    ],
    "src": "review-part1.md 图3·003.jpg A2-14",
    "pool": "midterm",
    "aLetter": "D",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len_mixed",
    "q": "Which of the following lengths is the **shortest**?",
    "a": "C. 23 in.",
    "opts": [
     "A. 4 feet",
     "B. 1 yard",
     "C. 23 in.",
     "D. 2 ft 7 in."
    ],
    "src": "review-part1.md 图3·003.jpg A2-15",
    "pool": "midterm",
    "aLetter": "C",
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "cmp",
    "q": "1 ft 8 in. ______ 20 inches",
    "a": "=",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-16",
    "pool": "midterm",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "cmp",
    "q": "2 ft ______ 2 m",
    "a": "<",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-17",
    "pool": "midterm",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "cmp",
    "q": "1 inch ______ 1 centimeter",
    "a": ">",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-18",
    "pool": "midterm",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "cmp",
    "q": "100 − 25 − 35 ______ 36 − 23 + 15",
    "a": ">",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-19",
    "pool": "midterm",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "cmp",
    "q": "98 + 2 + 35 ______ 200 − 25 − 20",
    "a": "<",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-20",
    "pool": "midterm",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "cmp",
    "q": "2 meters ______ 180 centimeters",
    "a": ">",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-21",
    "pool": "midterm",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "strategy",
    "q": "Use the word back to fill the blanks. sum minuend difference addend subtrahend — 17 + 13 = 30",
    "a": "addend + addend = sum",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-22",
    "pool": "midterm",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "strategy",
    "q": "Use the word back to fill the blanks. sum minuend difference addend subtrahend — 135 - 26 = 109",
    "a": "minuend - subtrahend = difference",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-23",
    "pool": "midterm",
    "explain": "Say what you changed first. Mental math = move the easy part first (make a ten), then fix it.",
    "explainZh": "先说说你第一步动了哪个数：口算的窍门是把容易的先凑成整十，再把多的补回来。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "area_grid",
    "q": "Add by rows or columns to find the area. Add by rows: ______________________ Add by columns: ______________________",
    "a": "Add by rows: 4+4+4+4+4 = 20；Add by columns: 5+5+5+5 = 20；面积 = 20 square units",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-25",
    "pool": "midterm",
    "explain": "Area counts the squares INSIDE. Count row by row, then check by counting columns.",
    "explainZh": "面积数的是「里面」的方格：一行一行数，再用一列一列数一遍对答案。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "All rectangles are quadrilaterals.",
    "a": "True",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-29",
    "pool": "midterm",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "A hexagon can have 2 right angles.",
    "a": "True",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-30",
    "pool": "midterm",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides. Test a polygon with two questions: is it closed, and are ALL its sides straight? A ball is not a polygon because it has no straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。 判断多边形问两句：封闭吗？边全是直的吗？球没有直边，所以不是多边形。",
    "explainSrc": "type-procedure",
    "weak": "MW-03"
   },
   {
    "type": "shape2d",
    "q": "Spheres, rectangles, hexagons are all polygons.",
    "a": "False",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-31",
    "pool": "midterm",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides. Test a polygon with two questions: is it closed, and are ALL its sides straight? A ball is not a polygon because it has no straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。 判断多边形问两句：封闭吗？边全是直的吗？球没有直边，所以不是多边形。",
    "explainSrc": "type-procedure",
    "weak": "MW-03"
   },
   {
    "type": "shape3d",
    "q": "A rectangular prism has 6 flat surfaces and 6 edges.",
    "a": "False",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-32",
    "pool": "midterm",
    "explain": "Name the parts first: flat faces, edges, corners (vertices). Count each kind before you choose.",
    "explainZh": "先分清各部分：平平的面、棱、顶点，一类一类数清楚再选。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "Draw a hexagon with 2 right angels.",
    "a": "作图：一个六边形（6 条边），其中含 2 个直角",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-33",
    "pool": "midterm",
    "grade": false,
    "manual": true,
    "pendingNote": "Hands-on item: use a ruler and your pencil on paper, then show a grown-up.",
    "pendingNoteZh": "动手题：用尺子在纸上量一量、画一画，再给家长看（本题不在屏幕上判分）。",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "perimeter",
    "q": "Measure the length of each side in centimeters to find the perimeter. The perimeter is ______________.",
    "a": "15 cm",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-34",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件：上斜边与下斜边的数字为\"连笔花体 3，形似 2/∿\"，按印刷图实测该斜边与箭杆等长故读作 3；边长读数需人眼复核（若读作 2 则周长不为 15）。",
    "needsFigure": true,
    "grade": false,
    "manual": true,
    "pendingNote": "Hands-on item: use a ruler and your pencil on paper, then show a grown-up.",
    "pendingNoteZh": "动手题：用尺子在纸上量一量、画一画，再给家长看（本题不在屏幕上判分）。",
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "89 + 15 =",
    "a": "104",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-A-1",
    "pool": "midterm",
    "explain": "Add the ones first: 9 + 5 = 14 — that is more than 9, so write the ones and carry 1 ten. Then add the tens. 89 + 15 = 104.",
    "explainZh": "先加个位：9 + 5 = 14，超过 9，个位写下来、向十位进 1；再加十位。89 + 15 = 104。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_sub",
    "q": "113 - 57 =",
    "a": "56",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-A-2",
    "pool": "midterm",
    "explain": "Start with the ones: 3 − 7 — not enough, so borrow 1 ten first (it becomes 10 more ones). Then do the tens. 113 − 57 = 56.",
    "explainZh": "先算个位：3 − 7，不够减，向十位借 1 个十（个位就多了 10）；再算十位。113 − 57 = 56。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_sub",
    "q": "120 - 15 - 35 =",
    "a": "70",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-A-3",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件原话：\"35 =\" 左下方另有一处极淡的铅笔痕迹，形似 \"50\"，〔无法确认〕——照抄现状，不影响卷面判正确",
    "explain": "Go one step at a time on the left side: 120 - 15 = 105, then 105 - 35 = 70. So 120 - 15 - 35 = 70.",
    "explainZh": "左边一步一步算：120 - 15 = 105，再算 105 - 35 = 70。所以 120 - 15 - 35 = 70。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "62 + 28 + 17 =",
    "a": "107",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-A-4",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件原话：老师用红笔把 \"107\" 圈了出来，红圈意图不明——与 （卷面评分规则待确认）的扣分项对不上；内容稿 §9 第 3 项列为存疑。不自行判分，仍按卷面计为正确",
    "explain": "Go one step at a time on the left side: 62 + 28 = 90, then 90 + 17 = 107. So 62 + 28 + 17 = 107.",
    "explainZh": "左边一步一步算：62 + 28 = 90，再算 90 + 17 = 107。所以 62 + 28 + 17 = 107。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "calc120_add",
    "q": "105 + 12 - 55 =",
    "a": "62",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-A-5",
    "pool": "midterm",
    "explain": "Go one step at a time on the left side: 105 + 12 = 117, then 117 - 55 = 62. So 105 + 12 - 55 = 62. When the ones digit is too small to subtract, borrow 1 ten first — then cross that ten off the tens column before you subtract it.",
    "explainZh": "左边一步一步算：105 + 12 = 117，再算 117 - 55 = 62。所以 105 + 12 - 55 = 62。 个位不够减时，先从十位借 1，并在十位上划掉这 1 个十，再去减。",
    "explainSrc": "dev-derived",
    "weak": "MW-01"
   },
   {
    "type": "calc120_sub",
    "q": "109 - 44 + 22 =",
    "a": "87",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-A-6",
    "pool": "midterm",
    "explain": "Go one step at a time on the left side: 109 - 44 = 65, then 65 + 22 = 87. So 109 - 44 + 22 = 87. When the ones digit is too small to subtract, borrow 1 ten first — then cross that ten off the tens column before you subtract it.",
    "explainZh": "左边一步一步算：109 - 44 = 65，再算 65 + 22 = 87。所以 109 - 44 + 22 = 87。 个位不够减时，先从十位借 1，并在十位上划掉这 1 个十，再去减。",
    "explainSrc": "dev-derived",
    "weak": "MW-01"
   },
   {
    "type": "vertical_add",
    "q": "59 + 52 =",
    "a": "111",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-B-1",
    "pool": "midterm",
    "explain": "Add the ones first: 9 + 2 = 11 — that is more than 9, so write the ones and carry 1 ten. Then add the tens. 59 + 52 = 111.",
    "explainZh": "先加个位：9 + 2 = 11，超过 9，个位写下来、向十位进 1；再加十位。59 + 52 = 111。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "vertical_sub",
    "q": "104 - 48 =",
    "a": "56",
    "opts": null,
    "src": "review-part2.md 图1·008.jpg B-B-2",
    "pool": "midterm",
    "explain": "Start with the ones: 4 − 8 — not enough, so borrow 1 ten first (it becomes 10 more ones). Then do the tens. 104 − 48 = 56.",
    "explainZh": "先算个位：4 − 8，不够减，向十位借 1 个十（个位就多了 10）；再算十位。104 − 48 = 56。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "len",
    "q": "About how tall is our classroom?",
    "a": "C. 10 feet",
    "opts": [
     "A. 15 centimeters",
     "B. 15 inches",
     "C. 10 feet",
     "D. 10 yards"
    ],
    "src": "review-part2.md 图1·008.jpg B-C-1",
    "pool": "daily",
    "aLetter": "C",
    "needsFigure": true,
    "explain": "Circle the unit first (cm, m, in, ft). Different units cannot be compared until they match.",
    "explainZh": "先把单位圈出来（cm、m、in、ft）：单位不同，要先换成一样的才能比。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len",
    "q": "Use the square to estimate. About how long is the stapler?",
    "a": "C. 6 in.",
    "opts": [
     "A. 6 cm",
     "B. 4 in.",
     "C. 6 in.",
     "D. 8 in."
    ],
    "src": "review-part2.md 图1·008.jpg B-C-2",
    "pool": "daily",
    "aLetter": "C",
    "needsFigure": true,
    "explain": "Circle the unit first (cm, m, in, ft). Different units cannot be compared until they match.",
    "explainZh": "先把单位圈出来（cm、m、in、ft）：单位不同，要先换成一样的才能比。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len",
    "q": "Which is the best estimate for the height of a second grader?",
    "a": "A. 4 feet",
    "opts": [
     "A. 4 feet",
     "B. 20 inches",
     "C. 5 yards",
     "D. 72 inches"
    ],
    "src": "review-part2.md 图2·009.jpg B-C-3",
    "pool": "daily",
    "aLetter": "A",
    "needsFigure": true,
    "explain": "Circle the unit first (cm, m, in, ft). Different units cannot be compared until they match.",
    "explainZh": "先把单位圈出来（cm、m、in、ft）：单位不同，要先换成一样的才能比。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len",
    "q": "Emma wants to measure the height of a tall tree. What unit and tool are better to use?",
    "a": "D. yards, measuring tape",
    "opts": [
     "A. inches; ruler",
     "B. centimeters; measuring tape",
     "C. yards; ruler",
     "D. yards, measuring tape"
    ],
    "src": "review-part2.md 图2·009.jpg B-C-4",
    "pool": "daily",
    "aLetter": "D",
    "needsFigure": true,
    "explain": "Circle the unit first (cm, m, in, ft). Different units cannot be compared until they match.",
    "explainZh": "先把单位圈出来（cm、m、in、ft）：单位不同，要先换成一样的才能比。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len_mixed",
    "q": "A ribbon is 4 yards long. How long is it in feet?",
    "a": "C. 12 ft",
    "opts": [
     "A. 12 in.",
     "B. 48 ft",
     "C. 12 ft",
     "D. 48 in"
    ],
    "src": "review-part2.md 图2·009.jpg B-C-5",
    "pool": "midterm",
    "aLetter": "C",
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len_mixed",
    "q": "Lisa has a rope that is 2 ft 3 in. long. Alan has a rope that is 29 in. long. Which of the following statement is true?",
    "a": "C. Lisa's rope is 2 in. shorter than Alan's.",
    "opts": [
     "A. Alan's rope is shorter than Lisa's.",
     "B. Alan's rope is 2 ft 9 in. long.",
     "C. Lisa's rope is 2 in. shorter than Alan's.",
     "D. Lisa's rope is 6 in. shorter than Alan's."
    ],
    "src": "review-part2.md 图2·009.jpg B-C-6",
    "pool": "midterm",
    "aLetter": "C",
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding. Change both sides to the SAME unit before you compare. And if A is shorter than B, and B is shorter than C, then A is the shortest of all.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。 比大小前，先把两边换成同一个单位。A 比 B 短、B 比 C 短，那 A 最短。",
    "explainSrc": "type-procedure",
    "weak": "MW-05"
   },
   {
    "type": "perimeter",
    "q": "The total distance around a square is 12 cm. What is the length of each side?",
    "a": "D. 3 cm",
    "opts": [
     "A. 48 cm",
     "B. 4 cm",
     "C. 24 cm",
     "D. 3 cm"
    ],
    "src": "review-part2.md 图2·009.jpg B-C-7",
    "pool": "midterm",
    "aLetter": "D",
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "cmp",
    "q": "String A is 10 in. long. String B is 10 cm long. String C is 1 ft long. String D is 1 m long. Which string is the shortest?",
    "a": "B. String B",
    "opts": [
     "A. String A",
     "B. String B",
     "C. String C",
     "D. String D"
    ],
    "src": "review-part2.md 图2·009.jpg B-C-8",
    "pool": "midterm",
    "aLetter": "B",
    "explain": "Work out both sides first, then compare the two results — the bigger side gets >, the smaller gets <.",
    "explainZh": "先把两边都算出来（或换成同一单位），再比两边的结果：大的一边写 >，小的一边写 <。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "len_mixed",
    "q": "1. Read each ruler to find the length of each object. Write the number on the line and the unit in the brackets. about __________ ( __________ )",
    "a": "6 cm",
    "opts": null,
    "src": "review-part2.md 图3·010.jpg B-D-1a",
    "pool": "daily",
    "needsFigure": true,
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "len_mixed",
    "q": "1. Read each ruler to find the length of each object. Write the number on the line and the unit in the brackets. about __________ ( __________ )",
    "a": "about 11 in.",
    "opts": null,
    "src": "review-part2.md 图3·010.jpg B-D-1b",
    "pool": "daily",
    "needsFigure": true,
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding. Before you read the ruler, find where the object STARTS. If it does not start at 0, count the gaps between the marks — not the last number you see.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。 读尺前先找物体从哪儿开始。不是从 0 开始，就数刻度之间的格子数，别直接读最后一个数字。",
    "explainSrc": "type-procedure",
    "weak": "MW-06"
   },
   {
    "type": "perimeter",
    "q": "3. Henry uses these blocks to make different shapes. Find the total distance around each shape. __________ cm",
    "a": "28 cm",
    "opts": null,
    "src": "review-part2.md 图3·010.jpg B-D-3a",
    "pool": "midterm",
    "needsFigure": true,
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "perimeter",
    "q": "3. Henry uses these blocks to make different shapes. Find the total distance around each shape. __________ cm",
    "a": "34 cm",
    "opts": null,
    "src": "review-part2.md 图3·010.jpg B-D-3b",
    "pool": "midterm",
    "needsFigure": true,
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side. Perimeter is the distance around the OUTSIDE only. Trace the outline with one finger first, then ignore every line inside the shape.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。 周长只算最外圈。先用手指沿外轮廓描一遍，图形里面的线全部不算。",
    "explainSrc": "dev-derived",
    "weak": "MW-07"
   },
   {
    "type": "word120",
    "q": "A botanist measured the height of three amazing plants in his garden. Bamboo: One of the fastest-growing plants on Earth, it can grow 1 inch a day! Sunflower: Its flower head follows the sun across the sky. Mimosa: Its leaves fold up when touched. Bamboo: 84 inches Sunflower: 4 feet Mimosa: 52 inches 1. List the names of plants from shortest to tallest.",
    "a": "Sunflower → Mimosa → Bamboo",
    "opts": null,
    "src": "review-part2.md 图4·011.jpg B-E-1",
    "pool": "midterm",
    "explain": "Underline the question sentence, write what you know, choose the operation, then check if the answer makes sense. Change both sides to the SAME unit before you compare. And if A is shorter than B, and B is shorter than C, then A is the shortest of all.",
    "explainZh": "先把问句画线，写出已知条件，再决定用加减，最后检查得数合不合理。 比大小前，先把两边换成同一个单位。A 比 B 短、B 比 C 短，那 A 最短。",
    "explainSrc": "type-procedure",
    "weak": "MW-05"
   },
   {
    "type": "word120",
    "q": "2. How much inches taller is the tallest plant than the shortest plant? equations: answer: The tallest plant is ________ inches taller than the shortest plant.",
    "a": "36",
    "opts": null,
    "src": "review-part2.md 图4·011.jpg B-E-2",
    "pool": "midterm",
    "explain": "Underline the question sentence, write what you know, choose the operation, then check if the answer makes sense. In a two-step problem, write the answer of step 1 in a little box, then use that boxed number in step 2. Read the last sentence again and ask: what is it actually asking for?",
    "explainZh": "先把问句画线，写出已知条件，再决定用加减，最后检查得数合不合理。 两步题把第一步的答案写进一个小方框，第二步就用这个框里的数；最后再读一遍问题，看它到底要什么。",
    "explainSrc": "type-procedure",
    "weak": "MW-02"
   },
   {
    "type": "len_mixed",
    "q": "Grade 2 kids at SHSID are making a rectangular pumpkin patch. They put a fence around it. Kevin is trying to measure the length of the patch. 3. Should Kevin use meters or centimeters to measure the length of the patch?",
    "a": "Meters",
    "opts": null,
    "src": "review-part2.md 图4·011.jpg B-E-3",
    "pool": "daily",
    "needsFigure": true,
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "perimeter",
    "q": "Pumpkin vines can spread out in all directions. That's why when planting pumpkins it is important to leave enough space between each plant so they can grow big and healthy. Grade 2 kids at SHSID are making a rectangular pumpkin patch. They put a fence around it. Kevin is trying to measure the length of the patch. 4. They used 60 meters of fence in total. If the width of the patch is 12 meters, what is the length? Write equations to solve the problem. answer: The patch is ________ meters in length.",
    "a": "18 m",
    "opts": null,
    "src": "review-part2.md 图4·011.jpg B-E-4",
    "pool": "midterm",
    "needsFigure": true,
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side. Perimeter is the distance around the OUTSIDE only. Trace the outline with one finger first, then ignore every line inside the shape.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。 周长只算最外圈。先用手指沿外轮廓描一遍，图形里面的线全部不算。",
    "explainSrc": "dev-derived",
    "weak": "MW-07"
   },
   {
    "type": "word120",
    "q": "There were 46 balls on the playground. 20 were soccer balls and 15 were basketballs. The rest were tennis balls. How many were tennis balls?\nAnswer: There were ______________ tennis balls.",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图6·006.jpg A3-1",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "explain": "Underline the question sentence, write what you know, choose the operation, then check if the answer makes sense.",
    "explainZh": "先把问句画线，写出已知条件，再决定用加减，最后检查得数合不合理。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "During a math activity, two students collected different shapes. Ella had 25 quadrilaterals, 35 cubes, and 15 hexagons. Alex had 20 spheres, 12 circles, and 16 triangles. How many polygons do they have altogether?\nAnswer: They have ______________ polygons altogether.",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图6·006.jpg A3-2",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "只有 quadrilaterals、hexagons、triangles 才能计入 \"polygons\"，直接把 6 个数相加必错",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "perimeter",
    "q": "Clark runs around a rectangular track twice every day. The track is 50 meters long and 25 meters wide. How many meters does Clark run in all each day?\n(1) What's the hidden question in this problem?\n(2) Write equations to solve the problem.\nAnswer: Clark runs ______________ meters in all each day.",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图7·007.jpg A3-4",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "第 4 题的\"hidden question\"要求先求出一圈周长（50+25 的两倍）再乘 2 圈，是两步嵌套",
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "len_mixed",
    "q": "Ashley bought a new Christmas tree that is 2 yards tall. Her old Christmas tree was 65 inches tall. How many inches taller is the new tree than the old one?\nAnswer: The new tree is ______________ inches taller than the old one.",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图7·007.jpg A3-5",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "第 5 题必须先做 yard→inch 换算（2 yd = 72 in）再相减，跨单位比较是最易错点",
    "explain": "Circle the unit first, then change both sides to the same unit before comparing or adding.",
    "explainZh": "先圈单位，再把两边换成同一单位，然后才比较或相加。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "word120",
    "q": "Do Martin and Luis have more or fewer stickers than Kaley?\nCircle:　more　fewer\n（下方大片空白，供 \"Explain\" 使用）",
    "a": null,
    "opts": null,
    "src": "u2-part3.md 图1·015.jpg u2p3-EXPLAIN-1",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "5. [作答: 圈出 **more**] → 正确（50 > 45）",
    "explain": "Underline the question sentence, write what you know, choose the operation, then check if the answer makes sense.",
    "explainZh": "先把问句画线，写出已知条件，再决定用加减，最后检查得数合不合理。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "word120",
    "q": "Which sentence tells you how to find the number of stickers Martin has? Underline it.\n（两条空横线）",
    "a": null,
    "opts": null,
    "src": "u2-part3.md 图1·015.jpg u2p3-EXPLAIN-2",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "explain": "Underline the question sentence, write what you know, choose the operation, then check if the answer makes sense.",
    "explainZh": "先把问句画线，写出已知条件，再决定用加减，最后检查得数合不合理。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "perimeter",
    "q": "enVision® STEM Ashlee's map shows where animals, land, and water are at a zoo. The distance around her map is 38 inches. What is the length of the missing side?\n│ Write an equation using a [?] for the unknown number. │ ← [?] 为一个方框里印着 \"?\" 的图标\n│ │\n│ enVision® STEM Ashlee's map shows │\n│ where animals, land, and water are │\n│ at a zoo. │\n│ │\n│ The distance around her map is │\n│ 38 inches. What is the length of │\n│ the missing side? │\n│ │\n│ ______ inches [ 地图插图 ] │\n│ 8 in. (上边) │\n│ 11 in. (左边) │\n│ ? in. (右边) │\n│ 8 in. (下边) │",
    "a": null,
    "opts": null,
    "src": "u3-part5.md 图1·029.jpg u3p5-029",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件原话：横线左端仅有极淡铅笔痕迹，未成形为数字，〔无法辨认〕——照抄现状，不推测其是否曾落笔",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "长方形周长已知、给三条边求第四条边（38−11−8−8=11）",
    "explain": "Perimeter is the distance all the way AROUND: trace the outside edge once and add every side.",
    "explainZh": "周长是「绕外圈一圈」的长度：只描外面一圈，把每条边加起来。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "shape2d",
    "q": "Draw a polygon with ____ vertices.\nIt means this polygon will have ____ as well.",
    "a": null,
    "opts": null,
    "src": "u4-part2.md 图3·010.jpg u4p2-010-DRAW",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   },
   {
    "type": "shape2d",
    "q": "Measure each side of following shapes. Shade all the rhombuses.\n- ① **正五边形**（pentagon，尖朝上） - ② **细长的平行四边形**（左右两条短斜边，上下两条长边，明显不等长） - ③ **正方形**（边与纸面平行） - ④ **向右倾斜的平行四边形/菱形**（四条边看起来等长，形似\"压扁的菱形\"；教师把它圈出并打 ✗，据此推定它才是本题要涂的菱形之一）",
    "a": null,
    "opts": null,
    "src": "u4-part2.md 图3·010.jpg u4p2-010-MEASURE",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "正确答案：应涂 ③ 正方形 与 ④ 右侧菱形；② 是邻边不等长的平行四边形，不是菱形，不应涂",
    "needsFigure": true,
    "explain": "Count the sides and the corners one by one, then decide. A polygon is closed and flat with straight sides.",
    "explainZh": "一条一条数边、数角，再判断。平面图形是封闭的、平平的、边是直的。",
    "explainSrc": "type-procedure"
   }
  ],
  "MATH_ONL": [
   {
    "type": "open_number_line",
    "q": "Use open number line to subtract. 127 − 39 = ______",
    "a": "88",
    "opts": null,
    "src": "review-part1.md 图4·004.jpg A2-24",
    "pool": "midterm",
    "explain": "Start at the first number, jump by tens first and then by ones, and write each jump.",
    "explainZh": "从第一个数出发，先跳整十、再跳个位，每一跳都写下来。",
    "explainSrc": "type-procedure"
   }
  ],
  "MATH_BARMODEL": [
   {
    "type": "bar_model",
    "q": "Did you know that some plants are amazing continuous producers? Unlike an apple tree that fruits only in one season plants like chili peppers tomatoes and cucumbers are very special. Once you pick their ripe fruits the plant can still create fruits. 4. Simon is growing one of these incredible chili pepper plants on his balcony. On Monday, he picked 45 small red chilis. He decided to share his joy and gave 13 of them to his neighbor. Today, Simon harvested some more chilis. After this new picking, he had 83 chilis in total. How many chilis did Simon pick today?",
    "a": "51",
    "opts": null,
    "src": "review-part2.md 图5·012.jpg B-E-4b",
    "pool": "midterm",
    "explain": "Draw one bar for each part, put the numbers on the bars, then see whether you need the whole or one part. In a two-step problem, write the answer of step 1 in a little box, then use that boxed number in step 2. Read the last sentence again and ask: what is it actually asking for?",
    "explainZh": "先画条形图：每一段画一条，把数标上去，再看要求的是「一共」还是「其中一段」。 两步题把第一步的答案写进一个小方框，第二步就用这个框里的数；最后再读一遍问题，看它到底要什么。",
    "explainSrc": "type-procedure",
    "weak": "MW-02"
   },
   {
    "type": "bar_model",
    "q": "Nelson's Bakery made 65 blueberry pies and 80 apple pies. They sold 127 pies for Thanksgiving. How many pies were left?\nStep 1: 🥧 Total pies made ┌──────────────────────────────────┐ │ ____________ │ ├────────────────┬─────────────────┤ │ 🫐 Blueberry pies│ 🥧 Apple pies │ │ __________ │ __________ │ └────────────────┴─────────────────┘ Step 2: 🥧 Total pies made ┌──────────────────────────────────┐ │ ____________ │ ├────────────────┬─────────────────┤ │ 🛍 Pies sold │ 🍰 Pies left │ │ __________ │ __________ │ └────────────────┴─────────────────┘ Equation: Equation: ______________________________ ______________________________ Answer: ______________ pies were left.",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图6·006.jpg A3-3",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "第 3 题考两步建模（先加出总数 65+80，再用总数减售出 127）",
    "explain": "Draw one bar for each part, put the numbers on the bars, then see whether you need the whole or one part.",
    "explainZh": "先画条形图：每一段画一条，把数标上去，再看要求的是「一共」还是「其中一段」。",
    "explainSrc": "type-procedure"
   }
  ],
  "MATH_PLACE": [
   {
    "type": "place_value",
    "q": "Use the given digits to make two 2-digit numbers that make the statement true. Each digit can be used only once. 4 8 6 0 — Make the greatest difference.",
    "a": "86 − 40 = 46",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-26",
    "pool": "midterm",
    "explain": "Do the tens first, then the ones, so you can see how the number is built.",
    "explainZh": "先算整十，再算个位，能看清这个数是怎么搭起来的。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "place_value",
    "q": "Use the given digits to make two 2-digit numbers that make the statement true. Each digit can be used only once. 3 1 2 5 — Make the greatest sum.",
    "a": "51 + 32 = 83",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-27",
    "pool": "midterm",
    "explain": "Do the tens first, then the ones, so you can see how the number is built.",
    "explainZh": "先算整十，再算个位，能看清这个数是怎么搭起来的。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "place_value",
    "q": "Use the given digits to make two 2-digit numbers that make the statement true. Each digit can be used only once. 0 9 7 2 — Make the smallest sum.",
    "a": "29 + 70 = 99",
    "opts": null,
    "src": "review-part1.md 图5·005.jpg A2-28",
    "pool": "midterm",
    "explain": "Do the tens first, then the ones, so you can see how the number is built.",
    "explainZh": "先算整十，再算个位，能看清这个数是怎么搭起来的。",
    "explainSrc": "dev-derived"
   },
   {
    "type": "place_value",
    "q": "Use the given digits to make two 2-digit numbers that make the statement true. Each digit can be used only once.\nMake the greatest difference. Make the greatest sum. Make the smallest sum.",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图5·005.jpg rvp1-005-5-BOXES",
    "pool": "midterm",
    "dubious": true,
    "dubiousNote": "转录件未定性：「可能为选做/校验栏，也可能是漏填」；且三小题主答案转录件均判正确（86−40=46 / 51+32=83 / 29+70=99），故本条仅为漏填的作答区，不代表知识点错误",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "explain": "Say the value of each digit out loud (which is tens, which is ones) before you compare or add.",
    "explainZh": "先大声说出每个数字表示多少（哪个是十位、哪个是个位），再去比或加。",
    "explainSrc": "type-procedure"
   }
  ],
  "MATH_TABLE": [
   {
    "type": "table_read",
    "q": "Sally sells apples, oranges and bananas in her fruit store. This table shows how many of each fruit she sold for the first three days of the week.\n(1) To find how many fewer bananas Sally sold on Wednesday than Tuesday, what operation should you use? │ │ 🍎 │ 🍊 │ 🍌 │ ├───────────┼──────┼──────┼──────┤ │ Monday │ 38 │ 92 │ 74 │ │ Tuesday │ 25 │ 43 │ 83 │ │ Wednesday │ 56 │ 64 │ 47 │ └───────────┴──────┴──────┴──────┘ *Use the table above to answer the questions.*\n(2) How many pieces of fruit did Sally sell in all on Tuesday?",
    "a": null,
    "opts": null,
    "src": "review-part1.md 图7·007.jpg A3-6",
    "pool": "midterm",
    "pending": true,
    "grade": false,
    "pendingNote": "Not answered yet — you will do this one in class.",
    "pendingNoteZh": "这题卷面还没做，等你做完老师/家长会看。",
    "aRef": "第 6 题考读表定位（星期三 vs 星期二的香蕉数）与\"fewer → 减法\"的运算选择",
    "explain": "Read the title and the column names first, then use only the row the question asks about.",
    "explainZh": "先读表题和表头，再只取题目问的那一行数字来用。",
    "explainSrc": "type-procedure"
   }
  ],
  /* ============================================================
   * INGEST-03 〔原题·老师批改版〕（img4–7 Education.com 家庭练习卷，2026-11-05 投喂，
   * docs/content-data-math.md v3.0 §10）。红笔全部为老师书写＝判分基线（用户 2026-11-05 确认）。
   * 纪律（Chief 裁定3，2026-11-06）：本批 66 条一律不挂 weak——审计硬断言锁 weakId 命中=0。
   * 卷面没有的题目不建（裁定4）：路径题（图测≈4in）〔待补拍〕不入库；"保护"格拼音未逐字
   * 转录暂缓；img4 第一大题缺 3 格待家长补拍（MATH-ET-18）。答案全部脚本复算（audit-batch.mjs）。
   * 干扰项为常见误算（测试设计，非卷面内容）；池＝daily 家庭练习，不进期中模拟卷 53 题结构。
   * ============================================================ */
  "MATH_LENCONV": [
    { "type": "len_conv", "no": "img4·T1",  "q": "2 ft = ______ in",  "a": "24 in",  "opts": ["24 in", "14 in", "22 in", "12 in"], "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T2",  "q": "2 yd = ______ in",  "a": "72 in",  "opts": ["72 in", "6 in", "36 in", "24 in"],  "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T3",  "q": "3 yd = ______ ft",  "a": "9 ft",   "opts": ["9 ft", "12 ft", "3 ft", "36 ft"],   "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T4",  "q": "3 ft = ______ in",  "a": "36 in",  "opts": ["36 in", "15 in", "33 in", "12 in"],"pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T5",  "q": "2 yd = ______ ft",  "a": "6 ft",   "opts": ["6 ft", "12 ft", "5 ft", "24 ft"],  "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T6",  "q": "5 yd = ______ ft",  "a": "15 ft",  "opts": ["15 ft", "8 ft", "10 ft", "5 ft"],  "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T7",  "q": "4 yd = ______ ft",  "a": "12 ft",  "opts": ["12 ft", "16 ft", "4 ft", "144 ft"],"pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T8",  "q": "10 yd = ______ ft", "a": "30 ft",  "opts": ["30 ft", "13 ft", "40 ft", "10 ft"],"pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T9",  "q": "1 ft = ______ in",  "a": "12 in",  "opts": ["12 in", "3 in", "36 in", "10 in"], "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T10", "q": "15 yd = ______ ft", "a": "45 ft",  "opts": ["45 ft", "18 ft", "60 ft", "15 ft"],"pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T11", "q": "12 in = ______ ft", "a": "1 ft",   "opts": ["1 ft", "4 ft", "12 ft", "3 ft"],   "pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·T12", "q": "1 yd = ______ in",  "a": "36 in",  "opts": ["36 in", "3 in", "12 in", "360 in"],"pool": "daily", "src": "〔原题·老师批改版img4〕" },
    { "type": "len_conv", "no": "img4·A1",  "q": "A rope is 5 ft long. How many inches is that?", "a": "60 in", "opts": ["60 in", "17 in", "50 in", "72 in"], "pool": "daily", "src": "〔原题·老师批改版img4·应用〕" },
    { "type": "len_conv", "no": "img4·A2",  "q": "A path is 15 yd long. How many feet is that?", "a": "45 ft", "opts": ["45 ft", "18 ft", "60 ft", "15 ft"], "pool": "daily", "src": "〔原题·老师批改版img4·应用〕" },
    { "type": "len_conv", "no": "img4·A3",  "q": "A board is 3 ft long. How many inches is that?", "a": "36 in", "opts": ["36 in", "15 in", "33 in", "12 in"], "pool": "daily", "src": "〔原题·老师批改版img4·应用〕" },
    { "type": "len_conv", "no": "img4·A4",  "q": "A field is 4 yd long. How many feet is that?", "a": "12 ft", "opts": ["12 ft", "16 ft", "4 ft", "144 ft"], "pool": "daily", "src": "〔原题·老师批改版img4·应用〕" },
    { "type": "len_conv", "no": "img4·A5",  "q": "A jump measured 4 ft 6 in. How many inches is that?", "a": "54 in", "opts": ["54 in", "46 in", "60 in", "48 in"], "pool": "daily", "src": "〔原题·老师批改版img4·应用〕",
      "explain": "Formula box: 1 ft = 12 in | 1 yd = 3 ft | 1 yd = 36 in. Two standard steps (teacher's red pen): 4 ft = 48 in, then 48 + 6 = 54 in.",
      "explainZh": "公式框：1 ft＝12 in｜1 yd＝3 ft｜1 yd＝36 in。老师红笔两步：4 ft＝48 in，再 48＋6＝54 in。" },
    { "type": "len_conv", "no": "img4·M2",  "q": "200 cm = ______ m", "a": "2 m", "opts": ["2 m", "20 m", "200 m", "2000 m"], "pool": "daily", "src": "〔原题·老师批改版img4·公制（老师补充书写）〕" }
  ],
  "MATH_STRAT2": [
    { "type": "strategy_comp", "no": "img5·A1", "q": "Partial sums for 19 + 21 + 35: tens 10 + 20 + 30 = 60, ones 9 + 1 + 5 = 15. What is the total?", "a": "75", "opts": ["75", "65", "85", "70"], "pool": "daily", "src": "〔原题·老师批改版img5〕",
      "explain": "Three-number partial sums: add ALL the tens first (10 + 20 + 30 = 60), then all the ones (9 + 1 + 5 = 15), then 60 + 15 = 75.",
      "explainZh": "三个数的部分和：先把所有十位加起来（10＋20＋30＝60），再把所有个位加起来（9＋1＋5＝15），最后 60＋15＝75。" },
    { "type": "strategy_comp", "no": "img5·A2", "q": "Use compensation to subtract: 76 − 47 = ? (Only the standard two steps — don't write extra steps!)", "a": "29", "opts": ["29", "33", "23", "21"], "pool": "daily", "src": "〔原题·老师批改版img5〕",
      "explain": "Teacher's two standard ways: ① add 3 to BOTH numbers: 79 − 50 = 29. ② change only the subtrahend: 76 − 50 = 26, then give the 3 back: 26 + 3 = 29. Only these two steps — nothing more.",
      "explainZh": "老师要求的两种标准写法：①两边同加 3：79−50＝29；②只改减数：76−50＝26，再把多加的 3 补回：26＋3＝29。只写标准两步，不要多写 step。" },
    { "type": "strategy_comp", "no": "img5·B1", "q": "Use compensation to add: 28 + 27 = ? (Only the standard two steps — don't write extra steps!)", "a": "55", "opts": ["55", "45", "65", "57"], "pool": "daily", "src": "〔原题·老师批改版img5〕",
      "explain": "Teacher's two standard ways: ① 28 + 2 = 30 and 27 − 2 = 25, so 30 + 25 = 55. ② 28 − 3 = 25 and 27 + 3 = 30, so 25 + 30 = 55. Two steps only.",
      "explainZh": "两种标准写法：①28 加 2 凑 30、27 减 2 变 25：30＋25＝55；②28 减 3 变 25、27 加 3 凑 30：25＋30＝55。只写两步，不多写。" }
  ],
  "MATH_NUMFORM": [
    { "type": "number_form", "no": "img5·C1", "q": "Use 3, 6, 8, 0 to make □□ − □□ with the GREATEST difference. What is it?", "a": "56", "opts": ["56", "58", "52", "80"], "pool": "daily", "src": "〔原题·老师批改版img5〕",
      "explain": "To maximize the difference: biggest digit on top tens (8), smallest possible bottom tens (3, not 0 — tens cannot be 0), then big ones digit on top (6), small one below (0): 86 − 30 = 56.",
      "explainZh": "求最大差：被减数十位放最大的 8，减数十位放最小的非 0 数 3（十位不能是 0），个位上面放 6 下面放 0：86−30＝56。" },
    { "type": "number_form", "no": "img5·C2", "q": "Use 1, 7, 4, 2 to make □□ + □□ with the SMALLEST sum. What is it?", "a": "41", "opts": ["41", "46", "38", "65"], "pool": "daily", "src": "〔原题·老师批改版img5〕",
      "explain": "To minimize the sum: put the two smallest digits (1 and 2) in the tens places, then mix the big ones (7 and 4) into the ones: 14 + 27 = 41 (17 + 24 also gives 41).",
      "explainZh": "求最小和：把最小的两个数字 1 和 2 放十位，大的 7 和 4 放个位：14＋27＝41（17＋24 也是 41）。" },
    { "type": "number_form", "no": "同族补1", "q": "Use 2, 5, 7, 1 to make □□ + □□ with the SMALLEST sum. What is it?", "a": "42", "opts": ["42", "47", "39", "72"], "pool": "daily", "src": "〔同族补充·数字自拟，答案暴力枚举复算〕" },
    { "type": "number_form", "no": "同族补2", "q": "Use 9, 4, 0, 6 to make □□ − □□ with the GREATEST difference. What is it?", "a": "56", "opts": ["56", "44", "54", "90"], "pool": "daily", "src": "〔同族补充·数字自拟，答案暴力枚举复算〕" },
    { "type": "number_form", "no": "同族补3", "q": "Use 8, 3, 5, 2 to make □□ + □□ with the SMALLEST sum. What is it?", "a": "63", "opts": ["63", "68", "58", "85"], "pool": "daily", "src": "〔同族补充·数字自拟，答案暴力枚举复算〕" }
  ],
  "MATH_SHAPETF": [
    { "type": "shape_tf", "no": "img6·TF1", "q": "True or False: A closed shape with 4 equal sides is always a square.", "a": "False", "opts": ["False", "True", "Both"], "pool": "daily", "src": "〔原题·老师批改版img6〕",
      "explain": "False — a rhombus (diamond) also has 4 equal sides but its corners are not right angles. Equal sides alone do not make a square.",
      "explainZh": "错——菱形（钻石形）四条边也相等，但角不是直角。只靠四边相等不能断定是正方形（老师判分基线＝F）。" },
    { "type": "shape_tf", "no": "img6·TF2", "q": "True or False: A quadrilateral can have fewer than 4 sides.", "a": "False", "opts": ["False", "True", "Both"], "pool": "daily", "src": "〔原题·老师批改版img6〕",
      "explain": "False — quadrilateral means FOUR sides. Fewer than 4 sides would be a triangle (3 sides).",
      "explainZh": "错——quadrilateral 的意思就是四边形，少于 4 条边就成了三角形。" },
    { "type": "shape_tf", "no": "img6·TF3", "q": "True or False: A pyramid has more edges than a rectangular prism.", "a": "False", "opts": ["False", "True", "Both"], "pool": "daily", "src": "〔原题·老师批改版img6〕",
      "explain": "False — a rectangular prism has 12 edges; a (square-based) pyramid has 8. The prism has MORE.",
      "explainZh": "错——长方体有 12 条棱，四棱锥只有 8 条，是长方体的棱更多。" },
    { "type": "shape_tf", "no": "img6·FC1", "q": "How many faces, vertices, and edges does a rectangular prism have?", "a": "6 faces, 8 vertices, 12 edges", "opts": ["6 faces, 8 vertices, 12 edges", "6 faces, 12 vertices, 8 edges", "4 faces, 8 vertices, 12 edges", "8 faces, 6 vertices, 12 edges"], "pool": "daily", "src": "〔原题·老师批改版img6〕",
      "explain": "A box (rectangular prism): 6 flat faces, 8 corners (vertices), 12 edges. Count edges in groups: 4 top + 4 bottom + 4 down.",
      "explainZh": "长方体＝6 个面、8 个顶点、12 条棱；数棱分三组：上面 4＋下面 4＋竖着 4。" }
  ],
  "MATH_PERIM2": [
    { "type": "perimeter_fix", "no": "img7·P1", "q": "Find the perimeter of this irregular pentagon. Its sides are 3 in, 3 in, 6 in, 5 in and 4 in.", "a": "21 in", "opts": ["21 in", "18 in", "20 in", "23 in"], "pool": "daily", "src": "〔原题·老师批改版img7〕",
      "explain": "Add ALL five outside sides: 3 + 3 + 6 + 5 + 4. Make tens while adding (the teacher's red pen shows 6 and 10): 3 + 3 + 4 = 10? — group friendly first: 6 + 4 = 10, then 10 + 3 + 3 + 5 = 21 in.",
      "explainZh": "把外面五条边全加起来：3＋3＋6＋5＋4。像老师红笔那样先凑十：6＋4＝10，再 10＋3＋3＋5＝21 in。" },
    { "type": "perimeter_fix", "no": "img7·P2", "q": "A rectangle has a perimeter of 12 in (that's 1 foot). Two equal sides are each 4 in. How long is each of the other two sides?", "a": "2 in", "opts": ["2 in", "4 in", "3 in", "8 in"], "pool": "daily", "src": "〔原题·老师批改版img7〕",
      "explain": "Standard two steps (teacher's red pen): 12 − 4 − 4 = 4, then 4 ÷ 2 = 2 in. Don't write extra steps.",
      "explainZh": "老师红笔标准两步：12−4−4＝4，再 4÷2＝2 in——不多写 step。" }
  ],
  "MATH_AREA2": [
    { "type": "area_rowcol", "no": "img7·P4", "q": "The grid has 3 rows with 7 squares in each row. Which shows the area by ROWS?", "a": "7 + 7 + 7 = 21 square units", "opts": ["7 + 7 + 7 = 21 square units", "3 + 3 + 3 = 9 square units", "7 + 7 = 14 square units", "21 + 21 = 42 square units"], "pool": "daily", "src": "〔原题·老师批改版img7〕",
      "explain": "By rows: each row has 7 squares, and there are 3 rows → 7 + 7 + 7 = 21 square units. (By columns you would write 3 × 7 — both give 21.)",
      "explainZh": "按行数：每行 7 个格、共 3 行 → 7＋7＋7＝21 square units；按列写是 3×7，两种写法都得 21。" }
  ],
  "MATH_VERT2": [
    { "type": "vertical_orig", "no": "img5·B2", "q": "Line up the digits and subtract (regroup a ten: 3 tens and 11 ones). 41 − 27 = ?", "a": "14", "opts": ["14", "16", "24", "12"], "pool": "daily", "src": "〔原题·老师批改版img5〕",
      "explain": "Ones: 1 − 7 needs regrouping — borrow a ten to get 11 − 7 = 4. Tens: 3 − 2 = 1. So 41 − 27 = 14.",
      "explainZh": "个位 1−7 不够减，借 1 个十变 11−7＝4；十位剩 3−2＝1，所以 41−27＝14。" }
  ],
  "MATH_PATTERN": [],
  "MATH_SQUARE": [
   {
    "type": "square_count",
    "q": "Find the area of the shape below in square units.",
    "a": "B. 7 square units",
    "opts": [
     "A. 6 square units",
     "B. 7 square units",
     "C. 12 square units",
     "D. 10 square units"
    ],
    "src": "review-part1.md 图3·003.jpg A2-13",
    "pool": "midterm",
    "aLetter": "B",
    "needsFigure": true,
    "explain": "Count the whole squares inside the shape, one row at a time — count squares, not lines.",
    "explainZh": "一格一格数图形**里面**的整格，一行一行数；数的是格子，不是线。",
    "explainSrc": "type-procedure"
   }
  ],
  /* == MATH-02 DATA END == */
  TYPE_WEIGHT:   {
    "spell": 0.4,
    "spell_rule": 0.4,
    "alpha_order": 1.0,
    "grammar": 1.4,
    "reading_skill": 1.3,
    "vocab_match": 1.6,
    "vocab_sent": 1.6,
    "vocab_def": 1.6,
    "en_match": 1.7,
    "en_fill": 1.3,
    "en_sort": 1.3,
    "en_order": 1.1,
    "writing": 1.6,
    "listen": 1.0,
    "cn2en": 1.0,
    "en2cn": 1.0,
    "cloze": 1.0,
    "phrase": 1.0,

    /* ---- 数学（MATH-02 / MATH-ET-08）：权重取自 133 页真卷考点分布，周长＞应用＞长度单位＞比大小＞面积/缺边/120内加减＞2D＞竖式/ONL/3D＞bar model ----
     * 依据 research/math-src 卷面统计（内容稿 §0）：perimeter 19 · word120 16 · len_mixed 11 · cmp 9 ·
     * area_grid 6 · perimeter缺边 6 · calc120 6 · shape2d 4 · vertical 2 · open_number_line 2 · shape3d 2 · bar_model 1
     * mul/seq 下调（卷面几乎不考）；clock/money 不建槽（卷面 0 出现），留日常池故低权重 */
    "perimeter": 2.0,
    "word120": 1.8,
    "len_mixed": 1.5,
    "cmp": 1.3,
    "area_grid": 1.1,
    "calc120_add": 1.1,
    "calc120_sub": 1.1,
    "shape2d": 0.9,
    "strategy": 0.9,
    "vertical_add": 0.7,
    "vertical_sub": 0.7,
    "open_number_line": 0.7,
    "shape3d": 0.7,
    "square_count": 0.7,
    "place_value": 0.6,
    "table_read": 0.6,
    "pattern": 0.6,
    "bar_model": 0.5,
    "mul": 0.5,
    "seq": 0.4,
    "calc_add": 0.5, "calc_sub": 0.5, "calc100": 0.5, "len": 0.6, "word": 0.5, "shape": 0.5,
    "clock": 0.3, "money": 0.3
  }
};

/* ================================================================
 * ██ 逻辑区（只读数据区与 MT.cfg，替换教学内容不需要改这里） ██
 * ================================================================ */
(function () {
  var B = MT.banks;

  /* ---------- 小工具 ---------- */
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function sample(arr, n, exclude) {
    var pool = arr.filter(function (x) { return x !== exclude; });
    var out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* 弱点加权抽题：条目 weak:true 时权重 ×2（Chief 预建单 §5，需 smoke 可断言） */
  /* 选项/讲解里的中文括注去掉（英文模式下只留英文主体，中文进 explainZh） */
  function stripZh(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/（[^）]*）/g, '').replace(/[（(][^）)]*[）)]/g, '').replace(/[\u4e00-\u9fa5]/g, '').replace(/\s{2,}/g, ' ').trim();
  }
  MT.stripZh = stripZh;

  function pickWeighted(arr) {
    if (!arr || !arr.length) return null;
    var total = 0, ws = arr.map(function (x) { var w = (x && x.weak) ? 2 : 1; total += w; return w; });
    var r = Math.random() * total;
    for (var i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  }
  MT.pickWeighted = pickWeighted;   /* 冒烟断言用 */

  /* 把正确答案和干扰项合成 4 个乱序选项 */
  function makeOpts(answer, distractors) {
    var uniq = [];
    var seen = { };
    seen[answer] = 1; uniq.push(answer);
    for (var i = 0; i < distractors.length && uniq.length < 4; i++) {
      var d = distractors[i];
      if (d != null && !seen[d]) { seen[d] = 1; uniq.push(d); }
    }
    /* 数据干扰项不足时从备用池补齐，保证 4 项；填充语按答案语种取，避免中文占位项出现在英文科目界面 */
    var fillers = /[\u4e00-\u9fa5]/.test(String(answer))
      ? ['嗯…是这个', '我再想想', '应该没错', '不是这个']
      : ['not this one', 'maybe later', 'let me think', 'not sure'];
    for (var k = 0; uniq.length < 4 && k < fillers.length; k++) {
      if (!seen[fillers[k]]) { seen[fillers[k]] = 1; uniq.push(fillers[k]); }
    }
    return shuffle(uniq);
  }

  /* 数字转汉字（0~100，用于 clock/money 等题干朗读） */
  var CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  /* 英文数字词（1~100，用于英文题干/口诀，避免中文数字串进英文句） */
  var EN_WORDS_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function numWord(n) {
    n = Math.round(n);
    if (n < 0) return 'negative ' + numWord(-n);
    if (n < 20) return EN_WORDS_NUM[n];
    if (n === 100) return 'one hundred';
    if (n < 100) return EN_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + EN_WORDS_NUM[n % 10] : '');
    return String(n);
  }
  MT.numWord = numWord;

  function numToCn(n) {
    if (n <= 10) return n === 10 ? '十' : CN_DIGITS[n];
    if (n < 20) return '十' + CN_DIGITS[n % 10];
    var tens = Math.floor(n / 10), ones = n % 10;
    if (tens >= 10) return '一百';
    return CN_DIGITS[tens] + '十' + (ones ? CN_DIGITS[ones] : '');
  }

  /* 英语词按数据内容归主题（用于 topicTag） */
  var EN_TOPIC = { animals: [], food: [], colors: [], family: [], greet: [], phonics: [] };
  (function () {
    var ANIMALS = ['cat', 'dog', 'bird', 'fish', 'monkey', 'panda', 'tiger', 'rabbit', 'horse', 'lion', 'elephant', 'duck'];
    var FOOD = ['apple', 'banana', 'rice', 'noodles', 'milk', 'egg', 'cake', 'water', 'juice', 'bread', 'orange', 'meat'];
    var COLORS = ['red', 'yellow', 'blue', 'green', 'black', 'white', 'pink', 'brown'];
    var FAMILY = ['father', 'mother', 'brother', 'sister', 'grandpa', 'grandma', 'dad', 'mum', 'family'];
    var NUMS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    B.EN_WORDS.forEach(function (w) {
      var e = w.en.toLowerCase();
      if (ANIMALS.indexOf(e) >= 0) EN_TOPIC.animals.push(e);
      else if (FOOD.indexOf(e) >= 0) EN_TOPIC.food.push(e);
      else if (COLORS.indexOf(e) >= 0) EN_TOPIC.colors.push(e);
      else if (FAMILY.indexOf(e) >= 0) EN_TOPIC.family.push(e);
      else if (NUMS.indexOf(e) >= 0) EN_TOPIC.colors.push(e);
      else EN_TOPIC.phonics.push(e);
    });
  })();
  function enTagForWord(en) {
    var e = (en || '').toLowerCase();
    var keys = ['animals', 'food', 'colors', 'family'];
    for (var i = 0; i < keys.length; i++) {
      if (EN_TOPIC[keys[i]].indexOf(e) >= 0) return keys[i];
    }
    return 'phonics';
  }
  var PHRASE_TAG = { 'Good morning!': 'greet', "I'm fine, thank you!": 'greet', "What's your name?": 'greet', 'Goodbye! See you!': 'greet', 'Thank you!': 'greet', 'Sorry!': 'greet', 'My name is Ann.': 'greet', "You're welcome!": 'greet' };
  function phraseTag(right) { return PHRASE_TAG[right] || 'greet'; }
  function clozeTag(right) { return enTagForWord(right); }

  /* 英语 cloze 句子里出现的词 → 归 food 等 */
  var CLOZE_FOOD = ['milk', 'rice', 'apple', 'banana', 'egg', 'eggs', 'cake', 'noodles', 'water'];
  var CLOZE_GREET = ['Good', 'How', 'Would', 'are'];
  function clozeTagSmart(item) {
    if (CLOZE_GREET.indexOf(item.right) >= 0) return 'greet';
    for (var i = 0; i < CLOZE_FOOD.length; i++) {
      if (item.s.indexOf(CLOZE_FOOD[i]) >= 0) return 'food';
    }
    return enTagForWord(item.right);
  }

  /* ---------- 语文出题 ---------- */
  function genPinyin() {
    var w = pickWeighted(B.PY_WORDS);
    var askWord = Math.random() < 0.5; /* true: 看词选拼音；false: 看拼音选词 */
    var opts, q, a, speak, explain;
    if (askWord) {
      q = '“' + w.word + '”的拼音是哪个？';
      a = w.right;
      opts = makeOpts(a, shuffle(w.wrong));
      speak = '“' + w.word + '”的拼音是哪个？';
      explain = '“' + w.word + '”读作 ' + w.right + '，注意平舌音和翘舌音的区别哦。';
    } else {
      q = '拼音“' + w.py + '”对应哪个字？';
      a = w.word;
      var wrongWords = sample(B.PY_WORDS, 3, w).map(function (x) { return x.word; });
      opts = makeOpts(a, wrongWords);
      speak = '拼音“' + w.py + '”对应哪个字？';
      explain = w.py + ' 对应的字是“' + w.word + '”。';
    }
    return { subj: 'yuwen', type: 'pinyin', q: q, a: String(a), opts: opts, speak: speak, explain: explain, topicTag: 'pinyin' };
  }

  function genZuci() {
    var z = pickWeighted(B.ZUCI);
    var askNew = Math.random() < 0.6;
    var q, a, opts, speak, explain;
    if (askNew) {
      q = '“' + z.base + '”——' + z.hint + '，变成哪个新字？';
      a = z['new'];
      opts = makeOpts(a, shuffle(z.wrong));
      speak = q;
      explain = z.hint + '，是“' + z['new'] + '”，可以组词“' + z.word + '”。';
    } else {
      q = '“' + z['new'] + '”可以组词哪个？';
      a = z.word;
      /* 干扰组词：用干扰字拼出来的假词 */
      var wrong = shuffle(z.wrong).slice(0, 3).map(function (c) { return c + '的'; });
      opts = makeOpts(a, wrong);
      speak = q;
      explain = '“' + z['new'] + '”可以组“' + z.word + '”，比如：' + z.hint + '就成了' + z['new'] + '。';
    }
    return { subj: 'yuwen', type: 'zuci', q: q, a: String(a), opts: opts, speak: speak, explain: explain, topicTag: 'zici' };
  }

  function genJinyi() {
    var j = pickWeighted(B.JINYI);
    var kindLabel = j.kind === 'syn' ? '近义词' : '反义词';
    var q = '“' + j.word + '”的' + kindLabel + '是哪个？';
    var a = j.right;
    var opts = makeOpts(a, shuffle(j.wrong));
    var speak = q;
    var explain = j.kind === 'syn'
      ? '“' + j.word + '”和“' + j.right + '”意思相近，它们是近义词。'
      : '“' + j.word + '”和“' + j.right + '”意思正好相反，它们是反义词。';
    return { subj: 'yuwen', type: 'jinyi', q: q, a: String(a), opts: opts, speak: speak, explain: explain, topicTag: 'jinyi' };
  }

  function genLiangci() {
    var l = pickWeighted(B.LIANGCI);
    var q = '一（ ）' + l.obj + '，括号里填哪个量词？';
    var a = l.m;
    var opts = makeOpts(a, shuffle(l.wrong));
    var speak = '一（ ）' + l.obj + '，填哪个量词？';
    var explain = '应该说“一' + l.m + l.obj + '”。“' + l.m + '”用来搭配' + l.obj + '。';
    return { subj: 'yuwen', type: 'liangci', q: q, a: String(a), opts: opts, speak: speak, explain: explain, topicTag: 'liangci' };
  }

  function genPoem() {
    var p = pickWeighted(B.POEMS);
    var mode = pick(['next', 'next', 'prev', 'author', 'meaning']);
    var q, a, opts, speak, explain, topicTag = 'poem';
    if (mode === 'next' || mode === 'prev') {
      /* 找有逗号的行作为上句，下一行存在 */
      var idxs = [];
      for (var i = 0; i < p.lines.length - 1; i++) idxs.push(i);
      var k = pick(idxs);
      if (mode === 'next') {
        var up = stripTail(p.lines[k]);
        q = '“' + up + '”的下一句是？';
        a = stripTail(p.lines[k + 1]);
        speak = q;
        var wrongNext = otherLines(p, k + 1, 3);
        opts = makeOpts(a, wrongNext);
        explain = '这是' + p.author + '的《' + p.title + '》：“' + up + '，' + a + '。”';
      } else {
        var down = stripTail(p.lines[k + 1]);
        q = '“' + down + '”的上一句是？';
        a = stripTail(p.lines[k]);
        speak = '“' + down + '”的上一句是？';
        opts = makeOpts(a, otherLines(p, k, 3));
        explain = '这是' + p.author + '的《' + p.title + '》：“' + a + '，' + down + '。”';
      }
    } else if (mode === 'author') {
      q = '《' + p.title + '》的作者是谁？';
      a = p.author;
      speak = q;
      var wrongAuthors = sample(B.POEMS, 3, p).map(function (x) { return x.author; });
      opts = makeOpts(a, wrongAuthors);
      explain = '《' + p.title + '》是' + p.author + '写的。';
    } else {
      /* 按诗意选句：给一句的意思，选原句 */
      var k2 = ri(0, p.lines.length - 1);
      var line = stripTail(p.lines[k2]);
      var hint = poemHint(line, p);
      if (!hint) return genPoem(); /* 没有配提示的句子就重选 */
      q = '《' + p.title + '》里，"' + hint + '"说的是哪一句？';
      a = line;
      speak = q;
      opts = makeOpts(a, otherLines(p, k2, 3));
      explain = '“' + line + '”就是描写"' + hint + '"的，出自《' + p.title + '》。';
    }
    return { subj: 'yuwen', type: 'poem', q: q, a: String(a), opts: opts, speak: speak, explain: explain, topicTag: topicTag };

    function stripTail(s) { return s.replace(/[，。！？、；：]+$/, ''); }
    function otherLines(poem, excludeIdx, n) {
      var pool = [];
      for (var i = 0; i < poem.lines.length; i++) {
        if (i !== excludeIdx) pool.push(stripTail(poem.lines[i]));
      }
      /* 跨诗干扰补充 */
      var extra = [];
      sample(B.POEMS, 2, poem).forEach(function (op) {
        extra.push(stripTail(pick(op.lines)));
      });
      return shuffle(sample(pool, n, null).concat(extra)).slice(0, 6);
    }
  }

  /* 常见诗句 → 儿童能懂的意思（仅用于"按诗意选句"，数据区可扩充） */
  var POEM_MEANING = {
    '白日依山尽': '太阳挨着山头慢慢落下去',
    '黄河入海流': '黄河的水奔流进大海',
    '欲穷千里目': '想要看到更远的风景',
    '更上一层楼': '再往上登一层楼',
    '床前明月光': '床前洒满了明亮的月光',
    '举头望明月': '抬起头看天上的月亮',
    '低头思故乡': '低下头想念自己的家乡',
    '春眠不觉晓': '春天睡得香，不知不觉天亮了',
    '处处闻啼鸟': '到处都能听到小鸟的叫声',
    '锄禾日当午': '中午顶着太阳在田里锄草',
    '谁知盘中餐': '谁知道碗里的饭菜',
    '粒粒皆辛苦': '每一粒都是辛苦劳动换来的',
    '儿童散学归来早': '小孩子们放学早早回来',
    '忙趁东风放纸鸢': '赶紧趁着东风放风筝',
    '小荷才露尖尖角': '小小的荷叶刚露出尖尖的角',
    '早有蜻蜓立上头': '早有蜻蜓站在上面啦'
  };
  function poemHint(line, poem) { return POEM_MEANING[line] || null; }

  /* ---------- 数学出题（纯程序生成） ---------- */
  var MATH_TAG = {
    calc_add: 'calc100', calc_sub: 'calc100', calc100: 'calc100', word: 'calc100', seq: 'calc100',
    mul: 'chengfa', len: 'length', shape: 'jiao', clock: 'clock', money: 'rmb', cmp: 'calc100'
  };
  /* 2026 期中新增数学题型 topicTag 映射（曾随生成器改写丢失，此处补回） */
  MATH_TAG.calc120_add = 'js120'; MATH_TAG.calc120_sub = 'js120';
  MATH_TAG.vertical_add = 'shushi'; MATH_TAG.vertical_sub = 'shushi';
  MATH_TAG.strategy = 'strategy';
  MATH_TAG.len_mixed = 'measure'; MATH_TAG.perimeter = 'measure';
  MATH_TAG.shape2d = 'shapes'; MATH_TAG.shape3d = 'shapes'; MATH_TAG.area_grid = 'shapes';
  MATH_TAG.word120 = 'wordapp';
  /* 卷面新槽位的 topicTag（归到最贴近的期中卡，config.js cfg.topics.math 对应 id） */
  MATH_TAG.open_number_line = 'strategy'; MATH_TAG.place_value = 'js120';
  MATH_TAG.bar_model = 'wordapp'; MATH_TAG.table_read = 'wordapp';
  MATH_TAG.pattern = 'shapes'; MATH_TAG.square_count = 'shapes';

  function mkMath(type, q, a, opts, speak, explain, explainZh) {
    /* a 允许为 null：未作答(pending)/动手(manual)条目卷面没有可判的答案，
     * 早期版本 String(null) 会生成 "null" 字符串，讲解区会把它显示出来。 */
    return { subj: 'math', type: type, q: q, a: a == null ? null : String(a), opts: opts, speak: speak || q, explain: explain, explainZh: explainZh || '', topicTag: MATH_TAG[type] || 'calc100', pool: 'daily' };
  }
  function numOpts(ans, spread, min) {
    var distr = [];
    var guard = 0;
    while (distr.length < 3 && guard < 60) {
      guard++;
      var delta = ri(1, spread) * (Math.random() < 0.5 ? -1 : 1);
      var v = ans + delta;
      if (v < (min || 0) || v === ans || distr.indexOf(v) >= 0) continue;
      distr.push(v);
    }
    while (distr.length < 3) distr.push(ans + distr.length + 1);
    return makeOpts(String(ans), distr.map(String));
  }

  function genCalc(kind, level) {
    var a, b, ans, q, explain, explainZh, type;
    var withCarry = level >= 2;
    if (kind === 'add' || (kind === 'mix' && Math.random() < 0.5)) {
      type = 'calc_add';
      if (level === 1) { a = ri(10, 40); do { b = ri(2, 40); } while ((a % 10) + (b % 10) >= 10 && !withCarry); }
      else if (level === 2) { a = ri(15, 59); b = ri(13, 40); }
      else { a = ri(28, 79); b = ri(15, 39); }
      if (a + b > 100) b = 100 - a;
      ans = a + b;
      q = 'What is ' + a + ' + ' + b + '?';
      if (withCarry && (a % 10) + (b % 10) >= 10) {
        explain = 'Add the ones: ' + (a % 10) + ' + ' + (b % 10) + ' = ' + ((a % 10) + (b % 10)) +
          '. That is ten or more, so carry ten to the tens place. The answer is ' + ans + '.';
        explainZh = '个位相加满十，向十位进一，答案是 ' + ans + '。';
      } else {
        explain = 'Add ones to ones, tens to tens: ' + a + ' + ' + b + ' = ' + ans + '.';
        explainZh = '个位加个位、十位加十位，' + a + '+' + b + '=' + ans + '。';
      }
    } else {
      type = 'calc_sub';
      if (level === 1) { a = ri(20, 49); do { b = ri(2, a - 1); } while ((a % 10) < (b % 10) && !withCarry); }
      else if (level === 2) { a = ri(35, 89); b = ri(13, a - 5); }
      else { a = ri(45, 99); b = ri(15, a - 5); }
      ans = a - b;
      q = 'What is ' + a + ' − ' + b + '?';
      if (withCarry && (a % 10) < (b % 10)) {
        explain = 'The ones digit is too small: ' + (a % 10) + ' cannot take away ' + (b % 10) +
          '. Borrow ten from the tens place, then subtract. The answer is ' + ans + '.';
        explainZh = '个位不够减，从十位退一当十，答案是 ' + ans + '。';
      } else {
        explain = 'Subtract ones from ones, tens from tens: ' + a + ' − ' + b + ' = ' + ans + '.';
        explainZh = '个位减个位、十位减十位，' + a + '−' + b + '=' + ans + '。';
      }
    }
    if (kind === 'mix') type = 'calc100';
    var opt = numOpts(ans, 10, 0);
    return { subj: 'math', type: type, q: q, a: String(ans), opts: opt, speak: q, explain: explain, explainZh: explainZh, topicTag: MATH_TAG[type] };
  }

  function genMul(level) {
    var maxF = level === 1 ? 5 : (level === 2 ? 6 : 9);
    var x = ri(1, maxF), y = ri(1, maxF);
    if (level === 3 && Math.random() < 0.4) x = ri(6, 9);
    var ans = x * y;
    var q = 'What is ' + x + ' × ' + y + '?';
    var rhyme = numWord(Math.min(x, y)) + ' ' + numWord(Math.max(x, y)) + 's are ' + numWord(ans);
    var explain = x + ' times ' + y + ': that is ' + y + ' groups of ' + x + ', or ' + x + ' groups of ' + y +
      ' — either way it makes ' + ans + '. Remember the rhyme: "' + rhyme + '".';
    var explainZh = '口诀“' + kulei(x, y) + '”，' + y + ' 个 ' + x + ' 相加是 ' + ans + '。';
    return { subj: 'math', type: 'mul', q: q, a: String(ans), opts: numOpts(ans, 9, 0), speak: q, explain: explain, explainZh: explainZh, topicTag: MATH_TAG.mul };
  }

  function kulei(x, y) {
    var CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var a = x, b = y;
    if (!b) { /* 用于口诀展示：小在前 */ return null; }
    if (a > b) { var t = a; a = b; b = t; }
    var prod = a * b;
    var prodCn = prod < 10 ? '得' + CN[prod - 1] : (prod < 20 ? '十' + (prod % 10 ? CN[prod % 10 - 1] : '') : CN[Math.floor(prod / 10) - 1] + '十' + (prod % 10 ? CN[prod % 10 - 1] : ''));
    return CN[a - 1] + CN[b - 1] + prodCn;
  }

  function genCmp(level) {
    var mode = pick(['num', 'expr']);
    var max = level === 1 ? 20 : (level === 2 ? 50 : 100);
    var left, right, la, ra;
    if (mode === 'expr') {
      var x = ri(2, 20), y = ri(2, 20);
      var op = Math.random() < 0.5 ? '+' : '−';
      if (op === '−' && x < y) { var sw = x; x = y; y = sw; }
      la = op === '+' ? x + y : x - y;
      left = x + ' ' + op + ' ' + y;
      right = String(ri(1, max));
      ra = parseInt(right, 10);
    } else {
      la = ri(1, max); left = String(la);
      ra = ri(1, max); right = String(ra);
    }
    var sym = la > ra ? '>' : (la < ra ? '<' : '=');
    var q = 'Compare: ' + left + ' ○ ' + right + ' — choose >, < or =.';
    var word = { '>': 'greater than', '<': 'less than', '=': 'equal to' }[sym];
    var explain = left + ' makes ' + la + ' and ' + right + ' makes ' + ra + '. ' + la + ' is ' + word + ' ' + ra + ', so the sign is ' + sym + '.';
    var explainZh = left + '=' + la + '，' + right + '=' + ra + '，' + la + ({ '>': '大于', '<': '小于', '=': '等于' })[sym] + ' ' + ra + '，所以填 ' + sym + '。';
    var opts = makeOpts(sym, shuffle(['>', '<', '=', '≠'].filter(function (x) { return x !== sym; })));
    return { subj: 'math', type: 'cmp', q: q, a: sym, opts: opts, speak: 'Compare ' + left + ' and ' + right + '. Choose greater than, less than, or equal to.', explain: explain, explainZh: explainZh, topicTag: MATH_TAG.cmp };
  }

  function genLen(level) {
    var mode = pick(['conv', 'conv', 'unit', 'calc']);
    if (mode === 'conv') {
      var m = level === 3 ? ri(2, 9) : ri(1, 5);
      var q = m + ' meters = how many centimeters?';
      var ans = m * 100;
      return mkMath('len', q, ans, numOpts(ans, 100, 0), q,
        '1 meter = 100 centimeters, so ' + m + ' m = ' + m + ' × 100 = ' + ans + ' cm.',
        m + ' 米就是 ' + m + ' 个 100 厘米，是 ' + ans + ' 厘米。');
    }
    if (mode === 'unit') {
      var items = pick([
        { name: 'a pencil', good: 'centimeters (cm)', bad: 'meters (m)' },
        { name: 'the classroom door', good: 'meters (m)', bad: 'centimeters (cm)' },
        { name: 'the playground track', good: 'meters (m)', bad: 'centimeters (cm)' },
        { name: 'a math book', good: 'centimeters (cm)', bad: 'meters (m)' },
        { name: 'a big tree', good: 'meters (m)', bad: 'centimeters (cm)' }
      ]);
      var q2 = 'Which unit do you use to measure ' + items.name + '?';
      return mkMath('len', q2, items.good, makeOpts(items.good, [items.bad, 'yuan', 'pieces']), q2,
        items.good === 'centimeters (cm)'
          ? 'Short things are measured in centimeters. Long distances use meters.'
          : 'Tall or long things are measured in meters. Small things use centimeters.',
        items.good === 'centimeters (cm)' ? '短的东西用厘米量，长的用米。' : '高或长的东西用米量，短小的用厘米。');
    }
    var cmA = ri(30, 90), cmB = ri(5, 25);
    var sum = cmA + cmB;
    var q3 = cmA + ' cm + ' + cmB + ' cm = how many cm?';
    return mkMath('len', q3, sum, numOpts(sum, 20, 0), q3, cmA + ' + ' + cmB + ' = ' + sum + ' cm.', cmA + '+' + cmB + '=' + sum + ' 厘米。');
  }

  function genMoney(level) {
    var mode = pick(['conv', 'conv', 'change']);
    if (mode === 'conv') {
      var t = pick(['y2j', 'j2f', 'mixed']);
      if (t === 'y2j') {
        var y = level === 1 ? ri(1, 5) : ri(1, 9);
        var ans = y * 10;
        return mkMath('money', y + ' yuan = how many jiao?', ans, numOpts(ans, 10, 0), y + ' yuan equals how many jiao?',
          '1 yuan = 10 jiao, so ' + y + ' yuan = ' + ans + ' jiao.', '1 元是 10 角，' + y + ' 元是 ' + ans + ' 角。');
      }
      if (t === 'j2f') {
        var j = level === 1 ? ri(1, 5) : ri(1, 9);
        var ans2 = j * 10;
        return mkMath('money', j + ' jiao = how many fen?', ans2, numOpts(ans2, 10, 0), j + ' jiao equals how many fen?',
          '1 jiao = 10 fen, so ' + j + ' jiao = ' + ans2 + ' fen.', '1 角是 10 分，' + j + ' 角是 ' + ans2 + ' 分。');
      }
      var yy = ri(1, 5), jj = ri(1, 9), total = yy * 10 + jj;
      return mkMath('money', yy + ' yuan ' + jj + ' jiao = how many jiao?', total, numOpts(total, 10, 0),
        yy + ' yuan ' + jj + ' jiao equals how many jiao?',
        yy + ' yuan = ' + (yy * 10) + ' jiao, plus ' + jj + ' jiao = ' + total + ' jiao.', yy + ' 元是 ' + (yy * 10) + ' 角，再加 ' + jj + ' 角，共 ' + total + ' 角。');
    }
    var payY = level === 1 ? ri(2, 5) : ri(5, 10);
    var priceJ = ri(1, payY * 10 - 1);
    var changeJ = payY * 10 - priceJ;
    var pj = Math.floor(priceJ / 10), pf = priceJ % 10;
    var priceEn = (pj > 0 ? pj + ' yuan ' : '') + (pf > 0 ? pf + ' jiao' : (pj > 0 ? '' : '0 jiao'));
    var q = 'A pen costs ' + priceEn.trim() + '. You pay ' + payY + ' yuan. How much change (in jiao)?';
    var speak = 'A pen costs ' + priceEn.trim() + '. You pay ' + numWord(payY) + ' yuan. How much change in jiao?';
    return mkMath('money', q, changeJ, numOpts(changeJ, 10, 0), speak,
      payY + ' yuan = ' + (payY * 10) + ' jiao. ' + (payY * 10) + ' − ' + priceJ + ' = ' + changeJ + ' jiao change.',
      payY + ' 元是 ' + (payY * 10) + ' 角，' + (payY * 10) + '−' + priceJ + '=' + changeJ + '，应找回 ' + changeJ + ' 角。');
  }

  function genClock() {
    var half = Math.random() < 0.5;
    var h = ri(1, 12);
    var timeEn = half ? (numWord(h) + ' thirty') : (numWord(h) + " o'clock");
    var timeZh = half ? (numWord(h) + '时半') : (numWord(h) + '时');
    var descEn = half
      ? ['The minute hand points to 6 and the hour hand has passed ' + numWord(h) + '. What time is it?',
         'The hour hand is between ' + numWord(h) + ' and ' + numWord(h === 12 ? 1 : h + 1) + ', and the minute hand points to 6. What time is it?']
      : ['The minute hand points to 12 and the hour hand points to ' + numWord(h) + '. What time is it?',
         'It is ' + numWord(h) + " o'clock. Which number does the minute hand point to?"];
    var q, a, opts, explain, explainZh;
    if (!half && Math.random() < 0.4) {
      q = descEn[1]; a = '12';
      opts = makeOpts(a, ['6', '3', '9']);
      explain = "When it is " + numWord(h) + " o'clock, the minute hand points to 12 and the hour hand points to " + numWord(h) + '.';
      explainZh = '整点时，分针指 12。';
    } else {
      q = descEn[0]; a = timeEn;
      var wrongTimes = [];
      wrongTimes.push(half ? (numWord(h === 12 ? 1 : h + 1) + ' thirty') : (numWord(h === 12 ? 1 : h + 1) + " o'clock"));
      wrongTimes.push(half ? (numWord(h) + " o'clock") : (numWord(h) + ' thirty'));
      wrongTimes.push(half ? (numWord(h === 1 ? 12 : h - 1) + ' thirty') : (numWord(h === 1 ? 12 : h - 1) + " o'clock"));
      opts = makeOpts(a, shuffle(wrongTimes));
      explain = half
        ? 'The minute hand on 6 means half past. The hour hand has passed ' + numWord(h) + ', so it is ' + timeEn + '.'
        : 'The minute hand on 12 means o\'clock. The hour hand points to ' + numWord(h) + ', so it is ' + timeEn + '.';
      explainZh = half ? ('分针指 6 是"半"，时针走过 ' + numWord(h) + '，是 ' + timeZh + '。') : ('分针指 12，时针指 ' + numWord(h) + '，是 ' + timeZh + '。');
    }
    return mkMath('clock', q, a, opts, q, explain, explainZh);
  }

  function genWord(level) {
    var tpl = pick(level === 1 ? ['buy', 'share', 'add2'] : ['buy', 'share', 'twostep', 'compare']);
    var q, a, opts, speak, explain, explainZh;
    if (tpl === 'buy') {
      var p1 = ri(2, 9) * 5, p2 = ri(1, 4) * 10;
      var total = p1 + p2;
      var it1 = pick(['pencils', 'notebooks', 'stickers']), it2 = pick(['erasers', 'bookmarks', 'rulers']);
      q = 'Ben buys ' + it1 + ' for ' + p1 + ' yuan and ' + it2 + ' for ' + p2 + ' yuan. How much does he spend in all?';
      a = total; opts = numOpts(a, 20, 0); speak = q;
      explain = 'Add the two amounts: ' + p1 + ' + ' + p2 + ' = ' + total + ' yuan.';
      explainZh = '把两样花的钱合起来：' + p1 + '+' + p2 + '=' + total + ' 元。';
    } else if (tpl === 'share') {
      var k = ri(2, 6), each = ri(2, 8), n = k * each;
      q = 'Share ' + n + ' candies equally among ' + k + ' children. How many does each child get?';
      a = each; opts = numOpts(a, 5, 1); speak = q;
      explain = 'Share means divide: ' + n + ' ÷ ' + k + ' = ' + each + '. Each child gets ' + each + '.';
      explainZh = '平均分用除法：' + n + '÷' + k + '=' + each + '，每人 ' + each + ' 个。';
    } else if (tpl === 'add2') {
      var x = ri(10, 40), y = ri(5, 30), z = ri(3, 20);
      q = 'There were ' + x + ' birds on the tree. ' + y + ' flew in, then ' + z + ' flew away. How many birds are on the tree now?';
      a = x + y - z; opts = numOpts(a, 10, 0); speak = q;
      explain = 'First ' + x + ' + ' + y + ' = ' + (x + y) + ', then ' + (x + y) + ' − ' + z + ' = ' + a + ' birds.';
      explainZh = '先加飞来的，再减飞走的，最后是 ' + a + ' 只。';
    } else if (tpl === 'twostep') {
      var price = ri(2, 9) * 3 + 1; price = Math.max(3, price);
      var buy = ri(2, 4), pay = 20;
      var spend = price * buy;
      if (spend > pay) { spend = price * 2; buy = 2; }
      if (spend >= pay) { spend = pay - 5; }
      q = 'One notebook costs ' + price + ' yuan. Buy ' + buy + '. You pay ' + pay + ' yuan. How much change do you get?';
      a = pay - spend; opts = numOpts(a, 8, 0); speak = q;
      explain = 'Total: ' + price + ' × ' + buy + ' = ' + spend + ' yuan. Change: ' + pay + ' − ' + spend + ' = ' + a + ' yuan.';
      explainZh = '先算总价 ' + price + '×' + buy + '=' + spend + ' 元，再算找零 ' + pay + '−' + spend + '=' + a + ' 元。';
    } else {
      var m = ri(10, 50), more = ri(5, 30);
      var whoA = pick(['Big brother', 'Big sister', 'Dad']), whoB = pick(['Little brother', 'Little sister', 'Ben']);
      q = whoB + ' has ' + m + ' stickers. ' + whoA + ' has ' + more + ' more than ' + whoB + '. How many stickers does ' + whoA + ' have?';
      a = m + more; opts = numOpts(a, 10, 0); speak = q;
      explain = whoA + ' has the same ' + m + ' plus ' + more + ': ' + m + ' + ' + more + ' = ' + a + '.';
      explainZh = '先想一样多的部分 ' + m + '，再多 ' + more + '，' + m + '+' + more + '=' + a + '。';
    }
    return mkMath('word', q, a, opts, speak, explain, explainZh);
  }

  function genSeq(level) {
    var kind = pick(['add', 'sub', 'mul', 'fib', 'alt']);
    var arr = [], ruleEn = '', ruleZh = '', ans;
    if (kind === 'add') {
      var d = ri(2, level === 1 ? 5 : 9), st = ri(1, 10);
      for (var i = 0; i < 6; i++) arr.push(st + d * i);
      ruleEn = 'it goes up by ' + d + ' each time'; ruleZh = '每次加 ' + d; ans = st + d * 5;
    } else if (kind === 'sub') {
      var d2 = ri(2, 6), st2 = ri(40, 90);
      for (var i2 = 0; i2 < 6; i2++) arr.push(st2 - d2 * i2);
      ruleEn = 'it goes down by ' + d2 + ' each time'; ruleZh = '每次减 ' + d2; ans = st2 - d2 * 5;
    } else if (kind === 'mul') {
      var b = ri(2, 4);
      arr = []; for (var i4 = 0; i4 < 5; i4++) arr.push(b * Math.pow(2, i4));
      ruleEn = 'each number doubles'; ruleZh = '每次乘 2'; ans = b * Math.pow(2, 5);
      if (ans > 200) { arr = [4, 8, 12, 16, 20]; ruleEn = 'it goes up by 4 each time'; ruleZh = '每次加 4'; ans = 24; }
    } else if (kind === 'fib') {
      var x1 = ri(1, 3), y1 = ri(2, 5);
      arr = [x1, y1];
      for (var i6 = 0; i6 < 4; i6++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
      ruleEn = 'each number is the sum of the two before it'; ruleZh = '每个数等于前两个数相加'; ans = arr[arr.length - 1];
      if (ans > 200) { arr = [1, 2, 3, 5, 8]; ans = 13; }
    } else {
      var a1 = ri(1, 9), d3 = ri(2, 6), d4 = ri(1, 4);
      arr = [a1, a1 + d3, a1 + d3 + d4, a1 + d3 * 2 + d4, a1 + d3 * 2 + d4 * 2];
      ruleEn = 'it adds ' + d3 + ' then ' + d4 + ', taking turns'; ruleZh = '交替加 ' + d3 + ' 和 ' + d4; ans = arr[4] + d3;
    }
    var show = arr.slice(0, 5);
    var q = 'Find the pattern: ' + show.join(', ') + ', ( ? )';
    return mkMath('seq', q, ans, numOpts(ans, Math.max(6, Math.round(ans * 0.2)), 0), q,
      'Look at the pattern — ' + ruleEn + ', so the next number is ' + ans + '.',
      '规律是' + ruleZh + '，所以括号里填 ' + ans + '。');
  }

  function genShape() {
    var mode = pick(['angleType', 'count', 'rightAngle']);
    if (mode === 'angleType') {
      var obj = pick([
        { name: 'the corner of a math book', t: 'right angle', tz: '直角' },
        { name: 'the big corner on a red scarf', t: 'obtuse angle', tz: '钝角' },
        { name: 'the smallest corner on a triangle ruler', t: 'acute angle', tz: '锐角' },
        { name: 'the angle the hands make at 3 o\'clock', t: 'right angle', tz: '直角' },
        { name: 'the angle between two open scissor blades, wide open', t: 'obtuse angle', tz: '钝角' },
        { name: 'the angle the hands make at 1 o\'clock', t: 'acute angle', tz: '锐角' }
      ]);
      var qa = 'What kind of angle is ' + obj.name + '?';
      return mkMath('shape', qa, obj.t, makeOpts(obj.t, ['right angle', 'acute angle', 'obtuse angle'].filter(function (x) { return x !== obj.t; })), qa,
        'An angle smaller than a right angle is acute; bigger is obtuse; a perfect square corner is a right angle. ' + obj.name + ' is a ' + obj.t + '.',
        '比直角小的是锐角，大的是钝角，方方正正的是直角。');
    }
    if (mode === 'count') {
      var tc = pick([
        { q: 'How many corners does a triangle have?', a: 3, zh: '三角形有 3 个角。' },
        { q: 'How many corners does a square have?', a: 4, zh: '正方形有 4 个角，都是直角。' },
        { q: 'How many corners does a red scarf (triangle) have?', a: 3, zh: '红领巾是三角形，有 3 个角。' },
        { q: 'How many corners does a triangle ruler have?', a: 3, zh: '三角尺有 3 个角。' }
      ]);
      return mkMath('shape', tc.q, tc.a, numOpts(tc.a, 3, 0), tc.q,
        'Count the sides and corners: a triangle has 3 corners, a square has 4 with right angles.', tc.zh);
    }
    var t2 = pick([
      { q: 'Which object has right angles on its surface?', a: 'a math book', opts: ['a math book', 'a ball', 'an orange', 'an egg'] },
      { q: 'Which shape has right angles?', a: 'a square', opts: ['a square', 'a circle', 'an oval', 'a fan'] }
    ]);
    return mkMath('shape', t2.q, t2.a, makeOpts(t2.a, t2.opts.filter(function (x) { return x !== t2.a; })), t2.q,
      t2.a + ' has square corners — those are right angles. Round shapes have no corners.', t2.a + '有直角；圆形的面没有角。');
  }

  /* ---------- 英语出题 ---------- */
  function genListen() {
    var w = pickWeighted(B.EN_WORDS);
    /* MT-EN-ZH-02 (Chief 接管改): 选项去中文——听音选英文单词（拼写辨别），零 CJK */
    var right = w.en;
    var wrong = sample(B.EN_WORDS, 3, w).map(function (x) { return x.en; });
    return { subj: 'english', type: 'listen', q: '🔊 Listen and choose the correct word.',
      a: right, opts: makeOpts(right, wrong), speak: w.en,
      explain: w.en + '. Say it with me: ' + w.en + '.',
      explainZh: w.en + ' 的意思是“' + w.zh + '”。', topicTag: enTagForWord(w.en) };
  }

  function genCn2En() {
    var w = pickWeighted(B.EN_WORDS);
    return { subj: 'english', type: 'cn2en', q: 'Type the English word for "' + w.zh + '" ' + w.emoji,
      a: w.en, opts: undefined,
      speak: 'Type the English word.',
      explain: 'The English word is ' + w.en + '. Say it with me: ' + w.en + '.',
      explainZh: '“' + w.zh + '”的英文是 ' + w.en + '。', topicTag: enTagForWord(w.en) };
  }

  function genEn2Cn() {
    /* MT-EN-ZH-02 (Chief 接管改): 选项去中文——看词选英文释义。题池换 EN_VOCAB（有 en_def），
       EN_WORDS 31 词仍由 cn2en/spell/listen 覆盖；无 en_def 词条不入本池。 */
    var pool = B.EN_VOCAB.filter(function (x) { return x.en_def; });
    if (!pool.length) pool = B.EN_VOCAB;
    var w = pickWeighted(pool);
    var right = w.en_def || w.en;
    var wrong = sample(pool, 3, w).map(function (x) { return x.en_def || x.en; })
      .filter(function (d, i, arr) { return d !== right; });
    return { subj: 'english', type: 'en2cn', q: 'What does "' + w.en + '" mean?',
      a: right, opts: makeOpts(right, wrong), speak: w.en,
      explain: 'The word "' + w.en + '" means "' + (w.en_def || w.en) + '".',
      explainZh: '"' + w.en + '" 的意思是“' + w.zh + '”。', topicTag: enTagForWord(w.en) };
  }

  function genSpell() {
    var pool = B.EN_WORDS.filter(function (w) { return /^[a-z]+$/i.test(w.en) && w.en.length >= 3 && w.en.length <= 7; });
    if (!pool.length) pool = B.EN_WORDS;
    var w = pickWeighted(pool);
    var word = w.en;
    var pos = ri(0, word.length - 1);
    var letter = word[pos];
    var blanked = word.slice(0, pos) + '_' + word.slice(pos + 1);
    var wrongLetters = [];
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var guard = 0;
    while (wrongLetters.length < 3 && guard < 50) {
      guard++;
      var c = alpha[ri(0, 25)];
      if (c !== letter && wrongLetters.indexOf(c) < 0) wrongLetters.push(c);
    }
    return { subj: 'english', type: 'spell',
      q: 'Complete the word: ' + blanked + '.',
      a: letter, opts: makeOpts(letter, wrongLetters), speak: 'Complete the word.',
      explain: 'The full word is ' + word + '. The missing letter is ' + letter + '.',
      explainZh: '完整单词是 ' + word + '（' + w.zh + ' ' + w.emoji + '），缺的字母是 ' + letter + '。', topicTag: enTagForWord(w.en) };
  }

  function genCloze() {
    var it = pickWeighted(B.EN_CLOZE);
    return { subj: 'english', type: 'cloze',
      q: 'Fill in the blank: ' + it.s.replace(/_+/, '＿＿＿'),
      a: it.right, opts: makeOpts(it.right, shuffle(it.wrong)), speak: 'Fill in the blank.',
      explain: 'Full sentence: ' + it.s.replace(/_+/, it.right) + '.',
      explainZh: '完整句子：' + it.s.replace(/_+/, it.right) + '（' + it.zh + '）', topicTag: clozeTagSmart(it) };
  }

  function genPhrase() {
    var it = pickWeighted(B.EN_PHRASES);
    /* MT-EN-ZH-02: 出 q_en 走 app.js qText 英文闸；zh 题干留中文模式与错题本 */
    return { subj: 'english', type: 'phrase', q: it.zh + '  (What would you say in English?)', q_en: (it.en || '') + '  (What would you say in English?)',
      a: it.right, opts: makeOpts(it.right, shuffle(it.wrong)), speak: 'What would you say in English?',
      explain: 'You should say: ' + it.right,
      explainZh: '这种时候应该说：' + it.right, topicTag: phraseTag(it.right) };
  }

  /* ---------- 数学：120 以内加减 ---------- */
  function addCarries(a, b) { return (a % 10) + (b % 10) >= 10; }
  function subBorrows(a, b) { return (a % 10) < (b % 10); }

  function genCalc120(kind, lv) {
    var a = 0, b = 0, t = 0;
    var wantCarry = lv >= 2;
    do {
      t++;
      if (kind === 'add') { a = ri(15, 99); b = ri(6, 120 - a); }
      else { a = ri(35, 120); b = ri(6, Math.min(a - 1, 90)); }
    } while (t < 40 && ((kind === 'add' ? addCarries(a, b) : subBorrows(a, b)) !== wantCarry));
    var ans = kind === 'add' ? a + b : a - b;
    var type = kind === 'add' ? 'calc120_add' : 'calc120_sub';
    var q = 'What is ' + a + (kind === 'add' ? ' + ' : ' − ') + b + '?';
    var ta = Math.floor(a / 10) * 10, tb = Math.floor(b / 10) * 10, oa = a % 10, ob = b % 10;
    var explain, explainZh;
    if (kind === 'add') {
      explain = 'Break apart: ' + ta + ' + ' + tb + ' = ' + (ta + tb) + ', and ' + oa + ' + ' + ob + ' = ' + (oa + ob) +
        (oa + ob >= 10 ? ' — that is ten or more, so carry ten.' : '') + ' Put them back together: ' + ans + '.';
      explainZh = 'break apart：' + ta + '＋' + tb + '＝' + (ta + tb) + '，' + oa + '＋' + ob + '＝' + (oa + ob) + '，合起来 ' + ans + '。';
    } else if (subBorrows(a, b)) {
      explain = 'Break apart: the ones need help, so borrow one ten. ' + (oa + 10) + ' − ' + ob + ' = ' + (oa + 10 - ob) +
        ', and the tens become ' + (ta - 10) + ' − ' + tb + ' = ' + (ta - 10 - tb) + '. The answer is ' + ans + '.';
      explainZh = 'break apart：个位 ' + oa + ' 减 ' + ob + ' 不够，从十位借 1 个十：' + (oa + 10) + '−' + ob + '＝' + (oa + 10 - ob) + '，合起来 ' + ans + '。';
    } else {
      explain = 'Break apart: ' + ta + ' − ' + tb + ' = ' + (ta - tb) + ' and ' + oa + ' − ' + ob + ' = ' + (oa - ob) + '. Put them together: ' + ans + '.';
      explainZh = 'break apart：' + ta + '−' + tb + '＝' + (ta - tb) + '，' + oa + '−' + ob + '＝' + (oa - ob) + '，合起来 ' + ans + '。';
    }
    return { subj: 'math', type: type, q: q, a: String(ans), opts: numOpts(ans, 10, 0), speak: q, explain: explain, explainZh: explainZh, topicTag: MATH_TAG[type] };
  }

  /* ---------- 数学：三位数竖式（讲义重点） ---------- */
  function vSpace(n) { var s = ''; for (var i = 0; i < n; i++) s += ' '; return s; }
  function vLayout(a, b, op) {
    function sp(n) { return String(n).split('').join(' '); }
    var sa = sp(a), sb = sp(b);
    var w = Math.max(sa.length, sb.length) + 2;
    var top = vSpace(w - sa.length) + sa;
    var bot = vSpace(Math.max(0, w - sb.length - 2)) + op + ' ' + sb;
    var rule = new Array(w + 1).join('─');
    return top + '\n' + bot + '\n' + rule + '\n= ?';
  }

  function genVertical(kind, lv) {
    var a = 0, b = 0, t = 0;
    if (kind === 'add') {
      do {
        t++;
        if (lv === 1) { a = ri(101, 118); b = ri(11, 49); }
        else if (lv === 2) {
          if (Math.random() < 0.5) { a = ri(100, 119); b = ri(15, 59); }
          else { a = ri(58, 89); b = ri(18, 55); }
        } else {
          if (Math.random() < 0.5) { a = ri(101, 118); b = ri(11, 49); }
          else { a = ri(48, 89); b = ri(15, 55); }
        }
      } while (t < 40 && (lv === 1 ? addCarries(a, b) : !addCarries(a, b)));
      if (lv === 1 && addCarries(a, b)) { a = 103; b = 42; }
      if (lv >= 2 && !addCarries(a, b)) { a = 68; b = 57; }
      var sum = a + b;
      var oa = a % 10, ob = b % 10;
      var expEn = (lv === 1)
        ? 'Line up the ones and the tens, then add column by column: ' + a + ' + ' + b + ' = ' + sum + '.'
        : 'Column addition: add the ones first. ' + oa + ' + ' + ob + ' = ' + (oa + ob) +
          ', so carry the ten above the tens column. Then add the tens plus the carried ten. The answer is ' + sum + '.';
      var expZh = (lv === 1)
        ? '相同数位对齐，从个位加起，答案是 ' + sum + '。'
        : '个位 ' + oa + '＋' + ob + '＝' + (oa + ob) + '，满十进一，答案 ' + sum + '。';
      return {
        subj: 'math', type: 'vertical_add', q: 'Column addition: solve the vertical sentence.\n' + vLayout(a, b, '+'),
        a: String(sum), opts: numOpts(sum, 20, 0),
        speak: 'Column addition: what is ' + a + ' plus ' + b + '?', explain: expEn, explainZh: expZh, topicTag: 'shushi'
      };
    }
    if (lv === 1) {
      do { t++; a = ri(45, 119); b = ri(11, Math.max(12, Math.min(a - 11, 49))); }
      while (t < 40 && (subBorrows(a, b) || Math.floor(a / 10) % 10 < Math.floor(b / 10) || a - b < 10));
    } else if (lv === 2) {
      do { t++; a = ri(41, 99); b = ri(12, 45); }
      while (t < 40 && (!subBorrows(a, b) || Math.floor(a / 10) % 10 <= Math.floor(b / 10) || a - b < 10));
    } else if (Math.random() < 0.5) {
      a = ri(100, 106); b = ri(25, 65);
    } else {
      do { t++; a = ri(41, 99); b = ri(12, 45); }
      while (t < 40 && (!subBorrows(a, b) || Math.floor(a / 10) % 10 <= Math.floor(b / 10) || a - b < 10));
    }
    var oa2 = a % 10, ob2 = b % 10, ta2 = Math.floor(a / 10) % 10, tb2 = Math.floor(b / 10);
    var expS, expSZh, crossed = false;
    if (oa2 < ob2 && ta2 === 0) {
      crossed = true;
      expS = 'Column subtraction with a zero! Think of 100 as 10 tens. Borrow one ten from the hundreds: 100 becomes 9 tens and 10 ones. ' +
        'Now the ones: ' + oa2 + ' + 10 − ' + ob2 + ' = ' + (oa2 + 10 - ob2) + '. The tens left: 9 − ' + tb2 + ' = ' + (9 - tb2) + '. The answer is ' + (a - b) + '.';
      expSZh = '跨 0 退位：十位是 0 没法退，把 100 想成 10 个十，从百位拿 1 个百变成 10 个十，退 1 个十给个位，答案 ' + (a - b) + '。';
    } else if (oa2 < ob2) {
      expS = 'The ones need help: ' + oa2 + ' cannot take away ' + ob2 + '. Borrow one ten, so ' + (oa2 + 10) + ' − ' + ob2 + ' = ' + (oa2 + 10 - ob2) +
        '. The tens: ' + ta2 + ' − 1 − ' + tb2 + ' = ' + (ta2 - 1 - tb2) + '. The answer is ' + (a - b) + '.';
      expSZh = '个位不够减，从十位退 1 个十，答案 ' + (a - b) + '。';
    } else {
      expS = 'Subtract column by column: ' + oa2 + ' − ' + ob2 + ' = ' + (oa2 - ob2) + ', ' + ta2 + ' − ' + tb2 + ' = ' + (ta2 - tb2) + '. The answer is ' + (a - b) + '.';
      expSZh = '相同数位对齐，从个位减起，答案 ' + (a - b) + '。';
    }
    return {
      subj: 'math', type: 'vertical_sub', q: 'Column subtraction: solve the vertical sentence.\n' + vLayout(a, b, '−'),
      a: String(a - b), opts: numOpts(a - b, 15, 0),
      speak: 'Column subtraction: what is ' + a + ' minus ' + b + '?', explain: expS, explainZh: expSZh, topicTag: 'shushi'
    };
  }

  /* ---------- 数学：计算策略（compensation / number line / partial sum / 术语） ---------- */
  function genStrategy() {
    var mode = pick(['comp', 'numberline', 'partial', 'vocab']);
    if (mode === 'comp') {
      var a = pick([27, 28, 38, 47, 48, 58, 68, 78, 87, 88, 89]);
      var b = ri(21, 49);
      var toTen = (10 - (a % 10)) % 10;
      if (toTen === 0) { a = 78; toTen = 2; }
      var ans = a + b;
      var q = 'Use compensation — how would you think about ' + a + ' + ' + b + '?  (First make ' + a + ' into ' + (a + toTen) + ', then add ' + (b - toTen) + '.)';
      return mkMath('strategy', q, ans, numOpts(ans, 15, 0), 'Use compensation: what is ' + a + ' plus ' + b + '?',
        'Compensation: ' + a + ' is close to ' + (a + toTen) + '. Add ' + toTen + ' to make ' + (a + toTen) + ', then add ' + (b - toTen) + ': ' + (a + toTen) + ' + ' + (b - toTen) + ' = ' + ans + '. Change the numbers, keep the total the same.',
        '凑整法：把 ' + a + ' 凑成 ' + (a + toTen) + '，多加的 ' + toTen + ' 从另一个数里减掉，[' + (a + toTen) + '＋' + (b - toTen) + '＝' + ans + ']。');
    }
    if (mode === 'numberline') {
      var x = ri(25, 59), y = ri(23, 49);
      var tens = Math.floor(y / 10) * 10;
      var q2 = 'On an open number line, what is the best FIRST jump for ' + x + ' + ' + y + '?';
      return mkMath('strategy', q2, tens, makeOpts(String(tens), [String(y % 10), String(y), '10']),
        'On an open number line, what is the first jump for ' + x + ' plus ' + y + '?',
        'Start at ' + x + ' and count on in friendly jumps: first ' + tens + ' (to ' + (x + tens) + '), then ' + (y % 10) + '.',
        '数轴上先跳整十 ' + tens + '，再跳个位 ' + (y % 10) + '。');
    }
    if (mode === 'partial') {
      var p = ri(23, 48), r = ri(13, 38);
      var pt = Math.floor(p / 10) * 10, po = p % 10, rt = Math.floor(r / 10) * 10, ro = r % 10;
      var total = p + r;
      var q3 = 'Partial sums for ' + p + ' + ' + r + ': tens ' + pt + ' + ' + rt + ' = ' + (pt + rt) + ', ones ' + po + ' + ' + ro + ' = ' + (po + ro) + '. What is the total?';
      return mkMath('strategy', q3, total, numOpts(total, 10, 0), 'Add the tens, then the ones. What is the total?',
        'Partial sums: ' + (pt + rt) + ' + ' + (po + ro) + ' = ' + total + '.',
        'partial sum（部分和）：' + (pt + rt) + '＋' + (po + ro) + '＝' + total + '。');
    }
    var items = [
      { q: 'In 32 + 26 = 58, what do we call 32 and 26?', a: 'addends', w: ['sum', 'difference', 'whole'] },
      { q: 'What do we call the answer 58 in 32 + 26 = 58?', a: 'sum', w: ['addend', 'part', 'perimeter'] },
      { q: 'In 45 − 12 = 33, what do we call 45?', a: 'minuend', w: ['subtrahend', 'difference', 'addend'] },
      { q: 'What do we call 33 in 45 − 12 = 33?', a: 'difference', w: ['minuend', 'subtrahend', 'sum'] },
      { q: 'What do we call 12 in 45 − 12 = 33?', a: 'subtrahend', w: ['minuend', 'difference', 'part'] }
    ];
    var it = pick(items);
    return mkMath('strategy', it.q, it.a, makeOpts(it.a, shuffle(it.w)), it.q,
      'In a + b = c, a and b are the addends and c is the sum. In a − b = c, a is the minuend, b is the subtrahend, c is the difference.',
      '算式的名字要记牢：加数、和；被减数、减数、差。');
  }

  /* ---------- 数学：长度（公制+英制） ---------- */
  function genLenMixed() {
    var mode = pick(['metric', 'imperial', 'conv', 'conv2']);
    if (mode === 'metric') {
      var items = [
        { name: 'a pencil', good: 'centimeters (cm)', bad: 'meters (m)', why: 'A pencil is short — use centimeters.' },
        { name: 'a classroom door', good: 'meters (m)', bad: 'centimeters (cm)', why: 'A door is tall — use meters.' },
        { name: 'the playground track', good: 'meters (m)', bad: 'centimeters (cm)', why: 'A track is long — use meters.' },
        { name: 'a math book', good: 'centimeters (cm)', bad: 'meters (m)', why: 'A book is short — use centimeters.' },
        { name: 'a big tree', good: 'meters (m)', bad: 'centimeters (cm)', why: 'A tree is tall — use meters.' }
      ];
      var it = pick(items);
      var q = 'Which unit do you use to measure ' + it.name + '?';
      return mkMath('len_mixed', q, it.good, makeOpts(it.good, [it.bad, 'yuan', 'pieces']), q,
        it.why + ' Remember: 1 meter = 100 centimeters.', '短的东西用厘米，长的用米；1 米＝100 厘米。');
    }
    if (mode === 'imperial') {
      var items2 = [
        { name: 'a pencil', good: 'inch', bad1: 'foot', why: 'A pencil is small — use inches.' },
        { name: 'your brother\'s height', good: 'foot', bad1: 'inch', why: 'Height is measured in feet, like about 4 feet.' },
        { name: 'the playground', good: 'yard', bad1: 'inch', why: 'Long distances use yards: 1 yard = 3 feet.' },
        { name: 'the classroom width', good: 'foot', bad1: 'inch', why: 'Room size uses feet.' }
      ];
      var it2 = pick(items2);
      var q2 = 'In the imperial system, which unit fits ' + it2.name + ' best?';
      return mkMath('len_mixed', q2, it2.good, makeOpts(it2.good, [it2.bad1, 'centimeters (cm)', 'meters (m)']), q2,
        it2.why, '英制里：短的用 inch，身高用 foot，长的用 yard。');
    }
    if (mode === 'conv') {
      var m = ri(1, 5);
      var ans = m * 100;
      var q3 = m + ' meters = how many centimeters?';
      return mkMath('len_mixed', q3, ans, numOpts(ans, 100, 0), q3,
        '1 meter = 100 centimeters, so ' + m + ' m = ' + m + ' × 100 = ' + ans + ' cm.', m + ' 米＝' + ans + ' 厘米。');
    }
    var pair = pick([
      { q: 'About how long is 1 meter?', a: 'about 3 feet', w: ['about 3 inches', 'about 3 yards', 'about 30 feet'], e: '1 meter ≈ 3 feet. A classroom door is about 2 m ≈ 6 feet.' },
      { q: 'How many feet are in 1 yard?', a: '3 feet', w: ['12 feet', '1 foot', '36 feet'], e: '1 yard = 3 feet, and 1 foot = 12 inches.' }
    ]);
    return mkMath('len_mixed', pair.q, pair.a, makeOpts(pair.a, shuffle(pair.w)), pair.q, pair.e, '1 米≈3 英尺；1 码＝3 英尺，1 英尺＝12 英寸。');
  }

  /* ---------- 数学：周长 / 缺边 ---------- */
  function genPerimeter() {
    var mode = pick(['rect', 'tri', 'pent', 'around', 'missing']);
    if (mode === 'rect') {
      var l = ri(3, 18), w = ri(2, 12);
      var p = 2 * (l + w);
      var q = 'A rectangle is ' + l + ' cm long and ' + w + ' cm wide. What is its perimeter?';
      return mkMath('perimeter', q, p, numOpts(p, 12, 0), q,
        'Perimeter is the total distance around. Rectangle: (' + l + ' + ' + w + ') × 2 = ' + p + ' cm.',
        '长方形周长＝(长＋宽)×2＝' + p + ' 厘米。');
    }
    if (mode === 'tri') {
      var s1 = ri(3, 15), s2 = ri(3, 15), s3 = ri(3, 15);
      var total = s1 + s2 + s3;
      var q2 = 'A triangle has sides of ' + s1 + ', ' + s2 + ' and ' + s3 + ' cm. What is its perimeter?';
      return mkMath('perimeter', q2, total, numOpts(total, 10, 0), q2,
        'Add all the sides: ' + s1 + ' + ' + s2 + ' + ' + s3 + ' = ' + total + ' cm.',
        '周长就是围一圈的总长度：' + s1 + '＋' + s2 + '＋' + s3 + '＝' + total + ' 厘米。');
    }
    if (mode === 'pent') {
      var side = ri(2, 9);
      var pp = side * 5;
      var q3 = 'Each side of a pentagon is ' + side + ' cm. What is its perimeter?';
      return mkMath('perimeter', q3, pp, numOpts(pp, 8, 0), q3,
        'A pentagon has 5 sides: ' + side + ' × 5 = ' + pp + ' cm.', '五边形 5 条边：' + side + '×5＝' + pp + ' 厘米。');
    }
    if (mode === 'around') {
      var l2 = ri(10, 30), w2 = ri(5, 20);
      var per = 2 * (l2 + w2);
      var q4 = 'Sam runs one lap around a rectangular garden. It is ' + l2 + ' m long and ' + w2 + ' m wide. What is the total distance?';
      return mkMath('perimeter', q4, per, numOpts(per, 15, 0), 'Sam runs one lap around the rectangular garden. How far does he run?',
        'One lap = the perimeter: (' + l2 + ' + ' + w2 + ') × 2 = ' + per + ' m.', '绕一圈＝周长＝(' + l2 + '＋' + w2 + ')×2＝' + per + ' 米。');
    }
    if (Math.random() < 0.6) {
      var L = ri(4, 12), W = ri(2, 9), P = 2 * (L + W);
      var q5 = 'The perimeter is ' + P + ' cm and the width is ' + W + ' cm. What is the missing side length?';
      return mkMath('perimeter', q5, L, numOpts(L, 6, 0), q5,
        'Missing side length: length + width = ' + P + ' ÷ 2 = ' + (P / 2) + ', so length = ' + (P / 2) + ' − ' + W + ' = ' + L + ' cm.',
        '周长 ' + P + '，宽 ' + W + '，长＝' + P + '÷2−' + W + '＝' + L + ' 厘米。');
    }
    var sA = ri(4, 12), sB = ri(4, 12), PC = sA + sB + ri(4, 12);
    var sC = PC - sA - sB;
    var q6 = 'A triangle has a perimeter of ' + PC + ' cm. Two sides are ' + sA + ' and ' + sB + ' cm. How long is the third side?';
    return mkMath('perimeter', q6, sC, numOpts(sC, 6, 0), q6,
      'Third side = perimeter − two known sides = ' + PC + ' − ' + sA + ' − ' + sB + ' = ' + sC + ' cm.',
      '第三条边＝周长减去两条已知边。');
  }

  /* ---------- 数学：2D 图形属性 ---------- */
  function genShape2d() {
    var mode = pick(['prop', 'count', 'polygon']);
    if (mode === 'prop') {
      var items = [
        { d: '4 sides, 4 right angles, and all 4 sides are equal', a: 'a square', w: ['a rectangle', 'a triangle', 'a rhombus'], zh: '正方形：4 条边一样长、4 个直角。' },
        { d: '4 sides, 4 right angles, and opposite sides are equal', a: 'a rectangle', w: ['a square', 'a triangle', 'a pentagon'], zh: '长方形：对边相等、4 个直角。' },
        { d: '3 sides and 3 angles', a: 'a triangle', w: ['a quadrilateral', 'a pentagon', 'a hexagon'], zh: '三角形有 3 条边。' },
        { d: '5 sides', a: 'a pentagon', w: ['a quadrilateral', 'a hexagon', 'a triangle'], zh: '五边形有 5 条边。' },
        { d: '6 sides', a: 'a hexagon', w: ['a pentagon', 'a quadrilateral', 'a square'], zh: '六边形有 6 条边。' },
        { d: '4 equal sides but no right angles', a: 'a rhombus', w: ['a square', 'a rectangle', 'a triangle'], zh: '菱形 4 边相等但没有直角。' }
      ];
      var it = pick(items);
      return mkMath('shape2d', 'A shape has ' + it.d + '. What is it?', it.a, makeOpts(it.a, shuffle(it.w)),
        'A shape has ' + it.d + '. What is it?', 'Look at the sides and angles: this is ' + it.a + '.', it.zh);
    }
    if (mode === 'count') {
      var items2 = [
        { q: 'How many vertices does a pentagon have?', a: 5, w: ['3', '4', '6'], zh: '五边形 5 个顶点。' },
        { q: 'How many sides does a triangle have?', a: 3, w: ['2', '4', '5'], zh: '三角形 3 条边。' },
        { q: 'How many sides does a hexagon have?', a: 6, w: ['4', '5', '8'], zh: '六边形 6 条边。' },
        { q: 'How many corners does a quadrilateral have?', a: 4, w: ['3', '5', '6'], zh: '四边形 4 个角。' }
      ];
      var it2 = pick(items2);
      return mkMath('shape2d', it2.q, it2.a, makeOpts(String(it2.a), it2.w), it2.q,
        'Count the sides and vertices: a triangle has 3, a quadrilateral 4, a pentagon 5, a hexagon 6.', it2.zh);
    }
    var items3 = Math.random() < 0.5
      ? { q: 'Which one is a polygon? (closed + straight sides only)', a: 'a triangle', w: ['a circle', 'an oval', 'a ball'] }
      : { q: 'Which one is NOT a polygon?', a: 'a circle', w: ['a triangle', 'a square', 'a pentagon'] };
    return mkMath('shape2d', items3.q, items3.a, makeOpts(items3.a, shuffle(items3.w)), items3.q,
      'A polygon is closed and has only straight sides. Curved shapes like circles are not polygons.',
      '多边形要“封闭＋全是直线边”；有曲线的不是多边形。');
  }

  /* ---------- 数学：面积（数方格） ---------- */
  function genAreaGrid() {
    var r = ri(2, 9), c = ri(2, 9);
    var area = r * c;
    if (Math.random() < 0.6) {
      var q = 'How many square units? Count ' + r + ' rows of ' + c + '.';
      return mkMath('area_grid', q, area, numOpts(area, 8, 0), q,
        'Area = rows × columns = ' + r + ' × ' + c + ' = ' + area + ' square units.', '面积＝行数×每行个数＝' + area + ' 个 square unit。');
    }
    var cols = ri(2, 6), rows = ri(2, 6), ar = cols * rows;
    var q2 = 'A rectangle has an area of ' + ar + ' square units and ' + cols + ' squares in each row. How many rows?';
    return mkMath('area_grid', q2, rows, numOpts(rows, 5, 1), q2,
      'Rows = total area ÷ squares per row = ' + ar + ' ÷ ' + cols + ' = ' + rows + '.', '行数＝总面积÷每行个数。');
  }

  /* ---------- 数学：3D 图形 ---------- */
  function genShape3d() {
    var mode = pick(['count', 'match', 'attr']);
    if (mode === 'count') {
      var items = [
        { q: 'How many faces does a cube have?', a: 6, w: ['4', '8', '12'], zh: 'cube 有 6 个面，像骰子。' },
        { q: 'How many edges does a cube have?', a: 12, w: ['6', '8', '4'], zh: 'cube 有 12 条棱。' },
        { q: 'How many vertices does a cube have?', a: 8, w: ['6', '12', '4'], zh: 'cube 有 8 个顶点。' },
        { q: 'How many faces does a rectangular prism have?', a: 6, w: ['4', '8', '12'], zh: '长方体有 6 个面。' },
        { q: 'How many faces does a square pyramid have?', a: 5, w: ['4', '6', '8'], zh: '四棱锥 4 个三角形面＋1 个底面＝5 个面。' }
      ];
      var it = pick(items);
      return mkMath('shape3d', it.q, it.a, makeOpts(String(it.a), it.w), it.q,
        'A cube has 6 faces, 12 edges and 8 vertices. A rectangular prism has 6 faces. A square pyramid has 4 triangle faces plus 1 base, so 5 faces.', it.zh);
    }
    if (mode === 'match') {
      var items2 = [
        { q: 'What 3D shape is a dice?', a: 'a cube', w: ['a sphere', 'a cylinder', 'a cone'], zh: '骰子＝cube。' },
        { q: 'What 3D shape is a can?', a: 'a cylinder', w: ['a cube', 'a cone', 'a sphere'], zh: '罐头＝cylinder。' },
        { q: 'What 3D shape is a ball?', a: 'a sphere', w: ['a cone', 'a cylinder', 'a cube'], zh: '皮球＝sphere。' },
        { q: 'What 3D shape is an ice-cream cone?', a: 'a cone', w: ['a sphere', 'a cube', 'a rectangular prism'], zh: '甜筒＝cone。' },
        { q: 'What 3D shape is a pencil box (a long box)?', a: 'a rectangular prism', w: ['a cube', 'a cylinder', 'a pyramid'], zh: '粉笔盒＝rectangular prism。' }
      ];
      var it2 = pick(items2);
      return mkMath('shape3d', it2.q, it2.a, makeOpts(it2.a, shuffle(it2.w)), it2.q,
        'Look at the faces: a dice is a cube, a can is a cylinder, a ball is a sphere, an ice-cream cone is a cone, a pencil box is a rectangular prism.', it2.zh);
    }
    var items3 = [
      { q: 'It has one circle base and one point at the top. What is it?', a: 'a cone', w: ['a cylinder', 'a sphere', 'a cube'] },
      { q: 'All of its faces are flat squares. What is it?', a: 'a cube', w: ['a sphere', 'a cone', 'a cylinder'] },
      { q: 'It has no flat faces and rolls any way. What is it?', a: 'a sphere', w: ['a cube', 'a cylinder', 'a pyramid'] }
    ];
    var it3 = pick(items3);
    return mkMath('shape3d', it3.q, it3.a, makeOpts(it3.a, shuffle(it3.w)), it3.q,
      'Look at the faces: ' + it3.a + ' fits these clues.', '看面的样子就能判断。');
  }

  /* ---------- 数学：120 以内两步应用题 ---------- */
  function genWord120() {
    var out = null, t = 0;
    while (t < 25 && !out) {
      t++;
      var mode = pick(['shop', 'change', 'bus', 'share']);
      var q, ans, explain, explainZh;
      if (mode === 'shop') {
        var p1 = ri(15, 60), p2 = ri(10, Math.max(11, 120 - p1));
        ans = p1 + p2;
        var w1 = pick(['a pencil box', 'a storybook', 'markers']), w2 = pick(['an eraser', 'a bookmark', 'a ruler']);
        q = 'Ben buys ' + w1 + ' for ' + p1 + ' yuan and ' + w2 + ' for ' + p2 + ' yuan. How much does he spend in all?';
        explain = 'Add the two amounts: ' + p1 + ' + ' + p2 + ' = ' + ans + ' yuan.'; explainZh = '把两样花的钱合起来：' + p1 + '+' + p2 + '=' + ans + ' 元。';
      } else if (mode === 'change') {
        var price = ri(25, 95);
        ans = 100 - price;
        q = 'Mum gives Ben 100 yuan for a schoolbag. The bag costs ' + price + ' yuan. How much change does he get?';
        explain = 'Change = money paid − price: 100 − ' + price + ' = ' + ans + ' yuan.'; explainZh = '找零＝付的钱−价钱：100−' + price + '＝' + ans + ' 元。';
      } else if (mode === 'bus') {
        var x0 = ri(20, 60), down = ri(5, x0 - 1), up = ri(5, 40);
        ans = x0 - down + up;
        if (ans > 120) continue;
        q = 'There were ' + x0 + ' people on the bus. ' + down + ' got off, then ' + up + ' got on. How many people are on the bus now?';
        explain = 'Take off first, then add: ' + x0 + ' − ' + down + ' = ' + (x0 - down) + ', then + ' + up + ' = ' + ans + '.';
        explainZh = '先减后加：' + x0 + '−' + down + '＝' + (x0 - down) + '，再＋' + up + '＝' + ans + ' 人。';
      } else {
        var k = ri(3, 6), each = ri(2, 6), n = k * each;
        ans = each;
        q = 'Share ' + n + ' prize flowers equally among ' + k + ' children. How many does each child get?';
        explain = 'Share means divide: ' + n + ' ÷ ' + k + ' = ' + each + '.'; explainZh = '平均分用除法：' + n + '÷' + k + '＝' + each + ' 朵。';
      }
      if (q.indexOf(String(ans)) >= 0) continue;
      out = mkMath('word120', q, ans, numOpts(ans, 10, 0), q, explain, explainZh);
    }
    if (out) return out;
    return mkMath('word120', 'Ben has 30 yuan. A book costs 48 yuan. How much more does he need?', 18, numOpts(18, 8, 0),
      'Ben has 30 yuan. A book costs 48 yuan. How much more does he need?',
      'How much more: 48 − 30 = 18 yuan.', '还差＝48−30＝18 元。');
  }

  /* ---------- 英语：Vocabulary 16 ---------- */
  function genVocabMatch() {
    var w = pickWeighted(B.EN_VOCAB);
    /* MT-EN-ZH-02 (Chief 接管改): 原 rightZh 死变量＋选项取 zh 中文——改全英文释义选项 */
    var right = w.en_def || w.en;
    var wrong = sample(B.EN_VOCAB, 3, w).map(function (x) { return x.en_def || x.en; })
      .filter(function (d) { return d !== right; });
    return { subj: 'english', type: 'vocab_match', q: 'What does "' + w.en + '" mean?',
      a: right, opts: makeOpts(right, wrong),
      speak: w.en,
      explain: '"' + w.en + '" means "' + (w.en_def || w.zh) + '".',
      explainZh: w.en + ' = ' + w.zh + '。例句：' + w.sent, topicTag: 'vocab16', doubt: !!w.doubt };
  }

  function genVocabSent() {
    var w = pickWeighted(B.EN_VOCAB);
    var blanked = w.sent.replace(new RegExp('\\b' + w.en + '\\b', 'i'), '＿＿＿');
    var wrongWords = sample(B.EN_VOCAB, 3, w).map(function (x) { return x.en; });
    return { subj: 'english', type: 'vocab_sent', q: 'Fill in the blank: ' + blanked,
      a: w.en, opts: makeOpts(w.en, wrongWords), speak: 'Fill in the blank with the right word.',
      explain: 'Full sentence: ' + w.sent + '. "' + w.en + '" means "' + (w.en_def || w.zh) + '".',
      explainZh: '完整句子：' + w.sent + '（' + w.sentZh + '）', topicTag: 'vocab16', doubt: !!w.doubt };
  }

  function genVocabDef() {
    var w = pickWeighted(B.EN_VOCAB);
    var wrongWords = sample(B.EN_VOCAB, 3, w).map(function (x) { return x.en; });
    return { subj: 'english', type: 'vocab_def',
      q: 'Which word means "' + (w.en_def || w.zh) + '"?',
      a: w.en, opts: makeOpts(w.en, wrongWords), speak: 'Which word matches this meaning?',
      explain: '"' + w.en + '" means "' + (w.en_def || w.zh) + '". Example: ' + w.sent,
      explainZh: w.en + ' 的意思是“' + w.zh + '”。例句：' + w.sent, topicTag: 'vocab16', doubt: !!w.doubt };
  }

  /* ---------- 英语：拼读规则 ---------- */
  function genSpellRule() {
    var rules = B.SPELL_RULES, mode = pick(['hear', 'blank', 'end', 'syl', 'rctrl']);
    /* ENG-ET-20（2026-11-05 老师手抄页 §19⑥，证据等级①）：Bossy R 是学校课堂用名，
     * 题面/讲解一律用 "Bossy R"，首次出现括号注 r-controlled。
     * 手抄页 Bossy R 旁的发音陷阱批注经读图复核为「无法辨认」——已撤销，不写入任何数据。 */
    if (mode === 'rctrl') {
      var rkeys = Object.keys(rules.rcontrolled);
      var rkey = pick(rkeys);
      var rword = pick(rules.rcontrolled[rkey]);
      var rothers = [];
      rkeys.forEach(function (k) { if (k !== rkey) rothers = rothers.concat(rules.rcontrolled[k]); });
      rothers = rothers.filter(function (o) { return o.indexOf(rkey) < 0; });
      return { subj: 'english', type: 'spell_rule', q: 'Which word has the Bossy R "' + rkey + '" sound?',
        a: rword, opts: makeOpts(rword, sample(rothers, 3)), speak: 'Which word has the Bossy R ' + rkey + ' sound?',
        explain: rword + ' has the Bossy R (r-controlled) "' + rkey + '" — the r changes the vowel sound.',
        explainZh: rword + ' 里有 Bossy R（r-controlled）的 "' + rkey + '"——r 是"霸王 R"，把前面元音的音带跑。', topicTag: 'spelling' };
    }
    if (mode === 'hear') {
      var keys = Object.keys(rules.digraph);
      var key = pick(keys);
      var word = pick(rules.digraph[key]);
      var others = [];
      keys.forEach(function (k) { if (k !== key) others = others.concat(rules.digraph[k]); });
      others = others.filter(function (o) { return o.indexOf(key) < 0; });
      return { subj: 'english', type: 'spell_rule', q: 'Which word has the "' + key + '" sound?',
        a: word, opts: makeOpts(word, sample(others, 3)), speak: 'Which word has the ' + key + ' sound?',
        explain: word + ' has the "' + key + '" sound. Remember: the two letters "' + key + '" spell one sound.',
        explainZh: word + ' 里有“' + key + '”的音。', topicTag: 'spelling' };
    }
    if (mode === 'blank') {
      var b = pick(rules.blanks);
      return { subj: 'english', type: 'spell_rule', q: 'Complete the word: ' + b.blank,
        a: b.a, opts: makeOpts(b.a, shuffle(['sh', 'ch', 'th', 'ck'])), speak: 'Which letter pair is missing?',
        explain: 'The full word is ' + b.w + '. The missing letters are ' + b.a + '.',
        explainZh: '完整单词是 ' + b.w + '，缺的是 ' + b.a + '。', topicTag: 'spelling' };
    }
    if (mode === 'end') {
      var kinds = Object.keys(rules.endings);
      var kind = pick(kinds);
      var item = pick(rules.endings[kind]);
      var forms = [item.right, item.base + 's', item.base + 'ing', item.base + 'ed'].filter(function (x) { return x !== item.right; });
      var label = kind === 'es' ? '-es' : (kind === 'ing' ? '-ing' : '-ed');
      return { subj: 'english', type: 'spell_rule',
        q: 'Make "' + item.base + '" into its ' + label + ' form.',
        a: item.right, opts: makeOpts(item.right, forms), speak: 'Make ' + item.base + ' into its ' + label + ' form.',
        explain: 'The answer is ' + item.right + '. Rule: ' + (kind === 'es' ? 'add -es after o/s/x/ch/sh;' : kind === 'ing' ? 'double the last consonant in a short-closed syllable, then add -ing;' : 'usually add -ed;') ,
        explainZh: '正确答案是 ' + item.right + '。规则：' + (kind === 'es' ? '以 o/s/x/ch/sh 结尾加 -es；' : kind === 'ing' ? '重读闭音节双写再加 -ing；' : '一般直接加 -ed。'),
        topicTag: 'spelling' };
    }
    var syl = pick(rules.syllables);
    var part = syl.parts[syl.ask];
    return { subj: 'english', type: 'spell_rule',
      q: 'Look at "' + syl.w + '". Is the part "' + part + '" open or closed?',
      a: syl.a, opts: makeOpts(syl.a, ['open', 'closed', 'both', 'neither']),
      speak: 'Is this part open or closed?',
      explain: (syl.a === 'open' ? 'Open syllables end with a vowel sound — the vowel says its name.' : 'Closed syllables end with a consonant — the vowel is short.') + ' "' + syl.w + '" = ' + syl.parts.join(' · ') + '.',
      explainZh: (syl.a === 'open' ? 'open 音节以元音结尾，元音读字母名。' : 'closed 音节以辅音结尾，元音读短音。'),
      topicTag: 'spelling' };
  }

  /* ---------- 英语：语法 ---------- */
  function genGrammar() {
    var G = B.GRAMMAR;
    var mode = pick(['sv', 'plural', 'stype', 'adj']);
    if (mode === 'sv') {
      var it = pickWeighted(G.sv);
      /* sv 只有「原形 / 三单」两种合法形式；干扰项用 -ing / -ed 变体补足 4 项，
       * 不再落到 makeOpts 的通用填充语（曾出现中文占位项进英文界面，QA D-R6-1） */
      var other = it.wrong[0] || '';
      var svFill;
      if (it.a === 'is' || it.a === 'are' || other === 'is' || other === 'are') {
        svFill = ['am', 'be'];
      } else {
        var base;
        if (other === it.a + 's' || other === it.a + 'es') base = it.a;
        else if (it.a === other + 's' || it.a === other + 'es') base = other;
        else base = (it.a.length <= other.length ? it.a : other);
        svFill = [base + 'ing', base + 'ed'];
      }
      return { subj: 'english', type: 'grammar', q: 'Choose the right verb: ' + it.s.replace(/_{2,}/, '＿＿＿'),
        a: it.a, opts: makeOpts(it.a, shuffle(it.wrong).concat(svFill)), speak: 'Choose the right verb.',
        explain: 'Subject and verb must agree: one subject takes the -s form, many subjects take the base form. The answer is ' + it.a + '.',
        explainZh: '主谓一致：单数主语动词加 s，复数主语用原形。答案是 ' + it.a + '。', topicTag: 'grammar' };
    }
    if (mode === 'plural') {
      var it2 = pickWeighted(G.plural);
      /* ENG-ET-18/19（2026-11-05 老师手抄页 §19⑥，证据等级①）：
       * -es 口诀 verbatim "snake-like sound"（s, ss, ch, sh, x, z）；-ies 讲法 verbatim "drop the y"。
       * 按答案形态判定：-ies 结尾 → drop the y；-es 结尾且 es 前收 snake 音 → snake-like 口诀；其余 → 加 -s。 */
      var pbase = String(it2.a || '').toLowerCase();
      var ruleEn, ruleZh;
      if (/ies$/.test(pbase)) {
        ruleEn = 'It ends with a consonant + y: drop the y and add -ies.';
        ruleZh = '以「辅音字母＋y」结尾：drop the y（去掉 y）再加 -ies。';
      } else if (/(?:ss|sh|ch|x|z|s)es$/.test(pbase)) {
        ruleEn = 'It ends with a snake-like sound (s, ss, ch, sh, x, z), so we add -es.';
        ruleZh = '结尾是 snake-like sound（蛇一样嘶嘶的音：s, ss, ch, sh, x, z），所以要加 -es。';
      } else {
        ruleEn = 'Most words just add -s.';
        ruleZh = '一般名词直接加 -s。';
      }
      return { subj: 'english', type: 'grammar', q: it2.s, a: it2.a, opts: makeOpts(it2.a, shuffle(it2.wrong)),
        speak: it2.s,
        explain: ruleEn + ' The answer is ' + it2.a + '.',
        explainZh: ruleZh + '答案是 ' + it2.a + '。', topicTag: 'grammar' };
    }
    if (mode === 'stype') {
      var it3 = pickWeighted(G.stype);
      var qg = { subj: 'english', type: 'grammar',
        q: 'What kind of sentence is "' + it3.s + '"?',
        a: it3.a, opts: makeOpts(it3.a, shuffle(it3.wrong)),
        speak: 'What kind of sentence is this?',
        explain: 'A statement tells something, a question asks, a command tells someone to do something, and an exclamation shows strong feeling.',
        explainZh: '陈述句讲一件事，疑问句提问，祈使句请人做事，感叹句表达强烈情感。',
        topicTag: 'grammar' };
      var punct2 = it3.punct;
      if (punct2 === undefined) {
        punct2 = /\?\s*$/.test(it3.s) ? '?' : (/!\s*$/.test(it3.s) ? '!' : '.');
      }
      var accept2 = [punct2];
      if (it3.a === 'Command') accept2 = ['.', '!'];
      qg.blank2 = { label: 'What punctuation goes at the end?', label_en: 'punctuation', a: punct2, accept: accept2, opts: makeOpts(punct2, ['.', '?', '!']) };
      return qg;
    }
    var it4 = pickWeighted(G.adj);
    return { subj: 'english', type: 'grammar', q: 'Which word is the adjective? “' + it4.s + '”', a: it4.a, opts: makeOpts(it4.a, shuffle(it4.wrong)),
      speak: 'Which word is the adjective?',
      explain: 'An adjective describes a noun. "' + it4.a + '" is the word that describes the noun.',
      explainZh: '形容词用来描述名词，“' + it4.a + '”就是修饰名词的词。', topicTag: 'grammar' };
  }

  /* ---------- 英语：阅读技能 ---------- */
  function genReadingSkill() {
    var it = pickWeighted(B.READING);
    var text = it.passage ? (it.passage + '\n\n' + it.q) : it.q;
    if (it.open) {
      return { subj: 'english', type: 'reading_skill', q: text, a: it.a,
        speak: it.passage, open: true, doubt: !!it.doubt,
        explain: 'Write two ways the owl\'s body helps it hunt, and use two details from the text.',
        explainZh: '参考答案：' + it.a, topicTag: 'reading', src: it.src };
    }
    var aEn = stripZh(it.a);
    var wrongEn = it.wrong.map(stripZh);
    /* ENG-ET-17（2026-11-05 老师手抄页 §19③/⑥，证据等级①）：
     * Author's Purpose（PIE＝Persuade/Inform/Entertain）答题骨架＝老师原版三行模板，
     * verbatim：1. I chose... / 2. Because... / 3. For example...（三行编号模板即全部；勿凭印象编任何缩写记号） */
    var apFrame = 'Answer frame (say it in three lines): 1. I chose ___. 2. Because ___. 3. For example, ___.';
    var exEn = it.explain || ('Answer: ' + aEn + '. This question is about ' + it.skill + '.');
    var exZh = it.explainZh || ('答案：' + it.a + '。这道题考的是 ' + it.skill + '。');
    if (it.skill === "Author's Purpose") { exEn += ' ' + apFrame; exZh += ' 答题三行骨架：1. I chose ___. 2. Because ___. 3. For example, ___.'; }
    return { subj: 'english', type: 'reading_skill', q: text,
      a: aEn, opts: makeOpts(aEn, shuffle(wrongEn)), speak: it.passage,
      explain: exEn,
      explainZh: exZh,
      topicTag: 'reading', doubt: !!it.doubt, src: it.src };
  }

  /* ---------- 英语：字母顺序 ---------- */
  function genAlphaOrder() {
    var pool = B.EN_VOCAB.map(function (w) { return w.en; });
    var words = sample(pool, 4);
    var sorted = words.slice().sort(function (a, b) { return a.localeCompare(b); });
    var aStr = sorted.join(', ');
    var variants = [];
    for (var i = 0; i < 6 && variants.length < 3; i++) {
      var v = shuffle(words).join(', ');
      if (v !== aStr && variants.indexOf(v) < 0) variants.push(v);
    }
    var rev = words.slice().sort(function (a, b) { return b.localeCompare(a); }).join(', ');
    if (variants.indexOf(rev) < 0 && rev !== aStr) variants.push(rev);
    return { subj: 'english', type: 'alpha_order', q: 'Which list is in ABC order?',
      a: aStr, opts: makeOpts(aStr, variants.slice(0, 3)), speak: 'Which list is in ABC order?',
      explain: 'In ABC order: ' + sorted.join(' → ') + '.',
      explainZh: '按首字母排：' + sorted.join(' → '), topicTag: 'reading' };
  }

  /* ---------- 英语/语文：开放题（仅 AI 可用时由 app 出题） ---------- */
  function genWriting() {
    var list = B.WRITING;
    if (!list.length) return null;
    var it = pickWeighted(list);
    /* ENG-ET-22/17/21（2026-11-05 老师来信 §19②＋手抄页 §19③/⑥）：
     * 讲解带出老师七条主轴、Author's Purpose 三行骨架、figurative 三件套现成例句。
     * 注意：孩子侧题干/清单渲染以 config.js cfg.writing 为唯一事实源（app.js wConform 会覆盖 q/speak/a），
     * 这里的 explain 是答后讲解区素材；句数口径两处必须一致（cdp-eng08 G 段有防漂移断言）。 */
    var ex = 'Checklist: ' + it.checklist.join('; ') + '. ' +
      (it.organizer ? 'Hamburger structure: ' + it.organizer.main + ' + ' + (it.organizer.details || []).join(' / ') + ' + ' + it.organizer.concluding + '. ' : '') +
      (it.editingMarks ? 'Editing marks you may use: ' + it.editingMarks.join(', ') + '. ' : '') +
      (it.teacherCard ? 'Teacher checks: ' + it.teacherCard.map(function (t) { return t.label; }).join(' · ') + '. ' : '') +
      (it.answerFrames && it.answerFrames.authorsPurpose ? 'Author\u2019s Purpose answer frame: ' + it.answerFrames.authorsPurpose.join(' / ') + '. ' : '') +
      (it.figurative ? 'Try some figurative language: ' + it.figurative.map(function (f) { return f.type + ' — "' + f.example + '"'; }).join('; ') + '.' : '');
    var exZh = '写作要求：' + it.checklist.join('；') + '。' +
      (it.teacherCard ? '老师会看这七条：' + it.teacherCard.length + ' 项（扣题一件事／写自己的感受／真事加细节／20 分钟写完／过渡词／卷面整洁／过去时）。' : '') +
      (it.figurative ? '可以用修辞：' + it.figurative.map(function (f) { return f.zh + '，如 "' + f.example + '"'; }).join('；') + '。' : '');
    return {
      subj: 'english', type: 'writing', q: it.prompt, a: it.checklist.join('；'),
      speak: it.prompt,
      explain: ex,
      explainZh: exZh,
      topicTag: 'writing', open: true, src: it.src
    };
  }

  /* ---------- 语文：九大题型（数据驱动，数据空则不出题） ---------- */
  /* 从同槽数据里收集可用的干扰项池（拼音/汉字可选面窄，数据只给 1~2 个真干扰） */
  function slotPool(list, getter) {
    var set = [];
    list.forEach(function (it) {
      (getter(it) || []).forEach(function (v) { if (v && set.indexOf(v) < 0) set.push(v); });
    });
    return set;
  }
  function padDistractors(given, pool, answer, n) {
    var out = (given || []).filter(function (v) { return v && v !== answer; });
    if (out.length >= n) return out.slice(0, n);
    var extra = sample(pool, out.length + n + 2, answer).filter(function (v) {
      return v && v !== answer && out.indexOf(v) < 0;
    });
    return out.concat(extra).slice(0, n);
  }

  function genPy2han() {
    if (!B.PY2HAN.length) return null;
    var it = pickWeighted(B.PY2HAN);
    return {
      subj: 'yuwen', type: 'py2han', q: '看拼音写词语：' + it.py, a: it.word, speak: it.word,
      explain: '“' + it.word + '”的拼音是 ' + it.py + '。' + (it.explain ? it.explain + '。' : ''),
      topicTag: 'shengzi', doubt: !!it.doubt, src: it.src
    };
  }
  function genAddradical() {
    if (!B.ADDRADICAL.length) return null;
    var it = pickWeighted(B.ADDRADICAL);
    var pool = slotPool(B.ADDRADICAL, function (x) { return [x.right].concat(x.wrong || []); });
    var ds = padDistractors(it.wrong, pool, it.right, 3);
    return {
      subj: 'yuwen', type: 'addradical', q: '“' + it.base + '”加上“' + it.radical + '”旁，能组成哪个新字？',
      a: it.right, opts: makeOpts(it.right, ds), speak: '加偏旁组新字，选哪个？',
      explain: '“' + it.base + '”加上“' + it.radical + '”是“' + it.right + '”，可以组词“' + it.word + '”。' + (it.explain ? it.explain + '。' : ''),
      topicTag: 'shengzi', doubt: !!it.doubt, src: it.src
    };
  }
  function genDuyin() {
    if (!B.DUYIN.length) return null;
    var it = pickWeighted(B.DUYIN);
    var pool = slotPool(B.DUYIN, function (x) { return [x.right].concat(x.wrong || []); });
    var ds = padDistractors(it.wrong, pool, it.right, 3);
    return {
      subj: 'yuwen', type: 'duyin', q: it.sent + '\n（加点字：“' + it.target + '”读哪个音？）',
      a: it.right, opts: makeOpts(it.right, ds), speak: it.sent,
      explain: '“' + it.target + '”在这里读 ' + it.right + '。' + (it.explain ? it.explain + '。' : ''),
      topicTag: 'shengzi', doubt: !!it.doubt, src: it.src
    };
  }
  /* ---------- 〔原题·老师批改版03〕新题型（INGEST-03，Chief 裁定2 批准）：
   * duyin_table 多音全表三形态（给词选音/给音选词/数读音）——干扰项全部取自本槽封闭池；
   * simile 比喻分析四选一（答案＝红笔判分基线，干扰喻体取自池内其他答案）；
   * simile_open 开放写句（AI 判，本体＋喻体＋比喻词达标制）。 ---------- */
  function genDuyinTable() {
    if (!B.DUYIN_TABLE || !B.DUYIN_TABLE.length) return null;
    var it = pickWeighted(B.DUYIN_TABLE);
    var form = pick(['py', 'word', 'count']);
    var others = [];
    B.DUYIN_TABLE.forEach(function (x) { if (x.zi !== it.zi) { x.readings.forEach(function (r) { others.push(r); }); } });
    var allPy = it.zi + '的读音：' + it.readings.map(function (r) { return r.py + '（' + r.word + '）'; }).join('、') + '。';
    if (form === 'py') {
      var r0 = pick(it.readings);
      var wrongPys = shuffle(others.filter(function (o) { return o.py !== r0.py; }).map(function (o) { return o.py; }));
      return { subj: 'yuwen', type: 'duyin_table', q: '“' + r0.word + '”的“' + it.zi + '”读什么？',
        a: r0.py, opts: makeOpts(r0.py, wrongPys.slice(0, 3)), speak: r0.word,
        explain: '“' + it.zi + '”在“' + r0.word + '”里读 ' + r0.py + '。' + allPy,
        topicTag: 'shengzi', src: it.src };
    }
    if (form === 'word') {
      var r1 = pick(it.readings);
      var wrongWords = shuffle(others.filter(function (o) { return o.word !== r1.word; }).map(function (o) { return o.word; }));
      return { subj: 'yuwen', type: 'duyin_table', q: '“' + it.zi + '”读 ' + r1.py + ' 的时候，可以组哪个词语？',
        a: r1.word, opts: makeOpts(r1.word, wrongWords.slice(0, 3)), speak: r1.word,
        explain: r1.py + ' 可以组“' + r1.word + '”。' + allPy,
        topicTag: 'shengzi', src: it.src };
    }
    var n = it.readings.length;
    var cntPool = ['1个', '2个', '3个', '4个'].filter(function (x) { return x !== n + '个'; });
    return { subj: 'yuwen', type: 'duyin_table', q: '“' + it.zi + '”一共有几个读音？',
      a: n + '个', opts: makeOpts(n + '个', cntPool.slice(0, 3)), speak: '“' + it.zi + '”一共有几个读音？',
      explain: '“' + it.zi + '”有 ' + n + ' 个读音。' + allPy,
      topicTag: 'shengzi', src: it.src };
  }
  function genSimile() {
    if (!B.SIMILE || !B.SIMILE.length) return null;
    var it = pickWeighted(B.SIMILE);
    var pool = B.SIMILE.filter(function (x) { return x !== it; }).map(function (x) { return x.a; });
    /* 第 4 干扰取自开放题讲解里的课例句"月亮像小船"（课本《日月潭》同族素材，有出处） */
    var ds = shuffle(pool).concat(['小船']).slice(0, 3);
    return { subj: 'yuwen', type: 'simile', q: '句子把“' + it.tenor + '”比作什么？',
      a: it.a, opts: makeOpts(it.a, ds), speak: it.tenor + '像' + it.a,
      explain: '把' + it.tenor + '比作' + it.a + '——' + it.explain + '。固定动作（老师红笔）：抄句子别抄错字，抄完回读一遍和原句对一对。',
      topicTag: 'biyu', src: it.src };
  }
  function genSimileOpen() {
    if (!B.SIMILE_OPEN || !B.SIMILE_OPEN.length) return null;
    var it = pickWeighted(B.SIMILE_OPEN);
    var steps = it.checklist.join('；');
    return { subj: 'yuwen', type: 'simile_open', q: '写比喻句：' + it.desc,
      a: steps, speak: '写一句比喻句', open: true,
      explain: (it.explain ? it.explain + ' ' : '') + '达标三样：本体＋喻体＋比喻词。固定动作（老师红笔）：抄完回读对原句。',
      topicTag: 'biyu', src: it.src };
  }
  function genHuanzi() {    if (!B.HUANZI.length) return null;
    var it = pickWeighted(B.HUANZI);
    var pool = slotPool(B.HUANZI, function (x) { return [x.right].concat(x.wrong || []); });
    var ds = padDistractors(it.wrong, pool, it.right, 3);
    return {
      subj: 'yuwen', type: 'huanzi', q: it.sent + '　（选出正确的字）', a: it.right,
      opts: makeOpts(it.right, ds), speak: '选出正确的字，填进句子里。',
      explain: '应该用“' + it.right + '”。' + (it.why || it.explain || ''),
      topicTag: 'shengzi', doubt: !!it.doubt, src: it.src
    };
  }
  function genPanduan() {
    if (!B.PANDUAN.length) return null;
    var it = pickWeighted(B.PANDUAN);
    return {
      subj: 'yuwen', type: 'panduan', q: '判断对错（出自课文《' + it.src + '》）：' + it.text,
      /* 判断题 = 真·二选一（Chief 2026-10-31 裁决：7 岁孩子不需要"都对/都不对"干扰项） */
      a: it.ok ? '√' : '×',
      opts: Math.random() < 0.5 ? [(it.ok ? '√' : '×'), (it.ok ? '×' : '√')] : [(it.ok ? '×' : '√'), (it.ok ? '√' : '×')],
      speak: '判断对错：' + it.text,
      explain: it.why, topicTag: 'neirong', doubt: !!it.doubt, src: it.src
    };
  }
  function genZhaoyang() {
    if (!B.ZHAOYANG.length) return null;
    var it = pickWeighted(B.ZHAOYANG);
    return {
      subj: 'yuwen', type: 'zhaoyang', q: '照样子选句子。例句：' + it.example, a: it.right,
      opts: makeOpts(it.right, shuffle(it.wrong)), speak: '照样子选句子。例句：' + it.example,
      explain: (it.explain ? it.explain + '。' : '') + '照样子写句子，要说清' + (it.hint || '句式特点') + '。',
      topicTag: 'jushi', doubt: !!it.doubt, src: it.src
    };
  }
  function genKewenRead() {
    if (!B.KEWEN_READ.length) return null;
    var it = pickWeighted(B.KEWEN_READ);
    return {
      subj: 'yuwen', type: 'kewen_read', q: '课内阅读《' + it.src + '》：\n' + it.passage + '\n\n' + it.q,
      a: it.a, opts: makeOpts(it.a, shuffle(it.wrong)), speak: '课内阅读：' + it.passage + '　' + it.q,
      explain: '答案：' + it.a + '。', topicTag: 'neirong', doubt: !!it.doubt, src: it.src
    };
  }
  function genKewaiRead() {
    if (!B.KEWAI_READ.length) return null;
    var it = pickWeighted(B.KEWAI_READ);
    return {
      subj: 'yuwen', type: 'kewai2', q: '课外阅读：\n' + it.passage + '\n\n' + it.q,
      a: it.a, opts: makeOpts(it.a, shuffle(it.wrong)), speak: '课外阅读：' + it.passage + '　' + it.q,
      explain: '答案：' + it.a + '。', topicTag: 'kewai', doubt: !!it.doubt, src: it.src
    };
  }
  function genKanshu() {
    if (!B.KANSHU.length) return null;
    var it = pickWeighted(B.KANSHU);
    var steps = (it.checklist && it.checklist.length) ? it.checklist.join('；') : '①时间 ②地点 ③人物与事情 ④心情';
    /* 〔原题·写话模板〕新字段：goodWords 降门槛脚手架（老师固定动作：先挑 2–3 个再动笔，T-1 类启动提示）
     * ＋ img 插图（观察对象＝题面内容，needsFigure 同族——答题前显示，不藏答案） */
    var gw = (it.goodWords && it.goodWords.length)
      ? '\n先挑 2–3 个好词用上：' + it.goodWords.join('、')
      : '';
    return {
      subj: 'yuwen', type: 'kanshuxiehua',
      q: '看图写话：' + it.desc + '\n四步提示：' + steps + gw,
      a: steps, speak: '看图写话：' + it.desc,
      explain: (it.sample ? '参考范文：' + it.sample + '。' : '') + '四步框架：' + steps + '。' + (it.tips ? '评分要点：' + it.tips : ''),
      img: it.img || undefined, needsFigure: !!it.img,
      topicTag: 'kanshuxiehua', open: true, doubt: !!it.doubt, src: it.src
    };
  }

  /* ---------- 语文：背诵闯关（口试 11-06） ---------- */
  function splitSegs(line) {
    var segs = [], re = /[^，。！？、；：]+[，。！？、；：]?/g, m;
    while ((m = re.exec(line)) !== null) segs.push(m[0]);
    return segs.length ? segs : [line];
  }
  function blankLine(line) {
    var segs = splitSegs(line).filter(function (s) { return s.replace(/[，。！？、；：]/g, '').length >= 2; });
    if (!segs.length) return null;
    var longest = segs[0];
    segs.forEach(function (s) { if (s.length > longest.length) longest = s; });
    var clause = longest.replace(/[，。！？、；：]+$/, '');
    var punct = longest.slice(clause.length);
    if (!clause.length) return null;
    /* 只挖句尾 1~3 个字，保留句头语境（整句挖空孩子没法回忆） */
    var cut = Math.min(3, Math.max(1, clause.length - 1));
    var keep = clause.slice(0, clause.length - cut);
    var word = clause.slice(clause.length - cut);
    /* 下划线个数 = 答案字数（recite-dev 审计：写死 3 个与 121/126 处不符） */
    var underline = new Array(word.length + 1).join('＿');
    var masked = line.replace(longest, keep + underline + punct);
    return { masked: masked, word: word, keep: keep };
  }
  /* 供 UI（背诵闯关）复用同一套挖空规则，避免两处逻辑漂移 */
  MT.banks.blankLine = blankLine;
  function genRecite() {
    var pool = B.RECITE.filter(function (p) { return p.lines && p.lines.length; });
    if (!pool.length) return null;
    var p = pickWeighted(pool);
    var line = pick(p.lines);
    var b = blankLine(line);
    if (!b || !b.word) return null;
    return {
      subj: 'yuwen', type: 'recite',
      q: '背诵闯关 ·《' + p.title + '》\n把空缺的部分填出来：\n' + b.masked,
      a: b.word, speak: (p.author && p.kind === 'poem') ? ('《' + p.title + '》，' + p.author + '。') : ('《' + p.title + '》。'),
      explain: '完整句子：' + line, topicTag: p.kind === 'poem' ? 'gushi_bei' : 'kewen_bei'
    };
  }

  /* ---------- 科学（第四科） ---------- */
  function genSci(unit) {
    var pool = B.SCIENCE.filter(function (x) { return !unit || x.u === unit; });
    if (!pool.length) return null;
    var it = pickWeighted(pool);
      if (!it.why_en) console.warn('SCI_FALLBACK_GUARD|missing_why_en|' + (it.sssId || (it.qEn || '').slice(0, 30)));
    return {
      subj: 'science', type: 'sci',
      q: it.qEn,
      a: it.a,
      opts: makeOpts(it.a, shuffle(it.wrong)),
      speak: it.qEn,
      explain: it.why_en || '',
      explainZh: it.why,
      topicTag: (it.type === 'sci_plants' ? 'plants' : it.type === 'sci_observe' ? 'scientist' : it.type === 'sci_animals' ? 'animals' : (it.topicTag || (it.u === 'u1' ? 'scientist' : 'animals'))), /* SCI-DB-01-R1 双层：数据层=题型id，运行时=卡id（D-R11-1 判例） */
      src: it.src
    };
  }

  /* ---------- 英语精准化：SORT / MATCH / ORDER / FILL ---------- */
  function genSort() {
    var list = B.EN_SORT || [];
    if (!list.length) return null;
    var it = pickWeighted(list);
    var groups = (it.groups || []).filter(function (g) { return g && g.name && g.words && g.words.length; });
    if (groups.length < 2) return null;
    var hasItems = !!(it.items && it.items.length);
    var words = hasItems ? it.items.slice() : [];
    var map = {};
    groups.forEach(function (g) {
      g.words.forEach(function (w) {
        if (map[w] === undefined) map[w] = g.name;
        /* 有 items 时只归桶 items 指定的词；没有 items 才用全部组词 */
        if (!hasItems && words.indexOf(w) < 0) words.push(w);
      });
    });
    words = shuffle(words);
    if (words.length < 3) return null;
    return {
      subj: 'english', type: 'en_sort', kind: 'bucket',
      q: 'Tap each word into the right group: ' + (it.title || 'Sort it out'),
      buckets: groups.map(function (g) { return g.name; }),
      words: words, map: map,
      a: words.map(function (w) { return w + '→' + map[w]; }).join('；'),
      speak: 'Tap each word into the right group.',
      explain: 'Groups: ' + words.map(function (w) { return w + ' → ' + map[w]; }).join('; ') + '. ' + (/[\u4e00-\u9fa5]/.test(it.rule || '') ? '' : (it.rule || '')),
      explainZh: '分组结果：' + words.map(function (w) { return w + ' → ' + map[w]; }).join('；') + '。',
      topicTag: 'spelling', src: it.src
    };
  }

  function genMatch() {
    var list = B.EN_MATCH || [];
    if (!list.length) return null;
    var it = pickWeighted(list);
    var left = (it.left || []).slice(), right = (it.right || []).slice();
    var pairs = it.pairs || [];
    if (left.length < 2 || right.length < 2 || pairs.length !== Math.min(left.length, right.length)) return null;
    var rightOrder = shuffle(right.map(function (t, i) { return { t: t, i: i }; }));
    return {
      subj: 'english', type: 'en_match', kind: 'pair',
      q: 'Match each word on the left with its meaning on the right: ' + (it.title || 'Word Match'),
      left: left,
      right: rightOrder.map(function (x) { return x.t; }),
      rightIdx: rightOrder.map(function (x) { return x.i; }),   /* 右列打乱后对应的原下标 */
      pairs: pairs,
      a: pairs.map(function (p) { return left[p[0]] + ' ↔ ' + right[p[1]]; }).join('；'),
      speak: 'Match each word with its meaning.',
      explain: 'Correct pairs: ' + pairs.map(function (p) { return left[p[0]] + ' ↔ ' + right[p[1]]; }).join('; ') + '.',
      explainZh: '正确配对：' + pairs.map(function (p) { return left[p[0]] + ' ↔ ' + right[p[1]]; }).join('；') + '。',
      topicTag: 'vocab16', src: it.src
    };
  }

  function genOrder() {
    var list = B.EN_ORDER || [];
    if (!list.length) return null;
    var it = pickWeighted(list);
    var pool = (it.pool || []).slice();
    if (pool.length < 3) return null;
    /* pool 顺序即正确顺序；出题时打乱显示给孩子的项，答案记录正确顺序的文本序列 */
    var correct = pool.slice();
    var shown = shuffle(pool.map(function (t, i) { return { t: t, i: i }; }));
    return {
      subj: 'english', type: 'en_order', kind: 'order',
      q: 'Tap the steps in the correct order (1, 2, 3 …): ' + (it.title || 'Put it in order'),
      items: shown.map(function (x) { return x.t; }),
      itemIdx: shown.map(function (x) { return x.i; }),
      seq: it.seq || correct.map(function (_, i) { return i; }),
      a: correct.join(' → '),
      speak: 'Tap the steps in the correct order.',
      explain: 'Correct order: ' + correct.join(' → ') + '.',
      explainZh: '正确顺序：' + correct.join(' → ') + '。',
      topicTag: 'reading', doubt: !!it.doubt, src: it.src
    };
  }

  function genFill() {
    var list = B.EN_FILL || [];
    if (!list.length) return null;
    var it = pickWeighted(list);
    var answers = (it.answers || []).filter(Boolean);
    if (!it.blank || !answers.length) return null;
    var right = answers[0];
    var wrongs = (it.wrong || []).filter(function (w) { return w && answers.indexOf(w) < 0; });
    if (wrongs.length < 3) return null;
    return {
      subj: 'english', type: 'en_fill',
      q: 'Choose the right word form: ' + it.blank.replace(/_{2,}/, '＿＿＿'),
      a: right, opts: makeOpts(right, shuffle(wrongs).slice(0, 3)),
      speak: 'Choose the right word form.',
      explain: 'The answer is ' + answers.join(' / ') + '. Rule: ' + (/[\u4e00-\u9fa5]/.test(it.rule || '') ? 'watch how the word ending changes' : (it.rule || 'watch the word ending')) + '.',
      explainZh: '答案是 ' + answers.join(' / ') + '。规则：' + (it.rule || '看词尾变化') + '。',
      topicTag: 'spelling', src: it.src
    };
  }

  /* 数据门槛：数据区为空则该题型不出题（语文九型待 Researcher 供稿） */
  var DATA_GATE = {
    py2han: 'PY2HAN', addradical: 'ADDRADICAL', duyin: 'DUYIN', huanzi: 'HUANZI', panduan: 'PANDUAN',
    /* INGEST-03 语文新题型槽位（数据为空自动隐藏，同 MATH-02 规矩） */
    duyin_table: 'DUYIN_TABLE', simile: 'SIMILE', simile_open: 'SIMILE_OPEN',
    zhaoyang: 'ZHAOYANG', kewen_read: 'KEWEN_READ', kewai2: 'KEWAI_READ', kanshuxiehua: 'KANSHU',
    writing: 'WRITING', recite: 'RECITE', sci: 'SCIENCE', sci_observe: 'SCIENCE', sci_animals: 'SCIENCE', sci_plants: 'SCIENCE',
    en_sort: 'EN_SORT', en_match: 'EN_MATCH', en_order: 'EN_ORDER', en_fill: 'EN_FILL',
    /* 数学卷面新槽位：数据为空 → 不出题且 chip 隐藏（QA 断言项，MATH-02） */
    open_number_line: 'MATH_ONL', bar_model: 'MATH_BARMODEL', place_value: 'MATH_PLACE',
    table_read: 'MATH_TABLE', pattern: 'MATH_PATTERN', square_count: 'MATH_SQUARE',
    /* INGEST-03 新槽（数据空 → chip 自动隐藏，同 MATH-02 规矩） */
    len_conv: 'MATH_LENCONV', strategy_comp: 'MATH_STRAT2', number_form: 'MATH_NUMFORM',
    shape_tf: 'MATH_SHAPETF', perimeter_fix: 'MATH_PERIM2', area_rowcol: 'MATH_AREA2', vertical_orig: 'MATH_VERT2'
  };
  function typeHasData(t, pool) {
    var k = DATA_GATE[t];
    if (!k) return true;
    var arr = B[k];
    if (!arr || !arr.length) return false;
    /* 只对 MATH_* 槽位数组做「条目可出题」判断——它们才是带 q/src 的题。
     * 英语 EN_SORT / EN_MATCH 等是 kind 结构数据、没有 q/src，套 validOrig 会被整型误判成空数据
     * （2026-11-05 我加 pool 过滤时就踩了这个，en_sort 直接消失，靠 QA 冒烟抓到）。 */
    if (String(k).indexOf('MATH_') !== 0) return true;
    /* 数学槽位里若只剩「不判分」条目（未作答/动手题），日常档不该再显示这个题型 chip */
    if (pool && pool !== 'midterm') return arr.some(function (it) { return validOrig(it) && servable(it, pool); });
    return arr.some(validOrig);
  }
  /* 供 UI 过滤空数据题型 chip（QA D-1） */
  MT.typeHasData = typeHasData;
  MT.availableTypes = function (subject) {
    var bySubj = {
      yuwen: ['pinyin', 'zuci', 'jinyi', 'liangci', 'poem', 'py2han', 'addradical', 'duyin', 'duyin_table', 'simile', 'simile_open', 'huanzi', 'panduan', 'zhaoyang', 'kewen_read', 'kewai2', 'kanshuxiehua', 'recite'],
      math: ['calc_add', 'calc_sub', 'calc100', 'mul', 'cmp', 'len', 'money', 'clock', 'word', 'seq', 'shape',
        'calc120_add', 'calc120_sub', 'vertical_add', 'vertical_sub', 'strategy', 'len_mixed', 'perimeter', 'shape2d', 'shape3d', 'area_grid', 'word120',
        'open_number_line', 'bar_model', 'place_value', 'table_read', 'pattern', 'square_count',
        /* INGEST-03 〔原题·老师批改版〕新题型 */
        'len_conv', 'strategy_comp', 'number_form', 'shape_tf', 'perimeter_fix', 'area_rowcol', 'vertical_orig'],
      english: ['listen', 'cn2en', 'en2cn', 'spell', 'cloze', 'phrase', 'vocab_match', 'vocab_sent', 'vocab_def', 'spell_rule', 'grammar', 'reading_skill', 'alpha_order', 'writing'],
      science: ['sci_observe', 'sci_animals', 'sci_plants', 'sci']
    };
    return (bySubj[subject] || []).filter(typeHasData);
  };

  /* ---------- 数学·卷面原题与槽位（MATH-02 / MATH-ET-01·03·04·05·09·11） ----------
   * 铁律：条目没有 src（转录件+图号+题号）就不出这道题——可溯源是本次硬要求，宁可少出不编造。 */

  /* 三条固定动作（内容稿 §4 判读总注：孩子缺的是"固定动作"，不是概念） */
  var FIXED_HINTS = {
    len_mixed: {
      en: 'Before you read the ruler, find where the object STARTS — if it does not start at 0, count the gaps.',
      zh: '读尺前先找起点：不是从 0 开始，就数格子而不是读最后一个数。'
    },
    perimeter: {
      en: 'Perimeter means the OUTSIDE only: trace the outline with one finger, then ignore every line inside.',
      zh: '周长只算外圈：先用手指沿外轮廓描一遍，里面的线全部不算。'
    },
    word120: {
      en: 'Two-step problem? Write the answer of step 1 in a box first, then use that number in step 2.',
      zh: '两步题先把第一步的答案写进方框，第二步再用这个数。'
    },
    bar_model: {
      en: 'Read the question twice: first find what step 1 gives you, then use it in step 2.',
      zh: '题目读两遍：先确定第一步求出什么，再拿它做第二步。'
    },
    /* INGEST-03 固定动作（docs §10.4 老师红笔原话＝全班规范清单，进讲解不进弱点） */
    len_conv: {
      en: 'Must write units: always finish with the unit (in / ft / yd / cm) — the teacher checks it!',
      zh: '算完必写单位（in/ft/yd/cm 之一）——老师红笔明确要求 Must write units。'
    },
    perimeter_fix: {
      en: 'Must write units: put in / ft / cm after your number, and trace the OUTSIDE sides only.',
      zh: '算完必写单位（in/ft/cm），周长只描外圈的边。'
    },
    area_rowcol: {
      en: 'Area counts SQUARE units — write square units after your number (Must write units).',
      zh: '面积数的是方格，结果要写 square units（老师红笔：Must write units）。'
    },
    strategy_comp: {
      en: 'Teacher rule: only the standard two steps — do NOT write extra steps!',
      zh: '老师规矩（红笔）：只能这样写，不要多写 step！'
    },
    number_form: {
      en: 'When you make 2-digit numbers, the tens digit can NEVER be 0.',
      zh: '组两位数时，十位上不能是 0。'
    }
  };
  function attachHint(q, type) {
    var h = FIXED_HINTS[type];
    if (!h || !q) return q;
    q.hint = h.en;
    q.hintZh = h.zh;
    if (q.explain && q.explain.indexOf(h.en) < 0) q.explain = q.explain + ' ' + h.en;
    if (q.explainZh && q.explainZh.indexOf(h.zh) < 0) q.explainZh = q.explainZh + ' ' + h.zh;
    return q;
  }

  /* 条目是否可入库：必须有题干与 src 溯源；答案缺失只允许发生在「不判分」条目上
   * （pending 未作答 / manual 动手题）——否则 12 道未作答真题会被这里静默丢掉（2026-11-05 自查发现）。 */
  function validOrig(it) { return !!(it && it.q != null && it.src && (it.a != null || it.grade === false)); }

  /* 原题/槽位条目 → 题目对象（不可入库返回 null） */
  function mkOrig(it, type) {
    if (!validOrig(it)) return null;
    var t = it.type || type;
    var q = mkMath(t, String(it.q), it.a == null ? null : String(it.a),
      (it.opts && it.opts.length) ? it.opts.slice(0, 4) : null,
      it.speak || String(it.q), it.explain || '', it.explainZh || '');
    q.src = it.src;                       /* 「转录件 图N·NNN.jpg 题号」——溯源标记，家长区/讲解尾部可见 */
    q.pool = it.pool || 'midterm';
    if (it.img) q.img = it.img;           /* 透传字段（构建副本数据区无 img 项） */
    if (it.needsFigure) q.needsFigure = true;
    if (it.aRef) q.aRef = it.aRef;        /* 卷面没写、但参考答案可给出的条目（不判分，只在讲评区展示） */
    if (it.table) q.table = it.table;     /* TABLE_READ 用，app.js 渲染成表格 */
    if (it.rows) q.rows = it.rows;        /* ONL/partial sums 的跳步表 */
    if (it.mode) q.mode = it.mode;        /* word120 的 'usd' 美制货币推理（MATH-ET-07） */
    if (it.weak) { q.weak = true; q.weakId = it.weak; }
    if (it.grade === false) {             /* 未作答 / 动手题：入库不判分、不进弱点权重（MATH-ET-12） */
      q.grade = false;
      /* pending 标记要带到运行时题目上：家长区/错题本/QA 都靠它区分「还没做」与「判错了」
       * （2026-11-05 CDP 专项发现这里只带了 grade:false，pending 在题目对象上丢了） */
      if (it.pending) q.pending = true;
      q.pendingNote = it.pendingNote || 'Answer not on the paper — please confirm with your parent.';
      q.pendingNoteZh = it.pendingNoteZh || '卷面未作答，待家长确认（本题不计分、不计入弱点）';
      delete q.weak; q.weakId = it.weak || null;
    }
    if (it.manual) q.manual = true;
    /* 〔存疑〕条目必须一路带到题目对象上（QA D-R9-1，2026-11-05）：
     * 转录件标〔存疑〕/〔无法辨认〕的题，判分可能不可靠——孩子答错要被标「待核」，家长得知道这题的读数有争议。
     * 英语线早就有 doubt 透传（D-R4-5），数学线在最后一环漏了，9 条（含 7 道判分题）标记全丢。 */
    if (it.dubious || it.doubt) {
      q.doubt = true;
      if (it.dubiousNote) { q.doubtNote = it.dubiousNote; q.doubtNoteZh = it.dubiousNote; }
    }
    return attachHint(q, t);
  }

  /* 纯数据槽位生成器：数组为空返回 null，配合 DATA_GATE 自动隐藏该题型 */
  /* 不判分条目（pending 未作答 / manual 动手题）只进期中卷：
   * 日常练习里冒出一道「不给分、没讲解」的题对孩子没意义（QA 冒烟契约：每题必须有答案与讲解）。
   * 期中卷按 Chief 口径照常收它们（真实卷面题、价值最高），只是不判分、不计弱点。 */
  function servable(it, pool) { return !!it && (it.grade !== false || pool === 'midterm'); }

  function slotGen(arrName, type, fallback) {
    return function (level, pool) {
      var arr = (B[arrName] || []).filter(function (it) { return validOrig(it) && servable(it, pool); });
      if (!arr.length) return null;
      var it = pickWeighted(arr);
      var q = mkOrig(it, type);
      /* INGEST-03：条目没带 explain 时用类型级兜底（老师公式框/规则句，集中一处防漂移），
       * 并把 FIXED_HINTS 尾行同步进讲解（mkOrig 的 attachHint 只挂到已有 explain 上）。 */
      if (q && !it.explain && fallback) {
        var f = fallback(it) || {};
        q.explain = f.en || '';
        q.explainZh = f.zh || '';
        var h = FIXED_HINTS[type];
        if (h && q.explain) q.explain += ' ' + h.en;
        if (h && q.explainZh) q.explainZh += ' ' + h.zh;
      }
      return q;
    };
  }

  function originsFor(type, pool) {
    return (B.MATH_ORIGINS || []).filter(function (it) { return validOrig(it) && it.type === type && servable(it, pool); });
  }

  /* 期中优先出原题（MATH-ET-09：期中池原题占比 ≥50%；自创题 pool:'daily'）
   * 只有显式请求期中池（pool==='midterm'）才出原题；缺省与 'daily' 一律纯自创。
   * 契约依据：①「日常积累」档不得混入真题；②冒烟/回归测试按题型直接出题，
   * 需拿到确定性生成器的题干来校验格式，缺省若混原题会打断格式断言。 */
  function originFirst(type, pool) {
    if (pool !== 'midterm') return null;
    var arr = originsFor(type, pool);
    if (!arr.length) return null;
    if (Math.random() >= 0.72) return null;
    return mkOrig(pickWeighted(arr), type);
  }
  MT.originFirst = originFirst;                 /* 冒烟断言用 */
  /* 按「题号」定向取卷面条目（A3-1 … ）。期中模拟卷的 Part III 必须就是卷面那 6 道应用题，
   * 不能按题型随机抽——随机抽出来的不是「真卷结构」，也和 Chief 验收第 4 条对不上。 */
  MT.originByNo = function (no) {
    var keys = ['MATH_ORIGINS', 'MATH_ONL', 'MATH_BARMODEL', 'MATH_PLACE', 'MATH_TABLE', 'MATH_PATTERN', 'MATH_SQUARE',
      'MATH_LENCONV', 'MATH_STRAT2', 'MATH_NUMFORM', 'MATH_SHAPETF', 'MATH_PERIM2', 'MATH_AREA2', 'MATH_VERT2'];
    for (var i = 0; i < keys.length; i++) {
      var arr = B[keys[i]] || [];
      for (var j = 0; j < arr.length; j++) {
        var it = arr[j];
        if (it && it.src && new RegExp('(^|\\s)' + no + '$').test(String(it.src).trim()) && validOrig(it)) return mkOrig(it, it.type);
      }
    }
    return null;
  };
  MT.originCount = function (type) { return type ? originsFor(type, 'midterm').length : (B.MATH_ORIGINS || []).length; };
  MT.slotCount = function (k) { return ((B[k]) || []).filter(validOrig).length; };

  /* ---------- 总入口 ---------- */
  var GEN = {
    /* 语文 */
    pinyin: genPinyin, zuci: genZuci, jinyi: genJinyi, liangci: genLiangci, poem: genPoem,
    py2han: genPy2han, addradical: genAddradical, duyin: genDuyin, huanzi: genHuanzi,
    /* INGEST-03 语文新题型（〔原题·老师批改版03〕，Chief 裁定2） */
    duyin_table: genDuyinTable, simile: genSimile, simile_open: genSimileOpen,
    panduan: genPanduan, zhaoyang: genZhaoyang, kewen_read: genKewenRead, kewai2: genKewaiRead,
    kanshuxiehua: genKanshu, recite: genRecite,
    /* 数学 */
    calc_add: function (lv) { return genCalc('add', lv); },
    calc_sub: function (lv) { return genCalc('sub', lv); },
    calc100: function (lv) { return genCalc('mix', lv); },
    mul: genMul, cmp: genCmp, len: genLen, money: genMoney, clock: genClock, word: genWord, seq: genSeq, shape: genShape,
    calc120_add: function (lv) { return genCalc120('add', lv); },
    calc120_sub: function (lv) { return genCalc120('sub', lv); },
    vertical_add: function (lv) { return genVertical('add', lv); },
    vertical_sub: function (lv) { return genVertical('sub', lv); },
    strategy: genStrategy, len_mixed: genLenMixed, perimeter: genPerimeter,
    shape2d: genShape2d, shape3d: genShape3d, area_grid: genAreaGrid, word120: genWord120,
    /* 卷面新槽位（MATH-ET-03/04/05）：纯数据驱动，无数据即不出题、题型 chip 自动隐藏 */
    open_number_line: slotGen('MATH_ONL', 'open_number_line'),
    bar_model: slotGen('MATH_BARMODEL', 'bar_model'),
    place_value: slotGen('MATH_PLACE', 'place_value'),
    table_read: slotGen('MATH_TABLE', 'table_read'),
    pattern: slotGen('MATH_PATTERN', 'pattern'),
    square_count: slotGen('MATH_SQUARE', 'square_count'),
    /* INGEST-03 〔原题·老师批改版〕新题型（Chief 裁定2：len_conv 五种换算＝最大知识空白优先；
     * 独立类型名，不动任何现有动态生成器；池 daily＝家庭练习，不进期中模拟卷 53 题结构） */
    len_conv: slotGen('MATH_LENCONV', 'len_conv', function () {
      return { en: 'Formula box: 1 ft = 12 in | 1 yd = 3 ft | 1 yd = 36 in | 1 m = 100 cm. Big unit → small unit: multiply; small → big: divide.',
               zh: '公式框（老师卷置顶）：1 ft＝12 in｜1 yd＝3 ft｜1 yd＝36 in｜1 m＝100 cm。大单位换小单位用乘，小换大用除。' };
    }),
    strategy_comp: slotGen('MATH_STRAT2', 'strategy_comp'),
    number_form: slotGen('MATH_NUMFORM', 'number_form', function () {
      return { en: 'Greatest difference: biggest digit on top tens, smallest non-zero digit under it. Smallest sum: two smallest digits go on the tens places. Tens can never be 0.',
               zh: '最大差：最大的数字放被减数十位，最小的非 0 数放减数十位；最小和：最小的两个数字放十位。十位不能是 0。' };
    }),
    shape_tf: slotGen('MATH_SHAPETF', 'shape_tf'),
    perimeter_fix: slotGen('MATH_PERIM2', 'perimeter_fix'),
    area_rowcol: slotGen('MATH_AREA2', 'area_rowcol'),
    vertical_orig: slotGen('MATH_VERT2', 'vertical_orig'),
    /* 英语 */
    listen: genListen, cn2en: genCn2En, en2cn: genEn2Cn, spell: genSpell, cloze: genCloze, phrase: genPhrase,
    vocab_match: genVocabMatch, vocab_sent: genVocabSent, vocab_def: genVocabDef,
    spell_rule: genSpellRule, grammar: genGrammar, reading_skill: genReadingSkill, alpha_order: genAlphaOrder, writing: genWriting,
    /* 英语精准化（数据未到则自动隐藏） */
    en_sort: genSort, en_match: genMatch, en_order: genOrder, en_fill: genFill,
    /* 科学（sci=全部，sci_observe=U1，sci_animals=U3） */
    sci: function () { return genSci(); },
    sci_observe: function () { return genSci('u1'); },
    sci_animals: function () { return genSci('u3'); },
    sci_plants: function () { return genSci('u-plants'); }
  };

  /* config.topics 里出现的 gen.types 全覆盖检查表（供调试/自检） */
  MT.allTypes = Object.keys(GEN);

  /* ---------- 弱点加权（MATH-ET-02）----------
   * WEAKNESS 里每张卡覆盖的题型，在"抽哪个题型"这一步按 weight 提权（只影响选题型，不改题目内容）。
   * 数学段 MW-01~10 即由此接入期中池出题权重。导出供冒烟/回归断言。 */
  var WEAK_MULT = { highest: 2.0, high: 1.6, mid: 1.25, low: 1.1 };
  function weaknessBoostMap(subj) {
    var m = {};
    (B.WEAKNESS || []).forEach(function (w) {
      if (!w || !w.types) return;
      /* 旧英语段（W-01~11）没有 subj 字段，按 'english' 归属处理——
       * 否则英语弱点卡会串进数学抽题（writing×2 之类），跨科目污染权重 */
      var wSubj = w.subj || 'english';
      if (subj && wSubj !== subj) return;
      var mul = WEAK_MULT[w.weight] || 1;
      w.types.forEach(function (t) { m[t] = Math.max(m[t] || 1, mul); });
    });
    return m;
  }
  MT.weaknessBoost = function (subj) { return weaknessBoostMap(subj); };
  MT.WEAK_MULT = WEAK_MULT;

  /**
   * 生成一道题
   * @param subject  'yuwen' | 'math' | 'english'
   * @param level    1 | 2 | 3（难度；语文英语影响较小）
   * @param types    题型数组（如 ['pinyin'] 或 ['calc100','mul']）；为空则按科目全题型随机
   * @param opts     可选项 {pool:'midterm'|'daily'}；数学 daily＝只出自创题，midterm/缺省＝原题优先
   * @returns 题目对象 {subj,type,q,a,opts?,speak,explain,topicTag}
   */
  MT.genQ = function (subject, level, types, opts) {
    level = Math.min(3, Math.max(1, level || 2));
    var bySubj = {
      yuwen: ['pinyin', 'zuci', 'jinyi', 'liangci', 'poem', 'py2han', 'addradical', 'duyin', 'duyin_table', 'simile', 'simile_open', 'huanzi', 'panduan', 'zhaoyang', 'kewen_read', 'kewai2', 'kanshuxiehua', 'recite'],
      math: ['calc_add', 'calc_sub', 'calc100', 'mul', 'cmp', 'len', 'money', 'clock', 'word', 'seq', 'shape',
        'calc120_add', 'calc120_sub', 'vertical_add', 'vertical_sub', 'strategy', 'len_mixed', 'perimeter', 'shape2d', 'shape3d', 'area_grid', 'word120',
        'open_number_line', 'bar_model', 'place_value', 'table_read', 'pattern', 'square_count',
        /* INGEST-03 〔原题·老师批改版〕新题型 */
        'len_conv', 'strategy_comp', 'number_form', 'shape_tf', 'perimeter_fix', 'area_rowcol', 'vertical_orig'],
      english: ['listen', 'cn2en', 'en2cn', 'spell', 'cloze', 'phrase',
        'vocab_match', 'vocab_sent', 'vocab_def', 'spell_rule', 'grammar', 'reading_skill', 'alpha_order', 'writing',
        'en_sort', 'en_match', 'en_order', 'en_fill'],
      science: ['sci_observe', 'sci_animals', 'sci_plants', 'sci']
    };
    var pool = bySubj[subject] || bySubj.math;
    var use = (types && types.length) ? types.filter(function (t) { return GEN[t] && pool.indexOf(t) >= 0; }) : pool;
    /* 档位（daily / midterm）必须先解析：下面的数据闸与槽位供给都要按档位决定
     * ——不判分条目（未作答/动手题）只进期中卷（见 servable）。 */
    var qPool = (opts && opts.pool) || null;
    /* 数据区为空的题型不出题（语文九型待 Researcher 供稿） */
    use = use.filter(function (x) { return typeHasData(x, qPool); });
    if (!use.length) use = pool.filter(function (x) { return typeHasData(x, qPool); });
    if (!use.length) use = pool;
    /* ET-15 权重表 × 掌握度弱点加权：拼读低权重，句类/阅读理解/词义/写作高权重 */
    var TW = B.TYPE_WEIGHT || {};
    var WB = weaknessBoostMap(subject);   /* MATH-ET-02：WEAKNESS high/mid 卡覆盖的题型提权 */
    var pickType = function (list) {
      var weights = list.map(function (x) {
        var w = (TW[x] || 1) * (WB[x] || 1);
        try {
          if (MT.store && MT.store.mastery) {
            var m = MT.store.mastery(subject, x);
            if (m && m.seen) w *= (1 + 1.5 * (1 - m.correct / m.seen));
          }
        } catch (e) { }
        return w;
      });
      var total = 0;
      weights.forEach(function (w) { total += w; });
      var r = Math.random() * total;
      for (var i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i]; }
      return list[list.length - 1];
    };
    var t = pickType(use);
    /* 期中池：该题型有〔原题〕时优先出原题（自创题 pool:'daily'） */
    var q = originFirst(t, qPool) || GEN[t](level, qPool);
    /* 出题口统一收口：自创题标 pool:'daily'（部分生成器直接返回对象、未经 mkMath），
     * 三条固定动作 hint 对原题与自创题一致追加（MATH-ET-11） */
    if (q && subject === 'math') {
      if (!q.pool) q.pool = 'daily';
      attachHint(q, t);
    }
    /* 兜底：任何出题异常返回一道不会崩的题（不判分条目允许 a 为 null，不能被这里换掉） */
    if (!q || typeof q.q !== 'string' || (typeof q.a !== 'string' && !(q.grade === false && q.a === null))) {
      return MT.genQ(subject, level, pool.filter(function (x) { return x !== t; }));
    }
    return q;
  };
})();
