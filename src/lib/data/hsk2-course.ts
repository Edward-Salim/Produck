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

function guide(zh: string, en: string, examples: string[], pattern = ''): BookTopicGuide {
  return { summary: en, pattern, examples: [], blocks: [{ zh, en, examples }] };
}

const guides: Record<string, BookTopicGuide> = {
  '语气助词“吧”（2）': guide('语气助词“吧”用在疑问句末尾，表达揣测、估计的语气。', 'The modal particle “吧” is used at the end of an interrogative sentence to express a tone of speculation or estimation.', ['你们就是她的学生吧？', '她唱歌很好听吧？', '陈天中是泰国人吧？']),
  '“是……的”句': guide('“是……的”句用来强调事情发生的时间、地点、方式、动作发出者、目的等。肯定句和疑问句中可以省略“是”，否定句中不能省略“是”。', 'The “是……的” sentence is used to emphasize the time, place, manner, agent, purpose, and so on of an event. In affirmative and interrogative sentences, “是” can be omitted, but it cannot be omitted in negative sentences.', ['我们是来旅游的。', '苹果在哪儿买的？', '我们不是坐出租车去的。'], '主语+是+强调部分+动词+的'),
  兼语句: guide('兼语句的谓语由两个动词短语组成，前一个动词的宾语是第二个动词的主语。前一个动词是“请、让、叫”时，表示让某人做某事。基本结构：主语+请/让/叫+宾语（兼语）+动词或动词性短语。', 'A pivotal sentence consists of two verbal phrases, in which the object of the first verb serves as the subject of the second verb. With “请”, “让”, or “叫”, it indicates asking or having someone do something.', ['我想请你帮个忙。', '王老师让我们说中文。', '妈妈叫孩子们回家。'], '主语+请/让/叫+宾语+动词或动词性短语'),
  '固定格式“还是……吧”': guide('固定格式“还是……吧”用于经过比较或考虑以后提出建议。', 'The fixed pattern “还是……吧” is used to offer a suggestion after comparison or consideration.', ['我们还是打车去北大吧。', '你还是穿红色的吧。', '太晚了，还是明天再去吧。'], '还是+动词短语+吧'),
  '用“多”表达概数': guide('“多”用在数词或数量词后，表示有零头。当数字是10的整数倍时，“多”一般用在数词后面；不是10的整数倍时，“多”一般用在量词后面。', 'Adding “多” after a number or numeral phrase indicates a quantity slightly greater than the stated number. After a multiple of ten it normally follows the numeral; otherwise it normally follows the measure word.', ['北京大学有四万多名学生呢！', '教室里有二十多个学生。', '这两个苹果五块多钱。']),
  '动词或动词性短语、主谓短语作定语': guide('动词或动词性短语、主谓短语用在名词前面，表示名词的特征或状态。', 'Verbs, verbal phrases, or subject-predicate phrases can be placed before a noun to indicate the characteristics or state of that noun.', ['他们卖的电影票也很便宜。', '现在学中文的学生很多。', '这是朋友给我的杯子。']),
  结果补语: guide('一些动词或者形容词用在动词后面，表示动作的结果。否定形式是在动词前面加“没（有）”，同时去掉“了”。', 'Some verbs or adjectives can be placed after a verb to indicate the result of the action. The negative form adds “没（有）” before the verb and removes “了”.', ['菜都做好了。', '我听懂了。', '小雪今天来晚了。', '我没吃完饭。', '小雪没来晚。'], '动词+结果补语'),
  '动词重叠（1）': guide('动作性比较强、能重复或持续的动词重叠使用，表示时间短、数量少、尝试等意思，语气比较轻松、随意，多用于口语。单音节动词是“A（一）A”，双音节动词是“ABAB”，离合词是“AAB”。', 'Dynamic, repeatable, or continuous verbs may be reduplicated to indicate brief actions, limited repetitions, or attempts. Monosyllabic verbs use “A（一）A”, disyllabic verbs “ABAB”, and separable words “AAB”.', ['你看看这件衣服。', '我们休息休息吧。', '我想散散步。']),
  '动词重叠（2）': guide('表达已经发生的情况时，单音节动词的重叠形式是“A了A”；双音节动词一般用“AB了一下”；离合词的重叠形式是“A了AB”。', 'For an action that has already occurred, a monosyllabic verb uses “A了A”; a disyllabic verb generally uses “AB了一下”; and a separable word uses “A了AB”.', ['我看了看网上的介绍。', '我休息了一下，现在觉得不累了。', '他昨天来帮了帮忙。']),
  '动态助词“过”': guide('动态助词“过”用在动词后面，表示动作曾在过去发生，但未持续到现在。否定形式是在动词前面加“没（有）”。', 'The aspect particle “过” follows a verb to indicate that an action occurred in the past but has not continued to the present. The negative form adds “没（有）” before the verb.', ['她去过中国。', '我吃过饺子，很好吃。', '她没去过中国。'], '主语+动词+过+宾语'),
  '因果复句“因为……，所以……”': guide('“因为……，所以……”构成因果关系复句。“因为”和“所以”可以成对使用，也可以只用其中一个。', '“因为……，所以……” forms a complex sentence expressing cause and effect. “因为” and “所以” can be used together or individually.', ['就是因为没穿过，所以要试试嘛！', '因为我生病了，今天没去上班。', '我没去过他家，所以让他来车站接我。']),
  '“的”字短语': guide('“的”可以附在名词、代词、动词、形容词或短语后面，构成“的”字短语，指代人或事物。', '“的” can follow a noun, pronoun, verb, adjective, or phrase to form a “的” phrase referring to a person or thing.', ['你穿红色的很好看。', '这个杯子是我的。', '我喜欢吃甜的。']),
  '简单趋向补语（1）': guide('简单趋向补语的基本结构是“动词+来/去”。“来”表示动作朝着说话人的方向进行，“去”表示动作背离说话人的方向进行。', 'The basic structure of simple complements of direction is “Verb+来/去”. “来” indicates movement toward the speaker, while “去” indicates movement away from the speaker.', ['我不上去了，就在下面等你。', '家月到下边了，你下去接她吧。', '我在外边呢，你出来吧。'], '动词+来/去'),
  '简单趋向补语（2）': guide('动词既带简单趋向补语又带宾语时，如果宾语是地点名词，放在“来/去”前；宾语是事物名词，放在“来/去”前后都可以。', 'When a verb takes both a simple complement of direction and an object, a location object precedes “来/去”; a thing object may appear before or after “来/去”.', ['你们太客气了，还拿这么多礼物来！', '家月给我送来了一本书。', '上课了，你们快进教室来吧。']),
  '固定格式“都……了”': guide('固定格式“都……了”表示已经达到某种程度，一般含有强调或者不满的语气。', 'The fixed pattern “都……了” conveys “already” or “up to a certain point” and generally carries emphasis or dissatisfaction.', ['都12点了，我们吃饭吧。', '都8点半了，你还不起床吗？', '我都去过北京了，不想再去了。']),
  形容词重叠: guide('单音节形容词“A”的重叠形式为“AA”，双音节形容词“AB”的重叠形式一般为“AABB”。形容词重叠表示程度深或者表达喜爱的情感。', 'A monosyllabic adjective “A” reduplicates as “AA”, while a disyllabic adjective “AB” generally becomes “AABB”. It intensifies degree or expresses fondness.', ['我再给她买个大大的生日蛋糕。', '这只猫小小的，真让人喜欢。', '一雪的女儿每天都漂漂亮亮的。']),
  '固定短语“什么的”': guide('固定短语“什么的”表示“……之类”的意思。基本结构：……什么的。', 'The set phrase “什么的” indicates “and so on” or “and the like”.', ['画我们的家！爸爸、妈妈、哥哥、妹妹什么的。', '柜子上有电脑、杯子、书和画笔什么的。', '她拿来了一些水、面包和苹果什么的。'], '……什么的'),
  '结构助词“地”': guide('结构助词“地”一般用在形容词和动词中间，表示动作行为的状态或方式。', 'The structural particle “地” is generally placed between an adjective and a verb to indicate the manner or state in which an action is performed.', ['过生日就要吃好吃的，还要高高兴兴地玩。', '老师早早地到了教室。', '爸爸很快地吃完早饭，就去上班了。']),
  '紧缩复句“一……就……”': guide('“一……就……”表示第二个动作紧接着第一个动作发生，也表示第一个动作是条件或原因，第二个动作是结果。', 'The contracted complex sentence “一……就……” indicates that the second action occurs immediately after the first, or that the first is the condition or cause and the second the result.', ['你怎么一下课就往外跑？', '我一到家，妈妈就打来电话了。', '一到星期六，陈天中就跟同学去打篮球。']),
  '状态补语（1）': guide('状态补语在动词后边补充说明动作进行的状态。基本结构：动词+得+形容词性短语。否定形式是在形容词前面加“不”。', 'A complement of state follows a verb to describe the state of an action. Basic structure: Verb+得+Adjectival Phrase. Negation adds “不” before the adjective.', ['我踢得还可以。', '他们玩得很高兴。', '他跑得不快。'], '动词+得+形容词性短语'),
  '状态补语（2）': guide('带状态补语的句子中，如果动词是离合词，需要重复动词性语素；如果动词有宾语，可以把宾语提前，或者重复动词。', 'With a complement of state, a separable verb repeats its verbal morpheme. If a verb has an object, the object can be moved before it or the verb can be repeated.', ['我游泳游得不快。', '你篮球打得怎么样？', '白家月写汉字写得很好看。']),
  '比较句（1）': guide('本课学习用介词“比”来比较性质和状态差别。基本结构：A比B+形容词或形容词性短语。', 'The preposition “比” is used to compare differences in nature and state. Basic structure: A比B+Adjective or Adjectival Phrase.', ['我也觉得左边的比右边的好看。', '今天比昨天冷。', '他觉得踢足球比打篮球有意思。']),
  '比较句（2）': guide('用“比”的比较句中，形容词前不能用“很、非常”等程度副词，可以用“还”和“更”表示程度加深。', 'In comparative sentences with “比”, degree adverbs such as “很” and “非常” cannot precede the adjective, but “还” and “更” can enhance the degree.', ['这个电影比那个爱情片更有意思。', '今天比昨天更热。', '我觉得奶茶比牛奶还好喝。']),
  '转折复句“虽然……，但是……”': guide('“虽然……，但是……”构成转折复句，“虽然”和“但是”可以成对使用，也可以只用其中一个。', '“虽然……，但是……” forms an adversative complex sentence. The two words may be used together or individually.', ['虽然你忘了，但是我记得。', '外边下雪了，但是不太冷。', '虽然觉得有点儿累，我还是走回家了。']),
  '比较句（3）': guide('本课学习用“没有”表示比较，意思是“不如、不及”。基本结构：A没有B+形容词或形容词性短语。形容词前可以加“这么”或者“那么”。', '“没有” in comparative sentences means “not as…as” or “inferior to”. Basic structure: A没有B+Adjective or Adjectival Phrase. “这么” or “那么” may precede the adjective.', ['儿子的个子没有他那么高。', '昨天没有今天这么冷。', '这块手表没有那块好看。']),
  '动词“离”': guide('动词“离”表示处所、时间的距离。基本结构：A离B……。', 'The verb “离” indicates spatial or temporal distance. Basic structure: A离B…….', ['咖啡店离这儿有点儿远。', '学校离医院不远。', '现在离我的生日还有三天。']),
  '时量补语（1）': guide('表示时间段的词语用在动词后面构成时量补语，说明动作或状态持续的时间。基本结构：主语+动词+时量补语。', 'Time expressions follow verbs to form complements of duration, indicating how long an action or state lasts.', ['我们休息十分钟。', '他每天学习两个小时。', '我在北京住了三年。'], '主语+动词+时量补语'),
  主谓谓语句: guide('主谓短语可以作谓语，对主语加以说明或描写，构成主谓谓语句。一般来说，主谓短语中的主语是全句主语的一部分或跟它相关。', 'A subject-predicate phrase can function as a predicate to explain or describe the sentence subject. Its subject is generally part of or related to the whole sentence subject.', ['我的书包你看见了吗？', '弟弟手很小。', '他学习很好。'], '主语+主谓短语'),
  选择问句: guide('选择问句用“还是”连接两个或几个选项，让对方从中选择一个回答。', 'Alternative questions use “还是” to connect two or more choices and ask the listener to select one.', ['你喝咖啡还是茶？', '你坐地铁还是坐公共汽车？', '我们今天去还是明天去？']),
  '固定格式“要/快/快要/就要……了”': guide('“要/快/快要/就要……了”表示某件事情即将发生。句中有具体时间状语时，一般用“就要……了”。', '“要/快/快要/就要……了” indicates that something is about to happen. With a specific time expression, “就要……了” is generally used.', ['我要回国了。', '快要考试了。', '下星期就要放假了。']),
  '动态助词“着”（1）': guide('动态助词“着”用在动词后面，表示动作或状态的持续，否定形式是在动词前面加“没（有）”。', 'The aspect particle “着” follows a verb to indicate the continuation of an action or state. The negative form adds “没（有）” before the verb.', ['那你在这儿坐着。', '教室的门开着。', '教室的门没开着。']),
  '动态助词“着”（2）': guide('表示动作或状态持续的句子中，宾语要在动态助词“着”的后面。', 'In sentences indicating the continuation of an action or state, the object must follow the aspect particle “着”.', ['现在路上车多，还下着雪，我开慢一点儿。', '她穿着白色的裤子。', '陈天中没拿着咖啡。']),
  '程度副词“最”': guide('程度副词“最”用在形容词或心理动词前，表示某种属性超过所有同类的人或事物。', 'The adverb of degree “最” precedes an adjective or mental verb to indicate the highest degree among comparable people or things.', ['在我们家，爸爸最高。', '我最喜欢吃中国菜。', '这个问题最难。']),
  '比较句（4）': guide('用“比”表示的比较句中，“多了”或“得多”用在形容词后面，表示差别很大。', 'In comparative sentences with “比”, “多了” or “得多” follows the adjective to indicate a significant difference.', ['我这里比北京冷多了。', '坐飞机比坐火车快得多。', '他觉得红茶比绿茶好喝得多。'], 'A比B+形容词+多了/得多'),
  '比较句（5）': guide('比较动作或行为时，状态补语放在“比”字句的谓语后面。', 'When actions or behaviors are compared, a complement of state follows the predicate in the “比” sentence.', ['我写得比他快。', '她跑得比我慢。', '弟弟起得比姐姐早。']),
  '比较句（6）': guide('比较带宾语的动作时，可以把宾语提到“比”前，或者重复动词后再使用状态补语。', 'When comparing an action with an object, the object may be moved before “比”, or the verb may be repeated before the complement of state.', ['他踢足球比我踢得好。', '我汉字写得比他好看。', '她唱歌唱得比我好听。']),
  '双宾语句（2）': guide('双宾语句是一个动词带两个宾语的句子，一般前一个宾语指人，后一个宾语指事物。本课学习动词“拿、送、卖”加“给”构成的双宾语句。', 'A double-object sentence has a verb taking two objects, generally a person followed by a thing. This lesson covers sentences formed with “拿”, “送”, and “卖” plus “给”.', ['王老师喜欢花，就送给她花吧。', '她拿给我一杯水。', '他卖给我一本中文书。']),
  '比较句（7）': guide('用“比”的比较句中，数量词语可以放在形容词后面，表示具体的差别。', 'In a comparative sentence with “比”, a numeral-measure phrase may follow the adjective to indicate a specific difference.', ['我哥哥比我大两岁。', '这本书比那本贵十块钱。', '他比我高五厘米。']),
  '比较句（8）': guide('“一点儿”或“一些”用在形容词后面，表示差别较小。', '“一点儿” or “一些” follows the adjective to indicate a small difference.', ['姐姐比我高一点儿。', '今天比昨天冷一些。', '这件衣服比那件贵一点儿。']),
  '存现句（2）': guide('动态助词“着”用在动词后面可以构成存现句。动词前面是表示处所的短语，后面一般是不确指的人或事物。', 'The aspect particle “着” after a verb can form an existential sentence. A location phrase precedes the verb and an unspecified person or thing generally follows it.', ['你家楼下站着一个人。', '爸爸手里拿着一杯咖啡。', '那间教室里坐着不少学生。'], '处所+动词+着+人/事物'),
  '程度副词“多”': guide('程度副词“多”用在形容词前，常用于感叹句或疑问句，表示程度高。', 'The degree adverb “多” precedes an adjective, commonly in exclamations or questions, to indicate a high degree.', ['她的汉语说得多好啊！', '这里多漂亮啊！', '你看他多高兴！']),
  复合趋向补语: guide('复合趋向补语由“上、下、进、出、回、过、起”加“来/去”构成，表示动作的方向。', 'A compound complement of direction combines “上, 下, 进, 出, 回, 过, 起” with “来/去” to indicate the direction of an action.', ['我们走回家去吧。', '他从教室里跑出来了。', '请把书拿过来。']),
  '动量补语（1）': guide('“数词+次”用在动词后面，构成动量补语，表示动作发生的次数。宾语是人名或地名时，可以放在动量补语前后。', '“Numeral+次” follows a verb to form a complement of frequency. A personal name or place-name object may appear before or after it.', ['我想去中国，虽然去过一次，但是很想再去一次。', '安妮去过一次北京。', '李文见了杨同乐两次。']),
  '动量补语（2）': guide('动词带一般事物宾语和动量补语时，一般采用“动词+动量补语+宾语”的顺序；代词宾语通常放在动量补语前。', 'When a verb takes an ordinary thing object and a complement of frequency, the usual order is Verb+Frequency Complement+Object; a pronoun object normally precedes the complement.', ['我来过这儿两次。', '我看了三次这个电影。', '老师叫了他两次。']),
  '“有”字句（2）': guide('“有”字句还可以表示达到某种数量或程度，常用于年龄、长度、重量等。', 'A “有” sentence can also indicate that a quantity or degree is reached, commonly with age, length, weight, and similar measurements.', ['你的老师有三十岁吗？', '这条路有十公里长。', '这个箱子有二十公斤重。'])
};

export function getHsk2TopicGuide(title: string): BookTopicGuide | undefined {
  return guides[title.split(' · ')[0]];
}

export const hsk2ChineseExplanations: Record<string, string> = {};
export const hsk2TopicTables: Record<string, TopicTable[]> = {};
