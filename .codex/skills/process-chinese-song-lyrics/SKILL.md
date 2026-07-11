---
name: process-chinese-song-lyrics
description: Import, standardize, clean, and audit Produck Chinese song lyric markdown batches for the `chinese_song_lyric` database. Use when the user asks to process files like `song-imports/songs-new*.md`, split songs by `---`, run lyric AI standardization in parallel, fix title/artist metadata, convert Traditional Hanzi to simplified Chinese, remove duplicate Latin translations, or audit inserted Chinese song lyrics.
---

# Process Chinese Song Lyrics

## Workflow

Use this skill for Produck lyric imports and cleanup.

1. Inspect the batch file first.
   - Count songs with `($content -split '(?m)^---\s*$').Where({ $_.Trim().Length -gt 0 }).Count`.
   - Read enough of the file to identify title/artist source noise, duplicated artists, Latin-only titles, version suffixes, and Traditional text.
   - Query existing `chinese_song_lyric` rows for the same titles/artists before inserting.

2. Prefer the bundled script for normal markdown batches:
   ```powershell
   node .codex/skills/process-chinese-song-lyrics/scripts/import-chinese-lyrics.mjs --input song-imports/songs-new6.md --concurrency 4
   ```

3. If the source has known messy metadata, either:
   - pass a metadata overrides JSON file with `--overrides path/to/overrides.json`, or
   - run the import, then patch the affected DB rows directly and verify.

4. After import, always audit:
   - no Traditional Hanzi remains in `titleHanzi`, `singerHanzi`, or lyric `hanzi`.
   - no duplicate Latin-only line appears in both `hanzi` and `english`.
   - no copied Latin source words are present in pinyin for mixed Hanzi/Latin lines.
   - artist metadata is not contaminated by source noise like `en<artist>en`, `Preview`, `Full Track`, or duplicated artist names.
   - section ids and labels are named cleanly: if there is only one distinct `verse`, `chorus`, `bridge`, or `outro`, use unnumbered ids/labels like `verse` / `Verse` and `chorus` / `Chorus`; use numbered variants like `verse-1`, `verse-2`, `chorus-1`, `chorus-2` only when those sections are genuinely different. Repeat sections should point to the clean target id, for example `repeat-chorus` with `repeatOf: "chorus"` when there is only one chorus. If the same target repeats back-to-back, collapse it into one repeat marker with an occurrence suffix, for example `repeat-chorus-2x` / `Repeat Chorus 2x` with `repeatOf: "chorus"`. If the same target repeats in separate non-consecutive places, keep repeat ids unique as needed, such as `repeat-chorus-1` and `repeat-chorus-2`, but keep the label tied to the target section unless the marker itself means repeated back-to-back.
   - title version suffixes are removed when the user asks, but leave slugs unchanged unless needed.

5. Remove temporary one-off scripts after use. Do not commit unless the user asks.

## Metadata Standards

- Use simplified Chinese in `titleHanzi`, `singerHanzi`, and lyric `hanzi`.
- Use stable romanized artist names already present in the DB when possible.
- Use `feat.` for featured artists, `, ` for multiple primary artists, and `&` only for commonly branded credits.
- Keep `singer`, `singerHanzi`, and `singerPinyin` aligned:
  - `Li Ronghao feat. A-Mei`
  - matching simplified Hanzi artist credit
  - matching tone-mark pinyin artist credit
- For Latin artist names, set `singerPinyin` to an empty string unless there is a Chinese `singerHanzi`.
- For Latin song titles like `I'll Wait for You`, keep the title as Latin instead of forcing pinyin.
- For non-Chinese lyric lines, keep the line in `hanzi`, set `pinyin` to `''`, and set `english` to `''` if it would duplicate the same Latin text.

## Known Cleanup Patterns

- Remove source wrappers such as `Song`, `Preview`, `Full Track`, `Lyrics of ...`, lyricist/composer lines, album labels, and decorative symbols.
- Normalize duplicated artists:
  - duplicated `Andrew Tan` source text -> `Andrew Tan` plus clean simplified Hanzi and pinyin
  - `en<artist>en` wrappers -> clean romanization, simplified Hanzi, and pinyin
  - duplicated comma-separated artist source text -> one comma-separated artist credit
- Fix obvious singer/title variants after import when found:
  - `Ronghao Li` -> `Li Ronghao`
  - `FeiFei Gong Zhu` -> `Feifei Gongzhu`
  - pinyin spacing variants like fused given names -> spaced syllables
- For the Traditional aspect marker sometimes copied as `zhu`/U+8457, convert it to the simplified context character `zhe`/U+7740 when OpenCC leaves it unchanged.

## Script Notes

The bundled script uses:

- `DEEPSEEK_API_KEY` and optional `DEEPSEEK_MODEL` from `.env`.
- `DATABASE_URL` from `.env`.
- `opencc-js` for generic Traditional-to-Simplified conversion.
- direct Postgres writes to `chinese_song_lyric`.

Overrides JSON format:

```json
{
  "title key or raw-source substring": {
    "id": "tong-hua-michael-wong",
    "titleHanzi": "simplified title",
    "titlePinyin": "Tone Mark Title Pinyin",
    "titleEnglish": "Fairy Tale",
    "singer": "Michael Wong",
    "singerHanzi": "simplified artist",
    "singerPinyin": "Tone Mark Artist Pinyin"
  }
}
```

Keys can match either the standardized `titleHanzi` or a substring in the raw source chunk.

## Verification Queries

Use focused Node/Postgres snippets for final checks. A good final report includes imported titles, artist names, and audit status. Keep the response concise.
