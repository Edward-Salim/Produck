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
    display: 'list' | 'note';
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
      display: 'list'
    },
    {
      id: 'keyActivities',
      title: 'Key Activities',
      prompt: 'What must we do well?',
      placeholder: 'Build, sell, support, match, analyze...',
      area: 'activities',
      display: 'list'
    },
    {
      id: 'keyResources',
      title: 'Key Resources',
      prompt: 'What assets make this work?',
      placeholder: 'Team, technology, data, capital, brand...',
      area: 'resources',
      display: 'list'
    },
    {
      id: 'valuePropositions',
      title: 'Value Propositions',
      prompt: 'Why should customers choose us?',
      placeholder: 'The core outcome customers choose us for.',
      area: 'value',
      display: 'note'
    },
    {
      id: 'customerRelationships',
      title: 'Customer Relationships',
      prompt: 'How will we acquire and retain customers?',
      placeholder: 'Self-serve, personal support, community...',
      area: 'relationships',
      display: 'list'
    },
    {
      id: 'channels',
      title: 'Channels',
      prompt: 'How will customers be reached?',
      placeholder: 'Website, sales, partners, app stores...',
      area: 'channels',
      display: 'list'
    },
    {
      id: 'customerSegments',
      title: 'Customer Segments',
      prompt: 'Who are our customers?',
      placeholder: 'Users, buyers, early adopters, markets...',
      area: 'segments',
      display: 'list'
    },
    {
      id: 'costStructure',
      title: 'Cost Structure',
      prompt: 'What will it cost?',
      placeholder: 'People, operations, acquisition, infrastructure...',
      area: 'cost',
      display: 'list'
    },
    {
      id: 'revenueStreams',
      title: 'Revenue Streams',
      prompt: 'How will it make money?',
      placeholder: 'Subscription, usage, licensing, transaction fees...',
      area: 'revenue',
      display: 'list'
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

  function bulletItems(value: string, placeholder: string) {
    const source = value.trim() || placeholder;
    return source
      .split(/\n/)
      .map((item) => item.replace(/^\s*(?:\d+\.|[-*])\s*/, '').trim())
      .filter(Boolean);
  }
</script>

<div class="business-model-canvas-grid grid gap-2 lg:grid-cols-[1.05fr_1fr_1.25fr_1fr_1.05fr]">
  {#each sections as section (section.id)}
    <section
      class="min-h-44 rounded-lg border border-cork-300/70 bg-cork-50/65 p-3 shadow-sm {section.id ===
      'valuePropositions'
        ? 'lg:min-h-80'
        : ''}"
      data-area={section.area}
    >
      <div class="mb-3">
        <h4 class="font-display text-base leading-tight text-cork-800">{section.title}</h4>
        <p class="mt-1 text-xs leading-relaxed text-cork-500">{section.prompt}</p>
      </div>
      {#if section.display === 'list'}
        <ul
          class="space-y-2 pl-5 text-xs leading-relaxed marker:text-cork-400 {canvas[
            section.id
          ].trim()
            ? 'list-disc text-cork-700'
            : 'list-disc text-cork-400'}"
        >
          {#each bulletItems(canvas[section.id], section.placeholder) as item, index (index)}
            <li>{item}</li>
          {/each}
        </ul>
      {:else}
        <p
          class="text-xs leading-relaxed whitespace-pre-wrap {canvas[section.id].trim()
            ? 'text-cork-700'
            : 'text-cork-400'}"
        >
          {canvas[section.id].trim() || section.placeholder}
        </p>
      {/if}
    </section>
  {/each}
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
