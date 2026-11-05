<script lang="ts">
  import type { BookStory } from '$lib/data/book-summaries.js';
  import StoryPopover from './StoryPopover.svelte';

  let {
    text,
    label = false,
    stories = []
  }: {
    text: string;
    label?: boolean;
    stories?: BookStory[];
  } = $props();

  const segments = $derived.by(() => {
    const result = text
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part) => {
        const bold = /^\*\*[^*]+\*\*$/.test(part);
        return { text: bold ? part.slice(2, -2) : part, bold };
      });

    if (label && result.length && !result[0].bold) {
      const match = result[0].text.match(/^([^:\n]+:)(\s+[\s\S]*)$/);
      if (match) {
        result.splice(0, 1, { text: match[1], bold: true }, { text: match[2], bold: false });
      }
    }

    const availableStories = stories.filter((story) => story.phrase.length > 0);
    return result.flatMap((segment) => {
      const pieces: { text: string; bold: boolean; story?: BookStory }[] = [];
      let remaining = segment.text;

      while (remaining) {
        let next: { index: number; story: BookStory } | undefined;
        for (const story of availableStories) {
          const index = remaining.indexOf(story.phrase);
          if (
            index >= 0 &&
            (!next ||
              index < next.index ||
              (index === next.index && story.phrase.length > next.story.phrase.length))
          ) {
            next = { index, story };
          }
        }
        if (!next) {
          pieces.push({ ...segment, text: remaining });
          break;
        }
        if (next.index > 0) pieces.push({ ...segment, text: remaining.slice(0, next.index) });
        pieces.push({ ...segment, text: next.story.phrase, story: next.story });
        remaining = remaining.slice(next.index + next.story.phrase.length);
      }

      return pieces;
    });
  });
</script>

{#each segments as segment, index (index)}
  {#if segment.story}
    <StoryPopover story={segment.story} bold={segment.bold} />
  {:else if segment.bold}
    <strong class="font-semibold">{segment.text}</strong>
  {:else}
    {segment.text}
  {/if}
{/each}
