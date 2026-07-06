<script lang="ts">
  import { onMount } from 'svelte';
  import { Music, Volume2, Lightbulb } from '@lucide/svelte';
  import type { GameEngine } from './game-engine.svelte.js';
  import { levelColorConfig } from './game-engine.svelte.js';
  import hanziModeCard from '$lib/assets/tool-cards/chinese-hanzi-mode.png';
  import readingModeCard from '$lib/assets/tool-cards/chinese-reading-mode.png';

  let {
    engine,
    levelNames,
    levelSentenceCounts
  }: {
    engine: GameEngine;
    levelNames: Record<string, string>;
    levelSentenceCounts: Record<number, number>;
  } = $props();

  let butterflyCount = $state(12);
  let hasEntered = $state(false);
  const READING_MASTERY_GOAL = 10;

  function entrance(n: number) {
    return hasEntered ? '' : `menu-entrance menu-entrance-${n}`;
  }

  onMount(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    butterflyCount = mq.matches ? 5 : 12;
    const handler = (e: MediaQueryListEvent) => (butterflyCount = e.matches ? 5 : 12);
    mq.addEventListener('change', handler);
    setTimeout(() => {
      hasEntered = true;
    }, 600);
    return () => mq.removeEventListener('change', handler);
  });
</script>

<!-- Floating butterflies -->
<div class="butterflies" aria-hidden="true">
  {#each Array(butterflyCount) as _, i (i)}
    {@const size = 0.55 + ((i * 0.08) % 0.48)}
    {@const hue = ['amber', 'gold', 'coral', 'rose', 'cream', 'ink'][i % 6]}
    <div
      class="butterfly butterfly-{i} butterfly--{hue}"
      style="
        left: {((i * 23 + 7) % 89) + 4}%;
        top: {((i * 37 + 13) % 82) + 6}%;
        animation-delay: {((i * 1.7) % 8).toFixed(1)}s;
        animation-duration: {10 + ((i * 0.8) % 7).toFixed(1)}s;
        font-size: {size.toFixed(2)}rem;
        opacity: {0.16 + ((i * 0.03) % 0.14).toFixed(2)};
      "
    >
      <div class="butterfly-inner butterfly-inner--{i % 3}">
        <div class="bf-wing bf-wing--left"></div>
        <div class="bf-wing bf-wing--right"></div>
        <div class="bf-body"></div>
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
              onclick={() => engine.openMode()}
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
        {:else if engine.menuScreen === 'mode'}
          <!-- ── MODE SELECT ── -->
          <div class="flex flex-1 flex-col justify-center gap-3 py-3">
            <p class="mb-1 text-center text-xs leading-relaxed text-cork-300">
              Choose how you want to practice today.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="group cursor-pointer overflow-hidden rounded-lg border border-amber-500/30 bg-cork-100 text-center shadow-md shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg"
                onclick={() => engine.openDifficulty()}
              >
                <div class="aspect-[3/2] w-full overflow-hidden bg-cork-200">
                  <img
                    src={hanziModeCard}
                    alt=""
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div class="px-2 py-2">
                  <p class="font-display text-base text-cork-800">Hanzi Typing</p>
                </div>
              </button>
              <button
                type="button"
                class="group cursor-pointer overflow-hidden rounded-lg border border-amber-500/30 bg-cork-100 text-center shadow-md shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg"
                onclick={() => engine.openReadingDifficulty()}
              >
                <div class="aspect-[3/2] w-full overflow-hidden bg-cork-200">
                  <img
                    src={readingModeCard}
                    alt=""
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div class="px-2 py-2">
                  <p class="font-display text-base text-cork-800">Reading Game</p>
                </div>
              </button>
            </div>
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-6 py-3 font-display text-xl text-cork-200 transition-all hover:bg-cork-600 hover:shadow-md"
              onclick={() => engine.backToMain()}
            >
              Back
            </button>
          </div>
        {:else if engine.menuScreen === 'difficulty'}
          <!-- ── DIFFICULTY SELECT ── -->

          <!-- Instructions -->
          <p class="mb-4 text-center text-xs leading-relaxed text-cork-300">
            Pick HSK levels for Hanzi Typing. <strong class="font-semibold text-amber-400"
              >3 hearts</strong
            >, gain up to 5. Lose one per mistake.
          </p>

          <!-- Level grid -->
          <div class="flex w-full flex-col gap-1">
            {#each Object.entries(levelNames) as [levelStr, name] (levelStr)}
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
              onclick={() => engine.openMode()}
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
        {:else if engine.menuScreen === 'readingDifficulty'}
          <!-- ── READING DIFFICULTY SELECT ── -->
          <p class="mb-4 text-center text-xs leading-relaxed text-cork-300">
            Pick an HSK level, read the story, then answer
            <strong class="font-semibold text-amber-400">2 Mandarin questions</strong>.
          </p>

          <div class="flex w-full flex-col gap-1">
            {#each Object.entries(levelNames) as [levelStr, name] (levelStr)}
              {@const level = Number(levelStr)}
              {@const colors = levelColorConfig[Math.min(level - 1, levelColorConfig.length - 1)]}
              {@const isSelected = engine.selectedReadingLevel === level}
              {@const done = engine.readingSuccessCounts[level] ?? 0}
              {@const isReadingMastered = done >= READING_MASTERY_GOAL}
              {@const readingGoldText = isReadingMastered
                ? 'text-amber-900 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]'
                : ''}
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left transition-all {isReadingMastered
                  ? colors.mastered + ' gold-plated'
                  : isSelected
                    ? colors.active
                    : colors.base} {isSelected ? 'scale-[1.01]' : ''}"
                onclick={() => engine.selectReadingLevel(level)}
              >
                <span class="text-xs font-semibold tracking-wide md:text-sm {readingGoldText}">
                  {name}
                </span>
                <span class="text-[10px] font-medium opacity-75 md:text-[11px] {readingGoldText}">
                  {done}x
                </span>
              </button>
            {/each}
          </div>

          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-cork-700 px-4 py-2 text-xs text-cork-200 transition-all hover:bg-cork-600"
              onclick={() => engine.openMode()}
            >
              Back
            </button>
            <a
              class="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-red-700 px-6 py-2.5 font-display text-lg text-amber-100 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-900/30"
              href={`/tools/chinese-game/reading?level=${engine.selectedReadingLevel}&new=1`}
            >
              Begin
            </a>
          </div>
        {:else if engine.menuScreen === 'options'}
          <!-- ── OPTIONS ── -->
          <div class="flex flex-1 flex-col gap-5 py-6">
            <div class="space-y-4">
              <p class="text-[10px] font-semibold tracking-wider text-amber-300/80 uppercase">
                General Settings
              </p>

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
            </div>

            <div class="space-y-4">
              <p class="text-[10px] font-semibold tracking-wider text-amber-300/80 uppercase">
                Hanzi Typing
              </p>

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
