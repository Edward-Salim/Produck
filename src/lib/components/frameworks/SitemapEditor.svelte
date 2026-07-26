<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type SitemapNodeType = 'page' | 'screen' | 'section' | 'external' | 'developer';

  type SitemapNode = {
    id: string;
    title: string;
    path: string;
    type: SitemapNodeType;
    children: SitemapNode[];
  };

  type SitemapDraft = {
    siteName: string;
    source?: string;
    root: SitemapNode | null;
  };

  let {
    instance
  }: {
    instance: FrameworkInstance;
    draftMode?: 'edit' | 'view';
    onUpdate?: (values: Record<string, string>, title?: string) => void;
  } = $props();

  function parseSitemap(value: string | undefined): SitemapDraft {
    try {
      const parsed = JSON.parse(value ?? '{}') as Partial<SitemapDraft>;
      if (parsed.root?.id && Array.isArray(parsed.root.children)) {
        return {
          siteName: parsed.siteName ?? '',
          source: parsed.source,
          root: parsed.root
        };
      }
    } catch {
      // Invalid or absent database content is rendered as an empty framework.
    }
    return { siteName: '', root: null };
  }

  let sitemap = $derived(parseSitemap(instance.values.sitemap));
  const BRANCH_COLORS = ['#d2a93c', '#739477', '#bd6863', '#668bb0'];

  function branchColor(index: number): string {
    return BRANCH_COLORS[index % BRANCH_COLORS.length];
  }
</script>

{#if sitemap.root}
  <div class="sitemap-scroll-shell">
    <section
      class="sitemap-scroll min-w-0 overflow-auto rounded-xl border border-cork-300/50 bg-[#fbf4e9]"
    >
      <div class="mx-auto min-w-[58rem] p-8">
        <article
          class="mx-auto w-fit min-w-32 rounded bg-[#64866d] px-5 py-2 text-center text-xs font-semibold text-white shadow-sm"
          aria-label={`${sitemap.root.title}: ${sitemap.root.path}`}
        >
          {sitemap.root.title}
        </article>
        <div class="connector-stem mx-auto h-8 bg-[#64866d]"></div>

        <div
          class="branches"
          style={`--branch-count: ${sitemap.root.children.length}; grid-template-columns: repeat(${sitemap.root.children.length}, minmax(15rem, 1fr));`}
        >
          {#each sitemap.root.children as branch, branchIndex (branch.id)}
            {@const color = branchColor(branchIndex)}
            <div class="branch" style={`--branch-color: ${color}`}>
              <div class="connector-stem mx-auto h-7" style={`background: ${color}`}></div>
              <article
                class="mx-auto w-fit min-w-32 rounded px-4 py-2 text-center text-[11px] font-semibold text-white shadow-sm"
                style={`background: ${color}`}
                aria-label={`${branch.title}: ${branch.path}`}
              >
                {branch.title}
              </article>
              <div class="connector-stem mx-auto h-3" style={`background: ${color}`}></div>
              {@render DescendantList(branch.children, color)}
            </div>
          {/each}
        </div>
      </div>
    </section>
  </div>
{:else}
  <div
    class="flex min-h-80 flex-col items-center justify-center rounded-xl border border-cork-300/50 bg-cork-50/50 px-4 text-center"
  >
    <p class="text-sm font-medium text-cork-600">No sitemap data</p>
    <p class="mt-1 max-w-sm text-xs text-cork-400">
      A developer can populate this framework from verified project routes.
    </p>
  </div>
{/if}

{#snippet DescendantList(nodes: SitemapNode[], color: string)}
  {#if nodes.length}
    <ul class="destination-list" style={`--branch-color: ${color}`}>
      {#each nodes as node (node.id)}
        <li>
          {@render DestinationNode(node, color)}
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

{#snippet DestinationNode(node: SitemapNode, color: string)}
  <article
    class="destination-card"
    style={`border-color: ${color}`}
    aria-label={`${node.title}: ${node.path}`}
  >
    {node.title}
  </article>
  {#if node.children.length}
    {@render DescendantList(node.children, color)}
  {/if}
{/snippet}

<style>
  .sitemap-scroll-shell {
    position: relative;
    min-width: 0;
  }

  .sitemap-scroll-shell::before,
  .sitemap-scroll-shell::after {
    position: absolute;
    z-index: 10;
    top: 1px;
    bottom: 1px;
    width: 1.75rem;
    pointer-events: none;
    content: '';
  }

  .sitemap-scroll-shell::before {
    left: 1px;
    border-radius: 0.75rem 0 0 0.75rem;
    background: linear-gradient(to right, #fbf4e9, transparent);
  }

  .sitemap-scroll-shell::after {
    right: 1px;
    border-radius: 0 0.75rem 0.75rem 0;
    background: linear-gradient(to left, #fbf4e9, transparent);
  }

  .sitemap-scroll {
    cursor: default;
    scrollbar-width: none;
  }

  .sitemap-scroll::-webkit-scrollbar {
    display: none;
  }

  .branches {
    position: relative;
    display: grid;
    gap: 0;
  }

  .connector-stem {
    width: 0.5px;
  }

  .branches::before {
    position: absolute;
    top: 0;
    right: calc(50% / var(--branch-count));
    left: calc(50% / var(--branch-count));
    border-top: 1px solid #8d806c;
    content: '';
  }

  .branch {
    min-width: 0;
    padding-inline: 1.25rem;
  }

  .destination-list {
    position: relative;
    width: max-content;
    margin: 0.75rem auto 0;
    padding: 0;
  }

  .branch > .destination-list {
    margin-top: 0;
    margin-right: 0;
    margin-left: 50%;
  }

  .destination-list .destination-list {
    width: max-content;
    margin: 0.2rem 0 0 0.75rem;
  }

  .destination-list li {
    position: relative;
    margin: 0;
    padding: 0 0 0.35rem 0.75rem;
    list-style: none;
  }

  .destination-list li::before {
    position: absolute;
    top: 0.9rem;
    left: 0;
    width: 0.75rem;
    border-top: 1px solid var(--branch-color);
    content: '';
  }

  .destination-list li::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-left: 1px solid var(--branch-color);
    content: '';
  }

  .destination-list li:last-child::after {
    bottom: auto;
    height: 0.9rem;
  }

  .destination-card {
    position: relative;
    z-index: 1;
    width: max-content;
    border-width: 1px;
    border-radius: 0.2rem;
    background: #fffaf2;
    padding: 0.3rem 0.45rem;
    color: #5e5547;
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1.3;
    text-align: left;
    white-space: nowrap;
  }
</style>
