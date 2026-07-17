import type { BookTopicGuide, ClassroomTopic, Lesson, TopicTable } from './hsk1-course.js';

const c = (...classroom: string[]) => classroom;

export const hsk3Lessons: Lesson[] = [
  { number: 1, hanzi: '我们去机场接你们', pinyin: 'Wǒmen qù jīchǎng jiē nǐmen', title: 'We will pick you up at the airport', page: '001', classroom: c('固定短语“看上去/看起来” · Set Phrases “看上去/看起来”', '疑问代词的非疑问用法（1） · Non-Interrogative Use of Interrogative Pronouns (1)', '多项定语 · Multiple Attributives') },
  { number: 2, hanzi: '你们想吃什么就点什么', pinyin: 'Nǐmen xiǎng chī shénme jiù diǎn shénme', title: 'You can order whatever you feel like', page: '010', classroom: c('并列复句“又……又……” · Coordinate Complex Sentence “又……又……”', '疑问代词的非疑问用法（2） · Non-Interrogative Use of Interrogative Pronouns (2)', '疑问代词的非疑问用法（3） · Non-Interrogative Use of Interrogative Pronouns (3)') },
  { number: 3, hanzi: '这个小区挺好的', pinyin: 'Zhège xiǎoqū tǐng hǎo de', title: 'This neighborhood is pretty nice', page: '019', classroom: c('程度副词“挺” · Adverb of Degree “挺”', '程度补语（1） · Complement of Degree (1)', '“就”和“才” · Comparison of “就” and “才”') },
  { number: 4, hanzi: '这家宾馆跟别的都不一样', pinyin: 'Zhè jiā bīnguǎn gēn biéde dōu bù yíyàng', title: 'This hotel is unlike any other', page: '029', classroom: c('固定格式“一……也/都+不/没……” · Fixed Pattern “一……也/都+不/没……”', '比较句（9） · Comparative Sentences (9)', '固定格式“除了……（以外），……都/还/也……” · Fixed Pattern “除了……（以外），……都/还/也……”') },
  { number: 5, hanzi: '这样的照片才好看', pinyin: 'Zhèyàng de zhàopiàn cái hǎokàn', title: 'Photos like these are the best', page: '038', classroom: c('程度补语（2） · Complement of Degree (2)', '量词重叠 · Reduplication of Measure Words', '存现句（3） · Existential Sentences (3)', '紧缩复句“……了……就……” · Contracted Complex Sentence “……了……就……”') },
  { number: 6, hanzi: '高铁上还可以点外卖', pinyin: 'Gāotiě shàng hái kěyǐ diǎn wàimài', title: 'You can even order takeout on a high-speed train', page: '047', classroom: c('固定格式“该……了” · Fixed Pattern “该……了”', '假设复句“如果……，就……” · Hypothetical Complex Sentence “如果……，就……”', '固定短语“越来越” · Set Phrase “越来越”') },
  { number: 7, hanzi: '那条裙子比短裤更好看', pinyin: 'Nà tiáo qúnzi bǐ duǎnkù gèng hǎokàn', title: 'That skirt looks better than the shorts', page: '057', classroom: c('连动句（2） · Serial Verb Sentences (2)', '比较句（10） · Comparative Sentences (10)', '程度补语（3） · Complement of Degree (3)', '递进复句“不但……，而且……” · Progressive Complex Sentence “不但……，而且……”') },
  { number: 8, hanzi: '今天我出院了', pinyin: 'Jīntiān wǒ chūyuàn le', title: 'Today I was discharged from the hospital', page: '067', classroom: c('趋向补语的引申用法（1） · Extended Use of the Complement of Direction (1)', '离合词（2） · Separable Words (2)', '时量补语（2） · Complement of Duration (2)', '固定格式“……以前/以后/前/后” · Fixed Pattern “……以前/以后/前/后”') },
  { number: 9, hanzi: '打不好没关系', pinyin: 'Dǎ bù hǎo méi guānxi', title: "It doesn’t matter if you don’t play well", page: '076', classroom: c('目的复句“为了……，……” · Purpose Complex Sentence “为了……，……”', '可能补语 · Complement of Potentiality', '固定格式“越A越B” · Fixed Pattern “越A越B”') },
  { number: 10, hanzi: '你明天再把书还给我', pinyin: 'Nǐ míngtiān zài bǎ shū huán gěi wǒ', title: 'You can return the book to me tomorrow', page: '086', classroom: c('“把”字句（1） · “把” Sentence (1)', '固定格式“在……上/中/下” · Fixed Pattern “在……上/中/下”', '“把”字句（2） · “把” Sentence (2)') },
  { number: 11, hanzi: '看来我没办法解决这个问题', pinyin: 'Kànlái wǒ méi bànfǎ jiějué zhège wèntí', title: 'It seems I can’t solve this problem', page: '095', classroom: c('“还是”和“或者” · Comparison of “还是” and “或者”', '固定短语“看来” · Set Phrase “看来”', '“把”字句（3） · “把” Sentence (3)', '固定格式“对……来说” · Fixed Pattern “对……来说”') },
  { number: 12, hanzi: '这个季节天气变化很快', pinyin: 'Zhège jìjié tiānqì biànhuà hěn kuài', title: 'The weather changes rapidly in this season', page: '104', classroom: c('选择复句“或者……，或者……” · Alternative Complex Sentence “或者……，或者……”', '趋向补语的引申用法（2） · Extended Use of the Complement of Direction (2)', '范围副词“就” · Adverb of Scope “就”', '趋向补语的引申用法（3） · Extended Use of the Complement of Direction (3)') },
  { number: 13, hanzi: '我的新邻居来自英国', pinyin: 'Wǒ de xīn línjū láizì Yīngguó', title: 'My new neighbors come from the UK', page: '115', classroom: c('假设复句“……的话，就……” · Hypothetical Complex Sentence “……的话，就……”', '“把”字句（4） · “把” Sentence (4)', '并列复句“一边……，一边……” · Coordinate Complex Sentence “一边……，一边……”') },
  { number: 14, hanzi: '这本书被别人借走了', pinyin: 'Zhè běn shū bèi biérén jiè zǒu le', title: 'This book is checked out', page: '124', classroom: c('被动句（1） · Passive Sentences (1)', '承接复句“先……，再/然后……” · Successive Complex Sentence “先……，再/然后……”', '固定格式“X什么（啊）” · Fixed Pattern “X什么（啊）”') },
  { number: 15, hanzi: '我是半个南京人', pinyin: 'Wǒ shì bàn ge Nánjīng rén', title: 'I am basically half a Nanjing local', page: '133', classroom: c('介词“根据” · Preposition “根据”', '数量重叠“数词+量词+数词+量词” · Reduplication of Numeral-Measure Word Phrases “Numeral+Measure Word+Numeral+Measure Word”', '固定短语“在……看来” · Set Phrase “在……看来”', '固定短语“不一会儿” · Set Phrase “不一会儿”') },
  { number: 16, hanzi: '我听说有的熊猫出国了', pinyin: 'Wǒ tīngshuō yǒude xióngmāo chūguó le', title: 'I heard that some pandas have gone abroad', page: '144', classroom: c('并列复句“一会儿……，一会儿……” · Coordinate Complex Sentence “一会儿……，一会儿……”', '介词“关于” · Preposition “关于”', '固定短语“一般来说” · Set Phrase “一般来说”', '比较句（11） · Comparative Sentences (11)') },
  { number: 17, hanzi: '我要多向认真的人学习', pinyin: 'Wǒ yào duō xiàng rènzhēn de rén xuéxí', title: 'I will learn from people who are careful', page: '154', classroom: c('介词“向” · Preposition “向”', '反问句“不是……吗？” · Rhetorical Question “不是……吗？”', '递进复句“……，更……” · Progressive Complex Sentence “……，更……”', '条件复句“只有……，才……” · Conditional Complex Sentence “只有……，才……”') },
  { number: 18, hanzi: '我学会了包饺子', pinyin: 'Wǒ xuéhuì le bāo jiǎozi', title: "I’ve learned how to make jiaozi", page: '163', classroom: c('概数表达法 · Approximate Numbers', '“刚才”和“刚刚” · Comparison of “刚才” and “刚刚”', '条件复句“只要……，就……” · Conditional Complex Sentence “只要……，就……”', '固定格式“从……起” · Fixed Pattern “从……起”') }
];

export const hsk3ClassroomTopics: ClassroomTopic[] = hsk3Lessons.flatMap((lesson) => lesson.classroom.map((title) => ({ title, lesson })));

export const hsk3EnglishGrammarEquivalents: Record<string, string> = {
  '固定短语“看上去/看起来”': 'Looks / seems',
  '疑问代词的非疑问用法（1）': 'Something / somewhere',
  多项定语: 'Modifier order',
  '并列复句“又……又……”': 'Both … and …',
  '疑问代词的非疑问用法（2）': 'Any / every',
  '疑问代词的非疑问用法（3）': 'Whatever / wherever',
  '程度副词“挺”': 'Pretty / quite',
  '程度补语（1）': 'Extremely',
  '“就”和“才”': 'Already / only then',
  '固定格式“一……也/都+不/没……”': 'Not any / not at all',
  '比较句（9）': 'As … as',
  '固定格式“除了……（以外），……都/还/也……”': 'Except / besides',
  '程度补语（2）': 'Very / extremely',
  量词重叠: 'Each / every',
  '存现句（3）': 'There came / went',
  '紧缩复句“……了……就……”': 'Once / as soon as',
  '固定格式“该……了”': 'Should / time to',
  '假设复句“如果……，就……”': 'If …, then …',
  '固定短语“越来越”': 'More and more',
  '连动句（2）': '“-ing” while …',
  '比较句（10）': 'No more … than',
  '程度补语（3）': 'Extremely',
  '递进复句“不但……，而且……”': 'Not only … but also …',
  '趋向补语的引申用法（1）': 'Keep / continue',
  '时量补语（2）': 'For / since',
  '固定格式“……以前/以后/前/后”': 'Before / after',
  '目的复句“为了……，……”': 'To / in order to',
  可能补语: 'Can / cannot',
  '固定格式“越A越B”': 'The more …, the more …',
  '固定格式“在……上/中/下”': 'In terms of / under',
  '“还是”和“或者”': '“Or” in questions / statements',
  '固定短语“看来”': 'It seems',
  '固定格式“对……来说”': 'For / to someone',
  '选择复句“或者……，或者……”': 'Either … or …',
  '趋向补语的引申用法（2）': 'Start to / become',
  '范围副词“就”': 'Only / just',
  '趋向补语的引申用法（3）': 'Manage to finish',
  '假设复句“……的话，就……”': 'If …, then …',
  '并列复句“一边……，一边……”': 'While / at the same time',
  '被动句（1）': 'Be + past participle',
  '承接复句“先……，再/然后……”': 'First …, then …',
  '介词“根据”': 'According to / based on',
  '数量重叠“数词+量词+数词+量词”': 'Little by little / two by two',
  '固定短语“在……看来”': 'In someone’s view',
  '固定短语“不一会儿”': 'In a moment',
  '并列复句“一会儿……，一会儿……”': 'One moment …, the next …',
  '介词“关于”': 'About / regarding',
  '固定短语“一般来说”': 'Generally speaking',
  '比较句（11）': 'More / fewer than',
  '介词“向”': 'Toward / to',
  '反问句“不是……吗？”': 'Isn’t it …?',
  '递进复句“……，更……”': 'Even more',
  '条件复句“只有……，才……”': 'Only if',
  概数表达法: 'Five or six',
  '“刚才”和“刚刚”': 'Just / just now',
  '条件复句“只要……，就……”': 'As long as',
  '固定格式“从……起”': 'From / starting'
};

function g(zh: string, en: string, examples: string[] = [], pattern = ''): BookTopicGuide {
  return { summary: en, pattern, examples: [], blocks: [{ zh, en, examples }] };
}

const guides: Record<string, BookTopicGuide> = {
  '固定短语“看上去/看起来”': g('固定短语“看上去”与“看起来”，可用来描述某人或某物的外观或状态。', 'The set phrases “看上去” and “看起来” can be used to describe the appearance or condition of a person or an object.', ['他们看上去有点儿像。', '这些菜看起来都很好吃。', '那个新来的老师看上去很年轻。']),
  '疑问代词的非疑问用法（1）': g('疑问代词“哪儿、什么、谁、哪”等用在陈述句中，表示不知道或不需要指明的地点、事物或人等。', 'Interrogative pronouns such as “哪儿”, “什么”, “谁”, and “哪” can be used in declarative sentences to indicate unspecified places, things, or people.', ['我好像在哪儿看到过这个箱子。', '你吃点儿什么再走吧。', '我们哪天一起去踢足球吧。']),
  多项定语: g('名词性中心语的前面可以同时有多个定语，这些定语一般按照时间/处所、动作/状态、特点的顺序进行排列，数量短语或指量短语位置比较灵活，可以放在表示动作或状态的定语的前面或者后面。', 'A nominal head can be modified by multiple attributives simultaneously. They are generally arranged in the order of time/location, action/state, and characteristic. The position of numeral-measure word phrases or demonstrative-measure word phrases is relatively flexible; they can be placed either before or after the attributive indicating an action or state.', ['李文是那个穿着黑衣服的短头发的年轻人吗？', '昨天和家月一起看电影的那个人是我的朋友。', '我那件新买的白色的衣服在哪儿？']),
  '并列复句“又……又……”': g('并列复句“又……又……”与形容词搭配使用，表示人或者事物同时具有两个特点。基本结构：又+形容词₁+又+形容词₂。', 'The coordinate complex sentence “又……又……” is used before adjectives to indicate that a person or thing possesses two characteristics at the same time. Basic structure: 又+Adjective₁+又+Adjective₂.', ['我现在还真是又饿又渴。', '那个女孩儿又高又漂亮。', '这个饭馆的菜又便宜又好吃。']),
  '疑问代词的非疑问用法（2）': g('疑问代词“哪、哪儿、什么、谁、怎么”等还可以用来表示任指，比如“谁”指任何一个人，“什么”指任何一件东西，句中常用副词“都”与之呼应。', 'Interrogative pronouns such as “哪”, “哪儿”, “什么”, “谁”, and “怎么” can also be used to express general reference. For example, “谁” refers to any person, while “什么” refers to any thing. The adverb “都” is often used in these sentences in combination with them.', ['哪个菜都好吃。', '这次旅游，我去哪儿都可以。', '我下午有时间，你想什么时候来都没问题。']),
  '疑问代词的非疑问用法（3）': g('两个相同的疑问代词可以表示任指，前后呼应，指同一个人、同一件事、同一种方式、同一个时间、同一个地点等。当前后两个分句的主语相同时，后一分句的主语可以省略。当前后两个分句的主语不同时，第二个主语要放在“就”的前面。', 'Two identical interrogative pronouns can be used for general reference. They echo each other and refer to the same person, the same thing, the same manner, the same time, or the same place. When the subjects of the two clauses are the same, the subject of the second clause may be omitted. When the subjects of the two clauses are different, the second subject should be placed before “就”.', ['你们想吃什么就点什么。', '你觉得哪个好看就买哪个。', '你想去哪儿，我们就去哪儿。']),
  '程度副词“挺”': g('程度副词“挺”用在形容词或心理动词前，表示程度较高，常用于口语中。基本结构：挺+形容词/心理动词+的。', 'The adverb of degree “挺” is used before adjectives or psychological verbs to indicate a relatively high degree. It is often used in colloquial speech. Basic structure: 挺+Adjective/Psychological Verb+的.', ['这个小区环境挺好的。', '这家饭馆的菜挺好吃的。', '买这个吧，我挺喜欢这个颜色的。']),
  '程度补语（1）': g('程度补语“坏了”用在形容词的后面，表示程度非常高，带有夸张的语气，常用在负面的情况中。', 'The complement of degree “坏了” is used after adjectives to indicate an extremely high degree, often with an exaggerated tone. It is typically used in negative situations.', ['我这几天忙坏了。', '我渴坏了，哪里能买水？', '这几天非常忙，大家都累坏了。']),
  '“就”和“才”': g('副词“就”和“才”用在动词前面作状语，“就”表示说话人认为动作发生得早，进行得快、顺利；“才”表示说话人认为动作发生得晚，进行得慢、不顺利。', 'The adverbs “就” and “才” are used as adverbials before verbs. “就” indicates that the speaker perceives the action as happening early, or progressing quickly and smoothly, while “才” indicates that the speaker perceives the action as happening late, progressing slowly, or not going smoothly.', ['中国银行很近，走路几分钟就能到。', '我下午要去医院，很晚才能回来。', '我早上五点就起床了。', '坐火车去北京，五个小时才能到。']),
  '固定格式“一……也/都+不/没……”': {
    summary: 'The fixed pattern “一……也/都+不/没……” expresses complete negation.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '固定格式“一……也/都+不/没……”表示完全否定。',
        en: 'The fixed pattern “一……也/都+不/没……” expresses complete negation.',
        examples: ['她一件衣服都不想买。', '我一个中国电影也没看过。']
      },
      {
        zh: '有时候，上面的“一+量词”还可以用“一点儿”来表示。',
        en: 'Sometimes, “一+Measure Word” can be replaced by “一点儿”.',
        examples: ['我一点儿东西也不想吃。', '他对打球一点儿兴趣（xìngqù, interest）都没有。']
      },
      {
        zh: '当谓语是形容词时，通常用“一点儿也/都+不/没+形容词”表示完全否定。',
        en: 'When the predicate is an adjective, the pattern “一点儿也/都+不/没+Adjective” is commonly used to express complete negation.',
        examples: ['草原一点儿也不冷。', '他们一点儿也没着急。']
      }
    ]
  },
  '比较句（9）': g('比较句“A跟B一样”表示A和B比较后，结果相同。“一样”的后面可以用形容词表示比较的某一方面，基本结构：A跟B一样+形容词。否定形式是在“一样”的前面加“不”。', 'The comparative sentence “A跟B一样” indicates that A and B are the same after comparison. The word “一样” can be followed by an adjective to specify the aspect being compared. Basic structure: A跟B一样+Adjective. In the negative form, “不” is placed before “一样”.', ['这家宾馆跟别的都不一样。', '他买的新手机跟我的一样。', '这个房间跟那个房间一样大。']),
  '固定格式“除了……（以外），……都/还/也……”': {
    summary: 'The pattern “除了……（以外），……都……” indicates that within a certain scope, a part is excluded, while all the others share the same situation. The word “以外” can be omitted.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '“除了……（以外），……都……”表示在一个范围内，排除一部分，其他的都存在相同的情况，其中“以外”可以省略。',
        en: 'The pattern “除了……（以外），……都……” indicates that within a certain scope, a part is excluded, while all the others share the same situation. The word “以外” can be omitted.',
        examples: ['除了我以外，大家都在玩手机。', '除了这个汉字，别的汉字我都会写。']
      },
      {
        zh: '“除了……（以外），……还/也……”表示排除一部分，补充其他的。句子的主语放在句首，或者放在“还/也”的前面。',
        en: 'The pattern “除了……（以外），……还/也……” indicates excluding a part and adding others. The subject is placed at the beginning of the sentence or before “还/也”.',
        examples: ['除了这个行李箱以外，还有别的东西吗？', '除了唱歌以外，他也喜欢跳舞。']
      }
    ]
  },
  '程度补语（2）': g('程度补语“得很”用在形容词后面，表示程度高，一般用于口语。', 'The complement of degree “得很” is used after an adjective to indicate a high degree. It is commonly used in colloquial speech.', ['现在天气好得很。', '房间里面热得很。', '我觉得爬山累得很。']),
  量词重叠: g('汉语中很多量词可以重叠，用来强调在某个范围内的每个成员都具有某种特征，后面一般用“都”。', 'In Chinese, many measure words can be reduplicated to emphasize that each member within a certain scope has a certain characteristic. The word “都” is usually used after them.', ['这些照片张张都非常好看。（=每张照片都非常好看。）', '这些苹果个个都很大。（=每个苹果都很大。）', '我想出去拍照，但是天天下雨。（=每天都下雨。）']),
  '存现句（3）': g('汉语中，叙述某个处所有人、事物出现或消失，可以用存现句。基本结构：处所词语+动词+趋向补语/结果补语+（动态助词）+数量短语+人/物。', 'In Chinese, existential sentences are used to describe the appearance or disappearance of people or things in a certain place. Basic structure: Locative Word/Phrase+Verb+Complement of Direction/Complement of Result+(Aspect Particle)+Numeral-Measure Word Phrase+Person/Thing.', ['后边走过去两个人。', '前面开过来很多车。', '楼上下来几个人。']),
  '紧缩复句“……了……就……”': g('紧缩复句“……了……就……”表示两个动作行为紧接着发生。如果第二个动作行为也已经完成，则需要在句尾再加一个“了”。基本结构：动词₁+了……就+动词₂……。', 'The contracted complex sentence “……了……就……” indicates that two actions occur in immediate succession. If the second action is also completed, another “了” should be added at the end of the sentence. Basic structure: Verb₁+了……就+Verb₂…….', ['你听完了音乐会就来我家吃饭。', '我吃了早饭就去学校了。', '昨天我们下了课就回家了。']),
  '固定格式“该……了”': g('固定格式“该……了”表示到了需要做某事的时候，多在口语中使用。', 'The fixed pattern “该……了” indicates that it is time to do something, and it is often used in colloquial speech.', ['咱们该买去上海的票了。', '八点了，该上课了。', '已经很晚了，我该睡觉了。']),
  '假设复句“如果……，就……”': g('假设复句“如果……，就……”中，“如果”后面的分句是一个假设，“就”后面的分句是在这种假设情况下产生的结果。注意，第二个分句的主语要放在“就”的前面。', 'In the hypothetical complex sentence “如果……，就……”, the clause following “如果” is a hypothesis, while the clause following “就” is the result under that condition. Note that the subject of the second clause is placed before “就”.', ['如果没走错，二十分钟以前就到了。', '如果你需要帮忙，就给我打电话。', '如果有时间，我就去上海玩几天。']),
  '固定短语“越来越”': g('固定短语“越来越”的后面加上形容词或心理动词，表示随着时间的推移而在程度上发生变化。形容词或心理动词前都不能再加程度副词。', 'The set phrase “越来越” is followed by an adjective or a psychological verb, indicating a change in degree over time. No adverb of degree can be added before the adjective or psychological verb.', ['前面的人越来越多。', '我越来越喜欢这里的生活（shēnghuó, life）了。', '她越来越高，也越来越漂亮了。']),
  '连动句（2）': g('动态助词“着”用于连动句的第一个动词后面，表示进行第二个动作时的状态或方式。基本结构：动词₁+着+（宾语₁）+动词₂+（宾语₂）。', 'The aspect particle “着” is used after the first verb in a serial verb sentence to indicate the state or manner of the second action. Basic structure: Verb₁+着+(Object₁)+Verb₂+(Object₂).', ['咱们可以走着去。', '弟弟吃着苹果写作业。', '他们坐着看电视。']),
  '比较句（10）': g('“A不比B+形容词”的意思是A和B差不多。这个结构通常用于强调两者情况接近，或反驳别人说法的语境中。', 'The pattern “A不比B+Adjective” means that A and B are about the same. It is often used to emphasize that the two situations are close, or to refute someone else’s statement.', ['裙子不比短裤贵多少。', '他的中文不比你好。', '他跑得不比我快多少。']),
  '程度补语（3）': g('程度补语“极了”用在形容词或心理动词后面，表示人或事物的性质或者状态，或人的心理感受达到很高的程度。', 'The complement of degree “极了” is used after an adjective or a psychological verb to indicate that the nature or state of a person or thing, or a person’s psychological feeling, reaches a very high degree.', ['这块冰西瓜甜极了。', '今年夏天热极了。', '这本书我喜欢极了。']),
  '递进复句“不但……，而且……”': g('递进复句“不但……，而且……”连接两个分句，表示递进关系。如果两个分句的主语相同，那么“不但”要放在第一个主语后面；如果两个分句的主语不同，那么“不但”要放在第一个主语的前面。', 'The progressive complex sentence “不但……，而且……” connects two clauses to indicate a progressive relationship. If the subjects of the two clauses are the same, “不但” is placed after the first subject. If the subjects of the two clauses are different, “不但” should be placed before the first subject.', ['现在的电视不但便宜，而且用着非常方便。', '家月不但喜欢唱歌，而且唱得很好听。', '不但家月会说汉语，而且天中也会说汉语。']),
  '趋向补语的引申用法（1）': g('趋向补语“下去”用在动词或形容词后面，表示已经开始的动作或者状态还要继续。', 'When the complement of direction “下去” is used after a verb or an adjective, it indicates that an action or a state that has already started is to continue.', ['我今年胖了十多斤，不能再胖下去了。', '她读完了第一个问题，后面的你读下去。', '这几天太热了，如果再热下去就不能出门了。']),
  '离合词（2）': g('离合词一般不能直接加宾语。使用离合词的句子中如果有补语，一般都放在离合词的中间。', 'Separable words generally cannot directly take an object. If there is a complement in a sentence with a separable word, it is generally placed between the two parts of the separable word.', ['昨天游完泳以后，我的耳朵一直有点儿疼。', '今年夏天只下了两次雨。', '小张下个月跟他女朋友结婚。']),
  '时量补语（2）': g('时量补语用在动词的后面，表示动作或者状态持续时间的长短。有些动词不能持续，这时动词后的时量补语表示动作从完成到说话时过了多长时间。', 'The complement of duration is used after a verb to indicate the duration of actions or states. For non-durative verbs, the complement of duration following the verb indicates how long it has been from the completion of the action up to the moment of speaking.', ['我上次来医院已经过去差不多两年了。', '她回家两个月了。', '开学已经三个多星期了。']),
  '固定格式“……以前/以后/前/后”': g('“时间/事件+以前/前”表示某个时间或事件之前；“时间/事件+以后/后”表示某个时间或事件之后。', '“Time/Event+以前/前” indicates the time before a certain time or event. “Time/Event+以后/后” indicates the time after a certain time or event.', ['这种药需要每天睡前吃一次。', '我们决定下班后一起去看个电影。', '考完试以后，咱们一起去旅游吧。']),
  '目的复句“为了……，……”': g('目的复句“为了……，……”中，“为了”后面的小句表示目的，另一个小句表示为了达到目的采取的行动。', 'In the purpose complex sentence “为了……，……”, the clause following “为了” indicates the purpose, while the other clause indicates the action taken to achieve that purpose.', ['听说为了准备运动会，你们几个男生每天都练球。', '为了考上大学，她每天努力（nǔlì, hard-working）学习。', '为了早点儿到家，我打算坐飞机回去。']),
  可能补语: g('在动词和结果补语或趋向补语之间插入“得”或“不”构成可能补语，表示条件是否容许实现某种结果或趋向。肯定形式是“动词+得+补语”，否定形式是“动词+不+补语”，疑问形式是“动词+得+补语+动词+不+补语”或者“动词+得+补语+吗”。', 'Inserting “得” or “不” between a verb and a complement of result or complement of direction forms a complement of potentiality. This indicates whether a condition allows a particular result or direction to be realized. The affirmative form is “Verb+得+Complement”, the negative form is “Verb+不+Complement”, and the interrogative forms are “Verb+得+Complement+Verb+不+Complement” or “Verb+得+Complement+吗”.', ['打不好没关系。', '这本书你看得懂看不懂？', '你只有一个星期的时间，学得会游泳吗？']),
  '固定格式“越A越B”': g('固定格式“越A越B”的句子中，A和B可以都是动词性短语或形容词性短语，也可以一个是动词性短语，另一个是形容词性短语，表示B随着A的变化而变化。', 'In the fixed pattern “越A越B”, A and B can both be verbal phrases or adjectival phrases; or one can be a verbal phrase and the other an adjectival phrase. This pattern indicates that B changes along with the change of A.', ['今天的足球比赛我越看越着急。', '妈妈越说，他越不高兴。', '我想认识中国朋友，越多越好。']),
  '“把”字句（1）': g('“把”字句表示对确定的人或事物做出相应的动作，使其发生位置上的改变，否定副词“不/没”和能愿动词应该放在“把”字的前面。基本结构：主语+（不/没/能愿动词）+把+宾语+动词+在/到+地点。', 'The “把” sentence indicates performing an action on a definite person or thing, resulting in a change in position. Adverbs of negation “不/没” and modal verbs should be placed before “把” in a sentence. Basic structure: Subject+(不/没/Modal Verb)+把+Object+Verb+在/到+Location.', ['我会把这些题都记在本子上。', '老师把作业本放到桌子上了。', '你不能把名字写在这里。']),
  '固定格式“在……上/中/下”': {
    summary: 'The fixed pattern “在……上/中/下”, formed by the preposition “在” and the positional words “上”, “中”, and “下”, can indicate scope, time, condition, and so on.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '介词“在”和方位词“上”“中”“下”组成的“在……上/中/下”格式可表示范围、时间、条件等。',
        en: 'The fixed pattern “在……上/中/下”, formed by the preposition “在” and the positional words “上”, “中”, and “下”, can indicate scope, time, condition, and so on.',
        examples: []
      },
      {
        zh: '“在+名词/名词性短语+上”表示范围、方面。',
        en: 'The pattern “在+Noun/Nominal Phrase+上” indicates scope or aspect.',
        examples: ['在学习上，遇到什么问题都可以问我。', '在工作上，他总是能给我很多帮助。']
      },
      {
        zh: '“在……中”表示动作发生或状态存在的环境、时间等。',
        en: 'The pattern “在……中” indicates the environment or time in which an action takes place or a state exists.',
        examples: ['在比赛中，他得分最高。', '在假期中，我认识了几个新朋友。']
      },
      {
        zh: '“在+有定语的双音节动词+下”表示条件。',
        en: 'The pattern “在+Disyllabic Verbs with Attributives+下” indicates a condition.',
        examples: ['在她的影响下，我开始喜欢拍照。', '在老师的帮助下，我的成绩提高很快。']
      }
    ]
  },
  '“把”字句（2）': g('“把”字句表示通过动作使确定的事物发生关系上的转移。基本结构：主语+把+宾语₁+动词+给+宾语₂。', 'The “把” sentence indicates the relational transfer of a definite thing through an action. Basic structure: Subject+把+Object₁+Verb+给+Object₂.', ['你明天再把书还给我。', '我把礼物送给她了。', '请你把这本书带给老师。']),
  '“还是”和“或者”': {
    summary: '“还是” is typically used in interrogative sentences to present two or more options, asking the listener to choose one.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '“还是”一般用在疑问句中，提出两个或多个选项，希望对方从中做出选择。',
        en: '“还是” is typically used in interrogative sentences to present two or more options, asking the listener to choose one.',
        examples: ['我们用会议室的电脑还是自己的笔记本电脑？', '我们今天去、明天去还是后天去？']
      },
      {
        zh: '“或者”主要用在陈述句中，不能用在疑问句中。',
        en: '“或者” is usually used in declarative sentences, not in interrogative ones.',
        examples: ['会议室的电脑或者自己的电脑都可以。', '你可以坐地铁或者打车去学校。']
      }
    ]
  },
  '固定短语“看来”': g('固定短语“看来”后面加上一个结论，表示说话人通过观察、思考后，对当前情况的分析或推测。', 'The set phrase “看来” is used to introduce a conclusion expressing the speaker’s analysis or inference of the current situation, based on observation or reflection.', ['看来我没办法解决这个问题。', '这么晚了，看来他今天不会来了。', '电梯坏了，看来咱们只能走下去了。']),
  '“把”字句（3）': g('“把”字句表示动作对确定的人或事物产生某种结果。基本结构：“主语+把+宾语+动词+结果补语”。', 'The “把” sentence is used to indicate that an action performed on a definite person or thing produces a certain result. Basic structure: Subject+把+Object+Verb+Complement of Result.', ['我跟您一起把这些工作做完。', '妈妈把衣服洗干净了。', '他还没把笔记本电脑接好呢。']),
  '固定格式“对……来说”': g('固定格式“对……来说”指明观点、感受或情况所属的对象。', 'The fixed pattern “对……来说” indicates the person or group to whom a viewpoint, feeling, or situation applies.', ['对我来说，生活也很重要，我不愿意为工作或学习离开家人。', '对她来说，学习汉语很有意思。', '对孩子来说，玩也是一种学习。']),
  '选择复句“或者……，或者……”': g('选择复句“或者……，或者……”表示在两个或多个可能的选项中选择一个，多用于口语。', 'The alternative complex sentence “或者……，或者……” indicates a choice between two or more possibilities. It is commonly used in colloquial speech.', ['或者明天去，或者后天去，我给你打电话。', '我们或者今天去电影院看电影，或者明天在家看电影。', '晚饭你自己选，或者吃中国菜，或者吃日本菜，或者吃泰国菜。']),
  '趋向补语的引申用法（2）': g('趋向补语“起来”用在动词或形容词后，表示动作开始进行或进入一个新的状态。如果动词带宾语，宾语应该在“起”和“来”的中间。', 'The complement of direction “起来” is used after a verb or an adjective to indicate the start of an action or the entry into a new state. If the verb takes an object, the object should be placed between “起” and “来”.', ['雨已经下起来了。', '最近天气热起来了。', '怎么突然刮起风来了？']),
  '范围副词“就”': {
    summary: 'The adverb of scope “就” is used before a verb accompanied by a numeral-measure word to indicate that the speaker considers the quantity to be small, the degree low, or the duration short.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '范围副词“就”用在带有数量词的动词前面，表示说话人认为数量少、程度轻、时间短等意义。',
        en: 'The adverb of scope “就” is used before a verb accompanied by a numeral-measure word to indicate that the speaker considers the quantity to be small, the degree low, or the duration short.',
        examples: ['北京常常下雪，但听说今年就下了一次。', '他昨天就看了十分钟书。']
      },
      {
        zh: '“就”用在名词或名词性主语前，表示例外情况。',
        en: '“就” is placed before a noun or a nominal subject to indicate an exception.',
        examples: ['我每天书包里都放着雨伞，就今天没带。', '你们点的菜都挺好吃的，就我点的这个菜不太好吃。']
      }
    ]
  },
  '趋向补语的引申用法（3）': g('趋向补语“下来”用在动词后，表示完成一个费时、费力、需要克服一定困难的动作行为。', 'The complement of direction “下来” is used after a verb to indicate the completion of an action requiring considerable time, effort, or the overcoming of difficulties.', ['这一年多住下来，我还是更喜欢北京的四季。', '这半年练下来，他画画的水平提高了不少。', '5000米的长跑比赛，没想到我跑下来了。']),
  '假设复句“……的话，就……”': g('假设复句“……的话，就……”中，前一分句表示假设的情况，后一分句表示产生的结果或得出的结论，多用于口语。', 'In the hypothetical complex sentence “……的话，就……”, the first clause presents a hypothetical situation, while the second clause expresses the result or conclusion. It is mainly used in colloquial speech.', ['你们有时间的话，就来我家做客。', '你觉得满意的话，咱们就买。', '明天天气好的话，我就去爬山。']),
  '“把”字句（4）': g('“把”字句的动词后使用趋向补语或状态补语，表示动作对确定的人或事物产生位置或者状态变化的影响。基本结构：主语+把+宾语+动词+趋向补语/状态补语。', 'In a “把” sentence, a complement of direction or a complement of state is used after the verb to indicate that the action causes a change in the position or state of a definite person or thing. Basic structure: Subject+把+Object+Verb+Complement of Direction/Complement of State.', ['你把声音开得太大了。', '他把球踢进去了吗？', '你把字写得太小了，我看不清楚。']),
  '并列复句“一边……，一边……”': g('并列复句“一边……，一边……”表示两个动作同时进行，可以紧缩为“边……边……”。', 'The coordinate complex sentence “一边……，一边……” indicates that two actions take place simultaneously. It can be shortened to “边……边……”.', ['咱们一边吃蛋糕，一边聊天儿吧。', '我喜欢一边跑步，一边听音乐。', '你不应该边开车边打电话。']),
  '被动句（1）': g('汉语中用带“被”字的句子表达被动意义，突出主语受到了某个动作的影响，语气常带有被动、无奈、负面等色彩。副词和能愿动词放在“被”字前面，“被”字后面的宾语可以省略。基本结构：主语+被+宾语+动词+其他成分。', 'In Chinese, sentences with “被” express the passive voice, emphasizing that the subject is affected by an action. These sentences often convey a sense of passivity, helplessness, or negativity. Adverbs and modal verbs are placed before “被”, and the object following “被” can be omitted. Basic structure: Subject+被+Object+Verb+Other Elements.', ['这本书被别人借走了。', '水果可能被弟弟吃了。', '我们俩经常被叫错名字。']),
  '承接复句“先……，再/然后……”': g('承接复句“先……，再/然后……”中，两个分句表示动作的先后顺序。', 'In a successive complex sentence “先……，再/然后……”, the clauses indicate the chronological order of actions.', ['我要先去图书馆借书，然后去游泳。', '你先去买门票，再来这里找我。', '你们先回房间休息一会儿，然后再出来吃晚饭。']),
  '固定格式“X什么（啊）”': {
    summary: 'The fixed pattern “X什么（啊）” is often used to dismiss someone’s concerns or doubts, or to emphasize a fact. It carries a tone of refutation or reassurance.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '固定格式“X什么（啊）”通常用于否定对方的担忧、疑问或强调事实，带有反驳或安慰的语气。',
        en: 'The fixed pattern “X什么（啊）” is often used to dismiss someone’s concerns or doubts, or to emphasize a fact. It carries a tone of refutation or reassurance.',
        exampleLabel: '朗读对话 · Read the dialogues aloud',
        examples: [
          {
            a: '一想到要在校长、老师和那么多同学面前表演，我就有些紧张。',
            b: '紧张什么啊，我们都喜欢听你唱歌，你要相信自己。'
          },
          { a: '我最近胖了很多，不想拍照了。', b: '胖什么啊，你看起来不胖也不瘦。' },
          { a: '还有十分钟，快点儿走吧。', b: '急什么啊，马上就到了。' }
        ]
      }
    ]
  },
  '介词“根据”': g('介词“根据”在句子中引出事情的依据或理由。', 'The preposition “根据” is used to introduce the basis or reason for an action in a sentence.', ['这几年小区根据他们的需要，有了很多变化。', '根据要求，我们必须参加明天的会议。', '老师根据每个学生的兴趣，选择了不一样的书。']),
  '数量重叠“数词+量词+数词+量词”': g('数量短语可以重叠，重叠后可作状语，一般表示动作的方式，有形象化的作用。基本结构：数词+量词+数词+量词+（地）+动词。', 'Numeral-measure word phrases can be reduplicated and used as adverbials. The reduplication usually indicates the manner of an action and adds a vivid, descriptive effect. Basic structure: Numeral+Measure Word+Numeral+Measure Word+(地)+Verb.', ['我得一点儿一点儿给您讲。', '学生们的汉语水平一天一天地提高了。', '他们两个两个地走进去了。']),
  '固定短语“在……看来”': g('固定短语“在……看来”表示个人或某个群体的观点。', 'The set phrase “在……看来” is used to express the viewpoint of an individual or a group.', ['在我们中国人看来，黄河像妈妈一样，养了我们几千年。', '在同事们看来，她工作非常认真。', '在我看来，每天读书是一种很好的习惯。']),
  '固定短语“不一会儿”': g('固定短语“不一会儿”表示很短的时间，在句中作状语，多用于口语。', 'The set phrase “不一会儿” means “in a short while”. It functions as an adverbial in sentences and is commonly used in colloquial speech.', ['难过的事情不一会儿就忘了。', '不一会儿，张校长就来了。', '两个小时看起来长，但是不一会儿就过去了。']),
  '并列复句“一会儿……，一会儿……”': g('并列复句“一会儿……，一会儿……”表示短时间内发生的不同动作，或者一种对立的情况。', 'The coordinate complex sentence “一会儿……，一会儿……” indicates different actions occurring within a short period, or alternating states.', ['它一会儿在你脚边睡觉，一会儿在你身上爬。', '他一会儿进来，一会儿出去，忙得很。', '最近天气变化很快，一会儿冷，一会儿热。']),
  '介词“关于”': g('介词“关于”后面加名词，引出涉及的对象。', 'The preposition “关于” is typically followed by a noun to introduce a topic or subject.', ['关于这个问题，我得慢慢给你讲。', '关于他的要求，我们还要开会以后再决定。', '关于比赛的时间，我明天一定告诉大家。']),
  '固定短语“一般来说”': g('“一般来说”是一个固定短语，意思是大多数情况下是这样，常用于句子的开头。', '“一般来说” is a set phrase that means “generally speaking” or “in most cases”. It is often used at the beginning of a sentence.', ['一般来说，熊猫每天要睡很多次觉。', '一般来说，这种树每年开一次花。', '一般来说，学习外语需要多练习。']),
  '比较句（11）': g('用“比”表示的比较句中，谓语为一般动词时，前面可以用“多、少、早、晚”，表示两者在数量或时间上的差异。基本结构：A比B+多/少/早/晚+动词+数量短语。', 'In comparative sentences using “比”, when the predicate is a general verb, “多”, “少”, “早”, or “晚” can be placed before the verb to indicate a difference in quantity or time between two things. Basic structure: A比B+多/少/早/晚+Verb+Numeral-Measure Word Phrase.', ['冬天比夏天早关门一个小时。', '哥哥比弟弟多吃了三个饺子。', '我比他晚到了十分钟。']),
  '介词“向”': g('介词“向”后加代词、名词或名词性短语，表示动作的方向或对象。', 'The preposition “向” is followed by a pronoun, noun, or nominal phrase to indicate the direction or target of an action.', ['别再向前走了。', '以后我要多向认真的人学习。', '孩子一看见妈妈，就向她跑过去了。']),
  '反问句“不是……吗？”': g('反问句“不是……吗？”一般用来表达说话人的不理解或者不满，有时候也表示提醒或确认等。否定形式表达肯定的意思。', 'The rhetorical question “不是……吗？” is generally used to express the speaker’s confusion or dissatisfaction, and sometimes to remind or confirm. It is negative in form but expresses an affirmative meaning.', ['你不是喜欢玩电脑吗？你可以去看看跟电脑有关系的书。', '你不是说今天有事吗？为什么来了？', '考试不是下个月吗？你怎么今天就开始复习了？']),
  '递进复句“……，更……”': g('递进复句“……，更……”中，第二个分句表示程度上更深一层。', 'In a progressive complex sentence “……，更……”, the second clause expresses a deeper degree of meaning.', ['我还没想好学什么，更没想好去哪个国家。', '想提高中文水平要多听多看，更要多说多练。', '来中国学习，我学会了中文，更了解了中国文化。']),
  '条件复句“只有……，才……”': g('条件复句“只有……，才……”中，“只有”后面是实现结果的唯一条件，没有这个条件就不会产生“才”后面的结果。', 'In a conditional complex sentence “只有……，才……”, the clause following “只有” presents the sole condition for the result. Without this condition, the result after “才” cannot occur.', ['只有想清楚自己真正喜欢什么，才能做出最合适的选择。', '只有每天锻炼身体，才会越来越健康。', '只有多听、多说、多看，你的中文水平才能提高。']),
  概数表达法: g('汉语中相邻的两个数字连用，表示不确定的数量。', 'In Chinese, two adjacent numbers used together indicate an approximate quantity.', ['春节大概放七八天假。', '教室里来了五六个学生。', '这些照片是三四年前照的吧？']),
  '“刚才”和“刚刚”': {
    summary: '“刚才” is a time noun that refers to the immediate past, usually just a few minutes ago. It can be placed at the beginning of a sentence, or between the subject and the verb.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '“刚才”是时间名词，表示很短的时间以前，一般来说就是几分钟以前。“刚才”可以放在句首，也可以放在主语后面，动词前面。',
        en: '“刚才” is a time noun that refers to the immediate past, usually just a few minutes ago. It can be placed at the beginning of a sentence, or between the subject and the verb.',
        examples: ['刚才的电话是我妈妈打来的。', '我刚才看过一遍，不想再看了。']
      },
      {
        zh: '“刚刚”是时间副词，表示对说话人来说事情发生的时间不长，可能是几分钟、几天甚至几个月。“刚刚”应该放在主语后面，动词前面。',
        en: '“刚刚” is an adverb of time indicating that an event happened not long ago from the speaker’s perspective. It could be minutes, days, or even months ago. It is placed after the subject, before the verb.',
        examples: ['我刚刚看视频学会了包饺子。', '他刚刚来北京两个月。']
      }
    ]
  },
  '条件复句“只要……，就……”': g('“只要……，就……”中，“只要”后面是所需要的充分条件，有这个条件就能产生“就”后面的结果。主语可以放在“只要”前，也可以放在“只要”后。如果句子有两个主语，第二个主语要放在“就”前面。', 'In the conditional complex sentence “只要……，就……”, the clause after “只要” presents a sufficient condition that guarantees the result following “就”. The subject can be placed either before or after “只要”. If there are two subjects, the second subject must be placed before “就”.', ['我只要几天不跟他视频，就很想他。', '只要你同意，我们就这么决定了。', '只要你坚持每天早睡，身体就一定会好起来。']),
  '固定格式“从……起”': g('固定格式“从……起”有“从……开始”的意思，多表示时间。常用在句首，作状语。', 'The fixed pattern “从……起” means “从……开始” (starting from...) and is often used to indicate time. It is usually placed at the beginning of a sentence as an adverbial.', ['他从那时起就努力学习。', '从那天起，我们就变成了好朋友。', '从那次旅游起，我对中国文化更有兴趣了。'])
};

export function getHsk3TopicGuide(title: string): BookTopicGuide | undefined {
  return guides[title.split(' · ')[0]];
}

export const hsk3ChineseExplanations: Record<string, string> = {};
export const hsk3TopicTables: Record<string, TopicTable[]> = {};
