<script lang="ts">
  import { tick, onMount } from 'svelte';
  import { Heart, Send, ArrowRight, SkipForward, Lightbulb } from '@lucide/svelte';
  import type { GameEngine } from './game-engine.svelte.js';
  import { isPunct } from './game-engine.svelte.js';

  let { engine }: { engine: GameEngine } = $props();

  let isMobile = $state(false);

  onMount(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    isMobile = mq.matches;
    const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  // ── DOM refs for character inputs ──
  let inputRefs = $state<HTMLInputElement[]>([]);

  // ── IME composition tracking ──
  let isComposing = $state(false);
  let composeSlot = $state(-1);

  // ── Auto-focus and auto-hint on new sentence ──
  $effect(() => {
    // React to sentence changes when feedback is null (new sentence loaded)
    const sentence = engine.currentSentence;
    if (!sentence || engine.gameState !== 'playing') return;

    tick().then(() => {
      if (engine.hintAlwaysOn) {
        engine.useHint();
      }
      // Focus the first non-hinted, non-punct slot
      const chars = [...sentence.hanzi];
      for (let i = 0; i < chars.length; i++) {
        if (!isPunct(chars[i]) && !engine.hintedSlots.has(i)) {
          inputRefs[i]?.focus();
          break;
        }
      }
    });
  });

  function doCheckAnswer() {
    engine.checkAnswer();
    if (engine.feedback === 'correct') {
      setTimeout(() => {
        engine.advancing = false;
        engine.showNextSentence();
      }, 600);
    }
  }

  // ── inputRefs getter/setter pattern: intercept binds ──
  // The template does bind:this={inputRefs[i]} which Svelte handles natively.
  // We just need the array available.

  // ── Character slot handlers ──
  function nextEditableSlot(fromIndex: number): number {
    return engine.nextEditableSlot(fromIndex);
  }

  function prevEditableSlot(fromIndex: number): number {
    return engine.prevEditableSlot(fromIndex);
  }

  function onSlotInput(index: number) {
    if (isComposing) return;
    if (engine.hintedSlots.has(index)) {
      engine.userChars[index] = engine.currentSentence
        ? [...engine.currentSentence.hanzi][index]
        : '';
      return;
    }
    let val = engine.userChars[index];
    if (!val) return;
    const chars = [...val];
    if (chars.length > 1) {
      const result = engine.spreadChars(index, chars);
      if (result.nextSlot !== index || engine.userChars[result.nextSlot]) {
        inputRefs[result.nextSlot]?.focus();
      } else {
        inputRefs[index]?.focus();
      }
    } else if (engine.userChars[index]) {
      engine.triggerStroke();
      const input = inputRefs[nextEditableSlot(index)];
      if (input) input.focus();
    }
  }

  function onSlotKeydown(index: number, e: KeyboardEvent) {
    if (
      engine.hintedSlots.has(index) &&
      (e.key === 'Backspace' ||
        e.key === 'Delete' ||
        (e.key.length === 1 && !e.ctrlKey && !e.metaKey))
    ) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      doCheckAnswer();
      return;
    }
    if (e.key === 'Tab' && nextEditableSlot(index) === index && !e.shiftKey) {
      e.preventDefault();
      inputRefs[nextEditableSlot(-1)]?.focus();
      return;
    }
    if (e.key === 'Tab' && prevEditableSlot(index) === index && e.shiftKey) {
      e.preventDefault();
      const chars = engine.currentSentence ? [...engine.currentSentence.hanzi] : [];
      for (let j = chars.length - 1; j >= 0; j--) {
        if (!isPunct(chars[j]) && !engine.hintedSlots.has(j)) {
          inputRefs[j]?.focus();
          break;
        }
      }
      return;
    }
    if (e.key === 'Backspace' && !engine.userChars[index] && index > 0) {
      inputRefs[prevEditableSlot(index)]?.focus();
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
    if (i >= 0 && engine.hintedSlots.has(i)) {
      engine.userChars[i] = engine.currentSentence ? [...engine.currentSentence.hanzi][i] : '';
      return;
    }
    if (i >= 0 && engine.userChars[i]) {
      const chars = [...engine.userChars[i]];
      if (chars.length > 1) {
        const result = engine.spreadChars(i, chars);
        if (result.nextSlot !== i || engine.userChars[result.nextSlot]) {
          inputRefs[result.nextSlot]?.focus();
        } else {
          inputRefs[i]?.focus();
        }
      } else {
        engine.setCallbacks({});
        const input = inputRefs[nextEditableSlot(i)];
        if (input) input.focus();
      }
    }
  }

  // ── Derived ──
  let heat = $derived(engine.heat);
  let maxHealth = $derived(engine.maxHealth);
</script>

<!-- Full-viewport streak overlay (subtle, only for higher tiers) -->
<div
  class="streak-overlay {heat === 'blaze'
    ? 'streak-overlay-blaze'
    : heat === 'inferno'
      ? 'streak-overlay-inferno'
      : 'streak-overlay-idle'}"
>
  {#if heat === 'blaze' || heat === 'inferno'}
    {@const count = isMobile ? (heat === 'inferno' ? 10 : 6) : heat === 'inferno' ? 24 : 14}
    <div
      class="particles"
      aria-hidden="true"
      class:particles-visible={heat === 'blaze' || heat === 'inferno'}
    >
      {#each Array(count) as _, i}
        <span
          class="particle"
          style="left: {(i * 37 + 13) % 100}%; animation-delay: {((i * 0.7) % 4).toFixed(
            1
          )}s; animation-duration: {3 + ((i * 0.4) % 4).toFixed(1)}s"
        ></span>
      {/each}
    </div>
  {/if}
</div>

<div
  class="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 px-2 pb-8 md:min-h-[calc(100dvh-10rem)] md:gap-6"
>
  <!-- Health bar -->
  <div class="flex w-full items-center justify-between gap-2">
    <div class="flex items-center gap-1 md:gap-1.5">
      {#each Array(maxHealth) as _, i}
        {#if i < engine.health}
          <span
            class="scale-100 transition-all duration-300"
            class:heart-gain={engine.justGainedHealth}
          >
            <Heart class="drop-shadow-red size-5 fill-red-500 text-red-500 md:size-6" />
          </span>
        {:else}
          <span class="opacity-40 transition-all duration-300">
            <Heart class="size-5 text-cork-500 md:size-6" />
          </span>
        {/if}
      {/each}
      {#if engine.bonusHearts > 0}
        {#each Array(engine.bonusHearts) as _}
          <span
            class="scale-100 transition-all duration-300"
            class:heart-gain={engine.justGainedHealth}
          >
            <Heart
              class="size-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] md:size-6"
            />
          </span>
        {/each}
      {/if}
    </div>

    <div class="flex items-center gap-1.5 md:gap-2">
      <div
        class="flex items-center gap-1 rounded-full bg-cork-100 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1"
      >
        <span class="text-[9px] font-medium tracking-wider text-cork-400 uppercase md:text-[10px]"
          >Score</span
        >
        <span class="font-display text-sm text-cork-700 md:text-base">{engine.totalCorrect}</span>
      </div>
      <div
        class="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1"
      >
        <span class="text-[9px] font-medium tracking-wider text-amber-500 uppercase md:text-[10px]"
          >Best</span
        >
        <span class="font-display text-sm text-amber-700 md:text-base"
          >{engine.highscore.score}</span
        >
      </div>
    </div>
  </div>

  <!-- Sentence card -->
  {#if engine.currentSentence}
    <div
      class="w-full rounded-2xl border p-4 text-center shadow-sm transition-all duration-300 md:p-10 {heat
        ? 'streak-' + heat
        : 'border-cork-300/50 bg-white'} {engine.feedback === 'correct' ? 'card-correct' : ''}"
    >
      {#if engine.feedback === null}
        {#if heat}
          <p class="streak-text mb-2 text-xs font-semibold tracking-widest uppercase md:text-sm">
            {engine.streak} streak
          </p>
        {/if}
        <!-- English translation (the prompt) -->
        <p class="font-outfit text-lg leading-relaxed text-cork-800 md:text-3xl">
          {engine.currentSentence.translation}
        </p>

        <!-- Character slots: one box per hanzi character -->
        <div class="mt-4 flex flex-wrap items-center justify-center gap-1 md:mt-6 md:gap-1.5">
          {#each engine.userChars as _, i}
            {@const punct = engine.currentSentence
              ? isPunct([...engine.currentSentence.hanzi][i])
              : false}
            {#if punct}
              <span class="char-slot char-punct">{engine.userChars[i]}</span>
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
                class="char-slot {engine.userChars[i] ? 'filled' : 'empty'} {engine.hintedSlots.has(
                  i
                )
                  ? 'hinted'
                  : ''}"
                bind:value={engine.userChars[i]}
                readonly={engine.hintedSlots.has(i)}
                tabindex={engine.hintedSlots.has(i) ? -1 : 0}
                oninput={() => onSlotInput(i)}
                onkeydown={(e) => onSlotKeydown(i, e)}
                oncompositionstart={() => onCompositionStart(i)}
                oncompositionend={onCompositionEnd}
              />
            {/if}
          {/each}
        </div>
      {:else if engine.feedback === 'correct'}
        {#if heat}
          <p class="streak-text mb-2 text-xs font-semibold tracking-widest uppercase md:text-sm">
            {engine.streak} streak
          </p>
        {/if}
        <p class="font-outfit text-lg leading-relaxed text-cork-800 md:text-3xl">
          {engine.currentSentence.translation}
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-1 md:mt-6 md:gap-1.5">
          {#each engine.userChars as ch, i}
            {#if engine.currentSentence && isPunct([...engine.currentSentence.hanzi][i])}
              <span class="char-punct">{ch}</span>
            {:else}
              <span class="char-slot filled flex items-center justify-center">
                <span class="text-emerald-600">{ch || ''}</span>
              </span>
            {/if}
          {/each}
        </div>
      {:else if engine.feedback === 'wrong'}
        {#if heat}
          <p class="streak-text mb-2 text-xs font-semibold tracking-widest uppercase md:text-sm">
            {engine.bestStreak} streak lost
          </p>
        {/if}
        <div class="flex flex-col items-center gap-2 md:gap-3">
          <div>
            <p class="font-outfit text-lg leading-relaxed text-cork-800 md:text-3xl">
              {engine.currentSentence.translation}
            </p>
            <p class="text-xs text-cork-400 md:text-sm">{engine.revealedPinyin}</p>
          </div>

          <!-- Character-by-character feedback -->
          <div
            class="flex flex-wrap items-start justify-center gap-x-1 gap-y-3 md:gap-x-1.5 md:gap-y-4"
          >
            {#each [...engine.currentSentence.hanzi] as correctChar, i}
              {#if isPunct(correctChar)}
                <span class="char-punct">{correctChar}</span>
              {:else}
                {@const uc = engine.userChars[i] || ''}
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
    {#if engine.feedback === 'wrong' || engine.feedback === 'correct'}
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-200/50 bg-cork-100 px-4 py-2 text-sm font-medium text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow"
        onclick={() => engine.nextAfterWrong()}
      >
        Next
        <ArrowRight class="size-4" />
      </button>
    {:else}
      <!-- HSK badge -->
      <span
        class="inline-flex items-center rounded-lg bg-cork-100 px-3 py-2 text-[11px] font-semibold tracking-wider text-cork-400 uppercase"
      >
        HSK {engine.currentSentence?.level}
      </span>
      <!-- Skip button -->
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
        disabled={engine.feedback !== null}
        onclick={() => engine.skipSentence()}
        aria-label="Skip"
      >
        <SkipForward class="size-4" />
      </button>
      <!-- Hint button -->
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
        disabled={engine.feedback !== null || engine.hintUsedThisSentence}
        onclick={() => engine.useHint()}
        aria-label="Hint"
      >
        <Lightbulb class="size-4" />
      </button>
      <!-- Check button -->
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center rounded-lg border border-cork-200/50 bg-cork-100 p-2 text-cork-600 shadow-sm transition-all hover:border-cork-300/50 hover:bg-cork-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!engine.userChars.some((c) => c) || engine.feedback !== null}
        onclick={doCheckAnswer}
        aria-label="Check"
      >
        <Send class="size-4" />
      </button>
    {/if}
  </div>
</div>
