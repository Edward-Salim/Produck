<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { BookStory } from '$lib/data/book-summaries.js';

  let { story, bold = false }: { story: BookStory; bold?: boolean } = $props();
</script>

<Popover.Root>
  <Popover.Trigger
    type="button"
    aria-label={`Read story: ${story.phrase}`}
    class="cursor-pointer text-left underline decoration-cork-400 decoration-dotted underline-offset-4 hover:decoration-cork-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cork-700"
  >
    {#if bold}
      <strong class="font-semibold">{story.phrase}</strong>
    {:else}
      {story.phrase}
    {/if}
  </Popover.Trigger><!-- Keep the portal adjacent so inline punctuation gets no extra space.
  --><Popover.Portal
  >
    <Popover.Content
      side="bottom"
      align="start"
      sideOffset={8}
      collisionPadding={16}
      role="dialog"
      aria-label={story.title}
      class="z-[60] w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-cork-300 bg-cork-50 p-1.5 text-left text-[13px] text-cork-700 shadow-lg outline-none"
    >
      <div class="story-scroll overflow-y-auto overscroll-contain px-2.5 py-2">
        <p class="leading-[22px]">{story.summary}</p>
      </div>
      <Popover.Arrow class="text-cork-50">
        <svg aria-hidden="true" width="14" height="8" viewBox="0 0 14 8" class="overflow-visible">
          <path d="M0 -1H14L7 7Z" fill="currentColor" />
          <path d="M0 0L7 7L14 0" fill="none" class="stroke-cork-300" stroke-linejoin="round" />
        </svg>
      </Popover.Arrow>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style>
  .story-scroll {
    max-height: min(14rem, 40dvh, calc(var(--bits-popover-content-available-height) - 0.875rem));
    scrollbar-width: thin;
    scrollbar-color: var(--color-cork-300) transparent;
  }

  @supports selector(::-webkit-scrollbar) {
    .story-scroll {
      scrollbar-width: auto;
      scrollbar-color: auto;
    }
  }

  .story-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .story-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .story-scroll::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: var(--color-cork-300);
  }

  .story-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--color-cork-400);
  }

  .story-scroll::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }
</style>
