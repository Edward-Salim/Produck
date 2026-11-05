<script lang="ts">
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import ArrowUp from '@lucide/svelte/icons/arrow-up';
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
  import type { LedgerSortDirection } from './financial-tracker-types.js';
  let {
    label,
    selected,
    direction,
    onsort
  }: { label: string; selected: boolean; direction: LedgerSortDirection; onsort: () => void } =
    $props();
</script>

<button
  type="button"
  class="sort-button"
  class:active={selected && direction !== null}
  aria-label={`Sort ledger by ${label}`}
  onclick={onsort}
>
  <span>{label.toUpperCase()}</span>
  {#if selected && direction !== null}
    {#if direction === 'asc'}
      <ArrowUp class="size-3" />
    {:else}
      <ArrowDown class="size-3" />
    {/if}
  {:else}
    <ArrowUpDown class="size-3 opacity-55" />
  {/if}
</button>

<style>
  .sort-button {
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: flex-end;
    gap: 0.22rem;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .sort-button.active {
    color: #ffffff;
  }
</style>
