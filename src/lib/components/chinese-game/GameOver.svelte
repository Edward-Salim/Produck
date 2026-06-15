<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import type { GameEngine } from './game-engine.svelte.js';

  let { engine }: { engine: GameEngine } = $props();
</script>

<!-- ── GAME OVER SCREEN ── -->
<div
  class="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-lg flex-col items-center justify-center px-4 pb-8"
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

  <!-- Action buttons -->
  <div class="flex flex-wrap justify-center gap-2 md:gap-3">
    <button
      type="button"
      class="flex cursor-pointer items-center justify-center rounded-xl border border-cork-300/50 bg-cork-50/80 p-2.5 text-cork-700 transition-all hover:bg-cork-200/50"
      onclick={() => engine.beginGame()}
      aria-label="Try Again"
    >
      <RotateCcw class="size-5" />
    </button>
    <button
      type="button"
      class="flex cursor-pointer items-center gap-2 rounded-xl border border-cork-300/50 bg-cork-50/80 px-6 py-2.5 font-display text-lg text-cork-700 transition-all hover:bg-cork-200/50"
      onclick={() => engine.goToMenu()}
    >
      Back to Menu
    </button>
  </div>
</div>
