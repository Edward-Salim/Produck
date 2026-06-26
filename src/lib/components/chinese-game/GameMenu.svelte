<script lang="ts">
  import { onMount } from 'svelte';
  import { Music, Volume2, Lightbulb } from '@lucide/svelte';
  import type { GameEngine } from './game-engine.svelte.js';
  import { levelColorConfig } from './game-engine.svelte.js';

  let {
    engine,
    levelNames,
    levelSentenceCounts
  }: {
    engine: GameEngine;
    levelNames: Record<string, string>;
    levelSentenceCounts: Record<number, number>;
  } = $props();

  let butterflyCount = $state(20);
  let hasEntered = $state(false);

  function entrance(n: number) {
    return hasEntered ? '' : `menu-entrance menu-entrance-${n}`;
  }

  onMount(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    butterflyCount = mq.matches ? 8 : 20;
    const handler = (e: MediaQueryListEvent) => (butterflyCount = e.matches ? 8 : 20);
    mq.addEventListener('change', handler);
    setTimeout(() => {
      hasEntered = true;
    }, 600);
    return () => mq.removeEventListener('change', handler);
  });
</script>

<!-- Floating butterflies -->
<div class="butterflies" aria-hidden="true">
  {#each Array(butterflyCount) as _, i}
    {@const size = 0.45 + ((i * 0.06) % 0.4)}
    {@const hue = ['amber', 'gold', 'coral', 'rose', 'cream', 'ink'][i % 6]}
    <div
      class="butterfly butterfly-{i} butterfly--{hue}"
      style="
        left: {((i * 23 + 7) % 89) + 4}%;
        top: {((i * 37 + 13) % 82) + 6}%;
        animation-delay: {((i * 1.7) % 8).toFixed(1)}s;
        animation-duration: {7 + ((i * 0.6) % 6).toFixed(1)}s;
        font-size: {size.toFixed(2)}rem;
        opacity: {0.28 + ((i * 0.04) % 0.22).toFixed(2)};
      "
    >
      <div class="butterfly-inner butterfly-inner--{i % 3}">
        <div class="bf-body"></div>
        <div class="bf-wing"></div>
      </div>
    </div>
  {/each}
</div>

<!-- ── MENU / LEVEL SELECT ── -->
<div
  class="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-8 md:min-h-[calc(100dvh-8rem)] md:flex-row md:items-center md:justify-center md:gap-6"
>
  <!-- Left column: Title + subtitle -->
  <div class="text-center md:w-48 md:text-left">
    <img
      src="/assets/produck-chinese-logo.png"
      alt="Hanzi Game logo"
      class="mx-auto mb-2 h-16 w-auto object-contain md:mx-0 md:h-20 {entrance(1)}"
    />
    <h1 class="font-display text-3xl text-cork-800 md:text-4xl {entrance(2)}">Hanzi Game</h1>
    <p class="mt-1 text-xs text-cork-500 md:text-sm {entrance(3)}">
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
      <div class="flex flex-1 flex-col px-5 pt-3 pb-5">
        {#if engine.menuScreen === 'main'}
          <!-- ── MAIN MENU ── -->
          <div class="flex flex-1 flex-col justify-center gap-3 py-6">
            <button
              type="button"
              class="flex w-full cursor-pointer {entrance(
                5
              )} items-center justify-center rounded-lg bg-red-700 px-6 py-3 font-display text-xl text-amber-100 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-900/30"
              onclick={() => engine.openDifficulty()}
            >
              Start Game
            </button>
            <button
              type="button"
              class="flex w-full cursor-pointer {entrance(
                5
              )} items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
              onclick={() => engine.openOptions()}
            >
              Options
            </button>
            <a
              href="/tools"
              class="flex w-full cursor-pointer {entrance(
                5
              )} items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
            >
              Back
            </a>
          </div>

          <!-- Highscore -->
          <div class="mt-auto mb-1 text-center {entrance(6)}">
            <span class="text-[10px] font-semibold tracking-wider text-amber-400/80 uppercase"
              >High Score</span
            >
            {#if engine.restored}
              <span class="mx-1.5 font-display text-base text-amber-300"
                >{engine.highscore.score}</span
              >
              {#if engine.highscore.name}
                <span class="text-[10px] text-amber-400/60">by {engine.highscore.name}</span>
              {/if}
            {:else}
              <span
                class="mx-1.5 inline-block h-4 w-10 animate-pulse rounded bg-amber-400/20 align-middle"
              ></span>
              <span class="inline-block h-3 w-16 animate-pulse rounded bg-amber-400/10 align-middle"
              ></span>
            {/if}
          </div>
        {:else if engine.menuScreen === 'difficulty'}
          <!-- ── DIFFICULTY SELECT ── -->

          <!-- Instructions -->
          <p class="mb-4 text-center text-xs leading-relaxed text-cork-300">
            Pick levels, hit Begin. <strong class="font-semibold text-amber-400">3 hearts</strong>,
            gain up to 5. Lose one per mistake.
          </p>

          <!-- Level grid -->
          <div class="flex w-full flex-col gap-1">
            {#each Object.entries(levelNames) as [levelStr, name]}
              {@const level = Number(levelStr)}
              {@const isActive = level <= 7}
              {@const isMastered = engine.isLevelMastered(level)}
              {@const total = levelSentenceCounts[level] ?? 0}
              {@const done = (engine.masteredHanzi[level] ?? []).length}
              {@const colors = levelColorConfig[Math.min(level - 1, levelColorConfig.length - 1)]}
              {@const isSelected = engine.selectedLevels.has(level)}
              {@const goldText =
                isMastered && !isSelected
                  ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                  : ''}
              <button
                type="button"
                disabled={!isActive}
                class="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left transition-all {isMastered &&
                isSelected
                  ? colors.mastered + ' gold-plated'
                  : isSelected
                    ? colors.active
                    : isActive
                      ? colors.base
                      : 'border-cork-800/40 bg-cork-900/30 text-cork-600'}"
                onclick={() => engine.toggleLevel(level)}
              >
                <span class="text-xs font-semibold tracking-wide md:text-sm {goldText}">
                  {name}
                  {#if !isActive && !isMastered}
                    <span class="ml-2 text-[10px] italic opacity-60">Coming soon</span>
                  {/if}
                </span>
                <span class="text-[10px] opacity-70 md:text-[11px] {goldText}">
                  {#if isActive}
                    {#if done > 0}
                      {done}/{total}
                    {:else}
                      {total} sentences
                    {/if}
                  {/if}
                </span>
              </button>
            {/each}
          </div>

          <!-- Back + Begin row -->
          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-4 py-2 text-xs text-cork-200 transition-all hover:bg-cork-600"
              onclick={() => engine.backToMain()}
            >
              Back
            </button>
            <button
              type="button"
              class="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-red-700 px-6 py-2.5 font-display text-lg text-amber-100 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={engine.selectedLevels.size === 0}
              onclick={() => engine.beginGame()}
            >
              Begin
            </button>
          </div>
        {:else if engine.menuScreen === 'options'}
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
                class="toggle-switch {engine.musicEnabled ? 'on' : 'off'}"
                onclick={() => engine.toggleMusic()}
                aria-label="Toggle music"
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
                class="toggle-switch {engine.soundsEnabled ? 'on' : 'off'}"
                onclick={() => engine.toggleSounds()}
                aria-label="Toggle sound effects"
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
                class="toggle-switch {engine.hintAlwaysOn ? 'on' : 'off'}"
                onclick={() => engine.toggleHintAlwaysOn()}
                aria-label="Toggle always show hint"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="flex-1"></div>

            <!-- Back button at bottom -->
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
              onclick={() => engine.backToMain()}
            >
              Back
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
