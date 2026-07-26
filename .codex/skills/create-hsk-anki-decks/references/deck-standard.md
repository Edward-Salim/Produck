# Produck HSK Anki deck standard

## Paths

- Immutable input: `static/pleco/hsk3.0-levelN.txt`
- Generated output: `static/anki/hsk3.0-levelN_anki.txt`
- Grammar/course references: `src/routes/(app)/chinese-learning/hsk` and `src/lib/data/hsk*-course.ts`
- Sentence banks: search `src/routes/(app)/chinese-learning` and `src/lib/data` for objects containing `hanzi` and `translation`
- Templates: `static/anki/chinese_frontside.html`, `chinese_backside.html`, and `chinese.css`

## Record contract

Every UTF-8 line has exactly five fields separated by literal semicolons:

```text
爸爸;ba4ba5;father;父 (father);爸爸能来。 Dad can come.
```

Do not put semicolons inside meanings or examples.

## Meaning rules

- Give one concise, common modern gloss.
- Respect an HSK part-of-speech label or a pronunciation-specific entry.
- Compare duplicate surface forms in earlier levels: a repeated word may intentionally teach a new sense.
- Remove register notes, classifier lists, dictionary markup, and parenthetical explanations unless essential to distinguish the sense.

## Radical rules

- Base the radical number on Unicode `kRSUnicode`.
- Resolve the glyph through Unicode `CJKRadicals.txt`; use contextual forms such as `忄`, `扌`, `氵`, `讠`, `纟`, `饣`, `阝`, `⻊`, and `⺮` where appropriate.
- Format every item as `glyph (English name)`. Never emit code points, `?`, duplicated adjacent repeated-character radicals, or count notation such as `×2`.
- Different characters with the same radical still receive separate entries: `把握` may contain `扌 (hand), 扌 (hand)`.

## Example rules

- Use only words from the target deck plus all preceding decks.
- Ignore punctuation while segmenting but do not silently treat arbitrary character sequences as known words.
- Confirm the target is a token in the intended sense, especially for one-character entries.
- Prefer natural local course sentences and grammar already taught at that level.
- Keep the English translation faithful to the actual Chinese sentence.
- If a contextual example cannot be verified, use `我学了“目标”这个词。 I learned the word “meaning.”` rather than an ungrammatical construction.

## Template contract

The front-side script splits compact numbered pinyin into syllables, converts each to a tone mark, and creates one `.hanzi-unit` per Hanzi. Each unit contains `.hanzi-glyph` followed by `.character-pinyin`. CSS hides the latter by default; the back template reveals it. This produces character-level alignment only after “Show Answer.”
