<script lang="ts">
  import { ArrowLeft, Info, Search, X } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import InkWashBg from '$lib/components/chinese-game/InkWashBg.svelte';
  import HskGrammarGlossaryModal from '$lib/components/chinese-game/HskGrammarGlossaryModal.svelte';
  import HskTopicAccordion from '$lib/components/chinese-game/HskTopicAccordion.svelte';
  import {
    chineseExplanations,
    classroomTopics,
    getBookTopicGuide,
    hskLevels,
    topicTables
  } from '$lib/data/hsk1-course.js';
  import {
    getHsk2TopicGuide,
    hsk2ChineseExplanations,
    hsk2ClassroomTopics,
    hsk2TopicTables
  } from '$lib/data/hsk2-course.js';
  import {
    getHsk3TopicGuide,
    hsk3ChineseExplanations,
    hsk3ClassroomTopics,
    hsk3TopicTables
  } from '$lib/data/hsk3-course.js';
  import '$lib/components/chinese-game/game.css';

  let selectedLevel = $state(1);
  let glossaryOpen = $state(false);
  let searchQuery = $state('');
  let studiedTopicKeys = $state<string[]>([]);
  let studiedHsk2TopicKeys = $state<string[]>([]);
  let studiedHsk3TopicKeys = $state<string[]>([]);
  let allHsk1Studied = $derived(
    classroomTopics.length > 0 &&
      classroomTopics.every((topic) => studiedTopicKeys.includes(topic.title.split(' · ')[0]))
  );
  let allHsk2Studied = $derived(
    hsk2ClassroomTopics.length > 0 &&
      hsk2ClassroomTopics.every((topic) =>
        studiedHsk2TopicKeys.includes(topic.title.split(' · ')[0])
      )
  );
  let allHsk3Studied = $derived(
    hsk3ClassroomTopics.length > 0 &&
      hsk3ClassroomTopics.every((topic) =>
        studiedHsk3TopicKeys.includes(topic.title.split(' · ')[0])
      )
  );

  onMount(() => {
    glossaryOpen = Boolean(history.state?.hskGrammarGlossary);
    const savedLevel = Number(localStorage.getItem('selected-hsk-course-level'));
    if (savedLevel === 1 || savedLevel === 2 || savedLevel === 3) selectedLevel = savedLevel;

    const handlePopState = (event: PopStateEvent) => {
      glossaryOpen = Boolean(event.state?.hskGrammarGlossary);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  });

  function selectLevel(level: number) {
    if (level > 3) return;
    selectedLevel = level;
    localStorage.setItem('selected-hsk-course-level', String(level));
  }

  function openGlossary() {
    if (glossaryOpen) return;
    history.pushState({ ...history.state, hskGrammarGlossary: true }, '');
    glossaryOpen = true;
  }

  function closeGlossary() {
    if (history.state?.hskGrammarGlossary) {
      history.back();
    } else {
      glossaryOpen = false;
    }
  }
</script>

<svelte:head>
  <title>HSK Course | Produck</title>
</svelte:head>

<div class="game-container min-h-screen bg-cork-50">
  <InkWashBg />

  <main class="relative mx-auto max-w-3xl px-4 py-7 pb-14 sm:px-6 md:py-10">
    <a
      href="/chinese-learning"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-cork-600 transition hover:text-cork-900"
    >
      <ArrowLeft class="size-3.5" /> Chinese Learning
    </a>

    <header class="mt-7">
      <div>
        <h1 class="font-display text-3xl text-cork-900 sm:text-4xl">HSK Course</h1>
        <p class="mt-2 max-w-xl text-sm leading-relaxed text-cork-600">
          Xiaoyu’s Classroom topics from the New HSK Course series.
        </p>
      </div>
    </header>

    <nav class="mt-6" aria-label="HSK levels">
      <div
        class="hsk-level-scroll flex w-full gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:overflow-visible sm:pb-0"
      >
        {#each hskLevels as level}
          {@const isAvailable = level <= 3}
          {@const isComplete =
            (level === 1 && allHsk1Studied) ||
            (level === 2 && allHsk2Studied) ||
            (level === 3 && allHsk3Studied)}
          <button
            type="button"
            disabled={!isAvailable}
            onclick={() => selectLevel(level)}
            class="w-28 shrink-0 rounded-lg border px-3 py-2 text-center text-sm font-medium transition sm:w-full {isComplete
              ? selectedLevel === level
                ? 'cursor-pointer border-amber-500 bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-500 text-amber-950 shadow-sm shadow-amber-300/50'
                : 'cursor-pointer border-amber-300/70 bg-amber-100/55 text-amber-800/70 shadow-none'
              : selectedLevel === level
                ? 'cursor-pointer border-red-700 bg-red-700 text-white'
                : isAvailable
                  ? level === 3
                    ? 'cursor-pointer border-cork-200 bg-cork-100/70 text-cork-400'
                    : 'cursor-pointer border-cork-300 bg-white/75 text-cork-600'
                  : 'cursor-not-allowed border-cork-200 bg-cork-100/70 text-cork-400'}"
          >
            HSK {level}{isAvailable ? '' : ' · Soon'}
          </button>
        {/each}
      </div>
    </nav>

    <div
      class="mt-6 rounded-xl border border-cork-200 bg-white/75 p-2 sm:p-6"
      class:hidden={selectedLevel !== 1}
    >
      <div class="relative mb-3 sm:mb-5">
        <Search
          class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cork-400"
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search grammar, Hanzi, pinyin, or examples"
          aria-label="Search HSK 1 classroom topics"
          class="h-11 w-full rounded-xl border border-cork-200 bg-cork-50/70 pr-11 pl-10 text-sm text-cork-900 outline-none placeholder:text-cork-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-cork-500 focus-visible:outline-2 focus-visible:outline-red-700"
            aria-label="Clear search"
          >
            <X class="size-4" />
          </button>
        {/if}
      </div>
      <section aria-label="HSK 1 topics">
        <HskTopicAccordion
          topics={classroomTopics}
          getGuide={getBookTopicGuide}
          explanations={chineseExplanations}
          tables={topicTables}
          {searchQuery}
          onStudiedChange={(topics) => (studiedTopicKeys = topics)}
        />
      </section>
    </div>
    <div
      class="mt-6 rounded-xl border border-cork-200 bg-white/75 p-2 sm:p-6"
      class:hidden={selectedLevel !== 2}
    >
      <div class="relative mb-3 sm:mb-5">
        <Search
          class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cork-400"
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search grammar, Hanzi, pinyin, or examples"
          aria-label="Search HSK 2 classroom topics"
          class="h-11 w-full rounded-xl border border-cork-200 bg-cork-50/70 pr-11 pl-10 text-sm text-cork-900 outline-none placeholder:text-cork-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-cork-500 focus-visible:outline-2 focus-visible:outline-red-700"
            aria-label="Clear search"
          >
            <X class="size-4" />
          </button>
        {/if}
      </div>
      <section aria-label="HSK 2 topics">
        <HskTopicAccordion
          topics={hsk2ClassroomTopics}
          getGuide={getHsk2TopicGuide}
          explanations={hsk2ChineseExplanations}
          tables={hsk2TopicTables}
          {searchQuery}
          preferenceKey="hsk2StudiedTopics"
          onStudiedChange={(topics) => (studiedHsk2TopicKeys = topics)}
        />
      </section>
    </div>
    <div
      class="mt-6 rounded-xl border border-cork-200 bg-white/75 p-2 sm:p-6"
      class:hidden={selectedLevel !== 3}
    >
      <div class="relative mb-3 sm:mb-5">
        <Search
          class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cork-400"
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search grammar, Hanzi, pinyin, or examples"
          aria-label="Search HSK 3 classroom topics"
          class="h-11 w-full rounded-xl border border-cork-200 bg-cork-50/70 pr-11 pl-10 text-sm text-cork-900 outline-none placeholder:text-cork-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-cork-500 focus-visible:outline-2 focus-visible:outline-red-700"
            aria-label="Clear search"
          >
            <X class="size-4" />
          </button>
        {/if}
      </div>
      <section aria-label="HSK 3 topics">
        <HskTopicAccordion
          topics={hsk3ClassroomTopics}
          getGuide={getHsk3TopicGuide}
          explanations={hsk3ChineseExplanations}
          tables={hsk3TopicTables}
          {searchQuery}
          preferenceKey="hsk3StudiedTopics"
          onStudiedChange={(topics) => (studiedHsk3TopicKeys = topics)}
        />
      </section>
    </div>
  </main>
</div>

<button
  type="button"
  onclick={openGlossary}
  class="fixed right-5 bottom-5 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-cork-300 bg-cork-100/95 text-cork-700 shadow-md shadow-cork-900/10 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:right-7 sm:bottom-7"
  aria-label="Open grammar terms glossary"
  title="Grammar terms"
>
  <Info class="size-5" />
</button>

<HskGrammarGlossaryModal open={glossaryOpen} onClose={closeGlossary} />

<style>
  .hsk-level-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hsk-level-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
