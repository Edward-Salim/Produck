<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { Heart, Zap, RotateCcw, Play, Send, ArrowRight, SkipForward, ArrowLeft, Music, Volume2, Lightbulb } from '@lucide/svelte';
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

  // ── Hint settings ──
  let hintAlwaysOn = $state(false);
  let hintsUsed = $state(0);

  async function loadSettings() {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const p = await res.json();
        musicEnabled = p.music ?? true;
        soundsEnabled = p.sounds ?? true;
        hintAlwaysOn = p.hintAlwaysOn ?? false;
        if (p.highscore != null) {
          highscore = { score: p.highscore as number, name: (p.highscoreName as string) ?? 'Edward' };
        }
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
        hintAlwaysOn = s.hintAlwaysOn ?? false;
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
        body: JSON.stringify({ music: musicEnabled, sounds: soundsEnabled, hintAlwaysOn, selectedLevels: [...selectedLevels] })
      });
    } catch {}
    try { localStorage.setItem('hanzi-game-settings', JSON.stringify({ music: musicEnabled, sounds: soundsEnabled, hintAlwaysOn, selectedLevels: [...selectedLevels] })); } catch {}
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

  function toggleHintAlwaysOn() {
    hintAlwaysOn = !hintAlwaysOn;
    saveSettings();
  }

  // ── Game state ──
  let gameState = $state<GameState>('menu');
  let currentSentence = $state<SentenceData | null>(null);
  let currentLevel = $state(0);
  let userChars = $state<string[]>([]);
  let hintedSlots = $state<Set<number>>(new Set());
  let hintUsedThisSentence = $state(false);
  let advancing = $state(false);
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
  let restored = $state(false);

  let highscore = $state<{ score: number; name: string }>({ score: 0, name: '' });
  let leaderboard = $state<{ name: string; score: number }[]>([]);

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/hanzi-leaderboard');
      if (res.ok) leaderboard = await res.json();
    } catch {}
  }

  async function updateHighscore(score: number) {
    if (score >= highscore.score) {
      highscore = { score, name: 'Edward' };
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ highscore: score, highscoreName: 'Edward' })
        });
        await fetchLeaderboard();
      } catch {}
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
      revealedPinyin: revealedPinyin,
      hintedSlots: [...hintedSlots],
      hintUsedThisSentence
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
    // Reconstruct current sentence (poolIndex was already incremented past it, so go back one)
    const idx = ((data.poolIndex - 1) + savedShuffled.length) % savedShuffled.length;
    currentSentence = savedShuffled[idx];

    // Restore hinted slots
    hintedSlots = new Set(data.hintedSlots ?? []);
    hintUsedThisSentence = data.hintUsedThisSentence ?? false;

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
    // Re-apply hinted characters
    for (const i of hintedSlots) {
      userChars[i] = [...currentSentence.hanzi][i];
    }

    // Focus first non-hinted editable slot after DOM update
    if (feedback === null) {
      tick().then(() => {
        const chars = [...currentSentence.hanzi];
        for (let i = 0; i < chars.length; i++) {
          if (!/[，。？、！；：]/.test(chars[i]) && !hintedSlots.has(i)) {
            inputRefs[i]?.focus();
            break;
          }
        }
      });
    }
  }

  // Restore saved game + load highscore once sentences are loaded
  $effect(() => {
    if (sentences.length > 0 && !restored) {
      fetchLeaderboard();
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
    hintedSlots = new Set();
    feedback = null;
    revealedHanzi = '';
    revealedPinyin = '';
    gameState = 'playing';

    // Prime audio context so stroke sounds work immediately
    if (!audioCtx) { audioCtx = new AudioContext(); }
    audioCtx.resume();
    showNextSentence();
  }

  function swapAhead(minPct: number) {
    // Swap the just-answered sentence (at poolIndex - 1) with one further ahead
    const idx = (poolIndex - 1 + shuffled.length) % shuffled.length;
    if (shuffled.length <= 2) return;
    const minOffset = Math.floor(shuffled.length * minPct);
    const maxOffset = shuffled.length - 2;
    if (minOffset >= maxOffset) return;
    const offset = minOffset + Math.floor(Math.random() * (maxOffset - minOffset));
    const targetIdx = (poolIndex + offset) % shuffled.length;
    const tmp = shuffled[idx];
    shuffled[idx] = shuffled[targetIdx];
    shuffled[targetIdx] = tmp;
  }

  function pushBackCurrent() {
    // Correct answer: push far back (60%+)
    swapAhead(0.6);
  }

  function pushBackWrong() {
    // Wrong answer: push back moderately (30%+) so it doesn't repeat immediately
    swapAhead(0.3);
  }

  function showNextSentence() {
    // If we've wrapped around the pool, reshuffle to get a fresh order
    if (poolIndex >= shuffled.length) {
      poolIndex = 0;
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    const s = shuffled[poolIndex];
    poolIndex++;
    currentSentence = s;
    currentLevel = s.level;
    userChars = [...s.hanzi].map(c => /[，。？、！；：]/.test(c) ? c : '');
    hintedSlots = new Set();
    hintUsedThisSentence = false;
    advancing = false;
    feedback = null;
    revealedHanzi = '';
    revealedPinyin = '';

    saveState();

    // Auto-focus first editable slot after DOM update (and auto-hint if enabled)
    tick().then(() => {
      if (hintAlwaysOn) {
        useHint();
      }
      // Focus the first non-hinted, non-punct slot
      const chars = [...s.hanzi];
      for (let i = 0; i < chars.length; i++) {
        if (!/[，。？、！；：]/.test(chars[i]) && !hintedSlots.has(i)) {
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
      totalCorrect += currentSentence?.level ?? 1;
      feedback = 'correct';
      advancing = true;
      if (soundsEnabled && correctSound) { correctSound.currentTime = 0; correctSound.play().catch(() => {}); }
      pushBackCurrent();
      saveState();
      // Brief delay so the correct animation is visible before advancing
      setTimeout(() => { advancing = false; showNextSentence(); }, 600);
    } else {
      health--;
      streak = 0;
      feedback = 'wrong';
      if (soundsEnabled && wrongSound) { wrongSound.currentTime = 0; wrongSound.play().catch(() => {}); }
      revealedHanzi = currentSentence.hanzi;
      revealedPinyin = currentSentence.pinyin;
      pushBackWrong();
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
    pushBackWrong();
    saveState();
  }

  function nextAfterWrong() {
    if (advancing) return;
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
      if (!isPunct(chars[j]) && !hintedSlots.has(j)) return j;
    }
    return fromIndex;
  }

  function prevEditableSlot(fromIndex: number): number {
    if (!currentSentence) return fromIndex;
    const chars = [...currentSentence.hanzi];
    for (let j = fromIndex - 1; j >= 0; j--) {
      if (!isPunct(chars[j]) && !hintedSlots.has(j)) return j;
    }
    return fromIndex;
  }

  function useHint() {
    if (!currentSentence || feedback !== null || hintUsedThisSentence) return;
    const chars = [...currentSentence.hanzi];

    // Collect all editable slots that aren't already hinted (empty or user-filled can be overridden)
    const candidates: number[] = [];
    for (let i = 0; i < chars.length; i++) {
      if (!isPunct(chars[i]) && !hintedSlots.has(i)) {
        candidates.push(i);
      }
    }
    if (candidates.length === 0) return;

    // Fisher-Yates partial shuffle to pick random slots without replacement
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Reveal count proportional to sentence length: ~25% of hintable slots, min 1, max 4
    const revealCount = Math.max(1, Math.min(4, Math.ceil(candidates.length * 0.25)));
    const revealed = shuffled.slice(0, Math.min(revealCount, shuffled.length));
    for (const idx of revealed) {
      userChars[idx] = chars[idx];
    }
    hintedSlots = new Set([...hintedSlots, ...revealed]);
    hintUsedThisSentence = true;
    hintsUsed += revealed.length;
    playStroke();
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
      // If this slot is hinted and the character matches, consume it (already correct)
      if (hintedSlots.has(slot) && userChars[slot] === ch) {
        slot++;
        continue;
      }
      // If hinted but different char, skip to next non-hinted slot
      while (slot < userChars.length && hintedSlots.has(slot)) {
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
    // Hinted slots are locked — revert any change
    if (i >= 0 && hintedSlots.has(i)) {
      userChars[i] = currentSentence ? [...currentSentence.hanzi][i] : '';
      return;
    }
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
    // Hinted slots are locked — revert any change
    if (hintedSlots.has(index)) {
      userChars[index] = currentSentence ? [...currentSentence.hanzi][index] : '';
      return;
    }
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
    // Hinted slots are locked — prevent editing
    if (hintedSlots.has(index) && (e.key === 'Backspace' || e.key === 'Delete' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey))) {
      e.preventDefault();
      return;
    }
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
        if (!isPunct(chars[j]) && !hintedSlots.has(j)) { inputRefs[j]?.focus(); break; }
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
      if ((feedback === 'correct' || feedback === 'wrong') && gameState === 'playing' && !advancing) {
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
          src="/assets/produck-chinese-logo-whitebg.png"
          alt="Hanzi Game logo"
          class="mx-auto mb-2 h-16 w-auto object-contain md:mx-0 md:h-20"
        />
        <h1 class="font-display text-3xl text-cork-800 md:text-4xl">Hanzi Game</h1>
        <p class="mt-1 text-xs text-cork-500 md:text-sm">
          Your future in 中国 starts with every 汉字 you master
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

            <!-- Hint always-on toggle -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Lightbulb class="size-4 text-cork-400" />
                <span class="text-sm text-cork-200">Always Show Hint</span>
              </div>
              <button
                type="button"
                class="toggle-switch {hintAlwaysOn ? 'on' : 'off'}"
                onclick={toggleHintAlwaysOn}
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
    {@const heat = streak >= 21 ? 'inferno' : streak >= 14 ? 'blaze' : streak >= 8 ? 'fire' : streak >= 5 ? 'hot' : streak >= 3 ? 'warm' : ''}
    <!-- Full-viewport streak overlay (subtle, only for higher tiers) -->
    <div
      class="streak-overlay {heat === 'blaze' ? 'streak-overlay-blaze' : heat === 'inferno' ? 'streak-overlay-inferno' : 'streak-overlay-idle'}"
    >
      {#if heat === 'blaze' || heat === 'inferno'}
        {@const count = heat === 'inferno' ? 24 : 14}
        <div class="particles" aria-hidden="true" class:particles-visible={heat === 'blaze' || heat === 'inferno'}>
          {#if heat === 'blaze' || heat === 'inferno'}
            {#each Array(count) as _, i}
              <span
                class="particle"
                style="left: {((i * 37 + 13) % 100)}%; animation-delay: {((i * 0.7) % 4).toFixed(1)}s; animation-duration: {3 + ((i * 0.4) % 4).toFixed(1)}s"
              ></span>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <div class="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 px-2 pb-8 md:gap-6 md:min-h-[calc(100dvh-10rem)] relative z-10">

      <!-- Health bar -->
      <div class="flex w-full items-center justify-between gap-2">
        <div class="flex items-center gap-1 md:gap-1.5">
          {#each Array(maxHealth) as _, i}
            {#if i < health}
              <span class="transition-all duration-300 scale-100">
                <Heart class="size-5 md:size-6 fill-red-500 text-red-500 drop-shadow-red" />
              </span>
            {:else}
              <span class="transition-all duration-300 opacity-40">
                <Heart class="size-5 md:size-6 text-cork-500" />
              </span>
            {/if}
          {/each}
        </div>

        <div class="flex items-center gap-1.5 md:gap-2">
          <div class="flex items-center gap-1 rounded-full bg-cork-100 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1">
            <span class="text-[9px] font-medium uppercase tracking-wider text-cork-400 md:text-[10px]">Score</span>
            <span class="font-display text-sm text-cork-700 md:text-base">{totalCorrect}</span>
          </div>
          <div class="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1">
            <span class="text-[9px] font-medium uppercase tracking-wider text-amber-500 md:text-[10px]">Best</span>
            <span class="font-display text-sm text-amber-700 md:text-base">{highscore.score}</span>
          </div>
        </div>
      </div>

      <!-- Sentence card -->
      {#if currentSentence}
        <div
          class="w-full rounded-2xl border p-4 text-center shadow-sm transition-all duration-300 md:p-10 {heat
            ? 'streak-' + heat
            : 'border-cork-300/50 bg-white'} {feedback === 'correct' ? 'card-correct' : ''}"
        >
        {#if feedback === null}
          {#if heat}
            <p class="streak-text mb-2 text-xs font-semibold uppercase tracking-widest md:text-sm">
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
                  class="char-slot {userChars[i] ? 'filled' : 'empty'} {hintedSlots.has(i) ? 'hinted' : ''}"
                  bind:value={userChars[i]}
                  readonly={hintedSlots.has(i)}
                  tabindex={hintedSlots.has(i) ? -1 : 0}
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
          <div class="mt-4 flex flex-wrap items-center justify-center gap-1 md:mt-6 md:gap-1.5">
            {#each userChars as ch, i}
              {#if currentSentence && /[，。？、！；：]/.test([...currentSentence.hanzi][i])}
                <span class="char-punct">{ch}</span>
              {:else}
                <span class="char-slot filled flex items-center justify-center">
                  <span class="text-emerald-600">{ch || ''}</span>
                </span>
              {/if}
            {/each}
          </div>

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

      <!-- Controls -->
      <div class="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {#if feedback === 'wrong'}
            <!-- Next button after wrong answer -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
              onclick={nextAfterWrong}
            >
              Next
              <ArrowRight class="size-4" />
            </button>
          {:else if feedback === 'correct'}
            <!-- Next button after correct, same style -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
              onclick={nextAfterWrong}
            >
              Next
              <ArrowRight class="size-4" />
            </button>
          {:else}
            <!-- HSK badge (far left) -->
            <span class="inline-flex items-center rounded-lg bg-cork-100 px-3 py-2 text-[11px] font-semibold tracking-wider text-cork-400 uppercase">
              HSK {currentSentence?.level}
            </span>
            <!-- Skip button -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              disabled={feedback !== null}
              onclick={skipSentence}
              aria-label="Skip"
            >
              <SkipForward class="size-4" />
            </button>
            <!-- Hint button -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              disabled={feedback !== null || hintUsedThisSentence}
              onclick={useHint}
              aria-label="Hint"
            >
              <Lightbulb class="size-4" />
            </button>
            <!-- Check button -->
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!userChars.some(c => c) || feedback !== null}
              onclick={checkAnswer}
              aria-label="Check"
            >
              <Send class="size-4" />
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
        <p class="mt-1 text-sm text-cork-500">Final Score: <span class="font-outfit italic">{totalCorrect}</span></p>
        <p class="mt-0.5 text-xs text-cork-400">Personal Best: <span class="font-outfit italic">{highscore.score}</span></p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap justify-center gap-2 md:gap-3">
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-xl border border-cork-300/50 bg-cork-50/80 p-2.5 text-cork-700 transition-all hover:bg-cork-200/50"
          onclick={beginGame}
          aria-label="Try Again"
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

  /* ── Streak background ── */
  .streak-overlay {
    position: fixed;
    inset: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
    transition: background 1.2s ease, opacity 0.8s ease;
  }

  .streak-overlay-idle {
    background: transparent;
    opacity: 0;
  }

  .streak-overlay-blaze {
    background: linear-gradient(180deg, rgba(255,247,237,0.6) 0%, rgba(254,215,170,0.5) 30%, rgba(251,146,60,0.35) 70%, rgba(254,242,242,0.4) 100%);
    opacity: 1;
  }

  .streak-overlay-inferno {
    background: linear-gradient(180deg, rgba(254,242,242,0.5) 0%, rgba(254,202,202,0.45) 25%, rgba(248,113,113,0.35) 55%, rgba(220,38,38,0.3) 80%, rgba(127,29,29,0.25) 100%);
    opacity: 1;
    animation: bg-flicker 0.6s ease-in-out infinite alternate;
  }

  @keyframes bg-flicker {
    0% { background: linear-gradient(180deg, rgba(254,242,242,0.5) 0%, rgba(254,202,202,0.45) 25%, rgba(248,113,113,0.35) 55%, rgba(220,38,38,0.3) 80%, rgba(127,29,29,0.25) 100%); }
    100% { background: linear-gradient(180deg, rgba(254,242,242,0.6) 0%, rgba(252,165,165,0.55) 25%, rgba(239,68,68,0.45) 55%, rgba(185,28,28,0.4) 80%, rgba(69,10,10,0.35) 100%); }
  }

  /* ── Floating particles ── */
  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .particle {
    position: absolute;
    bottom: -8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f59e0b;
    box-shadow: 0 0 6px #f97316;
    animation: float-up linear infinite;
  }

  .streak-overlay-blaze .particle {
    background: #f97316;
    box-shadow: 0 0 8px #ef4444;
    width: 7px;
    height: 7px;
  }

  .streak-overlay-inferno .particle {
    background: #ef4444;
    box-shadow: 0 0 10px #facc15, 0 0 20px #f97316;
    width: 8px;
    height: 8px;
  }

  @keyframes float-up {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) scale(0); opacity: 0; }
  }

  /* ── Streak fire system ── */

  /* Text: number-focused, only inferno gets animated gradient */
  .streak-text {
    color: #f59e0b;
  }

  .streak-fire .streak-text,
  .streak-blaze .streak-text {
    background: linear-gradient(90deg, #f59e0b, #f97316);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .streak-inferno .streak-text {
    background: linear-gradient(90deg, #f59e0b, #ef4444, #f97316, #f59e0b);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: fire-shift 0.8s linear infinite, inferno-shake 0.3s ease-in-out infinite;
  }

  @keyframes fire-shift {
    0% { background-position: 200% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes card-correct-pop {
    0% { transform: scale(1); border-color: #c4a97d; box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
    30% { transform: scale(1.02); border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    100% { transform: scale(1); border-color: #10b981; box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
  }

  .card-correct {
    animation: card-correct-pop 0.5s ease-out;
    border-color: #10b981 !important;
  }

  /* Level 1: Warm (3-4) */
  /* Level 1: Warm (3-4) */
  .streak-warm {
    border-color: rgba(251, 146, 60, 0.2);
    background: linear-gradient(135deg, rgba(255,247,237,0.6) 0%, rgba(255,237,213,0.4) 50%, transparent 100%);
  }

  /* Level 2: Hot (5-7) */
  .streak-hot {
    border-color: rgba(251, 146, 60, 0.25);
    background: linear-gradient(135deg, rgba(255,247,237,0.7) 0%, rgba(254,215,170,0.5) 50%, transparent 100%);
  }

  /* Level 3: Fire (8-13) */
  .streak-fire {
    border-color: transparent;
    background: linear-gradient(135deg, rgba(255,251,235,0.8) 0%, rgba(254,243,199,0.6) 50%, rgba(251,237,220,0.3) 100%);
    box-shadow: 0 0 24px rgba(251, 191, 36, 0.2), 0 0 48px rgba(251, 146, 60, 0.1);
    animation: fire-pulse 1.5s ease-in-out infinite;
  }

  @keyframes fire-pulse {
    0%, 100% { box-shadow: 0 0 24px rgba(251, 191, 36, 0.2), 0 0 48px rgba(251, 146, 60, 0.1); }
    50% { box-shadow: 0 0 36px rgba(251, 191, 36, 0.35), 0 0 64px rgba(251, 146, 60, 0.18); }
  }

  /* Level 4: Blaze (14-20) */
  .streak-blaze {
    border-color: transparent;
    background: linear-gradient(135deg, rgba(254,242,242,0.7) 0%, rgba(252,211,211,0.5) 40%, rgba(251,211,190,0.3) 100%);
    box-shadow: 0 0 32px rgba(239, 68, 68, 0.2), 0 0 64px rgba(249, 115, 22, 0.12), 0 0 88px rgba(251, 146, 60, 0.06);
    animation: blaze-pulse 1s ease-in-out infinite;
  }

  @keyframes blaze-pulse {
    0%, 100% { box-shadow: 0 0 32px rgba(239, 68, 68, 0.2), 0 0 64px rgba(249, 115, 22, 0.12), 0 0 88px rgba(251, 146, 60, 0.06); }
    50% { box-shadow: 0 0 44px rgba(239, 68, 68, 0.35), 0 0 80px rgba(249, 115, 22, 0.22), 0 0 104px rgba(251, 146, 60, 0.14); }
  }

  /* Level 5: Inferno (21+) */
  .streak-inferno {
    border-color: transparent;
    background: linear-gradient(135deg, rgba(254,242,242,0.7) 0%, rgba(252,195,195,0.5) 35%, rgba(248,180,150,0.3) 100%);
    box-shadow: 0 0 40px rgba(220, 38, 38, 0.25), 0 0 72px rgba(234, 88, 12, 0.15), 0 0 104px rgba(251, 191, 36, 0.08);
    animation: inferno-pulse 0.7s ease-in-out infinite, inferno-shake 0.3s ease-in-out infinite;
  }

  @keyframes inferno-pulse {
    0%, 100% { box-shadow: 0 0 48px rgba(220, 38, 38, 0.3), 0 0 88px rgba(234, 88, 12, 0.2), 0 0 120px rgba(251, 191, 36, 0.12); }
    50% { box-shadow: 0 0 72px rgba(220, 38, 38, 0.5), 0 0 120px rgba(234, 88, 12, 0.35), 0 0 160px rgba(251, 191, 36, 0.2); }
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

  .char-slot.hinted {
    border-bottom-style: dashed;
    border-bottom-color: #c4a97d;
    color: #b0a090;
    cursor: default;
    background: linear-gradient(to top, rgba(196, 169, 125, 0.12), transparent 50%);
    caret-color: transparent;
    pointer-events: none;
  }

  .drop-shadow-red {
    filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.5));
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
