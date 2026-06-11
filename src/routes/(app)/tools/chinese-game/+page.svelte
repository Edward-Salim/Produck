<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { Heart, Zap, RotateCcw, Play, Check, ChevronRight, SkipForward, ArrowLeft, Music, Volume2 } from '@lucide/svelte';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import type { PageData } from './$types.js';

  import type { SentenceData } from './sentences.js';

  let { data }: { data: PageData } = $props();
  let sentences = $derived(data.sentences);
  let levelNames = $derived(data.levelNames);

  // ── Sounds ──
  let correctSound: HTMLAudioElement;
  let wrongSound: HTMLAudioElement;
  let gameOverSound: HTMLAudioElement;
  let bgMusic: HTMLAudioElement;
  let audioInit = false;

  onMount(() => {
    if (audioInit) return;
    audioInit = true;
    correctSound = new Audio('/audio/achievement-message-tone.mp3');
    correctSound.volume = 0.15;
    wrongSound = new Audio('/audio/out-of-nowhere-message-tone.mp3');
    wrongSound.volume = 0.15;
    gameOverSound = new Audio('/audio/thats-it-sound-effect.mp3');
    gameOverSound.volume = 0.2;
    bgMusic = new Audio('/audio/bgm.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.018;
    if (musicEnabled) bgMusic.play().catch(() => {});
  });

  onDestroy(() => {
    bgMusic?.pause();
    bgMusic = undefined as any;
    correctSound = undefined as any;
    wrongSound = undefined as any;
    gameOverSound = undefined as any;
  });

  type GameState = 'menu' | 'playing' | 'gameover';
  type MenuScreen = 'main' | 'difficulty' | 'options';

  // ── Menu state ──
  let menuScreen = $state<MenuScreen>('main');
  let selectedLevels = $state<Set<number>>(new Set());

  // ── Audio settings ──
  let musicEnabled = $state(true);
  let soundsEnabled = $state(true);

  async function loadSettings() {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const p = await res.json();
        musicEnabled = p.music ?? true;
        soundsEnabled = p.sounds ?? true;
        if (Array.isArray(p.selectedLevels)) {
          selectedLevels = new Set(p.selectedLevels);
        }
        return p;
      }
    } catch {}
    try {
      const raw = localStorage.getItem('hanzi-game-settings');
      if (raw) {
        const s = JSON.parse(raw);
        musicEnabled = s.music ?? true;
        soundsEnabled = s.sounds ?? true;
        if (Array.isArray(s.selectedLevels)) {
          selectedLevels = new Set(s.selectedLevels);
        }
      }
    } catch {}
    return null;
  }

  async function saveSettings() {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ music: musicEnabled, sounds: soundsEnabled, selectedLevels: [...selectedLevels] })
      });
    } catch {}
    try { localStorage.setItem('hanzi-game-settings', JSON.stringify({ music: musicEnabled, sounds: soundsEnabled, selectedLevels: [...selectedLevels] })); } catch {}
  }

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (bgMusic) {
      if (musicEnabled) bgMusic.play().catch(() => {});
      else bgMusic.pause();
    }
    saveSettings();
  }

  function toggleSounds() {
    soundsEnabled = !soundsEnabled;
    saveSettings();
  }

  // ── Game state ──
  let gameState = $state<GameState>('menu');
  let currentSentence = $state<SentenceData | null>(null);
  let currentLevel = $state(0);
  let userChars = $state<string[]>([]);
  let health = $state(3);
  let streak = $state(0);
  let bestStreak = $state(0);
  let totalCorrect = $state(0);
  let totalAttempts = $state(0);
  let feedback = $state<'correct' | 'wrong' | null>(null);
  let revealedHanzi = $state('');
  let revealedPinyin = $state('');
  let inputRefs = $state<HTMLInputElement[]>([]);
  let poolIndex = $state(0);
  let shuffled = $state<SentenceData[]>([]);

  // ── Persistence ──
  const STORAGE_KEY = 'hanzi-game-save';
  const HIGHSCORE_KEY = 'hanzi-game-highscore';
  let restored = $state(false);

  let highscore = $state<{ score: number; name: string }>({ score: 0, name: '' });

  function loadHighscore() {
    try {
      const raw = localStorage.getItem(HIGHSCORE_KEY);
      return raw ? JSON.parse(raw) : { score: 0, name: '' };
    } catch { return { score: 0, name: '' }; }
  }

  function saveHighscore(score: number, name: string) {
    try { localStorage.setItem(HIGHSCORE_KEY, JSON.stringify({ score, name })); } catch {}
  }

  function updateHighscore(score: number) {
    if (score >= highscore.score) {
      highscore = { score, name: 'Edward' };
      saveHighscore(score, 'Edward');
    }
  }

  function buildGameData() {
    return {
      gameState,
      poolIndex,
      health,
      totalCorrect,
      totalAttempts,
      bestStreak,
      streak,
      currentLevel,
      selectedLevels: [...selectedLevels],
      shuffledHanzi: shuffled.map(s => s.hanzi),
      feedback: feedback,
      revealedHanzi: revealedHanzi,
      revealedPinyin: revealedPinyin
    };
  }

  function saveState() {
    if (gameState === 'menu') return;
    const data = buildGameData();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    syncGameToServer();
  }

  let syncTimer: ReturnType<typeof setTimeout>;
  function syncGameToServer() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameState: buildGameData() })
        });
      } catch {}
    }, 500);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear game state on server
    fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState: null })
    }).catch(() => {});
  }

  function restoreGameData(data: ReturnType<typeof buildGameData>) {
    const hanziSet = new Set(data.shuffledHanzi);
    const savedShuffled = sentences.filter((s: SentenceData) => hanziSet.has(s.hanzi));
    if (savedShuffled.length === 0) return;
    shuffled = savedShuffled;
    poolIndex = data.poolIndex;
    health = data.health;
    totalCorrect = data.totalCorrect;
    totalAttempts = data.totalAttempts;
    bestStreak = data.bestStreak;
    streak = data.streak;
    currentLevel = data.currentLevel;
    selectedLevels = new Set(data.selectedLevels);
    gameState = data.gameState;
    // Reconstruct current sentence
    const idx = data.poolIndex % savedShuffled.length;
    currentSentence = savedShuffled[idx >= savedShuffled.length ? 0 : idx];

    // Restore feedback state: keep input mode if player was typing, show answer if they were viewing a wrong answer
    if (data.feedback === 'wrong') {
      feedback = 'wrong';
      revealedHanzi = data.revealedHanzi || currentSentence.hanzi;
      revealedPinyin = data.revealedPinyin || currentSentence.pinyin;
      userChars = [...currentSentence.hanzi].map(c => /[，。？、！；：]/.test(c) ? c : '');
    } else {
      feedback = null;
      revealedHanzi = '';
      revealedPinyin = '';
      userChars = [...currentSentence.hanzi].map(c => /[，。？、！；：]/.test(c) ? c : '');
    }
  }

  // Restore saved game + load highscore once sentences are loaded
  $effect(() => {
    if (sentences.length > 0 && !restored) {
      highscore = loadHighscore();
      loadSettings().then((prefs) => {
        // Prefer server game state over localStorage
        if (prefs?.gameState && prefs.gameState.gameState !== 'menu') {
          restoreGameData(prefs.gameState);
        } else {
          const saved = loadState();
          if (saved && saved.gameState !== 'menu') {
            restoreGameData(saved);
          }
        }
      }).catch(() => {
        const saved = loadState();
        if (saved && saved.gameState !== 'menu') {
          restoreGameData(saved);
        }
      });
      restored = true;
    }
  });

  // ── Derived ──
  let maxHealth = $derived(3);
  let accuracy = $derived(
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  );
  let sentenceCount = $derived(sentences.length);
  let levelSentenceCounts = $derived(
    Object.fromEntries(
      Object.keys(levelNames).map((k) => {
        const lv = Number(k);
        return [lv, sentences.filter((s: SentenceData) => s.level === lv).length];
      })
    )
  );

  const levelColorConfig = [
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-amber-400 bg-amber-300 text-amber-950 shadow-sm' },
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-emerald-400 bg-emerald-300 text-emerald-950 shadow-sm' },
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-sky-400 bg-sky-300 text-sky-950 shadow-sm' },
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-violet-400 bg-violet-300 text-violet-950 shadow-sm' },
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-rose-400 bg-rose-300 text-rose-950 shadow-sm' },
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-teal-400 bg-teal-300 text-teal-950 shadow-sm' },
    { base: 'border-cork-300/40 bg-cork-100/50 text-cork-600', active: 'border-orange-400 bg-orange-300 text-orange-950 shadow-sm' },
  ];

  function openDifficulty() {
    menuScreen = 'difficulty';
  }

  function toggleLevel(level: number) {
    if (level > 7) return;
    const next = new Set(selectedLevels);
    if (next.has(level)) {
      next.delete(level);
    } else {
      next.add(level);
    }
    selectedLevels = next;
    saveSettings();
  }

  function openOptions() {
    menuScreen = 'options';
  }

  function backToMain() {
    menuScreen = 'main';
  }

  function beginGame() {
    // Filter sentences by selected levels
    const filtered = sentences.filter((s: SentenceData) => selectedLevels.has(s.level));
    if (filtered.length === 0) return;

    // Fisher-Yates shuffle
    const shuffledSentences = [...filtered];
    for (let i = shuffledSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSentences[i], shuffledSentences[j]] = [shuffledSentences[j], shuffledSentences[i]];
    }

    clearState();
    shuffled = shuffledSentences;
    poolIndex = 0;
    health = 3;
    // Dev: ?streak=N in URL to preview fire levels
    const params = new URLSearchParams(window.location.search);
    streak = Number(params.get('streak') ?? 0);
    bestStreak = Math.max(bestStreak, streak);
    totalCorrect = streak;
    totalAttempts = streak;
    feedback = null;
    revealedHanzi = '';
    revealedPinyin = '';
    gameState = 'playing';

    // Prime audio context so stroke sounds work immediately
    if (!audioCtx) { audioCtx = new AudioContext(); }
    audioCtx.resume();
    showNextSentence();
  }

  function pushBackCurrent() {
    // Move the sentence we just answered correctly toward the back of the queue
    const idx = (poolIndex - 1 + shuffled.length) % shuffled.length;
    if (shuffled.length <= 2) return;
    // Pick a random position ahead in the queue (at least 30% ahead, up to near the end)
    const min = poolIndex + Math.floor(shuffled.length * 0.3);
    const max = poolIndex + shuffled.length - 2;
    if (min >= max) return;
    const target = min + Math.floor(Math.random() * (max - min));
    const targetIdx = target % shuffled.length;
    // Swap current with target
    const tmp = shuffled[idx];
    shuffled[idx] = shuffled[targetIdx];
    shuffled[targetIdx] = tmp;
  }

  function showNextSentence() {
    const s = shuffled[poolIndex % shuffled.length];
    poolIndex++;
    currentSentence = s;
    currentLevel = s.level;
    userChars = [...s.hanzi].map(c => /[，。？、！；：]/.test(c) ? c : '');
    feedback = null;
    revealedHanzi = '';
    revealedPinyin = '';

    saveState();

    // Auto-focus first editable slot after DOM update
    tick().then(() => {
      const chars = [...s.hanzi];
      for (let i = 0; i < chars.length; i++) {
        if (!/[，。？、！；：]/.test(chars[i])) {
          inputRefs[i]?.focus();
          break;
        }
      }
    });
  }

  function checkAnswer() {
    if (!currentSentence) return;

    const answer = userChars.join('').replace(/[，。？、！；：]/g, '');
    // Strip punctuation from sentence for comparison
    const cleanHanzi = currentSentence.hanzi.replace(/[，。？、！；：]/g, '');
    const isCorrect = answer === cleanHanzi;

    totalAttempts++;

    if (isCorrect) {
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      totalCorrect++;
      feedback = 'correct';
      if (soundsEnabled && correctSound) { correctSound.currentTime = 0; correctSound.play().catch(() => {}); }
      pushBackCurrent();
      saveState();
      showNextSentence();
    } else {
      health--;
      streak = 0;
      feedback = 'wrong';
      if (soundsEnabled && wrongSound) { wrongSound.currentTime = 0; wrongSound.play().catch(() => {}); }
      revealedHanzi = currentSentence.hanzi;
      revealedPinyin = currentSentence.pinyin;
      saveState();
    }
  }

  function skipSentence() {
    if (!currentSentence) return;

    revealedHanzi = currentSentence.hanzi;
    revealedPinyin = currentSentence.pinyin;
    health--;
    streak = 0;
    totalAttempts++;
    feedback = 'wrong';
    if (soundsEnabled && wrongSound) { wrongSound.currentTime = 0; wrongSound.play().catch(() => {}); }
    saveState();
  }

  function nextAfterWrong() {
    if (health <= 0) {
      updateHighscore(totalCorrect);
      if (soundsEnabled) gameOverSound?.play().catch(() => {});
      clearState();
      gameState = 'gameover';
    } else {
      showNextSentence();
    }
  }

  // ── Character slot handlers ──
  function isPunct(c: string) {
    return /[，。？、！；：]/.test(c);
  }

  function nextEditableSlot(fromIndex: number): number {
    if (!currentSentence) return fromIndex;
    const chars = [...currentSentence.hanzi];
    for (let j = fromIndex + 1; j < chars.length; j++) {
      if (!isPunct(chars[j])) return j;
    }
    return fromIndex;
  }

  function prevEditableSlot(fromIndex: number): number {
    if (!currentSentence) return fromIndex;
    const chars = [...currentSentence.hanzi];
    for (let j = fromIndex - 1; j >= 0; j--) {
      if (!isPunct(chars[j])) return j;
    }
    return fromIndex;
  }

  // ── Stroke sound ──
  let audioCtx: AudioContext | undefined;

  function playStroke() {
    if (!soundsEnabled) return;
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // ── IME composition tracking ──
  let isComposing = $state(false);
  let composeSlot = $state(-1);

  function spreadChars(fromIndex: number, chars: string[]) {
    let slot = fromIndex;
    for (const ch of chars) {
      // skip punctuation slots
      while (slot < userChars.length && isPunct([...currentSentence!.hanzi][slot])) {
        slot++;
      }
      if (slot >= userChars.length) break;
      userChars[slot] = ch;
      slot++;
    }
    // Focus the next empty editable slot after the last filled one
    const next = nextEditableSlot(slot - 1);
    if (next > fromIndex || userChars[next]) {
      inputRefs[next]?.focus();
    } else {
      inputRefs[fromIndex]?.focus();
    }
  }

  function onCompositionStart(index: number) {
    isComposing = true;
    composeSlot = index;
  }

  function onCompositionEnd() {
    isComposing = false;
    const i = composeSlot;
    composeSlot = -1;
    if (i >= 0 && userChars[i]) {
      const chars = [...userChars[i]];
      if (chars.length > 1) {
        spreadChars(i, chars);
      } else {
        playStroke();
        inputRefs[nextEditableSlot(i)]?.focus();
      }
    }
  }

  function onSlotInput(index: number) {
    if (isComposing) return;
    let val = userChars[index];
    if (!val) return;
    const chars = [...val];
    if (chars.length > 1) {
      spreadChars(index, chars);
    } else if (userChars[index]) {
      playStroke();
      inputRefs[nextEditableSlot(index)]?.focus();
    }
  }

  function onSlotKeydown(index: number, e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      checkAnswer();
      return;
    }
    // Tab on last editable slot wraps to first
    if (e.key === 'Tab' && nextEditableSlot(index) === index && !e.shiftKey) {
      e.preventDefault();
      inputRefs[nextEditableSlot(-1)]?.focus();
      return;
    }
    // Shift+Tab on first editable slot wraps to last
    if (e.key === 'Tab' && prevEditableSlot(index) === index && e.shiftKey) {
      e.preventDefault();
      const chars = currentSentence ? [...currentSentence.hanzi] : [];
      for (let j = chars.length - 1; j >= 0; j--) {
        if (!isPunct(chars[j])) { inputRefs[j]?.focus(); break; }
      }
      return;
    }
    // Backspace on empty slot moves to previous editable slot
    if (e.key === 'Backspace' && !userChars[index] && index > 0) {
      inputRefs[prevEditableSlot(index)]?.focus();
    }
  }

  function goToMenu() {
    clearState();
    gameState = 'menu';
    menuScreen = 'main';
    currentSentence = null;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (gameState === 'gameover') {
        beginGame();
        return;
      }
      if ((feedback === 'correct' || feedback === 'wrong') && gameState === 'playing') {
        nextAfterWrong();
      }
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
  <title>Hanzi Game | Produck</title>
</svelte:head>

<div class="game-container">

  {#if gameState === 'menu'}
    <!-- ── MENU / LEVEL SELECT ── -->
    <div class="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-8 md:flex-row md:items-center md:justify-center md:gap-6 md:min-h-[calc(100dvh-8rem)]">
      <!-- Left column: Title + subtitle -->
      <div class="text-center md:w-48 md:text-left">
        <img
          src="/assets/produck-chinese-logo.png"
          alt="Hanzi Game logo"
          class="mx-auto mb-2 h-16 w-auto object-contain md:mx-0 md:h-20"
        />
        <h1 class="font-display text-3xl text-cork-800 md:text-4xl">Hanzi Game</h1>
        <p class="mt-1 text-xs text-cork-500 md:text-sm">
          Type the 中文, trust your 大脑. One step closer to 中国.
        </p>
      </div>

      <!-- Right column -->
      <div class="flex w-full min-w-0 flex-col md:w-96">
        <!-- Chinese pagoda roof -->
        <div class="pagoda-roof">
          <div class="roof-finial"></div>
          <div class="roof-main">
            <div class="roof-sweep"></div>
            <div class="roof-eave left"></div>
            <div class="roof-eave right"></div>
            <div class="roof-ridge"></div>
          </div>
          <div class="dougong"></div>
        </div>

        <!-- Wood panel body -->
        <div class="wood-panel flex flex-1 flex-col shadow-xl shadow-black/30">
          <div class="flex flex-1 flex-col px-5 pb-5 pt-3">
        {#if menuScreen === 'main'}
          <!-- ── MAIN MENU ── -->
          <div class="flex flex-1 flex-col justify-center gap-3 py-6">
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-red-700 px-6 py-3 font-display text-xl text-amber-100 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-900/30"
              onclick={openDifficulty}
            >
              Start Game
            </button>
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
              onclick={openOptions}
            >
              Options
            </button>
            <a
              href="/tools"
              class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
            >
              Back
            </a>
          </div>

          <!-- Highscore -->
          <div class="mb-1 mt-auto text-center">
            <span class="text-[10px] font-semibold tracking-wider text-amber-400/80 uppercase">High Score</span>
            <span class="mx-1.5 font-display text-base text-amber-300">{highscore.score}</span>
            {#if highscore.name}
              <span class="text-[10px] text-amber-400/60">by {highscore.name}</span>
            {/if}
          </div>

        {:else if menuScreen === 'difficulty'}
          <!-- ── DIFFICULTY SELECT ── -->

          <!-- Instructions -->
          <p class="mb-4 text-center text-xs leading-relaxed text-cork-300">
            Pick levels, hit Begin. <strong class="font-semibold text-amber-400">3 hearts</strong>. Lose one per mistake, chain correct answers to streak.
          </p>

          <!-- Level grid -->
          <div class="flex w-full flex-col gap-1">
            {#each Object.entries(levelNames) as [levelStr, name]}
              {@const level = Number(levelStr)}
              {@const isActive = level <= 7}
              {@const colors = levelColorConfig[Math.min(level - 1, levelColorConfig.length - 1)]}
              <button
                type="button"
                disabled={!isActive}
                class="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left transition-all {selectedLevels.has(level)
                  ? colors.active
                  : isActive
                    ? colors.base
                    : 'border-cork-800/40 bg-cork-900/30 text-cork-600'}"
                onclick={() => toggleLevel(level)}
              >
                <span class="text-xs font-semibold tracking-wide md:text-sm">
                  {name}
                  {#if !isActive}
                    <span class="ml-2 text-[10px] italic opacity-60">Coming soon</span>
                  {/if}
                </span>
                <span class="text-[10px] opacity-70 md:text-[11px]">
                  {isActive ? (levelSentenceCounts[level] ?? 0) + ' sentences' : ''}
                </span>
              </button>
            {/each}
          </div>

          <!-- Back + Begin row -->
          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-4 py-2 text-xs text-cork-200 transition-all hover:bg-cork-600"
              onclick={backToMain}
            >
              Back
            </button>
            <button
              type="button"
              class="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-red-700 px-6 py-2.5 font-display text-lg text-amber-100 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={selectedLevels.size === 0}
              onclick={beginGame}
            >
              Begin
            </button>
          </div>
        {:else if menuScreen === 'options'}
          <!-- ── OPTIONS ── -->
          <div class="flex flex-1 flex-col gap-5 py-6">
            <!-- Music toggle -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Music class="size-4 text-cork-400" />
                <span class="text-sm text-cork-200">Music</span>
              </div>
              <button
                type="button"
                class="toggle-switch {musicEnabled ? 'on' : 'off'}"
                onclick={toggleMusic}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <!-- Sounds toggle -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Volume2 class="size-4 text-cork-400" />
                <span class="text-sm text-cork-200">Sound Effects</span>
              </div>
              <button
                type="button"
                class="toggle-switch {soundsEnabled ? 'on' : 'off'}"
                onclick={toggleSounds}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="flex-1"></div>

            <!-- Back button at bottom -->
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
              onclick={backToMain}
            >
              Back
            </button>
          </div>
        {/if}
          </div>
        </div>
      </div>
    </div>

  {:else if gameState === 'playing'}
    <!-- ── SENTENCE GAME SCREEN ── -->
    <div class="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 px-2 pb-8 md:gap-6 md:min-h-[calc(100dvh-10rem)]">

      <!-- Health bar -->
      <div class="flex w-full items-center justify-between gap-2">
        <div class="flex items-center gap-0.5 md:gap-1">
          {#each Array(maxHealth) as _, i}
            <span class="transition-all duration-300 {i < health ? 'scale-100 opacity-100' : 'scale-75 opacity-30'}">
              <Heart
                class="size-4 md:size-5 {i < health ? 'fill-red-400 text-red-400' : 'text-cork-300'}"
              />
            </span>
          {/each}
        </div>

        <div class="flex items-center gap-1.5 md:gap-2">
          <div class="flex items-center gap-1 rounded-full bg-cork-100 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1">
            <span class="text-[9px] font-medium uppercase tracking-wider text-cork-400 md:text-[10px]">Score</span>
            <span class="font-display text-sm text-cork-700 md:text-base">{totalCorrect}</span>
          </div>
          <div class="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1">
            <span class="hidden text-[9px] font-medium uppercase tracking-wider text-amber-500 sm:inline md:text-[10px]">Best</span>
            <span class="font-display text-sm text-amber-700 md:text-base">{highscore.score}</span>
          </div>
        </div>
      </div>

      <!-- Sentence card -->
      {#if currentSentence}
        {@const heat = streak >= 11 ? 'inferno' : streak >= 8 ? 'blaze' : streak >= 5 ? 'fire' : streak >= 3 ? 'warm' : ''}
        <div
          class="w-full rounded-2xl border p-4 text-center shadow-sm transition-all duration-300 md:p-10 {heat
            ? 'streak-' + heat
            : 'border-cork-300/50 bg-white'}"
        >
        {#if feedback === null}
          {#if heat}
            <p class="streak-text mb-2 text-xs font-semibold uppercase tracking-widest md:text-sm {heat === 'inferno' ? 'streak-inferno-text' : ''}">
              {streak} streak
            </p>
          {/if}
          <!-- English translation (the prompt) -->
          <p class="font-outfit text-lg leading-relaxed text-cork-800 md:text-3xl">
            {currentSentence.translation}
          </p>

          <!-- Character slots: one box per hanzi character -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-1 md:mt-6 md:gap-1.5">
            {#each userChars as _, i}
              {@const isPunct = currentSentence ? /[，。？、！；：]/.test([...currentSentence.hanzi][i]) : false}
              {#if isPunct}
                <span
                  class="char-slot char-punct"
                >{userChars[i]}</span>
              {:else}
                <input
                  bind:this={inputRefs[i]}
                  type="text"
                  inputmode="text"
                  lang="zh-CN"
                  autocapitalize="off"
                  autocomplete="off"
                  autocorrect="off"
                  spellcheck="false"
                  class="char-slot {userChars[i] ? 'filled' : 'empty'}"
                  bind:value={userChars[i]}
                  oninput={() => onSlotInput(i)}
                  onkeydown={(e) => onSlotKeydown(i, e)}
                  oncompositionstart={() => onCompositionStart(i)}
                  oncompositionend={onCompositionEnd}
                />
              {/if}
            {/each}
          </div>

        {:else if feedback === 'correct'}
          <p class="font-outfit text-lg leading-relaxed text-cork-800 md:text-3xl">
            {currentSentence.translation}
          </p>

        {:else if feedback === 'wrong'}
          <div class="flex flex-col items-center gap-2 md:gap-3">
            <div>
              <p class="font-outfit text-lg leading-relaxed text-cork-800 md:text-3xl">
                {currentSentence.translation}
              </p>
              <p class="text-xs text-cork-400 md:text-sm">{revealedPinyin}</p>
            </div>

            <!-- Character-by-character feedback: green if correct, red if wrong + show correct hanzi below -->
            <div class="flex flex-wrap items-start justify-center gap-x-1 gap-y-3 md:gap-x-1.5 md:gap-y-4">
              {#each [...currentSentence.hanzi] as correctChar, i}
                {#if /[，。？、！；：]/.test(correctChar)}
                  <span class="char-punct">{correctChar}</span>
                {:else}
                  {@const uc = userChars[i] || ''}
                  {@const ok = uc === correctChar}
                  <div class="char-result-stack">
                    <div class="char-slot {uc ? 'filled' : 'empty'}">
                      <span class="char-result-char {ok ? 'char-ok' : 'char-bad'}">{uc || ''}</span>
                    </div>
                    {#if !ok}
                      <span class="char-result-hint">{correctChar}</span>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
      {/if}

      <!-- Feedback flash -->
      {#if feedback === 'correct'}
        <div class="animate-pulse text-center text-sm font-semibold text-emerald-600">
          Correct!
        </div>
      {/if}

      <!-- Controls -->
      <div class="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {#if feedback === 'wrong'}
            <!-- Next button after wrong answer -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
              onclick={nextAfterWrong}
            >
              <ChevronRight class="size-4" />
              Next
            </button>
          {:else if feedback === 'correct'}
            <!-- Next button after correct, same style -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
              onclick={nextAfterWrong}
            >
              <ChevronRight class="size-4" />
              Next
            </button>
          {:else}
            <!-- Check button -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!userChars.some(c => c) || feedback !== null}
              onclick={checkAnswer}
            >
              <Check class="size-4" />
              Check
            </button>
            <!-- HSK badge -->
            <span class="inline-flex items-center rounded-lg bg-cork-100 px-3 py-2 text-[11px] font-semibold tracking-wider text-cork-400 uppercase">
              HSK {currentSentence?.level}
            </span>
            <!-- Skip button -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              disabled={feedback !== null}
              onclick={skipSentence}
            >
              <SkipForward class="size-4" />
              Skip
            </button>
          {/if}
        </div>
      </div>

  {:else if gameState === 'gameover'}
    <!-- ── GAME OVER SCREEN ── -->
    <div class="mx-auto flex max-w-lg flex-col items-center justify-center px-4 pb-8 min-h-[calc(100dvh-10rem)]">
      <div class="mb-6 text-center">
        <div class="mb-2 text-4xl md:text-5xl">💀</div>
        <h1 class="font-display text-3xl text-cork-800 md:text-5xl">Game Over</h1>
        <p class="mt-1 text-sm text-cork-500">Final Score: {totalCorrect}</p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap justify-center gap-2 md:gap-3">
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-xl bg-cork-700 p-3 text-cork-50 transition-all hover:bg-cork-800 hover:shadow-md"
          onclick={beginGame}
          aria-label="Play Again"
        >
          <RotateCcw class="size-5" />
        </button>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-xl border border-cork-300/50 bg-cork-50/80 px-6 py-2.5 font-display text-lg text-cork-700 transition-all hover:bg-cork-200/50"
          onclick={goToMenu}
        >
          Back to Menu
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .game-container {
    max-width: 100%;
  }

  /* ── Pagoda wood panel ── */
  .wood-panel {
    background:
      repeating-linear-gradient(
        87deg,
        transparent,
        transparent 18px,
        rgba(0,0,0,0.04) 18px,
        rgba(0,0,0,0.04) 19px
      ),
      repeating-linear-gradient(
        93deg,
        transparent,
        transparent 35px,
        rgba(0,0,0,0.025) 35px,
        rgba(0,0,0,0.025) 36px
      ),
      linear-gradient(
        180deg,
        #6d3022 0%,
        #5e271a 15%,
        #4f1f14 50%,
        #3d170e 85%,
        #5e271a 100%
      );
    position: relative;
    border: none;
    border-radius: 0 0 6px 6px;
  }

  /* Inner depth with pillar shadow accents */
  .wood-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(
        90deg,
        rgba(0,0,0,0.28) 0%,
        rgba(0,0,0,0.06) 14px,
        transparent 28px,
        transparent calc(100% - 28px),
        rgba(0,0,0,0.06) calc(100% - 14px),
        rgba(0,0,0,0.28) 100%
      ),
      linear-gradient(
        135deg,
        rgba(255,255,255,0.05) 0%,
        transparent 40%,
        rgba(0,0,0,0.15) 100%
      );
    pointer-events: none;
  }

  /* ── Pagoda Roof ── */
  .pagoda-roof {
    position: relative;
    height: 74px;
    margin: 0 -16px 0 -16px;
    overflow: visible;
    z-index: 2;
  }

  .roof-main {
    position: absolute;
    top: 16px;
    left: 0;
    right: 0;
    height: 52px;
  }

  /* Sweeping roof surface with dramatic curves */
  .roof-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      #1a1a1a 0%,
      #2a2a2a 15%,
      #383838 40%,
      #2d2d2d 70%,
      #1f1f1f 100%
    );
    clip-path: polygon(
      0% 100%,
      0% 80%,
      2% 74%,
      5% 48%,
      10% 20%,
      18% 6%,
      28% 1%,
      50% 0%,
      72% 1%,
      82% 6%,
      90% 20%,
      95% 48%,
      98% 74%,
      100% 80%,
      100% 100%
    );
    box-shadow:
      inset 0 1px 3px rgba(255,255,255,0.04),
      0 3px 12px rgba(0,0,0,0.5);
  }

  /* Roof tile lines */
  .roof-sweep::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 5px,
      rgba(255,255,255,0.025) 5px,
      rgba(255,255,255,0.025) 6px
    );
    clip-path: inherit;
    pointer-events: none;
  }

  /* Upturned flying eaves */
  .roof-eave {
    position: absolute;
    bottom: -3px;
    width: 28px;
    height: 18px;
    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  }

  .roof-eave.left {
    left: -6px;
    border-radius: 0 100% 4px 0;
    transform: rotate(-12deg);
    transform-origin: bottom right;
  }

  .roof-eave.right {
    right: -6px;
    border-radius: 100% 0 0 4px;
    transform: rotate(12deg);
    transform-origin: bottom left;
  }

  /* Ridge line across roof peak */
  .roof-ridge {
    position: absolute;
    top: 3px;
    left: 26%;
    right: 26%;
    height: 4px;
    background: linear-gradient(180deg, #555 0%, #333 100%);
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.4);
  }

  /* Finial — golden jewel at roof peak */
  .roof-finial {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 24px;
    z-index: 5;
  }

  .roof-finial::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 14px;
    background: linear-gradient(
      180deg,
      #e8c97a 0%,
      #c49b3c 30%,
      #a07828 60%,
      #c49b3c 100%
    );
    border-radius: 50% 50% 40% 40%;
    box-shadow:
      0 0 8px rgba(200, 160, 60, 0.5),
      inset 0 1px 2px rgba(255,255,255,0.3);
  }

  .roof-finial::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 10px;
    background: linear-gradient(180deg, #8b7355 0%, #5c4b3a 100%);
    border-radius: 0 0 2px 2px;
  }

  /* ── Dougong bracket layer ── */
  .dougong {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 12px;
    background:
      repeating-linear-gradient(
        90deg,
        #8b6914 0px,
        #6b4f10 2px,
        #8b6914 4px,
        #5c3d0e 6px,
        #8b6914 8px,
        #6b4f10 10px,
        #8b6914 12px
      ),
      linear-gradient(
        180deg,
        #7a5c1e 0%,
        #6b4f10 50%,
        #5c3d0e 100%
      );
    border-top: 1px solid #9b7920;
    border-bottom: 1px solid #4a3010;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 2px 4px rgba(0,0,0,0.4);
  }

  /* Toggle switch */
  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    padding: 0;
  }

  .toggle-switch.on {
    background: #d4a574;
  }

  .toggle-switch.off {
    background: #5c4b3a;
  }

  .toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #f5f0e8;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .toggle-switch.on .toggle-knob {
    transform: translateX(20px);
  }

  /* ── Streak fire system ── */

  /* Text: shared */
  .streak-text {
    background: linear-gradient(90deg, #f59e0b, #ef4444, #f97316, #f59e0b);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: fire-shift 1.5s linear infinite;
  }

  @keyframes fire-shift {
    0% { background-position: 200% 50%; }
    100% { background-position: 0% 50%; }
  }

  .streak-inferno-text {
    animation: fire-shift 0.6s linear infinite, inferno-shake 0.3s ease-in-out infinite;
    font-size: 1.1em;
  }

  /* Level 1: Warm (3-4) */
  .streak-warm {
    border-color: #fb923c;
    background: #fff7ed;
    box-shadow: 0 0 8px rgba(251, 146, 60, 0.3);
  }

  /* Level 2: Fire (5-7) */
  .streak-fire {
    border-color: #f59e0b;
    background: #fffbeb;
    box-shadow: 0 0 14px rgba(251, 191, 36, 0.45), 0 4px 20px rgba(251, 146, 60, 0.25);
    animation: fire-pulse 1.5s ease-in-out infinite;
  }

  @keyframes fire-pulse {
    0%, 100% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.45), 0 4px 20px rgba(251, 146, 60, 0.25); }
    50% { box-shadow: 0 0 24px rgba(251, 191, 36, 0.65), 0 6px 32px rgba(251, 146, 60, 0.4); }
  }

  /* Level 3: Blaze (8-10) */
  .streak-blaze {
    border-color: #ef4444;
    background: #fef2f2;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(249, 115, 22, 0.35), 0 6px 24px rgba(251, 146, 60, 0.3);
    animation: blaze-pulse 0.9s ease-in-out infinite;
  }

  @keyframes blaze-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(249, 115, 22, 0.35), 0 6px 24px rgba(251, 146, 60, 0.3); }
    50% { box-shadow: 0 0 32px rgba(239, 68, 68, 0.7), 0 0 56px rgba(249, 115, 22, 0.5), 0 8px 30px rgba(251, 146, 60, 0.45); }
  }

  /* Level 4: Inferno (11+) */
  .streak-inferno {
    border-color: #dc2626;
    background: #fef2f2;
    box-shadow: 0 0 28px rgba(220, 38, 38, 0.6), 0 0 50px rgba(234, 88, 12, 0.45), 0 0 70px rgba(251, 191, 36, 0.35), 0 6px 30px rgba(239, 68, 68, 0.4);
    animation: inferno-pulse 0.5s ease-in-out infinite, inferno-shake 0.3s ease-in-out infinite;
  }

  @keyframes inferno-pulse {
    0%, 100% { box-shadow: 0 0 28px rgba(220, 38, 38, 0.6), 0 0 50px rgba(234, 88, 12, 0.45), 0 0 70px rgba(251, 191, 36, 0.35), 0 6px 30px rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 40px rgba(220, 38, 38, 0.8), 0 0 70px rgba(234, 88, 12, 0.6), 0 0 90px rgba(251, 191, 36, 0.5), 0 8px 36px rgba(239, 68, 68, 0.55); }
  }

  @keyframes inferno-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-1px) rotate(-0.2deg); }
    75% { transform: translateX(1px) rotate(0.2deg); }
  }

  /* Prevent zoom on mobile input focus */
  @media (max-width: 768px) {
    input.char-slot {
      font-size: 1.35rem;
    }
  }

  /* ── Character slot styles ── */
  .char-slot {
    width: 2.75rem;
    height: 3.25rem;
    border: none;
    border-bottom: 2px solid #cdc3ae;
    background: transparent;
    text-align: center;
    font-family: var(--font-chinese);
    font-size: 1.75rem;
    line-height: 1;
    color: #3d3529;
    caret-color: #6b5e4a;
    outline: 2px solid transparent;
    outline-offset: -2px;
    --tw-ring-shadow: 0 0 0 transparent !important;
    box-shadow: none !important;
    transition: border-color 0.15s;
    padding: 0 0.15rem;
  }

  .char-slot:focus,
  .char-slot:focus-visible {
    border-bottom-color: #6b5e4a;
    outline: 2px solid transparent;
    outline-offset: -2px;
    --tw-ring-shadow: 0 0 0 transparent !important;
    box-shadow: none !important;
  }

  .char-slot.filled {
    border-bottom-color: #6b5e4a;
    color: #3d3529;
  }

  .char-slot.empty {
    border-bottom-color: #cdc3ae;
    color: #3d3529;
  }

  .char-punct {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 3.25rem;
    font-family: var(--font-chinese);
    font-size: 1.5rem;
    color: #b0a48e;
    pointer-events: none;
    margin: 0 -0.15rem;
    border-bottom: none !important;
  }

  /* ── Character feedback (check result) ── */
  .char-result-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .char-result-stack .char-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    caret-color: transparent;
  }

  .char-result-char {
    font-family: var(--font-chinese);
    font-size: inherit;
    line-height: inherit;
  }

  .char-result-char.char-ok {
    color: #059669;
  }

  .char-result-char.char-bad {
    color: #dc2626;
  }

  .char-result-hint {
    font-family: var(--font-chinese);
    font-size: 1.1rem;
    color: #3d3529;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .char-slot {
      width: 2.25rem;
      height: 2.75rem;
      font-size: 1.35rem;
    }
    .char-punct {
      height: 2.75rem;
      font-size: 1.15rem;
      width: 1rem;
    }
    .char-result-hint {
      font-size: 0.9rem;
    }
  }
</style>
