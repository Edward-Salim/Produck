<script lang="ts">
  let { text, spacedQuotes = false }: { text: string; spacedQuotes?: boolean } = $props();

  let displayText = $derived(spacedQuotes ? text.replace(/“([^”]+)”/gu, ' “$1” ') : text);
</script>

{#each displayText.split(/([“”])/u) as part, index (`${part}-${index}`)}
  {#if part === '“' || part === '”'}
    <span class="text-[1.12em] leading-none" style="font-family: Georgia, 'Times New Roman', serif;"
      >{part}</span
    >
  {:else}{part}{/if}
{/each}
