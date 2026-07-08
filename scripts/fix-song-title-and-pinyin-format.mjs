import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

const titleFixes = {
  'gua-niu-jay-chou': { titleEnglish: 'Snail' },
  'tu-er-qi-bing-qi-jay-chou': { titleEnglish: 'Turkish Ice Cream' },
  'shuo-zou-jiu-zou-jay-chou': { titleEnglish: "Let's Go" },
  'ai-qing-fei-chai-jay-chou': { titleEnglish: 'Romantic Failure' },
  'bu-gai-jay-chou-zhang-hui-mei': { titleEnglish: "Shouldn't Be" },
  'chuang-bian-gu-shi-jay-chou': { titleEnglish: 'Bedtime Stories' },
  'qie-ai-jay-chou': { titleEnglish: 'Stolen Love' },
  'yi-kou-qi-quan-nian-dui-jay-chou': { titleEnglish: 'Say It All in One Breath' },
  'wo-yao-xia-tian-jay-chou-feat-gary-yang': { titleEnglish: 'I Want Summer' },
  'zhou-da-xia-jay-chou': { titleEnglish: 'Hero Chou' },
  'ting-jian-xia-yu-de-sheng-yin-jay-chou': { titleEnglish: 'Hear the Sound of Rain' },
  'zen-me-le-jay-chou-feat-cindy-yuan-yong': { titleEnglish: "What's Wrong" },
  'ting-ba-ba-de-hua-jay-chou': { titleEnglish: 'Listen to Dad' },
  'qing-tian-jay-chou-request': { titleEnglish: 'Sunny Day' },
  'tian-ya-guo-ke-jay-chou': { titleEnglish: 'Passing Traveler' },
  'shou-xie-de-cong-qian-jay-chou': { titleEnglish: 'Handwritten Past' },
  'yang-ming-shan-jay-chou': { titleEnglish: 'Yangmingshan' },
  'suan-shen-me-nan-ren-jay-chou': { titleEnglish: 'What Kind of Man' },
  'xie-zi-te-da-hao-jay-chou': { titleEnglish: 'Extra-Large Shoes' },
  'ting-ma-ma-de-hua-jay-chou-request': {
    titleHanzi: '听妈妈的话',
    titlePinyin: 'Tīng Mā Ma De Huà',
    titleEnglish: 'Listen to Mom',
    singer: 'Jay Chou',
    singerHanzi: '周杰伦',
    singerPinyin: 'Zhōu Jié Lún'
  },
  'na-li-dou-shi-ni-jay-chou': { titleEnglish: 'You Are Everywhere' },
  'bo-ye-jay-chou': { titleEnglish: 'Mr. Bo' },
  'da-jia-wu-jay-chou': { titleEnglish: 'Fight Dance' },
  'shuo-hao-de-xing-fu-ne-jay-chou': {
    titleHanzi: '说好的幸福呢',
    titlePinyin: 'Shuō Hǎo De Xìng Fú Ne',
    titleEnglish: 'Where Is the Promised Happiness?',
    singer: 'Jay Chou',
    singerHanzi: '周杰伦',
    singerPinyin: 'Zhōu Jié Lún'
  },
  'meng-xiang-qi-dong-jay-chou': { titleEnglish: 'Dreams Start' },
  'sha-xiao-jay-chou-cindy-yuan-yong-lin': { titleEnglish: 'Silly Smile' },
  'wu-ke-li-li-jay-chou': { titleEnglish: 'Ukulele' },
  'ai-ni-mei-cha-jay-chou': { titleEnglish: 'Loving You Makes No Difference' },
  'da-ben-zhong-jay-chou': { titleEnglish: 'Big Ben' },
  'bi-jiao-da-de-da-di-qin-jay-chou-lara': { titleEnglish: 'A Larger Cello' },
  'gong-gong-pian-tou-tong-jay-chou': { titleEnglish: "The Eunuch's Migraine" },
  'ming-ming-jiu-jay-chou': { titleEnglish: 'Obviously' },
  'hong-chen-ke-zhan-jay-chou': { titleEnglish: 'Worldly Inn' },
  'shi-jie-wei-mo-ri-jay-chou': { titleEnglish: 'The World Is Not Ending' },
  'chao-pao-nu-shen-jay-chou': { titleEnglish: 'Supercar Goddess' },
  'liao-shang-shao-rou-zong-jay-chou': { titleEnglish: 'Healing Rice Dumplings' },
  'gong-zhu-bing-jay-chou': { titleEnglish: 'Princess Syndrome' },
  'shui-shou-pa-shui-jay-chou': { titleEnglish: 'Sailor Afraid of Water' },
  'mi-hun-qu-jay-chou': { titleEnglish: 'Enchanting Melody' },
  'jing-tan-hao-jay-chou': { titleEnglish: 'Exclamation Mark' },
  'ni-hao-ma-jay-chou': { titleEnglish: 'How Are You?' },
  'pi-ying-xi-jay-chou': { titleEnglish: 'Shadow Play' },
  'qian-li-zhi-wai-jay-chou-request': {
    titleHanzi: '千里之外',
    titlePinyin: 'Qiān Lǐ Zhī Wài',
    titleEnglish: 'Far Away',
    singer: 'Jay Chou',
    singerHanzi: '周杰伦',
    singerPinyin: 'Zhōu Jié Lún'
  },
  'featuring-kobe-bryant-tian-di-yi-dou': {
    titleHanzi: '天地一斗',
    titlePinyin: 'Tiān Dì Yī Dòu',
    titleEnglish: 'Heaven and Earth Duel',
    singer: 'Jay Chou featuring Kobe Bryant',
    singerHanzi: '周杰伦 featuring Kobe Bryant',
    singerPinyin: 'Zhōu Jié Lún featuring Kobe Bryant'
  }
};

function capitalizePinyin(value) {
  return value.replace(/^(\s*)([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ])/u, (_, space, first) =>
    `${space}${first.toLocaleUpperCase()}`
  );
}

const rows = await sql`
  select slug, song
  from chinese_song_lyric
  order by sort_order, id
`;

let updated = 0;

for (const row of rows) {
  const song = row.song;
  let changed = false;
  const fix = titleFixes[row.slug];

  if (fix) {
    Object.assign(song, fix);
    changed = true;
  }

  for (const section of song.sections ?? []) {
    for (const line of section.lines ?? []) {
      const nextPinyin = capitalizePinyin(line.pinyin ?? '');
      if (nextPinyin !== line.pinyin) {
        line.pinyin = nextPinyin;
        changed = true;
      }
    }
  }

  if (changed) {
    await sql`
      update chinese_song_lyric
      set song = ${sql.json(song)}, updated_at = now()
      where slug = ${row.slug}
    `;
    updated += 1;
  }
}

await sql.end();
console.log(`Updated ${updated} songs.`);
