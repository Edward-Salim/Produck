<script lang="ts">
  import { normalizeFieldNotes } from '$lib/frameworks/fields.js';

  let { notes, maxHeight = 600 }: { notes: unknown; maxHeight?: number } = $props();
  let fields = $derived(normalizeFieldNotes(notes));
</script>

<div
  class="fields-scroll min-h-0 overflow-y-auto overscroll-contain pr-2"
  style:max-height="{maxHeight}px"
>
  {#if fields.length}
    <ul class="grid gap-3">
      {#each fields as field, index (index)}
        <li class="space-y-1.5 rounded-sm bg-black/5 px-3.5 py-3">
          <div class="flex items-start justify-between gap-4">
            <p class="min-w-0 text-sm font-semibold text-cork-800">{field.name}</p>
            {#if field.example}
              <p
                class="ml-auto max-w-[45%] shrink-0 text-right text-xs leading-relaxed text-cork-600"
              >
                <span class="font-medium">e.g.</span>
                {field.example}
              </p>
            {/if}
          </div>
          {#if field.values?.length}
            {#if field.explain && field.values.some((value) => value.meaning)}
              <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs leading-relaxed">
                {#each field.values as value, valueIndex (valueIndex)}
                  <dt class="flex items-start">
                    <span class="rounded-sm bg-black/5 px-2 py-0.5 text-xs text-cork-700"
                      >{value.label}</span
                    >
                  </dt>
                  <dd class="py-0.5 text-cork-600">{value.meaning ?? ''}</dd>
                {/each}
              </dl>
            {:else}
              <div class="flex flex-wrap gap-1.5">
                {#each field.values as value, valueIndex (valueIndex)}
                  <span class="rounded-sm bg-black/5 px-2 py-0.5 text-xs text-cork-700"
                    >{value.label}</span
                  >
                {/each}
              </div>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-center text-xs text-cork-500">No fields yet</p>
  {/if}
</div>

<style>
  .fields-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(92, 75, 58, 0.25) transparent;
  }

  .fields-scroll::-webkit-scrollbar {
    width: 4px;
  }

  .fields-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .fields-scroll::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(92, 75, 58, 0.25);
  }

  .fields-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(92, 75, 58, 0.4);
  }
</style>
