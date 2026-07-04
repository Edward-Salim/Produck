<script lang="ts">
  import { Home, RotateCcw } from '@lucide/svelte';
  import type { GameEngine } from './game-engine.svelte.js';

  let { engine }: { engine: GameEngine } = $props();
</script>

<!-- ── GAME OVER SCREEN ── -->
<div
  class="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-lg flex-col items-center justify-center px-4"
>
  <div class="mb-6 text-center">
    <div class="mb-2 text-4xl md:text-5xl">💀</div>
    <h1 class="font-display text-3xl text-cork-800 md:text-5xl">Game Over</h1>
    <p class="mt-1 text-sm text-cork-500">
      Final Score: <span class="font-outfit italic">{engine.totalCorrect}</span>
    </p>
    <p class="mt-0.5 text-xs text-cork-400">
      Personal Best: <span class="font-outfit italic">{engine.highscore.score}</span>
    </p>
  </div>
</div>

<div class="fixed right-0 bottom-4 left-0 z-30 flex justify-center px-4 md:left-8">
  <div
    class="flex items-center justify-center gap-2 rounded-xl border border-cork-200/60 bg-cork-50/85 p-2 shadow-lg shadow-cork-900/10 backdrop-blur md:gap-3"
  >
    <span
      class="inline-flex items-center px-1 text-[11px] font-semibold tracking-wider text-cork-400 uppercase"
    >
      HSK {engine.currentLevel}
    </span>

    <button
      type="button"
      class="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
      onclick={() => engine.beginGame()}
      aria-label="Try Again"
      title="Try Again"
    >
      <RotateCcw class="size-4" />
    </button>
    <button
      type="button"
      class="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
      onclick={() => engine.goToMenu()}
      aria-label="Back to menu"
      title="Back to menu"
    >
      <Home class="size-4" />
    </button>
  </div>
</div>
