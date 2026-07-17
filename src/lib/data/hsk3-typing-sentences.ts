export interface Hsk3SectionSentence {
  hanzi: string;
  translation: string;
}

export const HSK3_MIN_SENTENCES_PER_SECTION = 3;

const s = (hanzi: string, translation: string): Hsk3SectionSentence => ({
  hanzi,
  translation
});

export const HSK3_SECTION_SENTENCES: Record<string, Hsk3SectionSentence[]> = {
  '固定短语“看上去/看起来” · Set Phrases “看上去/看起来”': [
    s('他们看上去有点儿像。', 'They look a little alike.'),
    s('这些菜看起来都很好吃。', 'These dishes all look delicious.'),
    s('那个新来的老师看上去很年轻。', 'The new teacher looks very young.')
  ],
  '疑问代词的非疑问用法（1） · Non-Interrogative Use of Interrogative Pronouns (1)': [
    s('我好像在哪儿看到过这个箱子。', 'I seem to have seen this suitcase somewhere.'),
    s('你吃点儿什么再走吧。', 'Eat something before you leave.'),
    s('我们哪天一起去踢足球吧。', 'Let us play football together someday.')
  ],
  '多项定语 · Multiple Attributives': [
    s('他是那个穿黑衣服的年轻人。', 'He is that young man wearing black.'),
    s(
      '昨天和我一起看电影的人是我的朋友。',
      'The person who watched a movie with me yesterday is my friend.'
    ),
    s('我那件新买的白色衣服在哪儿？', 'Where is that new white item of clothing I bought?')
  ],
  '并列复句“又……又……” · Coordinate Complex Sentence “又……又……”': [
    s('我现在又饿又渴。', 'I am hungry and thirsty now.'),
    s('那个女孩儿又高又漂亮。', 'That girl is both tall and pretty.'),
    s('这家饭馆的菜又便宜又好吃。', 'This restaurant’s food is both inexpensive and delicious.')
  ],
  '疑问代词的非疑问用法（2） · Non-Interrogative Use of Interrogative Pronouns (2)': [
    s('哪个菜都好吃。', 'Every dish is delicious.'),
    s('这次旅游我去哪儿都可以。', 'I can go anywhere on this trip.'),
    s('你想什么时候来都没问题。', 'You can come whenever you want.')
  ],
  '疑问代词的非疑问用法（3） · Non-Interrogative Use of Interrogative Pronouns (3)': [
    s('你们想吃什么就点什么。', 'Order whatever you want to eat.'),
    s('你觉得哪个好看就买哪个。', 'Buy whichever one you think looks good.'),
    s('你想去哪儿，我们就去哪儿。', 'We will go wherever you want to go.')
  ],
  '程度副词“挺” · Adverb of Degree “挺”': [
    s('这个小区环境挺好的。', 'This neighborhood has quite a good environment.'),
    s('这家饭馆的菜挺好吃的。', 'This restaurant’s food is quite tasty.'),
    s('我挺喜欢这个颜色的。', 'I quite like this color.')
  ],
  '程度补语（1） · Complement of Degree (1)': [
    s('我这几天忙坏了。', 'I have been extremely busy these past few days.'),
    s('我渴坏了。', 'I am terribly thirsty.'),
    s('大家都累坏了。', 'Everyone is exhausted.')
  ],
  '“就”和“才” · Comparison of “就” and “才”': [
    s('走路几分钟就能到。', 'It only takes a few minutes to get there on foot.'),
    s('我很晚才能回来。', 'I will not be able to return until very late.'),
    s('我早上五点就起床了。', 'I got up as early as five in the morning.')
  ],
  '固定格式“一……也/都+不/没……” · Fixed Pattern “一……也/都+不/没……”': [
    s('她一件衣服都不想买。', 'She does not want to buy even one item of clothing.'),
    s('我一点儿东西也不想吃。', 'I do not want to eat anything at all.'),
    s('这里一点儿也不冷。', 'It is not cold here at all.')
  ],
  '比较句（9） · Comparative Sentences (9)': [
    s('这家宾馆跟别的都不一样。', 'This hotel is different from all the others.'),
    s('他的新手机跟我的一样。', 'His new phone is the same as mine.'),
    s('这个房间跟那个房间一样大。', 'This room is as large as that room.')
  ],
  '固定格式“除了……（以外），……都/还/也……” · Fixed Pattern “除了……（以外），……都/还/也……”': [
    s('除了我以外，大家都在玩手机。', 'Everyone except me is using a phone.'),
    s('除了这个汉字，别的汉字我都会写。', 'I can write every Hanzi except this one.'),
    s('除了唱歌以外，他也喜欢跳舞。', 'Besides singing, he also likes dancing.')
  ],
  '程度补语（2） · Complement of Degree (2)': [
    s('现在天气好得很。', 'The weather is extremely good now.'),
    s('房间里面热得很。', 'It is extremely hot inside the room.'),
    s('我觉得爬山累得很。', 'I think mountain climbing is extremely tiring.')
  ],
  '量词重叠 · Reduplication of Measure Words': [
    s('这些照片张张都很好看。', 'Every one of these photos looks good.'),
    s('这些苹果个个都很大。', 'Every one of these apples is large.'),
    s('最近天天下雨。', 'It has been raining every day recently.')
  ],
  '存现句（3） · Existential Sentences (3)': [
    s('后边走过去两个人。', 'Two people walked past in the back.'),
    s('前面开过来很多车。', 'Many cars are coming from ahead.'),
    s('楼上下来几个人。', 'Several people came down from upstairs.')
  ],
  '紧缩复句“……了……就……” · Contracted Complex Sentence “……了……就……”': [
    s('你听完了音乐会就来我家吃饭。', 'Come eat at my home after the concert finishes.'),
    s('我吃了早饭就去学校了。', 'I went to school right after breakfast.'),
    s('昨天我们下了课就回家了。', 'Yesterday we went home as soon as class ended.')
  ],
  '固定格式“该……了” · Fixed Pattern “该……了”': [
    s('咱们该买票了。', 'It is time for us to buy tickets.'),
    s('八点了，该上课了。', 'It is eight; class should begin.'),
    s('已经很晚了，我该睡觉了。', 'It is already late; I should go to sleep.')
  ],
  '假设复句“如果……，就……” · Hypothetical Complex Sentence “如果……，就……”': [
    s('如果你需要帮忙，就给我打电话。', 'If you need help, call me.'),
    s('如果有时间，我就去上海玩几天。', 'If I have time, I will spend a few days in Shanghai.'),
    s('如果明天下雨，我们就不去了。', 'If it rains tomorrow, we will not go.')
  ],
  '固定短语“越来越” · Set Phrase “越来越”': [
    s('前面的人越来越多。', 'There are more and more people ahead.'),
    s('我越来越喜欢这里的生活了。', 'I like life here more and more.'),
    s('她越来越高，也越来越漂亮了。', 'She is getting taller and prettier.')
  ],
  '连动句（2） · Serial Verb Sentences (2)': [
    s('咱们可以走着去。', 'We can go there on foot.'),
    s('弟弟吃着苹果写作业。', 'My younger brother eats an apple while doing homework.'),
    s('他们坐着看电视。', 'They watch television while sitting.')
  ],
  '比较句（10） · Comparative Sentences (10)': [
    s('裙子不比短裤贵多少。', 'The skirt is not much more expensive than the shorts.'),
    s('他的中文不比你好。', 'His Chinese is no better than yours.'),
    s('他跑得不比我快多少。', 'He does not run much faster than I do.')
  ],
  '程度补语（3） · Complement of Degree (3)': [
    s('这块西瓜甜极了。', 'This piece of watermelon is extremely sweet.'),
    s('今年夏天热极了。', 'This summer is extremely hot.'),
    s('这本书我喜欢极了。', 'I like this book enormously.')
  ],
  '递进复句“不但……，而且……” · Progressive Complex Sentence “不但……，而且……”': [
    s(
      '现在的电视不但便宜，而且用着很方便。',
      'Modern televisions are not only inexpensive but also convenient to use.'
    ),
    s('她不但喜欢唱歌，而且唱得很好听。', 'She not only likes singing but also sings very well.'),
    s('不但她会说汉语，而且我也会说汉语。', 'Not only can she speak Chinese, but I can too.')
  ],
  '趋向补语的引申用法（1） · Extended Use of the Complement of Direction (1)': [
    s('我不能再胖下去了。', 'I cannot keep gaining weight.'),
    s('后面的问题你读下去。', 'Continue reading the questions that follow.'),
    s('如果再热下去就不能出门了。', 'If it keeps getting hotter, we will not be able to go out.')
  ],
  '离合词（2） · Separable Words (2)': [
    s('昨天游完泳以后，我很累。', 'I was tired after swimming yesterday.'),
    s('今年夏天只下了两次雨。', 'It rained only twice this summer.'),
    s('他下个月跟女朋友结婚。', 'He will marry his girlfriend next month.')
  ],
  '时量补语（2） · Complement of Duration (2)': [
    s(
      '我上次来医院已经差不多两年了。',
      'It has been almost two years since I last came to the hospital.'
    ),
    s('她回家两个月了。', 'She has been home for two months.'),
    s('开学已经三个多星期了。', 'It has been over three weeks since school started.')
  ],
  '固定格式“……以前/以后/前/后” · Fixed Pattern “……以前/以后/前/后”': [
    s('这种药需要每天睡前吃一次。', 'This medicine should be taken once daily before bed.'),
    s('我们决定下班后一起看电影。', 'We decided to watch a movie together after work.'),
    s('考完试以后，咱们一起去旅游吧。', 'Let us travel together after the exam.')
  ],
  '目的复句“为了……，……” · Purpose Complex Sentence “为了……，……”': [
    s(
      '为了准备运动会，他们每天都练球。',
      'They practice ball games every day to prepare for the sports meet.'
    ),
    s('为了考上大学，她每天努力学习。', 'She studies hard every day to get into university.'),
    s('为了早点儿到家，我打算坐飞机回去。', 'I plan to fly back so I can arrive home earlier.')
  ],
  '可能补语 · Complement of Potentiality': [
    s('这个问题我听得懂。', 'I can understand this question.'),
    s('这个问题我听不懂。', 'I cannot understand this question.'),
    s('这本书你看得懂看不懂？', 'Can you understand this book?'),
    s('你学得会游泳吗？', 'Can you manage to learn swimming?')
  ],
  '固定格式“越A越B” · Fixed Pattern “越A越B”': [
    s('这场比赛我越看越着急。', 'The more I watch this match, the more anxious I become.'),
    s('妈妈越说，他越不高兴。', 'The more Mom talks, the unhappier he becomes.'),
    s('我想认识中国朋友，越多越好。', 'I want to meet Chinese friends—the more, the better.')
  ],
  '“把”字句（1） · “把” Sentence (1)': [
    s('我会把这些题都记在本子上。', 'I will write all these questions in my notebook.'),
    s('老师把作业本放到桌子上了。', 'The teacher put the exercise books on the table.'),
    s('你不能把名字写在这里。', 'You cannot write your name here.')
  ],
  '固定格式“在……上/中/下” · Fixed Pattern “在……上/中/下”': [
    s('在学习上，遇到问题可以问我。', 'You can ask me about problems in your studies.'),
    s('在比赛中，他得分最高。', 'He scored the most points in the competition.'),
    s('在老师的帮助下，我的成绩提高很快。', 'With the teacher’s help, my grades improved quickly.')
  ],
  '“把”字句（2） · “把” Sentence (2)': [
    s('你明天再把书还给我。', 'Return the book to me tomorrow.'),
    s('我把礼物送给她了。', 'I gave the gift to her.'),
    s('请你把这本书带给老师。', 'Please take this book to the teacher.')
  ],
  '“还是”和“或者” · Comparison of “还是” and “或者”': [
    s('我们坐地铁还是打车？', 'Shall we take the subway or a taxi?'),
    s('你今天去还是明天去？', 'Will you go today or tomorrow?'),
    s('你可以坐地铁或者打车去学校。', 'You can take the subway or a taxi to school.')
  ],
  '固定短语“看来” · Set Phrase “看来”': [
    s('看来我没办法解决这个问题。', 'It seems I cannot solve this problem.'),
    s('这么晚了，看来他今天不会来了。', 'It is so late; it seems he will not come today.'),
    s('电梯坏了，看来咱们只能走下去了。', 'The elevator is broken; it seems we can only walk down.')
  ],
  '“把”字句（3） · “把” Sentence (3)': [
    s('我们一起把这些工作做完。', 'Let us finish this work together.'),
    s('妈妈把衣服洗干净了。', 'Mom washed the clothes clean.'),
    s('他还没把电脑接好呢。', 'He has not connected the computer properly yet.')
  ],
  '固定格式“对……来说” · Fixed Pattern “对……来说”': [
    s('对我来说，家人很重要。', 'Family is very important to me.'),
    s('对她来说，学习汉语很有意思。', 'Learning Chinese is interesting to her.'),
    s('对孩子来说，玩也是一种学习。', 'For children, playing is also a kind of learning.')
  ],
  '选择复句“或者……，或者……” · Alternative Complex Sentence “或者……，或者……”': [
    s('或者明天去，或者后天去。', 'We can go either tomorrow or the day after tomorrow.'),
    s(
      '我们或者今天去电影院，或者明天在家看电影。',
      'We will either go to the cinema today or watch a movie at home tomorrow.'
    ),
    s('晚饭或者吃中国菜，或者吃泰国菜。', 'For dinner, we can eat either Chinese or Thai food.')
  ],
  '趋向补语的引申用法（2） · Extended Use of the Complement of Direction (2)': [
    s('雨已经下起来了。', 'It has started raining.'),
    s('最近天气热起来了。', 'The weather has started getting hot recently.'),
    s('怎么突然刮起风来了？', 'Why did the wind suddenly start blowing?')
  ],
  '范围副词“就” · Adverb of Scope “就”': [
    s('听说今年就下了一次雪。', 'I heard it snowed only once this year.'),
    s('他昨天就看了十分钟书。', 'He read for only ten minutes yesterday.'),
    s('大家都带了雨伞，就我没带。', 'Everyone brought an umbrella except me.')
  ],
  '趋向补语的引申用法（3） · Extended Use of the Complement of Direction (3)': [
    s('这一年住下来，我更喜欢这里了。', 'After living here for a year, I like it even more.'),
    s(
      '这半年练下来，他提高了不少。',
      'After practicing for half a year, he improved considerably.'
    ),
    s('没想到我跑下来了。', 'I did not expect that I would manage to finish the run.')
  ],
  '假设复句“……的话，就……” · Hypothetical Complex Sentence “……的话，就……”': [
    s('你有时间的话，就来我家做客。', 'If you have time, come visit my home.'),
    s('你觉得满意的话，咱们就买。', 'If you are satisfied, we will buy it.'),
    s('明天天气好的话，我就去爬山。', 'If the weather is good tomorrow, I will climb a mountain.')
  ],
  '“把”字句（4） · “把” Sentence (4)': [
    s('你把声音开得太大了。', 'You turned the volume up too high.'),
    s('他把球踢进去了吗？', 'Did he kick the ball in?'),
    s('你把字写得太小了。', 'You wrote the characters too small.')
  ],
  '并列复句“一边……，一边……” · Coordinate Complex Sentence “一边……，一边……”': [
    s('咱们一边吃蛋糕，一边聊天儿吧。', 'Let us chat while eating cake.'),
    s('我喜欢一边跑步，一边听音乐。', 'I like listening to music while running.'),
    s('你不应该边开车边打电话。', 'You should not make calls while driving.')
  ],
  '被动句（1） · Passive Sentences (1)': [
    s('这本书被别人借走了。', 'This book was borrowed by someone else.'),
    s('水果可能被弟弟吃了。', 'The fruit may have been eaten by my younger brother.'),
    s('我们经常被叫错名字。', 'Our names are often called incorrectly.')
  ],
  '承接复句“先……，再/然后……” · Successive Complex Sentence “先……，再/然后……”': [
    s('我要先去图书馆，然后去游泳。', 'I will go to the library first and then go swimming.'),
    s('你先去买门票，再来这里找我。', 'Buy the tickets first, then come here to find me.'),
    s(
      '你们先回房间休息，然后再出来吃饭。',
      'Return to your room and rest first, then come out to eat.'
    )
  ],
  '固定格式“X什么（啊）” · Fixed Pattern “X什么（啊）”': [
    s('紧张什么啊，我们都喜欢听你唱歌。', 'Why be nervous? We all like hearing you sing.'),
    s('胖什么啊，你看起来不胖。', 'Why worry about being fat? You do not look fat.'),
    s('急什么啊，马上就到了。', 'Why the hurry? We will arrive very soon.')
  ],
  '介词“根据” · Preposition “根据”': [
    s(
      '小区根据大家的需要有了很多变化。',
      'The neighborhood changed greatly according to everyone’s needs.'
    ),
    s(
      '根据要求，我们必须参加明天的会议。',
      'According to the requirements, we must attend tomorrow’s meeting.'
    ),
    s(
      '老师根据学生的兴趣选择了不同的书。',
      'The teacher selected different books based on the students’ interests.'
    )
  ],
  '数量重叠“数词+量词+数词+量词” · Reduplication of Numeral-Measure Word Phrases “Numeral+Measure Word+Numeral+Measure Word”':
    [
      s('我得一点儿一点儿给您讲。', 'I need to explain it to you little by little.'),
      s('学生们的汉语水平一天一天地提高了。', 'The students’ Chinese improved day by day.'),
      s('他们两个两个地走进去了。', 'They walked in two by two.')
    ],
  '固定短语“在……看来” · Set Phrase “在……看来”': [
    s('在我们看来，这件事很重要。', 'In our view, this matter is important.'),
    s('在同事们看来，她工作非常认真。', 'In her colleagues’ view, she works very conscientiously.'),
    s('在我看来，每天读书是很好的习惯。', 'In my view, reading every day is a good habit.')
  ],
  '固定短语“不一会儿” · Set Phrase “不一会儿”': [
    s('难过的事情不一会儿就忘了。', 'The upsetting matter was forgotten in a short while.'),
    s('不一会儿，校长就来了。', 'Before long, the principal arrived.'),
    s('两个小时不一会儿就过去了。', 'The two hours passed before long.')
  ],
  '并列复句“一会儿……，一会儿……” · Coordinate Complex Sentence “一会儿……，一会儿……”': [
    s('它一会儿睡觉，一会儿在身上爬。', 'One moment it sleeps; the next it climbs on me.'),
    s('他一会儿进来，一会儿出去。', 'One moment he comes in; the next he goes out.'),
    s('最近天气一会儿冷，一会儿热。', 'Recently the weather is cold one moment and hot the next.')
  ],
  '介词“关于” · Preposition “关于”': [
    s('关于这个问题，我慢慢给你讲。', 'I will slowly explain this issue to you.'),
    s('关于他的要求，我们还要开会。', 'We still need to meet about his request.'),
    s(
      '关于比赛的时间，我明天告诉大家。',
      'I will tell everyone tomorrow about the competition time.'
    )
  ],
  '固定短语“一般来说” · Set Phrase “一般来说”': [
    s('一般来说，熊猫每天要睡很多次觉。', 'Generally speaking, pandas sleep many times each day.'),
    s(
      '一般来说，这种树每年开一次花。',
      'Generally speaking, this kind of tree flowers once a year.'
    ),
    s(
      '一般来说，学习外语需要多练习。',
      'Generally speaking, learning a foreign language requires much practice.'
    )
  ],
  '比较句（11） · Comparative Sentences (11)': [
    s('冬天比夏天早关门一个小时。', 'In winter it closes one hour earlier than in summer.'),
    s(
      '哥哥比弟弟多吃了三个饺子。',
      'The older brother ate three more dumplings than the younger brother.'
    ),
    s('我比他晚到了十分钟。', 'I arrived ten minutes later than he did.'),
    s('今天比昨天少来了两个人。', 'Two fewer people came today than yesterday.')
  ],
  '介词“向” · Preposition “向”': [
    s('别再向前走了。', 'Do not walk forward any farther.'),
    s('以后我要多向认真的人学习。', 'I will learn more from conscientious people.'),
    s('孩子一看见妈妈，就向她跑过去了。', 'As soon as the child saw Mom, the child ran toward her.')
  ],
  '反问句“不是……吗？” · Rhetorical Question “不是……吗？”': [
    s('你不是喜欢玩电脑吗？', 'Do you not like using computers?'),
    s('你不是说今天有事吗？', 'Did you not say you were busy today?'),
    s('考试不是下个月吗？', 'Is the exam not next month?')
  ],
  '递进复句“……，更……” · Progressive Complex Sentence “……，更……”': [
    s(
      '我还没想好学什么，更没想好去哪儿。',
      'I have not decided what to study, much less where to go.'
    ),
    s(
      '想提高中文要多听，更要多说。',
      'To improve Chinese, listen more and, even more importantly, speak more.'
    ),
    s(
      '我学会了中文，更了解了中国文化。',
      'I learned Chinese and gained an even deeper understanding of Chinese culture.'
    )
  ],
  '条件复句“只有……，才……” · Conditional Complex Sentence “只有……，才……”': [
    s('只有想清楚，才能做出选择。', 'Only by thinking clearly can you make a choice.'),
    s('只有每天锻炼，才会越来越健康。', 'Only by exercising daily will you become healthier.'),
    s(
      '只有多听多说，你的中文才能提高。',
      'Your Chinese can improve only if you listen and speak more.'
    )
  ],
  '概数表达法 · Approximate Numbers': [
    s('春节大概放七八天假。', 'The Spring Festival holiday lasts about seven or eight days.'),
    s('教室里来了五六个学生。', 'Five or six students came into the classroom.'),
    s('这些照片是三四年前照的。', 'These photos were taken three or four years ago.')
  ],
  '“刚才”和“刚刚” · Comparison of “刚才” and “刚刚”': [
    s('刚才的电话是我妈妈打来的。', 'The call just now was from my mother.'),
    s('我刚才看过一遍。', 'I looked through it once just now.'),
    s('我刚刚看视频学会了包饺子。', 'I just learned to make dumplings by watching a video.'),
    s('他刚刚来北京两个月。', 'He has only recently been in Beijing for two months.')
  ],
  '条件复句“只要……，就……” · Conditional Complex Sentence “只要……，就……”': [
    s(
      '我只要几天不跟他视频，就很想他。',
      'If I go only a few days without video calling him, I miss him.'
    ),
    s('只要你同意，我们就这么决定了。', 'As long as you agree, we will decide it this way.'),
    s(
      '只要你每天早睡，身体就会好起来。',
      'As long as you sleep early every day, your health will improve.'
    )
  ],
  '固定格式“从……起” · Fixed Pattern “从……起”': [
    s('他从那时起就努力学习。', 'He studied hard from that time onward.'),
    s('从那天起，我们就变成了好朋友。', 'From that day on, we became good friends.'),
    s(
      '从那次旅游起，我对中国文化更有兴趣了。',
      'Since that trip, I have become more interested in Chinese culture.'
    )
  ]
};
