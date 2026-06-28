<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type LeanCanvasKey =
    | 'problem'
    | 'solution'
    | 'keyMetrics'
    | 'uniqueValueProposition'
    | 'unfairAdvantage'
    | 'channels'
    | 'customerSegments'
    | 'costStructure'
    | 'revenueStreams';

  type LeanCanvasDraft = Record<LeanCanvasKey, string>;

  type CanvasSection = {
    id: LeanCanvasKey;
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

  const blankCanvas: LeanCanvasDraft = {
    problem: '',
    solution: '',
    keyMetrics: '',
    uniqueValueProposition: '',
    unfairAdvantage: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: ''
  };

  const sections: CanvasSection[] = [
    {
      id: 'problem',
      title: 'Problem',
      prompt: 'Top 1-3 customer problems.',
      placeholder: '1. ...\n2. ...\n3. ...',
      area: 'problem',
      tone: 'border-cork-300/70 bg-cork-100/45',
      display: 'pills'
    },
    {
      id: 'solution',
      title: 'Solution',
      prompt: 'Smallest solution that addresses the problem.',
      placeholder: 'What will we build or offer first?',
      area: 'solution',
      tone: 'border-cork-300/70 bg-cork-50/65',
      display: 'note'
    },
    {
      id: 'keyMetrics',
      title: 'Key Metrics',
      prompt: 'Numbers that show progress.',
      placeholder: 'Activation, retention, conversion, revenue...',
      area: 'metrics',
      tone: 'border-cork-300/70 bg-cork-100/55',
      display: 'pills'
    },
    {
      id: 'uniqueValueProposition',
      title: 'Unique Value Proposition',
      prompt: 'Clear, compelling reason to choose this.',
      placeholder: 'For [customer], we help [outcome] without [pain].',
      area: 'uvp',
      tone: 'border-amber-300/60 bg-amber-50/45',
      display: 'note'
    },
    {
      id: 'unfairAdvantage',
      title: 'Unfair Advantage',
      prompt: 'What is hard to copy?',
      placeholder: 'Data, distribution, brand, insight, network...',
      area: 'unfair',
      tone: 'border-cork-300/70 bg-cork-100/45',
      display: 'pills'
    },
    {
      id: 'channels',
      title: 'Channels',
      prompt: 'How customers discover or receive it.',
      placeholder: 'Sales, SEO, partners, community, app store...',
      area: 'channels',
      tone: 'border-cork-300/65 bg-cork-50/65',
      display: 'pills'
    },
    {
      id: 'customerSegments',
      title: 'Customer Segments',
      prompt: 'Who has this problem first?',
      placeholder: 'Early adopters, user roles, buyer segment...',
      area: 'segments',
      tone: 'border-cork-300/70 bg-cork-50/65',
      display: 'pills'
    },
    {
      id: 'costStructure',
      title: 'Cost Structure',
      prompt: 'Main costs to create and deliver value.',
      placeholder: 'People, infrastructure, acquisition, operations...',
      area: 'cost',
      tone: 'border-cork-300/70 bg-cork-100/55',
      display: 'pills'
    },
    {
      id: 'revenueStreams',
      title: 'Revenue Streams',
      prompt: 'How money or value comes back.',
      placeholder: 'Subscription, transaction fee, services, ads...',
      area: 'revenue',
      tone: 'border-amber-300/60 bg-amber-50/45',
      display: 'pills'
    }
  ];

  let canvas = $derived.by(() => {
    try {
      const saved = JSON.parse(instance.values.leanCanvas ?? '{}');
      return { ...blankCanvas, ...saved } as LeanCanvasDraft;
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
    class="lean-canvas-grid grid gap-2 bg-[#fbf4e9] p-3 md:p-4 lg:grid-cols-[1.15fr_1fr_1.25fr_1fr_1.15fr]"
  >
    {#each sections as section (section.id)}
      <section
        class="min-h-44 rounded-lg border p-3 shadow-sm {section.tone} {section.id ===
          'uniqueValueProposition'
          ? 'lg:min-h-80'
          : ''}"
        data-area={section.area}
      >
        <div class="mb-2 flex items-start justify-between gap-3">
          <div>
            <h4 class="font-display text-base leading-none text-cork-800">{section.title}</h4>
            <p class="mt-1 text-[10px] leading-snug text-cork-500">{section.prompt}</p>
          </div>
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
    .lean-canvas-grid {
      grid-template-areas:
        'problem solution uvp unfair segments'
        'problem metrics uvp channels segments'
        'cost cost cost revenue revenue';
    }

    [data-area='problem'] {
      grid-area: problem;
    }

    [data-area='solution'] {
      grid-area: solution;
    }

    [data-area='metrics'] {
      grid-area: metrics;
    }

    [data-area='uvp'] {
      grid-area: uvp;
    }

    [data-area='unfair'] {
      grid-area: unfair;
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
