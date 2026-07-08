<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import {
    ArrowUp,
    CornerDownLeft,
    Expand,
    ListMusic,
    LoaderCircle,
    Music2,
    Search,
    WandSparkles,
    X
  } from '@lucide/svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import { pinyin as makePinyin } from 'pinyin-pro';
  import InkWashBg from '$lib/components/chinese-game/InkWashBg.svelte';
  import '$lib/components/chinese-game/game.css';
  import type { PageData } from './$types.js';
  import type { LyricLine, LyricSection, LyricSong } from './song-data.js';

  type LyricToken = {
    hanzi: string;
    pinyin: string;
    kind: 'hanzi' | 'space' | 'punct' | 'latin';
  };

  type LyricPart = {
    text: string;
    pinyin: string;
    aside: boolean;
  };

  type LyricPhrase = {
    text: string;
    pinyin: string;
  };

  const PUNCT_RE = /[-，。？、！；：—…“”‘’（）《》,.?!;:()]/u;
  const HAN_RE = /\p{Script=Han}/u;
  const LATIN_RE = /[A-Za-z0-9'’]+/u;
  const TONE_MARK_RE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ]/gu;
  const SELECTED_SONG_KEY = 'chinese-song-lyrics:selected';
  const CUSTOM_VERIFIED_SONGS_KEY = 'chinese-song-lyrics:verified';
  const CUSTOM_UNVERIFIED_SONGS_KEY = 'chinese-song-lyrics:unverified';
  const VERIFIED_SONG_IDS = new Set([
    'gao-bai-qi-qiu',
    'nu-er-dian-xia-jay-chou',
    'qi-yue-de-ji-guang-jay-chou',
    'shui-xi-han-jay-chou',
    'ai-qin-hai-jay-chou',
    'i-do-jay-chou-i-do'
  ]);

  let { data }: { data: PageData } = $props();
  let songs = $derived(data.songs);
  let query = $state('');
  let selectedId = $state(untrack(() => data.selectedId ?? data.songs[0]?.id ?? ''));
  let customVerifiedSongIds = $state(new Set<string>());
  let customUnverifiedSongIds = $state(new Set<string>());
  let songClickCounts = $state<Record<string, number>>({});
  let songListOpen = $state(false);
  let importModalOpen = $state(false);
  let rawSongInput = $state('');
  let standardizing = $state(false);
  let standardizeError = $state('');
  let showHanzi = $state(true);
  let showPinyin = $state(true);
  let showTranslation = $state(true);
  let expandRepeats = $state(false);
  let showBackToTop = $state(false);
  let bouncedSectionAnchor = $state('');
  let returnRepeatAnchor = $state('');
  let returnTargetAnchor = $state('');

  let normalizedQuery = $derived(normalizeSearch(query));
  let filteredSongs = $derived.by(() => {
    const matches = normalizedQuery
      ? songs.filter((song) => normalizeSearch(songListSearchText(song)).includes(normalizedQuery))
      : songs;

    return [...matches].sort((a, b) => Number(isVerifiedSong(b)) - Number(isVerifiedSong(a)));
  });
  let selectedSong = $derived(songs.find((song) => song.id === selectedId) ?? songs[0] ?? null);
  onMount(() => {
    const scrollRoot = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
    const savedSong = window.localStorage.getItem(SELECTED_SONG_KEY);
    const savedVerifiedSongs = window.localStorage.getItem(CUSTOM_VERIFIED_SONGS_KEY);
    const savedUnverifiedSongs = window.localStorage.getItem(CUSTOM_UNVERIFIED_SONGS_KEY);
    const initialSong = savedSong && songs.some((song) => song.id === savedSong) ? savedSong : null;

    if (!data.selectedId && initialSong) selectedId = initialSong;
    if (savedVerifiedSongs) {
      try {
        const parsed = JSON.parse(savedVerifiedSongs);
        if (Array.isArray(parsed)) {
          customVerifiedSongIds = new Set(
            parsed.filter((id): id is string => typeof id === 'string')
          );
        }
      } catch {
        window.localStorage.removeItem(CUSTOM_VERIFIED_SONGS_KEY);
      }
    }
    if (savedUnverifiedSongs) {
      try {
        const parsed = JSON.parse(savedUnverifiedSongs);
        if (Array.isArray(parsed)) {
          customUnverifiedSongIds = new Set(
            parsed.filter((id): id is string => typeof id === 'string')
          );
        }
      } catch {
        window.localStorage.removeItem(CUSTOM_UNVERIFIED_SONGS_KEY);
      }
    }

    function updateBackToTopVisibility() {
      const scrollTop =
        scrollRoot?.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      showBackToTop = isMobile && scrollTop > 400;
    }

    updateBackToTopVisibility();
    (scrollRoot ?? window).addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    window.addEventListener('resize', updateBackToTopVisibility);

    return () => {
      (scrollRoot ?? window).removeEventListener('scroll', updateBackToTopVisibility);
      window.removeEventListener('resize', updateBackToTopVisibility);
    };
  });

  function normalizeSearch(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[üǖǘǚǜ]/g, 'u')
      .replace(/[^a-z0-9\p{Script=Han}]+/gu, '')
      .trim();
  }

  function songListSearchText(song: LyricSong) {
    return [
      song.id,
      song.titlePinyin,
      song.titleHanzi,
      song.titleEnglish,
      song.singer,
      song.singerHanzi,
      song.singerPinyin,
      song.tags.join(' ')
    ].join(' ');
  }

  function isSongIdVerified(songId: string) {
    return (
      (VERIFIED_SONG_IDS.has(songId) || customVerifiedSongIds.has(songId)) &&
      !customUnverifiedSongIds.has(songId)
    );
  }

  function isVerifiedSong(song: LyricSong) {
    return isSongIdVerified(song.id);
  }

  function persistVerificationOverrides() {
    window.localStorage.setItem(
      CUSTOM_VERIFIED_SONGS_KEY,
      JSON.stringify([...customVerifiedSongIds])
    );
    window.localStorage.setItem(
      CUSTOM_UNVERIFIED_SONGS_KEY,
      JSON.stringify([...customUnverifiedSongIds])
    );
  }

  function setSongVerified(songId: string, verified: boolean) {
    const nextVerified = new Set(customVerifiedSongIds);
    const nextUnverified = new Set(customUnverifiedSongIds);

    if (verified) {
      nextVerified.add(songId);
      nextUnverified.delete(songId);
    } else {
      nextVerified.delete(songId);
      nextUnverified.add(songId);
    }

    customVerifiedSongIds = nextVerified;
    customUnverifiedSongIds = nextUnverified;
    persistVerificationOverrides();
  }

  function toggleSongVerified(songId: string) {
    setSongVerified(songId, !isSongIdVerified(songId));
  }

  function compactSingerTitle(song: LyricSong) {
    const hanziLength = [...song.singerHanzi].filter((char) => !/\s|[-,，、&]/u.test(char)).length;
    return hanziLength > 4 || song.singer.length > 28;
  }

  function titleHanziLength(value: string) {
    return [...value].filter((char) => !/\s|[-,，、&]/u.test(char)).length;
  }

  function singerOnSecondTitleLine(song: LyricSong) {
    return titleHanziLength(song.titleHanzi) + titleHanziLength(song.singerHanzi) > 7;
  }

  function compactSingerInHeader(song: LyricSong) {
    return compactSingerTitle(song) || singerOnSecondTitleLine(song);
  }

  function selectSong(songId: string, closeSongList = true) {
    selectedId = songId;
    if (closeSongList) songListOpen = false;
    window.localStorage.setItem(SELECTED_SONG_KEY, songId);

    const url = new URL(window.location.href);
    url.searchParams.set('song', songId);
    window.history.replaceState({}, '', url);
  }

  function selectSongFromDesktopList(songId: string) {
    if (selectedId !== songId) {
      selectSong(songId);
      songClickCounts = {};
      return;
    }

    selectSong(songId);

    const clicks = (songClickCounts[songId] ?? 0) + 1;
    if (clicks >= 3) {
      toggleSongVerified(songId);
      songClickCounts = { ...songClickCounts, [songId]: 0 };
      return;
    }

    songClickCounts = { ...songClickCounts, [songId]: clicks };
  }

  function verifySongFromMobileIcon(event: Event, songId: string) {
    event.stopPropagation();
    toggleSongVerified(songId);
    selectSong(songId, false);
  }

  function openImportModal() {
    standardizeError = '';
    importModalOpen = true;
  }

  function toggleHanzi() {
    if (showHanzi && !showPinyin) return;
    showHanzi = !showHanzi;
  }

  function togglePinyin() {
    if (showPinyin && !showHanzi) return;
    showPinyin = !showPinyin;
  }

  function scrollToTop() {
    const scrollRoot = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
    if (scrollRoot) {
      scrollRoot.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToSection(anchor: string) {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function jumpToRepeatedSection(event: MouseEvent, song: LyricSong, repeat: LyricSection) {
    if (!repeat.repeatOf) return;
    event.preventDefault();

    const targetAnchor = sectionAnchor(song, repeat.repeatOf);
    const repeatAnchor = sectionAnchor(song, repeat.id);

    returnRepeatAnchor = repeatAnchor;
    returnTargetAnchor = targetAnchor;
    bouncedSectionAnchor = '';

    requestAnimationFrame(() => {
      scrollToSection(targetAnchor);
      bouncedSectionAnchor = targetAnchor;
      window.setTimeout(() => {
        if (bouncedSectionAnchor === targetAnchor) bouncedSectionAnchor = '';
      }, 900);
    });
  }

  function goBackToRepeat() {
    const target = returnRepeatAnchor;
    returnRepeatAnchor = '';
    returnTargetAnchor = '';
    if (target) scrollToSection(target);
  }

  function sectionAnchor(song: LyricSong, sectionId: string) {
    return `${song.id}-${sectionId}`;
  }

  function findSection(song: LyricSong, sectionId: string): LyricSection | undefined {
    return song.sections.find((section) => section.id === sectionId);
  }

  function sectionLabelText(section: LyricSection) {
    return section.label.toUpperCase().replace(/(\d+)X$/u, '$1x');
  }

  function pinyinSyllables(pinyin: string, sourceText = '') {
    const syllables = pinyin
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => !/^[-–—]+$/u.test(part))
      .filter(Boolean);

    const hanziCount = [...sourceText].filter((char) => HAN_RE.test(char)).length;
    const hasFusedSyllable = syllables.some((part) => [...part.matchAll(TONE_MARK_RE)].length > 1);
    if (!sourceText || !hanziCount || (syllables.length >= hanziCount && !hasFusedSyllable)) {
      return syllables;
    }

    const hanziOnly = [...sourceText].map((char) => (HAN_RE.test(char) ? char : ' ')).join('');
    return makePinyin(hanziOnly, { toneType: 'symbol' })
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part, index) =>
        index === 0 ? part.charAt(0).toLocaleUpperCase() + part.slice(1) : part
      );
  }

  function hasHanzi(value: string) {
    return HAN_RE.test(value);
  }

  function splitLyricParts(hanzi: string, pinyin: string): LyricPart[] {
    const parts: LyricPart[] = [];
    const regex = /[（(][^）)]*(?:[）)]|$)/gu;
    let lastIndex = 0;

    for (const match of hanzi.matchAll(regex)) {
      const index = match.index ?? 0;
      const before = hanzi.slice(lastIndex, index).trim();
      let aside = match[0].trim();

      if (/^[（(]/u.test(aside) && !/[）)]$/u.test(aside)) {
        aside += aside.startsWith('（') ? '）' : ')';
      }

      if (before) parts.push({ text: before, pinyin: '', aside: false });
      if (aside) parts.push({ text: aside, pinyin: '', aside: true });
      lastIndex = index + match[0].length;
    }

    const rest = hanzi.slice(lastIndex).trim();
    if (rest) parts.push({ text: rest, pinyin: '', aside: false });

    if (parts.length === 0) return [{ text: hanzi, pinyin, aside: false }];

    let syllableIndex = 0;
    const syllables = pinyinSyllables(pinyin, hanzi);

    return parts.map((part) => {
      const hanziCount = [...part.text].filter((char) => HAN_RE.test(char)).length;
      const partPinyin = syllables.slice(syllableIndex, syllableIndex + hanziCount).join(' ');
      syllableIndex += hanziCount;

      return {
        ...part,
        pinyin: partPinyin
      };
    });
  }

  function lyricPhrases(text: string, pinyin: string): LyricPhrase[] {
    const phrases = text
      .trim()
      .split(/\s+/)
      .map((phrase) => phrase.trim())
      .filter(Boolean);

    if (phrases.length <= 1) return [{ text, pinyin }];

    let syllableIndex = 0;
    const syllables = pinyinSyllables(pinyin, text);

    return phrases.map((phrase) => {
      const hanziCount = [...phrase].filter((char) => HAN_RE.test(char)).length;
      const phrasePinyin = syllables.slice(syllableIndex, syllableIndex + hanziCount).join(' ');
      syllableIndex += hanziCount;

      return {
        text: phrase,
        pinyin: phrasePinyin
      };
    });
  }

  function lyricTokens(hanzi: string, pinyin: string): LyricToken[] {
    const syllables = pinyinSyllables(pinyin, hanzi);
    let syllableIndex = 0;
    const tokens: LyricToken[] = [];
    const chars = [...hanzi];

    for (let index = 0; index < chars.length; index += 1) {
      const char = chars[index];
      const spacer = /\s/u.test(char);
      const punct = PUNCT_RE.test(char);

      if (spacer) {
        tokens.push({ hanzi: char, pinyin: '', kind: 'space' });
        continue;
      }

      if (HAN_RE.test(char)) {
        tokens.push({ hanzi: char, pinyin: syllables[syllableIndex++] ?? '', kind: 'hanzi' });
        continue;
      }

      if (LATIN_RE.test(char)) {
        let text = char;
        while (LATIN_RE.test(chars[index + 1] ?? '')) {
          text += chars[++index];
        }
        tokens.push({ hanzi: text, pinyin: '', kind: 'latin' });
        continue;
      }

      tokens.push({ hanzi: char, pinyin: '', kind: punct ? 'punct' : 'latin' });
    }

    return tokens;
  }

  async function pollImportJob(jobId: string) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 700 : 2500));

      const response = await fetch(`/api/chinese-song-lyrics/import/status/${jobId}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? 'Could not read import status.');
      }

      if (data.status === 'completed' && data.songSlug) {
        rawSongInput = '';
        await goto(`/tools/chinese-game/lyrics?song=${encodeURIComponent(data.songSlug)}`, {
          invalidateAll: true
        });
        importModalOpen = false;
        return;
      }

      if (data.status === 'failed') {
        throw new Error(data.error ?? 'Song import failed.');
      }
    }

    throw new Error('Song import is still running. Check again in a moment.');
  }

  async function submitStandardizeSong(event: SubmitEvent) {
    event.preventDefault();
    if (standardizing) return;

    standardizing = true;
    standardizeError = '';

    try {
      const response = await fetch('/api/chinese-song-lyrics/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawSong: rawSongInput })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? 'Could not start song import.');
      }

      await pollImportJob(data.jobId);
    } catch (err) {
      standardizeError = err instanceof Error ? err.message : 'Could not standardize this song.';
    } finally {
      standardizing = false;
    }
  }
</script>

{#snippet lyricText(text: string, pinyin: string, compact = false)}
  <span
    class="text-cork-950 flex flex-wrap items-start {compact
      ? 'gap-x-0.5 gap-y-1.5'
      : 'gap-x-1 gap-y-2'}"
    class:opacity-85={compact}
  >
    {#each lyricTokens(text, pinyin) as token, tokenIndex (tokenIndex)}
      {#if token.kind === 'space'}
        <span class={compact ? 'w-2' : 'w-3 md:w-5'} aria-hidden="true"></span>
      {:else if token.kind === 'latin'}
        {#if showHanzi}
          <span
            class="inline-flex min-w-fit items-start px-1 leading-none font-medium tracking-normal text-cork-900 {compact
              ? 'text-base md:text-2xl'
              : 'text-xl md:text-3xl'}"
          >
            {token.hanzi}
          </span>
        {/if}
      {:else}
        <span
          class="inline-flex flex-col items-center {compact
            ? 'min-w-[1.75rem] md:min-w-[1.65rem]'
            : 'min-w-[2rem] md:min-w-[1.9rem]'} {token.kind === 'punct'
            ? 'min-w-1.5 md:min-w-2'
            : ''}"
        >
          {#if showHanzi}
            <span
              class="font-chinese leading-none {compact
                ? 'text-lg md:text-2xl'
                : 'text-[1.65rem] md:text-3xl'}"
              class:font-sans={token.kind === 'punct'}
            >
              {token.hanzi}
            </span>
          {/if}
          {#if showPinyin && token.kind === 'hanzi'}
            <span
              class="{showHanzi
                ? 'mt-1'
                : ''} max-w-[4.2rem] text-center leading-tight font-semibold break-words text-red-800 {compact
                ? 'text-xs md:text-sm'
                : 'text-sm md:text-base'}"
            >
              {token.pinyin}
            </span>
          {/if}
        </span>
      {/if}
    {/each}
  </span>
{/snippet}

{#snippet mobileLyricText(text: string, pinyin: string, compact = false)}
  <p
    class="text-cork-950 flex flex-wrap items-start {compact
      ? 'gap-x-3 gap-y-2'
      : 'gap-x-4 gap-y-3'}"
    class:opacity-85={compact}
  >
    {#each lyricPhrases(text, pinyin) as phrase, phraseIndex (phraseIndex)}
      <span class="inline-flex max-w-full shrink-0">
        {@render lyricText(phrase.text, phrase.pinyin, compact)}
      </span>
    {/each}
  </p>
{/snippet}

{#snippet titleHanziText(text: string, pinyin: string, mobile = false, compact = false)}
  <span
    class="text-cork-950 inline-flex max-w-full flex-wrap items-start justify-start text-left {mobile
      ? compact
        ? 'gap-x-0.5 gap-y-1.5'
        : 'gap-x-0.5 gap-y-2'
      : compact
        ? 'gap-x-1 gap-y-2.5'
        : 'gap-x-1 gap-y-3'}"
  >
    {#each lyricTokens(text, pinyin) as token, tokenIndex (tokenIndex)}
      {#if token.kind === 'space'}
        <span
          class={mobile ? (compact ? 'w-1.5' : 'w-2.5') : compact ? 'w-3' : 'w-5'}
          aria-hidden="true"
        ></span>
      {:else}
        <span
          class="inline-flex flex-col items-center text-center {mobile
            ? compact
              ? 'min-w-[1.45rem]'
              : 'min-w-[2.05rem]'
            : compact
              ? 'min-w-[2.7rem]'
              : 'min-w-[4rem]'} {token.kind !== 'hanzi'
            ? mobile
              ? compact
                ? 'min-w-2'
                : 'min-w-4'
              : compact
                ? 'min-w-4'
                : 'min-w-8'
            : ''}"
        >
          <span
            class="font-chinese leading-none font-black {mobile
              ? compact
                ? 'text-3xl'
                : 'text-4xl'
              : compact
                ? 'text-5xl'
                : 'text-7xl'}"
            class:font-sans={token.kind !== 'hanzi'}
          >
            {token.hanzi}
          </span>
          {#if showPinyin && token.kind === 'hanzi'}
            <span
              class="text-cork-600 {mobile
                ? compact
                  ? 'mt-1 max-w-[3rem] text-xs'
                  : 'mt-1.5 max-w-[4rem] text-sm'
                : compact
                  ? 'mt-1.5 max-w-[4rem] text-sm'
                  : 'mt-2 max-w-[5rem] text-base'} text-center leading-tight font-semibold break-words"
            >
              {token.pinyin}
            </span>
          {/if}
        </span>
      {/if}
    {/each}
  </span>
{/snippet}

{#snippet lyricLines(lines: LyricLine[] = [])}
  <div class="space-y-6">
    {#each lines as line, lineIndex (lineIndex)}
      <div>
        {#if hasHanzi(line.hanzi)}
          <div class="hidden md:block">
            {@render lyricText(line.hanzi, line.pinyin)}
          </div>
          <div class="space-y-2 md:hidden">
            {#each splitLyricParts(line.hanzi, line.pinyin) as part, partIndex (partIndex)}
              <div class={part.aside ? 'ml-2 border-l border-cork-300/70 pl-2.5' : ''}>
                {@render mobileLyricText(part.text, part.pinyin, part.aside)}
              </div>
            {/each}
          </div>
        {:else if showHanzi}
          <p class="text-cork-950 text-2xl leading-snug font-semibold md:text-3xl">
            {line.hanzi}
          </p>
        {/if}
        {#if showTranslation && line.english.trim()}
          <p class="mt-2 max-w-2xl text-base leading-relaxed text-cork-700">
            {line.english}
          </p>
        {/if}
      </div>
    {/each}
  </div>
{/snippet}

<svelte:head>
  <title>Chinese Song Lyrics | Produck</title>
</svelte:head>

<div class="game-container">
  <InkWashBg />

  <main class="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-4 md:px-6">
    <header class="mb-6">
      <a
        href="/tools/chinese-game"
        class="mb-2 inline-flex items-center gap-1 text-xs text-cork-400 transition-colors hover:text-cork-600"
      >
        <ArrowLeft class="size-3" />Hanzi Game
      </a>

      <div class="flex items-end justify-between gap-3">
        <div class="min-w-0">
          <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Chinese Song Lyrics</h1>
          <p class="mt-0.5 text-sm text-cork-500">Learn songs line by line</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2 md:hidden">
        <button
          type="button"
          class="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cork-300/70 bg-cork-50/80 px-3 text-sm font-semibold text-cork-700 transition hover:bg-cork-100"
          onclick={openImportModal}
        >
          <WandSparkles class="size-4" />
          Import
        </button>
        <button
          type="button"
          class="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cork-300/70 bg-cork-50/80 px-3 text-sm font-semibold text-cork-700 transition hover:bg-cork-100"
          onclick={() => (songListOpen = true)}
        >
          <ListMusic class="size-4" />
          Songs
        </button>
      </div>

      <div class="mt-2 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 md:hidden">
        <button
          type="button"
          class="cursor-pointer rounded-md border px-2 py-1.5 text-xs font-semibold transition {showHanzi
            ? 'border-cork-300 bg-cork-100 text-cork-800'
            : 'border-cork-200 bg-transparent text-cork-500'} disabled:cursor-not-allowed disabled:opacity-45"
          aria-pressed={showHanzi}
          aria-disabled={showHanzi && !showPinyin}
          disabled={showHanzi && !showPinyin}
          onclick={toggleHanzi}
        >
          Hanzi
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md border px-2 py-1.5 text-xs font-semibold transition {showPinyin
            ? 'border-cork-300 bg-cork-100 text-cork-800'
            : 'border-cork-200 bg-transparent text-cork-500'} disabled:cursor-not-allowed disabled:opacity-45"
          aria-pressed={showPinyin}
          aria-disabled={showPinyin && !showHanzi}
          disabled={showPinyin && !showHanzi}
          onclick={togglePinyin}
        >
          Pinyin
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md border px-2 py-1.5 text-xs font-semibold transition {showTranslation
            ? 'border-cork-300 bg-cork-100 text-cork-800'
            : 'border-cork-200 bg-transparent text-cork-500'}"
          aria-pressed={showTranslation}
          onclick={() => (showTranslation = !showTranslation)}
        >
          English
        </button>
        <button
          type="button"
          class="flex aspect-square h-full cursor-pointer items-center justify-center bg-transparent transition {expandRepeats
            ? 'text-red-800'
            : 'text-cork-500'}"
          aria-label={expandRepeats ? 'Use clickable repeat markers' : 'Expand repeated lyrics'}
          title={expandRepeats ? 'Use repeat markers' : 'Expand repeats'}
          aria-pressed={expandRepeats}
          onclick={() => (expandRepeats = !expandRepeats)}
        >
          <Expand class="size-4" />
        </button>
      </div>
    </header>

    {#if importModalOpen}
      <div class="fixed inset-0 z-50">
        <button
          type="button"
          class="bg-cork-950/40 absolute inset-0 cursor-default backdrop-blur-sm"
          aria-label="Close import song modal"
          onclick={() => {
            if (!standardizing) importModalOpen = false;
          }}
          transition:fade={{ duration: 160 }}
        ></button>
        <div
          class="shadow-cork-950/25 absolute top-1/2 left-1/2 flex max-h-[88dvh] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-cork-300 bg-cork-50 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="standardize-song-title"
          transition:fly={{ y: 18, duration: 180 }}
        >
          <div class="flex items-center justify-between border-b border-cork-200 px-4 py-3">
            <div class="min-w-0">
              <h2 id="standardize-song-title" class="text-cork-950 text-base font-semibold">
                Standardize Song
              </h2>
              <p class="mt-0.5 text-xs text-cork-500">DeepSeek v4 Flash</p>
            </div>
            <button
              type="button"
              class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-cork-500 transition hover:bg-cork-200 hover:text-cork-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close import song modal"
              disabled={standardizing}
              onclick={() => (importModalOpen = false)}
            >
              <X class="size-4" />
            </button>
          </div>

          <form class="flex min-h-0 flex-1 flex-col p-4" onsubmit={submitStandardizeSong}>
            <textarea
              name="rawSong"
              bind:value={rawSongInput}
              required
              minlength="20"
              class="text-cork-950 min-h-[18rem] flex-1 resize-none rounded-lg border-cork-300/80 bg-white/75 p-3 font-mono text-sm leading-relaxed placeholder:text-cork-400 focus:border-cork-600 focus:ring-cork-600"
              placeholder="Paste title, artist, and all lyrics here..."
              aria-label="Song title and lyrics"
              disabled={standardizing}
            ></textarea>

            {#if standardizeError}
              <p
                class="mt-3 rounded-md border border-red-900/20 bg-red-50 px-3 py-2 text-sm text-red-900"
              >
                {standardizeError}
              </p>
            {/if}
            <div class="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                class="h-10 cursor-pointer rounded-lg border border-cork-300/70 bg-cork-50 px-3 text-sm font-semibold text-cork-700 transition hover:bg-cork-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={standardizing}
                onclick={() => (importModalOpen = false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-red-950/20 bg-red-900 px-3 text-sm font-semibold text-cork-50 shadow-sm shadow-red-950/15 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-65"
                disabled={standardizing}
              >
                {#if standardizing}
                  <LoaderCircle class="size-4 animate-spin" />
                  Standardizing
                {:else}
                  Standardize
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    {#if songListOpen}
      <div class="fixed inset-0 z-50 md:hidden">
        <button
          type="button"
          class="bg-cork-950/35 absolute inset-0 cursor-default backdrop-blur-sm"
          aria-label="Close song list"
          onclick={() => (songListOpen = false)}
          transition:fade={{ duration: 160 }}
        ></button>
        <div
          class="absolute right-3 bottom-3 left-3 max-h-[78dvh] overflow-hidden rounded-lg border border-cork-300 bg-cork-50 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Choose a song"
          transition:fly={{ y: 28, duration: 180 }}
        >
          <div class="flex items-center justify-between border-b border-cork-200 px-4 py-3">
            <p class="font-semibold text-cork-900">Songs</p>
            <button
              type="button"
              class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-cork-500 transition hover:bg-cork-200 hover:text-cork-800"
              aria-label="Close song list"
              onclick={() => (songListOpen = false)}
            >
              <X class="size-4" />
            </button>
          </div>

          <div class="p-3">
            <div class="relative">
              <Search
                class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cork-500"
              />
              <input
                bind:value={query}
                type="search"
                placeholder="Search songs..."
                class="lyrics-search h-10 w-full rounded-lg border-cork-300/80 bg-white/70 pr-3 pl-10 text-base text-cork-900 placeholder:text-cork-500 focus:border-cork-600 focus:ring-cork-600"
                aria-label="Search songs"
              />
            </div>
          </div>

          <div class="max-h-[calc(78dvh-7.5rem)] overflow-y-auto p-2">
            {#if filteredSongs.length === 0}
              <p class="px-2 py-3 text-sm text-cork-600">No songs found.</p>
            {:else}
              {#each filteredSongs as song (song.id)}
                {@const active = selectedSong?.id === song.id}
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition {active
                    ? 'text-cork-950 bg-cork-200'
                    : 'text-cork-800 hover:bg-cork-100'}"
                  aria-pressed={active}
                  onclick={() => selectSong(song.id)}
                >
                  <Music2
                    class="size-4 shrink-0 {isVerifiedSong(song)
                      ? 'text-yellow-600'
                      : 'text-cork-500'}"
                    aria-label={`Verify ${song.titleHanzi}`}
                    onclick={(event) => verifySongFromMobileIcon(event, song.id)}
                  />
                  <span class="min-w-0">
                    <span
                      class="font-chinese block truncate text-base font-bold {isVerifiedSong(song)
                        ? 'text-yellow-600 drop-shadow-[0_0_4px_rgba(202,138,4,0.22)]'
                        : ''}"
                    >
                      {song.titleHanzi}
                    </span>
                    <span class="block truncate text-xs text-cork-500">
                      {song.singer} · {song.singerHanzi}
                    </span>
                  </span>
                </button>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <div class="grid flex-1 gap-8 pb-10 md:grid-cols-[17rem_minmax(0,1fr)] md:items-start">
      <aside class="hidden min-w-0 md:sticky md:top-20 md:block">
        <div class="rounded-lg border border-cork-300/60 bg-cork-50/70 p-3 shadow-sm">
          <div class="relative">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cork-500"
            />
            <input
              bind:value={query}
              type="search"
              placeholder="Search songs..."
              class="lyrics-search h-10 w-full rounded-lg border-cork-300/80 bg-cork-50/80 pr-3 pl-10 text-sm text-cork-900 placeholder:text-cork-500 focus:border-cork-600 focus:ring-cork-600"
              aria-label="Search songs and lyrics"
            />
          </div>

          <div class="mt-3 grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <button
              type="button"
              class="cursor-pointer rounded-md border px-2 py-1.5 text-xs font-semibold transition {showHanzi
                ? 'border-cork-300 bg-cork-100 text-cork-800'
                : 'border-cork-200 bg-transparent text-cork-500 hover:bg-cork-100/70'} disabled:cursor-not-allowed disabled:opacity-45"
              aria-pressed={showHanzi}
              aria-disabled={showHanzi && !showPinyin}
              disabled={showHanzi && !showPinyin}
              onclick={toggleHanzi}
            >
              Hanzi
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-md border px-2 py-1.5 text-xs font-semibold transition {showPinyin
                ? 'border-cork-300 bg-cork-100 text-cork-800'
                : 'border-cork-200 bg-transparent text-cork-500 hover:bg-cork-100/70'} disabled:cursor-not-allowed disabled:opacity-45"
              aria-pressed={showPinyin}
              aria-disabled={showPinyin && !showHanzi}
              disabled={showPinyin && !showHanzi}
              onclick={togglePinyin}
            >
              Pinyin
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-md border px-2 py-1.5 text-xs font-semibold transition {showTranslation
                ? 'border-cork-300 bg-cork-100 text-cork-800'
                : 'border-cork-200 bg-transparent text-cork-500 hover:bg-cork-100/70'}"
              aria-pressed={showTranslation}
              onclick={() => (showTranslation = !showTranslation)}
            >
              English
            </button>
            <button
              type="button"
              class="flex aspect-square h-full cursor-pointer items-center justify-center bg-transparent transition {expandRepeats
                ? 'text-red-800'
                : 'text-cork-500 hover:text-cork-800'}"
              aria-label={expandRepeats ? 'Use clickable repeat markers' : 'Expand repeated lyrics'}
              title={expandRepeats ? 'Use repeat markers' : 'Expand repeats'}
              aria-pressed={expandRepeats}
              onclick={() => (expandRepeats = !expandRepeats)}
            >
              <Expand class="size-4" />
            </button>
          </div>

          <div
            class="song-list-scroll mt-3 flex max-h-[calc(100dvh-18rem)] flex-col gap-1 overflow-y-auto pr-1.5"
          >
            {#if filteredSongs.length === 0}
              <p class="px-2 py-3 text-sm text-cork-600">No songs found.</p>
            {:else}
              {#each filteredSongs as song (song.id)}
                {@const active = selectedSong?.id === song.id}
                <button
                  type="button"
                  class="group cursor-pointer rounded-lg border px-3 py-2.5 text-left transition {active
                    ? 'text-cork-950 border-cork-300 bg-cork-50 shadow-sm shadow-cork-900/10'
                    : 'border-transparent text-cork-700 hover:border-cork-200 hover:bg-cork-100/70'}"
                  aria-pressed={active}
                  onclick={() => selectSongFromDesktopList(song.id)}
                >
                  <span class="flex items-stretch gap-3">
                    <span
                      class="w-0.5 rounded-full transition {active
                        ? 'bg-red-800'
                        : 'bg-transparent group-hover:bg-cork-300'}"
                      aria-hidden="true"
                    ></span>
                    <span class="min-w-0 flex-1">
                      <span class="flex items-center justify-between gap-2">
                        <span
                          class="font-chinese truncate text-sm font-semibold {isVerifiedSong(song)
                            ? 'text-yellow-600 drop-shadow-[0_0_4px_rgba(202,138,4,0.22)]'
                            : ''}"
                        >
                          {song.titleHanzi}
                        </span>
                        {#if active}
                          <Music2 class="size-3.5 shrink-0 text-red-800" />
                        {/if}
                      </span>
                      <span class="font-chinese mt-1 block truncate text-xs text-cork-400">
                        {song.singerHanzi}
                      </span>
                    </span>
                  </span>
                </button>
              {/each}
            {/if}
          </div>
        </div>

        <button
          type="button"
          class="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cork-300/70 bg-cork-50/80 px-3 text-sm font-semibold text-cork-700 transition hover:bg-cork-100"
          onclick={openImportModal}
        >
          <WandSparkles class="size-4" />
          Import
        </button>
      </aside>

      {#if selectedSong}
        <article class="max-w-3xl min-w-0 overflow-hidden">
          <header class="mb-6 md:mb-8">
            <h2
              class="text-cork-950 mt-1 flex flex-wrap items-start justify-start gap-x-4 gap-y-3 text-left md:hidden"
            >
              <span class="max-w-full min-w-0">
                {@render titleHanziText(selectedSong.titleHanzi, selectedSong.titlePinyin, true)}
              </span>
              <span class="text-cork-950 font-sans text-4xl leading-none font-black">-</span>
              <span
                class={singerOnSecondTitleLine(selectedSong)
                  ? 'max-w-full min-w-0 basis-full'
                  : compactSingerInHeader(selectedSong)
                    ? 'max-w-full min-w-0'
                    : 'shrink-0'}
              >
                {@render titleHanziText(
                  selectedSong.singerHanzi,
                  selectedSong.singerPinyin,
                  true,
                  compactSingerInHeader(selectedSong)
                )}
              </span>
            </h2>
            <h2
              class="text-cork-950 mt-2 hidden max-w-full flex-wrap items-start justify-start gap-x-8 gap-y-5 overflow-hidden text-left md:flex"
            >
              <span class="max-w-full min-w-0">
                {@render titleHanziText(selectedSong.titleHanzi, selectedSong.titlePinyin)}
              </span>
              <span class="text-cork-950 shrink-0 font-sans text-7xl leading-none font-black"
                >-</span
              >
              <span
                class={singerOnSecondTitleLine(selectedSong)
                  ? 'max-w-full min-w-0 basis-full'
                  : compactSingerInHeader(selectedSong)
                    ? 'max-w-full min-w-0'
                    : 'shrink-0'}
              >
                {@render titleHanziText(
                  selectedSong.singerHanzi,
                  selectedSong.singerPinyin,
                  false,
                  compactSingerInHeader(selectedSong)
                )}
              </span>
            </h2>
            <div class="mt-3 space-y-1 text-base text-cork-600 md:mt-4">
              <p class="max-w-full [overflow-wrap:anywhere] break-words">
                {selectedSong.titleEnglish} - {selectedSong.singer}
              </p>
            </div>
          </header>

          <div class="space-y-10 border-t border-cork-300/70 pt-6 md:pt-8">
            {#each selectedSong.sections as section, sectionIndex (sectionIndex)}
              {@const currentAnchor = sectionAnchor(selectedSong, section.id)}
              <section
                id={currentAnchor}
                class="scroll-mt-28 md:scroll-mt-32 {bouncedSectionAnchor === currentAnchor
                  ? 'repeat-target-bounce'
                  : ''}"
              >
                {#if section.repeatOf && !expandRepeats}
                  {@const target = findSection(selectedSong, section.repeatOf)}
                  <a
                    href={`#${sectionAnchor(selectedSong, section.repeatOf)}`}
                    class="inline-flex text-xs font-semibold tracking-[0.14em] text-cork-500 underline decoration-cork-400/50 decoration-dotted underline-offset-4 transition hover:text-cork-900 hover:decoration-cork-800"
                    aria-label={`Jump to ${target?.label ?? 'repeated section'}`}
                    onclick={(event) => jumpToRepeatedSection(event, selectedSong, section)}
                  >
                    {sectionLabelText(section)}
                  </a>
                {:else}
                  {@const expandedSection = section.repeatOf
                    ? findSection(selectedSong, section.repeatOf)
                    : section}
                  <div class="mb-4 flex flex-wrap items-center gap-3">
                    <p class="text-xs font-semibold tracking-[0.14em] text-cork-500">
                      {sectionLabelText(section)}
                    </p>
                    {#if returnTargetAnchor === currentAnchor && !expandRepeats}
                      <button
                        type="button"
                        class="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-cork-300/70 bg-cork-50/80 text-cork-600 shadow-sm transition hover:bg-cork-100 hover:text-cork-900"
                        aria-label="Back to repeat marker"
                        title="Back to repeat marker"
                        onclick={goBackToRepeat}
                      >
                        <CornerDownLeft class="size-3.5" />
                      </button>
                    {/if}
                  </div>
                  {@render lyricLines(expandedSection?.lines ?? [])}
                {/if}
              </section>
            {/each}
          </div>
        </article>
      {:else}
        <section class="p-8 text-center text-cork-600">Try a different search.</section>
      {/if}
    </div>
  </main>

  {#if showBackToTop}
    <button
      type="button"
      class="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[100] flex size-11 cursor-pointer items-center justify-center rounded-full border border-cork-300 bg-cork-50/95 text-cork-800 shadow-lg shadow-cork-900/15 backdrop-blur transition hover:bg-cork-100 md:hidden"
      aria-label="Back to top"
      onclick={scrollToTop}
      transition:fly={{ y: 12, duration: 160 }}
    >
      <ArrowUp class="size-5" />
    </button>
  {/if}
</div>

<style>
  .lyrics-search::-webkit-search-cancel-button {
    cursor: pointer;
    filter: grayscale(1) sepia(0.18) saturate(0.45) hue-rotate(350deg);
    opacity: 0.65;
  }

  .lyrics-search::-webkit-search-cancel-button:hover {
    opacity: 0.95;
  }

  .song-list-scroll {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in oklab, var(--color-cork-500) 62%, transparent)
      color-mix(in oklab, var(--color-cork-200) 35%, transparent);
  }

  .song-list-scroll::-webkit-scrollbar {
    width: 0.45rem;
  }

  .song-list-scroll::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }

  .song-list-scroll::-webkit-scrollbar-track {
    border-radius: 999px;
    background: color-mix(in oklab, var(--color-cork-100) 35%, transparent);
  }

  .song-list-scroll::-webkit-scrollbar-thumb {
    min-height: 3rem;
    border: 1px solid transparent;
    border-radius: 999px;
    background: color-mix(in oklab, var(--color-cork-500) 55%, transparent);
    background-clip: padding-box;
  }

  .song-list-scroll::-webkit-scrollbar-thumb:hover {
    background: color-mix(in oklab, var(--color-cork-700) 72%, transparent);
    background-clip: padding-box;
  }

  .repeat-target-bounce {
    animation: repeat-target-bounce 0.72s ease-out;
  }

  @keyframes repeat-target-bounce {
    0% {
      transform: translateY(0);
      background: transparent;
    }
    28% {
      transform: translateY(-8px);
      background: color-mix(in oklab, var(--color-cork-200) 45%, transparent);
      box-shadow: 0 0 0 10px color-mix(in oklab, var(--color-cork-200) 25%, transparent);
    }
    52% {
      transform: translateY(2px);
    }
    76% {
      transform: translateY(-3px);
    }
    100% {
      transform: translateY(0);
      background: transparent;
      box-shadow: 0 0 0 0 transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .repeat-target-bounce {
      animation: none;
    }
  }
</style>
