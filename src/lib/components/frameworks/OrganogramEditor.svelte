<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type OrgNode = {
    title: string;
    owner: string;
    responsibility: string;
    tone: string;
    children?: OrgNode[];
  };

  type OrganogramDraft = {
    root: OrgNode;
  };

  let {
    instance
  }: {
    instance: FrameworkInstance;
    draftMode?: 'edit' | 'view';
    onUpdate?: (values: Record<string, string>, title?: string) => void;
  } = $props();

  const defaultOrganogram: OrganogramDraft = {
    root: {
      title: 'Product Lead',
      owner: 'Name / role',
      responsibility: 'Owns product direction, priorities, and outcomes.',
      tone: 'border-amber-300/60 bg-amber-50/45',
      children: [
        {
          title: 'Discovery',
          owner: 'Research / PM',
          responsibility: 'Customer insight, problem framing, and opportunity quality.',
          tone: 'border-cork-300/70 bg-cork-50/65',
          children: [
            {
              title: 'Research Ops',
              owner: 'Owner',
              responsibility: 'Recruiting, interviews, synthesis, and evidence library.',
              tone: 'border-cork-300/70 bg-cork-100/55'
            },
            {
              title: 'Analytics',
              owner: 'Owner',
              responsibility: 'Behavior data, funnels, metrics, and experiment readouts.',
              tone: 'border-cork-300/65 bg-cork-50/65'
            }
          ]
        },
        {
          title: 'Delivery',
          owner: 'Design / Eng',
          responsibility: 'Solution shaping, build quality, release flow, and iteration.',
          tone: 'border-cork-300/65 bg-cork-50/65',
          children: [
            {
              title: 'Design',
              owner: 'Owner',
              responsibility: 'Flows, prototypes, usability, and visual execution.',
              tone: 'border-cork-300/70 bg-cork-100/45'
            },
            {
              title: 'Engineering',
              owner: 'Owner',
              responsibility: 'Technical decisions, implementation, reliability, and speed.',
              tone: 'border-cork-300/70 bg-cork-50/65'
            }
          ]
        },
        {
          title: 'Go To Market',
          owner: 'Marketing / Sales',
          responsibility: 'Positioning, launch, adoption, feedback loops, and growth.',
          tone: 'border-cork-300/70 bg-cork-100/45',
          children: [
            {
              title: 'Customer Success',
              owner: 'Owner',
              responsibility: 'Onboarding, retention, account health, and support insight.',
              tone: 'border-cork-300/70 bg-cork-100/55'
            },
            {
              title: 'Growth',
              owner: 'Owner',
              responsibility: 'Acquisition, activation, lifecycle, and channel learning.',
              tone: 'border-amber-300/60 bg-amber-50/45'
            }
          ]
        }
      ]
    }
  };

  let organogram = $derived.by(() => {
    try {
      const saved = JSON.parse(instance.values.organogram ?? '{}');
      return { ...defaultOrganogram, ...saved } as OrganogramDraft;
    } catch {
      return defaultOrganogram;
    }
  });
</script>

<div class="overflow-hidden rounded-xl border border-cork-300/40 bg-cork-50">
  <div class="overflow-x-auto bg-[#fbf4e9] p-4 [-webkit-overflow-scrolling:touch]">
    <div class="min-w-[54rem]">
      <div class="mx-auto w-64">
        {@render OrgCard({ node: organogram.root, featured: true })}
      </div>

      <div class="mx-auto h-8 w-px bg-cork-400/45"></div>
      <div class="mx-auto h-px w-[70%] bg-cork-400/45"></div>

      <div class="grid grid-cols-3 gap-4">
        {#each organogram.root.children ?? [] as group (group.title)}
          <div>
            <div class="mx-auto h-8 w-px bg-cork-400/45"></div>
            {@render OrgCard({ node: group })}

            {#if group.children?.length}
              <div class="mx-auto h-8 w-px bg-cork-400/45"></div>
              <div class="mx-auto h-px w-[70%] bg-cork-400/45"></div>
              <div class="grid grid-cols-2 gap-3">
                {#each group.children as child (child.title)}
                  <div>
                    <div class="mx-auto h-6 w-px bg-cork-400/45"></div>
                    {@render OrgCard({ node: child, compact: true })}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

{#snippet OrgCard({ node, featured = false, compact = false }: { node: OrgNode; featured?: boolean; compact?: boolean })}
  <article
    class="rounded-lg border p-3 text-center shadow-sm {node.tone} {featured
      ? 'ring-1 ring-cork-500/20'
      : ''}"
  >
    <h4
      class="font-display leading-none text-cork-800 {featured
        ? 'text-xl'
        : compact
          ? 'text-sm'
          : 'text-base'}"
    >
      {node.title}
    </h4>
    <p class="mt-1 text-[10px] font-semibold tracking-wide text-cork-500 uppercase">
      {node.owner}
    </p>
    <p class="mt-2 text-xs leading-snug text-cork-600">
      {node.responsibility}
    </p>
  </article>
{/snippet}
