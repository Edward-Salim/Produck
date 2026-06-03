<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import {
    Download,
    Upload,
    LoaderCircle,
    Save,
    Sparkles,
    ChevronUp,
    ChevronDown,
    Code,
    FormInput
  } from '@lucide/svelte';
  import { type DiffLine, computeDiff } from './admin-diff.js';
  import { KEY_LABELS, SECTIONS, FORM_FIELDS, getNewRecordTemplate } from './admin-config.js';
  import AdminFormView from './AdminFormView.svelte';
  import AdminAiBar from './AdminAiBar.svelte';

  let { data } = $props();

  let loading = $state(true);
  let saving = $state(false);
  let fullData = $state<Record<string, any> | null>(null);
  let jsonText = $state('');
  let originalJson = $state('');
  let error = $state('');
  let success = $state('');
  let hasChanges = $derived(jsonText !== originalJson);
  let viewMode = $state<'json' | 'form'>('form');

  // AI assistant
  let aiPrompt = $state('');
  let aiLoading = $state(false);
  let aiError = $state('');
  let aiDiff = $state<{ oldText: string; newText: string; lines: DiffLine[] } | null>(null);

  // Per-section diff storage
  let diffsBySection = $state<Record<string, { oldText: string; newText: string }>>(
    (() => {
      try {
        const saved =
          typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_ai_diffs');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    })()
  );

  // Group consecutive changed lines into chunks
  let diffChunks = $derived.by(() => {
    if (!aiDiff) return [];
    const chunks: number[] = [];
    let inChunk = false;
    for (let i = 0; i < aiDiff.lines.length; i++) {
      if (aiDiff.lines[i].type !== 'same') {
        if (!inChunk) {
          chunks.push(i);
          inChunk = true;
        }
      } else {
        inChunk = false;
      }
    }
    return chunks;
  });
  let currentChunkIdx = $state(0);

  function jumpToDiff(direction: 'prev' | 'next') {
    if (diffChunks.length === 0) return;
    if (direction === 'next') {
      currentChunkIdx = (currentChunkIdx + 1) % diffChunks.length;
    } else {
      currentChunkIdx = (currentChunkIdx - 1 + diffChunks.length) % diffChunks.length;
    }
    const lineIdx = diffChunks[currentChunkIdx];
    const el = document.getElementById(`diff-line-${lineIdx}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function persistDiffs() {
    sessionStorage.setItem('admin_ai_diffs', JSON.stringify(diffsBySection));
  }

  function setDiff(diff: typeof aiDiff) {
    aiDiff = diff;
    if (diff) {
      diffsBySection[activeFilter] = { oldText: diff.oldText, newText: diff.newText };
    } else {
      delete diffsBySection[activeFilter];
    }
    persistDiffs();
  }

  function acceptAiChanges() {
    if (!aiDiff) return;
    jsonText = aiDiff.newText;
    applyFilteredBack();
    setDiff(null);
  }

  function rejectAiChanges() {
    setDiff(null);
  }

  function loadDiffForFilter() {
    const saved = diffsBySection[activeFilter];
    if (saved) {
      aiDiff = {
        oldText: saved.oldText,
        newText: saved.newText,
        lines: computeDiff(saved.oldText, saved.newText)
      };
      currentChunkIdx = 0;
    } else {
      aiDiff = null;
    }
  }

  function hasDiffFor(key: string): boolean {
    return key in diffsBySection;
  }

  let activeSection = $state<string>(
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_section')) || 'all'
  );
  let expandedSections = $state<Set<string>>(new Set());
  // activeFilter: either a section key (show all its subs) or a specific data key (show just that)
  let activeFilter = $state<string>(
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_filter')) || 'all'
  );

  $effect(() => {
    sessionStorage.setItem('admin_section', activeSection);
    sessionStorage.setItem('admin_filter', activeFilter);
  });

  function getKeysForFilter(): string[] | null {
    // If it's a specific data key
    if (activeFilter in KEY_LABELS && activeFilter !== 'all') {
      return [activeFilter];
    }
    // If it's a section key
    const section = SECTIONS.find((s) => s.key === activeFilter);
    if (section && section.subs.length > 0) return [...section.subs];
    return null; // all data
  }

  function getFilteredJson(): string {
    if (!fullData) return '';
    const keys = getKeysForFilter();
    if (!keys) return JSON.stringify(fullData, null, 2);
    if (keys.length === 1) {
      // Single key — show just the value directly
      const val = fullData[keys[0]];
      return val !== undefined ? JSON.stringify({ [keys[0]]: val }, null, 2) : '{}';
    }
    const filtered: Record<string, any> = {};
    for (const k of keys) {
      if (k in fullData) filtered[k] = fullData[k];
    }
    return JSON.stringify(filtered, null, 2);
  }

  function getCount(key: string): number | null {
    if (!fullData || !(key in fullData)) return null;
    const val = fullData[key];
    return Array.isArray(val) ? val.length : val ? 1 : 0;
  }

  function selectSection(sectionKey: string) {
    applyFilteredBack(); // save current edits with OLD filter
    activeSection = sectionKey;
    activeFilter = sectionKey;
    if (expandedSections.has(sectionKey)) {
      expandedSections.delete(sectionKey);
    } else {
      expandedSections.add(sectionKey);
    }
    jsonText = getFilteredJson();
    originalJson = getFilteredJson();
    loadDiffForFilter();
  }

  function selectSubItem(dataKey: string, sectionKey: string) {
    applyFilteredBack(); // save current edits with OLD filter
    activeSection = sectionKey;
    activeFilter = dataKey;
    jsonText = getFilteredJson();
    originalJson = getFilteredJson();
    loadDiffForFilter();
  }

  function applyFilteredBack() {
    if (!fullData) return;
    const keys = getKeysForFilter();
    if (!keys) {
      try {
        fullData = JSON.parse(jsonText);
      } catch {}
      return;
    }
    try {
      const edited = JSON.parse(jsonText);
      for (const k of keys) {
        if (k in edited) fullData[k] = edited[k];
      }
    } catch {}
  }

  async function loadData() {
    const projectId = data.lastProject;
    if (!projectId) {
      error = 'No project selected';
      loading = false;
      return;
    }
    loading = true;
    error = '';
    success = '';
    const res = await fetch(`/api/admin?projectId=${projectId}`);
    if (res.ok) {
      fullData = await res.json();
      jsonText = getFilteredJson();
      originalJson = getFilteredJson();
    } else {
      error = 'Failed to load project data';
    }
    loading = false;
  }

  async function saveData() {
    saving = true;
    error = '';
    success = '';
    try {
      applyFilteredBack();
      const body = JSON.stringify(fullData);
      JSON.parse(body);
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      if (res.ok) {
        success = 'Saved successfully';
        await loadData();
        await invalidateAll();
      } else {
        const d = await res.json();
        error = d.error || 'Save failed';
      }
    } catch (e) {
      error = 'Invalid JSON: ' + (e instanceof Error ? e.message : 'parse error');
    }
    saving = false;
  }

  function downloadJson() {
    applyFilteredBack();
    const text = JSON.stringify(fullData, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${data.lastProject}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        fullData = JSON.parse(text);
        activeSection = 'all';
        jsonText = getFilteredJson();
        originalJson = '';
      } catch {
        error = 'Invalid JSON file';
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  async function askAI(e?: Event) {
    e?.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    aiLoading = true;
    aiError = '';

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: aiPrompt,
          currentJson: jsonText,
          projectInfo: fullData?.project ? JSON.stringify(fullData.project) : undefined,
          activeSection
        })
      });

      if (res.ok) {
        const { result } = await res.json();
        let formatted: string;
        try {
          formatted = JSON.stringify(JSON.parse(result), null, 2);
        } catch {
          formatted = result;
        }
        // Show diff instead of replacing directly
        setDiff({
          oldText: jsonText,
          newText: formatted,
          lines: computeDiff(jsonText, formatted)
        });
        aiPrompt = '';
      } else {
        const d = await res.json();
        aiError = d.error || 'AI request failed';
      }
    } catch (err) {
      aiError = err instanceof Error ? err.message : 'AI request failed';
    }
    aiLoading = false;
  }

  // ── Form view helpers ──

  function getFormData(): any[] {
    if (!fullData) return [];
    const keys = getKeysForFilter();
    if (!keys) return []; // "All Data" — no form view
    if (keys.length === 1) {
      const val = fullData[keys[0]];
      return Array.isArray(val) ? val : val ? [val] : [];
    }
    return []; // Multiple keys — show section-level, no inline form
  }

  function getFormKey(): string | null {
    const keys = getKeysForFilter();
    if (!keys || keys.length !== 1) return null;
    return keys[0];
  }

  function addRecord() {
    const key = getFormKey();
    if (!key || !fullData) return;
    if (!Array.isArray(fullData[key])) return;
    const existing = fullData[key];
    const maxId = existing.reduce((max: number, r: any) => Math.max(max, r.id ?? 0), 0);
    // Create minimal record based on key type
    const template = getNewRecordTemplate(key, maxId + 1, fullData?.project?.id);
    existing.push(template);
    syncFormToFullData();
  }

  function removeRecord(index: number) {
    const key = getFormKey();
    if (!key || !fullData || !Array.isArray(fullData[key])) return;
    fullData[key].splice(index, 1);
    syncFormToFullData();
  }

  function syncFormToFullData() {
    // Update jsonText to reflect form changes (for save detection)
    jsonText = getFilteredJson();
  }

  let formItems = $derived(getFormData());
  let formKey = $derived(getFormKey());
  let formFields = $derived(formKey ? (FORM_FIELDS[formKey] ?? []) : []);
  let activeSectionSubs = $derived.by(() => {
    const sec = SECTIONS.find((s) => s.key === activeSection);
    return sec && sec.subs.length > 1 ? sec.subs : [];
  });

  $effect(() => {
    void data.lastProject;
    loadData().then(() => {
      loadDiffForFilter();
    });
  });
</script>

<svelte:head><title>Admin - Produck</title></svelte:head>

<header class="mb-4 md:mb-6">
  <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Admin</h1>
  <p class="mt-0.5 text-sm text-cork-500">View and edit project data</p>
</header>

<!-- Toolbar -->
<div class="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
  <!-- View toggle -->
  <div class="flex overflow-hidden rounded-lg border border-cork-300">
    <button
      type="button"
      class="flex cursor-pointer items-center px-2.5 py-1.5 text-sm font-medium transition-colors md:px-3 md:py-2 {viewMode ===
      'form'
        ? 'bg-cork-700 text-cork-50'
        : 'text-cork-600 hover:bg-cork-200/50'}"
      onclick={() => {
        if (viewMode === 'json') {
          applyFilteredBack();
        }
        viewMode = 'form';
      }}
    >
      <FormInput class="size-4" />
    </button>
    <button
      type="button"
      class="flex cursor-pointer items-center px-2.5 py-1.5 text-sm font-medium transition-colors md:px-3 md:py-2 {viewMode ===
      'json'
        ? 'bg-cork-700 text-cork-50'
        : 'text-cork-600 hover:bg-cork-200/50'}"
      onclick={() => {
        jsonText = getFilteredJson();
        originalJson = getFilteredJson();
        viewMode = 'json';
      }}
    >
      <Code class="size-4" />
    </button>
  </div>
  <button
    onclick={downloadJson}
    title="Export JSON"
    class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cork-300 px-2.5 py-1.5 text-sm font-medium text-cork-600 transition-colors hover:bg-cork-200/50 md:gap-2 md:px-3 md:py-2"
  >
    <Download class="size-4" /><span class="hidden sm:inline">Export</span>
  </button>
  <label
    title="Import JSON"
    class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cork-300 px-2.5 py-1.5 text-sm font-medium text-cork-600 transition-colors hover:bg-cork-200/50 md:gap-2 md:px-3 md:py-2"
  >
    <Upload class="size-4" /><span class="hidden sm:inline">Import</span>
    <input type="file" accept=".json" class="hidden" onchange={handleFileUpload} />
  </label>
  <div class="flex-1"></div>
  {#if error}
    <span class="text-xs text-red-600 md:text-sm">{error}</span>
  {/if}
  {#if success}
    <span class="text-xs text-green-700 md:text-sm">{success}</span>
  {/if}
  <button
    onclick={saveData}
    disabled={saving || !hasChanges}
    class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cork-700 px-3 py-1.5 text-sm font-medium text-cork-50 transition-colors hover:bg-cork-800 disabled:opacity-40 md:gap-2 md:px-4 md:py-2"
  >
    {#if saving}
      <LoaderCircle class="size-4 animate-spin" /><span class="hidden sm:inline">Saving...</span>
    {:else}
      <Save class="size-4" /><span class="hidden sm:inline">Save Changes</span>
    {/if}
  </button>
</div>

<!-- Main: filter pane + editor + AI -->
{#if loading}
  <div class="flex items-center justify-center" style="height: calc(100vh - 240px)">
    <LoaderCircle class="size-6 animate-spin text-cork-400" />
  </div>
{:else}
  <div class="flex flex-col gap-3 md:flex-row" style="height: calc(100vh - 240px)">
    <!-- Section filter: horizontal scroll on mobile, vertical sidebar on desktop -->
    <div class="shrink-0 space-y-1.5 md:w-44 md:space-y-0">
      <div
        class="left-pane flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:flex-col md:space-y-0.5 md:overflow-x-visible md:overflow-y-auto md:pb-0 md:[scrollbar-width:thin]"
      >
        {#each SECTIONS as section (section.key)}
          {@const isActive = activeSection === section.key}
          {@const isExpanded = expandedSections.has(section.key)}
          {@const hasSubs = section.subs.length > 1}
          {@const sectionHasDiff = hasSubs
            ? section.subs.some((s) => hasDiffFor(s))
            : hasDiffFor(section.key)}
          <div class="shrink-0 md:shrink">
            <!-- Section header -->
            <button
              type="button"
              class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-medium whitespace-nowrap transition-colors md:py-2 {isActive &&
              activeFilter === section.key
                ? 'bg-cork-700 text-cork-50'
                : isActive
                  ? 'bg-cork-200 text-cork-800'
                  : 'text-cork-600 hover:bg-cork-200/50'}"
              onclick={() => selectSection(section.key)}
            >
              <span class="flex items-center gap-1.5">
                {section.label}
                {#if sectionHasDiff}
                  <span class="size-1.5 rounded-full bg-amber-500"></span>
                {/if}
              </span>
            </button>
            <!-- Sub-items (accordion) — desktop only -->
            {#if hasSubs && (isExpanded || isActive)}
              <div class="ml-3 hidden space-y-0.5 border-l border-cork-300/40 pl-2 md:block">
                {#each section.subs as subKey (subKey)}
                  {@const count = getCount(subKey)}
                  {@const subHasDiff = hasDiffFor(subKey)}
                  <button
                    type="button"
                    class="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-left text-[11px] transition-colors {activeFilter ===
                    subKey
                      ? 'bg-cork-600 text-cork-50'
                      : 'text-cork-500 hover:bg-cork-200/40 hover:text-cork-700'}"
                    onclick={() => selectSubItem(subKey, section.key)}
                  >
                    <span class="flex items-center gap-1.5">
                      {KEY_LABELS[subKey] ?? subKey}
                      {#if subHasDiff}
                        <span class="size-1.5 rounded-full bg-amber-500"></span>
                      {/if}
                    </span>
                    {#if count !== null}
                      <span
                        class="rounded-full px-1.5 py-0.5 text-[9px] {activeFilter === subKey
                          ? 'bg-cork-500 text-cork-100'
                          : 'bg-cork-200/60 text-cork-400'}">{count}</span
                      >
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Mobile sub-items row -->
      {#if activeSectionSubs.length > 0}
        <div
          class="flex gap-1.5 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:hidden"
        >
          {#each activeSectionSubs as subKey (subKey)}
            {@const count = getCount(subKey)}
            {@const subHasDiff = hasDiffFor(subKey)}
            <button
              type="button"
              class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {activeFilter ===
              subKey
                ? 'bg-cork-600 text-cork-50'
                : 'bg-cork-200/50 text-cork-500 hover:bg-cork-300/50'}"
              onclick={() => selectSubItem(subKey, activeSection)}
            >
              {KEY_LABELS[subKey] ?? subKey}
              {#if subHasDiff}
                <span class="size-1.5 rounded-full bg-amber-500"></span>
              {/if}
              {#if count !== null}
                <span
                  class="rounded-full px-1 text-[9px] {activeFilter === subKey
                    ? 'bg-cork-500 text-cork-100'
                    : 'bg-cork-300/50 text-cork-400'}">{count}</span
                >
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Editor + AI prompt -->
    <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      {#if aiDiff}
        <!-- Diff view -->
        <div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-cork-300">
          <div
            class="flex items-center justify-between border-b border-cork-200 bg-cork-100 px-4 py-2"
          >
            <div class="flex items-center gap-2">
              <Sparkles class="size-4 text-cork-500" />
              <span class="text-xs font-medium text-cork-700">AI suggested changes</span>
              <span
                class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700"
              >
                +{aiDiff.lines.filter((l) => l.type === 'add').length}
              </span>
              <span
                class="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700"
              >
                -{aiDiff.lines.filter((l) => l.type === 'remove').length}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 rounded-md border border-cork-200 bg-white/50">
                <button
                  type="button"
                  onclick={() => jumpToDiff('prev')}
                  class="cursor-pointer px-1.5 py-1 text-cork-500 hover:text-cork-700"
                  title="Previous change"
                >
                  <ChevronUp class="size-3.5" />
                </button>
                <span class="text-[10px] text-cork-400"
                  >{diffChunks.length > 0
                    ? `${currentChunkIdx + 1}/${diffChunks.length}`
                    : '0'}</span
                >
                <button
                  type="button"
                  onclick={() => jumpToDiff('next')}
                  class="cursor-pointer px-1.5 py-1 text-cork-500 hover:text-cork-700"
                  title="Next change"
                >
                  <ChevronDown class="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                onclick={rejectAiChanges}
                class="cursor-pointer rounded-md border border-cork-300 px-3 py-1 text-xs font-medium text-cork-600 transition-colors hover:bg-cork-200/50"
                >Reject</button
              >
              <button
                type="button"
                onclick={acceptAiChanges}
                class="cursor-pointer rounded-md bg-green-700 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-800"
                >Accept</button
              >
            </div>
          </div>
          <div class="diff-scroll flex-1 overflow-y-auto bg-white p-0 font-mono text-xs">
            {#each aiDiff.lines as line, i (i)}
              <div id="diff-line-{i}" class="flex">
                <span
                  class="w-8 shrink-0 border-r border-cork-100 py-0.5 pr-2 text-right text-[10px] text-cork-300 select-none {line.type ===
                  'add'
                    ? 'bg-green-50'
                    : line.type === 'remove'
                      ? 'bg-red-50'
                      : ''}"
                >
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                </span>
                <pre
                  class="flex-1 py-0.5 pl-2 whitespace-pre {line.type === 'add'
                    ? 'bg-green-50 text-green-800'
                    : line.type === 'remove'
                      ? 'bg-red-50 text-red-800 line-through opacity-60'
                      : 'text-cork-700'}">{line.text}</pre>
              </div>
            {/each}
          </div>
        </div>
      {:else if viewMode === 'json'}
        <textarea
          bind:value={jsonText}
          class="flex-1 resize-none rounded-xl border border-cork-300 bg-cork-50 p-4 font-mono text-xs text-cork-800 focus:ring-2 focus:ring-cork-400/50 focus:outline-none"
          spellcheck="false"
        ></textarea>
      {:else}
        <AdminFormView
          {formKey}
          {formFields}
          {formItems}
          keyLabels={KEY_LABELS}
          onSyncForm={syncFormToFullData}
          onAddRecord={addRecord}
          onRemoveRecord={removeRecord}
        />
      {/if}

      <AdminAiBar bind:aiPrompt {aiLoading} {aiError} onSubmit={askAI} />
    </div>
  </div>
{/if}

<style>
  textarea,
  .diff-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    tab-size: 2;
  }
  @media (min-width: 768px) {
    .left-pane {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    }
    .left-pane::-webkit-scrollbar {
      width: 3px;
    }
    .left-pane::-webkit-scrollbar-track {
      background: transparent;
    }
    .left-pane::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
  }
</style>
