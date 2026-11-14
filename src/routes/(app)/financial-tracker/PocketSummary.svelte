<script lang="ts">
  import CircleHelp from '@lucide/svelte/icons/circle-help';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { savingsBudgetCategory } from '$lib/financial-tracker-plan.js';
  import { getPocketBank } from '$lib/financial-tracker-pockets.js';

  let {
    rows,
    categoryIcons
  }: {
    rows: readonly { label: string; planned: number }[];
    categoryIcons: ReadonlyMap<string, typeof CircleHelp>;
  } = $props();

  const uid = $props.id();
  let expandedPockets = $state<Record<string, boolean>>({});

  const definitions = [
    { label: 'Meals', categories: ['Meals'] },
    {
      label: 'Wants',
      categories: ['Fun Money', 'Subscriptions', 'Learning', 'Personal Care', 'Health']
    },
    { label: 'Savings', categories: [savingsBudgetCategory] }
  ];
  const pocketCategories = new Set(definitions.flatMap((pocket) => pocket.categories));
  const mainRows = $derived(rows.filter((row) => !pocketCategories.has(row.label)));
  const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  const pockets = $derived([
    {
      label: 'Main',
      categories: mainRows.filter((row) => row.planned > 0).map((row) => row.label),
      planned: mainRows.reduce((sum, row) => sum + row.planned, 0)
    },
    ...definitions.map((pocket) => ({
      ...pocket,
      planned: rows
        .filter((row) => pocket.categories.includes(row.label))
        .reduce((sum, row) => sum + row.planned, 0)
    }))
  ]);
</script>

<dl aria-label="Pocket plans" class="grid min-w-0 grid-cols-2 items-start gap-1.5 sm:grid-cols-4">
  {#each pockets as pocket (pocket.label)}
    <div
      class="min-w-0 rounded-[10px] bg-white/55 px-2 py-1.5 shadow-[0_1px_3px_rgba(31,82,122,0.08)]"
      title={getPocketBank(pocket.label)}
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <dt class="text-xs font-semibold text-cork-900">
          <button
            type="button"
            class="group -mx-1 flex cursor-pointer items-center gap-1 rounded px-1 text-left transition-colors hover:bg-cork-200/60 focus-visible:bg-cork-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cork-500"
            aria-label={`${expandedPockets[pocket.label] ? 'Hide' : 'Show'} ${pocket.label} categories`}
            aria-expanded={Boolean(expandedPockets[pocket.label])}
            aria-controls={`${uid}-${pocket.label}-categories`}
            onclick={() => (expandedPockets[pocket.label] = !expandedPockets[pocket.label])}
          >
            {pocket.label}
            <ChevronDown
              class={`size-3 text-cork-500 transition-[color,transform] group-hover:text-cork-900 group-focus-visible:text-cork-900 ${expandedPockets[pocket.label] ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </dt>
        <dd class="text-sm font-semibold whitespace-nowrap text-cork-900 tabular-nums">
          {rupiah.format(pocket.planned).replace(/\s+/g, '')}
        </dd>
      </div>
      <dd
        id={`${uid}-${pocket.label}-categories`}
        hidden={!expandedPockets[pocket.label]}
        class="mt-0.5"
      >
        {#if expandedPockets[pocket.label]}
          <div class="flex flex-wrap">
            {#each pocket.categories as category (category)}
              {@const CategoryIcon = categoryIcons.get(category) ?? CircleHelp}
              {@const categoryDisabled =
                (rows.find((row) => row.label === category)?.planned ?? 0) <= 0}
              <Tooltip.Root>
                <Tooltip.Trigger
                  type="button"
                  aria-label={categoryDisabled ? `${category} (no allocation)` : category}
                  disabled={categoryDisabled}
                  class="inline-flex size-6 items-center justify-center rounded text-cork-500 hover:bg-cork-100 hover:text-cork-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cork-500 disabled:cursor-default disabled:text-cork-300 disabled:hover:bg-transparent disabled:hover:text-cork-300"
                >
                  <CategoryIcon class="size-3" aria-hidden="true" />
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={4}>{category}</Tooltip.Content>
              </Tooltip.Root>
            {/each}
          </div>
        {/if}
      </dd>
    </div>
  {/each}
</dl>
