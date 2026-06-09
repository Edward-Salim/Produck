<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { Story } from '$lib/types/story-map.js';
  import { PIC_COLORS, PIC_DEFAULT_HEX } from '$lib/constants/colors.js';

  let { open = $bindable(false), story }: {
    open: boolean;
    story: Story | null;
  } = $props();

  let picHex = $derived(story ? (PIC_COLORS[story.picColor]?.hex ?? PIC_DEFAULT_HEX) : PIC_DEFAULT_HEX);
  let hasConnextra = $derived(story?.asA && story?.wantTo);

  function handleClose(v: boolean) {
    open = v;
  }
</script>

<Dialog.Root bind:open onOpenChange={handleClose}>
  <Dialog.Content
    class="border-none bg-gradient-to-br from-[#fdf6dc] to-[#f5e9a0] sm:max-w-[420px]"
  >
    {#if story}
      <Dialog.Header class="gap-1">
        <div class="flex items-center justify-between pr-8">
          <span class="font-mono text-xs text-cork-500">{story.id}</span>
          {#if story.pic}
            <Badge class="text-[11px] font-semibold text-white" style="background-color: {picHex};">
              {story.pic}
            </Badge>
          {:else}
            <span class="text-[10px] text-cork-400">No PIC yet</span>
          {/if}
        </div>
        <Dialog.Title class="text-lg font-bold text-cork-800">
          {story.title}
        </Dialog.Title>
      </Dialog.Header>

      <Dialog.Description class="sr-only">
        Detail for user story {story.id}
      </Dialog.Description>

      <div class="flex flex-col gap-4">
        {#if hasConnextra}
          <div
            class="rounded-r-sm border-l-3 border-[#c9b458] bg-black/5 px-3.5 py-2.5 text-sm text-cork-700"
          >
            <strong>As a</strong>
            {story.asA},
            <strong>I want to</strong>
            {story.wantTo}
            {#if story.soThat}
              <strong>so that</strong> {story.soThat}
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
