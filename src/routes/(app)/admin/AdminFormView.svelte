<script lang="ts">
  import { Plus, Trash2 } from '@lucide/svelte';
  import type { FormFieldDef } from './admin-config.js';

  let {
    formKey,
    formFields,
    formItems,
    keyLabels,
    onSyncForm,
    onAddRecord,
    onRemoveRecord
  }: {
    formKey: string | null;
    formFields: FormFieldDef[];
    formItems: any[];
    keyLabels: Record<string, string>;
    onSyncForm: () => void;
    onAddRecord: () => void;
    onRemoveRecord: (index: number) => void;
  } = $props();
</script>

<div
  class="form-scroll flex-1 space-y-3 overflow-y-auto rounded-xl border border-cork-300 bg-cork-50/50 p-4"
>
  {#if formKey && formFields.length > 0}
    {#each formItems as item, idx (item.id ?? idx)}
      <div class="rounded-lg border border-cork-200 bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xs font-semibold text-cork-500">
            {#if item.code}{item.code} —
            {/if}{item.title || item.name || item.personName || `#${item.id}`}
          </span>
          <button
            type="button"
            class="cursor-pointer text-cork-300 transition-colors hover:text-red-500"
            onclick={() => onRemoveRecord(idx)}
          >
            <Trash2 class="size-3.5" />
          </button>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          {#each formFields as field (field.key)}
            {@const fieldControlId = `admin-${formKey}-${idx}-${field.key}`}
            <div class={field.type === 'textarea' || field.type === 'array' ? 'md:col-span-2' : ''}>
              <label
                for={fieldControlId}
                class="mb-1 block text-[10px] font-semibold tracking-wider text-cork-400 uppercase"
                >{field.label}</label
              >
              {#if field.type === 'text'}
                <input
                  id={fieldControlId}
                  type="text"
                  value={item[field.key] ?? ''}
                  oninput={(e) => {
                    item[field.key] = (e.target as HTMLInputElement).value;
                    onSyncForm();
                  }}
                  class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                />
              {:else if field.type === 'number'}
                <input
                  id={fieldControlId}
                  type="number"
                  value={item[field.key] ?? 0}
                  oninput={(e) => {
                    item[field.key] = Number((e.target as HTMLInputElement).value);
                    onSyncForm();
                  }}
                  class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                />
              {:else if field.type === 'boolean'}
                <button
                  id={fieldControlId}
                  type="button"
                  class="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800"
                  onclick={() => {
                    item[field.key] = !item[field.key];
                    onSyncForm();
                  }}
                >
                  <span class="size-3 rounded {item[field.key] ? 'bg-green-500' : 'bg-cork-300'}"
                  ></span>
                  {item[field.key] ? 'Yes' : 'No'}
                </button>
              {:else if field.type === 'select'}
                <select
                  id={fieldControlId}
                  value={item[field.key] ?? ''}
                  onchange={(e) => {
                    item[field.key] = (e.target as HTMLSelectElement).value;
                    onSyncForm();
                  }}
                  class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-2 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                >
                  {#each field.options ?? [] as opt (opt)}
                    <option value={opt}>{opt}</option>
                  {/each}
                </select>
              {:else if field.type === 'textarea'}
                <textarea
                  id={fieldControlId}
                  value={item[field.key] ?? ''}
                  oninput={(e) => {
                    item[field.key] = (e.target as HTMLTextAreaElement).value;
                    onSyncForm();
                  }}
                  rows="3"
                  class="w-full resize-none rounded-md border border-cork-200 bg-cork-50/50 px-2 py-1.5 text-sm text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                ></textarea>
              {:else if field.type === 'array'}
                <div class="space-y-1">
                  {#each item[field.key] ?? [] as arrItem, ai (ai)}
                    <div class="flex items-center gap-1">
                      <input
                        id={ai === 0 ? fieldControlId : undefined}
                        type="text"
                        value={arrItem}
                        oninput={(e) => {
                          item[field.key][ai] = (e.target as HTMLInputElement).value;
                          onSyncForm();
                        }}
                        class="h-7 flex-1 rounded-md border border-cork-200 bg-cork-50/50 px-2 text-xs text-cork-800 shadow-none ring-0 focus:border-cork-400 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        class="shrink-0 cursor-pointer text-cork-300 hover:text-red-500"
                        onclick={() => {
                          item[field.key].splice(ai, 1);
                          onSyncForm();
                        }}
                      >
                        <Trash2 class="size-3" />
                      </button>
                    </div>
                  {/each}
                  <button
                    type="button"
                    class="flex cursor-pointer items-center gap-1 text-[10px] text-cork-400 hover:text-cork-600"
                    onclick={() => {
                      if (!item[field.key]) item[field.key] = [];
                      item[field.key].push('');
                      onSyncForm();
                    }}
                  >
                    <Plus class="size-3" />Add
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}

    {#if formKey !== 'project'}
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-cork-300/50 py-3 text-xs font-medium text-cork-400 transition-colors hover:border-cork-400 hover:text-cork-600"
        onclick={onAddRecord}
      >
        <Plus class="size-4" />Add {keyLabels[formKey ?? ''] ?? 'Record'}
      </button>
    {/if}
  {:else}
    <div class="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p class="text-sm text-cork-400">Pick a section to start editing</p>
      <p class="text-xs text-cork-300">or switch to JSON view for bulk edits</p>
    </div>
  {/if}
</div>

<style>
  .form-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  }
</style>
