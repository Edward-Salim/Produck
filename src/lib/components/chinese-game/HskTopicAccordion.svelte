<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import ElegantCurlyText from './ElegantCurlyText.svelte';

  type Lesson = {
    number: number;
    hanzi: string;
    pinyin: string;
    title: string;
    page: string;
    classroom: string[];
  };

  type ClassroomTopic = {
    title: string;
    lesson: Lesson;
  };

  type TopicGuide = {
    summary: string;
    pattern: string;
    examples: (string | { a: string; b: string })[];
    exampleLabel?: string;
    useTableSections?: boolean;
    blocks?: {
      title?: string;
      zh?: string;
      en?: string;
      exampleLabel?: string;
      examples: (string | { a: string; b: string })[];
    }[];
  };

  type TopicTable = {
    title?: string;
    zh?: string;
    en?: string;
    readAloud?: boolean;
    centerCells?: boolean;
    fluidColumns?: boolean;
    examples?: string[];
    headers?: string[];
    rows: string[][];
  };

  let {
    topics,
    getGuide,
    explanations,
    tables,
    preferenceKey = 'hskStudiedTopics',
    onStudiedChange
  }: {
    topics: ClassroomTopic[];
    getGuide: (title: string) => TopicGuide | undefined;
    explanations: Record<string, string>;
    tables: Record<string, TopicTable[]>;
    preferenceKey?: 'hskStudiedTopics' | 'hsk2StudiedTopics';
    onStudiedChange?: (studiedTopics: string[]) => void;
  } = $props();

  let openTopic = $state('汉语的基本语序 · Basic Word Order in Chinese');
  let studiedTopics = $state<string[]>([]);
  let savingTopics = $state<string[]>([]);
  let loadingStudiedTopics = $state(true);
  const openTopicStorageKey = `${preferenceKey}-open-classroom-topic`;

  onMount(async () => {
    const savedOpenTopic = localStorage.getItem(openTopicStorageKey);
    if (
      savedOpenTopic !== null &&
      (savedOpenTopic === '' || topics.some((topic) => topic.title === savedOpenTopic))
    ) {
      openTopic = savedOpenTopic;
    }

    try {
      const response = await fetch('/api/preferences');
      if (!response.ok) return;
      const preferences = (await response.json()) as Record<string, unknown>;
      studiedTopics = Array.isArray(preferences[preferenceKey])
        ? (preferences[preferenceKey] as string[])
        : [];
      onStudiedChange?.(studiedTopics);
    } finally {
      loadingStudiedTopics = false;
    }
  });

  function toggleOpenTopic(title: string) {
    openTopic = openTopic === title ? '' : title;
    localStorage.setItem(openTopicStorageKey, openTopic);
  }

  async function toggleStudied(topic: ClassroomTopic) {
    const key = topic.title.split(' · ')[0];
    if (savingTopics.length > 0) return;

    const previous = studiedTopics;
    studiedTopics = studiedTopics.includes(key)
      ? studiedTopics.filter((topicKey) => topicKey !== key)
      : [...studiedTopics, key];
    onStudiedChange?.(studiedTopics);
    savingTopics = [...savingTopics, key];

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [preferenceKey]: studiedTopics })
      });
      if (!response.ok) {
        studiedTopics = previous;
        onStudiedChange?.(studiedTopics);
      }
    } catch {
      studiedTopics = previous;
      onStudiedChange?.(studiedTopics);
    } finally {
      savingTopics = savingTopics.filter((topicKey) => topicKey !== key);
    }
  }
</script>

<div class="space-y-1">
  {#each topics as topic, index (topic.title)}
    {@const studiedKey = topic.title.split(' · ')[0]}
    {@const isStudied = studiedTopics.includes(studiedKey)}
    <article
      class="border-l-2 {openTopic === topic.title
        ? 'border-red-700 bg-red-50/70'
        : 'border-transparent'}"
    >
      <div class="flex items-start gap-2 px-2 py-3.5 sm:gap-3 sm:px-3 sm:py-4">
        <button
          type="button"
          onclick={() => toggleStudied(topic)}
          disabled={loadingStudiedTopics || savingTopics.includes(studiedKey)}
          class="relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200 before:absolute before:-inset-2 before:content-[''] {loadingStudiedTopics
            ? 'progress-gold-loading border-yellow-300/70 text-yellow-900/60'
            : isStudied
              ? 'gold-plated border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
              : 'border-cork-300/40 bg-cork-100/50 text-cork-600'} disabled:cursor-wait"
          aria-label={loadingStudiedTopics
            ? `Loading studied status: ${topic.title}`
            : `${isStudied ? 'Mark as not studied' : 'Mark as studied'}: ${topic.title}`}
          aria-pressed={isStudied}
          title={isStudied ? 'Studied' : 'Mark as studied'}
        >
          {index + 1}
        </button>
        <button
          type="button"
          onclick={() => toggleOpenTopic(topic.title)}
          class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-0.5 text-left sm:gap-3"
          aria-expanded={openTopic === topic.title}
        >
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-cork-900">
              <ElegantCurlyText text={topic.title} />
            </span>
            <span class="mt-1 block text-xs text-cork-500">Lesson {topic.lesson.number}</span>
          </span>
          <ChevronRight
            class="size-4 shrink-0 text-cork-400 transition-transform duration-200 {openTopic ===
            topic.title
              ? 'rotate-90'
              : ''}"
          />
        </button>
      </div>

      {#if openTopic === topic.title}
        {@const chineseTitle = topic.title.split(' · ')[0]}
        {@const guide = getGuide(topic.title)}
        {@const table = tables[chineseTitle]}
        <div class="overflow-hidden" transition:slide={{ duration: 180 }}>
          <div class="border-t border-cork-200 px-3 py-4 sm:pr-4 sm:pl-12">
            {#if !guide?.blocks && !guide?.useTableSections && explanations[chineseTitle]}
              <p class="text-sm leading-7 text-cork-800">
                <ElegantCurlyText text={explanations[chineseTitle]} spacedQuotes />
              </p>
            {/if}
            {#if guide}
              {#if guide.blocks}
                {#each guide.blocks as block, blockIndex (`${chineseTitle}-block-${blockIndex}`)}
                  <div class:mt-5={blockIndex > 0}>
                    {#if block.title}
                      <p class="mb-2 text-xs font-semibold text-red-700">
                        <ElegantCurlyText text={block.title} />
                      </p>
                    {/if}
                    {#if block.zh}
                      <p class="text-sm leading-7 text-cork-800">
                        <ElegantCurlyText text={block.zh} spacedQuotes />
                      </p>
                    {/if}
                    {#if block.en}
                      <p class="mt-2 text-sm leading-relaxed text-cork-600">
                        <ElegantCurlyText text={block.en} />
                      </p>
                    {/if}
                    {#if block.examples.length}
                      <div class="mt-4 border-l-2 border-red-300 pl-3 sm:pl-4">
                        <p class="text-[10px] font-semibold tracking-wider text-cork-500 uppercase">
                          {block.exampleLabel ?? '大声朗读 · Read aloud'}
                        </p>
                        <ol class="mt-2 space-y-1.5 text-base leading-7 text-cork-900">
                          {#each block.examples as example, exampleIndex (example)}
                            <li class="flex gap-2">
                              <span class="w-8 shrink-0 text-right text-xs leading-7 text-cork-400">
                                （{exampleIndex + 1}）
                              </span>
                              {#if typeof example === 'string'}
                                <span><ElegantCurlyText text={example} /></span>
                              {:else}
                                <span class="grid flex-1 gap-y-1">
                                  <span class="grid grid-cols-[2rem_1fr]">
                                    <strong class="font-semibold">A：</strong>
                                    <ElegantCurlyText text={example.a} />
                                  </span>
                                  <span class="grid grid-cols-[2rem_1fr]">
                                    <strong class="font-semibold">B：</strong>
                                    <ElegantCurlyText text={example.b} />
                                  </span>
                                </span>
                              {/if}
                            </li>
                          {/each}
                        </ol>
                      </div>
                    {/if}
                  </div>
                {/each}
              {:else if !guide.useTableSections}
                <p class="mt-2 text-sm leading-relaxed text-cork-600">
                  <ElegantCurlyText text={guide.summary} />
                </p>
              {/if}
              {#if !guide.blocks && table}
                {#each table as tableSection, tableIndex (`${chineseTitle}-table-${tableIndex}`)}
                  <div class="mt-4">
                    {#if tableSection.title}
                      <p class="mb-1.5 text-xs font-semibold {tableSection.readAloud
                        ? 'text-red-700'
                        : 'text-cork-700'}">
                        <ElegantCurlyText text={tableSection.title} />
                      </p>
                    {/if}
                    {#if tableSection.zh}
                      <p class="mb-2 text-sm leading-7 text-cork-800">
                        <ElegantCurlyText text={tableSection.zh} spacedQuotes />
                      </p>
                    {/if}
                    {#if tableSection.en}
                      <p class="mb-2 text-sm leading-relaxed text-cork-600">
                        <ElegantCurlyText text={tableSection.en} />
                      </p>
                    {/if}
                    {#if tableSection.readAloud}
                      <p class="mb-2 text-[10px] font-semibold tracking-wider text-cork-500 uppercase">
                        大声朗读 · Read aloud
                      </p>
                    {/if}
                    {#if tableSection.rows.length}
                    <div
                      class="max-w-full touch-pan-x overflow-x-auto overscroll-x-contain rounded-lg border border-cork-200 bg-white [-webkit-overflow-scrolling:touch]"
                      tabindex="0"
                      aria-label={`${tableSection.title ?? chineseTitle} table; swipe horizontally to see more columns`}
                    >
                      {#if tableSection.fluidColumns}
                        <div class="min-w-md text-sm">
                          {#each tableSection.rows as row, rowIndex (`${chineseTitle}-${tableIndex}-${rowIndex}`)}
                            <div
                              class="grid border-b border-cork-100 last:border-b-0 even:bg-cork-50/60"
                              style={`grid-template-columns: repeat(${row.length}, minmax(0, 1fr));`}
                            >
                              {#each row as cell, cellIndex (`${rowIndex}-${cellIndex}`)}
                                <div class="px-3 py-2 whitespace-pre-line text-cork-800">
                                  <ElegantCurlyText text={cell} />
                                </div>
                              {/each}
                            </div>
                          {/each}
                        </div>
                      {:else}<table
                          class="w-full border-collapse text-left text-sm {tableSection.rows[0]
                            ?.length >= 8
                            ? 'min-w-[760px] table-fixed'
                            : 'min-w-md'}"
                        >
                        {#if tableSection.headers?.length}
                          <thead class="bg-cork-100 text-cork-700">
                            <tr>
                              {#each tableSection.headers as header (header)}
                                <th class="border-b border-cork-200 px-3 py-2 font-semibold {tableSection.centerCells ? 'text-center' : ''}">
                                  <ElegantCurlyText text={header} />
                                </th>
                              {/each}
                            </tr>
                          </thead>
                        {/if}
                        <tbody>
                          {#each tableSection.rows as row, rowIndex (`${chineseTitle}-${tableIndex}-${rowIndex}`)}
                            <tr class="even:bg-cork-50/60">
                              {#each row as cell, cellIndex (`${rowIndex}-${cellIndex}`)}
                                <td
                                  class="border-b border-cork-100 py-2 whitespace-pre-line text-cork-800 {tableSection
                                    .rows[0]?.length >= 8
                                    ? 'px-1 text-center'
                                    : 'px-3'} {tableSection.centerCells ? 'text-center leading-8' : ''}"
                                >
                                  <ElegantCurlyText text={cell} />
                                </td>
                              {/each}
                            </tr>
                          {/each}
                        </tbody>
                        </table>
                      {/if}
                    </div>
                    {/if}
                    {#if tableSection.examples?.length}
                      <ol class="mt-2 space-y-1.5 text-base leading-7 text-cork-900">
                        {#each tableSection.examples as example, exampleIndex (example)}
                          <li class="flex gap-2">
                            <span class="w-8 shrink-0 text-right text-xs leading-7 text-cork-400">
                              （{exampleIndex + 1}）
                            </span>
                            <span><ElegantCurlyText text={example} /></span>
                          </li>
                        {/each}
                      </ol>
                    {/if}
                  </div>
                {/each}
              {/if}
              {#if !guide.blocks && guide.examples.length}
                <div class="mt-4 border-l-2 border-red-300 pl-3 sm:pl-4">
                  <p class="text-[10px] font-semibold tracking-wider text-cork-500 uppercase">
                    {guide.exampleLabel ?? '大声朗读 · Read aloud'}
                  </p>
                  <ol class="mt-2 space-y-1.5 text-base leading-7 text-cork-900">
                    {#each guide.examples as example, exampleIndex (example)}
                      <li class="flex gap-2">
                        <span class="w-8 shrink-0 text-right text-xs leading-7 text-cork-400">
                          （{exampleIndex + 1}）
                        </span>
                        {#if typeof example === 'string'}
                          <span><ElegantCurlyText text={example} /></span>
                        {:else}
                          <span class="grid flex-1 gap-y-1">
                            <span class="grid grid-cols-[2rem_1fr]">
                              <strong class="font-semibold">A：</strong>
                              <ElegantCurlyText text={example.a} />
                            </span>
                            <span class="grid grid-cols-[2rem_1fr]">
                              <strong class="font-semibold">B：</strong>
                              <ElegantCurlyText text={example.b} />
                            </span>
                          </span>
                        {/if}
                      </li>
                    {/each}
                  </ol>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      {/if}
    </article>
  {/each}
</div>

<style>
  @keyframes progress-gold-sweep {
    0% {
      background-position: 140% 0;
    }
    100% {
      background-position: -40% 0;
    }
  }

  .progress-gold-loading {
    background: linear-gradient(110deg, #fef3c7 20%, #fde68a 42%, #facc15 50%, #fde68a 58%, #fef3c7 80%);
    background-size: 240% 100%;
    animation: progress-gold-sweep 1.15s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-gold-loading {
      animation: none;
      background: #fef3c7;
    }
  }
</style>
