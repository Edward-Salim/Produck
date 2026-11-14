<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { pocketWalletLabels, type PocketBank } from '$lib/financial-tracker-pockets.js';
  import type { WalletMonthStates } from './financial-tracker-data.js';

  let {
    monthKey,
    states,
    editable,
    bank
  }: {
    monthKey: string;
    states: WalletMonthStates[string];
    editable: boolean;
    bank: PocketBank;
  } = $props();

  const amount = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  const pockets = $derived(Object.entries(pocketWalletLabels[bank]));
  let saveError = $state('');

  const saveBalance: SubmitFunction = () => {
    saveError = '';
    return async ({ result, update }) => {
      if (result.type === 'success') {
        await update({ reset: false });
      } else {
        saveError = 'Could not save this balance. Please try again.';
        await update({ reset: false, invalidateAll: false });
      }
    };
  };
</script>

<dl
  aria-label={`${bank} actual pocket balances`}
  class="ml-3 min-w-0 border-l border-cork-200/70 pl-3"
>
  {#each pockets as [name, walletLabel] (walletLabel)}
    {@const balance = states[walletLabel]?.balance}
    <div class="flex items-center justify-between gap-3 py-1">
      <dt class="text-xs font-medium text-cork-800">{name}</dt>
      <dd>
        <form method="POST" action="?/walletMonthBalance" use:enhance={saveBalance}>
          <input type="hidden" name="label" value={walletLabel} />
          <input type="hidden" name="monthKey" value={monthKey} />
          <input type="hidden" name="minimumHold" value="0" />
          <label class="flex items-center gap-1 text-xs text-cork-500">
            <span>Rp</span>
            <input
              name="balance"
              type="text"
              inputmode="numeric"
              pattern="[0-9]+([.][0-9]{3})*"
              required
              class="h-6 w-24 rounded border border-cork-200/70 bg-white px-1.5 py-0.5 text-right text-xs font-medium text-cork-900 tabular-nums shadow-[0_1px_3px_rgba(31,82,122,0.12)] transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-cork-400 hover:border-cork-400 focus:border-cork-500 focus:ring-2 focus:ring-cork-200/60 focus:outline-none disabled:cursor-default disabled:border-cork-200/40 disabled:bg-cork-50 disabled:text-cork-400 disabled:shadow-none"
              value={balance === undefined ? '' : amount.format(balance)}
              placeholder="Not entered"
              aria-label={`${bank} ${name} actual balance for ${monthKey}`}
              disabled={!editable}
              title={editable ? 'Actual pocket balance' : 'Locked one week after month end'}
              onfocus={(event) => {
                if (balance !== undefined) event.currentTarget.value = String(balance);
              }}
              onchange={(event) => {
                if (editable && event.currentTarget.reportValidity()) {
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </label>
        </form>
      </dd>
    </div>
  {/each}
</dl>
{#if saveError}
  <p role="alert" class="mt-1 ml-6 text-xs text-red-700">{saveError}</p>
{/if}
