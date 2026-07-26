---
name: create-hsk-anki-decks
description: Create, continue, revise, or audit Produck HSK 3.0 Anki vocabulary decks and their card templates. Use for `static/pleco/hsk3.0-level*.txt` conversions, `static/anki/*_anki.txt` files, common-meaning selection, numbered pinyin, Unicode radicals, cumulative-level example sentences, or the Chinese Hanzi/pinyin Anki front and back HTML/CSS.
---

# Create HSK Anki Decks

Build study-ready decks without modifying the Pleco source lists. Preserve existing user edits and keep generated decks under `static/anki`.

## Read the local standard

Read [references/deck-standard.md](references/deck-standard.md) before creating or substantially revising a deck. Inspect the preceding completed deck and the current Anki HTML/CSS before deciding formatting details.

## Build a level

1. Read `static/pleco/hsk3.0-levelN.txt` as the source. Treat it as immutable.
2. Read all lower-level `static/anki/hsk3.0-levelN_anki.txt` decks to establish cumulative allowed vocabulary and current conventions.
3. Read the applicable HSK grammar/course data under `src/routes/(app)/chinese-learning/hsk` and `src/lib/data/hsk*-course.ts`.
4. Write a new `static/anki/hsk3.0-levelN_anki.txt` with exactly five semicolon-delimited fields per line:

   `Hanzi;numbered-pinyin;common meaning;radicals;Chinese example. English translation.`

5. Prefer local course and sentence-bank examples. Accept an external example only after verifying its meaning, grammar, and cumulative vocabulary. Never copy a sentence merely because the target appears as a substring of another word.
6. Use a short, natural metalinguistic sentence such as `我学了“词”这个词。` when no honest contextual sentence passes validation. Do not invent awkward part-of-speech templates.
7. Run the bundled audit, review flagged cards manually, and confirm the Pleco source has no diff.

## Select content

- Choose one common modern meaning for the intended HSK entry or labeled part of speech. Do not keep slash-separated alternatives or obscure dictionary-first senses.
- Keep numbered pinyin compact, one tone digit per syllable, using `5` for a neutral tone.
- Determine radicals from Unicode `kRSUnicode` and `CJKRadicals.txt`, not visual guessing. Use the visible contextual form and an English name.
- Record one radical per written-character position. Collapse adjacent repeated identical characters, so `爸爸` has `父 (father)`, not a duplicate and not `×2`. Keep repeated radicals for different characters when they represent separate positions.
- Use cumulative HSK vocabulary through the target level. The target itself is allowed. Keep grammar within the target course level.
- Ensure the example demonstrates the intended sense. For polysemous single characters and grammar words, prefer an exact source match or the safe metalinguistic fallback.

## Maintain card templates

Keep these files coordinated:

- `static/anki/chinese_frontside.html`
- `static/anki/chinese_backside.html`
- `static/anki/chinese.css`

Render each pinyin syllable directly under its corresponding Hanzi. Hide `.character-pinyin` on the question side and reveal it from the back template only after Anki shows the answer. Preserve numbered-to-marked conversion and tone colors. Do not add a second Pinyin information block.

## Validate

Run:

```powershell
node .codex/skills/create-hsk-anki-decks/scripts/audit-hsk-anki.mjs `
  static/anki/hsk3.0-level3_anki.txt `
  static/anki/hsk3.0-level1_anki.txt `
  static/anki/hsk3.0-level2_anki.txt
```

Require zero malformed rows, duplicate Hanzi+pinyin cards, invalid pinyin, radical-count errors, omitted targets, and vocabulary violations. Then inspect a sample from the beginning, middle, and end and run `git diff -- static/pleco/hsk3.0-levelN.txt`.
