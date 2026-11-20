<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import FileText from '@lucide/svelte/icons/file-text';
  import Globe from '@lucide/svelte/icons/globe';
  import Info from '@lucide/svelte/icons/info';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import { Tooltip } from 'bits-ui';
  import { HK, ID, MY, SG } from 'country-flag-icons/string/3x2';
  import { SvelteSet } from 'svelte/reactivity';
  import checkgptIcon from '$lib/assets/brand/checkgpt-icon.png';
  import confluenceIcon from '$lib/assets/brand/confluence-icon.png';
  import produckIcon from '$lib/assets/brand/favicon.png';
  import sharepointIcon from '$lib/assets/brand/sharepoint-icon.png';
  import wallexIcon from '$lib/assets/brand/wallex-icon.png';
  import PrototypeGallery from '$lib/components/story-map/PrototypeGallery.svelte';
  import TooltipContent from '$lib/components/ui/tooltip/tooltip-content.svelte';
  import {
    artifactColumnSpans,
    artifactLinkHref,
    parseCustomArtifact,
    type ArtifactBlock,
    type ArtifactCell,
    type ArtifactLink,
    type ArtifactTableRow,
    type ArtifactText
  } from '$lib/frameworks/custom-artifacts.js';
  import { normalizePrototypeImages } from '$lib/frameworks/prototypes.js';
  import type { FrameworkInstance } from './types.js';

  let { instance, projectId }: { instance: FrameworkInstance; projectId: string } = $props();
  let document = $derived(parseCustomArtifact(instance.values.document));
  let outline = $derived(
    document?.blocks.filter((block) => block.type !== 'callout' && block.title?.trim()) ?? []
  );
  const collapsedOptions = new SvelteSet<string>();
  let openCondition = $state<string>();
  const marketFlags: Partial<Record<string, { name: string; svg: string }>> = {
    HK: { name: 'Hong Kong', svg: HK },
    ID: { name: 'Indonesia', svg: ID },
    MY: { name: 'Malaysia', svg: MY },
    SG: { name: 'Singapore', svg: SG }
  };

  function toggleOptions(key: string) {
    if (collapsedOptions.has(key)) collapsedOptions.delete(key);
    else collapsedOptions.add(key);
  }

  type DisplayRow = {
    key: string;
    cells: ArtifactCell[];
    optionKey?: string;
    inset?: boolean;
    requiredFor?: string;
    market?: string;
    kind?: 'document';
  };

  function visibleTableRows(rows: ArtifactTableRow[], groupKey: string): DisplayRow[] {
    return rows.flatMap((row, index): DisplayRow[] => {
      const key = `${groupKey}:${index}`;
      if (Array.isArray(row)) return [{ key, cells: row }];

      const main = {
        key,
        cells: row.cells,
        optionKey: row.options ? key : undefined,
        requiredFor: row.requiredFor,
        market: row.market,
        kind: row.kind
      };
      if (!row.options || collapsedOptions.has(key)) return [main];
      return [
        main,
        ...row.options.map((cells, index) => ({ key: `${key}:${index}`, cells, inset: true }))
      ];
    });
  }

  function syncScrollableHeader(scroller: HTMLElement) {
    const wrapper = scroller.parentElement;
    const table = scroller.querySelector('table');
    const header = wrapper?.querySelector<HTMLElement>('.brief-table-sticky');
    const cells = table?.tHead?.rows[0]?.cells;
    if (!wrapper || !table || !header || !cells) return;

    const scrollHeader = () => {
      header.scrollLeft = scroller.scrollLeft;
    };

    // Place the visual header outside the horizontal scroller so the browser can pin it vertically.
    const measure = () => {
      const overflowing = table.getBoundingClientRect().width - scroller.clientWidth > 0.5;
      if (overflowing) {
        const widths = Array.from(cells, (cell) => `${cell.getBoundingClientRect().width}px`);
        header.style.setProperty('--table-header-columns', widths.join(' '));
        scroller.tabIndex = 0;
      } else {
        scroller.removeAttribute('tabindex');
      }
      wrapper.dataset.scrollLayout = overflowing ? 'overflow' : 'fit';
      scrollHeader();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(table);
    for (const cell of cells) observer.observe(cell);
    scroller.addEventListener('scroll', scrollHeader, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', scrollHeader);
      scroller.removeAttribute('tabindex');
      delete wrapper.dataset.scrollLayout;
      header.style.removeProperty('--table-header-columns');
    };
  }

  function linkIcon(href: string) {
    if (href.startsWith('/')) return produckIcon;

    const { hostname, pathname } = new URL(href);
    if (/^(?:www\.)?produck\.fun$/.test(hostname)) return produckIcon;
    if (/(?:^|\.)wallex\.(?:asia|plus)$/.test(hostname)) return wallexIcon;
    if (/(?:^|\.)checkgpt\.ai$/.test(hostname)) return checkgptIcon;
    if (/(?:^|\.)sharepoint\.com$/.test(hostname)) return sharepointIcon;
    if (hostname.endsWith('.atlassian.net') && /^\/wiki(?:\/|$)/.test(pathname)) {
      return confluenceIcon;
    }
  }

  const badgeClass = {
    neutral: 'bg-cork-200 text-cork-800',
    success: 'bg-[#e1ecd9] text-[#385338]',
    warning: 'bg-[#f3e5ca] text-[#694918]'
  };
  const surfaceClass = 'rounded-sm shadow-[0_1px_3px_rgba(57,45,27,0.045)]';
  const paperSurfaceClass = `${surfaceClass} bg-[#fffcf6]`;
  const linkBaseClass =
    'font-medium wrap-anywhere text-[#3b5d80] underline-offset-3 hover:text-[#294866] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3';
  const calloutStyles = {
    neutral: { Icon: Info, background: 'bg-[#eaf1f5]', icon: 'bg-[#d7e6ef] text-[#315372]' },
    success: { Icon: CircleCheck, background: 'bg-[#eaf3e7]', icon: 'bg-[#d8e9d3] text-[#365e39]' },
    warning: {
      Icon: TriangleAlert,
      background: 'bg-[#fcf1dc]',
      icon: 'bg-[#f3e1ba] text-[#80561d]'
    }
  };
</script>

{#snippet link(item: ArtifactLink)}
  {@const href = artifactLinkHref(item.href)}
  {#if href}
    {@const icon = linkIcon(href)}
    <a
      {href}
      class="rounded-sm border border-cork-300/75 bg-[#fffcf6] box-decoration-clone px-1.5 py-px whitespace-normal [-webkit-box-decoration-break:clone] hover:bg-cork-100/75 {linkBaseClass}"
    >
      {#if icon}
        <img src={icon} alt="" class="me-0.5 inline-block size-[1em] object-contain align-middle" />
      {:else}
        <Globe class="me-0.5 inline size-[1em] align-middle" aria-hidden="true" />
      {/if}
      {item.label}
    </a>
  {:else}
    {item.label}
  {/if}
{/snippet}

{#snippet inlineText(content: ArtifactText)}
  {#if typeof content === 'string'}
    {content}
  {:else}
    {#each content as part, index (index)}
      {#if typeof part === 'string'}
        {part}
      {:else if part.type === 'strong'}
        <strong class="font-semibold text-cork-900">{part.text}</strong>
      {:else}
        {@render link(part)}
      {/if}
    {/each}
  {/if}
{/snippet}

{#snippet links(items: ArtifactLink[])}
  <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
    {#each items as item, index (index)}
      <li>{@render link(item)}</li>
    {/each}
  </ul>
{/snippet}

{#snippet columnLabels(
  columns: string[],
  compact: boolean | undefined,
  mergeColumn: number | undefined,
  visual = false
)}
  {#each columns as column, index (index)}
    <svelte:element
      this={visual ? 'div' : 'th'}
      scope={visual ? undefined : 'col'}
      class={[
        'border-cork-300/75 px-3 align-top font-semibold whitespace-nowrap sm:px-4',
        compact ? 'py-1' : 'py-2.5',
        index > 0 && 'border-s',
        !visual && index === mergeColumn && 'w-[30%]',
        !visual && index === 0 && columns.length > 4 && 'min-w-64',
        !visual && index === 0 && columns.length === 2 && 'w-2/5'
      ]}
    >
      {column}
    </svelte:element>
  {/each}
{/snippet}

{#snippet cellText(
  label: string,
  requirement: string | undefined,
  market: string | undefined,
  isDocument: boolean
)}
  {@const flag = market ? marketFlags[market] : undefined}
  <span class={['whitespace-pre-wrap', requirement && 'text-red-700']}>
    {label}
    {#if isDocument || market}
      <span
        class={[
          'inline-flex items-center gap-0.5 align-middle whitespace-nowrap',
          isDocument ? 'ms-1' : 'ms-1.5'
        ]}
      >
        {#if isDocument}
          <FileText class="size-3.5 shrink-0 text-cork-500" role="img" aria-label="Document" />
        {/if}
        {#if flag}
          <img
            src={'data:image/svg+xml,' + encodeURIComponent(flag.svg)}
            alt={`${flag.name} onboarding market`}
            title={flag.name}
            width="18"
            height="12"
            class="shrink-0 rounded-[2px]"
          />
        {:else if market}
          <span
            class="rounded-sm bg-cork-200 px-1.5 py-0.5 text-[10px] leading-none font-medium text-cork-700"
            ><span class="sr-only">Onboarding market </span>{market}</span
          >
        {/if}
      </span>
    {/if}
    {#if requirement}<span class="sr-only">({requirement})</span>{/if}
  </span>
{/snippet}

{#snippet conditionTooltip(detail: string, key: string)}
  <Tooltip.Root
    open={openCondition === key}
    onOpenChange={(open) => {
      if (open) openCondition = key;
      else if (openCondition === key) openCondition = undefined;
    }}
    disableCloseOnTriggerClick
  >
    <Tooltip.Trigger
      type="button"
      class="cursor-pointer rounded-sm whitespace-nowrap text-cork-700 hover:text-cork-900 focus-visible:outline-2 focus-visible:outline-offset-2"
      onclick={() => (openCondition = key)}
    >
      Depends
    </Tooltip.Trigger>
    <TooltipContent sideOffset={6} class="z-[60] leading-snug font-normal">
      {detail}
    </TooltipContent>
  </Tooltip.Root>
{/snippet}

{#snippet tableRow(
  row: DisplayRow,
  compact: boolean | undefined,
  rowsBelow: number,
  mergeColumn: number | undefined,
  mergeSpan: number,
  bulletedColumn: number | undefined
)}
  <tr>
    {#each row.cells as cell, index (index)}
      {@const span = index === mergeColumn ? mergeSpan : 1}
      {#if span > 0}
        {@const requirement =
          index === 0 && row.requiredFor ? `Required for ${row.requiredFor}` : undefined}
        {@const market = index === 0 ? row.market : undefined}
        {@const isDocument = index === 0 && row.kind === 'document'}
        <svelte:element
          this={index === 0 ? 'th' : 'td'}
          scope={index === 0 ? 'row' : undefined}
          rowspan={span > 1 ? span : undefined}
          title={requirement}
          class={[
            'border-cork-300/75 pe-3 wrap-anywhere sm:pe-4',
            index === bulletedColumn ? 'align-middle' : 'align-top',
            index > 0 && 'border-s',
            rowsBelow >= span && 'border-b',
            index === mergeColumn && 'min-w-48',
            index === 0 && row.inset ? 'ps-12 sm:ps-14' : 'ps-3 sm:ps-4',
            compact ? 'py-0.5' : 'py-3',
            compact && index > 0 && cell === '?' && 'bg-[#f9f0db]',
            index === 0 && 'bg-cork-100/50 font-normal [&>*]:font-normal',
            index === 0 && !compact && 'text-cork-900'
          ]}
        >
          {#if typeof cell === 'string'}
            {@const optionKey = row.optionKey}
            {#if index === 0 && optionKey}
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-left wrap-anywhere hover:text-cork-900 focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-expanded={!collapsedOptions.has(optionKey)}
                onclick={() => toggleOptions(optionKey)}
              >
                {@render cellText(cell, requirement, market, isDocument)}
                <ChevronDown
                  class={[
                    'size-3.5 shrink-0 text-cork-600',
                    collapsedOptions.has(optionKey) && '-rotate-90'
                  ]}
                  aria-hidden="true"
                />
              </button>
            {:else if index === bulletedColumn && cell.trim() && cell !== '?'}
              <ul class="list-disc ps-4">
                {#each cell
                  .split('\n')
                  .filter((line) => line.trim()) as line, lineIndex (lineIndex)}
                  <li>{line}</li>
                {/each}
              </ul>
            {:else}
              {@render cellText(cell, requirement, market, isDocument)}
            {/if}
          {:else if cell.type === 'link'}
            {@render link(cell)}
          {:else if cell.type === 'condition'}
            {@render conditionTooltip(cell.text, `${row.key}:${index}`)}
          {:else}
            <span
              class="inline-flex rounded-sm px-2 py-0.5 text-xs font-medium {badgeClass[cell.tone]}"
              >{cell.label}</span
            >
          {/if}
        </svelte:element>
      {/if}
    {/each}
  </tr>
{/snippet}

{#snippet contentBlocks(blocks: ArtifactBlock[], spacing = '')}
  <div class="space-y-6 sm:space-y-8 [&>[data-brief-heading]]:mb-2 {spacing}">
    {#each blocks as block (block.id)}
      {#if block.type === 'expand'}
        <details
          id={block.id}
          class="scroll-mt-24 [&[open]>summary>svg]:rotate-180 {paperSurfaceClass}"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm px-4 py-3 font-medium hover:bg-cork-100/65 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
          >
            {block.title}
            <ChevronDown
              class="size-4 shrink-0 text-cork-600 transition-transform"
              aria-hidden="true"
            />
          </summary>
          <div class="px-4 pt-1 pb-4">
            {#if block.text !== undefined}
              <p class="text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
                {@render inlineText(block.text)}
              </p>
            {/if}
            {#if block.blocks?.length}
              {@render contentBlocks(block.blocks, block.text !== undefined ? 'mt-4' : '')}
            {/if}
            {#if block.links?.length}{@render links(block.links)}{/if}
          </div>
        </details>
      {:else if block.type === 'callout'}
        {@const callout = calloutStyles[block.tone]}
        <aside
          class="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5 {surfaceClass} {callout.background}"
          aria-labelledby={block.title ? block.id : undefined}
        >
          <span class="grid size-8 shrink-0 place-items-center rounded-sm {callout.icon}">
            <callout.Icon class="size-[18px]" aria-hidden="true" />
          </span>
          <div class="min-w-0 py-0.5">
            {#if block.title}
              <h2 id={block.id} class="mb-1 text-sm font-semibold text-cork-900 sm:text-base">
                {block.title}
              </h2>
            {/if}
            <p class="max-w-3xl text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
              {@render inlineText(block.text)}
            </p>
            {#if block.links?.length}{@render links(block.links)}{/if}
          </div>
        </aside>
      {:else}
        <section class="min-w-0" data-brief-heading={block.type === 'heading' ? '' : undefined}>
          {#if block.title}
            {@const isSubheading = block.type === 'heading' && block.level === 3}
            <svelte:element
              this={isSubheading ? 'h3' : 'h2'}
              id={block.id}
              class="scroll-mt-24 font-sans leading-tight font-semibold text-cork-800 {isSubheading
                ? 'text-base sm:text-lg'
                : 'text-xl sm:text-2xl'} {block.type === 'heading' ? '' : 'mb-3'}"
            >
              {block.title}
            </svelte:element>
          {/if}

          {#if block.type === 'table'}
            {@const groups = block.rowGroups ?? [{ title: undefined, rows: block.rows }]}
            {#if block.showAttributeCount}
              {@const count = groups.reduce((total, group) => total + group.rows.length, 0)}
              <p class="mb-2 text-sm text-cork-700">
                {count}
                {count === 1 ? 'attribute' : 'attributes'}
              </p>
            {/if}
            <div
              class={[
                'brief-table border border-cork-300/75',
                paperSurfaceClass,
                block.columns.length === 2 && 'two-columns',
                block.columns.length === 3 && 'three-columns',
                block.columns.length === 4 && 'wide-table',
                block.columns.length > 4 && 'extra-wide-table'
              ]}
            >
              <div
                aria-hidden="true"
                class={[
                  'brief-table-sticky z-10 bg-cork-200 text-left text-sm text-cork-900',
                  block.compact ? 'leading-tight' : 'leading-relaxed'
                ]}
              >
                <div class="brief-table-labels">
                  {@render columnLabels(block.columns, block.compact, block.mergeColumn, true)}
                </div>
              </div>
              <div
                class="brief-table-scroll focus-visible:outline-2 focus-visible:-outline-offset-2"
                role="region"
                aria-label={block.title ?? 'Table scroll area'}
                {@attach syncScrollableHeader}
              >
                <table
                  class={[
                    'w-full border-separate border-spacing-0 text-left text-sm',
                    block.compact ? 'leading-tight' : 'leading-relaxed'
                  ]}
                  aria-labelledby={block.title ? block.id : undefined}
                >
                  <thead class="z-10 bg-cork-200 text-cork-900">
                    <tr>
                      {@render columnLabels(block.columns, block.compact, block.mergeColumn)}
                    </tr>
                  </thead>
                  {#each groups as group, groupIndex (groupIndex)}
                    {@const rows = visibleTableRows(
                      group.rows,
                      `${instance.id}:${block.id}:${groupIndex}`
                    )}
                    {@const spans =
                      block.mergeColumn === undefined
                        ? undefined
                        : artifactColumnSpans(
                            rows.map((row) => row.cells),
                            block.mergeColumn
                          )}
                    <tbody class="text-cork-700">
                      {#if group.title}
                        <tr>
                          <th
                            scope="rowgroup"
                            colspan={block.columns.length}
                            class={[
                              'border-cork-300/75 bg-cork-200/60 px-3 font-semibold text-cork-900 sm:px-4',
                              block.compact ? 'py-1' : 'py-2.5',
                              groupIndex > 0 && 'border-t',
                              rows.length > 0 && 'border-b'
                            ]}
                          >
                            {group.title}
                          </th>
                        </tr>
                      {/if}
                      {#each rows as row, rowIndex (row.key)}
                        {@render tableRow(
                          row,
                          block.compact,
                          rows.length - rowIndex - 1,
                          block.mergeColumn,
                          spans?.[rowIndex] ?? 1,
                          block.bulletedColumn
                        )}
                      {/each}
                    </tbody>
                  {/each}
                </table>
              </div>
            </div>
          {:else if block.type === 'gallery'}
            <div class="{paperSurfaceClass} p-3 sm:p-4">
              <PrototypeGallery
                images={normalizePrototypeImages(block.images).filter((image) =>
                  image.src.startsWith(`/api/story-prototypes/${projectId}/`)
                )}
                maxHeight={null}
              />
            </div>
          {:else if block.type === 'list'}
            <svelte:element
              this={block.ordered ? 'ol' : 'ul'}
              class="max-w-3xl space-y-1.5 ps-6 text-sm leading-relaxed text-cork-700 marker:font-semibold marker:text-cork-600 {block.ordered
                ? 'list-decimal'
                : 'list-disc'}"
              aria-labelledby={block.title ? block.id : undefined}
            >
              {#each block.items as item, index (index)}
                <li class="ps-1 whitespace-pre-wrap">{@render inlineText(item)}</li>
              {/each}
            </svelte:element>
          {:else if block.type === 'text'}
            <p class="max-w-3xl text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
              {@render inlineText(block.text)}
            </p>
          {/if}
          {#if block.links?.length}{@render links(block.links)}{/if}
        </section>
      {/if}
    {/each}
  </div>
{/snippet}

<article class="min-w-0 px-1 py-2 text-cork-800 sm:px-2 sm:py-4">
  <header>
    <h1 class="font-sans text-3xl leading-tight font-semibold text-cork-900 sm:text-4xl">
      {instance.title}
    </h1>
    {#if document?.summary}
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-cork-700 sm:text-base">
        {@render inlineText(document.summary)}
      </p>
    {/if}
  </header>

  {#if outline.length > 1}
    <nav aria-label="On this page" class="mt-5 max-w-3xl ps-4 sm:ps-6">
      <ul class="space-y-1 text-sm sm:text-base">
        {#each outline as block (block.id)}
          <li class={{ 'ps-5 sm:ps-6': block.type === 'heading' && block.level === 3 }}>
            <a
              href={`#${encodeURIComponent(block.id)}`}
              class="inline-block py-0.5 {linkBaseClass} hover:underline focus-visible:underline"
            >
              {block.title}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}

  {#if document?.blocks.length}
    <Tooltip.Provider delayDuration={250}>
      {@render contentBlocks(document.blocks, 'mt-6 sm:mt-8')}
    </Tooltip.Provider>
  {:else}
    <p class="px-2 py-8 text-sm text-cork-600">No content available.</p>
  {/if}
</article>

<style>
  .brief-table thead,
  .brief-table-sticky {
    position: sticky;
    top: var(--table-header-top, var(--app-topbar-height, 0px));
  }

  .brief-table thead::after {
    position: absolute;
    inset-inline: 0;
    bottom: -1px;
    height: 2px;
    background: var(--color-cork-300, #cdc3ae);
    pointer-events: none;
    content: '';
  }

  .brief-table {
    overflow: clip;
  }

  .brief-table-scroll {
    overflow: auto hidden;
    scrollbar-width: none;
  }

  .brief-table-scroll::-webkit-scrollbar {
    display: none;
  }

  .brief-table-sticky {
    display: none;
    overflow: hidden;
  }

  .brief-table-labels {
    display: grid;
    width: max-content;
    grid-template-columns: var(--table-header-columns);
    box-shadow: inset 0 -1px var(--color-cork-300, #cdc3ae);
  }

  .brief-table:global([data-scroll-layout='fit']) .brief-table-scroll {
    overflow: visible;
  }

  .brief-table:global([data-scroll-layout='overflow']) .brief-table-sticky {
    display: block;
  }

  .brief-table:global([data-scroll-layout='overflow']) thead {
    position: static;
    opacity: 0;
  }

  .brief-table:global([data-scroll-layout='overflow']) thead :global(th) {
    padding-block: 0;
    line-height: 0;
  }

  .two-columns table {
    min-width: 22rem;
  }

  .three-columns table {
    min-width: 34rem;
  }

  .wide-table table {
    min-width: 46rem;
  }

  .extra-wide-table table {
    min-width: 60rem;
  }
</style>
