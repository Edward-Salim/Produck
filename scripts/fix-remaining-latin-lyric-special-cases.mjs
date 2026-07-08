import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

async function loadSong(slug) {
  const rows = await sql.unsafe(`select song from chinese_song_lyric where slug = $1`, [slug]);
  if (!rows.length) throw new Error(`Missing song ${slug}`);
  return rows[0].song;
}

async function saveSong(slug, song) {
  await sql.unsafe(`update chinese_song_lyric set song = $1, updated_at = now() where slug = $2`, [
    song,
    slug
  ]);
}

function latinLine(hanzi) {
  return { hanzi, pinyin: '', english: '' };
}

function byHanzi(song) {
  const map = new Map();
  for (const section of song.sections ?? []) {
    for (const line of section.lines ?? []) {
      if (!map.has(line.hanzi)) map.set(line.hanzi, line);
    }
  }
  return map;
}

let updated = 0;

{
  const slug = 'try-patrick-brasca-jay-chou-try';
  const song = await loadSong(slug);
  const lines = byHanzi(song);
  const get = (hanzi) => lines.get(hanzi) ?? latinLine(hanzi);

  song.sections = [
    {
      id: 'verse-1',
      label: 'Verse 1',
      lines: [
        latinLine('You always have to do something'),
        latinLine('Just to show the world that you exist'),
        latinLine('So you try'),
        latinLine("You hope they'll see"),
        latinLine("If on this brand new day you'll look"),
        latinLine('On the bright side of the same old street'),
        latinLine('You will see'),
        latinLine('What you deserve'),
        latinLine("Let's go"),
        get('我说几华里我送别了过去'),
        get('他们说人生的结局非常的戏剧'),
        get('塞外羌笛孤城马蹄'),
        get('在武侠的世界里谁与谁来为敌'),
        get('La la la la la la la la la'),
        get('黄沙里用竹笔写下的字叫勇气')
      ]
    },
    {
      id: 'pre-chorus',
      label: 'Pre-Chorus',
      lines: [
        latinLine('You just have to try'),
        latinLine('To be who you are'),
        latinLine('And you ought to fly'),
        latinLine('Step into the light'),
        latinLine('And soon you will find'),
        latinLine('Be yourself'),
        latinLine('Somewhere deep inside'),
        latinLine("There's a universe right there waiting to be unlocked"),
        latinLine('The key lies in looking into yourself')
      ]
    },
    {
      id: 'chorus',
      label: 'Chorus',
      lines: [
        latinLine('Oh Try try try try'),
        latinLine('Just do what is right'),
        latinLine("You'll fly so high"),
        latinLine('Let go of the brakes'),
        latinLine('Be who you are'),
        latinLine("Be yourself 'cause your power is on"),
        latinLine("When you believe in what you've got"),
        latinLine("You know you're perfect just be who you are"),
        latinLine("So they don't see what you're made of"),
        latinLine("But I like you and I know they're wrong"),
        latinLine("Now it's time"),
        latinLine('To show them what you got'),
        latinLine('Let the blue skies cheer you on'),
        latinLine("Embrace the wind we'll ride along"),
        latinLine("You're perfect when you're who you are"),
        get('这世界有些事有些人凭感觉'),
        get('别管他旌旗密布遍野狼烟霜雪'),
        get('那故事在穿越而我也在翻页'),
        get('一行行做好准备敏锐而直接'),
        get('La la la la la la la la la'),
        get('爱不灭真实的一切废话全收回')
      ]
    },
    { id: 'repeat-pre-chorus', label: 'Repeat Pre-Chorus', repeatOf: 'pre-chorus' },
    { id: 'repeat-chorus', label: 'Repeat Chorus', repeatOf: 'chorus' },
    { id: 'repeat-pre-chorus-2', label: 'Repeat Pre-Chorus', repeatOf: 'pre-chorus' },
    { id: 'repeat-chorus-2', label: 'Repeat Chorus', repeatOf: 'chorus' },
    { id: 'outro', label: 'Outro', lines: [latinLine('Try')] }
  ];

  await saveSong(slug, song);
  updated += 1;
}

{
  const slug = 'shuo-zou-jiu-zou-jay-chou';
  const song = await loadSong(slug);
  if (!JSON.stringify(song).includes('Wooh Wooh Wooh Wooh')) {
    song.sections.push({ id: 'outro', label: 'Outro', lines: [latinLine('Wooh Wooh Wooh Wooh')] });
    await saveSong(slug, song);
    updated += 1;
  }
}

{
  const slug = 'da-ben-zhong-jay-chou';
  const song = await loadSong(slug);
  if (!JSON.stringify(song).includes('Ooh wah Ooh wah Baby')) {
    const insertAt = Math.max(0, song.sections.length - 1);
    song.sections.splice(insertAt, 0, {
      id: 'interlude',
      label: 'Interlude',
      lines: [latinLine('Ooh wah Ooh wah Baby')]
    });
    await saveSong(slug, song);
    updated += 1;
  }
}

{
  const slug = 'featuring-kobe-bryant-tian-di-yi-dou';
  const song = await loadSong(slug);
  const lines = byHanzi(song);
  const get = (hanzi) => lines.get(hanzi) ?? latinLine(hanzi);

  const verse = song.sections.find((section) => section.id === 'verse-1');
  if (verse?.lines?.length) {
    const rest = verse.lines.filter(
      (line) =>
        ![
          'Kobe: Do you know how to play B-ball, Jay Chou?',
          'Jay: Of Course!',
          'Kobe: So you wanna play ball or sing first?',
          'What What What What Whatever'
        ].includes(line.hanzi)
    );
    verse.lines = [
      latinLine('Kobe: Do you know how to play B-ball, Jay Chou?'),
      latinLine('Jay: Of Course!'),
      ...rest,
      get('Jay Jay Jay Chou, Chou Chou Chou Jay, Jay Jay Jay Jay Jay Jay Jay Chou'),
      get('Ko Ko Ko Be, Be Be Be Ko, Ko Ko Ko Ko Kobe Kobe'),
      latinLine('Kobe: So you wanna play ball or sing first?'),
      latinLine('What What What What Whatever'),
      latinLine('What What What What Whatever')
    ];
  }

  if (!JSON.stringify(song).includes('Kobe: My man')) {
    song.sections.push({
      id: 'dialogue-outro',
      label: 'Dialogue Outro',
      lines: [
        latinLine('Kobe: My man'),
        latinLine('Jay: I’m not your man'),
        latinLine('Kobe: Ha ha ha you got spark!')
      ]
    });
  }

  await saveSong(slug, song);
  updated += 1;
}

await sql.end();
console.log(`Updated ${updated} songs.`);
