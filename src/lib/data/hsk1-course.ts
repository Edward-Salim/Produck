export type Lesson = {
  number: number;
  hanzi: string;
  pinyin: string;
  title: string;
  page: string;
  classroom: string[];
};

export type ClassroomTopic = {
  title: string;
  lesson: Lesson;
};

export type BookTopicGuide = {
  summary: string;
  pattern: string;
  examples: (string | { a: string; b: string })[];
  useTableSections?: boolean;
  blocks?: {
    title?: string;
    zh?: string;
    en?: string;
    exampleLabel?: string;
    examples: (string | { a: string; b: string })[];
  }[];
};

export type TopicTable = {
  title?: string;
  zh?: string;
  en?: string;
  readAloud?: boolean;
  centerCells?: boolean;
  fluidColumns?: boolean;
  examples?: string[];
  headers?: string[];
  rows: string[][];
};

export const hskLevels = [1, 2, 3, 4, 5, 6];
export const lessons: Lesson[] = [
  {
    number: 1,
    hanzi: 'AI小语，你好！',
    pinyin: 'AI Xiǎoyǔ, nǐ hǎo!',
    title: 'Hello, AI Xiaoyu!',
    page: '001',
    classroom: []
  },
  {
    number: 2,
    hanzi: '我叫李文',
    pinyin: 'Wǒ jiào Lǐ Wén',
    title: 'My name is Li Wen',
    page: '005',
    classroom: ['汉语的基本语序 · Basic Word Order in Chinese']
  },
  {
    number: 3,
    hanzi: '我是中国人',
    pinyin: 'Wǒ shì Zhōngguó rén',
    title: "I'm Chinese",
    page: '010',
    classroom: [
      '“是”字句 · “是” Sentence',
      '结构助词“的” · Structural Particle “的”',
      '用“吗”的是非问句 · Yes-No Question with “吗”'
    ]
  },
  {
    number: 4,
    hanzi: '我有两个孩子',
    pinyin: 'Wǒ yǒu liǎng ge háizi',
    title: 'I have two children',
    page: '018',
    classroom: [
      '“有”字句（1） · “有” Sentence (1)',
      '数字的表达 · Expression of Numbers',
      '语气助词“呢”（1） · Modal Particle “呢” (1)',
      '名量词和名量结构 · Nominal Measure Words and [Num+M+(N)] Structure'
    ]
  },
  {
    number: 5,
    hanzi: '今天我休息',
    pinyin: 'Jīntiān wǒ xiūxi',
    title: "I'm off today",
    page: '027',
    classroom: [
      '时间的表达（1） · Expression of Time (1)',
      '名词谓语句 · Nominal-Predicate Sentences',
      '能愿动词“会” · Modal Verb “会”'
    ]
  },
  {
    number: 6,
    hanzi: '你的手机号是多少？',
    pinyin: 'Nǐ de shǒujī hào shì duōshao?',
    title: "What's your cell phone number?",
    page: '035',
    classroom: [
      '能愿动词“想” · Modal Verb “想”',
      '连动句（1） · Serial Verb Sentences (1)',
      '疑问代词“怎么” · Interrogative Pronoun “怎么”'
    ]
  },
  {
    number: 7,
    hanzi: '我晚上六点半下班',
    pinyin: 'Wǒ wǎnshang liù diǎn bàn xiàbān',
    title: "I'll finish work at 6:30 in the evening",
    page: '045',
    classroom: [
      '时间的表达（2） · Expression of Time (2)',
      '语气助词“吧”（1） · Modal Particle “吧” (1)',
      '副词、时间词语作状语的位置 · Position of Adverbs and Time Expressions as Adverbials',
      '语气助词“呢”（2） · Modal Particle “呢” (2)'
    ]
  },
  {
    number: 8,
    hanzi: '我爸爸也在医院工作',
    pinyin: 'Wǒ bàba yě zài yīyuàn gōngzuò',
    title: 'My father also works at a hospital',
    page: '054',
    classroom: [
      '方位词 · Positional Words',
      '介词“在” · Preposition “在”',
      '能愿动词“能” · Modal Verb “能”'
    ]
  },
  {
    number: 9,
    hanzi: '我明天上午在学校学习',
    pinyin: 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí',
    title: "I'll be studying at school tomorrow morning",
    page: '061',
    classroom: [
      '存现句（1） · Existential Sentences (1)',
      '时间词语和处所词语同时作状语的顺序 · Sequence of Time and Location Expressions When Used as Adverbials Simultaneously',
      '表示序数的“第” · Indicating Ordinal Numbers'
    ]
  },
  {
    number: 10,
    hanzi: '这儿的苹果真便宜！',
    pinyin: 'Zhèr de píngguǒ zhēn piányi!',
    title: 'The apples here are really affordable!',
    page: '070',
    classroom: [
      '钱数的表达 · Expression of Amount of Money',
      '形容词谓语句 · Adjectival-Predicate Sentences',
      '疑问代词“怎么样” · Interrogative Pronoun “怎么样”'
    ]
  },
  {
    number: 11,
    hanzi: '我读大学呢',
    pinyin: 'Wǒ dú dàxué ne',
    title: "I'm studying at university",
    page: '078',
    classroom: [
      '正反问 · Affirmative-Negative Questions',
      '时间副词“在/正在” · Temporal Adverbs “在/正在”',
      '能愿动词“要” · Modal Verb “要”'
    ]
  },
  {
    number: 12,
    hanzi: '昨天下雪了',
    pinyin: 'Zuótiān xià xuě le',
    title: 'It snowed yesterday',
    page: '086',
    classroom: [
      '非主谓句 · Non-Subject-Predicate Sentences',
      '语气助词“了”（1） · Modal Particle “了” (1)',
      '“太……了”格式 · “太……了” Pattern'
    ]
  },
  {
    number: 13,
    hanzi: '请给我一杯茶',
    pinyin: 'Qǐng gěi wǒ yì bēi chá',
    title: "I'll have a cup of tea, please",
    page: '095',
    classroom: [
      '能愿动词“可以” · Modal Verb “可以”',
      '“动词+一下”结构 · “Verb+一下” Structure',
      '双宾语句（1） · Double-Object Sentences (1)'
    ]
  },
  {
    number: 14,
    hanzi: '我看了一个电影',
    pinyin: 'Wǒ kàn le yí ge diànyǐng',
    title: 'I watched a movie',
    page: '103',
    classroom: [
      '动态助词“了”（2） · Aspect Particle “了” (2)',
      '离合词（1） · Separable Words (1)',
      '范围副词“都” · Scope Adverb “都”'
    ]
  },
  {
    number: 15,
    hanzi: '大兴机场见！',
    pinyin: 'Dàxīng jīchǎng jiàn!',
    title: 'See you at Daxing Airport!',
    page: '112',
    classroom: ['并列复句“……，还/也……” · Coordinate Compound Sentence “……，还/也……”']
  }
];

export const classroomTopics: ClassroomTopic[] = lessons.flatMap((lesson) =>
  lesson.classroom.map((title) => ({ title, lesson }))
);

const bookTopicGuides: Record<string, BookTopicGuide> = {
  '汉语的基本语序 · Basic word order in Chinese': {
    summary:
      'The basic word order in Chinese is: Subject + Predicate + Object. For example: 我 (Subject) 叫 (Predicate) 陈天中 (Object).',
    pattern: '',
    examples: ['你叫什么名字？', '我叫白家月。', '我是学生。']
  },
  '“是”字句 · Sentences with 是': {
    summary:
      'The “是” sentence is used to indicate what somebody or something equals or belongs to. The negative form is “不是”.',
    pattern: 'subject + 是 / 不是 + noun or noun phrase',
    examples: ['我是法国人。', '她是中文老师。', '我老师不是法国人。']
  },
  '结构助词“的” · Structural particle 的': {
    summary:
      'The structural particle “的” is placed between the attributive and the head noun/nominal phrase to express a possessive relationship. If “的” is preceded by a personal pronoun and followed by a kinship term or a noun referring to a person, “的” can be omitted.',
    pattern: 'owner / attributive + 的 + noun',
    examples: [],
    blocks: [
      {
        zh: '结构助词“的”在定语和中心语之间，表达领属关系。',
        en: 'The structural particle “的” is placed between the attributive and the head noun/nominal phrase to express a possessive relationship.',
        examples: ['白家月的中文老师', '你的名字']
      },
      {
        zh: '如果“的”前边是人称代词，后边是亲属称谓或指人的名词，“的”可省略。',
        en: 'If the word “的” is preceded by a personal pronoun and followed by a kinship term or a noun referring to a person, “的” can be omitted.',
        examples: ['我老师', '我学生', '你同学', '我妈妈（māma, mother）']
      }
    ]
  },
  '用“吗”的是非问句 · Yes–no questions with 吗': {
    summary:
      'The word “吗” is a modal particle typically placed at the end of a sentence to indicate a yes-no question with “吗”. Basic structure: ……吗?',
    pattern: 'statement + 吗？',
    examples: ['你也很忙吗？', '你是他的中文老师吗？', '你有（yǒu, have）姐姐吗？']
  },
  '“有”字句（1） · Sentences with 有': {
    summary: 'The word “有” in this lesson indicates possession. Its negative form is “没/没有”.',
    pattern: 'person + 有 / 没有 + possessed noun',
    examples: ['她有二十个学生。', '她有一个姐姐。', '我没/没有姐姐。']
  },
  '数字的表达 · Expressing numbers': {
    summary:
      'In Chinese, numbers can be written in two forms: Arabic numerals (e.g., “1”) and Chinese characters (e.g., “一”).',
    pattern: '0–99 的写法和读法',
    examples: []
  },
  '语气助词“呢”（1） · Modal Particle 呢 (1)': {
    summary:
      'The word “呢” in this lesson is used at the end of a sentence to indicate a question, inquiring about the situation mentioned previously. Basic structure: A……, B呢?',
    pattern: 'A……，B呢？',
    examples: ['我有两个哥哥，你呢？', '我叫白家月，你呢？', '我是中国人，你呢？']
  },
  '名量词和名量结构 · Nominal Measure Words and [Num+M+(N)] Structure': {
    summary:
      'When expressing quantity, a Chinese numeral is generally followed by a measure word. In this lesson, we focus on nominal measure words that indicate the quantity of people or objects, such as “口” and “个”, and the [Num+M+(N)] structure, such as “四口人” and “两个哥哥”.',
    pattern: '[number + measure word + (noun)]',
    examples: ['四口', '四口人', '两个', '两个学生']
  },
  '时间的表达（1） · Expressing time': {
    summary:
      'This lesson focuses on how to express dates and days of the week in Chinese. The sequence for stating dates and days of the week is: 年 → 月 → 日/号 → 星期.',
    pattern: '年 → 月 → 日/号 → 星期',
    examples: []
  },
  '名词谓语句 · Nominal-predicate sentences': {
    summary:
      'In a nominal-predicate sentence, the predicate consists only of a noun or a nominal phrase, usually used to indicate time, date, age, and so on.',
    pattern: 'subject + time / date / age noun phrase',
    examples: [{ a: '今天几号？', b: '今天5月1号。' }, '我妹妹12岁。']
  },
  '能愿动词“会” · Modal Verb 会': {
    summary:
      'The word “会” placed before a verb indicates the knowledge or ability to perform an action that is acquired through learning.',
    pattern: 'subject + 会 / 不会 + verb',
    examples: ['你会做饭吗？', '我会做面条儿。', '我不会做菜。']
  },
  '能愿动词“想” · Modal Verb 想': {
    summary: 'The modal verb “想”, when used before a verb, indicates desire or intention.',
    pattern: 'subject + 想 / 不想 + verb',
    examples: ['我想去超市。', '我哥哥不想休息。']
  },
  '连动句（1） · Serial-verb sentences (1)': {
    summary:
      'A serial verb sentence consists of two or more verbal phrases in the predicate. It typically expresses two types of meanings: indicating the purpose of an action or indicating the manner of an action.',
    pattern: 'subject + two or more verbal phrases',
    examples: [],
    blocks: [
      {
        zh: '连动句的谓语部分由两个或两个以上动词性短语构成。连动句有两种意义：',
        en: 'A serial verb sentence consists of two or more verbal phrases in the predicate. It typically expresses two types of meanings:',
        examples: []
      },
      {
        title: '（1）表示动作的目的 · Indicating the purpose of an action',
        examples: ['我想去超市买东西。', '我们去西安饭店吃晚饭。']
      },
      {
        title: '（2）表示动作的方式 · Indicating the manner of an action',
        examples: ['我们坐出租车去西安饭店。', '她坐出租车去超市。']
      }
    ]
  },
  '疑问代词“怎么” · Interrogative pronoun 怎么': {
    summary:
      'The interrogative pronoun “怎么” is used before a verb to ask about the manner or method of an action.',
    pattern: '怎么 + verb',
    examples: ['我们怎么去？', '她怎么去超市？']
  },
  '时间的表达（2） · Expression of Time (2)': {
    summary:
      'The words “点” and “分” are used to indicate specific points in time. “点” is used for whole hours, while “分” is used when minutes are involved. The word “分” can be omitted when the time is exactly ten minutes, but for times less than ten minutes, “零” must be pronounced. Time nouns such as “上午”, “中午”, “下午”, and “晚上” can be used to express time periods, and they can be directly followed by a specific time.',
    pattern: 'time period + number + 点 + 分',
    examples: [],
    useTableSections: true
  },
  '语气助词“吧”（1） · Modal Particle 吧 (1)': {
    summary:
      'The modal particle “吧” in this lesson is pronounced with a neutral tone at the end of a sentence. It is used to express suggestions, consultations, advice, or requests.',
    pattern: 'statement / imperative + 吧。',
    exampleLabel: '朗读对话 · Read the dialogues aloud',
    examples: [
      { a: '我们下午三点见吧。', b: '好的。' },
      { a: '你去超市买吧。', b: '超市没有。' },
      { a: '我们去西安饭店吃晚饭吧。', b: '好的。' }
    ]
  },
  '副词、时间词语作状语的位置 · Position of Adverbs and Time Expressions as Adverbials': {
    summary:
      'In Chinese, when adverbs and time expressions function as adverbials, they are generally placed before verbs or adjectives.',
    pattern: '[subject] + adverb / time + verb or adjective',
    examples: ['我不想去。', '妹妹很高兴。', '她上午十点半上课。']
  },
  '语气助词“呢”（2） · Modal Particle 呢 (2)': {
    summary:
      'The modal particle “呢” in this lesson is placed at the end of a sentence to indicate confirmed facts. Basic structure: ……呢。',
    pattern: 'statement + 呢。',
    examples: ['我明天下午两点还上课呢。', '妹妹会做两个菜呢。', '李文晚上还有事呢。']
  },
  '方位词 · Positional Words': {
    summary:
      'The positional words expressing direction and location introduced in this volume are: 上, 下, 里, 外, 前, 后, and 外边.',
    pattern: 'noun / place + positional word',
    examples: ['房间里有一只小猫。', '我们去书店外边。', '小雪的手机在桌子上呢。']
  },
  '介词“在” · Preposition 在': {
    summary:
      'The preposition “在” combines with words or phrases that indicate a location or place. This structure is placed before the verb to show where an action takes place.',
    pattern: 'subject + 在 + place + verb',
    examples: ['我在学校吃午饭。', '他爸爸在医院工作。', '你在哪儿买菜？']
  },
  '能愿动词“能” · Modal Verb 能': {
    summary:
      'The modal verb “能” is placed before the verb to indicate the ability, condition, or possibility of doing something.',
    pattern: 'subject + 能 + verb',
    examples: ['下午两点你能到吗？', '爸爸能去。', '我不能去学校吃午饭。']
  },
  '存现句（1） · Existential Sentences (1)': {
    summary:
      'Existential sentences indicate the existence of someone or something in a specific place or location, generally marked by “有” or “是”. When negating, no numeral-measure word phrase is used before the object.',
    pattern: 'place + 有 / 是 + noun',
    examples: [
      '学校前边有一家电影院。',
      '电影院前边是一家超市。',
      '电影院前边不是超市。',
      '桌子上没有小猫。'
    ]
  },
  '时间词语和处所词语同时作状语的顺序 · Sequence of Time and Location Expressions When Used as Adverbials Simultaneously':
    {
      summary:
        'When time and location expressions function as adverbials simultaneously, the time expressions should precede the location expressions.',
      pattern: 'subject + time + location + verb',
      examples: [
        '我们七点在电影院外边见。',
        '安妮下午在家里学中文。',
        '陈天中明天中午在学校吃午饭。'
      ]
    },
  '表示序数的“第” · Indicating Ordinal Numbers': {
    summary:
      '“第” precedes cardinal numbers to indicate ordinal numbers. Basic structures: (1) 第 + Numeral; (2) 第 + Numeral + Measure Word + (Noun).',
    pattern: '第 + numeral；第 + numeral + measure word + (noun)',
    examples: ['第一、第二、第三', '第一个、第二个、第一本', '第一个学生、第一本书']
  },
  '钱数的表达 · Expression of Amount of Money': {
    summary:
      'China’s currency is known as Renminbi (RMB). Its units, ranked from the largest to the smallest, are “元”, “角”, and “分”, which are colloquially referred to as “块”, “毛”, and “分” respectively. The standard order of denomination is: 元/块 → 角/毛 → 分.',
    pattern: '元 / 块 → 角 / 毛 → 分',
    examples: []
  },
  '形容词谓语句 · Adjectival-Predicate Sentences': {
    summary:
      'Adjectives can be used directly as predicates, with adverbs of degree or negative adverbs optionally placed before them.',
    pattern: 'subject + (degree / negative adverb) + adjective',
    examples: ['这儿的水果真不少！', '我的房间不大。', '那个苹果好吃。']
  },
  '疑问代词“怎么样” · Interrogative Pronoun 怎么样': {
    summary:
      'The interrogative pronoun “怎么样” is used to ask for opinions or inquire about a situation, and so on. Basic structure: ……怎么样?',
    pattern: '…怎么样？',
    exampleLabel: '朗读对话 · Read the dialogues aloud',
    examples: [
      { a: '这个杯子怎么样？', b: '我很喜欢，也不贵。' },
      { a: '这本书怎么样？', b: '很好看。' },
      { a: '这个菜怎么样？', b: '这个菜不太好吃，我不喜欢。' }
    ]
  },
  '正反问 · Affirmative-Negative Questions': {
    summary:
      'Affirmative-negative questions follow the pattern “X + 不/没 + X”, where “X” is a verb or an adjective. “不/没” is used in verb affirmative-negative questions, while “不” is used in adjective affirmative-negative questions. “不” is used with “是”.',
    pattern: 'verb / adjective + 不 / 没 + verb / adjective',
    examples: [],
    blocks: [
      {
        zh: '正反问格式是“X+不/没+X”，“X”是动词或形容词。动词正反问使用“不/没”，形容词正反问使用“不”。',
        en: 'Affirmative-negative questions follow the pattern “X+不/没+X”, where “X” is a verb or an adjective. “不/没” is used in verb affirmative-negative questions, while “不” is used in adjective affirmative-negative questions.',
        examples: ['它是不是在超市后边？', '你去没去学校？', '这件衣服好看不好看？']
      },
      {
        exampleLabel: '朗读对话 · Read the dialogues aloud',
        examples: [
          { a: '他去哪儿了？你知道不知道？', b: '我不知道。' },
          { a: '昨天你去没去书店？', b: '我没去。' },
          { a: '这件衣服贵不贵？', b: '不贵。' }
        ]
      }
    ]
  },
  '时间副词“在/正在” · Temporal Adverbs 在/正在': {
    summary:
      'The temporal adverbs “在/正在” are placed before a verb, expressing that an action is ongoing or a situation is continuing. This lesson introduces two forms: (1) 在/正在 + Verb; (2) 在/正在 + Verb + 呢. Additionally, there is a third form to express an ongoing action: Verb + 呢. For negative responses, the adverb “没（有）” is used.',
    pattern: '在 / 正在 + verb (+ 呢)',
    examples: [],
    blocks: [
      {
        zh: '时间副词“在/正在”位于动词前，表示动作正在进行或情况在继续。本课有两种形式：（1）在/正在+动词；（2）在/正在+动词+呢。此外，表达正在做的事情还有第三种形式：（3）动词+呢。否定回答时，使用副词“没（有）”。',
        en: 'The temporal adverbs “在/正在” are placed before a verb, expressing that an action is ongoing or a situation is continuing. This lesson introduces two forms: (1) 在/正在+Verb; (2) 在/正在+Verb+呢. Additionally, there is a third form to express an ongoing action: (3) Verb+呢. For negative responses, the adverb “没（有）” is used.',
        examples: ['你还在读大学吗？', '学生们在/正在上课呢。', '我们读书呢。']
      },
      {
        exampleLabel: '朗读对话 · Read the dialogues aloud',
        examples: [
          { a: '你在做什么呢？', b: '我正在看电视。' },
          { a: '我去看电影，你去不去？', b: '我在学习呢，不想去。' },
          { a: '你在买菜吗？', b: '我没买菜，买水果呢。' }
        ]
      }
    ]
  },
  '能愿动词“要” · Modal Verb 要': {
    summary:
      'When used before a verb, the modal verb “要” indicates the desire or intention to do something.',
    pattern: 'subject + 要 + verb',
    examples: ['他今天要和小朋友玩。', '妈妈要去超市。', '白家月要在家里学中文。']
  },
  '非主谓句 · Non-Subject-Predicate Sentences': {
    summary:
      'Non-subject-predicate sentences are composed of words or phrases without distinct subjects or predicates, and are commonly used in colloquial speech.',
    pattern: 'a complete word or phrase without a fixed subject–predicate structure',
    examples: ['下雨了。', '下雪了。', '上课了。', '真漂亮！', '对不起！', '没关系！']
  },
  '语气助词“了”（1） · Modal Particle 了 (1)': {
    summary:
      'The modal particle “了” (1) is placed at the end of a sentence or at a pause within a sentence to indicate a change or a new situation. For negative responses, the adverb “没” is used, and “了” is omitted at the end of the sentence.',
    pattern: '…了；negative: 没 + verb',
    examples: [
      '下雨了。',
      '十二点了，吃午饭吧。',
      { a: '弟弟起来了吗？', b: '还没起来呢。' }
    ]
  },
  '“太……了”格式 · 太……了 Pattern': {
    summary: 'The “太……了” pattern expresses a very high or intense degree of exclamation.',
    pattern: '太 + adjective / state + 了',
    examples: ['太冷了！', '这个杯子太小了。', '我们今天太高兴了！']
  },
  '能愿动词“可以” · Modal Verb 可以': {
    summary:
      'The modal verb “可以” is placed before a verb to indicate possibility, capability, or permission.',
    pattern: 'subject + 可以 + verb',
    examples: [
      '我可以再问您一个问题吗？',
      '你们可以看这本书。',
      { a: '我可以坐吗？', b: '可以，请坐！' }
    ]
  },
  '“动词+一下”结构 · Verb+一下 Structure': {
    summary:
      'In this lesson, the “Verb + 一下” structure indicates that an action is performed as a quick attempt or it is brief.',
    pattern: 'verb + 一下',
    examples: ['你可以打电话问一下。', '请休息一下。', '你看一下吧。']
  },
  '双宾语句（1） · Double-Object Sentences (1)': {
    summary:
      'A double-object sentence is one where a verb takes two objects. In this volume, we focus on double-object sentences formed by “给” and “问”.',
    pattern: 'subject + 给 / 问 + person + thing',
    examples: ['请给我一杯牛奶。', '白家月给安妮一个苹果。', '我问老师两个问题。']
  },
  '动态助词“了”（2） · Aspect Particle 了 (2)': {
    summary:
      'The aspect particle “了” (2) is placed after a verb to indicate that an action has occurred or been completed. When negating, “没” is used instead, and “了” is omitted.',
    pattern: 'verb + 了 + object；negative: 没 + verb',
    examples: ['我看了一个电影。', '我买了一个新电脑。', '我昨天没去商店买东西。']
  },
  '离合词（1） · Separable Words (1)': {
    summary:
      'In this volume, words such as “上课”, “下课”, “上班”, “下班”, “说话”, “读书”, “睡觉”, “看病”, and “生病” belong to a special type of verbal structure. These words can be either combined or separated: when combined, they function as single words; when elements are inserted between their components, they become phrases. Therefore, they are referred to as separable words. When separable words are split, the types of elements that can be inserted are limited.',
    pattern: 'combined word; split with a limited inserted element',
    examples: []
  },
  '范围副词“都” · Scope Adverb 都': {
    summary:
      'The scope adverb “都” means “all” or “in general”. The object being generalized is placed before “都”. When negating, the negative word is placed after “都”.',
    pattern: 'generalized subject / object + 都 + verb',
    examples: ['我们都会写了。', '我和我的朋友们都去。', '同学们都没听见。']
  },
  '并列复句“……，还/也……” · Coordinate Compound Sentence “……，还/也……”': {
    summary:
      'A coordinate compound sentence consists of two or more clauses that are logically related and structurally parallel. In this volume, we focus on the coordinate compound sentence “……，还/也……”.',
    pattern: 'clause 1，(还 / 也) + clause 2',
    examples: [
      '我喜欢这个，也喜欢那个。',
      '王老师是北京人，李文也是北京人。',
      '我喜欢喝中国茶，还喜欢吃中国菜。'
    ]
  }
};

export function getBookTopicGuide(title: string): BookTopicGuide | undefined {
  const normalizeChineseTitle = (value: string) => value;
  const chineseTitle = normalizeChineseTitle(title.split(' · ')[0]);
  const matchingTitle = Object.keys(bookTopicGuides).find(
    (bookTitle) => normalizeChineseTitle(bookTitle.split(' · ')[0]) === chineseTitle
  );

  return matchingTitle ? bookTopicGuides[matchingTitle] : undefined;
}

export const chineseExplanations: Record<string, string> = {
  汉语的基本语序: '汉语的基本语序是：主语+谓语+宾语。例如：我（主语）叫（谓语）陈天中（宾语）。',
  '“是”字句': '表示人或事物等同什么或类属什么，否定形式是“不是”。',
  '结构助词“的”':
    '结构助词“的”在定语和中心语之间，表达领属关系。如果“的”前边是人称代词，后边是亲属称谓或指人的名词，“的”可省略。',
  '用“吗”的是非问句': '“吗”是语气助词，通常在句子末尾，表示疑问。基本结构：……吗？',
  '“有”字句（1）': '本课“有”表示领有，否定形式为“没/没有”。',
  数字的表达: '汉语中，数字有阿拉伯数字和汉字两种写法，例如“1”和“一”。',
  '语气助词“呢”（1）': '本课“呢”在句末，表示疑问，询问上文提到的情况。基本结构：A……，B呢？',
  名量词和名量结构:
    '表达数量时，汉语数词后一般要带量词。本课学习表示人数或物数量的名量词，如“口、个”等，以及名量结构，如“四口人、两个哥哥”等。',
  '时间的表达（1）': '本课学习日期、星期的表达。汉语日期、星期的表达顺序是：年→月→日/号→星期。',
  名词谓语句:
    '名词谓语句谓语部分只有名词或名词性成分，这部分词语一般是表达时间、日期、年龄等的词语。',
  '能愿动词“会”': '“会”用在动词前，表示通过学习后，懂得怎样做或有能力做。',
  '能愿动词“想”': '能愿动词“想”用在动词前，表示希望、打算。',
  '连动句（1）':
    '连动句的谓语部分由两个或两个以上动词性短语构成。连动句有两种意义：（1）表示动作的目的；（2）表示动作的方式。',
  '疑问代词“怎么”': '疑问代词“怎么”用在动词前，询问方式。',
  '时间的表达（2）':
    '“点、分”表示具体时间点。整点使用“点”，不是整点使用“分”。“分”可以省略，但是，当时间为“十分”时，不能省略“分”；当时间为十分钟以下时，要读出“零”。“上午、中午、下午、晚上”等时间名词可以表达时间段。这些时间名词后还可以直接加时间点。',
  '语气助词“吧”（1）': '本课语气助词“吧”读轻声（ba），在句子末尾，表示建议、商量、劝告、请求。',
  '副词、时间词语作状语的位置': '在汉语中，副词、时间词语作状语时，一般都要在动词或形容词前。',
  '语气助词“呢”（2）': '本课语气助词“呢”位于句子末尾，表示确认的事实。基本结构：……呢。',
  方位词: '本册学习的表达方向、位置的方位词有：上、下、里、外、前、后、外边。',
  '介词“在”': '介词“在”和表示位置、处所的词语组合，在动词前，表示在什么位置、处所做什么。',
  '能愿动词“能”': '能愿动词“能”位于动词前，表示有能力、有条件或可能做某事。',
  '存现句（1）':
    '存现句是表示某个地方或位置存在某人或某物的句子，一般以“有”或“是”为标记。否定时，宾语前不能使用数量词语。',
  时间词语和处所词语同时作状语的顺序: '时间词语和处所词语同时作状语时，时间词语要在处所词语前。',
  '表示序数的“第”':
    '“第”位于基数的数词前，表示序数。基本结构：（1）第+数词；（2）第+数词+量词+（名词）。',
  钱数的表达:
    '中国的货币叫人民币。人民币的单位由大到小是“元、角、分”，口语中也分别说“块、毛、分”。表达顺序是：元/块→角/毛→分。',
  形容词谓语句: '形容词可以直接作谓语，前面可用程度副词或否定副词。',
  '疑问代词“怎么样”': '疑问代词“怎么样”用于征求意见、询问状况等。基本结构：……怎么样？',
  正反问:
    '正反问格式是“X+不/没+X”，“X”是动词或形容词。动词正反问使用“不/没”，形容词正反问使用“不”。',
  '时间副词“在/正在”':
    '时间副词“在/正在”位于动词前，表示动作正在进行或情况在继续。本课有两种形式：（1）在/正在+动词；（2）在/正在+动词+呢。此外，表达正在做的事情还有第三种形式：（3）动词+呢。否定回答时，使用副词“没（有）”。',
  '能愿动词“要”': '能愿动词“要”在动词前，表示想做、打算做。',
  非主谓句: '非主谓句是由词或短语构成、不分主语和谓语的句子，口语中常用。',
  '语气助词“了”（1）':
    '语气助词“了（1）”位于句子末尾或句中停顿的地方，表示变化或出现新情况。否定回答时，用副词“没”，句子末尾不用“了”。',
  '“太……了”格式': '“太……了”用于感叹程度很高或很深。',
  '能愿动词“可以”': '能愿动词“可以”位于动词前，表示可能、能够或许可。',
  '“动词+一下”结构': '本课“动词+一下”结构表示做一次或试着做，动作时间短。',
  '双宾语句（1）': '双宾语句是一个动词带两个宾语的句子。本册学习“给、问”构成的双宾语句。',
  '动态助词“了”（2）':
    '动态助词“了（2）”在动词后，表示动作行为已经发生或完成。否定时用“没”，不加“了”。',
  '离合词（1）':
    '本册中的“上课、下课、上班、下班、说话、读书、睡觉、看病、生病”等是一类特殊的动词结构，可分可合，合在一起时是词，中间加其他成分则变成短语，所以被称为离合词。离合词分开时，可插入的成分有限。',
  '范围副词“都”': '范围副词“都”表示全部、总括，总括的对象在“都”前。否定时，否定词在“都”后。',
  '并列复句“……，还/也……”':
    '并列复句由两个或两个以上逻辑关联、结构对称的小句构成。本册学习并列复句“……，还/也……”。'
};

export const topicTables: Record<string, TopicTable[]> = {
  数字的表达: [
    {
      title: '（1）0—99的写法和读法 · The writing and pronunciation of numbers 0–99',
      readAloud: true,
      headers: [],
      rows: [
        [
          'líng\n零\n0',
          'yī\n一\n1',
          'èr\n二\n2',
          'sān\n三\n3',
          'sì\n四\n4',
          'wǔ\n五\n5',
          'liù\n六\n6',
          'qī\n七\n7',
          'bā\n八\n8',
          'jiǔ\n九\n9'
        ],
        ['shí\n十\n10', 'shíyī\n十一\n11', '', '', '', '', '', '', '', 'shíjiǔ\n十九\n19'],
        ['èrshí\n二十\n20', '', 'èrshí’èr\n二十二\n22', '', '', '', '', '', 'èrshíbā\n二十八\n28', ''],
        ['sānshí\n三十\n30', '', '', 'sānshísān\n三十三\n33', '', '', '', 'sānshíqī\n三十七\n37', '', ''],
        ['sìshí\n四十\n40', '', '', '', 'sìshísì\n四十四\n44', '', 'sìshíliù\n四十六\n46', '', '', ''],
        ['wǔshí\n五十\n50', '', '', '', '', 'wǔshíwǔ\n五十五\n55', '', '', '', ''],
        ['liùshí\n六十\n60', '', '', '', 'liùshísì\n六十四\n64', '', 'liùshíliù\n六十六\n66', '', '', ''],
        ['qīshí\n七十\n70', '', '', 'qīshísān\n七十三\n73', '', '', '', 'qīshíqī\n七十七\n77', '', ''],
        ['bāshí\n八十\n80', '', 'bāshí’èr\n八十二\n82', '', '', '', '', '', 'bāshíbā\n八十八\n88', ''],
        ['jiǔshí\n九十\n90', 'jiǔshíyī\n九十一\n91', '', '', '', '', '', '', '', 'jiǔshíjiǔ\n九十九\n99']
      ]
    },
    {
      title:
        '（2）“百”以上（含）、“万”以内数字的写法与读法 · The writing and pronunciation of numbers from 100 (inclusive) to 10,000',
      readAloud: true,
      headers: [],
      rows: [
        [
          'yìbǎi\n一百\n100',
          'èrbǎi líng bā\n二百零八\n208',
          'jiǔbǎi jiǔshíjiǔ\n九百九十九\n999'
        ],
        [
          'yìqiān\n一千\n1000',
          'yìqiān wǔbǎi èrshíbā\n一千五百二十八\n1528',
          'jiǔqiān jiǔbǎi jiǔshíjiǔ\n九千九百九十九\n9999'
        ]
      ]
    },
    {
      title: '（3）“2”的写法和读法 · The writing and pronunciation of “2”',
      zh: '数字“2”写作、读作“二（èr）”或“两（liǎng）”。一般情况下，在序数词里用“二（èr）”，如“第二”；在量词前用“两（liǎng）”。',
      en: 'The number “2” can be written and pronounced as either “二 (èr)” or “两 (liǎng)”. Generally, “二 (èr)” is used in ordinal numbers, such as “第二”, while “两 (liǎng)” is used before measure words.',
      readAloud: true,
      headers: [],
      rows: [
        ['shí’èr\n十二\n12', 'èrshí’èr\n二十二\n22', 'yìbǎi èrshí’èr\n一百二十二\n122'],
        ['liǎng ge rén\n两个人', 'liǎng kǒu rén\n两口人', 'liǎng běn shū\n两本书（two books）']
      ]
    }
  ],
  '时间的表达（1）': [
    {
      readAloud: true,
      headers: [],
      rows: [
        [
          'yī jiǔ jiǔ èr nián wǔ yuè shíliù rì / hào, Xīngqīliù\n1992年5月16日／号，星期六',
          'Saturday, May 16, 1992'
        ],
        [
          'èr líng èr sì nián shí yuè èrshí’èr rì / hào, Xīngqī’èr\n2024年10月22日／号，星期二',
          'Tuesday, October 22, 2024'
        ]
      ]
    },
    {
      fluidColumns: true,
      headers: [],
      rows: [
        [
          'Yīyuè\n一月\nJanuary',
          'Èryuè\n二月\nFebruary',
          'Sānyuè\n三月\nMarch',
          'Sìyuè\n四月\nApril',
          'Wǔyuè\n五月\nMay',
          'Liùyuè\n六月\nJune'
        ],
        [
          'Qīyuè\n七月\nJuly',
          'Bāyuè\n八月\nAugust',
          'Jiǔyuè\n九月\nSeptember',
          'Shíyuè\n十月\nOctober',
          'Shíyīyuè\n十一月\nNovember',
          'Shí’èryuè\n十二月\nDecember'
        ]
      ]
    },
    {
      fluidColumns: true,
      headers: [],
      rows: [
        [
          'Xīngqīyī\n星期一\nMonday',
          'Xīngqī’èr\n星期二\nTuesday',
          'Xīngqīsān\n星期三\nWednesday',
          'Xīngqīsì\n星期四\nThursday'
        ],
        [
          'Xīngqīwǔ\n星期五\nFriday',
          'Xīngqīliù\n星期六\nSaturday',
          'Xīngqīrì / Xīngqītiān\n星期日／星期天\nSunday'
        ]
      ]
    },
    {
      headers: [],
      rows: [
        ['Jīntiān jiǔ yuè bā hào.\n今天9月8号。 Today is September 8.'],
        [
          'Jīntiān shì èr líng èr wǔ nián wǔ yuè èrshí’èr hào.\n今天是2025年5月22号。 Today is May 22, 2025.'
        ],
        [
          'Míngtiān shì èr líng èr sì nián bā yuè shíbā hào, Xīngqītiān.\n明天是2024年8月18号，星期天。 Tomorrow is Sunday, August 18, 2024.'
        ]
      ]
    }
  ],
  '时间的表达（2）': [
    {
      title:
        '（1）使用“点、分”表达时间点 · Using “点” and “分” to express specific times',
      zh: '“点、分”表示具体时间点，整点使用“点”，不是整点使用“分”，“分”可以省略。但是，当时间为“十分”时，不能省略“分”；当时间为十分钟以下时，要读出“零”。',
      en: 'The words “点” and “分” are used to indicate specific points in time. “点” is used for whole hours, while “分” is used when minutes are involved. The word “分” can be omitted. However, when the time is exactly ten minutes, “分” cannot be omitted. For times less than ten minutes, “零” must be pronounced.',
      readAloud: true,
      headers: ['点', '分', '数字写法 · Numerical notation'],
      rows: [
        ['九点', '', '9:00'],
        ['二十点', '', '20:00'],
        ['十五点', '四十', '15:40'],
        ['二十一点', '十分', '21:10'],
        ['二十二点', '零五', '22:05']
      ]
    },
    {
      title:
        '（2）使用“上午、中午、下午、晚上”等时间名词表达时间段 · Using time nouns such as “上午”, “中午”, “下午”, and “晚上” to express time periods',
      zh: '“上午、中午、下午、晚上”等时间名词可以表达时间段。这些时间名词后还可以直接加时间点。',
      en: 'Time nouns such as “上午”, “中午”, “下午”, and “晚上” can be used to express time periods, and they can be directly followed by a specific time.',
      readAloud: true,
      headers: [],
      rows: [],
      examples: ['上午', '中午十二点', '下午两点半', '晚上九点十分']
    }
  ],
  '离合词（1）': [
    {
      readAloud: true,
      centerCells: true,
      headers: ['合（combined form）', '分（separated form）'],
      rows: [
        [
          '睡觉\n上课\n下班\n生病\n说话',
          '睡了觉；睡了一觉\n上了课；上中文课\n下了班\n生了病；生了大病\n说了话；说了很多话'
        ]
      ]
    }
  ],
  钱数的表达: [
    {
      readAloud: true,
      headers: ['写法1 · Written form 1', '写法2 · Written form 2', '读法 · Pronunciation'],
      rows: [
        ['0.02元', '两分', 'liǎng fēn'],
        ['0.2元', '两毛', 'liǎng máo'],
        ['3元', '三块', 'sān kuài'],
        ['3.2元', '三块二', 'sān kuài èr'],
        ['6.02元', '六块零两分', 'liù kuài líng liǎng fēn'],
        ['202.2元', '二百零二块两毛', 'èrbǎi líng èr kuài liǎng máo']
      ]
    }
  ]
};
