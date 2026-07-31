<script lang="ts">
  import type { FrameworkInstance } from './types.js';

  type MarketSizingKey =
    | 'tamEstimate'
    | 'tamCalculation'
    | 'samEstimate'
    | 'samCalculation'
    | 'somEstimate'
    | 'somCalculation'
    | 'assumptions'
    | 'sources';

  type Currency = 'USD' | 'IDR';

  type MarketSizingDraft = Record<MarketSizingKey, string>;

  type MarketTier = {
    id: 'tam' | 'sam' | 'som';
    title: string;
    name: string;
    calculationKey: MarketSizingKey;
  };

  let {
    instance,
    currency = 'USD'
  }: {
    instance: FrameworkInstance;
    currency?: Currency;
    draftMode?: 'edit' | 'view';
    onUpdate?: (values: Record<string, string>, title?: string) => void;
  } = $props();

  const blankMarketSizing: MarketSizingDraft = {
    tamEstimate: '',
    tamCalculation: '',
    samEstimate: '',
    samCalculation: '',
    somEstimate: '',
    somCalculation: '',
    assumptions: '',
    sources: ''
  };

  const tiers: MarketTier[] = [
    {
      id: 'tam',
      title: 'TAM',
      name: 'Total Addressable Market',
      calculationKey: 'tamCalculation'
    },
    {
      id: 'sam',
      title: 'SAM',
      name: 'Serviceable Available Market',
      calculationKey: 'samCalculation'
    },
    {
      id: 'som',
      title: 'SOM',
      name: 'Serviceable Obtainable Market',
      calculationKey: 'somCalculation'
    }
  ];

  const USD_TO_IDR = 18_000;

  let marketSizing = $derived.by(() => {
    try {
      const saved = JSON.parse(instance.values.marketSizing ?? '{}');
      return { ...blankMarketSizing, ...saved } as MarketSizingDraft;
    } catch {
      return blankMarketSizing;
    }
  });

  function text(value: string, fallback: string) {
    return value.trim() || fallback;
  }

  function compactAmount(amount: number, unit: number, suffix: string) {
    const value = amount / unit;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
  }

  function compactCurrency(amount: number, selectedCurrency: Currency) {
    const units: [number, string][] =
      selectedCurrency === 'IDR'
        ? [
            [1_000_000_000_000_000, 'kuad'],
            [1_000_000_000_000, 'T'],
            [1_000_000_000, 'M'],
            [1_000_000, 'jt'],
            [1_000, 'rb']
          ]
        : [
            [1_000_000_000_000, 'T'],
            [1_000_000_000, 'B'],
            [1_000_000, 'M'],
            [1_000, 'K']
          ];
    const unit = units.find(([threshold]) => amount >= threshold);
    const compact = unit
      ? compactAmount(amount, Number(unit[0]), String(unit[1]))
      : amount.toFixed(0);
    const localized = selectedCurrency === 'IDR' ? compact.replace('.', ',') : compact;
    return `${selectedCurrency === 'IDR' ? 'Rp' : '$'}${localized}`;
  }

  function parseUsdEstimate(value: string) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;

    const match = value.trim().match(/^\$?([\d.]+)\s*([KMB])/i);
    if (!match) return Number.NaN;
    const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[
      match[2].toUpperCase() as 'K' | 'M' | 'B'
    ];
    return Number(match[1]) * multiplier;
  }

  function formatEstimate(value: string) {
    const usd = parseUsdEstimate(value);
    if (!Number.isFinite(usd) || usd <= 0) return 'Not yet estimated';

    if (currency === 'IDR') {
      return `${compactCurrency(usd * USD_TO_IDR, 'IDR')}/thn`;
    }

    return `${compactCurrency(usd, 'USD')}/yr`;
  }

  function formatCalculation(value: string) {
    if (currency === 'USD') return value;
    return value.replace(/\$([\d.]+)([KMBT]?)/g, (_, amount: string, suffix: string) => {
      const multiplier = { '': 1, K: 1_000, M: 1_000_000, B: 1_000_000_000, T: 1_000_000_000_000 }[
        suffix.toUpperCase() as '' | 'K' | 'M' | 'B' | 'T'
      ];
      return compactCurrency(Number(amount) * multiplier * USD_TO_IDR, 'IDR');
    });
  }

  function bulletItems(value: string, fallback: string) {
    return text(value, fallback)
      .split(/\n/)
      .map((item) => item.replace(/^\s*(?:\d+\.|[-*])\s*/, '').trim())
      .filter(Boolean);
  }
</script>

<div class="space-y-4">
  <div class="grid items-center gap-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
    <figure class="market-circles" aria-label="TAM contains SAM, which contains SOM">
      <div class="market-circle market-circle-tam">
        <div class="market-circle-content">
          <span>TAM</span>
          <strong>{formatEstimate(marketSizing.tamEstimate)}</strong>
        </div>
      </div>
      <div class="market-circle market-circle-sam">
        <div class="market-circle-content">
          <span>SAM</span>
          <strong>{formatEstimate(marketSizing.samEstimate)}</strong>
        </div>
      </div>
      <div class="market-circle market-circle-som">
        <div class="market-circle-content">
          <span>SOM</span>
          <strong>{formatEstimate(marketSizing.somEstimate)}</strong>
        </div>
      </div>
    </figure>

    <div class="space-y-5">
      {#each tiers as tier (tier.id)}
        <section class="market-detail relative" data-tier={tier.id}>
          <div class="flex flex-wrap items-baseline gap-x-2">
            <h4 class="font-display text-base leading-tight text-cork-800">{tier.title}</h4>
            <p class="text-xs font-semibold text-cork-600">{tier.name}</p>
          </div>
          <p
            class="mt-2 text-xs leading-relaxed {marketSizing[tier.calculationKey].trim()
              ? 'text-cork-600'
              : 'text-cork-400'}"
          >
            <span class="font-semibold">Calculation:</span>
            {formatCalculation(
              text(marketSizing[tier.calculationKey], 'State the formula and inputs')
            )}
          </p>
        </section>
      {/each}
    </div>
  </div>

  <div class="grid gap-2 md:grid-cols-2">
    <section class="rounded-lg border border-cork-300/70 bg-cork-50/65 p-3 shadow-sm">
      <div class="mb-3">
        <h4 class="font-display text-base leading-tight text-cork-800">Key Assumptions</h4>
        <p class="mt-1 text-xs leading-relaxed text-cork-500">What must be true?</p>
      </div>
      <ul
        class="list-disc space-y-2 pl-5 text-xs leading-relaxed marker:text-cork-400 {marketSizing.assumptions.trim()
          ? 'text-cork-700'
          : 'text-cork-400'}"
      >
        {#each bulletItems(marketSizing.assumptions, 'List the assumptions behind the estimates') as item, index (index)}
          <li>{item}</li>
        {/each}
      </ul>
    </section>

    <section class="rounded-lg border border-cork-300/70 bg-cork-50/65 p-3 shadow-sm">
      <div class="mb-3">
        <h4 class="font-display text-base leading-tight text-cork-800">Evidence Sources</h4>
        <p class="mt-1 text-xs leading-relaxed text-cork-500">What supports the estimates?</p>
      </div>
      <ul
        class="list-disc space-y-2 pl-5 text-xs leading-relaxed marker:text-cork-400 {marketSizing.sources.trim()
          ? 'text-cork-700'
          : 'text-cork-400'}"
      >
        {#each bulletItems(marketSizing.sources, 'Add dated and traceable sources') as item, index (index)}
          <li>{item}</li>
        {/each}
      </ul>
    </section>
  </div>
</div>

<style>
  .market-circles {
    position: relative;
    width: min(100%, 22rem);
    aspect-ratio: 1;
    margin-inline: auto;
  }

  .market-circle {
    position: absolute;
    bottom: 0;
    left: 50%;
    display: flex;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 700;
    color: #4c6551;
  }

  .market-circle-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding-top: 12%;
    text-align: center;
  }

  .market-circle-content strong {
    max-width: 9rem;
    font-size: 0.8rem;
    line-height: 1.15;
  }

  .market-circle-tam {
    width: 100%;
    height: 100%;
    border-color: #8eaa92;
    background: #e1ebe0;
  }

  .market-circle-sam {
    width: 68%;
    height: 68%;
    border-color: #71967a;
    background: #c3d8c4;
  }

  .market-circle-som {
    width: 36%;
    height: 36%;
    border-color: #c59324;
    background: #f2c452;
    color: #5f4814;
  }

  .market-circle-som .market-circle-content {
    padding-top: 15%;
  }

  .market-circle-som .market-circle-content strong {
    max-width: 6rem;
    font-size: 0.7rem;
  }

  @media (min-width: 1024px) {
    .market-detail::before {
      position: absolute;
      top: 0.65rem;
      right: calc(100% + 0.75rem);
      width: 1.5rem;
      height: 1px;
      background: #8eaa92;
      content: '';
    }

    .market-detail::after {
      position: absolute;
      top: 0.5rem;
      right: calc(100% + 0.6rem);
      width: 0.35rem;
      height: 0.35rem;
      border-radius: 9999px;
      background: #8eaa92;
      content: '';
    }

    .market-detail[data-tier='som']::before,
    .market-detail[data-tier='som']::after {
      background: #c59324;
    }
  }
</style>
