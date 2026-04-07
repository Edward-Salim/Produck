<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import {
    Download,
    Upload,
    LoaderCircle,
    Save,
    Sparkles,
    SendHorizontal,
    ChevronUp,
    ChevronDown,
    Code,
    FormInput,
    Plus,
    Trash2
  } from '@lucide/svelte';

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

  interface DiffLine {
    type: 'same' | 'add' | 'remove';
    text: string;
    lineNo?: number;
  }

  function computeDiff(oldStr: string, newStr: string): DiffLine[] {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    const result: DiffLine[] = [];

    // Simple LCS-based diff
    const m = oldLines.length;
    const n = newLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    // Backtrack
    const ops: DiffLine[] = [];
    let i = m,
      j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        ops.push({ type: 'same', text: oldLines[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.push({ type: 'add', text: newLines[j - 1], lineNo: j });
        j--;
      } else {
        ops.push({ type: 'remove', text: oldLines[i - 1], lineNo: i });
        i--;
      }
    }

    return ops.reverse();
  }

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

  // Sections with sub-items for accordion
  const KEY_LABELS: Record<string, string> = {
    project: 'Project',
    outcomes: 'Outcomes',
    objectives: 'Objectives',
    keyResults: 'Key Results',
    interviews: 'Interviews',
    experiencePhases: 'Phases',
    experienceSteps: 'Steps',
    experienceTouchpoints: 'Touchpoints',
    ideas: 'Ideas',
    actors: 'Actors',
    activities: 'Activities',
    tasks: 'Tasks',
    stories: 'Stories',
    personas: 'Personas'
  };

  const SECTIONS = [
    { key: 'all', label: 'All Data', subs: [] as string[] },
    { key: 'project', label: 'Project Info', subs: ['project'] },
    { key: 'outcomes', label: 'Outcomes', subs: ['outcomes', 'objectives', 'keyResults'] },
    { key: 'interviews', label: 'Interviews', subs: ['interviews'] },
    {
      key: 'experience',
      label: 'Experience Map',
      subs: ['experiencePhases', 'experienceSteps', 'experienceTouchpoints']
    },
    {
      key: 'ideas-storymap',
      label: 'Idea Bank & Story Map',
      subs: ['ideas', 'actors', 'activities', 'tasks', 'stories']
    },
    { key: 'personas', label: 'Personas', subs: ['personas'] }
  ] as const;

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
    const template = getNewRecordTemplate(key, maxId + 1);
    existing.push(template);
    syncFormToFullData();
  }

  function removeRecord(index: number) {
    const key = getFormKey();
    if (!key || !fullData || !Array.isArray(fullData[key])) return;
    fullData[key].splice(index, 1);
    syncFormToFullData();
  }

  function getNewRecordTemplate(key: string, id: number): Record<string, any> {
    const base: Record<string, any> = { id };
    switch (key) {
      case 'ideas':
        return { ...base, title: '', description: '', status: 'triage', proposer: '', okrCode: '' };
      case 'actors':
        return { ...base, projectId: fullData?.project?.id, emoji: '', label: '', sortOrder: 0 };
      case 'activities':
        return {
          ...base,
          projectId: fullData?.project?.id,
          code: '',
          title: '',
          actorEmojis: [],
          sortOrder: 0
        };
      case 'tasks':
        return { ...base, activityId: 0, code: '', title: '', sortOrder: 0 };
      case 'stories':
        return {
          ...base,
          activityId: 0,
          taskId: null,
          code: '',
          title: '',
          pic: '',
          picColor: '',
          done: false,
          kano: 'performance',
          asA: '',
          wantTo: '',
          soThat: '',
          pains: [],
          gains: [],
          details: [],
          checkedAcs: [],
          assumptions: [],
          sortOrder: 0
        };
      case 'experiencePhases':
        return {
          ...base,
          projectId: fullData?.project?.id,
          title: '',
          actorEmojis: [],
          sortOrder: 0
        };
      case 'experienceSteps':
        return { ...base, phaseId: 0, title: '', sortOrder: 0 };
      case 'experienceTouchpoints':
        return {
          ...base,
          stepId: 0,
          title: '',
          asA: '',
          wantTo: '',
          soThat: '',
          pains: [],
          gains: [],
          pic: '',
          picColor: '',
          sortOrder: 0
        };
      case 'outcomes':
        return {
          ...base,
          projectId: fullData?.project?.id,
          year: new Date().getFullYear(),
          code: '',
          title: '',
          description: '',
          metrics: []
        };
      case 'objectives':
        return {
          ...base,
          projectId: fullData?.project?.id,
          year: new Date().getFullYear(),
          quarter: Math.ceil((new Date().getMonth() + 1) / 3),
          code: '',
          title: '',
          sortOrder: 0
        };
      case 'keyResults':
        return {
          ...base,
          objectiveId: 0,
          code: '',
          description: '',
          target: '',
          targetValue: 0,
          currentValue: 0,
          unit: '',
          lastUpdated: new Date().toISOString().slice(0, 10)
        };
      case 'interviews':
        return {
          ...base,
          projectId: fullData?.project?.id,
          personName: '',
          personRole: '',
          interviewDate: new Date().toISOString().slice(0, 10),
          quote: '',
          quickFacts: [],
          insights: [],
          opportunities: [],
          transcript: ''
        };
      case 'personas':
        return {
          ...base,
          projectId: fullData?.project?.id,
          name: '',
          role: '',
          goals: [],
          challenges: [],
          motivators: [],
          sortOrder: 0
        };
      default:
        return base;
    }
  }

  // Fields to show per data key (skip internal fields like id, projectId, timestamps)
  const FORM_FIELDS: Record<
    string,
    {
      key: string;
      label: string;
      type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array';
      options?: string[];
    }[]
  > = {
    project: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'shortName', label: 'Short Name', type: 'text' },
      { key: 'levels', label: 'Levels', type: 'number' }
    ],
    ideas: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['triage', 'candidate', 'working-set', 'released', 'parked']
      },
      { key: 'proposer', label: 'Proposer', type: 'text' },
      { key: 'okrCode', label: 'OKR Code', type: 'text' }
    ],
    actors: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'sortOrder', label: 'Order', type: 'number' }
    ],
    activities: [
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sortOrder', label: 'Order', type: 'number' }
    ],
    tasks: [
      { key: 'activityId', label: 'Activity ID', type: 'number' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sortOrder', label: 'Order', type: 'number' }
    ],
    stories: [
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      {
        key: 'kano',
        label: 'Kano',
        type: 'select',
        options: ['must-have', 'performance', 'delighter']
      },
      { key: 'pic', label: 'PIC', type: 'text' },
      { key: 'done', label: 'Done', type: 'boolean' },
      { key: 'asA', label: 'As a...', type: 'text' },
      { key: 'wantTo', label: 'I want to...', type: 'text' },
      { key: 'soThat', label: 'So that...', type: 'text' },
      { key: 'pains', label: 'Pains', type: 'array' },
      { key: 'gains', label: 'Gains', type: 'array' },
      { key: 'details', label: 'Acceptance Criteria', type: 'array' }
    ],
    experiencePhases: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sortOrder', label: 'Order', type: 'number' }
    ],
    experienceSteps: [
      { key: 'phaseId', label: 'Phase ID', type: 'number' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sortOrder', label: 'Order', type: 'number' }
    ],
    experienceTouchpoints: [
      { key: 'stepId', label: 'Step ID', type: 'number' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'asA', label: 'As a...', type: 'text' },
      { key: 'wantTo', label: 'I want to...', type: 'text' },
      { key: 'soThat', label: 'So that...', type: 'text' },
      { key: 'pains', label: 'Pains', type: 'array' },
      { key: 'gains', label: 'Gains', type: 'array' }
    ],
    outcomes: [
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'metrics', label: 'Metrics', type: 'array' }
    ],
    objectives: [
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'quarter', label: 'Quarter', type: 'number' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sortOrder', label: 'Order', type: 'number' }
    ],
    keyResults: [
      { key: 'objectiveId', label: 'Objective ID', type: 'number' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'target', label: 'Target', type: 'text' },
      { key: 'targetValue', label: 'Target Value', type: 'number' },
      { key: 'currentValue', label: 'Current Value', type: 'number' },
      { key: 'unit', label: 'Unit', type: 'text' }
    ],
    interviews: [
      { key: 'personName', label: 'Name', type: 'text' },
      { key: 'personRole', label: 'Role', type: 'text' },
      { key: 'interviewDate', label: 'Date', type: 'text' },
      { key: 'quote', label: 'Quote', type: 'textarea' },
      { key: 'quickFacts', label: 'Quick Facts', type: 'array' },
      { key: 'insights', label: 'Insights', type: 'array' },
      { key: 'opportunities', label: 'Opportunities', type: 'array' },
      { key: 'transcript', label: 'Transcript', type: 'textarea' }
    ],
    personas: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'quote', label: 'Quote', type: 'textarea' },
      { key: 'biography', label: 'Biography', type: 'textarea' },
      { key: 'goals', label: 'Goals', type: 'array' },
      { key: 'challenges', label: 'Challenges', type: 'array' },
      { key: 'motivators', label: 'Motivators', type: 'array' }
    ]
  };

  function syncFormToFullData() {
    // Update jsonText to reflect form changes (for save detection)
    jsonText = getFilteredJson();
  }

  let formItems = $derived(getFormData());
  let formKey = $derived(getFormKey());
  let formFields = $derived(formKey ? (FORM_FIELDS[formKey] ?? []) : []);

  $effect(() => {
    data.lastProject;
    loadData().then(() => {
      loadDiffForFilter();
    });
  });
</script>

<svelte:head><title>Admin - Produck</title></svelte:head>

<header class="mb-6">
  <h1 class="font-display text-4xl text-cork-800">Admin</h1>
  <p class="mt-0.5 text-sm text-cork-500">View and edit project data</p>
</header>

<!-- Toolbar -->
<div class="mb-4 flex items-center gap-3">
  <!-- View toggle -->
  <div class="flex overflow-hidden rounded-lg border border-cork-300">
    <button
      type="button"
      class="flex cursor-pointer items-center px-3 py-2 text-sm font-medium transition-colors {viewMode ===
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
      class="flex cursor-pointer items-center px-3 py-2 text-sm font-medium transition-colors {viewMode ===
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
    class="flex cursor-pointer items-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-600 transition-colors hover:bg-cork-200/50"
  >
    <Download class="size-4" />Export
  </button>
  <label
    title="Import JSON"
    class="flex cursor-pointer items-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-600 transition-colors hover:bg-cork-200/50"
  >
    <Upload class="size-4" />Import
    <input type="file" accept=".json" class="hidden" onchange={handleFileUpload} />
  </label>
  <div class="flex-1"></div>
  {#if error}
    <span class="text-sm text-red-600">{error}</span>
  {/if}
  {#if success}
    <span class="text-sm text-green-700">{success}</span>
  {/if}
  <button
    onclick={saveData}
    disabled={saving || !hasChanges}
    class="flex cursor-pointer items-center gap-2 rounded-lg bg-cork-700 px-4 py-2 text-sm font-medium text-cork-50 transition-colors hover:bg-cork-800 disabled:opacity-40"
  >
    {#if saving}
      <LoaderCircle class="size-4 animate-spin" />Saving...
    {:else}
      <Save class="size-4" />Save Changes
    {/if}
  </button>
</div>

<!-- Main: filter pane + editor + AI -->
{#if loading}
  <div class="flex items-center justify-center" style="height: calc(100vh - 240px)">
    <LoaderCircle class="size-6 animate-spin text-cork-400" />
  </div>
{:else}
  <div class="flex gap-3" style="height: calc(100vh - 240px)">
    <!-- Left: section filter (accordion) -->
    <div class="left-pane w-44 shrink-0 space-y-0.5 overflow-y-auto">
      {#each SECTIONS as section (section.key)}
        {@const isActive = activeSection === section.key}
        {@const isExpanded = expandedSections.has(section.key)}
        {@const hasSubs = section.subs.length > 1}
        {@const sectionHasDiff = hasSubs
          ? section.subs.some((s) => hasDiffFor(s))
          : hasDiffFor(section.key)}
        <!-- Section header -->
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors {isActive &&
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
        <!-- Sub-items (accordion) -->
        {#if hasSubs && (isExpanded || isActive)}
          <div class="ml-3 space-y-0.5 border-l border-cork-300/40 pl-2">
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
      {/each}
    </div>

    <!-- Right: editor + AI prompt -->
    <div class="flex min-w-0 flex-1 flex-col gap-2">
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
        <!-- Form view -->
        <div
          class="form-scroll flex-1 space-y-3 overflow-y-auto rounded-xl border border-cork-300 bg-cork-50/50 p-4"
        >
          {#if formKey && formFields.length > 0}
            {#each formItems as item, idx (item.id ?? idx)}
              <div class="rounded-lg border border-cork-200 bg-white p-4">
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-xs font-semibold text-cork-500">
                    {#if item.code}{item.code} —
                    {/if}{item.title || item.name || item.personName || `#${item.id}`}
                  </span>
                  <button
                    type="button"
                    class="cursor-pointer text-cork-300 transition-colors hover:text-red-500"
                    onclick={() => removeRecord(idx)}
                  >
                    <Trash2 class="size-3.5" />
                  </button>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {#each formFields as field (field.key)}
                    <div
                      class={field.type === 'textarea' || field.type === 'array'
                        ? 'md:col-span-2'
                        : ''}
                    >
                      <label
                        class="mb-1 block text-[10px] font-semibold tracking-wider text-cork-400 uppercase"
                        >{field.label}</label
                      >
                      {#if field.type === 'text'}
                        <input
                          type="text"
                          value={item[field.key] ?? ''}
                          oninput={(e) => {
                            item[field.key] = (e.target as HTMLInputElement).value;
                            syncFormToFullData();
                          }}
                          class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                        />
                      {:else if field.type === 'number'}
                        <input
                          type="number"
                          value={item[field.key] ?? 0}
                          oninput={(e) => {
                            item[field.key] = Number((e.target as HTMLInputElement).value);
                            syncFormToFullData();
                          }}
                          class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                        />
                      {:else if field.type === 'boolean'}
                        <button
                          type="button"
                          class="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800"
                          onclick={() => {
                            item[field.key] = !item[field.key];
                            syncFormToFullData();
                          }}
                        >
                          <span
                            class="size-3 rounded {item[field.key]
                              ? 'bg-green-500'
                              : 'bg-cork-300'}"
                          ></span>
                          {item[field.key] ? 'Yes' : 'No'}
                        </button>
                      {:else if field.type === 'select'}
                        <select
                          value={item[field.key] ?? ''}
                          onchange={(e) => {
                            item[field.key] = (e.target as HTMLSelectElement).value;
                            syncFormToFullData();
                          }}
                          class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                        >
                          {#each field.options ?? [] as opt (opt)}
                            <option value={opt}>{opt}</option>
                          {/each}
                        </select>
                      {:else if field.type === 'textarea'}
                        <textarea
                          value={item[field.key] ?? ''}
                          oninput={(e) => {
                            item[field.key] = (e.target as HTMLTextAreaElement).value;
                            syncFormToFullData();
                          }}
                          rows="3"
                          class="w-full resize-none rounded-md border border-cork-200 bg-cork-50/50 px-2 py-1.5 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                        ></textarea>
                      {:else if field.type === 'array'}
                        <div class="space-y-1">
                          {#each item[field.key] ?? [] as arrItem, ai (ai)}
                            <div class="flex items-center gap-1">
                              <input
                                type="text"
                                value={arrItem}
                                oninput={(e) => {
                                  item[field.key][ai] = (e.target as HTMLInputElement).value;
                                  syncFormToFullData();
                                }}
                                class="h-7 flex-1 rounded-md border border-cork-200 bg-cork-50/50 px-2 text-xs text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                              />
                              <button
                                type="button"
                                class="shrink-0 cursor-pointer text-cork-300 hover:text-red-500"
                                onclick={() => {
                                  item[field.key].splice(ai, 1);
                                  syncFormToFullData();
                                }}
                              >
                                <Trash2 class="size-3" />
                              </button>
                            </div>
                          {/each}
                          <button
                            type="button"
                            class="flex cursor-pointer items-center gap-1 text-[10px] text-cork-400 hover:text-cork-600"
                            onclick={() => {
                              if (!item[field.key]) item[field.key] = [];
                              item[field.key].push('');
                              syncFormToFullData();
                            }}
                          >
                            <Plus class="size-3" />Add
                          </button>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/each}

            <!-- Add new record (not for single-record types like project) -->
            {#if formKey !== 'project'}
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-cork-300/50 py-3 text-xs font-medium text-cork-400 transition-colors hover:border-cork-400 hover:text-cork-600"
                onclick={addRecord}
              >
                <Plus class="size-4" />Add {KEY_LABELS[formKey] ?? 'Record'}
              </button>
            {/if}
          {:else}
            <div class="flex h-full items-center justify-center text-sm text-cork-400">
              Select a specific data type from the left pane to edit
            </div>
          {/if}
        </div>
      {/if}

      <!-- AI prompt bar -->
      <form onsubmit={askAI} class="ai-bar flex items-center gap-3 rounded-xl px-4 py-2.5">
        <Sparkles class="size-4 shrink-0 text-cork-500 {aiLoading ? 'animate-pulse' : ''}" />
        <input
          type="text"
          bind:value={aiPrompt}
          placeholder="Ask AI to edit this data... e.g. 'add a new phase called Onboarding'"
          class="flex-1 rounded-md border border-cork-300 bg-white/50 px-2 py-1 text-sm text-cork-800 shadow-none ring-0 placeholder:text-cork-400 focus:border-cork-500 focus:ring-0 focus:outline-none"
          disabled={aiLoading}
        />
        {#if aiError}
          <span class="shrink-0 text-xs text-red-500">{aiError}</span>
        {/if}
        <button
          type="submit"
          disabled={aiLoading || !aiPrompt.trim()}
          class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50 transition-colors hover:bg-cork-800 disabled:opacity-40"
        >
          {#if aiLoading}
            <LoaderCircle class="size-3.5 animate-spin" />
            <span>Thinking...</span>
          {:else}
            <SendHorizontal class="size-3.5" />
            <span class="text-cork-300">Enter</span>
          {/if}
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  textarea,
  .diff-scroll,
  .form-scroll,
  .left-pane {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    tab-size: 2;
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
