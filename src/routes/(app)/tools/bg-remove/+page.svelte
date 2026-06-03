<script lang="ts">
  import ImageUploader from '$lib/components/bg-remove/ImageUploader.svelte';
  import BgRemoveEditor, {
    setPendingCached
  } from '$lib/components/bg-remove/BgRemoveEditor.svelte';
  import { getHistory, removeHistoryItem } from '$lib/utils/image-cache.js';
  import { Eraser, Paintbrush, Download, ImagePlus, X } from '@lucide/svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';

  let file = $state<File | null>(null);
  let historyItems: { thumb: string; index: number }[] = $state([]);

  async function refreshHistory() {
    const items = await getHistory('bg-remove');
    historyItems.forEach((h) => URL.revokeObjectURL(h.thumb));
    historyItems = items.map((item, i) => ({
      thumb: item.thumb ? URL.createObjectURL(item.thumb) : '',
      index: i
    }));
  }

  async function loadHistoryAt(index: number) {
    const items = await getHistory('bg-remove');
    const cached = items[index];
    if (!cached) return;
    setPendingCached({ result: cached.result, meta: cached.meta });
    file = new File([cached.original], 'history.png', { type: 'image/png' });
  }

  async function removeHistory(index: number) {
    await removeHistoryItem('bg-remove', index);
    refreshHistory();
  }

  $effect(() => {
    refreshHistory();
  });

  function handleUpload(f: File) {
    file = f;
  }

  function handleReset() {
    file = null;
    refreshHistory();
  }
</script>

<svelte:head><title>Background Remover - Produck</title></svelte:head>

<div>
  <header class="mb-6">
    <a
      href="/tools"
      class="mb-2 inline-flex items-center gap-1 text-xs text-cork-400 transition-colors hover:text-cork-600"
    >
      <ArrowLeft class="size-3" />Tools
    </a>
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Background Remover</h1>
    <p class="mt-0.5 text-sm text-cork-500">
      Upload an image, auto-remove the background, refine with brush, export as PNG
    </p>
  </header>

  {#if file}
    <BgRemoveEditor {file} onreset={handleReset} />
  {:else}
    <div
      class="flex flex-col items-center gap-4 md:flex-row md:items-stretch md:justify-center md:gap-6"
      style="height: calc(100vh - 180px);"
    >
      <div class="flex w-full items-center justify-center md:w-auto md:min-w-0">
        <ImageUploader onupload={handleUpload} />
      </div>

      <div
        class="pointer-events-none h-fit w-full max-w-sm space-y-5 rounded-xl p-5 opacity-40 select-none md:w-56 md:shrink-0"
        style="background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
      >
        <div>
          <p class="mb-2 text-xs font-semibold tracking-wider text-cork-500 uppercase">Brush</p>
          <div class="grid grid-cols-2 gap-2">
            <div
              class="flex flex-col items-center gap-1.5 rounded-lg border-2 border-cork-700 bg-cork-700 px-3 py-3 text-xs font-medium text-cork-50"
            >
              <Eraser class="size-5" />Erase
            </div>
            <div
              class="flex flex-col items-center gap-1.5 rounded-lg border-2 border-cork-200 bg-white/60 px-3 py-3 text-xs font-medium text-cork-600"
            >
              <Paintbrush class="size-5" />Restore
            </div>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs font-semibold tracking-wider text-cork-500 uppercase">
            Brush Size
          </p>
          <div class="flex gap-1.5">
            {#each ['S', 'M', 'L', 'XL'] as label (label)}
              <div
                class="flex-1 rounded-md py-1.5 text-center text-xs font-medium {label === 'M'
                  ? 'bg-cork-700 text-cork-50'
                  : 'border border-cork-200 bg-white/60 text-cork-600'}"
              >
                {label}
              </div>
            {/each}
          </div>
        </div>

        <div class="border-t border-cork-200"></div>

        <div class="space-y-2">
          <div
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-cork-700 px-3 py-2 text-sm font-medium text-cork-50"
          >
            <Download class="size-4" /> Download PNG
          </div>
          <div
            class="flex w-full items-center justify-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-500"
          >
            <ImagePlus class="size-4" /> New Image
          </div>
        </div>
      </div>

      <!-- History column (clickable even on upload screen) -->
      {#if historyItems.length > 0}
        <div class="flex w-full max-w-sm shrink-0 flex-row flex-wrap gap-1.5 md:w-auto md:flex-col">
          <p class="mb-0.5 text-[10px] font-semibold tracking-wider text-cork-400 uppercase">
            History
          </p>
          {#each historyItems as item (item.index)}
            <div class="group relative">
              <button
                type="button"
                class="h-10 w-10 overflow-hidden rounded-md border-2 border-cork-200 transition-colors hover:border-cork-500"
                onclick={() => loadHistoryAt(item.index)}
              >
                {#if item.thumb}
                  <img
                    src={item.thumb}
                    alt="History {item.index + 1}"
                    class="h-full w-full object-cover"
                  />
                {:else}
                  <div
                    class="flex h-full w-full items-center justify-center bg-cork-200 text-[9px] text-cork-500"
                  >
                    {item.index + 1}
                  </div>
                {/if}
              </button>
              <button
                type="button"
                class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cork-600 text-cork-100 opacity-0 transition-opacity group-hover:opacity-100"
                onclick={() => removeHistory(item.index)}
              >
                <X class="size-2.5" />
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
