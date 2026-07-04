<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { Check, Eye, EyeOff, Home, Languages, RotateCcw } from '@lucide/svelte';
  import InkWashBg from '$lib/components/chinese-game/InkWashBg.svelte';
  import '$lib/components/chinese-game/game.css';

  type ChineseReadingQuestion = {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };

  type ChineseReading = {
    titleHanzi: string;
    titlePinyin: string;
    titleEnglish: string;
    storyHanzi: string[];
    storyPinyin: string[];
    storyEnglish: string[];
    questions: ChineseReadingQuestion[];
  };

  type ViewMode = 'reader' | 'questions';
  type RubyToken = {
    hanzi: string;
    pinyin: string;
    punct: boolean;
  };
  type RubyCluster = {
    token: RubyToken;
    trailingPunctuation: string;
  };
  type SavedReadingState = {
    level: number;
    reading: ChineseReading;
    selectedAnswers: Record<number, number>;
    checked: boolean;
    storyCounted: boolean;
    viewMode: ViewMode;
    showPinyin: boolean;
    vocabWarningWords: string[];
    savedAt: number;
  };
  type ChineseReadingJobStatus = {
    status?: string;
    reading?: ChineseReading;
    unknownWords?: unknown;
    error?: string;
  };

  const levels = [1, 2, 3, 4, 5, 6, 7];
  const OPTION_LABELS = ['A', 'B', 'C'];
  const READING_JOB_POLL_MS = 2500;
  const READING_SUCCESS_KEY = 'chinese-reading-success-counts';
  const READING_STATE_KEY = 'chinese-reading-current-state';
  const READING_FORCE_NEXT_KEY = 'chinese-reading-force-next';
  const SETTINGS_KEY = 'hanzi-game-settings';
  const OUT_OF_HSK_TOOLTIP = 'Out of HSK';
  const HANZI_SPACE_RE = /\s/u;
  const PUNCT_RE = /[，。？、！；：—…“”‘’（）《》,.?!;:\s]/;
  const PINYIN_SPLIT_RE = /[\s，。？、！；：,.?!;:]+/;
  const PINYIN_INITIALS = [
    'zh',
    'ch',
    'sh',
    'b',
    'p',
    'm',
    'f',
    'd',
    't',
    'n',
    'l',
    'g',
    'k',
    'h',
    'j',
    'q',
    'x',
    'r',
    'z',
    'c',
    's',
    'y',
    'w'
  ];
  const PINYIN_FINALS = new Set([
    'a',
    'ai',
    'an',
    'ang',
    'ao',
    'e',
    'ei',
    'en',
    'eng',
    'er',
    'i',
    'ia',
    'ian',
    'iang',
    'iao',
    'ie',
    'in',
    'ing',
    'iong',
    'iu',
    'o',
    'ong',
    'ou',
    'u',
    'ua',
    'uai',
    'uan',
    'uang',
    'ue',
    'ui',
    'un',
    'uo',
    'v',
    've'
  ]);
  const PINYIN_FRONT_FINALS = new Set([
    'ia',
    'ian',
    'iang',
    'iao',
    'ie',
    'in',
    'ing',
    'iong',
    'iu'
  ]);
  const PINYIN_RETROFLEX_INITIALS = new Set(['zh', 'ch', 'sh', 'r', 'z', 'c', 's']);
  const PINYIN_TONE_MAP: Record<string, string> = {
    ā: 'a',
    á: 'a',
    ǎ: 'a',
    à: 'a',
    ē: 'e',
    é: 'e',
    ě: 'e',
    è: 'e',
    ī: 'i',
    í: 'i',
    ǐ: 'i',
    ì: 'i',
    ō: 'o',
    ó: 'o',
    ǒ: 'o',
    ò: 'o',
    ū: 'u',
    ú: 'u',
    ǔ: 'u',
    ù: 'u',
    ǖ: 'v',
    ǘ: 'v',
    ǚ: 'v',
    ǜ: 'v',
    ü: 'v'
  };

  let level = $state(1);
  let loading = $state(true);
  let loadingIsRegenerating = $state(false);
  let error = $state('');
  let reading = $state<ChineseReading | null>(null);
  let selectedAnswers = $state<Record<number, number>>({});
  let checked = $state(false);
  let showPinyin = $state(false);
  let englishHeld = $state(false);
  let viewMode = $state<ViewMode>('reader');
  let storyCounted = $state(false);
  let vocabWarningWords = $state<string[]>([]);
  let soundsEnabled = $state(true);
  let bgMusic: HTMLAudioElement | undefined;
  let audioCtx: AudioContext | undefined;
  let pollController: AbortController | undefined;

  let answeredCount = $derived(Object.keys(selectedAnswers).length);
  let canCheck = $derived(Boolean(reading && answeredCount === reading.questions.length));
  let loadingText = $derived(loadingIsRegenerating ? '再来一个...' : '请等一下...');
  let vocabWarningSet = $derived(new Set(vocabWarningWords));

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedLevel = Number(params.get('level'));
    const nextLevel = levels.includes(requestedLevel) ? requestedLevel : 1;
    const forceNext = shouldForceNextStory(nextLevel);
    level = nextLevel;
    if (forceNext || !restoreReadingState(nextLevel)) {
      generateReading(nextLevel, forceNext);
    }
    startBackgroundMusic();
    loadSoundPreference().then((enabled) => {
      soundsEnabled = enabled;
    });
  });

  onDestroy(() => {
    pollController?.abort();
    bgMusic?.pause();
    bgMusic = undefined;
  });

  async function startBackgroundMusic() {
    const musicEnabled = await loadMusicPreference();
    if (!musicEnabled) return;

    bgMusic = new Audio('/audio/bgm.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.018;
    bgMusic.play().catch(() => {});
  }

  async function loadMusicPreference() {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const preferences = await response.json();
        if (typeof preferences?.music === 'boolean') return preferences.music;
      }
    } catch {}

    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings = JSON.parse(raw) as { music?: unknown };
        if (typeof settings.music === 'boolean') return settings.music;
      }
    } catch {}

    return true;
  }

  async function loadSoundPreference() {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const preferences = await response.json();
        if (typeof preferences?.sounds === 'boolean') return preferences.sounds;
      }
    } catch {}

    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings = JSON.parse(raw) as { sounds?: unknown };
        if (typeof settings.sounds === 'boolean') return settings.sounds;
      }
    } catch {}

    return true;
  }

  function playAnswerSound() {
    if (!soundsEnabled) return;

    try {
      audioCtx ??= new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  function playSubmitSound(allCorrect: boolean) {
    if (!soundsEnabled) return;

    try {
      audioCtx ??= new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const tones = allCorrect ? [523, 659, 784] : [260, 196];
      tones.forEach((frequency, index) => {
        const start = now + index * 0.08;
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = allCorrect ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.09, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {}
  }

  function normalizePinyinChar(char: string) {
    const lower = char.toLowerCase();
    return PINYIN_TONE_MAP[lower] ?? lower;
  }

  function isPinyinLetter(char: string) {
    return /^[a-zv]$/.test(normalizePinyinChar(char));
  }

  function isPinyinSyllable(value: string) {
    if (PINYIN_FINALS.has(value)) return true;

    const initial = PINYIN_INITIALS.find((item) => value.startsWith(item));
    if (!initial) return false;

    const final = value.slice(initial.length);
    if (!PINYIN_FINALS.has(final)) return false;
    if (PINYIN_RETROFLEX_INITIALS.has(initial) && PINYIN_FRONT_FINALS.has(final)) return false;
    return true;
  }

  function nextPinyinSyllableLength(value: string, start: number) {
    const maxEnd = Math.min(value.length, start + 6);
    for (let end = maxEnd; end > start; end--) {
      if (isPinyinSyllable(value.slice(start, end))) {
        return end - start;
      }
    }
    return value.length - start;
  }

  function splitPinyinWord(word: string) {
    const letters = [...word].filter(isPinyinLetter);
    const normalized = letters.map(normalizePinyinChar).join('');
    const syllables: string[] = [];
    let index = 0;

    while (index < normalized.length) {
      const length = nextPinyinSyllableLength(normalized, index);
      syllables.push(letters.slice(index, index + length).join(''));
      index += length;
    }

    return syllables;
  }

  function pinyinSyllables(pinyin: string) {
    return pinyin
      .split(PINYIN_SPLIT_RE)
      .flatMap((part) => splitPinyinWord(part.trim()))
      .filter(Boolean);
  }

  function rubyTokens(hanzi: string, pinyin: string): RubyToken[] {
    const syllables = pinyinSyllables(pinyin);
    let syllableIndex = 0;
    const tokens: RubyToken[] = [];

    for (const char of hanzi) {
      if (HANZI_SPACE_RE.test(char)) continue;
      const punct = PUNCT_RE.test(char);
      const syllable = punct ? '' : (syllables[syllableIndex++] ?? '');
      tokens.push({ hanzi: char, pinyin: syllable, punct });
    }

    return tokens;
  }

  function rubyClusters(hanzi: string, pinyin: string): RubyCluster[] {
    const clusters: RubyCluster[] = [];

    for (const token of rubyTokens(hanzi, pinyin)) {
      if (token.punct && clusters.length > 0) {
        clusters[clusters.length - 1].trailingPunctuation += token.hanzi;
      } else {
        clusters.push({ token, trailingPunctuation: '' });
      }
    }

    return clusters;
  }

  function storyHanziText(reading: ChineseReading) {
    return reading.storyHanzi.join('');
  }

  function storyPinyinText(reading: ChineseReading) {
    return reading.storyPinyin.join(' ');
  }

  function storyEnglishText(reading: ChineseReading) {
    return reading.storyEnglish.join(' ');
  }

  function highlightedChars(value: string) {
    return [...value].map((char, index) => ({
      char,
      highlighted: vocabWarningSet.has(char),
      key: `${char}-${index}`
    }));
  }

  function saveReadingState(next: Partial<SavedReadingState> = {}) {
    if (!reading) return;

    const data: SavedReadingState = {
      level,
      reading,
      selectedAnswers,
      checked,
      storyCounted,
      viewMode,
      showPinyin,
      vocabWarningWords,
      savedAt: Date.now(),
      ...next
    };

    try {
      localStorage.setItem(READING_STATE_KEY, JSON.stringify(data));
    } catch {}
  }

  function restoreReadingState(targetLevel: number) {
    try {
      const raw = localStorage.getItem(READING_STATE_KEY);
      if (!raw) return false;

      const saved = JSON.parse(raw) as Partial<SavedReadingState>;
      if (saved.level !== targetLevel || !saved.reading) return false;

      reading = saved.reading;
      selectedAnswers = saved.selectedAnswers ?? {};
      checked = Boolean(saved.checked);
      storyCounted = Boolean(saved.storyCounted);
      viewMode = saved.viewMode === 'questions' ? 'questions' : 'reader';
      showPinyin = saved.showPinyin ?? false;
      vocabWarningWords = Array.isArray(saved.vocabWarningWords) ? saved.vocabWarningWords : [];
      loading = false;
      error = '';
      return true;
    } catch {
      return false;
    }
  }

  function clearReadingState() {
    try {
      localStorage.removeItem(READING_STATE_KEY);
    } catch {}
  }

  function shouldForceNextStory(targetLevel: number) {
    try {
      const raw = localStorage.getItem(READING_FORCE_NEXT_KEY);
      if (!raw) return false;
      localStorage.removeItem(READING_FORCE_NEXT_KEY);
      return Number(raw) === targetLevel;
    } catch {
      return false;
    }
  }

  function goToMainMenu() {
    clearReadingState();
    try {
      localStorage.setItem(READING_FORCE_NEXT_KEY, String(level));
    } catch {}
    goto('/tools/chinese-game');
  }

  async function generateReading(targetLevel: number, force = false) {
    loading = true;
    loadingIsRegenerating = force;
    error = '';
    vocabWarningWords = [];
    checked = false;
    selectedAnswers = {};
    storyCounted = false;
    showPinyin = false;
    viewMode = 'reader';
    if (force) clearReadingState();

    try {
      pollController?.abort();
      const response = await fetch('/api/chinese-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: targetLevel, force })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Could not generate a reading.');
      }
      if (response.status === 202 && typeof data?.jobId === 'string') {
        await pollReadingJob(data.jobId);
        return;
      }
      reading = data.reading;
      vocabWarningWords = Array.isArray(data?.unknownWords) ? data.unknownWords : [];
      saveReadingState({ reading: data.reading, vocabWarningWords });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Could not generate a reading.';
    } finally {
      loading = false;
      loadingIsRegenerating = false;
    }
  }

  function waitForPoll(signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(resolve, READING_JOB_POLL_MS);
      signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timeout);
          reject(new DOMException('Polling aborted', 'AbortError'));
        },
        { once: true }
      );
    });
  }

  async function pollReadingJob(jobId: string) {
    const controller = new AbortController();
    pollController = controller;

    try {
      while (!controller.signal.aborted) {
        const response = await fetch(`/api/chinese-reading/status/${jobId}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as ChineseReadingJobStatus;

        if (!response.ok) {
          throw new Error(data?.error ?? 'Could not check reading generation status.');
        }

        if (data.status === 'completed' && data.reading) {
          reading = data.reading;
          vocabWarningWords = Array.isArray(data.unknownWords) ? data.unknownWords : [];
          saveReadingState({ reading: data.reading, vocabWarningWords });
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error ?? 'Could not generate a reading.');
        }

        await waitForPoll(controller.signal);
      }
    } finally {
      if (pollController === controller) pollController = undefined;
    }
  }

  function calculateScore() {
    if (!reading) return 0;
    return reading.questions.reduce(
      (total, question, index) => total + (selectedAnswers[index] === question.answerIndex ? 1 : 0),
      0
    );
  }

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (checked) return;
    const nextAnswers = { ...selectedAnswers, [questionIndex]: optionIndex };
    if (selectedAnswers[questionIndex] !== optionIndex) {
      playAnswerSound();
    }
    selectedAnswers = nextAnswers;
    saveReadingState({ selectedAnswers: nextAnswers });
  }

  function markStorySucceeded() {
    if (storyCounted) return;
    storyCounted = true;
    saveReadingState({ storyCounted: true });

    try {
      const raw = localStorage.getItem(READING_SUCCESS_KEY);
      const counts = raw != null && raw.trim() ? (JSON.parse(raw) as Record<string, number>) : {};
      counts[level] = Number(counts[level] ?? 0) + 1;
      localStorage.setItem(READING_SUCCESS_KEY, JSON.stringify(counts));
    } catch {}

    fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedReadingLevel: level })
    }).catch(() => {});
  }

  function checkAnswers() {
    if (!canCheck || !reading) return;
    checked = true;
    saveReadingState({ checked: true });
    const allCorrect = calculateScore() === reading.questions.length;
    playSubmitSound(allCorrect);
    if (allCorrect) {
      markStorySucceeded();
    }
  }

  function retryQuestions() {
    generateReading(level, true);
  }

  function setViewMode(nextMode: ViewMode) {
    viewMode = nextMode;
    saveReadingState({ viewMode: nextMode });
  }

  function togglePinyin() {
    const next = !showPinyin;
    showPinyin = next;
    saveReadingState({ showPinyin: next });
  }
</script>

<svelte:head>
  <title>Chinese Reading Game | Produck</title>
</svelte:head>

<div class="game-container">
  <InkWashBg />

  <main
    class="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center gap-4 px-4 pt-5 pb-28"
  >
    {#if loading}
      <div
        class="flex min-h-[28rem] w-full flex-col items-center justify-center rounded-lg border border-cork-300/60 bg-cork-100/80 p-8 text-center shadow-sm"
      >
        <p class="animate-pulse font-display text-2xl text-cork-700">{loadingText}</p>
      </div>
    {:else if error}
      <div
        class="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-center text-sm text-red-700"
      >
        {error}
      </div>
    {:else if reading}
      {#if viewMode === 'reader'}
        <article
          class="w-full rounded-lg border border-cork-300/60 bg-cork-50/95 p-5 shadow-sm md:p-7"
        >
          <div class="mb-5 border-b border-cork-200 pb-4 text-center">
            {#if englishHeld}
              <h1 class="font-display text-3xl leading-tight text-cork-900 md:text-4xl">
                {reading.titleEnglish}
              </h1>
            {:else}
              <h1 class="font-chinese leading-tight font-semibold text-[0] text-cork-900">
                {#each rubyClusters(reading.titleHanzi, reading.titlePinyin) as cluster, index (index)}
                  <span
                    class="inline-block align-baseline text-3xl tracking-normal whitespace-nowrap md:text-4xl"
                  >
                    <span
                      class="relative inline-block min-w-0 text-center align-baseline {showPinyin &&
                      !cluster.token.punct
                        ? 'min-w-[1.35em] pt-5 md:min-w-[1.05em]'
                        : ''}"
                    >
                      {#if showPinyin && !cluster.token.punct}
                        <span
                          class="absolute top-0 left-1/2 h-4 -translate-x-1/2 text-[10px] leading-4 whitespace-nowrap text-cork-500 md:text-xs"
                        >
                          {cluster.token.pinyin}
                        </span>
                      {/if}
                      {#if vocabWarningSet.has(cluster.token.hanzi)}
                        <span
                          class="group relative rounded-sm bg-red-200/90 px-0.5 text-red-950 ring-1 ring-red-300 outline-none"
                          title={OUT_OF_HSK_TOOLTIP}
                          aria-label={`${cluster.token.hanzi}: ${OUT_OF_HSK_TOOLTIP}`}
                        >
                          {cluster.token.hanzi}
                          <span
                            class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded bg-cork-900 px-2 py-1 font-sans text-[10px] leading-none whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-active:opacity-100"
                          >
                            {OUT_OF_HSK_TOOLTIP}
                          </span>
                        </span>
                      {:else}
                        <span>{cluster.token.hanzi}</span>
                      {/if}
                    </span>
                    <span>{cluster.trailingPunctuation}</span>
                  </span>
                {/each}
              </h1>
            {/if}
          </div>

          {#if englishHeld}
            <p class="mx-auto max-w-3xl text-justify leading-relaxed text-cork-800 md:text-xl">
              {storyEnglishText(reading)}
            </p>
          {:else}
            <p
              class="font-chinese mx-auto max-w-3xl text-left leading-[2.05] text-[0] text-cork-900"
            >
              {#each rubyClusters(storyHanziText(reading), storyPinyinText(reading)) as cluster, tokenIndex (tokenIndex)}
                <span
                  class="inline-block align-baseline text-xl tracking-normal whitespace-nowrap md:text-3xl"
                >
                  <span
                    class="relative inline-block min-w-0 text-center align-baseline {showPinyin &&
                    !cluster.token.punct
                      ? 'min-w-[1.35em] pt-5 md:min-w-[1.05em]'
                      : ''}"
                  >
                    {#if showPinyin && !cluster.token.punct}
                      <span
                        class="absolute top-0 left-1/2 h-4 -translate-x-1/2 text-[9px] leading-4 whitespace-nowrap text-cork-500 md:text-xs"
                      >
                        {cluster.token.pinyin}
                      </span>
                    {/if}
                    {#if vocabWarningSet.has(cluster.token.hanzi)}
                      <span
                        class="group relative rounded-sm bg-red-200/90 px-0.5 text-red-950 ring-1 ring-red-300 outline-none"
                        title={OUT_OF_HSK_TOOLTIP}
                        aria-label={`${cluster.token.hanzi}: ${OUT_OF_HSK_TOOLTIP}`}
                      >
                        {cluster.token.hanzi}
                        <span
                          class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded bg-cork-900 px-2 py-1 font-sans text-[10px] leading-none whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-active:opacity-100"
                        >
                          {OUT_OF_HSK_TOOLTIP}
                        </span>
                      </span>
                    {:else}
                      <span>{cluster.token.hanzi}</span>
                    {/if}
                  </span>
                  <span>{cluster.trailingPunctuation}</span>
                </span>
              {/each}
            </p>
          {/if}
        </article>
      {:else}
        <section class="mx-auto flex w-full max-w-3xl flex-col justify-center gap-8 text-left">
          {#each reading.questions as question, questionIndex (questionIndex)}
            <div class="space-y-4">
              <div class="space-y-1.5">
                <p class="text-xs font-semibold tracking-wider text-cork-400 uppercase">
                  Question {questionIndex + 1}
                </p>
                <h2
                  class="font-chinese text-xl leading-relaxed font-semibold text-cork-800 md:text-2xl"
                >
                  {#each highlightedChars(question.question) as item (item.key)}
                    {#if item.highlighted}
                      <span
                        class="group relative rounded-sm bg-red-200/90 px-0.5 text-red-950 ring-1 ring-red-300 outline-none"
                        title={OUT_OF_HSK_TOOLTIP}
                        aria-label={`${item.char}: ${OUT_OF_HSK_TOOLTIP}`}
                      >
                        {item.char}
                        <span
                          class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded bg-cork-900 px-2 py-1 font-sans text-[10px] leading-none whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-active:opacity-100"
                        >
                          {OUT_OF_HSK_TOOLTIP}
                        </span>
                      </span>
                    {:else}
                      <span>{item.char}</span>
                    {/if}
                  {/each}
                </h2>
              </div>

              <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
                {#each question.options as option, optionIndex (optionIndex)}
                  {@const isSelected = selectedAnswers[questionIndex] === optionIndex}
                  {@const isCorrect = question.answerIndex === optionIndex}
                  <button
                    type="button"
                    class="min-h-12 cursor-pointer rounded-lg border px-3 py-2 text-left transition-all md:min-h-20 md:py-3 md:text-center {checked &&
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                      : checked && isSelected
                        ? 'border-red-400 bg-red-100 text-red-900'
                        : isSelected
                          ? 'border-amber-400 bg-amber-100 text-cork-900'
                          : 'border-cork-300/70 bg-white text-cork-700 hover:bg-cork-100'}"
                    onclick={() => selectAnswer(questionIndex, optionIndex)}
                  >
                    <span
                      class="flex h-full items-center justify-start gap-3 md:flex-col md:justify-start md:gap-2"
                    >
                      <span class="w-4 shrink-0 text-center text-xs font-semibold text-cork-500">
                        {OPTION_LABELS[optionIndex]}
                      </span>
                      <span
                        class="font-chinese flex-1 text-base leading-snug md:flex-none md:text-lg"
                      >
                        {#each highlightedChars(option) as item (item.key)}
                          {#if item.highlighted}
                            <span
                              class="group relative rounded-sm bg-red-200/90 px-0.5 text-red-950 ring-1 ring-red-300 outline-none"
                              title={OUT_OF_HSK_TOOLTIP}
                              aria-label={`${item.char}: ${OUT_OF_HSK_TOOLTIP}`}
                            >
                              {item.char}
                              <span
                                class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded bg-cork-900 px-2 py-1 font-sans text-[10px] leading-none whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-active:opacity-100"
                              >
                                {OUT_OF_HSK_TOOLTIP}
                              </span>
                            </span>
                          {:else}
                            <span>{item.char}</span>
                          {/if}
                        {/each}
                      </span>
                    </span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </section>
      {/if}
    {/if}
  </main>

  <div
    class="fixed inset-x-0 bottom-3 z-30 flex flex-wrap items-center justify-center gap-2 px-2 pb-[env(safe-area-inset-bottom)] md:bottom-4 md:px-4"
  >
    <div
      class="flex h-14 max-w-[calc(100vw-1rem)] items-center justify-center gap-1.5 rounded-xl border border-cork-200/60 bg-cork-50/85 p-1.5 shadow-lg shadow-cork-900/10 backdrop-blur md:h-16 md:gap-3 md:p-2"
    >
      <span
        class="inline-flex w-8 shrink-0 items-center justify-center px-0.5 text-center text-[10px] leading-tight font-semibold tracking-wider text-cork-400 uppercase md:w-auto md:px-1 md:text-[11px]"
      >
        HSK {level}
      </span>

      <div
        class="relative grid h-11 w-24 shrink-0 grid-cols-2 rounded-xl border border-cork-200/60 bg-cork-100 p-1 shadow-inner shadow-cork-900/5 md:h-12 md:w-28"
      >
        <span
          class="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-cork-200 shadow-sm transition-transform duration-200 ease-out {viewMode ===
          'questions'
            ? 'translate-x-full'
            : 'translate-x-0'}"
          aria-hidden="true"
        ></span>
        <button
          type="button"
          class="relative z-10 flex cursor-pointer items-center justify-center rounded-lg text-base font-semibold text-cork-600 transition-colors hover:text-cork-800 md:text-lg {viewMode ===
          'reader'
            ? 'text-cork-900'
            : ''}"
          aria-pressed={viewMode === 'reader'}
          onclick={() => setViewMode('reader')}
        >
          读
        </button>
        <button
          type="button"
          class="relative z-10 flex cursor-pointer items-center justify-center rounded-lg text-base font-semibold text-cork-600 transition-colors hover:text-cork-800 md:text-lg {viewMode ===
          'questions'
            ? 'text-cork-900'
            : ''}"
          aria-pressed={viewMode === 'questions'}
          onclick={() => setViewMode('questions')}
        >
          题
        </button>
      </div>

      <button
        type="button"
        class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 md:size-10"
        aria-label={checked ? 'New story' : 'Submit answers'}
        title={checked ? 'New story' : 'Submit answers'}
        disabled={!checked && !canCheck}
        onclick={checked ? retryQuestions : checkAnswers}
      >
        {#if checked}
          <RotateCcw class="size-4" />
        {:else}
          <Check class="size-4" />
        {/if}
      </button>

      {#if checked}
        <button
          type="button"
          class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow md:size-10"
          aria-label="Back to main menu"
          title="Back to main menu"
          onclick={goToMainMenu}
        >
          <Home class="size-4" />
        </button>
      {/if}
    </div>

    {#if viewMode === 'reader'}
      <div
        class="flex h-14 max-w-[calc(100vw-1rem)] items-center justify-center gap-1.5 rounded-xl border border-cork-200/60 bg-cork-50/85 p-1.5 shadow-lg shadow-cork-900/10 backdrop-blur md:h-16 md:gap-2 md:p-2"
        in:fly={{ y: 8, duration: 180 }}
      >
        <button
          type="button"
          class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow md:size-10 {showPinyin
            ? 'border-cork-300/70 bg-cork-200 text-cork-800 shadow'
            : ''}"
          aria-label={showPinyin ? 'Hide pinyin' : 'Show pinyin'}
          title={showPinyin ? 'Hide pinyin' : 'Show pinyin'}
          onclick={togglePinyin}
        >
          {#if showPinyin}
            <EyeOff class="size-4" />
          {:else}
            <Eye class="size-4" />
          {/if}
        </button>

        <button
          type="button"
          class="flex size-9 cursor-pointer touch-none items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all select-none hover:border-cork-300/50 hover:bg-cork-200 hover:shadow md:size-10 {englishHeld
            ? 'border-cork-300/70 bg-cork-200 text-cork-800 shadow'
            : ''}"
          aria-label="Hold for English"
          title="Hold for English"
          onpointerdown={() => (englishHeld = true)}
          onpointerup={() => (englishHeld = false)}
          onpointerleave={() => (englishHeld = false)}
          onpointercancel={() => (englishHeld = false)}
          onblur={() => (englishHeld = false)}
          oncontextmenu={(event) => event.preventDefault()}
        >
          <Languages class="size-4" />
        </button>
      </div>
    {/if}
  </div>
</div>
