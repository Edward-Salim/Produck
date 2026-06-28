<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type BusinessModelCanvasKey =
    | 'keyPartners'
    | 'keyActivities'
    | 'keyResources'
    | 'valuePropositions'
    | 'customerRelationships'
    | 'channels'
    | 'customerSegments'
    | 'costStructure'
    | 'revenueStreams';

  type BusinessModelCanvasDraft = Record<BusinessModelCanvasKey, string>;

  type CanvasSection = {
    id: BusinessModelCanvasKey;
    title: string;
    prompt: string;
    placeholder: string;
    area: string;
    tone: string;
    display: 'pills' | 'note';
  };

  let {
    instance
  }: {
    instance: FrameworkInstance;
    draftMode?: 'edit' | 'view';
    onUpdate?: (values: Record<string, string>, title?: string) => void;
  } = $props();

  const blankCanvas: BusinessModelCanvasDraft = {
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: ''
  };

  const sections: CanvasSection[] = [
    {
      id: 'keyPartners',
      title: 'Key Partners',
      prompt: 'Who helps us operate or deliver?',
      placeholder: 'Suppliers, platforms, agencies, integrations...',
      area: 'partners',
      tone: 'border-cork-300/65 bg-cork-50/65',
      display: 'pills'
    },
    {
      id: 'keyActivities',
      title: 'Key Activities',
      prompt: 'What must we do very well?',
      placeholder: 'Build, sell, support, match, analyze...',
      area: 'activities',
      tone: 'border-cork-300/70 bg-cork-100/55',
      display: 'pills'
    },
    {
      id: 'keyResources',
      title: 'Key Resources',
      prompt: 'What assets make the model work?',
      placeholder: 'Team, technology, data, capital, brand...',
      area: 'resources',
      tone: 'border-cork-300/70 bg-cork-50/65',
      display: 'pills'
    },
    {
      id: 'valuePropositions',
      title: 'Value Propositions',
      prompt: 'What value do we create?',
      placeholder: 'The core outcome customers choose us for.',
      area: 'value',
      tone: 'border-amber-300/60 bg-amber-50/45',
      display: 'note'
    },
    {
      id: 'customerRelationships',
      title: 'Customer Relationships',
      prompt: 'How do we acquire and retain?',
      placeholder: 'Self-serve, personal support, community...',
      area: 'relationships',
      tone: 'border-cork-300/70 bg-cork-100/45',
      display: 'pills'
    },
    {
      id: 'channels',
      title: 'Channels',
      prompt: 'How do we reach and deliver?',
      placeholder: 'Website, sales, partners, app stores...',
      area: 'channels',
      tone: 'border-cork-300/65 bg-cork-50/65',
      display: 'pills'
    },
    {
      id: 'customerSegments',
      title: 'Customer Segments',
      prompt: 'Who do we serve?',
      placeholder: 'Users, buyers, early adopters, markets...',
      area: 'segments',
      tone: 'border-cork-300/70 bg-cork-50/65',
      display: 'pills'
    },
    {
      id: 'costStructure',
      title: 'Cost Structure',
      prompt: 'What are the major costs?',
      placeholder: 'People, operations, acquisition, infrastructure...',
      area: 'cost',
      tone: 'border-cork-300/70 bg-cork-100/45',
      display: 'pills'
    },
    {
      id: 'revenueStreams',
      title: 'Revenue Streams',
      prompt: 'How does revenue come in?',
      placeholder: 'Subscription, usage, licensing, transaction fees...',
      area: 'revenue',
      tone: 'border-amber-300/60 bg-amber-50/45',
      display: 'pills'
    }
  ];

  let canvas = $derived.by(() => {
    try {
      const saved = JSON.parse(instance.values.businessModelCanvas ?? '{}');
      return { ...blankCanvas, ...saved } as BusinessModelCanvasDraft;
    } catch {
      return blankCanvas;
    }
  });

  function pillItems(value: string, placeholder: string) {
    const source = value.trim() || placeholder;
    return source
      .split(/\n|,/)
      .map((item) => item.replace(/^\s*(?:\d+\.|[-*])\s*/, '').trim())
      .filter(Boolean);
  }
</script>

<div class="overflow-hidden rounded-xl border border-cork-300/40 bg-cork-50">
  <div
    class="business-model-canvas-grid grid gap-2 bg-[#fbf4e9] p-3 md:p-4 lg:grid-cols-[1.05fr_1fr_1.25fr_1fr_1.05fr]"
  >
    {#each sections as section (section.id)}
      <section
        class="min-h-44 rounded-lg border p-3 shadow-sm {section.tone} {section.id ===
          'valuePropositions'
          ? 'lg:min-h-80'
          : ''}"
        data-area={section.area}
      >
        <div class="mb-2">
          <h4 class="font-display text-base leading-none text-cork-800">{section.title}</h4>
          <p class="mt-1 text-[10px] leading-snug text-cork-500">{section.prompt}</p>
        </div>
        <div
          class="min-h-28 rounded-md border border-cork-300/35 bg-cork-50/55 p-2 lg:min-h-[calc(100%-3.5rem)]"
        >
          {#if section.display === 'pills'}
            <div class="flex flex-wrap gap-1.5">
              {#each pillItems(canvas[section.id], section.placeholder) as item, index (index)}
                <span
                  class="rounded-full border px-2.5 py-1 text-xs leading-snug {canvas[
                    section.id
                  ].trim()
                    ? 'border-cork-300/70 bg-cork-50 text-cork-700'
                    : 'border-cork-300/45 bg-cork-100/50 text-cork-400'}"
                >
                  {item}
                </span>
              {/each}
            </div>
          {:else}
            <p
              class="whitespace-pre-wrap text-sm leading-relaxed {canvas[section.id].trim()
                ? 'text-cork-700'
                : 'text-cork-400'}"
            >
              {canvas[section.id].trim() || section.placeholder}
            </p>
          {/if}
        </div>
      </section>
    {/each}
  </div>
</div>

<style>
  @media (min-width: 1024px) {
    .business-model-canvas-grid {
      grid-template-areas:
        'partners activities value relationships segments'
        'partners resources value channels segments'
        'cost cost cost revenue revenue';
    }

    [data-area='partners'] {
      grid-area: partners;
    }

    [data-area='activities'] {
      grid-area: activities;
    }

    [data-area='resources'] {
      grid-area: resources;
    }

    [data-area='value'] {
      grid-area: value;
    }

    [data-area='relationships'] {
      grid-area: relationships;
    }

    [data-area='channels'] {
      grid-area: channels;
    }

    [data-area='segments'] {
      grid-area: segments;
    }

    [data-area='cost'] {
      grid-area: cost;
    }

    [data-area='revenue'] {
      grid-area: revenue;
    }
  }
</style>
