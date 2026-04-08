<script lang="ts">
  import { Scissors, WandSparkles, FileText } from '@lucide/svelte';
</script>

<svelte:head>
  <title>Tools | Produck</title>
</svelte:head>

<div>
  <header class="mb-6">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Tools</h1>
    <p class="mt-0.5 text-sm text-cork-500">Utility tools for your workflow</p>
  </header>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <a
      href="/tools/bg-remove"
      class="group rounded-xl border border-cork-300/40 bg-cork-100 p-5 transition-all hover:scale-[1.01] hover:border-cork-400/60 hover:shadow-md"
    >
      <div class="mb-3 flex size-10 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60">
        <Scissors class="size-5" />
      </div>
      <h2 class="font-display text-lg text-cork-800">BG Remover</h2>
      <p class="mt-1 text-xs text-cork-500">Remove backgrounds from images instantly</p>
    </a>

    <a
      href="/tools/image-enhance"
      class="group rounded-xl border border-cork-300/40 bg-cork-100 p-5 transition-all hover:scale-[1.01] hover:border-cork-400/60 hover:shadow-md"
    >
      <div class="mb-3 flex size-10 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60">
        <WandSparkles class="size-5" />
      </div>
      <h2 class="font-display text-lg text-cork-800">Image Enhancer</h2>
      <p class="mt-1 text-xs text-cork-500">Upscale and enhance image quality</p>
    </a>

    <a
      href="/tools/md-to-pdf"
      class="group rounded-xl border border-cork-300/40 bg-cork-100 p-5 transition-all hover:scale-[1.01] hover:border-cork-400/60 hover:shadow-md"
    >
      <div class="mb-3 flex size-10 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60">
        <FileText class="size-5" />
      </div>
      <h2 class="font-display text-lg text-cork-800">MD to PDF</h2>
      <p class="mt-1 text-xs text-cork-500">Convert Markdown documents to PDF</p>
    </a>
  </div>
</div>
