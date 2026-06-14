<script lang="ts">
  import ImageUploader from '$lib/components/bg-remove/ImageUploader.svelte';
  import BgRemoveEditor from '$lib/components/bg-remove/BgRemoveEditor.svelte';
  import { Eraser, Paintbrush, Download, ImagePlus, Sparkles, Scissors } from '@lucide/svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';

  let file = $state<File | null>(null);

  function handleUpload(f: File) {
    file = f;
  }

  function handleReset() {
    file = null;
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
          <p class="mb-2 text-xs font-semibold tracking-wider text-cork-500 uppercase">Mode</p>
          <div class="grid grid-cols-2 gap-2">
            <div
              class="flex flex-col items-center gap-1 rounded-lg border-2 border-cork-700 bg-cork-700 px-2 py-2 text-xs font-medium text-cork-50"
            >
              <Scissors class="size-4" />Simple
            </div>
            <div
              class="flex flex-col items-center gap-1 rounded-lg border-2 border-cork-200 bg-white/60 px-2 py-2 text-xs font-medium text-cork-600"
            >
              <Sparkles class="size-4" />AI
            </div>
          </div>
        </div>

        <div class="border-t border-cork-200"></div>

        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold tracking-wider text-cork-500 uppercase">Brush</p>
          <div class="flex">
            <div
              class="flex items-center justify-center rounded-l-md border border-cork-600 bg-cork-700 px-2 py-1 text-cork-50"
            >
              <Paintbrush class="size-3.5" />
            </div>
            <div
              class="-ml-px flex items-center justify-center rounded-r-md border border-cork-300 bg-white/70 px-2 py-1 text-cork-400"
            >
              <Eraser class="size-3.5" />
            </div>
          </div>
        </div>

        <div>
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

    </div>
  {/if}
</div>
