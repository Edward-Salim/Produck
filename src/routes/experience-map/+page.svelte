<script lang="ts">
  import { Route } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import type { ExperienceActivity, ExperienceTask, ExperienceStory } from './+page.server.js';
  import { PHASE_COLORS, GAIN_COLOR, PAIN_COLOR } from '$lib/constants/colors.js';

  let { data } = $props();

  const acts = $derived(data.activities as ExperienceActivity[]);

  let allStories = $derived.by(() => {
    const result: { story: ExperienceStory; taskTitle: string; actIndex: number }[] = [];
    for (let ai = 0; ai < acts.length; ai++) {
      for (const task of acts[ai].tasks) {
        for (const story of task.stories) {
          result.push({ story, taskTitle: task.title, actIndex: ai });
        }
      }
    }
    return result;
  });

  let actSpans = $derived.by(() => {
    const spans: { title: string; span: number; actors: string[] }[] = [];
    for (const act of acts) {
      let count = 0;
      for (const task of act.tasks) count += task.stories.length;
      if (count > 0) spans.push({ title: act.title, span: count, actors: act.actors });
    }
    return spans;
  });

  let taskSpans = $derived.by(() => {
    const spans: { title: string; span: number; actIndex: number }[] = [];
    for (let ai = 0; ai < acts.length; ai++) {
      for (const task of acts[ai].tasks) {
        if (task.stories.length > 0) {
          spans.push({ title: task.title, span: task.stories.length, actIndex: ai });
        }
      }
    }
    return spans;
  });

  let totalCols = $derived(allStories.length);

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

  function storyEmoji(s: ExperienceStory, index: number): string {
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
    <p class="mt-0.5 text-sm text-cork-500">Customer journey across all activities</p>
  </header>

  {#if totalCols === 0}
    <EmptyState
      icon={Route}
      title="No stories yet"
      description="Add stories to the story map to see the experience map"
    />
  {:else}
    <div
      class="xmap-scroll overflow-x-auto rounded-xl"
      style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ddd4c2;
				box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);
				min-height: calc(100vh - 180px);"
    >
      <div
        class="flex flex-col"
        style="min-width: {Math.max(700, totalCols * 155)}px; min-height: calc(100vh - 180px);"
      >
        <!-- Activity -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Activity
          </div>
          {#each actSpans as act, i}
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
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Actors
          </div>
          {#each actSpans as act}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-1.5 text-center"
              style="grid-column: span {act.span};"
            >
              <p class="text-sm text-cork-700">{act.actors.join(' ')}</p>
            </div>
          {/each}
        </div>

        <!-- Tasks -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Tasks
          </div>
          {#each taskSpans as task}
            <div
              class="flex items-center justify-center border-l border-cork-600/30 px-3 py-1.5 text-center"
              style="grid-column: span {task.span};"
            >
              <p class="text-sm font-bold text-cork-700">{task.title}</p>
            </div>
          {/each}
        </div>

        <!-- Stories -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Stories
          </div>
          {#each allStories as s}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <p class="text-center text-sm text-cork-800">{s.story.title}</p>
            </div>
          {/each}
        </div>

        <!-- Needs & Pains -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Needs &amp; Pains
          </div>
          {#each allStories as s}
            <div class="border-l border-cork-600/30 px-3 py-2">
              <div class="space-y-1.5">
                {#each s.story.gains as gain, i (i)}
                  <p class="text-xs italic" style="color: {GAIN_COLOR};">"{gain}"</p>
                {/each}
                {#each s.story.pains as pain, i (i)}
                  <p class="text-xs italic" style="color: {PAIN_COLOR};">"{pain}"</p>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Touchpoint -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Touchpoint
          </div>
          {#each allStories as s}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <span class="text-xs font-medium text-cork-700">{touchpointLabel(s.taskTitle)}</span>
            </div>
          {/each}
        </div>

        <!-- Feeling -->
        <div
          class="grid flex-1 border-b border-cork-600/30"
          style="grid-template-columns: 100px repeat({totalCols}, 1fr);"
        >
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Feeling
          </div>
          {#each allStories as s, i}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              <span class="text-2xl">{storyEmoji(s.story, i)}</span>
            </div>
          {/each}
        </div>

        <!-- Ownership -->
        <div class="grid flex-1" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
          <div
            class="flex items-center px-3 text-xs font-bold tracking-wider text-cork-500 uppercase"
          >
            Ownership
          </div>
          {#each allStories as s}
            <div class="flex items-center justify-center border-l border-cork-600/30 px-3 py-2">
              {#if s.story.pic}
                <p class="text-sm font-medium text-cork-700">{s.story.pic}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .xmap-scroll::-webkit-scrollbar {
    height: 6px;
  }
  .xmap-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .xmap-scroll::-webkit-scrollbar-thumb {
    background: rgba(92, 75, 58, 0.25);
    border-radius: 3px;
  }
  .xmap-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(92, 75, 58, 0.4);
  }
  .xmap-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(92, 75, 58, 0.25) transparent;
  }
</style>
