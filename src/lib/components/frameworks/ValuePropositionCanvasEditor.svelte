<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type VpcDraft = {
    productName: string;
    customerName: string;
    productsServices: string[];
    painRelievers: string[];
    gainCreators: string[];
    customerJobs: string[];
    pains: string[];
    gains: string[];
    fitLines: Array<[string, string]>;
  };

  let {
    instance,
    projectName
  }: {
    instance: FrameworkInstance;
    draftMode?: 'edit' | 'view';
    onUpdate?: (values: Record<string, string>, title?: string) => void;
    projectName?: string;
  } = $props();

  function getDefaultCanvas(name: string | undefined): VpcDraft {
    return {
      productName: name || 'Your Product',
      customerName: 'Target Customer',
      productsServices: ['Core product', 'Key feature', 'Service layer'],
      painRelievers: ['Reduce friction', 'Remove uncertainty', 'Save time'],
      gainCreators: ['Better outcome', 'More confidence', 'Easier workflow'],
      customerJobs: ['Complete the job', 'Make a decision', 'Move faster'],
      pains: ['Too much effort', 'High risk', 'Poor current solution'],
      gains: ['Clear progress', 'Reliable result', 'Less stress'],
      fitLines: [
        ['Save time', 'Too much effort'],
        ['Remove uncertainty', 'High risk'],
        ['Better outcome', 'Reliable result']
      ]
    };
  }

  let canvas = $derived.by(() => {
    const defaultCanvas = getDefaultCanvas(projectName);

    try {
      const saved = JSON.parse(instance.values.valuePropositionCanvas ?? '{}');
      return {
        ...defaultCanvas,
        ...saved,
        productName: saved.productName || defaultCanvas.productName
      };
    } catch {
      return defaultCanvas;
    }
  });

  function normalizeItems(value: string[] | string | undefined, fallback: string[]) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      const items = value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      return items.length > 0 ? items : fallback;
    }
    return fallback;
  }

  let productsServices = $derived(
    normalizeItems(canvas.productsServices, getDefaultCanvas(projectName).productsServices)
  );
  let painRelievers = $derived(
    normalizeItems(canvas.painRelievers, getDefaultCanvas(projectName).painRelievers)
  );
  let gainCreators = $derived(
    normalizeItems(canvas.gainCreators, getDefaultCanvas(projectName).gainCreators)
  );
  let customerJobs = $derived(
    normalizeItems(canvas.customerJobs, getDefaultCanvas(projectName).customerJobs)
  );
  let pains = $derived(normalizeItems(canvas.pains, getDefaultCanvas(projectName).pains));
  let gains = $derived(normalizeItems(canvas.gains, getDefaultCanvas(projectName).gains));
</script>

<div class="overflow-hidden rounded-xl border border-cork-300/40 bg-cork-50">
  <div class="border-b border-cork-300/40 bg-cork-100 px-4 py-3 text-center">
    <h3 class="font-display text-xl text-cork-800 md:text-2xl">Value Proposition Canvas</h3>
    <p class="mt-1 text-xs text-cork-400">PPD Class: customer profile matched to value map.</p>
  </div>

  <div class="relative min-h-[42rem] overflow-hidden bg-[#fbf4e9] p-4 md:min-h-[34rem] md:p-6">
    <svg
      class="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      viewBox="0 0 100 64"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line x1="36" y1="20" x2="62" y2="18" stroke="#b9463d" stroke-width="0.35" />
      <line x1="36" y1="32" x2="62" y2="35" stroke="#b9463d" stroke-width="0.35" />
      <line x1="36" y1="44" x2="62" y2="47" stroke="#b9463d" stroke-width="0.35" />
    </svg>

    <section
      class="relative mb-4 rounded-xl border-2 border-cork-700/70 bg-cork-50/80 p-4 md:absolute md:top-6 md:left-6 md:mb-0 md:h-[27rem] md:w-[42%]"
    >
      <div class="absolute inset-y-0 left-1/2 hidden w-px bg-cork-700/35 md:block"></div>
      <div class="absolute top-1/2 right-0 left-0 hidden h-px bg-cork-700/35 md:block"></div>
      <div class="absolute inset-0 hidden md:block">
        <div class="absolute top-0 left-0 h-full w-full bg-[linear-gradient(35deg,transparent_49.6%,rgba(91,75,58,0.35)_50%,transparent_50.4%)]"></div>
        <div class="absolute top-0 left-0 h-full w-full bg-[linear-gradient(145deg,transparent_49.6%,rgba(91,75,58,0.35)_50%,transparent_50.4%)]"></div>
      </div>

      <div class="relative z-10 flex h-full flex-col justify-between gap-3">
        <div class="rounded-lg bg-yellow-200 px-3 py-2 text-center text-sm font-bold text-cork-800 shadow-sm">
          {canvas.productName}
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="space-y-2">
            {#each gainCreators.slice(0, 3) as item, index (index)}
              <div class="rounded bg-green-200 px-3 py-1.5 text-center text-xs font-bold text-cork-800 shadow-sm">
                {item} <span class="text-green-700">✓</span>
              </div>
            {/each}
          </div>
          <div class="space-y-2">
            {#each painRelievers.slice(0, 3) as item, index (index)}
              <div class="rounded bg-red-200 px-3 py-1.5 text-center text-xs font-bold text-cork-800 shadow-sm">
                {item} <span class="text-green-700">✓</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="mx-auto w-fit rounded-lg border-2 border-cork-700 bg-cork-50 px-5 py-4 shadow-sm">
          <div class="h-10 w-12 border-x-2 border-b-2 border-cork-700"></div>
          <div class="-mt-12 h-10 w-12 border-x-2 border-t-2 border-cork-700"></div>
        </div>

        <div class="grid gap-2 md:grid-cols-3">
          {#each productsServices.slice(0, 3) as item, index (index)}
            <div class="rounded bg-yellow-200 px-2 py-1.5 text-center text-xs font-bold text-cork-800 shadow-sm">
              {item}
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section
      class="relative rounded-full border-2 border-cork-700/70 bg-cork-50/80 p-6 md:absolute md:top-6 md:right-6 md:h-[27rem] md:w-[42%]"
    >
      <div class="mx-auto mb-3 flex size-24 items-center justify-center rounded-full border-2 border-cork-700 bg-white md:absolute md:top-1/2 md:left-1/2 md:mb-0 md:-translate-x-1/2 md:-translate-y-1/2">
        <div class="relative size-12 rounded-full border-2 border-cork-700 bg-cork-50">
          <span class="absolute top-4 left-3 size-2 rounded-full bg-cork-900"></span>
          <span class="absolute top-5 right-0 h-4 w-6 rounded-r-full border-y-2 border-r-2 border-cork-700"></span>
        </div>
      </div>

      <div class="grid gap-3 md:absolute md:inset-8 md:grid-cols-2">
        <div class="space-y-2 md:pr-8">
          {#each gains.slice(0, 4) as item, index (index)}
            <div class="rounded bg-green-200 px-3 py-1.5 text-center text-xs font-bold text-cork-800 shadow-sm">
              {item} <span class="text-green-700">✓</span>
            </div>
          {/each}
        </div>
        <div class="space-y-2 md:pl-8">
          {#each customerJobs.slice(0, 4) as item, index (index)}
            <div class="rounded bg-yellow-200 px-3 py-1.5 text-center text-xs font-bold text-cork-800 shadow-sm">
              {item}
            </div>
          {/each}
        </div>
        <div class="space-y-2 md:col-span-2 md:mx-auto md:mt-auto md:w-3/4">
          {#each pains.slice(0, 4) as item, index (index)}
            <div class="rounded bg-red-200 px-3 py-1.5 text-center text-xs font-bold text-cork-800 shadow-sm">
              {item} <span class="text-red-600">×</span>
            </div>
          {/each}
        </div>
      </div>
    </section>
  </div>
</div>
