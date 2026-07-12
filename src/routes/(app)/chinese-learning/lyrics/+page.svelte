<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto, replaceState } from '$app/navigation';
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
  import { compareLyricSongsByArtistAndTitle } from '$lib/data/chinese-song-lyrics.js';
  import type { LyricLine, LyricSection, LyricSong } from '$lib/data/chinese-song-lyrics.js';

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

  type DisplayLyricSong = LyricSong & {
    verified?: boolean;
  };

  const PUNCT_RE = /[-，。？、！；：—…“”‘’（）《》,.?!;:()]/u;
  const HAN_RE = /\p{Script=Han}/u;
  const LATIN_RE = /[A-Za-z0-9'’]+/u;
  const TONE_MARK_RE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ]/gu;

  let { data }: { data: PageData } = $props();
  let songs = $state<DisplayLyricSong[]>(untrack(() => data.songs as DisplayLyricSong[]));
  let query = $state('');
  let selectedId = $state(untrack(() => data.selectedId ?? data.songs[0]?.id ?? ''));
  let verifiedOverrides = $state<Record<string, boolean>>({});
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
  let mobileKeyboardInset = $state(0);
  let bouncedSectionAnchor = $state('');
  let returnRepeatAnchor = $state('');
  let returnTargetAnchor = $state('');
  let platinumCelebrationId = $state('');
  let songListHistoryOpen = false;
  let platinumCelebrationTimer: number | undefined;

  let normalizedQuery = $derived(normalizeSearch(query));
  let filteredSongs = $derived.by(() => {
    const matches = normalizedQuery
      ? songs.filter((song) => normalizeSearch(songListSearchText(song)).includes(normalizedQuery))
      : songs;

    return [...matches].sort(compareLyricSongsByArtistAndTitle);
  });
  let selectedSong = $derived(songs.find((song) => song.id === selectedId) ?? songs[0] ?? null);
  const verificationRequestIds = new Map<string, number>();
  let verificationRequestId = 0;
  let routeSelectedId = untrack(() => data.selectedId ?? '');

  $effect(() => {
    songs = (data.songs as DisplayLyricSong[]).map((song) =>
      Object.hasOwn(verifiedOverrides, song.id)
        ? { ...song, verified: verifiedOverrides[song.id] }
        : song
    );
  });

  $effect(() => {
    const nextRouteSelectedId = data.selectedId ?? '';
    if (nextRouteSelectedId && nextRouteSelectedId !== routeSelectedId) {
      routeSelectedId = nextRouteSelectedId;
      selectedId = nextRouteSelectedId;
    }
  });

  $effect(() => {
    selectedId;
    returnRepeatAnchor = '';
    returnTargetAnchor = '';
    bouncedSectionAnchor = '';
  });

  $effect(() => {
    selectedId;
    filteredSongs;
    songListOpen;
    window.requestAnimationFrame(() => {
      const targets = [
        {
          list: document.querySelector<HTMLElement>('.song-list-scroll'),
          selector: '[data-active-desktop-song="true"]',
          behavior: 'smooth' as ScrollBehavior
        },
        {
          list: songListOpen
            ? document.querySelector<HTMLElement>('.mobile-song-list-scroll')
            : null,
          selector: '[data-active-mobile-song="true"]',
          behavior: 'auto' as ScrollBehavior
        }
      ];

      for (const { list, selector, behavior } of targets) {
        const active = list?.querySelector<HTMLElement>(selector);
        if (!list || !active) continue;

        list.scrollTo({
          top: active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2,
          behavior
        });
      }
    });
  });

  onMount(() => {
    const scrollRoot = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');

    function updateBackToTopVisibility() {
      const scrollTop =
        scrollRoot?.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      showBackToTop = isMobile && scrollTop > 400;
    }

    function updateMobileKeyboardInset() {
      const viewport = window.visualViewport;
      if (!viewport || window.matchMedia('(min-width: 768px)').matches) {
        mobileKeyboardInset = 0;
        return;
      }

      mobileKeyboardInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    }

    function closeSongListFromBack() {
      if (!songListHistoryOpen) return;
      songListHistoryOpen = false;
      songListOpen = false;
    }

    updateBackToTopVisibility();
    updateMobileKeyboardInset();
    (scrollRoot ?? window).addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    window.addEventListener('resize', updateBackToTopVisibility);
    window.addEventListener('popstate', closeSongListFromBack);
    window.visualViewport?.addEventListener('resize', updateMobileKeyboardInset);
    window.visualViewport?.addEventListener('scroll', updateMobileKeyboardInset);

    return () => {
      if (platinumCelebrationTimer) window.clearTimeout(platinumCelebrationTimer);
      (scrollRoot ?? window).removeEventListener('scroll', updateBackToTopVisibility);
      window.removeEventListener('resize', updateBackToTopVisibility);
      window.removeEventListener('popstate', closeSongListFromBack);
      window.visualViewport?.removeEventListener('resize', updateMobileKeyboardInset);
      window.visualViewport?.removeEventListener('scroll', updateMobileKeyboardInset);
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

  function songListSingerText(song: LyricSong) {
    if (!song.singer) return song.singerHanzi;
    if (!song.singerHanzi || normalizeSearch(song.singer) === normalizeSearch(song.singerHanzi)) {
      return song.singer;
    }
    return `${song.singer} · ${song.singerHanzi}`;
  }

  function isVerifiedSong(song: DisplayLyricSong) {
    return verifiedOverrides[song.id] ?? song.verified === true;
  }

  function setSongVerified(songId: string, verified: boolean) {
    const requestId = (verificationRequestId += 1);
    const previousSong = songs.find((song) => song.id === songId);
    const previousOverride = verifiedOverrides[songId];
    const hadPreviousOverride = Object.hasOwn(verifiedOverrides, songId);

    verificationRequestIds.set(songId, requestId);
    songs = songs.map((song) => (song.id === songId ? { ...song, verified } : song));
    verifiedOverrides = { ...verifiedOverrides, [songId]: verified };

    void fetch(`/api/chinese-song-lyrics/verify/${encodeURIComponent(songId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? 'Could not save lyric verification.');
      })
      .catch((err) => {
        if (verificationRequestIds.get(songId) !== requestId) return;

        if (previousSong) {
          songs = songs.map((song) =>
            song.id === songId ? { ...song, verified: previousSong.verified } : song
          );
        }

        if (hadPreviousOverride) {
          verifiedOverrides = { ...verifiedOverrides, [songId]: previousOverride };
        } else {
          const next = { ...verifiedOverrides };
          delete next[songId];
          verifiedOverrides = next;
        }
        console.error('Could not save lyric verification:', err);
      });
  }

  function toggleSongVerified(songId: string) {
    const song = songs.find((item) => item.id === songId);
    if (!song) return;
    const verified = !isVerifiedSong(song);
    if (verified) celebratePlatinumSong(songId);
    void setSongVerified(songId, verified);
  }

  function celebratePlatinumSong(songId: string) {
    if (platinumCelebrationTimer) window.clearTimeout(platinumCelebrationTimer);
    platinumCelebrationId = '';
    window.requestAnimationFrame(() => {
      platinumCelebrationId = songId;
      platinumCelebrationTimer = window.setTimeout(() => {
        if (platinumCelebrationId === songId) platinumCelebrationId = '';
      }, 1100);
    });
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

  function compactTitleInHeader(song: LyricSong) {
    return titleHanziLength(song.titleHanzi) > 7 || song.titleEnglish.length > 36;
  }

  function openSongList() {
    songListOpen = true;
    if (songListHistoryOpen) return;

    const url = new URL(window.location.href);
    url.hash = 'songs';
    window.history.pushState({ ...window.history.state, songListOpen: true }, '', url);
    songListHistoryOpen = true;
  }

  function closeSongList() {
    if (!songListOpen) return;
    songListOpen = false;

    if (songListHistoryOpen) {
      songListHistoryOpen = false;
      window.history.back();
    }
  }

  function selectSong(songId: string, closeAfterSelect = true) {
    selectedId = songId;

    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('song', songId);

    if (closeAfterSelect && songListHistoryOpen) {
      songListOpen = false;
      songListHistoryOpen = false;
    } else if (closeAfterSelect) {
      songListOpen = false;
    }

    replaceState(url, {});
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

  function scrollTargetTop(element: HTMLElement, scrollRoot: HTMLElement) {
    const elementRect = element.getBoundingClientRect();
    const rootRect = scrollRoot.getBoundingClientRect();
    const scrollMarginTop = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;

    return scrollRoot.scrollTop + elementRect.top - rootRect.top - scrollMarginTop;
  }

  function scrollToSection(anchor: string) {
    const target = document.getElementById(anchor);
    if (!target) return;

    const scrollRoot = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
    if (scrollRoot) {
      scrollRoot.scrollTo({
        top: Math.max(0, scrollTargetTop(target, scrollRoot)),
        behavior: 'smooth'
      });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function jumpToRepeatedSection(event: MouseEvent, song: LyricSong, repeat: LyricSection) {
    const firstTargetId = repeat.repeatOf ?? repeat.repeatOfMany?.[0];
    if (!firstTargetId) return;
    event.preventDefault();

    const targetAnchor = sectionAnchor(song, firstTargetId);
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
    let syllables = pinyin
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => !/^[-–—]+$/u.test(part))
      .filter(Boolean);

    const hanziCount = [...sourceText].filter((char) => HAN_RE.test(char)).length;
    const latinWords = sourceText
      .match(/[A-Za-z0-9'’.-]+/gu)
      ?.map((word) => normalizeSearch(word))
      .filter(Boolean);
    if (hanziCount && latinWords?.length) {
      const latinWordCounts: Record<string, number> = {};
      for (const word of latinWords) {
        latinWordCounts[word] = (latinWordCounts[word] ?? 0) + 1;
      }

      syllables = syllables.filter((part) => {
        const word = normalizeSearch(part);
        const count = latinWordCounts[word] ?? 0;
        if (!count) return true;
        if (count === 1) delete latinWordCounts[word];
        else latinWordCounts[word] = count - 1;
        return false;
      });
    }

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
        selectedId = data.songSlug;
        query = '';
        rawSongInput = '';
        await goto(`/chinese-learning/lyrics?song=${encodeURIComponent(data.songSlug)}`, {
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
            class="{token.kind === 'hanzi'
              ? 'font-chinese'
              : 'font-sans'} leading-none font-black {mobile
              ? compact
                ? 'text-3xl'
                : 'text-4xl'
              : compact
                ? 'text-5xl'
                : 'text-7xl'}"
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
        href="/chinese-learning"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-cork-600 transition hover:text-cork-900"
      >
        <ArrowLeft class="size-3.5" /> Chinese Learning
      </a>

      <div class="mt-2 flex items-end justify-between gap-3">
        <div class="min-w-0">
          <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Chinese Song Lyrics</h1>
          <p class="mt-0.5 text-sm text-cork-500">
            Learn {songs.length} songs line by line
          </p>
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
          onclick={openSongList}
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
              <p class="mt-0.5 text-xs text-cork-500">
                Creates sections, simplified Chinese, pinyin, and English.
              </p>
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
          onclick={closeSongList}
          transition:fade={{ duration: 160 }}
        ></button>
        <div
          class="absolute right-3 left-3 flex flex-col overflow-hidden rounded-lg border border-cork-300 bg-cork-50 shadow-xl"
          style={`bottom: calc(${mobileKeyboardInset}px + 0.75rem + env(safe-area-inset-bottom)); max-height: min(78dvh, calc(100dvh - ${mobileKeyboardInset}px - 1.5rem - env(safe-area-inset-bottom)));`}
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
              onclick={closeSongList}
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
                type="text"
                placeholder="Search songs..."
                class="h-10 w-full rounded-lg border-cork-300/80 bg-white/70 pr-11 pl-10 text-base text-cork-900 placeholder:text-cork-500 focus:border-cork-600 focus:ring-cork-600"
                aria-label="Search songs"
              />
              {#if query}
                <button
                  type="button"
                  class="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-cork-500 transition hover:bg-cork-100 hover:text-cork-800"
                  aria-label="Clear song search"
                  onclick={() => (query = '')}
                >
                  <X class="size-5" />
                </button>
              {/if}
            </div>
          </div>

          <div class="mobile-song-list-scroll min-h-0 flex-1 overflow-y-auto p-2">
            {#if filteredSongs.length === 0}
              <p class="px-2 py-3 text-sm text-cork-600">No songs found.</p>
            {:else}
              {#each filteredSongs as song (song.id)}
                {@const active = selectedSong?.id === song.id}
                <button
                  type="button"
                  data-active-mobile-song={active ? 'true' : undefined}
                  class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition {active
                    ? 'text-cork-950 bg-cork-200'
                    : 'text-cork-800 hover:bg-cork-100'}"
                  aria-pressed={active}
                  onclick={() => selectSong(song.id)}
                >
                  <Music2
                    class="size-4 shrink-0 {isVerifiedSong(song)
                      ? 'text-slate-300 [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.95))_drop-shadow(0_0_7px_rgba(186,230,253,0.95))_drop-shadow(0_0_1px_rgba(15,23,42,0.75))]'
                      : 'text-cork-500'}"
                    aria-label={`Verify ${song.titleHanzi}`}
                    onclick={(event) => verifySongFromMobileIcon(event, song.id)}
                  />
                  <span class="min-w-0">
                    <span
                      class="font-chinese block truncate text-base font-bold {platinumCelebrationId ===
                      song.id
                        ? 'platinum-text-celebration'
                        : ''} {isVerifiedSong(song)
                        ? 'text-slate-500 [text-shadow:0_1px_0_rgba(255,255,255,0.95),0_0_7px_rgba(186,230,253,0.9),0_0_1px_rgba(15,23,42,0.7)]'
                        : ''}"
                    >
                      {song.titleHanzi}
                    </span>
                    <span class="block truncate text-xs text-cork-500">
                      {songListSingerText(song)}
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
                  data-active-desktop-song={active ? 'true' : undefined}
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
                          class="font-chinese truncate text-sm font-semibold {platinumCelebrationId ===
                          song.id
                            ? 'platinum-text-celebration'
                            : ''} {isVerifiedSong(song)
                            ? 'text-slate-500 [text-shadow:0_1px_0_rgba(255,255,255,0.95),0_0_7px_rgba(186,230,253,0.9),0_0_1px_rgba(15,23,42,0.7)]'
                            : ''}"
                        >
                          {song.titleHanzi}
                        </span>
                        {#if active}
                          <Music2 class="size-3.5 shrink-0 text-red-800" />
                        {/if}
                      </span>
                      <span class="font-chinese mt-1 block truncate text-xs text-cork-400">
                        {songListSingerText(song)}
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
                {@render titleHanziText(
                  selectedSong.titleHanzi,
                  selectedSong.titlePinyin,
                  true,
                  compactTitleInHeader(selectedSong)
                )}
              </span>
              <span
                class="text-cork-950 font-sans leading-none font-black {compactTitleInHeader(
                  selectedSong
                )
                  ? 'text-3xl'
                  : 'text-4xl'}">-</span
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
                  true,
                  compactSingerInHeader(selectedSong)
                )}
              </span>
            </h2>
            <h2
              class="text-cork-950 mt-2 hidden max-w-full flex-wrap items-start justify-start gap-x-8 gap-y-5 overflow-hidden text-left md:flex"
            >
              <span class="max-w-full min-w-0">
                {@render titleHanziText(
                  selectedSong.titleHanzi,
                  selectedSong.titlePinyin,
                  false,
                  compactTitleInHeader(selectedSong)
                )}
              </span>
              <span
                class="text-cork-950 shrink-0 font-sans leading-none font-black {compactTitleInHeader(
                  selectedSong
                )
                  ? 'text-5xl'
                  : 'text-7xl'}">-</span
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
                {#if (section.repeatOf || section.repeatOfMany?.length) && !expandRepeats}
                  {@const firstTargetId = section.repeatOf ?? section.repeatOfMany?.[0] ?? ''}
                  {@const target = findSection(selectedSong, firstTargetId)}
                  <a
                    href={`#${sectionAnchor(selectedSong, firstTargetId)}`}
                    class="inline-flex text-xs font-semibold tracking-[0.14em] text-cork-500 underline decoration-cork-400/50 decoration-dotted underline-offset-4 transition hover:text-cork-900 hover:decoration-cork-800"
                    aria-label={`Jump to ${target?.label ?? 'repeated section'}`}
                    onclick={(event) => jumpToRepeatedSection(event, selectedSong, section)}
                  >
                    {sectionLabelText(section)}
                  </a>
                {:else}
                  <div class="mb-4 flex flex-wrap items-center gap-3">
                    <p
                      class="text-xs font-semibold tracking-[0.14em] {returnTargetAnchor ===
                        currentAnchor && !expandRepeats
                        ? 'repeat-target-label'
                        : 'text-cork-500'}"
                    >
                      {sectionLabelText(section)}
                    </p>
                    {#if returnTargetAnchor === currentAnchor && !expandRepeats}
                      <button
                        type="button"
                        class="hidden size-7 cursor-pointer items-center justify-center rounded-md border border-cork-300/70 bg-cork-50/80 text-cork-600 shadow-sm transition hover:bg-cork-100 hover:text-cork-900 md:inline-flex"
                        aria-label="Back to repeat marker"
                        title="Back to repeat marker"
                        onclick={goBackToRepeat}
                      >
                        <CornerDownLeft class="size-3.5" />
                      </button>
                    {/if}
                  </div>
                  {#if section.repeatOfMany?.length}
                    <div class="space-y-10">
                      {#each section.repeatOfMany as repeatedSectionId (repeatedSectionId)}
                        {@const repeatedSection = findSection(selectedSong, repeatedSectionId)}
                        <div>
                          <p class="mb-4 text-xs font-semibold tracking-[0.14em] text-cork-400">
                            {repeatedSection?.label.toUpperCase()}
                          </p>
                          {@render lyricLines(repeatedSection?.lines ?? [])}
                        </div>
                      {/each}
                    </div>
                  {:else}
                    {@const expandedSection = section.repeatOf
                      ? findSection(selectedSong, section.repeatOf)
                      : section}
                    {@render lyricLines(expandedSection?.lines ?? [])}
                  {/if}
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

  {#if showBackToTop || (returnRepeatAnchor && !expandRepeats)}
    <div
      class="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[100] flex items-center gap-2 md:hidden"
      transition:fly={{ y: 12, duration: 160 }}
    >
      {#if returnRepeatAnchor && !expandRepeats}
        <button
          type="button"
          class="flex size-11 cursor-pointer items-center justify-center rounded-full border border-cork-300 bg-cork-50/95 text-cork-800 shadow-lg shadow-cork-900/15 backdrop-blur transition hover:bg-cork-100"
          aria-label="Back to repeat marker"
          title="Back to repeat marker"
          onclick={goBackToRepeat}
        >
          <CornerDownLeft class="size-5" />
        </button>
      {/if}
      {#if showBackToTop}
        <button
          type="button"
          class="flex size-11 cursor-pointer items-center justify-center rounded-full border border-cork-300 bg-cork-50/95 text-cork-800 shadow-lg shadow-cork-900/15 backdrop-blur transition hover:bg-cork-100"
          aria-label="Back to top"
          title="Back to top"
          onclick={scrollToTop}
        >
          <ArrowUp class="size-5" />
        </button>
      {/if}
    </div>
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

  .repeat-target-label {
    color: #b45309;
    transition: color 180ms ease;
  }

  .platinum-text-celebration {
    animation: platinum-text-shimmer 1.05s ease-out;
  }

  @keyframes platinum-text-shimmer {
    0% {
      color: #64748b;
      text-shadow: 0 0 0 rgba(125, 211, 252, 0);
    }
    35% {
      color: #f8fafc;
      text-shadow:
        0 0 5px rgba(255, 255, 255, 0.95),
        0 0 12px rgba(125, 211, 252, 0.95),
        0 0 22px rgba(186, 230, 253, 0.75);
    }
    100% {
      color: #64748b;
      text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.95),
        0 0 7px rgba(186, 230, 253, 0.9),
        0 0 1px rgba(15, 23, 42, 0.7);
    }
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
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .repeat-target-bounce {
      animation: none;
    }

    .platinum-text-celebration {
      animation: none;
    }
  }
</style>
