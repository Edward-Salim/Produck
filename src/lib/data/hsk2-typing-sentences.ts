export interface Hsk2SectionSentence {
  hanzi: string;
  translation: string;
}

export const HSK2_SENTENCES_PER_SECTION = 3;

export const HSK2_SECTION_SENTENCES: Record<string, Hsk2SectionSentence[]> = {
  '语气助词“吧”（2） · Modal Particle “吧” (2)': [
    {
      hanzi: '你是老师吧？',
      translation: 'You are a teacher, right?'
    },
    {
      hanzi: '他是中国人吧？',
      translation: 'He is Chinese, right?'
    },
    {
      hanzi: '这个电影很好看吧？',
      translation: 'This movie is good, right?'
    }
  ],
  '“是……的”句 · “是……的” Sentence': [
    {
      hanzi: '我是昨天来的。',
      translation: 'I came yesterday.'
    },
    {
      hanzi: '这个菜是在饭店吃的。',
      translation: 'This dish was eaten at the restaurant.'
    },
    {
      hanzi: '他们不是坐飞机去的。',
      translation: "They didn't go by plane."
    }
  ],
  '兼语句 · Pivotal Sentences': [
    {
      hanzi: '老师请我们去办公室。',
      translation: 'The teacher invited us to the office.'
    },
    {
      hanzi: '爸爸让我买水果。',
      translation: 'Dad asked me to buy fruit.'
    },
    {
      hanzi: '妈妈叫他回家吃饭。',
      translation: 'Mom told him to go home and eat.'
    }
  ],
  '固定格式“还是……吧” · Fixed Pattern “还是……吧”': [
    {
      hanzi: '我们还是明天去吧。',
      translation: "Let's go tomorrow instead."
    },
    {
      hanzi: '这件衣服太贵了，还是买那件吧。',
      translation: "This piece of clothing is too expensive, let's buy that one instead."
    },
    {
      hanzi: '你还是多休息一下吧。',
      translation: "You'd better rest a bit more."
    }
  ],
  '用“多”表达概数 · Expressing Approximate Numbers with “多”': [
    {
      hanzi: '这个商店有三十多本书。',
      translation: 'This store has over thirty books.'
    },
    {
      hanzi: '教室里有二十多个学生。',
      translation: 'There are more than twenty students in the classroom.'
    },
    {
      hanzi: '他买了五块多钱的水果。',
      translation: 'He bought more than five yuan worth of fruit.'
    }
  ],
  '动词或动词性短语、主谓短语作定语 · Verbs, Verbal Phrases, and Subject-Predicate Phrases as Attributives':
    [
      {
        hanzi: '我喜欢吃妈妈做的菜。',
        translation: 'I like the dishes Mom cooks.'
      },
      {
        hanzi: '他买的书很好看。',
        translation: 'The book he bought is very good-looking.'
      },
      {
        hanzi: '昨天来的学生是我的朋友。',
        translation: 'The student who came yesterday is my friend.'
      }
    ],
  '结果补语 · Complement of Result': [
    {
      hanzi: '我看懂了这本书。',
      translation: 'I understood this book after reading it.'
    },
    {
      hanzi: '他没找到他的手机。',
      translation: "He didn't find his phone."
    },
    {
      hanzi: '你听清楚了吗？',
      translation: 'Did you hear clearly?'
    }
  ],
  '动词重叠（1） · Verb Reduplication (1)': [
    {
      hanzi: '你看看这个菜。',
      translation: 'Take a look at this dish.'
    },
    {
      hanzi: '我们想想吧。',
      translation: "Let's think about it."
    },
    {
      hanzi: '我想看看那本书。',
      translation: 'I want to take a look at that book.'
    }
  ],
  '动词重叠（2） · Verb Reduplication (2)': [
    {
      hanzi: '他问了问老师。',
      translation: 'He asked the teacher a bit.'
    },
    {
      hanzi: '我昨天去玩儿了一下。',
      translation: 'I went to play for a bit yesterday.'
    },
    {
      hanzi: '妈妈帮了帮忙。',
      translation: 'Mom helped a bit.'
    }
  ],
  '动态助词“过” · Aspect Particle “过”': [
    {
      hanzi: '我没去过北京。',
      translation: "I haven't been to Beijing."
    },
    {
      hanzi: '你看过这个电影吗？',
      translation: 'Have you seen this movie?'
    },
    {
      hanzi: '他学过汉语。',
      translation: 'He has studied Chinese.'
    }
  ],
  '因果复句“因为……，所以……” · Causal Complex Sentence “因为……，所以……”': [
    {
      hanzi: '因为下雨了，所以我们没出去玩儿。',
      translation: "Because it rained, we didn't go out to play."
    },
    {
      hanzi: '他很喜欢中国菜，所以他想学做菜。',
      translation: 'He likes Chinese food very much, so he wants to learn to cook.'
    },
    {
      hanzi: '因为我生病了，所以今天没去学校。',
      translation: "Because I was sick, I didn't go to school today."
    }
  ],
  '“的”字短语 · “的” Phrase': [
    {
      hanzi: '我喜欢红色的。',
      translation: 'I like the red one.'
    },
    {
      hanzi: '这是我买的。',
      translation: 'This is what I bought.'
    },
    {
      hanzi: '那个穿白色衣服的是我的老师。',
      translation: 'The one wearing white clothes is my teacher.'
    }
  ],
  '简单趋向补语（1） · Simple Complement of Direction (1)': [
    {
      hanzi: '你快进来吧。',
      translation: 'Come in quickly.'
    },
    {
      hanzi: '他走过去了。',
      translation: 'He walked over there.'
    },
    {
      hanzi: '老师请他站起来。',
      translation: 'The teacher asked him to stand up.'
    }
  ],
  '简单趋向补语（2） · Simple Complement of Direction (2)': [
    {
      hanzi: '他拿来了一本书。',
      translation: 'He brought a book.'
    },
    {
      hanzi: '老师走进教室去了。',
      translation: 'The teacher walked into the classroom.'
    },
    {
      hanzi: '妈妈送来了一些水果。',
      translation: 'Mom brought some fruit.'
    }
  ],
  '固定格式“都……了” · Fixed Pattern “都……了”': [
    {
      hanzi: '都这么晚了，你还不睡觉吗？',
      translation: "It's already so late, aren't you going to sleep yet?"
    },
    {
      hanzi: '都下雨了，我们还去吗？',
      translation: "It's already raining, are we still going?"
    },
    {
      hanzi: '都快考试了，你还在玩儿手机。',
      translation: "The exam is almost here, and you're still playing on your phone."
    }
  ],
  '形容词重叠 · Adjective Reduplication': [
    {
      hanzi: '我喜欢大大的书包。',
      translation: 'I like big schoolbags.'
    },
    {
      hanzi: '这只小狗白白的，很可爱。',
      translation: 'This puppy is white and very cute.'
    },
    {
      hanzi: '她穿了一件漂漂亮亮的衣服。',
      translation: 'She wore a beautiful dress.'
    }
  ],
  '固定短语“什么的” · Set Phrase “什么的”': [
    {
      hanzi: '桌子上有书、笔、本子什么的。',
      translation: 'There are books, pens, notebooks, and so on on the desk.'
    },
    {
      hanzi: '他喜欢运动，比如打篮球、走路什么的。',
      translation: 'He likes activities such as playing basketball, walking, and so on.'
    },
    {
      hanzi: '我买了一些菜，有鸡蛋、肉、水果什么的。',
      translation: 'I bought eggs, meat, fruit, and other food.'
    }
  ],
  '结构助词“地” · Structural Particle “地”': [
    {
      hanzi: '他高兴地笑了。',
      translation: 'He smiled happily.'
    },
    {
      hanzi: '孩子们认真地学习汉语。',
      translation: 'The children are diligently studying Chinese.'
    },
    {
      hanzi: '她慢慢地走回家。',
      translation: 'She slowly walked home.'
    }
  ],
  '紧缩复句“一……就……” · Contracted Complex Sentence “一……就……”': [
    {
      hanzi: '我一回家就吃饭。',
      translation: 'As soon as I get home, I eat.'
    },
    {
      hanzi: '他一开门，狗就跑出去了。',
      translation: 'As soon as he opened the door, the dog ran out.'
    },
    {
      hanzi: '我一听音乐就很高兴。',
      translation: 'As soon as I listen to music, I become very happy.'
    }
  ],
  '状态补语（1） · Complement of State (1)': [
    {
      hanzi: '他中文说得很好。',
      translation: 'He speaks Chinese very well.'
    },
    {
      hanzi: '他跑得不快。',
      translation: "He doesn't run fast."
    },
    {
      hanzi: '你今天睡得怎么样？',
      translation: 'How did you sleep today?'
    }
  ],
  '状态补语（2） · Complement of State (2)': [
    {
      hanzi: '他唱歌唱得很好听。',
      translation: 'He sings very well.'
    },
    {
      hanzi: '汉字他写得很好看。',
      translation: 'He writes Chinese characters very beautifully.'
    },
    {
      hanzi: '我打篮球打得不好。',
      translation: "I don't play basketball well."
    }
  ],
  '比较句（1） · Comparative Sentences (1)': [
    {
      hanzi: '北京比上海冷。',
      translation: 'Beijing is colder than Shanghai.'
    },
    {
      hanzi: '我的书包比你的大。',
      translation: 'My backpack is bigger than yours.'
    },
    {
      hanzi: '学汉语比学英语有意思。',
      translation: 'Learning Chinese is more interesting than learning English.'
    }
  ],
  '比较句（2） · Comparative Sentences (2)': [
    {
      hanzi: '这个手机比那个更好用。',
      translation: 'This phone is even easier to use than that one.'
    },
    {
      hanzi: '他比我更高。',
      translation: 'He is even taller than me.'
    },
    {
      hanzi: '我觉得牛奶比茶还好。',
      translation: 'I think milk is even better than tea.'
    }
  ],
  '转折复句“虽然……，但是……” · Adversative Complex Sentence “虽然……，但是……”': [
    {
      hanzi: '虽然下雨了，但是我们还是要去。',
      translation: "Although it's raining, we still have to go."
    },
    {
      hanzi: '他很忙，但是他还是来了。',
      translation: 'He was very busy, but he still came.'
    },
    {
      hanzi: '虽然很晚了，我还在学习。',
      translation: "Although it's very late, I'm still studying."
    }
  ],
  '比较句（3） · Comparative Sentences (3)': [
    {
      hanzi: '我没有他那么喜欢吃米饭。',
      translation: "I don't like eating rice as much as he does."
    },
    {
      hanzi: '这个地方没有北京那么大。',
      translation: 'This place is not as big as Beijing.'
    },
    {
      hanzi: '你的手机有我的新吗？',
      translation: 'Is your phone as new as mine?'
    }
  ],
  '动词“离” · Verb “离”': [
    {
      hanzi: '我家离学校很近。',
      translation: 'My home is very close to the school.'
    },
    {
      hanzi: '公司离地铁站不远。',
      translation: 'The company is not far from the subway station.'
    },
    {
      hanzi: '离考试还有两个星期。',
      translation: 'There are still two weeks until the exam.'
    }
  ],
  '时量补语（1） · Complement of Duration (1)': [
    {
      hanzi: '我睡了八个小时。',
      translation: 'I slept for eight hours.'
    },
    {
      hanzi: '他看了一个小时电影。',
      translation: 'He watched a movie for an hour.'
    },
    {
      hanzi: '我学习汉语学习了三年了。',
      translation: 'I have been studying Chinese for three years (and am still studying).'
    }
  ],
  '主谓谓语句 · Sentences with a Subject-Predicate Phrase as the Predicate': [
    {
      hanzi: '他身体很好。',
      translation: 'His health is very good.'
    },
    {
      hanzi: '这个地方天气很好。',
      translation: 'The weather in this place is very good.'
    },
    {
      hanzi: '那个人个子很高。',
      translation: 'That person is very tall.'
    }
  ],
  '选择问句 · Alternative Questions': [
    {
      hanzi: '你喜欢喝茶还是牛奶？',
      translation: 'Do you like drinking tea or milk?'
    },
    {
      hanzi: '我们坐车去还是走路去？',
      translation: 'Shall we go by car or walk?'
    },
    {
      hanzi: '你是老师还是学生？',
      translation: 'Are you a teacher or a student?'
    }
  ],
  '固定格式“要/快/快要/就要……了” · Fixed Pattern “要/快/快要/就要……了”': [
    {
      hanzi: '电影快开了。',
      translation: 'The movie is about to start.'
    },
    {
      hanzi: '他要回家了。',
      translation: 'He is about to go home.'
    },
    {
      hanzi: '下个月我们就要去北京了。',
      translation: 'We are going to Beijing next month.'
    }
  ],
  '动态助词“着”（1） · Aspect Particle “着” (1)': [
    {
      hanzi: '她穿着一件红色的衣服。',
      translation: 'She is wearing a red dress.'
    },
    {
      hanzi: '外面下着雨，我们别出去了。',
      translation: "It's raining outside, let's not go out."
    },
    {
      hanzi: '他没拿着手机，在找呢。',
      translation: "He isn't holding his phone, he's looking for it."
    }
  ],
  '动态助词“着”（2） · Aspect Particle “着” (2)': [
    {
      hanzi: '他看着电视，没听见我说话。',
      translation: "He was watching TV and didn't hear me speak."
    },
    {
      hanzi: '桌子上放着很多书。',
      translation: 'There are many books on the table.'
    },
    {
      hanzi: '你穿着那件新衣服吗？',
      translation: 'Are you wearing that new dress?'
    }
  ],
  '程度副词“最” · Adverb of Degree “最”': [
    {
      hanzi: '我最喜欢喝牛奶。',
      translation: 'I like drinking milk the most.'
    },
    {
      hanzi: '这是我吃过的最好吃的包子。',
      translation: "This is the best-tasting bun I've ever eaten."
    },
    {
      hanzi: '他是我最好的朋友。',
      translation: 'He is my best friend.'
    }
  ],
  '比较句（4） · Comparative Sentences (4)': [
    {
      hanzi: '这件衣服比那件贵多了。',
      translation: 'This piece of clothing is much more expensive than that one.'
    },
    {
      hanzi: '今天比昨天热得多。',
      translation: 'Today is much hotter than yesterday.'
    },
    {
      hanzi: '学汉语比学英语难多了。',
      translation: 'Learning Chinese is much harder than learning English.'
    }
  ],
  '比较句（5） · Comparative Sentences (5)': [
    {
      hanzi: '他比我来得早。',
      translation: 'He came earlier than me.'
    },
    {
      hanzi: '他说得比我流利。',
      translation: 'He speaks more fluently than me.'
    },
    {
      hanzi: '妹妹比姐姐跑得快。',
      translation: 'Younger sister runs faster than older sister.'
    }
  ],
  '比较句（6） · Comparative Sentences (6)': [
    {
      hanzi: '他打篮球打得比我好。',
      translation: 'He plays basketball better than me.'
    },
    {
      hanzi: '我做饭做得比妈妈快。',
      translation: 'I cook faster than Mom.'
    },
    {
      hanzi: '她中文说得比我流利。',
      translation: 'She speaks Chinese more fluently than me.'
    }
  ],
  '双宾语句（2） · Double-Object Sentences (2)': [
    {
      hanzi: '妈妈送给我一个新书包。',
      translation: 'Mom gave me a new school bag.'
    },
    {
      hanzi: '他拿给老师一份作业。',
      translation: 'He handed the teacher a piece of homework.'
    },
    {
      hanzi: '商店卖给我们很多便宜的衣服。',
      translation: 'The store sold us many cheap clothes.'
    }
  ],
  '比较句（7） · Comparative Sentences (7)': [
    {
      hanzi: '姐姐比我大三岁。',
      translation: 'My older sister is three years older than me.'
    },
    {
      hanzi: '这件衣服比那件贵二十元。',
      translation: 'This piece of clothing is twenty yuan more expensive than that one.'
    },
    {
      hanzi: '我们班的男生比女生多五个。',
      translation: 'There are five more boys than girls in our class.'
    }
  ],
  '比较句（8） · Comparative Sentences (8)': [
    {
      hanzi: '今天比昨天冷一点儿。',
      translation: 'Today is a bit colder than yesterday.'
    },
    {
      hanzi: '这件衣服比那件好看一些。',
      translation: 'This piece of clothing is a bit prettier than that one.'
    },
    {
      hanzi: '他比我高一点儿。',
      translation: 'He is a bit taller than me.'
    }
  ],
  '存现句（2） · Existential Sentences (2)': [
    {
      hanzi: '桌子上放着一个杯子。',
      translation: 'There is a cup on the table.'
    },
    {
      hanzi: '门外站着一个男人。',
      translation: 'There is a man standing outside the door.'
    },
    {
      hanzi: '地上坐着一个小孩儿。',
      translation: 'There is a child sitting on the ground.'
    }
  ],
  '程度副词“多” · Adverb of Degree “多”': [
    {
      hanzi: '这个地方多好看啊！',
      translation: 'How beautiful this place is!'
    },
    {
      hanzi: '今天的天气多好啊！',
      translation: 'How nice the weather is today!'
    },
    {
      hanzi: '这个电影多有意思啊！',
      translation: 'How interesting this movie is!'
    }
  ],
  '复合趋向补语 · Compound Complement of Direction': [
    {
      hanzi: '请你拿书上来。',
      translation: 'Please bring the book up here.'
    },
    {
      hanzi: '他跑进教室去了。',
      translation: 'He ran into the classroom.'
    },
    {
      hanzi: '我从家里带出来一些水果。',
      translation: 'I brought some fruit out from home.'
    }
  ],
  '动量补语（1） · Complement of Frequency (1)': [
    {
      hanzi: '我来过这里三次。',
      translation: 'I have been here three times.'
    },
    {
      hanzi: '他见过老师一次。',
      translation: 'He has met the teacher once.'
    },
    {
      hanzi: '你打过几次电话给他？',
      translation: 'How many times have you called him?'
    }
  ],
  '动量补语（2） · Complement of Frequency (2)': [
    {
      hanzi: '我看了两次这个电影。',
      translation: 'I watched this movie twice.'
    },
    {
      hanzi: '他找了我三次。',
      translation: 'He looked for me three times.'
    },
    {
      hanzi: '我吃了一次饭。',
      translation: 'I ate a meal once.'
    }
  ],
  '“有”字句（2） · “有” Sentence (2)': [
    {
      hanzi: '他有十年没来北京了。',
      translation: "He hasn't been to Beijing for ten years."
    },
    {
      hanzi: '这个孩子有两岁了。',
      translation: 'This child is two years old.'
    },
    {
      hanzi: '我有一个星期没见到她了。',
      translation: "I haven't seen her for a week."
    }
  ]
};
