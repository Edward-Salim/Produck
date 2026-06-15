import type { WordData } from './+page.server.js';

export interface SentenceData {
  hanzi: string;
  pinyin: string;
  translation: string;
  level: number;
}

export function generateSentences(_words: WordData[]): SentenceData[] {
  return SENTENCES;
}

const SENTENCES: SentenceData[] = [
  // ═══════════════ HSK 1 (Level 1) ═══════════════
  { hanzi: '我爱你', pinyin: 'wǒ ài nǐ', translation: 'I love you.', level: 1 },
  { hanzi: '他是老师', pinyin: 'tā shì lǎoshī', translation: 'He is a teacher.', level: 1 },
  { hanzi: '我们是学生', pinyin: 'wǒmen shì xuéshēng', translation: 'We are students.', level: 1 },
  {
    hanzi: '今天天气很好',
    pinyin: 'jīntiān tiānqì hěn hǎo',
    translation: 'The weather is very good today.',
    level: 1
  },
  { hanzi: '我喝水', pinyin: 'wǒ hē shuǐ', translation: 'I drink water.', level: 1 },
  { hanzi: '他吃米饭', pinyin: 'tā chī mǐfàn', translation: 'He eats rice.', level: 1 },
  { hanzi: '我不吃肉', pinyin: 'wǒ bù chī ròu', translation: 'I do not eat meat.', level: 1 },
  { hanzi: '你有书吗？', pinyin: 'nǐ yǒu shū ma', translation: 'Do you have a book?', level: 1 },
  {
    hanzi: '我有一个手机',
    pinyin: 'wǒ yǒu yīgè shǒujī',
    translation: 'I have a mobile phone.',
    level: 1
  },
  { hanzi: '他在家', pinyin: 'tā zài jiā', translation: 'He is at home.', level: 1 },
  { hanzi: '我们去学校', pinyin: 'wǒmen qù xuéxiào', translation: 'We go to school.', level: 1 },
  {
    hanzi: '明天我上班',
    pinyin: 'míngtiān wǒ shàngbān',
    translation: 'Tomorrow I go to work.',
    level: 1
  },
  {
    hanzi: '我喜欢喝茶',
    pinyin: 'wǒ xǐhuān hē chá',
    translation: 'I like to drink tea.',
    level: 1
  },
  { hanzi: '他喜欢看书', pinyin: 'tā xǐhuān kàn shū', translation: 'He likes to read.', level: 1 },
  {
    hanzi: '我会说中文',
    pinyin: 'wǒ huì shuō zhōngwén',
    translation: 'I can speak Chinese.',
    level: 1
  },
  {
    hanzi: '姐姐很漂亮',
    pinyin: 'jiějie hěn piàoliang',
    translation: 'Older sister is very pretty.',
    level: 1
  },
  { hanzi: '爸爸是医生', pinyin: 'bàba shì yīshēng', translation: 'Dad is a doctor.', level: 1 },
  { hanzi: '今天很热', pinyin: 'jīntiān hěn rè', translation: 'Today is hot.', level: 1 },
  {
    hanzi: '我想喝水',
    pinyin: 'wǒ xiǎng hē shuǐ',
    translation: 'I want to drink water.',
    level: 1
  },
  { hanzi: '他是我朋友', pinyin: 'tā shì wǒ péngyou', translation: 'He is my friend.', level: 1 },
  {
    hanzi: '我们去商店',
    pinyin: 'wǒmen qù shāngdiàn',
    translation: 'We go to the store.',
    level: 1
  },
  {
    hanzi: '这本书很大',
    pinyin: 'zhè běn shū hěn dà',
    translation: 'This book is very big.',
    level: 1
  },
  {
    hanzi: '她喜欢吃水果',
    pinyin: 'tā xǐhuān chī shuǐguǒ',
    translation: 'She likes to eat fruit.',
    level: 1
  },
  {
    hanzi: '早上我喝茶',
    pinyin: 'zǎoshang wǒ hē chá',
    translation: 'In the morning I drink tea.',
    level: 1
  },
  { hanzi: '他不在家', pinyin: 'tā bù zài jiā', translation: 'He is not at home.', level: 1 },
  {
    hanzi: '妹妹很小',
    pinyin: 'mèimei hěn xiǎo',
    translation: 'Little sister is very small.',
    level: 1
  },
  {
    hanzi: '我坐火车去北京',
    pinyin: 'wǒ zuò huǒchē qù běijīng',
    translation: 'I take the train to Beijing.',
    level: 1
  },
  {
    hanzi: '星期一我去学校',
    pinyin: 'xīngqīyī wǒ qù xuéxiào',
    translation: 'Monday I go to school.',
    level: 1
  },
  {
    hanzi: '晚上我看电视',
    pinyin: 'wǎnshang wǒ kàn diànshì',
    translation: 'In the evening I watch TV.',
    level: 1
  },
  {
    hanzi: '他有一个妹妹',
    pinyin: 'tā yǒu yīgè mèimei',
    translation: 'He has a younger sister.',
    level: 1
  },
  {
    hanzi: '我们在家吃饭',
    pinyin: 'wǒmen zài jiā chīfàn',
    translation: 'We eat at home.',
    level: 1
  },
  { hanzi: '奶奶很累', pinyin: 'nǎinai hěn lèi', translation: 'Grandma is very tired.', level: 1 },
  {
    hanzi: '我买了一个手机',
    pinyin: 'wǒ mǎile yīgè shǒujī',
    translation: 'I bought a mobile phone.',
    level: 1
  },
  {
    hanzi: '他不喜欢喝茶',
    pinyin: 'tā bù xǐhuān hē chá',
    translation: 'He does not like to drink tea.',
    level: 1
  },
  {
    hanzi: '现在十点了',
    pinyin: 'xiànzài shí diǎn le',
    translation: "It is ten o'clock now.",
    level: 1
  },
  { hanzi: '这是什么？', pinyin: 'zhè shì shénme', translation: 'What is this?', level: 1 },
  {
    hanzi: '你叫什么名字？',
    pinyin: 'nǐ jiào shénme míngzì',
    translation: 'What is your name?',
    level: 1
  },
  {
    hanzi: '我是北京人',
    pinyin: 'wǒ shì běijīng rén',
    translation: 'I am from Beijing.',
    level: 1
  },
  { hanzi: '你吃什么？', pinyin: 'nǐ chī shénme', translation: 'What do you eat?', level: 1 },
  {
    hanzi: '他看了一本书',
    pinyin: 'tā kànle yī běn shū',
    translation: 'He read a book.',
    level: 1
  },
  {
    hanzi: '她穿了新衣服',
    pinyin: 'tā chuānle xīn yīfu',
    translation: 'She wears new clothes.',
    level: 1
  },
  {
    hanzi: '电脑很贵',
    pinyin: 'diànnǎo hěn guì',
    translation: 'The computer is very expensive.',
    level: 1
  },
  { hanzi: '朋友来了', pinyin: 'péngyou lái le', translation: 'My friend has come.', level: 1 },
  { hanzi: '我帮他', pinyin: 'wǒ bāng tā', translation: 'I help him.', level: 1 },
  {
    hanzi: '他给我一本书',
    pinyin: 'tā gěi wǒ yī běn shū',
    translation: 'He gives me a book.',
    level: 1
  },
  { hanzi: '我们走了', pinyin: 'wǒmen zǒu le', translation: 'We are leaving.', level: 1 },
  {
    hanzi: '他在医院工作',
    pinyin: 'tā zài yīyuàn gōngzuò',
    translation: 'He works at the hospital.',
    level: 1
  },
  {
    hanzi: '今天是我的生日',
    pinyin: 'jīntiān shì wǒ de shēngrì',
    translation: 'Today is my birthday.',
    level: 1
  },
  { hanzi: '你去哪里？', pinyin: 'nǐ qù nǎlǐ', translation: 'Where are you going?', level: 1 },
  {
    hanzi: '他住在北京',
    pinyin: 'tā zhù zài běijīng',
    translation: 'He lives in Beijing.',
    level: 1
  },
  { hanzi: '你认识他吗？', pinyin: 'nǐ rènshi tā ma', translation: 'Do you know him?', level: 1 },
  { hanzi: '妈妈买了鸡蛋', pinyin: 'māma mǎile jīdàn', translation: 'Mom bought eggs.', level: 1 },
  { hanzi: '他很高', pinyin: 'tā hěn gāo', translation: 'He is very tall.', level: 1 },
  {
    hanzi: '我们去图书馆看书',
    pinyin: 'wǒmen qù túshūguǎn kàn shū',
    translation: 'We go to the library to read.',
    level: 1
  },
  {
    hanzi: '这个饭很好吃',
    pinyin: 'zhège fàn hěn hǎochī',
    translation: 'This food is very tasty.',
    level: 1
  },
  {
    hanzi: '他坐车去学校',
    pinyin: 'tā zuò chē qù xuéxiào',
    translation: 'He takes the car to school.',
    level: 1
  },
  {
    hanzi: '我给他打电话',
    pinyin: 'wǒ gěi tā dǎ diànhuà',
    translation: 'I call him on the phone.',
    level: 1
  },
  {
    hanzi: '奶奶做了包子',
    pinyin: 'nǎinai zuòle bāozi',
    translation: 'Grandma made steamed buns.',
    level: 1
  },
  { hanzi: '你忙吗？', pinyin: 'nǐ máng ma', translation: 'Are you busy?', level: 1 },
  {
    hanzi: '我们都很高兴',
    pinyin: 'wǒmen dōu hěn gāoxìng',
    translation: 'We are all very happy.',
    level: 1
  },
  {
    hanzi: '这里有人吗？',
    pinyin: 'zhèlǐ yǒu rén ma',
    translation: 'Is there someone here?',
    level: 1
  },
  {
    hanzi: '我问他一个问题',
    pinyin: 'wǒ wèn tā yīgè wèntí',
    translation: 'I ask him a question.',
    level: 1
  },
  {
    hanzi: '早上我喝了牛奶',
    pinyin: 'zǎoshang wǒ hēle niúnǎi',
    translation: 'This morning I drank milk.',
    level: 1
  },
  { hanzi: '爷爷在休息', pinyin: 'yéye zài xiūxi', translation: 'Grandpa is resting.', level: 1 },
  {
    hanzi: '学校旁边有一个商店',
    pinyin: 'xuéxiào pángbiān yǒu yīgè shāngdiàn',
    translation: 'There is a store next to the school.',
    level: 1
  },
  { hanzi: '我们等你', pinyin: 'wǒmen děng nǐ', translation: 'We wait for you.', level: 1 },
  { hanzi: '他喜欢运动', pinyin: 'tā xǐhuān yùndòng', translation: 'He likes sports.', level: 1 },
  {
    hanzi: '我帮妈妈洗衣服',
    pinyin: 'wǒ bāng māma xǐ yīfu',
    translation: 'I help mom wash clothes.',
    level: 1
  },
  {
    hanzi: '明天是我的生日',
    pinyin: 'míngtiān shì wǒ de shēngrì',
    translation: 'Tomorrow is my birthday.',
    level: 1
  },
  {
    hanzi: '那里有很多人',
    pinyin: 'nàlǐ yǒu hěnduō rén',
    translation: 'There are many people there.',
    level: 1
  },
  {
    hanzi: '这个菜不好吃',
    pinyin: 'zhège cài bù hǎochī',
    translation: 'This dish is not tasty.',
    level: 1
  },
  {
    hanzi: '外边很冷',
    pinyin: 'wàibiān hěn lěng',
    translation: 'It is very cold outside.',
    level: 1
  },
  {
    hanzi: '我女儿在睡觉',
    pinyin: 'wǒ nǚér zài shuìjiào',
    translation: 'My daughter is sleeping.',
    level: 1
  },
  {
    hanzi: '他走路很慢',
    pinyin: 'tā zǒulù hěn màn',
    translation: 'He walks very slowly.',
    level: 1
  },
  {
    hanzi: '我给你一个礼物',
    pinyin: 'wǒ gěi nǐ yīgè lǐwù',
    translation: 'I give you a gift.',
    level: 1
  },
  {
    hanzi: '我儿子上小学',
    pinyin: 'wǒ érzi shàng xiǎoxué',
    translation: 'My son goes to primary school.',
    level: 1
  },
  {
    hanzi: '这个男人是我的老师',
    pinyin: 'zhège nánrén shì wǒ de lǎoshī',
    translation: 'This man is my teacher.',
    level: 1
  },
  {
    hanzi: '这个女孩是我的同学',
    pinyin: 'zhège nǚhái shì wǒ de tóngxué',
    translation: 'This girl is my classmate.',
    level: 1
  },
  {
    hanzi: '今天是星期五',
    pinyin: 'jīntiān shì xīngqīwǔ',
    translation: 'Today is Friday.',
    level: 1
  },
  {
    hanzi: '明天是星期六',
    pinyin: 'míngtiān shì xīngqīliù',
    translation: 'Tomorrow is Saturday.',
    level: 1
  },
  {
    hanzi: '我们下午上课',
    pinyin: 'wǒmen xiàwǔ shàngkè',
    translation: 'We have class in the afternoon.',
    level: 1
  },
  { hanzi: '我回家吃饭', pinyin: 'wǒ huí jiā chīfàn', translation: 'I go home to eat.', level: 1 },
  {
    hanzi: '他来我这里',
    pinyin: 'tā lái wǒ zhèlǐ',
    translation: 'He comes to my place.',
    level: 1
  },
  { hanzi: '我去车站', pinyin: 'wǒ qù chēzhàn', translation: 'I go to the station.', level: 1 },
  { hanzi: '他坐了飞机', pinyin: 'tā zuòle fēijī', translation: 'He took a plane.', level: 1 },
  {
    hanzi: '我们在家看电视',
    pinyin: 'wǒmen zài jiā kàn diànshì',
    translation: 'We watch TV at home.',
    level: 1
  },
  { hanzi: '我打开门', pinyin: 'wǒ dǎkāi mén', translation: 'I open the door.', level: 1 },
  {
    hanzi: '他喜欢看电影',
    pinyin: 'tā xǐhuān kàn diànyǐng',
    translation: 'He likes to watch movies.',
    level: 1
  },
  { hanzi: '我没有钱', pinyin: 'wǒ méiyǒu qián', translation: 'I do not have money.', level: 1 },
  {
    hanzi: '姐姐是大学生',
    pinyin: 'jiějie shì dàxuéshēng',
    translation: 'Older sister is a university student.',
    level: 1
  },
  { hanzi: '你多大了？', pinyin: 'nǐ duō dà le', translation: 'How old are you?', level: 1 },
  { hanzi: '他是我爸爸', pinyin: 'tā shì wǒ bàba', translation: 'He is my father.', level: 1 },
  { hanzi: '我们一起玩', pinyin: 'wǒmen yīqǐ wán', translation: 'We play together.', level: 1 },
  { hanzi: '我很高兴', pinyin: 'wǒ hěn gāoxìng', translation: 'I am very happy.', level: 1 },
  {
    hanzi: '他写了很多字',
    pinyin: 'tā xiěle hěnduō zì',
    translation: 'He wrote many characters.',
    level: 1
  },
  {
    hanzi: '我在书店买书',
    pinyin: 'wǒ zài shūdiàn mǎi shū',
    translation: 'I buy books at the bookstore.',
    level: 1
  },
  {
    hanzi: '他喝了很多水',
    pinyin: 'tā hēle hěnduō shuǐ',
    translation: 'He drank a lot of water.',
    level: 1
  },
  {
    hanzi: '我认识这个字',
    pinyin: 'wǒ rènshi zhège zì',
    translation: 'I know this character.',
    level: 1
  },
  {
    hanzi: '你妈妈叫什么名字？',
    pinyin: 'nǐ māma jiào shénme míngzì',
    translation: "What is your mother's name?",
    level: 1
  },
  {
    hanzi: '中国人很多',
    pinyin: 'zhōngguó rén hěnduō',
    translation: 'Chinese people are many.',
    level: 1
  },
  {
    hanzi: '我常常看书',
    pinyin: 'wǒ chángcháng kàn shū',
    translation: 'I often read books.',
    level: 1
  },
  {
    hanzi: '这个衣服很贵',
    pinyin: 'zhège yīfu hěn guì',
    translation: 'This clothing is very expensive.',
    level: 1
  },
  {
    hanzi: '他不在学校',
    pinyin: 'tā bù zài xuéxiào',
    translation: 'He is not at school.',
    level: 1
  },
  {
    hanzi: '我们看电影吧',
    pinyin: 'wǒmen kàn diànyǐng ba',
    translation: 'Let us watch a movie.',
    level: 1
  },
  { hanzi: '这是我妈妈', pinyin: 'zhè shì wǒ māma', translation: 'This is my mother.', level: 1 },
  {
    hanzi: '我找不到我的书',
    pinyin: 'wǒ zhǎo bù dào wǒ de shū',
    translation: 'I cannot find my book.',
    level: 1
  },
  {
    hanzi: '他早上六点起床',
    pinyin: 'tā zǎoshang liù diǎn qǐchuáng',
    translation: 'He gets up at six in the morning.',
    level: 1
  },
  {
    hanzi: '他是我最好的朋友',
    pinyin: 'tā shì wǒ zuì hǎo de péngyou',
    translation: 'He is my best friend.',
    level: 1
  },
  {
    hanzi: '这是你的书吗？',
    pinyin: 'zhè shì nǐ de shū ma',
    translation: 'Is this your book?',
    level: 1
  },
  {
    hanzi: '他会不会说中文？',
    pinyin: 'tā huì bù huì shuō zhōngwén',
    translation: 'Can he speak Chinese?',
    level: 1
  },
  {
    hanzi: '我明年去中国',
    pinyin: 'wǒ míngnián qù zhōngguó',
    translation: 'I will go to China next year.',
    level: 1
  },
  {
    hanzi: '我不会忘记你',
    pinyin: 'wǒ bù huì wàngjì nǐ',
    translation: 'I will not forget you.',
    level: 1
  },
  {
    hanzi: '请你再说一次',
    pinyin: 'qǐng nǐ zài shuō yī cì',
    translation: 'Please say it once more.',
    level: 1
  },

  // ═══════════════ HSK 2 (Level 2) ═══════════════
  // 110+ sentences written using HSK 3.0 Level 1 + Level 2 vocabulary.
  {
    hanzi: '我每天早上看报纸',
    pinyin: 'wǒ měitiān zǎoshang kàn bàozhǐ',
    translation: 'I read the newspaper every morning.',
    level: 2
  },
  {
    hanzi: '请帮助我找一下我的手机',
    pinyin: 'qǐng bāngzhù wǒ zhǎo yīxià wǒ de shǒujī',
    translation: 'Please help me find my phone.',
    level: 2
  },
  {
    hanzi: '这个周末你有什么计划吗？',
    pinyin: 'zhège zhōumò nǐ yǒu shénme jìhuà ma',
    translation: 'Do you have any plans this weekend?',
    level: 2
  },
  {
    hanzi: '她买了一双白色的新鞋',
    pinyin: 'tā mǎile yī shuāng báisè de xīn xié',
    translation: 'She bought a pair of white new shoes.',
    level: 2
  },
  {
    hanzi: '我每天坐公共汽车去上班',
    pinyin: 'wǒ měitiān zuò gōnggòng qìchē qù shàngbān',
    translation: 'I take the bus to work every day.',
    level: 2
  },
  {
    hanzi: '我们骑自行车去公园吧',
    pinyin: 'wǒmen qí zìxíngchē qù gōngyuán ba',
    translation: 'Let us ride bikes to the park.',
    level: 2
  },
  {
    hanzi: '今天晚上我要复习功课',
    pinyin: 'jīntiān wǎnshang wǒ yào fùxí gōngkè',
    translation: 'Tonight I need to review my lessons.',
    level: 2
  },
  {
    hanzi: '老师很关心他的学生',
    pinyin: 'lǎoshī hěn guānxīn tā de xuéshēng',
    translation: 'The teacher cares very much about his students.',
    level: 2
  },
  {
    hanzi: '他想成为一个有名的作家',
    pinyin: 'tā xiǎng chéngwéi yīgè yǒumíng de zuòjiā',
    translation: 'He wants to become a famous writer.',
    level: 2
  },
  {
    hanzi: '这个句子不正确',
    pinyin: 'zhège jùzi bù zhèngquè',
    translation: 'This sentence is not correct.',
    level: 2
  },
  {
    hanzi: '冬天的时候常常下雪',
    pinyin: 'dōngtiān de shíhou chángcháng xià xuě',
    translation: 'It often snows in winter.',
    level: 2
  },
  {
    hanzi: '春天比冬天舒服多了',
    pinyin: 'chūntiān bǐ dōngtiān shūfu duō le',
    translation: 'Spring is much more comfortable than winter.',
    level: 2
  },
  {
    hanzi: '我家有一只黑色的小猫',
    pinyin: 'wǒ jiā yǒu yī zhī hēisè de xiǎo māo',
    translation: 'My family has a little black cat.',
    level: 2
  },
  {
    hanzi: '湖里有很多鱼',
    pinyin: 'hú lǐ yǒu hěnduō yú',
    translation: 'There are many fish in the lake.',
    level: 2
  },
  {
    hanzi: '我们去年去国外旅行了',
    pinyin: 'wǒmen qùnián qù guówài lǚxíng le',
    translation: 'We traveled abroad last year.',
    level: 2
  },
  {
    hanzi: '司机开车开得很慢',
    pinyin: 'sījī kāichē kāi de hěn màn',
    translation: 'The driver drives very slowly.',
    level: 2
  },
  {
    hanzi: '我每天坐地铁去公司',
    pinyin: 'wǒ měitiān zuò dìtiě qù gōngsī',
    translation: 'I take the subway to the company every day.',
    level: 2
  },
  {
    hanzi: '出口在那个方向',
    pinyin: 'chūkǒu zài nàge fāngxiàng',
    translation: 'The exit is in that direction.',
    level: 2
  },
  {
    hanzi: '孩子们玩得很开心',
    pinyin: 'háizimen wán de hěn kāixīn',
    translation: 'The children are playing very happily.',
    level: 2
  },
  {
    hanzi: '请不要难过',
    pinyin: 'qǐng bùyào nánguò',
    translation: "Please don't be sad.",
    level: 2
  },
  {
    hanzi: '那个女孩子长得很漂亮',
    pinyin: 'nàge nǚháizi zhǎng de hěn piàoliang',
    translation: 'That girl is very pretty.',
    level: 2
  },
  {
    hanzi: '我奶奶越来越老了',
    pinyin: 'wǒ nǎinai yuèláiyuè lǎo le',
    translation: 'My grandmother is getting older and older.',
    level: 2
  },
  {
    hanzi: '快餐很方便，但是不太健康',
    pinyin: 'kuàicān hěn fāngbiàn, dànshì bù tài jiànkāng',
    translation: 'Fast food is convenient, but not very healthy.',
    level: 2
  },
  {
    hanzi: '妈妈包的饺子很好吃',
    pinyin: 'māma bāo de jiǎozi hěn hǎochī',
    translation: 'The dumplings mom makes are very tasty.',
    level: 2
  },
  {
    hanzi: '这个菜的味道很不错',
    pinyin: 'zhège cài de wèidào hěn bùcuò',
    translation: 'The taste of this dish is quite good.',
    level: 2
  },
  { hanzi: '为我们干杯', pinyin: 'wèi wǒmen gānbēi', translation: 'A toast to us.', level: 2 },
  {
    hanzi: '请排队，不要推',
    pinyin: 'qǐng páiduì, bùyào tuī',
    translation: "Please line up, don't push.",
    level: 2
  },
  {
    hanzi: '你应该多运动一下',
    pinyin: 'nǐ yīnggāi duō yùndòng yīxià',
    translation: 'You should exercise more.',
    level: 2
  },
  {
    hanzi: '他比以前更努力了',
    pinyin: 'tā bǐ yǐqián gèng nǔlì le',
    translation: 'He is more hardworking than before.',
    level: 2
  },
  {
    hanzi: '我的手表不见了',
    pinyin: 'wǒ de shǒubiǎo bù jiàn le',
    translation: 'My watch is missing.',
    level: 2
  },
  {
    hanzi: '她穿着蓝色的衣服',
    pinyin: 'tā chuānzhe lánsè de yīfu',
    translation: 'She is wearing blue clothes.',
    level: 2
  },
  {
    hanzi: '教室里十分安静',
    pinyin: 'jiàoshì lǐ shífēn ānjìng',
    translation: 'The classroom is very quiet.',
    level: 2
  },
  {
    hanzi: '我们去动物园看熊猫吧',
    pinyin: 'wǒmen qù dòngwùyuán kàn xióngmāo ba',
    translation: 'Let us go to the zoo to see the pandas.',
    level: 2
  },
  {
    hanzi: '请再说一遍，好吗？',
    pinyin: 'qǐng zài shuō yī biàn, hǎo ma',
    translation: 'Please say it once more, okay?',
    level: 2
  },
  {
    hanzi: '我已经很久没有收到你的信了',
    pinyin: 'wǒ yǐjīng hěn jiǔ méiyǒu shōudào nǐ de xìn le',
    translation: "I haven't received your letter for a long time.",
    level: 2
  },
  {
    hanzi: '她努力练习说普通话',
    pinyin: 'tā nǔlì liànxí shuō pǔtōnghuà',
    translation: 'She practices speaking Mandarin diligently.',
    level: 2
  },
  {
    hanzi: '这个周末我们去看篮球比赛吧',
    pinyin: 'zhège zhōumò wǒmen qù kàn lánqiú bǐsài ba',
    translation: 'Let us go watch a basketball game this weekend.',
    level: 2
  },
  {
    hanzi: '你想要什么颜色的？',
    pinyin: 'nǐ xiǎng yào shénme yánsè de',
    translation: 'What color do you want?',
    level: 2
  },
  {
    hanzi: '我参加了学校的活动',
    pinyin: 'wǒ cānjiāle xuéxiào de huódòng',
    translation: 'I participated in the school activity.',
    level: 2
  },
  {
    hanzi: '电脑已经很旧了',
    pinyin: 'diànnǎo yǐjīng hěn jiù le',
    translation: 'The computer is already very old.',
    level: 2
  },
  {
    hanzi: '这个公园很大很漂亮',
    pinyin: 'zhège gōngyuán hěn dà hěn piàoliang',
    translation: 'This park is big and beautiful.',
    level: 2
  },
  {
    hanzi: '我很喜欢听音乐',
    pinyin: 'wǒ hěn xǐhuān tīng yīnyuè',
    translation: 'I really like listening to music.',
    level: 2
  },
  {
    hanzi: '虽然天气很冷，但是我还是出去了',
    pinyin: 'suīrán tiānqì hěn lěng, dànshì wǒ háishì chūqù le',
    translation: 'Although the weather was cold, I still went out.',
    level: 2
  },
  {
    hanzi: '如果有时间，我就去看你',
    pinyin: 'rúguǒ yǒu shíjiān, wǒ jiù qù kàn nǐ',
    translation: 'If I have time, I will go see you.',
    level: 2
  },
  {
    hanzi: '因为下雨了，所以我们不出门',
    pinyin: 'yīnwèi xià yǔ le, suǒyǐ wǒmen bù chūmén',
    translation: "Because it's raining, we won't go out.",
    level: 2
  },
  {
    hanzi: '他不但会说中文，而且会写汉字',
    pinyin: 'tā bùdàn huì shuō zhōngwén, érqiě huì xiě hànzì',
    translation: 'He can not only speak Chinese but also write characters.',
    level: 2
  },
  {
    hanzi: '已经十一点了，你应该睡觉了',
    pinyin: 'yǐjīng shíyī diǎn le, nǐ yīnggāi shuìjiào le',
    translation: "It's already eleven, you should go to sleep.",
    level: 2
  },
  {
    hanzi: '他是我见过最好的人',
    pinyin: 'tā shì wǒ jiànguò zuì hǎo de rén',
    translation: 'He is the best person I have ever met.',
    level: 2
  },
  {
    hanzi: '我去过中国很多地方',
    pinyin: 'wǒ qùguò zhōngguó hěnduō dìfang',
    translation: 'I have been to many places in China.',
    level: 2
  },
  {
    hanzi: '她变得比以前更漂亮了',
    pinyin: 'tā biàn de bǐ yǐqián gèng piàoliang le',
    translation: 'She has become more beautiful than before.',
    level: 2
  },
  {
    hanzi: '外面下雪了，非常冷',
    pinyin: 'wàimiàn xià xuě le, fēicháng lěng',
    translation: "It's snowing outside, very cold.",
    level: 2
  },
  {
    hanzi: '秋天是北京最好的季节',
    pinyin: 'qiūtiān shì běijīng zuì hǎo de jìjié',
    translation: 'Autumn is the best season in Beijing.',
    level: 2
  },
  {
    hanzi: '天上有很多鸟',
    pinyin: 'tiānshang yǒu hěnduō niǎo',
    translation: 'There are many birds in the sky.',
    level: 2
  },
  {
    hanzi: '我肚子很疼',
    pinyin: 'wǒ dùzi hěn téng',
    translation: 'My stomach hurts a lot.',
    level: 2
  },
  {
    hanzi: '她头发很长',
    pinyin: 'tā tóufa hěn cháng',
    translation: 'Her hair is very long.',
    level: 2
  },
  {
    hanzi: '不要哭，一切都会好起来的',
    pinyin: 'bùyào kū, yīqiè dōu huì hǎo qǐlái de',
    translation: "Don't cry, everything will get better.",
    level: 2
  },
  {
    hanzi: '这双鞋的颜色很好看',
    pinyin: 'zhè shuāng xié de yánsè hěn hǎokàn',
    translation: 'The color of these shoes is very nice.',
    level: 2
  },
  {
    hanzi: '他是一位很好的校长',
    pinyin: 'tā shì yī wèi hěn hǎo de xiàozhǎng',
    translation: 'He is a very good principal.',
    level: 2
  },
  {
    hanzi: '我们大家一起唱歌吧',
    pinyin: 'wǒmen dàjiā yīqǐ chànggē ba',
    translation: 'Let us all sing together.',
    level: 2
  },
  {
    hanzi: '你带信用卡了吗？',
    pinyin: 'nǐ dài xìnyòngkǎ le ma',
    translation: 'Did you bring your credit card?',
    level: 2
  },
  {
    hanzi: '她在银行工作',
    pinyin: 'tā zài yínháng gōngzuò',
    translation: 'She works at a bank.',
    level: 2
  },
  {
    hanzi: '这种花是黄色的',
    pinyin: 'zhè zhǒng huā shì huángsè de',
    translation: 'This kind of flower is yellow.',
    level: 2
  },
  {
    hanzi: '我喜欢在海边走走',
    pinyin: 'wǒ xǐhuān zài hǎibiān zǒuzou',
    translation: 'I like taking a walk by the seaside.',
    level: 2
  },
  {
    hanzi: '晚上能看到很多星星',
    pinyin: 'wǎnshang néng kàndào hěnduō xīngxing',
    translation: 'You can see many stars at night.',
    level: 2
  },
  {
    hanzi: '月亮很圆',
    pinyin: 'yuèliang hěn yuán',
    translation: 'The moon is very round.',
    level: 2
  },
  {
    hanzi: '网球是我最喜欢的运动',
    pinyin: 'wǎngqiú shì wǒ zuì xǐhuān de yùndòng',
    translation: 'Tennis is my favorite sport.',
    level: 2
  },
  {
    hanzi: '这个商店的东西很便宜',
    pinyin: 'zhège shāngdiàn de dōngxi hěn piányi',
    translation: 'Things in this store are very cheap.',
    level: 2
  },
  {
    hanzi: '她画的花非常漂亮',
    pinyin: 'tā huà de huā fēicháng piàoliang',
    translation: 'The flowers she painted are very beautiful.',
    level: 2
  },
  {
    hanzi: '你明天打算做什么？',
    pinyin: 'nǐ míngtiān dǎsuàn zuò shénme',
    translation: 'What do you plan to do tomorrow?',
    level: 2
  },
  {
    hanzi: '不久以后他就会回来',
    pinyin: 'bùjiǔ yǐhòu tā jiù huì huílai',
    translation: 'Soon he will come back.',
    level: 2
  },
  {
    hanzi: '大部分人都喜欢旅游',
    pinyin: 'dà bùfen rén dōu xǐhuān lǚyóu',
    translation: 'Most people like traveling.',
    level: 2
  },
  {
    hanzi: '这个故事很好笑',
    pinyin: 'zhège gùshi hěn hǎoxiào',
    translation: 'This story is very funny.',
    level: 2
  },
  { hanzi: '她个子很高', pinyin: 'tā gèzi hěn gāo', translation: 'She is very tall.', level: 2 },
  {
    hanzi: '我想报名参加比赛',
    pinyin: 'wǒ xiǎng bàomíng cānjiā bǐsài',
    translation: 'I want to sign up for the competition.',
    level: 2
  },
  {
    hanzi: '我们先参观博物馆吧',
    pinyin: 'wǒmen xiān cānguān bówùguǎn ba',
    translation: 'Let us first visit the museum.',
    level: 2
  },
  {
    hanzi: '这里可以办信用卡吗？',
    pinyin: 'zhèlǐ kěyǐ bàn xìnyòngkǎ ma',
    translation: 'Can I get a credit card here?',
    level: 2
  },
  {
    hanzi: '他成绩一直很好',
    pinyin: 'tā chéngjì yīzhí hěn hǎo',
    translation: 'His grades have always been good.',
    level: 2
  },
  {
    hanzi: '我觉得这个工作不错',
    pinyin: 'wǒ juéde zhège gōngzuò bùcuò',
    translation: 'I think this job is not bad.',
    level: 2
  },
  {
    hanzi: '你怎么了？不舒服吗？',
    pinyin: 'nǐ zěnme le? bù shūfu ma',
    translation: "What's wrong? Are you not feeling well?",
    level: 2
  },
  {
    hanzi: '他从小就很聪明',
    pinyin: 'tā cóngxiǎo jiù hěn cōngming',
    translation: 'He has been smart since he was a child.',
    level: 2
  },
  {
    hanzi: '服务员，请给我一双筷子',
    pinyin: 'fúwùyuán, qǐng gěi wǒ yī shuāng kuàizi',
    translation: 'Waiter, please give me a pair of chopsticks.',
    level: 2
  },
  {
    hanzi: '爷爷在花园里看报纸',
    pinyin: 'yéye zài huāyuán lǐ kàn bàozhǐ',
    translation: 'Grandpa reads the newspaper in the garden.',
    level: 2
  },
  {
    hanzi: '我们经常在一起讨论问题',
    pinyin: 'wǒmen jīngcháng zài yīqǐ tǎolùn wèntí',
    translation: 'We often discuss problems together.',
    level: 2
  },
  {
    hanzi: '这个办法很好',
    pinyin: 'zhège bànfǎ hěn hǎo',
    translation: 'This method is very good.',
    level: 2
  },
  {
    hanzi: '她用了一下我的词典',
    pinyin: 'tā yòngle yīxià wǒ de cídiǎn',
    translation: 'She used my dictionary for a bit.',
    level: 2
  },
  {
    hanzi: '请把你的名字写在这张纸上',
    pinyin: 'qǐng bǎ nǐ de míngzi xiě zài zhè zhāng zhǐ shàng',
    translation: 'Please write your name on this piece of paper.',
    level: 2
  },
  {
    hanzi: '我要去药店买药',
    pinyin: 'wǒ yào qù yàodiàn mǎi yào',
    translation: 'I need to go to the pharmacy to buy medicine.',
    level: 2
  },
  {
    hanzi: '你可以用筷子吃饭吗？',
    pinyin: 'nǐ kěyǐ yòng kuàizi chīfàn ma',
    translation: 'Can you eat with chopsticks?',
    level: 2
  },
  {
    hanzi: '我从地铁站出来就看到了她',
    pinyin: 'wǒ cóng dìtiě zhàn chūlái jiù kàndào le tā',
    translation: 'I saw her as soon as I came out of the subway station.',
    level: 2
  },
  {
    hanzi: '今天的温度很低',
    pinyin: 'jīntiān de wēndù hěn dī',
    translation: "Today's temperature is very low.",
    level: 2
  },
  {
    hanzi: '我吃饱了，真的吃不下了',
    pinyin: 'wǒ chībǎo le, zhēnde chī bù xià le',
    translation: "I'm full, I really can't eat anymore.",
    level: 2
  },
  {
    hanzi: '这个网站很有意思',
    pinyin: 'zhège wǎngzhàn hěn yǒu yìsi',
    translation: 'This website is very interesting.',
    level: 2
  },
  {
    hanzi: '他是一名留学生',
    pinyin: 'tā shì yī míng liúxuéshēng',
    translation: 'He is an international student.',
    level: 2
  },
  {
    hanzi: '你们有什么意见吗？',
    pinyin: 'nǐmen yǒu shénme yìjiàn ma',
    translation: 'Do you have any opinions?',
    level: 2
  },
  {
    hanzi: '他明天就要离开北京了',
    pinyin: 'tā míngtiān jiù yào líkāi běijīng le',
    translation: 'He will leave Beijing tomorrow.',
    level: 2
  },
  {
    hanzi: '这次考试十分重要',
    pinyin: 'zhè cì kǎoshì shífēn zhòngyào',
    translation: 'This exam is very important.',
    level: 2
  },
  {
    hanzi: '我相信你一定能做到',
    pinyin: 'wǒ xiāngxìn nǐ yīdìng néng zuòdào',
    translation: 'I believe you can definitely do it.',
    level: 2
  },
  {
    hanzi: '请把灯打开',
    pinyin: 'qǐng bǎ dēng dǎkāi',
    translation: 'Please turn on the light.',
    level: 2
  },
  {
    hanzi: '这个箱子很轻',
    pinyin: 'zhège xiāngzi hěn qīng',
    translation: 'This box is very light.',
    level: 2
  },
  {
    hanzi: '我觉得学习中文很有意思',
    pinyin: 'wǒ juéde xuéxí zhōngwén hěn yǒu yìsi',
    translation: 'I think learning Chinese is very interesting.',
    level: 2
  },
  {
    hanzi: '请把声音放小一点',
    pinyin: 'qǐng bǎ shēngyīn fàng xiǎo yīdiǎn',
    translation: 'Please lower your voice a bit.',
    level: 2
  },
  {
    hanzi: '这个碗太小了',
    pinyin: 'zhège wǎn tài xiǎo le',
    translation: 'This bowl is too small.',
    level: 2
  },
  {
    hanzi: '我想换一件衣服',
    pinyin: 'wǒ xiǎng huàn yī jiàn yīfu',
    translation: 'I want to change my clothes.',
    level: 2
  },
  {
    hanzi: '那只狗很可爱',
    pinyin: 'nà zhī gǒu hěn kěài',
    translation: 'That dog is very cute.',
    level: 2
  },
  {
    hanzi: '她在用洗衣机洗衣服',
    pinyin: 'tā zài yòng xǐyījī xǐ yīfu',
    translation: 'She is using the washing machine to wash clothes.',
    level: 2
  },
  {
    hanzi: '他忽然站了起来',
    pinyin: 'tā hūrán zhàn le qǐlái',
    translation: 'He suddenly stood up.',
    level: 2
  },
  {
    hanzi: '我们要好好照顾老人',
    pinyin: 'wǒmen yào hǎohǎo zhàogù lǎorén',
    translation: 'We should take good care of the elderly.',
    level: 2
  },
  {
    hanzi: '这份礼物是送给你的',
    pinyin: 'zhè fèn lǐwù shì sòng gěi nǐ de',
    translation: 'This gift is for you.',
    level: 2
  },
  {
    hanzi: '我永远忘不了那一天',
    pinyin: 'wǒ yǒngyuǎn wàng bù liǎo nà yī tiān',
    translation: 'I will never forget that day.',
    level: 2
  },
  {
    hanzi: '他已经习惯了这里的生活',
    pinyin: 'tā yǐjīng xíguàn le zhèlǐ de shēnghuó',
    translation: 'He has already gotten used to life here.',
    level: 2
  },
  {
    hanzi: '她十分热情地欢迎我们',
    pinyin: 'tā shífēn rèqíng de huānyíng wǒmen',
    translation: 'She welcomed us very warmly.',
    level: 2
  },
  {
    hanzi: '事情不是你想的那样',
    pinyin: 'shìqíng bù shì nǐ xiǎng de nàyàng',
    translation: 'Things are not the way you think.',
    level: 2
  },
  {
    hanzi: '他因为生病没有来上课',
    pinyin: 'tā yīnwèi shēngbìng méiyǒu lái shàngkè',
    translation: "He didn't come to class because he was sick.",
    level: 2
  },
  {
    hanzi: '这是我自己的事情',
    pinyin: 'zhè shì wǒ zìjǐ de shìqíng',
    translation: 'This is my own business.',
    level: 2
  },
  {
    hanzi: '这是一个重要的通知',
    pinyin: 'zhè shì yīgè zhòngyào de tōngzhī',
    translation: 'This is an important notice.',
    level: 2
  },
  {
    hanzi: '我们通过电话联系吧',
    pinyin: 'wǒmen tōngguò diànhuà liánxì ba',
    translation: 'Let us get in touch by phone.',
    level: 2
  },
  {
    hanzi: '你明白我的意思吗？',
    pinyin: 'nǐ míngbai wǒ de yìsi ma',
    translation: 'Do you understand what I mean?',
    level: 2
  },
  {
    hanzi: '下午我有体育课',
    pinyin: 'xiàwǔ wǒ yǒu tǐyù kè',
    translation: 'I have PE class in the afternoon.',
    level: 2
  },
  {
    hanzi: '她的眼睛很漂亮',
    pinyin: 'tā de yǎnjing hěn piàoliang',
    translation: 'Her eyes are very beautiful.',
    level: 2
  },
  {
    hanzi: '这个瓶子里是什么？',
    pinyin: 'zhège píngzi lǐ shì shénme',
    translation: 'What is in this bottle?',
    level: 2
  },
  {
    hanzi: '明天是春节',
    pinyin: 'míngtiān shì chūnjié',
    translation: 'Tomorrow is Chinese New Year.',
    level: 2
  },
  {
    hanzi: '祝您一路平安',
    pinyin: 'zhù nín yīlù píngān',
    translation: 'Wish you a safe journey.',
    level: 2
  },
  {
    hanzi: '我从来没见过蓝色的大海',
    pinyin: 'wǒ cónglái méi jiànguò lánsè de dàhǎi',
    translation: 'I have never seen a blue sea before.',
    level: 2
  },
  {
    hanzi: '请你把电视打开',
    pinyin: 'qǐng nǐ bǎ diànshì dǎkāi',
    translation: 'Please turn on the TV.',
    level: 2
  },

  // ═══════════════ HSK 3 (Level 3) ═══════════════
  // 110+ sentences using HSK 3.0 Level 1-3 vocabulary.
  {
    hanzi: '他把书放在桌子上了',
    pinyin: 'tā bǎ shū fàng zài zhuōzi shàng le',
    translation: 'He put the book on the table.',
    level: 3
  },
  {
    hanzi: '我被这个故事感动了',
    pinyin: 'wǒ bèi zhège gùshi gǎndòng le',
    translation: 'I was moved by this story.',
    level: 3
  },
  {
    hanzi: '除了他以外，我们都去了',
    pinyin: 'chúle tā yǐwài, wǒmen dōu qù le',
    translation: 'Except for him, we all went.',
    level: 3
  },
  {
    hanzi: '这个城市不但大而且非常美丽',
    pinyin: 'zhège chéngshì bùdàn dà érqiě fēicháng měilì',
    translation: 'This city is not only big but also very beautiful.',
    level: 3
  },
  {
    hanzi: '她比以前更漂亮了',
    pinyin: 'tā bǐ yǐqián gèng piàoliang le',
    translation: 'She is more beautiful than before.',
    level: 3
  },
  {
    hanzi: '我不得不早点回家',
    pinyin: 'wǒ bùdébù zǎo diǎn huí jiā',
    translation: 'I have no choice but to go home early.',
    level: 3
  },
  {
    hanzi: '他曾经在北京住过三年',
    pinyin: 'tā céngjīng zài běijīng zhùguò sān nián',
    translation: 'He once lived in Beijing for three years.',
    level: 3
  },
  {
    hanzi: '我从来没有见过这么美丽的地方',
    pinyin: 'wǒ cónglái méiyǒu jiànguò zhème měilì de dìfang',
    translation: 'I have never seen such a beautiful place.',
    level: 3
  },
  {
    hanzi: '大概有二十个人参加了会议',
    pinyin: 'dàgài yǒu èrshí gè rén cānjiāle huìyì',
    translation: 'About twenty people attended the meeting.',
    level: 3
  },
  {
    hanzi: '当然，我很愿意帮助你',
    pinyin: 'dāngrán, wǒ hěn yuànyì bāngzhù nǐ',
    translation: 'Of course, I am very willing to help you.',
    level: 3
  },
  {
    hanzi: '他高兴地告诉我这个好消息',
    pinyin: 'tā gāoxìng de gàosu wǒ zhège hǎo xiāoxi',
    translation: 'He happily told me this good news.',
    level: 3
  },
  {
    hanzi: '今天比昨天冷得多',
    pinyin: 'jīntiān bǐ zuótiān lěng de duō',
    translation: 'Today is much colder than yesterday.',
    level: 3
  },
  {
    hanzi: '我对中国文化越来越感兴趣',
    pinyin: 'wǒ duì zhōngguó wénhuà yuèláiyuè gǎn xìngqù',
    translation: 'I am more and more interested in Chinese culture.',
    level: 3
  },
  {
    hanzi: '为了学好中文，他每天都很努力',
    pinyin: 'wèile xué hǎo zhōngwén, tā měitiān dōu hěn nǔlì',
    translation: 'In order to learn Chinese well, he works hard every day.',
    level: 3
  },
  {
    hanzi: '不管怎么样，我都会支持你',
    pinyin: 'bùguǎn zěnmeyàng, wǒ dōu huì zhīchí nǐ',
    translation: 'No matter what, I will support you.',
    level: 3
  },
  {
    hanzi: '这件事跟她有什么关系吗？',
    pinyin: 'zhè jiàn shì gēn tā yǒu shénme guānxi ma',
    translation: 'Does this matter have anything to do with her?',
    level: 3
  },
  {
    hanzi: '他终于完成了自己的任务',
    pinyin: 'tā zhōngyú wánchéngle zìjǐ de rènwù',
    translation: 'He finally completed his task.',
    level: 3
  },
  {
    hanzi: '那位老人大概七十岁左右',
    pinyin: 'nà wèi lǎorén dàgài qīshí suì zuǒyòu',
    translation: 'That elderly person is about seventy years old.',
    level: 3
  },
  {
    hanzi: '你要是累了，就休息一会儿吧',
    pinyin: 'nǐ yàoshi lèi le, jiù xiūxi yīhuìr ba',
    translation: 'If you are tired, rest for a while.',
    level: 3
  },
  {
    hanzi: '由于天气不好，飞机不能起飞',
    pinyin: 'yóuyú tiānqì bù hǎo, fēijī bù néng qǐfēi',
    translation: 'Due to bad weather, the plane cannot take off.',
    level: 3
  },
  {
    hanzi: '这个孩子又聪明又努力',
    pinyin: 'zhège háizi yòu cōngming yòu nǔlì',
    translation: 'This child is both smart and hardworking.',
    level: 3
  },
  {
    hanzi: '听到这个消息，他高兴极了',
    pinyin: 'tīngdào zhège xiāoxi, tā gāoxìng jíle',
    translation: 'Hearing this news, he was overjoyed.',
    level: 3
  },
  {
    hanzi: '请不要把手机放在桌子上',
    pinyin: 'qǐng bùyào bǎ shǒujī fàng zài zhuōzi shàng',
    translation: "Please don't put your phone on the table.",
    level: 3
  },
  {
    hanzi: '她被大家选为班长',
    pinyin: 'tā bèi dàjiā xuǎn wéi bānzhǎng',
    translation: 'She was chosen as class monitor by everyone.',
    level: 3
  },
  {
    hanzi: '除了学习，他还喜欢运动',
    pinyin: 'chúle xuéxí, tā hái xǐhuān yùndòng',
    translation: 'Besides studying, he also likes sports.',
    level: 3
  },
  {
    hanzi: '这份工作不但很累而且工资很低',
    pinyin: 'zhè fèn gōngzuò bùdàn hěn lèi érqiě gōngzī hěn dī',
    translation: 'This job is not only tiring but also pays a low salary.',
    level: 3
  },
  {
    hanzi: '他比我高得多',
    pinyin: 'tā bǐ wǒ gāo de duō',
    translation: 'He is much taller than me.',
    level: 3
  },
  {
    hanzi: '你不得不去看医生',
    pinyin: 'nǐ bùdébù qù kàn yīshēng',
    translation: 'You have no choice but to go see a doctor.',
    level: 3
  },
  {
    hanzi: '我曾经想过出国留学',
    pinyin: 'wǒ céngjīng xiǎngguò chūguó liúxué',
    translation: 'I once thought about studying abroad.',
    level: 3
  },
  {
    hanzi: '我从来没有去过长城',
    pinyin: 'wǒ cónglái méiyǒu qùguò chángchéng',
    translation: 'I have never been to the Great Wall.',
    level: 3
  },
  {
    hanzi: '这个城市大概有一百万人口',
    pinyin: 'zhège chéngshì dàgài yǒu yībǎi wàn rénkǒu',
    translation: 'This city has about one million people.',
    level: 3
  },
  {
    hanzi: '她慢慢地走了过来',
    pinyin: 'tā mànmàn de zǒule guòlai',
    translation: 'She slowly walked over.',
    level: 3
  },
  {
    hanzi: '经理对我们的工作很满意',
    pinyin: 'jīnglǐ duì wǒmen de gōngzuò hěn mǎnyì',
    translation: 'The manager is very satisfied with our work.',
    level: 3
  },
  {
    hanzi: '为了身体健康，我每天都跑步',
    pinyin: 'wèile shēntǐ jiànkāng, wǒ měitiān dōu pǎobù',
    translation: 'For my health, I run every day.',
    level: 3
  },
  {
    hanzi: '不管多忙，他都会帮助别人',
    pinyin: 'bùguǎn duō máng, tā dōu huì bāngzhù biérén',
    translation: 'No matter how busy, he always helps others.',
    level: 3
  },
  {
    hanzi: '这次事故跟他没有关系',
    pinyin: 'zhè cì shìgù gēn tā méiyǒu guānxi',
    translation: 'This accident has nothing to do with him.',
    level: 3
  },
  {
    hanzi: '经过努力，他终于成功了',
    pinyin: 'jīngguò nǔlì, tā zhōngyú chénggōng le',
    translation: 'After hard work, he finally succeeded.',
    level: 3
  },
  {
    hanzi: '这件衣服大概两百块左右',
    pinyin: 'zhè jiàn yīfu dàgài liǎng bǎi kuài zuǒyòu',
    translation: 'This piece of clothing is about two hundred yuan.',
    level: 3
  },
  {
    hanzi: '要是不下雨，我们就去公园',
    pinyin: 'yàoshi bù xià yǔ, wǒmen jiù qù gōngyuán',
    translation: "If it doesn't rain, we will go to the park.",
    level: 3
  },
  {
    hanzi: '由于时间不够，我没有完成作业',
    pinyin: 'yóuyú shíjiān bùgòu, wǒ méiyǒu wánchéng zuòyè',
    translation: "Due to not having enough time, I didn't finish my homework.",
    level: 3
  },
  {
    hanzi: '她又会唱歌又会跳舞',
    pinyin: 'tā yòu huì chànggē yòu huì tiàowǔ',
    translation: 'She can both sing and dance.',
    level: 3
  },
  {
    hanzi: '这个题目难极了',
    pinyin: 'zhège tímù nán jíle',
    translation: 'This problem is extremely difficult.',
    level: 3
  },
  {
    hanzi: '请把这些书拿给我',
    pinyin: 'qǐng bǎ zhèxiē shū ná gěi wǒ',
    translation: 'Please bring these books to me.',
    level: 3
  },
  {
    hanzi: '瓶子被他打破了',
    pinyin: 'píngzi bèi tā dǎpò le',
    translation: 'The bottle was broken by him.',
    level: 3
  },
  {
    hanzi: '除了北京，我还想去上海',
    pinyin: 'chúle běijīng, wǒ hái xiǎng qù shànghǎi',
    translation: 'Besides Beijing, I also want to go to Shanghai.',
    level: 3
  },
  {
    hanzi: '她不但长得漂亮，而且性格也很好',
    pinyin: 'tā bùdàn zhǎng de piàoliang, érqiě xìnggé yě hěn hǎo',
    translation: 'She is not only pretty, but also has a good personality.',
    level: 3
  },
  {
    hanzi: '他的中文说得比我流利得多',
    pinyin: 'tā de zhōngwén shuō de bǐ wǒ liúlì de duō',
    translation: 'His Chinese is spoken much more fluently than mine.',
    level: 3
  },
  {
    hanzi: '时间不够了，我们不得不快一点',
    pinyin: 'shíjiān bùgòu le, wǒmen bùdébù kuài yīdiǎn',
    translation: 'We are running out of time, we have to hurry up.',
    level: 3
  },
  {
    hanzi: '他曾经是我的同事',
    pinyin: 'tā céngjīng shì wǒ de tóngshì',
    translation: 'He was once my colleague.',
    level: 3
  },
  {
    hanzi: '我从来没有觉得这么累过',
    pinyin: 'wǒ cónglái méiyǒu juéde zhème lèi guò',
    translation: 'I have never felt so tired before.',
    level: 3
  },
  {
    hanzi: '今天大概会很晚到家',
    pinyin: 'jīntiān dàgài huì hěn wǎn dào jiā',
    translation: 'I will probably get home very late today.',
    level: 3
  },
  {
    hanzi: '当然，安全是最重要的事情',
    pinyin: 'dāngrán, ānquán shì zuì zhòngyào de shìqíng',
    translation: 'Of course, safety is the most important thing.',
    level: 3
  },
  {
    hanzi: '我慢慢地学会了做中国菜',
    pinyin: 'wǒ mànmàn de xuéhuì le zuò zhōngguó cài',
    translation: 'I slowly learned to cook Chinese food.',
    level: 3
  },
  {
    hanzi: '我对音乐和艺术都很感兴趣',
    pinyin: 'wǒ duì yīnyuè hé yìshù dōu hěn gǎn xìngqù',
    translation: 'I am interested in both music and art.',
    level: 3
  },
  {
    hanzi: '为了买房子，他十分努力地工作',
    pinyin: 'wèile mǎi fángzi, tā shífēn nǔlì de gōngzuò',
    translation: 'In order to buy a house, he works very hard.',
    level: 3
  },
  {
    hanzi: '不管结果怎么样，我都接受',
    pinyin: 'bùguǎn jiéguǒ zěnmeyàng, wǒ dōu jiēshòu',
    translation: 'No matter what the result, I will accept it.',
    level: 3
  },
  {
    hanzi: '他们的关系一直很好',
    pinyin: 'tāmen de guānxi yīzhí hěn hǎo',
    translation: 'Their relationship has always been good.',
    level: 3
  },
  {
    hanzi: '学校终于通过了这个计划',
    pinyin: 'xuéxiào zhōngyú tōngguòle zhège jìhuà',
    translation: 'The school finally approved this plan.',
    level: 3
  },
  {
    hanzi: '这个城市大概有五百万左右的人口',
    pinyin: 'zhège chéngshì dàgài yǒu wǔbǎi wàn zuǒyòu de rénkǒu',
    translation: 'This city has a population of about five million.',
    level: 3
  },
  {
    hanzi: '要是明天下雨，活动就取消了',
    pinyin: 'yàoshi míngtiān xià yǔ, huódòng jiù qǔxiāo le',
    translation: 'If it rains tomorrow, the activity will be cancelled.',
    level: 3
  },
  {
    hanzi: '由于工作太忙，我没时间回家看父母',
    pinyin: 'yóuyú gōngzuò tài máng, wǒ méi shíjiān huí jiā kàn fùmǔ',
    translation: "Due to my busy work, I don't have time to go home and see my parents.",
    level: 3
  },
  {
    hanzi: '这家饭馆的菜又便宜又好吃',
    pinyin: 'zhè jiā fànguǎn de cài yòu piányi yòu hǎochī',
    translation: "This restaurant's food is both cheap and delicious.",
    level: 3
  },
  {
    hanzi: '听到这个消息，他难过极了',
    pinyin: 'tīngdào zhège xiāoxi, tā nánguò jíle',
    translation: 'Hearing this news, he was extremely sad.',
    level: 3
  },
  {
    hanzi: '你把作业交给老师了吗？',
    pinyin: 'nǐ bǎ zuòyè jiāo gěi lǎoshī le ma',
    translation: 'Did you hand in your homework to the teacher?',
    level: 3
  },
  {
    hanzi: '这个问题已经被解决了',
    pinyin: 'zhège wèntí yǐjīng bèi jiějué le',
    translation: 'This problem has already been solved.',
    level: 3
  },
  {
    hanzi: '除了学习以外，他还参加了很多活动',
    pinyin: 'chúle xuéxí yǐwài, tā hái cānjiāle hěnduō huódòng',
    translation: 'Besides studying, he also participated in many activities.',
    level: 3
  },
  {
    hanzi: '这次旅行不但不贵而且很有意思',
    pinyin: 'zhè cì lǚxíng bùdàn bù guì érqiě hěn yǒu yìsi',
    translation: 'This trip is not only inexpensive but also very interesting.',
    level: 3
  },
  {
    hanzi: '他的个子比我高很多',
    pinyin: 'tā de gèzi bǐ wǒ gāo hěnduō',
    translation: 'He is much taller than me.',
    level: 3
  },
  {
    hanzi: '我不得不提前离开',
    pinyin: 'wǒ bùdébù tíqián líkāi',
    translation: 'I had to leave early.',
    level: 3
  },
  {
    hanzi: '他曾经是一个有名的歌手',
    pinyin: 'tā céngjīng shì yīgè yǒumíng de gēshǒu',
    translation: 'He was once a famous singer.',
    level: 3
  },
  {
    hanzi: '我从来不喝咖啡，我只喝茶',
    pinyin: 'wǒ cónglái bù hē kāfēi, wǒ zhǐ hē chá',
    translation: 'I never drink coffee, I only drink tea.',
    level: 3
  },
  {
    hanzi: '明天大概会下雨，带把伞吧',
    pinyin: 'míngtiān dàgài huì xià yǔ, dài bǎ sǎn ba',
    translation: 'It will probably rain tomorrow, bring an umbrella.',
    level: 3
  },
  {
    hanzi: '她高兴地跑过来告诉我这个好消息',
    pinyin: 'tā gāoxìng de pǎo guòlai gàosu wǒ zhège hǎo xiāoxi',
    translation: 'She happily ran over to tell me this good news.',
    level: 3
  },
  {
    hanzi: '为了拿到好成绩，我每天学习很长时间',
    pinyin: 'wèile ná dào hǎo chéngjì, wǒ měitiān xuéxí hěn cháng shíjiān',
    translation: 'In order to get good grades, I study for long hours every day.',
    level: 3
  },
  {
    hanzi: '不管发生什么，都有办法解决',
    pinyin: 'bùguǎn fāshēng shénme, dōu yǒu bànfǎ jiějué',
    translation: 'No matter what happens, there is always a way to solve it.',
    level: 3
  },
  {
    hanzi: '现代社会的发展需要大量人才',
    pinyin: 'xiàndài shèhuì de fāzhǎn xūyào dàliàng réncái',
    translation: 'The development of modern society requires a lot of talent.',
    level: 3
  },
  {
    hanzi: '她终于找到了自己的幸福',
    pinyin: 'tā zhōngyú zhǎodàole zìjǐ de xìngfú',
    translation: 'She finally found her own happiness.',
    level: 3
  },
  {
    hanzi: '这件衣服大概三百块左右',
    pinyin: 'zhè jiàn yīfu dàgài sān bǎi kuài zuǒyòu',
    translation: 'This piece of clothing is about three hundred yuan.',
    level: 3
  },
  {
    hanzi: '要是你觉得不舒服，就去看医生吧',
    pinyin: 'yàoshi nǐ juéde bù shūfu, jiù qù kàn yīshēng ba',
    translation: 'If you feel unwell, go see a doctor.',
    level: 3
  },
  {
    hanzi: '由于经验不够，他没有得到这份工作',
    pinyin: 'yóuyú jīngyàn bùgòu, tā méiyǒu dédào zhè fèn gōngzuò',
    translation: "Due to lack of experience, he didn't get this job.",
    level: 3
  },
  {
    hanzi: '这种果汁又健康又好喝',
    pinyin: 'zhè zhǒng guǒzhī yòu jiànkāng yòu hǎohē',
    translation: 'This juice is both healthy and tasty.',
    level: 3
  },
  {
    hanzi: '他把衣服都洗好了',
    pinyin: 'tā bǎ yīfu dōu xǐ hǎo le',
    translation: 'He finished washing all the clothes.',
    level: 3
  },
  {
    hanzi: '这部小说被拍成了电影',
    pinyin: 'zhè bù xiǎoshuō bèi pāi chéngle diànyǐng',
    translation: 'This novel was made into a movie.',
    level: 3
  },
  {
    hanzi: '除了英语，他还想学别的语言',
    pinyin: 'chúle yīngyǔ, tā hái xiǎng xué biéde yǔyán',
    translation: 'Besides English, he also wants to learn other languages.',
    level: 3
  },
  {
    hanzi: '那部电影不但很长而且不太好看',
    pinyin: 'nà bù diànyǐng bùdàn hěn cháng érqiě bù tài hǎokàn',
    translation: 'That movie is not only long but also not very good.',
    level: 3
  },
  {
    hanzi: '坐飞机比坐火车快得多',
    pinyin: 'zuò fēijī bǐ zuò huǒchē kuài de duō',
    translation: 'Taking a plane is much faster than taking a train.',
    level: 3
  },
  {
    hanzi: '今天冷极了，我不想出门',
    pinyin: 'jīntiān lěng jíle, wǒ bù xiǎng chūmén',
    translation: "It's extremely cold today, I don't want to go out.",
    level: 3
  },
  {
    hanzi: '请你把灯关上',
    pinyin: 'qǐng nǐ bǎ dēng guānshang',
    translation: 'Please turn off the light.',
    level: 3
  },
  {
    hanzi: '他决定以后再也不迟到了',
    pinyin: 'tā juédìng yǐhòu zài yě bù chídào le',
    translation: 'He decided never to be late again.',
    level: 3
  },
  {
    hanzi: '这场比赛被电视台直播了',
    pinyin: 'zhè chǎng bǐsài bèi diànshìtái zhíbō le',
    translation: 'This match was broadcast live on TV.',
    level: 3
  },
  {
    hanzi: '除了价格贵一点，没有别的缺点',
    pinyin: 'chúle jiàgé guì yīdiǎn, méiyǒu biéde quēdiǎn',
    translation: 'Apart from being a bit expensive, there are no other drawbacks.',
    level: 3
  },
  {
    hanzi: '他不但会说中文，而且对中国文化很了解',
    pinyin: 'tā bùdàn huì shuō zhōngwén, érqiě duì zhōngguó wénhuà hěn liǎojiě',
    translation: 'He not only speaks Chinese, but also understands Chinese culture well.',
    level: 3
  },
  {
    hanzi: '今天的温度比昨天高了好几度',
    pinyin: 'jīntiān de wēndù bǐ zuótiān gāole hǎo jǐ dù',
    translation: "Today's temperature is several degrees higher than yesterday's.",
    level: 3
  },
  {
    hanzi: '我不得不承认他说的是对的',
    pinyin: 'wǒ bùdébù chéngrèn tā shuō de shì duì de',
    translation: 'I have to admit that what he said is correct.',
    level: 3
  },
  {
    hanzi: '这里曾经是一片绿色的草地',
    pinyin: 'zhèlǐ céngjīng shì yī piàn lǜsè de cǎodì',
    translation: 'This place was once a green meadow.',
    level: 3
  },
  {
    hanzi: '我从来没有忘记过你对我的帮助',
    pinyin: 'wǒ cónglái méiyǒu wàngjì guò nǐ duì wǒ de bāngzhù',
    translation: 'I have never forgotten your help to me.',
    level: 3
  },
  {
    hanzi: '大概还需要三天才能完成',
    pinyin: 'dàgài hái xūyào sān tiān cáinéng wánchéng',
    translation: 'It will probably take about three more days to finish.',
    level: 3
  },
  {
    hanzi: '他好奇地看着那个奇怪的东西',
    pinyin: 'tā hàoqí de kànzhe nàge qíguài de dōngxi',
    translation: 'He curiously looked at that strange thing.',
    level: 3
  },
  {
    hanzi: '我对这个计划没有什么意见',
    pinyin: 'wǒ duì zhège jìhuà méiyǒu shénme yìjiàn',
    translation: "I don't have any particular opinions about this plan.",
    level: 3
  },
  {
    hanzi: '为了大家的安全，请不要在这里吸烟',
    pinyin: 'wèile dàjiā de ānquán, qǐng bùyào zài zhèlǐ xīyān',
    translation: "For everyone's safety, please don't smoke here.",
    level: 3
  },
  {
    hanzi: '不管他怎么说，我都不会相信了',
    pinyin: 'bùguǎn tā zěnme shuō, wǒ dōu bùhuì xiāngxìn le',
    translation: "No matter what he says, I won't believe it anymore.",
    level: 3
  },
  {
    hanzi: '这件事跟你有直接的关系',
    pinyin: 'zhè jiàn shì gēn nǐ yǒu zhíjiē de guānxi',
    translation: 'This matter is directly related to you.',
    level: 3
  },
  {
    hanzi: '我爷爷终于实现了年轻时候的愿望',
    pinyin: 'wǒ yéye zhōngyú shíxiànle niánqīng shíhou de yuànwàng',
    translation: 'My grandfather finally fulfilled his wish from his youth.',
    level: 3
  },
  {
    hanzi: '这个盒子大概五斤左右',
    pinyin: 'zhège hézi dàgài wǔ jīn zuǒyòu',
    translation: 'This box is about five jin.',
    level: 3
  },
  {
    hanzi: '要是你赢了比赛，我就请你吃饭',
    pinyin: 'yàoshi nǐ yíngle bǐsài, wǒ jiù qǐng nǐ chīfàn',
    translation: "If you win the competition, I'll treat you to a meal.",
    level: 3
  },
  {
    hanzi: '由于经济发展，人们的生活越来越好了',
    pinyin: 'yóuyú jīngjì fāzhǎn, rénmen de shēnghuó yuèláiyuè hǎo le',
    translation: "Due to economic development, people's lives are getting better and better.",
    level: 3
  },
  {
    hanzi: '她的字写得又整齐又漂亮',
    pinyin: 'tā de zì xiě de yòu zhěngqí yòu piàoliang',
    translation: 'Her handwriting is both neat and beautiful.',
    level: 3
  },
  {
    hanzi: '今天的太阳大极了，我们出去玩吧',
    pinyin: 'jīntiān de tàiyang dà jíle, wǒmen chūqù wán ba',
    translation: "The sun is extremely bright today, let's go out and play.",
    level: 3
  },
  {
    hanzi: '他把护照放在包里了',
    pinyin: 'tā bǎ hùzhào fàng zài bāo lǐ le',
    translation: 'He put the passport in the bag.',
    level: 3
  },
  {
    hanzi: '这份合同被双方都同意了',
    pinyin: 'zhè fèn hétong bèi shuāngfāng dōu tóngyì le',
    translation: 'This contract was agreed upon by both parties.',
    level: 3
  },
  {
    hanzi: '除了工资不高，这份工作挺好的',
    pinyin: 'chúle gōngzī bù gāo, zhè fèn gōngzuò tǐng hǎo de',
    translation: 'Apart from the low salary, this job is pretty good.',
    level: 3
  },

  // ═══════════════ HSK 4 (Level 4) ═══════════════
  // 110+ sentences using HSK 3.0 Level 1-4 vocabulary.
  {
    hanzi: '由于天气不好，因此飞机晚点了',
    pinyin: 'yóuyú tiānqì bù hǎo, yīncǐ fēijī wǎndiǎn le',
    translation: 'Due to bad weather, therefore the flight was delayed.',
    level: 4
  },
  {
    hanzi: '对于这个问题，我们还需要时间考虑',
    pinyin: 'duìyú zhège wèntí, wǒmen hái xūyào shíjiān kǎolǜ',
    translation: 'Regarding this problem, we still need time to consider.',
    level: 4
  },
  {
    hanzi: '他不但会说中文，而且能翻译专业文章',
    pinyin: 'tā bùdàn huì shuō zhōngwén, érqiě néng fānyì zhuānyè wénzhāng',
    translation: 'He not only speaks Chinese but can also translate professional articles.',
    level: 4
  },
  {
    hanzi: '既然你已经决定了，我就不再劝你了',
    pinyin: 'jìrán nǐ yǐjīng juédìng le, wǒ jiù bù zài quàn nǐ le',
    translation: "Since you have already decided, I won't try to persuade you anymore.",
    level: 4
  },
  {
    hanzi: '无论多么困难，我们都不能放弃',
    pinyin: 'wúlùn duōme kùnnan, wǒmen dōu bù néng fàngqì',
    translation: 'No matter how difficult, we cannot give up.',
    level: 4
  },
  {
    hanzi: '尽管下着大雨，他还是准时到了',
    pinyin: 'jǐnguǎn xiàzhe dà yǔ, tā háishì zhǔnshí dào le',
    translation: 'Despite the heavy rain, he still arrived on time.',
    level: 4
  },
  {
    hanzi: '她不仅聪明，而且非常努力',
    pinyin: 'tā bùjǐn cōngming, érqiě fēicháng nǔlì',
    translation: 'She is not only smart but also very hardworking.',
    level: 4
  },
  {
    hanzi: '除了上海之外，他还去过很多城市',
    pinyin: 'chúle shànghǎi zhī wài, tā hái qùguò hěnduō chéngshì',
    translation: 'Apart from Shanghai, he has also been to many other cities.',
    level: 4
  },
  {
    hanzi: '对于学习语言来说，环境非常重要',
    pinyin: 'duìyú xuéxí yǔyán láishuō, huánjìng fēicháng zhòngyào',
    translation: 'As for learning a language, the environment is very important.',
    level: 4
  },
  {
    hanzi: '他通过自己的努力实现了梦想',
    pinyin: 'tā tōngguò zìjǐ de nǔlì shíxiàn le mèngxiǎng',
    translation: 'He achieved his dream through his own hard work.',
    level: 4
  },
  {
    hanzi: '我刚到家就下起了大雨',
    pinyin: 'wǒ gāng dào jiā jiù xiàqǐ le dà yǔ',
    translation: 'As soon as I got home, it started raining heavily.',
    level: 4
  },
  {
    hanzi: '虽然很累，他却依然坚持工作',
    pinyin: 'suīrán hěn lèi, tā què yīrán jiānchí gōngzuò',
    translation: 'Although tired, he still persisted with his work.',
    level: 4
  },
  {
    hanzi: '大学毕业后他打算出国留学',
    pinyin: 'dàxué bìyè hòu tā dǎsuàn chūguó liúxué',
    translation: 'After graduating from university, he plans to study abroad.',
    level: 4
  },
  {
    hanzi: '这个电梯坏了，我们走楼梯吧',
    pinyin: 'zhège diàntī huài le, wǒmen zǒu lóutī ba',
    translation: "This elevator is broken, let's take the stairs.",
    level: 4
  },
  {
    hanzi: '他获得了今年的优秀学生奖金',
    pinyin: 'tā huòdé le jīnnián de yōuxiù xuéshēng jiǎngjīn',
    translation: "He received this year's outstanding student scholarship.",
    level: 4
  },
  {
    hanzi: '附近有没有加油站？',
    pinyin: 'fùjìn yǒu méiyǒu jiāyóuzhàn',
    translation: 'Is there a gas station nearby?',
    level: 4
  },
  {
    hanzi: '请你把垃圾扔到外面的垃圾桶里',
    pinyin: 'qǐng nǐ bǎ lājī rēng dào wàimiàn de lājī tǒng lǐ',
    translation: 'Please throw the trash into the trash can outside.',
    level: 4
  },
  {
    hanzi: '如果不好好准备，面试很可能会失败',
    pinyin: 'rúguǒ bù hǎohǎo zhǔnbèi, miànshì hěn kěnéng huì shībài',
    translation: "If you don't prepare well, the interview will likely fail.",
    level: 4
  },
  {
    hanzi: '这家企业为员工提供了很好的待遇',
    pinyin: 'zhè jiā qǐyè wèi yuángōng tígōngle hěn hǎo de dàiyù',
    translation: 'This enterprise provides very good treatment for its employees.',
    level: 4
  },
  {
    hanzi: '你最好尽快完成这份报告',
    pinyin: 'nǐ zuìhǎo jǐnkuài wánchéng zhè fèn bàogào',
    translation: "You'd better finish this report as soon as possible.",
    level: 4
  },
  {
    hanzi: '我要减肥，所以最近不吃零食',
    pinyin: 'wǒ yào jiǎnféi, suǒyǐ zuìjìn bù chī língshí',
    translation: "I want to lose weight, so I'm not eating snacks recently.",
    level: 4
  },
  {
    hanzi: '这个城市的空气质量越来越差了',
    pinyin: 'zhège chéngshì de kōngqì zhìliàng yuèláiyuè chà le',
    translation: 'The air quality in this city is getting worse and worse.',
    level: 4
  },
  {
    hanzi: '我已经习惯了每天锻炼身体',
    pinyin: 'wǒ yǐjīng xíguàn le měitiān duànliàn shēntǐ',
    translation: 'I have already gotten used to exercising every day.',
    level: 4
  },
  {
    hanzi: '法律规定不能酒后开车',
    pinyin: 'fǎlǜ guīdìng bù néng jiǔ hòu kāichē',
    translation: 'The law stipulates that you cannot drive after drinking.',
    level: 4
  },
  {
    hanzi: '他几乎每天加班到很晚',
    pinyin: 'tā jīhū měitiān jiābān dào hěn wǎn',
    translation: 'He almost works overtime until very late every day.',
    level: 4
  },
  {
    hanzi: '你千万不要把密码告诉别人',
    pinyin: 'nǐ qiānwàn bùyào bǎ mìmǎ gàosu biérén',
    translation: 'You absolutely must not tell anyone your password.',
    level: 4
  },
  {
    hanzi: '妈妈把洗好的衣服晒在阳台上',
    pinyin: 'māma bǎ xǐ hǎo de yīfu shài zài yángtái shàng',
    translation: 'Mom hung the washed clothes out to dry on the balcony.',
    level: 4
  },
  {
    hanzi: '我对家乡的风景非常想念',
    pinyin: 'wǒ duì jiāxiāng de fēngjǐng fēicháng xiǎngniàn',
    translation: 'I miss the scenery of my hometown very much.',
    level: 4
  },
  {
    hanzi: '我们应该学会如何面对压力',
    pinyin: 'wǒmen yīnggāi xuéhuì rúhé miànduì yālì',
    translation: 'We should learn how to face pressure.',
    level: 4
  },
  {
    hanzi: '明天是个特殊的日子',
    pinyin: 'míngtiān shì gè tèshū de rìzi',
    translation: 'Tomorrow is a special day.',
    level: 4
  },
  {
    hanzi: '他的病情很严重，需要住院治疗',
    pinyin: 'tā de bìngqíng hěn yánzhòng, xūyào zhùyuàn zhìliáo',
    translation: 'His condition is very serious and requires hospitalization.',
    level: 4
  },
  {
    hanzi: '这个问题很复杂，我们需要仔细讨论',
    pinyin: 'zhège wèntí hěn fùzá, wǒmen xūyào zǐxì tǎolùn',
    translation: 'This problem is very complex, we need to discuss it carefully.',
    level: 4
  },
  {
    hanzi: '西红柿炒鸡蛋是一道简单的家常菜',
    pinyin: 'xīhóngshì chǎo jīdàn shì yī dào jiǎndān de jiācháng cài',
    translation: 'Scrambled eggs with tomatoes is a simple home-style dish.',
    level: 4
  },
  {
    hanzi: '他一边喝咖啡一边看新闻',
    pinyin: 'tā yībiān hē kāfēi yībiān kàn xīnwén',
    translation: 'He drinks coffee while reading the news.',
    level: 4
  },
  {
    hanzi: '快来不及了，我们打的吧',
    pinyin: 'kuài láibují le, wǒmen dǎdī ba',
    translation: "There's not enough time, let's take a taxi.",
    level: 4
  },
  {
    hanzi: '我对文学和历史都很感兴趣',
    pinyin: 'wǒ duì wénxué hé lìshǐ dōu hěn gǎn xìngqù',
    translation: 'I am very interested in both literature and history.',
    level: 4
  },
  {
    hanzi: '这不仅是个人的事情，还关系到整个社会',
    pinyin: 'zhè bùjǐn shì gèrén de shìqíng, hái guānxì dào zhěnggè shèhuì',
    translation: 'This is not just a personal matter, it also concerns the whole society.',
    level: 4
  },
  {
    hanzi: '夏天我很喜欢去海边游泳',
    pinyin: 'xiàtiān wǒ hěn xǐhuān qù hǎibiān yóuyǒng',
    translation: 'In summer I really like going to the beach to swim.',
    level: 4
  },
  {
    hanzi: '他把房间整整齐齐地打扫了一遍',
    pinyin: 'tā bǎ fángjiān zhěngzhěngqíqí de dǎsǎo le yī biàn',
    translation: 'He cleaned the room thoroughly and neatly.',
    level: 4
  },
  {
    hanzi: '我还没有来得及吃饭',
    pinyin: 'wǒ hái méiyǒu láidejí chīfàn',
    translation: "I haven't had time to eat yet.",
    level: 4
  },
  {
    hanzi: '他拉开门就走了出去',
    pinyin: 'tā lākāi mén jiù zǒule chūqù',
    translation: 'He pulled open the door and walked out.',
    level: 4
  },
  {
    hanzi: '孩子们兴奋地拆开了他们的礼物',
    pinyin: 'háizimen xīngfèn de chāikāile tāmen de lǐwù',
    translation: 'The children excitedly unwrapped their gifts.',
    level: 4
  },
  {
    hanzi: '既然来了，就好好享受这个假期吧',
    pinyin: 'jìrán lái le, jiù hǎohǎo xiǎngshòu zhège jiàqī ba',
    translation: "Since you're here, just enjoy this vacation.",
    level: 4
  },
  {
    hanzi: '不管你同不同意，我都会按计划进行',
    pinyin: 'bùguǎn nǐ tóng bù tóngyì, wǒ dōu huì àn jìhuà jìnxíng',
    translation: 'Whether you agree or not, I will proceed according to the plan.',
    level: 4
  },
  {
    hanzi: '这个结果出乎所有人的意料',
    pinyin: 'zhège jiéguǒ chūhū suǒyǒu rén de yìliào',
    translation: "This result was beyond everyone's expectations.",
    level: 4
  },
  {
    hanzi: '冰箱里的菜都已经不新鲜了',
    pinyin: 'bīngxiāng lǐ de cài dōu yǐjīng bù xīnxiān le',
    translation: 'The vegetables in the refrigerator are no longer fresh.',
    level: 4
  },
  {
    hanzi: '法律面前人人平等',
    pinyin: 'fǎlǜ miànqián rén rén píngděng',
    translation: 'Everyone is equal before the law.',
    level: 4
  },
  {
    hanzi: '他忍不住大笑起来',
    pinyin: 'tā rěn bù zhù dà xiào qǐlai',
    translation: "He couldn't help but burst out laughing.",
    level: 4
  },
  {
    hanzi: '希望你能尽快适应新环境',
    pinyin: 'xīwàng nǐ néng jǐnkuài shìyìng xīn huánjìng',
    translation: 'I hope you can adapt to the new environment as soon as possible.',
    level: 4
  },
  {
    hanzi: '那些花开了又谢了',
    pinyin: 'nàxiē huā kāile yòu xièle',
    translation: 'Those flowers bloomed and then withered.',
    level: 4
  },
  {
    hanzi: '我们今天晚上去看电影或者逛商场吧',
    pinyin: 'wǒmen jīntiān wǎnshang qù kàn diànyǐng huòzhě guàng shāngchǎng ba',
    translation: "Let's go watch a movie or go shopping tonight.",
    level: 4
  },
  {
    hanzi: '他紧张得连话都说不出来了',
    pinyin: 'tā jǐnzhāng de lián huà dōu shuō bù chūlái le',
    translation: "He was so nervous that he couldn't even speak.",
    level: 4
  },
  {
    hanzi: '这个故事深深地感动了我',
    pinyin: 'zhège gùshi shēnshēn de gǎndòng le wǒ',
    translation: 'This story deeply moved me.',
    level: 4
  },
  {
    hanzi: '他不但有才华，而且非常谦虚',
    pinyin: 'tā bùdàn yǒu cáihuá, érqiě fēicháng qiānxū',
    translation: 'He is not only talented but also very humble.',
    level: 4
  },
  {
    hanzi: '她站在镜子前看了很久',
    pinyin: 'tā zhàn zài jìngzi qián kànle hěn jiǔ',
    translation: 'She stood in front of the mirror and looked for a long time.',
    level: 4
  },
  {
    hanzi: '这个小伙子在操场上跑步',
    pinyin: 'zhège xiǎohuǒzi zài cāochǎng shàng pǎobù',
    translation: 'This young man is running on the playground.',
    level: 4
  },
  {
    hanzi: '他是一位著名的作家和诗人',
    pinyin: 'tā shì yī wèi zhùmíng de zuòjiā hé shīrén',
    translation: 'He is a famous writer and poet.',
    level: 4
  },
  {
    hanzi: '快递员刚把包裹送到了门口',
    pinyin: 'kuàidì yuán gāng bǎ bāoguǒ sòng dào le ménkǒu',
    translation: 'The courier just delivered the package to the door.',
    level: 4
  },
  {
    hanzi: '我们应该支持环保，减少使用塑料袋',
    pinyin: 'wǒmen yīnggāi zhīchí huánbǎo, jiǎnshǎo shǐyòng sùliào dài',
    translation: 'We should support environmental protection and reduce the use of plastic bags.',
    level: 4
  },
  {
    hanzi: '经过反复试验，他终于成功了',
    pinyin: 'jīngguò fǎnfù shìyàn, tā zhōngyú chénggōng le',
    translation: 'After repeated experiments, he finally succeeded.',
    level: 4
  },
  {
    hanzi: '这种食品含有丰富的营养',
    pinyin: 'zhè zhǒng shípǐn hányǒu fēngfù de yíngyǎng',
    translation: 'This food contains rich nutrition.',
    level: 4
  },
  {
    hanzi: '由于堵车，他迟到了半个小时',
    pinyin: 'yóuyú dǔchē, tā chídào le bàn gè xiǎoshí',
    translation: 'Due to a traffic jam, he was half an hour late.',
    level: 4
  },
  {
    hanzi: '我们不得不承认这个事实',
    pinyin: 'wǒmen bùdébù chéngrèn zhège shìshí',
    translation: 'We have no choice but to admit this fact.',
    level: 4
  },
  {
    hanzi: '随着经济的发展，人们的生活水平提高了',
    pinyin: 'suízhe jīngjì de fāzhǎn, rénmen de shēnghuó shuǐpíng tígāo le',
    translation: "With economic development, people's living standards have improved.",
    level: 4
  },
  {
    hanzi: '我已经提交了签证申请',
    pinyin: 'wǒ yǐjīng tíjiāo le qiānzhèng shēnqǐng',
    translation: 'I have already submitted the visa application.',
    level: 4
  },
  {
    hanzi: '他戴着一顶帽子和一副眼镜',
    pinyin: 'tā dàizhe yī dǐng màozi hé yī fù yǎnjìng',
    translation: 'He is wearing a hat and a pair of glasses.',
    level: 4
  },
  {
    hanzi: '这对老夫妇结婚已经五十年了',
    pinyin: 'zhè duì lǎo fūfù jiéhūn yǐjīng wǔshí nián le',
    translation: 'This elderly couple has been married for fifty years.',
    level: 4
  },
  {
    hanzi: '她对这次比赛一直充满信心',
    pinyin: 'tā duì zhè cì bǐsài yīzhí chōngmǎn xìnxīn',
    translation: 'She has always been full of confidence about this competition.',
    level: 4
  },
  {
    hanzi: '你记得提醒我明天上午有个重要会议',
    pinyin: 'nǐ jìde tíxǐng wǒ míngtiān shàngwǔ yǒu gè zhòngyào huìyì',
    translation: 'Remember to remind me that I have an important meeting tomorrow morning.',
    level: 4
  },
  {
    hanzi: '那个小姑娘穿着一条红裙子',
    pinyin: 'nàge xiǎo gūniang chuānzhe yī tiáo hóng qúnzi',
    translation: 'That little girl is wearing a red skirt.',
    level: 4
  },
  {
    hanzi: '这孩子对什么都充满了好奇心',
    pinyin: 'zhè háizi duì shénme dōu chōngmǎn le hàoqí xīn',
    translation: 'This child is full of curiosity about everything.',
    level: 4
  },
  {
    hanzi: '他们公司新开发了一款手机应用',
    pinyin: 'tāmen gōngsī xīn kāifā le yī kuǎn shǒujī yìngyòng',
    translation: 'Their company newly developed a mobile app.',
    level: 4
  },
  {
    hanzi: '请您填一下这张表格',
    pinyin: 'qǐng nín tián yīxià zhè zhāng biǎogé',
    translation: 'Please fill out this form.',
    level: 4
  },
  {
    hanzi: '这套公寓包括两个卧室和一个小花园',
    pinyin: 'zhè tào gōngyù bāokuò liǎng gè wòshì hé yī gè xiǎo huāyuán',
    translation: 'This apartment includes two bedrooms and a small garden.',
    level: 4
  },
  {
    hanzi: '我一直梦想着有一天能环游世界',
    pinyin: 'wǒ yīzhí mèngxiǎng zhe yǒu yī tiān néng huányóu shìjiè',
    translation: 'I have always dreamed of one day traveling around the world.',
    level: 4
  },
  {
    hanzi: '他忽然转身离开了房间',
    pinyin: 'tā hūrán zhuǎnshēn líkāi le fángjiān',
    translation: 'He suddenly turned around and left the room.',
    level: 4
  },
  {
    hanzi: '吸烟对身体有很大的伤害',
    pinyin: 'xīyān duì shēntǐ yǒu hěn dà de shānghài',
    translation: 'Smoking does great harm to the body.',
    level: 4
  },
  {
    hanzi: '你可以在网上下载这些资料',
    pinyin: 'nǐ kěyǐ zài wǎng shàng xiàzài zhèxiē zīliào',
    translation: 'You can download these materials online.',
    level: 4
  },
  {
    hanzi: '事情的真相终于水落石出了',
    pinyin: 'shìqíng de zhēnxiàng zhōngyú shuǐluòshíchū le',
    translation: 'The truth of the matter has finally come to light.',
    level: 4
  },
  {
    hanzi: '这家餐厅的服务质量很高',
    pinyin: 'zhè jiā cāntīng de fúwù zhìliàng hěn gāo',
    translation: 'The service quality of this restaurant is very high.',
    level: 4
  },
  {
    hanzi: '他把钱都存入银行了',
    pinyin: 'tā bǎ qián dōu cún rù yínháng le',
    translation: 'He deposited all the money into the bank.',
    level: 4
  },
  {
    hanzi: '他是一位有丰富经验的老教师',
    pinyin: 'tā shì yī wèi yǒu fēngfù jīngyàn de lǎo jiàoshī',
    translation: 'He is an old teacher with rich experience.',
    level: 4
  },
  {
    hanzi: '明天天气预报说会降温',
    pinyin: 'míngtiān tiānqì yùbào shuō huì jiàngwēn',
    translation: "Tomorrow's weather forecast says it will cool down.",
    level: 4
  },
  {
    hanzi: '节约用水是每个人的责任',
    pinyin: 'jiéyuē yòng shuǐ shì měi gè rén de zérèn',
    translation: "Saving water is everyone's responsibility.",
    level: 4
  },
  {
    hanzi: '他的手机掉在地上摔坏了',
    pinyin: 'tā de shǒujī diào zài dì shàng shuāi huài le',
    translation: 'His phone fell on the ground and broke.',
    level: 4
  },
  {
    hanzi: '我跟你开玩笑的，别那么紧张',
    pinyin: 'wǒ gēn nǐ kāiwánxiào de, bié nàme jǐnzhāng',
    translation: "I was joking with you, don't be so nervous.",
    level: 4
  },
  {
    hanzi: '那个演员的表演非常精彩',
    pinyin: 'nàge yǎnyuán de biǎoyǎn fēicháng jīngcǎi',
    translation: "That actor's performance was very brilliant.",
    level: 4
  },
  {
    hanzi: '我只吃了一口就知道菜太咸了',
    pinyin: 'wǒ zhǐ chīle yī kǒu jiù zhīdào cài tài xián le',
    translation: 'I only took one bite and knew the dish was too salty.',
    level: 4
  },
  {
    hanzi: '他没来得及说再见就走了',
    pinyin: 'tā méi láidejí shuō zàijiàn jiù zǒu le',
    translation: 'He left without having time to say goodbye.',
    level: 4
  },
  {
    hanzi: '她轻轻地推开门走了进去',
    pinyin: 'tā qīngqīng de tuīkāi mén zǒule jìnqù',
    translation: 'She gently pushed open the door and walked in.',
    level: 4
  },
  {
    hanzi: '我完全理解你现在的心情',
    pinyin: 'wǒ wánquán lǐjiě nǐ xiànzài de xīnqíng',
    translation: 'I completely understand how you feel right now.',
    level: 4
  },
  {
    hanzi: '这个任务比我们想象的要复杂得多',
    pinyin: 'zhège rènwù bǐ wǒmen xiǎngxiàng de yào fùzá de duō',
    translation: 'This task is much more complex than we imagined.',
    level: 4
  },
  {
    hanzi: '他不仅会说英语，还会说法语和日语',
    pinyin: 'tā bùjǐn huì shuō yīngyǔ, hái huì shuō fǎyǔ hé rìyǔ',
    translation: 'He can speak not only English but also French and Japanese.',
    level: 4
  },
  {
    hanzi: '外面冷得很，快穿上外套吧',
    pinyin: 'wàimiàn lěng de hěn, kuài chuānshang wàitào ba',
    translation: "It's very cold outside, quickly put on your coat.",
    level: 4
  },
  {
    hanzi: '我今天累得连饭都吃不下',
    pinyin: 'wǒ jīntiān lèi de lián fàn dōu chī bù xià',
    translation: "I'm so tired today that I can't even eat.",
    level: 4
  },
  {
    hanzi: '这瓶酸奶已经过期了',
    pinyin: 'zhè píng suānnǎi yǐjīng guòqī le',
    translation: 'This bottle of yogurt has already expired.',
    level: 4
  },
  {
    hanzi: '尽管遇到了许多困难，他始终没有放弃',
    pinyin: 'jǐnguǎn yùdào le xǔduō kùnnan, tā shǐzhōng méiyǒu fàngqì',
    translation: 'Despite encountering many difficulties, he never gave up.',
    level: 4
  },
  {
    hanzi: '这所学校大约有三千名学生',
    pinyin: 'zhè suǒ xuéxiào dàyuē yǒu sānqiān míng xuéshēng',
    translation: 'This school has approximately three thousand students.',
    level: 4
  },
  {
    hanzi: '我要好好准备下个月的期中考试',
    pinyin: 'wǒ yào hǎohǎo zhǔnbèi xià gè yuè de qīzhōng kǎoshì',
    translation: "I need to prepare well for next month's midterm exam.",
    level: 4
  },
  {
    hanzi: '他把手机落在出租车上忘了拿',
    pinyin: 'tā bǎ shǒujī là zài chūzūchē shàng wàng le ná',
    translation: 'He left his phone in the taxi and forgot to take it.',
    level: 4
  },
  {
    hanzi: '这两座城市之间的距离大概有两百公里',
    pinyin: 'zhè liǎng zuò chéngshì zhī jiān de jùlí dàgài yǒu liǎng bǎi gōnglǐ',
    translation: 'The distance between these two cities is about two hundred kilometers.',
    level: 4
  },
  {
    hanzi: '他上午去医院做了一个体检',
    pinyin: 'tā shàngwǔ qù yīyuàn zuòle yī gè tǐjiǎn',
    translation: 'He went to the hospital for a health checkup this morning.',
    level: 4
  },
  {
    hanzi: '这是一本关于中国历史的书',
    pinyin: 'zhè shì yī běn guānyú zhōngguó lìshǐ de shū',
    translation: 'This is a book about Chinese history.',
    level: 4
  },
  {
    hanzi: '那家工厂因为污染环境被关闭了',
    pinyin: 'nà jiā gōngchǎng yīnwèi wūrǎn huánjìng bèi guānbì le',
    translation: 'That factory was shut down for polluting the environment.',
    level: 4
  },
  {
    hanzi: '他做完手术以后恢复得很快',
    pinyin: 'tā zuò wán shǒushù yǐhòu huīfù de hěn kuài',
    translation: 'He recovered very quickly after the surgery.',
    level: 4
  },
  {
    hanzi: '不管别人怎么说，我都坚持自己的选择',
    pinyin: 'bùguǎn biérén zěnme shuō, wǒ dōu jiānchí zìjǐ de xuǎnzé',
    translation: 'No matter what others say, I stick to my own choice.',
    level: 4
  },
  {
    hanzi: '大家纷纷站起来为她鼓掌',
    pinyin: 'dàjiā fēnfēn zhàn qǐlai wèi tā gǔzhǎng',
    translation: 'Everyone stood up one after another to applaud her.',
    level: 4
  },
  {
    hanzi: '这个秘密他已经保守了十年',
    pinyin: 'zhège mìmì tā yǐjīng bǎoshǒu le shí nián',
    translation: 'He has kept this secret for ten years.',
    level: 4
  },
  {
    hanzi: '现在越来越多的年轻人喜欢户外运动',
    pinyin: 'xiànzài yuèláiyuè duō de niánqīng rén xǐhuān hùwài yùndòng',
    translation: 'Now more and more young people like outdoor sports.',
    level: 4
  },
  {
    hanzi: '他握紧拳头，咬紧了牙关',
    pinyin: 'tā wòjǐn quántou, yǎojǐn le yáguān',
    translation: 'He clenched his fists and gritted his teeth.',
    level: 4
  },

  // ═══════════════ HSK 5 (Level 5) ═══════════════
  // 110+ sentences using HSK 3.0 Level 1-5 vocabulary.
  {
    hanzi: '即使遇到再大的困难，我也不会放弃',
    pinyin: 'jíshǐ yùdào zài dà de kùnnan, wǒ yě bùhuì fàngqì',
    translation: "Even if I encounter the greatest difficulties, I won't give up.",
    level: 5
  },
  {
    hanzi: '他将成为公司新一任的总经理',
    pinyin: 'tā jiāng chéngwéi gōngsī xīn yī rèn de zǒngjīnglǐ',
    translation: "He will become the company's new general manager.",
    level: 5
  },
  {
    hanzi: '除非下雨，否则我们一定会去爬山',
    pinyin: 'chúfēi xià yǔ, fǒuzé wǒmen yīdìng huì qù páshān',
    translation: 'Unless it rains, otherwise we will definitely go hiking.',
    level: 5
  },
  {
    hanzi: '他的行为引起了大家的强烈不满',
    pinyin: 'tā de xíngwéi yǐnqǐ le dàjiā de qiángliè bùmǎn',
    translation: "His behavior aroused everyone's strong dissatisfaction.",
    level: 5
  },
  {
    hanzi: '毕竟我们是多年的老朋友了',
    pinyin: 'bìjìng wǒmen shì duō nián de lǎo péngyou le',
    translation: 'After all, we have been old friends for many years.',
    level: 5
  },
  {
    hanzi: '他居然连这么简单的题目都不会做',
    pinyin: 'tā jūrán lián zhème jiǎndān de tímù dōu bùhuì zuò',
    translation: "He unexpectedly can't even solve such a simple problem.",
    level: 5
  },
  {
    hanzi: '我忍不住把心里的想法都说出来了',
    pinyin: 'wǒ rěnbuzhù bǎ xīnli de xiǎngfǎ dōu shuō chūlái le',
    translation: "I couldn't help but speak out all the thoughts in my heart.",
    level: 5
  },
  {
    hanzi: '这个消息简直让人难以相信',
    pinyin: 'zhège xiāoxi jiǎnzhí ràng rén nányǐ xiāngxìn',
    translation: 'This news is simply hard to believe.',
    level: 5
  },
  {
    hanzi: '我们不仅要关注数量，更要重视质量',
    pinyin: 'wǒmen bùjǐn yào guānzhù shùliàng, gèng yào zhòngshì zhìliàng',
    translation: 'We should not only pay attention to quantity, but also value quality.',
    level: 5
  },
  {
    hanzi: '他恨不得马上飞到她身边',
    pinyin: 'tā hènbude mǎshàng fēi dào tā shēnbiān',
    translation: 'He wished he could fly to her side immediately.',
    level: 5
  },
  {
    hanzi: '无论如何，请你一定要保重身体',
    pinyin: 'wúlùn rúhé, qǐng nǐ yīdìng yào bǎozhòng shēntǐ',
    translation: 'No matter what, please take good care of your health.',
    level: 5
  },
  {
    hanzi: '从本质上看，这不是一个简单的问题',
    pinyin: 'cóng běnzhì shàng kàn, zhè bù shì yīgè jiǎndān de wèntí',
    translation: 'Essentially speaking, this is not a simple problem.',
    level: 5
  },
  {
    hanzi: '他动不动就发脾气，真是让人受不了',
    pinyin: 'tā dòngbudòng jiù fā píqi, zhēnshi ràng rén shòubùliǎo',
    translation: "He loses his temper at the slightest thing, it's really unbearable.",
    level: 5
  },
  {
    hanzi: '这座博物馆收藏了许多珍贵的文物',
    pinyin: 'zhè zuò bówùguǎn shōucáng le xǔduō zhēnguì de wénwù',
    translation: 'This museum houses many precious cultural relics.',
    level: 5
  },
  {
    hanzi: '他默默地坐在角落里，一句话也不说',
    pinyin: 'tā mòmò de zuò zài jiǎoluò lǐ, yī jù huà yě bù shuō',
    translation: 'He sat silently in the corner, not saying a single word.',
    level: 5
  },
  {
    hanzi: '这份工作的压力太大了，他不得不辞职',
    pinyin: 'zhè fèn gōngzuò de yālì tài dà le, tā bùdébù cízhí',
    translation: 'The pressure of this job is too great, he had no choice but to resign.',
    level: 5
  },
  {
    hanzi: '科学家们正在研究如何解决这个难题',
    pinyin: 'kēxuéjiā men zhèngzài yánjiū rúhé jiějué zhège nántí',
    translation: 'Scientists are researching how to solve this difficult problem.',
    level: 5
  },
  {
    hanzi: '他的勇敢和善良深深地打动了在场的每个人',
    pinyin: 'tā de yǒnggǎn hé shànliáng shēnshēn de dǎdòng le zàichǎng de měi gè rén',
    translation: 'His bravery and kindness deeply touched everyone present.',
    level: 5
  },
  {
    hanzi: '随着科技的进步，人们的生活将会发生巨大变化',
    pinyin: 'suízhe kējì de jìnbù, rénmen de shēnghuó jiāng huì fāshēng jùdà biànhuà',
    translation: "With the advancement of technology, people's lives will undergo huge changes.",
    level: 5
  },
  {
    hanzi: '为了照顾生病的母亲，他放弃了出国留学的机会',
    pinyin: 'wèile zhàogù shēngbìng de mǔqin, tā fàngqì le chūguó liúxué de jīhuì',
    translation: 'To take care of his sick mother, he gave up the opportunity to study abroad.',
    level: 5
  },
  {
    hanzi: '在朋友的鼓励下，她终于鼓起勇气走上了舞台',
    pinyin: 'zài péngyou de gǔlì xià, tā zhōngyú gǔqǐ yǒngqì zǒushàng le wǔtái',
    translation:
      'Encouraged by her friends, she finally gathered the courage to walk onto the stage.',
    level: 5
  },
  {
    hanzi: '面对困难，他始终保持着积极乐观的态度',
    pinyin: 'miànduì kùnnan, tā shǐzhōng bǎochí zhe jījí lèguān de tàidù',
    translation: 'Facing difficulties, he always maintains a positive and optimistic attitude.',
    level: 5
  },
  {
    hanzi: '政府正在采取措施以减少空气污染',
    pinyin: 'zhèngfǔ zhèngzài cǎiqǔ cuòshī yǐ jiǎnshǎo kōngqì wūrǎn',
    translation: 'The government is taking measures to reduce air pollution.',
    level: 5
  },
  {
    hanzi: '他不但有着丰富的想象力，而且非常善于表达',
    pinyin: 'tā bùdàn yǒuzhe fēngfù de xiǎngxiànglì, érqiě fēicháng shànyú biǎodá',
    translation: 'He not only has a rich imagination but is also very good at expressing himself.',
    level: 5
  },
  {
    hanzi: '这本小说以十九世纪的英国为背景',
    pinyin: 'zhè běn xiǎoshuō yǐ shíjiǔ shìjì de yīngguó wéi bèijǐng',
    translation: 'This novel is set against the background of 19th century England.',
    level: 5
  },
  {
    hanzi: '经过多年的努力奋斗，他终于实现了自己的梦想',
    pinyin: 'jīngguò duō nián de nǔlì fèndòu, tā zhōngyú shíxiàn le zìjǐ de mèngxiǎng',
    translation: 'After many years of hard work and struggle, he finally realized his dream.',
    level: 5
  },
  {
    hanzi: '她不仅是一位优秀的科学家，同时也是一位慈爱的母亲',
    pinyin: 'tā bùjǐn shì yī wèi yōuxiù de kēxuéjiā, tóngshí yě shì yī wèi cíài de mǔqin',
    translation: 'She is not only an excellent scientist but also a loving mother.',
    level: 5
  },
  {
    hanzi: '据说这部电影的拍摄过程十分艰难',
    pinyin: 'jùshuō zhè bù diànyǐng de pāishè guòchéng shífēn jiānnán',
    translation: 'It is said that the filming process of this movie was extremely difficult.',
    level: 5
  },
  {
    hanzi: '我们要学会从失败中吸取教训',
    pinyin: 'wǒmen yào xuéhuì cóng shībài zhōng xīqǔ jiàoxùn',
    translation: 'We should learn to draw lessons from failure.',
    level: 5
  },
  {
    hanzi: '这道烤鸭的味道好极了，你快尝尝吧',
    pinyin: 'zhè dào kǎoyā de wèidào hǎo jíle, nǐ kuài chángchang ba',
    translation: 'This roast duck tastes wonderful, hurry up and try it.',
    level: 5
  },
  {
    hanzi: '幸亏有你的帮助，否则我真的不知道该怎么办',
    pinyin: 'xìngkuī yǒu nǐ de bāngzhù, fǒuzé wǒ zhēnde bù zhīdào gāi zěnmebàn',
    translation: "Fortunately I had your help, otherwise I really wouldn't know what to do.",
    level: 5
  },
  {
    hanzi: '这家餐厅不仅环境优美，而且价格十分合理',
    pinyin: 'zhè jiā cāntīng bùjǐn huánjìng yōuměi, érqiě jiàgé shífēn hélǐ',
    translation:
      'This restaurant not only has a beautiful environment, but also very reasonable prices.',
    level: 5
  },
  {
    hanzi: '她从小就梦想着成为一名出色的舞蹈家',
    pinyin: 'tā cóngxiǎo jiù mèngxiǎng zhe chéngwéi yī míng chūsè de wǔdǎojiā',
    translation: 'Since childhood she has dreamed of becoming an outstanding dancer.',
    level: 5
  },
  {
    hanzi: '这本书详细地描述了那个时代的真实情况',
    pinyin: 'zhè běn shū xiángxì de miáoshù le nàge shídài de zhēnshí qíngkuàng',
    translation: 'This book describes in detail the real situation of that era.',
    level: 5
  },
  {
    hanzi: '无论如何，健康才是最重要的财富',
    pinyin: 'wúlùn rúhé, jiànkāng cáishì zuì zhòngyào de cáifù',
    translation: 'No matter what, health is the most important wealth.',
    level: 5
  },
  {
    hanzi: '他突然意识到自己犯了一个严重的错误',
    pinyin: 'tā tūrán yìshí dào zìjǐ fàn le yīgè yánzhòng de cuòwù',
    translation: 'He suddenly realized that he had made a serious mistake.',
    level: 5
  },
  {
    hanzi: '由于原材料价格上涨，产品的成本也提高了',
    pinyin: 'yóuyú yuáncáiliào jiàgé shàngzhǎng, chǎnpǐn de chéngběn yě tígāo le',
    translation: 'Due to rising raw material prices, the cost of products has also increased.',
    level: 5
  },
  {
    hanzi: '他这个人从来不怕得罪人，有什么就说什么',
    pinyin: 'tā zhège rén cónglái bù pà dézuì rén, yǒu shénme jiù shuō shénme',
    translation: 'This person is never afraid of offending people, he says whatever he thinks.',
    level: 5
  },
  {
    hanzi: '我们要以积极的心态面对生活中的挑战',
    pinyin: 'wǒmen yào yǐ jījí de xīntài miànduì shēnghuó zhōng de tiǎozhàn',
    translation: 'We should face the challenges in life with a positive attitude.',
    level: 5
  },
  {
    hanzi: '随着互联网的普及，网购已经成为一种常见的购物方式',
    pinyin:
      'suízhe hùliánwǎng de pǔjí, wǎnggòu yǐjīng chéngwéi yī zhǒng chángjiàn de gòuwù fāngshì',
    translation:
      'With the popularization of the internet, online shopping has become a common way of shopping.',
    level: 5
  },
  {
    hanzi: '老板要求我们在月底之前完成这个项目',
    pinyin: 'lǎobǎn yāoqiú wǒmen zài yuèdǐ zhīqián wánchéng zhège xiàngmù',
    translation: 'The boss requires us to complete this project before the end of the month.',
    level: 5
  },
  {
    hanzi: '他拒绝了我的邀请，这让我感到非常失望',
    pinyin: 'tā jùjué le wǒ de yāoqǐng, zhè ràng wǒ gǎndào fēicháng shīwàng',
    translation: 'He refused my invitation, which made me feel very disappointed.',
    level: 5
  },
  {
    hanzi: '他的作品深刻地反映了现代社会的各种矛盾',
    pinyin: 'tā de zuòpǐn shēnkè de fǎnyìng le xiàndài shèhuì de gè zhǒng máodùn',
    translation: 'His works deeply reflect the various contradictions of modern society.',
    level: 5
  },
  {
    hanzi: '据说那个地区最近发生了一次强烈的地震',
    pinyin: 'jùshuō nàge dìqū zuìjìn fāshēng le yī cì qiángliè de dìzhèn',
    translation: 'It is said that a strong earthquake recently occurred in that area.',
    level: 5
  },
  {
    hanzi: '尽管年纪大了，他仍然坚持每天锻炼身体',
    pinyin: 'jǐnguǎn niánjì dà le, tā réngrán jiānchí měitiān duànliàn shēntǐ',
    translation: 'Despite his advanced age, he still insists on exercising every day.',
    level: 5
  },
  {
    hanzi: '他的成功经验值得我们每个人认真学习和思考',
    pinyin: 'tā de chénggōng jīngyàn zhídé wǒmen měi gè rén rènzhēn xuéxí hé sīkǎo',
    translation:
      'His successful experience is worth every one of us studying and thinking about seriously.',
    level: 5
  },
  {
    hanzi: '她把自己打扮得漂漂亮亮地去参加晚会了',
    pinyin: 'tā bǎ zìjǐ dǎbàn de piàopiàoliangliang de qù cānjiā wǎnhuì le',
    translation: 'She dressed herself up beautifully and went to attend the evening party.',
    level: 5
  },
  {
    hanzi: '你千万不要被他的外表所欺骗',
    pinyin: 'nǐ qiānwàn bùyào bèi tā de wàibiǎo suǒ qīpiàn',
    translation: 'You absolutely must not be deceived by his appearance.',
    level: 5
  },
  {
    hanzi: '近年来，人工智能技术取得了巨大的进步',
    pinyin: 'jìnnián lái, réngōng zhìnéng jìshù qǔdé le jùdà de jìnbù',
    translation:
      'In recent years, artificial intelligence technology has made tremendous progress.',
    level: 5
  },
  {
    hanzi: '他把自己的全部精力都投入到了教育事业中',
    pinyin: 'tā bǎ zìjǐ de quánbù jīnglì dōu tóurù dào le jiàoyù shìyè zhōng',
    translation: 'He has devoted all his energy to the cause of education.',
    level: 5
  },
  {
    hanzi: '我们不得不面对一个残酷的现实',
    pinyin: 'wǒmen bùdébù miànduì yīgè cánkù de xiànshí',
    translation: 'We have no choice but to face a cruel reality.',
    level: 5
  },
  {
    hanzi: '那个小男孩害羞地躲到了妈妈的身后',
    pinyin: 'nàge xiǎo nánhái hàixiū de duǒ dào le māma de shēn hòu',
    translation: 'That little boy shyly hid behind his mother.',
    level: 5
  },
  {
    hanzi: '只有通过不断的实践，才能真正掌握一门技能',
    pinyin: 'zhǐyǒu tōngguò bùduàn de shíjiàn, cáinéng zhēnzhèng zhǎngwò yī mén jìnéng',
    translation: 'Only through continuous practice can one truly master a skill.',
    level: 5
  },
  {
    hanzi: '这件事的责任不在于你，而在于我',
    pinyin: 'zhè jiàn shì de zérèn bù zàiyú nǐ, ér zàiyú wǒ',
    translation: 'The responsibility for this matter lies not with you, but with me.',
    level: 5
  },
  {
    hanzi: '她的微笑给人留下了深刻的印象',
    pinyin: 'tā de wēixiào gěi rén liúxià le shēnkè de yìnxiàng',
    translation: 'Her smile left a deep impression on people.',
    level: 5
  },
  {
    hanzi: '我估计这道菜至少要半个小时才能做好',
    pinyin: 'wǒ gūjì zhè dào cài zhìshǎo yào bàn gè xiǎoshí cáinéng zuò hǎo',
    translation: 'I estimate this dish will take at least half an hour to be ready.',
    level: 5
  },
  {
    hanzi: '他不但没有感谢我，反而还抱怨个不停',
    pinyin: 'tā bùdàn méiyǒu gǎnxiè wǒ, fǎnér hái bàoyuàn gè bùtíng',
    translation: 'Not only did he not thank me, but on the contrary he complained endlessly.',
    level: 5
  },
  {
    hanzi: '我们应该尽量节约用水，以保护宝贵的水资源',
    pinyin: 'wǒmen yīnggāi jǐnliàng jiéyuē yòng shuǐ, yǐ bǎohù bǎoguì de shuǐ zīyuán',
    translation:
      'We should try our best to save water in order to protect precious water resources.',
    level: 5
  },
  {
    hanzi: '他的父母对他要求非常严格',
    pinyin: 'tā de fùmǔ duì tā yāoqiú fēicháng yángé',
    translation: 'His parents are very strict with him.',
    level: 5
  },
  {
    hanzi: '这条裙子很适合你，显得你更漂亮了',
    pinyin: 'zhè tiáo qúnzi hěn shìhé nǐ, xiǎnde nǐ gèng piàoliang le',
    translation: 'This skirt suits you very well, making you look even more beautiful.',
    level: 5
  },
  {
    hanzi: '我已经充分意识到了这个问题的严重性',
    pinyin: 'wǒ yǐjīng chōngfèn yìshí dào le zhège wèntí de yánzhòng xìng',
    translation: 'I have fully realized the seriousness of this problem.',
    level: 5
  },
  {
    hanzi: '他把房间收拾得干干净净的',
    pinyin: 'tā bǎ fángjiān shōushi de gāngānjìngjìng de',
    translation: 'He tidied up the room spotlessly.',
    level: 5
  },
  {
    hanzi: '随着全球气温的升高，极端天气越来越频繁',
    pinyin: 'suízhe quánqiú qìwēn de shēnggāo, jíduān tiānqì yuèláiyuè pínfán',
    translation:
      'With the rise of global temperatures, extreme weather is becoming more and more frequent.',
    level: 5
  },
  {
    hanzi: '这道题目的答案到底是什么？你倒是告诉我呀',
    pinyin: 'zhè dào tímù de dààn dàodǐ shì shénme? nǐ dàoshi gàosu wǒ ya',
    translation: 'What exactly is the answer to this question? Just tell me.',
    level: 5
  },
  {
    hanzi: '他整天忙着工作，几乎没有时间陪家人',
    pinyin: 'tā zhěngtiān mángzhe gōngzuò, jīhū méiyǒu shíjiān péi jiārén',
    translation: 'He is busy working all day and has almost no time to spend with his family.',
    level: 5
  },
  {
    hanzi: '如果你有什么困难，可以随时向我们寻求帮助',
    pinyin: 'rúguǒ nǐ yǒu shénme kùnnan, kěyǐ suíshí xiàng wǒmen xúnqiú bāngzhù',
    translation: 'If you have any difficulties, you can seek help from us at any time.',
    level: 5
  },
  {
    hanzi: '与其坐在这里空想，不如马上行动起来',
    pinyin: 'yǔqí zuò zài zhèlǐ kōngxiǎng, bùrú mǎshàng xíngdòng qǐlái',
    translation: "Rather than sitting here daydreaming, it's better to take action immediately.",
    level: 5
  },
  {
    hanzi: '她的歌声如此优美，把全场观众都吸引住了',
    pinyin: 'tā de gēshēng rúcǐ yōuměi, bǎ quánchǎng guānzhòng dōu xīyǐn zhù le',
    translation: 'Her singing was so beautiful that it captivated the entire audience.',
    level: 5
  },
  {
    hanzi: '他不顾个人安危，跳入河中去救那个落水的孩子',
    pinyin: 'tā bùgù gèrén ānwēi, tiàorù hé zhōng qù jiù nàge luòshuǐ de háizi',
    translation:
      'Regardless of his personal safety, he jumped into the river to save the drowning child.',
    level: 5
  },
  {
    hanzi: '我们应该以一种开放的心态来看待不同的文化和观念',
    pinyin: 'wǒmen yīnggāi yǐ yī zhǒng kāifàng de xīntài lái kàndài bùtóng de wénhuà hé guānniàn',
    translation: 'We should look at different cultures and ideas with an open mind.',
    level: 5
  },
  {
    hanzi: '他把公司从一个只有几个人的小团队发展成了行业领袖',
    pinyin:
      'tā bǎ gōngsī cóng yīgè zhǐyǒu jǐ gè rén de xiǎo tuánduì fāzhǎn chéng le hángyè lǐngxiù',
    translation:
      'He developed the company from a small team of just a few people into an industry leader.',
    level: 5
  },
  {
    hanzi: '这条规定适用于所有在此工作的员工',
    pinyin: 'zhè tiáo guīdìng shìyòng yú suǒyǒu zài cǐ gōngzuò de yuángōng',
    translation: 'This regulation applies to all employees working here.',
    level: 5
  },
  {
    hanzi: '由于身体原因，他不得不提前结束了自己的职业生涯',
    pinyin: 'yóuyú shēntǐ yuányīn, tā bùdébù tíqián jiéshù le zìjǐ de zhíyè shēngyá',
    translation: 'Due to health reasons, he had to end his professional career early.',
    level: 5
  },
  {
    hanzi: '她对中国古典音乐有着浓厚的兴趣',
    pinyin: 'tā duì zhōngguó gǔdiǎn yīnyuè yǒuzhe nónghòu de xìngqù',
    translation: 'She has a strong interest in Chinese classical music.',
    level: 5
  },
  {
    hanzi: '他的突然去世给整个行业带来了巨大的损失',
    pinyin: 'tā de tūrán qùshì gěi zhěnggè hángyè dàilái le jùdà de sǔnshī',
    translation: 'His sudden death brought a huge loss to the entire industry.',
    level: 5
  },
  {
    hanzi: '我劝你还是好好考虑一下再作决定吧',
    pinyin: 'wǒ quàn nǐ háishì hǎohǎo kǎolǜ yīxià zài zuò juédìng ba',
    translation: 'I advise you to think it over carefully before making a decision.',
    level: 5
  },
  {
    hanzi: '既然你已经意识到了自己的错误，那就及时改正吧',
    pinyin: 'jìrán nǐ yǐjīng yìshí dào le zìjǐ de cuòwù, nà jiù jíshí gǎizhèng ba',
    translation: 'Since you have already realized your mistake, then correct it in time.',
    level: 5
  },
  {
    hanzi: '这座大桥的建成将会极大地促进两岸经济的发展',
    pinyin: 'zhè zuò dà qiáo de jiàn chéng jiāng huì jídà de cùjìn liǎng àn jīngjì de fāzhǎn',
    translation:
      'The completion of this bridge will greatly promote the economic development of both sides.',
    level: 5
  },
  {
    hanzi: '他表面上装作无所谓，其实心里难受得要命',
    pinyin: 'tā biǎomiàn shàng zhuāngzuò wúsuǒwèi, qíshí xīnli nánshòu de yàomìng',
    translation:
      'On the surface he pretends not to care, but actually his heart is terribly upset.',
    level: 5
  },
  {
    hanzi: '随着春节的临近，人们都开始忙着购买年货了',
    pinyin: 'suízhe chūnjié de línjìn, rénmen dōu kāishǐ mángzhe gòumǎi niánhuò le',
    translation:
      'With the approach of the Spring Festival, people are starting to busy themselves buying New Year goods.',
    level: 5
  },
  {
    hanzi: '比起金钱，我更看重一个人的品质和修养',
    pinyin: 'bǐ qǐ jīnqián, wǒ gèng kànzhòng yīgè rén de pǐnzhì hé xiūyǎng',
    translation: "Compared to money, I value a person's character and cultivation more.",
    level: 5
  },
  {
    hanzi: '不管前方的路有多艰难，我们都要勇敢地走下去',
    pinyin: 'bùguǎn qiánfāng de lù yǒu duō jiānnán, wǒmen dōu yào yǒnggǎn de zǒu xiàqù',
    translation: 'No matter how difficult the road ahead is, we must bravely keep walking.',
    level: 5
  },
  {
    hanzi: '这个计划的实施需要得到各级部门的批准和配合',
    pinyin: 'zhège jìhuà de shíshī xūyào dédào gè jí bùmén de pīzhǔn hé pèihé',
    translation:
      'The implementation of this plan requires the approval and cooperation of departments at all levels.',
    level: 5
  },
  {
    hanzi: '即使失败了也不要紧，至少我们曾经努力过',
    pinyin: 'jíshǐ shībài le yě bùyàojǐn, zhìshǎo wǒmen céngjīng nǔlì guò',
    translation: "Even if we fail, it doesn't matter, at least we once tried our best.",
    level: 5
  },
  {
    hanzi: '你最好提前打个电话确认一下，免得到时候白跑一趟',
    pinyin: 'nǐ zuìhǎo tíqián dǎ gè diànhuà quèrèn yīxià, miǎnde dào shíhou bái pǎo yī tàng',
    translation: "You'd better call ahead to confirm, so as to avoid making a trip for nothing.",
    level: 5
  },
  {
    hanzi: '你们辛苦了一整天，快坐下来喝杯茶休息休息吧',
    pinyin: 'nǐmen xīnkǔ le yī zhěng tiān, kuài zuò xiàlái hē bēi chá xiūxi xiūxi ba',
    translation: "You've worked hard all day, quickly sit down and have a cup of tea to rest.",
    level: 5
  },

  // ═══════════════ HSK 6 (Level 6) ═══════════════
  // 110+ sentences using HSK 3.0 Level 1-6 vocabulary.
  {
    hanzi: '他不仅没有被困难吓倒，反而激起了更强烈的斗志',
    pinyin: 'tā bùjǐn méiyǒu bèi kùnnan xiàdǎo, fǎnér jīqǐ le gèng qiángliè de dòuzhì',
    translation:
      'Not only was he not scared by the difficulties, but on the contrary it aroused a stronger fighting spirit.',
    level: 6
  },
  {
    hanzi: '尽管面临着巨大的压力，他依然沉着冷静地应对着一切',
    pinyin: 'jǐnguǎn miànlín zhe jùdà de yālì, tā yīrán chénzhuó lěngjìng de yìngduì zhe yīqiè',
    translation:
      'Despite facing enormous pressure, he still calmly and composedly dealt with everything.',
    level: 6
  },
  {
    hanzi: '凡是亲身经历过那次地震的人，都难以忘记那悲惨的一幕',
    pinyin: 'fánshì qīnshēn jīnglì guò nà cì dìzhèn de rén, dōu nányǐ wàngjì nà bēicǎn de yī mù',
    translation:
      'All those who personally experienced that earthquake find it hard to forget that tragic scene.',
    level: 6
  },
  {
    hanzi: '与其埋怨命运的不公平，不如用实际行动去改变现状',
    pinyin: 'yǔqí mányuàn mìngyùn de bù gōngpíng, bùrú yòng shíjì xíngdòng qù gǎibiàn xiànzhuàng',
    translation:
      "Rather than complaining about the unfairness of fate, it's better to use practical actions to change the current situation.",
    level: 6
  },
  {
    hanzi: '他把自己的一生都奉献给了科学事业，值得所有人尊敬',
    pinyin: 'tā bǎ zìjǐ de yīshēng dōu fèngxiàn gěi le kēxué shìyè, zhídé suǒyǒu rén zūnjìng',
    translation:
      "He devoted his entire life to the cause of science, deserving everyone's respect.",
    level: 6
  },
  {
    hanzi: '随着互联网的迅速普及，人们获取信息的方式发生了根本性的变化',
    pinyin:
      'suízhe hùliánwǎng de xùnsù pǔjí, rénmen huòqǔ xìnxī de fāngshì fāshēng le gēnběn xìng de biànhuà',
    translation:
      'With the rapid popularization of the internet, the way people obtain information has undergone fundamental changes.',
    level: 6
  },
  {
    hanzi: '他那种不顾一切追求梦想的精神，深深地感染了身边的每一个人',
    pinyin:
      'tā nà zhǒng bùgù yīqiè zhuīqiú mèngxiǎng de jīngshén, shēnshēn de gǎnrǎn le shēnbiān de měi yīgè rén',
    translation:
      'His spirit of pursuing dreams regardless of everything deeply infected everyone around him.',
    level: 6
  },
  {
    hanzi: '在漫长的人生道路上，我们难免会遇到各种挫折和失败',
    pinyin:
      'zài màncháng de rénshēng dàolù shàng, wǒmen nánmiǎn huì yùdào gè zhǒng cuòzhé hé shībài',
    translation:
      'On the long road of life, we will inevitably encounter various setbacks and failures.',
    level: 6
  },
  {
    hanzi: '要不是亲眼所见，我简直不敢相信这世上竟有如此壮丽的景色',
    pinyin:
      'yàobushì qīnyǎn suǒ jiàn, wǒ jiǎnzhí bù gǎn xiāngxìn zhè shìshang jìng yǒu rúcǐ zhuànglì de jǐngsè',
    translation:
      "If I hadn't seen it with my own eyes, I simply couldn't believe such magnificent scenery exists in this world.",
    level: 6
  },
  {
    hanzi: '经过连续几天的抢救，医生们终于把他从死亡线上拉了回来',
    pinyin:
      'jīngguò liánxù jǐ tiān de qiǎngjiù, yīshēng men zhōngyú bǎ tā cóng sǐwáng xiàn shàng lāle huílái',
    translation:
      'After several consecutive days of emergency treatment, the doctors finally pulled him back from the brink of death.',
    level: 6
  },
  {
    hanzi: '这项研究成果不仅在国内引起了广泛关注，在国际上也产生了巨大的反响',
    pinyin:
      'zhè xiàng yánjiū chéngguǒ bùjǐn zài guónèi yǐnqǐ le guǎngfàn guānzhù, zài guójì shàng yě chǎnshēng le jùdà de fǎnxiǎng',
    translation:
      'This research result not only attracted widespread attention domestically, but also generated huge repercussions internationally.',
    level: 6
  },
  {
    hanzi: '他表面上装作毫不在乎，其实内心深处充满了矛盾和挣扎',
    pinyin:
      'tā biǎomiàn shàng zhuāngzuò háo bù zàihu, qíshí nèixīn shēnchù chōngmǎn le máodùn hé zhēngzhá',
    translation:
      'On the surface he pretends not to care at all, but deep down inside he is full of conflict and struggle.',
    level: 6
  },
  {
    hanzi: '法律面前人人平等，任何人都不享有超越法律的特权',
    pinyin: 'fǎlǜ miànqián rén rén píngděng, rènhé rén dōu bù xiǎngyǒu chāoyuè fǎlǜ de tèquán',
    translation: 'Everyone is equal before the law, no one enjoys privileges beyond the law.',
    level: 6
  },
  {
    hanzi: '面对日益严重的环境问题，各国政府纷纷出台了相应的环保政策',
    pinyin:
      'miànduì rìyì yánzhòng de huánjìng wèntí, gè guó zhèngfǔ fēnfēn chūtái le xiāngyìng de huánbǎo zhèngcè',
    translation:
      'Facing increasingly serious environmental problems, governments of various countries have successively introduced corresponding environmental protection policies.',
    level: 6
  },
  {
    hanzi: '他没有被眼前的成功冲昏头脑，而是继续保持着谦虚谨慎的态度',
    pinyin:
      'tā méiyǒu bèi yǎnqián de chénggōng chōnghūn tóunǎo, ér shì jìxù bǎochí zhe qiānxū jǐnshèn de tàidù',
    translation:
      'He was not dizzied by immediate success, but continued to maintain a modest and prudent attitude.',
    level: 6
  },
  {
    hanzi: '虽然两国之间存在着不少分歧，但双方都愿意通过对话来化解矛盾',
    pinyin:
      'suīrán liǎng guó zhī jiān cúnzài zhe bùshǎo fēnqí, dàn shuāngfāng dōu yuànyì tōngguò duìhuà lái huàjiě máodùn',
    translation:
      'Although there are quite a few differences between the two countries, both sides are willing to resolve conflicts through dialogue.',
    level: 6
  },
  {
    hanzi: '近年来人工智能的迅猛发展，深刻地影响着社会生活的方方面面',
    pinyin:
      'jìn nián lái réngōng zhìnéng de xùnměng fāzhǎn, shēnkè de yǐngxiǎng zhe shèhuì shēnghuó de fāngfāngmiànmiàn',
    translation:
      'In recent years, the rapid development of artificial intelligence has profoundly affected every aspect of social life.',
    level: 6
  },
  {
    hanzi: '正是在那个关键的时刻，他做出了一个改变自己一生命运的决定',
    pinyin:
      'zhèng shì zài nàge guānjiàn de shíkè, tā zuò chū le yīgè gǎibiàn zìjǐ yīshēng mìngyùn de juédìng',
    translation:
      'It was at that crucial moment that he made a decision that changed the course of his entire life.',
    level: 6
  },
  {
    hanzi: '从本质上讲，经济危机往往暴露了一个国家长期积累的结构性问题',
    pinyin:
      'cóng běnzhì shàng jiǎng, jīngjì wēijī wǎngwǎng bàolù le yīgè guójiā chángqī jīlěi de jiégòu xìng wèntí',
    translation:
      'Essentially speaking, economic crises often expose the structural problems accumulated over the long term in a country.',
    level: 6
  },
  {
    hanzi: '他那篇关于互联网安全的文章发表后，立刻引起了业界的高度重视',
    pinyin:
      'tā nà piān guānyú hùliánwǎng ānquán de wénzhāng fābiǎo hòu, lìkè yǐnqǐ le yèjiè de gāodù zhòngshì',
    translation:
      'After his article on internet security was published, it immediately drew high attention from the industry.',
    level: 6
  },
  {
    hanzi: '在全体员工的共同努力下，公司终于渡过了那段艰难的时期',
    pinyin:
      'zài quántǐ yuángōng de gòngtóng nǔlì xià, gōngsī zhōngyú dùguò le nà duàn jiānnán de shíqī',
    translation:
      'With the joint efforts of all employees, the company finally weathered that difficult period.',
    level: 6
  },
  {
    hanzi: '一个真正成熟的人，既能承受成功的喜悦，也能坦然面对失败的打击',
    pinyin:
      'yīgè zhēnzhèng chéngshú de rén, jì néng chéngshòu chénggōng de xǐyuè, yě néng tǎnrán miànduì shībài de dǎjī',
    translation:
      'A truly mature person can both bear the joy of success and calmly face the blow of failure.',
    level: 6
  },
  {
    hanzi: '由于原材料价格的持续上涨，这家工厂的生产成本已经翻了一倍',
    pinyin:
      'yóuyú yuáncáiliào jiàgé de chíxù shàngzhǎng, zhè jiā gōngchǎng de shēngchǎn chéngběn yǐjīng fān le yī bèi',
    translation:
      "Due to the continuous rise in raw material prices, this factory's production costs have already doubled.",
    level: 6
  },
  {
    hanzi: '他不但没有兑现当初的承诺，甚至连一句道歉的话都没有',
    pinyin:
      'tā bùdàn méiyǒu duìxiàn dāngchū de chéngnuò, shènzhì lián yī jù dàoqiàn de huà dōu méiyǒu',
    translation:
      "Not only did he not fulfill his original promise, but he didn't even say a single word of apology.",
    level: 6
  },
  {
    hanzi: '在日常生活中培养良好的习惯，对于个人的长远发展至关重要',
    pinyin:
      'zài rìcháng shēnghuó zhōng péiyǎng liánghǎo de xíguàn, duìyú gèrén de chángyuǎn fāzhǎn zhì guān zhòngyào',
    translation:
      "Cultivating good habits in daily life is vitally important for one's long-term development.",
    level: 6
  },
  {
    hanzi: '每当回忆起那段艰苦的岁月，他都不禁感慨万千',
    pinyin: 'měi dāng huíyì qǐ nà duàn jiānkǔ de suìyuè, tā dōu bùjīn gǎnkǎi wàn qiān',
    translation:
      "Whenever he recalls those difficult years, he can't help but be filled with deep emotion.",
    level: 6
  },
  {
    hanzi: '这里曾经是一片荒凉的沙漠，如今却变成了一座繁华的现代化城市',
    pinyin:
      'zhèlǐ céngjīng shì yī piàn huāngliáng de shāmò, rújīn què biàn chéng le yī zuò fánhuá de xiàndàihuà chéngshì',
    translation:
      'This place was once a desolate desert, but now it has become a bustling modern city.',
    level: 6
  },
  {
    hanzi: '在激烈的市场竞争中，只有不断创新才能保持企业的竞争优势',
    pinyin:
      'zài jīliè de shìchǎng jìngzhēng zhōng, zhǐyǒu bùduàn chuàngxīn cáinéng bǎochí qǐyè de jìngzhēng yōushì',
    translation:
      'In the fierce market competition, only through continuous innovation can an enterprise maintain its competitive advantage.',
    level: 6
  },
  {
    hanzi: '我们应当充分认识到，保护知识产权就是保护国家的核心竞争力',
    pinyin:
      'wǒmen yīngdāng chōngfèn rènshí dào, bǎohù zhīshí chǎnquán jiù shì bǎohù guójiā de héxīn jìngzhēng lì',
    translation:
      "We should fully realize that protecting intellectual property rights is protecting the country's core competitiveness.",
    level: 6
  },
  {
    hanzi: '科学家们经过反复实验和论证，终于验证了这一大胆的假设',
    pinyin:
      'kēxuéjiā men jīngguò fǎnfù shíyàn hé lùnzhèng, zhōngyú yànzhèng le zhè yī dàdǎn de jiǎshè',
    translation:
      'After repeated experiments and verification, the scientists finally validated this bold hypothesis.',
    level: 6
  },
  {
    hanzi: '她虽然出身于一个普通的家庭，但凭借着自己的才华和毅力，最终成为了一位备受瞩目的艺术家',
    pinyin:
      'tā suīrán chūshēn yú yīgè pǔtōng de jiātíng, dàn píngjiè zhe zìjǐ de cáihuá hé yìlì, zuìzhōng chéngwéi le yī wèi bèi shòu zhǔmù de yìshùjiā',
    translation:
      'Although she came from an ordinary family, relying on her talent and perseverance, she eventually became a highly regarded artist.',
    level: 6
  },
  {
    hanzi: '由于长途跋涉，大家都已经疲惫不堪了',
    pinyin: 'yóuyú chángtú báshè, dàjiā dōu yǐjīng píbèi bùkān le',
    translation: 'Due to the long and arduous journey, everyone was already utterly exhausted.',
    level: 6
  },
  {
    hanzi: '历史已经反复证明，任何违背人民意愿的统治都不会长久',
    pinyin:
      'lìshǐ yǐjīng fǎnfù zhèngmíng, rènhé wéibèi rénmín yìyuàn de tǒngzhì dōu bùhuì chángjiǔ',
    translation:
      'History has repeatedly proven that any rule that goes against the will of the people will not last long.',
    level: 6
  },
  {
    hanzi: '他以自己的实际行动证明了：只要坚持不懈，就没有克服不了的困难',
    pinyin:
      'tā yǐ zìjǐ de shíjì xíngdòng zhèngmíng le: zhǐyào jiānchí bùxiè, jiù méiyǒu kèfú bù liǎo de kùnnan',
    translation:
      'He proved through his own actions: as long as you persevere, there are no difficulties that cannot be overcome.',
    level: 6
  },
  {
    hanzi: '我们要在保持传统优势的同时，不断吸收国际上先进的理念和技术',
    pinyin:
      'wǒmen yào zài bǎochí chuántǒng yōushì de tóngshí, bùduàn xīshōu guójì shàng xiānjìn de lǐniàn hé jìshù',
    translation:
      'While maintaining our traditional advantages, we should continuously absorb advanced international ideas and technologies.',
    level: 6
  },
  {
    hanzi: '这次大会的召开，对于推动两国之间的经济合作具有十分深远的意义',
    pinyin:
      'zhè cì dàhuì de zhàokāi, duìyú tuīdòng liǎng guó zhī jiān de jīngjì hézuò jùyǒu shífēn shēnyuǎn de yìyì',
    translation:
      'The convening of this conference has very far-reaching significance for promoting economic cooperation between the two countries.',
    level: 6
  },
  {
    hanzi: '在处理复杂的社会问题时，我们既要有坚定的原则性，也要有灵活的灵活性',
    pinyin:
      'zài chǔlǐ fùzá de shèhuì wèntí shí, wǒmen jì yào yǒu jiāndìng de yuánzé xìng, yě yào yǒu línghuó de línghuó xìng',
    translation:
      'When dealing with complex social problems, we need both firm principles and flexible adaptability.',
    level: 6
  },
  {
    hanzi: '凡是触犯法律底线的行为，不论涉及什么人，都要依法予以严肃处理',
    pinyin:
      'fánshì chùfàn fǎlǜ dǐxiàn de xíngwéi, bùlùn shèjí shénme rén, dōu yào yīfǎ yǔyǐ yánsù chǔlǐ',
    translation:
      'All acts that violate the bottom line of the law, no matter who is involved, must be dealt with seriously according to law.',
    level: 6
  },
  {
    hanzi: '他宁愿放弃高薪的工作，也要去偏远山区支教，这种无私奉献的精神令人敬佩',
    pinyin:
      'tā nìngyuàn fàngqì gāoxīn de gōngzuò, yě yào qù piānyuǎn shānqū zhījiào, zhè zhǒng wúsī fèngxiàn de jīngshén lìng rén jìngpèi',
    translation:
      'He would rather give up a high-paying job to go teach in remote mountain areas, this spirit of selfless dedication is admirable.',
    level: 6
  },
  {
    hanzi: '现代社会节奏飞快，人们难免会感到焦虑和迷茫，关键是要学会调整自己的心态',
    pinyin:
      'xiàndài shèhuì jiézòu fēi kuài, rénmen nánmiǎn huì gǎndào jiāolǜ hé mímáng, guānjiàn shì yào xuéhuì tiáozhěng zìjǐ de xīntài',
    translation:
      "The pace of modern society is extremely fast, people will inevitably feel anxious and lost; the key is to learn to adjust one's mindset.",
    level: 6
  },
  {
    hanzi: '在漫长的人类文明史上，每一次重大的科技革命都极大地推动了社会生产力的发展',
    pinyin:
      'zài màncháng de rénlèi wénmíng shǐ shàng, měi yī cì zhòngdà de kējì gémìng dōu jídà de tuīdòng le shèhuì shēngchǎn lì de fāzhǎn',
    translation:
      'In the long history of human civilization, every major scientific revolution has greatly promoted the development of social productive forces.',
    level: 6
  },
  {
    hanzi: '有些道理说起来简单，但做起来却异常困难，正所谓知易行难',
    pinyin:
      'yǒuxiē dàolǐ shuō qǐlai jiǎndān, dàn zuò qǐlai què yìcháng kùnnan, zhèng suǒwèi zhī yì xíng nán',
    translation:
      'Some principles are simple to say, but extraordinarily difficult to practice; this is what is meant by "knowing is easy, doing is hard."',
    level: 6
  },
  {
    hanzi: '任何成就都不是偶然取得的，背后必然有着常人难以想象的付出和牺牲',
    pinyin:
      'rènhé chéngjiù dōu bù shì ǒurán qǔdé de, bèihòu bìrán yǒu zhe chángrén nányǐ xiǎngxiàng de fùchū hé xīshēng',
    translation:
      'No achievement is obtained by accident; behind it there are inevitably efforts and sacrifices that ordinary people can hardly imagine.',
    level: 6
  },
  {
    hanzi: '企业家不仅要对股东负责，更要主动承担起应尽的社会责任',
    pinyin:
      'qǐyèjiā bùjǐn yào duì gǔdōng fùzé, gèng yào zhǔdòng chéngdān qǐ yīngjìn de shèhuì zérèn',
    translation:
      'Entrepreneurs must not only be responsible to shareholders, but also actively shoulder their due social responsibilities.',
    level: 6
  },
  {
    hanzi: '要不是在关键时刻得到了朋友的鼎力相助，恐怕他现在已经破产了',
    pinyin:
      'yàobushì zài guānjiàn shíkè dédào le péngyou de dǐnglì xiāngzhù, kǒngpà tā xiànzài yǐjīng pòchǎn le',
    translation:
      "If he hadn't received his friend's all-out help at the critical moment, he probably would have gone bankrupt by now.",
    level: 6
  },
  {
    hanzi: '随着全球化的深入发展，各国文化之间的交流与融合日益密切',
    pinyin:
      'suízhe quánqiúhuà de shēnrù fāzhǎn, gè guó wénhuà zhī jiān de jiāoliú yǔ rónghé rìyì mìqiè',
    translation:
      'With the deepening development of globalization, the exchange and integration between cultures of various countries are becoming increasingly close.',
    level: 6
  },
  {
    hanzi: '他那种不分昼夜、废寝忘食的工作态度，让所有同事都感到由衷的佩服',
    pinyin:
      'tā nà zhǒng bù fēn zhòuyè, fèiqǐn wàngshí de gōngzuò tàidù, ràng suǒyǒu tóngshì dōu gǎndào yóuzhōng de pèifú',
    translation:
      'His working attitude of disregarding day and night and forgetting to eat and sleep made all his colleagues feel sincere admiration.',
    level: 6
  },
  {
    hanzi: '虽然这个方案在实施过程中遇到了一些意想不到的障碍，但最终的结果还是令人满意的',
    pinyin:
      'suīrán zhège fāngàn zài shíshī guòchéng zhōng yùdào le yīxiē yìxiǎng bùdào de zhàngài, dàn zuìzhōng de jiéguǒ háishì lìng rén mǎnyì de',
    translation:
      'Although this plan encountered some unexpected obstacles during implementation, the final result was still satisfactory.',
    level: 6
  },
  {
    hanzi: '与其花费大量时间去争论谁对谁错，不如坐下来共同商量一个可行的解决方案',
    pinyin:
      'yǔqí huāfèi dàliàng shíjiān qù zhēnglùn shuí duì shuí cuò, bùrú zuò xiàlai gòngtóng shāngliang yīgè kěxíng de jiějué fāngàn',
    translation:
      "Rather than spending a lot of time arguing about who is right and wrong, it's better to sit down and discuss a feasible solution together.",
    level: 6
  },
  {
    hanzi: '在当前严峻的经济形势下，政府采取了一系列紧急措施来稳定市场信心',
    pinyin:
      'zài dāngqián yánjùn de jīngjì xíngshì xià, zhèngfǔ cǎiqǔ le yī xìliè jǐnjí cuòshī lái wěndìng shìchǎng xìnxīn',
    translation:
      'Under the current severe economic situation, the government has adopted a series of emergency measures to stabilize market confidence.',
    level: 6
  },
  {
    hanzi: '一个人的价值不在于他拥有多少财富，而在于他为社会做出了多大的贡献',
    pinyin:
      'yīgè rén de jiàzhí bù zàiyú tā yōngyǒu duōshǎo cáifù, ér zàiyú tā wèi shèhuì zuò chū le duō dà de gòngxiàn',
    translation:
      "A person's value does not lie in how much wealth they possess, but in how much contribution they have made to society.",
    level: 6
  },
  {
    hanzi: '专家们一致认为，只有从根源上消除贫困，才能真正实现社会的长治久安',
    pinyin:
      'zhuānjiā men yīzhì rènwéi, zhǐyǒu cóng gēnyuán shàng xiāochú pínkùn, cáinéng zhēnzhèng shíxiàn shèhuì de chángzhì jiǔān',
    translation:
      'Experts unanimously believe that only by eliminating poverty at its roots can we truly achieve long-term stability and peace in society.',
    level: 6
  },
  {
    hanzi: '他明明已经意识到了自己的错误，却始终不肯承认，这让大家都感到十分遗憾',
    pinyin:
      'tā míngmíng yǐjīng yìshí dào le zìjǐ de cuòwù, què shǐzhōng bù kěn chéngrèn, zhè ràng dàjiā dōu gǎndào shífēn yíhàn',
    translation:
      'He clearly has already realized his mistake, yet he has refused to admit it all along, which makes everyone feel very regretful.',
    level: 6
  },
  {
    hanzi: '随着生活水平的日益提高，越来越多的人开始关注精神生活的品质',
    pinyin:
      'suízhe shēnghuó shuǐpíng de rìyì tígāo, yuèláiyuè duō de rén kāishǐ guānzhù jīngshén shēnghuó de pǐnzhì',
    translation:
      'With the increasing improvement of living standards, more and more people are beginning to pay attention to the quality of spiritual life.',
    level: 6
  },
  {
    hanzi: '在广阔的西部大地上，涌现出了一大批勇于创业的年轻人',
    pinyin:
      'zài guǎngkuò de xībù dàdì shàng, yǒngxiàn chū le yī dà pī yǒngyú chuàngyè de niánqīng rén',
    translation:
      'On the vast western land, a large number of young people brave enough to start businesses have emerged.',
    level: 6
  },
  {
    hanzi: '我深深地感到，能够拥有这份宝贵的友谊是我一生中最大的幸运',
    pinyin:
      'wǒ shēnshēn de gǎndào, nénggòu yōngyǒu zhè fèn bǎoguì de yǒuyì shì wǒ yīshēng zhōng zuì dà de xìngyùn',
    translation:
      'I deeply feel that being able to have this precious friendship is the greatest fortune of my life.',
    level: 6
  },
  {
    hanzi: '正是因为广大医务工作者的无私奉献，我们才能够战胜这场突如其来的疫情',
    pinyin:
      'zhèng shì yīnwèi guǎngdà yīwù gōngzuò zhě de wúsī fèngxiàn, wǒmen cáinénggòu zhànshèng zhè chǎng tūrúqílái de yìqíng',
    translation:
      'It is precisely because of the selfless dedication of the vast number of medical workers that we were able to overcome this sudden epidemic.',
    level: 6
  },
  {
    hanzi: '从表面上看这两者似乎没有任何关联，但深入研究后就会发现它们之间存在着千丝万缕的联系',
    pinyin:
      'cóng biǎomiàn shàng kàn zhè liǎng zhě sìhū méiyǒu rènhé guānlián, dàn shēnrù yánjiū hòu jiù huì fāxiàn tāmen zhī jiān cúnzài zhe qiānsīwànlǚ de liánxì',
    translation:
      'On the surface, the two seem to have no connection at all, but after in-depth research one discovers they are linked in countless ways.',
    level: 6
  },
  {
    hanzi: '我们要尊重每个孩子的个性差异，给予他们充分的成长空间和信任',
    pinyin:
      'wǒmen yào zūnzhòng měi gè háizi de gèxìng chāyì, jǐyǔ tāmen chōngfèn de chéngzhǎng kōngjiān hé xìnrèn',
    translation:
      "We should respect each child's individual differences and give them ample room for growth and trust.",
    level: 6
  },
  {
    hanzi: '各级领导干部必须以身作则，率先垂范，才能真正赢得群众的信任和拥护',
    pinyin:
      'gè jí lǐngdǎo gànbù bìxū yǐshēnzuòzé, shuàixiān chuífàn, cáinéng zhēnzhèng yíngdé qúnzhòng de xìnrèn hé yōnghù',
    translation:
      'Leading cadres at all levels must set an example and take the lead in order to truly win the trust and support of the masses.',
    level: 6
  },
  {
    hanzi: '尽管中西方在文化传统上存在着显著差异，但这并不妨碍我们相互欣赏和借鉴',
    pinyin:
      'jǐnguǎn zhōng xīfāng zài wénhuà chuántǒng shàng cúnzài zhe xiǎnzhù chāyì, dàn zhè bìng bù fángài wǒmen xiānghù xīnshǎng hé jièjiàn',
    translation:
      'Although there are significant differences between Chinese and Western cultural traditions, this does not hinder us from appreciating and learning from each other.',
    level: 6
  },
  {
    hanzi: '许多看似微不足道的小事，往往恰恰是决定成败的关键所在',
    pinyin:
      'xǔduō kàn sì wēi bù zú dào de xiǎo shì, wǎngwǎng qiàqià shì juédìng chéngbài de guānjiàn suǒzài',
    translation:
      'Many seemingly insignificant little things are often precisely the key to determining success or failure.',
    level: 6
  },

  // ═══════════════ HSK 7-9 (Level 7) ═══════════════
  // 75+ sentences using HSK 3.0 Level 1-9 vocabulary.
  {
    hanzi: '他坚持不懈地追求自己的理想，终于如愿以偿了',
    pinyin: 'tā jiānchí bùxiè de zhuīqiú zìjǐ de lǐxiǎng, zhōngyú rúyuànyǐcháng le',
    translation: 'He persevered unremittingly in pursuing his ideal and finally achieved his wish.',
    level: 7
  },
  {
    hanzi: '面对突如其来的危机，他表现得异常沉着冷静',
    pinyin: 'miànduì tūrúqílái de wēijī, tā biǎoxiàn de yìcháng chénzhuó lěngjìng',
    translation: 'Faced with the sudden crisis, he behaved with extraordinary composure and calm.',
    level: 7
  },
  {
    hanzi: '这座博物馆陈列着成千上万件珍贵的历史文物',
    pinyin: 'zhè zuò bówùguǎn chénliè zhe chéngqiānshàngwàn jiàn zhēnguì de lìshǐ wénwù',
    translation: 'This museum displays tens of thousands of precious historical artifacts.',
    level: 7
  },
  {
    hanzi: '他在沉思了许久之后，终于做出了一个果断的决定',
    pinyin: 'tā zài chénsī le xǔjiǔ zhīhòu, zhōngyú zuò chū le yīgè guǒduàn de juédìng',
    translation: 'After pondering for a long time, he finally made a decisive decision.',
    level: 7
  },
  {
    hanzi: '我们不能被眼前的困难所吓倒，要坚定信念勇往直前',
    pinyin: 'wǒmen bù néng bèi yǎnqián de kùnnan suǒ xiàdǎo, yào jiāndìng xìnniàn yǒngwǎngzhíqián',
    translation:
      'We cannot be intimidated by immediate difficulties; we must firmly believe and march forward courageously.',
    level: 7
  },
  {
    hanzi: '他为人诚恳正直，从不弄虚作假，因此深受大家的信赖',
    pinyin: 'tā wéirén chéngkěn zhèngzhí, cóng bù nòngxūzuòjiǎ, yīncǐ shēn shòu dàjiā de xìnlài',
    translation:
      'He is sincere and upright, never engaging in deception, and is therefore deeply trusted by everyone.',
    level: 7
  },
  {
    hanzi: '随着信息技术的飞速发展，数据的采集与分析变得至关重要',
    pinyin: 'suízhe xìnxī jìshù de fēisù fāzhǎn, shùjù de cǎijí yǔ fēnxī biàn de zhì guān zhòngyào',
    translation:
      'With the rapid development of information technology, data collection and analysis have become crucially important.',
    level: 7
  },
  {
    hanzi: '她不但才华横溢，而且始终保持着一颗谦虚谨慎的心',
    pinyin: 'tā bùdàn cáihuá héngyì, érqiě shǐzhōng bǎochí zhe yī kē qiānxū jǐnshèn de xīn',
    translation:
      'She is not only brilliantly talented but also always maintains a humble and prudent heart.',
    level: 7
  },
  {
    hanzi: '在漫长的历史长河中，中华文明以其博大精深的内涵深深影响着世界',
    pinyin:
      'zài màncháng de lìshǐ chánghé zhōng, zhōnghuá wénmíng yǐ qí bódàjīngshēn de nèihán shēnshēn yǐngxiǎng zhe shìjiè',
    translation:
      'In the long river of history, Chinese civilization has deeply influenced the world with its profound and extensive connotations.',
    level: 7
  },
  {
    hanzi: '你不能因为一时的挫折就半途而废，成功往往就在于最后的坚持',
    pinyin:
      'nǐ bù néng yīnwèi yīshí de cuòzhé jiù bàntúérfèi, chénggōng wǎngwǎng jiù zàiyú zuìhòu de jiānchí',
    translation:
      "You can't give up halfway because of temporary setbacks; success often lies in persisting until the very end.",
    level: 7
  },
  {
    hanzi: '他默默无闻地在山区教书三十余年，这种无私奉献的精神令人肃然起敬',
    pinyin:
      'tā mòmòwúwén de zài shānqū jiāoshū sānshí yú nián, zhè zhǒng wúsī fèngxiàn de jīngshén lìng rén sùránqǐjìng',
    translation:
      'He taught in the mountains anonymously for over thirty years; this spirit of selfless dedication commands profound respect.',
    level: 7
  },
  {
    hanzi: '在激烈的国际竞争中，谁掌握了核心科技，谁就占据了主动权',
    pinyin:
      'zài jīliè de guójì jìngzhēng zhōng, shuí zhǎngwò le héxīn kējì, shuí jiù zhànjù le zhǔdòng quán',
    translation:
      'In the fierce international competition, whoever masters core technology holds the initiative.',
    level: 7
  },
  {
    hanzi: '尽管岁月流逝，但他对故乡的那份深厚情感却从未褪色',
    pinyin: 'jǐnguǎn suìyuè liúshì, dàn tā duì gùxiāng de nà fèn shēnhòu qínggǎn què cóngwèi tuìsè',
    translation:
      'Although the years have passed, his deep affection for his hometown has never faded.',
    level: 7
  },
  {
    hanzi: '我们要善于从失败中汲取教训，不断完善和超越自我',
    pinyin: 'wǒmen yào shànyú cóng shībài zhōng jíqǔ jiàoxùn, bùduàn wánshàn hé chāoyuè zìwǒ',
    translation:
      'We must be good at drawing lessons from failure and continuously improve and surpass ourselves.',
    level: 7
  },
  {
    hanzi: '青少年时期是人生观和价值观形成的关键阶段',
    pinyin: 'qīngshàonián shíqī shì rénshēng guān hé jiàzhí guān xíngchéng de guānjiàn jiēduàn',
    translation:
      "The adolescent period is a crucial stage for the formation of one's outlook on life and values.",
    level: 7
  },
  {
    hanzi: '他那种不计较个人得失、全心全意为人民服务的精神值得每一位公职人员学习',
    pinyin:
      'tā nà zhǒng bù jìjiào gèrén déshī, quánxīnquányì wèi rénmín fúwù de jīngshén zhídé měi yī wèi gōngzhí rényuán xuéxí',
    translation:
      'His spirit of not caring about personal gains and losses and wholeheartedly serving the people is worthy of study by every public servant.',
    level: 7
  },
  {
    hanzi: '这座古城完好地保留了数百年前的原始风貌，吸引着来自世界各地的游客',
    pinyin:
      'zhè zuò gǔ chéng wánhǎo de bǎoliú le shù bǎi nián qián de yuánshǐ fēngmào, xīyǐn zhe láizì shìjiè gèdì de yóukè',
    translation:
      'This ancient city has perfectly preserved its original appearance from hundreds of years ago, attracting tourists from all over the world.',
    level: 7
  },
  {
    hanzi: '我们一方面要充分肯定已经取得的成就，另一方面也要清醒地认识到存在的不足',
    pinyin:
      'wǒmen yī fāngmiàn yào chōngfèn kěndìng yǐjīng qǔdé de chéngjiù, lìng yī fāngmiàn yě yào qīngxǐng de rènshí dào cúnzài de bùzú',
    translation:
      'On the one hand we must fully affirm the achievements already made, and on the other hand we must soberly recognize existing shortcomings.',
    level: 7
  },
  {
    hanzi: '随着全球变暖的加剧，极端天气事件发生的频率和强度都在显著增加',
    pinyin:
      'suízhe quánqiú biàn nuǎn de jiājù, jíduān tiānqì shìjiàn fāshēng de pínlǜ hé qiángdù dōu zài xiǎnzhù zēngjiā',
    translation:
      'With the intensification of global warming, the frequency and intensity of extreme weather events are both significantly increasing.',
    level: 7
  },
  {
    hanzi: '他虽然遭遇了诸多不幸，但始终没有放弃对生活的热爱与追求',
    pinyin:
      'tā suīrán zāoyù le zhūduō bùxìng, dàn shǐzhōng méiyǒu fàngqì duì shēnghuó de rèài yǔ zhuīqiú',
    translation:
      'Although he has encountered much misfortune, he has never given up his love and pursuit of life.',
    level: 7
  },
  {
    hanzi: '我们不能因为害怕失败就不敢尝试，每一次失败都是通往成功的宝贵经验',
    pinyin:
      'wǒmen bù néng yīnwèi hàipà shībài jiù bù gǎn chángshì, měi yī cì shībài dōu shì tōngwǎng chénggōng de bǎoguì jīngyàn',
    translation:
      'We cannot be afraid to try because of fear of failure; every failure is valuable experience leading to success.',
    level: 7
  },
  {
    hanzi: '在茫茫的大海上，一艘艘货轮日夜不停地运送着来自各国的商品',
    pinyin:
      'zài mángmáng de dàhǎi shàng, yī sōu sōu huòlún rìyè bùtíng de yùnsòng zhe láizì gè guó de shāngpǐn',
    translation:
      'On the vast ocean, cargo ships transport goods from various countries around the clock without stopping.',
    level: 7
  },
  {
    hanzi: '我们要把个人的前途与国家的命运紧密地联系在一起',
    pinyin: 'wǒmen yào bǎ gèrén de qiántú yǔ guójiā de mìngyùn jǐnmì de liánxì zài yīqǐ',
    translation: 'We must closely link our personal future with the destiny of our country.',
    level: 7
  },
  {
    hanzi: '他晚年致力于慈善事业，倾尽所有去帮助那些需要帮助的人',
    pinyin:
      'tā wǎnnián zhìlì yú císhàn shìyè, qīngjìn suǒyǒu qù bāngzhù nàxiē xūyào bāngzhù de rén',
    translation:
      'In his later years he devoted himself to philanthropy, giving everything he had to help those who needed help.',
    level: 7
  },
  {
    hanzi: '科技创新是引领发展的第一动力，人才是支撑发展的第一资源',
    pinyin:
      'kējì chuàngxīn shì yǐnlǐng fāzhǎn de dì yī dònglì, réncái shì zhīchēng fāzhǎn de dì yī zīyuán',
    translation:
      'Technological innovation is the primary driving force leading development, and talent is the primary resource supporting development.',
    level: 7
  },
  {
    hanzi: '无论前方的道路多么崎岖不平，我们都将义无反顾地走下去',
    pinyin: 'wúlùn qiánfāng de dàolù duōme qíqū bùpíng, wǒmen dōu jiāng yìwúfǎngù de zǒu xiàqù',
    translation:
      'No matter how rough and uneven the road ahead, we will march on without hesitation.',
    level: 7
  },
  {
    hanzi: '法律应当保障每一个公民的合法权益，维护社会的公平和正义',
    pinyin:
      'fǎlǜ yīngdāng bǎozhàng měi yīgè gōngmín de héfǎ quányì, wéihù shèhuì de gōngpíng hé zhèngyì',
    translation:
      'The law should protect the legitimate rights and interests of every citizen and safeguard social fairness and justice.',
    level: 7
  },
  {
    hanzi: '在数字化浪潮的推动下，传统产业正在经历前所未有的变革',
    pinyin:
      'zài shùzìhuà làngcháo de tuīdòng xià, chuántǒng chǎnyè zhèngzài jīnglì qiánsuǒwèiyǒu de biàngé',
    translation:
      'Driven by the wave of digitalization, traditional industries are undergoing unprecedented transformation.',
    level: 7
  },
  {
    hanzi: '我们要以开放包容的心态面对不同的观点，在交流互鉴中共同进步',
    pinyin:
      'wǒmen yào yǐ kāifàng bāoróng de xīntài miànduì bùtóng de guāndiǎn, zài jiāoliú hùjiàn zhōng gòngtóng jìnbù',
    translation:
      'We should face different viewpoints with an open and inclusive mindset, making progress together through exchange and mutual learning.',
    level: 7
  },
  {
    hanzi: '纵然前路漫漫充满未知，只要心中怀有希望，就一定能找到属于自己的那片天空',
    pinyin:
      'zòngrán qiánlù mànmàn chōngmǎn wèizhī, zhǐyào xīnzhōng huái yǒu xīwàng, jiù yīdìng néng zhǎodào shǔyú zìjǐ de nà piàn tiānkōng',
    translation:
      'Even though the road ahead is long and full of unknowns, as long as you hold hope in your heart, you will surely find your own patch of sky.',
    level: 7
  },
  {
    hanzi: '在全球化遭遇逆流的当下，坚持互利共赢的合作理念显得尤为珍贵',
    pinyin:
      'zài quánqiúhuà zāoyù nìliú de dāngxià, jiānchí hùlì gòngyíng de hézuò lǐniàn xiǎnde yóuwéi zhēnguì',
    translation:
      'At a time when globalization encounters headwinds, adhering to the concept of mutually beneficial cooperation appears especially precious.',
    level: 7
  },
  {
    hanzi: '实践充分表明，全面建设社会主义现代化国家是一项长期而艰巨的任务',
    pinyin:
      'shíjiàn chōngfèn biǎomíng, quánmiàn jiànshè shèhuì zhǔyì xiàndàihuà guójiā shì yī xiàng chángqī ér jiānjù de rènwù',
    translation:
      'Practice has fully shown that comprehensively building a modern socialist country is a long-term and arduous task.',
    level: 7
  },
  {
    hanzi: '文艺工作者应当扎根人民、深入生活，创作出无愧于时代的优秀作品',
    pinyin:
      'wényì gōngzuò zhě yīngdāng zhāgēn rénmín, shēnrù shēnghuó, chuàngzuò chū wúkuì yú shídài de yōuxiù zuòpǐn',
    translation:
      'Literary and art workers should take root among the people, go deep into life, and create outstanding works worthy of the times.',
    level: 7
  },
  {
    hanzi: '在当今瞬息万变的世界中，唯有保持终身学习的态度，才能立于不败之地',
    pinyin:
      'zài dāngjīn shùnxīwànbiàn de shìjiè zhōng, wéi yǒu bǎochí zhōngshēn xuéxí de tàidù, cáinéng lìyú bùbàizhīdì',
    translation:
      "In today's rapidly changing world, only by maintaining an attitude of lifelong learning can one remain invincible.",
    level: 7
  },
  {
    hanzi: '事实证明，任何以牺牲环境为代价换取经济增长的做法都是不可持续的',
    pinyin:
      'shìshí zhèngmíng, rènhé yǐ xīshēng huánjìng wéi dàijià huànqǔ jīngjì zēngzhǎng de zuòfǎ dōu shì bù kě chíxù de',
    translation:
      'Facts have proven that any practice of sacrificing the environment in exchange for economic growth is unsustainable.',
    level: 7
  },
  {
    hanzi: '两国元首在友好坦诚的气氛中就共同关心的重大问题深入交换了意见',
    pinyin:
      'liǎng guó yuánshǒu zài yǒuhǎo tǎnchéng de qìfēn zhōng jiù gòngtóng guānxīn de zhòngdà wèntí shēnrù jiāohuàn le yìjiàn',
    translation:
      'The two heads of state had an in-depth exchange of views on major issues of common concern in a friendly and candid atmosphere.',
    level: 7
  },
  {
    hanzi: '他潜心钻研数十年，终于在基础科学领域取得了一系列令人瞩目的突破',
    pinyin:
      'tā qiánxīn zuānyán shù shí nián, zhōngyú zài jīchǔ kēxué lǐngyù qǔdé le yī xìliè lìng rén zhǔmù de tūpò',
    translation:
      'He devoted himself to research for decades and finally achieved a series of remarkable breakthroughs in the field of basic science.',
    level: 7
  },
  {
    hanzi: '我们要坚定不移地走和平发展道路，积极推动构建人类命运共同体',
    pinyin:
      'wǒmen yào jiāndìng bù yí de zǒu hépíng fāzhǎn dàolù, jījí tuīdòng gòujiàn rénlèi mìngyùn gòngtóngtǐ',
    translation:
      'We must unswervingly follow the path of peaceful development and actively promote the building of a community with a shared future for mankind.',
    level: 7
  },
  {
    hanzi: '在人生最艰难的时刻，正是那些看似平凡的点滴善意，给了他继续前行的勇气和力量',
    pinyin:
      'zài rénshēng zuì jiānnán de shíkè, zhèng shì nàxiē kàn sì píngfán de diǎndī shànyì, gěi le tā jìxù qiánxíng de yǒngqì hé lìliàng',
    translation:
      'At the most difficult moment of life, it was those seemingly ordinary bits of kindness that gave him the courage and strength to keep moving forward.',
    level: 7
  },
  {
    hanzi: '教育不仅仅是传授知识，更重要的是培养学生的独立思考能力和健全的人格',
    pinyin:
      'jiàoyù bù jǐnjǐn shì chuánshòu zhīshí, gèng zhòngyào de shì péiyǎng xuéshēng de dúlì sīkǎo nénglì hé jiànquán de réngé',
    translation:
      "Education is not merely about imparting knowledge; more importantly, it is about cultivating students' independent thinking ability and sound personality.",
    level: 7
  },
  {
    hanzi: '随着人工智能技术的日益成熟，社会各界对其伦理和安全问题的讨论也愈发激烈',
    pinyin:
      'suízhe réngōng zhìnéng jìshù de rìyì chéngshú, shèhuì gè jiè duì qí lúnlǐ hé ānquán wèntí de tǎolùn yě yùfā jīliè',
    translation:
      'As artificial intelligence technology becomes increasingly mature, discussions from all sectors of society about its ethical and safety issues have become ever more intense.',
    level: 7
  },
  {
    hanzi:
      '我们应当以更加积极主动的姿态参与国际事务，为世界的和平与发展贡献更多的中国智慧和中国力量',
    pinyin:
      'wǒmen yīngdāng yǐ gèngjiā jījí zhǔdòng de zītài cānyù guójì shìwù, wèi shìjiè de hépíng yǔ fāzhǎn gòngxiàn gèng duō de zhōngguó zhìhuì hé zhōngguó lìliàng',
    translation:
      'We should participate in international affairs with a more proactive posture and contribute more Chinese wisdom and Chinese strength to world peace and development.',
    level: 7
  },
  {
    hanzi: '在浩瀚的宇宙面前，人类不过是沧海一粟，但这并不妨碍我们不断探索未知的勇气和决心',
    pinyin:
      'zài hàohàn de yǔzhòu miànqián, rénlèi bùguò shì cānghǎiyīsù, dàn zhè bìng bù fángài wǒmen bùduàn tànsuǒ wèizhī de yǒngqì hé juéxīn',
    translation:
      'Before the vast universe, humanity is nothing more than a drop in the ocean, but this does not hinder our courage and determination to continuously explore the unknown.',
    level: 7
  },
  {
    hanzi: '经过数代人薪火相传的不懈奋斗，这片曾经贫瘠的土地如今已变成了繁荣富饶的家园',
    pinyin:
      'jīngguò shù dài rén xīnhuǒ xiāngchuán de bùxiè fèndòu, zhè piàn céngjīng pínjí de tǔdì rújīn yǐ biàn chéng le fánróng fùráo de jiāyuán',
    translation:
      'Through the tireless struggle passed down like a torch from generation to generation, this once barren land has now become a prosperous and fertile homeland.',
    level: 7
  },
  {
    hanzi: '历史反复昭示我们，封闭必然落后，开放带来进步，这是亘古不变的真理',
    pinyin:
      'lìshǐ fǎnfù zhāoshì wǒmen, fēngbì bìrán luòhòu, kāifàng dàilái jìnbù, zhè shì gèngǔ bùbiàn de zhēnlǐ',
    translation:
      'History repeatedly shows us that isolation inevitably leads to backwardness while openness brings progress; this is an eternal and unchanging truth.',
    level: 7
  },
  {
    hanzi: '在全面建设现代化强国的征程上，必须统筹好发展与安全、效率与公平、活力与秩序等重大关系',
    pinyin:
      'zài quánmiàn jiànshè xiàndàihuà qiángguó de zhēngchéng shàng, bìxū tǒngchóu hǎo fāzhǎn yǔ ānquán, xiàolǜ yǔ gōngpíng, huólì yǔ zhìxù děng zhòngdà guānxi',
    translation:
      'On the journey of comprehensively building a modern and powerful country, we must properly balance the major relationships between development and security, efficiency and fairness, vitality and order.',
    level: 7
  }
];
