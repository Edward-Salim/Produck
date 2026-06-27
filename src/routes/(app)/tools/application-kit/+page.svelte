<script lang="ts">
  import { ArrowLeft, Code2, Eye, LoaderCircle, RefreshCw, ScrollText } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import * as Separator from '$lib/components/ui/separator/index.js';
  import {
    APPLICATION_COVER_LETTER_SYSTEM_PROMPT,
    buildApplicationCoverLetterPrompt
  } from '$lib/application-cover-letter-prompt.js';

  type GeneratedLetter = {
    company: string;
    role: string;
    recipient: string;
    companyTag: string;
    plainText: string;
  };

  const SAMPLE_PLACEHOLDER = `Paste everything here:

- Job title and company
- Job post / responsibilities / requirements
- Company research, values, product notes, app reviews, news
- Anything you want the letter to emphasize
- Optional brand color if known

The CV is appended automatically after the cover letter.`;

  const PREVIEW_PLACEHOLDER: GeneratedLetter = {
    company: 'Company',
    role: 'Product Manager',
    recipient: 'Hiring Team, Company',
    companyTag: 'Company',
    plainText: `Dear Hiring Manager,

I am drawn to product roles where customer trust, operational reliability, and practical execution all have to meet in the same decision. That is the kind of work I have been training for through fintech, product discovery, and data-heavy projects.

At DANA, I synthesized pain points from technical and non-technical stakeholders across a major backoffice system, then shaped prioritized product recommendations for operational bottlenecks. I also led discovery for AI hiring tools by mapping recruitment workflows, benchmarking competitors, and estimating cost impact.

I would bring that same evidence-guided approach to your team. My strength is turning ambiguous product problems into clear user insights, scoped solutions, and measurable next steps without losing sight of business constraints.`
  };

  const STORAGE_KEY = 'appkit_v3';

  let dump = $state('');
  let result = $state<GeneratedLetter | null>(null);
  let sourceDraft = $state(PREVIEW_PLACEHOLDER.plainText);
  let activeView = $state<'preview' | 'source' | 'prompt'>('preview');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let previewPdfUrl = $state<string | null>(null);
  let previewPdfLoading = $state(false);
  let previewPdfError = $state<string | null>(null);
  let previewRequestId = 0;
  let previewRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  let sourceDirty = $state(false);

  const outputText = $derived(sourceDraft);
  const generateButtonLabel = $derived(result ? 'Regenerate' : 'Generate');
  const loadingButtonLabel = $derived(result ? 'Regenerating' : 'Generating');
  const systemPrompt = $derived(APPLICATION_COVER_LETTER_SYSTEM_PROMPT);
  const userPrompt = $derived(
    buildApplicationCoverLetterPrompt(dump.trim() || '{{APPLICATION_DUMP}}')
  );

  // ── Persist across refreshes ──
  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.dump === 'string') dump = data.dump;
        if (data.result) result = data.result as GeneratedLetter;
        if (typeof data.sourceDraft === 'string') {
          sourceDraft = data.sourceDraft;
        } else if (data.result?.plainText && typeof data.result.plainText === 'string') {
          sourceDraft = data.result.plainText;
        }
      }
    } catch {
      // corrupted or unavailable — ignore
    }

    schedulePreviewPdfRefresh(0);

    return () => {
      if (previewRefreshTimer) clearTimeout(previewRefreshTimer);
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  });

  $effect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dump, result, sourceDraft }));
    } catch {
      // quota exceeded or unavailable — ignore
    }
  });

  function invalidatePreviewPdf() {
    previewRequestId += 1;
    if (previewRefreshTimer) {
      clearTimeout(previewRefreshTimer);
      previewRefreshTimer = null;
    }
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      previewPdfUrl = null;
    }
    previewPdfLoading = false;
    previewPdfError = null;
  }

  async function generateCoverLetter() {
    if (!dump.trim()) {
      error = 'Paste the job post or application brief first.';
      return;
    }

    loading = true;
    error = null;
    invalidatePreviewPdf();
    try {
      const res = await fetch('/api/application-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dump })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Server returned ${res.status}`);
      result = body as GeneratedLetter;
      sourceDraft = result.plainText;
      sourceDirty = false;
      activeView = 'preview';
      schedulePreviewPdfRefresh(0);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Cover letter generation failed.';
    } finally {
      loading = false;
    }
  }

  async function refreshPreviewPdf(letter: GeneratedLetter, plainText: string): Promise<boolean> {
    const requestId = ++previewRequestId;
    previewPdfLoading = true;
    previewPdfError = null;

    try {
      const res = await fetch('/api/application-cover-letter/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: letter.recipient,
          plainText,
          company: letter.company,
          role: letter.role
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server returned ${res.status}`);
      }

      const blob = await res.blob();
      if (requestId !== previewRequestId) return false;

      const nextUrl = URL.createObjectURL(blob);
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
      previewPdfUrl = nextUrl;
      return true;
    } catch (err) {
      if (requestId !== previewRequestId) return false;
      previewPdfError = err instanceof Error ? err.message : 'Preview generation failed.';
      return false;
    } finally {
      if (requestId === previewRequestId) previewPdfLoading = false;
    }
  }

  function schedulePreviewPdfRefresh(delay = 700) {
    if (previewRefreshTimer) clearTimeout(previewRefreshTimer);

    previewRefreshTimer = setTimeout(() => {
      const letter = result ?? PREVIEW_PLACEHOLDER;
      void refreshPreviewPdf(letter, outputText).then((compiled) => {
        if (compiled) sourceDirty = false;
      });
    }, delay);
  }

  function showPreview() {
    activeView = 'preview';
    if (!sourceDirty && !previewPdfUrl && !previewPdfLoading) {
      schedulePreviewPdfRefresh(0);
    }
  }

  async function compilePdf() {
    const letter = result ?? PREVIEW_PLACEHOLDER;
    const compiled = await refreshPreviewPdf(letter, outputText);
    if (compiled) {
      sourceDirty = false;
      activeView = 'preview';
    }
  }
</script>

<svelte:head>
  <title>Application Kit - Produck</title>
</svelte:head>

<div>
  <!-- ── Header ── -->
  <header class="mb-6">
    <a
      href="/tools"
      class="mb-2 inline-flex items-center gap-1 text-xs text-cork-400 transition-colors hover:text-cork-600"
    >
      <ArrowLeft class="size-3" />Tools
    </a>
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Application Kit</h1>
    <p class="mt-0.5 text-sm text-cork-500">
      Generate, edit, and compile tailored cover letters with your CV
    </p>
  </header>

  <!-- ── Two-column layout ── -->
  <div class="grid gap-5 lg:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
    <!-- ── Left: Input ── -->
    <section class="flex flex-col rounded-xl border border-cork-300/50 bg-white/70 p-5">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <span class="text-xs font-semibold tracking-wider text-cork-500 uppercase">
            Application dump
          </span>
        </div>
        <button
          type="button"
          class="generate-button inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          disabled={loading}
          onclick={generateCoverLetter}
        >
          {#if loading}
            <LoaderCircle class="size-4 animate-spin" />
            {loadingButtonLabel}
          {:else}
            {generateButtonLabel}
          {/if}
        </button>
      </div>

      <textarea
        class="min-h-128 w-full flex-1 resize-y rounded-lg border-cork-300 bg-cork-50 text-sm leading-relaxed text-cork-800 placeholder:text-cork-400/50 focus:border-cork-500 focus:ring-cork-400"
        style="height: calc(100svh - 280px)"
        bind:value={dump}
        placeholder={SAMPLE_PLACEHOLDER}
      ></textarea>

      {#if error}
        <p class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      {/if}
    </section>

    <!-- ── Right: Output ── -->
    <section class="min-w-0 rounded-xl border border-cork-300/50 bg-white/70 p-5">
      {#if loading}
        <div class="flex h-[calc(100svh-300px)] min-h-128 items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <img
              src="/assets/produck-job.png"
              alt="Produck job application illustration"
              class="w-full max-w-44 object-contain"
            />
            <div class="relative -mt-10 text-center text-sm font-medium text-cork-600">
              Generating cover letter<span
                class="dot-cycle absolute top-0 left-full"
                aria-hidden="true"
              ></span>
            </div>
          </div>
        </div>
      {:else}
        <!-- ── View toggles ── -->
        <div class="mb-3 flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <div
            class="grid h-8 w-full grid-cols-3 overflow-hidden rounded-lg border border-cork-300 sm:w-auto"
          >
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 px-2.5 text-xs font-medium transition-colors sm:px-3 {activeView ===
              'preview'
                ? 'bg-cork-700 text-cork-50'
                : 'bg-white text-cork-600 hover:bg-cork-100'}"
              onclick={showPreview}
            >
              <Eye class="size-3.5" />
              Preview
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 border-l border-cork-300 px-2.5 text-xs font-medium transition-colors sm:px-3 {activeView ===
              'source'
                ? 'bg-cork-700 text-cork-50'
                : 'bg-white text-cork-600 hover:bg-cork-100'}"
              onclick={() => (activeView = 'source')}
            >
              <Code2 class="size-3.5" />
              Source
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 border-l border-cork-300 px-2.5 text-xs font-medium transition-colors sm:px-3 {activeView ===
              'prompt'
                ? 'bg-cork-700 text-cork-50'
                : 'bg-white text-cork-600 hover:bg-cork-100'}"
              onclick={() => (activeView = 'prompt')}
            >
              <ScrollText class="size-3.5" />
              Prompt
            </button>
          </div>

          {#if activeView !== 'prompt'}
            <div class="flex h-8 w-full items-center gap-2 sm:ml-auto sm:w-auto">
              <button
                type="button"
                class="inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none {sourceDirty
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-cork-300 bg-white text-cork-600 hover:bg-cork-100 hover:text-cork-800'}"
                disabled={previewPdfLoading}
                onclick={compilePdf}
              >
                <RefreshCw class={`size-3.5 ${previewPdfLoading ? 'animate-spin' : ''}`} />
                Compile PDF
              </button>
            </div>
          {/if}
        </div>

        <!-- ── Content area ── -->
        {#if activeView === 'preview'}
          <div>
            {#if previewPdfError}
              <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {previewPdfError}
              </p>
            {:else if previewPdfUrl}
              <object
                data={previewPdfUrl}
                type="application/pdf"
                class="h-[calc(100svh-340px)] min-h-128 w-full rounded-lg border border-cork-200 bg-white shadow-sm"
                aria-label="Compiled application PDF preview"
              ></object>
            {:else}
              <div class="space-y-3 py-4">
                <Skeleton class="h-5 w-40 rounded bg-cork-200!" />
                <Skeleton class="h-4 w-full rounded bg-cork-200!" />
                <Skeleton class="h-4 w-11/12 rounded bg-cork-200!" />
                <Skeleton class="h-4 w-10/12 rounded bg-cork-200!" />
                <Skeleton class="mt-2 h-4 w-full rounded bg-cork-200!" />
                <Skeleton class="h-4 w-9/12 rounded bg-cork-200!" />
                <Skeleton class="mt-4 h-4 w-28 rounded bg-cork-200!" />
              </div>
            {/if}
          </div>
        {:else if activeView === 'source'}
          <textarea
            class="h-[calc(100svh-340px)] min-h-128 w-full resize-y rounded-lg border-cork-300 bg-cork-50 text-sm leading-relaxed text-cork-800 placeholder:text-cork-400 focus:border-cork-500 focus:ring-cork-400"
            value={sourceDraft}
            placeholder="Generated cover letter will appear here..."
            oninput={(event) => {
              sourceDraft = event.currentTarget.value;
              if (result) result.plainText = sourceDraft;
              sourceDirty = true;
              previewPdfError = null;
            }}
          ></textarea>
        {:else}
          <!-- Prompt view -->
          <div
            class="prompt-scroll h-[calc(100svh-340px)] min-h-128 overflow-auto rounded-lg border border-cork-300 bg-cork-50"
          >
            <div class="p-4">
              <h3 class="mb-2 text-xs font-semibold tracking-wider text-cork-400 uppercase">
                System Prompt
              </h3>
              <pre
                class="text-xs leading-relaxed whitespace-pre-wrap text-cork-700">{systemPrompt}</pre>
            </div>
            <Separator.Root />
            <div class="p-4">
              <h3 class="mb-2 text-xs font-semibold tracking-wider text-cork-400 uppercase">
                User Prompt
              </h3>
              <pre
                class="text-xs leading-relaxed whitespace-pre-wrap text-cork-700">{userPrompt}</pre>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </div>
</div>

<style>
  textarea,
  pre,
  .prompt-scroll {
    scrollbar-width: thin;
    scrollbar-color: #c9b99a transparent;
  }

  textarea::-webkit-scrollbar,
  pre::-webkit-scrollbar,
  .prompt-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  textarea::-webkit-scrollbar-track,
  pre::-webkit-scrollbar-track,
  .prompt-scroll::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb,
  pre::-webkit-scrollbar-thumb,
  .prompt-scroll::-webkit-scrollbar-thumb {
    background: #c9b99a;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb:hover,
  pre::-webkit-scrollbar-thumb:hover,
  .prompt-scroll::-webkit-scrollbar-thumb:hover {
    background: #b0a080;
  }

  .generate-button {
    background: linear-gradient(110deg, #5c4b3a, #8a6f42, #2f6f68, #5c4b3a);
    background-size: 260% 100%;
    animation: generate-gradient 5s ease infinite;
  }

  .generate-button:hover {
    animation-duration: 2.5s;
  }

  .dot-cycle::after {
    display: inline-block;
    width: 1.8em;
    text-align: left;
    content: '.';
    animation: dot-cycle 1.4s steps(1, end) infinite;
  }

  @keyframes generate-gradient {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes dot-cycle {
    0%,
    100% {
      content: '.';
    }
    20% {
      content: '..';
    }
    40% {
      content: '...';
    }
    60% {
      content: '..';
    }
    80% {
      content: '.';
    }
  }
</style>
