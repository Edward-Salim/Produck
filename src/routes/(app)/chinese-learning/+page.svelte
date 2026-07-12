<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types.js';
  import {
    GameEngine,
    type SentenceData
  } from '$lib/components/chinese-game/game-engine.svelte.js';
  import GameMenu from '$lib/components/chinese-game/GameMenu.svelte';
  import GamePlay from '$lib/components/chinese-game/GamePlay.svelte';
  import GameOver from '$lib/components/chinese-game/GameOver.svelte';
  import InkWashBg from '$lib/components/chinese-game/InkWashBg.svelte';
  import '$lib/components/chinese-game/game.css';

  let { data }: { data: PageData } = $props();
  let sentences = $derived(data.sentences);
  let levelNames = $derived(data.levelNames);

  // ── Create engine ──
  let engine = new GameEngine();

  // ── Sounds ──
  let correctSound: HTMLAudioElement;
  let wrongSound: HTMLAudioElement;
  let gameOverSound: HTMLAudioElement;
  let bgMusic: HTMLAudioElement;
  let audioCtx: AudioContext | undefined;
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

    // Wire up engine callbacks
    engine.setCallbacks({
      onCorrect() {
        if (engine.soundsEnabled && correctSound) {
          correctSound.currentTime = 0;
          correctSound.play().catch(() => {});
        }
      },
      onWrong() {
        if (engine.soundsEnabled && wrongSound) {
          wrongSound.currentTime = 0;
          wrongSound.play().catch(() => {});
        }
      },
      onGameOver() {
        if (engine.soundsEnabled) gameOverSound?.play().catch(() => {});
      },
      onHealthGain() {
        if (engine.soundsEnabled) playHealthGain();
      },
      onStroke: playStroke,
      onClick: playClick,
      onMusicToggle(enabled: boolean) {
        if (bgMusic) {
          if (enabled) bgMusic.play().catch(() => {});
          else bgMusic.pause();
        }
      },
      getAudioCtx: () => audioCtx,
      setAudioCtx: (ctx: AudioContext) => {
        audioCtx = ctx;
      }
    });

    if (engine.musicEnabled) bgMusic.play().catch(() => {});
  });

  onDestroy(() => {
    bgMusic?.pause();
    bgMusic = undefined as any;
    correctSound = undefined as any;
    wrongSound = undefined as any;
    gameOverSound = undefined as any;
  });

  function playStroke() {
    if (!engine.soundsEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
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

  function playClick() {
    if (!engine.soundsEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch {}
  }

  function playHealthGain() {
    if (!engine.soundsEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      // Two-note ascending chime
      [523, 784].forEach((freq, i) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        const t = now + i * 0.09;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {}
  }

  // ── Window keydown handler ──
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (engine.gameState === 'gameover') {
        engine.beginGame();
        return;
      }
      if (
        (engine.feedback === 'correct' || engine.feedback === 'wrong') &&
        engine.gameState === 'playing' &&
        !engine.advancing
      ) {
        engine.nextAfterWrong();
      }
    }
  }

  // ── Init engine when data loads ──
  let inited = $state(false);
  let ready = $state(false);

  $effect(() => {
    if (sentences.length > 0 && !inited) {
      engine.init(sentences as SentenceData[], levelNames);
      engine.fetchLeaderboard();

      // Check if there's a saved game to restore
      let hasSaved = false;
      try {
        const raw = localStorage.getItem('hanzi-game-save-v2');
        if (raw) {
          const data = JSON.parse(raw);
          hasSaved = data?.gameState && data.gameState !== 'menu';
        }
      } catch {}

      const minDelay = new Promise((r) => setTimeout(r, hasSaved ? 500 : 200));

      Promise.all([engine.loadSettings(), minDelay])
        .then(([prefs]) => {
          if (prefs?.gameState && prefs.gameState.gameState !== 'menu') {
            engine.restoreGameData(prefs.gameState);
          } else {
            const saved = engine.loadState();
            if (saved && saved.gameState !== 'menu') {
              engine.restoreGameData(saved);
            }
          }
          engine.restored = true;
          ready = true;
        })
        .catch(() => {
          const saved = engine.loadState();
          if (saved && saved.gameState !== 'menu') {
            engine.restoreGameData(saved);
          }
          engine.restored = true;
          ready = true;
        });
      inited = true;
    }
  });
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
  <title>Chinese Learning | Produck</title>
</svelte:head>

<div class="game-container">
  <InkWashBg />

  {#if !ready}
    <div
      class="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col items-center justify-center px-4"
    >
      <p class="animate-pulse font-display text-2xl text-cork-600 md:text-3xl">加载中...</p>
    </div>
  {:else if engine.gameState === 'menu'}
    <GameMenu {engine} {levelNames} levelSentenceCounts={engine.levelSentenceCounts} />
  {:else if engine.gameState === 'playing'}
    <GamePlay {engine} />
  {:else if engine.gameState === 'gameover'}
    <GameOver {engine} />
  {/if}
</div>
