export type LyricLine = {
  hanzi: string;
  pinyin: string;
  english: string;
};

export type LyricSection = {
  id: string;
  label: string;
  lines?: LyricLine[];
  repeatOf?: string;
};

export type LyricSong = {
  id: string;
  titlePinyin: string;
  titleHanzi: string;
  titleEnglish: string;
  singer: string;
  singerHanzi: string;
  singerPinyin: string;
  tags: string[];
  sections: LyricSection[];
};

const ARTIST_COLLATOR = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const TITLE_COLLATOR = new Intl.Collator(['zh-Hans-u-co-pinyin', 'en'], {
  numeric: true,
  sensitivity: 'base'
});

function compareText(a: string, b: string, collator = ARTIST_COLLATOR) {
  return collator.compare(a.trim(), b.trim());
}

export function compareLyricSongsByArtistAndTitle(a: LyricSong, b: LyricSong) {
  return (
    compareText(a.singer, b.singer) ||
    compareText(a.singerHanzi, b.singerHanzi, TITLE_COLLATOR) ||
    compareText(a.singerPinyin, b.singerPinyin) ||
    compareText(a.titlePinyin, b.titlePinyin) ||
    compareText(a.titleHanzi, b.titleHanzi, TITLE_COLLATOR) ||
    compareText(a.titleEnglish, b.titleEnglish) ||
    compareText(a.id, b.id)
  );
}

export const songs: LyricSong[] = [
  {
    id: 'gao-bai-qi-qiu',
    titlePinyin: 'Gào Bái Qì Qiú',
    titleHanzi: '告白气球',
    titleEnglish: 'Love Confession Balloon',
    singer: 'Jay Chou',
    singerHanzi: '周杰伦',
    singerPinyin: 'Zhōu Jié lún',
    tags: ['pop', 'love song', 'mandopop'],
    sections: [
      {
        id: 'verse-1',
        label: 'Verse 1',
        lines: [
          {
            hanzi: '塞纳河畔 左岸的咖啡',
            pinyin: 'Sài nà hé pàn zuǒ àn de kā fēi',
            english: 'Coffee on the Left Bank beside the Seine'
          },
          {
            hanzi: '我手一杯 品尝你的美',
            pinyin: 'Wǒ shǒu yì bēi pǐn cháng nǐ de měi',
            english: 'A cup in my hand, tasting your beauty'
          },
          {
            hanzi: '留下唇印的嘴',
            pinyin: 'Liú xià chún yìn de zuǐ',
            english: 'The lips that left a mark'
          }
        ]
      },
      {
        id: 'verse-2',
        label: 'Verse 2',
        lines: [
          {
            hanzi: '花店玫瑰 名字写错谁',
            pinyin: 'Huā diàn méi guī míng zi xiě cuò shéi',
            english: 'Roses from the flower shop, whose name was written wrong?'
          },
          {
            hanzi: '告白气球 风吹到对街',
            pinyin: 'Gào bái qì qiú fēng chuī dào duì jiē',
            english: 'A confession balloon is blown across the street'
          },
          {
            hanzi: '微笑在天上飞',
            pinyin: 'Wēi xiào zài tiān shàng fēi',
            english: 'Smiles fly through the sky'
          }
        ]
      },
      {
        id: 'pre-chorus',
        label: 'Pre-Chorus',
        lines: [
          {
            hanzi: '你说你有点难追 想让我知难而退',
            pinyin: 'Nǐ shuō nǐ yǒu diǎn nán zhuī xiǎng ràng wǒ zhī nán ér tuì',
            english: 'You said you are hard to pursue and wanted me to back away'
          },
          {
            hanzi: '礼物不需挑最贵 只要香榭的落叶',
            pinyin: 'Lǐ wù bù xū tiāo zuì guì zhǐ yào Xiāng Xiè de luò yè',
            english: 'A gift need not be the most expensive, just fallen leaves from the Champs-Elysees'
          },
          {
            hanzi: '营造浪漫的约会 不害怕搞砸一切',
            pinyin: 'Yíng zào làng màn de yuē huì bù hài pà gǎo zá yí qiè',
            english: 'Creating a romantic date, unafraid of messing everything up'
          },
          {
            hanzi: '拥有你就拥有 全世界',
            pinyin: 'Yōng yǒu nǐ jiù yōng yǒu quán shì jiè',
            english: 'Having you means having the whole world'
          }
        ]
      },
      {
        id: 'chorus',
        label: 'Chorus',
        lines: [
          {
            hanzi: '亲爱的 爱上你 从那天起',
            pinyin: 'Qīn ài de ài shàng nǐ cóng nà tiān qǐ',
            english: 'Darling, from the day I fell for you'
          },
          {
            hanzi: '甜蜜的很轻易',
            pinyin: 'Tián mì de hěn qīng yì',
            english: 'Sweetness came so easily'
          },
          {
            hanzi: '亲爱的 别任性 你的眼睛',
            pinyin: 'Qīn ài de bié rèn xìng nǐ de yǎn jīng',
            english: 'Darling, do not be willful, your eyes'
          },
          {
            hanzi: '在说我愿意',
            pinyin: 'Zài shuō wǒ yuàn yì',
            english: 'Are saying: I do'
          }
        ]
      },
      { id: 'repeat-verse-1', label: 'Repeat Verse 1', repeatOf: 'verse-1' },
      { id: 'repeat-verse-2', label: 'Repeat Verse 2', repeatOf: 'verse-2' },
      { id: 'repeat-pre-chorus', label: 'Repeat Pre-Chorus', repeatOf: 'pre-chorus' },
      { id: 'repeat-chorus', label: 'Repeat Chorus', repeatOf: 'chorus' },
      {
        id: 'bridge',
        label: 'Bridge',
        lines: [
          {
            hanzi: '亲爱的 爱上你 恋爱日记',
            pinyin: 'Qīn ài de ài shàng nǐ liàn ài rì jì',
            english: 'Darling, falling for you is a love diary'
          },
          {
            hanzi: '飘香水的回忆',
            pinyin: 'Piāo xiāng shuǐ de huí yì',
            english: 'Memories scented with perfume'
          },
          {
            hanzi: '一整瓶 的梦境 全都有你',
            pinyin: 'Yì zhěng píng de mèng jìng quán dōu yǒu nǐ',
            english: 'A whole bottle of dreams, all filled with you'
          },
          {
            hanzi: '搅拌在一起',
            pinyin: 'Jiǎo bàn zài yì qǐ',
            english: 'Stirred together'
          }
        ]
      },
      {
        id: 'outro',
        label: 'Outro',
        lines: [
          {
            hanzi: '亲爱的别任性 你的眼睛',
            pinyin: 'Qīn ài de bié rèn xìng nǐ de yǎn jīng',
            english: 'Darling, do not be willful, your eyes'
          },
          {
            hanzi: '在说我愿意',
            pinyin: 'Zài shuō wǒ yuàn yì',
            english: 'Are saying: I do'
          }
        ]
      }
    ]
  }
];
