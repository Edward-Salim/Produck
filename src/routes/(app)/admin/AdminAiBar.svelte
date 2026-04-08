<script lang="ts">
  import { Sparkles, SendHorizontal, LoaderCircle } from '@lucide/svelte';

  let {
    aiPrompt = $bindable(''),
    aiLoading,
    aiError,
    onSubmit
  }: {
    aiPrompt: string;
    aiLoading: boolean;
    aiError: string;
    onSubmit: (e?: Event) => void;
  } = $props();

  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  function autoResize() {
    if (!textareaEl) return;
    textareaEl.style.height = 'auto';
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 80) + 'px';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  }
</script>

<form onsubmit={onSubmit} class="ai-bar flex items-end gap-2 rounded-xl px-3 py-2 md:gap-3 md:px-4 md:py-2.5">
  <Sparkles class="mb-1.5 size-4 shrink-0 text-cork-500 {aiLoading ? 'animate-pulse' : ''}" />
  <textarea
    bind:this={textareaEl}
    bind:value={aiPrompt}
    oninput={autoResize}
    onkeydown={handleKeydown}
    placeholder="Ask AI to edit this data..."
    rows="1"
    class="flex-1 resize-none rounded-md border border-cork-300/50 bg-white/30 px-2 py-1.5 text-sm leading-snug text-cork-800 shadow-none ring-0 [scrollbar-width:none] placeholder:text-cork-400 focus:border-cork-500 focus:ring-0 focus:outline-none"
    disabled={aiLoading}
  ></textarea>
  {#if aiError}
    <span class="mb-1.5 shrink-0 text-xs text-red-500">{aiError}</span>
  {/if}
  <button
    type="submit"
    disabled={aiLoading || !aiPrompt.trim()}
    class="mb-0.5 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-cork-700 px-2.5 py-1.5 text-xs font-medium text-cork-50 transition-colors hover:bg-cork-800 disabled:opacity-40 md:px-3"
  >
    {#if aiLoading}
      <LoaderCircle class="size-3.5 animate-spin" />
    {:else}
      <SendHorizontal class="size-3.5" />
    {/if}
  </button>
</form>

<style>
  .ai-bar {
    background: linear-gradient(90deg, #ece5d8, #cdc3ae, #b0a48e, #cdc3ae, #ece5d8);
    background-size: 300% 100%;
    animation: ai-shimmer 6s ease-in-out infinite;
  }
  @keyframes ai-shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>
