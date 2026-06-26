<script lang="ts">
  import { Scissors, WandSparkles, FileText, Languages, BriefcaseBusiness } from '@lucide/svelte';
</script>

<svelte:head>
  <title>Tools | Produck</title>
</svelte:head>

<div>
  <header class="mb-6">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Tools</h1>
    <p class="mt-0.5 text-sm text-cork-500">Utility tools for your workflow</p>
  </header>

  <div class="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
    <a
      href="/tools/bg-remove"
      class="group flex items-center gap-3 rounded-xl border border-cork-300/40 bg-cork-100 p-3 transition-all hover:border-cork-400/60 hover:shadow-md md:flex-col md:items-start md:gap-0 md:p-5 md:hover:scale-[1.01]"
    >
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60 md:mb-3 md:size-10"
      >
        <Scissors class="size-4 md:size-5" />
      </div>
      <div>
        <h2 class="text-sm font-medium text-cork-800 md:font-display md:text-lg">BG Remover</h2>
        <p class="text-[11px] text-cork-500 md:mt-1 md:text-xs">
          Remove backgrounds from images instantly
        </p>
      </div>
    </a>

    <a
      href="/tools/image-enhance"
      class="group flex items-center gap-3 rounded-xl border border-cork-300/40 bg-cork-100 p-3 transition-all hover:border-cork-400/60 hover:shadow-md md:flex-col md:items-start md:gap-0 md:p-5 md:hover:scale-[1.01]"
    >
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60 md:mb-3 md:size-10"
      >
        <WandSparkles class="size-4 md:size-5" />
      </div>
      <div>
        <h2 class="text-sm font-medium text-cork-800 md:font-display md:text-lg">Image Enhancer</h2>
        <p class="text-[11px] text-cork-500 md:mt-1 md:text-xs">
          Upscale and enhance image quality
        </p>
      </div>
    </a>

    <a
      href="/tools/md-to-pdf"
      class="group flex items-center gap-3 rounded-xl border border-cork-300/40 bg-cork-100 p-3 transition-all hover:border-cork-400/60 hover:shadow-md md:flex-col md:items-start md:gap-0 md:p-5 md:hover:scale-[1.01]"
    >
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60 md:mb-3 md:size-10"
      >
        <FileText class="size-4 md:size-5" />
      </div>
      <div>
        <h2 class="text-sm font-medium text-cork-800 md:font-display md:text-lg">MD to PDF</h2>
        <p class="text-[11px] text-cork-500 md:mt-1 md:text-xs">
          Convert Markdown documents to PDF
        </p>
      </div>
    </a>

    <a
      href="/tools/application-kit"
      class="group flex items-center gap-3 rounded-xl border border-cork-300/40 bg-cork-100 p-3 transition-all hover:border-cork-400/60 hover:shadow-md md:flex-col md:items-start md:gap-0 md:p-5 md:hover:scale-[1.01]"
    >
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60 md:mb-3 md:size-10"
      >
        <BriefcaseBusiness class="size-4 md:size-5" />
      </div>
      <div>
        <h2 class="text-sm font-medium text-cork-800 md:font-display md:text-lg">
          Application Kit
        </h2>
        <p class="text-[11px] text-cork-500 md:mt-1 md:text-xs">
          Draft cover letters from job posts
        </p>
      </div>
    </a>

    <a
      href="/tools/chinese-game"
      class="group flex items-center gap-3 rounded-xl border border-cork-300/40 bg-cork-100 p-3 transition-all hover:border-cork-400/60 hover:shadow-md md:flex-col md:items-start md:gap-0 md:p-5 md:hover:scale-[1.01]"
    >
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cork-200/60 text-cork-600 transition-colors group-hover:bg-cork-300/60 md:mb-3 md:size-10"
      >
        <Languages class="size-4 md:size-5" />
      </div>
      <div>
        <h2 class="text-sm font-medium text-cork-800 md:font-display md:text-lg">Hanzi Game</h2>
        <p class="text-[11px] text-cork-500 md:mt-1 md:text-xs">
          Test your hanzi knowledge from English prompts
        </p>
      </div>
    </a>
  </div>
</div>
