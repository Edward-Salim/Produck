<script lang="ts">
  import StoryMapBoard from '$lib/components/story-map/StoryMapBoard.svelte';
  import type { StoryMapData } from '$lib/types/story-map.js';
  import type { FrameworkInstance } from './types.js';
  import { Plus, X } from '@lucide/svelte';

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  let data = $state<StoryMapData>({
    product: '',
    actors: [],
    levels: 2,
    activities: [],
    stories: { 'must-have': [], performance: [], delighter: [] }
  });

  $effect(() => {
    try {
      const parsed = JSON.parse(instance.values.storyMap ?? '{}') as StoryMapData;
      data = {
        product: parsed.product ?? '',
        actors: parsed.actors ?? [],
        levels: parsed.levels ?? 2,
        activities: parsed.activities ?? [],
        stories: parsed.stories ?? { 'must-have': [], performance: [], delighter: [] }
      };
    } catch {
      // keep defaults
    }
  });

  function save() {
    onUpdate({ ...instance.values, storyMap: JSON.stringify(data) });
  }

  function addActor() {
    data = { ...data, actors: [...data.actors, { emoji: '🧑', label: 'New Actor' }] };
    save();
  }

  function updateActor(index: number, field: 'emoji' | 'label', value: string) {
    const actors = data.actors.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    data = { ...data, actors };
    save();
  }

  function removeActor(index: number) {
    const actors = data.actors.filter((_, i) => i !== index);
    data = { ...data, actors };
    save();
  }

  function addActivity() {
    const code = `A${data.activities.length + 1}`;
    data = {
      ...data,
      activities: [...data.activities, { id: code, title: 'New Activity', actors: [], tasks: [] }]
    };
    save();
  }

  function updateActivity(index: number, field: 'title', value: string) {
    const activities = data.activities.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    data = { ...data, activities };
    save();
  }

  function removeActivity(index: number) {
    const activities = data.activities.filter((_, i) => i !== index);
    data = { ...data, activities };
    save();
  }

  function addTask(actIndex: number) {
    const act = data.activities[actIndex];
    const code = `T${(act.tasks?.length ?? 0) + 1}`;
    const tasks = [...(act.tasks ?? []), { id: `${act.id}-${code}`, title: 'New Task' }];
    const activities = data.activities.map((a, i) => (i === actIndex ? { ...a, tasks } : a));
    data = { ...data, activities };
    save();
  }

  function updateTask(actIndex: number, taskIndex: number, title: string) {
    const activities = data.activities.map((a, i) => {
      if (i !== actIndex || !a.tasks) return a;
      const tasks = a.tasks.map((t, j) => (j === taskIndex ? { ...t, title } : t));
      return { ...a, tasks };
    });
    data = { ...data, activities };
    save();
  }

  function removeTask(actIndex: number, taskIndex: number) {
    const activities = data.activities.map((a, i) => {
      if (i !== actIndex || !a.tasks) return a;
      const tasks = a.tasks.filter((_, j) => j !== taskIndex);
      return { ...a, tasks };
    });
    data = { ...data, activities };
    save();
  }

  const KANO_LABELS: Record<string, string> = {
    'must-have': 'Must Have',
    performance: 'Performance',
    delighter: 'Delighter'
  };
</script>

<div class="space-y-4">
  {#if draftMode === 'edit'}
    <div class="space-y-4 rounded-xl border border-cork-300/50 bg-white/60 p-4">
      <label class="block">
        <span class="text-xs font-medium text-cork-700">Product Name</span>
        <input
          value={data.product}
          class="mt-1 w-full rounded border border-cork-300/50 bg-cork-100 px-2 py-1.5 text-sm text-cork-800 outline-none"
          oninput={(e) => {
            data = { ...data, product: e.currentTarget.value };
            save();
          }}
        />
      </label>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-medium text-cork-700">Actors</span>
          <button
            type="button"
            class="cursor-pointer text-xs text-cork-500 hover:text-cork-700"
            onclick={addActor}
          >
            <Plus class="inline size-3" /> Add
          </button>
        </div>
        <div class="space-y-1.5">
          {#each data.actors as actor, i (i)}
            <div class="flex items-center gap-2">
              <input
                value={actor.emoji}
                class="w-10 rounded border border-cork-300/50 bg-cork-100 px-1 py-1 text-center text-sm outline-none"
                oninput={(e) => updateActor(i, 'emoji', e.currentTarget.value)}
              />
              <input
                value={actor.label}
                class="flex-1 rounded border border-cork-300/50 bg-cork-100 px-2 py-1 text-xs outline-none"
                oninput={(e) => updateActor(i, 'label', e.currentTarget.value)}
              />
              <button
                type="button"
                class="cursor-pointer text-cork-300 hover:text-red-500"
                onclick={() => removeActor(i)}><X class="size-3.5" /></button
              >
            </div>
          {/each}
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-medium text-cork-700">Activities</span>
          <button
            type="button"
            class="cursor-pointer text-xs text-cork-500 hover:text-cork-700"
            onclick={addActivity}
          >
            <Plus class="inline size-3" /> Add
          </button>
        </div>
        <div class="space-y-2">
          {#each data.activities as act, i (act.id)}
            <div class="rounded border border-cork-300/40 bg-cork-100 p-2">
              <div class="mb-2 flex items-center gap-2">
                <span class="font-mono text-[10px] text-cork-400">{act.id}</span>
                <input
                  value={act.title}
                  class="flex-1 rounded border border-cork-300/50 bg-white px-2 py-1 text-xs outline-none"
                  oninput={(e) => updateActivity(i, 'title', e.currentTarget.value)}
                />
                <button
                  type="button"
                  class="cursor-pointer text-cork-300 hover:text-red-500"
                  onclick={() => removeActivity(i)}><X class="size-3.5" /></button
                >
              </div>
              <div class="space-y-1 pl-4">
                {#each act.tasks ?? [] as task, j (task.id)}
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[9px] text-cork-400">{task.id}</span>
                    <input
                      value={task.title}
                      class="flex-1 rounded border border-cork-300/50 bg-white px-2 py-1 text-[10px] outline-none"
                      oninput={(e) => updateTask(i, j, e.currentTarget.value)}
                    />
                    <button
                      type="button"
                      class="cursor-pointer text-cork-300 hover:text-red-500"
                      onclick={() => removeTask(i, j)}><X class="size-3" /></button
                    >
                  </div>
                {/each}
                <button
                  type="button"
                  class="cursor-pointer text-[10px] text-cork-400 hover:text-cork-600"
                  onclick={() => addTask(i)}
                >
                  <Plus class="inline size-2.5" /> Add Task
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div>
        <span class="text-xs font-medium text-cork-700">Stories</span>
        <div class="mt-2 grid gap-2 md:grid-cols-3">
          {#each ['must-have', 'performance', 'delighter'] as const as kano (kano)}
            <div class="rounded border border-cork-300/40 bg-cork-100 p-2">
              <div class="mb-1.5 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-cork-600">{KANO_LABELS[kano]}</span>
                <span class="text-[9px] text-cork-400">{data.stories[kano].length}</span>
              </div>
              <div class="space-y-1">
                {#each data.stories[kano] as story (story.id)}
                  <div class="rounded bg-white px-2 py-1.5">
                    <div class="flex items-center gap-1.5">
                      <span class="shrink-0 font-mono text-[9px] text-cork-400">{story.id}</span>
                      <span class="text-[10px] leading-tight font-medium text-cork-800"
                        >{story.title}</span
                      >
                    </div>
                    {#if story.asA || story.wantTo || story.soThat}
                      <p class="mt-0.5 pl-7 text-[9px] leading-relaxed text-cork-500 italic">
                        As a <strong class="text-cork-600">{story.asA || 'user'}</strong>, I want to
                        <strong class="text-cork-600">{story.wantTo || '...'}</strong>, so that
                        <strong class="text-cork-600">{story.soThat || '...'}</strong>.
                      </p>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if data.activities.length > 0}
    <StoryMapBoard {data} />
  {:else}
    <div class="rounded-xl border border-cork-300/40 bg-cork-100 px-4 py-16 text-center">
      <p class="text-sm text-cork-500">
        No activities yet. Add activities and stories via the database.
      </p>
    </div>
  {/if}
</div>
