<script lang="ts">
  import { ArrowLeft, Info } from '@lucide/svelte';
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
  import '$lib/components/chinese-game/game.css';

  let selectedLevel = $state(1);
  let glossaryOpen = $state(false);
  let studiedTopicKeys = $state<string[]>([]);
  let studiedHsk2TopicKeys = $state<string[]>([]);
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

  onMount(() => {
    glossaryOpen = Boolean(history.state?.hskGrammarGlossary);

    const handlePopState = (event: PopStateEvent) => {
      glossaryOpen = Boolean(event.state?.hskGrammarGlossary);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  });

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
      href="/tools/chinese-game"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-cork-600 transition hover:text-cork-900"
    >
      <ArrowLeft class="size-3.5" /> Hanzi Game
    </a>

    <header class="mt-7">
      <div>
        <h1 class="font-display text-3xl text-cork-900 sm:text-4xl">HSK Course</h1>
        <p class="mt-2 max-w-xl text-sm leading-relaxed text-cork-600">
          A structured beginner path based on the Xiaoyu's Classroom topics in New HSK Course 1.
        </p>
      </div>
    </header>

    <nav class="mt-6" aria-label="HSK levels">
      <div
        class="hsk-level-scroll flex w-full gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:overflow-visible sm:pb-0"
      >
        {#each hskLevels as level}
          {@const isAvailable = level <= 2}
          <button
            type="button"
            disabled={!isAvailable}
            onclick={() => (selectedLevel = level)}
            class="w-28 shrink-0 rounded-lg border px-3 py-2 text-center text-sm font-medium transition sm:w-full {(level ===
              1 && allHsk1Studied) || (level === 2 && allHsk2Studied)
              ? 'cursor-pointer border-amber-500 bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-500 text-amber-950 shadow-sm shadow-amber-300/50'
              : selectedLevel === level
                ? 'cursor-pointer border-red-700 bg-red-700 text-white'
                : isAvailable
                  ? 'cursor-pointer border-cork-300 bg-white/75 text-cork-600'
                  : 'cursor-not-allowed border-cork-200 bg-cork-100/70 text-cork-400'}"
          >
            HSK {level}{isAvailable ? '' : ' · Soon'}
          </button>
        {/each}
      </div>
    </nav>

    {#if selectedLevel === 1}
      <div class="mt-6 rounded-xl border border-cork-200 bg-white/75 p-2 sm:p-6">
        <section aria-label="HSK 1 topics">
          <HskTopicAccordion
            topics={classroomTopics}
            getGuide={getBookTopicGuide}
            explanations={chineseExplanations}
            tables={topicTables}
            onStudiedChange={(topics) => (studiedTopicKeys = topics)}
          />
        </section>
      </div>
    {/if}
    {#if selectedLevel === 2}
      <div class="mt-6 rounded-xl border border-cork-200 bg-white/75 p-2 sm:p-6">
        <section aria-label="HSK 2 topics">
          <HskTopicAccordion
            topics={hsk2ClassroomTopics}
            getGuide={getHsk2TopicGuide}
            explanations={hsk2ChineseExplanations}
            tables={hsk2TopicTables}
            preferenceKey="hsk2StudiedTopics"
            onStudiedChange={(topics) => (studiedHsk2TopicKeys = topics)}
          />
        </section>
      </div>
    {/if}
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
