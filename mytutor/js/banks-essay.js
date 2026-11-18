/* My Tutor · Essay 模块数据层（ESSAY-MOD-01）
 * ESSAY_BANK 真数据 = Researcher ESSAY-DATA-01（/Users/marmot/Documents/My Chief/staging/essay-course/essay-bank-src.json）
 *   md5 e3d2b53781303e3beffffd3d5d8f4512 ｜ L1×8 ＋ L3×8 ｜ 并入时间 2026-11-15（DEV）。
 * 字段约定（Chief 定死 schema，两线对接靠它）：id/title/genre/sample.paras[role,text]/
 *   wordList[word,pos,enDef,sent]/quiz≤5[q,type,options,answer,why]/guided{prompt,checklist,minWords}。
 * 数据修订请改源件重跑并入，不手改本文件；前端不引用 assets/ 取证图（IMG-01 判例）。
 * 全英文口径（2026-11-01 定）；quiz 每组 ≤5 题（不题海，家长 2026-11-05 令）。 */
window.MT = window.MT || {};

MT.ESSAY_BANK = {
 "L1": {
  "units": [
   {
    "id": "L1-U1",
    "title": "A Fight with My Friend",
    "genre": "narrative",
    "sample": {
     "title": "A Fight with My Friend",
     "paras": [
      {
       "role": "intro",
       "text": "Yesterday, I fought with my friend Helen. Let me tell you what happened."
      },
      {
       "role": "body",
       "text": "Usually, we like to watch music videos together at lunchtime. But yesterday, something horrible happened. I showed Helen the latest video from my favorite singer, and she hated it! We often have different opinions, but she kept making fun of it. The things she said were so mean and made me so angry that I called her a bad name. I immediately felt really bad about what I said, but it was too late. She didn't talk to me in our science class that afternoon."
      },
      {
       "role": "conclusion",
       "text": "I miss talking to Helen. I regret saying mean things to her. I should apologize to her. Today, I'm going to give Helen something sweet and say sorry. And I found a new video I know she'll love!"
      }
     ]
    },
    "wordList": [
     {
      "word": "make fun of",
      "pos": "phr.",
      "enDef": "to make a joke about (someone or something) usually in a mean way",
      "sent": "They made fun of the way he talked."
     },
     {
      "word": "upset",
      "pos": "adj.",
      "enDef": "angry or unhappy",
      "sent": "I was so upset with him, I didn't call him for two weeks."
     },
     {
      "word": "apologize",
      "pos": "v.",
      "enDef": "to give or make an apology",
      "sent": "We apologize for the mistake and promise that it won't happen again."
     },
     {
      "word": "forgive",
      "pos": "v.",
      "enDef": "to stop feeling anger toward (someone who has done something wrong)",
      "sent": "Can you ever forgive me for being so selfish? No."
     },
     {
      "word": "blame",
      "pos": "v.",
      "enDef": "to say or think that a person or thing is responsible for something bad that has happened",
      "sent": "Don't blame me. You are responsible for your own problems."
     },
     {
      "word": "text message",
      "pos": "n.",
      "enDef": "a short message that is sent electronically to a cell phone or other device",
      "sent": "She sent me a text message saying that she'll be late."
     }
    ],
    "quiz": [
     {
      "q": "They made fun of the way he talked. — Choose the answer that is closest in meaning to 'made fun of'.",
      "type": "choice",
      "options": [
       "make a joke about",
       "learn",
       "stop"
      ],
      "answer": "make a joke about",
      "why": "Unit 1 Word List: make fun of = to make a joke about (someone or something) usually in a mean way."
     },
     {
      "q": "I was so upset with him, so I didn't call him for two weeks. — 'upset' is closest in meaning to:",
      "type": "choice",
      "options": [
       "pleased",
       "angry",
       "useless"
      ],
      "answer": "angry",
      "why": "Unit 1 Word List: upset (adj.) = angry or unhappy."
     },
     {
      "q": "We truly apologize for the mistake. — 'apologize' means:",
      "type": "choice",
      "options": [
       "say sorry",
       "thank",
       "unhappy"
      ],
      "answer": "say sorry",
      "why": "Unit 1 Word List: apologize (v.) = to give or make an apology."
     },
     {
      "q": "Can you ever forgive me for being so selfish? — 'forgive' is closest to:",
      "type": "choice",
      "options": [
       "qualify",
       "mention",
       "excuse"
      ],
      "answer": "excuse",
      "why": "Unit 1 Word List: forgive (v.) = to stop feeling anger toward someone who has done something wrong."
     },
     {
      "q": "He brought a chocolate pie ____ me. (Fill in the correct preposition.)",
      "type": "fill",
      "options": [],
      "answer": "for",
      "why": "Language Skills (Student Book p12): after bring / buy / make, the indirect object takes 'for' when the direct object comes first."
     }
    ],
    "guided": {
     "prompt": "Write a social media post about a fight with a friend. Tell what happened, how you felt, and what you will do next.",
     "checklist": [
      "Introduction: say what happened and invite the reader in",
      "Body / Details: give what usually happens, what happened, and how people felt, in order",
      "Conclusion: say what you miss or regret and what you will do"
     ],
     "minWords": 60
    }
   },
   {
    "id": "L1-U2",
    "title": "The Best Gift Ever",
    "genre": "narrative",
    "sample": {
     "title": "The Best Gift Ever",
     "paras": [
      {
       "role": "intro",
       "text": "When I was 10, I got a bike for my birthday from my uncle. It was the best gift ever for two main reasons."
      },
      {
       "role": "body",
       "text": "First, my bike was the coolest bike ever. It was my favorite color and had a lot of really cool features, like front and back lights, gears, and a horn. All of my friends were jealous of my new bike. Second, I was able to move around easier and faster. I didn't have to walk everywhere, I could just ride my bike. When I got my bike, I rode it everywhere: to my friends' houses, to school, and everywhere around town. When I went to the shopping mall with my friends, I always rode my bike. I was always the first one at the shopping mall."
      },
      {
       "role": "conclusion",
       "text": "My bike was really cool-looking and helps me go everywhere around town. For these reasons, it was the best gift ever!"
      }
     ]
    },
    "wordList": [
     {
      "word": "grateful",
      "pos": "adj.",
      "enDef": "feeling or showing thanks",
      "sent": "I'm grateful to you for your help."
     },
     {
      "word": "jealous",
      "pos": "adj.",
      "enDef": "feeling or showing jealousy",
      "sent": "He feels jealous of his rich friends."
     },
     {
      "word": "feature",
      "pos": "n.",
      "enDef": "an interesting or important quality",
      "sent": "His plan combines the best features of both proposals."
     },
     {
      "word": "design",
      "pos": "n.",
      "enDef": "the way something has been made",
      "sent": "I like the design of the textbook."
     },
     {
      "word": "graduate",
      "pos": "v.",
      "enDef": "to earn a degree or diploma from a school",
      "sent": "He graduated from university last June."
     },
     {
      "word": "celebrate",
      "pos": "v.",
      "enDef": "to do something special for an important event",
      "sent": "We are celebrating my birthday by going out to dinner."
     }
    ],
    "quiz": [
     {
      "q": "Thanks for coming with me. I'm really grateful. — 'grateful' is closest in meaning to:",
      "type": "choice",
      "options": [
       "excited",
       "thankful",
       "wonderful"
      ],
      "answer": "thankful",
      "why": "Unit 2 Word List: grateful (adj.) = feeling or showing thanks."
     },
     {
      "q": "His success has made some of his old friends jealous. — 'jealous' means:",
      "type": "choice",
      "options": [
       "happy",
       "feeling angry desire",
       "noisy"
      ],
      "answer": "feeling angry desire",
      "why": "Unit 2 Word List: jealous (adj.) = feeling or showing jealousy."
     },
     {
      "q": "We looked at several different designs for the new bridge. — 'designs' is closest to:",
      "type": "choice",
      "options": [
       "drawings",
       "groups",
       "museums"
      ],
      "answer": "drawings",
      "why": "Unit 2 Word List: design (n.) = the way something has been made."
     },
     {
      "q": "He graduated from the university last June. — 'graduated' means:",
      "type": "choice",
      "options": [
       "avoided",
       "quit",
       "earned a degree"
      ],
      "answer": "earned a degree",
      "why": "Unit 2 Word List: graduate (v.) = to earn a degree or diploma from a school."
     },
     {
      "q": "Second, I ____ able to move around easier and faster. (Fill in the correct form of 'be able to'.)",
      "type": "fill",
      "options": [],
      "answer": "was",
      "why": "Language Skills (Student Book p20-21): past narrative with 'when' clauses; 'I was able to...' is the past form of be able to."
     }
    ],
    "guided": {
     "prompt": "Write about the best gift you ever got. Say what it was, when you got it, and why it was so great.",
     "checklist": [
      "Introduction (2 sentences): What gift did you get? When did you get it? Who gave it to you?",
      "Body / Details (6-8 sentences): Why is it so great? Give a reason, give details, then a second reason and its details",
      "Conclusion (1-2 sentences): Restate your feelings about the gift and why you like it so much"
     ],
     "minWords": 90
    }
   },
   {
    "id": "L1-U3",
    "title": "My Favorite Restaurant",
    "genre": "descriptive",
    "sample": {
     "title": "My Favorite Restaurant",
     "paras": [
      {
       "role": "intro",
       "text": "My favorite restaurant is the Thai restaurant that is in Market Square. It has really delicious food and amazing staff."
      },
      {
       "role": "body",
       "text": "The restaurant is tiny, so you must make a reservation. It's always busy, but the staff never seem tired. I always get the green curry that is made with coconut milk and basil, and my mom gets the fried fish. When I first went there, I found the food very spicy. But now, I always ask them to add more chili powder! There is a delicious dessert that we get every time. It's fried bananas with vanilla ice cream. Every time we go there, they give us a large scoop of ice cream. When we went there last time, they gave us an enormous scoop! We were so full afterward that we decided to walk home."
      },
      {
       "role": "conclusion",
       "text": "It's my favorite restaurant in the whole world. We went there just last week, yet I'm already thinking of my next visit!"
      }
     ]
    },
    "wordList": [
     {
      "word": "tiny",
      "pos": "adj.",
      "enDef": "extremely small",
      "sent": "He's from a tiny town that you've probably never heard of."
     },
     {
      "word": "vegetarian",
      "pos": "adj.",
      "enDef": "not eating or including meat",
      "sent": "The veggie burgers at the vegetarian restaurant are very famous."
     },
     {
      "word": "casual",
      "pos": "adj.",
      "enDef": "not formal; relaxed in style or manner",
      "sent": "The atmosphere at the meeting was quite casual."
     },
     {
      "word": "full",
      "pos": "adj.",
      "enDef": "not wanting to eat anymore because you have eaten a lot",
      "sent": "No more cake for me, thanks, I'm full."
     },
     {
      "word": "service",
      "pos": "n.",
      "enDef": "the act of helping or serving customers at a restaurant, hotel, store, etc.",
      "sent": "The food was good but the service was terribly slow."
     },
     {
      "word": "creative",
      "pos": "adj.",
      "enDef": "having or using ability to make or think of new ideas",
      "sent": "She has one of the most creative minds in the business."
     }
    ],
    "quiz": [
     {
      "q": "No dessert for me, thank you. I'm full. — 'full' means:",
      "type": "choice",
      "options": [
       "eaten a lot",
       "thirsty",
       "empty"
      ],
      "answer": "eaten a lot",
      "why": "Unit 3 Word List: full (adj.) = not wanting to eat anymore because you have eaten a lot."
     },
     {
      "q": "The floor was covered in tiny bits of paper. — 'tiny' is closest to:",
      "type": "choice",
      "options": [
       "dirty",
       "very clean",
       "very small"
      ],
      "answer": "very small",
      "why": "Unit 3 Word List: tiny (adj.) = extremely small."
     },
     {
      "q": "I would like to buy a vegetarian cookbook. — 'vegetarian' means:",
      "type": "choice",
      "options": [
       "healthy",
       "not including meat",
       "cooking"
      ],
      "answer": "not including meat",
      "why": "Unit 3 Word List: vegetarian (adj.) = not eating or including meat."
     },
     {
      "q": "The food was good but the service was terribly slow. — 'service' is closest to:",
      "type": "choice",
      "options": [
       "act of serving",
       "taking away",
       "complaint"
      ],
      "answer": "act of serving",
      "why": "Unit 3 Word List: service (n.) = the act of helping or serving customers at a restaurant, hotel, store, etc."
     },
     {
      "q": "I always get the green curry that is ____ coconut milk and basil. (Fill in the correct phrase.)",
      "type": "fill",
      "options": [],
      "answer": "made with",
      "why": "Unit 3 Language Skills: relative pronoun 'that' + passive description; phrase list gives 'make with' → 'made with'."
     }
    ],
    "guided": {
     "prompt": "Write about your favorite restaurant. Say what it is, where it is, and two things you like about it.",
     "checklist": [
      "Introduction (2 sentences): What is your favorite restaurant? Where is it? What are two things you like about it? (start with a hook)",
      "Body / Details (6-8 sentences): Describe the restaurant (staff, popularity, atmosphere), then describe the food, then other special details",
      "Conclusion (2 sentences): Give a final thought about this restaurant"
     ],
     "minWords": 90
    }
   },
   {
    "id": "L1-U4",
    "title": "My Country's Traditional Food",
    "genre": "descriptive",
    "sample": {
     "title": "My Country's Traditional Food",
     "paras": [
      {
       "role": "intro",
       "text": "I'd like to tell you about a traditional food from my country. They're called Yorkshire puddings, and they're delicious!"
      },
      {
       "role": "body",
       "text": "Yorkshire puddings are a food from England. They are very fluffy and are made from batter, like pancakes, but they're cooked in an oven instead of a frying pan. You need milk, flour, eggs, and a pinch of salt to make them. Since they're called a “pudding,” they might sound like a dessert, but they aren't. They are usually served with roasted meat and vegetables. They're traditionally eaten with roast beef, but you can eat them with anything you like! We usually have lots of leftovers, and I love eating them cold for breakfast with strawberry jam on top! I could eat Yorkshire puddings for every meal!"
      },
      {
       "role": "conclusion",
       "text": "Yorkshire puddings are also called “Yorkshires” or “Yorkies.” They're popular all over England. Next time you feel hungry, why don't you try making them?"
      }
     ]
    },
    "wordList": [
     {
      "word": "wrap",
      "pos": "v.",
      "enDef": "to cover with paper or other material",
      "sent": "They were wrapped presents for their kids."
     },
     {
      "word": "steam",
      "pos": "v.",
      "enDef": "to cook food using steam",
      "sent": "She steamed carrots to eat with the steak."
     },
     {
      "word": "common",
      "pos": "adj.",
      "enDef": "found frequently in many places or among many people",
      "sent": "Money worries are a common problem for people raising children."
     },
     {
      "word": "topping",
      "pos": "n.",
      "enDef": "a food that is added to the top of another food",
      "sent": "What toppings do you want on the pizza?"
     },
     {
      "word": "filling",
      "pos": "n.",
      "enDef": "a food mixture that is used to fill something",
      "sent": "I want pies with sweet or savory fillings."
     },
     {
      "word": "serve",
      "pos": "v.",
      "enDef": "to provide food or drinks",
      "sent": "Soup was served as the first course."
     }
    ],
    "quiz": [
     {
      "q": "There are some individually wrapped chocolates. — 'wrapped' means:",
      "type": "choice",
      "options": [
       "cover with",
       "gift",
       "shape"
      ],
      "answer": "cover with",
      "why": "Unit 4 Word List: wrap (v.) = to cover with paper or other material."
     },
     {
      "q": "Try some steamed vegetables. — 'steamed' means:",
      "type": "choice",
      "options": [
       "chopped",
       "crushed",
       "cooked in steam"
      ],
      "answer": "cooked in steam",
      "why": "Unit 4 Word List: steam (v.) = to cook food using steam."
     },
     {
      "q": "“Smith” is a very common name in Britain. — 'common' is closest to:",
      "type": "choice",
      "options": [
       "rare",
       "not rare",
       "same"
      ],
      "answer": "not rare",
      "why": "Unit 4 Word List: common (adj.) = found frequently in many places or among many people."
     },
     {
      "q": "Soup was served as the first course. — 'served' means:",
      "type": "choice",
      "options": [
       "provided",
       "eaten",
       "directed"
      ],
      "answer": "provided",
      "why": "Unit 4 Word List: serve (v.) = to provide food or drinks."
     },
     {
      "q": "They are usually ____ with roasted meat and vegetables. (Fill in the correct passive form of 'serve'.)",
      "type": "fill",
      "options": [],
      "answer": "served",
      "why": "Language Skills (Student Book p42-43): simple passive tense — be + past participle; 'They are usually served with…'."
     }
    ],
    "guided": {
     "prompt": "Write about a traditional food from your country. Say which country it is from, describe the food, and say how or when people eat it.",
     "checklist": [
      "Introduction: say what the food is called and that it's delicious",
      "Body / Details: which country → describe the food (ingredients, how it's made) → how / when eaten",
      "Conclusion: give its other names or popularity, and invite the reader to try making it"
     ],
     "minWords": 90
    }
   },
   {
    "id": "L1-U5",
    "title": "My Favorite Game",
    "genre": "expository",
    "sample": {
     "title": "My Favorite Game",
     "paras": [
      {
       "role": "intro",
       "text": "Do you know Shade of Shadows? It's my favorite video game of all time, and you will definitely agree after I tell you about it."
      },
      {
       "role": "body",
       "text": "It's a role-playing game which is set in an amazing fantasy world. The graphics are very realistic, the story is beautifully written, and it is very easy to play. I wonder how they made such a great game. The story is about a boy named Darius who must save the planet. The story seems very simple, but it is very complex. And because the game looks so real, I keep forgetting that it's a game. It is like watching a very long movie. At first, I was afraid that this game would be too difficult for me, but it is very easy to play."
      },
      {
       "role": "conclusion",
       "text": "Shade of Shadows is a game for everyone. I don't know why it isn't more popular. It has a great story, great graphics, and is easy to play."
      }
     ]
    },
    "wordList": [
     {
      "word": "detail",
      "pos": "n.",
      "enDef": "information about someone or something",
      "sent": "A police officer wrote down the details of what happened."
     },
     {
      "word": "fantasy",
      "pos": "n.",
      "enDef": "an imaginary world; a book, movie, etc., that tells a story about things that happen in an imaginary world",
      "sent": "I spent my summer reading fantasy books."
     },
     {
      "word": "mobile game",
      "pos": "n.",
      "enDef": "a game played on mobile phones",
      "sent": "He enjoys playing mobile games."
     },
     {
      "word": "role-play",
      "pos": "n.",
      "enDef": "an activity in which you pretend to be someone else",
      "sent": "We do a lot of role-playing in this class."
     },
     {
      "word": "graphics",
      "pos": "n.",
      "enDef": "pictures or images on the screen of a computer, television, etc.",
      "sent": "These computer games rely on 3-D graphics."
     },
     {
      "word": "online",
      "pos": "adv.",
      "enDef": "bought, used, etc. using the internet",
      "sent": "Do you like to shop online?"
     }
    ],
    "quiz": [
     {
      "q": "The novel is full of historical details. — 'details' is closest to:",
      "type": "choice",
      "options": [
       "summary",
       "information",
       "memos"
      ],
      "answer": "information",
      "why": "Unit 5 Word List: detail (n.) = information about someone or something."
     },
     {
      "q": "He can hardly tell the difference between fantasy and reality. — 'fantasy' is closest to:",
      "type": "choice",
      "options": [
       "imagination",
       "nonfiction",
       "autobiography"
      ],
      "answer": "imagination",
      "why": "Unit 5 Word List: fantasy (n.) = a book, movie, etc., that tells a story about things that happen in an imaginary world."
     },
     {
      "q": "He enjoys playing mobile games. — 'mobile games' are:",
      "type": "choice",
      "options": [
       "card games",
       "board games",
       "cell phone games"
      ],
      "answer": "cell phone games",
      "why": "Unit 5 Word List: mobile game (n.) = a game played on mobile phones."
     },
     {
      "q": "Let's take a look at the graphics of that video. — 'graphics' means:",
      "type": "choice",
      "options": [
       "images",
       "emotion",
       "explanations"
      ],
      "answer": "images",
      "why": "Unit 5 Word List: graphics (n.) = pictures or images on the screen of a computer, television, etc."
     },
     {
      "q": "It's a role-playing game which ____ an amazing fantasy world. (Fill in the correct phrase.)",
      "type": "fill",
      "options": [],
      "answer": "is set in",
      "why": "Unit 5 Language Skills: phrase 'be set in' (a story happens in a place/time); with 'which' → 'which is set in…'."
     }
    ],
    "guided": {
     "prompt": "Write about your favorite game. Say what type of game it is and how you feel when playing it.",
     "checklist": [
      "Introduction: hook the reader with a question and name your favorite game",
      "Body / Details: what type of game it is (graphics, story) → your feeling when playing",
      "Conclusion: restate why it's great and who it is for"
     ],
     "minWords": 90
    }
   },
   {
    "id": "L1-U6",
    "title": "How to Play a Video Game",
    "genre": "expository",
    "sample": {
     "title": "How to Play a Video Game",
     "paras": [
      {
       "role": "intro",
       "text": "If you're looking for an easy game to play, you should try Building Paradise. It's a fun, online simulation game that you can play with friends."
      },
      {
       "role": "body",
       "text": "Players start on a desert island. The point of the game is to build the most popular hotel on this island. In level 1, you can only build a small hotel with a couple of features. But at level 6, you can build bigger and better things. If your hotel becomes popular, celebrities may visit it. When your hotel makes enough money, you can move on to the next level. There are 12 main levels, and if you complete them all, you'll unlock a secret 13th level. I wonder what the 13th level is like."
      },
      {
       "role": "conclusion",
       "text": "This game is a lot of fun. If you're looking for a game that is not too challenging but a lot of fun, Building Paradise is the perfect choice."
      }
     ]
    },
    "wordList": [
     {
      "word": "enemy",
      "pos": "n.",
      "enDef": "someone who hates another person and tries to attack them or stop them from doing something",
      "sent": "Max stole Lee's homework, and they've been enemies ever since."
     },
     {
      "word": "value",
      "pos": "n.",
      "enDef": "the importance or worth of something",
      "sent": "What is the value of the prize?"
     },
     {
      "word": "challenging",
      "pos": "adj.",
      "enDef": "difficult, in a way that tests your ability or determination",
      "sent": "It's a challenging book that requires careful reading."
     },
     {
      "word": "unlock",
      "pos": "v.",
      "enDef": "to open something",
      "sent": "Can you unlock the door for me?"
     },
     {
      "word": "final",
      "pos": "adj.",
      "enDef": "happening at the end of a process",
      "sent": "The other team scored twice in the final minute."
     },
     {
      "word": "guess",
      "pos": "v.",
      "enDef": "to give the correct answer or make the correct judgment",
      "sent": "I didn't know the answer, so I had to guess."
     }
    ],
    "quiz": [
     {
      "q": "He's made a few enemies in his school. — 'enemies' is closest to:",
      "type": "choice",
      "options": [
       "fans",
       "strangers",
       "haters"
      ],
      "answer": "haters",
      "why": "Unit 6 Word List: enemy (n.) = someone who hates another person and tries to attack them or stop them from doing something."
     },
     {
      "q": "It's a challenging book that requires careful reading. — 'challenging' means:",
      "type": "choice",
      "options": [
       "different",
       "difficult",
       "diverse"
      ],
      "answer": "difficult",
      "why": "Unit 6 Word List: challenging (adj.) = difficult, in a way that tests your ability or determination."
     },
     {
      "q": "Could you unlock the door for me? — 'unlock' means:",
      "type": "choice",
      "options": [
       "unlike",
       "close",
       "open"
      ],
      "answer": "open",
      "why": "Unit 6 Word List: unlock (v.) = to open something."
     },
     {
      "q": "They won their final four games. — 'final' is closest to:",
      "type": "choice",
      "options": [
       "last",
       "fierce",
       "favorite"
      ],
      "answer": "last",
      "why": "Unit 6 Word List: final (adj.) = happening at the end of a process."
     },
     {
      "q": "When your hotel makes enough money, you can ____ to the next level. (Fill in the correct phrase.)",
      "type": "fill",
      "options": [],
      "answer": "move on",
      "why": "Unit 6 Language Skills: if/when clauses + phrase list; 'move on to the next level' from the model essay."
     }
    ],
    "guided": {
     "prompt": "Explain how to play your favorite video game so a friend could start playing it.",
     "checklist": [
      "Introduction: recommend the game and say what kind of game it is",
      "Body / Details: how the game starts and its point → levels and how to move on to higher levels",
      "Conclusion: say who the game is for and why it's worth playing"
     ],
     "minWords": 90
    }
   },
   {
    "id": "L1-U7",
    "title": "A Complaint Letter",
    "genre": "letter",
    "sample": {
     "title": "A Complaint Letter",
     "paras": [
      {
       "role": "intro",
       "text": "Dear Ms. Harris, My name is Emma Sinclair, and I'm a 6th year student. I am writing to tell you about a problem in the cafeteria. I'm hoping you can fix this."
      },
      {
       "role": "body",
       "text": "These days, the quality of the cafeteria food has gone down. At the beginning of the school year, the food was really good. But over the last few months, the quality has dropped. There are few healthy options to eat these days, and the vegetables which are sometimes served aren't very fresh. Also, the meat smells weird. Someone has even found a piece of plastic on some cheese in their sandwich! Nowadays, many students go to convenience stores before school to buy food for lunch. But their meals aren't very healthy either. I would be grateful if you could provide something fresh and healthy."
      },
      {
       "role": "conclusion",
       "text": "I know you're busy, but please consider my complaint. I look forward to seeing changes to the lunch menu hopefully soon. Thank you for listening. Yours sincerely, Emma Sinclair"
      }
     ]
    },
    "wordList": [
     {
      "word": "provide",
      "pos": "v.",
      "enDef": "to give someone something that they need",
      "sent": "The school provides new uniforms for the band."
     },
     {
      "word": "suffer",
      "pos": "v.",
      "enDef": "to experience something bad",
      "sent": "Do you suffer from any allergies?"
     },
     {
      "word": "stress",
      "pos": "n.",
      "enDef": "something that causes strong feelings of worry or anxiety",
      "sent": "I've been under a lot of stress at school lately."
     },
     {
      "word": "suggestion",
      "pos": "n.",
      "enDef": "an idea, possible plan, or action that is mentioned for other people to consider",
      "sent": "Please send comments and suggestions to our post office box."
     },
     {
      "word": "urgent",
      "pos": "adj.",
      "enDef": "very important and needing attention immediately",
      "sent": "We've come to deliver an urgent message."
     },
     {
      "word": "request",
      "pos": "v.",
      "enDef": "to ask for something politely or officially",
      "sent": "Visitors are requested not to walk on the grass."
     }
    ],
    "quiz": [
     {
      "q": "The curtains on the windows provide privacy. — 'provide' means:",
      "type": "choice",
      "options": [
       "offer",
       "block",
       "prevent"
      ],
      "answer": "offer",
      "why": "Unit 7 Word List: provide (v.) = to give someone something that they need."
     },
     {
      "q": "She suffered an injury during the game. — 'suffered' is closest to:",
      "type": "choice",
      "options": [
       "got",
       "succeeded",
       "viewed"
      ],
      "answer": "got",
      "why": "Unit 7 Word List: suffer (v.) = to experience something bad."
     },
     {
      "q": "People under a lot of stress may experience headaches. — 'stress' means:",
      "type": "choice",
      "options": [
       "relief",
       "anxiety",
       "relaxation"
      ],
      "answer": "anxiety",
      "why": "Unit 7 Word List: stress (n.) = something that causes strong feelings of worry or anxiety."
     },
     {
      "q": "We've come to deliver an urgent message. — 'urgent' is closest to:",
      "type": "choice",
      "options": [
       "useless",
       "delayed",
       "important"
      ],
      "answer": "important",
      "why": "Unit 7 Word List: urgent (adj.) = very important and needing attention immediately."
     },
     {
      "q": "I would be ____ if you could provide something fresh and healthy. (Fill in the correct phrase.)",
      "type": "fill",
      "options": [],
      "answer": "grateful",
      "why": "Unit 7 Language Skills: polite request phrase 'I would be grateful if you could…' from the model letter."
     }
    ],
    "guided": {
     "prompt": "Write a complaint letter about a problem at your school (for example, the cafeteria, the library, or the playground).",
     "checklist": [
      "Introduction: greeting, say who you are and why you are writing; say what you are hoping for",
      "Body / Details: state the complaint → give details of the problem → its effect on people → make a request or suggestion",
      "Conclusion: ask them to consider your complaint, say you look forward to changes, and thank the reader; end with 'Yours sincerely' + your name"
     ],
     "minWords": 90
    }
   },
   {
    "id": "L1-U8",
    "title": "A Thank You Letter",
    "genre": "letter",
    "sample": {
     "title": "A Thank You Letter",
     "paras": [
      {
       "role": "intro",
       "text": "Dear Mrs. Webster, I'm writing to you to say thank you for being such a great teacher."
      },
      {
       "role": "body",
       "text": "Before I took your class, I didn't like math at all. I found it too challenging, and I was frustrated with my lack of progress. I also found it very boring. Your classes, however, helped me understand numbers better and taught me that math can be fun! I sincerely appreciate your help. You took the extra time to sit with me and explain things that didn't make sense. I also appreciate your patience. You didn't get frustrated with me when I didn't understand something. And I'll always remember my times tables thanks to your funny song!"
      },
      {
       "role": "conclusion",
       "text": "Thank you so much for everything which you have done for me and for our whole class. I will miss your class a lot next year. I hope my next math teacher is as nice as you. Yours sincerely, Michael Tracey"
      }
     ]
    },
    "wordList": [
     {
      "word": "take the time",
      "pos": "phr.",
      "enDef": "to spend the time to do something for another person",
      "sent": "She didn't even take the time to wish me good morning."
     },
     {
      "word": "frustrated",
      "pos": "adj.",
      "enDef": "feeling annoyed or discouraged because you cannot achieve what you want",
      "sent": "By the end of the day, we were all feeling very tired and frustrated."
     },
     {
      "word": "confident",
      "pos": "adj.",
      "enDef": "having a feeling or belief that you can do something well or succeed at something",
      "sent": "I am confident about my ability to do the job."
     },
     {
      "word": "appreciate",
      "pos": "v.",
      "enDef": "to be grateful for (something)",
      "sent": "We really appreciate all the help you gave us last weekend."
     },
     {
      "word": "waste of time",
      "pos": "n.",
      "enDef": "a bad use of time",
      "sent": "The lecture was a waste of time."
     },
     {
      "word": "valuable",
      "pos": "adj.",
      "enDef": "important, very useful, or beneficial",
      "sent": "A lot of valuable information can be found in this book."
     }
    ],
    "quiz": [
     {
      "q": "She didn't even take the time to wish me good morning. — 'take the time' means:",
      "type": "choice",
      "options": [
       "save the time",
       "attempt",
       "spend time"
      ],
      "answer": "spend time",
      "why": "Unit 8 Word List: take the time (phr.) = to spend the time to do something for another person."
     },
     {
      "q": "They were getting pretty frustrated with the delay. — 'frustrated' is closest to:",
      "type": "choice",
      "options": [
       "annoyed",
       "fulfilled",
       "satisfied"
      ],
      "answer": "annoyed",
      "why": "Unit 8 Word List: frustrated (adj.) = feeling annoyed or discouraged because you cannot achieve what you want."
     },
     {
      "q": "The class made me more confident about myself. — 'confident' means:",
      "type": "choice",
      "options": [
       "certain",
       "in doubt",
       "without a plan"
      ],
      "answer": "certain",
      "why": "Unit 8 Word List: confident (adj.) = having a feeling or belief that you can do something well or succeed at something."
     },
     {
      "q": "I really appreciate the information you gave me. — 'appreciate' is closest to:",
      "type": "choice",
      "options": [
       "blame",
       "thank",
       "care about"
      ],
      "answer": "thank",
      "why": "Unit 8 Word List: appreciate (v.) = to be grateful for (something)."
     },
     {
      "q": "I hope my next math teacher is ____ you. (Fill in the correct phrase.)",
      "type": "fill",
      "options": [],
      "answer": "as nice as",
      "why": "Unit 8 Language Skills: comparisons with 'as … as'; phrase list gives 'as nice as' from the model letter's closing."
     }
    ],
    "guided": {
     "prompt": "Write a thank-you letter to someone who helped you recently (a teacher, a coach, a neighbor, or a family member).",
     "checklist": [
      "Introduction: greeting and say why you are writing — 'I'm writing to say thank you for…'",
      "Body / Details: what things were like before → how the person was helpful → a special memory you have",
      "Conclusion: thank them for everything, say what you will miss, and end with 'Yours sincerely' + your name"
     ],
     "minWords": 90
    }
   }
  ]
 },
 "L3": {
  "units": [
   {
    "id": "L3-U1",
    "title": "Do Celebrities Make Too Much Money?",
    "genre": "persuasive",
    "sample": {
     "title": "Do Celebrities Make Too Much Money?",
     "paras": [
      {
       "role": "intro",
       "text": "It is often said that professional athletes make too much money. I do agree that they make a lot of money. However, I disagree that they make too much money."
      },
      {
       "role": "body",
       "text": "First, professional athletes have a very short career length. The average career length of a professional athlete is only three years, or sometimes 10 years if they are lucky. After that, they must retire. This is why over 60 percent of athletes go bankrupt within five years of retirement. However, the average career length of an office worker is about 30 years. This is much longer than any athlete's career."
      },
      {
       "role": "body",
       "text": "Playing sports is also very dangerous. An athlete may get hurt during any game they play. The risk is even higher for top-level athletes. And if an athlete is badly injured, they might have to retire early. Yet a regular office worker or store clerk can and often do work while injured. They can also go back to work after an injury. This is not always true for athletes."
      },
      {
       "role": "body",
       "text": "Lastly, athletes do more than just play sports. They give speeches, do volunteer work in local communities, and more. And when they are not working, since they are celebrities, they usually take pictures and sign autographs for fans. Celebrities work 24/7 and also give up their privacy. But a regular worker doesn't deal with this kind of attention."
      },
      {
       "role": "conclusion",
       "text": "I agree that professional athletes make a lot of money. But their job is often dangerous, their career is short, and they do more than just play sports. So, overall, I disagree that professional athletes make too much money."
      }
     ]
    },
    "wordList": [
     {
      "word": "fortune",
      "pos": "n.",
      "enDef": "a large amount of money, goods, property, etc.",
      "sent": "Their house is worth a fortune."
     },
     {
      "word": "well paid",
      "pos": "phr.",
      "enDef": "earning or paying a lot of money",
      "sent": "She was not well paid and found it difficult to provide for her family."
     },
     {
      "word": "retire",
      "pos": "v.",
      "enDef": "to leave job or stop working due to old age or ill health",
      "sent": "I want to be healthy when I retire."
     },
     {
      "word": "privacy",
      "pos": "n.",
      "enDef": "the state of being alone",
      "sent": "She went upstairs for some privacy."
     },
     {
      "word": "sponsor",
      "pos": "n.",
      "enDef": "a person or company that supports a person, organization, or activity by giving money",
      "sent": "Our company is a sponsor of the race."
     }
    ],
    "quiz": [
     {
      "q": "He had made a fortune from mining. — 'a fortune' means:",
      "type": "choice",
      "options": [
       "ways of path",
       "story teller",
       "a lot of money"
      ],
      "answer": "a lot of money",
      "why": "Unit 1 Word List: fortune (n.) = a large amount of money, goods, property, etc."
     },
     {
      "q": "He found a well-paid job that interested him. — 'well-paid' means:",
      "type": "choice",
      "options": [
       "earning lots",
       "well-known",
       "payment"
      ],
      "answer": "earning lots",
      "why": "Unit 1 Word List: well paid (phr.) = earning or paying a lot of money."
     },
     {
      "q": "She plans to retire from her job in two years. — 'retire' is closest to:",
      "type": "choice",
      "options": [
       "restart",
       "quit",
       "very tired"
      ],
      "answer": "quit",
      "why": "Unit 1 Word List: retire (v.) = to leave job or stop working due to old age or ill health."
     },
     {
      "q": "She went upstairs for some privacy. — 'privacy' means:",
      "type": "choice",
      "options": [
       "being alone",
       "groups",
       "party"
      ],
      "answer": "being alone",
      "why": "Unit 1 Word List: privacy (n.) = the state of being alone."
     },
     {
      "q": "Our company is a ____ of the race. (Fill in the Word List word.)",
      "type": "fill",
      "options": [],
      "answer": "sponsor",
      "why": "Unit 1 Word List: sponsor (n.) = a person or company that supports an activity by giving money."
     }
    ],
    "guided": {
     "prompt": "Do you think professional athletes or celebrities make too much money? Write a persuasive essay with your opinion.",
     "checklist": [
      "Introduction: state a clear opinion (I agree / I disagree) after acknowledging the other side",
      "Body: give 2-3 reasons, each starting with First / Second (also) / Lastly, with facts or examples as details; compare with a regular worker",
      "Conclusion: restate your opinion and summarize your reasons ('So, overall, …')"
     ],
     "minWords": 120
    }
   },
   {
    "id": "L3-U2",
    "title": "If I Won the Lottery…",
    "genre": "narrative",
    "sample": {
     "title": "If I Won the Lottery…",
     "paras": [
      {
       "role": "intro",
       "text": "Many people play the lottery each day, hoping to win a large jackpot that will change their life. If I won the lottery, I would do so many things that I couldn't do before. One of those things is pay back those who've helped me."
      },
      {
       "role": "body",
       "text": "If I won the lottery, the first thing I would do is go on a trip around the world with my family. My family doesn't have a lot of money, so we've never been on a big vacation together. I would take them all around the world to see famous landmarks and enjoy local food. I want to take them shopping in every country!"
      },
      {
       "role": "body",
       "text": "After that, if I still had money left after our big trip, I would buy houses for my parents and family members. They would have swimming pools, an outdoor basketball court, and a room just for playing video games and watching movies while eating popcorn! We live in a small apartment now, and my parents work very hard for my sisters and me. They deserve to have their dream house."
      },
      {
       "role": "body",
       "text": "I want to help children in need in local community, so I would donate the money to several children's hospitals, middle and high schools, and youth groups. I would then give money to charity. I think it's important that people give back to those that help them, so that is what I would do."
      },
      {
       "role": "conclusion",
       "text": "I think it's important that people give back to those that help them, so that is what I would do."
      }
     ]
    },
    "wordList": [
     {
      "word": "lottery",
      "pos": "n.",
      "enDef": "a game in which many tickets are sold and a few of the tickets are chosen by chance to win prizes",
      "sent": "Paul had a dream that he won the lottery."
     },
     {
      "word": "valuable",
      "pos": "adj.",
      "enDef": "worth a lot of money",
      "sent": "These antiques are extremely valuable."
     },
     {
      "word": "purchase",
      "pos": "v.",
      "enDef": "to buy something",
      "sent": "You can purchase souvenirs at the gift shop."
     },
     {
      "word": "pay back",
      "pos": "phr.",
      "enDef": "to pay someone the money that you owe them",
      "sent": "He still hasn't paid back that money he owes me."
     },
     {
      "word": "donate",
      "pos": "v.",
      "enDef": "to give something to help a person or organization",
      "sent": "We donate our old clothes to charity."
     },
     {
      "word": "investment",
      "pos": "n.",
      "enDef": "the act of using money to earn more money",
      "sent": "I wonder if buying a bike is a good investment."
     }
    ],
    "quiz": [
     {
      "q": "She won a million pounds in the lottery. — 'in the lottery' relates to:",
      "type": "choice",
      "options": [
       "lullaby",
       "parking lot",
       "jackpot"
      ],
      "answer": "jackpot",
      "why": "Unit 2 Word List: lottery (n.) = a game in which many tickets are sold and a few of the tickets are chosen by chance to win prizes."
     },
     {
      "q": "The watch is extremely valuable. — 'valuable' means:",
      "type": "choice",
      "options": [
       "worthy",
       "waste",
       "common"
      ],
      "answer": "worthy",
      "why": "Unit 2 Word List: valuable (adj.) = worth a lot of money."
     },
     {
      "q": "He purchased a new suit for a hundred dollars. — 'purchased' means:",
      "type": "choice",
      "options": [
       "to buy",
       "to store",
       "to please"
      ],
      "answer": "to buy",
      "why": "Unit 2 Word List: purchase (v.) = to buy something."
     },
     {
      "q": "I'll be able to pay you back next week. — 'pay back' is closest to:",
      "type": "choice",
      "options": [
       "give back",
       "get away",
       "done with"
      ],
      "answer": "give back",
      "why": "Unit 2 Word List: pay back (phr.) = to pay someone the money that you owe them."
     },
     {
      "q": "If I ____ the lottery, I would buy an amusement park. (Second conditional: if + ____ past)",
      "type": "fill",
      "options": [],
      "answer": "won",
      "why": "Language Skills (Student Book p21): second conditional for imaginary situations — if + simple past, would + infinitive."
     }
    ],
    "guided": {
     "prompt": "What would you do if you won the lottery? Write about your plans.",
     "checklist": [
      "Introduction (1-2 sentences): What would you do if you won the lottery? Give a general idea of your plan",
      "Body (6-8 sentences): What would you do with the money? Write your plans in detail (use second conditional: If I won…, I would…)",
      "Conclusion (2 sentences): Restate what you would do with the money and why"
     ],
     "minWords": 100
    }
   },
   {
    "id": "L3-U3",
    "title": "Should We Wear Uniforms?",
    "genre": "persuasive",
    "sample": {
     "title": "Should We Wear Uniforms?",
     "paras": [
      {
       "role": "intro",
       "text": "There are arguments for and against making children wear school uniforms. Overall, I think they are a good idea for a number of reasons."
      },
      {
       "role": "body",
       "text": "When I was in elementary school, we had to wear a uniform. The best thing about school uniforms is that you don't need to think about what to wear every day. At my middle school, we don't have to wear uniforms, so we are free to wear whatever we like. This can be stressful, as students always want to look cool. If you wear a T-shirt that someone doesn't like, or that is out of fashion, people might make fun of you."
      },
      {
       "role": "body",
       "text": "School uniforms also mean that people are more equal. Whether you are from a wealthy or poor family, everyone wears the same thing. No one can walk around in world-famous designer brands or make poorer students feel bad about their clothes. Everyone dresses the same and is treated the same way. Of course, this doesn't mean that bullying doesn't happen, but students can't judge others on their clothing."
      },
      {
       "role": "body",
       "text": "However, there are negatives. People say parents save money on clothing through buying uniforms, but this isn't true. Parents must now buy regular clothing and uniforms. This means more money spent on clothing. It might be cheaper just to let children wear their own clothes. In addition, some people believe that school uniforms limit a student's self-expression and also make them less creative."
      },
      {
       "role": "conclusion",
       "text": "School uniforms have a number of potential benefits that, in my opinion, outweigh the few downsides. In my opinion, all schools should have uniforms."
      }
     ]
    },
    "wordList": [
     {
      "word": "appearance",
      "pos": "n.",
      "enDef": "the way that someone or something looks",
      "sent": "The general appearance of the house is quite good."
     },
     {
      "word": "potential",
      "pos": "adj.",
      "enDef": "possible when the necessary conditions exist",
      "sent": "Doctors are excited about the new drug's potential benefits."
     },
     {
      "word": "expression",
      "pos": "n.",
      "enDef": "expression of your personality, emotions, or ideas",
      "sent": "He regarded poetry as sentimental self-expression."
     },
     {
      "word": "uniform",
      "pos": "n.",
      "enDef": "a special kind of clothing that is worn by all the members of a group",
      "sent": "I never wear grey because it reminds me of my school uniform."
     },
     {
      "word": "equality",
      "pos": "n.",
      "enDef": "having the same rights",
      "sent": "Countless people have died trying to achieve basic equality for women."
     },
     {
      "word": "bullying",
      "pos": "n.",
      "enDef": "frightening others",
      "sent": "Bullying is a problem in many schools."
     }
    ],
    "quiz": [
     {
      "q": "The general appearance of the house is quite good. — 'appearance' means:",
      "type": "choice",
      "options": [
       "storage",
       "look",
       "history"
      ],
      "answer": "look",
      "why": "Unit 3 Word List: appearance (n.) = the way that someone or something looks."
     },
     {
      "q": "The potential benefits outweigh the problems. — 'potential' is closest to:",
      "type": "choice",
      "options": [
       "possible",
       "popular",
       "imaginary"
      ],
      "answer": "possible",
      "why": "Unit 3 Word List: potential (adj.) = possible when the necessary conditions exist."
     },
     {
      "q": "Countless people have died trying to achieve basic equality for women. — 'equality' means:",
      "type": "choice",
      "options": [
       "having same rights",
       "having fun",
       "election"
      ],
      "answer": "having same rights",
      "why": "Unit 3 Word List: equality (n.) = having the same rights."
     },
     {
      "q": "Bullying is a problem in many schools. — 'bullying' means:",
      "type": "choice",
      "options": [
       "fighting",
       "friendship",
       "frightening others"
      ],
      "answer": "frightening others",
      "why": "Unit 3 Word List: bullying (n.) = frightening others."
     },
     {
      "q": "There are arguments ____ making children wear school uniforms. (Fill in the correct phrase.)",
      "type": "fill",
      "options": [],
      "answer": "for and against",
      "why": "Unit 3 Language Skills: phrase list 'for and against' — the model essay's opening presenting both sides."
     }
    ],
    "guided": {
     "prompt": "Should students wear school uniforms? Write a persuasive essay with your opinion and reasons.",
     "checklist": [
      "Introduction: present both sides (arguments for and against) and state your overall opinion",
      "Body: give your reasons with examples; include the other side ('However, there are negatives…')",
      "Conclusion: say your benefits outweigh the downsides and restate your opinion"
     ],
     "minWords": 120
    }
   },
   {
    "id": "L3-U4",
    "title": "Are E-books or Paper Books Better?",
    "genre": "comparative",
    "sample": {
     "title": "Are E-books or Paper Books Better?",
     "paras": [
      {
       "role": "intro",
       "text": "Everyone has their favorite way of reading a book. Some people prefer traditional paper books to e-books. Others don't. There are plenty of differences between paper books and e-books. Let's take a look at both of them."
      },
      {
       "role": "body",
       "text": "Those who say they would rather read a paper book do enjoy the experience. They like the smell and the feel of a book. They can easily write little notes on the side of the page, and they can bookmark a page by folding the corner a bit. But, there are drawbacks to paper books. Pages can be easily ripped or torn out. They can also be very heavy and hard to carry around. Most people don't carry more than one or two books."
      },
      {
       "role": "body",
       "text": "As for e-books, the most common reason people say they would rather have an e-book than a paper book is that e-books are much more convenient. You can read a book anytime, anywhere. And it is easy to carry with you, as whether you have 50 or 500 books on your e-reader, it won't get heavier! However, not all of it is good. You can lose all of your books if you get some water on the device. They also always need to be charged, so if your device runs out of power, you are out of luck."
      },
      {
       "role": "conclusion",
       "text": "Even though e-books are convenient, paper books do provide a special experience. Yet the best thing is that you don't have to choose one or the other. You can read paper books one day, and e-books another. Happy reading!"
      }
     ]
    },
    "wordList": [
     {
      "word": "glow",
      "pos": "n.",
      "enDef": "a soft and steady light",
      "sent": "We could see the glow of the lamp in the window."
     },
     {
      "word": "pile",
      "pos": "n.",
      "enDef": "a lot of something",
      "sent": "He had a pile of papers on his desk."
     },
     {
      "word": "replace",
      "pos": "v.",
      "enDef": "to be used instead of something",
      "sent": "Will computers ever completely replace books?"
     },
     {
      "word": "carry",
      "pos": "v.",
      "enDef": "to hold something using your hands, arms, or body and take them around with you",
      "sent": "These books are too heavy for me to carry around."
     },
     {
      "word": "device",
      "pos": "n.",
      "enDef": "an object or machine that has been made for some special purpose",
      "sent": "The store sells TVs, VCRs, and other electronic devices."
     },
     {
      "word": "drawback",
      "pos": "n.",
      "enDef": "a disadvantage or the negative part of a situation",
      "sent": "The trip sounds great, but the cost is a major drawback."
     },
     {
      "word": "interactive",
      "pos": "adj.",
      "enDef": "involving communication between people",
      "sent": "Many educational and instructional programs are interactive."
     }
    ],
    "quiz": [
     {
      "q": "We could see the glow of the lamp in the window. — 'glow' means:",
      "type": "choice",
      "options": [
       "glass",
       "heavy wind",
       "soft light"
      ],
      "answer": "soft light",
      "why": "Unit 4 Word List: glow (n.) = a soft and steady light."
     },
     {
      "q": "He had a pile of papers on his desk. — 'a pile of' means:",
      "type": "choice",
      "options": [
       "none",
       "few",
       "many"
      ],
      "answer": "many",
      "why": "Unit 4 Word List: pile (n.) = a lot of something."
     },
     {
      "q": "Will computers ever completely replace books? — 'replace' is closest to:",
      "type": "choice",
      "options": [
       "use instead of",
       "reconsider",
       "utilize"
      ],
      "answer": "use instead of",
      "why": "Unit 4 Word List: replace (v.) = to be used instead of something."
     },
     {
      "q": "Many educational and instructional programs are interactive. — 'interactive' means:",
      "type": "choice",
      "options": [
       "involving people",
       "international",
       "inactive"
      ],
      "answer": "involving people",
      "why": "Unit 4 Word List: interactive (adj.) = involving communication between people."
     },
     {
      "q": "The trip sounds great, but cost is a major drawback. — 'drawback' means:",
      "type": "choice",
      "options": [
       "withdraw",
       "discourage",
       "disadvantage"
      ],
      "answer": "disadvantage",
      "why": "Unit 4 Word List: drawback (n.) = a disadvantage or the negative part of a situation."
     }
    ],
    "guided": {
     "prompt": "Are e-books or paper books better? Compare the two and give your opinion.",
     "checklist": [
      "Introduction: present the two choices and say there are plenty of differences; invite the reader to look at both",
      "Body: describe one side (benefits + drawbacks), then the other side (benefits + drawbacks), using preference phrases (prefer…to / would rather / more convenient)",
      "Conclusion: give a balanced final thought — even though one is convenient, the other offers a special experience"
     ],
     "minWords": 120
    }
   },
   {
    "id": "L3-U5",
    "title": "A Healthy Body Image",
    "genre": "problem-solution",
    "sample": {
     "title": "A Healthy Body Image",
     "paras": [
      {
       "role": "intro",
       "text": "When you look at yourself in the mirror, what do you think? “Hmm, I could lose a pound or two,” or “I wish I looked like my friend John.” More often than not, most people think negatively of themselves. So how can we build healthy body images for ourselves?"
      },
      {
       "role": "body",
       "text": "If you go on any website or watch any TV show, you may think, “Wow! That actress is so beautiful!” The models and actors are slim or muscular, but most importantly, they are all attractive. When we see people like that, we start to compare ourselves to them. This might make us feel bad about ourselves. People say that looking at images of skinny people in magazines makes them feel unattractive. These people also say that they don't see people on TV who look like them."
      },
      {
       "role": "body",
       "text": "What can we do about this? First, we can change the way we think. We need to realize that the photos have been changed. People don't really look like that. We must also realize that we don't have to look like the people on TV or in magazines. We should be happy with who we are."
      },
      {
       "role": "body",
       "text": "The second thing we can do is to tell companies how we feel. We can use social media to ask them to show more body types on TV. We can tell them it's wrong to promote unhealthy lifestyles."
      },
      {
       "role": "conclusion",
       "text": "Building a healthy body image must come from ourselves. We sometimes need to tell ourselves, “I am beautiful just as I am.” But we can also try to make sure that we see more realistic beauty standards on TV or in magazines."
      }
     ]
    },
    "wordList": [
     {
      "word": "case study",
      "pos": "n.",
      "enDef": "a detailed account giving information about the development of a person, group, or thing",
      "sent": "The company's recent history is a case study in bad management."
     },
     {
      "word": "transform",
      "pos": "v.",
      "enDef": "to change completely and usually in a good way",
      "sent": "The new paint completely transformed the room."
     },
     {
      "word": "realistic",
      "pos": "adj.",
      "enDef": "based on what is real rather than on what is hoped for",
      "sent": "He tried to be realistic about the situation."
     },
     {
      "word": "body type",
      "pos": "n.",
      "enDef": "the particular appearance of body",
      "sent": "Everyone loses weight differently due to their body type."
     },
     {
      "word": "muscular",
      "pos": "adj.",
      "enDef": "having well-developed muscles",
      "sent": "His legs are very muscular."
     },
     {
      "word": "slimmer",
      "pos": "adj.",
      "enDef": "more thin in an attractive way",
      "sent": "I was a lot slimmer in those days."
     }
    ],
    "quiz": [
     {
      "q": "Email has transformed the way people communicate. — 'transformed' means:",
      "type": "choice",
      "options": [
       "changed",
       "completed",
       "remained"
      ],
      "answer": "changed",
      "why": "Unit 5 Word List: transform (v.) = to change completely and usually in a good way."
     },
     {
      "q": "He tried to be realistic about the situation. — 'realistic' is closest to:",
      "type": "choice",
      "options": [
       "fictional",
       "fake",
       "real"
      ],
      "answer": "real",
      "why": "Unit 5 Word List: realistic (adj.) = based on what is real rather than on what is hoped for."
     },
     {
      "q": "This species has a black round body type and a white head. — 'body type' means:",
      "type": "choice",
      "options": [
       "shape",
       "type of blood",
       "heritage"
      ],
      "answer": "shape",
      "why": "Unit 5 Word List: body type (n.) = the particular appearance of body."
     },
     {
      "q": "Jacob's answers were unsatisfactory. — 'unsatisfactory' means:",
      "type": "choice",
      "options": [
       "not good enough",
       "acceptable",
       "attractive"
      ],
      "answer": "not good enough",
      "why": "Unit 5 Word List: unsatisfactory (adj.) = not satisfactory."
     },
     {
      "q": "Students need to be happy ____ who they are. (Fill in the correct phrase from the model essay.)",
      "type": "fill",
      "options": [],
      "answer": "with",
      "why": "Unit 5 Language Skills: phrase 'be happy with' — 'We should be happy with who we are.'"
     }
    ],
    "guided": {
     "prompt": "How can students build a healthy body image? Write a problem-solution essay.",
     "checklist": [
      "Introduction: describe the problem with a real-life moment (looking in the mirror) and ask 'So how can we…?'",
      "Body: first show the problem (media images and comparing ourselves), then give solutions — change the way we think; tell companies to show more body types",
      "Conclusion: say the change must come from ourselves, and we can also push for more realistic beauty standards"
     ],
     "minWords": 120
    }
   },
   {
    "id": "L3-U6",
    "title": "What Causes Student Burnout?",
    "genre": "cause-effect",
    "sample": {
     "title": "What Causes Student Burnout?",
     "paras": [
      {
       "role": "intro",
       "text": "These days, it feels like students are burning out more frequently than before. But why is this?"
      },
      {
       "role": "body",
       "text": "For one, excessive studying can cause burnout. In order to get the best grades in class, students spend all of their time studying. They not only study in class, but they also study in their free time on the weekends. Students are too stressed about their grades to relax. But the more they study, the less time they give their brains to rest."
      },
      {
       "role": "body",
       "text": "Also, too little sleep can cause burnout. Students are already very stressed about their grades and any upcoming tests. When it is time to go to sleep, they lie awake all night and worry. The more they worry, the harder it is for them to sleep. This is extremely harmful to their health. Students need at least eight hours of sleep a night, yet many only sleep for three or four hours."
      },
      {
       "role": "body",
       "text": "Parents can cause burnout as well. All parents want their children to get good grades. So when they see their child studying excessively or not sleeping enough, they are too afraid to say anything because they want their child to succeed. They don't realize that rest is just as important as studying, and their child needs to do both."
      },
      {
       "role": "conclusion",
       "text": "After looking at the facts, it is clear that excessive studying, lack of rest, and parents are three major causes of student burnout. If parents encourage students to rest more, it might help relieve stress, improve student grades, and reduce the risk of burnout."
      }
     ]
    },
    "wordList": [
     {
      "word": "burnout",
      "pos": "n.",
      "enDef": "the state of having no energy or enthusiasm because of working too much",
      "sent": "Long work hours have led to burnout and frustration."
     },
     {
      "word": "workload",
      "pos": "n.",
      "enDef": "the amount of work that is expected to be done",
      "sent": "Students complained about the heavy workload."
     },
     {
      "word": "unnecessary",
      "pos": "adj.",
      "enDef": "not needed or necessary",
      "sent": "In this city, owning a car is unnecessary."
     },
     {
      "word": "peer pressure",
      "pos": "phr.",
      "enDef": "a feeling that you must do the same things as other people of your age to be liked or respected by them",
      "sent": "She started dressing differently because of peer pressure."
     },
     {
      "word": "motivate",
      "pos": "v.",
      "enDef": "to make someone more determined or confident",
      "sent": "We were motivated to learn foreign languages at school."
     },
     {
      "word": "excessive",
      "pos": "adj.",
      "enDef": "too much",
      "sent": "He drinks excessive amounts of coffee."
     }
    ],
    "quiz": [
     {
      "q": "He drinks excessive amounts of coffee. — 'excessive' means:",
      "type": "choice",
      "options": [
       "adequate",
       "a shortage of",
       "too much"
      ],
      "answer": "too much",
      "why": "Unit 6 Word List: excessive (adj.) = too much."
     },
     {
      "q": "They were overwhelmed with work. — 'overwhelmed' is closest to:",
      "type": "choice",
      "options": [
       "disappointed",
       "overcrowded",
       "too much to face"
      ],
      "answer": "too much to face",
      "why": "Unit 6: overwhelmed = having more work than you can deal with (Unit Test A2)."
     },
     {
      "q": "Long work hours have led to burnout. — 'burnout' means:",
      "type": "choice",
      "options": [
       "tiredness",
       "energy",
       "fire"
      ],
      "answer": "tiredness",
      "why": "Unit 6 Word List: burnout (n.) = the state of having no energy or enthusiasm because of working too much."
     },
     {
      "q": "Upgrading your computer seems the ideal solution. — 'ideal' is closest to:",
      "type": "choice",
      "options": [
       "strange",
       "exactly right",
       "opposite"
      ],
      "answer": "exactly right",
      "why": "Unit 6: ideal = perfect; the exactly right solution (Unit Test A4)."
     },
     {
      "q": "Students need at least eight hours of sleep; when tired they often just ____ awake all night. (Fill in the phrase.)",
      "type": "fill",
      "options": [],
      "answer": "lie",
      "why": "Unit 6 Language Skills: phrase 'lie awake' — 'they lie awake all night and worry' from the model essay."
     }
    ],
    "guided": {
     "prompt": "What causes student burnout? Write a cause-and-effect essay with at least three causes.",
     "checklist": [
      "Introduction: state the trend (students are burning out more than before) and ask why",
      "Body: give causes one by one with markers (For one… / Also… / … as well), each with details and results",
      "Conclusion: 'After looking at the facts, it is clear that…' — summarize the causes and suggest what might help"
     ],
     "minWords": 120
    }
   },
   {
    "id": "L3-U7",
    "title": "Should Students Have Cell Phones?",
    "genre": "argumentative",
    "sample": {
     "title": "Should Students Have Cell Phones?",
     "paras": [
      {
       "role": "intro",
       "text": "Cell phones have become essential to our everyday lives. But do students really need them at school? People have strong feelings on this topic, and their opinions are divided."
      },
      {
       "role": "body",
       "text": "Some people think that students should be allowed to have cell phones. One reason is in case of an emergency. If an emergency happens, students with a cell phone are able to contact their parents to let them know they are safe. In addition to that, they feel there is no problem with students using their phones during break times. What is more, some say cell phones should be allowed in the classroom as well. They could be used as calculators in math class, or students could use coding apps in computer class."
      },
      {
       "role": "body",
       "text": "Other people argue that cell phones shouldn't be allowed in schools at all. They claim that they are a distraction. Not only that, but students could use them to cheat. They could use the internet secretly on their phone to find the answers to questions in a test. Not to mention the fact that cell phones can encourage cyberbullying. Students could send mean messages to other students in the class without the teacher knowing."
      },
      {
       "role": "conclusion",
       "text": "Cell phones in schools are a controversial topic. They can sometimes be used to contact parents or to help with studying. But they can also be used to cheat on tests or bully students. It is up to each school to decide regarding cell phones."
      }
     ]
    },
    "wordList": [
     {
      "word": "distraction",
      "pos": "n.",
      "enDef": "something that stops you from concentrating",
      "sent": "I was distracted by a loud noise."
     },
     {
      "word": "contact",
      "pos": "v.",
      "enDef": "to call or reach someone",
      "sent": "You can always contact me on my home number."
     },
     {
      "word": "emergency",
      "pos": "n.",
      "enDef": "a dangerous situation",
      "sent": "How would disabled people escape in an emergency?"
     },
     {
      "word": "ignore",
      "pos": "v.",
      "enDef": "to refuse to see or notice someone",
      "sent": "I smiled at her but she just ignored me."
     },
     {
      "word": "cyberbullying",
      "pos": "n.",
      "enDef": "to harm others online",
      "sent": "Cyberbullying is not tolerated at school."
     },
     {
      "word": "outdated",
      "pos": "adj.",
      "enDef": "not modern",
      "sent": "Nowadays this technique is completely outdated."
     }
    ],
    "quiz": [
     {
      "q": "I was distracted by a loud noise. — 'distracted' means:",
      "type": "choice",
      "options": [
       "attracted",
       "focused on",
       "stopped concentrating"
      ],
      "answer": "stopped concentrating",
      "why": "Unit 7 Word List: distract = to stop someone from concentrating (Unit Test A1)."
     },
     {
      "q": "How would disabled people escape in an emergency? — 'emergency' means:",
      "type": "choice",
      "options": [
       "crowded place",
       "tunnel",
       "dangerous situation"
      ],
      "answer": "dangerous situation",
      "why": "Unit 7 Word List: emergency (n.) = a dangerous situation."
     },
     {
      "q": "I smiled at her but she just ignored me. — 'ignored' is closest to:",
      "type": "choice",
      "options": [
       "looked for",
       "laughed at",
       "refused to see"
      ],
      "answer": "refused to see",
      "why": "Unit 7 Word List: ignore (v.) = to refuse to see or notice someone."
     },
     {
      "q": "Cyberbullying is not tolerated at school. — 'cyberbullying' means:",
      "type": "choice",
      "options": [
       "trust issues",
       "offline fighting",
       "harming others online"
      ],
      "answer": "harming others online",
      "why": "Unit 7 Word List: cyberbullying = to harm others online."
     },
     {
      "q": "People have strong feelings on this topic, and their opinions are ____. (Fill in the phrase.)",
      "type": "fill",
      "options": [],
      "answer": "divided",
      "why": "Unit 7 Language Skills: phrase 'be divided' — opinions split between two sides, from the model essay's introduction."
     }
    ],
    "guided": {
     "prompt": "Should students be allowed to have cell phones at school? Write an argumentative essay presenting both sides.",
     "checklist": [
      "Introduction: set the scene (cell phones are essential) and ask the question; say opinions are divided",
      "Body: one side with reasons (Some people think… One reason is… In addition… What is more…), then the other side (Other people argue… Not only that… Not to mention…)",
      "Conclusion: summarize both sides and say who should decide (It is up to each school to decide…)"
     ],
     "minWords": 120
    }
   },
   {
    "id": "L3-U8",
    "title": "How Has Technology Changed Us?",
    "genre": "classification",
    "sample": {
     "title": "How Has Technology Changed Us?",
     "paras": [
      {
       "role": "intro",
       "text": "Technology is changing and improving our lives in many ways. Three types of technology that have changed our everyday lives are the internet, digital cameras, and smartphones."
      },
      {
       "role": "body",
       "text": "The internet has been around for over thirty years. It was first invented by Tim Berners-Lee in 1989, but it wasn't used by many people. Nowadays, the internet is used by almost everyone, including young people, old people, business people, students, etc. Without the internet, we wouldn't have email, instant messages, etc. These days, online shopping is more popular than shopping in physical stores."
      },
      {
       "role": "body",
       "text": "The first digital camera was sold in 1975. It wasn't very popular. These days, digital cameras can be found wherever you look. They allow you to take photos wherever you like. People who like taking photos probably have a digital camera. Old-fashioned film cameras are not used very much anymore, and have been replaced by digital ones."
      },
      {
       "role": "body",
       "text": "These days, most cell phones that are sold are smartphones, i.e., phones that are connected to the internet and have a digital camera. Combining both technologies lets users make video calls with people in other countries. In addition, people can post photos or videos on social media and connect with new people. Smartphones can also be used to pay for things. They even have GPS that lets you find your way wherever you are."
      },
      {
       "role": "conclusion",
       "text": "The internet, digital cameras, and smartphones are three technologies that have changed our lives. They have quickly become part of everyday life in the 21st century, and it is difficult to imagine life without any of them."
      }
     ]
    },
    "wordList": [
     {
      "word": "technology",
      "pos": "n.",
      "enDef": "scientific knowledge",
      "sent": "Recent advances in medical technology have saved countless lives."
     },
     {
      "word": "utilize",
      "pos": "v.",
      "enDef": "to use something",
      "sent": "This room is mainly utilized for training purposes."
     },
     {
      "word": "advance",
      "pos": "n.",
      "enDef": "a development; progress in a field",
      "sent": "There has been little advance made in the treatment of this disease."
     },
     {
      "word": "combine",
      "pos": "v.",
      "enDef": "to join together",
      "sent": "We decided to combine both methods."
     },
     {
      "word": "GPS",
      "pos": "n.",
      "enDef": "signaling the location; a system that tells you where you are",
      "sent": "The company uses GPS to determine the delivery truck's position."
     },
     {
      "word": "cutting-edge",
      "pos": "adj.",
      "enDef": "the newest; most advanced",
      "sent": "These models are at the cutting-edge of computer design."
     }
    ],
    "quiz": [
     {
      "q": "Recent advances in medical technology have saved countless lives. — 'technology' is closest to:",
      "type": "choice",
      "options": [
       "tools",
       "scientific knowledge",
       "science fiction"
      ],
      "answer": "scientific knowledge",
      "why": "Unit 8 Word List: technology (n.) = scientific knowledge (Unit Test A1)."
     },
     {
      "q": "This room is mainly utilized for training purposes. — 'utilized' means:",
      "type": "choice",
      "options": [
       "spent",
       "used",
       "repaired"
      ],
      "answer": "used",
      "why": "Unit 8 Word List: utilize (v.) = to use something."
     },
     {
      "q": "There has been little advance in the treatment of this disease. — 'advance' means:",
      "type": "choice",
      "options": [
       "adventure",
       "depression",
       "development"
      ],
      "answer": "development",
      "why": "Unit 8 Word List: advance (n.) = a development; progress in a field."
     },
     {
      "q": "We decided to combine both methods. — 'combine' is closest to:",
      "type": "choice",
      "options": [
       "join together",
       "make complex",
       "separate"
      ],
      "answer": "join together",
      "why": "Unit 8 Word List: combine (v.) = to join together."
     },
     {
      "q": "These models are at the cutting-edge of computer design. — 'cutting-edge' means:",
      "type": "choice",
      "options": [
       "unique style",
       "the better",
       "the newest"
      ],
      "answer": "the newest",
      "why": "Unit 8 Word List: cutting-edge (adj.) = the newest; most advanced."
     }
    ],
    "guided": {
     "prompt": "How has technology changed our lives? Choose three technologies and classify their impact.",
     "checklist": [
      "Introduction: say technology is changing our lives in many ways and name the three types you will cover",
      "Body: one paragraph per technology — what it is, how it started, and how people use it now (use present perfect passive: has been replaced by / was invented by)",
      "Conclusion: restate the three technologies and say life in the 21st century is hard to imagine without them"
     ],
     "minWords": 120
    }
   }
  ]
 }
};
