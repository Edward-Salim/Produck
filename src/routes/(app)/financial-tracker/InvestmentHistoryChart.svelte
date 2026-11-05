<script lang="ts">
  import { Area, Axis, Chart, Grid, Highlight, Spline, Svg, Tooltip } from 'layerchart';
  import { scaleTime } from 'd3-scale';
  import { curveMonotoneX } from 'd3-shape';
  import type { InvestmentHistoryChartDatum } from './financial-tracker-types.js';
  let { rows }: { rows: InvestmentHistoryChartDatum[] } = $props();
  let investmentHistoryYDomain = $derived.by(() => {
    if (rows.length === 0) return undefined;

    const values = rows.map((row) => row.portfolioValue);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = Math.max(maxValue - minValue, 1);
    const domainPadding = Math.max(valueRange * 1.35, maxValue * 0.035, 1);

    return [Math.max(0, minValue - domainPadding), maxValue + domainPadding] as [number, number];
  });
  function displayedShortMonthLabel(value: Date | number | string) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC'
    }).format(new Date(value));
  }
</script>

<div class="investment-history">
  <div class="investment-history-title">
    <span>Monthly Growth</span>
    <span>Month-close values</span>
  </div>
  {#if rows.length > 0}
    <div class="investment-history-chart" aria-label="Monthly portfolio growth chart">
      <Chart
        data={rows}
        x="date"
        y="portfolioValue"
        xScale={scaleTime()}
        yDomain={investmentHistoryYDomain}
        padding={{ top: 14, right: 18, bottom: 28, left: 18 }}
        tooltip={{ mode: 'bisect-x' }}
      >
        <Svg>
          <Grid y classes={{ line: 'investment-history-grid-line' }} />
          <Area curve={curveMonotoneX} class="investment-history-area" />
          <Spline curve={curveMonotoneX} class="investment-history-line" />
          <Axis
            placement="bottom"
            ticks={rows.map((row) => row.date)}
            format={displayedShortMonthLabel}
            tickLength={0}
            classes={{
              rule: 'investment-history-axis-rule',
              tick: 'investment-history-axis-tick',
              tickLabel: 'investment-history-axis-label'
            }}
          />
          <Highlight
            lines={{ class: 'investment-history-highlight-line' }}
            points={{ class: 'investment-history-highlight-point', r: 3.2 }}
          />
        </Svg>

        <Tooltip.Root
          anchor="top"
          variant="none"
          classes={{ container: 'investment-history-tooltip-container' }}
          let:data
        >
          <div class="investment-history-tooltip">
            <span>{data.label}</span>
            <strong>{data.valueLabel}</strong>
            <em
              class:positive-growth={data.monthlyGrowth >= 0}
              class:negative-growth={data.monthlyGrowth < 0}
            >
              {data.growthLabel}
            </em>
          </div>
        </Tooltip.Root>
      </Chart>
    </div>
  {:else}
    <p class="investment-history-empty">No snapshots yet. Refresh prices to start history.</p>
  {/if}
</div>

<style>
  .investment-history {
    display: grid;
    gap: 0.45rem;
    border-top: 1px solid rgba(31, 82, 122, 0.12);
    padding-top: 0.6rem;
  }

  .investment-history-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    color: var(--color-cork-900);
    font-size: 0.7rem;
    font-weight: 800;
  }

  .investment-history-title span:last-child {
    color: var(--color-cork-400);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .investment-history-chart {
    position: relative;
    height: 11.4rem;
    border: 1px solid rgba(31, 82, 122, 0.1);
    border-radius: 7px;
    background: linear-gradient(180deg, rgba(255, 253, 249, 0.86), rgba(255, 253, 249, 0.48));
    padding: 0.25rem 0.34rem 0.12rem;
  }

  :global(.investment-history-area) {
    fill: #1f527a;
    fill-opacity: 0.08;
    stroke: none;
  }

  :global(.investment-history-line) {
    fill: none;
    stroke: #1f527a;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
  }

  :global(.investment-history-grid-line) {
    stroke: rgba(31, 82, 122, 0.08);
    stroke-dasharray: 2 3;
    stroke-width: 1;
  }

  :global(.investment-history-axis-rule),
  :global(.investment-history-axis-tick) {
    stroke: transparent;
  }

  :global(.investment-history-axis-label) {
    fill: var(--color-cork-400);
    font-size: 0.6rem;
    font-weight: 800;
  }

  :global(.investment-history-highlight-line) {
    stroke: rgba(31, 82, 122, 0.22);
    stroke-dasharray: 3 3;
    stroke-width: 1.1;
  }

  :global(.investment-history-highlight-point) {
    fill: #1f527a;
    stroke: white;
    stroke-width: 4;
    paint-order: stroke;
  }

  :global(.investment-history-tooltip-container) {
    border: 1px solid rgba(31, 82, 122, 0.14);
    border-radius: 7px;
    background: rgba(255, 253, 249, 0.96);
    box-shadow: 0 12px 30px rgba(31, 82, 122, 0.16);
    padding: 0.45rem 0.55rem;
  }

  .investment-history-tooltip {
    display: grid;
    gap: 0.16rem;
    min-width: 9.4rem;
    color: var(--color-cork-500);
    font-size: 0.6rem;
    line-height: 1.2;
  }

  .investment-history-tooltip span {
    color: var(--color-cork-400);
    font-weight: 700;
  }

  .investment-history-tooltip strong {
    color: var(--color-cork-900);
    font-size: 0.8rem;
    font-weight: 800;
  }

  .investment-history-tooltip em {
    font-style: normal;
    font-weight: 800;
  }

  .investment-history-tooltip .positive-growth {
    color: #15803d;
  }

  .investment-history-tooltip .negative-growth {
    color: #b91c1c;
  }

  .investment-history-empty {
    border: 1px dashed rgba(31, 82, 122, 0.18);
    border-radius: 6px;
    padding: 0.6rem;
    color: var(--color-cork-400);
    font-size: 0.6rem;
    text-align: center;
  }
</style>
