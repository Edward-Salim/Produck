<script lang="ts">
  import { Route } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import type {
    ExperiencePhaseData,
    ExperienceTouchpointData,
    OutcomeOption
  } from './+page.server.js';
  import { PHASE_COLORS, GAIN_COLOR, PAIN_COLOR } from '$lib/constants/colors.js';

  let { data } = $props();

  const phases = $derived(data.phases as ExperiencePhaseData[]);
  const outcomes = $derived((data.outcomes ?? []) as OutcomeOption[]);

  let allTouchpoints = $derived.by(() => {
    const result: { tp: ExperienceTouchpointData; stepTitle: string; phaseIndex: number }[] = [];
    for (let pi = 0; pi < phases.length; pi++) {
      for (const step of phases[pi].steps) {
        for (const tp of step.touchpoints) {
          result.push({ tp, stepTitle: step.title, phaseIndex: pi });
        }
      }
    }
    return result;
  });

  let phaseSpans = $derived.by(() => {
    const spans: { title: string; span: number; actors: string[] }[] = [];
    for (const phase of phases) {
      let count = 0;
      for (const step of phase.steps) count += step.touchpoints.length;
      if (count > 0) spans.push({ title: phase.title, span: count, actors: phase.actors });
    }
    return spans;
  });

  let stepSpans = $derived.by(() => {
    const spans: { title: string; span: number; phaseIndex: number }[] = [];
    for (let pi = 0; pi < phases.length; pi++) {
      for (const step of phases[pi].steps) {
        if (step.touchpoints.length > 0) {
          spans.push({ title: step.title, span: step.touchpoints.length, phaseIndex: pi });
        }
      }
    }
    return spans;
  });

  let totalTouchpoints = $derived(allTouchpoints.length);

  const HAPPY_FACES = ['\u{1F60A}', '\u{1F929}', '\u{1F60D}', '\u{1F973}', '\u{1F642}', '\u{263A}'];
  const MIXED_FACES = [
    '\u{1F914}',
    '\u{1F928}',
    '\u{1F9D0}',
    '\u{1F60F}',
    '\u{1F643}',
    '\u{1F612}'
  ];
  const SAD_FACES = ['\u{1F615}', '\u{1F61F}', '\u{1F623}', '\u{1F629}', '\u{1F62B}', '\u{1F630}'];

  function storyEmoji(s: ExperienceTouchpointData, index: number): string {
    const p = s.pains.length;
    const g = s.gains.length;
    if (p === 0 && g === 0) return '\u{1F610}';
    if (g > p) return HAPPY_FACES[index % HAPPY_FACES.length];
    if (p > g) return SAD_FACES[index % SAD_FACES.length];
    return MIXED_FACES[index % MIXED_FACES.length];
  }

  function touchpointLabel(taskTitle: string): string {
    const t = taskTitle.toLowerCase();
    if (t.includes('whatsapp') || t.includes('chat') || t.includes('contact')) return 'WhatsApp';
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

  function phase(i: number) {
    return PHASE_COLORS[i % PHASE_COLORS.length];
  }
</script>

<svelte:head><title>Experience Map - Produck</title></svelte:head>

<div>
  <header class="mb-4">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Experience Map</h1>
    <p class="mt-0.5 text-sm text-cork-500">Customer journey across all phases</p>
  </header>

  {#if totalTouchpoints === 0}
    <EmptyState
      icon={Route}
      title="No touchpoints yet"
      description="Add phases, steps, and touchpoints to build the experience map"
    />
  {:else}
    <div
      class="xmap-scroll overflow-x-auto rounded-xl"
      style="--label-w: 90px; background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ddd4c2;
				box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);
				min-height: calc(100vh - 180px);"
    >
      <div
        class="flex flex-col md:[--label-w:140px]"
        style="min-width: {Math.max(
          500,
          totalTouchpoints * 130
        )}px; min-height: calc(100vh - 180px);"
      >
        <!-- Phase -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Phase
          </div>
          {#each phaseSpans as act, i}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2 text-center"
              style="grid-column: span {act.span}; background: {phase(i).bg};"
            >
              <p class="font-display text-lg font-bold" style="color: {phase(i).text};">
                {act.title}
              </p>
            </div>
          {/each}
        </div>

        <!-- Actors -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Actors
          </div>
          {#each phaseSpans as act}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-1.5 text-center"
              style="grid-column: span {act.span};"
            >
              <p class="text-sm text-cork-700">{act.actors.join(' ')}</p>
            </div>
          {/each}
        </div>

        <!-- Steps -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Steps
          </div>
          {#each stepSpans as task}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-1.5 text-center"
              style="grid-column: span {task.span};"
            >
              <p class="text-sm font-bold text-cork-700">{task.title}</p>
            </div>
          {/each}
        </div>

        <!-- Touchpoints -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Touchpoints
          </div>
          {#each allTouchpoints as s}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <p class="text-center text-sm text-cork-800">{s.tp.title}</p>
            </div>
          {/each}
        </div>

        <!-- Needs & Pains -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Needs &amp; Pains
          </div>
          {#each allTouchpoints as s}
            <div class="border-l border-cork-600/30 px-3 py-2">
              <div class="space-y-1.5">
                {#each s.tp.gains as gain, i (i)}
                  <p class="text-xs italic" style="color: {GAIN_COLOR};">"{gain}"</p>
                {/each}
                {#each s.tp.pains as pain, i (i)}
                  <p class="text-xs italic" style="color: {PAIN_COLOR};">"{pain}"</p>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Channel -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Channel
          </div>
          {#each allTouchpoints as s}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <span class="text-xs font-medium text-cork-700">{touchpointLabel(s.stepTitle)}</span>
            </div>
          {/each}
        </div>

        <!-- Feeling -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            Feeling
          </div>
          {#each allTouchpoints as s, i}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <span class="text-2xl">{storyEmoji(s.tp, i)}</span>
            </div>
          {/each}
        </div>

        <!-- KPI -->
        <div
          class="grid flex-1"
          style="grid-template-columns: var(--label-w) repeat({totalTouchpoints}, 1fr);"
        >
          <div
            class="flex items-center truncate px-2 text-[10px] font-bold tracking-wide text-cork-500 uppercase md:px-3 md:text-xs md:tracking-wider"
          >
            KPI
          </div>
          {#each allTouchpoints as s}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-2 py-2">
              {#if s.tp.kpi}
                <span
                  class="rounded-full bg-cork-200/60 px-2 py-0.5 text-[10px] font-medium text-cork-700"
                  title={outcomes.find((o) => o.code === s.tp.kpi)?.title ?? s.tp.kpi}
                >
                  {s.tp.kpi}
                </span>
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
