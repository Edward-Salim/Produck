<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Component } from 'svelte';

  let {
    icon,
    title,
    description = '',
    children
  }: {
    icon?: Component<{ class?: string }>;
    title: string;
    description?: string;
    children?: Snippet;
  } = $props();
</script>

<div
  class="flex min-h-48 flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-cork-300/50 text-center"
>
  {#if icon}
    {@const Icon = icon}
    <div class="mb-3 text-cork-300">
      <Icon class="size-10" />
    </div>
  {/if}
  <p class="mb-1 text-sm font-medium text-cork-600">{title}</p>
  {#if description}
    <p class="mb-4 text-xs text-cork-400">{description}</p>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
