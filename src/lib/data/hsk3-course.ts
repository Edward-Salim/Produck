import type { BookTopicGuide, ClassroomTopic, Lesson, TopicTable } from './hsk1-course.js';

const c = (...classroom: string[]) => classroom;

export const hsk3Lessons: Lesson[] = [
  { number: 1, hanzi: '我们去机场接你们', pinyin: 'Wǒmen qù jīchǎng jiē nǐmen', title: 'We will pick you up at the airport', page: '001', classroom: c('固定短语“看上去/看起来” · Set Phrases “看上去/看起来”', '疑问代词的非疑问用法（1） · Non-Interrogative Use of Interrogative Pronouns (1)', '多项定语 · Multiple Attributives') },
  { number: 2, hanzi: '你们想吃什么就点什么', pinyin: 'Nǐmen xiǎng chī shénme jiù diǎn shénme', title: 'You can order whatever you feel like', page: '010', classroom: c('并列复句“又……又……” · Coordinate Complex Sentence “又……又……”', '疑问代词的非疑问用法（2） · Non-Interrogative Use of Interrogative Pronouns (2)', '疑问代词的非疑问用法（3） · Non-Interrogative Use of Interrogative Pronouns (3)') },
  { number: 3, hanzi: '这个小区挺好的', pinyin: 'Zhège xiǎoqū tǐng hǎo de', title: 'This neighborhood is pretty nice', page: '019', classroom: c('程度副词“挺” · Adverb of Degree “挺”', '程度补语（1） · Complement of Degree (1)', '“就”和“才” · Comparison of “就” and “才”') },
  { number: 4, hanzi: '这家宾馆跟别的都不一样', pinyin: 'Zhè jiā bīnguǎn gēn biéde dōu bù yíyàng', title: 'This hotel is unlike any other', page: '029', classroom: c('固定格式“一……也/都+不/没……” · Fixed Pattern “一……也/都+不/没……”', '比较句（9） · Comparative Sentences (9)', '固定格式“除了……（以外），还/也……” · Fixed Pattern “除了……（以外），还/也……”') },
  { number: 5, hanzi: '这样的照片才好看', pinyin: 'Zhèyàng de zhàopiàn cái hǎokàn', title: 'Photos like these are the best', page: '038', classroom: c('程度补语（2） · Complement of Degree (2)', '量词重叠 · Reduplication of Measure Words', '存现句（3） · Existential Sentences (3)', '紧缩复句“……了……就……” · Contracted Complex Sentence “……了……就……”') },
  { number: 6, hanzi: '高铁上还可以点外卖', pinyin: 'Gāotiě shàng hái kěyǐ diǎn wàimài', title: 'You can even order takeout on a high-speed train', page: '047', classroom: c('固定格式“该……了” · Fixed Pattern “该……了”', '假设复句“如果……，就……” · Hypothetical Complex Sentence “如果……，就……”', '固定短语“越来越” · Set Phrase “越来越”') },
  { number: 7, hanzi: '那条裙子比短裤更好看', pinyin: 'Nà tiáo qúnzi bǐ duǎnkù gèng hǎokàn', title: 'That skirt looks better than the shorts', page: '057', classroom: c('连动句（2） · Serial Verb Sentences (2)', '比较句（10） · Comparative Sentences (10)', '程度补语（3） · Complement of Degree (3)', '递进复句“不但……，而且……” · Progressive Complex Sentence “不但……，而且……”') },
  { number: 8, hanzi: '今天我出院了', pinyin: 'Jīntiān wǒ chūyuàn le', title: 'Today I was discharged from the hospital', page: '067', classroom: c('趋向补语的引申用法（1） · Extended Use of the Complement of Direction (1)', '离合词（2） · Separable Words (2)', '时量补语（2） · Complement of Duration (2)', '固定格式“……以前/以后/前/后” · Fixed Pattern “……以前/以后/前/后”') },
  { number: 9, hanzi: '打不好没关系', pinyin: 'Dǎ bù hǎo méi guānxi', title: "It doesn’t matter if you don’t play well", page: '076', classroom: c('目的复句“为了……” · Purpose Complex Sentence “为了……”', '可能补语 · Complement of Potentiality', '固定格式“越A越B” · Fixed Pattern “越A越B”') },
  { number: 10, hanzi: '你明天再把书还给我', pinyin: 'Nǐ míngtiān zài bǎ shū huán gěi wǒ', title: 'You can return the book to me tomorrow', page: '086', classroom: c('“把”字句（1） · “把” Sentence (1)', '固定格式“在……上/中/下” · Fixed Pattern “在……上/中/下”', '“把”字句（2） · “把” Sentence (2)') },
  { number: 11, hanzi: '看来我没办法解决这个问题', pinyin: 'Kànlái wǒ méi bànfǎ jiějué zhège wèntí', title: 'It seems I can’t solve this problem', page: '095', classroom: c('“还是”和“或者” · Comparison of “还是” and “或者”', '固定短语“看来” · Set Phrase “看来”', '“把”字句（3） · “把” Sentence (3)', '固定格式“对……来说” · Fixed Pattern “对……来说”') },
  { number: 12, hanzi: '这个季节天气变化很快', pinyin: 'Zhège jìjié tiānqì biànhuà hěn kuài', title: 'The weather changes rapidly in this season', page: '104', classroom: c('选择复句“或者……，或者……” · Alternative Complex Sentence “或者……，或者……”', '趋向补语的引申用法（2） · Extended Use of the Complement of Direction (2)', '范围副词“就” · Adverb of Scope “就”', '趋向补语的引申用法（3） · Extended Use of the Complement of Direction (3)') },
  { number: 13, hanzi: '我的新邻居来自英国', pinyin: 'Wǒ de xīn línjū láizì Yīngguó', title: 'My new neighbors come from the UK', page: '115', classroom: c('假设复句“……的话，就……” · Hypothetical Complex Sentence “……的话，就……”', '“把”字句（4） · “把” Sentence (4)', '并列复句“一边……，一边……” · Coordinate Complex Sentence “一边……，一边……”') },
  { number: 14, hanzi: '这本书被别人借走了', pinyin: 'Zhè běn shū bèi biérén jiè zǒu le', title: 'This book is checked out', page: '124', classroom: c('被动句（1） · Passive Sentences (1)', '承接复句“先……，再/然后……” · Successive Complex Sentence “先……，再/然后……”', '固定格式“X什么（啊）” · Fixed Pattern “X什么（啊）”') },
  { number: 15, hanzi: '我是半个南京人', pinyin: 'Wǒ shì bàn ge Nánjīng rén', title: 'I am basically half a Nanjing local', page: '133', classroom: c('介词“根据” · Preposition “根据”', '数量重叠“数词+量词+数词+量词” · Reduplication of Numeral-Measure Word Phrases', '固定短语“在……看来” · Set Phrase “在……看来”', '固定短语“不一会儿” · Set Phrase “不一会儿”') },
  { number: 16, hanzi: '我听说有的熊猫出国了', pinyin: 'Wǒ tīngshuō yǒude xióngmāo chūguó le', title: 'I heard that some pandas have gone abroad', page: '144', classroom: c('并列复句“一会儿……，一会儿……” · Coordinate Complex Sentence “一会儿……，一会儿……”', '介词“关于” · Preposition “关于”', '固定短语“一般来说” · Set Phrase “一般来说”', '比较句（11） · Comparative Sentences (11)') },
  { number: 17, hanzi: '我要多向认真的人学习', pinyin: 'Wǒ yào duō xiàng rènzhēn de rén xuéxí', title: 'I will learn from people who are careful', page: '154', classroom: c('介词“向” · Preposition “向”', '反问句“不是……吗？” · Rhetorical Question “不是……吗？”', '递进复句“……，更……” · Progressive Complex Sentence “……，更……”', '条件复句“只有……，才……” · Conditional Complex Sentence “只有……，才……”') },
  { number: 18, hanzi: '我学会了包饺子', pinyin: 'Wǒ xuéhuì le bāo jiǎozi', title: "I’ve learned how to make jiaozi", page: '163', classroom: c('概数表达法 · Approximate Numbers', '“刚才”和“刚刚” · Comparison of “刚才” and “刚刚”', '条件复句“只要……，就……” · Conditional Complex Sentence “只要……，就……”', '固定格式“从……起” · Fixed Pattern “从……起”') }
];

export const hsk3ClassroomTopics: ClassroomTopic[] = hsk3Lessons.flatMap((lesson) => lesson.classroom.map((title) => ({ title, lesson })));

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
  '固定格式“除了……（以外），还/也……”': g('固定格式“除了……（以外），还/也……”表示在已有的人或事物之外还有其他的人或事物。', 'The fixed pattern “除了……（以外），还/也……” indicates that something additional exists beyond what has already been mentioned.', ['除了这个小区以外，我还看了两个。']),
  '程度补语（2）': g('程度补语“得很”用在形容词后面，表示程度高，一般用于口语。', 'The complement of degree “得很” is used after an adjective to indicate a high degree and is common in colloquial speech.', ['现在天气好得很。', '房间里面热得很。']),
  量词重叠: g('汉语中很多量词可以重叠，用来强调某个范围内的每个成员都具有某种特征，后面一般用“都”。', 'Many measure words can be reduplicated to emphasize that every member within a scope has a certain characteristic, generally followed by “都”.', ['张张照片都很好看。']),
  '存现句（3）': g('叙述某个处所有人或事物出现或消失，可以用存现句。基本结构：处所词语+动词+趋向补语/结果补语+（动态助词）+数量短语+人/物。', 'Existential sentences can describe the appearance or disappearance of people or things in a place.', ['教室里走进来一个人。']),
  '紧缩复句“……了……就……”': g('“……了……就……”表示前一个动作完成后紧接着发生后一个动作。', 'The contracted complex sentence “……了……就……” indicates that the second action occurs immediately after the first is completed.', ['照好了我们就走。']),
  '固定格式“该……了”': g('固定格式“该……了”表示到了应该做某事的时间。', 'The fixed pattern “该……了” indicates that it is time to do something.', ['我们该出发了。']),
  '假设复句“如果……，就……”': g('假设复句“如果……，就……”中，前一分句表示假设，后一分句表示相应的结果。', 'In the hypothetical complex sentence “如果……，就……”, the first clause states a hypothesis and the second its result.', ['如果想吃，就在高铁上点外卖。']),
  '固定短语“越来越”': g('固定短语“越来越”后面加形容词或心理动词，表示程度随时间推移而变化，前面不能再加程度副词。', 'The set phrase “越来越” is followed by an adjective or psychological verb to indicate a change in degree over time.', ['天气越来越冷了。']),
  '连动句（2）': g('动态助词“着”用于连动句的第一个动词后面，表示进行第二个动作时的状态或方式。', 'The aspect particle “着” follows the first verb in a serial verb sentence to indicate the state or manner of the second action.', ['她穿着裙子去上班。']),
  '比较句（10）': g('“A不比B+形容词”表示A和B差不多，常用于强调两者情况接近或反驳别人的说法。', 'The pattern “A不比B+Adjective” means that A and B are about the same.', ['裙子不比短裤贵多少。', '他的中文不比你好。']),
  '程度补语（3）': g('程度补语“极了”用在形容词或心理动词后面，表示性质、状态或心理感受达到很高的程度。', 'The complement of degree “极了” follows an adjective or psychological verb to indicate an extremely high degree.', ['这块西瓜甜极了。']),
  '递进复句“不但……，而且……”': g('“不但……，而且……”连接两个分句，表示递进关系。', 'The progressive complex sentence “不但……，而且……” connects two clauses in a progressive relationship.', ['现在的电视不但便宜，而且用着非常方便。']),
  '趋向补语的引申用法（1）': g('趋向补语“下去”用在动词或形容词后面，表示已经开始的动作或状态还要继续。', 'The complement of direction “下去” follows a verb or adjective to indicate continuation of an action or state already begun.', ['这几天太热了，如果再热下去就不能出门了。']),
  '离合词（2）': g('离合词一般不能直接带宾语；句中有补语时，一般放在离合词中间。', 'Separable words generally cannot directly take an object. A complement is generally placed between the two parts.', ['昨天游完泳以后，我的耳朵一直有点儿疼。']),
  '时量补语（2）': g('时量补语用在动词后面，表示动作或状态持续时间的长短；非持续性动词后的时量补语表示动作完成到说话时经过的时间。', 'A complement of duration follows a verb to indicate duration; after a non-durative verb, it indicates elapsed time since completion.', ['我上次来医院已经过去差不多两年了。']),
  '固定格式“……以前/以后/前/后”': g('“时间/事件+以前/前”表示某个时间或事件之前；“时间/事件+以后/后”表示之后。', '“Time/Event+以前/前” indicates before a time or event; “Time/Event+以后/后” indicates after it.', ['这种药需要每天睡前吃一次。', '我们决定下班后一起去看个电影。']),
  '目的复句“为了……”': g('目的复句“为了……”中，“为了”后面的小句表示目的，另一个小句表示为达到目的采取的行动。', 'In the purpose complex sentence “为了……”, the clause following “为了” indicates the purpose and the other clause the action taken.', ['为了考上大学，她每天努力学习。']),
  可能补语: g('在动词和结果补语或趋向补语之间插入“得”或“不”构成可能补语，表示条件是否容许实现某种结果或趋向。', 'A potential complement inserts “得” or “不” between a verb and a result or directional complement.', ['打不好没关系。']),
  '固定格式“越A越B”': g('“越A越B”表示B随着A的变化而变化。', 'The fixed pattern “越A越B” indicates that B changes along with A.', ['越练越好。']),
  '“把”字句（1）': g('“把”字句表示对确定的人或事物做出动作，使其发生位置上的改变。否定副词和能愿动词放在“把”前。', 'A “把” sentence indicates an action on a definite person or thing resulting in a change of position.', ['你明天再把书还给我。']),
  '固定格式“在……上/中/下”': g('“在……上/中/下”可以表示范围、时间、条件等。', 'The fixed pattern “在……上/中/下” can indicate scope, time, condition, and so on.', ['在学习上，他帮助了我很多。']),
  '“把”字句（2）': g('“把”字句表示通过动作使确定的事物发生关系上的转移。基本结构：主语+把+宾语₁+动词+给+宾语₂。', 'A “把” sentence can indicate relational transfer of a definite thing through an action.', ['请把书还给我。']),
  '“还是”和“或者”': g('“还是”一般用于疑问句提出选项；“或者”一般用于陈述句表示选择。', '“还是” is generally used in questions to present options, while “或者” is generally used in statements.', ['你喝茶还是咖啡？', '我们可以喝茶或者咖啡。']),
  '固定短语“看来”': g('“看来”后面加结论，表示说话人通过观察、思考后对当前情况的分析或推测。', '“看来” introduces a conclusion based on observation or reflection.', ['看来我没办法解决这个问题。']),
  '“把”字句（3）': g('“把”字句表示动作对确定的人或事物产生某种结果。基本结构：主语+把+宾语+动词+结果补语。', 'A “把” sentence indicates that an action produces a result on a definite person or thing.', ['妈妈把衣服洗干净了。']),
  '固定格式“对……来说”': g('“对……来说”指明观点、感受或情况所属的对象。', 'The pattern “对……来说” indicates the person or group to whom a viewpoint, feeling, or situation applies.', ['对我来说，生活也很重要。']),
  '选择复句“或者……，或者……”': g('“或者……，或者……”表示在两个或多个可能的选项中选择一个，多用于口语。', 'The alternative complex sentence “或者……，或者……” indicates a choice between two or more possibilities.', ['或者明天去，或者后天去，我给你打电话。']),
  '趋向补语的引申用法（2）': g('“起来”用在动词或形容词后，表示动作开始进行或进入新状态；带宾语时宾语放在“起”和“来”之间。', '“起来” follows a verb or adjective to indicate the start of an action or entry into a new state.', ['雨已经下起来了。']),
  '范围副词“就”': g('范围副词“就”用在带数量词的动词前，表示说话人认为数量少、程度轻或时间短。', 'The scope adverb “就” precedes a verb with a numeral-measure phrase to suggest a small quantity, low degree, or short duration.', ['我就吃了一个。']),
  '趋向补语的引申用法（3）': g('趋向补语可引申表示动作结果或状态变化。', 'Complements of direction can be extended to indicate an action result or a change of state.', ['我终于想出来了。']),
  '假设复句“……的话，就……”': g('“……的话，就……”中，前一分句表示假设情况，后一分句表示结果或结论，多用于口语。', 'In “……的话，就……”, the first clause gives a hypothetical situation and the second its result or conclusion.', ['你想去的话，就一起去吧。']),
  '“把”字句（4）': g('“把”字句中，动词后可带状态补语，说明动作造成的状态或程度。', 'In a “把” sentence, a complement of state may follow the verb to describe the resulting state or degree.', ['你把声音开得太大了。']),
  '并列复句“一边……，一边……”': g('“一边……，一边……”表示两个动作同时进行，可以简化为“边……边……”。', '“一边……，一边……” indicates that two actions take place simultaneously and can be shortened to “边……边……”.', ['我们一边吃蛋糕，一边聊天儿吧。']),
  '被动句（1）': g('带“被”的句子表达被动意义，突出主语受到某个动作的影响。副词和能愿动词放在“被”前，“被”后的宾语可以省略。', 'Sentences with “被” express the passive voice and emphasize that the subject is affected by an action.', ['这本书被别人借走了。']),
  '承接复句“先……，再/然后……”': g('“先……，再/然后……”中的分句表示动作的先后顺序。', 'In “先……，再/然后……”, the clauses indicate the chronological order of actions.', ['我要先去图书馆借书，然后去游泳。']),
  '固定格式“X什么（啊）”': g('“X什么（啊）”常用于否定对方的担忧、疑问或强调事实，带有反驳或安慰的语气。', '“X什么（啊）” dismisses concerns or doubts or emphasizes a fact, with a tone of refutation or reassurance.', ['紧张什么啊，我们都喜欢听你唱歌。']),
  '介词“根据”': g('“根据”引出作为行动或判断依据的人、事物或情况。', 'The preposition “根据” introduces the basis for an action or judgment.', ['这几年小区根据他们的需要，有了很多变化。']),
  '数量重叠“数词+量词+数词+量词”': g('数量短语可以重叠，重叠后可作状语，一般表示动作的方式。', 'Numeral-measure word phrases can be reduplicated and used as adverbials, generally indicating manner.', ['大家一个一个地走进教室。']),
  '固定短语“在……看来”': g('“在……看来”表示个人或某个群体的观点。', '“在……看来” expresses the viewpoint of an individual or group.', ['在我看来，这个办法最好。']),
  '固定短语“不一会儿”': g('“不一会儿”表示很短的时间，在句中作状语，多用于口语。', '“不一会儿” means “in a short while” and functions as an adverbial.', ['难过的事情不一会儿就忘了。']),
  '并列复句“一会儿……，一会儿……”': g('“一会儿……，一会儿……”表示短时间内发生的不同动作或一种对立的情况。', '“一会儿……，一会儿……” indicates different actions within a short period or alternating states.', ['它一会儿在你脚边睡觉，一会儿在你身上爬。']),
  '介词“关于”': g('“关于”引出涉及的人或事物，通常放在句首。', 'The preposition “关于” introduces the person or thing being discussed.', ['关于这个问题，我得慢慢给你讲。']),
  '固定短语“一般来说”': g('“一般来说”表示大多数情况下如此，常用于句子开头。', '“一般来说” means “generally speaking” or “in most cases” and is often used sentence-initially.', ['一般来说，熊猫每天要睡很多次。']),
  '比较句（11）': g('用“比”的比较句中，谓语为一般动词时，前面可用“多、少、早、晚”，表示数量或时间差异。', 'In comparative sentences with “比”, “多, 少, 早, 晚” can precede a general verb to indicate a difference in quantity or time.', ['他比我早来十分钟。']),
  '介词“向”': g('介词“向”后加代词、名词或名词性短语，表示动作的方向或对象。', 'The preposition “向” is followed by a pronoun, noun, or nominal phrase to indicate direction or target.', ['别再向前走了。', '以后我要多向认真的人学习。']),
  '反问句“不是……吗？”': g('“不是……吗？”一般表达不理解或不满，有时也表示提醒或确认。否定形式表达肯定意思。', 'The rhetorical question “不是……吗？” expresses confusion or dissatisfaction and sometimes reminds or confirms.', ['你不是已经知道了吗？']),
  '递进复句“……，更……”': g('“……，更……”中，第二个分句表示程度上更深一层。', 'In “……，更……”, the second clause expresses a deeper degree of meaning.', ['我还没想好学什么，更没想好去哪个国家。']),
  '条件复句“只有……，才……”': g('“只有……，才……”中，前一分句表示必要条件，后一分句表示在该条件下产生的结果。', 'In “只有……，才……”, the first clause gives a necessary condition and the second the resulting outcome.', ['只有认真学习，才能学好中文。']),
  概数表达法: g('汉语中相邻的两个数字连用，表示不确定的数量。', 'In Chinese, two adjacent numbers used together indicate an approximate quantity.', ['春节大概放七八天假。']),
  '“刚才”和“刚刚”': g('“刚才”是时间名词，表示很短的时间以前；“刚刚”是时间副词，通常放在动词前。', '“刚才” is a time noun referring to the immediate past, while “刚刚” is a time adverb generally placed before a verb.', ['刚才他来过。', '他刚刚走。']),
  '条件复句“只要……，就……”': g('“只要……，就……”中，前一分句表示充分条件，后一分句表示结果。', 'In “只要……，就……”, the first clause gives a sufficient condition and the second the result.', ['只要认真学，就能学会。']),
  '固定格式“从……起”': g('“从……起”表示从某个时间或地点开始。', 'The fixed pattern “从……起” indicates a starting time or place.', ['从明天起，我每天练习包饺子。'])
};

export function getHsk3TopicGuide(title: string): BookTopicGuide | undefined {
  return guides[title.split(' · ')[0]];
}

export const hsk3ChineseExplanations: Record<string, string> = {};
export const hsk3TopicTables: Record<string, TopicTable[]> = {};
