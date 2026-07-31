<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type LeanCanvasKey =
    | 'problem'
    | 'existingAlternatives'
    | 'solution'
    | 'keyMetrics'
    | 'uniqueValueProposition'
    | 'highLevelConcept'
    | 'unfairAdvantage'
    | 'channels'
    | 'customerSegments'
    | 'earlyAdopters'
    | 'costStructure'
    | 'revenueStreams';

  type LeanCanvasDraft = Record<LeanCanvasKey, string>;

  type CanvasSection = {
    id: LeanCanvasKey;
    title: string;
    prompt: string;
    placeholder: string;
    area: string;
    display: 'list' | 'note';
    secondary?: {
      id: LeanCanvasKey;
      title: string;
      prompt: string;
      placeholder: string;
      display: 'list' | 'note';
    };
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
    existingAlternatives: '',
    solution: '',
    keyMetrics: '',
    uniqueValueProposition: '',
    highLevelConcept: '',
    unfairAdvantage: '',
    channels: '',
    customerSegments: '',
    earlyAdopters: '',
    costStructure: '',
    revenueStreams: ''
  };

  const sections: CanvasSection[] = [
    {
      id: 'problem',
      title: 'Problem',
      prompt: 'What are the top three problems?',
      placeholder: '1. ...\n2. ...\n3. ...',
      area: 'problem',
      display: 'list',
      secondary: {
        id: 'existingAlternatives',
        title: 'Existing Alternatives',
        prompt: 'How are they solved today?',
        placeholder: 'Current tools, workarounds, or substitutes...',
        display: 'list'
      }
    },
    {
      id: 'solution',
      title: 'Solution',
      prompt: 'What is the smallest testable solution?',
      placeholder: 'The minimum solution early adopters can try...',
      area: 'solution',
      display: 'note'
    },
    {
      id: 'keyMetrics',
      title: 'Key Metrics',
      prompt: 'How will success be measured?',
      placeholder: 'Activation, retention, conversion...',
      area: 'metrics',
      display: 'list'
    },
    {
      id: 'uniqueValueProposition',
      title: 'Unique Value Proposition',
      prompt: 'Why should customers choose this?',
      placeholder: 'Why should the customer choose this?',
      area: 'uvp',
      display: 'note',
      secondary: {
        id: 'highLevelConcept',
        title: 'High-Level Concept',
        prompt: 'What familiar idea explains it?',
        placeholder: 'X for Y...',
        display: 'note'
      }
    },
    {
      id: 'unfairAdvantage',
      title: 'Unfair Advantage',
      prompt: 'What cannot be copied or bought?',
      placeholder: 'Data, distribution, brand, insight, network...',
      area: 'unfair',
      display: 'list'
    },
    {
      id: 'channels',
      title: 'Channels',
      prompt: 'How will customers be reached?',
      placeholder: 'Sales, SEO, partners, community, app store...',
      area: 'channels',
      display: 'list'
    },
    {
      id: 'customerSegments',
      title: 'Customer Segments',
      prompt: 'Who has these problems?',
      placeholder: 'Early adopters, user roles, buyer segment...',
      area: 'segments',
      display: 'list',
      secondary: {
        id: 'earlyAdopters',
        title: 'Early Adopters',
        prompt: 'Who will try it first?',
        placeholder: 'The first users most likely to try it...',
        display: 'list'
      }
    },
    {
      id: 'costStructure',
      title: 'Cost Structure',
      prompt: 'What will it cost?',
      placeholder: 'People, infrastructure, acquisition, operations...',
      area: 'cost',
      display: 'list'
    },
    {
      id: 'revenueStreams',
      title: 'Revenue Streams',
      prompt: 'How will it make money?',
      placeholder: 'Subscription, transaction fee, services, ads...',
      area: 'revenue',
      display: 'list'
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

  function bulletItems(value: string, placeholder: string) {
    const source = value.trim() || placeholder;
    return source
      .split(/\n/)
      .map((item) => item.replace(/^\s*(?:\d+\.|[-*])\s*/, '').trim())
      .filter(Boolean);
  }
</script>

<div class="lean-canvas-grid grid gap-2 lg:grid-cols-[1.15fr_1fr_1.25fr_1fr_1.15fr]">
  {#each sections as section (section.id)}
    <section
      class="flex min-h-44 flex-col rounded-lg border border-cork-300/70 bg-cork-50/65 p-3 shadow-sm {section.id ===
      'uniqueValueProposition'
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
      {#if section.secondary}
        <div class="mt-auto pt-5">
          <div class="mb-2">
            <h5 class="font-display text-sm leading-tight text-cork-800">
              {section.secondary.title}
            </h5>
            <p class="mt-1 text-xs leading-relaxed text-cork-500">{section.secondary.prompt}</p>
          </div>
          {#if section.secondary.display === 'list'}
            <ul
              class="space-y-2 pl-5 text-xs leading-relaxed marker:text-cork-400 {canvas[
                section.secondary.id
              ].trim()
                ? 'list-disc text-cork-700'
                : 'list-disc text-cork-400'}"
            >
              {#each bulletItems(canvas[section.secondary.id], section.secondary.placeholder) as item, index (index)}
                <li>{item}</li>
              {/each}
            </ul>
          {:else}
            <p
              class="text-xs leading-relaxed whitespace-pre-wrap {canvas[
                section.secondary.id
              ].trim()
                ? 'text-cork-700'
                : 'text-cork-400'}"
            >
              {canvas[section.secondary.id].trim() || section.secondary.placeholder}
            </p>
          {/if}
        </div>
      {/if}
    </section>
  {/each}
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
