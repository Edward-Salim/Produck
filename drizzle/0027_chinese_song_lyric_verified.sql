ALTER TABLE "chinese_song_lyric"
ADD COLUMN "verified" boolean DEFAULT false NOT NULL;

UPDATE "chinese_song_lyric"
SET "verified" = true
WHERE "slug" IN (
	'gao-bai-qi-qiu',
	'nu-er-dian-xia-jay-chou',
	'qi-yue-de-ji-guang-jay-chou',
	'shui-xi-han-jay-chou',
	'ai-qin-hai-jay-chou',
	'i-do-jay-chou-i-do'
);
