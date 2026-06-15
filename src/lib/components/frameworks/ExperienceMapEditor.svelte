<script lang="ts">
  import type { FrameworkInstance } from './types.js';
  import { Route } from '@lucide/svelte';
  import { GAIN_COLOR, PAIN_COLOR, PHASE_COLORS } from '$lib/constants/colors.js';

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  type Touchpoint = {
    id: string;
    title: string;
    actor: string;
    action: string;
    outcome: string;
    pains: string;
    gains: string;
    pic: string;
    picColor: string;
    kpi: string;
  };
  type Step = { id: string; title: string; touchpoints: Touchpoint[] };
  type Phase = { id: string; title: string; actors: string[]; steps: Step[] };
  type EMap = { outcomes: { code: string; title: string }[]; phases: Phase[] };

  let data = $state<EMap>({ outcomes: [], phases: [] });

  $effect(() => {
    try {
      const parsed = JSON.parse(instance.values.experienceMap ?? '{"outcomes":[],"phases":[]}');
      data = parsed;
    } catch {
      data = { outcomes: [], phases: [] };
    }
  });

  function save() {
    onUpdate({ ...instance.values, experienceMap: JSON.stringify(data) });
  }

  let touchpoints = $derived.by(() => {
    const result: { touchpoint: Touchpoint; stepTitle: string; phaseIndex: number }[] = [];
    for (let pi = 0; pi < data.phases.length; pi++) {
      for (const step of data.phases[pi].steps) {
        for (const tp of step.touchpoints) {
          result.push({ touchpoint: tp, stepTitle: step.title, phaseIndex: pi });
        }
      }
    }
    return result;
  });

  let phaseSpans = $derived.by(() => {
    const spans: { title: string; span: number; actors: string[] }[] = [];
    for (const phase of data.phases) {
      const span = phase.steps.reduce((c, s) => c + s.touchpoints.length, 0);
      if (span > 0) spans.push({ title: phase.title, span, actors: phase.actors });
    }
    return spans;
  });

  let stepSpans = $derived.by(() => {
    const spans: { title: string; span: number; phaseIndex: number }[] = [];
    for (let pi = 0; pi < data.phases.length; pi++) {
      for (const step of data.phases[pi].steps) {
        if (step.touchpoints.length > 0)
          spans.push({ title: step.title, span: step.touchpoints.length, phaseIndex: pi });
      }
    }
    return spans;
  });

  function lines(v: string): string[] {
    return v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const HAPPY = ['😊', '🤩', '😍', '🥳', '🙂', '☺'];
  const MIXED = ['🤔', '🧐', '🧐', '😏', '🙃', '😒'];
  const SAD = ['😕', '😟', '😣', '😩', '😫', '😰'];

  function emoji(tp: Touchpoint, i: number): string {
    const p = lines(tp.pains).length;
    const g = lines(tp.gains).length;
    if (p === 0 && g === 0) return '😐';
    if (g > p) return HAPPY[i % HAPPY.length];
    if (p > g) return SAD[i % SAD.length];
    return MIXED[i % MIXED.length];
  }

  function channelLabel(stepTitle: string): string {
    const t = stepTitle.toLowerCase();
    if (t.includes('whatsapp') || t.includes('chat')) return 'WhatsApp';
    if (t.includes('login') || t.includes('register') || t.includes('auth')) return 'Auth Page';
    if (t.includes('upload')) return 'Upload Page';
    if (t.includes('search') || t.includes('browse')) return 'Search Page';
    if (t.includes('profile')) return 'Profile Page';
    if (t.includes('manage') || t.includes('access') || t.includes('control')) return 'Dashboard';
    if (
      t.includes('detail') ||
      t.includes('view') ||
      t.includes('preview') ||
      t.includes('portfolio')
    )
      return 'Detail Page';
    if (t.includes('email') || t.includes('mail')) return 'Email';
    if (t.includes('zoom') || t.includes('meet') || t.includes('call')) return 'Video Call';
    return 'Web App';
  }

  function phaseColor(i: number) {
    return PHASE_COLORS[i % PHASE_COLORS.length];
  }

  function updateTouchpoint(tpId: string, field: keyof Touchpoint, value: string) {
    const phases = data.phases.map((p) => ({
      ...p,
      steps: p.steps.map((s) => ({
        ...s,
        touchpoints: s.touchpoints.map((tp) => (tp.id === tpId ? { ...tp, [field]: value } : tp))
      }))
    }));
    data = { ...data, phases };
    save();
  }
</script>

<div class="rounded-xl border border-cork-300/50 bg-cork-50/50 p-4">
  {#if touchpoints.length === 0}
    <div class="rounded-xl border border-cork-300/40 bg-cork-100 px-4 py-12 text-center">
      <Route class="mx-auto mb-2 size-8 text-cork-300" />
      <p class="text-sm text-cork-500">No touchpoints yet</p>
    </div>
  {:else}
    <div
      class="xmap-scroll overflow-x-auto rounded-xl"
      style="--label-w: 90px; background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ddd4c2; box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08); min-height: min(42rem, calc(100vh - 220px));"
    >
      <div
        class="flex flex-col md:[--label-w:140px]"
        style="min-width: {Math.max(
          500,
          touchpoints.length * 130
        )}px; min-height: min(42rem, calc(100vh - 220px));"
      >
        <!-- Phase row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Phase
          </div>
          {#each phaseSpans as ps, i (ps.title)}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2 text-center"
              style="grid-column: span {ps.span}; background: {phaseColor(i).bg};"
            >
              <p class="font-display text-lg font-bold" style="color: {phaseColor(i).text};">
                {ps.title}
              </p>
            </div>
          {/each}
        </div>
        <!-- Actors row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Actors
          </div>
          {#each phaseSpans as ps (ps.title)}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-1.5 text-center"
              style="grid-column: span {ps.span};"
            >
              <p class="text-sm text-cork-700">{ps.actors.join(' ')}</p>
            </div>
          {/each}
        </div>
        <!-- Steps row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Steps
          </div>
          {#each stepSpans as ss (`${ss.phaseIndex}-${ss.title}`)}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-1.5 text-center"
              style="grid-column: span {ss.span};"
            >
              <p class="text-sm font-bold text-cork-700">{ss.title}</p>
            </div>
          {/each}
        </div>
        <!-- Touchpoints row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Touchpoints
          </div>
          {#each touchpoints as item (item.touchpoint.id)}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              {#if draftMode === 'edit'}
                <input
                  value={item.touchpoint.title}
                  aria-label="Touchpoint title"
                  class="w-full rounded border border-cork-300/50 bg-cork-100/60 px-2 py-1 text-center text-sm text-cork-800 outline-none focus:border-cork-500"
                  oninput={(e) =>
                    updateTouchpoint(item.touchpoint.id, 'title', e.currentTarget.value)}
                />
              {:else}
                <p class="text-center text-sm text-cork-800">{item.touchpoint.title}</p>
              {/if}
            </div>
          {/each}
        </div>
        <!-- Needs & Pains row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Needs &amp; Pains
          </div>
          {#each touchpoints as item (item.touchpoint.id)}
            <div class="border-l border-cork-600/30 px-3 py-2">
              {#if draftMode === 'edit'}
                <div class="space-y-1.5">
                  <textarea
                    value={item.touchpoint.gains}
                    aria-label="Gains"
                    placeholder="Gains, one per line"
                    class="min-h-16 w-full resize-y rounded border border-cork-300/50 bg-cork-100/60 px-2 py-1 text-xs text-cork-700 outline-none placeholder:text-cork-400 focus:border-cork-500"
                    oninput={(e) =>
                      updateTouchpoint(item.touchpoint.id, 'gains', e.currentTarget.value)}
                  ></textarea>
                  <textarea
                    value={item.touchpoint.pains}
                    aria-label="Pains"
                    placeholder="Pains, one per line"
                    class="min-h-16 w-full resize-y rounded border border-cork-300/50 bg-cork-100/60 px-2 py-1 text-xs text-cork-700 outline-none placeholder:text-cork-400 focus:border-cork-500"
                    oninput={(e) =>
                      updateTouchpoint(item.touchpoint.id, 'pains', e.currentTarget.value)}
                  ></textarea>
                </div>
              {:else}
                <div class="space-y-1.5">
                  {#each lines(item.touchpoint.gains) as g, i (`g-${i}`)}<p
                      class="text-xs italic"
                      style="color: {GAIN_COLOR};"
                    >
                      "{g}"
                    </p>{/each}
                  {#each lines(item.touchpoint.pains) as p, i (`p-${i}`)}<p
                      class="text-xs italic"
                      style="color: {PAIN_COLOR};"
                    >
                      "{p}"
                    </p>{/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
        <!-- Channel row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Channel
          </div>
          {#each touchpoints as item (item.touchpoint.id)}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <span class="text-xs font-medium text-cork-700">{channelLabel(item.stepTitle)}</span>
            </div>
          {/each}
        </div>
        <!-- Feeling row -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Feeling
          </div>
          {#each touchpoints as item, i (item.touchpoint.id)}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <span class="text-2xl">{emoji(item.touchpoint, i)}</span>
            </div>
          {/each}
        </div>
        <!-- KPI row -->
        <div
          class="grid flex-1"
          style="grid-template-columns: var(--label-w) repeat({touchpoints.length}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            KPI
          </div>
          {#each touchpoints as item (item.touchpoint.id)}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-2 py-2">
              {#if draftMode === 'edit'}
                <input
                  value={item.touchpoint.kpi}
                  aria-label="KPI"
                  class="w-full rounded border border-cork-300/50 bg-cork-100/60 px-2 py-1 text-center text-[10px] font-medium text-cork-700 outline-none focus:border-cork-500"
                  oninput={(e) =>
                    updateTouchpoint(item.touchpoint.id, 'kpi', e.currentTarget.value)}
                />
              {:else if item.touchpoint.kpi}
                <span
                  class="rounded-full bg-cork-200/60 px-2 py-0.5 text-[10px] font-medium text-cork-700"
                  >{item.touchpoint.kpi}</span
                >
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .xmap-scroll {
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .xmap-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
