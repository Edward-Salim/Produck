<script lang="ts">
  import { calculateMealGuide } from '$lib/financial-tracker-plan.js';

  let {
    monthKey,
    planned,
    actual = 0,
    gallonPrice = 25_000
  }: {
    monthKey: string;
    planned: number;
    actual?: number;
    gallonPrice?: number;
  } = $props();

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  const money = (value: number) => rupiah.format(value).replace(/\s+/g, '');
  const guide = $derived(calculateMealGuide({ monthKey, planned, actual, gallonPrice, today }));
</script>

{#if guide}
  <div class="space-y-2 text-xs leading-relaxed font-normal text-cork-600">
    {#if guide.budget > 0}
      {#if guide.dailyTarget > 0}
        <p>
          Aim for {money(guide.dailyTarget)} a day: about {money(guide.breakfast)} for breakfast,
          {money(guide.lunch)} for lunch, and {money(guide.dinner)} for dinner.
        </p>
        <p>
          Reserve {money(guide.waterReserve)} for water at one {money(gallonPrice)} gallon a week. The
          remaining {money(guide.buffer)} is for snacks, coffee, or a buffer.
        </p>
      {:else}
        <p>Meals covers daily food, snacks, coffee, drinks, and water.</p>
        <p>
          One {money(gallonPrice)} water gallon a week needs {money(guide.waterReserve)}. The
          remaining budget is too tight to set daily meal targets.
        </p>
      {/if}
    {:else}
      <p>No Meals budget remaining.</p>
    {/if}
  </div>
{/if}
