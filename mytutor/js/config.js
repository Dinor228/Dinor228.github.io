/* My Tutor · 全局配置：科目、预习主题讲解内容、离线对话规则 */
window.MT = window.MT || {};

MT.cfg = {
  appName: 'My Tutor',
  tutorName: '小优老师',
  tutorNameEn: 'Miss Xiao You',
  mascot: '🐼',

  subjects: {
    yuwen:   { name: '语文', emoji: '📖', cls: 'yuwen',   desc: '拼音 · 识字 · 古诗 · 表达',
               name_en: 'Chinese', desc_en: 'Pinyin · Characters · Poems · Speaking' },
    math:    { name: '数学', emoji: '🔢', cls: 'math',    desc: '计算 · 口诀 · 图形 · 生活', name_en: 'Math',    desc_en: 'Numbers · Facts · Shapes' },
    english: { name: '英语', emoji: '🔤', cls: 'english', desc: '单词 · 拼读 · 句子 · 对话', name_en: 'English', desc_en: 'Words · Phonics · Sentences' },
  },

  /* 预习主题：points=讲解要点(逐条朗读)，example=例题，gen=配套练习的题型 */
  topics: {
    yuwen: [
      { id: 'pinyin', title: '拼音巩固', emoji: '🗣️', brief: '平翘舌、前后鼻韵母',
        points: [
          'zh、ch、sh、r 是翘舌音，舌头要翘起来；z、c、s 是平舌音，舌头放平。',
          'an、en、in、un、ün 是前鼻韵母，ng 结尾的是后鼻韵母，比如 ang、eng、ing。',
          'j、q、x 和 ü 相拼时，ü 要去掉两点，比如 ju、qu、xu。',
          '声调：一声平ˉ，二声扬ˊ，三声拐弯ˇ，四声降ˋ。',
        ],
        example: { q: '"山"的声母是哪个？ A. s  B. sh', a: 'B. sh，山读 shān，是翘舌音。' },
        gen: { types: ['pinyin'] } },
      { id: 'poem', title: '古诗小达人', emoji: '🏮', brief: '二年级必背古诗',
        points: [
          '背古诗前先读准字音，再想一想诗里画了一幅什么画。',
          '《登鹳雀楼》告诉我们：想要看得远，就要再往上登一层楼。',
          '《望庐山瀑布》里"飞流直下三千尺"是把瀑布写得特别长，这叫夸张。',
          '背的时候记住上一句，就能想起下一句。',
        ],
        example: { q: '"白日依山尽"的下一句是？', a: '黄河入海流。——王之涣《登鹳雀楼》' },
        gen: { types: ['poem'] } },
      { id: 'zici', title: '识字与组词', emoji: '🈵', brief: '偏旁归类、一字组多词',
        points: [
          '加一加：木＋木＝林，木＋木＋木＝森。',
          '换偏旁：把"请"的讠换成日，就变成"晴"。',
          '三点水的字大多和水有关：江、河、湖、海、洗。',
          '一个一个字可以组不同的词：花——花朵、开花、花园。',
        ],
        example: { q: '"晴"去掉日字旁，换成目字旁是什么字？', a: '睛，眼睛的睛。' },
        gen: { types: ['zuci'] } },
      { id: 'jinyi', title: '近义词与反义词', emoji: '🔄', brief: '意思相同和相反',
        points: [
          '近义词是意思相近的词：高兴和开心是近义词。',
          '反义词是意思相反的词：大和小、多和少、上升和降落。',
          '换词后句子意思不变，就是近义词；意思反了，就是反义词。',
        ],
        example: { q: '"美丽"的近义词是什么？', a: '漂亮。反义词是丑陋。' },
        gen: { types: ['jinyi'] } },
      { id: 'liangci', title: '量词搭配', emoji: '📏', brief: '一只鸟、一棵树',
        points: [
          '动物用"只"，树木用"棵"，花朵用"朵"，长条的用"条"。',
          '有把手的用"把"：一把伞、一把刀。',
          '书、本子用"本"，车子用"辆"，飞机用"架"。',
          '记量词的好办法：把它想象成一幅画，一（条）小河弯弯腰。',
        ],
        example: { q: '一（ ）小鱼', a: '条。一条小鱼。' },
        gen: { types: ['liangci'] } },
      { id: 'huohua', title: '看图写话', emoji: '🖼️', brief: '四步写出好句子',
        points: [
          '第一步：看清时间——早上、下午还是星期天？',
          '第二步：看清地点——公园、学校还是家里？',
          '第三步：看清人物在做什么，心情怎么样。',
          '第四步：连起来写一句话：什么时候，谁在什么地方干什么，心情怎么样。',
        ],
        example: { q: '图上：星期天，小红在公园里放风筝。', a: '星期天，小红在公园里开心地放风筝。' },
        gen: null },
    ],
    math: [
      { id: 'calc100', title: 'Addition & Subtraction to 100', emoji: '➕', brief: 'Carry in, borrow out',
        points: [
          'Line up the same place values and start from the ones.',
          'Adding: if the ones make 10, carry 1 to the tens.',
          'Subtracting: if the ones are not enough, borrow 1 from the tens as 10.',
          'Check your work: use subtraction to check addition, addition to check subtraction.',
        ],
        example: { q: '36 + 27 = ?', a: '63. Ones 6+7=13 — carry 1; tens 3+2+1=6.' },
        gen: { types: ['calc100'] } },
      { id: 'chengfa', title: 'Multiplication Tables', emoji: '✖️', brief: 'Groups of equal size → multiply',
        points: [
          'Multiplication is adding the same number again and again: 3 groups of 4 = 3×4 = 12.',
          'Read your tables out loud every day — all the way to nine nines, eighty-one.',
          'Swap the numbers, same answer: 3×5 and 5×3 are both 15.',
          'Nine trick: the digits of every 9-times answer add up to 9.',
        ],
        example: { q: '7 × 8 = ?', a: '56. Seven eights, fifty-six!' },
        gen: { types: ['mul'] } },
      { id: 'length', title: 'Length Units', emoji: '📏', brief: 'cm and m',
        points: [
          'Use centimetres (cm) for short things and metres (m) for long distances.',
          '1 m = 100 cm.',
          'Measure from the 0 mark: line it up with one end, then read the other end.',
          'Think: a pencil is about 15 cm long; a classroom door is about 2 m tall.',
        ],
        example: { q: '3 m = ? cm', a: '300 cm. 1 m is 100 cm, so 3 m is 300 cm.' },
        gen: { types: ['len'] } },
      { id: 'jiao', title: 'Angles Up Close', emoji: '📐', brief: 'Vertex, sides, right angle',
        points: [
          'An angle has one vertex and two sides.',
          'The biggest angle on a set square is a right angle — perfectly square.',
          'Smaller than a right angle is acute; bigger than a right angle is obtuse.',
          'Angle size depends on how wide the sides open, not how long the sides are.',
        ],
        example: { q: 'How many angles does a red scarf have?', a: '3 angles, and 1 of them is obtuse.' },
        gen: { types: ['shape'] } },
      { id: 'clock', title: 'Telling Time', emoji: '🕐', brief: 'O’clock and half past',
        points: [
          'The short fat hand is the hour hand; the long thin hand is the minute hand.',
          'Minute hand on 12: the hour hand points to the hour.',
          'Minute hand on 6: past the hour hand is half past.',
          '1 hour = 60 minutes — you can skip rope about 60 times in 1 minute!',
        ],
        example: { q: 'Minute hand on 12, hour hand on 8 — what time is it?', a: '8 o’clock, exactly 8:00.' },
        gen: { types: ['clock'] } },
      { id: 'rmb', title: 'Money: Yuan, Jiao, Fen', emoji: '💰', brief: 'Counting money and change',
        points: [
          '1 yuan = 10 jiao, 1 jiao = 10 fen.',
          'Add up a total: yuan first, then jiao.',
          'Change: money paid − price = change back.',
          'A pencil is 8 jiao; pay 1 yuan and get 2 jiao back.',
        ],
        example: { q: '1 yuan 5 jiao = ? jiao', a: '15 jiao. 1 yuan is 10 jiao, plus 5 more.' },
        gen: { types: ['money'] } },
    ],
    english: [
      { id: 'phonics', title: 'Phonics', emoji: '🔠', brief: 'Letter sounds · CVC blending',
        points: [
          'Every letter has a name and a sound: a is named /ei/ and says /æ/.',
          'Short vowels a e i o u: cat, hen, pig, dog, bus.',
          'Blend in three steps: first sound → middle sound → last sound, then read them together.',
          'Blend 3 CVC words a day — in a month you can read many words!',
        ],
        example: { q: 'Blend: /k/ /æ/ /t/', a: 'cat!' },
        gen: { types: ['spell', 'listen'] } },
      { id: 'greet', title: 'Greetings', emoji: '👋', brief: 'Everyday greetings',
        points: [
          'Hello! / Hi! Good morning!',
          'How are you? — I’m fine, thank you!',
          'What’s your name? — My name is ...',
          'Goodbye! / See you!',
        ],
        example: { q: 'Your teacher meets you in the morning — what do you say?', a: 'Good morning, teacher!' },
        gen: { types: ['phrase'] } },
      { id: 'colors', title: 'Colors & Numbers', emoji: '🌈', brief: 'colors & numbers 1-20',
        points: [
          'red, orange, yellow, green, blue, black, white.',
          'one…ten, and eleven to twenty as whole words.',
          'What color is it? — It’s red.',
          'How many ... do you have? — I have five.',
        ],
        example: { q: 'What is the English word for the color of the sky?', a: 'blue.' },
        gen: { types: ['cn2en', 'en2cn'] } },
      { id: 'animals', title: 'Animal Friends', emoji: '🐶', brief: 'animals · I like...',
        points: [
          'cat, dog, bird, fish, monkey, panda, tiger.',
          'I like pandas. Do you like dogs?',
          'Yes, I do. / No, I don’t. — like it? Say Yes, I do!',
          'Plural small s: one cat, two cats.',
        ],
        example: { q: 'What is the English word for a monkey?', a: 'monkey.' },
        gen: { types: ['cn2en', 'listen'] } },
      { id: 'family', title: 'My Family', emoji: '👨‍👩‍👧', brief: 'family members',
        points: [
          'father (dad), mother (mum), brother, sister.',
          'grandpa, grandma.',
          'This is my family.',
          'Who is he? — He is my father.',
        ],
        example: { q: 'What is the English word for an older sister?', a: 'sister.' },
        gen: { types: ['en2cn'] } },
      { id: 'food', title: 'Food & Likes', emoji: '🍎', brief: 'food · I like...',
        points: [
          'apple, banana, rice, noodles, milk, egg.',
          'I like apples. I don’t like eggs.',
          'Have some milk! Thank you!',
          'Would you like some rice?',
        ],
        example: { q: 'What is the English word for noodles?', a: 'noodles.' },
        gen: { types: ['cloze', 'cn2en'] } },
    ],
  },

  aiPersona: '你是"小优老师"，一个温柔有趣的中文家庭教师，学生是上海中学国际部二年级（7-8岁）的孩子。' +
    '要求：回答不超过3句话，简短口语化，多鼓励；讲知识先表扬再讲解；一次只问一个问题。' +
    '学生说英语或要求英语对话时，用小学二年级能懂的简单英语回答（不超过3句），可以在结尾加一句中文翻译。' +
    '不要输出 markdown 格式符号，像聊天一样说话。数学答案要正确，涉及单位要写清楚。',

  /* 非语文科目（数学/科学/英语）的 AI 老师：全英文，孩子向，不用 markdown */
  aiPersonaEn: 'You are "Miss You" (Miss Xiao You), a kind and playful Grade 2 English teacher. ' +
    'Your student is a 7-8 year old child at SHSID International Division. ' +
    'Always reply in English only — never in Chinese, and never mix languages. ' +
    'Use short, simple sentences a 7 year old can read. Be warm and encouraging; praise first, then teach. ' +
    'Follow the exact numbered structure the message asks for and do not add extra sections. ' +
    'Do not use markdown symbols or bullet dashes; write plain sentences and numbers. ' +
    'Never give a total score unless asked. Math answers must be correct and units must be written clearly.',

  /* 离线（无 AI）时的对话规则：pats 命中任一正则即用 replies 里随机一条 */
  chatRules: [
    { pats: ['你好', 'hello', 'hi', '嗨', '早上好', '下午好'],
      replies: ['你好呀！我是小优老师🐼 今天想学语文、数学还是英语？', '嗨！很高兴见到你～要不要先来 5 道数学题热热身？'] },
    { pats: ['你是谁', '你叫什么'],
      replies: ['我是小优老师，你的学习小伙伴！我能出题、讲题，还能陪你练英语对话。'] },
    { pats: ['你会什么', '能做什么', '功能'],
      replies: ['我会三样法宝：①陪你预习新课 ②出练习题考考你 ③听你语音回答、给你讲解。点下面的按钮就能开始！'] },
    { pats: ['背诗', '古诗', '念首诗', '来首诗'],
      replies: ['@poem'] },
    { pats: ['口诀', '乘法'],
      replies: ['@mul'] },
    { pats: ['英语', 'english', '英文'],
      replies: ['Let\'s talk in English! How are you today? （用英语回答我：I\'m fine, thank you!）',
                'Good question! 我们来练单词吧：跟我说 apple——苹果。再说说看 banana？'] },
    { pats: ['难', '不会', '好难', '太难'],
      replies: ['别着急，慢慢来，你已经很棒了！我们把题目拆小一点：先想想第一步要算什么？'] },
    { pats: ['谢谢', 'thanks', 'thank'],
      replies: ['不客气！你认真的样子最帅啦⭐ 再来一题吗？'] },
    { pats: ['再见', 'bye', '下次'],
      replies: ['再见啦小同学！今天学到的知识要记得复习哦，我等你回来🐼'] },
    { pats: ['表扬', '我厉害吗', '棒不棒'],
      replies: ['当然厉害！坚持练习的小朋友最了不起，老师给你一朵小红花🌸'] },
  ],
  chatFallback: ['这个问题有意思！不过我还在努力学习中～不如我们先练一道题？点下面的"练习"按钮开始吧！',
                 '嗯～你可以换个说法，或者问我：背诗、乘法口诀、英语单词，这些我最拿手啦！'],

  /* 英文界面（默认）的离线对话规则：AI 不可用时也不能突然蹦中文 */
  chatRulesEn: [
    { pats: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', '你好'],
      replies: ["Hello! I'm Miss Xiao You 🐼 What shall we learn today — Chinese, Math, Science or English?",
                'Hi there! Want to warm up with 5 quick math questions?'] },
    { pats: ['who are you', 'your name', '你是谁'],
      replies: ["I'm Miss Xiao You, your learning buddy. I can quiz you, explain answers and practise English with you."] },
    { pats: ['what can you do', 'help', '你会什么'],
      replies: ['I can do three things: read a new topic with you, give you questions to try, and listen to your answer and explain it.'] },
    { pats: ['poem', 'poetry', '诗'],
      replies: ['@poem'] },
    { pats: ['times table', 'multiply', 'multiplication', '口诀'],
      replies: ['@mul'] },
    { pats: ['english', 'talk', 'speak', '英语'],
      replies: ["Let's talk in English! Tell me one thing you did today, for example: I played with my dog."] }
  ],
  chatFallbackEn: ['Good question! I am still learning that one — shall we try a quick question instead?',
                   'Hmm, say it another way? Or ask me for a poem, a times table, or an English chat — those are my best tricks!'],

  praises: ['太棒了！', '答对啦，真厉害！', '完全正确！', '哇，全对！', '真聪明！'],
  cheers: ['差一点点，再想想！', '没关系，看看讲解就会啦！', '加油，下次一定对！'],
};

/* ================================================================
 * 2026 期中内容包（docs/content-brief-2026-midterm.md）
 * 数据层追加：旧主题保留并标"日常积累"，新增期中复习主题卡；
 * 教学内容（points/example）此处仅为占位，正式内容由 Researcher 供稿替换。
 * ================================================================ */
(function () {
  var cfg = MT.cfg;

  /* 1. 旧主题统一标为"日常积累"池（不删，入口保留） */
  Object.keys(cfg.topics).forEach(function (s) {
    (cfg.topics[s] || []).forEach(function (t) { if (!t.pool) t.pool = 'daily'; });
  });

  /* 2. 第四科：科学（🧪，11-10） */
  cfg.subjects.science = { name: '科学', emoji: '🧪', cls: 'science', desc: '观察 · 动物 · 适应', name_en: 'Science', desc_en: 'Observe · Animals · Adaptations' };

  /* 3. 期中复习主题卡（pool=midterm） */
  cfg.topics.yuwen = cfg.topics.yuwen.concat([
    { id: 'shengzi', title: '课文生字', emoji: '🈶', brief: '看拼音写词 · 读音 · 形近字', pool: 'midterm',
      points: ['七课生字要会读会写，看拼音要能写出词语。', '多音字先看句子，再定读音；多音字表要每个读音都会组词（老师卷格式：全表注音＋逐音组词）。', '形近字看清偏旁，别写错。'],
      gen: { types: ['py2han', 'duyin', 'duyin_table', 'huanzi', 'addradical'] } },
    { id: 'neirong', title: '课文内容', emoji: '📖', brief: '课文判断 · 课内阅读', pool: 'midterm',
      points: ['判断对错前，先回忆课文原句。', '阅读题答案都在短文里，回到原文找。'],
      gen: { types: ['panduan', 'kewen_read'] } },
    { id: 'kewai', title: '课外阅读', emoji: '📚', brief: '读短文找信息', pool: 'midterm',
      points: ['先读题，再读短文，划出关键句。'],
      gen: { types: ['kewai2'] } },
    { id: 'jushi', title: '句式仿写', emoji: '✍️', brief: '照样子写句子', pool: 'midterm',
      points: ['仿写要看清楚例句的句式，再换成自己的内容。'],
      gen: { types: ['zhaoyang'] } },
    /* 比喻句（INGEST-03，〔原题·老师批改版03〕新题型，Chief 裁定2）：
       分析 4 题答案唯一＝红笔判分基线；开放写句 AI 判（本体＋喻体＋比喻词达标制）。 */
    { id: 'biyu', title: '比喻句', emoji: '🌗', brief: '把…比作… · 写一句比喻句', pool: 'midterm',
      points: ['先找本体（被打比方的东西），再想它像什么（喻体），用上"像/好像/仿佛"。', '课本好例子：《日月潭》北边像圆圆的太阳，南边像弯弯的月亮。', '抄句子别抄错字——抄完回读一遍和原句对一对（老师红笔）。'],
      gen: { types: ['simile', 'simile_open'] } },
    /* 看图写话：Researcher 2026-10-31 补交 3 条（公园放风筝/雨中共伞/帮妈妈洗碗），恢复进期中组。
       注意：它是 AI 开放题，未配密钥时 chip 仍隐藏（app.js OPEN_TYPES 门控）。 */
    { id: 'kanshuxiehua', title: '看图写话（期中）', emoji: '🖼️', brief: '四步写出好句子', pool: 'midterm',
      points: ['四步：时间 → 地点 → 人物做什么 → 心情。', '写完看看四步提示，少一步就补上一句。'],
      gen: { types: ['kanshuxiehua'] } },
    { id: 'gushi_bei', title: '古诗背诵', emoji: '🏮', brief: '口试抽背（11-06）', pool: 'midterm',
      points: ['先听 TTS 范读，再自己背；背错会标出来。'],
      gen: { types: ['recite', 'poem'] } },
    { id: 'kewen_bei', title: '课文背诵', emoji: '🗣️', brief: '《树之歌》《田家四季歌》', pool: 'midterm',
      points: ['一篇 4 句，逐句背，卡住就看提示。'],
      gen: { types: ['recite'] } }
  ]);

  cfg.topics.math = cfg.topics.math.concat([
    { id: 'shushi', title: '3-Digit Column Math', emoji: '🧮', brief: 'No carry · carry · borrow across 0', pool: 'midterm',
      points: ['Line up the same place values and start from the ones.', 'When the ones make 10, carry 1 to the tens — and keep an eye on the hundreds.', 'Borrowing across 0: think of 100 as 10 tens.'],
      gen: { types: ['vertical_add', 'vertical_sub', 'place_value'] } },
    { id: 'js120', title: 'Mental & Written Math', emoji: '➕', brief: 'Add/sub within 120 · tables · compare', pool: 'midterm',
      points: ['Do the ones first, then the tens.', 'To compare, work out both sides first, then compare.'],
      gen: { types: ['calc120_add', 'calc120_sub', 'mul', 'cmp', 'place_value'] } },
    { id: 'strategy', title: 'Computation Strategies', emoji: '💡', brief: 'Compensation · open number line · partial sums', pool: 'midterm',
      points: ['Compensation: round to make ten, then take back what you added.', 'Open number line: jump the tens first, then the ones.'],
      gen: { types: ['strategy', 'open_number_line'] } },
    { id: 'measure', title: 'Length & Perimeter', emoji: '📏', brief: 'cm/m · in/ft/yd · perimeter', pool: 'midterm',
      points: ['Short things: cm / inch. Long ones: m / foot / yard.', 'Perimeter is the total distance around the outside.'],
      gen: { types: ['len_mixed', 'perimeter'] } },
    { id: 'shapes', title: 'Shapes & Area', emoji: '📐', brief: '2D/3D attributes · square units', pool: 'midterm',
      points: ['A polygon is closed and made of straight sides only.', 'Area = squares in each row × number of rows.'],
      gen: { types: ['shape2d', 'shape3d', 'area_grid', 'square_count', 'pattern'] } },
    { id: 'wordapp', title: 'Word Problems', emoji: '🧩', brief: 'Two-step problems · patterns', pool: 'midterm',
      points: ['First work out what step 1 gives you.'],
      gen: { types: ['word120', 'seq', 'bar_model', 'table_read'] } }
  ]);

  /* 3.5 INGEST-03 math daily practice cards (7 new types, original teacher-graded paper; build notes: my-tutor-ingest03/README.md) */
  cfg.topics.math = cfg.topics.math.concat([
    { id: 'lenconv', title: 'Imperial Conversions', emoji: '📐', brief: 'ft / in / yd · Must write units', pool: 'daily',
      points: ['Formula box: 1 ft = 12 in, 1 yd = 3 ft, 1 yd = 36 in, 1 m = 100 cm.',
               'Big unit to small unit: multiply. Small unit to big unit: divide.',
               'Teacher rule (red pen): Must write units — always finish with in / ft / yd / cm.'],
      gen: { types: ['len_conv'] } },
    { id: 'comp_orig', title: 'Compensation & Number Forms', emoji: '💡', brief: 'Compensation: 2 standard steps · make numbers', pool: 'daily',
      points: ['Compensation: write only the standard two steps — do NOT write extra steps (teacher rule).',
               'When you make 2-digit numbers, the tens digit can never be 0.'],
      gen: { types: ['strategy_comp', 'number_form'] } },
    { id: 'shape_concept', title: 'Shape Talk & Area Rows', emoji: '🔷', brief: 'Shape true/false · rows × columns area', pool: 'daily',
      points: ['A polygon is closed and made of straight sides only — check each rule before you choose.',
               'Area counts squares: rows times the number in each row, then write square units.'],
      gen: { types: ['shape_tf', 'area_rowcol'] } },
    { id: 'perim_vert', title: 'Perimeter & Column Addition', emoji: '🧮', brief: 'Perimeter · paper column math', pool: 'daily',
      points: ['Perimeter = add the OUTSIDE sides only — trace the outline and skip every inner line.',
               'Line up the same place values, start from the ones, and write units in your answer.'],
      gen: { types: ['perimeter_fix', 'vertical_orig'] } }
  ]);

  cfg.topics.english = cfg.topics.english.concat([
    { id: 'reading', title: 'Reading Skills', emoji: '📖', brief: '10 reading skills', pool: 'midterm',
      points: ['Read the question first, then find the answer in the story.'],
      gen: { types: ['reading_skill', 'alpha_order', 'en_order'] } },
    { id: 'spelling', title: 'Phonics & Spelling', emoji: '🔠', brief: 'ck/sh/th/ch · -es/-ing/-ed', pool: 'midterm',
      points: ['sh / ch / th / ck make one sound together.', 'Stressed closed syllable: double the last letter before -ing / -ed.'],
      gen: { types: ['spell_rule', 'spell', 'en_fill'] } },
    { id: 'vocab16', title: 'Vocabulary 16', emoji: '🗂️', brief: '16 must-know words', pool: 'midterm',
      points: ['Read it, choose it, and make a sentence with every word.'],
      gen: { types: ['vocab_match', 'vocab_sent', 'vocab_def', 'en_match'] } },
    { id: 'grammar', title: 'Grammar', emoji: '✏️', brief: 'Subject-verb agreement · plurals · sentence types', pool: 'midterm',
      points: ['One doer → verb +s; many doers → base verb.'],
      gen: { types: ['grammar', 'en_sort'] } },
    { id: 'writing', title: 'Writing', emoji: '📝', brief: 'Personal Narrative (AI feedback)', pool: 'midterm',
      /* ENG-ET-22（老师来信 §19②）：句数口径唯一＝8（cfg.writing.sentences），旧文案"三句话"作废 */
      points: ['Check before you finish: capital at the start, punctuation at the end, 8 sentences about ONE event, in past tense.'],
      gen: { types: ['writing'] } }
  ]);

  cfg.topics.science = [
    { id: 'scientist', title: 'Work Like a Scientist', emoji: '🔬', brief: 'U1 Five Senses · Tools · Scientific Method', pool: 'midterm',
      points: ['Scientists observe the world with five senses.', 'Use a measuring cup for liquids and a ruler for length.', 'Scientific method: ask a question → make a guess → run an experiment → check the results.'],
      gen: { types: ['sci_observe'] } },
    { id: 'animals', title: 'All About Animals', emoji: '🐾', brief: 'U3 Compare · Adaptations · Life Cycle', pool: 'midterm',
      points: ['Adaptations help animals survive: camouflage and mimicry.', 'A butterfly life cycle: egg → larva → pupa → adult.'],
      gen: { types: ['sci_animals'] } },
    { id: 'plants', title: 'Unit 4: Plants', emoji: '🌱', brief: 'Plant Parts · Seeds · Seed Travel · Adaptations', pool: 'midterm',
      points: ['Roots take in water from the soil. The stem holds the plant up and carries water.', 'Leaves use sunlight to make food. Flowers make seeds that grow into new plants.', 'The seed coat keeps the seed safe. Stored food gives the baby plant energy.', 'Seeds travel by wind, by water, by being eaten, or by sticking to fur.', 'Plants that store water in thick leaves or stems fit dry, sunny places.'],
      example: { q: 'Which plant part takes in water from the soil?', a: 'root' },
      gen: { types: ['sci_plants'] } }
  ];

  /* 4. 考试日程（首页倒计时横幅据此滚动：11-06 → 11-10 → 11-11 → 11-12） */
  cfg.midterm = {
    exams: [
      { name: '语文口试', subj: 'yuwen', name_en: 'Chinese Oral Exam', date: '2026-11-06', tip: '抽背古诗和课文，先练「背诵闯关」！', tip_en: 'Recite poems and texts — try the Recitation Challenge first!' },
      { name: '语文笔试', subj: 'yuwen', name_en: 'Chinese Written Exam', date: '2026-11-10', tip: '九大题型：生字、读音、判断、阅读、写话', tip_en: 'Nine question types: characters, sounds, judgment, reading, writing' },
      { name: '科学', subj: 'science', name_en: 'Science Midterm', date: '2026-11-10', tip: 'U1 科学方法 + U3 动物适应', tip_en: 'U1 Science Methods + U3 Animals' },
      { name: '英语', subj: 'english', name_en: 'English Midterm', date: '2026-11-11', tip: 'Reading / Spelling / Vocabulary 16 / Grammar', tip_en: 'Reading · Spelling · Vocabulary 16 · Grammar' },
      { name: '数学', subj: 'math', name_en: 'Math Midterm', date: '2026-11-12', tip: 'U1–U4 + 三位数竖式', tip_en: 'U1–U4 + 3-digit vertical form' }
    ]
  };
  /* 5. 英语限时写作（ENG-08，2026-11-06）
   * 依据：英语老师 2026-11-05 给家长的信 —— 期中要求 20 分钟内从构思到成稿写完一篇 personal narrative，
   * 判据在原有七项之外再点名 Focused / Personal / True / Transitions，且「整洁」要单列。
   * 本块是孩子侧题干、检查清单与 AI 判据的**唯一事实源**：
   *   banks.js 的 WRITING.checklist（旧版写 "at least 6 sentences"）不再被渲染（app.js 一律读本块），
   *   句子数按老师 cheat sheet 的 8 句，复习卷的 6 句不在孩子侧出现（家长已确认）。
   * 老师明确 cheat sheet 考试不能带 → 这里只写"要写成什么样"，不放范文/词表，也不做应用内小抄入口。 */
  cfg.writing = {
    limitSec: 20 * 60,          /* 20 分钟倒计时；超时不强制收笔，只提示并记录 */
    pauseAllow: 1,              /* 7 岁孩子的宽容：整场只可暂停一次 */
    sentences: 8,
    kidPrompt: 'Personal Narrative (choose one): A day I felt proud of myself / A time I worked hard on a project / '
      + 'A time someone helped me / A time I helped my family / A time I made a new friend / A special day I will never forget. '
      + 'Write a TRUE story about YOU, in the PAST tense. Start with a title and a topic sentence, '
      + 'write at least 8 sentences about ONE event, tell how YOU felt, '
      + 'use time words (first, then, next, finally), and end with a concluding sentence.',
    /* 孩子看得懂的短清单（与下面 AI 判据一一对应） */
    kidChecklist: [
      'Title',
      'One real event (not three things)',
      'Topic sentence',
      '8 or more sentences',
      'When · where · who · what happened',
      'How I felt (my own feelings)',
      'first / then / next / finally',
      '4+ describing words',
      'Concluding sentence',
      'Neat: capitals, spaces, ending marks'
    ],
    /* AI 逐项判据：k = 维度短标签（进 ✓/✗ 清单），t = 给模型的判定说明。
     * Personal 权重最高（老师特别点名的新维度）；Neatness 按老师要求单列。 */
    rubric: [
      { k: 'Focused', t: 'The story stays on ONE real event from start to finish; no drifting into other events or a list of happenings.' },
      { k: 'Personal', t: 'IMPORTANT - this is what the teacher asks for: the writer shares their OWN feelings and reactions ("I felt...", "I thought...", "It made me..."). If feelings are missing, or only tacked on at the very end, mark ✗ and say where to add one.' },
      { k: 'True & specific', t: 'It reads like something that really happened to the writer, with concrete details: when, where, who was there, what actually happened. Vague everywhere = ✗. You cannot check whether it is literally true - judge only how concrete and believable it is.' },
      { k: 'Transitions', t: 'Time words (first, then, next, after that, finally) are used, and they match the real order of events.' },
      { k: '8 Sentences', t: 'At least 8 sentences (count by . ! ?).' },
      { k: 'Topic sentence & conclusion sentence + Indent', t: 'Has a title, a topic sentence at the start, a concluding sentence at the end, and the paragraph is indented.' },
      { k: 'Figurative Language & 4 Adjectives', t: 'At least 4 adjectives, adverbs or figurative phrases (like, as ... as, felt like).' },
      { k: 'Grammar & past tense', t: 'Grade 1-2 grammar and punctuation; the story is mostly in the past tense (said, went, felt, was).' },
      { k: 'Neatness', t: 'Easy to read: every sentence starts with a capital letter, one space after each punctuation mark, no ALL-CAPS shouting, no stray characters or runs of spaces. On paper neatness also means tidy handwriting, which a grown-up checks.' }
    ]
  };
})();
