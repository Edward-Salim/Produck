<script lang="ts">
  import {
    ArrowLeft,
    Copy,
    Download,
    Eye,
    Files,
    FilePenLine,
    FileText,
    LoaderCircle,
    MessageCircle,
    RefreshCw,
    Trash2
  } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { buildApplicationPdfFilename } from '$lib/application-filename.js';

  type GeneratedLetter = {
    company: string;
    role: string;
    recipient: string;
    companyTag: string;
    plainText: string;
    model?: string;
    linkedinMessages?: LinkedInMessage[];
  };

  type LinkedInMessage = {
    label: string;
    useCase: string;
    text: string;
  };

  type ApplicationJobStatus = {
    id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    result?: GeneratedLetter | null;
    error?: string | null;
  };

  const SAMPLE_PLACEHOLDER = `Paste everything here:

- Job title and company
- Job post / responsibilities / requirements
- Company research, values, product notes, app reviews, news
- Anything you want the letter to emphasize
- Optional brand color if known

You can download only the cover letter or append the CV.`;

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
  let activeView = $state<'preview' | 'source' | 'messages'>('preview');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let previewPdfUrl = $state<string | null>(null);
  let previewPdfLoading = $state(false);
  let previewPdfError = $state<string | null>(null);
  let previewRequestId = 0;
  let previewRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  let sourceDirty = $state(false);
  let downloadMenuOpen = $state(false);
  let downloadingPdf = $state(false);
  let activeJobId = $state<string | null>(null);
  let generationRequestId = 0;
  let copiedMessageIndex = $state<number | null>(null);

  const outputText = $derived(sourceDraft);
  const generateButtonLabel = $derived(result ? 'Regenerate' : 'Generate');
  const loadingButtonLabel = $derived(result ? 'Regenerating' : 'Generating');
  const hasDraft = $derived(
    Boolean(dump.trim() || result || error || previewPdfError || sourceDirty)
  );
  const linkedinMessages = $derived(result?.linkedinMessages ?? []);

  // ── Persist across refreshes ──
  onMount(() => {
    const closeDownloadMenu = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest('[data-download-menu]')) downloadMenuOpen = false;
    };

    document.addEventListener('click', closeDownloadMenu);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.dump === 'string') dump = data.dump;
        if (data.result) result = data.result as GeneratedLetter;
        if (typeof data.activeJobId === 'string') activeJobId = data.activeJobId;
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
    if (activeJobId && !result) {
      loading = true;
      void pollApplicationJob(activeJobId, ++generationRequestId).catch((err) => {
        error = err instanceof Error ? err.message : 'Cover letter generation failed.';
        loading = false;
      });
    }

    return () => {
      document.removeEventListener('click', closeDownloadMenu);
      if (previewRefreshTimer) clearTimeout(previewRefreshTimer);
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  });

  $effect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dump, result, sourceDraft, activeJobId }));
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

  function getDownloadFilename(letter: GeneratedLetter, includeCv: boolean) {
    return buildApplicationPdfFilename({
      company: letter.company,
      role: letter.role,
      includeCv
    });
  }

  async function readErrorMessage(res: Response, fallback: string): Promise<string> {
    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
      if (typeof body?.error === 'string' && body.error.trim()) return body.error;
    }

    if (res.status === 502 || res.status === 504) {
      return 'The server or AI provider timed out. Try again in a moment, or shorten the application dump.';
    }

    return fallback;
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function copyLinkedInMessage(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    copiedMessageIndex = index;
    setTimeout(() => {
      if (copiedMessageIndex === index) copiedMessageIndex = null;
    }, 1400);
  }

  async function pollApplicationJob(jobId: string, requestId: number) {
    for (;;) {
      if (requestId !== generationRequestId) return;

      const res = await fetch(`/api/application-cover-letter/status/${jobId}`);
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, `Server returned ${res.status}`));
      }

      const job = (await res.json()) as ApplicationJobStatus;
      if (requestId !== generationRequestId) return;

      if (job.status === 'completed' && job.result) {
        result = job.result;
        sourceDraft = job.result.plainText;
        sourceDirty = false;
        activeJobId = null;
        activeView = 'preview';
        schedulePreviewPdfRefresh(0);
        return;
      }

      if (job.status === 'failed') {
        activeJobId = null;
        throw new Error(job.error ?? 'Cover letter generation failed.');
      }

      await delay(1800);
    }
  }

  async function generateCoverLetter() {
    if (!dump.trim()) {
      error = 'Paste the job post or application brief first.';
      return;
    }

    const requestId = ++generationRequestId;
    loading = true;
    error = null;
    activeJobId = null;
    invalidatePreviewPdf();
    try {
      const res = await fetch('/api/application-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dump })
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, `Server returned ${res.status}`));
      }
      const body = (await res.json()) as { jobId?: string } | GeneratedLetter;

      if ('jobId' in body && body.jobId) {
        activeJobId = body.jobId;
        await pollApplicationJob(body.jobId, requestId);
      } else {
        result = body as GeneratedLetter;
        sourceDraft = result.plainText;
        sourceDirty = false;
        activeJobId = null;
        activeView = 'preview';
        schedulePreviewPdfRefresh(0);
      }
    } catch (err) {
      if (requestId !== generationRequestId) return;
      error = err instanceof Error ? err.message : 'Cover letter generation failed.';
    } finally {
      if (requestId === generationRequestId) loading = false;
    }
  }

  function clearApplicationKit() {
    generationRequestId += 1;
    dump = '';
    result = null;
    activeJobId = null;
    sourceDraft = PREVIEW_PLACEHOLDER.plainText;
    activeView = 'preview';
    error = null;
    previewPdfError = null;
    sourceDirty = false;
    invalidatePreviewPdf();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // unavailable — ignore
    }

    schedulePreviewPdfRefresh(0);
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
          role: letter.role,
          includeCv: true
        })
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, `Server returned ${res.status}`));
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

  async function downloadPdf(includeCv: boolean) {
    const letter = result ?? PREVIEW_PLACEHOLDER;
    downloadingPdf = true;
    downloadMenuOpen = false;
    previewPdfError = null;

    try {
      const res = await fetch('/api/application-cover-letter/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: letter.recipient,
          plainText: outputText,
          company: letter.company,
          role: letter.role,
          includeCv
        })
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, `Server returned ${res.status}`));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = getDownloadFilename(letter, includeCv);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      previewPdfError = err instanceof Error ? err.message : 'Download failed.';
    } finally {
      downloadingPdf = false;
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
        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Clear application kit"
            title="Clear application kit"
            class="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-300 bg-white px-2.5 text-xs font-medium text-cork-600 transition-colors hover:bg-cork-100 hover:text-cork-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || !hasDraft}
            onclick={clearApplicationKit}
          >
            <Trash2 class="size-3.5" />
          </button>
          <button
            type="button"
            class="generate-button inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
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
              PDF
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 border-l border-cork-300 px-2.5 text-xs font-medium transition-colors sm:px-3 {activeView ===
              'source'
                ? 'bg-cork-700 text-cork-50'
                : 'bg-white text-cork-600 hover:bg-cork-100'}"
              onclick={() => (activeView = 'source')}
            >
              <FilePenLine class="size-3.5" />
              Letter
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center gap-1.5 border-l border-cork-300 px-2.5 text-xs font-medium transition-colors sm:px-3 {activeView ===
              'messages'
                ? 'bg-cork-700 text-cork-50'
                : 'bg-white text-cork-600 hover:bg-cork-100'}"
              onclick={() => (activeView = 'messages')}
            >
              <MessageCircle class="size-3.5" />
              LinkedIn
            </button>
          </div>

          {#if activeView === 'preview' || activeView === 'source'}
            <div class="flex h-8 w-full items-center gap-2 sm:ml-auto sm:w-auto">
              {#if activeView === 'preview' && previewPdfUrl}
                <div class="relative flex-1 sm:flex-none" data-download-menu>
                  <button
                    type="button"
                    aria-label="Download PDF"
                    title="Download PDF"
                    class="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cork-300 bg-white px-3 text-xs font-medium text-cork-600 transition-colors hover:bg-cork-100 hover:text-cork-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={downloadingPdf}
                    onclick={() => (downloadMenuOpen = !downloadMenuOpen)}
                  >
                    {#if downloadingPdf}
                      <LoaderCircle class="size-3.5 animate-spin" />
                    {:else}
                      <Download class="size-3.5" />
                    {/if}
                    <span class="sm:hidden">Download</span>
                  </button>
                  {#if downloadMenuOpen}
                    <div
                      class="absolute top-full right-0 z-10 mt-1 w-48 overflow-hidden rounded-lg border border-cork-300 bg-white py-1 text-xs font-medium text-cork-700 shadow-lg"
                    >
                      <button
                        type="button"
                        class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-cork-100"
                        onclick={() => downloadPdf(false)}
                      >
                        <FileText class="size-3.5" />
                        Cover letter only
                      </button>
                      <button
                        type="button"
                        class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-cork-100"
                        onclick={() => downloadPdf(true)}
                      >
                        <Files class="size-3.5" />
                        Cover letter + CV
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}
              {#if activeView === 'source'}
                <button
                  type="button"
                  aria-label="Compile PDF"
                  title="Compile PDF"
                  class="inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none {sourceDirty
                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border-cork-300 bg-white text-cork-600 hover:bg-cork-100 hover:text-cork-800'}"
                  disabled={previewPdfLoading}
                  onclick={compilePdf}
                >
                  <RefreshCw class={`size-3.5 ${previewPdfLoading ? 'animate-spin' : ''}`} />
                  <span class="sm:hidden">Compile PDF</span>
                </button>
              {/if}
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
                data={`${previewPdfUrl}#toolbar=0&navpanes=0`}
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
        {:else if activeView === 'messages'}
          <div
            class="h-[calc(100svh-340px)] min-h-128 overflow-auto rounded-lg border border-cork-300 bg-cork-50 p-4"
          >
            {#if linkedinMessages.length > 0}
              <div class="space-y-3">
                {#each linkedinMessages as message, index (index)}
                  <article class="rounded-lg border border-cork-200 bg-white p-4 shadow-sm">
                    <div class="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 class="text-sm font-semibold text-cork-800">{message.label}</h3>
                      </div>
                      <button
                        type="button"
                        aria-label={`Copy ${message.label}`}
                        title={`Copy ${message.label}`}
                        class="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-cork-300 bg-white px-2.5 text-xs font-medium text-cork-600 transition-colors hover:bg-cork-100 hover:text-cork-800"
                        onclick={() => copyLinkedInMessage(message.text, index)}
                      >
                        <Copy class="size-3.5" />
                        {copiedMessageIndex === index ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p class="text-sm leading-relaxed whitespace-pre-wrap text-cork-800">
                      {message.text}
                    </p>
                  </article>
                {/each}
              </div>
            {:else}
              <div class="flex h-full items-center justify-center text-center">
                <p class="max-w-sm text-sm leading-relaxed text-cork-500">
                  LinkedIn message drafts will appear here after generation.
                </p>
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </section>
  </div>
</div>

<style>
  textarea {
    scrollbar-width: thin;
    scrollbar-color: #c9b99a transparent;
  }

  textarea::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  textarea::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb {
    background: #c9b99a;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb:hover {
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
