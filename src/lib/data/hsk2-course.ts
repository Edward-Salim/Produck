import type {
  BookTopicGuide,
  ClassroomTopic,
  Lesson,
  TopicTable
} from './hsk1-course.js';

const topics = (...items: string[]) => items;

export const hsk2Lessons: Lesson[] = [
  { number: 1, hanzi: '她请我们吃了北京烤鸭', pinyin: 'Tā qǐng wǒmen chī le Běijīng kǎoyā', title: 'She treated us to Peking Duck', page: '001', classroom: topics('语气助词“吧”（2） · Modal Particle “吧” (2)', '“是……的”句 · “是……的” Sentence', '兼语句 · Pivotal Sentences') },
  { number: 2, hanzi: '还是打车去北大吧', pinyin: 'Háishi dǎchē qù Běidà ba', title: "Let’s take a taxi to Peking University instead", page: '010', classroom: topics('固定格式“还是……吧” · Fixed Pattern “还是……吧”', '用“多”表达概数 · Expressing Approximate Numbers with “多”', '动词或动词性短语、主谓短语作定语 · Verbs, Verbal Phrases, and Subject-Predicate Phrases as Attributives') },
  { number: 3, hanzi: '我想去西安旅游', pinyin: 'Wǒ xiǎng qù Xī’ān lǚyóu', title: "I want to visit Xi’an", page: '019', classroom: topics('结果补语 · Complement of Result', '动词重叠（1） · Verb Reduplication (1)', '动词重叠（2） · Verb Reduplication (2)') },
  { number: 4, hanzi: '你穿红色的很好看', pinyin: 'Nǐ chuān hóngsè de hěn hǎokàn', title: 'You look pretty good in red', page: '029', classroom: topics('动态助词“过” · Aspect Particle “过”', '因果复句“因为……，所以……” · Causal Complex Sentence “因为……，所以……”', '“的”字短语 · “的” Phrase') },
  { number: 5, hanzi: '第一次去中国朋友家', pinyin: 'Dì-yī cì qù Zhōngguó péngyou jiā', title: "Visiting a Chinese friend’s home for the first time", page: '037', classroom: topics('简单趋向补语（1） · Simple Complement of Direction (1)', '简单趋向补语（2） · Simple Complement of Direction (2)', '固定格式“都……了” · Fixed Pattern “都……了”') },
  { number: 6, hanzi: '小雪，生日快乐！', pinyin: 'Xiǎoxuě, shēngrì kuàilè!', title: 'Happy birthday, Xiaoxue!', page: '047', classroom: topics('形容词重叠 · Adjective Reduplication', '固定短语“什么的” · Set Phrase “什么的”', '结构助词“地” · Structural Particle “地”') },
  { number: 7, hanzi: '他篮球打得很好', pinyin: 'Tā lánqiú dǎ de hěn hǎo', title: 'He plays basketball very well', page: '056', classroom: topics('紧缩复句“一……就……” · Contracted Complex Sentence “一……就……”', '状态补语（1） · Complement of State (1)', '状态补语（2） · Complement of State (2)') },
  { number: 8, hanzi: '虽然你忘了，但是我记得', pinyin: 'Suīrán nǐ wàng le, dànshì wǒ jìde', title: 'Even though you forgot, I remembered', page: '064', classroom: topics('比较句（1） · Comparative Sentences (1)', '比较句（2） · Comparative Sentences (2)', '转折复句“虽然……，但是……” · Adversative Complex Sentence “虽然……，但是……”') },
  { number: 9, hanzi: '我去买杯奶茶', pinyin: 'Wǒ qù mǎi bēi nǎichá', title: "I’m going to buy a cup of bubble tea", page: '075', classroom: topics('比较句（3） · Comparative Sentences (3)', '动词“离” · Verb “离”', '时量补语（1） · Complement of Duration (1)') },
  { number: 10, hanzi: '就要考试了', pinyin: 'Jiù yào kǎoshì le', title: 'The exam is coming', page: '084', classroom: topics('主谓谓语句 · Sentences with a Subject-Predicate Phrase as the Predicate', '选择问句 · Alternative Questions', '固定格式“要/快/快要/就要……了” · Fixed Pattern “要/快/快要/就要……了”') },
  { number: 11, hanzi: '我最喜欢吃中国菜', pinyin: 'Wǒ zuì xǐhuan chī Zhōngguó cài', title: 'I like Chinese food the most', page: '093', classroom: topics('动态助词“着”（1） · Aspect Particle “着” (1)', '动态助词“着”（2） · Aspect Particle “着” (2)', '程度副词“最” · Adverb of Degree “最”') },
  { number: 12, hanzi: '这里比北京冷多了', pinyin: 'Zhèlǐ bǐ Běijīng lěng duō le', title: 'It’s much colder here than in Beijing', page: '102', classroom: topics('比较句（4） · Comparative Sentences (4)', '比较句（5） · Comparative Sentences (5)', '比较句（6） · Comparative Sentences (6)') },
  { number: 13, hanzi: '我们爱上中文课', pinyin: 'Wǒmen ài shàng Zhōngwén kè', title: 'We love attending Chinese class', page: '112', classroom: topics('双宾语句（2） · Double-Object Sentences (2)', '比较句（7） · Comparative Sentences (7)', '比较句（8） · Comparative Sentences (8)') },
  { number: 14, hanzi: '一个人过年多没意思啊', pinyin: 'Yí ge rén guònián duō méi yìsi a', title: 'It’s boring to celebrate the Spring Festival alone', page: '121', classroom: topics('存现句（2） · Existential Sentences (2)', '程度副词“多” · Adverb of Degree “多”', '复合趋向补语 · Compound Complement of Direction') },
  { number: 15, hanzi: '我想再去一次中国', pinyin: 'Wǒ xiǎng zài qù yí cì Zhōngguó', title: 'I want to go to China again', page: '130', classroom: topics('动量补语（1） · Complement of Frequency (1)', '动量补语（2） · Complement of Frequency (2)', '“有”字句（2） · “有” Sentence (2)') }
];

export const hsk2ClassroomTopics: ClassroomTopic[] = hsk2Lessons.flatMap((lesson) =>
  lesson.classroom.map((title) => ({ title, lesson }))
);

export const hsk2EnglishGrammarEquivalents: Record<string, string> = {
  '语气助词“吧”（2）': 'Tag questions',
  '“是……的”句': 'It was … that …',
  兼语句: 'Ask / let someone do',
  '固定格式“还是……吧”': 'Had better',
  '用“多”表达概数': 'Over / more than',
  '动词或动词性短语、主谓短语作定语': 'Relative clauses',
  结果补语: 'Verb + result',
  '动词重叠（1）': 'Briefly / a little',
  '动词重叠（2）': 'Did briefly',
  '动态助词“过”': 'Have ever',
  '因果复句“因为……，所以……”': 'Because / so',
  '“的”字短语': 'The one / ones',
  '简单趋向补语（1）': 'Come in / go out',
  '简单趋向补语（2）': 'Bring in / take out',
  '固定格式“都……了”': 'Already / by now',
  '固定短语“什么的”': 'And so on',
  '结构助词“地”': '“-ly” adverbs',
  '紧缩复句“一……就……”': 'As soon as',
  '状态补语（1）': 'Verb + adverb',
  '状态补语（2）': 'Verb + object + adverb',
  '比较句（1）': '“-er” / more … than',
  '比较句（2）': 'Even “-er” / more',
  '转折复句“虽然……，但是……”': 'Although / but',
  '比较句（3）': 'Not as … as',
  '动词“离”': 'Distance from',
  '时量补语（1）': 'For + duration',
  主谓谓语句: 'As for …',
  选择问句: 'A or B?',
  '固定格式“要/快/快要/就要……了”': 'Be about to',
  '动态助词“着”（1）': 'Be “-ing” / remain',
  '动态助词“着”（2）': 'Ongoing actions / states',
  '程度副词“最”': 'Superlatives',
  '比较句（4）': 'Much “-er” / much more',
  '比较句（5）': 'Do … better than',
  '比较句（6）': 'Do something better than',
  '双宾语句（2）': 'Give someone something',
  '比较句（7）': 'Three years older',
  '比较句（8）': 'A little “-er”',
  '存现句（2）': 'There is / are',
  '程度副词“多”': 'How + adjective!',
  复合趋向补语: 'Come in / go out',
  '动量补语（1）': 'Once / twice',
  '动量补语（2）': 'Once / twice + object',
  '“有”字句（2）': 'For / in + duration'
};

function guide(zh: string, en: string, examples: string[], pattern = ''): BookTopicGuide {
  return { summary: en, pattern, examples: [], blocks: [{ zh, en, examples }] };
}

const guides: Record<string, BookTopicGuide> = {
  '语气助词“吧”（2）': guide('语气助词“吧”用在疑问句末尾，表达揣测、估计的语气。', 'The modal particle “吧” is used at the end of an interrogative sentence to express a tone of speculation or estimation.', ['你们就是她的学生吧？', '她唱歌很好听吧？', '陈天中是泰国人吧？']),
  '“是……的”句': guide('“是……的”句用来强调事情发生的时间、地点、方式、动作发出者、目的等。肯定句和疑问句中可以省略“是”，否定句中不能省略“是”。', 'The “是……的” sentence is used to emphasize the time, place, manner, agent, purpose, and so on of an event. In affirmative and interrogative sentences, “是” can be omitted, but it cannot be omitted in negative sentences.', ['我们是来旅游的。', '苹果在哪儿买的？', '我们不是坐出租车去的。'], '主语+是+强调部分+动词+的'),
  兼语句: guide('兼语句的谓语由两个动词短语组成，前一个动词的宾语是第二个动词的主语。前一个动词是“请、让、叫”时，表示让某人做某事。基本结构：主语+请/让/叫+宾语（→主语）+动词或动词性短语。', 'A pivotal sentence consists of two verbal phrases, in which the object of the first verb serves as the subject of the second verb. When the preceding verb is “请”, “让”, or “叫”, it indicates asking or having someone do something. Basic structure: Subject+请/让/叫+Object (→Subject)+Verb or Verbal Phrase.', ['我想请你帮个忙。', '王老师让我们说中文。', '妈妈叫孩子们回家。'], '主语+请/让/叫+宾语+动词或动词性短语'),
  '固定格式“还是……吧”': guide('固定格式“还是……吧”表示倾向性选择，有“这么办比较好”的意思。', 'The fixed pattern “还是……吧” is used to express a preferential choice, with the connotation that “this way is better”.', ['我们还是打车去吧。', '那件衣服很好看，还是买那件吧。', '你第一次去北京，还是找个人接你吧。'], '还是+动词短语+吧'),
  '用“多”表达概数': guide('“多”用在数词或数量词后，表示有零头。当数字是10的整数倍时，“多”一般用在数词后面；当数字不是10的整数倍时，“多”一般用在量词后面。', 'Adding “多” after a number or a numeral phrase indicates that the quantity is slightly greater than the stated number. When the number is a multiple of ten, “多” is usually placed directly after the numeral. When the number is not a multiple of ten, “多” is usually placed after the measure word.', ['北京大学有四万多名学生呢！', '教室里有二十多个学生。', '这两个苹果五块多钱。']),
  '动词或动词性短语、主谓短语作定语': guide('动词或动词性短语、主谓短语用在名词前面，表示名词的特征或状态。', 'Verbs, verbal phrases, or subject-predicate phrases can be placed before a noun to indicate the characteristics or state of that noun.', ['他们卖的电影票也很便宜。', '现在学中文的学生很多。', '这是朋友给我的杯子。']),
  结果补语: {
    summary: 'Some verbs or adjectives can be placed after a verb to indicate the result of the action.',
    pattern: '动词+结果补语',
    examples: [],
    blocks: [
      {
        zh: '一些动词或者形容词用在动词后面，表示动作的结果。',
        en: 'Some verbs or adjectives can be placed after a verb to indicate the result of the action.',
        examples: ['菜都做好了。', '我吃完饭了。', '小雪今天来晚了。']
      },
      {
        zh: '否定形式是在动词前面加“没（有）”，同时要去掉“了”。',
        en: 'The negative form is formed by adding “没（有）” before the verb and removing “了”.',
        examples: ['我没吃完饭。', '小雪没来晚。']
      },
      {
        zh: '疑问形式有三种，分别是：（1）在句尾加“了吗”；（2）在句尾加“（了）没有”；（3）动词+没+动词+结果补语。',
        en: 'There are three types of interrogative forms: (1) add “了吗” at the end of the sentence; (2) add “（了）没有” at the end of the sentence; and (3) Verb+没+Verb+Complement of Result.',
        examples: ['你吃完饭了吗？', '小雪来晚了没有？', '你学没学会？']
      }
    ]
  },
  '动词重叠（1）': guide('动作性比较强、能重复或持续的动词重叠使用，表示时间短、数量少、尝试等意思，语气比较轻松、随意，多用于口语。单音节动词的重叠形式是“A（一）A”，双音节动词的重叠形式是“ABAB”，离合词的重叠形式是“AAB”。', 'Action verbs that are dynamic, repeatable or continuous may appear in a reduplicated form. Such reduplication usually indicates brief actions, limited repetitions, or simple attempts. It conveys a relaxed and casual tone and is mostly used in spoken Chinese. The reduplicated form of a monosyllabic verb is “A（一）A”; that of a disyllabic verb is “ABAB”; and that of a separable word is “AAB”.', ['那你再想一想，你想好了，我来买票。', '我有点儿累，现在想休息休息。', '你能过来帮帮忙吗？']),
  '动词重叠（2）': guide('表达已经发生的情况时，单音节动词的重叠形式是“A了A”；双音节动词一般不能用重叠形式，只能用“AB了一下”；离合词的重叠形式是“A了AB”。', 'When describing an action that has already taken place, the reduplicated form of a monosyllabic verb is “A了A”. Generally, a disyllabic verb cannot be used in its reduplicated form; instead, “AB了一下” is used. The reduplicated form of a separable word is “A了AB”.', ['我看了看网上的介绍。', '我休息了一下，现在觉得不累了。', '他昨天来帮了帮忙。']),
  '动态助词“过”': {
    summary: 'The aspect particle “过” is used after a verb to indicate that an action occurred in the past but has not continued to the present.',
    pattern: '主语+动词+过+宾语',
    examples: [],
    blocks: [
      {
        zh: '动态助词“过”用在动词后面，表示动作曾在过去发生，但未持续到现在。基本结构：主语+动词+过+宾语。否定形式是在动词前面加“没（有）”。',
        en: 'The aspect particle “过” is used after a verb to indicate that an action occurred in the past but has not continued to the present. Basic structure: Subject+Verb+过+Object. The negative form is constructed by adding “没（有）” before the verb.',
        examples: ['她去过中国。', '我吃过饺子，很好吃。', '她没去过中国。']
      },
      {
        zh: '疑问形式有三种：（1）在句尾加“吗”；（2）在句尾加“没有”；（3）动词+没+动词+过。',
        en: 'There are three types of interrogative forms: (1) add “吗” at the end of the sentence; (2) add “没有” at the end of the sentence; and (3) Verb+没+Verb+过.',
        examples: ['我们来过这家商场吗？', '陈天中吃过饺子没有？', '你看没看过那个电影？']
      }
    ]
  },
  '因果复句“因为……，所以……”': guide('“因为……，所以……”构成因果关系复句。“因为”和“所以”可以成对使用，也可以只用其中的一个。', 'The structure “因为……，所以……” forms a complex sentence expressing cause and effect. “因为” and “所以” can be used either together as a pair or individually.', ['就是因为没穿过，所以要试试啊！', '因为我生病了，今天没去上班。', '我没去过他家，所以让他来车站接我。']),
  '“的”字短语': guide('结构助词“的”用在名词、代词、动词、形容词等后面，组成“的”字短语，相当于名词性短语。', 'The structural particle “的” is used after nouns, pronouns, verbs, adjectives, etc., to form a “的” phrase, which functions as a noun phrase.', ['红色的、绿色的、黑色的，你想买哪个？（=红色的书包、绿色的书包、黑色的书包）', '这个面包是爸爸买的，妈妈买的在那儿。（=买的面包）', '这件衣服太贵了，还是买那件便宜的吧。（=便宜的衣服）']),
  '简单趋向补语（1）': {
    summary: 'The basic structure of simple complements of direction is “Verb+来/去”.',
    pattern: '动词+来/去',
    examples: [],
    blocks: [
      {
        zh: '简单趋向补语的基本结构是“动词+来/去”。其中，“来”表示动作朝着说话人的方向进行，“去”表示动作背离说话人的方向进行，最常用的动词有“上、下、进、出（chū, get out）、回、过”。',
        en: 'The basic structure of simple complements of direction is “Verb+来/去”. Here, “来” indicates that the action is moving toward the speaker, while “去” indicates that the action is moving away from the speaker. In this structure, the most commonly used verbs include “上”, “下”, “进”, “出”, “回”, and “过”.',
        examples: [
          '我不上去了，就在下面等你。（说话人在下边，听话人在上边）',
          '家月到下边了，你下去接她吧。（说话人在上边，听话人在上边）',
          '我在外边呢，你出来（chūlái, come out）吧。（说话人在外边，听话人在里边）'
        ]
      },
      {
        zh: '另外，“叫、开、买、拿、请、送、要、找、走”等动词也可以用在这个结构中。',
        en: 'Additionally, verbs such as “叫”, “开”, “买”, “拿”, “请”, “送”, “要”, “找”, and “走” can also be used in this structure.',
        examples: ['她拿来一本中文书。', '你别过来拿了，我给你送去。']
      },
      {
        zh: '“起来（qǐlái, get up）”是一种比较特殊的用法，它表示起床或动作向上的趋向。',
        en: '“起来” is a special expression in Chinese that can either mean “to get up (from bed)”, or indicate an upward directional movement.',
        examples: ['今天早上5点她就起来了。', '你起来吧，让小妹妹坐这儿。']
      }
    ]
  },
  '简单趋向补语（2）': {
    summary: 'When a verb takes both a simple complement of direction and an object, the object’s position depends on its type.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '动词既带简单趋向补语，又带宾语时，如果宾语是地点名词，放在“来/去”前面；宾语是事物名词，放在“来/去”前后都可以。',
        en: 'When a verb takes both a simple complement of direction and an object: if the object is a location noun, place it before “来/去”; if the object is a thing noun, it can be placed either before or after “来/去”.',
        examples: ['你们太客气了，还拿这么多礼物来！', '家月给我送来了一本书。', '上课了，你们快进教室来吧。']
      },
      {
        zh: '另外，动词“开、买、拿、请、送、要、找、走”等也可以加上“上、下、进、出、回、过”等简单趋向补语。这种情况下，动词一般带宾语，并且放在“上、下、进、出、回、过”后面。',
        en: 'In addition, verbs such as “开”, “买”, “拿”, “请”, “送”, “要”, “找”, and “走” can also combine with complements of direction like “上”, “下”, “进”, “出”, “回”, and “过”. In this case, the verb usually takes an object, which is placed after “上”, “下”, “进”, “出”, “回”, and “过”.',
        examples: ['爸爸今天买回了很多水果。', '妈妈拿出了二十块钱，让小雪自己去买点儿吃的。']
      }
    ]
  },
  '固定格式“都……了”': guide('固定格式“都……了”表示已经、达到，一般含有强调或者不满的语气。', 'The fixed pattern “都……了” conveys meanings such as “already” or “up to a certain point”, and generally carries a tone of emphasis or dissatisfaction.', ['都12点了，我们吃饭吧。', '都8点半了，你还不起床吗？', '我都去过北京了，不想再去了。']),
  形容词重叠: guide('单音节形容词“A”的重叠形式为“AA”，双音节形容词“AB”的重叠形式一般为“AABB”。形容词重叠表示程度深或者表达喜爱的情感。', 'The reduplicated form of a monosyllabic adjective “A” is “AA”, while the reduplicated form of a disyllabic adjective “AB” is generally “AABB”. Adjective reduplication is often used to intensify the degree of the adjective or to express feelings of fondness or affection.', ['我再给她买个大大的生日蛋糕。', '这只猫小小的，真让人喜欢。', '一雪的女儿每天都漂漂亮亮的。']),
  '固定短语“什么的”': guide('固定短语“什么的”表示“……之类”的意思。基本结构：……什么的。', 'The set phrase “什么的” indicates “and so on” or “and the like”. Basic structure: ……什么的.', ['画我们的家！有爸爸、妈妈、弟弟，还有黑色的狗、白色的猫什么的。', '桌子上有电脑、杯子、书和画笔什么的。', '她拿来了一些水、面包和苹果什么的。'], '……什么的'),
  '结构助词“地”': guide('结构助词“地”一般用在形容词和动词中间，表示动作行为的状态或方式。', 'The structural particle “地” is generally placed between an adjective and a verb to indicate the manner or state in which an action is performed.', ['过生日就要吃好吃的，还要高高兴兴地玩。', '老师早早地到了教室。', '爸爸很快地吃完早饭，就去上班了。']),
  '紧缩复句“一……就……”': guide('“一……就……”表示第二个动作紧接着第一个动作发生，也表示第一个动作是条件或原因，第二个动作是结果。两个分句的主语相同时，主语放在“一”前或“就”前；主语不同时，两个主语分别放在“一”和“就”前。', 'The contracted complex sentence “一……就……” indicates that the second action occurs immediately after the first; it also means the first action serves as the condition or cause, and the second as the result. When the subjects are the same, the subject is placed before “一” or “就”; when the subjects are different, the two subjects are placed before “一” and “就” respectively.', ['你怎么一下课就往外跑？', '我一到家，妈妈就打来电话了。', '一到星期六，陈天中就跟同学去打篮球。']),
  '状态补语（1）': {
    summary: 'The complement of state follows a verb to supplement the state of the action.',
    pattern: '动词+得+形容词性短语',
    examples: [],
    blocks: [
      {
        zh: '状态补语是在动词后边补充说明动作进行的状态的。基本结构：动词+得+形容词性短语。否定形式是在形容词的前面加“不”。',
        en: 'The complement of state follows a verb to supplement the state of the action. Basic structure: Verb+得+Adjectival Phrase. The negative form is to add “不” before the adjective.',
        examples: ['我踢得还可以。', '他们玩得很高兴。', '白家月跑得不快。']
      },
      {
        zh: '疑问形式有三种：（1）在句尾加“吗”；（2）动词+得+形容词+不+形容词；（3）动词+得+怎么样。',
        en: 'There are three interrogative forms: (1) add “吗” at the end of the sentence; (2) Verb+得+Adjective+不+Adjective; and (3) Verb+得+怎么样.',
        examples: ['你跑得快吗？', '他来得早不早？', '他们玩得怎么样？']
      }
    ]
  },
  '状态补语（2）': guide('带状态补语的句子中，如果动词是离合词，需要重复动词性语素。如果动词有宾语，可以把宾语提前，或者重复动词。', 'In sentences with a complement of state: if the verb is a separable word, the verbal morpheme needs to be repeated; if the verb takes an object, the object can be placed before the verb or the verb can be repeated.', ['我游泳游得不快。', '你篮球打得怎么样？', '白家月写汉字写得很好看。']),
  '比较句（1）': guide('本课学习用介词“比”来比较性质和状态差别的比较句。基本结构：A比B+形容词或形容词性短语。', 'In this lesson, we learn to use the preposition “比” in comparative sentences to compare differences in nature and state. Basic structure: A 比 B+Adjective or Adjectival Phrase.', ['我也觉得左边的比右边的好看。', '今天比昨天冷。', '他觉得踢足球比打篮球有意思。']),
  '比较句（2）': guide('在用“比”的比较句中，形容词前不能用“很”“非常”等程度副词，可以用“还”和“更”表示程度加深。', 'In comparative sentences with “比”, adverbs of degree such as “很” and “非常” cannot be used before the adjective, but “还” and “更” can be used to enhance the degree.', ['我看网上说这个电影比那个爱情片更有意思。（爱情片很有意思，这个电影更有意思）', '今天比昨天更热。（昨天很热，今天更热）', '我觉得奶茶比牛奶还好喝。（我觉得牛奶很好喝，奶茶更好喝）']),
  '转折复句“虽然……，但是……”': guide('“虽然……，但是……”构成转折复句，“虽然”和“但是”可以成对使用，也可以只用其中一个。', '“虽然……，但是……” forms an adversative complex sentence. The two words can be used in pairs or singly.', ['虽然你忘了，但是我记得。', '外边下雪了，但是不太冷。', '虽然觉得有点儿累，我还是走回家了。']),
  '比较句（3）': {
    summary: 'In this lesson, we learn to use “没有” in comparative sentences.',
    pattern: 'A没有B+形容词或形容词性短语',
    examples: [],
    blocks: [
      {
        zh: '本课学习用“没有”表示比较的比较句，意思是“不如”“不及”。基本结构：A没有B+形容词或形容词性短语。形容词前面可以加“这么”或者“那么”，表示B的程度更高。',
        en: 'In this lesson, we learn to use “没有” in comparative sentences to express the meaning of “not as…as” or “inferior to”. Basic structure: A没有B+Adjective or Adjectival Phrase. The adjective can be preceded by “这么” or “那么” to indicate that B has a higher degree.',
        examples: ['儿子的个子没有他那么高。', '昨天没有今天这么冷。', '这块手表没有那块好看。']
      },
      {
        zh: '“没有”的肯定形式“有”常用在表示比较的疑问句中。',
        en: 'The affirmative form of “没有”, which is “有”, is often used in interrogative sentences to indicate comparison.',
        examples: ['妹妹有姐姐高吗？', '那件衣服有这件好看吗？']
      }
    ]
  },
  '动词“离”': guide('动词“离”表示处所、时间的距离。基本结构：A离B……。', 'The verb “离” indicates spatial or temporal distance. Basic structure: A离B…….', ['咖啡店离这儿有点儿远。', '学校离医院不远。', '现在离我的生日还有三天。']),
  '时量补语（1）': {
    summary: 'Time expressions are used after verbs to form complements of duration.',
    pattern: '主语+动词+时量补语',
    examples: [],
    blocks: [
      {
        zh: '表示时间段的词语用在动词后面构成时量补语，说明动作或状态持续的时间。基本结构：主语+动词+时量补语。',
        en: 'Time expressions are used after verbs to form complements of duration, indicating the length of time an action or a state lasts. Basic structure: Subject+Verb+Complement of Duration.',
        examples: ['走半个多小时就到了。', '他们学了两年。', '我们休息十分钟。']
      },
      {
        zh: '动词后带宾语时，宾语的位置有两种情况：（1）宾语是事物名词，一般在时量补语后；（2）宾语是称呼或代词，一般在时量补语前。',
        en: 'When a verb is followed by an object, the position of the object can be in two cases: (1) if the object is a thing noun, it is usually placed after the complement of duration; (2) if the object is a term of address or a pronoun, it is usually placed before the complement of duration.',
        examples: ['我看了一个晚上电视。', '李文等了她一个小时。', '我找了陈天中二十多分钟。']
      },
      {
        zh: '动词带宾语时，也可以重复动词后再加时量补语。',
        en: 'When a verb is followed by an object, the verb can be repeated before adding the complement of duration.',
        examples: ['他们学中文学了两年。', '李文等她等了一个小时。']
      },
      {
        zh: '动词是离合词时，需要重复动词性语素，再加时量补语。',
        en: 'When the verb is a separable word, the verbal morpheme needs to be repeated before adding the complement of duration.',
        examples: ['安妮游泳游了一个下午。', '陈天中跑步跑了两个小时。']
      },
      {
        zh: '动词后有“了”，句尾还有语气助词“了”，表示动作仍在进行。',
        en: 'When “了” follows the verb and another “了” appears at the end of the sentence as a modal particle, it indicates that the action is still ongoing.',
        examples: ['他写了半个小时汉字了。（他现在还在写汉字。）', '陈天中跑步跑了两个小时了。（陈天中还在跑步。）']
      }
    ]
  },
  主谓谓语句: guide('主谓短语可以作谓语，对主语加以说明或描写，构成主谓谓语句。一般来说，主谓短语中的主语是全句主语的一部分或跟它相关。基本结构：主语+主谓短语。', 'A subject-predicate phrase can function as a predicate, providing an explanation or description of the subject, thereby forming a sentence with a subject-predicate phrase as the predicate. Generally speaking, the subject in the subject-predicate phrase is either a part of the whole sentence’s subject or related to it. Basic structure: Subject+Subject-Predicate Phrase.', ['我的书包你看见了吗？', '弟弟手很小。', '这件事他知道。'], '主语+主谓短语'),
  选择问句: guide('连词“还是”用在疑问句中，表示选择。基本结构：（是）A还是B。', 'The conjunction “还是” is used in interrogative sentences to indicate a choice. Basic structure: （是）A还是B.', ['妈妈，是您准备考试还是我准备考试？', '你更喜欢打篮球、踢足球还是游泳？', '我们什么时候去看电影？今天还是明天？']),
  '固定格式“要/快/快要/就要……了”': guide('固定格式“要/快/快要/就要……了”表示某事将要发生。如果句子中有时间状语，一般用“就要……了”。', 'The fixed pattern “要/快/快要/就要……了” is used to indicate that something is about to happen. If the sentence includes a time adverbial, “就要……了” is typically used.', ['饭菜快要做好了。', '火车快开了。', '我们下星期就要考试了。']),
  '动态助词“着”（1）': guide('动态助词“着”用在动词后面，表示动作或状态的持续，否定形式是在动词前面加“没（有）”。', 'The aspect particle “着” is used after a verb to indicate the continuation of an action or a state. The negative form is created by adding “没（有）” before the verb.', ['那你在这儿坐着。', '教室的门开着。', '教室的门没开着。']),
  '动态助词“着”（2）': {
    summary: 'In sentences indicating the continuation of an action or a state, the object must be placed after the aspect particle “着”.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '表示动作或状态持续的句子中，宾语要在动态助词“着”的后面。',
        en: 'In sentences indicating the continuation of an action or a state, the object must be placed after the aspect particle “着”.',
        examples: ['现在路上车多，还下着雪，我开慢一点儿。', '她穿着白色的裤子。', '陈天中没拿着咖啡。']
      },
      {
        zh: '疑问形式有三种：（1）在句尾加“吗”；（2）在句尾加“没有”；（3）动词+没+动词+着。',
        en: 'There are three types of interrogative forms: (1) add “吗” at the end of the sentence; (2) add “没有” at the end of the sentence; and (3) Verb+没+Verb+着.',
        examples: ['教室的门开着吗？', '白家月坐着没有？', '她拿没拿着手机？']
      }
    ]
  },
  '程度副词“最”': guide('程度副词“最”用在形容词或心理动词前面，表示某种属性超过所有同类的人或事物。', 'The adverb of degree “最” is used before adjectives or psychological verbs to indicate that a certain attribute surpasses all similar people or things.', ['你最喜欢吃中国菜。', '在我们家，爸爸最高。', '你们班谁说中文说得最好？']),
  '比较句（4）': guide('用“比”表示的比较句中，“多了”或“得多”用在形容词后面，表示差别很大。基本结构：A比B+形容词+多了/得多。', 'In comparative sentences with “比”, “多了” or “得多” is placed after the adjective to indicate a significant difference. Basic structure: A比B+Adjective+多了/得多.', ['我这里比北京冷多了。', '坐飞机比坐火车快得多。', '他觉得红茶比绿茶好喝得多。'], 'A比B+形容词+多了/得多'),
  '比较句（5）': guide('用“比”表示的比较句中，如果动词带状态补语，“比”用在动词前后都可以。', 'In comparative sentences with “比”, if the verb is followed by a complement of state, “比” can be placed either before or after the verb.', ['昨天比今天下得大。', '妈妈比我睡得晚。', '李文跑得比白家月快。']),
  '比较句（6）': guide('用“比”表示的比较句中，如果动词既带宾语，又带状态补语，可以把宾语提前，或者重复动词。如果动词是离合词，需要重复动词性语素。', 'In comparative sentences with “比”, if the verb takes both an object and a complement of state, the object can be moved to the beginning of the sentence or the verb can be repeated. If the verb is a separable word, the verbal morpheme needs to be repeated.', ['你跑步跑得比我快。', '白家月汉字写得比陈天中好。', '他踢足球比我踢得好。']),
  '双宾语句（2）': guide('双宾语句是一个动词带两个宾语的句子，一般前一个宾语指人，后一个宾语指事物。本课学习动词“拿、送、卖”加“给”构成的双宾语句。', 'A double-object sentence is a sentence in which a verb takes two objects. Generally, the first object refers to a person, while the second object refers to a thing. In this lesson, we will learn double-object sentences formed with the verbs “拿”, “送”, and “卖” combined with “给”.', ['王老师喜欢花，就送给她花吧。', '她拿给我一杯水。', '他卖给我一本中文书。']),
  '比较句（7）': guide('用“比”表示的比较句中，数量短语放在形容词后面，表示具体差别。基本结构：A比B+形容词+数量短语。', 'In comparative sentences using “比”, numeral-measure word phrases are placed after the adjective to indicate the specific difference. Basic structure: A比B+Adjective+Numeral-Measure Word Phrase.', ['今天的词比昨天多了十个。', '姐姐比我大三岁。', '坐飞机比坐火车快五个多小时。']),
  '比较句（8）': guide('用“比”表示的比较句中，“一点儿”或“一些”用在形容词后面，表示差别不大。基本结构：A比B+形容词+一点儿/一些。', 'In comparative sentences using “比”, “一点儿” or “一些” are placed after the adjective to indicate a small difference. Basic structure: A比B+Adjective+一点儿/一些.', ['比我们一起买的那个本子贵一点儿。', '姐姐比我高一点儿。', '那间教室比这间大一些。']),
  '存现句（2）': guide('动态助词“着”用在动词后面可以构成存现句，动词前面是表示处所的短语，后面一般是不确指的人或事物。基本结构：处所+动词+着+人/事物。', 'The aspect particle “着” is placed after a verb to form an existential sentence. The phrase before the verb usually indicates a location, and the phrase after the verb generally refers to unspecified people or things. Basic structure: Location+Verb+着+People/Things.', ['你家楼下站着一个人。', '爸爸手里拿着一杯咖啡。', '那间教室里坐着不少学生。'], '处所+动词+着+人/事物'),
  '程度副词“多”': guide('“多”用在感叹句中，表示程度很高。', '“多” is used in exclamatory sentences to express a high degree.', ['你一个人在这儿多没意思啊！', '我们一起去多好啊！', '多好看啊！买这件吧。']),
  复合趋向补语: {
    summary: 'Compound complements of direction indicate the direction of an action.',
    pattern: '',
    examples: [],
    blocks: [
      {
        zh: '“上、下、进、出、回、过”加上“来/去”，以及“起来”，用在动词后，可以构成复合趋向补语，表示动作的方向。',
        en: 'Verbs “上”, “下”, “进”, “出”, “回”, and “过”, combined with “来”, “去”, and “起来” are used after a verb to form compound complements of direction, indicating the direction of an action.',
        examples: ['她经常跑上来找我玩。', '楼不高，我们走上去吧。', '一听到老师叫他的名字，他就站起来了。']
      },
      {
        zh: '当动词带宾语时，有两种情况：（1）宾语是地点名词，放在“来/去”前面；（2）宾语是事物名词，放在“来/去”前后都可以。',
        en: 'When the verb takes an object, there are two cases: (1) if the object is a location noun, it is placed before “来/去”; (2) if the object is a thing noun, it can be placed either before or after “来/去”.',
        examples: ['同学们都走出教室去了。', '妈妈让我买回一些菜来。', '白家月从书包里找出来一个漂亮的本子。']
      }
    ]
  },
  '动量补语（1）': guide('“数词+次”用在动词后面，构成动量补语，表示动作发生的次数。动词同时带宾语时，如果宾语是人名或地名，放在动量补语前后都可以。', '“Numeral+次” is used after a verb to form a complement of frequency, indicating the number of times an action occurs. When the verb is followed by an object, if the object is a person’s name or a place name, it can be placed either before or after the complement of frequency.', ['我想去中国，虽然去过一次，但是很想再去一次。', '安妮去过一次北京。', '李文见了杨同乐两次。']),
  '动量补语（2）': guide('动词既带动量补语，又带宾语时，如果宾语是事物名词，一般放在动量补语后面；如果宾语是代词，放在动量补语前面。', 'When a verb is followed by both a complement of frequency and an object; if the object is a thing noun, it is generally placed after the complement of frequency; if the object is a pronoun, it is placed before the complement of frequency.', ['因为我想再吃一次烤鸭，再喝一次奶茶。', '我想找他一次。', '安妮来过这儿两次。']),
  '“有”字句（2）': guide('“有+数量短语”表示达到一定的数量。', '“有+Numeral-Measure Word Phrase” indicates reaching a certain quantity.', ['你有一年没回国了吧？', '你女儿今年有10岁了吧？', '我有一个月没给家里打电话了。'])
};

export function getHsk2TopicGuide(title: string): BookTopicGuide | undefined {
  return guides[title.split(' · ')[0]];
}

export const hsk2ChineseExplanations: Record<string, string> = {};
export const hsk2TopicTables: Record<string, TopicTable[]> = {};
