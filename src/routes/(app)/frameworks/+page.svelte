<script lang="ts">
  import { navigating, page } from '$app/state';
  import { invalidateAll, replaceState } from '$app/navigation';
  import { onMount } from 'svelte';
  import { getFullscreen, toggleFullscreen } from '$lib/stores/fullscreen.svelte.js';
  import { FRAMEWORK_TEMPLATES, type FrameworkTemplate } from '$lib/frameworks/templates.js';
  import {
    ArrowDownUp,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Circle,
    Clock,
    Compass,
    FlaskConical,
    Info,
    Layers3,
    Link2,
    LoaderCircle,
    Maximize,
    Minimize,
    Plus,
    Rocket,
    Search,
    Target,
    Trash2
  } from '@lucide/svelte';

  import type { FrameworkPageInstance } from './+page.server.js';
  import IdeaBankEditor from '$lib/components/frameworks/IdeaBankEditor.svelte';
  import StoryMapEditor from '$lib/components/frameworks/StoryMapEditor.svelte';
  import BacklogEditor from '$lib/components/frameworks/BacklogEditor.svelte';
  import AssumptionsEditor from '$lib/components/frameworks/AssumptionsEditor.svelte';
  import OutcomesEditor from '$lib/components/frameworks/OutcomesEditor.svelte';
  import ExperienceMapEditor from '$lib/components/frameworks/ExperienceMapEditor.svelte';
  import InterviewSnapshotEditor from '$lib/components/frameworks/InterviewSnapshotEditor.svelte';
  import KanbanBoardEditor from '$lib/components/frameworks/KanbanBoardEditor.svelte';
  import FintechLandscapeEditor from '$lib/components/frameworks/FintechLandscapeEditor.svelte';
  import ValuePropositionCanvasEditor from '$lib/components/frameworks/ValuePropositionCanvasEditor.svelte';
  import LeanCanvasEditor from '$lib/components/frameworks/LeanCanvasEditor.svelte';
  import BusinessModelCanvasEditor from '$lib/components/frameworks/BusinessModelCanvasEditor.svelte';
  import MarketSizingEditor from '$lib/components/frameworks/MarketSizingEditor.svelte';
  import OrganogramEditor from '$lib/components/frameworks/OrganogramEditor.svelte';
  import SitemapEditor from '$lib/components/frameworks/SitemapEditor.svelte';
  import type { FrameworkInstance } from '$lib/components/frameworks/types.js';
  import type { Component } from 'svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';

  type FrameworkView = 'templates' | 'editor';
  type MarketSizingCurrency = 'USD' | 'IDR';

  let { data } = $props<{
    data: {
      frameworkInstances: FrameworkPageInstance[];
      workspaceId: number;
      projectId: number;
      projectName: string;
      epicKanbanSyncEnabled: boolean;
      fintechPicks: { companyId: string }[];
      currentUser?: { displayName?: string };
    };
  }>();

  let projectId = $derived(page.url.searchParams.get('project') ?? String(data.projectId));

  const locallyDeletedTemplateIds = new Set<string>();
  let instances = $derived.by<FrameworkInstance[]>(() => [
    ...new Map(
      (data.frameworkInstances as FrameworkInstance[])
        .filter((instance) => !locallyDeletedTemplateIds.has(instance.templateId))
        .map((instance) => [instance.templateId, instance])
    ).values()
  ]);
  let contextSwitching = $state(false);
  let selectedInstanceId = $state<string | null>(null);
  let selectedCategory = $state<'all' | FrameworkTemplate['category']>('all');
  let view = $state<FrameworkView>('templates');
  let deleteTargetId = $state<string | null>(null);
  let deleteTargetTitle = $derived(
    deleteTargetId ? (instances.find((i) => i.id === deleteTargetId)?.title ?? '') : ''
  );
  let draftPage = $state(0);
  let draftSort = $state<'modified' | 'name'>('modified');
  const DRAFTS_PER_PAGE = 10;
  let fullscreen = $derived(getFullscreen());
  let showHelp = $state(false);
  let showKanbanHistory = $state(false);
  let marketSizingCurrency = $state<MarketSizingCurrency>('USD');
  let syncUpdating = $state(false);
  let syncConfirmationOpen = $state(false);
  let syncError = $state('');
  let isFrameworkLoading = $derived(
    contextSwitching ||
      (navigating.to?.url.pathname === '/frameworks' &&
        navigating.to.url.searchParams.get('project') !== page.url.searchParams.get('project'))
  );

  const templates = FRAMEWORK_TEMPLATES;

  onMount(() => {
    const requestedFramework = page.url.searchParams.get('framework');
    const requestedInstance = requestedFramework
      ? instances.find(
          (instance) =>
            instance.templateId === requestedFramework || instance.id === requestedFramework
        )
      : null;
    if (requestedInstance) {
      selectedInstanceId = requestedInstance.id;
      view = 'editor';
    }

    const startContextSwitch = () => (contextSwitching = true);
    const endContextSwitch = () => (contextSwitching = false);
    window.addEventListener('produck:context-switch-start', startContextSwitch);
    window.addEventListener('produck:context-switch-end', endContextSwitch);

    return () => {
      window.removeEventListener('produck:context-switch-start', startContextSwitch);
      window.removeEventListener('produck:context-switch-end', endContextSwitch);
    };
  });

  function handleKeydown(e: KeyboardEvent) {
    if (
      e.key === 'f' &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      view === 'editor' &&
      selectedInstance
    ) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      toggleFullscreen();
    }
  }

  let categories = $derived(['all', ...new Set(templates.map((t) => t.category))] as Array<
    'all' | FrameworkTemplate['category']
  >);

  let filteredTemplates = $derived.by(() => {
    const byCategory =
      selectedCategory === 'all'
        ? templates
        : templates.filter((t) => t.category === selectedCategory);
    // Sort: unpicked first (original order), picked last (most recently updated first)
    return [...byCategory].sort((a, b) => {
      const aPicked = existingTemplateIds.has(a.id);
      const bPicked = existingTemplateIds.has(b.id);
      if (aPicked !== bPicked) return aPicked ? 1 : -1;
      if (aPicked) {
        // Both picked: most recently updated first
        const aUpdated = instances.find((i) => i.templateId === a.id)?.updatedAt ?? '';
        const bUpdated = instances.find((i) => i.templateId === b.id)?.updatedAt ?? '';
        return bUpdated.localeCompare(aUpdated);
      }
      // Both unpicked: keep original template order
      return 0;
    });
  });

  let selectedInstance = $derived(
    instances.find((i) => i.id === selectedInstanceId) ?? instances[0] ?? null
  );

  let sortedInstances = $derived(
    [...instances].sort((a, b) => {
      if (draftSort === 'name') return a.title.localeCompare(b.title);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
  );
  let totalDraftPages = $derived(Math.max(1, Math.ceil(sortedInstances.length / DRAFTS_PER_PAGE)));
  let paginatedInstances = $derived(
    sortedInstances.slice(draftPage * DRAFTS_PER_PAGE, (draftPage + 1) * DRAFTS_PER_PAGE)
  );

  let selectedTemplate = $derived(
    selectedInstance ? (templates.find((t) => t.id === selectedInstance.templateId) ?? null) : null
  );

  let existingTemplateIds = $derived(new Set(instances.map((i) => i.templateId)));
  let showEpicKanbanSync = $derived(
    (selectedTemplate?.id === 'backlog' || selectedTemplate?.id === 'kanban') &&
      existingTemplateIds.has('backlog') &&
      existingTemplateIds.has('kanban')
  );

  function requestEpicKanbanSync() {
    syncError = '';
    syncConfirmationOpen = true;
  }

  async function toggleEpicKanbanSync() {
    if (syncUpdating) return;
    syncUpdating = true;
    syncError = '';
    try {
      const response = await fetch('/api/epic-kanban-sync', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: Number(projectId),
          enabled: !data.epicKanbanSyncEnabled
        })
      });
      if (!response.ok) {
        syncError = 'Could not update synchronization. Please try again.';
        return;
      }
      syncConfirmationOpen = false;
      await invalidateAll();
    } catch {
      syncError = 'Could not update synchronization. Please try again.';
    } finally {
      syncUpdating = false;
    }
  }

  function toggleMarketSizingCurrency() {
    marketSizingCurrency = marketSizingCurrency === 'USD' ? 'IDR' : 'USD';
  }

  // ── Custom editor map ──
  const CUSTOM_EDITORS: Record<
    string,
    Component<{
      instance: FrameworkInstance;
      draftMode: 'edit' | 'view';
      onUpdate: (values: Record<string, string>, title?: string) => void;
      projectId?: string;
      projectName?: string;
      showHistory?: boolean;
      fintechPicks?: { companyId: string }[];
      currency?: MarketSizingCurrency;
    }>
  > = {
    sitemap: SitemapEditor,
    'fintech-landscape': FintechLandscapeEditor,
    'value-proposition-canvas': ValuePropositionCanvasEditor,
    'lean-canvas': LeanCanvasEditor,
    'business-model-canvas': BusinessModelCanvasEditor,
    'market-sizing': MarketSizingEditor,
    organogram: OrganogramEditor,
    'idea-bank': IdeaBankEditor,
    'story-map': StoryMapEditor,
    backlog: BacklogEditor,
    'assumption-test': AssumptionsEditor,
    outcomes: OutcomesEditor,
    'experience-map': ExperienceMapEditor,
    'interview-snapshot': InterviewSnapshotEditor,
    kanban: KanbanBoardEditor
  };

  function saveInstances(next: FrameworkInstance[]) {
    instances = next;
  }

  function getDeletedTemplateIds(): Set<string> {
    return new Set(locallyDeletedTemplateIds);
  }

  function saveDeletedTemplateIds(next: Set<string>) {
    locallyDeletedTemplateIds.clear();
    for (const id of next) locallyDeletedTemplateIds.add(id);
  }

  function setFrameworkUrl(templateId: string | null) {
    const url = new URL(page.url);
    if (templateId) url.searchParams.set('framework', templateId);
    else url.searchParams.delete('framework');
    replaceState(url, page.state);
  }

  function openTemplateLibrary() {
    view = 'templates';
    setFrameworkUrl(null);
  }

  function clearDeletedTemplate(templateId: string) {
    const deleted = getDeletedTemplateIds();
    if (!deleted.delete(templateId)) return;
    saveDeletedTemplateIds(deleted);
  }

  function uniqueTitle(name: string): string {
    const existingNames = new Set(instances.map((i) => i.title));
    if (!existingNames.has(name)) return name;
    let n = 2;
    while (existingNames.has(`${name} #${n}`)) n++;
    return `${name} #${n}`;
  }

  function createInstance(template: FrameworkTemplate) {
    clearDeletedTemplate(template.id);

    const emptyValues: Record<string, string> = {};
    if (template.id === 'interview-snapshot') {
      emptyValues.snapshots = JSON.stringify([
        {
          id: crypto.randomUUID(),
          personName: '',
          personRole: '',
          personPhoto: '',
          interviewDate: new Date().toISOString().slice(0, 10),
          quote: '',
          quickFacts: '',
          insights: '',
          opportunities: '',
          transcript: ''
        }
      ]);
    } else if (template.id === 'outcomes') {
      emptyValues.outcomes = JSON.stringify({ businessOutcomes: [], objectives: [] });
    } else if (template.id === 'experience-map') {
      emptyValues.experienceMap = JSON.stringify({ outcomes: [], phases: [] });
    } else if (template.id === 'idea-bank') {
      emptyValues.ideas = JSON.stringify([]);
    } else if (template.id === 'story-map') {
      emptyValues.storyMap = JSON.stringify({
        product: '',
        actors: [],
        levels: 2,
        activities: [],
        stories: { 'must-have': [], performance: [], delighter: [] }
      });
    } else if (template.id === 'backlog') {
      emptyValues.backlog = JSON.stringify({ epics: [] });
    } else if (template.id === 'assumption-test') {
      emptyValues.assumptions = JSON.stringify([]);
    } else if (template.id === 'kanban') {
      // Kanban fetches from DB directly.
    } else if (template.id === 'value-proposition-canvas') {
      emptyValues.valuePropositionCanvas = JSON.stringify({
        customerJobs: '',
        pains: '',
        gains: '',
        productsServices: '',
        painRelievers: '',
        gainCreators: ''
      });
    } else if (template.id === 'lean-canvas') {
      emptyValues.leanCanvas = JSON.stringify({
        problem: '',
        existingAlternatives: '',
        solution: '',
        keyMetrics: '',
        uniqueValueProposition: '',
        highLevelConcept: '',
        unfairAdvantage: '',
        channels: '',
        customerSegments: '',
        earlyAdopters: '',
        costStructure: '',
        revenueStreams: ''
      });
    } else if (template.id === 'business-model-canvas') {
      emptyValues.businessModelCanvas = JSON.stringify({
        keyPartners: '',
        keyActivities: '',
        keyResources: '',
        valuePropositions: '',
        customerRelationships: '',
        channels: '',
        customerSegments: '',
        costStructure: '',
        revenueStreams: ''
      });
    } else if (template.id === 'market-sizing') {
      emptyValues.marketSizing = JSON.stringify({
        tamEstimate: '',
        tamCalculation: '',
        samEstimate: '',
        samCalculation: '',
        somEstimate: '',
        somCalculation: '',
        assumptions: '',
        sources: ''
      });
    } else if (template.id === 'organogram') {
      emptyValues.organogram = JSON.stringify({});
    } else {
      for (const f of template.fields) emptyValues[f.id] = '';
    }

    const instance: FrameworkInstance = {
      id: crypto.randomUUID(),
      templateId: template.id,
      title: uniqueTitle(template.name),
      values: emptyValues,
      updatedAt: new Date().toISOString(),
      updatedBy: data.currentUser?.displayName
    };

    saveInstances([instance, ...instances]);
    selectedInstanceId = instance.id;
    view = 'editor';
    setFrameworkUrl(template.id);
    draftPage = 0;

    // Persist to DB
    const pid = projectId;
    fetch('/api/framework-instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: Number(pid),
        templateId: template.id,
        title: instance.title,
        values: instance.values,
        updatedBy: data.currentUser?.displayName
      })
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const dbId = json.instance.id;
          if (
            getDeletedTemplateIds().has(template.id) ||
            !instances.some((i) => i.id === instance.id)
          ) {
            fetch(`/api/framework-instances?id=${dbId}`, { method: 'DELETE' }).catch(() => {
              /* best-effort */
            });
            return;
          }
          instances = instances.map((i) => (i.id === instance.id ? { ...i, id: dbId } : i));
          if (selectedInstanceId === instance.id) selectedInstanceId = dbId;
        }
      })
      .catch(() => {
        /* best-effort */
      });
  }

  function openDraft(id: string) {
    selectedInstanceId = id;
    view = 'editor';
    draftPage = 0;
    const instance = instances.find((item) => item.id === id);
    if (instance) setFrameworkUrl(instance.templateId);
  }

  function confirmDelete(id: string) {
    deleteTargetId = id;
  }

  function deleteInstance() {
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;
    const target = instances.find((i) => i.id === targetId);
    if (!target) {
      deleteTargetId = null;
      return;
    }

    const deleted = getDeletedTemplateIds();
    deleted.add(target.templateId);
    saveDeletedTemplateIds(deleted);

    const next = instances.filter((i) => i.templateId !== target.templateId);
    saveInstances(next);
    selectedInstanceId = next[0]?.id ?? null;
    view = 'templates';
    setFrameworkUrl(null);
    deleteTargetId = null;

    // Delete from DB if it's a DB-backed instance
    if (targetId.startsWith('db-')) {
      fetch(`/api/framework-instances?id=${targetId}`, { method: 'DELETE' }).catch(() => {
        /* best-effort */
      });
    }
  }

  function formatUpdatedAt(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  }

  function handleUpdate(values: Record<string, string>, title?: string) {
    if (!selectedInstance) return;
    const updated = {
      ...selectedInstance,
      values,
      title: title ?? selectedInstance.title,
      updatedAt: new Date().toISOString(),
      updatedBy: data.currentUser?.displayName
    };
    saveInstances(instances.map((i) => (i.id === selectedInstance.id ? updated : i)));

    // Persist to DB: all instances, not just db-prefixed ones
    const pid = projectId;
    const body: Record<string, unknown> = {
      projectId: Number(pid),
      templateId: updated.templateId,
      title: updated.title,
      values: updated.values,
      updatedBy: updated.updatedBy
    };
    const isDbBacked = updated.id.startsWith('db-');
    if (isDbBacked) body.id = updated.id;

    fetch('/api/framework-instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          // If this was a first-time save (seed → db), update local id
          if (!isDbBacked && json.instance?.id && json.instance.id !== updated.id) {
            instances = instances.map((i) =>
              i.id === updated.id ? { ...i, id: json.instance.id } : i
            );
            if (selectedInstanceId === updated.id) selectedInstanceId = json.instance.id;
          }
        }
      })
      .catch(() => {
        /* best-effort */
      });
  }

  let EditorComponent = $derived(
    selectedTemplate ? (CUSTOM_EDITORS[selectedTemplate.id] ?? null) : null
  );
</script>

<svelte:window onkeydown={handleKeydown} />
<svelte:head><title>Frameworks | Produck</title></svelte:head>

<div class="space-y-5">
  {#if !fullscreen}
    <header>
      <div>
        <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Frameworks</h1>
        <p class="mt-0.5 text-sm text-cork-500">
          Pick lightweight templates and fill them for the active workspace.
        </p>
      </div>
    </header>
  {/if}

  {#if fullscreen && selectedInstance && selectedTemplate && view === 'editor'}
    <div style="min-height: 100vh;">
      <div class="rounded-none border border-cork-300/50 bg-cork-50/50">
        <!-- Fullscreen editor header -->
        <div class="border-b border-cork-300/40 p-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-start">
            <div class="min-w-0 flex-1">
              <h2 class="px-2 py-1 font-display text-3xl leading-none text-cork-800">
                {selectedInstance.title}
              </h2>
            </div>
            <div class="flex items-center gap-2">
              {#if selectedTemplate.id === 'market-sizing'}
                <button
                  type="button"
                  class="h-9 min-w-14 cursor-pointer rounded-lg border border-cork-300 bg-cork-50/60 px-3 text-xs font-semibold text-cork-600 transition-colors hover:bg-cork-200/60 hover:text-cork-800"
                  title="Switch currency"
                  aria-label="Toggle market size currency"
                  onclick={toggleMarketSizingCurrency}
                >
                  {marketSizingCurrency}
                </button>
              {/if}
              {#if showEpicKanbanSync}
                <button
                  type="button"
                  class="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 {data.epicKanbanSyncEnabled
                    ? 'border-cork-600 bg-cork-700 text-cork-50 hover:bg-cork-800'
                    : 'border-cork-300 bg-cork-50/60 text-cork-500 hover:bg-cork-200/60 hover:text-cork-700'}"
                  disabled={syncUpdating}
                  title={data.epicKanbanSyncEnabled
                    ? 'Disable Epics and Kanban synchronization'
                    : 'Enable Epics and Kanban synchronization'}
                  onclick={requestEpicKanbanSync}
                >
                  <Link2 class="size-3.5" />
                  Sync {data.epicKanbanSyncEnabled ? 'on' : 'off'}
                </button>
              {/if}
              {#if selectedTemplate.id === 'kanban'}
                <button
                  type="button"
                  class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-300 bg-cork-50/60 text-cork-500 transition-colors hover:bg-cork-200/60 hover:text-cork-700"
                  title="Activity history"
                  aria-label="History"
                  onclick={() => (showKanbanHistory = true)}><Clock class="size-3.5" /></button
                >
              {/if}
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-300 bg-cork-50/60 text-cork-500 transition-colors hover:bg-cork-200/60 hover:text-cork-700"
                title="Instructions & terminology"
                aria-label="Help"
                onclick={() => (showHelp = true)}><Info class="size-3.5" /></button
              >
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-300 bg-cork-50/60 text-cork-500 transition-colors hover:bg-cork-200/60 hover:text-cork-700"
                title="Exit fullscreen (F)"
                aria-label="Exit fullscreen"
                onclick={toggleFullscreen}><Minimize class="size-3.5" /></button
              >
            </div>
          </div>
          <p class="mt-1 px-2 text-xs text-cork-400">{selectedTemplate.description}</p>
        </div>
        <div class="p-4">
          <EditorComponent
            instance={selectedInstance}
            draftMode="view"
            onUpdate={handleUpdate}
            {projectId}
            projectName={data.projectName}
            fintechPicks={data.fintechPicks}
            currency={marketSizingCurrency}
            bind:showHistory={showKanbanHistory}
          />
        </div>
      </div>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <section
        class="min-w-0 transition-opacity duration-200 {isFrameworkLoading
          ? 'pointer-events-none opacity-45'
          : ''}"
      >
        {#if view === 'templates'}
          <div class="mb-3">
            <div class="flex flex-wrap gap-1.5">
              {#each categories as category (category)}
                {@const CategoryIcon =
                  category === 'Discovery'
                    ? Search
                    : category === 'Strategy'
                      ? Compass
                      : category === 'Validation'
                        ? FlaskConical
                        : category === 'Delivery'
                          ? Rocket
                          : Target}
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors {selectedCategory ===
                  category
                    ? 'bg-cork-700 text-cork-50'
                    : 'bg-cork-200/60 text-cork-500 hover:bg-cork-300/60 hover:text-cork-700'}"
                  onclick={() => (selectedCategory = category)}
                >
                  {#if category !== 'all'}<CategoryIcon class="size-3.5" />{/if}
                  {category === 'all' ? 'All' : category}
                </button>
              {/each}
            </div>
          </div>

          <div
            class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-[repeat(4,minmax(0,14rem))]"
          >
            {#each filteredTemplates as template (template.id)}
              {@const Icon = template.icon}
              {@const CatIcon =
                template.category === 'Discovery'
                  ? Search
                  : template.category === 'Strategy'
                    ? Compass
                    : template.category === 'Validation'
                      ? FlaskConical
                      : template.category === 'Delivery'
                        ? Rocket
                        : Target}
              {@const added = existingTemplateIds.has(template.id)}
              <article
                class="w-[68vw] max-w-[20rem] shrink-0 snap-start overflow-hidden rounded-lg border border-cork-300/50 bg-cork-50/50 shadow-sm transition-all hover:shadow-md sm:w-[58vw] md:w-[46vw] lg:w-auto lg:max-w-none lg:shrink"
              >
                <!-- Header: title left, category icon right -->
                <div class="flex items-center justify-between gap-2 bg-[#f1ece2] px-3 py-2">
                  <h2
                    class="truncate font-display text-sm font-semibold {added
                      ? 'text-cork-700'
                      : 'text-cork-800'} pr-2"
                  >
                    {template.name}
                  </h2>
                  <CatIcon class="size-3.5 shrink-0 {added ? 'text-cork-500' : 'text-cork-400'}" />
                </div>
                <!-- Cover: icon → + on hover -->
                <button
                  type="button"
                  class="group relative mx-3 flex aspect-[9/5] w-[calc(100%-1.5rem)] cursor-pointer items-center justify-center overflow-hidden bg-cork-200/50 {added
                    ? 'bg-cork-200/70'
                    : ''}"
                  onclick={() =>
                    added
                      ? openDraft(instances.find((i) => i.templateId === template.id)!.id)
                      : createInstance(template)}
                >
                  {#if template.coverImage}
                    <img
                      src={template.coverImage}
                      alt=""
                      class="absolute inset-0 h-full w-full scale-[1.22] object-contain transition-opacity transition-transform {added
                        ? 'opacity-35 grayscale-[35%]'
                        : 'group-hover:opacity-25'}"
                    />
                  {:else}
                    <Icon
                      class="size-12 transition-opacity {added
                        ? 'text-cork-400/60'
                        : 'text-cork-700/70 group-hover:opacity-0'}"
                    />
                  {/if}
                  {#if added}
                    <div class="absolute inset-0 flex items-center justify-center bg-cork-100/25">
                      <span
                        class="flex size-10 items-center justify-center rounded-full border border-cork-400/30 bg-cork-50/80 text-cork-500 shadow-sm"
                        aria-hidden="true"
                      >
                        <CheckCircle2 class="size-5" />
                      </span>
                    </div>
                  {:else}
                    <Plus
                      class="absolute size-10 text-cork-700 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  {/if}
                </button>
                <!-- Description -->
                <div class="bg-[#f1ece2] px-3 pt-2 pb-3">
                  <p
                    class="line-clamp-2 text-[11px] leading-snug {added
                      ? 'text-cork-500'
                      : 'text-cork-500'}"
                  >
                    {template.description}
                  </p>
                </div>
              </article>
            {/each}
          </div>
        {:else if selectedInstance && selectedTemplate}
          <div class="rounded-xl border border-cork-300/50 bg-cork-50/50">
            <!-- Editor header -->
            <div class="border-b border-cork-300/40 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-start">
                <div class="min-w-0 flex-1">
                  <h2 class="px-2 py-1 font-display text-3xl leading-none text-cork-800">
                    {selectedInstance.title}
                  </h2>
                </div>
                <div class="flex items-center gap-2">
                  {#if selectedTemplate.id === 'market-sizing'}
                    <button
                      type="button"
                      class="h-9 min-w-14 cursor-pointer rounded-lg border border-cork-300 bg-cork-50/60 px-3 text-xs font-semibold text-cork-600 transition-colors hover:bg-cork-200/60 hover:text-cork-800"
                      title="Switch currency"
                      aria-label="Toggle market size currency"
                      onclick={toggleMarketSizingCurrency}
                    >
                      {marketSizingCurrency}
                    </button>
                  {/if}
                  {#if showEpicKanbanSync}
                    <button
                      type="button"
                      class="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 {data.epicKanbanSyncEnabled
                        ? 'border-cork-600 bg-cork-700 text-cork-50 hover:bg-cork-800'
                        : 'border-cork-300 bg-cork-50/60 text-cork-500 hover:bg-cork-200/60 hover:text-cork-700'}"
                      disabled={syncUpdating}
                      title={data.epicKanbanSyncEnabled
                        ? 'Disable Epics and Kanban synchronization'
                        : 'Enable Epics and Kanban synchronization'}
                      onclick={requestEpicKanbanSync}
                    >
                      <Link2 class="size-3.5" />
                      Sync {data.epicKanbanSyncEnabled ? 'on' : 'off'}
                    </button>
                  {/if}
                  {#if selectedTemplate.id === 'kanban'}
                    <button
                      type="button"
                      class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-300 bg-cork-50/60 text-cork-500 transition-colors hover:bg-cork-200/60 hover:text-cork-700"
                      title="Activity history"
                      aria-label="History"
                      onclick={() => (showKanbanHistory = true)}><Clock class="size-3.5" /></button
                    >
                  {/if}
                  <button
                    type="button"
                    class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-300 bg-cork-50/60 text-cork-500 transition-colors hover:bg-cork-200/60 hover:text-cork-700"
                    title="Instructions & terminology"
                    aria-label="Help"
                    onclick={() => (showHelp = true)}><Info class="size-3.5" /></button
                  >
                  <button
                    type="button"
                    class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-cork-300 bg-cork-50/60 text-cork-500 transition-colors hover:bg-cork-200/60 hover:text-cork-700"
                    title={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
                    aria-label="Toggle fullscreen"
                    onclick={toggleFullscreen}
                  >
                    {#if fullscreen}<Minimize class="size-3.5" />{:else}<Maximize
                        class="size-3.5"
                      />{/if}
                  </button>
                </div>
              </div>
              <p class="mt-1 px-2 text-xs text-cork-400">{selectedTemplate.description}</p>
            </div>

            <!-- Editor body -->
            {#if EditorComponent}
              <div class="p-4">
                <EditorComponent
                  instance={selectedInstance}
                  draftMode="view"
                  onUpdate={handleUpdate}
                  {projectId}
                  projectName={data.projectName}
                  fintechPicks={data.fintechPicks}
                  currency={marketSizingCurrency}
                  bind:showHistory={showKanbanHistory}
                />
              </div>
            {:else}
              <div class="grid gap-4 p-4 md:grid-cols-2">
                {#each selectedTemplate.fields as field (field.id)}
                  {@const filled = selectedInstance.values[field.id]?.trim()}
                  <label class="block">
                    <div class="mb-1.5 flex items-center gap-1.5">
                      {#if filled}<CheckCircle2 class="size-3.5 text-green-600" />{:else}<Circle
                          class="size-3.5 text-cork-300"
                        />{/if}
                      <span class="text-sm font-medium text-cork-800">{field.label}</span>
                    </div>
                    <p class="mb-2 text-xs leading-snug text-cork-400">{field.prompt}</p>
                    <div class="min-h-24 rounded-lg bg-white/50 px-3 py-2 text-sm text-cork-700">
                      {#if selectedInstance.values[field.id]?.trim()}
                        <p class="whitespace-pre-wrap">{selectedInstance.values[field.id]}</p>
                      {:else}
                        <p class="text-cork-400 italic">Empty</p>
                      {/if}
                    </div>
                  </label>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div
            class="flex min-h-80 flex-col items-center justify-center rounded-xl border border-cork-300/50 bg-cork-50/50 px-4 text-center"
          >
            <Layers3 class="size-9 text-cork-300" />
            <p class="mt-2 text-sm font-medium text-cork-600">No draft selected</p>
          </div>
        {/if}
      </section>

      <!-- Draft sidebar -->
      <aside
        class="h-fit rounded-xl border border-cork-300/50 bg-cork-50/60 p-2.5 shadow-sm lg:sticky lg:top-20"
        aria-busy={isFrameworkLoading}
      >
        {#if isFrameworkLoading}
          <div class="flex min-h-44 flex-col justify-center px-2 py-5" aria-live="polite">
            <div class="flex items-center gap-2 text-cork-600">
              <LoaderCircle class="size-4 animate-spin" />
              <span class="text-sm font-medium">Loading frameworks</span>
            </div>
            <p class="mt-1 pl-6 text-[10px] text-cork-400">Fetching the selected project…</p>
            <div class="mt-5 space-y-2.5">
              <div class="h-8 animate-pulse rounded-lg bg-cork-200/70"></div>
              <div class="h-8 animate-pulse rounded-lg bg-cork-200/55"></div>
              <div class="h-8 animate-pulse rounded-lg bg-cork-200/40"></div>
            </div>
          </div>
        {:else}
          <div>
            <div class="space-y-1">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors {view ===
                'templates'
                  ? 'bg-cork-700 text-cork-50 shadow-sm'
                  : 'text-cork-700 hover:bg-cork-200/60 hover:text-cork-900'}"
                onclick={openTemplateLibrary}
              >
                <Layers3 class="size-4 shrink-0" />
                <span class="truncate">Template library</span>
              </button>
            </div>
          </div>

          <div class="mt-3 border-t border-cork-300/40 pt-3">
            <div class="flex items-center justify-between px-2 pb-1.5">
              <p class="text-[10px] font-semibold tracking-wider text-cork-400 uppercase">
                Drafts ({instances.length})
              </p>
              <button
                type="button"
                class="cursor-pointer rounded p-0.5 text-cork-400 transition-colors hover:bg-cork-200/50 hover:text-cork-600"
                onclick={() => (draftSort = draftSort === 'modified' ? 'name' : 'modified')}
                title={draftSort === 'modified'
                  ? 'Sorted: latest modified'
                  : 'Sorted: alphabetical'}
              >
                <ArrowDownUp class="size-3" />
              </button>
            </div>
            {#if instances.length === 0}
              <p class="rounded-lg px-2 py-3 text-center text-xs text-cork-400">No drafts yet</p>
            {:else}
              <div class="space-y-1 pr-1">
                {#each paginatedInstances as instance (instance.id)}
                  <div
                    class="group rounded-lg px-2 py-1.5 transition-colors {selectedInstance?.id ===
                      instance.id && view === 'editor'
                      ? 'bg-cork-200/90 text-cork-900 shadow-sm'
                      : 'text-cork-600 hover:bg-cork-200/50 hover:text-cork-800'}"
                  >
                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        class="min-w-0 flex-1 cursor-pointer text-left"
                        onclick={() => openDraft(instance.id)}
                      >
                        <span class="block truncate text-xs leading-tight font-medium text-current"
                          >{instance.title}</span
                        >
                        <span class="mt-0.5 block text-[9px] text-cork-400">
                          {formatUpdatedAt(instance.updatedAt)}
                          {#if instance.updatedBy}
                            <span class="opacity-50">·</span> {instance.updatedBy}
                          {/if}
                        </span>
                      </button>
                      <button
                        type="button"
                        class="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-cork-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                        title="Delete draft"
                        onclick={() => confirmDelete(instance.id)}
                      >
                        <Trash2 class="size-3.5" />
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
              {#if totalDraftPages > 1}
                <div
                  class="mt-2 flex items-center justify-between gap-1 border-t border-cork-300/40 pt-2"
                >
                  <button
                    type="button"
                    class="cursor-pointer rounded p-0.5 text-cork-500 transition-colors hover:bg-cork-200/50 hover:text-cork-700 disabled:cursor-default disabled:opacity-30"
                    disabled={draftPage === 0}
                    onclick={() => (draftPage = Math.max(0, draftPage - 1))}
                  >
                    <ChevronLeft class="size-3.5" />
                  </button>
                  <span class="text-[9px] text-cork-400">{draftPage + 1} / {totalDraftPages}</span>
                  <button
                    type="button"
                    class="cursor-pointer rounded p-0.5 text-cork-500 transition-colors hover:bg-cork-200/50 hover:text-cork-700 disabled:cursor-default disabled:opacity-30"
                    disabled={draftPage >= totalDraftPages - 1}
                    onclick={() => (draftPage = Math.min(totalDraftPages - 1, draftPage + 1))}
                  >
                    <ChevronRight class="size-3.5" />
                  </button>
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      </aside>
    </div>
  {/if}
</div>

<!-- Epic ↔ Kanban synchronization confirmation -->
<Dialog.Root
  open={syncConfirmationOpen}
  onOpenChange={(open) => {
    if (!open && !syncUpdating) syncConfirmationOpen = false;
  }}
>
  <Dialog.Content class="border-cork-300 bg-cork-50 text-cork-800 sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title class="text-cork-800">
        {data.epicKanbanSyncEnabled ? 'Turn off synchronization?' : 'Enable synchronization?'}
      </Dialog.Title>
      <Dialog.Description class="text-cork-500">
        {#if data.epicKanbanSyncEnabled}
          Epics and Kanban will stop updating each other.
        {:else}
          Epics will be used for the first synchronization.
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if data.epicKanbanSyncEnabled}
      <div class="space-y-2 rounded-lg bg-cork-100/70 px-3 py-2.5 text-xs text-cork-600">
        <p>Existing data stays unchanged, but later edits can diverge.</p>
        <p>Re-enabling may rewrite shared Kanban fields from Epics again.</p>
      </div>
    {:else}
      <div class="space-y-2 rounded-lg bg-cork-100/70 px-3 py-2.5 text-xs text-cork-600">
        <p>
          <strong class="text-cork-700">May be rewritten:</strong> Kanban title, assignee, and Done position.
        </p>
        <p>
          <strong class="text-cork-700">Stays separate:</strong> acceptance criteria, priority, type,
          estimates, and blocking details.
        </p>
        <p>After enabling, shared changes update both frameworks.</p>
      </div>
    {/if}

    {#if syncError}
      <p class="text-xs text-red-600" role="alert">{syncError}</p>
    {/if}

    <Dialog.Footer class="flex-row justify-end gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-cork-300 px-3 py-1.5 text-sm text-cork-600 transition-colors hover:bg-cork-200/50 disabled:cursor-wait disabled:opacity-60"
        disabled={syncUpdating}
        onclick={() => (syncConfirmationOpen = false)}
      >
        Cancel
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:cursor-wait disabled:opacity-60 {data.epicKanbanSyncEnabled
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-cork-700 hover:bg-cork-800'}"
        disabled={syncUpdating}
        onclick={toggleEpicKanbanSync}
      >
        {syncUpdating ? 'Updating…' : data.epicKanbanSyncEnabled ? 'Turn off' : 'Enable sync'}
      </button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete confirmation dialog -->
<Dialog.Root
  open={deleteTargetId !== null}
  onOpenChange={(open) => {
    if (!open) deleteTargetId = null;
  }}
>
  <Dialog.Content class="border-cork-300 bg-cork-50 text-cork-800 sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title class="text-cork-800">Delete draft?</Dialog.Title>
      <Dialog.Description class="text-cork-500">
        This will permanently delete <strong class="text-cork-700">{deleteTargetTitle}</strong>.
        This action cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer class="flex-row justify-end gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-lg border border-cork-300 px-3 py-1.5 text-sm text-cork-600 transition-colors hover:bg-cork-200/50"
        onclick={() => (deleteTargetId = null)}
      >
        Cancel
      </button>
      <button
        type="button"
        class="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        onclick={deleteInstance}
      >
        Delete
      </button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Help modal with instructions & terminology -->
<Dialog.Root
  open={showHelp}
  onOpenChange={(open) => {
    if (!open) showHelp = false;
  }}
>
  <Dialog.Content
    class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden border-cork-300 bg-cork-50 text-cork-800 sm:max-w-lg"
  >
    <Dialog.Header class="shrink-0">
      <Dialog.Title class="text-cork-800">
        {selectedTemplate?.name ?? 'Draft'} Guide
      </Dialog.Title>
    </Dialog.Header>
    <div
      class="help-modal-scroll min-h-0 space-y-4 overflow-y-auto overscroll-contain pr-2 text-sm"
    >
      {#if selectedTemplate?.instructions}
        <div>
          <h4 class="mb-1.5 text-xs font-semibold tracking-wide text-cork-500 uppercase">
            How to Use
          </h4>
          <p class="leading-relaxed text-cork-700">{selectedTemplate.instructions}</p>
        </div>
      {/if}
      {#if selectedTemplate?.terminology}
        <div>
          <h4 class="mb-1.5 text-xs font-semibold tracking-wide text-cork-500 uppercase">
            Terminology
          </h4>
          <ul class="ml-4 list-disc space-y-1">
            {#each selectedTemplate.terminology as item (item.term)}
              <li class="text-cork-600">
                <span class="font-medium text-cork-700">{item.term}:</span>
                <span class="ml-1">{item.definition}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  .help-modal-scroll {
    scrollbar-color: rgba(92, 75, 58, 0.42) transparent;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
  }

  .help-modal-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .help-modal-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .help-modal-scroll::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background: rgba(92, 75, 58, 0.36);
    background-clip: content-box;
  }

  .help-modal-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(92, 75, 58, 0.58);
    background-clip: content-box;
  }
</style>
