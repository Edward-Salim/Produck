<script lang="ts">
  import { X } from '@lucide/svelte';

  type GrammarTerm = {
    term: string;
    chinese: string;
    definition: string;
    example: string;
    breakdown: string;
  };

  let { open, onClose }: { open: boolean; onClose: () => void } = $props();

  const terms: GrammarTerm[] = [
    {
      term: 'Noun',
      chinese: '名词',
      definition: 'A word naming a person, place, thing, time, or idea.',
      example: '老师、学校、苹果、今天',
      breakdown: 'teacher · school · apple · today'
    },
    {
      term: 'Verb',
      chinese: '动词',
      definition: 'A word expressing an action, occurrence, or state.',
      example: '吃、学习、喜欢、是',
      breakdown: 'eat · study · like · be'
    },
    {
      term: 'Adjective',
      chinese: '形容词',
      definition: 'A word describing a quality or condition.',
      example: '妹妹很高兴。',
      breakdown: '高兴 (adjective) · happy'
    },
    {
      term: 'Pronoun',
      chinese: '代词',
      definition: 'A word used in place of a noun or to ask about something.',
      example: '我、你、他、谁、什么',
      breakdown: 'I · you · he · who · what'
    },
    {
      term: 'Adverb',
      chinese: '副词',
      definition: 'A word modifying a verb or adjective, often showing degree, time, or negation.',
      example: '妹妹很高兴。',
      breakdown: '很 (adverb) · very'
    },
    {
      term: 'Preposition',
      chinese: '介词',
      definition: 'A word introducing information such as place, direction, time, or the person involved.',
      example: '我在医院工作。',
      breakdown: '在医院 · at the hospital'
    },
    {
      term: 'Conjunction',
      chinese: '连词',
      definition: 'A word connecting words, phrases, or clauses.',
      example: '我和我的朋友',
      breakdown: '和 · and'
    },
    {
      term: 'Particle',
      chinese: '助词',
      definition: 'A functional word that adds grammatical meaning or tone.',
      example: '你忙吗？这是我的书。',
      breakdown: '吗 marks a question · 的 marks attribution or possession'
    },
    {
      term: 'Numeral',
      chinese: '数词',
      definition: 'A word expressing a number or numerical order.',
      example: '一、二、三、第一',
      breakdown: 'one · two · three · first'
    },
    {
      term: 'Measure word',
      chinese: '量词',
      definition: 'A counting word generally placed between a number or demonstrative and a noun.',
      example: '三个学生',
      breakdown: '三 (number) + 个 (measure word) + 学生 (noun)'
    },
    {
      term: 'Numeral-measure word',
      chinese: '数量词',
      definition: 'A numeral and measure word used together as one quantity expression.',
      example: '三个学生',
      breakdown: '三个 (numeral-measure word) + 学生 (noun)'
    },
    {
      term: 'Interjection',
      chinese: '叹词',
      definition: 'A standalone word expressing a feeling, reaction, greeting, or response.',
      example: '啊！喂！',
      breakdown: 'Ah! · Hello!'
    },
    {
      term: 'Onomatopoeia',
      chinese: '拟声词',
      definition: 'A word that imitates a sound.',
      example: '小狗汪汪叫。',
      breakdown: '汪汪 · woof-woof'
    },
    {
      term: 'Modal verb',
      chinese: '能愿动词',
      definition: 'A verb placed before another verb to express ability, intention, permission, or possibility.',
      example: '我会说汉语。',
      breakdown: '会 (can/know how to) + 说 (speak)'
    },
    {
      term: 'Prefix',
      chinese: '前缀',
      definition: 'A word element placed before a root or base word.',
      example: '第一个',
      breakdown: '第- (prefix) + 一个 (one)'
    },
    {
      term: 'Suffix',
      chinese: '后缀',
      definition: 'A word element placed after a root or base word.',
      example: '孩子们',
      breakdown: '孩子 (children) + -们 (plural suffix)'
    }
  ];

  function handleKeydown(event: KeyboardEvent) {
    if (open && event.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-6"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      onclick={onClose}
      aria-label="Close grammar terms"
    ></button>
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="grammar-glossary-title"
      class="relative z-10 flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-cork-300 bg-[#f3eadc] shadow-2xl sm:rounded-2xl"
    >
      <header class="flex items-start gap-3 border-b border-cork-200 px-4 py-4 sm:px-6">
        <div class="min-w-0 flex-1">
          <h2 id="grammar-glossary-title" class="font-display text-xl text-cork-900">
            Grammar Terms
          </h2>
          <p class="mt-1 text-xs leading-relaxed text-cork-600">
            Plain-language definitions for terms used throughout Xiaoyu’s Classroom.
          </p>
        </div>
        <button
          type="button"
          onclick={onClose}
          class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-cork-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          aria-label="Close grammar terms"
        >
          <X class="size-5" />
        </button>
      </header>

      <div class="glossary-scroll overflow-y-auto p-3 sm:p-5">
        {#each terms as item (item.term)}
          <article class="border-b border-cork-300 px-2 py-4 last:border-b-0 sm:px-3">
            <h3 class="flex flex-wrap items-baseline gap-x-2 font-semibold text-cork-900">
              <span>{item.term}</span>
              <span class="text-sm font-medium text-red-800">{item.chinese}</span>
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-cork-700">{item.definition}</p>
            <div class="mt-3 rounded-lg bg-cork-100/80 px-3 py-2.5">
              <p class="text-base text-cork-900">{item.example}</p>
              <p class="mt-1 text-xs leading-relaxed text-cork-600">{item.breakdown}</p>
            </div>
          </article>
        {/each}
      </div>
    </section>
  </div>
{/if}

<style>
  .glossary-scroll {
    background: #f3eadc;
    overscroll-behavior: contain;
    scrollbar-color: #9f9485 transparent;
    scrollbar-width: thin;
  }

  .glossary-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .glossary-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .glossary-scroll::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background: #9f9485;
    background-clip: padding-box;
  }
</style>
