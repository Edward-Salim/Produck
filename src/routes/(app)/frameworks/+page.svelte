<script lang="ts">
  import { navigating, page } from '$app/state';
  import { afterNavigate, invalidateAll, replaceState } from '$app/navigation';
  import { onMount } from 'svelte';
  import { DropdownMenu } from 'bits-ui';
  import checkdaqLogo from '$lib/assets/projects/logo-checkdaq-transparent.webp';
  import { getFullscreen, toggleFullscreen } from '$lib/stores/fullscreen.svelte.js';
  import { FRAMEWORK_TEMPLATES, type FrameworkTemplate } from '$lib/frameworks/templates.js';
  import type { RoadmapView } from '$lib/frameworks/roadmap.js';
  import type { StoryMapData } from '$lib/types/story-map.js';
  import {
    dedupeFrameworkInstances,
    findFrameworkInstance,
    frameworkSelectionKey,
    isReadOnlyFramework,
    isRepeatableFramework,
    PROJECT_BRIEF_TEMPLATE_ID,
    ROADMAP_TEMPLATE_ID
  } from '$lib/frameworks/instances.js';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import ChartGantt from '@lucide/svelte/icons/chart-gantt';
  import CheckCheck from '@lucide/svelte/icons/check-check';
  import CheckCircle2 from '@lucide/svelte/icons/circle-check';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Circle from '@lucide/svelte/icons/circle';
  import Clock from '@lucide/svelte/icons/clock';
  import Compass from '@lucide/svelte/icons/compass';
  import FlaskConical from '@lucide/svelte/icons/flask-conical';
  import Frown from '@lucide/svelte/icons/frown';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Hash from '@lucide/svelte/icons/hash';
  import Layers3 from '@lucide/svelte/icons/layers';
  import Link2 from '@lucide/svelte/icons/link-2';
  import Maximize from '@lucide/svelte/icons/maximize';
  import Minimize from '@lucide/svelte/icons/minimize';
  import Plus from '@lucide/svelte/icons/plus';
  import Rocket from '@lucide/svelte/icons/rocket';
  import Search from '@lucide/svelte/icons/search';
  import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';

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
  import StakeholderMap from '$lib/components/frameworks/StakeholderMap.svelte';
  import CustomArtifact from '$lib/components/frameworks/CustomArtifact.svelte';
  import RoadmapArtifact from '$lib/components/frameworks/RoadmapArtifact.svelte';
  import type { FrameworkInstance } from '$lib/components/frameworks/types.js';
  import type { Component } from 'svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';

  type FrameworkView = 'templates' | 'editor';
  type MarketSizingCurrency = 'USD' | 'IDR';
  const PROJECT_IMAGES: Partial<
    Record<number, { src: string; alt: string; width: number; height: number }[]>
  > = {
    24: [{ src: checkdaqLogo, alt: 'CheckGPT', width: 438, height: 150 }]
  };

  let { data } = $props<{
    data: {
      frameworkInstances: FrameworkPageInstance[];
      workspaceId: number;
      projectId: number;
      projectName: string;
      epicKanbanSyncEnabled: boolean;
      fintechPicks: { companyId: string }[];
      showStoryMapIds: boolean;
      showStoryMapKanoLines: boolean;
      showStoryMapPainPoints: boolean;
      currentUser?: { displayName?: string };
    };
  }>();

  let projectId = $derived(String(data.projectId));
  let linkedStoryId = $derived(page.url.searchParams.get('story'));

  let instances = $derived(
    dedupeFrameworkInstances(data.frameworkInstances as FrameworkInstance[])
  );

  function requestedInstanceId() {
    const requestedFramework = page.url.searchParams.get('framework');
    return findFrameworkInstance(data.frameworkInstances, requestedFramework)?.id ?? null;
  }

  let contextSwitching = $state(false);
  let roadmapView = $state<RoadmapView>('horizons');
  let selectedInstanceId = $state<string | null>(requestedInstanceId());
  let view = $state<FrameworkView>(requestedInstanceId() ? 'editor' : 'templates');
  let draftPage = $state(0);
  let contentPane: HTMLElement | undefined = $state();
  let loadedProjectId: number | undefined;

  afterNavigate(({ from, to }) => {
    const nextProjectId = data.projectId;
    const frameworkChanged =
      from?.url.searchParams.get('framework') !== to?.url.searchParams.get('framework');
    if (loadedProjectId === nextProjectId && !frameworkChanged) return;
    loadedProjectId = nextProjectId;
    const selection = requestedInstanceId();
    selectedInstanceId = selection;
    view = selection ? 'editor' : 'templates';
    draftPage = 0;
    if (!to?.url.hash) resetContentScroll();
  });

  const DRAFTS_PER_PAGE = 10;
  const panelClass = 'rounded-lg border border-cork-300/50 bg-cork-50/60 shadow-sm';
  const activeItemClass =
    'bg-[#cbd8bd] text-[#2f4731] hover:bg-[#bfd0b0] focus-visible:bg-[#b2c6a4]';
  const idleSidebarItemClass = 'text-cork-700 hover:bg-cork-200/80 focus-visible:bg-cork-200';
  const artifactControlClass =
    'flex h-9 w-full min-w-0 cursor-pointer items-center justify-center rounded-md outline-none transition-colors disabled:cursor-wait disabled:opacity-60';
  const neutralArtifactControlClass = `${artifactControlClass} bg-cork-200/80 text-cork-700 hover:bg-cork-300/80 focus-visible:bg-cork-300`;
  const activeArtifactControlClass = `${artifactControlClass} ${activeItemClass}`;
  let fullscreen = $derived(getFullscreen());
  let showHelp = $state(false);
  let showKanbanHistory = $state(false);
  let showStoryMapIds = $derived(data.showStoryMapIds);
  let showStoryMapKanoLines = $derived(data.showStoryMapKanoLines);
  let showStoryMapPainPoints = $derived(data.showStoryMapPainPoints);
  let marketSizingCurrency = $state<MarketSizingCurrency>('USD');
  let syncUpdating = $state(false);
  let syncConfirmationOpen = $state(false);
  let syncError = $state('');
  let isFrameworkLoading = $derived(
    contextSwitching ||
      (navigating.to?.url.pathname === '/frameworks' &&
        navigating.to.url.searchParams.get('project') !== page.url.searchParams.get('project'))
  );
  let projectImages = $derived(isFrameworkLoading ? [] : (PROJECT_IMAGES[data.projectId] ?? []));
  let projectLogo = $derived(projectImages[0]);

  const templates = FRAMEWORK_TEMPLATES;
  const templateSections = [
    { category: 'Discovery', Icon: Search },
    { category: 'Strategy', Icon: Compass },
    { category: 'Validation', Icon: FlaskConical },
    { category: 'Delivery', Icon: Rocket }
  ] satisfies { category: FrameworkTemplate['category']; Icon: typeof Search }[];

  onMount(() => {
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

  let sortedTemplates = $derived(
    // Sort: unpicked first (original order), picked last (most recently updated first)
    templates
      .filter((template) => !isReadOnlyFramework(template.id) || isTemplateAdded(template.id))
      .sort((a, b) => {
        const aPicked = isTemplateAdded(a.id);
        const bPicked = isTemplateAdded(b.id);
        if (aPicked !== bPicked) return aPicked ? 1 : -1;
        if (aPicked) {
          // Both picked: most recently updated first
          const aUpdated = instances.find((i) => i.templateId === a.id)?.updatedAt ?? '';
          const bUpdated = instances.find((i) => i.templateId === b.id)?.updatedAt ?? '';
          return bUpdated.localeCompare(aUpdated);
        }
        // Both unpicked: keep original template order
        return 0;
      })
  );

  let selectedInstance = $derived(
    instances.find((i) => i.id === selectedInstanceId) ?? instances[0] ?? null
  );

  let sortedInstances = $derived(
    [...instances].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  );
  let totalDraftPages = $derived(Math.max(1, Math.ceil(sortedInstances.length / DRAFTS_PER_PAGE)));
  let paginatedInstances = $derived(
    sortedInstances.slice(draftPage * DRAFTS_PER_PAGE, (draftPage + 1) * DRAFTS_PER_PAGE)
  );

  let selectedTemplate = $derived(
    selectedInstance ? (templates.find((t) => t.id === selectedInstance.templateId) ?? null) : null
  );
  let storyMapTerminology = $derived.by(() => {
    if (selectedTemplate?.id !== 'story-map' || !selectedInstance?.values.storyMap) return [];
    try {
      const storyMap = JSON.parse(selectedInstance.values.storyMap) as StoryMapData;
      return Array.isArray(storyMap.terminology) ? storyMap.terminology : [];
    } catch {
      return [];
    }
  });
  let guideTerminology = $derived(
    selectedTemplate?.id === 'story-map'
      ? storyMapTerminology
      : (selectedTemplate?.terminology ?? [])
  );
  let isStandaloneArtifact = $derived(
    selectedTemplate?.id === PROJECT_BRIEF_TEMPLATE_ID ||
      selectedTemplate?.id === ROADMAP_TEMPLATE_ID
  );

  let existingTemplateIds = $derived(new Set(instances.map((i) => i.templateId)));

  function isTemplateAdded(templateId: string) {
    return (
      existingTemplateIds.has(templateId) &&
      (isReadOnlyFramework(templateId) || !isRepeatableFramework(templateId))
    );
  }

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

  function setStoryMapIds(visible: boolean) {
    showStoryMapIds = visible;
    document.cookie = `story_map_show_ids=${showStoryMapIds}; path=/frameworks; max-age=31536000; samesite=lax`;
  }

  function setStoryMapKanoLines(visible: boolean) {
    showStoryMapKanoLines = visible;
    document.cookie = `story_map_show_kano_lines=${showStoryMapKanoLines}; path=/frameworks; max-age=31536000; samesite=lax`;
  }

  function setStoryMapPainPoints(visible: boolean) {
    showStoryMapPainPoints = visible;
    document.cookie = `story_map_show_pain_points=${showStoryMapPainPoints}; path=/frameworks; max-age=31536000; samesite=lax`;
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
      showIds?: boolean;
      showKanoLines?: boolean;
      showPainPoints?: boolean;
      linkedStoryId?: string | null;
      fintechPicks?: { companyId: string }[];
      currency?: MarketSizingCurrency;
    }>
  > = {
    'stakeholder-map': StakeholderMap,
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

  function setFrameworkUrl(selection: string | null) {
    const url = new URL(page.url);
    url.searchParams.delete('story');
    if (selection) url.searchParams.set('framework', selection);
    else url.searchParams.delete('framework');
    replaceState(url, page.state);
  }

  function resetContentScroll() {
    if (contentPane) contentPane.scrollTop = 0;
  }

  function openTemplateLibrary() {
    view = 'templates';
    setFrameworkUrl(null);
    resetContentScroll();
  }

  function uniqueTitle(name: string): string {
    const existingNames = new Set(instances.map((i) => i.title));
    if (!existingNames.has(name)) return name;
    let n = 2;
    while (existingNames.has(`${name} #${n}`)) n++;
    return `${name} #${n}`;
  }

  function createInstance(template: FrameworkTemplate) {
    if (isReadOnlyFramework(template.id)) return;
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
        product: data.projectName,
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
      title: uniqueTitle(template.id === 'story-map' ? 'Story Map' : template.name),
      values: emptyValues,
      updatedAt: new Date().toISOString(),
      updatedBy: data.currentUser?.displayName
    };

    saveInstances([instance, ...instances]);
    selectedInstanceId = instance.id;
    view = 'editor';
    setFrameworkUrl(frameworkSelectionKey(instance));
    draftPage = 0;
    resetContentScroll();

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
          if (page.url.pathname !== '/frameworks' || projectId !== pid) return;
          const dbId = json.instance.id;
          if (!instances.some((i) => i.id === instance.id)) {
            fetch(`/api/framework-instances?id=${dbId}`, { method: 'DELETE' }).catch(() => {
              /* best-effort */
            });
            return;
          }
          instances = instances.map((i) => (i.id === instance.id ? { ...i, id: dbId } : i));
          if (selectedInstanceId === instance.id) {
            selectedInstanceId = dbId;
            if (view === 'editor')
              setFrameworkUrl(frameworkSelectionKey({ ...instance, id: dbId }));
          }
        }
      })
      .catch(() => {
        /* best-effort */
      });
  }

  function openDraft(id: string) {
    if (view !== 'editor' || selectedInstanceId !== id) resetContentScroll();
    selectedInstanceId = id;
    view = 'editor';
    draftPage = 0;
    const instance = instances.find((item) => item.id === id);
    if (instance) setFrameworkUrl(frameworkSelectionKey(instance));
  }

  function formatUpdatedAt(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function handleUpdate(values: Record<string, string>, title?: string) {
    if (!selectedInstance || isReadOnlyFramework(selectedInstance.templateId)) return;
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
          if (page.url.pathname !== '/frameworks' || projectId !== pid) return;
          // If this was a first-time save (seed → db), update local id
          if (!isDbBacked && json.instance?.id && json.instance.id !== updated.id) {
            instances = instances.map((i) =>
              i.id === updated.id ? { ...i, id: json.instance.id } : i
            );
            if (selectedInstanceId === updated.id) {
              selectedInstanceId = json.instance.id;
              if (view === 'editor') {
                setFrameworkUrl(frameworkSelectionKey({ ...updated, id: json.instance.id }));
              }
            }
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
<svelte:head>
  <title
    >{view === 'editor' && selectedInstance ? selectedInstance.title : 'Frameworks'} | Produck</title
  >
</svelte:head>

{#snippet artifactSkeleton()}
  <div role="status" class="min-h-80 space-y-4">
    <span class="sr-only">Loading artifact</span>
    <div aria-hidden="true" class="space-y-4">
      <Skeleton class="h-4 w-28 bg-cork-200/70 motion-reduce:animate-none" />
      <Skeleton class="h-64 w-full bg-cork-200/55 motion-reduce:animate-none" />
    </div>
  </div>
{/snippet}

{#snippet standaloneArtifact(instance: FrameworkInstance)}
  {#if instance.templateId === ROADMAP_TEMPLATE_ID}
    {#key roadmapView}
      <RoadmapArtifact {instance} view={roadmapView} />
    {/key}
  {:else}
    <CustomArtifact {instance} {projectId} />
  {/if}
{/snippet}

{#snippet artifactControls(standalone = false)}
  {#if selectedTemplate}
    <div
      role="group"
      aria-label="Artifact controls"
      class={['grid w-full auto-cols-fr grid-flow-col gap-2', standalone && `${panelClass} p-4`]}
    >
      {#if selectedTemplate.id === 'story-map'}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            class={showStoryMapIds && showStoryMapKanoLines && showStoryMapPainPoints
              ? activeArtifactControlClass
              : neutralArtifactControlClass}
            aria-label="Story map options"
            title="Story map options"
          >
            <SlidersHorizontal class="size-3.5" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="bottom"
              align="end"
              sideOffset={6}
              class="z-50 min-w-56 rounded-lg border border-cork-300 bg-cork-50 p-1.5 shadow-md"
            >
              <DropdownMenu.CheckboxItem
                checked={showStoryMapIds}
                onCheckedChange={setStoryMapIds}
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-cork-700 outline-none hover:bg-cork-200/50 data-highlighted:bg-cork-200/50"
              >
                <Hash class="size-3.5 shrink-0 text-cork-500" aria-hidden="true" />
                <span>Story IDs</span>
                <span
                  class="ml-auto flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors {showStoryMapIds
                    ? 'bg-cork-700'
                    : 'bg-cork-300'}"
                  aria-hidden="true"
                >
                  <span
                    class="size-3 rounded-full bg-white shadow-sm transition-transform {showStoryMapIds
                      ? 'translate-x-3'
                      : 'translate-x-0'}"
                  ></span>
                </span>
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                checked={showStoryMapKanoLines}
                onCheckedChange={setStoryMapKanoLines}
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-cork-700 outline-none hover:bg-cork-200/50 data-highlighted:bg-cork-200/50"
              >
                <Layers3 class="size-3.5 shrink-0 text-cork-500" aria-hidden="true" />
                <span>Kano lines</span>
                <span
                  class="ml-auto flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors {showStoryMapKanoLines
                    ? 'bg-cork-700'
                    : 'bg-cork-300'}"
                  aria-hidden="true"
                >
                  <span
                    class="size-3 rounded-full bg-white shadow-sm transition-transform {showStoryMapKanoLines
                      ? 'translate-x-3'
                      : 'translate-x-0'}"
                  ></span>
                </span>
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                checked={showStoryMapPainPoints}
                onCheckedChange={setStoryMapPainPoints}
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-cork-700 outline-none hover:bg-cork-200/50 data-highlighted:bg-cork-200/50"
              >
                <Frown class="size-3.5 shrink-0 text-cork-500" aria-hidden="true" />
                <span>Pain points</span>
                <span
                  class="ml-auto flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors {showStoryMapPainPoints
                    ? 'bg-cork-700'
                    : 'bg-cork-300'}"
                  aria-hidden="true"
                >
                  <span
                    class="size-3 rounded-full bg-white shadow-sm transition-transform {showStoryMapPainPoints
                      ? 'translate-x-3'
                      : 'translate-x-0'}"
                  ></span>
                </span>
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      {/if}
      {#if selectedTemplate.id === ROADMAP_TEMPLATE_ID}
        <button
          type="button"
          class={roadmapView === 'quarters'
            ? activeArtifactControlClass
            : neutralArtifactControlClass}
          aria-label="Quarterly roadmap view"
          aria-pressed={roadmapView === 'quarters'}
          title={roadmapView === 'quarters'
            ? 'Switch to Now / Next / Later'
            : 'Switch to quarterly view'}
          onclick={() => (roadmapView = roadmapView === 'quarters' ? 'horizons' : 'quarters')}
        >
          <CalendarDays class="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          class={roadmapView === 'timeline'
            ? activeArtifactControlClass
            : neutralArtifactControlClass}
          aria-label="Timeline roadmap view"
          aria-pressed={roadmapView === 'timeline'}
          title={roadmapView === 'timeline'
            ? 'Switch to Now / Next / Later'
            : 'Switch to timeline view'}
          onclick={() => (roadmapView = roadmapView === 'timeline' ? 'horizons' : 'timeline')}
        >
          <ChartGantt class="size-3.5" aria-hidden="true" />
        </button>
      {/if}
      {#if selectedTemplate.id === 'market-sizing'}
        <button
          type="button"
          class="{neutralArtifactControlClass} text-xs font-semibold"
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
          class={data.epicKanbanSyncEnabled
            ? activeArtifactControlClass
            : neutralArtifactControlClass}
          disabled={syncUpdating}
          title={data.epicKanbanSyncEnabled
            ? 'Disable Epics and Kanban synchronization'
            : 'Enable Epics and Kanban synchronization'}
          aria-label="Epics and Kanban synchronization"
          aria-pressed={data.epicKanbanSyncEnabled}
          onclick={requestEpicKanbanSync}
        >
          <Link2 class="size-3.5" />
        </button>
      {/if}
      {#if selectedTemplate.id === 'kanban'}
        <button
          type="button"
          class={showKanbanHistory ? activeArtifactControlClass : neutralArtifactControlClass}
          title="Activity history"
          aria-label="History"
          onclick={() => (showKanbanHistory = true)}><Clock class="size-3.5" /></button
        >
      {/if}
      <button
        type="button"
        class={showHelp ? activeArtifactControlClass : neutralArtifactControlClass}
        title="Instructions & terminology"
        aria-label="Open instructions and terminology"
        onclick={() => (showHelp = true)}><BookOpen class="size-3.5" aria-hidden="true" /></button
      >
      <button
        type="button"
        class={fullscreen ? activeArtifactControlClass : neutralArtifactControlClass}
        title={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        onclick={toggleFullscreen}
      >
        {#if fullscreen}<Minimize class="size-3.5" />{:else}<Maximize class="size-3.5" />{/if}
      </button>
    </div>
  {/if}
{/snippet}

{#if view === 'editor' && selectedInstance && !isStandaloneArtifact}
  <h1 class="sr-only">{selectedInstance.title}</h1>
{/if}

<div class="artifact-page lg:h-full">
  {#if fullscreen && selectedInstance && selectedTemplate && view === 'editor'}
    <div style="min-height: 100vh;">
      <div
        class="mb-3 {projectLogo
          ? 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_18rem_minmax(0,1fr)]'
          : 'mx-auto w-72 max-w-full px-4'}"
      >
        {#if projectLogo}
          <img
            src={projectLogo.src}
            alt={projectLogo.alt}
            width={projectLogo.width}
            height={projectLogo.height}
            class="h-auto max-h-16 w-44 max-w-full justify-self-start object-contain object-left"
          />
        {/if}
        {@render artifactControls(true)}
      </div>
      {#if isStandaloneArtifact && !isFrameworkLoading}
        {@render standaloneArtifact(selectedInstance)}
      {:else}
        <div class={panelClass}>
          <div class="p-4" aria-busy={isFrameworkLoading}>
            {#if isFrameworkLoading}
              {@render artifactSkeleton()}
            {:else}
              <EditorComponent
                instance={selectedInstance}
                draftMode="view"
                onUpdate={handleUpdate}
                {projectId}
                projectName={data.projectName}
                fintechPicks={data.fintechPicks}
                currency={marketSizingCurrency}
                bind:showHistory={showKanbanHistory}
                showIds={showStoryMapIds}
                showKanoLines={showStoryMapKanoLines}
                showPainPoints={showStoryMapPainPoints}
                {linkedStoryId}
              />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="grid gap-4 lg:h-full lg:grid-cols-[minmax(0,1fr)_16rem] lg:grid-rows-[minmax(0,1fr)] lg:gap-0"
    >
      <section
        bind:this={contentPane}
        class="framework-content framework-scroll min-w-0 lg:min-h-0 lg:overflow-y-auto lg:px-6"
        aria-busy={isFrameworkLoading}
      >
        {#if !fullscreen && view === 'templates'}
          <header class="mb-5">
            <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Frameworks</h1>
            <p class="mt-0.5 text-sm text-cork-500">
              Pick lightweight templates and fill them for the active workspace.
            </p>
          </header>
        {/if}

        {#if isFrameworkLoading && view === 'editor'}
          <div class="{panelClass} p-4">
            {@render artifactSkeleton()}
          </div>
        {:else if view === 'templates'}
          <div class="space-y-5">
            {#each templateSections as { category, Icon: SectionIcon } (category)}
              <section aria-labelledby={`template-section-${category}`} class="min-w-0">
                <h2
                  id={`template-section-${category}`}
                  class="mb-2 flex items-center gap-2 font-display text-lg text-cork-800"
                >
                  <SectionIcon class="size-4 shrink-0 text-cork-500" aria-hidden="true" />
                  {category}
                </h2>
                <div
                  class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-[repeat(4,minmax(0,14rem))]"
                >
                  {#each sortedTemplates.filter((template) => template.category === category) as template (template.id)}
                    {@const Icon = template.icon}
                    {@const added = isTemplateAdded(template.id)}
                    <article
                      class="{panelClass} w-[68vw] max-w-[20rem] shrink-0 snap-start overflow-hidden transition-colors hover:border-cork-400/60 sm:w-[58vw] md:w-[46vw] lg:w-auto lg:max-w-none lg:shrink"
                    >
                      <div class="flex items-center justify-between gap-2 bg-[#f1ece2] px-3 py-2">
                        <h3
                          class="truncate font-display text-sm font-semibold {added
                            ? 'text-cork-700'
                            : 'text-cork-800'} pr-2"
                        >
                          {template.name}
                        </h3>
                        {#if isRepeatableFramework(template.id)}
                          {@const stackLabel = `Supports multiple ${template.name.toLowerCase()}s`}
                          <span
                            class="inline-flex shrink-0 items-center text-cork-500"
                            title={stackLabel}
                          >
                            <Layers3 class="size-3.5" aria-hidden="true" />
                            <span class="sr-only">{stackLabel}</span>
                          </span>
                        {/if}
                      </div>
                      <button
                        type="button"
                        class="group relative mx-3 mb-3 flex aspect-[9/5] w-[calc(100%-1.5rem)] cursor-pointer items-center justify-center overflow-hidden bg-cork-200/50 {added
                          ? 'bg-cork-200/70'
                          : ''}"
                        aria-label={added ? `Open ${template.name}` : `Add ${template.name}`}
                        disabled={isFrameworkLoading}
                        onclick={() =>
                          added
                            ? openDraft(
                                sortedInstances.find((i) => i.templateId === template.id)!.id
                              )
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
                              : 'text-cork-700/70'} {!added ? 'group-hover:opacity-0' : ''}"
                          />
                        {/if}
                        {#if added}
                          <CheckCheck class="absolute size-7 text-cork-700" aria-hidden="true" />
                        {:else}
                          <Plus
                            class="absolute size-10 text-cork-700 opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        {/if}
                      </button>
                    </article>
                  {/each}
                </div>
              </section>
            {/each}
          </div>
        {:else if selectedInstance && isStandaloneArtifact}
          {@render standaloneArtifact(selectedInstance)}
        {:else if selectedInstance && selectedTemplate}
          <div class={panelClass}>
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
                  showIds={showStoryMapIds}
                  showKanoLines={showStoryMapKanoLines}
                  showPainPoints={showStoryMapPainPoints}
                  {linkedStoryId}
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
            class="{panelClass} flex min-h-80 flex-col items-center justify-center px-4 text-center"
          >
            <Layers3 class="size-9 text-cork-300" />
            <p class="mt-2 text-sm font-medium text-cork-600">No draft selected</p>
          </div>
        {/if}
      </section>

      <aside
        class="min-w-0 rounded-sm border border-cork-300/60 bg-cork-50/60 p-3 [scrollbar-width:none] lg:min-h-0 lg:overflow-y-auto lg:rounded-none lg:border-y-0 lg:border-e-0 lg:p-4 [&::-webkit-scrollbar]:hidden"
        aria-label="Frameworks sidebar"
        aria-busy={isFrameworkLoading}
      >
        {#if view === 'editor' && selectedInstance && selectedTemplate}
          <div class="mb-3 border-b border-cork-300/50 pb-3">
            {@render artifactControls()}
          </div>
        {/if}

        <nav aria-label="Frameworks navigation">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors {view ===
            'templates'
              ? activeItemClass
              : idleSidebarItemClass}"
            aria-current={view === 'templates' ? 'true' : undefined}
            onclick={openTemplateLibrary}
          >
            <Layers3 class="size-4 shrink-0" />
            <span class="truncate">Template library</span>
          </button>

          <div class="mt-3 border-t border-cork-300/50 pt-3">
            {#if isFrameworkLoading}
              <div role="status" class="space-y-3 py-1">
                <span class="sr-only">Loading artifacts</span>
                {#each [1, 2, 3] as row (row)}
                  <Skeleton
                    aria-hidden="true"
                    class="h-10 w-full bg-cork-200/60 motion-reduce:animate-none"
                  />
                {/each}
              </div>
            {:else if instances.length === 0}
              <p class="rounded-lg px-2 py-3 text-center text-xs text-cork-400">No drafts yet</p>
            {:else}
              <div class="space-y-1">
                {#each paginatedInstances as instance (instance.id)}
                  {@const selected = view === 'editor' && selectedInstance?.id === instance.id}
                  {@const typeName = templates.find(
                    (template) => template.id === instance.templateId
                  )?.name}
                  <button
                    type="button"
                    class="block w-full min-w-0 cursor-pointer rounded-lg px-3 py-2 text-left transition-colors {selected
                      ? activeItemClass
                      : idleSidebarItemClass}"
                    aria-current={selected ? 'true' : undefined}
                    onclick={() => openDraft(instance.id)}
                  >
                    <span class="block truncate text-xs leading-tight font-medium"
                      >{instance.title}</span
                    >
                    <span
                      class="mt-0.5 block text-[9px] {selected
                        ? 'text-[#4b6045]'
                        : 'text-cork-600'}"
                    >
                      {formatUpdatedAt(instance.updatedAt)}
                      {#if typeName && typeName.toLowerCase() !== instance.title
                            .trim()
                            .toLowerCase()}
                        <span class="opacity-50">·</span> {typeName}
                      {/if}
                    </span>
                  </button>
                {/each}
              </div>
              {#if totalDraftPages > 1}
                <div
                  class="mt-2 flex items-center justify-between gap-1 border-t border-cork-300/50 pt-2"
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
        </nav>

        {#if projectImages.length}
          <div class="mt-3 space-y-3 border-t border-cork-300/50 pt-3">
            {#each projectImages as image (image.src)}
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                class="mx-auto block h-auto w-full max-w-36"
              />
            {/each}
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
    <div class="help-modal-scroll min-h-0 space-y-4 overflow-y-auto overscroll-contain text-sm">
      {#if selectedTemplate?.instructionBullets?.length}
        <div>
          <h4 class="mb-1.5 text-xs font-semibold tracking-wide text-cork-500 uppercase">
            How to Use
          </h4>
          <ul class="ml-4 list-disc space-y-1 text-cork-700">
            {#each selectedTemplate.instructionBullets as instruction (instruction)}
              <li>{instruction}</li>
            {/each}
          </ul>
        </div>
      {:else if selectedTemplate?.instructions}
        <div>
          <h4 class="mb-1.5 text-xs font-semibold tracking-wide text-cork-500 uppercase">
            How to Use
          </h4>
          <p class="leading-relaxed text-cork-700">{selectedTemplate.instructions}</p>
        </div>
      {/if}
      {#if guideTerminology.length > 0}
        <div>
          <h4 class="mb-1.5 text-xs font-semibold tracking-wide text-cork-500 uppercase">
            Terminology
          </h4>
          <ul class="ml-4 list-disc space-y-1">
            {#each guideTerminology as item (item.term)}
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
  .artifact-page :global(:focus),
  .artifact-page :global(:focus-visible) {
    outline: none;
    --tw-ring-shadow: 0 0 #0000;
  }

  @media (width >= 64rem) {
    .framework-content {
      --table-header-top: 0px;
    }

    /* Keep vertical spacing in the scrollable content so sticky headers meet the pane edge. */
    .framework-content::before,
    .framework-content::after {
      display: block;
      height: 1.5rem;
      content: '';
    }
  }

  .framework-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--color-cork-400, #b0a48e) transparent;
  }

  @supports selector(::-webkit-scrollbar) {
    .framework-scroll {
      scrollbar-width: auto;
      scrollbar-color: auto;
    }
  }

  .framework-scroll::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }

  .framework-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .framework-scroll::-webkit-scrollbar-thumb {
    border: 1px solid transparent;
    border-radius: 999px;
    background: var(--color-cork-400, #b0a48e);
    background-clip: padding-box;
  }

  .framework-scroll::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-cork-500, #8a7e6b);
  }

  .framework-scroll::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }

  .framework-scroll::-webkit-scrollbar-button:vertical:start:decrement,
  .framework-scroll::-webkit-scrollbar-button:vertical:end:increment {
    display: block;
    width: 8px;
    height: 12px;
    color: var(--color-cork-500, #8a7e6b);
    background-color: transparent;
    background-repeat: no-repeat;
    background-position:
      calc(50% - 1.5px) center,
      calc(50% + 1.5px) center;
    background-size: 3px 4px;
  }

  .framework-scroll::-webkit-scrollbar-button:vertical:start:decrement {
    background-image:
      linear-gradient(135deg, transparent 50%, currentColor 50%),
      linear-gradient(225deg, transparent 50%, currentColor 50%);
  }

  .framework-scroll::-webkit-scrollbar-button:vertical:end:increment {
    background-image:
      linear-gradient(45deg, transparent 50%, currentColor 50%),
      linear-gradient(315deg, transparent 50%, currentColor 50%);
  }

  .framework-scroll::-webkit-scrollbar-button:vertical:hover {
    color: var(--color-cork-700, #5c4b3a);
  }

  .help-modal-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .help-modal-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
